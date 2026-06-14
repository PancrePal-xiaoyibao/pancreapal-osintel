# Compliance Boundaries

## Medical Boundary

The platform provides public information organization, evidence labeling, and patient consultation preparation. It does not diagnose, prescribe, or recommend treatment.

Patient-facing language must say what to discuss with a doctor, not what to do medically.

## Copyright Boundary

Do not redistribute copyrighted full text from guidelines, abstracts, papers, WeChat articles, videos, or paid content.

Store and display:

- Source metadata.
- Links.
- Short summaries.
- Structured extracted fields.
- Human-readable evidence notes.

Avoid storing or displaying:

- Long copied passages.
- Complete guideline tables.
- Full article bodies from restricted sources.
- Full video transcripts unless rights are clear.

## Privacy Boundary

Patient community signals must be anonymized and treated as weak signals unless verified.

Never expose:

- Names.
- Avatars.
- Phone numbers.
- Addresses.
- Chat screenshots.
- Identifiable case details.

## Model-Risk Boundary

All generated output must distinguish:

- Source fact.
- Model inference.
- Human review.
- Uncertainty.

High-risk claims should move to `needs_human_review`.

## City Resource And Heat Boundary

City resource panels organize public information. They must not recommend hospitals or rank clinical quality.

Rules:

- Heat means public signal strength only.
- Flow means estimated public attention only.
- Do not present heat, article activity, or search visibility as true patient volume, clinical quality, or treatment outcome.
- Hospital or center volume metrics require value, unit, period, scope, definition, source URL/type, and verification status.
- Conflicting or single-source metrics must show their verification state and must not be converted into rankings.
- Negative or grey-risk signals about a hospital, doctor, or department require human review before display.

## Grey Medical Risk Boundary

Grey-risk radar is for claim critique and patient preparation, not policing or clinical instruction.

Allowed:

- Quote or summarize the claim in short form.
- Explain what public evidence is missing.
- Identify possible safety concerns.
- Generate questions to ask a licensed doctor.

Not allowed:

- Tell a patient to start, stop, or change treatment.
- Publicly accuse a named person or organization without verified source support and human review.
- Treat social-media or private-group content as fact.
- Use private patient group screenshots or identifiable details.

## WeChat And Public-Account Boundary

WeChat/public-account data defaults to metadata use only:

- Account name.
- Public account ID or alias if publicly available.
- Article title, URL, cover URL, publication time, digest, tags, and relevance score.
- Raw API payload without full-text storage by default.

Do not store or display full article bodies unless rights and use permissions are clear.

Public-account activity can contribute to public-signal heat. It cannot prove clinical quality or treatment capability by itself.

## Local Profile, PIN, RAG, And API Key Boundary

The quick demo can show local-first configuration, but it must not overclaim security.

Rules:

- Do not commit real API keys to the repository.
- Do not expose production secrets through frontend environment variables.
- Local browser `localStorage` is acceptable for demo preferences, but not for high-security production storage of patient records or long-lived API keys.
- PIN gate is a convenience/privacy affordance in the demo, not cryptographic security.
- RAG connector diagnostics must not send patient-identifiable data unless the user explicitly opts in and the endpoint is trusted.
- `.env.example` should contain empty placeholders only.

## Patient Explanation Boundary

Patient-friendly analogies are allowed only when they preserve evidence and uncertainty.

Rules:

- Convert complex terms into understandable language.
- Keep the original evidence level and uncertainty visible.
- Prefer "questions to ask your doctor" over "what you should do."
- Avoid cure promises, survival guarantees, or medication instructions.
- Flag high-risk patient-facing summaries for human review.

## Report And Export Boundary

Reports exported to WeChat, Markdown, PDF, print, or consultation sheets must preserve:

- Source links.
- Evidence labels.
- Review status.
- Uncertainty notes.
- Patient-facing medical disclaimer.
- Copyright boundary for source content.

Any report containing grey-risk, treatment-selection, dosage, off-label therapy, private patient data, or unverified volume/ranking claims must pass a human review gate before patient-facing distribution.
