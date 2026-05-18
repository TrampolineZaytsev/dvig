import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  Download,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { featuredEvents } from "@/lib/events";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "Выбираешь дело",
    text: "Кино, настолки, выставка, пробежка или лекция. Сначала повод, потом люди.",
    icon: CalendarDays,
  },
  {
    title: "Смотришь состав",
    text: "Видно формат, свободные места, модератора и общий настрой группы.",
    icon: UsersRound,
  },
  {
    title: "Подаешь заявку",
    text: "Организатор подтверждает участников, чтобы встреча была спокойной и уместной.",
    icon: ShieldCheck,
  },
];

const partnerPoints = [
  "групповые визиты в непиковые часы",
  "понятная карточка события для чатов",
  "платное размещение без скрытой рекламы",
];

const b2bCases = [
  {
    title: "Площадкам",
    text: "Кинотеатры, музеи, бары и клубы получают небольшие группы на конкретные слоты, а не абстрактные клики по афише.",
  },
  {
    title: "Организаторам",
    text: "Лекции, игры, прогулки и мастер-классы легче продавать, когда человек видит компанию, формат и оставшиеся места.",
  },
  {
    title: "Брендам",
    text: "Можно запускать аккуратные офлайн-активации вокруг интересов: спорт, культура, город, обучение, без ощущения рекламной вставки.",
  },
  {
    title: "Городским медиа",
    text: "Редакция получает готовые подборки, Telegram-дайджесты и выгрузки событий для контента и партнерских спецпроектов.",
  },
];

const b2bMetrics = [
  ["Заполняемость", "вести людей в непиковые часы и добирать группы"],
  ["Качество лида", "заявка привязана к событию, времени, цене и интересу"],
  ["Аналитика", "видеть спрос по категориям, районам, цене и формату"],
];

