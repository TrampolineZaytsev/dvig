import Link from "next/link";

const footerLinks = [
  { href: "/app", label: "Приложение" },
  { href: "/safety", label: "Безопасность" },
  { href: "/partners", label: "Партнёрам" },
  { href: "/privacy", label: "Политика ПДн" },
  { href: "/terms", label: "Условия" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 py-6 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span>ДВИГ · живые встречи по интересам</span>
        <nav className="flex flex-wrap gap-4">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <span className="text-xs sm:text-right">Афиша: KudaGo · Пилот B2C · СПб</span>
      </div>
    </footer>
  );
}
