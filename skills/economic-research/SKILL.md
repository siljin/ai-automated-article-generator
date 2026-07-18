---
name: interactive-research-articles
description: Use when building institution-grade interactive research articles as React learning artifacts for economic, business, policy, market, science, technology, or healthcare topics, including terse prompts that provide only a topic; topic-only prompts require fully automated generation without clarifying or design-approval loops.
---

# Interactive Research Articles

## Purpose

This skill orchestrates end-to-end construction of institution-grade research articles delivered as interactive learning artifacts. The research standard is a Federal Reserve FEDS Note or IMF Working Paper: paradox opening, explicit research questions, evidence-backed sections, comparative benchmarks, implication synthesis. The delivery standard is active learning: charts prompt before revealing, questions demand reasoning before explanation, and the artifact progresses from comprehension to analysis to application.

## Default Topic Handling

If the user provides only a topic, such as `topic: AI Product Manager`, and does not explicitly request another deliverable, treat it as a request to build a new interactive research article in the same style as the current artifact: static React learning article, freely navigable sections (no locking or padlocks), full-visibility charts with gated so-what reveals, scored questions, source-backed prose, and a learning summary. Create a new article-specific artifact rather than replacing an existing one unless the user asks for a revision.

Do not ask clarifying questions for topic-only prompts. Infer the best possible audience, domain frame, research question, and artifact shape from the topic, then proceed end-to-end. State assumptions only in the final note if they matter.

Do not run a separate brainstorming or design-approval loop for topic-only prompts. This skill's default topic handling is the brainstorming, design, implementation, and verification workflow. If a generic workflow suggests asking the user to approve a design before implementation, follow this skill instead for topic-only article generation.

