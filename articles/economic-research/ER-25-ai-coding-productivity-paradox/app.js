const { useState, useEffect } = React;
const {
  LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LabelList, Cell, ReferenceLine
} = Recharts;

/* ============================== DATA ==============================
   All chart-data field names are checked against the Recharts spread trap:
   no field is named `ref`, `key`, or `children` anywhere in this file.
   =================================================================== */

/* Chart 1 — Slope chart. AI-tool adoption vs. self-reported productivity belief, 2024 vs 2025.
   Source: DORA (Google Cloud) 2024 report, 75.9% adoption / 75% report productivity gains, as
   detailed by RedMonk, "DORA Report 2024 - A Look at Throughput and Stability," 26 Nov 2024;
   DORA 2025 report, 90% adoption / >80% report productivity gains, Google Cloud Blog,
   "Announcing the 2025 DORA Report," 23 Sep 2025. FACT. */
const DORA_SLOPE = [
  { stage: "2024", adoption: 76, belief: 75 },
  { stage: "2025", adoption: 90, belief: 80 }
];

/* Chart 2 — 100% stacked bar. Composition of changed code lines: copy-pasted vs. all other code.
   copyPasted is FACT (GitClear, "AI Copilot Code Quality: 2025 Look Back at 12 Months of Data,"
   analyzing 211 million changed lines, 2020-2024). otherCode is an ESTIMATE, the arithmetic
   residual (100 minus copyPasted); GitClear does not report a single "all other code" category. */
const CODE_COMPOSITION = [
  { year: "2020", copyPasted: 8.3, otherCode: 91.7 },
  { year: "2024", copyPasted: 12.3, otherCode: 87.7 }
];

/* Chart 3 — Dot-plot / range chart (forest-plot style). Four measured "AI effect on developer
   speed" estimates. Axis convention: positive = faster / more output, negative = slower.
   METR figures are FACT, sign-flipped from the source's own "percent longer" / "speedup"
   convention to a single consistent axis here (documented in the chart note below).
   Cui et al.'s approximate 95% range is an ESTIMATE (point +/- ~1.96 x reported SE), disclosed.
   Sources: METR, "Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer
   Productivity," 10 Jul 2025; METR, "We are Changing our Developer Productivity Experiment
   Design," 24 Feb 2026; Cui, Demirer, Jaffe, Musolff, Peng, Salz, SSRN 4945566, rev. 10 Feb 2025. */
const STUDY_RANGES = [
  { study: "METR early-2025 RCT (16 devs, 246 tasks)", metric: "Time per task, lower value = faster", low: -39, high: -2, pointEst: -19, base: -39, barSpan: 37 },
  { study: "Cui et al. 3-firm field experiments (4,867 devs)", metric: "Tasks completed per week", low: 6, high: 47, pointEst: 26, base: 6, barSpan: 41 },
  { study: "METR late-2025, original 10 devs re-tested", metric: "Time per task, high selection-bias risk", low: -9, high: 38, pointEst: 18, base: -9, barSpan: 47 },
  { study: "METR late-2025, 47 newly recruited devs", metric: "Time per task, high selection-bias risk", low: -9, high: 15, pointEst: 4, base: -9, barSpan: 24 }
];

/* Chart 4 — Waterfall. Anysphere (Cursor) valuation bridge across three funding rounds.
   Totals are FACT (TechCrunch, 5 Jun 2025; CNBC, 13 Nov 2025; TechCrunch reporting a $2.5bn
   pre-money valuation on a Dec 2024 raise). Step-ups are ESTIMATE by subtraction. $ billions. */
const VALUATION_WATERFALL = [
  { name: "Dec 2024 valuation", base: 0, barHeight: 2.5, shown: 2.5, kind: "total" },
  { name: "Jun 2025 raise (+$900M round)", base: 2.5, barHeight: 7.4, shown: 7.4, kind: "up" },
  { name: "Jun 2025 valuation", base: 0, barHeight: 9.9, shown: 9.9, kind: "total" },
  { name: "Nov 2025 raise (+$2.3B round)", base: 9.9, barHeight: 19.4, shown: 19.4, kind: "up" },
  { name: "Nov 2025 valuation", base: 0, barHeight: 29.3, shown: 29.3, kind: "total" }
];

/* Chart 5 — Horizontal bar (the article's one permitted plain bar chart). DORA 2024's modeled
   effect of a 25-percentage-point rise in AI adoption on three delivery outcomes. FACT, as
   detailed by RedMonk (2024) reporting the DORA 2024 report's own findings. */
const DORA_2024_EFFECTS = [
  { outcome: "Time spent on valuable work", effect: -2.6 },
  { outcome: "Software delivery throughput", effect: -1.5 },
  { outcome: "Software delivery stability", effect: -7.2 }
];

/* ============================== CHART PROMPTS ============================== */

const CHART_PROMPTS = {
  chart1: [
    { kind: "quant", label: "Quantitative reasoning (statistical trap)",
      prompt: "Adoption rose from 76% to 90%. State that change two ways — as a percentage-point change, and as a percent (relative) change — and say which framing a tool vendor's marketing team would prefer, and why a reader should be wary of the relative framing here.",
      authored: "That is a 14-percentage-point rise, but (90-76)/76 is about an 18.4% relative rise. A vendor would rather say \"18% growth in adoption\" because the bigger number sounds more dramatic, even though it describes the exact same underlying change. The percentage-point framing is the more honest one for something that is already a share of a population, because relative framing on a rate can make a modest shift sound like a surge. This generalizes to any \"X% increase\" headline built on a percentage base: always ask whether the increase is stated in points or in percent." },
    { kind: "mechanism", label: "Qualitative / mechanism",
      prompt: "Why might a rise in the share of developers who use AI tools and a rise in the share who believe AI helps them move together this closely, even if the tools' true effect on output were flat or negative?",
      authored: "Both numbers can be driven by the same upstream forces: employer mandates to use the tools, marketing and peer pressure, and the ordinary tendency to justify a choice you have already made. Adoption is a behavior counted by a survey; belief is an opinion counted by the same survey. Neither line is a measurement of code shipped, bugs introduced, or time saved. This generalizes to any \"usage is up and satisfaction is up\" chart: rising usage and rising self-reported satisfaction can be two symptoms of the same marketing or mandate cause, not proof that the underlying product works as claimed." }
  ],
  chart2: [
    { kind: "quant", label: "Quantitative reasoning",
      prompt: "Copy-pasted code rose from 8.3% to 12.3% of all changed lines between 2020 and 2024. Express this as a relative (percent) change, and say what a near-50% relative rise in duplication implies about long-run maintenance cost, even though the absolute share is still a minority of all code.",
      authored: "(12.3-8.3)/8.3 is about a 48% relative increase: duplication grew by nearly half in relative terms, even though it is still only around one-eighth of all changed lines in absolute terms. The insight is that maintenance cost scales with the absolute count of duplicated blocks a team must keep synchronized, not with its share of the total; a 48% relative rise inside a codebase processing millions of lines a year is a large absolute increase in near-duplicate blocks someone will eventually reconcile, refactor, or debug twice. This generalizes to any \"still a minority share\" argument: a rising share of a huge and growing total can still be a big and growing absolute problem." },
    { kind: "sowhat", label: "So-what / decision implication",
      prompt: "If you managed a 200-engineer codebase and saw this shift, what is the one process change most directly implied, and what would you NOT do in response?",
      authored: "The direct implication is to add automated duplicate-code detection to code review and to treat a rising clone rate as an early-warning signal, not a productivity trophy. What you should not do is ban the AI tools outright: the shift is a byproduct of how the tools tend to get used, fast acceptance of suggested blocks without abstraction, not an unavoidable property of the tools themselves, so the fix is a review-and-refactor discipline rather than prohibition. This generalizes to any tool that trades short-term speed for long-term structure: the fix usually lives in the surrounding process, not in banning the tool." }
  ],
  chart3: [
    { kind: "quant", label: "Quantitative reasoning (predict a ratio first)",
      prompt: "The Cui et al. estimate (+26%, tasks completed) has a reported standard error of 10.3%. Compute an approximate 95% range around it (point plus or minus roughly 2 times the standard error) and compare its width to METR's early-2025 range (37 points wide, from -39% to -2%). What does the relative width of these two ranges tell you about how confident you should be in each headline number?",
      authored: "Cui et al.'s approximate range is about 26 plus or minus 20.6, or roughly +5% to +47%, a 42-point-wide band, almost as wide as METR's 37-point-wide band, despite the Cui study having 4,867 developers against METR's 16. A large sample size narrows a standard error only so much when outcomes are noisy at the individual level, which is why both studies report wide bands: neither should be read as a precise point estimate, and any headline that drops the interval to state one clean percentage is quietly overstating its own precision. This generalizes to any single-number technology-adoption statistic: ask for the interval, not just the point." },
    { kind: "mechanism", label: "Qualitative / mechanism",
      prompt: "Two of the four rows come from METR itself, run about six months apart, and the direction of the point estimate flips from slower to faster. Setting aside sample size, what is the single biggest reason METR itself gives for why its second study's numbers should not be read at face value?",
      authored: "METR's own write-up names selection bias: as AI tools became more capable and more popular through 2025, 30% to 50% of developers told the researchers they were declining to submit tasks they did not want to complete without AI. That means the study increasingly measured only the tasks developers were willing to risk doing the slow way, a systematically easier subset, while the highest-uplift tasks were quietly removed from the comparison entirely. METR concludes this most likely biases its own second-study estimate toward understating the true effect, meaning the real current speedup for a typical developer is probably larger than the noisy number shown here, the opposite of what you might assume from a shrinking control group. This generalizes to any study of a fast-adopted technology: once early adopters can opt out of the control condition, whatever remains in the control group is a biased comparison." }
  ],
  chart4: [
    { kind: "sowhat", label: "So-what / decision implication",
      prompt: "Anysphere's valuation rose roughly elevenfold in eleven months while the strongest available causal study of AI coding tools, published between the two later rounds, found a slowdown for experienced developers. What should a due-diligence analyst at a growth-equity fund do differently because this gap exists, rather than simply noting it?",
      authored: "An analyst should underwrite the valuation on usage, revenue growth, and expansion into new customer segments, not on an assumed universal productivity multiplier, and should explicitly stress-test what happens to revenue growth if enterprise customers run their own internal comparisons and find effects closer to METR's than to marketing claims. The gap is not by itself a reason to avoid the investment, but it is a reason to price, as a named risk, the possibility that revenue growth is currently driven more by adoption momentum and fear of missing out than by a proven, durable productivity edge. This generalizes to any hot-technology valuation: separate \"money is flowing in\" from \"the core efficacy claim is proven,\" and underwrite the gap between them explicitly." },
    { kind: "quant", label: "Quantitative reasoning",
      prompt: "Compute the approximate growth multiple for each of the two funding jumps (Dec 2024 to Jun 2025, and Jun 2025 to Nov 2025). Which jump represents faster proportional growth, and does the dollar SIZE of each round tell the same story as its growth RATE?",
      authored: "Dec 2024 to Jun 2025: 9.9 divided by 2.5 is about 3.96x in roughly six months. Jun 2025 to Nov 2025: 29.3 divided by 9.9 is about 2.96x in roughly five months. The proportional growth rate actually slowed a little between the two jumps, from about 4x down to about 3x, even as the dollar size of the increase grew enormously, a $7.4 billion step-up became a $19.4 billion step-up. This is a rate-versus-level trap: a slower percentage growth rate can still describe a much larger absolute dollar increase, and a headline built on either number alone can tell an opposite-sounding story about the same two data points." }
  ],
  chart5: [
    { kind: "quant", label: "Quantitative reasoning",
      prompt: "Stability fell about 4.8 times as much as throughput did (7.2% versus 1.5%) for the same 25-point rise in adoption. What does that gap between the two effect sizes imply about where AI coding tools create the most risk?",
      authored: "The roughly 4.8x gap says the primary system-level cost of AI-assisted coding, in this model, is not that work slows down, throughput fell only modestly, but that changes become less predictable once they ship, since stability fell much more. That points a risk-management response toward stronger testing, staged rollouts, and faster rollback rather than toward slowing adoption itself, since the throughput cost is comparatively small. This generalizes to any \"the average effect looks small\" finding: check whether the average is masking one specific downstream metric absorbing most of the damage." },
    { kind: "mechanism", label: "Qualitative / mechanism",
      prompt: "About three-quarters of individual developers in the same 2024 survey said AI made them personally more productive, yet all three system-level metrics moved negative. What structural reason, beyond \"the developers are wrong,\" could make both things true at once?",
      authored: "An individual can genuinely finish their own piece of work faster while the total number of changes flowing into the system rises faster than the team's testing, review, and release processes can safely absorb, the same theory-of-constraints logic industry analysts point to: speeding up one stage of a multi-stage pipeline does not speed up the whole pipeline if a different stage was already the bottleneck, and can make the whole system less stable if the new volume overwhelms it. Individuals are not wrong about their own task; they are simply not positioned to see the congestion their extra output creates downstream. This generalizes to any \"local speedup, system slowdown\" pattern in operations: always identify the actual bottleneck before crediting a local speedup with a systemic gain." }
  ]
};

