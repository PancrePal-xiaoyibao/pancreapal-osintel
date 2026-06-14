-- Pancreatic center research snapshot schema.
-- Stores dated evidence snapshots without turning public signal strength into rankings.

create table public.pancreatic_center_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_key text not null unique,
  snapshot_date date not null,
  collected_at timestamptz not null,
  title text not null,
  scope_note text not null,
  methodology_note text not null,
  disclaimer text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.pancreatic_center_snapshot_centers (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references public.pancreatic_center_snapshots(id) on delete cascade,
  center_key text not null,
  region_group text not null,
  country text not null,
  province_state text,
  city text,
  hospital_name text not null,
  center_name text,
  department_name text,
  center_type text not null default 'hospital_department',
  candidate_signal_rank integer check (candidate_signal_rank is null or candidate_signal_rank > 0),
  candidate_tier text,
  public_signal_heat numeric(5,2) check (public_signal_heat is null or (public_signal_heat >= 0 and public_signal_heat <= 100)),
  heat_note text,
  capability_tags text[] not null default '{}'::text[],
  complication_support_tags text[] not null default '{}'::text[],
  trial_signal text,
  wechat_signal jsonb not null default '{}'::jsonb,
  scale_summary text,
  verification_status text not null default 'unverified',
  confidence text not null default 'low',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (snapshot_id, center_key)
);

create table public.pancreatic_center_snapshot_sources (
  id uuid primary key default gen_random_uuid(),
  snapshot_center_id uuid not null references public.pancreatic_center_snapshot_centers(id) on delete cascade,
  source_key text not null,
  source_title text not null,
  source_url text not null,
  source_type text not null,
  source_published_at date,
  accessed_at date not null,
  evidence_summary text not null,
  verification_status text not null default 'single_source',
  confidence text not null default 'medium',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (snapshot_center_id, source_key)
);

create table public.pancreatic_center_volume_metrics (
  id uuid primary key default gen_random_uuid(),
  snapshot_center_id uuid not null references public.pancreatic_center_snapshot_centers(id) on delete cascade,
  metric_key text not null,
  metric_name text not null,
  metric_value numeric,
  metric_unit text,
  metric_period text,
  metric_scope text not null,
  metric_definition text not null,
  source_url text not null,
  source_type text not null,
  verification_status text not null default 'single_source',
  confidence text not null default 'medium',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (snapshot_center_id, metric_key)
);

create index pancreatic_center_snapshots_date_idx
on public.pancreatic_center_snapshots (snapshot_date desc);

create index pancreatic_snapshot_centers_snapshot_idx
on public.pancreatic_center_snapshot_centers (snapshot_id);

create index pancreatic_snapshot_centers_region_idx
on public.pancreatic_center_snapshot_centers (region_group, country, province_state, city);

create index pancreatic_snapshot_centers_rank_idx
on public.pancreatic_center_snapshot_centers (snapshot_id, candidate_signal_rank);

create index pancreatic_snapshot_centers_tags_gin_idx
on public.pancreatic_center_snapshot_centers using gin (capability_tags);

create index pancreatic_snapshot_sources_center_idx
on public.pancreatic_center_snapshot_sources (snapshot_center_id);

create index pancreatic_volume_metrics_center_idx
on public.pancreatic_center_volume_metrics (snapshot_center_id);

alter table public.pancreatic_center_snapshots enable row level security;
alter table public.pancreatic_center_snapshot_centers enable row level security;
alter table public.pancreatic_center_snapshot_sources enable row level security;
alter table public.pancreatic_center_volume_metrics enable row level security;

create policy "public can read pancreatic center snapshots"
on public.pancreatic_center_snapshots
for select
to anon, authenticated
using (true);

create policy "public can read pancreatic snapshot centers"
on public.pancreatic_center_snapshot_centers
for select
to anon, authenticated
using (true);

create policy "public can read pancreatic center sources"
on public.pancreatic_center_snapshot_sources
for select
to anon, authenticated
using (true);

create policy "public can read pancreatic center metrics"
on public.pancreatic_center_volume_metrics
for select
to anon, authenticated
using (true);

create policy "service role manages pancreatic center snapshots"
on public.pancreatic_center_snapshots
for all
to service_role
using (true)
with check (true);

create policy "service role manages pancreatic snapshot centers"
on public.pancreatic_center_snapshot_centers
for all
to service_role
using (true)
with check (true);

create policy "service role manages pancreatic center sources"
on public.pancreatic_center_snapshot_sources
for all
to service_role
using (true)
with check (true);

create policy "service role manages pancreatic center metrics"
on public.pancreatic_center_volume_metrics
for all
to service_role
using (true)
with check (true);
