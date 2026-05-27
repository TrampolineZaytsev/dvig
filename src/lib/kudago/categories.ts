import type { EventCategory } from "@/lib/events";

/** Slug'и KudaGo для 4 витринных чипов (UI-названия не меняются). */
export const PRIMARY_CATEGORY_TO_SLUGS: Record<EventCategory, string[]> = {
  Кино: ["cinema"],
  Настолки: ["quest", "entertainment"],
  Культура: ["exhibition", "theater", "concert", "festival", "tour"],
  Спорт: ["recreation"],
};

const slugToPrimary = new Map<string, EventCategory>();

const primaryCategories: EventCategory[] = ["Кино", "Настолки", "Культура", "Спорт"];

for (const [primary, slugs] of Object.entries(PRIMARY_CATEGORY_TO_SLUGS) as [
  EventCategory,
  string[],
][]) {
  for (const slug of slugs) {
    slugToPrimary.set(slug, primary);
    slugToPrimary.set(slug.replace(/-/g, "_"), primary);
  }
}

export function resolveSlugsFromPrimary(categories: EventCategory[]): string[] {
  const slugs = categories.flatMap((category) => PRIMARY_CATEGORY_TO_SLUGS[category]);
  return [...new Set(slugs)];
}

export function resolveAllPrimarySlugs(): string[] {
  return resolveSlugsFromPrimary(primaryCategories);
}

export function mergeCategorySlugs(
  primary: EventCategory[],
  extra: string[]
): string[] {
  const fromPrimary = resolveSlugsFromPrimary(primary);
  return [...new Set([...fromPrimary, ...extra])];
}

export function slugToPrimaryCategory(slug: string): EventCategory {
  const normalized = slug.trim().toLowerCase();
  return slugToPrimary.get(normalized) ?? "Культура";
}

export type KudagoEventCategory = {
  slug: string;
  name: string;
};
