# Dashboard Spec

## First Screen

The first screen should be the War Room itself, not a marketing landing page.

Primary layout:

- Left navigation.
- Top filters.
- Central 3D globe intelligence map.
- Index strip.
- Right-side daily intelligence queue.

Engineering draft:

- `docs/frontend-architecture-draft.md` is the implementation-oriented frontend draft.
- `docs/horizon-demo-reference-analysis.md` defines `references/horizon-workspace` as the primary product/UI reference.
- This document remains the product/interaction spec for the dashboard.

Primary reference rule:

- Use `references/horizon-workspace` for static product layout, module coverage, visual language, city resource interaction, profile/configuration UX, and report export.
- Use `references/worldwideview` only for realtime globe animation, stream updates, DataBus, and Cesium primitive rendering.

## Navigation

Adopt the Horizon demo's top-level module set as the first frontend navigation:

- 首页态势总览 / War Room.
- 全球胰腺治疗资源图谱.
- 舆情与灰色风险雷达.
- AI-MDT 多模型研判台.
- 临床预测与循证审计.
- 报告中心与多端导出.
- 配置管理.

The earlier generic modules such as Guidelines Radar, Clinical Trials, Drug Pipeline, Source Registry, and Patient Signals should become subviews or filters inside these top-level modules rather than separate first-screen tabs.

## Frontend Module Structure

The frontend should follow a shell + panels + globe + core runtime structure:

| Module | Responsibility |
| --- | --- |
| `WarRoomShell` | Owns the first screen layout and boot sequence. |
| `TopFilters` | Time, region, stage, molecular subtype, evidence, review status. |
| `LeftNav` | Major intelligence modules. |
| `GlobeView` | Cesium viewer and primitive layer rendering. |
| `GlobeLayerController` | Layer toggles and map legend. |
| `CameraPresetBar` | Global, region, country, city, US, Japan, Europe camera jumps. |
| `RightIntelPanel` | Selected region, country, city, center, or event summary. |
| `RegionResourcePanel` | Region-level coverage, country rows, source counts, and latest intelligence. |
| `CountryResourcePanel` | Country-level city and center overview, trial signal, source coverage, and recent intelligence. |
| `CityResourcePanel` | Surgery, oncology, trial, complication, nutrition, palliative, psychology resources. |
| `CenterDetailDrawer` | Hospital/department detail and evidence. |
| `SourceEvidencePanel` | Source URLs, verification status, metric definitions, conflicts. |
| `DailyIntelQueue` | New intelligence events and review state. |
| `BottomTimeline` | Time-window navigation and playback. |

## Top Filters

- Time range.
- Region: global, China, US, Europe, Japan, Australia.
- Disease stage: resectable, borderline resectable, locally advanced, metastatic, adjuvant, recurrence.
- Molecular subtype: KRAS, BRCA, ATM, HER2, CLDN18.2, MSI, NTRK.
- Evidence level.
- Review status.

## MVP Cards

1. Global breakthrough index.
2. Clinical trial opportunity index.
3. Treatment risk warning.
4. Hot drugs and targets.
5. Active doctors and centers.
6. Guideline and consensus radar.
7. Patient signal hotspots.
8. Convertible content queue.

## 3D Globe Entry

The global map is the primary navigation surface, not a decorative background.

Required drilldown path:

```text
Global -> Region -> Country -> City -> Pancreatic Center
```

MVP geography:

- First regions: Asia-Pacific, North America, Europe.
- First countries: China, United States, Japan, Italy, Germany, Sweden, United Kingdom.
- China remains the highest-detail country in the first version, with Shanghai, Beijing, Tianjin, Chongqing, Jiangsu/Nanjing, Sichuan/Chengdu, Zhejiang/Hangzhou, Fujian/Fuzhou/Xiamen, Hebei/Shijiazhuang, Guangzhou, Wuhan, and Jinan.
- United States, Japan, and Europe must still appear as first-version resource areas, even if their coverage starts shallower.
- Centers: simplified demo center records with public, estimated, mixed, or unverified data-quality labels.

