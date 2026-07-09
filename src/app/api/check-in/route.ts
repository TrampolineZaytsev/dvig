import { NextRequest } from "next/server";
import { z } from "zod";

import { jsonError, jsonOk, handleApiError } from "@/lib/api";
import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const checkInSchema = z.object({
  groupId: z.string().min(1),
  status: z.enum(["checked_in", "left"]).default("checked_in"),
  note: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSessionUser();
    const body = checkInSchema.parse(await request.json());

    const application = await prisma.application.findFirst({
      where: {
        userId: session.id,
        groupId: body.groupId,
        status: "APPROVED",
      },
    });

    if (!application) {
      return jsonError("Нет одобренной заявки для этой группы", 403);
    }

    const checkIn = await prisma.checkIn.upsert({
      where: { userId_groupId: { userId: session.id, groupId: body.groupId } },
      create: {
        userId: session.id,
        groupId: body.groupId,
        status: body.status,
        note: body.note,
      },
      update: {
        status: body.status,
        note: body.note,
      },
    });

    await prisma.analyticsEvent.create({
      data: {
        userId: session.id,
        name: "check_in",
        payload: JSON.stringify({ groupId: body.groupId, status: body.status }),
      },
    });

    return jsonOk({ checkIn });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("Некорректные данные");
    }
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const session = await requireSessionUser();
    const checkIns = await prisma.checkIn.findMany({
      where: { userId: session.id },
      include: { group: true },
      orderBy: { createdAt: "desc" },
    });
    return jsonOk({ checkIns });
  } catch (error) {
    return handleApiError(error);
  }
}
