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
  title: string;
  category: EventCategory;
  mood: EventMood;
  date: "Сегодня" | "Завтра" | "Выходные";
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
  tags: string[];
  aiSummary: AiSummary;
  priceOptions: PriceOption[];
};

export const events: DvigEvent[] = [
  {
    id: "cinema-rodina",
    title: "Авторское кино и обсуждение",
    category: "Кино",
    mood: "спокойно",
    date: "Сегодня",
    time: "19:30",
    place: "Кинотеатр Родина",
    address: "Лиговский проспект, 43",
    price: "от 450 ₽",
    short: "Небольшая группа идет на премьеру и остается на разговор после сеанса.",
    description:
      "Подходит тем, кто хочет сходить в кино не одному и спокойно обсудить фильм после просмотра. Модератор держит темп разговора и помогает избежать неловких пауз.",
    spotsLeft: 3,
    participants: 7,
    moderator: "Алина",
    rating: "4.9",
    source: "Афиша ДВИГ",
    url: "https://example.com/events/cinema-rodina",
    ageRestriction: "16+",
    updatedAt: "сегодня, 12:20",
    popularityScore: 92,
    tags: ["публичное место", "есть модератор", "обсуждение после"],
    aiSummary: {
      why: "Хороший сценарий для первого выхода: есть готовая тема, понятное место и обсуждение после сеанса.",
      vibe: "Спокойная камерная встреча без давления и быстрых ожиданий.",
      audience: "Тем, кто любит кино, но не хочет идти одному или сразу идти на свидание.",
    },
    priceOptions: [
      { date: "Сегодня", time: "19:30", price: "450 ₽", place: "Родина, малый зал" },
      { date: "Завтра", time: "20:10", price: "520 ₽", place: "Родина, зал 2" },
      { date: "Выходные", time: "18:40", price: "600 ₽", place: "Родина, зал 1" },
    ],
  },
  {
    id: "boardgames-loft",
    title: "Настолки в антикафе",
    category: "Настолки",
    mood: "общительно",
    date: "Завтра",
    time: "18:00",
    place: "Антикафе на Лиговском",
    address: "Лиговский проспект, 74",
    price: "300 ₽/час",
    short: "Мафия, кодовые имена и быстрые партии для новых знакомств без давления.",
    description:
      "Формат для тех, кому проще общаться через общее дело. Организатор объясняет правила, собирает столы и следит, чтобы новичкам было комфортно.",
    spotsLeft: 5,
    participants: 10,
    moderator: "Артем",
    rating: "4.8",
    source: "Партнерская площадка",
    url: "https://example.com/events/boardgames-loft",
    ageRestriction: "18+",
    updatedAt: "сегодня, 10:05",
    popularityScore: 88,
    tags: ["новичкам ок", "малые группы", "без алкоголя"],
    aiSummary: {
      why: "Настолки быстро снимают неловкость: разговор начинается с правил, ролей и игровых ситуаций.",
      vibe: "Живой и дружелюбный формат, где легко переключаться между столами.",
      audience: "Тем, кто хочет познакомиться с людьми без анкет и долгих переписок.",
    },
    priceOptions: [
      { date: "Завтра", time: "18:00", price: "300 ₽/час", place: "Антикафе, общий зал" },
      { date: "Выходные", time: "16:00", price: "350 ₽/час", place: "Антикафе, комната 2" },
      { date: "Выходные", time: "19:00", price: "400 ₽/час", place: "Антикафе, большой стол" },
    ],
  },
  {
    id: "manege-walk",
    title: "Выставка и прогулка по центру",
    category: "Культура",
    mood: "спокойно",
    date: "Выходные",
    time: "14:00",
    place: "ЦВЗ Манеж",
    address: "Конногвардейский бульвар, 2",
    price: "от 600 ₽",
    short: "Сначала выставка, потом кофе и короткий маршрут по центру.",
    description:
      "Маршрут с понятной программой: встреча у входа, общий проход по выставке и короткое обсуждение. Хороший вариант для первого выхода в новую компанию.",
    spotsLeft: 4,
    participants: 8,
    moderator: "Соня",
    rating: "5.0",
    source: "Городская афиша",
    url: "https://example.com/events/manege-walk",
    ageRestriction: "12+",
    updatedAt: "вчера, 18:40",
    popularityScore: 81,
    tags: ["маршрут", "кофе после", "спокойный темп"],
    aiSummary: {
      why: "Есть мягкий переход от общего просмотра к разговору, поэтому встреча не держится на случайной small talk.",
      vibe: "Интеллектуально, спокойно, с ощущением маленькой городской группы.",
      audience: "Тем, кто любит выставки, прогулки и неформальные обсуждения без шума.",
    },
    priceOptions: [
      { date: "Выходные", time: "14:00", price: "600 ₽", place: "Манеж" },
      { date: "Выходные", time: "15:30", price: "600 ₽", place: "Манеж" },
      { date: "Следующая неделя", time: "19:00", price: "500 ₽", place: "Манеж" },
    ],
  },
  {
    id: "run-park",
    title: "Легкая пробежка и завтрак",
    category: "Спорт",
    mood: "активно",
    date: "Выходные",
    time: "10:00",
    place: "Таврический сад",
    address: "Кирочная улица",
    price: "бесплатно",
    short: "Разговорный темп, 4 км и завтрак рядом после финиша.",
    description:
      "Без соревнования и гонки за результатом. Подходит тем, кто хочет выйти из рутины и познакомиться с людьми через легкую активность.",
    spotsLeft: 6,
    participants: 9,
    moderator: "Павел",
    rating: "4.7",
    source: "Сообщество ДВИГ",
    url: "https://example.com/events/run-park",
    ageRestriction: "18+",
    updatedAt: "сегодня, 09:15",
    popularityScore: 74,
    tags: ["открытый воздух", "разговорный темп", "после кофе"],
    aiSummary: {
      why: "Формат снижает порог входа: встреча короткая, бесплатная и в публичном пространстве.",
      vibe: "Бодро, но без спортивного давления и гонки за результатом.",
      audience: "Тем, кто хочет активный выходной и легкое общение после финиша.",
    },
    priceOptions: [
      { date: "Выходные", time: "10:00", price: "0 ₽", place: "Таврический сад" },
      { date: "Выходные", time: "11:30", price: "0 ₽", place: "Таврический сад" },
      { date: "Следующая неделя", time: "08:30", price: "0 ₽", place: "Таврический сад" },
    ],
  },
  {
    id: "lecture-architecture",
    title: "Лекция об архитектуре Петербурга",
    category: "Культура",
    mood: "общительно",
    date: "Сегодня",
    time: "20:00",
    place: "Открытая гостиная",
    address: "ул. Рубинштейна, 13",
    price: "500 ₽",
    short: "Камерная лекция, после которой группа собирается обсудить городские маршруты.",
    description:
      "Для тех, кто любит город и хочет говорить не только о работе. После лекции модератор помогает группе выбрать общий маршрут на следующую встречу.",
    spotsLeft: 2,
    participants: 6,
    moderator: "Настя",
    rating: "4.9",
    source: "Партнерская площадка",
    url: "https://example.com/events/lecture-architecture",
    ageRestriction: "16+",
    updatedAt: "сегодня, 13:00",
    popularityScore: 79,
    tags: ["камерно", "интеллектуально", "продолжение в чате"],
    aiSummary: {
      why: "Тема лекции дает готовый контекст, а продолжение в чате помогает не потерять контакт после встречи.",
      vibe: "Городская гостиная: содержательно, спокойно, но с живым обсуждением.",
      audience: "Тем, кому хочется новых людей вокруг интереса к Петербургу и архитектуре.",
    },
    priceOptions: [
      { date: "Сегодня", time: "20:00", price: "500 ₽", place: "Открытая гостиная" },
      { date: "Завтра", time: "19:00", price: "550 ₽", place: "Открытая гостиная" },
      { date: "Выходные", time: "17:00", price: "650 ₽", place: "Открытая гостиная" },
    ],
  },
  {
    id: "quiz-team",
    title: "Квиз без готовой команды",
    category: "Настолки",
    mood: "активно",
    date: "Завтра",
    time: "21:00",
    place: "Квиз-рум у метро",
    address: "Невский проспект, 88",
    price: "700 ₽",
    short: "Собираем команду из тех, кто хотел пойти, но не нашел компанию.",
    description:
      "Участники заранее видят состав команды и темы раундов. Модератор помогает распределить роли, чтобы никто не чувствовал себя лишним.",
    spotsLeft: 4,
    participants: 5,
    moderator: "Полина",
    rating: "4.8",
    source: "Партнерская площадка",
    url: "https://example.com/events/quiz-team",
    ageRestriction: "18+",
    updatedAt: "сегодня, 11:25",
    popularityScore: 84,
    tags: ["команда", "игровой формат", "после можно в чат"],
    aiSummary: {
      why: "Квиз решает проблему отсутствия готовой команды: роли и темы уже заданы, а знакомство происходит в игре.",
      vibe: "Активно, азартно, но структурировано модератором.",
      audience: "Тем, кто любит командные игры и хочет быстро почувствовать себя частью группы.",
    },
    priceOptions: [
      { date: "Завтра", time: "21:00", price: "700 ₽", place: "Квиз-рум у метро" },
      { date: "Выходные", time: "20:00", price: "750 ₽", place: "Квиз-рум у метро" },
      { date: "Следующая неделя", time: "21:00", price: "650 ₽", place: "Квиз-рум у метро" },
    ],
  },
];

