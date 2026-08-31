// ER-20: The Narrow Shock — What AI Has Actually Done to Entry-Level Jobs
// Interactive research article. React 18 + Recharts 2.12.7 (UMD). No build step.
// This file is a readable source copy; the deliverable is index.html (same code inlined).

const { useState, useEffect, useRef, useCallback } = React;
const {
  LineChart, Line, BarChart, Bar, ComposedChart, Scatter, ScatterChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ReferenceArea, Cell,
  LabelList, ResponsiveContainer,
} = Recharts;

/* ----------------------------------------------------------------------
   SOURCES
---------------------------------------------------------------------- */
const SOURCES = [
  { id: "stanfordcanaries", label: "Brynjolfsson, Chandar & Chen, \"Canaries in the Coal Mine? Six Facts about the Recent Employment Effects of Artificial Intelligence,\" Stanford Digital Economy Lab, revised Aug 12, 2026", url: "https://digitaleconomy.stanford.edu/publication/canaries-in-the-coal-mine-six-facts-about-the-recent-employment-effects-of-artificial-intelligence/" },
  { id: "stanfordinterest", label: "Brynjolfsson, Chandar & Chen, \"Canaries, Interest Rates, and Timing: More on the Recent Drivers of Employment Changes for Young Workers,\" Stanford Digital Economy Lab, Feb 9, 2026 (updated Jun 9, 2026)", url: "https://digitaleconomy.stanford.edu/news/canaries-interest-rates-and-timinga-more-on-recent-drivers-of-employment-changes-for-young-workers/" },
  { id: "adp2025", label: "Richardson, N., \"Yes, AI is affecting employment. Here's the data,\" ADP Research, Aug 26, 2025 (updated Oct 6, 2025)", url: "https://www.adpresearch.com/main-street-macro/yes-ai-is-affecting-employment-heres-the-data" },
  { id: "dallasfed2026", label: "Atkinson, T. & Yamco, S., \"Young workers' employment drops in occupations with high AI exposure,\" Federal Reserve Bank of Dallas, Jan 6, 2026", url: "https://www.dallasfed.org/research/economics/2026/0106" },
  { id: "nyfedgrad", label: "Federal Reserve Bank of New York, \"The Labor Market for Recent College Graduates,\" 2026:Q2 Quarterly Highlights", url: "https://www.newyorkfed.org/research/college-labor-market" },
  { id: "blsjul2026", label: "U.S. Bureau of Labor Statistics, \"The Employment Situation — July 2026,\" Aug 7, 2026", url: "https://www.bls.gov/news.release/empsit.nr0.htm" },
  { id: "blsnov2022", label: "U.S. Bureau of Labor Statistics, \"The Employment Situation — November 2022,\" Dec 2, 2022", url: "https://www.bls.gov/news.release/archives/empsit_12022022.pdf" },
  { id: "blsmlr2019", label: "Hipple et al., \"Not Fun for Young and Old Alike: How the Youngest and Oldest Consumers Have Fared in Recession and Recovery,\" BLS Monthly Labor Review, 2019", url: "https://www.bls.gov/opub/mlr/2019/article/not-fun-for-young-and-old-alike-how-the-youngest-and-oldest-consumers-have-fared-in-recession-and-recovery.htm" },
  { id: "challenger2025", label: "Challenger, Gray & Christmas, \"2025 Year-End Challenger Report: Highest Q4 Layoffs Since 2008; Lowest YTD Hiring Since 2010,\" Jan 8, 2026", url: "https://www.challengergray.com/blog/2025-year-end-challenger-report-highest-q4-layoffs-since-2008-lowest-ytd-hiring-since-2010/" },
  { id: "challenger2026jun", label: "Challenger, Gray & Christmas, \"Challenger Report: June Layoffs Cool to 45,849, Down 53% From May; AI Leads Reasons for Fourth Consecutive Month,\" Jul 1, 2026", url: "https://www.challengergray.com/blog/challenger-report-june-layoffs-cool-to-45849-down-53-from-may-ai-leads-reasons-for-fourth-consecutive-month/" },
  { id: "linkedinbeckers2026", label: "Kuchno, K., \"Entry-level hiring drops at top employers: LinkedIn,\" Becker's Hospital Review, May 11, 2026 (citing LinkedIn News, May 4 & Apr 15, 2026)", url: "https://www.beckershospitalreview.com/workforce/entry-level-hiring-drops-at-top-employers-linkedin/" },
  { id: "benioffsfben2024", label: "Martin, H., \"Salesforce Will Hire No More Software Engineers in 2025, Says Marc Benioff,\" Salesforce Ben, Dec 23, 2024", url: "https://www.salesforceben.com/salesforce-will-hire-no-more-software-engineers-in-2025-says-marc-benioff/" },
  { id: "fortuneapr2026", label: "Angelo, J., \"Salesforce CEO Marc Benioff says AI won't kill entry-level jobs. He's hiring 1,000 new grads to prove it,\" Fortune, Apr 27, 2026", url: "https://fortune.com/2026/04/27/salesforce-ceo-marc-benioff-hiring-1000-new-grads-ai-jobs/" },
];

function Cite({ id, children }) {
  const s = SOURCES.find((x) => x.id === id);
  if (!s) return <span>{children}</span>;
  return (
    <a className="cite" href={s.url} target="_blank" rel="noreferrer" title={s.label}>
      {children}
    </a>
  );
}

/* ----------------------------------------------------------------------
   PRIOR-ARTICLE PRINCIPLES (for warm-up, spaced retrieval)
---------------------------------------------------------------------- */
const PRIOR_PRINCIPLES = [
  { article: "ER-15, AI chip export controls (2026-08-03)", principle: "An intervention aimed at one goal can succeed completely on its own narrow terms while a related but distinct goal moves independently, or even backward — 'the policy worked' and 'the broader goal was achieved' are separate claims needing separate evidence." },
  { article: "ER-16, frequent-flyer currency (2026-08-05)", principle: "An appraisal performed under duress, by a party that also controls the supply and exchange rate of the thing being valued, is not the price an arm's-length buyer would pay." },
  { article: "ER-17, mortgage rate lock-in (2026-08-07)", principle: "A causal mechanism measured at less than half of an outcome is not evidence against a real, large effect — and the same headline design feature can produce opposite real-world consequences depending on a second, easy-to-overlook detail." },
];

