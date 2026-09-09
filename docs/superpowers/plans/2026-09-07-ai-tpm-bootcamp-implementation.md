# AI-TPM Bootcamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `ai-tpm-bootcamp` skill — a chat-driven, finite-state case engine that drops an MBA candidate straight into an MBB-style AI-PM/TPM case (no concept lesson), scores them on a 4-dimension rubric, and guarantees the case always terminates.

**Architecture:** A `skills/ai-tpm-bootcamp/` skill folder (SKILL.md + progress-ledger.md + references/) mirroring the `pm-interview-coach` skill's file layout, but the artifact itself is a passive rendered "case file" (case brief, exhibits, stage tracker, scorecard) with all dynamism happening live in chat — no client-side gating/grading JS, unlike `pm-interview-coach`'s self-graded practice module. Chat (the assistant) edits a small set of JS constants in the artifact between stage transitions to advance the stage tracker and, at the end, to populate the scorecard.

**Tech Stack:** Single-file HTML artifact — React 18.3.1 + Recharts 2.12.7 + Babel-standalone 7.24.7, all inlined, loaded via CDN `<script>` tags (identical dependency pattern to `skills/pm-interview-coach/references/artifact-generator.md`). No build step, no server, no external state library.

**Spec:** `docs/superpowers/specs/2026-09-07-ai-tpm-bootcamp-design.md`

## Global Constraints

- Candidate always plays the AI-PM/TPM seat being evaluated (spec §2) — never a counterpart role.
- Fictional/composite cases only; no real-company citation requirement (spec §2, Non-Goals).
- Fixed stage sequence, finite state machine, not open dialogue: `Situation → Clarify → Diagnose → Decision → Curveball → Recommendation → Debrief` (spec §3). Capstone-phase cases repeat `Diagnose → Decision → Curveball` twice.
- Each stage has a turn cap (~3 exchanges baseline); hitting the cap without a valid advance triggers an in-fiction forcing device that moves the case forward regardless (spec §3).
- Recommendation stage always ends the case; no path re-opens a closed stage — state only moves forward (spec §3).
- Rubric: 4 dimensions — Structuring, Technical judgment, Reasoning under ambiguity/pressure, Communication — each scored 1-4 (spec §5).
- Gating: graduate a phase after 3 consecutive cases averaging ≥3/4; falling short targets the weakest-scoring dimension in the next in-phase case; manual override ("skip ahead anyway") always available (spec §5).
- Output artifact: `articles/ai-tpm-bootcamp/BC-##-<phase-slug>-<case-slug>/index.html`, `##` sequential, scanned from existing `BC-##-*` folders, same convention as `PR-##`/`ER-##`/`PM-##` (spec §1).
- Single self-contained HTML file, React + Recharts + Babel-standalone, same artifact pattern as `pm-interview-coach` (spec §6 step 3).
- Mandatory functional validation before delivery: transpile-check plus a real-browser click-through of the stage tracker and scorecard; if no live browser is available, say so explicitly rather than claiming it was checked (spec §7).

---

## Task 1: `references/case-engine.md` — Stage FSM, Turn Caps, Forcing Devices

**Files:**
- Create: `skills/ai-tpm-bootcamp/references/case-engine.md`

**Interfaces:**
- Produces: the canonical stage-name list (`Situation`, `Clarify`, `Diagnose`, `Decision`, `Curveball`, `Recommendation`, `Debrief`, plus the Capstone 10-stage variant with `Diagnose 1/2`, `Decision 1/2`, `Curveball 1/2`) that Task 6 (`case-template.html`) and Task 8 (SKILL.md) reference by exact name.
- Consumes: nothing (first content file).

- [ ] **Step 1: Write the file**

```markdown
# Case Engine — Finite-State Termination Mechanics

This is the mechanism that guarantees every session ends, regardless of what
the candidate types. Read this before running any live session.

## Stage Sequence

Standard case (Foundations / Tradeoffs / Ambiguity / Executive-pressure):

```
Situation → Clarify → Diagnose → Decision → Curveball → Recommendation → Debrief
```

Capstone case (double loop — a larger case, still a bounded, finite sequence):

```
Situation → Clarify → Diagnose 1 → Decision 1 → Curveball 1
          → Diagnose 2 → Decision 2 → Curveball 2 → Recommendation → Debrief
