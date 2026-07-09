import type { CustomDateRange } from "@/lib/events/dates";
import type { DvigEvent, EventCategory, EventMood } from "@/lib/events";
import type { DatePreset } from "./types";

export function toggleInList<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((value) => value !== item) : [...list, item];
}

export function countActiveFilters(
  selectedCategories: EventCategory[],
  extraCategorySlugs: string[],
  selectedDates: DatePreset[],
  selectedMoods: EventMood[],
  customDateRange: CustomDateRange | null,
  onlySpotsLeft: boolean
): number {
  return (
    selectedCategories.length +
    extraCategorySlugs.length +
    selectedDates.length +
    selectedMoods.length +
    (customDateRange ? 1 : 0) +
    (onlySpotsLeft ? 1 : 0)
  );
}

export function formatGroupLine(event: DvigEvent) {
  return `В группе ${event.participants} · свободно ${event.spotsLeft} · до ${event.groupCapacity} человек`;
}

export function mockParticipantInitials(eventId: string): string[] {
  const hash = eventId.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const names = ["А", "М", "И", "К", "С", "Д"];
  return [names[hash % names.length], names[(hash + 3) % names.length], names[(hash + 5) % names.length]];
}

export function formatEventCount(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod100 >= 11 && mod100 <= 14) {
    return `${count} встреч`;
  }
  if (mod10 === 1) {
    return `${count} встреча`;
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return `${count} встречи`;
  }
  return `${count} встреч`;
}
