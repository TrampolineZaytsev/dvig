"use client";

import { useCallback, useEffect, useState } from "react";

import type { ApiUser } from "@/lib/client/api-client";
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  trackEvent,
} from "@/lib/client/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthPanelProps = {
  onUserChange?: (user: ApiUser | null) => void;
  compact?: boolean;
};

export function useAuth() {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { user: next } = await fetchCurrentUser();
      setUser(next);
      return next;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { user, setUser, loading, refresh };
}

export function AuthPanel({ onUserChange, compact }: AuthPanelProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, setUser, refresh } = useAuth();

  useEffect(() => {
    onUserChange?.(user);
  }, [user, onUserChange]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "register") {
        if (!consent) {
          throw new Error("Нужно согласие с политикой конфиденциальности");
        }
        const { user: next } = await registerUser({
          email,
          password,
          displayName,
          consentAccepted: true,
        });
        setUser(next);
        void trackEvent("user_registered");
      } else {
        const { user: next } = await loginUser(email, password);
        setUser(next);
        void trackEvent("user_logged_in");
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    await refresh();
  };

  if (user) {
    return (
      <div className={compact ? "text-sm" : "dvig-panel p-4"}>
        <p className="font-medium">{user.profile?.displayName ?? user.email}</p>
        <p className="text-muted-foreground">{user.email}</p>
        {!compact && (
          <Button variant="outline" className="mt-3 rounded-md" onClick={() => void logout()}>
            Выйти
          </Button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={compact ? "space-y-2" : "dvig-panel space-y-3 p-4"}>
      {!compact && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === "login" ? "default" : "outline"}
            className="rounded-md"
            onClick={() => setMode("login")}
          >
            Вход
          </Button>
          <Button
            type="button"
            variant={mode === "register" ? "default" : "outline"}
            className="rounded-md"
            onClick={() => setMode("register")}
          >
            Регистрация
          </Button>
        </div>
      )}
      {mode === "register" && (
        <Input
          placeholder="Имя"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="rounded-md"
          required
        />
      )}
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-md"
        required
      />
      <Input
        type="password"
        placeholder="Пароль (мин. 8 символов)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded-md"
        required
        minLength={8}
      />
      {mode === "register" && (
        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <span>
            Согласен с{" "}
            <a href="/privacy" className="text-primary hover:underline">
              политикой конфиденциальности
            </a>{" "}
            и{" "}
            <a href="/terms" className="text-primary hover:underline">
              условиями
            </a>
          </span>
        </label>
      )}
      {error && <p className="text-sm text-red-400">{error}</p>}
      <Button type="submit" className="dvig-btn-primary w-full rounded-md" disabled={loading}>
        {loading ? "…" : mode === "login" ? "Войти" : "Создать аккаунт"}
      </Button>
    </form>
  );
}