Shanghai and Beijing should be high-detail examples first. Other countries, regions, province/city nodes, and centers can start as lower-detail records until source verification catches up.

Map layers:

- Treatment center distribution.
- City pancreatic treatment resources.
- Academic activity.
- News hotspots.
- Patient pulse.
- Complication support.
- Trial activity.
- Policy breakthrough.

Interaction rules:

- Single-click a region, country, city, or center to update the right summary panel.
- Double-click a region, country, or city to zoom and drill down.
- Center click opens a detail drawer.
- Center detail must include latest linked intelligence, source evidence, metrics, trials/research, and patient-question actions.
- City click opens a pancreatic treatment resource panel grouped by surgery, medical oncology, trial centers, complication support, nutrition, palliative care, and psychology support.
- Time range changes map layer snapshots and event strips.

## Realtime Globe Runtime

The globe should follow the `arch_reference1.md` / WorldWideView-inspired pipeline:

```text
seeder.mjs
  -> stream payload
  -> DataBus
  -> globe store
  -> Cesium primitive renderer
  -> animation loop
```

MVP runtime requirements:

- Consume flat `RealtimeGeoEntity[]` payloads from `pancreatic-centers`.
- Keep plugin IDs kebab-case; first layer is `pancreatic-centers`.
- Render center/city points from `schemas/realtime-geo-entity.schema.json`.
- Use `realtime/runtime/` as the current implementation boundary until the frontend stack is selected.
- Implement camera presets for global, China, Shanghai, Beijing, Chengdu, Wuhan, US, Japan, and Europe.
- Use public signal `heat` for color/size gradients only.
- Keep numeric volume details in the side panel with source metadata; never show an unqualified number as a map ranking.

Cesium implementation rules:

- Prefer `PointPrimitiveCollection`, `BillboardCollection`, `LabelCollection`, and `PolylineCollection`.
- Avoid dynamic `HeightReference.CLAMP_TO_GROUND` labels.
- Use point-only properties only on points and `iconScale` only on billboards.
- Add manual horizon culling and chunked updates once the entity count grows.
- Bind animation updates to one clock/update loop rather than scattered React component effects.

## City Treatment Resource Panel

When a user selects a city, the right panel should show a resource layer derived from `hospital_source.md`.

MVP requirements:

- Group resources by treatment and support category.
- Show hospital, department, capability tags, complication tags, public source links, heat bar, and data quality.
- Support filters for complication type, resource type, public account availability, trial signal, and data quality.
- Open a detail drawer when a hospital or department row is clicked.
- If a department has a public WeChat account, list the account name, account type, source URL, and verification status.
- Display heat as public signal strength only; do not present it as real clinical quality, patient volume, or a hospital ranking.
- Surgery volume must show metric definition, period, source URL, and verification status before display; conflicting sources should show "pending verification" instead of a numeric ranking.
- Public account data should follow `docs/wechat-mp-source-requirements.md` and only contribute to public-signal heat, not clinical quality.

Required complication filters:

- Gastrointestinal bleeding.
- Biliary obstruction.
- Bowel obstruction.
- Infection.
- Thrombosis.
- Rash or dermatologic toxicity.
- Interstitial pneumonitis.
- Peritoneal metastasis.
- Pain and palliative support.
- Nutrition support.
- Psychological support.

## Visual Direction

Use the Horizon demo's dark medical command-center style as the main visual target:

- Near-black shell and panels.
- Gold primary accent `#C5A47E`.
- Low-opacity borders and tactical cards.
- Dense but readable clinical data layout.
- Explicit patient-friendly highlight blocks.
- Heat bars for public signal strength and flow.
- Elderly-friendly mode with larger text and wider spacing.

Keep it clinical and information-dense. The interface should feel like a daily-use pancreatic intelligence terminal, not a generic SaaS dashboard.
