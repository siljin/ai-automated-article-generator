# AI-PM / TPM Case Bootcamp — Design Spec

Date: 2026-09-07
Status: Approved by user, pending implementation plan

## Problem

MBA students preparing for AI Product Manager and Technical Product
Manager roles need rigorous, case-based practice — not concept lessons.
Existing repo skill `pm-interview-coach` teaches a concept first (Learn
module), then shows a real-company case, then a gated original practice
case. That structure is deliberately concept-first. This bootcamp is the
opposite: no lesson preamble, the candidate is dropped straight into an
MBB-style case scenario, plays the AI-PM/TPM being evaluated, and the
case branches dynamically on their actual input until it reaches a
forced resolution.

The open risk with any freeform, chat-driven case is that the session
never definitively ends. This spec's core mechanism (Section 3) exists
specifically to guarantee termination regardless of candidate input.

## Non-Goals

- Not a concept-lesson skill (that's what `pm-interview-coach` already does).
- Not real-company research (no citation/fact-checking burden mid-session — see Section 5).
- Not a generic case-interview skill — scope is technical AI-PM/TPM judgment specifically (feasibility, architecture tradeoffs, eval design, incident response, ambiguity scoping, exec-pressure decisions).

## 1. Identity & Storage

New skill: `skills/ai-tpm-bootcamp/`
- `SKILL.md` — skill definition
- `progress-ledger.md` — cohort phase, per-session rubric scores, graduation status per phase, topics already used per phase
- `references/` — supporting docs (case-engine mechanics, curriculum/topic catalog, rubric & scoring, artifact-generator, quality checklist), mirroring the reference-doc pattern used by `pm-interview-coach` and `product-ai`.

Session output: `articles/ai-tpm-bootcamp/BC-##-<phase-slug>-<case-slug>/index.html`, numbered sequentially (scan existing `BC-##-*` folders for the next number, same convention as `PR-##`, `ER-##`, `PM-##`).

## 2. Candidate Role & Content Scope

The candidate always plays the AI-PM/TPM seat being evaluated — the
situation and counterparties (engineering lead, exec, sales, legal,
data science, support) vary, the seat doesn't. This keeps rubric
scoring comparable across sessions.

Cases are fictional/composite, MBB-style disguised clients with
realistic technical detail (real-world architectures, plausible
numbers, real public incidents usable only as inspiration, never
claimed as fact). No citation requirement, unlike `pm-interview-coach`'s
Observe module — sessions run live in chat and can't be fact-checked
mid-case.

## 3. Case Engine — Hybrid HTML + Chat, Guaranteed Termination

**Fixed stage sequence** (finite state machine, not open dialogue):

```
Situation → Clarify → Diagnose → Decision → Curveball → Recommendation → Debrief
```

Capstone-phase cases may repeat the Diagnose→Decision→Curveball loop
twice for a larger case; still a bounded, finite sequence.

**Division of responsibility:**
- The HTML artifact is the case file: static case brief, exhibits (numbers, architecture diagrams, logs — every value printed exactly, never read off a chart alone), a stage tracker, and the final rubric scorecard.
- Chat is the live interviewer/stakeholders — genuinely reacts to whatever the candidate types, asks follow-ups, argues back, throws curveballs. This is where the actual dynamism lives.

**Termination guarantees:**
- Each stage has an advance condition (candidate produced the required output type for that stage — a clarifying question, a diagnosis, a tradeoff call, a recommendation).
- Each stage has a turn cap (~3 exchanges). Hitting the cap without a valid advance triggers an in-fiction forcing device ("the exec walks in, you have 30 seconds — give your call now") that moves the case forward regardless.
- The Recommendation stage always ends the case: candidate commits to a call, the artifact renders the scorecard + reference reasoning, chat drops out of character for Debrief.
- No path re-opens a closed stage. State only moves forward.

**Edge cases:**
- Candidate goes silent / gives a non-answer at the turn cap → forcing device fires, case still ends on schedule.
- Candidate jumps straight to a recommendation from Situation → allowed; Structuring rubric score takes the hit; case still ends (a short, weak run is valid, not an error).
- Candidate derails mid-case (off-topic question) → chat answers briefly in character if plausible, otherwise redirects in character ("the room doesn't have that info, what do you do with what you've got"); stage progression is never blocked by a derail.

## 4. Curriculum — Five Escalating Phases

| Phase | Focus | What tightens |
|---|---|---|
| Foundations | Feasibility triage, metrics/eval design, data readiness, basic build-vs-buy | Longest turn caps, most forcing-device leniency |
| Tradeoffs | Cost/latency/quality tradeoffs, privacy vs feature richness, vendor vs in-house, prioritization under conflicting eng estimates | Tighter turn caps, exhibits get noisier (conflicting numbers) |
| Ambiguity | Underspecified exec asks, silent-failure/hallucination triage, cross-functional standoffs, new-modality scoping | No spoon-fed problem statement — candidate must scope the case themselves in Situation/Clarify |
| Executive-pressure | Live incident requiring rollback-vs-patch call, defending a behind-schedule bet to execs, bias/safety escalation, competitive-response | Hard time pressure in-fiction, curveball stage always fires, shortest caps |
| Capstone | Multi-axis extended case combining strategy + architecture + incident + exec pressure, ends in a written decision memo | Double diagnose/decision/curveball loop, highest rubric bar |

Topic pool is per-phase, rotates without repeat until the phase's list is exhausted, then reshuffles. `progress-ledger.md` tracks topics used per phase to enforce this.

## 5. Rubric & Gating

Every case is scored 1-4 on four dimensions:
- **Structuring** — did they scope/frame before answering
- **Technical judgment** — right tradeoff, right question asked of the data/architecture
- **Reasoning under ambiguity/pressure**
- **Communication** — clear recommendation, defensible, acknowledges the road not taken

**Gating:** graduate a phase after 3 consecutive cases averaging ≥3/4. Falling short → next case in-phase specifically targets the weakest-scoring dimension (not a literal repeat of the same case). Manual override always available ("skip ahead anyway").

## 6. End-to-End Session Workflow

1. Read `progress-ledger.md` — determine current phase, topics already used this phase, weakest rubric dimension if repeating a phase.
2. Pick next case topic from current phase's pool (skip used ones; reshuffle if exhausted).
3. Generate case brief + exhibits (fictional/composite, MBB-style, realistic technical detail) and write the HTML artifact shell (single-file, React + Recharts + Babel-standalone — same artifact pattern as `pm-interview-coach`) at `articles/ai-tpm-bootcamp/BC-##-<phase>-<case-slug>/index.html`.
4. Run the case live in chat: present Situation, stay in character through Clarify → Diagnose → Decision → Curveball, enforcing turn caps and forcing devices per Section 3.
5. Recommendation stage: candidate commits, chat drops character.
6. Score against the rubric; write scorecard + reference reasoning into the artifact's Debrief stage; render final state.
7. Log the session in `progress-ledger.md`: date, phase, case topic, rubric scores, graduation status, next-recommended focus.
8. Reply in 1-2 sentences: phase, case topic, scores, graduation status.

## 7. Testing / Validation

Before delivery: transpile-check the HTML artifact and click through the stage tracker and scorecard rendering in a real browser — same mandatory functional validation `pm-interview-coach` requires. If a live browser isn't available, say so explicitly rather than claiming it was checked.

## Open Items for Implementation Plan

- Exact topic lists per phase (this spec names focus areas per phase; the reference doc for curriculum should enumerate concrete case titles, e.g. 4-6 per phase).
- Artifact-generator reference doc: how much of `pm-interview-coach`'s `artifact-generator.md` can be reused verbatim vs needs a stage-tracker/rubric-scorecard-specific rewrite.
- Whether `progress-ledger.md`'s format should mirror `pm-interview-coach`'s ledger schema for consistency.
