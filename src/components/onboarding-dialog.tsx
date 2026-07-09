"use client";

import { useState } from "react";

import type { ApiUser } from "@/lib/api-client";
import { updateProfile } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INTEREST_OPTIONS = ["Кино", "Настолки", "Культура", "Спорт"] as const;

type OnboardingDialogProps = {
  user: ApiUser;
  onComplete: (user: ApiUser) => void;
};

export function OnboardingDialog({ user, onComplete }: OnboardingDialogProps) {
  const [displayName, setDisplayName] = useState(user.profile?.displayName ?? "");
  const [city, setCity] = useState(user.profile?.city ?? "Санкт-Петербург");
  const [interests, setInterests] = useState<string[]>(user.profile?.interests ?? []);
  const [telegramHandle, setTelegramHandle] = useState(user.profile?.telegramHandle ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user.profile?.onboardingDone) {
    return null;
  }

  const toggleInterest = (item: string) => {
    setInterests((current) =>
      current.includes(item) ? current.filter((v) => v !== item) : [...current, item].slice(0, 3)
    );
  };

  const submit = async () => {
    if (!displayName.trim() || interests.length === 0) {
      setError("Укажите имя и хотя бы один интерес");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { user: next } = await updateProfile({
        displayName: displayName.trim(),
        city: city.trim(),
        interests,
        telegramHandle: telegramHandle.trim() || null,
        onboardingDone: true,
        consentAccepted: true,
      });
      onComplete(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить профиль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="dvig-panel max-w-lg w-full space-y-4 p-6">
        <h2 className="text-xl font-bold">Профиль для пилота</h2>
        <p className="text-sm text-muted-foreground">
          Нужно для заявки в группу: имя, город и интересы. Формат — группы 5–7 в публичном месте.
        </p>
        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Имя" className="rounded-md" />
        <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Город" className="rounded-md" />
        <Input
          value={telegramHandle}
          onChange={(e) => setTelegramHandle(e.target.value)}
          placeholder="Telegram (@username, опционально)"
          className="rounded-md"
        />
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((item) => (
            <Button
              key={item}
              type="button"
              variant={interests.includes(item) ? "default" : "outline"}
              className="rounded-md"
              onClick={() => toggleInterest(item)}
            >
              {item}
            </Button>
          ))}
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button className="dvig-btn-primary w-full rounded-md" onClick={() => void submit()} disabled={loading}>
          {loading ? "Сохраняем…" : "Продолжить"}
        </Button>
      </div>
    </div>
  );
}
