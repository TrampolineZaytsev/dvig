"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";

import {
  BellRing,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Clipboard,
  Download,
  EyeOff,
  FileText,
  Heart,
  Home,
  InfoIcon,
  LogOut,
  Menu,
  MapPin,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Table2,
  Trash2,
  TriangleAlert,
  UserCheck,
  UsersRound,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DateRangePicker } from "@/components/date-range-picker";
import { KudagoCategoryPicker } from "@/components/kudago-category-picker";
import {
  buildTelegramDigest,
  categoryFilters,
  dateFilters,
  DvigEvent,
  EventCategory,
  EventMood,
  moodFilters,
  toCsv,
} from "@/lib/events";
import {
  CustomDateRange,
  eventMatchesDateFilter,
  formatCustomDateRangeLabel,
} from "@/lib/event-dates";
import { fetchDvigEvents } from "@/lib/fetch-events";

type AppView = "search" | "profile" | "collection" | "friends" | "settings";
type DatePreset = (typeof dateFilters)[number];
type EventSort = "default" | "popular" | "participants";

const sortOptions: { value: EventSort; label: string }[] = [
  { value: "default", label: "По умолчанию" },
  { value: "popular", label: "По популярности" },
  { value: "participants", label: "По отзывам KudaGo" },
];

const moodLabels: Record<EventMood, string> = {
  спокойно: "Спокойно",
  общительно: "Общительно",
  активно: "Активно",
};

function toggleInList<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((value) => value !== item) : [...list, item];
}

function countActiveFilters(
  selectedCategories: EventCategory[],
  extraCategorySlugs: string[],
  selectedDates: DatePreset[],
  selectedMoods: EventMood[],
  customDateRange: CustomDateRange | null
): number {
  return (
    selectedCategories.length +
    extraCategorySlugs.length +
    selectedDates.length +
    selectedMoods.length +
    (customDateRange ? 1 : 0)
  );
}

