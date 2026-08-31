// ER-18: The Denial Algorithm — Medicare Advantage Prior Authorization
// Interactive research article. React 18 + Recharts 2.12.7 (UMD). No build step.
// This file is a readable source copy; the deliverable is index.html (same code inlined).

const { useState, useEffect, useRef, useCallback } = React;
const {
  LineChart, Line, BarChart, Bar, ComposedChart, Scatter, ScatterChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, Cell,
  LabelList, ResponsiveContainer,
} = Recharts;

/* ----------------------------------------------------------------------
   SOURCES
---------------------------------------------------------------------- */
const SOURCES = [
  { id: "kff2024pa", label: "KFF, \"Medicare Advantage Insurers Made Nearly 53 Million Prior Authorization Determinations in 2024,\" Jan 28, 2026", url: "https://www.kff.org/medicare/medicare-advantage-insurers-made-nearly-53-million-prior-authorization-determinations-in-2024/" },
  { id: "kffpostacute", label: "KFF, \"Medicare Advantage Insurers Deny Prior Authorization Requests for Post Acute Care at Substantially Higher Rates Than the Overall Denial Rate,\" Jul 6, 2026", url: "https://www.kff.org/medicare/medicare-advantage-insurers-deny-prior-authorization-requests-for-post-acute-care-at-substantially-higher-rates-than-the-overall-denial-rate/" },
  { id: "oig2022", label: "HHS Office of Inspector General, \"Some Medicare Advantage Organization Denials of Prior Authorization Requests Raise Concerns About Beneficiary Access to Medically Necessary Care,\" OEI-09-18-00260, Apr 27, 2022", url: "https://oig.hhs.gov/reports/all/2022/some-medicare-advantage-organization-denials-of-prior-authorization-requests-raise-concerns-about-beneficiary-access-to-medically-necessary-care/" },
  { id: "oig2026snf", label: "HHS Office of Inspector General, \"Medicare Advantage Organizations Overturned Nearly All Appealed Prior Authorization Denials for Skilled Nursing Facility Admission...,\" OEI-09-24-00331, Jun 8, 2026", url: "https://oig.hhs.gov/reports/all/2026/medicare-advantage-organizations-overturned-nearly-all-appealed-prior-authorization-denials-for-skilled-nursing-facility-admission-raising-concerns-about-initial-denials/" },
  { id: "senatepsi", label: "U.S. Senate Permanent Subcommittee on Investigations, Majority Staff Report on Medicare Advantage, Oct 17, 2024, as reported in Healthcare Dive, \"Senate report slams Medicare Advantage insurers for using predictive technology to deny claims,\" Oct 21, 2024", url: "https://www.healthcaredive.com/news/medicare-advantage-AI-denials-cvs-humana-unitedhealthcare-senate-report/730383/" },
  { id: "stat2023", label: "STAT News, \"UnitedHealth faces class action lawsuit over algorithmic care denials in Medicare Advantage plans,\" Nov 14, 2023", url: "https://www.statnews.com/2023/11/14/unitedhealth-class-action-lawsuit-algorithm-medicare-advantage/" },
  { id: "naic2025", label: "National Association of Insurance Commissioners, \"Health Insurance Artificial Intelligence/Machine Learning Survey Results\" (93 insurers, 16 states, fielded 2024), published May 9, 2025", url: "https://content.naic.org/sites/default/files/inline-files/Health%20Survey%20Report%20-%20FINAL%205.9.25.pdf" },
  { id: "ama2025", label: "American Medical Association, \"How AI is leading to more prior authorization denials\" (survey of 1,000 physicians), Mar 10, 2025", url: "https://www.ama-assn.org/practice-management/prior-authorization/how-ai-leading-more-prior-authorization-denials" },
  { id: "cms0057f", label: "CMS, \"Interoperability and Prior Authorization Final Rule (CMS-0057-F),\" fact sheet, Jan 17, 2024", url: "https://www.cms.gov/newsroom/fact-sheets/cms-interoperability-and-prior-authorization-final-rule-cms-0057-f" },
  { id: "kffenroll2026", label: "KFF, \"Medicare Advantage in 2026: Enrollment Update and Key Trends,\" Jun 5, 2026 (updated Jul 1, 2026)", url: "https://www.kff.org/medicare/medicare-advantage-in-2026-enrollment-update-and-key-trends/" },
  { id: "wiser", label: "CMS, Wasteful and Inappropriate Service Reduction (WISeR) Model, launched Jan 1, 2026", url: "https://www.cms.gov/priorities/innovation/innovation-models/wiser" },
  { id: "axios2026", label: "Axios, \"Why prior authorization woes haven't disappeared,\" Jul 14, 2026", url: "https://www.axios.com/2026/07/14/prior-authorization-problems-continue" },
  { id: "beckers2026", label: "Becker's Payer Issues, \"53 million Medicare Advantage prior authorization requests in 2024: 6 notes,\" Jan 29, 2026", url: "https://www.beckerspayer.com/research-analysis/53-million-medicare-advantage-prior-authorization-requests-in-2024-6-notes/" },
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
  { article: "ER-13, antibiotic market failure (2026-07-29)", principle: "A good whose socially optimal use pattern is scarce and reserved will always collide with a system that pays for it by volume." },
  { article: "ER-16, frequent-flyer currency (2026-08-05)", principle: "When one party controls both the supply and the internal exchange rate of a token or points system, an appraisal performed under duress is not the price an arm's-length buyer would pay." },
  { article: "ER-17, mortgage rate lock-in (2026-08-07)", principle: "The same headline design feature can produce opposite real-world consequences depending on a second, easy-to-overlook detail (like how cheap it is to exit)." },
];

