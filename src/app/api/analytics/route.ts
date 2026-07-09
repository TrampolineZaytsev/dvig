import { NextRequest } from "next/server";
import { z } from "zod";

import { jsonOk, handleApiError } from "@/lib/server/api";
import { getSessionUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";

const analyticsSchema = z.object({
  name: z.string().min(1).max(80),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser();
    const body = analyticsSchema.parse(await request.json());

    await prisma.analyticsEvent.create({
      data: {
        userId: session?.id,
        name: body.name,
        payload: body.payload ? JSON.stringify(body.payload) : null,
      },
    });

    return jsonOk({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonOk({ ok: false });
    }
    return handleApiError(error);
  }
}
