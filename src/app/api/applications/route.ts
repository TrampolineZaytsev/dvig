import { NextRequest } from "next/server";
import { z } from "zod";

import { jsonError, jsonOk, handleApiError } from "@/lib/api";
import { getSessionUser, requireSessionUser } from "@/lib/auth";
import { ApplicationSummary } from "@/lib/groups";
import { sendTelegramNotification } from "@/lib/notifications";
import { prisma } from "@/lib/db";

const createApplicationSchema = z.object({
  groupId: z.string().min(1),
  message: z.string().max(300).optional(),
});

export async function GET() {
  try {
    const session = await requireSessionUser();
    const applications = await prisma.application.findMany({
      where: { userId: session.id },
      include: { group: true },
      orderBy: { createdAt: "desc" },
    });

    const items: ApplicationSummary[] = applications.map((app) => ({
      id: app.id,
      groupId: app.groupId,
      kudagoEventId: app.group.kudagoEventId,
      eventTitle: app.group.eventTitle,
      status: app.status,
      message: app.message,
      createdAt: app.createdAt.toISOString(),
      meetingPoint: app.status === "APPROVED" ? app.group.meetingPoint : null,
      telegramLink: app.status === "APPROVED" ? app.group.telegramLink : null,
    }));

    return jsonOk({ applications: items });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSessionUser();
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { profile: true },
    });

    if (!user?.profile?.onboardingDone) {
      return jsonError("Завершите онбординг профиля", 400);
    }

    const body = createApplicationSchema.parse(await request.json());
    const group = await prisma.group.findUnique({
      where: { id: body.groupId },
      include: {
        applications: { where: { status: "APPROVED" } },
      },
    });

    if (!group || group.status === "CLOSED" || group.status === "CANCELLED") {
      return jsonError("Группа недоступна", 404);
    }

    const approvedCount = group.applications.length;
    if (approvedCount >= group.capacity) {
      return jsonError("В группе нет свободных мест", 409);
    }

    const existing = await prisma.application.findUnique({
      where: { userId_groupId: { userId: session.id, groupId: body.groupId } },
    });
    if (existing && existing.status !== "CANCELLED" && existing.status !== "REJECTED") {
      return jsonError("Заявка уже подана", 409);
    }

    const application = await prisma.application.upsert({
      where: { userId_groupId: { userId: session.id, groupId: body.groupId } },
      create: {
        userId: session.id,
        groupId: body.groupId,
        message: body.message,
        status: "PENDING",
      },
      update: {
        message: body.message,
        status: "PENDING",
      },
      include: { group: true },
    });

    await prisma.analyticsEvent.create({
      data: {
        userId: session.id,
        name: "application_created",
        payload: JSON.stringify({ groupId: group.id, kudagoEventId: group.kudagoEventId }),
      },
    });

    await sendTelegramNotification(
      `📥 Новая заявка: ${user.profile?.displayName ?? session.email}\nСобытие: ${group.eventTitle}`
    );

    return jsonOk(
      {
        application: {
          id: application.id,
          groupId: application.groupId,
          kudagoEventId: application.group.kudagoEventId,
          eventTitle: application.group.eventTitle,
          status: application.status,
          message: application.message,
          createdAt: application.createdAt.toISOString(),
        } satisfies ApplicationSummary,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Некорректные данные");
    }
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return jsonError("Требуется вход", 401);
    }

    const body = z
      .object({
        applicationId: z.string(),
        action: z.enum(["cancel"]),
      })
      .parse(await request.json());

    const application = await prisma.application.findUnique({ where: { id: body.applicationId } });
    if (!application || application.userId !== session.id) {
      return jsonError("Заявка не найдена", 404);
    }

    const updated = await prisma.application.update({
      where: { id: application.id },
      data: { status: "CANCELLED" },
      include: { group: true },
    });

    return jsonOk({
      application: {
        id: updated.id,
        groupId: updated.groupId,
        kudagoEventId: updated.group.kudagoEventId,
        eventTitle: updated.group.eventTitle,
        status: updated.status,
        message: updated.message,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("Некорректные данные");
    }
    return handleApiError(error);
  }
}
