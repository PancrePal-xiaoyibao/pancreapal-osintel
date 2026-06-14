-- pposintel quick demo seed data.

insert into public.sources (
  source_key,
  name,
  source_type,
  url,
  region,
  authority_level,
  collection_method,
  update_cadence,
  copyright_notes,
  status
) values
  (
    'clinicaltrials_gov',
    'ClinicalTrials.gov',
    'trial_registry',
    'https://clinicaltrials.gov/',
    'US',
    'high',
    'api',
    'daily',
    'Use metadata and links; do not imply eligibility without review.',
    'active'
  ),
  (
    'pubmed',
    'PubMed',
    'paper',
    'https://pubmed.ncbi.nlm.nih.gov/',
    'Global',
    'high',
    'api',
    'daily',
    'Use metadata, abstracts when permitted, and source links.',
    'active'
  ),
  (
    'asco',
    'ASCO',
    'meeting',
    'https://www.asco.org/abstracts',
    'US',
    'high',
    'crawl',
    'weekly',
    'Meeting content may have copyright restrictions; store summaries and links.',
    'active'
  ),
  (
    'esmo',
    'ESMO',
    'guideline',
    'https://www.esmo.org/guidelines',
    'Europe',
    'high',
    'crawl',
    'weekly',
    'Do not redistribute guideline full text.',
    'active'
  ),
  (
    'fda',
    'FDA',
    'regulator',
    'https://www.fda.gov/drugs',
    'US',
    'high',
    'crawl',
    'daily',
    'Regulatory public information.',
    'active'
  )
on conflict (source_key) do update set
  status = excluded.status,
  updated_at = now();

insert into public.drugs (
  drug_key,
  name,
  company,
  drug_class,
  targets,
  diseases,
  development_stage,
  latest_signal,
  key_data,
  combination_strategies,
  risk_notes
) values
  (
    'rmc_6236',
    'RMC-6236',
    'Revolution Medicines',
    'RAS(ON) multi-selective inhibitor',
    array['KRAS', 'NRAS', 'HRAS'],
    array['PDAC', 'NSCLC', 'CRC'],
    'Phase I/II',
    'High-priority RAS pathway signal for pancreatic cancer tracking.',
    '{"orr": null, "dcr": null, "mpfs": null, "mos": null}'::jsonb,
    array['SHP2', 'MEK', 'EGFR', 'chemotherapy'],
    array['Evidence maturity requires review', 'Toxicity and resistance mechanisms need tracking']
  )
on conflict (drug_key) do update set
  latest_signal = excluded.latest_signal,
  updated_at = now();

insert into public.intelligence_events (
  event_key,
  source_id,
  title,
  source_type,
  region,
  disease,
  disease_stage,
  topics,
  evidence_level,
  impact_score,
  patient_relevance,
  summary_professional,
  summary_patient,
  potential_value,
  potential_risk,
  doctor_consultation_ready,
  uncertainty,
  review_status,
  risk_level,
  metrics,
  entities,
  published_at
) values (
  'evt_20260613_ras_on_demo',
  (select id from public.sources where source_key = 'asco'),
  'Demo: RAS(ON) pathway signal in pancreatic cancer needs AI-MDT review',
  'meeting',
  'US',
  'pancreatic ductal adenocarcinoma',
  'advanced or metastatic',
  array['KRAS', 'RAS(ON)', 'clinical data', 'conference signal'],
  'early_research',
  78,
  'high',
  'A conference-level signal suggests potential activity in a high-priority pancreatic cancer pathway, but evidence maturity and patient selection need review.',
  '这是一条值得关注的早期信号，但还不能理解为已经改变标准治疗。更适合作为问医生和跟踪临床试验的问题。',
  'May help prioritize RAS pathway tracking and trial opportunity review.',
  'Early data can be overinterpreted if sample size, line of therapy, and toxicity are unclear.',
  true,
  'Demo event only. Requires source verification and human review before publication.',
  'needs_human_review',
  'medium_high',
  '{"sample_size": null, "phase": "early clinical", "orr": null, "mpfs": null, "mos": null}'::jsonb,
  '{"drugs": ["RMC-6236"], "targets": ["KRAS", "RAS"], "companies": ["Revolution Medicines"]}'::jsonb,
  '2026-06-13'
)
on conflict (event_key) do update set
  review_status = excluded.review_status,
  updated_at = now();

insert into public.event_entities (
  event_id,
  entity_type,
  entity_name,
  entity_key,
  confidence_score
) values
  (
    (select id from public.intelligence_events where event_key = 'evt_20260613_ras_on_demo'),
    'drug',
    'RMC-6236',
    'rmc_6236',
    0.9
  ),
  (
    (select id from public.intelligence_events where event_key = 'evt_20260613_ras_on_demo'),
    'target',
    'KRAS',
    'kras',
    0.9
  )
on conflict (event_id, entity_type, entity_name) do nothing;

