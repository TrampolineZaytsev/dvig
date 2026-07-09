"use client";

import { type ReactNode } from "react";
import { X } from "lucide-react";
export function FilterGroup({
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

export function FilterPill({
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

export function ActiveFilterChip({
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
