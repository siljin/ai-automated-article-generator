/*
  Interactive Research Article: The Immaculate Disinflation
  How U.S. inflation fell ~9% -> ~3% without the recession the "sacrifice ratio" demanded.
  Static React learning artifact. Source copy; the same code is inlined into index.html.
  Data provenance is tagged FACT / ESTIMATE / ILLUSTRATION throughout.
*/

const {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
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
  { label: "BLS, The Economics Daily: Consumer prices up 9.1% over the year ended June 2022 (Jul 2022)", url: "https://www.bls.gov/opub/ted/2022/consumer-prices-up-9-1-percent-over-the-year-ended-june-2022-largest-increase-in-40-years.htm" },
  { label: "BLS, Consumer Price Index Summary (March 2026 data, released Apr 10, 2026)", url: "https://www.bls.gov/news.release/cpi.nr0.htm" },
  { label: "BLS, The Economics Daily: Unemployment rate 3.4 percent in April 2023", url: "https://www.bls.gov/opub/ted/2023/unemployment-rate-3-4-percent-in-april-2023.htm" },
  { label: "BLS, The Employment Situation (May 2026); unemployment 4.3%, range 4.3-4.5% since Jul 2025", url: "https://www.bls.gov/news.release/empsit.nr0.htm" },
  { label: "Figura & Waller (Federal Reserve FEDS Notes): What does the Beveridge curve tell us about a soft landing? (Jul 2022)", url: "https://www.federalreserve.gov/econres/notes/feds-notes/what-does-the-beveridge-curve-tell-us-about-the-likelihood-of-a-soft-landing-20220729.html" },
  { label: "Blanchard, Domash & Summers (PIIE): Bad news for the Fed from the Beveridge space (Jul 2022)", url: "https://www.piie.com/publications/policy-briefs/2022/bad-news-fed-beveridge-space" },
  { label: "Bernanke & Blanchard (Brookings): What Caused the U.S. Pandemic-Era Inflation? (2023)", url: "https://www.brookings.edu/wp-content/uploads/2023/06/WP86-Bernanke-Blanchard_6.13.pdf" },
  { label: "FRED Blog (St. Louis Fed): The job openings-to-unemployment ratio is back in balance (Jul 2024)", url: "https://fredblog.stlouisfed.org/2024/07/the-job-openings-to-unemployment-ratio-labor-markets-are-in-better-balance/" },
  { label: "San Francisco Fed: Reducing Inflation along a Nonlinear Phillips Curve (Economic Letter, 2023)", url: "https://www.frbsf.org/research-and-insights/publications/economic-letter/2023/07/reducing-inflation-along-nonlinear-phillips-curve/" },
  { label: "Konczal (Roosevelt Institute): Did We Tame Inflation With No Economic Cost? The Sacrifice Ratio Has the Wrong Sign (2024)", url: "https://rooseveltinstitute.org/publications/supply-side-expansion-has-driven-the-decline-in-inflation/" },
  { label: "Congress.gov CRS: The Sahm Rule Trigger - Is the United States in a Recession? (2024)", url: "https://www.congress.gov/crs-product/IN12410" }
];

/* ----------------------------------------------------------------------- */
/* Chart data (every value tagged in the visible provenance note)          */
/* ----------------------------------------------------------------------- */

// FACT - BLS CPI-U (12-mo % change, headline) and BLS unemployment rate (CPS, %).
// Verified anchors: CPI 9.1% (Jun 2022), 6.5% (Dec 2022), 3.0% (Jun 2023), 3.4% (Dec 2023),
// 2.9% (Dec 2024); unemployment low 3.4% (Apr 2023). Other months are from the same BLS series.
const paradoxData = [
  { period: "Jun '21", cpi: 5.4, unemp: 5.9 },
  { period: "Dec '21", cpi: 7.0, unemp: 3.9 },
  { period: "Jun '22", cpi: 9.1, unemp: 3.6 },
  { period: "Dec '22", cpi: 6.5, unemp: 3.5 },
  { period: "Jun '23", cpi: 3.0, unemp: 3.6 },
  { period: "Dec '23", cpi: 3.4, unemp: 3.7 },
  { period: "Jun '24", cpi: 3.0, unemp: 4.1 },
  { period: "Dec '24", cpi: 2.9, unemp: 4.1 }
];

// FACT - Beveridge trace: x = unemployment rate (%), y = job-openings (vacancy) rate (%).
// Openings rate peak 7.4% (Mar 2022) and the ~2019 baseline are JOLTS FACTs; the
// vacancy-to-unemployment ratio returned to its ~2019 level (~1.2) by mid-2024 (FRED).
// 2023 point is approximate. Connected in time order to trace the curve.
const beveridge = [
  { u: 3.7, v: 4.5, label: "2019" },
  { u: 3.6, v: 7.4, label: "Mar 2022" },
  { u: 3.6, v: 5.8, label: "2023" },
  { u: 4.1, v: 4.5, label: "2024" }
];

// FACT (estimates from named analysts) - output sacrifice ratio = cumulative % of a year's
// GDP lost per 1 pp of disinflation. Ball (1994) Volcker ~1.8; hawk expectation 2022 (Furman) ~6;
// realized 2022-24 ~0 (slightly negative, ~ -0.04; Konczal/Roosevelt 2024).
const sacrificeData = [
  { label: "Volcker era (Ball 1994)", value: 1.8 },
  { label: "2022 hawk view (Furman)", value: 6.0 },
  { label: "Realized 2022-24", value: 0.0 }
];

// ESTIMATE / illustrative split - contribution to headline inflation (percentage points),
// supply vs demand. Totals are anchored to verified headline CPI; the supply/demand division
// follows Bernanke-Blanchard (2023): supply shocks drove ~2/3-3/4 of the 2020Q4-2022Q2 surge.
// NOT a reported BLS decomposition.
const decompData = [
  { period: "2021 surge", supply: 4.6, demand: 2.4 },
  { period: "2022 peak", supply: 6.0, demand: 3.1 },
  { period: "2023 fall", supply: 1.5, demand: 1.5 },
  { period: "2024", supply: 1.0, demand: 1.9 }
];

// FACT - the 2024-2026 test. BLS CPI-U (12-mo % change) and unemployment rate.
// Verified: CPI 2.9% (Dec 2024) and 3.3% (12 mo. ending Mar 2026, energy-driven);
// unemployment 4.6% (Nov 2025) and 4.3% (May 2026). 2025 CPI affected by a data gap
// from the 2025 appropriations lapse; intermediate points from the BLS series.
const testData = [
  { period: "Q4 '24", cpi: 2.9, unemp: 4.1 },
  { period: "Q2 '25", cpi: 2.9, unemp: 4.2 },
  { period: "Q4 '25", cpi: 3.0, unemp: 4.6 },
  { period: "Q1 '26", cpi: 3.3, unemp: 4.4 }
];

