-- Advisor fixes after quick demo deployment.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create index if not exists doctor_centers_city_id_idx
on public.doctor_centers (city_id);

create index if not exists doctor_centers_treatment_center_id_idx
on public.doctor_centers (treatment_center_id);

create index if not exists geo_score_snapshots_city_id_idx
on public.geo_score_snapshots (city_id);

create index if not exists geo_score_snapshots_treatment_center_id_idx
on public.geo_score_snapshots (treatment_center_id);

create index if not exists intelligence_events_city_id_idx
on public.intelligence_events (city_id);

create index if not exists intelligence_events_treatment_center_id_idx
on public.intelligence_events (treatment_center_id);

create index if not exists map_layer_snapshots_city_id_idx
on public.map_layer_snapshots (city_id);

create index if not exists map_layer_snapshots_treatment_center_id_idx
on public.map_layer_snapshots (treatment_center_id);

create index if not exists reports_created_by_idx
on public.reports (created_by);

create index if not exists review_tasks_created_by_idx
on public.review_tasks (created_by);

create index if not exists trials_city_id_idx
on public.trials (city_id);

create index if not exists trials_treatment_center_id_idx
on public.trials (treatment_center_id);

