# Frontend Architecture Draft

## Status

Draft, created on 2026-06-14.

This document turns the existing War Room and 3D globe product drafts into an implementation-oriented frontend architecture.

Current reference priority:

1. `references/horizon-workspace` is the primary product/UI/static interaction reference.
2. `references/worldwideview` is the realtime 3D globe, animation, DataBus, and stream architecture reference.

## Does A Frontend Draft Already Exist?

Yes, but it was previously spread across product and module documents:

- `docs/dashboard-spec.md`: main War Room layout, navigation, filters, 3D globe entry, city resource panel, and visual direction.
- `docs/module-3d-dashboard-evaluation.md`: 3D Globe War Room module evaluation and geographic data model.
- `3D_dashbroad.md`: source requirement for the 3D dashboard concept.
- `docs/architecture-realtime-globe.md`: realtime globe data contract and animation pipeline.

The missing piece was an engineering draft for frontend module structure, runtime data flow, and technical stack. This file fills that gap.

## Reference Frontend Stack

The prior design draft exists, but `references/horizon-workspace` is now the preferred concrete demo because the user has confirmed its static product effect is satisfactory except for animation and realtime updates.

## Primary Product/UI Reference: Horizon Demo

Use `references/horizon-workspace` as the blueprint for:

- Header, tactical tab navigation, index strip, module panels, and sync log.
- Homepage split between globe/ingest terminal and event stream/evidence panel.
- Global pancreatic treatment resource atlas with region-country-city-center drilldown.
- Grey risk radar.
- AI-MDT chamber.
- Forecast/audit log.
- Report export center.
- Profile/configuration panel.
- Local profile, saved events, RAG connectors, WeChat radar, source registry, PIN lock, and elderly mode.

Do not copy the demo's single 3,700+ line `App.tsx` structure. Split it into modules and state slices.

Detailed analysis: `docs/horizon-demo-reference-analysis.md`.

## Realtime/Globe Reference Stack

WorldWideView uses:

| Area | Reference stack | pposintel adoption |
| --- | --- | --- |
| App framework | Next.js App Router | Adopt for the first real frontend. |
| Language | TypeScript | Adopt. |
| UI runtime | React | Adopt. |
| 3D globe | CesiumJS + Resium | Adopt for production globe; allow a static mock before Cesium setup. |
| State | Zustand slices | Adopt the slice pattern, not all reference slices. |
| Realtime | WebSocket client + DataBus | Adopt. Current local boundary exists under `realtime/runtime/`. |
| Render path | Primitive collections | Adopt for Cesium globe layers. |
| Database access | Prisma/Postgres plus Supabase SDK | Prefer Supabase SDK and generated types first; add Prisma only if backend requirements justify it. |
| Auth/edition | NextAuth and edition system | Defer. Not needed for the quick demo. |
| Plugin marketplace | Dynamic plugin loader | Do not adopt in Phase 0 or Phase 1. |
| Deployment | Docker, standalone Next.js output | Optional for later deployment. |

## Recommended pposintel Frontend Stack

Phase 1 frontend:

- Next.js App Router.
- TypeScript.
- React.
- Zustand for app state.
- CesiumJS + Resium for the main 3D globe.
- Supabase JS client for read-only demo data and snapshots.
- Local `realtime/runtime/` concepts ported into frontend modules.
- Tailwind-style utility composition or CSS modules, preserving the Horizon demo's dark command-center visual language.
- Motion can be used for panel entrance and accessibility-mode transitions, but realtime globe animation belongs to the Cesium loop.

Avoid in the first implementation:

- Full dynamic plugin marketplace.
- Multi-edition auth system.
- Prisma unless server-side relational workflows become necessary.
- Heavy charting libraries before the War Room data contract stabilizes.
- Complex 3D model LOD. Pancreatic center/resource layers are points, labels, heat bars, and routes, not aircraft/ship models.

## Target Frontend Directory Shape

When the frontend starts, use a structure like:

