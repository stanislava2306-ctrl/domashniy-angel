import type { ReactNode } from "react";
import Link from "next/link";
import { requireProfile, signOutAction } from "@/lib/auth";
import { Button } from "@/components/ui/button";

function SeniorNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border bg-white px-3 py-1.5 text-sm font-medium text-slate-800 no-underline shadow-sm hover:bg-warm-50"
    >
      {label}
    </Link>
  );
}

export default async function SeniorLayout({ children }: { children: ReactNode }) {
  const profile = await requireProfile("senior");

  return (
    <div className="container max-w-5xl py-6">
      <div className="space-y-4">
        <header className="flex items-center justify-between rounded-2xl border bg-white/90 px-4 py-3">
          <div>
            <p className="text-xs text-muted-foreground">Кабинет пользователя 65+</p>
            <p className="text-xl font-semibold">{profile.full_name ?? "Пользователь"}</p>
          </div>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" className="text-base">
              Выйти
            </Button>
          </form>
        </header>

        <nav className="flex flex-wrap gap-2">
          <SeniorNavLink href="/app/senior" label="Главная" />
          <SeniorNavLink href="/app/senior/activity" label="Активность" />
          <SeniorNavLink href="/app/senior/insights" label="Подсказки" />
          <SeniorNavLink href="/app/senior/family" label="Семья" />
          <SeniorNavLink href="/app/senior/settings" label="Настройки" />
        </nav>

        <main>{children}</main>
      </div>
    </div>
  );
}
