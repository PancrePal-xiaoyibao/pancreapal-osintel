-- pposintel quick demo core schema for Supabase Postgres.

create extension if not exists pgcrypto;
create extension if not exists vector with schema extensions;

create type public.source_type as enum (
  'guideline',
  'trial_registry',
  'meeting',
  'paper',
  'regulator',
  'company_news',
  'hospital_news',
  'wechat_public',
  'video',
  'patient_community',
  'manual'
);

create type public.collection_method as enum (
  'api',
  'rss',
  'crawl',
  'manual',
  'mcp',
  'search'
);

create type public.authority_level as enum (
  'high',
  'medium',
  'low',
  'unknown'
);

create type public.source_status as enum (
  'candidate',
  'active',
  'paused',
  'blocked'
);

create type public.evidence_level as enum (
  'guideline_update',
  'regulatory_action',
  'phase_3_positive',
  'phase_2_signal',
  'early_research',
  'trial_status_change',
  'expert_education',
  'patient_signal',
  'unknown'
);

create type public.patient_relevance as enum (
  'high',
  'medium',
  'low',
  'unknown'
);

create type public.review_status as enum (
  'raw',
  'parsed',
  'machine_reviewed',
  'needs_human_review',
  'approved',
  'rejected'
);

create type public.risk_level as enum (
  'low',
  'medium',
  'medium_high',
  'high',
  'critical',
  'unknown'
);

create type public.report_type as enum (
  'daily_brief',
  'weekly_trend',
  'topic_report',
  'patient_consultation',
  'social_content'
);

