export async function sendTelegramNotification(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_MODERATOR_CHAT_ID;

  if (!token || !chatId) {
    console.info("[telegram:skipped]", message);
    return { sent: false as const, reason: "not_configured" as const };
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      disable_web_page_preview: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("[telegram:error]", body);
    return { sent: false as const, reason: "api_error" as const };
  }

  return { sent: true as const };
}

export function formatApplicationApprovedMessage(input: {
  displayName: string;
  eventTitle: string;
  meetingPoint?: string | null;
  telegramLink?: string | null;
}) {
  const lines = [
    `✅ Заявка одобрена: ${input.displayName}`,
    `Событие: ${input.eventTitle}`,
  ];
  if (input.meetingPoint) {
    lines.push(`Точка встречи: ${input.meetingPoint}`);
  }
  if (input.telegramLink) {
    lines.push(`Чат группы: ${input.telegramLink}`);
  }
  return lines.join("\n");
}

export function formatPanicMessage(input: {
  displayName: string;
  email: string;
  eventTitle?: string;
  trustedContact?: string | null;
}) {
  return [
    "🚨 Тревожная кнопка (пилот ДВИГ)",
    `Пользователь: ${input.displayName} (${input.email})`,
    input.eventTitle ? `Событие: ${input.eventTitle}` : null,
    input.trustedContact ? `Доверенный контакт: ${input.trustedContact}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatReportMessage(input: {
  displayName: string;
  email: string;
  message?: string | null;
  eventTitle?: string;
}) {
  return [
    "⚠️ Жалоба (пилот ДВИГ)",
    `От: ${input.displayName} (${input.email})`,
    input.eventTitle ? `Событие: ${input.eventTitle}` : null,
    input.message ? `Текст: ${input.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
