import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireProfile } from "@/lib/auth";
import { formatDate, formatDateTime, type Feedback } from "@/lib/domain";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { InsightSeverityBadge, ModeBadge, RiskBadge, SubscriptionBadge } from "@/components/app/badges";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const updateSeniorSchema = z.object({
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

const addDeviceSchema = z.object({
  type: z.union([
    z.literal("hub"),
    z.literal("motion"),
    z.literal("door"),
    z.literal("gas"),
    z.literal("water"),
    z.literal("watch")
  ]),
  vendor: z.string().trim().optional(),
  external_id: z.string().trim().optional(),
  status: z.union([z.literal("online"), z.literal("offline"), z.literal("unknown")])
});

const inviteSchema = z.object({
  email: z.string().trim().email("Введите корректный email")
});

const tabs = [
  "overview",
  "events",
  "map",
  "analytics",
  "insights",
  "devices",
  "access",
  "subscription"
] as const;

type TabValue = (typeof tabs)[number];

function readQuery(
  query: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const raw = query[key];
  if (!raw) {
    return undefined;
  }
  return Array.isArray(raw) ? raw[0] : raw;
}

function resolveTab(query: Record<string, string | string[] | undefined>): TabValue {
  const raw = readQuery(query, "tab");
  if (!raw) {
    return "overview";
  }
  return tabs.includes(raw as TabValue) ? (raw as TabValue) : "overview";
}

async function updateSeniorAction(seniorId: string, formData: FormData) {
  "use server";

  await requireProfile("caregiver");
  const parsed = updateSeniorSchema.safeParse({
    full_name: formData.get("full_name"),
    city: formData.get("city") || undefined,
    birth_year: formData.get("birth_year") || undefined,
    mode: formData.get("mode")
  });

  if (!parsed.success) {
    redirect(`/app/caregiver/seniors/${seniorId}?tab=overview&error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "validation")}`);
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("seniors")
    .update({
      full_name: parsed.data.full_name,
      city: parsed.data.city || null,
      birth_year: parsed.data.birth_year,
      mode: parsed.data.mode
    })
    .eq("id", seniorId);

  if (error) {
    redirect(`/app/caregiver/seniors/${seniorId}?tab=overview&error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/app/caregiver/seniors/${seniorId}?tab=overview&saved=1`);
}

async function deleteSeniorAction(seniorId: string) {
  "use server";

  await requireProfile("caregiver");
  const supabase = getSupabaseServerClient();
  await supabase.from("seniors").delete().eq("id", seniorId);
  redirect("/app/caregiver/seniors");
}

async function addDeviceAction(seniorId: string, formData: FormData) {
  "use server";

  await requireProfile("caregiver");
  const parsed = addDeviceSchema.safeParse({
    type: formData.get("type"),
    vendor: formData.get("vendor") || undefined,
    external_id: formData.get("external_id") || undefined,
    status: formData.get("status")
  });

  if (!parsed.success) {
    redirect(`/app/caregiver/seniors/${seniorId}?tab=devices&error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "validation")}`);
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("devices").insert({
    senior_id: seniorId,
    type: parsed.data.type,
    vendor: parsed.data.vendor || null,
    external_id: parsed.data.external_id || null,
    status: parsed.data.status,
    battery_percent: parsed.data.type === "watch" ? 92 : null,
    last_seen_at: new Date().toISOString()
  });

  if (error) {
    redirect(`/app/caregiver/seniors/${seniorId}?tab=devices&error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/app/caregiver/seniors/${seniorId}?tab=devices&saved=1`);
}

async function deleteDeviceAction(seniorId: string, deviceId: string) {
  "use server";

  await requireProfile("caregiver");
  const supabase = getSupabaseServerClient();
  await supabase.from("devices").delete().eq("id", deviceId).eq("senior_id", seniorId);
  redirect(`/app/caregiver/seniors/${seniorId}?tab=devices`);
}

async function updateInsightFeedbackAction(seniorId: string, insightId: string, feedback: Feedback) {
  "use server";

  await requireProfile("caregiver");
  const supabase = getSupabaseServerClient();
  await supabase.from("insights").update({ feedback }).eq("id", insightId).eq("senior_id", seniorId);
  redirect(`/app/caregiver/seniors/${seniorId}?tab=insights`);
}

async function inviteCaregiverAction(seniorId: string, formData: FormData) {
  "use server";

  await requireProfile("caregiver");
  const parsed = inviteSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    redirect(`/app/caregiver/seniors/${seniorId}?tab=access&error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "validation")}`);
  }

  const admin = getSupabaseAdminClient();
  const lookup = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  });
  const invitedUser = lookup.data.users.find(
    (item) => item.email?.toLowerCase() === parsed.data.email.toLowerCase()
  );

  if (!invitedUser) {
    redirect(`/app/caregiver/seniors/${seniorId}?tab=access&error=${encodeURIComponent("Пользователь с таким email не найден")}`);
  }

  const { data: invitedProfile } = await admin
    .from("profiles")
    .select("id, role")
    .eq("id", invitedUser.id)
    .maybeSingle();

  if (!invitedProfile || invitedProfile.role !== "caregiver") {
    redirect(`/app/caregiver/seniors/${seniorId}?tab=access&error=${encodeURIComponent("Нужен существующий профиль caregiver")}`);
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("caregiver_access")
    .upsert(
      {
        senior_id: seniorId,
        caregiver_id: invitedUser.id,
        access_level: "viewer"
      },
      { onConflict: "senior_id,caregiver_id" }
    );

  if (error) {
    redirect(`/app/caregiver/seniors/${seniorId}?tab=access&error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/app/caregiver/seniors/${seniorId}?tab=access&saved=1`);
}

export default async function SeniorDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requireProfile("caregiver");
  const supabase = getSupabaseServerClient();
  const activeTab = resolveTab(searchParams);

  const { data: senior } = await supabase
    .from("seniors")
    .select("id, full_name, birth_year, city, mode, created_at")
    .eq("id", params.id)
    .maybeSingle();

  if (!senior) {
    notFound();
  }

  const riskFilter = readQuery(searchParams, "risk");
  const sourceFilter = readQuery(searchParams, "source");
  const fromFilter = readQuery(searchParams, "from");
  const toFilter = readQuery(searchParams, "to");

  let eventsQuery = supabase
    .from("events")
    .select("id, event_type, source, risk_level, occurred_at")
    .eq("senior_id", senior.id)
    .order("occurred_at", { ascending: false })
    .limit(50);

  if (riskFilter) {
    eventsQuery = eventsQuery.eq("risk_level", riskFilter);
  }

  if (sourceFilter) {
    eventsQuery = eventsQuery.eq("source", sourceFilter);
  }

  if (fromFilter) {
    eventsQuery = eventsQuery.gte("occurred_at", `${fromFilter}T00:00:00`);
  }

  if (toFilter) {
    eventsQuery = eventsQuery.lte("occurred_at", `${toFilter}T23:59:59`);
  }

  const [{ data: events }, { data: insights }, { data: devices }, { data: accessRows }, { data: subscription }] =
    await Promise.all([
      eventsQuery,
      supabase
        .from("insights")
        .select("id, kind, title, message, severity, feedback, created_at")
        .eq("senior_id", senior.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("devices")
        .select("id, type, vendor, external_id, status, battery_percent, last_seen_at")
        .eq("senior_id", senior.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("caregiver_access")
        .select("id, caregiver_id, access_level, created_at")
        .eq("senior_id", senior.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("subscriptions")
        .select("status, plan_name, renew_at, started_at")
        .eq("senior_id", senior.id)
        .maybeSingle()
    ]);

  const lastWeekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: lastWeekEvents } = await supabase
    .from("events")
    .select("event_type, risk_level, occurred_at")
    .eq("senior_id", senior.id)
    .gte("occurred_at", lastWeekStart);

  const summary = {
    motion: 0,
    nightDoorOpen: 0,
    critical: 0
  };

  for (const eventItem of lastWeekEvents ?? []) {
    if (eventItem.event_type === "motion") {
      summary.motion += 1;
    }

    if (eventItem.event_type === "door_open") {
      const hour = new Date(eventItem.occurred_at).getHours();
      if (hour >= 22 || hour < 6) {
        summary.nightDoorOpen += 1;
      }
    }

    if (eventItem.risk_level === "critical") {
      summary.critical += 1;
    }
  }

  const infoMessage = readQuery(searchParams, "saved");
  const errorMessage = readQuery(searchParams, "error");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>{senior.full_name}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {senior.city ?? "Город не указан"}
              {senior.birth_year ? ` · ${senior.birth_year} г.р.` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ModeBadge mode={senior.mode} />
            <Button asChild variant="outline" size="sm">
              <Link href={`/app/caregiver/seniors/${senior.id}/devtools`}>Devtools</Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {infoMessage ? <Alert variant="soft">Сохранено</Alert> : null}
      {errorMessage ? <Alert variant="destructive">{errorMessage}</Alert> : null}

      <Tabs defaultValue={activeTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="access">Access</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-[1.2fr,1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Профиль подопечного</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={updateSeniorAction.bind(null, senior.id)} className="space-y-3">
                  <div className="space-y-1.5">
                    <label htmlFor="full_name" className="text-sm font-medium">
                      Имя
                    </label>
                    <Input id="full_name" name="full_name" defaultValue={senior.full_name} />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="city" className="text-sm font-medium">
                        Город
                      </label>
                      <Input id="city" name="city" defaultValue={senior.city ?? ""} />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="birth_year" className="text-sm font-medium">
                        Год рождения
                      </label>
                      <Input id="birth_year" name="birth_year" defaultValue={senior.birth_year?.toString() ?? ""} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="mode" className="text-sm font-medium">
                      Режим
                    </label>
                    <select
                      id="mode"
                      name="mode"
                      defaultValue={senior.mode}
                      className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
                    >
                      <option value="support_65">Support 65</option>
                      <option value="safety_plus">Safety Plus</option>
                    </select>
                  </div>
                  <Button type="submit">Сохранить</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="rounded-lg border bg-white p-3">
                  <p className="text-xs text-muted-foreground">Создан</p>
                  <p className="font-medium">{formatDate(senior.created_at)}</p>
                </div>
                <div className="rounded-lg border bg-white p-3">
                  <p className="text-xs text-muted-foreground">Устройств</p>
                  <p className="font-medium">{devices?.length ?? 0}</p>
                </div>
                <form action={deleteSeniorAction.bind(null, senior.id)}>
                  <Button type="submit" variant="destructive" className="w-full">
                    Удалить подопечного
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>События</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="grid gap-2 rounded-lg border bg-white p-3 md:grid-cols-5" method="get">
                <input type="hidden" name="tab" value="events" />
                <select name="risk" defaultValue={riskFilter ?? ""} className="h-9 rounded-md border border-input px-2 text-sm">
                  <option value="">Любой риск</option>
                  <option value="info">info</option>
                  <option value="attention">attention</option>
                  <option value="critical">critical</option>
                </select>
                <select
                  name="source"
                  defaultValue={sourceFilter ?? ""}
                  className="h-9 rounded-md border border-input px-2 text-sm"
                >
                  <option value="">Любой источник</option>
                  <option value="home">home</option>
                  <option value="watch">watch</option>
                </select>
                <Input type="date" name="from" defaultValue={fromFilter} />
                <Input type="date" name="to" defaultValue={toFilter} />
                <Button type="submit" variant="outline">
                  Фильтр
                </Button>
              </form>

              {events && events.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Тип</TableHead>
                      <TableHead>Источник</TableHead>
                      <TableHead>Риск</TableHead>
                      <TableHead>Время</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((eventItem) => (
                      <TableRow key={eventItem.id}>
                        <TableCell>{eventItem.event_type}</TableCell>
                        <TableCell>{eventItem.source}</TableCell>
                        <TableCell>
                          <RiskBadge risk={eventItem.risk_level} />
                        </TableCell>
                        <TableCell>{formatDateTime(eventItem.occurred_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">По текущим фильтрам событий не найдено.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Map (mock)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-dashed bg-white p-10 text-center text-sm text-muted-foreground">
                Здесь может быть карта с геозоной и последним событием watch.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Weekly summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Метрика</TableHead>
                    <TableHead>За 7 дней</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>motion</TableCell>
                    <TableCell>{summary.motion}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>door_open ночью</TableCell>
                    <TableCell>{summary.nightDoorOpen}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>critical события</TableCell>
                    <TableCell>{summary.critical}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Инсайты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(insights ?? []).map((insight) => (
                <div key={insight.id} className="space-y-2 rounded-xl border bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{insight.title}</p>
                    <InsightSeverityBadge severity={insight.severity} />
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.message}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">{formatDateTime(insight.created_at)}</span>
                    {insight.feedback ? <Badge variant="outline">feedback: {insight.feedback}</Badge> : null}
                  </div>
                  <div className="flex gap-2">
                    <form action={updateInsightFeedbackAction.bind(null, senior.id, insight.id, "useful")}>
                      <Button size="sm" variant="outline" type="submit">
                        Useful
                      </Button>
                    </form>
                    <form action={updateInsightFeedbackAction.bind(null, senior.id, insight.id, "not_useful")}>
                      <Button size="sm" variant="outline" type="submit">
                        Not useful
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
              {insights?.length ? null : <p className="text-sm text-muted-foreground">Инсайтов пока нет.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Добавить устройство</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={addDeviceAction.bind(null, senior.id)} className="grid gap-2 md:grid-cols-5">
                  <select name="type" className="h-10 rounded-md border border-input px-2 text-sm" defaultValue="motion">
                    <option value="hub">hub</option>
                    <option value="motion">motion</option>
                    <option value="door">door</option>
                    <option value="gas">gas</option>
                    <option value="water">water</option>
                    <option value="watch">watch</option>
                  </select>
                  <Input name="vendor" placeholder="vendor" />
                  <Input name="external_id" placeholder="external id" />
                  <select name="status" className="h-10 rounded-md border border-input px-2 text-sm" defaultValue="online">
                    <option value="online">online</option>
                    <option value="offline">offline</option>
                    <option value="unknown">unknown</option>
                  </select>
                  <Button type="submit">Добавить</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Список устройств</CardTitle>
              </CardHeader>
              <CardContent>
                {devices && devices.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Тип</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Заряд</TableHead>
                        <TableHead>Последний контакт</TableHead>
                        <TableHead>Действие</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {devices.map((device) => (
                        <TableRow key={device.id}>
                          <TableCell>{device.type}</TableCell>
                          <TableCell>{device.vendor ?? "—"}</TableCell>
                          <TableCell>{device.status}</TableCell>
                          <TableCell>{device.battery_percent ?? "—"}</TableCell>
                          <TableCell>{device.last_seen_at ? formatDateTime(device.last_seen_at) : "—"}</TableCell>
                          <TableCell>
                            <form action={deleteDeviceAction.bind(null, senior.id, device.id)}>
                              <Button variant="outline" size="sm" type="submit">
                                Удалить
                              </Button>
                            </form>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">Устройства ещё не добавлены.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Доступ родственников</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form action={inviteCaregiverAction.bind(null, senior.id)} className="flex flex-col gap-2 md:flex-row">
                <Input type="email" name="email" placeholder="email caregiver" required className="flex-1" />
                <Button type="submit">Пригласить viewer</Button>
              </form>

              {accessRows && accessRows.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Caregiver ID</TableHead>
                      <TableHead>Права</TableHead>
                      <TableHead>Добавлен</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessRows.map((access) => (
                      <TableRow key={access.id}>
                        <TableCell className="font-mono text-xs">{access.caregiver_id}</TableCell>
                        <TableCell>{access.access_level}</TableCell>
                        <TableCell>{formatDate(access.created_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">Пока нет дополнительных участников семьи.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Подписка</CardTitle>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Статус</span>
                    <SubscriptionBadge status={subscription.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">План</span>
                    <span>{subscription.plan_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Старт</span>
                    <span>{formatDate(subscription.started_at)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Продление</span>
                    <span>{subscription.renew_at ? formatDate(subscription.renew_at) : "—"}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Подписка не назначена.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
