import type { DvigEvent, EventMood } from "@/lib/events";
import { PRIMARY_CATEGORY_TO_SLUGS, slugToPrimaryCategory } from "@/lib/kudago/categories";
import type { KudagoDateSlot, KudagoEventRaw } from "@/lib/kudago/types";

function parseTimestamp(value: unknown): Date | null {
  if (value === null || value === undefined) {
    return null;
  }
  const ts = Number(value);
  if (!Number.isFinite(ts) || ts <= 0) {
    return null;
  }
  const date = new Date(ts * 1000);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseDateSlots(slots: KudagoDateSlot[] | undefined): Date[] {
  if (!slots?.length) {
    return [];
  }

  const dates: Date[] = [];
  for (const slot of slots) {
    const start = parseTimestamp(slot.start);
    if (start) {
      dates.push(start);
    }
  }

  return dates.sort((a, b) => a.getTime() - b.getTime());
}

function normalizeImageUrl(url: string): string {
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  return url;
}

function extractImageUrl(raw: KudagoEventRaw): string | undefined {
  const images = raw.images ?? [];
  for (const item of images) {
    if (typeof item === "string" && (item.startsWith("http") || item.startsWith("//"))) {
      return normalizeImageUrl(item);
    }
    if (
      typeof item === "object" &&
      item?.image &&
      (item.image.startsWith("http") || item.image.startsWith("//"))
    ) {
      return normalizeImageUrl(item.image);
    }
  }
  return undefined;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  });
}

function toISODate(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Europe/Moscow" });
}

function datePresetLabel(eventDate: Date, reference = new Date()): DvigEvent["date"] {
  const today = new Date(reference);
  today.setHours(0, 0, 0, 0);
  const target = new Date(eventDate);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);

  if (diffDays === 0) {
    return "Сегодня";
  }
  if (diffDays === 1) {
    return "Завтра";
  }

  const day = target.getDay();
  if (day === 0 || day === 6) {
    return "Выходные";
  }

  return "Выходные";
}

function moodFromCategory(category: DvigEvent["category"]): EventMood {
  if (category === "Спорт") {
    return "активно";
  }
  if (category === "Настолки") {
    return "общительно";
  }
  if (category === "Кино") {
    return "спокойно";
  }
  return "общительно";
}

function stripHtml(text: string): string {
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function excerpt(text: string, max = 160): string {
  const normalized = stripHtml(text);
  if (normalized.length <= max) {
    return normalized;
  }
  return `${normalized.slice(0, max - 1)}…`;
}

function mockSocialFromKudagoId(id: number) {
  const seed = id % 97;
  const groupCapacity = 6 + (seed % 7);
  const participants = 1 + (seed % 4);
  const spotsLeft = Math.max(0, groupCapacity - participants);

  return {
    groupCapacity,
    participants,
    spotsLeft,
    moderator: "Организатор группы (демо)",
  };
}

function buildAiSummary(description: string): DvigEvent["aiSummary"] {
  const text = excerpt(description, 220);
  return {
    why: text || "Актуальное событие из афиши KudaGo.",
    vibe: "Формат и атмосфера зависят от площадки — уточните в описании на KudaGo.",
    audience: "Подойдёт тем, кто ищет компанию на городское мероприятие.",
  };
}

const knownSlugs = new Set(
  Object.values(PRIMARY_CATEGORY_TO_SLUGS).flatMap((slugs) => slugs)
);

function resolveEventSlug(raw: KudagoEventRaw): string {
  for (const slug of raw.categories ?? []) {
    if (knownSlugs.has(slug)) {
      return slug;
    }
  }
  return raw.categories?.[0] ?? "other";
}

export function mapKudagoToDvigEvent(raw: KudagoEventRaw): DvigEvent | null {
  if (!raw.id || !raw.title) {
    return null;
  }

  const futureDates = parseDateSlots(raw.dates);
  const firstDate = futureDates[0] ?? null;
  const eventDate = firstDate ? toISODate(firstDate) : toISODate(new Date());
  const kudagoCategorySlug = resolveEventSlug(raw);
  const category = slugToPrimaryCategory(kudagoCategorySlug);
  const placeTitle = raw.place?.title?.trim() || "Место уточняется";
  const address = raw.place?.address?.trim() || "";
  const description =
    stripHtml(raw.body_text || raw.description || "") || raw.title;
  const short = excerpt(raw.description || description);
  const price =
    typeof raw.price === "string" && raw.price.trim()
      ? raw.price.trim()
      : "уточняйте на сайте";
  const favorites = Number(raw.favorites_count) || 0;
  const comments = Number(raw.comments_count) || 0;

  let ageRestriction = "";
  if (raw.age_restriction !== undefined && raw.age_restriction !== null) {
    ageRestriction =
      typeof raw.age_restriction === "number"
        ? `${raw.age_restriction}+`
        : String(raw.age_restriction);
  }

  const priceOptions = futureDates.slice(0, 3).map((date) => ({
    date: datePresetLabel(date),
    time: formatTime(date),
    price,
    place: placeTitle,
  }));

  const social = mockSocialFromKudagoId(raw.id);

  return {
    id: `kudago-${raw.id}`,
    kudagoId: raw.id,
    title: raw.title,
    category,
    kudagoCategorySlug,
    mood: moodFromCategory(category),
    date: firstDate ? datePresetLabel(firstDate) : "Сегодня",
    eventDate,
    time: firstDate ? formatTime(firstDate) : "—",
    place: placeTitle,
    address,
    price,
    short,
    description,
    spotsLeft: social.spotsLeft,
    participants: social.participants,
    groupCapacity: social.groupCapacity,
    moderator: social.moderator,
    rating: favorites > 0 ? String(Math.min(5, 3.5 + favorites / 200)) : "—",
    source: "KudaGo",
    url: raw.site_url || `https://kudago.com/spb/event/${raw.id}/`,
    ageRestriction,
    updatedAt: new Date().toLocaleDateString("ru-RU", { timeZone: "Europe/Moscow" }),
    popularityScore: Math.min(100, favorites),
    commentsCount: comments,
    tags: raw.categories?.length ? raw.categories : [kudagoCategorySlug],
    imageUrl: extractImageUrl(raw),
    aiSummary: buildAiSummary(description),
    priceOptions:
      priceOptions.length > 0
        ? priceOptions
        : [{ date: "Сегодня", time: "—", price, place: placeTitle }],
  };
}

export function mapKudagoEvents(rawList: KudagoEventRaw[]): DvigEvent[] {
  const seen = new Set<number>();
  const result: DvigEvent[] = [];

  for (const raw of rawList) {
    if (!raw.id || seen.has(raw.id)) {
      continue;
    }
    seen.add(raw.id);
    const mapped = mapKudagoToDvigEvent(raw);
    if (mapped) {
      result.push(mapped);
    }
  }

  return result;
}