/* ============================== QUESTIONS ============================== */

const WARMUP_QUESTIONS = [
  { id: "wu1", type: "B", principle: "A small, non-representative subgroup can post a large effect while the whole population barely moves; the aggregate figure and the subgroup figure are answering different questions, and neither alone tells you whether an intervention worked or would scale.",
    transfer: "Where this generalizes: any pilot program, from a marketing test to a public-health trial, needs its subgroup result and its population-level result read together, not treated as competing verdicts.",
    prompt: "A national retailer reports that total in-store theft (\"shrink\") fell 2% last year and credits a new anti-theft program. An analyst notes the program was piloted in only 40 of the retailer's 2,000 stores, where shrink fell 35%. What does this combination most likely imply?",
    options: [
      { text: "Because the 40-store pilot is a small share of the 2,000-store chain, a large effect there can coexist with almost no visible movement in the national number; the -2% aggregate says little about whether the program works, and nothing here shows the pilot stores were representative or that results would hold at scale.", correct: true },
      { text: "The 35% pilot-store improvement will likely replicate storewide once the program is rolled out everywhere, so leadership should expect national shrink to eventually fall by a similar amount.", correct: false, misconception: "extrapolating a small subgroup's effect onto the full population without checking whether the pilot stores were representative or whether the mechanism scales" },
      { text: "Since the national number only fell 2% while the pilot fell 35%, the program actually failed, and something else, unrelated to the program, must be driving the pilot stores' improvement.", correct: false, misconception: "treating the aggregate as the only trustworthy signal and dismissing a real subgroup effect outright, an aggregation-neglect error in the opposite direction" },
      { text: "The two numbers are not comparable at all, because one is a percentage and the other is a percentage-point change, so no conclusion can be drawn.", correct: false, misconception: "misapplying the percentage-point-versus-percent distinction to a case where both figures are legitimate percent changes over different populations, a rule pattern-matched from a different context" }
    ] },
  { id: "wu2", type: "B", principle: "A percentage-point change and a percent (relative) change are not interchangeable, and a targeted intervention's effect on its own target population can be real and large even while the population-wide average barely moves.",
    transfer: "Where this generalizes: any \"the average barely moved, so the program failed\" argument needs to check what share of the total population the program actually targeted.",
    prompt: "A hospital network's total nurse turnover fell from 22% to 20% company-wide last year (a 2-percentage-point drop). The ICU turnover rate fell from 40% to 32% (a 20% relative drop) after a new ICU retention bonus. A board member says \"the retention bonus barely moved company turnover, so it must not be working.\" What is the strongest critique of that conclusion?",
    options: [
      { text: "A 2-percentage-point drop and a 20% relative drop are the same size once you convert units, so the board member's comparison is actually valid.", correct: false, misconception: "conflating a percentage-point change with a percent (relative) change as if they were interchangeable" },
      { text: "The ICU is a small share of total nursing staff, so a large relative improvement there can produce only a small dent in the company-wide average; judging the bonus by its effect on the aggregate, rather than on the population it targeted, understates its effect.", correct: true },
      { text: "Turnover rates always regress to the mean over time regardless of any intervention, so neither number tells us anything about the bonus.", correct: false, misconception: "invoking regression to the mean without evidence, as a way to avoid engaging with the actual data" },
      { text: "Because the ICU number improved more in percentage terms, the bonus program should immediately be expanded chain-wide with no further testing.", correct: false, misconception: "extrapolating from one targeted subgroup to a blanket policy without considering that other departments may respond differently" }
    ] },
  { id: "wu3", type: "E", principle: "A reform that removes one actor's incentive to behave a certain way does not automatically fix a different actor's separate mechanism that runs through the same outcome; a single-cause model of a behavior is often wrong when more than one incentive points the same direction.",
    transfer: "Where this generalizes: any \"we fixed the incentive, so the behavior should stop\" claim needs to check whether a second, untouched mechanism can produce the same behavior on its own.",
    prompt: "A city, worried that speeding tickets were a revenue incentive for its police department, passed a law sending all ticket revenue to a state fund instead of the local police budget. Ticket volume barely changed. Which explanation is most consistent with the principle that a reform addressing one actor's incentive can leave a different actor's mechanism untouched?",
    options: [
      { text: "Officers' individual performance reviews and promotion decisions still count ticket volume as a productivity metric, a separate mechanism the revenue reform never touched.", correct: false, misconception: "" },
      { text: "Ticket revenue funds are fungible across government budgets anyway, so redirecting them can never change behavior.", correct: false, misconception: "overgeneralizing a fiscal point about fungibility into a behavioral claim without evidence" },
      { text: "Officers' individual performance reviews and promotion decisions still count ticket volume as a productivity metric, a separate mechanism the revenue reform never touched, so removing the department's financial incentive left the individual officer's career incentive fully intact.", correct: true },
      { text: "The law must not have been enforced properly, since removing the financial incentive should mechanically reduce ticket volume if the theory is right.", correct: false, misconception: "assuming a single-mechanism model with no alternative causal pathway, so any failure to observe the predicted effect must be an enforcement problem rather than a wrong model" }
    ] }
];

const INTRO_QUESTIONS = [
  { id: "intro-c", type: "C", cardClass: "case-card",
    principle: "A vendor's or an internal team's headline productivity number is only as trustworthy as its methodology: whether it compares against a true no-AI baseline, on realistic tasks, in the actual codebase where it will be used.",
    transfer: "Where this generalizes: any \"our tool improved metric X by Y%\" claim, in any domain, should be checked against its comparison group before it is used to justify a decision.",
    prompt: "A mid-sized enterprise software company, DataForge Inc. (a fictional company used for this exercise), is deciding whether to mandate AI coding assistants for its 300-person engineering team, citing GitHub Copilot's enterprise adoption numbers and vendor case studies claiming 30% to 55% productivity gains. Which is the most important weak link DataForge should test before mandating AI tools chain-wide, given what this note has established so far about the gap between rigorous causal studies and adoption or vendor claims?",
    options: [
      { text: "Whether DataForge's engineers will personally enjoy using the new tools, since developer satisfaction is what ultimately predicts a rollout's success.", correct: false, misconception: "substituting a real but secondary concern (satisfaction) for the load-bearing methodological question the case actually turns on" },
      { text: "Whether competitors have already adopted similar tools, since falling behind competitively is the biggest risk of inaction.", correct: false, misconception: "appeal to competitive pressure as a stand-in for evidence, sidestepping the question of whether the claimed effect is real" },
      { text: "Whether the tool vendor offers a discount for a company-wide license versus per-seat pricing.", correct: false, misconception: "treating a negotiating detail as if it were relevant to the underlying evidence question" },
      { text: "Whether the vendor's claimed 30% to 55% gains come from a controlled comparison against a no-AI baseline, on realistic tasks in a codebase like DataForge's own, or from a benchmark or anecdote that does not transfer.", correct: true }
    ] }
];

const BACKGROUND_QUESTIONS = [
  { id: "bg-b", type: "B", tiedChart: "the adoption-versus-belief slope chart above",
    principle: "Two survey lines that rise together can share an upstream cause, mandates, marketing, and social proof, without either one measuring the outcome (output, time, quality) the underlying causal question is actually about.",
    transfer: "Where this generalizes: any \"usage is up and satisfaction is up\" chart, for any product, needs its own outcome measurement before it counts as evidence the product works.",
    prompt: "Between 2024 and 2025, AI-tool adoption among developers rose from about 76% to 90% (DORA), while the share who say AI has increased their personal productivity rose only slightly, from about 75% to over 80%. What does the near-identical, near-simultaneous rise in both lines most likely indicate, rather than prove?",
    options: [
      { text: "That both trends can plausibly share a common cause, social proof, employer mandates, and vendor marketing pushing both usage and stated satisfaction together, without either line telling us whether the tools actually save time.", correct: true },
      { text: "That AI tools mechanically cause the productivity belief, since adoption is the variable plotted first.", correct: false, misconception: "treating chart order or simple covariation as proof of which variable causes which" },
      { text: "That the two survey questions are measuring the same underlying construct twice, so the chart is redundant.", correct: false, misconception: "assuming that two co-moving measures must be identical, when adoption (a behavior) and perceived productivity (a belief) are conceptually distinct" },
      { text: "That because both percentages are now above 75%, the debate about AI coding productivity is effectively settled in AI's favor.", correct: false, misconception: "treating high self-reported adoption and belief as proof of the underlying causal claim, an appeal-to-popularity error" }
    ] }
];

const RQ1_QUESTIONS = [
  { id: "rq1-b", type: "B", tiedChart: "the study-comparison chart above",
    principle: "A number can be \"bigger\" or \"smaller\" than another number without being more or less true if the two were never measuring the same construct on the same population; comparing effect sizes requires matching what was measured and on whom before matching the sign.",
    transfer: "Where this generalizes: any table comparing several studies' headline effect sizes, in medicine, education, or economics, needs a construct-and-population check before the numbers are ranked.",
    prompt: "The chart above places four measured \"AI effect on developer speed\" estimates side by side: METR's early-2025 RCT (developers 19% slower, on a 95% range of 2% to 39% slower), the Microsoft, Accenture, and Fortune-100 field experiments (26.08% more tasks completed per week), and METR's own late-2025 follow-up (roughly 4% to 18% faster, but with wide, zero-crossing ranges and known selection bias toward optimistic developers). Why can these four numbers not simply be ranked from most negative to most positive as if they measured the same thing?",
    options: [
      { text: "Because they were run in different calendar years, and only the most recent number is ever valid.", correct: false, misconception: "assuming recency alone determines validity, without checking methodology" },
      { text: "Because the studies measure genuinely different outcomes (minutes to finish a pre-defined task versus number of tasks completed in a week) on different populations (solo open-source maintainers versus corporate engineers), so a bigger number is not automatically a truer one; comparing them requires matching the construct and population, not just the sign.", correct: true },
      { text: "Because randomized controlled trials can never be compared to each other under any circumstances.", correct: false, misconception: "overgeneralizing a valid caution (check comparability) into a blanket, false rule that RCTs are never comparable" },
      { text: "Because larger sample sizes always produce the correct answer regardless of what is measured, so the 4,867-developer study settles the question.", correct: false, misconception: "assuming sample size alone resolves a construct-validity problem, a common but false heuristic" }
    ] },
  { id: "rq1-c", type: "C", cardClass: "case-card",
    principle: "When participants can opt out of an experiment's control condition, whatever remains in that control group is a biased comparison, and the direction of the bias usually favors the treatment more than the raw numbers show.",
    transfer: "Where this generalizes: any internal company metric gathered from a voluntary opt-in rollout, not a forced randomized comparison, should be treated as an upper-bound-on-adoption number, not a causal effect size.",
    prompt: "A venture-backed engineering-tools startup, ByteRelay (a fictional company used for this exercise), wants to advise its enterprise customers on how to interpret internal \"AI made engineers X% faster\" metrics gathered from a rollout where teams simply chose whether to opt in to the new AI coding assistant. Which methodological flaw should ByteRelay flag as most likely to distort the measured effect, based on what METR's own second study found when it tried to run a similar comparison during a period of high AI enthusiasm?",
    options: [
      { text: "The AI assistant's monthly subscription cost is too high for most enterprise customers to justify regardless of the speedup number.", correct: false, misconception: "raising a pricing objection that is irrelevant to the methodological question actually being asked" },
      { text: "The AI assistant vendor is a private company and therefore cannot be trusted to report the number honestly.", correct: false, misconception: "an ad hominem, motive-based objection rather than a specific methodological critique" },
      { text: "Self-selection into the \"AI-allowed\" group by developers who already expect and want a speedup skews the measured effect, because the comparison is no longer between like tasks and like developers, only between enthusiasts who chose AI and a residual group who did not.", correct: true },
      { text: "Randomized experiments are more expensive to run than simply asking developers how they feel about the tool.", correct: false, misconception: "a true but irrelevant cost observation that does not address which direction the bias runs" }
    ] }
];

