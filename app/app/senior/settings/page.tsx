import { requireProfile } from "@/lib/auth";
import { SeniorSettingsClient } from "@/components/app/senior-settings-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SeniorSettingsPage() {
  const profile = await requireProfile("senior");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Настройки отображения</CardTitle>
        </CardHeader>
        <CardContent className="text-base">
          <SeniorSettingsClient />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Профиль</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-base">
          <p>
            <span className="text-muted-foreground">Имя: </span>
            <span className="font-medium">{profile.full_name ?? "не указано"}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Телефон: </span>
            <span className="font-medium">{profile.phone ?? "не указан"}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
