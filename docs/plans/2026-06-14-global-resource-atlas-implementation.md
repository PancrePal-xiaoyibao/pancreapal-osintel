# Global Resource Atlas Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the first design-development slice for the global pancreatic treatment resource atlas, from authoritative docs and data contracts through Supabase read models, realtime projections, and the first frontend shell.

**Architecture:** Use the current global scope decision as the source of truth: `Global -> Region -> Country -> City -> Center -> Latest Intelligence`. Keep Supabase/source records authoritative, transform them into validated read-model fixtures, and emit realtime render projections only after data contracts pass. Do not copy Horizon's monolithic app or naked volume fields.

**Tech Stack:** Markdown docs, JSON Schema, Node `.mjs` validation/build scripts, Supabase/Postgres migrations, existing dependency-free realtime runtime, future Next.js App Router + TypeScript + Zustand + Cesium/Resium.

---

## Stage Gates

| Stage | Purpose | Exit Gate |
| --- | --- | --- |
| Stage 0 | Design authority and task baseline | Effective docs are indexed; README and handoff point to current global atlas scope. |
| Stage 1 | Data contracts and fixture generation | Global atlas DTO fixtures validate and preserve region-country-city-center hierarchy. |
| Stage 2 | Supabase read model | Migration exists for global atlas read models; local SQL review passes. |
| Stage 3 | Realtime projection | `RealtimeGeoEntity` supports region/country/city/center projections and tests pass. |
| Stage 4 | Frontend shell | Next.js shell renders War Room navigation and global atlas fixture views. |
| Stage 5 | Integration and safety | No naked volume fields; source evidence and latest intelligence are required on center profiles. |

## Task 1: Design Authority Index

**Files:**
- Create: `docs/design-doc-index.md`
- Modify: `README.md`
- Modify: `docs/handoff.md`
- Modify: `docs/progress.md`

**Step 1: Create design document index**

Create `docs/design-doc-index.md` with four sections:

```md
# Design Document Index

## Current Source Of Truth

1. `docs/design-review-global-resource-scope-2026-06-14.md`
2. `docs/product-brief.md`
3. `docs/mvp-roadmap.md`
4. `docs/architecture.md`
5. `docs/data-model.md`

## Implementation Specs

- `docs/dashboard-spec.md`
- `docs/frontend-architecture-draft.md`
- `docs/architecture-realtime-globe.md`
- `docs/compliance-boundaries.md`
- `docs/index-system.md`

## Module Specs

- `hospital_source.md`
- `docs/wechat-mp-source-requirements.md`
- `docs/module-3d-dashboard-evaluation.md`
- `docs/module-3ai-evaluation.md`
- `docs/horizon-demo-reference-analysis.md`

## Superseded Or Historical

- `docs/prd-architecture-review-2026-06-14.md`: geography conclusion superseded by global resource scope review.
- `design.md`: original long-form source, not current execution authority.
```

**Step 2: Update README**

Replace the old "first product slice is intentionally narrow" list with:

```md
The current first product slice is a global pancreatic treatment resource atlas inside a Horizon-style War Room:

- Global -> Region -> Country -> City -> Pancreatic Center -> Latest Intelligence.
- China deep coverage plus US, Japan, and Europe broad coverage from day one.
- Source-backed center profiles with metrics, evidence, complication support, trials/research, and latest intelligence.
- No naked surgery/patient-volume numbers; all volume fields require `VolumeMetric`.
```

**Step 3: Update handoff/progress**

Add a short entry pointing implementers to `docs/design-doc-index.md`.

**Step 4: Verify**

Run:

```bash
rg -n "Global -> Region -> Country -> City -> Pancreatic Center" README.md docs/design-doc-index.md docs/handoff.md docs/progress.md
```

Expected: at least `README.md` and `docs/design-doc-index.md` match.

**Step 5: Commit**

```bash
git add README.md docs/design-doc-index.md docs/handoff.md docs/progress.md
git commit -m "docs: add design authority index"
```

## Task 2: Global Atlas JSON Contracts

**Files:**
- Create: `schemas/global-resource-atlas.schema.json`
- Create: `tests/global_resource_contracts.test.mjs`
- Create: `data/global_resource_atlas/.gitkeep`

**Step 1: Define schema**

