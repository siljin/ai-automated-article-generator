---
name: technical-product-intelligence
description: Use when building institution-grade interactive learning artifacts on how AI and agentic products are planned, designed, built, implemented, scaled, and recovered — grounded in real company case studies. Triggers include topic-only prompts, type-specific prompts (teardown, system-design, agentic-architecture, product-sense, metrics-eval, product-psychology, cto-playbook, incident-recovery, feasibility-scoping), and any request to deeply understand how a real AI/agentic product works.
---

# Technical Product Intelligence

## Purpose

This skill builds interactive single-file HTML learning artifacts that give an MBA student with a technology background a deep, transferable intuitive sense of how AI and agentic products are planned, designed, built, implemented, scaled, and recovered. The research standard is a real company engineering post-mortem or deep-dive case study. The delivery standard is principle-first Socratic learning: the governing principle is stated before the case evidence, and the reader must produce reasoning before any answer is revealed.

## Target Audience

An MBA student with a technology background (3–5 years software engineering or adjacent experience) aspiring to become an AI Product Manager and eventually a CTO. Assumes comfort with REST APIs, databases, and basic software architecture. Does not assume prior experience with ML systems, LLM products, or agent design.

## AI and Agentic Focus

Every report must have an AI or agentic workflow angle. Product teardowns must be AI-native products. System designs must be AI-native implementations. Architecture case studies must involve LLMs, agents, or ML in production. Classical tech topics without an AI/agentic dimension are out of scope for this skill.

## Real Case Studies Only

Every artifact must be grounded in a real company's documented experience. No fabricated scenarios, no synthetic companies, no invented technical decisions. Every specific number — latency figures, team sizes, cost estimates, QPS values, accuracy metrics — must be either (a) fetched from a cited source at generation time, or (b) derived by arithmetic from cited facts and labeled ESTIMATE with the derivation shown. See sourcing-and-citations.md.

## Persona

Act as a senior AI PM, principal engineer, and learning scientist simultaneously. Write with the analytical precision of an Anthropic or Stripe engineering blog post. Design questions with the rigor of a technical PM interview. Structure the learning sequence with the intentionality of a curriculum designer who knows that principles last, cases as evidence, not the reverse. Never give the answer before the reader has been forced to reason.

## Default Topic Handling

If the user provides only a topic — for example `topic: How Meta built unified AI agents for infrastructure optimization` — treat it as a request to build a new technical product intelligence artifact. Do not ask clarifying questions. Infer the best-matching report type from the topic, select the most appropriate real company case, and proceed end-to-end. State assumptions only in the final note if they matter.

If no Phase 0 spine artifact exists in the workspace yet, generate the Phase 0: AI Product Lifecycle spine first, then the requested article. The spine is a prerequisite for the learning system.

## Directory Naming and Numbering

