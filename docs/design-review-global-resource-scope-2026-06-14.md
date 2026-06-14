# Global Resource Scope And Design Review

## Status

Review date: 2026-06-14.

This document supersedes the earlier China-first quick-demo interpretation. The first pancreatic-center resource module should be globally scoped from the beginning.

The correct first-scope model is:

```text
Region -> Country -> City -> Pancreatic Center -> Latest Intelligence
```

The first version can be broad and uneven in verification depth, but it must not be structurally China-only.

## Design Correction

`references/horizon-workspace` is still useful for shell, visual style, and static module composition. However, Horizon under-specifies the global pancreatic-center resource product:

- It emphasizes city command centers but does not make `region -> country -> city -> center` the primary information architecture.
- It does not define a global region directory or country-level resource dashboard.
- It does not connect center profiles to recent intelligence events as a first-class section.
- It uses hardcoded center and volume fields rather than source-backed global read models.

The project design must therefore adopt Horizon's UI language but upgrade the resource module into a global pancreatic-treatment-resource atlas.

## Round 1: Functional Completeness Review

| Area | Current status | Gap | Required design correction |
| --- | --- | --- | --- |
| Global resource coverage | Local data already contains China, US, Japan, and Europe centers. Docs still describe China-first. | Scope mismatch. Users expect global resource discovery from first version. | Make global resource coverage the first resource-module scope, with region/country/city drilldown. |
| Region layer | `geo_countries.region` exists as a text field, but no product-level `Region` view is defined. | UI cannot present global regions as first-class navigation. | Add `GeoRegion` / `RegionResourceView` contract. |
| Country layer | `geo_countries` exists. | Country resource dashboard is not specified. | Add country summary cards: center count, verified centers, trial signals, latest intelligence, data coverage. |
| City layer | City resource panel is detailed for China. | City UI assumes hospital/department-style Chinese workflow and lacks international adaptation. | Keep the resource grouping model, but allow country-specific categories and source types. |
| Center profile | `CenterProfileView` exists conceptually. | Center profile lacks mandatory latest intelligence and source freshness sections. | Add center intelligence timeline, recent publications/trials/news/source updates, and source evidence tabs. |
| Latest intelligence | Event queue exists globally. | Events are not explicitly attached to region/country/city/center profile surfaces. | Add `CenterLatestIntelView` and geospatial event linking rules. |
| Global comparison | Geographic indices exist. | Comparison can look like ranking. | Use source coverage, data quality, and public-signal comparison; avoid "best center" ranking. |
| User actions | Report center exists. | No explicit actions from center page. | Add actions: save center, compare sources, create consultation question sheet, add source to review queue. |

Functional MVP must include:

- Global region selector.
- Country resource board.
- City resource board.
- Individual center profile.
- Latest intelligence section on every center profile.
- Source evidence drawer on every center and metric.
- Coverage/data-quality badges at every geography level.

## Round 2: Data System And Data-Flow Review

### Required Data Hierarchy

```text
GeoRegion
  -> GeoCountry
    -> GeoCity
      -> TreatmentCenter
        -> HospitalDepartment / CenterServiceLine
        -> VolumeMetric
        -> SourceEvidenceRef
        -> LatestIntelEvent[]
```

### Current Data Strength

The existing `data/pancreatic_centers/pancreatic_center_snapshot_2026-06-13.json` already supports a global first pass:

- China: 32 centers.
- United States: 6 centers.
- Japan: 4 centers.
- Europe: 6 centers across Italy, Germany, Sweden, and United Kingdom.

This is enough for a broad global prototype if the UI clearly labels coverage depth and verification quality.

### Missing Data Contracts

Add or formalize:

- `GeoRegion`: stable region key, label, country count, center count, coverage status.
- `RegionResourceView`: region summary, country rows, heat layers, latest intelligence.
- `CountryResourceView`: country profile, city rows, center count, source coverage, trial and regulatory signals.
- `CityResourceView`: city resources grouped by treatment/support category, localized to source availability.
- `CenterProfileView`: source-backed center profile with metrics, services, complication support, trial/research signals, and latest intelligence.
- `CenterLatestIntelView`: reviewed intelligence events linked to a center or inherited from city/country/region context.
- `CoverageQualitySnapshot`: completeness and verification status by region/country/city/center.

### Required Data Flow

```text
Source registry
  -> source fetch / manual research / WeChat monitor / trial APIs / PubMed / official pages
  -> entity resolution for region, country, city, center, department
  -> source evidence records
  -> volume metrics and capability tags
  -> intelligence events with geo and center links
  -> review / AI-MDT when needed
  -> Supabase read models and JSON snapshots
  -> RealtimeGeoEntity render projections
  -> frontend region-country-city-center views
```

### Entity Linking Rules

`intelligence_events` should support:

