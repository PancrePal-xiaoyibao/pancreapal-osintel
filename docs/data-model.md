# Data Model

## Core Entities

| Entity | Purpose |
| --- | --- |
| Source | A public location that can produce intelligence signals. |
| IntelligenceEvent | A normalized event worth reviewing. |
| DrugCard | Drug or regimen status, target, evidence, and risk notes. |
| TrialCard | Trial status, eligibility context, geography, and patient access relevance. |
| DoctorCenterCard | Public academic, clinical, trial, education, and accessibility signals. |
| Report | Generated brief, weekly trend, topic report, or patient consultation list. |
| GeoRegion | Region-level node for global resource atlas, e.g. Asia-Pacific, North America, Europe. |
| GeoCountry | Country-level node for 3D globe and national dashboards. |
| GeoCity | City-level node for drilldown dashboards. |
| TreatmentCenter | Center-level capability and support profile. |
| HospitalDepartment | Department-level capability profile under a treatment center or hospital. |
| DepartmentPublicAccount | Public WeChat or media account linked to a hospital, department, or doctor team. |
| WechatArticle | Public-account article metadata, topic tags, source link, relevance score, and raw API payload without full-text storage by default. |
| WechatMonitorRun | One run of the public-account monitor, including checked accounts, article counts, errors, and output status. |
| ResourceHeatSnapshot | Time-windowed public signal strength for a city, hospital, department, or public account. |
| GeoScoreSnapshot | Country, city, or center score snapshot for map and trend views. |
| MapLayerSnapshot | Render-ready point or heat signal for the 3D globe. |
| RealtimeGeoEntity | Stream-ready geospatial entity emitted by `.mjs` seeders and consumed by the future globe DataBus. |
| GreyRiskSignal | Social or private-channel risk claim requiring factual critique, patient guidance, and doctor questions. |
| PatientMythCorrection | Common patient/family misconception plus evidence-based correction and action tip. |
| ForecastAuditSignal | Prior clinical/intelligence forecast and later verification outcome. |
| PatientLocalProfile | Local-first patient stage, mutation markers, preference, saved events, and privacy controls. |
| RagConnectorConfig | User-configured RAG/knowledge-base endpoint, model, chunking settings, and connectivity diagnostics. |

## Event Review States

| State | Meaning |
| --- | --- |
| `raw` | Collected but not parsed. |
| `parsed` | Structured fields extracted. |
| `machine_reviewed` | Model or rule review completed. |
| `needs_human_review` | Claims, risks, privacy, or medical interpretation require review. |
| `approved` | Safe to include in a report. |
| `rejected` | Not useful, duplicate, unsafe, or unsupported. |

## Evidence Levels

| Level | Examples |
| --- | --- |
| `guideline_update` | NCCN, ESMO, CSCO, CACA updates. |
| `regulatory_action` | FDA, EMA, NMPA, CDE actions. |
| `phase_3_positive` | Phase III trial with positive endpoint. |
| `phase_2_signal` | Phase II efficacy or safety signal. |
| `early_research` | Phase I, translational, preclinical, or mechanism work. |
| `trial_status_change` | Recruiting, suspended, terminated, results posted. |
| `expert_education` | Public education or conference interpretation. |
| `patient_signal` | Public patient discussion requiring anonymization and verification. |

## Required Event Fields

- Title.
- Source name and source URL.
- Published or observed date.
- Source type.
- Region.
- Disease and stage if available.
- Topic tags.
- Evidence level.
- Professional summary.
- Patient-readable summary.
- Patient relevance.
- Potential value.
- Potential risk.
- Uncertainty note.
- Review status.

## Geographic Fields

Events, trials, and center signals should be geocoded when possible:

- `region_key`
- `country_id`
- `city_id`
- `treatment_center_id`
- `event_type`
- `event_scope`

Geographic data must track `data_quality`:

- `public`
- `estimated`
- `mixed`
- `unverified`

This prevents estimated center capability or patient volume from being presented as hard fact.

## City Treatment Resource Fields

The `hospital_source.md` module extends the city drilldown resource layer. Existing `treatment_centers` can support the first hospital-level MVP, but department, public account, and heat-source details should move into dedicated tables before production.

Suggested next entities:

- `hospital_departments`: hospital or center department, resource type, capability tags, complication tags, source links, data quality, and last verification time.
- `department_public_accounts`: public WeChat or media accounts linked to hospitals, departments, or doctor teams.
- `wechat_articles`: article metadata from MPText or equivalent public-account APIs; store links and structured tags, not full text by default.
- `wechat_monitor_runs`: run logs for account checks, article counts, errors, and new-article detection.
- `resource_heat_snapshots`: public signal strength by entity and time window, with heat drivers and data quality.
- `resource_source_links`: normalized evidence links for hospital, department, account, and heat records.

Heat fields must be labeled as public signal strength, not treatment quality or true patient volume.

Surgery-volume fields must preserve metric definition, period, source URL, source type, and verification status. Do not store a single unqualified number for city command-center display.

## Realtime Globe Entity Fields

Realtime globe payloads use `schemas/realtime-geo-entity.schema.json`.

Required fields:

- `id`
- `pluginId`
- `entityType`
- `latitude`
- `longitude`
- `timestamp`
- `label`
- `source`

Recommended fields:

- `layer`
- `heat`
- `dataQuality`
- `properties.country`
- `properties.provinceState`
- `properties.city`
- `properties.centerKey`
- `properties.hospitalName`
- `properties.centerName`
- `properties.candidateSignalRank`
- `properties.capabilityTags`
- `properties.complicationSupportTags`
- `properties.scaleSummary`

The first seeder is `realtime/seeders/pancreatic-centers/seeder.mjs`. It emits a flat `RealtimeGeoEntity[]` array from the dated pancreatic-center snapshot so the future stream client can ingest it without custom payload mapping.

Current contract checks and runtime smoke tests:

- `scripts/validate_realtime_seeders.mjs`
- `scripts/run_realtime_seeder.mjs --plugin pancreatic-centers --once`
- `tests/realtime_runtime.test.mjs`

Do not treat `RealtimeGeoEntity` as the authoritative clinical record. It is a render projection. Authoritative detail remains in source records, Supabase tables, and volume metric tables.

## Horizon Demo DTOs

`references/horizon-workspace` contains useful frontend DTOs that should be formalized before implementation:

- `IndexSnapshot`: named index value with family, time window, components, source coverage, and data quality.
- `IntelEventCard`: clinical intelligence event card with professional summary, patient summary, uncertainty, doctor questions, source evidence, and review status.
- `PatientGuideBlock`: patient-readable explanation, analogy if used, uncertainty note, and doctor-question prompt.
- `DoctorQuestionSet`: grouped questions generated from a source-backed event, grey-risk signal, or center profile.
- `RegionResourceView`: region-level resource board with countries, center counts, coverage quality, and latest intelligence.
- `CountryResourceView`: country-level resource board with city rows, center counts, source coverage, trial/regulatory signals, and latest intelligence.
- `CityCommandView`: city/province treatment command view with resource counts, public-signal heat, source coverage, and data-quality distribution.
- `CityResourceView`: city-level resource board with centers, service categories, public-source coverage, and latest intelligence.
- `DepartmentResourceView`: department-level city resource row with category, heat, public flow label, WeChat account, source links, and data quality.
- `CenterProfileView`: center profile view with source-backed scale metrics, MDT/capability fields, complication support, trial/research signals, and patient-facing notes.
- `CenterLatestIntelView`: center-linked intelligence timeline covering direct center events, linked trials, publications, source updates, and relevant city/country/region signals.
- `SourceEvidenceRef`: source URL, title, type, accessed date, evidence summary, verification status, and confidence.
- `VolumeMetric`: value, unit, period, scope, definition, source URL/type, verification status, confidence, and conflict note.
- `GreyRiskSignal`: grey medical risk claim, factual critique, patient guidance, GMR score, and doctor questions.
- `PatientMythCorrection`: common patient/family misconception plus evidence-based correction and action tip.
- `ForecastAuditSignal`: prior clinical/intelligence forecast and later verification outcome.
- `ReportExportJob`: report type, selected items, target format, review gate, and export result.
- `PatientLocalProfile`: local-first patient stage, molecular markers, preferences, saved items, and privacy controls.
- `RagConnectorConfig`: configured knowledge-base endpoint, model, auth mode, diagnostics, and safety status.
- `WechatRadarResult`: public-account search/monitor result with article metadata, relevance score, resource mapping, and copyright-safe payload.

Important correction before production:

- Horizon demo's `surgeryVolume`, `patientVolume`, `annualPatients`, and `annualSurgeries` are placeholders unless backed by source records.
- Convert these to metric objects with value, unit, period, scope, source URL/type, and verification status.
- Do not expose them as naked ranking numbers.

## Canonical Frontend Contract Rules

Frontend DTOs are view contracts. They should not become a second source of truth.

Rules:

- Authoritative facts live in source records, Supabase tables, verified JSON snapshots, or reviewed reports.
- `RealtimeGeoEntity` is a render projection only.
- Region/country/city/center DTOs must preserve hierarchy keys so a center can be traced back to its region, country, and city.
- City/resource DTOs can aggregate records, but must retain `sourceEvidence[]` and `dataQuality`.
- Center profile DTOs must include a `latestIntelligence` section, even if empty.
- Any displayed volume or scale metric must use `VolumeMetric`.
- Any displayed heat or flow metric must use a field name that includes `heat`, `publicSignal`, or `estimatedPublicAttention`; do not name it `patientVolume` unless it is a verified `VolumeMetric`.
- Any patient-facing explanation must include uncertainty and doctor-question fields.
- Any report/export DTO must carry review status and safety flags.

Suggested TypeScript shape for source-backed metrics:

```ts
type VolumeMetric = {
  metricKey: string;
  name: string;
  value: number | null;
  unit: string;
  period: string;
  scope: string;
  definition: string;
  sourceUrls: string[];
  sourceType: string;
  verificationStatus:
    | "verified"
    | "cross_checked"
    | "single_source"
    | "conflicting"
    | "unverified";
  confidence: "high" | "medium" | "low";
  conflictNote?: string;
};
```

Suggested TypeScript shape for source evidence:

```ts
type SourceEvidenceRef = {
  sourceKey: string;
  title: string;
  url: string;
  sourceType: string;
  accessedAt: string;
  evidenceSummary: string;
  verificationStatus: string;
  confidence: "high" | "medium" | "low";
};
```
