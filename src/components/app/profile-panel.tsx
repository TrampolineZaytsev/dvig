"use client";


import Link from "next/link";
import { useState } from "react";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ApiUser } from "@/lib/client/api-client";
import { SafetyRow, TraceItem } from "./display";

export function ProfilePanel({
  user,
  activeApplications,
  embedded = false,
}: {
  user: ApiUser | null;
  activeApplications: number;
  embedded?: boolean;
}) {
  const [exportState, setExportState] = useState("Архив не запрошен");

  return (
    <div className={embedded ? "grid gap-4 lg:grid-cols-[1fr_420px]" : "mt-5 grid gap-4 lg:grid-cols-[1fr_420px]"}>
      <div className="dvig-panel p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-semibold">Профиль и цифровой след</h3>
          <Badge variant="outline" className="rounded-md">
            Пилот
          </Badge>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Данные хранятся на сервере пилота. Заявки, check-in и жалобы — для модерации и метрик.
        </p>
        <Link href="/safety#data" className="mt-3 inline-flex text-sm text-primary hover:underline">
          Что хранится и удаляется →
        </Link>
        <div className="mt-5 grid gap-3">
          <TraceItem title="Профиль" value="имя, интересы, город, доверенный контакт" />
          <TraceItem title="События" value="заявки, check-in, оценки после встречи" />
          <TraceItem title="Безопасность" value="жалобы и тревожные сигналы с ограниченным сроком хранения" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="dvig-panel p-5">
          <h3 className="font-semibold">Управление аккаунтом</h3>
          <div className="mt-4 space-y-3 text-sm">
            <SafetyRow label="Активные заявки" value={`${activeApplications}`} />
            <SafetyRow label="Экспорт данных" value={exportState} />
            <SafetyRow label="Аккаунт" value={user?.email ?? "Не выполнен вход"} />
          </div>
          <div className="mt-4 grid gap-2">
            <Button
              variant="outline"
              className="rounded-md"
              onClick={() => setExportState("Запрос принят — свяжемся по email в течение 7 дней")}
            >
              <FileText className="size-4" />
              Запросить архив данных
            </Button>
            <Link href="/privacy" className="text-sm text-primary hover:underline">
              Политика конфиденциальности
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
