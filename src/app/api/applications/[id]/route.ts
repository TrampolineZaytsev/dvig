import { NextRequest } from "next/server";
import { z } from "zod";

import { jsonError, jsonOk, handleApiError } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { notifyApplicationApproved } from "@/lib/applications";
import { prisma } from "@/lib/db";

async function canModerateApplication(userId: string, role: string, groupModeratorId: string) {
  if (role === "MODERATOR" || role === "ADMIN") {
    return true;
  }
  return userId === groupModeratorId;
}

const patchSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return jsonError("Требуется вход", 401);
    }

    const { id } = await context.params;
    const body = patchSchema.parse(await request.json());

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        group: {
          include: { applications: { where: { status: "APPROVED" } } },
        },
      },
    });

    if (!application) {
      return jsonError("Заявка не найдена", 404);
    }

    if (!(await canModerateApplication(session.id, session.role, application.group.moderatorId))) {
      return jsonError("Недостаточно прав", 403);
    }

    if (body.status === "APPROVED") {
      const approvedCount = application.group.applications.length;
      if (approvedCount >= application.group.capacity) {
        return jsonError("Группа заполнена", 409);
      }
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status: body.status },
      include: { group: true, user: { include: { profile: true } } },
    });

    if (body.status === "APPROVED") {
      await notifyApplicationApproved(updated.id);

      const freshGroup = await prisma.group.findUnique({
        where: { id: updated.groupId },
        include: { applications: { where: { status: "APPROVED" } } },
      });
      if (freshGroup && freshGroup.applications.length >= freshGroup.capacity) {
        await prisma.group.update({
          where: { id: freshGroup.id },
          data: { status: "FULL" },
        });
      }
    }

    await prisma.analyticsEvent.create({
      data: {
        userId: updated.userId,
        name: body.status === "APPROVED" ? "application_approved" : "application_rejected",
        payload: JSON.stringify({ applicationId: updated.id, groupId: updated.groupId }),
      },
    });

    return jsonOk({
      application: {
        id: updated.id,
        status: updated.status,
        user: {
          id: updated.userId,
          displayName: updated.user.profile?.displayName ?? updated.user.email,
        },
        groupId: updated.groupId,
        eventTitle: updated.group.eventTitle,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("Некорректные данные");
    }
    return handleApiError(error);
  }
}
