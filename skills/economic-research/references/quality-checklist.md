# Quality Checklist

Before building and before delivery, verify every item.

## Research and Structure

- [ ] Central paradox stated in the first 2 sentences.
- [ ] Exactly 2 to 3 research questions explicitly named in the introduction.
- [ ] Each research question has its own full section.
- [ ] Section 2 includes both trajectory/baseline conditions and structural context.
- [ ] Conclusion synthesizes implications for external actors and does not merely summarize.
- [ ] No bullet points appear in analytical prose.
- [ ] Analytical prose and every chart interpretation reach at least the insight level (why it matters), never stopping at observation (restating the data).
- [ ] Prose is in plain language: mostly short sentences, common words over fancy ones, no filler openers, and every term/acronym explained in plain words the first time it appears. Read-aloud test passes.
- [ ] Every page (section) ends with a Glossary of the new terms/acronyms introduced on that page (acronyms spelled out, one-line plain definitions); pages with no new terms omit it; no term is defined twice across pages.

## Sources

- [ ] Source discovery included recent, semantically matched real-world articles from credible popular, consulting, business, policy, academic, or scientific outlets.
- [ ] Every factual statistic, institutional example, market claim, and policy claim is traceable to a citeable source.
- [ ] Primary sources are used for factual statistics where available.
- [ ] Every statistic has an inline source label.
- [ ] The artifact includes a source list with links.
- [ ] Every numeric value is tagged FACT, ESTIMATE, or ILLUSTRATION, and no ESTIMATE or ILLUSTRATION is presented as a FACT.
- [ ] Each cited FACT was opened and confirmed to contain the cited number, unit, and period; every source URL resolves.
- [ ] ESTIMATE and ILLUSTRATION values are rounded coarsely so they do not imply measured precision.

## Charts

- [ ] At least 4 charts are present.
- [ ] Charts use at least three distinct chart types; they are not all bar charts.
- [ ] No more than one plain single-series bar chart (vertical or horizontal) is used; every other comparison uses a fitter type (dot plot, dumbbell, slope, waterfall, etc.).
- [ ] At least one structure/contribution exhibit (waterfall/bridge, marimekko, stacked area, or 100% stacked) is present where the topic has a decomposable total, mix shift, or change with drivers.
- [ ] Each chart's type is the best fit for its analytical job, with a one-line reason it beats a bar chart for that job.
- [ ] Charts emphasize trends, divergence, acceleration, mix shift, benchmark gaps, or relationships.
- [ ] Every chart has exactly two authored interpretation answers, of two different kinds (so-what, quantitative reasoning, qualitative/mechanism, or causal/comparative) — never two so-whats, and at least one is not a so-what.
- [ ] Every chart question tests implication layered with quantitative reasoning.
- [ ] Every chart shows all values from the start — Y-axis values, data labels, tick marks, and tooltips are never masked, blurred, or hidden.
- [ ] No chart container or value element uses `display: none`, `visibility: hidden`, or `opacity: 0` at any state; only the authored so-what text is gated.
- [ ] Every chart appears in the DOM above all questions that reference it — no question precedes its chart.
- [ ] Each chart's two interpretation prompts require the reader to submit an answer before that prompt's authored answer reveals, and show the authored answer alongside the reader's for comparison; the two prompts are gated independently.
- [ ] Each authored interpretation answer is conditionally rendered (does not exist in the DOM before the reader submits that prompt) — not CSS-hidden.
- [ ] At least one chart requires a pre-reveal magnitude/slope/ratio prediction.
- [ ] Each chart with synthetic or modeled data shows a visible provenance/method note both before and after the so-what is revealed.

## Questions

- [ ] Every question has been classified on the reasoning ladder (observation / insight / implication) and every question is rated at insight or implication level — no observation-level recall questions remain.
- [ ] No question matches a prohibited form: "What was [metric] in [year]?", "According to the article, what is [X]?", "Which [entity] had the highest [metric]?", or any variant answerable by re-reading without reasoning.
- [ ] Every question passes the single-sentence test: it cannot be answered correctly by finding and quoting a single sentence from the article or a single visible chart label. If it can, rewrite it.
- [ ] No question asks for an answer stated in the immediately preceding prose, caption, or visible chart label.
- [ ] Every section has at least one Type C or D question.
- [ ] Every Type A or D numeric question includes a post-reveal "How to estimate this" explanation.
- [ ] Multiple-choice correct answers are balanced across A, B, C, and D.
- [ ] Distractors are plausible and diagnostically useful.
- [ ] Conclusion includes at least one Type E question.
- [ ] Final recommendation question includes risks, challenges, trade-offs, or failure modes.
- [ ] At least one question tests a named statistical trap (percent vs percentage points, real vs nominal, base rate, normalization, correlation vs causation).
- [ ] At least one question forces a causation-vs-correlation or confounder distinction.
- [ ] At least one question asks for the load-bearing assumption or weakest link in the thesis.
- [ ] The conclusion's Type E question includes a falsification (what would change the thesis) element.
- [ ] At least two Type D numeric questions, at least one open-ended; each declares its own justified tolerance and shows a worked decomposition with bounds.
- [ ] Every Type D / numeric answer key is cited to a source or fully derivable from stated arithmetic.
- [ ] No question captures a pre-reveal confidence rating; each wrong answer's calibration note names the specific reasoning error (not just "incorrect"), and the summary reports score-by-type and numeric bias (no confidence calibration).
- [ ] Each explanation names a transferable principle and a "Where this generalizes" cue; distractor feedback names the misconception, not just "incorrect."

## Artifact Behavior

- [ ] The artifact lives in its own top-level workspace directory named `<topic-slug>/`.
- [ ] The finished artifact is not left only in `artifacts/`, a hidden worktree, branch-only path, or temporary directory.
- [ ] No existing artifact directory was overwritten unless the user explicitly requested a revision of that exact article.
- [ ] New article generation did not overwrite root-level `index.html`, `app.js`, or `styles.css`.
- [ ] The artifact is a single self-contained `index.html`: both the app code and the CSS are inlined (CSS in a `<style>` block), with no external `styles.css` link.
- [ ] `app.js` is kept as a readable source copy, and the same app code is inlined in `index.html`.
- [ ] `index.html` has no `<script type="text/babel" src="app.js">` or other external `text/babel` app script, and no `<link rel="stylesheet" href="styles.css">`.
- [ ] `index.html` does not contain `__APP_CODE__` or any other inline placeholder.
- [ ] If Recharts is loaded from the UMD build, `prop-types@15.8.1` is loaded before Recharts.
- [ ] If Recharts is loaded from unpkg version `2.12.7`, the URL is `https://unpkg.com/recharts@2.12.7/umd/Recharts.js`, not `Recharts.min.js`.
- [ ] Free navigation works: all sections render on one page and are reachable in any order via a left section navbar (scroll-spy + click-to-jump, hidden <1160px) and always-enabled Back/Next; no section is locked, gated, or padlocked.
- [ ] Score updates live.
- [ ] Learning Summary Screen includes score breakdown, three insight cards, Apply It prompt, and Return to Section map.
- [ ] The Learning Summary makes the reader produce a governing insight before the authored insight cards are shown.
- [ ] Apply It evaluation is implemented through the API or isolated fallback evaluator.
- [ ] The Apply It requires recommendation + load-bearing assumption + disconfirming evidence + pre-mortem, transfers to a new dataset/domain, and the evaluator checks all four parts rather than keywords.
- [ ] Desktop and mobile verification show no obvious overlap, unreadable text, or horizontal overflow.