```text
app/
  page.tsx
  layout.tsx
  globals.css
components/
  shell/
    WarRoomShell.tsx
    WarRoomHeader.tsx
    TacticalTabBar.tsx
    TopFilters.tsx
    LeftNav.tsx
    RightIntelPanel.tsx
    BottomTimeline.tsx
    SyncActivityLog.tsx
  modules/
    dashboard/
      HomeSituationOverview.tsx
      OsintIngestTerminal.tsx
      EventStreamList.tsx
      EventEvidencePanel.tsx
    resources/
      GlobalResourceAtlas.tsx
      RegionResourceBoard.tsx
      CountryResourceBoard.tsx
      CityResourceCommand.tsx
      DepartmentResourceList.tsx
      CenterProfilePanel.tsx
      CenterLatestIntelTimeline.tsx
    risk/
      GreyRiskRadar.tsx
      MythCorrectionCard.tsx
    aimdt/
      AiMdtChamber.tsx
    forecast/
      ForecastAuditLog.tsx
    report/
      ReportComposer.tsx
    profile/
      ProfileConfigPanel.tsx
      RagConnectorManager.tsx
      WeChatRadarPanel.tsx
  globe/
    GlobeView.tsx
    GlobeLayerController.tsx
    GlobeInteractionBridge.tsx
    CameraPresetBar.tsx
  panels/
    RegionResourcePanel.tsx
    CountryResourcePanel.tsx
    CityResourcePanel.tsx
    CenterDetailDrawer.tsx
    DailyIntelQueue.tsx
    SourceEvidencePanel.tsx
  cards/
    IndexStrip.tsx
    SignalCard.tsx
core/
  data/
    DataBus.ts
    WsClient.ts
    supabaseClient.ts
    streamContracts.ts
  globe/
    EntityRenderer.ts
    AnimationLoop.ts
    CameraController.ts
    primitiveProjection.ts
  state/
    store.ts
    dataSlice.ts
    globeSlice.ts
    layersSlice.ts
    uiSlice.ts
    filtersSlice.ts
    timelineSlice.ts
  domain/
    pancreaticCenterTypes.ts
    globalResourceTypes.ts
    cityResourceTypes.ts
    evidenceTypes.ts
```

This mirrors the useful WorldWideView separation while keeping domain modules explicit for pancreatic intelligence.

## Frontend Shell

The first screen should be a War Room, not a landing page:

```text
WarRoomShell
  -> WarRoomHeader for logo, live status, source count, UTC time, config/login
  -> TacticalTabBar for main modules
  -> IndexStrip for PCI, CTOI, DTI, DHI, TRI
  -> active module content
  -> SyncActivityLog footer
```

Reference mapping:

- Horizon `App.tsx` layout maps to the first product shell and module set.
- WorldWideView `AppShell` maps to `WarRoomShell`.
- WorldWideView `LayerPanel` maps to a medical intelligence layer controller.
- WorldWideView `EntityInfoCard` maps to `CenterDetailDrawer` and `SourceEvidencePanel`.
- WorldWideView `Timeline` maps to `BottomTimeline`.
- WorldWideView `DataBusSubscriber` maps to a headless bridge between stream events and the Zustand store.

## State Slices

Use fewer slices than WorldWideView at first:

| Slice | Responsibility |
| --- | --- |
| `dataSlice` | `entitiesByPlugin`, source snapshots, loading/error state. |
| `globeSlice` | camera preset, selected entity anchor, FPS/debug flags. |
| `layersSlice` | enabled layers: centers, trials, academic activity, complication support, WeChat signals. |
| `uiSlice` | selected region/country/city/center/event, open panels, drawer state. |
| `filtersSlice` | time range, region, disease stage, molecular subtype, evidence level, review status. |
| `timelineSlice` | current time window and playback mode for event layers. |
| `profileSlice` | patient local profile, saved intelligence records, elderly mode, PIN state. |
| `configSlice` | RAG connectors, WeChat radar settings, source registry filters. |

Do not add favorites, marketplace, auth, or plugin-settings slices until a real user workflow requires them.

## Frontend Data Flow

The main realtime flow:

```text
Seeder / stream server
  -> { type: "data", pluginId, payload: RealtimeGeoEntity[] }
  -> WsClient
  -> DataBus.emit("dataUpdated")
  -> dataSlice.entitiesByPlugin[pluginId]
  -> visible entity selector
  -> EntityRenderer
  -> Cesium primitive collections
  -> AnimationLoop
```

The slower snapshot flow:

```text
Supabase tables / materialized views
  -> server route or Supabase client
  -> normalized frontend DTO
  -> dataSlice
  -> panels, charts, detail drawers
```

The global resource drilldown flow:

```text
click region cluster
  -> DataBus.emit("regionSelected")
  -> uiSlice.selectedRegion
  -> fetch RegionResourceView
  -> RegionResourcePanel shows country rows, coverage, latest intelligence
  -> click country
  -> fetch CountryResourceView
  -> click city
  -> fetch CityResourceView
  -> CityResourcePanel groups hospitals/departments by category
  -> click center
  -> CenterDetailDrawer + CenterLatestIntelTimeline + SourceEvidencePanel
```

## 3D Globe Design

Use Cesium/Resium for the production globe because the reference project proves the performance path:

- Use `PointPrimitiveCollection` for center and city points.
- Use `LabelCollection` for selected/hovered labels.
- Use `BillboardCollection` only when icon semantics matter.
- Avoid the Cesium Entity API for large live layers.
- Keep a single animation loop for culling and selection effects.
- Apply manual horizon culling before rendering backside points.
- Keep dynamic and static layers separate.

pposintel-specific visual encoding:

- Heat controls point size and gradient color.
- Heat means public signal strength only.
- Data quality controls opacity or outline style.
- Source verification status appears in detail panels, not as a map ranking.
- Surgery/patient volume numbers only appear with metric definition, period, source URL, and verification status.

## Frontend Modules

| Module | MVP behavior |
| --- | --- |
| War Room | Horizon-style dashboard: globe surveillance, OSINT ingest terminal, event stream, evidence panel. |
| Globe Layers | Regions, countries, cities, treatment centers, trials, academic activity, complication support, WeChat signals. |
| Global Resource Atlas | Region-country-city-center navigation, coverage quality, latest intelligence, and source evidence. |
| Region Resource Panel | Region coverage, country rows, center counts, source freshness, and latest intelligence. |
| Country Resource Panel | Country-level city clusters, center list, trial/regulatory signal, and recent intelligence. |
| City Resource Panel | Horizon-style city selector, cockpit stats, resource/center toggle, resource rows, heat bars. |
| Center Detail Drawer | Center profile panel with source-backed capabilities, complication support, evidence, and latest intelligence. |
| Source Evidence Panel | Shows sources and conflict/verification notes. |
| Daily Intel Queue | Shows recent intelligence events and review status. |
| AI-MDT Review | Opens review task and consensus status for high-risk outputs. |
| Report Center | Lists generated daily/weekly/city/center reports. |
| Grey Risk Radar | Shows high-risk social/agent/supplement/unverified-therapy claims, factual critique, doctor questions. |
| Forecast Audit | Tracks prior clinical predictions against later verification status. |
| Profile Config | Local profile, saved items, RAG connectors, WeChat radar, source registry, elderly mode, PIN lock. |

## Backend Interfaces Needed By Frontend

Phase 1 API/data contracts:

- `RealtimeGeoEntity[]` stream for `pancreatic-centers`.
- Supabase read model for regions, countries, cities, centers, departments, source links, heat snapshots, and center-linked latest intelligence.
- Region/country/city/center DTOs grouped by resource hierarchy.
- City resource DTO grouped by resource category.
- Event queue DTO for daily intelligence.
- Index snapshot DTO for PCI, CTOI, DTI, DHI, TRI.

The first quick demo can run with:

- Static seeder runner from `scripts/run_realtime_seeder.mjs`.
- Supabase tables already created in migrations.
- Local JSON snapshot under `data/pancreatic_centers/`.

## Implementation Phases

### Phase 1A: Static Frontend Shell

- Add Next.js skeleton.
- Port the Horizon demo shell as the visual blueprint, but split it into modules.
- Load `pancreatic-centers`, `IntelEvent`, `RegionResourceView`, `CountryResourceView`, `CityResourceView`, `CenterProfileView`, `CenterLatestIntelView`, `GreyRiskSignal`, and `ForecastAuditSignal` from local JSON/TS fixtures.
- Render the Horizon static globe only as a temporary placeholder if Cesium is not added in the same step.
- Build the event evidence panel, global resource atlas, city resource panel, center latest-intelligence timeline, risk radar, AI-MDT placeholder, report composer, and profile/config modules.

### Phase 1B: Cesium Globe

- Add Cesium/Resium.
- Copy Cesium assets or configure `CESIUM_BASE_URL`.
- Port `realtime/runtime/` concepts into typed frontend modules.
- Render center points via primitive collections.
- Add camera presets and region-country-city-center drilldown.

### Phase 1C: Supabase Demo Read Model

- Read treatment centers and city resources from Supabase.
- Add source evidence drawer.
- Add public signal heat bars.
- Keep sensitive or unverified volume metrics behind evidence labels.

### Phase 2: Realtime Server

- Add local stream server or data-engine runner.
- Connect `WsClient` to `/stream`.
- Add incremental layer updates and timeline snapshots.

## Open Decisions

- Whether to start with Next.js + Cesium immediately or build a static shell first.
- Whether Prisma is needed or Supabase JS is sufficient for the first frontend.
- Whether the first deployment target is Vercel, Supabase-hosted assets plus API, or Docker.
- Whether to add auth before or after the quick demo.

## Current Recommendation

Use the Horizon demo as the main product/UI blueprint and implement it in Next.js + TypeScript + Zustand + Cesium/Resium. Keep Supabase as the backend foundation. Port the existing dependency-free realtime runtime into typed frontend modules when the frontend skeleton is created.
