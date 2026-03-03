# Домашний ангел

Production-ready MVP на **Next.js (App Router) + TypeScript + TailwindCSS + shadcn/ui + Supabase**.

Реализовано:
- Лендинг + public страницы `/pricing`, `/faq`
- Два входа: caregiver и senior (`/login`, `/auth/caregiver`, `/auth/senior`)
- Magic link auth через Supabase
- Два кабинета: caregiver и senior
- SQL-схема с enum, таблицами, RLS и политиками доступа
- Dev seed route (`POST /api/dev/seed`) только для development

## 1) Стек

- Next.js 14 (App Router)
- TypeScript (strict)
- TailwindCSS
- shadcn/ui компоненты: Button, Card, Tabs, Table, Badge, Alert, Input, Dialog, Dropdown
- Supabase Auth + Postgres + RLS
- Zod для валидации форм

## 2) Переменные окружения

Скопируйте шаблон:

```bash
cp .env.example .env.local
```

Заполните:

- `NEXT_PUBLIC_SITE_URL` (локально `http://localhost:3000`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (только сервер, не отдавать на клиент)

## 3) Настройка Supabase

1. Создайте проект в [Supabase](https://supabase.com/).
2. В `Settings -> API` возьмите URL, anon key и service_role key.
3. В `Authentication -> URL Configuration` укажите:
   - `Site URL`: `http://localhost:3000`
4. В `Authentication -> Providers -> Email` включите magic link/passwordless.

## 4) Применение SQL схемы

1. Откройте Supabase SQL Editor.
2. Вставьте содержимое [`schema.sql`](./schema.sql).
3. Выполните скрипт.

Скрипт создаёт:
- enum’ы
- таблицы `profiles`, `seniors`, `caregiver_access`, `devices`, `events`, `insights`, `subscriptions`
- индексы
- RLS + policies

## 5) Установка и запуск

```bash
npm install
npm run dev
```

Приложение: `http://localhost:3000`

## 6) Auth flow

- `/login`: выбор роли
- `/auth/caregiver` и `/auth/senior`: ввод email
- magic link приходит на email
- callback: `/auth/callback`
- после входа пользователь попадает в свой кабинет по роли

Guard по роли:
- `/app/caregiver/*` только для `role=caregiver`
- `/app/senior/*` только для `role=senior`
- при несовпадении роли редирект на `/login`

## 7) Seed демо данных

Только при `NODE_ENV=development`:

```bash
curl -X POST http://localhost:3000/api/dev/seed
```

Требуется быть залогиненным как caregiver.

Seed создаёт:
- демо senior для текущего caregiver
- `caregiver_access` с уровнем `admin`
- комплект устройств (hub, motion x2, door, gas, water, watch)
- события + инсайты
- подписку

## 8) Основные маршруты

Public:
- `/`
- `/pricing`
- `/faq`
- `/login`
- `/auth/caregiver`
- `/auth/senior`

Caregiver app:
- `/app/caregiver`
- `/app/caregiver/seniors`
- `/app/caregiver/seniors/new`
- `/app/caregiver/seniors/[id]`
- `/app/caregiver/seniors/[id]/devtools`
- `/app/caregiver/settings`
- `/app/caregiver/support`

Senior app:
- `/app/senior`
- `/app/senior/activity`
- `/app/senior/insights`
- `/app/senior/family`
- `/app/senior/settings`

## 9) Что реализовано в MVP

Caregiver:
- CRUD seniors (create, read, update, delete)
- CRUD devices (add/delete/list)
- Events с фильтрами (`risk_level`, `source`, диапазон дат)
- Insights + feedback (`useful` / `not_useful`)
- Access invite по email (только существующий caregiver профиль)
- Subscription просмотр
- Weekly summary analytics
- Devtools генерации событий с авто risk-level

Senior:
- Главная сводка
- Активность
- Инсайты
- Семья (read-only)
- Настройка крупного шрифта (localStorage)

## 10) Проверка сборки

```bash
npm run build
```

Если переменные Supabase не выставлены, auth-действия не будут работать, но сборка TypeScript проходит.

## 11) Деплой на Vercel

Пошаговый сценарий деплоя и привязки домена:

- [`docs/deploy-vercel.md`](./docs/deploy-vercel.md)
