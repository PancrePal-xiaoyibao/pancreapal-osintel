# pposintel

Pancreas Intel War Room is an OSINT-style intelligence workspace for pancreatic tumor treatment tracking. The product goal is to turn public clinical signals into traceable, patient-readable, doctor-checkable intelligence.

![Pancreas Intel War Room demo](https://picgo-1302991947.cos.ap-guangzhou.myqcloud.com/images/20260614081724657.png)

The current first product slice is a global pancreatic treatment resource atlas inside a Horizon-style War Room:

- Global -> Region -> Country -> City -> Pancreatic Center -> Latest Intelligence.
- China deep coverage plus US, Japan, and Europe broad coverage from day one.
- Source-backed center profiles with metrics, evidence, complication support, trials/research, and latest intelligence.
- No naked surgery/patient-volume numbers; all volume fields require `VolumeMetric`.

## Current Baseline

- Design authority index: [docs/design-doc-index.md](docs/design-doc-index.md)
- Historical long-form design background: [design.md](design.md)
- External reference list: [source_reference.md](source_reference.md)
- Development memory: [memory.md](memory.md)
- Progress log: [docs/progress.md](docs/progress.md)
- City treatment resource spec: [hospital_source.md](hospital_source.md)
- WeChat MP source spec: [docs/wechat-mp-source-requirements.md](docs/wechat-mp-source-requirements.md)
- Active design-development plan: [docs/plans/2026-06-14-global-resource-atlas-implementation.md](docs/plans/2026-06-14-global-resource-atlas-implementation.md)

## Working Directories

- `docs/`: decisions, progress, handoff notes, architecture, product specs.
- `schemas/`: versioned data contracts.
- `data/sources/`: curated source registry and source seeds.
- `realtime/seeders/`: WorldWideView-style `.mjs` collectors that emit render-ready geospatial payloads.
- `realtime/runtime/`: dependency-free realtime DataBus, stream client, globe store, camera presets, and animation-loop boundary.
- `scripts/`: validation and operational helper scripts.
- `templates/reports/`: reusable report output formats.
- `src/pposintel/`: future application package.
- `tests/`: future test suite.

## Realtime Globe Checks

Validate realtime seeder contracts:

```bash
node scripts/validate_realtime_seeders.mjs
```

Emit one stream-compatible message:

```bash
node scripts/run_realtime_seeder.mjs --plugin pancreatic-centers --once
```

Run the dependency-free realtime runtime smoke test:

```bash
node tests/realtime_runtime.test.mjs
```

## MVP Workflow

1. Collect authoritative source metadata.
2. Normalize sources into the source registry.
3. Ingest candidate intelligence events.
4. Parse entities, treatment context, and evidence fields.
5. Score candidate events with transparent index rules.
6. Generate a daily brief with source citations and uncertainty notes.
7. Queue high-risk or patient-facing outputs for manual review.
