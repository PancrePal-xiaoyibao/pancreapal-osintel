# MVP Roadmap

## Phase 0: Project Baseline, Data Contracts, and Reference Alignment

Target: 1-2 weeks.

Deliverables:

- Source registry schema.
- Intelligence event schema.
- Drug, trial, doctor or center, report template drafts.
- Geographic, global-resource, source-evidence, volume-metric, latest-intelligence, and realtime render contracts.
- Supabase quick-demo read model.
- Horizon demo reference analysis.
- WorldWideView realtime/globe architecture alignment.
- 30-50 seed sources.
- Manual daily brief template.
- Dashboard information architecture and frontend module draft.

Exit criteria:

- Every candidate event can be represented by `schemas/intelligence-event.schema.json`.
- Every seed source can be represented by `schemas/source.schema.json`.
- Every globe point can be represented by `schemas/realtime-geo-entity.schema.json`.
- Every center volume metric has source URL, period, definition, and verification status before display.
- First global resource scope can represent `Global -> Region -> Country -> City -> Center`.
- A manual daily brief can be produced from 5-10 mock events.

## Phase 1A: Horizon-Style War Room Shell

Target: 2-4 weeks.

Deliverables:

- Next.js App Router shell or equivalent first frontend workspace.
- Horizon-style dark command-center layout split into maintainable modules, not a monolithic `App.tsx`.
- Top navigation: War Room, global pancreatic resource atlas, grey risk radar, AI-MDT, forecast audit, report center, profile/config.
- Local fixture loading for `IntelEventCard`, `RegionResourceView`, `CountryResourceView`, `CityResourceView`, `DepartmentResourceView`, `CenterProfileView`, `CenterLatestIntelView`, `GreyRiskSignal`, `ForecastAuditSignal`, and `ReportExportJob`.
- Elderly-friendly mode and patient-readable blocks.
- Static globe placeholder only if Cesium is not yet integrated.

Exit criteria:

- A user can open the first screen and navigate all accepted Horizon modules plus the global resource atlas path.
- A user can drill from region to country to city to center profile.
- No frontend fixture contains naked surgery/patient volume fields.
- Heat is labeled as public signal strength.

## Phase 1B: Supabase Global Resource Read Model

Target: 3-6 weeks.

Deliverables:

- Read models for regions, countries, cities, treatment centers, hospital departments, public accounts, source links, heat snapshots, volume metrics, and linked intelligence events.
- Region, country, city, and center profile panels backed by Supabase or generated JSON snapshots.
- Source evidence drawer for center, hospital, department, metric, and latest-intelligence records.
- WeChat public-account metadata ingestion output contract.

Exit criteria:

- Region and country views show coverage, source counts, country/city rows, and latest intelligence.
- City click opens grouped pancreatic treatment resources with data-quality labels.
- Center click opens center profile and latest intelligence.
- Department click shows source links and public-account information when available.
- Conflicting volume sources display as pending verification instead of rankings.

## Phase 1C: Realtime Globe Runtime

Target: 4-8 weeks.

Deliverables:

- CesiumJS/Resium globe.
- TypeScript DataBus and WebSocket client with reconnect/backoff.
- `pancreatic-centers` stream/snapshot consumption.
- Primitive point rendering, camera presets, and city drilldown.
- Initial stream bridge compatible with `{ type, pluginId, payload }` messages.

Exit criteria:

- The globe consumes flat `RealtimeGeoEntity[]` payloads.
- Region/country/city/center points render with heat/data-quality visual encoding.
- Camera presets cover global regions, China, United States, Japan, Europe, and high-priority cities.

## Phase 2: Ingestion, Daily Brief, and AI-MDT Review

Target: 6-10 weeks.

Priority sources:

- ClinicalTrials.gov.
- PubMed.
- ASCO, ESMO, AACR public pages.
- FDA, EMA, NMPA, CDE.
- Drug company newsrooms.
- Hospital and pancreatic center public pages.
- Curated WeChat public-account metadata.

Deliverables:

- Source fetch adapters.
- Candidate event normalization.
- Deduplication key rules.
- Evidence classification draft.
- Daily brief generator.
- Minimal dashboard data export.
- Review-task creation for high-risk or high-impact items.
- AI-MDT review chamber populated from review tasks and consensus reports.

Exit criteria:

- Daily run produces 20-50 candidates and a reviewed Top 10 brief.
- Each brief item includes source URL, evidence level, uncertainty, and patient relevance.
- High-risk items can be moved into `needs_human_review` before report export.

## Phase 3: Retrieval, Report Automation, and Production Hardening

Target: 10-16 weeks.

Deliverables:

- Retrieval store for source snippets and structured fields.
- Drug and guideline knowledge base.
- Trial eligibility interpretation helper.
- Fact-check queue.
- Patient-readable explanation generator.
- Report/export safety gate.
- RAG connector hardening and secret-handling plan.
- Realtime rendering performance pass with culling and chunked primitive updates.

Exit criteria:

- High-impact claims are traceable to source records.
- Contradictory or weak evidence is flagged instead of silently summarized.
- Patient-facing exports preserve evidence labels, uncertainty, and doctor-question framing.
