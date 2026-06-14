# Architecture

## System Shape

The target architecture is a layered intelligence pipeline:

```text
Raw Layer
  HTML, PDFs, meeting abstracts, trial records, press releases, public posts

Parsed Layer
  title, source, authors, institutions, dates, regions, diseases, drugs, targets

Evidence Layer
  study type, phase, sample size, endpoints, efficacy, safety, applicability

Knowledge Layer
  event cards, drug cards, trial cards, source cards, doctor or center cards

Intelligence Layer
  daily briefs, indices, risk warnings, patient-readable explanations

Geographic Layer
  regions, countries, cities, treatment centers, center profiles, map layers, score snapshots
Realtime Globe Layer
  seeder.mjs collectors, stream messages, DataBus events, primitive globe rendering
```

## Initial Module Boundaries

| Module | Responsibility |
| --- | --- |
| `sources` | Source registry, collection method, authority score, cadence. |
| `ingestion` | Fetch raw public records and preserve source metadata. |
| `parsing` | Extract structured entities and evidence fields. |
| `scoring` | Compute transparent index components. |
| `review` | Track review state, risk flags, and uncertainty. |
| `reports` | Generate daily, weekly, topic, and patient-consultation outputs. |
| `dashboard` | Serve War Room views and chart-ready data. |
| `geography` | Region, country, city, center, globe layers, center profiles, latest intelligence, and score snapshots. |
| `realtime` | Emit render-ready geospatial entities through `seeder.mjs`, stream messages, and DataBus-compatible payloads. |

## Recommended Technical Baseline

Start small and keep the future path open:

- Python package for ingestion, parsing, scoring, and reports.
- Node `.mjs` seeders for realtime globe layers and public API collectors.
- PostgreSQL for structured data.
- Supabase hosted Postgres for the quick demo and read models.
- `pgvector` or Qdrant when retrieval is needed.
- Meilisearch or OpenSearch when full-text search becomes necessary.
- FastAPI when an API boundary is required.
- Next.js App Router dashboard when the frontend starts.
- TypeScript + React + Zustand for frontend implementation.
- CesiumJS plus Resium for the 3D globe; use a static shell only as a pre-Cesium scaffold, not as the final map runtime.
- Docker Compose for local services.

## Reference Architecture Adoption

The local WorldWideView reference project uses:

- Next.js App Router, React, and TypeScript for the frontend.
- CesiumJS and Resium for the 3D globe.
- Zustand slices for frontend state.
- A custom DataBus and WebSocket client for high-frequency data.
- Primitive collections for globe rendering.
- Prisma/Postgres, Supabase SDK, Redis, and a data-engine service for backend/data flows.
- Seeder scripts that emit plugin-scoped live snapshots over `/stream`.

For `pposintel`, adopt the frontend/data-flow spine but not the full platform complexity:

| Reference pattern | pposintel decision |
| --- | --- |
| AppShell + globe-centered layout | Adopt as `WarRoomShell`. |
| DataBus + headless subscriber | Adopt for realtime and selection events. |
| Zustand state slices | Adopt a smaller medical-intelligence slice set. |
| WsClient + stream messages | Adopt for live globe layers. |
| Cesium primitive renderer | Adopt for production globe. |
| Plugin marketplace and dynamic CDN modules | Defer; not part of quick demo. |
| Edition/auth system | Defer until user workflows require it. |
| Prisma as primary ORM | Defer; Supabase read models are enough for the quick demo. |

The implementation-oriented frontend draft is now tracked in `docs/frontend-architecture-draft.md`.

## Horizon Demo Adoption

The project also has a completed demo at:

```text
references/horizon-workspace
```

The user confirmed this demo is the preferred reference for product/UI effects except animation and realtime updates.

Adoption rules:

| Area | Main reference |
| --- | --- |
| Product modules | `references/horizon-workspace` |
| Static layout and visual language | `references/horizon-workspace` |
| Global resource atlas IA | `docs/design-review-global-resource-scope-2026-06-14.md` |
| City treatment resource UX | `references/horizon-workspace` plus `hospital_source.md` |
| Report/profile/RAG/WeChat/source management UX | `references/horizon-workspace` |
| Realtime globe stream and animation | `references/worldwideview` |
| Cesium primitive renderer | `references/worldwideview` |
| Database source of truth | Supabase migrations and source-backed snapshots |

Do not copy Horizon's monolithic `App.tsx` into production. Use it as a screen blueprint and split into maintainable modules. Horizon's city-first resource design is not sufficient for the resource module; the project requires a global atlas:

```text
Global -> Region -> Country -> City -> Pancreatic Center -> Latest Intelligence
```

Detailed analysis: `docs/horizon-demo-reference-analysis.md`.

## Realtime Globe Alignment

`arch_reference1.md` and the local reference clone `references/worldwideview` show a mature realtime geospatial architecture:

```text
seeder.mjs -> WebSocket /stream -> DataBus -> store -> primitive renderer -> Cesium animation loop
```

For `pposintel`, adopt the same pipeline shape but keep the implementation medically scoped:

- First realtime payload shape is a flat `RealtimeGeoEntity[]`.
- `schemas/realtime-geo-entity.schema.json` is the contract for globe stream entities.
- `realtime/seeders/pancreatic-centers/seeder.mjs` is the first seeder example.
- The future frontend should implement a small typed DataBus before introducing a broader plugin marketplace.
- Globe rendering should use Cesium primitives for high-volume layers and avoid the Entity API for live thousands-scale data.
- Camera presets should map to pancreatic treatment regions and city drilldowns, not generic geopolitical dashboards.

Detailed rules are in `docs/architecture-realtime-globe.md`.

## Target Frontend Data Flow

```text
Supabase snapshots / JSON snapshots / .mjs seeders
  -> RealtimeGeoEntity[] or frontend DTOs
  -> WsClient or Supabase read client
  -> DataBus
  -> Zustand data/ui/layers/globe slices
  -> selectors for visible entities and selected region/country/city/center
  -> Cesium primitive renderer and right-side panels
  -> center profile, latest intelligence, source evidence drawer, and report queue
```

The globe is the navigation surface, while Supabase/source records remain the source of truth. Realtime entities are render projections only.

## Baseline Alignment With graphify

The comparison repository is lightweight and package-centered. For this project, keep the same discipline:

- Clear package boundary under `src/`.
- Scripts are thin orchestration wrappers.
- Tests live in `tests/`.
- Docs record decisions and handoff state.
- Generated intelligence artifacts should not replace source records.
