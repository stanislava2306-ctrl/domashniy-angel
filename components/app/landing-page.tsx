"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LandingPage() {
  const [mode, setMode] = useState<"support_65" | "safety_plus">("support_65");

  return (
    <div className="container py-10 md:py-14">
      <div className="space-y-16">
        <section className="grid items-center gap-8 md:grid-cols-[1.2fr,1fr]">
          <div className="space-y-5">
            <Badge className="border-warm-200 bg-warm-100 text-[#9f5b1e]">Один комплект, два режима</Badge>
            <h1 className="text-balance text-3xl font-semibold leading-tight md:text-5xl">
              Домашний ангел помогает семье видеть важное и не тревожиться без повода
            </h1>
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
              Поддержка пожилого человека 65+ без камер и сложной техники: отслеживаем динамику
              активности, показываем мягкие рекомендации и мгновенно подсвечиваем критические риски.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <a href="/login">Начать с входа</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="#modes">Посмотреть режимы</a>
              </Button>
            </div>
          </div>

          <Card className="border-warm-200 bg-gradient-to-br from-white to-warm-50">
            <CardHeader>
              <CardTitle className="text-base">Пример состояния дома</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Активность сегодня</span>
                <span className="font-medium">В пределах привычного</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ночная активность</span>
                <Badge variant="outline" className="border-amber-300 text-amber-700">
                  Чуть выше
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Критические события</span>
                <Badge variant="secondary">Не обнаружены</Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="for-whom" className="space-y-5">
          <h2 className="text-2xl font-semibold">Для кого</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Родственник (Caregiver)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Личный кабинет для управления несколькими подопечными.</p>
                <p>События, аналитика, устройства, доступы семьи, подписка.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Пользователь 65+ (Senior)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Простой интерфейс с крупным шрифтом и минимумом действий.</p>
                <p>Сводка активности, понятные подсказки и список родственников.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="how" className="space-y-5">
          <h2 className="text-2xl font-semibold">Как работает</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Комплект</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Хаб, датчики движения, двери, газа, воды и часы с кнопкой SOS.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>События</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Потоки из дома и с часов агрегируются в единую хронологию и аналитику.
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Решения</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Сервис разделяет спокойные рекомендации и действительно критичные сигналы.
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="modes" className="space-y-5">
          <h2 className="text-2xl font-semibold">Режимы</h2>
          <Card>
            <CardContent className="pt-6">
              <Tabs value={mode} onValueChange={(value) => setMode(value as typeof mode)}>
                <TabsList>
                  <TabsTrigger value="support_65">Support 65</TabsTrigger>
                  <TabsTrigger value="safety_plus">Safety Plus</TabsTrigger>
                </TabsList>
                <TabsContent value="support_65" className="space-y-2 pt-3 text-sm text-muted-foreground">
                  <p>Мягкий контроль динамики активности, сна и рутины.</p>
                  <p>Подсказки без лишних тревожных уведомлений.</p>
                </TabsContent>
                <TabsContent value="safety_plus" className="space-y-2 pt-3 text-sm text-muted-foreground">
                  <p>Приоритет критических ситуаций: SOS, газ, вода, геозона, ночные выходы.</p>
                  <p>Больше событий получают высокий приоритет и заметные бейджи на UI.</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Примеры уведомлений</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted-foreground">Ночное открытие двери после 22:00</span>
                <Badge variant="outline" className="border-amber-300 text-amber-700">
                  Внимание
                </Badge>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted-foreground">SOS с часов</span>
                <Badge variant="destructive">Критично</Badge>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted-foreground">Меньше движения днём</span>
                <Badge variant="secondary">Рекомендация</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Чем отличается от умного дома</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Фокус не на автоматизации света и розеток, а на безопасности и заботе о 65+.</p>
              <p>Важные данные в одном месте для семьи, без сложных сценариев настройки.</p>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Цена</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-3xl font-semibold">1 990 ₽ / месяц</p>
              <p className="text-muted-foreground">За один дом и подключение нескольких родственников.</p>
              <Button asChild variant="outline">
                <a href="/pricing">Подробности по тарифу</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FAQ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Нужны ли камеры? Нет, только датчики и носимое устройство.</p>
              <p>Нужны ли пароли? Нет, вход по magic link.</p>
              <Button asChild variant="outline">
                <a href="/faq">Открыть полный FAQ</a>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="rounded-2xl border bg-white/90 p-6 text-center">
          <h2 className="text-2xl font-semibold">Готовы подключить первый дом?</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
            Выберите роль, получите magic link и зайдите в свой кабинет. Демо-данные можно создать
            одной кнопкой через dev seed.
          </p>
          <Button asChild className="mt-4">
            <a href="/login">Перейти ко входу</a>
          </Button>
        </section>
      </div>
    </div>
  );
}
