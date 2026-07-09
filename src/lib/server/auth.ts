import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { appConfig } from "@/lib/config";
import { prisma } from "@/lib/server/db";
import type { User } from "@prisma/client";

export type UserRole = "USER" | "MODERATOR" | "ADMIN";
export type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type GroupStatus = "OPEN" | "FULL" | "CLOSED" | "CANCELLED";
export type ReportType = "COMPLAINT" | "PANIC";

export type SessionUser = {
  id: string;
  email: string;
  role: UserRole;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({ sub: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${appConfig.sessionMaxAge}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.role !== "string") {
      return null;
    }
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role as UserRole,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(appConfig.sessionCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: appConfig.sessionMaxAge,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(appConfig.sessionCookie);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(appConfig.sessionCookie)?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}

export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireModerator(): Promise<SessionUser> {
  const user = await requireSessionUser();
  if (user.role !== "MODERATOR" && user.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function getUserWithProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
}

export function parseInterests(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function serializeInterests(interests: string[]) {
  return JSON.stringify(interests);
}

export type PublicUser = Pick<User, "id" | "email" | "role"> & {
  profile: {
    displayName: string;
    city: string;
    interests: string[];
    bio: string | null;
    trustedContact: string | null;
    telegramHandle: string | null;
    onboardingDone: boolean;
    consentAccepted: boolean;
  } | null;
};

export function toPublicUser(user: User & { profile: import("@prisma/client").Profile | null }): PublicUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    profile: user.profile
      ? {
          displayName: user.profile.displayName,
          city: user.profile.city,
          interests: parseInterests(user.profile.interests),
          bio: user.profile.bio,
          trustedContact: user.profile.trustedContact,
          telegramHandle: user.profile.telegramHandle,
          onboardingDone: user.profile.onboardingDone,
          consentAccepted: user.profile.consentAccepted,
        }
      : null,
  };
}
