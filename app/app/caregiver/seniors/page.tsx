import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ModeBadge } from "@/components/app/badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function SeniorsPage() {
  await requireProfile("caregiver");
  const supabase = getSupabaseServerClient();

  const { data: seniors } = await supabase
    .from("seniors")
    .select("id, full_name, city, mode, created_at")
    .order("created_at", { ascending: false });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Подопечные</CardTitle>
        <Button asChild>
          <Link href="/app/caregiver/seniors/new">Создать</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {seniors && seniors.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Город</TableHead>
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
                  <TableCell>{senior.city ?? "—"}</TableCell>
                  <TableCell>
                    <ModeBadge mode={senior.mode} />
                  </TableCell>
                  <TableCell>{new Date(senior.created_at).toLocaleDateString("ru-RU")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">Список пуст. Добавьте первого подопечного.</p>
        )}
      </CardContent>
    </Card>
  );
}
