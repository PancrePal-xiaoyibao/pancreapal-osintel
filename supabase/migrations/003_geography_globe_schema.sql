-- pposintel geography and 3D globe schema.

create type public.geo_entity_type as enum (
  'global',
  'country',
  'city',
  'center'
);

create type public.geo_data_quality as enum (
  'public',
  'estimated',
  'mixed',
  'unverified'
);

create type public.map_layer_type as enum (
  'treatment_centers',
  'academic_activity',
  'news_hotspots',
  'patient_pulse',
  'complication_support',
  'trial_activity',
  'policy_breakthrough'
);

create table public.geo_countries (
  id uuid primary key default gen_random_uuid(),
  country_key text not null unique,
  name text not null,
  iso2 text,
  iso3 text,
  region text not null,
  latitude numeric(9,6) not null,
  longitude numeric(9,6) not null,
  summary text,
  data_quality public.geo_data_quality not null default 'unverified',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.geo_cities (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.geo_countries(id) on delete cascade,
  city_key text not null unique,
  name text not null,
  local_name text,
  tier text,
  latitude numeric(9,6) not null,
  longitude numeric(9,6) not null,
  summary text,
  data_quality public.geo_data_quality not null default 'unverified',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.treatment_centers (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.geo_countries(id) on delete restrict,
  city_id uuid references public.geo_cities(id) on delete set null,
  center_key text not null unique,
  name text not null,
  local_name text,
  institution_type text,
  official_url text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  specialties text[] not null default '{}'::text[],
  capability_tags text[] not null default '{}'::text[],
  complication_support_tags text[] not null default '{}'::text[],
  mdt_available boolean,
  clinical_trial_available boolean,
  surgery_volume_estimate integer check (surgery_volume_estimate is null or surgery_volume_estimate >= 0),
  patient_volume_estimate integer check (patient_volume_estimate is null or patient_volume_estimate >= 0),
  data_quality public.geo_data_quality not null default 'unverified',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.geo_score_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_key text not null unique,
  entity_type public.geo_entity_type not null,
  country_id uuid references public.geo_countries(id) on delete cascade,
  city_id uuid references public.geo_cities(id) on delete cascade,
  treatment_center_id uuid references public.treatment_centers(id) on delete cascade,
  score_date date not null default current_date,
  treatment_capability_score numeric(5,2) check (treatment_capability_score is null or (treatment_capability_score >= 0 and treatment_capability_score <= 100)),
  academic_score numeric(5,2) check (academic_score is null or (academic_score >= 0 and academic_score <= 100)),
  patient_score numeric(5,2) check (patient_score is null or (patient_score >= 0 and patient_score <= 100)),
  policy_score numeric(5,2) check (policy_score is null or (policy_score >= 0 and policy_score <= 100)),
  complication_support_score numeric(5,2) check (complication_support_score is null or (complication_support_score >= 0 and complication_support_score <= 100)),
  trial_score numeric(5,2) check (trial_score is null or (trial_score >= 0 and trial_score <= 100)),
  data_quality public.geo_data_quality not null default 'unverified',
  drivers jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint geo_score_single_entity check (
    (entity_type = 'global' and country_id is null and city_id is null and treatment_center_id is null)
    or (entity_type = 'country' and country_id is not null and city_id is null and treatment_center_id is null)
    or (entity_type = 'city' and country_id is not null and city_id is not null and treatment_center_id is null)
    or (entity_type = 'center' and country_id is not null and treatment_center_id is not null)
  )
);

create table public.map_layer_snapshots (
  id uuid primary key default gen_random_uuid(),
  layer_key text not null unique,
  layer_type public.map_layer_type not null,
  entity_type public.geo_entity_type not null,
  country_id uuid references public.geo_countries(id) on delete cascade,
  city_id uuid references public.geo_cities(id) on delete cascade,
  treatment_center_id uuid references public.treatment_centers(id) on delete cascade,
  label text not null,
  latitude numeric(9,6) not null,
  longitude numeric(9,6) not null,
  intensity numeric(5,2) not null default 0 check (intensity >= 0 and intensity <= 100),
  radius numeric(10,2),
  color_token text,
  time_window text not null default '30d',
  snapshot_date date not null default current_date,
  tooltip jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.intelligence_events
  add column country_id uuid references public.geo_countries(id) on delete set null,
  add column city_id uuid references public.geo_cities(id) on delete set null,
  add column treatment_center_id uuid references public.treatment_centers(id) on delete set null,
  add column event_type text;

alter table public.trials
  add column country_id uuid references public.geo_countries(id) on delete set null,
  add column city_id uuid references public.geo_cities(id) on delete set null,
  add column treatment_center_id uuid references public.treatment_centers(id) on delete set null;

alter table public.doctor_centers
  add column country_id uuid references public.geo_countries(id) on delete set null,
  add column city_id uuid references public.geo_cities(id) on delete set null,
  add column treatment_center_id uuid references public.treatment_centers(id) on delete set null,
  add column latitude numeric(9,6),
  add column longitude numeric(9,6),
  add column data_quality public.geo_data_quality not null default 'unverified';

create index geo_countries_region_idx on public.geo_countries (region);
create index geo_cities_country_id_idx on public.geo_cities (country_id);
create index treatment_centers_country_id_idx on public.treatment_centers (country_id);
create index treatment_centers_city_id_idx on public.treatment_centers (city_id);
create index treatment_centers_capability_tags_gin_idx on public.treatment_centers using gin (capability_tags);
create index treatment_centers_complication_tags_gin_idx on public.treatment_centers using gin (complication_support_tags);
create index geo_score_country_city_date_idx on public.geo_score_snapshots (country_id, city_id, score_date desc);
create index geo_score_entity_date_idx on public.geo_score_snapshots (entity_type, score_date desc);
create index map_layer_type_date_idx on public.map_layer_snapshots (layer_type, snapshot_date desc);
create index map_layer_geo_idx on public.map_layer_snapshots (country_id, city_id, treatment_center_id);
create index intelligence_events_geo_idx on public.intelligence_events (country_id, city_id, treatment_center_id);
create index trials_geo_idx on public.trials (country_id, city_id, treatment_center_id);
create index doctor_centers_geo_idx on public.doctor_centers (country_id, city_id, treatment_center_id);

create trigger geo_countries_set_updated_at
before update on public.geo_countries
for each row execute function public.set_updated_at();

create trigger geo_cities_set_updated_at
before update on public.geo_cities
for each row execute function public.set_updated_at();

create trigger treatment_centers_set_updated_at
before update on public.treatment_centers
for each row execute function public.set_updated_at();

alter table public.geo_countries enable row level security;
alter table public.geo_cities enable row level security;
alter table public.treatment_centers enable row level security;
alter table public.geo_score_snapshots enable row level security;
alter table public.map_layer_snapshots enable row level security;

create policy "public can read countries"
on public.geo_countries
for select
to anon, authenticated
using (true);

create policy "public can read cities"
on public.geo_cities
for select
to anon, authenticated
using (true);

create policy "public can read treatment centers"
on public.treatment_centers
for select
to anon, authenticated
using (true);

create policy "public can read geo scores"
on public.geo_score_snapshots
for select
to anon, authenticated
using (true);

create policy "public can read map layers"
on public.map_layer_snapshots
for select
to anon, authenticated
using (true);

create policy "service role manages countries"
on public.geo_countries
for all
to service_role
using (true)
with check (true);

create policy "service role manages cities"
on public.geo_cities
for all
to service_role
using (true)
with check (true);

create policy "service role manages treatment centers"
on public.treatment_centers
for all
to service_role
using (true)
with check (true);

create policy "service role manages geo scores"
on public.geo_score_snapshots
for all
to service_role
using (true)
with check (true);

create policy "service role manages map layers"
on public.map_layer_snapshots
for all
to service_role
using (true)
with check (true);