/* ----------------------------------------------------------------------
   QUESTION BANK
---------------------------------------------------------------------- */
const QUESTIONS = [
  // ---------------- WARM-UP (Type B, transfer from prior articles) ----------------
  {
    id: "w1", section: "warmup", type: "B", kind: "mc",
    prompt: "A city bans one specific pesticide to protect its bee population. Two years later, officials announce the ban \"worked,\" because sales of that exact pesticide fell to zero. Applying the ER-15 principle (a policy can succeed completely on its own narrow terms while a related but distinct goal moves independently), what should you ask before agreeing the bees are actually better off?",
    options: [
      { text: "Nothing further — zero sales of the named pesticide is, by itself, sufficient proof the bees are better protected." },
      { text: "Whether overall pesticide exposure and measured bee-health outcomes actually improved — since farmers could have simply switched to an equally or more harmful substitute the ban didn't cover, meaning the narrow policy target was hit while the broader goal moved independently." },
      { text: "Whether the public supports the ban, since public opinion determines whether a policy \"worked.\"" },
      { text: "Whether enforcement of the ban was expensive, since cost is the only meaningful measure of policy success." },
    ],
    correct: 1,
    misconceptions: [
      "This treats hitting the narrow, named target (zero sales of one chemical) as proof the broader goal (bee health) was achieved — exactly the substitution the ER-15 principle warns against.",
      "",
      "This substitutes a popularity question for the actual outcome question the principle is testing.",
      "This substitutes a cost question for the actual outcome question; cost may matter separately, but it doesn't tell you whether bees are better off.",
    ],
    principle: "A policy can fully achieve its narrow, named target while the broader goal it was meant to serve moves independently, or backward, through substitution (ER-15).",
    transfer: "This generalizes to any 'ban the specific input' policy — antibiotics in livestock feed, a specific tax loophole, one banned chemical — where a close substitute the rule doesn't name can absorb the demand.",
  },
  {
    id: "w2", section: "warmup", type: "B", kind: "mc",
    prompt: "A gig-economy app awards workers \"loyalty points\" redeemable for bonus pay. During a funding crunch, the company's board tells lenders the points liability is really an asset, citing its full face-value redemption rate as the value of the program. Using the ER-16 principle, what is the single strongest reason a skeptical lender should distrust that valuation?",
    options: [
      { text: "The company controls both the supply of points and the exchange rate (how much cash a point buys), so it can unilaterally reprice the currency later — and this appraisal was produced under the pressure of needing to reassure lenders, not by an arm's-length buyer." },
      { text: "Workers might not enjoy the loyalty program, which would make it a bad idea regardless of its valuation." },
      { text: "The points might expire eventually, which is a minor administrative detail unrelated to the appraisal's credibility." },
      { text: "Competitor apps offer similar point programs, so this one is not unusual." },
    ],
    correct: 0,
    misconceptions: [
      "",
      "This raises a real but separate business question (worker satisfaction) instead of the specific valuation risk the principle is about.",
      "This treats a minor feature as the main issue, missing the load-bearing one: who controls the exchange rate.",
      "This confuses 'common practice' with 'not risky' — many companies could share the same repricing vulnerability at once.",
    ],
    principle: "When one party controls both the supply and the internal exchange rate of a points or token system, an appraisal made under duress is not an arm's-length price (ER-16).",
    transfer: "This generalizes to any closed-loop credits, gift cards, or in-app currency booked at face value or pledged as collateral.",
  },
  {
    id: "w3", section: "warmup", type: "B", kind: "mc",
    prompt: "A researcher finds a company's new four-day workweek explains 30% of its 2025 productivity gain. A skeptical VP says, \"30% is less than half, so the policy barely mattered.\" Using the ER-17 principle (a causal mechanism measured at less than half an outcome is not evidence against a real, large effect), what is wrong with the VP's reasoning?",
    options: [
      { text: "The VP is right — anything under 50% proves the other, unnamed factors were what really drove the result." },
      { text: "A causal contribution under 50% can still be a large, real, and decision-relevant driver; whether it is \"real and large\" depends on whether the identification strategy actually isolates the four-day-week effect from confounders, not on comparing the percentage to an arbitrary halfway mark." },
      { text: "Productivity cannot be measured precisely enough for any percentage breakdown to mean anything." },
      { text: "The VP is right, but only because 30% specifically rounds down to a fraction, not because of any general principle about halfway marks." },
    ],
    correct: 1,
    misconceptions: [
      "This is exactly the arbitrary-halfway-mark error the ER-17 principle warns against — a percentage below 50% is still evidence of a real, sizable effect if the estimate is well identified.",
      "",
      "This overcorrects into a nihilistic dismissal that ignores that productivity is routinely and usefully measured with stated uncertainty.",
      "This restates the same halfway-mark error while dressing it up as a rounding technicality.",
    ],
    principle: "A causal contribution measured below 50% of an outcome is not evidence the mechanism is small or unreal — check the identification strategy, not the size of the percentage relative to an arbitrary bar (ER-17).",
    transfer: "This generalizes to any 'X explains only N% of Y' claim in a business or policy debate — marketing attribution, drug efficacy, or a new tool's share of a productivity gain.",
  },

  // ---------------- BACKGROUND ----------------
  {
    id: "bg_d1", section: "background", type: "D", mode: "tight", kind: "numeric",
    prompt: "The Dallas Fed found that workers age 20 to 24 make up about 9% of the U.S. labor force, and that the employment share held by young workers in the \"most AI-exposed\" occupation tier fell by 0.9 percentage points (from 16.4% in November 2022 to 15.5% in September 2025). Using only those two figures, estimate the maximum plausible contribution (in percentage points) that this specific channel could make to the AGGREGATE national unemployment rate, if every one of those lost positions became recorded unemployment.",
    unit: "percentage points",
    target: 0.08,
    tolerancePct: 0.4,
    scaffold: "Multiply the group's share of the total labor force by the size of its own employment-share decline: (labor force share of the group) × (percentage-point decline in that group's employment share).",
    decomposition: "9% × 0.9 percentage points ≈ 0.08 percentage points, which the Dallas Fed rounds to about 0.1 point. Because the affected group (young, most-exposed workers) is a small slice of the total labor force, even a real and fully-realized decline within that slice barely moves the aggregate rate — the denominator does almost all the work here.",
    principle: "A large percentage change within a small subgroup translates into a tiny change in an aggregate that includes many other, unaffected people — always check the subgroup's share of the total before judging an aggregate's sensitivity to it.",
    transfer: "This generalizes to any 'why isn't this showing up in the national number' question: a real, concentrated effect in a 5-10% slice of a population will barely move a population-wide average.",
  },
  {
    id: "bg1", section: "background", type: "A", kind: "mc", chart: "bridge",
    prompt: "The bridge chart shows an upper-bound contribution of about 0.1 percentage point from the AI-exposed young-worker channel, out of a total 0.4-point rise in the national unemployment rate (3.7% in November 2022 to 4.1% in July 2026). What share of that total 0.4-point rise does the AI-exposed channel represent, and what does the remaining share imply about where the primary driver of today's softer job market actually is?",
    options: [
      { text: "About 100%, because the Dallas Fed explicitly attributes the entire rise in unemployment to AI-exposed young workers." },
      { text: "About 10%, because 0.1 points is always exactly 10% of any total, regardless of what that total is." },
      { text: "About 25% (0.1 ÷ 0.4); the other roughly 75% (0.3 points) must come from broader macro-economic or cyclical forces that have nothing specifically to do with this narrow, occupation-and-age-specific AI channel." },
      { text: "The share cannot be computed, because percentage points cannot be divided by other percentage points." },
    ],
    correct: 2,
    misconceptions: [
      "This misreads the Dallas Fed's own framing, which explicitly describes the AI channel's contribution as small and calls it a likely explanation for only a fraction of the increase, not the whole thing.",
      "This confuses the numeric VALUE of the numerator (0.1) with a percentage, ignoring the actual denominator (0.4) entirely.",
      "",
      "This treats percentage points as though they cannot be used in a ratio at all, when dividing one percentage-point quantity by another to get a share is a standard, valid operation.",
    ],
    principle: "When a decomposition attributes a small, bounded share of a total change to one specific channel, the residual is where the primary explanation must be sought — a narrow effect being real does not make it the dominant one.",
    transfer: "This generalizes to any 'contribution to the total' claim in economics: a named factor's explained share and the unexplained residual are equally important parts of the same finding.",
  },
  {
    id: "bg2", section: "background", type: "B", kind: "mc", chart: "slope",
    prompt: "Between late 2022 and mid-2025, employment for the youngest software developers and customer-service workers fell, while employment for workers 30 and older in that same high-AI-exposure occupation category rose. Why would the same broad occupation category show falling employment for the youngest workers and rising employment for older workers in the exact same window?",
    options: [
      { text: "The whole occupation category is shrinking, and the youngest workers are simply cut first, the way seniority-based layoffs usually work in any downturn." },
      { text: "Younger workers are, on average, less skilled than older workers, so employers naturally prefer older hires whenever budgets tighten." },
      { text: "Generative AI tools most easily substitute for the routine, learn-by-doing tasks that used to be assigned to junior employees, while the same tools make experienced workers' judgment-heavy work faster — raising the value of experience and lowering the value of an entry-level hire to the firm, even as the category's overall headcount is not shrinking." },
      { text: "This is ordinary seasonal hiring variation that happens to repeat every year regardless of any new technology." },
    ],
    correct: 2,
    misconceptions: [
      "This can't be a simple across-the-board downturn or seniority-based cut, because the data show the OLDER cohort's employment rising, not just falling less — a shrinking-category story predicts declines for everyone, not a sign flip by age within the same category.",
      "This invokes an unsupported stereotype about skill by age rather than engaging with the task-based mechanism the evidence actually points to.",
      "",
      "This is contradicted by the fact that the pattern lines up with the specific timing of generative AI's rollout and differs sharply between high- and low-AI-exposure occupations, which a repeating seasonal effect would not do.",
    ],
    principle: "When the same job category shows employment moving in opposite directions by age at the same time, look for a task-level mechanism (what each age group actually does day to day) rather than a category-wide demand story, which would move everyone the same direction.",
    transfer: "This generalizes to any 'automation' story: check whether the technology substitutes for a specific set of tasks (hurting whoever does mostly those tasks) rather than assuming it acts uniformly on an entire job title or industry.",
  },

  // ---------------- RQ1: HOW LARGE, AND COMPARED TO WHAT ----------------
  {
    id: "rq1a", section: "rq1", type: "B", kind: "mc", chart: "dotpanels",
    prompt: "Panel A reports the Great Recession's effect in PERCENTAGE POINTS of an unemployment RATE (2006–2010). Panel B reports the AI-era effect in PERCENT change of an employment LEVEL, within high-AI-exposure occupations (late 2022–mid-2025). Someone claims: \"The AI-era hit on young software developers (a 20% employment decline) is worse than the Great Recession's hit on young workers (a 7.9-point rise in unemployment), since 20 is bigger than 7.9.\" What is the strongest objection to that comparison?",
    options: [
      { text: "The comparison is invalid simply because 20 is a bigger number than 7.9, which never happens when a comparison is fair." },
      { text: "Software developers are not part of the labor force, so no comparison to a labor-force-wide statistic is possible." },
      { text: "There is no problem with the comparison; both numbers measure how much a group of young workers suffered, so they can be compared directly." },
      { text: "The comparison mixes two different kinds of measurement — a PERCENT change in an employment LEVEL is not the same unit as a PERCENTAGE-POINT change in an unemployment RATE — so their raw sizes cannot be stacked against each other without converting both to a common, comparable basis." },
    ],
    correct: 3,
    misconceptions: [
      "This treats the relative size of the two numbers as the flaw, when the actual flaw is a unit mismatch that exists regardless of which number happens to be larger.",
      "This is factually wrong — software developers are very much part of the labor force — and dodges the actual measurement issue.",
      "This is exactly the error the question is testing: treating a percent change in a level and a percentage-point change in a rate as interchangeable magnitudes.",
      "",
    ],
    principle: "A percent change in a LEVEL (like an employment count) and a percentage-point change in a RATE (like an unemployment rate) are different kinds of numbers; comparing their raw sizes without converting to a common basis is a percent-vs-percentage-point error.",
    transfer: "This generalizes to any headline that compares 'X fell 20%' to 'Y rose 8 points' as though the two numbers were on the same scale — always check whether one is a rate and the other is a level before comparing magnitudes.",
  },
  {
    id: "rq1b", section: "rq1", type: "B", kind: "mc",
    prompt: "Employment for the youngest workers in high-AI-exposure occupations fell at the same time employment for workers 30 and older, in the identical occupation category, rose. Which is the strongest reason NOT to conclude, from this correlation alone, that AI substitution caused the youngest workers' decline?",
    options: [
      { text: "Correlation always implies causation when the two series move in exactly opposite directions, so no further check is needed." },
      { text: "A plausible confounder exists: the same 2022–2023 window also saw a broad hiring correction after 2020–2021's over-hiring boom, and interest-rate changes that could independently affect entry-level hiring — which is exactly why the same research team published a follow-up specifically testing (and, on the interest-rate channel, ruling out) that alternative explanation before treating the pattern as AI-driven." },
      { text: "Older workers always outperform younger workers in any labor market, so this pattern would appear identically in any year regardless of AI." },
      { text: "The sample of software developers and customer-service workers is too small to draw any conclusion from." },
    ],
    correct: 1,
    misconceptions: [
      "This is the direct opposite of sound reasoning — correlation, even a striking opposite-direction one, never proves causation on its own.",
      "",
      "This treats a stereotype as a universal, timeless law, which is contradicted by the fact that the pattern specifically emerged and widened after late 2022, not in every year.",
      "This misapplies a general statistics worry to a dataset the underlying paper describes as drawing on tens of millions of payroll records, which is not a small-sample problem.",
    ],
    principle: "A striking correlation, even one with an intuitive causal story, requires ruling out plausible confounders (like a coincidentally timed macro shock) before treating it as evidence of the proposed causal mechanism.",
    transfer: "This generalizes to any 'two trends diverged right when a new technology launched' claim — always ask what else changed in that same window before crediting the technology.",
  },
  {
    id: "rq1c", section: "rq1", type: "C", kind: "mc",
    prompt: "Case Prompt: A congressional staffer drafting AI-labor legislation cites the aggregate 4.1% U.S. unemployment rate (barely changed since 2022) as proof AI has not caused meaningful labor-market harm. As the staffer's economic advisor, which assumption in that claim is weakest, and what evidence in this section is thinnest in supporting it?",
    options: [
      { text: "That the aggregate, economy-wide unemployment rate is a sensitive enough instrument to detect a real effect concentrated in a narrow slice of the population — but this section's own arithmetic shows a real, fully-realized decline within a 9%-of-the-labor-force group would move the aggregate rate by only about a tenth of a point, meaning the aggregate rate is the wrong tool to rule the effect in or out." },
      { text: "That the Bureau of Labor Statistics correctly measures the unemployment rate every month — but there is no reason in this section to doubt the agency's methodology." },
      { text: "That Congress has the constitutional authority to legislate on labor markets — but that is a legal question this section does not address." },
      { text: "That AI companies are honestly reporting their own productivity gains — but corporate self-reports are not the evidence this section relies on for its central claim." },
    ],
    correct: 0,
    misconceptions: [
      "",
      "This raises a generic measurement-integrity concern the section gives no reason to doubt, rather than engaging with the actual denominator problem the evidence highlights.",
      "This introduces an unrelated legal question that the labor-market evidence in this section has no bearing on.",
      "This targets a type of evidence (corporate self-reports) that is not what this section's central claim is built on.",
    ],
    principle: "An aggregate statistic that pools a large, unaffected majority with a small, affected minority can stay nearly flat even while the minority experiences a real, large effect — the aggregate's insensitivity is not evidence the effect doesn't exist.",
    transfer: "This generalizes to any 'the national average looks fine, so there's no problem' argument — check the size of the affected subgroup relative to the total before trusting the aggregate.",
  },

  // ---------------- RQ2: WHY THIS MECHANISM, WHY THIS SIZE ----------------
  {
    id: "rq2a", section: "rq2", type: "A", kind: "mc", chart: "dumbbell",
    prompt: "Among LinkedIn's list of top U.S. employers for career growth, the entry-level share of hires fell from 40.3% in 2016 to 37.2% in 2025, while the median employee's experience level rose from about 6 years to about 8.5 years over the same period. Express the experience-level change as a relative percentage increase (not just a difference in years), and explain what computing it that way — rather than just the point difference — adds to the entry-level-share finding.", options: [
      { text: "About a 42% relative increase (2.5 additional years ÷ 6 original years); expressing it this way shows the shift in typical tenure is not a marginal drift but a large proportional change, reinforcing that the 3.1-point drop in entry-level hiring share reflects a real structural re-weighting toward experience, not noise." },
      { text: "About a 2.5% increase, since the change was 2.5 years and percentages are always read directly off the units given." },
      { text: "About a 6% increase, matching the original base value used as if it were the answer itself." },
      { text: "The relative percentage cannot be computed because years and percentage points are incompatible units." },
    ],
    correct: 0,
    misconceptions: [
      "",
      "This treats the raw unit (2.5 years) as if it were already a percentage, skipping the actual relative-change calculation entirely.",
      "This confuses the original base value (6 years) with the computed percentage change.",
      "This mistakes a units difference (years vs. percentage points) for genuine incompatibility — a relative percentage change can always be computed from two values in the same unit (years to years), which is exactly what this question does.",
    ],
    principle: "A raw point difference and its relative percentage change tell different stories about size — computing both lets you judge whether a shift is proportionally large even when the absolute numbers look modest.",
    transfer: "This generalizes to comparing any two 'typical value' metrics over time — median tenure, median age, median price — where the relative change matters as much as the raw difference.",
  },
  {
    id: "rq2b", section: "rq2", type: "B", kind: "mc",
    prompt: "The underlying Stanford research distinguishes AI uses that mainly substitute for a task (automating it) from AI uses that mainly help a person do a task faster (augmenting them), and finds employment declines concentrate in the first group while the second group's employment is flat or rising, especially for experienced workers. Why does this automate-versus-augment distinction matter more than simply asking whether a job \"uses AI\"?", options: [
      { text: "The distinction doesn't matter, because any occupation that uses AI in any way will eventually see falling entry-level employment regardless of how the tool is used." },
      { text: "The distinction only matters for white-collar jobs and has no relevance to service occupations like customer support." },
      { text: "The distinction is purely theoretical and has not been tested against any real employment data." },
      { text: "\"Uses AI\" is too coarse a category, because two occupations can both score high on a generic AI-exposure measure while AI actually replaces the core task in one and merely speeds up a human's judgment in the other — so exposure alone doesn't tell you which direction employment should move, but the automate/augment split does." },
    ],
    correct: 3,
    misconceptions: [
      "This asserts a uniform, deterministic outcome the article's own evidence contradicts, since augmenting-use occupations show flat or rising employment.",
      "This arbitrarily narrows the finding's scope; the underlying research applies the same automate/augment framework across white-collar and service occupations alike, including customer support.",
      "This is factually wrong — the distinction is precisely what the underlying payroll-data analysis tests and finds support for.",
      "",
    ],
    principle: "A single 'exposure' score can group together occupations where AI is doing opposite things — substituting for a task versus assisting a person doing it — so the right level of analysis is what the tool actually replaces, not just whether the tool is present.",
    transfer: "This generalizes to any technology-adoption story: 'the industry uses robots/software/AI' is too coarse to predict who wins or loses; ask whether the tool replaces a task or extends a person's capacity on it.",
  },
  {
    id: "rq2c", section: "rq2", type: "D", mode: "fermi", kind: "numeric",
    prompt: "Order-of-magnitude estimate, with no scaffold supplied: roughly how many U.S. workers aged 22 to 25 currently work in an occupation classified in the \"most AI-exposed\" tier? Name your own decomposition path before entering a number.",
    unit: "workers",
    target: 5000000,
    logTolerance: true,
    scaffold: "This is a genuine Fermi estimate: state your own decomposition (for example, total labor force size × the age group's share of it × that age group's share working in the most-exposed tier) before entering a number. There is no single input the article hands you directly.",
    decomposition: "U.S. civilian labor force ≈ 168 million (derived from July 2026's 4.1% unemployment rate and 6.9 million unemployed people: 6.9M ÷ 0.041 ≈ 168M). Workers age 20–24 are about 9% of that labor force (Dallas Fed, 2026), giving roughly 15 million young workers. The Dallas Fed's own tertile method splits occupations into three roughly equal employment-weighted groups (least, moderate, most exposed), so about one-third of those young workers, or roughly 5 million, plausibly sit in the most-exposed tier. This chain (labor force size × age share × exposure-tier share) is scored on log-distance: an answer within a factor of 2 of 5 million (roughly 2.5 million to 10 million) counts as correct, because the exposure-tier share for this specific age group is an assumption, not a measured figure.",
    principle: "A Fermi estimate multiplies a known total population by successive, stated share assumptions, and is judged on order of magnitude, not on precision.",
    transfer: "This generalizes to any 'how many people are affected' estimate where the total population is known but the affected share must be assumed from a related, published breakdown — market-sizing, disease-prevalence, or exposure estimates.",
  },

  // ---------------- RQ3: WHAT SHOULD DECISION-MAKERS DO ----------------
  {
    id: "rq3a", section: "rq3", type: "A", kind: "mc", chart: "bullet",
    prompt: "Recent college graduates' unemployment rate (5.6%, ages 22–27 with a bachelor's degree, Q2 2026) compares to the national unemployment rate (4.1%, July 2026). Express the gap as a MULTIPLE (a ratio), not just a percentage-point difference, and say what a parent telling a new graduate \"don't worry, unemployment is only 4.1%\" is missing.",
    options: [
      { text: "About 1.5 percentage points higher, which is the same thing as saying recent grads are 1.5 times more likely to be unemployed." },
      { text: "About 37 percentage points higher, since a ratio of 1.37 converts directly into percentage points without any further calculation." },
      { text: "About 1.37 times the national rate (5.6 ÷ 4.1); a new graduate should benchmark against the recent-grad series, not the blended national number, which averages in every age and experience level and therefore understates what a new entrant to the labor market is actually facing." },
      { text: "The two rates cannot be meaningfully compared because they come from different data sources (a Federal Reserve Bank versus the Bureau of Labor Statistics)." },
    ],
    correct: 2,
    misconceptions: [
      "This conflates a percentage-POINT difference (1.5 points) with a MULTIPLE (1.37x) — these describe the same gap in two different, non-interchangeable ways.",
      "This treats a ratio (1.37) as if it were already expressed in percentage points, inflating the true gap by roughly 27-fold.",
      "",
      "This overstates a real methodological difference; both series measure unemployment via the same underlying Current Population Survey concepts and are routinely compared, including in this article.",
    ],
    principle: "A gap between two rates can be expressed as a percentage-point difference or as a ratio (multiple), and these give very different-sounding numbers for the exact same underlying gap — always specify which one you mean.",
    transfer: "This generalizes to any 'group X's rate is higher than the national rate' claim — a mortgage-default rate, a disease incidence rate, a graduation rate — where the ratio and the point-difference tell different-sounding stories about the same gap.",
  },
  {
    id: "rq3b", section: "rq3", type: "C", kind: "mc",
    prompt: "Case Prompt: You are the new Chief People Officer at Meridian Software, a mid-sized enterprise software firm. Your CEO read that Salesforce initially froze all 2025 engineering new-grad hiring after citing a 30% AI productivity gain, while IBM's CEO announced the opposite bet in February 2026 — tripling entry-level hiring, arguing companies that keep investing in junior talent will out-compete rivals within three to five years. Which assumption must hold for the \"freeze junior hiring, ride the AI productivity gain\" strategy to actually pay off over five years, and what evidence in this article is thinnest in supporting it?", options: [
      { text: "That Meridian's engineers will approve of the hiring freeze, but employee sentiment is not addressed anywhere in this article." },
      { text: "That Salesforce's stock price will keep rising, which has no direct bearing on Meridian's own hiring strategy." },
      { text: "That the freeze will save money in the short term — but nothing in this article suggests short-run cost savings from a hiring freeze are in doubt." },
      { text: "That AI's current productivity gains for senior workers (an augmenting use) will keep advancing until it can also fully automate the judgment-heavy work senior employees do today — but this article's own evidence shows today's declines are concentrated where AI substitutes for junior, routine tasks, with no evidence yet that the augmenting benefit senior workers enjoy is itself being automated away; a freeze bets on a further leap the current data doesn't demonstrate." },
    ],
    correct: 3,
    misconceptions: [
      "This raises a plausible internal-morale question the article doesn't speak to, rather than the load-bearing external assumption the evidence directly bears on.",
      "This introduces an unrelated financial-market detail that has no logical connection to Meridian's own staffing decision.",
      "This is close to backwards: the article does not dispute that a freeze saves money now — the open question is whether that short-run saving still pays off once the firm needs experienced staff it never trained five years later.",
      "",
    ],
    principle: "A strategy justified by today's technology capability implicitly assumes that capability keeps advancing in the same direction — the weakest link is often the unstated bet on a further leap the current evidence does not yet show.",
    transfer: "This generalizes to any 'automate now, in anticipation of the technology getting even better' decision — self-driving-fleet investment, robotic warehouse staffing, or any capital plan that bets on a capability curve continuing past today's demonstrated point.",
  },

  // ---------------- CONCLUSION ----------------
  {
    id: "concl", section: "conclusion", type: "E", kind: "mc",
    prompt: "Given everything in this article, which real-world action is most directly supported, and which risk would most threaten it?",
    options: [
      { text: "New graduates should abandon software development and customer service entirely and retrain into any occupation with a lower AI-exposure score, regardless of pay or personal fit." },
      { text: "Employers, new graduates, and policymakers should treat entry-level hiring in the most AI-exposed, task-automating occupations as a genuinely elevated risk today — favoring roles and firms (like IBM's stated bet) that pair junior hires with structured training rather than freezing the pipeline outright — but the biggest risk to this recommendation is that it could overcorrect into hiring freezes that hollow out the next generation of experienced workers a firm will need in five years. This thesis would be most weakened, and should be revisited, if next year's data show experienced workers in the SAME high-exposure occupations also starting to lose ground — since that would mean the automate/augment line this whole argument rests on has moved, and the 'canary' pattern has spread beyond entry-level workers." },
      { text: "Because the aggregate unemployment rate is barely affected, no one should change any hiring, career, or policy decision at all until the national rate itself moves noticeably." },
      { text: "Congress should immediately ban employers from using AI tools in any hiring or workforce-planning decision, regardless of cost or feasibility." },
    ],
    correct: 1,
    misconceptions: [
      "This overreacts to a concentrated, occupation-specific signal by prescribing a blanket, one-size-fits-all retreat that the evidence doesn't support for every AI-exposed field (health aides, a low-exposure occupation, saw broad-based growth, while some high-exposure fields still show employers like IBM betting the other way).",
      "",
      "This is the aggregation error RQ1 explicitly warns against — waiting for a nearly-flat national average to move ignores that a real, concentrated effect can sit inside an aggregate for years without moving it much.",
      "This is an extreme, infeasible overcorrection not supported by any risk-benefit weighing in this article, which documents both costs and productivity benefits from these tools.",
    ],
    principle: "A recommendation is only as strong as its stated risk and the specific observation that would falsify it — here, the automate/augment boundary holding for experienced workers is the load-bearing assumption to keep watching.",
    transfer: "This generalizes to any 'the disruption is narrow so far' thesis in a fast-moving technology story — always name the boundary condition whose failure would be the first sign the disruption is spreading.",
  },
];

