"use client";


import { Button } from "@/components/ui/button";
import type { DvigEvent } from "@/lib/events";
import { EventCard } from "./event-card";

export function EventGrid({
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
