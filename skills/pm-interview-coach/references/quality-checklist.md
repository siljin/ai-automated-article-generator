# Quality Checklist

Run this checklist before building and again before delivery. Every item must be verified.

## Concept First, Structure

- [ ] The concept's plain-language definition and framework are taught in full before either case is introduced.
- [ ] The Learn module has all 7 required sections (simple explanation, interview relevance, framework, visual, numerical example, failure modes, cheat sheet).
- [ ] The framework's numerical example uses generic, made-up-but-realistic numbers — not the Observe module's real company's numbers.
- [ ] At least 5 distinct failure modes, each with a concrete correction.
- [ ] The concept is narrow enough for one session — it wasn't merged with a second broad concept.

## Real Company and Sourcing (Hallucination Prevention)

- [ ] The Observe module names a real, named company — no composite or "a major consumer app" case.
- [ ] At least two credible public sources are cited, each with a resolving URL.
- [ ] Every FACT value was actually opened at its source and confirmed to contain the cited number for the stated unit and period (see sourcing-and-citations.md).
- [ ] Every ESTIMATE shows its derivation (arithmetic from stated FACTs).
- [ ] Every ASSUMPTION is visibly labeled as a hypothetical made for teaching (e.g. "not disclosed — assumption for teaching") and never reads like a reported number.
- [ ] No ASSUMPTION value is used as if it were real company data anywhere in the artifact, including the reference answers.
- [ ] Verified facts, reasonable inferences, and assumptions are visually distinguishable (e.g. distinct tags/badges), not blended into one narrative.
- [ ] The artifact does not imply access to confidential or non-public company information anywhere.

## Observe Module Structure

- [ ] Company/product context, the one concrete product problem, the full framework walkthrough, the decision & recommendation, and the transferable lesson are all present, in that order.
- [ ] The PM application walkthrough shows question / evidence / assumption / analysis / decision / trade-off / risk for every framework step — it does not jump straight to the answer.
- [ ] The transferable lesson explicitly tells the reader not to copy the company's specific answer, and restates the general reusable move.
- [ ] The recommendation names guardrail metrics and what to test before scaling, not just what to do.

## Practice Module Originality and Structure

- [ ] The Practice module's company, scenario, and numbers are original — not a restatement of the Observe module's company or figures.
- [ ] All applicable stages from practice-case-design.md are present: prompt+givens, clarifying questions, framework, exhibit, quantitative exercise, decision, metrics/validation, final recommendation, self-scoring rubric.
- [ ] The case prompt does not leak the solution.
- [ ] Every exhibit table prints exact values (no chart-only numbers) and the numbers reconcile (percentages sum to 100%, sub-totals sum to stated totals).
- [ ] The quantitative exercise's reference solution shows formula, substitution, calculation with units, sanity check, interpretation, and a stated limitation — and every number in it traces back to the exhibit or the data chips.
- [ ] The decision stage forces a genuine trade-off between at least 2-3 plausible options, and the reference decision explains why it's strongest under the case's stated priority while acknowledging a different priority could justify a different pick.
- [ ] The metrics stage requires a primary metric, supporting metrics, 2+ guardrails, a measurement window, an experiment/rollout design, a decision threshold, and a named gaming/unintended-consequence risk.
- [ ] The final recommendation stage's reference answer is decisive, not hedgy, and follows the recommendation → reasons → impact → risk → mitigation → next-step structure.

## Gating Behavior

- [ ] Every stage's reference answer is hidden until the learner submits a non-trivial input for that stage (min-length check with a visible reason when disabled).
- [ ] No whole section or module is locked behind completing a previous one — no `sectionUnlocked` state, no disabled "Next," no padlock styling. Confirm the learner can freely scroll/select Learn, Observe, and Practice, and any Practice stage, at any time.
- [ ] Clarifying-question matching works via the Cowork-bridge-first, keyword-fallback pattern; canonical questions have generous tag phrasings.
- [ ] Framework/decision/metrics/recommendation stages attempt Cowork-bridge grading and cleanly fall back to a static self-check checklist when the bridge is unavailable or errors — the UI labels which mode is active and never shows a broken or blank feedback area.

## Self-Scoring Rubric

- [ ] All 9 standard dimensions are present, each with a 1-5 input and a short description of what a low vs high score looks like for this specific case.
- [ ] An overall average, a readiness label, a strongest muscle, a weakest muscle, and a recommended next concept (different category) are all computed/shown after the learner enters scores.

## Functional Validation (interactive — mandatory before delivery)

This section is a hard gate. An artifact whose interactivity has not been exercised is not done. Do not claim it is verified if you could not run these checks — say so instead.

- [ ] The app code transpiles with no syntax errors (run esbuild or babel on the JSX before building the HTML).
- [ ] The built `index.html` opens in a real browser (Claude in Chrome) and mounts — `#root` is populated, not blank, and the console shows no errors on load.
- [ ] The Learn / Observe / Practice module switcher: clicking each one renders that module's content.
- [ ] Every Practice stage: typing a too-short input and clicking Reveal shows the "write more" message instead of revealing; typing a real answer and clicking Reveal shows the reference answer/feedback.
- [ ] The clarifying-question input: asking a question that matches a canonical one (by wording, not exact text) shows a hit; asking an off-topic question shows a miss; the "show what I missed" control lists the right set.
- [ ] The quantitative-exercise data chips: clicking each one reveals its data card.
- [ ] The chart renders with visible data, and the printed table beneath it shows the same values.
- [ ] The self-scoring rubric: entering scores and clicking compute shows an overall average and a readiness label that make numeric sense (e.g. all 5s → highest label, all 2s → lowest label).
- [ ] Any control disabled until input has a visible reason next to it, so it never looks broken.
- [ ] No console errors are produced while clicking through the full flow.
- [ ] If a live browser was not available, this is stated explicitly in the delivery note, and the artifact is NOT reported as verified.

## Artifact Behavior

- [ ] Artifact lives at `articles/pm-interview-coach/PM-##-<concept-slug>-<company-slug>/index.html`, not left only in a temp/worktree directory.
- [ ] Single self-contained HTML file with React/Recharts/CSS/JS all inlined; `app.js` kept alongside as a readable, unminified source copy of the same code.
- [ ] No `<script type="text/babel" src="app.js">` and no `__APP_CODE__` placeholder remains.
- [ ] `prop-types@15.8.1` loaded before Recharts; Recharts URL is `Recharts.js`, not `Recharts.min.js`.
- [ ] `progress-ledger.md` has one new row logged for this session, using the `PM-##-<concept-slug>` naming form.
