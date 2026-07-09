import { NextRequest } from "next/server";
import { z } from "zod";

import { jsonError, jsonOk, handleApiError } from "@/lib/server/api";
import { getSessionUser, getUserWithProfile, requireSessionUser } from "@/lib/server/auth";
import { buildGroupSummary } from "@/lib/server/groups";
import { prisma } from "@/lib/server/db";

const createGroupSchema = z.object({
  kudagoEventId: z.number().int().positive(),
  eventTitle: z.string().min(3),
  eventDate: z.string().datetime(),
  capacity: z.number().int().min(5).max(15).default(7),
  meetingPoint: z.string().max(200).optional(),
  telegramLink: z
    .string()
    .max(300)
    .optional()
    .refine((value) => !value || value.startsWith("http"), {
      message: "Ссылка должна начинаться с http",
    }),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    const eventIdParam = request.nextUrl.searchParams.get("eventId");
    const kudagoEventId = eventIdParam ? Number(eventIdParam) : undefined;

    const groups = await prisma.group.findMany({
      where: {
        ...(kudagoEventId ? { kudagoEventId } : {}),
        status: { in: ["OPEN", "FULL"] },
      },
      include: {
        moderator: { include: { profile: true } },
        applications: {
          where: { status: "APPROVED" },
          include: { user: { include: { profile: true } } },
        },
      },
      orderBy: { eventDate: "asc" },
    });

    let viewerApprovedGroupIds = new Set<string>();
    if (session) {
      const approvedApps = await prisma.application.findMany({
        where: { userId: session.id, status: "APPROVED" },
        select: { groupId: true },
      });
      viewerApprovedGroupIds = new Set(approvedApps.map((app) => app.groupId));
    }

    return jsonOk({
      groups: groups.map((group) =>
        buildGroupSummary(group, {
          includeMembers: true,
          viewerApproved: viewerApprovedGroupIds.has(group.id),
        })
      ),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSessionUser();
    const user = await getUserWithProfile(session.id);
    if (!user?.profile?.onboardingDone) {
      return jsonError("Завершите онбординг профиля", 400);
    }

    const body = createGroupSchema.parse(await request.json());

    const existingGroup = await prisma.group.findFirst({
      where: {
        kudagoEventId: body.kudagoEventId,
        moderatorId: session.id,
        status: { in: ["OPEN", "FULL"] },
      },
    });
    if (existingGroup) {
      return jsonError("У вас уже есть группа на это событие", 409);
    }

    const group = await prisma.$transaction(async (tx) => {
      const created = await tx.group.create({
        data: {
          kudagoEventId: body.kudagoEventId,
          eventTitle: body.eventTitle,
          eventDate: new Date(body.eventDate),
          capacity: body.capacity,
          meetingPoint: body.meetingPoint?.trim() || null,
          telegramLink: body.telegramLink?.trim() || null,
          moderatorId: session.id,
        },
        include: {
          moderator: { include: { profile: true } },
          applications: { include: { user: { include: { profile: true } } } },
        },
      });

      await tx.application.create({
        data: {
          userId: session.id,
          groupId: created.id,
          status: "APPROVED",
        },
      });

      return tx.group.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          moderator: { include: { profile: true } },
          applications: {
            where: { status: "APPROVED" },
            include: { user: { include: { profile: true } } },
          },
        },
      });
    });

    await prisma.analyticsEvent.create({
      data: {
        userId: session.id,
        name: "group_created",
        payload: JSON.stringify({ groupId: group.id, kudagoEventId: body.kudagoEventId }),
      },
    });

    return jsonOk(
      { group: buildGroupSummary(group, { includeMembers: true, viewerApproved: true }) },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Некорректные данные");
    }
    return handleApiError(error);
  }
}
