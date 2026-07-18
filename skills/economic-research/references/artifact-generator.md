# Artifact Generator

## Output Rule

Build one static React learning artifact. Do not output the article as markdown prose in chat. The artifact is the article.

For this skill, "self-contained" means the delivered `index.html` runs on its own without a bundler, build step, local server, or external local file fetch. Pinned CDN runtime dependencies are acceptable. The React/Babel app code **and** the CSS must be inlined in `index.html` (the CSS in a `<style>` block — no external `styles.css`). Keep `app.js` only as a readable source copy; the single-file `index.html` is the deliverable.

## Artifact Directory Rule

Every article gets its own directory:

```text
<workspace-root>/
  topic-slug/
    index.html   # the single-file deliverable: app code + CSS inlined
    app.js       # readable source copy only (not the deliverable, no styles.css)
```

Before writing files:

1. Generate a concise, lowercase, hyphenated topic slug from the article topic.
2. Check whether `<workspace-root>/<topic-slug>/` already exists.
3. If it does not exist, create it and write the artifact there.
4. If it exists and the user explicitly asked to revise that existing article, modify files in that directory.
5. If it exists and the user asked for a new article, create a distinct slug such as `topic-slug-2` or a more specific slug. Do not overwrite the existing directory.

Never write new article files directly to the workspace root. Existing root-level `index.html`, `app.js`, or `styles.css` files are legacy/generated files and must not be overwritten for a new article unless the user explicitly asks to migrate or revise them.

Never leave the finished deliverable only under `artifacts/`, a hidden worktree, a branch-only path, or a temporary directory. Internal scratch paths are allowed, but the delivered artifact must be present at `<workspace-root>/<topic-slug>/`.

## Direct-File-Open Script Rule

Use this dependency pattern in `index.html` unless the artifact already has a stricter local dependency strategy:

```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>/* inline the full stylesheet here — no external styles.css */</style>
  <script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/prop-types@15.8.1/prop-types.min.js"></script>
  <script crossorigin src="https://unpkg.com/recharts@2.12.7/umd/Recharts.js"></script>
  <script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="env,react">
    /* inline the app.js contents here */
  </script>
</body>
```

Do not use `<script type="text/babel" src="app.js">`; it is error-prone under `file://` because Babel fetches external scripts through browser APIs blocked by local-file origin rules.

Do not use `https://unpkg.com/recharts@2.12.7/umd/Recharts.min.js`; that URL returns 404 and causes `Uncaught ReferenceError: Recharts is not defined`.

Do not omit `prop-types` when using the Recharts UMD build. Recharts expects `window.PropTypes` and can fail before it creates `window.Recharts` if the dependency is missing.

After inlining, verify that the inline Babel script matches `app.js`, that no `__APP_CODE__` placeholder remains, and that no external `text/babel` app script remains.

## State Model

Implement:

- `activeSection`: integer tracking the section currently in view (from the scroll-spy). There is **no** `sectionUnlocked` state — all sections are always rendered and navigable.
- `questionState`: object per question tracking `answered`, `selectedOption`, `isCorrect`, and `submitted`. Do **not** store a `confidence` field.
- `score`: running tally of correct answers.
- `interpretationSubmitted`: per chart, a two-element boolean array — each entry flips to `true` as soon as the reader submits their answer to that interpretation prompt. Each authored answer is gated by its own flag.
- `readerInterpretations`: per chart, the reader's two typed answers (and any pre-reveal magnitude prediction), stored for comparison and the summary.

## Navigation Rules

Free navigation — nothing is ever locked (matches the Technical Product Intelligence skill).

- Render every section on one scrollable page, each in a `<section id="sec-N">` container. All sections are always accessible in any order.
- **Left section navbar (required on wide viewports).** A fixed left-gutter navbar lists every section (Warm-Up, Introduction, Background, each research-question section, Learning Summary, Conclusion). The entry for the section in view is highlighted (accent left-border + tinted background + bold); clicking any entry smooth-scrolls to it. Track the active section with a scroll listener that picks the last section whose top has passed a small offset. Hide the navbar below ~1160px (track `window.innerWidth` with a resize listener) so narrow screens keep the single-column layout.
- Back/Next buttons are always enabled and simply scroll to the previous/next section. Never disable Next, never show a padlock, never mute a "locked" section.
- A fixed progress bar reflects the reader's position across the sections; a score badge updates live.
- The only production-before-consumption gating is at the chart interpretation prompts and the Learning Summary's own reflect-before-reveal steps. These gate a specific reveal, never section navigation.

## Chart Display and Interpretation Mechanic

**Full data visibility rule.** Every chart renders with full data visibility from the start — all Y-axis values, data labels, tick marks, and tooltips are shown. Do not mask, blur, or hide any chart values. The reader needs full visibility of actual data to interpret the chart effectively and generate meaningful insights.

