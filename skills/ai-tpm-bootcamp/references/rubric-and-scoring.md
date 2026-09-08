# Rubric and Scoring

## Who Scores, and When

Chat (the assistant, in the interviewer/stakeholder role) scores the
candidate — this is not a self-scored exercise like `pm-interview-coach`'s
Practice module. Scoring happens immediately after the Recommendation stage
closes and before Debrief is rendered. Each score must include a 1-2 line
justification tied to what the candidate actually said in *this* case, not a
generic rubric restatement.

## The Four Dimensions (1-4 each)

### Structuring — did they scope/frame before answering

- **1** — Answered before framing the problem at all.
- **2** — Gave a framework, but it was generic/boilerplate, not tailored to this case.
- **3** — Framed the problem with a case-specific structure before diagnosing.
- **4** — Framed crisply and named the specific tradeoff/axis the case actually turns on before touching data.

### Technical judgment — right tradeoff, right question asked of the data/architecture

- **1** — Missed or misapplied the core technical tradeoff.
- **2** — Named the right tradeoff but the reasoning was shallow or generic.
- **3** — Asked the right question of the architecture/data and reasoned correctly from the answer.
- **4** — Same as 3, plus anticipated a second-order technical consequence unprompted.

### Reasoning under ambiguity/pressure

- **1** — Froze, deflected, or gave a non-answer when the curveball or a forcing device hit.
- **2** — Answered, but visibly dropped earlier structure under pressure.
- **3** — Adjusted the call cleanly when new information or pressure arrived.
- **4** — Same as 3, plus explicitly named what would change the call if the pressure eased.

### Communication — clear recommendation, defensible, acknowledges the road not taken

- **1** — No clear recommendation, or it was buried in hedging.
- **2** — Recommendation stated, but no acknowledgment of the rejected alternative.
- **3** — Clear, defensible recommendation with the rejected alternative named.
- **4** — Same as 3, delivered at exec pace: call → reason → risk → mitigation, concise and sequenced.

## Gating

Graduate the current phase after **3 consecutive cases** in that phase
averaging **≥3/4** across the four dimensions (average of that case's 4
scores, not a running average across cases). `progress-ledger.md` computes
this by reading the most recent rows for the current phase — see that file
for the exact derivation.

Falling short of the average on a given case does not fail the candidate or
end the phase — it simply means the *next* case in-phase should specifically
target whichever dimension scored lowest on the most recent case (ties
broken in dimension-table order above, i.e. Structuring first). Targeting
means: chat should deliberately shape the Situation/Curveball content to
exercise that dimension (e.g. if Structuring is weak, open the Situation
stage extra vague so the candidate must do more framing work before any data
appears) — it is never a literal repeat of the same case.

## Manual Override

The candidate can say something equivalent to "skip ahead anyway" at any
point to move to the next phase regardless of gating state. Log the override
explicitly in `progress-ledger.md` (a note in the row, not a separate
column) so future sessions know graduation was manual, not earned.

## What Gets Written Into the Artifact

At Debrief, the artifact's `SCORECARD` constant (see `artifact-generator.md`)
is populated with: each dimension's score and one-line justification, the
overall average, the graduation status ("graduated — 3rd consecutive
qualifying case" / "2 of 3 consecutive qualifying cases" / "override —
advanced manually" / etc.), the weakest dimension, and the next-recommended
focus (same phase + weakest dimension, or the next phase if graduated).
