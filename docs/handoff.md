# Handoff

## 2026-06-13

- Repository scaffold is in place.
- Next step: implement the core app structure and align with the project design document.

## Second-Round Handoff

- `design.md` remains the long-form product design source.
- `README.md` is now the concise project entrypoint.
- Product, roadmap, architecture, data model, agent workflow, index, compliance, and dashboard specs are under `docs/`.
- Data contracts are under `schemas/`.
- First source seeds are in `data/sources/seed_sources.csv`.
- First report template is `templates/reports/daily-brief.md`.
- Source package placeholder is `src/pposintel/`.
- The immediate next implementation should validate the schemas and create representative examples before adding ingestion code.

## Supabase and 3D Handoff

- `docs/module-3ai-evaluation.md` records the AI-MDT module decision.
- `docs/module-3d-dashboard-evaluation.md` records the 3D Globe module decision.
- `docs/supabase-quick-demo.md` records project creation, restoration, and deployment options.
- Supabase migrations are under `supabase/migrations/`.
- Current recommended migration order:
  1. `001_core_schema.sql`
  2. `002_seed_demo.sql`
  3. `003_geography_globe_schema.sql`
  4. `004_seed_geography_demo.sql`
- Do not apply remote migrations until a dedicated target project is confirmed.
- Dedicated Supabase project is now created and migrated:
  - Project ID: `dngmthqacazkqhtykyvy`
  - URL: `https://dngmthqacazkqhtykyvy.supabase.co`
  - Publishable key: `sb_publishable_a6iatxhYWYY6Xpnjy6awkA_ZH_em8V6`
- Applied migrations: `001_core_schema`, `002_seed_demo`, `003_geography_globe_schema`, `004_seed_geography_demo`, `005_advisor_fixes`, `006_move_vector_extension`.
- Security advisor is clean after moving `vector` into `extensions`.
- Keepalive script is `scripts/supabase_keepalive.sh`; it was verified successfully with the publishable key and a read-only query.
- Keepalive skill is `skills/supabase-keepalive/`; `scripts/supabase_keepalive.sh` now wraps the skill script.
- Keepalive config supports shell env overrides, explicit `--env-file` / `PPOSINTEL_KEEPALIVE_ENV_FILE`, and aliases for Next.js, Vite, Nuxt, Expo, generic `SUPABASE_*`, and legacy anon-key projects. `sb_secret_*` keys are rejected.
- Last keepalive verification: `bash scripts/supabase_keepalive.sh` succeeded on 2026-06-13 with `sources`.
- `hospital_source.md` is now the City Pancreatic Treatment Resource Layer spec. It should drive the next schema extension for `hospital_departments`, `department_public_accounts`, `resource_heat_snapshots`, and `resource_source_links`.
- `hospital_source.md` now includes expanded province/city scope, Shanghai key-center leads, peritoneal metastasis support, and a hard rule that surgery-volume metrics require source URL, period, definition, and verification status.
- `docs/wechat-mp-source-requirements.md` defines the MPText/public-account source module. Use `MP_API_KEY` from local env only; do not commit real API keys.

## Realtime Globe Handoff

- `arch_reference1.md` was evaluated against the local reference clone `references/worldwideview`.
- `references/worldwideview` is intentionally ignored by Git and should remain a read-only reference copy.
- Key adopted pattern: `seeder.mjs -> stream payload -> DataBus -> store -> Cesium primitive renderer -> animation loop`.
- Do not import the full WorldWideView marketplace/plugin/edition system into pposintel Phase 0.
- Main design doc: `docs/architecture-realtime-globe.md`.
- ADR: `docs/adr/2026-06-14-realtime-globe-pipeline.md`.
- Realtime render schema: `schemas/realtime-geo-entity.schema.json`.
- First seeder example: `realtime/seeders/pancreatic-centers/seeder.mjs`.
- The seeder reads `data/pancreatic_centers/pancreatic_center_snapshot_2026-06-13.json` and emits flat `RealtimeGeoEntity[]` for the future globe runtime.
- Current runtime boundary: `realtime/runtime/` with DataBus, WsClient, globe store, camera presets, primitive projection, and animation-loop skeleton.
- Contract validation: `node scripts/validate_realtime_seeders.mjs`.
- Stream-message smoke test: `node scripts/run_realtime_seeder.mjs --plugin pancreatic-centers --once`.
- Runtime smoke test: `node tests/realtime_runtime.test.mjs`.
- Next frontend implementation should add a small typed DataBus, a WebSocket stream client with reconnect/backoff, and a Cesium/Resium globe with camera presets before adding plugin marketplace features.

