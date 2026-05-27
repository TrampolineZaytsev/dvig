import type { DvigEvent } from "@/lib/events";

export type CustomDateRange = {
  from: string;
  to: string;
};

export function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseISODate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return startOfDay(new Date(year, month - 1, day));
}

export function getEventCalendarDate(
  dateLabel: DvigEvent["date"],
  reference = new Date()
): Date {
  const today = startOfDay(reference);

  if (dateLabel === "Сегодня") {
    return today;
  }

  if (dateLabel === "Завтра") {
    return addDays(today, 1);
  }

  const dayOfWeek = today.getDay();

  if (dayOfWeek === 6 || dayOfWeek === 0) {
    return today;
  }

  return addDays(today, 6 - dayOfWeek);
}

export function eventMatchesDateFilter(
  event: DvigEvent,
  selectedPresets: DvigEvent["date"][],
  customRange: CustomDateRange | null
): boolean {
  if (selectedPresets.length === 0 && !customRange) {
    return true;
  }

  const eventDate = event.eventDate
    ? parseISODate(event.eventDate)
    : getEventCalendarDate(event.date);

  if (customRange) {
    const from = parseISODate(customRange.from);
    const to = parseISODate(customRange.to);
    if (eventDate >= from && eventDate <= to) {
      return true;
    }
  }

  if (selectedPresets.length === 0) {
    return Boolean(customRange);
  }

  for (const preset of selectedPresets) {
    const presetDate = getEventCalendarDate(preset);
    if (isSameDay(eventDate, presetDate)) {
      return true;
    }
    if (preset === "Выходные" && (eventDate.getDay() === 0 || eventDate.getDay() === 6)) {
      return true;
    }
    if (event.date === preset) {
      return true;
    }
  }

  return false;
}

export function formatCustomDateRangeLabel(range: CustomDateRange): string {
  if (range.from === range.to) {
    return formatRuShortDate(range.from);
  }

  return `${formatRuShortDate(range.from)} — ${formatRuShortDate(range.to)}`;
}

export function formatRuShortDate(isoDate: string): string {
  return parseISODate(isoDate).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
  });
}

export function isSameDay(a: Date, b: Date): boolean {
  return toISODate(a) === toISODate(b);
}

export function isDateInRange(date: Date, from: Date, to: Date): boolean {
  const value = startOfDay(date).getTime();
  return value >= from.getTime() && value <= to.getTime();
}
