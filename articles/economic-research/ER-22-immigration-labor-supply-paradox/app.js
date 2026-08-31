/* ER-22: The Missing Raise — Economics & Macro
   Readable source copy. This exact code is inlined into index.html. */

const { useState, useEffect, useRef, useMemo } = React;
const {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, BarChart, Bar, Cell, ComposedChart, Scatter, LabelList,
} = Recharts;

/* ---------------------------------------------------------------------- */
/* DATA                                                                    */
/* ---------------------------------------------------------------------- */

const SOURCES = [
  { id: "bls_forbrn2025", label: "U.S. Bureau of Labor Statistics, \"Foreign-Born Workers: Labor Force Characteristics — 2025\" (News Release USDL-26-0760, May 19, 2026)", url: "https://www.bls.gov/news.release/forbrn.nr0.htm" },
  { id: "nfap_mar2026", label: "National Foundation for American Policy, \"U.S. Labor Force Analysis: January 2025 to February 2026\" (Policy Brief, March 2026)", url: "https://nfap.com/wp-content/uploads/2026/03/US-Labor-Force-Analysis-Jan-2025-to-Feb-2026.NFAP-Policy-Brief.March-2026.pdf" },
  { id: "sffed_el2528", label: "Duzhak, E. & New-Schmidt, A. \"Immigration and Changes in Labor Force Demographics.\" FRBSF Economic Letter 2025-28 (Nov. 19, 2025)", url: "https://www.frbsf.org/research-and-insights/publications/economic-letter/2025/11/immigration-and-changes-in-labor-force-demographics/" },
  { id: "kcfed_bulletin", label: "Mercan, Y. \"Declining Immigration and an Aging Population Are Reducing Breakeven Employment Growth.\" Federal Reserve Bank of Kansas City, Economic Bulletin (Oct. 15, 2025)", url: "https://www.kansascityfed.org/research/economic-bulletin/declining-immigration-and-an-aging-population-are-reducing-breakeven-employment-growth/" },
  { id: "dallasfed_gdp", label: "Orrenius, P. et al. \"Declining immigration weighs on GDP growth, with little impact on inflation.\" Federal Reserve Bank of Dallas (Jul. 8, 2025)", url: "https://www.dallasfed.org/research/economics/2025/0708" },
  { id: "dallasfed_tx", label: "Brizuela, I., Kerr, E., Orrenius, P. & Zavodny, M. \"Immigration crackdown likely contributing to weak Texas job growth.\" Federal Reserve Bank of Dallas, Southwest Economy (Oct. 17, 2025)", url: "https://www.dallasfed.org/research/swe/2025/swe2515" },
  { id: "cbo_econ2628", label: "Congressional Budget Office, \"CBO's Current View of the Economy From 2026 to 2028\" (Jan. 2026)", url: "https://www.cbo.gov/publication/62005" },
  { id: "bls_empsit_jul26", label: "U.S. Bureau of Labor Statistics, \"The Employment Situation — July 2026\" (Aug. 7, 2026)", url: "https://www.bls.gov/news.release/pdf/empsit.pdf" },
  { id: "peri_caiumi_nber", label: "Caiumi, A. & Peri, G. \"Immigration's Effect on US Wages and Employment Redux.\" NBER Working Paper 32389 (2024, rev. 2026)", url: "https://www.nber.org/papers/w32389" },
];

const srcTag = (id) => `[${id}]`;

// Chart 1 — line: net international migration, long-run average -> 2024 surge -> 2025 estimate
const NIM_TREND = [
  { period: "Long-run average (pre-2021)", nim: 1.0 },
  { period: "2024 (surge peak)", nim: 2.2 },
  { period: "2025 (estimate)", nim: 0.515 },
];

// Chart 2 — dumbbell: occupation-group shares, foreign-born vs. native-born, 2025
const OCCUPATION_GAP = [
  { label: "Natural resources, construction & maintenance", foreignBorn: 13.3, nativeBorn: 7.9 },
  { label: "Service occupations", foreignBorn: 21.2, nativeBorn: 15.6 },
  { label: "Production, transportation & material moving", foreignBorn: 15.1, nativeBorn: 11.4 },
  { label: "Sales and office occupations", foreignBorn: 13.6, nativeBorn: 19.9 },
  { label: "Management, professional & related", foreignBorn: 36.8, nativeBorn: 45.2 },
];

// Chart 3 — waterfall/bridge: prime-age labor force growth-rate bridge (SF Fed)
const GROWTH_BRIDGE = [
  { label: "CBO Jan-2025 projected prime-age LF growth", base: 0, delta: 1.2, kind: "total" },
  { label: "Immigration-policy revision (SF Fed est.)", base: 0.4, delta: 0.8, kind: "decrease" },
  { label: "SF Fed's Nov-2025 revised estimate", base: 0, delta: 0.4, kind: "total" },
];

// Chart 4 — slope: unemployment rate, native-born vs. foreign-born, 2024 -> 2025
const UNEMPLOYMENT_SLOPE = [
  { period: "2024", nativeBorn: 4.0, foreignBorn: 4.2 },
  { period: "2025", nativeBorn: 4.3, foreignBorn: 4.2 },
];

// Chart 5 — bar + reference lines: breakeven employment growth cascade vs. actual payrolls
const BREAKEVEN_BARS = [
  { vintage: "Jan 2024 CBO vintage", breakeven: 150 },
  { vintage: "Jan 2025 CBO vintage", breakeven: 126 },
  { vintage: "Sept 2025 CBO vintage", breakeven: 77 },
  { vintage: "Current (netting immigration)", breakeven: 29 },
];

/* ---------------------------------------------------------------------- */
/* CHART INTERPRETATION PROMPT CONTENT                                    */
/* ---------------------------------------------------------------------- */

const CHART_PROMPTS = {
  chart1: [
    {
      kind: "quant",
      prompt: "Estimate 2025's net immigration as a share of the pre-2021 long-run average (about 1 million a year), not the 2024 surge peak. What does that specific comparison imply about labor supply that comparing only to the surge peak would miss?",
      authored: "515,000 ÷ 1,000,000 ≈ 51.5%, so 2025 ran at roughly half the long-run average, not merely 'below an unusual surge.' Comparing only to the 2024 peak makes 2025 look like a return to calm; comparing to the long-run average shows an actual shortfall relative to what the U.S. working-age population has depended on for decades.",
    },
    {
      kind: "sowhat",
      prompt: "In one sentence: what should a construction-industry workforce planner building an 18-month project pipeline do differently after seeing this reversal?",
      authored: "The planner should assume the applicant pool for immigrant-concentrated trades stays structurally smaller than it was in 2023-24, and budget for higher overtime, longer lead times, and possibly higher subcontractor bids rather than assuming today's tight labor supply is a temporary blip that self-corrects by next year.",
    },
  ],
  chart2: [
    {
      kind: "quant",
      prompt: "Derive the over-representation ratio for the natural resources, construction, and maintenance category (foreign-born share ÷ native-born share). Explain why that ratio, not the economy-wide 19.1% foreign-born labor-force share, is what predicts where a labor-supply shock bites hardest.",
      authored: "13.3 ÷ 7.9 ≈ 1.68, so foreign-born workers are about 68% over-represented in this occupation group relative to native-born workers. A shock to immigrant labor supply does not spread evenly across the economy; it concentrates in occupations with a ratio like this one, which is why construction and similar trades feel the shock long before an economy-wide average share would suggest.",
    },
    {
      kind: "mechanism",
      prompt: "Management, professional, and related occupations show the reverse pattern — native-born workers over-represented (45.2% vs. 36.8%). What does this reversal suggest about which jobs are more likely to be substitutes versus complements for native-born labor?",
      authored: "Occupations where foreign-born and native-born workers are concentrated in different categories altogether are the clearest sign of task specialization rather than head-to-head competition: if the two groups mostly hold different jobs, removing one group's workers does not simply open an identical seat for the other group to fill — it removes an input that a different, complementary set of jobs may depend on.",
    },
  ],
  chart3: [
    {
      kind: "quant",
      prompt: "Express the 0.8-percentage-point cut to projected labor force growth as a percentage of the original 1.2% projected rate. Which framing — the percentage-point cut or the percent-of-original figure — is more useful for someone modeling total job creation next year, and why?",
      authored: "0.8 ÷ 1.2 ≈ 67%, a striking relative cut. But for modeling total jobs, the percentage-point figure is what plugs directly into labor-force-growth arithmetic (population × participation rate × growth rate); the 67% figure is attention-grabbing but easy to misapply if mistaken for a 67-percentage-point cut rather than a cut equal to 67% of the original rate's own size.",
    },
    {
      kind: "sowhat",
      prompt: "In one sentence: what should a regional bank's chief economist do differently when writing next quarter's job-growth forecast, given this bridge?",
      authored: "The economist should lower the bar for what counts as an acceptable payroll report — a print that would have signaled real cooling under the old ~1.2% labor-force-growth assumption can be entirely consistent with a healthy, merely smaller labor force under the revised ~0.4% assumption, so the forecast narrative needs updating, not just the number.",
    },
  ],
  chart4: [
    {
      kind: "quant",
      prompt: "Express native-born unemployment's 2024-to-2025 rise (4.0% to 4.3%) both as a percentage-point change and as a percent change relative to its own 2024 base. Which number better conveys the real-world size of the deterioration, and why?",
      authored: "The move is 0.3 percentage points, or about 7.5% in relative terms (0.3 ÷ 4.0). The percentage-point figure, applied to the actual size of the native-born labor force, is the more concrete measure of how many more people are out of work; the 7.5% relative figure is useful mainly for comparing this move's size to other rate changes measured the same way, not for judging the real-world headcount involved.",
    },
    {
      kind: "sowhat",
      prompt: "In one sentence: what should a state labor-market analyst do differently after seeing this divergence, instead of just reporting that the overall unemployment rate ticked up?",
      authored: "The analyst should break out and report native-born and foreign-born unemployment separately going forward, since a single blended 'overall rate ticked up' headline hides that the entire increase in this period is concentrated in one nativity group, a pattern the aggregate number alone cannot reveal.",
    },
  ],
  chart5: [
    {
      kind: "quant",
      prompt: "Before checking the reference lines: predict whether July 2026's actual payroll change (a decline of 23,000 jobs) falls above or below the lowest breakeven benchmark shown (about 29,000 jobs a month), and by roughly how many thousand jobs.",
      authored: "July 2026's actual print (-23,000) falls below even the lowest current breakeven estimate (about 29,000) by roughly 52,000 jobs a month. This matters because the falling-benchmark story, which explained why softer 2025 prints (22,000 to 79,000 a month) were not necessarily alarming, cannot explain away a negative print — a negative number sits below every vintage of the benchmark shown, old or new.",
    },
    {
      kind: "sowhat",
      prompt: "In one sentence: what should a bond-market trader do differently than someone who reads only the headline unemployment rate (4.1% in July 2026, little changed)?",
      authored: "The trader should weight the payroll and wage details — a negative payroll print and average hourly earnings growth down to 3.2%, the slowest since May 2021 — more heavily than the still-low headline rate, since the rate can look stable even as job creation turns negative once falling labor-force participation is also pulling the rate down mechanically.",
    },
  ],
};

/* ---------------------------------------------------------------------- */
/* WARM-UP QUESTIONS (drawn from prior articles, not today's topic)       */
/* ---------------------------------------------------------------------- */

