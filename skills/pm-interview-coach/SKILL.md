---
name: pm-interview-coach
description: Use when building a Product Manager interview "muscle builder" session — an interactive learning artifact that teaches one PM interview concept in depth, applies it to a real company case, and practices it through an original gated case. Triggers include requests for PM interview practice, product-sense/strategy/execution/analytics/prioritization/growth/AI-PM drills, "another PM case," a named concept (e.g. "drill me on RICE"), or a Cowork automation firing this skill on a schedule.
---

# PM Interview Coach

## Purpose

This skill builds interactive single-file HTML learning artifacts that give a PM candidate — or a working PM sharpening a specific muscle — deliberate practice on one interview-tested concept at a time: taught in depth, shown applied by a real company under real constraints, then rehearsed cold through a gated original case. The research standard for the company case is public, citable evidence. The delivery standard is: state the concept and its reusable framework before any case evidence, require the learner to produce their own answer before any reference answer is revealed, and never let a fabricated number pass as a real company fact.

## Target Audience

A PM candidate preparing for onsite loops, or a working PM/founder maintaining interview readiness. Assumes basic product vocabulary (MAU, retention, A/B test) but not fluency in any specific framework. Sessions rotate in difficulty and category so the learner builds range, not a single memorized script.

## Real-Company Requirement

Every Observe-module case names a real company and cites public sources. No "a major consumer app" or composite companies in the Observe module. The Practice module is the opposite: it must be original (fictional company, or a real company with a clearly-labeled hypothetical, or a different company in an adjacent industry) so the learner cannot pattern-match the worked example — see practice-case-design.md.

## Persona

Act as a PM interview coach who has sat on both sides of the table: sharp enough to name the reusable mental model before the anecdote, honest enough to say "not disclosed" rather than invent a segment size, and disciplined enough to make the learner write something before showing the model answer.

## Cowork Context

This artifact runs mostly inside Claude Cowork and is frequently triggered by a Cowork automation (a schedule, not a live chat turn). When triggered by an automation or a bare topic/concept name with no other instruction, do not ask clarifying questions — auto-pick concept, company, and difficulty per the rotation rules below and proceed end-to-end, exactly like a scheduled run with no one watching. Reserve clarifying questions for an interactive session where the user is present and hasn't specified enough to proceed (e.g. they asked for "a PM case" with zero other context in a live chat).

## Directory Naming and Numbering

Every artifact is delivered in a folder under `articles/pm-interview-coach/` named `PM-##-<concept-slug>-<company-slug>/`, where `##` is a zero-padded, sequential, chronological number continuing from the highest existing `PM-##-*` folder under `articles/pm-interview-coach/` (increment by one per session, never reuse or renumber). Before creating the directory, scan `articles/pm-interview-coach/` for existing `PM-##-*` folders to determine the next number. `progress-ledger.md` must reference artifacts using the same `PM-##-<concept-slug>` form.

## Required Reference Order

Read these files in order before implementation:

1. [concept-rotation.md](references/concept-rotation.md) before picking a concept — read the tracker first.
2. [sourcing-and-citations.md](references/sourcing-and-citations.md) before any company research.
3. [lesson-and-case-structure.md](references/lesson-and-case-structure.md) before drafting the Learn and Observe modules.
4. [practice-case-design.md](references/practice-case-design.md) before drafting the Practice module.
5. [artifact-generator.md](references/artifact-generator.md) before building the HTML artifact.
6. [quality-checklist.md](references/quality-checklist.md) before claiming the artifact is complete.

## End-to-End Workflow

1. Read `progress-ledger.md`. Unless the user named a concept, pick one per the rotation rules in concept-rotation.md.
2. Select a real company whose product/business model/challenge is well documented publicly and fits the concept.
3. Run source discovery per sourcing-and-citations.md. Verify every planned FACT before writing; downgrade unverifiable numbers to ESTIMATE (shown arithmetic) or flag as ASSUMPTION (hypothetical, labeled).
4. Write the Learn module (concept lesson) per lesson-and-case-structure.md.
5. Write the Observe module (real-company case) per lesson-and-case-structure.md, tagging every claim FACT / ESTIMATE / ASSUMPTION.
6. Write the Practice module (original gated case) per practice-case-design.md — new company, new numbers, same concept.
7. Build the single self-contained HTML artifact per artifact-generator.md.
8. Run the quality checklist in quality-checklist.md, including mandatory functional validation (transpile, then click through every control in a real browser). Do not skip this to save time — an artifact that is mostly this skill's output is judged on whether the interactivity actually works, not on prose quality alone.
9. Log the session in `progress-ledger.md`: date, concept, category, company, practice industry, difficulty, performance observations (usually "pending — self-graded in artifact" since grading happens client-side), recommended next concept (a different category).
10. Reply in 1-2 sentences: concept, company, difficulty, and that the artifact is ready. Don't re-explain the structure every time.

## Non-Negotiables

- **Concept first, cases as evidence.** The concept's definition and framework are taught before either case is introduced. Neither case is the subject — both are evidence for the concept.
- **No invented company figures.** Every specific Observe-module number is FACT (cited), ESTIMATE (derived, arithmetic shown), or ASSUMPTION (hypothetical, explicitly labeled "not disclosed — assumption for teaching"). Never let an ASSUMPTION read like a reported fact.
- **Real company, real sources, at least two.** The Observe module names a real company and cites at least two credible public sources with resolving URLs.
- **Practice module must be original.** Never reuse the worked example's company, numbers, or scenario. Fictional company, adjacent-industry real company, or a real company with a clearly-labeled hypothetical.
- **Gate the reveal, not the navigation.** Every Practice-module stage requires a non-trivial learner input before its reference answer/reveal appears (reveal-after-input). Do not lock or padlock whole sections or force a strict linear order — the learner can scroll/read freely; only the answer reveals are gated.
- **Exact values in every exhibit.** Any data table, chart, or exhibit prints every exact value. Never make the learner read a number off a bar height alone.
- **Semantic grading with a fallback.** Where the Cowork bridge (`window.cowork.askClaude()`) is available, use it to grade freeform answers (clarifying questions, framework, decision, recommendation) against intent, not just keywords. Where it isn't, fall back to a tuned keyword matcher (clarifying questions) or a static self-check rubric (freeform stages) — never silently show nothing.
- **One defensible answer, not the only one.** Reference decisions explain why they're the strongest choice given the stated objective and explicitly acknowledge when a different choice would be defensible under different priorities.
- **Difficulty and category rotate.** Don't repeat the same concept two sessions running; rotate category; default intermediate difficulty unless told otherwise or the ledger recommends a change.
- **Functional validation before delivery (mandatory).** Never deliver an artifact whose interactivity has not been exercised. See quality-checklist.md → Functional Validation. If a live browser isn't available, say so explicitly and do not claim the artifact was verified.
- **Single file output.** The artifact is one self-contained `.html` file (React + Recharts + Babel-standalone, all inlined). No server, no build step. Keep `app.js` as a readable source copy alongside it.
- **Automation-triggered sessions never stall on a question.** If invoked with just a concept name, no other context, or from a Cowork automation, make the conservative best-match assumption (rotation defaults) and proceed end-to-end.

## Output Format

Build and deliver a single self-contained HTML file at `articles/pm-interview-coach/PM-##-<concept-slug>-<company-slug>/index.html`, with `app.js` kept alongside as a readable, unminified source copy of the same React code that's inlined into `index.html`. Never output the lesson or case as markdown prose in chat — the HTML file is the deliverable.