/* ----------------------------------------------------------------------
   QUESTION BANK
   Each MC question: { id, section, type, prompt, options:[{text}], correct,
     misconceptions:[str per option], principle, transfer }
   Each numeric question: { id, section, type:'D', mode:'tight'|'fermi',
     prompt, target, tolerancePct, scaffold, decomposition, principle, transfer, unit }
---------------------------------------------------------------------- */
const QUESTIONS = [
  // ---------------- WARM-UP (Type B / E, transfer from prior articles) ----------------
  {
    id: "w1", section: "warmup", type: "B", kind: "mc",
    prompt: "A regional water utility wants households to tap a scarce, drought-resistant reservoir only during severe shortages, so it lasts for decades. But the utility's revenue — and its private operating contractor's profit — both come from a per-gallon fee charged every time the reservoir is tapped. Applying the antibiotic-market-failure principle (a good whose optimal use is rare and reserved, priced by volume), what does that principle most directly predict here?",
    options: [
      { text: "The reservoir will run dry no matter how the contract is written, because physical scarcity always overrides incentives." },
      { text: "The contractor is structurally biased toward encouraging more frequent draws even in non-emergencies, because its revenue rewards volume, not restraint — the same mismatch that starved the antibiotic pipeline." },
      { text: "Because the utility is a public entity, it has no profit motive, so this mismatch cannot occur here." },
      { text: "The contractor's profits will fall automatically as the reservoir depletes, which self-corrects the incentive over time." },
    ],
    correct: 1,
    misconceptions: [
      "This restates the physical constraint but ignores the incentive mechanism the principle is about — scarcity alone doesn't explain who overuses a resource.",
      "",
      "This confuses ownership (public vs. private) with the actual mechanism, which is the fee structure (per-unit pricing), not who collects the fee.",
      "This assumes markets self-correct under a scarcity externality — the same optimistic assumption that let the antibiotic pipeline collapse instead of correcting itself.",
    ],
    principle: "Volume-based pricing collides with a good whose optimal use is rare and reserved (ER-13).",
    transfer: "This generalizes to any resource-conservation or stewardship program that pays a manager or vendor per unit consumed rather than per unit conserved.",
  },
  {
    id: "w2", section: "warmup", type: "E", kind: "mc",
    prompt: "A university's dining hall introduces \"Meal Points,\" then pledges its unspent Meal Points balance as loan collateral for a new cafeteria, valuing the balance at full face value. Using the airline-miles-as-collateral principle, what is the single biggest reason to distrust that face-value appraisal?",
    options: [
      { text: "Meal Points aren't transferable between students, so the airline-miles analogy doesn't apply." },
      { text: "The appraisal is trustworthy because a professional auditor performed it." },
      { text: "The university controls both the supply of points and the exchange rate (how much food a point buys), so it can unilaterally reprice the currency — and the appraisal was made under the pressure of needing loan collateral, not by an arm's-length buyer." },
      { text: "This isn't a real risk, because dining points are guaranteed by the university's full faith and credit." },
    ],
    correct: 2,
    misconceptions: [
      "This objects to a surface feature (transferability) that wasn't the load-bearing part of the original case — control over supply and exchange rate was.",
      "This confuses procedural rigor (a credentialed appraiser) with independence from the incentive to inflate a valuation under duress.",
      "",
      "This assumes away the exact risk being tested by asserting a guarantee that doesn't eliminate the university's unilateral repricing power.",
    ],
    principle: "An appraisal performed under duress, by a party that controls both supply and exchange rate, is not an arm's-length price (ER-16).",
    transfer: "This generalizes to any closed-loop points, credits, or internal currency (gift cards, loyalty points, in-app credits) pledged as collateral or booked at face value.",
  },
  {
    id: "w3", section: "warmup", type: "B", kind: "mc",
    prompt: "Two countries offer workers government-backed income-share loans that cap repayment at a fixed share of income for 20 years. In Country A, workers can refinance out near current market value any time. In Country B, exiting early means repaying the full original loan plus a penalty. Using the mortgage-lock-in principle (identical headline design, one overlooked detail flips the outcome), what should we expect?",
    options: [
      { text: "Both countries will show identical lock-in, since the headline design (a 20-year income cap) is what matters." },
      { text: "Neither country will show lock-in, because income-share agreements are fundamentally different from mortgages." },
      { text: "Country A will show more lock-in, because refinancing is a hassle regardless of its cost." },
      { text: "Country B will show far more workers stuck refusing to change jobs or renegotiate, because exit is expensive, while Country A avoids that effect despite having the 'same' headline product — mirroring how Denmark's callable mortgage bonds avoid the lock-in the U.S. system creates." },
    ],
    correct: 3,
    misconceptions: [
      "This is exactly the error the principle warns against: treating the headline feature as the whole story and ignoring the second, easy-to-overlook detail (exit cost).",
      "This dismisses the analogy on a surface-level category difference instead of checking whether the same underlying mechanism (a costly exit) applies.",
      "This inverts the actual mechanism — friction from exit cost, not general hassle, is what drives lock-in.",
      "",
    ],
    principle: "The same headline design feature can produce opposite outcomes depending on how cheap it is to exit (ER-17).",
    transfer: "This generalizes to non-competes, subscription cancellation friction, and any 'good headline terms, costly exit' contract design.",
  },

  // ---------------- BACKGROUND ----------------
  {
    id: "bg1", section: "background", type: "A", kind: "mc", chart: "enrollment",
    prompt: "The chart's interpretation prompt established that Medicare Advantage's share grew about 1.9 points per year historically (2007–2026) versus a projected ~1.0 point per year going forward (2026–2034, per CBO). If that slower, ~1.0-point-per-year pace continues unchanged after 2034, roughly how many additional years would it take to add another 10 percentage points of share (from 63% to about 73%), and which pace is the right one to use for that forward projection?",
    options: [
      { text: "About 5 years, using the faster historical pace of ~1.9 points per year, since long-run averages are the most reliable basis for any projection." },
      { text: "It cannot be projected at all, because Medicare Advantage's share has never grown at a perfectly constant pace in any period." },
      { text: "About 20 years, because deceleration implies the pace roughly halves again every 8 years." },
      { text: "About 10 years (10 points ÷ 1.0 point per year), using the projected 2026–2034 pace rather than the faster historical one — since that slower pace is the one already reflected in the most recent trend and CBO's own projection." },
    ],
    correct: 3,
    misconceptions: [
      "This applies the wrong pace — the historical (pre-deceleration) rate — to a forward-looking projection, when the more recent, already-decelerated pace is the better basis for projecting further into the future.",
      "This overcorrects: the question asks for a projection under a clearly stated constant-pace assumption, a standard and legitimate what-if, not a claim that growth is actually constant.",
      "This invents an unsupported 'deceleration of deceleration' rule with no basis in the two rates actually given.",
      "",
    ],
    principle: "When projecting a trend forward, the most recent, already-adjusted rate is a better basis than a longer historical average that includes a period before the trend changed.",
    transfer: "This generalizes to any forecast built on a growth curve that has already shown one inflection (revenue growth, population growth, technology adoption) — use the post-inflection rate, not the blended long-run average.",
  },
  {
    id: "bg2", section: "background", type: "C", kind: "mc",
    prompt: "Case Prompt: A mid-sized insurer is deciding whether to expand into a county where UnitedHealth Group and Humana already hold 81% combined Medicare Advantage share (as in East Baton Rouge Parish, LA). Its pitch to seniors is 'friendlier, faster prior authorization.' Given the market-structure and prior-authorization patterns in this note, what is the weakest assumption in that strategy, and what evidence is thinnest in supporting it?",
    options: [
      { text: "That the new entrant can profitably scale in one county — but nothing here suggests county-level scale is harder than national scale." },
      { text: "That two incumbents can't also improve their prior authorization process — but they have no incentive to, since the article shows they are already highly profitable." },
      { text: "That regulators will block the entry — but there is no antitrust barrier described in this note." },
      { text: "That seniors will switch plans mid-year for administrative reasons — but Medicare Advantage enrollment is largely locked to annual windows, and no data in this note measures how much prior-authorization friction actually drives plan-switching." },
    ],
    correct: 3,
    misconceptions: [
      "This isn't the weakest link — the note gives no reason county-level scale specifically is the binding constraint, so this option invents a risk not supported by the evidence.",
      "This assumes incumbents are locked into current behavior, but the note's RQ3 section shows regulatory and public-reporting pressure could push incumbents to improve, undercutting the premise of the distractor itself.",
      "This introduces a regulatory risk the note never raises — plausible in general, but not the load-bearing assumption identified by the evidence actually presented here.",
      "",
    ],
    principle: "A recommendation's weakest link is the unmeasured behavioral assumption it quietly depends on, not just any plausible risk.",
    transfer: "This generalizes to any 'better service wins share' pitch in a market with strong switching costs or lock-in (insurance, banking, telecom contracts).",
  },

  // ---------------- RQ1: MECHANISM ----------------
  {
    id: "rq1a", section: "rq1", type: "B", kind: "mc", chart: "dumbbell",
    prompt: "UnitedHealth's post-acute-care denial rate rose from 8.7% (2019) to 22.7% (2022) after adopting the nH Predict algorithm through its naviHealth subsidiary. Separately, naviHealth-processed skilled nursing facility (SNF) requests were denied at 14%, versus 11% for internally reviewed MAO requests and 9% for other contractors — and 97% of naviHealth's SNF denials were overturned on appeal. Which is the strongest reason NOT to conclude that the algorithm alone caused the higher error rate?",
    options: [
      { text: "The sample of naviHealth-processed requests is too small to be meaningful." },
      { text: "Correlation never implies any causal mechanism at all, so no claim can be made either way." },
      { text: "NaviHealth processes half of all SNF requests industry-wide and may be assigned a systematically different, higher-acuity or harder-to-verify case mix than internal reviewers — a confound that could produce a higher denial and overturn rate independent of the algorithm's accuracy." },
      { text: "The overturn rate would be exactly zero if the algorithm were unbiased, so any nonzero rate proves bias." },
    ],
    correct: 2,
    misconceptions: [
      "The OIG report describes an audit population large enough (half of all SNF admission requests nationally) that sample size is not the limiting concern here — this misapplies a general statistics worry without engaging the actual confound.",
      "This overcorrects into nihilism: some evidence (the size and consistency of the gap, plus the documented savings-target design of the tools) does support a mechanism claim; the point is to name what could be a competing explanation, not to abandon inference entirely.",
      "",
      "This assumes a false, overly strict benchmark — reasonable clinical judgment, human or algorithmic, will always produce a nonzero overturn rate, so a nonzero rate alone doesn't prove bias.",
    ],
    principle: "A gap between two review channels is consistent with an algorithmic effect, but a case-mix confound (who gets routed to which reviewer) is always a competing explanation until it is ruled out.",
    transfer: "This generalizes to comparing any two decision channels (human vs. automated triage, two hospitals' readmission rates, two loan officers' approval rates) where assignment to a channel isn't random.",
  },
  {
    id: "rq1b", section: "rq1", type: "C", kind: "mc",
    prompt: "Case Prompt: A regional Medicare Advantage plan's Chief Financial Officer is impressed that CVS's 'Post-Acute Analytics' project, initially projected to save $10–15 million over three years, was revised upward to a projected $77.3 million in savings within months of launch. The CFO wants to adopt a similar tool immediately. Which assumption must hold for this recommendation to create value without excessive downside risk, and what evidence in this section is thinnest in supporting it?",
    options: [
      { text: "That the tool's savings come primarily from catching genuinely non-covered or unnecessary care — but the section's evidence (naviHealth's 97% SNF overturn rate, Humana's denial-justification training) suggests savings may instead come from denying care that is later proven necessary, which is a cost shifted onto beneficiaries and providers, not eliminated." },
      { text: "That the tool will be well received by network providers — but provider relations aren't discussed in this section." },
      { text: "That CMS will approve the tool for use — but the section doesn't suggest CMS pre-approval is required." },
      { text: "That the tool's projected savings figure is accurate — but there's no reason in this section to doubt a company's own internal savings projection." },
    ],
    correct: 0,
    misconceptions: [
      "",
      "This raises a plausible business concern but isn't the assumption the section's evidence directly speaks to — provider relations aren't the load-bearing claim here.",
      "This invents a regulatory approval requirement not described in the section, rather than engaging with the actual evidence provided.",
      "This is close to backwards: the section's strongest evidence (the savings estimate itself tripling within months) is a reason to be MORE skeptical of the projection's stability, not a reason to trust it at face value.",
    ],
    principle: "A savings projection built on denying more requests is only value-creating if the denials are correct; if a large share are later overturned, the 'savings' are a cost shifted, not a cost avoided.",
    transfer: "This generalizes to any process-automation pitch measured by throughput or short-run cost reduction without a matching accuracy or reversal-rate metric.",
  },

  // ---------------- RQ2: APPEAL FUNNEL ----------------
  {
    id: "rq2a", section: "rq2", type: "A", kind: "mc", chart: "funnel",
    prompt: "The chart's own interpretation already showed a roughly 9.5-to-1 ratio between never-appealed denials and appeal-corrected ones. Now compute a different quantity: the chart shows 52.8 million total 2024 requests and about 3.63 million denials that were never appealed. What share of ALL prior-authorization requests (not just denials) ended in an unverified denial, and why is that share — not the headline 7.7% denial rate — the more honest description of how much of the system's output was never independently checked?",
    options: [
      { text: "About 88.5%, because that is the share of DENIALS that were never appealed, and denials are what matters here." },
      { text: "About 6.9% (3.63 million ÷ 52.8 million), which is smaller than the 7.7% headline denial rate itself — showing that even a supposedly conservative-sounding 'unverified' framing still describes millions of real requests, and that the right response is to shrink the population that never gets checked, not to treat 7.7% as already accounting for verification." },
      { text: "About 7.7%, which is simply the headline denial rate restated in different words." },
      { text: "About 11.5%, because that is the share of denials that WERE appealed, and the unverified share must be the complement of a different total." },
    ],
    correct: 1,
    misconceptions: [
      "This restates the 88.5% figure but answers a different question — that is the share of DENIALS unappealed, not the share of ALL REQUESTS that ended in an unverified denial (a different, smaller denominator).",
      "",
      "This answer skips the actual computation and mistakes the question for a simple recall of the already-stated 7.7% headline rate, which measures something different (share of requests denied, not share left unverified).",
      "11.5% is the share of DENIALS that were appealed — using it here mismatches numerator and denominator rather than computing the requested share of all requests.",
    ],
    principle: "A rate computed only over a self-selected sub-population (those who appeal) is a lower bound on the true rate for the full population, not an estimate of it.",
    transfer: "This generalizes to any 'complaint rate' or 'return rate' metric (product defects, service complaints, malpractice claims) where only a fraction of affected people ever file.",
  },
  {
    id: "rq2b", section: "rq2", type: "D", mode: "tight", kind: "numeric",
    prompt: "Using the 2024 figures — 4.1 million denied requests, 11.5% appealed, and 80.7% of appeals overturned — calculate the approximate number of 2024 Medicare Advantage prior-authorization denials that were overturned on appeal.",
    unit: "requests",
    target: 380000,
    tolerancePct: 0.12,
    scaffold: "Multiply the three stated figures in sequence: denied requests × appeal rate × overturn rate.",
    decomposition: "4,100,000 denied × 11.5% appealed = 471,500 appealed. 471,500 × 80.7% overturned ≈ 380,500 overturned. This is a direct multiplication chain (a rate cascade), not a Fermi estimate — the tolerance is tight (±12%) because every input is a reported figure.",
    principle: "A multi-stage rate (appeal rate × overturn rate) compounds by multiplication, not addition.",
    transfer: "This generalizes to any funnel metric: conversion rate × close rate, click rate × purchase rate, screening rate × positive-predictive-value.",
  },
  {
    id: "rq2c", section: "rq2", type: "D", mode: "fermi", kind: "numeric",
    prompt: "A separate, randomly sampled 2022 HHS OIG audit — not limited to appealed cases — found that roughly 13% to 18% of denials it reviewed did not meet Medicare's own coverage rules and likely should have been approved. Applying a rate in that neighborhood to the 3.63 million 2024 Medicare Advantage denials that were never appealed, roughly how many beneficiaries nationally likely received a wrongful denial in 2024 that nobody ever independently reviewed?",
    unit: "beneficiaries",
    target: 560000,
    logTolerance: true,
    scaffold: "This is a genuine Fermi estimate: state your own decomposition (population × rate) before entering a number. There is no single 'correct' input rate — use the 13%–18% OIG range as your anchor.",
    decomposition: "3,630,000 never-appealed denials × 13%–18% ≈ 470,000–650,000, so about half a million is a reasonable central estimate. This is scored on log-distance: an answer within a factor of 2 of ~560,000 (roughly 280,000 to 1,120,000) counts as correct, because the true rate for THIS specific population is unknown — the OIG's rate came from a different, smaller, older sample (2019 denials), so applying it here is itself an assumption, not a measurement.",
    principle: "A Fermi estimate multiplies a known population by an uncertain but bounded rate, and is judged on order of magnitude, not precision.",
    transfer: "This generalizes to any 'how many people are affected but never counted' estimate: unreported crime, unclaimed benefits, undiagnosed disease prevalence.",
  },
  {
    id: "rq2d", section: "rq2", type: "B", kind: "mc",
    prompt: "Is it statistically valid to assume the 80.7% overturn rate found among APPEALED 2024 denials also applies to the 88.5% of denials that were NEVER appealed?",
    options: [
      { text: "Yes — 80.7% is a stable figure across six years of data, so it is a reliable population-wide parameter." },
      { text: "Yes — both groups are Medicare Advantage enrollees, so they are statistically identical populations." },
      { text: "No — appealed cases are a self-selected, non-random sample (people with the clearest evidence, the most at stake, or the most support tend to appeal), so the true rate among all denials could be higher or lower than 80.7%; extrapolating without evidence about who appeals and why is a base-rate/selection error." },
      { text: "No — the appeal process itself changes the outcome, so the reviewer's identity, not the sampling method, is what invalidates the comparison." },
    ],
    correct: 2,
    misconceptions: [
      "This confuses the stability of a statistic over TIME (six consistent years) with its representativeness of a DIFFERENT population (the never-appealed group) — a stable number can still be a biased estimator of another group.",
      "This ignores exactly the selection mechanism in question: being in the 'appealed' group is not random, so shared enrollment status doesn't make the two groups comparable on this measure.",
      "",
      "This correctly rejects the extrapolation but for the wrong reason — the issue is who ends up in each group (selection), not that the review process changes the true rate of error.",
    ],
    principle: "A rate calculated only on a self-selected subgroup cannot be assumed to describe the excluded majority without an argument about why selection into the subgroup is unrelated to the outcome.",
    transfer: "This generalizes to survey response bias, clinical trial dropout, and any 'among those who responded/appealed/opted in' statistic.",
  },

  // ---------------- RQ3: REGULATORY TRAJECTORY ----------------
  {
    id: "rq3a", section: "rq3", type: "A", kind: "mc", chart: "indexed",
    prompt: "The chart's own interpretation already showed traditional Medicare's INDEXED prior authorization volume growing about 2.1 times faster than Medicare Advantage's between 2022 and 2024. Now compute each program's ABSOLUTE increase over the same period — Medicare Advantage rose from 46.0 million to 52.8 million requests; traditional Medicare rose from 260,986 to 628,243 reviews — and express traditional Medicare's absolute increase as a share of Medicare Advantage's absolute increase. What does that second comparison reveal that the indexed comparison alone does not?",
    options: [
      { text: "Since traditional Medicare grew faster in relative (indexed) terms, it must also account for the larger share of the total national increase in prior authorization volume." },
      { text: "The two programs contributed roughly equally to the national increase in volume, since both indexes reached comparably 'high' levels above 100." },
      { text: "This comparison can't be made, because indexed figures and absolute figures are incompatible units." },
      { text: "Traditional Medicare's absolute increase (about 367,000 reviews) is only around 5% the size of Medicare Advantage's absolute increase (about 6.8 million requests) — so despite growing more than twice as fast in relative terms, traditional Medicare's expansion still accounts for only a sliver of the actual national increase in prior-authorization volume; the two comparisons answer different questions and both are true at once." },
    ],
    correct: 3,
    misconceptions: [
      "This confuses a fast relative growth RATE with a large absolute CONTRIBUTION to the total change — the two can point in opposite directions, as they do here.",
      "This confuses reaching similar INDEX LEVELS (both above 100) with contributing similar ABSOLUTE amounts to total volume growth — indexes are normalized, absolute counts are not.",
      "The two figures are compatible: an index is simply the absolute figures divided by their own base value, so absolute changes can always be recovered and compared directly.",
      "",
    ],
    principle: "A faster relative growth rate and a small absolute contribution to total change are not contradictory — they answer different questions, and a single 'which grew faster' framing can mislead if the reader doesn't ask 'faster as measured how, and how much does that actually move the total.'",
    transfer: "This generalizes to comparing a fast-growing startup's growth RATE against an incumbent's much larger absolute contribution to total market volume.",
  },
  {
    id: "rq3b", section: "rq3", type: "A", kind: "mc",
    prompt: "UnitedHealth's post-acute-care denial rate moved from 8.7% in 2019 to 22.7% in 2022. Which statement most precisely and correctly describes that change?",
    options: [
      { text: "A 14% increase." },
      { text: "A 14.0-percentage-point increase, which is also approximately a 161% relative increase (22.7 ÷ 8.7 ≈ 2.61, i.e., the rate roughly 2.6-fold, or a 161% relative rise, on top of the original 8.7%)." },
      { text: "A 22.7% increase." },
      { text: "A 2.6-fold increase in percentage points." },
    ],
    correct: 1,
    misconceptions: [
      "This is the classic percent-vs-percentage-point error: 8.7 to 22.7 is a move of 14.0 PERCENTAGE POINTS, not a 14% relative increase (the true relative increase is about 161%).",
      "",
      "This confuses the new LEVEL (22.7%) with the SIZE of the CHANGE.",
      "This mixes units: 'fold' describes a multiple of a level (like dollars or a rate's ratio), not a difference already expressed in percentage points — percentage points don't get multiplied by a 'fold' the way levels do.",
    ],
    principle: "A move from X% to Y% is a (Y−X) percentage-point change and a (Y−X)/X relative-percent change — these are different numbers and must be labeled which is which.",
    transfer: "This generalizes to any headline rate change reported in the news: unemployment 'rising from 4% to 5%' is a 1-point rise but a 25% relative rise.",
  },
  {
    id: "rq3c", section: "rq3", type: "C", kind: "mc",
    prompt: "Case Prompt: A state Medicaid director is deciding how much to rely on the CMS 2026–2027 Interoperability and Prior Authorization Final Rule to reduce wrongful denials in Medicaid managed care plans (which face similar rules). Which assumption must hold for the rule to reduce wrongful denials — not just their processing speed and format — and what evidence in this note is thinnest in supporting it?",
    options: [
      { text: "That faster deadlines and standardized data APIs will also change WHICH decisions get made, not just how quickly and in what format they are delivered — but the rule does not cap how narrow a plan's internal clinical criteria can be relative to Medicare's own coverage rules, and the government's own 2026 WISeR pilot is simultaneously expanding, not constraining, algorithmic prior authorization in traditional Medicare, suggesting the substance of decision-making is not the current policy target." },
      { text: "That plans will comply with the rule's deadlines — but there is no evidence in this note that compliance itself is in doubt." },
      { text: "That providers will adopt the required APIs — but the rule requires payers, not providers, to build the APIs." },
      { text: "That beneficiaries will notice the faster deadlines — but beneficiary awareness isn't the mechanism by which the rule is meant to work." },
    ],
    correct: 0,
    misconceptions: [
      "",
      "This raises a plausible but unsupported compliance concern instead of engaging with what the rule actually does and does not require.",
      "This misattributes the API-building obligation, which the rule places on payers (insurers), not providers.",
      "This targets a mechanism (patient awareness) the rule was never designed to work through, rather than the rule's actual theory of change (speed and transparency).",
    ],
    principle: "A policy that fixes friction (speed, format, visibility) is not the same as a policy that fixes the incentive producing the underlying decisions.",
    transfer: "This generalizes to any 'faster processing' or 'more transparent reporting' reform proposed as a fix for a decision-quality problem — chargeback disputes, insurance claims, loan denials.",
  },

  // ---------------- CONCLUSION ----------------
  {
    id: "concl", section: "conclusion", type: "E", kind: "mc",
    prompt: "Given everything in this note, which real-world action is most directly supported, and which risk would most threaten it?",
    options: [
      { text: "Beneficiaries should personally negotiate directly with utilization reviewers instead of filing formal appeals, since appeals are underused." },
      { text: "A hospital's post-acute discharge-planning team should build automatic, immediate appeals for every skilled nursing facility, inpatient rehabilitation, and long-term care hospital denial, given the 43%–95% overturn rates in those categories — but the main risk is that once the 2026–2027 CMS rule makes plan-level overturn rates public, insurers may respond by tightening initial APPROVAL criteria further to keep reported overturn rates low, rather than by denying less overall, shifting the same restrictiveness earlier in the process where it is harder to detect. This thesis would be most weakened if, after the rule takes effect, publicly reported overturn rates fall at the SAME TIME denial rates also fall or hold flat — evidence that plans became more accurate, not just more strategic about avoiding scrutiny." },
      { text: "CMS should eliminate prior authorization entirely in Medicare Advantage, regardless of cost implications." },
      { text: "The 2026–2027 CMS rule alone is sufficient to resolve the wrongful-denial problem described throughout this note." },
    ],
    correct: 1,
    misconceptions: [
      "This ignores the article's own evidence on why appeals aren't filed (cost, doubt, urgency) and proposes an ad hoc workaround instead of addressing the documented, systemic mechanism.",
      "",
      "This is an all-or-nothing overcorrection: the OIG's own data shows most denials (88%+ even in the highest-denial categories) do not get overturned, meaning prior authorization also correctly screens out some non-covered care.",
      "This is the over-optimism error RQ3 explicitly warns against — the rule addresses speed and transparency, not the underlying incentive, and the WISeR pilot's expansion of algorithmic review works against this being a complete fix.",
    ],
    principle: "A recommendation is only as strong as its stated risk and the specific observation that would falsify it.",
    transfer: "This generalizes to any policy-response scenario where a transparency mandate could be met either with real behavior change or with strategic gaming of the newly measured metric (teaching to the test, in any domain).",
  },
];

