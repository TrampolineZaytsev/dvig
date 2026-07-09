"use client";

import Link from "next/link";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { CalendarDays, Home, Menu, Settings, UserCheck, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { AppView } from "./types";

export function AppMenu({ onNavigate }: { onNavigate: (view: AppView) => void }) {
  const [open, setOpen] = useState(false);

  const navigate = (view: AppView) => {
    onNavigate(view);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Открыть меню"
        render={
          <Button
            variant="outline"
            size="icon"
            className="size-11 shrink-0 rounded-md border-border/60"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Меню</SheetTitle>
          <SheetDescription>Навигация по разделам ДВИГ.</SheetDescription>
        </SheetHeader>
        <nav className="px-4">
          <ul className="divide-y divide-border/50">
            <MenuNavItem
              icon={Home}
              title="Главная"
              href="/"
              onClick={() => setOpen(false)}
            />
            <MenuNavItem
              icon={UserCheck}
              title="Мой профиль"
              onClick={() => navigate("profile")}
            />
            <MenuNavItem
              icon={CalendarDays}
              title="Мои события"
              onClick={() => navigate("collection")}
            />
            <MenuNavItem
              icon={UsersRound}
              title="Мои друзья"
              onClick={() => navigate("friends")}
            />
            <MenuNavItem
              icon={Settings}
              title="Настройки"
              onClick={() => navigate("settings")}
            />
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export function MenuNavItem({
  icon: Icon,
  title,
  href,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  href?: string;
  onClick: () => void;
}) {
  const className =
    "flex w-full items-center gap-3 py-4 text-left text-base font-medium transition hover:text-primary";

  return (
    <li>
      {href ? (
        <Link href={href} className={className} onClick={onClick}>
          <Icon className="size-5 shrink-0 text-primary" />
          {title}
        </Link>
      ) : (
        <button type="button" className={className} onClick={onClick}>
          <Icon className="size-5 shrink-0 text-primary" />
          {title}
        </button>
      )}
    </li>
  );
}