export const featuredEvents = events.slice(0, 3);

export const categoryFilters = ["Кино", "Настолки", "Культура", "Спорт"] as const;
export const dateFilters = ["Сегодня", "Завтра", "Выходные"] as const;
export const moodFilters = ["спокойно", "общительно", "активно"] as const;

/** @deprecated Используйте categoryFilters для UI-фильтров */
export const categories = ["Все", ...categoryFilters] as const;
/** @deprecated Используйте dateFilters для UI-фильтров */
export const dates = ["Любая дата", ...dateFilters] as const;
/** @deprecated Используйте moodFilters для UI-фильтров */
export const moods = ["Любой формат", ...moodFilters] as const;

export function getPopularEvents() {
  return [...events].sort((a, b) => b.popularityScore - a.popularityScore);
}

export function buildTelegramDigest(items: DvigEvent[]) {
  if (items.length === 0) {
    return "Подборка ДВИГ пока пустая. Сохраните события, чтобы собрать дайджест.";
  }

  return [
    "Подборка ДВИГ: куда сходить и с кем",
    "",
    ...items.map(
      (event, index) =>
        `${index + 1}. ${event.title}\n${event.date}, ${event.time} · ${event.place}\n${event.price} · ${event.spotsLeft} мест\n${event.aiSummary.why}`
    ),
    "",
    "Демо: текст подготовлен локально, без реальной отправки в Telegram.",
  ].join("\n\n");
}

export function toCsv(items: DvigEvent[]) {
  const rows = [
    ["title", "category", "date", "time", "place", "price", "participants", "spotsLeft"],
    ...items.map((event) => [
      event.title,
      event.category,
      event.date,
      event.time,
      event.place,
      event.price,
      String(event.participants),
      String(event.spotsLeft),
    ]),
  ];

  return rows
    .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
    .join("\n");
}
