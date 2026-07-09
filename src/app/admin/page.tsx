"use client";

import { useEffect, useState } from "react";

import { AuthPanel, useAuth } from "@/components/auth/auth-panel";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createPilotGroup,
  fetchAdminStats,
  moderateApplication,
} from "@/lib/client/api-client";

export default function AdminPage() {
  const { user, setUser, loading } = useAuth();
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchAdminStats>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [groupForm, setGroupForm] = useState({
    kudagoEventId: "",
    eventTitle: "",
    eventDate: "",
    capacity: "7",
    meetingPoint: "",
    telegramLink: "",
  });

  const load = async () => {
    try {
      const data = await fetchAdminStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Нет доступа");
      setStats(null);
    }
  };

  useEffect(() => {
    if (user && (user.role === "MODERATOR" || user.role === "ADMIN")) {
      void load();
    }
  }, [user]);

  const isModerator = user?.role === "MODERATOR" || user?.role === "ADMIN";

  return (
    <main className="dvig-page min-h-screen text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Панель модератора пилота</h1>
        <p className="mt-2 text-muted-foreground">
          Заявки, группы, check-in rate и метрики конверсии.
        </p>

        {!user && !loading && (
          <div className="mt-8 max-w-md">
            <AuthPanel onUserChange={setUser} />
          </div>
        )}

        {user && !isModerator && (
          <p className="mt-8 text-red-400">Доступ только для модераторов пилота.</p>
        )}

        {error && <p className="mt-6 text-red-400">{error}</p>}

        {stats && (
          <div className="mt-8 space-y-8">
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Пользователи", stats.stats.users],
                ["Группы", stats.stats.groups],
                ["Заявки", stats.stats.applications],
                ["Check-in rate", `${stats.stats.checkInRate}%`],
                ["Одобрено", stats.stats.approvedApplications],
                ["Check-in", stats.stats.checkIns],
                ["Waitlist", stats.stats.waitlist],
                ["Ср. оценка", stats.stats.avgRating?.toFixed(1) ?? "—"],
              ].map(([label, value]) => (
                <div key={label} className="dvig-panel p-4">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
              ))}
            </section>

            <section>
              <h2 className="text-xl font-semibold">Очередь заявок</h2>
              <div className="mt-4 space-y-3">
                {stats.pendingApplications.length === 0 && (
                  <p className="text-muted-foreground">Нет заявок в ожидании.</p>
                )}
                {stats.pendingApplications.map((app) => (
                  <div key={app.id} className="dvig-panel flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-medium">{app.user.displayName}</p>
                      <p className="text-sm text-muted-foreground">{app.group.eventTitle}</p>
                      <p className="text-xs text-muted-foreground">{app.user.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="rounded-md"
                        onClick={() => void moderateApplication(app.id, "APPROVED").then(load)}
                      >
                        Одобрить
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-md"
                        onClick={() => void moderateApplication(app.id, "REJECTED").then(load)}
                      >
                        Отклонить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Создать группу пилота</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Укажите kudagoEventId из карточки события (число в URL KudaGo).
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input
                  placeholder="KudaGo event ID"
                  value={groupForm.kudagoEventId}
                  onChange={(e) => setGroupForm((s) => ({ ...s, kudagoEventId: e.target.value }))}
                />
                <Input
                  placeholder="Название события"
                  value={groupForm.eventTitle}
                  onChange={(e) => setGroupForm((s) => ({ ...s, eventTitle: e.target.value }))}
                />
                <Input
                  type="datetime-local"
                  value={groupForm.eventDate}
                  onChange={(e) => setGroupForm((s) => ({ ...s, eventDate: e.target.value }))}
                />
                <Input
                  placeholder="Вместимость"
                  value={groupForm.capacity}
                  onChange={(e) => setGroupForm((s) => ({ ...s, capacity: e.target.value }))}
                />
                <Input
                  placeholder="Точка встречи"
                  value={groupForm.meetingPoint}
                  onChange={(e) => setGroupForm((s) => ({ ...s, meetingPoint: e.target.value }))}
                />
                <Input
                  placeholder="Ссылка Telegram-чата"
                  value={groupForm.telegramLink}
                  onChange={(e) => setGroupForm((s) => ({ ...s, telegramLink: e.target.value }))}
                />
              </div>
              <Button
                className="mt-4 rounded-md"
                onClick={() =>
                  void createPilotGroup({
                    kudagoEventId: Number(groupForm.kudagoEventId),
                    eventTitle: groupForm.eventTitle,
                    eventDate: new Date(groupForm.eventDate).toISOString(),
                    capacity: Number(groupForm.capacity),
                    meetingPoint: groupForm.meetingPoint || undefined,
                    telegramLink: groupForm.telegramLink || undefined,
                  }).then(load)
                }
              >
                Создать группу
              </Button>
            </section>

            <section>
              <h2 className="text-xl font-semibold">Группы</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="p-2">Событие</th>
                      <th className="p-2">KudaGo ID</th>
                      <th className="p-2">Одобрено</th>
                      <th className="p-2">Ожидают</th>
                      <th className="p-2">Check-in</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.groups.map((group) => (
                      <tr key={group.id} className="border-t border-border/40">
                        <td className="p-2">{group.eventTitle}</td>
                        <td className="p-2">{group.kudagoEventId}</td>
                        <td className="p-2">{group.approved}</td>
                        <td className="p-2">{group.pending}</td>
                        <td className="p-2">{group.checkIns}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
