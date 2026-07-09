"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { ApiUser } from "@/lib/client/api-client";
import {
  cancelApplication,
  createApplication,
  createGroup,
  fetchCurrentUser,
  fetchGroups,
  fetchMyApplications,
  fetchMyGroups,
  moderateApplication,
  trackEvent,
} from "@/lib/client/api-client";
import { eventToGroupDateTime } from "@/lib/events/group";
import type { ApplicationSummary, GroupSummary } from "@/lib/server/groups";
import { mergeEventWithGroups } from "@/lib/server/groups";
import type { DvigEvent } from "@/lib/events";

export type MyGroupWithPending = GroupSummary & {
  pendingApplications: Array<{
    id: string;
    status: string;
    message: string | null;
    createdAt: string;
    user: { id: string; displayName: string; email: string };
  }>;
};

export function usePilotData() {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [myGroups, setMyGroups] = useState<MyGroupWithPending[]>([]);
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
      const [{ groups: nextGroups }, appsResult, mineResult] = await Promise.all([
        fetchGroups(),
        user
          ? fetchMyApplications().catch(() => ({ applications: [] as ApplicationSummary[] }))
          : Promise.resolve({ applications: [] as ApplicationSummary[] }),
        user
          ? fetchMyGroups().catch(() => ({ groups: [] as MyGroupWithPending[] }))
          : Promise.resolve({ groups: [] as MyGroupWithPending[] }),
      ]);
      setGroups(nextGroups);
      setApplications(appsResult.applications);
      setMyGroups(mineResult.groups);
    } catch {
      setGroups([]);
      setApplications([]);
      setMyGroups([]);
    }
  }, [user]);

  useEffect(() => {
    void refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    void refreshSocial();
  }, [refreshSocial, user?.id]);

  const mergeEvents = useCallback(
    (events: DvigEvent[]) =>
      events.map((event) => mergeEventWithGroups(event, groups, applications)),
    [applications, groups]
  );

  const groupsForEvent = useCallback(
    (kudagoId?: number) => groups.filter((group) => group.kudagoEventId === kudagoId),
    [groups]
  );

  const submitApplicationToGroup = useCallback(
    async (groupId: string, kudagoEventId?: number) => {
      if (!user) {
        throw new Error("Войдите или зарегистрируйтесь, чтобы подать заявку");
      }
      if (!user.profile?.onboardingDone) {
        throw new Error("Завершите онбординг профиля");
      }

      const existing = applications.find(
        (app) => app.groupId === groupId && (app.status === "PENDING" || app.status === "APPROVED")
      );
      if (existing) {
        return existing;
      }

      const { application } = await createApplication(groupId);
      setApplications((current) => {
        const filtered = current.filter((item) => item.id !== application.id);
        return [application, ...filtered];
      });
      void trackEvent("application_created", { kudagoEventId, groupId });
      await refreshSocial();
      return application;
    },
    [applications, refreshSocial, user]
  );

  const submitApplication = useCallback(
    async (event: DvigEvent, groupId?: string) => {
      const targetGroupId = groupId ?? event.groupId;
      if (!targetGroupId) {
        throw new Error("Выберите группу или создайте свою");
      }
      return submitApplicationToGroup(targetGroupId, event.kudagoId);
    },
    [submitApplicationToGroup]
  );

  const createGroupForEvent = useCallback(
    async (
      event: DvigEvent,
      input?: { meetingPoint?: string; telegramLink?: string; capacity?: number }
    ) => {
      if (!user) {
        throw new Error("Войдите или зарегистрируйтесь, чтобы создать группу");
      }
      if (!user.profile?.onboardingDone) {
        throw new Error("Завершите онбординг профиля");
      }
      if (!event.kudagoId) {
        throw new Error("Не удалось определить событие KudaGo");
      }

      const { group } = await createGroup({
        kudagoEventId: event.kudagoId,
        eventTitle: event.title,
        eventDate: eventToGroupDateTime(event),
        capacity: input?.capacity ?? 7,
        meetingPoint: input?.meetingPoint?.trim() || event.place || undefined,
        telegramLink: input?.telegramLink?.trim() || undefined,
      });

      void trackEvent("group_created", { kudagoEventId: event.kudagoId, groupId: group.id });
      await refreshSocial();
      return group;
    },
    [refreshSocial, user]
  );

  const approveApplication = useCallback(
    async (applicationId: string, status: "APPROVED" | "REJECTED") => {
      await moderateApplication(applicationId, status);
      await refreshSocial();
    },
    [refreshSocial]
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
      return applications.some(
        (app) =>
          app.kudagoEventId === event.kudagoId &&
          (app.status === "PENDING" || app.status === "APPROVED")
      );
    },
    [applications]
  );

  const userOwnsGroupForEvent = useCallback(
    (kudagoId?: number) => myGroups.some((group) => group.kudagoEventId === kudagoId),
    [myGroups]
  );

  return {
    user,
    setUser,
    authLoading,
    groups,
    myGroups,
    applications,
    refreshAuth,
    refreshSocial,
    mergeEvents,
    groupsForEvent,
    submitApplication,
    submitApplicationToGroup,
    createGroupForEvent,
    approveApplication,
    cancelUserApplication,
    isJoined,
    userOwnsGroupForEvent,
  };
}
