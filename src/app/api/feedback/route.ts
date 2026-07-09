import { NextRequest } from "next/server";
import { z } from "zod";

import { jsonError, jsonOk, handleApiError } from "@/lib/server/api";
import { requireSessionUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";

const feedbackSchema = z.object({
  groupId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSessionUser();
    const body = feedbackSchema.parse(await request.json());

    const checkIn = await prisma.checkIn.findUnique({
      where: { userId_groupId: { userId: session.id, groupId: body.groupId } },
    });
    if (!checkIn) {
      return jsonError("Сначала отметьте check-in на событии", 403);
    }

    const feedback = await prisma.feedback.upsert({
      where: { userId_groupId: { userId: session.id, groupId: body.groupId } },
      create: {
        userId: session.id,
        groupId: body.groupId,
        rating: body.rating,
        comment: body.comment,
      },
      update: {
        rating: body.rating,
        comment: body.comment,
      },
    });

    await prisma.analyticsEvent.create({
      data: {
        userId: session.id,
        name: "feedback_submitted",
        payload: JSON.stringify({ groupId: body.groupId, rating: body.rating }),
      },
    });

    return jsonOk({ feedback }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("Некорректные данные");
    }
    return handleApiError(error);
  }
}
