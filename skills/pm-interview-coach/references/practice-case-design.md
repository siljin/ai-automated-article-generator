# Practice Case Design

## Originality Requirement

The Practice module must never repeat the Observe module's company, numbers, or scenario. Use one of: a fictional company facing a problem structurally similar to the real one; a real company with a clearly-labeled hypothetical problem; or a different company in an adjacent industry where the same concept transfers. Prefer a fictional company when the concept needs exact, controllable numbers for the quantitative exercise — invented numbers about a fictional company are honest; invented numbers about a real company are not.

## Gating Model: Reveal-After-Input, Never Navigation-Lock

Every stage's reference answer is hidden until the learner submits a non-trivial input (a minimum-length check is enough: reject a submission of, say, under ~15-20 characters with a message explaining why, not a silent failure). Do **not** lock whole sections behind completing a previous one, and do not implement a "sectionUnlocked" state or a disabled "Next" control — the learner can scroll and read any stage at any time; only the *reveal* of that stage's reference answer is gated behind that stage's own input.

## Stage Sequence

Adapt stage count to the concept, but a full case generally includes, in order:

1. **Case prompt.** Concise — company/product, the learner's PM role, the business objective, user/customer context, time horizon, key constraints, and 2-4 "case givens" (context a real interviewer would offer up front, not gated behind a clarifying question). Do not include the solution here.
2. **Clarifying questions.** Prompt: "What would you ask before solving this?" Prepare 5-6 canonical questions a strong candidate would ask (covering objective, market/segment, current performance, strategic importance, constraints, definition of success), each with several tag phrasings so differently-worded versions of the same question still match. See "Clarifying-Question Matching" below. After the learner is done, show which canonical questions they covered and which important ones they missed, with a one-line reason each missed question mattered.
3. **Framework stage.** Ask the learner to structure the problem in concept-specific buckets (never a generic "users/business/competitors" default) before any data is shown. Reveal a reference framework of 3-5 sections with a reason each section is necessary.
4. **Data/exhibit stage.** At least one realistic exhibit (segment table, funnel, cohort table, competitive comparison, etc.) with every exact value printed in a table — never make the learner read a number off a bar height. Ask for the 2-3 most important insights, why they matter, what additional information they'd want, and how the evidence changes the decision.
5. **Quantitative exercise.** Reveal the needed data via clickable "ask the interviewer" chips. Require the learner to show their work before revealing the reference solution, which must include: formula, substitution, calculation with units, a sanity check, the interpretation, and a stated limitation of the calculation. Do not reward a correct number with no product judgment attached.
6. **Decision stage.** Force a real trade-off (pick one segment/initiative/metric/experiment out of several plausible ones). Require: the decision, supporting evidence, the rejected alternatives and why, stated assumptions, risks, and the conditions that would flip the decision. The reference answer must explain why it's the strongest choice given the case's stated priority — and explicitly acknowledge that a different choice would be defensible under a different priority. Never present it as the only correct answer.
7. **Metrics and validation stage.** Require one primary metric, 2-4 supporting metrics, 2+ guardrail metrics, a measurement window, a baseline/comparison group, an experiment or rollout design, a decision threshold, and at least one way the metric could be gamed or produce an unintended consequence.
8. **Final recommendation stage.** Ask for a ~60-90-second executive recommendation: recommendation, 2-3 supporting reasons, expected impact, main risk, mitigation, immediate next step. Reveal a model recommendation that is decisive and appropriately qualified, not hedgy.
9. **Self-scoring rubric.** Close with the 9 standard dimensions (problem clarification, structured thinking, concept application, user-centric reasoning, business judgment, analytical reasoning, prioritization/trade-offs, metrics/validation, communication), each 1-5, with a short description of what a 2 vs a 4 looks like *for this specific case* so self-scoring isn't generic. Compute an overall average, map it to a readiness label, and surface a strongest/weakest muscle and a recommended next concept (a different category than this session's, per concept-rotation.md).

## Clarifying-Question Matching

Reuse the hybrid pattern already proven in `skills/daily-case-practice/references/case_template.html`: try semantic matching first via the Cowork bridge (`window.cowork.askClaude()`, understands paraphrasing/intent), and fall back to a tuned keyword matcher (stopword stripping, light stemming, ~0.4 token-overlap threshold against several tag phrasings per canonical question) if the bridge is unavailable — e.g. the file opened outside Cowork. Write generous, varied tag phrasings per canonical question regardless, since the fallback depends entirely on them.

## Extending Semantic Grading to Freeform Stages

For the framework, decision, metrics, and recommendation stages, also attempt Cowork-bridge grading of the learner's freeform text against a short rubric (what a strong answer includes for this specific stage), asking for a brief verdict (what's present, what's thin/missing, one follow-up question) — not a numeric score, since this is self-paced practice, not a certification. If the bridge is unavailable or errors, fall back to showing the reference answer plus a static self-check checklist (the same rubric bullets, for the learner to check off themselves) rather than showing nothing. Always label which mode produced the feedback so the learner knows whether they got a real semantic read or a self-check list.

## Data and Numbers Discipline

Every exhibit table must sum/reconcile correctly (percentages to 100%, sub-totals to totals) — check the arithmetic before finalizing. Every quantitative-exercise reference solution's numbers must trace back to the exhibit's printed values or the data chips; never introduce a number in the reference solution that wasn't available to the learner.

## Follow-Up Questions

After each stage's reveal, include one interviewer-style follow-up question (a single line) that a real interviewer would ask next — this is what makes the practice feel like a live interview rather than a worksheet, and it's static (doesn't need grading).