## Frontend Architecture Handoff

- Existing frontend draft before this pass was distributed across `docs/dashboard-spec.md`, `docs/module-3d-dashboard-evaluation.md`, `3D_dashbroad.md`, and `docs/architecture-realtime-globe.md`.
- New engineering draft: `docs/frontend-architecture-draft.md`.
- Primary product/UI reference: `references/horizon-workspace`.
- Horizon analysis doc: `docs/horizon-demo-reference-analysis.md`.
- Reference stack to adopt: Next.js App Router, TypeScript, React, Zustand, CesiumJS/Resium, DataBus, WebSocket stream client, primitive renderer.
- Reference stack to defer: marketplace, dynamic CDN plugin loading, edition/auth system, Prisma-first backend, complex aircraft/ship model LOD.
- Recommended first real frontend: Next.js + TypeScript + Zustand + Cesium/Resium, backed by Supabase read models and `RealtimeGeoEntity[]` streams.
- Product implementation should follow Horizon's module set and visual style, while replacing its static SVG globe and mock values with Cesium and source-backed data.

## PRD / Architecture Review Handoff

- Two-round review document: `docs/prd-architecture-review-2026-06-14.md`.
- Round 1 found internal inconsistencies in MVP scope, index naming, compliance boundaries, data contracts, AI-MDT placement, and geography scope.
- Round 2 compared Horizon and WorldWideView:
  - Adopt Horizon for product modules, static UX, visual style, city resources, grey risk, AI-MDT shell, forecast audit, report center, profile/config, local profile, RAG, WeChat radar, PIN, and elderly mode.
  - Adopt WorldWideView for stream shape, DataBus, WebSocket client, Zustand-style state, Cesium primitives, camera presets, and performance rules.
  - Reject copying Horizon's monolithic `App.tsx`, static SVG globe as final map, and naked volume fields.
  - Defer WorldWideView marketplace, edition/auth system, dynamic CDN loading, Prisma-first backend, and complex model LOD.
- Updated canonical docs:
  - `docs/product-brief.md`
  - `docs/mvp-roadmap.md`
  - `docs/index-system.md`
  - `docs/compliance-boundaries.md`
  - `docs/data-model.md`
  - `docs/dashboard-spec.md`
  - `docs/module-3d-dashboard-evaluation.md`
  - `docs/module-3ai-evaluation.md`
- Next implementation should not start by copying Horizon. It should first create source-safe frontend fixtures and DTO validation, then build the Phase 1A shell.

## Global Resource Scope Handoff

- Global resource-scope review document: `docs/design-review-global-resource-scope-2026-06-14.md`.
- The pancreatic-center resource module must be global from the first implementation:
  - `Global -> Region -> Country -> City -> Pancreatic Center -> Latest Intelligence`
- Horizon is insufficient for this part because it is city-first and does not define region/country boards or center-linked recent intelligence.
- China is early deep coverage, not the product boundary.
- US, Japan, and Europe should appear in the first resource module, even with shallower coverage.
- The current pancreatic-center snapshot already has 48 centers: China 32, United States 6, Japan 4, Europe 6.
- Center profile must include latest linked intelligence as a required section, not a later enhancement.
- Next schema/design work should add `GeoRegion`, `RegionResourceView`, `CountryResourceView`, `CityResourceView`, `CenterLatestIntelView`, and `CoverageQualitySnapshot`.
- Auxiliary configuration must cover model provider settings, RAG custom connectors, source registry filters, WeChat monitor settings, source freshness thresholds, translation preferences, patient profile/saved centers, elderly mode, PIN, and report safety gates.

## Design Development Plan Handoff

- Active implementation plan: `docs/plans/2026-06-14-global-resource-atlas-implementation.md`.
- Plan goal: build the first design-development slice for `Global -> Region -> Country -> City -> Center -> Latest Intelligence`.
- Design authority index: `docs/design-doc-index.md`; use it first to locate current source-of-truth, implementation specs, module specs, and superseded historical docs.
- Execute the plan in the documented order: design authority index, contracts, fixture builder, Supabase read model, realtime projection, configuration contracts, guardrails, frontend shell, final documentation.
- Task 1 must create the design authority index before code implementation so the current source-of-truth docs remain explicit.
- Do not start by copying Horizon. Horizon is the UI/product reference; WorldWideView remains the realtime globe architecture reference.
- Keep Supabase/source records authoritative and treat `RealtimeGeoEntity` as render projection only.
- Guardrail remains mandatory: no naked `surgeryVolume`, `patientVolume`, `annualPatients`, or `annualSurgeries` fields.

