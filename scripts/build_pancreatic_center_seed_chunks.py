#!/usr/bin/env python3
"""Build smaller SQL seed chunks for Supabase MCP execution."""

from __future__ import annotations

import json
from pathlib import Path

from generate_pancreatic_center_snapshot import (
    ROOT,
    SNAPSHOT_JSON,
    sql_date,
    sql_jsonb,
    sql_literal,
    sql_text_array,
)


OUT_DIR = ROOT / "data/pancreatic_centers/sql_chunks"
SNAPSHOT_KEY = "pancreatic_center_snapshot_20260613"


def chunks(items: list[dict], size: int) -> list[list[dict]]:
    return [items[i : i + size] for i in range(0, len(items), size)]


def write(path: Path, sql: str) -> None:
    path.write_text(sql.rstrip() + "\n", encoding="utf-8")


def center_values(rows: list[dict]) -> str:
    values = []
    for row in rows:
        values.append(
            "  ({})".format(
                ", ".join(
                    [
                        sql_literal(row["center_key"]),
                        sql_literal(row["region_group"]),
                        sql_literal(row["country"]),
                        sql_literal(row.get("province_state")),
                        sql_literal(row.get("city")),
                        sql_literal(row["hospital_name"]),
                        sql_literal(row.get("center_name")),
                        sql_literal(row.get("department_name")),
                        sql_literal(row.get("center_type")),
                        sql_literal(row.get("candidate_signal_rank")),
                        sql_literal(row.get("candidate_tier")),
                        sql_literal(row.get("public_signal_heat")),
                        sql_literal(row.get("heat_note")),
                        sql_text_array(row.get("capability_tags") or []),
                        sql_text_array(row.get("complication_support_tags") or []),
                        sql_literal(row.get("trial_signal")),
                        sql_jsonb(row.get("wechat_signal") or {}),
                        sql_literal(row.get("scale_summary")),
                        sql_literal(row.get("verification_status")),
                        sql_literal(row.get("confidence")),
                        sql_literal(row.get("notes")),
                        sql_jsonb({}),
                    ]
                )
            )
        )
    return ",\n".join(values)


def source_values(rows: list[dict]) -> str:
    values = []
    for row in rows:
        values.append(
            "  ({})".format(
                ", ".join(
                    [
                        sql_literal(row["center_key"]),
                        sql_literal(row["source_key"]),
                        sql_literal(row["source_title"]),
                        sql_literal(row["source_url"]),
                        sql_literal(row["source_type"]),
                        sql_date(row.get("source_published_at")),
                        sql_literal(row["accessed_at"]) + "::date",
                        sql_literal(row["evidence_summary"]),
                        sql_literal(row["verification_status"]),
                        sql_literal(row["confidence"]),
                        sql_jsonb({}),
                    ]
                )
            )
        )
    return ",\n".join(values)


def metric_values(rows: list[dict]) -> str:
    values = []
    for row in rows:
        values.append(
            "  ({})".format(
                ", ".join(
                    [
                        sql_literal(row["center_key"]),
                        sql_literal(row["metric_key"]),
                        sql_literal(row["metric_name"]),
                        sql_literal(row["metric_value"]),
                        sql_literal(row["metric_unit"]),
                        sql_literal(row["metric_period"]),
                        sql_literal(row["metric_scope"]),
                        sql_literal(row["metric_definition"]),
                        sql_literal(row["source_url"]),
                        sql_literal(row["source_type"]),
                        sql_literal(row["verification_status"]),
                        sql_literal(row["confidence"]),
                        sql_literal(row.get("notes")),
                        sql_jsonb({}),
                    ]
                )
            )
        )
    return ",\n".join(values)