export function EventBrowser() {
  const [view, setView] = useState<AppView>("search");
  const [selectedCategories, setSelectedCategories] = useState<EventCategory[]>([]);
  const [extraCategorySlugs, setExtraCategorySlugs] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<DatePreset[]>([]);
  const [customDateRange, setCustomDateRange] = useState<CustomDateRange | null>(null);
  const [selectedMoods, setSelectedMoods] = useState<EventMood[]>([]);
  const [sortBy, setSortBy] = useState<EventSort>("default");
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState<DvigEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selected, setSelected] = useState<DvigEvent | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [savedEventsCache, setSavedEventsCache] = useState<Record<string, DvigEvent>>({});
  const [joined, setJoined] = useState<string[]>([]);
  const [copyState, setCopyState] = useState("Скопировать для Telegram");

  useEffect(() => {
    const requestedCategory = new URLSearchParams(window.location.search).get("category");

    if (categoryFilters.includes(requestedCategory as EventCategory)) {
      setSelectedCategories([requestedCategory as EventCategory]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        setLoading(true);
        setFetchError(null);
        const result = await fetchDvigEvents({
          primaryCategories: selectedCategories,
          extraSlugs: extraCategorySlugs,
          selectedDates,
          customDateRange,
          query,
        });
        if (cancelled) {
          return;
        }
        if (result.error) {
          setFetchError(result.error);
          setEvents([]);
        } else {
          setEvents(result.events);
          setFetchError(null);
        }
        setLoading(false);
      })();
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [selectedCategories, extraCategorySlugs, selectedDates, customDateRange, query]);

  const filteredEvents = useMemo(() => {
    const matched = events.filter((event) => {
      const categoryMatch =
        (selectedCategories.length === 0 && extraCategorySlugs.length === 0) ||
        (selectedCategories.length > 0 && selectedCategories.includes(event.category)) ||
        (extraCategorySlugs.length > 0 &&
          Boolean(
            event.kudagoCategorySlug &&
              extraCategorySlugs.includes(event.kudagoCategorySlug)
          ));
      const dateMatch = eventMatchesDateFilter(event, selectedDates, customDateRange);
      const moodMatch = selectedMoods.length === 0 || selectedMoods.includes(event.mood);

      return categoryMatch && dateMatch && moodMatch;
    });

    if (sortBy === "popular") {
      return [...matched].sort((a, b) => b.popularityScore - a.popularityScore);
    }
    if (sortBy === "participants") {
      return [...matched].sort(
        (a, b) => (b.commentsCount ?? 0) - (a.commentsCount ?? 0)
      );
    }

    return matched;
  }, [
    customDateRange,
    events,
    extraCategorySlugs,
    selectedCategories,
    selectedDates,
    selectedMoods,
    sortBy,
  ]);

  const savedEvents = useMemo(() => {
    return saved
      .map((id) => savedEventsCache[id] ?? events.find((event) => event.id === id))
      .filter((event): event is DvigEvent => Boolean(event));
  }, [events, saved, savedEventsCache]);
  const digest = useMemo(() => buildTelegramDigest(savedEvents), [savedEvents]);
  const exportEvents = savedEvents.length > 0 ? savedEvents : filteredEvents;

  const toggleSaved = (event: DvigEvent) => {
    setSaved((current) => {
      if (current.includes(event.id)) {
        setSavedEventsCache((cache) => {
          const next = { ...cache };
          delete next[event.id];
          return next;
        });
        return current.filter((id) => id !== event.id);
      }
      setSavedEventsCache((cache) => ({ ...cache, [event.id]: event }));
      return [...current, event.id];
    });
  };

  const toggleJoined = (eventId: string) => {
    setJoined((current) =>
      current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId]
    );
  };

  const downloadFile = (items: DvigEvent[], format: "json" | "csv", filename = "dvig-events") => {
    const content = format === "json" ? JSON.stringify(items, null, 2) : toCsv(items);
    const type = format === "json" ? "application/json" : "text/csv";
    const blob = new Blob([content], { type: `${type};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyDigest = async () => {
    try {
      await navigator.clipboard.writeText(digest);
      setCopyState("Скопировано");
      window.setTimeout(() => setCopyState("Скопировать для Telegram"), 1600);
    } catch {
      setCopyState("Скопируйте текст ниже");
    }
  };

  return (
    <main className="dvig-page min-h-screen text-foreground">
      <header className="dvig-header">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-0.5">
              <img
                src="/dvig-logo.png"
                alt="ДВИГ"
                className="dvig-logo size-14"
              />
              <span className="text-2xl font-bold tracking-tight">ДВИГ</span>
            </Link>
            <Badge variant="outline" className="rounded-md lg:hidden">
              webapp
            </Badge>
          </div>
          <div className="flex items-center justify-end">
            <AppMenu onNavigate={setView} />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-5">
          {view === "search" ? (
            <EventSearchPanel
              resultCount={filteredEvents.length}
              loading={loading}
              query={query}
              onQueryChange={setQuery}
              selectedCategories={selectedCategories}
              onSelectedCategoriesChange={setSelectedCategories}
              extraCategorySlugs={extraCategorySlugs}
              onExtraCategorySlugsChange={setExtraCategorySlugs}
              selectedDates={selectedDates}
              onSelectedDatesChange={setSelectedDates}
              customDateRange={customDateRange}
              onCustomDateRangeChange={setCustomDateRange}
              selectedMoods={selectedMoods}
              onSelectedMoodsChange={setSelectedMoods}
              sortBy={sortBy}
              onSortByChange={setSortBy}
            />
          ) : (
            <div className="flex items-center justify-between gap-4">
              <SectionTitle view={view} />
              <Button variant="outline" className="rounded-md" onClick={() => setView("search")}>
                К событиям
              </Button>
            </div>
          )}

          {view === "search" && (
            <EventGrid
              events={filteredEvents}
              loading={loading}
              error={fetchError}
              saved={saved}
              joined={joined}
              onOpen={setSelected}
              onSave={toggleSaved}
              onJoin={toggleJoined}
              onRetry={() => {
                setLoading(true);
                void fetchDvigEvents({
                  primaryCategories: selectedCategories,
                  extraSlugs: extraCategorySlugs,
                  selectedDates,
                  customDateRange,
                  query,
                }).then((result) => {
                  if (result.error) {
                    setFetchError(result.error);
                    setEvents([]);
                  } else {
                    setEvents(result.events);
                    setFetchError(null);
                  }
                  setLoading(false);
                });
              }}
            />
          )}

          {view === "profile" && (
            <ProfileView savedCount={saved.length} joinedCount={joined.length} />
          )}

          {view === "collection" && (
            <CollectionPanel
              savedEvents={savedEvents}
              digest={digest}
              copyState={copyState}
              exportEvents={exportEvents}
              onCopy={copyDigest}
              onOpen={setSelected}
              onRemove={(event) => toggleSaved(event)}
              onExportJson={() => downloadFile(exportEvents, "json")}
              onExportCsv={() => downloadFile(exportEvents, "csv")}
            />
          )}

          {view === "friends" && <FriendsPanel />}

          {view === "settings" && <SettingsPanel joinedCount={joined.length} />}
        </div>
      </section>

      <EventSheet
        event={selected}
        isSaved={selected ? saved.includes(selected.id) : false}
        isJoined={selected ? joined.includes(selected.id) : false}
        onClose={() => setSelected(null)}
        onSave={(event) => toggleSaved(event)}
        onJoin={(eventId) => toggleJoined(eventId)}
        onExportJson={(event) =>
          downloadFile([event], "json", `dvig-${event.id}`)
        }
        onExportCsv={(event) => downloadFile([event], "csv", `dvig-${event.id}`)}
      />
    </main>
  );
}

function AppMenu({ onNavigate }: { onNavigate: (view: AppView) => void }) {
  const [open, setOpen] = useState(false);

  const navigate = (view: AppView) => {
    onNavigate(view);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Открыть меню"
        render={
          <Button
            variant="outline"
            size="icon"
            className="size-11 shrink-0 rounded-md border-border/60"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>Меню</SheetTitle>
          <SheetDescription>Навигация по разделам ДВИГ.</SheetDescription>
        </SheetHeader>
        <nav className="px-4">
          <ul className="divide-y divide-border/50">
            <MenuNavItem
              icon={Home}
              title="Главная"
              href="/"
              onClick={() => setOpen(false)}
            />
            <MenuNavItem
              icon={UserCheck}
              title="Мой профиль"
              onClick={() => navigate("profile")}
            />
            <MenuNavItem
              icon={CalendarDays}
              title="Мои события"
              onClick={() => navigate("collection")}
            />
            <MenuNavItem
              icon={UsersRound}
              title="Мои друзья"
              onClick={() => navigate("friends")}
            />
            <MenuNavItem
              icon={Settings}
              title="Настройки"
              onClick={() => navigate("settings")}
            />
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function EventSearchPanel({
  resultCount,
  loading,
  query,
  onQueryChange,
  selectedCategories,
  onSelectedCategoriesChange,
  extraCategorySlugs,
  onExtraCategorySlugsChange,
  selectedDates,
  onSelectedDatesChange,
  customDateRange,
  onCustomDateRangeChange,
  selectedMoods,
  onSelectedMoodsChange,
  sortBy,
  onSortByChange,
}: {
  resultCount: number;
  loading: boolean;
  query: string;
  onQueryChange: (value: string) => void;
  selectedCategories: EventCategory[];
  onSelectedCategoriesChange: (value: EventCategory[]) => void;
  extraCategorySlugs: string[];
  onExtraCategorySlugsChange: (value: string[]) => void;
  selectedDates: DatePreset[];
  onSelectedDatesChange: (value: DatePreset[]) => void;
  customDateRange: CustomDateRange | null;
  onCustomDateRangeChange: (value: CustomDateRange | null) => void;
  selectedMoods: EventMood[];
  onSelectedMoodsChange: (value: EventMood[]) => void;
  sortBy: EventSort;
  onSortByChange: (value: EventSort) => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const activeFilterCount = countActiveFilters(
    selectedCategories,
    extraCategorySlugs,
    selectedDates,
    selectedMoods,
    customDateRange
  );
  const hasQuery = query.trim().length > 0;
  const hasActiveChips = activeFilterCount > 0 || hasQuery;

  const resetFilters = () => {
    onSelectedCategoriesChange([]);
    onExtraCategorySlugsChange([]);
    onSelectedDatesChange([]);
    onCustomDateRangeChange(null);
    onSelectedMoodsChange([]);
    onQueryChange("");
  };

  return (
    <div className="dvig-panel p-4 sm:p-5">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Выберите мероприятие</h1>
      </div>

      <label className="relative mt-5 block">
        <span className="sr-only">Поиск мероприятий</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/80" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Кино, антикафе, лекция, место..."
          className="h-11 rounded-lg border-border/60 bg-background/60 pl-10 text-base"
        />
      </label>

      <div className="mt-4 flex flex-col gap-3 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className={`h-10 rounded-full px-4 ${filtersOpen ? "border-primary/40 bg-primary/5" : ""}`}
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal className="size-4" />
            {filtersOpen ? "Скрыть фильтры" : "Показать фильтры"}
            {activeFilterCount > 0 && (
              <Badge className="ml-0.5 rounded-full px-1.5 py-0 text-xs tabular-nums">
                {activeFilterCount}
              </Badge>
            )}
            {filtersOpen ? (
              <ChevronUp className="size-4 opacity-70" />
            ) : (
              <ChevronDown className="size-4 opacity-70" />
            )}
          </Button>

          <Select
            value={sortBy}
            onValueChange={(value) => onSortByChange(value as EventSort)}
            items={sortOptions}
          >
            <SelectTrigger
              className="h-10 min-w-[11rem] rounded-full border-border/60 bg-background/60 px-4"
              aria-label="Сортировка"
            >
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent align="start">
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground sm:text-right">
          {loading ? (
            "Загружаем афишу KudaGo…"
          ) : (
            <>
              <span className="font-medium text-foreground">{formatEventCount(resultCount)}</span>{" "}
              найдено
            </>
          )}
        </p>
      </div>

      {filtersOpen && (
        <div className="mt-4 space-y-5">
          <FilterGroup label="Когда">
            <div className="flex flex-wrap items-center gap-2">
              {dateFilters.map((item) => (
                <FilterPill
                  key={item}
                  active={selectedDates.includes(item)}
                  onClick={() =>
                    onSelectedDatesChange(toggleInList(selectedDates, item))
                  }
                >
                  {item}
                </FilterPill>
              ))}
              <DateRangePicker
                value={customDateRange}
                onChange={onCustomDateRangeChange}
              />
            </div>
          </FilterGroup>

          <FilterGroup label="Формат встречи">
            <div className="flex flex-wrap gap-2">
              {moodFilters.map((item) => (
                <FilterPill
                  key={item}
                  active={selectedMoods.includes(item)}
                  onClick={() =>
                    onSelectedMoodsChange(toggleInList(selectedMoods, item))
                  }
                >
                  {moodLabels[item]}
                </FilterPill>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup label="Категория">
            <KudagoCategoryPicker
              primaryValue={selectedCategories}
              onPrimaryChange={onSelectedCategoriesChange}
              extraSlugs={extraCategorySlugs}
              onExtraSlugsChange={onExtraCategorySlugsChange}
            />
          </FilterGroup>
        </div>
      )}

      {hasActiveChips && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Активно:
          </span>
          {hasQuery && (
            <ActiveFilterChip
              label={`«${query.trim()}»`}
              onRemove={() => onQueryChange("")}
            />
          )}
          {selectedCategories.map((item) => (
            <ActiveFilterChip
              key={item}
              label={item}
              onRemove={() =>
                onSelectedCategoriesChange(selectedCategories.filter((value) => value !== item))
              }
            />
          ))}
          {selectedDates.map((item) => (
            <ActiveFilterChip
              key={item}
              label={item}
              onRemove={() =>
                onSelectedDatesChange(selectedDates.filter((value) => value !== item))
              }
            />
          ))}
          {customDateRange && (
            <ActiveFilterChip
              label={formatCustomDateRangeLabel(customDateRange)}
              onRemove={() => onCustomDateRangeChange(null)}
            />
          )}
          {selectedMoods.map((item) => (
            <ActiveFilterChip
              key={item}
              label={moodLabels[item]}
              onRemove={() =>
                onSelectedMoodsChange(selectedMoods.filter((value) => value !== item))
              }
            />
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 rounded-full px-2 text-xs text-muted-foreground"
            onClick={resetFilters}
          >
            Сбросить всё
          </Button>
        </div>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={
        active
          ? "rounded-full border border-primary/40 bg-primary/15 px-3.5 py-1.5 text-sm font-medium text-primary shadow-sm shadow-primary/10"
          : "rounded-full border border-border/50 bg-card/40 px-3.5 py-1.5 text-sm font-medium text-foreground/90 transition hover:border-primary/30 hover:bg-card/70"
      }
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function ActiveFilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/50 py-1 pl-2.5 pr-1 text-sm">
      {label}
      <button
        type="button"
        className="rounded-full p-0.5 text-muted-foreground transition hover:bg-background hover:text-foreground"
        aria-label={`Убрать фильтр «${label}»`}
        onClick={onRemove}
      >
        <X className="size-3.5" />
      </button>
    </span>
  );
}

function formatEventCount(count: number): string {
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

function SectionTitle({ view }: { view: AppView }) {
  const titles: Record<Exclude<AppView, "search">, string> = {
    profile: "Мой профиль",
    collection: "Мои события",
    friends: "Мои друзья",
    settings: "Настройки",
  };

  if (view === "search") return null;

  return <h1 className="text-2xl font-bold tracking-tight">{titles[view]}</h1>;
}

function MenuNavItem({
  icon: Icon,
  title,
  href,
  onClick,
}: {
  icon: typeof Search;
  title: string;
  href?: string;
  onClick: () => void;
}) {
  const className =
    "flex w-full items-center gap-3 py-4 text-left text-base font-medium transition hover:text-primary";

  return (
    <li>
      {href ? (
        <Link href={href} className={className} onClick={onClick}>
          <Icon className="size-5 shrink-0 text-primary" />
          {title}
        </Link>
      ) : (
        <button type="button" className={className} onClick={onClick}>
          <Icon className="size-5 shrink-0 text-primary" />
          {title}
        </button>
      )}
    </li>
  );
}

function ProfileView({
  savedCount,
  joinedCount,
}: {
  savedCount: number;
  joinedCount: number;
}) {
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="dvig-panel p-5">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="text-lg">А</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold">Алина</h2>
            <p className="mt-1 text-sm text-muted-foreground">Санкт-Петербург · профиль проверяется</p>
          </div>
        </div>
        <p className="mt-5 text-sm leading-6 text-muted-foreground">
          Здесь видно, как вы выглядите для других участников: интересы, верификация и
          статус заявок. Управление приватностью и цифровым следом — в настройках.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {["кино", "настолки", "культура", "спокойные встречи"].map((tag) => (
            <Badge key={tag} variant="outline" className="rounded-md">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Metric label="Заявки" value={joinedCount} />
        <Metric label="Сохранено" value={savedCount} />
        <div className="dvig-panel-muted p-4 text-sm leading-6 text-muted-foreground">
          Верификация откроет встречи один на один и отметку «проверенный профиль».
        </div>
      </div>
    </div>
  );
}

function FriendsPanel() {
  const friends = [
    { name: "Маша", status: "идёт на «Вечер настолок»" },
    { name: "Илья", status: "сохранил «Лекцию в Эрарте»" },
    { name: "Катя", status: "свободна в выходные" },
  ];

  return (
    <div className="mt-5 space-y-4">
      <div className="dvig-panel p-5">
        <h2 className="text-xl font-semibold">Мои друзья</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Список друзей и их планы на встречи. В демо — мок, в продукте здесь будут
          приглашения и совместные подборки.
        </p>
      </div>
      {friends.map((friend) => (
        <div key={friend.name} className="flex items-center gap-3 dvig-panel p-4">
          <Avatar>
            <AvatarFallback>{friend.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{friend.name}</p>
            <p className="text-sm text-muted-foreground">{friend.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function EventGrid({
  events: items,
  loading,
  error,
  saved,
  joined,
  onOpen,
  onSave,
  onJoin,
  onRetry,
}: {
  events: DvigEvent[];
  loading: boolean;
  error: string | null;
  saved: string[];
  joined: string[];
  onOpen: (event: DvigEvent) => void;
  onSave: (event: DvigEvent) => void;
  onJoin: (eventId: string) => void;
  onRetry: () => void;
}) {
  if (loading && items.length === 0) {
    return (
      <div className="mt-5 dvig-panel p-8 text-center">
        <p className="text-lg font-medium">Загружаем афишу…</p>
        <p className="mt-2 text-sm text-muted-foreground">Источник: KudaGo, Санкт-Петербург</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-5 dvig-panel p-8 text-center">
        <p className="text-lg font-medium">Не удалось загрузить события</p>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <Button className="dvig-btn-primary mt-4 rounded-lg" onClick={onRetry}>
          Повторить
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-5 dvig-panel p-8 text-center">
        <p className="text-lg font-medium">Нет встреч под такие фильтры.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Измените поиск, дату или нажмите «Сбросить всё» в фильтрах.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-4 xl:grid-cols-2">
      {items.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          isSaved={saved.includes(event.id)}
          isJoined={joined.includes(event.id)}
          onOpen={() => onOpen(event)}
          onSave={() => onSave(event)}
          onJoin={() => onJoin(event.id)}
        />
      ))}
    </div>
  );
}

function EventSheet({
  event,
  isSaved,
  isJoined,
  onClose,
  onSave,
  onJoin,
  onExportJson,
  onExportCsv,
}: {
  event: DvigEvent | null;
  isSaved: boolean;
  isJoined: boolean;
  onClose: () => void;
  onSave: (event: DvigEvent) => void;
  onJoin: (eventId: string) => void;
  onExportJson: (event: DvigEvent) => void;
  onExportCsv: (event: DvigEvent) => void;
}) {
  return (
    <Sheet open={Boolean(event)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {event && (
          <>
            <SheetHeader>
              <Badge className="mb-2 w-fit rounded-md bg-[#e6efe9] text-primary hover:bg-[#e6efe9]">
                {event.category}
              </Badge>
              <SheetTitle className="text-2xl">{event.title}</SheetTitle>
              <SheetDescription>{event.short}</SheetDescription>
            </SheetHeader>
            <div className="space-y-5 px-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Дата" value={`${event.date}, ${event.time}`} />
                <Info label="Цена" value={event.price} />
                <Info label="Участники" value={`${event.participants} уже идут`} />
                <Info label="Возраст" value={event.ageRestriction} />
              </div>
              <Separator />
              <div>
                <div className="mb-2 flex items-center gap-2 font-medium">
                  <InfoIcon className="size-4 text-primary" />
                  Подробная карточка
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{event.description}</p>
                <p className="mt-2 text-xs text-muted-foreground/80">
                  Источник: {event.source} · обновлено {event.updatedAt}
                </p>
              </div>
              <div className="dvig-panel-muted p-4">
                <div className="mb-3 flex items-center gap-2 font-medium">
                  <Sparkles className="size-4 text-primary" />
                  ИИ-резюме
                </div>
                <div className="grid gap-3 text-sm leading-6 text-muted-foreground">
                  <SummaryItem label="Почему стоит пойти" value={event.aiSummary.why} />
                  <SummaryItem label="Атмосфера" value={event.aiSummary.vibe} />
                  <SummaryItem label="Кому подойдет" value={event.aiSummary.audience} />
                </div>
              </div>
              <div>
                <div className="mb-3 flex items-center gap-2 font-medium">
                  <Table2 className="size-4 text-primary" />
                  Цены и даты
                </div>
                <div className="overflow-hidden rounded-md border border-border/50">
                  {event.priceOptions.map((option) => (
                    <div
                      key={`${option.date}-${option.time}`}
                      className="grid grid-cols-[1fr_0.8fr_0.8fr] gap-3 dvig-header p-3 text-sm last:border-b-0"
                    >
                      <span>{option.date}</span>
                      <span>{option.time}</span>
                      <span className="font-medium">{option.price}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="dvig-panel-muted p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{event.moderator.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Модератор: {event.moderator}</p>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="size-4 fill-amber-400 text-amber-400" />
                      рейтинг {event.rating}
                    </p>
                  </div>
                </div>
              </div>
              <div className="dvig-panel p-4">
                <div className="mb-3 flex items-center gap-2 font-medium">
                  <ShieldCheck className="size-4 text-primary" />
                  Безопасность встречи
                </div>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    публичное место: {event.place}
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    модератор видит заявки до подтверждения
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    можно выйти из встречи и скрыть профиль от участников
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="rounded-md">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4" />
                {event.place}, {event.address}
              </div>
            </div>
            <SheetFooter className="flex-col gap-2 sm:flex-col">
              <Button
                className="dvig-btn-primary w-full rounded-lg"
                onClick={() => onJoin(event.id)}
              >
                {isJoined ? (
                  <>
                    <Check className="size-4" />
                    Заявка отправлена
                  </>
                ) : (
                  "Подать заявку"
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-md"
                onClick={() => onSave(event)}
              >
                {isSaved ? "Убрать из подборки" : "Сохранить в подборку"}
              </Button>
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-md"
                  onClick={() => onExportJson(event)}
                >
                  <Download className="size-4" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-md"
                  onClick={() => onExportCsv(event)}
                >
                  <Download className="size-4" />
                  CSV
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function EventCard({
  event,
  isSaved,
  isJoined,
  onOpen,
  onSave,
  onJoin,
}: {
  event: DvigEvent;
  isSaved: boolean;
  isJoined: boolean;
  onOpen: () => void;
  onSave: () => void;
  onJoin: () => void;
}) {
  const cardStyle = event.imageUrl
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(10, 6, 18, 0.72) 0%, rgba(10, 6, 18, 0.92) 100%), url(${event.imageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  const socialLine =
    event.source === "KudaGo"
      ? `♥ ${event.popularityScore} · 💬 ${event.commentsCount ?? 0}`
      : `${event.participants} идут · ${event.spotsLeft} мест`;

  return (
    <Card
      className="overflow-hidden rounded-md border-border/50 shadow-none"
      style={cardStyle}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Badge className="rounded-md bg-[#e6efe9] text-primary hover:bg-[#e6efe9]">
              {event.category}
            </Badge>
            <CardTitle className="text-xl">{event.title}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="rounded-md" onClick={onSave}>
            <Heart className={isSaved ? "size-4 fill-brand-magenta text-brand-magenta" : "size-4"} />
            <span className="sr-only">Сохранить</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">{event.short}</p>
        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4" />
            {event.date}, {event.time}
          </span>
          <span className="flex items-center gap-2">
            <UsersRound className="size-4" />
            {socialLine}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="size-4" />
            {event.place}
          </span>
          <span className="flex items-center gap-2">
            <Sparkles className="size-4" />
            ИИ-резюме готово
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="dvig-btn-primary rounded-lg" onClick={onJoin}>
            {isJoined ? (
              <>
                <Check className="size-4" />
                Заявка отправлена
              </>
            ) : (
              "Подать заявку"
            )}
          </Button>
          <Button variant="outline" className="rounded-md" onClick={onOpen}>
            Подробнее
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function CollectionPanel({
  savedEvents,
  digest,
  copyState,
  exportEvents,
  onCopy,
  onOpen,
  onRemove,
  onExportJson,
  onExportCsv,
}: {
  savedEvents: DvigEvent[];
  digest: string;
  copyState: string;
  exportEvents: DvigEvent[];
  onCopy: () => void;
  onOpen: (event: DvigEvent) => void;
  onRemove: (event: DvigEvent) => void;
  onExportJson: () => void;
  onExportCsv: () => void;
}) {
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_420px]">
      <div className="space-y-4">
        {savedEvents.length === 0 ? (
          <div className="dvig-panel p-8">
            <h3 className="text-xl font-semibold">Подборка пустая</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Нажмите сердечко у события, чтобы собрать дайджест для друзей или Telegram-чата.
            </p>
          </div>
        ) : (
          savedEvents.map((event) => (
            <div key={event.id} className="dvig-panel p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <Badge className="rounded-md bg-[#e6efe9] text-primary hover:bg-[#e6efe9]">
                    {event.category}
                  </Badge>
                  <h3 className="mt-2 text-lg font-semibold">{event.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{event.date}, {event.time} · {event.place}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-md" onClick={() => onOpen(event)}>
                    Открыть
                  </Button>
                  <Button variant="ghost" className="rounded-md" onClick={() => onRemove(event)}>
                    Убрать
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="h-fit dvig-panel p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold">Telegram preview</h3>
          <Button className="dvig-btn-primary rounded-lg" onClick={onCopy}>
            <Clipboard className="size-4" />
            {copyState}
          </Button>
        </div>
        <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-lg bg-muted/40 p-4 text-sm leading-6 text-foreground/90">
          {digest}
        </pre>
      </div>
      <div className="lg:col-span-2 dvig-panel p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Экспорт подборки</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {savedEvents.length > 0
                ? "Скачайте сохранённые события в JSON или CSV."
                : "Подборка пустая — экспортируются события из текущего поиска на главной."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="dvig-btn-primary rounded-lg" onClick={onExportJson}>
              <Download className="size-4" />
              JSON
            </Button>
            <Button variant="outline" className="rounded-md" onClick={onExportCsv}>
              <Download className="size-4" />
              CSV
            </Button>
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-border/50">
          {exportEvents.slice(0, 5).map((event) => (
            <div
              key={event.id}
              className="grid gap-2 border-b border-border/50 p-3 text-sm last:border-b-0 md:grid-cols-[1fr_120px_120px_100px]"
            >
              <span className="font-medium">{event.title}</span>
              <span>{event.category}</span>
              <span>{event.date}</span>
              <span>{event.price}</span>
            </div>
          ))}
          {exportEvents.length > 5 && (
            <p className="p-3 text-sm text-muted-foreground">
              и ещё {exportEvents.length - 5} событий…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({ joinedCount }: { joinedCount: number }) {
  return (
    <div className="mt-5 space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold">Приложение</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Город", "Санкт-Петербург", "В следующем этапе здесь будет выбор города и источник афиши."],
            ["ИИ-резюме", "Демо-режим", "Сейчас текст локальный. Реальные OpenAI/GigaChat ключи должны жить только на сервере."],
            ["Telegram", "Копирование", "Реальная отправка будет server-side, чтобы не раскрывать токен бота в браузере."],
            ["Данные", "KudaGo", "Афиша подгружается из KudaGo API (СПб). Кэш ответов на сервере ~5 минут."],
          ].map(([title, value, text]) => (
            <div key={title} className="dvig-panel p-4">
              <span className="text-sm text-muted-foreground/80">{title}</span>
              <h3 className="mt-1 text-lg font-semibold">{value}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-lg font-semibold">Безопасность</h2>
        <SafetyPanel joinedCount={joinedCount} embedded />
      </section>
      <section>
        <h2 className="mb-4 text-lg font-semibold">Профиль и цифровой след</h2>
        <ProfilePanel embedded />
      </section>
    </div>
  );
}

function SafetyPanel({
  joinedCount,
  embedded = false,
}: {
  joinedCount: number;
  embedded?: boolean;
}) {
  const [panicState, setPanicState] = useState("Не активирована");
  const [checkInState, setCheckInState] = useState("Ожидает встречи");
  const [trustedContact, setTrustedContact] = useState("Алина, +7 900 000-00-00");

  return (
    <div className={embedded ? "grid gap-4 lg:grid-cols-[1fr_420px]" : "mt-5 grid gap-4 lg:grid-cols-[1fr_420px]"}>
      <div className="space-y-4">
        <div className="dvig-panel p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 size-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold">Контур безопасности офлайн-встречи</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Мок показывает, какие реальные инструменты должны появиться до запуска
                встреч один на один или малых групп: верификация, тревожная кнопка,
                чек-ин, доверенный контакт, жалоба и выход из встречи.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SafetyCard
            icon={UserCheck}
            title="Верификация"
            status="Паспорт/студенческий: mock approved"
            text="Профиль получает отметку только после проверки документа или учебной почты. До проверки нельзя создавать встречи один на один."
          />
          <SafetyCard
            icon={MapPin}
            title="Публичная точка"
            status="Обязательное условие"
            text="Встречи стартуют только в публичных местах: площадка, кафе, кинотеатр, музей, антикафе, спортивная студия."
          />
          <SafetyCard
            icon={BellRing}
            title="Тревожная кнопка"
            status={panicState}
            text="В реальной версии отправляет геопозицию, событие и контакт модератору/доверенному лицу. В демо меняет состояние."
            action="Активировать"
            onAction={() => setPanicState("Сигнал отправлен модератору и доверенному контакту")}
          />
          <SafetyCard
            icon={TriangleAlert}
            title="Жалоба и блокировка"
            status="Доступно после заявки"
            text="Пользователь может пожаловаться на участника, скрыть свой профиль и запретить повторный мэтч."
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="dvig-panel p-5">
          <h3 className="font-semibold">Мой safety-чеклист</h3>
          <div className="mt-4 space-y-3 text-sm">
            <SafetyRow label="Активные заявки" value={`${joinedCount}`} />
            <SafetyRow label="Доверенный контакт" value={trustedContact} />
            <SafetyRow label="Чек-ин" value={checkInState} />
            <SafetyRow label="Страхование" value="MVP: не подключено, в плане партнерская опция" />
          </div>
          <div className="mt-4 grid gap-2">
            <Input
              value={trustedContact}
              onChange={(event) => setTrustedContact(event.target.value)}
              className="rounded-md"
              aria-label="Доверенный контакт"
            />
            <Button
              className="dvig-btn-primary rounded-lg"
              onClick={() => setCheckInState("Я на месте · 18 мая, 19:04")}
            >
              <Check className="size-4" />
              Отметиться на месте
            </Button>
            <Button variant="outline" className="rounded-md" onClick={() => setCheckInState("Вышла из встречи")}>
              <LogOut className="size-4" />
              Выйти из встречи
            </Button>
          </div>
        </div>

        <div className="rounded-md border border-border/50 bg-[#fff7ed] p-5">
          <h3 className="font-semibold">Ограничение MVP</h3>
          <p className="mt-2 text-sm leading-6 text-accent-foreground">
            Это демонстрационный интерфейс. До реального запуска нужны юридическая
            политика, обработка тревожных сигналов, модераторские регламенты и
            понятное согласие на обработку геоданных.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfilePanel({ embedded = false }: { embedded?: boolean }) {
  const [visibility, setVisibility] = useState("Профиль виден только подтвержденным участникам встреч");
  const [exportState, setExportState] = useState("Архив не запрошен");
  const [deleteState, setDeleteState] = useState("Профиль активен");

  return (
    <div className={embedded ? "grid gap-4 lg:grid-cols-[1fr_420px]" : "mt-5 grid gap-4 lg:grid-cols-[1fr_420px]"}>
      <div className="dvig-panel p-5">
        <h3 className="text-xl font-semibold">Профиль и цифровой след</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Пользователь должен понимать, какие данные остаются после заявок, чатов,
          жалоб и выходов из встреч. В демо это показано как сценарии управления
          данными.
        </p>
        <div className="mt-5 grid gap-3">
          <TraceItem title="Профиль" value="имя, возраст, интересы, верификация, аватар" />
          <TraceItem title="События" value="сохраненные карточки, заявки, чек-ины и отмены" />
          <TraceItem title="Безопасность" value="жалобы, блокировки, тревожные события и модераторские решения" />
          <TraceItem title="Аналитика" value="обезличенные категории спроса для улучшения рекомендаций" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="dvig-panel p-5">
          <h3 className="font-semibold">Управление аккаунтом</h3>
          <div className="mt-4 space-y-3 text-sm">
            <SafetyRow label="Видимость" value={visibility} />
            <SafetyRow label="Экспорт данных" value={exportState} />
            <SafetyRow label="Удаление" value={deleteState} />
          </div>
          <div className="mt-4 grid gap-2">
            <Button
              variant="outline"
              className="rounded-md"
              onClick={() => setVisibility("Профиль скрыт от новых подборок и поиска")}
            >
              <EyeOff className="size-4" />
              Скрыть профиль
            </Button>
            <Button
              variant="outline"
              className="rounded-md"
              onClick={() => setExportState("Архив готовится: профиль, заявки, события, жалобы")}
            >
              <FileText className="size-4" />
              Запросить архив данных
            </Button>
            <Button
              className="rounded-lg bg-destructive text-white hover:bg-destructive/90"
              onClick={() => setDeleteState("Запрос на удаление создан · 30 дней на отмену")}
            >
              <Trash2 className="size-4" />
              Удалить профиль
            </Button>
          </div>
        </div>

        <div className="dvig-panel-muted p-5">
          <h3 className="font-semibold">Что останется после удаления</h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            <li>личный профиль, фото, интересы и контакты удаляются;</li>
            <li>заявки и чаты обезличиваются для истории модерации;</li>
            <li>жалобы и safety-события хранятся ограниченный срок;</li>
            <li>партнерская аналитика остается только в агрегированном виде.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function SafetyCard({
  icon: Icon,
  title,
  status,
  text,
  action,
  onAction,
}: {
  icon: typeof Search;
  title: string;
  status: string;
  text: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="dvig-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <Icon className="size-5 text-primary" />
        <Badge variant="outline" className="rounded-md text-right">
          {status}
        </Badge>
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
      {action && onAction && (
        <Button variant="outline" className="mt-3 rounded-md" onClick={onAction}>
          {action}
        </Button>
      )}
    </div>
  );
}

function SafetyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="dvig-panel-muted p-3">
      <span className="text-xs text-muted-foreground/80">{label}</span>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function TraceItem({ title, value }: { title: string; value: string }) {
  return (
    <div className="dvig-panel-muted p-4">
      <h4 className="font-semibold">{title}</h4>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="dvig-panel-muted p-3">
      <span className="text-muted-foreground/80">{label}</span>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="dvig-panel p-3">
      <span className="text-xs text-muted-foreground/80">{label}</span>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-medium uppercase tracking-wide text-primary">{label}</span>
      <p className="mt-1">{value}</p>
    </div>
  );
}