/* ----------------------------------------------------------------------
   CHART INTERPRETATION PROMPTS (open text, production before consumption)
---------------------------------------------------------------------- */
const CHART_INTERPS = {
  bridge: {
    title: "Decomposing the change in the U.S. unemployment rate, Nov 2022 → Jul 2026",
    prompts: [
      { kind: "quant-predict", label: "Before reading further: predict — roughly what share of the total 0.4-point rise in the national unemployment rate do you think the entire AI-exposed young-worker channel could plausibly explain?",
        authored: "At most about 25% (0.1 of the 0.4-point total), and that is a generous upper bound, not a measured contribution — the Dallas Fed frames it as what the channel would add if every affected job loss became recorded unemployment, which almost certainly overstates the real pass-through." },
      { kind: "so-what", label: "So what — what should a journalist or policymaker do differently before citing the national unemployment rate as evidence about AI's labor-market impact?",
        authored: "Stop using the topline unemployment rate as the test instrument for this question entirely; it is engineered to average across 168 million workers, so a real, concentrated effect in a 9%-of-labor-force group will barely register. Use occupation-by-age microdata (like ADP payroll records or the Current Population Survey cut by age and exposure tier) instead." },
    ],
  },
  slope: {
    title: "Employment index by age cohort, within high-AI-exposure occupations (Nov 2022 = 100)",
    prompts: [
      { kind: "quant", label: "Compute the total spread, in index points, between the youngest software developers' change and the 30-plus cohort's change (using the low end of its stated range) in the same high-exposure category. What does that spread imply about whether this is a broad slowdown or a targeted substitution?",
        authored: "80 versus at least 106 is a spread of at least 26 index points. Because the older cohort in the SAME exposure category is still growing, not just declining less, this is not a broad, category-wide hiring slowdown — it is a targeted substitution concentrated in the youngest, most task-substitutable workers." },
      { kind: "mechanism", label: "Why might software developers (−20%) fall further than customer-service representatives (−11%) over the same period, if both occupations sit in the \"most AI-exposed\" tier?",
        authored: "Being in the same broad exposure tier does not mean the AI tools used in each occupation displace an identical share of entry-level tasks; coding assistants may substitute for more of what a junior developer does (writing first-draft code, debugging routine errors) than current AI tools substitute for what a junior customer-service rep does, some of which still requires live, unscripted human judgment." },
    ],
  },
  dotpanels: {
    title: "Two downturns compared, by age — different units, on purpose",
    prompts: [
      { kind: "causal", label: "Even setting the units mismatch aside, name one structural reason the Great Recession's youth shock and today's AI-era pattern would spread through the labor market differently.",
        authored: "The Great Recession was a broad, demand-side collapse that raised unemployment for every age group at once (even workers 75 and older rose 3.1 points) — a demand shock hits nearly everyone in the same direction. Today's pattern is occupation-specific and, unusually, opposite-signed by age within the identical occupation (younger workers down, older workers up) — a broad demand shock cannot produce opposite signs inside the same job category, which itself points toward a task-substitution mechanism rather than a cyclical downturn." },
      { kind: "so-what", label: "So what should a labor economist tell a reporter who wants a single headline number comparing \"how bad\" these two shocks are?",
        authored: "Refuse to give one. The two panels measure different things (a rate's percentage-point change versus a level's percent change) over different-length windows and different populations — collapsing them into one comparable number would manufacture false precision, not real insight." },
    ],
  },
  dumbbell: {
    title: "Entry-level hire share and median employee experience, LinkedIn's Top U.S. Employers, 2016 vs. 2025",
    prompts: [
      { kind: "quant", label: "Compute the percentage-point change in entry-level hire share (2016 to 2025). Is that a large or small structural shift for a hiring pipeline built over almost a decade?",
        authored: "A 3.1-point drop (40.3% to 37.2%) sounds modest in isolation, but paired with median tenure rising from about 6 to about 8.5 years at the same firms, it describes a systematic re-weighting of who gets hired, sustained over nine years at companies considered the best employers for career growth — a slow but real structural shift, not noise." },
      { kind: "so-what", label: "So what should a university career-services office do differently in light of this trend at elite employers specifically?",
        authored: "Stop assuming the most prestigious employers are automatically the most reliable entry-level pipeline; some of the same firms rated best for long-term career growth are precisely the ones re-weighting their hiring mix toward experience, meaning students may need to look further down the brand-name list, or toward employers like IBM that are explicitly betting the other way, for a true first job." },
    ],
  },
  bullet: {
    title: "Recent college graduates vs. the national labor market, Q2 2026",
    prompts: [
      { kind: "quant-predict", label: "Before reading further: predict — do you think the underemployment rate for recent college graduates (working in jobs that typically don't require a degree) is closer to 15%, 25%, or over 40%?",
        authored: "Over 40% — specifically about 42% in the second quarter of 2026. Underemployment is a much larger, and often overlooked, problem than the unemployment rate alone suggests, since someone working an underemployed job is still counted as \"employed\" in the headline statistic." },
      { kind: "mechanism", label: "Why might the unemployment-rate gap (5.6% vs. 4.1%, a 1.37x multiple) understate how much harder the entry-level market is right now, relative to the underemployment figure?",
        authored: "The unemployment rate only counts people with no job at all; it says nothing about graduates who found a job but not one that uses their degree. A 42% underemployment rate means a large share of employed graduates are absorbing the AI-era hiring squeeze quietly, by taking a lesser job rather than showing up in the unemployment count at all." },
    ],
  },
};

