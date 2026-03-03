import { requireProfile } from "@/lib/auth";
import { formatDateTime } from "@/lib/domain";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { InsightSeverityBadge } from "@/components/app/badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SeniorInsightsPage() {
  const profile = await requireProfile("senior");
  const supabase = getSupabaseServerClient();

  const { data: senior } = await supabase
    .from("seniors")
    .select("id")
    .eq("linked_senior_user_id", profile.id)
    .maybeSingle();

  if (!senior) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Подсказки</CardTitle>
        </CardHeader>
        <CardContent className="text-base text-muted-foreground">
          Попросите родственника связать ваш профиль с домом.
        </CardContent>
      </Card>
    );
  }

  const { data: insights } = await supabase
    .from("insights")
    .select("id, title, message, severity, created_at")
    .eq("senior_id", senior.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Подсказки и рекомендации</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {(insights ?? []).map((insight) => (
          <article key={insight.id} className="rounded-xl border bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold">{insight.title}</h3>
              <InsightSeverityBadge severity={insight.severity} />
            </div>
            <p className="mt-1 text-base text-muted-foreground">{insight.message}</p>
            <p className="mt-2 text-sm text-muted-foreground">{formatDateTime(insight.created_at)}</p>
          </article>
        ))}
        {insights?.length ? null : <p className="text-base text-muted-foreground">Подсказок пока нет.</p>}
      </CardContent>
    </Card>
  );
}
