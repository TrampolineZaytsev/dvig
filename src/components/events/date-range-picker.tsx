"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverPositioner,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  addDays,
  CustomDateRange,
  formatCustomDateRangeLabel,
  formatRuShortDate,
  isDateInRange,
  isSameDay,
  parseISODate,
  startOfDay,
  toISODate,
} from "@/lib/events/dates";
import { cn } from "@/lib/utils";

type PickerMode = "single" | "range";

const weekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

const monthFormatter = new Intl.DateTimeFormat("ru-RU", {
  month: "long",
  year: "numeric",
});

function getMonthMatrix(month: Date): Date[][] {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const gridStart = addDays(firstDay, -startOffset);
  const weeks: Date[][] = [];

  for (let week = 0; week < 6; week += 1) {
    const days: Date[] = [];
    for (let day = 0; day < 7; day += 1) {
      days.push(addDays(gridStart, week * 7 + day));
    }
    weeks.push(days);
  }

  return weeks;
}

export function DateRangePicker({
  value,
  onChange,
}: {
  value: CustomDateRange | null;
  onChange: (value: CustomDateRange | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<PickerMode>("single");
  const [visibleMonth, setVisibleMonth] = useState(() => startOfDay(new Date()));
  const [draftFrom, setDraftFrom] = useState<Date | null>(null);
  const [draftTo, setDraftTo] = useState<Date | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (value) {
      const from = parseISODate(value.from);
      const to = parseISODate(value.to);
      setDraftFrom(from);
      setDraftTo(to);
      setVisibleMonth(from);
      setMode(value.from === value.to ? "single" : "range");
      return;
    }

    const today = startOfDay(new Date());
    setDraftFrom(today);
    setDraftTo(today);
    setVisibleMonth(today);
    setMode("single");
  }, [open, value]);

  const weeks = useMemo(() => getMonthMatrix(visibleMonth), [visibleMonth]);
  const today = startOfDay(new Date());
  const isActive = value !== null;

  const handleDayClick = (day: Date) => {
    if (mode === "single") {
      setDraftFrom(day);
      setDraftTo(day);
      return;
    }

    if (!draftFrom || (draftFrom && draftTo && !isSameDay(draftFrom, draftTo))) {
      setDraftFrom(day);
      setDraftTo(day);
      return;
    }

    if (isSameDay(draftFrom, day)) {
      return;
    }

    if (day < draftFrom) {
      setDraftTo(draftFrom);
      setDraftFrom(day);
      return;
    }

    setDraftTo(day);
  };

  const applySelection = () => {
    if (!draftFrom) {
      return;
    }

    const from = toISODate(draftFrom);
    const to = toISODate(draftTo ?? draftFrom);
    onChange({ from, to });
    setOpen(false);
  };

  const clearSelection = () => {
    onChange(null);
    setOpen(false);
  };

  const selectionLabel =
    draftFrom && draftTo
      ? draftFrom.getTime() === draftTo.getTime()
        ? formatRuShortDate(toISODate(draftFrom))
        : `${formatRuShortDate(toISODate(draftFrom))} — ${formatRuShortDate(toISODate(draftTo))}`
      : "Выберите дату";

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen && isActive) {
      onChange(null);
      setOpen(false);
      return;
    }

    setOpen(nextOpen);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        type="button"
        aria-label="Выбрать дату или интервал"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
          isActive
            ? "border-primary/40 bg-primary/15 text-primary shadow-sm shadow-primary/10"
            : "border-border/50 bg-card/40 text-foreground/90 hover:border-primary/30 hover:bg-card/70"
        )}
      >
        <CalendarDays className="size-4 shrink-0" />
        <span className="hidden sm:inline">
          {isActive && value ? formatCustomDateRangeLabel(value) : "Дата"}
        </span>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner align="start">
          <PopoverContent>
            <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
              <ModeButton active={mode === "single"} onClick={() => setMode("single")}>
                Одна дата
              </ModeButton>
              <ModeButton active={mode === "range"} onClick={() => setMode("range")}>
                Интервал
              </ModeButton>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Предыдущий месяц"
                onClick={() =>
                  setVisibleMonth(
                    (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
                  )
                }
              >
                <ChevronLeft className="size-4" />
              </Button>
              <p className="text-sm font-medium capitalize">
                {monthFormatter.format(visibleMonth)}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Следующий месяц"
                onClick={() =>
                  setVisibleMonth(
                    (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
                  )
                }
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>

            <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
              {weekDays.map((day) => (
                <span key={day} className="py-1 font-medium">
                  {day}
                </span>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1">
              {weeks.map((week, weekIndex) =>
                week.map((day) => {
                  const inCurrentMonth = day.getMonth() === visibleMonth.getMonth();
                  const rangeFrom = draftFrom ?? today;
                  const rangeTo = draftTo ?? draftFrom ?? today;
                  const selected =
                    draftFrom &&
                    (mode === "single"
                      ? isSameDay(day, draftFrom)
                      : isDateInRange(day, rangeFrom, rangeTo));
                  const rangeEdge =
                    draftFrom &&
                    (isSameDay(day, rangeFrom) || (draftTo && isSameDay(day, rangeTo)));
                  const inRange =
                    mode === "range" &&
                    draftFrom &&
                    draftTo &&
                    isDateInRange(day, rangeFrom, rangeTo) &&
                    !isSameDay(rangeFrom, rangeTo);

                  return (
                    <button
                      key={`${weekIndex}-${toISODate(day)}`}
                      type="button"
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        "relative h-8 rounded-md text-sm transition",
                        !inCurrentMonth && "text-muted-foreground/45",
                        inRange && "bg-primary/10 text-foreground",
                        rangeEdge && "bg-primary text-primary-foreground font-medium",
                        selected &&
                          mode === "single" &&
                          "bg-primary text-primary-foreground font-medium",
                        isSameDay(day, today) &&
                          !selected &&
                          !rangeEdge &&
                          "ring-1 ring-primary/30"
                      )}
                    >
                      {day.getDate()}
                    </button>
                  );
                })
              )}
            </div>

            <p className="mt-3 text-center text-xs text-muted-foreground">{selectionLabel}</p>

            <div className="mt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-lg"
                onClick={clearSelection}
              >
                Сбросить
              </Button>
              <Button type="button" className="dvig-btn-primary flex-1 rounded-lg" onClick={applySelection}>
                Применить
              </Button>
            </div>
          </PopoverContent>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  );
}

function ModeButton({
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
      onClick={onClick}
      className={cn(
        "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition",
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
