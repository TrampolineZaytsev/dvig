"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth/auth-panel";

export function HeaderAuthButton() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  if (pathname === "/login" || loading) {
    return null;
  }

  if (user) {
    return (
      <Link
        href="/app"
        className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
      >
        {user.profile?.displayName ?? user.email}
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="dvig-btn-primary inline-flex h-8 items-center justify-center rounded-md px-2.5 text-sm font-medium"
    >
      Войти
    </Link>
  );
}
