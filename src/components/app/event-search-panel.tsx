"use client";


import { useState } from "react";
import { ChevronDown, ChevronUp, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/events/date-range-picker";
import { KudagoCategoryPicker } from "@/components/events/kudago-category-picker";
import { dateFilters, moodFilters, type EventCategory, type EventMood } from "@/lib/events";
import type { CustomDateRange } from "@/lib/events/dates";
import { formatCustomDateRangeLabel } from "@/lib/events/dates";
import { moodLabels, sortOptions } from "./constants";
import { ActiveFilterChip, FilterGroup, FilterPill } from "./event-filters";
import type { DatePreset, EventSort } from "./types";
import { countActiveFilters, formatEventCount, toggleInList } from "./utils";

export function EventSearchPanel({
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
