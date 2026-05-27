import type { KudagoEventCategoryRaw, KudagoEventsResponse } from "@/lib/kudago/types";

export const KUDAGO_BASE_URL = "https://kudago.com/public-api/v1.4";

const DEFAULT_FIELDS = [
  "id",
  "title",
  "description",
  "body_text",
  "dates",
  "place",
  "price",
  "age_restriction",
  "site_url",
  "images",
  "favorites_count",
  "comments_count",
  "categories",
].join(",");

export type SearchEventsParams = {
  location?: string;
  categories: string[];
  actualSince?: number;
  actualUntil?: number;
  pageSize?: number;
  orderBy?: string;
  lang?: string;
};

function buildUrl(path: string, params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return `${KUDAGO_BASE_URL}${path}${query ? `?${query}` : ""}`;
}

async function kudagoFetch<T>(url: string, revalidate: number): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate },
  });

  if (!response.ok) {
    throw new Error(`KudaGo ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function searchKudagoEvents(params: SearchEventsParams): Promise<KudagoEventsResponse> {
  const categories = params.categories.filter(Boolean).join(",");
  if (!categories) {
    return { results: [], count: 0 };
  }

  const url = buildUrl("/events/", {
    location: params.location ?? "spb",
    categories,
    page_size: params.pageSize ?? 40,
    lang: params.lang ?? "ru",
    fields: DEFAULT_FIELDS,
    expand: "place,dates",
    order_by: params.orderBy ?? "-favorites_count",
    actual_since: params.actualSince,
    actual_until: params.actualUntil,
  });

  return kudagoFetch<KudagoEventsResponse>(url, 300);
}

export async function fetchKudagoEventCategories(
  location = "spb"
): Promise<KudagoEventCategoryRaw[]> {
  const url = buildUrl("/event-categories/", {
    location,
    lang: "ru",
    page_size: 100,
  });

  const data = await kudagoFetch<KudagoEventCategoryRaw[] | { results?: KudagoEventCategoryRaw[] }>(
    url,
    86400
  );

  if (Array.isArray(data)) {
    return data;
  }

  return data.results ?? [];
}

export function dayBoundsUtc(date: Date): { since: number; until: number } {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);
  return {
    since: Math.floor(start.getTime() / 1000),
    until: Math.floor(end.getTime() / 1000),
  };
}

function toActualRange(since: number, until: number) {
  return { actualSince: since, actualUntil: until };
}

export function resolveDateRange(
  preset: string | null,
  customFrom?: string,
  customTo?: string
): { actualSince?: number; actualUntil?: number } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (customFrom && customTo) {
    const from = new Date(customFrom);
    const to = new Date(customTo);
    const start = dayBoundsUtc(from);
    const end = dayBoundsUtc(to);
    return toActualRange(start.since, end.until);
  }

  if (!preset) {
    const until = new Date(today);
    until.setDate(until.getDate() + 30);
    const start = dayBoundsUtc(today);
    const end = dayBoundsUtc(until);
    return toActualRange(start.since, end.until);
  }

  if (preset === "today") {
    const bounds = dayBoundsUtc(today);
    return toActualRange(bounds.since, bounds.until);
  }

  if (preset === "tomorrow") {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const bounds = dayBoundsUtc(tomorrow);
    return toActualRange(bounds.since, bounds.until);
  }

  if (preset === "weekend") {
    const day = today.getDay();
    const daysUntilSaturday = day === 6 ? 0 : day === 0 ? 0 : 6 - day;
    const saturday = new Date(today);
    saturday.setDate(saturday.getDate() + (day === 0 ? 0 : daysUntilSaturday));
    const sunday = new Date(saturday);
    sunday.setDate(sunday.getDate() + (day === 0 ? 0 : 1));
    const start = dayBoundsUtc(saturday);
    const end = dayBoundsUtc(sunday);
    return toActualRange(start.since, end.until);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(preset)) {
    const date = new Date(preset);
    const bounds = dayBoundsUtc(date);
    return toActualRange(bounds.since, bounds.until);
  }

  return {};
}
