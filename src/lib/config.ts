export const pilotConfig = {
  email: process.env.NEXT_PUBLIC_PILOT_EMAIL ?? "team@dvig.app",
  telegram: process.env.NEXT_PUBLIC_PILOT_TELEGRAM ?? "@dvig_team",
  telegramUrl: process.env.NEXT_PUBLIC_PILOT_TELEGRAM_URL ?? "https://t.me/dvig_team",
} as const;

export const appConfig = {
  sessionCookie: "dvig_session",
  sessionMaxAge: 60 * 60 * 24 * 30,
  minGroupSize: 5,
  maxGroupSize: 15,
} as const;
