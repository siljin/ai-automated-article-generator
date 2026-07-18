# Article Structure

## The Core Inversion: Principle First, Case as Evidence

Every article in this skill leads with the governing principle — the single transferable mental model the reader will carry out. The company case is evidence for the principle, not the other way around. This is the most important structural rule and applies to all 10 article types.

**Wrong order (do not do this):**
> "Here is how Meta built unified AI agents for infrastructure optimization. [8 sections of case detail] ... The lesson is: agents need skills libraries to be reusable."

**Correct order:**
> "Reusable agent skills, not monolithic agents, are what make AI automation scale across an organization. Meta's infrastructure optimization project is the clearest production evidence for this principle."

Every section ends with a "Principle in one sentence" prompt: the reader is asked to write the section's transferable principle in their own words. This is not scored, and it does not lock navigation — all sections stay freely accessible. It is an encouraged production step, not a barrier.

## Lifecycle Position Declaration

Every article must declare where on the AI product lifecycle it sits. Use this lifecycle:

```
Feasibility → Design → Build → Evaluate → Deploy → Scale → Govern
```

Place a one-line lifecycle badge in the article header: for example, "This case study lives at the **Build → Evaluate** transition." Cross-link at least one upstream type (what comes before this phase) and one downstream type (what comes after) so the reader can navigate the curriculum as a connected map.

## Universal Section Sequence

All types share this spine. Type-specific blueprints add or adjust sections within it.

### Opening: Principle Statement (before section 1)

One to three sentences. State the governing principle directly. Do not open with the company name. Do not open with a question. Do not open with a rhetorical observation. State the principle as a claim the reader will be asked to prove or disprove by the end.

Good pattern:
> "[Abstract principle]. [Company X] encountered [situation] and the evidence is [surprising implication]. This article uses their case to build and stress-test this principle."

### Section 1: Introduction

- Paragraph 1: Restate the principle as the article's thesis. Name the company and case. State why this company is the right evidence — what makes it the best available case, not just a convenient one.
- Paragraph 2: Context and scale. Key metrics at the time the case begins. Comparison to 2–3 benchmark peers or prior approaches.
- Paragraph 3: The structural gap — what the conventional approach got wrong or couldn't handle.
- Paragraph 4: Research questions. State 2–3 explicit questions, each mapping to an evidence section. Required format: "This article addresses [two/three] questions: First, [question]? Second, [question]? Third, [question]?"

### Section 2: Technical and Product Landscape

- Historical context: what existed before this approach, and why it was insufficient for AI workloads or product requirements.
- Benchmark comparison: 2–4 peer companies, prior solutions, or architectural alternatives, showing why the conventional path was taken by others and what it cost them.
- Baseline conditions: team size, infrastructure state, user load, or product metrics at the starting point of the case.
- The structural gap shown quantitatively or architecturally, not just described.

### Sections 3–5: Evidence Sections (one per research question)

Each evidence section follows this internal structure:

1. Restate the research question as a thesis challenge — a claim to defend.
2. Name and quantify the obstacle or tradeoff.
3. Present evidence for the thesis (from the real case, cited).
4. Present evidence against or limits (where the thesis fails or requires caveats).
5. The technical or product context that makes this non-obvious.
6. Insert 1–2 charts at data-dense points.
7. **Pattern transfer prompt:** At the section's end, the reader is prompted: "In one sentence, state the transferable principle from this section — something a PM or CTO at a different company could apply tomorrow." Minimum 20 characters. Not scored, and not required to move on — sections remain freely navigable.
8. End with an honest section-level conclusion: what the evidence supports, what it doesn't.

### Section 6: What Broke (mandatory for all types)

This section is non-negotiable. Every real AI/agentic system has failure modes, near-misses, or architectural regrets. This section covers them.

Structure:
- Paragraph 1: The failure mode, incident, or regret. Name it specifically. When did it happen? What triggered it?
- Paragraph 2: Why it happened. What assumption in the original design failed? What was invisible at design time?
- Paragraph 3: What the mitigation cost — in engineering time, user trust, latency, or dollars.
- Paragraph 4: The lesson from the failure. This is often the most important principle in the article, because it is not survivorship-biased.

