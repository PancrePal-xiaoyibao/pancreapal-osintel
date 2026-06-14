# Product Brief

## Positioning

`pposintel` is a global pancreatic tumor intelligence workspace. It is not a news aggregator. Its job is to convert scattered public signals from guidelines, trials, papers, meetings, hospitals, companies, and patient communities into structured intelligence.

The product should answer three practical questions:

1. What changed?
2. Why does it matter?
3. What can a patient, family member, community operator, or doctor partner do with this information next?

## Users

| User | Primary Need |
| --- | --- |
| Patients and families | Understand new therapies, trials, risks, and questions worth discussing with doctors. |
| Community operators | Find high-value daily signals and convert them into briefs or social content. |
| Doctor partners | Scan guideline, meeting, trial, and drug updates without information overload. |
| Research volunteers | Help verify, tag, translate, and structure public intelligence. |
| Drug and trial watchers | Track pipeline status, trial locations, readouts, and access signals. |

## First MVP Scope

The first version is a Horizon-style War Room quick demo backed by traceable public-source data, but the pancreatic-center resource module must be global from day one. Daily Brief remains an output, but it is not the only product surface.

The first version should deliver:

- War Room dashboard shell with top modules: situation overview, global pancreatic treatment resource atlas, grey medical risk radar, AI-MDT review chamber, forecast/evidence audit, report center, and profile/configuration.
- 3D globe-ready geography layer with `Global -> Region -> Country -> City -> Pancreatic Center` drilldown and a temporary static globe only if Cesium is not yet integrated.
- Global pancreatic-center resource atlas covering China, United States, Japan, and Europe in the first pass, with China as a high-detail region/country but not the product boundary.
- Region, country, city, and center views with source coverage, data-quality badges, public-signal heat, and latest intelligence.
- City pancreatic treatment-resource panel with surgery, oncology, clinical trial, complication support, nutrition, palliative/pain, psychology, public-account, heat, and source-evidence rows where local source structure supports it.
- Individual pancreatic-center profile with capabilities, metrics, source evidence, complication support, trial/research signal, public accounts where available, and recent linked intelligence.
- Daily candidate intelligence queue and Top 10 brief with evidence labels, source links, uncertainty, patient-readable summaries, and doctor-question prompts.
- Core index cards: PCI, CTOI, DTI, DHI, TRI, plus clearly labeled geography/resource and grey-risk subindices when data is available.
- Source registry with authority, update cadence, jurisdiction, collection method, data-quality status, and copyright boundary.
- Manual review states before patient-facing distribution or report export.
- Local-first profile/configuration demo for saved events, patient context, RAG connectors, WeChat radar, source registry, PIN gate, and elderly-friendly mode.

All hospital/center volume fields must use source-backed metric objects with value, unit, period, scope, definition, source URL/type, and verification status. Heat bars represent public signal strength only, not hospital ranking, treatment quality, or real patient volume.

Sparse international regions should display "coverage in progress" with source counts and last verification time, not be treated as absent or low-quality medical areas.

## Out of Scope for MVP

- Direct clinical recommendations.
- Automated doctor ranking as a traffic leaderboard.
- Unqualified surgery volume, patient volume, or hospital ranking numbers.
- Full-text redistribution of copyrighted guidelines, abstracts, articles, or WeChat posts.
- Unreviewed treatment advice generated from model inference.
- Private patient group ingestion unless explicit consent and anonymization rules exist.
- Production-grade secret storage, account auth, or RAG vaulting in the quick demo.
