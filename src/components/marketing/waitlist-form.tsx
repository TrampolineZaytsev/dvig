"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinWaitlist } from "@/lib/client/api-client";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");
  const [interests, setInterests] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      await joinWaitlist({
        email: email.trim() || undefined,
        telegram: telegram.trim() || undefined,
        interests: interests.trim() || undefined,
      });
      setStatus("success");
      setEmail("");
      setTelegram("");
      setInterests("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Не удалось отправить заявку");
    }
  };

  if (status === "success") {
    return (
      <div className="dvig-panel border-primary/30 p-6">
        <p className="font-medium text-foreground">Спасибо! Мы свяжемся, когда откроем ближайшую группу.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Пилот: настолки, кино и культура в Санкт-Петербурге. Группы 5–7 человек, публичные места.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="dvig-panel space-y-4 p-6">
      <div>
        <h2 className="text-xl font-bold">Хочу в пилот</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Оставьте контакт — пригласим на конкретное событие с открытой группой, не «скачайте приложение».
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md"
        />
        <Input
          placeholder="Telegram (@username)"
          value={telegram}
          onChange={(e) => setTelegram(e.target.value)}
          className="rounded-md"
        />
      </div>
      <Input
        placeholder="Интересы (например: настолки, кино)"
        value={interests}
        onChange={(e) => setInterests(e.target.value)}
        className="rounded-md"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" className="dvig-btn-primary rounded-md" disabled={status === "loading"}>
        {status === "loading" ? "Отправляем…" : "Записаться в пилот"}
      </Button>
    </form>
  );
}
