import { redirect } from "next/navigation";
import { z } from "zod";
import { requireProfile } from "@/lib/auth";
import type { Mode } from "@/lib/domain";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const schema = z.object({
  full_name: z.string().trim().min(2, "Введите имя"),
  city: z.string().trim().optional(),
  birth_year: z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      if (!value) {
        return null;
      }
      const parsed = Number.parseInt(value, 10);
      return Number.isNaN(parsed) ? null : parsed;
    }),
  mode: z.union([z.literal("support_65"), z.literal("safety_plus")])
});

async function createSenior(formData: FormData) {
  "use server";

  const profile = await requireProfile("caregiver");

  const parsed = schema.safeParse({
    full_name: formData.get("full_name"),
    city: formData.get("city") || undefined,
    birth_year: formData.get("birth_year") || undefined,
    mode: formData.get("mode")
  });

  if (!parsed.success) {
    redirect(`/app/caregiver/seniors/new?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "validation")}`);
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("seniors")
    .insert({
      owner_caregiver_id: profile.id,
      full_name: parsed.data.full_name,
      city: parsed.data.city || null,
      birth_year: parsed.data.birth_year,
      mode: parsed.data.mode as Mode
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/app/caregiver/seniors/new?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.from("caregiver_access").upsert(
    {
      senior_id: data.id,
      caregiver_id: profile.id,
      access_level: "admin"
    },
    { onConflict: "senior_id,caregiver_id" }
  );

  redirect(`/app/caregiver/seniors/${data.id}`);
}

export default function NewSeniorPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Новый подопечный</CardTitle>
        </CardHeader>
        <CardContent>
          {searchParams.error ? <Alert variant="destructive">{searchParams.error}</Alert> : null}

          <form action={createSenior} className="mt-3 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="full_name" className="text-sm font-medium">
                Имя
              </label>
              <Input id="full_name" name="full_name" placeholder="Например, Анна Ивановна" required />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="city" className="text-sm font-medium">
                  Город
                </label>
                <Input id="city" name="city" placeholder="Москва" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="birth_year" className="text-sm font-medium">
                  Год рождения
                </label>
                <Input id="birth_year" name="birth_year" inputMode="numeric" placeholder="1948" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="mode" className="text-sm font-medium">
                Режим
              </label>
              <select
                id="mode"
                name="mode"
                defaultValue="support_65"
                className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
              >
                <option value="support_65">Support 65</option>
                <option value="safety_plus">Safety Plus</option>
              </select>
            </div>

            <Button type="submit" className="w-full">
              Создать профиль
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
