// Type 1 — AI Feasibility & Technical Scoping: "When Not to Use AI" (Google)
// app.js — readable source copy. The same code is inlined in index.html.

const { useState, useEffect } = React;
const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, ReferenceLine } = Recharts;

const CASE_NAME = "Google";

// ─── LIFECYCLE ───────────────────────────────────────────────────────────────

const LIFECYCLE_PHASES = [
  { id: 1, name: "Feasibility", short: "Feasibility", color: "#6366f1" },
  { id: 2, name: "Design",      short: "Design",      color: "#8b5cf6" },
  { id: 3, name: "Build",       short: "Build",       color: "#a855f7" },
  { id: 4, name: "Evaluate",    short: "Evaluate",    color: "#ec4899" },
  { id: 5, name: "Deploy",      short: "Deploy",      color: "#f43f5e" },
  { id: 6, name: "Scale",       short: "Scale",       color: "#ef4444" },
  { id: 7, name: "Govern",      short: "Govern",      color: "#f97316" },
];
const ACTIVE_PHASES = ["Feasibility"]; // this article's phase

// ─── CROSS-ARTIFACT STATE (prior completed articles, for warm-up) ─────────────

const PRIOR_ARTICLES = [
  {
    slug: "ai-product-lifecycle-spine",
    title: "Phase 0 — AI Product Lifecycle Spine (Shopify)",
    lifecycle: "All 7 phases",
    principle: "Early ML infrastructure investment (shared embedding pipelines, modular platforms) becomes a force multiplier for every downstream AI feature — the team that builds shared primitives ships faster than the one that rebuilds them per feature.",
  },
  {
    slug: "ai-product-lifecycle-spine",
    title: "Phase 0 — AI Product Lifecycle Spine (Shopify)",
    lifecycle: "Evaluate",
    principle: "Evaluation infrastructure is not optional overhead — it is the mechanism that determines whether you can trust an AI system enough to ship it. A judge correlating 0.61 with humans is useful; one at 0.02 is noise.",
  },
  {
    slug: "ai-product-lifecycle-spine",
    title: "Phase 0 — AI Product Lifecycle Spine (Shopify)",
    lifecycle: "Feasibility → Scale",
    principle: "The most expensive AI product mistakes are made in the early phases (Feasibility, Design) and discovered late (Scale) — by which point the fix is a re-architecture, not an edit.",
  },
];

const WARMUP_QUESTIONS = [
  {
    id: "wu1",
    text: "A fintech team can either stand up a shared feature/embedding platform now, or ship one fraud model fast on a bespoke per-feature pipeline. Applying the principle that early infrastructure decisions compound downstream, what is the real risk of the fast path, and when does that risk first become visible?",
    principle: PRIOR_ARTICLES[0].principle,
    source: PRIOR_ARTICLES[0].title,
    lifecycle: PRIOR_ARTICLES[0].lifecycle,
  },
  {
    id: "wu2",
    text: "A team's LLM-as-judge agrees with human raters only weakly, yet they want to expand to ten new use cases this quarter. Applying the principle that evaluation infrastructure determines shippability, what should they fix before scaling, and why is scaling first the more expensive order?",
    principle: PRIOR_ARTICLES[1].principle,
    source: PRIOR_ARTICLES[1].title,
    lifecycle: PRIOR_ARTICLES[1].lifecycle,
  },
  {
    id: "wu3",
    text: "Name one decision a team could make in the Feasibility phase whose cost stays invisible until the Scale phase. Apply the principle that early mistakes are discovered late.",
    principle: PRIOR_ARTICLES[2].principle,
    source: PRIOR_ARTICLES[2].title,
    lifecycle: PRIOR_ARTICLES[2].lifecycle,
  },
];

// ─── CHART DATA ───────────────────────────────────────────────────────────────

// RAND 2024: >80% of AI projects fail; ~twice the rate of comparable non-AI IT projects.
const FAILURE_RATE_DATA = [
  { cat: "AI / ML projects", rate: 80, fill: "#ef4444" },
  { cat: "Comparable non-AI IT projects", rate: 40, fill: "#6366f1" },
];

// Rule #1 rule-of-thumb: a heuristic gets you ~50% of the way to ML's "100% boost."
const HEURISTIC_ML_DATA = [
  { approach: "Heuristic / human rule", value: 50, cost: 10 },
  { approach: "Simple ML (Rule #4)",    value: 75, cost: 45 },
  { approach: "Complex ML",             value: 100, cost: 100 },
];

// Freshness decay — illustrative shape, FACT anchors from Rules #8 and #10.
const FRESHNESS_DATA = [
  { m: 0,  q: 100 },
  { m: 0.5, q: 99 },
  { m: 1,  q: 96 },
  { m: 2,  q: 92 },
  { m: 3,  q: 88 },
  { m: 4,  q: 85 },
  { m: 6,  q: 80 },
];

// Precision/recall tradeoff — illustrative structural curve (PAIR cost-of-errors).
const PR_CURVE_DATA = [
  { recall: 10, precision: 99 },
  { recall: 30, precision: 96 },
  { recall: 50, precision: 90 },
  { recall: 70, precision: 80 },
  { recall: 85, precision: 64 },
  { recall: 95, precision: 44 },
];

// Google Flu Trends vs CDC, indexed to CDC = 100. FACT anchors: peak 183 (11% vs 6%),
// 2011–12 winter 153 (>50% overshoot); ran high 100 of 108 weeks Aug 2011–Sep 2013.
const GFT_DATA = [
  { t: "Aug '11", gft: 118, cdc: 100 },
  { t: "Win '11–12", gft: 153, cdc: 100 },
  { t: "Spr '12", gft: 109, cdc: 100 },
  { t: "Aug '12", gft: 96,  cdc: 100 },
  { t: "Win '12–13", gft: 183, cdc: 100 },
  { t: "Spr '13", gft: 131, cdc: 100 },
  { t: "Sum '13", gft: 98,  cdc: 100 },
  { t: "Sep '13", gft: 126, cdc: 100 },
];

// ─── PAIR DECISION MATRIX (verbatim criteria) ─────────────────────────────────

const PAIR_USE_AI = [
  "Recommending different content to different users",
  "Prediction of future events",
  "Personalization improves the user experience",
  "Natural language understanding",
  "Recognition of an entire class of entities",
  "Detection of low-occurrence events that change over time",
  "An agent / bot experience for a particular domain",
  "Dynamic content beats a predictable interface",
];
const PAIR_AVOID_AI = [
  "Maintaining predictability (an escape hatch that must not move)",
  "Providing static or limited information",
  "Minimizing costly errors (cost of a wrong answer outweighs the upside)",
  "Complete transparency / full explainability required",
  "Optimizing for high speed and low cost to market",
  "Automating high-value tasks people don't want automated",
];

// ─── QUESTIONS ────────────────────────────────────────────────────────────────

