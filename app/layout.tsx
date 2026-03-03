import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Домашний ангел",
  description:
    "Сервис поддержки и безопасности пожилых людей: один комплект устройств, два режима логики — Support 65 и Safety Plus."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff8f1_0%,_#f8fbff_40%,_#f6f8fb_100%)] text-foreground">
          <header className="border-b border-white/70 bg-white/70 backdrop-blur">
            <div className="container flex h-16 items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-2 no-underline">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#ff9a3d] to-[#2f77d4] text-sm font-bold text-white">
                  ДА
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-semibold md:text-base">Домашний ангел</span>
                  <span className="hidden text-[11px] text-muted-foreground sm:block">
                    Теплый технологичный сервис заботы
                  </span>
                </span>
              </Link>

              <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
                <Link href="/pricing" className="no-underline hover:text-foreground">
                  Цена
                </Link>
                <Link href="/faq" className="no-underline hover:text-foreground">
                  FAQ
                </Link>
              </nav>

              <Link
                href="/login"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium no-underline hover:bg-slate-50"
              >
                Войти
              </Link>
            </div>
          </header>

          <main>{children}</main>

          <footer className="mt-10 border-t border-slate-200/80 bg-white/70">
            <div className="container flex flex-col items-center justify-between gap-2 py-4 text-xs text-muted-foreground sm:flex-row">
              <span>© {new Date().getFullYear()} Домашний ангел</span>
              <span>Демо-продукт для пилотных подключений и тестирования.</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