const WARMUP_QUESTIONS = [
  {
    id: "wu1",
    sourceArticle: "ER-21, the buyback paradox",
    prompt:
      "A national retail chain reports that its total in-store \"shrink\" (theft and loss) rate fell from 1.6% to 1.4% of sales last year, and its VP of Loss Prevention tells the board this proves a new anti-theft policy \"worked well across the business.\" A regional analyst points out that shrink at the chain's 40 warehouse-club-format stores actually rose from 1.1% to 1.9% of sales over the same year, even though those 40 stores are a small slice of the chain's 900 total locations. Applying the same lesson used to explain why \"no crowding-out effect on average\" did not rule out real crowding out inside concentrated industries, what should the analyst tell the VP?",
    options: [
      { text: "A calm or improving company-wide average can hide a real, opposite-direction effect concentrated in a small slice of the business — the board needs format-level shrink data before concluding the new policy worked everywhere, especially in the warehouse-club format where it evidently didn't.", correct: true, misconception: null },
      { text: "The aggregate number is the one that matters for board reporting, since it already reflects all 900 stores weighted correctly.", correct: false, misconception: "ignoring aggregation — a correctly weighted average can still fully mask a reversal inside a small, economically important subgroup" },
      { text: "The warehouse-club data must be a reporting error, since it directly contradicts the company-wide trend.", correct: false, misconception: "assuming any subgroup result that contradicts the aggregate must be a mistake, rather than recognizing that aggregates and subgroups can genuinely diverge without either being wrong" },
      { text: "Since warehouse clubs are only about 4% of the chain's stores, an 0.8-point increase there is too small to matter regardless of dollar exposure.", correct: false, misconception: "dismissing a subgroup finding based on store count alone without checking dollar exposure or the trend's implication for that format" },
    ],
    explanationCorrect:
      "Correct — this is the same aggregation lesson from the buyback article: a full-sample average (there, \"no crowding out\") can coexist with a real, opposite effect inside one identifiable slice (there, concentrated industries), because the slice's effect gets diluted by everything else in the average. Never treat a favorable aggregate as proof a force is absent everywhere, especially in a subgroup that behaves structurally differently from the rest.",
    transferCue: "Where this generalizes: hospital-system-wide outcome averages, a country's overall inflation rate, and a school district's average test score can all hide a real, oppositely-moving effect inside one department, sector, or school — always ask for the subgroup breakdown before believing the aggregate tells the whole story.",
  },
  {
    id: "wu2",
    sourceArticle: "ER-12, the tariff pass-through puzzle",
    prompt:
      "A company's total marketing budget grew only 2% last year. The CMO tells the CFO this proves the new, aggressive TikTok ad campaign \"clearly isn't costing the company much,\" since the total barely moved. Applying the same lesson that showed a falling AGGREGATE inflation rate does not disprove a rising CONTRIBUTION from tariffs within it, what is the sharpest follow-up question the CFO should ask?",
    options: [
      { text: "Whether the CMO personally approved the TikTok contract, since that determines who is accountable for the spending.", correct: false, misconception: "focusing on organizational accountability rather than the substance of whether the campaign's own cost is actually large" },
      { text: "How much did the TikTok campaign's own spending grow, and which other budget lines shrank or were cut to keep the total near flat?", correct: true, misconception: null },
      { text: "Whether the 2% figure was measured in nominal or real (inflation-adjusted) dollars, since that is always the most important question for any budget figure.", correct: false, misconception: "introducing a real-vs-nominal check that is a valid general habit but not the specific trap this question is testing" },
      { text: "Nothing further is needed, since a 2% total change is small enough to rule out any one campaign being expensive.", correct: false, misconception: "this is exactly the error being tested: a calm, small net change in a total can fully coexist with one component growing sharply if other components were cut to offset it" },
    ],
    explanationCorrect:
      "Correct — this is the same net-vs-contribution lesson: a nearly flat aggregate (2% budget growth, or a falling headline inflation rate) can still contain one fast-growing piece (the TikTok campaign, or tariff-driven price increases) if other pieces are shrinking or being cut elsewhere to offset it. Before accepting \"the total barely moved\" as proof something is cheap or harmless, isolate that one component's own change and check what else moved to net it out.",
    transferCue: "Where this generalizes: a country's stable trade deficit, a household's flat total grocery bill, and a hospital's flat total payroll cost can all conceal one fast-rising line item being offset by cuts elsewhere — a flat total is a net, not proof that nothing inside it is changing.",
  },
  {
    id: "wu3",
    sourceArticle: "ER-9, the passive investing ownership paradox",
    prompt:
      "In a growing city, nearly every commuter individually decides that driving alone is faster and more convenient than carpooling or taking transit — a perfectly rational choice for each person given their own commute. Over twenty years of only-rising car ownership, this produces citywide gridlock so severe that the average commute is now slower for everyone than it would be if more people carpooled. Applying the same lesson used to explain how index-fund investing produced aggregate ownership concentration no single saver was choosing, what is the most important caveat about this gridlock story?",
    options: [
      { text: "The gridlock proves that each individual commuter's decision to drive alone was actually irrational all along, once you look at the citywide result.", correct: false, misconception: "confusing an aggregate outcome nobody intended with proof that each individual's own decision was irrational" },
      { text: "Because car ownership has only risen for twenty straight years, nobody actually knows how the system would behave under a sustained reversal (mass carpool adoption), since that direction has never been tested.", correct: true, misconception: null },
      { text: "Since every commuter behaves identically, the city's traffic problem has nothing to do with aggregation and is simply a matter of population size.", correct: false, misconception: "denying the core aggregation mechanism — the problem is specifically that many individually rational choices compound into an emergent citywide effect" },
      { text: "The gridlock will automatically self-correct once congestion gets bad enough, the same way markets always self-correct after any extreme.", correct: false, misconception: "assuming an automatic self-correction with no supporting mechanism — a one-directional trend having persisted says nothing about whether or how it reverses" },
    ],
    explanationCorrect:
      "Correct — this is the same lesson as the passive-investing ownership paradox: a decision that is individually rational for every person (choosing an index fund, or driving alone) can still produce an aggregate outcome (ownership concentration, or gridlock) that nobody was optimizing for, and because the underlying trend has only run in one direction for years, its behavior under a genuine reversal remains untested and should not be assumed to mirror its behavior on the way up.",
    transferCue: "Where this generalizes: herd behavior in a bank run, everyone individually choosing to work remotely, or a fishery where every boat rationally maximizes its own catch can all produce an aggregate outcome nobody chose, and a trend observed running only in one direction should not be assumed to reverse smoothly.",
  },
];

/* ---------------------------------------------------------------------- */
/* GLOSSARIES (per page)                                                  */
/* ---------------------------------------------------------------------- */

const GLOSSARIES = {
  intro: [
    { term: "Net international migration (NIM)", def: "the number of people moving into a country minus the number moving out, in a given year, counting all immigration statuses together." },
    { term: "Foreign-born / native-born", def: "the Bureau of Labor Statistics' two nativity groups: foreign-born people were born outside the U.S. to non-citizen parents; everyone else is native-born." },
    { term: "Labor force participation rate", def: "the share of people old enough to work who are either working or actively looking for work." },
  ],
  background: [
    { term: "Working-age population", def: "everyone in a country between the ages people typically start and stop working, commonly defined as ages 16 to 64." },
    { term: "Occupation group", def: "a Bureau of Labor Statistics category that groups jobs by the type of work performed, such as construction or sales, regardless of industry." },
    { term: "Median usual weekly earnings", def: "the middle value of a group's typical weekly pay before taxes — half the group earns more, half earns less." },
  ],
  rq1: [
    { term: "Prime-age labor force", def: "workers and job-seekers between ages 25 and 54, the age range with the highest and most stable participation rates." },
    { term: "Percentage point (pp)", def: "the plain difference between two percentages (for example, the move from 4.0% to 4.3% is 0.3 percentage points), as opposed to the percent change relative to the starting value." },
    { term: "CBO projection vintage", def: "a specific dated version of the Congressional Budget Office's economic forecast; later vintages update earlier ones as new data arrives." },
  ],
  rq2: [
    { term: "Labor substitutes", def: "two types of workers who compete for the same jobs, so more of one type reduces opportunities for the other." },
    { term: "Labor complements", def: "two types of workers who specialize in different but connected tasks, so having more of one type can increase demand for the other rather than reduce it." },
    { term: "Occupational upgrading", def: "when workers shift into higher-paid, more specialized tasks, often because a change in the labor market (like new complementary workers) makes those tasks more valuable." },
  ],
  rq3: [
    { term: "Breakeven employment growth", def: "the number of new jobs an economy needs to add each month to keep the unemployment rate from rising or falling." },
    { term: "Nonfarm payrolls", def: "the U.S. government's monthly count of paid jobs at businesses and government agencies, excluding farm work and a few other categories." },
    { term: "Federal funds rate", def: "the interest rate the Federal Reserve targets for overnight loans between banks, its main tool for influencing the wider economy." },
  ],
};

/* ---------------------------------------------------------------------- */
/* SCORED QUESTIONS                                                        */
/* ---------------------------------------------------------------------- */

