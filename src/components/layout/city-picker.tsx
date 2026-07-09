"use client";

import { useState } from "react";
import { Check, ChevronDown, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverPositioner,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useSelectedCity } from "@/hooks/use-selected-city";
import { cn } from "@/lib/utils";

export function CityPicker() {
  const { city, setCityId, cities, cityId } = useSelectedCity();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Выбрать город"
        render={
          <button
            type="button"
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          />
        }
      >
        <Badge className="dvig-badge shrink-0 cursor-pointer gap-1 pr-1.5 transition hover:brightness-110">
          <MapPin className="size-3" aria-hidden />
          {city.label}
          <ChevronDown className="size-3 opacity-70" aria-hidden />
        </Badge>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner align="start">
          <PopoverContent className="p-2">
            <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Город
            </p>
            <ul className="mt-1 space-y-0.5">
              {cities.map((option) => {
                const selected = option.id === cityId;
                const disabled = !option.available;

                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      disabled={disabled}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm transition",
                        disabled
                          ? "cursor-not-allowed opacity-50"
                          : "hover:bg-muted/60",
                        selected && !disabled && "bg-primary/10 text-primary"
                      )}
                      onClick={() => {
                        if (disabled) return;
                        setCityId(option.id);
                        setOpen(false);
                      }}
                    >
                      <span>
                        <span className="font-medium">{option.name}</span>
                        {disabled && (
                          <span className="ml-2 text-xs text-muted-foreground">скоро</span>
                        )}
                      </span>
                      {selected && !disabled && <Check className="size-4 shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </PopoverContent>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  );
}