## Task 7 Frontend Shell Handoff

- Commit: `0a78212 feat: scaffold global atlas frontend shell`.
- Frontend entrypoints:
  - `app/layout.tsx`
  - `app/page.tsx`
  - `app/globals.css`
  - `components/shell/WarRoomShell.tsx`
  - `components/modules/resources/GlobalResourceAtlas.tsx`
- Domain types: `core/domain/globalResourceTypes.ts`.
- The current shell is a static fixture view, not a Supabase-connected or Cesium globe implementation yet.
- Data source: `data/global_resource_atlas/global_resource_atlas_2026-06-13.json`.
- UI path: War Room shell -> global atlas hero/stats -> region board -> country rows -> center profile panel -> latest-intelligence rail.
- Fixture boundary: `GlobalResourceAtlas.tsx` validates minimum region/country/city/center arrays before treating the fixture as `GlobalResourceAtlasSnapshot`.
- Next 16 typecheck command is `npm run typecheck`, which runs `next typegen && tsc --noEmit`; this is required because Next writes generated route type imports into `next-env.d.ts`.
- Build command: `npm run build`.
- Guardrail command: `npm run validate:guardrails`.
- Verified on 2026-06-14: guardrails, global contracts, app configuration contracts, realtime runtime test, typecheck, and production build all passed.
- Dependency note: `npm install` created `package-lock.json` and reported 2 moderate audit findings. Do not run `npm audit fix --force` without a separate dependency-risk review.
- `.gitignore` now excludes `node_modules/`, `.next/`, and `tsconfig.tsbuildinfo`.
- Next implementation should connect this shell to Supabase read models or add Cesium/Resium only after preserving the current source-safe `VolumeMetric` and latest-intelligence contracts.

## Global Atlas Implementation Handoff

- Current design-development slice covers:
  - Design authority index: `docs/design-doc-index.md`.
  - Global atlas contract: `schemas/global-resource-atlas.schema.json`.
  - Generated fixture: `data/global_resource_atlas/global_resource_atlas_2026-06-13.json`.
  - Fixture builder: `scripts/build_global_resource_atlas.mjs`.
  - Supabase read-model migration: `supabase/migrations/009_global_resource_atlas_schema.sql`.
  - Supabase read-model doc: `docs/supabase-global-resource-atlas.md`.
  - Realtime projection: `realtime/seeders/pancreatic-centers/seeder.mjs`.
  - Configuration contract: `schemas/app-configuration.schema.json` and `data/config/demo_app_config.json`.
  - Guardrail: `scripts/validate_no_naked_volume_fields.mjs` and `npm run validate:guardrails`.
  - Frontend shell: `app/`, `components/`, and `core/domain/globalResourceTypes.ts`.
- Current fixture counts: 3 regions, 7 countries, 27 cities, 48 centers.
- Current realtime seeder output: 85 render entities across region, country, city, and center levels.
- Supabase status: migration `009_global_resource_atlas_schema.sql` exists locally but has not been applied to the hosted `pposintel` project. Apply it remotely only after explicit confirmation.
- Frontend status: the App Router shell renders a static fixture read model. It is not yet connected to Supabase, websocket streams, or Cesium/Resium.
- Source safety: all volume-like scale data must stay inside `VolumeMetric` with value, unit, period, scope, definition, source URLs, source type, verification status, and confidence.
- Forbidden product-field names remain blocked in atlas JSON and app/components/core TypeScript:
  - `surgeryVolume`
  - `patientVolume`
  - `annualPatients`
  - `annualSurgeries`
- Task 9 final verification gate:
  - `node scripts/validate_realtime_seeders.mjs`
  - `node tests/realtime_runtime.test.mjs`
  - `node tests/global_resource_contracts.test.mjs`
  - `node tests/app_configuration_contracts.test.mjs`
  - `node scripts/validate_no_naked_volume_fields.mjs`
  - `npm run build`
- Final verification result on 2026-06-14: all Task 9 commands passed locally.
- Final verification details:
  - Realtime seeder validation emitted 85 entities.
  - Realtime runtime test passed.
  - Global resource contract schema test passed.
  - App configuration contract test passed.
  - Naked volume guardrail passed with 10 scanned files.
  - Next production build passed and prerendered `/` plus `/_not-found`.
- Next task should be selected explicitly from one of these tracks:
  - Apply/test Supabase migration 009 on the hosted project after confirmation.
  - Replace static fixture reads with Supabase read-model queries.
  - Add Cesium/Resium globe runtime consuming `RealtimeGeoEntity[]`.
  - Expand center evidence and latest-intelligence content beyond the current fixture.
