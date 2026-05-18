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
    color: "bg-[#34745f]",
  },
  {
    title: "Настолки",
    text: "Антикафе, квизы и игры без готовой команды.",
    href: "/app/?category=Настолки",
    icon: Dice5,
    image: "/category-games.svg",
    color: "bg-[#d89f35]",
  },
  {
    title: "Культура",
    text: "Выставки, лекции, прогулки и городские маршруты.",
    href: "/app/?category=Культура",
    icon: Landmark,
    image: "/category-culture.svg",
    color: "bg-[#6e91b7]",
  },
  {
    title: "Спорт",
    text: "Пробежки, студии и активные встречи в группе.",
    href: "/app/?category=Спорт",
    icon: Dumbbell,
    image: "/category-sport.svg",
    color: "bg-[#c96e58]",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] text-[#171b18]">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-lg bg-[#235646] text-lg font-semibold text-white">
              Д
            </span>
            <span className="text-2xl font-semibold tracking-normal">ДВИГ</span>
          </Link>
          <Badge className="hidden rounded-md bg-[#dbe9e2] px-3 py-1 text-[#235646] hover:bg-[#dbe9e2] sm:inline-flex">
            Санкт-Петербург
          </Badge>
        </header>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <Badge className="rounded-md bg-[#f4dfc2] px-3 py-1 text-[#6b4a13] hover:bg-[#f4dfc2]">
              Дело → люди → офлайн
            </Badge>
            <h1 className="mt-5 max-w-xl text-5xl font-semibold leading-[1.02] tracking-normal sm:text-6xl">
              Найди компанию на событие.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-[#56635d]">
              Выбери формат встречи. Дальше покажем события, свободные места,
              модератора и инструменты безопасности.
            </p>
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 text-sm">
              {["публичные места", "модератор", "заявка"].map((item) => (
                <div key={item} className="rounded-lg border border-[#d9d5cb] bg-white p-3">
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
                className="group overflow-hidden rounded-xl border border-[#d9d5cb] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className={`relative min-h-44 ${card.color}`}>
                  <img
                    src={card.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-95"
                  />
                  <div className="absolute left-4 top-4 flex size-11 items-center justify-center rounded-lg bg-white/90 text-[#235646]">
                    <card.icon className="size-6" />
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-2xl font-semibold">{card.title}</h2>
                    <ArrowRight className="size-5 text-[#235646] transition group-hover:translate-x-1" />
                  </div>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-[#56635d]">{card.text}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <footer className="flex flex-col gap-3 border-t border-[#d9d5cb] py-5 text-sm text-[#56635d] sm:flex-row sm:items-center sm:justify-between">
          <span>ДВИГ · живые встречи по интересам</span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-[#235646]" />
            Проверенные встречи и управление цифровым следом
          </span>
        </footer>
      </section>
    </main>
  );
}
