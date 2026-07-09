import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { jsonError, jsonOk, handleApiError } from "@/lib/server/api";
import { createSessionToken, setSessionCookie, toPublicUser, type UserRole } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = loginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
      include: { profile: true },
    });

    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      return jsonError("Неверный email или пароль", 401);
    }

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
    });
    await setSessionCookie(token);

    return jsonOk({ user: toPublicUser(user) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError("Некорректные данные");
    }
    return handleApiError(error);
  }
}
