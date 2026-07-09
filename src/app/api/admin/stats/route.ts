import { jsonOk, handleApiError } from "@/lib/server/api";
import { requireModerator } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";

export async function GET() {
  try {
    await requireModerator();

    const [
      users,
      groups,
      applications,
      approvedApplications,
      checkIns,
      feedback,
      waitlist,
      pendingApplications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.group.count(),
      prisma.application.count(),
      prisma.application.count({ where: { status: "APPROVED" } }),
      prisma.checkIn.count({ where: { status: "checked_in" } }),
      prisma.feedback.findMany({ select: { rating: true } }),
      prisma.waitlistEntry.count(),
      prisma.application.findMany({
        where: { status: "PENDING" },
        include: {
          user: { include: { profile: true } },
          group: true,
        },
        orderBy: { createdAt: "asc" },
        take: 50,
      }),
    ]);

    const avgRating =
      feedback.length > 0
        ? feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length
        : null;

    const checkInRate =
      approvedApplications > 0 ? Math.round((checkIns / approvedApplications) * 100) : 0;

    const groupsWithStats = await prisma.group.findMany({
      include: {
        applications: true,
        checkIns: true,
      },
      orderBy: { eventDate: "asc" },
      take: 30,
    });

    return jsonOk({
      stats: {
        users,
        groups,
        applications,
        approvedApplications,
        checkIns,
        checkInRate,
        waitlist,
        avgRating,
        feedbackCount: feedback.length,
      },
      pendingApplications: pendingApplications.map((app) => ({
        id: app.id,
        status: app.status,
        createdAt: app.createdAt.toISOString(),
        user: {
          id: app.userId,
          displayName: app.user.profile?.displayName ?? app.user.email,
          email: app.user.email,
        },
        group: {
          id: app.groupId,
          eventTitle: app.group.eventTitle,
          kudagoEventId: app.group.kudagoEventId,
        },
        message: app.message,
      })),
      groups: groupsWithStats.map((group) => ({
        id: group.id,
        eventTitle: group.eventTitle,
        kudagoEventId: group.kudagoEventId,
        eventDate: group.eventDate.toISOString(),
        status: group.status,
        capacity: group.capacity,
        approved: group.applications.filter((a) => a.status === "APPROVED").length,
        pending: group.applications.filter((a) => a.status === "PENDING").length,
        checkIns: group.checkIns.filter((c) => c.status === "checked_in").length,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
