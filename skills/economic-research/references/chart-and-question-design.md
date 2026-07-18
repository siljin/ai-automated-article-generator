# Chart and Question Design

## Chart Selection

Prefer charts that reveal change, structure, or decisions. Static number displays are weak unless they support a larger implication.

**Match the chart to the analytical job, the way a McKinsey/BCG/Bain exhibit does.** The plain vertical bar chart is the weakest default in this palette: reach for it only when nothing else fits, and never let it become the house style. Every chart type below answers a different question — pick the one whose shape *is* the argument.

Time and trajectory:

- **Line chart** — trends over time for one or more series.
- **Indexed line chart** (rebase all series to 100 at a common start) — relative growth or divergence when units start at different levels. Preferred over raw lines whenever the story is "who pulled ahead," not "who is bigger."
- **Slope chart** (two-period parallel-coordinates) — before/after change, rank change, or policy-period comparison across many entities; far cleaner than paired bars.
- **Stacked area chart** — how a total and its composition evolve together over time.

Composition and contribution:

- **Waterfall / bridge chart** — decomposes a change from a starting value to an ending value (contribution-to-change, margin bridge, headcount build). The signature McKinsey exhibit for "what drove the delta."
- **Marimekko / Mekko (variable-width stacked bar)** — two dimensions at once: segment size (width) and mix within each segment (height). Use for market structure, revenue by segment × product.
- **100% stacked bar** — mix shift across a few categories when the total is normalized away.
- **Donut / stacked single bar** — a one-off share breakdown; use sparingly and only when parts-of-a-whole is the whole point.

Comparison and ranking:

- **Dot plot / lollipop** — cross-sectional comparison across many entities; less ink than bars and easier to read when there are more than ~6 categories.
- **Dumbbell / connected-dot chart** — the gap between two values per entity (before vs after, actual vs benchmark, us vs them). The go-to for "mind the gap" exhibits.
- **Bullet chart** — a metric against a target or benchmark band; compact KPI-vs-goal display.
- **Grouped/clustered bar or horizontal bar** — cross-sectional comparison only when the number of categories is small and a decision or benchmark gap hangs on it. Horizontal bars beat vertical when labels are long or categories exceed ~6.

Relationship and distribution:

- **Scatter plot** — relationship between two variables across units; add quadrant lines (median splits) to turn it into a 2×2 positioning exhibit.
- **Bubble chart** — a scatter with a third variable encoded as size (e.g., revenue).
- **Small multiples** — the same small chart repeated across entities or periods on a shared scale; the cleanest way to compare many series without a spaghetti chart.
- **Heatmap** — a matrix of intensity across two categorical dimensions (sector × year, cohort × month).

Precision:

- **Table** — when exact figures matter more than visual pattern; consider an in-cell bar or heat shading to keep it scannable.

## Chart Variety Mandate

An article's charts must not all be the same type, and must not default to bar charts. Across the whole article:

- Use **at least three distinct chart types**, chosen to fit each analytical job above.
- **No more than one plain bar chart** (vertical or horizontal, single-series). If two ideas both seem to want a bar chart, at least one is better served by a dot plot, dumbbell, slope, or waterfall — convert it.
- At least one chart should be a **structure or contribution exhibit** (waterfall, marimekko, stacked area, or 100% stacked) when the topic involves a total that decomposes, a mix that shifts, or a change with drivers — which most economic and business topics do.
- Before finalizing, list each chart with its type and the one-line reason that type beats a bar chart for that specific job. If the reason is weak, change the chart type, not the reason.

**Two interpretation questions per chart.** Every chart carries exactly two interpretation prompts, rendered immediately beneath it, that the reader answers before the authored interpretation reveals. The two must be of different kinds — never two so-whats. Draw each from this palette:

- **So-what / decision implication** — what a decision-maker should do differently because of this pattern.
- **Quantitative reasoning** — derive a rate, gap, ratio, multiple, share, CAGR, or contribution-to-change from the visible values; a derived quantity, never a level read straight off the axis.
- **Qualitative / mechanism** — why the pattern is shaped this way; what underlying force produces it.
- **Causal or comparative** — separate correlation from causation, or explain why two series diverge, accelerate, or cross.

At least one of the two must be something other than a so-what. Pick the pair that best forces the reader to make sense of that specific chart — the questions exist to interpret the data, not to recall it. Write both authored answers before building, and render each as a labeled line beneath the chart that stays hidden until the reader submits their own answer to that prompt (see the Chart Display and Interpretation Mechanic in artifact-generator.md). Charts must display all data values — do not mask, blur, or hide Y-axis values, data labels, or tooltips. The reader needs full visibility to generate effective insights. If the chart does not reveal a trend, divergence, acceleration, mix shift, benchmark gap, relationship, or decision implication, replace it or pair it with a stronger chart.

