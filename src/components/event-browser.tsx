"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  BellRing,
  CalendarDays,
  Check,
  Clipboard,
  Download,
  EyeOff,
  FileText,
  Heart,
  InfoIcon,
  LogOut,
  MapPin,
  Search,
  Send,
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
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildTelegramDigest,
  categories,
  dates,
  DvigEvent,
  events,
  getPopularEvents,
  moods,
  toCsv,
} from "@/lib/events";

type CategoryFilter = (typeof categories)[number];
type DateFilter = (typeof dates)[number];
type MoodFilter = (typeof moods)[number];
type AppView = "search" | "popular" | "collection" | "export" | "safety" | "profile" | "settings";

export function EventBrowser() {
  const [view, setView] = useState<AppView>("search");
  const [category, setCategory] = useState<CategoryFilter>("Все");
  const [date, setDate] = useState<DateFilter>("Любая дата");
  const [mood, setMood] = useState<MoodFilter>("Любой формат");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<DvigEvent | null>(events[0]);
  const [saved, setSaved] = useState<string[]>([]);
  const [joined, setJoined] = useState<string[]>([]);
  const [copyState, setCopyState] = useState("Скопировать для Telegram");

  useEffect(() => {
    const requestedCategory = new URLSearchParams(window.location.search).get("category");

    if (categories.includes(requestedCategory as CategoryFilter)) {
      setCategory(requestedCategory as CategoryFilter);
    }
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const queryMatch = `${event.title} ${event.place} ${event.short}`
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const categoryMatch = category === "Все" || event.category === category;
      const dateMatch = date === "Любая дата" || event.date === date;
      const moodMatch = mood === "Любой формат" || event.mood === mood;

      return queryMatch && categoryMatch && dateMatch && moodMatch;
    });
  }, [category, date, mood, query]);

  const savedEvents = useMemo(
    () => events.filter((event) => saved.includes(event.id)),
    [saved]
  );
  const digest = useMemo(() => buildTelegramDigest(savedEvents), [savedEvents]);
  const popularEvents = useMemo(() => getPopularEvents(), []);
  const exportEvents = savedEvents.length > 0 ? savedEvents : filteredEvents;

  const toggleSaved = (eventId: string) => {
    setSaved((current) =>
      current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId]
    );
  };

  const toggleJoined = (eventId: string) => {
    setJoined((current) =>
      current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId]
    );
  };

  const downloadFile = (format: "json" | "csv") => {
    const content =
      format === "json" ? JSON.stringify(exportEvents, null, 2) : toCsv(exportEvents);
    const type = format === "json" ? "application/json" : "text/csv";
    const blob = new Blob([content], { type: `${type};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dvig-events.${format}`;
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
    <main className="min-h-screen bg-[#f6f3ee] text-[#171b18]">
      <header className="border-b border-[#d9d5cb] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-md bg-[#235646] text-sm font-semibold text-white">
                Д
              </span>
              <span className="font-semibold">ДВИГ</span>
            </Link>
            <Badge variant="outline" className="rounded-md lg:hidden">
              webapp
            </Badge>
          </div>
          <div className="grid gap-3 text-sm sm:grid-cols-3 lg:min-w-[520px]">
            <Metric label="Заявки" value={joined.length} />
            <Metric label="Сохранено" value={saved.length} />
            <Metric label="Событий" value={events.length} />
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
        <aside className="h-fit rounded-md border border-[#d9d5cb] bg-white p-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-5 text-[#235646]" />
            <h1 className="text-xl font-semibold">ДВИГ webapp</h1>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#56635d]">
            Поиск событий, ИИ-резюме, подборка, экспорт и Telegram-дайджест в одном
            веб-интерфейсе. Данные пока демонстрационные.
          </p>
          <Separator className="my-4" />
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              Поиск
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6b746f]" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="кино, антикафе, лекция"
                  className="rounded-md pl-9"
                />
              </div>
            </label>

            <FilterSelect
              label="Дата"
              value={date}
              values={dates}
              onChange={(value) => setDate(value as DateFilter)}
            />
            <FilterSelect
              label="Формат"
              value={mood}
              values={moods}
              onChange={(value) => setMood(value as MoodFilter)}
            />
          </div>
        </aside>

        <div>
          <div className="rounded-md border border-[#d9d5cb] bg-white p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <Badge className="rounded-md bg-[#dbe9e2] text-[#235646] hover:bg-[#dbe9e2]">
                    {filteredEvents.length} встреч найдено
                  </Badge>
                  <h2 className="mt-3 text-3xl font-semibold">Городская афиша для встреч</h2>
                </div>
                <Tabs value={category} onValueChange={(value) => setCategory(value as CategoryFilter)}>
                  <TabsList className="flex h-auto flex-wrap rounded-md bg-[#f0ede6] p-1">
                    {categories.map((item) => (
                      <TabsTrigger key={item} value={item} className="rounded-sm">
                        {item}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
              <Tabs value={view} onValueChange={(value) => setView(value as AppView)}>
                <TabsList className="flex h-auto flex-wrap rounded-md bg-[#f0ede6] p-1">
                  <AppTab value="search" icon={Search} label="Поиск" />
                  <AppTab value="popular" icon={BarChart3} label="Популярное" />
                  <AppTab value="collection" icon={Send} label="Подборка" />
                  <AppTab value="export" icon={Download} label="Экспорт" />
                  <AppTab value="safety" icon={ShieldCheck} label="Безопасность" />
                  <AppTab value="profile" icon={UserCheck} label="Профиль" />
                  <AppTab value="settings" icon={Settings} label="Настройки" />
                </TabsList>
              </Tabs>
            </div>
          </div>

          {view === "search" && (
            <EventGrid
              events={filteredEvents}
              saved={saved}
              joined={joined}
              onOpen={setSelected}
              onSave={toggleSaved}
              onJoin={toggleJoined}
            />
          )}

          {view === "popular" && (
            <div className="mt-5 space-y-4">
              {popularEvents.map((event, index) => (
                <PopularRow
                  key={event.id}
                  rank={index + 1}
                  event={event}
                  isSaved={saved.includes(event.id)}
                  onOpen={() => setSelected(event)}
                  onSave={() => toggleSaved(event.id)}
                />
              ))}
            </div>
          )}

          {view === "collection" && (
            <CollectionPanel
              savedEvents={savedEvents}
              digest={digest}
              copyState={copyState}
              onCopy={copyDigest}
              onOpen={setSelected}
              onRemove={toggleSaved}
            />
          )}

          {view === "export" && (
            <ExportPanel
              events={exportEvents}
              onJson={() => downloadFile("json")}
              onCsv={() => downloadFile("csv")}
            />
          )}

          {view === "safety" && <SafetyPanel joinedCount={joined.length} />}

          {view === "profile" && <ProfilePanel />}

          {view === "settings" && <SettingsPanel />}
        </div>
      </section>

      <EventSheet
        event={selected}
        isSaved={selected ? saved.includes(selected.id) : false}
        isJoined={selected ? joined.includes(selected.id) : false}
        onClose={() => setSelected(null)}
        onSave={(eventId) => toggleSaved(eventId)}
        onJoin={(eventId) => toggleJoined(eventId)}
      />
    </main>
  );
}

function EventGrid({
  events: items,
  saved,
  joined,
  onOpen,
  onSave,
  onJoin,
}: {
  events: DvigEvent[];
  saved: string[];
  joined: string[];
  onOpen: (event: DvigEvent) => void;
  onSave: (eventId: string) => void;
  onJoin: (eventId: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="mt-5 rounded-md border border-[#d9d5cb] bg-white p-8 text-center">
        <p className="text-lg font-medium">Нет встреч под такие фильтры.</p>
        <p className="mt-2 text-sm text-[#56635d]">Сбросьте категорию, дату или поисковый запрос.</p>
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
          onSave={() => onSave(event.id)}
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
}: {
  event: DvigEvent | null;
  isSaved: boolean;
  isJoined: boolean;
  onClose: () => void;
  onSave: (eventId: string) => void;
  onJoin: (eventId: string) => void;
}) {
  return (
    <Sheet open={Boolean(event)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        {event && (
          <>
            <SheetHeader>
              <Badge className="mb-2 w-fit rounded-md bg-[#e6efe9] text-[#235646] hover:bg-[#e6efe9]">
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
                  <InfoIcon className="size-4 text-[#235646]" />
                  Подробная карточка
                </div>
                <p className="text-sm leading-6 text-[#56635d]">{event.description}</p>
                <p className="mt-2 text-xs text-[#6b746f]">
                  Источник: {event.source} · обновлено {event.updatedAt}
                </p>
              </div>
              <div className="rounded-md border border-[#d9d5cb] bg-[#f8f6f1] p-4">
                <div className="mb-3 flex items-center gap-2 font-medium">
                  <Sparkles className="size-4 text-[#235646]" />
                  ИИ-резюме
                </div>
                <div className="grid gap-3 text-sm leading-6 text-[#56635d]">
                  <SummaryItem label="Почему стоит пойти" value={event.aiSummary.why} />
                  <SummaryItem label="Атмосфера" value={event.aiSummary.vibe} />
                  <SummaryItem label="Кому подойдет" value={event.aiSummary.audience} />
                </div>
              </div>
              <div>
                <div className="mb-3 flex items-center gap-2 font-medium">
                  <Table2 className="size-4 text-[#235646]" />
                  Цены и даты
                </div>
                <div className="overflow-hidden rounded-md border border-[#d9d5cb]">
                  {event.priceOptions.map((option) => (
                    <div
                      key={`${option.date}-${option.time}`}
                      className="grid grid-cols-[1fr_0.8fr_0.8fr] gap-3 border-b border-[#d9d5cb] bg-white p-3 text-sm last:border-b-0"
                    >
                      <span>{option.date}</span>
                      <span>{option.time}</span>
                      <span className="font-medium">{option.price}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-md border border-[#d9d5cb] bg-[#f8f6f1] p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{event.moderator.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Модератор: {event.moderator}</p>
                    <p className="flex items-center gap-1 text-sm text-[#56635d]">
                      <Star className="size-4 fill-[#f5c451] text-[#f5c451]" />
                      рейтинг {event.rating}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-md border border-[#d9d5cb] bg-white p-4">
                <div className="mb-3 flex items-center gap-2 font-medium">
                  <ShieldCheck className="size-4 text-[#235646]" />
                  Безопасность встречи
                </div>
                <div className="grid gap-2 text-sm text-[#56635d]">
                  <span className="flex items-center gap-2">
                    <Check className="size-4 text-[#235646]" />
                    публичное место: {event.place}
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="size-4 text-[#235646]" />
                    модератор видит заявки до подтверждения
                  </span>
                  <span className="flex items-center gap-2">
                    <Check className="size-4 text-[#235646]" />
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
              <div className="flex items-center gap-2 text-sm text-[#56635d]">
                <MapPin className="size-4" />
                {event.place}, {event.address}
              </div>
            </div>
            <SheetFooter>
              <Button
                className="rounded-md bg-[#235646] hover:bg-[#1b4437]"
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
              <Button variant="outline" className="rounded-md" onClick={() => onSave(event.id)}>
                {isSaved ? "Убрать из подборки" : "Сохранить в подборку"}
              </Button>
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
  return (
    <Card className="rounded-md border-[#d9d5cb] shadow-none">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Badge className="rounded-md bg-[#e6efe9] text-[#235646] hover:bg-[#e6efe9]">
              {event.category}
            </Badge>
            <CardTitle className="text-xl">{event.title}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="rounded-md" onClick={onSave}>
            <Heart className={isSaved ? "size-4 fill-[#d96b52] text-[#d96b52]" : "size-4"} />
            <span className="sr-only">Сохранить</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-[#56635d]">{event.short}</p>
        <div className="grid gap-2 text-sm text-[#56635d] sm:grid-cols-2">
          <span className="flex items-center gap-2">
            <CalendarDays className="size-4" />
            {event.date}, {event.time}
          </span>
          <span className="flex items-center gap-2">
            <UsersRound className="size-4" />
            {event.participants} идут · {event.spotsLeft} мест
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
          <Button className="rounded-md bg-[#235646] hover:bg-[#1b4437]" onClick={onJoin}>
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

function PopularRow({
  rank,
  event,
  isSaved,
  onOpen,
  onSave,
}: {
  rank: number;
  event: DvigEvent;
  isSaved: boolean;
  onOpen: () => void;
  onSave: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-md border border-[#d9d5cb] bg-white p-4 md:grid-cols-[56px_1fr_auto] md:items-center">
      <div className="flex size-10 items-center justify-center rounded-md bg-[#dbe9e2] font-semibold text-[#235646]">
        {rank}
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{event.title}</h3>
          <Badge variant="outline" className="rounded-md">
            {event.popularityScore} баллов
          </Badge>
        </div>
        <p className="mt-1 text-sm text-[#56635d]">
          {event.participants} идут · {event.rating} рейтинг · {event.place}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="rounded-md" onClick={onSave}>
          {isSaved ? "В подборке" : "Сохранить"}
        </Button>
        <Button className="rounded-md bg-[#235646] hover:bg-[#1b4437]" onClick={onOpen}>
          Открыть
        </Button>
      </div>
    </div>
  );
}

function CollectionPanel({
  savedEvents,
  digest,
  copyState,
  onCopy,
  onOpen,
  onRemove,
}: {
  savedEvents: DvigEvent[];
  digest: string;
  copyState: string;
  onCopy: () => void;
  onOpen: (event: DvigEvent) => void;
  onRemove: (eventId: string) => void;
}) {
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_420px]">
      <div className="space-y-4">
        {savedEvents.length === 0 ? (
          <div className="rounded-md border border-[#d9d5cb] bg-white p-8">
            <h3 className="text-xl font-semibold">Подборка пустая</h3>
            <p className="mt-2 text-sm text-[#56635d]">
              Нажмите сердечко у события, чтобы собрать дайджест для друзей или Telegram-чата.
            </p>
          </div>
        ) : (
          savedEvents.map((event) => (
            <div key={event.id} className="rounded-md border border-[#d9d5cb] bg-white p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <Badge className="rounded-md bg-[#e6efe9] text-[#235646] hover:bg-[#e6efe9]">
                    {event.category}
                  </Badge>
                  <h3 className="mt-2 text-lg font-semibold">{event.title}</h3>
                  <p className="mt-1 text-sm text-[#56635d]">{event.date}, {event.time} · {event.place}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="rounded-md" onClick={() => onOpen(event)}>
                    Открыть
                  </Button>
                  <Button variant="ghost" className="rounded-md" onClick={() => onRemove(event.id)}>
                    Убрать
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="h-fit rounded-md border border-[#d9d5cb] bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold">Telegram preview</h3>
          <Button className="rounded-md bg-[#235646] hover:bg-[#1b4437]" onClick={onCopy}>
            <Clipboard className="size-4" />
            {copyState}
          </Button>
        </div>
        <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-md bg-[#f8f6f1] p-4 text-sm leading-6 text-[#344139]">
          {digest}
        </pre>
      </div>
    </div>
  );
}

function ExportPanel({
  events: exportEvents,
  onJson,
  onCsv,
}: {
  events: DvigEvent[];
  onJson: () => void;
  onCsv: () => void;
}) {
  return (
    <div className="mt-5 rounded-md border border-[#d9d5cb] bg-white p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-xl font-semibold">Экспорт событий</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#56635d]">
            Если есть сохраненная подборка, экспортируется она. Если подборка пустая,
            экспортируются события из текущего поиска.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="rounded-md bg-[#235646] hover:bg-[#1b4437]" onClick={onJson}>
            <Download className="size-4" />
            JSON
          </Button>
          <Button variant="outline" className="rounded-md" onClick={onCsv}>
            <Download className="size-4" />
            CSV
          </Button>
        </div>
      </div>
      <div className="mt-5 overflow-hidden rounded-md border border-[#d9d5cb]">
        {exportEvents.map((event) => (
          <div
            key={event.id}
            className="grid gap-2 border-b border-[#d9d5cb] p-3 text-sm last:border-b-0 md:grid-cols-[1fr_120px_120px_100px]"
          >
            <span className="font-medium">{event.title}</span>
            <span>{event.category}</span>
            <span>{event.date}</span>
            <span>{event.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPanel() {
  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      {[
        ["Город", "Санкт-Петербург", "В следующем этапе здесь будет выбор города и источник афиши."],
        ["ИИ-резюме", "Демо-режим", "Сейчас текст локальный. Реальные OpenAI/GigaChat ключи должны жить только на сервере."],
        ["Telegram", "Копирование", "Реальная отправка будет server-side, чтобы не раскрывать токен бота в браузере."],
        ["Данные", "Mock", "Интерфейс готов под подключение KudaGo, но текущая версия стабильна без сети."],
      ].map(([title, value, text]) => (
        <div key={title} className="rounded-md border border-[#d9d5cb] bg-white p-4">
          <span className="text-sm text-[#6b746f]">{title}</span>
          <h3 className="mt-1 text-lg font-semibold">{value}</h3>
          <p className="mt-2 text-sm leading-6 text-[#56635d]">{text}</p>
        </div>
      ))}
    </div>
  );
}

function SafetyPanel({ joinedCount }: { joinedCount: number }) {
  const [panicState, setPanicState] = useState("Не активирована");
  const [checkInState, setCheckInState] = useState("Ожидает встречи");
  const [trustedContact, setTrustedContact] = useState("Алина, +7 900 000-00-00");

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_420px]">
      <div className="space-y-4">
        <div className="rounded-md border border-[#d9d5cb] bg-white p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 size-6 text-[#235646]" />
            <div>
              <h3 className="text-xl font-semibold">Контур безопасности офлайн-встречи</h3>
              <p className="mt-2 text-sm leading-6 text-[#56635d]">
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
        <div className="rounded-md border border-[#d9d5cb] bg-white p-5">
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
              className="rounded-md bg-[#235646] hover:bg-[#1b4437]"
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

        <div className="rounded-md border border-[#d9d5cb] bg-[#fff7ed] p-5">
          <h3 className="font-semibold">Ограничение MVP</h3>
          <p className="mt-2 text-sm leading-6 text-[#6b4a13]">
            Это демонстрационный интерфейс. До реального запуска нужны юридическая
            политика, обработка тревожных сигналов, модераторские регламенты и
            понятное согласие на обработку геоданных.
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfilePanel() {
  const [visibility, setVisibility] = useState("Профиль виден только подтвержденным участникам встреч");
  const [exportState, setExportState] = useState("Архив не запрошен");
  const [deleteState, setDeleteState] = useState("Профиль активен");

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_420px]">
      <div className="rounded-md border border-[#d9d5cb] bg-white p-5">
        <h3 className="text-xl font-semibold">Профиль и цифровой след</h3>
        <p className="mt-2 text-sm leading-6 text-[#56635d]">
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
        <div className="rounded-md border border-[#d9d5cb] bg-white p-5">
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
              className="rounded-md bg-[#8f2f24] text-white hover:bg-[#74251d]"
              onClick={() => setDeleteState("Запрос на удаление создан · 30 дней на отмену")}
            >
              <Trash2 className="size-4" />
              Удалить профиль
            </Button>
          </div>
        </div>

        <div className="rounded-md border border-[#d9d5cb] bg-[#f8f6f1] p-5">
          <h3 className="font-semibold">Что останется после удаления</h3>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[#56635d]">
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
    <div className="rounded-md border border-[#d9d5cb] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <Icon className="size-5 text-[#235646]" />
        <Badge variant="outline" className="rounded-md text-right">
          {status}
        </Badge>
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#56635d]">{text}</p>
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
    <div className="rounded-md border border-[#d9d5cb] bg-[#f8f6f1] p-3">
      <span className="text-xs text-[#6b746f]">{label}</span>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function TraceItem({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border border-[#d9d5cb] bg-[#f8f6f1] p-4">
      <h4 className="font-semibold">{title}</h4>
      <p className="mt-1 text-sm leading-6 text-[#56635d]">{value}</p>
    </div>
  );
}

function AppTab({
  value,
  icon: Icon,
  label,
}: {
  value: AppView;
  icon: typeof Search;
  label: string;
}) {
  return (
    <TabsTrigger value={value} className="rounded-sm">
      <Icon className="size-4" />
      {label}
    </TabsTrigger>
  );
}

function FilterSelect({
  label,
  value,
  values,
  onChange,
}: {
  label: string;
  value: string;
  values: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <Select value={value} onValueChange={(nextValue) => nextValue && onChange(nextValue)}>
        <SelectTrigger className="mt-2 w-full rounded-md">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {values.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-[#d9d5cb] bg-[#f8f6f1] p-3">
      <span className="text-[#6b746f]">{label}</span>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-[#d9d5cb] bg-white p-3">
      <span className="text-xs text-[#6b746f]">{label}</span>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-medium uppercase tracking-wide text-[#235646]">{label}</span>
      <p className="mt-1">{value}</p>
    </div>
  );
}