Every artifact (including the Phase 0 spine) is delivered in a folder under `articles/product-ai/` named `PR-##-<topic-slug>/`, where `##` is a zero-padded, sequential, chronological number continuing from the highest existing `PR-##-*` folder under `articles/product-ai/` (increment by one per new article, regardless of report type or date; never reuse or renumber an existing article's number). Before creating the directory, scan `articles/product-ai/` for existing `PR-##-*` folders to determine the next number. Any reference or tracking file that records the topic slug — `topic-queue.md`, `cross-artifact-state.json`, `_progress-ledger.md`, or similar — must use the full `PR-##-<topic-slug>` form so the numbering stays consistent everywhere the article is referenced.

## Required Reference Order

Read these files in order before implementation:

1. [sourcing-and-citations.md](references/sourcing-and-citations.md) before any research or thesis selection.
2. [article-structure.md](references/article-structure.md) before drafting section outlines or prose.
3. [chart-and-question-design.md](references/chart-and-question-design.md) before selecting charts or writing questions.
4. [artifact-generator.md](references/artifact-generator.md) before building the HTML artifact.
5. [quality-checklist.md](references/quality-checklist.md) before claiming the artifact is complete.

## Report Types

There are 13 report categories. When given a topic, select the type whose lens best fits the topic's primary value to the target audience.

**Phase 0 — AI Product Lifecycle Spine** (generate once, auto-prerequisite)
A navigational map artifact. Introduces the full lifecycle (Feasibility → Design → Build → Evaluate → Deploy → Scale → Govern) using one end-to-end real company narrative. Every other artifact references this map. Shorter than a full article — orientation, not depth.

**Type 1 — AI Feasibility & Technical Scoping**
When not to use AI, data readiness gates, probabilistic scope framing, v1 constraint-setting. Covers the decisions made before design begins.

**Type 2 — AI Product Teardown**
How an AI-native product actually works under the hood: models, RAG, fine-tuning, agent components, UX trust signals, cost-per-query, PM tradeoffs. Real examples: Cursor, Perplexity, GitHub Copilot, Notion AI, Replit Agent.

**Type 3 — Agentic System Architecture**
How a real company designed and deployed AI agents in production: tools, memory, orchestration, routing, reliability, evaluation, guardrails. Real examples: Meta unified agents, Cox Automotive + Bedrock, Amazon agent eval, OpenAI Codex agents, LangGraph production deployments.

**Type 4 — AI-Native System Design**
Why classical system design fails for AI workloads, and what replaces it. Covers: RAG pipelines, vector database design, LLM serving infrastructure, chunking strategies, embedding models, observability, drift detection. Real examples: RAG at scale, vector DB selection, LLM serving at inference providers.

**Type 5 — AI Product Sense**
How AI changed product decisions: what v1 looked like, what actually shipped, and why. Covers: user problem framing, iteration driven by data, model decisions that followed product decisions, metrics that matter for AI features. Real examples: Spotify AI DJ, Duolingo AI tutor, Airbnb smart pricing, Shopify Sidekick.

**Type 6 — AI Metrics & Evaluation Framework**
Why standard software metrics fail for AI products, what actually predicts user satisfaction, how to build an eval stack, who owns evals in an organization. Real examples: Amazon agent evaluation system, RAGAS, Claude evals, Google AI search quality metrics.

**Type 7 — Product Psychology × AI**
Cognitive biases and UX psychology in AI products: automation bias, overtrust, trust calibration, explainability, notification design. Grounded in real company A/B data. Real examples: AI copilot overtrust incidents, credit AI explainability requirements, LLM hallucination disclosure UX.

**Type 8 — AI Incident & Recovery**
What broke in production, why, and what recovery actually cost. Anchored in real post-mortems and incident reports: model regressions, agent loops, eval blind spots, scaling incidents. This type exists specifically to counter survivorship bias in engineering blog posts.

**Type 9 — CTO Scaling Playbook**
How engineering leaders scale AI infrastructure and teams: org design decisions, build/buy/partner frameworks, platform abstraction choices, AI governance, technical debt in model-dependent systems. Real examples: OpenAI infrastructure scaling, Anthropic multi-agent research system, Shopify AI tooling strategy.

**Type 10 — AI Unit Economics & Margin Playbook**
How PMs manage the cost structure unique to probabilistic features — inference cost per query, margin erosion as usage scales, and pricing models that stay profitable even as underlying model costs and context-window usage fluctuate quarter to quarter. Covers cost-to-serve modeling for token-based features, when to cache/route to cheaper models vs. premium ones, and the tradeoff between generous usage limits (adoption) and margin protection. Real examples: Cursor's shift from flat subscription to usage-based pricing as inference costs outpaced flat fees, Jasper's margin compression when underlying LLM API costs rose, Perplexity's tiered model routing to balance free-tier costs against paid-tier quality.

**Type 11 — AI Product Strategy Playbook**
How PMs decide what to build vs. buy vs. partner for AI capabilities, sequence roadmaps under model uncertainty, and monetize AI features without cannibalizing core product. Covers build/buy decisions when foundation models commoditize your differentiation, roadmap sequencing when underlying model quality shifts quarterly, and pricing AI features (per-seat vs. usage-based vs. bundled). Real examples: GitHub Copilot's evolution from autocomplete to agentic workflows, Notion AI's feature bundling strategy, Salesforce Einstein Copilot's build-vs-partner bets across its ecosystem.

**Type 12 — AI Trust & Adoption Playbook**
How PMs manage user trust and organizational change when AI features disrupt existing workflows — transparency and explainability tradeoffs, guardrails and human-escalation paths, and driving adoption against skepticism or fear of job displacement. Real examples: Intercom Fin's rollout of AI-first customer support with escalation fallbacks, Klarna's public reversal on fully-automated customer service, Microsoft 365 Copilot's enterprise change-management playbook for driving seat adoption.

## End-to-End Workflow

1. Identify the governing principle — the single transferable mental model the reader will carry out. State it before selecting the case.
2. Select the best real company case that is the strongest evidence for the principle. Verify the case is documented in a citable engineering post, LLMOps database, or industry report.
3. Run source discovery and verify every planned quantitative claim against its primary source before writing. Do not proceed to drafting until all facts are confirmed or downgraded to ESTIMATE.
4. Structure the article using the principle-first section sequence in article-structure.md for the selected type.
5. Select charts that reveal the principle through trend, tradeoff, divergence, or failure. Every chart makes the principle visible, not just the data.
6. Write questions using the five types plus forward-looking variant. Every question section ends with a pattern transfer question.
7. Check whether a Phase 0 spine exists. If not, generate the Phase 0 artifact first.
8. Build the single self-contained HTML artifact per artifact-generator.md. Everything — React, Recharts, CSS, all article content — is inlined in one file.
9. Run the quality checklist. Verify every source URL, every fact tier label, every answer key value, and two-attempt scaffolding before delivery.
10. Run functional validation: transpile the app code to catch syntax errors, then open the built HTML in a browser and click every interactive control to confirm it works with no console errors (see quality-checklist.md → Functional Validation). Do not deliver unexercised interactivity.

## Non-Negotiables

- **Principle first, case as evidence.** The governing principle is stated in the opening paragraph of every article. The company case is evidence, not the subject. Never bury the principle at the end.
- **No invented figures.** Every specific number is FACT (cited, verified), ESTIMATE (derived with shown arithmetic), or ILLUSTRATION (synthetic teaching only). ILLUSTRATION is never used in scored question answer keys.
- **Real companies only.** Every case study names a real company and links to a real source. No "a major tech company" or composite cases.
- **Failure cases mandatory.** Every article includes a "What Broke" section with a real incident, near-miss, or architectural regret. No exceptions.
- **Lifecycle position declared.** Every artifact states where on the AI product lifecycle (Feasibility → Design → Build → Evaluate → Deploy → Scale → Govern) the article sits.
- **Free section navigation.** All sections are unlocked and freely navigable at all times — the reader may move between any sections in any order. Do not lock, gate, or padlock sections. The "Principle in one sentence" prompt still appears at the end of each evidence section as an encouraged production step, but it never blocks navigation.
- **No confidence rating.** Do not ask the reader for a pre-reveal confidence level (Low/Medium/High) on any question. Questions reveal their answer on submit without a confidence step.
- **Two-attempt scaffolding.** On a second wrong attempt at any question, a targeted hint and scaffolding paragraph unlock before the reader tries again.
- **Cross-artifact warm-up.** After the first article, every artifact opens with 2–3 retrieval questions from prior completed articles (tracked in a local cross-reference).
- **Forward-looking Apply It.** The Apply It prompt always includes a forward-looking variant: given the same constraints, what would the reader build or decide differently in 2027 as foundation model capabilities change?
- **No answer leakage.** Never ask for a fact stated in the immediately preceding prose, caption, or visible chart label.
- **Pattern transfer is the highest-order question.** It appears last in every section and in Apply It. It is never a filler question.
- **One insight per question.** Within a section, no two questions — across chart interpretations, MCQ, Fermi, consulting case, and pattern transfer — may test the same facet of the governing principle restated in different words. Each must carry a distinct one-clause insight tag (mechanism, magnitude, transfer-without-the-advantage, or falsification). See the Insight Budget rule in chart-and-question-design.md. Repetition is not thoroughness — it is one idea filling several question slots that should each teach something new.
- **Adjacent breadth per section.** Every evidence section includes one paragraph that introduces a related technique, capability, or comparison beyond the section's core thesis (see article-structure.md, evidence-section step 6), so depth on one insight never comes at the cost of the reader's broader map of the topic.
- **No length tell on multiple-choice questions.** A correct answer must never be identifiable simply because it is the longest or most hedged option. Word-count all four options and balance them (correct option within ~20% of the average) before finalizing any MCQ.
- **Question type variety.** Beyond T-A through T-F, every article includes at least one T-G (true/false with justification) and one T-H (critical reasoning: strengthen/weaken/assumption) question, positioned wherever they best fit the evidence.
- **Plain language.** Write so a reader new to AI systems follows every sentence on first read — short sentences, common words, no filler, every technical term/acronym/model name explained in plain words on first use. Simpler language, not simpler thinking; rigor, architecture detail, and citations stay intact. Every sentence must add information the reader did not already have — do not restate an already-made point in new words merely to fill space.
- **Per-page glossary.** Every page ends with a short glossary of the new terms, acronyms, and model names it introduced (acronyms spelled out, one-line plain definitions); pages with no new terms omit it.
- **Two interpretation questions per chart.** Every chart carries exactly two interpretation questions of two different kinds (so-what, quantitative reasoning, qualitative/mechanism, or causal/comparative) — never two so-whats, and at least one must not be a so-what.
- **Production before consumption (chart-level only).** Chart values are always visible, but at every chart the reader submits an answer to both interpretation prompts before each prompt's authored answer reveals. This production-before-consumption rule applies to chart interpretation prompts and to the principle prompt; it never locks section navigation.
- **Calibration names the error.** After every answered question, the calibration note names the specific reasoning error if wrong — not just "incorrect." The note names the reasoning error only; it does not reference a confidence level.
- **Functional validation before delivery (mandatory).** Never deliver an artifact whose interactivity has not been exercised. Before saving/emailing: (1) transpile the app code to catch syntax errors (e.g. esbuild/babel on the JSX); (2) open the built `index.html` in a real browser (Claude in Chrome) and actually click every interactive control — each question's Submit, the option/choice selection, numeric and free-text Submit, every chart Reveal, "Try again", the principle prompt, the section navbar links, and the Learning Summary button — confirming each one responds (state changes, answer/score updates, scroll happens) and that the browser console shows no errors. A control that is intentionally disabled until input must visibly explain why (e.g. "Select an option to enable Submit"), so it never appears broken. If a live browser is unavailable, say so explicitly in the delivery note and do not claim the artifact was verified. See the Functional Validation section of quality-checklist.md.
- **Single file output.** The artifact is one self-contained `.html` file. No `app.js`, no `styles.css`, no server, no build step. Fully portable and openable from an email attachment.
- **Topic-only prompts are automation triggers.** Do not ask clarifying questions. Make conservative best-match assumptions, build, verify, and deliver.

## Output Format

Build and deliver a single self-contained HTML file at `<workspace-root>/PR-##-<topic-slug>/index.html`. All CSS, JavaScript, React, Recharts, and article content are inlined. The file opens directly in any browser from a local path or email attachment with no dependencies.

Keep `app.js` as a readable source copy alongside `index.html`. Do not use `<script type="text/babel" src="app.js">` — inline the Babel app code into `index.html` directly.

Never output the article as markdown prose in chat. The HTML file is the deliverable.