/* ----------------------------------------------------------------------
   GLOSSARY PER PAGE
---------------------------------------------------------------------- */
const GLOSSARY = {
  intro: [
    { term: "Generative AI", def: "AI tools, like chatbots and coding assistants, that can produce new text, code, or images rather than just analyzing existing data." },
    { term: "Entry-level worker", def: "someone in the first few years of their career, typically hired right out of school with little prior work experience." },
    { term: "ADP payroll data", def: "real-time employment records from ADP, the largest U.S. payroll-processing company, covering millions of actual paychecks rather than a survey." },
    { term: "Unemployment rate", def: "the share of people actively looking for work who don't have a job, out of everyone working or looking for work." },
  ],
  background: [
    { term: "AI exposure score", def: "a measure of how much of an occupation's day-to-day tasks could plausibly be done or assisted by current AI tools." },
    { term: "Underemployment rate", def: "the share of college graduates working in jobs that typically don't require a college degree." },
    { term: "Index (rebased to 100)", def: "a way of showing change over time where the starting value is set to 100, so later values show percent change directly." },
    { term: "Percentage point (pp)", def: "the plain difference between two percentages, as opposed to a percent change relative to the starting value." },
  ],
  rq1: [
    { term: "Confounder", def: "a separate factor that changes at the same time as the thing you're studying, making it look like a cause when it might not be." },
    { term: "Firm-time fixed effects", def: "a statistical technique that adjusts for each company's own overall hiring ups and downs over time, isolating the effect being studied from broader company-level trends." },
    { term: "Counterfactual", def: "an estimate of what would have happened without the change being studied, used as the baseline for measuring an effect." },
  ],
  rq2: [
    { term: "Task automation", def: "using a tool to fully perform a task that a person used to do, replacing that part of their job." },
    { term: "Task augmentation", def: "using a tool to help a person do a task faster or better, without replacing the person doing it." },
    { term: "Tertile", def: "one of three equal-sized groups formed by splitting a ranked list into thirds." },
    { term: "Fermi estimate", def: "a rough, order-of-magnitude calculation built by multiplying a few known or assumed quantities together, used when exact data isn't available." },
  ],
  rq3: [
    { term: "Attrition", def: "employees leaving a company on their own or through layoffs, as opposed to being newly hired." },
    { term: "Reskilling", def: "training existing workers in new skills so they can move into different roles as job requirements change." },
  ],
};

/* ----------------------------------------------------------------------
   CHART DATA
---------------------------------------------------------------------- */
const BRIDGE_DATA = [
  { name: "Nov 2022 U.S. rate", base: 0, delta: 3.7, kind: "total", display: "3.7%" },
  { name: "AI-exposed young-worker channel (upper bound)", base: 3.7, delta: 0.1, kind: "small", display: "+0.1pp" },
  { name: "All other factors (residual)", base: 3.8, delta: 0.3, kind: "other", display: "+0.3pp" },
  { name: "Jul 2026 U.S. rate", base: 0, delta: 4.1, kind: "total", display: "4.1%" },
];

const SLOPE_DATA = [
  { period: "Nov 2022", SoftwareDevYoung: 100, CustServiceYoung: 100, OlderAllExposed: 100 },
  { period: "Jul 2025", SoftwareDevYoung: 80, CustServiceYoung: 89, OlderAllExposed: 109.5 },
];

const GR_PANEL = [
  { name: "Under 25", change: 7.9 },
  { name: "25–74", change: 4.7 },
  { name: "75 and older", change: 3.1 },
];
const AI_PANEL = [
  { name: "Ages 22–25", change: -6 },
  { name: "Ages 30+", change: 9.5 },
];

const DUMBBELL_DATA = [
  { name: "Entry-level hire share", before: 40.3, after: 37.2, unit: "%" },
  { name: "Median employee experience", before: 6, after: 8.5, unit: " yrs" },
].map((d) => ({ ...d, base: Math.min(d.before, d.after), delta: Math.abs(d.after - d.before) }));