const RQ2_QUESTIONS = [
  { id: "rq2-b", type: "B", tiedChart: "the valuation waterfall above",
    principle: "A private company's valuation prices expected future growth in usage and revenue, not a proven, present-day causal effect; a valuation can rise on adoption momentum alone, independent of whether the best current evidence backs the specific productivity story a customer might repeat as the reason they bought the tool.",
    transfer: "Where this generalizes: any hot-technology valuation, from AI tools to a new drug to a new consumer app, should be read as a bet on a growth story, not as a certification that the underlying efficacy claim has been proven.",
    prompt: "Anysphere's (Cursor's) valuation rose from $2.5 billion (Dec 2024) to $9.9 billion (Jun 2025) to $29.3 billion (Nov 2025), even as the single most rigorous causal study of AI coding tools available at the time (METR, published Jul 2025) found the tools slowed experienced developers down. What does that combination most directly suggest about what venture investors are pricing?",
    options: [
      { text: "Investors independently re-ran the METR study internally and concluded it was flawed, then priced the correction into the valuation.", correct: false, misconception: "inventing an unstated fact to resolve the apparent tension, rather than reasoning from what is actually known" },
      { text: "The valuation increase proves the METR study was wrong, since markets are always right about the true value of a technology.", correct: false, misconception: "an efficient-market fallacy applied to a private, illiquid startup valuation, which is not the same as a liquid public market price" },
      { text: "Venture capital valuations are set entirely by revenue multiples and have no relationship to any belief about the product's usefulness.", correct: false, misconception: "overcorrecting into the opposite extreme; growth expectations do reflect some belief about usefulness, just not necessarily the specific causal claim in question" },
      { text: "Investors are pricing growth in usage, revenue, and expected future capability, not a proven, present-day, task-level productivity effect for experienced open-source developers; a valuation can rise on adoption momentum and revenue growth alone, independent of whether the best current causal evidence backs the productivity story a customer might repeat as the reason they bought the tool.", correct: true }
    ] }
];

const RQ3_QUESTIONS = [
  { id: "rq3-b", type: "B", tiedChart: "the system-effects bar chart above",
    principle: "A local, individual-level speedup and a system-level slowdown are not a contradiction if a downstream stage of the same pipeline, testing, review, or release, cannot absorb the increased volume; the two facts can both be true because they describe different stages of one process.",
    transfer: "Where this generalizes: any \"individuals report feeling faster but the whole system slowed down\" pattern in operations should be diagnosed by locating the actual bottleneck, not by dismissing either measurement.",
    prompt: "DORA's 2024 model found that a 25-percentage-point rise in AI adoption was associated with roughly a 1.5% fall in software delivery throughput and a 7.2% fall in delivery stability, even though about three-quarters of individual developers reported feeling more productive. By the 2025 report, the throughput relationship had flipped positive while the stability relationship stayed negative. What is the most defensible reading of this shift?",
    options: [
      { text: "Teams and tooling appear to be learning how to convert individual-level speed into system-level throughput gains faster than they are learning how to prevent the instability that comes with a higher volume of AI-assisted changes, so the two metrics can move in different directions for different reasons.", correct: true },
      { text: "The 2025 result proves AI coding tools are now unambiguously good for software delivery, since throughput turned positive.", correct: false, misconception: "treating one metric's improvement as resolving the whole multi-metric picture, while ignoring that stability stayed negative" },
      { text: "The two years used completely different survey populations, so no comparison between 2024 and 2025 is valid at all.", correct: false, misconception: "assuming any difference in year-to-year survey composition invalidates all comparison, an overcorrection" },
      { text: "Because individual developers report feeling more productive, the system-level metrics must be measuring the wrong thing and should be discarded.", correct: false, misconception: "privileging self-report over a structural, system-level measurement without justification" }
    ] },
  { id: "rq3-c", type: "C", cardClass: "case-card",
    principle: "A workflow that rewards speed and volume, without checking for the specific quality trend a metric like refactoring share or duplication share reveals, can quietly increase technical debt even while every visible dashboard says the team is moving faster.",
    transfer: "Where this generalizes: any process redesign that optimizes a visible speed metric should be checked against a slower-moving quality metric before being called a success.",
    prompt: "A regional bank's engineering VP wants to require AI-assisted code review sign-off on every pull request to \"lock in\" the individual speed gains developers report. Given GitClear's finding that the share of changed code lines classified as refactoring fell from about 25% in 2021 to under 10% by 2024, while copy-pasted (duplicated) code lines rose from 8.3% to 12.3% over 2020 to 2024, what is the strongest reason the VP's plan could increase perceived speed while quietly increasing technical debt?",
    options: [
      { text: "Code review tools cannot process AI-generated code at all, so the sign-off requirement is technically impossible to implement.", correct: false, misconception: "a factually implausible claim offered with no supporting evidence" },
      { text: "A workflow optimized for pushing more AI-drafted code through review faster rewards volume and speed exactly when the underlying code is trending toward more duplication and less refactoring, so a review process that only checks whether the code works risks approving code that ships faster but leaves more duplicated, harder-to-maintain logic for someone else to untangle later.", correct: true },
      { text: "Refactoring is not a relevant activity to code quality, so its decline is irrelevant to technical debt.", correct: false, misconception: "dismissing a directly relevant, well-established quality practice without justification" },
      { text: "Copy-pasted code is always a sign of a bug, so any rise in duplication necessarily means the software is now less reliable.", correct: false, misconception: "overstating what a duplication-share statistic alone can tell you; it is a risk factor and proxy, not a direct defect measurement" }
    ] }
];

const CONCLUSION_QUESTION = { id: "concl-e", type: "E", tiedChart: null,
  principle: "A recommendation built on genuinely mixed evidence should match its rollout pace to where the evidence is actually strongest, and it should state in advance the specific observation that would prove it wrong, rather than treating uncertainty as a reason to do nothing or to do everything.",
  transfer: "Where this generalizes: any technology rollout decision made under real, current scientific disagreement, in medicine, education, or management, benefits from a staged, evidence-matched pace with an explicit falsification test, rather than an all-or-nothing bet.",
  prompt: "An engineering leader, having read this note, is deciding how to roll out AI coding tools across a 500-person organization. Given the evidence that causal effects are genuinely mixed and depend heavily on developer experience level, task type, and codebase maturity, which decision is most directly supported by this note, and what single observation would most threaten (falsify) that decision's underlying thesis?",
  options: [
    { text: "Ban AI coding tools organization-wide until a single definitive study resolves the debate; this would be falsified only if literally every future study agreed with each other, an impossible bar for any complex behavioral question, and one that ignores the mixed but real positive results such as Cui et al.'s 26% task-completion gain.", correct: false, misconception: "setting an impossible falsification bar and overreacting to uncertainty with a blanket ban not supported by the article's own mixed-but-real positive findings" },
    { text: "Mandate AI tools for 100% of tasks immediately, since adoption and belief are both near-universal and rising; this would be falsified only if adoption itself started falling, a weak test, since adoption can stay high even if the tools are net-harmful for some task types.", correct: false, misconception: "using a popularity or adoption metric as if it were evidence of efficacy, the exact substitution the article warns against" },
    { text: "Pilot AI tools task by task and developer by developer, expanding fastest where the evidence (less-experienced developers, well-scoped greenfield tasks, throughput-style metrics) shows the clearest gains, and pulling back where evidence points the other way (senior experts in large, high-standards legacy codebases); this thesis would be falsified if a well-run, adequately powered randomized trial found large, positive, robust speedups specifically for senior developers working in exactly the mature, high-quality-bar codebases where METR measured a slowdown, with the selection-bias concerns from the 2026 follow-up ruled out.", correct: true },
    { text: "Wait five years and let a market leader make the decision first, since following a competitor's lead removes the need to interpret any of this evidence directly; this would be falsified if the market leader's own approach failed publicly, which is really a bet on a different actor's outcome, not a testable thesis about AI coding tools at all.", correct: false, misconception: "outsourcing the decision entirely, which avoids engaging with the evidence and substitutes a different actor's outcome for a testable thesis" }
  ] };

const NUMERIC_QUESTIONS = [
  { id: "bg-d", type: "D", toleranceType: "tight", tolerancePct: 12, target: 2.69, unit: "million paid subscribers", requiresPath: false,
    prompt: "Microsoft reported that GitHub Copilot had 4.7 million paid subscribers in its fiscal Q2 2026 earnings call (period ending around January 2026), up 75% year-over-year. Using only these two facts, estimate how many million paid subscribers GitHub Copilot had a year earlier.",
    tolNote: "Tight tolerance (+/-12%): this is exact algebra from two stated facts, not a judgment call.",
    decomposition: "If the current value is 175% of the prior value (100% plus 75% growth), then prior = current divided by 1.75 = 4.7 / 1.75, about 2.69 million. The lesson: a stated \"grew X% year-over-year\" figure is a ratio to the PRIOR period, not to the current one; always divide the current value by (1 + growth rate), never simply subtract the growth percentage from the current value." },
  { id: "rq2-d", type: "D", toleranceType: "fermi", acceptLow: 18800, acceptHigh: 75200, target: 37600, unit: "engineer-hours per year", requiresPath: true,
    prompt: "A mid-sized software company has 200 engineers, each working roughly 2,000 hours per year. DORA's 2024 model found that a 25-percentage-point rise in AI adoption is associated with roughly a 2.6% fall in time spent on valuable work (time lost to rework, reviewing duplicated or AI-introduced issues, and similar friction). Assume this relationship scales roughly in proportion to adoption, a stated simplifying assumption, not a proven fact, and that this company now has close to universal adoption (about 90 percentage points), matching DORA's 2025 finding. Estimate the company's total AI-tool-related \"lost time\" cost, in engineer-hours per year.",
    tolNote: "Wide tolerance, scored within a factor of 2 either way: this is a genuine Fermi estimate built on a proportional-scaling assumption, not a precise reported number.",
    decomposition: "Decomposition: 200 engineers times 2,000 hours per year equals 400,000 total engineer-hours per year. DORA's coefficient is 2.6% lost per 25 points of adoption; scaling proportionally to 90 points of adoption gives (90/25) times 2.6%, about 9.4% lost. 400,000 times 0.094 is about 37,600 engineer-hours per year, on the order of tens of thousands of hours, or roughly 18 to 19 full-time-equivalent engineers' worth of a year, lost to AI-tool-related friction. The proportional-scaling step is the load-bearing assumption: DORA measured its coefficient around a 25-point range, not a 90-point range, so the true relationship could bend in either direction outside that range, which is exactly why this is a wide-tolerance, order-of-magnitude estimate rather than a precise calculation." }
];

