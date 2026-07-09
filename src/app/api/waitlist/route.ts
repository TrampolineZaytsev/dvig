import { NextRequest } from "next/server";
import { z } from "zod";

import { jsonError, jsonOk, handleApiError } from "@/lib/api";
import { prisma } from "@/lib/db";

const waitlistSchema = z
  .object({
    email: z.string().email().optional(),
    telegram: z.string().min(2).max(80).optional(),
    interests: z.string().max(200).optional(),
  })
  .refine((data) => data.email || data.telegram, {
    message: "Укажите email или Telegram",
  });

export async function POST(request: NextRequest) {
  try {
    const body = waitlistSchema.parse(await request.json());
    const entry = await prisma.waitlistEntry.create({
      data: {
        email: body.email?.toLowerCase(),
        telegram: body.telegram,
        interests: body.interests,
      },
    });
    return jsonOk({ id: entry.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Некорректные данные");
    }
    return handleApiError(error);
  }
}
