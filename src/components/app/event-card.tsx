"use client";


import { CalendarDays, Heart, MapPin, Sparkles, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DvigEvent } from "@/lib/events";
import { formatGroupLine } from "./utils";

export function EventCard({
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
