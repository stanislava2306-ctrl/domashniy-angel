import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { formatDateTime } from "@/lib/domain";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ModeBadge, RiskBadge, InsightSeverityBadge } from "@/components/app/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function CaregiverDashboardPage() {
  const profile = await requireProfile("caregiver");
  const supabase = getSupabaseServerClient();

  const { data: seniors } = await supabase
    .from("seniors")
    .select("id, full_name, mode, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: events } = await supabase
    .from("events")
    .select("id, event_type, risk_level, occurred_at")
    .order("occurred_at", { ascending: false })
    .limit(10);

  const { data: insights } = await supabase
    .from("insights")
    .select("id, title, severity, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Подопечные</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{seniors?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Профилей в вашем доступе</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>События</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{events?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Последние зафиксированные события</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Инсайты</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{insights?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Подсказки на основе динамики</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Подопечные</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/app/caregiver/seniors/new">Добавить</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {seniors && seniors.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Режим</TableHead>
                  <TableHead>Создан</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {seniors.map((senior) => (
                  <TableRow key={senior.id}>
                    <TableCell>
                      <Link href={`/app/caregiver/seniors/${senior.id}`} className="font-medium">
                        {senior.full_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <ModeBadge mode={senior.mode} />
                    </TableCell>
                    <TableCell>{new Date(senior.created_at).toLocaleDateString("ru-RU")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              Пока нет подопечных. Добавьте первого, затем откройте dev seed для демо-данных.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Последние события</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {(events ?? []).map((eventItem) => (
                <li key={eventItem.id} className="flex items-center justify-between gap-3 rounded-lg border bg-white p-2">
                  <div>
                    <p className="font-medium">{eventItem.event_type}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(eventItem.occurred_at)}</p>
                  </div>
                  <RiskBadge risk={eventItem.risk_level} />
                </li>
              ))}
              {events?.length ? null : <li className="text-muted-foreground">Пока нет событий.</li>}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Последние инсайты</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {(insights ?? []).map((insight) => (
                <li key={insight.id} className="flex items-center justify-between gap-3 rounded-lg border bg-white p-2">
                  <div>
                    <p className="font-medium">{insight.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(insight.created_at)}</p>
                  </div>
                  <InsightSeverityBadge severity={insight.severity} />
                </li>
              ))}
              {insights?.length ? null : <li className="text-muted-foreground">Пока нет инсайтов.</li>}
            </ul>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">Профиль: {profile.full_name ?? profile.id}</p>
    </div>
  );
}
