"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { AuthPanel } from "@/components/auth/auth-panel";

export function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/app";

  return (
    <AuthPanel
      onUserChange={(user) => {
        if (user) {
          router.push(redirect);
        }
      }}
    />
  );
}
