import { prisma } from "@/lib/server/db";
import { formatApplicationApprovedMessage, sendTelegramNotification } from "@/lib/server/notifications";

export async function notifyApplicationApproved(applicationId: string) {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      user: { include: { profile: true } },
      group: true,
    },
  });
  if (!application) return;

  await sendTelegramNotification(
    formatApplicationApprovedMessage({
      displayName: application.user.profile?.displayName ?? application.user.email,
      eventTitle: application.group.eventTitle,
      meetingPoint: application.group.meetingPoint,
      telegramLink: application.group.telegramLink,
    })
  );
}
