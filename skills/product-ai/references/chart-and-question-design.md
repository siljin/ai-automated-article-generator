# Chart and Question Design

## Chart Selection for Technical Topics

Prefer charts that make the governing principle visible, not just the data. A chart that shows the principle is more valuable than one that shows interesting facts.

Use:

- **Architecture topology diagram (SVG):** Component relationships, data flows, agent orchestration, pipeline stages. Required for Types 3, 4, and 8. Must show the before-state or the failure state alongside the after-state when the article covers an evolution or incident.
- **Line chart:** Trends over time — latency curves, metric evolution, cost growth, error rates.
- **Indexed line chart:** Relative divergence between two systems or approaches when absolute values start at different scales.
- **Scatter plot:** Relationship between two variables — benchmark score vs user satisfaction, confidence vs accuracy, team size vs incident rate.
- **Stacked bar or area chart:** Composition over time — cost breakdown by component, eval coverage by type, team allocation by specialty.
- **Bar chart:** Cross-sectional comparison — model latency by provider, cost-per-query by architecture variant.
- **Before/after diagram (SVG):** Architectural evolution. Show the old and new topology side by side with annotations naming what changed and why.
- **Decision matrix (SVG table):** Build/buy/partner decisions, model selection tradeoffs, data readiness assessment. Use when the decision has multiple dimensions that a data chart cannot capture.
- **Table:** When precision and direct comparison matter more than visual pattern — eval metric comparison across models, data readiness checklist, incident severity vs recovery time.

**Two interpretation questions per chart.** Every chart carries exactly two interpretation prompts, rendered immediately beneath it, that the reader answers before the authored interpretation reveals. The two must be of different kinds — never two so-whats. Draw each from this palette:

- **So-what / decision implication** — what a PM or CTO should do differently because of *this specific pattern in this chart*. The prompt must embed the actual data (specific values, named series, inflection point, or anomaly) and nudge toward a named decision framework (e.g., threshold rule, build/buy/partner, adoption funnel, sacrifice ratio). A so-what prompt that could appear under any other chart is not a so-what — it is an observation question. Reject it and rewrite.
- **Quantitative reasoning** — derive a rate, gap, ratio, multiple, share, or contribution-to-change from the visible values; a derived quantity, never a level read straight off the axis.
- **Qualitative / mechanism** — why the pattern (or architecture) is shaped this way; what underlying force, constraint, or design decision produces it.
- **Causal or comparative** — separate correlation from causation, or explain why two systems, approaches, or series diverge.

At least one of the two must be something other than a so-what. Pick the pair that best forces the reader to make sense of that specific chart — the questions exist to interpret the data, not to recall it. Write both authored answers before building. Each authored answer must be non-obvious, decision- or insight-relevant, and (where quantitative) carry the magnitude that makes it matter. Charts must display all data values — do not mask, blur, or hide Y-axis values, data labels, or tooltips. The reader needs full visibility to generate effective insights.

