create extension if not exists pgcrypto;

-- Enums
DO $$ BEGIN
  CREATE TYPE public.role AS ENUM ('caregiver', 'senior');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.mode AS ENUM ('support_65', 'safety_plus');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.device_type AS ENUM ('hub', 'motion', 'door', 'gas', 'water', 'watch');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.device_status AS ENUM ('online', 'offline', 'unknown');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.event_source AS ENUM ('home', 'watch');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.event_type AS ENUM ('motion', 'door_open', 'gas_detected', 'water_leak', 'sos', 'geofence_exit', 'no_motion');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.risk_level AS ENUM ('info', 'attention', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.insight_kind AS ENUM ('activity_drop', 'night_awake_increase', 'less_walks', 'routine_shift');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.insight_severity AS ENUM ('info', 'attention');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.access_level AS ENUM ('viewer', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.subscription_status AS ENUM ('active', 'paused', 'canceled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.feedback AS ENUM ('useful', 'not_useful');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.role not null,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.seniors (
  id uuid primary key default gen_random_uuid(),
  owner_caregiver_id uuid not null references public.profiles(id),
  linked_senior_user_id uuid references public.profiles(id),
  full_name text not null,
  birth_year int,
  city text,
  mode public.mode not null default 'support_65',
  created_at timestamptz not null default now()
);

create table if not exists public.caregiver_access (
  id uuid primary key default gen_random_uuid(),
  senior_id uuid not null references public.seniors(id) on delete cascade,
  caregiver_id uuid not null references public.profiles(id) on delete cascade,
  access_level public.access_level not null default 'admin',
  created_at timestamptz not null default now(),
  unique(senior_id, caregiver_id)
);

create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  senior_id uuid not null references public.seniors(id) on delete cascade,
  type public.device_type not null,
  vendor text,
  external_id text,
  status public.device_status not null default 'unknown',
  battery_percent int,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  senior_id uuid not null references public.seniors(id) on delete cascade,
  device_id uuid references public.devices(id) on delete set null,
  source public.event_source not null,
  event_type public.event_type not null,
  risk_level public.risk_level not null,
  payload jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  senior_id uuid not null references public.seniors(id) on delete cascade,
  kind public.insight_kind not null,
  title text not null,
  message text not null,
  severity public.insight_severity not null default 'info',
  period_start date,
  period_end date,
  feedback public.feedback,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  senior_id uuid not null unique references public.seniors(id) on delete cascade,
  status public.subscription_status not null default 'active',
  plan_name text not null default 'standard',
  started_at timestamptz not null default now(),
  renew_at timestamptz
);

-- Indexes
create index if not exists idx_seniors_owner on public.seniors(owner_caregiver_id);
create index if not exists idx_seniors_linked_user on public.seniors(linked_senior_user_id);
create index if not exists idx_caregiver_access_senior on public.caregiver_access(senior_id);
create index if not exists idx_caregiver_access_caregiver on public.caregiver_access(caregiver_id);
create index if not exists idx_devices_senior on public.devices(senior_id);
create index if not exists idx_events_senior_time on public.events(senior_id, occurred_at desc);
create index if not exists idx_events_risk on public.events(risk_level);
create index if not exists idx_insights_senior_time on public.insights(senior_id, created_at desc);

-- RLS
alter table public.profiles enable row level security;
alter table public.seniors enable row level security;
alter table public.caregiver_access enable row level security;
alter table public.devices enable row level security;
alter table public.events enable row level security;
alter table public.insights enable row level security;
alter table public.subscriptions enable row level security;

-- Helper functions for policies
create or replace function public.has_senior_access(target_senior_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.seniors s
    where s.id = target_senior_id
      and (
        s.owner_caregiver_id = auth.uid()
        or s.linked_senior_user_id = auth.uid()
        or exists (
          select 1
          from public.caregiver_access ca
          where ca.senior_id = s.id
            and ca.caregiver_id = auth.uid()
        )
      )
  );
$$;

create or replace function public.is_senior_admin(target_senior_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.seniors s
    where s.id = target_senior_id
      and (
        s.owner_caregiver_id = auth.uid()
        or exists (
          select 1
          from public.caregiver_access ca
          where ca.senior_id = s.id
            and ca.caregiver_id = auth.uid()
            and ca.access_level = 'admin'
        )
      )
  );
$$;

grant execute on function public.has_senior_access(uuid) to authenticated;
grant execute on function public.is_senior_admin(uuid) to authenticated;

-- Profiles policies: read/update/insert only own record
create policy if not exists profiles_select_own
on public.profiles
for select
using (auth.uid() = id);

create policy if not exists profiles_insert_own
on public.profiles
for insert
with check (auth.uid() = id);

create policy if not exists profiles_update_own
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Seniors policies
create policy if not exists seniors_select_access
on public.seniors
for select
using (public.has_senior_access(id));

create policy if not exists seniors_insert_owner
on public.seniors
for insert
with check (
  owner_caregiver_id = auth.uid()
  and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'caregiver'
  )
);

