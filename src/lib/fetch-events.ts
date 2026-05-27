import type { CustomDateRange } from "@/lib/event-dates";
import type { DvigEvent, EventCategory } from "@/lib/events";

type DatePreset = "Сегодня" | "Завтра" | "Выходные";

const DATE_PRESET_TO_API: Record<DatePreset, string> = {
  Сегодня: "today",
  Завтра: "tomorrow",
  Выходные: "weekend",
};

export type FetchEventsParams = {
  primaryCategories: EventCategory[];
  extraSlugs: string[];
  selectedDates: DatePreset[];
  customDateRange: CustomDateRange | null;
  query: string;
  limit?: number;
};

export async function fetchDvigEvents(
  params: FetchEventsParams
): Promise<{ events: DvigEvent[]; error?: string }> {
  const search = new URLSearchParams();

  if (params.primaryCategories.length > 0) {
    search.set("primary", params.primaryCategories.join(","));
  }

  if (params.extraSlugs.length > 0) {
    search.set("categories", params.extraSlugs.join(","));
  }

  if (params.customDateRange) {
    search.set("dateFrom", params.customDateRange.from);
    search.set("dateTo", params.customDateRange.to);
  } else if (params.selectedDates.length === 1) {
    search.set("date", DATE_PRESET_TO_API[params.selectedDates[0]]);
  }

  if (params.query.trim()) {
    search.set("q", params.query.trim());
  }

  search.set("limit", String(params.limit ?? 40));

  const response = await fetch(`/api/events?${search.toString()}`);
  const data = await response.json();

  if (!response.ok) {
    return {
      events: [],
      error: data.error ?? "Не удалось загрузить афишу",
    };
  }

  return { events: data.events ?? [] };
}
