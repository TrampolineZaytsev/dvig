import { NextRequest } from "next/server";
import { z } from "zod";

import { jsonError, jsonOk, handleApiError } from "@/lib/server/api";
import { requireSessionUser } from "@/lib/server/auth";
import { formatPanicMessage, formatReportMessage, sendTelegramNotification } from "@/lib/server/notifications";
import { prisma } from "@/lib/server/db";

const reportSchema = z.object({
  type: z.enum(["COMPLAINT", "PANIC"]),
  groupId: z.string().optional(),
  message: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSessionUser();
    const body = reportSchema.parse(await request.json());

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { profile: true },
    });
    if (!user) {
      return jsonError("Пользователь не найден", 404);
    }

    const group = body.groupId
      ? await prisma.group.findUnique({ where: { id: body.groupId } })
      : null;

    const report = await prisma.report.create({
      data: {
        userId: session.id,
        groupId: body.groupId,
        type: body.type,
        message: body.message,
      },
    });

    const displayName = user.profile?.displayName ?? user.email;
    if (body.type === "PANIC") {
      await sendTelegramNotification(
        formatPanicMessage({
          displayName,
          email: user.email,
          eventTitle: group?.eventTitle,
          trustedContact: user.profile?.trustedContact,
        })
      );
    } else {
      await sendTelegramNotification(
        formatReportMessage({
          displayName,
          email: user.email,
          eventTitle: group?.eventTitle,
          message: body.message,
        })
      );
    }

    return jsonOk({ report: { id: report.id } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("Некорректные данные");
    }
    return handleApiError(error);
  }
}