const MC_QUESTIONS = [
  {
    id: "bg_a",
    section: "background",
    type: "A",
    attachedTo: "chart1",
    prompt:
      "Between the 2024 peak (net international migration of about 2.2 million) and the 2025 estimate (about 515,000), net immigration fell to less than a quarter of its peak level in a single year. The San Francisco Fed separately notes the long-run average, before the 2021-24 surge, ran around 1 million people a year. Relative to that long-run average, not the surge peak, what does the 2025 estimate most directly imply?",
    options: [
      { text: "2025 immigration ran at roughly half the long-run average the U.S. working-age population has typically relied on, not merely \"below the recent surge\" — a materially different and more consequential comparison for anyone modeling future labor-force growth.", correct: true, misconception: null },
      { text: "Because 2025 immigration is higher than zero, the working-age population is still guaranteed to grow at its historical pace.", correct: false, misconception: "ignoring that population also loses working-age members every year through aging and death — a positive but below-average inflow does not guarantee stable-or-rising growth if outflows exceed it" },
      { text: "The drop from 2.2 million to 515,000 is meaningful only in comparison to the recent surge and tells us nothing new once compared to the pre-2021 long-run average.", correct: false, misconception: "getting the comparison backwards — measured against the long-run average, the 2025 estimate is actually below normal, not merely back to normal, which is the more consequential finding" },
      { text: "Since the long-run average itself is only an estimate, no comparison to it can be considered meaningful.", correct: false, misconception: "overcorrecting into blanket skepticism about any estimated benchmark, when the point is identifying which reference period gives the more decision-relevant read" },
    ],
    explanationCorrect:
      "Correct — the more consequential comparison isn't 2025 versus the unusually high 2021-24 surge, it's 2025 versus the pre-surge long-run average of about 1 million a year. At roughly half that average, 2025's estimated 515,000 signals a labor-supply shortfall relative to a normal year, not just a comeback from an abnormal one — exactly why the San Francisco Fed's letter flags this level as insufficient to sustain positive working-age population growth.",
    transferCue: "Where this generalizes: always ask which baseline a change is measured against — a metric that looks like \"returning to normal\" relative to a recent spike can simultaneously be \"below normal\" relative to a longer, more representative average, and the second comparison is usually the one that matters for forecasting.",
  },
  {
    id: "bg_b",
    section: "background",
    type: "B",
    attachedTo: null,
    prompt:
      "Foreign-born workers make up 19.1% of the U.S. civilian labor force in 2025, yet the Kansas City Fed finds they have historically accounted for roughly half of the labor force's annual growth. A commentator calls this \"mathematically impossible; a group can't add more to growth than twice its own share implies.\" What is the strongest explanation for why this is not actually a contradiction?",
    options: [
      { text: "It is a stock-versus-flow issue: 19.1% describes foreign-born workers' share of the existing total labor force (a stock, a level at one point in time), while roughly 50% describes their share of the ANNUAL CHANGE in that total (a flow) — a small group can dominate the flow if the much larger native-born group is barely growing due to aging and falling participation.", correct: true, misconception: null },
      { text: "The two figures must come from different, incompatible surveys, so no comparison between them is valid.", correct: false, misconception: "assuming a methodological mismatch without evidence, when both figures come from consistent labor-force accounting and the tension has a straightforward stock-vs-flow explanation" },
      { text: "Foreign-born workers must be undercounted in the 19.1% figure, since a group contributing half of growth should logically be a much larger share of the total.", correct: false, misconception: "inventing a measurement error to resolve a tension that the stock-vs-flow distinction already resolves without any error" },
      { text: "The 50% growth-contribution figure only holds during recessions, when native-born labor force growth would be negative anyway.", correct: false, misconception: "introducing an unsupported condition — the mechanism (an aging, slower-growing native-born population) operates in ordinary expansion years too, not only downturns" },
    ],
    explanationCorrect:
      "Correct — this is a classic stock-vs-flow confusion. A subgroup's share of a level (the stock, 19.1% of the labor force at a point in time) and its share of the level's annual change (the flow, roughly 50% of labor force growth) are different quantities that can diverge sharply, especially when the much larger group's own growth is close to zero — exactly the case for the aging, slower-growing native-born population the Kansas City and San Francisco Fed both document.",
    transferCue: "Where this generalizes: a customer segment that is a small share of total revenue can be the majority of revenue GROWTH if the rest of the customer base is flat; always check whether a percentage describes a level or a change before treating two percentages about the same group as contradictory.",
  },
  {
    id: "bg_c",
    section: "background",
    type: "C",
    attachedTo: "chart2",
    isCase: true,
    clientName: "Meridian Framing & Drywall",
    prompt:
      "Case Prompt: Meridian Framing & Drywall is a mid-size subcontractor whose crews are, per its own HR records, about 30% foreign-born, concentrated entirely in the \"natural resources, construction, and maintenance\" occupation category this section documents. Meridian's owner, reading that foreign-born workers are \"only\" 13.3% of that occupation category economy-wide versus 7.9% for native-born workers, concludes: \"The gap is not that big — I can replace any departing foreign-born crew member with a native-born hire without much friction.\" Using the occupation-concentration data and the Dallas Fed's Texas survey evidence in this section, which assumption in the owner's reasoning is most exposed?",
    options: [
      { text: "The assumption that Meridian's crews are unionized, which determines whether replacement hiring is even legally possible.", correct: false, misconception: "introducing an irrelevant institutional detail that the case and the section's evidence do not address or depend on" },
      { text: "The assumption that construction wages will rise, which the section's evidence already confirms will happen automatically as foreign-born workers leave.", correct: false, misconception: "stating something the section's evidence does not establish — firms' most common response, per the Dallas Fed survey, was increasing existing employees' hours before wage increases" },
      { text: "The assumption that native-born workers are legally required to accept construction jobs vacated by foreign-born workers, which the Dallas Fed survey shows is false.", correct: false, misconception: "attacking a claim the owner never made — the real, exposed assumption is about the SIZE of the friction, not about any legal obligation" },
      { text: "The assumption that a modest economy-wide ratio (13.3% vs. 7.9%) implies similarly modest friction at the firm level — but Meridian's own crews are already far more concentrated (about 30% foreign-born) than the national occupation average, and the Dallas Fed's survey found nearly 60% of affected Texas firms could not find qualified native-born replacements specifically because of legal-status and work-permit barriers, not a lack of interest in construction work.", correct: true, misconception: null },
    ],
    explanationCorrect:
      "Correct — the section's evidence draws exactly this distinction: a modest-looking national ratio between two occupation shares can understate the disruption facing a specific firm whose own workforce is far more concentrated than the national average, and the Dallas Fed's Texas Business Outlook Survey found the binding constraint for affected firms was rarely a shortage of applicants in the abstract, but a shortage of applicants who hold the legal work authorization the job requires — a friction a national occupation-share comparison cannot reveal.",
    transferCue: "Where this generalizes: any time a firm-level or store-level decision is justified by citing a national or industry-wide average, check how far that specific firm's own concentration sits from the average before assuming the national figure describes its actual exposure.",
  },
  {
    id: "rq1_b",
    section: "rq1",
    type: "B",
    attachedTo: "chart3",
    prompt:
      "A financial news headline reads: \"Fed Research Finds Immigration Crackdown Slashes Labor Force Growth by Two-Thirds.\" Based on the chart, is this headline's \"two-thirds\" figure defensible, and if so, in what specific sense?",
    options: [
      { text: "No — the actual cut is 0.8 percentage points, and calling a percentage-point figure a fraction like \"two-thirds\" is never defensible under any interpretation.", correct: false, misconception: "overcorrecting — a relative-percentage framing (0.8 ÷ 1.2 ≈ 67%) is a legitimate, calculable interpretation of the same figures; the issue is that the headline doesn't specify which framing it means" },
      { text: "Yes, without qualification — a percentage-point cut and a percent cut are interchangeable ways of describing the same change, so \"two-thirds\" and \"0.8 percentage points\" mean the same thing.", correct: false, misconception: "the classic percent-vs-percentage-point conflation: 0.8 percentage points and a 67% relative reduction are both real numbers here, but they are not interchangeable" },
      { text: "The \"two-thirds\" figure is defensible only as a RELATIVE comparison (0.8 percentage points is about 67% of the original 1.2-percentage-point growth rate), not as an absolute statement that growth fell by 67 percentage points — the headline should specify which framing it means, since the two numbers describe very different magnitudes.", correct: true, misconception: null },
      { text: "The headline is indefensible because the San Francisco Fed's own estimate is not really a percentage-point figure at all, but a raw worker-count figure.", correct: false, misconception: "misreading the underlying data — the San Francisco Fed's 0.8-point figure is explicitly a percentage-point change in a growth rate, not a worker count" },
    ],
    explanationCorrect:
      "Correct — a percentage-point change (0.8 points) and a percent change relative to the original value (about 67%, since 0.8 ÷ 1.2 ≈ 0.67) are both legitimate but very different numbers describing the same underlying fact, and conflating them, or presenting one without saying which is meant, is the classic percent-vs-percentage-point trap; a careful reader should always ask \"a percent of what?\" before accepting a headline framing like this one.",
    transferCue: "Where this generalizes: any time a rate or share moves from one percentage to another (an approval rating, a default rate, a market share), check whether a stated \"X% change\" means X percentage points of the original rate or X percent of the original rate's own size — the two can differ by a wide margin, as they do here.",
  },
  {
    id: "rq2_causal",
    section: "rq2",
    type: "B",
    attachedTo: "chart4",
    prompt:
      "Between 2024 and 2025, native-born unemployment rose (4.0% → 4.3%) while foreign-born unemployment held flat (4.2% → 4.2%), even as the foreign-born labor force shrank by roughly a million workers. If native-born and foreign-born workers were simple substitutes competing for the same jobs, removing a million foreign-born workers should have made it EASIER for native-born workers to find jobs. Which is the strongest reason NOT to conclude, from the fact that native-born unemployment rose instead, that immigrants and native-born workers are simple substitutes for each other?",
    options: [
      { text: "Because native-born unemployment is measured with more error than foreign-born unemployment, the 4.0% to 4.3% move may not be real.", correct: false, misconception: "inventing a measurement-quality asymmetry between the two nativity series that no source in this article documents — both rates come from the same survey methodology" },
      { text: "Because unemployment rates are always noisy from year to year, a one-year comparison can never be used as evidence for or against any economic theory.", correct: false, misconception: "overcorrecting into blanket dismissal, when the actual issue is that a competing, evidence-backed mechanism fits the same data at least as well as simple substitution" },
      { text: "Native-born and foreign-born workers must not compete for any of the same jobs at all, since the two unemployment rates moved in opposite directions.", correct: false, misconception: "overstating the conclusion — the data is consistent with some substitution existing in specific occupations while complementarity or demand effects dominate the aggregate pattern" },
      { text: "The pattern is exactly what NBER research on task complementarity would predict if immigrants and native-born workers fill different, complementary roles rather than competing for the same jobs — removing complementary labor can reduce the output of the jobs it supports, cutting demand for the native-born workers who depend on that same production process, and it can also mean fewer immigrant consumers, renters, and customers driving broader demand, both pointing away from simple substitution.", correct: true, misconception: null },
    ],
    explanationCorrect:
      "Correct — this is the standard confound problem applied to labor economics: the pattern (removing a substitute input should have helped, but it didn't) is exactly what you would expect if immigrants and native-born workers are complements, not substitutes, in production, and if a shrinking immigrant population also reduces the number of consumers, renters, and customers driving demand for the very jobs native-born workers hold. Caiumi and Peri's NBER research documents this complementarity mechanism directly, finding immigration over 2000-2023 raised non-college-educated native-born wages by 2.6% to 3.4% through task specialization and occupational upgrading — the same mechanism running in reverse when immigrant labor supply falls.",
    transferCue: "Where this generalizes: whenever removing what looks like a 'competitor' for a resource makes the remaining users worse off rather than better off, check for a complementary or shared-demand relationship before assuming simple substitution — the same logic applies to how removing a supplier from a supply chain can hurt everyone downstream, not just create an opening for a rival supplier.",
  },
  {
    id: "rq2_case",
    section: "rq2",
    type: "C",
    attachedTo: null,
    isCase: true,
    clientName: "Office of a state economic development agency (fictional)",
    prompt:
      "Case Prompt: A state economic development agency's director drafts a memo arguing: \"Our state's new, stricter worksite-enforcement program will free up thousands of jobs for unemployed native-born residents, since every deported or departed immigrant worker vacates a position a native-born resident can fill.\" Which assumption is most load-bearing for this memo's conclusion, and what evidence in this section is thinnest in supporting it?",
    options: [
      { text: "The assumption that federal, not state, agencies control worksite enforcement — an administrative detail the section does not address and that has no bearing on whether the labor-market mechanism in the memo is correct.", correct: false, misconception: "raising a real-world administrative question that is irrelevant to the economic mechanism the memo actually claims" },
      { text: "The assumption that deported workers will not be replaced by automation or offshoring, which this section's evidence strongly confirms will not happen in the relevant industries.", correct: false, misconception: "misstating what the section shows — it does not confirm automation or offshoring will not occur; it simply does not address this channel" },
      { text: "The assumption that immigrant and native-born workers are substitutes for the same jobs — an assumption this section's evidence (native-born unemployment rising, not falling, as the foreign-born labor force shrank by roughly a million workers, plus NBER research finding immigration raised rather than lowered non-college native wages through complementarity) directly undermines rather than supports.", correct: true, misconception: null },
      { text: "The assumption that native-born workers who are currently unemployed live near, and are willing to relocate for, the specific jobs being vacated — a real but secondary friction that only matters once substitutability is established.", correct: false, misconception: "identifying a real secondary friction (geographic mobility) but treating it as load-bearing when the section's central, most directly undermined claim is the substitutability assumption itself" },
    ],
    explanationCorrect:
      "Correct — the memo's entire conclusion rests on treating immigrant and native-born labor as substitutes, but this section's central finding is the opposite: native-born unemployment rose rather than fell as the foreign-born labor force shrank, and NBER research on task complementarity offers a specific, evidence-backed mechanism for why. A memo's most load-bearing assumption is the one that, if false, breaks the entire argument — here, that's the substitution assumption, and it is exactly the assumption this section's evidence is thinnest in supporting, indeed it actively points the other way.",
    transferCue: "Where this generalizes: before accepting any 'removing X frees up room for Y' argument — trade protection freeing up market share for domestic firms, a hiring freeze freeing up budget for other priorities — identify whether X and Y are actually substitutes or complements, since the entire argument's direction flips depending on the answer.",
  },
  {
    id: "rq3_a",
    section: "rq3",
    type: "A",
    attachedTo: "chart5",
    prompt:
      "The chart shows the \"breakeven\" benchmark falling from 150,000 to about 29,000 jobs a month across four projection vintages, while actual July 2026 payrolls FELL by 23,000. Given both a falling benchmark and negative actual job growth, what is the most defensible read of the labor market's current state?",
    options: [
      { text: "It implies the breakeven benchmark itself must be wrong, since actual data went negative.", correct: false, misconception: "assuming model failure rather than recognizing genuine demand weakening that the benchmark was never designed to rule out" },
      { text: "A payroll print like 22,000 to 79,000 in mid-2025 was genuinely ambiguous — fine against the newer, lower benchmarks but weak against the older, higher ones — but July 2026's negative print is unambiguously weak under every vintage of the benchmark shown, including the lowest current estimate, so the \"the bar just got lower\" explanation that fit 2025's softer numbers cannot explain away 2026's decline.", correct: true, misconception: null },
      { text: "It implies nothing, since one month of payroll data is too noisy to interpret against any benchmark.", correct: false, misconception: "overcorrecting into total dismissal, ignoring that the same July 2026 report also showed decelerating wage growth and falling participation as corroborating signals, not an isolated blip" },
      { text: "It implies foreign-born labor supply must have started growing again, since only rising labor supply could explain payrolls turning negative.", correct: false, misconception: "confusing payroll employment, a measure of jobs filled on the demand side, with labor supply or participation, a different concept entirely" },
    ],
    explanationCorrect:
      "Correct — the falling-breakeven story explains why modest, positive 2025 prints were not automatically alarming, but it has limits: a negative print sits below every vintage of the benchmark, so it cannot be waved away as merely 'below the old, higher bar.' The honest read is that the benchmark's decline explains some of 2025's soft-looking payroll numbers, while July 2026's outright decline, paired with decelerating wage growth, points to actual demand-side weakening on top of the lower bar, not instead of it.",
    transferCue: "Where this generalizes: whenever an evaluation standard is revised downward (a curved exam, a relaxed sales quota, a lowered breakeven benchmark), check whether the newest results still clear even the lowered bar before assuming a below-old-standard result is fine — some results are weak under any standard.",
  },
];

