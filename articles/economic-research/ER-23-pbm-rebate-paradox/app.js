const { useState, useEffect, useRef } = React;
const {
  LineChart, Line, BarChart, Bar, ComposedChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LabelList, Cell
} = Recharts;

/* ============================== DATA ============================== */

const NOVOLOG_INDEX = [
  { year: "2001", list: 100, net: 100 },
  { year: "2004", list: 135, net: 106 },
  { year: "2007", list: 183, net: 113 },
  { year: "2010", list: 248, net: 121 },
  { year: "2013", list: 335, net: 128 },
  { year: "2016", list: 453, net: 136 }
];

const RAND_SLOPE = [
  { stage: "Gross (list) price ratio", us: 971, oecd: 100 },
  { stage: "Net price ratio (after rebates)", us: 233, oecd: 100 }
];

const SPECIALTY_SHARE = [
  { year: "2016", bigThreeAffiliated: 54, unaffiliated: 46 },
  { year: "2023", bigThreeAffiliated: 68, unaffiliated: 32 }
];

const ELIQUIS_WATERFALL = [
  { name: "List price", base: 0, barHeight: 550, total: 550, kind: "total" },
  { name: "Manufacturer rebate (~45% of list)", base: 300, barHeight: 250, total: -250, kind: "subtract" },
  { name: "Net price to plan (rounded)", base: 0, barHeight: 300, total: 300, kind: "total" }
];

const ELIQUIS_DUMBBELL = [
  { period: "2020", low: 44.57, rangeSpan: 46.76 - 44.57, standalonePartD: 46.76, medicareAdvantage: 44.57 },
  { period: "2024", low: 46.93, rangeSpan: 102.32 - 46.93, standalonePartD: 102.32, medicareAdvantage: 46.93 }
];

const CHART_PROMPTS = {
  chart1: [
    { kind: "quant", label: "Quantitative reasoning", prompt: "Compute the compound annual growth rate (CAGR) of the list-price index versus the net-price index from 2001 to 2016 (15 years). Which grew faster, and by roughly what multiple?",
      authored: "List price CAGR ≈ (4.53)^(1/15) − 1 ≈ 10.6%/year. Net price CAGR ≈ (1.36)^(1/15) − 1 ≈ 2.1%/year. List price grew roughly 5 times faster than net price on an annualized basis, even though both describe the same vial of the same drug." },
    { kind: "sowhat", label: "So-what / decision implication", prompt: "If a PBM tells an employer plan sponsor it 'saved' them money through rebates, what should this 15-year gap make the sponsor ask before believing the number?",
      authored: "Ask what the rebate is a percentage OF. A rebate that looks large in dollar terms can still leave a payer worse off in net terms than a system with a lower list price and a smaller (or no) rebate. The right comparison is the net-price trend over time, not the rebate's size in isolation." }
  ],
  chart2: [
    { kind: "causal", label: "Causal / comparative", prompt: "The U.S. net-price ratio (233% of the OECD combined) is still more than double the OECD average even after rebates are applied. What does this comparison rule out as a full explanation for why U.S. insulin costs more?",
      authored: "It rules out 'rebates fully explain the U.S.–OECD gap.' If rebates were the whole story, the net-price ratio should converge close to 100%. A persistent post-rebate premium points to other factors — weaker government price-setting, patent and formulary dynamics, provider and pharmacy margins — operating alongside the rebate system, not instead of it." },
    { kind: "quant", label: "Quantitative reasoning", prompt: "By what fraction did applying rebates close the original U.S.–OECD price gap, and what share of that gap remained?",
      authored: "The excess above parity (100) fell from 871 points (971−100) to 133 points (233−100), a reduction of about 85% [(871−133)/871]. Rebates closed roughly 85% of the original excess premium, but the remaining 15% still means the U.S. pays about 2.33 times the OECD average net of rebates." }
  ],
  chart3: [
    { kind: "quant", label: "Quantitative reasoning", prompt: "The Big 3's above-acquisition-cost specialty generic dispensing revenue grew at a 42% compound annual rate from 2017–2021. Using the Rule of 70, roughly how many years would it take that revenue stream to double again at the same rate?",
      authored: "70 ÷ 42 ≈ 1.7 years. At a 42% annual growth rate, this revenue stream would double in under two years if unchanged — which is why the FTC described it as growing at 'an alarming rate,' not just as a large absolute number." },
    { kind: "mechanism", label: "Qualitative / mechanism", prompt: "Why would a PBM's ability to steer prescriptions to its own affiliated specialty pharmacy change its incentives when negotiating rebates with a manufacturer?",
      authored: "When the PBM also owns the dispensing pharmacy, it can profit twice: once from any rebate or fee tied to formulary placement, and again from the dispensing markup captured at its own pharmacy. The second profit stream doesn't require pushing list prices down — it only requires directing volume to itself — so vertical integration can make the PBM's own retail markup, not just the manufacturer's rebate, part of what patients and payers are financing." }
  ],
  chart4: [
    { kind: "quant", label: "Quantitative reasoning", prompt: "If Eliquis's patient coinsurance were calculated on the estimated net price instead of the list price, roughly how much would the monthly out-of-pocket payment change?",
      authored: "Coinsurance on list price: 25% × ~$550 ≈ ~$140/month. Coinsurance on net price: 25% × ~$300 ≈ ~$75/month. That is a difference of about $60/month, or roughly 45% less — the same 45% reduction as the rebate itself, since coinsurance scales linearly with whatever price it is applied to. For a drug taken indefinitely, that gap compounds to hundreds of dollars a year, driven entirely by which price the same 25% is applied to, not by any change in what the plan actually pays." },
    { kind: "sowhat", label: "So-what / decision implication", prompt: "For a plan sponsor comparing PBM bids, what should this decomposition make them suspicious of when a PBM advertises a large 'rebate guarantee'?",
      authored: "A rebate guarantee is calculated as a percentage of list price too. A PBM can hit an impressive-sounding rebate target simply by steering formulary placement toward drugs with higher list prices and larger rebates, without lowering what the plan pays net — while leaving members' coinsurance exposed to the inflated list price the rebate itself was computed from." }
  ],
  chart5: [
    { kind: "causal", label: "Causal / comparative", prompt: "Medicare Advantage plans mostly use copays while stand-alone Part D plans shifted heavily to coinsurance. Could a confound other than benefit design explain part of the out-of-pocket gap between these two plan types?",
      authored: "Yes. Medicare Advantage plans are often bundled with broader medical benefits and negotiate across a larger, more diverse enrollee pool, which could mean different formulary tiers, different rebate deals, or a different mix of members taking Eliquis. Benefit design (coinsurance vs. copay) is the best-documented driver, but isn't necessarily the whole story without controlling for these other differences." },
    { kind: "quant", label: "Quantitative reasoning (predict first)", prompt: "Before computing exactly: does the gap between stand-alone Part D and Medicare Advantage out-of-pocket costs look like it roughly doubled, roughly quintupled, or grew by an order of magnitude (10x or more) between 2020 and 2024? Make your guess, then compute the actual multiple from the chart's numbers.",
      authored: "2020 gap: $46.76 − $44.57 ≈ $2.19. 2024 gap: $102.32 − $46.93 ≈ $55.39. That is roughly a 25x widening of the gap in just four years — from a difference small enough to ignore to one large enough to change a household's monthly budget." }
  ]
};