const QUESTIONS = {
  // SECTION 3 — RQ1: When is AI the right tool?
  q1: {
    type: "T-B",
    text: "Chart 3 shows a heuristic capturing roughly half of the value that full ML delivers, at a fraction of the cost. Rule #1 frames this as \"if ML gives a 100% boost, a heuristic gets you 50% of the way there.\" What does this relationship most strongly imply for a feasibility decision?",
    options: [
      { id: "A", text: "ML is almost never worth building, since heuristics capture most of the value anyway." },
      { id: "B", text: "The heuristic's value scales linearly, so doubling heuristic complexity will match ML." },
      { id: "C", text: "AI is justified only when the incremental second-half of value is worth the data dependency and ongoing maintenance the heuristic does not carry." },
      { id: "D", text: "Because ML reaches 100%, it is the correct default and the heuristic is a waste of time." },
    ],
    correct: "C",
    authored_sowhat: "The feasibility question is an incremental-value question: a heuristic gets you to ~50% with almost no data dependency, so AI must justify itself on the marginal value of the second 50% net of the data, latency, and maintenance liabilities it introduces (Rules of ML, Rule #1).",
    distractors: {
      A: "Survivorship/over-correction: heuristics are a starting point, not a ceiling — Rule #3 says move to ML once you have data and a complex heuristic becomes unmaintainable.",
      B: "Rule #3 explicitly warns the opposite: a complex heuristic is unmaintainable, which is exactly when ML wins — heuristic value does not scale linearly with complexity.",
      D: "This ignores cost. The chart's whole point is that the 100% comes with data and maintenance costs a heuristic avoids; 'reaches 100%' is not 'worth 100%.'",
    },
    generalizes: "any build-vs-buy or simple-vs-sophisticated decision where the sophisticated option carries hidden recurring cost",
  },
  q2: {
    type: "T-D",
    text: "Open Fermi. Apply Rule #1's rule of thumb literally. Suppose a ranking heuristic lifts your target metric by 8% (relative). If ML would deliver the full benefit Rule #1 describes (the heuristic = 50% of ML's achievable lift), how much ADDITIONAL lift does ML add beyond the heuristic? State the decomposition, then enter the number.",
    unit: "percent (additional relative lift)",
    toleranceNote: "±10% — this is exact arithmetic from a stated ratio, so the band is tight.",
    correctValue: 8,
    correctValueLabel: "≈ 8 percentage points of additional relative lift (16% total − 8% heuristic)",
    tolerance: 0.1,
    decomposition: "If the heuristic captures 50% of ML's achievable lift, then ML's full lift = heuristic ÷ 0.5 = 8% ÷ 0.5 = 16%. Additional ML-only lift = 16% − 8% = 8%.",
    lowerBound: "If the heuristic actually captured 60% (better-than-rule-of-thumb), ML total ≈ 13.3%, additional ≈ 5.3%.",
    upperBound: "If the heuristic captured only 40%, ML total = 20%, additional = 12%.",
    keyAssumption: "Rule #1's 50% figure is a rule of thumb, not a measured constant — the real ratio varies by problem and is the number a feasibility audit must estimate.",
    anchor: "Rules of ML, Rule #1 (Google for Developers, updated 2025) — 'if ML gives a 100% boost, a heuristic gets you 50% of the way there.'",
    commonError: "treating the 50% rule of thumb as a precise constant rather than as the variable a data-readiness audit must actually estimate for your specific problem.",
  },
  q3: {
    type: "T-C",
    isConsulting: true,
    text: "CASE: 'LedgerLoop,' a B2B invoicing startup, wants to add AI that auto-categorizes every incoming invoice into one of six accounting buckets. Accuracy must be effectively perfect because a miscategorization flows straight into a client's tax filing. They have 1,800 labeled invoices. Using Google's feasibility criteria, what is the strongest recommendation?",
    options: [
      { id: "A", text: "Ship the ML classifier now — six classes is simple and modern models are accurate out of the box." },
      { id: "B", text: "Ship a transparent rule-based mapping first (vendor → category), measure the error rate, and only introduce ML where rules demonstrably fail — because high error cost plus thin data argues against an AI-first v1." },
      { id: "C", text: "Collect 100,000 invoices before doing anything, since ML always needs big data." },
      { id: "D", text: "Use the largest available LLM with no fallback, because capability removes the need for feasibility gates." },
    ],
    correct: "B",
    authored_sowhat: "PAIR lists 'minimizing costly errors' and 'complete transparency' as cases where AI is probably NOT better, and Rule #1 says don't use ML until you have data. With 1,800 examples and tax-filing-grade error cost, a transparent rule layer is the correct v1; ML earns its place only where rules measurably fail.",
    distractors: {
      A: "Applying capability optimism to a high-error-cost domain: 'six classes is simple' ignores that the cost of a single wrong answer (a tax error) is exactly the PAIR criterion that argues against an AI-first v1.",
      C: "Base-rate/over-correction: 'ML always needs big data' is false (Rule #21 — scale the model to the data you have); the issue is error cost and transparency, not raw volume.",
      D: "This is the exact 'can we use AI?' framing the article rejects — capability does not remove the feasibility gates of error cost and explainability.",
    },
    weakest_link: "The recommendation creates value only if a transparent vendor→category rule actually covers most invoices in practice. If categorization genuinely depends on free-text line items that rules can't capture, the rule-first plan stalls — so validate rule coverage on the 1,800 examples before committing.",
    generalizes: "any regulated, high-error-cost classification problem — credit decisions, medical coding, compliance tagging",
  },
  q4: {
    type: "T-F",
    text: "Pattern transfer. The principle from this section: feasibility is not 'can AI do this?' but 'does AI beat a transparent heuristic once error cost is priced in?' Apply it to a hospital triage tool that flags which ER patients to see first. What would a PM do differently, and what NEW failure mode appears here that did not appear in the invoicing case?",
    minLength: 50,
    requirements: [
      "Name the principle accurately (heuristic-beat + error-cost audit, not a capability question)",
      "Apply it non-trivially to ER triage (not a relabeling of invoicing)",
      "Name a failure mode specific to triage and absent from invoicing (e.g., a false-negative that delays a critically ill patient, or automation bias in clinicians)",
    ],
  },

  // SECTION 4 — RQ2: Data readiness gates
  q5: {
    type: "T-B",
    text: "Chart 4 shows model quality decaying as the data behind it goes stale, with Google Play examples annotated. Rule #10 reports a Play table left stale for six months; a single refresh then lifted install rate by 2%. What does this pattern most strongly indicate about data readiness?",
    options: [
      { id: "A", text: "Stale data is harmless because the model 'adjusts' and quality stays flat." },
      { id: "B", text: "The 2% gain proves the model was fundamentally broken and should have been rebuilt." },
      { id: "C", text: "A one-time refresh is sufficient; freshness is not an ongoing concern." },
      { id: "D", text: "Data readiness is not a launch-day checkbox but a continuous property — quality decays silently, so freshness must be monitored or the loss is invisible until a refresh accidentally reveals it." },
    ],
    correct: "D",
    authored_sowhat: "Rule #10's whole point is silent failure: the system 'adjusts and behavior continues to be reasonably good, decaying gradually,' so a stale table costs you for six months invisibly. Data readiness is therefore a continuous gate, not a one-time precondition (Rules of ML, Rules #8 and #10).",
    distractors: {
      A: "This is the exact trap Rule #10 names: the model DOES adjust, which is why the degradation is silent — 'harmless' confuses 'no alarm' with 'no loss.'",
      B: "Single-cause overreaction: a 2% recoverable loss from staleness is a maintenance gap, not evidence the model was broken — rebuilding would not address freshness.",
      C: "Rule #8 (freshness requirements) shows decay recurs — Play Search degrades in under a month — so one refresh cannot be sufficient.",
    },
    generalizes: "any feature pipeline, embedding index, or retrieval corpus whose inputs drift after launch",
  },
  q6: {
    type: "T-D",
    text: "Open Fermi. RAND found >80% of AI projects fail — call it 80% — roughly twice the rate of non-AI IT projects. Suppose a team has 10 candidate features. For the ones suited to a reliable heuristic, assume a heuristic-first approach succeeds 70% of the time. How many MORE successful launches would a heuristic-first policy expect to produce than an AI-first policy across the 10 features? State the decomposition, then enter the number.",
    unit: "additional successful launches (out of 10)",
    toleranceNote: "±10% — exact arithmetic from the two stated rates; name the decomposition before entering.",
    correctValue: 5,
    correctValueLabel: "5 more successful launches (7 vs 2)",
    tolerance: 0.1,
    decomposition: "AI-first expected successes = 10 × (1 − 0.80) = 2. Heuristic-first expected successes = 10 × 0.70 = 7. Difference = 7 − 2 = 5.",
    lowerBound: "If AI succeeded 30% (not 20%), AI-first = 3, difference = 4.",
    upperBound: "If the heuristic succeeded 80%, heuristic-first = 8, difference = 6.",
    keyAssumption: "Heuristic suitability is the load-bearing assumption — the 70% only applies to features a rule can actually serve; the policy is 'heuristic where it fits,' not 'never use AI.'",
    anchor: "RAND 2024, 'The Root Causes of Failure for AI Projects' — >80% of AI projects fail, ~2× the non-AI IT rate (qualitative study).",
    commonError: "forgetting to convert the 80% FAILURE rate into a 20% SUCCESS rate before comparing — a level-vs-complement slip.",
  },
  q7: {
    type: "T-F",
    text: "Pattern transfer. The principle from this section: an AI feature is only as feasible as its data is representative, fresh, and stable — data readiness is a precondition AND a continuous property. Apply it to a voice assistant trained to understand customer-service calls, where the training data came from typed support chats. What breaks, and what failure mode is new relative to the Google Play freshness example?",
    minLength: 50,
    requirements: [
      "Name the principle accurately (representativeness + freshness + stability, not volume alone)",
      "Apply it non-trivially to the speech/typed-text mismatch (PAIR: people don't talk the way they type)",
      "Name a failure mode new vs. the freshness case (a representativeness/distribution-mismatch failure rather than a staleness-over-time failure)",
    ],
  },

  // SECTION 5 — RQ3: Probabilistic v1 scope
  q8: {
    type: "T-B",
    text: "Chart 5 shows the precision/recall tradeoff. A fraud-review queue routes flagged transactions to a small human team; a missed fraud is far costlier than a false alarm a human can quickly clear. Reading the curve, where should v1 sit, and what does that choice reveal about scoping AI features?",
    options: [
      { id: "A", text: "Maximize precision and accept low recall — never bother the human team with false alarms." },
      { id: "B", text: "Favor recall (accept more false positives) because a human clears false alarms cheaply while a missed fraud is the expensive error — the operating point is a product decision about error costs, not a model accuracy setting." },
      { id: "C", text: "Pick the mathematical midpoint of the curve, since balance is always safest." },
      { id: "D", text: "Recall and precision are independent, so you can maximize both at once with a bigger model." },
    ],
    correct: "B",
    authored_sowhat: "PAIR: 'weighing the cost of false positives and false negatives is a critical decision.' With a cheap human clear-out and a costly miss, v1 should favor recall — and the deeper point is that choosing the operating point is the PM's scope decision, not a knob the model picks (PAIR, User Needs + Defining Success).",
    distractors: {
      A: "This optimizes the wrong error: high precision/low recall maximizes misses, which is the expensive error here — it inverts the cost structure.",
      C: "There is no context-free 'safe' midpoint; PAIR says where you sit must be driven by which error costs more, not by symmetry.",
      D: "Applying a classical assumption to AI: precision and recall trade off against each other on a fixed model — 'maximize both' misreads the curve.",
    },
    generalizes: "spam filtering, medical screening, content moderation — any system where the two error types have asymmetric cost",
  },
  q9: {
    type: "T-C",
    isConsulting: true,
    text: "CASE: 'Maple,' a consumer travel app, wants a v1 AI feature that auto-rebooks cancelled flights without asking. The model is right ~88% of the time. Leadership wants to ship the autonomous version for the 'wow' demo. Using Google's probabilistic-scope guidance, what is the strongest v1 recommendation?",
    options: [
      { id: "A", text: "Ship autonomous rebooking — 88% is high enough, and the demo value justifies it." },
      { id: "B", text: "Cancel the feature; 88% is too low for travel and AI is the wrong tool entirely." },
      { id: "C", text: "Spend six months getting to 99% before shipping anything." },
      { id: "D", text: "Ship v1 as augmentation — propose the rebooking and let the user confirm — and define a reward function and a monitored threshold (e.g., if override rate exceeds X%, intervene) before expanding to automation." },
    ],
    correct: "D",
    authored_sowhat: "PAIR's automation-vs-augmentation guidance says augment when stakes are high and people want control, and its success-metric template is 'if {metric} crosses {threshold} we will {act}.' A probabilistic 88% feature with real money and travel disruption should ship as a confirm-first augmentation with a monitored override threshold — not as an autonomous action.",
    distractors: {
      A: "Treats a probabilistic output as if it were deterministic: 88% correct means 12% wrong on high-stakes bookings, exactly when PAIR says to augment, not automate.",
      B: "Over-correction: the feature is feasible as augmentation; 'AI is the wrong tool entirely' confuses the wrong scope (full automation) with the wrong tool.",
      C: "Chasing a precision target with no shipping loop ignores PAIR's guidance to define thresholds and learn in production; perfect-before-launch is rarely the right v1.",
    },
    weakest_link: "The plan creates value only if users actually engage with the confirm step rather than reflexively accepting (automation bias). If one-tap confirmation becomes rubber-stamping, augmentation collapses into de-facto automation — so the monitored override/inspection rate is the assumption to watch.",
    generalizes: "any v1 where a probabilistic action has irreversible or costly consequences — payments, deletions, medical or legal drafting",
  },
  q10: {
    type: "T-F",
    text: "Pattern transfer. The principle from this section: specify a v1 AI feature as a reward function plus an error-cost (precision/recall) operating point with monitored thresholds — not as a deterministic spec. Apply it to an AI code-review bot that comments on pull requests. What would the v1 spec contain, and what failure mode is new relative to the travel-rebooking case?",
    minLength: 50,
    requirements: [
      "Name the principle accurately (reward function + operating point + monitored threshold, not a deterministic feature spec)",
      "Apply it non-trivially to code review (e.g., tune toward precision so developers aren't flooded with false-positive comments)",
      "Name a failure mode new vs. travel rebooking (e.g., alert fatigue / developers muting the bot, rather than a costly irreversible action)",
    ],
  },

  // SECTION 6 — What Broke: Google Flu Trends
  q11: {
    type: "T-B",
    text: "Chart 6 shows Google Flu Trends (GFT) running above the CDC for almost the entire 2011–2013 window. GFT had earlier tracked the CDC closely for years. What is the STRONGEST reason NOT to conclude that GFT 'measures flu'?",
    options: [
      { id: "A", text: "GFT was largely fitting seasonal search behavior correlated with winter (it was 'part flu detector, part winter detector'); correlation with CDC curves is not evidence it captured a causal flu signal." },
      { id: "B", text: "GFT used more data than the CDC, so it must have been more accurate." },
      { id: "C", text: "The CDC itself is occasionally revised, so neither series means anything." },
      { id: "D", text: "Because GFT and CDC both rose in winter, GFT clearly caused the CDC numbers." },
    ],
    correct: "A",
    authored_sowhat: "Lazer et al. (2014) showed GFT keyed on seasonal terms that co-occur with winter but are not caused by flu — close correlation with the CDC across seasons is consistent with a 'winter detector,' so matching curves cannot establish a causal flu signal. This is the correlation-vs-causation trap.",
    distractors: {
      B: "'More data = more accurate' is the big-data hubris Lazer explicitly criticized; volume did not fix the missing causal signal.",
      C: "CDC revisions are minor and don't bear on whether GFT's correlation is causal — this dodges the question.",
      D: "This literally asserts causation from co-movement (and the wrong direction) — the canonical correlation/causation error.",
    },
    generalizes: "any model validated only by curve-matching — demand forecasts, engagement predictors, anomaly detectors keyed on proxies",
  },
  q12: {
    type: "T-B",
    text: "Failure-case question. Google Flu Trends failed despite Google's elite ML talent. Which design assumption — held by the team and considered uncontroversial at launch — was the root cause of the multi-year overestimation?",
    options: [
      { id: "A", text: "The team used the wrong programming language for the pipeline." },
      { id: "B", text: "One specific search term was mislabeled, and fixing it would have solved everything." },
      { id: "C", text: "That the relationship between search queries and flu was stable over time — so a model fit on 2003–2008 data and rarely refit would keep working, even as Google's own search features (autocomplete, suggestions) and user behavior shifted the input distribution." },
      { id: "D", text: "That the CDC would stop publishing data, so GFT had to replace it." },
    ],
    correct: "C",
    authored_sowhat: "The uncontroversial-but-wrong assumption was stationarity: that the query→flu mapping would hold. It didn't — Google's own product changes and drifting search behavior altered the inputs while the model stayed essentially static, so it ran high 100 of 108 weeks. This is the data-stability feasibility gate, skipped.",
    distractors: {
      A: "Hindsight/irrelevant-cause: language choice had nothing to do with a distribution-drift failure.",
      B: "Single-cause fallacy: GFT's failure was systemic drift across many terms, not one mislabeled feature — no single fix addressed it.",
      D: "Fabricated motive: GFT was meant to complement, not replace, CDC reporting; this misstates the design intent.",
    },
    generalizes: "every model deployed against a non-stationary world — fraud, recommendations, pricing — where the data-generating process can shift under you",
  },
  q13: {
    type: "T-D",
    text: "At the 2012–13 peak, GFT estimated about 11% of the U.S. had influenza-like illness while the CDC measured about 6%. By what FACTOR did GFT overestimate at the peak? Enter the multiple (e.g., 1.5).",
    unit: "× (multiple of CDC)",
    toleranceNote: "±10% — direct arithmetic from two cited FACTs.",
    correctValue: 1.83,
    correctValueLabel: "≈ 1.83× (11 ÷ 6), i.e. 'nearly double'",
    tolerance: 0.1,
    decomposition: "Overestimate factor = GFT ÷ CDC = 11% ÷ 6% ≈ 1.83×. Lazer et al. describe this as GFT predicting 'more than double' the CDC's share at the peak of the 2012–13 season.",
    lowerBound: "Using 10% vs 6% → 1.67×.",
    upperBound: "Using 11% vs 5.5% → 2.0×.",
    keyAssumption: "Both figures are the % of doctor visits for influenza-like illness (ILI), not the % of the population infected — comparing like units is the whole point.",
    anchor: "Lazer, Kennedy, King & Vespignani (2014), 'The Parable of Google Flu,' Science — GFT ~11% vs CDC ~6% at the 2012–13 peak.",
    commonError: "subtracting (11 − 6 = 5 'points') instead of dividing — a percentage-points-vs-multiple confusion. The question asks for a factor.",
  },

  // CONCLUSION — T-E (present + 2027) and final T-F
  q14: {
    type: "T-E",
    textPresent: "Present-day (2026). You lead product for a startup whose investors want 'an AI feature' in the flagship app within two quarters. Applying Google's feasibility discipline, what is the single most important thing to do in the next six months?",
    optionsPresent: [
      { id: "A", text: "Pick the most impressive model and build the most autonomous demo possible to satisfy investors." },
      { id: "B", text: "Run a data-readiness and error-cost audit on the top candidate use cases, ship the strongest as a transparent heuristic or augmentation v1 with monitored thresholds, and reserve full ML for where the audit shows it clears the bar." },
      { id: "C", text: "Announce the AI feature now and figure out feasibility after launch." },
      { id: "D", text: "Refuse to build any AI feature until the model is provably perfect." },
    ],
    correctPresent: "B",
    text2027: "2027 variant. Foundation models now offer much longer context, cheaper inference, and strong few-shot performance, so a capable v1 can be stood up with little task-specific data. Given the SAME business constraints, what changes — and which load-bearing assumption does the 2027 version replace?",
    options2027: [
      { id: "A", text: "Nothing changes; feasibility is irrelevant once models are good enough." },
      { id: "B", text: "Skip evaluation entirely — better base models make data readiness and error-cost analysis obsolete." },
      { id: "C", text: "The 'we lack data to even start' barrier falls, so the binding gate shifts from data volume to error-cost calibration, distribution stability, and monitoring — you can now START with AI, but the cost-of-wrong-answers and drift gates matter MORE, not less." },
      { id: "D", text: "Switch every feature to fully autonomous agents, since cheaper inference removes the need for human-in-the-loop." },
    ],
    correct2027: "C",
    authored_sowhat: "Feasibility doesn't disappear as models improve — it moves. Cheap, capable models dissolve the cold-start data barrier (Rule #1's 'don't use it until you have data' weakens), but error cost, distribution drift (the Flu Trends gate), and monitored thresholds become the binding constraints. The discipline shifts from 'can we start?' to 'where will a confident wrong answer hurt us, and how will we know?'",
    hint: "Ask which specific barrier better models remove (cold-start data) and which they leave untouched or worsen (a confidently wrong answer in a high-stakes, drifting setting).",
    falsification: "What would falsify the governing principle? If foundation models became so reliable and self-correcting that a transparent heuristic never beat them on value-per-cost AND error cost ceased to vary across use cases, then 'audit feasibility before building AI' would lose its force. Neither condition holds in 2026: heuristics still win on many low-stakes/low-data problems, and error costs remain wildly asymmetric across domains.",
  },
  q15: {
    type: "T-F",
    text: "Final pattern transfer. The governing principle: the right question is never 'can we use AI?' but 'what would have to be true about our data, our error costs, and the stability of the world for AI to beat a simple heuristic?' Apply it to a domain NOT covered in this article — an AI feature that sets dynamic prices for a ride-hailing marketplace in real time. What would a PM check at the Feasibility phase, and what failure mode would appear that did not appear in Google's search/health examples?",
    minLength: 50,
    requirements: [
      "Name the governing principle accurately (data + error-cost + world-stability audit vs. a capability question)",
      "Describe a non-trivial Feasibility-phase check for real-time dynamic pricing (e.g., feedback loops where the price itself changes future demand data)",
      "Name a failure mode absent from the search/health cases (e.g., a self-reinforcing pricing feedback loop, or fairness/surge-backlash, rather than static-model drift)",
    ],
  },
};