Interpretation quality bar. Every authored answer must be (1) non-obvious: it does not restate a visible value or axis label; (2) decision- or insight-relevant: it names who should do what differently, or what the pattern reveals that the raw numbers do not; and (3) where the prompt is quantitative, it carries the magnitude (gap, rate, multiple) that makes it matter. Reject any answer that merely describes the line ("revenue rose") instead of its implication or mechanism ("revenue tripled while margin fell, so the growth is being bought, not earned").

**Authored interpretation hiding rule.** Neither authored answer may appear in the DOM before the reader submits their own answer to that prompt. Use conditional rendering — the authored text must not exist in the page source at all until after submission. Do not use CSS (`display: none`, `hidden` class, `opacity: 0`) to hide text that is already in the DOM. The authored answers are the interpretations the reader is trying to derive independently; showing them early defeats the learning objective. Note: this rule applies only to the authored interpretation text, NOT to chart data values — all chart values must be fully visible at all times.

**Chart-before-question rule.** Every question about a chart must appear immediately below that chart in the rendered order. A reader who encounters a question without seeing the chart cannot reason from evidence — they can only guess or recall. The chart, with all its values fully visible, must be on screen when the reader reads the question. Never place a question above its chart.

## Data Labeling in Charts

Tag every chart's data with its provenance tier (FACT, ESTIMATE, or ILLUSTRATION; see sourcing-and-citations.md). Any chart containing ESTIMATE or ILLUSTRATION values must render a visible source or method note directly beneath the chart in both the masked and revealed states, stating the tier and method in plain language, for example "Illustrative teaching values, not reported statistics" or "Modeled from the assumptions stated above; not a reported figure." A reader must never be able to mistake an illustrative or modeled series for a measured one. FACT charts must carry their `(Source, Year)` near the chart.

## Leakage Audit

Before finalizing questions:

- If a question asks for an exact figure stated in the immediately preceding prose, rewrite it.
- If a chart already displays a value, ask about implication, growth rate, gap, rank change, or decision consequence.
- If the user lacks enough anchors to estimate a number, either provide contextual anchors before the question or make the post-reveal estimation method explicit.

## Statistical-Integrity Audit

Before finalizing, audit every quantitative claim and question against these traps, and design at least one question per article that explicitly tests one of them:

- Percent vs percentage points: never call a move from 10% to 12% a "20% increase" without saying which is meant.
- Real vs nominal: deflate any multi-year money or wage series, or state explicitly that it is nominal.
- Rates vs levels, stocks vs flows: distinguish a growth rate from a level, and a stock from a flow.
- Base-rate neglect: pair any conditional or "success rate" claim with its base rate.
- Denominator and normalization: prefer per-capita, per-unit, or share when comparing unlike-sized entities.
- Correlation vs causation: a chart co-movement or scatter question may not assert a cause without a stated identification argument.
- Spurious precision: round synthesized or estimated figures to the precision the method supports.
- Simpson's paradox and survivorship: check whether aggregation or sample selection could reverse the story.

## Question Types

The reasoning ladder. Every question and every "so what" distinguishes three levels: an observation restates what the data shows; an insight explains why it matters or what is non-obvious; an implication states what a decision-maker should do. Questions that stop at observation test recall, not reasoning. Type A and B must reach insight; Type C and E must reach implication. When writing distractors, include at least one option that stops at observation so the reader must climb past it.

**Recall prohibition.** Before writing any question, classify it on the reasoning ladder. If it is an observation-level question — one that a reader can answer by reading a number off a chart, repeating a sentence from the preceding prose, or recalling a stated fact — discard it and write an insight- or implication-level replacement.

Prohibited question forms (observation level — do not use):
- "What was [metric] in [year]?" — unless the question requires a derived quantity, not a look-up
- "According to the article / chart, what is the value of [X]?" — recall of a stated number
- "Which [country / company / sector] had the highest [metric]?" — rank recall from visible data
- "When did [event] occur?" — factual recall
- "What does the chart show about [X]?" — unless the answer requires inference, not description

Required question forms (insight / implication level — use these):
- "What does the gap between [A] and [B] imply about [structural factor or decision]?"
- "Given [trend in chart], which consequence for [actor] is most likely over [timeframe], and why?"
- "Estimate [derived quantity] and explain what it means for [decision-maker]."
- "Which assumption must hold for [thesis] to be true, and what evidence in this article is thinnest in supporting it?"
- "If [condition changes], how would you expect [outcome] to differ, and why?"

A question that can be answered correctly without thinking — only by re-reading the article or chart — is a recall test, not a reasoning test. Every question must force the reader to synthesize, infer, estimate, or apply.

**The single-sentence test.** Before finalizing any question, ask: "Can a reader answer this correctly by finding and quoting a single sentence from the article or a single visible label on the chart?" If yes, the question is recall-level — discard it and write a replacement that requires combining at least two pieces of evidence, making a causal argument, drawing an implication for an actor, or estimating a derived quantity.