const webFeatures = [
  ["Умный поиск", "Фильтры по категории, дате, формату и настроению встречи."],
  ["Подробная карточка", "Место, время, цена, возрастное ограничение, модератор и состав группы."],
  ["ИИ-резюме", "Короткое объяснение: почему стоит пойти, какая атмосфера и кому подойдет."],
  ["Популярное", "События ранжируются по интересу, участникам и доступным местам."],
  ["Подборка", "Сохраненные события собираются в один дайджест для друзей или чата."],
  ["Экспорт", "JSON/CSV выгрузка для редакций, партнеров и дальнейшей аналитики."],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f3ee] text-[#171b18]">
      <header className="sticky top-0 z-40 border-b border-[#d9d5cb] bg-[#f6f3ee]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-[#235646] text-sm font-semibold text-white">
              Д
            </span>
            <span className="text-base font-semibold">ДВИГ</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-[#56635d] md:flex">
            <a href="#problem">Проблема</a>
            <a href="#how">Как работает</a>
            <a href="#features">Webapp</a>
            <a href="#b2b">B2B</a>
            <a href="#partners">Партнерам</a>
          </nav>
          <Link
            href="/app"
            className={cn(
              buttonVariants(),
              "rounded-md bg-[#235646] text-white hover:bg-[#1b4437]"
            )}
          >
            Открыть демо
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-10 sm:px-6 md:pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="flex flex-col justify-center">
          <Badge className="mb-5 w-fit rounded-md bg-[#dbe9e2] text-[#235646] hover:bg-[#dbe9e2]">
            Санкт-Петербург · живые встречи по интересам
          </Badge>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
            ДВИГ
          </h1>
          <p className="mt-5 max-w-2xl text-xl leading-8 text-[#4f5c55]">
            Мобильное приложение, где молодые люди находят не анкету для свидания,
            а компанию для общего дела: кино, настолок, лекций, спорта и городских
            прогулок.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/app"
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-md bg-[#235646] text-white hover:bg-[#1b4437]"
              )}
            >
              Попробовать демо
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#features"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "rounded-md border-[#c7c0b4]"
              )}
            >
              Как устроено
            </a>
          </div>
          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 text-sm">
            {["18-28", "5-15 человек", "публичные места"].map((item) => (
              <div key={item} className="rounded-md border border-[#d9d5cb] bg-white/70 p-3">
                <span className="font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative min-h-[420px] overflow-hidden rounded-md border border-[#d9d5cb] bg-white shadow-sm">
          <Image
            src="/dvig-hero.svg"
            alt="Интерфейс ДВИГ с карточками городских встреч"
            fill
            priority
            className="object-cover"
          />
        </div>
      </section>

      <section id="problem" className="border-y border-[#d9d5cb] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
          <div>
            <Badge variant="outline" className="rounded-md">Почему сейчас</Badge>
            <h2 className="mt-4 text-3xl font-semibold">Афиша отвечает “куда”, но не отвечает “с кем”.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Dating давит", "Сразу романтический результат, неловкие переписки и оценка по фото."],
              ["Афиши молчат", "KudaGo, Timepad и Telegram помогают выбрать событие, но не компанию."],
              ["Чаты шумят", "Ссылки, разные даты, спор о цене и ручная договоренность каждый раз."],
            ].map(([title, text]) => (
              <Card key={title} className="rounded-md border-[#d9d5cb] shadow-none">
                <CardHeader>
                  <CardTitle className="text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-[#56635d]">{text}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <Badge className="rounded-md bg-[#f4dfc2] text-[#6b4a13] hover:bg-[#f4dfc2]">
            Дело → люди → офлайн
          </Badge>
          <h2 className="mt-4 text-3xl font-semibold">Путь знакомства становится естественным.</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.title} className="rounded-md border-[#d9d5cb] shadow-none">
              <CardHeader>
                <step.icon className="mb-3 size-6 text-[#235646]" />
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-[#56635d]">{step.text}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-[#223a33] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <ShieldCheck className="size-8 text-[#f5c451]" />
            <h2 className="mt-4 text-3xl font-semibold">Безопасность без обещания “идеального алгоритма”.</h2>
          </div>
          <div className="space-y-4 text-base leading-7 text-[#dbe5df]">
            <p>
              ДВИГ делает встречу понятной: публичное место, программа, модератор,
              состав участников и заявка вместо анонимной толпы.
            </p>
            <p>
              Мы разделяем факты о событии и ИИ-текст. Источник данных, время, цена и
              ограничения не должны смешиваться с рекламной формулировкой.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Badge variant="outline" className="rounded-md">Примеры встреч</Badge>
            <h2 className="mt-4 text-3xl font-semibold">Небольшие группы вместо бесконечного скролла.</h2>
          </div>
          <Link
            href="/app"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-fit rounded-md border-[#c7c0b4]"
            )}
          >
            Открыть все события
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {featuredEvents.map((event) => (
            <Card key={event.id} className="rounded-md border-[#d9d5cb] shadow-none">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <Badge className="rounded-md bg-[#e6efe9] text-[#235646] hover:bg-[#e6efe9]">
                    {event.category}
                  </Badge>
                  <span className="text-sm text-[#56635d]">{event.spotsLeft} мест</span>
                </div>
                <CardTitle className="text-xl">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[#56635d]">
                <p className="leading-6">{event.short}</p>
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  {event.place}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="features" className="border-y border-[#d9d5cb] bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <Sparkles className="size-8 text-[#235646]" />
            <h2 className="mt-4 text-3xl font-semibold">Все сценарии афиши теперь в webapp.</h2>
            <p className="mt-4 leading-7 text-[#56635d]">
              Пользователь ищет встречу, читает подробности, получает ИИ-выжимку,
              сохраняет подборку, копирует Telegram-дайджест и выгружает данные без
              перехода между разными сервисами.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge className="rounded-md bg-[#dbe9e2] text-[#235646] hover:bg-[#dbe9e2]">
                <Send className="size-3" />
                Telegram preview
              </Badge>
              <Badge className="rounded-md bg-[#f4dfc2] text-[#6b4a13] hover:bg-[#f4dfc2]">
                <Download className="size-3" />
                JSON / CSV
              </Badge>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {webFeatures.map(([title, text]) => (
              <div key={title} className="rounded-md border border-[#d9d5cb] bg-[#f8f6f1] p-4">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#56635d]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="b2b" className="bg-[#eef3ee]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <Badge className="rounded-md bg-white text-[#235646] hover:bg-white">
              B2B-сценарии
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold">
              ДВИГ продает не афишу, а собранную компанию на событие.
            </h2>
            <p className="mt-4 leading-7 text-[#56635d]">
              Для бизнеса это канал, где спрос появляется вокруг конкретного повода:
              дата, место, цена, формат группы и понятный следующий шаг. Партнеру не
              нужно конкурировать только скидкой или баннером.
            </p>
            <div className="mt-8 grid gap-3">
              {b2bMetrics.map(([title, text]) => (
                <div key={title} className="flex gap-3 rounded-md border border-[#d9d5cb] bg-white p-4">
                  <BarChart3 className="mt-1 size-5 shrink-0 text-[#235646]" />
                  <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[#56635d]">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {b2bCases.map((item) => (
              <Card key={item.title} className="rounded-md border-[#d9d5cb] bg-white shadow-none">
                <CardHeader>
                  <Building2 className="mb-3 size-6 text-[#235646]" />
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-6 text-[#56635d]">
                  {item.text}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="partners" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <Badge className="rounded-md bg-[#e7eef6] text-[#24506f] hover:bg-[#e7eef6]">
              Площадки и организаторы
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold">Партнер получает не баннер, а компанию людей.</h2>
          </div>
          <div className="space-y-4">
            {partnerPoints.map((point) => (
              <div key={point} className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 size-5 shrink-0 text-[#235646]" />
                <p className="text-lg text-[#4f5c55]">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4dfc2]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <Sparkles className="mb-3 size-7 text-[#6b4a13]" />
            <h2 className="text-3xl font-semibold">Посмотрите демо приложения.</h2>
            <p className="mt-2 text-[#66523a]">Фильтры, карточки встреч и заявка на участие работают на mock-данных.</p>
          </div>
          <Link
            href="/app"
            className={cn(
              buttonVariants({ size: "lg" }),
              "w-fit rounded-md bg-[#235646] text-white hover:bg-[#1b4437]"
            )}
          >
            Перейти в ДВИГ
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="bg-[#171b18] px-4 py-8 text-sm text-[#c9d2cc] sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <span>ДВИГ · живые встречи по интересам</span>
          <div className="flex items-center gap-4">
            <span>SPb first</span>
            <Separator orientation="vertical" className="h-4 bg-[#53625b]" />
            <span>Демо-прототип</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