create policy if not exists seniors_update_admin
on public.seniors
for update
using (public.is_senior_admin(id))
with check (public.is_senior_admin(id));

create policy if not exists seniors_delete_admin
on public.seniors
for delete
using (public.is_senior_admin(id));

-- Caregiver access policies
create policy if not exists caregiver_access_select
on public.caregiver_access
for select
using (
  public.is_senior_admin(senior_id)
  or exists (
    select 1
    from public.seniors s
    where s.id = caregiver_access.senior_id
      and s.linked_senior_user_id = auth.uid()
  )
);

create policy if not exists caregiver_access_insert_admin
on public.caregiver_access
for insert
with check (
  public.is_senior_admin(senior_id)
  and exists (
    select 1 from public.profiles p where p.id = caregiver_access.caregiver_id and p.role = 'caregiver'
  )
);

create policy if not exists caregiver_access_update_admin
on public.caregiver_access
for update
using (public.is_senior_admin(senior_id))
with check (public.is_senior_admin(senior_id));

create policy if not exists caregiver_access_delete_admin
on public.caregiver_access
for delete
using (public.is_senior_admin(senior_id));

-- Devices policies
create policy if not exists devices_select_access
on public.devices
for select
using (public.has_senior_access(senior_id));

create policy if not exists devices_insert_admin
on public.devices
for insert
with check (public.is_senior_admin(senior_id));

create policy if not exists devices_update_admin
on public.devices
for update
using (public.is_senior_admin(senior_id))
with check (public.is_senior_admin(senior_id));

create policy if not exists devices_delete_admin
on public.devices
for delete
using (public.is_senior_admin(senior_id));

-- Events policies
create policy if not exists events_select_access
on public.events
for select
using (public.has_senior_access(senior_id));

create policy if not exists events_insert_admin
on public.events
for insert
with check (public.is_senior_admin(senior_id));

create policy if not exists events_update_admin
on public.events
for update
using (public.is_senior_admin(senior_id))
with check (public.is_senior_admin(senior_id));

create policy if not exists events_delete_admin
on public.events
for delete
using (public.is_senior_admin(senior_id));

-- Insights policies
create policy if not exists insights_select_access
on public.insights
for select
using (public.has_senior_access(senior_id));

create policy if not exists insights_insert_admin
on public.insights
for insert
with check (public.is_senior_admin(senior_id));

create policy if not exists insights_update_admin
on public.insights
for update
using (public.is_senior_admin(senior_id))
with check (public.is_senior_admin(senior_id));

create policy if not exists insights_delete_admin
on public.insights
for delete
using (public.is_senior_admin(senior_id));

-- Subscriptions policies
create policy if not exists subscriptions_select_access
on public.subscriptions
for select
using (public.has_senior_access(senior_id));

create policy if not exists subscriptions_insert_admin
on public.subscriptions
for insert
with check (public.is_senior_admin(senior_id));

create policy if not exists subscriptions_update_admin
on public.subscriptions
for update
using (public.is_senior_admin(senior_id))
with check (public.is_senior_admin(senior_id));

create policy if not exists subscriptions_delete_admin
on public.subscriptions
for delete
using (public.is_senior_admin(senior_id));