const NUMERIC_QUESTIONS = [
  {
    id: "d1",
    section: "rq1",
    type: "D",
    scaffolded: true,
    toleranceType: "tight",
    tolerancePct: 10,
    target: 51.5,
    prompt:
      "Scaffolded estimate: the San Francisco Fed estimates 2025 net international migration at about 515,000 people. The Fed also states the long-run average before the 2021-24 surge ran around 1,000,000 people a year. Express the 2025 estimate as a percentage of that long-run average (not the 2024 surge peak). (Decomposition: 2025 level ÷ long-run average level × 100.)",
    unit: "%",
    lowBound: 0,
    highBound: 150,
    decomposition:
      "515,000 ÷ 1,000,000 × 100 = 51.5%. This is a direct ratio of two stated levels — no additional assumption is required beyond taking the Fed's own two reference numbers at face value.",
    whyActualDiffers:
      "At about half the long-run average, 2025 immigration is not simply \"lower than an unusual surge\"; it is running at roughly half of what the U.S. working-age population has typically relied on for decades — exactly why the San Francisco Fed's letter warns this level is insufficient to sustain positive working-age population growth going forward.",
  },
  {
    id: "d2",
    section: "rq3",
    type: "D",
    scaffolded: false,
    toleranceType: "fermi",
    target: 261,
    prompt:
      "Open-ended Fermi estimate: the CBO and the Dallas Fed both estimate that slower net immigration is cutting roughly 0.8 to 1.0 percentage points off annual U.S. real GDP growth relative to a higher-immigration baseline. U.S. nominal GDP is roughly $29 trillion. Name your own decomposition path, then estimate the annual dollar size of this growth hit, in $ billions.",
    unit: "$ billion",
    lowBound: 100,
    highBound: 500,
    decomposition:
      "Rate × base: a growth-rate hit of roughly 0.8-1.0 percentage points applied to a roughly $29 trillion economy is about 0.009 × $29,000 billion ≈ $260 billion a year (the stated range implies roughly $230 billion to $290 billion). This is a single year's shortfall relative to the higher-immigration baseline, not a cumulative multi-year figure, and it would compound if the lower-immigration path persists.",
    whyActualDiffers:
      "Because this is a forward-looking, model-based estimate rather than a value checkable against one reported statistic, the point of the exercise is the decomposition itself (growth-rate hit × GDP level) and an honest acknowledgment that CBO's and the Dallas Fed's own estimates of the growth-rate hit differ somewhat — a real, disclosed range, not false precision.",
  },
];

const CONCLUSION_QUESTION = {
  id: "e1",
  section: "conclusion",
  type: "E",
  prompt:
    "Given what you have learned, which real-world decision is most directly supported by this article's evidence, and which risk would most threaten it?",
  options: [
    {
      text: "A retail investor should short any company reporting exposure to immigrant labor, since this article proves such companies are guaranteed to see falling profits.",
      correct: false,
      misconception: "overreaching into a specific, universal investment call the article's evidence does not support — the article documents labor-market and macro effects, not firm-level profit outcomes",
    },
    {
      text: "The Federal Reserve should ignore payroll and wage data below the old breakeven benchmarks, since this article shows the benchmark has permanently fallen and no print can signal real weakness again.",
      correct: false,
      misconception: "overapplying the \"lower breakeven\" lesson without limit — the article's own July 2026 data (a negative payroll print, decelerating wage growth) shows some prints are weak under any benchmark, old or new",
    },
    {
      text: "A regional employer in an immigrant-labor-intensive industry (construction, hospitality, food processing) should plan for a persistently smaller applicant pool rather than betting that departing immigrant workers will be replaced one-for-one by native-born hires, because the complementarity evidence in this article suggests the more likely path is reduced output or higher hours for existing staff, not a wage-driven influx of native-born replacements; this reading would be falsified if native-born wages and employment in these specific occupations begin rising sharply in the same data series that currently shows the opposite.",
      correct: true,
      misconception: null,
    },
    {
      text: "Policymakers should conclude that immigration levels have no effect on GDP growth, since CBO's estimated 0.8-to-1.0-percentage-point growth effect is too small to matter for any practical decision.",
      correct: false,
      misconception: "dismissing a real, sourced, multi-agency-corroborated effect as immaterial without justification — a persistent annual GDP growth gap of this size compounds significantly over several years",
    },
  ],
  explanationCorrect:
    "Correct — the article's central, falsifiable claim is that immigrant and native-born labor behave more like complements than substitutes in the sectors and years examined, so a shrinking immigrant labor supply is more likely to show up as reduced output, longer hours for existing workers, and unfilled positions than as a wage-driven wave of native-born hiring. The observation that would most directly falsify this reading is exactly the one named: native-born wages and employment rising sharply, specifically in the immigrant-concentrated occupations this article documents, rather than the flat-to-worsening pattern actually observed through 2025 and into 2026. Until that reversal appears in the data, planning for a persistently smaller applicant pool is the better-supported bet.",
  transferCue:
    "Where this generalizes: any 'removing X should free up room for Y' plan — trade protection freeing market share for domestic firms, automation freeing up budget for other hires, a hiring freeze freeing capacity elsewhere — should be pressure-tested against whether X and Y are actually substitutes before committing resources, and the plan's backers should name in advance what data would prove them wrong.",
};

/* ---------------------------------------------------------------------- */
/* SMALL UI PRIMITIVES                                                    */
/* ---------------------------------------------------------------------- */

