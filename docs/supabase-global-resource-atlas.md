# Supabase Global Resource Atlas

## Purpose

This read model extends the existing geography schema into the global atlas hierarchy:

`Global -> Region -> Country -> City -> Center -> Latest Intelligence`

The authoritative medical and source records remain in Supabase source tables and generated fixtures. This schema adds stable read-side tables that the frontend can query without interpreting raw fixture structure on every screen.

## `geo_regions`

`geo_regions` exists because the atlas must show global coverage from day one, not only a China-first city list. Existing `geo_countries.region` is a text label; it is useful for coarse grouping but not enough for a navigable region board.

The new table gives each region a stable `region_key`, display name, ordering, summary, `coverage_status`, `data_quality`, and metadata. `geo_countries.region_key` links countries into those boards while preserving the existing country table.

## `center_latest_intelligence`

`center_latest_intelligence` links treatment-center profiles to `intelligence_events`.

The table stores the event relationship at center, city, country, and region levels so a center profile can show current source-backed signals without duplicating full event content. `event_scope` records whether an item is center-specific, city-level, country-level, or regional. `relevance_note` explains why the event is attached to that center profile.

This keeps center pages aligned with the required product path: a center is not only a static institution record; it has a latest-intelligence section backed by an event record.

Public reads are constrained to linked `intelligence_events` whose `review_status` is `approved`. This prevents unpublished or review-pending events from becoming visible through the atlas read model before they are visible through the canonical event policy.

## `coverage_quality_snapshots`

Sparse coverage is not the same as low quality. A region can be intentionally broad or early-stage while still using verified sources for the records it has.

`coverage_quality_snapshots` separates:

- `coverage_status`: how complete the atlas coverage is for an entity.
- `data_quality`: how reliable the currently stored data is.
- `source_count` and `verified_source_count`: how much evidence backs the entity.
- `metric_conflict_count`: whether public metrics disagree and need review.
- `latest_intel_at` and `last_verified_at`: freshness signals.

This lets the frontend label a region as `seed` or `partial` without implying the known centers are unreliable.

## Fixture Relationship

The generated fixture `data/global_resource_atlas/global_resource_atlas_2026-06-13.json` is the current contract example for the first atlas slice. It contains the region-country-city-center hierarchy and should guide seed/import logic after this read model is approved.

The migration does not import that fixture. It only creates database structures needed to store and query the same hierarchy. A later seed/import task should map fixture `regionKey`, `countryKey`, `cityKey`, center records, coverage labels, source evidence, and latest intelligence into Supabase rows.

## Remote Migration Safety

Do not apply `supabase/migrations/009_global_resource_atlas_schema.sql` to a remote Supabase project without explicit confirmation.

Reason:

- It alters `public.geo_countries` by adding `region_key`.
- It creates new public read policies.
- It assumes the prior migrations exist, especially `public.geo_data_quality`, `public.treatment_centers`, `public.intelligence_events`, and `public.set_updated_at()`.
- Remote environments may contain manually adjusted data or policies that need review before schema extension.

The intended workflow is static SQL review first, then an explicit apply decision for the confirmed Supabase project.

## Constraints

The migration keeps the read model narrow enough for reliable frontend and realtime projections:

- `coverage_status` is limited to `seed`, `partial`, `verified`, `stale`, and `unknown`.
- `coverage_quality_snapshots.entity_type` is limited to `global`, `region`, `country`, `city`, and `center`.
- `center_latest_intelligence.event_scope` is limited to `global`, `region`, `country`, `city`, `center`, `department`, `trial`, and `drug`.
- `center_latest_intelligence` requires both a treatment center and an intelligence event, and prevents duplicate cards for the same center/event/scope combination.
