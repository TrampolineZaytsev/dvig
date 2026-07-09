"use client";


import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BellRing,
  Check,
  LogOut,
  MapPin,
  ShieldCheck,
  TriangleAlert,
  UserCheck,
} from "lucide-react";
import { AuthPanel } from "@/components/auth/auth-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  submitCheckIn,
  submitFeedback,
  submitReport,
  updateProfile,
} from "@/lib/client/api-client";
import type { ApiUser } from "@/lib/client/api-client";
import type { ApplicationSummary } from "@/lib/server/groups";
import { SafetyCard, SafetyRow } from "./display";

export function SafetyPanel({
  applications,
  user,
  onUserChange,
  embedded = false,
}: {
  applications: ApplicationSummary[];
  user: ApiUser | null;
  onUserChange: (user: ApiUser | null) => void;
  embedded?: boolean;
}) {
  const approvedApp = applications.find((app) => app.status === "APPROVED");
  const [panicState, setPanicState] = useState("Не активирована");
  const [checkInState, setCheckInState] = useState("Ожидает встречи");
  const [trustedContact, setTrustedContact] = useState(user?.profile?.trustedContact ?? "");
  const [feedbackRating, setFeedbackRating] = useState(4);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [feedbackState, setFeedbackState] = useState<string | null>(null);

  useEffect(() => {
    setTrustedContact(user?.profile?.trustedContact ?? "");
  }, [user?.profile?.trustedContact]);

  const saveTrustedContact = async () => {
    if (!user) return;
    const { user: next } = await updateProfile({ trustedContact: trustedContact || null });
    onUserChange(next);
  };

  const handleCheckIn = async (status: "checked_in" | "left") => {
    if (!approvedApp) {
      setCheckInState("Нужна одобренная заявка");
      return;
    }
    await submitCheckIn(approvedApp.groupId, status);
    setCheckInState(status === "checked_in" ? "Я на месте" : "Вышел(а) из встречи");
  };

  const handlePanic = async () => {
    if (!user) {
      setPanicState("Войдите в аккаунт");
      return;
    }
    await submitReport({
      type: "PANIC",
      groupId: approvedApp?.groupId,
    });
    setPanicState("Сигнал отправлен модератору");
  };

  const handleComplaint = async () => {
    if (!user) return;
    await submitReport({
      type: "COMPLAINT",
      groupId: approvedApp?.groupId,
      message: "Жалоба из пилота",
    });
  };

  const submitEventFeedback = async () => {
    if (!approvedApp) return;
    await submitFeedback({
      groupId: approvedApp.groupId,
      rating: feedbackRating,
      comment: feedbackNote || undefined,
    });
    setFeedbackState("Спасибо! Оценка сохранена.");
  };

  const activeCount = applications.filter((a) => a.status === "PENDING" || a.status === "APPROVED").length;

  return (
    <div className={embedded ? "grid gap-4 lg:grid-cols-[1fr_420px]" : "mt-5 grid gap-4 lg:grid-cols-[1fr_420px]"}>
      <div className="space-y-4">
        <div className="dvig-panel p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-1 size-6 text-primary" />
            <div>
              <h3 className="text-xl font-semibold">Контур безопасности офлайн-встречи</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Пилот: группы в публичных местах, модерация заявок, чек-ин и эскалация тревоги
                дежурному модератору.
              </p>
              <Link href="/safety" className="mt-3 inline-flex text-sm text-primary hover:underline">
                Полная политика безопасности и данных →
              </Link>
            </div>
          </div>
        </div>

        {!user && <AuthPanel onUserChange={onUserChange} />}

        <div className="grid gap-4 md:grid-cols-2">
          <SafetyCard
            icon={UserCheck}
            title="Верификация"
            status="Email + ручная модерация"
            text="На пилоте достаточно email и проверки модератором при одобрении заявки."
          />
          <SafetyCard
            icon={MapPin}
            title="Публичная точка"
            status={approvedApp?.meetingPoint ? "Назначена" : "После одобрения"}
            text={
              approvedApp?.meetingPoint ??
              "Точка встречи видна только после одобрения заявки модератором."
            }
          />
          <SafetyCard
            icon={BellRing}
            title="Тревожная кнопка"
            status={panicState}
            text="Эскалация модератору и доверенному контакту. При угрозе жизни — 112."
            action="Активировать"
            onAction={() => void handlePanic()}
          />
          <SafetyCard
            icon={TriangleAlert}
            title="Жалоба"
            status="Доступно после входа"
            text="Жалоба уходит модератору пилота."
            action="Пожаловаться"
            onAction={() => void handleComplaint()}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="dvig-panel p-5">
          <h3 className="font-semibold">Мой safety-чеклист</h3>
          <div className="mt-4 space-y-3 text-sm">
            <SafetyRow label="Активные заявки" value={`${activeCount}`} />
            <SafetyRow label="Доверенный контакт" value={trustedContact || "Не указан"} />
            <SafetyRow label="Чек-ин" value={checkInState} />
          </div>
          <div className="mt-4 grid gap-2">
            <Input
              value={trustedContact}
              onChange={(event) => setTrustedContact(event.target.value)}
              className="rounded-md"
              placeholder="Доверенный контакт"
              aria-label="Доверенный контакт"
            />
            <Button variant="outline" className="rounded-md" onClick={() => void saveTrustedContact()}>
              Сохранить контакт
            </Button>
            <Button className="dvig-btn-primary rounded-lg" onClick={() => void handleCheckIn("checked_in")}>
              <Check className="size-4" />
              Отметиться на месте
            </Button>
            <Button variant="outline" className="rounded-md" onClick={() => void handleCheckIn("left")}>
              <LogOut className="size-4" />
              Выйти из встречи
            </Button>
          </div>
        </div>

        {approvedApp && (
          <div className="dvig-panel p-5">
            <h3 className="font-semibold">Как прошло?</h3>
            <p className="mt-2 text-sm text-muted-foreground">Оценка после check-in (1–5)</p>
            <div className="mt-3 flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={feedbackRating === value ? "default" : "outline"}
                  className="rounded-md"
                  onClick={() => setFeedbackRating(value)}
                >
                  {value}
                </Button>
              ))}
            </div>
            <Input
              className="mt-3 rounded-md"
              placeholder="Комментарий (опционально)"
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
            />
            <Button className="mt-3 w-full rounded-md" onClick={() => void submitEventFeedback()}>
              Отправить оценку
            </Button>
            {feedbackState && <p className="mt-2 text-sm text-primary">{feedbackState}</p>}
          </div>
        )}

        <div className="rounded-md border border-border/50 bg-[#fff7ed] p-5">
          <h3 className="font-semibold">Пилот</h3>
          <p className="mt-2 text-sm leading-6 text-accent-foreground">
            Регламент: <Link href="/privacy" className="underline">политика ПДн</Link>, модератор на смене,
            группы 5–7, только публичные места. См. PILOT_REGULATIONS.md в репозитории.
          </p>
        </div>
      </div>
    </div>
  );
}