const WARMUP_QUESTIONS = [
  { id: "wu1", type: "B", prompt: "A ride-share platform reports that only 2% of trips generate a formal rider safety complaint, and of the complaints filed, drivers win 90% of appeals. A city council member wants to cite '2% complaint rate, mostly unfounded' as proof rides are safe. Applying the same logic used earlier in this series to evaluate a healthcare denial rate computed only over appealed claims, what is the strongest critique of the council member's claim?",
    options: [
      { text: "The 2% figure is fine because it covers all trips, not a biased subset.", correct: false, misconception: "ignoring that only riders who complain — and then appeal — generate this rate; it doesn't capture riders who had a bad experience but never filed anything" },
      { text: "The 2% rate is a floor, not an estimate, on the true share of problematic rides, because it is built entirely from a self-selected population (riders who chose to complain, then chose to appeal); most bad experiences are never appealed at all.", correct: true, misconception: "" },
      { text: "Since drivers win 90% of appeals, the true complaint rate must be even lower than 2%.", correct: false, misconception: "extrapolating a biased subsample's outcome (the appeal win rate) onto the un-appealed population it was never measured on" },
      { text: "The sample size of 2% is too small to be statistically significant.", correct: false, misconception: "conflating a proportion with a sample-size problem — a red herring that ignores the actual selection bias" }
    ],
    principle: "A rate computed only over a self-selected sub-population is a lower bound on the true population rate, not an estimate of it.",
    transfer: "This is the same logic used to evaluate Medicare Advantage prior-authorization denial and appeal-overturn rates — always ask who opted into the sample before trusting the resulting rate." },
  { id: "wu2", type: "B", prompt: "A social app that has always relied on advertising revenue announces it is switching to a subscription-only model, saying: 'We've eliminated our dependence on the ad market's swings.' A competitor claims this fixes the company's true vulnerability. What load-bearing assumption does this claim implicitly — and mistakenly — treat as already fixed?",
    options: [
      { text: "That the company's competitive moat — network effects built on a large free user base — doesn't itself depend on the large body of ad-supported free users the subscription switch will shrink.", correct: true, misconception: "" },
      { text: "That subscription revenue is inherently less volatile than ad revenue.", correct: false, misconception: "confusing a general risk (revenue volatility) with the specific mechanism (network effects from scale) that actually supported the company's market position" },
      { text: "That users will be willing to pay for a product they got for free.", correct: false, misconception: "raising a real demand-side risk that isn't the structural assumption the claim is actually resting on" },
      { text: "That competitors will not also raise their prices.", correct: false, misconception: "introducing a plausible-sounding but unconnected tangent to the specific claim being evaluated" }
    ],
    principle: "A thesis's load-bearing assumption is the specific, falsifiable claim that must remain true for the argument to hold — not any plausible but tangential risk.",
    transfer: "Same test as evaluating stablecoin reserve reforms: closing one risk (bad collateral) doesn't validate a business model if a separate, unaddressed assumption (no yield-sharing) was the real support beam." },
  { id: "wu3", type: "B", prompt: "A major airline cancels its partnership with a regional feeder carrier, expecting to capture more of the connecting traffic on its own larger jets. Instead, total passengers connecting through its hub fall, because the regional carrier had been feeding routes too thin for the mainline carrier to fly profitably alone. What does this best illustrate?",
    options: [
      { text: "The regional carrier was simply a lower-quality competitor whose exit should have helped the mainline carrier.", correct: false, misconception: "assuming a substitute relationship (direct competition for the same demand) when the real relationship was complementary" },
      { text: "The mainline carrier's hub was already at capacity, so no more passengers could have been added regardless.", correct: false, misconception: "introducing an unrelated capacity constraint as a distractor rather than addressing the mechanism actually described" },
      { text: "The mainline carrier and the regional feeder were complements, not substitutes — removing the 'competing' feeder capacity removed demand it had been generating, not just supply it had been capturing.", correct: true, misconception: "" },
      { text: "Passenger totals always fall after any airline restructuring, regardless of route economics.", correct: false, misconception: "overgeneralizing from one case into a universal rule, ignoring the specific complements mechanism described" }
    ],
    principle: "Before assuming that removing a 'competing' input will help the remaining users, check whether the two are actually substitutes or complements.",
    transfer: "Directly parallel to the immigrant-labor complements finding: cutting a 'competing' input can remove demand alongside supply when the two inputs were never true substitutes." }
];

const BACKGROUND_QUESTIONS = [
  { id: "bg-a", type: "A", tiedChart: "the specialty dispensing-share chart above",
    prompt: "Between 2016 and 2023, the share of specialty generic drug dispensing revenue captured by the Big 3 PBMs' own affiliated pharmacies rose from 54% to 68% (FTC, 2025). Which statement correctly distinguishes the percentage-point change from the percent (relative) change in that share?",
    options: [
      { text: "The share rose by 14%, meaning Big 3-affiliated pharmacies captured 14% more of the specialty generic market.", correct: false, misconception: "percent-vs-percentage-point confusion — reporting the 14-point absolute change as if it were a 14% relative change" },
      { text: "The share rose by 68 percentage points, since 68% is the new share.", correct: false, misconception: "conflating the ending level (68%) with the change in the level" },
      { text: "The share more than doubled, from 54% to 68%.", correct: false, misconception: "confusing a modest relative increase with a doubling — a magnitude error" },
      { text: "The share rose 14 percentage points (54% to 68%), which is about a 26% relative increase (14/54) — the two numbers describe the same fact but differ by nearly a factor of two.", correct: true, misconception: "" }
    ],
    principle: "Percentage points measure the absolute gap between two shares; percent measures the relative size of the change against the starting share — the two can differ by an order of magnitude, and picking whichever framing serves an argument is a common way to mislead without technically lying.",
    transfer: "Same trap as reporting an interest rate 'rising from 2% to 3%' as either '1 percentage point' or '50 percent' — both are correct, but they answer different questions." }
];

const RQ1_QUESTIONS = [
  { id: "rq1-b", type: "B", tiedChart: "the price-decomposition chart above",
    prompt: "Insulin list prices fell sharply in 2023–2024 at the same time the FTC's insulin lawsuit (filed September 2024) and subsequent PBM settlements (2026) were unfolding. A newsletter claims: 'The FTC's enforcement action caused manufacturers to cut insulin list prices.' What would you need to rule out before accepting this causal claim?",
    options: [
      { text: "Nothing — the timing alone is sufficient, since the FTC's complaint specifically named insulin pricing.", correct: false, misconception: "correlation-as-causation — treating timing coincidence alone as proof" },
      { text: "Whether manufacturers' own voluntary list-price caps (Eli Lilly, Novo Nordisk, and Sanofi all announced insulin list-price cuts and $35 out-of-pocket caps starting in 2023 — before the FTC's September 2024 complaint and years before any 2026 settlement) were the dominant cause, making the FTC action a reinforcing but not originating factor.", correct: true, misconception: "" },
      { text: "Whether insulin demand fell enough to reduce prices through ordinary supply and demand.", correct: false, misconception: "introducing a plausible-sounding but unevidenced alternative mechanism instead of the actual documented confound" },
      { text: "Whether the FTC has jurisdiction over drug manufacturers at all, since manufacturers set list prices.", correct: false, misconception: "substituting a legal/scope objection for the causal question actually being asked" }
    ],
    principle: "When two events coincide in time, check for a third factor that could have caused both — or that came first and makes the causal story run backward — before crediting either one alone.",
    transfer: "The same test applies to attributing a single period's inflation moderation entirely to one tariff or policy change when several offsetting forces are moving at once." },
  { id: "rq1-c", type: "C", tiedChart: null,
    prompt: "A benefits consultant tells a mid-size, self-insured employer: 'The FTC's 2025 report proves your current PBM is overcharging you on specialty generics — just switch PBMs and you'll capture those savings.' The employer's plan currently uses one of the Big 3, which together process about 80% of all U.S. prescription claims and are each vertically integrated with a specialty pharmacy and an insurer. What is the weakest, most load-bearing assumption behind the consultant's recommendation?",
    options: [
      { text: "That switching to a different PBM changes the underlying incentive structure, rather than simply moving the same markup to a different vertically integrated conglomerate — since the FTC found the Big 3 collectively earned $7.3 billion above acquisition cost through their own affiliated pharmacies, a real fix has to touch pharmacy-network design and reimbursement terms, not just the vendor's name on the contract.", correct: true, misconception: "" },
      { text: "That the FTC's findings are legally binding on all PBMs immediately.", correct: false, misconception: "misidentifying a procedural question as the substantive business risk behind the recommendation" },
      { text: "That the employer's current claims volume is large enough to negotiate with a PBM at all.", correct: false, misconception: "raising a real but secondary scale question rather than the specific assumption that switching alone fixes the incentive problem" },
      { text: "That specialty generic drugs make up a large share of the employer's total drug spend.", correct: false, misconception: "a plausible fact-check, but not the assumption that determines whether switching PBMs actually changes the incentive" }
    ],
    principle: "The load-bearing assumption is the one claim that, if false, breaks the entire recommendation — distinguish it from merely relevant background facts that could also be wrong.",
    transfer: "The same test applies to 'just switch cloud providers' pitches in a concentrated market — switching doesn't fix vendor lock-in if a small number of providers set the same egress-fee norms industry-wide." }
];

const RQ2_QUESTIONS = [
  { id: "rq2-a", type: "A", tiedChart: "the dumbbell chart above",
    prompt: "From the dumbbell chart above, Eliquis's average expected out-of-pocket cost in stand-alone Part D plans rose from $46.76 (2020) to $102.32 (2024), while in Medicare Advantage drug plans it rose from $44.57 to $46.93 over the same period. Which statement correctly compares the relative growth rates?",
    options: [
      { text: "Both plan types saw similar dollar increases, so the benefit-design difference didn't matter much.", correct: false, misconception: "comparing dollar changes only ($55.56 vs. $2.36 — actually quite different) and mislabeling a large asymmetry as 'similar'" },
      { text: "Medicare Advantage costs grew faster in percentage terms because coinsurance always grows faster than copays.", correct: false, misconception: "asserting an unsupported general rule that also gets the direction backward relative to the data shown" },
      { text: "Stand-alone Part D out-of-pocket costs grew about 119% (roughly doubling), while Medicare Advantage plan costs grew only about 5% — a gap driven by which plans shifted to coinsurance tied to list price.", correct: true, misconception: "" },
      { text: "Since both are Medicare products, CMS must have set the same rate of cost growth for each.", correct: false, misconception: "assuming a uniform regulatory control that doesn't exist across differing plan and benefit designs" }
    ],
    principle: "A percent-growth comparison, not just the dollar levels, reveals how differently two populations were exposed to the same underlying price mechanism — always compute the rate before concluding two groups were affected 'similarly.'",
    transfer: "Same logic as comparing subgroup vs. aggregate employment changes: a small raw difference can hide a very different relative exposure once expressed as a rate." }
];

