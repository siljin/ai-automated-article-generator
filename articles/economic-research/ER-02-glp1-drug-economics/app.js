/*
  Interactive Research Article: GLP-1 Obesity Drugs - Cost-Effective Yet Unaffordable
  Static React learning artifact. Source copy; the same code is inlined into index.html.
  Data provenance is tagged FACT / ESTIMATE / ILLUSTRATION throughout.
*/

const {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  Cell,
  ReferenceLine
} = Recharts;

/* ----------------------------------------------------------------------- */
/* Sources                                                                  */
/* ----------------------------------------------------------------------- */

const sources = [
  { label: "CDC NCHS Health E-Stat 111: Overweight, Obesity, Severe Obesity, 1960-2023 (Feb 2026)", url: "https://www.cdc.gov/nchs/data/hestat/hestat111.htm" },
  { label: "CDC NCHS Data Brief 508: Obesity and Severe Obesity Prevalence in Adults (Sept 2024)", url: "https://www.cdc.gov/nchs/products/databriefs/db508.htm" },
  { label: "Wilding et al., STEP 1, New England Journal of Medicine (2021)", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2032183" },
  { label: "Jastreboff et al., SURMOUNT-1, New England Journal of Medicine (2022)", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2206038" },
  { label: "Peterson-KFF Health System Tracker: Weight-loss drug prices, U.S. vs peer nations (Aug 2023)", url: "https://www.healthsystemtracker.org/brief/prices-of-drugs-for-weight-loss-in-the-us-and-peer-nations/" },
  { label: "ICER: Medications for Obesity Management - Effectiveness and Value (2025)", url: "https://icer.org/news-insights/press-releases/icer-publishes-final-evidence-report-and-policy-recommendations-on-treatments-for-obesity-management/" },
  { label: "CBO via Committee for a Responsible Federal Budget: Medicare coverage of weight-loss drugs (Oct 2024)", url: "https://www.crfb.org/blogs/cbo-estimates-medicare-coverage-weight-loss-drugs" },
  { label: "CMS: New Lower Drug Prices, Medicare Negotiation, IPAY 2027 (Nov 2025)", url: "https://www.cms.gov/files/document/infographic-negotiated-prices-ipay-2027.pdf" },
  { label: "Eli Lilly and Novo Nordisk 2024 results (company filings), via Sherwood News", url: "https://sherwood.news/business/eli-lilly-novo-nordisk-sold-more-than-usd40-billion-in-glp-1-drugs-in-2024/" },
  { label: "Real-world evidence on GLP-1 utilization and persistence, PMC review (2025)", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12000858/" }
];

/* ----------------------------------------------------------------------- */
/* Chart data (every value tagged in the visible provenance note)          */
/* ----------------------------------------------------------------------- */

// FACT - CDC NHANES, age-adjusted, adults 20+
const obesityTrend = [
  { period: "1988-94", obesity: 22.9, severe: 2.8 },
  { period: "1999-00", obesity: 30.5, severe: 4.7 },
  { period: "2003-04", obesity: 32.2, severe: 4.8 },
  { period: "2007-08", obesity: 33.7, severe: 5.7 },
  { period: "2011-12", obesity: 34.9, severe: 6.4 },
  { period: "2013-14", obesity: 37.7, severe: 7.7 },
  { period: "2015-16", obesity: 39.6, severe: 7.7 },
  { period: "2017-18", obesity: 42.4, severe: 9.2 },
  { period: "2021-23", obesity: 40.3, severe: 9.7 }
];

// FACT - one molecule (semaglutide), several monthly-equivalent prices (USD)
const priceArchitecture = [
  { label: "List price (Wegovy)", value: 1349, note: "KFF list, 2023" },
  { label: "ICER net price", value: 569, note: "$6,830/yr, 2025" },
  { label: "Self-pay (NovoCare)", value: 399, note: "2025 cash" },
  { label: "Medicare negotiated", value: 385, note: "effective 2027" }
];

// FACT - monthly list price, US vs cheapest peer shown (USD), KFF Aug 2023
const usPeerPrice = [
  { drug: "Ozempic", US: 936, Peer: 169, peerName: "Japan" },
  { drug: "Wegovy", US: 1349, Peer: 296, peerName: "Netherlands" },
  { drug: "Mounjaro", US: 1023, Peer: 444, peerName: "Netherlands" }
];

// ESTIMATE - aggregate annual budget = share treated x ~100M eligible x ~$7,000 net/yr.
// Threshold line (0.88) and the "<1% treatable" marker are FACT (ICER 2025).
const budgetParadox = [
  { share: "0.1%", budget: 0.7 },
  { share: "1%", budget: 7 },
  { share: "5%", budget: 35 },
  { share: "10%", budget: 70 },
  { share: "25%", budget: 175 }
];
const ICER_THRESHOLD = 0.88; // FACT: ICER potential budget-impact threshold, ~$880M/yr

// ILLUSTRATION - modeled teaching values showing how each lever multiplies down a naive bill.
const leversBill = [
  { step: "Naive: 10% of eligible x list price", value: 160 },
  { step: "At net price (~$7k/yr)", value: 70 },
  { step: "x real-world persistence (~1/3 at 1yr)", value: 23 },
  { step: "x target highest-risk quarter", value: 6 }
];

/* ----------------------------------------------------------------------- */
/* Section + question model                                                 */
/* ----------------------------------------------------------------------- */

const sectionList = [
  { id: "warmup", eyebrow: "Cumulative warm-up", title: "What Stuck From Earlier Articles", shortTitle: "Warm-Up", questionIds: ["wu1", "wu2", "wu3"] },
  { id: "intro", eyebrow: "Opening frame", title: "A Miracle Drug the System May Not Afford", shortTitle: "Intro", questionIds: [] },
  { id: "background", eyebrow: "Trajectory and structure", title: "A Huge Pool Meets a Many-Priced Drug", shortTitle: "Background", questionIds: ["bg1", "bg2", "bg3"] },
  { id: "rq1", eyebrow: "Research question 1", title: "How Can It Be Cost-Effective Yet Unaffordable?", shortTitle: "RQ1: Value", questionIds: ["rq1a", "rq1b"] },
  { id: "rq2", eyebrow: "Research question 2", title: "Why the U.S. Bill Is So Much Larger", shortTitle: "RQ2: U.S. gap", questionIds: ["rq2a", "rq2b", "rq2c"] },
  { id: "rq3", eyebrow: "Research question 3", title: "What Actually Moves the Bill", shortTitle: "RQ3: Levers", questionIds: ["rq3a", "rq3b"] },
  { id: "summary", eyebrow: "Learning summary", title: "Produce Your Insight, Then Compare", shortTitle: "Summary", questionIds: [] },
  { id: "conclusion", eyebrow: "Conclusion", title: "Coverage Is an Engineering Problem, Not a Verdict", shortTitle: "Conclusion", questionIds: ["conc"] }
];

// principle tags drive the "Principles to revisit" map in the summary
const questionBank = {
  wu1: {
    kind: "choice", sectionId: "warmup", typeLabel: "Warm-up - transfer (Type B)",
    principle: "Technology value is realized where a workflow decision changes, not at the demo.",
    prompt: "A prior article argued a new technology's value shows up only where a repeated workflow actually changes, not at the moment of a capable demo. Transfer it: a hospital licenses an AI model that flags sepsis with 92% validation accuracy. Which single fact would most change whether the model creates value?",
    options: [
      "The share of flagged cases in which clinicians actually change a treatment decision, and whether outcomes then improve.",
      "The model's validation accuracy re-measured on a larger held-out dataset.",
      "The number of competing vendors selling similar sepsis models.",
      "The cloud-computing cost of running the model per prediction."
    ],
    correctIndex: 0,
    explanation: "Principle: value lands at the point a workflow decision changes, not at the point of capability. A 92% demo is necessary but not sufficient. B mistakes more capability for more value (the demo fallacy); C is market structure, not value; D is a cost input. Where this generalizes: it is exactly how a GLP-1's trial efficacy becomes - or fails to become - value in real practice, the thread of today's article."
  },
  wu2: {
    kind: "choice", sectionId: "warmup", typeLabel: "Warm-up - transfer (Type B)",
    principle: "Asymmetric scalability: the side whose returns replicate across markets captures the surplus.",
    prompt: "A prior article separated a globally scalable rights owner from a place-bound host carrying sunk local costs. Transfer it: a streaming platform buys worldwide rights to one city's marathon and can resell the feed across markets, while the city's spending on roads, policing, and cleanup is local and largely sunk. Which framing best predicts who captures most of the surplus?",
    options: [
      "Whichever party spent more cash up front captures more surplus.",
      "The party whose returns scale across many markets tends to capture more surplus than the party whose costs are fixed and place-specific.",
      "Surplus is split evenly because both signed the same contract.",
      "The city captures more because the event physically happens there."
    ],
    correctIndex: 1,
    explanation: "Principle: when one side's returns replicate across markets and the other's costs are sunk and local, the scalable side captures disproportionate surplus regardless of who 'hosts.' A confuses spend with return (sunk-cost thinking); C ignores the asymmetry; D confuses physical location with economic capture. Where this generalizes: platform vs supplier, franchisor vs franchisee - and, today, a global drugmaker vs a single health system."
  },
  wu3: {
    kind: "choice", sectionId: "warmup", typeLabel: "Warm-up - cross-domain reasoning (Type B)",
    principle: "Compounding is multiplicative, not additive.",
    prompt: "A quick reasoning check unrelated to today's topic. A quantity grows 25% per year for four straight years. Without a calculator, which is closest to its total growth over the four years?",
    options: [
      "About 100% - it doubles.",
      "Exactly 100% - that is 25% times 4.",
      "About 144% - it grows roughly 2.4 times.",
      "About 60%."
    ],
    correctIndex: 2,
    explanation: "Principle: rates stacked over periods compound: 1.25^4 = 2.44, i.e. ~144% growth, not 25% x 4 = 100%. B is the linear-thinking trap (adding rates); A under-counts compounding; D badly under-counts. Where this generalizes: interest, adoption curves, and the GLP-1 sales ramp you will reason about - exponentials beat intuition."
  },

  bg1: {
    kind: "choice", sectionId: "background", typeLabel: "Type A - chart reading + trap",
    chartId: "prevalence",
    principle: "Percentage points are not percent; always ask 'of what base?'",
    prompt: "Using the revealed prevalence trend: U.S. adult obesity went from 22.9% (1988-94) to 42.4% (2017-18) before easing. A colleague says obesity 'rose 19.5% over that span.' What is the precise description, and why does it matter for sizing a market?",
    options: [
      "The colleague is right: it rose 19.5%, so the treatable pool grew about one-fifth.",
      "It rose 19.5 percentage points, which is the same thing as a 19.5% increase.",
      "It rose about 20%, so doubling the figure is close enough for planning.",
      "It rose 19.5 percentage points - but that is roughly an 85% relative increase in the rate, so 'rose 19.5%' badly understates how much the eligible pool grew."
    ],
    correctIndex: 3,
    explanation: "Principle: percentage points != percent. 22.9 to 42.4 is +19.5 points, but (42.4-22.9)/22.9 = ~85% in relative terms. Conflating them mis-sizes the addressable pool by roughly four-fold. A, B, and C all collapse the points-vs-percent distinction. Where this generalizes: rate moves, vote shares, conversion lifts - name the base before quoting a percent."
  },
  bg2: {
    kind: "choice", sectionId: "background", typeLabel: "Type B - structure + trap",
    chartId: "priceArch",
    principle: "Run budgets on net price, not the list-price sticker.",
    prompt: "The 'one molecule, several prices' chart shows a list price far above the net, self-pay, and negotiated prices for the same semaglutide. An analyst forecasts the U.S. bill as likely-users times list price. What is the main flaw, and what does the spread imply?",
    options: [
      "No flaw: list price is what payers pay, so the forecast is sound.",
      "The only flaw is using monthly instead of annual figures; list price is otherwise the right unit.",
      "List price is a sticker almost no payer pays; rebates and negotiation make the real per-user cost far lower, so a list-based forecast can overstate the bill several-fold.",
      "The flaw is that net prices end up higher than list once taxes are added, so the forecast is too low."
    ],
    correctIndex: 2,
    explanation: "Principle: gross/list prices are pre-rebate stickers; budget math must use net realized price. Here list runs ~2-3x the net/negotiated figures, so a list-based forecast overstates spend by that gap. A asserts the false equivalence; B raises a trivial unit issue; D inverts the direction. Where this generalizes: hospital chargemaster vs paid, airfare fare-basis vs realized, SaaS list vs discounted ACV."
  },
  bg3: {
    kind: "choice", sectionId: "background", typeLabel: "Type C - consulting case",
    principle: "Aggregate cost = volume x net price x duration; per-patient value does not bound the total.",
    prompt: "Northwind Foods, a self-insured employer with 9,000 covered lives, is weighing GLP-1 obesity coverage. Staff note ~40% of adults are eligible by BMI, the drugs work, and list prices top $1,000/month. Which analysis should most shape the decision?",
    options: [
      "Model net (not list) per-user cost, realistic uptake among the eligible, and one-year persistence - because the budget is users x net price x time on therapy, and most of those levers are uncertain.",
      "Approve broadly: because the drugs are cost-effective per patient, total spend cannot be a problem.",
      "Decline outright: because 40% are eligible, covering anyone is unaffordable by definition.",
      "Decide on the list price alone, since it is the most conservative number."
    ],
    correctIndex: 0,
    explanation: "Principle: aggregate cost = volume x net price x duration; a coverage call must model all three, and per-patient cost-effectiveness does not cap the total. B is the cost-effective-implies-affordable fallacy; C extrapolates eligibility straight to 100% uptake; D confuses 'conservative' with 'unrealistic' (list != net). Where this generalizes: any per-unit-attractive, high-volume program - cloud egress, broad screening, subsidies."
  },

  rq1a: {
    kind: "estimate", sectionId: "rq1", typeLabel: "Type D - estimation (scaffolded)",
    chartId: "paradox",
    principle: "Budget impact scales linearly with the eligible base.",
    prompt: "Decompose it yourself. Suppose ~100 million U.S. adults are eligible (about 40% of ~250M adults), 1 in 10 of them takes a GLP-1, and the net price is about $5,000 per patient per year. Estimate the total annual drug bill.",
    suffix: "$B", target: 50, tolerance: 8, axisMin: 0, axisMax: 120, step: 1,
    placeholder: "e.g. 50",
    method: "100,000,000 x 10% = 10,000,000 patients. 10,000,000 x $5,000 = $50,000,000,000 = $50B. Bounds: 5% uptake ~$25B; 20% uptake ~$100B. Tolerance is tight (+/- $8B) because this is closed arithmetic from the given inputs.",
    explanation: "Principle: a 'cost-effective' $5,000/yr per patient becomes tens of billions because the eligible pool is enormous - aggregate = per-unit x volume. Where this generalizes: any population-scale intervention; the per-person price is almost never the number that decides affordability."
  },
  rq1b: {
    kind: "choice", sectionId: "rq1", typeLabel: "Type B - reconcile the paradox",
    chartId: "paradox",
    principle: "Per-unit value and aggregate budget impact are different verdicts.",
    prompt: "Reviewers judged these drugs cost-effective at conventional value thresholds, yet also found that under 1% of eligible patients could be covered before annual spend crosses what the system can absorb. Which statement best reconciles 'cost-effective' with 'unaffordable'?",
    options: [
      "The reviewers made an arithmetic error; a cost-effective drug is by definition affordable.",
      "Cost-effectiveness is a per-patient verdict (value for money on one person); affordability is an aggregate verdict (price x number treated), and a huge eligible population makes the two diverge.",
      "The drugs cannot really be cost-effective, since the budget impact is so large.",
      "Affordability would be fine if the drugs simply worked better clinically."
    ],
    correctIndex: 1,
    explanation: "Principle: cost-effectiveness (a ratio per patient) and budget impact (a total) are different metrics that diverge when the eligible N is large. A and C treat them as the same metric - the core confusion. D misattributes a budget problem to efficacy. Where this generalizes: a profitable unit economic can still sink a firm at scale; a cheap-per-mile commute is unaffordable if everyone drives at rush hour."
  },

  rq2a: {
    kind: "choice", sectionId: "rq2", typeLabel: "Type A - chart reading + decomposition",
    chartId: "usPeer",
    principle: "Decompose a bill into price x quantity before naming the driver.",
    prompt: "From the U.S.-versus-peer price chart (revealed): for the same branded products, roughly how does the U.S. list price compare with the cheapest peer shown, and what does that imply about the main driver of the U.S. bill?",
    options: [
      "About 1.2-1.5x higher; price is minor, so prevalence explains almost all of the U.S. bill.",
      "Roughly equal; the U.S. bill is entirely a prevalence story.",
      "About 2x higher; price and prevalence matter equally and add together.",
      "Roughly 3-6x higher depending on the product, so the U.S. price level is a first-order driver - and on top of higher prevalence, the two multiply."
    ],
    correctIndex: 3,
    explanation: "Principle: split a bill into price x quantity. Here the price multiple (~3-6x) and the prevalence multiple (~2x) are both large and compound. A and B understate the price gap; C gets the idea but treats the effects as additive rather than multiplicative. Where this generalizes: any cross-country or cross-segment cost gap - separate the price effect from the volume effect first."
  },
  rq2b: {
    kind: "choice", sectionId: "rq2", typeLabel: "Type B - correlation vs causation",
    chartId: "usPeer",
    principle: "Co-movement is not causation; look for the confounder.",
    prompt: "Across wealthy countries the U.S. has both the highest GLP-1 prices and the highest obesity prevalence. Someone concludes that high obesity prevalence is what causes the high U.S. prices. What is the strongest reason NOT to accept that causal claim?",
    options: [
      "There is no association between the two at all, so the claim is baseless.",
      "Prices and prevalence are the same variable measured twice, so the claim is circular.",
      "Other high-obesity countries still pay far less, and U.S. prices are better explained by how prices are set (no central negotiation) - a confounder the prevalence story ignores.",
      "Causation can never be inferred from any data under any circumstances."
    ],
    correctIndex: 2,
    explanation: "Principle: two things being high together is not a cause; look for a confounder or alternative mechanism. The price-setting regime (central negotiation vs not) plausibly drives prices independent of prevalence, and peers with high obesity still pay less - which breaks the proposed link. A denies the real association; B misstates the variables; D is causation-nihilism. Where this generalizes: when two measures move together, ask what third factor sets each."
  },
  rq2c: {
    kind: "choice", sectionId: "rq2", typeLabel: "Type C - consulting case",
    principle: "Attribute a market gap to price and volume separately, not one factor.",
    prompt: "MeridianRx advises a multinational launching an obesity drug in both the U.S. and a peer market. An exec says 'the U.S. is the prize purely because Americans are heavier.' Using the price-versus-prevalence decomposition, what is the sharpest correction?",
    options: [
      "The U.S. opportunity is price x prevalence: U.S. list prices run several times peer levels and prevalence is roughly double, so the price level - set by how the market negotiates - is at least as important as the heavier population.",
      "The exec is right; prevalence is the only factor, so price strategy is irrelevant.",
      "Prevalence is identical across countries, so only branding differs.",
      "The peer market is the prize because lower prices guarantee higher volume and profit."
    ],
    correctIndex: 0,
    explanation: "Principle: decompose a market into price x quantity; blaming the whole gap on prevalence ignores the larger price multiple. B is single-factor tunnel vision; C is factually wrong; D assumes volume offsets price with no evidence. Where this generalizes: market-entry sizing - always split a gap into price and volume before declaring the driver."
  },

  rq3a: {
    kind: "estimate", sectionId: "rq3", typeLabel: "Type D - estimation (open-ended)",
    chartId: "levers",
    principle: "Real-world adherence differs sharply from trial completion.",
    prompt: "Name the decomposition in your head first, then answer. Of patients who start a GLP-1 for weight loss outside a clinical trial, what share are still taking it one year later? Enter a percentage.",
    suffix: "%", target: 32, tolerance: 12, axisMin: 0, axisMax: 100, step: 1, fermi: true,
    placeholder: "e.g. 35",
    method: "Persistence = f(tolerability, cost/coverage, supply, motivation after goal weight). Anchors: trials with nurse support keep most patients on; the real world removes that scaffolding; about three-quarters report GI side effects; coverage lapses and shortages interrupt therapy. U.S. real-world studies cluster around one-third to one-half at 12 months; one large study found ~32%. Bounds: ~20% (low-support, high-cost) to ~50% (well-supported). Wide tolerance (+/- 12 points) reflects the genuine spread in the literature.",
    explanation: "Principle: real-world != trial - selection and support inflate trial adherence, so most people who start, stop. People who anchor on trial completion (~70%+) over-estimate badly. Where this generalizes: any therapy or product with a trial-vs-field gap - app retention, program completion, pilot-to-rollout drop-off."
  },
  rq3b: {
    kind: "choice", sectionId: "rq3", typeLabel: "Type C - load-bearing assumption",
    principle: "Stress-test the assumption that is both essential and weakly evidenced.",
    prompt: "A national payer proposes covering GLP-1s for everyone with obesity, arguing it will 'pay for itself' through avoided heart disease and diabetes. On the article's evidence, which assumption is most load-bearing - the one whose failure would most undermine the claim?",
    options: [
      "That the drugs achieve double-digit weight loss in trials.",
      "That patients stay on therapy for years and that avoided medical costs are large and arrive soon - yet most discontinue within a year and budget scorers found near-term savings far smaller than drug spending.",
      "That obesity prevalence is high enough to matter.",
      "That peer countries pay less than the U.S."
    ],
    correctIndex: 1,
    explanation: "Principle: the load-bearing assumption is the one the conclusion depends on most and the evidence supports least. 'Pays for itself' needs sustained adherence plus large, near-term offsets; the evidence shows ~1/3 one-year persistence and official scorers finding small early savings. A is well-supported (not the weak link); C and D are true but not what the savings claim hinges on. Where this generalizes: attack the essential-but-thin assumption, not the one that is merely true."
  },

  conc: {
    kind: "choice", sectionId: "conclusion", typeLabel: "Type E - recommendation + falsification",
    principle: "A strong recommendation names its levers and the observation that would falsify it.",
    prompt: "Which decision is most directly supported by the analysis - and which observation would most undermine the thesis that these drugs are 'cost-effective yet unaffordable at scale'?",
    options: [
      "Cover everyone immediately at list price; the thesis is undermined if a single patient benefits.",
      "Do nothing, because per-patient cost-effectiveness guarantees the budget takes care of itself; nothing could undermine the thesis.",
      "Ban the drugs until prices fall; the thesis is undermined only if obesity disappears.",
      "Pair coverage with net-price negotiation, adherence support, and risk-based eligibility - and the thesis would be most undermined if net prices fell far enough (via negotiation or competition) that covering the whole eligible pool stayed within budget limits."
    ],
    correctIndex: 3,
    explanation: "Principle: the strongest recommendation names both its levers and its falsifier. The bill is net price x volume x duration, so negotiation, adherence, and targeting are the levers; the thesis breaks if net price drops enough that universal coverage fits the budget - exactly what deep negotiated discounts could do. A and C are extremes ignoring trade-offs; D repeats the cost-effective-implies-affordable fallacy and is unfalsifiable. Where this generalizes: a thesis you cannot falsify is not an analysis."
  }
};

const chartConfig = {
  prevalence: {
    title: "U.S. adult obesity, 1988-2023",
    subtitle: "Age-adjusted prevalence, adults 20 and older (percent).",
    tier: "FACT",
    note: "FACT. Source: CDC NCHS Health E-Stat 111 (2026), age-adjusted, adults 20+.",
    soWhat: "The eligible pool is structural and enormous (about 4 in 10 adults), but it has plateaued since roughly 2013 - so the bill is driven by how many are treated and at what price, not by a still-exploding disease.",
    predictMagnitude: false
  },
  priceArch: {
    title: "One molecule, several prices (semaglutide)",
    subtitle: "Monthly-equivalent price, U.S. (USD).",
    tier: "FACT",
    note: "FACT. Sources: KFF list price (2023); ICER net price (2025); NovoCare self-pay (2025); CMS Medicare negotiated price (effective 2027).",
    soWhat: "There is no single 'price.' The list sticker is roughly 2-3x the net, cash, and negotiated prices - so any forecast built on list price overstates the real bill several-fold.",
    predictMagnitude: false
  },
  paradox: {
    title: "Cost-effective per patient, unaffordable in aggregate",
    subtitle: "Modeled annual U.S. drug bill by share of the eligible pool treated (USD billions). Red line = what the system can readily absorb.",
    tier: "ESTIMATE",
    note: "ESTIMATE: bill = share treated x ~100M eligible x ~$7,000 net/yr (modeled, not a reported figure). The $0.88B absorbable-spend threshold and the finding that under 1% of the eligible can be treated before crossing it are FACT (ICER, 2025).",
    soWhat: "Cost-effective is a per-patient verdict; affordable is a volume verdict. Because the eligible pool is so large, even a sliver of it blows past what the system can absorb - which is why a 'great-value' drug can still be unfundable.",
    predictMagnitude: true,
    magnitudePrompt: "Before revealing: at 10% uptake, what is your guess for the annual bill, in $ billions?",
    magnitudeSuffix: "$B"
  },
  usPeer: {
    title: "U.S. list price vs cheapest peer shown",
    subtitle: "Monthly list price, same branded products (USD).",
    tier: "FACT",
    note: "FACT. Source: Peterson-KFF Health System Tracker (Aug 2023). List prices, not net; flagged as 2+ years old.",
    soWhat: "Across the class the U.S. list price runs roughly 3-6x the cheapest peer - so the U.S. bill is a price story as much as a prevalence story, and the two multipliers compound.",
    predictMagnitude: false
  },
  levers: {
    title: "What actually moves the realized bill",
    subtitle: "Modeled annual spend after each lever is applied (USD billions).",
    tier: "ILLUSTRATION",
    note: "ILLUSTRATION: modeled teaching values, not a forecast. They show how net price, real-world persistence (~1/3 at one year), and tighter eligibility each multiply the naive bill downward.",
    soWhat: "The realized bill is governed by net price and by the fact that most patients stop within a year - so adherence is a budget variable, not only a clinical one, and the list-price headline is the least useful number.",
    predictMagnitude: false
  }
};

const chartForQuestion = {};
Object.keys(questionBank).forEach((qid) => {
  const c = questionBank[qid].chartId;
  if (c) {
    if (!chartForQuestion[c]) chartForQuestion[c] = [];
    chartForQuestion[c].push(qid);
  }
});

const totalQuestionIds = Object.keys(questionBank);
const requiredBySection = {};
sectionList.forEach((s) => { requiredBySection[s.id] = s.questionIds; });

/* ----------------------------------------------------------------------- */
/* Helpers                                                                  */
/* ----------------------------------------------------------------------- */

const ACCENT = "#1f6f54";
const ACCENT_2 = "#b5651d";
const COLORS = ["#1f6f54", "#b5651d", "#33658a", "#7d5ba6", "#c44536", "#2a7f9e"];

function scoreOf(question, answer) {
  if (!answer || !answer.submitted) return 0;
  if (question.kind === "choice") return answer.selectedIndex === question.correctIndex ? 1 : 0;
  const v = Number(answer.value);
  if (!Number.isFinite(v)) return 0;
  return Math.abs(v - question.target) <= question.tolerance ? 1 : 0;
}

function fmtMoneyB(v) {
  if (v >= 1) return "$" + (v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)) + "B";
  return "$" + Math.round(v * 1000) + "M";
}
function fmtPct(v) { return v + "%"; }
function fmtUSD(v) { return "$" + v.toLocaleString(); }

/* ----------------------------------------------------------------------- */
/* Small presentational components                                          */
/* ----------------------------------------------------------------------- */

function SourceLink({ index }) {
  const s = sources[index];
  return <a href={s.url} target="_blank" rel="noreferrer">{s.label}</a>;
}

function TierTag({ tier }) {
  return <span className={"tier tier-" + tier.toLowerCase()}>{tier}</span>;
}

function MetricStrip() {
  const metrics = [
    { label: "U.S. adult obesity, 2021-23", value: "40.3%", tier: "FACT" },
    { label: "Semaglutide trial weight loss", value: "14.9%", tier: "FACT" },
    { label: "ICER net price (Wegovy)", value: "~$6,830/yr", tier: "FACT" },
    { label: "Eligible treatable under budget cap", value: "<1%", tier: "FACT" }
  ];
  return (
    <div className="metric-strip">
      {metrics.map((m) => (
        <div className="metric" key={m.label}>
          <span>{m.label}</span>
          <strong>{m.value}</strong>
          <TierTag tier={m.tier} />
        </div>
      ))}
    </div>
  );
}

function TopProgress({ answered, total }) {
  const pct = Math.round((answered / total) * 100);
  return <div className="top-progress"><span style={{ width: pct + "%" }} /></div>;
}

function ScoreBadge({ score, answered, total }) {
  return (
    <div className="score-badge">
      <div><span>Answered</span><strong>{answered}/{total}</strong></div>
      <div><span>Score</span><strong>{score}/{total}</strong></div>
    </div>
  );
}

function NavRail({ currentId, unlockedIds, onSelect }) {
  return (
    <nav className="nav-rail" aria-label="Article sections">
      {sectionList.map((section, i) => {
        const unlocked = unlockedIds.includes(section.id);
        const active = section.id === currentId;
        return (
          <button key={section.id} type="button" className={active ? "active" : ""} disabled={!unlocked} onClick={() => onSelect(section.id)}>
            <span className="nav-index">{String(i + 1).padStart(2, "0")}</span>
            <span className="nav-title">{section.shortTitle}</span>
            {!unlocked && <span className="lock" aria-hidden="true">lock</span>}
          </button>
        );
      })}
    </nav>
  );
}

function MaskedTooltip({ active, payload, label, revealed, formatter }) {
  if (!active || !payload || !payload.length) return null;
  if (!revealed) return <div className="tooltip"><strong>{label}</strong><p>Values masked - predict first.</p></div>;
  return (
    <div className="tooltip">
      <strong>{label}</strong>
      {payload.map((e) => (
        <p key={e.dataKey} style={{ color: e.color }}>{(e.name || e.dataKey) + ": " + (formatter ? formatter(e.value) : e.value)}</p>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Chart frame with predict-before-reveal mechanic                          */
/* ----------------------------------------------------------------------- */

function ChartFrame({ id, chartState, onChart, children }) {
  const cfg = chartConfig[id];
  const st = chartState[id] || {};
  const revealed = !!st.revealed;
  const [draft, setDraft] = React.useState(st.predictedSoWhat || "");
  const [mag, setMag] = React.useState(st.magnitude || "");
  const [why, setWhy] = React.useState(st.selfExplain || "");

  const canReveal = draft.trim().length >= 15 && (!cfg.predictMagnitude || String(mag).trim() !== "");

  function reveal() {
    if (!canReveal) return;
    onChart(id, { revealed: true, predictedSoWhat: draft.trim(), magnitude: mag });
  }

  return (
    <section className="chart-frame" aria-label={cfg.title}>
      <div className="chart-heading">
        <div>
          <span className="chart-kicker">{revealed ? "Revealed" : "Predict, then reveal"}</span>
          <h3>{cfg.title}</h3>
          <p>{cfg.subtitle}</p>
        </div>
        <span className={revealed ? "status-pill revealed" : "status-pill"}>{revealed ? "Values visible" : "Values masked"}</span>
      </div>

      <div className={revealed ? "chart-shell" : "chart-shell masked"}>{children(revealed)}</div>

      <div className="provenance"><TierTag tier={cfg.tier} /> {cfg.note}</div>

      {!revealed && (
        <div className="predict-box">
          <label htmlFor={"pred-" + id}>In one sentence, what is the "so what" of this chart - what does the pattern imply for a decision-maker?</label>
          <textarea id={"pred-" + id} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Your one-sentence prediction (15+ characters to unlock the reveal)" rows={2} />
          {cfg.predictMagnitude && (
            <div className="mag-row">
              <span>{cfg.magnitudePrompt}</span>
              <input value={mag} onChange={(e) => setMag(e.target.value)} inputMode="decimal" placeholder="number" aria-label={cfg.magnitudePrompt} />
              <em>{cfg.magnitudeSuffix}</em>
            </div>
          )}
          <button type="button" className="reveal-btn" disabled={!canReveal} onClick={reveal}>Reveal values</button>
        </div>
      )}

      {revealed && (
        <div className="soWhat-box">
          <p className="reader-sw"><strong>Your so what:</strong> {st.predictedSoWhat}{cfg.predictMagnitude ? "  (your magnitude guess: " + st.magnitude + " " + cfg.magnitudeSuffix + ")" : ""}</p>
          <p className="author-sw"><strong>Compare to the authored so what:</strong> {cfg.soWhat}</p>
          <label htmlFor={"why-" + id}>Optional - in one sentence, why does the data move this way? (stored for your summary)</label>
          <textarea id={"why-" + id} value={why} onChange={(e) => setWhy(e.target.value)} onBlur={() => onChart(id, { selfExplain: why })} rows={2} placeholder="Your explanation" />
        </div>
      )}
    </section>
  );
}

/* ----------------------------------------------------------------------- */
/* Charts                                                                   */
/* ----------------------------------------------------------------------- */

function maskedAxisTick(revealed, fmt) {
  return revealed ? fmt : function () { return ""; };
}

function PrevalenceChart({ chartState, onChart }) {
  return (
    <ChartFrame id="prevalence" chartState={chartState} onChart={onChart}>
      {(revealed) => (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={obesityTrend} margin={{ top: 20, right: 20, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} domain={[0, 50]} tickFormatter={maskedAxisTick(revealed, fmtPct)} width={40} />
            <Tooltip content={<MaskedTooltip revealed={revealed} formatter={fmtPct} />} />
            <Legend verticalAlign="top" height={28} />
            <Line type="monotone" dataKey="obesity" name="Obesity (BMI 30+)" stroke={ACCENT} strokeWidth={3} dot={{ r: 3 }}>
              {revealed && <LabelList dataKey="obesity" position="top" formatter={fmtPct} fontSize={11} />}
            </Line>
            <Line type="monotone" dataKey="severe" name="Severe obesity (BMI 40+)" stroke={ACCENT_2} strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

function PriceArchChart({ chartState, onChart }) {
  return (
    <ChartFrame id="priceArch" chartState={chartState} onChart={onChart}>
      {(revealed) => (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={priceArchitecture} margin={{ top: 20, right: 24, bottom: 30, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} angle={-12} textAnchor="end" height={56} fontSize={11} />
            <YAxis tickLine={false} axisLine={false} domain={[0, 1500]} tickFormatter={maskedAxisTick(revealed, fmtUSD)} width={56} />
            <Tooltip content={<MaskedTooltip revealed={revealed} formatter={fmtUSD} />} />
            <Bar dataKey="value" name="Monthly price" radius={[6, 6, 0, 0]}>
              {priceArchitecture.map((e, i) => <Cell key={e.label} fill={i === 0 ? ACCENT_2 : ACCENT} />)}
              {revealed && <LabelList dataKey="value" position="top" formatter={fmtUSD} fontSize={11} />}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

function ParadoxChart({ chartState, onChart }) {
  return (
    <ChartFrame id="paradox" chartState={chartState} onChart={onChart}>
      {(revealed) => (
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={budgetParadox} margin={{ top: 20, right: 24, bottom: 18, left: 6 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="share" tickLine={false} axisLine={false} fontSize={12} label={{ value: "Share of eligible pool treated", position: "insideBottom", offset: -8, fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} domain={[0, 180]} tickFormatter={maskedAxisTick(revealed, fmtMoneyB)} width={52} />
            <Tooltip content={<MaskedTooltip revealed={revealed} formatter={fmtMoneyB} />} />
            {revealed && <ReferenceLine y={ICER_THRESHOLD} stroke="#c44536" strokeWidth={2} strokeDasharray="5 3" label={{ value: "Absorbable spend ~$0.88B/yr", position: "insideTopLeft", fill: "#c44536", fontSize: 11 }} />}
            <Bar dataKey="budget" name="Annual bill" radius={[6, 6, 0, 0]} fill={ACCENT}>
              {revealed && <LabelList dataKey="budget" position="top" formatter={fmtMoneyB} fontSize={11} />}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

function UsPeerChart({ chartState, onChart }) {
  return (
    <ChartFrame id="usPeer" chartState={chartState} onChart={onChart}>
      {(revealed) => (
        <ResponsiveContainer width="100%" height={330}>
          <BarChart data={usPeerPrice} margin={{ top: 20, right: 24, bottom: 10, left: 6 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="drug" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} domain={[0, 1500]} tickFormatter={maskedAxisTick(revealed, fmtUSD)} width={56} />
            <Tooltip content={<MaskedTooltip revealed={revealed} formatter={fmtUSD} />} />
            <Legend verticalAlign="top" height={28} />
            <Bar dataKey="US" name="United States" radius={[6, 6, 0, 0]} fill={ACCENT_2}>
              {revealed && <LabelList dataKey="US" position="top" formatter={fmtUSD} fontSize={11} />}
            </Bar>
            <Bar dataKey="Peer" name="Cheapest peer shown" radius={[6, 6, 0, 0]} fill={ACCENT}>
              {revealed && <LabelList dataKey="Peer" position="top" formatter={fmtUSD} fontSize={11} />}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

function LeversChart({ chartState, onChart }) {
  return (
    <ChartFrame id="levers" chartState={chartState} onChart={onChart}>
      {(revealed) => (
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={leversBill} layout="vertical" margin={{ top: 12, right: 40, bottom: 6, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} domain={[0, 180]} tickFormatter={maskedAxisTick(revealed, fmtMoneyB)} />
            <YAxis type="category" dataKey="step" tickLine={false} axisLine={false} width={210} fontSize={11} />
            <Tooltip content={<MaskedTooltip revealed={revealed} formatter={fmtMoneyB} />} />
            <Bar dataKey="value" name="Annual spend" radius={[0, 6, 6, 0]}>
              {leversBill.map((e, i) => <Cell key={e.step} fill={COLORS[i % COLORS.length]} />)}
              {revealed && <LabelList dataKey="value" position="right" formatter={fmtMoneyB} fontSize={11} />}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

/* ----------------------------------------------------------------------- */
/* Question card with confidence + calibration                             */
/* ----------------------------------------------------------------------- */

function QuestionCard({ questionId, answer, chartState, onSubmit }) {
  const q = questionBank[questionId];
  const [selectedIndex, setSelectedIndex] = React.useState(answer?.selectedIndex ?? null);
  const [value, setValue] = React.useState(answer?.value ?? "");
  const [confidence, setConfidence] = React.useState(answer?.confidence ?? null);
  const submitted = answer?.submitted;
  const earned = scoreOf(q, answer);
  const isCase = q.typeLabel.indexOf("consulting") !== -1;

  const chartLocked = q.chartId && !(chartState[q.chartId] && chartState[q.chartId].revealed);

  React.useEffect(() => {
    setSelectedIndex(answer?.selectedIndex ?? null);
    setValue(answer?.value ?? "");
    setConfidence(answer?.confidence ?? null);
  }, [questionId]);

  function submit(e) {
    e.preventDefault();
    if (confidence === null) return;
    if (q.kind === "choice" && selectedIndex === null) return;
    if (q.kind === "estimate" && value === "") return;
    onSubmit(questionId, { submitted: true, selectedIndex, value, confidence });
  }

  let calibration = null;
  if (submitted) {
    const right = earned === 1;
    if (confidence === "high" && !right) calibration = "High confidence, incorrect - this is the gap most worth closing.";
    else if (confidence === "low" && right) calibration = "Low confidence, correct - trust this reasoning more.";
    else if (confidence === "high" && right) calibration = "High confidence, correct - well calibrated.";
    else if (confidence === "low" && !right) calibration = "Low confidence, incorrect - good instinct to doubt it.";
    else calibration = right ? "Medium confidence, correct." : "Medium confidence, incorrect - revisit the principle.";
  }

  return (
    <form className={[isCase ? "question-card case" : "question-card", submitted ? "answered" : ""].join(" ").trim()} onSubmit={submit}>
      <div className="question-topline">
        <span>{q.typeLabel}{isCase ? " - Case Prompt" : ""}</span>
        {submitted && <strong className={earned ? "ok" : "no"}>{earned ? "Correct" : "Review"}</strong>}
      </div>
      <h4>{q.prompt}</h4>

      {chartLocked && !submitted && <p className="lock-hint">Reveal the chart above before answering.</p>}

      {q.kind === "choice" ? (
        <div className="options-grid">
          {q.options.map((opt, i) => {
            const selected = selectedIndex === i;
            const correct = submitted && q.correctIndex === i;
            const wrong = submitted && selected && q.correctIndex !== i;
            return (
              <button type="button" key={i} className={[selected ? "selected" : "", correct ? "correct" : "", wrong ? "wrong" : ""].join(" ").trim()}
                onClick={() => !submitted && !chartLocked && setSelectedIndex(i)} disabled={submitted || chartLocked}>
                <span className="opt-letter">{String.fromCharCode(65 + i)}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="estimate-block">
          <div className="estimate-row">
            <em className="prefix">{q.suffix === "$B" ? "$" : ""}</em>
            <input type="number" value={value} onChange={(e) => setValue(e.target.value)} disabled={submitted || chartLocked} step={q.step} placeholder={q.placeholder} aria-label={q.prompt} />
            <span>{q.suffix === "$B" ? "B" : q.suffix}</span>
          </div>
          {!submitted && (
            <input type="range" className="slider" min={q.axisMin} max={q.axisMax} step={q.step} value={value === "" ? q.axisMin : value} onChange={(e) => setValue(e.target.value)} disabled={chartLocked} />
          )}
          {submitted && <EstimateAxis q={q} value={Number(value)} />}
        </div>
      )}

      {!submitted && (
        <div className="confidence-row" role="group" aria-label="Confidence before submitting">
          <span>Confidence:</span>
          {["low", "medium", "high"].map((c) => (
            <button type="button" key={c} className={confidence === c ? "conf active" : "conf"} onClick={() => setConfidence(c)} disabled={chartLocked}>{c}</button>
          ))}
        </div>
      )}

      {!submitted && <button className="submit-button" type="submit" disabled={chartLocked || confidence === null}>Submit answer</button>}

      {submitted && (
        <div className="answer-explanation">
          {calibration && <p className="calibration">{calibration}</p>}
          {q.kind === "estimate" && <p><strong>How to estimate this:</strong> {q.method}</p>}
          <p>{q.explanation}</p>
        </div>
      )}
    </form>
  );
}

function EstimateAxis({ q, value }) {
  const range = q.axisMax - q.axisMin;
  const userPct = Math.max(0, Math.min(100, ((value - q.axisMin) / range) * 100));
  const targetPct = Math.max(0, Math.min(100, ((q.target - q.axisMin) / range) * 100));
  const unit = q.suffix === "$B" ? "$" : "";
  const tail = q.suffix === "$B" ? "B" : q.suffix;
  return (
    <div className="dist-axis">
      <div className="dist-track">
        <span className="dist-band" style={{ left: Math.max(0, ((q.target - q.tolerance - q.axisMin) / range) * 100) + "%", width: ((2 * q.tolerance) / range) * 100 + "%" }} />
        <span className="dist-marker target" style={{ left: targetPct + "%" }} title="Actual" />
        <span className="dist-marker user" style={{ left: userPct + "%" }} title="You" />
      </div>
      <div className="dist-labels">
        <span>You: {unit}{value}{tail}</span>
        <span>Actual: {unit}{q.target}{tail} (band +/- {q.tolerance})</span>
      </div>
    </div>
  );
}

function QuestionGroup({ ids, answers, chartState, onSubmit }) {
  return (
    <div className="question-group">
      {ids.map((id) => <QuestionCard key={id} questionId={id} answer={answers[id]} chartState={chartState} onSubmit={onSubmit} />)}
    </div>
  );
}

/* ----------------------------------------------------------------------- */
/* Sections                                                                 */
/* ----------------------------------------------------------------------- */

function WarmupSection({ answers, chartState, onSubmit }) {
  return (
    <>
      <div className="section-prose">
        <p>Before today's topic, three quick retrieval questions from earlier articles. They are not about obesity drugs - they ask you to carry a prior principle into a new situation. Spacing and interleaving make ideas stick; recalling them cold is the point.</p>
        <p>The two prior pieces argued, respectively, that a technology's value lands where a workflow decision changes rather than at the demo, and that when one party's returns scale across markets while the other's costs are sunk and local, the scalable party captures the surplus. A third question checks a portable quantitative habit.</p>
      </div>
      <QuestionGroup ids={requiredBySection.warmup} answers={answers} chartState={chartState} onSubmit={onSubmit} />
    </>
  );
}

function IntroSection() {
  return (
    <>
      <div className="section-prose">
        <p>GLP-1 medicines are among the most clinically effective drugs ever launched for obesity - and that very effectiveness, multiplied by the size of the population that qualifies, makes them a budget threat to the systems that would benefit most. The paradox is that the same drug can be excellent value for one patient and unfundable for a payer covering everyone who is eligible.</p>
        <p>The scale is unlike anything in recent pharmaceutical history. About 40.3% of U.S. adults have obesity (CDC NCHS, 2021-23; <SourceLink index={0} />), and in pivotal trials semaglutide cut body weight by 14.9% and tirzepatide by 20.9% (<SourceLink index={2} />; <SourceLink index={3} />). In 2024 the two franchises sold more than $40 billion combined (company filings; <SourceLink index={8} />). Reviewers at ICER judged the drugs cost-effective per patient, yet concluded that fewer than 1% of eligible patients could be treated before annual spend crosses what the system can readily absorb (<SourceLink index={5} />).</p>
        <p>That breaks the usual intuition. We expect cost-effective therapies to be the easy ones to fund. Here the opposite holds: the better the value and the broader the eligibility, the larger the aggregate bill - because budget impact is per-patient cost multiplied by an enormous denominator.</p>
        <p>This note addresses three questions. First, how can a drug class be judged highly cost-effective per patient yet unaffordable in aggregate, and what reconciles the two? Second, why is the U.S. bill so much larger than peer nations' - is it price, prevalence, or both? Third, what actually changes the arithmetic - price negotiation, real-world adherence, or eligibility rules - and which lever moves the bill most?</p>
      </div>
      <MetricStrip />
      <div className="callout"><strong>How to read this article.</strong> Every number is tagged FACT (measured and cited), ESTIMATE (derived by stated arithmetic), or ILLUSTRATION (disclosed teaching values). At each chart you commit a one-sentence "so what" before the values reveal. Sections unlock as you answer.</div>
    </>
  );
}

function BackgroundSection({ answers, chartState, onSubmit }) {
  return (
    <>
      <div className="section-prose">
        <p>Two structural facts set up the entire debate: the eligible pool is vast, and the drug does not have one price. Start with the pool. U.S. adult obesity climbed steeply from the late 1980s to the late 2010s, then plateaued near 40% (<SourceLink index={0} />). On the standard BMI definition, about 100 million U.S. adults qualify, and ICER puts the count eligible for semaglutide - including those who are overweight with a comorbidity - at roughly 142 million (<SourceLink index={5} />). A market this large changes the economics of any per-patient price.</p>
        <p>Now the price. A single molecule, semaglutide, carries radically different prices depending on who is paying: a list "sticker," a lower net price after rebates, a manufacturer cash price, and a Medicare-negotiated price effective in 2027 (<SourceLink index={4} />; <SourceLink index={5} />; <SourceLink index={7} />). Confusing these is the most common error in obesity-drug budgeting, because the list price - the number in most headlines - is the one almost no payer actually pays.</p>
        <p>The structural gap that creates the central tension is the mismatch between a near-universal eligible pool and a price architecture built for a smaller, sicker population. When a drug priced like a specialty medicine becomes eligible for 40% of adults, the arithmetic that worked for a rare disease stops working.</p>
      </div>
      <PrevalenceChart chartState={chartState} onChart={onSubmit.onChart} />
      <PriceArchChart chartState={chartState} onChart={onSubmit.onChart} />
      <QuestionGroup ids={requiredBySection.background} answers={answers} chartState={chartState} onSubmit={onSubmit.onQuestion} />
    </>
  );
}

function Rq1Section({ answers, chartState, onSubmit }) {
  return (
    <>
      <div className="section-prose">
        <p>The first question is the heart of the paradox. ICER found the drugs cost-effective at conventional thresholds - roughly $53,400 per quality-adjusted life year for tirzepatide and $61,400 for injectable semaglutide - and even calculated that net prices sat below the value-based benchmark, meaning the per-patient price could rise and still represent fair value (<SourceLink index={5} />). By the per-patient test, these are good drugs at a reasonable price.</p>
        <p>And yet the same review concluded that at current prices fewer than 1% of eligible patients could be treated before annual spend crosses ICER's potential budget-impact threshold of about $880 million - the level of new spending the system can absorb in a year without crowding out other care (<SourceLink index={5} />). Both statements are true at once. The reconciling variable is the denominator: cost-effectiveness is judged on one patient, while affordability is judged on price multiplied by the number treated.</p>
        <p>The chart below makes the divergence concrete by modeling the aggregate bill as the share of the eligible pool treated rises. The per-patient price never changes; only the volume does. That is the entire mechanism, and it is why "is it cost-effective?" and "can we afford it?" are different questions with different answers.</p>
        <p>The honest limit of this section: a budget-impact threshold is a policy choice, not a law of nature, and offsetting health savings (fewer heart attacks, less diabetes) could shrink the net bill over time. But official scorers find those savings arrive slowly and are far smaller than near-term drug spending (<SourceLink index={6} />), so the divergence is real on any near-term horizon.</p>
      </div>
      <ParadoxChart chartState={chartState} onChart={onSubmit.onChart} />
      <QuestionGroup ids={requiredBySection.rq1} answers={answers} chartState={chartState} onSubmit={onSubmit.onQuestion} />
    </>
  );
}

function Rq2Section({ answers, chartState, onSubmit }) {
  return (
    <>
      <div className="section-prose">
        <p>If the bill is price times volume, the U.S. is extreme on both. On price, the list cost of the same branded products runs several times the cheapest peer nation: one month of Ozempic listed at $936 in the U.S. versus $169 in Japan, and Wegovy at $1,349 versus $296 in the Netherlands (<SourceLink index={4} />). Even allowing that net prices are lower than list everywhere, the U.S. pays a large multiple of what peers pay for an identical molecule.</p>
        <p>On volume, the U.S. has by far the highest obesity prevalence among wealthy nations - roughly a third of adults on the internationally comparable measure versus about 17% across peers (<SourceLink index={4} />). So the U.S. faces a high price multiplied by a high quantity, and the two compound rather than add. A common analytical error is to attribute the entire U.S. gap to "Americans are heavier," when the price level - set largely by how the U.S. market does and does not negotiate - is at least as large a factor.</p>
        <p>It is tempting to read causation into the co-movement: the U.S. has both the highest prices and the highest obesity, so perhaps prevalence drives price. But peers with high obesity still pay far less, which points to the price-setting regime, not the disease burden, as the driver. Correlation across countries is a starting point for questions, not a finding of cause.</p>
        <p>The section's honest limit: list prices overstate the true transatlantic gap because U.S. rebates are larger and less visible than in some peer systems. The direction of the gap is not in doubt, but its exact size depends on net prices that manufacturers do not fully disclose.</p>
      </div>
      <UsPeerChart chartState={chartState} onChart={onSubmit.onChart} />
      <QuestionGroup ids={requiredBySection.rq2} answers={answers} chartState={chartState} onSubmit={onSubmit.onQuestion} />
    </>
  );
}

function Rq3Section({ answers, chartState, onSubmit }) {
  return (
    <>
      <div className="section-prose">
        <p>If the naive bill is frightening, the realized bill is governed by three levers that each cut it down. The first is net versus list price: the real per-user cost is a fraction of the sticker, and large negotiated discounts push it lower still - Medicare's 2027 price for semaglutide is about 71% below list (<SourceLink index={7} />), and CBO assumes negotiation cuts the price per user by roughly a third after 2027 (<SourceLink index={6} />).</p>
        <p>The second lever is the one most people miss: adherence. In clinical trials, with nurses calling to prevent missed doses, most patients stay on therapy. In the real world, only about a third are still taking the drug at one year (<SourceLink index={9} />), partly because roughly three-quarters report gastrointestinal side effects (<SourceLink index={5} />). Low persistence shrinks the realized bill - and the realized health benefit - far below any projection that assumes patients stay on treatment.</p>
        <p>The third lever is eligibility design: covering the highest-risk subset rather than everyone with a qualifying BMI. The illustrative chart below shows how net price, persistence, and tighter eligibility multiply a naive bill downward. The values are modeled teaching numbers, not a forecast, but the structure is the point - the bill is a product of several fractions, and adherence is as much a budget variable as price.</p>
        <p>The limit here cuts both ways. Low adherence reduces spending but also wastes it: money is spent on patients who stop before getting durable benefit. A coverage design that improves persistence could raise spending while improving value - the opposite of cutting the bill by letting people fall off therapy.</p>
      </div>
      <LeversChart chartState={chartState} onChart={onSubmit.onChart} />
      <QuestionGroup ids={requiredBySection.rq3} answers={answers} chartState={chartState} onSubmit={onSubmit.onQuestion} />
    </>
  );
}

/* ----------------------------------------------------------------------- */
/* Apply-It fallback evaluator (no live API in a static artifact)           */
/* ----------------------------------------------------------------------- */

function evaluateApplyIt(text) {
  // Evidence-based local fallback. Checks for FOUR labeled parts and whether the
  // response climbs from observation to a quantified, decision-relevant implication.
  // (A secure server-side model call could replace this single function later.)
  const t = (text || "").toLowerCase();
  const gaps = [];
  const hasThesis = /so[- ]?what|thesis|because|therefore|implies|means that/.test(t) && t.length > 60;
  const hasAssumption = /assum|depends on|requires|only if|hinges|must hold|relies/.test(t);
  const hasDisconfirm = /disconfirm|undermin|wrong if|would fail|evidence against|contradict|falsif|breaks if/.test(t);
  const hasPremortem = /pre-?mortem|in 12 months|a year from now|fails because|most likely reason|if this fails/.test(t);
  const hasNumber = /[0-9]/.test(t);
  if (!hasThesis) gaps.push("a one-sentence so-what thesis");
  if (!hasAssumption) gaps.push("the single load-bearing assumption");
  if (!hasDisconfirm) gaps.push("the strongest disconfirming evidence");
  if (!hasPremortem) gaps.push("a one-line pre-mortem");
  let verdict;
  if (gaps.length === 0 && hasNumber) verdict = "Strong: all four parts are present and you quantified the implication. Pressure-test whether your disconfirming evidence is the kind you could actually observe.";
  else if (gaps.length === 0) verdict = "Complete but largely qualitative. Add a magnitude (a number, rate, or multiple) so the thesis is decision-relevant, not just directional.";
  else verdict = "Incomplete. Your weakest or missing part: " + gaps.join("; ") + ". A transfer is only finished when all four are explicit.";
  return { gaps: gaps, verdict: verdict, quantified: hasNumber };
}

function SummarySection({ answers, chartState, governing, setGoverning, apply, setApply, crosslink, setCrosslink, applyResult, runApply }) {
  const byType = { A: [0, 0], B: [0, 0], C: [0, 0], D: [0, 0], E: [0, 0] };
  function bucket(q) {
    if (q.typeLabel.indexOf("Type A") !== -1) return "A";
    if (q.typeLabel.indexOf("Type B") !== -1) return "B";
    if (q.typeLabel.indexOf("Type C") !== -1) return "C";
    if (q.typeLabel.indexOf("Type D") !== -1) return "D";
    if (q.typeLabel.indexOf("Type E") !== -1) return "E";
    return "B";
  }
  totalQuestionIds.forEach((id) => {
    const q = questionBank[id]; const a = answers[id];
    if (!a || !a.submitted) return;
    const b = bucket(q); byType[b][1] += 1; byType[b][0] += scoreOf(q, a);
  });

  // calibration + numeric bias
  let confWrong = 0, unsureRight = 0;
  totalQuestionIds.forEach((id) => {
    const q = questionBank[id]; const a = answers[id];
    if (!a || !a.submitted) return;
    const right = scoreOf(q, a) === 1;
    if (a.confidence === "high" && !right) confWrong += 1;
    if (a.confidence === "low" && right) unsureRight += 1;
  });
  const numericIds = totalQuestionIds.filter((id) => questionBank[id].kind === "estimate" && answers[id] && answers[id].submitted);
  let bias = null;
  if (numericIds.length) {
    let sum = 0;
    numericIds.forEach((id) => { sum += (Number(answers[id].value) - questionBank[id].target); });
    const avg = sum / numericIds.length;
    bias = avg === 0 ? "spot on" : (avg > 0 ? "you over-estimated magnitudes on average" : "you under-estimated magnitudes on average");
  }

  const missed = totalQuestionIds.filter((id) => answers[id] && answers[id].submitted && scoreOf(questionBank[id], answers[id]) === 0);

  const insights = [
    { h: "Cost-effective is not affordable.", p: "Per-patient value (good $/QALY) and aggregate budget (price x eligible population) are different verdicts; a huge eligible pool makes them diverge - the reason a great-value drug can still be unfundable." },
    { h: "Run the budget on net price, duration, and uptake - not the list headline.", p: "The realized bill is users x net price x time on therapy; list prices overstate it several-fold, and roughly one-third one-year persistence shrinks it again." },
    { h: "The U.S. bill is price x prevalence, and both multipliers are large.", p: "Prices run 3-6x peers and prevalence is roughly double; the biggest near-term lever on the realized bill is net-price negotiation plus adherence, not the sticker price." }
  ];

  const applyTable = [
    { row: "Daily riders", val: "400,000" },
    { row: "Avg public subsidy per free trip", val: "$2.10" },
    { row: "Operating days per year", val: "300" },
    { row: "Per-trip welfare gain (est.)", val: "positive, small" }
  ];

  return (
    <>
      <div className="section-prose"><p>You have seen five charts and worked the core arithmetic. Before the conclusion unlocks, produce your own reasoning - then compare it with the article's.</p></div>

      <div className="summary-card">
        <h3>Score by question type</h3>
        <div className="type-grid">
          {Object.keys(byType).map((k) => (
            <div key={k} className="type-pill"><span>Type {k}</span><strong>{byType[k][0]}/{byType[k][1]}</strong></div>
          ))}
        </div>
        <p className="calib-line">Calibration: {confWrong} answered with high confidence but wrong (the gaps most worth closing); {unsureRight} answered with low confidence but right (trust that reasoning more).{bias ? " On numeric estimates, " + bias + "." : ""}</p>
      </div>

      <div className="summary-card governing">
        <h3>First, your governing insight</h3>
        <p>You saw five charts. Write the single most non-obvious insight you would defend to a skeptical health-plan CFO.</p>
        <textarea value={governing} onChange={(e) => setGoverning(e.target.value)} rows={3} placeholder="Your governing insight (required before the authored takeaways reveal)" />
        {governing.trim().length >= 25 ? (
          <div className="insight-grid revealed">
            <p className="reveal-label">How your insight compares to the article's three:</p>
            {insights.map((c, i) => (
              <div className="insight-card" key={i}><span>Insight {i + 1}</span><h4>{c.h}</h4><p>{c.p}</p></div>
            ))}
          </div>
        ) : <p className="lock-hint">Write 25+ characters to reveal the three authored insight cards.</p>}
      </div>

      <div className="summary-card apply">
        <h3>Apply it - transfer to a new domain</h3>
        <p>A transit authority is considering free public transit. Per trip the welfare gain is positive; the catch is aggregate. Use the snippet, then give four labeled parts.</p>
        <table className="apply-table"><tbody>
          {applyTable.map((r) => <tr key={r.row}><td>{r.row}</td><td>{r.val}</td></tr>)}
        </tbody></table>
        <p className="apply-hint">Write: (1) a one-sentence so-what thesis (with a number), (2) the single load-bearing assumption, (3) the strongest disconfirming evidence, (4) a one-line pre-mortem ("If this fails in 12 months, the most likely reason is ___").</p>
        <textarea value={apply} onChange={(e) => setApply(e.target.value)} rows={5} placeholder="Label each part 1-4." />
        <h3 className="cross">Cross-link to a prior article</h3>
        <p>Name one prior-article principle - value-lives-at-adoption, or asymmetric-scalability - and say whether it reinforces or conflicts with today's per-unit-vs-aggregate lesson, and why.</p>
        <textarea value={crosslink} onChange={(e) => setCrosslink(e.target.value)} rows={2} placeholder="Your cross-link." />
        <button type="button" className="submit-button" onClick={runApply} disabled={apply.trim().length < 40 || crosslink.trim().length < 20}>Evaluate my reasoning</button>
        {applyResult && (
          <div className={"apply-result " + (applyResult.gaps.length === 0 ? "ok" : "gap")}>
            <p>{applyResult.verdict}</p>
            <small>This is a local evidence-based check of structure and quantification, not a grade of correctness. It looks for all four parts and whether you reached a quantified implication.</small>
          </div>
        )}
      </div>

      <div className="summary-card">
        <h3>Principles to revisit</h3>
        {missed.length === 0 ? <p>No missed questions - strong run. Revisit any chart where your predicted so-what diverged most from the authored one.</p> : (
          <ul className="revisit">
            {missed.map((id) => <li key={id}><strong>{questionBank[id].typeLabel}:</strong> {questionBank[id].principle}</li>)}
          </ul>
        )}
      </div>
    </>
  );
}

function ConclusionSection({ answers, chartState, onSubmit }) {
  return (
    <>
      <div className="section-prose">
        <p>The central challenge is not whether GLP-1 drugs work or whether they are good value per patient - both are largely settled - but whether a system can fund a fairly priced therapy for a near-universal eligible pool. The most likely trajectory under partial success is not "cover everyone" or "cover no one," but managed coverage: negotiated net prices, adherence support, and risk-based eligibility that treats the highest-benefit patients first.</p>
        <p>For payers and employers, the practical implication is to stop arguing about the list price and start engineering the realized bill: net price, time on therapy, and uptake are the variables that decide affordability, and at least two of them are controllable. For investors, the same logic means revenue depends less on the sticker and more on covered lives, persistence, and the pace of negotiation - which is why a 71% Medicare discount can coexist with a growing market.</p>
        <p>The broader implication is institutional. These drugs are the first mass-market test of a health system designed around scarce, expensive therapies meeting a treatment that nearly half the adult population could use. How that tension is resolved - through price, rationing, or adherence - will set the template for the next wave of broadly eligible, high-cost medicines, from Alzheimer's to gene therapies.</p>
        <p>The most important unresolved question is empirical and falsifiable: will net prices fall far enough, fast enough, that broad coverage fits within what the system can absorb - or will affordability be achieved only by the quiet rationing that low adherence already produces?</p>
      </div>
      <QuestionGroup ids={requiredBySection.conclusion} answers={answers} chartState={chartState} onSubmit={onSubmit.onQuestion} />
      <div className="section-prose sources-block">
        <h3>Sources</h3>
        <ol>
          {sources.map((s, i) => <li key={i}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></li>)}
        </ol>
        <p className="tier-key"><TierTag tier="FACT" /> measured and cited &nbsp; <TierTag tier="ESTIMATE" /> derived by stated arithmetic &nbsp; <TierTag tier="ILLUSTRATION" /> disclosed teaching values</p>
      </div>
    </>
  );
}

/* ----------------------------------------------------------------------- */
/* App                                                                      */
/* ----------------------------------------------------------------------- */

function App() {
  const [currentId, setCurrentId] = React.useState("warmup");
  const [answers, setAnswers] = React.useState({});
  const [chartState, setChartState] = React.useState({});
  const [governing, setGoverning] = React.useState("");
  const [apply, setApply] = React.useState("");
  const [crosslink, setCrosslink] = React.useState("");
  const [applyResult, setApplyResult] = React.useState(null);

  function onQuestion(id, payload) {
    setAnswers((prev) => ({ ...prev, [id]: { ...prev[id], ...payload } }));
  }
  function onChart(id, payload) {
    setChartState((prev) => ({ ...prev, [id]: { ...prev[id], ...payload } }));
  }
  const submitBundle = { onQuestion, onChart };

  function sectionComplete(sectionId) {
    const req = requiredBySection[sectionId] || [];
    return req.every((id) => answers[id] && answers[id].submitted);
  }

  // The summary section gates the conclusion on a committed governing insight, Apply-It, and cross-link.
  const summaryDone = governing.trim().length >= 25 && apply.trim().length >= 40 && crosslink.trim().length >= 20;

  // unlock logic: a section unlocks only when every prior section is complete
  const unlockedIds = React.useMemo(() => {
    const out = [];
    let gate = true;
    for (let i = 0; i < sectionList.length; i++) {
      const s = sectionList[i];
      if (gate) out.push(s.id);
      const done = s.id === "summary" ? summaryDone : sectionComplete(s.id);
      if (!done) gate = false;
    }
    return out;
  }, [answers, summaryDone]);

  const answered = totalQuestionIds.filter((id) => answers[id] && answers[id].submitted).length;
  const score = totalQuestionIds.reduce((sum, id) => sum + scoreOf(questionBank[id], answers[id]), 0);

  const idx = sectionList.findIndex((s) => s.id === currentId);
  const section = sectionList[idx];
  const nextSection = sectionList[idx + 1];
  const canAdvance = section.questionIds.length === 0 ? (currentId !== "summary" || summaryDone) : sectionComplete(currentId);

  function goNext() {
    if (!nextSection) return;
    if (!canAdvance) return;
    setCurrentId(nextSection.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function runApply() { setApplyResult(evaluateApplyIt(apply + " " + crosslink)); }

  let body = null;
  if (currentId === "warmup") body = <WarmupSection answers={answers} chartState={chartState} onSubmit={onQuestion} />;
  else if (currentId === "intro") body = <IntroSection />;
  else if (currentId === "background") body = <BackgroundSection answers={answers} chartState={chartState} onSubmit={submitBundle} />;
  else if (currentId === "rq1") body = <Rq1Section answers={answers} chartState={chartState} onSubmit={submitBundle} />;
  else if (currentId === "rq2") body = <Rq2Section answers={answers} chartState={chartState} onSubmit={submitBundle} />;
  else if (currentId === "rq3") body = <Rq3Section answers={answers} chartState={chartState} onSubmit={submitBundle} />;
  else if (currentId === "summary") body = <SummarySection answers={answers} chartState={chartState} governing={governing} setGoverning={setGoverning} apply={apply} setApply={setApply} crosslink={crosslink} setCrosslink={setCrosslink} applyResult={applyResult} runApply={runApply} />;
  else if (currentId === "conclusion") body = <ConclusionSection answers={answers} chartState={chartState} onSubmit={submitBundle} />;

  return (
    <>
      <TopProgress answered={answered} total={totalQuestionIds.length} />
      <header className="masthead">
        <div className="masthead-inner">
          <div>
            <p className="kicker">Interactive Research Note - Healthcare and BioTech Economics</p>
            <h1>The GLP-1 Paradox: A Cost-Effective Drug the System May Not Afford</h1>
            <p className="dek">Why the most effective obesity medicines ever launched are, at population scale, a budget problem - and what actually changes the math.</p>
          </div>
          <ScoreBadge score={score} answered={answered} total={totalQuestionIds.length} />
        </div>
      </header>

      <NavRail currentId={currentId} unlockedIds={unlockedIds} onSelect={(id) => { if (unlockedIds.includes(id)) { setCurrentId(id); window.scrollTo({ top: 0, behavior: "smooth" }); } }} />

      <main className="article">
        <div className="section-head">
          <span className="eyebrow">{section.eyebrow}</span>
          <h2>{section.title}</h2>
        </div>
        {body}

        <div className="section-foot">
          {!sectionComplete(currentId) && section.questionIds.length > 0 && <p className="gate-note">Answer the questions in this section to unlock the next one.</p>}
          {currentId === "summary" && !canAdvance && <p className="gate-note">Commit your governing insight, Apply-It transfer, and cross-link to unlock the conclusion.</p>}
          {nextSection && <button className="next-btn" onClick={goNext} disabled={!canAdvance}>Next: {nextSection.shortTitle}</button>}
          {!nextSection && <p className="end-note">End of article. Score: {score}/{totalQuestionIds.length}. Revisit any masked chart to compare your predicted so-what with the authored one.</p>}
        </div>
      </main>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