```

State only moves forward. Once a stage's advance condition or forcing device
fires, that stage is closed: acknowledge the transition in-fiction and never
reopen scoring for it, even if the candidate later references it again as
color commentary.

## Per-Stage Advance Conditions, Turn Caps, and Forcing Devices

Turn caps are phase-relative — see "Phase-Specific Tuning" below for the
exact numbers per phase. This table gives the baseline (Tradeoffs-tier) caps
and the advance condition / forcing device for each stage; phases scale the
numbers, not the mechanic.

| Stage | Candidate must produce to advance | Baseline turn cap | Forcing device if cap hit |
|---|---|---|---|
| Situation | Nothing — chat presents the brief; stage closes the moment the candidate sends any response (including jumping straight to a question or a recommendation). | 1 (no real cap; always advances on first reply) | N/A |
| Clarify | At least one clarifying question, OR an explicit decision to stop clarifying ("I have enough, let's diagnose"). | 3 exchanges | Counterpart cuts it off in-fiction: *"We're burning time — work with what you've got."* Chat moves to Diagnose and treats the gap as a known limitation the candidate now has to reason around. |
| Diagnose | A stated diagnosis or root-cause hypothesis about the problem. | 3 exchanges | *"[Counterpart] leans in: 'What's your working theory — right now, not eventually?'"* Chat records whatever partial reasoning exists as the diagnosis and moves on. |
| Decision | A committed tradeoff call built on the diagnosis. | 3 exchanges | *"The room needs a call before this meeting ends. Thirty seconds — what do we do?"* Chat locks in whatever the candidate last leaned toward, or a stated non-decision if there was none, and moves to Curveball. |
| Curveball | A response to the new complicating fact/objection chat just introduced (hold, revise, or defend the prior decision). | 2 exchanges | *"[Counterpart] isn't waiting: 'I'm proceeding with [default action] unless you tell me otherwise right now.'* Chat records the default action as what happened and moves to Recommendation. |
| Recommendation | A final, committed recommendation (this stage always ends the case — no further stage follows it except Debrief). | 2 exchanges | *"We need your final answer now."* Chat takes whatever was last said as the final recommendation, however thin, and moves to Debrief. |
| Debrief | Nothing required of the candidate — chat drops character and renders the scorecard. | N/A | N/A |

In the Capstone variant, "Curveball 1" always feeds a new complication into
"Diagnose 2" — never a repeat of Curveball 1's complication — so the second
loop reasons about the *consequences* of Decision 1, not a fresh unrelated
problem.

## Phase-Specific Tuning

| Phase | Clarify cap | Diagnose cap | Decision cap | Curveball cap | Recommendation cap | Notes |
|---|---|---|---|---|---|---|
| Foundations | 4 | 4 | 4 | 3 | 3 | Most lenient. Before firing a forcing device, give one gentle nudge first: *"Anything else you want to ask before we move on?"* |
| Tradeoffs | 3 | 3 | 3 | 2 | 2 | Baseline (the table above). Exhibits are noisier — conflicting numbers the candidate must reconcile, not just read (see curriculum.md). |
| Ambiguity | 4 | 3 | 3 | 2 | 2 | Situation withholds the explicit problem statement — the candidate must scope the problem themselves during Clarify/Diagnose. Clarify cap is extended to 4 to give scoping room; the other caps stay tight. |
| Executive-pressure | 2 | 2 | 2 | 2 | 2 | Shortest caps across the board. Open the Situation stage with an explicit in-fiction ticking clock. The Curveball stage always fires regardless of how well the candidate has handled the case so far — this phase's defining trait is that the pressure is not optional. |
| Capstone | 2 | 2 | 2 | 2 | 2 | Executive-pressure-tier caps, applied to both loops. Recommendation's advance condition changes: the candidate must produce a structured decision memo (recommendation, reasons, impact, risk, mitigation, next step), not just a spoken call. If capped, the forcing device compresses it: *"One paragraph. Sixty seconds. Go."* |

## Counterpart Voice Catalog

Vary the in-fiction counterpart per case (per spec §2's roster) so forcing
devices and curveballs feel differentiated rather than a single generic
"boss":

- **Engineering lead** — blunt, cites one concrete technical constraint (a real number: latency budget, model size, an on-call incident count).
- **Exec** — impatient, time-boxes the candidate explicitly, cares about the bottom line over the mechanism.
- **Sales** — pushes revenue/deal urgency, minimizes downside risk, wants a yes.
- **Legal** — raises compliance/liability, will not move on stated facts or deadlines.
- **Data science** — precise, will correct sloppy metric or statistical reasoning on the spot.
- **Support** — reports frontline user pain, escalates emotionally, wants the symptom fixed now.

## Edge Cases

- **Candidate goes silent or gives a non-answer at the turn cap** — the forcing device fires exactly as scheduled; the case still ends on schedule. A non-answer is not a stall condition, it's just a weak input that gets scored accordingly.
- **Candidate jumps straight to a recommendation from Situation** — allowed. Skip directly to the Recommendation stage's advance condition. The Structuring rubric dimension takes the hit for the skipped stages; the case still ends. A short, weak run is a valid outcome, not an error to be corrected by chat.
- **Candidate derails mid-case (off-topic question)** — chat answers briefly in character if the answer is plausible and doesn't leak the solution; otherwise redirects in character ("the room doesn't have that info — what do you do with what you've got"). A derail never blocks or resets stage progression or consumes more than one turn-cap exchange.
```

- [ ] **Step 2: Self-check against spec §3**

Re-open `docs/superpowers/specs/2026-09-07-ai-tpm-bootcamp-design.md` §3 and confirm every bullet (advance condition, turn cap, forcing device, "no path re-opens," all three edge cases, capstone double-loop) is represented in the file just written. Fix any gap inline.

- [ ] **Step 3: Commit**

```bash
git add skills/ai-tpm-bootcamp/references/case-engine.md
git commit -m "docs: add ai-tpm-bootcamp case-engine reference"
```

---

## Task 2: `references/curriculum.md` — Five Phases, Concrete Topic Pools

**Files:**
- Create: `skills/ai-tpm-bootcamp/references/curriculum.md`

**Interfaces:**
- Consumes: phase names from Task 1 (Foundations, Tradeoffs, Ambiguity, Executive-pressure, Capstone) — must match exactly.
- Produces: the exact phase-slug strings (`foundations`, `tradeoffs`, `ambiguity`, `executive-pressure`, `capstone`) used in the `BC-##-<phase-slug>-<case-slug>` directory name, referenced by Task 8 (SKILL.md) and Task 9 (README).

- [ ] **Step 1: Write the file**

```markdown
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
```

- [ ] **Step 2: Self-check against spec §4 and the Open Items list**

