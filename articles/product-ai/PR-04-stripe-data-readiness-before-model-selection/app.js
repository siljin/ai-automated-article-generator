// Type 1 — AI Feasibility & Technical Scoping: "Data Readiness Before Model Selection" (Stripe)
// app.js — readable source copy. The same code is inlined in index.html.
// Regenerated to current TPI spec: free navigation, no confidence rating,
// two-attempt scaffolding, two interpretation questions per chart (values always visible),
// per-section glossary, calibration that names the reasoning error, cross-artifact warm-up
// drawn only from articles completed before this one (Phase 0 Spine + Google Type 1).

const { useState, useEffect } = React;
const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, ReferenceLine } = Recharts;

const CASE_NAME = "Stripe";

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

// ─── CROSS-ARTIFACT STATE (only articles completed BEFORE this one) ───────────
// PR-04 was preceded by exactly two artifacts: the Phase 0 Lifecycle Spine (Shopify,
// 2026-06-23) and "When Not to Use AI" (Google, 2026-06-23). Warm-up draws only from these.

const PRIOR_ARTICLES = [
  {
    slug: "when-not-to-use-ai",
    title: "When Not to Use AI (Google) — Type 1",
    lifecycle: "Feasibility",
    principle: "Feasibility is not 'can AI do this?' but 'does AI beat a transparent heuristic once the cost of a wrong answer is priced in?' — start with the simplest thing that could work and make AI earn the incremental value.",
  },
  {
    slug: "when-not-to-use-ai",
    title: "When Not to Use AI (Google) — Type 1",
    lifecycle: "Feasibility",
    principle: "An AI feature is only as feasible as its data is representative, fresh, and stable — data readiness is both a precondition and a continuous property, and degradation is usually silent.",
  },
  {
    slug: "ai-product-lifecycle-spine",
    title: "AI Product Lifecycle Spine (Shopify) — Phase 0",
    lifecycle: "Feasibility → Scale",
    principle: "The most expensive AI product mistakes are made in the early phases (Feasibility, Design) and discovered late (Scale) — by which point the fix is a re-architecture, not an edit.",
  },
];

const WARMUP_QUESTIONS = [
  {
    id: "wu1",
    text: "A payments startup wants to auto-approve customer refund requests with an AI model. Applying the principle that feasibility is a 'does AI beat a transparent heuristic once error cost is priced in?' question — not a capability question — what should the team establish before choosing any model, and what is the cheapest v1 that could work?",
    principle: PRIOR_ARTICLES[0].principle,
    source: PRIOR_ARTICLES[0].title,
    lifecycle: PRIOR_ARTICLES[0].lifecycle,
  },
  {
    id: "wu2",
    text: "A recommender was trained on last year's catalog and traffic, and quietly keeps serving. Applying the principle that data readiness is a continuous property and decay is silent, what is the real risk of 'set it and forget it,' and when does the loss first become visible?",
    principle: PRIOR_ARTICLES[1].principle,
    source: PRIOR_ARTICLES[1].title,
    lifecycle: PRIOR_ARTICLES[1].lifecycle,
  },
  {
    id: "wu3",
    text: "Name one Feasibility-phase decision about data or labels whose cost stays invisible until a system is at Scale. Apply the principle that early mistakes are discovered late.",
    principle: PRIOR_ARTICLES[2].principle,
    source: PRIOR_ARTICLES[2].title,
    lifecycle: PRIOR_ARTICLES[2].lifecycle,
  },
];

// ─── CHART DATA ───────────────────────────────────────────────────────────────

// Base-rate accuracy trap. FACT anchor: online card fraud ~1 in 1,000 transactions
// (ByteByteGo 2026, citing Stripe Engineering). "Approve everything" accuracy = 99.9% (derived).
const BASE_RATE_DATA = [
  { cat: "'Approve everything' accuracy", value: 99.9, fill: "#6366f1" },
  { cat: "Fraud actually caught by it", value: 0, fill: "#ef4444" },
];

// Network data advantage. FACT anchor: 90% of cards on the Stripe network have been
// seen more than once across different merchants (Stripe Engineering).
const NETWORK_DATA = [
  { cat: "A single merchant's view of a card", value: 18, fill: "#cbd5e1" },
  { cat: "Stripe network: cards seen >once across merchants", value: 90, fill: "#6366f1" },
];

// Drift / freshness. FACT anchor: retraining the same model on fresh data (identical
// features + architecture) improves recall by up to ~0.5 percentage points per month
// (Stripe Engineering). Two paths over 12 months, indexed to month 0 recall = 100.
const DRIFT_DATA = [
  { m: 0,  noRetrain: 100.0, retrain: 100.0 },
  { m: 2,  noRetrain: 99.0,  retrain: 101.0 },
  { m: 4,  noRetrain: 98.0,  retrain: 102.0 },
  { m: 6,  noRetrain: 97.2,  retrain: 103.0 },
  { m: 8,  noRetrain: 96.5,  retrain: 104.0 },
  { m: 10, noRetrain: 96.0,  retrain: 105.0 },
  { m: 12, noRetrain: 95.6,  retrain: 106.0 },
];

// Precision/recall operating-point tradeoff — structural ILLUSTRATION curve.
// FACT anchors used in prose/markers: 33% of consumers abandon after one false decline;
// food-delivery ~$2 profit/order, one fraud ≈ 19 lost orders; SaaS ~$200/mo subscriber.
const PR_CURVE_DATA = [
  { recall: 20, precision: 99 },
  { recall: 40, precision: 96 },
  { recall: 60, precision: 90 },
  { recall: 75, precision: 82 },
  { recall: 88, precision: 68 },
  { recall: 96, precision: 47 },
];

// Foundation-model payoff. FACT anchor: card-testing detection at large merchants went
// from 59% to 97% overnight with no increase in false positives (Stripe Sessions 2025).
const FM_DATA = [
  { cat: "Prior specialized model (≈2-yr effort)", rate: 59, fill: "#cbd5e1" },
  { cat: "Payments Foundation Model", rate: 97, fill: "#6366f1" },
];

// What Broke — XGBoost removal. FACT anchors (Stripe Engineering via ByteByteGo 2026):
// naively dropping XGBoost would cost ~1.5 pp of recall; Shield NeXt recovered recall AND
// cut training time by >85% (to under 2 hours). Indexed to Wide & Deep = 100.
const XGB_DATA = [
  { metric: "Recall (Wide&Deep = 100)",        naive: 98.5, shield: 100 },
  { metric: "Training time (Wide&Deep = 100)", naive: 100,  shield: 15 },
];

// ─── ARCHITECTURE ERAS (Stripe fraud-model evolution) ─────────────────────────

const ARCH_ERAS = [
  {
    era: "Logistic regression",
    unlock: "Shipped fraud scoring at all; transparent, fast, data-light.",
    anchor: "Stripe's first production fraud models (Stripe Engineering).",
  },
  {
    era: "Wide & Deep (XGBoost + DNN)",
    unlock: "Memorization (XGBoost) + generalization (DNN) ensemble; big accuracy jump.",
    anchor: "Each architecture jump produced an equivalent leap in performance (Stripe Engineering).",
  },
  {
    era: "Shield NeXt (ResNeXt-inspired, DNN-only)",
    unlock: "Dropped XGBoost to unlock transfer learning + embeddings; training time cut >85% to <2 hrs.",
    anchor: "Removing XGBoost risked −1.5 pp recall, recovered in Shield NeXt (Stripe Engineering).",
  },
  {
    era: "Payments Foundation Model",
    unlock: "Self-supervised transformer over tens of billions of transactions; one embedding per charge.",
    anchor: "Card-testing detection at large merchants: 59% → 97% overnight, no FP increase (Stripe Sessions 2025).",
  },
];

// ─── CHART INTERPRETATION PROMPTS (exactly two per chart, two different kinds) ──
// Chart values are always visible. The reader submits an answer to BOTH prompts before
// each prompt's authored answer reveals. At least one prompt per chart is not a so-what.

