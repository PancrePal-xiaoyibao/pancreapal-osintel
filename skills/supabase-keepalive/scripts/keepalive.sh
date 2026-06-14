#!/usr/bin/env bash
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DRY_RUN="${PPOSINTEL_KEEPALIVE_DRY_RUN:-0}"

usage() {
  cat <<'USAGE'
Usage: keepalive.sh [--env-file PATH[:PATH...]] [--root PATH] [--table TABLE] [--select COLUMNS] [--dry-run]

Runs a read-only Supabase REST request using a publishable or legacy anon key.

Options:
  --env-file PATH[:PATH...]  Load one or more explicit env files before defaults.
  --root PATH               Project root used to find default env files.
  --table TABLE             PostgREST table path to query. Default: sources.
  --select COLUMNS          Select expression. Default: id.
  --dry-run                 Resolve configuration and print the endpoint only.
USAGE
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --env-file)
      if [ "$#" -lt 2 ]; then
        echo "Missing value for --env-file" >&2
        exit 2
      fi
      PPOSINTEL_KEEPALIVE_ENV_FILE="$2"
      export PPOSINTEL_KEEPALIVE_ENV_FILE
      shift 2
      ;;
    --root)
      if [ "$#" -lt 2 ]; then
        echo "Missing value for --root" >&2
        exit 2
      fi
      PPOSINTEL_ROOT="$2"
      export PPOSINTEL_ROOT
      shift 2
      ;;
    --table)
      if [ "$#" -lt 2 ]; then
        echo "Missing value for --table" >&2
        exit 2
      fi
      PPOSINTEL_KEEPALIVE_TABLE="$2"
      export PPOSINTEL_KEEPALIVE_TABLE
      shift 2
      ;;
    --select)
      if [ "$#" -lt 2 ]; then
        echo "Missing value for --select" >&2
        exit 2
      fi
      PPOSINTEL_KEEPALIVE_SELECT="$2"
      export PPOSINTEL_KEEPALIVE_SELECT
      shift 2
      ;;
    --dry-run)
      DRY_RUN="1"
      PPOSINTEL_KEEPALIVE_DRY_RUN="1"
      export PPOSINTEL_KEEPALIVE_DRY_RUN
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

ROOT_DIR="${PPOSINTEL_ROOT:-$(cd "$SKILL_DIR/../.." && pwd)}"

URL_CANDIDATES=(
  PPOSINTEL_KEEPALIVE_SUPABASE_URL
  SUPABASE_URL
  SUPABASE_PROJECT_URL
  NEXT_PUBLIC_SUPABASE_URL
  VITE_SUPABASE_URL
  PUBLIC_SUPABASE_URL
  NUXT_PUBLIC_SUPABASE_URL
  EXPO_PUBLIC_SUPABASE_URL
)

KEY_CANDIDATES=(
  PPOSINTEL_KEEPALIVE_SUPABASE_KEY
  PPOSINTEL_KEEPALIVE_SUPABASE_PUBLISHABLE_KEY
  SUPABASE_PUBLISHABLE_KEY
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  VITE_SUPABASE_PUBLISHABLE_KEY
  PUBLIC_SUPABASE_PUBLISHABLE_KEY
  NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  SUPABASE_ANON_KEY
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  VITE_SUPABASE_ANON_KEY
  PUBLIC_SUPABASE_ANON_KEY
  NUXT_PUBLIC_SUPABASE_ANON_KEY
  EXPO_PUBLIC_SUPABASE_ANON_KEY
)

