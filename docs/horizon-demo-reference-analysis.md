# Horizon Demo Reference Analysis

## Status

Accepted as primary product/UI reference on 2026-06-14.

Reference path:

```text
references/horizon-workspace
```

## Role In This Project

`horizon-workspace` is now the main reference for:

- Product module completeness.
- Static dashboard layout.
- Visual language.
- Patient-facing copy density and tone.
- City treatment resource drilldown.
- Grey medical risk radar.
- AI-MDT interaction framing.
- Forecast/audit page.
- Report/export center.
- Configuration, local profile, RAG connectors, WeChat radar, and source registry UX.
- Elderly-friendly readability mode.

It is not the main reference for:

- Global region-country-city-center resource information architecture.
- Country-level and region-level pancreatic center resource boards.
- Center profiles with mandatory recent intelligence timelines.
- 3D globe animation.
- Realtime stream updates.
- High-volume geospatial rendering.
- Long-term frontend code organization.

For those dynamic/geospatial parts, keep using the WorldWideView-inspired architecture:

```text
seeder.mjs -> stream payload -> DataBus -> store -> primitive renderer -> Cesium animation loop
```

## Demo Technical Stack

Observed stack from `references/horizon-workspace`:

| Area | Stack |
| --- | --- |
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v4, custom CSS tokens |
| Icons | Lucide React |
| Motion | `motion/react` dependency present |
| Backend shell | Express + `tsx` in dev |
| Build | `vite build` plus `esbuild server.ts` to `dist/server.cjs` |
| AI SDK | `@google/genai` through server-side proxy |
| Storage | Browser `localStorage` for profile, saved events, keys, RAG config, PIN, elderly mode |

## What Works Well And Should Be Adopted

### 1. Product Module Set

The demo proves a coherent module set:

| Demo tab | pposintel module |
| --- | --- |
| 首页态势总览 | War Room dashboard |
| 全球/城市胰腺治疗资源 | City and treatment resource command center |
| 舆情与灰色风险雷达 | Grey medical risk radar |
| AI-MDT 多模型研判台 | AI-MDT review chamber |
| 临床预测与循证审计 | Forecast and evidence audit |
| 报告中心与多端导出 | Report center |
| 配置管理 | Patient/profile/source/RAG/WeChat configuration |

This module set should supersede the earlier generic navigation list.

### 2. War Room Layout

The demo's static shell is closer to the target product than earlier docs:

```text
Header with logo, live status, data source count, UTC time, config/login
  -> sticky tactical tab bar
  -> index strip
  -> active module content
  -> sync activity log footer
```

For the homepage:

```text
left: globe + OSINT ingest terminal
right: event stream + selected event evidence/detail panel
```

This should become the first implementation shape.

### 3. Visual Language

Adopt the demo's visual direction:

- Dark command center base: near-black panels and low-opacity borders.
- Gold accent `#C5A47E` as the primary brand color.
- Clinical/tactical typography using a mono/sans/serif mix.
- Dense but readable cards.
- Inline badges for evidence, source type, risk, and verification status.
- Explicit patient-facing blocks with warmer highlight colors.
- Heat bars using green-to-yellow-to-red gradients.

Do not dilute this into a generic SaaS dashboard.

### 4. City Resource Drilldown

The demo already expresses the user's `hospital_source.md` direction well:

- Left city/province selector.
- Middle city command cockpit with academic, patient pulse, complication index.
- Two prominent sub-entries:
  - 全学科诊疗与并发症资源
  - 核心直属质控中心
- Resource rows grouped by surgery, oncology, clinical center, complication support, nutrition, psychology.
- Department-level WeChat public account copy button.
- Popularity/flow heat bar.
- Source verification box.
- Right center detail profile.

Adopt this interaction structure, but replace demo hardcoded values with verified source-backed records.

Important gap: Horizon's resource module is city-first and does not fully solve the global atlas requirement. `pposintel` must upgrade it to:

```text
Global -> Region -> Country -> City -> Pancreatic Center -> Latest Intelligence
```

Horizon should be treated as a component-level city resource and visual reference, not as the complete global resource IA.

### 5. Patient-Facing Reading Layer

Adopt the dual-output explanation pattern:

- Professional clinical summary.
- Patient guide / analogy summary.
- Safety blind spot.
- Questions for doctor.

This is a strong fit for `pposintel` and should become a reusable component pattern.

### 6. Elderly-Friendly Mode

Adopt the concept and CSS strategy:

- Global `.elderly-accessible` class on the shell.
- Minimum readable size escalation for tiny text.
- Increased line-height and spacing.
- Patient summary paragraph splitting.
- Clear visible state label when enabled.

This should be a first-class accessibility feature, not an afterthought.

### 7. Local Sovereignty Patterns

Adopt the user-facing concept:

