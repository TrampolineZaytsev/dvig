"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiUser } from "@/lib/api-client";
import type { GroupSummary } from "@/lib/groups";
import type { DvigEvent } from "@/lib/events";

type GroupSocialPanelProps = {
  event: DvigEvent;
  user: ApiUser | null;
  groups: GroupSummary[];
  userOwnsGroup: boolean;
  onJoinGroup: (groupId: string) => Promise<void>;
  onCreateGroup: (input: {
    meetingPoint?: string;
    telegramLink?: string;
    capacity?: number;
  }) => Promise<void>;
  onRequireAuth: () => void;
};

export function GroupSocialPanel({
  event,
  user,
  groups,
  userOwnsGroup,
  onJoinGroup,
  onCreateGroup,
  onRequireAuth,
}: GroupSocialPanelProps) {
  const [meetingPoint, setMeetingPoint] = useState(event.place || "");
  const [telegramLink, setTelegramLink] = useState("");
  const [capacity, setCapacity] = useState("7");
  const [loading, setLoading] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(groups.length === 0);

  const openGroups = groups.filter((group) => group.status === "OPEN" && group.spotsLeft > 0);

  const run = async (key: string, action: () => Promise<void>, success: string) => {
    setLoading(key);
    setNotice(null);
    try {
      await action();
      setNotice(success);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(null);
    }
  };

  if (!user) {
    return (
      <div className="dvig-panel space-y-3 p-4">
        <h3 className="font-semibold">Группы на это событие</h3>
        <p className="text-sm text-muted-foreground">
          Войдите, чтобы создать свою группу или присоединиться к существующей.
        </p>
        <Button className="rounded-md" onClick={onRequireAuth}>
          Войти / зарегистрироваться
        </Button>
      </div>
    );
  }

  return (
    <div className="dvig-panel space-y-4 p-4">
      <div>
        <h3 className="font-semibold">Группы на это событие</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Создайте свою группу или присоединитесь к чужой. Организатор одобряет заявки.
        </p>
      </div>

      {openGroups.length > 0 ? (
        <div className="space-y-2">
          {openGroups.map((group) => (
            <div
              key={group.id}
              className="flex flex-col gap-2 rounded-md border border-border/50 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="text-sm">
                <p className="font-medium">Организатор: {group.moderatorName}</p>
                <p className="text-muted-foreground">
                  В группе {group.participants} · свободно {group.spotsLeft} · до {group.capacity}
                </p>
              </div>
              <Button
                className="shrink-0 rounded-md"
                disabled={loading !== null}
                onClick={() =>
                  void run(
                    group.id,
                    () => onJoinGroup(group.id),
                    "Заявка отправлена. Организатор рассмотрит её."
                  )
                }
              >
                {loading === group.id ? "…" : "Присоединиться"}
              </Button>
            </div>
          ))}
        </div>
      ) : groups.length > 0 ? (
        <p className="text-sm text-muted-foreground">Все группы заполнены. Создайте новую.</p>
      ) : (
        <p className="text-sm text-muted-foreground">Пока нет групп — будьте первым организатором.</p>
      )}

      {!userOwnsGroup && (
        <div className="space-y-3 border-t border-border/40 pt-4">
          <Button
            variant="outline"
            className="w-full rounded-md"
            onClick={() => setShowCreateForm((value) => !value)}
          >
            {showCreateForm ? "Скрыть форму" : "Создать свою группу"}
          </Button>

          {showCreateForm && (
            <div className="space-y-2">
              <Input
                placeholder="Точка встречи (публичное место)"
                value={meetingPoint}
                onChange={(e) => setMeetingPoint(e.target.value)}
                className="rounded-md"
              />
              <Input
                placeholder="Ссылка на Telegram-чат (опционально)"
                value={telegramLink}
                onChange={(e) => setTelegramLink(e.target.value)}
                className="rounded-md"
              />
              <Input
                placeholder="Размер группы (5–15)"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="rounded-md"
              />
              <Button
                className="dvig-btn-primary w-full rounded-md"
                disabled={loading !== null}
                onClick={() =>
                  void run(
                    "create",
                    () =>
                      onCreateGroup({
                        meetingPoint: meetingPoint.trim() || undefined,
                        telegramLink: telegramLink.trim() || undefined,
                        capacity: Number(capacity) || 7,
                      }),
                    "Группа создана. Вы уже в ней как организатор."
                  )
                }
              >
                {loading === "create" ? "Создаём…" : "Создать группу"}
              </Button>
            </div>
          )}
        </div>
      )}

      {userOwnsGroup && (
        <p className="text-sm text-primary">
          У вас уже есть группа на это событие — заявки можно одобрить в профиле.
        </p>
      )}

      {notice && <p className="text-sm text-muted-foreground">{notice}</p>}
    </div>
  );
}
