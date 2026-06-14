# PRD / Feature / Architecture Review

## Scope

Review date: 2026-06-14.

Supersession note: the geography-scope conclusion in this review was later corrected by `docs/design-review-global-resource-scope-2026-06-14.md`. The current scope is global atlas first: `Global -> Region -> Country -> City -> Center -> Latest Intelligence`.

This review performs two passes:

1. Internal consistency check across PRD, roadmap, architecture, data model, dashboard, compliance, Supabase, and module-evaluation docs.
2. Reference gap check against `references/horizon-workspace` and `references/worldwideview`.

Reference priority used for this review:

1. `references/horizon-workspace` for product module set, static UX, visual style, city resources, risk radar, AI-MDT, forecast audit, reports, profile/config, local profile, RAG, WeChat radar, PIN, and elderly mode.
2. `hospital_source.md` for city pancreatic treatment-resource requirements and source-verification rules.
3. `references/worldwideview` for realtime globe stream, DataBus, WebSocket, Cesium primitive rendering, and animation-loop architecture.
4. `design.md` for long-form product intent.
5. `/Users/qinxiaoqiang/Downloads/graphify` for repo discipline and package boundaries.

## Executive Findings

| Severity | Area | Finding | Impact | Fix |
| --- | --- | --- | --- | --- |
| High | MVP definition | `docs/product-brief.md` and `docs/mvp-roadmap.md` still describe a Daily Brief first MVP, while later docs have accepted Horizon-style War Room and city treatment resources as the first demo blueprint. | Implementation may start with the wrong product surface and defer accepted modules. | Redefine MVP as a Horizon-based War Room quick demo with evidence-backed read models, not only a daily brief pipeline. |
| High | Metric safety | Horizon demo uses naked `surgeryVolume`, `patientVolume`, `annualPatients`, and `annualSurgeries` values. Existing docs warn against this, but the PRD and roadmap did not make it a hard MVP acceptance gate. | City command-center numbers may be treated as verified facts or rankings. | Require all volume metrics to be structured objects with value, unit, period, scope, definition, source URL/type, and verification status. |
| High | Compliance | Compliance docs are too generic for grey medical risk, WeChat monitor, local patient profile, PIN, RAG connectors, report export, and elderly patient-facing simplification. | Product can accidentally expose unsafe treatment advice, copyrighted article text, API keys, or patient-sensitive local data. | Extend compliance boundaries with module-specific gates and display rules. |
| Medium | Index system | Core docs use PCI, CTOI, DTI, DHI, TRI. Horizon adds PSI and GMR. 3D docs add PTCI, PAI, PPI, PBI, CSI, and trial scores. | Dashboard cards and database snapshots can diverge in naming and meaning. | Split indices into core intelligence indices, safety/risk indices, and geographic resource subindices with explicit status. |
| Medium | Data contracts | `docs/data-model.md` lists Horizon DTOs but does not define formal frontend contracts for all accepted UI modules. | Frontend may re-create Horizon's ad hoc types instead of source-safe pposintel DTOs. | Add canonical frontend DTO contracts and enforce metric/source fields. |
| Medium | AI-MDT placement | `docs/module-3ai-evaluation.md` says UI is Phase 3, but Horizon makes the AI-MDT chamber a visible core tab. | The quick demo may omit a module users now expect in the accepted shell. | Keep real multi-model orchestration deferred, but include a visible review chamber shell and mock/source-backed review tasks in Phase 1A. |
| Medium | Geography scope | 3D module still references a six-city MVP, while `hospital_source.md` expands the first resource scope to China priority province/city nodes. | Data seeding, camera presets, and city panels will not match the latest resource requirement. | Define the first geography scope as China priority resource nodes with Shanghai and Beijing high-detail examples, not a fixed six-city prototype. |
| Medium | Realtime architecture | WorldWideView realtime architecture is documented and a local runtime skeleton exists, but the missing server boundary remains explicit work. | A frontend could rely on static seeders and never gain stream semantics. | Roadmap should include a lightweight stream bridge after static shell and before high-volume globe rendering. |
| Low | Reference-code risk | Horizon has a useful product prototype but a monolithic `App.tsx`; WorldWideView has mature architecture but excessive marketplace/auth complexity. | Blind copying either reference would create maintainability or scope problems. | Use "product like Horizon, realtime like WorldWideView, code structure like pposintel/graphify" as the canonical decision. |

## Round 1: Internal Consistency Review

### Product And MVP

The older product brief says the first MVP is:

- Daily candidate intelligence collection.
- Top 10 daily brief.
- Five index cards.
- Source registry.
- Manual review state.