Source requirement: This section must cite a real post-mortem, incident report, engineering retrospective, or published regret from the company. If the company has not published one, cite an analogous failure from a peer company or an independent analyst's documented reconstruction of the failure.

### Section 7: Conclusion

Do not summarize. Synthesize implications for the target reader.

- Paragraph 1: Restate the governing principle, now stress-tested by both the evidence and the failure case. One sentence. Then: what does partial failure of this principle look like?
- Paragraph 2: Implications for an AI PM — what decisions does this principle change?
- Paragraph 3: Implications for a future CTO — what platform, org, or governance decisions does this principle inform?
- Final sentence: The most important unresolved question — what the case does not answer and why it matters.

---

## Type-Specific Blueprints

### Phase 0: AI Product Lifecycle Spine

**Purpose:** A navigational map, not a deep-dive. This artifact is generated once and acts as the entry point to the learning system. It is shorter than all other types.

**Governing principle:** The seven phases of AI product development (Feasibility → Design → Build → Evaluate → Deploy → Scale → Govern) compound on each other — decisions made in Feasibility constrain every downstream phase, and the most expensive mistakes are ones made early and discovered late.

**Narrative thread:** Use one real end-to-end company narrative as a running example (e.g., how Shopify built and evolved Sidekick, or how Duolingo evolved its AI tutor from a rule-based system to a foundation-model-native product). Show all seven phases in one company's story.

**Special sections:**
1. Introduction: The lifecycle map and why it matters
2. Phases 1–3: Feasibility, Design, Build — decisions and their downstream effects
3. Phases 4–5: Evaluate, Deploy — the loop that most teams skip
4. Phases 6–7: Scale, Govern — why they require different skills than Build
5. Navigation guide: which of the 9 other article types covers which phase(s)
6. What Broke: a cross-phase failure — something that went wrong because a Phase N decision was made without thinking about Phase N+4.

**No deep research questions.** Questions are orientation checks: "Which phase are you currently working in at your job or in your studies?" and lifecycle mapping exercises.

---

### Type 1: AI Feasibility & Technical Scoping

**Governing principle pattern:** "The question is not 'can we use AI for this?' but 'what would have to be true about our data, latency budget, and acceptable error rate for AI to be the right choice?' Most AI project failures are traceable to a yes/no feasibility conversation that should have been a data readiness audit."

**Hook:** A product team that shipped an AI feature that worked in demo and failed in production — not because the model was bad, but because the feasibility criteria were never checked.

**Type-specific sections:**
- Section 3 (RQ1): When is AI the right tool? The decision criteria framework — error tolerance, data availability, latency budget, human-in-loop cost.
- Section 4 (RQ2): Data readiness gates — what data volume, quality, and coverage does v1 require? What are the hidden data debt traps?
- Section 5 (RQ3): Probabilistic scope framing — how to write a v1 spec when model behavior is non-deterministic and the capability curve will shift.

**What Broke emphasis:** A data-readiness assumption that turned out to be wrong, and what it cost to discover it in production rather than in scoping.

**Chart types:** Data readiness matrix, error tolerance vs use-case grid, v1 scope constraint diagram.

---

### Type 2: AI Product Teardown

**Governing principle pattern:** "The gap between what an AI product appears to do and what it actually does architecturally is where PMs get surprised by latency, cost, and reliability constraints. The architectural decisions are the product decisions — they are not separable."

**Hook:** A product that looks like [familiar category] to users but requires a multi-stage AI pipeline, model selection logic, fallback orchestration, and cost management that fundamentally constrains the roadmap.

**Type-specific sections:**
- Section 3 (RQ1): The AI architecture — what actually runs when a user triggers the feature. Models, retrieval, re-ranking, fallbacks, caching.
- Section 4 (RQ2): The product design decisions that followed architectural constraints — what got cut, what got delayed, what got launched "dumb" first to validate the surface.
- Section 5 (RQ3): Cost and latency management — how the team controlled the economics of generative AI at scale.

