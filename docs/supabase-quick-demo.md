# Supabase Quick Demo Plan

## Decision

Use Supabase hosted Postgres free tier for the first online quick demo.

This keeps the MVP online without managing a database server and preserves the future path to:

- `pgvector` retrieval.
- Supabase Auth.
- Row Level Security.
- Next.js dashboard integration.

## Current Remote Status

The dedicated Supabase project has been created and migrated.

| Field | Value |
| --- | --- |
| Project name | `pposintel` |
| Project ID | `dngmthqacazkqhtykyvy` |
| Organization | `samqin123's Org` |
| Organization ID | `whwucpkvgsssxlpzwbgw` |
| Region | `ap-southeast-1` |
| Status | `ACTIVE_HEALTHY` |
| Project URL | `https://dngmthqacazkqhtykyvy.supabase.co` |
| Publishable key | `sb_publishable_a6iatxhYWYY6Xpnjy6awkA_ZH_em8V6` |

## Recommended Project

Created Supabase project:

```text
pposintel
```

Recommended region:

```text
ap-southeast-1
```

Rationale: it matches several existing projects and is reasonably close for Asia-based use.

## MCP Automation Boundary

The Supabase MCP can create a new project, but project creation requires:

1. Choosing the target organization.
2. Checking the project cost for that organization.
3. Explicit user confirmation of the cost.

Available organizations:

| Organization ID | Name | Plan | Recommended use |
| --- | --- | --- | --- |
| `whwucpkvgsssxlpzwbgw` | `samqin123's Org` | free | Recommended for `pposintel`, because the active project `xiaohongka` is already here. |
| `vercel_icfg_AdLdMm50fjxWZrDEJ6slzztk` | `samqin123's projects` | free | Possible, but appears tied to Vercel-created projects. |

The MCP can also restore an inactive existing project, but the target project must be confirmed first. Current inactive projects are:

| Project ID | Name | Region | Organization |
| --- | --- | --- | --- |
| `couyttdqgcnsovgkhkzh` | `huggingface-owu` | `ap-southeast-1` | `samqin123's Org` |
| `uiukexcfpnqfpfvyjbvn` | `clical-trials` | `ap-southeast-1` | `samqin123's Org` |
| `ebdsezqaqofddzdlxwch` | `xiaoyibao-volunteer` | `ap-southeast-2` | `samqin123's Org` |
| `syavfwgayjvzxggwxpci` | `supabase-claret-island` | `us-east-1` | `samqin123's projects` |

Do not apply `pposintel` migrations to `xiaohongka` unless the user explicitly chooses that project.

## Quick Demo Scope

The first migration creates:

- Sources.
- Raw documents.
- Intelligence events.
- Event entities.
- Drugs.
- Trials.
- Doctor and center signals.
- Review tasks.
- Model reviews.
- Consensus reports.
- Reports.
- Index scores.

Geography migrations add:

- Countries.
- Cities.
- Treatment centers.
- Geographic score snapshots.
- Render-ready map layer snapshots.
- Foreign keys from events, trials, and center signals to geographic entities.

The migration also enables:

- `pgcrypto` for UUID generation.
- `vector` in the `extensions` schema.
- Updated timestamp trigger.
- Basic indexes.
- RLS enabled on all public demo tables.
- Read-only anonymous policies for approved public data.

## Applied Migrations

| Migration | Status |
| --- | --- |
| `001_core_schema` | applied |
| `002_seed_demo` | applied |
| `003_geography_globe_schema` | applied |
| `004_seed_geography_demo` | applied |
| `005_advisor_fixes` | applied |
| `006_move_vector_extension` | applied |

## Verification

- Public schema tables: 17.
- RLS enabled on all demo tables.
- Seed rows: 5 sources, 1 intelligence event, 3 model reviews, 1 consensus report, 2 countries, 6 cities, 3 treatment centers, 4 map layer snapshots.
- Security advisor: no current lints after moving `vector` to `extensions`.
- Performance advisor: only unused-index info remains, expected before real traffic.
- Keepalive script: [scripts/supabase_keepalive.sh](/Users/qinxiaoqiang/Downloads/pposintel/scripts/supabase_keepalive.sh), verified successfully on 2026-06-13.

## Deployment Options

### Option A: Supabase SQL Editor

1. Create or select the `pposintel` project.
2. Open SQL Editor.
3. Run [001_core_schema.sql](/Users/qinxiaoqiang/Downloads/pposintel/supabase/migrations/001_core_schema.sql).
4. Run [002_seed_demo.sql](/Users/qinxiaoqiang/Downloads/pposintel/supabase/migrations/002_seed_demo.sql).
5. Run [003_geography_globe_schema.sql](/Users/qinxiaoqiang/Downloads/pposintel/supabase/migrations/003_geography_globe_schema.sql).
6. Run [004_seed_geography_demo.sql](/Users/qinxiaoqiang/Downloads/pposintel/supabase/migrations/004_seed_geography_demo.sql).
7. Confirm tables exist in Table Editor.

### Option B: Supabase MCP

Current project has already been migrated via MCP. For a fresh project:

1. List tables before migration.
2. Apply `001_core_schema`.
3. Apply `002_seed_demo`.
4. Apply `003_geography_globe_schema`.
5. Apply `004_seed_geography_demo`.
6. Run security and performance advisors.
7. Get project URL and publishable key for frontend configuration.

## Supabase Account and Project Notes

Visible organizations from MCP:

| Organization ID | Name | Plan |
| --- | --- | --- |
| `whwucpkvgsssxlpzwbgw` | `samqin123's Org` | free |
| `vercel_icfg_AdLdMm50fjxWZrDEJ6slzztk` | `samqin123's projects` | free |

Visible active project:

| Project ID | Name | Region | Status |
| --- | --- | --- | --- |
| `dngmthqacazkqhtykyvy` | `pposintel` | `ap-southeast-1` | `ACTIVE_HEALTHY` |
| `ivyzhfcggneaktkvzvuz` | `xiaohongka` | `ap-southeast-1` | `ACTIVE_HEALTHY` |

MCP did not expose the login email or user UUID. The strongest account clue currently visible is `samqin123`.

Local machine check:

- `supabase` CLI is not installed.
- No `~/.supabase` local login cache was found.

## Environment Variables

Frontend quick demo should use:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Do not commit service role keys.