That no longer matches the accepted Horizon demo direction. The current first demo needs to show:

- War Room dashboard shell.
- Global/city pancreatic treatment resources.
- Grey medical risk radar.
- AI-MDT review chamber shell.
- Forecast/evidence audit.
- Report/export center.
- Profile/configuration with local profile, saved items, RAG connectors, WeChat radar, source registry, PIN, and elderly mode.

Correction:

- Daily Brief remains a critical output, but it becomes one workflow inside the War Room, not the whole MVP.
- The first shippable demo is Horizon-style static shell plus source-backed sample data plus realtime-compatible globe contract.

### Architecture

The architecture document is mostly aligned with the latest decisions. It already contains:

- Layered intelligence pipeline.
- Geographic layer.
- Realtime globe layer.
- Horizon and WorldWideView reference split.
- Supabase quick-demo read models.

Remaining gap:

- The architecture needs a clearer distinction between authoritative records, frontend DTOs, and render projections.
- `RealtimeGeoEntity` is a render projection only.
- Supabase snapshot/source tables are the authoritative read model for demo data.
- Horizon-style DTOs are UI contracts, not database tables unless persistence is required.

### Data Model

The data model includes most accepted concepts, but the frontend DTO list was too lightweight. Missing or under-specified contracts:

- `IndexSnapshot`.
- `IntelEventCard`.
- `PatientGuideBlock`.
- `DoctorQuestionSet`.
- `CityCommandView`.
- `DepartmentResourceView`.
- `CenterProfileView`.
- `SourceEvidenceRef`.
- `VolumeMetric`.
- `GreyRiskSignal`.
- `ForecastAuditSignal`.
- `ReportExportJob`.
- `PatientLocalProfile`.
- `RagConnectorConfig`.
- `WechatRadarResult`.

Hard rule:

- Any field that looks like volume, rank, scale, patient flow, surgery count, or clinical capacity must either be a source-backed metric object or a labeled heat/public-signal field.

### Compliance

Compliance currently covers medical advice, copyright, privacy, and model risk in general terms. It must explicitly cover:

- Grey medical risk: factual critique and doctor questions, never vigilantism or provider defamation.
- WeChat source monitor: metadata and links by default, no full-text redistribution.
- RAG/API key handling: no committed keys, no frontend exposure of production secrets.
- Local patient profile and PIN: demo-only PIN is not cryptographic security.
- Patient-friendly analogies: simplify evidence, never convert into instructions.
- Report export: preserve source labels, uncertainty, and review state.
- Heat and flow display: public-signal strength only, never clinical quality or real patient volume.

### Roadmap

The previous Phase 3 War Room timing conflicts with the current product decision. The revised roadmap should be:

- Phase 0: contracts, source registry, Supabase read model, realtime skeleton.
- Phase 1A: Horizon-style static War Room shell with split components and local fixtures.
- Phase 1B: Supabase read model for city resources, center profiles, source evidence, and volume metrics.
- Phase 1C: Cesium/Resium globe and realtime DataBus path.
- Phase 2: ingestion, WeChat monitor, daily brief, AI-MDT task creation.
- Phase 3: production review workflow, report automation, stronger security, performance hardening.

## Round 2: Reference Gap Review

### Horizon Demo

| Horizon module/detail | Current status | Adopt / Defer / Reject | Fix |
| --- | --- | --- | --- |
| Top tabs: dashboard, map, risk, aimdt, forecast, report, profile | Dashboard docs have this; product brief/roadmap lag. | Adopt | Make this the first frontend navigation. |
| Dark command-center visual style with gold accent | Captured in dashboard/frontend docs. | Adopt | Preserve as primary UI direction. |
| City resource cockpit and department list | Captured in `hospital_source.md`. | Adopt | Replace mock values with source-backed Supabase records. |
| WeChat account copy/listing on department rows | Captured in `hospital_source.md` and WeChat requirements. | Adopt | Add DTO and table requirements for public account links. |
| Grey risk radar with GMR score | Data model mentions `GreyRiskSignal`; index docs missing GMR. | Adopt with stricter compliance | Define GMR as unverified-claim risk score, not clinical risk. |
| Patient myths and doctor questions | Data model mentions myth correction. | Adopt | Add patient-guide boundary and component contract. |
| AI-MDT chamber visible tab | AI-MDT doc defers UI to Phase 3. | Adopt shell, defer real orchestration | Include review-chamber UI in Phase 1A with mock/source-backed tasks. |
| Forecast audit log | Data model mentions `ForecastAuditSignal`; roadmap missing. | Adopt | Include in first shell as audit/read-only module. |
| Report/export center | Present conceptually but not in compliance gate. | Adopt | Add export safety gate and report DTO. |
| Profile/config with local profile, saved events, RAG connectors, WeChat radar, source registry, PIN, elderly mode | Frontend docs mention; product/roadmap/compliance need alignment. | Adopt for UI, harden later | Include in shell; treat localStorage/API key/PIN as demo risk areas. |
| Naked surgery/patient volumes | Present in Horizon reference data. | Reject as authoritative form | Convert to `VolumeMetric` objects or mark pending verification. |
| Monolithic `App.tsx` implementation | Present in Horizon. | Reject | Split into Next.js modules and state slices. |
| Static SVG globe | Present in Horizon. | Defer as placeholder only | Replace with Cesium/Resium production globe. |