For topic-only prompts, the deliverable directory must be a folder under `articles/economic-research/` named `ER-##-<topic-slug>/`, where `##` is a zero-padded, sequential, chronological number (`01`, `02`, ... continuing from the highest existing `ER-##-*` folder under `articles/economic-research/`, incrementing by one regardless of date — never reuse or renumber an existing article's number). For example `/Users/.../Economic Research/articles/economic-research/ER-08-ai-product-manager-value/`. Before creating the directory, scan `articles/economic-research/` for existing `ER-##-*` folders to determine the next number. Do not leave the deliverable only in a hidden worktree, branch-only path, or `artifacts/` subdirectory. Worktrees may be used internally for isolation, but the finished artifact must be copied or created at the `articles/economic-research/ER-##-<topic-slug>/` folder before delivery. Any reference or tracking file (e.g. `_progress-ledger.md`) that records the topic slug must use the full `ER-##-<topic-slug>` form so the numbering stays consistent everywhere the article is referenced.

The finished article must be direct-file-open compatible and delivered as a **single self-contained `index.html`**: inline the React/Babel app code AND the CSS into `index.html` (a `<style>` block, no external `styles.css`), so the one file opens from a local path or email attachment with only pinned CDN runtime dependencies. Do not use `<script type="text/babel" src="app.js">`, which fails under `file://` because Babel loads external scripts through XHR. Keep `app.js` alongside as a readable source copy only; the deliverable is `index.html`. Verify that the inline `index.html` script matches `app.js` and that no external `text/babel` app script or `styles.css` link remains.

When using Recharts from a CDN, use the verified UMD path `https://unpkg.com/recharts@2.12.7/umd/Recharts.js`. Do not use `Recharts.min.js` for this version; that path returns 404 and leaves `Recharts` undefined at runtime.

Load `https://unpkg.com/prop-types@15.8.1/prop-types.min.js` before Recharts. The Recharts UMD build calls its factory with `window.PropTypes`; without that global, Recharts fails during script evaluation.

The final answer must include links to the top-level folder and its `index.html`, plus a concise verification summary. If a hidden worktree or feature branch was used, mention it only as implementation provenance, not as the primary deliverable location.

## Persona

Act as a senior research economist and Socratic instructor simultaneously. Write with the analytical precision of a Bloomberg Intelligence report. Design questions with the rigor of a McKinsey case interviewer. Never give the answer before the reader has been forced to think.

## Required Reference Order

For a full article artifact, read these reference files in order before implementation:

1. [sourcing-and-citations.md](references/sourcing-and-citations.md) before web research or thesis selection.
2. [article-structure.md](references/article-structure.md) before drafting prose or section outlines.
3. [chart-and-question-design.md](references/chart-and-question-design.md) before selecting charts or writing questions.
4. [artifact-generator.md](references/artifact-generator.md) before building the React artifact.
5. [quality-checklist.md](references/quality-checklist.md) before claiming the artifact is complete.

If the task is only to revise one part of an existing artifact, read this file plus the relevant reference file and the quality checklist.

## End-to-End Workflow

1. Identify the central paradox and 2 to 3 research questions.
2. Run source discovery and gather citeable factual data.
3. Structure the article using the required section sequence.
4. Select charts that reveal trends, divergence, mix shifts, benchmark gaps, or relationships, matching each analytical job to the right McKinsey-style chart type (waterfall, slope, dumbbell, marimekko, indexed line, dot plot, small multiples, quadrant scatter) rather than defaulting to bar charts.
5. Write questions that test implication and reasoning rather than recall (answers reveal on submit; sections are never locked).
6. Create or select the top-level `<topic-slug>/` artifact directory in the workspace root.
7. Build a single self-contained React artifact with chart reveals, scoring, free section navigation (a left section navbar plus always-enabled Back/Next), and a learning summary.
8. Inline the final `app.js` and the CSS into `index.html` for a single-file, direct-file-open deliverable.
9. Run the quality checklist, browser or static verification, and source guards before delivery.

## Non-Negotiables

- Plain language: write so a newcomer follows every sentence on first read — short sentences, common words, no filler, every term/acronym explained in plain words on first use. Simpler language, not simpler thinking; rigor and citations stay intact.
- Per-page glossary: every page ends with a short glossary of the new terms and acronyms it introduced (acronyms spelled out, one-line plain definitions); pages with no new terms omit it.
- No answer leakage: do not ask for facts stated in the immediately preceding prose, caption, or visible chart label.
- Numeric estimation questions must teach the estimation method after reveal.
- Multiple-choice correct answers must be balanced across A, B, C, and D.
- Chart types must be varied and fit-for-purpose (McKinsey/BCG-style), not uniform bar charts: use at least three distinct chart types across the article, no more than one plain single-series bar chart, and at least one structure/contribution exhibit (waterfall, marimekko, stacked area, or 100% stacked) where the topic involves a decomposable total, a mix shift, or a change with drivers.
- Every chart carries exactly two interpretation questions of two different kinds (so-what, quantitative reasoning, qualitative/mechanism, or causal/comparative) — never two so-whats, and at least one must not be a so-what.
- The final recommendation question must include risks, challenges, trade-offs, or failure modes.
- Production before consumption: chart values are always visible, but at each chart the reader must submit an answer to both interpretation prompts before each prompt's authored answer is revealed; the reader also drafts the governing thesis and key insight before the artifact reveals its own.
- Each article must exercise critical thinking: at least one question separating correlation from causation, at least one naming the thesis's load-bearing assumption or what would falsify it, and distractors mapped to named reasoning errors.
- Do not capture a pre-reveal confidence rating on any question. After each answer reveals, the calibration note names the specific reasoning error when the reader is wrong (drawn from the distractor-to-misconception mapping), never a confidence level. The learning summary reports score-by-type and numeric bias, not confidence calibration.
- Free section navigation: every section is always accessible in any order via a left section navbar (scroll-spy + click-to-jump, hidden below ~1160px) and always-enabled Back/Next. Never lock, gate, padlock, or mute a section. The only production-before-consumption gating allowed is at the chart interpretation prompts and the learning summary's own reflect-before-reveal steps — these never block navigation.
- Single-file output: the delivered artifact is one self-contained `index.html` with CSS and app code inlined (no external `styles.css`); `app.js` is kept only as a readable source copy.
- The Apply It must require a recommendation plus its load-bearing assumption, the strongest disconfirming evidence from the article, and a one-line pre-mortem, evaluated on reasoning rather than keyword presence.
- Every numeric value must be labeled FACT (cited and verified against its source), ESTIMATE (derived from stated inputs or assumptions), or ILLUSTRATION (disclosed synthetic teaching data); no ESTIMATE or ILLUSTRATION may be presented as a sourced fact, and primary sources are preferred for FACTs.
- Each article artifact must live in its own top-level workspace directory named `ER-##-<topic-slug>/`, numbered sequentially and chronologically from the highest existing `ER-##-*` folder; never overwrite an existing artifact directory or renumber a prior article unless the user explicitly asks to revise that existing article.
- Topic-only prompts are automation triggers: avoid do-and-fro, make conservative best-match assumptions, build, verify, and deliver.
- If this file and a reference file conflict, this file wins. Patch the reference rather than working around the conflict during generation.

## Output Format

Build and render a single self-contained React artifact in a top-level article-specific directory. Do not output the article as markdown prose in chat. The artifact is the deliverable; all article content, charts, questions, navigation, and the learning summary screen belong inside it.
