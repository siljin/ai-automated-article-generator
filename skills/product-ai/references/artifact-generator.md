# Artifact Generator

## Output Rule

Build one single self-contained HTML file. Do not output the article as markdown prose in chat. The HTML file is the article, the interactivity, and the deliverable.

"Self-contained" means the article runs by opening the HTML file in any browser — no server, no build step, no local file dependencies, no internet required after the initial CDN scripts load. All CSS, JavaScript, React, Recharts, and article content are inlined in one file.

## File Structure

```text
<workspace-root>/
  <topic-slug>/
    index.html       ← the deliverable: everything inlined
    app.js           ← readable source copy of the React app
```

The topic slug is a concise lowercase hyphenated name derived from the article topic. Before writing files, check whether the slug directory already exists. If it does and the user asked for a new article, create `topic-slug-2` or a more specific slug. Never overwrite an existing article directory unless the user explicitly asked to revise that article.

Never write new article files directly to the workspace root. Never leave the finished deliverable only in `artifacts/`, a hidden worktree, or a temporary directory.

## Direct-File-Open Script Rule

Use this dependency pattern in `index.html`:

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

Do not use `<script type="text/babel" src="app.js">` — it fails under `file://` because Babel fetches external scripts through browser APIs blocked by local-file origin rules.

Do not use `https://unpkg.com/recharts@2.12.7/umd/Recharts.min.js` — that URL returns 404.

Load `prop-types@15.8.1` before Recharts — the Recharts UMD build calls its factory with `window.PropTypes` and fails if it is missing.

After inlining, verify that the inline Babel script matches `app.js`, that no `__APP_CODE__` placeholder remains, and that no external `text/babel` app script remains.

## State Model

Implement:

- `currentSection`: integer tracking the visible section. All sections are always navigable — there is no unlock state.
- `questionState`: object per question tracking `answered`, `selectedOption`, `isCorrect`, `submitted`, `attemptCount`, `scaffoldingShown`.
- `score`: running tally of correct answers.
- `interpretationSubmitted`: per chart, a two-element boolean array — each entry flips to `true` as soon as the reader submits their answer to that interpretation prompt. Each authored answer is gated by its own flag.
- `readerInterpretations`: per chart, the reader's two typed answers and any pre-reveal magnitude prediction.
- `principleGate`: per evidence section, reader's typed "Principle in one sentence" submission.
- `warmUpCompleted`: boolean tracking whether the cross-artifact warm-up was completed or skipped for this session.
- `crossArtifactState`: object loaded from and saved to `cross-artifact-state.json` — prior article titles, principles stated, calibration history.

## Article Header

Every article must render a persistent header bar (below the top progress bar) with:
- Article title
- Report type badge (e.g., "AI Product Teardown", "Agentic System Architecture")
- Lifecycle position badge: a small horizontal lifecycle strip showing the 7 phases (Feasibility → Design → Build → Evaluate → Deploy → Scale → Govern) with the current article's phase(s) highlighted
- Links to upstream type ("Prev: [type name]") and downstream type ("Next: [type name]") in the curriculum map

This header is always visible and does not scroll away.

## Cross-Artifact Warm-Up Intro Screen

After the first article, every subsequent artifact opens with a warm-up screen before the main content begins. This screen is the first thing the reader sees.

Warm-up screen spec:
- Title: "Before you begin — recall from your prior reading"
- 2–3 warm-up questions drawn from prior completed articles
- Each question asks the reader to apply a prior principle to a new context — never recall a company name or specific fact
- Each question is free-text (not multiple-choice) and requires minimum 25 characters to submit
- After submission, show the principle the question was testing, the source article title, and the lifecycle position
- No scoring — warm-up is retrieval practice, not assessment
- Skip button available with one click — but skipping is noted in the learning summary as "Warm-up skipped: [N] prior principles not reviewed"
- The screen does not gate the article — it is a recommended step, not a required one

