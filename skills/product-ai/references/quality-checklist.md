# Quality Checklist

Run this checklist before building and again before delivery. Every item must be verified.

## Governing Principle and Structure

- [ ] The governing principle is stated in the first paragraph of the article — before any company name, before any research question.
- [ ] The company case is framed as evidence for the principle, not as the subject of the article.
- [ ] The principle is transferable: it can apply to a different company and a different context without modification.
- [ ] Exactly 2–3 explicit research questions are named in the introduction, each mapping to an evidence section.
- [ ] Each evidence section ends with a "Principle in one sentence" prompt (encouraged production step). It does NOT lock navigation — confirm all sections stay freely accessible.
- [ ] The lifecycle position badge is present in the article header: which phase(s) the article covers.
- [ ] At least one upstream and one downstream article type is cross-linked in the header.
- [ ] Prose is in plain language: mostly short sentences, common words over fancy ones, no filler openers, and every technical term/acronym/model name explained in plain words the first time it appears. Read-aloud test passes.
- [ ] Every page (section) ends with a Glossary of the new terms/acronyms introduced on that page (acronyms spelled out, one-line plain definitions, no jargon-defining-jargon); pages with no new terms omit it; no term is defined twice across pages.

## Failure Case

- [ ] A "What Broke" section exists in the article — not a footnote, a full section with 4 paragraphs.
- [ ] The failure case names a real incident, near-miss, or documented architectural regret — not a generic risk.
- [ ] The root cause analysis names the design assumption that failed and why it was reasonable at the time.
- [ ] The mitigation cost is quantified or estimated.
- [ ] The "What Broke" section includes at least one question that asks the reader to reason from the failure (failure case question type).
- [ ] The "What Broke" section uses the light red-tinted visual treatment to distinguish it visually from success content.

## Sources and Data Integrity (Hallucination Prevention)

- [ ] Every FACT value was opened at its source and confirmed to contain the cited number for the stated unit, period, and population.
- [ ] No FACT appears in the article without an inline `(Source, Year)` citation.
- [ ] Every ESTIMATE value shows its derivation (factor chain or arithmetic from stated FACTs).
- [ ] Every ILLUSTRATION value carries a visible "Illustrative values — not reported statistics" note in both masked and revealed chart states.
- [ ] No ILLUSTRATION value appears in a scored question answer key.
- [ ] No specific technical figure (QPS, latency, team size, cost, accuracy) is asserted for a real company without a Tier 1 or Tier 2 source.
- [ ] The artifact includes a source list with all source names, URLs, and provenance tiers.
- [ ] Every source URL in the artifact resolves and contains the cited content.
- [ ] Any data more than 24 months old is flagged with its reference period in prose.

## Real Company Requirement

- [ ] The primary case is a named real company — no "a major tech company," no composite cases.
- [ ] For Type 8 (AI Incident & Recovery): the primary source is a real published post-mortem, incident report, or engineering retrospective. If reconstructed from secondary sources, this is explicitly stated.
- [ ] The case was selected because it is the best available evidence for the governing principle — not because it is a famous company.

## AI and Agentic Focus

- [ ] The article's topic has an AI or agentic workflow angle. Classical tech topics without an AI dimension are out of scope.
- [ ] For Types 2, 3, and 4: the AI architecture is described at enough technical depth for the reader to understand the actual system (not just "they used AI").

## Adjacent Content and Insight Diversity

- [ ] Every evidence section includes an adjacent-capability or complementary-concept paragraph (article-structure.md, evidence section step 6) that introduces information beyond the section's core thesis — a related technique, a comparison company, or an adjacent product capability.
- [ ] That paragraph adds a new fact or mechanism, not a rephrasing of the section's principle.
- [ ] Insight-budget check performed for every section: each question (chart interpretations, MCQ, Fermi, consulting case, pattern transfer) has a one-clause insight tag, and no two tags in the same section paraphrase each other.
- [ ] So-what prompts rotate across the named framework menu (segmentation, prioritization, sizing, threshold/decision rule, build/buy/partner, kill-criteria) rather than repeating the same framework on every chart in the article.
- [ ] No sentence in the prose merely restates an earlier sentence's claim in different words without adding a number, mechanism, counterexample, or application.

## Charts

