import { NextRequest } from "next/server";
import { z } from "zod";

import { jsonError, jsonOk, handleApiError } from "@/lib/api";
import { getSessionUser, requireModerator } from "@/lib/auth";
import { buildGroupSummary } from "@/lib/groups";
import { prisma } from "@/lib/db";

const createGroupSchema = z.object({
  kudagoEventId: z.number().int().positive(),
  eventTitle: z.string().min(3),
  eventDate: z.string().datetime(),
  capacity: z.number().int().min(5).max(15).default(7),
  meetingPoint: z.string().min(3).max(200).optional(),
  telegramLink: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    const eventIdParam = request.nextUrl.searchParams.get("eventId");
    const kudagoEventId = eventIdParam ? Number(eventIdParam) : undefined;

    const groups = await prisma.group.findMany({
      where: {
        ...(kudagoEventId ? { kudagoEventId } : {}),
        status: { in: ["OPEN", "FULL"] },
      },
      include: {
        moderator: { include: { profile: true } },
        applications: {
          where: { status: "APPROVED" },
          include: { user: { include: { profile: true } } },
        },
      },
      orderBy: { eventDate: "asc" },
    });

    let viewerApprovedGroupIds = new Set<string>();
    if (session) {
      const approvedApps = await prisma.application.findMany({
        where: { userId: session.id, status: "APPROVED" },
        select: { groupId: true },
      });
      viewerApprovedGroupIds = new Set(approvedApps.map((app) => app.groupId));
    }

    return jsonOk({
      groups: groups.map((group) =>
        buildGroupSummary(group, {
          includeMembers: true,
          viewerApproved: viewerApprovedGroupIds.has(group.id),
        })
      ),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const moderator = await requireModerator();
    const body = createGroupSchema.parse(await request.json());

    const group = await prisma.group.create({
      data: {
        kudagoEventId: body.kudagoEventId,
        eventTitle: body.eventTitle,
        eventDate: new Date(body.eventDate),
        capacity: body.capacity,
        meetingPoint: body.meetingPoint,
        telegramLink: body.telegramLink,
        moderatorId: moderator.id,
      },
      include: {
        moderator: { include: { profile: true } },
        applications: { include: { user: { include: { profile: true } } } },
      },
    });

    return jsonOk({ group: buildGroupSummary(group, { includeMembers: true, viewerApproved: true }) }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Некорректные данные");
    }
    return handleApiError(error);
  }
}
