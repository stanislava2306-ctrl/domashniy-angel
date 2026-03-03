import { requireProfile } from "@/lib/auth";
import { formatDate } from "@/lib/domain";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function SeniorFamilyPage() {
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
          <CardTitle className="text-xl">Семья</CardTitle>
        </CardHeader>
        <CardContent className="text-base text-muted-foreground">Профиль пока не привязан к дому.</CardContent>
      </Card>
    );
  }

  const { data: accessRows } = await supabase
    .from("caregiver_access")
    .select("id, caregiver_id, access_level, created_at")
    .eq("senior_id", senior.id)
    .order("created_at", { ascending: true });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Кто имеет доступ</CardTitle>
      </CardHeader>
      <CardContent>
        {accessRows && accessRows.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Caregiver</TableHead>
                <TableHead>Уровень</TableHead>
                <TableHead>Добавлен</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accessRows.map((access) => (
                <TableRow key={access.id}>
                  <TableCell className="font-mono text-xs">{access.caregiver_id}</TableCell>
                  <TableCell>
                    <Badge variant={access.access_level === "admin" ? "secondary" : "outline"}>
                      {access.access_level}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(access.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-base text-muted-foreground">Родственники пока не добавлены.</p>
        )}
      </CardContent>
    </Card>
  );
}
