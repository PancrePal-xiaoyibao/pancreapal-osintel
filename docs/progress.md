# Progress

## 2026-06-13

- Created initial project logs and memory file.
- Preparing Git repository initialization.
- Added local `AGENTS.md` for project-specific workflow and safety rules.
- Added `README.md` project entrypoint.
- Added product and architecture docs derived from `design.md`.
- Added JSON schemas for source records and intelligence events.
- Added first source registry seed CSV.
- Added daily brief report template.
- Added `src/pposintel/` and `tests/` placeholders.
- Evaluated `module_3AI_ver.md` and integrated it as the AI-MDT review layer.
- Evaluated `3D_dashbroad.md` and integrated it as the 3D Globe War Room entrypoint.
- Added Supabase quick demo migrations for core schema, demo seed data, geography schema, and geography seed data.
- Confirmed Supabase MCP sees two free organizations under `samqin123` naming, but no login email/user UUID is exposed.
- Created Supabase project `pposintel` in `samqin123's Org`.
- Applied migrations `001` through `006` successfully.
- Verified security advisor has no current lints.
- Added and verified Supabase keepalive script to reduce free-project inactivity pause risk.
- Converted the keepalive workflow into a project-local skill under `skills/supabase-keepalive/`.
- Generalized Supabase keepalive config resolution for Next.js, Vite, Nuxt, Expo, generic Supabase env names, explicit env files, and project-specific overrides.
- Optimized `hospital_source.md` into the City Pancreatic Treatment Resource Layer requirement and linked it to the 3D Globe city drilldown.
- Updated `hospital_source.md` with province/city expansion, user-supplied pancreatic center leads, peritoneal metastasis support, and surgery-volume cross-check rules.
- Added `docs/wechat-mp-source-requirements.md` for MPText/API-based public-account source collection.

## 2026-06-14

- Evaluated `arch_reference1.md` and cloned `silvertakana/worldwideview` into ignored local reference path `references/worldwideview`.
- Added `docs/architecture-realtime-globe.md` to align pposintel with a lightweight WorldWideView-style realtime globe pipeline.
- Added ADR `docs/adr/2026-06-14-realtime-globe-pipeline.md`.
- Added render projection schema `schemas/realtime-geo-entity.schema.json`.
- Added first realtime seeder example `realtime/seeders/pancreatic-centers/seeder.mjs`.
- Updated architecture, dashboard, and data-model docs so realtime `.mjs` collection, DataBus, and Cesium primitive animation are first-class future implementation requirements.
- Added `.gitignore` entries for the local reference clone, generated SQL chunks, and Python cache.
- Added dependency-free realtime runtime boundary under `realtime/runtime/`: DataBus, WebSocket stream client, globe store, camera presets, primitive projection, and animation loop.
- Added `scripts/validate_realtime_seeders.mjs`, `scripts/run_realtime_seeder.mjs`, and `tests/realtime_runtime.test.mjs`.
- Verified the `pancreatic-centers` seeder emits 48 valid `RealtimeGeoEntity` records and one stream-compatible JSON message.
- Added `docs/frontend-architecture-draft.md` to convert the existing dashboard/product draft into an engineering frontend architecture draft.
- Updated architecture docs with the WorldWideView frontend/backend stack, adopted data-flow spine, and pposintel-specific frontend module structure.
- Analyzed `references/horizon-workspace` and accepted it as the primary product/UI reference.
- Added `docs/horizon-demo-reference-analysis.md` documenting what to adopt from Horizon, what not to copy, and how to combine it with WorldWideView realtime/globe architecture.
- Completed two-round PRD/function/architecture review.
- Added `docs/prd-architecture-review-2026-06-14.md`.
- Updated `docs/product-brief.md`, `docs/mvp-roadmap.md`, `docs/index-system.md`, `docs/compliance-boundaries.md`, `docs/data-model.md`, `docs/dashboard-spec.md`, `docs/module-3d-dashboard-evaluation.md`, and `docs/module-3ai-evaluation.md` to resolve review findings.
- Current MVP is now a Horizon-style War Room quick demo plus Supabase read model plus realtime-compatible globe contract, not a Daily Brief-only MVP.
- Completed global resource-scope correction and three-round design review.
- Added `docs/design-review-global-resource-scope-2026-06-14.md`.
- Updated product, roadmap, dashboard, data model, frontend architecture, Horizon analysis, realtime globe architecture, 3D module evaluation, architecture, and `hospital_source.md` so the first pancreatic-center resource module is global: `Region -> Country -> City -> Center -> Latest Intelligence`.
- China is now early deep coverage, while US, Japan, and Europe appear from day one as broad-coverage regions with explicit coverage-quality labels.
- Created the design-development implementation plan: `docs/plans/2026-06-14-global-resource-atlas-implementation.md`.
- The plan defines stage gates from design authority index, global atlas contracts, fixture generation, Supabase read model, realtime projections, configuration contracts, frontend shell, guardrails, and final handoff.
- Added `docs/design-doc-index.md` as the design authority index for implementers before global atlas contract or frontend work.

## Current Phase

Design-development planning for Phase 1A: global pancreatic treatment resource atlas.

## Next Work

- Execute `docs/plans/2026-06-14-global-resource-atlas-implementation.md` task by task after selecting execution mode.
- Task 1, Design Authority Index, is complete; start Task 2 from `docs/design-doc-index.md` before adding global atlas contracts.
- Validate JSON schemas with representative examples.
- Expand seed sources from 25 toward the first 100.
- Create mock intelligence events and generate one manual daily brief.
- Decide the first implementation stack: Python-only Phase 0, then FastAPI/Next.js after contracts stabilize.
- Build the first dashboard data reader against Supabase using the publishable key.
- Add a frontend quick demo for 3D Globe data using `geo_countries`, `geo_cities`, `treatment_centers`, and `map_layer_snapshots`.
- Add the first frontend runtime with DataBus, WebSocket stream client, and Cesium/Resium globe consuming `RealtimeGeoEntity[]`.
- Decide whether Phase 1A starts with a static War Room shell or goes directly to Next.js + Cesium/Resium.
- Design the next Supabase migration for department-level resources, public accounts, heat snapshots, and source links.
- Add source tables for WeChat public accounts, article metadata, monitor runs, and volume metric sources.
- Schedule `scripts/supabase_keepalive.sh` every 2-3 days using cron, launchd, GitHub Actions, or an uptime monitor.
- Use `$supabase-keepalive` workflow when modifying or validating the keepalive automation.
- When frontend stack is confirmed, port `realtime/runtime/` into a Next.js/Cesium implementation using primitive collections.
- Use the Horizon demo as the first frontend screen blueprint, but split the monolithic App into maintainable Next.js modules.
- Add validation that frontend fixtures do not contain naked surgery/patient-volume fields copied from Horizon.
- Create the next Supabase migration for global regions, resource views, department resources, public accounts, heat snapshots, source links, linked intelligence, and WeChat article metadata.
- Decide whether the first Next.js frontend lives directly in this repo or in a separate app workspace before implementing Phase 1A.
