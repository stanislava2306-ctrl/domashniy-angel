import { redirect } from "next/navigation";
import { z } from "zod";
import { requireProfile } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const schema = z.object({
  full_name: z.string().trim().optional(),
  phone: z.string().trim().optional()
});

async function updateProfileAction(formData: FormData) {
  "use server";

  const profile = await requireProfile("caregiver");
  const parsed = schema.safeParse({
    full_name: formData.get("full_name") || undefined,
    phone: formData.get("phone") || undefined
  });

  if (!parsed.success) {
    redirect("/app/caregiver/settings?error=validation");
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name || null,
      phone: parsed.data.phone || null
    })
    .eq("id", profile.id);

  if (error) {
    redirect(`/app/caregiver/settings?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app/caregiver/settings?saved=1");
}

export default async function CaregiverSettingsPage({
  searchParams
}: {
  searchParams: { error?: string; saved?: string };
}) {
  const profile = await requireProfile("caregiver");

  return (
    <div className="max-w-2xl space-y-4">
      {searchParams.saved === "1" ? <Alert variant="soft">Профиль сохранён.</Alert> : null}
      {searchParams.error ? <Alert variant="destructive">{searchParams.error}</Alert> : null}

      <Card>
        <CardHeader>
          <CardTitle>Профиль caregiver</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateProfileAction} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="full_name" className="text-sm font-medium">
                Имя
              </label>
              <Input id="full_name" name="full_name" defaultValue={profile.full_name ?? ""} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-sm font-medium">
                Телефон
              </label>
              <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} />
            </div>
            <Button type="submit">Сохранить</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
