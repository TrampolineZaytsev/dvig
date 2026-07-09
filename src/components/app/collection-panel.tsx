"use client";


import { Clipboard, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DvigEvent } from "@/lib/events";

export function CollectionPanel({
  savedEvents,
  digest,
  copyState,
  exportEvents,
  onCopy,
  onOpen,
  onRemove,
  onExportJson,
  onExportCsv,
}: {
  savedEvents: DvigEvent[];
  digest: string;
  copyState: string;
  exportEvents: DvigEvent[];
  onCopy: () => void;
  onOpen: (event: DvigEvent) => void;
  onRemove: (event: DvigEvent) => void;
  onExportJson: () => void;
  onExportCsv: () => void;
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
                  <Button variant="ghost" className="rounded-md" onClick={() => onRemove(event)}>
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
      <div className="lg:col-span-2 dvig-panel p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Экспорт подборки</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {savedEvents.length > 0
                ? "Скачайте сохранённые события в JSON или CSV."
                : "Подборка пустая — экспортируются события из текущего поиска на главной."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="dvig-btn-primary rounded-lg" onClick={onExportJson}>
              <Download className="size-4" />
              JSON
            </Button>
            <Button variant="outline" className="rounded-md" onClick={onExportCsv}>
              <Download className="size-4" />
              CSV
            </Button>
          </div>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-border/50">
          {exportEvents.slice(0, 5).map((event) => (
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
          {exportEvents.length > 5 && (
            <p className="p-3 text-sm text-muted-foreground">
              и ещё {exportEvents.length - 5} событий…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