**CRITICAL — Chart precedes its questions:** The chart must appear in the rendered DOM above every question that references it. Never render a question about a chart before the chart itself. All chart questions must be immediate siblings below the chart container, not above it.

**Two-question interaction:** Below each chart, render two interpretation prompts of different kinds (see the Two interpretation questions per chart rule in chart-and-question-design.md — never two so-whats). For each prompt, require the reader to submit their own answer (minimum 15 characters) before that prompt's authored answer appears; the two prompts are gated independently. Vary the prompt wording to the kind chosen, e.g. "In one sentence, what is the so what — what should a decision-maker do differently?", "Estimate the [rate/gap/ratio] and say what it implies.", or "Why is the pattern shaped this way?" At least one prompt per article must require a quantitative prediction (magnitude, slope, ratio, or rank order).

**CRITICAL — Authored interpretation hiding:** Each authored answer must not exist in the React tree until its own `interpretationSubmitted[i][j]` flag is `true`. Implement with conditional rendering: `{interpretationSubmitted[i][j] && <div className="authored-interpretation">...</div>}`. Do NOT place an authored answer in the DOM and use CSS to hide it. CSS-hidden text exists in the page source and defeats the learning objective.

After the reader submits an answer, display the matching authored answer directly beneath the reader's own, under "Compare your answer to the authored one." Show feedback that explains the specific data point, trend, benchmark implication, or mechanism, and link to the article argument, and prompt one optional self-explanation ("In one sentence, why does the data move this way?") that is stored and echoed in the Learning Summary. The reader's answers and self-explanation are not scored; their purpose is production before consumption.

## Chart Type Implementation (Recharts)

Do not reach for `<BarChart>` by reflex. Select the chart type per the palette and Chart Variety Mandate in chart-and-question-design.md, then implement it with these Recharts building blocks. All types below are buildable with the pinned Recharts 2.12.7 UMD build already loaded — no extra libraries.

- **Line / indexed line** — `<LineChart>` with one `<Line>` per series. For an indexed chart, rebase the data to 100 at the common start period before passing it in, and label the axis "Index (start = 100)". Use `<ReferenceLine y={100}>` to mark the baseline.
- **Slope chart** — `<LineChart>` with exactly two categories on the X axis (e.g., "2019", "2024") and one `<Line>` per entity; hide the X grid, keep dots, and label each line's endpoint with a `<LabelList>`. This reads as a slope/rank-change exhibit.
- **Stacked area** — `<AreaChart>` with `<Area stackId="1">` per series.
- **Waterfall / bridge** — build with `<BarChart>` using the invisible-base trick: give each row a transparent `base` value and a visible `delta`; render two stacked `<Bar>`s where the base `<Bar>` has `fill="transparent"`. Color increases and decreases differently via per-cell `<Cell>`. Start and end totals are full-height bars from zero. This is the highest-value exhibit to get right.
- **Marimekko / Mekko** — Recharts has no native Mekko. Precompute each segment's x-offset and width from its share of the total, then render with a `<ComposedChart>` of stacked bars where each category's bar width is set proportionally (use a custom `<Bar shape>` that reads a `width` field from the datum). If time is short, approximate with a 100% stacked bar plus a separate width-encoding note.
- **100% stacked bar** — `<BarChart>` with `stackOffset="expand"` and percentage-formatted Y axis.
- **Dot plot / lollipop** — `<ComposedChart>`: a thin `<Bar>` (or `<Line>` segment) for the stem plus a `<Scatter>` for the dot, or simply a `<Scatter>` on a categorical axis. Horizontal layout (`layout="vertical"`) reads best for many categories.
- **Dumbbell** — `<ComposedChart>` with `layout="vertical"`: one `<Scatter>` for the "before" value, one for the "after", and a `<Line>` or custom segment connecting the pair per row. Label the gap.
- **Bullet chart** — a horizontal `<BarChart>` with a background `<ReferenceArea>` for the qualitative band and a `<ReferenceLine>` for the target.
- **Scatter / bubble / quadrant** — `<ScatterChart>` with `<Scatter>`; add `<ReferenceLine x={medianX}>` and `<ReferenceLine y={medianY}>` for quadrant splits; encode a third variable with the `<Scatter>` `zAxis`/bubble size for a bubble chart.
- **Small multiples** — render a grid (CSS `display:grid`) of several compact `<LineChart>`/`<AreaChart>` instances that share identical axis domains (pass an explicit `domain` to every `<YAxis>` so the panels are comparable).
- **Heatmap** — a CSS grid of cells colored by value (interpolate a background color from the datum); Recharts is not needed.

Keep all data values visible on every type (see Full data visibility rule below): show axis values, data labels via `<LabelList>` where they do not overlap, and tooltips.

## Question Components

### Multiple Choice

- Four clickable option cards.
- The submit button may be hidden or disabled until an option is selected.
- Submit locks the selection and reveals explanation.
- Correct answer highlighted green.
- Selected wrong answer highlighted red, with correct answer also shown.
- Explanation references specific article data and follows the Feedback Standard (named principle, named misconception per distractor, "Where this generalizes" cue).

