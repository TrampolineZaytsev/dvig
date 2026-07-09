"use client";

import type { AppView } from "./types";

export function SectionTitle({ view }: { view: AppView }) {
  const titles: Record<Exclude<AppView, "search">, string> = {
    profile: "Мой профиль",
    collection: "Мои события",
    friends: "Мои друзья",
    settings: "Настройки",
  };

  if (view === "search") return null;

  return <h1 className="text-2xl font-bold tracking-tight">{titles[view]}</h1>;
}
