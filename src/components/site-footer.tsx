import Link from "next/link";

const footerLinks = [
  { href: "/app", label: "Демо" },
  { href: "/safety", label: "Безопасность" },
  { href: "/partners", label: "Партнёрам" },
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
        <span className="text-xs sm:text-right">Афиша: KudaGo · Социальный слой: демо</span>
      </div>
    </footer>
  );
}
