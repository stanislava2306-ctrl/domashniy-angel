import { requireProfile } from "@/lib/auth";
import { formatDateTime } from "@/lib/domain";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { RiskBadge } from "@/components/app/badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SeniorHomePage() {
  const profile = await requireProfile("senior");
  const supabase = getSupabaseServerClient();

  const { data: senior } = await supabase
    .from("seniors")
    .select("id, full_name, mode")
    .eq("linked_senior_user_id", profile.id)
    .maybeSingle();

  if (!senior) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Пока нет привязки к дому</CardTitle>
        </CardHeader>
        <CardContent className="text-base text-muted-foreground">
          Попросите родственника привязать ваш профиль в карточке подопечного.
        </CardContent>
      </Card>
    );
  }

  const [{ data: recentEvents }, { data: latestInsight }] = await Promise.all([
    supabase
      .from("events")
      .select("id, event_type, risk_level, occurred_at")
      .eq("senior_id", senior.id)
      .order("occurred_at", { ascending: false })
      .limit(5),
    supabase
      .from("insights")
      .select("id, title, message, created_at")
      .eq("senior_id", senior.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Здравствуйте, {senior.full_name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-base">
          <p className="text-muted-foreground">
            Ваш режим сейчас: <strong>{senior.mode}</strong>. Система показывает вашей семье только
            важные события и спокойные подсказки.
          </p>
          <p className="text-muted-foreground">Если станет нужна помощь, близкие увидят уведомления сразу.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Последние события</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(recentEvents ?? []).map((eventItem) => (
            <div key={eventItem.id} className="flex items-center justify-between rounded-lg border bg-white p-3">
              <div>
                <p className="text-base font-medium">{eventItem.event_type}</p>
                <p className="text-sm text-muted-foreground">{formatDateTime(eventItem.occurred_at)}</p>
              </div>
              <RiskBadge risk={eventItem.risk_level} />
            </div>
          ))}
          {recentEvents?.length ? null : <p className="text-base text-muted-foreground">Событий пока нет.</p>}
        </CardContent>
      </Card>

      {latestInsight ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Последняя подсказка</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-base">
            <p className="font-semibold">{latestInsight.title}</p>
            <p className="text-muted-foreground">{latestInsight.message}</p>
            <p className="text-sm text-muted-foreground">{formatDateTime(latestInsight.created_at)}</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
