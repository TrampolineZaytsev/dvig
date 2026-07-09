import type { Group, Application, Profile } from "@prisma/client";
import type { ApplicationStatus } from "@/lib/auth";

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
}>(
  event: T,
  groups: GroupSummary[],
  applicationByEventId?: Map<number, ApplicationSummary>
): T & { hasRealGroup: boolean; applicationStatus?: Application["status"] } {
  const eventGroups = groups.filter((g) => g.kudagoEventId === event.kudagoId);
  const primary = eventGroups[0];

  if (!primary) {
    return {
      ...event,
      spotsLeft: 0,
      participants: 0,
      groupCapacity: event.groupCapacity,
      moderator: "Группа не открыта",
      hasRealGroup: false,
    };
  }

  const application = event.kudagoId ? applicationByEventId?.get(event.kudagoId) : undefined;

  return {
    ...event,
    groupId: primary.id,
    spotsLeft: primary.spotsLeft,
    participants: primary.participants,
    groupCapacity: primary.capacity,
    moderator: primary.moderatorName,
    hasRealGroup: true,
    applicationStatus: application?.status,
  };
}
