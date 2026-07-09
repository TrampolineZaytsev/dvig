"use client";


import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthPanel } from "@/components/auth/auth-panel";
import type { ApiUser } from "@/lib/client/api-client";
import type { ApplicationSummary } from "@/lib/server/groups";
import type { MyGroupWithPending } from "@/hooks/use-pilot-data";
import { Metric } from "./display";

export function ProfileView({
  user,
  authLoading,
  savedCount,
  applications,
  myGroups,
  onUserChange,
  onApproveApplication,
}: {
  user: ApiUser | null;
  authLoading: boolean;
  savedCount: number;
  applications: ApplicationSummary[];
  myGroups: MyGroupWithPending[];
  onUserChange: (user: ApiUser | null) => void;
  onApproveApplication: (applicationId: string, status: "APPROVED" | "REJECTED") => void;
}) {
  const activeApplications = applications.filter(
    (app) => app.status === "PENDING" || app.status === "APPROVED"
  );

  if (authLoading) {
    return <div className="dvig-panel mt-5 p-8 text-center text-muted-foreground">Загрузка профиля…</div>;
  }

  if (!user) {
    return (
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="dvig-panel p-5">
          <h2 className="text-xl font-semibold">Вход для пилота</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Чтобы подать заявку в группу, создайте аккаунт. Формат пилота — группы 5–7 в публичном месте.
          </p>
        </div>
        <AuthPanel onUserChange={onUserChange} />
      </div>
    );
  }

  const initials = (user.profile?.displayName ?? user.email).slice(0, 1).toUpperCase();

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
      <div className="dvig-panel p-5">
        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold">{user.profile?.displayName ?? "Участник"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {user.profile?.city ?? "Санкт-Петербург"} · {user.email}
            </p>
          </div>
        </div>
        <p className="mt-5 text-sm leading-6 text-muted-foreground">
          Профиль видят модератор при рассмотрении заявки и одобренные участники группы.
          На первом этапе — встречи в группе от 5 человек, не 1-на-1.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {(user.profile?.interests ?? []).map((tag) => (
            <Badge key={tag} variant="outline" className="rounded-md">
              {tag}
            </Badge>
          ))}
        </div>
        {activeApplications.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="font-semibold">Мои заявки</h3>
            {activeApplications.map((app) => (
              <div key={app.id} className="dvig-panel-muted rounded-md p-3 text-sm">
                <p className="font-medium">{app.eventTitle}</p>
                <p className="text-muted-foreground">Статус: {app.status}</p>
                {app.status === "APPROVED" && app.meetingPoint && (
                  <p className="mt-1">Точка встречи: {app.meetingPoint}</p>
                )}
                {app.status === "APPROVED" && app.telegramLink && (
                  <a href={app.telegramLink} className="mt-1 inline-block text-primary hover:underline">
                    Чат группы в Telegram
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
        {myGroups.some((group) => group.pendingApplications.length > 0) && (
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold">Заявки в мои группы</h3>
            {myGroups.map((group) =>
              group.pendingApplications.map((app) => (
                <div key={app.id} className="dvig-panel-muted rounded-md p-3 text-sm">
                  <p className="font-medium">{group.eventTitle}</p>
                  <p>
                    {app.user.displayName} · {app.user.email}
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      className="rounded-md"
                      onClick={() => onApproveApplication(app.id, "APPROVED")}
                    >
                      Одобрить
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-md"
                      onClick={() => onApproveApplication(app.id, "REJECTED")}
                    >
                      Отклонить
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {(user.role === "MODERATOR" || user.role === "ADMIN") && (
          <Link href="/admin" className="mt-4 inline-flex text-sm text-primary hover:underline">
            Панель модератора →
          </Link>
        )}
      </div>
      <div className="space-y-3">
        <Metric label="Заявки" value={activeApplications.length} />
        <Metric label="Сохранено" value={savedCount} />
        <AuthPanel onUserChange={onUserChange} compact />
      </div>
    </div>
  );
}
