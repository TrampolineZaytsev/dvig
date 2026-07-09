import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "Политика конфиденциальности — ДВИГ",
  description: "Обработка персональных данных в пилоте ДВИГ, Санкт-Петербург.",
};

export default function PrivacyPage() {
  return (
    <main className="dvig-page min-h-screen text-foreground">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 prose prose-invert">
        <h1 className="text-3xl font-bold">Политика конфиденциальности (черновик пилота)</h1>
        <p className="mt-4 text-muted-foreground">
          Документ для пилота B2C в Санкт-Петербурге. Перед масштабированием — юридическая экспертиза по 152-ФЗ.
        </p>

        <section className="mt-8 space-y-4 text-sm leading-7 text-muted-foreground">
          <h2 className="text-xl font-semibold text-foreground">Какие данные собираем</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Email и пароль (хэш) для входа.</li>
            <li>Профиль: имя, город, интересы, опционально Telegram и доверенный контакт.</li>
            <li>Заявки на участие в группах, check-in, оценки после встречи.</li>
            <li>Жалобы и тревожные сигналы для модерации.</li>
            <li>Технические события аналитики (просмотры, конверсии) в обезличенном виде.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground">Зачем</h2>
          <p>
            Организация групповых офлайн-встреч, модерация заявок, безопасность участников и измерение
            гипотезы пилота.
          </p>

          <h2 className="text-xl font-semibold text-foreground" id="data">
            Хранение и удаление
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Данные хранятся на сервере пилота до удаления аккаунта.</li>
            <li>Запрос архива и удаления — через настройки или email команды.</li>
            <li>Жалобы и safety-события могут храниться ограниченный срок для модерации.</li>
          </ul>

          <h2 className="text-xl font-semibold text-foreground">Передача третьим лицам</h2>
          <p>
            Афиша событий — KudaGo (публичные данные). Уведомления модератору — Telegram Bot API при
            настройке токена. Данные не продаются.
          </p>

          <p>
            Вопросы: см.{" "}
            <Link href="/partners" className="text-primary hover:underline">
              контакты пилота
            </Link>
            .
          </p>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
