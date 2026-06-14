# Realtime Runtime Skeleton

This directory contains the dependency-free runtime boundary that keeps `pposintel` aligned with the WorldWideView-style realtime globe pipeline without introducing a frontend framework before the app stack is selected.

## Current Flow

```text
realtime/seeders/*/seeder.mjs
  -> RealtimeGeoEntity[]
  -> WebSocket message { type, pluginId, payload }
  -> RealtimeWsClient
  -> DataBus dataUpdated
  -> GlobeStore
  -> future Cesium primitive renderer
```

## Files

- `DataBus.mjs`: small event bus for `dataUpdated`, `cameraPreset`, `streamStatus`, and `streamError`.
- `WsClient.mjs`: WebSocket subscriber with reconnect/backoff and flat-payload enforcement.
- `globe-store.mjs`: framework-neutral entity cache keyed by plugin ID.
- `primitive-projection.mjs`: converts `RealtimeGeoEntity` records into render-safe point primitives and heat styles.
- `AnimationLoop.mjs`: dependency-free animation boundary with dynamic/static buckets and horizon culling.
- `camera-presets.mjs`: first camera presets for global, China, key Chinese cities, US, Japan, and Europe.

## Boundary

The future frontend should import or port these concepts into a Next.js/Cesium layer. This folder intentionally does not render Cesium yet. Rendering belongs in the selected frontend runtime and should use primitive collections, a single animation loop, and camera events from the DataBus.

## Seeder Runner

Use the runner to emit a WorldWideView-style stream message from any project seeder:

```bash
node scripts/run_realtime_seeder.mjs --plugin pancreatic-centers --once
```

The output is newline-delimited JSON:

```json
{"type":"data","pluginId":"pancreatic-centers","emittedAt":"...","payload":[]}
```