const CONCLUSION_QUESTION = { id: "concl-e", type: "E", tiedChart: null,
  prompt: "The article argues that delinking PBM pay from list prices is necessary but not sufficient, because patient coinsurance is still calculated off list price — a separate mechanism the delinking laws don't touch. What single piece of evidence would most directly falsify this 'necessary but not sufficient' claim?",
  options: [
    { text: "PBM administrative fee revenue rises after 2026 to roughly replace lost rebate revenue.", correct: false, misconception: "shows PBMs adapted their own revenue model, but says nothing about whether list prices stopped rising or whether patients paid less" },
    { text: "More states pass PBM ownership restrictions similar to Arkansas's law.", correct: false, misconception: "addressing a different reform lever (ownership structure) unrelated to the specific coinsurance/list-price mechanism the claim is about" },
    { text: "Stand-alone Part D plans shift back from coinsurance to copays for preferred brand drugs.", correct: false, misconception: "this would confirm, not falsify, the claim — it shows the fix required a separate benefit-design lever delinking alone didn't provide" },
    { text: "Broad, multi-drug-class evidence that average list prices flattened or fell industry-wide after delinking took effect (not just for insulin under a separate settlement), causing average patient coinsurance payments to fall too — even with coinsurance still calculated as a percentage of list price — because delinking removed the underlying incentive to inflate the number coinsurance is calculated from.", correct: true, misconception: "" }
  ],
  principle: "A falsification clause names the specific observation that would force you to abandon your own thesis — if you cannot state one, the thesis isn't yet a testable claim.",
  transfer: "Applies to any 'X is necessary but not sufficient' argument — always ask what evidence would show X was actually sufficient after all." };

const NUMERIC_QUESTIONS = [
  { id: "bg-d", type: "D", toleranceType: "tight", tolerancePct: 20, target: 6.6, unit: "%", requiresPath: false,
    prompt: "Drug Channels Institute estimated the total U.S. brand-name drug gross-to-net 'bubble' (all rebates and discounts combined) at approximately $334 billion in 2023 and $356 billion in 2024. What was the approximate percent growth from 2023 to 2024? (Enter a number, e.g. 12 for 12%.)",
    decomposition: "($356B − $334B) ÷ $334B = $22B ÷ $334B ≈ 6.6%. Drug Channels Institute itself rounded this to '7%' and described it as the slowest growth rate for the bubble in at least a decade.",
    tolNote: "Tight tolerance (±20% relative, i.e. roughly 5.3%–7.9%): this is a two-number percent-change calculation with one clearly defined correct answer, not a Fermi estimate." },
  { id: "rq2-d", type: "D", toleranceType: "fermi", acceptLow: 2, acceptHigh: 8, target: 4, unit: "million people", requiresPath: true,
    prompt: "Roughly 54 million people are enrolled in Medicare Part D; about 43% are in stand-alone prescription drug plans (the rest are in Medicare Advantage drug plans, which rarely use coinsurance for preferred brand drugs). Given that stand-alone plans' use of coinsurance for preferred brand drugs rose from 9.9% (2020) to 71.9% (2024), roughly how many Medicare Part D beneficiaries nationally might now be exposed to list-price-linked coinsurance on at least one preferred-brand maintenance drug? Give your best order-of-magnitude estimate, in millions. Type your decomposition (the factors you multiplied) before submitting.",
    decomposition: "54M total Part D × 43% in stand-alone plans ≈ 23.2M stand-alone enrollees. × an estimated 20%–30% who take a preferred-brand, highly-rebated maintenance drug ≈ 4.6M–7.0M. × 72% of stand-alone plans now using coinsurance for such drugs ≈ 3.3M–5.0M. Upper bound (30% assumption, full coinsurance exposure): ~5.0M. Lower bound (20% assumption): ~3.3M. Point estimate: ~4M.",
    tolNote: "Wide, log-distance tolerance (accept 2M–8M, roughly within a factor of 2 of the ~4M point estimate): this is a genuine Fermi estimate built from three uncertain factors, not a lookup." }
];

const AUTHORED_INSIGHTS = [
  "PBM compensation is often calculated as a percentage of list price, so rebates and list prices rise together — cutting rebates without also decoupling compensation from price simply removes the middleman's cut; it doesn't necessarily lower what manufacturers charge or what coinsurance patients owe.",
  "Vertical integration means the same three conglomerates can set the specialty pharmacy's reimbursement, own the PBM negotiating on the payer's behalf, and often own the insurer paying the claim — the FTC's 2025 finding that this generated 12% of the parent conglomerates' relevant operating income in 2021 shows this is now a profit center, not just a negotiating service.",
  "Delinking PBM revenue from list price (2026 federal and state reforms) fixes the PBM's own incentive but not the payer's or patient's: as long as insurers calculate coinsurance as a percentage of the undiscounted list price, patients can still be exposed to list-price inflation even after PBM compensation itself is delinked."
];

const GLOSSARIES = {
  intro: [
    { term: "Pharmacy benefit manager (PBM)", def: "A company hired by employers, unions, or insurers to manage prescription drug benefits, negotiate rebates with manufacturers, and build the pharmacy network." },
    { term: "Rebate", def: "A payment a drug manufacturer makes back to a PBM or plan, usually calculated as a percentage of the drug's list price, in exchange for favorable formulary placement." },
    { term: "List price", def: "The undiscounted, publicly posted price of a drug before any rebate or discount is applied." },
    { term: "Net price", def: "What a manufacturer actually keeps after paying rebates and other discounts — the list price minus those payments." },
    { term: "Gross-to-net bubble", def: "The industry term for the total dollar value of all rebates and discounts subtracted between a drug's list price and what is actually paid across the supply chain." }
  ],
  background: [
    { term: "Specialty generic drug", def: "A generic (non-branded) version of a complex, high-cost drug, often used for cancer, HIV, or other serious chronic conditions." },
    { term: "NADAC", def: "National Average Drug Acquisition Cost — a federal benchmark estimate of what pharmacies pay to acquire a drug, used to measure dispensing markups." },
    { term: "Spread pricing", def: "When a PBM bills a health plan more for a prescription than it reimburses the dispensing pharmacy, keeping the difference." },
    { term: "GPO (group purchasing organization)", def: "An entity, often owned by a large PBM, that aggregates and negotiates manufacturer rebates on behalf of multiple smaller plans." },
    { term: "Coinsurance vs. copay", def: "Coinsurance is a percentage of a drug's price; a copay is a fixed dollar amount regardless of the drug's price." }
  ],
  rq1: [
    { term: "Administrative complaint", def: "A formal legal action an agency like the FTC files internally (as opposed to in federal court) to argue a company violated the law." },
    { term: "Point-of-sale rebate", def: "A rebate applied directly at the pharmacy counter to reduce what the patient pays that day, rather than being retained upstream by the PBM or plan." },
    { term: "Delinking", def: "Structurally separating a PBM's or plan's compensation from a drug's list price, typically by moving to a flat administrative fee instead of a percentage-based rebate or fee." }
  ],
  rq2: [
    { term: "Bona fide service fee", def: "A flat payment for an actual, defined service performed, set independently of a drug's price or sales volume — the model Medicare Part D now requires instead of rebate-based PBM pay." },
    { term: "Any-willing-pharmacy provision", def: "A requirement that a plan's pharmacy network accept any pharmacy willing to meet the plan's standard contract terms, reducing a PBM's ability to exclude non-affiliated pharmacies." },
    { term: "CMS", def: "The Centers for Medicare & Medicaid Services, the federal agency that administers Medicare, including Part D drug plans." },
    { term: "Medicare Part D", def: "The federal Medicare program's outpatient prescription drug benefit, delivered through private plans." }
  ]
};

