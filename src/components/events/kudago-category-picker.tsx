"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverPositioner,
  PopoverTrigger,
} from "@/components/ui/popover";
import { categoryFilters, type EventCategory } from "@/lib/events";

export type KudagoCategoryOption = {
  slug: string;
  name: string;
};

function toggleInList<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((value) => value !== item) : [...list, item];
}

export function KudagoCategoryPicker({
  primaryValue,
  onPrimaryChange,
  extraSlugs,
  onExtraSlugsChange,
}: {
  primaryValue: EventCategory[];
  onPrimaryChange: (value: EventCategory[]) => void;
  extraSlugs: string[];
  onExtraSlugsChange: (value: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<KudagoCategoryOption[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/event-categories");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Не удалось загрузить категории");
        }
        if (!cancelled) {
          setOptions(data.categories ?? []);
          setLoadError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Ошибка загрузки");
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const extraLabel =
    extraSlugs.length > 0 ? `Ещё типы (${extraSlugs.length})` : "Ещё типы";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {categoryFilters.map((item) => {
        const isActive = primaryValue.includes(item);

        return (
          <button
            key={item}
            type="button"
            className={
              isActive
                ? "dvig-category-active shrink-0 rounded-full px-4 py-2 text-sm"
                : "dvig-category-inactive shrink-0 rounded-full px-4 py-2 text-sm"
            }
            onClick={() => onPrimaryChange(toggleInList(primaryValue, item))}
          >
            {item}
          </button>
        );
      })}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          type="button"
          className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-4 text-sm font-medium transition hover:border-primary/30 ${
            extraSlugs.length > 0 ? "border-primary/40 bg-primary/5" : ""
          }`}
        >
          {extraLabel}
          <ChevronDown className="size-4 opacity-70" />
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverPositioner align="start">
            <PopoverContent className="max-h-72 w-[min(100vw-2rem,22rem)] overflow-y-auto p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Все типы KudaGo
              </p>
              {loadError && (
                <p className="mb-2 text-sm text-destructive">{loadError}</p>
              )}
              <div className="space-y-1">
                {options.map((option) => {
                  const checked = extraSlugs.includes(option.slug);

                  return (
                    <label
                      key={option.slug}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
                    >
                      <input
                        type="checkbox"
                        className="size-4 rounded border-border accent-primary"
                        checked={checked}
                        onChange={() =>
                          onExtraSlugsChange(toggleInList(extraSlugs, option.slug))
                        }
                      />
                      <span>{option.name}</span>
                    </label>
                  );
                })}
              </div>
              {extraSlugs.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-2 h-8 w-full rounded-md text-sm"
                  onClick={() => onExtraSlugsChange([])}
                >
                  Сбросить доп. типы
                </Button>
              )}
            </PopoverContent>
          </PopoverPositioner>
        </PopoverPortal>
      </Popover>
    </div>
  );
}
