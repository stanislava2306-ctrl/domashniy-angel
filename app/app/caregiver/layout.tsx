import type { ReactNode } from "react";
import Link from "next/link";
import { requireProfile, signOutAction } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground no-underline hover:bg-muted hover:text-foreground"
    >
      {label}
    </Link>
  );
}

export default async function CaregiverLayout({ children }: { children: ReactNode }) {
  const profile = await requireProfile("caregiver");

  return (
    <div className="container py-6">
      <div className="grid gap-4 md:grid-cols-[220px,1fr]">
        <aside className="hidden h-fit rounded-xl border bg-white/85 p-4 md:block">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Вы вошли как caregiver</p>
            <p className="text-sm font-semibold">{profile.full_name ?? "Родственник"}</p>
          </div>

          <nav className="mt-4 flex flex-col gap-1">
            <NavLink href="/app/caregiver" label="Дашборд" />
            <NavLink href="/app/caregiver/seniors" label="Подопечные" />
            <NavLink href="/app/caregiver/settings" label="Настройки" />
            <NavLink href="/app/caregiver/support" label="Поддержка" />
          </nav>

          <form action={signOutAction} className="mt-5 border-t pt-4">
            <Button type="submit" variant="outline" className="w-full">
              Выйти
            </Button>
          </form>
        </aside>

        <section className="space-y-4">
          <header className="flex items-center justify-between rounded-xl border bg-white/85 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">Кабинет родственника</p>
              <h1 className="text-lg font-semibold">Управление заботой и безопасностью</h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden rounded-full bg-warm-100 px-2.5 py-1 text-xs text-[#9f5b1e] sm:inline">
                Support 65 / Safety Plus
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden">
                    Меню
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/app/caregiver">Дашборд</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app/caregiver/seniors">Подопечные</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/app/caregiver/settings">Настройки</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          {children}
        </section>
      </div>
    </div>
  );
}
