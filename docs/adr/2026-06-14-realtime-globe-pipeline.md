# ADR: Realtime Globe Pipeline

## Status

Accepted

## Date

2026-06-14

## Context

`arch_reference1.md` evaluates WorldWideView, a realtime geospatial intelligence engine with CesiumJS, Resium, Zustand, WebSocket streams, DataBus, and independent `seeder.mjs` collectors.

`pposintel` already adopted a 3D Globe War Room concept, but the current project is still in Phase 0 data contracts and Supabase demo setup. There is no production frontend runtime yet.

## Decision

Adopt the WorldWideView-inspired pipeline shape:

```text
seeder.mjs -> stream payload -> DataBus -> store -> primitive renderer -> Cesium animation loop
```

Do not adopt the full WorldWideView plugin marketplace, edition system, dynamic CDN plugin loading, or complex model LOD in the first implementation.

## Implementation Rules

- First realtime data shape is flat `RealtimeGeoEntity[]`.
- First seeder is `realtime/seeders/pancreatic-centers/seeder.mjs`.
- Schema is `schemas/realtime-geo-entity.schema.json`.
- The future frontend should use a small typed DataBus and a WebSocket client with reconnect/backoff.
- Globe rendering should use Cesium primitives for high-volume live layers.
- Heat remains public signal strength, not treatment quality or hospital ranking.
- Surgery and patient-volume details require metric definition, period, source URL, source type, and verification status before display.

## Consequences

- The current repository gains a realtime-compatible data contract without prematurely introducing a large frontend monorepo.
- The future frontend can plug into a predictable stream contract.
- The architecture stays compatible with Supabase snapshots and `.mjs` public-source collectors.
- The project avoids carrying WorldWideView's non-medical marketplace complexity.

## Reference

- `arch_reference1.md`
- `docs/architecture-realtime-globe.md`
- Local ignored clone: `references/worldwideview`