### Numeric Estimation

- Numeric input plus slider over a reasonable range.
- After submission, show a horizontal distribution axis with user estimate and actual value.
- Default score: one point if the estimate is within the question's declared tolerance, otherwise zero; for Fermi items score on log-distance. If partial credit is used, make the score breakdown explicit and keep the total scoring model consistent across the artifact.
- Show a "How to estimate this" explanation with an explicit decomposition and bounds.

### Calibration Note (names the reasoning error — no confidence)

Do **not** ask the reader for a pre-reveal confidence level. On submit, the answer reveals immediately. Every explanation includes a one-line calibration note that, when the reader is wrong, names the specific reasoning error from the distractor-to-misconception mapping (e.g. "Incorrect — this is base-rate neglect: …"), and when right confirms the transferable pattern (e.g. "Correct — this reasoning generalizes to …"). Never write "incorrect" alone, and never reference a confidence level.

### Consulting Case

- Use a light amber background and a 3px left border `#d97706`.
- Include a "Case Prompt" label.
- Name a fictional but realistic client.
- Explanation cites section data and names the implementation risk or failure mode.

## Per-Page Glossary Component

At the bottom of every page (section), below the prose and questions, render a **Glossary** panel listing the new terms and acronyms introduced on that page (see Per-Page Glossary in article-structure.md). Style it as a quiet reference block — a light neutral background, a "Glossary" label, and each entry as **term** — plain one-line definition (acronyms spelled out in full). It is always visible; do not gate it. Only include terms new to this page; if the page introduced none, omit the panel entirely. Keep the data in a per-page array so the term and its definition travel together.

## Learning Summary Screen

The Learning Summary is its own freely navigable section (it naturally follows the final evidence section and precedes the Conclusion). It does **not** lock the conclusion or any other section — the reader can reach it, and leave it, at any time via the navbar. Include:

1. Score breakdown by question type, and, for numeric questions, the average signed error and direction of bias (for example "you under-estimated magnitudes by ~30%"). Do not report confidence-calibration analysis — no pre-reveal confidence is captured.
2. Three insight slots. Before revealing the authored takeaways, prompt the reader: "You saw [N] charts. Write the single most non-obvious insight you would defend to a skeptical executive." Capture one free-text governing insight, then reveal the three authored insight cards beneath it under "How your insight compares to the article's three."
3. Two Apply It prompts (see Apply It Evaluation): (a) Your context, and (b) Cross-link to a prior article. Both are strongly encouraged production steps and drive the local evaluator, but they never lock the conclusion or any section — the reader may navigate freely at all times.
4. A Return to Section map that lists missed questions by the transferable principle each one tested (labeled "Principles to revisit"), not by opaque question ID.

## Apply It Evaluation

The primary Apply It prompt (a) transfers the skill to a new context: present a short, unfamiliar three-to-five-row data snippet, or ask the reader to name a dataset from their own work, and require four labeled parts — (1) a one-sentence so-what thesis, (2) the single load-bearing assumption that must hold, (3) the evidence that would most undermine it (disconfirming evidence), and (4) a one-line pre-mortem: "If this fails in 12 months, the most likely reason is ___." The transfer target should differ from the article's domain so the reader produces an original thesis. Prompt (b) asks the reader to name one prior article's principle that reinforces or conflicts with today's.

The evaluator must not score on keyword presence. It must check that all four labeled parts are present and non-trivial, judge whether the response climbs from observation to a quantified, decision-relevant implication, and name which part is weakest or missing rather than confirming which words appeared.

Do not call a live API directly from a static local artifact unless the repository already provides a secure server-side API path. By default, isolate the evaluator behind one function and implement a local evidence-based fallback with clear code comments so a secure API call can be wired later. The fallback must surface what the reader did not address (missing thesis, assumption, disconfirming evidence, or pre-mortem) as an explicit gap list.

If a secure API path already exists and the user expects model evaluation, trigger one server-side evaluation when the user submits the free-form Apply It response. The system prompt must include the full article text and instruct the model to evaluate against named evidence in 3 to 5 sentences, noting what was well reasoned, what risk thinking was strong or weak, and what evidence was missed.

## Visual Design

- Minimalist light theme.
- White background and near-black text `#111`.
- Centered prose column, max width 720px, line-height 1.7, font-size 16px.
- Charts full width within the column.
- Question cards: 1px light gray border, 8px to 12px radius, 16px padding, no drop shadows.
- Fixed top progress bar, 4px height, accent color fill.
- No locked sections, padlock indicators, or muted "locked" styling — all sections are always live. A fixed left-gutter section navbar (wide viewports) lists all sections with the active one highlighted and click-to-scroll; it hides below ~1160px.
- Avoid nested cards, decorative blobs, and text overflow.
- Verify desktop and mobile widths.
