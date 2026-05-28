import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Безопасность и данные — ДВИГ",
  description:
    "Принципы безопасности офлайн-встреч, цифровой след и roadmap ДВИГ. Демо-пилот Санкт-Петербург.",
};

export default function SafetyPage() {
  return (
    <main className="dvig-page min-h-screen text-foreground">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Badge className="dvig-badge-accent">Забота и прозрачность</Badge>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
          Безопасность и данные
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Безопасность в ДВИГ — это забота и прозрачность, а не обещание, что «алгоритм
          защитит». Ниже — что планируем в продукте и что уже можно посмотреть в демо.
        </p>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-bold">До встречи</h2>
          <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Верификация (учебная почта или документ)</li>
            <li>Цели в профиле и состав группы до офлайна</li>
            <li>Одобрение заявки организатором или модератором</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Статус: <strong className="text-foreground">в разработке</strong> — в демо показаны
            сценарии, без реальной проверки документов.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-bold">На встрече</h2>
          <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Только публичные места: площадка, кафе, кинотеатр, музей</li>
            <li>Группы от 5–6 человек на старте — не 1-на-1 без контура безопасности</li>
            <li>Чек-ин, доверенный контакт, тревожная кнопка</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            В демо{" "}
            <Link href="/app?view=settings" className="text-primary underline-offset-4 hover:underline">
              /app → Настройки
            </Link>{" "}
            кнопки меняют локальное состояние и <strong className="text-foreground">не отправляют</strong>{" "}
            сигнал на сервер.
          </p>
        </section>

        <section id="data" className="mt-10 space-y-4 scroll-mt-24">
          <h2 className="text-2xl font-bold">Данные и цифровой след</h2>
          <div className="dvig-panel space-y-3 p-5 text-sm leading-7 text-muted-foreground">
            <p>
              <strong className="text-foreground">Профиль:</strong> имя, возраст, интересы,
              верификация, аватар.
            </p>
            <p>
              <strong className="text-foreground">События:</strong> сохранённые карточки, заявки,
              чек-ины и отмены.
            </p>
            <p>
              <strong className="text-foreground">Безопасность:</strong> жалобы, блокировки,
              тревожные события — для модерации.
            </p>
            <p>
              <strong className="text-foreground">Аналитика:</strong> только обезличенные
              категории спроса для партнёров.
            </p>
          </div>
          <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
            <li>Личный профиль, фото и контакты удаляются по запросу</li>
            <li>Заявки и чаты обезличиваются для истории модерации</li>
            <li>Жалобы и safety-события хранятся ограниченный срок</li>
            <li>Партнёрская аналитика — только в агрегированном виде</li>
          </ul>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-bold">Выход из продукта</h2>
          <p className="text-muted-foreground">
            Экспорт архива данных, удаление профиля с периодом отмены, отзыв согласий на
            рассылки — в roadmap; в демо кнопки показывают сценарий без реального backend.
          </p>
        </section>

        <div className="mt-10 rounded-md border border-[#f59e0b]/40 bg-[#fff7ed]/10 p-5">
          <h3 className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="size-5 text-primary" />
            Ограничение MVP
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Это демонстрационный интерфейс. До реального запуска нужны юридическая политика,
            обработка тревожных сигналов, модераторские регламенты и согласие на геоданные.
          </p>
        </div>

        <Link
          href="/app?view=settings"
          className="dvig-btn-primary mt-10 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium"
        >
          Посмотреть в демо
          <ArrowRight className="size-4" />
        </Link>
      </article>
      <SiteFooter />
    </main>
  );
}