insert into public.review_tasks (
  task_key,
  event_id,
  title,
  input_type,
  input_content,
  disease,
  disease_stage,
  drug,
  target,
  requested_angles,
  status
) values (
  'review_ras_on_demo',
  (select id from public.intelligence_events where event_key = 'evt_20260613_ras_on_demo'),
  'AI-MDT review for demo RAS pathway signal',
  'event',
  'Demo review task created from a candidate intelligence event.',
  'pancreatic ductal adenocarcinoma',
  'advanced or metastatic',
  'RMC-6236',
  'KRAS/RAS',
  array['breakthrough potential', 'patient relevance', 'risk of overinterpretation', 'doctor review questions'],
  'machine_reviewed'
)
on conflict (task_key) do update set
  event_id = excluded.event_id,
  title = excluded.title,
  status = excluded.status,
  updated_at = now();

insert into public.model_reviews (
  task_id,
  model_name,
  core_judgment,
  confidence_score,
  evidence_score,
  patient_relevance_score,
  risk_level,
  reasoning,
  uncertainties,
  needs_human_review,
  recommended_action,
  raw_output
) values
  (
    (select id from public.review_tasks where task_key = 'review_ras_on_demo'),
    'claude_demo',
    'Promising but early signal; do not frame as a practice-changing breakthrough.',
    7.0,
    5.5,
    8.0,
    'medium_high',
    '["High-priority pathway", "Evidence maturity unclear", "Patient selection likely important"]'::jsonb,
    '["Need source data", "Need sample size", "Need toxicity details"]'::jsonb,
    true,
    'Enter review queue and prepare doctor-facing questions.',
    '{}'::jsonb
  ),
  (
    (select id from public.review_tasks where task_key = 'review_ras_on_demo'),
    'gpt_demo',
    'Useful intelligence item for tracking and patient consultation preparation.',
    7.5,
    6.0,
    8.2,
    'medium',
    '["Relevant to common PDAC biology", "May connect to trial opportunities"]'::jsonb,
    '["No randomized comparison", "Access status unclear"]'::jsonb,
    true,
    'Include as high-attention early clinical signal.',
    '{}'::jsonb
  ),
  (
    (select id from public.review_tasks where task_key = 'review_ras_on_demo'),
    'gemini_demo',
    'High attention signal, but patient-facing language must be conservative.',
    7.2,
    5.8,
    7.8,
    'medium_high',
    '["Potential therapeutic relevance", "Risk of news-style overpromotion"]'::jsonb,
    '["Need peer-reviewed details", "Need eligibility context"]'::jsonb,
    true,
    'Publish only after human review and clear caveats.',
    '{}'::jsonb
  )
on conflict (task_id, model_name) do update set
  core_judgment = excluded.core_judgment;

insert into public.consensus_reports (
  task_id,
  consensus_score,
  final_judgment,
  agreement_points,
  disagreement_points,
  evidence_score_final,
  patient_relevance_final,
  risk_level_final,
  tags,
  human_review_required,
  publish_recommendation,
  patient_explanation,
  doctor_review_questions
) values (
  (select id from public.review_tasks where task_key = 'review_ras_on_demo'),
  7.0,
  'High-attention early clinical signal. It can enter the War Room review queue, but should not be presented as a confirmed treatment breakthrough.',
  array['Worth tracking', 'Relevant to pancreatic cancer pathway strategy', 'Needs conservative patient-facing language'],
  array['Evidence maturity score varies slightly', 'Risk sensitivity differs across model reviews'],
  5.8,
  8.0,
  'medium_high',
  array['high_value_intelligence', 'needs_human_review', 'early_evidence', 'patient_readable_after_review'],
  true,
  'Include in internal daily review queue; publish only after human review.',
  '这是一条值得关注的早期研究信号，但还不能说明某个治疗已经确定有效或适合所有患者。患者可以把它作为问题带给医生，询问是否与自己的分期、基因检测和临床试验机会相关。',
  array[
    '研究人群是否符合真实世界 PDAC 患者？',
    '数据是否来自随机对照研究？',
    '毒性和耐药信息是否充分？',
    '国内是否有相关临床试验或可及路径？'
  ]
)
on conflict (task_id) do update set
  final_judgment = excluded.final_judgment,
  updated_at = now();

insert into public.index_scores (
  index_code,
  score_date,
  score,
  trend_delta,
  drivers
) values
  ('PCI', '2026-06-13', 72, 8, '[{"driver": "RAS pathway early clinical signal", "weight": "medium"}]'::jsonb),
  ('CTOI', '2026-06-13', 64, 4, '[{"driver": "Trial opportunity needs eligibility mapping", "weight": "medium"}]'::jsonb),
  ('DTI', '2026-06-13', 78, 10, '[{"driver": "KRAS/RAS pipeline momentum", "weight": "high"}]'::jsonb),
  ('TRI', '2026-06-13', 48, 6, '[{"driver": "Overinterpretation risk for early data", "weight": "medium"}]'::jsonb)
on conflict (index_code, score_date) do update set
  score = excluded.score,
  trend_delta = excluded.trend_delta,
  drivers = excluded.drivers;
