import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { eventSourceForType, resolveRiskLevel, type EventType, type Mode } from "@/lib/domain";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function generateEventAction(seniorId: string, eventType: EventType) {
  "use server";

  const profile = await requireProfile("caregiver");
  const supabase = getSupabaseServerClient();

  const { data: senior } = await supabase
    .from("seniors")
    .select("id, mode")
    .eq("id", seniorId)
    .maybeSingle();

  if (!senior) {
    redirect("/app/caregiver/seniors");
  }

  const occurredAt = new Date();
  const riskLevel = resolveRiskLevel(eventType, senior.mode as Mode, occurredAt);

  await supabase.from("events").insert({
    senior_id: senior.id,
    source: eventSourceForType(eventType),
    event_type: eventType,
    risk_level: riskLevel,
    payload: {
      generated_by: "devtools",
      actor_id: profile.id,
      mode: senior.mode
    },
    occurred_at: occurredAt.toISOString()
  });

  redirect(`/app/caregiver/seniors/${senior.id}?tab=events&saved=1`);
}

export default async function DevtoolsPage({ params }: { params: { id: string } }) {
  await requireProfile("caregiver");

  if (process.env.NODE_ENV === "production") {
    return <Alert variant="destructive">Devtools доступны только в development.</Alert>;
  }

  const supabase = getSupabaseServerClient();
  const { data: senior } = await supabase
    .from("seniors")
    .select("id, full_name, mode")
    .eq("id", params.id)
    .maybeSingle();

  if (!senior) {
    redirect("/app/caregiver/seniors");
  }

  const events: Array<{ label: string; value: EventType; destructive?: boolean }> = [
    { label: "motion", value: "motion" },
    { label: "door_open", value: "door_open" },
    { label: "no_motion", value: "no_motion" },
    { label: "geofence_exit", value: "geofence_exit" },
    { label: "sos", value: "sos", destructive: true },
    { label: "gas_detected", value: "gas_detected", destructive: true },
    { label: "water_leak", value: "water_leak", destructive: true }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Devtools: {senior.full_name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Текущий режим: <strong>{senior.mode}</strong>. Генерация событий автоматически назначает
            risk_level по правилам MVP.
          </p>

          <div className="grid gap-2 md:grid-cols-2">
            {events.map((eventItem) => (
              <form key={eventItem.value} action={generateEventAction.bind(null, senior.id, eventItem.value)}>
                <Button
                  type="submit"
                  variant={eventItem.destructive ? "destructive" : "outline"}
                  className="w-full"
                >
                  Generate {eventItem.label}
                </Button>
              </form>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