- [ ] At least 4 charts are present across the article.
- [ ] Every chart makes the governing principle visible — not just the data.
- [ ] Every chart has exactly two pre-authored interpretation answers, of two different kinds (so-what, quantitative reasoning, qualitative/mechanism, or causal/comparative) — never two so-whats, and at least one is not a so-what; each is decision- or insight-relevant.
- [ ] Every chart shows all values from the start — Y-axis values, data labels, tick marks, and tooltips are never masked, blurred, or hidden.
- [ ] No chart container or value element uses `display: none`, `visibility: hidden`, or `opacity: 0` at any state; only the authored interpretation text is gated.
- [ ] Every chart appears in the DOM above all questions that reference it — no question precedes its chart.
- [ ] Each chart's two interpretation prompts require the reader to submit an answer before that prompt's authored answer reveals; the two prompts are gated independently.
- [ ] Each authored interpretation answer is conditionally rendered (does not exist in the DOM before the reader submits that prompt) — not CSS-hidden.
- [ ] At least one chart requires a pre-reveal magnitude/slope/ratio prediction.
- [ ] Architecture SVG diagrams (where applicable) show both the old/failed state and the new state when covering an evolution or incident.
- [ ] Every chart with ESTIMATE or ILLUSTRATION data shows a visible provenance note in both states.
- [ ] If a conceptual diagram (flowchart, timeline, or flywheel/loop SVG) is used, it appears sparingly (1–2 across the whole article, not per section), is captioned, and carries the same FACT/ESTIMATE/ILLUSTRATION provenance labeling as a data chart.

## Questions

- [ ] Every question has been classified on the reasoning ladder (observation / insight / implication) and every question is at insight or implication level — no observation-level recall questions remain.
- [ ] No question matches a prohibited form: "What was [metric] in [year]?", "According to the article, what is [X]?", "Which [entity] had the highest [metric]?", or any variant answerable by re-reading without reasoning.
- [ ] No question asks for an answer stated in the immediately preceding prose, caption, or visible chart label.
- [ ] Every evidence section has at least one T-C or T-D question.
- [ ] Every evidence section ends with a T-F pattern transfer question (the last question in the section).
- [ ] At least two T-D numeric estimation questions, at least one open-ended. Each declares its own tolerance with justification.
- [ ] Every T-D answer key value is a FACT with inline citation or fully derivable by arithmetic from cited FACTs.
- [ ] At least one T-G true/false-with-justification question appears somewhere in the article, and its justification field is required before it counts as answered.
- [ ] At least one T-H critical-reasoning (strengthen/weaken/assumption) question appears somewhere in the article, and its sub-form (strengthen, weaken, or assumption) is stated.
- [ ] At least one failure case question in the What Broke section.
- [ ] The conclusion includes at least one T-E question with both present-day and 2027 forward-looking variants.
- [ ] The final question in the artifact is a T-F pattern transfer to a domain not covered in the article.
- [ ] Multiple-choice correct answers are balanced across A, B, C, and D (no option dominates).
- [ ] Every MCQ's four options are word-count-balanced (correct option within ~20% of the average word count); the correct answer is never identifiable purely by being the longest, most hedged, or most detailed option.
- [ ] At least one question tests a named statistical trap (percent vs percentage points, real vs nominal, correlation vs causation, base-rate neglect).
- [ ] The conclusion's T-E question includes a falsification clause.
- [ ] At least one T-C asks for the weakest link / load-bearing assumption.

## Two-Attempt Scaffolding

- [ ] On a second wrong attempt at any multiple-choice question, a scaffolding paragraph and targeted hint unlock before the reader can resubmit.
- [ ] The scaffolding paragraph specifically addresses the reasoning error that the wrong option represents.
- [ ] The "Try again" button is present after a first wrong submission.

## Calibration (no confidence rating)

- [ ] No question asks for a pre-reveal confidence rating (Low / Medium / High). Confirm no confidence UI exists on any question.
- [ ] Every post-answer calibration note names the specific reasoning error from the taxonomy — never just "incorrect."
- [ ] Calibration note format is: "[correct/incorrect] — this is [reasoning error name]: [one sentence applying the error to this question]." No confidence level is referenced.
- [ ] The Learning Summary restates the named reasoning error for each missed question, and the average signed error direction for numeric questions.

## Cross-Artifact Warm-Up

- [ ] If this is not the first article in the reader's session, the cross-artifact warm-up intro screen is present.
- [ ] The warm-up screen includes 2–3 questions testing principles from prior articles in new contexts.
- [ ] The skip button is present and labeled clearly.
- [ ] Skipping is noted in the Learning Summary.
- [ ] Warm-up questions are authored and stored in `cross-artifact-state.json` alongside the article record.