const CHART_INTERP = {
  "base-rate": [
    {
      key: "p1", kind: "So-what / decision implication",
      prompt: "Given that an 'approve everything' model scores 99.9% accuracy here while catching 0% of fraud, what does this specific pattern imply about which target metric a fraud feature's feasibility should be judged on — and what does a PM audit first as a result?",
      authored: "When the positive class is ~1 in 1,000, accuracy is the wrong target — a do-nothing model hits 99.9% while catching zero fraud — so a fraud feature's feasibility must be framed as precision/recall on a rare, well-labeled class. That reframing makes the label-generating process (where do trustworthy fraud labels come from, how fast?) the first thing to audit, before any model is chosen.",
    },
    {
      key: "p2", kind: "Quantitative reasoning",
      prompt: "The blue bar shows 99.9% accuracy; the red bar shows 0% fraud caught. Using the ~1-in-1,000 base rate, derive where the 99.9% comes from and how many of the ~1,000 frauds (per 1,000,000 transactions) that classifier actually catches. What does the gap between the two bars represent?",
      authored: "Accuracy = 1 − (1/1,000) = 99.9%, because the do-nothing model is wrong only on the 1,000 fraudulent transactions per million. Its recall is 0% — it catches 0 of ~1,000 frauds. The gap between the bars is the entire quantity of interest: accuracy is inflated by the 999,000 easy true-negatives and hides that the model captures none of the rare class that matters.",
    },
  ],
  "arch-eras": [
    {
      key: "p1", kind: "So-what / decision implication",
      prompt: "Reading the four eras left to right, what does the sequence imply for how a PM should choose model ambition — and what is the risk of jumping straight to the most powerful architecture in the list?",
      authored: "Model selection is downstream of data readiness: Stripe could only reach for a foundation model after a decade of automatic labels and an 85%-faster training pipeline made tens-of-billions-scale training practical. A PM should sequence model ambition to data and infrastructure readiness; jumping to the fanciest architecture first spends effort on machinery the data cannot yet feed.",
    },
    {
      key: "p2", kind: "Qualitative / mechanism",
      prompt: "Why did each architecture only become feasible in this order — what underlying force made it impossible for Stripe to have started at Era 4 (the foundation model) on day one?",
      authored: "Each era is unlocked by a cumulative property, not a preference. The foundation model needs tens of billions of automatically-labeled transactions and a training pipeline fast enough to iterate on them — neither existed at Era 1. Automatic dispute/network labels had to accumulate for years, and the Shield NeXt migration had to cut training time >85% first. The mechanism is that readiness compounds: earlier eras generate the data and infra that make later eras possible.",
    },
  ],
  "network": [
    {
      key: "p1", kind: "So-what / decision implication",
      prompt: "Given that 90% of cards on the network have been seen more than once across different merchants while a single merchant sees only its own slice, what does this pattern imply about where the durable advantage in a fraud model actually lives — and what should a PM answer before any model bake-off?",
      authored: "The moat is the data-generating position, not the model: 90% cross-merchant card visibility is something a single merchant cannot reproduce by training a bigger model or collecting more of its own data. So feasibility for this feature is decided by 'do we sit where the labels are generated?' — a question a PM must answer before comparing architectures.",
    },
    {
      key: "p2", kind: "Causal / comparative",
      prompt: "The single-merchant bar (~18, illustrative) and the network bar (90%, a Stripe FACT) differ enormously. The cause is not model quality — so what causes the gap, and why can a lone merchant NOT close it by licensing a larger pre-trained model?",
      authored: "The gap is structural and positional: Stripe observes each card across millions of businesses, so cross-merchant patterns exist in its data by construction. A lone merchant observes only its own transactions, so those patterns are simply absent from its data — a larger model cannot manufacture ground truth it never sees. The cause of the gap is where each party sits in the data-generating process, not how good its algorithm is.",
    },
  ],
  "drift": [
    {
      key: "p1", kind: "So-what / decision implication",
      prompt: "Both lines use the identical model and features and differ only in data freshness, yet they diverge over the year. What does that isolation imply a PM must budget for at scoping time, and why is the falling line dangerous?",
      authored: "Because only freshness differs, the divergence isolates freshness as a continuous feasibility cost — a PM who fails to fund monthly retraining is choosing the falling line without seeing it fall, since drift is silent. Freshness is therefore a standing operating expense to budget at scoping time, not a launch-day checkbox.",
    },
    {
      key: "p2", kind: "Quantitative reasoning",
      prompt: "The two paths start identical at month 0. Using Stripe's reported figure of up to ~0.5 percentage points of recall gained per month from fresh data alone, estimate the recall the 'no-retrain' path leaves on the table by month 12, and state whether that is a floor or a ceiling.",
      authored: "Forgone recall ≈ 0.5 pp/month × 12 ≈ 6 percentage points over the year. That is a ceiling, not a floor: the 0.5 pp/month is a reported upper bound and the gain almost certainly diminishes as the easy drift is recaptured, so the real annual loss is likely somewhat under 6 pp. (The chart's index values are modeled ESTIMATE to show the widening gap; the 0.5 pp/month is the FACT anchor.)",
    },
  ],
  "pr-curve": [
    {
      key: "p1", kind: "So-what / decision implication",
      prompt: "Reading this curve for a $2-margin food-delivery merchant versus a $200/month SaaS merchant, what does the shape imply about whether one global threshold can serve both — and what, then, is the real content of a v1 'spec'?",
      authored: "You cannot maximize precision and recall at once, so a single global threshold cannot be right for both: the thin-margin merchant fears the missed fraud (favor recall, upper-left → right), the high-LTV merchant fears the false decline (favor precision, stay left). The v1 'spec' is therefore the choice of operating point per user's error economics — which is why Stripe ships Radar as configurable, not as one accuracy number.",
    },
    {
      key: "p2", kind: "Qualitative / mechanism",
      prompt: "Why can't a merchant simply operate at the top-right of this curve (high precision AND high recall at once)? What mechanism forces the tradeoff, and what would 'a better model' actually change about this picture?",
      authored: "For a fixed model, a single score threshold sets both metrics: lowering it to catch more fraud (higher recall) necessarily flags more legitimate charges (lower precision), and vice versa — so you can only slide along the curve, not reach its corner. A better model shifts the entire curve up and to the right (more precision at every recall), but at any chosen operating point the tradeoff between the two error types still exists. The mechanism is the shared threshold on a single ranked score.",
    },
  ],
  "fm": [
    {
      key: "p1", kind: "So-what / decision implication",
      prompt: "The detection rate jumps from 59% to 97% with no increase in false positives. Given that a specialized model took ~2 years to reach 59%, what does this specific jump imply a PM should credit for the leap — the architecture, or something earlier?",
      authored: "The 59% → 97% jump is the payoff of sequencing model ambition to data readiness: the foundation model only outperformed a two-year specialized effort because tens of billions of automatically-labeled transactions already existed to pre-train on. The strategic lesson is to credit the data position, not the architecture — the model was the dividend of a compounding data advantage, not the source of it.",
    },
    {
      key: "p2", kind: "Causal / comparative",
      prompt: "The prior specialized model needed ~2 years to reach 59%; the foundation model reached 97% 'overnight' with no extra false positives. What does the word 'overnight' reveal about where the hard work actually happened, and why is attributing the jump mainly to 'the transformer architecture' a misread?",
      authored: "'Overnight' means almost none of the effort was in the new run itself — the heavy lifting was the decade of accumulated, labeled, contextualized transactions and the embedding pipeline that the transformer could pre-train on. Attributing the jump to the architecture is a causation misread (and a survivorship trap): swap the same architecture onto a company without the label stream and it cannot reproduce the result. The architecture was the last, cheapest step; the data position was the cause.",
    },
  ],
  "xgb": [
    {
      key: "p1", kind: "So-what / decision implication",
      prompt: "The bars show Shield NeXt matching Wide & Deep on recall while collapsing training time, whereas naively dropping XGBoost would have cost recall. What does this pattern imply about how a PM should value a high-performing legacy component that blocks future capability?",
      authored: "A locally-optimal component can be a global constraint: XGBoost was adding ~1.5 pp of recall yet blocking the architecture's future (transfer learning, embeddings, fast retraining). The right call was to value future iteration speed — the 85% training-time cut that later enabled foundation-model work — over a point-in-time accuracy gain, and to migrate only after replicating the lost recall inside the new architecture.",
    },
    {
      key: "p2", kind: "Quantitative reasoning",
      prompt: "From the indexed bars, by roughly what percentage did Shield NeXt cut training time versus Wide & Deep, and how much recall (in index points) would the naive XGBoost-drop have sacrificed? What do those two numbers together justify?",
      authored: "Training time fell from index 100 to 15 — about an 85% cut (to under two hours). The naive drop would have lost ~1.5 index points of recall (98.5 vs 100), which Shield NeXt recovered. Together the numbers justify the migration discipline: a large, durable gain in iteration speed is worth pursuing, but only after the ~1.5 pp recall regression is replicated — never by shipping the regression to get the speed.",
    },
  ],
};

// ─── PER-SECTION GLOSSARY (new terms introduced on each section) ───────────────

const GLOSSARY = {
  2: [
    { term: "Base rate", def: "How common the thing you are predicting is in the population — here, ~1 fraud per 1,000 transactions." },
    { term: "Precision", def: "Of the transactions the model flags as fraud, the share that really are fraud." },
    { term: "Recall", def: "Of all the truly fraudulent transactions, the share the model actually catches." },
    { term: "Ground-truth label", def: "A confirmed correct answer used to train or grade a model — for Stripe, a disputed charge confirms 'this was fraud.'" },
    { term: "Radar", def: "Stripe's fraud-detection product, built into the payment flow." },
    { term: "XGBoost", def: "A popular gradient-boosted-trees algorithm; strong at memorizing specific patterns." },
    { term: "DNN (deep neural network)", def: "A layered model good at generalizing to patterns it has not seen exactly before." },
    { term: "Wide & Deep", def: "An ensemble that combines a memorizing component (XGBoost) with a generalizing one (a DNN)." },
    { term: "Foundation model", def: "A large model pre-trained on huge amounts of data that can then be adapted to specific tasks." },
  ],
  3: [
    { term: "Data-generating process", def: "The real-world mechanism that produces your data and labels — who sees what, how outcomes get recorded." },
    { term: "Embedding", def: "A learned list of numbers that places an item (a merchant, a bank, a country) in space so that similar items sit close together." },
    { term: "Transfer learning", def: "Reusing what a model learned in one place (e.g., Brazil) to help in another (e.g., the US) without retraining from scratch." },
  ],
  4: [
    { term: "Model drift", def: "The silent decay of a model's accuracy over time as the world it predicts keeps changing." },
    { term: "Freshness", def: "How up-to-date the training data is; here, retraining on recent data alone lifts recall." },
    { term: "Representativeness", def: "Whether the training data reflects the real mix of users/segments the model will serve." },
    { term: "Percentage point (pp)", def: "An absolute difference between two percentages (going from 96% to 96.5% is +0.5 pp)." },
  ],
  5: [
    { term: "Operating point", def: "The specific spot on the precision/recall curve a system is tuned to — how aggressively it blocks." },
    { term: "Reward function", def: "The rule that tells an AI what counts as success or failure, including how much each error type costs." },
    { term: "LTV (lifetime value)", def: "The total revenue a customer is expected to bring over their whole relationship." },
    { term: "False decline", def: "Wrongly blocking a legitimate transaction; a survey found 33% of consumers abandon a business after one." },
    { term: "Self-supervised transformer", def: "A model that learns structure from unlabeled sequences (here, streams of transactions) without hand-labeled targets." },
  ],
  6: [
    { term: "Censored label", def: "An outcome you never get to observe because your own action prevented it — a blocked payment never completes, so its true status is unknown." },
    { term: "Counterfactual evaluation", def: "Statistical methods that estimate what would have happened to the transactions a model blocked, to recover the missing labels." },
    { term: "Selection bias (feedback loop)", def: "When a model's own past decisions determine which outcomes you can measure, biasing naive production metrics." },
    { term: "Shield NeXt", def: "Stripe's ResNeXt-inspired, DNN-only fraud architecture that replaced Wide & Deep and cut training time >85%." },
  ],
};

// ─── QUESTIONS ────────────────────────────────────────────────────────────────