- Patient profile stored locally by default.
- Saved intelligence records.
- RAG connector configuration.
- PIN-gated profile/configuration area.
- Clear privacy promise.

Implementation caveat: do not store real API keys in plain `localStorage` as the long-term security design. For the quick demo it can remain local-only, but production should use encrypted local storage or a secure backend vault.

## What Should Not Be Copied Directly

### 1. Single Giant `App.tsx`

The demo has a 3,700+ line single component. It is useful as a product prototype but not maintainable.

Implementation must split it into:

- Shell components.
- Module pages.
- Shared cards.
- Domain models.
- Data adapters.
- State slices.
- Realtime/globe runtime.

### 2. Hardcoded Medical Scale Numbers

The demo contains surgery and patient volume numbers such as city annual surgery totals and center annual surgery counts. These are useful placeholders but cannot be reused as authoritative data.

Production rule:

- Every surgery/patient volume metric needs metric name, value, unit, period, scope, source URL/type, and verification status.
- Conflicts should display as pending verification.
- Map heat is public signal strength, not clinical quality or ranking.

### 3. Emoji-Heavy Labels

The demo uses emojis heavily in tabs and labels. This is acceptable for prototype clarity, but the production UI should prefer icon components and restrained labels.

### 4. Vite/Express As Target Stack

The demo uses Vite and Express. For this project, keep the frontend target as:

- Next.js App Router.
- TypeScript.
- Zustand.
- Supabase read models.
- Cesium/Resium for the globe.

The demo's Vite/Express structure is a prototype, not the final app architecture.

### 5. Static SVG Globe As Final Globe

The demo's SVG globe works for static prototype navigation. It should not be the final geographic engine.

Final globe should use:

- Cesium/Resium.
- Realtime DataBus.
- Primitive point rendering.
- Camera presets.
- Manual horizon culling.

## Reference Priority Going Forward

Use this priority order:

1. `references/horizon-workspace`: product UX, module structure, visual language, static interaction patterns.
2. `docs/hospital_source.md`: city resource data requirements and verification rules.
3. `references/worldwideview`: realtime geospatial data flow, Cesium rendering, DataBus, animation loop.
4. `design.md`: long-form product intent.
5. `/Users/qinxiaoqiang/Downloads/graphify`: baseline discipline for package structure and workflow.

## Proposed Frontend Module Mapping

```text
components/shell/
  WarRoomShell
  WarRoomHeader
  TacticalTabBar
  IndexStrip
  SyncActivityLog

components/modules/dashboard/
  HomeSituationOverview
  GlobeSurveillancePanel
  OsintIngestTerminal
  EventStreamList
  EventEvidencePanel
  PatientGuideBlock
  DoctorQuestionList

components/modules/resources/
  CityResourceCommand
  CitySelector
  CityCockpitStats
  ResourceCategoryToggle
  DepartmentResourceList
  CenterQualityList
  CenterProfilePanel
  SourceVerificationBox

components/modules/risk/
  GreyRiskRadar
  RiskSignalCard
  MythCorrectionCard
  DoctorMemoCompiler

components/modules/aimdt/
  AiMdtChamber
  MdtSeatCard
  ConsensusPanel

components/modules/forecast/
  ForecastAuditLog
  ForecastAuditCard

components/modules/report/
  ReportComposer
  ReportFormatSelector
  MarkdownReportView
  WeChatReportView
  XiaohongshuReportView
  PrintQuestionSheet

components/modules/profile/
  ProfileConfigPanel
  PatientMutationProfile
  ModelConfigCard
  PinLockPanel
  ElderlyModeToggle
  SavedIntelArchive
  RagConnectorManager
  WeChatRadarPanel
  SourceRegistryManager
```

## Data Model Additions Inspired By Demo

The current data model already has most core entities. Add or refine frontend DTOs for:

- `IntelEventCard`
- `PatientGuideBlock`
- `DoctorQuestionSet`
- `CityCommandView`
- `DepartmentResourceView`
- `CenterProfileView`
- `GreyRiskSignal`
- `PatientMythCorrection`
- `ForecastAuditSignal`
- `ReportExportJob`
- `PatientLocalProfile`
- `RagConnectorConfig`
- `WechatRadarResult`

These can be frontend DTOs first. Database tables should only be added when persistence is required beyond local demo state.

## First Implementation Recommendation

Build the first real frontend by using the Horizon demo as the screen blueprint, then replace internals:

1. Start with the Horizon shell and tabs as the visual/interaction blueprint.
2. Split the giant App into modules before porting.
3. Keep static data loading from local JSON for the first render.
4. Replace static SVG globe with Cesium globe in the dashboard and map modules.
5. Connect `pancreatic-centers` realtime entities through the existing `realtime/runtime/` contract.
6. Replace hardcoded city/center volume fields with source-backed Supabase records.
7. Preserve elderly mode, local profile, saved events, report exports, WeChat radar, and RAG connector UI as product modules.
