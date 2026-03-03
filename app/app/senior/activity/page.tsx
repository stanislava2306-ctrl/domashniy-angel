import { requireProfile } from "@/lib/auth";
import { formatDateTime } from "@/lib/domain";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { RiskBadge } from "@/components/app/badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function SeniorActivityPage() {
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
          <CardTitle className="text-xl">Активность</CardTitle>
        </CardHeader>
        <CardContent className="text-base text-muted-foreground">
          Ваш профиль пока не связан с домом.
        </CardContent>
      </Card>
    );
  }

  const { data: events } = await supabase
    .from("events")
    .select("id, event_type, risk_level, occurred_at")
    .eq("senior_id", senior.id)
    .order("occurred_at", { ascending: false })
    .limit(30);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">История активности</CardTitle>
      </CardHeader>
      <CardContent>
        {events && events.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Событие</TableHead>
                <TableHead>Риск</TableHead>
                <TableHead>Когда</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((eventItem) => (
                <TableRow key={eventItem.id}>
                  <TableCell>{eventItem.event_type}</TableCell>
                  <TableCell>
                    <RiskBadge risk={eventItem.risk_level} />
                  </TableCell>
                  <TableCell>{formatDateTime(eventItem.occurred_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-base text-muted-foreground">Записей пока нет.</p>
        )}
      </CardContent>
    </Card>
  );
}