/* ----------------------------------------------------------------------
   CHART INTERPRETATION PROMPTS (open text, production before consumption)
---------------------------------------------------------------------- */
const CHART_INTERPS = {
  enrollment: {
    title: "Medicare Advantage enrollment, 2007–2026",
    prompts: [
      { kind: "so-what", label: "So what — what should a plan weighing entry into this market conclude from this growth curve?",
        authored: "With two firms already holding 46% of enrollment nationally, a new entrant's growth increasingly has to come from taking share from incumbents in a near-saturated market, not from converting easy new-to-Medicare-Advantage beneficiaries — which raises the bar from 'be adequate' to 'be visibly and measurably better,' including on prior authorization." },
      { kind: "quant-predict", label: "Before scrolling further: predict — roughly how many percentage points per year, on average, did Medicare Advantage's share of Medicare grow between 2007 and 2026?",
        authored: "(55% − 19%) ÷ 19 years ≈ 1.9 percentage points per year on average — though growth was almost certainly uneven, likely faster in the ACA and Bipartisan Budget Act (2018) years and slower recently, since CBO's own projection (55%→63% by 2034) implies a much slower ~1.0 point per year going forward." },
    ],
  },
  marketshare: {
    title: "Medicare Advantage market share by parent organization, 2026",
    prompts: [
      { kind: "mechanism", label: "Why might Medicare Advantage enrollment be this concentrated among so few parent organizations?",
        authored: "Scale economies in provider-network contracting, supplemental-benefit design, and — directly relevant here — utilization-management infrastructure (like naviHealth) all favor large incumbents; once a plan builds the systems to manage prior authorization and risk adjustment at scale, it can underprice smaller rivals on premium while still capturing bonus payments tied to star ratings." },
      { kind: "quant", label: "Compute the gap between the combined top-2 share (46%) and the combined next-3 (23%). What does that 2-to-1 gap imply about negotiating leverage with hospitals and skilled nursing facilities?",
        authored: "46% ÷ 23% = a 2-to-1 concentration gap. The top two firms alone can plausibly set de facto reimbursement and authorization norms in many local markets — in 889 counties (28% of all U.S. counties) they hold at least 75% of Medicare Advantage share — giving providers little practical leverage to negotiate against aggressive utilization review." },
    ],
  },
  dumbbell: {
    title: "Denial rate vs. overturn-if-appealed rate, by care category, Medicare Advantage 2024",
    prompts: [
      { kind: "mechanism", label: "Why would skilled nursing facility (SNF) care — the category with the LOWEST denial rate — have the HIGHEST overturn rate, while long-term care hospital (LTCH) care — the HIGHEST denial rate — has a comparatively LOWER overturn rate?",
        authored: "One plausible read: LTCH and inpatient rehabilitation (IRF) admissions require meeting a higher, more clearly documented medical-necessity bar, so a larger share of LTCH/IRF denials may reflect genuinely borderline cases that partly survive appeal. SNF admissions are lower-stakes individually but far more numerous and more likely to be reviewed by standardized, high-volume, partly-automated processes like naviHealth's — consistent with a high initial error rate that gets caught, but only for the minority of cases that are appealed at all." },
      { kind: "quant", label: "Compute an 'error-signal ratio' (overturn rate ÷ denial rate) for each category. Which category shows the strongest sign of over-aggressive initial denial relative to its own base rate?",
        authored: "Overall: 80.7/7.7 ≈ 10.5. SNF: 95/12 ≈ 7.9. IRF: 43/54 ≈ 0.8. LTCH: 36/65 ≈ 0.55. The overall MA rate and SNF both show the highest ratios (roughly 8–10), meaning a denial in those categories is disproportionately likely to be reversed relative to how often it happens — the strongest signal of over-denial, not LTCH or IRF, whose higher headline denial rates partly reflect genuinely tougher cases." },
    ],
  },
  funnel: {
    title: "The 2024 Medicare Advantage prior authorization funnel",
    prompts: [
      { kind: "quant-predict", label: "Before reading further: for every ONE request that got corrected on appeal (overturned), roughly how many denied requests do you predict were never appealed at all?",
        authored: "About 9.5 to 1 (3.63 million never-appealed ÷ about 380,000 overturned). For every wrongful denial the system visibly corrects, roughly nine and a half more denials of the same type simply stand, unexamined." },
      { kind: "so-what", label: "So what should a state insurance regulator or CMS auditor prioritize, given this funnel?",
        authored: "Prioritize random, representative sampling of the NEVER-APPEALED population (as OIG did once, in 2022, finding a 13–18% error rate) over relying on appeal-based overturn statistics, which only describe the self-selected 11.5% who appeal and say nothing directly about the other 88.5%." },
    ],
  },
  indexed: {
    title: "Prior authorization review volume, indexed to 100 at 2022",
    prompts: [
      { kind: "causal", label: "Why would the tiny, previously prior-authorization-light traditional Medicare program show FASTER relative growth in review volume than the much larger Medicare Advantage program over the same two years?",
        authored: "Traditional Medicare's prior authorization footprint started from a very small, recently expanded base (new categories added in 2020, 2021, and 2023), so each new rule or pilot produces a large percentage jump; Medicare Advantage's volume, by contrast, already tracks its (much larger, more slowly growing) enrollment base, which mechanically caps its relative growth rate even though its absolute volume dwarfs traditional Medicare's." },
      { kind: "quant", label: "Compute the multiple by which indexed traditional-Medicare growth (240.7) outpaces indexed Medicare Advantage growth (114.8) by 2024.",
        authored: "240.7 ÷ 114.8 ≈ 2.1x. Traditional Medicare's prior-authorization apparatus is growing roughly twice as fast, in relative terms, as Medicare Advantage's — evidence that utilization-management infrastructure is currently expanding fastest in the part of Medicare that has historically had the least of it." },
    ],
  },
};