is_allowed_env_key() {
  case "$1" in
    PPOSINTEL_ROOT|PPOSINTEL_KEEPALIVE_ENV_FILE|PPOSINTEL_KEEPALIVE_TABLE|PPOSINTEL_KEEPALIVE_SELECT|PPOSINTEL_KEEPALIVE_DRY_RUN|PPOSINTEL_KEEPALIVE_SUPABASE_URL|PPOSINTEL_KEEPALIVE_SUPABASE_KEY|PPOSINTEL_KEEPALIVE_SUPABASE_PUBLISHABLE_KEY)
      return 0
      ;;
    SUPABASE_URL|SUPABASE_PROJECT_URL|SUPABASE_PUBLISHABLE_KEY|SUPABASE_ANON_KEY)
      return 0
      ;;
    NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY|NEXT_PUBLIC_SUPABASE_ANON_KEY)
      return 0
      ;;
    VITE_SUPABASE_URL|VITE_SUPABASE_PUBLISHABLE_KEY|VITE_SUPABASE_ANON_KEY)
      return 0
      ;;
    PUBLIC_SUPABASE_URL|PUBLIC_SUPABASE_PUBLISHABLE_KEY|PUBLIC_SUPABASE_ANON_KEY)
      return 0
      ;;
    NUXT_PUBLIC_SUPABASE_URL|NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY|NUXT_PUBLIC_SUPABASE_ANON_KEY)
      return 0
      ;;
    EXPO_PUBLIC_SUPABASE_URL|EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY|EXPO_PUBLIC_SUPABASE_ANON_KEY)
      return 0
      ;;
  esac

  return 1
}