## Forward-Looking Apply It

- [ ] The Apply It prompt in the Learning Summary includes both variants:
  - (a) Present-day: recommendation + load-bearing assumption + disconfirming evidence + pre-mortem
  - (b) 2027 forward-looking: what would change as foundation model capabilities improve, and which assumption does the 2027 version replace?
- [ ] Both variants are shown as encouraged production steps; they do NOT lock the conclusion (navigation stays free).
- [ ] The Apply It evaluator checks for all required parts and names which is missing or thin — it does not score on keyword presence.

## Learning Summary

- [ ] Score breakdown by question type, plus calibration analysis.
- [ ] Principle production review: reader's principle-gate submissions shown alongside authored principles.
- [ ] Three insight slots: reader writes governing insight before authored insight cards reveal.
- [ ] Return to Section map lists missed questions by the transferable principle they tested — not by question ID.
- [ ] Warm-up completion status shown (completed / skipped with count of prior principles not reviewed).

## Lifecycle and Navigation

- [ ] Phase 0 spine artifact exists or is generated before this article.
- [ ] Lifecycle position badge present and accurate.
- [ ] Upstream and downstream article type cross-links present and correct.

## Functional Validation (interactive — mandatory before delivery)

This section is a hard gate. An artifact that has not been exercised interactively is not done. Do not claim it is verified if you could not run these checks — say so instead.

- [ ] The app code transpiles with no syntax errors (run esbuild or babel on the JSX before building the HTML).
- [ ] The built `index.html` opens in a real browser (Claude in Chrome) and mounts — `#root` is populated, not blank, and the browser console shows no errors on load.
- [ ] Selecting a multiple-choice option enables its Submit; clicking Submit reveals the explanation, marks correct/incorrect, and updates the score badge.
- [ ] Each numeric (T-D) Submit accepts a value and reveals the decomposition; each free-text / pattern-transfer (T-F) Submit accepts text at the minimum length and reveals the follow-up.
- [ ] Every chart interpretation prompt: submitting the reader's answer reveals the authored answer, and the two prompts gate independently.
- [ ] "Try again" reappears after a wrong answer and re-enables submission (two-attempt scaffolding shows on the second wrong attempt).
- [ ] Every "Principle in one sentence" prompt accepts input and shows the authored principle (without blocking navigation).
- [ ] The left section navbar: clicking each entry scrolls to that section and the active entry highlights on scroll; sections that appear after a toggle (Learning Summary, Conclusion) are revealed by their nav click.
- [ ] The Learning Summary opens and renders; the conclusion is reachable.
- [ ] Any control that is disabled until input has a visible reason next to it (e.g. "Select an option to enable Submit", "Enter a value", "N/min characters") so it never looks broken.
- [ ] No console errors are produced while clicking through the full flow.
- [ ] If a live browser was not available, this is stated explicitly in the delivery note and the artifact is NOT reported as verified.

## Artifact Behavior

- [ ] Artifact lives in its own top-level workspace directory named `<topic-slug>/`.
- [ ] Finished artifact is not left only in `artifacts/`, a hidden worktree, or a temporary directory.
- [ ] The artifact is a single self-contained HTML file with all CSS, JavaScript, React, Recharts, and article content inlined.
- [ ] `app.js` is kept as a readable source copy, and the same code is inlined in `index.html`.
- [ ] `index.html` has no `<script type="text/babel" src="app.js">` or other external `text/babel` app script.
- [ ] `index.html` does not contain `__APP_CODE__` or any other inline placeholder.
- [ ] `prop-types@15.8.1` is loaded before Recharts.
- [ ] Recharts URL is `https://unpkg.com/recharts@2.12.7/umd/Recharts.js`, not `Recharts.min.js`.
- [ ] All sections are freely navigable in any order: no `sectionUnlocked` state, no disabled Next button, no padlocks or locked styling.
- [ ] Two-attempt scaffolding triggers correctly on second wrong attempt.
- [ ] Cross-artifact warm-up screen appears correctly (or is skipped cleanly).
- [ ] Score badge updates live.
- [ ] Learning Summary includes all required components.
- [ ] Desktop and mobile verification show no obvious overlap, unreadable text, or horizontal overflow.
- [ ] `cross-artifact-state.json` is correctly populated with this article's record at completion.