const BULLET_DATA = [
  { name: "Recent-grad unemployment rate", value: 5.6, benchmark: 4.1, max: 8, unit: "%" },
  { name: "Recent-grad underemployment rate", value: 42, benchmark: null, max: 60, unit: "%" },
];

const COLORS = { accent: "#0f5c8c", accentLight: "#a8c9dd", danger: "#b3382c", dangerLight: "#e3a79c", success: "#2f7a4f", neutral: "#c9c4bb", ink: "#111111", gold: "#b06a1a" };

/* ----------------------------------------------------------------------
   SMALL UI PRIMITIVES
---------------------------------------------------------------------- */
function Tag({ tier }) {
  return <span className={"tag tier-" + tier.toLowerCase()}>{tier}</span>;
}

function GlossaryPanel({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="glossary">
      <div className="glossary-label">Glossary</div>
      <ul>
        {items.map((g) => (
          <li key={g.term}><strong>{g.term}</strong> — {g.def}</li>
        ))}
      </ul>
    </div>
  );
}

function ChartFrame({ id, note, children }) {
  const meta = CHART_INTERPS[id];
  return (
    <div className="chart-frame">
      <div className="chart-title">{meta.title}</div>
      <ResponsiveContainer width="100%" height={320}>
        {children}
      </ResponsiveContainer>
      {note && <div className="chart-note">{note}</div>}
    </div>
  );
}

