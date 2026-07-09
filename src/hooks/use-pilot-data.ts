"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { ApiUser } from "@/lib/api-client";
import {
  cancelApplication,
  createApplication,
  fetchCurrentUser,
  fetchGroups,
  fetchMyApplications,
  trackEvent,
} from "@/lib/api-client";
import type { ApplicationSummary, GroupSummary } from "@/lib/groups";
import { mergeEventWithGroups } from "@/lib/groups";
import type { DvigEvent } from "@/lib/events";

export function usePilotData() {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);

  const refreshAuth = useCallback(async () => {
    setAuthLoading(true);
    try {
      const { user: next } = await fetchCurrentUser();
      setUser(next);
      return next;
    } catch {
      setUser(null);
      return null;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const refreshSocial = useCallback(async () => {
    try {
      const [{ groups: nextGroups }, appsResult] = await Promise.all([
        fetchGroups(),
        user ? fetchMyApplications().catch(() => ({ applications: [] as ApplicationSummary[] })) : Promise.resolve({ applications: [] as ApplicationSummary[] }),
      ]);
      setGroups(nextGroups);
      setApplications(appsResult.applications);
    } catch {
      setGroups([]);
      setApplications([]);
    }
  }, [user]);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    void refreshSocial();
  }, [refreshSocial, user?.id]);

  const applicationByEventId = useMemo(() => {
    const map = new Map<number, ApplicationSummary>();
    for (const app of applications) {
      map.set(app.kudagoEventId, app);
    }
    return map;
  }, [applications]);

  const mergeEvents = useCallback(
    (events: DvigEvent[]) =>
      events.map((event) => mergeEventWithGroups(event, groups, applicationByEventId)),
    [applicationByEventId, groups]
  );

  const submitApplication = useCallback(
    async (event: DvigEvent) => {
      if (!user) {
        throw new Error("Войдите или зарегистрируйтесь, чтобы подать заявку");
      }
      if (!user.profile?.onboardingDone) {
        throw new Error("Завершите онбординг профиля");
      }
      if (!event.groupId) {
        throw new Error("Для этого события пока нет открытой группы пилота");
      }

      const existing = applications.find((app) => app.groupId === event.groupId);
      if (existing?.status === "PENDING" || existing?.status === "APPROVED") {
        return existing;
      }

      const { application } = await createApplication(event.groupId);
      setApplications((current) => {
        const filtered = current.filter((item) => item.id !== application.id);
        return [application, ...filtered];
      });
      void trackEvent("application_created", { kudagoEventId: event.kudagoId, groupId: event.groupId });
      await refreshSocial();
      return application;
    },
    [applications, refreshSocial, user]
  );

  const cancelUserApplication = useCallback(
    async (applicationId: string) => {
      const { application } = await cancelApplication(applicationId);
      setApplications((current) =>
        current.map((item) => (item.id === application.id ? application : item))
      );
      await refreshSocial();
    },
    [refreshSocial]
  );

  const isJoined = useCallback(
    (event: DvigEvent) => {
      if (!event.kudagoId) return false;
      const app = applicationByEventId.get(event.kudagoId);
      return app?.status === "PENDING" || app?.status === "APPROVED";
    },
    [applicationByEventId]
  );

  return {
    user,
    setUser,
    authLoading,
    groups,
    applications,
    refreshAuth,
    refreshSocial,
    mergeEvents,
    submitApplication,
    cancelUserApplication,
    isJoined,
    applicationByEventId,
  };
}
