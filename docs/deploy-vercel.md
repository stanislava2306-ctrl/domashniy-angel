# Деплой на Vercel + привязка домена

## 1) Подготовка

```bash
cd "/Users/stanislava/Documents/New project"
npm run build
```

Если сборка зелёная, можно выкатывать.

## 2) Логин и линковка проекта

```bash
npm i -g vercel
vercel login
vercel link
```

Рекомендуемые ответы при `vercel link`:
- `Set up and deploy` -> `Y`
- Scope -> ваш аккаунт/команда
- Link to existing project? -> `N` (если первый деплой)
- Project name -> `domashniy-angel`

## 3) Переменные окружения (production)

```bash
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

Значение `NEXT_PUBLIC_SITE_URL`: `https://<your-domain>`

## 4) Деплой

```bash
vercel --prod
```

После команды получите production URL.

## 5) Подключение домена

```bash
vercel domains add <your-domain>
vercel domains add www.<your-domain>
```

Если Vercel попросит DNS-записи, добавьте их у регистратора домена.

## 6) Настройка Supabase Auth (обязательно)

Supabase -> `Authentication` -> `URL Configuration`:
- `Site URL`: `https://<your-domain>`
- `Redirect URLs`:
  - `https://<your-domain>/auth/callback`
  - `https://www.<your-domain>/auth/callback` (если используете `www`)

Без этого magic link не будет корректно возвращать в приложение.

## 7) Пост-деплой проверка

1. Откройте `https://<your-domain>/login`.
2. Проверьте вход как caregiver и senior.
3. Для caregiver запустите сид:
   - `POST https://<your-domain>/api/dev/seed`
   - В production должен вернуть `403` (это ожидаемо).
4. Убедитесь, что роуты `/app/caregiver` и `/app/senior` отдают role-based редиректы.

## 8) Чеклист перед запуском рекламы/пилота

- [ ] Домен и SSL активны
- [ ] `NEXT_PUBLIC_SITE_URL` совпадает с доменом
- [ ] Все 4 env добавлены в production
- [ ] Supabase Redirect URLs добавлены
- [ ] Magic link работает с реальной почтой
- [ ] Логи Vercel без критичных ошибок