const QUESTIONS = {
  // SECTION 3 — RQ1: Why the data-generating process is the binding constraint
  q1: {
    type: "T-B",
    text: "Chart 3 contrasts what one merchant can see about a card with what the Stripe network sees: 90% of cards on the network have already been seen more than once across different merchants. What does this gap most strongly imply for a feasibility decision about a fraud model?",
    options: [
      { id: "A", text: "Any company can match Stripe's fraud model simply by licensing a larger pre-trained model — the architecture is what matters." },
      { id: "B", text: "The 90% figure proves fraud is mostly repeat offenders, so a blocklist of known-bad cards would be sufficient." },
      { id: "C", text: "The binding feasibility constraint is the data-generating position, not the model: a single merchant lacks the cross-merchant ground truth that makes the prediction possible, so 'can a model do this?' is the wrong question — 'do we sit where the labeled data is generated?' is the right one." },
      { id: "D", text: "Because the network sees more data, a single merchant should simply collect more of its own transactions until it catches up." },
    ],
    correct: "C",
    hint: "Ask what a lone merchant structurally cannot observe no matter how good its model is — and whether more of its own data closes that gap.",
    authored_sowhat: "Feasibility here is decided by position in the data-generating process, not by model choice. 90% cross-merchant card visibility is something a single merchant cannot reproduce by training harder or collecting more of its own data — the labeled signal is generated by being the network. The model is downstream of that position.",
    distractors: {
      A: "Applying a classical 'better component = better system' assumption to AI: a larger model cannot manufacture cross-merchant ground truth it never sees. The moat is the data position, not the architecture.",
      B: "Misreads a level for a mechanism: '90% seen more than once' is about network visibility enabling features, not evidence that a static blocklist would catch evolving, high-velocity card-testing attacks.",
      D: "Base-rate/scale fallacy: a single merchant collecting more of its own transactions never gains the cross-merchant view; volume of the wrong data does not substitute for position.",
    },
    generalizes: "any AI feature whose feasibility depends on proprietary, automatically-labeled data — credit underwriting, ad click-fraud, marketplace trust, EHR outcomes",
  },
  q2: {
    type: "T-D",
    text: "Scaffolded Fermi. Online card fraud occurs in roughly 1 in 1,000 transactions. In a sample of 1,000,000 transactions, how many are fraudulent? (Decomposition supplied: total × base rate.) Enter the count.",
    unit: "fraudulent transactions (per 1,000,000)",
    toleranceNote: "±10% — direct arithmetic from one cited base-rate FACT, so the band is tight.",
    correctValue: 1000,
    correctValueLabel: "1,000 fraudulent transactions (and note: 'approve everything' would still score 99.9% accuracy)",
    tolerance: 0.1,
    decomposition: "Fraudulent count = 1,000,000 × (1 / 1,000) = 1,000. The trap: a model that approves every transaction is wrong only 1,000 times in 1,000,000 → 99.9% 'accuracy,' while catching 0% of fraud. That is why fraud feasibility is framed as precision/recall on a rare class, never as accuracy.",
    lowerBound: "If the true rate were 1 in 1,250 → 800 fraudulent.",
    upperBound: "If the true rate were 1 in 800 → 1,250 fraudulent.",
    keyAssumption: "The base rate is a population average; for some merchants or under a card-testing attack the local rate spikes far above 1-in-1,000, which is exactly when a globally-tuned threshold fails.",
    anchor: "ByteByteGo (2026), citing Stripe Engineering — online payment fraud ~1 in 1,000 transactions; <100 ms scoring on 1,000+ signals.",
    commonError: "base-rate neglect — being impressed by a 99.9% accuracy number without noticing it is exactly what a do-nothing classifier achieves on a 1-in-1,000 class.",
  },
  q3: {
    type: "T-C",
    isConsulting: true,
    text: "CASE: 'NestEgg,' a consumer robo-advisor, wants a v1 AI feature that predicts which clients are about to churn so success managers can intervene. Churn is only confirmed when a client fully withdraws — often months later — and it is rare. Leadership wants to pick a model this quarter. Using the data-readiness lens, what is the strongest recommendation?",
    options: [
      { id: "A", text: "Choose the most capable available model now; with modern architectures, churn prediction is a solved problem out of the box." },
      { id: "B", text: "Before selecting a model, audit the label-generating process: how often churn is truly observed, how delayed and rare the labels are, and whether a transparent heuristic (e.g., balance + login decay) can be instrumented now — because the binding constraint is whether NestEgg's product produces timely, representative churn labels, not which model is best." },
      { id: "C", text: "Collect one million more client records first, since every AI feature needs big data before it can work." },
      { id: "D", text: "Skip prediction entirely and email all clients monthly; AI is the wrong tool for retention." },
    ],
    correct: "B",
    hint: "Stripe's advantage was that labels arrive automatically and fast. Ask what NestEgg's equivalent label stream looks like before arguing about models.",
    authored_sowhat: "Stripe's feasibility came from a label stream the product generates for free and fast. NestEgg's churn labels are delayed and rare, so the v1 decision is a label-readiness audit plus a transparent heuristic baseline — not a model bake-off. Model selection is the last step, gated by whether the data-generating process produces usable ground truth.",
    distractors: {
      A: "Capability optimism applied to a label-poor problem: a powerful model cannot learn from labels that arrive months late and rarely; readiness, not capability, is the gate.",
      C: "Volume fallacy: a million more records of mostly-unlabeled, slow-to-resolve churn does not fix label timeliness or rarity — more of the wrong data is not readiness.",
      D: "Over-correction: the feature is feasible as a heuristic-first augmentation; 'AI is the wrong tool entirely' confuses a label-readiness gap with an impossibility.",
    },
    weakest_link: "The recommendation creates value only if a transparent heuristic actually correlates with eventual churn well enough to act on while real labels accrue. If early signals (balance, logins) do not predict withdrawal, the heuristic baseline is empty and the team must invest in a faster label proxy first — so validate signal-to-churn correlation before committing.",
    generalizes: "any prediction problem where the outcome is rare and resolves slowly — medical relapse, loan default, enterprise renewal, hardware failure",
  },
  q4: {
    type: "T-F",
    text: "Pattern transfer. The principle from this section: the binding feasibility constraint is the data-generating process — AI is feasible where the product itself produces fresh, representative ground-truth labels as a byproduct. Apply it to a legal-tech startup that wants AI to auto-tag clauses in uploaded contracts. What would a PM check first, and what NEW failure mode appears here that did not appear in Stripe's fraud case?",
    minLength: 50,
    requirements: [
      "Name the principle accurately (data-generating position / automatic-label byproduct, not a capability question)",
      "Apply it non-trivially to contract clause-tagging (where do correct clause labels come from, and how fast/representative are they?)",
      "Name a failure mode specific to legal-tech and absent from Stripe fraud (e.g., labels require expensive expert annotation rather than arriving free from disputes; no automatic ground-truth feedback loop)",
    ],
  },

  // SECTION 4 — RQ2: What data readiness actually requires
  q5: {
    type: "T-B",
    text: "Chart 4 shows two recall paths over a year: one where the model is left alone and one where the same model is retrained on fresh data each month (Stripe reports up to ~0.5 pp recall gain per month from freshness alone). What does the divergence most strongly indicate about data readiness?",
    options: [
      { id: "A", text: "Retraining is cosmetic; the two paths are within noise and freshness does not matter." },
      { id: "B", text: "The gain proves the original model was broken and should be replaced with a new architecture." },
      { id: "C", text: "Once you retrain a model it is permanently fixed, so freshness is a one-time setup cost." },
      { id: "D", text: "Data readiness is a continuous property, not a launch-day checkbox: fraud patterns drift, so the same model silently loses recall unless fresh data flows in — freshness is a standing operating cost a feasibility audit must budget for, not a one-time gate." },
    ],
    correct: "D",
    hint: "Notice the 'no-retrain' line falls while the architecture is unchanged. What does that say about whether readiness is a one-time check?",
    authored_sowhat: "Both lines use the identical model and features — only the data freshness differs — yet they diverge by several points of recall over a year. That isolates freshness as a continuous feasibility property: the world (fraud behavior) moves, so 'ready at launch' decays into 'not ready' unless retraining is funded as standing infrastructure.",
    distractors: {
      A: "The divergence is the whole point: Stripe reports up to ~0.5 pp/month from freshness with no architecture change — that is signal, not noise.",
      B: "Single-cause overreaction: a recoverable freshness gain means maintenance was skipped, not that the model was broken; a new architecture would drift too.",
      C: "Applying a static-software assumption to an AI system: a retrained model starts drifting again immediately because the data-generating process keeps moving — freshness recurs.",
    },
    generalizes: "any model facing a non-stationary world — recommendations, pricing, demand forecasting, content moderation against adapting adversaries",
  },
  q6: {
    type: "T-D",
    text: "Open Fermi. Stripe reports that retraining the same model on fresh data — identical features and architecture — improves recall by up to ~0.5 percentage points per month. If a team paused retraining for a full year, estimate the recall (in percentage points) they would leave on the table. Name your decomposition before entering the number.",
    unit: "percentage points of recall (upper bound, over 12 months)",
    toleranceNote: "±10% — arithmetic from one cited monthly-rate FACT; treat it as an upper bound.",
    correctValue: 6,
    correctValueLabel: "≈ 6 pp (0.5 pp/month × 12 months) — an upper bound, since the rate likely diminishes",
    tolerance: 0.1,
    decomposition: "Forgone recall ≈ monthly freshness gain × months = 0.5 pp × 12 = 6 pp. This is an upper bound: the 0.5 pp/month is a reported maximum and gains likely diminish as the easy drift is recaptured.",
    lowerBound: "If freshness contributed only ~0.3 pp/month → ~3.6 pp over the year.",
    upperBound: "If the full ~0.5 pp/month held and compounded slightly → ~6 pp or a touch more.",
    keyAssumption: "The single most important assumption is that the 0.5 pp/month rate is sustained and additive; in reality it is a reported ceiling and the true figure is almost certainly lower — which is why it is scored as an upper bound.",
    anchor: "Stripe Engineering (via ByteByteGo, 2026) — retraining on fresh data with identical features/architecture lifts recall by up to ~0.5 pp per month.",
    commonError: "treating 'up to 0.5 pp/month' as a guaranteed, compounding constant rather than a reported upper bound that almost certainly overstates the annual total.",
  },
  q7: {
    type: "T-F",
    text: "Pattern transfer. The principle from this section: data readiness is continuous — labels drift, distributions shift per segment, and acting on the model can censor the labels you need to keep measuring it. Apply it to a content-moderation classifier at a social platform. What would a PM monitor after launch, and what failure mode is new relative to Stripe's freshness/retraining example?",
    minLength: 50,
    requirements: [
      "Name the principle accurately (continuous readiness + label feedback, not a one-time data check)",
      "Apply it non-trivially to content moderation (e.g., adversaries adapt to evade the classifier, shifting the input distribution deliberately)",
      "Name a failure mode new vs. Stripe's gradual drift (e.g., adversarial, intentional distribution shift, or removed content erasing the signal of its own harm — not just slow staleness)",
    ],
  },

  // SECTION 5 — RQ3: Scoping v1 under probabilistic uncertainty
  q8: {
    type: "T-B",
    text: "Chart 5 shows the precision/recall tradeoff. Consider two Stripe merchants: a food-delivery business earning ~$2 profit per order (a single fraud can wipe out the profit from ~19 legitimate orders), and a SaaS business with a ~$200/month subscriber whose lifetime value is large. Reading the curve, where should each operate, and what does that reveal about scoping an AI feature?",
    options: [
      { id: "A", text: "Both should sit at maximum precision; blocking a real customer is always the worst outcome regardless of margins." },
      { id: "B", text: "The food-delivery merchant should favor recall (block aggressively, accept more false positives) because a missed fraud is devastating on thin margins, while the SaaS merchant should favor precision (approve generously) because a wrongly blocked high-LTV subscriber costs far more than an occasional fraud — so the v1 'spec' is an operating point chosen by each user's error economics, not one global accuracy target." },
      { id: "C", text: "Both should sit at the mathematical midpoint of the curve, since a balanced threshold is the safest default." },
      { id: "D", text: "Precision and recall are independent, so a big enough model lets both merchants maximize both at once." },
    ],
    correct: "B",
    hint: "The two merchants face opposite costs of being wrong. Ask whether one threshold can be right for both — and who should choose it.",
    authored_sowhat: "The same model serves opposite economics: a thin-margin merchant fears the missed fraud (favor recall), a high-LTV merchant fears the false decline (favor precision). The v1 specification is therefore the choice of operating point per customer, which is why Stripe shipped Radar as configurable rather than as one global threshold. Scoping an AI feature is choosing where on the error curve to sit, not chasing a single accuracy number.",
    distractors: {
      A: "Inverts the cost structure for the thin-margin case: there, the missed fraud is the expensive error, so maximizing precision (and missing fraud) is exactly wrong.",
      C: "There is no context-free 'safe' midpoint — the right point is set by which error costs that specific merchant more; symmetry is not safety.",
      D: "Applies a classical assumption to AI: precision and recall trade off along a fixed curve; a bigger model shifts the curve but never removes the tradeoff at a given operating point.",
    },
    generalizes: "spam filtering, medical screening, KYC checks, ad moderation — any system where the two error types carry asymmetric, customer-specific cost",
  },
  q9: {
    type: "T-D",
    text: "Chart 6 / numeric. Stripe's Payments Foundation Model lifted card-testing detection at large merchants from 59% to 97% overnight. By what FACTOR did the detection rate improve (relative)? Enter the multiple (e.g., 1.5).",
    unit: "× (multiple of the prior detection rate)",
    toleranceNote: "±10% — direct arithmetic from two cited FACTs.",
    correctValue: 1.64,
    correctValueLabel: "≈ 1.64× (97 ÷ 59), i.e. a ~64% relative increase, or +38 percentage points",
    tolerance: 0.1,
    decomposition: "Improvement factor = new ÷ old = 97 ÷ 59 ≈ 1.64×. Equivalently a 64% relative increase, or +38 percentage points of absolute detection. All three describe the same jump in different units.",
    lowerBound: "Using 95% vs 60% → ~1.58×.",
    upperBound: "Using 97% vs 55% → ~1.76×.",
    keyAssumption: "The 59% and 97% are detection rates on card-testing attacks at large merchants specifically — not Stripe's overall fraud catch rate — and the gain came with no reported increase in false positives.",
    anchor: "Stripe Sessions 2025 / Gautam Kedia (Stripe Applied ML), May 2025 — card-testing detection at large merchants 59% → 97% overnight, no FP increase.",
    commonError: "percentage-points-vs-multiple confusion — reporting 38 ('points') or 38% instead of dividing 97 ÷ 59 to get the 1.64× factor the question asks for.",
  },
  q10: {
    type: "T-C",
    isConsulting: true,
    text: "CASE: 'Sentry Health,' a hospital software vendor, wants a v1 AI feature that flags ICU patients at risk of sepsis. Leadership wants v1 to auto-page the rapid-response team whenever risk crosses a threshold. The model is right ~90% of the time. Using Stripe's probabilistic-scope guidance, what is the strongest v1 recommendation, and what is the load-bearing assumption?",
    options: [
      { id: "A", text: "Ship autonomous auto-paging now; 90% accuracy clears the bar and speed saves lives." },
      { id: "B", text: "Cancel the feature; 90% is too low for clinical use and AI is the wrong tool." },
      { id: "C", text: "Spend a year reaching 99% before shipping anything, since clinical settings demand near-perfection." },
      { id: "D", text: "Ship v1 as high-recall decision support that surfaces risk to clinicians (not autonomous paging), pick the operating point by error cost (a missed sepsis case vs. alarm noise), and monitor an alert-acceptance threshold — the load-bearing assumption is that clinicians keep trusting the alerts; if false alarms cause alert fatigue, recall-heavy tuning collapses into ignored alarms." },
    ],
    correct: "D",
    hint: "Stripe chose an operating point by error economics and watched a downstream behavioral threshold. What is the clinical equivalent of 'merchants ignoring the model'?",
    authored_sowhat: "As with Stripe's merchants, the v1 spec is an operating point chosen by error cost plus a monitored threshold — here favoring recall (don't miss sepsis) while watching clinician alert-acceptance. The load-bearing assumption is behavioral: high recall only helps if clinicians keep acting on alerts. If false positives breed alert fatigue, the intended benefit evaporates — so the acceptance rate is the metric to monitor, exactly as Stripe monitors per-merchant block rates.",
    distractors: {
      A: "Treats a probabilistic output as deterministic in a high-stakes setting: 90% right means 10% wrong on life-critical pages; PAIR-style guidance says augment, not automate, when stakes are high.",
      B: "Over-correction: the feature is feasible as decision support; 'wrong tool entirely' confuses the wrong scope (autonomous paging) with impossibility.",
      C: "Perfect-before-launch ignores that the operating point and monitoring — not a precision target — are what make a probabilistic v1 safe; you learn the right threshold in supervised production, not by waiting.",
    },
    weakest_link: "Value depends entirely on clinicians continuing to trust and act on alerts. Push recall too high and precision falls; false alarms drive alert fatigue and clinicians mute the tool — so the alert-acceptance (override) rate is the assumption to instrument before expanding scope.",
    generalizes: "any high-stakes probabilistic v1 where a human is in the loop — fraud review queues, radiology triage, trust-and-safety escalation, autonomous-vehicle hand-offs",
  },
  q11: {
    type: "T-F",
    text: "Pattern transfer. The principle from this section: scope a v1 as a reward function plus a precision/recall operating point chosen by the user's error economics, and treat model selection (heuristic → ensemble → foundation model) as the LAST step, unlocked by data readiness. Apply it to an AI résumé-screening tool for a large employer. What would the v1 spec contain, and what failure mode is new relative to Stripe's fraud case?",
    minLength: 50,
    requirements: [
      "Name the principle accurately (reward + operating point + model-selection-last, not a deterministic feature spec)",
      "Apply it non-trivially to résumé screening (e.g., the reward proxy and where to sit on precision/recall given the cost of a wrongly rejected candidate)",
      "Name a failure mode new vs. Stripe fraud (e.g., optimizing a biased proxy reward bakes in discrimination with legal/fairness consequences — not merely a dollar loss)",
    ],
  },

  // SECTION 6 — What Broke
  q12: {
    type: "T-B",
    text: "Chart 7 shows the move off the Wide & Deep architecture. Naively dropping the XGBoost component would have cost ~1.5 pp of recall (an unacceptable regression), yet Stripe removed it anyway — after rebuilding its value in 'Shield NeXt,' which also cut training time by over 85%. What does this decision most strongly illustrate?",
    options: [
      { id: "A", text: "A locally-optimal component can be a global constraint: XGBoost was actively improving accuracy but blocking transfer learning, embeddings, and fast iteration — so the right call was to price the option value of future iteration speed, not just today's point accuracy, and only remove it once its 1.5 pp was replicated." },
      { id: "B", text: "XGBoost was simply a bad choice that never should have been used; removing it was overdue cleanup." },
      { id: "C", text: "Training-time reductions are irrelevant to model quality, so the 85% cut was a side benefit with no strategic value." },
      { id: "D", text: "Because the new model matched the old recall, the migration created no value and was wasted effort." },
    ],
    correct: "A",
    hint: "Why remove something that was helping accuracy? Look at what it was preventing the team from doing next.",
    authored_sowhat: "XGBoost was improving recall (removing it cost 1.5 pp) yet was incompatible with transfer learning, embeddings, and fast retraining. Keeping the locally-optimal component would have frozen the architecture's future. The discipline is to value iteration speed and future capability — the 85% training-time cut enabled the data-scaling and foundation-model work — not just the current accuracy number, and to migrate only after replicating the lost recall.",
    distractors: {
      B: "Hindsight bias: XGBoost delivered real, measurable recall for years; calling it 'simply bad' rewrites a sound past decision that later became a constraint.",
      C: "Misses the mechanism: the 85% training-time cut is what made larger data scaling and the foundation-model direction practical — speed was strategic, not cosmetic.",
      D: "Confuses point-in-time parity with option value: matching recall while unlocking embeddings, transfer learning, and 10×–100× data scaling is exactly the value created.",
    },
    generalizes: "any platform migration where a high-performing legacy component blocks future capability — monolith-to-services, a fast custom store that blocks a needed abstraction, a feature that pins you to an old model",
  },
  q13: {
    type: "T-B",
    text: "Failure-case question. Once Radar blocks a transaction, the payment never completes — so its true status (would it have been fraud or a good sale?) is never observed. Which design assumption, held as uncontroversial, does this 'censored label' problem break, and why is it the dangerous one for a feasibility audit?",
    options: [
      { id: "A", text: "The assumption that production labels are exogenous — i.e., that you can simply measure precision/recall from observed outcomes. Acting on the model censors the outcomes of everything it blocks, so naive production metrics are biased by the model's own past decisions; without counterfactual evaluation, a model can look fine on completed payments while quietly degrading on the blocked population." },
      { id: "B", text: "The assumption that the model's code had no bugs — fixing the code would resolve the measurement gap." },
      { id: "C", text: "The assumption that the team picked the wrong model architecture — a different model would observe the missing outcomes." },
      { id: "D", text: "The assumption that there was enough total data — collecting more transactions would reveal the blocked outcomes." },
    ],
    correct: "A",
    hint: "The model's own action removes the data you'd use to grade it. Which assumption about where labels come from does that violate?",
    authored_sowhat: "The uncontroversial-but-wrong assumption is that labels are exogenous — that you can read precision/recall straight from observed outcomes. But the act of blocking censors those outcomes, so production metrics are biased by the model's own decisions (a selection-bias feedback loop). Stripe had to build proprietary counterfactual evaluation to estimate what blocked payments would have done. This is a data-readiness assumption that fails only after deployment — the most expensive place to discover it.",
    distractors: {
      B: "Scope-creep misdiagnosis: this is not a code bug; even bug-free code cannot observe an outcome the system prevented from happening.",
      C: "Single-cause fallacy: no architecture observes counterfactual outcomes of blocked transactions; the gap is structural, not a model choice.",
      D: "Base-rate/volume fallacy: more total data does not reveal the censored outcomes of blocked transactions — they are unobserved by construction, not merely rare.",
    },
    generalizes: "any system that acts on its own predictions — lending (rejected applicants never reveal repayment), hiring (rejected candidates never reveal performance), predictive policing, A/B-gated rollouts",
  },

  // CONCLUSION — T-E (present + 2027) and final T-F
  q15: {
    type: "T-E",
    textPresent: "Present-day (2026). You are the first PM for AI at a vertical SaaS company with five years of operational data. The CEO wants 'a foundation model like Stripe's.' Applying Stripe's feasibility discipline, what is the single most important thing to do in the next six months?",
    optionsPresent: [
      { id: "A", text: "Begin pre-training a transformer on all company data immediately, because the foundation-model approach is what delivered Stripe's results." },
      { id: "B", text: "Audit the data-generating process first: identify which outcomes the product labels automatically (and how fresh/representative they are), ship the highest-readiness use case as a heuristic or simple-model v1 at an explicit operating point, and reserve heavier models for where the readiness audit shows the labels can support them." },
      { id: "C", text: "Announce the foundation model to customers now and figure out the data and labels afterward." },
      { id: "D", text: "Hire a large ML research team before doing any feasibility or data work, since talent is the constraint." },
    ],
    correctPresent: "B",
    text2027: "2027 variant. Foundation models now offer much longer context, far cheaper inference, and strong few-shot performance, so a capable v1 can be stood up with little task-specific data. Given the SAME business constraints, what changes — and which load-bearing assumption does the 2027 version replace?",
    options2027: [
      { id: "A", text: "Nothing changes; once base models are good enough, data readiness no longer matters." },
      { id: "B", text: "Skip evaluation and monitoring — better base models make label quality and drift analysis obsolete." },
      { id: "C", text: "The cold-start barrier (needing lots of task-specific labeled data to begin) falls, so the binding gate shifts from data volume to label quality, operating-point calibration, and the censored-label/feedback problem — you can START with a strong model, but whether your product generates trustworthy ground truth to tune and monitor it matters MORE, not less." },
      { id: "D", text: "Move every feature to fully autonomous agents, since cheaper inference removes the need for human-in-the-loop." },
    ],
    correct2027: "C",
    hint: "Ask which specific barrier better base models remove (cold-start data volume) and which they leave untouched or worsen (whether your own product generates trustworthy labels to tune and monitor against).",
    authored_sowhat: "Feasibility does not disappear as models improve — it moves. Cheap, capable base models dissolve the cold-start data-volume barrier, but label quality, operating-point calibration, drift, and the censored-label feedback problem become the binding gates. Stripe's edge was never just scale of data; it was that the product generates trustworthy, automatic labels. In 2027 that data-generating position is even more decisive, because everyone can rent the model but not the label stream.",
    falsification: "What would falsify the governing principle? If foundation models became so capable and self-correcting that they no longer needed product-generated ground truth to be tuned, monitored, or trusted — and if error costs stopped varying across users so a single global operating point was always right — then 'audit data readiness and error economics before selecting a model' would lose its force. Neither holds in 2026: models still need trustworthy labels to evaluate against, and error costs remain wildly asymmetric (the food-delivery vs. SaaS merchant).",
  },
  q16: {
    type: "T-F",
    text: "Final pattern transfer. The governing principle: model selection is the LAST decision — feasibility is gated by whether your data-generating process yields fresh, representative ground-truth labels as a byproduct, and whether the error is tunable to each user's economics. Apply it to a domain NOT covered in this article — an AI tool that detects crop disease from drone imagery for smallholder farms. What would a PM check at the Feasibility phase, and what failure mode would appear that did not appear in Stripe's payments case?",
    minLength: 50,
    requirements: [
      "Name the governing principle accurately (data-generating process + error economics gate model selection; model is last)",
      "Describe a non-trivial Feasibility-phase check for crop-disease detection (e.g., where do confirmed disease labels come from, how fast, and are they representative across regions/seasons?)",
      "Name a failure mode absent from Stripe payments (e.g., ground-truth labels require a scarce agronomist to confirm, strong seasonal non-stationarity, or the high cost of a wrong 'spray/don't-spray' call — not a free, instant dispute label)",
    ],
  },
};