create type public.report_status as enum (
  'draft',
  'needs_human_review',
  'approved',
  'published',
  'archived'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  name text not null,
  source_type public.source_type not null,
  url text not null,
  region text not null,
  authority_level public.authority_level not null default 'unknown',
  collection_method public.collection_method not null default 'manual',
  update_cadence text,
  copyright_notes text,
  privacy_notes text,
  status public.source_status not null default 'candidate',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.raw_documents (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.sources(id) on delete set null,
  url text not null,
  title text,
  content_hash text,
  content_type text,
  language text,
  observed_at timestamptz not null default now(),
  published_at date,
  excerpt text,
  storage_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (url, content_hash)
);

create table public.intelligence_events (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  source_id uuid references public.sources(id) on delete set null,
  raw_document_id uuid references public.raw_documents(id) on delete set null,
  title text not null,
  source_type public.source_type not null,
  region text not null,
  disease text,
  disease_stage text,
  topics text[] not null default '{}'::text[],
  evidence_level public.evidence_level not null default 'unknown',
  impact_score numeric(5,2) check (impact_score is null or (impact_score >= 0 and impact_score <= 100)),
  patient_relevance public.patient_relevance not null default 'unknown',
  summary_professional text,
  summary_patient text,
  potential_value text,
  potential_risk text,
  doctor_consultation_ready boolean not null default false,
  uncertainty text,
  review_status public.review_status not null default 'raw',
  risk_level public.risk_level not null default 'unknown',
  metrics jsonb not null default '{}'::jsonb,
  entities jsonb not null default '{}'::jsonb,
  embedding extensions.vector(1536),
  observed_at timestamptz not null default now(),
  published_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_entities (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.intelligence_events(id) on delete cascade,
  entity_type text not null,
  entity_name text not null,
  entity_key text,
  confidence_score numeric(4,3) check (confidence_score is null or (confidence_score >= 0 and confidence_score <= 1)),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (event_id, entity_type, entity_name)
);

create table public.drugs (
  id uuid primary key default gen_random_uuid(),
  drug_key text not null unique,
  name text not null,
  company text,
  drug_class text,
  targets text[] not null default '{}'::text[],
  diseases text[] not null default '{}'::text[],
  development_stage text,
  latest_signal text,
  key_data jsonb not null default '{}'::jsonb,
  combination_strategies text[] not null default '{}'::text[],
  risk_notes text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.trials (
  id uuid primary key default gen_random_uuid(),
  trial_key text not null unique,
  registry text not null,
  registry_id text not null,
  title text not null,
  status text,
  phase text,
  region text,
  countries text[] not null default '{}'::text[],
  diseases text[] not null default '{}'::text[],
  interventions text[] not null default '{}'::text[],
  targets text[] not null default '{}'::text[],
  eligibility_summary text,
  patient_access_notes text,
  source_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (registry, registry_id)
);

create table public.doctor_centers (
  id uuid primary key default gen_random_uuid(),
  center_key text not null unique,
  display_name text not null,
  hospital text,
  region text,
  country text,
  specialties text[] not null default '{}'::text[],
  signal_counts jsonb not null default '{}'::jsonb,
  strength_tags text[] not null default '{}'::text[],
  risk_flags text[] not null default '{}'::text[],
  notes text,
  last_updated date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.review_tasks (
  id uuid primary key default gen_random_uuid(),
  task_key text not null unique,
  event_id uuid references public.intelligence_events(id) on delete cascade,
  title text not null,
  input_type text not null default 'event',
  input_content text,
  disease text,
  disease_stage text,
  drug text,
  target text,
  requested_angles text[] not null default '{}'::text[],
  status public.review_status not null default 'raw',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.model_reviews (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.review_tasks(id) on delete cascade,
  model_name text not null,
  core_judgment text,
  confidence_score numeric(4,2) check (confidence_score is null or (confidence_score >= 0 and confidence_score <= 10)),
  evidence_score numeric(4,2) check (evidence_score is null or (evidence_score >= 0 and evidence_score <= 10)),
  patient_relevance_score numeric(4,2) check (patient_relevance_score is null or (patient_relevance_score >= 0 and patient_relevance_score <= 10)),
  risk_level public.risk_level not null default 'unknown',
  reasoning jsonb not null default '[]'::jsonb,
  uncertainties jsonb not null default '[]'::jsonb,
  needs_human_review boolean not null default true,
  recommended_action text,
  raw_output jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (task_id, model_name)
);

create table public.consensus_reports (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null unique references public.review_tasks(id) on delete cascade,
  consensus_score numeric(4,2) check (consensus_score is null or (consensus_score >= 0 and consensus_score <= 10)),
  final_judgment text,
  agreement_points text[] not null default '{}'::text[],
  disagreement_points text[] not null default '{}'::text[],
  evidence_score_final numeric(4,2) check (evidence_score_final is null or (evidence_score_final >= 0 and evidence_score_final <= 10)),
  patient_relevance_final numeric(4,2) check (patient_relevance_final is null or (patient_relevance_final >= 0 and patient_relevance_final <= 10)),
  risk_level_final public.risk_level not null default 'unknown',
  tags text[] not null default '{}'::text[],
  human_review_required boolean not null default true,
  publish_recommendation text,
  patient_explanation text,
  doctor_review_questions text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  report_key text not null unique,
  report_type public.report_type not null,
  title text not null,
  report_date date not null default current_date,
  status public.report_status not null default 'draft',
  body_markdown text,
  event_ids uuid[] not null default '{}'::uuid[],
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.index_scores (
  id uuid primary key default gen_random_uuid(),
  index_code text not null,
  score_date date not null default current_date,
  score numeric(5,2) not null check (score >= 0 and score <= 100),
  trend_delta numeric(6,2),
  drivers jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (index_code, score_date)
);

create index sources_type_status_idx on public.sources (source_type, status);
create index sources_region_idx on public.sources (region);

create index raw_documents_source_id_idx on public.raw_documents (source_id);
create index raw_documents_observed_at_idx on public.raw_documents (observed_at desc);
create index raw_documents_published_at_idx on public.raw_documents (published_at desc);

create index intelligence_events_source_id_idx on public.intelligence_events (source_id);
create index intelligence_events_raw_document_id_idx on public.intelligence_events (raw_document_id);
create index intelligence_events_review_status_idx on public.intelligence_events (review_status);
create index intelligence_events_evidence_level_idx on public.intelligence_events (evidence_level);
create index intelligence_events_region_published_idx on public.intelligence_events (region, published_at desc);
create index intelligence_events_topics_gin_idx on public.intelligence_events using gin (topics);
create index intelligence_events_entities_gin_idx on public.intelligence_events using gin (entities);
create index intelligence_events_metrics_gin_idx on public.intelligence_events using gin (metrics);

create index event_entities_event_id_idx on public.event_entities (event_id);
create index event_entities_type_name_idx on public.event_entities (entity_type, entity_name);

create index drugs_targets_gin_idx on public.drugs using gin (targets);
create index trials_registry_id_idx on public.trials (registry, registry_id);
create index doctor_centers_region_idx on public.doctor_centers (region);

create index review_tasks_event_id_idx on public.review_tasks (event_id);
create index review_tasks_status_idx on public.review_tasks (status);
create index model_reviews_task_id_idx on public.model_reviews (task_id);
create index consensus_reports_risk_idx on public.consensus_reports (risk_level_final);
create index consensus_reports_tags_gin_idx on public.consensus_reports using gin (tags);

create index reports_type_date_idx on public.reports (report_type, report_date desc);
create index index_scores_code_date_idx on public.index_scores (index_code, score_date desc);

create trigger sources_set_updated_at
before update on public.sources
for each row execute function public.set_updated_at();

create trigger raw_documents_set_updated_at
before update on public.raw_documents
for each row execute function public.set_updated_at();

create trigger intelligence_events_set_updated_at
before update on public.intelligence_events
for each row execute function public.set_updated_at();

create trigger drugs_set_updated_at
before update on public.drugs
for each row execute function public.set_updated_at();

create trigger trials_set_updated_at
before update on public.trials
for each row execute function public.set_updated_at();

create trigger doctor_centers_set_updated_at
before update on public.doctor_centers
for each row execute function public.set_updated_at();

create trigger review_tasks_set_updated_at
before update on public.review_tasks
for each row execute function public.set_updated_at();

create trigger consensus_reports_set_updated_at
before update on public.consensus_reports
for each row execute function public.set_updated_at();

create trigger reports_set_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

alter table public.sources enable row level security;
alter table public.raw_documents enable row level security;
alter table public.intelligence_events enable row level security;
alter table public.event_entities enable row level security;
alter table public.drugs enable row level security;
alter table public.trials enable row level security;
alter table public.doctor_centers enable row level security;
alter table public.review_tasks enable row level security;
alter table public.model_reviews enable row level security;
alter table public.consensus_reports enable row level security;
alter table public.reports enable row level security;
alter table public.index_scores enable row level security;

create policy "public can read active sources"
on public.sources
for select
to anon, authenticated
using (status = 'active');

create policy "public can read approved events"
on public.intelligence_events
for select
to anon, authenticated
using (review_status = 'approved');

create policy "public can read public drugs"
on public.drugs
for select
to anon, authenticated
using (true);

create policy "public can read public trials"
on public.trials
for select
to anon, authenticated
using (true);

create policy "public can read published reports"
on public.reports
for select
to anon, authenticated
using (status = 'published');

create policy "public can read index scores"
on public.index_scores
for select
to anon, authenticated
using (true);

create policy "authenticated can read review tasks"
on public.review_tasks
for select
to authenticated
using (true);

create policy "authenticated can read model reviews"
on public.model_reviews
for select
to authenticated
using (true);

create policy "authenticated can read consensus reports"
on public.consensus_reports
for select
to authenticated
using (true);

create policy "service role manages sources"
on public.sources
for all
to service_role
using (true)
with check (true);

create policy "service role manages raw documents"
on public.raw_documents
for all
to service_role
using (true)
with check (true);

create policy "service role manages intelligence events"
on public.intelligence_events
for all
to service_role
using (true)
with check (true);

create policy "service role manages event entities"
on public.event_entities
for all
to service_role
using (true)
with check (true);

create policy "service role manages drugs"
on public.drugs
for all
to service_role
using (true)
with check (true);

create policy "service role manages trials"
on public.trials
for all
to service_role
using (true)
with check (true);

create policy "service role manages doctor centers"
on public.doctor_centers
for all
to service_role
using (true)
with check (true);

create policy "service role manages review tasks"
on public.review_tasks
for all
to service_role
using (true)
with check (true);

create policy "service role manages model reviews"
on public.model_reviews
for all
to service_role
using (true)
with check (true);

create policy "service role manages consensus reports"
on public.consensus_reports
for all
to service_role
using (true)
with check (true);

create policy "service role manages reports"
on public.reports
for all
to service_role
using (true)
with check (true);

create policy "service role manages index scores"
on public.index_scores
for all
to service_role
using (true)
with check (true);
