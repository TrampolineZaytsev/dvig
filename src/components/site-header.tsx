import type { ReactNode } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";

const navLinks = [
  { href: "/app", label: "Попробовать демо" },
  { href: "/safety", label: "Безопасность и данные" },
  { href: "/partners", label: "Партнёрам" },
] as const;

export function SiteHeader({ trailing }: { trailing?: ReactNode }) {
  return (
    <header className="dvig-header border-b border-border/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="group flex items-center gap-0.5">
            <img
              src="/dvig-logo.png"
              alt="ДВИГ"
              className="dvig-logo size-14 transition group-hover:shadow-primary/40"
            />
            <span className="text-2xl font-bold tracking-tight">ДВИГ</span>
          </Link>
          <Badge className="dvig-badge shrink-0">Демо · СПб</Badge>
        </div>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {trailing}
        </nav>
      </div>
    </header>
  );
}
