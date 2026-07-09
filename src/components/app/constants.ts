import type { EventMood } from "@/lib/events";
import type { EventSort } from "./types";

export const sortOptions: { value: EventSort; label: string }[] = [
  { value: "default", label: "По умолчанию" },
  { value: "popular", label: "По популярности" },
  { value: "participants", label: "По отзывам KudaGo" },
];

export const moodLabels: Record<EventMood, string> = {
  спокойно: "Спокойно",
  общительно: "Общительно",
  активно: "Активно",
};