Cross-artifact state file spec (`cross-artifact-state.json`):
```json
{
  "articles": [
    {
      "slug": "topic-slug",
      "title": "Article title",
      "type": "AI Product Teardown",
      "lifecyclePhases": ["Build", "Evaluate"],
      "governingPrinciple": "The principle statement from the article",
      "sectionPrinciples": ["Principle from section 3", "Principle from section 4"],
      "completedAt": "ISO date"
    }
  ]
}
```

Warm-up questions are generated from `sectionPrinciples` of prior articles. The warm-up questions are authored at generation time and stored in the cross-artifact state file alongside the article record.

## Navigation Rules

- **Left section navbar (required).** Render a vertical navbar listing every section (Introduction, Landscape, each evidence section, What Broke, Learning Summary, Conclusion). Give each section container a stable DOM `id` and list them in the navbar. The navbar entry for the section currently in view is highlighted (accent left-border + tinted background + bold); clicking any entry scrolls smoothly to that section. Track the active section with a scroll listener that finds the last section whose top has passed a small offset. If a section (e.g. Learning Summary / Conclusion) is only shown after a toggle, clicking its nav entry first sets that toggle, then scrolls. Position the navbar fixed in the left gutter on wide viewports; hide it below ~1160px (track `window.innerWidth` with a resize listener) so narrow screens keep the single-column reading layout.
- Every section is always accessible. The reader can freely move between any sections in any order — via the left section navbar and via Back/Next buttons. Nothing is ever locked or padlocked.
- The "Principle in one sentence" prompt and the per-question submissions are encouraged production steps, but they never disable navigation. The Next button is always enabled.
- A fixed progress bar shows the reader's position across the sections.
- A score badge updates live.
- Do not implement `sectionUnlocked` state, disabled Next buttons, padlock indicators, or muted "locked" section styling.

## Chart Display and Interpretation Mechanic

**Full data visibility rule.** Every chart renders with full data visibility from the start — all Y-axis values, data labels, tick marks, and tooltips are shown. Do not mask, blur, or hide any chart values. Architecture SVG diagrams show all components and quantitative annotations from the start. The reader needs full visibility of actual data to interpret the chart effectively and generate meaningful insights.

**CRITICAL — Chart precedes its questions:** The chart must appear in the rendered DOM above every question that references it. Never render a question about a chart before the chart itself appears. All chart questions must be immediate siblings below the chart container.

**Two-question interaction:** Below each chart, render two interpretation prompts of different kinds (see the Two interpretation questions per chart rule in chart-and-question-design.md — never two so-whats). For each prompt, require the reader to submit their own answer (minimum 15 characters) before that prompt's authored answer appears; the two prompts are gated independently.

**CRITICAL — prompts must be chart-specific, not generic.** Every interpretation prompt must be written from the actual values, trends, anomalies, or structural patterns visible in that specific chart. A prompt that could be copy-pasted under any other chart is forbidden. Do NOT use generic wording such as "In one sentence, what does this pattern imply for a PM or CTO decision?" or "What does this chart show?" — these are observation-level and leak nothing about the data.

Instead, write prompts that embed the specific evidence: the actual numbers, the named inflection point, the divergence between two named series, or the surprising magnitude. The prompt must also nudge the reader toward the right analytical framework for that data (e.g., sacrifice ratio for a cost-tradeoff chart; adoption funnel for an engagement drop; build-vs-buy for a make-or-partner divergence).

Examples of compliant prompt forms:
- So-what: "The 20-tool threshold is where JIT instruction logic becomes load-bearing — what decision rule does that imply for an AI PM scoping a multi-tool agent before this limit is reached?"
- Quantitative: "Accuracy improved 12pp from GPT-3.5 to GPT-4 on clinical tasks but only 2pp on general tasks — estimate the implied ROI multiplier on model cost if the use case is clinical, and say what assumption most affects that number."
- Mechanism: "Vacancy postings fell 3 points while unemployment rose under 1 point — which labor-market mechanism produces that asymmetry, and why can't a demand-contraction story explain this slope?"

For at least one chart per article, also require a quantitative prediction (magnitude, slope, ratio, or rank order).

