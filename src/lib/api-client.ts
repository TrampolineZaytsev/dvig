import type { PublicUser } from "@/lib/auth";
import type { ApplicationSummary, GroupSummary } from "@/lib/groups";
import type { ApplicationStatus } from "@/lib/auth";

export type ApiUser = PublicUser;

async function api<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(("error" in data && data.error) || "Ошибка запроса");
  }
  return data;
}

export async function fetchCurrentUser() {
  return api<{ user: ApiUser | null }>("/api/auth/me");
}

export async function loginUser(email: string, password: string) {
  return api<{ user: ApiUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(input: {
  email: string;
  password: string;
  displayName: string;
  consentAccepted: true;
}) {
  return api<{ user: ApiUser }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function logoutUser() {
  return api<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
}

export async function updateProfile(input: {
  displayName?: string;
  city?: string;
  interests?: string[];
  bio?: string | null;
  trustedContact?: string | null;
  telegramHandle?: string | null;
  onboardingDone?: boolean;
  consentAccepted?: boolean;
}) {
  return api<{ user: ApiUser }>("/api/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function joinWaitlist(input: { email?: string; telegram?: string; interests?: string }) {
  return api<{ id: string }>("/api/waitlist", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchGroups(eventId?: number) {
  const query = eventId ? `?eventId=${eventId}` : "";
  return api<{ groups: GroupSummary[] }>(`/api/groups${query}`);
}

export async function fetchMyApplications() {
  return api<{ applications: ApplicationSummary[] }>("/api/applications");
}

export async function createApplication(groupId: string, message?: string) {
  return api<{ application: ApplicationSummary }>("/api/applications", {
    method: "POST",
    body: JSON.stringify({ groupId, message }),
  });
}

export async function cancelApplication(applicationId: string) {
  return api<{ application: ApplicationSummary }>("/api/applications", {
    method: "PATCH",
    body: JSON.stringify({ applicationId, action: "cancel" }),
  });
}

export async function submitCheckIn(groupId: string, status: "checked_in" | "left" = "checked_in") {
  return api<{ checkIn: { id: string; status: string } }>("/api/check-in", {
    method: "POST",
    body: JSON.stringify({ groupId, status }),
  });
}

export async function submitReport(input: {
  type: "COMPLAINT" | "PANIC";
  groupId?: string;
  message?: string;
}) {
  return api<{ report: { id: string } }>("/api/reports", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function submitFeedback(input: { groupId: string; rating: number; comment?: string }) {
  return api<{ feedback: { id: string } }>("/api/feedback", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function trackEvent(name: string, payload?: Record<string, unknown>) {
  try {
    await api("/api/analytics", {
      method: "POST",
      body: JSON.stringify({ name, payload }),
    });
  } catch {
    // analytics should not break UX
  }
}

export async function fetchAdminStats() {
  return api<{
    stats: {
      users: number;
      groups: number;
      applications: number;
      approvedApplications: number;
      checkIns: number;
      checkInRate: number;
      waitlist: number;
      avgRating: number | null;
      feedbackCount: number;
    };
    pendingApplications: Array<{
      id: string;
      status: ApplicationStatus;
      createdAt: string;
      user: { id: string; displayName: string; email: string };
      group: { id: string; eventTitle: string; kudagoEventId: number };
      message: string | null;
    }>;
    groups: Array<{
      id: string;
      eventTitle: string;
      kudagoEventId: number;
      eventDate: string;
      status: string;
      capacity: number;
      approved: number;
      pending: number;
      checkIns: number;
    }>;
  }>("/api/admin/stats");
}

export async function moderateApplication(applicationId: string, status: "APPROVED" | "REJECTED") {
  return api<{ application: { id: string; status: ApplicationStatus } }>(`/api/applications/${applicationId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function createGroup(input: {
  kudagoEventId: number;
  eventTitle: string;
  eventDate: string;
  capacity?: number;
  meetingPoint?: string;
  telegramLink?: string;
}) {
  return api<{ group: GroupSummary }>("/api/groups", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function fetchMyGroups() {
  return api<{
    groups: Array<
      GroupSummary & {
        pendingApplications: Array<{
          id: string;
          status: ApplicationStatus;
          message: string | null;
          createdAt: string;
          user: { id: string; displayName: string; email: string };
        }>;
      }
    >;
  }>("/api/groups/mine");
}

export async function createPilotGroup(input: {
  kudagoEventId: number;
  eventTitle: string;
  eventDate: string;
  capacity?: number;
  meetingPoint?: string;
  telegramLink?: string;
}) {
  return api<{ group: GroupSummary }>("/api/groups", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
