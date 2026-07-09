import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { jsonError, jsonOk, handleApiError } from "@/lib/server/api";
import { createSessionToken, setSessionCookie, toPublicUser, type UserRole } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(2).max(60),
  consentAccepted: z.literal(true),
});

export async function POST(request: NextRequest) {
  try {
    const body = registerSchema.parse(await request.json());
    const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (existing) {
      return jsonError("Пользователь с таким email уже существует", 409);
    }

    const passwordHash = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        profile: {
          create: {
            displayName: body.displayName,
            consentAccepted: true,
            onboardingDone: false,
          },
        },
      },
      include: { profile: true },
    });

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
    });
    await setSessionCookie(token);

    return jsonOk({ user: toPublicUser(user) }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Некорректные данные");
    }
    return handleApiError(error);
  }
}