**Contrast example.**
- Recall (prohibited): "According to the chart, in which year did GDP growth peak?" — answerable by reading one axis point.
- Reasoning (required): "The chart shows GDP growth peaking then contracting. What does this trajectory imply about the central bank's likely policy stance over the subsequent 18 months, and which of the following outcomes is most consistent with that implication?" — requires connecting the trend to a policy mechanism and projecting a consequence.

### Type A: Chart Reading and Implication

Build quantitative precision plus interpretation.

Prompt pattern: `Based on the partially revealed trend, estimate the size of the gap/change for [subject] and identify what that implies about [decision/constraint].`

Do not use Type A for simple recall of a value stated in prose. Type A must require a derived quantity, not a level read off the axis: a growth rate, CAGR, gap, ratio, share, contribution-to-change, or per-unit normalization. State which derived quantity is required and check it. "Which line is higher" or "what is the value at year X" is not a valid Type A.

### Type B: Trend Reasoning

Build pattern recognition.

Prompt pattern: `What does the divergence between [series A] and [series B] after [year] most likely indicate about [underlying structural factor]?`

Use exactly four options: one correct and the rest clear misunderstandings, each mapped to a named reasoning error (for example: confusing correlation with causation, extrapolating a short trend, base-rate neglect, survivorship bias, or conflating a level with a rate). When a chart shows two series moving together or a scatter relationship, at least one Type B question per article must force the causal distinction, for example: "The chart shows [A] and [B] move together. Which is the strongest reason NOT to conclude that [A] causes [B]?" with one option naming a specific confounder or reverse-causation path drawn from the section.

### Type C: Consulting Case

Build application and synthesis.

Use a fictional but realistic client and a decision directly derived from the section's thesis. The correct answer must integrate at least two facts from the section. Include the main implementation risk, adoption challenge, or failure mode in either the prompt or explanation. At least one question per article must ask not for the best move but for the weakest link: "Which assumption must hold for this recommendation to create value, and what evidence in the section is thinnest in supporting it?"

### Type D: Quantitative Estimation

Build Fermi intuition.

Accept numeric input and score proximity. After reveal, teach:

- Anchor facts the reader could have used.
- A decomposition path.
- Plausible upper and lower bounds.
- The base rate or adjacent fact that makes the estimate tractable.
- Why the actual value lands where it does.

Tolerance and scoring: each numeric question declares its own tolerance with a one-line justification tied to the quantity's nature. Use a tight band (±5–10%) for arithmetic or definitional values and a wide band (within a factor of 2, i.e. order-of-magnitude) for genuine Fermi estimates, scored on log-distance so that 2× and 0.5× off score equally. Do not apply one global tolerance to both. The post-reveal explanation must show the decomposition as an explicit equation or factor chain (for example population × rate × price × adoption) with stated upper and lower bounds; a one-sentence answer is insufficient.

Answer-key integrity: every scored target value must be either a FACT with an inline citation to the source that reports it, or fully derivable by stated arithmetic from values given in the question or section (an ESTIMATE). Never score a reader against an invented or unverified empirical target; if the target is attributed to a study, confirm the figure in that study first. A question's declared type must match its mode: Type D must be numeric. A multiple-choice decision question is Type C, not Type D.

### Type E: Implication Bridge

Use only in the conclusion.

Prompt pattern: `Given what you have learned, which real-world decision is most directly supported, and which risk would most threaten it?`

The final recommendation question must be the strongest question in the artifact and must include risks, challenges, trade-offs, or failure modes. The conclusion's Type E question must include a falsification clause: one option must capture what would most change the thesis, and the explanation must state what observation would falsify the central claim.

## Feedback Standard

Every explanation must, in order: (1) state why the correct answer is correct in terms of a named, portable principle, not only this article's facts; (2) diagnose why each tempting distractor is wrong by naming the specific misconception it represents; and (3) end with a one-line "Where this generalizes" transfer cue pointing to a different domain or workflow where the same principle applies. Feedback that only restates this article's data point is insufficient.

## Answer-Key Discipline

Across all multiple-choice questions, distribute correct answers approximately evenly across A, B, C, and D. With 8 or more multiple-choice questions, each option position must be within one correct answer of the others. With fewer than 8, no option may dominate.

Create an answer-key table before building.

## Question Density

Each section must include at minimum:

- One Type A or B question attached to a chart.
- One Type C or D question attached to a major analytical claim.

Across the whole article, include at least two numeric estimation (Type D) questions, at least one of them open-ended (order-of-magnitude, not a closed arithmetic plug-in), and calibrate difficulty by scaffolding then fading: the first estimation may supply the decomposition skeleton, and at least one later estimation must require the reader to name the decomposition path before entering a number.

At every chart, the reader must commit a one-sentence "so what" before the authored so-what appears, and for at least one chart per article must also predict the magnitude, slope, ratio, or rank order.

The conclusion must include at least one Type E question.
