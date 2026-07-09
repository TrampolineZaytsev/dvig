# ДВИГ Web — пилот B2C

## Быстрый старт

```bash
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

- Приложение: http://localhost:3000/app
- Админка модератора: http://localhost:3000/admin
- Модератор по умолчанию: `moderator@dvig.app` / `moderator123`

## Пилот

1. Создайте группы в `/admin` с реальным `kudagoEventId` из URL события KudaGo.
2. Пользователи регистрируются, проходят онбординг, подают заявку.
3. Модератор одобряет заявки; участник видит точку встречи и ссылку на Telegram.
4. Check-in, жалобы и оценка после встречи — в настройках `/app`.

Регламент: [PILOT_REGULATIONS.md](./PILOT_REGULATIONS.md)

## Telegram-уведомления (опционально)

```env
TELEGRAM_BOT_TOKEN=...
TELEGRAM_MODERATOR_CHAT_ID=...
```

## База данных

По умолчанию SQLite (`prisma/dev.db`). Для PostgreSQL задайте `DATABASE_URL` в `.env`.