/* ----------------------------------------------------------------------
   GLOSSARY PER PAGE
---------------------------------------------------------------------- */
const GLOSSARY = {
  intro: [
    { term: "Medicare Advantage (MA)", def: "the private-insurance alternative to traditional government-run Medicare, paid a fixed amount per enrollee per month." },
    { term: "Prior authorization (PA)", def: "a requirement that a doctor get an insurer's approval before a service is covered." },
    { term: "naviHealth / nH Predict", def: "a UnitedHealth-owned company and algorithm that predicts how many days of rehabilitation care a patient should need, used to help decide coverage." },
    { term: "CMS", def: "the Centers for Medicare & Medicaid Services, the federal agency that runs Medicare." },
    { term: "HHS OIG", def: "the Department of Health and Human Services' Office of Inspector General, the government's internal watchdog for Medicare and Medicaid." },
    { term: "WISeR", def: "Wasteful and Inappropriate Service Reduction model, a 2026 CMS pilot testing AI-assisted prior authorization inside traditional Medicare." },
  ],
  background: [
    { term: "MedPAC", def: "the Medicare Payment Advisory Commission, an independent agency that advises Congress on Medicare payment policy." },
    { term: "CBO", def: "the Congressional Budget Office, which produces nonpartisan projections of federal programs including Medicare." },
    { term: "Parent organization", def: "the corporate entity (like UnitedHealth Group) that owns one or more Medicare Advantage insurance plans." },
    { term: "Capitated payment", def: "a payment model where an insurer receives a fixed amount per enrollee regardless of how much care that person uses." },
  ],
  rq1: [
    { term: "SNF (skilled nursing facility)", def: "short-term nursing and therapy care for people recovering from an illness, injury, or surgery." },
    { term: "IRF (inpatient rehabilitation facility)", def: "a hospital-level facility providing intensive rehabilitation, such as after a stroke." },
    { term: "LTCH (long-term care hospital)", def: "a hospital for patients with multiple serious conditions needing extended care, often 25+ days." },
    { term: "Case mix", def: "the overall mix of patient conditions and severity levels a provider or reviewer handles." },
  ],
  rq2: [
    { term: "Reconsideration (appeal)", def: "a formal request that an insurer review its own denial decision again." },
    { term: "Selection bias", def: "a distortion that happens when the people or cases you can measure are not a random sample of the group you want to understand." },
    { term: "RADV audit", def: "Risk Adjustment Data Validation, a type of CMS audit checking whether Medicare Advantage payment and coding data are accurate." },
  ],
  rq3: [
    { term: "API", def: "Application Programming Interface, a standardized way for computer systems to exchange data automatically." },
    { term: "Health equity analysis", def: "a since-unenforced requirement that Medicare Advantage plans study how prior authorization affects vulnerable beneficiaries." },
  ],
};