// Ensure every question object carries its own id (keys are the ids).
// Components read qData.id and handlers look up QUESTIONS[qId]; without this,
// qData.id is undefined and numeric/MC submit handlers throw or misfire.
Object.keys(QUESTIONS).forEach(k => { QUESTIONS[k].id = k; });

// ─── UTILITY COMPONENTS ───────────────────────────────────────────────────────

function LifecycleStrip({ activePhases }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
      {LIFECYCLE_PHASES.map(p => {
        const on = activePhases.includes(p.name);
        return (
          <span key={p.id} style={{
            padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600,
            background: on ? p.color : "#e5e7eb", color: on ? "#fff" : "#9ca3af",
          }}>{p.short}</span>
        );
      })}
    </div>
  );
}

function ProgressBar({ pct }) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 4, background: "#e5e7eb", zIndex: 1000 }}>
      <div style={{ height: "100%", width: `${pct}%`, background: "#6366f1", transition: "width 0.4s" }} />
    </div>
  );
}

function SectionLock({ label }) {
  return (
    <div style={{ padding: "32px 24px", textAlign: "center", border: "1px solid #e5e7eb", borderRadius: 8, background: "#f9fafb", color: "#9ca3af" }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>🔒</div>
      <div style={{ fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 14, marginTop: 4 }}>Complete all questions and the principle gate above to unlock.</div>
    </div>
  );
}

function Citation({ source, year, tier }) {
  const tierColors = { FACT: "#d1fae5", ESTIMATE: "#fef3c7", ILLUSTRATION: "#f3f4f6" };
  const tierText = { FACT: "#065f46", ESTIMATE: "#92400e", ILLUSTRATION: "#374151" };
  return (
    <span style={{
      display: "inline-block", padding: "1px 6px", borderRadius: 4, fontSize: 11,
      background: tierColors[tier] || "#f3f4f6", color: tierText[tier] || "#374151",
      marginLeft: 4, verticalAlign: "middle", fontWeight: 500,
    }}>
      ({source}, {year} — {tier})
    </span>
  );
}

// ─── CHART CARD ────────────────────────────────────────────────────────────────

function ChartCard({ chartId, title, soWhat, children, revealed, onReveal, readerSoWhat, onSoWhatChange, provenance }) {
  const [localSoWhat, setLocalSoWhat] = useState(readerSoWhat || "");
  const canReveal = localSoWhat.trim().length >= 15;
  return (
    <div style={{ margin: "24px 0", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
        {provenance && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{provenance}</div>}
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ position: "relative" }}>
          {children}
          {!revealed && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.10)", pointerEvents: "none" }} />
          )}
        </div>
        {!revealed && (
          <div style={{ marginTop: 12, padding: 12, background: "#f0f9ff", borderRadius: 6 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Before values reveal — write your so what (min 15 chars):</div>
            <div style={{ fontSize: 12, color: "#6366f1", marginBottom: 6 }}>In one sentence, what does this pattern imply for a PM or CTO decision?</div>
            <textarea value={localSoWhat}
              onChange={e => { setLocalSoWhat(e.target.value); onSoWhatChange && onSoWhatChange(e.target.value); }}
              rows={2}
              style={{ width: "100%", boxSizing: "border-box", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, resize: "vertical" }}
              placeholder="e.g. 'A heuristic should be the v1 unless error cost makes the extra accuracy worth the data liability...'" />
            <div style={{ fontSize: 11, color: "#9ca3af" }}>{localSoWhat.length}/15 characters minimum</div>
            <button onClick={() => onReveal(chartId, localSoWhat)} disabled={!canReveal}
              style={{ marginTop: 8, padding: "6px 16px", background: canReveal ? "#6366f1" : "#d1d5db", color: "#fff", border: "none", borderRadius: 4, cursor: canReveal ? "pointer" : "not-allowed", fontSize: 13 }}>
              Reveal values
            </button>
          </div>
        )}
        {revealed && (
          <div style={{ marginTop: 12, padding: 12, background: "#f0fdf4", borderRadius: 6, borderLeft: "3px solid #4ade80" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#166534" }}>Your so what:</div>
            <div style={{ fontSize: 13, color: "#166534", marginBottom: 8 }}>{readerSoWhat || "(not entered)"}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#1e40af" }}>Authored so what:</div>
            <div style={{ fontSize: 13, color: "#1e40af" }}>{soWhat}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── QUESTION COMPONENTS ───────────────────────────────────────────────────────

function ConfidenceSelector({ selected, onSelect }) {
  const levels = ["Low", "Medium", "High"];
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Your confidence:</span>
      {levels.map(l => (
        <button key={l} onClick={() => onSelect(l)}
          style={{ padding: "4px 12px", borderRadius: 4, border: "1px solid",
            borderColor: selected === l ? "#6366f1" : "#d1d5db",
            background: selected === l ? "#6366f1" : "#fff",
            color: selected === l ? "#fff" : "#374151",
            fontSize: 13, cursor: "pointer", fontWeight: selected === l ? 600 : 400 }}>{l}</button>
      ))}
    </div>
  );
}

function MCQuestion({ qData, state, onAnswer, onConfidence, onRetry }) {
  const { id, text, options, correct, authored_sowhat, distractors, hint, generalizes, isConsulting, weakest_link } = qData;
  const { selectedOption, isCorrect, submitted, attemptCount, scaffoldingShown } = state || {};
  const confidence = state?.confidence;
  const borderColor = isConsulting ? "#d97706" : "#e5e7eb";
  const bg = isConsulting ? "#fffbeb" : "#fff";

  return (
    <div style={{ margin: "20px 0", padding: 16, border: `1px solid ${borderColor}`, borderRadius: 8, background: bg, borderLeft: isConsulting ? "4px solid #d97706" : undefined }}>
      {isConsulting && <div style={{ fontSize: 11, fontWeight: 700, color: "#d97706", marginBottom: 6, letterSpacing: 1 }}>CASE PROMPT — {qData.type}</div>}
      {!isConsulting && <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", marginBottom: 6, letterSpacing: 1 }}>{qData.type}</div>}
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, lineHeight: 1.6 }}>{text}</div>

      {!submitted && (
        <>
          {options.map(opt => (
            <div key={opt.id} onClick={() => !submitted && onAnswer(id, opt.id, false)}
              style={{ padding: "10px 14px", margin: "6px 0", border: "1px solid",
                borderColor: selectedOption === opt.id ? "#6366f1" : "#e5e7eb",
                borderRadius: 6, cursor: "pointer",
                background: selectedOption === opt.id ? "#eef2ff" : "#fff",
                fontSize: 14, lineHeight: 1.5 }}>
              <strong>{opt.id}.</strong> {opt.text}
            </div>
          ))}
          {scaffoldingShown && (
            <div style={{ margin: "12px 0", padding: 12, background: "#fef3c7", borderRadius: 6, borderLeft: "3px solid #f59e0b" }}>
              <div style={{ fontWeight: 600, marginBottom: 4, color: "#92400e" }}>Scaffolding (second attempt):</div>
              <div style={{ fontSize: 13, color: "#92400e" }}>{hint || "Re-read the section's principle, then eliminate the option that confuses correlation with cause, or capability with feasibility."}</div>
            </div>
          )}
          <button onClick={() => onAnswer(id, selectedOption, true)} disabled={!selectedOption}
            style={{ marginTop: 8, padding: "8px 20px", background: selectedOption ? "#6366f1" : "#d1d5db", color: "#fff", border: "none", borderRadius: 4, cursor: selectedOption ? "pointer" : "not-allowed", fontSize: 14 }}>Submit</button>
          {!selectedOption && <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 8 }}>Select an option to enable Submit</span>}
        </>
      )}

      {submitted && (
        <div>
          {options.map(opt => (
            <div key={opt.id} style={{ padding: "10px 14px", margin: "6px 0", border: "1px solid",
              borderColor: opt.id === correct ? "#4ade80" : (opt.id === selectedOption && !isCorrect ? "#f87171" : "#e5e7eb"),
              borderRadius: 6,
              background: opt.id === correct ? "#f0fdf4" : (opt.id === selectedOption && !isCorrect ? "#fef2f2" : "#fff"),
              fontSize: 14, lineHeight: 1.5 }}>
              <strong>{opt.id}.</strong> {opt.text}
              {opt.id === correct && <span style={{ marginLeft: 8, color: "#166534", fontWeight: 700 }}>✓ Correct</span>}
              {opt.id === selectedOption && !isCorrect && <span style={{ marginLeft: 8, color: "#b91c1c", fontWeight: 700 }}>✗ Your answer</span>}
            </div>
          ))}
          <div style={{ marginTop: 12, padding: 12, background: "#f8fafc", borderRadius: 6 }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Explanation:</div>
            <div style={{ fontSize: 13, marginBottom: 8, lineHeight: 1.6 }}>{authored_sowhat}</div>
            {!isCorrect && selectedOption && distractors && distractors[selectedOption] && (
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 600, color: "#b91c1c" }}>Why option {selectedOption} was wrong: </span>
                <span style={{ fontSize: 13, color: "#b91c1c" }}>{distractors[selectedOption]}</span>
              </div>
            )}
            {isConsulting && weakest_link && (
              <div style={{ padding: 8, background: "#fffbeb", borderRadius: 4, borderLeft: "3px solid #d97706", marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: "#92400e" }}>Load-bearing assumption (weakest link):</div>
                <div style={{ fontSize: 13, color: "#92400e" }}>{weakest_link}</div>
              </div>
            )}
            <div style={{ padding: 8, background: "#f0f9ff", borderRadius: 4, fontSize: 12 }}>
              <strong>Calibration:</strong> {isCorrect ? "correct" : "incorrect"} —{" "}
              {isCorrect
                ? `this reasoning pattern generalizes to ${generalizes}.`
                : (distractors && selectedOption && distractors[selectedOption] ? distractors[selectedOption] : "review the named reasoning error above.")}
            </div>
            {!isCorrect && attemptCount < 2 && (
              <button onClick={() => onRetry(id)} style={{ marginTop: 8, padding: "6px 14px", background: "#f97316", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>
                Try again
              </button>
            )}
            {generalizes && isCorrect && (
              <div style={{ marginTop: 8, fontSize: 12, color: "#6366f1" }}>
                <strong>Where this generalizes:</strong> {generalizes}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NumericQuestion({ qData, state, onSubmitNumeric, onConfidence }) {
  const [val, setVal] = useState("");
  const { submitted, isCorrect } = state || {};
  const confidence = state?.confidence;
  return (
    <div style={{ margin: "20px 0", padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", marginBottom: 6, letterSpacing: 1 }}>{qData.type} — FERMI ESTIMATION</div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, lineHeight: 1.6 }}>{qData.text}</div>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12, padding: "6px 10px", background: "#f9fafb", borderRadius: 4 }}>
        Tolerance: {qData.toleranceNote} | Unit: {qData.unit}
      </div>
      {!submitted && (
        <>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <input type="number" value={val} onChange={e => setVal(e.target.value)}
              style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, width: 200 }}
              placeholder={`Enter in ${qData.unit}`} />
            <button onClick={() => onSubmitNumeric(qData.id, parseFloat(val))} disabled={!val}
              style={{ padding: "8px 16px", background: val ? "#6366f1" : "#d1d5db", color: "#fff", border: "none", borderRadius: 4, cursor: val ? "pointer" : "not-allowed", fontSize: 13 }}>
              Submit
            </button>
            {!val && <span style={{ fontSize: 12, color: "#9ca3af" }}>Enter a value to enable Submit</span>}
          </div>
        </>
      )}
      {submitted && (
        <div style={{ marginTop: 8 }}>
          <div style={{ padding: 12, background: isCorrect ? "#f0fdf4" : "#fef3c7", borderRadius: 6, marginBottom: 12 }}>
            <div style={{ fontWeight: 700 }}>Your estimate: {state?.userValue?.toLocaleString()} {qData.unit}</div>
            <div style={{ fontWeight: 700 }}>Target: {qData.correctValue.toLocaleString()} {qData.unit} ({qData.correctValueLabel})</div>
            <div style={{ fontWeight: 700, color: isCorrect ? "#166534" : "#92400e" }}>
              {isCorrect ? "Within tolerance — full credit" : "Outside tolerance — review the decomposition below"}
            </div>
          </div>
          <div style={{ padding: 12, background: "#f8fafc", borderRadius: 6, fontSize: 13 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Decomposition path:</div>
            <div style={{ marginBottom: 8, lineHeight: 1.7 }}>{qData.decomposition}</div>
            <div style={{ marginBottom: 4 }}>Lower bound: {qData.lowerBound}</div>
            <div style={{ marginBottom: 4 }}>Upper bound: {qData.upperBound}</div>
            <div style={{ marginBottom: 8, fontStyle: "italic" }}>Key assumption: {qData.keyAssumption}</div>
            <div style={{ padding: "6px 10px", background: "#f0f9ff", borderRadius: 4 }}>
              <strong>Source anchor:</strong> {qData.anchor}
            </div>
            <div style={{ marginTop: 8, padding: "6px 10px", background: "#f0f9ff", borderRadius: 4 }}>
              <strong>Calibration:</strong> {isCorrect ? "correct" : "outside tolerance"}.
              {!isCorrect && qData.commonError && ` Most common error: ${qData.commonError}`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FreeTextQuestion({ qData, state, onSubmitFreeText, onConfidence }) {
  const [val, setVal] = useState("");
  const { submitted } = state || {};
  const confidence = state?.confidence;
  const [selfEval, setSelfEval] = useState({ p1: false, p2: false, p3: false });
  const canSubmit = val.trim().length >= qData.minLength;
  return (
    <div style={{ margin: "20px 0", padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", marginBottom: 6, letterSpacing: 1 }}>{qData.type} — PATTERN TRANSFER</div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, lineHeight: 1.6 }}>{qData.text}</div>
      <div style={{ padding: "8px 12px", background: "#f3f4f6", borderRadius: 4, fontSize: 13, marginBottom: 12 }}>
        <strong>Your answer must include all three:</strong>
        {qData.requirements.map((r, i) => <div key={i} style={{ marginTop: 4 }}>({i+1}) {r}</div>)}
      </div>
      {!submitted && (
        <>
          <textarea value={val} onChange={e => setVal(e.target.value)} rows={5}
            style={{ width: "100%", boxSizing: "border-box", padding: 10, border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, resize: "vertical" }}
            placeholder={`Minimum ${qData.minLength} characters. Apply the principle to the new context...`} />
          <div style={{ fontSize: 12, color: "#9ca3af" }}>{val.length}/{qData.minLength} minimum</div>
          <button onClick={() => onSubmitFreeText(qData.id, val)} disabled={!canSubmit}
            style={{ marginTop: 8, padding: "8px 20px", background: canSubmit ? "#7c3aed" : "#d1d5db", color: "#fff", border: "none", borderRadius: 4, cursor: canSubmit ? "pointer" : "not-allowed", fontSize: 14 }}>
            Submit
          </button>
        </>
      )}
      {submitted && (
        <div>
          <div style={{ padding: 12, background: "#faf5ff", borderRadius: 6, marginBottom: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Your response:</div>
            <div style={{ fontSize: 13, lineHeight: 1.7 }}>{state.userValue}</div>
          </div>
          <div style={{ padding: 12, background: "#f8fafc", borderRadius: 6 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Self-evaluation checklist (mark what you included):</div>
            {qData.requirements.map((r, i) => {
              const key = `p${i+1}`;
              return (
                <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={selfEval[key]} onChange={() => setSelfEval(s => ({ ...s, [key]: !s[key] }))} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 13 }}>{r}</span>
                </label>
              );
            })}
            {!selfEval.p1 && <div style={{ fontSize: 12, color: "#ef4444" }}>↑ Make sure you explicitly named the principle in your response.</div>}
            {!selfEval.p2 && <div style={{ fontSize: 12, color: "#ef4444" }}>↑ Make sure your application is a genuinely new context, not a relabeling of Google's case.</div>}
            {!selfEval.p3 && <div style={{ fontSize: 12, color: "#ef4444" }}>↑ Make sure the failure mode you named does not already appear in Google's example.</div>}
            {selfEval.p1 && selfEval.p2 && selfEval.p3 && (
              <div style={{ padding: 8, background: "#f0fdf4", borderRadius: 4, color: "#166534", fontWeight: 600, fontSize: 13 }}>
                All three elements present — strong pattern transfer.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ForwardLookingQuestion({ qData, state, onAnswer, onConfidence, onRetry }) {
  const [activeVariant, setActiveVariant] = useState("present");
  const statePresent = state?.present || {};
  const state2027 = state?.["2027"] || {};
  const handleAnswer = (variant, optId, submit) => onAnswer(qData.id, variant, optId, submit);

  const renderOptions = (options, correct, currentState, variant) => {
    const { selectedOption, isCorrect, submitted, attemptCount, scaffoldingShown } = currentState;
    const confidence = currentState?.confidence || state?.confidence;
    return (
      <div>
        {!submitted && (
          <>
            {options.map(opt => (
              <div key={opt.id} onClick={() => !submitted && handleAnswer(variant, opt.id, false)}
                style={{ padding: "10px 14px", margin: "6px 0", border: "1px solid",
                  borderColor: selectedOption === opt.id ? "#6366f1" : "#e5e7eb",
                  borderRadius: 6, cursor: "pointer",
                  background: selectedOption === opt.id ? "#eef2ff" : "#fff",
                  fontSize: 14, lineHeight: 1.5 }}>
                <strong>{opt.id}.</strong> {opt.text}
              </div>
            ))}
            {scaffoldingShown && (
              <div style={{ margin: "12px 0", padding: 12, background: "#fef3c7", borderRadius: 6, borderLeft: "3px solid #f59e0b" }}>
                <div style={{ fontWeight: 600, color: "#92400e" }}>Scaffolding hint:</div>
                <div style={{ fontSize: 13, color: "#92400e" }}>{qData.hint}</div>
              </div>
            )}
            <button onClick={() => handleAnswer(variant, selectedOption, true)} disabled={!selectedOption}
              style={{ marginTop: 8, padding: "8px 20px", background: selectedOption ? "#6366f1" : "#d1d5db", color: "#fff", border: "none", borderRadius: 4, cursor: selectedOption ? "pointer" : "not-allowed", fontSize: 14 }}>
              Submit {variant === "present" ? "present-day" : "2027"} answer
            </button>
            {!selectedOption && <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 8 }}>Select an option to enable Submit</span>}
          </>
        )}
        {submitted && (
          <div>
            {options.map(opt => (
              <div key={opt.id} style={{ padding: "10px 14px", margin: "6px 0", border: "1px solid",
                borderColor: opt.id === correct ? "#4ade80" : (opt.id === selectedOption && !isCorrect ? "#f87171" : "#e5e7eb"),
                borderRadius: 6,
                background: opt.id === correct ? "#f0fdf4" : (opt.id === selectedOption && !isCorrect ? "#fef2f2" : "#fff"),
                fontSize: 14, lineHeight: 1.5 }}>
                <strong>{opt.id}.</strong> {opt.text}
                {opt.id === correct && <span style={{ marginLeft: 8, color: "#166534", fontWeight: 700 }}>✓ Correct</span>}
                {opt.id === selectedOption && !isCorrect && <span style={{ marginLeft: 8, color: "#b91c1c", fontWeight: 700 }}>✗ Your answer</span>}
              </div>
            ))}
            <div style={{ marginTop: 8, padding: 10, background: "#f0f9ff", borderRadius: 4, fontSize: 13 }}>{qData.authored_sowhat}</div>
            {variant === "2027" && qData.falsification && (
              <div style={{ marginTop: 8, padding: 10, background: "#fff7ed", borderRadius: 4, fontSize: 12, borderLeft: "3px solid #f97316" }}>
                <strong>Falsification clause:</strong> {qData.falsification}
              </div>
            )}
            {!isCorrect && attemptCount < 2 && (
              <button onClick={() => onRetry(`${qData.id}-${variant}`)} style={{ marginTop: 8, padding: "6px 14px", background: "#f97316", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>
                Try again
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ margin: "20px 0", padding: 16, border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", marginBottom: 6, letterSpacing: 1 }}>T-E — FORWARD-LOOKING IMPLICATION</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {["present", "2027"].map(v => (
          <button key={v} onClick={() => setActiveVariant(v)}
            style={{ padding: "6px 14px", borderRadius: 4, border: "1px solid",
              borderColor: activeVariant === v ? "#6366f1" : "#d1d5db",
              background: activeVariant === v ? "#6366f1" : "#fff",
              color: activeVariant === v ? "#fff" : "#374151",
              cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
            {v === "present" ? "Present-day (2026)" : "2027 variant"}
          </button>
        ))}
      </div>
      {activeVariant === "present" && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, lineHeight: 1.6 }}>{qData.textPresent}</div>
          {renderOptions(qData.optionsPresent, qData.correctPresent, statePresent, "present")}
        </div>
      )}
      {activeVariant === "2027" && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, lineHeight: 1.6 }}>{qData.text2027}</div>
          {renderOptions(qData.options2027, qData.correct2027, state2027, "2027")}
        </div>
      )}
    </div>
  );
}

function PrincipleGate({ sectionId, state, onSubmit, authoredPrinciple }) {
  const [val, setVal] = useState(state?.value || "");
  const canSubmit = val.trim().length >= 20;
  const submitted = state?.submitted;
  return (
    <div style={{ margin: "24px 0", padding: 16, background: "#faf5ff", border: "2px solid #7c3aed", borderRadius: 8 }}>
      <div style={{ fontWeight: 700, color: "#7c3aed", marginBottom: 8 }}>Section Gate — Principle in one sentence</div>
      <div style={{ fontSize: 13, color: "#374151", marginBottom: 8 }}>
        State the transferable principle from this section — something a PM or CTO at a different company could apply tomorrow. (Min 20 chars. Not scored — production matters.)
      </div>
      {!submitted && (
        <>
          <textarea value={val} onChange={e => setVal(e.target.value)} rows={2}
            style={{ width: "100%", boxSizing: "border-box", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, resize: "vertical" }} />
          <div style={{ fontSize: 11, color: "#9ca3af" }}>{val.length}/20 characters minimum</div>
          <button onClick={() => onSubmit(sectionId, val)} disabled={!canSubmit}
            style={{ marginTop: 8, padding: "8px 20px", background: canSubmit ? "#7c3aed" : "#d1d5db", color: "#fff", border: "none", borderRadius: 4, cursor: canSubmit ? "pointer" : "not-allowed" }}>
            Lock in principle
          </button>
        </>
      )}
      {submitted && (
        <div>
          <div style={{ padding: 10, background: "#fff", borderRadius: 4, marginBottom: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 12, color: "#7c3aed" }}>Your principle:</div>
            <div style={{ fontSize: 13 }}>{state.value}</div>
          </div>
          <div style={{ padding: 10, background: "#f0fdf4", borderRadius: 4 }}>
            <div style={{ fontWeight: 600, fontSize: 12, color: "#166534" }}>Authored principle:</div>
            <div style={{ fontSize: 13, color: "#166534" }}>{authoredPrinciple}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── WARM-UP SCREEN (cross-artifact retrieval) ─────────────────────────────────

function WarmUpScreen({ onComplete, onSkip }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});

  const submit = (qid) => setSubmitted(s => ({ ...s, [qid]: true }));
  const allDone = WARMUP_QUESTIONS.every(q => submitted[q.id]);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 16px" }}>
      <div style={{ padding: 20, background: "#f3f4f6", borderRadius: 10, marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Before you begin — recall from your prior reading</div>
        <div style={{ fontSize: 14, color: "#6b7280" }}>
          Spaced retrieval. Answer from memory before today's case. These test principles from the <strong>Phase 0 Lifecycle Spine</strong> in new contexts — there is no score, and you can skip. Skipping is noted in your learning summary.
        </div>
      </div>

      {WARMUP_QUESTIONS.map((q, i) => (
        <div key={q.id} style={{ margin: "16px 0", padding: 16, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: 1, marginBottom: 6 }}>WARM-UP {i + 1}</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, lineHeight: 1.6 }}>{q.text}</div>
          {!submitted[q.id] ? (
            <>
              <textarea value={answers[q.id] || ""} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                rows={3} style={{ width: "100%", boxSizing: "border-box", padding: 10, border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, resize: "vertical" }}
                placeholder="From memory (min 25 chars)..." />
              <div style={{ fontSize: 11, color: "#9ca3af" }}>{(answers[q.id] || "").length}/25 minimum</div>
              <button onClick={() => submit(q.id)} disabled={(answers[q.id] || "").trim().length < 25}
                style={{ marginTop: 8, padding: "6px 16px", background: (answers[q.id] || "").trim().length >= 25 ? "#6366f1" : "#d1d5db", color: "#fff", border: "none", borderRadius: 4, cursor: (answers[q.id] || "").trim().length >= 25 ? "pointer" : "not-allowed", fontSize: 13 }}>
                Reveal the principle
              </button>
            </>
          ) : (
            <div>
              <div style={{ padding: 10, background: "#eef2ff", borderRadius: 4, marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 12 }}>Your recall:</div>
                <div style={{ fontSize: 13 }}>{answers[q.id]}</div>
              </div>
              <div style={{ padding: 10, background: "#f0fdf4", borderRadius: 4 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: "#166534" }}>Principle being tested:</div>
                <div style={{ fontSize: 13, color: "#166534", marginBottom: 6 }}>{q.principle}</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>Source: {q.source} · Lifecycle: {q.lifecycle}</div>
              </div>
            </div>
          )}
        </div>
      ))}

      <div style={{ display: "flex", gap: 12, marginTop: 20, alignItems: "center" }}>
        <button onClick={onComplete} disabled={!allDone}
          style={{ padding: "12px 28px", background: allDone ? "#6366f1" : "#d1d5db", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: allDone ? "pointer" : "not-allowed" }}>
          Begin today's article →
        </button>
        <button onClick={onSkip}
          style={{ padding: "10px 18px", background: "transparent", color: "#6b7280", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, cursor: "pointer" }}>
          Skip warm-up
        </button>
      </div>
    </div>
  );
}

// ─── LEARNING SUMMARY ──────────────────────────────────────────────────────────

const AUTHORED_PRINCIPLES = {
  3: "Feasibility is not 'can AI do this?' but 'does AI beat a transparent heuristic once the cost of a wrong answer is priced in?' Start with the simplest thing that could work and make AI earn the incremental value.",
  4: "An AI feature is only as feasible as its data is representative, fresh, and stable — data readiness is both a precondition and a continuous property, and degradation is usually silent.",
  5: "Specify a v1 AI feature as a reward function and an error-cost operating point (precision vs recall) with monitored thresholds — not as a deterministic feature spec.",
};

function LearningSummary({ questionState, principleGates, score, totalQ, warmUpSkipped, onContinue }) {
  const [insightVal, setInsightVal] = useState("");
  const [insightSubmitted, setInsightSubmitted] = useState(false);
  const [applyPresent, setApplyPresent] = useState("");
  const [apply2027, setApply2027] = useState("");
  const [applySubmitted, setApplySubmitted] = useState(false);
  const canContinue = applySubmitted;

  // calibration scan
  const calib = [];
  Object.entries(questionState).forEach(([qid, st]) => {
    if (st?.submitted && typeof st.isCorrect === "boolean") {
      if (st.confidence === "High" && !st.isCorrect) calib.push(`${qid}: High confidence but incorrect — overconfidence to recalibrate.`);
      if (st.confidence === "Low" && st.isCorrect) calib.push(`${qid}: Low confidence but correct — trust this reasoning more.`);
    }
  });

  return (
    <div style={{ padding: 24, background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 8, margin: "24px 0" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Learning Summary</h2>

      <div style={{ padding: 16, background: "#fff", borderRadius: 6, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Score: {Math.round(score * 10) / 10} / {totalQ} scorable questions</div>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>Pattern-transfer (T-F) questions are free-text and self-evaluated — the score reflects multiple-choice and Fermi questions only.</div>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Calibration scan:</div>
        {calib.length === 0
          ? <div style={{ fontSize: 13, color: "#166534" }}>No high-confidence misses or low-confidence hits flagged — well calibrated, or few questions answered.</div>
          : calib.map((c, i) => <div key={i} style={{ fontSize: 13, color: "#92400e" }}>• {c}</div>)}
        {warmUpSkipped && <div style={{ fontSize: 13, color: "#b91c1c", marginTop: 8 }}>Warm-up skipped — {WARMUP_QUESTIONS.length} prior principles not reviewed this session.</div>}
      </div>

      <div style={{ padding: 16, background: "#fff", borderRadius: 6, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Principle production review</div>
        {[3, 4, 5].map(sid => (
          <div key={sid} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#7c3aed" }}>Section {sid} — Your principle:</div>
            <div style={{ fontSize: 13, padding: "6px 10px", background: "#faf5ff", borderRadius: 4, marginBottom: 4 }}>{principleGates[sid]?.value || "(not submitted)"}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#166534" }}>Authored principle:</div>
            <div style={{ fontSize: 13, padding: "6px 10px", background: "#f0fdf4", borderRadius: 4 }}>{AUTHORED_PRINCIPLES[sid]}</div>
          </div>
        ))}
        <div style={{ fontSize: 13, fontStyle: "italic", color: "#6b7280", marginTop: 8 }}>Which of your stated principles surprised you most when compared to the authored version? Why?</div>
      </div>

      <div style={{ padding: 16, background: "#fff", borderRadius: 6, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Three insight slots</div>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
          You have seen evidence from Google's own ML playbook and its most public ML failure. Write the single most non-obvious insight you would defend to a skeptical CTO.
        </div>
        {!insightSubmitted ? (
          <>
            <textarea value={insightVal} onChange={e => setInsightVal(e.target.value)} rows={3}
              style={{ width: "100%", boxSizing: "border-box", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, resize: "vertical" }}
              placeholder="The most non-obvious insight is..." />
            <button onClick={() => setInsightSubmitted(true)} disabled={insightVal.length < 20}
              style={{ marginTop: 8, padding: "8px 16px", background: insightVal.length >= 20 ? "#6366f1" : "#d1d5db", color: "#fff", border: "none", borderRadius: 4, cursor: insightVal.length >= 20 ? "pointer" : "not-allowed" }}>
              Submit insight
            </button>
          </>
        ) : (
          <div>
            <div style={{ padding: 10, background: "#eef2ff", borderRadius: 4, marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 12 }}>Your insight:</div>
              <div style={{ fontSize: 13 }}>{insightVal}</div>
            </div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>How your insight compares — three authored insights:</div>
            {[
              "The most expensive AI mistakes are not bad models — they are good models pointed at problems that never passed a feasibility gate. Google had the best models on Earth and still shipped Flu Trends, because the gate it skipped was 'is the data-generating process stable?', not 'can we model this?'",
              "A heuristic is not a placeholder for AI — it is the benchmark AI must beat. If you can't articulate the marginal value AI adds over a transparent rule, net of data and maintenance liability, you have not finished the feasibility analysis.",
              "Error cost, not accuracy, decides the v1 scope. The same 88%-accurate model is shippable as augmentation and reckless as automation — the number that matters is the cost of being confidently wrong, and where on the precision/recall curve that puts you.",
            ].map((ins, i) => (
              <div key={i} style={{ padding: 10, background: "#f8fafc", borderRadius: 4, marginBottom: 8, borderLeft: "3px solid #6366f1" }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: "#6366f1" }}>Authored insight {i + 1}:</div>
                <div style={{ fontSize: 13 }}>{ins}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: 16, background: "#fff", borderRadius: 6, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Apply It — both variants required</div>
        {!applySubmitted ? (
          <>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#1e40af", marginBottom: 6 }}>Present-day variant (2026):</div>
            <div style={{ fontSize: 13, color: "#374151", marginBottom: 8 }}>
              Apply the governing principle to a product you know. Include: (1) one-sentence so-what thesis, (2) load-bearing assumption, (3) strongest disconfirming evidence from this article, (4) pre-mortem: "If this fails in 12 months, the most likely reason is ___."
            </div>
            <textarea value={applyPresent} onChange={e => setApplyPresent(e.target.value)} rows={4}
              style={{ width: "100%", boxSizing: "border-box", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, resize: "vertical", marginBottom: 12 }}
              placeholder="(1) Thesis... (2) Assumption... (3) Disconfirming evidence... (4) Pre-mortem: If this fails in 12 months..." />
            <div style={{ fontWeight: 600, fontSize: 13, color: "#7c3aed", marginBottom: 6 }}>2027 forward-looking variant:</div>
            <div style={{ fontSize: 13, color: "#374151", marginBottom: 8 }}>
              Given the same constraints but cheaper, longer-context, stronger few-shot models: what would you decide differently, and which load-bearing assumption does the 2027 version replace?
            </div>
            <textarea value={apply2027} onChange={e => setApply2027(e.target.value)} rows={4}
              style={{ width: "100%", boxSizing: "border-box", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, resize: "vertical", marginBottom: 12 }}
              placeholder="In 2027 I would change... The assumption replaced is... The gate that matters more is..." />
            <button onClick={() => setApplySubmitted(true)} disabled={applyPresent.length < 30 || apply2027.length < 30}
              style={{ padding: "10px 24px", background: (applyPresent.length >= 30 && apply2027.length >= 30) ? "#7c3aed" : "#d1d5db", color: "#fff", border: "none", borderRadius: 4, cursor: (applyPresent.length >= 30 && apply2027.length >= 30) ? "pointer" : "not-allowed", fontSize: 14 }}>
              Lock in Apply It answers → unlock Conclusion
            </button>
          </>
        ) : (
          <div>
            <div style={{ padding: 10, background: "#eef2ff", borderRadius: 4, marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 12 }}>Your present-day answer:</div>
              <div style={{ fontSize: 13 }}>{applyPresent}</div>
            </div>
            <div style={{ padding: 10, background: "#faf5ff", borderRadius: 4 }}>
              <div style={{ fontWeight: 600, fontSize: 12 }}>Your 2027 answer:</div>
              <div style={{ fontSize: 13 }}>{apply2027}</div>
            </div>
          </div>
        )}
      </div>

      {canContinue && (
        <button onClick={onContinue}
          style={{ width: "100%", padding: "12px 0", background: "#6366f1", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
          Continue to Conclusion →
        </button>
      )}
    </div>
  );
}

// ─── NAVIGATION GUIDE ──────────────────────────────────────────────────────────

function NavigationGuide() {
  const types = [
    { name: "Phase 0", title: "AI Product Lifecycle Spine", phases: "All 7", desc: "Navigational map (Shopify) — prerequisite", color: "#6366f1" },
    { name: "Type 1", title: "AI Feasibility & Technical Scoping", phases: "Feasibility", desc: "When not to use AI, data readiness, v1 scope", color: "#8b5cf6", current: true },
    { name: "Type 2", title: "AI Product Teardown", phases: "Design → Build", desc: "How AI products work under the hood", color: "#a855f7" },
    { name: "Type 3", title: "Agentic System Architecture", phases: "Build → Evaluate", desc: "Agents in production: tools, memory, orchestration", color: "#ec4899" },
    { name: "Type 4", title: "AI-Native System Design", phases: "Build", desc: "RAG, vector DBs, LLM serving", color: "#f43f5e" },
    { name: "Type 5", title: "AI Product Sense", phases: "Design → Deploy", desc: "v1 to shipped: model decisions follow product decisions", color: "#ef4444" },
    { name: "Type 6", title: "AI Metrics & Evaluation", phases: "Evaluate", desc: "Eval stacks, LLM judges, org ownership", color: "#f97316" },
    { name: "Type 7", title: "Product Psychology × AI", phases: "Deploy → Scale", desc: "Trust calibration, automation bias", color: "#eab308" },
    { name: "Type 8", title: "AI Incident & Recovery", phases: "Scale → Govern", desc: "Real post-mortems, what broke and why", color: "#84cc16" },
    { name: "Type 9", title: "CTO Scaling Playbook", phases: "Scale → Govern", desc: "Org design, build/buy/partner, governance", color: "#10b981" },
  ];
  return (
    <div style={{ margin: "24px 0" }}>
      <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 12 }}>Navigation Guide — where this article sits</div>
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
        This is the first phase of the lifecycle. Upstream: the Phase 0 Spine (the whole map). Downstream: Type 2 (Teardown) and Type 5 (Product Sense), where feasibility decisions become design and product decisions.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 10 }}>
        {types.map(t => (
          <div key={t.name} style={{ padding: 12, borderRadius: 8, border: `2px solid ${t.current ? t.color : "#e5e7eb"}`, background: t.current ? "#eef2ff" : "#fff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ padding: "2px 8px", borderRadius: 10, background: t.color, color: "#fff", fontSize: 11, fontWeight: 700 }}>{t.name}</span>
              {t.current && <span style={{ fontSize: 10, color: t.color, fontWeight: 700 }}>← YOU ARE HERE</span>}
            </div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{t.title}</div>
            <div style={{ fontSize: 11, color: "#6366f1", marginBottom: 4 }}>Lifecycle: {t.phases}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{t.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────

function App() {
  const [warmUpDone, setWarmUpDone] = useState(false);
  const [warmUpSkipped, setWarmUpSkipped] = useState(false);
  const [questionState, setQuestionState] = useState({});
  const [score, setScore] = useState(0);
  const [chartRevealed, setChartRevealed] = useState({});
  const [readerSoWhat, setReaderSoWhat] = useState({});
  const [principleGates, setPrincipleGates] = useState({});
  const [sectionUnlocked, setSectionUnlocked] = useState([true, true, true, true, true, true, true]);
  const [showSummary, setShowSummary] = useState(false);
  const [activeSec, setActiveSec] = useState("sec-1");
  const [navWide, setNavWide] = useState(typeof window !== "undefined" ? window.innerWidth >= 1160 : true);

  const NAV = [
    { id: "sec-1", label: "1 · Introduction" },
    { id: "sec-2", label: "2 · Feasibility Landscape" },
    { id: "sec-3", label: "3 · When Is AI Right? (RQ1)" },
    { id: "sec-4", label: "4 · Data Readiness (RQ2)" },
    { id: "sec-5", label: "5 · v1 Spec (RQ3)" },
    { id: "sec-6", label: "6 · What Broke" },
    { id: "sec-summary", label: "Learning Summary" },
    { id: "sec-7", label: "7 · Conclusion" },
  ];

  const goToSection = (id) => {
    if ((id === "sec-summary" || id === "sec-7") && !showSummary) setShowSummary(true);
    setActiveSec(id);
    setTimeout(() => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 60);
  };

  const totalScorableQ = 11; // q1,q2,q3,q5,q6,q8,q9,q11,q12,q13 + q14(0.5+0.5)

  const handleRevealChart = (chartId, soWhat) => {
    setChartRevealed(prev => ({ ...prev, [chartId]: true }));
    setReaderSoWhat(prev => ({ ...prev, [chartId]: soWhat }));
  };
  const handleSoWhatChange = (chartId, val) => setReaderSoWhat(prev => ({ ...prev, [chartId]: val }));
  const handleConfidence = (qId, conf) => setQuestionState(prev => ({ ...prev, [qId]: { ...(prev[qId] || {}), confidence: conf } }));

  const handleAnswer = (qId, optId, submit) => {
    if (!submit) {
      setQuestionState(prev => ({ ...prev, [qId]: { ...(prev[qId] || {}), selectedOption: optId } }));
      return;
    }
    const q = QUESTIONS[qId];
    const correct = optId === q.correct;
    const prev = questionState[qId] || {};
    const attemptCount = (prev.attemptCount || 0) + 1;
    if (correct && !prev.isCorrect) setScore(s => s + 1);
    setQuestionState(prevState => ({
      ...prevState,
      [qId]: { ...(prevState[qId] || {}), selectedOption: optId, isCorrect: correct, submitted: true, attemptCount, scaffoldingShown: false },
    }));
  };

  const handleForwardLookingAnswer = (qId, variant, optId, submit) => {
    if (!submit) {
      setQuestionState(prev => ({ ...prev, [qId]: { ...(prev[qId] || {}), [variant]: { ...(prev[qId]?.[variant] || {}), selectedOption: optId } } }));
      return;
    }
    const q = QUESTIONS[qId];
    const correctAns = variant === "present" ? q.correctPresent : q.correct2027;
    const correct = optId === correctAns;
    const prev = questionState[qId] || {};
    const variantState = prev[variant] || {};
    const attemptCount = (variantState.attemptCount || 0) + 1;
    if (correct && !variantState.isCorrect) setScore(s => s + 0.5);
    setQuestionState(prevState => ({
      ...prevState,
      [qId]: {
        ...(prevState[qId] || {}),
        [variant]: { ...(prevState[qId]?.[variant] || {}), selectedOption: optId, isCorrect: correct, submitted: true, attemptCount },
        confidence: prevState[qId]?.confidence,
      },
    }));
  };

  const handleRetry = (qId) => {
    if (qId.includes("-")) {
      const [base, variant] = qId.split("-");
      setQuestionState(prev => ({
        ...prev,
        [base]: { ...(prev[base] || {}), [variant]: { ...(prev[base]?.[variant] || {}), submitted: false, selectedOption: null, scaffoldingShown: true } },
      }));
      return;
    }
    setQuestionState(prev => ({ ...prev, [qId]: { ...(prev[qId] || {}), submitted: false, selectedOption: null, scaffoldingShown: true } }));
  };

  const handleSubmitNumeric = (qId, userValue) => {
    const q = QUESTIONS[qId];
    const tol = q.tolerance;
    const ratio = userValue / q.correctValue;
    const correct = ratio >= (1 - tol) && ratio <= (1 + tol);
    if (correct && !questionState[qId]?.isCorrect) setScore(s => s + 1);
    setQuestionState(prev => ({ ...prev, [qId]: { ...(prev[qId] || {}), submitted: true, userValue, isCorrect: correct } }));
  };

  const handleSubmitFreeText = (qId, val) => setQuestionState(prev => ({ ...prev, [qId]: { ...(prev[qId] || {}), submitted: true, userValue: val } }));
  const handlePrincipleGate = (sectionId, val) => setPrincipleGates(prev => ({ ...prev, [sectionId]: { value: val, submitted: true } }));

  const s3done = ["q1", "q2", "q3"].every(q => questionState[q]?.submitted) && questionState.q4?.submitted && principleGates[3]?.submitted;
  const s4done = ["q5", "q6"].every(q => questionState[q]?.submitted) && questionState.q7?.submitted && principleGates[4]?.submitted;
  const s5done = ["q8", "q9"].every(q => questionState[q]?.submitted) && questionState.q10?.submitted && principleGates[5]?.submitted;
  const s6done = ["q11", "q12", "q13"].every(q => questionState[q]?.submitted);

  // All sections are always navigable — no gating/locking.
  useEffect(() => {
    setSectionUnlocked([true, true, true, true, true, true, true]);
  }, []);

  // Track viewport width to show/hide the left section nav.
  useEffect(() => {
    const h = () => setNavWide(window.innerWidth >= 1160);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // Highlight the section currently in view.
  useEffect(() => {
    const ids = ["sec-1", "sec-2", "sec-3", "sec-4", "sec-5", "sec-6", "sec-summary", "sec-7"];
    const onScroll = () => {
      let cur = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 150) cur = id;
      }
      setActiveSec(cur);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [showSummary]);

  if (!warmUpDone && !warmUpSkipped) {
    return (
      <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: "#fff", color: "#111", minHeight: "100vh" }}>
        <WarmUpScreen onComplete={() => setWarmUpDone(true)} onSkip={() => { setWarmUpSkipped(true); }} />
      </div>
    );
  }

  // progress: 0..100 across 6 content milestones
  const milestones = [true, sectionUnlocked[3], sectionUnlocked[4], sectionUnlocked[5], showSummary, sectionUnlocked[6]];
  const progressPct = Math.round((milestones.filter(Boolean).length / milestones.length) * 100);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: "#fff", color: "#111", minHeight: "100vh" }}>
      <ProgressBar pct={progressPct} />

      <div style={{ position: "sticky", top: 4, zIndex: 999, background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "10px 16px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 800, fontSize: 15 }}>When Not to Use AI</span>
              <span style={{ padding: "2px 10px", background: "#8b5cf6", color: "#fff", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>Type 1 · AI Feasibility & Scoping</span>
              <span style={{ fontSize: 12, color: "#6b7280" }}>Google case study</span>
            </div>
            <LifecycleStrip activePhases={ACTIVE_PHASES} />
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Prev: Phase 0 — Lifecycle Spine · Next: Type 2 — AI Product Teardown</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#6366f1" }}>Score: {Math.round(score * 10) / 10}/{totalScorableQ}</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>Feasibility phase</div>
          </div>
        </div>
      </div>

      {navWide && (
        <nav style={{ position: "fixed", top: 118, left: 20, width: 210, maxHeight: "calc(100vh - 150px)", overflowY: "auto", zIndex: 900, paddingRight: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Sections</div>
          {NAV.map(n => (
            <div key={n.id} onClick={() => goToSection(n.id)}
              style={{
                padding: "7px 10px", marginBottom: 2, borderRadius: 6, cursor: "pointer", fontSize: 13, lineHeight: 1.35,
                borderLeft: activeSec === n.id ? "3px solid #6366f1" : "3px solid transparent",
                background: activeSec === n.id ? "#eef2ff" : "transparent",
                color: activeSec === n.id ? "#4338ca" : "#374151",
                fontWeight: activeSec === n.id ? 700 : 500,
              }}>
              {n.label}
            </div>
          ))}
        </nav>
      )}

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px", lineHeight: 1.7, fontSize: 16 }}>

        {/* SECTION 1: Introduction */}
        <div id="sec-1">
          <div style={{ padding: "14px 18px", background: "#f0f9ff", borderLeft: "4px solid #6366f1", borderRadius: 4, marginBottom: 24, fontSize: 17, fontStyle: "italic", lineHeight: 1.7 }}>
            The right feasibility question is never "can we use AI for this?" but "what would have to be true about our data, our error costs, and the stability of the world for AI to beat a simple heuristic?" Google — which holds arguably the best ML talent and data on Earth — made "Don't be afraid to launch a product without machine learning" the <em>first</em> rule of its own ML playbook, and still shipped Google Flu Trends, which overestimated flu for 100 of 108 weeks. The failure was not a weak model. It was a yes/no capability conversation that should have been a data-readiness and error-cost audit.
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.3, marginBottom: 16 }}>
            When Not to Use AI:<br />
            <span style={{ color: "#8b5cf6" }}>Google's Feasibility Gates, and the Failure That Skipped Them</span>
          </h1>

          <div style={{ padding: "8px 14px", background: "#f3f4f6", borderRadius: 6, display: "inline-block", fontSize: 13, color: "#374151", marginBottom: 20 }}>
            <strong>Lifecycle position:</strong> Feasibility — the phase before Design. Upstream: Phase 0 Spine · Downstream: Type 2 (Teardown), Type 5 (Product Sense)
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Section 1: Introduction</h2>

          <p>
            This article's thesis is that feasibility is an audit, not a vote. The decision to build an AI feature should turn on three measurable conditions — is the data representative, fresh, and stable; is the cost of a confidently wrong answer tolerable; and does the model actually beat a transparent heuristic on value net of its liabilities — not on whether the technology <em>can</em> do the task. Google is the right evidence for this because it argues both sides of the case in its own published record: its engineering guidance is unusually disciplined about <em>not</em> using AI, and its most famous ML product failed precisely where that guidance was ignored.
          </p>

          <p>
            The discipline is documented in two Google sources. The <strong>Rules of Machine Learning</strong>, Google's internal-best-practices guide by Martin Zinkevich, opens with Rule #1: "Don't be afraid to launch a product without machine learning."
            <Citation source="Rules of ML, Google for Developers" year="2025" tier="FACT" />
            The <strong>People + AI Guidebook</strong> from Google's PAIR group goes further, publishing explicit lists of when AI "is probably better" and when it "is probably not better."
            <Citation source="PAIR People + AI Guidebook" year="2024" tier="FACT" />
            Against that backdrop, the base rate is sobering: a 2024 RAND study found that more than 80% of AI projects fail — roughly twice the rate of comparable IT projects that do not involve AI.
            <Citation source="RAND" year="2024" tier="FACT" />
          </p>

          <p>
            The structural gap conventional product thinking misses is this: software teams are trained to ask "is it possible?" because, in deterministic software, possible usually implies shippable. AI breaks that link. A model can be entirely capable of a task in a demo and still be the wrong choice — because the data behind it will drift, because the cost of its 5% error is catastrophic, or because a transparent rule would deliver 80% of the value with none of the liability. Possible is not the same as feasible, and the gap between them is where the 80% of failed projects live.
          </p>

          <p>
            This article addresses three questions. First, when is AI actually the right tool — what are the decision criteria that separate an AI problem from a heuristic problem? Second, what does data readiness actually require, and what are the hidden data-debt traps that pass a launch review and fail in production? Third, how do you write a v1 specification when the model's behavior is probabilistic and the capability curve is shifting under you?
          </p>
        </div>

        {/* SECTION 2: Landscape */}
        <div id="sec-2" style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Section 2: The Feasibility Landscape</h2>
          <p>
            Before AI, feasibility was largely a question of cost and time: could the team build it, and was it worth building. The answer was knowable in advance because the system was deterministic — given an input, the output was specified. Machine-learned systems removed that guarantee. Outputs became probabilistic, performance became contingent on data that changes after launch, and the same feature could be excellent for one user segment and harmful for another. The conventional "can we?" gate, applied to AI, systematically lets through projects that will fail for reasons invisible at the decision point.
          </p>
          <p>
            The benchmark for how often this happens is the RAND 2024 root-cause study, which is qualitative — built on interviews with data scientists and engineers — so it is best read as "the large majority fail," not a precise percentage. Its named root causes are telling: leaders misunderstand or miscommunicate what problem the AI is meant to solve, the data infrastructure is inadequate, and teams chase the newest technology instead of the business outcome.
            <Citation source="RAND, Root Causes of Failure for AI Projects" year="2024" tier="FACT" />
            None of these are modeling failures. They are feasibility failures — decisions made (or skipped) before a model was ever trained.
          </p>

          <ChartCard
            chartId="failure-rate"
            title="Chart 1 — Base rate of failure: AI projects vs comparable IT projects"
            soWhat="If AI projects fail at roughly twice the rate of non-AI IT projects, then 'we can build it' is not evidence the project will succeed — the prior is failure, and a feasibility audit is how you move a project off that prior before spending the budget."
            revealed={chartRevealed["failure-rate"]}
            onReveal={handleRevealChart}
            readerSoWhat={readerSoWhat["failure-rate"]}
            onSoWhatChange={(v) => handleSoWhatChange("failure-rate", v)}
            provenance="FACT: >80% AI-project failure rate, ~2× non-AI IT projects (RAND 2024, qualitative). The 40% non-AI bar is an ESTIMATE derived as 'half the AI rate' from RAND's '~twice' statement — not a separately reported figure."
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={FAILURE_RATE_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cat" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => chartRevealed["failure-rate"] ? `${v}%` : "?"} />
                <Tooltip formatter={v => chartRevealed["failure-rate"] ? `${v}%` : "?"} />
                <Bar dataKey="rate" name="Failure rate" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <p>
            Google's published answer to this base rate is a decision framework, not a pep talk. The PAIR People + AI Guidebook tells teams to reframe the question entirely: instead of asking "Can we use AI to ___?", ask "How might we solve ___? Can AI solve this problem in a unique way?"
            <Citation source="PAIR People + AI Guidebook (User Needs)" year="2024" tier="FACT" />
            It then publishes two explicit lists — situations where AI is probably the better tool, and situations where it is probably not. The second list is the one most teams skip.
          </p>

          <ChartCard
            chartId="pair-matrix"
            title="Chart 2 — Google PAIR's decision grid: when AI is probably better vs probably not"
            soWhat="Feasibility is a portfolio of criteria, not a single yes/no: PAIR's 'probably not better' column (high error cost, transparency, predictability) is where most failed AI features should have been stopped — a PM should be able to place a candidate feature in one column before any model work begins."
            revealed={chartRevealed["pair-matrix"]}
            onReveal={handleRevealChart}
            readerSoWhat={readerSoWhat["pair-matrix"]}
            onSoWhatChange={(v) => handleSoWhatChange("pair-matrix", v)}
            provenance="FACT: both lists are quoted directly from Google PAIR People + AI Guidebook, 'User Needs + Defining Success' chapter (2024)."
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ border: "1px solid #bbf7d0", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ background: "#dcfce7", color: "#166534", fontWeight: 700, fontSize: 13, padding: "8px 10px" }}>AI is probably better</div>
                <div style={{ padding: "8px 10px" }}>
                  {PAIR_USE_AI.map((x, i) => (
                    <div key={i} style={{ fontSize: 12.5, padding: "5px 0", borderBottom: i < PAIR_USE_AI.length - 1 ? "1px solid #f0fdf4" : "none", lineHeight: 1.4 }}>✓ {x}</div>
                  ))}
                </div>
              </div>
              <div style={{ border: "1px solid #fecaca", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ background: "#fee2e2", color: "#b91c1c", fontWeight: 700, fontSize: 13, padding: "8px 10px" }}>AI is probably NOT better</div>
                <div style={{ padding: "8px 10px" }}>
                  {PAIR_AVOID_AI.map((x, i) => (
                    <div key={i} style={{ fontSize: 12.5, padding: "5px 0", borderBottom: i < PAIR_AVOID_AI.length - 1 ? "1px solid #fef2f2" : "none", lineHeight: 1.4 }}>✗ {x}</div>
                  ))}
                </div>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* SECTION 3: RQ1 */}
        <div id="sec-3" style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Section 3: When Is AI the Right Tool? (RQ1)</h2>
          <p>
            The thesis to defend here: AI is justified only when it beats a transparent heuristic on value, net of the data and maintenance liabilities the heuristic does not carry. Rule #1 of the Rules of ML makes the claim concrete — "machine learning is cool, but it requires data... If you think that machine learning will give you a 100% boost, then a heuristic will get you 50% of the way there."
            <Citation source="Rules of ML, Rule #1" year="2025" tier="FACT" />
            The examples Google gives are deliberately humble: rank apps by install rate; filter spam by blocking publishers who have sent spam before; rank contacts by recency. The guidance is blunt: "If machine learning is not absolutely required for your product, don't use it until you have data."
          </p>
          <p>
            This is not anti-AI; it is a sequencing rule. Rule #3 completes it: "Choose machine learning over a complex heuristic," because "a simple heuristic can get your product out the door" but "a complex heuristic is unmaintainable."
            <Citation source="Rules of ML, Rule #3" year="2025" tier="FACT" />
            The decision boundary is therefore not AI-versus-no-AI forever. It is: start with the simplest rule that ships, instrument it, and graduate to ML at the precise point where the heuristic's complexity exceeds its maintainability and you have the data to do better. The feasibility error is jumping that sequence — reaching for ML before the heuristic has shown you what "good" looks like and what data you actually need.
          </p>

          <ChartCard
            chartId="heuristic-ml"
            title="Chart 3 — Value captured vs cost: heuristic, simple ML, complex ML"
            soWhat="A heuristic delivers roughly half of ML's achievable value at a small fraction of the cost and zero data dependency — so AI must justify itself on the marginal value of the remaining half, which is a far higher bar than 'the model works.'"
            revealed={chartRevealed["heuristic-ml"]}
            onReveal={handleRevealChart}
            readerSoWhat={readerSoWhat["heuristic-ml"]}
            onSoWhatChange={(v) => handleSoWhatChange("heuristic-ml", v)}
            provenance="Value axis anchored to Rule #1's rule of thumb (heuristic ≈ 50% of ML's 100% boost): FACT for the heuristic (50) and complex-ML (100) endpoints; the simple-ML midpoint (75) and the entire cost series are ILLUSTRATION to show the structural relationship — not reported statistics."
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={HEURISTIC_ML_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="approach" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => chartRevealed["heuristic-ml"] ? v : "?"} />
                <Tooltip formatter={v => chartRevealed["heuristic-ml"] ? v : "?"} />
                <Legend />
                <Bar dataKey="value" name="Value captured (Rule #1 anchor)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" name="Relative cost (illustrative)" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <MCQuestion qData={QUESTIONS.q1} state={questionState.q1} onAnswer={handleAnswer} onConfidence={handleConfidence} onRetry={handleRetry} />
          <NumericQuestion qData={QUESTIONS.q2} state={questionState.q2} onSubmitNumeric={handleSubmitNumeric} onConfidence={handleConfidence} />
          <MCQuestion qData={QUESTIONS.q3} state={questionState.q3} onAnswer={handleAnswer} onConfidence={handleConfidence} onRetry={handleRetry} />

          <p>
            Where the evidence has limits: Rule #1's "50%" is a rule of thumb, not a law — for some problems (machine translation, image recognition, the PAIR "AI is probably better" list) a heuristic gets nowhere and ML is the only feasible path. The principle is not "always start with a heuristic"; it is "make AI prove its marginal value against the best simple alternative, and know which side of PAIR's grid your problem sits on before you build."
          </p>

          <FreeTextQuestion qData={QUESTIONS.q4} state={questionState.q4} onSubmitFreeText={handleSubmitFreeText} onConfidence={handleConfidence} />
          <PrincipleGate sectionId={3} state={principleGates[3]} onSubmit={handlePrincipleGate} authoredPrinciple={AUTHORED_PRINCIPLES[3]} />
        </div>

        {/* SECTION 4: RQ2 */}
        {sectionUnlocked[3] ? (
          <div id="sec-4" style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Section 4: Data Readiness Gates (RQ2)</h2>
            <p>
              The thesis here: an AI feature is only as feasible as its data is representative, fresh, and stable — and each of those is a gate most launch reviews never check. PAIR's data chapter is explicit that volume is not the only question: "the scope of features, the quality of the labels, and representativeness of the examples in your training dataset are all factors that affect the quality of your AI system," and "adequate data can make or break the success of a model."
              <Citation source="PAIR Guidebook (Data Collection + Evaluation)" year="2024" tier="FACT" />
              Its worked example is sharp: a run-recommendation model trained only on elite runners "would likely not be useful... for a wider user base." Representativeness is a feasibility property, not a data-science nicety.
            </p>
            <p>
              Freshness is the second, quieter gate. Rule #8 of the Rules of ML tells teams to know their model's freshness requirements, noting that if the model behind Google Play Search is not updated "it can have a negative impact in under a month."
              <Citation source="Rules of ML, Rule #8" year="2025" tier="FACT" />
              Rule #10 makes the failure mode visceral: a machine-learned system whose input table goes stale "will adjust, and behavior will continue to be reasonably good, decaying gradually" — and Google Play once had a table left stale for six months, where a single refresh then lifted install rate by 2%.
              <Citation source="Rules of ML, Rule #10" year="2025" tier="FACT" />
              The cost was invisible for six months because nothing alarmed; the model simply got quietly worse.
            </p>

            <ChartCard
              chartId="freshness"
              title="Chart 4 — Silent decay: model quality as the data behind it goes stale"
              soWhat="Data freshness is a continuous feasibility gate, not a launch-day checkbox: degradation is silent (the model 'adjusts'), so without freshness monitoring the loss is invisible until a refresh accidentally reveals it — budget for the monitoring at scoping time, not after."
              revealed={chartRevealed["freshness"]}
              onReveal={handleRevealChart}
              readerSoWhat={readerSoWhat["freshness"]}
              onSoWhatChange={(v) => handleSoWhatChange("freshness", v)}
              provenance="Curve shape is ILLUSTRATION of gradual silent decay. FACT anchors (Rules of ML, Rules #8 & #10): Google Play Search degrades measurably in under 1 month; a Play table stale for 6 months hid a 2% install-rate loss recovered by one refresh."
            >
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={FRESHNESS_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="m" tick={{ fontSize: 11 }} label={{ value: "Months since last data refresh", position: "insideBottom", offset: -8, fontSize: 11 }} />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} tickFormatter={v => chartRevealed["freshness"] ? `${v}%` : "?"} />
                  <Tooltip formatter={v => chartRevealed["freshness"] ? `${v}% of fresh-model quality` : "?"} />
                  {chartRevealed["freshness"] && <ReferenceLine x={1} stroke="#f59e0b" strokeDasharray="4 2" label={{ value: "Play Search: impact <1mo", position: "top", fontSize: 9, fill: "#92400e" }} />}
                  {chartRevealed["freshness"] && <ReferenceLine x={6} stroke="#ef4444" strokeDasharray="4 2" label={{ value: "6mo stale → 2% lost", position: "top", fontSize: 9, fill: "#b91c1c" }} />}
                  <Line type="monotone" dataKey="q" name="Relative model quality" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <p>
              The third gate — stability of the data-generating process — is the most dangerous because it is the most invisible. Google's own researchers documented it in "Hidden Technical Debt in Machine Learning Systems," which names ML-specific traps that ordinary code reviews miss: entanglement (changing any one input changes the behavior of everything downstream), undeclared consumers, and unstable data dependencies.
              <Citation source="Sculley et al., NeurIPS" year="2015" tier="FACT" />
              The implication for feasibility is that a model's inputs are a live dependency on a world that can shift — and if you cannot articulate why that world will stay stable enough for your training distribution to keep holding, you have not cleared the data-readiness gate, however large your dataset.
            </p>

            <MCQuestion qData={QUESTIONS.q5} state={questionState.q5} onAnswer={handleAnswer} onConfidence={handleConfidence} onRetry={handleRetry} />
            <NumericQuestion qData={QUESTIONS.q6} state={questionState.q6} onSubmitNumeric={handleSubmitNumeric} onConfidence={handleConfidence} />
            <FreeTextQuestion qData={QUESTIONS.q7} state={questionState.q7} onSubmitFreeText={handleSubmitFreeText} onConfidence={handleConfidence} />
            <PrincipleGate sectionId={4} state={principleGates[4]} onSubmit={handlePrincipleGate} authoredPrinciple={AUTHORED_PRINCIPLES[4]} />
          </div>
        ) : (
          <SectionLock label="Section 4: Data Readiness Gates — locked. Complete Section 3 questions and the principle gate to unlock." />
        )}

        {/* SECTION 5: RQ3 */}
        {sectionUnlocked[4] ? (
          <div id="sec-5" style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Section 5: Writing a v1 Spec Under Probabilistic Uncertainty (RQ3)</h2>
            <p>
              The thesis: a v1 AI spec is not a list of deterministic behaviors — it is a reward function plus a chosen operating point on the error curve, plus the thresholds that tell you when to intervene. PAIR puts the reward function at the center: "the reward function is how an AI defines successes and failures," and "weighing the cost of false positives and false negatives is a critical decision that will shape your users' experiences."
              <Citation source="PAIR Guidebook (Defining Success)" year="2024" tier="FACT" />
              Its example is the whole lesson: a false fire alarm and a fire alarm that fails to sound are both errors, "but one is much more dangerous."
            </p>
            <p>
              Concretely, that means choosing where to sit on the precision/recall tradeoff — and PAIR is explicit that "you'll need to design specifically for these tradeoffs — there's no getting around them." High precision means fewer false positives but more misses; high recall means catching more but with more false alarms. Which way you tune is not a model setting the data scientist picks; it is a product decision about which error costs your users more. The v1 scope <em>is</em> that decision, plus a monitoring threshold in PAIR's template form: "If {`{metric}`} {`{crosses threshold}`}, we will {`{take a specific action}`}."
              <Citation source="PAIR Guidebook (Defining Success)" year="2024" tier="FACT" />
            </p>

            <ChartCard
              chartId="pr-curve"
              title="Chart 5 — The precision/recall tradeoff: where v1 should sit is a product decision"
              soWhat="You cannot maximize precision and recall at once, so a v1 spec must commit to an operating point chosen by which error costs more — high precision where a false positive is expensive (irreversible actions), high recall where a miss is expensive (fraud, safety screening)."
              revealed={chartRevealed["pr-curve"]}
              onReveal={handleRevealChart}
              readerSoWhat={readerSoWhat["pr-curve"]}
              onSoWhatChange={(v) => handleSoWhatChange("pr-curve", v)}
              provenance="ILLUSTRATION — a structural tradeoff curve to teach the precision/recall relationship described in Google PAIR's 'Defining Success' chapter. Values are illustrative, not reported statistics."
            >
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={PR_CURVE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="recall" tick={{ fontSize: 11 }} label={{ value: "Recall (% of true cases caught)", position: "insideBottom", offset: -8, fontSize: 11 }} />
                  <YAxis domain={[40, 100]} tick={{ fontSize: 11 }} tickFormatter={v => chartRevealed["pr-curve"] ? `${v}%` : "?"} />
                  <Tooltip formatter={(v, n) => chartRevealed["pr-curve"] ? `${v}%` : "?"} labelFormatter={l => chartRevealed["pr-curve"] ? `Recall ${l}%` : "?"} />
                  <Line type="monotone" dataKey="precision" name="Precision at this recall" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <p>
              PAIR's automation-versus-augmentation guidance is the companion rule for v1 scope: automate tasks that are "difficult, unpleasant, or where there's a need for scale" and where people "agree on the correct way to do it"; augment — keep the human deciding — when "the stakes of the situation are high" or people want control, "for example pilots, doctors, or police officers."
              <Citation source="PAIR Guidebook (Automation vs Augmentation)" year="2024" tier="FACT" />
              A probabilistic v1 in a high-stakes domain should almost always ship as augmentation first, with automation earned later as the monitored error rate proves out.
            </p>

            <MCQuestion qData={QUESTIONS.q8} state={questionState.q8} onAnswer={handleAnswer} onConfidence={handleConfidence} onRetry={handleRetry} />
            <MCQuestion qData={QUESTIONS.q9} state={questionState.q9} onAnswer={handleAnswer} onConfidence={handleConfidence} onRetry={handleRetry} />
            <FreeTextQuestion qData={QUESTIONS.q10} state={questionState.q10} onSubmitFreeText={handleSubmitFreeText} onConfidence={handleConfidence} />
            <PrincipleGate sectionId={5} state={principleGates[5]} onSubmit={handlePrincipleGate} authoredPrinciple={AUTHORED_PRINCIPLES[5]} />
          </div>
        ) : (
          sectionUnlocked[3] ? <SectionLock label="Section 5: v1 Spec Under Uncertainty — complete Section 4 questions and principle gate to unlock." /> : null
        )}

        {/* SECTION 6: What Broke */}
        {sectionUnlocked[5] ? (
          <div id="sec-6" style={{ marginTop: 40, padding: 20, background: "#FEF2F2", borderLeft: "4px solid #FCA5A5", borderRadius: 8 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "#b91c1c" }}>Section 6: What Broke — Google Flu Trends</h2>
            <p>
              Google Flu Trends (GFT), launched in 2008, used the volume of flu-related search queries to estimate influenza prevalence faster than the CDC's traditional surveillance. For a while it looked like a triumph of big data. Then it drifted. From 21 August 2011 to 1 September 2013, GFT reported overly high flu prevalence in 100 out of 108 weeks, and at the peak of the 2012–13 season it estimated that about 11% of the U.S. had influenza-like illness — nearly double the CDC's measured ~6%.
              <Citation source="Lazer et al., Science (Parable of Google Flu)" year="2014" tier="FACT" />
              In the 2011–12 season it had already overshot the real level by more than 50%.
              <Citation source="Lazer et al., Science" year="2014" tier="FACT" />
            </p>
            <p>
              The root cause was a feasibility assumption the team treated as uncontroversial: that the relationship between search queries and flu would stay stable. It did not. Independent researchers found that GFT was, in effect, "part flu detector, part winter detector" — it keyed on seasonal search terms correlated with winter rather than caused by flu — and, critically, Google's own product kept changing the inputs. Features like autocomplete and suggested searches altered what people typed, while the model was fit largely on 2003–2008 CDC data and rarely refit. The data-generating process moved; the model stood still.
              <Citation source="Lazer et al., Science" year="2014" tier="FACT" />
              This is exactly the stability gate from Section 4, skipped — and the entanglement risk Google's own technical-debt paper had named.
            </p>
            <p>
              What did it cost? The damage was reputational and scientific rather than billed in dollars: GFT became the textbook cautionary tale of "big data hubris," and Google quietly stopped publishing GFT estimates in 2015. The expensive part was the discovery latency. Because GFT curve-matched the CDC for years, the failure was invisible until researchers compared it against ground truth over a long window — the overestimation ran for the better part of two years before it was decisively characterized. A model validated only by curve-matching hid its own failure.
            </p>
            <p>
              The lesson is the most transferable in this article precisely because it is a failure, not a success: capability is not feasibility. Google had the talent and the data, and still shipped a system that failed — because the binding constraint was never "can we model flu from search?" It was "will the mapping from search to flu stay stable, and how would we know if it didn't?" That is a data-stability and monitoring question, and it belongs in the feasibility phase, not the post-mortem.
            </p>

            <ChartCard
              chartId="gft"
              title="Chart 6 — Google Flu Trends vs CDC, indexed (CDC = 100): a static model drifting from a moving world"
              soWhat="A model that curve-matches ground truth can be silently diverging from it: GFT ran above the CDC in 100 of 108 weeks, so 'it tracks the CDC' was never proof it measured flu — the feasibility gate it failed was distribution stability, the hardest one to see at launch."
              revealed={chartRevealed["gft"]}
              onReveal={handleRevealChart}
              readerSoWhat={readerSoWhat["gft"]}
              onSoWhatChange={(v) => handleSoWhatChange("gft", v)}
              provenance="Indexed to CDC = 100. FACT anchors (Lazer et al., Science 2014): 2012–13 winter peak = 183 (GFT ~11% vs CDC ~6%); 2011–12 winter = 153 (>50% overshoot); GFT ran high in 100 of 108 weeks (Aug 2011–Sep 2013). Intermediate points are ESTIMATE/illustrative of the documented persistent-overestimate pattern."
            >
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={GFT_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
                  <YAxis domain={[80, 200]} tick={{ fontSize: 11 }} tickFormatter={v => chartRevealed["gft"] ? v : "?"} />
                  <Tooltip formatter={v => chartRevealed["gft"] ? `${v} (CDC=100)` : "?"} />
                  <Legend />
                  <ReferenceLine y={100} stroke="#4ade80" strokeDasharray="4 2" label={{ value: "CDC truth (100)", position: "insideBottomRight", fontSize: 10, fill: "#166534" }} />
                  <Line type="monotone" dataKey="gft" name="GFT estimate (indexed)" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="cdc" name="CDC actual (indexed)" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <MCQuestion qData={QUESTIONS.q11} state={questionState.q11} onAnswer={handleAnswer} onConfidence={handleConfidence} onRetry={handleRetry} />
            <MCQuestion qData={QUESTIONS.q12} state={questionState.q12} onAnswer={handleAnswer} onConfidence={handleConfidence} onRetry={handleRetry} />
            <NumericQuestion qData={QUESTIONS.q13} state={questionState.q13} onSubmitNumeric={handleSubmitNumeric} onConfidence={handleConfidence} />
          </div>
        ) : (
          sectionUnlocked[4] ? <SectionLock label="Section 6: What Broke — complete Section 5 questions and principle gate to unlock." /> : null
        )}

        {/* LEARNING SUMMARY */}
        {!showSummary && (
          <div style={{ marginTop: 32, textAlign: "center" }}>
            <button onClick={() => setShowSummary(true)}
              style={{ padding: "14px 40px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
              View Learning Summary →
            </button>
          </div>
        )}

        {showSummary && (
          <div id="sec-summary">
          <LearningSummary
            questionState={questionState}
            principleGates={principleGates}
            score={score}
            totalQ={totalScorableQ}
            warmUpSkipped={warmUpSkipped}
            onContinue={() => setSectionUnlocked(prev => { const n = [...prev]; n[6] = true; return n; })}
          />
          </div>
        )}

        {/* SECTION 7: Conclusion */}
        {showSummary && (
          <div id="sec-7" style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Section 7: Conclusion</h2>
            <p>
              The governing principle, now stress-tested by both Google's guidance and Google's failure: feasibility is an audit of data, error cost, and world-stability — not a verdict on capability. Partial failure of this principle looks exactly like Google Flu Trends — a capable system, validated by curve-matching, drifting silently because nobody owned the question of whether its data-generating process would stay stable. The principle fails quietly, which is what makes it dangerous: there is rarely an alarm, only a slow divergence from reality.
            </p>
            <p>
              For an AI PM, this changes three decisions. First, replace "can we use AI?" with a written feasibility audit — representativeness, freshness, stability, error cost — and require a candidate feature to land in PAIR's "probably better" column before any model work. Second, make the heuristic the benchmark, not the placeholder: if you cannot state the marginal value AI adds over a transparent rule net of data liability, the analysis is unfinished. Third, write v1 as a reward function and an operating point with monitored thresholds, defaulting to augmentation in high-stakes domains.
            </p>
            <p>
              For a future CTO, the principle informs platform and governance design. Someone must own distribution-stability monitoring as infrastructure, not as a per-feature afterthought — the Flu Trends failure was an org failure as much as a model one, because no standing function watched the input distribution. The build-versus-buy and platform-abstraction choices that follow should make "detect that the world moved" a first-class capability of the ML platform.
            </p>
            <p>
              The most important unresolved question this case does not answer: as foundation models make it trivial to <em>start</em> with AI on almost any problem, how should an organization re-gate feasibility when the cheapest path is now to ship AI first? The data barrier that Rule #1 guarded is falling — but the error-cost and stability gates remain, and the discipline to apply them gets harder, not easier, when starting with AI is the path of least resistance.
            </p>

            <ForwardLookingQuestion qData={QUESTIONS.q14} state={questionState.q14} onAnswer={handleForwardLookingAnswer} onConfidence={handleConfidence} onRetry={handleRetry} />
            <FreeTextQuestion qData={QUESTIONS.q15} state={questionState.q15} onSubmitFreeText={handleSubmitFreeText} onConfidence={handleConfidence} />

            <NavigationGuide />

            {/* Sources */}
            <div style={{ marginTop: 40, padding: 16, background: "#f8fafc", borderRadius: 8, fontSize: 13 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Sources</div>
              {[
                { name: "Google for Developers — Rules of Machine Learning (Zinkevich)", url: "https://developers.google.com/machine-learning/guides/rules-of-ml", tier: "FACT", use: "Rule #1 (don't be afraid to launch without ML; heuristic ≈ 50%), Rule #3, Rule #8 (freshness), Rule #10 (6-month stale table, +2% on refresh). Updated Aug 2025." },
                { name: "Google PAIR — People + AI Guidebook", url: "https://pair.withgoogle.com/guidebook/", tier: "FACT", use: "'When AI is / is not probably better' lists; automation vs augmentation; reward function and precision/recall cost-of-errors; success-metric threshold template. User Needs + Data chapters." },
                { name: "Lazer, Kennedy, King & Vespignani — 'The Parable of Google Flu' (Science, 2014)", url: "https://www.science.org/doi/10.1126/science.1248506", tier: "FACT", use: "GFT overestimated 100 of 108 weeks; ~11% vs CDC ~6% at 2012–13 peak; >50% overshoot 2011–12; static model / drifting inputs." },
                { name: "RAND — The Root Causes of Failure for AI Projects (2024)", url: "https://www.rand.org/pubs/research_reports/RRA2680-1.html", tier: "FACT", use: ">80% of AI projects fail, ~2× the non-AI IT rate; root causes: misunderstood problem, inadequate data, tech-chasing (qualitative)." },
                { name: "Sculley et al. — Hidden Technical Debt in Machine Learning Systems (NeurIPS 2015)", url: "https://papers.nips.cc/paper/5656-hidden-technical-debt-in-machine-learning-systems", tier: "FACT", use: "ML-specific risk factors: entanglement, unstable data dependencies, undeclared consumers — the data-stability feasibility trap." },
              ].map((s, i) => (
                <div key={i} style={{ marginBottom: 8, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <span style={{ padding: "1px 6px", borderRadius: 3, background: "#d1fae5", color: "#065f46", fontSize: 10, fontWeight: 600, flexShrink: 0 }}>{s.tier}</span>
                  <div>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>{s.name}</a>
                    <span style={{ color: "#6b7280" }}>  — {s.use}</span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 10, fontSize: 11, color: "#9ca3af" }}>
                Provenance tiers: FACT = measured value confirmed at the cited source. ESTIMATE = derived by stated arithmetic from FACTs. ILLUSTRATION = synthetic teaching values, never used in a scored answer key.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
