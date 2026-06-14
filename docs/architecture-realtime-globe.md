# Realtime Globe Architecture

## Reference

`arch_reference1.md` summarizes `silvertakana/worldwideview`, which has been cloned locally for inspection at:

```text
references/worldwideview
```

The reference project is a full real-time geospatial engine using Next.js, CesiumJS, Resium, Zustand, WebSocket streams, a typed DataBus, and independent `seeder.mjs` data sources. For `pposintel`, the useful pattern is the data contract and rendering pipeline, not the full marketplace/plugin platform.

## Reference Technical Stack

WorldWideView stack observed from the local clone:

| Layer | Stack |
| --- | --- |
| Frontend app | Next.js App Router, React, TypeScript |
| 3D rendering | CesiumJS, Resium |
| State | Zustand slices |
| Realtime bus | Custom DataBus, WebSocket client |
| Data engine | Seeder runner, Redis-backed live snapshots, WebSocket `/stream`, REST `/api/:id` |
| Database/auth | Postgres/Prisma, Supabase SDK, NextAuth |
| Deployment | Docker Compose, standalone Next.js output |
| Testing | Vitest, Playwright |

pposintel should adopt the first five rows for the globe data path. Database/auth/deployment choices stay simpler during the quick demo.

## Adopted Pattern

Use the same single-direction flow:

```text
Public sources / Supabase snapshots / WeChat monitor / manual research data
  -> seeder.mjs or scheduled collector
  -> stream payload as flat RealtimeGeoEntity[]
  -> DataBus
  -> globe store
  -> primitive renderer
  -> Cesium globe animation loop
```

Reference flow mapping:

```text
WorldWideView:
Seeder -> data engine -> /stream -> WsClient -> DataBus -> Zustand -> EntityRenderer -> Cesium

pposintel:
Pancreatic source collectors -> seeder.mjs/Supabase snapshot -> stream or read model -> DataBus -> store -> primitive projection -> Cesium
```

## What We Keep

- Flat geospatial payload arrays for first version.
- Kebab-case plugin IDs, e.g. `pancreatic-centers`.
- A typed event bus between stream client and globe store.
- WebSocket stream as the realtime path, REST/Supabase as the slower snapshot path.
- Cesium primitives for production 3D rendering.
- Camera presets for `global`, first regions, first countries, and high-priority city drilldowns.
- Manual horizon culling and batched primitive updates once entity counts grow.
- Headless subscriber pattern: stream/UI events are bridged into state outside visual components.
- Zustand-style slices for data, layers, globe, UI, filters, and timeline.

## What We Do Not Adopt Yet

- Full WorldWideView plugin marketplace.
- Multi-edition auth system.
- Dynamic CDN plugin loading.
- Thirty independent stream connections.
- Complex model LOD for aircraft/ships.
- Heavy frontend monorepo structure before the `pposintel` data contracts stabilize.
- Prisma-first backend design before Supabase quick demo read models prove insufficient.

## pposintel Plugin IDs

| Plugin ID | Purpose | First source |
| --- | --- | --- |
| `pancreatic-centers` | Region, country, city, and candidate-center point layer. | `data/pancreatic_centers/pancreatic_center_snapshot_2026-06-13.json` |
| `pancreatic-events` | Guideline, trial, drug, meeting, and source event points. | `intelligence_events` and source registry |
| `wechat-public-signals` | Public-account article/activity heat points. | MPText monitor output |
| `complication-support` | City/center support capability layer. | `hospital_source.md` derived tables |

## Realtime Entity Contract

Schema: `schemas/realtime-geo-entity.schema.json`

Required fields:

- `id`
- `pluginId`
- `entityType`
- `latitude`
- `longitude`
- `timestamp`
- `label`
- `source`

Important boundary:

- `heat` means public signal strength only.
- `dataQuality` must be `public`, `estimated`, `mixed`, or `unverified`.
- Surgery and treatment volumes belong in nested `properties` or detail queries with metric definition, period, source URL, and verification status. Do not display naked numbers on the globe.

## Seeder Contract

Use a WorldWideView-compatible lightweight shape:

```js
export default {
  name: "pancreatic-centers",
  interval: 300000,
  fetch: async () => {
    return [
      {
        id: "center:cn_shanghai_fudan_cancer_pancreatic_surgery",
        pluginId: "pancreatic-centers",
        entityType: "center",
        latitude: 31.196,
        longitude: 121.448,
        timestamp: new Date().toISOString(),
        label: "Fudan University Shanghai Cancer Center",
        layer: "treatment-centers",
        heat: 98,
        dataQuality: "public",
        source: {
          type: "official_department_page",
          url: "https://www.shca.org.cn/department/intro/id/317/pid/11.shtml",
          accessedAt: "2026-06-13",
          verificationStatus: "single_source"
        },
        properties: {}
      }
    ];
  }
};
```