/* ----------------------------------------------------------------------- */
/* Section + question model                                                 */
/* ----------------------------------------------------------------------- */

const sectionList = [
  { id: "warmup", eyebrow: "Cumulative warm-up", title: "What Stuck From Earlier Articles", shortTitle: "Warm-Up", questionIds: ["wu1", "wu2", "wu3"] },
  { id: "intro", eyebrow: "Opening frame", title: "A Disinflation That Wasn't Supposed to Be Painless", shortTitle: "Intro", questionIds: [] },
  { id: "background", eyebrow: "Trajectory and structure", title: "Six Points Down, and Almost No One Lost a Job", shortTitle: "Background", questionIds: ["bg1", "bg2", "bg3"] },
  { id: "rq1", eyebrow: "Research question 1", title: "Did It Defy the Sacrifice Ratio, or Start Somewhere Strange?", shortTitle: "RQ1: Cost", questionIds: ["rq1a", "rq1b"] },
  { id: "rq2", eyebrow: "Research question 2", title: "The Fed, or the Healing of Supply?", shortTitle: "RQ2: Cause", questionIds: ["rq2a", "rq2b"] },
  { id: "rq3", eyebrow: "Research question 3", title: "Structural or Lucky - and What Would Falsify It?", shortTitle: "RQ3: Test", questionIds: ["rq3a", "rq3b"] },
  { id: "summary", eyebrow: "Learning summary", title: "Produce Your Insight, Then Compare", shortTitle: "Summary", questionIds: [] },
  { id: "conclusion", eyebrow: "Synthesis", title: "Skill, Structure, or a Favorable Episode", shortTitle: "Conclusion", questionIds: ["concl"] }
];

