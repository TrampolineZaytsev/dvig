import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Dice5,
  Dumbbell,
  Film,
  Landmark,
  UsersRound,
} from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WaitlistForm } from "@/components/waitlist-form";
import { Badge } from "@/components/ui/badge";

const categoryCards = [
  {
    title: "Кино",
    text: "Премьеры, авторские показы и компания на вечер.",
    href: "/app/?category=Кино",
    icon: Film,
    image: "/category-cinema.svg",
    imagePosition: "object-center",
    gradient: "from-[#2d1f4e] via-[#8064a2]/80 to-[#0a0612]",
  },
  {
    title: "Настолки",
    text: "Антикафе, квизы и игры без готовой команды.",
    href: "/app/?category=Настолки",
    icon: Dice5,
    image: "/category-games.svg",
    imagePosition: "object-[center_35%]",
    gradient: "from-[#3d2858] via-[#9b6bb8]/70 to-[#0a0612]",
  },
  {
    title: "Культура",
    text: "Выставки, лекции, прогулки и городские маршруты.",
    href: "/app/?category=Культура",
    icon: Landmark,
    image: "/category-culture.svg",
    imagePosition: "object-center",
    gradient: "from-[#1f2848] via-[#5c6a9e]/75 to-[#0a0612]",
  },
  {
    title: "Спорт",
    text: "Пробежки, студии и активные встречи в группе.",
    href: "/app/?category=Спорт",
    icon: Dumbbell,
    image: "/category-sport.svg",
    imagePosition: "object-[center_40%]",
    gradient: "from-[#3a1848] via-[#c6269e]/60 to-[#0a0612]",
  },
];

const steps = [
  {
    step: "1",
    title: "Выбери интерес или событие",
    text: "Афиша KudaGo по Санкт-Петербургу — кино, настолки, культура, спорт.",
  },
  {
    step: "2",
    title: "Группа и заявка",
    text: "Реальные группы пилота: подайте заявку, модератор одобрит в течение 24 часов.",
  },
  {
    step: "3",
    title: "Офлайн в публичном месте",
    text: "Встреча с модератором, точка сбора и чек-ин — группы 5–7 человек.",
  },
];

const b2bTeaser = [
  "Заполнение непиковых слотов группами",
  "Рост среднего чека за счёт групповых визитов",
  "Аудитория 18–28 с заявленными интересами",
  "Меньше рассинхрона даты и цены в каналах",
];

const competitors = [
  {
    title: "Dating",
    text: "Витрина анкет и свайпы. Давление «свидания», слабый контекст общего дела.",
  },
  {
    title: "Афиша",
    text: "KudaGo, Timepad — узнать куда и когда. Не отвечают на «пойти не с кем».",
  },
  {
    title: "ДВИГ",
    text: "Дело → люди → офлайн. Группы, публичные места, не рекламируем романтику.",
    highlight: true,
  },
];

export default function Home() {
  return (
    <main className="dvig-page min-h-screen text-foreground">
      <SiteHeader />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="grid items-center gap-10 py-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <Badge className="dvig-badge-accent">Пилот B2C · СПб</Badge>
            <h1 className="mt-6 max-w-xl text-5xl font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl">
              <span className="dvig-text-gradient">Найди компанию</span>
              <br />
              <span className="text-foreground">на событие.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-muted-foreground">
              <strong className="font-medium text-foreground">Не dating:</strong> без витрины
              анкет и свайпов. Сначала общее дело, потом люди, потом встреча в городе.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/app"
                className="dvig-btn-primary inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium"
              >
                Открыть приложение
                <ArrowRight className="size-4" />
              </Link>
              <a
                href="#waitlist"
                className="inline-flex items-center gap-2 rounded-lg border border-border/50 px-5 py-2.5 text-sm font-medium hover:bg-card/50"
              >
                Записаться в пилот
              </a>
            </div>
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 text-sm">
              {["публичные места", "группа от 5", "заявка"].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-border/40 bg-card/50 px-3 py-3 backdrop-blur-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {categoryCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="dvig-card-hover group overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-md"
              >
                <div className={`relative min-h-48 overflow-hidden bg-gradient-to-br ${card.gradient}`}>
                  <img
                    src={card.image}
                    alt={`${card.title} — события и компания`}
                    className={`absolute inset-0 h-full w-full object-contain p-8 opacity-40 transition duration-700 group-hover:scale-105 ${card.imagePosition}`}
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-55 mix-blend-multiply`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute left-4 top-4 flex size-11 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-primary backdrop-blur-md">
                    <card.icon className="size-6 text-brand-glow" />
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-bold">{card.title}</h2>
                    <ArrowRight className="size-5 text-primary transition group-hover:translate-x-1 group-hover:text-brand-glow" />
                  </div>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
                    {card.text}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="waitlist" className="border-t border-border/40 py-12">
          <WaitlistForm />
        </section>

        <section className="border-t border-border/40 py-12">
          <h2 className="text-2xl font-bold">Не рыночные знакомства</h2>
          <p className="mt-4 max-w-3xl leading-8 text-muted-foreground">
            Классическое dating-приложение — витрина, где одним жестом смахивают целую личность.
            ДВИГ строит среду вокруг совместного занятия: кино, настолки, лекция, пробежка.
            Романтика может случиться, но мы её не афишируем — фокус на дружбе и живом
            общении.
          </p>
        </section>

        <section className="border-t border-border/40 py-12">
          <h2 className="text-2xl font-bold">Как это работает</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((item) => (
              <li key={item.step} className="dvig-panel p-5">
                <span className="text-3xl font-extrabold text-primary">{item.step}</span>
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t border-border/40 py-12">
          <h2 className="text-2xl font-bold">Почему не только афиша</h2>
          <p className="mt-4 max-w-3xl leading-8 text-muted-foreground">
            JTBD «пойти не с кем»: в ленте видно, куда пойти, но не с кем. KudaGo отвечает на
            «куда» — ДВИГ отвечает на «с кем»: группа, заявка, модератор, публичное место.
            В пилоте — реальные заявки и модерация, не мок в браузере.
          </p>
        </section>

        <section className="border-t border-border/40 py-12">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <UsersRound className="size-6 text-primary" />
            Для кого
          </h2>
          <p className="mt-4 max-w-3xl leading-8 text-muted-foreground">
            18–28 в крупном городе: студенты и молодые специалисты, приезжие без своей тусовки,
            интроверты и социально тревожные, которым некомфортно идить одним на интересное
            событие.
          </p>
        </section>

        <section className="border-t border-border/40 py-12">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Building2 className="size-6 text-primary" />
            Партнёрам
          </h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {b2bTeaser.map((item) => (
              <li key={item} className="flex items-start gap-2 text-muted-foreground">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/partners"
            className="mt-4 inline-flex items-center gap-1 text-primary hover:underline"
          >
            Подробнее для площадок
            <ArrowRight className="size-4" />
          </Link>
        </section>

        <section className="border-t border-border/40 py-12">
          <h2 className="text-2xl font-bold">Мы / не мы</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {competitors.map((col) => (
              <div
                key={col.title}
                className={
                  col.highlight
                    ? "dvig-panel border-primary/30 p-5"
                    : "dvig-panel-muted p-5"
                }
              >
                <h3 className="font-semibold">{col.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{col.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Позиционирование: дело → люди → офлайн. Цифра ведёт в реальный мир, а не в бесконечный
            скролл.
          </p>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
