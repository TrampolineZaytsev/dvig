"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { DvigLogo } from "@/components/dvig-logo";
import {
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
  Menu,
  MapPin,
  Search,
  Settings,
  ShieldCheck,
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
  SheetTrigger,
} from "@/components/ui/sheet";
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
    <main className="dvig-page min-h-screen text-foreground">
      <header className="dvig-header">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <DvigLogo size="sm" />
              <span className="font-semibold">ДВИГ</span>
            </Link>
            <Badge variant="outline" className="rounded-md lg:hidden">
              webapp
            </Badge>
          </div>
          <div className="flex items-center justify-end">
            <AppMenu
              savedCount={saved.length}
              joinedCount={joined.length}
              eventsCount={events.length}
              onNavigate={setView}
            />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-5">
          <div className="dvig-panel p-4">
            <div className="flex flex-col gap-5">
              <div>
                <Badge className="dvig-badge">
                  {filteredEvents.length} встреч найдено
                </Badge>
                <h1 className="mt-3 text-3xl font-bold tracking-tight">Выберите мероприятие</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Категория и поиск здесь. Профиль, мои события, безопасность и экспорт
                  вынесены в меню справа сверху.
                </p>
              </div>
              <CategoryPicker value={category} onChange={setCategory} />
              <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
                <label className="block text-sm font-medium">
                  Поиск
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/80" />
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

function AppMenu({
  savedCount,
  joinedCount,
  eventsCount,
  onNavigate,
}: {
  savedCount: number;
  joinedCount: number;
  eventsCount: number;
  onNavigate: (view: AppView) => void;
}) {
  return (
    <Sheet>
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
          <SheetDescription>Профиль, события и настройки ДВИГ.</SheetDescription>
        </SheetHeader>
        <div className="space-y-3 px-4">
          <MenuProfile />
          <div className="grid grid-cols-3 gap-2">
            <Metric label="Заявки" value={joinedCount} />
            <Metric label="Сохранено" value={savedCount} />
            <Metric label="Событий" value={eventsCount} />
          </div>
          <MenuAction
            icon={UsersRound}
            title="Мои события"
            text={`${joinedCount} заявок · ${savedCount} сохранено`}
            onClick={() => onNavigate("collection")}
          />
          <MenuAction
            icon={Sparkles}
            title="Популярное"
            text="Рейтинг событий по интересу"
            onClick={() => onNavigate("popular")}
          />
          <MenuAction
            icon={Download}
            title="Экспорт"
            text="JSON/CSV для подборки или текущего поиска"
            onClick={() => onNavigate("export")}
          />
          <MenuAction
            icon={ShieldCheck}
            title="Безопасность"
            text="Чек-ин, тревожная кнопка, доверенный контакт"
            onClick={() => onNavigate("safety")}
          />
          <MenuAction
            icon={UserCheck}
            title="Профиль и след"
            text="Скрыть профиль, архив данных, удаление"
            onClick={() => onNavigate("profile")}
          />
          <MenuAction
            icon={Settings}
            title="Настройки"
            text="Источники, Telegram, режим данных"
            onClick={() => onNavigate("settings")}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CategoryPicker({
  value,
  onChange,
}: {
  value: CategoryFilter;
  onChange: (value: CategoryFilter) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-5">
      {categories.map((item) => {
        const isActive = value === item;

        return (
          <button
            key={item}
            type="button"
            className={
              isActive
                ? "dvig-category-active px-4 py-3 text-left text-sm"
                : "dvig-category-inactive px-4 py-3 text-left text-sm"
            }
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}

function MenuProfile() {
  return (
    <div className="dvig-panel-muted p-4">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback>А</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">Алина</p>
          <p className="text-sm text-muted-foreground">профиль проверяется · СПб</p>
        </div>
      </div>
    </div>
  );
}

function MenuAction({
  icon: Icon,
  title,
  text,
  onClick,
}: {
  icon: typeof Search;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full items-start gap-3 dvig-panel p-4 text-left transition hover:bg-muted/50"
      onClick={onClick}
    >
      <Icon className="mt-1 size-5 shrink-0 text-primary" />
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="mt-1 block text-sm leading-5 text-muted-foreground">{text}</span>
      </span>
    </button>
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
      <div className="mt-5 dvig-panel p-8 text-center">
        <p className="text-lg font-medium">Нет встреч под такие фильтры.</p>
        <p className="mt-2 text-sm text-muted-foreground">Сбросьте категорию, дату или поисковый запрос.</p>
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
            <SheetFooter>
              <Button
                className="dvig-btn-primary rounded-lg"
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
    <Card className="rounded-md border-border/50 shadow-none">
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
    <div className="grid gap-3 dvig-panel p-4 md:grid-cols-[56px_1fr_auto] md:items-center">
      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/20 font-semibold text-primary">
        {rank}
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{event.title}</h3>
          <Badge variant="outline" className="rounded-md">
            {event.popularityScore} баллов
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {event.participants} идут · {event.rating} рейтинг · {event.place}
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="rounded-md" onClick={onSave}>
          {isSaved ? "В подборке" : "Сохранить"}
        </Button>
        <Button className="dvig-btn-primary rounded-lg" onClick={onOpen}>
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
                  <Button variant="ghost" className="rounded-md" onClick={() => onRemove(event.id)}>
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
    <div className="mt-5 dvig-panel p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="text-xl font-semibold">Экспорт событий</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Если есть сохраненная подборка, экспортируется она. Если подборка пустая,
            экспортируются события из текущего поиска.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="dvig-btn-primary rounded-lg" onClick={onJson}>
            <Download className="size-4" />
            JSON
          </Button>
          <Button variant="outline" className="rounded-md" onClick={onCsv}>
            <Download className="size-4" />
            CSV
          </Button>
        </div>
      </div>
      <div className="mt-5 overflow-hidden rounded-xl border border-border/50">
        {exportEvents.map((event) => (
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
        <div key={title} className="dvig-panel p-4">
          <span className="text-sm text-muted-foreground/80">{title}</span>
          <h3 className="mt-1 text-lg font-semibold">{value}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
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

function ProfilePanel() {
  const [visibility, setVisibility] = useState("Профиль виден только подтвержденным участникам встреч");
  const [exportState, setExportState] = useState("Архив не запрошен");
  const [deleteState, setDeleteState] = useState("Профиль активен");

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_420px]">
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
