import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";

import { LoginPageContent } from "@/components/auth/login-page-content";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Вход — ДВИГ",
  description: "Вход и регистрация в пилоте ДВИГ, Санкт-Петербург.",
};

export default function LoginPage() {
  return (
    <main className="dvig-page min-h-screen text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-md px-4 py-10 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          На главную
        </Link>
        <Badge className="dvig-badge-accent mt-6">Пилот B2C · СПб</Badge>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Вход в ДВИГ</h1>
        <p className="mt-3 text-muted-foreground">
          Войдите или создайте аккаунт, чтобы создавать группы, подавать заявки и участвовать в
          событиях.
        </p>
        <div className="mt-8">
          <Suspense fallback={<p className="text-sm text-muted-foreground">Загрузка…</p>}>
            <LoginPageContent />
          </Suspense>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
