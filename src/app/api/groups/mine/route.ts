import { jsonOk, handleApiError } from "@/lib/server/api";
import { requireSessionUser } from "@/lib/server/auth";
import { buildGroupSummary } from "@/lib/server/groups";
import { prisma } from "@/lib/server/db";

export async function GET() {
  try {
    const session = await requireSessionUser();

    const groups = await prisma.group.findMany({
      where: { moderatorId: session.id },
      include: {
        moderator: { include: { profile: true } },
        applications: {
          include: { user: { include: { profile: true } } },
        },
      },
      orderBy: { eventDate: "asc" },
    });

    return jsonOk({
      groups: groups.map((group) => ({
        ...buildGroupSummary(group, { includeMembers: true, viewerApproved: true }),
        pendingApplications: group.applications
          .filter((app) => app.status === "PENDING")
          .map((app) => ({
            id: app.id,
            status: app.status,
            message: app.message,
            createdAt: app.createdAt.toISOString(),
            user: {
              id: app.userId,
              displayName: app.user.profile?.displayName ?? app.user.email,
              email: app.user.email,
            },
          })),
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
