-- pposintel 3D globe geography demo seed data.

insert into public.geo_countries (
  country_key,
  name,
  iso2,
  iso3,
  region,
  latitude,
  longitude,
  summary,
  data_quality
) values
  (
    'china',
    'China',
    'CN',
    'CHN',
    'Asia',
    35.861660,
    104.195397,
    'MVP priority country for pancreatic treatment center intelligence and patient support demand mapping.',
    'mixed'
  ),
  (
    'united_states',
    'United States',
    'US',
    'USA',
    'Americas',
    37.090240,
    -95.712891,
    'High-priority country for guidelines, trials, regulatory updates, and oncology meeting signals.',
    'mixed'
  )
on conflict (country_key) do update set
  summary = excluded.summary,
  updated_at = now();

insert into public.geo_cities (
  country_id,
  city_key,
  name,
  local_name,
  tier,
  latitude,
  longitude,
  summary,
  data_quality
) values
  ((select id from public.geo_countries where country_key = 'china'), 'shanghai', 'Shanghai', '上海', 'mvp_priority', 31.230416, 121.473701, 'MVP city node for pancreatic oncology centers, academic activity, trials, and complication support.', 'mixed'),
  ((select id from public.geo_countries where country_key = 'china'), 'beijing', 'Beijing', '北京', 'mvp_priority', 39.904202, 116.407394, 'MVP city node for national oncology resources and clinical research.', 'mixed'),
  ((select id from public.geo_countries where country_key = 'china'), 'guangzhou', 'Guangzhou', '广州', 'mvp_priority', 23.129110, 113.264381, 'MVP city node for South China pancreatic treatment and research signals.', 'mixed'),
  ((select id from public.geo_countries where country_key = 'china'), 'chengdu', 'Chengdu', '成都', 'mvp_priority', 30.572815, 104.066801, 'MVP city node for West China pancreatic care and patient access signals.', 'mixed'),
  ((select id from public.geo_countries where country_key = 'china'), 'wuhan', 'Wuhan', '武汉', 'mvp_priority', 30.592850, 114.305542, 'MVP city node for Central China pancreatic treatment ecosystem signals.', 'mixed'),
  ((select id from public.geo_countries where country_key = 'china'), 'jinan', 'Jinan', '济南', 'mvp_priority', 36.651216, 117.120095, 'MVP city node for Shandong pancreatic treatment ecosystem signals.', 'mixed')
on conflict (city_key) do update set
  summary = excluded.summary,
  updated_at = now();

insert into public.treatment_centers (
  country_id,
  city_id,
  center_key,
  name,
  local_name,
  institution_type,
  official_url,
  latitude,
  longitude,
  specialties,
  capability_tags,
  complication_support_tags,
  mdt_available,
  clinical_trial_available,
  data_quality,
  notes
) values
  (
    (select id from public.geo_countries where country_key = 'china'),
    (select id from public.geo_cities where city_key = 'shanghai'),
    'fudan_cancer_center_demo',
    'Fudan University Shanghai Cancer Center',
    '复旦大学附属肿瘤医院',
    'cancer_center',
    'https://www.shca.org.cn/',
    31.196000,
    121.449000,
    array['pancreatic oncology', 'surgery', 'medical oncology', 'radiotherapy'],
    array['MDT', 'clinical research', 'oncology specialty'],
    array['biliary obstruction', 'pain management', 'nutrition support'],
    true,
    true,
    'mixed',
    'Demo center record. Capability labels require source verification before public use.'
  ),
  (
    (select id from public.geo_countries where country_key = 'china'),
    (select id from public.geo_cities where city_key = 'shanghai'),
    'ruijin_hospital_demo',
    'Ruijin Hospital',
    '上海交通大学医学院附属瑞金医院',
    'general_hospital',
    'https://www.rjh.com.cn/',
    31.209000,
    121.466000,
    array['pancreatic surgery', 'gastroenterology', 'critical care'],
    array['MDT', 'surgery', 'complex complications'],
    array['bleeding', 'infection', 'biliary obstruction', 'ICU support'],
    true,
    true,
    'mixed',
    'Demo center record. Capability labels require source verification before public use.'
  ),
  (
    (select id from public.geo_countries where country_key = 'china'),
    (select id from public.geo_cities where city_key = 'beijing'),
    'peking_university_cancer_hospital_demo',
    'Peking University Cancer Hospital',
    '北京大学肿瘤医院',
    'cancer_center',
    'https://www.bjcancer.org/',
    39.931000,
    116.307000,
    array['medical oncology', 'surgery', 'clinical trials'],
    array['oncology specialty', 'clinical research'],
    array['nutrition support', 'pain management'],
    true,
    true,
    'mixed',
    'Demo center record. Capability labels require source verification before public use.'
  )
