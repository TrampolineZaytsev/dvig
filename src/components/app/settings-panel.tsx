"use client";


import type { ApiUser } from "@/lib/client/api-client";
import type { ApplicationSummary } from "@/lib/server/groups";
import { ProfilePanel } from "./profile-panel";
import { SafetyPanel } from "./safety-panel";

export function SettingsPanel({
  applications,
  user,
  onUserChange,
}: {
  applications: ApplicationSummary[];
  user: ApiUser | null;
  onUserChange: (user: ApiUser | null) => void;
}) {
  const activeCount = applications.filter((a) => a.status === "PENDING" || a.status === "APPROVED").length;

  return (
    <div className="mt-5 space-y-8">
      <section>
        <h2 className="mb-4 text-lg font-semibold">Приложение</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Город", "Санкт-Петербург", "Пилот ограничен СПб и афишей KudaGo."],
            ["Краткое описание", "Локальный текст", "Усечение описания KudaGo — не LLM."],
            ["Telegram", "Уведомления", "Одобрение заявки и эскалация safety — через бота модератора."],
            ["Данные / KudaGo", "Афиша API", "События из KudaGo, кэш ~5 минут."],
            ["Социальный слой", "Пилот", "Реальные группы, заявки и модерация в базе данных."],
          ].map(([title, value, text]) => (
            <div key={title} className="dvig-panel p-4">
              <span className="text-sm text-muted-foreground/80">{title}</span>
              <h3 className="mt-1 text-lg font-semibold">{value}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-lg font-semibold">Безопасность</h2>
        <SafetyPanel applications={applications} user={user} onUserChange={onUserChange} embedded />
      </section>
      <section>
        <h2 className="mb-4 text-lg font-semibold">Профиль и цифровой след</h2>
        <ProfilePanel user={user} activeApplications={activeCount} embedded />
      </section>
    </div>
  );
}