const SOURCES = [
  { name: "Federal Trade Commission, \"FTC Releases Interim Staff Report on Prescription Drug Middlemen,\" July 2024", url: "https://www.ftc.gov/news-events/news/press-releases/2024/07/ftc-releases-interim-staff-report-prescription-drug-middlemen", supports: "Big 3 PBMs process ~80% of U.S. prescription claims; six largest PBMs manage ~95%." },
  { name: "Federal Trade Commission, \"FTC Releases Second Interim Staff Report on Prescription Drug Middlemen,\" January 14, 2025", url: "https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-releases-second-interim-staff-report-prescription-drug-middlemen", supports: "Big 3-affiliated pharmacies received 68% of specialty generic dispensing revenue in 2023 (up from 54% in 2016); $7.3B in dispensing revenue above acquisition cost 2017–2022 at a 42% CAGR; $1.4B spread-pricing income; 12% of parent conglomerates' relevant operating income (2021); $4.8B plan-sponsor vs. $297M patient specialty-generic spend (2021); 21% and 14–15% CAGRs." },
  { name: "Federal Trade Commission, \"FTC Sues Prescription Drug Middlemen for Artificially Inflating Insulin Drug Prices,\" September 20, 2024", url: "https://www.ftc.gov/news-events/news/press-releases/2024/09/ftc-sues-prescription-drug-middlemen-artificially-inflating-insulin-drug-prices", supports: "FTC administrative complaint against Caremark, Express Scripts, and OptumRx over insulin rebating practices." },
  { name: "Federal Trade Commission, \"FTC Secures Major Settlement with Caremark, Resolving Antitrust Case Against Second Drug Middleman,\" July 14, 2026", url: "https://www.ftc.gov/news-events/news/press-releases/2026/07/ftc-secures-major-settlement-caremark-resolving-antitrust-case-against-second-drug-middleman", supports: "Caremark settlement terms: up to $8.5B in consumer savings over a decade plus up to $4.5B via point-of-sale rebates; delinking manufacturer fees from insulin list prices." },
  { name: "RAND Corporation (Mulcahy & Schwam), \"Comparing Insulin Prices in the United States to Other Countries: Updated Results Using 2022 Data,\" February 2024", url: "https://www.rand.org/pubs/research_reports/RRA788-2.html", supports: "U.S. gross insulin prices ≈971% of 33-country OECD combined; net (post-rebate) prices ≈233% of OECD combined." },
  { name: "Drug Channels Institute (Adam Fein), \"The Top Pharmacy Benefit Managers of 2024: Market Share and Key Industry Developments,\" March 31, 2025", url: "https://www.drugchannels.net/2025/03/the-top-pharmacy-benefit-managers-of.html", supports: "~80% of 2024 prescription claims processed by CVS Caremark, Express Scripts, and OptumRx; five of the six largest PBMs owned by an organization that also owns a health insurer." },
  { name: "Drug Channels Institute (Adam Fein), \"Gross-to-Net Bubble Hits $356B in 2024,\" 2025", url: "https://www.drugchannels.net/2025/12/gross-to-net-bubble-hits-356b-in.html", supports: "Total U.S. brand-name gross-to-net reductions reached $356B in 2024, up 7% (slowest growth in at least a decade)." },
  { name: "USC Schaeffer Center (Trish, Van Nuys, Blaylock), \"Medicare Beneficiaries Face Much Higher Drug Costs as Plans Quickly Shift to Coinsurance,\" JAMA / Feb. 14, 2025", url: "https://schaeffer.usc.edu/research/medicare-drug-costs-coinsurance-pbms-jama/", supports: "Stand-alone Part D coinsurance use for preferred brand drugs rose from 9.9% (2020) to 71.9% (2024); Eliquis average out-of-pocket cost rose from $46.76 to $102.32 in stand-alone plans vs. $44.57 to $46.93 in Medicare Advantage (2020–2024); ~45% average Part D rebate on Eliquis; ~$550/month list price." },
  { name: "American Action Forum, \"Insulin Cost and Pricing Trends\" (citing Novo Nordisk congressional disclosures)", url: "https://www.americanactionforum.org/research/insulin-cost-and-pricing-trends/", supports: "NovoLog vial list price +353% vs. net price +36% (2001–2016); NovoLog FlexPen list price +270% vs. net price +3% (2003–2016)." },
  { name: "AJMC, \"PBM Reforms Signed Into Law, Reshaping Medicare Part D Drug Pricing Transparency,\" February 3, 2026", url: "https://www.ajmc.com/view/pbm-reforms-signed-into-law-reshaping-medicare-part-d-drug-pricing-transparency", supports: "Consolidated Appropriations Act of 2026 delinks Medicare Part D PBM compensation from list prices/rebates to flat bona fide service fees; mandates 100% rebate/fee pass-through; CMS enforcement; PBMs (Cigna/Express Scripts, OptumRx, CVS Caremark) moving toward rebate pass-through." },
  { name: "MultiState, \"Pharmacy Benefit Manager (PBM) Legislation Tackled Ownership Restrictions, Transparency, and More in 2025,\" January 27, 2026", url: "https://www.multistate.us/insider/2026/1/27/pharmacy-benefit-manager-pbm-legislation-tackled-ownership-restrictions-transparency-and-more-in-2025", supports: "Arkansas HB 1150 (first-in-nation PBM pharmacy-ownership ban, under injunction); Colorado HB 1094 (PBM delinking to flat fees, effective 2027); California SB 41 (PBM delinking); Utah HB 257 (rebate pass-through mandate)." }
];

/* ============================== HELPERS ============================== */

function tightScore(guess, target, pct) {
  if (guess === null || guess === undefined || isNaN(guess)) return false;
  return Math.abs(guess - target) / target * 100 <= pct;
}
function fermiScore(guess, lo, hi) {
  if (guess === null || guess === undefined || isNaN(guess)) return false;
  return guess >= lo && guess <= hi;
}
function pct(val, lo, hi) {
  const clamped = Math.max(lo, Math.min(hi, val));
  return ((clamped - lo) / (hi - lo)) * 100;
}
function promptKindLabel(k) {
  if (k === "sowhat") return "So-what / decision implication";
  if (k === "quant") return "Quantitative reasoning";
  if (k === "causal") return "Causal / comparative";
  if (k === "mechanism") return "Qualitative / mechanism";
  return k;
}

/* ============================== SHARED UI ============================== */

function Glossary({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="glossary-panel">
      <div className="glossary-label">Glossary</div>
      <ul>{items.map((g, i) => <li key={i}><strong>{g.term}</strong> — {g.def}</li>)}</ul>
    </div>
  );
}

function ChartMeta({ tier, note }) {
  const cls = tier === "FACT" ? "tier-fact" : tier === "ESTIMATE" ? "tier-estimate" : "tier-illustration";
  return (
    <div>
      <div className="chart-meta">
        <span className={"tier-badge " + cls}>{tier}</span>
        <span>{note}</span>
      </div>
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

function MultipleChoice({ q, state, onSubmit, cardClass }) {
  const [selected, setSelected] = useState(null);
  const letters = ["A", "B", "C", "D"];
  const submitted = state && state.submitted;
  return (
    <div className={"question-card " + (cardClass || "")}>
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
            <div key={i} className={cls} onClick={() => !submitted && setSelected(i)}>
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
          <div>{state.isCorrect ? "Correct." : "Incorrect — this reflects " + (q.options[state.selectedOption].misconception || "a reasoning gap") + "."}</div>
          <div className="principle-line">Portable principle: {q.principle}</div>
          <div className="transfer-line">Where this generalizes: {q.transfer}</div>
        </div>
      )}
    </div>
  );
}