load_env_file() {
  local file="$1"
  local line key value

  [ -f "$file" ] || return 0

  while IFS= read -r line || [ -n "$line" ]; do
    [[ "$line" =~ ^[[:space:]]*$ ]] && continue
    [[ "$line" =~ ^[[:space:]]*# ]] && continue

    if [[ "$line" =~ ^[[:space:]]*(export[[:space:]]+)?([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*=[[:space:]]*(.*)$ ]]; then
      key="${BASH_REMATCH[2]}"
      value="${BASH_REMATCH[3]}"

      is_allowed_env_key "$key" || continue

      if [[ "$value" == \"*\" && "$value" == *\" ]]; then
        value="${value:1:${#value}-2}"
      elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
        value="${value:1:${#value}-2}"
      fi

      if [ -n "$value" ] && [ -z "${!key:-}" ]; then
        export "$key=$value"
      fi
    fi
  done < "$file"
}

add_env_file_candidates() {
  local spec="$1"
  local old_ifs="$IFS"
  local file

  IFS=':'
  for file in $spec; do
    [ -n "$file" ] && ENV_FILES+=("$file")
  done
  IFS="$old_ifs"
}

resolve_first_set_name() {
  local name

  for name in "$@"; do
    if [ -n "${!name:-}" ]; then
      printf '%s' "$name"
      return 0
    fi
  done

  return 1
}

resolve_first_set_value() {
  local name

  for name in "$@"; do
    if [ -n "${!name:-}" ]; then
      printf '%s' "${!name}"
      return 0
    fi
  done

  return 1
}

print_candidates() {
  local first="1"
  local item

  for item in "$@"; do
    if [ "$first" = "1" ]; then
      printf '%s' "$item"
      first="0"
    else
      printf ', %s' "$item"
    fi
  done
}

RESOLVED_SUPABASE_URL=""
RESOLVED_SUPABASE_URL_VAR=""
RESOLVED_SUPABASE_KEY=""
RESOLVED_SUPABASE_KEY_VAR=""

capture_resolved_config() {
  local resolved_name

  if [ -z "$RESOLVED_SUPABASE_URL" ]; then
    resolved_name="$(resolve_first_set_name "${URL_CANDIDATES[@]}" || true)"
    if [ -n "$resolved_name" ]; then
      RESOLVED_SUPABASE_URL_VAR="$resolved_name"
      RESOLVED_SUPABASE_URL="${!resolved_name}"
    fi
  fi

  if [ -z "$RESOLVED_SUPABASE_KEY" ]; then
    resolved_name="$(resolve_first_set_name "${KEY_CANDIDATES[@]}" || true)"
    if [ -n "$resolved_name" ]; then
      RESOLVED_SUPABASE_KEY_VAR="$resolved_name"
      RESOLVED_SUPABASE_KEY="${!resolved_name}"
    fi
  fi
}

ENV_FILES=()
capture_resolved_config

if [ -n "${PPOSINTEL_KEEPALIVE_ENV_FILE:-}" ]; then
  add_env_file_candidates "$PPOSINTEL_KEEPALIVE_ENV_FILE"
fi
ENV_FILES+=(
  "$ROOT_DIR/.env.keepalive"
  "$ROOT_DIR/.env.local"
  "$ROOT_DIR/.env"
  "$ROOT_DIR/.env.development"
  "$ROOT_DIR/.env.production"
  "$ROOT_DIR/.env.example"
)

if [ -n "${PPOSINTEL_KEEPALIVE_ENV_FILE:-}" ]; then
  old_ifs="$IFS"
  IFS=':'
  for required_env_file in $PPOSINTEL_KEEPALIVE_ENV_FILE; do
    if [ -n "$required_env_file" ] && [ ! -f "$required_env_file" ]; then
      echo "Configured env file not found: ${required_env_file}" >&2
      exit 2
    fi
  done
  IFS="$old_ifs"
fi

for env_file in "${ENV_FILES[@]}"; do
  load_env_file "$env_file"
  capture_resolved_config
done

SUPABASE_URL_VAR="$RESOLVED_SUPABASE_URL_VAR"
SUPABASE_KEY_VAR="$RESOLVED_SUPABASE_KEY_VAR"
SUPABASE_URL="$RESOLVED_SUPABASE_URL"
SUPABASE_PUBLISHABLE_KEY="$RESOLVED_SUPABASE_KEY"
KEEPALIVE_TABLE="${PPOSINTEL_KEEPALIVE_TABLE:-sources}"
KEEPALIVE_SELECT="${PPOSINTEL_KEEPALIVE_SELECT:-id}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_PUBLISHABLE_KEY" ]; then
  {
    echo "Missing Supabase project URL or publishable/anon key."
    printf 'URL candidates: '
    print_candidates "${URL_CANDIDATES[@]}"
    printf '\nKey candidates: '
    print_candidates "${KEY_CANDIDATES[@]}"
    printf '\nUse --env-file PATH or PPOSINTEL_KEEPALIVE_ENV_FILE=PATH to load a non-default env file.\n'
  } >&2
  exit 2
fi

case "$SUPABASE_URL" in
  http://*|https://*)
    ;;
  *)
    echo "Supabase project URL must start with http:// or https://. Resolved from ${SUPABASE_URL_VAR}." >&2
    exit 2
    ;;
esac

case "$SUPABASE_PUBLISHABLE_KEY" in
  sb_secret_*)
    echo "Refusing to use a Supabase secret key for keepalive. Use a publishable or legacy anon key." >&2
    exit 2
    ;;
esac

case "$KEEPALIVE_TABLE" in
  *[!A-Za-z0-9_.-]*)
    echo "Invalid keepalive table path: ${KEEPALIVE_TABLE}" >&2
    exit 2
    ;;
esac

endpoint="${SUPABASE_URL%/}/rest/v1/${KEEPALIVE_TABLE}?select=${KEEPALIVE_SELECT}&limit=1"

if [ "$DRY_RUN" = "1" ]; then
  echo "Supabase keepalive config ok: url_var=${SUPABASE_URL_VAR} key_var=${SUPABASE_KEY_VAR} endpoint=${endpoint}"
  exit 0
fi

response_file="$(mktemp)"
trap 'rm -f "$response_file"' EXIT

http_code="$(
  curl -sS \
    -o "$response_file" \
    -w "%{http_code}" \
    -H "apikey: ${SUPABASE_PUBLISHABLE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_PUBLISHABLE_KEY}" \
    -H "Accept: application/json" \
    "$endpoint"
)"

if [ "$http_code" != "200" ]; then
  echo "Supabase keepalive failed: HTTP ${http_code}" >&2
  cat "$response_file" >&2
  exit 1
fi

echo "Supabase keepalive ok: ${KEEPALIVE_TABLE} $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