**What Broke emphasis:** A product decision that was made without understanding an architectural constraint, and what the rebuild cost.

**Chart types:** AI pipeline component diagram (SVG), latency vs quality tradeoff curve, cost-per-query over time, feature release timeline with architectural milestones.

---

### Type 3: Agentic System Architecture

**Governing principle pattern:** "A single capable agent is a demo. A production agent system is an orchestration problem: task decomposition, memory management, tool reliability, failure recovery, and evaluation — none of which are solved by making the model smarter."

**Hook:** A company that replaced simple automation with AI agents and discovered that the failure modes are categorically different from anything in classical software engineering.

**Type-specific sections:**
- Section 3 (RQ1): Architecture design — how the agent system is structured: orchestrator/worker split, tool design, memory types (in-context, external retrieval, episodic), routing logic.
- Section 4 (RQ2): Reliability engineering — the failure modes that emerged in production (tool call failures, agent loops, context exhaustion, hallucinated tool parameters) and how they were mitigated.
- Section 5 (RQ3): Evaluation design — how the team measures agent performance beyond task completion rate. Intent accuracy, tool selection accuracy, multi-turn coherence.

**What Broke emphasis:** A real agent failure in production — a loop, a wrong tool call sequence, or a guardrail gap that caused measurable damage.

**Chart types:** Agent topology diagram (SVG), tool call success rate over time, human-in-loop intervention rate vs task complexity, latency/cost per task vs accuracy surface.

---

### Type 4: AI-Native System Design

**Governing principle pattern:** "AI workloads violate the assumptions of classical systems design: requests are not idempotent, latency is non-deterministic, outputs have no schema, and cost is tied to compute at query time rather than at storage time. Each violation requires a different architectural response."

**Hook:** A system that was built with classical patterns, then broken by AI workload characteristics, requiring a partial or full redesign.

**Type-specific sections:**
- Section 3 (RQ1): The core AI-native architectural choices — chunking and indexing strategy, vector database selection and its tradeoffs, embedding model selection vs fine-tuning, streaming vs batch.
- Section 4 (RQ2): Retrieval and generation quality — how retrieval precision and generation consistency were maintained as data volume and query diversity grew.
- Section 5 (RQ3): Operational design — observability strategy for AI systems, drift detection, eval pipeline integration, cost management at scale.

**What Broke emphasis:** A specific technical failure caused by applying a classical assumption to an AI-native workload — a cache that invalidated incorrectly, a similarity threshold that caused retrieval collapse, a context window limit that was hit unexpectedly.

**Chart types:** System topology diagram (SVG), cost breakdown by component, latency P50/P95/P99 under load, retrieval precision vs recall as corpus grows.

---

### Type 5: AI Product Sense

**Governing principle pattern:** "AI does not replace product sense — it demands more of it. When model behavior is probabilistic and the user's mental model of AI is wrong, the PM's job is to design the product around the gap between what the model does and what the user expects."

**Hook:** A v1 AI feature that degraded a core metric because it was built to maximize model performance rather than to match user expectations.

**Type-specific sections:**
- Section 3 (RQ1): The v1 problem — what the first version optimized for, what the data revealed, and what the team had to unlearn.
- Section 4 (RQ2): The product iteration — how user research, metric analysis, and model debugging were combined in the discovery cycle. Which decisions were product decisions and which were model decisions.
- Section 5 (RQ3): Metric design for AI features — what metrics predicted long-term retention vs short-term engagement, and how the team avoided Goodhart's Law.

**What Broke emphasis:** A personalization, recommendation, or generation feature that worked in aggregate metrics but broke for a specific user segment, and what the team missed in the original experiment design.

**Chart types:** User engagement before/after timeline, A/B test results by segment, north star metric vs proxy metric divergence, feature adoption curve with model iteration markers.

---

### Type 6: AI Metrics & Evaluation Framework