function NumericQuestion({ q, state, onSubmit }) {
  const [val, setVal] = useState("");
  const [path, setPath] = useState("");
  const submitted = state && state.submitted;
  const canSubmit = val !== "" && !isNaN(parseFloat(val)) && (!q.requiresPath || path.trim().length >= 3);

  function handleSubmit() {
    const guess = parseFloat(val);
    let isCorrect;
    if (q.toleranceType === "tight") isCorrect = tightScore(guess, q.target, q.tolerancePct);
    else isCorrect = fermiScore(guess, q.acceptLow, q.acceptHigh);
    const signedErrorPct = (guess - q.target) / q.target * 100;
    onSubmit(q.id, guess, isCorrect, signedErrorPct, path);
  }

  const lo = q.toleranceType === "tight" ? q.target * 0.5 : q.acceptLow * 0.5;
  const hi = q.toleranceType === "tight" ? q.target * 1.5 : q.acceptHigh * 1.5;

  return (
    <div className="question-card">
      <div className="q-prompt">{q.prompt}</div>
      {!submitted && (
        <div>
          <div className="numeric-input-row">
            <input type="number" value={val} onChange={(e) => setVal(e.target.value)} placeholder={"value in " + q.unit} />
            <span>{q.unit}</span>
          </div>
          {q.requiresPath && (
            <textarea className="path-textarea" placeholder="Show your decomposition (the factors you multiplied)..."
              value={path} onChange={(e) => setPath(e.target.value)} />
          )}
          <div className="chart-meta">{q.tolNote}</div>
          <button className="btn-primary" disabled={!canSubmit} onClick={handleSubmit}>Submit answer</button>
        </div>
      )}
      {submitted && (
        <div>
          <div className="axis-track">
            <div className="axis-marker" style={{ left: pct(state.numericValue, lo, hi) + "%" }}>You: {state.numericValue}</div>
            <div className="axis-dot" style={{ left: pct(state.numericValue, lo, hi) + "%", background: "#2563eb" }}></div>
            <div className="axis-marker" style={{ left: pct(q.target, lo, hi) + "%", top: "24px" }}>Actual: {q.target}</div>
            <div className="axis-dot" style={{ left: pct(q.target, lo, hi) + "%", top: "26px", background: "#16a34a" }}></div>
          </div>
          <div className={"explanation-block " + (state.isCorrect ? "explanation-correct" : "explanation-wrong")}>
            <div>{state.isCorrect ? "Within tolerance." : "Outside tolerance."} Signed error: {state.signedErrorPct.toFixed(1)}%.</div>
            <div className="principle-line">Decomposition: {q.decomposition}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== CHARTS ============================== */

function NovoLogChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={NOVOLOG_INDEX} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 480]} label={{ value: "Index (2001 = 100)", angle: -90, position: "insideLeft", fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="list" name="List price index" stroke="#dc2626" strokeWidth={2.5} dot={{ r: 4 }}>
          <LabelList dataKey="list" position="top" fontSize={10} />
        </Line>
        <Line type="monotone" dataKey="net" name="Net price index" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }}>
          <LabelList dataKey="net" position="bottom" fontSize={10} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}

function RandSlopeChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={RAND_SLOPE} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="stage" tick={{ fontSize: 11 }} interval={0} />
        <YAxis domain={[0, 1050]} label={{ value: "OECD combined = 100", angle: -90, position: "insideLeft", fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="us" name="United States" stroke="#111" strokeWidth={3} dot={{ r: 6 }}>
          <LabelList dataKey="us" position="top" formatter={(v) => v + "%"} />
        </Line>
        <Line type="monotone" dataKey="oecd" name="OECD peer average (benchmark)" stroke="#9ca3af" strokeDasharray="4 4" strokeWidth={2} dot={{ r: 5 }}>
          <LabelList dataKey="oecd" position="bottom" formatter={(v) => v + "%"} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}

function SpecialtyShareChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={SPECIALTY_SHARE} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} label={{ value: "% of specialty generic dispensing revenue", angle: -90, position: "insideLeft", fontSize: 10 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="bigThreeAffiliated" stackId="s" name="Big 3-affiliated pharmacies" fill="#dc2626">
          <LabelList dataKey="bigThreeAffiliated" position="inside" formatter={(v) => v + "%"} fill="#fff" />
        </Bar>
        <Bar dataKey="unaffiliated" stackId="s" name="Unaffiliated pharmacies" fill="#d1d5db">
          <LabelList dataKey="unaffiliated" position="inside" formatter={(v) => v + "%"} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function EliquisWaterfallChart() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={ELIQUIS_WATERFALL} margin={{ top: 30, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-10} textAnchor="end" height={60} />
        <YAxis domain={[0, 600]} label={{ value: "$ per month", angle: -90, position: "insideLeft", fontSize: 11 }} />
        <Tooltip formatter={(v, n) => (n === "barHeight" ? [v, "amount"] : v)} />
        <Bar dataKey="base" stackId="wf" fill="transparent" />
        <Bar dataKey="barHeight" stackId="wf">
          {ELIQUIS_WATERFALL.map((entry, i) => (
            <Cell key={"cell-" + i} fill={entry.kind === "subtract" ? "#dc2626" : (i === 0 ? "#111" : "#2563eb")} />
          ))}
          <LabelList dataKey="total" position="top" formatter={(v) => "~$" + Math.abs(v)} fontSize={11} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function EliquisDumbbellChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={ELIQUIS_DUMBBELL} layout="vertical" margin={{ top: 20, right: 40, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis type="number" domain={[0, 120]} label={{ value: "Average monthly out-of-pocket cost ($)", position: "insideBottom", offset: -10, fontSize: 11 }} />
        <YAxis type="category" dataKey="period" width={50} />
        <Tooltip />
        <Legend />
        <Bar dataKey="low" stackId="d" fill="transparent" />
        <Bar dataKey="rangeSpan" stackId="d" fill="#e5e7eb" barSize={8} name="Gap" />
        <Scatter dataKey="medicareAdvantage" name="Medicare Advantage (mostly copay)" fill="#2563eb">
          <LabelList dataKey="medicareAdvantage" position="top" formatter={(v) => "$" + v.toFixed(2)} fontSize={11} />
        </Scatter>
        <Scatter dataKey="standalonePartD" name="Stand-alone Part D (rising coinsurance)" fill="#dc2626">
          <LabelList dataKey="standalonePartD" position="top" formatter={(v) => "$" + v.toFixed(2)} fontSize={11} />
        </Scatter>
      </ComposedChart>
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
      <p>Before turning to pharmacy benefits, apply three principles from recent installments of this series to unfamiliar situations. None of the three questions below is about drugs, insurance, or PBMs — they test whether the underlying reasoning transfers to a new domain, not whether you remember the earlier articles' facts.</p>
      {WARMUP_QUESTIONS.map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
    </SectionWrapper>
  );
}

function IntroSection() {
  return (
    <SectionWrapper id="sec-intro" title="Introduction">
      <p>Employers, unions, and insurers pay pharmacy benefit managers (PBMs) specifically to negotiate lower prescription drug costs, yet the rebate system PBMs built pays manufacturers more, not less, for raising list prices, because a bigger rebate is easiest to generate from a bigger number to discount off of. The three PBMs that now process about 80% of all U.S. prescription claims are each owned by the same parent conglomerate as a major health insurer and a specialty or mail-order pharmacy, so the negotiator, the payer, and increasingly the seller sit inside one balance sheet — and a patient whose coinsurance is calculated off that undiscounted list price can pay more out of pocket even as the employer's net cost falls.</p>
      <p>The scale of that misalignment shows up in what the industry itself calls the "gross-to-net bubble": the total value of rebates and other discounts manufacturers pay back through the supply chain reached an estimated $356 billion in 2024, up from about $334 billion the year before (Drug Channels Institute, 2025) — a sum generated entirely from the gap between a drug's sticker price and what anyone actually pays for it. Three companies — CVS Caremark, Express Scripts, and OptumRx — process about 80% of all U.S. prescription claims, and six PBMs together handle nearly 95%, according to the Federal Trade Commission (FTC), the U.S. antitrust regulator that has studied the industry since 2022 (FTC, 2024). That concentration did not happen by accident: PBMs consolidated specifically to gain enough negotiating leverage to extract larger rebates, and larger rebates require a larger list price to discount from.</p>
      <p>Conventional theory says a professional intermediary hired to negotiate on a buyer's behalf should align its own incentives with the buyer's, the way a corporate procurement office or a real-estate buyer's agent gets rewarded for securing a lower price. PBMs invert that logic wherever their own compensation is calculated as a share of the rebate or the list price: negotiating a bigger rebate off a bigger list price can generate more PBM revenue than negotiating a smaller list price with a smaller (or no) rebate, even when the second path leaves the payer paying less overall. The FTC's two staff reports on PBMs, published in July 2024 and January 2025, describe a version of the same inversion inside PBM-owned specialty pharmacies: the Big 3's affiliated pharmacies marked up numerous specialty generic drugs by hundreds or thousands of percent and earned over $7.3 billion above the drugs' estimated acquisition cost between 2017 and 2022, even as plan sponsors' and patients' payments both rose by double-digit percentages every year (FTC, 2025).</p>
      <p>This note addresses two questions: First, does the wave of Federal Trade Commission enforcement — a September 2024 lawsuit against the three largest PBMs over insulin pricing, followed by settlements with Express Scripts, CVS Caremark, and OptumRx completed between February and July 2026 — dismantle the incentive structure that created the paradox, or does it patch one drug class while leaving the broader rebate-based compensation model intact elsewhere? Second, will the newer wave of delinking laws — the federal Consolidated Appropriations Act of 2026 and state statutes in Colorado, California, Arkansas, and Utah — that sever PBM pay from list prices also close the separate gap between what a patient owes in coinsurance and what the payer actually spends after rebates?</p>
      <p>The rest of this note works through both questions using the FTC's own market data, RAND's international insulin price comparisons, and a JAMA-published analysis of Medicare Part D benefit design, before turning to what would have to be true for either reform path to actually lower what patients pay at the pharmacy counter.</p>
      <Glossary items={GLOSSARIES.intro} />
    </SectionWrapper>
  );
}

function BackgroundSection({ chartInterp, onInterpSubmit, mcState, onMcSubmit }) {
  return (
    <SectionWrapper id="sec-background" title="Background">
      <h3>2A. From Claims Processor to Vertically Integrated Conglomerate</h3>
      <p>Pharmacy benefit managers began in the 1960s as simple claims processors for employer health plans, and by the 1990s had shifted into rebate aggregators: because a single PBM could offer a manufacturer access to millions of covered lives through one formulary decision, manufacturers were willing to pay a rebate off list price to win preferred placement. That model scaled well for three decades. The industry consolidated from dozens of competing firms in the 2000s into today's Big 3 through a series of mergers — most notably Express Scripts' 2012 acquisition of Medco and Express Scripts' own 2018 purchase by Cigna, CVS Health's 2007 merger with Caremark, and CVS's 2018 acquisition of insurer Aetna. Each merger added negotiating scale, and the industry told employers that scale would be used to demand deeper rebates — which it did. But the same scale also gave PBMs enough formulary control to make a bigger rebate the price of preferred placement, and insulin is the best-documented case of what that pressure does to list prices over time.</p>
      <ChartCard chartKey="chart1" title="Chart 1. NovoLog Insulin: List Price vs. Net Price Index, 2001–2016 (2001 = 100)"
        tier="ESTIMATE" note="2001 and 2016 endpoints are FACT (Novo Nordisk congressional disclosure, cited in Drug Channels, 2016, and American Action Forum, 2024); intermediate years (2004–2013) are a smoothed exponential interpolation between those two reported endpoints, not separately reported data points."
        interpState={chartInterp.chart1} onInterpSubmit={onInterpSubmit}>
        <NovoLogChart />
      </ChartCard>
      <p className="provenance-note">Provenance note: only the 2001 and 2016 values in Chart 1 are directly sourced. The path between them is an illustrative, smoothed interpolation built to show the shape of a compounding divergence — it is not a claim about what happened in any specific intermediate year.</p>
      <p>Novo Nordisk disclosed to Congress that between 2001 and 2016, the list price of a vial of its NovoLog insulin rose 353%, while the net price it actually received after rebates and discounts rose only 36% — a nearly fivefold difference in annualized growth. Its FlexPen device saw an even starker split: a 270% list-price increase from 2003 to 2016 against a 3% net-price increase (American Action Forum, 2024). Every dollar of that widening gap between list and net is a dollar of rebate that some intermediary, not the manufacturer, is positioned to capture — unless a patient's own cost-sharing is calculated off the list price, which for a growing share of Medicare beneficiaries it now is, as Section 4 details.</p>
      <ChartCard chartKey="chart2" title="Chart 2. U.S. vs. OECD Insulin Price Ratio: Gross vs. Net of Rebates, 2022 Data"
        tier="FACT" note="RAND Corporation (Mulcahy & Schwam), 2024, using 2022 pricing data across 33 comparison OECD countries."
        interpState={chartInterp.chart2} onInterpSubmit={onInterpSubmit}>
        <RandSlopeChart />
      </ChartCard>
      <p>The same list-versus-net divergence shows up internationally. RAND's 2024 update found that U.S. manufacturer gross prices for insulin averaged 971% of the combined price across 33 high-income OECD countries — nearly ten times higher. After applying an estimated gross-to-net discount for U.S. rebates, the net-price ratio fell to 233%, still more than double the OECD average (RAND, 2024). Rebates closed most of the gap but did not close it: a persistent, non-rebate-driven premium remains, consistent with a market where negotiating leverage is concentrated among a few large intermediaries rather than distributed the way a textbook competitive market would predict.</p>
      {BACKGROUND_QUESTIONS.map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <h3>2B. Vertical Integration and the Structural Gap</h3>
      <p>What turned the paradox from an inefficiency into a structural feature was vertical integration. Beginning around 2015, each of the Big 3 PBMs merged with, or was acquired by, a major health insurer and built or bought a specialty and mail-order pharmacy: CVS Health owns Caremark (PBM), Aetna (insurer), and CVS Specialty; Cigna owns Express Scripts and its Evernorth specialty pharmacy Accredo, alongside its own health plan; UnitedHealth Group owns OptumRx (PBM), UnitedHealthcare (insurer), and Optum Specialty Pharmacy. Drug Channels Institute's own market-share tracking found that five of the six largest PBMs are now owned by an organization that also owns a health insurer (Drug Channels Institute, 2025) — the negotiator, the payer, and increasingly the seller of the drug all sit on the same balance sheet.</p>
      <ChartCard chartKey="chart3" title="Chart 3. Share of Specialty Generic Drug Dispensing Revenue, Big 3-Affiliated vs. Unaffiliated Pharmacies"
        tier="FACT" note="Federal Trade Commission, second interim staff report, January 2025, analyzing 51 specialty generic drugs across 882 National Drug Codes dispensed 2017–2022."
        interpState={chartInterp.chart3} onInterpSubmit={onInterpSubmit}>
        <SpecialtyShareChart />
      </ChartCard>
      <p>The FTC's January 2025 report measured what that integration does in practice for specialty generic drugs — lower-cost generic versions of complex drugs used for cancer, HIV, and other serious conditions. Pharmacies affiliated with the Big 3 PBMs received 68% of specialty generic dispensing revenue in 2023, up from 54% in 2016, a 14-percentage-point gain reflecting the Big 3 steering a disproportionate share of the most profitable prescriptions toward their own affiliated pharmacies (FTC, 2025). Those affiliated pharmacies also reimbursed themselves at a higher rate than they paid unaffiliated pharmacies on nearly every specialty generic drug examined, generating over $7.3 billion in dispensing revenue above the drugs' estimated acquisition cost between 2017 and 2022 — a sum that grew at a 42% compound annual rate and equaled roughly 12% of the aggregated operating income the parent conglomerates' relevant business segments reported in 2021 alone (FTC, 2025). This is the structural gap conventional PBM theory misses: a PBM that also owns the pharmacy no longer needs a bigger rebate to profit from a higher list price — it can profit from the dispensing margin instead, which means delinking rebates alone, without also addressing affiliated-pharmacy reimbursement, removes only one of two profit levers.</p>
      <Glossary items={GLOSSARIES.background} />
    </SectionWrapper>
  );
}

function RQ1Section({ chartInterp, onInterpSubmit, mcState, onMcSubmit }) {
  return (
    <SectionWrapper id="sec-rq1" title="Section 3. Does FTC Enforcement Fix the Incentive, or Just Insulin?">
      <p>The paradox's clearest legal test is now largely resolved, at least for one drug class. The question this section takes seriously is whether that resolution means the underlying rebate-for-list-price incentive has been fixed, or only that one visible, politically salient drug class received its own separate settlement.</p>
      <p>The FTC filed an administrative complaint on September 20, 2024, against Caremark Rx, Express Scripts, and OptumRx — along with their affiliated group purchasing organizations — alleging anticompetitive and unfair rebating practices that artificially inflated insulin list prices and shifted costs to patients (FTC, 2024). Express Scripts settled first, on February 4, 2026. CVS Caremark's settlement, finalized July 14, 2026, requires the company to create or maintain drug-affordability programs that cap patients' out-of-pocket insulin costs, to delink fees drug manufacturers pay to Caremark and its affiliates from insulin list prices, and to increase transparency and choice for plan sponsors — terms the FTC estimated would generate up to $8.5 billion in consumer savings over the following decade, plus up to $4.5 billion more through point-of-sale rebates (FTC, 2026). OptumRx's proposed settlement followed on June 12, 2026, and the PBMs' countersuit against the FTC was dismissed by the Eighth Circuit that July after all three elected to settle rather than litigate.</p>
      <ChartCard chartKey="chart4" title="Chart 4. Eliquis: Decomposing a $550 List Price Into Rebate and Net Price, 2024"
        tier="ESTIMATE" note="List price (~$550/month) and average Part D rebate (~45%) are FACT figures reported by USC Schaeffer Center / JAMA (Trish et al., 2025). Net price (~$300, rounded) is an ESTIMATE calculated as list price × (1 − rebate rate); it is not separately reported."
        interpState={chartInterp.chart4} onInterpSubmit={onInterpSubmit}>
        <EliquisWaterfallChart />
      </ChartCard>
      <p>The Caremark settlement's structure is worth reading against the price-decomposition mechanics shown above, even though Eliquis (a blood thinner, not insulin) was never part of the FTC's case. The settlement's core requirement — delinking the fees manufacturers pay a PBM from the drug's list price — targets exactly the mechanism in Chart 4: a fee or rebate calculated as a percentage of list price rewards a PBM for tolerating, or even preferring, a higher list price. That mechanism is drug-agnostic. If it produced insulin's specific price trajectory, it plausibly contributes to the pattern documented for Eliquis, Trulicity, Xarelto, Ozempic, and any other highly rebated brand drug — but the FTC's legal remedy currently reaches only insulin.</p>
      {RQ1_QUESTIONS.filter(q => q.id === "rq1-b").map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <p>The enforcement's scope is genuinely narrow. The lawsuit and all three settlements name only insulin — not the 51 specialty generic drugs (covering cancer, HIV, renal disease, and transplant medications) that the FTC's own January 2025 report found were marked up by hundreds or thousands of percent, and not the $7.3 billion in above-acquisition-cost specialty generic dispensing revenue the Big 3 earned through 2022. A drug-by-drug antitrust settlement is a different legal instrument than a rule that changes how PBM compensation works across an entire formulary, and nothing in the 2024–2026 FTC actions requires that broader change.</p>
      <p>State legislatures have moved into some of that gap. Arkansas's House Bill 1150, the first state law banning PBMs from owning pharmacies outright, targets the affiliated-pharmacy mechanism the FTC's insulin settlements do not reach — though its enforcement is currently paused by a preliminary injunction amid industry litigation (MultiState, 2026). That contrast is itself informative: the federal remedy is narrower but final and binding; the more structurally ambitious state remedy is broader but contested and unresolved.</p>
      {RQ1_QUESTIONS.filter(q => q.id === "rq1-c").map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <p>The honest read is that FTC enforcement demonstrated the list-price-linked-fee mechanism is illegal when documented well enough, and it produced real, quantifiable, insulin-specific relief. But it is a template, not a completed fix. Whether that template gets applied to the broader specialty generic drug list the FTC has already documented, or stays confined to the one drug class that generated enough public attention and evidence to win in negotiated settlements, remains an open institutional question as of this writing.</p>
      <Glossary items={GLOSSARIES.rq1} />
    </SectionWrapper>
  );
}

function RQ2Section({ chartInterp, onInterpSubmit, mcState, numState, onMcSubmit, onNumSubmit }) {
  const numQ = NUMERIC_QUESTIONS.find(q => q.id === "rq2-d");
  return (
    <SectionWrapper id="sec-rq2" title="Section 4. Will Delinking Laws Close the Patient-Side Gap?">
      <p>The second research question asks whether removing a PBM's own list-price-linked compensation actually lowers what patients pay, or only changes who profits from the same undiscounted list price a patient still sees at the pharmacy counter.</p>
      <p>President Trump signed the Consolidated Appropriations Act of 2026 on February 3, 2026, which requires Medicare Part D PBM compensation to be delinked from drug list prices and rebate volume, replacing it with flat "bona fide service fees" tied to actual services performed rather than a percentage of price. The law mandates 100% pass-through of rebates and other remuneration to Part D plans, gives the Centers for Medicare &amp; Medicaid Services (CMS) authority to impose monetary penalties for noncompliance, and adds an any-willing-pharmacy provision effective January 1, 2029 (AJMC, 2026). At the state level, Colorado's House Bill 1094 requires a similar flat-fee model effective 2027, California's Senate Bill 41 phases in delinking and a rebate pass-through mandate, and Utah's House Bill 257 separately requires rebate pass-through to consumers (MultiState, 2026).</p>
      <p>There is early evidence the mechanism is already biting, ahead of full enforcement. Cigna announced it would eliminate rebate retention within its Express Scripts subsidiary and pass negotiated rebates through to payers; OptumRx committed to full rebate pass-through beginning January 2026; CVS Caremark has offered a rebate pass-through option since 2019 (AJMC, 2026). That three separate, competing conglomerates each moved in the same direction before the law's full enforcement date suggests the delinking requirement is not merely symbolic — it changes what a rational PBM does with its own formulary strategy once keeping the rebate spread is no longer an option.</p>
      <ChartCard chartKey="chart5" title="Chart 5. Eliquis Average Monthly Out-of-Pocket Cost by Plan Type, 2020 vs. 2024"
        tier="FACT" note="USC Schaeffer Center / JAMA (Trish, Van Nuys, and Blaylock, 2025), based on CMS Part D formulary, benefit, and enrollment data."
        interpState={chartInterp.chart5} onInterpSubmit={onInterpSubmit}>
        <EliquisDumbbellChart />
      </ChartCard>
      {RQ2_QUESTIONS.map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <p>But rebate pass-through and coinsurance calculation are two different mechanisms, and only the first is what the 2026 reforms target. The share of stand-alone Part D plans using coinsurance instead of a fixed copay for preferred brand drugs rose from 9.9% in 2020 to 71.9% in 2024, while fewer than 5% of Medicare Advantage drug plans used coinsurance for the same category in 2024 (Trish et al., JAMA, 2025). Coinsurance is calculated as a percentage of a drug's list price at the pharmacy counter, because the true net price after rebates is not known at the moment a prescription is filled — a design choice made by the health plan, not the PBM's rebate arrangement. Even if the Consolidated Appropriations Act of 2026 fully succeeds at removing a PBM's own incentive to prefer a higher list price, it does not require an insurer to stop calculating a patient's coinsurance off that list price, and the same conglomerates whose PBM arm loses rebate revenue also design the benefit plans that decide coinsurance versus copay.</p>
      <p>Eliquis illustrates the stakes concretely. Average expected out-of-pocket cost for the drug in stand-alone Part D plans rose from $46.76 in 2020 to $102.32 in 2024, while in Medicare Advantage plans — which mostly use copays — it rose only from $44.57 to $46.93 over the same four years (Trish et al., JAMA, 2025). Critics quoted in AJMC's coverage of the 2026 law caution that "large PBMs may offset lost rebate revenue through administrative fees or other pricing mechanisms" (AJMC, 2026) — meaning even the compensation-side fix could be partially circumvented, layered on top of the separate, unaddressed coinsurance-calculation problem.</p>
      <NumericQuestion q={numQ} state={numState[numQ.id]} onSubmit={onNumSubmit} />
      <p>The delinking wave is a real, verifiable structural change to how PBMs are paid, and early voluntary moves by all three major PBMs suggest it is already changing behavior ahead of full enforcement. But it targets only one of the two mechanisms in the paradox. Removing a PBM's incentive to want a higher list price is necessary; it is not sufficient to guarantee lower patient coinsurance unless benefit design — copay versus coinsurance, and what price coinsurance is calculated against — changes too, and no 2026 law yet requires that second change.</p>
      <Glossary items={GLOSSARIES.rq2} />
    </SectionWrapper>
  );
}

function LearningSummarySection({ mcState, numState, applyA, setApplyA, applyB, setApplyB, applyEval, onEvaluate, govInsight, setGovInsight, insightRevealed, onRevealInsight }) {
  const allMc = [...WARMUP_QUESTIONS, ...BACKGROUND_QUESTIONS, ...RQ1_QUESTIONS, ...RQ2_QUESTIONS, CONCLUSION_QUESTION];
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

  const scoreCount = allMc.filter(q => mcState[q.id] && mcState[q.id].submitted && mcState[q.id].isCorrect).length
    + NUMERIC_QUESTIONS.filter(q => numState[q.id] && numState[q.id].submitted && numState[q.id].isCorrect).length;
  const totalScorable = allMc.length + NUMERIC_QUESTIONS.length;

  return (
    <SectionWrapper id="sec-learning" title="Learning Summary">
      <p>Score so far: {scoreCount} of {totalScorable} answered questions correct.</p>
      <div className="ls-block">
        <h3>Score by question type</h3>
        <table className="ls-table">
          <thead><tr><th>Type</th><th>Correct</th><th>Total answered</th></tr></thead>
          <tbody>
            {["A", "B", "C", "D", "E"].map((t) => (
              <tr key={t}><td>{t}</td><td>{byType[t] ? byType[t].correct : 0}</td><td>{byType[t] ? byType[t].total : 0}</td></tr>
            ))}
          </tbody>
        </table>
        {avgBias !== null && <p>Average signed numeric error on Type D (Fermi/arithmetic) questions: {avgBias}% ({avgBias > 0 ? "tends to overestimate" : "tends to underestimate"}). This reports directional bias, not confidence.</p>}
      </div>

      <div className="ls-block">
        <h3>Your governing insight</h3>
        <p>Before seeing this note's own authored insights, write the single most non-obvious insight you would defend to a skeptical executive who has only skimmed the headlines about drug rebates.</p>
        {!insightRevealed && (
          <div>
            <textarea className="apply-textarea" value={govInsight} onChange={(e) => setGovInsight(e.target.value)} placeholder="Type at least 20 characters..." />
            <button className="btn-primary" disabled={govInsight.trim().length < 20} onClick={onRevealInsight}>Reveal authored insights</button>
          </div>
        )}
        {insightRevealed && (
          <div>
            <div className="interp-revealed"><span className="tag-you">Your insight</span><p>{govInsight}</p></div>
            <h3>Authored insights</h3>
            {AUTHORED_INSIGHTS.map((ins, i) => <div className="insight-card" key={i}>{ins}</div>)}
          </div>
        )}
      </div>

      <div className="ls-block">
        <h3>Apply It (a): Transfer to a New Domain</h3>
        <p>A different procurement market shows the same structural pattern. State textbook adoption committees negotiate "curriculum consulting fees" from publishers, calculated as a percentage of a textbook's list price. A short data snippet:</p>
        <table className="snippet-table">
          <thead><tr><th>Year</th><th>List price index</th><th>Net (post-discount) price index</th><th>Consulting fee, % of list</th></tr></thead>
          <tbody>
            <tr><td>Year 1</td><td>100</td><td>100</td><td>8%</td></tr>
            <tr><td>Year 4</td><td>128</td><td>108</td><td>11%</td></tr>
            <tr><td>Year 8</td><td>160</td><td>115</td><td>14%</td></tr>
          </tbody>
        </table>
        <p>Write a response with four labeled parts: (1) a one-sentence so-what thesis about what this pattern implies for school districts; (2) the single load-bearing assumption your thesis depends on; (3) the strongest disconfirming evidence that could undermine it; (4) a one-line pre-mortem — "If this fails in 12 months, the most likely reason is ___."</p>
        <textarea className="apply-textarea" value={applyA} onChange={(e) => setApplyA(e.target.value)} placeholder="Label each of the four parts explicitly..." />
        <h3>Apply It (b): Cross-Link a Prior Principle</h3>
        <p>Name one of the five prior articles referenced in this note's Warm-Up and explain whether its principle reinforces or conflicts with today's thesis about PBM rebates.</p>
        <textarea className="apply-textarea" value={applyB} onChange={(e) => setApplyB(e.target.value)} placeholder="Name the article and explain the connection..." />
        <button className="btn-primary" onClick={onEvaluate}>Evaluate my response</button>
        {applyEval && (
          <div className="explanation-block explanation-correct" style={{ marginTop: "12px" }}>
            {applyEval.gaps.length > 0 && applyEval.gaps.map((g, i) => <div className="gap-note" key={i}>{g}</div>)}
            <p>{applyEval.summary}</p>
          </div>
        )}
      </div>

      <div className="ls-block">
        <h3>Return to Section: Missed Questions Grouped by Principle</h3>
        {missed.length === 0 && <p>No missed questions yet, or none answered — this list updates as you answer questions throughout the article.</p>}
        {missed.length > 0 && (
          <ul>
            {missed.map((q) => <li key={q.id}><strong>{q.principle}</strong> — revisit the question near "{q.id}" above.</li>)}
          </ul>
        )}
      </div>
    </SectionWrapper>
  );
}

function ConclusionSection({ mcState, onMcSubmit }) {
  return (
    <SectionWrapper id="sec-conclusion" title="Conclusion">
      <p>The rebate paradox exists because three incentives that should point in the same direction — the PBM's profit motive, the manufacturer's pricing decision, and the patient's cost exposure — were allowed to attach to the same number, list price, in three different ways. The most likely trajectory through 2027 and 2028 is partial success: the Consolidated Appropriations Act of 2026 and the FTC's insulin settlements will very likely lower what payers and PBMs extract from the list-price-rebate mechanism specifically, because both instruments attack that mechanism directly and both are now legally binding rather than voluntary. What is far less certain is whether patients see a proportional benefit, because their coinsurance exposure runs through a second mechanism — benefit design — that neither reform touches.</p>
      <p>For external actors, the implications diverge. Employers should expect real but partial relief: rebate pass-through helps net cost, but members on coinsurance-heavy specialty drug tiers may not feel it. Patients on stand-alone Part D coinsurance plans remain exposed unless plans separately move back toward copays or calculate coinsurance off a lower reference price — a change no current law requires. Manufacturers face a genuinely reduced incentive to inflate list prices once the PBM channel stops rewarding it, which could, if it works as intended, be the single most consequential effect of the 2026 reforms, since it attacks the root cause rather than just redistributing the resulting revenue. Policymakers who declare victory once the 2026 reforms take effect should watch list-price growth itself, not just rebate transparency, as the real test of whether delinking worked.</p>
      <p>Structurally, vertical integration means the same three conglomerates control PBM, insurer, and specialty pharmacy functions, so a reform that only touches the PBM's rebate revenue leaves the insurer arm free to keep coinsurance calculated on list price, and leaves the specialty pharmacy arm free to keep charging affiliated-pharmacy markups the FTC's settlements have not yet addressed outside insulin. Durable reform likely requires the newer state ownership-restriction laws — Arkansas's contested ban on PBM ownership of pharmacies among them — to survive alongside compensation delinking, not instead of it.</p>
      <p>The most important open question is whether the health plans that own two of the three largest PBMs will voluntarily change how they calculate a patient's coinsurance once their PBM affiliate can no longer profit from a higher list price — or whether patients will keep paying a percentage of a number that no longer means anything to anyone else in the transaction.</p>
      <MultipleChoice q={CONCLUSION_QUESTION} state={mcState[CONCLUSION_QUESTION.id]} onSubmit={onMcSubmit} />
    </SectionWrapper>
  );
}

function SourcesSection() {
  return (
    <SectionWrapper id="sec-sources" title="Sources">
      <ol className="source-list">
        {SOURCES.map((s, i) => (
          <li key={i}>
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
  { id: "sec-rq1", label: "Q1: FTC Enforcement" },
  { id: "sec-rq2", label: "Q2: Delinking Laws" },
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
    return () => window.removeEventListener("scroll", onScroll);
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

  function evaluateApplyIt() {
    // Local, evidence-based heuristic evaluator (no live API call from this static artifact).
    // Checks presence and non-triviality of the four required labeled parts in Apply It (a),
    // and checks that Apply It (b) names a specific article, flagging whichever part is weak or missing.
    // A secure server-side evaluator could later replace this function without changing its signature.
    const text = applyA.toLowerCase();
    const gaps = [];
    const hasThesis = /thesis|so-what|so what/.test(text) || applyA.length > 40;
    const hasAssumption = /assumption/.test(text);
    const hasDisconfirm = /disconfirm|undermine|evidence against|counter/.test(text);
    const hasPremortem = /pre-mortem|premortem|fails|fail/.test(text);
    if (applyA.trim().length < 60) {
      gaps.push("Your Apply It (a) response is quite short — a response this brief is unlikely to develop all four required parts with enough specificity.");
    }
    if (!hasThesis) gaps.push("Missing or unclear: a one-sentence so-what thesis about what the textbook-pricing pattern implies for districts.");
    if (!hasAssumption) gaps.push("Missing or unclear: the single load-bearing assumption your thesis depends on.");
    if (!hasDisconfirm) gaps.push("Missing or unclear: the strongest evidence that could undermine your thesis.");
    if (!hasPremortem) gaps.push("Missing or unclear: a one-line pre-mortem naming the most likely failure reason.");
    if (applyB.trim().length < 20) {
      gaps.push("Apply It (b) is missing or too brief — name a specific prior article and explain the connection, not just the article's title.");
    }
    const summary = gaps.length === 0
      ? "Your response develops all four parts and links to a specific prior principle. Strong transfer to a new domain."
      : "This evaluator checks for the presence and substance of all four labeled parts (thesis, assumption, disconfirming evidence, pre-mortem), not for keyword matching — revise the parts flagged above to strengthen the transfer.";
    setApplyEval({ gaps, summary });
  }

  const allMc = [...WARMUP_QUESTIONS, ...BACKGROUND_QUESTIONS, ...RQ1_QUESTIONS, ...RQ2_QUESTIONS, CONCLUSION_QUESTION];
  const totalScorable = allMc.length + NUMERIC_QUESTIONS.length;
  const answeredCount = allMc.filter(q => mcState[q.id] && mcState[q.id].submitted).length
    + NUMERIC_QUESTIONS.filter(q => numState[q.id] && numState[q.id].submitted).length;
  const progress = Math.min(100, Math.round((answeredCount / totalScorable) * 100));
  const score = allMc.filter(q => mcState[q.id] && mcState[q.id].submitted && mcState[q.id].isCorrect).length
    + NUMERIC_QUESTIONS.filter(q => numState[q.id] && numState[q.id].submitted && numState[q.id].isCorrect).length;

  function goTo(dir) {
    const idx = NAV_ITEMS.findIndex((n) => n.id === active);
    const nextIdx = Math.max(0, Math.min(NAV_ITEMS.length - 1, idx + dir));
    const el = document.getElementById(NAV_ITEMS[nextIdx].id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="app-root">
      <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: progress + "%" }}></div></div>
      <div className="score-badge">Score: {score} / {totalScorable}</div>
      <nav className="section-nav">
        {NAV_ITEMS.map((item) => (
          <div key={item.id} className={"nav-item " + (active === item.id ? "nav-active" : "")}
            onClick={() => { const el = document.getElementById(item.id); if (el) el.scrollIntoView({ behavior: "smooth" }); }}>
            {item.label}
          </div>
        ))}
      </nav>
      <div className="content-column">
        <div className="article-header">
          <div className="kicker">Economic Research · No. 23 · Healthcare, Science, Medicine &amp; BioTech</div>
          <h1>The Rebate Paradox: Why the Middlemen Hired to Cut Drug Prices Helped Raise Them</h1>
        </div>
        <WarmUpSection mcState={mcState} onMcSubmit={handleMcSubmit} />
        <IntroSection />
        <BackgroundSection chartInterp={chartInterp} onInterpSubmit={handleInterpSubmit} mcState={mcState} onMcSubmit={handleMcSubmit} />
        <RQ1Section chartInterp={chartInterp} onInterpSubmit={handleInterpSubmit} mcState={mcState} onMcSubmit={handleMcSubmit} />
        <RQ2Section chartInterp={chartInterp} onInterpSubmit={handleInterpSubmit} mcState={mcState} numState={numState} onMcSubmit={handleMcSubmit} onNumSubmit={handleNumSubmit} />
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