Create a single JSON Schema for a generated global atlas fixture:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://pposintel.local/schemas/global-resource-atlas.schema.json",
  "title": "Global Resource Atlas",
  "type": "object",
  "required": ["snapshotKey", "snapshotDate", "regions"],
  "additionalProperties": false,
  "properties": {
    "snapshotKey": { "type": "string", "minLength": 1 },
    "snapshotDate": { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}$" },
    "regions": {
      "type": "array",
      "minItems": 1,
      "items": { "$ref": "#/$defs/RegionResourceView" }
    }
  },
  "$defs": {
    "CoverageStatus": {
      "type": "string",
      "enum": ["seed", "partial", "verified", "stale", "unknown"]
    },
    "DataQuality": {
      "type": "string",
      "enum": ["public", "estimated", "mixed", "unverified"]
    },
    "SourceEvidenceRef": {
      "type": "object",
      "required": ["sourceKey", "title", "url", "sourceType", "accessedAt", "verificationStatus", "confidence"],
      "additionalProperties": true
    },
    "VolumeMetric": {
      "type": "object",
      "required": ["metricKey", "name", "value", "unit", "period", "scope", "definition", "sourceUrls", "sourceType", "verificationStatus", "confidence"],
      "additionalProperties": false
    },
    "LatestIntelEvent": {
      "type": "object",
      "required": ["eventKey", "title", "publishedAt", "scope", "reviewStatus", "sourceEvidence"],
      "additionalProperties": true
    },
    "CenterProfileView": {
      "type": "object",
      "required": ["centerKey", "name", "country", "city", "dataQuality", "coverageStatus", "sourceEvidence", "volumeMetrics", "latestIntelligence"],
      "additionalProperties": true
    },
    "CityResourceView": {
      "type": "object",
      "required": ["cityKey", "name", "country", "dataQuality", "coverageStatus", "centers"],
      "additionalProperties": true
    },
    "CountryResourceView": {
      "type": "object",
      "required": ["countryKey", "name", "regionKey", "dataQuality", "coverageStatus", "cities"],
      "additionalProperties": true
    },
    "RegionResourceView": {
      "type": "object",
      "required": ["regionKey", "name", "dataQuality", "coverageStatus", "countries"],
      "additionalProperties": true
    }
  }
}
```

**Step 2: Write failing test**

Create `tests/global_resource_contracts.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const schema = JSON.parse(await readFile("schemas/global-resource-atlas.schema.json", "utf8"));

assert.equal(schema.title, "Global Resource Atlas");
assert.ok(schema.$defs.RegionResourceView);
assert.ok(schema.$defs.CountryResourceView);
assert.ok(schema.$defs.CityResourceView);
assert.ok(schema.$defs.CenterProfileView);
assert.ok(schema.$defs.VolumeMetric);
assert.ok(schema.$defs.LatestIntelEvent);

console.log("global resource contract schema test passed");
```

**Step 3: Run test**

Run:

```bash
node tests/global_resource_contracts.test.mjs
```

Expected: PASS after schema exists.

**Step 4: Commit**

```bash
git add schemas/global-resource-atlas.schema.json tests/global_resource_contracts.test.mjs data/global_resource_atlas/.gitkeep
git commit -m "feat: add global atlas data contracts"
```

## Task 3: Global Atlas Fixture Builder

**Files:**
- Create: `scripts/build_global_resource_atlas.mjs`
- Create generated: `data/global_resource_atlas/global_resource_atlas_2026-06-13.json`
- Modify: `tests/global_resource_contracts.test.mjs`

**Step 1: Write failing test for generated fixture**

Extend `tests/global_resource_contracts.test.mjs`:

```js
const fixture = JSON.parse(await readFile("data/global_resource_atlas/global_resource_atlas_2026-06-13.json", "utf8"));

assert.equal(fixture.snapshotKey, "global_resource_atlas_2026-06-13");
assert.ok(fixture.regions.length >= 3);
assert.ok(fixture.regions.some((r) => r.regionKey === "asia-pacific"));
assert.ok(fixture.regions.some((r) => r.regionKey === "north-america"));
assert.ok(fixture.regions.some((r) => r.regionKey === "europe"));

