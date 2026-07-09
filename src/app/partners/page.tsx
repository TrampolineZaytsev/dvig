import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { pilotConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Партнёрам — ДВИГ",
  description:
    "Выгоды B2B для площадок и организаторов досуга. Пилот ДВИГ и spb-events, Санкт-Петербург.",
};

const b2bBenefits = [
  {
    title: "Заполнение непиковых слотов",
    text: "Организованные группы 5–15 человек на будни и утро.",
  },
  {
    title: "Рост среднего чека",
    text: "Групповые визиты и дополнительные заказы на площадке.",
  },
  {
    title: "Аудитория 18–28",
    text: "Молодёжь с заявленными интересами, не холодный трафик.",
  },
  {
    title: "Меньше рассинхрона афиши",
    text: "Единый слой данных: дата, место, цена согласованы с источником.",
  },
] as const;

export default function PartnersPage() {
  return (
    <main className="dvig-page min-h-screen text-foreground">
      <SiteHeader />
      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Badge className="dvig-badge-accent">B2B · пилот СПб</Badge>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Партнёрам</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
          ДВИГ помогает площадкам и организаторам приводить молодую аудиторию в группах — без
          давления dating-формата. Афишу и социальный слой разделяем честно.
        </p>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">Выгоды для площадок</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {b2bBenefits.map((item) => (
              <div key={item.title} className="dvig-panel p-5">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 dvig-panel-muted p-5">
          <h2 className="text-xl font-bold">B2B2C для редакций и медиа</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Гипотеза пилота: экономия времени на дайджестах в Telegram и VK за счёт
            согласованных карточек событий. Целевая метрика — минуты на одно событие;{" "}
            <strong className="text-foreground">подтвердим замером</strong>, без публичных цифр
            до первых измерений.
          </p>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="dvig-panel p-5">
            <h3 className="font-semibold text-primary">spb-events</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Операционный слой: афиша KudaGo, экспорт, дайджесты для команд и редакций.
              Инженерный мост пилота — не интерфейс для конечного пользователя.
            </p>
          </div>
          <div className="dvig-panel p-5">
            <h3 className="font-semibold text-primary">ДВИГ</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Социальный продукт: компания на событие, группы, заявки, профиль и safety.
              Для людей — веб и мессенджеры, не терминал.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">Контакт пилота</h2>
          <p className="mt-3 text-muted-foreground">
            Напишите команде:{" "}
            <a href={`mailto:${pilotConfig.email}`} className="text-primary hover:underline">
              {pilotConfig.email}
            </a>{" "}
            или в Telegram{" "}
            <a href={pilotConfig.telegramUrl} className="text-foreground hover:underline">
              {pilotConfig.telegram}
            </a>
            .
          </p>
        </section>

        <Link
          href="/app"
          className="dvig-btn-primary mt-10 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium"
        >
          Открыть приложение
          <ArrowRight className="size-4" />
        </Link>
      </article>
      <SiteFooter />
    </main>
  );
}