/* ----------------------------------------------------------------------
   CHART DATA
---------------------------------------------------------------------- */
const ENROLLMENT_DATA = [
  { year: "2007", millions: 8 },
  { year: "2019", millions: 22 },
  { year: "2024", millions: 33 },
  { year: "2026", millions: 35.2 },
];

const MARKETSHARE_DATA = [
  { name: "UnitedHealth Group", value: 26, tier: "FACT" },
  { name: "Humana", value: 20, tier: "FACT" },
  { name: "CVS Health (Aetna)", value: 12, tier: "FACT" },
  { name: "Kaiser Permanente", value: 6, tier: "FACT" },
  { name: "Elevance Health", value: 5, tier: "FACT" },
  { name: "All other insurers", value: 31, tier: "ESTIMATE" },
].sort((a, b) => b.value - a.value);

const DUMBBELL_DATA = [
  { name: "Overall MA", denial: 7.7, overturn: 80.7 },
  { name: "SNF", denial: 12, overturn: 95 },
  { name: "IRF", denial: 54, overturn: 43 },
  { name: "LTCH", denial: 65, overturn: 36 },
].map((d) => ({
  ...d,
  base: Math.min(d.denial, d.overturn),
  delta: Math.abs(d.overturn - d.denial),
}));

const FUNNEL_DATA = [
  { name: "Total Requests", base: 0, delta: 52.8, display: "52.8M", kind: "total" },
  { name: "Approved", base: 0, delta: 48.7, display: "48.7M", kind: "positive" },
  { name: "Denied — Not Appealed", base: 48.7, delta: 3.63, display: "3.63M", kind: "negative" },
  { name: "Denied — Appealed, Affirmed", base: 52.33, delta: 0.09, display: "0.09M", kind: "negative-light" },
  { name: "Denied — Appealed, Overturned", base: 52.42, delta: 0.38, display: "0.38M", kind: "caught" },
];

const INDEXED_DATA = [
  { year: "2022", MA: 100, Traditional: 100 },
  { year: "2023", MA: 108.3, Traditional: 150.9 },
  { year: "2024", MA: 114.8, Traditional: 240.7 },
];

const COLORS = { accent: "#0f5c8c", accentLight: "#a8c9dd", danger: "#b3382c", dangerLight: "#e3a79c", success: "#2f7a4f", neutral: "#c9c4bb", ink: "#111111" };

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