### WorldWideView

| WorldWideView capability | Current status | Adopt / Defer / Reject | Fix |
| --- | --- | --- | --- |
| `seeder.mjs -> /stream -> WsClient -> DataBus -> store -> renderer -> Cesium` | Architecture docs and runtime skeleton exist. | Adopt | Roadmap must include stream bridge after static shell. |
| Typed DataBus | Runtime skeleton exists. | Adopt | Port to TypeScript frontend modules. |
| WebSocket client with reconnect/backoff | Runtime skeleton exists. | Adopt | Add frontend equivalent when Next.js starts. |
| Zustand slices | Drafted. | Adopt smaller set | Use medical-intelligence slices, not all nine reference slices. |
| Primitive collections for rendering | Documented. | Adopt | Do not build final globe on Cesium Entity API. |
| Horizon culling and chunked updates | Documented as future performance work. | Adopt later | Add in Phase 1C/Phase 3 depending on entity count. |
| Plugin marketplace and dynamic CDN bundles | Documented as deferred. | Defer | Not needed for quick demo. |
| Edition/auth system | Documented as deferred. | Defer | Use only when user workflows require accounts. |
| Prisma-first backend | Documented as deferred. | Defer | Supabase read models are enough for quick demo. |

## Canonical Decisions

1. First demo product shell follows Horizon, not the older Daily Brief-only MVP.
2. Realtime globe and animation architecture follows WorldWideView.
3. Code structure must not copy Horizon's monolithic `App.tsx`.
4. Heat means public signal strength only.
5. Hospital/center volumes require source-backed metric objects.
6. Grey medical risk output must critique claims and prepare doctor questions; it must not prescribe or defame.
7. WeChat content defaults to metadata, links, tags, and short summaries; full text is not stored by default.
8. Local profile, RAG connectors, API keys, and PIN are demo-sensitive areas and need explicit security language before production.

## Updated MVP Boundary

Include in the next quick demo:

- Horizon-style War Room shell and top module navigation.
- Static/local JSON fixtures for the accepted module set.
- Supabase read model for centers, city resources, source evidence, and volume metrics where available.
- `RealtimeGeoEntity[]` seeder contract and runtime skeleton.
- City resource list with source links, heat bars, data quality, and department/public-account rows.
- Risk radar, AI-MDT shell, forecast audit, report center, and profile/config panels.

Exclude from the quick demo:

- Real multi-model orchestration.
- Automated doctor or hospital ranking.
- Unreviewed patient-facing treatment suggestions.
- Full-text WeChat/article redistribution.
- Production-grade auth/secret vault.
- Full WorldWideView marketplace/edition/plugin system.

## Required Doc Changes Completed In This Pass

- `docs/product-brief.md`: align MVP with Horizon-style War Room quick demo.
- `docs/mvp-roadmap.md`: move War Room shell earlier and make realtime/Supabase phases explicit.
- `docs/index-system.md`: consolidate core, safety, and geography indices.
- `docs/compliance-boundaries.md`: add module-specific safety rules.
- `docs/data-model.md`: add canonical frontend DTO contracts and metric/source rules.

## Next Implementation Plan

1. Add or extend Supabase migration for `hospital_departments`, `department_public_accounts`, `resource_heat_snapshots`, `resource_source_links`, and WeChat article metadata if not already covered by the snapshot schema.
2. Generate frontend fixture files from the verified center snapshot instead of Horizon mock values.
3. Start Phase 1A Next.js shell only after deciding whether to bootstrap a new `app/` frontend inside this repo or keep frontend as a separate app workspace.
4. Port `realtime/runtime/` to typed frontend modules when the Next.js shell starts.
5. Add validation checks that reject naked volume fields in frontend DTO fixtures.
