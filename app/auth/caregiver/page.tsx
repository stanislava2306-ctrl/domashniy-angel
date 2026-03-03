import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const emailSchema = z.object({
  email: z.string().trim().email("Введите корректный email")
});

async function sendMagicLink(formData: FormData) {
  "use server";

  const parsed = emailSchema.safeParse({
    email: formData.get("email")
  });

  if (!parsed.success) {
    redirect(`/auth/caregiver?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Ошибка")}`);
  }

  cookies().set("role_hint", "caregiver", { path: "/", maxAge: 60 * 30, sameSite: "lax" });

  const supabase = getSupabaseServerClient();
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/app/caregiver`
    }
  });

  if (error) {
    redirect(`/auth/caregiver?error=${encodeURIComponent("Не удалось отправить magic link")}`);
  }

  redirect("/auth/caregiver?sent=1");
}

export default function CaregiverAuthPage({
  searchParams
}: {
  searchParams: { sent?: string; error?: string };
}) {
  const sent = searchParams.sent === "1";
  const error = searchParams.error;

  return (
    <div className="container py-12">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-2xl border bg-white/85 p-6 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Вход для родственника</h1>
          <p className="text-sm text-muted-foreground">
            Укажите email. Отправим ссылку для входа без пароля.
          </p>
        </div>

        {error ? <Alert variant="destructive">{error}</Alert> : null}
        {sent ? (
          <Alert variant="soft">Письмо отправлено. Проверьте входящие и папку «Спам».</Alert>
        ) : null}

        <form action={sendMagicLink} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <Button type="submit" className="w-full">
            Получить magic link
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Нужен кабинет 65+? <a href="/auth/senior">Переключиться</a>
        </p>
      </div>
    </div>
  );
}