function NumericQuestionCard({ q, state, onChange, onSubmit }) {
  const [val, setVal] = useState(state.numericValue != null ? state.numericValue : "");
  const range = q.mode === "fermi" ? [q.target / 8, q.target * 8] : [q.target * 0.4, q.target * 1.6];
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
function EnrollmentChart() {
  return (
    <ChartFrame id="enrollment" note={<span><Tag tier="FACT" /> Enrollment counts: KFF, 2026 (2007, 2024, 2026) and KFF, 2026 prior-authorization report (2019). Share of Medicare: 19% (2007) → 55% (2026), KFF 2026.</span>}>
      <LineChart data={ENROLLMENT_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="year" />
        <YAxis label={{ value: "Millions enrolled", angle: -90, position: "insideLeft", fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="millions" name="MA enrollment (millions)" stroke={COLORS.accent} strokeWidth={3} dot={{ r: 5 }}>
          <LabelList dataKey="millions" position="top" />
        </Line>
      </LineChart>
    </ChartFrame>
  );
}

function MarketShareChart() {
  return (
    <ChartFrame id="marketshare" note={<span><Tag tier="FACT" /> Named insurers: KFF, 2026. <Tag tier="ESTIMATE" /> "All other insurers" computed as the complement (100% minus the five named shares); not separately reported.</span>}>
      <ComposedChart data={MARKETSHARE_DATA} layout="vertical" margin={{ top: 10, right: 40, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis type="number" domain={[0, 35]} unit="%" />
        <YAxis type="category" dataKey="name" width={150} />
        <Tooltip formatter={(v) => v + "%"} />
        <Bar dataKey="value" barSize={4} fill={COLORS.accentLight}>
          {MARKETSHARE_DATA.map((d, i) => <Cell key={i} fill={d.tier === "ESTIMATE" ? COLORS.neutral : COLORS.accentLight} />)}
        </Bar>
        <Scatter dataKey="value" fill={COLORS.accent} shape="circle">
          <LabelList dataKey="value" position="right" formatter={(v) => v + "%"} />
        </Scatter>
      </ComposedChart>
    </ChartFrame>
  );
}

function DumbbellChart() {
  return (
    <ChartFrame id="dumbbell" note={<span><Tag tier="FACT" /> Overall / SNF: KFF, 2026 and HHS OIG, 2026. IRF / LTCH: HHS OIG, 2026 (via KFF, 2026).</span>}>
      <ComposedChart data={DUMBBELL_DATA} layout="vertical" margin={{ top: 10, right: 40, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis type="number" domain={[0, 100]} unit="%" />
        <YAxis type="category" dataKey="name" width={140} />
        <Tooltip formatter={(v) => v + "%"} />
        <Bar dataKey="base" stackId="a" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="delta" stackId="a" fill={COLORS.neutral} barSize={4} isAnimationActive={false} />
        <Scatter dataKey="denial" fill={COLORS.danger} name="Denial rate">
          <LabelList dataKey="denial" position="top" formatter={(v) => v + "%"} />
        </Scatter>
        <Scatter dataKey="overturn" fill={COLORS.success} name="Overturn rate if appealed">
          <LabelList dataKey="overturn" position="bottom" formatter={(v) => v + "%"} />
        </Scatter>
        <Legend />
      </ComposedChart>
    </ChartFrame>
  );
}

function FunnelChart() {
  const colorFor = (kind) => ({ total: COLORS.ink, positive: COLORS.success, negative: COLORS.neutral, "negative-light": COLORS.dangerLight, caught: COLORS.danger }[kind]);
  return (
    <ChartFrame id="funnel" note={<span><Tag tier="FACT" /> Total requests (52.8M), Approved (48.7M), denial rate (7.7%), appeal rate (11.5%), and overturn rate (80.7%) are reported figures (KFF, 2026). <Tag tier="ESTIMATE" /> The Not-Appealed / Affirmed / Overturned splits are computed by applying the reported appeal and overturn rates to the 4.1M denied total, then rounded to avoid false precision.</span>}>
      <BarChart data={FUNNEL_DATA} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="name" angle={-25} textAnchor="end" interval={0} height={90} fontSize={11} />
        <YAxis label={{ value: "Millions of requests", angle: -90, position: "insideLeft", fontSize: 12 }} />
        <Tooltip formatter={(v, n, p) => p.payload.display} />
        <Bar dataKey="base" stackId="a" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="delta" stackId="a" isAnimationActive={false}>
          {FUNNEL_DATA.map((d, i) => <Cell key={i} fill={colorFor(d.kind)} />)}
          <LabelList dataKey="display" position="top" />
        </Bar>
      </BarChart>
    </ChartFrame>
  );
}

function IndexedChart() {
  return (
    <ChartFrame id="indexed" note={<span><Tag tier="ESTIMATE" /> Indexed (rebased to 100 at 2022) from FACT volumes: Medicare Advantage 46.0M / 49.8M / 52.8M (2022–2024) and traditional Medicare 260,986 / 393,749 / 628,243 reviews (FY2022–FY2024), both KFF, 2026.</span>}>
      <LineChart data={INDEXED_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="year" />
        <YAxis label={{ value: "Index (2022 = 100)", angle: -90, position: "insideLeft", fontSize: 12 }} domain={[90, 260]} />
        <Tooltip />
        <ReferenceLine y={100} stroke="#999" strokeDasharray="4 4" />
        <Legend />
        <Line type="monotone" dataKey="MA" name="Medicare Advantage" stroke={COLORS.accent} strokeWidth={3} dot={{ r: 4 }}>
          <LabelList dataKey="MA" position="top" formatter={(v) => v.toFixed(1)} />
        </Line>
        <Line type="monotone" dataKey="Traditional" name="Traditional Medicare" stroke={COLORS.danger} strokeWidth={3} dot={{ r: 4 }}>
          <LabelList dataKey="Traditional" position="top" formatter={(v) => v.toFixed(1)} />
        </Line>
      </LineChart>
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
  { id: "rq1", label: "RQ1: Mechanism" },
  { id: "rq2", label: "RQ2: The Appeal Funnel" },
  { id: "rq3", label: "RQ3: Will the Rule Fix It?" },
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
          <h1>The Denial Algorithm</h1>
          <p className="subtitle">What Medicare Advantage's Prior Authorization Numbers Really Show</p>
          <h2>Warm-Up: What Stuck?</h2>
          <p>Before today's topic, three quick questions pull principles from recent notes and ask you to apply them somewhere new — not to recall what you read before.</p>
          {bySection("warmup").map(renderQuestion)}
        </section>

        {/* ============ INTRODUCTION ============ */}
        <section id="sec-intro" ref={registerRef("intro")} className="section">
          <h2>Introduction</h2>
          <p>Medicare Advantage insurers built prior authorization systems, now increasingly run by predictive software, to make coverage decisions faster and more consistent for the 35 million Americans enrolled in the program. Yet in 2024 those insurers denied 4.1 million requests, and when the small share of denials that reached a human appeal review were checked, 80.7% were reversed — a pattern that has held above 80% every year since 2019 (<Cite id="kff2024pa">KFF, 2026</Cite>).</p>
          <p>Medicare Advantage now covers 35.2 million people, 55% of everyone eligible for Medicare (<Cite id="kffenroll2026">KFF, 2026</Cite>), up from 19% in 2007 — the "alternative" has become the majority path. Yet prior authorization stays almost entirely inside that private-plan system: traditional Medicare completed just 628,243 prior authorization reviews in fiscal year 2024, versus Medicare Advantage's 52.8 million — a roughly 84-to-1 gap in volume despite the two programs covering similarly sized populations (<Cite id="kff2024pa">KFF, 2026</Cite>).</p>
          <p>The tools driving that gatekeeping increasingly run on software built to predict, not just record, coverage decisions. A 2025 survey of 93 large health insurers found 84% already use some form of artificial intelligence or machine learning in their operations, and 12% specifically use it to help decide whether to deny a prior authorization request (<Cite id="naic2025">NAIC, 2025</Cite>). One insurer's experience with that shift is well documented: UnitedHealth's post-acute-care denial rate rose from 8.7% in 2019 to 22.7% in 2022 after it adopted the nH Predict algorithm through its naviHealth subsidiary (<Cite id="senatepsi">Senate PSI, 2024</Cite>), and a 2026 federal audit found that when naviHealth's skilled-nursing-facility denials were appealed, 97% were overturned (<Cite id="oig2026snf">HHS OIG, 2026</Cite>).</p>
          <p>This note addresses three questions: First, why does the deployment of predictive algorithms in Medicare Advantage utilization review coincide with rising denial rates concentrated in the costliest categories of post-acute care, and what does the specific mechanism reveal about whose interest the tool actually serves? Second, if the small share of denials that get appealed are overturned 80% to 97% of the time, what does that appeal funnel imply about the true, unmeasured rate of wrongful denial among the roughly nine in ten denials nobody ever appeals? Third, will the 2024 CMS Interoperability and Prior Authorization Final Rule — faster deadlines starting in 2026 and standardized data-sharing APIs starting in 2027 — fix the incentive that produces these outcomes, or will it just make the same decision machine run faster, including its new extension into traditional Medicare through the 2026 WISeR pilot?</p>
          <GlossaryPanel items={GLOSSARY.intro} />
        </section>

        {/* ============ BACKGROUND ============ */}
        <section id="sec-background" ref={registerRef("background")} className="section">
          <h2>Background: From Fringe Alternative to Majority Path</h2>
          <p>Medicare Advantage did not start out as the dominant way to get Medicare. In 2007, only 19% of eligible beneficiaries — about 8 million people — chose a private Medicare Advantage plan over traditional, government-run Medicare. By 2026, that share reached 55%, or 35.2 million of the 64.2 million people eligible for Medicare (<Cite id="kffenroll2026">KFF, 2026</Cite>). Enrollment climbed steadily through each stop along the way: about 22 million by 2019, 33 million by 2024, and 35.2 million by 2026 (<Cite id="kff2024pa">KFF, 2026</Cite>; <Cite id="kffenroll2026">KFF, 2026</Cite>).</p>
          <p>That growth has a price tag attached. Medicare pays Medicare Advantage plans about 14% more per enrollee in 2026 than an equivalent beneficiary would cost in traditional Medicare, an estimated $76 billion in added federal spending this year alone. A decade ago the percentage gap was similar (15% more per person), but the dollar impact was far smaller — about $24 billion — simply because enrollment was lower then (<Cite id="kffenroll2026">KFF, 2026</Cite>). The share of Medicare beneficiaries in these plans is forecast to keep climbing, though more slowly: the Congressional Budget Office projects 63% by 2034 (<Cite id="kffenroll2026">KFF, 2026</Cite>).</p>
          <EnrollmentChart />
          <ChartInterpretation chartId="enrollment" interp={interpFor("enrollment")} onSubmit={onSubmitInterp} />
          {renderQuestion(bySection("background")[0])}
          <p>Growth this size has consolidated around a small number of companies. UnitedHealth Group and Humana together account for 46% of all Medicare Advantage enrollment nationwide in 2026 — UnitedHealth alone holds 26% (9.3 million enrollees) and Humana 20% (7 million) — with CVS Health's Aetna plans (12%), Kaiser Permanente (6%), and Elevance Health (5%) rounding out the next tier (<Cite id="kffenroll2026">KFF, 2026</Cite>). In more than a quarter of U.S. counties, these top two firms alone control at least 75% of the local Medicare Advantage market (<Cite id="kffenroll2026">KFF, 2026</Cite>).</p>
          <p>That concentration matters here because prior authorization is the core mechanism separating Medicare Advantage's business model from traditional Medicare's. Virtually all Medicare Advantage enrollees — 99% — are in a plan that requires prior authorization for at least some services, most often the expensive ones: hospital stays, skilled nursing facility stays, and chemotherapy. Traditional Medicare, by contrast, applies prior authorization to only a narrow, specifically listed set of services (<Cite id="kff2024pa">KFF, 2026</Cite>). Because Medicare Advantage plans are paid a fixed amount per enrollee no matter how much care that person uses (a capitated payment), every dollar of care they can validly avoid paying for improves their margin — the same underlying incentive that makes prior authorization useful for catching genuinely unnecessary care also makes it a lever for something else entirely.</p>
          <MarketShareChart />
          <ChartInterpretation chartId="marketshare" interp={interpFor("marketshare")} onSubmit={onSubmitInterp} />
          {renderQuestion(bySection("background")[1])}
          <GlossaryPanel items={GLOSSARY.background} />
        </section>

        {/* ============ RQ1 ============ */}
        <section id="sec-rq1" ref={registerRef("rq1")} className="section">
          <h2>RQ1 — Why Does Algorithmic Review Coincide With Rising Denial Rates in the Costliest Categories?</h2>
          <p>If prior authorization existed only to screen out care that Medicare's own rules don't cover, denial rates should track roughly evenly across service types. They don't. Post-acute care — the skilled nursing, inpatient rehabilitation, and long-term hospital stays that follow a hospitalization — gets denied at rates far above the Medicare Advantage average of 7.7%: 12% for skilled nursing facilities (SNF), 54% for inpatient rehabilitation facilities (IRF), and 65% for long-term care hospitals (LTCH) — 1.6, 7.0, and 8.4 times the overall rate, respectively (<Cite id="kffpostacute">KFF, 2026</Cite>; <Cite id="oig2026snf">HHS OIG, 2026</Cite>).</p>
          <p>The evidence points toward tools built to hit savings targets, not just accuracy targets. UnitedHealth's overall post-acute-care denial rate rose from 8.7% in 2019 to 22.7% in 2022, coinciding with its adoption of the nH Predict algorithm through naviHealth, which predicts how many days of rehabilitation a patient should need (<Cite id="senatepsi">Senate PSI, 2024</Cite>). A 2026 federal audit found naviHealth — which alone processes half of all skilled nursing facility prior authorization requests nationwide — denied 14% of them, compared with 11% for internally reviewed requests and 9% for other outside contractors; when naviHealth's denials were appealed, 97% were overturned (<Cite id="oig2026snf">HHS OIG, 2026</Cite>). CVS ran a comparable program, "Post-Acute Analytics," initially projected to save $10 million to $15 million over three years — a projection the company revised upward to $77.3 million within months of launch (<Cite id="senatepsi">Senate PSI, 2024</Cite>). Humana's long-term-care-hospital denial rate rose 54% between 2020 and 2022, following internal training sessions that reportedly included guidance on how to justify denials to providers (<Cite id="senatepsi">Senate PSI, 2024</Cite>).</p>
          <p>The pattern is not universal, and it has limits. Nursing-home residents specifically were denied skilled-nursing-level care 40% of the time, versus 11% for other enrollees (<Cite id="oig2026snf">HHS OIG, 2026</Cite>) — which could reflect algorithmic targeting of a costlier population, or could reflect genuinely different medical-necessity thresholds for long-stay nursing-home patients; the public data cannot fully separate the two. And even within the highest-denial categories, most requests are still approved: 88% of skilled nursing facility requests, for instance, go through on the first try.</p>
          <p>The Medicare Advantage payment model supplies the institutional context: because plans keep the difference between their fixed per-enrollee payment and whatever care they actually deliver, every category of high-cost, hard-to-verify care is a candidate for tighter review — and post-acute care, which is expensive, common after a hospitalization, and clinically judgment-based, fits that profile precisely.</p>
          <DumbbellChart />
          <ChartInterpretation chartId="dumbbell" interp={interpFor("dumbbell")} onSubmit={onSubmitInterp} />
          {bySection("rq1").map(renderQuestion)}
          <p>Taken together, the evidence most strongly supports a mechanism where post-acute-care review tools are tuned toward meeting savings targets in the categories least likely to be independently checked — but the public record cannot cleanly separate how much of that effect is the algorithm itself versus the human incentive structure (savings targets, training on denial justification) surrounding it.</p>
          <GlossaryPanel items={GLOSSARY.rq1} />
        </section>

        {/* ============ RQ2 ============ */}
        <section id="sec-rq2" ref={registerRef("rq2")} className="section">
          <h2>RQ2 — What Does the Appeal Funnel Imply About the Denials Nobody Challenges?</h2>
          <p>The headline number regulators and journalists usually cite is the 7.7% denial rate. But that number only describes what insurers decided at the FIRST step. Of the 4.1 million requests Medicare Advantage insurers denied in 2024, just 11.5% were ever appealed. Of those appeals, 80.7% were partially or fully overturned — a share that has stayed above 80% every year since 2019 (<Cite id="kff2024pa">KFF, 2026</Cite>). That leaves the large majority of 2024 denials that were never independently reviewed by anyone at all — a gap the chart below makes concrete.</p>
          <p>A separate, older piece of evidence suggests that silent majority is not simply "correctly denied." In 2022, the HHS Office of Inspector General drew a RANDOM sample of prior authorization denials — not limited to appealed cases — from 15 of the largest Medicare Advantage insurers, and found that 13% met Medicare's own coverage rules and likely should have been approved, along with 18% of a separate sample of payment denials (<Cite id="oig2022">HHS OIG, 2022</Cite>). Because this sample was random rather than self-selected, it is a rare, defensible estimate of the error rate among ALL denials, not just the ones that get challenged.</p>
          <p>The 80%-plus overturn rate among appealed cases cannot simply be extrapolated onto the unappealed majority, because appealing is not random. Physicians report why they often don't: 67% doubt an appeal would succeed based on past experience, 55% say they lack the staff resources to file one, and more than half say a patient's care could not wait for the process (<Cite id="ama2025">AMA, 2025</Cite>). If the cases that get appealed are disproportionately the clearest, best-documented ones, the true error rate among the silent majority could be lower than 80% — or, if the barrier to appealing has nothing to do with how strong the case is, it could be just as high. The OIG's randomly sampled 13%–18% is the more defensible anchor for the unappealed population, precisely because it wasn't filtered by anyone's decision to appeal.</p>
          <p>The institutional check on this gap is thin. CMS currently collects only contract-level totals, not the plan-and-service-level detail that would show where the risk concentrates; it has begun a pilot to collect more granular data and expects to expand the requirement to all plans by 2027 (<Cite id="kff2024pa">KFF, 2026</Cite>) — meaning for now, the OIG's occasional, resource-intensive random-sample audits are essentially the only representative check that exists.</p>
          <p>Before the chart below reveals the full breakdown, work through two estimates using only the figures already stated above.</p>
          {["rq2b", "rq2c"].map((id) => renderQuestion(QUESTIONS.find((q) => q.id === id)))}
          <FunnelChart />
          <ChartInterpretation chartId="funnel" interp={interpFor("funnel")} onSubmit={onSubmitInterp} />
          {["rq2a", "rq2d"].map((id) => renderQuestion(QUESTIONS.find((q) => q.id === id)))}
          <p>The section's honest conclusion: the reported 7.7% denial rate is a floor on how often Medicare Advantage insurers withhold care that should be covered, not an estimate of it. The true rate is unknowable from public data alone, but it plausibly sits somewhere between the OIG's randomly sampled 13%–18% (a defensible lower-bound proxy for the silent majority) and the appeal-conditional 80%-plus overturn rate (an upper bound that almost certainly overstates the unappealed population, given how selective appealing is).</p>
          <GlossaryPanel items={GLOSSARY.rq2} />
        </section>

        {/* ============ RQ3 ============ */}
        <section id="sec-rq3" ref={registerRef("rq3")} className="section">
          <h2>RQ3 — Will the 2026–2027 CMS Rule Fix the Incentive, or Just Speed Up the Same Machine?</h2>
          <p>CMS finalized its Interoperability and Prior Authorization Final Rule (CMS-0057-F) in January 2024. Starting January 2026, it shortens the standard decision window from 14 days to 7 calendar days and requires plans to publicly report their approval, denial, and appeal-overturn rates. Starting January 2027, it requires four standardized data-sharing APIs, including one built specifically for electronic prior authorization requests (<Cite id="cms0057f">CMS, 2024</Cite>; <Cite id="kff2024pa">KFF, 2026</Cite>).</p>
          <p>Those provisions attack real problems. Public, plan-level overturn-rate reporting starting in 2026 directly targets the visibility gap described in RQ2 — for the first time, a regulator, journalist, or competing insurer will be able to see which specific plans look like Centene (95.5% overturn rate on appeal) versus Elevance (4.2% denial rate to begin with), rather than relying on industry-wide aggregates (<Cite id="kff2024pa">KFF, 2026</Cite>). And CMS's move toward collecting plan-and-service-level data, expected by 2027, is designed to let auditors find exactly the kind of category-specific outlier (skilled nursing facility care processed by naviHealth) documented in RQ1.</p>
          <p>What the rule does not do is touch the substance of the decision itself. Nothing in CMS-0057-F caps how much narrower a plan's internal clinical criteria can be relative to Medicare's own coverage rules — precisely the mechanism the 2022 OIG audit identified as a leading cause of wrongful denials. A separate, already-finalized rule would have required Medicare Advantage plans to formally analyze how their prior authorization policies affect beneficiaries with social risk factors starting in 2025; the incoming administration announced in June 2025 that it would not enforce that requirement (<Cite id="kff2024pa">KFF, 2026</Cite>) — a reminder that even a signed rule can be paused administratively. Most tellingly, CMS's own WISeR pilot, launched January 1, 2026, is expanding — not constraining — algorithmic prior authorization, testing "enhanced technology" for select services across six states of traditional Medicare, the very program that RQ1 and RQ2 show has historically had almost none of this friction (<Cite id="kff2024pa">KFF, 2026</Cite>; <Cite id="wiser">CMS WISeR, 2026</Cite>).</p>
          <p>Insurers, separately, made a voluntary pledge in summer 2025 to improve prior authorization on their own, and claim an 11% reduction in requests over the past year (<Cite id="axios2026">Axios, 2026</Cite>) — a self-reported, unaudited figure, distinct from the binding federal rule, and one that mirrors a 2018 industry consensus statement whose commitments a 2025 AMA survey found still largely unmet seven years later (<Cite id="ama2025">AMA, 2025</Cite>).</p>
          <IndexedChart />
          <ChartInterpretation chartId="indexed" interp={interpFor("indexed")} onSubmit={onSubmitInterp} />
          {bySection("rq3").map(renderQuestion)}
          <p>The section's honest conclusion: the 2026–2027 rule attacks speed and transparency, which is a necessary step toward closing the RQ2 visibility gap — but it leaves the RQ1 mechanism (savings-target-driven review criteria) untouched, and the government's own next move, WISeR, suggests the same tool is expanding rather than being constrained. "Faster and more visible, but not obviously fairer" is the most defensible near-term expectation.</p>
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
          <p>Medicare Advantage's prior authorization system will most likely become faster and more visible over 2026–2027 without becoming obviously more accurate, because the CMS rule fixes friction and disclosure while leaving the underlying capitated-savings incentive that rewards aggressive initial denial fully in place.</p>
          <p>For hospitals, skilled nursing facilities, and rehabilitation providers, that means continued cash-flow risk from post-acute denials even as appeal success stays high — working-capital planning and appeals staffing now matter as much as the underlying clinical case. For beneficiaries and their advocates, the appeal step, not the initial decision, is the single highest-leverage moment in the entire process — and 88.5% of denied requests never reach it. For insurers weighing entry into concentrated markets, like the 889 counties where two firms already hold at least 75% of Medicare Advantage share, a "friendlier prior authorization" pitch is a thin differentiator until 2026, when plan-level overturn rates finally become directly comparable.</p>
          <p>Institutionally, CMS's own WISeR pilot signals that the government's current answer to "algorithms may be over-denying" is procedural — more audits, more transparency, more standardized data formats — rather than substantive, such as capping how narrow a plan's clinical criteria can be or financially penalizing a high overturn rate directly. That pattern is consistent with how much harder it is to regulate a decision's substance than its speed or format.</p>
          <p>The single most important open question: once plan-by-plan overturn rates are finally public in 2026 and 2027, will that visibility change insurer behavior on its own, or will it — like the 2023 voluntary pledge whose commitments a 2025 AMA survey found still largely unmet — simply document the pattern without correcting it?</p>
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
    const key = q.section === "warmup" ? "Warm-Up (B/E)" : "Type " + q.type;
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
    // Weakest-part heuristic: shortest non-trivial answer, or first gap.
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
      <p>You've seen six data exhibits across this note. Before the article's own three insight cards appear, write in one sentence the single most non-obvious insight you'd defend to a skeptical hospital CFO or state insurance commissioner.</p>
      {!insightRevealed ? (
        <div className="interp-input-row">
          <textarea rows={2} value={insightDraft} onChange={(e) => setInsightDraft(e.target.value)} placeholder="Your governing insight..." />
          <button className="btn-secondary" disabled={insightDraft.trim().length < 15} onClick={() => setInsightRevealed(true)}>Reveal the article's three</button>
        </div>
      ) : (
        <div>
          <div className="reader-answer"><span className="micro-label">Your insight</span>{insightDraft}</div>
          <div className="insight-cards">
            <div className="insight-card">The reported 7.7% denial rate is a floor, not an estimate — appeal is a self-selected 11.5% of denials, so the error rate among the other 88.5% is simply unmeasured by this data.</div>
            <div className="insight-card">Algorithms concentrate their impact exactly where verification is hardest and dollars are biggest — post-acute categories combine the highest per-stay Medicare payments with the lowest odds a denial gets independently checked.</div>
            <div className="insight-card">Regulatory fixes aimed at speed and transparency are necessary but address a different problem than the one that produces wrongful denials — and the government's own WISeR pilot shows the same automated-review logic expanding, not contracting.</div>
          </div>
        </div>
      )}

      <h3>Apply It</h3>
      <p><strong>(a) Your context — transfer to a new domain.</strong> A corporate expense-approval system shows: <em>Travel</em> (denied 6%, overturned-on-appeal 30%), <em>Client entertainment</em> (denied 18%, overturned 25%), <em>Software</em> (denied 9%, overturned 40%), <em>Equipment</em> (denied 4%, overturned 85%) — Equipment has the lowest denial rate but by far the highest overturn rate, echoing the skilled-nursing-facility pattern in this note. Write four labeled parts:</p>
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
      <textarea rows={2} value={applyIt.crosslink} onChange={(e) => setApplyIt({ ...applyIt, crosslink: e.target.value })} placeholder="e.g., ER-04's 'a reported risk metric is a definition, not a fact of nature' reinforces today's point that a denial rate is defined by what gets appealed..." />

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
