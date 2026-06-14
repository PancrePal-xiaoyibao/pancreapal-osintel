# Module Evaluation: 3D Globe Dashboard

## Source

- Source document: `3D_dashbroad.md`
- Proposed feature name: 3D Globe War Room
- Current product phase: Phase 0, project baseline and data contracts

## Evaluation Summary

The module should be integrated as the primary dashboard entrypoint.

It does not replace the current War Room design. It upgrades the central global intelligence map into a five-level geographic navigation system:

```text
Global -> Region -> Country -> City -> Treatment Center
```

This is a strong fit because the project is explicitly about global pancreatic tumor intelligence, trial opportunity, center capability, patient demand, and risk distribution.

## Fit With Existing Product

| Existing Module | Fit | Integration Point |
| --- | --- | --- |
| War Room dashboard | High | Replace generic global map with interactive 3D globe entrypoint. |
| Source registry | High | Sources can be tagged to countries, cities, and centers. |
| Intelligence events | High | Events become geocoded by country, city, and optional center. |
| Doctor and center signals | High | Split generic center signals into geographic treatment centers. |
| Index system | High | Add geographic indices for country, city, and center layers. |
| AI-MDT review | Medium | High-risk regional or center-level events enter review queue. |
| Reports | High | Enables country, city, and center reports. |
| Compliance | High | Center capability must be fact-based, not a subjective ranking. |

## Recommended Integration

### Phase 0

Add data contracts and database support for:

- Regions.
- Countries.
- Cities.
- Treatment centers.
- Geographic score snapshots.
- Map layer snapshots.
- Event geocoding.

### Phase 1

Build the quick demo as a global resource atlas:

- Regions: Asia-Pacific, North America, Europe.
- Countries: China, United States, Japan, Italy, Germany, Sweden, United Kingdom.
- China high-detail nodes: Shanghai, Beijing, Tianjin, Chongqing, Jiangsu/Nanjing, Sichuan/Chengdu, Zhejiang/Hangzhou, Fujian/Fuzhou/Xiamen, Hebei/Shijiazhuang, Guangzhou, Wuhan, and Jinan.
- International broad-coverage nodes: selected US, Japan, and Europe pancreatic centers from the current center snapshot.

Shanghai and Beijing should be high-detail examples first. International regions can start with smaller center/resource records and clearly marked coverage status.

### Phase 2

Add the first real 3D globe UI:

- Globe rotation and zoom.
- Country and city points.
- Layer toggles.
- Right-side selected-object panel.
- Timeline or bottom event strip.

### Phase 3

Add comparative analysis:

- Country vs country.
- City vs city.
- Center capability snapshots.
- Topic maps for KRAS, CLDN18.2, HER2, local therapy, and complication support.

## Geographic Data Model

The 3D module needs a separate geographic layer. Do not overload `doctor_centers`.

Use these core tables:

- `geo_regions`
- `geo_countries`
- `geo_cities`
- `treatment_centers`
- `geo_score_snapshots`
- `map_layer_snapshots`

Then link existing intelligence tables:

- `intelligence_events.region_key`
- `intelligence_events.country_id`
- `intelligence_events.city_id`
- `intelligence_events.treatment_center_id`
- `trials.country_id`
- `trials.city_id`
- `trials.treatment_center_id`

## Pancreatic Geographic Dimensions

Track these dimensions per region, country, city, and center:

- Treatment capability index.
- Academic activity index.
- Patient pulse index.
- Policy breakthrough index.
- Complication support index.
- Trial activity index.
- Center count.
- MDT availability.
- Surgery volume when public or estimated.
- Patient volume when public or estimated.
- Data quality: public, estimated, mixed, or unverified.
- Coverage quality: seed, partial, verified, stale, or unknown.
- Latest linked intelligence time.

## MVP Boundary

Include:

- Global regions and country nodes for China, United States, Japan, and Europe.
- China deep-coverage province/city nodes aligned with `hospital_source.md`.
- International broad-coverage center nodes from the current public-signal snapshot.
- Demo treatment centers with coordinates.
- PTCI, PAI, PPI, PBI, CSI, and trial scores.
- Map layers for treatment centers, academic activity, patient pulse, complication support, and trial activity.
- Center profile panels with latest linked intelligence.

Exclude:

- Full verification parity across all global regions.
- Automated center scoring.
- Sensitive negative center ranking.
- Large-scale patient comment ingestion.
- Complex 3D effects that slow the first screen.

## Product Decision

Adopt this module as `3D Globe War Room`.

It becomes the primary dashboard interaction model. The first implementation should be global-atlas-first, data-first, and geography-aware, with Supabase tables ready for a later Next.js + CesiumJS/Resium frontend.