// Ensure every question object carries its own id (keys are the ids).
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

function Glossary({ items }) {
  if (!items || !items.length) return null;
  return (
    <div style={{ margin: "24px 0 8px", padding: 16, background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
        Glossary — new terms on this page
      </div>
      {items.map((g, i) => (
        <div key={i} style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 6 }}>
          <strong style={{ color: "#1e293b" }}>{g.term}</strong>
          <span style={{ color: "#475569" }}> — {g.def}</span>
        </div>
      ))}
    </div>
  );
}

// ─── CHART WITH TWO INTERPRETATION QUESTIONS ──────────────────────────────────
// Chart values are ALWAYS visible. Beneath the chart sit exactly two interpretation
// prompts of two different kinds. The reader submits an answer to each prompt; only then
// does that prompt's authored answer render (conditional render — never in the DOM early).

function ChartInterpret({ chartId, title, provenance, children, state, onSubmit }) {
  const prompts = CHART_INTERP[chartId] || [];
  return (
    <div style={{ margin: "24px 0", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
        {provenance && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{provenance}</div>}
      </div>
      <div style={{ padding: 16 }}>
        {children}
        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 8, fontStyle: "italic" }}>
          All values above are shown. Answer both interpretation prompts below — each reveals its authored answer after you submit.
        </div>
        {prompts.map((p, i) => (
          <ChartPrompt key={p.key} index={i + 1} data={p}
            state={state && state[p.key]}
            onSubmit={(val) => onSubmit(chartId, p.key, val)} />
        ))}
      </div>
    </div>
  );
}

