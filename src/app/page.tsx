import Link from "next/link";
import { ArrowRight, Dice5, Dumbbell, Film, Landmark, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const categoryCards = [
  {
    title: "Кино",
    text: "Премьеры, авторские показы и компания на вечер.",
    href: "/app/?category=Кино",
    icon: Film,
    image: "/category-cinema.svg",
    gradient: "from-[#2d1f4e] via-[#8064a2]/80 to-[#0a0612]",
  },
  {
    title: "Настолки",
    text: "Антикафе, квизы и игры без готовой команды.",
    href: "/app/?category=Настолки",
    icon: Dice5,
    image: "/category-games.svg",
    gradient: "from-[#3d2858] via-[#9b6bb8]/70 to-[#0a0612]",
  },
  {
    title: "Культура",
    text: "Выставки, лекции, прогулки и городские маршруты.",
    href: "/app/?category=Культура",
    icon: Landmark,
    image: "/category-culture.svg",
    gradient: "from-[#1f2848] via-[#5c6a9e]/75 to-[#0a0612]",
  },
  {
    title: "Спорт",
    text: "Пробежки, студии и активные встречи в группе.",
    href: "/app/?category=Спорт",
    icon: Dumbbell,
    image: "/category-sport.svg",
    gradient: "from-[#3a1848] via-[#c6269e]/60 to-[#0a0612]",
  },
];

export default function Home() {
  return (
    <main className="dvig-page min-h-screen text-foreground">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3">
            <span className="dvig-logo size-11 text-lg transition group-hover:shadow-primary/40">
              Д
            </span>
            <span className="text-2xl font-bold tracking-tight">ДВИГ</span>
          </Link>
          <Badge className="dvig-badge hidden sm:inline-flex">Санкт-Петербург</Badge>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <Badge className="dvig-badge-accent">Дело → люди → офлайн</Badge>
            <h1 className="mt-6 max-w-xl text-5xl font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl">
              <span className="dvig-text-gradient">Найди компанию</span>
              <br />
              <span className="text-foreground">на событие.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-muted-foreground">
              Выбери формат встречи. Дальше покажем события, свободные места,
              модератора и инструменты безопасности.
            </p>
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 text-sm">
              {["публичные места", "модератор", "заявка"].map((item) => (
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
                <div className={`relative min-h-44 bg-gradient-to-br ${card.gradient}`}>
                  <img
                    src={card.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-overlay"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
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
        </div>

        <footer className="flex flex-col gap-3 border-t border-border/40 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>ДВИГ · живые встречи по интересам</span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            Проверенные встречи и управление цифровым следом
          </span>
        </footer>
      </section>
    </main>
  );
}
