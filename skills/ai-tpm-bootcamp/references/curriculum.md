# Curriculum — Five Escalating Phases

## Phase Table

| Phase | Slug | Focus | What tightens |
|---|---|---|---|
| Foundations | `foundations` | Feasibility triage, metrics/eval design, data readiness, basic build-vs-buy | Longest turn caps, most forcing-device leniency |
| Tradeoffs | `tradeoffs` | Cost/latency/quality tradeoffs, privacy vs feature richness, vendor vs in-house, prioritization under conflicting eng estimates | Tighter turn caps, exhibits get noisier (conflicting numbers) |
| Ambiguity | `ambiguity` | Underspecified exec asks, silent-failure/hallucination triage, cross-functional standoffs, new-modality scoping | No spoon-fed problem statement — candidate must scope the case themselves in Situation/Clarify |
| Executive-pressure | `executive-pressure` | Live incident requiring rollback-vs-patch call, defending a behind-schedule bet to execs, bias/safety escalation, competitive-response | Hard time pressure in-fiction, curveball stage always fires, shortest caps |
| Capstone | `capstone` | Multi-axis extended case combining strategy + architecture + incident + exec pressure, ends in a written decision memo | Double diagnose/decision/curveball loop, highest rubric bar |

See `case-engine.md` for the exact turn-cap numbers and forcing-device text per phase.

## Topic Pools

Each phase's pool rotates without repeating a topic until the whole pool is
exhausted, then reshuffles — identical rule to `pm-interview-coach`'s
`concept-rotation.md`. `progress-ledger.md` tracks which topics have been
used in the current phase; see that file for the exact derivation rule.

### Foundations

1. Feasibility Triage: Should We Build the Support-Ticket Auto-Responder?
2. Eval Design for a New Recommendation Model
3. Data Readiness Check Before a Churn-Prediction Launch
4. Build vs. Buy: In-House OCR vs. Vendor API
5. Scoping an MVP for an Internal Sales-Call Summarizer

### Tradeoffs

1. Latency vs. Quality: Streaming a Smaller Model or Batching a Bigger One
2. Privacy vs. Personalization: On-Device Model or Cloud Inference
3. Vendor LLM vs. In-House Fine-Tune for Customer Support
4. Prioritizing Roadmap Under Conflicting Engineering Estimates
5. Cost Ceiling: Cutting Inference Spend Without Gutting Quality

### Ambiguity

1. The Exec Wants "More AI in the Product" — Scope It
2. Silent Failures: Users Aren't Complaining But Metrics Are Off
3. Hallucination Triage in a Legal-Document Assistant
4. Cross-Functional Standoff: Data Science Says Ship, Trust & Safety Says Wait
5. Scoping a New Voice-Modality Feature With No Precedent Internally

### Executive-pressure

1. Incident: The Recommendation Model Is Degrading Live — Rollback or Patch
2. Defending a Behind-Schedule AI Bet to the Board
3. Bias Escalation: A Journalist Is Asking About Your Hiring-Screen Model
4. Competitive Response: A Rival Just Shipped Your Roadmap Feature First
5. Safety Incident: The Chatbot Gave Harmful Medical Advice

### Capstone

1. The Platform Migration: Strategy, Architecture, Incident, and the Board Memo
2. Enterprise Customer Churn Risk: From Root Cause to Rebuild Decision to Crisis Memo
3. The Acquisition Integration: Merging Two AI Stacks Under a Deadline
4. Regulatory Deadline: Compliance Redesign Under Executive and Legal Pressure

## Rotation Rules

Unless the user explicitly requests a topic:

1. Do not repeat a topic already used in the current phase until every topic in that phase's pool has been used at least once.
2. Once a phase's pool is exhausted, reshuffle: any topic in that phase becomes eligible again, but never pick the same topic that was used immediately last in that phase.
3. If the user names a topic, phase, or case explicitly, honor it and log it as such — rotation is a default, not a constraint on the user.
4. Capstone topics are not phase-gated the way phase focus is — pick the Capstone topic whose combined axes (strategy + architecture + incident + exec pressure) best exercise whichever rubric dimension the ledger flags as weakest, if repeating Capstone.

## Case-Title Naming for the Artifact Slug

Derive `<case-slug>` for the `BC-##-<phase-slug>-<case-slug>` directory name
from the chosen topic: lowercase, hyphenated, 3-5 words, dropping filler
words (e.g. "Latency vs. Quality: Streaming a Smaller Model or Batching a
Bigger One" → `latency-vs-quality-streaming`).