function ChartPrompt({ index, data, state, onSubmit }) {
  const [val, setVal] = useState((state && state.val) || "");
  const submitted = state && state.submitted;
  const canSubmit = val.trim().length >= 15;
  const kindColors = {
    "So-what / decision implication": "#6366f1",
    "Quantitative reasoning": "#0891b2",
    "Qualitative / mechanism": "#7c3aed",
    "Causal / comparative": "#c2410c",
  };
  const color = kindColors[data.kind] || "#6366f1";
  return (
    <div style={{ marginTop: 14, padding: 12, background: "#fbfdff", border: "1px solid #e5e7eb", borderRadius: 6 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
        Interpretation {index} · {data.kind}
      </div>
      <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 8, lineHeight: 1.55 }}>{data.prompt}</div>
      {!submitted && (
        <>
          <textarea value={val} onChange={e => setVal(e.target.value)} rows={2}
            style={{ width: "100%", boxSizing: "border-box", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, resize: "vertical" }}
            placeholder="Your interpretation (min 15 chars). The authored answer reveals after you submit." />
          <div style={{ fontSize: 11, color: "#9ca3af" }}>{val.length}/15 minimum</div>
          <button onClick={() => onSubmit(val)} disabled={!canSubmit}
            style={{ marginTop: 6, padding: "6px 16px", background: canSubmit ? color : "#d1d5db", color: "#fff", border: "none", borderRadius: 4, cursor: canSubmit ? "pointer" : "not-allowed", fontSize: 13 }}>
            Submit interpretation
          </button>
          {!canSubmit && <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 8 }}>Write at least 15 characters to enable Submit</span>}
        </>
      )}
      {submitted && (
        <div>
          <div style={{ padding: 10, background: "#eef2ff", borderRadius: 4, marginBottom: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 12, color: "#3730a3" }}>Your interpretation:</div>
            <div style={{ fontSize: 13 }}>{state.val || "(not entered)"}</div>
          </div>
          <div style={{ padding: 10, background: "#f0fdf4", borderRadius: 4, borderLeft: "3px solid #4ade80" }}>
            <div style={{ fontWeight: 600, fontSize: 12, color: "#166534" }}>Authored interpretation:</div>
            <div style={{ fontSize: 13, color: "#166534" }}>{data.authored}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── QUESTION COMPONENTS ───────────────────────────────────────────────────────

function MCQuestion({ qData, state, onAnswer, onRetry }) {
  const { id, text, options, correct, authored_sowhat, distractors, hint, generalizes, isConsulting, weakest_link } = qData;
  const { selectedOption, isCorrect, submitted, attemptCount, scaffoldingShown } = state || {};
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
              <div style={{ fontWeight: 600, marginBottom: 4, color: "#92400e" }}>Second attempt — hint &amp; scaffolding:</div>
              <div style={{ fontSize: 13, color: "#92400e", marginBottom: 6 }}>{hint || "Re-read the section's principle, then eliminate the option that confuses capability with feasibility, or a correlation with its cause."}</div>
              <div style={{ fontSize: 13, color: "#92400e" }}>
                Work it structurally: restate the principle for this section in one line, then ask of each option whether it respects that principle or violates it. The correct option is the one that treats the data-generating process (not the model) as the binding constraint, or that names the specific reasoning error the others commit.
              </div>
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
              <strong>Calibration:</strong>{" "}
              {isCorrect
                ? `Correct — this reasoning pattern generalizes to ${generalizes}.`
                : (distractors && selectedOption && distractors[selectedOption]
                    ? `Incorrect — the reasoning error was: ${distractors[selectedOption]}`
                    : "Incorrect — review the named reasoning error in the explanation above.")}
            </div>
            {!isCorrect && attemptCount < 2 && (
              <button onClick={() => onRetry(id)} style={{ marginTop: 8, padding: "6px 14px", background: "#f97316", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>
                Try again (unlocks a hint)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NumericQuestion({ qData, state, onSubmitNumeric }) {
  const [val, setVal] = useState("");
  const { submitted, isCorrect } = state || {};
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
              style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, width: 220 }}
              placeholder={`Enter in ${qData.unit}`} />
            <button onClick={() => onSubmitNumeric(qData.id, parseFloat(val))} disabled={val === ""}
              style={{ padding: "8px 16px", background: val !== "" ? "#6366f1" : "#d1d5db", color: "#fff", border: "none", borderRadius: 4, cursor: val !== "" ? "pointer" : "not-allowed", fontSize: 13 }}>
              Submit
            </button>
            {val === "" && <span style={{ fontSize: 12, color: "#9ca3af" }}>Enter a value to enable Submit</span>}
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
              <strong>Calibration:</strong> {isCorrect ? "Correct — within tolerance." : "Incorrect — outside tolerance."}
              {!isCorrect && qData.commonError && ` The most common reasoning error here is ${qData.commonError}`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FreeTextQuestion({ qData, state, onSubmitFreeText }) {
  const [val, setVal] = useState("");
  const { submitted } = state || {};
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
          {!canSubmit && <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 8 }}>Write at least {qData.minLength} characters to enable Submit</span>}
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
            {!selfEval.p2 && <div style={{ fontSize: 12, color: "#ef4444" }}>↑ Make sure your application is a genuinely new context, not a relabeling of Stripe's case.</div>}
            {!selfEval.p3 && <div style={{ fontSize: 12, color: "#ef4444" }}>↑ Make sure the failure mode you named does not already appear in Stripe's example.</div>}
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

function ForwardLookingQuestion({ qData, state, onAnswer, onRetry }) {
  const [activeVariant, setActiveVariant] = useState("present");
  const statePresent = state?.present || {};
  const state2027 = state?.["2027"] || {};
  const handleAnswer = (variant, optId, submit) => onAnswer(qData.id, variant, optId, submit);

  const renderOptions = (options, correct, currentState, variant) => {
    const { selectedOption, isCorrect, submitted, attemptCount, scaffoldingShown } = currentState;
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
                <div style={{ fontWeight: 600, color: "#92400e" }}>Second attempt — hint &amp; scaffolding:</div>
                <div style={{ fontSize: 13, color: "#92400e", marginBottom: 6 }}>{qData.hint}</div>
                <div style={{ fontSize: 13, color: "#92400e" }}>Separate what better base models remove (the cold-start data-volume barrier) from what they leave standing or worsen (label quality, operating-point calibration, and the censored-label feedback loop). The right option keeps feasibility alive but moves the binding gate.</div>
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
            {!isCorrect && (
              <div style={{ marginTop: 8, padding: 8, background: "#f0f9ff", borderRadius: 4, fontSize: 12 }}>
                <strong>Calibration:</strong> Incorrect — the likely reasoning error is treating better base models as removing feasibility work entirely, rather than moving the binding gate from data volume to label quality, calibration, and the feedback loop.
              </div>
            )}
            {variant === "2027" && qData.falsification && (
              <div style={{ marginTop: 8, padding: 10, background: "#fff7ed", borderRadius: 4, fontSize: 12, borderLeft: "3px solid #f97316" }}>
                <strong>Falsification clause:</strong> {qData.falsification}
              </div>
            )}
            {!isCorrect && attemptCount < 2 && (
              <button onClick={() => onRetry(`${qData.id}-${variant}`)} style={{ marginTop: 8, padding: "6px 14px", background: "#f97316", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13 }}>
                Try again (unlocks a hint)
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
      <div style={{ fontWeight: 700, color: "#7c3aed", marginBottom: 8 }}>Principle in one sentence (encouraged — never blocks navigation)</div>
      <div style={{ fontSize: 13, color: "#374151", marginBottom: 8 }}>
        State the transferable principle from this section — something a PM or CTO at a different company could apply tomorrow. (Min 20 chars. Not scored — producing it is the point. You may move to any other section at any time.)
      </div>
      {!submitted && (
        <>
          <textarea value={val} onChange={e => setVal(e.target.value)} rows={2}
            style={{ width: "100%", boxSizing: "border-box", padding: 8, border: "1px solid #d1d5db", borderRadius: 4, fontSize: 14, resize: "vertical" }} />
          <div style={{ fontSize: 11, color: "#9ca3af" }}>{val.length}/20 characters minimum</div>
          <button onClick={() => onSubmit(sectionId, val)} disabled={!canSubmit}
            style={{ marginTop: 8, padding: "8px 20px", background: canSubmit ? "#7c3aed" : "#d1d5db", color: "#fff", border: "none", borderRadius: 4, cursor: canSubmit ? "pointer" : "not-allowed" }}>
            Reveal the authored principle
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

// ─── WARM-UP SCREEN (cross-artifact retrieval; skippable, never gates) ─────────

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
          Spaced retrieval. Answer from memory before today's case. These test principles from your two prior Feasibility readings — the <strong>Phase 0 Lifecycle Spine</strong> (Shopify) and <strong>"When Not to Use AI"</strong> (Google) — in new contexts. There is no score, and you can skip. Skipping is noted in your learning summary.
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
        <button onClick={onComplete}
          style={{ padding: "12px 28px", background: "#6366f1", color: "#fff", border: "none", borderRadius: 6, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          Begin today's article →
        </button>
        <button onClick={onSkip}
          style={{ padding: "10px 18px", background: "transparent", color: "#6b7280", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, cursor: "pointer" }}>
          Skip warm-up
        </button>
        {!allDone && <span style={{ fontSize: 12, color: "#9ca3af" }}>You can begin or skip at any time — the warm-up never blocks.</span>}
      </div>
    </div>
  );
}

// ─── LEARNING SUMMARY ──────────────────────────────────────────────────────────

const AUTHORED_PRINCIPLES = {
  3: "The binding feasibility constraint for an AI feature is the data-generating process, not the model: AI is feasible where the product itself produces fresh, representative ground-truth labels as a byproduct — and that position, not the architecture, is the moat a competitor cannot copy.",
  4: "Data readiness is continuous, not a launch-day checkbox — labels drift, distributions shift per segment, and the act of acting on the model can censor the very labels you need to keep measuring it; budget for freshness and counterfactual evaluation at scoping time.",
  5: "Scope a v1 AI feature as a reward function and a precision/recall operating point chosen by each user's error economics — and treat model selection (heuristic → ensemble → foundation model) as the last step, unlocked by data readiness, not the first.",
};

function LearningSummary({ questionState, principleGates, score, totalQ, warmUpSkipped }) {
  const [insightVal, setInsightVal] = useState("");
  const [insightSubmitted, setInsightSubmitted] = useState(false);
  const [applyPresent, setApplyPresent] = useState("");
  const [apply2027, setApply2027] = useState("");
  const [applySubmitted, setApplySubmitted] = useState(false);

  // Reasoning-error recap: for each missed multiple-choice question, name the error committed.
  const missed = [];
  Object.entries(questionState).forEach(([qid, st]) => {
    if (st?.submitted && st.isCorrect === false) {
      const q = QUESTIONS[qid];
      const err = q && q.distractors && st.selectedOption && q.distractors[st.selectedOption];
      if (err) missed.push(`${qid}: ${err}`);
    }
  });

  return (
    <div style={{ padding: 24, background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 8, margin: "24px 0" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Learning Summary</h2>

      <div style={{ padding: 16, background: "#fff", borderRadius: 6, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Score: {Math.round(score * 10) / 10} / {totalQ} scorable questions</div>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>Pattern-transfer (T-F) questions are free-text and self-evaluated — the score reflects multiple-choice and Fermi questions only.</div>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Reasoning-error recap (what to review):</div>
        {missed.length === 0
          ? <div style={{ fontSize: 13, color: "#166534" }}>No missed multiple-choice questions recorded — or none answered yet.</div>
          : missed.map((c, i) => <div key={i} style={{ fontSize: 13, color: "#92400e", marginBottom: 4 }}>• {c}</div>)}
        {warmUpSkipped && <div style={{ fontSize: 13, color: "#b91c1c", marginTop: 8 }}>Warm-up skipped — {WARMUP_QUESTIONS.length} prior principles not reviewed before this session.</div>}
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
          You have seen Stripe's structural data advantage, its drift and censored-label traps, and the foundation-model payoff. Write the single most non-obvious insight you would defend to a skeptical CTO.
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
              "Stripe didn't win fraud detection by having a better model — it won by sitting in the payment flow, so ground-truth fraud labels arrive for free from disputes and card networks. The foundation model was the payoff of a decade of data readiness, not the source of the advantage.",
              "The most dangerous data-readiness trap is created by your own success: once a model acts (blocks a payment), it censors the outcome it would be measured on. Acting on predictions corrupts the labels — so 'we'll just measure it in production' is not a plan without counterfactual evaluation.",
              "Error cost, not accuracy, sets the v1 scope. The same model is 'block aggressively' for a $2-margin food-delivery merchant and 'approve generously' for a $200/mo SaaS subscriber — which is why Stripe shipped Radar as a configurable operating point, not one global threshold.",
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
            <div style={{ fontSize: 12, color: "#7c3aed", fontStyle: "italic", marginBottom: 8 }}>
              Pattern-transfer close: name one domain outside payments where this principle changes the model-selection decision, and the new failure mode it introduces.
            </div>
            <button onClick={() => setApplySubmitted(true)} disabled={applyPresent.length < 30 || apply2027.length < 30}
              style={{ padding: "10px 24px", background: (applyPresent.length >= 30 && apply2027.length >= 30) ? "#7c3aed" : "#d1d5db", color: "#fff", border: "none", borderRadius: 4, cursor: (applyPresent.length >= 30 && apply2027.length >= 30) ? "pointer" : "not-allowed", fontSize: 14 }}>
              Lock in Apply It answers
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
        This is the Feasibility phase, the same phase as "When Not to Use AI" (Google) — that article asked <em>whether</em> to use AI against a heuristic; this one asks <em>what must be true of your data</em> before you select a model. Upstream: the Phase 0 Spine and the Google Type 1. Downstream: Type 2 (Teardown) and Type 4 (AI-Native System Design), where data-readiness decisions become architecture.
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
  const [chartInterp, setChartInterp] = useState({});
  const [principleGates, setPrincipleGates] = useState({});
  const [activeSec, setActiveSec] = useState("sec-1");
  const [navWide, setNavWide] = useState(typeof window !== "undefined" ? window.innerWidth >= 1160 : true);

  const NAV = [
    { id: "sec-1", label: "1 · Introduction" },
    { id: "sec-2", label: "2 · Fraud-Detection Landscape" },
    { id: "sec-3", label: "3 · Data-Generating Process (RQ1)" },
    { id: "sec-4", label: "4 · Data Readiness (RQ2)" },
    { id: "sec-5", label: "5 · Scoping v1 (RQ3)" },
    { id: "sec-6", label: "6 · What Broke" },
    { id: "sec-summary", label: "Learning Summary" },
    { id: "sec-7", label: "7 · Conclusion" },
  ];

  const goToSection = (id) => {
    setActiveSec(id);
    setTimeout(() => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }, 40);
  };

  const totalScorableQ = 11; // q1,q2,q3,q5,q6,q8,q9,q10,q12,q13 + q15(0.5+0.5)

  // Chart interpretation: reader submits each of the two prompts; authored answer reveals then.
  const handleChartInterp = (chartId, key, val) => {
    setChartInterp(prev => ({
      ...prev,
      [chartId]: { ...(prev[chartId] || {}), [key]: { submitted: true, val } },
    }));
  };

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
  }, [warmUpDone, warmUpSkipped]);

  if (!warmUpDone && !warmUpSkipped) {
    return (
      <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: "#fff", color: "#111", minHeight: "100vh" }}>
        <WarmUpScreen onComplete={() => setWarmUpDone(true)} onSkip={() => setWarmUpSkipped(true)} />
      </div>
    );
  }

  // Progress reflects sections answered/produced, not gating (nothing is gated).
  const producedSections = [3, 4, 5].filter(sid => principleGates[sid]?.submitted).length;
  const progressPct = Math.round((producedSections / 3) * 100);

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: "#fff", color: "#111", minHeight: "100vh" }}>
      <ProgressBar pct={progressPct} />

      <div style={{ position: "sticky", top: 4, zIndex: 999, background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "10px 16px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 800, fontSize: 15 }}>Data Readiness Before Model Selection</span>
              <span style={{ padding: "2px 10px", background: "#8b5cf6", color: "#fff", borderRadius: 10, fontSize: 11, fontWeight: 700 }}>Type 1 · AI Feasibility &amp; Scoping</span>
              <span style={{ fontSize: 12, color: "#6b7280" }}>Stripe case study</span>
            </div>
            <LifecycleStrip activePhases={ACTIVE_PHASES} />
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Prev: Type 1 — When Not to Use AI (Google) · Next: Type 2 — AI Product Teardown</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#6366f1" }}>Score: {Math.round(score * 10) / 10}/{totalScorableQ}</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>Feasibility phase</div>
          </div>
        </div>
      </div>

      {navWide && (
        <nav style={{ position: "fixed", top: 118, left: 20, width: 210, maxHeight: "calc(100vh - 150px)", overflowY: "auto", zIndex: 900, paddingRight: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Sections (jump freely)</div>
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
            Model selection is the last decision in an AI feature, not the first. What gates feasibility is whether your data-generating process produces ground truth as a byproduct of the product itself — fresh, representative, and at scale — and whether the error you will make is tunable to each user's economics rather than a single right answer. Stripe built a transformer payments foundation model that lifted card-testing detection from 59% to 97% overnight — but only because a decade in the payment flow had already made its data ready: fraud labels arrive for free from disputes and card networks, 90% of cards are seen more than once across merchants, and the problem was always framed as a precision/recall operating point, not a yes/no verdict.
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.3, marginBottom: 16 }}>
            Data Readiness Before Model Selection:<br />
            <span style={{ color: "#8b5cf6" }}>How Stripe Earned the Right to Build a Payments Foundation Model</span>
          </h1>

          <div style={{ padding: "8px 14px", background: "#f3f4f6", borderRadius: 6, display: "inline-block", fontSize: 13, color: "#374151", marginBottom: 20 }}>
            <strong>Lifecycle position:</strong> Feasibility — the phase before Design. Upstream: Phase 0 Spine, Type 1 (Google) · Downstream: Type 2 (Teardown), Type 4 (AI-Native System Design)
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Section 1: Introduction</h2>

          <p>
            This article's thesis is that the order of operations in an AI feature is the opposite of the one most teams use. They start by choosing a model and then look for data to feed it. Stripe's record argues the reverse: the model is the last thing you choose, and the first thing you audit is whether your product generates trustworthy ground-truth labels on its own. Stripe is the right evidence for this because it is, by reputation, a place where the model could be anything — it has the talent and capital to build whatever architecture it wants — and yet the decisive advantage in its fraud system is not the architecture at all. It is where Stripe sits: inside the payment flow, where the outcome of every transaction eventually reports back for free.
          </p>

          <p>
            The scale at the time the case begins is worth stating plainly. Every transaction on a Stripe-powered business is scored by a machine-learned model that evaluates over 1,000 signals and returns a verdict in under 100 milliseconds, and online card fraud occurs in roughly 1 in 1,000 transactions.
            <Citation source="ByteByteGo, citing Stripe Engineering" year="2026" tier="FACT" />
            That rarity is the whole difficulty: the model must surface a tiny number of fraudulent payments from an overwhelming volume of legitimate ones, on every transaction, cheaply and instantly. Competitors approach the same problem with bought models and externally-labeled datasets; Stripe approaches it from a structural data position that none of them have.
          </p>

          <p>
            The structural gap conventional product thinking misses is this: in deterministic software, "can we build it?" usually implies "should we, and will it work?" In AI, those come apart. A model can be fully capable in a demo and still be the wrong choice — because the data behind it cannot be labeled at the rate the problem demands, because the cost of a confident wrong answer varies wildly across users, or because the act of deploying the model corrupts the data you would use to keep measuring it. Possible is not the same as feasible, and for AI the difference lives almost entirely in the data-generating process.
          </p>

          <p>
            This article addresses three questions. First, why is the data-generating process — not the model — the binding feasibility constraint, and what makes Stripe's position so hard to copy? Second, what does data readiness actually require beyond raw volume, and what are the hidden data-debt traps that pass a launch review and fail in production? Third, how do you scope a v1 AI feature under probabilistic uncertainty — as a reward function and an operating point rather than a deterministic spec — and how does data readiness unlock model selection, all the way up to a foundation model?
          </p>
        </div>

        {/* SECTION 2: Landscape */}
        <div id="sec-2" style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Section 2: The Fraud-Detection Landscape</h2>
          <p>
            Fraud detection is an unusually honest teacher of AI feasibility because its difficulty is not in the modeling — it is in the structure of the problem. The class is extreme: with fraud at roughly 1 in 1,000, a model that does nothing at all and approves every transaction is "right" 99.9% of the time. Accuracy, the metric most product teams reach for first, is actively misleading here. This is why every serious fraud system is framed from day one around precision and recall on the rare class, and why the feasibility conversation has to start with the data, not the algorithm.
          </p>
          <p>
            Against that backdrop, Stripe's first advantage is positional. Because Radar is built directly into the payment flow, it receives training labels automatically: when a cardholder disputes a charge, that dispute is the ground truth that the transaction was fraudulent, and it flows back from the card networks without anyone building a separate pipeline.
            <Citation source="Stripe Engineering (How we built Radar)" year="2023" tier="FACT" />
            Most third-party fraud vendors must ask merchants to send labels back manually — slow, incomplete, and error-prone. Stripe's labels are a byproduct of being where the money moves. That is a data-readiness advantage no model can manufacture.
          </p>

          <ChartInterpret
            chartId="base-rate"
            title="Chart 1 — The accuracy trap: why fraud feasibility starts with the data, not the model"
            provenance="FACT: online card fraud ~1 in 1,000 transactions (ByteByteGo 2026, citing Stripe Engineering). The 99.9% 'approve everything' accuracy is derived arithmetic (1 − 1/1000); the 0% fraud-caught bar is definitional for a do-nothing classifier."
            state={chartInterp["base-rate"]}
            onSubmit={handleChartInterp}
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={BASE_RATE_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cat" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={v => `${v}%`} />
                <Bar dataKey="value" name="Percent" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartInterpret>

          <p>
            Stripe's second advantage is that it treats model architecture as a sequence of upgrades earned by data and infrastructure, not as a one-time choice. Its fraud models began as logistic regression — transparent, fast, data-light — and each subsequent jump produced a roughly equivalent leap in performance: a "Wide &amp; Deep" ensemble combining XGBoost (memorization) with a deep neural network (generalization), then a ResNeXt-inspired, DNN-only architecture internally called Shield NeXt, and finally a self-supervised transformer foundation model trained on tens of billions of transactions.
            <Citation source="Stripe Engineering; Stripe Sessions" year="2025" tier="FACT" />
            The throughline is that each model became feasible only when the data and training infrastructure were ready for it — the architecture follows the readiness, not the other way around.
          </p>

          <ChartInterpret
            chartId="arch-eras"
            title="Chart 2 — Stripe's fraud-model eras: each architecture unlocked by data and infra readiness"
            provenance="FACT anchors (Stripe Engineering; Stripe Sessions 2025): Wide & Deep = XGBoost + DNN; Shield NeXt cut training time >85% to <2 hrs; Payments Foundation Model trained on tens of billions of transactions; card-testing detection 59% → 97%."
            state={chartInterp["arch-eras"]}
            onSubmit={handleChartInterp}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
              {ARCH_ERAS.map((e, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "stretch", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ background: ["#c7d2fe", "#a5b4fc", "#818cf8", "#6366f1"][i], color: i >= 2 ? "#fff" : "#1e1b4b", fontWeight: 800, fontSize: 13, padding: "10px 12px", display: "flex", alignItems: "center", minWidth: 64, justifyContent: "center" }}>
                    {`Era ${i + 1}`}
                  </div>
                  <div style={{ padding: "8px 12px" }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{e.era}</div>
                    <div style={{ fontSize: 12.5, color: "#374151", marginTop: 2 }}>{e.unlock}</div>
                    <div style={{ fontSize: 11, color: "#6366f1", marginTop: 4 }}>{e.anchor}</div>
                  </div>
                </div>
              ))}
            </div>
          </ChartInterpret>

          <Glossary items={GLOSSARY[2]} />
        </div>

        {/* SECTION 3: RQ1 */}
        <div id="sec-3" style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Section 3: Why the Data-Generating Process Is the Binding Constraint (RQ1)</h2>
          <p>
            The thesis to defend here: the feasibility of an AI feature is gated by your position in the data-generating process — whether the product itself produces fresh, representative ground-truth labels — far more than by which model you pick. Stripe's clearest evidence is a single statistic: 90% of cards used on the Stripe network have already been seen more than once across different merchants.
            <Citation source="Stripe Engineering (How we built Radar)" year="2023" tier="FACT" />
            A single business sees only its own transactions; Stripe sees patterns across millions of businesses and thousands of partner banks. That cross-merchant visibility is not a model output — it is a property of where Stripe sits, and it is the reason the prediction is even possible.
          </p>
          <p>
            The same positional logic explains why most of Stripe's features are aggregates computed across the whole network, so that as the network grows, each feature becomes more informative because the training data better represents the real-world distribution. And it explains the embeddings Stripe learns for categorical values like merchant, issuing bank, and country: because the network sees so much, Uber and Lyft end up with similar embedding coordinates while Slack sits far away, and a fraud pattern discovered in Brazil can be recognized in the US without retraining.
            <Citation source="Stripe Engineering (How we built Radar)" year="2023" tier="FACT" />
            None of this is available to a competitor with a better model but a narrower view. The model is replicable; the data position is not.
          </p>

          <ChartInterpret
            chartId="network"
            title="Chart 3 — One merchant's view vs the network's view of a card"
            provenance="FACT: 90% of cards on the Stripe network have been seen more than once across different merchants (Stripe Engineering, 2023). The single-merchant comparison bar is ILLUSTRATION — a stylized low value to show the visibility gap, not a reported statistic."
            state={chartInterp["network"]}
            onSubmit={handleChartInterp}
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={NETWORK_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cat" tick={{ fontSize: 10 }} interval={0} angle={-8} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={v => `${v}%`} />
                <Bar dataKey="value" name="Relative visibility" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartInterpret>

          <MCQuestion qData={QUESTIONS.q1} state={questionState.q1} onAnswer={handleAnswer} onRetry={handleRetry} />
          <NumericQuestion qData={QUESTIONS.q2} state={questionState.q2} onSubmitNumeric={handleSubmitNumeric} />
          <MCQuestion qData={QUESTIONS.q3} state={questionState.q3} onAnswer={handleAnswer} onRetry={handleRetry} />

          <p>
            Where the evidence has limits: a data position is necessary but not sufficient. Stripe still had to engineer the features, the real-time computation, and the architecture to exploit that position — and a company in a different domain may have a strong label stream but a weaker network effect, or vice versa. The principle is not "data beats models always." It is that a feasibility audit must locate where the ground-truth labels come from and how representative and fresh they are <em>before</em> debating model architecture, because no architecture compensates for a label stream the product cannot produce.
          </p>

          <FreeTextQuestion qData={QUESTIONS.q4} state={questionState.q4} onSubmitFreeText={handleSubmitFreeText} />
          <PrincipleGate sectionId={3} state={principleGates[3]} onSubmit={handlePrincipleGate} authoredPrinciple={AUTHORED_PRINCIPLES[3]} />
          <Glossary items={GLOSSARY[3]} />
        </div>

        {/* SECTION 4: RQ2 */}
        <div id="sec-4" style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Section 4: What Data Readiness Actually Requires (RQ2)</h2>
          <p>
            The thesis here: data readiness is not a one-time precondition you clear at launch — it is a continuous property along three axes (representativeness, freshness, and stability), and each is a gate most launch reviews never re-check. Representativeness is positional, as Section 3 showed. Freshness is the quieter gate. Fraud patterns shift constantly — Stripe describes the landscape moving from primarily stolen-card fraud toward high-velocity card-testing attacks — so even a well-performing model degrades over time, a phenomenon called model drift.
            <Citation source="Stripe Engineering (How we built Radar)" year="2023" tier="FACT" />
          </p>
          <p>
            The striking part is how cheaply freshness pays off. Stripe found that retraining the same model on more recent data — identical features, identical architecture, just fresher data — improves recall by up to half a percentage point per month, and by investing in automated training and evaluation it tripled its model release cadence.
            <Citation source="Stripe Engineering (How we built Radar)" year="2023" tier="FACT" />
            That is a large, recurring gain from doing nothing but keeping the data current, which means the cost of <em>not</em> keeping it current is an equally large, silent loss. Freshness is therefore a standing operating expense a feasibility audit must budget for at scoping time, not a box ticked once.
          </p>

          <ChartInterpret
            chartId="drift"
            title="Chart 4 — Same model, two data-freshness paths over a year"
            provenance="FACT anchor (Stripe Engineering, 2023): retraining the same model on fresh data lifts recall by up to ~0.5 pp/month. The two indexed paths (recall index, month 0 = 100) are ESTIMATE — modeled to show the widening gap from that ~0.5 pp/month figure, not reported time series."
            state={chartInterp["drift"]}
            onSubmit={handleChartInterp}
          >
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={DRIFT_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="m" tick={{ fontSize: 11 }} label={{ value: "Months since launch", position: "insideBottom", offset: -8, fontSize: 11 }} />
                <YAxis domain={[94, 108]} tick={{ fontSize: 11 }} tickFormatter={v => v} />
                <Tooltip formatter={v => `${v} (recall index)`} />
                <Legend />
                <Line type="monotone" dataKey="retrain" name="Retrained monthly on fresh data" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="noRetrain" name="Same model, no retraining" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartInterpret>

          <p>
            The third axis — stability of the relationship the model depends on — is the most dangerous, and it interacts with a trap unique to systems that act on their own predictions. Stripe must also guard representativeness at the segment level: a model that improves on aggregate metrics can still spike the block rate for smaller merchants, so before releasing any model Stripe measures the change to false-positive, block, and authorization rates both in aggregate and per-merchant, and adjusts for segments that would be hurt.
            <Citation source="Stripe Engineering (How we built Radar)" year="2023" tier="FACT" />
            An aggregate win that quietly breaks a segment is a readiness failure hiding inside a headline metric — which is precisely the kind of thing a single accuracy number conceals.
          </p>

          <MCQuestion qData={QUESTIONS.q5} state={questionState.q5} onAnswer={handleAnswer} onRetry={handleRetry} />
          <NumericQuestion qData={QUESTIONS.q6} state={questionState.q6} onSubmitNumeric={handleSubmitNumeric} />
          <FreeTextQuestion qData={QUESTIONS.q7} state={questionState.q7} onSubmitFreeText={handleSubmitFreeText} />
          <PrincipleGate sectionId={4} state={principleGates[4]} onSubmit={handlePrincipleGate} authoredPrinciple={AUTHORED_PRINCIPLES[4]} />
          <Glossary items={GLOSSARY[4]} />
        </div>

        {/* SECTION 5: RQ3 */}
        <div id="sec-5" style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Section 5: Scoping a v1 Under Probabilistic Uncertainty (RQ3)</h2>
          <p>
            The thesis: a v1 fraud feature is not a deterministic spec ("block fraud") — it is a chosen operating point on the precision/recall curve, set by each user's error economics, plus the thresholds that govern intervention. Stripe makes this explicit by separating two problems. The data-science problem is making the model better — more features, more data, better architecture — which shifts the entire precision/recall curve upward. The business problem is choosing <em>where on that curve to operate</em>, and the right answer depends entirely on the economics of each merchant.
            <Citation source="Stripe Engineering (How we built Radar)" year="2023" tier="FACT" />
          </p>
          <p>
            The economics are not subtle. A food-delivery business earning about $2 in profit per order can have the profit from nearly 19 legitimate orders wiped out by a single fraudulent transaction, so it should block aggressively (favor recall). A SaaS business with a $200/month subscriber faces the opposite math: the lifetime revenue lost by wrongly blocking a real subscriber dwarfs an occasional fraud, so it should approve generously (favor precision). And the cost of a false decline is real — a survey found 33% of consumers would stop shopping with a business after a single wrongly declined transaction.
            <Citation source="ByteByteGo, citing Stripe Engineering" year="2026" tier="FACT" />
            This is why Radar is configurable: the v1 specification <em>is</em> the operating point, and that point is a product decision, not a model setting.
          </p>

          <ChartInterpret
            chartId="pr-curve"
            title="Chart 5 — The precision/recall tradeoff: where a merchant should sit is a product decision"
            provenance="ILLUSTRATION — a structural tradeoff curve to teach the precision/recall relationship Stripe describes. The economics markers ($2/order, ~19 orders, $200/mo, 33% false-decline abandonment) are FACT anchors (Stripe Engineering; ByteByteGo 2026); the curve values themselves are illustrative, not reported statistics."
            state={chartInterp["pr-curve"]}
            onSubmit={handleChartInterp}
          >
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={PR_CURVE_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="recall" tick={{ fontSize: 11 }} label={{ value: "Recall (% of true fraud caught)", position: "insideBottom", offset: -8, fontSize: 11 }} />
                <YAxis domain={[40, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={(v) => `${v}% precision`} labelFormatter={l => `Recall ${l}%`} />
                <Line type="monotone" dataKey="precision" name="Precision at this recall" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartInterpret>

          <MCQuestion qData={QUESTIONS.q8} state={questionState.q8} onAnswer={handleAnswer} onRetry={handleRetry} />

          <p>
            The payoff of getting the order of operations right — data readiness first, model last — is what made Stripe's most dramatic result possible. Because Stripe had tens of billions of labeled, contextualized transactions, it could pre-train a self-supervised transformer that distills each charge into a single embedding, then layer a classifier on sequences of those embeddings. The result: detection of card-testing attacks at large merchants jumped from 59% to 97% overnight, with no increase in false positives, after a roughly two-year effort with a specialized model had plateaued.
            <Citation source="Stripe Sessions; G. Kedia (Stripe)" year="2025" tier="FACT" />
            The foundation model was not the cause of the advantage; it was the dividend of a data position that had been compounding for years.
          </p>

          <ChartInterpret
            chartId="fm"
            title="Chart 6 — The data-readiness dividend: card-testing detection at large merchants"
            provenance="FACT (Stripe Sessions 2025; Gautam Kedia, Stripe Applied ML, May 2025): card-testing detection at large merchants rose from 59% to 97% overnight with no reported increase in false positives, vs. a prior specialized model that took ~2 years."
            state={chartInterp["fm"]}
            onSubmit={handleChartInterp}
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={FM_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cat" tick={{ fontSize: 10 }} interval={0} angle={-8} textAnchor="end" height={60} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                <Tooltip formatter={v => `${v}% detection`} />
                <Bar dataKey="rate" name="Card-testing detection rate" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartInterpret>

          <NumericQuestion qData={QUESTIONS.q9} state={questionState.q9} onSubmitNumeric={handleSubmitNumeric} />
          <MCQuestion qData={QUESTIONS.q10} state={questionState.q10} onAnswer={handleAnswer} onRetry={handleRetry} />
          <FreeTextQuestion qData={QUESTIONS.q11} state={questionState.q11} onSubmitFreeText={handleSubmitFreeText} />
          <PrincipleGate sectionId={5} state={principleGates[5]} onSubmit={handlePrincipleGate} authoredPrinciple={AUTHORED_PRINCIPLES[5]} />
          <Glossary items={GLOSSARY[5]} />
        </div>

        {/* SECTION 6: What Broke */}
        <div id="sec-6" style={{ marginTop: 40, padding: 20, background: "#FEF2F2", borderLeft: "4px solid #FCA5A5", borderRadius: 8 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: "#b91c1c" }}>Section 6: What Broke — The Label That Isn't There, and a Component Too Good to Keep</h2>
          <p>
            The most instructive failure in Stripe's fraud system is not a crash; it is a measurement assumption that quietly breaks the moment the model does its job. When Radar blocks a transaction, the payment never completes — so its true outcome is never observed. You cannot know whether a blocked charge would have been fraud or a good sale, because you prevented it from resolving. Transactions the model blocks have unknown true outcomes, which means computing a real production precision/recall curve requires counterfactual analysis: statistical methods that estimate what would have happened to the payments Radar blocked.
            <Citation source="Stripe Engineering (How we built Radar)" year="2023" tier="FACT" />
          </p>
          <p>
            Why does this happen? Because the team's intuition — reasonable in ordinary software — is that you can log outcomes and read your metrics straight from them. In a system that <em>acts</em>, the action censors the outcome. The model's own decisions select which labels you get to see, so naive production metrics are biased by the model's past behavior: a model can look excellent on the completed transactions it allowed while quietly degrading on the population it blocks, and nothing in the observed data will tell you. This is the data-readiness assumption that fails only after deployment, which is the most expensive place to discover it. A second, related regret lived in the architecture: the XGBoost component of the old Wide &amp; Deep model was actively improving accuracy — naively dropping it would have cost about 1.5 percentage points of recall — yet it had to be removed because it blocked transfer learning, embeddings, and fast retraining.
            <Citation source="Stripe Engineering (via ByteByteGo)" year="2026" tier="FACT" />
          </p>
          <p>
            What did it cost? On the measurement side, Stripe had to develop proprietary counterfactual-evaluation techniques over years — an entire discipline built to recover the labels that deployment destroys. On the architecture side, the team could not simply delete XGBoost; it first had to replicate that 1.5 points of recall inside the new Shield NeXt architecture, after which the migration cut training time by over 85% (to under two hours) and unlocked the data-scaling and foundation-model work that followed.
            <Citation source="Stripe Engineering (via ByteByteGo)" year="2026" tier="FACT" />
            Both costs were paid to fix problems that a naive feasibility review would never have surfaced, because both are invisible until the system is live and acting.
          </p>
          <p>
            The lesson is the most transferable in this article precisely because it is a failure pattern, not a success: acting on your predictions changes your data. Data readiness is not a static property you certify once — the deployed model reshapes the very label stream you depend on to keep measuring and improving it. A feasibility audit for any system that takes consequential actions must therefore ask a question that sounds paradoxical until you have been burned by it: will deploying this model corrupt the labels we need to evaluate it, and if so, what counterfactual machinery do we need before we ship?
          </p>

          <ChartInterpret
            chartId="xgb"
            title="Chart 7 — Removing a component that was helping: XGBoost → Shield NeXt"
            provenance="FACT anchors (Stripe Engineering via ByteByteGo, 2026): naively dropping XGBoost would cost ~1.5 pp of recall; Shield NeXt recovered recall AND cut training time >85% (to <2 hrs). Values indexed to Wide & Deep = 100 to show the recall recovery and the training-time collapse."
            state={chartInterp["xgb"]}
            onSubmit={handleChartInterp}
          >
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={XGB_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 110]} tick={{ fontSize: 11 }} tickFormatter={v => v} />
                <Tooltip formatter={v => `${v} (index)`} />
                <Legend />
                <Bar dataKey="naive" name="Naively drop XGBoost" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="shield" name="Shield NeXt (rebuilt)" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartInterpret>

          <MCQuestion qData={QUESTIONS.q12} state={questionState.q12} onAnswer={handleAnswer} onRetry={handleRetry} />
          <MCQuestion qData={QUESTIONS.q13} state={questionState.q13} onAnswer={handleAnswer} onRetry={handleRetry} />
          <Glossary items={GLOSSARY[6]} />
        </div>

        {/* LEARNING SUMMARY — always available, never gated */}
        <div id="sec-summary" style={{ marginTop: 40 }}>
          <LearningSummary
            questionState={questionState}
            principleGates={principleGates}
            score={score}
            totalQ={totalScorableQ}
            warmUpSkipped={warmUpSkipped}
          />
        </div>

        {/* SECTION 7: Conclusion — always rendered, freely navigable */}
        <div id="sec-7" style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Section 7: Conclusion</h2>
          <p>
            The governing principle, now stress-tested by both Stripe's success and its traps: model selection is the last decision, gated by whether your data-generating process yields fresh, representative ground-truth labels and whether the error is tunable to each user's economics. Partial failure of this principle looks like a team that picks an impressive model first and then discovers, in production, that its labels arrive too slowly, that its single threshold is wrong for half its users, or that the model's own actions have censored the data it needs to improve. The principle fails quietly — which is what makes it dangerous.
          </p>
          <p>
            For an AI PM, this changes three decisions. First, replace "which model?" with a data-readiness audit — where do ground-truth labels come from, how fresh and representative are they, and does the product generate them as a byproduct? Second, write v1 as a reward function and an explicit operating point chosen by the user's error economics, defaulting to augmentation and a monitored intervention threshold in high-stakes domains. Third, treat freshness and counterfactual evaluation as line items in the scope, not afterthoughts, because both are invisible until they hurt.
          </p>
          <p>
            For a future CTO, the principle informs platform and governance design. Someone must own the label-generating pipeline and its integrity as infrastructure — including the counterfactual machinery for any system that acts on its predictions — rather than re-solving it per feature. The build-versus-buy choices that follow should protect the one asset a competitor cannot rent: a product positioned so that trustworthy labels accrue automatically. Stripe's foundation model is rentable in principle; its decade of dispute-labeled transactions is not.
          </p>
          <p>
            The most important unresolved question this case does not answer: as foundation models make it trivial to <em>start</em> with a capable model on almost any problem, how should an organization re-gate feasibility when model capability is no longer the constraint? Stripe's answer implies the gate moves to the data-generating position and the label stream — but whether every domain has a "dispute signal" that produces ground truth for free, and what to do when it does not, is the open problem the next phase of this curriculum must address.
          </p>

          <ForwardLookingQuestion qData={QUESTIONS.q15} state={questionState.q15} onAnswer={handleForwardLookingAnswer} onRetry={handleRetry} />
          <FreeTextQuestion qData={QUESTIONS.q16} state={questionState.q16} onSubmitFreeText={handleSubmitFreeText} />

          <NavigationGuide />

          {/* Sources */}
          <div style={{ marginTop: 40, padding: 16, background: "#f8fafc", borderRadius: 8, fontSize: 13 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Sources</div>
            {[
              { name: "Stripe Engineering — 'How we built it: Stripe Radar' (Drapeau, 2023)", url: "https://stripe.dev/blog/how-we-built-it-stripe-radar", tier: "FACT", use: "Automatic dispute/network labels; 90% of cards seen >once across merchants; architecture evolution (logistic regression → Wide & Deep → Shield NeXt); embeddings + geographic transfer; up to ~0.5 pp/month recall from retraining; per-merchant release gating; counterfactual evaluation of blocked transactions." },
              { name: "Stripe Sessions 2025 — payments foundation model launch", url: "https://stripe.com/newsroom/news/sessions-2025", tier: "FACT", use: "Stripe's Payments Foundation Model; card-testing detection at large merchants 59% → 97% with no increase in false positives." },
              { name: "TechCrunch — 'Stripe unveils AI foundation model for payments' (May 7, 2025)", url: "https://techcrunch.com/2025/05/07/stripe-unveils-ai-foundation-model-for-payments-reveals-deeper-partnership-with-nvidia/", tier: "FACT", use: "Corroborates the foundation-model launch and the 59% → 97% card-testing detection figure." },
              { name: "Gautam Kedia (Stripe, Applied ML) — public announcement, May 2025", url: "https://x.com/thegautam/status/1920198569308664169", tier: "FACT", use: "Transformer payments foundation model trained on tens of billions of transactions (1T+ tokens); self-supervised embedding per transaction; 59% → 97%; vs. ~2-year specialized-model effort." },
              { name: "ByteByteGo — 'How Stripe Detects Fraudulent Transactions Within 100 ms' (2026)", url: "https://blog.bytebytego.com/p/how-stripe-detects-fraudulent-transactions", tier: "FACT", use: "Secondary technical write-up reproducing and citing Stripe Engineering: ~1-in-1,000 fraud base rate; <100 ms scoring on 1,000+ signals; XGBoost removal would cost ~1.5 pp recall; Shield NeXt cut training time >85%; 33% of consumers abandon after one false decline; food-delivery vs SaaS error economics." },
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
              Provenance tiers: FACT = measured value confirmed at the cited source. ESTIMATE = derived by stated arithmetic from FACTs. ILLUSTRATION = synthetic teaching values, never used in a scored answer key. The ByteByteGo write-up is a secondary source that reproduces and cites Stripe Engineering's own Radar post; figures attributed to it trace back to Stripe's published account.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