const GLOSSARIES = {
  warmup: [
    { term: "Percentage point", def: "A percentage point is the plain arithmetic difference between two percentages (10% to 12% is a 2-percentage-point rise), while a percent (relative) change divides that difference by the starting value (a 20% rise)." }
  ],
  intro: [
    { term: "Randomized controlled trial (RCT)", def: "An experiment that randomly assigns some participants to use a tool or treatment and others not to, so any measured difference can be attributed to the tool rather than to who chose to use it." },
    { term: "Annualized revenue (ARR)", def: "A company's current recurring revenue multiplied out to a yearly rate, used to describe fast-growing subscription businesses before a full year of results exists." }
  ],
  background: [
    { term: "DORA (DevOps Research and Assessment)", def: "A long-running Google Cloud research program that surveys thousands of software professionals each year to measure which practices predict good software delivery performance." },
    { term: "Software delivery throughput", def: "How quickly and how often a team ships code changes, covering both the speed and the frequency of releases." },
    { term: "Software delivery stability", def: "How reliably shipped changes work once released, covering how often a change causes a failure and how quickly a team recovers from one." }
  ],
  rq1: [
    { term: "Standard error (SE)", def: "A measure of how much an estimate would likely bounce around if you repeated the same study again; a bigger standard error means a less precise estimate." },
    { term: "Confidence interval (CI)", def: "A range around an estimate that is likely, though not certain, to contain the true value; a wide interval signals a less precise estimate than a narrow one." },
    { term: "Selection bias", def: "A distortion that occurs when the people or cases included in a study are not a representative sample of the group you actually want to learn about." }
  ],
  rq2: [
    { term: "Valuation", def: "The price investors implicitly assign to an entire company in a funding round, calculated from how much money they pay for what share of ownership." },
    { term: "Funding round", def: "A single event in which a company sells a batch of new ownership shares to investors in exchange for cash." }
  ],
  rq3: [
    { term: "Refactoring", def: "Rewriting existing code to be cleaner or more reusable without changing what it does, considered a core practice for keeping a codebase easy to maintain." },
    { term: "Technical debt", def: "The extra future work created when code is written quickly or sloppily now, in exchange for short-term speed." }
  ],
  learning: [
    { term: "Pre-mortem", def: "Imagining in advance that a plan has already failed, and naming the most likely reason, to surface risks before they occur." },
    { term: "Disconfirming evidence", def: "The observation that would count against your own conclusion, as opposed to evidence that supports it." },
    { term: "Falsification", def: "Stating in advance what would have to be observed for your claim to be judged wrong." }
  ]
};

const SOURCES = [
  { name: "Joel Becker, Nate Rush, Beth Barnes, David Rein, \"Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity,\" METR Blog / arXiv:2507.09089, 10 July 2025", url: "https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/", supports: "16 experienced open-source developers, 246 tasks; AI-allowed tasks took 19% longer than AI-disallowed (95% CI: +2% to +39%); developers forecast a 24% speedup before starting and, even after the slowdown, still believed AI had sped them up by 20%; developers paid $150/hour; tools primarily Cursor Pro with Claude 3.5/3.7 Sonnet." },
  { name: "Joel Becker, Nate Rush, Tom Cunningham, David Rein, Khalid Mahamud, \"We are Changing our Developer Productivity Experiment Design,\" METR Blog, 24 February 2026", url: "https://metr.org/blog/2026-02-24-uplift-update/", supports: "Second study: 57 developers (10 from the original study plus 47 new), 143 repos, 800+ tasks, paid $50/hour; matched-subset estimated speedup of 18% faster (95% CI: -9% to +38%, in this article's sign convention); new-recruit estimated speedup of 4% faster (95% CI: -9% to +15%); 30% to 50% of developers reported avoiding submission of tasks they did not want to do without AI; researchers state the estimate is likely a lower bound on the true effect." },
  { name: "Zheyuan Cui, Mert Demirer, Sonia Jaffe, Leon Musolff, Sida Peng, Tobias Salz, \"The Effects of Generative AI on High-Skilled Work: Evidence from Three Field Experiments with Software Developers,\" SSRN Working Paper 4945566, revised 10 February 2025", url: "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4945566", supports: "Three randomized field experiments at Microsoft, Accenture, and an anonymous Fortune 100 company, combined 4,867 developers; 26.08% increase in completed tasks among developers using the AI coding assistant (standard error 10.3%); less experienced developers had higher adoption rates and greater productivity gains." },
  { name: "DORA (Google Cloud), Accelerate State of DevOps Report 2024, as detailed by Rachel Stephens, \"DORA Report 2024 - A Look at Throughput and Stability,\" RedMonk, 26 November 2024", url: "https://redmonk.com/rstephens/2024/11/26/dora2024/", supports: "75.9% of survey respondents report relying on AI for part of their job; 75% report productivity gains from AI; a 25-percentage-point rise in AI adoption is associated with an estimated 2.6% fall in time spent on valuable work, a 1.5% fall in delivery throughput, and a 7.2% fall in delivery stability." },
  { name: "Nathen Harvey, Derek DeBellis, \"Announcing the 2025 DORA Report: State of AI-Assisted Software Development,\" Google Cloud Blog, 23 September 2025", url: "https://cloud.google.com/blog/products/ai-machine-learning/announcing-the-2025-dora-report", supports: "Survey of nearly 5,000 technology professionals; 90% report using AI at work; more than 80% believe it increased their productivity; 30% report little or no trust in AI-generated code; AI adoption's relationship with delivery throughput turned positive, a reversal from 2024, while its relationship with delivery stability remained negative." },
  { name: "Tony Redmond, \"Microsoft FY26 Q2 Results: 450 Million Microsoft 365 Seats,\" Office 365 for IT Pros, 30 January 2026, reporting Microsoft's FY26 Q2 earnings release of 28 January 2026", url: "https://office365itpros.com/2026/01/30/microsoft-fy26-q2-results/", supports: "GitHub Copilot reported at 4.7 million paid subscribers, up 75% year-over-year, as stated on Microsoft's fiscal Q2 2026 earnings call." },
  { name: "Marina Temkin, \"Cursor's Anysphere nabs $9.9B valuation, soars past $500M ARR,\" TechCrunch, 5 June 2025", url: "https://techcrunch.com/2025/06/05/cursors-anysphere-nabs-9-9b-valuation-soars-past-500m-arr/", supports: "Anysphere raised $900 million at a $9.9 billion valuation in June 2025, its third fundraise in under a year, up from a $2.5 billion pre-money valuation on a $100 million raise in December 2024; annualized revenue surpassed $500 million, up from $300 million reported in mid-April 2025." },
  { name: "CNBC, \"AI startup Cursor raises $2.3 billion funding round at $29.3 billion valuation,\" 13 November 2025", url: "https://www.cnbc.com/2025/11/13/cursor-ai-startup-funding-round-valuation.html", supports: "Anysphere raised $2.3 billion at a $29.3 billion valuation in November 2025, with new investors including Coatue, Nvidia, and Google." },
  { name: "GitClear, \"AI Copilot Code Quality: 2025 Look Back at 12 Months of Data,\" gitclear.com, 2025, analyzing 211 million changed lines from 2020 to 2024 across repositories owned by Google, Microsoft, Meta, and enterprise C-corps", url: "https://www.gitclear.com/ai_assistant_code_quality_2025_research", supports: "Share of changed code lines classified as refactoring fell from 25% (2021) to under 10% (2024); share of copy-pasted (cloned) code lines rose from 8.3% (2020) to 12.3% (2024); Stack Overflow's 2024 Developer Survey found 63% of professional developers currently use AI in their development process." },
  { name: "Gergely Orosz, \"Stack overflow is almost dead,\" The Pragmatic Engineer, 15 May 2025 (updated 19 May 2025)", url: "https://blog.pragmaticengineer.com/stack-overflow-is-almost-dead/", supports: "Stack Overflow's monthly question volume, tracked via the site's own Data Explorer, fell to levels last seen at the site's 2009 launch by May 2025; the decline accelerated sharply after ChatGPT's November 2022 launch." }
];

/* ============================== HELPERS ============================== */

function tightScore(guess, target, tolPct) {
  if (guess === null || guess === undefined || isNaN(guess)) return false;
  return Math.abs(guess - target) / target * 100 <= tolPct;
}
function fermiScore(guess, lo, hi) {
  if (guess === null || guess === undefined || isNaN(guess)) return false;
  return guess >= lo && guess <= hi;
}
function axisPct(val, lo, hi) {
  const clamped = Math.max(lo, Math.min(hi, val));
  return ((clamped - lo) / (hi - lo)) * 100;
}

/* ============================== SHARED UI ============================== */

function Glossary({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="glossary-panel">
      <div className="glossary-label">Glossary</div>
      <ul>{items.map((g, i) => <li key={"gl-" + i}><strong>{g.term}</strong> — {g.def}</li>)}</ul>
    </div>
  );
}

