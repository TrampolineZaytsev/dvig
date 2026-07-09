import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "Условия использования — ДВИГ",
  description: "Условия участия в пилоте ДВИГ.",
};

export default function TermsPage() {
  return (
    <main className="dvig-page min-h-screen text-foreground">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Условия использования (пилот)</h1>
        <div className="mt-8 space-y-4 text-sm leading-7 text-muted-foreground">
          <p>
            Участвуя в пилоте ДВИГ, вы подтверждаете, что вам исполнилось 18 лет, вы находитесь в
            Санкт-Петербурге и согласны с{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              политикой конфиденциальности
            </Link>
            .
          </p>
          <h2 className="text-xl font-semibold text-foreground">Формат пилота</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Групповые встречи 5–7 человек в публичных местах.</li>
            <li>Не формат 1-на-1 на первом этапе.</li>
            <li>Заявки рассматривает модератор в течение 24 часов.</li>
            <li>ДВИГ не гарантирует романтический или дружеский результат — только организацию контекста встречи.</li>
          </ul>
          <h2 className="text-xl font-semibold text-foreground">Безопасность</h2>
          <p>
            При угрозе жизни звоните 112. Тревожная кнопка в приложении эскалирует сигнал модератору пилота,
            но не заменяет экстренные службы.
          </p>
          <h2 className="text-xl font-semibold text-foreground">Ограничение ответственности</h2>
          <p>
            Факты о событиях (время, цена, место) — от организатора и KudaGo. Проверяйте на сайте площадки перед
            визитом.
          </p>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}