const centers = fixture.regions.flatMap((r) =>
  r.countries.flatMap((c) => c.cities.flatMap((city) => city.centers))
);
assert.ok(centers.length >= 48);
assert.ok(centers.every((center) => Array.isArray(center.latestIntelligence)));
assert.ok(centers.every((center) => Array.isArray(center.volumeMetrics)));
```

Run it before building the script:

```bash
node tests/global_resource_contracts.test.mjs
```

Expected: FAIL because fixture does not exist.

**Step 2: Build transformer**

Implement `scripts/build_global_resource_atlas.mjs`:

- Read `data/pancreatic_centers/pancreatic_center_snapshot_2026-06-13.json`.
- Map `region_group`:
  - `china` and `japan` -> `asia-pacific`.
  - `us` -> `north-america`.
  - `europe` -> `europe`.
- Group by region, country, city.
- Create center objects with:
  - `centerKey`
  - `name`
  - `country`
  - `city`
  - `dataQuality`
  - `coverageStatus`
  - `publicSignalHeat`
  - `sourceEvidence`
  - `volumeMetrics`
  - `latestIntelligence: []`
- Never emit fields named `surgeryVolume`, `patientVolume`, `annualPatients`, or `annualSurgeries`.

**Step 3: Run builder**

Run:

```bash
node scripts/build_global_resource_atlas.mjs
```

Expected: writes `data/global_resource_atlas/global_resource_atlas_2026-06-13.json` and logs region/country/center counts.

**Step 4: Run tests**

Run:

```bash
node tests/global_resource_contracts.test.mjs
```

Expected: PASS.

**Step 5: Commit**

```bash
git add scripts/build_global_resource_atlas.mjs data/global_resource_atlas/global_resource_atlas_2026-06-13.json tests/global_resource_contracts.test.mjs
git commit -m "feat: build global resource atlas fixture"
```

## Task 4: Supabase Global Atlas Read Model

**Files:**
- Create: `supabase/migrations/009_global_resource_atlas_schema.sql`
- Create: `docs/supabase-global-resource-atlas.md`

**Step 1: Draft migration**

Create `009_global_resource_atlas_schema.sql` with:

```sql
create table if not exists public.geo_regions (
  region_key text primary key,
  name text not null,
  display_order integer not null default 0,
  summary text,
  coverage_status text not null default 'seed',
  data_quality public.geo_data_quality not null default 'mixed',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.geo_countries
  add column if not exists region_key text references public.geo_regions(region_key) on delete set null;

create table if not exists public.center_latest_intelligence (
  id uuid primary key default gen_random_uuid(),
  treatment_center_id uuid references public.treatment_centers(id) on delete cascade,
  region_key text references public.geo_regions(region_key) on delete set null,
  country_id uuid references public.geo_countries(id) on delete set null,
  city_id uuid references public.geo_cities(id) on delete set null,
  intelligence_event_id uuid references public.intelligence_events(id) on delete cascade,
  event_scope text not null,
  relevance_note text,
  created_at timestamptz not null default now()
);

create table if not exists public.coverage_quality_snapshots (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_key text not null,
  snapshot_date date not null default current_date,
  coverage_status text not null,
  source_count integer not null default 0,
  verified_source_count integer not null default 0,
  metric_conflict_count integer not null default 0,
  latest_intel_at timestamptz,
  last_verified_at timestamptz,
  data_quality public.geo_data_quality not null default 'mixed',
  metadata jsonb not null default '{}'::jsonb,
  unique (entity_type, entity_key, snapshot_date)
);
```

Also add indexes, RLS, and public read policies consistent with existing migrations.

**Step 2: Document read model**

Create `docs/supabase-global-resource-atlas.md` explaining:

- Why `geo_regions` exists.
- How `center_latest_intelligence` links center profiles to events.
- How `coverage_quality_snapshots` avoids interpreting sparse regions as low quality.
- Why remote migration should not be applied without confirmation.

**Step 3: Static SQL review**

Run:

```bash
rg -n "geo_regions|center_latest_intelligence|coverage_quality_snapshots|enable row level security|public can read" supabase/migrations/009_global_resource_atlas_schema.sql
```

Expected: all core tables and policies are present.

**Step 4: Commit**

```bash
git add supabase/migrations/009_global_resource_atlas_schema.sql docs/supabase-global-resource-atlas.md
git commit -m "feat: add global atlas supabase read model"
```

## Task 5: Realtime Region/Country Projection

**Files:**
- Modify: `schemas/realtime-geo-entity.schema.json`
- Modify: `scripts/validate_realtime_seeders.mjs`
- Modify: `realtime/seeders/pancreatic-centers/seeder.mjs`
- Modify: `tests/realtime_runtime.test.mjs`

**Step 1: Write failing test expectation**

Update `tests/realtime_runtime.test.mjs`:

```js
assert.ok(entities.some((entity) => entity.entityType === "region"));
assert.ok(entities.some((entity) => entity.entityType === "country"));
assert.ok(entities.some((entity) => entity.entityType === "city"));
assert.ok(entities.some((entity) => entity.entityType === "center"));
assert.ok(entities.length > 48);
```

Run:

```bash
node tests/realtime_runtime.test.mjs
```

Expected: FAIL before schema/seeder changes.

**Step 2: Update schema and validator**

Add `region` to:

- `schemas/realtime-geo-entity.schema.json` `entityType.enum`.
- `scripts/validate_realtime_seeders.mjs` `ENTITY_TYPES`.

Add optional `properties.regionKey`.

**Step 3: Update seeder**

Modify `realtime/seeders/pancreatic-centers/seeder.mjs` to emit:

- Region entities.
- Country entities.
- City entities.
- Existing center entities.

Rules:

- Region/country/city heat is average or max of child public signal heat, but label as public signal only.
- Region/country/city source should point to the snapshot artifact or summary source.
- Center entities remain unchanged except for adding `properties.regionKey`.

**Step 4: Run validation**

Run:

```bash
node scripts/validate_realtime_seeders.mjs
node tests/realtime_runtime.test.mjs
```

Expected: both PASS.

**Step 5: Commit**

```bash
git add schemas/realtime-geo-entity.schema.json scripts/validate_realtime_seeders.mjs realtime/seeders/pancreatic-centers/seeder.mjs tests/realtime_runtime.test.mjs
git commit -m "feat: emit global atlas realtime projections"
```

## Task 6: Configuration Contracts

**Files:**
- Create: `schemas/app-configuration.schema.json`
- Create: `data/config/demo_app_config.json`
- Create: `tests/app_configuration_contracts.test.mjs`

**Step 1: Define config surfaces**

Schema must include:

- `modelProviders`
- `ragConnectors`
- `sourceFilters`
- `wechatMonitor`
- `translation`
- `patientLocalProfile`
- `savedCenters`
- `elderlyMode`
- `pinGate`
- `reportSafety`

Hard rules:

- Demo config may contain placeholder keys only.
- No real API keys.
- RAG connectors include `status`, `lastTestedAt`, and `diagnostics`.

**Step 2: Add test**

Test:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const config = JSON.parse(await readFile("data/config/demo_app_config.json", "utf8"));

assert.ok(Array.isArray(config.modelProviders));
assert.ok(Array.isArray(config.ragConnectors));
assert.ok(config.sourceFilters);
assert.ok(config.reportSafety);
assert.ok(!JSON.stringify(config).includes("99e5afd00089488083247a4c7e350e77"));
assert.ok(!JSON.stringify(config).includes("sb_secret_"));

console.log("app configuration contracts test passed");
```

**Step 3: Run test**

Run:

```bash
node tests/app_configuration_contracts.test.mjs
```

Expected: PASS.

**Step 4: Commit**

```bash
git add schemas/app-configuration.schema.json data/config/demo_app_config.json tests/app_configuration_contracts.test.mjs
git commit -m "feat: add app configuration contracts"
```

## Task 7: Frontend Shell Scaffold

**Files:**
- Create: `package.json`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `components/shell/WarRoomShell.tsx`
- Create: `components/modules/resources/GlobalResourceAtlas.tsx`
- Create: `components/modules/resources/RegionResourceBoard.tsx`
- Create: `components/modules/resources/CountryResourceBoard.tsx`
- Create: `components/modules/resources/CenterProfilePanel.tsx`
- Create: `components/modules/resources/CenterLatestIntelTimeline.tsx`
- Create: `core/domain/globalResourceTypes.ts`

**Step 1: Bootstrap minimal Next.js**

Create `package.json` with scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "latest",
    "react": "latest",
    "react-dom": "latest",
    "zustand": "latest"
  },
  "devDependencies": {
    "typescript": "latest",
    "@types/node": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest"
  }
}
```

Do not add Cesium in this task unless needed for build. Use static fixture views first.

**Step 2: Add typed domain**

In `core/domain/globalResourceTypes.ts`, define:

- `CoverageStatus`
- `DataQuality`
- `RegionResourceView`
- `CountryResourceView`
- `CityResourceView`
- `CenterProfileView`
- `CenterLatestIntelView`
- `VolumeMetric`
- `SourceEvidenceRef`

No type should include naked volume fields.

**Step 3: Build shell**

`WarRoomShell` must render:

- Header.
- Top nav.
- Index strip placeholder.
- Active global atlas module.
- Sync/activity footer.

**Step 4: Build global atlas static view**

`GlobalResourceAtlas` must read the generated JSON fixture and render:

- Region cards.
- Country rows.
- Center count.
- Coverage status.
- Latest intelligence count.
- First center profile sample.

**Step 5: Run build**

Run:

```bash
npm install
npm run build
```

Expected: build passes.

If dependency install is blocked by network sandbox, request escalation and rerun the same command.

**Step 6: Commit**

```bash
git add package.json app components core
git commit -m "feat: scaffold global atlas frontend shell"
```

## Task 8: Validation Guardrails

**Files:**
- Create: `scripts/validate_no_naked_volume_fields.mjs`
- Modify: `tests/global_resource_contracts.test.mjs`
- Modify: `package.json`

**Step 1: Create guardrail script**

Script should scan:

- `data/global_resource_atlas/**/*.json`
- `components/**/*.tsx`
- `core/**/*.ts`

Reject field names:

- `surgeryVolume`
- `patientVolume`
- `annualPatients`
- `annualSurgeries`

Allow these only in docs/comments if needed:

- `VolumeMetric`
- `volumeMetrics`

**Step 2: Add test/script command**

Add package script:

```json
"validate:guardrails": "node scripts/validate_no_naked_volume_fields.mjs"
```

**Step 3: Run validation**

Run:

```bash
node scripts/validate_no_naked_volume_fields.mjs
node tests/global_resource_contracts.test.mjs
npm run build
```

Expected: all pass.

**Step 4: Commit**

```bash
git add scripts/validate_no_naked_volume_fields.mjs tests/global_resource_contracts.test.mjs package.json
git commit -m "test: enforce source-safe volume fields"
```

## Task 9: Final Integration Documentation

**Files:**
- Modify: `docs/progress.md`
- Modify: `docs/handoff.md`
- Modify: `docs/git-log.md`
- Modify: `memory.md`

**Step 1: Update docs**

Record:

- Global atlas contracts added.
- Fixture builder added.
- Supabase migration created but not remotely applied unless confirmed.
- Realtime projections extended to region/country/city/center.
- Frontend shell created if Task 7 was executed.
- Guardrail validation status.

**Step 2: Run final verification**

Run:

```bash
node scripts/validate_realtime_seeders.mjs
node tests/realtime_runtime.test.mjs
node tests/global_resource_contracts.test.mjs
node tests/app_configuration_contracts.test.mjs
node scripts/validate_no_naked_volume_fields.mjs
npm run build
```

Expected: all pass. If `npm run build` cannot run because dependencies were not installed, record the exact blocker in `docs/handoff.md`.

**Step 3: Commit**

```bash
git add docs/progress.md docs/handoff.md docs/git-log.md memory.md
git commit -m "docs: update global atlas implementation handoff"
```

## Task Ordering

Execute in this order:

1. Task 1.
2. Task 2.
3. Task 3.
4. Task 4.
5. Task 5.
6. Task 6.
7. Task 8.
8. Task 7.
9. Task 9.

Reason: contracts and guardrails must exist before the frontend shell. This prevents Horizon mock fields or China-only assumptions from leaking into implementation.

## Out Of Scope For This Plan

- Remote Supabase migration application.
- Real external web crawling.
- Real model calls.
- Production-grade auth/secret vault.
- Full Cesium renderer implementation.
- Doctor or hospital ranking.
- Full-text WeChat/article redistribution.

## Execution Options

Plan complete and saved to `docs/plans/2026-06-14-global-resource-atlas-implementation.md`.

Two execution options:

1. Subagent-Driven (this session) - dispatch fresh worker per task, review between tasks, fast iteration.
2. Parallel Session (separate) - open a new session with executing-plans and run with checkpoints.