**CRITICAL — Authored interpretation hiding:** Each authored answer must not exist in the DOM until its own `interpretationSubmitted[i][j]` flag is `true`. Implement with conditional rendering: `{interpretationSubmitted[i][j] && <div className="authored-interpretation">...</div>}`. Do NOT place an authored answer in the DOM and use CSS to hide it. CSS-hidden text exists in the page source and defeats the learning objective.

After the reader submits an answer, display the matching authored answer directly beneath the reader's own, labeled "Compare your answer to the authored one." Show feedback explaining the specific data point, its architectural or product implication or mechanism, and its link to the article's governing principle. Prompt one optional self-explanation ("In one sentence, why does the data move this way?") that is stored and echoed in the Learning Summary.

## Question Components

### Multiple Choice

- Four clickable option cards.
- Submit button hidden until an option is selected.
- Submit locks the selection and reveals explanation.
- Correct answer highlighted green.
- Selected wrong answer highlighted red, with correct answer also shown.

**Two-attempt scaffolding rule (Fix #6):** On a first wrong attempt, the standard explanation reveals. On a second wrong attempt (if the reader resets and tries again via the "Try again" button that appears after first wrong submission), a scaffolding paragraph and a targeted hint unlock before the reader submits again. The scaffolding paragraph specifically addresses the reasoning error the wrong option represents. The "Try again" button is always available — gating is not about locking the reader out, it is about making them engage before seeing the answer.

**Calibration note (names reasoning error):** Every explanation includes a calibration line. Do not reference a confidence level. Format:
- If correct: "Correct — this reasoning pattern generalizes to [domain] / the key was [named principle]."
- If incorrect: "Incorrect — this is [reasoning error name from taxonomy]: [one sentence applying the error to this specific question]."

Never use "incorrect" alone. Always name the reasoning error from the taxonomy in chart-and-question-design.md.

Explanation content must: (1) state why the correct answer is correct in terms of a named portable principle, (2) diagnose why each tempting distractor is wrong by naming the specific misconception, and (3) end with a "Where this generalizes" transfer cue pointing to a different domain where the same principle applies.

### Numeric Estimation (T-D)

- Numeric input plus slider over a reasonable range.
- After submission, show a horizontal distribution axis with the user estimate and the actual value marked.
- Score: one point if within declared tolerance; for Fermi items, score on log-distance so that 2× and 0.5× off score equally.
- Show the decomposition path as an explicit factor chain with stated upper and lower bounds.
- If the reader is significantly off (more than 3× on a Fermi estimate), also show the two-attempt scaffolding: a breakdown of which factor in the decomposition was most likely misjudged, and why.

### Principle in One Sentence Prompt

At the end of every evidence section (does not gate or lock navigation):
- Free-text input, minimum 20 characters.
- Prompt: "In one sentence, state the transferable principle from this section — something a PM or CTO at a different company could apply tomorrow."
- After submission, show the authored principle for comparison. Not scored. No right or wrong — it is an encouraged production step, but the reader may move to any section whether or not it is completed.
- Stored in `principleGate` state and echoed in the Learning Summary.

### Free-Text Pattern Transfer (T-F)

- Multi-line text input, minimum 50 characters.
- Prompt includes: the principle to apply, the new context, and three explicit requirements: (1) name the principle accurately, (2) explain the non-trivial application, (3) name a failure mode that would not appear in the original case.
- After submission, show a structured self-evaluation checklist with three checkboxes the reader marks themselves: "Did I name the principle accurately?" / "Is my application genuinely different from the original case?" / "Is my failure mode new?"
- The evaluator function (local fallback) checks for three labeled elements and surfaces which is missing or thin. If a secure API path is configured, trigger Claude evaluation with the article's governing principle and the reader's response.

### Consulting Case (T-C)

- Use a light amber background and a 3px left border `#d97706`.
- Include a "Case Prompt" label.
- Name a fictional but realistic client in a domain different from the article's case company.
- Explanation cites section data and names the implementation risk or failure mode.
- Required: at least one T-C per article must include a "weakest link" variant: "Which assumption must hold for this PM decision to create value?"

## Per-Page Glossary Component

At the bottom of every page (section), below the prose and questions, render a **Glossary** panel listing the new terms, acronyms, and model names introduced on that page (see Per-Page Glossary in article-structure.md). Style it as a quiet reference block — a light neutral background, a "Glossary" label, and each entry as **term** — plain one-line definition (acronyms spelled out in full, e.g. "RAG — Retrieval-Augmented Generation: pulling relevant documents into the prompt so the model answers from them"). It is always visible; do not gate it. Only include terms new to this page; if the page introduced none, omit the panel entirely. Keep the data in a per-page array so the term and its definition travel together.

## Learning Summary Screen

A full-screen Learning Summary is available as its own section (reachable at any time via the section nav; it naturally follows the final evidence section). It does not lock the conclusion. Include:

1. **Score breakdown:** By question type (T-A through T-F). For each wrong answer, restate the named reasoning error. For numeric questions, show average signed error and direction of bias (e.g., "You under-estimated AI inference costs by ~40%"). Do not report confidence-calibration analysis (there is no confidence capture). If warm-up was skipped, show "Warm-up skipped — [N] prior principles not reviewed this session."

2. **Principle production review:** Show all principle-gate submissions (one per evidence section) alongside the authored principles. Ask: "Which of your stated principles surprised you most when compared to the authored version? Why?"

3. **Three insight slots:** Before revealing authored takeaways, prompt: "You have seen [N] pieces of evidence. Write the single most non-obvious insight you would defend to a skeptical CTO." Capture free-text, then reveal three authored insight cards beneath it under "How your insight compares."

4. **Apply It prompts — both variants required:**
   a. **Present-day variant:** Apply the governing principle to a company or product you know. Requires four labeled parts: (1) one-sentence so-what thesis, (2) load-bearing assumption, (3) strongest disconfirming evidence from the article, (4) one-line pre-mortem: "If this fails in 12 months, the most likely reason is ___."
   b. **2027 forward-looking variant:** Given the same business constraints and user problem, but assuming foundation model capabilities have improved (longer context, cheaper inference, better reasoning), what would you design or decide differently? What load-bearing assumption does the 2027 version replace?
   Both are strongly encouraged production steps shown before the conclusion, but they do not lock the conclusion — the reader may navigate freely.

5. **Return to Section map:** Lists missed questions by the transferable principle each tested — not by opaque question ID. Labeled "Principles to revisit."

## Apply It Evaluation

The evaluator must not score on keyword presence. It checks:
- All four labeled parts present and non-trivial
- Response climbs from observation to a quantified, decision-relevant implication
- Which part is weakest or missing is named, not just flagged

Default: local evidence-based fallback that checks for labeled elements and surfaces gaps. If a secure API path is configured, trigger model evaluation with the article content and the reader's response.

## Visual Design

- Minimalist light theme. White background. Near-black text `#111`.
- Centered prose column, max width 720px, line-height 1.7, font-size 16px.
- Charts full width within the column.
- Architecture SVG diagrams: max width 680px, centered, with visible component labels.
- Question cards: 1px light gray border, 8–12px radius, 16px padding, no drop shadows.
- Consulting case cards: amber left border `#d97706`, light amber background.
- What Broke section: light red-tinted background `#FEF2F2` with a subtle left border `#FCA5A5` to visually distinguish failure content from success content.
- Fixed top progress bar, 4px height, accent color fill.
- Lifecycle position header bar: below progress bar, always visible.
- Section navigation: a fixed left-gutter section navbar (wide viewports) lists all sections with the active one highlighted and click-to-scroll; it collapses/hides below ~1160px. All sections are accessible; no padlocks and no muted "locked" styling.
- Warm-up screen: distinct background (light gray), clear "skip" affordance that doesn't look like the primary action.
- Avoid nested cards, decorative blobs, and text overflow.
- Verify desktop and mobile widths.
