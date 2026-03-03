import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Seed доступен только в development" }, { status: 403 });
  }

  const supabase = getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "caregiver") {
    return NextResponse.json({ error: "Seed доступен только caregiver" }, { status: 403 });
  }

  const { data: existingSenior } = await supabase
    .from("seniors")
    .select("id")
    .eq("owner_caregiver_id", profile.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  let seniorId = existingSenior?.id;

  if (!seniorId) {
    const { data: createdSenior, error: createSeniorError } = await supabase
      .from("seniors")
      .insert({
        owner_caregiver_id: profile.id,
        full_name: "Анна Петровна",
        birth_year: 1948,
        city: "Москва",
        mode: "support_65"
      })
      .select("id")
      .single();

    if (createSeniorError) {
      return NextResponse.json({ error: createSeniorError.message }, { status: 500 });
    }

    seniorId = createdSenior.id;
  }

  await supabase
    .from("caregiver_access")
    .upsert(
      {
        senior_id: seniorId,
        caregiver_id: profile.id,
        access_level: "admin"
      },
      { onConflict: "senior_id,caregiver_id" }
    );

  const { data: existingDevices } = await supabase
    .from("devices")
    .select("id")
    .eq("senior_id", seniorId)
    .limit(1);

  if (!existingDevices || existingDevices.length === 0) {
    await supabase.from("devices").insert([
      { senior_id: seniorId, type: "hub", vendor: "Angel", external_id: "hub-001", status: "online" },
      { senior_id: seniorId, type: "motion", vendor: "Angel", external_id: "motion-001", status: "online", battery_percent: 93 },
      { senior_id: seniorId, type: "motion", vendor: "Angel", external_id: "motion-002", status: "online", battery_percent: 88 },
      { senior_id: seniorId, type: "door", vendor: "Angel", external_id: "door-001", status: "online", battery_percent: 91 },
      { senior_id: seniorId, type: "gas", vendor: "Angel", external_id: "gas-001", status: "online" },
      { senior_id: seniorId, type: "water", vendor: "Angel", external_id: "water-001", status: "online" },
      { senior_id: seniorId, type: "watch", vendor: "Angel", external_id: "watch-001", status: "online", battery_percent: 86 }
    ]);
  }

  const now = Date.now();
  const eventsPayload = [
    {
      senior_id: seniorId,
      source: "home",
      event_type: "motion",
      risk_level: "info",
      payload: { room: "кухня" },
      occurred_at: new Date(now - 30 * 60 * 1000).toISOString()
    },
    {
      senior_id: seniorId,
      source: "home",
      event_type: "door_open",
      risk_level: "attention",
      payload: { hour: 23 },
      occurred_at: new Date(now - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      senior_id: seniorId,
      source: "watch",
      event_type: "geofence_exit",
      risk_level: "attention",
      payload: { area: "home-zone" },
      occurred_at: new Date(now - 8 * 60 * 60 * 1000).toISOString()
    }
  ];

  await supabase.from("events").insert(eventsPayload);

  await supabase.from("insights").insert([
    {
      senior_id: seniorId,
      kind: "activity_drop",
      title: "Меньше активности днём",
      message: "За последние 3 дня движения в гостиной меньше, чем обычно.",
      severity: "info"
    },
    {
      senior_id: seniorId,
      kind: "night_awake_increase",
      title: "Ночные пробуждения участились",
      message: "Ночью стало больше перемещений. Проверьте самочувствие.",
      severity: "attention"
    }
  ]);

  await supabase.from("subscriptions").upsert(
    {
      senior_id: seniorId,
      status: "active",
      plan_name: "standard",
      started_at: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
      renew_at: new Date(now + 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    { onConflict: "senior_id" }
  );

  return NextResponse.json({ ok: true, senior_id: seniorId });
}