function ChartMeta({ tier, note }) {
  const cls = tier === "FACT" ? "tier-fact" : tier === "ESTIMATE" ? "tier-estimate" : "tier-illustration";
  return (
    <div className="chart-meta">
      <span className={"tier-badge " + cls}>{tier}</span>
      <span>{note}</span>
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
          <div className="interp-prompt" key={"ip-" + i}>
            <div className="interp-kind">{p.label}</div>
            <div className="interp-question">{p.prompt}</div>
            {!isSubmitted && (
              <div className="interp-input-row">
                <textarea
                  placeholder="Type your answer here (at least 15 characters)..."
                  value={drafts[i]}
                  onChange={(e) => { const next = drafts.slice(); next[i] = e.target.value; setDrafts(next); }}
                />
                <button className="btn-secondary" disabled={drafts[i].trim().length < 15}
                  onClick={() => onSubmit(chartKey, i, drafts[i])}>
                  Submit answer
                </button>
              </div>
            )}
            {isSubmitted && (
              <div className="interp-revealed">
                <span className="tag-you">Your answer</span>
                <p>{values[i]}</p>
                <span className="tag-authored">Compare your answer to the authored one</span>
                <p>{p.authored}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ChartCard({ chartKey, title, tier, note, children, interpState, onInterpSubmit }) {
  const prompts = CHART_PROMPTS[chartKey];
  return (
    <div className="chart-card">
      <div className="chart-title">{title}</div>
      {children}
      <ChartMeta tier={tier} note={note} />
      <ChartInterpretation chartKey={chartKey} prompts={prompts} submitted={interpState.submitted}
        values={interpState.values} onSubmit={onInterpSubmit} />
    </div>
  );
}

function MultipleChoice({ q, state, onSubmit }) {
  const [selected, setSelected] = useState(null);
  const letters = ["A", "B", "C", "D"];
  const submitted = state && state.submitted;
  return (
    <div className={"question-card " + (q.cardClass || "")}>
      {q.cardClass === "case-card" && <div className="case-label">Case Prompt</div>}
      <div className="q-prompt">{q.prompt}</div>
      <div className="options-list">
        {q.options.map((opt, i) => {
          let cls = "option-card";
          if (!submitted && selected === i) cls += " option-selected";
          if (submitted) {
            if (opt.correct) cls += " option-correct";
            else if (state.selectedOption === i) cls += " option-wrong";
          }
          return (
            <div key={"opt-" + i} className={cls} onClick={() => !submitted && setSelected(i)}>
              <span className="option-letter">{letters[i]}.</span>
              <span>{opt.text}</span>
            </div>
          );
        })}
      </div>
      {!submitted && (
        <button className="btn-primary" disabled={selected === null}
          onClick={() => onSubmit(q.id, selected, q.options[selected].correct)}>
          Submit answer
        </button>
      )}
      {submitted && (
        <div className={"explanation-block " + (state.isCorrect ? "explanation-correct" : "explanation-wrong")}>
          <div>{state.isCorrect
            ? "Correct — and this reasoning generalizes beyond this article."
            : "Incorrect — this answer reflects " + (q.options[state.selectedOption].misconception || "a reasoning gap") + "."}</div>
          <div className="principle-line">Portable principle: {q.principle}</div>
          <div className="transfer-line">{q.transfer}</div>
        </div>
      )}
    </div>
  );
}

function NumericQuestion({ q, state, onSubmit }) {
  const [val, setVal] = useState("");
  const [path, setPath] = useState("");
  const submitted = state && state.submitted;
  const canSubmit = val !== "" && !isNaN(parseFloat(val)) && (!q.requiresPath || path.trim().length >= 10);

  function handleSubmit() {
    const guess = parseFloat(val);
    const isCorrect = q.toleranceType === "tight"
      ? tightScore(guess, q.target, q.tolerancePct)
      : fermiScore(guess, q.acceptLow, q.acceptHigh);
    const signedErrorPct = (guess - q.target) / q.target * 100;
    onSubmit(q.id, guess, isCorrect, signedErrorPct, path);
  }

  const lo = q.toleranceType === "tight" ? q.target * 0.4 : q.acceptLow * 0.4;
  const hi = q.toleranceType === "tight" ? q.target * 1.8 : q.acceptHigh * 1.6;

  return (
    <div className="question-card">
      <div className="q-prompt">{q.prompt}</div>
      {!submitted && (
        <div>
          {q.requiresPath && (
            <textarea className="path-textarea" placeholder="Name your decomposition path (the factors you will multiply)..."
              value={path} onChange={(e) => setPath(e.target.value)} />
          )}
          <div className="numeric-input-row">
            <input type="number" step="any" value={val} onChange={(e) => setVal(e.target.value)} placeholder="your estimate" />
            <span>{q.unit}</span>
          </div>
          <input className="numeric-slider" type="range" min={lo} max={hi} step={(hi - lo) / 200}
            value={val === "" ? (lo + hi) / 2 : val} onChange={(e) => setVal(e.target.value)} />
          <div className="chart-meta"><span>{q.tolNote}</span></div>
          <button className="btn-primary" disabled={!canSubmit} onClick={handleSubmit}>Submit answer</button>
        </div>
      )}
      {submitted && (
        <div>
          <div className="axis-track">
            <div className="axis-marker" style={{ left: axisPct(state.numericValue, lo, hi) + "%" }}>You: {state.numericValue}</div>
            <div className="axis-dot" style={{ left: axisPct(state.numericValue, lo, hi) + "%", background: "#2563eb" }}></div>
            <div className="axis-marker" style={{ left: axisPct(q.target, lo, hi) + "%", top: "30px" }}>Actual: {q.target}</div>
            <div className="axis-dot" style={{ left: axisPct(q.target, lo, hi) + "%", top: "26px", background: "#16a34a" }}></div>
          </div>
          <div className={"explanation-block " + (state.isCorrect ? "explanation-correct" : "explanation-wrong")}>
            <div>{state.isCorrect
              ? "Within tolerance — the decomposition below confirms the path."
              : "Outside tolerance — the specific reasoning error is usually skipping one factor in the chain, most often the scaling assumption or the base value being reversed."} Signed error: {state.signedErrorPct.toFixed(1)}%.</div>
            {state.path && state.path.length > 0 && (
              <div className="transfer-line">Your stated path: {state.path}</div>
            )}
            <div className="principle-line">How to estimate this: {q.decomposition}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== CHARTS ============================== */

function DoraSlopeChart() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={DORA_SLOPE} margin={{ top: 24, right: 30, left: 4, bottom: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis dataKey="stage" tick={{ fontSize: 12 }} interval={0} />
        <YAxis domain={[60, 100]} tick={{ fontSize: 11 }}
          label={{ value: "% of surveyed developers", angle: -90, position: "insideLeft", fontSize: 10 }} />
        <Tooltip formatter={(v) => v + "%"} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="linear" dataKey="adoption" name="Report using AI tools at work"
          stroke="#dc2626" strokeWidth={3} dot={{ r: 6 }}>
          <LabelList dataKey="adoption" position="top" fontSize={12} formatter={(v) => v + "%"} />
        </Line>
        <Line type="linear" dataKey="belief" name="Report AI increased their productivity"
          stroke="#2563eb" strokeWidth={3} dot={{ r: 6 }}>
          <LabelList dataKey="belief" position="bottom" fontSize={12} formatter={(v) => v + "%"} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}

function CodeCompositionChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={CODE_COMPOSITION} margin={{ top: 20, right: 16, left: 4, bottom: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="year" tick={{ fontSize: 12 }} interval={0} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }}
          label={{ value: "% of changed code lines", angle: -90, position: "insideLeft", fontSize: 10 }} />
        <Tooltip formatter={(v) => v + "%"} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="copyPasted" stackId="cc" name="Copy-pasted (cloned) lines" fill="#dc2626">
          <LabelList dataKey="copyPasted" position="inside" formatter={(v) => v + "%"} fill="#fff" fontSize={12} />
        </Bar>
        <Bar dataKey="otherCode" stackId="cc" name="All other changed lines" fill="#d1d5db">
          <LabelList dataKey="otherCode" position="inside" formatter={(v) => v + "%"} fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function StudyRangeChart() {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <ComposedChart data={STUDY_RANGES} layout="vertical" margin={{ top: 20, right: 40, left: 10, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
        <XAxis type="number" domain={[-45, 55]} tick={{ fontSize: 11 }}
          label={{ value: "Estimated effect on developer speed (%). Positive = faster/more output. Negative = slower.", position: "insideBottom", offset: -18, fontSize: 9 }} />
        <YAxis type="category" dataKey="study" width={230} tick={{ fontSize: 9.5 }} />
        <Tooltip formatter={(v, n) => (n === "barSpan" ? ["range", "95% range"] : v)} />
        <ReferenceLine x={0} stroke="#9ca3af" strokeDasharray="4 4" />
        <Bar dataKey="base" stackId="rng" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="barSpan" stackId="rng" name="Approximate 95% range" fill="#d1d5db" isAnimationActive={false} />
        <Scatter dataKey="pointEst" name="Point estimate" fill="#dc2626" isAnimationActive={false}>
          <LabelList dataKey="pointEst" position="right" fontSize={10} formatter={(v) => (v > 0 ? "+" + v + "%" : v + "%")} />
        </Scatter>
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function ValuationWaterfallChart() {
  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={VALUATION_WATERFALL} margin={{ top: 28, right: 16, left: 4, bottom: 84 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-38} textAnchor="end" height={100} />
        <YAxis domain={[0, 32]} tick={{ fontSize: 11 }}
          label={{ value: "$ billions", angle: -90, position: "insideLeft", fontSize: 10 }} />
        <Tooltip formatter={(v, n) => (n === "barHeight" ? ["$" + v + "bn", "magnitude"] : v)} />
        <Bar dataKey="base" stackId="wf" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="barHeight" stackId="wf" isAnimationActive={false}>
          {VALUATION_WATERFALL.map((entry, i) => (
            <Cell key={"wf-cell-" + i}
              fill={entry.kind === "total" ? "#111" : "#dc2626"} />
          ))}
          <LabelList dataKey="shown" position="top" fontSize={10}
            formatter={(v) => "$" + v + "bn"} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function SystemEffectsBarChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={DORA_2024_EFFECTS} layout="vertical" margin={{ top: 20, right: 40, left: 10, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
        <XAxis type="number" domain={[-8, 0.5]} tick={{ fontSize: 11 }}
          label={{ value: "Estimated effect of a 25pp rise in AI adoption (%)", position: "insideBottom", offset: -14, fontSize: 10 }} />
        <YAxis type="category" dataKey="outcome" width={190} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => v + "%"} />
        <Bar dataKey="effect" name="Modeled effect" fill="#dc2626" isAnimationActive={false} barSize={28}>
          <LabelList dataKey="effect" position="left" fontSize={11} formatter={(v) => v + "%"} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ============================== SECTION WRAPPER ============================== */

function SectionWrapper({ id, title, kicker, children }) {
  return (
    <section id={id} style={{ scrollMarginTop: "70px" }}>
      {kicker && <div className="subhead-label">{kicker}</div>}
      {title && <h2>{title}</h2>}
      {children}
    </section>
  );
}

/* ============================== SECTIONS ============================== */

function WarmUpSection({ mcState, onMcSubmit }) {
  return (
    <SectionWrapper id="sec-warmup" title="Warm-Up: What Stuck?">
      <p>Before turning to AI coding tools, put three principles from recent installments of this series to work on unfamiliar problems. None of the three questions below is about software developers. They test whether the reasoning transfers, not whether you remember the earlier articles.</p>
      {WARMUP_QUESTIONS.map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <Glossary items={GLOSSARIES.warmup} />
    </SectionWrapper>
  );
}

function IntroSection({ mcState, onMcSubmit }) {
  return (
    <SectionWrapper id="sec-intro" title="Introduction">
      <p>AI coding assistants are the fastest-adopted developer tool in memory, and the people using them say the tools make them faster. The single most rigorous test of that belief found the opposite.</p>
      <p>By 2025, 90% of developers surveyed by DORA reported using AI at work, and more than 80% said it increased their productivity (Google Cloud, 2025). GitHub Copilot had grown to 4.7 million paid subscribers, up 75% year-over-year (Microsoft, reported Jan 2026), and Cursor's maker, Anysphere, saw its valuation climb from $2.5 billion to $9.9 billion to $29.3 billion in eleven months (TechCrunch, 2025; CNBC, 2025). Yet a randomized controlled trial run by METR, a nonprofit research group, on 16 experienced open-source developers found that when they were allowed to use AI tools, they took 19% longer to finish real tasks than when they were not (METR, 2025). The same developers, both before and after the study, believed the tools had sped them up by about 20%.</p>
      <p>That is not a small gap. It is a 39-point difference between what these developers felt was true and what a controlled comparison measured. Conventional wisdom about new productivity tools assumes that widespread adoption and strong self-reported satisfaction are, at minimum, weak evidence the tool works. Here, the group with the most hands-on experience and the strongest incentive to notice a slowdown was still wrong about its own direction, not just its size.</p>
      <p>The picture gets more complicated, not simpler, once other studies enter the frame. A separate set of field experiments at Microsoft, Accenture, and an anonymous Fortune 100 company, covering 4,867 developers, found a 26% increase in completed tasks per week among developers using an AI coding assistant, with the largest gains going to less experienced developers (Cui et al., 2025). Both studies are careful, peer-reviewed-adjacent randomized work. Both cannot be simply averaged into one number, because they measure different things on different people.</p>
      <p>This note addresses three questions: First, when independent, rigorous experiments test AI coding tools against a no-AI control, what do they actually find, and why do the studies disagree with each other as much as they do? Second, if the causal evidence is this genuinely mixed, why do developers and their employers overwhelmingly believe, and invest as if, AI makes them faster? Third, what is the aggregate, system-level effect of AI coding adoption on software organizations, and does faster even mean better?</p>
      {INTRO_QUESTIONS.map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <Glossary items={GLOSSARIES.intro} />
    </SectionWrapper>
  );
}

function BackgroundSection({ chartInterp, onInterpSubmit, mcState, numState, onMcSubmit, onNumSubmit }) {
  const numQ = NUMERIC_QUESTIONS.find((q) => q.id === "bg-d");
  return (
    <SectionWrapper id="sec-background" title="Background">
      <h3>2A. Trajectory: From Optional Extra to Near-Universal Habit</h3>
      <p>AI coding assistants moved from a novelty to a daily habit in under three years. GitHub Copilot exited technical preview and reached general availability in 2022. By 2024, Stack Overflow's own Developer Survey found 63% of professional developers already used AI in their development process, with another 14% planning to start soon (cited in GitClear, 2025). DORA's 2024 survey put developer AI adoption at about 76%, and by its 2025 survey that figure had risen to 90% (Google Cloud, 2024; Google Cloud, 2025).</p>
      <p>Self-reported belief about the tools rose alongside adoption, though slightly more slowly. In 2024, about 75% of developers told DORA that AI had increased their personal productivity; by 2025, that share had passed 80%. The chart below places the two trends side by side.</p>
      <ChartCard chartKey="chart1" title="Chart 1. AI-Tool Adoption vs. Self-Reported Productivity Belief Among Developers, 2024 to 2025"
        tier="FACT" note="DORA (Google Cloud) 2024 report, as detailed by RedMonk, 26 Nov 2024 (adoption 75.9%, productivity belief 75%); DORA 2025 report, Google Cloud Blog, 23 Sep 2025 (adoption 90%, productivity belief over 80%)."
        interpState={chartInterp.chart1} onInterpSubmit={onInterpSubmit}>
        <DoraSlopeChart />
      </ChartCard>
      <p>The comparison set for this trajectory is instructive. Few enterprise software categories reach 90% self-reported daily use within roughly three years of general availability; most spreadsheet, database, and cloud tools took a decade or more to reach comparable saturation among professional users. The closest historical parallel inside software development itself is the shift to cloud infrastructure, which took most of the 2010s to reach similar adoption levels among engineering teams. AI coding tools compressed a decade-scale diffusion curve into a few years.</p>
      <h3>2B. Structural Transformation: Capital Is Moving Faster Than Proof</h3>
      <p>The capital backing this category grew even faster than developer adoption. Anysphere, the maker of the AI coding tool Cursor, raised $100 million at a $2.5 billion valuation in December 2024, then $900 million at a $9.9 billion valuation in June 2025, on annualized revenue that had just crossed $500 million, up from $300 million reported barely two months earlier (TechCrunch, 2025). By November 2025, a further $2.3 billion round valued the company at $29.3 billion (CNBC, 2025). The chart below bridges these three funding events.</p>
      <ChartCard chartKey="chart4" title="Chart 2. Anysphere (Cursor) Valuation Bridge Across Three Funding Rounds, Dec 2024 to Nov 2025"
        tier="ESTIMATE" note="Round-end valuations are FACT (TechCrunch, 5 Jun 2025; CNBC, 13 Nov 2025). The step-up between each pair of totals is an ESTIMATE by subtraction, not a separately reported figure. $ billions."
        interpState={chartInterp.chart4} onInterpSubmit={onInterpSubmit}>
        <ValuationWaterfallChart />
      </ChartCard>
      <p>This is the structural gap that creates the central tension of this article. Money, usage, and stated belief are all rising on a similar, compressed timeline, while the single strongest piece of causal evidence available during this same period, METR's randomized trial, found a slowdown, not a speedup, for a specific population of experienced developers. A market can price and scale a technology category well before the underlying efficacy question for any specific use case is settled; nothing about the size of the capital flow or the adoption curve, by itself, resolves the causal debate this note exists to walk through.</p>
      {BACKGROUND_QUESTIONS.map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <NumericQuestion q={numQ} state={numState[numQ.id]} onSubmit={onNumSubmit} />
      <Glossary items={GLOSSARIES.background} />
    </SectionWrapper>
  );
}

function RQ1Section({ chartInterp, onInterpSubmit, mcState, onMcSubmit }) {
  return (
    <SectionWrapper id="sec-rq1" title="Section 3. Why Do Rigorous Experiments Disagree With Each Other?">
      <p>The first research question asks what happens when researchers stop trusting self-reported speed and instead randomly assign some developers to use AI tools and others not to, then measure a real outcome. The honest answer is that the studies disagree, sometimes sharply, and understanding why requires taking each study's specific design seriously rather than averaging the headlines together.</p>
      <p>The obstacle to be quantified is the METR result itself, because it is the study best matched to the question of individual causal effect. METR recruited 16 experienced open-source developers, each averaging five years of experience on the specific mature repository they worked on, and had them complete 246 real issues, bug fixes, features, and refactors, each averaging about two hours. Half of each developer's issues were randomly assigned to allow AI tools, and half to disallow them. Developers using AI tools took 19% longer to finish, with a 95% range of 2% to 39% longer (METR, 2025).</p>
      <ChartCard chartKey="chart3" title="Chart 3. Four Measured Estimates of AI's Effect on Developer Speed"
        tier="ESTIMATE" note="METR figures are FACT, sign-flipped here to a single positive-equals-faster axis for comparability across studies (METR, 10 Jul 2025 and 24 Feb 2026). Cui et al.'s approximate 95% range is an ESTIMATE, computed as the reported point estimate plus or minus about 1.96 times the reported standard error (Cui et al., SSRN, rev. 10 Feb 2025); the point estimate itself is FACT."
        interpState={chartInterp.chart3} onInterpSubmit={onInterpSubmit}>
        <StudyRangeChart />
      </ChartCard>
      <p>The evidence for taking the slowdown seriously, rather than dismissing it as a fluke, is in how carefully METR ruled out simpler explanations. The developers used frontier models, mostly Cursor Pro with Claude 3.5 or 3.7 Sonnet, complied with their random assignment, did not selectively drop the hardest AI-disallowed issues, and submitted similarly reviewable pull requests with and without AI. METR tested 20 candidate explanations for the slowdown and found evidence for five, none of which was simple non-compliance or a broken study design.</p>
      {RQ1_QUESTIONS.filter((q) => q.id === "rq1-b").map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <p>The evidence against reading this as the final word is just as important. The Cui et al. field experiments studied a different population (corporate developers assigned an AI coding assistant as part of ordinary business operations, not open-source maintainers working on their own long-tenured projects) and a different outcome (weekly task-completion counts, not minutes to finish a specific pre-defined task). Less experienced developers gained the most. Nothing about that result contradicts METR; the two studies are simply not measuring the same construct on the same people, which is precisely why one cannot be used to overrule the other.</p>
      {RQ1_QUESTIONS.filter((q) => q.id === "rq1-c").map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <p>METR's own attempt to re-run its study roughly six months later, in a period of much wider AI adoption, adds a further layer. The point estimate flipped toward a speedup, roughly 18% faster for the original developers and 4% faster for newly recruited ones, but the ranges are wide and cross zero, and METR itself attributes the shift partly to a selection problem: 30% to 50% of developers in the second study declined to submit tasks they did not want to attempt without AI, meaning the hardest-to-measure, highest-uplift tasks were quietly removed from the comparison (METR, 2026).</p>
      <p>The honest section-level conclusion is that no single number describes "the effect of AI coding tools." The effect measured depends on who is studied (expert maintainers of mature codebases versus corporate developers with more typical experience levels), what is measured (minutes per pre-defined task versus tasks completed per week), and when the study was run, since the tools themselves, and developers' skill in using them, keep changing. A debate conducted by picking whichever single number supports a prior view is not engaging with this evidence; it is cherry-picking it.</p>
      <Glossary items={GLOSSARIES.rq1} />
    </SectionWrapper>
  );
}

function RQ2Section({ chartInterp, onInterpSubmit, mcState, numState, onMcSubmit, onNumSubmit }) {
  const numQ = NUMERIC_QUESTIONS.find((q) => q.id === "rq2-d");
  return (
    <SectionWrapper id="sec-rq2" title="Section 4. If the Evidence Is Mixed, Why Does Belief and Investment Keep Outrunning It?">
      <p>The second research question challenges the assumption that adoption and investment should track the strength of causal evidence. They do not, and the reason is not that developers or investors are being irrational; it is that adoption, belief, and capital are each responding to a different signal than "does a controlled comparison show a speedup."</p>
      <p>Start with the individual developer. METR's own data on belief is the clearest illustration available: the same 16 developers who were measurably 19% slower with AI tools forecast a 24% speedup before the study began, and even after living through the slowdown, still estimated they had been sped up by about 20% (METR, 2025). A felt sense of speed, driven by a more pleasant experience, less typing, momentum from watching code appear, is a genuinely different measurement than a stopwatch, and self-report is the input that drives most individual and organizational adoption decisions, not the stopwatch.</p>
      <p>Capital markets respond to a still different signal: growth in usage and revenue, not a specific causal claim about task-level speed. The waterfall shown in the Background section traced Anysphere's valuation from $2.5 billion to $29.3 billion in eleven months. That timeline overlaps almost exactly with the publication of METR's slowdown finding in July 2025, which fell between the company's second and third rounds. Revenue and user growth kept accelerating regardless.</p>
      {RQ2_QUESTIONS.map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <p>The counter-argument deserves a fair hearing, because dismissing all of this as pure hype would be its own error. Cui et al.'s 26% task-completion gain, concentrated among less experienced developers, is real, causally identified evidence of a genuine productivity effect, just not evidence that generalizes to every population or every outcome measure. A rational investor could reasonably bet that the population and use cases where the tools work best (junior developers, well-scoped tasks, high-volume corporate development) are also the largest addressable market, even while a specific harder case (senior experts inside mature, high-standards codebases) shows the opposite effect.</p>
      <p>Employer mandates add a third, non-market force behind adoption that has nothing to do with either the causal evidence or a pure profit motive. Once a category reaches 90% adoption and becomes a visible line item in engineering-tool budgets, an individual engineering leader who declines to mandate the tools bears a career risk (looking behind the curve) that is independent of whether the tools actually help their specific team. That incentive pushes adoption upward regardless of which study is correct.</p>
      <NumericQuestion q={numQ} state={numState[numQ.id]} onSubmit={onNumSubmit} />
      <p>The section's conclusion is that belief, capital, and causal evidence are three different signals moving on three different logics, individual perception, growth expectations, and controlled measurement, and none of the three is obligated to track the other two. Watching only one of them, whichever one currently supports your prior view, will give a confident but incomplete picture.</p>
      <Glossary items={GLOSSARIES.rq2} />
    </SectionWrapper>
  );
}

function RQ3Section({ chartInterp, onInterpSubmit, mcState, onMcSubmit }) {
  return (
    <SectionWrapper id="sec-rq3" title="Section 5. Does Faster Even Mean Better for the Organization?">
      <p>The third research question moves from the individual task to the whole organization, because an organization does not ship individual tasks; it ships a continuous stream of changes through review, testing, and release. DORA's annual survey is the largest available data source on this system-level question, and its findings complicate the simple story that faster individual coding means a faster, healthier engineering organization.</p>
      <p>DORA's 2024 survey modeled the relationship between AI adoption and three delivery outcomes. A 25-percentage-point rise in AI adoption was associated with an estimated 2.6% fall in time spent on valuable work, a 1.5% fall in delivery throughput, and a 7.2% fall in delivery stability, even though about 75% of individual developers in the same survey reported feeling more productive (Google Cloud, 2024, as detailed by RedMonk, 2024).</p>
      <ChartCard chartKey="chart5" title="Chart 4. DORA 2024: Modeled Effect of a 25-Percentage-Point Rise in AI Adoption on Three Delivery Outcomes"
        tier="FACT" note="DORA (Google Cloud) 2024 report, as detailed by RedMonk, 26 Nov 2024. Horizontal bar chosen because there are only three categories, all in the same unit and from a single model, so this is a simple magnitude read rather than a rank-across-many-entities comparison."
        interpState={chartInterp.chart5} onInterpSubmit={onInterpSubmit}>
        <SystemEffectsBarChart />
      </ChartCard>
      {RQ3_QUESTIONS.filter((q) => q.id === "rq3-b").map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <p>By the 2025 survey, the picture had shifted in one dimension but not another. AI adoption's relationship with delivery throughput turned positive, a genuine reversal from 2024, while its relationship with delivery stability remained negative (Google Cloud, 2025). DORA's own interpretation is that teams and tooling are learning to convert individual speed into system-level throughput, but have not yet learned to prevent the instability that comes with a higher volume of AI-assisted changes moving through the pipeline.</p>
      <p>A second, independent line of evidence points at a mechanism for exactly that instability risk: what is actually happening inside the code itself. GitClear's analysis of 211 million changed lines across repositories owned by Google, Microsoft, Meta, and enterprise C-corps found that the share of changed lines classified as refactoring, rewriting existing code to be cleaner without changing what it does, fell from about 25% in 2021 to under 10% by 2024, while the share of copy-pasted (cloned) code lines rose from 8.3% to 12.3% over the same broader window (GitClear, 2025).</p>
      <ChartCard chartKey="chart2" title="Chart 5. Composition of Changed Code Lines: Copy-Pasted vs. All Other Code, 2020 vs. 2024"
        tier="FACT" note="Copy-pasted share is FACT (GitClear, 2025, analyzing 211 million changed lines, 2020-2024). \"All other changed lines\" is an ESTIMATE, the arithmetic residual (100 minus the copy-pasted share); GitClear does not report a single combined \"all other code\" category."
        interpState={chartInterp.chart2} onInterpSubmit={onInterpSubmit}>
        <CodeCompositionChart />
      </ChartCard>
      {RQ3_QUESTIONS.filter((q) => q.id === "rq3-c").map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <p>The counter-argument here is that a rising duplication share and a falling refactoring share are still each a minority pattern inside a much larger, mostly unchanged codebase, and organizations that pair AI adoption with disciplined code review can plausibly avoid the worst of this drift. GitClear's own framing supports this: the finding is a warning about direction and rate of change, not proof that every AI-assisted codebase is degrading, and the fix lives in process discipline rather than in avoiding the tools.</p>
      <p>The honest section-level conclusion is that "faster" and "better" are not the same claim, and an organization that only tracks individual-level self-reported speed has no visibility into whether it is trading a small amount of throughput for a much larger amount of instability and long-run maintenance cost. The 2025 throughput reversal is genuinely encouraging evidence that this trade-off can improve with experience; the persistently negative stability relationship is evidence it has not yet been solved.</p>
      <Glossary items={GLOSSARIES.rq3} />
    </SectionWrapper>
  );
}

function LearningSummarySection({ mcState, numState, applyA, setApplyA, applyB, setApplyB, applyEval, onEvaluate, govInsight, setGovInsight, insightRevealed, onRevealInsight }) {
  const allMc = [...WARMUP_QUESTIONS, ...INTRO_QUESTIONS, ...BACKGROUND_QUESTIONS, ...RQ1_QUESTIONS, ...RQ2_QUESTIONS, ...RQ3_QUESTIONS, CONCLUSION_QUESTION];
  const byType = {};
  allMc.forEach((q) => {
    if (!byType[q.type]) byType[q.type] = { correct: 0, total: 0 };
    const st = mcState[q.id];
    if (st && st.submitted) {
      byType[q.type].total += 1;
      if (st.isCorrect) byType[q.type].correct += 1;
    }
  });
  let dTotal = 0, dCorrect = 0, dBiasSum = 0, dBiasCount = 0;
  NUMERIC_QUESTIONS.forEach((q) => {
    const st = numState[q.id];
    if (st && st.submitted) {
      dTotal += 1;
      if (st.isCorrect) dCorrect += 1;
      dBiasSum += st.signedErrorPct;
      dBiasCount += 1;
    }
  });
  if (dTotal > 0) byType["D"] = { correct: dCorrect, total: dTotal };
  const avgBias = dBiasCount > 0 ? (dBiasSum / dBiasCount).toFixed(1) : null;

  const missed = allMc.filter((q) => {
    const st = mcState[q.id];
    return st && st.submitted && !st.isCorrect;
  });

  const scoreCount = allMc.filter((q) => mcState[q.id] && mcState[q.id].submitted && mcState[q.id].isCorrect).length
    + NUMERIC_QUESTIONS.filter((q) => numState[q.id] && numState[q.id].submitted && numState[q.id].isCorrect).length;
  const totalScorable = allMc.length + NUMERIC_QUESTIONS.length;

  return (
    <SectionWrapper id="sec-learning" title="Learning Summary">
      <p>Score so far: {scoreCount} of {totalScorable} scorable questions correct.</p>
      <div className="ls-block">
        <h3>Score by question type</h3>
        <table className="ls-table">
          <thead><tr><th>Type</th><th>What it tests</th><th>Correct</th><th>Answered</th></tr></thead>
          <tbody>
            <tr><td>B</td><td>Trend and mechanism reasoning</td><td>{byType["B"] ? byType["B"].correct : 0}</td><td>{byType["B"] ? byType["B"].total : 0}</td></tr>
            <tr><td>C</td><td>Applied case judgment</td><td>{byType["C"] ? byType["C"].correct : 0}</td><td>{byType["C"] ? byType["C"].total : 0}</td></tr>
            <tr><td>D</td><td>Numeric estimation</td><td>{byType["D"] ? byType["D"].correct : 0}</td><td>{byType["D"] ? byType["D"].total : 0}</td></tr>
            <tr><td>E</td><td>Implication and falsification</td><td>{byType["E"] ? byType["E"].correct : 0}</td><td>{byType["E"] ? byType["E"].total : 0}</td></tr>
          </tbody>
        </table>
        {avgBias !== null && (
          <p>Average signed error across your numeric estimates: {avgBias}%. {parseFloat(avgBias) > 0
            ? "You tend to over-estimate magnitudes; the usual cause is anchoring on a headline number rather than working through the full factor chain."
            : "You tend to under-estimate magnitudes; the usual cause is dropping a factor from the chain, most often a scaling or population-size step."} This reports directional bias only; no pre-reveal certainty rating is captured anywhere in this article.</p>
        )}
      </div>

      <div className="ls-block">
        <h3>Your governing insight</h3>
        <p>You have now seen five charts covering adoption and belief, code composition, disagreement across studies, capital flows, and system-level delivery effects. Before this note reveals its own three takeaways, write the single most non-obvious insight you would defend to a skeptical engineering executive who has read only the headline that developers say AI makes them faster.</p>
        {!insightRevealed && (
          <div>
            <textarea className="apply-textarea" value={govInsight} onChange={(e) => setGovInsight(e.target.value)} placeholder="Type at least 20 characters..." />
            <button className="btn-primary" disabled={govInsight.trim().length < 20} onClick={onRevealInsight}>Reveal the authored insights</button>
          </div>
        )}
        {insightRevealed && (
          <div>
            <div className="interp-revealed"><span className="tag-you">Your insight</span><p>{govInsight}</p></div>
            <h3>How your insight compares to the article's three</h3>
            {AUTHORED_INSIGHTS.map((ins, i) => <div className="insight-card" key={"ins-" + i}>{ins}</div>)}
          </div>
        )}
      </div>

      <div className="ls-block">
        <h3>Apply It (a): Transfer to a New Domain</h3>
        <p>Leave software behind. A regional trucking company gives 60 dispatchers a new AI routing assistant. After six months, 82% of dispatchers say the tool makes them "noticeably faster" at building daily routes. The company's own measured data, before and after rollout across all 60 dispatchers, looks like this (illustrative dataset built for this exercise, not a reported statistic):</p>
        <table className="snippet-table">
          <thead><tr><th>Period</th><th>Dispatchers using the AI tool</th><th>Avg. hours to build a route</th><th>On-time delivery rate</th></tr></thead>
          <tbody>
            <tr><td>Before rollout</td><td>0%</td><td>1.8</td><td>91%</td></tr>
            <tr><td>6 months after</td><td>100%</td><td>1.6</td><td>88%</td></tr>
            <tr><td>18 months after</td><td>100%</td><td>1.3</td><td>90%</td></tr>
          </tbody>
        </table>
        <p>Write a response with four explicitly labeled parts: (1) a one-sentence so-what thesis about what this pattern means for the dispatch manager's decision to keep, adjust, or expand the AI tool; (2) the single load-bearing assumption your thesis depends on; (3) the strongest disconfirming evidence in this exact table that would undermine it; (4) a one-line pre-mortem completing "If this fails within 12 months, the most likely reason is ___."</p>
        <textarea className="apply-textarea" value={applyA} onChange={(e) => setApplyA(e.target.value)} placeholder="Label each of the four parts explicitly..." />
        <h3>Apply It (b): Cross-Link a Prior Principle</h3>
        <p>Name one principle from an earlier article in this series, including the three revisited in the Warm-Up, and explain whether it reinforces or conflicts with today's thesis that self-reported speed and independently measured speed can point in opposite directions.</p>
        <textarea className="apply-textarea" value={applyB} onChange={(e) => setApplyB(e.target.value)} placeholder="Name the principle and explain the connection..." />
        <button className="btn-primary" onClick={onEvaluate}>Evaluate my response</button>
        {applyEval && (
          <div className={"explanation-block " + (applyEval.gaps.length === 0 ? "explanation-correct" : "explanation-wrong")} style={{ marginTop: "12px" }}>
            {applyEval.gaps.map((g, i) => <div className="gap-note" key={"gap-" + i}>{g}</div>)}
            <p>{applyEval.summary}</p>
          </div>
        )}
      </div>

      <div className="ls-block">
        <h3>Principles to Revisit</h3>
        {missed.length === 0 && <p>Nothing to revisit yet. This list fills in as you answer questions and names the transferable principle behind each one you miss, rather than listing question numbers.</p>}
        {missed.length > 0 && (
          <ul>
            {missed.map((q) => <li key={"miss-" + q.id}><strong>{q.principle}</strong></li>)}
          </ul>
        )}
      </div>
      <Glossary items={GLOSSARIES.learning} />
    </SectionWrapper>
  );
}

const AUTHORED_INSIGHTS = [
  "The \"faster\" claim splits into at least two different things: how a tool makes a task feel while you are doing it, and how much time or output actually changes when someone else measures it independently. METR's own developers believed they had gained 20% even while a randomized trial showed a 19% loss, a 39-point gap between felt and measured effect for the same people on the same tasks. Any organization-wide rollout decision built only on developer self-report is building on the belief number, not the measured one.",
  "The size, and even the sign, of the measured effect depends enormously on WHAT is measured and WHO is measured, not on \"AI coding tools\" as a single category: expert open-source maintainers doing 20-minute-to-4-hour tasks in mature, high-standards codebases (METR) showed a slowdown, while a much larger, more corporate, task-throughput-focused sample of 4,867 developers (Cui et al.) showed a 26% gain concentrated among less experienced developers. A single \"AI makes developers X% faster\" number, without a stated population and outcome measure, is not yet a fact you can act on.",
  "Belief, capital, and system-level delivery data are moving on different timelines and by different logics: money can price a growth story before the causal story is settled, and a system can look net-negative on every metric in one year (DORA 2024) and roughly neutral-to-positive on one metric while still negative on another the next year (DORA 2025), as teams learn to manage the tool's downside faster than they eliminate it. Judging AI coding tools by any single one of these three signals, belief, money, or system data, in isolation will give you a different, incomplete answer each time."
];

function ConclusionSection({ mcState, onMcSubmit }) {
  return (
    <SectionWrapper id="sec-conclusion" title="Conclusion">
      <p>The central challenge is that belief, capital, and causal proof for AI coding tools are not converging toward one settled answer; they are three separate signals that can each look decisive while pointing in different directions, and the most likely trajectory under partial success is that this stays true for years, not months, because the underlying cause, that different populations doing different kinds of work get genuinely different results, is a feature of the technology's uneven maturity, not a temporary measurement problem that a single bigger study will resolve.</p>
      <p>For engineering leaders, the practical implication is that rollout decisions should be matched to the specific population and task type where evidence is strongest, junior developers on well-scoped, high-volume work, rather than applied as a single company-wide mandate justified by an adoption statistic or a vendor case study. Budgeting and headcount planning built on an assumed universal productivity multiplier should instead budget for the wide range METR and Cui et al. jointly imply, and revisit the assumption as new, better-controlled studies arrive.</p>
      <p>Institutionally, the deeper implication concerns how technology categories get evaluated during their fastest growth phase. Capital markets, individual belief, and system-level operational data can each move on their own schedule, and a policymaker, investor, or executive who waits for all three to agree before acting will likely wait past the point where the decision still matters, while one who acts on only the fastest-moving signal, capital or belief, risks building on a story only a randomized trial can actually test. The GitHub Copilots and Cursors of this cycle are, in this specific sense, not unlike earlier fast-diffusing technologies whose long-run net effect on the industries that adopted them was only settled years after the initial adoption curve had already flattened.</p>
      <p>The unresolved question is this: as AI coding tools keep improving and developers keep gaining more hours of practice with them, will the METR-style slowdown for experienced developers in mature codebases close on its own, the way early skepticism about earlier programming tools eventually did, or does it reflect something more durable about the specific demands of high-standards, long-lived software that a general-purpose coding assistant may never fully solve?</p>
      <MultipleChoice q={CONCLUSION_QUESTION} state={mcState[CONCLUSION_QUESTION.id]} onSubmit={onMcSubmit} />
    </SectionWrapper>
  );
}

function SourcesSection() {
  return (
    <SectionWrapper id="sec-sources" title="Sources">
      <p>Every figure in this article is tagged FACT (a measured value from the source named), ESTIMATE (derived by stated arithmetic from FACTs) or ILLUSTRATION (disclosed synthetic teaching data). The Apply It exercise's trucking-company table is the article's only ILLUSTRATION data, and it is labeled as such where it appears.</p>
      <ol className="source-list">
        {SOURCES.map((s, i) => (
          <li key={"src-" + i}>
            <a href={s.url} target="_blank" rel="noopener noreferrer">{s.name}</a>
            <div>Supports: {s.supports}</div>
          </li>
        ))}
      </ol>
    </SectionWrapper>
  );
}

/* ============================== APP ============================== */

const NAV_ITEMS = [
  { id: "sec-warmup", label: "Warm-Up" },
  { id: "sec-intro", label: "Introduction" },
  { id: "sec-background", label: "Background" },
  { id: "sec-rq1", label: "Q1: Why Studies Disagree" },
  { id: "sec-rq2", label: "Q2: Belief vs. Proof" },
  { id: "sec-rq3", label: "Q3: Faster vs. Better" },
  { id: "sec-learning", label: "Learning Summary" },
  { id: "sec-conclusion", label: "Conclusion" },
  { id: "sec-sources", label: "Sources" }
];

function App() {
  const [mcState, setMcState] = useState({});
  const [numState, setNumState] = useState({});
  const [chartInterp, setChartInterp] = useState({
    chart1: { submitted: [false, false], values: ["", ""] },
    chart2: { submitted: [false, false], values: ["", ""] },
    chart3: { submitted: [false, false], values: ["", ""] },
    chart4: { submitted: [false, false], values: ["", ""] },
    chart5: { submitted: [false, false], values: ["", ""] }
  });
  const [active, setActive] = useState("sec-warmup");
  const [isWide, setIsWide] = useState(typeof window !== "undefined" ? window.innerWidth >= 1160 : true);
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
    function onResize() { setIsWide(window.innerWidth >= 1160); }
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  function handleMcSubmit(id, selectedOption, isCorrect) {
    setMcState((prev) => ({ ...prev, [id]: { submitted: true, selectedOption, isCorrect } }));
  }
  function handleNumSubmit(id, numericValue, isCorrect, signedErrorPct, path) {
    setNumState((prev) => ({ ...prev, [id]: { submitted: true, numericValue, isCorrect, signedErrorPct, path } }));
  }
  function handleInterpSubmit(chartKey, idx, value) {
    setChartInterp((prev) => {
      const cur = prev[chartKey];
      const nextSubmitted = cur.submitted.slice(); nextSubmitted[idx] = true;
      const nextValues = cur.values.slice(); nextValues[idx] = value;
      return { ...prev, [chartKey]: { submitted: nextSubmitted, values: nextValues } };
    });
  }
  function handleRevealInsight() { setInsightRevealed(true); }

  /* Local, evidence-based Apply It evaluator.
     This static artifact does not call a live model API. The evaluator is isolated behind this
     one function so a secure server-side call could replace its body without touching the UI.
     It does not score keyword presence: it checks that each of the four required parts is present
     AND non-trivial (a labeled part with too little substance is flagged), checks that the
     response climbs from description to a quantified, decision-relevant claim, and names which
     specific part is weakest rather than confirming which words appeared. */
  function evaluateApplyIt() {
    const raw = applyA.trim();
    const lower = raw.toLowerCase();
    const gaps = [];

    function segmentAfter(patterns) {
      for (const p of patterns) {
        const idx = lower.indexOf(p);
        if (idx !== -1) return raw.slice(idx + p.length, idx + p.length + 260).trim();
      }
      return null;
    }
    const thesisSeg = segmentAfter(["thesis", "so-what", "so what", "(1)", "1."]);
    const assumptionSeg = segmentAfter(["assumption", "(2)", "2."]);
    const disconfirmSeg = segmentAfter(["disconfirm", "undermine", "evidence against", "counter-evidence", "(3)", "3."]);
    const premortemSeg = segmentAfter(["pre-mortem", "premortem", "if this fails", "most likely reason", "(4)", "4."]);

    if (raw.length < 120) {
      gaps.push("Length: the whole response is under 120 characters, which is not enough space to develop four distinct parts. Expand before re-evaluating.");
    }
    if (!thesisSeg || thesisSeg.length < 25) {
      gaps.push("Weakest part — thesis: no substantive one-sentence so-what about what the shift in hours-per-route and on-time delivery means for the dispatch manager's decision. State the consequence, not the observation.");
    }
    if (!assumptionSeg || assumptionSeg.length < 25) {
      gaps.push("Weakest part — load-bearing assumption: name the single claim that, if false, breaks your thesis. A thesis with no stated assumption cannot be tested.");
    }
    if (!disconfirmSeg || disconfirmSeg.length < 25) {
      gaps.push("Weakest part — disconfirming evidence: name the observation in the table that would count against your own conclusion, not further support for it.");
    }
    if (!premortemSeg || premortemSeg.length < 20) {
      gaps.push("Weakest part — pre-mortem: complete the sentence 'If this fails within 12 months, the most likely reason is ___' with a specific mechanism, not a general risk.");
    }
    const hasNumber = /\d/.test(raw);
    const hasImplicationVerb = /(should|must|need|require|recommend|plan|expand|pull back|invest|pilot|retrain|audit)/.test(lower);
    if (raw.length >= 120 && !hasNumber) {
      gaps.push("Climb from observation to implication: your response contains no quantity. A decision-relevant thesis normally carries a magnitude, for example the on-time delivery rate dropping 3 points at 6 months before recovering.");
    }
    if (raw.length >= 120 && !hasImplicationVerb) {
      gaps.push("Climb from observation to implication: your response describes the pattern but does not say what the dispatch manager should do differently as a result.");
    }
    if (applyB.trim().length < 30) {
      gaps.push("Apply It (b): name a specific prior principle and say whether it reinforces or conflicts with today's thesis. A title alone is not a connection.");
    }
    const summary = gaps.length === 0
      ? "All four parts are present and substantive, the response carries a magnitude, and it names an action rather than stopping at description. The cross-link in part (b) is developed. This is a strong transfer to an unfamiliar domain."
      : "This evaluator checks whether each of the four required parts exists and is substantive, whether the response reaches a quantified and decision-relevant implication, and which part is weakest. It does not score keywords. Address the items above, then re-evaluate.";
    setApplyEval({ gaps, summary });
  }

  const allMc = [...WARMUP_QUESTIONS, ...INTRO_QUESTIONS, ...BACKGROUND_QUESTIONS, ...RQ1_QUESTIONS, ...RQ2_QUESTIONS, ...RQ3_QUESTIONS, CONCLUSION_QUESTION];
  const totalScorable = allMc.length + NUMERIC_QUESTIONS.length;
  const answeredCount = allMc.filter((q) => mcState[q.id] && mcState[q.id].submitted).length
    + NUMERIC_QUESTIONS.filter((q) => numState[q.id] && numState[q.id].submitted).length;
  const progress = Math.min(100, Math.round((answeredCount / totalScorable) * 100));
  const score = allMc.filter((q) => mcState[q.id] && mcState[q.id].submitted && mcState[q.id].isCorrect).length
    + NUMERIC_QUESTIONS.filter((q) => numState[q.id] && numState[q.id].submitted && numState[q.id].isCorrect).length;

  function scrollToId(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }
  function goTo(dir) {
    const idx = NAV_ITEMS.findIndex((n) => n.id === active);
    const nextIdx = Math.max(0, Math.min(NAV_ITEMS.length - 1, idx + dir));
    scrollToId(NAV_ITEMS[nextIdx].id);
  }

  return (
    <div className="app-root">
      <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: progress + "%" }}></div></div>
      <div className="score-badge">Score: {score} / {totalScorable}</div>
      {isWide && (
        <nav className="section-nav">
          {NAV_ITEMS.map((item) => (
            <div key={item.id} className={"nav-item " + (active === item.id ? "nav-active" : "")}
              onClick={() => scrollToId(item.id)}>
              {item.label}
            </div>
          ))}
        </nav>
      )}
      <div className="content-column">
        <div className="article-header">
          <div className="kicker">Economic Research &middot; No. 25 &middot; Technology &amp; AI</div>
          <h1>The Productivity Paradox: When Believing You're Faster and Measurably Being Faster Point in Opposite Directions</h1>
          <p className="standfirst">AI coding tools are the fastest-adopted software category in memory, and the developers using them believe the tools make them faster. The single most rigorous test of that belief found the opposite.</p>
        </div>
        <WarmUpSection mcState={mcState} onMcSubmit={handleMcSubmit} />
        <IntroSection mcState={mcState} onMcSubmit={handleMcSubmit} />
        <BackgroundSection chartInterp={chartInterp} onInterpSubmit={handleInterpSubmit}
          mcState={mcState} numState={numState} onMcSubmit={handleMcSubmit} onNumSubmit={handleNumSubmit} />
        <RQ1Section chartInterp={chartInterp} onInterpSubmit={handleInterpSubmit} mcState={mcState} onMcSubmit={handleMcSubmit} />
        <RQ2Section chartInterp={chartInterp} onInterpSubmit={handleInterpSubmit}
          mcState={mcState} numState={numState} onMcSubmit={handleMcSubmit} onNumSubmit={handleNumSubmit} />
        <RQ3Section chartInterp={chartInterp} onInterpSubmit={handleInterpSubmit} mcState={mcState} onMcSubmit={handleMcSubmit} />
        <LearningSummarySection mcState={mcState} numState={numState} applyA={applyA} setApplyA={setApplyA}
          applyB={applyB} setApplyB={setApplyB} applyEval={applyEval} onEvaluate={evaluateApplyIt}
          govInsight={govInsight} setGovInsight={setGovInsight} insightRevealed={insightRevealed} onRevealInsight={handleRevealInsight} />
        <ConclusionSection mcState={mcState} onMcSubmit={handleMcSubmit} />
        <SourcesSection />
      </div>
      <div className="back-next-controls">
        <button className="btn-backnext" onClick={() => goTo(-1)}>&#8592; Back</button>
        <button className="btn-backnext" onClick={() => goTo(1)}>Next &#8594;</button>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
