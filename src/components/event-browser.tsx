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
import { GroupSocialPanel } from "@/components/group-social-panel";
import { OnboardingDialog } from "@/components/onboarding-dialog";
import { AuthPanel } from "@/components/auth-panel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { usePilotData, type MyGroupWithPending } from "@/hooks/use-pilot-data";
import type { ApiUser } from "@/lib/api-client";
import {
  submitCheckIn,
  submitFeedback,
  submitReport,
  trackEvent,
  updateProfile,
} from "@/lib/api-client";
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
import type { ApplicationSummary, GroupSummary } from "@/lib/groups";

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

function formatGroupLine(event: DvigEvent) {
  return `В группе ${event.participants} · свободно ${event.spotsLeft} · до ${event.groupCapacity} человек`;
}

function mockParticipantInitials(eventId: string): string[] {
  const hash = eventId.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const names = ["А", "М", "И", "К", "С", "Д"];
  return [names[hash % names.length], names[(hash + 3) % names.length], names[(hash + 5) % names.length]];
}

export function EventBrowser() {
  const {
    user,
    setUser,
    authLoading,
    applications,
    myGroups,
    mergeEvents,
    groupsForEvent,
    submitApplication,
    submitApplicationToGroup,
    createGroupForEvent,
    approveApplication,
    isJoined,
    userOwnsGroupForEvent,
    refreshSocial,
  } = usePilotData();

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
  const [copyState, setCopyState] = useState("Скопировать для Telegram");
  const [onlySpotsLeft, setOnlySpotsLeft] = useState(false);
  const [joinNotice, setJoinNotice] = useState<string | null>(null);

  useEffect(() => {
    void trackEvent("page_view", { page: "app" });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedCategory = params.get("category");
    const requestedView = params.get("view");

    if (categoryFilters.includes(requestedCategory as EventCategory)) {
      setSelectedCategories([requestedCategory as EventCategory]);
    }
    if (requestedView === "settings") {
      setView("settings");
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
          setEvents(mergeEvents(result.events));
          setFetchError(null);
        }
        setLoading(false);
      })();
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [selectedCategories, extraCategorySlugs, selectedDates, customDateRange, query, mergeEvents]);

  const enrichedEvents = useMemo(() => mergeEvents(events), [events, mergeEvents]);

  const filteredEvents = useMemo(() => {
    const matched = enrichedEvents.filter((event) => {
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
      const spotsMatch = !onlySpotsLeft || event.spotsLeft > 0;

      return categoryMatch && dateMatch && moodMatch && spotsMatch;
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
    enrichedEvents,
    extraCategorySlugs,
    selectedCategories,
    selectedDates,
    selectedMoods,
    onlySpotsLeft,
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

  const handleQuickJoin = async (event: DvigEvent) => {
    if (isJoined(event)) {
      setJoinNotice("Заявка уже отправлена. Статус — в профиле.");
      window.setTimeout(() => setJoinNotice(null), 4500);
      return;
    }

    const openGroups = (event.availableGroups ?? []).filter(
      (group) => group.status === "OPEN" && group.spotsLeft > 0
    );

    if (openGroups.length === 0) {
      setSelected(event);
      return;
    }

    if (openGroups.length > 1) {
      setSelected(event);
      return;
    }

    try {
      await submitApplicationToGroup(openGroups[0].id, event.kudagoId);
      setJoinNotice("Заявка отправлена. Организатор рассмотрит её.");
      window.setTimeout(() => setJoinNotice(null), 5000);
      void refreshSocial();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Не удалось отправить заявку";
      setJoinNotice(message);
      window.setTimeout(() => setJoinNotice(null), 5000);
      if (message.includes("Войдите")) {
        setView("profile");
      }
    }
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
      <SiteHeader trailing={<AppMenu onNavigate={setView} />} />

      <div
        className="sticky top-0 z-30 border-b border-primary/20 bg-[#1a1028]/95 px-4 py-2.5 text-center text-sm backdrop-blur-md sm:px-6"
        role="status"
      >
        Пилот B2C · СПб. Афиша KudaGo + реальные группы и заявки. Безопасность и модерация — по регламенту пилота.
      </div>

      {user && <OnboardingDialog user={user} onComplete={setUser} />}

      {joinNotice && (
        <div className="mx-auto max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
          <p className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-center text-sm">
            {joinNotice}
          </p>
        </div>
      )}

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
              onlySpotsLeft={onlySpotsLeft}
              onOnlySpotsLeftChange={setOnlySpotsLeft}
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
              isJoined={isJoined}
              onOpen={setSelected}
              onSave={toggleSaved}
              onJoin={handleQuickJoin}
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
                    setEvents(mergeEvents(result.events));
                    setFetchError(null);
                  }
                  setLoading(false);
                });
              }}
            />
          )}

          {view === "profile" && (
            <ProfileView
              user={user}
              authLoading={authLoading}
              savedCount={saved.length}
              applications={applications}
              myGroups={myGroups}
              onUserChange={setUser}
              onApproveApplication={(id, status) => void approveApplication(id, status)}
            />
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

          {view === "settings" && (
            <SettingsPanel applications={applications} user={user} onUserChange={setUser} />
          )}
        </div>
      </section>

      <EventSheet
        event={selected}
        user={user}
        isSaved={selected ? saved.includes(selected.id) : false}
        isJoined={selected ? isJoined(selected) : false}
        groups={selected ? groupsForEvent(selected.kudagoId) : []}
        userOwnsGroup={selected ? userOwnsGroupForEvent(selected.kudagoId) : false}
        onClose={() => setSelected(null)}
        onSave={(event) => toggleSaved(event)}
        onJoinGroup={async (groupId) => {
          if (!selected) return;
          await submitApplicationToGroup(groupId, selected.kudagoId);
          setJoinNotice("Заявка отправлена. Организатор рассмотрит её.");
          window.setTimeout(() => setJoinNotice(null), 5000);
          void refreshSocial();
        }}
        onCreateGroup={async (input) => {
          if (!selected) return;
          await createGroupForEvent(selected, input);
          setJoinNotice("Группа создана. Вы — организатор и уже в группе.");
          window.setTimeout(() => setJoinNotice(null), 5000);
          void refreshSocial();
        }}
        onRequireAuth={() => setView("profile")}
        onExportJson={(event) =>
          downloadFile([event], "json", `dvig-${event.id}`)
        }
        onExportCsv={(event) => downloadFile([event], "csv", `dvig-${event.id}`)}
      />

      <SiteFooter />
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
  onlySpotsLeft,
  onOnlySpotsLeftChange,
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
  onlySpotsLeft: boolean;
  onOnlySpotsLeftChange: (value: boolean) => void;
}) {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const activeFilterCount = countActiveFilters(
    selectedCategories,
    extraCategorySlugs,
    selectedDates,
    selectedMoods,
    customDateRange,
    onlySpotsLeft
  );
  const hasQuery = query.trim().length > 0;
  const hasActiveChips = activeFilterCount > 0 || hasQuery;

  const resetFilters = () => {
    onSelectedCategoriesChange([]);
    onExtraCategorySlugsChange([]);
    onSelectedDatesChange([]);
    onCustomDateRangeChange(null);
    onSelectedMoodsChange([]);
    onOnlySpotsLeftChange(false);
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

          <FilterGroup label="Группа">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={onlySpotsLeft}
                onChange={(event) => onOnlySpotsLeftChange(event.target.checked)}
                className="size-4 rounded border-border accent-primary"
              />
              Есть свободные места в группе
            </label>
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
          {onlySpotsLeft && (
            <ActiveFilterChip
              label="Есть места в группе"
              onRemove={() => onOnlySpotsLeftChange(false)}
            />
          )}
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
  user,
  authLoading,
  savedCount,
  applications,
  myGroups,
  onUserChange,
  onApproveApplication,
}: {
  user: ApiUser | null;
  authLoading: boolean;
  savedCount: number;
  applications: ApplicationSummary[];
  myGroups: MyGroupWithPending[];
  onUserChange: (user: ApiUser | null) => void;
  onApproveApplication: (applicationId: string, status: "APPROVED" | "REJECTED") => void;
}) {
  const activeApplications = applications.filter(
    (app) => app.status === "PENDING" || app.status === "APPROVED"
  );

  if (authLoading) {
    return <div className="dvig-panel mt-5 p-8 text-center text-muted-foreground">Загрузка профиля…</div>;
  }

  if (!user) {
    return (
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="dvig-panel p-5">
          <h2 className="text-xl font-semibold">Вход для пилота</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Чтобы подать заявку в группу, создайте аккаунт. Формат пилота — группы 5–7 в публичном месте.
          </p>
        </div>
        <AuthPanel onUserChange={onUserChange} />
      </div>
    );
  }

  const initials = (user.profile?.displayName ?? user.email).slice(0, 1).toUpperCase();

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="dvig-panel p-5">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold">{user.profile?.displayName ?? "Участник"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {user.profile?.city ?? "Санкт-Петербург"} · {user.email}
            </p>
          </div>
        </div>
        <p className="mt-5 text-sm leading-6 text-muted-foreground">
          Профиль видят модератор при рассмотрении заявки и одобренные участники группы.
          На первом этапе — встречи в группе от 5 человек, не 1-на-1.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {(user.profile?.interests ?? []).map((tag) => (
            <Badge key={tag} variant="outline" className="rounded-md">
              {tag}
            </Badge>
          ))}
        </div>
        {activeApplications.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="font-semibold">Мои заявки</h3>
            {activeApplications.map((app) => (
              <div key={app.id} className="dvig-panel-muted rounded-md p-3 text-sm">
                <p className="font-medium">{app.eventTitle}</p>
                <p className="text-muted-foreground">Статус: {app.status}</p>
                {app.status === "APPROVED" && app.meetingPoint && (
                  <p className="mt-1">Точка встречи: {app.meetingPoint}</p>
                )}
                {app.status === "APPROVED" && app.telegramLink && (
                  <a href={app.telegramLink} className="mt-1 inline-block text-primary hover:underline">
                    Чат группы в Telegram
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
        {myGroups.some((group) => group.pendingApplications.length > 0) && (
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold">Заявки в мои группы</h3>
            {myGroups.map((group) =>
              group.pendingApplications.map((app) => (
                <div key={app.id} className="dvig-panel-muted rounded-md p-3 text-sm">
                  <p className="font-medium">{group.eventTitle}</p>
                  <p>
                    {app.user.displayName} · {app.user.email}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      className="rounded-md"
                      onClick={() => onApproveApplication(app.id, "APPROVED")}
                    >
                      Одобрить
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-md"
                      onClick={() => onApproveApplication(app.id, "REJECTED")}
                    >
                      Отклонить
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {(user.role === "MODERATOR" || user.role === "ADMIN") && (
          <Link href="/admin" className="mt-4 inline-flex text-sm text-primary hover:underline">
            Панель модератора →
          </Link>
        )}
      </div>
      <div className="space-y-3">
        <Metric label="Заявки" value={activeApplications.length} />
        <Metric label="Сохранено" value={savedCount} />
        <AuthPanel onUserChange={onUserChange} compact />
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
          Список друзей и их планы на встречи. В демо — мок; в продукте — социальный граф:
          кто идёт на то же событие, приглашения и совместные подборки.
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
  isJoined,
  onOpen,
  onSave,
  onJoin,
  onRetry,
}: {
  events: DvigEvent[];
  loading: boolean;
  error: string | null;
  saved: string[];
  isJoined: (event: DvigEvent) => boolean;
  onOpen: (event: DvigEvent) => void;
  onSave: (event: DvigEvent) => void;
  onJoin: (event: DvigEvent) => void;
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
          isJoined={isJoined(event)}
          onOpen={() => onOpen(event)}
          onSave={() => onSave(event)}
          onJoin={() => onJoin(event)}
        />
      ))}
    </div>
  );
}

function EventSheet({
  event,
  user,
  isSaved,
  isJoined,
  groups,
  userOwnsGroup,
  onClose,
  onSave,
  onJoinGroup,
  onCreateGroup,
  onRequireAuth,
  onExportJson,
  onExportCsv,
}: {
  event: DvigEvent | null;
  user: ApiUser | null;
  isSaved: boolean;
  isJoined: boolean;
  groups: GroupSummary[];
  userOwnsGroup: boolean;
  onClose: () => void;
  onSave: (event: DvigEvent) => void;
  onJoinGroup: (groupId: string) => Promise<void>;
  onCreateGroup: (input: {
    meetingPoint?: string;
    telegramLink?: string;
    capacity?: number;
  }) => Promise<void>;
  onRequireAuth: () => void;
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
                <Info label="Группа" value={formatGroupLine(event)} />
                <Info label="Возраст" value={event.ageRestriction} />
              </div>
              <Separator />
              <div>
                <div className="mb-2 flex items-center gap-2 font-medium">
                  <InfoIcon className="size-4 text-primary" />
                  Подробная карточка
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{event.description}</p>
              </div>
              <div className="dvig-panel p-4">
                <div className="mb-2 font-medium">Источник</div>
                <p className="text-sm text-muted-foreground">
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {event.source}
                  </a>
                  {" · "}
                  данные от {event.updatedAt}
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Проверьте время, цену и адрес на сайте организатора — агрегатор не
                  гарантирует актуальность.
                </p>
              </div>
              <div className="dvig-panel-muted p-4">
                <div className="mb-1 flex items-center gap-2 font-medium">
                  <Sparkles className="size-4 text-primary" />
                  Кратко о событии
                </div>
                <p className="mb-3 text-xs text-muted-foreground">
                  По описанию организатора / KudaGo, не нейросеть
                </p>
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
                <div className="mb-3 flex items-center gap-2">
                  {mockParticipantInitials(event.id).map((initial) => (
                    <Avatar key={initial} className="size-9 border border-border/50">
                      <AvatarFallback className="text-xs">{initial}</AvatarFallback>
                    </Avatar>
                  ))}
                  <Badge variant="outline" className="rounded-md text-xs">
                    участники · демо
                  </Badge>
                </div>
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
                    группа от {event.groupCapacity} человек — не 1-на-1 на первом этапе
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    модератор видит заявки до подтверждения (в продукте)
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
              <GroupSocialPanel
                event={event}
                user={user}
                groups={groups}
                userOwnsGroup={userOwnsGroup}
                onJoinGroup={onJoinGroup}
                onCreateGroup={onCreateGroup}
                onRequireAuth={onRequireAuth}
              />
            </div>
            <SheetFooter className="flex-col gap-2 sm:flex-col">
              {isJoined && (
                <div className="w-full rounded-md border border-primary/30 bg-primary/10 px-4 py-2 text-center text-sm">
                  {event.applicationStatus === "APPROVED" ? "Вы в группе" : "Заявка отправлена"}
                </div>
              )}
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

  const groupLine = formatGroupLine(event);
  const kudagoEngagement = `♥ ${event.popularityScore} · 💬 ${event.commentsCount ?? 0}`;
  const canQuickJoin =
    !isJoined &&
    event.hasRealGroup &&
    (event.groupsCount ?? 0) === 1 &&
    (event.availableGroups ?? []).some((group) => group.status === "OPEN" && group.spotsLeft > 0);

  const handlePrimaryAction = () => {
    if (canQuickJoin) {
      onJoin();
      return;
    }
    onOpen();
  };

  return (
    <Card
      className="overflow-hidden rounded-md border-border/50 shadow-none"
      style={cardStyle}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge className="rounded-md bg-[#e6efe9] text-primary hover:bg-[#e6efe9]">
                {event.category}
              </Badge>
              {event.address ? (
                <Badge variant="outline" className="rounded-md">
                  Публичное место
                </Badge>
              ) : null}
            </div>
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
          <span className="flex items-center gap-2 sm:col-span-2">
            <UsersRound className="size-4 shrink-0" />
            {groupLine}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="size-4" />
            {event.place}
          </span>
          <span className="flex items-center gap-2 text-xs">
            <Sparkles className="size-4" />
            Кратко о событии · {kudagoEngagement}
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="dvig-btn-primary rounded-lg" onClick={handlePrimaryAction}>
            {isJoined
              ? event.applicationStatus === "APPROVED"
                ? "Вы в группе"
                : "Заявка отправлена"
              : event.hasRealGroup
                ? event.groupsCount && event.groupsCount > 1
                  ? "Выбрать группу"
                  : "Присоединиться"
                : "Создать / вступить"}
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

function SettingsPanel({
  applications,
  user,
  onUserChange,
}: {
  applications: ApplicationSummary[];
  user: ApiUser | null;
  onUserChange: (user: ApiUser | null) => void;
}) {
  const activeCount = applications.filter((a) => a.status === "PENDING" || a.status === "APPROVED").length;

  return (
    <div className="mt-5 space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold">Приложение</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Город", "Санкт-Петербург", "Пилот ограничен СПб и афишей KudaGo."],
            ["Краткое описание", "Локальный текст", "Усечение описания KudaGo — не LLM."],
            ["Telegram", "Уведомления", "Одобрение заявки и эскалация safety — через бота модератора."],
            ["Данные / KudaGo", "Афиша API", "События из KudaGo, кэш ~5 минут."],
            ["Социальный слой", "Пилот", "Реальные группы, заявки и модерация в базе данных."],
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
        <SafetyPanel applications={applications} user={user} onUserChange={onUserChange} embedded />
      </section>
      <section>
        <h2 className="mb-4 text-lg font-semibold">Профиль и цифровой след</h2>
        <ProfilePanel user={user} activeApplications={activeCount} embedded />
      </section>
    </div>
  );
}

function SafetyPanel({
  applications,
  user,
  onUserChange,
  embedded = false,
}: {
  applications: ApplicationSummary[];
  user: ApiUser | null;
  onUserChange: (user: ApiUser | null) => void;
  embedded?: boolean;
}) {
  const approvedApp = applications.find((app) => app.status === "APPROVED");
  const [panicState, setPanicState] = useState("Не активирована");
  const [checkInState, setCheckInState] = useState("Ожидает встречи");
  const [trustedContact, setTrustedContact] = useState(user?.profile?.trustedContact ?? "");
  const [feedbackRating, setFeedbackRating] = useState(4);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackState, setFeedbackState] = useState<string | null>(null);

  useEffect(() => {
    setTrustedContact(user?.profile?.trustedContact ?? "");
  }, [user?.profile?.trustedContact]);

  const saveTrustedContact = async () => {
    if (!user) return;
    const { user: next } = await updateProfile({ trustedContact: trustedContact || null });
    onUserChange(next);
  };

  const handleCheckIn = async (status: "checked_in" | "left") => {
    if (!approvedApp) {
      setCheckInState("Нужна одобренная заявка");
      return;
    }
    await submitCheckIn(approvedApp.groupId, status);
    setCheckInState(status === "checked_in" ? "Я на месте" : "Вышел(а) из встречи");
  };

  const handlePanic = async () => {
    if (!user) {
      setPanicState("Войдите в аккаунт");
      return;
    }
    await submitReport({
      type: "PANIC",
      groupId: approvedApp?.groupId,
    });
    setPanicState("Сигнал отправлен модератору");
  };

  const handleComplaint = async () => {
    if (!user) return;
    await submitReport({
      type: "COMPLAINT",
      groupId: approvedApp?.groupId,
      message: "Жалоба из пилота",
    });
  };

  const submitEventFeedback = async () => {
    if (!approvedApp) return;
    await submitFeedback({
      groupId: approvedApp.groupId,
      rating: feedbackRating,
      comment: feedbackNote || undefined,
    });
    setFeedbackState("Спасибо! Оценка сохранена.");
  };

  const activeCount = applications.filter((a) => a.status === "PENDING" || a.status === "APPROVED").length;

  return (
    <div className={embedded ? "grid gap-4 lg:grid-cols-[1fr_420px]" : "mt-5 grid gap-4 lg:grid-cols-[1fr_420px]"}>
      <div className="space-y-4">
        <div className="dvig-panel p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 size-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold">Контур безопасности офлайн-встречи</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Пилот: группы в публичных местах, модерация заявок, чек-ин и эскалация тревоги
                дежурному модератору.
              </p>
              <Link href="/safety" className="mt-3 inline-flex text-sm text-primary hover:underline">
                Полная политика безопасности и данных →
              </Link>
            </div>
          </div>
        </div>

        {!user && <AuthPanel onUserChange={onUserChange} />}

        <div className="grid gap-4 md:grid-cols-2">
          <SafetyCard
            icon={UserCheck}
            title="Верификация"
            status="Email + ручная модерация"
            text="На пилоте достаточно email и проверки модератором при одобрении заявки."
          />
          <SafetyCard
            icon={MapPin}
            title="Публичная точка"
            status={approvedApp?.meetingPoint ? "Назначена" : "После одобрения"}
            text={
              approvedApp?.meetingPoint ??
              "Точка встречи видна только после одобрения заявки модератором."
            }
          />
          <SafetyCard
            icon={BellRing}
            title="Тревожная кнопка"
            status={panicState}
            text="Эскалация модератору и доверенному контакту. При угрозе жизни — 112."
            action="Активировать"
            onAction={() => void handlePanic()}
          />
          <SafetyCard
            icon={TriangleAlert}
            title="Жалоба"
            status="Доступно после входа"
            text="Жалоба уходит модератору пилота."
            action="Пожаловаться"
            onAction={() => void handleComplaint()}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="dvig-panel p-5">
          <h3 className="font-semibold">Мой safety-чеклист</h3>
          <div className="mt-4 space-y-3 text-sm">
            <SafetyRow label="Активные заявки" value={`${activeCount}`} />
            <SafetyRow label="Доверенный контакт" value={trustedContact || "Не указан"} />
            <SafetyRow label="Чек-ин" value={checkInState} />
          </div>
          <div className="mt-4 grid gap-2">
            <Input
              value={trustedContact}
              onChange={(event) => setTrustedContact(event.target.value)}
              className="rounded-md"
              placeholder="Доверенный контакт"
              aria-label="Доверенный контакт"
            />
            <Button variant="outline" className="rounded-md" onClick={() => void saveTrustedContact()}>
              Сохранить контакт
            </Button>
            <Button className="dvig-btn-primary rounded-lg" onClick={() => void handleCheckIn("checked_in")}>
              <Check className="size-4" />
              Отметиться на месте
            </Button>
            <Button variant="outline" className="rounded-md" onClick={() => void handleCheckIn("left")}>
              <LogOut className="size-4" />
              Выйти из встречи
            </Button>
          </div>
        </div>

        {approvedApp && (
          <div className="dvig-panel p-5">
            <h3 className="font-semibold">Как прошло?</h3>
            <p className="mt-2 text-sm text-muted-foreground">Оценка после check-in (1–5)</p>
            <div className="mt-3 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={feedbackRating === value ? "default" : "outline"}
                  className="rounded-md"
                  onClick={() => setFeedbackRating(value)}
                >
                  {value}
                </Button>
              ))}
            </div>
            <Input
              className="mt-3 rounded-md"
              placeholder="Комментарий (опционально)"
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
            />
            <Button className="mt-3 w-full rounded-md" onClick={() => void submitEventFeedback()}>
              Отправить оценку
            </Button>
            {feedbackState && <p className="mt-2 text-sm text-primary">{feedbackState}</p>}
          </div>
        )}

        <div className="rounded-md border border-border/50 bg-[#fff7ed] p-5">
          <h3 className="font-semibold">Пилот</h3>
          <p className="mt-2 text-sm leading-6 text-accent-foreground">
            Регламент: <Link href="/privacy" className="underline">политика ПДн</Link>, модератор на смене,
            группы 5–7, только публичные места. См. PILOT_REGULATIONS.md в репозитории.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfilePanel({
  user,
  activeApplications,
  embedded = false,
}: {
  user: ApiUser | null;
  activeApplications: number;
  embedded?: boolean;
}) {
  const [exportState, setExportState] = useState("Архив не запрошен");

  return (
    <div className={embedded ? "grid gap-4 lg:grid-cols-[1fr_420px]" : "mt-5 grid gap-4 lg:grid-cols-[1fr_420px]"}>
      <div className="dvig-panel p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-semibold">Профиль и цифровой след</h3>
          <Badge variant="outline" className="rounded-md">
            Пилот
          </Badge>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Данные хранятся на сервере пилота. Заявки, check-in и жалобы — для модерации и метрик.
        </p>
        <Link href="/safety#data" className="mt-3 inline-flex text-sm text-primary hover:underline">
          Что хранится и удаляется →
        </Link>
        <div className="mt-5 grid gap-3">
          <TraceItem title="Профиль" value="имя, интересы, город, доверенный контакт" />
          <TraceItem title="События" value="заявки, check-in, оценки после встречи" />
          <TraceItem title="Безопасность" value="жалобы и тревожные сигналы с ограниченным сроком хранения" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="dvig-panel p-5">
          <h3 className="font-semibold">Управление аккаунтом</h3>
          <div className="mt-4 space-y-3 text-sm">
            <SafetyRow label="Активные заявки" value={`${activeApplications}`} />
            <SafetyRow label="Экспорт данных" value={exportState} />
            <SafetyRow label="Аккаунт" value={user?.email ?? "Не выполнен вход"} />
          </div>
          <div className="mt-4 grid gap-2">
            <Button
              variant="outline"
              className="rounded-md"
              onClick={() => setExportState("Запрос принят — свяжемся по email в течение 7 дней")}
            >
              <FileText className="size-4" />
              Запросить архив данных
            </Button>
            <Link href="/privacy" className="text-sm text-primary hover:underline">
              Политика конфиденциальности
            </Link>
          </div>
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
