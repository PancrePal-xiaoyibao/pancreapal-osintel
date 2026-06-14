# Decision Log

## 2026-06-13

- Initialized repository scaffold.
- Chose to keep the first pass minimal and documentation-first.
- Second-round refinement uses `design.md` as the product source of truth.
- Phase 0 will focus on source registry, data contracts, manual brief template, and schema validation before automation.
- Adopted a lightweight package-centered structure aligned with the `graphify` baseline: `src/`, `tests/`, `docs/`, `data/`, `schemas/`, `templates/`.
- Patient-facing output must pass a safety gate: no diagnosis, no treatment instruction, no unsupported efficacy claim, no identifiable patient data, and no copyrighted full-text redistribution.
- Adopted `AI-MDT Intelligence Review` as a review-layer module, not an ingestion blocker. Phase 0 stores review tasks, model reviews, and consensus reports before real multi-model orchestration.
- Adopted `3D Globe War Room` as the primary dashboard entrypoint. Geography becomes a first-class data layer: country, city, treatment center, geographic score snapshots, and map layer snapshots.
- Supabase quick demo should use a dedicated `pposintel` project. Do not apply migrations to the existing active `xiaohongka` project without explicit user confirmation.
- Adopted `hospital_source.md` as the City Pancreatic Treatment Resource Layer. It extends city drilldown with hospital, department, complication-support, nutrition, psychology, public-account, heat, and source-evidence fields, without turning heat into hospital ranking.
- Adopted a separate WeChat MP source requirement. MPText/public-account data should feed source registry, department public accounts, article metadata, and heat signals, with API keys kept out of versioned files.

## 2026-06-14

- Evaluated `arch_reference1.md` against the local `silvertakana/worldwideview` reference clone.
- Adopted a WorldWideView-inspired realtime globe pipeline: `seeder.mjs -> stream payload -> DataBus -> store -> Cesium primitive renderer -> animation loop`.
- Declined to import the full WorldWideView plugin marketplace, edition system, dynamic CDN loading, and model-LOD complexity in Phase 0.
- Added `RealtimeGeoEntity` as a render projection contract, not an authoritative medical record.
- Added `realtime/seeders/pancreatic-centers/seeder.mjs` as the first flat `RealtimeGeoEntity[]` emitter from the dated pancreatic-center snapshot.
- Adopted the useful WorldWideView frontend stack pattern for future implementation: Next.js App Router, TypeScript, React, Zustand, CesiumJS/Resium, DataBus, WebSocket client, primitive renderer.
- Deferred WorldWideView marketplace, dynamic CDN plugins, edition/auth system, Prisma-first backend, and complex model LOD until a concrete product need appears.
- Added `docs/frontend-architecture-draft.md` as the first engineering frontend design draft.
- Accepted `references/horizon-workspace` as the primary product/UI/static interaction reference, because its current effect is user-approved except animation and realtime updates.
- Set reference split: Horizon demo for product modules, layout, visual language, and static interaction; WorldWideView for realtime stream, globe animation, and Cesium performance architecture.
- Completed a two-round PRD/function/architecture review in `docs/prd-architecture-review-2026-06-14.md`.
- Canonicalized the quick-demo direction: product shell follows Horizon, realtime globe follows WorldWideView, code structure must remain modular and pposintel/graphify-style.
- Updated MVP scope from Daily Brief-only to a Horizon-style War Room quick demo with city resources, grey risk radar, AI-MDT shell, forecast audit, report center, and profile/configuration.
- Consolidated indices into core intelligence indices, grey-risk/safety indices, and geographic resource subindices. Heat and flow remain public signal strength only.
- Added module-specific compliance boundaries for city-resource heat, grey medical risk, WeChat metadata, local profile/PIN/RAG/API keys, patient explanations, and report export.
- Earlier in the day, geography scope was adjusted from a fixed six-city MVP to China priority province/city nodes aligned with `hospital_source.md`; this China-first interpretation is now superseded by the global atlas decision below.
- Superseded the China-first interpretation for pancreatic-center resources: the first resource module is now a global atlas with `Global -> Region -> Country -> City -> Center -> Latest Intelligence`, using China as early deep coverage and US/Japan/Europe as broad first-pass coverage.
- Added `docs/design-review-global-resource-scope-2026-06-14.md` as the three-round review for function, data/data-flow, UI/UE, sources, and auxiliary configuration completeness.
