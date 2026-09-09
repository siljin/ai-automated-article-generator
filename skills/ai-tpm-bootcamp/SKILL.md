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
7. Log the session in `progress-ledger.md`: date, phase, case topic, the four rubric scores, average, graduation status, and the artifact's `SCORECARD.nextRecommendedFocus` text in the Notes column.
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
