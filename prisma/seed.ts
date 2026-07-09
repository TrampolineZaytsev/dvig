import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_GROUPS = [
  {
    kudagoEventId: 100001,
    eventTitle: "Вечер настольных игр (пилот)",
    daysFromNow: 3,
    capacity: 7,
    meetingPoint: "У входа в антикафе, табличка «ДВИГ»",
    telegramLink: "https://t.me/dvig_team",
  },
  {
    kudagoEventId: 100002,
    eventTitle: "Авторский кинопоказ (пилот)",
    daysFromNow: 5,
    capacity: 6,
    meetingPoint: "Касса кинотеатра, 18:45",
    telegramLink: "https://t.me/dvig_team",
  },
  {
    kudagoEventId: 100003,
    eventTitle: "Лекция в музее (пилот)",
    daysFromNow: 7,
    capacity: 7,
    meetingPoint: "Гардероб музея, 17:55",
    telegramLink: "https://t.me/dvig_team",
  },
] as const;

async function main() {
  const email = process.env.SEED_MODERATOR_EMAIL ?? "moderator@dvig.app";
  const password = process.env.SEED_MODERATOR_PASSWORD ?? "moderator123";
  const passwordHash = await bcrypt.hash(password, 10);

  const moderator = await prisma.user.upsert({
    where: { email },
    update: { role: "MODERATOR", passwordHash },
    create: {
      email,
      passwordHash,
      role: "MODERATOR",
      profile: {
        create: {
          displayName: "Модератор пилота",
          city: "Санкт-Петербург",
          interests: JSON.stringify(["Настолки", "Культура", "Кино"]),
          onboardingDone: true,
          consentAccepted: true,
        },
      },
    },
  });

  for (const seed of SEED_GROUPS) {
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + seed.daysFromNow);
    eventDate.setHours(19, 0, 0, 0);

    const existing = await prisma.group.findFirst({
      where: { kudagoEventId: seed.kudagoEventId },
    });

    if (existing) {
      await prisma.group.update({
        where: { id: existing.id },
        data: {
          eventTitle: seed.eventTitle,
          eventDate,
          capacity: seed.capacity,
          meetingPoint: seed.meetingPoint,
          telegramLink: seed.telegramLink,
          status: "OPEN",
        },
      });
      continue;
    }

    await prisma.group.create({
      data: {
        kudagoEventId: seed.kudagoEventId,
        eventTitle: seed.eventTitle,
        eventDate,
        capacity: seed.capacity,
        meetingPoint: seed.meetingPoint,
        telegramLink: seed.telegramLink,
        moderatorId: moderator.id,
      },
    });
  }

  console.log(`Seed complete. Moderator: ${email} / ${password}`);
  console.log("Replace kudagoEventId in prisma/seed.ts with real KudaGo IDs via /admin.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
