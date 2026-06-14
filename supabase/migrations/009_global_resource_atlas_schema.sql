-- Global resource atlas read model.
-- Extends the geography schema from country/city/center into
-- Global -> Region -> Country -> City -> Center -> Latest Intelligence.

create table if not exists public.geo_regions (
  region_key text primary key,
  name text not null,
  display_order integer not null default 0,
  summary text,
  coverage_status text not null default 'seed'
    check (coverage_status in ('seed', 'partial', 'verified', 'stale', 'unknown')),
  data_quality public.geo_data_quality not null default 'mixed',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.geo_countries
  add column if not exists region_key text references public.geo_regions(region_key) on delete set null;

create table if not exists public.center_latest_intelligence (
  id uuid primary key default gen_random_uuid(),
  treatment_center_id uuid not null references public.treatment_centers(id) on delete cascade,
  region_key text references public.geo_regions(region_key) on delete set null,
  country_id uuid references public.geo_countries(id) on delete set null,
  city_id uuid references public.geo_cities(id) on delete set null,
  intelligence_event_id uuid not null references public.intelligence_events(id) on delete cascade,
  event_scope text not null
    check (event_scope in ('global', 'region', 'country', 'city', 'center', 'department', 'trial', 'drug')),
  relevance_note text,
  created_at timestamptz not null default now(),
  unique (treatment_center_id, intelligence_event_id, event_scope)
);

create table if not exists public.coverage_quality_snapshots (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null
    check (entity_type in ('global', 'region', 'country', 'city', 'center')),
  entity_key text not null,
  snapshot_date date not null default current_date,
  coverage_status text not null
    check (coverage_status in ('seed', 'partial', 'verified', 'stale', 'unknown')),
  source_count integer not null default 0 check (source_count >= 0),
  verified_source_count integer not null default 0 check (verified_source_count >= 0),
  metric_conflict_count integer not null default 0 check (metric_conflict_count >= 0),
  latest_intel_at timestamptz,
  last_verified_at timestamptz,
  data_quality public.geo_data_quality not null default 'mixed',
  metadata jsonb not null default '{}'::jsonb,
  unique (entity_type, entity_key, snapshot_date),
  constraint coverage_quality_verified_source_count_check check (verified_source_count <= source_count)
);

create index if not exists geo_regions_display_order_idx
on public.geo_regions (display_order, region_key);

create index if not exists geo_regions_coverage_status_idx
on public.geo_regions (coverage_status);

create index if not exists geo_countries_region_key_idx
on public.geo_countries (region_key);

create index if not exists center_latest_intelligence_center_idx
on public.center_latest_intelligence (treatment_center_id, created_at desc);

create index if not exists center_latest_intelligence_region_idx
on public.center_latest_intelligence (region_key, created_at desc);

create index if not exists center_latest_intelligence_country_city_idx
on public.center_latest_intelligence (country_id, city_id, created_at desc);

create index if not exists center_latest_intelligence_event_idx
on public.center_latest_intelligence (intelligence_event_id);

create index if not exists coverage_quality_snapshots_entity_date_idx
on public.coverage_quality_snapshots (entity_type, entity_key, snapshot_date desc);

create index if not exists coverage_quality_snapshots_status_idx
on public.coverage_quality_snapshots (coverage_status, snapshot_date desc);

create index if not exists coverage_quality_snapshots_quality_idx
on public.coverage_quality_snapshots (data_quality, snapshot_date desc);

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'geo_regions_set_updated_at'
  ) then
    create trigger geo_regions_set_updated_at
    before update on public.geo_regions
    for each row execute function public.set_updated_at();
  end if;
end;
$$;

alter table public.geo_regions enable row level security;
alter table public.center_latest_intelligence enable row level security;
alter table public.coverage_quality_snapshots enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'geo_regions'
      and policyname = 'public can read geo regions'
  ) then
    create policy "public can read geo regions"
    on public.geo_regions
    for select
    to anon, authenticated
    using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'center_latest_intelligence'
      and policyname = 'public can read center latest intelligence'
  ) then
    create policy "public can read center latest intelligence"
    on public.center_latest_intelligence
    for select
    to anon, authenticated
    using (
      exists (
        select 1
        from public.intelligence_events events
        where events.id = center_latest_intelligence.intelligence_event_id
          and events.review_status = 'approved'
      )
    );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'coverage_quality_snapshots'
      and policyname = 'public can read coverage quality snapshots'
  ) then
    create policy "public can read coverage quality snapshots"
    on public.coverage_quality_snapshots
    for select
    to anon, authenticated
    using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'geo_regions'
      and policyname = 'service role manages geo regions'
  ) then
    create policy "service role manages geo regions"
    on public.geo_regions
    for all
    to service_role
    using (true)
    with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'center_latest_intelligence'
      and policyname = 'service role manages center latest intelligence'
  ) then
    create policy "service role manages center latest intelligence"
    on public.center_latest_intelligence
    for all
    to service_role
    using (true)
    with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'coverage_quality_snapshots'
      and policyname = 'service role manages coverage quality snapshots'
  ) then
    create policy "service role manages coverage quality snapshots"
    on public.coverage_quality_snapshots
    for all
    to service_role
    using (true)
    with check (true);
  end if;
end;
$$;