const questionBank = {
  /* ---------------- Warm-up: prior-article principles, new framings ----------------- */
  wu1: {
    kind: "choice",
    typeLabel: "Type B - cross-article transfer",
    chartId: null,
    prompt: "From the AI-product article: a logistics firm pilots an AI route-optimizer that cut planning time 80% in a vendor demo. Leadership wants to book the savings. Which is the strongest reason the realized ROI may disappoint?",
    options: [
      "The model's accuracy will probably fall below 80% in production, which is the only thing that determines value.",
      "Competitors will copy the tool, so the demo advantage erodes regardless of internal use.",
      "Value is captured only where a workflow decision actually changes and a measured outcome (fuel, on-time rate) improves; an impressive demo is not a booked, sourced return.",
      "The vendor's price will rise at renewal, eliminating the savings."
    ],
    correctIndex: 2,
    confidenceRequired: true,
    principle: "Value lands where a workflow decision changes, not at the demo (carried from the AI-PM article).",
    explanation: "Principle: realized value = capability x adoption x a measured outcome x captured price; a demo proves only capability. A overweights one input (accuracy) as if it were value; B and D are real risks but not why demo value fails to convert. Where this generalizes: today's disinflation has the same trap - a falling inflation print is not the same as a proven, repeatable Fed capability until you see the mechanism that produced it."
  },
  wu2: {
    kind: "choice",
    typeLabel: "Type B - cross-article transfer",
    chartId: null,
    prompt: "From the World Cup article: a streaming platform licenses a hit series to 100+ countries while local studios finance and shoot each season. Who captures the durable surplus, and who bears the risk?",
    options: [
      "The studios, because they own the physical sets and crews and did the hard work.",
      "The platform: it owns the portable, scalable distribution rights that replicate across markets, while the studio's costs are sunk and local, so the platform captures the surplus and the studio bears the risk.",
      "Whoever is physically located in the largest market captures the surplus.",
      "Risk and surplus are shared equally because both parties signed the same contract."
    ],
    correctIndex: 1,
    confidenceRequired: true,
    principle: "The owner of the scarce, portable asset captures the durable surplus; the supplier of fixed, local assets bears the risk (from the FIFA article).",
    explanation: "Principle: when one side's returns replicate across markets and the other's costs are sunk and place-specific, the scalable side captures disproportionate surplus. A confuses effort/physical assets with economic capture; C confuses location with capture; D ignores the asymmetry the contract sits on top of. Where this generalizes: franchisor vs franchisee, platform vs supplier - and any time you ask 'who owns the thing that scales?'"
  },
  wu3: {
    kind: "choice",
    typeLabel: "Type B - cross-article transfer",
    chartId: null,
    prompt: "From the GLP-1 article: a city's per-ride transit subsidy is clearly cost-effective for each rider. Why might it still blow the annual budget?",
    options: [
      "Because cost-effective per rider automatically means affordable in aggregate, so it cannot blow the budget.",
      "Because the per-ride welfare gain must be negative if the budget is strained.",
      "Because transit subsidies are never cost-effective in the first place.",
      "Because aggregate cost equals a small per-unit price multiplied by a very large number of rides; a huge denominator turns a cheap-per-unit program into a large total - per-unit value and aggregate budget are different verdicts."
    ],
    correctIndex: 3,
    confidenceRequired: true,
    principle: "Per-unit value and aggregate budget impact are different verdicts; aggregate = volume x net price x duration (from the GLP-1 article).",
    explanation: "Principle: a great per-unit number times an enormous N can still be unaffordable; cost-effectiveness (a ratio) and budget impact (a total) diverge when volume is large. A and B collapse the two verdicts; D denies the premise. Where this generalizes: any population-scale program - and, conceptually, today's article, where one number (an inflation rate) is not the same as the mechanism or the cost behind it."
  },

  /* ---------------- Background ----------------- */
  bg1: {
    kind: "choice",
    typeLabel: "Type A - chart reading",
    chartId: "paradox",
    prompt: "Headline inflation went from 9.1% (Jun 2022) to about 3.0% (mid-2023). Which statement is both arithmetically correct and correctly stated?",
    options: [
      "Inflation fell about 67%, which means the overall price level fell about 67%.",
      "Inflation fell 6.1%, and a 6.1% drop from 9.1% gets most of the way to zero.",
      "Inflation fell about 6.1 percentage points - roughly a two-thirds decline in the rate - but the price level kept rising, just more slowly.",
      "Because the rate is still positive, nothing meaningful changed for the price level."
    ],
    correctIndex: 2,
    confidenceRequired: true,
    principle: "Percentage points are not percent, and a falling inflation rate is disinflation, not deflation (rate vs level).",
    explanation: "Principle: 9.1 -> 3.0 is a fall of 6.1 percentage points (about a two-thirds relative decline in the rate), but the rate stayed positive, so prices rose more slowly - they did not fall. A confuses a rate decline with a price-level fall (deflation error); B uses '%' for a percentage-point move; D denies that disinflation is meaningful. Where this generalizes: vote shares, conversion lifts, interest rates - always say whether you mean points or percent, and whether you mean the rate or the level."
  },
  bg2: {
    kind: "choice",
    typeLabel: "Type B - trend reasoning",
    chartId: "beveridge",
    prompt: "From 2022 to 2024 the economy slid down a nearly vertical segment of this curve: vacancies fell sharply while unemployment rose only modestly. What does that near-vertical move most strongly suggest?",
    options: [
      "Starting from a record vacancy overhang, firms could cancel unfilled openings instead of laying people off - so labor demand cooled without big job losses (the Figura-Waller 'soft landing' case).",
      "The curve proves the Fed's rate hikes had no effect on the labor market at all.",
      "Because vacancies and unemployment moved at all, a deep recession must already be underway.",
      "Vacancies and unemployment always move one-for-one, so unemployment must rise about three more points next."
    ],
    correctIndex: 0,
    confidenceRequired: true,
    principle: "Far from its normal operating point, a relationship can be locally near-vertical, so cooling demand need not cost jobs - but that is a starting-condition argument, not a permanent repeal.",
    explanation: "Principle: with ~2 openings per job-seeker, demand could be drained by deleting vacancies rather than workers - exactly Figura & Waller's case, against which Blanchard-Domash-Summers warned that vacancies historically never fall far without unemployment rising. B overclaims causation; C extrapolates motion into recession; D assumes a fixed one-for-one slope (ignores the nonlinearity). Where this generalizes: queues, inventories, any system far from equilibrium absorbs a shock differently than near it."
  },
  bg3: {
    kind: "estimate",
    typeLabel: "Type D - estimation",
    chartId: null,
    prompt: "In 2022, economists such as Jason Furman cited a 'sacrifice ratio' near 6 - about 6 cumulative percentage points of GDP lost for each 1 point of disinflation. If headline inflation fell about 6 points, how many cumulative percentage points of GDP would that ratio have implied as the cost?",
    suffix: " pts GDP",
    target: 36,
    tolerance: 6,
    axisMin: 0,
    axisMax: 60,
    step: 1,
    placeholder: "e.g. 36",
    confidenceRequired: true,
    method: "Sacrifice ratio x disinflation = 6 x 6 = ~36 cumulative points of GDP. Realized output cost was about zero - GDP actually rose - so the realized output sacrifice ratio was near 0, even slightly negative (Konczal/Roosevelt 2024). Bounds: use Ball's (1994) Volcker-era ratio of ~1.8 instead and the implied cost is ~11 points; the realized ~0 sits below even that. Unit caution: a sacrifice ratio is cumulative point-YEARS, a stock-vs-flow distinction worth respecting - but on any version, the realized cost was a small fraction of, or the wrong sign from, the prediction.",
    principle: "A sacrifice ratio is cost-per-point times points; the same disinflation implies wildly different costs depending on the assumed ratio - and a realized ratio of ~0 (wrong sign) is the fingerprint of a supply-driven disinflation.",
    explanation: "Plugging Furman's ~6 into a ~6-point disinflation implies roughly 36 cumulative points of lost GDP. Instead, output grew. Where this generalizes: any 'this will cost X' projection rests on a ratio you assumed - check whether the realized cost even has the sign your model requires."
  },

  /* ---------------- RQ1: cost / sacrifice ratio ----------------- */
  rq1a: {
    kind: "choice",
    typeLabel: "Type B - trend reasoning",
    chartId: "sacrifice",
    prompt: "The realized cost of the disinflation came in near zero - even slightly negative - versus the 2-to-6 the literature expected. Which interpretation is best supported?",
    options: [
      "A near-zero reading proves inflation and unemployment are unrelated in every period.",
      "It proves the Fed's rate hikes single-handedly produced a costless disinflation.",
      "It is measurement error; a sacrifice ratio literally cannot be near zero.",
      "Output rose while inflation fell - which a demand-only Phillips-curve story cannot generate, but a supply-driven disinflation (healing supply chains, energy, returning labor supply) layered on anchored expectations can."
    ],
    correctIndex: 3,
    confidenceRequired: true,
    principle: "When the 'cost' of disinflation has the wrong sign, the shock was on the supply side, not engineered demand destruction - the sign of the co-movement tells you the mechanism.",
    explanation: "Principle: falling inflation with rising output is the signature of an outward supply shift, not a demand contraction; that is why the realized sacrifice ratio broke the textbook. A overgeneralizes to all periods; B credits one cause and ignores supply; C denies the data. Where this generalizes: if a 'cost' shows up with the wrong sign (e.g., a price war where both volume and margin rise), you mismodeled the mechanism."
  },
  rq1b: {
    kind: "choice",
    typeLabel: "Type C - consulting case",
    chartId: null,
    prompt: "Case: A pension fund's macro strategist argues the 2022-24 episode proves the Fed can always disinflate without a recession, and wants to underweight recession risk for the next tightening cycle. Which assumption must hold for 'painless disinflation is repeatable,' and which is thinnest in the evidence?",
    options: [
      "That inflation expectations are irrelevant; the claim holds regardless of them.",
      "That the next disinflation also starts from a record vacancy overhang, with anchored expectations and self-healing supply shocks - the thinnest link, because 2022's near-vertical Beveridge segment and one-time supply normalization may not recur.",
      "That the Fed cuts rates quickly afterward; nothing else matters to the claim.",
      "That GDP growth stays positive by accounting definition, so a recession is impossible."
    ],
    correctIndex: 1,
    confidenceRequired: true,
    principle: "The load-bearing assumption is the one the conclusion needs most and the evidence supports least - here, that 2022's special starting conditions generalize.",
    explanation: "Principle: 'repeatable' rests on the starting point repeating (overhang + anchored expectations + transitory supply shocks), exactly what Blanchard-Domash-Summers warned might be a one-off. A inverts the role of expectations (they are central); C and D are true-ish but not what the repeatability claim hinges on. Where this generalizes: never extrapolate a result obtained under extreme initial conditions to normal ones - a stress test passed in unusual liquidity says little about normal times."
  },

  /* ---------------- RQ2: cause / correlation vs causation ----------------- */
  rq2a: {
    kind: "choice",
    typeLabel: "Type B - correlation vs causation",
    chartId: "decomp",
    prompt: "Inflation fell sharply while the Fed raised rates 525 basis points, so the two are strongly correlated. Which is the strongest reason NOT to conclude the rate hikes caused most of the disinflation?",
    options: [
      "Correlation can never indicate causation, so the hikes definitely did nothing.",
      "Much of the decline tracks supply-side healing (supply chains, energy, autos), and the euro area disinflated similarly with less tightening - a confounder and a comparison case that monetary policy alone does not explain.",
      "Because rates rose first, they must have caused everything that followed.",
      "Inflation is always and everywhere purely monetary, so only the Fed could possibly matter."
    ],
    correctIndex: 1,
    confidenceRequired: true,
    principle: "To move from correlation to causation, rule out confounders and use a comparison case; the supply channel and the cross-country comparison are exactly that.",
    explanation: "Principle: Bernanke-Blanchard attribute about two-thirds to three-quarters of the surge to supply shocks that then reversed on their own timetable, and peers disinflated with less tightening - so the hikes plausibly helped (especially by anchoring expectations) without being the main driver. A is causation-nihilism; C is post hoc; D assumes the conclusion. Where this generalizes: when a policy and an outcome move together, look for a third driver and a control group before crediting the policy."
  },
  rq2b: {
    kind: "estimate",
    typeLabel: "Type D - estimation",
    chartId: null,
    prompt: "Name your decomposition path first, then estimate it: in March 2022 there were about 12 million job openings (FACT, JOLTS). What was the vacancy-to-unemployment ratio at that peak - job openings per unemployed person?",
    suffix: " x",
    target: 2.0,
    fermi: true,
    fermiFactor: 1.5,
    tolerance: 0.5,
    axisMin: 0.5,
    axisMax: 4,
    step: 0.1,
    placeholder: "e.g. 2.0",
    confidenceRequired: true,
    method: "Decompose: unemployed = labor force (~165 million) x unemployment rate (~3.6%) ~= 6 million. Then V/U = 12M openings / 6M unemployed ~= 2.0. The ratio did peak near 2.0 in March 2022 (FRED) and fell back to its ~2019 level of about 1.2 by mid-2024. Bounds: guessing 5-7M unemployed lands you at 1.7-2.4, all near the true ~2.0 - an unprecedented overhang of roughly two openings per job-seeker.",
    principle: "Decompose an unfamiliar ratio into a stock and a rate you can each estimate, rather than guessing the whole - naming the path first is what makes a Fermi estimate auditable.",
    explanation: "The ~2.0 overhang is the precondition for the whole 'soft landing': it is why vacancies could fall by a third while unemployment barely moved. Where this generalizes: size any ratio (customers per rep, claims per adjuster) by estimating numerator and denominator separately and stating the path."
  },

  /* ---------------- RQ3: structural or lucky / falsification ----------------- */
  rq3a: {
    kind: "choice",
    typeLabel: "Type A - chart reading",
    chartId: "theTest",
    prompt: "By early 2026 inflation has ticked back toward 3.3% while unemployment has risen to the mid-4% range. Taken together, what does this combination most suggest about the 2022-24 disinflation?",
    options: [
      "The earlier disinflation leaned on one-time supply healing; a fresh supply shock (energy) can re-raise inflation even as demand softens - so 'immaculate' may describe a favorable episode, not a permanent, repeatable capability.",
      "Inflation and unemployment cannot both rise, so this must be a data error.",
      "Rising unemployment guarantees inflation returns to 2% within months.",
      "The 2022-24 episode is fully repeatable on demand alone; supply played no role."
    ],
    correctIndex: 0,
    confidenceRequired: true,
    principle: "An episode that depended on special, one-time conditions is not a general capability; a re-test under a new shock is what distinguishes structure from luck.",
    explanation: "Principle: inflation up and unemployment up at once (a stagflationary tilt) is precisely the mix a supply shock produces and a demand story struggles to explain; it tests whether the earlier 'painless' result was structural. B denies a real combination; C is mechanical Phillips extrapolation; D contradicts the supply evidence. Where this generalizes: a strategy that worked in one favorable regime must be re-tested when the regime flips."
  },
  rq3b: {
    kind: "choice",
    typeLabel: "Type C - consulting case",
    chartId: null,
    prompt: "Case: A central-bank watcher at an asset manager must judge whether the 2026 energy-driven inflation uptick is transitory (like 2021-22's supply shocks) or persistent. Which single variable most determines the call - and what is the load-bearing assumption?",
    options: [
      "Today's level of the federal funds rate; nothing else matters to the call.",
      "The current unemployment rate alone, which mechanically sets future inflation.",
      "Whether long-run inflation expectations stay anchored near 2-3% - the assumption the whole 'transitory' read rests on; in 2022 long-run expectations held near 3% and re-anchored, but a second supply shock arriving with expectations already stretched is what could break them.",
      "The price of oil, which reverts by definition, so the shock is automatically transitory."
    ],
    correctIndex: 2,
    confidenceRequired: true,
    principle: "In a supply-shock disinflation, the load-bearing variable is anchored expectations - the belief that turns a one-time price jump into either a blip or a spiral.",
    explanation: "Principle: a transitory read depends on expectations holding; that is the assumption to monitor and the thing whose failure would falsify it. A and B elevate single levers that do not, by themselves, set the path; D assumes the answer. Where this generalizes: in any system with feedback (bank runs, currency pegs, inflation), the load-bearing variable is the belief that holds the equilibrium together."
  },

  /* ---------------- Conclusion: Type E with falsification ----------------- */
  concl: {
    kind: "choice",
    typeLabel: "Type E - implication bridge",
    chartId: null,
    prompt: "Given the full analysis, which decision is most directly supported - and which observation would most undermine the 'immaculate disinflation' thesis?",
    options: [
      "Conclude the Fed can painlessly disinflate on demand anytime; nothing could ever undermine that view.",
      "Conclude monetary policy is useless and only supply matters; the thesis fails only if unemployment hits exactly zero.",
      "Change nothing in how you read the labor market; the Phillips curve is dead and slack no longer matters at all.",
      "Treat the 2022-24 disinflation as largely supply-driven and contingent on anchored expectations, and favor policy/positioning that protects anchoring - the thesis is most undermined if the 2025-26 supply shock turns persistent and inflation re-accelerates in a way only a costly recession can control, revealing the 'painless' read as luck."
    ],
    correctIndex: 3,
    confidenceRequired: true,
    principle: "The strongest claim names both its levers (supply normalization + anchored expectations) and the observation that would falsify it.",
    explanation: "Principle: a thesis you cannot falsify is not an analysis. D states the mechanism and the disconfirming observation - a persistent re-acceleration requiring a recession to break would show the costless disinflation was contingent, not a general capability. A is unfalsifiable overreach; B sets an impossible falsifier; C overgeneralizes the death of the Phillips curve. Where this generalizes: always state, in advance, the observation that would change your mind."
  }
};