- `region_key`
- `country_id`
- `city_id`
- `treatment_center_id`
- `department_key`
- `source_id`
- `event_scope`: `global`, `region`, `country`, `city`, `center`, `department`, `trial`, `drug`
- `published_at`
- `review_status`

Center profile latest intelligence should show:

- Direct center events.
- Department/source events under the same center.
- Active or recently changed trials linked to the center or city.
- High-value country/region signals relevant to the center's disease area.

### Data Quality Rules

Every geography level must expose:

- `coverage_status`: `seed`, `partial`, `verified`, `stale`, `unknown`.
- `source_count`.
- `verified_source_count`.
- `last_verified_at`.
- `latest_intel_at`.
- `metric_conflict_count`.
- `data_quality`: `public`, `estimated`, `mixed`, `unverified`.

The UI must show low-coverage regions as "coverage in progress", not as empty or low-quality medical areas.

## Round 3: Interaction, UI/UE, Sources, And Configuration Review

### Required UI/UE Flow

Primary navigation:

```text
Global Atlas
  -> Region board
  -> Country board
  -> City board
  -> Center profile
  -> Latest intelligence / Source evidence / Report actions
```

The resource module should use a persistent breadcrumb:

```text
Global > Asia-Pacific > China > Shanghai > Fudan University Shanghai Cancer Center
```

Core interaction states:

- Global map with region clusters.
- Region board with country list and top recently updated centers.
- Country board with city clusters, source coverage, trial signals, and recent intelligence.
- City board with grouped treatment/support resources.
- Center profile drawer/page with tabs:
  - Overview.
  - Capabilities.
  - Metrics and evidence.
  - Complication support.
  - Trials and research.
  - Latest intelligence.
  - Public accounts and source links.
  - Patient question sheet.

### UI Gaps To Fix

| UI area | Gap | Fix |
| --- | --- | --- |
| Top tab label | "全球/城市" skips region and country. | Rename mental model to "全球胰腺治疗资源图谱". |
| City selector | Too city-first. | Add region and country selectors before city. |
| Right detail panel | Center profile exists but latest intelligence is not mandatory. | Add latest intelligence timeline as a core center tab. |
| Heat bars | Risk of being read as rank. | Pair every heat bar with "public signal only" and data-quality badge. |
| Empty states | Missing for sparse global regions. | Show "coverage in progress", source-request action, and last scan time. |
| Language/localization | International centers have English/local source names. | Support local name, English name, translated summary, and source language. |

### Information Sources Review

Global resource coverage needs region-specific source adapters:

- Official hospital and department pages.
- ClinicalTrials.gov and other clinical trial registries.
- PubMed and journal/meeting records.
- Guideline and society pages.
- Regulatory and access signals.
- Hospital newsrooms and press releases.
- Foundation/nonprofit center directories where relevant.
- WeChat/MPText for China public-account metadata.
- Manual expert/source registry review for hard-to-parse centers.

Source records must carry:

- Region, country, city, and center linkage.
- Source type and jurisdiction.
- Language.
- Access date.
- Update cadence.
- Copyright/redistribution boundary.
- Verification status.

### Auxiliary Configuration Review

Configuration must support the global atlas, not only local patient preferences.

Required configuration surfaces:

- Model provider settings for AI-MDT and report drafting.
- RAG connector registry with custom endpoint support.
- Source registry filters by region, country, language, source type, cadence, and authority.
- WeChat monitor settings for China source collection.
- Trial/source adapter settings and freshness thresholds.
- Translation/summarization preferences for non-Chinese sources.
- Patient local profile, saved centers, saved intelligence events, elderly mode, and PIN gate.
- Safety settings for report export and patient-facing output.

Production caveat:

- API keys and RAG credentials must not be treated as safe in plain `localStorage`.
- The demo can expose configuration UI, but the production path needs secure secret storage or a trusted backend proxy.

## Updated Design Decision

The first pancreatic-center resource implementation is:

```text
Global resource atlas first, China deep coverage early, international broad coverage from day one.
```

This means:

- China is a high-detail region/country within the global atlas, not the atlas boundary.
- US, Japan, and Europe must appear in the first resource module.
- The system must be able to add other regions without UI redesign.
- Center profiles and latest intelligence are mandatory resource views, not later optional enhancements.

## Required Follow-Up Changes

1. Update `docs/product-brief.md` MVP language to global resource coverage.
2. Update `docs/mvp-roadmap.md` phases from "city resource read model" to "global resource read model".
3. Update `docs/dashboard-spec.md` drilldown and UI structure to `Region -> Country -> City -> Center`.
4. Update `docs/data-model.md` with `GeoRegion`, `RegionResourceView`, `CountryResourceView`, and `CenterLatestIntelView`.
5. Update `docs/frontend-architecture-draft.md` component structure and data flow for global atlas navigation.
6. Update `docs/horizon-demo-reference-analysis.md` to record Horizon's global-resource gap.
7. Update logs and handoff so future implementation does not regress to China-only scope.