Confirm: all 5 phases present with correct focus/tightening text (copied from spec verbatim), each phase has 4-6 concrete topics (this satisfies the spec's Open Items bullet "Exact topic lists per phase"), and the rotation rule mirrors `concept-rotation.md`'s pattern (no separate state file — derived from the ledger).

- [ ] **Step 3: Commit**

```bash
git add skills/ai-tpm-bootcamp/references/curriculum.md
git commit -m "docs: add ai-tpm-bootcamp curriculum reference"
```

---

## Task 3: `references/rubric-and-scoring.md` — Rubric Anchors and Gating

**Files:**
- Create: `skills/ai-tpm-bootcamp/references/rubric-and-scoring.md`

**Interfaces:**
- Consumes: nothing new.
- Produces: the exact 4 dimension name strings (`Structuring`, `Technical judgment`, `Reasoning under ambiguity/pressure`, `Communication`) used as object keys in Task 6's `SCORECARD.dimensions` and referenced in Task 4's ledger columns and Task 8's SKILL.md.

- [ ] **Step 1: Write the file**

```markdown
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
```

- [ ] **Step 2: Self-check against spec §5**

Confirm all four dimensions match spec §5's descriptions, the 3-consecutive-≥3 gating rule is exact, "targets the weakest-scoring dimension (not a literal repeat)" language is present, and manual override is documented.

- [ ] **Step 3: Commit**

```bash
git add skills/ai-tpm-bootcamp/references/rubric-and-scoring.md
git commit -m "docs: add ai-tpm-bootcamp rubric-and-scoring reference"
```

---

## Task 4: `progress-ledger.md` — Seed Ledger with Derivation Rules

**Files:**
- Create: `skills/ai-tpm-bootcamp/progress-ledger.md`

**Interfaces:**
- Consumes: phase names (Task 1/2), dimension names (Task 3).
- Produces: the ledger table schema (column order) that Task 8's SKILL.md workflow step 7 and Task 6's scorecard-writing step reference.

- [ ] **Step 1: Write the file**

```markdown
# Progress Ledger

Cohort log for the ai-tpm-bootcamp skill. Read the last 4-6 rows before
picking a phase/topic for a new session, and before computing graduation
status. One session (one completed case) per row. No separate state file —
current phase, topics already used, and graduation status are all derived
from this table, the same way `pm-interview-coach`'s rotation is derived
from its own ledger (see that skill's `concept-rotation.md`).

Format: `Date | Phase | Case Topic | Structuring | Technical Judgment | Reasoning Under Pressure | Communication | Avg | Graduated? | Notes`

- **Avg** = average of the four score columns for that row, to 2 decimals.
- **Graduated?** = `Yes` only on the row that completes 3 consecutive in-phase rows each with Avg ≥ 3.00; otherwise blank. A row with `Yes` means the *next* row should be the first case of the next phase (Foundations → Tradeoffs → Ambiguity → Executive-pressure → Capstone; Capstone has no next phase — further Capstone graduations are just logged, no phase change).
- **Notes** — free text: reshuffle markers (e.g. "reshuffled — pool exhausted"), manual overrides (e.g. "override — advanced manually, avg was 2.50"), or anything else future sessions should know.

## Derivation Rules

- **Current phase** = the Phase value of the most recent row, unless that row's Graduated? = `Yes`, in which case current phase = the next phase in the Section 4 order. If the ledger is empty, current phase = Foundations.
- **Topics already used this phase** = the distinct Case Topic values among the most recent consecutive rows that share the current phase, read backward until either the table start or a graduation/reshuffle boundary is hit. Once every topic in that phase's `curriculum.md` pool appears in that span, the pool is exhausted — the next pick reshuffles (see curriculum.md's rotation rules) and the chosen row's Notes should say so.
- **Weakest dimension** (for gating's "target the weakest dimension" rule) = the lowest-scoring column on the most recent row, ties broken left-to-right in the column order above (Structuring first).
- **Graduation check** = look at the most recent row and the two immediately before it (if all three share the current phase): if all three have Avg ≥ 3.00, this session's row gets `Graduated? = Yes`.

## Session Log

| Date | Phase | Case Topic | Structuring | Technical Judgment | Reasoning Under Pressure | Communication | Avg | Graduated? | Notes |
|---|---|---|---|---|---|---|---|---|---|
```

- [ ] **Step 2: Self-check against spec §1 and §6 step 7**

Confirm the ledger stores exactly what spec §1 requires ("cohort phase, per-session rubric scores, graduation status per phase, topics already used per phase") and what §6 step 7 requires logging ("date, phase, case topic, rubric scores, graduation status, next-recommended focus" — next-recommended focus is derivable from Weakest Dimension + current phase, so it doesn't need its own column; note this is a deliberate DRY choice, not a gap).

- [ ] **Step 3: Commit**

```bash
git add skills/ai-tpm-bootcamp/progress-ledger.md
git commit -m "docs: seed ai-tpm-bootcamp progress ledger"
```

---

## Task 5: `references/artifact-generator.md` — HTML/React Pattern and Edit Workflow

**Files:**
- Create: `skills/ai-tpm-bootcamp/references/artifact-generator.md`

**Interfaces:**
- Consumes: stage names (Task 1), dimension names (Task 3).
- Produces: the exact constant names (`CASE`, `STAGES`, `CURRENT_STAGE_INDEX`, `EXHIBITS`, `SCORECARD`) and component names (`App`, `StageTracker`, `CaseBrief`, `Exhibits`, `ExhibitTable`, `ExhibitChart`, `Scorecard`) that Task 6's `case-template.html`/`app-template.js` must implement exactly as named here.

- [ ] **Step 1: Write the file**

```markdown
# Artifact Generator

## Output Rule

Build one single self-contained HTML file per session. Never output the
case as markdown prose in chat — the HTML file is the case-file deliverable,
and chat is the live interviewer running on top of it (spec §3).

Unlike `pm-interview-coach`'s Practice module, this artifact has **no
client-side gating or grading JavaScript**. It is a passive rendered
document: case brief, exhibits, a stage tracker, and (once the case ends) a
scorecard. All dynamism — the actual case-playing — happens in chat, not in
the artifact. Do not build reveal buttons, input boxes, or scoring logic
into the HTML; there is nothing for the candidate to click.

## File Structure

```text
articles/ai-tpm-bootcamp/
  BC-##-<phase-slug>-<case-slug>/
    index.html       ← the deliverable: everything inlined
    app.js            ← readable source copy of the React app
```

`##` is sequential and chronological: scan `articles/ai-tpm-bootcamp/` for
the highest existing `BC-##-*` folder and increment by one. Never reuse or
renumber. See `curriculum.md` for how `<phase-slug>` and `<case-slug>` are
derived.

## Direct-File-Open Script Rule

Identical dependency pattern to `pm-interview-coach` and `product-ai`,
proven to work under `file://`:

```html
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
<script crossorigin src="https://unpkg.com/prop-types@15.8.1/prop-types.min.js"></script>
<script crossorigin src="https://unpkg.com/recharts@2.12.7/umd/Recharts.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"></script>
<script type="text/babel" data-presets="env,react">
  /* inline the app.js contents here */
</script>
```

- Do not use `<script type="text/babel" src="app.js">` — Babel fetches external scripts through browser APIs blocked under local-file origin rules.
- Do not use `.../recharts@2.12.7/umd/Recharts.min.js` — 404s. Use `Recharts.js`.
- Load `prop-types@15.8.1` before Recharts.
- After inlining, verify the inline Babel script matches `app.js` byte-for-byte in logic.

## State Model — Plain Constants, Not Interactive State

Because progression is driven by chat editing the file between turns, not by
the candidate clicking things, the "state" is a set of plain module-level
constants at the top of `app.js` that the components render from directly
(no `useState`/`useEffect` needed for progression):

- `CASE`: `{ title, phase, caseTopic, situation, givens: string[] }`
- `STAGES`: ordered array of stage-name strings. Standard case: the 7 names from `case-engine.md`. Capstone case: the 10-name variant (`Diagnose 1`, `Decision 1`, `Curveball 1`, `Diagnose 2`, `Decision 2`, `Curveball 2` in place of the single `Diagnose`/`Decision`/`Curveball`).
- `CURRENT_STAGE_INDEX`: integer, 0-based index into `STAGES`. This is the one value edited most often — once per stage transition.
- `EXHIBITS`: array of `{ id, title, type: 'table' | 'chart', chartKind?: 'bar' | 'line', columns: string[], data: object[] }`. `columns[0]` is the category/x-axis key for charts; every exhibit renders its table regardless of `type` — a chart is a supplement to the table, never a replacement (every value must be readable as text, per spec §3's "every value printed exactly, never read off a chart alone").
- `SCORECARD`: `null` until the Debrief stage is reached, then `{ dimensions: { [dimensionName]: { score: 1|2|3|4, note: string } }, avg: number, graduationStatus: string, weakestDimension: string, nextRecommendedFocus: string }`. Dimension keys are exactly the four names from `rubric-and-scoring.md`.

## Component Tree

- `App` — renders `Header` (title, phase/topic line, `StageTracker`), then `CaseBrief`, then `Exhibits`, then `Scorecard`.
- `StageTracker` — one pill per `STAGES` entry; class `stage-done` (index < `CURRENT_STAGE_INDEX`), `stage-active` (index === `CURRENT_STAGE_INDEX`), or `stage-pending` (index > `CURRENT_STAGE_INDEX`).
- `CaseBrief` — renders `CASE.situation` and `CASE.givens`.
- `Exhibits` — maps `EXHIBITS`; renders `ExhibitChart` before `ExhibitTable` when `type === 'chart'`, otherwise just `ExhibitTable`. Renders nothing (returns `null`) if `EXHIBITS` is empty.
- `ExhibitTable` — plain HTML `<table>` from `columns`/`data`.
- `ExhibitChart` — Recharts `BarChart` or `LineChart` (per `chartKind`) wrapped in a fixed-height (`260px`) `ResponsiveContainer`. Only used when an exhibit is naturally a trend/comparison — do not force a chart onto a purely categorical or log-style exhibit; a table-only exhibit is correct and sufficient.
- `Scorecard` — returns `null` while `SCORECARD` is `null`; otherwise renders the dimension table, average, graduation status, weakest dimension, and next-recommended focus.

## Building the Initial Artifact (Situation Stage)

1. Copy `references/case-template.html` and the paired `app-template.js` into the new `BC-##-.../` folder as `index.html` and `app.js`.
2. Fill `CASE`, `STAGES` (standard or Capstone variant), and any exhibits known at Situation time. Leave `CURRENT_STAGE_INDEX = 0` and `SCORECARD = null`.
3. Inline the filled `app.js` into `index.html`'s `<script type="text/babel">` block, keeping both files byte-identical in logic.

## Updating the Artifact Between Stage Transitions

The file already contains all CDN script tags, CSS, and component code —
never regenerate the whole file on a stage transition. Each transition only
needs two small, targeted edits (one in `app.js`, the identical one in
`index.html`'s inlined copy):

1. Change `CURRENT_STAGE_INDEX` to the new stage's index.
2. If the stage introduced a new exhibit (e.g. a data table revealed mid-case), append one object to the `EXHIBITS` array.

Use a targeted string-replace edit for both, not a full-file rewrite —
`index.html` is large enough that a heredoc-based full rewrite risks
blowing the shell parser limit. If a large chunk of new content does need to
be spliced in (e.g. writing the final `SCORECARD` object at Debrief), stage
the new content in the scratchpad directory first and splice it in with a
small, targeted edit rather than passing it inline through a shell heredoc.

At Debrief, the same targeted-edit approach populates `SCORECARD` with the
rubric result from `rubric-and-scoring.md`.

## Verify Before Delivery

No leftover placeholder comments or TODO markers, `STAGES.length` matches
the case type (7 standard / 10 capstone), `CURRENT_STAGE_INDEX` is the last
index (Debrief) and `SCORECARD` is non-null by the time the session ends,
every exhibit's table renders the same values as its chart, and the file
opens with an empty `#root` becoming populated with no console errors — see
`quality-checklist.md` → Functional Validation, a hard gate, not optional.
```

- [ ] **Step 2: Self-check against spec §3 and §6 step 3**

Confirm the "HTML is the case file, chat is the interviewer" division of responsibility is stated up front, exhibits always print exact values (never chart-only), and the file/numbering convention matches spec §1 exactly.

- [ ] **Step 3: Commit**

```bash
git add skills/ai-tpm-bootcamp/references/artifact-generator.md
git commit -m "docs: add ai-tpm-bootcamp artifact-generator reference"
```

---

## Task 6: `references/case-template.html` + `references/app-template.js` — Reusable Scaffold

**Files:**
- Create: `skills/ai-tpm-bootcamp/references/app-template.js`
- Create: `skills/ai-tpm-bootcamp/references/case-template.html`

**Interfaces:**
- Consumes: every constant/component name from Task 5 exactly as specified.
- Produces: the literal scaffold that Task 10's smoke test fills in and validates.

- [ ] **Step 1: Write `app-template.js`**

```javascript
const {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} = Recharts;

// ---- CASE:meta (fill per session) ----
const CASE = {
  title: "CASE_TITLE_PLACEHOLDER",
  phase: "PHASE_PLACEHOLDER",
  caseTopic: "CASE_TOPIC_PLACEHOLDER",
  situation: "SITUATION_TEXT_PLACEHOLDER",
  givens: [
    "GIVEN_1_PLACEHOLDER",
    "GIVEN_2_PLACEHOLDER"
  ]
};

// ---- CASE:stages (fill: use the 10-entry Capstone variant when applicable) ----
const STAGES = [
  "Situation", "Clarify", "Diagnose", "Decision", "Curveball", "Recommendation", "Debrief"
];

// Edited via targeted string-replace at each stage transition during the live session.
const CURRENT_STAGE_INDEX = 0;

// ---- CASE:exhibits (fill per session; omit chartKind for table-only exhibits) ----
const EXHIBITS = [];

// ---- CASE:scorecard (null until Debrief; populated when the case ends) ----
const SCORECARD = null;

function StageTracker() {
  return (
    <div className="stage-tracker">
      {STAGES.map((name, i) => {
        const state = i < CURRENT_STAGE_INDEX ? "done" : i === CURRENT_STAGE_INDEX ? "active" : "pending";
        return (
          <div key={name + i} className={"stage-pill stage-" + state}>
            <span className="stage-index">{i + 1}</span>
            <span className="stage-name">{name}</span>
          </div>
        );
      })}
    </div>
  );
}

function CaseBrief() {
  return (
    <section className="card">
      <h2>Situation</h2>
      <p>{CASE.situation}</p>
      {CASE.givens.length > 0 && (
        <div>
          <h3>Case Givens</h3>
          <ul>
            {CASE.givens.map((g, i) => <li key={i}>{g}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}

function ExhibitTable({ exhibit }) {
  return (
    <table className="exhibit-table">
      <thead>
        <tr>{exhibit.columns.map(c => <th key={c}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {exhibit.data.map((row, i) => (
          <tr key={i}>
            {exhibit.columns.map(c => <td key={c}>{String(row[c])}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ExhibitChart({ exhibit }) {
  const xKey = exhibit.columns[0];
  const yKeys = exhibit.columns.slice(1);
  const ChartComp = exhibit.chartKind === "line" ? LineChart : BarChart;
  const SeriesComp = exhibit.chartKind === "line" ? Line : Bar;
  return (
    <div style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComp data={exhibit.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {yKeys.map(k => <SeriesComp key={k} dataKey={k} />)}
        </ChartComp>
      </ResponsiveContainer>
    </div>
  );
}

function Exhibits() {
  if (EXHIBITS.length === 0) return null;
  return (
    <section className="card">
      <h2>Exhibits</h2>
      {EXHIBITS.map(ex => (
        <div key={ex.id} className="exhibit">
          <h3>{ex.title}</h3>
          {ex.type === "chart" && <ExhibitChart exhibit={ex} />}
          <ExhibitTable exhibit={ex} />
        </div>
      ))}
    </section>
  );
}

function Scorecard() {
  if (!SCORECARD) return null;
  const dims = Object.entries(SCORECARD.dimensions);
  return (
    <section className="card scorecard">
      <h2>Debrief — Scorecard</h2>
      <table className="exhibit-table">
        <thead><tr><th>Dimension</th><th>Score (1-4)</th><th>Note</th></tr></thead>
        <tbody>
          {dims.map(([name, d]) => (
            <tr key={name}><td>{name}</td><td>{d.score}</td><td>{d.note}</td></tr>
          ))}
        </tbody>
      </table>
      <p><strong>Average:</strong> {SCORECARD.avg.toFixed(2)}</p>
      <p><strong>Graduation status:</strong> {SCORECARD.graduationStatus}</p>
      <p><strong>Weakest dimension:</strong> {SCORECARD.weakestDimension}</p>
      <p><strong>Next recommended focus:</strong> {SCORECARD.nextRecommendedFocus}</p>
    </section>
  );
}

function App() {
  return (
    <div className="app">
      <header>
        <h1>{CASE.title}</h1>
        <p className="meta">{CASE.phase} &middot; {CASE.caseTopic}</p>
        <StageTracker />
      </header>
      <CaseBrief />
      <Exhibits />
      <Scorecard />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
```

- [ ] **Step 2: Write `case-template.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><!-- CASE:title -->CASE_TITLE_PLACEHOLDER</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #f6f7f9;
    color: #1b1f24;
  }
  .app { max-width: 880px; margin: 0 auto; padding: 32px 20px 64px; }
  header h1 { margin: 0 0 4px; font-size: 1.6rem; }
  header .meta { margin: 0 0 16px; color: #5a6472; font-size: 0.95rem; }
  .card {
    background: #fff;
    border: 1px solid #e2e5ea;
    border-radius: 10px;
    padding: 20px 24px;
    margin-bottom: 20px;
  }
  .card h2 { margin-top: 0; font-size: 1.15rem; }
  .exhibit-table { width: 100%; border-collapse: collapse; margin: 12px 0 20px; font-size: 0.92rem; }
  .exhibit-table th, .exhibit-table td { border: 1px solid #e2e5ea; padding: 6px 10px; text-align: left; }
  .exhibit-table th { background: #f0f2f5; }
  .stage-tracker { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
  .stage-pill {
    display: flex; align-items: center; gap: 6px;
    padding: 6px 12px; border-radius: 999px; font-size: 0.85rem;
    border: 1px solid #d7dbe1; background: #eef0f3; color: #6b7280;
  }
  .stage-pill .stage-index {
    display: inline-flex; align-items: center; justify-content: center;
    width: 18px; height: 18px; border-radius: 50%; font-size: 0.72rem;
    background: #d7dbe1; color: #1b1f24;
  }
  .stage-done { background: #e6f4ea; border-color: #b7e0c3; color: #1e6b34; }
  .stage-done .stage-index { background: #2f9e52; color: #fff; }
  .stage-active { background: #e8f0fe; border-color: #b6cef9; color: #1a4fb4; font-weight: 600; }
  .stage-active .stage-index { background: #3b73e0; color: #fff; }
  .scorecard { border-color: #b6cef9; }
</style>
</head>
<body>
<div id="root"></div>

<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
<script crossorigin src="https://unpkg.com/prop-types@15.8.1/prop-types.min.js"></script>
<script crossorigin src="https://unpkg.com/recharts@2.12.7/umd/Recharts.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"></script>
<script type="text/babel" data-presets="env,react">
<!-- CASE:app-js (inline the filled app-template.js contents here, byte-identical to the standalone app.js) -->
</script>
</body>
</html>
```

- [ ] **Step 3: Transpile-check both files**

Run Babel standalone (or esbuild) against `app-template.js` to confirm it is
syntactically valid JSX before it's ever used as a per-session starting
point:

```bash
npx --yes esbuild skills/ai-tpm-bootcamp/references/app-template.js --loader=jsx --bundle=false --format=esm --outfile=/dev/null
```

Expected: no syntax errors reported. (This checks JSX/JS syntax validity
only — `Recharts`/`React` globals are not resolvable outside a browser, so
ignore any unresolved-global warnings; a real render check happens in Task 10.)

- [ ] **Step 4: Commit**

```bash
git add skills/ai-tpm-bootcamp/references/app-template.js skills/ai-tpm-bootcamp/references/case-template.html
git commit -m "feat: add ai-tpm-bootcamp reusable case-file template"
```

---

## Task 7: `references/quality-checklist.md` — Functional Validation Gate

**Files:**
- Create: `skills/ai-tpm-bootcamp/references/quality-checklist.md`

**Interfaces:**
- Consumes: everything from Tasks 1-6 (this is the cross-check document).

- [ ] **Step 1: Write the file**

```markdown
# Quality Checklist

Run this checklist before delivering any session's artifact.

## Case Engine

- [ ] The stage sequence matches `case-engine.md` exactly for the case type (7 stages standard, 10 for Capstone).
- [ ] Every stage that closed did so via either a valid advance condition or a forcing device — never left ambiguously open.
- [ ] No closed stage was reopened; state only moved forward.
- [ ] The Recommendation stage ended the case (or, for Capstone, the second Recommendation did, after both Diagnose/Decision/Curveball loops).
- [ ] Turn caps used match the case's phase (see `case-engine.md` → Phase-Specific Tuning), not a different phase's caps.
- [ ] If a forcing device fired, the in-fiction line matches the stage's cataloged device (or a clear variant of it), not a generic "time's up."

## Curriculum and Rotation

- [ ] The case topic was not repeated within the current phase unless the phase's pool was already exhausted (check `progress-ledger.md`'s derivation rules).
- [ ] The phase-slug and case-slug used in the artifact directory name match `curriculum.md`'s slug convention.

## Rubric and Scoring

- [ ] All four dimensions were scored 1-4, each with a justification tied to specifics from this case (not a generic restatement of the rubric anchor text).
- [ ] The average was computed correctly from the four scores.
- [ ] Graduation status was computed correctly per `progress-ledger.md`'s derivation rules (3 consecutive in-phase rows ≥3.00 average).
- [ ] If a manual override was used, it is noted in the ledger row.
- [ ] The next-recommended focus names a specific dimension (if not graduating) or the next phase (if graduating).

## Artifact Structure (Case File, Not a Graded App)

- [ ] No client-side gating/grading JavaScript was added — the artifact only renders `CASE`, `STAGES`, `CURRENT_STAGE_INDEX`, `EXHIBITS`, and `SCORECARD`.
- [ ] Every exhibit's exact values are printed in a table — never chart-only.
- [ ] Charts (where used) are wrapped in a fixed-height `ResponsiveContainer` and only used for naturally trend/comparison exhibits.
- [ ] `index.html`'s inlined script matches `app.js` byte-for-byte in logic.
- [ ] No `<script type="text/babel" src="app.js">` and no leftover `CASE:` placeholder comments or `_PLACEHOLDER` strings remain.
- [ ] `prop-types@15.8.1` loaded before Recharts; Recharts URL is `Recharts.js`, not `Recharts.min.js`.

## Functional Validation (interactive — mandatory before delivery)

This section is a hard gate. An artifact that has not actually been opened
and exercised is not done. Do not claim it is verified if you could not run
these checks — say so instead.

- [ ] The app code transpiles with no syntax errors (esbuild/Babel check on the filled JSX).
- [ ] The built `index.html` opens in a real browser and mounts — `#root` is populated, not blank, and the console shows no errors on load.
- [ ] The stage tracker renders all stages; the pill at `CURRENT_STAGE_INDEX` shows the active style, earlier pills show the done style, later pills show the pending style.
- [ ] Every exhibit renders its table; any chart exhibit renders visible data and the table beneath it shows the same values.
- [ ] Once `SCORECARD` is populated, the Debrief section renders the dimension table, average, graduation status, weakest dimension, and next-recommended focus with no missing/undefined values.
- [ ] No console errors are produced while the page is open.
- [ ] If a live browser was not available, this is stated explicitly in the delivery note, and the artifact is NOT reported as verified.

## Ledger

- [ ] `progress-ledger.md` has one new row for this session in the documented column order, with Avg computed correctly.
```

- [ ] **Step 2: Commit**

```bash
git add skills/ai-tpm-bootcamp/references/quality-checklist.md
git commit -m "docs: add ai-tpm-bootcamp quality checklist"
```

---

## Task 8: `SKILL.md` — Skill Definition Tying It Together

**Files:**
- Create: `skills/ai-tpm-bootcamp/SKILL.md`

**Interfaces:**
- Consumes: every reference filename from Tasks 1-7 (all must already exist on disk — verify links resolve).

- [ ] **Step 1: Write the file**

```markdown
---
name: ai-tpm-bootcamp
description: Use when building an MBB-style AI Product Manager / Technical Product Manager case bootcamp session — a chat-driven, no-lesson-preamble case that drops the candidate straight into an evaluated seat and branches on their actual input until a forced resolution. Triggers include "AI-TPM bootcamp", "give me a bootcamp case", "drop me into a case", "TPM case practice", requests for case-based (not concept-first) AI-PM/TPM practice, or a request to continue/score an in-progress bootcamp case. This is the opposite mode of `pm-interview-coach`, which teaches a concept before any case — use this skill instead whenever the user wants pure case pressure with no lesson first.
---

# AI-TPM Bootcamp

## Purpose

Give an MBA student or working PM/TPM rigorous, case-based practice on
technical AI-PM/TPM judgment — feasibility, architecture tradeoffs, eval
design, incident response, ambiguity scoping, exec-pressure decisions — with
no concept lesson first. The candidate is dropped straight into an MBB-style
scenario, plays the AI-PM/TPM seat being evaluated, and the case branches on
their actual input until it reaches a forced resolution. See
`docs/superpowers/specs/2026-09-07-ai-tpm-bootcamp-design.md` for the full
design rationale.

## Non-Goals

- Not a concept-lesson skill — `pm-interview-coach` already does that; this skill has no Learn module.
- Not real-company research — cases are fictional/composite; no citation/fact-checking burden mid-session.
- Not a generic case-interview skill — scope is technical AI-PM/TPM judgment specifically, not general product-sense or consulting cases.

## Candidate Role

The candidate always plays the AI-PM/TPM seat being evaluated. The situation
and counterparties (engineering lead, exec, sales, legal, data science,
support) vary; the seat never does — this keeps rubric scoring comparable
across sessions.

## Directory Naming and Numbering

Every session's artifact is delivered at
`articles/ai-tpm-bootcamp/BC-##-<phase-slug>-<case-slug>/index.html`, where
`##` is a zero-padded, sequential, chronological number continuing from the
highest existing `BC-##-*` folder under `articles/ai-tpm-bootcamp/`
(increment by one per session, never reuse or renumber). Scan for the
existing highest number before creating the directory. `progress-ledger.md`
references sessions using the same `BC-##-<phase-slug>-<case-slug>` form.

## Required Reference Order

Read these files in order before running a session:

1. [progress-ledger.md](progress-ledger.md) before picking a phase/topic — read the log first.
2. [curriculum.md](references/curriculum.md) before picking the case topic.
3. [case-engine.md](references/case-engine.md) before running any live stage — this is the termination mechanism.
4. [rubric-and-scoring.md](references/rubric-and-scoring.md) before scoring the Recommendation stage.
5. [artifact-generator.md](references/artifact-generator.md) before building or editing the HTML artifact.
6. [quality-checklist.md](references/quality-checklist.md) before claiming a session's artifact is complete.

## End-to-End Session Workflow

1. Read `progress-ledger.md` — determine current phase, topics already used this phase, and (if repeating a phase) the weakest rubric dimension from the most recent row.
2. Pick the next case topic from the current phase's pool in `curriculum.md` (skip used topics; reshuffle if exhausted, or honor an explicit user request).
3. Generate the case brief and exhibits (fictional/composite, MBB-style, realistic technical detail) and write the initial HTML artifact at `articles/ai-tpm-bootcamp/BC-##-<phase-slug>-<case-slug>/index.html` per `artifact-generator.md`, `CURRENT_STAGE_INDEX = 0`.
4. Run the case live in chat: present Situation, then stay in character through Clarify → Diagnose → Decision → Curveball (twice, for Capstone), enforcing the turn caps and forcing devices from `case-engine.md`. Update `CURRENT_STAGE_INDEX` in the artifact at each transition.
5. Recommendation stage: the candidate commits to a call (or memo, for Capstone); chat drops character.
6. Score the case against `rubric-and-scoring.md`; write the scorecard and justifications into the artifact's `SCORECARD` constant; render the final Debrief state.
7. Log the session in `progress-ledger.md`: date, phase, case topic, the four rubric scores, average, graduation status.
8. Reply in 1-2 sentences: phase, case topic, scores, and graduation status. Don't re-explain the mechanics every time.

## Non-Negotiables

- **No lesson preamble.** The candidate is in the Situation stage within the first reply — never a concept explanation first.
- **Candidate always plays the AI-PM/TPM seat.** Never switch the candidate into a counterpart role.
- **Fictional/composite cases only.** Real public incidents may be used only as inspiration, never claimed as fact; no citation requirement.
- **Guaranteed termination.** Every stage has an advance condition and a turn cap; hitting the cap without a valid advance always triggers the cataloged forcing device. No path re-opens a closed stage.
- **The Recommendation stage always ends the case.**
- **The artifact is a case file, not a graded app.** No reveal buttons, no input boxes, no client-side grading JS — chat is the only place dynamism happens.
- **Exact values in every exhibit.** Every exhibit prints its values in a table; a chart is a supplement, never a replacement.
- **Gate on 3 consecutive qualifying cases, never block progress indefinitely.** Falling short retargets the next in-phase case at the weakest dimension; manual override is always honored.
- **Functional validation before delivery (mandatory).** See `quality-checklist.md` → Functional Validation. If a live browser isn't available, say so explicitly and do not claim the artifact was verified.
- **Single-file output.** One self-contained `index.html` (React + Recharts + Babel-standalone, all inlined), `app.js` kept alongside as a readable source copy.

## Output Format

Build and maintain a single self-contained HTML file at
`articles/ai-tpm-bootcamp/BC-##-<phase-slug>-<case-slug>/index.html`, with
`app.js` kept alongside as a readable, unminified source copy of the same
React code inlined into `index.html`. Never output the case as markdown
prose in chat.
```

- [ ] **Step 2: Verify all reference links resolve**

```bash
for f in skills/ai-tpm-bootcamp/references/curriculum.md \
         skills/ai-tpm-bootcamp/references/case-engine.md \
         skills/ai-tpm-bootcamp/references/rubric-and-scoring.md \
         skills/ai-tpm-bootcamp/references/artifact-generator.md \
         skills/ai-tpm-bootcamp/references/quality-checklist.md \
         skills/ai-tpm-bootcamp/progress-ledger.md; do
  test -f "$f" && echo "OK $f" || echo "MISSING $f"
done
```

Expected: all six lines print `OK`.

- [ ] **Step 3: Commit**

```bash
git add skills/ai-tpm-bootcamp/SKILL.md
git commit -m "feat: add ai-tpm-bootcamp SKILL.md"
```

---

## Task 9: Update `README.md`

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add the new module to the Structure block**

In the `articles/` block, add a line after the `product-ai/` entry:

```
  ai-tpm-bootcamp/          BC-## series — MBB-style AI-PM/TPM case bootcamp (chat-driven, no lesson preamble)
```

In the `skills/` block, add an entry after `product-ai/`:

```
  ai-tpm-bootcamp/
    SKILL.md               Skill definition for the BC-## case bootcamp
    progress-ledger.md     Cumulative memory of past bootcamp sessions and phase gating
    references/            Supporting guides (case engine, curriculum, rubric, artifact generator, QA)
```

- [ ] **Step 2: Add a line to "How it fits together"**

Append:

```
- `skills/ai-tpm-bootcamp` drives everything under `articles/ai-tpm-bootcamp/` — unlike the other skills, this one is chat-driven: the HTML artifact is a passive case file, and the live case play happens in conversation.
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document ai-tpm-bootcamp module in README"
```

---

## Task 10: Smoke-Test the Template End-to-End

**Files:**
- Create (scratch only, not committed): `/private/tmp/claude-502/-Users-siljin-sebastian-Documents-git-repos-ai-automated-article-generator/4d8e81e5-da88-42a4-b4c2-86657da966f3/scratchpad/bc-smoke-test/index.html`
- Create (scratch only, not committed): `/private/tmp/claude-502/-Users-siljin-sebastian-Documents-git-repos-ai-automated-article-generator/4d8e81e5-da88-42a4-b4c2-86657da966f3/scratchpad/bc-smoke-test/app.js`

This validates the template mechanics (Task 6) without spending a real
`BC-01` slot on a fake session — no directory under `articles/` is created
by this task.

- [ ] **Step 1: Fill a sample case from the template**

Copy `skills/ai-tpm-bootcamp/references/case-template.html` and
`app-template.js` into the scratch path above. Fill in:
- `CASE`: a sample Foundations-phase case ("Feasibility Triage: Should We Build the Support-Ticket Auto-Responder?"), 2-3 sentence situation, 2 givens.
- `EXHIBITS`: one table-only exhibit (e.g. ticket volume by category) and one chart exhibit (e.g. a 4-point cost-per-ticket trend, `type: "chart"`, `chartKind: "bar"`) — both with the same values in their tables, to check the "never chart-only" rule renders correctly.
- Leave `CURRENT_STAGE_INDEX = 3` (mid-case) for the first render pass, to check `done`/`active`/`pending` pill styling all appear at once.
- `SCORECARD`: leave `null` for the first pass.

- [ ] **Step 2: Transpile-check the filled file**

```bash
npx --yes esbuild /private/tmp/claude-502/-Users-siljin-sebastian-Documents-git-repos-ai-automated-article-generator/4d8e81e5-da88-42a4-b4c2-86657da966f3/scratchpad/bc-smoke-test/app.js --loader=jsx --bundle=false --format=esm --outfile=/dev/null
```

Expected: no syntax errors.

- [ ] **Step 3: Open in a real browser and click through**

Open the scratch `index.html` in a real browser (Claude in Chrome or
equivalent). Confirm:
- `#root` populates with no console errors.
- Stage pills 1-3 show the done style, pill 4 shows the active style, pills 5-7 show the pending style.
- Both exhibits render; the chart shows visible bars and the table beneath it shows the same 4 values.
- No Debrief/Scorecard section renders (since `SCORECARD` is `null`).

If no live browser is available, state that explicitly here instead of
claiming this step passed.

- [ ] **Step 4: Populate the scorecard and re-check**

Edit `CURRENT_STAGE_INDEX` to `6` (Debrief) and fill `SCORECARD` with sample
data for all four dimensions (mix of scores, e.g. 3, 3, 4, 3, avg 3.25,
graduationStatus "2 of 3 consecutive qualifying cases", weakestDimension
"Structuring", a sample nextRecommendedFocus string). Reload in the browser
and confirm the Debrief section renders the dimension table, average,
graduation status, weakest dimension, and next-recommended focus with no
`undefined` values, and all 7 stage pills show the done/active state
correctly for index 6.

- [ ] **Step 5: Report result, no commit**

This is a scratch validation only — do not commit the scratch files. State
in the session summary whether the browser check passed, and if a live
browser wasn't available, say so explicitly per spec §7.

---

## Task 11: Final Self-Review Against the Spec

**Files:** none (review-only).

- [ ] **Step 1: Re-read the spec section by section**

Re-open `docs/superpowers/specs/2026-09-07-ai-tpm-bootcamp-design.md` and,
for each of §1-§7, point to the specific file and section from Tasks 1-9
that implements it. Confirm all three "Open Items for Implementation Plan"
bullets are resolved:
- Exact topic lists per phase → `curriculum.md` (Task 2).
- How much of `pm-interview-coach`'s artifact-generator can be reused vs. rewritten → resolved explicitly in `artifact-generator.md` (Task 5): the CDN/script-loading section is reused verbatim; the state model and component tree are a full rewrite since this artifact has no client-side grading.
- Whether `progress-ledger.md` mirrors `pm-interview-coach`'s ledger schema → resolved explicitly in `progress-ledger.md` (Task 4): mirrors the append-only, derived-state pattern, with columns adapted to the 4-dimension rubric and phase gating instead of concept rotation.

- [ ] **Step 2: Fix any gap found**

If a requirement has no corresponding file/section, add it now (edit the
relevant file from Tasks 1-9) rather than deferring it.

- [ ] **Step 3: Final status**

Reply with a short summary: skill location, all reference files created,
smoke-test result (and whether a live browser was used), and that the
skill is ready for its first real session (`BC-01`) on next invocation.