**Governing principle pattern:** "A model that scores well on benchmarks can still fail its users. The gap between offline eval and online satisfaction is not a measurement problem — it is a problem of what the eval was designed to measure. The teams that close this gap build evals that are causally connected to user outcomes."

**Hook:** A product whose internal benchmark scores improved over several model iterations while user satisfaction declined — revealing a measurement system that was optimizing the wrong thing.

**Type-specific sections:**
- Section 3 (RQ1): Offline eval design — what evaluation sets, scoring rubrics, and automated checks the team used, and how they were built to avoid leakage.
- Section 4 (RQ2): Online eval and A/B design for AI — the additional complexity of testing AI features: novelty effects, regression risk for long-tail users, multi-turn evaluation.
- Section 5 (RQ3): The organizational layer — who owns evals, how eval investment was justified, and how the PM and ML engineer roles intersect at the eval boundary.

**What Broke emphasis:** An eval that produced false confidence — a metric that went up while real quality went down, and the incident that revealed it.

**Chart types:** Benchmark score vs user satisfaction scatter over time, eval pipeline diagram (SVG), false-negative rate in eval catches vs production incidents, cost of evaluation vs product quality improvement.

---

### Type 7: Product Psychology × AI

**Governing principle pattern:** "Users cannot calibrate trust in AI the way they calibrate trust in tools — because AI behavior is variable, opaque, and sometimes confidently wrong. The PM's job is to design the trust calibration process, not to assume it happens automatically."

**Hook:** An AI feature that was technically capable but behaviorally harmful — users either over-trusted it in high-stakes decisions or abandoned it entirely after a single wrong answer, neither of which matched the intended use.

**Type-specific sections:**
- Section 3 (RQ1): The psychological principle at stake — automation bias, overtrust, undertrust, or the illusion of explanatory depth. Defined precisely, with psychological research grounding.
- Section 4 (RQ2): How it manifested in the real product — specific UI patterns that amplified or reduced the bias, and what the behavioral data showed.
- Section 5 (RQ3): Design interventions — uncertainty display, progressive disclosure, AI explanations, confidence indicators. What worked, what backfired, and why.

**What Broke emphasis:** A design intervention that was intended to increase appropriate trust but instead increased automation bias or created a new failure mode.

**Chart types:** Trust calibration curve (user confidence vs AI accuracy), user override rate vs AI confidence level, satisfaction by UI transparency condition (A/B), cognitive load proxy across variants.

---

### Type 8: AI Incident & Recovery

**Governing principle pattern:** "The most durable AI system knowledge comes from failures, not successes — because failures reveal the assumptions that engineering blogs never write about. Understanding what broke, and why the original design could not anticipate it, is worth more than understanding what worked."

**Hook:** A production AI incident whose root cause reveals a systemic assumption in how the system was designed — not a bug, but a design principle that was valid at one scale or data distribution and catastrophically wrong at another.

**Type-specific sections:**
- Section 3 (RQ1): The incident — what happened, what the symptoms were, how long it took to detect, and the initial diagnosis vs the actual root cause.
- Section 4 (RQ2): The root cause analysis — the design assumption that failed, why it was reasonable at the time, and what conditions caused it to fail.
- Section 5 (RQ3): Recovery and prevention — what the team changed architecturally, operationally, and in their eval/monitoring practice. What they chose not to change and why.

**What Broke emphasis:** This type is entirely built on the failure — it has no "success story" section. The governing principle is extracted from the failure pattern, not from a success.

**Special rule:** The primary source must be a real published post-mortem, incident report, or engineering retrospective. If none exists for the exact company, it must be clearly labeled as a reconstruction from multiple secondary sources, with each secondary source cited.

**Chart types:** Incident timeline (SVG), detection-to-resolution gap over multiple incidents, error rate with annotated root cause events, architectural change before/after diagram.

---

### Type 9: CTO Scaling Playbook