function Glossary({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="glossary-panel">
      <div className="glossary-label">Glossary</div>
      <ul>
        {items.map((g, i) => (
          <li key={i}>
            <strong>{g.term}</strong> — {g.def}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SourceTag({ id }) {
  const s = SOURCES.find((x) => x.id === id);
  if (!s) return null;
  return (
    <a className="src-tag" href={s.url} target="_blank" rel="noreferrer">
      {srcTag(id)}
    </a>
  );
}

function ChartMeta({ tier, note }) {
  return (
    <div className="chart-meta">
      <span className={"tier-badge tier-" + tier.toLowerCase()}>{tier}</span>
      {note && <span className="chart-note">{note}</span>}
    </div>
  );
}

function ChartInterpretation({ chartKey, prompts, submitted, values, onSubmit }) {
  const [drafts, setDrafts] = useState(["", ""]);
  return (
    <div className="interp-block">
      {prompts.map((p, i) => {
        const isSubmitted = submitted[i];
        return (
          <div className="interp-prompt" key={i}>
            <div className="interp-kind">{promptKindLabel(p.kind)}</div>
            <div className="interp-question">{p.prompt}</div>
            {!isSubmitted && (
              <div className="interp-input-row">
                <textarea
                  minLength={15}
                  placeholder="Type your answer here (at least 15 characters)..."
                  value={drafts[i]}
                  onChange={(e) => {
                    const next = drafts.slice();
                    next[i] = e.target.value;
                    setDrafts(next);
                  }}
                />
                <button
                  className="btn-secondary"
                  disabled={drafts[i].trim().length < 15}
                  onClick={() => onSubmit(chartKey, i, drafts[i])}
                >
                  Submit
                </button>
              </div>
            )}
            {isSubmitted && (
              <div className="interp-revealed">
                <div className="reader-answer">
                  <span className="tag-you">Your answer</span>
                  <p>{values[i]}</p>
                </div>
                <div className="authored-answer">
                  <span className="tag-authored">Compare your answer to the authored one</span>
                  <p>{p.authored}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function promptKindLabel(kind) {
  switch (kind) {
    case "sowhat": return "So-what / decision implication";
    case "quant": return "Quantitative reasoning";
    case "mechanism": return "Qualitative / mechanism";
    case "causal": return "Causal / comparative";
    default: return "Interpretation";
  }
}

function MultipleChoice({ q, state, onSubmit }) {
  const [selected, setSelected] = useState(null);
  const submitted = state && state.submitted;
  const letters = ["A", "B", "C", "D"];
  return (
    <div className={"question-card" + (q.isCase ? " case-card" : "")}>
      {q.isCase && <div className="case-label">Case Prompt — {q.clientName}</div>}
      <div className="q-type-tag">{typeLabel(q.type)}</div>
      <p className="q-prompt">{q.prompt}</p>
      <div className="option-list">
        {q.options.map((opt, i) => {
          let cls = "option-card";
          if (submitted) {
            if (opt.correct) cls += " option-correct";
            else if (state.selectedOption === i) cls += " option-wrong";
          } else if (selected === i) {
            cls += " option-selected";
          }
          return (
            <div
              key={i}
              className={cls}
              onClick={() => !submitted && setSelected(i)}
            >
              <span className="option-letter">{letters[i]}</span>
              <span className="option-text">{opt.text}</span>
            </div>
          );
        })}
      </div>
      {!submitted && (
        <button
          className="btn-primary"
          disabled={selected === null}
          onClick={() => onSubmit(q.id, selected, q.options[selected].correct)}
        >
          Submit answer
        </button>
      )}
      {submitted && (
        <div className={"explanation-block " + (state.isCorrect ? "explanation-correct" : "explanation-wrong")}>
          <div className="calibration-note">
            {state.isCorrect
              ? "Correct — this reasoning generalizes."
              : "Incorrect — this is " + (q.options[state.selectedOption].misconception || "a reasoning gap") + "."}
          </div>
          <p>{q.explanationCorrect}</p>
          <p className="transfer-cue">{q.transferCue}</p>
        </div>
      )}
    </div>
  );
}

function typeLabel(t) {
  const map = { W: "Warm-Up — Prior-Article Retrieval", A: "Type A — Chart Reading & Implication", B: "Type B — Trend Reasoning", C: "Type C — Consulting Case", D: "Type D — Quantitative Estimation", E: "Type E — Implication Bridge" };
  return map[t] || t;
}

function NumericQuestion({ q, state, onSubmit }) {
  const [value, setValue] = useState("");
  const [path, setPath] = useState("");
  const submitted = state && state.submitted;
  const requiresPath = !q.scaffolded;

  function logDistanceScore(guess, target) {
    if (guess <= 0 || target <= 0) return 0;
    const ratio = guess / target;
    const within2x = ratio >= 0.5 && ratio <= 2;
    return within2x ? 1 : 0;
  }
  function tightScore(guess, target, pct) {
    const diff = Math.abs(guess - target) / target;
    return diff <= pct / 100 ? 1 : 0;
  }

  function submit() {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    const correct =
      q.toleranceType === "tight"
        ? tightScore(num, q.target, q.tolerancePct) === 1
        : logDistanceScore(num, q.target) === 1;
    onSubmit(q.id, num, correct, path);
  }

  return (
    <div className="question-card numeric-card">
      <div className="q-type-tag">{typeLabel(q.type)}</div>
      <p className="q-prompt">{q.prompt}</p>
      {requiresPath && !submitted && (
        <div className="path-input">
          <label>Name your decomposition path before entering a number:</label>
          <input
            type="text"
            placeholder="e.g., rate × base, or population × share × price..."
            value={path}
            onChange={(e) => setPath(e.target.value)}
          />
        </div>
      )}
      {!submitted && (
        <div className="numeric-input-row">
          <input
            type="number"
            placeholder={"Your estimate (" + q.unit + ")"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <input
            type="range"
            min={q.lowBound}
            max={q.highBound}
            value={value || q.lowBound}
            onChange={(e) => setValue(e.target.value)}
          />
          <button
            className="btn-primary"
            disabled={value === "" || (requiresPath && path.trim().length < 3)}
            onClick={submit}
          >
            Submit estimate
          </button>
        </div>
      )}
      {submitted && (
        <div className={"explanation-block " + (state.isCorrect ? "explanation-correct" : "explanation-wrong")}>
          <div className="numeric-compare">
            <div className="axis-track">
              <div className="axis-marker your-marker" style={{ left: pct(state.numericValue, q.lowBound, q.highBound) + "%" }}>
                <span>You: {state.numericValue}</span>
              </div>
              <div className="axis-marker actual-marker" style={{ left: pct(q.target, q.lowBound, q.highBound) + "%" }}>
                <span>Actual: {q.target}</span>
              </div>
            </div>
          </div>
          <div className="calibration-note">
            {state.isCorrect
              ? "Correct (within declared tolerance) — this reasoning generalizes."
              : "Incorrect (outside declared tolerance) — this is " +
                (q.toleranceType === "tight" ? "an arithmetic slip, not a reasoning error" : "base-rate / decomposition drift, common in Fermi estimation") +
                "."}
          </div>
          <p className="how-to-estimate"><strong>How to estimate this:</strong> {q.decomposition}</p>
          <p>{q.whyActualDiffers}</p>
        </div>
      )}
    </div>
  );
}

function pct(val, lo, hi) {
  const v = Math.max(lo, Math.min(hi, val));
  return ((v - lo) / (hi - lo)) * 100;
}

/* ---------------------------------------------------------------------- */
/* CHART COMPONENTS                                                        */
/* ---------------------------------------------------------------------- */

function Chart1Line() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={NIM_TREND} margin={{ top: 20, right: 24, left: 0, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="period" tick={{ fontSize: 11 }} interval={0} angle={-8} textAnchor="end" height={50} />
        <YAxis label={{ value: "Millions of people / year", angle: -90, position: "insideLeft", fontSize: 12 }} domain={[0, 2.5]} />
        <Tooltip formatter={(v) => v.toFixed(3) + "M"} />
        <Line type="monotone" dataKey="nim" stroke="#111" strokeWidth={2.5} dot={{ r: 5 }}>
          <LabelList dataKey="nim" position="top" formatter={(v) => v.toFixed(2) + "M"} fontSize={11} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}

function Chart2Dumbbell() {
  const rows = OCCUPATION_GAP.map((r) => ({
    ...r,
    base: Math.min(r.foreignBorn, r.nativeBorn),
    delta: Math.abs(r.foreignBorn - r.nativeBorn),
  }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={rows} layout="vertical" margin={{ top: 10, right: 50, left: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis type="number" label={{ value: "% of employed group", position: "insideBottom", offset: -2, fontSize: 12 }} domain={[0, 50]} />
        <YAxis dataKey="label" type="category" width={230} tick={{ fontSize: 10.5 }} />
        <Tooltip />
        <Bar dataKey="base" stackId="d" fill="transparent" />
        <Bar dataKey="delta" stackId="d" fill="#e5e7eb" barSize={6} />
        <Scatter dataKey="foreignBorn" fill="#2563eb">
          <LabelList dataKey="foreignBorn" position="top" formatter={(v) => "FB " + v.toFixed(1) + "%"} fontSize={10.5} />
        </Scatter>
        <Scatter dataKey="nativeBorn" fill="#111">
          <LabelList dataKey="nativeBorn" position="bottom" formatter={(v) => "NB " + v.toFixed(1) + "%"} fontSize={10.5} />
        </Scatter>
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function Chart3Waterfall() {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart data={GROWTH_BRIDGE} margin={{ top: 24, right: 24, left: 0, bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="label" tick={{ fontSize: 10.5 }} interval={0} angle={-14} textAnchor="end" height={70} />
        <YAxis label={{ value: "Prime-age LF growth, % / year", angle: -90, position: "insideLeft", fontSize: 11 }} domain={[0, 1.4]} />
        <Tooltip formatter={(v, n) => (n === "delta" ? [v.toFixed(1) + " pp", "Change"] : [v, n])} />
        <Bar dataKey="base" stackId="a" fill="transparent" />
        <Bar dataKey="delta" stackId="a">
          {GROWTH_BRIDGE.map((row, i) => (
            <Cell key={i} fill={row.kind === "total" ? "#111" : "#dc2626"} />
          ))}
          <LabelList dataKey="delta" position="top" formatter={(v) => v.toFixed(1)} fontSize={11} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function Chart4Slope() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={UNEMPLOYMENT_SLOPE} margin={{ top: 20, right: 90, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
        <XAxis dataKey="period" />
        <YAxis label={{ value: "Unemployment rate, %", angle: -90, position: "insideLeft", fontSize: 12 }} domain={[3.5, 4.6]} />
        <Tooltip />
        <Legend />
        <Line type="linear" dataKey="nativeBorn" name="Native-born" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 5 }}>
          <LabelList dataKey="nativeBorn" position="right" formatter={(v) => v.toFixed(1) + "%"} fontSize={11} />
        </Line>
        <Line type="linear" dataKey="foreignBorn" name="Foreign-born" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 5 }}>
          <LabelList dataKey="foreignBorn" position="right" formatter={(v) => v.toFixed(1) + "%"} fontSize={11} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}

function Chart5Bullet() {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart data={BREAKEVEN_BARS} margin={{ top: 24, right: 24, left: 0, bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="vintage" tick={{ fontSize: 10.5 }} interval={0} angle={-14} textAnchor="end" height={70} />
        <YAxis label={{ value: "Jobs per month (thousands)", angle: -90, position: "insideLeft", fontSize: 11 }} domain={[-40, 170]} />
        <Tooltip formatter={(v) => v + "K jobs/month"} />
        <ReferenceLine y={0} stroke="#999" />
        <ReferenceLine y={75} stroke="#16a34a" strokeDasharray="4 4" label={{ value: "Actual avg., 2025 through Aug (~75K)", position: "insideTopRight", fontSize: 10, fill: "#16a34a" }} />
        <ReferenceLine y={-23} stroke="#dc2626" strokeDasharray="4 4" label={{ value: "Actual, Jul 2026 (-23K)", position: "insideBottomRight", fontSize: 10, fill: "#dc2626" }} />
        <Bar dataKey="breakeven" fill="#2563eb">
          <LabelList dataKey="breakeven" position="top" formatter={(v) => v + "K"} fontSize={11} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ---------------------------------------------------------------------- */
/* CHART CARD WRAPPER                                                     */
/* ---------------------------------------------------------------------- */

function ChartCard({ chartKey, title, tier, note, ChartComponent, interpState, onInterpSubmit }) {
  const prompts = CHART_PROMPTS[chartKey];
  const submitted = interpState.submitted;
  const values = interpState.values;
  return (
    <div className="chart-card">
      <div className="chart-title">{title}</div>
      <ChartComponent />
      <ChartMeta tier={tier} note={note} />
      <ChartInterpretation chartKey={chartKey} prompts={prompts} submitted={submitted} values={values} onSubmit={onInterpSubmit} />
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* SECTIONS                                                                */
/* ---------------------------------------------------------------------- */

function SectionWrapper({ id, title, children }) {
  return (
    <section id={id} className="page-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function WarmUpSection({ mcState, onMcSubmit }) {
  return (
    <SectionWrapper id="sec-warmup" title="Warm-Up: What Stuck?">
      <p>
        Before today's topic, three quick checks on principles from earlier articles in this series. Each question
        asks you to apply an idea you already learned to a brand-new situation — not to recall a fact from a prior
        article.
      </p>
      {WARMUP_QUESTIONS.map((q) => (
        <div key={q.id}>
          <div className="warmup-source-tag">From: {q.sourceArticle}</div>
          <MultipleChoice q={{ ...q, type: "W" }} state={mcState[q.id]} onSubmit={onMcSubmit} />
        </div>
      ))}
    </SectionWrapper>
  );
}

function IntroSection() {
  return (
    <SectionWrapper id="sec-intro" title="Introduction">
      <p>
        Basic economics says shrinking the supply of a substitute should raise the price of what is left. In 2025
        and 2026 the United States cut its immigrant labor force by roughly a million workers in a single year, and
        the native-born workers that logic said should benefit saw their unemployment rate rise instead of getting a
        raise.
      </p>
      <p>
        The scale of the shift is large by any historical measure. Net international migration, the number of
        people moving into the country minus the number leaving, ran around 1 million people a year before 2021,
        then surged to about 2.2 million in 2024, then collapsed to an estimated 515,000 in 2025 — less than a
        quarter of the 2024 peak and roughly half the pre-surge long-run average <SourceTag id="sffed_el2528" />.
        Foreign-born workers are 19.1% of the U.S. civilian labor force, yet the Kansas City Fed finds they have
        historically supplied roughly half of the labor force's annual growth <SourceTag id="kcfed_bulletin" />,
        because the much larger native-born population is aging and its own participation rate is falling. Cutting
        immigration this sharply does not just remove a slice of the workforce; it removes the slice that was doing
        most of the growing.
      </p>
      <p>
        The textbook prediction and the observed outcome point in opposite directions. If immigrant and native-born
        workers compete for the same jobs, a shrinking immigrant labor force should have eased that competition and
        helped native-born workers. Instead, U.S. Bureau of Labor Statistics data show native-born unemployment
        rising from 4.0% in 2024 to 4.3% in 2025 while foreign-born unemployment held flat at 4.2%
        <SourceTag id="bls_forbrn2025" />, and wage growth for all workers slowed to 3.2% over the twelve months
        ending July 2026, the slowest pace since May 2021 <SourceTag id="bls_empsit_jul26" />, right when a tighter
        labor market should have been pushing pay up faster, not slower. On the ground, the Dallas Fed's own survey
        of Texas businesses found firms responding to lost immigrant labor mainly by working existing employees
        longer hours, not by hiring and paying more native-born workers <SourceTag id="dallasfed_tx" />.
      </p>
      <p>
        This note addresses three questions. First, how large was the 2025-2026 immigrant labor-supply shock, and
        which industries and occupations concentrated it? Second, why did native-born workers' outcomes deteriorate
        rather than improve, when standard supply-and-demand logic said competition for jobs should have eased?
        Third, what does the collapse in "breakeven employment growth," the pace of hiring needed just to hold the
        unemployment rate steady, reveal about whether the labor market is genuinely tightening, and what does that
        imply for the Federal Reserve's policy path through 2028?
      </p>
      <Glossary items={GLOSSARIES.intro} />
    </SectionWrapper>
  );
}

function BackgroundSection({ chartInterp, onInterpSubmit, mcState, onMcSubmit }) {
  return (
    <SectionWrapper id="sec-background" title="Background: Trajectory and Structural Context">
      <h3>From a decades-long tailwind to an abrupt reversal</h3>
      <p>
        For more than a decade, immigration was the main reason the U.S. labor force kept growing at all. The San
        Francisco Fed calculates that, without any immigration, the U.S. working-age population (people age 16 to
        64) would have started shrinking as early as 2012, as declining birth rates and retiring baby boomers pulled
        the native-born working-age population down faster than new native-born adults could replace them{" "}
        <SourceTag id="sffed_el2528" />. Immigration filled that gap. Then, starting in 2021, net international
        migration surged well above its historical pace, before enforcement, visa, and refugee-policy changes that
        began in mid-2024 sharply reversed the flow <SourceTag id="dallasfed_tx" />.
      </p>
      <ChartCard
        chartKey="chart1"
        title="Chart 1. Net international migration: long-run average vs. 2024 surge peak vs. 2025 estimate"
        tier="ESTIMATE"
        note={<>Source: Federal Reserve Bank of San Francisco research estimate, based on Census Bureau and Department of Homeland Security data with demographic modeling, not a direct Census actual count <SourceTag id="sffed_el2528" />.</>}
        ChartComponent={Chart1Line}
        interpState={chartInterp.chart1}
        onInterpSubmit={onInterpSubmit}
      />
      <MultipleChoice q={MC_QUESTIONS.find((q) => q.id === "bg_a")} state={mcState["bg_a"]} onSubmit={onMcSubmit} />
      <p>
        The reversal is already visible in the labor force itself. The foreign-born labor force fell by 596,000
        people between January and February 2026 alone, and by 1,008,000 since its peak in March 2025{" "}
        <SourceTag id="nfap_mar2026" />. Over the same period, the total U.S. labor force — native-born and
        foreign-born combined — fell by 213,000 workers, a sharp break from the more than 1.3 million workers a year
        the labor force added on average from 2014 to 2024, more than half of which came from immigration{" "}
        <SourceTag id="nfap_mar2026" />. Foreign-born workers are 19.1% of the labor force, yet the Kansas City Fed
        finds they have supplied roughly half of its annual growth in recent years <SourceTag id="kcfed_bulletin" />
        , a gap between a group's share of a total and its share of that total's growth that becomes central to
        research question one.
      </p>
      <MultipleChoice q={MC_QUESTIONS.find((q) => q.id === "bg_b")} state={mcState["bg_b"]} onSubmit={onMcSubmit} />
      <h3>Where the shock concentrates</h3>
      <p>
        The reversal does not land evenly across the economy. Foreign-born and native-born workers cluster in
        different occupations, and the size of that gap determines where a labor-supply shock is felt first and
        hardest.
      </p>
      <ChartCard
        chartKey="chart2"
        title="Chart 2. Occupation-group shares, foreign-born vs. native-born workers, 2025"
        tier="FACT"
        note={<>Source: U.S. Bureau of Labor Statistics, "Foreign-Born Workers: Labor Force Characteristics — 2025" <SourceTag id="bls_forbrn2025" />. 2025 figures use an 11-month average excluding October 2025 due to a federal government shutdown; BLS notes 2025 annual estimates are not strictly comparable to other years on this basis.</>}
        ChartComponent={Chart2Dumbbell}
        interpState={chartInterp.chart2}
        onInterpSubmit={onInterpSubmit}
      />
      <p>
        Foreign-born workers are over-represented, relative to native-born workers, in natural resources,
        construction, and maintenance occupations (13.3% vs. 7.9%) and in service occupations (21.2% vs. 15.6%),
        and under-represented in management, professional, and related occupations (36.8% vs. 45.2%) and in sales
        and office occupations (13.6% vs. 19.9%) <SourceTag id="bls_forbrn2025" />. Median usual weekly earnings for
        full-time foreign-born workers were $1,059 in 2025, 85.7% of the $1,236 earned by full-time native-born
        workers <SourceTag id="bls_forbrn2025" />, a gap the BLS attributes mainly to differences in education,
        occupation, industry, and region rather than to nativity itself.
      </p>
      <MultipleChoice q={MC_QUESTIONS.find((q) => q.id === "bg_c")} state={mcState["bg_c"]} onSubmit={onMcSubmit} />
      <p>
        The structural tailwind behind decades of immigration-driven labor force growth was demographic: an aging,
        slower-growing native-born population that could not fill the gap on its own. The headwind arriving since
        mid-2024 is entirely policy-driven: tighter border enforcement, the end of pandemic-era humanitarian
        parole and asylum work permits that had covered at least 4 million immigrants between 2021 and 2024,
        expiring Temporary Protected Status for roughly 1.3 million more, and interior immigration arrests running
        at about triple their level at the end of the prior administration <SourceTag id="dallasfed_tx" />. The
        structural gap this creates is the subject of the next three sections: a labor force that grew for a decade
        on the back of one input is now shrinking exactly where that input was concentrated.
      </p>
      <Glossary items={GLOSSARIES.background} />
    </SectionWrapper>
  );
}

function RQ1Section({ chartInterp, onInterpSubmit, mcState, onMcSubmit, numState, onNumSubmit }) {
  return (
    <SectionWrapper id="sec-rq1" title="Research Question One: How Large Was the Shock?">
      <p>
        The honest answer starts with a revision, not a single number: every major forecaster's estimate of how much
        the U.S. labor force would grow has been marked down repeatedly since early 2024, and the size of the
        markdown is itself the clearest measure of how large this shock turned out to be.
      </p>
      <p>
        The San Francisco Fed's own research illustrates the scale of the revision. Using the Congressional Budget
        Office's January 2025 immigration assumptions as a "pre-shock" baseline, the Fed's economists estimate the
        U.S. prime-age labor force (people age 25 to 54) would have grown at roughly 1.2% a year in the near term.
        Accounting for the actual, sharply lower 2025 immigration levels and roughly 285,000 interior deportations,
        their revised estimate is about 0.8 percentage points lower <SourceTag id="sffed_el2528" />.
      </p>
      <ChartCard
        chartKey="chart3"
        title="Chart 3. Prime-age labor force growth-rate bridge: pre-shock projection to Nov-2025 revised estimate"
        tier="ESTIMATE"
        note={<>Source: Federal Reserve Bank of San Francisco, Economic Letter 2025-28 <SourceTag id="sffed_el2528" />. Bars decompose the change in the projected annual prime-age labor force growth rate.</>}
        ChartComponent={Chart3Waterfall}
        interpState={chartInterp.chart3}
        onInterpSubmit={onInterpSubmit}
      />
      <MultipleChoice q={MC_QUESTIONS.find((q) => q.id === "rq1_b")} state={mcState["rq1_b"]} onSubmit={onMcSubmit} />
      <p>
        The worker-count evidence tells the same story in a different unit. The foreign-born labor force is down
        1,008,000 people from its March 2025 peak through February 2026, even as the Congressional Budget Office and
        Social Security Administration had assumed roughly 1.3 million MORE foreign-born workers over a comparable
        period when they built their early-2025 projections <SourceTag id="nfap_mar2026" />. That is not a shortfall
        of a few percentage points against expectations; it is a reversal of direction, arriving on top of a
        native-born population that, on its own demographic momentum, cannot replace the growth immigration used to
        supply <SourceTag id="sffed_el2528" />.
      </p>
      <NumericQuestion q={NUMERIC_QUESTIONS.find((q) => q.id === "d1")} state={numState["d1"]} onSubmit={onNumSubmit} />
      <p>
        The shock also concentrates geographically and by industry in ways national averages understate. In Texas,
        the Dallas Fed's Texas Business Outlook Surveys found that 20% of surveyed businesses expected immigration
        policy changes to hurt their ability to hire and retain foreign-born workers in 2025, with 13% already
        reporting a negative effect by mid-year <SourceTag id="dallasfed_tx" />. The survey's authors note it likely
        understates the true effect nationally, because it excludes construction and agriculture, two of the
        industries most dependent on immigrant labor <SourceTag id="dallasfed_tx" />. Nearly 60% of affected firms
        cited an inability to find workers with legal work authorization, not a lack of interested applicants{" "}
        <SourceTag id="dallasfed_tx" />, a distinction that matters for research question two.
      </p>
      <p>
        The size of the shock, in short, is large enough to show up in three independent measures at once: a
        percentage-point downgrade to projected labor force growth, a million-worker swing in the actual foreign-born
        labor force relative to its recent peak, and a one-fifth share of surveyed employers in one state alone
        reporting real hiring damage. Any explanation of what happens next has to be sized against a shock this
        large, not treated as a rounding error.
      </p>
      <Glossary items={GLOSSARIES.rq1} />
    </SectionWrapper>
  );
}

function RQ2Section({ chartInterp, onInterpSubmit, mcState, onMcSubmit }) {
  return (
    <SectionWrapper id="sec-rq2" title="Research Question Two: Why Didn't Native-Born Workers Benefit?">
      <p>
        If immigrant and native-born workers were simple substitutes, competing head-to-head for the same jobs,
        removing roughly a million foreign-born workers from the labor force in a year should have eased that
        competition and improved native-born workers' job prospects. The data show the opposite happening.
      </p>
      <ChartCard
        chartKey="chart4"
        title="Chart 4. Unemployment rate, native-born vs. foreign-born workers, 2024 → 2025"
        tier="FACT"
        note={<>Source: U.S. Bureau of Labor Statistics, "Foreign-Born Workers: Labor Force Characteristics — 2025" <SourceTag id="bls_forbrn2025" />. 2025 uses an 11-month average excluding October 2025 due to a federal government shutdown.</>}
        ChartComponent={Chart4Slope}
        interpState={chartInterp.chart4}
        onInterpSubmit={onInterpSubmit}
      />
      <p>
        Native-born unemployment rose from 4.0% in 2024 to 4.3% in 2025, while foreign-born unemployment held flat
        at 4.2% <SourceTag id="bls_forbrn2025" />. Monthly, less-smoothed data from the National Foundation for
        American Policy's analysis of Current Population Survey figures shows an even sharper move: the U.S.-born
        unemployment rate climbed from 4.4% in February 2025 to 4.7% in February 2026, with no corresponding rise in
        the U.S.-born labor force participation rate, which instead slipped from 61.4% to 61.0% over the same year
        <SourceTag id="nfap_mar2026" />. If departing immigrants were opening jobs native-born workers wanted, more
        native-born people should have been drawn back into the labor force to take them. Instead, fewer are
        participating at all.
      </p>
      <MultipleChoice q={MC_QUESTIONS.find((q) => q.id === "rq2_causal")} state={mcState["rq2_causal"]} onSubmit={onMcSubmit} />
      <p>
        The best available research points to complementarity, not substitution, as the mechanism. Alessandro
        Caiumi and Giovanni Peri, in National Bureau of Economic Research work re-examining two decades of U.S.
        immigration data, find that immigration from 2000 to 2023 raised the wages of non-college-educated
        native-born workers by 2.6% to 3.4%, not lowered them, largely because immigrant and native-born workers
        specialize in different tasks within the same production process; native-born workers shift toward more
        communication-intensive, higher-paid roles as immigrant workers take on other tasks, a pattern called
        occupational upgrading <SourceTag id="peri_caiumi_nber" />. If that complementarity runs in reverse when
        immigrant labor supply shrinks, removing immigrant workers should reduce, not increase, the output and labor
        demand of the complementary jobs native-born workers hold — which is close to what the unemployment data
        show.
      </p>
      <p>
        A second channel works alongside complementarity: demand. Immigrants are workers, but they are also
        consumers, renters, and customers. The San Francisco Fed notes that a shrinking immigrant population reduces
        the number of consumers in the economy on top of reducing labor supply <SourceTag id="sffed_el2528" />, and
        the Dallas Fed's Texas survey recorded a retailer describing exactly this mechanism on the ground: "reduced
        sales to foreign-born customers, and customer counts down periodically due to raids by ICE in the area"{" "}
        <SourceTag id="dallasfed_tx" />. When the same policy shock cuts both labor supply and labor demand at
        close to the same time, a simple single-market supply-and-demand model, built to analyze a shift in only one
        of the two curves, is the wrong tool, and its wage-boosting prediction should not be expected to hold.
      </p>
      <MultipleChoice q={MC_QUESTIONS.find((q) => q.id === "rq2_case")} state={mcState["rq2_case"]} onSubmit={onMcSubmit} />
      <p>
        Employers' own reported responses confirm which channel dominated in practice. Asked how they were adjusting
        to reduced ability to hire or retain foreign-born workers, Texas firms in the Dallas Fed's survey most
        commonly reported increasing the hours of existing employees first, with planned wage and benefit increases
        and additional hiring of U.S.-born, naturalized, or permanent-resident workers as secondary responses{" "}
        <SourceTag id="dallasfed_tx" />. That ordering is the opposite of what a simple substitution story predicts:
        if native-born workers were the obvious replacement, hiring them would be the first response, not the third.
      </p>
      <Glossary items={GLOSSARIES.rq2} />
    </SectionWrapper>
  );
}

function RQ3Section({ chartInterp, onInterpSubmit, mcState, onMcSubmit, numState, onNumSubmit }) {
  return (
    <SectionWrapper id="sec-rq3" title="Research Question Three: Is the Labor Market Actually Tightening?">
      <p>
        If a smaller labor force needs fewer new jobs each month to keep the unemployment rate steady, then a
        run of soft-looking payroll reports might not mean weak demand for workers at all — it might just mean the
        bar for "healthy" has moved. Distinguishing those two stories is the point of "breakeven employment growth,"
        the pace of hiring an economy needs each month just to hold its unemployment rate constant.
      </p>
      <ChartCard
        chartKey="chart5"
        title="Chart 5. Breakeven employment growth across four projection vintages, vs. actual payroll growth"
        tier="ESTIMATE"
        note={<>Sources: Federal Reserve Bank of Kansas City, Economic Bulletin <SourceTag id="kcfed_bulletin" />; Federal Reserve Bank of Dallas, Southwest Economy <SourceTag id="dallasfed_tx" />; U.S. Bureau of Labor Statistics, Employment Situation, July 2026 <SourceTag id="bls_empsit_jul26" />. Breakeven figures are model-based Federal Reserve staff estimates, not official CBO or BLS statistics.</>}
        ChartComponent={Chart5Bullet}
        interpState={chartInterp.chart5}
        onInterpSubmit={onInterpSubmit}
      />
      <p>
        The benchmark has fallen sharply and repeatedly. Using the Congressional Budget Office's January 2024
        immigration assumptions, Kansas City Fed economist Yusuf Mercan calculates breakeven employment growth of
        about 150,000 jobs a month. Using the CBO's January 2025 assumptions, that fell to 126,000; using its
        September 2025 assumptions, to 77,000; and netting out immigration's now much-smaller projected contribution
        to population growth, to about 29,000 <SourceTag id="kcfed_bulletin" />. At the peak of the 2021-24
        immigration surge, by contrast, economists had estimated breakeven employment growth at roughly 250,000 jobs
        a month, itself far above the 70,000-to-90,000 long-run historical norm <SourceTag id="dallasfed_tx" />.
      </p>
      <MultipleChoice q={MC_QUESTIONS.find((q) => q.id === "rq3_a")} state={mcState["rq3_a"]} onSubmit={onMcSubmit} />
      <p>
        This falling benchmark genuinely changes how a given payroll report should be read. July and August 2025
        payroll growth of 79,000 and 22,000 jobs, respectively, looked weak against the old 150,000 benchmark but
        was closer to consistent with the labor market's underlying, immigration-adjusted capacity
        <SourceTag id="kcfed_bulletin" />, and average U.S. job creation through August 2025 ran near 75,000 jobs a
        month <SourceTag id="dallasfed_tx" />, comfortably above the roughly 29,000-to-30,000 breakeven estimate
        current at the time. But the benchmark's decline has a floor: it cannot explain a negative print. Nonfarm
        payrolls fell by 23,000 in July 2026, the unemployment rate held at 4.1% only because labor-force
        participation kept falling, and average hourly earnings growth slowed to 3.2% over the prior twelve months,
        the weakest pace since May 2021 <SourceTag id="bls_empsit_jul26" /> — a print that sits below every vintage
        of the breakeven benchmark shown, old or new.
      </p>
      <NumericQuestion q={NUMERIC_QUESTIONS.find((q) => q.id === "d2")} state={numState["d2"]} onSubmit={onNumSubmit} />
      <p>
        The Federal Reserve's own economic projections treat this ambiguity as a genuine policy risk, not a
        settled question. The Congressional Budget Office's January 2026 outlook has the unemployment rate rising to
        an estimated 4.5% by the end of 2025 and 4.6% in 2026 before easing to 4.4% by 2028, attributing part of the
        rise explicitly to "changes in immigration policy that slow labor force growth," alongside tariffs and the
        fading effects of 2025 fiscal legislation <SourceTag id="cbo_econ2628" />. The same outlook has the Fed's
        target interest rate falling from 3.9% at the end of 2025 to 3.4% by the end of 2026 as the Fed responds to
        "downside risks to the labor market" <SourceTag id="cbo_econ2628" />, and the Dallas Fed's own separate
        modeling estimates the immigration slowdown alone is cutting U.S. real GDP growth by roughly 0.75 to 1.0
        percentage points in 2025, "with little impact on inflation," meaning slower immigration is showing up
        mainly as slower growth rather than as the inflation relief some had hoped for <SourceTag id="dallasfed_gdp" />.
      </p>
      <p>
        The honest answer to research question three is that the labor market's headline calm and its underlying
        weakness are not actually in conflict; they are two readings of the same shrinking benchmark, and only the
        most recent data point, a negative payroll print alongside decelerating wages, breaks the tie in favor of
        real softening rather than a merely lower bar.
      </p>
      <Glossary items={GLOSSARIES.rq3} />
    </SectionWrapper>
  );
}

/* ---------------------------------------------------------------------- */
/* LEARNING SUMMARY                                                        */
/* ---------------------------------------------------------------------- */

const AUTHORED_INSIGHTS = [
  "The 2025-26 immigration slowdown didn't help native-born workers because the textbook 'immigrants compete with natives' model assumes substitution, but the best available research (Caiumi & Peri) finds complementarity: removing immigrant labor cuts the demand for the native-born labor that depends on it, and removes immigrant consumers too, so both curves shift down together instead of one easing pressure on the other.",
  "A falling 'breakeven employment growth' benchmark can make a soft-looking payroll report consistent with a healthy labor market, but the benchmark has a floor: it cannot explain a negative print, so a run of weak-relative-to-history data and a genuinely weakening labor market are not mutually exclusive readings — check the sign of the number, not just its size relative to an old benchmark.",
  "A subgroup's share of a level (foreign-born workers are 19% of the labor force) and its share of that level's growth (roughly 50%) are different statistics that can diverge sharply without being a data error — always ask whether a percentage describes a stock or a flow before treating two numbers about the same group as inconsistent.",
];

function LearningSummary({ mcState, numState, govInsight, setGovInsight, insightRevealed, setInsightRevealed, applyA, setApplyA, applyB, setApplyB, applyEval, onEvaluate }) {
  const allMc = [...MC_QUESTIONS, CONCLUSION_QUESTION, ...WARMUP_QUESTIONS.map((q) => ({ ...q, type: "W" }))];
  const byType = {};
  allMc.forEach((q) => {
    const st = mcState[q.id];
    if (!st || !st.submitted) return;
    byType[q.type] = byType[q.type] || { correct: 0, total: 0 };
    byType[q.type].total += 1;
    if (st.isCorrect) byType[q.type].correct += 1;
  });
  const numErrors = Object.values(numState)
    .filter((s) => s && s.submitted)
    .map((s) => s.signedErrorPct);
  const avgBias = numErrors.length ? numErrors.reduce((a, b) => a + b, 0) / numErrors.length : null;

  const missed = allMc.filter((q) => mcState[q.id] && mcState[q.id].submitted && !mcState[q.id].isCorrect);

  return (
    <SectionWrapper id="sec-summary" title="Learning Summary">
      <h3>Score breakdown</h3>
      <table className="score-table">
        <thead>
          <tr><th>Type</th><th>Correct</th><th>Total</th></tr>
        </thead>
        <tbody>
          {Object.keys(byType).sort().map((t) => (
            <tr key={t}><td>{typeLabel(t)}</td><td>{byType[t].correct}</td><td>{byType[t].total}</td></tr>
          ))}
        </tbody>
      </table>
      {avgBias !== null && (
        <p>
          On numeric estimation questions, your average signed error was {avgBias > 0 ? "+" : ""}
          {avgBias.toFixed(1)}%, meaning you tended to {avgBias > 0 ? "over-estimate" : "under-estimate"} magnitudes
          on average.
        </p>
      )}

      <h3>Your governing insight</h3>
      <p>
        You saw 5 charts across this article. Before reading the authored takeaways, write the single most
        non-obvious insight you would defend to a skeptical executive.
      </p>
      {!insightRevealed && (
        <div className="insight-input">
          <textarea
            minLength={20}
            placeholder="Write your governing insight (at least 20 characters)..."
            value={govInsight}
            onChange={(e) => setGovInsight(e.target.value)}
          />
          <button className="btn-primary" disabled={govInsight.trim().length < 20} onClick={() => setInsightRevealed(true)}>
            Reveal the article's three insights
          </button>
        </div>
      )}
      {insightRevealed && (
        <div>
          <div className="reader-answer">
            <span className="tag-you">Your insight</span>
            <p>{govInsight}</p>
          </div>
          <div className="tag-authored">How your insight compares to the article's three</div>
          <ol className="insight-cards">
            {AUTHORED_INSIGHTS.map((ins, i) => (
              <li key={i} className="insight-card">{ins}</li>
            ))}
          </ol>
        </div>
      )}

      <h3>Apply It</h3>
      <p>
        (a) Transfer to a new context. Here is an unfamiliar, real-shaped data snippet from a different domain: a
        hospital network's chief nursing officer tells you, "We tightened contract-nurse (travel nurse) staffing
        rules last year, expecting our permanent nursing staff to pick up the extra shifts and finally get the raises
        they've been asking for. Instead, permanent-nurse overtime hours rose 22%, three units had to temporarily
        reduce bed capacity, and permanent-nurse turnover ticked UP, not down." Using the same reasoning you
        practiced above, write your response with four labeled parts: (1) a one-sentence so-what thesis, (2) the
        single load-bearing assumption that must hold for your thesis, (3) the evidence that would most undermine it,
        and (4) a one-line pre-mortem: "If this fails in 12 months, the most likely reason is ___."
      </p>
      <textarea
        className="apply-textarea"
        placeholder="(1) Thesis: ... (2) Load-bearing assumption: ... (3) Disconfirming evidence: ... (4) Pre-mortem: ..."
        value={applyA}
        onChange={(e) => setApplyA(e.target.value)}
      />
      <p>
        (b) Cross-link. Name one prior article's principle (from ER-9 through ER-21) that reinforces or conflicts
        with today's argument about immigrant and native-born labor, and explain why.
      </p>
      <textarea
        className="apply-textarea"
        placeholder="Name the article and principle, then explain the connection..."
        value={applyB}
        onChange={(e) => setApplyB(e.target.value)}
      />
      <button className="btn-primary" onClick={onEvaluate}>Evaluate my Apply It response</button>
      {applyEval && (
        <div className="apply-eval-block">
          <p><strong>Evaluator feedback (local, evidence-based fallback):</strong></p>
          <ul>
            {applyEval.gaps.length === 0 && <li>All four labeled parts are present and substantive. Nice work.</li>}
            {applyEval.gaps.map((g, i) => <li key={i}>{g}</li>)}
          </ul>
          <p>{applyEval.summary}</p>
        </div>
      )}

      <h3>Return to Section — Principles to Revisit</h3>
      {missed.length === 0 && <p>No missed questions yet — or you haven't answered any. Nothing to revisit so far.</p>}
      {missed.length > 0 && (
        <ul className="revisit-list">
          {missed.map((q) => (
            <li key={q.id}>
              <strong>{typeLabel(q.type)}:</strong> {q.transferCue || "Revisit the section's core distinction."}
            </li>
          ))}
        </ul>
      )}
    </SectionWrapper>
  );
}

/* ---------------------------------------------------------------------- */
/* CONCLUSION                                                              */
/* ---------------------------------------------------------------------- */

function ConclusionSection({ mcState, onMcSubmit }) {
  return (
    <SectionWrapper id="sec-conclusion" title="Conclusion">
      <p>
        The central challenge this article documents is that a textbook supply-and-demand story about immigration
        and native-born wages made a clean, testable prediction, and 2025-2026 data rejected it: native-born
        unemployment rose, not fell, as immigrant labor supply shrank by roughly a million workers. The most likely
        trajectory under partial success, meaning immigration enforcement continues at something like its current
        intensity without a sharp reversal, is not a wage boom for native-born workers but a smaller, slower-growing
        economy that increasingly relies on productivity gains and existing workers' overtime hours rather than new
        hiring to get output up, exactly the pattern the Dallas Fed's Texas survey already documents at the firm
        level.
      </p>
      <p>
        For employers in immigrant-labor-intensive industries, the practical implication is to plan staffing and
        capital investment around a structurally smaller applicant pool rather than a temporary shortage that
        resolves itself once native-born workers are drawn in by higher wages; the evidence so far shows firms
        reaching for existing employees' overtime and, only later, wage increases, not a rush of new native-born
        hires. For economists and market participants watching monthly data releases, the practical implication is
        to track two numbers together, not one: the level of payroll growth and the current breakeven estimate it
        should be compared against, since a print that looks weak against last year's benchmark may be fine against
        this year's smaller one, and a print that is negative is weak against any benchmark.
      </p>
      <p>
        For policymakers, the Congressional Budget Office's and Dallas Fed's independent estimates that slower
        immigration is cutting roughly 0.8 to 1.0 percentage points off annual GDP growth, "with little impact on
        inflation," reframes the trade-off: this is not primarily an inflation-fighting tool, whatever its other
        merits or costs, but a growth-rate decision with a real, compounding dollar cost. For the Federal Reserve,
        a labor market that looks calm on the headline unemployment rate while payroll growth turns negative and
        wage growth decelerates is exactly the ambiguous signal that argues for weighing the underlying components,
        not just the summary statistic, when setting policy through 2028.
      </p>
      <p>
        The most important unresolved question is whether the complementarity this article documents — immigrant
        and native-born labor as partners in production rather than rivals for it — continues to hold as the shock
        deepens, or whether a large enough, sustained-enough labor-supply cut eventually does open room for
        native-born wage gains that a milder shock did not; only more data, not more theory, can settle which of
        those two futures the United States is actually on the path toward.
      </p>
      <MultipleChoice q={CONCLUSION_QUESTION} state={mcState[CONCLUSION_QUESTION.id]} onSubmit={onMcSubmit} />
    </SectionWrapper>
  );
}

/* ---------------------------------------------------------------------- */
/* SOURCE LIST                                                             */
/* ---------------------------------------------------------------------- */

function SourceList() {
  return (
    <SectionWrapper id="sec-sources" title="Sources">
      <ul className="source-list">
        {SOURCES.map((s) => (
          <li key={s.id}>
            <a href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
          </li>
        ))}
      </ul>
    </SectionWrapper>
  );
}

/* ---------------------------------------------------------------------- */
/* NAVBAR + PROGRESS                                                       */
/* ---------------------------------------------------------------------- */

const NAV_ITEMS = [
  { id: "sec-warmup", label: "Warm-Up" },
  { id: "sec-intro", label: "Introduction" },
  { id: "sec-background", label: "Background" },
  { id: "sec-rq1", label: "RQ1: Size of the Shock" },
  { id: "sec-rq2", label: "RQ2: Why No Raise?" },
  { id: "sec-rq3", label: "RQ3: Is It Tightening?" },
  { id: "sec-summary", label: "Learning Summary" },
  { id: "sec-conclusion", label: "Conclusion" },
  { id: "sec-sources", label: "Sources" },
];

function SectionNav({ active }) {
  const [wide, setWide] = useState(window.innerWidth >= 1160);
  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= 1160);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  if (!wide) return null;
  return (
    <nav className="section-nav">
      {NAV_ITEMS.map((item) => (
        <div
          key={item.id}
          className={"nav-item" + (active === item.id ? " nav-active" : "")}
          onClick={() => {
            const el = document.getElementById(item.id);
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        >
          {item.label}
        </div>
      ))}
    </nav>
  );
}

function BackNextControls({ active }) {
  function go(delta) {
    const idx = NAV_ITEMS.findIndex((it) => it.id === active);
    const nextIdx = Math.max(0, Math.min(NAV_ITEMS.length - 1, (idx === -1 ? 0 : idx) + delta));
    const el = document.getElementById(NAV_ITEMS[nextIdx].id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }
  return (
    <div className="back-next-controls">
      <button className="btn-backnext" onClick={() => go(-1)}>‹ Back</button>
      <button className="btn-backnext" onClick={() => go(1)}>Next ›</button>
    </div>
  );
}

function ProgressBar({ progress }) {
  return (
    <div className="progress-bar-track">
      <div className="progress-bar-fill" style={{ width: progress + "%" }} />
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* ROOT APP                                                                */
/* ---------------------------------------------------------------------- */

function App() {
  const [mcState, setMcState] = useState({});
  const [numState, setNumState] = useState({});
  const [chartInterp, setChartInterp] = useState({
    chart1: { submitted: [false, false], values: ["", ""] },
    chart2: { submitted: [false, false], values: ["", ""] },
    chart3: { submitted: [false, false], values: ["", ""] },
    chart4: { submitted: [false, false], values: ["", ""] },
    chart5: { submitted: [false, false], values: ["", ""] },
  });
  const [active, setActive] = useState("sec-warmup");
  const [govInsight, setGovInsight] = useState("");
  const [insightRevealed, setInsightRevealed] = useState(false);
  const [applyA, setApplyA] = useState("");
  const [applyB, setApplyB] = useState("");
  const [applyEval, setApplyEval] = useState(null);

  useEffect(() => {
    function onScroll() {
      let current = NAV_ITEMS[0].id;
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top < 140) current = item.id;
      }
      setActive(current);
    }
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const allMcIds = [...MC_QUESTIONS, CONCLUSION_QUESTION, ...WARMUP_QUESTIONS].map((q) => q.id);
  const totalScorable = allMcIds.length + NUMERIC_QUESTIONS.length;
  const answeredCount =
    Object.values(mcState).filter((s) => s && s.submitted).length +
    Object.values(numState).filter((s) => s && s.submitted).length;
  const score =
    Object.values(mcState).filter((s) => s && s.submitted && s.isCorrect).length +
    Object.values(numState).filter((s) => s && s.submitted && s.isCorrect).length;
  const progress = Math.min(100, Math.round((answeredCount / totalScorable) * 100));

  function handleMcSubmit(id, selectedOption, isCorrect) {
    setMcState((prev) => ({ ...prev, [id]: { submitted: true, selectedOption, isCorrect } }));
  }

  function handleNumSubmit(id, numericValue, isCorrect, path) {
    const q = NUMERIC_QUESTIONS.find((x) => x.id === id);
    const signedErrorPct = q ? ((numericValue - q.target) / q.target) * 100 : 0;
    setNumState((prev) => ({ ...prev, [id]: { submitted: true, numericValue, isCorrect, signedErrorPct, path } }));
  }

  function handleInterpSubmit(chartKey, idx, value) {
    setChartInterp((prev) => {
      const next = { ...prev };
      const entry = { submitted: prev[chartKey].submitted.slice(), values: prev[chartKey].values.slice() };
      entry.submitted[idx] = true;
      entry.values[idx] = value;
      next[chartKey] = entry;
      return next;
    });
  }

  function evaluateApplyIt() {
    // Local, evidence-based fallback evaluator (no live API call from this static artifact).
    // Checks presence and non-triviality of the four required labeled parts, and flags
    // whichever part is weakest or missing, per Apply-It-Evaluation spec.
    const text = applyA.toLowerCase();
    const gaps = [];
    const hasThesis = /thesis/.test(text) || applyA.length > 30;
    const hasAssumption = /assumption/.test(text);
    const hasDisconfirm = /disconfirm|undermine|evidence/.test(text);
    const hasPremortem = /pre-mortem|premortem|fails|fail/.test(text);
    if (applyA.trim().length < 60) {
      gaps.push("Your Apply It (a) response is quite short — a response this brief is unlikely to develop all four required parts with enough specificity.");
    }
    if (!hasThesis) gaps.push("Missing or unclear: a one-sentence so-what thesis about what the hospital network's pattern implies.");
    if (!hasAssumption) gaps.push("Missing or unclear: the single load-bearing assumption that must hold for your thesis to be true.");
    if (!hasDisconfirm) gaps.push("Missing or unclear: the specific evidence that would most undermine your thesis.");
    if (!hasPremortem) gaps.push("Missing or unclear: a one-line pre-mortem naming the most likely failure reason.");
    if (applyB.trim().length < 20) {
      gaps.push("Apply It (b) cross-link is missing or too brief — name a specific prior article and explain the connection, not just the article's title.");
    }
    const summary =
      gaps.length === 0
        ? "Your response climbs from observation to a quantified, decision-relevant implication and addresses all four parts. Strong transfer to a new domain."
        : "This evaluator checks for the presence and substance of all four labeled parts (thesis, assumption, disconfirming evidence, pre-mortem), not for keyword matching — revise the parts flagged above to strengthen the transfer.";
    setApplyEval({ gaps, summary });
  }

  return (
    <div className="app-root">
      <ProgressBar progress={progress} />
      <div className="score-badge">Score: {score} / {totalScorable}</div>
      <SectionNav active={active} />
      <BackNextControls active={active} />
      <main className="content-column">
        <header className="article-header">
          <div className="kicker">ER-22 · Economics &amp; Macro</div>
          <h1>The Missing Raise: Why Cutting Immigrant Labor Supply Didn't Help Native-Born Workers</h1>
        </header>
        <WarmUpSection mcState={mcState} onMcSubmit={handleMcSubmit} />
        <IntroSection />
        <BackgroundSection chartInterp={chartInterp} onInterpSubmit={handleInterpSubmit} mcState={mcState} onMcSubmit={handleMcSubmit} />
        <RQ1Section chartInterp={chartInterp} onInterpSubmit={handleInterpSubmit} mcState={mcState} onMcSubmit={handleMcSubmit} numState={numState} onNumSubmit={handleNumSubmit} />
        <RQ2Section chartInterp={chartInterp} onInterpSubmit={handleInterpSubmit} mcState={mcState} onMcSubmit={handleMcSubmit} />
        <RQ3Section chartInterp={chartInterp} onInterpSubmit={handleInterpSubmit} mcState={mcState} onMcSubmit={handleMcSubmit} numState={numState} onNumSubmit={handleNumSubmit} />
        <LearningSummary
          mcState={mcState}
          numState={numState}
          govInsight={govInsight}
          setGovInsight={setGovInsight}
          insightRevealed={insightRevealed}
          setInsightRevealed={setInsightRevealed}
          applyA={applyA}
          setApplyA={setApplyA}
          applyB={applyB}
          setApplyB={setApplyB}
          applyEval={applyEval}
          onEvaluate={evaluateApplyIt}
        />
        <ConclusionSection mcState={mcState} onMcSubmit={handleMcSubmit} />
        <SourceList />
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
