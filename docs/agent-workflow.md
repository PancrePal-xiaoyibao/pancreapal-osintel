# Agent Workflow

## Agent Roles

| Agent | Responsibility |
| --- | --- |
| Source Scout | Discover new public sources and source updates. |
| Ingestion Agent | Fetch pages, PDFs, records, captions, and metadata. |
| Parser Agent | Extract structured fields and normalize entities. |
| Evidence Agent | Classify evidence type, sample size, endpoints, and limitations. |
| Oncology Agent | Interpret pancreatic tumor relevance and patient context. |
| Trial Agent | Identify eligibility, geography, status, and access relevance. |
| Drug Agent | Track target, company, phase, combinations, and data readouts. |
| Safety Agent | Flag adverse events, trial holds, exaggerated claims, and gray risks. |
| Social Signal Agent | Summarize public patient or physician discussion after anonymization. |
| Fact-check Agent | Compare claims across sources and mark conflicts. |
| Report Agent | Produce daily, weekly, topic, and patient-consultation reports. |

## Required Output Contract

Every intelligence item must include:

1. Conclusion.
2. Source URL.
3. Publication or observation date.
4. Evidence level.
5. Drug, regimen, target, or topic.
6. Patient subtype or disease stage if available.
7. Potential value.
8. Potential risk.
9. Whether it is suitable for doctor consultation preparation.
10. Uncertainty and review status.

## Safety Gate

Patient-facing output must pass these checks:

- No direct diagnosis or treatment instruction.
- No unsupported survival or response-rate claim.
- No private patient identity.
- No copied copyrighted full text.
- No doctor traffic ranking language.
- Clear distinction between source fact, model inference, and human review.