The first project-local example is:

```text
realtime/seeders/pancreatic-centers/seeder.mjs
```

It reads the dated pancreatic center snapshot and emits flat entities. This keeps the future data-engine path open without requiring Docker/Redis today.

Validation and local stream output:

```bash
node scripts/validate_realtime_seeders.mjs
node scripts/run_realtime_seeder.mjs --plugin pancreatic-centers --once
```

## Stream Message Contract

When a realtime server is added, each message should use:

```json
{
  "type": "data",
  "pluginId": "pancreatic-centers",
  "payload": []
}
```

`payload` should be a flat `RealtimeGeoEntity[]` array in the first implementation. If a future collector sends `{ items: [] }`, the frontend must implement a mapper explicitly.

## Globe Animation Contract

The Cesium globe should follow these constraints:

- Use `PointPrimitiveCollection`, `BillboardCollection`, `LabelCollection`, and `PolylineCollection` directly for high-volume layers.
- Avoid Cesium Entity API for large live layers.
- Do not use `HeightReference.CLAMP_TO_GROUND` for dynamic labels.
- Use `size`, `outlineWidth`, and `outlineColor` only for point primitives.
- Use `iconScale` for billboards; do not mix point-only properties into billboard options.
- Bind physics/time updates to the Cesium clock or a single animation loop, not scattered React effects.
- Split dynamic and static entities; update dynamic entities every frame and static culling less frequently.
- Apply manual horizon culling with a dot-product against Earth radius before rendering backside points.
- Use camera presets for global regions, countries, and city/center drilldown.

The current repository contains a dependency-free animation boundary under `realtime/runtime/`:

- `DataBus.mjs` for typed event names.
- `WsClient.mjs` for stream subscription, reconnect/backoff, and flat payload enforcement.
- `globe-store.mjs` for plugin-keyed entity state.
- `primitive-projection.mjs` for heat-to-point style projection.
- `AnimationLoop.mjs` for dynamic/static buckets and horizon culling.
- `camera-presets.mjs` for first clinical-region camera presets.

This runtime is intentionally not a Cesium renderer. The future frontend should map `projectedPoints` into `PointPrimitiveCollection`, `BillboardCollection`, and labels inside the selected Next.js/Cesium layer.

## Camera Presets

Recommended first presets:

| Preset | Lat | Lon | Altitude | Purpose |
| --- | ---: | ---: | ---: | --- |
| `global` | 20 | 0 | 20000000 | Default world state |
| `asia-pacific` | 28 | 115 | 9000000 | Asia-Pacific resource overview |
| `north-america` | 39 | -98 | 8000000 | North America resource overview |
| `europe` | 50 | 15 | 6000000 | Europe resource overview |
| `china` | 32 | 105 | 6000000 | China deep-coverage country view |
| `us` | 38 | -97 | 6000000 | US benchmark centers |
| `japan` | 36 | 138 | 3000000 | Japan benchmark centers |
| `shanghai` | 31.23 | 121.47 | 900000 | Shanghai city resource layer |
| `beijing` | 39.90 | 116.40 | 900000 | Beijing city resource layer |
| `chengdu` | 30.57 | 104.07 | 900000 | West China drilldown |
| `wuhan` | 30.59 | 114.31 | 900000 | Central China drilldown |

## Implementation Phasing

### Phase 0A: Current Repository

- Keep source-of-truth data in JSON/CSV/Supabase.
- Add seeder `.mjs` examples that emit render-ready entities.
- Add JSON schema validation for realtime entities.
- Add dependency-free DataBus, stream client, globe store, camera presets, primitive projection, and animation-loop boundary.
- Document DataBus, stream message, and Cesium animation rules.

### Phase 1: First Frontend

- Add Next.js + Cesium/Resium or Three.js/Cesium decision.
- Implement lightweight `DataBus`.
- Implement `WsClient` with reconnect/backoff.
- Render region/country/city/center points from `pancreatic-centers`.
- Add camera presets and region-country-city-center click drilldown.

### Phase 2: Performance

- Move from Entity API prototypes to primitive collections.
- Add horizon culling, chunked rendering, and stack/spiderifier logic.
- Add stream snapshots and incremental updates.

## Design Decision

Adopt a WorldWideView-inspired realtime geospatial pipeline, but keep `pposintel` medically scoped, source-verifiable, and Supabase-compatible. The immediate architecture is not a plugin marketplace; it is a focused global pancreatic tumor intelligence globe with realtime-compatible data contracts.
