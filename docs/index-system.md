# Index System

## Index Families

The product uses three index families. They must not be mixed into one ranking table.

| Family | Purpose | Status |
| --- | --- | --- |
| Core intelligence indices | Summarize treatment, trial, drug, hospital/source, and risk signals for the War Room. | MVP |
| Safety and grey-risk indices | Identify unverified, exaggerated, or harmful claims. | MVP as review aid |
| Geographic resource subindices | Explain city/country/center layers on the globe. | Demo/read-model first |

Scores are explainable summaries, not medical advice. Heat and flow scores are public signal strength only.

## Core Intelligence Indices

### PCI: Pancreatic Cancer Breakthrough Index

Purpose: measure treatment breakthrough intensity in a time window.

Starting components:

- Positive Phase III results.
- OS or PFS improvement.
- Guideline updates.
- Regulatory approvals or breakthrough designations.
- High-quality Phase II signals.
- Patient access relevance.

### CTOI: Clinical Trial Opportunity Index

Purpose: measure practical trial opportunity for patients.

Starting components:

- New pancreatic tumor trials.
- Recruiting center count.
- China, US, Europe, Japan, and Australia coverage.
- Biomarker clarity.
- Later-line eligibility.
- Real-world complexity tolerance.
- Entry barrier friendliness.

### DTI: Drug Technology Index

Purpose: track drug and target momentum.

Starting topics:

- KRAS and pan-RAS.
- SHP2 and SOS1 combinations.
- CLDN18.2.
- HER2 and ERBB2.
- DNA repair: BRCA, PALB2, ATM, PARP, ATR.
- Immune microenvironment.
- Local therapy and radiotherapy.

### DHI: Doctor and Hospital Influence Index

Purpose: track public academic, clinical, and accessibility signals.

Important boundary: this is not a hospital ranking. It should be framed as pancreatic specialty accessibility and public academic/source signal.

Starting components:

- Publications.
- Conference talks.
- Trial participation.
- Public education.
- MDT capability.
- Complex complication capability.
- Regional access.

### TRI: Treatment Risk Index

Purpose: detect treatment risk, overpromotion, trial status changes, and safety signals.

Starting components:

- Serious adverse event reports.
- Trial suspension or termination.
- Public medical incident reporting.
- Clustered patient feedback.
- Exaggerated cure or response claims.
- Illegal recruitment or paid gray trials.

## Safety And Grey-Risk Indices

### GMR: Grey Medical Risk Score

Purpose: score public or semi-public claims that may mislead patients, including illegal drug sales, unverified therapies, high-price intermediaries, supplement overclaims, and private-fraud patterns.

Starting components:

- Unsupported cure or response claims.
- Advice to stop or delay standard therapy.
- High out-of-pocket cost without public evidence.
- Non-official drug sourcing or unknown quality.
- Lack of guideline, trial, ethics, or regulatory support.
- Potential harm: bleeding, liver injury, infection, thrombosis, drug interaction, or loss of trial opportunity.

Display boundary:

- GMR is a claim-risk score, not a judgment of a hospital, doctor, patient, or lawful treatment.
- Patient-facing output should provide factual critique and questions for doctors, not direct instructions.

### PSI: Patient Signal Index

Purpose: summarize public patient-community signal strength when anonymized and legally usable.

Status: defer as an independent index until patient-signal ingestion and privacy rules are mature. In the quick demo, patient pulse should remain a weak public-signal component, not a standalone claim.

## Geographic Resource Subindices

These indices explain map layers and city resource panels. They are not hospital rankings.

| Index | Meaning | First use |
| --- | --- | --- |
| `PTCI` | Pancreatic Treatment Capability Index, source-backed treatment-resource breadth. | City/resource view |
| `PAI` | Pancreatic Academic Activity Index, publications, talks, trials, and public academic signals. | Map layer |
| `PPI` | Patient Pulse Index, weak public patient/community attention signal. | Map layer with caution |
| `PBI` | Policy Breakthrough Index, guideline, regulatory, access, and reimbursement signals. | Country/city trend |
| `CSI` | Complication Support Index, public evidence of bleeding, obstruction, infection, thrombosis, rash, pneumonitis, peritoneal metastasis, nutrition, pain/palliative, and psychology support. | City resource panel |
| `TAI` | Trial Activity Index, active trial and recruiting-center signal. | Trial layer |

Every geographic subindex must expose:

- Inputs.
- Time window.
- Source links.
- Data-quality label.
- Whether values are public, estimated, mixed, or unverified.

Do not display subindices as "best hospital" rankings.
