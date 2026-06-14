---
name: supabase-keepalive
description: Use when setting up, running, validating, or scheduling a Supabase free project keepalive check to reduce inactivity-pause risk using a read-only REST request and a publishable key.
---

# Supabase Keepalive

## Purpose

Keep a Supabase free project active by running a small read-only request on a schedule. Use this when the user asks to prevent a Supabase project from being paused, refreshed, kept alive, checked periodically, or monitored for inactivity.

## Safety Rules

- Use a publishable key only.
- Do not use or request a service role key for keepalive.
- Prefer a read-only table query such as `sources?select=id&limit=1`.
- Treat failures as real signals; do not hide them.
- If the project is already paused, tell the user it must be restored from Supabase.

## Inputs

Read credentials from environment variables first, then from env files. Existing shell environment values win over file values.

Env file order:

1. `.env.keepalive`
2. `.env.local`
3. `.env`
4. `.env.development`
5. `.env.production`
6. `.env.example`

Use `PPOSINTEL_KEEPALIVE_ENV_FILE=/path/to/.env` or `--env-file /path/to/.env` to load one or more explicit files before the default list. Separate multiple files with `:`.

Recommended variables for this project:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Explicit keepalive overrides:

```text
PPOSINTEL_KEEPALIVE_SUPABASE_URL=
PPOSINTEL_KEEPALIVE_SUPABASE_KEY=
PPOSINTEL_KEEPALIVE_SUPABASE_PUBLISHABLE_KEY=
PPOSINTEL_KEEPALIVE_TABLE=sources
PPOSINTEL_KEEPALIVE_SELECT=id
```

Compatible URL aliases:

```text
SUPABASE_URL=
SUPABASE_PROJECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
VITE_SUPABASE_URL=
PUBLIC_SUPABASE_URL=
NUXT_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_URL=
```

Compatible key aliases:

```text
SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PUBLISHABLE_KEY=
PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
VITE_SUPABASE_ANON_KEY=
PUBLIC_SUPABASE_ANON_KEY=
NUXT_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Use publishable keys for new projects. Legacy anon keys are supported for older Supabase examples. Secret keys are rejected.

## Workflow

1. Confirm the project URL and publishable key are available.
2. Run `bash skills/supabase-keepalive/scripts/keepalive.sh --dry-run` to verify config resolution without network.
3. Run `bash skills/supabase-keepalive/scripts/keepalive.sh`.
4. If it succeeds, recommend scheduling every 2-3 days.
5. If it fails, report the HTTP status and response body.

## Schedule Example

```cron
17 9 */3 * * cd /Users/qinxiaoqiang/Downloads/pposintel && bash skills/supabase-keepalive/scripts/keepalive.sh >> logs/supabase_keepalive.log 2>&1
```

Create the log directory first:

```bash
mkdir -p logs
```

## Validation

Expected success output:

```text
Supabase keepalive ok: sources 2026-06-13T04:12:42Z
```

Expected dry-run output:

```text
Supabase keepalive config ok: url_var=NEXT_PUBLIC_SUPABASE_URL key_var=NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY endpoint=https://example.supabase.co/rest/v1/sources?select=id&limit=1
```
