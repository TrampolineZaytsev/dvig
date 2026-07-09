import type { ReactNode } from "react";
import Link from "next/link";

import { HeaderAuthButton } from "@/components/layout/header-auth-button";
import { CityPicker } from "@/components/layout/city-picker";

const navLinks = [
  { href: "/app", label: "Приложение" },
  { href: "/safety", label: "Безопасность и данные" },
  { href: "/partners", label: "Партнёрам" },
] as const;

export function SiteHeader({ trailing }: { trailing?: ReactNode }) {
  return (
    <header className="dvig-header border-b border-border/40">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="group flex min-w-0 items-center gap-0.5">
            <img
              src="/dvig-logo.png"
              alt="ДВИГ"
              className="dvig-logo size-14 transition group-hover:shadow-primary/40"
            />
            <span className="text-2xl font-bold tracking-tight">ДВИГ</span>
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <CityPicker />
            <HeaderAuthButton />
            {trailing}
          </div>
        </div>

        <nav className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm lg:mt-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
