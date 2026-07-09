import { NextRequest } from "next/server";
import { z } from "zod";

import { jsonError, jsonOk, handleApiError } from "@/lib/server/api";
import { getSessionUser, getUserWithProfile, serializeInterests, toPublicUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";

const profileSchema = z.object({
  displayName: z.string().min(2).max(60).optional(),
  city: z.string().min(2).max(80).optional(),
  interests: z.array(z.string()).max(8).optional(),
  bio: z.string().max(300).nullable().optional(),
  trustedContact: z.string().max(120).nullable().optional(),
  telegramHandle: z.string().max(80).nullable().optional(),
  onboardingDone: z.boolean().optional(),
  consentAccepted: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return jsonError("Требуется вход", 401);
    }
    const user = await getUserWithProfile(session.id);
    if (!user) {
      return jsonError("Пользователь не найден", 404);
    }
    return jsonOk({ user: toPublicUser(user) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return jsonError("Требуется вход", 401);
    }

    const body = profileSchema.parse(await request.json());
    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        profile: {
          upsert: {
            create: {
              displayName: body.displayName ?? "Участник",
              city: body.city ?? "Санкт-Петербург",
              interests: serializeInterests(body.interests ?? []),
              bio: body.bio ?? null,
              trustedContact: body.trustedContact ?? null,
              telegramHandle: body.telegramHandle ?? null,
              onboardingDone: body.onboardingDone ?? false,
              consentAccepted: body.consentAccepted ?? false,
            },
            update: {
              ...(body.displayName !== undefined ? { displayName: body.displayName } : {}),
              ...(body.city !== undefined ? { city: body.city } : {}),
              ...(body.interests !== undefined ? { interests: serializeInterests(body.interests) } : {}),
              ...(body.bio !== undefined ? { bio: body.bio } : {}),
              ...(body.trustedContact !== undefined ? { trustedContact: body.trustedContact } : {}),
              ...(body.telegramHandle !== undefined ? { telegramHandle: body.telegramHandle } : {}),
              ...(body.onboardingDone !== undefined ? { onboardingDone: body.onboardingDone } : {}),
              ...(body.consentAccepted !== undefined ? { consentAccepted: body.consentAccepted } : {}),
            },
          },
        },
      },
      include: { profile: true },
    });

    return jsonOk({ user: toPublicUser(user) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Некорректные данные");
    }
    return handleApiError(error);
  }
}
