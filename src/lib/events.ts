export type EventCategory = "Кино" | "Настолки" | "Культура" | "Спорт";
export type EventMood = "спокойно" | "общительно" | "активно";

export type PriceOption = {
  date: string;
  time: string;
  price: string;
  place: string;
};

export type AiSummary = {
  why: string;
  vibe: string;
  audience: string;
};

export type DvigEvent = {
  id: string;
  kudagoId?: number;
  title: string;
  category: EventCategory;
  kudagoCategorySlug?: string;
  mood: EventMood;
  date: "Сегодня" | "Завтра" | "Выходные";
  eventDate: string;
  time: string;
  place: string;
  address: string;
  price: string;
  short: string;
  description: string;
  spotsLeft: number;
  participants: number;
  moderator: string;
  rating: string;
  source: string;
  url: string;
  ageRestriction: string;
  updatedAt: string;
  popularityScore: number;
  commentsCount?: number;
  tags: string[];
  imageUrl?: string;
  aiSummary: AiSummary;
  priceOptions: PriceOption[];
};

export const categoryFilters = ["Кино", "Настолки", "Культура", "Спорт"] as const;
export const dateFilters = ["Сегодня", "Завтра", "Выходные"] as const;
export const moodFilters = ["спокойно", "общительно", "активно"] as const;

/** @deprecated Используйте categoryFilters для UI-фильтров */
export const categories = ["Все", ...categoryFilters] as const;
/** @deprecated Используйте dateFilters для UI-фильтров */
export const dates = ["Любая дата", ...dateFilters] as const;
/** @deprecated Используйте moodFilters для UI-фильтров */
export const moods = ["Любой формат", ...moodFilters] as const;

export function buildTelegramDigest(items: DvigEvent[]) {
  if (items.length === 0) {
    return "Подборка ДВИГ пока пустая. Сохраните события, чтобы собрать дайджест.";
  }

  return [
    "Подборка ДВИГ: куда сходить и с кем",
    "",
    ...items.map(
      (event, index) =>
        `${index + 1}. ${event.title}\n${event.date}, ${event.time} · ${event.place}\n${event.price}\n${event.aiSummary.why}`
    ),
    "",
    "Источник афиши: KudaGo. Отправка в Telegram — демо (копирование текста).",
  ].join("\n\n");
}

export function toCsv(items: DvigEvent[]) {
  const rows = [
    [
      "title",
      "category",
      "date",
      "time",
      "place",
      "price",
      "source",
      "url",
      "popularityScore",
    ],
    ...items.map((event) => [
      event.title,
      event.category,
      event.date,
      event.time,
      event.place,
      event.price,
      event.source,
      event.url,
      String(event.popularityScore),
    ]),
  ];

  return rows
    .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
    .join("\n");
}