def main() -> None:
    data = json.loads(SNAPSHOT_JSON.read_text(encoding="utf-8"))
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    snap = data["snapshot"]
    metadata = {
        "collection_notes": snap.get("collection_notes", []),
        "artifact_json": str(SNAPSHOT_JSON.relative_to(ROOT)),
        "artifact_markdown": "data/pancreatic_centers/pancreatic_center_snapshot_2026-06-13.md",
        "artifact_csv": "data/pancreatic_centers/pancreatic_center_snapshot_2026-06-13.csv",
        "center_count": len(data["centers"]),
        "source_count": len(data["sources"]),
        "metric_count": len(data["metrics"]),
    }

    write(
        OUT_DIR / "001_snapshot.sql",
        "\n".join(
            [
                "begin;",
                "insert into public.pancreatic_center_snapshots (snapshot_key, snapshot_date, collected_at, title, scope_note, methodology_note, disclaimer, metadata) values (",
                "  "
                + ", ".join(
                    [
                        sql_literal(snap["snapshot_key"]),
                        sql_literal(snap["snapshot_date"]) + "::date",
                        sql_literal(snap["collected_at"]) + "::timestamptz",
                        sql_literal(snap["title"]),
                        sql_literal(snap["scope_note"]),
                        sql_literal(snap["methodology_note"]),
                        sql_literal(snap["disclaimer"]),
                        sql_jsonb(metadata),
                    ]
                ),
                ") on conflict (snapshot_key) do update set snapshot_date = excluded.snapshot_date, collected_at = excluded.collected_at, title = excluded.title, scope_note = excluded.scope_note, methodology_note = excluded.methodology_note, disclaimer = excluded.disclaimer, metadata = excluded.metadata;",
                f"delete from public.pancreatic_center_snapshot_centers where snapshot_id = (select id from public.pancreatic_center_snapshots where snapshot_key = {sql_literal(SNAPSHOT_KEY)});",
                "commit;",
            ]
        ),
    )

    for idx, rows in enumerate(chunks(data["centers"], 8), start=1):
        write(
            OUT_DIR / f"010_centers_{idx:02d}.sql",
            f"""with snapshot as (
  select id from public.pancreatic_center_snapshots where snapshot_key = {sql_literal(SNAPSHOT_KEY)}
)
insert into public.pancreatic_center_snapshot_centers (
  snapshot_id, center_key, region_group, country, province_state, city, hospital_name, center_name, department_name, center_type,
  candidate_signal_rank, candidate_tier, public_signal_heat, heat_note, capability_tags, complication_support_tags,
  trial_signal, wechat_signal, scale_summary, verification_status, confidence, notes, metadata
)
select
  snapshot.id, v.center_key, v.region_group, v.country, v.province_state, v.city, v.hospital_name, v.center_name, v.department_name, v.center_type,
  v.candidate_signal_rank, v.candidate_tier, v.public_signal_heat, v.heat_note, v.capability_tags, v.complication_support_tags,
  v.trial_signal, v.wechat_signal, v.scale_summary, v.verification_status, v.confidence, v.notes, v.metadata
from snapshot
cross join (values
{center_values(rows)}
) as v(
  center_key, region_group, country, province_state, city, hospital_name, center_name, department_name, center_type,
  candidate_signal_rank, candidate_tier, public_signal_heat, heat_note, capability_tags, complication_support_tags,
  trial_signal, wechat_signal, scale_summary, verification_status, confidence, notes, metadata
)
on conflict (snapshot_id, center_key) do update set
  region_group = excluded.region_group,
  country = excluded.country,
  province_state = excluded.province_state,
  city = excluded.city,
  hospital_name = excluded.hospital_name,
  center_name = excluded.center_name,
  department_name = excluded.department_name,
  center_type = excluded.center_type,
  candidate_signal_rank = excluded.candidate_signal_rank,
  candidate_tier = excluded.candidate_tier,
  public_signal_heat = excluded.public_signal_heat,
  heat_note = excluded.heat_note,
  capability_tags = excluded.capability_tags,
  complication_support_tags = excluded.complication_support_tags,
  trial_signal = excluded.trial_signal,
  wechat_signal = excluded.wechat_signal,
  scale_summary = excluded.scale_summary,
  verification_status = excluded.verification_status,
  confidence = excluded.confidence,
  notes = excluded.notes,
  metadata = excluded.metadata;""",
        )

    for idx, rows in enumerate(chunks(data["sources"], 10), start=1):
        write(
            OUT_DIR / f"020_sources_{idx:02d}.sql",
            f"""with center_map as (
  select c.id, c.center_key
  from public.pancreatic_center_snapshot_centers c
  join public.pancreatic_center_snapshots s on s.id = c.snapshot_id
  where s.snapshot_key = {sql_literal(SNAPSHOT_KEY)}
)
insert into public.pancreatic_center_snapshot_sources (
  snapshot_center_id, source_key, source_title, source_url, source_type, source_published_at, accessed_at,
  evidence_summary, verification_status, confidence, metadata
)
select
  center_map.id, v.source_key, v.source_title, v.source_url, v.source_type, v.source_published_at, v.accessed_at,
  v.evidence_summary, v.verification_status, v.confidence, v.metadata
from center_map
join (values
{source_values(rows)}
) as v(
  center_key, source_key, source_title, source_url, source_type, source_published_at, accessed_at,
  evidence_summary, verification_status, confidence, metadata
) on center_map.center_key = v.center_key
on conflict (snapshot_center_id, source_key) do update set
  source_title = excluded.source_title,
  source_url = excluded.source_url,
  source_type = excluded.source_type,
  source_published_at = excluded.source_published_at,
  accessed_at = excluded.accessed_at,
  evidence_summary = excluded.evidence_summary,
  verification_status = excluded.verification_status,
  confidence = excluded.confidence,
  metadata = excluded.metadata;""",
        )

    for idx, rows in enumerate(chunks(data["metrics"], 10), start=1):
        write(
            OUT_DIR / f"030_metrics_{idx:02d}.sql",
            f"""with center_map as (
  select c.id, c.center_key
  from public.pancreatic_center_snapshot_centers c
  join public.pancreatic_center_snapshots s on s.id = c.snapshot_id
  where s.snapshot_key = {sql_literal(SNAPSHOT_KEY)}
)
insert into public.pancreatic_center_volume_metrics (
  snapshot_center_id, metric_key, metric_name, metric_value, metric_unit, metric_period, metric_scope, metric_definition,
  source_url, source_type, verification_status, confidence, notes, metadata
)
select
  center_map.id, v.metric_key, v.metric_name, v.metric_value, v.metric_unit, v.metric_period, v.metric_scope, v.metric_definition,
  v.source_url, v.source_type, v.verification_status, v.confidence, v.notes, v.metadata
from center_map
join (values
{metric_values(rows)}
) as v(
  center_key, metric_key, metric_name, metric_value, metric_unit, metric_period, metric_scope, metric_definition,
  source_url, source_type, verification_status, confidence, notes, metadata
) on center_map.center_key = v.center_key
on conflict (snapshot_center_id, metric_key) do update set
  metric_name = excluded.metric_name,
  metric_value = excluded.metric_value,
  metric_unit = excluded.metric_unit,
  metric_period = excluded.metric_period,
  metric_scope = excluded.metric_scope,
  metric_definition = excluded.metric_definition,
  source_url = excluded.source_url,
  source_type = excluded.source_type,
  verification_status = excluded.verification_status,
  confidence = excluded.confidence,
  notes = excluded.notes,
  metadata = excluded.metadata;""",
        )

    print(f"wrote {len(list(OUT_DIR.glob('*.sql')))} chunks to {OUT_DIR.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
