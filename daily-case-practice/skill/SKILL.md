---
name: daily-case-practice
description: Generates a daily consulting-style case interview practice article as an interactive Cowork artifact, mimicking real MBB (McKinsey/Bain/BCG) case interviews to build case-solving muscle memory. Use this whenever the user asks for "today's case", "a new case", "give me a case to practice", "case interview practice", "another case", or references daily case drills or case prep — even if they don't name an industry, since the skill picks one automatically from a rotation. Also use if the user asks for a case in a specific industry (e.g. "give me a banking case", "make it healthcare this time"), a specific case type (e.g. "give me a market-entry case", "do a profitability case"), asks to check or reset the case rotation, or wants to adjust the difficulty of the next case.
---

# Daily case practice

Produces one self-contained interactive HTML page, delivered as a persisted Cowork artifact, structured like a professional case-interview casebook: a prompt, gated clarifying questions, a framework step, a brainstorm step, a chart-reading step, a math/quant step, and a recommendation step. Every "answer" section stays hidden until the user has written something of their own, so the exercise can't be skipped straight to the solution.

All state and reference material for this practice lives in one place: **`daily-case-practice/`** inside the user's active project folder (e.g. `Economic Research/daily-case-practice/`). That folder contains:

- `case_tracker.md` — the rotation log (source of truth for what's been covered)
- `casebook.pdf` — a real 24-case MBB-style casebook, used as a reference for structure and variety (see step 3)
- `cases/` — the HTML file for every case generated, kept as a local record alongside the Cowork artifact
- `CLAUDE.md` — a standing brief for this initiative; read it if present, since the user may have added project-specific notes there (e.g. a paused rotation, a requested theme for the week)

## Why the structure matters

Real case interviews test several distinct skills that blur together if not separated: asking sharp clarifying questions, structuring a framework, brainstorming broadly, reading a chart quickly under time pressure, doing clean math, and synthesizing a recommendation. Keeping these as separate gated steps is what makes the practice build muscle memory rather than just being a read-through.

## Workflow

### 1. Check the tracker

Read `daily-case-practice/case_tracker.md` in the user's active project folder. If the folder or file doesn't exist yet, create both (tracker from `references/case_tracker_template.md`). Read the last 10-14 days of rows (not just the last 5-7) to see recent industries, case types, **topics**, and difficulty levels — this is the only state that persists between cases, so treat it as the source of truth for what's already been covered.

### 2. Pick industry, case type, topic, and difficulty — using the casebook for variety

Three axes need variety: **industry**, **case type** (profitability, market entry, pricing, M&A, market sizing, operations/cost, growth strategy, and so on), and **topic** (the specific underlying real-world subject the case is grounded in, e.g. "ambient AI clinical scribes," "GLP-1 drug pricing," "grid-scale battery storage").

- **Industry rotation**: roughly 55-60% of cases should be AI or Healthcare (or their intersection); the rest rotate through consumer, manufacturing, banking, retail, energy, TMT, and similar. Avoid repeating the same industry as the immediately preceding case.
- **Case type rotation**: open `daily-case-practice/casebook.pdf` and skim its table of contents (case list with industry, difficulty, and implied case type) for inspiration on the range of case types real interviews use, and to see which types the tracker hasn't touched recently. Use it as a source of structural variety and realistic difficulty calibration — never copy a casebook case's company, numbers, or scenario verbatim; always invent an original fictional company and problem, grounded separately in a real current dynamic (step 4).
- **Topic cooldown rule**: check the `Topic` column and its `Date` against today. If a topic was used within the last **14 days**, don't reuse it — pick a different real-world dynamic to ground the new case in, even if industry and case type repeat. Once 14 days have passed, reusing a topic is encouraged, not just allowed — repetition on a topic the user has seen before builds muscle memory on that subject specifically. This check is about the underlying topic (e.g. "ambient AI scribes"), not the industry/case-type label, since two cases can share an industry and case type while covering completely different topics.
- If the user names an industry, case type, topic, or difficulty explicitly, honor that request and log it as such, overriding the cooldown if they ask for the same topic again sooner — the rotation logic is a default, not a constraint on the user.
- Vary difficulty day to day: alternate between short drills (~15 minutes — one framework question, one brainstorm, one quick math check, no chart) and full cases (~30-40 minutes — the complete structure below). Avoid the same difficulty three days running unless asked.

### 3. Ground it in something real

Before writing content, run a web search for a current, real dynamic in the chosen industry — a pricing shift, a regulatory change, an M&A story, an adoption or margin trend. Real case interviews are usually inspired by live business situations, and grounding the fictional company's problem in something real is what makes the practice transferable rather than a generic template. Cite 1-2 sources in the artifact's footer with real links.

### 4. Write the case content

Invent a fictional company and problem in the chosen industry and case type, grounded in the real dynamic from step 3. For a full case, prepare:

- **Prompt** (2-4 sentences) plus 2-4 "case givens" (context a real interviewer would offer if asked, not gated behind a clarifying question)
- **5 clarifying questions** a strong candidate would ask, each with several tag phrasings (to catch different ways of asking the same thing) and a short answer
- **Framework**: 3-5 buckets the candidate should land on, with a one-line rationale for each — shaped by the case type (e.g. a market-entry framework looks different from a profitability framework; check the casebook's example structures per case type if unsure)
- **Brainstorm prompt**: a specific question with 4-8 reference ideas grouped into 2-3 categories
- **Chart**: one bar or line chart (Chart.js) with a full data table underneath printing every exact value — never leave a number implicit in a bar height alone; the point is analysis practice, not guessing pixel heights
- **Quant exercise**: 2-4 pieces of data revealed via clickable chips (mimicking "ask the interviewer"), a worked calculation, and a sanity-check or advanced comment that questions the raw number rather than just reporting it
- **Recommendation**: model answer plus the single biggest risk

For a short drill, keep only the framework, brainstorm, and one quick calculation — skip the chart and full recommendation.

### 5. Assemble the HTML

Start from `references/case_template.html`. It already contains the tested CSS, the clarifying-question matching JavaScript, the gated-reveal JavaScript, and the Chart.js setup — don't rewrite this scaffolding from scratch each time. Replace the placeholder content blocks (each marked with an HTML comment like `<!-- CASE:prompt -->`) with the new case's content, and fill in the `CLARIFYING_QUESTIONS` and chart-data JavaScript arrays near the bottom of the file.

Clarifying-question matching is hybrid (added 2026-07-04, after the keyword-only version missed a validly-phrased question): it first tries semantic matching via the artifact's `window.cowork.askClaude()` bridge, which judges intent rather than shared words, and falls back to a tuned keyword matcher (stopword stripping, light stemming, 0.4 overlap threshold) if that bridge is unavailable — e.g. if the standalone copy in `cases/` is opened outside Cowork. Still write generous, varied `tags` phrasings per canonical question, since the keyword fallback depends entirely on them.

Write the finished HTML into `daily-case-practice/cases/case_<date>_<company-slug>.html` in the user's project folder — this keeps a local copy alongside the tracker, separate from the Cowork artifact.

### 6. Create the artifact

Call `mcp__cowork__create_artifact` with `html_path` pointing at the file from step 5, a descriptive kebab-case `id` (e.g. `case-<company-slug>-<topic>`), and a `description` summarizing the case, its type, and its real-world grounding source.

### 7. Log it

Append one row to `daily-case-practice/case_tracker.md`: date, industry, case type, topic, difficulty, title. The topic should be a short, specific phrase naming the real-world dynamic the case was grounded in (step 3) — this is what the topic cooldown check in step 2 reads on future invocations, so keep it precise rather than restating the industry.

### 8. Reply briefly

Tell the user what the case is about (company, industry, case type, difficulty) in 1-2 sentences and that it's ready in the artifact. Don't re-explain the whole structure every time — they've seen it before.
