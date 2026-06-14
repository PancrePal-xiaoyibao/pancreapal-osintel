# Supabase Keepalive

Supabase free projects may be paused after inactivity. Current Supabase source material indicates free projects can pause after 1 week of inactivity, so this project should run a small keepalive request every 2-3 days.

## Script

Run:

```bash
bash scripts/supabase_keepalive.sh
```

The script performs a read-only REST request:

```text
GET /rest/v1/sources?select=id&limit=1
```

It uses the publishable key from:

1. `.env.keepalive`
2. `.env.local`
3. `.env`
4. `.env.development`
5. `.env.production`
6. `.env.example`

Shell environment variables override file values. Use an explicit file when adapting this script to another project:

```bash
bash scripts/supabase_keepalive.sh --env-file /path/to/other-project/.env --dry-run
```

or:

```bash
PPOSINTEL_KEEPALIVE_ENV_FILE=/path/to/other-project/.env bash scripts/supabase_keepalive.sh --dry-run
```

Recommended variables for this project:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Project-specific keepalive overrides:

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

No service role key is required. `sb_secret_*` keys are rejected by the script. Supabase's current examples use publishable keys for new applications; legacy anon keys are only supported here for compatibility with older projects.

Dry-run config validation:

```bash
bash scripts/supabase_keepalive.sh --dry-run
```

## Skill

The reusable project-local skill lives at:

```text
skills/supabase-keepalive/
```

Skill entrypoint:

```text
skills/supabase-keepalive/SKILL.md
```

Reusable script:

```bash
bash skills/supabase-keepalive/scripts/keepalive.sh
```

The root-level script `scripts/supabase_keepalive.sh` is a thin wrapper around the skill script.

Skill validation:

```text
python3 /Users/qinxiaoqiang/.agents/skills/.system/skill-creator/scripts/quick_validate.py skills/supabase-keepalive
```

## Suggested Schedule

Run every 3 days. This is intentionally more frequent than the current 1-week inactivity window.

Cron example:

```cron
17 9 */3 * * cd /Users/qinxiaoqiang/Downloads/pposintel && bash scripts/supabase_keepalive.sh >> logs/supabase_keepalive.log 2>&1
```

Before using that cron entry, create the log directory:

```bash
mkdir -p logs
```

## Notes

- If the project is already paused, the request can fail with a project-paused error; it must be restored from Supabase.
- A failed keepalive should be investigated, not ignored.
- The script only reads public data protected by RLS.