**Insight budget — one distinct insight per question.** Every question tied to a section (both chart-interpretation prompts, plus that section's MCQ, Fermi, and consulting-case questions, plus the closing pattern-transfer prompt) must test a *different* facet of the governing principle — never the same one-line takeaway restated in new words. Before finalizing a section, write a one-clause "insight tag" for each of its questions (for example: "why position beats model quality," "how large the advantage is in numbers," "what to do without this position," "what would disprove this"). If two tags paraphrase each other, cut or redesign one question rather than shipping a near-duplicate. A section that asks five questions and gets one insight repeated five ways has failed this rule even if each question is individually well-formed. Default to spreading a section's questions across these four tags so they cover different ground by construction:

- **Mechanism** — why the pattern exists (the causal chain or structural force behind it).
- **Magnitude** — how big the effect is, in a number the reader derives, not one they read off the chart.
- **Transfer without the advantage** — what a company or PM who lacks the same position, data, or scale should do instead.
- **Falsification** — what evidence would weaken or overturn the principle.

**Named framework menu for so-what prompts.** A so-what prompt is not "what should a PM do" in the abstract — it must point the reader toward applying one specific, nameable technique to this chart's specific data, and the technique used must vary across the section's charts so the reader practices more than one move. Rotate across this menu rather than defaulting to the same decision lens (e.g., "identify the moat") on every chart:

- **Segmentation** — "How would you segment [the population in this chart] so that [a stated business consequence] is handled differently for each group?"
- **Prioritization** — "Using RICE, ICE, MoSCoW, or a Now-Next-Later roadmap, how would you rank [the options implied by this chart], and what in the data supports that order?"
- **Sizing** — "Using the values in this chart, size [a TAM/SAM/SOM or funnel-stage estimate], and state which input most changes the answer."
- **Threshold / decision rule** — "At what point on this chart would you switch from [decision A] to [decision B], and what number marks that line?"
- **Build/buy/partner or sacrifice ratio** — "Given the tradeoff this chart shows, would you build, buy, or partner — and what is the sacrifice ratio of choosing one path over another?"
- **Kill-criteria / pre-mortem** — "What value in this chart, if it moved twice as far in the wrong direction, would be the signal to kill or pause this initiative?"

A section where every so-what resolves to the identical framework has failed the insight-budget rule above, even if the wording differs.

**Authored interpretation hiding rule.** Neither authored answer may appear in the DOM before the reader submits their own answer to that prompt. Use conditional rendering — the authored text must not exist in the page source at all until after submission. Do not use CSS (`display: none`, `hidden` class, `opacity: 0`) to hide it. This rule applies only to the authored interpretation text, NOT to chart data values — all chart values must be fully visible at all times.

**Chart-before-question rule.** Every question about a chart must appear immediately below that chart in the rendered order. The chart, with all its values fully visible, must be on screen when the reader reads the question. Never place a question above its chart.

**What Broke charts:** Every Type 8 article and every "What Broke" section of other types should include at least one chart that shows the failure: an incident timeline annotated with detection and resolution events, an error rate curve with the incident marked, or a before/after architecture showing what the design assumed vs what the real system did.

## Data Labeling in Charts

Tag every chart's data with its provenance tier (see sourcing-and-citations.md). Any chart containing ESTIMATE or ILLUSTRATION values must render a visible source or method note directly beneath the chart in both the masked and revealed states. A reader must never mistake a modeled or illustrative series for a measured one.

ILLUSTRATION is permitted in charts that teach a structural pattern (e.g., a generic agent topology that shows the archetype, not a specific company's implementation). It is never permitted in the answer key of a scored question.

## Visual Variety Beyond Data Charts (use sparingly)

Data charts (line, bar, scatter) and the mandatory architecture topology diagrams (Types 3, 4, 8) are not the only visual forms available. Where a concept is fundamentally a *process*, a *sequence over time*, or a *reinforcing loop* — not a measured quantity — a small conceptual SVG communicates it faster than a paragraph and should replace or accompany the prose. Use sparingly: one or two conceptual diagrams across the whole article, placed only where they replace prose that would otherwise struggle to convey the shape of the idea. This is not a per-section quota.

- **Flowchart / decision-logic diagram (SVG):** A sequence of decisions or steps — for example, how a v1 scoping decision branches, or the order of gates a feature must clear before launch. Use when the article's prose would otherwise need several sentences of "first... then... if... else."
- **Timeline (SVG or annotated chart):** A sequence of events, releases, or architecture eras — for example, when each capability became possible and what unlocked it. Use when the evidence is inherently sequential (an evolution across versions, a chain of incidents).
- **Flywheel / reinforcing-loop diagram (SVG):** A compounding mechanism where each element feeds the next and the loop strengthens itself over time — for example, more users generate more signal, which improves the product, which attracts more users. Use only for a genuine reinforcing loop documented in the case, never a flywheel invented for visual appeal.

Every conceptual diagram needs a caption stating what it shows, and the same provenance labeling as any other chart if it encodes specific numbers (FACT/ESTIMATE/ILLUSTRATION). A structural flywheel or flowchart with no specific numbers is ILLUSTRATION by default and must say so. Add a conceptual diagram only when it replaces or sharpens an explanation that is worse in prose alone — never to hit a visual quota.

## Question Types

**Recall prohibition.** Before writing any question, classify it on the reasoning ladder: observation (restates data — reject), insight (explains what is non-obvious), or implication (states what a decision-maker should do). If it is observation level, discard and replace.

Prohibited question forms (do not use):
- "What was [metric] in [year]?" — recall of a stated number
- "According to the article / chart, what is [X]?" — recall
- "Which [entity] had the highest [metric]?" — rank recall from visible data
- "When did [event] occur?" — factual recall
- "What does the chart show about [X]?" — unless the answer requires inference, not description
- "In one sentence, what does this pattern imply for a PM or CTO decision?" — generic so-what; does not name the pattern, the data, or the framework; forbidden as a chart prompt
- "Write your so what" (unqualified) — forbidden as a standalone prompt; the so-what question must name the specific data it is about

Required question forms (use these):
- "What does [architectural pattern / metric divergence] imply about [failure mode / investment decision]?"
- "Given [evidence], which consequence is most likely for a PM or CTO, and why?"
- "Estimate [derived quantity] and explain what it means for the product decision."
- "Which assumption must hold for [recommendation] to create value, and what evidence here is thinnest in supporting it?"

Every question must force the reader to synthesize, infer, estimate, or apply — never merely remember.

### Type T-A: Architecture and System Implication (replaces Type A)

Build systems thinking and architectural reasoning.

Prompt pattern: `Based on the architecture diagram and the case evidence, which component is most likely to become the bottleneck as [traffic / data / agent task complexity] scales by [10x / 100x]? What does that imply about where the PM should invest in the next quarter?`

Requirements: Must require a derived architectural conclusion, not a recall of a stated fact. The correct answer names a specific component and explains the mechanism of failure. Distractors name plausible but wrong components with plausible but wrong mechanisms.

### Type T-B: Technical Trend Reasoning (replaces Type B)

Build pattern recognition across technical tradeoffs.

Prompt pattern: `The chart shows [metric A] diverging from [metric B] after [event/date]. What does this divergence most likely indicate about [architectural decision / product choice / team constraint]?`

Use exactly four options: one correct, three distractors each mapped to a named reasoning error:
- Confusing a correlation with a causal mechanism
- Applying a classical software assumption to an AI-native system
- Misreading a rate for a level (or vice versa)
- Survivorship bias — concluding from a success story that the approach generalizes

At least one T-B question per article must force a causal distinction: "The chart shows [A and B] moving together. Which is the strongest reason NOT to conclude that [A causes B]?"

### Type T-C: PM Consulting Case (replaces Type C)

Build product decision-making under technical constraints.

Use a fictional but realistic company in a domain different from the article's case company, to force transfer rather than recall. The decision must integrate at least two facts from the evidence sections. The correct answer must name the load-bearing assumption — the one thing that must be true for the recommendation to create value.

At least one T-C question per article must ask for the weakest link: "Which assumption must hold for this PM decision to create value, and what evidence in this article is thinnest in supporting it?"

Include the main implementation risk, adoption challenge, or failure mode in either the prompt or the explanation.

### Type T-D: Engineering Estimation / Fermi (replaces Type D)

Build back-of-envelope technical reasoning — the primary quantitative skill that separates AI PMs who can engage with engineering from those who cannot.

Accept numeric input and score proximity. Declare the tolerance in the question itself with a one-line justification. Use tight band (±10%) for arithmetic values and order-of-magnitude scoring for genuine Fermi estimates.

After reveal, always show:
- The anchor facts the reader could have used
- The decomposition path as an explicit factor chain (e.g., requests/day × tokens/request × cost/1M tokens = daily cost)
- Upper and lower bounds with named assumptions
- Why the actual value lands where it does
- The single assumption that most affects the estimate

Every T-D answer key value is either a FACT with an inline citation or fully derivable by stated arithmetic from cited facts. Never score a reader against an invented or unverified target.

At least two T-D questions per article. At least one must be open-ended Fermi (reader must name the decomposition path before entering a number). Scaffold difficulty: the first T-D may supply the decomposition skeleton; later T-Ds require the reader to build it.

### Type T-E: Forward-Looking Implication (replaces Type E)

Used in the conclusion and Apply It. Every T-E question has two variants that the reader both answers:

**Present-day variant:** Given what the article evidence shows, what is the most important decision a PM or CTO at a similar company should make in the next six months?

**2027 variant:** Given the same business constraints and user problem, but assuming foundation model capabilities have improved [specifically: longer context, cheaper inference, better reasoning], what would you design or decide differently? What is the load-bearing assumption that the 2027 version replaces?

The final T-E question must include a falsification clause: one option must name what evidence would most change the article's governing principle, and the explanation must state what observation would falsify the central claim.

### Type T-G: True/False with Justification (new)

Builds a fast, low-noise check that still forces reasoning rather than recall — useful for testing whether a subtle qualifier in the evidence ("necessary but not sufficient," "correlation, not causation," "an upper bound, not a floor") was actually absorbed, not just skimmed.

Prompt pattern: `True or False: [a claim that sounds like the section's principle but flips one qualifier, scope word, or causal direction]. Justify your answer in one sentence naming the specific evidence that confirms or breaks the claim.`

Requirements: The claim must never be verifiable by re-reading one stated sentence — it must require combining two facts, or noticing that a scope word ("always," "only," "every merchant," "any model") oversteps what the evidence actually supports. Score the True/False choice, but require the one-sentence justification before it counts as answered; a bare selection with no justification does not earn credit. At least one T-G question per article must be a claim that is subtly false because it over-generalizes a necessary condition into a sufficient one, or a correlation into a cause.

### Type T-H: Critical Reasoning — Strengthen / Weaken / Assumption (new)

Builds the argument-evaluation muscle used in case interviews and real investment or roadmap debates: given a conclusion and the evidence for it, which new piece of information would most change confidence in that conclusion, and what unstated assumption is the conclusion actually resting on.

Use exactly four options in one of three sub-forms, rotated across the article:

- **Strengthen:** `Which new piece of evidence, if true, would most strengthen the claim that [the section's principle] explains [the observed pattern]?`
- **Weaken:** `Which new piece of evidence, if true, would most weaken the claim that [the section's principle] explains [the observed pattern]?`
- **Assumption:** `The argument that [conclusion] depends on evidence that [stated facts]. Which assumption, if false, would break this argument even though the stated facts remain true?`

Requirements: The correct option must identify information genuinely outside the article's stated evidence (a new fact, not a restatement) that would logically move confidence up or down, or an assumption that is truly load-bearing — removing it collapses the argument — rather than incidental. Distractors must be plausible-sounding but either (a) irrelevant to the specific causal claim, (b) already addressed by evidence already in the article, or (c) a restatement of the conclusion rather than a test of it. At least one T-H question per article; rotate which sub-form is used so the article does not repeat the same sub-form every time.

### Type T-F: Pattern Transfer (new — highest-order question)

Pattern transfer is the test of whether the governing principle has been genuinely internalized, not just recognized in the article's case. It appears as the last question in every evidence section and as a required part of Apply It.

Prompt pattern: `The principle from this section is [stated principle]. Apply it to [a different industry / company type / technical context not covered in the article]. What would a PM or CTO do differently, and what new failure mode would they face that did not appear in the [article case] example?`

Evaluation: The reader's answer is not multiple-choice. It is free text. The evaluator checks that all three elements are present: (1) the principle named accurately, (2) the application to the new context is non-trivial (not a re-labeling of the original case), and (3) the new failure mode is genuinely different from the ones covered in the article.

## Cross-Artifact Warm-Up Questions

After the first article, every subsequent artifact opens with a warm-up screen before the main content begins. This screen serves spaced retrieval: it tests cold recall of principles from prior completed articles before the reader begins the new case.

Warm-up spec:
- 2–3 questions, each drawing a principle from a prior article
- Questions test the principle in a new context (never ask the reader to recall the company name or a specific fact — always ask for the principle and its application)
- No gating: the reader can skip warm-up with one click, but doing so is noted in the learning summary as "principles not reviewed before this session"
- Each warm-up question shows its source article title and lifecycle position after submission

Example warm-up question: "In a prior article, you studied how [principle from agentic architecture] affected production reliability. A new company is designing a customer support agent that calls three internal APIs. Which failure mode from the agentic architecture principle is most likely to appear first, and how would you mitigate it before launch?"

Cross-artifact state is stored in a small JSON file (`cross-artifact-state.json`) alongside the HTML files in the workspace. The file records: article titles read, questions answered, principles stated, and calibration history.

## Failure Case Question Design

Every article's "What Broke" section must include at least one question that asks the reader to reason from the failure, not from the success. This is the hardest and most important question type because it tests whether the reader has built a model of how AI systems fail, not just how they work.

Failure question patterns:
- "Given the failure described, which assumption in the original design was most likely held by the team and considered uncontroversial — and why was it wrong?"
- "If the team had run [specific eval or test] before launch, would it have caught this failure? Why or why not?"
- "What is the cheapest change to the original architecture that would have prevented this specific failure? What would it have cost, and why might a PM have de-prioritized it?"

Distractors for failure questions should map to these reasoning errors:
- Hindsight bias: choosing an answer that was obvious only after the failure
- Scope creep misdiagnosis: blaming a symptom rather than the root cause
- Single-cause fallacy: attributing a systemic failure to a single component

## Calibration with Named Reasoning Errors

Do not ask the reader for a confidence rating on any question. After every answered question, the calibration note must name the specific reasoning error if the answer is wrong — not just "incorrect." Use this taxonomy:

- **Applying classical software assumptions to AI:** treating LLM outputs as deterministic, treating AI latency as predictable, assuming cache hit rates from web services apply to embedding lookups
- **Confusing a metric for its cause:** improving a benchmark and assuming user satisfaction will follow
- **Survivorship bias:** concluding that an approach works because successful companies used it, ignoring that failed companies used it too
- **Extrapolating a short trend:** projecting a 3-month improvement curve 3 years forward
- **Base-rate neglect:** ignoring how often a failure mode occurs across all companies when assessing one company's risk
- **Confusing rate and level:** misreading a growth rate improvement as a level improvement
- **Misattributing causation:** assuming correlated metrics have a causal relationship
- **Hindsight bias in incident analysis:** identifying a root cause that was only obvious after the failure
- **Scope creep misdiagnosis:** blaming a surface symptom rather than the structural assumption that failed

The calibration note format: "Incorrect — this is [reasoning error name]: [one sentence explaining how the error applies to this specific question]." Do not include a confidence level in the note.

## Answer-Key Discipline

Distribute correct answers approximately evenly across A, B, C, and D. With 8 or more multiple-choice questions, each option position must be within one correct answer of the others.

Create an answer-key table before building. Every answer key entry notes: (1) the correct answer, (2) which reasoning error each distractor represents, and (3) the source and provenance tier of the factual basis.

**Answer-length parity (no length tell).** The correct option's word count must fall within roughly 20% of the average word count across the four options. Never let the correct answer be identifiable simply because it is the longest, most hedged, or most detailed option — this is the single most common way a multiple-choice question becomes gameable without reasoning. If the true answer genuinely needs more words to state accurately, add equivalent qualifying detail, specific-sounding numbers, or named mechanisms to at least two distractors so length and apparent specificity stop being a usable shortcut. Word-count all four options before finalizing any MCQ and rebalance any outlier.

## Question Density

Each evidence section requires at minimum:
- One T-A or T-B question attached to a chart
- One T-C or T-D question on a major claim
- One T-F pattern transfer question at the section's end (placed after the "Principle in one sentence" prompt; not gated or hidden — always visible and answerable)

Across the whole article:
- At least two T-D numeric estimation questions, at least one open-ended
- At least one T-G true/false-with-justification question, positioned wherever it best fits the evidence
- At least one T-H critical-reasoning (strengthen/weaken/assumption) question, with its sub-form stated
- At least one failure case question in the What Broke section
- At least one T-E with both present-day and 2027 variants in the conclusion
- The final question in the artifact is always a T-F pattern transfer that transfers the governing principle to a domain or company type not covered in the article
