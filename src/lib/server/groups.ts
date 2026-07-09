import type { Group, Application, Profile } from "@prisma/client";
import type { ApplicationStatus } from "@/lib/server/auth";

export type GroupSummary = {
  id: string;
  kudagoEventId: number;
  eventTitle: string;
  eventDate: string;
  capacity: number;
  meetingPoint: string | null;
  telegramLink: string | null;
  status: Group["status"] | string;
  participants: number;
  spotsLeft: number;
  moderatorName: string;
  approvedMembers?: { displayName: string; initials: string }[];
};

export type ApplicationSummary = {
  id: string;
  groupId: string;
  kudagoEventId: number;
  eventTitle: string;
  status: Application["status"] | string;
  message: string | null;
  createdAt: string;
  meetingPoint?: string | null;
  telegramLink?: string | null;
};

export function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export function buildGroupSummary(
  group: Group & {
    moderator: { profile: Profile | null };
    applications: { status: Application["status"]; user: { profile: Profile | null } }[];
  },
  options?: { includeMembers?: boolean; viewerApproved?: boolean }
): GroupSummary {
  const approved = group.applications.filter((app) => app.status === "APPROVED");
  const participants = approved.length;
  const spotsLeft = Math.max(0, group.capacity - participants);

  return {
    id: group.id,
    kudagoEventId: group.kudagoEventId,
    eventTitle: group.eventTitle,
    eventDate: group.eventDate.toISOString(),
    capacity: group.capacity,
    meetingPoint: options?.viewerApproved ? group.meetingPoint : null,
    telegramLink: options?.viewerApproved ? group.telegramLink : null,
    status: group.status,
    participants,
    spotsLeft,
    moderatorName: group.moderator.profile?.displayName ?? "Модератор",
    approvedMembers:
      options?.includeMembers && options.viewerApproved
        ? approved.map((app) => ({
            displayName: app.user.profile?.displayName ?? "Участник",
            initials: initialsFromName(app.user.profile?.displayName ?? "У"),
          }))
        : undefined,
  };
}

export function mergeEventWithGroups<T extends {
  kudagoId?: number;
  spotsLeft: number;
  participants: number;
  groupCapacity: number;
  moderator: string;
  groupId?: string;
  place?: string;
}>(
  event: T,
  groups: GroupSummary[],
  applications?: ApplicationSummary[]
): T & {
  hasRealGroup: boolean;
  groupsCount: number;
  applicationStatus?: Application["status"] | string;
  availableGroups: GroupSummary[];
} {
  const eventGroups = groups
    .filter((g) => g.kudagoEventId === event.kudagoId && g.spotsLeft > 0)
    .sort((a, b) => b.spotsLeft - a.spotsLeft);

  const allEventGroups = groups.filter((g) => g.kudagoEventId === event.kudagoId);
  const userApps = (applications ?? []).filter((app) =>
    allEventGroups.some((group) => group.id === app.groupId)
  );
  const activeApp = userApps.find((app) => app.status === "PENDING" || app.status === "APPROVED");

  if (eventGroups.length === 0 && allEventGroups.length === 0) {
    return {
      ...event,
      spotsLeft: 0,
      participants: 0,
      groupCapacity: event.groupCapacity,
      moderator: "Создайте группу или дождитесь других",
      hasRealGroup: false,
      groupsCount: 0,
      availableGroups: [],
      applicationStatus: activeApp?.status,
      groupId: activeApp?.groupId,
    };
  }

  const primary = eventGroups[0] ?? allEventGroups[0];
  const totalSpots = eventGroups.reduce((sum, group) => sum + group.spotsLeft, 0);
  const totalParticipants = allEventGroups.reduce((sum, group) => sum + group.participants, 0);

  return {
    ...event,
    groupId: activeApp?.groupId ?? primary.id,
    spotsLeft: totalSpots,
    participants: totalParticipants,
    groupCapacity: primary.capacity,
    moderator:
      allEventGroups.length > 1
        ? `${allEventGroups.length} группы`
        : primary.moderatorName,
    hasRealGroup: allEventGroups.length > 0,
    groupsCount: allEventGroups.length,
    availableGroups: allEventGroups,
    applicationStatus: activeApp?.status,
    meetingPoint: activeApp?.status === "APPROVED" ? activeApp.meetingPoint : undefined,
    telegramLink: activeApp?.status === "APPROVED" ? activeApp.telegramLink : undefined,
  };
}
