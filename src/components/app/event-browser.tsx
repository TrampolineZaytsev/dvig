"use client";


import { useEffect, useMemo, useState } from "react";
import { OnboardingDialog } from "@/components/auth/onboarding-dialog";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { usePilotData } from "@/hooks/use-pilot-data";
import { trackEvent } from "@/lib/client/api-client";
import {
  buildTelegramDigest,
  categoryFilters,
  type DvigEvent,
  type EventCategory,
  type EventMood,
  toCsv,
} from "@/lib/events";
import type { CustomDateRange } from "@/lib/events/dates";
import { eventMatchesDateFilter } from "@/lib/events/dates";
import { fetchDvigEvents } from "@/lib/events/fetch";
import { AppMenu } from "./app-menu";
import { CollectionPanel } from "./collection-panel";
import { EventGrid } from "./event-grid";
import { EventSearchPanel } from "./event-search-panel";
import { EventSheet } from "./event-sheet";
import { FriendsPanel } from "./friends-panel";
import { ProfileView } from "./profile-view";
import { SectionTitle } from "./section-title";
import { SettingsPanel } from "./settings-panel";
import type { AppView, DatePreset, EventSort } from "./types";

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
