"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

export function SafetyCard({
  icon: Icon,
  title,
  status,
  text,
  action,
  onAction,
}: {
  icon: LucideIcon;
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

export function SafetyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="dvig-panel-muted p-3">
      <span className="text-xs text-muted-foreground/80">{label}</span>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

export function TraceItem({ title, value }: { title: string; value: string }) {
  return (
    <div className="dvig-panel-muted p-4">
      <h4 className="font-semibold">{title}</h4>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{value}</p>
    </div>
  );
}

export function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="dvig-panel-muted p-3">
      <span className="text-muted-foreground/80">{label}</span>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

export function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="dvig-panel p-3">
      <span className="text-xs text-muted-foreground/80">{label}</span>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

export function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-medium uppercase tracking-wide text-primary">{label}</span>
      <p className="mt-1">{value}</p>
    </div>
  );
}
