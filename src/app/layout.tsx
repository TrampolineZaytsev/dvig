import type { Metadata } from "next";
import { Geist_Mono, Raleway } from "next/font/google";
import "./globals.css";

const raleway = Raleway({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ralewayHeading = Raleway({
  variable: "--font-heading",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ДВИГ — живые встречи по интересам",
  description:
    "Лендинг и демо приложения ДВИГ для поиска компании на городские события.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${raleway.variable} ${ralewayHeading.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