function ChartInterpretation({ chartId, interp, onSubmit }) {
  const meta = CHART_INTERPS[chartId];
  const isSubmitted = interp.submitted;
  const readerText = interp.text;
  const [drafts, setDrafts] = useState(["", ""]);
  return (
    <div className="interp-block">
      {meta.prompts.map((p, i) => (
        <div className="interp-row" key={i}>
          <div className="interp-kind">{p.kind}</div>
          <div className="interp-label">{p.label}</div>
          {!isSubmitted[i] ? (
            <div className="interp-input-row">
              <textarea
                rows={2}
                placeholder="Write at least a sentence before the authored answer appears..."
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
                onClick={() => onSubmit(chartId, i, drafts[i])}
              >
                Submit
              </button>
            </div>
          ) : (
            <div className="interp-compare">
              <div className="reader-answer"><span className="micro-label">Your answer</span>{readerText[i]}</div>
              <div className="authored-answer"><span className="micro-label">Compare your answer to the authored one</span>{p.authored}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function OptionCard({ text, state, index, disabled, onClick }) {
  let cls = "option-card";
  if (state.submitted) {
    if (index === state.correctIndex) cls += " correct";
    else if (index === state.selectedOption) cls += " wrong";
  } else if (state.selectedOption === index) {
    cls += " selected";
  }
  return (
    <div className={cls} onClick={() => !state.submitted && !disabled && onClick(index)}>
      <span className="option-letter">{String.fromCharCode(65 + index)}</span>
      <span>{text}</span>
    </div>
  );
}

function MCQuestionCard({ q, state, onSelect, onSubmit }) {
  const isCase = q.type === "C";
  return (
    <div className={"question-card" + (isCase ? " case" : "")}>
      {isCase && <div className="case-label">Case Prompt</div>}
      <div className="q-type-badge">Type {q.type}</div>
      <div className="q-prompt">{q.prompt}</div>
      <div className="options">
        {q.options.map((o, i) => (
          <OptionCard
            key={i}
            text={o.text}
            index={i}
            state={{ ...state, correctIndex: q.correct }}
            onClick={(idx) => onSelect(q.id, idx)}
          />
        ))}
      </div>
      {!state.submitted && (
        <button className="btn-primary" disabled={state.selectedOption == null} onClick={() => onSubmit(q.id)}>
          Submit
        </button>
      )}
      {state.submitted && (
        <div className="explanation">
          <div className={"calibration " + (state.isCorrect ? "right" : "wrong")}>
            {state.isCorrect
              ? "Correct — this reasoning generalizes: " + q.transfer
              : "Incorrect — " + q.misconceptions[state.selectedOption]}
          </div>
          <div className="principle-line"><strong>Principle:</strong> {q.principle}</div>
          {!state.isCorrect && <div className="principle-line"><strong>Where this generalizes:</strong> {q.transfer}</div>}
        </div>
      )}
    </div>
  );
}

function NumericQuestionCard({ q, state, onSubmit }) {
  const [val, setVal] = useState(state.numericValue != null ? state.numericValue : "");
  const range = q.mode === "fermi" ? [q.target / 8, q.target * 8] : [q.target * 0.2, q.target * 2];
  return (
    <div className="question-card numeric">
      <div className="q-type-badge">Type D — {q.mode === "fermi" ? "Fermi estimate" : "Numeric"}</div>
      <div className="q-prompt">{q.prompt}</div>
      {!state.submitted ? (
        <div className="numeric-input-row">
          <input
            type="range"
            min={range[0]}
            max={range[1]}
            value={val || range[0]}
            onChange={(e) => setVal(Number(e.target.value))}
          />
          <input
            type="number"
            placeholder={"Your estimate (" + q.unit + ")"}
            value={val}
            onChange={(e) => setVal(e.target.value === "" ? "" : Number(e.target.value))}
          />
          <button className="btn-primary" disabled={val === "" || val == null} onClick={() => onSubmit(q.id, Number(val))}>
            Submit
          </button>
        </div>
      ) : (
        <div className="explanation">
          <div className="numeric-compare">
            <div>Your estimate: <strong>{Number(state.numericValue).toLocaleString()}</strong> {q.unit}</div>
            <div>Actual / central estimate: <strong>{q.target.toLocaleString()}</strong> {q.unit}</div>
            <div className={"calibration " + (state.isCorrect ? "right" : "wrong")}>
              {state.isCorrect ? "Within tolerance — correct." : "Outside tolerance — see the decomposition below."}
            </div>
          </div>
          <div className="how-to-estimate">
            <div className="micro-label">How to estimate this</div>
            <div>{q.scaffold}</div>
            <div className="decomposition">{q.decomposition}</div>
          </div>
          <div className="principle-line"><strong>Principle:</strong> {q.principle}</div>
          <div className="principle-line"><strong>Where this generalizes:</strong> {q.transfer}</div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------
   CHART COMPONENTS
---------------------------------------------------------------------- */
function BridgeChart() {
  const colorFor = (kind) => ({ total: COLORS.ink, small: COLORS.gold, other: COLORS.neutral }[kind]);
  return (
    <ChartFrame id="bridge" note={<span><Tag tier="FACT" /> Start/end national rates: BLS, Nov 2022 and Jul 2026. <Tag tier="ESTIMATE" /> The +0.1pp segment is the Dallas Fed's own upper-bound back-of-envelope figure; the +0.3pp residual is the remainder (0.4 minus 0.1), computed here, not separately reported.</span>}>
      <BarChart data={BRIDGE_DATA} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={90} fontSize={11} />
        <YAxis label={{ value: "Unemployment rate (%)", angle: -90, position: "insideLeft", fontSize: 12 }} domain={[0, 4.5]} />
        <Tooltip formatter={(v, n, p) => p.payload.display} />
        <Bar dataKey="base" stackId="a" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="delta" stackId="a" isAnimationActive={false}>
          {BRIDGE_DATA.map((d, i) => <Cell key={i} fill={colorFor(d.kind)} />)}
          <LabelList dataKey="display" position="top" />
        </Bar>
      </BarChart>
    </ChartFrame>
  );
}

function SlopeChart() {
  return (
    <ChartFrame id="slope" note={<span><Tag tier="FACT" /> Software developers and customer-service reps, youngest cohort: ADP Research, 2025 (citing Stanford Digital Economy Lab). "Ages 30+, all high-exposure occupations" is a broader category benchmark (reported range +6% to +13%; plotted at its midpoint, 109.5), a different scope than the two named occupations — shown for comparison, not identical scope.</span>}>
      <LineChart data={SLOPE_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="period" />
        <YAxis label={{ value: "Index (Nov 2022 = 100)", angle: -90, position: "insideLeft", fontSize: 12 }} domain={[70, 120]} />
        <Tooltip />
        <ReferenceLine y={100} stroke="#999" strokeDasharray="4 4" />
        <Legend />
        <Line type="monotone" dataKey="SoftwareDevYoung" name="Software developers, ages 22–25" stroke={COLORS.danger} strokeWidth={3} dot={{ r: 5 }} isAnimationActive={false}>
          <LabelList dataKey="SoftwareDevYoung" position="top" />
        </Line>
        <Line type="monotone" dataKey="CustServiceYoung" name="Customer-service reps, ages 22–25" stroke={COLORS.gold} strokeWidth={3} dot={{ r: 5 }} isAnimationActive={false}>
          <LabelList dataKey="CustServiceYoung" position="bottom" />
        </Line>
        <Line type="monotone" dataKey="OlderAllExposed" name="Ages 30+, all high-exposure occupations" stroke={COLORS.success} strokeWidth={3} dot={{ r: 5 }} isAnimationActive={false}>
          <LabelList dataKey="OlderAllExposed" position="top" />
        </Line>
      </LineChart>
    </ChartFrame>
  );
}

function DotPanels() {
  return (
    <div className="chart-frame">
      <div className="chart-title">{CHART_INTERPS.dotpanels.title}</div>
      <div className="small-multiples">
        <div className="small-multiple-panel">
          <div className="panel-label">Panel A — Great Recession: change in unemployment RATE, percentage points (2006–2010)</div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={GR_PANEL} layout="vertical" margin={{ top: 10, right: 40, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" domain={[0, 9]} unit="pp" />
              <YAxis type="category" dataKey="name" width={90} />
              <Tooltip formatter={(v) => "+" + v + " pp"} />
              <Bar dataKey="change" fill={COLORS.danger} barSize={3} isAnimationActive={false} />
              <Scatter dataKey="change" fill={COLORS.danger} shape="circle" legendType="none" isAnimationActive={false}>
                <LabelList dataKey="change" position="right" formatter={(v) => "+" + v + "pp"} />
              </Scatter>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="small-multiple-panel">
          <div className="panel-label">Panel B — AI era: change in employment LEVEL, percent, within high-AI-exposure occupations (late 2022–mid 2025)</div>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={AI_PANEL} layout="vertical" margin={{ top: 10, right: 40, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" domain={[-10, 12]} unit="%" />
              <YAxis type="category" dataKey="name" width={90} />
              <Tooltip formatter={(v) => (v > 0 ? "+" : "") + v + "%"} />
              <ReferenceLine x={0} stroke="#999" />
              <Bar dataKey="change" barSize={3} isAnimationActive={false}>
                {AI_PANEL.map((d, i) => <Cell key={i} fill={d.change < 0 ? COLORS.danger : COLORS.success} />)}
              </Bar>
              <Scatter dataKey="change" legendType="none" isAnimationActive={false}>
                {AI_PANEL.map((d, i) => <Cell key={i} fill={d.change < 0 ? COLORS.danger : COLORS.success} />)}
                <LabelList dataKey="change" position="right" formatter={(v) => (v > 0 ? "+" : "") + v + "%"} />
              </Scatter>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="chart-note"><Tag tier="FACT" /> Panel A: BLS Monthly Labor Review, 2019 (Hipple et al.). Panel B: ADP Research, 2025 (citing Stanford Digital Economy Lab); "Ages 30+" plotted at the midpoint of its reported +6% to +13% range. Different units and different time windows by design — see the interpretation prompts below.</div>
    </div>
  );
}

function DumbbellChart() {
  return (
    <ChartFrame id="dumbbell" note={<span><Tag tier="FACT" /> LinkedIn News / LinkedIn Top Companies 2026 list, as reported in Becker's Hospital Review, May 2026.</span>}>
      <ComposedChart data={DUMBBELL_DATA} layout="vertical" margin={{ top: 10, right: 60, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis type="number" domain={[0, 45]} />
        <YAxis type="category" dataKey="name" width={160} />
        <Tooltip formatter={(v, n, p) => v + p.payload.unit} />
        <Bar dataKey="base" stackId="a" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="delta" stackId="a" fill={COLORS.neutral} barSize={4} isAnimationActive={false} />
        <Scatter dataKey="before" fill={COLORS.accentLight} name="2016" isAnimationActive={false}>
          <LabelList dataKey="before" position="top" formatter={(v, e) => v} />
        </Scatter>
        <Scatter dataKey="after" fill={COLORS.accent} name="2025" isAnimationActive={false}>
          <LabelList dataKey="after" position="bottom" formatter={(v, e) => v} />
        </Scatter>
        <Legend />
      </ComposedChart>
    </ChartFrame>
  );
}

function BulletChart() {
  return (
    <ChartFrame id="bullet" note={<span><Tag tier="FACT" /> Recent-grad figures: Federal Reserve Bank of New York, Q2 2026. National unemployment reference line: BLS, Jul 2026.</span>}>
      <BarChart data={BULLET_DATA} layout="vertical" margin={{ top: 10, right: 40, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis type="number" domain={[0, 60]} unit="%" />
        <YAxis type="category" dataKey="name" width={190} />
        <Tooltip formatter={(v) => v + "%"} />
        <Bar dataKey="value" barSize={22} fill={COLORS.accent} isAnimationActive={false}>
          <LabelList dataKey="value" position="right" formatter={(v) => v + "%"} />
        </Bar>
        <ReferenceLine x={4.1} stroke={COLORS.danger} strokeDasharray="4 4" label={{ value: "National rate: 4.1%", position: "insideTopRight", fontSize: 11, fill: COLORS.danger }} />
      </BarChart>
    </ChartFrame>
  );
}

/* ----------------------------------------------------------------------
   MAIN APP
---------------------------------------------------------------------- */
const SECTION_ORDER = [
  { id: "warmup", label: "Warm-Up" },
  { id: "intro", label: "Introduction" },
  { id: "background", label: "Background" },
  { id: "rq1", label: "RQ1: How Large?" },
  { id: "rq2", label: "RQ2: Why This Pattern?" },
  { id: "rq3", label: "RQ3: What To Do" },
  { id: "summary", label: "Learning Summary" },
  { id: "conclusion", label: "Conclusion" },
];

function useLiveScore(questionState) {
  let correct = 0, total = 0;
  Object.values(questionState).forEach((s) => {
    if (s.submitted) { total += 1; if (s.isCorrect) correct += 1; }
  });
  return { correct, total };
}

function App() {
  const [activeSection, setActiveSection] = useState("warmup");
  const [wide, setWide] = useState(window.innerWidth >= 1160);
  const [questionState, setQuestionState] = useState({});
  const [interpState, setInterpState] = useState({});
  const [applyIt, setApplyIt] = useState({ thesis: "", assumption: "", disconfirm: "", premortem: "", crosslink: "", evaluated: false });
  const sectionRefs = useRef({});

  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= 1160);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      let current = SECTION_ORDER[0].id;
      for (const s of SECTION_ORDER) {
        const el = sectionRefs.current[s.id];
        if (el && el.getBoundingClientRect().top - 90 <= 0) current = s.id;
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const registerRef = (id) => (el) => { sectionRefs.current[id] = el; };

  const onSelectOption = (id, idx) => {
    setQuestionState((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), selectedOption: idx, submitted: false } }));
  };
  const onSubmitMC = (id) => {
    const q = QUESTIONS.find((x) => x.id === id);
    setQuestionState((prev) => {
      const cur = prev[id] || {};
      const isCorrect = cur.selectedOption === q.correct;
      return { ...prev, [id]: { ...cur, submitted: true, isCorrect } };
    });
  };
  const onSubmitNumeric = (id, value) => {
    const q = QUESTIONS.find((x) => x.id === id);
    let isCorrect = false;
    if (q.logTolerance) {
      const ratio = value > 0 ? Math.log2(value / q.target) : Infinity;
      isCorrect = Math.abs(ratio) <= 1; // within factor of 2
    } else {
      isCorrect = Math.abs(value - q.target) / q.target <= q.tolerancePct;
    }
    setQuestionState((prev) => ({ ...prev, [id]: { numericValue: value, submitted: true, isCorrect } }));
  };

  const onSubmitInterp = (chartId, idx, text) => {
    setInterpState((prev) => {
      const cur = prev[chartId] || { submitted: [false, false], text: ["", ""] };
      const submitted = cur.submitted.slice(); submitted[idx] = true;
      const textArr = cur.text.slice(); textArr[idx] = text;
      return { ...prev, [chartId]: { submitted, text: textArr } };
    });
  };

  const score = useLiveScore(questionState);

  const bySection = (sec) => QUESTIONS.filter((q) => q.section === sec);
  const interpFor = (chartId) => interpState[chartId] || { submitted: [false, false], text: ["", ""] };

  const renderQuestion = (q) => {
    const st = questionState[q.id] || { selectedOption: null, submitted: false, isCorrect: false, numericValue: null };
    if (q.kind === "numeric") {
      return <NumericQuestionCard key={q.id} q={q} state={st} onSubmit={onSubmitNumeric} />;
    }
    return <MCQuestionCard key={q.id} q={q} state={st} onSelect={onSelectOption} onSubmit={onSubmitMC} />;
  };

  return (
    <div className="app-shell">
      <div className="progress-bar" style={{ width: (Math.min(100, (SECTION_ORDER.findIndex(s => s.id === activeSection) + 1) / SECTION_ORDER.length * 100)) + "%" }} />
      <div className="score-badge">Score: {score.correct} / {score.total}</div>
      {wide && (
        <nav className="section-nav">
          {SECTION_ORDER.map((s) => (
            <div key={s.id} className={"nav-item" + (activeSection === s.id ? " active" : "")} onClick={() => scrollTo(s.id)}>
              {s.label}
            </div>
          ))}
        </nav>
      )}
      <main className="content-col">

        {/* ============ WARM-UP ============ */}
        <section id="sec-warmup" ref={registerRef("warmup")} className="section">
          <h1>The Narrow Shock</h1>
          <p className="subtitle">What AI Has Actually Done to Entry-Level Jobs</p>
          <h2>Warm-Up: What Stuck?</h2>
          <p>Before today's topic, three quick questions pull principles from recent notes and ask you to apply them somewhere completely new — not to recall what you read before.</p>
          {bySection("warmup").map(renderQuestion)}
        </section>

        {/* ============ INTRODUCTION ============ */}
        <section id="sec-intro" ref={registerRef("intro")} className="section">
          <h2>Introduction</h2>
          <p>Nearly four years after ChatGPT's public release, the U.S. unemployment rate sits at 4.1%, barely above its 3.7% level in November 2022 (<Cite id="blsjul2026">BLS, 2026</Cite>; <Cite id="blsnov2022">BLS, 2022</Cite>). Yet employment for 22- to 25-year-olds in the occupations AI touches most has fallen as much as 19% below where it would be had it simply kept pace with less-exposed workers of the same age (<Cite id="stanfordcanaries">Stanford Digital Economy Lab, 2026</Cite>). AI's labor-market disruption is real, but so far it is landing on one narrow slice of the workforce, not the whole economy.</p>
          <p>That slice is easy to name and hard to miss once you look for it. The youngest software developers saw their employment fall 20% from its late-2022 peak by July 2025; the youngest customer-service representatives fell nearly 11% over the same window — while workers 30 and older, in those same high-AI-exposure occupations, grew employment 6% to 13% (<Cite id="adp2025">ADP Research, 2025</Cite>). Meanwhile, layoffs explicitly attributed to AI made up only about 4.5% of all 2025 job cuts, but that share had already jumped to roughly 23% of all cuts announced in the first half of 2026 (<Cite id="challenger2025">Challenger, Gray & Christmas, 2026</Cite>; <Cite id="challenger2026jun">Challenger, Gray & Christmas, 2026</Cite>) — a fivefold jump in the SHARE of layoffs citing AI as a reason, even while total layoff volume was falling.</p>
          <p>This is not how earlier waves of technology-driven job worry usually played out. Past scares about automation (and the 2008 financial crisis, a genuine broad-based shock) tended to hit workers of every age within a shrinking industry. Here, the same occupation category is simultaneously shedding its youngest workers and adding its older ones — a sign flip within one job title that a simple "the economy is slowing" story cannot explain, and one that companies themselves are responding to in opposite ways: Salesforce froze new engineering hires in 2025 citing AI productivity gains, while IBM announced it was tripling entry-level hiring the very next year, betting the freeze was a mistake (<Cite id="benioffsfben2024">Salesforce Ben, 2024</Cite>; <Cite id="fortuneapr2026">Fortune, 2026</Cite>).</p>
          <p>This note addresses three questions: First, how large is AI's actual effect on entry-level hiring, and how do we know today's softer youth labor market isn't simply high interest rates or a broader hiring correction wearing an AI costume? Second, why does the damage concentrate in the youngest workers inside AI-exposed occupations rather than spreading evenly across the whole labor force, or even hitting experienced workers in the identical jobs? Third, given that individual employers are placing opposite bets — freezing junior hiring versus tripling it — what should a company, a new graduate, and a policymaker actually do while the evidence is still this early?</p>
          <GlossaryPanel items={GLOSSARY.intro} />
        </section>

        {/* ============ BACKGROUND ============ */}
        <section id="sec-background" ref={registerRef("background")} className="section">
          <h2>Background: A Real Signal Buried Inside a Calm Aggregate</h2>
          <p>Start with the number everyone already has: the national unemployment rate. It was 3.7% in November 2022, the month ChatGPT launched, and 4.1% in July 2026 — a rise of just 0.4 percentage points over nearly four years, with 6.9 million people counted as unemployed out of a labor force of roughly 168 million (<Cite id="blsnov2022">BLS, 2022</Cite>; <Cite id="blsjul2026">BLS, 2026</Cite>). On its own, that looks like nothing has happened.</p>
          <p>Researchers at the Federal Reserve Bank of Dallas dug into exactly why a real, targeted effect could hide inside such a flat aggregate. Workers age 20 to 24 make up only about 9% of the total U.S. labor force. Within the specific occupations classified as "most AI-exposed," the share of employment held by young workers slipped from 16.4% in November 2022 to 15.5% in September 2025 — a real, measured 0.9-percentage-point decline (<Cite id="dallasfed2026">Dallas Fed, 2026</Cite>). Work through the numeric question below using only those two facts, before the chart shows how that translates into the aggregate rate.</p>
          {renderQuestion(bySection("background").find((q) => q.id === "bg_d1"))}
          <BridgeChart />
          <ChartInterpretation chartId="bridge" interp={interpFor("bridge")} onSubmit={onSubmitInterp} />
          {renderQuestion(bySection("background").find((q) => q.id === "bg1"))}
          <p>The Dallas Fed's own read of this pattern is careful: layoffs are not the mechanism. Young, most-exposed workers are not entering unemployment from a job at any higher rate than usual, and their job-finding rate once unemployed tracks other groups closely. The effect runs almost entirely through reduced HIRING — fewer young people transitioning from school, or from outside the labor force, into a first job in these occupations (<Cite id="dallasfed2026">Dallas Fed, 2026</Cite>). That is a structural change in who gets hired, not a wave of firings.</p>
          <p>Zoom in on two specific occupations and the structural shift becomes concrete. Between late 2022 and July 2025, employment for the youngest software developers fell 20% from its peak, and employment for the youngest customer-service representatives fell nearly 11% from its own peak — while employment for workers 30 and older, across the whole high-AI-exposure occupation category, grew 6% to 13% over the same stretch. Health aides, an occupation with low AI exposure, saw employment grow for every age group across the same period (<Cite id="adp2025">ADP Research, 2025</Cite>).</p>
          <SlopeChart />
          <ChartInterpretation chartId="slope" interp={interpFor("slope")} onSubmit={onSubmitInterp} />
          {renderQuestion(bySection("background").find((q) => q.id === "bg2"))}
          <GlossaryPanel items={GLOSSARY.background} />
        </section>

        {/* ============ RQ1 ============ */}
        <section id="sec-rq1" ref={registerRef("rq1")} className="section">
          <h2>RQ1 — How Large Is This, Really, and Compared to What?</h2>
          <p>The headline figure driving this whole debate comes from Stanford's Digital Economy Lab: employment for 22- to 25-year-olds in AI-exposed occupations now sits as much as 19% below where it would be had it kept pace with less-exposed workers of the same age, as of the study's August 2026 revision using payroll data through June 2026 — up from a 15% gap the same team reported a year earlier, in August 2025 (<Cite id="stanfordcanaries">Stanford Digital Economy Lab, 2026</Cite>).</p>
          <p>That number has moved before, and it will likely move again, which is itself instructive. In a February 2026 follow-up, the same researchers reported the gap at roughly 13% using data only through July 2025, and about 16% by October 2025 once they added stricter statistical controls (called firm-time fixed effects) that isolate the AI-exposure pattern from each company's own broader hiring swings (<Cite id="stanfordinterest">Stanford Digital Economy Lab, 2026</Cite>). Reasonable people can read 13%, 15%, 16%, and 19% as either an inconsistent, unreliable finding or as a live research program getting more precise and finding a widening effect as more data arrives. The direction (up, every time) is what should carry more weight than any single vintage of the number.</p>
          <p>The same researchers took the most obvious alternative explanation seriously: could rising interest rates, not AI, explain why young workers in these specific occupations are struggling to get hired? Using outside interest-rate-exposure data, they found that AI-exposed occupations are actually LESS sensitive to interest rates on average than the typical occupation (construction, for example, has high interest-rate exposure and low AI exposure) — and the AI-exposure pattern held up whether they looked at occupations with high or low interest-rate sensitivity (<Cite id="stanfordinterest">Stanford Digital Economy Lab, 2026</Cite>). That does not prove AI is the cause, but it rules out the single most obvious rival explanation.</p>
          <DotPanels />
          <ChartInterpretation chartId="dotpanels" interp={interpFor("dotpanels")} onSubmit={onSubmitInterp} />
          {bySection("rq1").map((q) => renderQuestion(q))}
          <p>Comparing today's pattern to the last time young workers were clearly hit hardest by a downturn puts the scale in perspective. During the Great Recession, unemployment for workers under 25 rose 7.9 percentage points (10.5% in 2006 to 18.4% in 2010), nearly double the 4.7-point rise for workers 25 to 74 (<Cite id="blsmlr2019">BLS Monthly Labor Review, 2019</Cite>) — a broad shock that hit every age group in the same direction, just harder for the young. Today's pattern is different in kind, not just in size: it is occupation-specific, it runs through hiring rather than firing, and within the identical occupation category, older workers are gaining ground while younger workers lose it.</p>
          <p>The honest, section-level conclusion: AI's measured effect on entry-level employment is real, it has grown with each new vintage of data, and the single most obvious rival explanation (interest rates) has been specifically tested and does not fit. But because the affected group is a small share of the total labor force, this effect is, and will likely remain for some time, invisible in the national unemployment rate — which is exactly why relying on that headline number to judge AI's labor-market impact is a mistake.</p>
          <GlossaryPanel items={GLOSSARY.rq1} />
        </section>

        {/* ============ RQ2 ============ */}
        <section id="sec-rq2" ref={registerRef("rq2")} className="section">
          <h2>RQ2 — Why This Pattern, and Why This Size?</h2>
          <p>If AI were simply making a whole occupation obsolete, employment should fall for everyone in it. It isn't. The Stanford team's central mechanism claim is a split between AI uses that AUTOMATE a task (fully replacing what a person did) and AI uses that AUGMENT a person (helping them do the same task faster). Employment declines concentrate specifically in the automating cases; where AI mainly augments workers, employment is flat or rising, especially for experienced staff (<Cite id="stanfordcanaries">Stanford Digital Economy Lab, 2026</Cite>).</p>
          <p>That split lines up with which tasks tend to fall to the newest hires. A junior software developer's early workload is disproportionately routine: writing first-draft code, fixing well-understood bugs, answering the more scriptable support tickets. Those are exactly the tasks a generative coding assistant or support chatbot can now do directly. A senior engineer's workload leans toward judgment: architecture decisions, ambiguous debugging, negotiating trade-offs with other teams — work the same tools currently make faster, not obsolete. One technology, applied inside one occupation, can raise the value of experience and lower the value of an entry-level hire to the firm at the same time.</p>
          <p>Evidence of a broader structural re-weighting toward experience shows up beyond these two occupations specifically. Among the 50 U.S. employers LinkedIn rates best for career growth, the share of new hires classified as entry-level fell from 40.3% in 2016 to 37.2% in 2025, while the median employee's experience level at those same companies rose from about 6 years to about 8.5 years (<Cite id="linkedinbeckers2026">Becker's Hospital Review, 2026</Cite>). That is a slow-moving, company-level shift toward hiring people who already know how to do the job, sustained over nearly a decade — not a single bad hiring season.</p>
          <DumbbellChart />
          <ChartInterpretation chartId="dumbbell" interp={interpFor("dumbbell")} onSubmit={onSubmitInterp} />
          {bySection("rq2").map((q) => renderQuestion(q))}
          <p>Corporate behavior on the ground matches the automate/augment split directly. Salesforce's CEO said in December 2024 the company would add no new software engineers in 2025 after AI tools raised engineering productivity "by more than 30%," and separately said in a September 2025 interview that Salesforce's own customer-support headcount had already fallen from 9,000 to 5,000 employees, attributing the drop to AI agents (<Cite id="benioffsfben2024">Salesforce Ben, 2024</Cite>; <Cite id="fortuneapr2026">Fortune, 2026</Cite>) — both squarely inside the automating, task-substitution category this section describes.</p>
          <p>The section's honest conclusion: this is not a story about "AI hurting an occupation." It is a story about AI hurting a specific kind of task, disproportionately assigned to the newest hires, inside occupations that otherwise look identical from the outside. That is also why the effect concentrates the way it does: it needs a task mix skewed toward automatable work AND a supply of workers whose whole job is currently that task mix, a combination that describes entry-level roles far more than experienced ones.</p>
          <GlossaryPanel items={GLOSSARY.rq2} />
        </section>

        {/* ============ RQ3 ============ */}
        <section id="sec-rq3" ref={registerRef("rq3")} className="section">
          <h2>RQ3 — What Should a Company, a New Graduate, and a Policymaker Do Right Now?</h2>
          <p>Whatever the aggregate statistics say, the people living through this squeeze are not comforted by a 4.1% national unemployment rate. Recent college graduates age 22 to 27 with a bachelor's degree had a 5.6% unemployment rate in the second quarter of 2026, and a startling 42% underemployment rate — meaning 42% of employed recent graduates hold a job that typically doesn't require a college degree at all (<Cite id="nyfedgrad">New York Fed, 2026</Cite>).</p>
          <BulletChart />
          <ChartInterpretation chartId="bullet" interp={interpFor("bullet")} onSubmit={onSubmitInterp} />
          {renderQuestion(bySection("rq3").find((q) => q.id === "rq3a"))}
          <p>Employers are not waiting for a consensus before placing their own bets, and they are placing opposite ones. Salesforce announced in late 2024 it would not add software engineers in 2025, citing AI productivity gains of more than 30%, then reversed course in April 2026 by announcing it was hiring 1,000 new graduates and interns specifically to build its AI products (<Cite id="benioffsfben2024">Salesforce Ben, 2024</Cite>; <Cite id="fortuneapr2026">Fortune, 2026</Cite>). IBM took the opposite bet earlier, announcing in February 2026 it was tripling entry-level hiring, including in software development. Its chief human-resources officer argued: "The companies three to five years from now that are going to be the most successful are those companies that doubled down on entry-level hiring in this environment" (<Cite id="fortuneapr2026">Fortune, 2026</Cite>).</p>
          <p>Broader survey data suggests the freeze narrative is not universal even among employers most exposed to AI. A spring 2026 survey by the National Association of Colleges and Employers found companies planned to increase college-graduate hiring by 5.6% for the class of 2026, including in fields assumed most vulnerable to automation such as information services and engineering — and just 11.4% of surveyed employers planned to decrease hiring at all, with under 16% of that smaller group citing AI as the reason (NACE, Spring 2026, as reported in <Cite id="fortuneapr2026">Fortune, 2026</Cite>).</p>
          {renderQuestion(bySection("rq3").find((q) => q.id === "rq3b"))}
          <p>For a policymaker, the practical lesson from RQ1 is not to wait for the national unemployment rate to confirm a problem before acting; by the time a 9%-of-the-labor-force group's struggles move that number noticeably, years may have passed. For a new graduate, the practical lesson from RQ2 is to weigh not just an employer's brand name but whether its current hiring behavior (a Salesforce-style freeze or an IBM-style expansion) reflects a considered bet about which tasks the firm still wants humans learning to do. For an employer, the open question this section cannot resolve is which bet is actually right — and the evidence available today cannot yet say.</p>
          <GlossaryPanel items={GLOSSARY.rq3} />
        </section>

        {/* ============ LEARNING SUMMARY ============ */}
        <LearningSummary
          questionState={questionState}
          score={score}
          applyIt={applyIt}
          setApplyIt={setApplyIt}
          scrollTo={scrollTo}
          registerRef={registerRef}
        />

        {/* ============ CONCLUSION ============ */}
        <section id="sec-conclusion" ref={registerRef("conclusion")} className="section">
          <h2>Conclusion</h2>
          <p>The central challenge this note has traced is that AI's labor-market damage is concentrated narrowly enough, in a small enough slice of the workforce, that the economy's most-watched statistic cannot see it — and the most likely trajectory, under a continuation of today's partial evidence, is that the gap for young workers in automating, high-exposure occupations keeps widening gradually rather than resolving quickly in either direction.</p>
          <p>For employers, the implication is that the freeze-versus-expand decision on junior hiring is not a simple cost-cutting call; it is a bet on how fast AI's capability keeps advancing, made against a backdrop where the two most prominent companies in this debate have already reversed or diverged on their own answer within roughly a year. For new graduates and the schools training them, the implication is that brand-name employers and the highest-paying occupations are not automatically the safest entry points anymore — the automate/augment distinction, not prestige, is now the more useful filter.</p>
          <p>Institutionally, the pattern that should worry policymakers most is not the current 19% gap itself, but the possibility that today's narrow, occupation-specific effect is an early boundary condition rather than a stable equilibrium — a "canary," in the researchers' own words, rather than the whole story. Regulators and labor-market researchers built to watch the aggregate unemployment rate are, by this note's own arithmetic, structurally late to detect an effect like this one; occupation-by-age microdata, not the monthly jobs report, is where the next real signal will show up first.</p>
          <p>The single most important open question: will the boundary between AI's automating and augmenting uses hold where it currently sits, protecting experienced workers even as younger ones bear the cost of task substitution — or is today's youngest-worker effect simply the leading edge of a pattern that eventually reaches everyone?</p>
          {renderQuestion(bySection("conclusion")[0])}
        </section>

        {/* ============ SOURCES ============ */}
        <section className="section sources-section">
          <h2>Sources</h2>
          <ol>
            {SOURCES.map((s) => (
              <li key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.label}</a></li>
            ))}
          </ol>
        </section>

      </main>
    </div>
  );
}

/* ----------------------------------------------------------------------
   LEARNING SUMMARY (separate component for clarity)
---------------------------------------------------------------------- */
function LearningSummary({ questionState, score, applyIt, setApplyIt, scrollTo, registerRef }) {
  const [insightDraft, setInsightDraft] = useState("");
  const [insightRevealed, setInsightRevealed] = useState(false);
  const [evalResult, setEvalResult] = useState(null);

  const typeBuckets = {};
  QUESTIONS.forEach((q) => {
    const key = q.section === "warmup" ? "Warm-Up (B)" : "Type " + q.type;
    if (!typeBuckets[key]) typeBuckets[key] = { correct: 0, total: 0 };
    const st = questionState[q.id];
    if (st && st.submitted) {
      typeBuckets[key].total += 1;
      if (st.isCorrect) typeBuckets[key].correct += 1;
    }
  });

  const numericQs = QUESTIONS.filter((q) => q.kind === "numeric");
  let biasNote = "Not enough numeric answers submitted yet to compute bias.";
  const answeredNumeric = numericQs.filter((q) => questionState[q.id] && questionState[q.id].submitted);
  if (answeredNumeric.length > 0) {
    const avgSignedPct = answeredNumeric.reduce((acc, q) => {
      const v = questionState[q.id].numericValue;
      return acc + (v - q.target) / q.target;
    }, 0) / answeredNumeric.length;
    const dir = avgSignedPct > 0.05 ? "over-estimated" : avgSignedPct < -0.05 ? "under-estimated" : "estimated close to";
    biasNote = "On average, you " + dir + " magnitudes by about " + Math.abs(Math.round(avgSignedPct * 100)) + "%.";
  }

  const missed = QUESTIONS.filter((q) => {
    const st = questionState[q.id];
    return st && st.submitted && !st.isCorrect;
  });

  const evaluateApplyIt = () => {
    // Local, evidence-based fallback evaluator (no external API call from a static file).
    // A future version could route this to a secure server-side LLM evaluation endpoint;
    // this heuristic checks presence, minimum substance, and specificity of each of the
    // four required parts, and flags whichever is weakest rather than scoring keywords.
    const parts = [
      { key: "thesis", label: "So-what thesis", value: applyIt.thesis },
      { key: "assumption", label: "Load-bearing assumption", value: applyIt.assumption },
      { key: "disconfirm", label: "Disconfirming evidence", value: applyIt.disconfirm },
      { key: "premortem", label: "Pre-mortem", value: applyIt.premortem },
    ];
    const gaps = [];
    parts.forEach((p) => {
      const v = (p.value || "").trim();
      if (v.length < 20) gaps.push(p.label + " is missing or too thin (needs a specific, concrete claim, not a placeholder).");
      else if (/^(everything|nothing|it depends|not sure|na|n\/a)/i.test(v)) gaps.push(p.label + " is too generic to evaluate — name a specific mechanism or number.");
    });
    let weakest = gaps.length > 0 ? gaps[0] : "All four parts are present with reasonable specificity — the strongest next step is checking whether your disconfirming evidence actually threatens your thesis's LOAD-BEARING assumption, not just the thesis in general.";
    setEvalResult({ gaps, weakest, complete: gaps.length === 0 });
    setApplyIt((prev) => ({ ...prev, evaluated: true }));
  };

  return (
    <section id="sec-summary" ref={registerRef("summary")} className="section">
      <h2>Learning Summary</h2>

      <h3>Score Breakdown</h3>
      <table className="score-table">
        <thead><tr><th>Type</th><th>Correct</th><th>Attempted</th></tr></thead>
        <tbody>
          {Object.keys(typeBuckets).map((k) => (
            <tr key={k}><td>{k}</td><td>{typeBuckets[k].correct}</td><td>{typeBuckets[k].total}</td></tr>
          ))}
          <tr className="total-row"><td>Overall</td><td>{score.correct}</td><td>{score.total}</td></tr>
        </tbody>
      </table>
      <p className="bias-note">{biasNote} (No pre-reveal confidence was collected; this note reports accuracy by question type and numeric bias direction only.)</p>

      <h3>Your Governing Insight</h3>
      <p>You've seen five data exhibits across this note. Before the article's own three insight cards appear, write in one sentence the single most non-obvious insight you'd defend to a skeptical corporate board or a skeptical labor economist.</p>
      {!insightRevealed ? (
        <div className="interp-input-row">
          <textarea rows={2} value={insightDraft} onChange={(e) => setInsightDraft(e.target.value)} placeholder="Your governing insight..." />
          <button className="btn-secondary" disabled={insightDraft.trim().length < 15} onClick={() => setInsightRevealed(true)}>Reveal the article's three</button>
        </div>
      ) : (
        <div>
          <div className="reader-answer"><span className="micro-label">Your insight</span>{insightDraft}</div>
          <div className="insight-cards">
            <div className="insight-card">The national unemployment rate is structurally the wrong instrument for detecting this effect — a group that is 9% of the labor force can lose real ground for years without moving the aggregate more than a tenth of a point.</div>
            <div className="insight-card">This isn't "AI hurting an occupation," it's AI substituting for a specific kind of task that happens to be assigned mostly to the newest hires — which is why employment can fall for the young and rise for the old in the exact same job title at the same time.</div>
            <div className="insight-card">Employers are not waiting for consensus; Salesforce and IBM made opposite bets within about a year of each other, and the honest answer to "which is right" is that the evidence doesn't yet say — the automate/augment boundary holding for experienced workers is the thing to watch next.</div>
          </div>
        </div>
      )}

      <h3>Apply It</h3>
      <p><strong>(a) Your context — transfer to a new domain.</strong> A regional accounting firm's staffing data shows: <em>Junior tax-return preparers</em> (headcount −18% since a new AI tax-prep assistant launched two years ago), <em>Senior tax partners</em> (headcount +9% over the same period, same firm), <em>Junior auditors</em> (headcount flat, a role the firm says AI mostly helps organize workpapers rather than draft judgments). Write four labeled parts:</p>
      <div className="applyit-form">
        <label>1. One-sentence so-what thesis</label>
        <textarea rows={2} value={applyIt.thesis} onChange={(e) => setApplyIt({ ...applyIt, thesis: e.target.value })} />
        <label>2. The single load-bearing assumption that must hold</label>
        <textarea rows={2} value={applyIt.assumption} onChange={(e) => setApplyIt({ ...applyIt, assumption: e.target.value })} />
        <label>3. The evidence that would most undermine it (disconfirming evidence)</label>
        <textarea rows={2} value={applyIt.disconfirm} onChange={(e) => setApplyIt({ ...applyIt, disconfirm: e.target.value })} />
        <label>4. Pre-mortem: "If this fails in 12 months, the most likely reason is ___."</label>
        <textarea rows={2} value={applyIt.premortem} onChange={(e) => setApplyIt({ ...applyIt, premortem: e.target.value })} />
        <button className="btn-primary" onClick={evaluateApplyIt}>Check my reasoning</button>
        {evalResult && (
          <div className="explanation">
            {evalResult.complete
              ? <div className="calibration right">All four parts are present with reasonable specificity.</div>
              : <div className="calibration wrong">Gaps found:<ul>{evalResult.gaps.map((g, i) => <li key={i}>{g}</li>)}</ul></div>}
            <div className="principle-line"><strong>Weakest link:</strong> {evalResult.weakest}</div>
          </div>
        )}
      </div>
      <p><strong>(b) Cross-link.</strong> Which prior article's principle (from the warm-up, or elsewhere in the series) most reinforces or conflicts with today's note, and why?</p>
      <textarea rows={2} value={applyIt.crosslink} onChange={(e) => setApplyIt({ ...applyIt, crosslink: e.target.value })} placeholder="e.g., ER-15's distinction between a policy succeeding on its narrow terms and a broader goal moving independently reinforces today's point that a policy or company action (a freeze, a rule) can hit its stated target while the real underlying question stays unresolved..." />

      <h3>Return to Section</h3>
      {missed.length === 0 ? (
        <p>No missed questions yet (or none attempted) — nice work, or dive back in above.</p>
      ) : (
        <ul className="return-list">
          {missed.map((q) => (
            <li key={q.id}>
              <strong>{q.principle}</strong> — <a onClick={() => scrollTo(q.section)}>revisit {q.section}</a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