**Governing principle pattern:** "AI systems do not scale the way classical software scales — the same architectural pattern that works at 10M requests/day begins to accumulate model-specific technical debt at 100M, and the engineering leadership decisions that matter most are the ones that maintain the ability to swap, retrain, and deprecate models without halting product development."

**Hook:** An engineering organization that scaled its AI infrastructure successfully but made a series of decisions it now considers expensive mistakes — decisions that looked right at the time and only revealed their cost at the next order-of-magnitude of scale.

**Type-specific sections:**
- Section 3 (RQ1): Organizational decisions — team structure, specialization choices (platform vs product ML engineers), hiring sequencing, the centralize-vs-embed tradeoff for AI teams.
- Section 4 (RQ2): Technical platform decisions — what the team built vs bought vs partnered on, what abstractions they created to maintain model-swap flexibility, and where they accumulated AI-specific technical debt.
- Section 5 (RQ3): Governance at AI scale — how model risk, AI safety review, compliance, and deprecation were built into the shipping cadence without halting velocity.

**What Broke emphasis:** A scaling decision that was right at one order of magnitude and wrong at the next — architectural, organizational, or both — and what the correction cost.

**Chart types:** Engineering headcount vs AI capability growth curve, build/buy/partner decision matrix over time (SVG), incident rate and MTTR vs team size, AI infrastructure cost per output unit as org scaled.

---

## Writing Standards (all types)

- The governing principle appears in the first paragraph, not the last. Every sentence must advance the argument toward or away from the principle.
- Never write "significantly" without a number.
- Benchmark every major claim against at least one peer.
- Every statistic carries an inline source label in the form `(Source, Year)`.
- Distinguish observation (what the data shows), insight (why it is non-obvious or matters), and implication (what a PM or CTO should do). Prose and chart interpretations must reach at least the insight level.
- No bullet points in analytical prose inside the final article.
- Introduction: 4 paragraphs. Background: 4–6 paragraphs with at least 2 charts. Each evidence section: 5–8 paragraphs with 1–2 charts. What Broke: 4 paragraphs. Conclusion: 3–4 paragraphs.
- Forward-looking Apply It: always includes both a present-day application and a 2027 variant ("given the same constraints, what would you build differently as foundation model capabilities change?").

## Plain Language (all types)

Write so a reader new to this corner of AI can follow every sentence on the first read. The subject is technical, so keep the analysis deep — but make the words simple. Simpler language, not simpler thinking.

- Prefer short sentences. One idea per sentence; if a sentence runs past about 25 words or needs two reads, split it.
- Choose the plain word over the fancy one: "use" not "utilize", "shows" not "demonstrates", "so" or "because" not "thereby" or "owing to the fact that", "enough" not "sufficient", "build" not "architect" (as a verb).
- Cut filler openers: "it is important to note that", "it is worth highlighting", "in order to", "the fact that". Say it directly.
- Avoid long noun stacks and abstraction pile-ups ("latency optimization capability enablement"). Name the actor and the action: which component or team does what, and what happens.
- Go easy on dashes and semicolons. If a sentence leans on several, rewrite it as two plain sentences.
- Spell out and explain every technical term, acronym, model name, or piece of jargon the first time it appears, in everyday words. After that you may reuse it.
- Read each paragraph aloud in your head. If you lose the thread, simplify.

This standard does not lower the rigor of the argument, the citations, the architecture detail, or the quantitative reasoning. It only changes the diction and sentence shape.

## Per-Page Glossary (all types)

Every page (section) ends with a short **Glossary** of the new terms and acronyms introduced on that page. This is how a reader without ML-systems background keeps up.

- List only terms that are new on this page. Do not repeat a term already defined on an earlier page.
- Each entry is the term (acronyms spelled out in full, e.g. "RAG — Retrieval-Augmented Generation") followed by a one-line, plain-language definition a newcomer can understand. Do not define jargon with more jargon.
- Keep definitions to a single sentence. The goal is recognition, not a textbook entry.
- If a page introduces no new term or acronym, omit the glossary for that page rather than padding it.
- Glossary definitions are reference aids; never write a scored question whose answer is simply a glossary definition.