const chartConfig = {
  paradox: {
    title: "Inflation collapsed; unemployment barely moved",
    subtitle: "Headline CPI (12-mo % change) and the unemployment rate, 2021-2024.",
    tier: "FACT",
    note: "FACT. Source: BLS CPI-U (12-mo % change) and BLS unemployment rate. Peak 9.1% (Jun 2022) and the 3.4% unemployment low (Apr 2023) verified to BLS releases; other months are from the same BLS series.",
    soWhat: "Inflation fell about six percentage points - roughly two-thirds - in a year while unemployment rose under one point; the two series the Phillips curve says must trade off simply did not, which is the entire puzzle.",
    predictMagnitude: true,
    magnitudePrompt: "Before revealing: by how many percentage points did headline inflation fall from the Jun 2022 peak to mid-2023?",
    magnitudeSuffix: "pp"
  },
  beveridge: {
    title: "Down the steep branch of the Beveridge curve",
    subtitle: "Job-openings (vacancy) rate vs unemployment rate; points connected in time order.",
    tier: "FACT",
    note: "FACT. Source: BLS JOLTS (job-openings rate; 7.4% peak, Mar 2022) and BLS unemployment rate; vacancy-to-unemployment ratio back to its ~2019 level (~1.2) by mid-2024 (FRED). The 2023 point is approximate.",
    soWhat: "From a record overhang, the economy slid down an almost-vertical path - vacancies fell about three points while unemployment rose under one - which is what 'cooling demand without firing workers' looks like on a chart.",
    predictMagnitude: false
  },
  sacrifice: {
    title: "What the disinflation 'should' have cost vs what it did",
    subtitle: "Output sacrifice ratio: cumulative % of a year's GDP lost per 1 pp of disinflation.",
    tier: "FACT",
    note: "FACT (named-analyst estimates). Ball (1994) put the Volcker episode near 1.8; hawks such as Furman cited ~6 in 2022; the realized 2022-24 figure was about 0, even slightly negative (Konczal/Roosevelt Institute, 2024). Different analysts, consistent units.",
    soWhat: "The realized cost was not merely smaller than the 2-6 the literature expected - it had the wrong sign: GDP rose as inflation fell, which a demand-driven Phillips-curve story cannot produce and a supply-driven one can.",
    predictMagnitude: false
  },
  decomp: {
    title: "Most of the surge - and its reversal - sat in supply",
    subtitle: "Illustrative split of headline inflation into supply vs demand contributions (percentage points).",
    tier: "ESTIMATE",
    note: "ESTIMATE / illustrative. Totals are anchored to the verified headline CPI; the supply-vs-demand split follows Bernanke-Blanchard (2023), who found supply shocks drove ~two-thirds to three-quarters of the 2020Q4-2022Q2 surge. This is a modeled teaching split, not a reported BLS decomposition.",
    soWhat: "When the thing that pushed inflation up (chains, energy, autos) heals on its own timetable, inflation can fall without crushing demand - which is why the Fed's hikes and the disinflation can be correlated without the first fully causing the second.",
    predictMagnitude: false
  },
  theTest: {
    title: "Two years on: the soft landing wobbles",
    subtitle: "Headline CPI (12-mo % change) and unemployment, 2024-2026.",
    tier: "FACT",
    note: "FACT. Source: BLS CPI-U and BLS unemployment rate. CPI 3.3% (12 mo. ending Mar 2026, energy-driven: gasoline +21.2% in one month) and unemployment 4.6% (Nov 2025), 4.3% (May 2026) verified to BLS; late-2025 CPI affected by a data gap from the 2025 appropriations lapse.",
    soWhat: "Inflation has drifted back up on an energy shock while unemployment has climbed to the mid-4s - a fresh supply shock arriving with a softer labor market is exactly the setup that tests whether anchored expectations were structural or lucky.",
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

const ACCENT = "#1d4e6f";
const ACCENT_2 = "#b06a23";
const COLORS = ["#1d4e6f", "#b06a23", "#2a7f9e", "#7d5ba6", "#c44536", "#3a7d44"];

function scoreOf(question, answer) {
  if (!answer || !answer.submitted) return 0;
  if (question.kind === "choice") return answer.selectedIndex === question.correctIndex ? 1 : 0;
  const v = Number(answer.value);
  if (!Number.isFinite(v)) return 0;
  if (question.fermi) {
    if (v <= 0 || question.target <= 0) return 0;
    return Math.abs(Math.log(v / question.target)) <= Math.log(question.fermiFactor || 2) ? 1 : 0;
  }
  return Math.abs(v - question.target) <= question.tolerance ? 1 : 0;
}

function fmtPct(v) { return v + "%"; }
function fmtNum(v) { return String(v); }

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
    { label: "Headline CPI peak (Jun 2022)", value: "9.1%", tier: "FACT" },
    { label: "Unemployment low (Apr 2023)", value: "3.4%", tier: "FACT" },
    { label: "Fed rate hikes, 2022-23", value: "0 -> 5.25-5.50%", tier: "FACT" },
    { label: "Realized output sacrifice ratio", value: "~0", tier: "FACT" }
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

function ParadoxChart({ chartState, onChart }) {
  return (
    <ChartFrame id="paradox" chartState={chartState} onChart={onChart}>
      {(revealed) => (
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={paradoxData} margin={{ top: 20, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} domain={[0, 10]} tickFormatter={maskedAxisTick(revealed, fmtPct)} width={40} />
            <Tooltip content={<MaskedTooltip revealed={revealed} formatter={fmtPct} />} />
            <Legend verticalAlign="top" height={28} />
            <Line type="monotone" dataKey="cpi" name="Headline CPI (12-mo %)" stroke={ACCENT} strokeWidth={3} dot={{ r: 3 }}>
              {revealed && <LabelList dataKey="cpi" position="top" formatter={fmtPct} fontSize={11} />}
            </Line>
            <Line type="monotone" dataKey="unemp" name="Unemployment rate" stroke={ACCENT_2} strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

function BeveridgeChart({ chartState, onChart }) {
  return (
    <ChartFrame id="beveridge" chartState={chartState} onChart={onChart}>
      {(revealed) => (
        <ResponsiveContainer width="100%" height={350}>
          <ScatterChart margin={{ top: 24, right: 24, bottom: 24, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="u" name="Unemployment" domain={[3, 8]} tickFormatter={maskedAxisTick(revealed, fmtPct)} tickLine={false} axisLine={false} fontSize={12} label={{ value: "Unemployment rate ->", position: "insideBottom", offset: -10, fontSize: 11 }} />
            <YAxis type="number" dataKey="v" name="Vacancy rate" domain={[3, 8]} tickFormatter={maskedAxisTick(revealed, fmtPct)} tickLine={false} axisLine={false} width={44} label={{ value: "Vacancy rate ->", angle: -90, position: "insideLeft", offset: 16, fontSize: 11 }} />
            <Tooltip content={<MaskedTooltip revealed={revealed} formatter={fmtPct} />} cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={beveridge} line={{ stroke: ACCENT_2, strokeWidth: 2 }} fill={ACCENT}>
              <LabelList dataKey="label" position="top" fontSize={11} />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

function SacrificeChart({ chartState, onChart }) {
  return (
    <ChartFrame id="sacrifice" chartState={chartState} onChart={onChart}>
      {(revealed) => (
        <ResponsiveContainer width="100%" height={330}>
          <BarChart data={sacrificeData} margin={{ top: 20, right: 24, bottom: 28, left: 6 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} interval={0} angle={-10} textAnchor="end" height={52} fontSize={11} />
            <YAxis tickLine={false} axisLine={false} domain={[0, 7]} tickFormatter={maskedAxisTick(revealed, fmtNum)} width={36} />
            <Tooltip content={<MaskedTooltip revealed={revealed} formatter={fmtNum} />} />
            <Bar dataKey="value" name="Output sacrifice ratio" radius={[6, 6, 0, 0]}>
              {sacrificeData.map((e, i) => <Cell key={e.label} fill={i === 2 ? ACCENT_2 : ACCENT} />)}
              {revealed && <LabelList dataKey="value" position="top" formatter={fmtNum} fontSize={11} />}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

function DecompChart({ chartState, onChart }) {
  return (
    <ChartFrame id="decomp" chartState={chartState} onChart={onChart}>
      {(revealed) => (
        <ResponsiveContainer width="100%" height={330}>
          <BarChart data={decompData} margin={{ top: 20, right: 24, bottom: 10, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} domain={[0, 10]} tickFormatter={maskedAxisTick(revealed, fmtPct)} width={40} />
            <Tooltip content={<MaskedTooltip revealed={revealed} formatter={fmtPct} />} />
            <Legend verticalAlign="top" height={28} />
            <Bar dataKey="supply" name="Supply contribution" stackId="a" fill={ACCENT} radius={[0, 0, 0, 0]}>
              {revealed && <LabelList dataKey="supply" position="center" formatter={fmtPct} fontSize={10} fill="#fff" />}
            </Bar>
            <Bar dataKey="demand" name="Demand contribution" stackId="a" fill={ACCENT_2} radius={[6, 6, 0, 0]}>
              {revealed && <LabelList dataKey="demand" position="center" formatter={fmtPct} fontSize={10} fill="#fff" />}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

function TestChart({ chartState, onChart }) {
  return (
    <ChartFrame id="theTest" chartState={chartState} onChart={onChart}>
      {(revealed) => (
        <ResponsiveContainer width="100%" height={330}>
          <LineChart data={testData} margin={{ top: 20, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="period" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} domain={[0, 6]} tickFormatter={maskedAxisTick(revealed, fmtPct)} width={40} />
            <Tooltip content={<MaskedTooltip revealed={revealed} formatter={fmtPct} />} />
            <Legend verticalAlign="top" height={28} />
            <Line type="monotone" dataKey="cpi" name="Headline CPI (12-mo %)" stroke={ACCENT} strokeWidth={3} dot={{ r: 3 }}>
              {revealed && <LabelList dataKey="cpi" position="top" formatter={fmtPct} fontSize={11} />}
            </Line>
            <Line type="monotone" dataKey="unemp" name="Unemployment rate" stroke={ACCENT_2} strokeWidth={3} dot={{ r: 3 }}>
              {revealed && <LabelList dataKey="unemp" position="bottom" formatter={fmtPct} fontSize={11} />}
            </Line>
          </LineChart>
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
  const [selectedIndex, setSelectedIndex] = React.useState(answer && answer.selectedIndex != null ? answer.selectedIndex : null);
  const [value, setValue] = React.useState(answer && answer.value != null ? answer.value : "");
  const [confidence, setConfidence] = React.useState(answer && answer.confidence ? answer.confidence : null);
  const submitted = answer && answer.submitted;
  const earned = scoreOf(q, answer);
  const isCase = q.typeLabel.indexOf("consulting") !== -1;

  const chartLocked = q.chartId && !(chartState[q.chartId] && chartState[q.chartId].revealed);

  React.useEffect(() => {
    setSelectedIndex(answer && answer.selectedIndex != null ? answer.selectedIndex : null);
    setValue(answer && answer.value != null ? answer.value : "");
    setConfidence(answer && answer.confidence ? answer.confidence : null);
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
            <input type="number" value={value} onChange={(e) => setValue(e.target.value)} disabled={submitted || chartLocked} step={q.step} placeholder={q.placeholder} aria-label={q.prompt} />
            <span>{q.suffix}</span>
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
  const lo = q.fermi ? q.target / q.fermiFactor : q.target - q.tolerance;
  const hi = q.fermi ? q.target * q.fermiFactor : q.target + q.tolerance;
  const userPct = Math.max(0, Math.min(100, ((value - q.axisMin) / range) * 100));
  const targetPct = Math.max(0, Math.min(100, ((q.target - q.axisMin) / range) * 100));
  const bandLeft = Math.max(0, ((lo - q.axisMin) / range) * 100);
  const bandWidth = Math.max(0, Math.min(100 - bandLeft, ((hi - lo) / range) * 100));
  const tail = q.suffix;
  const round = (n) => Math.round(n * 100) / 100;
  return (
    <div className="dist-axis">
      <div className="dist-track">
        <span className="dist-band" style={{ left: bandLeft + "%", width: bandWidth + "%" }} />
        <span className="dist-marker target" style={{ left: targetPct + "%" }} title="Actual" />
        <span className="dist-marker user" style={{ left: userPct + "%" }} title="You" />
      </div>
      <div className="dist-labels">
        <span>You: {value}{tail}</span>
        <span>Actual: {q.target}{tail} (band {round(lo)}-{round(hi)})</span>
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
        <p>Before today's topic, three quick retrieval questions from earlier articles. They are not about inflation - they ask you to carry a prior principle into a new situation. Spacing and interleaving make ideas stick; recalling them cold, in an unfamiliar frame, is the point.</p>
        <p>The prior pieces argued, in turn, that a technology's value lands where a workflow decision changes rather than at the demo; that when one party's returns scale across markets while the other's costs are sunk and local, the scalable party captures the surplus; and that a per-unit value verdict is not the same as an aggregate budget verdict.</p>
      </div>
      <QuestionGroup ids={requiredBySection.warmup} answers={answers} chartState={chartState} onSubmit={onSubmit} />
    </>
  );
}

function IntroSection() {
  return (
    <>
      <div className="section-prose">
        <p>The textbook is blunt: you cannot wring six points of inflation out of an economy without a recession. The "sacrifice ratio" - the output or jobs you must give up per point of disinflation - has been positive and often large in every modern episode. Yet between mid-2022 and 2024, U.S. headline inflation fell from 9.1% to about 3% while unemployment rose less than a point and no recession arrived (<SourceLink index={0} />; <SourceLink index={2} />).</p>
        <p>The scale of the drop is historic. Headline CPI peaked at 9.1% over the year ending June 2022, the largest 12-month increase since 1981 (<SourceLink index={0} />). The Federal Reserve answered with the fastest tightening in four decades, lifting its policy rate from near zero to 5.25-5.50% by July 2023. By the time the dust settled, inflation had roughly two-thirds reversed - and the unemployment rate had only edged up from a 50-year low of 3.4% in April 2023 toward the low 4s (<SourceLink index={2} />; <SourceLink index={3} />).</p>
        <p>That breaks the conventional story. A demand-driven disinflation is supposed to run through pain: tighter money slows spending, firms shed workers, unemployment rises, and only then does inflation cool. Here the price of admission seems not to have been paid. One careful accounting finds the realized cost was not just small but had the wrong sign - output rose as inflation fell (<SourceLink index={9} />). Economists called it "immaculate disinflation," and argued about whether it was skill, structure, or luck.</p>
        <p>This note addresses three questions. First, did the disinflation truly defy the sacrifice ratio, or did an unprecedented starting point - a record overhang of job vacancies - let the labor market cool without job losses? Second, what actually brought inflation down: the Fed's 525 basis points of hikes, or the healing of supply (chains, energy, returning workers)? Third, was the soft landing structural or lucky - and what observation would falsify the "immaculate" reading?</p>
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
        <p>Start with the magnitude of what happened, because the rest of the argument hangs on it. Over roughly a year, headline CPI inflation fell about six percentage points - from 9.1% in June 2022 to 3.0% by mid-2023 - and then flattened near 3% (<SourceLink index={0} />). Across the same window the unemployment rate barely moved: it sat at a 50-year low of 3.4% in April 2023 and was still only in the low 4s at the end of 2024 (<SourceLink index={2} />; <SourceLink index={3} />). The first chart puts the two series side by side; the puzzle is that they were supposed to trade off and did not.</p>
        <p>The historical benchmark is the Volcker disinflation of the early 1980s, the canonical case of inflation being broken on purpose. Estimates of its cost vary, but Laurence Ball's widely cited 1994 work put the sacrifice ratio near 1.8 - roughly 1.8 cumulative points of a year's output lost for each point of inflation removed - and it came with a double-dip recession and double-digit unemployment. Applying any positive sacrifice ratio to a six-point disinflation implies a deep downturn. None came.</p>
        <p>The structural fact that makes the 2022-24 episode different is the labor market's starting point. By March 2022 there were about 12 million job openings against roughly 6 million unemployed - close to two vacancies per job-seeker, an overhang with no postwar precedent (<SourceLink index={7} />). The Beveridge curve, which plots vacancies against unemployment, sat far up and to the left of its normal position. That unusual location, not a repeal of economics, is what set up everything that followed - and it is where the real debate begins.</p>
      </div>
      <ParadoxChart chartState={chartState} onChart={onSubmit.onChart} />
      <BeveridgeChart chartState={chartState} onChart={onSubmit.onChart} />
      <QuestionGroup ids={requiredBySection.background} answers={answers} chartState={chartState} onSubmit={onSubmit.onQuestion} />
    </>
  );
}

function Rq1Section({ answers, chartState, onSubmit }) {
  return (
    <>
      <div className="section-prose">
        <p>Did the disinflation actually defy the sacrifice ratio? In 2022, prominent economists said it could not be cheap. Larry Summers and co-authors, plotting the economy in "Beveridge space," argued that vacancies had never fallen far without a substantial rise in unemployment, and warned that taming inflation would likely require years of elevated joblessness (<SourceLink index={5} />). Jason Furman cited a sacrifice ratio around six. On those numbers, six points of disinflation implied an enormous output and jobs cost.</p>
        <p>The opposing camp had a mechanism, not just hope. Fed economist Andrew Figura and Governor Christopher Waller argued that from a record vacancy overhang the economy could move down a steep, near-vertical stretch of the Beveridge curve: firms would cancel unfilled openings rather than fire workers, so labor demand could cool with only a small rise in unemployment - "a soft landing along the Beveridge curve" (<SourceLink index={4} />). By 2024 the vacancy-to-unemployment ratio had fallen from about 2.0 back to its pre-pandemic 1.2 while unemployment rose under a point - the path Figura and Waller described, against the historical pattern Summers invoked (<SourceLink index={7} />).</p>
        <p>The chart below shows how the realized cost compares with what was expected. Measured after the fact, the output sacrifice ratio came in near zero - by one careful estimate slightly negative, because GDP rose as inflation fell (<SourceLink index={9} />). That is not a smaller version of the textbook result; it is a different sign, and a different sign points to a different mechanism.</p>
        <p>The honest limit of this section: "near-vertical Beveridge segment" is a description of an unusual starting point, not a law. Summers's camp may simply have been early rather than wrong - if a later cooling starts from a normal vacancy level, the same demand restraint could fall on jobs instead of openings. The soft landing happened; whether it was destiny is exactly what the next two sections probe.</p>
      </div>
      <SacrificeChart chartState={chartState} onChart={onSubmit.onChart} />
      <QuestionGroup ids={requiredBySection.rq1} answers={answers} chartState={chartState} onSubmit={onSubmit.onQuestion} />
    </>
  );
}

function Rq2Section({ answers, chartState, onSubmit }) {
  return (
    <>
      <div className="section-prose">
        <p>If the cost had the wrong sign, what actually brought inflation down? The tempting answer is the Fed: it raised rates 525 basis points and inflation fell, so the hikes must have done it. But correlation is where the question starts, not where it ends. A demand-crushing disinflation should show up as falling output and rising unemployment - and that is not what the data show.</p>
        <p>The leading decomposition points elsewhere. Ben Bernanke and Olivier Blanchard estimate that supply-side shocks - energy and food prices, and snarled supply chains - drove roughly two-thirds to three-quarters of the surge in inflation between late 2020 and mid-2022, with tight labor markets a smaller early contributor that grew in importance later (<SourceLink index={6} />). As those shocks reversed on their own timetable - chains unkinked, energy fell, shipping normalized, and labor supply recovered as participation and immigration rose - inflation could fall without demand being crushed. The illustrative chart below shows that pattern: most of the surge, and most of the reversal, sits in the supply bars.</p>
        <p>Two pieces of evidence guard against handing the Fed all the credit. First, the euro area, which faced a larger energy shock and tightened less aggressively, disinflated on a broadly similar path - hard to square with a story in which U.S. rate hikes were the dominant cause. Second, if demand destruction had been the engine, unemployment would have risen far more than it did. The most defensible reading is that monetary policy mattered - above all by keeping inflation expectations anchored so the supply-driven spike did not become embedded - while the mechanical disinflation was substantially the supply side healing itself (<SourceLink index={8} />).</p>
        <p>The section's honest limit: this is genuinely hard to identify, because the Fed and supply were moving at the same time, and "anchored expectations" is partly a product of credible policy. Disentangling the two cleanly is not possible with this data; what we can say is that a pure-demand story cannot explain rising output, and a pure-Fed story cannot explain the cross-country pattern.</p>
      </div>
      <DecompChart chartState={chartState} onChart={onSubmit.onChart} />
      <QuestionGroup ids={requiredBySection.rq2} answers={answers} chartState={chartState} onSubmit={onSubmit.onQuestion} />
    </>
  );
}

function Rq3Section({ answers, chartState, onSubmit }) {
  return (
    <>
      <div className="section-prose">
        <p>Was the landing structural or lucky? The load-bearing assumption behind the whole "immaculate" reading is that long-run inflation expectations stayed anchored. They wobbled but held: University of Michigan long-run expectations rose only to about 3.1% at the 2022 peak - elevated, not unmoored - and re-anchored near target as inflation fell. Anchored expectations are what let a one-time supply shock pass through as a price-level jump rather than igniting a wage-price spiral. Take that assumption away and the soft landing does not happen.</p>
        <p>Two later events test whether the mechanism was robust or merely favorable. In mid-2024 the "Sahm rule" - a recession signal that triggers when the unemployment rate's three-month average rises half a point above its recent low - was tripped, yet no recession followed and output kept growing (<SourceLink index={10} />). A reliable historical alarm misfired, a reminder that the post-pandemic labor market was behaving unusually. Then, more pointedly, the disinflation stalled and reversed: by the twelve months ending March 2026 headline CPI had drifted back to 3.3%, driven by an energy shock that pushed gasoline up a record 21.2% in a single month, while unemployment climbed into the mid-4% range (<SourceLink index={1} />; <SourceLink index={3} />).</p>
        <p>The final chart shows that wobble. It matters because it is the natural experiment the thesis needs: a fresh supply shock arriving with a softer labor market and expectations that have already been stretched once. If the "immaculate" disinflation was a structural capability, anchored expectations should absorb this shock too. If it was a favorable episode - transitory shocks plus a record overhang plus still-anchored beliefs - then a second shock under worse conditions is exactly where the painless story could break.</p>
        <p>The honest limit cuts both ways. A single energy-driven uptick is not yet evidence that the mechanism has failed; energy shocks often do reverse. But "wait and see whether expectations hold" is precisely the point - the thesis is now falsifiable in real time, and the next year of data, not the last one, will settle whether the soft landing was skill or fortune.</p>
      </div>
      <TestChart chartState={chartState} onChart={onSubmit.onChart} />
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
  const hasDisconfirm = /disconfirm|undermin|wrong if|would fail|evidence against|contradict|falsif|breaks if|confound/.test(t);
  const hasPremortem = /pre-?mortem|in 12 months|a year from now|fails because|most likely reason|if this fails/.test(t);
  const hasNumber = /[0-9]/.test(t);
  if (!hasThesis) gaps.push("a one-sentence so-what thesis");
  if (!hasAssumption) gaps.push("the single load-bearing assumption");
  if (!hasDisconfirm) gaps.push("the strongest disconfirming evidence");
  if (!hasPremortem) gaps.push("a one-line pre-mortem");
  let verdict;
  if (gaps.length === 0 && hasNumber) verdict = "Strong: all four parts are present and you quantified the implication. Pressure-test whether your disconfirming evidence is something you could actually observe in time to act.";
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
    { h: "A disinflation with the wrong-sign cost is a supply story.", p: "When output rises as inflation falls, the shock was on the supply side (chains, energy, labor supply), not engineered demand destruction - which is why the realized sacrifice ratio (~0) broke the textbook and a pure-Fed account does not fit." },
    { h: "Extreme starting conditions can suspend a trade-off - locally.", p: "From a record overhang of ~2 vacancies per job-seeker, cooling demand cancels openings instead of jobs (the near-vertical Beveridge segment); the lesson is local to that starting point, not a permanent repeal of the Phillips curve." },
    { h: "Anchored expectations are the load-bearing assumption.", p: "The painless read depends on long-run expectations staying near target; the 2025-26 energy shock with a softer labor market is the live test of whether the mechanism was structural or lucky." }
  ];

  const applyTable = [
    { row: "On-call engineers", val: "40 -> 38" },
    { row: "Sev-1 incidents / quarter", val: "12 -> 4" },
    { row: "Auto-rollback tool shipped", val: "same quarter" },
    { row: "Feature releases / quarter", val: "60 -> 25" }
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
        <p>You saw five charts. Write the single most non-obvious insight you would defend to a skeptical chief economist - in one or two sentences.</p>
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
        <p>Leave macro behind. A software platform team's serious incidents fell 67% in the same quarter it (a) shipped an auto-rollback tool and (b) cut feature releases by 58%. Use the snippet, then give four labeled parts - this is a correlation-vs-causation puzzle, like RQ2.</p>
        <table className="apply-table"><tbody>
          {applyTable.map((r) => <tr key={r.row}><td>{r.row}</td><td>{r.val}</td></tr>)}
        </tbody></table>
        <p className="apply-hint">Write: (1) a one-sentence so-what thesis (with a number), (2) the single load-bearing assumption, (3) the strongest disconfirming evidence (what would show the tool was not the cause), (4) a one-line pre-mortem ("If this conclusion is wrong, in 12 months the most likely reason is ___").</p>
        <textarea value={apply} onChange={(e) => setApply(e.target.value)} rows={5} placeholder="Label each part 1-4." />
        <h3 className="cross">Cross-link to a prior article</h3>
        <p>Name one prior-article principle - value-lives-at-the-workflow (AI PM), owner-of-the-portable-asset-captures-surplus (FIFA), or per-unit-not-equal-aggregate (GLP-1) - and say whether it reinforces or conflicts with today's correlation-vs-causation lesson, and why.</p>
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
        <p>The central challenge was never whether inflation fell - it did, by about six points - but why it fell so cheaply, and whether that cheapness can be repeated. The most defensible reading under partial evidence is that the 2022-24 disinflation was largely supply-driven: a record vacancy overhang let labor demand cool without mass layoffs, transitory shocks reversed on their own, and credible policy kept expectations anchored so the spike never embedded. The Fed helped, mostly by guarding those expectations, but it did not engineer a painless demand contraction, because there was no contraction to engineer.</p>
        <p>For policymakers and investors, the implication is to resist over-learning. The episode is evidence that disinflation can be cheap when its causes are supply-side and expectations hold - not that a central bank can costlessly disinflate on demand. Positioning that assumes "the Fed can always pull this off" is betting on starting conditions that may not recur; the more durable bet is on whatever protects the anchor, because that is the variable doing the quiet work.</p>
        <p>The broader implication is methodological. The "immaculate disinflation" is a case study in reading mechanisms rather than headlines: the same falling inflation print is consistent with a heroic Fed, a healing supply side, or a lucky configuration, and only the cost's sign, the cross-country pattern, and the Beveridge geometry tell them apart. That discipline - separating the number from the mechanism that produced it - is the transferable skill, far beyond monetary policy.</p>
        <p>The most important unresolved question is now empirical and falsifiable in real time: as a fresh energy shock pushes inflation back toward 3% with unemployment in the mid-4s, will anchored expectations absorb it as they did in 2022 - confirming a structural soft-landing mechanism - or will this second shock, under worse conditions, force the costly recession the first one avoided, revealing the painless disinflation as a favorable episode rather than a repeatable skill?</p>
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

  const summaryDone = governing.trim().length >= 25 && apply.trim().length >= 40 && crosslink.trim().length >= 20;

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
            <p className="kicker">Interactive Research Note - Economics & Macro</p>
            <h1>The Immaculate Disinflation: How Inflation Fell Without the Recession</h1>
            <p className="dek">U.S. inflation dropped from 9.1% to about 3% while unemployment barely moved, defying the textbook "sacrifice ratio." Was it skill, structure, or luck - and what would prove it?</p>
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
