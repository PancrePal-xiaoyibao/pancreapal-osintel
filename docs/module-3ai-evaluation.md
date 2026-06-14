# Module Evaluation: AI-MDT Multi-Model Review

## Source

- Source document: `module_3AI_ver.md`
- Proposed feature name: AI-MDT Intelligence Review
- Current product phase: Phase 0, project baseline and data contracts

## Evaluation Summary

The module should be integrated, but not as a blocking MVP ingestion feature.

Its correct position is a high-risk intelligence review layer that sits after candidate event creation and before patient-facing publication. It strengthens the existing evidence, review, safety, and report workflows instead of replacing them.

## Fit With Existing Product

| Existing Module | Fit | Integration Point |
| --- | --- | --- |
| Intelligence events | High | A review task can be created from an event. |
| Evidence review | High | Multi-model scores enrich evidence reliability and uncertainty. |
| Safety review | High | Risk level and human-review flags feed the safety gate. |
| Daily brief | High | Consensus reports decide whether an item enters Top 10. |
| Index system | Medium | Consensus, evidence, and risk scores can later weight PCI, CTOI, DTI, DHI, TRI. |
| Dashboard | High | Horizon-style quick demo needs a visible `AI-MDT Review` tab, while real orchestration remains deferred. |
| Source ingestion | Low | The module is not a source collector. |
| Patient content generation | High | Final consensus can generate patient-readable explanation after review. |

## Recommended Integration

### Phase 0

Add database tables and contracts:

- `review_tasks`
- `model_reviews`
- `consensus_reports`

Use them with manual or mock model outputs.

### Phase 1A

Add a visible AI-MDT chamber shell to the Horizon-style War Room:

- Review queue card.
- Three-model seat layout as UI only.
- Consensus status panel.
- Human-review required badges.
- Patient-facing output safety reminder.

Use mock or stored review-task data only. Do not call real model orchestration in this phase.

### Phase 1B/2

Create review tasks from selected `intelligence_events`.

Trigger review when:

- Evidence is weak but impact is high.
- Risk level is medium-high or higher.
- Patient-facing content is requested.
- Source is a company press release, social signal, or patient community signal.
- The event is a candidate for daily Top 10.

### Phase 2

Add real multi-model calls and independent model isolation:

- Each model receives the same source bundle.
- Models do not see each other's outputs.
- Aggregator reads only normalized model outputs.
- Medical Safety Agent checks the final report.

### Phase 3

Expand dashboard UI:

- AI-MDT review queue.
- Three-model comparison table.
- Agreement and disagreement panel.
- Human review queue.
- Patient explanation export.

## MVP Boundary

Include in the quick demo:

- Tables for review tasks, model reviews, and consensus reports.
- Scores for evidence, patient relevance, risk, and model agreement.
- Tags and human review flags.
- Relationship from consensus report back to intelligence event.

Do not include in the quick demo:

- Real Claude/GPT/Gemini orchestration.
- Complex role permissions.
- Automatic video or image analysis.
- Public patient community ingestion.
- Doctor or hospital negative signal automation.

## Product Decision

Adopt this module as `AI-MDT Intelligence Review`.

It becomes the judgment layer for high-value or high-risk medical intelligence. The first implementation is data-first: store review tasks and consensus outputs before building model orchestration or UI.
