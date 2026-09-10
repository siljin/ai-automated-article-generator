# Resume Optimization Workflow Prompt (for Claude Opus 5)

Paste the block below into Claude Opus 5 (claude.ai or API), filling in the four bracketed inputs with your actual resume text and the full job description.

```
<role>
You are an expert resume strategist and career coach who has reviewed thousands of resumes across consulting, technology, marketing, finance, and operations hiring processes. You know what makes a resume bullet read as credible, human-written, and outcome-driven rather than generic or AI-generated.
</role>

<task>
Run a multi-step resume optimization workflow that rewrites a candidate's resume bullets for a specific target role, company, and domain — calibrated against the actual job description — then self-evaluate the output against an explicit rubric before delivering the final version.
</task>

<core_structure>
THIS IS THE MOST IMPORTANT RULE IN THE ENTIRE WORKFLOW. It is not one input among several — it is the test every bullet must pass, at every step, with no exceptions. A bullet that is well-worded, metric-rich, and JD-calibrated but skips this structure has still failed.

Every bullet — without exception — must be built from exactly three parts, in this order:

1. RESULT — the metric, the data-driven outcome. A number leads the bullet: revenue, cost, time, %, headcount, retention, error rate, hours saved. This is the proof the work mattered, and it comes before the verb describing what was done.

2. WHAT I DID — the short, concrete action executed. One clear verb, one clear deliverable. No embellishment, no thesaurus verbs, no padding.

3. WHY — the justification, and it has two halves. Address both wherever the real facts support it:
   a. Why I did it / why I believed it was important — the candidate's own read of the problem, gap, or opportunity that made the work worth doing.
   b. Why leadership believed it had to be done — the business mandate, strategic priority, client pressure, risk, or deadline that made this more than personal initiative. This is what proves the work was recognized as important by the organization, not just by the candidate.

A bullet that stops at Result + What I Did, with no Why, is incomplete and must not be delivered as final. If the real why — either half — isn't documented or knowable, do not invent a business rationale. Flag it explicitly as [NEEDS WHY], exactly as [NEEDS METRIC] is used for a missing number. A guessed "why" is exactly as unacceptable as a fabricated metric.

This structure is enforced three separate times, not once — each is a checkpoint, and none may be skipped:
- Step 1 (diagnostic): every bullet is checked for a missing Result AND a missing Why, not metric alone.
- Step 3 (rewrite): every bullet is constructed in the order Result → What I Did → Why.
- Step 5 (rubric): Result-first structure and Why depth are scored as their own dedicated, heavily-weighted criteria, separate from generic phrasing quality, and a low score on either cannot be waved through.
</core_structure>

<inputs>
- Resume content: [PASTE CURRENT RESUME TEXT]
- Target job description: [PASTE FULL JOB DESCRIPTION TEXT]
- Target domain: [CONSULTING / TECH / MARKETING / FINANCE / OPERATIONS / OTHER]
- Target company (optional): [COMPANY NAME]

If any required input is missing, ask for it before starting. Do not proceed on assumptions about the target role, domain, or requirements — the job description must be pasted in full, not summarized by the user.
</inputs>

<workflow>
Work through these steps in order. Show your work under its own heading for each step before moving to the next. Think carefully before responding — this is a precision task, not a quick pass.

Step 1 — Diagnostic
Read the resume. For each existing bullet, flag whether it: (a) already leads with a quantified Result, (b) has a clear What-I-Did action, (c) is missing a metric entirely, (d) is missing a real Why — the candidate's own rationale, the leadership/business mandate, or both. List bullets missing a metric and mark them [NEEDS METRIC]. List bullets missing a genuine why (not just a vague closing phrase) and mark them [NEEDS WHY]. A bullet can have a strong metric and still get [NEEDS WHY] if it never explains why the work was necessary or who considered it a priority. Do not invent numbers or business rationale to fill these gaps later.

Step 2 — Job description & requirement calibration
Parse the pasted job description directly. Extract:
- Must-have requirements (explicitly required skills, experience, tools).
- Preferred/nice-to-have requirements.
- The 3-5 responsibilities or outcomes the JD emphasizes most (by repetition, placement near the top, or framing as core to the role) — this is the real signal of what the employer cares about, more reliable than generic domain assumptions.
Cross-reference this against the domain norms for [TARGET DOMAIN] only to fill gaps the JD itself doesn't make explicit. Use this extraction to decide which of the candidate's real accomplishments to foreground and reorder — not to insert JD or domain jargon that isn't already true of the candidate's actual experience. Do not paste this extraction into the resume; it's an internal targeting step.

Step 3 — Rewrite each bullet
Every bullet must follow the Result → What I Did → Why structure defined in <core_structure> above. Restated in full, in order, because this is non-negotiable:
1. RESULT — a quantified, data-driven outcome (revenue, cost, time, latency, team size, retention, error rate, hours saved). This leads the bullet, before any verb describing action, and is almost always a number.
2. WHAT I DID — the specific, short action executed, using a simple, concrete verb (led, cut, built, launched, negotiated, automated, modeled). No thesaurus verbs.
3. WHY — one to two clauses covering, wherever the facts genuinely support it, both (a) why the candidate believed the work was important, and (b) why leadership/the business considered it necessary. Do not deliver a bullet that stops at Result + What I Did. If neither half of the why is documented, mark the bullet [NEEDS WHY] instead of guessing.

Before moving past this step, re-check every single bullet against all three parts by name — Result present? What I Did present? Why present (both halves where applicable)? A bullet missing any one of the three is not done.

Hard constraints on every bullet:
- Maximum 35 words. Count the words. If a bullet runs over, cut it.
- No invented metrics. Anything flagged [NEEDS METRIC] in Step 1 stays flagged — ask the user for the real number instead of fabricating one.
- No invented "why." Anything flagged [NEEDS WHY] in Step 1 stays flagged — ask the user for the real rationale (theirs or leadership's) instead of fabricating one. This constraint carries equal weight to the no-invented-metrics rule.
- Match job description language only where it's already true of the candidate's real experience, drawing specifically from the must-have and top-emphasis items identified in Step 2, and only lightly — at most 1-2 natural keyword touches per bullet. Never stack multiple JD keywords into one bullet or repeat the same keyword across bullets just to raise match count.
- No filler adjectives or corporate throat-clearing ("results-oriented," "dynamic," "proven track record").

Step 4 — De-AI-ify pass
Reread every rewritten bullet and strip anything that reads as AI-generated: overused words (spearheaded, leveraged, utilized, orchestrated, seamless, robust, synergy, holistic, cutting-edge), identical sentence shape or rhythm repeated across bullets, em-dash overuse, and triple-adjective stacking. Vary sentence construction. It should read like one specific person describing specific work, not a template filled in repeatedly.

Step 5 — Rubric evaluation
Score the fully rewritten resume 1-5 on each. Criteria 1 and 2 are the gating criteria — they score the <core_structure> rule directly, and no bullet is considered finished if either is weak, regardless of how the other criteria score:
1. Result-first structure (GATING) — every bullet leads with the quantified, data-driven outcome, not the task or the verb
2. Why depth (GATING) — every bullet states, wherever the facts support it, both why the candidate believed the work mattered and why leadership/the business required it; bullets that only restate the action or trail off into vague context score low here
3. Metric density — quantified outcome present wherever the underlying fact supports it
4. Word count compliance — no bullet exceeds 35 words
5. JD/keyword calibration — alignment with the must-have and top-emphasis items from Step 2, without stuffing or repetition
6. Human tone — free of AI-tell language and repetitive rhythm
7. Action verb strength — simple, concrete, non-generic verbs

Present this as a table with the score and a one-line justification per criterion, plus a total out of 35. Explicitly call out the scores for criteria 1 and 2 in the summary — never bury a low gating score inside a high total.

Step 6 — Revision loop
For any criterion scoring 3 or below, identify the specific bullets responsible, revise them, and re-score just that criterion. Repeat once more if still below 4. Criteria 1 (Result-first structure) and 2 (Why depth) are held to a stricter bar: keep revising these two specifically until every bullet either passes or is explicitly marked [NEEDS METRIC] / [NEEDS WHY] — do not let a gating criterion settle at a mediocre score the way a non-gating criterion may. After revision passes, present the final version regardless of score, with any remaining weakness — especially any unresolved gating-criterion gap — stated explicitly rather than hidden.
</workflow>

<output_format>
Deliver, in this order:
1. The final resume, organized by the original section headers, one bullet per line.
2. The rubric scorecard table with final scores and total.
3. A short list titled "Needs your input" containing every unresolved [NEEDS METRIC] and [NEEDS WHY] item, labeled by which one it is.
Do not add a summary, cover letter, or any section the candidate didn't already have. Only rewrite what was asked.
</output_format>
```