on conflict (center_key) do update set
  notes = excluded.notes,
  updated_at = now();

update public.intelligence_events
set
  country_id = (select id from public.geo_countries where country_key = 'united_states'),
  event_type = 'conference'
where event_key = 'evt_20260613_ras_on_demo';

insert into public.geo_score_snapshots (
  snapshot_key,
  entity_type,
  country_id,
  city_id,
  treatment_center_id,
  score_date,
  treatment_capability_score,
  academic_score,
  patient_score,
  policy_score,
  complication_support_score,
  trial_score,
  data_quality,
  drivers
) values
  ('geo_score_china_20260613', 'country', (select id from public.geo_countries where country_key = 'china'), null, null, '2026-06-13', 74, 68, 82, 61, 70, 66, 'mixed', '[{"driver": "MVP China node with six priority cities", "weight": "high"}]'::jsonb),
  ('geo_score_shanghai_20260613', 'city', (select id from public.geo_countries where country_key = 'china'), (select id from public.geo_cities where city_key = 'shanghai'), null, '2026-06-13', 83, 79, 86, 65, 78, 74, 'mixed', '[{"driver": "Demo center density and academic signal", "weight": "high"}]'::jsonb),
  ('geo_score_beijing_20260613', 'city', (select id from public.geo_countries where country_key = 'china'), (select id from public.geo_cities where city_key = 'beijing'), null, '2026-06-13', 81, 82, 78, 70, 73, 76, 'mixed', '[{"driver": "National oncology resource concentration", "weight": "high"}]'::jsonb),
  ('geo_score_fudan_demo_20260613', 'center', (select id from public.geo_countries where country_key = 'china'), (select id from public.geo_cities where city_key = 'shanghai'), (select id from public.treatment_centers where center_key = 'fudan_cancer_center_demo'), '2026-06-13', 82, 80, 76, null, 70, 75, 'mixed', '[{"driver": "Demo specialty center capability labels", "weight": "medium"}]'::jsonb)
on conflict (snapshot_key) do update set
  treatment_capability_score = excluded.treatment_capability_score,
  academic_score = excluded.academic_score,
  patient_score = excluded.patient_score,
  policy_score = excluded.policy_score,
  complication_support_score = excluded.complication_support_score,
  trial_score = excluded.trial_score,
  drivers = excluded.drivers;

insert into public.map_layer_snapshots (
  layer_key,
  layer_type,
  entity_type,
  country_id,
  city_id,
  treatment_center_id,
  label,
  latitude,
  longitude,
  intensity,
  radius,
  color_token,
  time_window,
  snapshot_date,
  tooltip
) values
  ('layer_shanghai_centers_20260613', 'treatment_centers', 'city', (select id from public.geo_countries where country_key = 'china'), (select id from public.geo_cities where city_key = 'shanghai'), null, 'Shanghai treatment center cluster', 31.230416, 121.473701, 86, 18, 'cyan', '30d', '2026-06-13', '{"centers": 2, "focus": "MVP city cluster"}'::jsonb),
  ('layer_beijing_academic_20260613', 'academic_activity', 'city', (select id from public.geo_countries where country_key = 'china'), (select id from public.geo_cities where city_key = 'beijing'), null, 'Beijing academic activity', 39.904202, 116.407394, 82, 16, 'blue', '30d', '2026-06-13', '{"focus": "academic and national oncology signals"}'::jsonb),
  ('layer_ruijin_complication_20260613', 'complication_support', 'center', (select id from public.geo_countries where country_key = 'china'), (select id from public.geo_cities where city_key = 'shanghai'), (select id from public.treatment_centers where center_key = 'ruijin_hospital_demo'), 'Ruijin complication support demo', 31.209000, 121.466000, 78, 10, 'amber', '30d', '2026-06-13', '{"tags": ["bleeding", "infection", "ICU support"]}'::jsonb),
  ('layer_us_trial_20260613', 'trial_activity', 'country', (select id from public.geo_countries where country_key = 'united_states'), null, null, 'US trial and conference signal', 37.090240, -95.712891, 74, 22, 'green', '30d', '2026-06-13', '{"focus": "trial registry, meeting, and regulatory signals"}'::jsonb)
on conflict (layer_key) do update set
  intensity = excluded.intensity,
  radius = excluded.radius,
  tooltip = excluded.tooltip;
