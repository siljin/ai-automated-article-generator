// ER-19: The Bank That Isn't a Bank — Stablecoins' Reserve-Interest Machine
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
  { id: "tetherq42024", label: "Tether.io, \"Tether Hits $13 Billion Profits for 2024 And All-Time Highs in U.S. Treasury Holdings, USD₮ Circulation, and Reserve Buffer in Q4 2024 Attestation,\" Jan 31, 2025", url: "https://tether.io/news/tether-hits-13-billion-profits-for-2024-and-all-time-highs-in-u-s-treasury-holdings-usdt-circulation-and-reserve-buffer-in-q4-2024-attestation/" },
  { id: "tetherq22026", label: "Tether.io, \"Tether Posts Strong Q2 Performance, Generates $1.5B Net Operating Profit, Maintains $4.11B Reserve Buffer, and Expands Gold Holdings to More Than 146 Tons,\" Jul 31, 2026", url: "https://tether.io/news/tether-posts-strong-q2-performance-generates-1-5b-net-operating-profit-maintains-4-11b-reserve-buffer-and-expands-gold-holdings-to-more-than-146-tons/" },
  { id: "geniuscov", label: "Covington & Burling LLP, \"The GENIUS Act Becomes Law: Key Provisions from the Federal Stablecoin Regulatory Framework,\" Jul 25, 2025", url: "https://www.cov.com/en/news-and-insights/insights/2025/07/the-genius-act-becomes-law-key-provisions-from-the-federal-stablecoin-regulatory-framework" },
  { id: "geniusinterest", label: "CLS Blue Sky Blog (Columbia Law School), \"Circle, Coinbase, and the Prohibition on Interest Under the GENIUS Act,\" Dec 11, 2025", url: "https://clsbluesky.law.columbia.edu/2025/12/11/circle-coinbase-and-the-prohibition-on-interest-under-the-genius-act/" },
  { id: "cryptoslatetreasuries", label: "CryptoSlate, \"Tether was 7th largest US Treasury holder in 2024, surpassing nations like Canada and Norway,\" Mar 20, 2025", url: "https://cryptoslate.com/insights/tether-was-7th-largest-us-treasury-holder-in-2024-surpassing-nations-like-canada-and-norway/" },
  { id: "cnbcsvbusdc", label: "CNBC, \"Stablecoin USDC breaks dollar peg after firm reveals it has $3.3 billion in SVB exposure,\" Mar 11, 2023", url: "https://www.cnbc.com/2023/03/11/stablecoin-usdc-breaks-dollar-peg-after-firm-reveals-it-has-3point3-billion-in-svb-exposure.html" },
  { id: "coindeskrecover", label: "CoinDesk, \"USDC Stablecoin Regains Dollar Peg After Silicon Valley Bank-Induced Chaos,\" Mar 13, 2023", url: "https://www.coindesk.com/business/2023/03/13/usdc-stablecoin-regains-dollar-peg-after-silicon-valley-bank-induced-chaos" },
  { id: "cnbcsvbfailure", label: "CNBC, \"Silicon Valley Bank is shut down by regulators in biggest bank failure since global financial crisis,\" Mar 10, 2023", url: "https://www.cnbc.com/2023/03/10/silicon-valley-bank-is-shut-down-by-regulators-fdic-to-protect-insured-deposits.html" },
  { id: "circleq4fy25", label: "Circle Internet Group, Inc., \"Circle Reports Fourth Quarter and Full Fiscal Year 2025 Financial Results,\" Feb 25, 2026", url: "https://www.circle.com/pressroom/circle-reports-fourth-quarter-and-full-fiscal-year-2025-financial-results" },
  { id: "goldman2024", label: "Goldman Sachs, \"Goldman Sachs Reports 2024 Full Year and Fourth Quarter Earnings Results,\" Jan 15, 2025", url: "https://www.goldmansachs.com/pressroom/press-releases/2025/2025-01-15-q4-results" },
  { id: "gsheadcount", label: "StockAnalysis.com, \"The Goldman Sachs Group (GS) Number of Employees 1995–2025\" (sourced to SEC filings), retrieved Aug 2026", url: "https://stockanalysis.com/stocks/gs/employees/" },
  { id: "tetherheadcount", label: "Cryptopolitan, \"Stablecoin issuer Tether to double employee count by mid-2025,\" 2024 (reporting CEO Paolo Ardoino's statement of ~100 employees in 2024, doubling toward ~200 by mid-2025)", url: "https://www.cryptopolitan.com/tether-to-double-employee-by-2025/" },
  { id: "transakdefillama", label: "Transak, \"Stablecoin Market Cap in 2026: Key Numbers & Growth\" (citing DefiLlama's stablecoin dataset, retrieved Jun 12, 2026), published Jul 18, 2026", url: "https://transak.com/blog/stablecoin-market-cap-2026" },
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
  { article: "ER-16, frequent-flyer currency (2026-08-05)", principle: "When one party controls both the supply and the internal exchange rate of a token, a valuation performed under duress (to justify a loan or a headline) is not the price an arm's-length buyer would pay." },
  { article: "ER-17, mortgage rate lock-in (2026-08-07)", principle: "The same headline design feature can produce opposite real-world consequences depending on a second, easy-to-overlook detail (like how cheap it is to exit)." },
  { article: "ER-18, AI prior-authorization denials (2026-08-10)", principle: "A rate computed only over a self-selected sub-population is a lower bound on the true rate for the full population, not an estimate of it." },
];

/* ----------------------------------------------------------------------
   QUESTION BANK
---------------------------------------------------------------------- */
const QUESTIONS = [
  // ---------------- WARM-UP (transfer from ER-16, ER-17, ER-18) ----------------
  {
    id: "w1", section: "warmup", type: "E", kind: "mc",
    prompt: "A private golf club issues \"club credits\" redeemable for tee times, sets how many credits a round costs, and can change that price at will. To finance a new clubhouse, the club pledges its outstanding credit book as loan collateral, valued by an appraiser the club itself hired at what the credits would be worth if every member redeemed at today's tee-time price. Applying the frequent-flyer-currency principle, what is the single biggest reason to distrust that appraisal?",
    options: [
      { text: "The club controls both the supply of credits and the exchange rate (how many credits a round costs), and the appraisal was produced to justify a loan the club needed, not by a buyer with no stake in the outcome — the same duress-and-control pattern that made the airline-miles collateral value unreliable." },
      { text: "Credits are used by fewer people than airline miles, so the market is too small to appraise at all." },
      { text: "Golf clubs are non-profit in most cases, so they have no incentive to inflate the value of their own liabilities." },
      { text: "The appraisal is reliable because a professional appraiser, not a club employee, performed it." },
    ],
    correct: 0,
    misconceptions: [
      "",
      "This objects to scale, a surface feature, rather than the actual mechanism the principle is about: who controls the currency and why the valuation was produced.",
      "This assumes a legal structure (non-profit status) removes an incentive that in practice still exists: a club still wants the largest possible loan against its book, whether or not it distributes profit to shareholders.",
      "This mistakes a credentialed appraiser for an independent one; the appraiser was still hired by, and paid by, the party that needed a large valuation to get the loan.",
    ],
    principle: "An appraisal performed under duress, by or for a party that controls both the supply and the exchange rate of a token, is not an arm's-length price (ER-16).",
    transfer: "This generalizes to any closed-loop currency — loyalty points, in-game credits, company scrip, or a private stablecoin — booked at face value as collateral or as a balance-sheet asset.",
  },
  {
    id: "w2", section: "warmup", type: "B", kind: "mc",
    prompt: "Two countries let workers open tax-advantaged retirement accounts with employer matching, but early withdrawal before retirement age carries a penalty: 2% of the balance in Country A, 25% in Country B. Applying the mortgage-lock-in principle (an identical headline feature can produce opposite outcomes depending on how costly the exit is), what should we expect?",
    options: [
      { text: "Both countries will show identical rates of workers staying in jobs they would otherwise leave, since the headline feature (tax-advantaged retirement accounts with matching) is what matters." },
      { text: "Country B's workers will show more \"job-lock\" — staying in a job mainly to avoid forfeiting matched contributions or triggering the 25% penalty — while Country A's much smaller 2% exit cost creates far less of that effect, even though the account design otherwise looks the same." },
      { text: "Neither country will show job-lock, because retirement accounts are fundamentally different from mortgages." },
      { text: "Country A will show more job-lock, because a small, predictable cost is psychologically more salient to workers than a large one." },
    ],
    correct: 1,
    misconceptions: [
      "This treats the headline feature as the whole story and ignores the second, easy-to-overlook detail the principle is built around: how expensive the exit actually is.",
      "",
      "This dismisses the analogy on a category label instead of checking whether the same underlying mechanism (a costly exit tying a person to a status quo) applies — it does.",
      "This inverts the mechanism; a larger, not smaller, exit cost is what produces measurable lock-in, mirroring the mortgage case's rate-gap effect.",
    ],
    principle: "The same headline design feature can produce opposite real-world outcomes depending on how expensive it is to exit (ER-17).",
    transfer: "This generalizes to non-competes, cell-phone contract cancellation fees, and any 'good headline terms, costly exit' product design.",
  },
  {
    id: "w3", section: "warmup", type: "B", kind: "mc",
    prompt: "An airline reports that among customers who filed a formal complaint about a delayed flight, 90% received a refund, and calls this proof that it \"resolves nearly all valid delay complaints.\" Applying the self-selected-subgroup principle, what is the load-bearing flaw in using that 90% figure to describe how the airline treats ALL delayed-flight customers?",
    options: [
      { text: "The 90% figure is simply wrong, because refund rates that high are not credible for any airline." },
      { text: "The figure is fine, because every delayed customer has an equal opportunity to complain, so the sample is effectively random." },
      { text: "The figure only describes the SELF-SELECTED minority who chose to file a complaint, not the far larger group of delayed customers who never complained; the true rate at which delays deserved a refund among that silent majority is unmeasured and could be higher or lower than 90%." },
      { text: "The figure is unusable because airlines are not required to report refund data publicly." },
    ],
    correct: 2,
    misconceptions: [
      "This objects to plausibility without engaging with the actual statistical flaw, which is about who is in the sample, not whether the number itself looks too high.",
      "This is the exact error the principle names: having an opportunity to complain is not the same as a random, representative sample — the two groups (complainers vs. everyone else) can differ systematically in ways that bias the rate.",
      "",
      "This confuses public-disclosure requirements with the statistical validity of a rate computed on a biased subgroup — the flaw exists whether or not the airline publishes it.",
    ],
    principle: "A rate computed only over a self-selected sub-population is a lower bound on the true rate for the full population, not an estimate of it (ER-18).",
    transfer: "This generalizes to any 'satisfaction rate,' 'resolution rate,' or 'overturn rate' calculated only among those who opted in to be measured (survey respondents, appellants, complainers).",
  },

  // ---------------- BACKGROUND ----------------
  {
    id: "bg1", section: "background", type: "A", kind: "mc", chart: "trajectory",
    prompt: "The chart's own interpretation prompt already established that total stablecoin supply fell about 20% from its 2021 peak ($163B) to its 2023 trough ($130B). Now compute the percentage change from that 2023 trough to mid-2026 ($316B). What does comparing this second percentage to the first imply about how much of the 2022–23 shakeout has actually been \"recovered,\" versus simply left behind by a much bigger wave of growth?",
    options: [
      { text: "About +43%, which is smaller than the 20% contraction, so most of the market is still below its 2021 level relative to where it would have been without the 2022 crash." },
      { text: "The two percentages cannot be compared, because one measures a decline and the other a gain." },
      { text: "About +58%, using 2024's stated year-over-year growth rate applied to the full period, which is the correct way to measure a multi-year change." },
      { text: "About +143% (316 minus 130, divided by 130), which is more than seven times the size of the 20% contraction — the market did not just recover the supply it lost in 2022–23, it grew far past the old peak, meaning the contraction now looks like a temporary dip inside a much larger structural climb, not a ceiling the market struggled to get back above." },
    ],
    correct: 3,
    misconceptions: [
      "This computes a share of some other total, not the percentage change from the 130 trough to the 316 endpoint, so the arithmetic is answering a different question.",
      "A percentage decline and a percentage increase are both dimensionless rates of change and can absolutely be compared side by side — that comparison is exactly what reveals the asymmetry here.",
      "This uses a single year's growth rate (2024's +58%) as a stand-in for the full multi-year change, which understates a compounding, multi-year move.",
      "",
    ],
    principle: "Comparing the size of a decline to the size of the subsequent recovery — not just noting that a recovery happened — shows whether a contraction was a ceiling or a pause inside a larger trend.",
    transfer: "This generalizes to any 'the market crashed, then recovered' claim: a stock, a housing market, or an industry's revenue after a downturn — always compare the percentages, not just the direction.",
  },
  {
    id: "bg2", section: "background", type: "C", kind: "mc",
    prompt: "Case Prompt: A payments fintech's CEO wants to launch a third major dollar stablecoin to compete with USDT and USDC, arguing that the GENIUS Act's new federal licensing pathway (signed July 18, 2025) removes the main barrier that kept challengers out. Given that USDT and USDC together hold about 83% of the $316 billion stablecoin market, and that PayPal's own well-funded, fully compliant PYUSD still sits below $3 billion, what is the weakest assumption in the CEO's plan, and what evidence is thinnest in supporting it?",
    options: [
      { text: "That a GENIUS Act license alone is sufficient to overcome the liquidity and exchange-listing network effects the two incumbents already hold — but PYUSD's small size despite full legitimacy and a major brand behind it is direct evidence that regulatory legality does not by itself translate into adoption at scale." },
      { text: "That regulators will approve the new license application — but the GENIUS Act specifically creates a licensing pathway, so approval risk is not the central issue here." },
      { text: "That the new stablecoin will be technically reliable — but nothing in this case suggests a technical failure is the binding constraint on new entrants." },
      { text: "That USDT and USDC will not lower their own prices to compete — stablecoins do not have a price to lower, since they are pegged at one dollar, so this concern does not apply." },
    ],
    correct: 0,
    misconceptions: [
      "",
      "This treats licensing approval as the main risk, but the case already states the GENIUS Act created that pathway specifically to remove this obstacle — the weak assumption lies elsewhere.",
      "This invents a technical-reliability risk not suggested anywhere in the case, rather than engaging directly with the network-effect evidence given (PYUSD's small size despite full compliance).",
      "This correctly notes stablecoins can't compete on price the way ordinary products can, but it stops at a true observation without identifying the case's actual load-bearing risk, which is about distribution and liquidity, not pricing.",
    ],
    principle: "Legal permission to enter a market is necessary but not sufficient when incumbents hold a liquidity or network-effect moat; the strongest evidence against a 'now we can compete' pitch is a comparably legitimate entrant that still failed to scale.",
    transfer: "This generalizes to any newly deregulated market (bank charters, cannabis retail, telecom spectrum) where a new legal pathway removes one barrier but leaves incumbents' network effects fully intact.",
  },

  // ---------------- RQ1: THE RESERVE-INTEREST ENGINE ----------------
  {
    id: "rq1a", section: "rq1", type: "B", kind: "mc",
    prompt: "Tether's CEO stated that the firm's $33.1 billion in NET U.S. Treasury purchases during 2024 made Tether the 7th-largest national net buyer that year, ahead of Canada and Norway. Separately, Tether's TOTAL direct-plus-indirect Treasury exposure at the end of 2024 was $113 billion. Which statement correctly distinguishes what these two figures measure, and why neither one substitutes for the other?",
    options: [
      { text: "The two figures measure the same thing at different precision levels, so either can be used interchangeably to describe Tether's overall scale." },
      { text: "$33.1 billion is a FLOW — how much Tether's position grew during 2024 — while $113 billion is a STOCK — Tether's total position at a single point in time; a rank based on one does not tell you the rank based on the other, so comparing Tether's 2024 flow to the flows of national governments says nothing directly about how its total stock compares to their total holdings." },
      { text: "$113 billion must be an error, since it is more than three times the $33.1 billion figure from the same year." },
      { text: "Since $33.1 billion is smaller, it must be a subset of the $113 billion, so only the larger figure matters for understanding Tether's role in the Treasury market." },
    ],
    correct: 1,
    misconceptions: [
      "This ignores the stock-versus-flow distinction entirely, treating a one-year change and a point-in-time total as though they were the same kind of measurement.",
      "",
      "There is no error: a stock (accumulated total holdings) is routinely much larger than any single year's flow (that year's net change), since the stock reflects purchases made across many prior years too.",
      "Being smaller does not make the flow a literal subset of the stock in the way implied; the flow is the CHANGE during one year, while the stock also includes Treasuries purchased in earlier years and never sold.",
    ],
    principle: "A flow (the change during a period) and a stock (the total at a point in time) are different kinds of quantities; a rank or comparison based on one cannot be assumed to hold for the other.",
    transfer: "This generalizes to any 'largest buyer' claim: a country's trade deficit (a flow) versus its total foreign debt (a stock), or a company's quarterly hiring (a flow) versus its total headcount (a stock).",
  },
  {
    id: "rq1b", section: "rq1", type: "C", kind: "mc", chart: "perhead",
    prompt: "Case Prompt: A fintech investor sees that Tether generated roughly $13 billion in 2024 net profit with a headcount in the low hundreds — a profit-per-employee figure vastly larger than Goldman Sachs', a firm with 46,500 employees and $14.28 billion in 2024 net earnings — and concludes Tether is simply a better-run, more efficient business than Goldman Sachs. What is the weakest assumption behind that conclusion, and what evidence in this section is thinnest in supporting it?",
    options: [
      { text: "That Tether's headcount figures are current — but the section already accounts for Tether's stated plan to roughly double headcount by mid-2025." },
      { text: "That Goldman Sachs' 2024 earnings figure is accurate — but there is no reason in this section to doubt a publicly audited, SEC-reported earnings figure." },
      { text: "That this profit gap mainly reflects superior operating efficiency rather than a difference in what each firm is required to hold against its liabilities and pay to protect depositors — but this section's evidence (no deposit insurance premiums, no bank-style capital requirements, and reserves invested almost entirely in cheap-to-manage government debt) suggests Tether's margin advantage comes largely from carrying risk and overhead that Goldman is legally required to carry, not from doing the same job with fewer people." },
      { text: "That profit-per-employee is a meaningful metric at all — but profit-per-employee is a standard, widely used efficiency metric across many industries." },
    ],
    correct: 2,
    misconceptions: [
      "This treats headcount timing as the central issue, but the section is explicit that the estimate uses a range to account for this, so it is not the weakest assumption.",
      "This raises accuracy of a well-audited, market-scrutinized public figure, which is not the weak link the section's evidence actually speaks to.",
      "",
      "This objects to using the metric in general, but the issue here is not whether profit-per-employee is meaningful in principle — it is whether THIS particular gap is being correctly attributed to efficiency rather than to a different regulatory and risk-bearing burden.",
    ],
    principle: "A profit-per-employee or margin gap between two businesses can reflect a difference in operating skill, a difference in what each is legally required to hold and pay for safety, or both — and the second explanation must be ruled out, not assumed away, before crediting the first.",
    transfer: "This generalizes to comparing any lightly regulated intermediary's margins (private credit funds, money-transmitter apps, offshore insurers) against a heavily regulated incumbent doing an economically similar job.",
  },

  // ---------------- RQ2: BANK-LIKE RISK WITHOUT A BANK-LIKE SAFETY NET ----------------
  {
    id: "rq2a", section: "rq2", type: "B", kind: "mc", chart: "depeg",
    prompt: "The FDIC announced on Sunday, March 12, 2023, that Silicon Valley Bank's depositors — including Circle, USDC's issuer — would be made whole. USDC's price began recovering that same weekend and reached about $0.9918 by March 13. Which is the strongest reason NOT to conclude that the FDIC's announcement, by itself, caused USDC's recovery?",
    options: [
      { text: "USDC's recovery is impossible to measure precisely, so no cause can ever be assigned." },
      { text: "Because USDC recovered fully, the FDIC's announcement must have been the sole cause, since full recovery is strong evidence of a single decisive intervention." },
      { text: "The FDIC's announcement could not have mattered, because Circle is not a bank and does not receive deposit insurance." },
      { text: "The announcement and the recovery happened at the same time, but a second, mechanical force was also in play: once it became clear the underlying reserves were intact (with or without the FDIC's specific action), arbitrage trading that profits from buying a stablecoin below one dollar and redeeming it at one dollar would push the price back toward the peg on its own — a competing mechanism that the timing alone cannot rule out." },
    ],
    correct: 3,
    misconceptions: [
      "This overcorrects into nihilism — the recovery can be described and dated precisely; the issue is identifying its cause, not measuring the event itself.",
      "This is the classic post hoc error: a full recovery following an announcement is consistent with the announcement mattering, but it is equally consistent with a competing mechanism (arbitrage, or simply markets absorbing accurate information) driving the same outcome.",
      "This confuses direct deposit insurance coverage (which Circle indeed lacked) with an indirect effect: the FDIC's action removed the risk that SVB depositors like Circle would face a loss on those specific reserves, which is a plausible contributing mechanism even without Circle itself being insured.",
      "",
    ],
    principle: "When two things happen around the same time, a competing mechanical explanation must be ruled out before the first is credited as the cause — the timing itself is consistent with either.",
    transfer: "This generalizes to any 'policy announcement, then price move' story: a rate cut followed by a stock rally, or a bailout followed by a currency's recovery.",
  },
  {
    id: "rq1c", section: "rq1", type: "D", mode: "tight", kind: "numeric",
    prompt: "Tether disclosed $113 billion in direct-plus-indirect U.S. Treasury exposure at the end of 2024, and separately disclosed $7 billion of its 2024 profit came from Treasury-and-repo income. If the 3-month U.S. Treasury bill yielded roughly 5.1% on average across 2024, use ONLY the $113 billion year-end balance and that 5.1% yield to estimate what Treasury interest income you would expect for the year, in billions of dollars — then compare it to the actual disclosed $7 billion.",
    unit: "billions of dollars",
    target: 7,
    tolerancePct: 0.35,
    scaffold: "Multiply the year-end balance by the annual yield: $113B × 5.1%. Then note that this is an approximation, not an exact match, and explain why.",
    decomposition: "113 × 0.051 ≈ $5.76 billion — noticeably below the disclosed $7 billion. The gap exists because (1) Tether's Treasury balance grew across 2024 rather than starting the year at $113B, so the AVERAGE balance earning interest all year was lower than the year-end balance, which should push the estimate down further, not up, and (2) the disclosed $7B also includes repo income on top of plain Treasury bill interest, which pushes the true figure up. The lesson: multiplying a year-end stock by an annual rate is a rough approximation of a full year's income, useful for a sanity check, but never a substitute for the actual disclosed figure — the tolerance here is wide (±35%) because the approximation error runs in more than one direction at once.",
    principle: "A point-in-time balance multiplied by an annual rate approximates, but does not equal, that year's actual income, because the balance itself changed throughout the year.",
    transfer: "This generalizes to estimating any year's interest income, dividend income, or rent from a year-end account balance — always ask whether the balance grew or shrank during the year before trusting the simple multiplication.",
  },
  {
    id: "rq2c", section: "rq2", type: "B", kind: "mc",
    prompt: "Silicon Valley Bank had $209 billion in total assets when regulators shut it down in March 2023 — about 75% the size of Tether's $157.6 billion group balance sheet at the end of 2024. Which statement correctly uses this size comparison to reason about stablecoin risk?",
    options: [
      { text: "Size alone does not determine how a run resolves; what differs is the safety net. SVB's insured depositors were made whole through the FDIC and an emergency systemic-risk exception, while Tether's USD₮ holders have no deposit insurance and no guaranteed lender-of-last-resort backstop, so a similarly sized run at Tether could unfold very differently with no equivalent guaranteed backstop in place." },
      { text: "Because SVB and Tether are similar in size, a run on Tether would resolve the same way a run on SVB did." },
      { text: "Because Tether is now larger than SVB was, Tether is by definition safer, since larger financial institutions are always more stable than smaller ones." },
      { text: "The comparison is meaningless, because a stablecoin issuer and a bank are regulated under completely unrelated legal frameworks and therefore cannot be compared on any dimension." },
    ],
    correct: 0,
    misconceptions: [
      "",
      "This assumes similar size implies a similar outcome, ignoring the actual mechanism (deposit insurance and emergency backstops) that determined how SVB's failure was resolved.",
      "This is a well-known false pattern in banking history — larger institutions have failed (Washington Mutual, Lehman Brothers) — size does not guarantee stability, and here it is being used backwards to imply safety rather than scale of potential impact.",
      "Different legal frameworks do not make a size or risk-mechanism comparison meaningless; the comparison is exactly how you identify which protections exist under one framework and not the other.",
    ],
    principle: "Balance-sheet size measures potential impact, not resilience; resilience depends on the specific legal backstops (deposit insurance, discount-window access) available to an institution of that type.",
    transfer: "This generalizes to comparing any two similarly sized financial intermediaries operating under different regulatory regimes — a large hedge fund versus a similarly sized insurer, for instance.",
  },

  // ---------------- RQ3: DOES THE GENIUS ACT CLOSE THE GAP? ----------------
  {
    id: "rq3a", section: "rq3", type: "A", kind: "mc", chart: "quadrant",
    prompt: "The GENIUS Act (signed July 18, 2025) requires payment-stablecoin issuers to hold 100% liquid reserves and bars them from paying interest or yield to holders. Which assumption is this note's central \"shadow-bank\" comparison most dependent on continuing to hold even after the GENIUS Act takes effect, and what single piece of evidence would most directly falsify it?",
    options: [
      { text: "That the GENIUS Act will be repealed within five years — but nothing in this note suggests repeal is likely or relevant to the reserve-income mechanism." },
      { text: "That GENIUS-Act-licensed issuers still lack deposit insurance and routine, guaranteed access to a lender of last resort, so the issuer keeps the full spread between the near-zero rate paid to holders and the market yield earned on reserves — this thesis would be directly falsified by a future amendment that required issuers to share reserve yield with holders or extended deposit-insurance-equivalent protection to stablecoin balances." },
      { text: "That Tether specifically will remain the largest stablecoin issuer — but the reserve-interest mechanism this note describes applies to any compliant issuer, not specifically to Tether's market share." },
      { text: "That interest rates will stay elevated forever — but the note's mechanism works at any positive interest rate, just at a smaller dollar scale when rates are lower, so this is not the load-bearing assumption." },
    ],
    correct: 1,
    misconceptions: [
      "This introduces a scenario (repeal) that the note never raises and that is not the assumption the shadow-bank comparison actually depends on.",
      "",
      "This confuses one firm's market share with the general mechanism the note describes, which does not require any specific company to remain dominant.",
      "This correctly identifies that the mechanism scales with rates but incorrectly treats that scaling as the load-bearing assumption; the mechanism still exists (just smaller) even at low rates, so rate level is not what the argument depends on.",
    ],
    principle: "A thesis's load-bearing assumption is the specific, falsifiable claim that must remain true for the argument to hold — not any plausible but tangential risk, and not a scaling factor that changes the size of an effect without eliminating it.",
    transfer: "This generalizes to evaluating any 'a new law closes the gap' claim: identify exactly which unchanged feature (here, no yield-sharing requirement and no deposit insurance) still supports the old thesis, and ask what specific future fact would remove it.",
  },
  {
    id: "rq3b", section: "rq3", type: "C", kind: "mc",
    prompt: "Case Prompt: A state pension fund's cash-management committee is debating whether to treat balances held in a GENIUS-Act-licensed stablecoin the same as an FDIC-insured bank deposit for its short-term cash policy, reasoning that \"100% reserve-backed\" sounds equivalent to \"government-guaranteed.\" What is the weakest assumption in that reasoning?",
    options: [
      { text: "That the stablecoin issuer will comply with the law — but compliance is independently supervised and audited under the GENIUS Act, so this is not the weakest link." },
      { text: "That the pension fund's committee members understand basic accounting — but nothing in the case suggests a lack of financial literacy is the issue." },
      { text: "That \"100% reserve-backed\" and \"government-guaranteed\" describe the same protection — but the GENIUS Act requires the ISSUER to hold adequate reserves; it does not create deposit insurance for the HOLDER, and the 2023 USDC episode shows that even a fully, genuinely reserved stablecoin can temporarily lose its peg when an operational or custodial problem hits one of its reserve holdings, a risk deposit insurance is specifically designed to absorb and a reserve requirement alone is not." },
      { text: "That interest rates will remain positive — but the pension fund's cash-safety question does not depend on interest rates at all." },
    ],
    correct: 2,
    misconceptions: [
      "This treats compliance risk as central, but the case's flawed reasoning is about what full compliance actually guarantees, not about whether compliance will occur.",
      "This raises an unsupported literacy concern instead of engaging with the substantive gap between two specific legal protections that sound similar but are not.",
      "",
      "This introduces an irrelevant factor (interest rates) that has no bearing on the safety question the committee is actually facing.",
    ],
    principle: "A reserve requirement protects the ISSUER's solvency on paper; deposit insurance protects the HOLDER against a specific list of operational and custodial failures — the two are not interchangeable even when both are real and enforced.",
    transfer: "This generalizes to any 'fully backed' or 'fully collateralized' claim in finance — a fully collateralized loan, a fully funded pension, or a fully reserved e-money account — always ask who bears the risk if the backing is temporarily inaccessible, not just whether the backing nominally exists.",
  },

  // ---------------- CONCLUSION ----------------
  {
    id: "concl", section: "conclusion", type: "E", kind: "mc",
    prompt: "Given everything in this note, which real-world action is most directly supported, and which risk would most threaten it?",
    options: [
      { text: "Corporate treasurers should immediately move all short-term cash into stablecoins, since GENIUS Act reserve rules now make them as safe as bank deposits." },
      { text: "Regulators should ban stablecoins outright, since the 2023 USDC episode proves the entire model is unsafe regardless of reserve rules." },
      { text: "No action is warranted, because the GENIUS Act's 2025 passage fully resolves every open question this note raises about stablecoin safety." },
      { text: "Corporate and institutional treasurers holding large stablecoin balances as cash-equivalents should diversify issuer and custodial exposure rather than concentrating in one issuer, because the 2023 USDC episode shows even a genuinely, fully reserved stablecoin can temporarily lose its peg from an operational failure at a single reserve custodian — but the main risk to this recommendation is that GENIUS Act reserve rules, finalized after that episode, now restrict how concentrated and how risky an issuer's reserve holdings can be, which could make a repeat structurally less likely than in 2023. This thesis would be falsified if a fully GENIUS-Act-compliant issuer still suffered a comparable depeg, showing the new reserve rules did not address the actual vulnerability that caused the 2023 event." },
    ],
    correct: 3,
    misconceptions: [
      "This overreads reserve-quality rules as equivalent to a bank-style guarantee, ignoring the note's own distinction between a reserve requirement and deposit insurance.",
      "This over-generalizes from one 2023 episode under the pre-GENIUS-Act regime to a permanent verdict on a since-changed regulatory framework, without weighing whether the new rules address the specific failure mode involved.",
      "This treats a single piece of legislation as resolving every risk the note describes, including the deposit-insurance gap and the profit-capture business model, neither of which the GENIUS Act actually changes.",
      "",
    ],
    principle: "A recommendation is only as strong as its stated risk and the specific, falsifiable observation that would overturn it — not a claim of either total safety or total danger.",
    transfer: "This generalizes to any 'a new regulation fixes the old risk' claim: identify precisely which mechanism the regulation targets, and ask whether that mechanism is the one that actually caused the past failure.",
  },
];

/* ----------------------------------------------------------------------
   NUMERIC FERMI QUESTION (open-ended, capstone)
---------------------------------------------------------------------- */
const FERMI_QUESTION = {
  id: "fermi1", section: "rq3", type: "D", mode: "fermi", kind: "numeric",
  prompt: "This is a genuine open Fermi estimate: state your own decomposition before entering a number. Total stablecoin supply is about $316 billion (mid-2026). The GENIUS Act requires issuers to hold that supply almost entirely in cash and short-dated government securities. Circle disclosed a reserve return rate of 3.8% in the fourth quarter of 2025. Using ONLY a population (total reserves) times a rate (reserve yield), estimate the INDUSTRY-WIDE annual reserve interest income being earned by all stablecoin issuers combined, in billions of dollars per year.",
  unit: "billions of dollars per year",
  target: 12,
  logTolerance: true,
  scaffold: "Multiply total industry reserves by the reserve yield: $316B × 3.8%. There is no single 'correct' input — different issuers hold slightly different reserve mixes and yields, so treat this as an order-of-magnitude estimate, not an exact figure.",
  decomposition: "316 × 0.038 ≈ $12 billion per year. This is scored on log-distance: an answer within a factor of 2 of $12B (roughly $6B to $24B) counts as correct, because the true industry-wide figure depends on each issuer's exact reserve mix (some hold more low-yield cash, some more repo) and on where interest rates sit at any given moment — this is a genuine Fermi estimate, not a lookup.",
  principle: "A Fermi estimate multiplies a known population (or stock) by a plausible, bounded rate, and is judged on order of magnitude, not on decimal precision.",
  transfer: "This generalizes to estimating any industry-wide flow from a stock: total bank interest income from total deposits and a rate, or total advertising revenue from total ad impressions and a price per impression.",
};

/* ----------------------------------------------------------------------
   CHART INTERPRETATION PROMPTS (open text, production before consumption)
---------------------------------------------------------------------- */
const CHART_INTERPS = {
  trajectory: {
    title: "Total stablecoin supply, year-end 2020–2026",
    prompts: [
      { kind: "quant-predict", label: "Before scrolling further: predict — by what percent did total stablecoin supply fall from its 2021 year-end peak ($163B) to its 2023 year-end trough ($130B)?",
        authored: "(163 − 130) ÷ 163 ≈ 20.2%. The market lost about a fifth of its total supply across the Terra/UST collapse (2022) and the higher-rate, risk-off period that followed (2023) — a real but, as later data shows, temporary setback." },
      { kind: "so-what", label: "So what should a Treasury-market strategist or bank-funding desk conclude from this trajectory's sharp acceleration after 2023?",
        authored: "A funding desk that treats this supply as a permanent, one-way-growing pool of demand for short-term government debt is extrapolating from only the post-2023 leg; the 2022–23 contraction shows the same pool can shrink by a fifth in about eighteen months when sentiment or the rate environment turns, so any plan that depends on stablecoin reserve demand staying this large needs a stress case where growth reverses, not just continues." },
    ],
  },
  issuers: {
    title: "Stablecoin supply by issuer, June 12, 2026",
    prompts: [
      { kind: "quant", label: "Compute the ratio of USDT's supply ($187B) to USDC's ($75B), the second-largest. What does that ratio say about how concentrated \"the market\" really is?",
        authored: "187 ÷ 75 ≈ 2.5x. The single largest issuer is roughly two and a half times the size of the second largest, and together the top two are about 25 times the size of the third-largest (USDS, ~$8B) — this is not a market with five comparable competitors, it is a market with one dominant issuer, a strong second, and a long, thin tail." },
      { kind: "mechanism", label: "Why would supply concentrate this heavily in the top two issuers rather than spreading more evenly, given that any GENIUS-Act-licensed entity can now legally issue a dollar stablecoin?",
        authored: "Liquidity and trust compound: exchanges list the deepest stablecoins first, arbitrage traders keep the most-traded coins closest to their peg, and offshore or emerging-market users who need dollars gravitate to whichever coin is already accepted everywhere — each of those forces reinforces whichever issuer is already largest, which is why a fully legal, well-funded new entrant (like PayPal's PYUSD, still under $3B) can still struggle to gain share." },
    ],
  },
  bridge: {
    title: "How Tether's $13 billion in 2024 profit was built",
    prompts: [
      { kind: "so-what", label: "So what should a bank regulator or ratings analyst conclude about how reliable this $13 billion figure is across a full interest-rate and crypto-price cycle?",
        authored: "A regulator should not treat $13B as a stable, repeatable baseline: the $7B Treasury-and-repo slice depends on interest rates staying elevated (it shrinks mechanically if rates fall), and the $5B gold-and-bitcoin slice is an unrealized, mark-to-market gain that can just as easily reverse into a loss the following year — a more conservative read of Tether's 'run-rate' profitability looks only at the interest-income slice, and even that is exposed to future rate cuts." },
      { kind: "quant", label: "What share of Tether's 2024 profit came from an unrealized, not-yet-cashed-in gain (gold and bitcoin appreciation) rather than from interest income actually received in cash?",
        authored: "$5B ÷ $13B ≈ 38.5%. More than a third of the headline profit is a paper gain on assets Tether has not sold, not cash interest received — a meaningfully less liquid, less certain form of profit than the market often assumes when it reads the $13B headline." },
    ],
  },
  perhead: {
    title: "Estimated 2024 profit per employee: Tether vs. Goldman Sachs",
    prompts: [
      { kind: "quant", label: "Compute the multiple: roughly how many times higher is Tether's estimated profit-per-employee than Goldman Sachs'?",
        authored: "Using Tether's disclosed $13B profit over a roughly 100–150-employee range (≈$87M–$130M per employee) against Goldman's $14.28B over 46,500 employees (≈$307,000 per employee), the multiple lands somewhere around 280x to 420x — an extraordinary gap by any normal measure of business efficiency." },
      { kind: "causal", label: "What does this gap NOT prove — why can't you conclude from this ratio alone that Tether is simply a better-run business than Goldman Sachs?",
        authored: "The ratio compares two very different cost structures, not two efficiency scores on the same task: Goldman's headcount and overhead exist partly BECAUSE it is a heavily regulated bank holding company with capital requirements, compliance staff, deposit-taking infrastructure, and credit-risk underwriting that Tether, as an unregulated-until-recently offshore issuer, was never required to build. The gap is real, but a large share of it reflects a difference in regulatory burden and risk-bearing obligations, not a difference in managerial skill." },
    ],
  },
  depeg: {
    title: "USDC's price during the March 2023 Silicon Valley Bank shock",
    prompts: [
      { kind: "mechanism", label: "Circle disclosed that only 8% of USDC's reserves ($3.3B of about $40B) were stuck at Silicon Valley Bank. Why did the price fall by roughly 13 percentage points (to about $0.87) — well beyond that 8% — rather than falling by only about 8%?",
        authored: "Markets price uncertainty, not just the disclosed number: once holders could not be sure whether that $3.3 billion (and possibly more, if contagion spread to other banks holding reserves) would be fully recoverable or recoverable in time to meet redemption demand, some holders sold at a discount to guarantee getting dollars out immediately rather than risk waiting — a classic run dynamic where the price falls further than the known shortfall because it is also pricing in the RISK of a worse outcome, not the shortfall itself." },
      { kind: "causal", label: "The FDIC's announcement that SVB depositors would be made whole came on Sunday, March 12; USDC's price recovery began around the same time. Is the timing alone enough to prove the FDIC's action caused the recovery — what competing explanation exists?",
        authored: "Timing alone is not enough. A competing, purely mechanical explanation: once it became clear the $3.3 billion was intact and accessible (whether via the FDIC's specific action or Circle's own redemption mechanics resuming normally), arbitrage traders who buy a stablecoin below $1 and redeem it at $1 have a direct profit incentive to buy — a self-correcting market force that would push the price back toward the peg regardless of whose announcement got the credit." },
    ],
  },
  quadrant: {
    title: "Reserve stringency vs. safety-net strength, by intermediary type",
    prompts: [
      { kind: "so-what", label: "Given where a GENIUS-Act-licensed stablecoin issuer sits on this map relative to an FDIC-insured bank, what should a corporate treasurer holding large stablecoin balances as \"cash equivalents\" do differently?",
        authored: "Treat GENIUS Act compliance as evidence the ISSUER is solvent on paper, not as a substitute for deposit insurance the HOLDER never receives — a treasurer should cap single-issuer and single-custodian concentration the same way a prudent treasurer already caps exposure to any single uninsured counterparty, rather than treating 'fully reserved' as synonymous with 'government-guaranteed.'" },
      { kind: "mechanism", label: "What specific, observable change would move a GENIUS-Act-licensed issuer's position on the vertical (safety-net) axis closer to a bank's?",
        authored: "Extending an FDIC-style insurance fund (or an equivalent government backstop) to stablecoin holders directly, or granting issuers routine, guaranteed access to the Federal Reserve's discount window the way insured banks have — GENIUS Act reserve-quality rules move the horizontal axis, but nothing in the law as passed moves the vertical one; this ILLUSTRATION map's positioning follows from an analysis of the Act's own provisions, not from a reported survey or index." },
    ],
  },
};

/* ----------------------------------------------------------------------
   GLOSSARY PER PAGE
---------------------------------------------------------------------- */
const GLOSSARY = {
  intro: [
    { term: "Stablecoin", def: "a digital token designed to always be worth a fixed amount, usually one U.S. dollar." },
    { term: "USD₮ (USDT) / Tether", def: "the largest dollar stablecoin, issued by the company Tether." },
    { term: "USDC / Circle", def: "the second-largest dollar stablecoin, issued by the company Circle." },
    { term: "Reserves", def: "the cash and government securities an issuer holds to back every stablecoin it has issued." },
    { term: "GENIUS Act", def: "the U.S. federal law, signed July 18, 2025, that sets reserve and licensing rules for dollar stablecoins." },
    { term: "Peg", def: "the fixed exchange rate a stablecoin is designed to hold against a reference currency, usually $1.00." },
  ],
  background: [
    { term: "Market cap / supply", def: "for a stablecoin, the total dollar value of every coin currently in circulation." },
    { term: "Treasury bill (T-bill)", def: "a short-term loan to the U.S. government, usually maturing in a few weeks to a year." },
    { term: "DeFiLlama", def: "a widely used, independent data service that tracks cryptocurrency and stablecoin statistics." },
  ],
  rq1: [
    { term: "Repo (repurchase agreement)", def: "a very short-term loan where one party sells a security and agrees to buy it back the next day, effectively earning interest on cash." },
    { term: "Attestation", def: "a report from an outside accounting firm confirming that an issuer's disclosed reserves match what it claims to hold." },
    { term: "Unrealized gain", def: "a paper profit on an asset that has gone up in value but has not yet been sold." },
    { term: "Stock vs. flow", def: "a stock is a total measured at one point in time; a flow is the change in that total over a period." },
  ],
  rq2: [
    { term: "Depeg", def: "when a stablecoin's market price moves away from its intended fixed value, usually $1.00." },
    { term: "FDIC", def: "the Federal Deposit Insurance Corporation, the U.S. agency that insures bank deposits up to a set limit." },
    { term: "Systemic risk exception", def: "a rare U.S. regulatory decision to protect all depositors at a failed bank, not just those below the normal insurance limit." },
    { term: "Lender of last resort", def: "a central bank's role in lending to solvent-but-illiquid banks during a crisis, so they can meet withdrawal demand." },
  ],
  rq3: [
    { term: "Rehypothecation", def: "reusing an asset held as collateral or backing for a different purpose, such as lending it out again." },
    { term: "OCC", def: "the Office of the Comptroller of the Currency, a federal agency that can license and supervise certain stablecoin issuers under the GENIUS Act." },
    { term: "Prudential requirement", def: "a rule (like a capital or liquidity minimum) designed to keep a financial firm safe and solvent." },
  ],
};

/* ----------------------------------------------------------------------
   CHART DATA
---------------------------------------------------------------------- */
const TRAJECTORY_DATA = [
  { year: "2020", supply: 27 },
  { year: "2021", supply: 163 },
  { year: "2022", supply: 138 },
  { year: "2023", supply: 130 },
  { year: "2024", supply: 206 },
  { year: "2025", supply: 308 },
  { year: "2026 (Jun)", supply: 316 },
];

const ISSUER_DATA = [
  { name: "Tether (USDT)", value: 187, tier: "FACT" },
  { name: "Circle (USDC)", value: 75, tier: "FACT" },
  { name: "Sky (USDS)", value: 8, tier: "FACT" },
  { name: "Ethena (USDe)", value: 4.5, tier: "FACT" },
  { name: "Sky (DAI, legacy)", value: 4.4, tier: "FACT" },
].sort((a, b) => b.value - a.value);

const BRIDGE_DATA = [
  { name: "Treasury & repo income", base: 0, delta: 7, display: "+$7B", kind: "pos" },
  { name: "Gold & bitcoin gains", base: 7, delta: 5, display: "+$5B", kind: "pos-light" },
  { name: "Other investments", base: 12, delta: 1, display: "+$1B", kind: "pos-light" },
  { name: "2024 net profit", base: 0, delta: 13, display: "$13B", kind: "total" },
];

const PERHEAD_DATA = [
  { name: "Goldman Sachs (bank)", value: 0.307, display: "≈$307K / employee", tier: "FACT" },
  { name: "Tether (stablecoin issuer)", value: 108, display: "≈$87M–$130M / employee", tier: "ESTIMATE" },
];

const DEPEG_DATA = [
  { t: "Mar 9, 10am", price: 1.0 },
  { t: "Mar 10, 4pm (SVB seized)", price: 0.995 },
  { t: "Mar 10, 10pm (Circle discloses $3.3B stuck)", price: 0.95 },
  { t: "Mar 11, 2am (low)", price: 0.8726 },
  { t: "Mar 11, midday", price: 0.9 },
  { t: "Mar 12 (FDIC backstop announced)", price: 0.97 },
  { t: "Mar 13", price: 0.9918 },
];

const QUADRANT_DATA = [
  { name: "FDIC-insured bank", stringency: 55, safetynet: 95, tier: "ILLUSTRATION" },
  { name: "Government money-market fund", stringency: 85, safetynet: 55, tier: "ILLUSTRATION" },
  { name: "GENIUS-Act stablecoin issuer (post-2025)", stringency: 90, safetynet: 20, tier: "ILLUSTRATION" },
  { name: "Pre-2025 unregulated stablecoin issuer", stringency: 40, safetynet: 5, tier: "ILLUSTRATION" },
];

const COLORS = { accent: "#0b5d3b", accentLight: "#a9d1bb", danger: "#b3382c", dangerLight: "#e3a79c", success: "#2f7a4f", neutral: "#c9c4bb", ink: "#111111" };

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

function ChartFrame({ id, note, children, height }) {
  const meta = CHART_INTERPS[id];
  return (
    <div className="chart-frame">
      <div className="chart-title">{meta.title}</div>
      <ResponsiveContainer width="100%" height={height || 320}>
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
  const range = q.mode === "fermi" ? [q.target / 8, q.target * 8] : [q.target * 0.3, q.target * 1.8];
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
function TrajectoryChart() {
  return (
    <ChartFrame id="trajectory" note={<span><Tag tier="FACT" /> Transak, citing DefiLlama's stablecoin dataset (retrieved Jun 12, 2026): year-end totals 2020–2025 and the Jun 12, 2026 figure.</span>}>
      <LineChart data={TRAJECTORY_DATA} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="year" />
        <YAxis label={{ value: "Total supply ($B)", angle: -90, position: "insideLeft", fontSize: 12 }} domain={[0, 340]} />
        <Tooltip formatter={(v) => "$" + v + "B"} />
        <Line type="monotone" dataKey="supply" name="Total stablecoin supply ($B)" stroke={COLORS.accent} strokeWidth={3} dot={{ r: 5 }}>
          <LabelList dataKey="supply" position="top" formatter={(v) => "$" + v + "B"} />
        </Line>
      </LineChart>
    </ChartFrame>
  );
}

function IssuerChart() {
  return (
    <ChartFrame id="issuers" note={<span><Tag tier="FACT" /> Transak, citing DefiLlama (Jun 12, 2026); figures rounded by the source.</span>}>
      <ComposedChart data={ISSUER_DATA} layout="vertical" margin={{ top: 10, right: 50, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis type="number" domain={[0, 200]} unit="B" />
        <YAxis type="category" dataKey="name" width={170} />
        <Tooltip formatter={(v) => "$" + v + "B"} />
        <Bar dataKey="value" barSize={4} fill={COLORS.accentLight} isAnimationActive={false} />
        <Scatter dataKey="value" fill={COLORS.accent} shape="circle">
          <LabelList dataKey="value" position="right" formatter={(v) => "$" + v + "B"} />
        </Scatter>
      </ComposedChart>
    </ChartFrame>
  );
}

function BridgeChart() {
  const colorFor = (kind) => ({ pos: COLORS.accent, "pos-light": COLORS.accentLight, total: COLORS.ink }[kind]);
  return (
    <ChartFrame id="bridge" note={<span><Tag tier="FACT" /> Tether Holdings Limited, Q4 2024 attestation (BDO): $7B Treasury/repo income, $5B unrealized gold/bitcoin appreciation, $1B other investment income, summing to $13B in 2024 net profit.</span>}>
      <BarChart data={BRIDGE_DATA} margin={{ top: 20, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="name" angle={-15} textAnchor="end" interval={0} height={70} fontSize={11} />
        <YAxis label={{ value: "$ billions", angle: -90, position: "insideLeft", fontSize: 12 }} domain={[0, 14]} />
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

function PerHeadChart() {
  return (
    <ChartFrame id="perhead" height={220} note={<span><Tag tier="FACT" /> Goldman Sachs 2024 net earnings ($14.28B) and headcount (46,500) are reported figures. <Tag tier="ESTIMATE" /> Tether's per-employee figure is derived by dividing its disclosed $13B 2024 profit by a 100–150-employee range drawn from CEO statements, since Tether does not publish an exact year-end headcount; rounded coarsely to avoid false precision.</span>}>
      <ComposedChart data={PERHEAD_DATA} layout="vertical" margin={{ top: 10, right: 90, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis type="number" scale="log" domain={[0.1, 200]} ticks={[0.1, 1, 10, 100]} tickFormatter={(v) => "$" + v + "M"} />
        <YAxis type="category" dataKey="name" width={160} />
        <Tooltip formatter={(v, n, p) => p.payload.display} />
        <Bar dataKey="value" barSize={22} isAnimationActive={false}>
          {PERHEAD_DATA.map((d, i) => <Cell key={i} fill={d.tier === "ESTIMATE" ? COLORS.accent : COLORS.neutral} />)}
          <LabelList dataKey="display" position="right" />
        </Bar>
      </ComposedChart>
    </ChartFrame>
  );
}

function DepegChart() {
  return (
    <ChartFrame id="depeg" note={<span><Tag tier="FACT" /> CNBC (Mar 11, 2023) and CoinDesk (Mar 13, 2023); times are approximate, reconstructed from contemporaneous reporting, not a tick-by-tick market feed.</span>}>
      <LineChart data={DEPEG_DATA} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="t" angle={-30} textAnchor="end" interval={0} height={100} fontSize={10} />
        <YAxis domain={[0.85, 1.01]} tickFormatter={(v) => "$" + v.toFixed(2)} />
        <Tooltip formatter={(v) => "$" + Number(v).toFixed(4)} />
        <ReferenceLine y={1.0} stroke="#999" strokeDasharray="4 4" label={{ value: "$1.00 peg", position: "insideTopRight", fontSize: 11 }} />
        <Line type="monotone" dataKey="price" name="USDC price" stroke={COLORS.danger} strokeWidth={3} dot={{ r: 4 }}>
          <LabelList dataKey="price" position="top" formatter={(v) => "$" + v.toFixed(3)} />
        </Line>
      </LineChart>
    </ChartFrame>
  );
}

function QuadrantChart() {
  return (
    <ChartFrame id="quadrant" note={<span><Tag tier="ILLUSTRATION" /> Positions are the authors' qualitative placement based on the rules described in this section (GENIUS Act text, FDIC statute, money-market-fund rules), not a reported index or survey; axis values are illustrative, not measured data.</span>}>
      <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis type="number" dataKey="stringency" name="Reserve-backing stringency" domain={[0, 100]} label={{ value: "Reserve-backing stringency →", position: "insideBottom", offset: -10, fontSize: 12 }} />
        <YAxis type="number" dataKey="safetynet" name="Safety-net strength" domain={[0, 100]} label={{ value: "Safety-net strength →", angle: -90, position: "insideLeft", fontSize: 12 }} />
        <ReferenceLine x={50} stroke="#ccc" strokeDasharray="4 4" />
        <ReferenceLine y={50} stroke="#ccc" strokeDasharray="4 4" />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(v) => v} />
        <Scatter data={QUADRANT_DATA} fill={COLORS.accent}>
          {QUADRANT_DATA.map((d, i) => <Cell key={i} fill={COLORS.accent} />)}
          <LabelList dataKey="name" position="top" fontSize={11} />
        </Scatter>
      </ScatterChart>
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
  { id: "rq1", label: "RQ1: The Reserve Engine" },
  { id: "rq2", label: "RQ2: Risk Without a Net" },
  { id: "rq3", label: "RQ3: Does GENIUS Fix It?" },
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
    const q = id === FERMI_QUESTION.id ? FERMI_QUESTION : QUESTIONS.find((x) => x.id === id);
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
    if (!q) return null;
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
          <h1>The Bank That Isn't a Bank</h1>
          <p className="subtitle">Stablecoins' Reserve-Interest Machine, and What the GENIUS Act Does and Doesn't Fix</p>
          <h2>Warm-Up: What Stuck?</h2>
          <p>Before today's topic, three quick questions pull principles from the three most recent notes and ask you to apply them somewhere new — a golf club, a retirement account, an airline complaint line — not to recall anything about stablecoins.</p>
          {bySection("warmup").map(renderQuestion)}
        </section>

        {/* ============ INTRODUCTION ============ */}
        <section id="sec-intro" ref={registerRef("intro")} className="section">
          <h2>Introduction</h2>
          <p>Tether, a stablecoin company that had roughly 100 employees for most of 2024, reported $13 billion in net profit that year — more than Goldman Sachs, a 46,500-person bank, earned in the same year (<Cite id="tetherq42024">Tether, 2025</Cite>; <Cite id="goldman2024">Goldman Sachs, 2025</Cite>). Tether earned it the way banks have always earned money: take in dollars, invest them in interest-bearing government debt, and keep the spread. Yet U.S. law did not classify Tether as a bank at all, and until days before this note's window closes, no federal statute required it to hold any reserves whatsoever.</p>
          <p>A stablecoin is a digital token engineered to always be worth one U.S. dollar. The two largest, Tether's USD₮ and Circle's USDC, together hold about 83% of a market now worth roughly $316 billion (<Cite id="transakdefillama">Transak/DefiLlama, 2026</Cite>) — larger than the total deposits of most of the world's banks, run by two companies with a combined headcount smaller than a single regional bank branch network. Their business model is simple and, until 2025, almost entirely unregulated at the federal level: hold the dollars users hand over, invest them in Treasury bills and repurchase agreements, and pocket the interest, while users hold a token worth exactly $1.00 and earn nothing on it.</p>
          <p>That model looks like banking because it functions like banking — a deposit-taking, maturity-transforming intermediary standing between savers and the government-debt market. But it diverges from banking in one load-bearing way: a bank's depositors are insured by the Federal Deposit Insurance Corporation up to a set limit, and a solvent-but-illiquid bank can borrow from the Federal Reserve as a lender of last resort. A stablecoin holder has neither protection. When that gap became visible for 72 hours in March 2023, a stablecoin marketed as fully backed by cash and short-term Treasuries still lost 13 cents on the dollar.</p>
          <p>This note addresses three questions. First, how large is the reserve-interest engine that let a roughly hundred-person company out-earn a major global bank, and what exactly is it made of? Second, how much of a bank's actual safety does a stablecoin have, and what did the one real stress test — the March 2023 depeg tied to Silicon Valley Bank's failure — reveal about the gap? Third, now that the GENIUS Act has set federal reserve and licensing rules for stablecoins, does it close that gap, or does it mainly make the existing arbitrage legal and permanent?</p>
          <GlossaryPanel items={GLOSSARY.intro} />
        </section>

        {/* ============ BACKGROUND ============ */}
        <section id="sec-background" ref={registerRef("background")} className="section">
          <h2>Background: From Crypto Sideshow to a $316 Billion Dollar-Substitute</h2>
          <p>Stablecoins started as a niche tool for crypto traders who wanted a dollar-denominated place to park money between trades without leaving the blockchain. Total supply was about $27 billion at the end of 2020 — a rounding error next to any major currency market. It then grew more than sixfold in a single year, to $163 billion by the end of 2021, riding the broader crypto bull market (<Cite id="transakdefillama">Transak/DefiLlama, 2026</Cite>).</p>
          <p>Growth this fast came with a real crash. The 2022 collapse of TerraUSD, an "algorithmic" stablecoin that was never backed by cash reserves at all, wiped out roughly $40 billion overnight and dragged the whole category's supply down with it; the higher-interest-rate, risk-off period that followed pulled the total lower still, to a trough of about $130 billion by the end of 2023 (<Cite id="transakdefillama">Transak/DefiLlama, 2026</Cite>). From that trough, the market more than doubled in two years: supply added $75 billion in 2024 and another $102 billion in 2025, reaching about $308 billion by year-end 2025 and roughly $316 billion by mid-2026 (<Cite id="transakdefillama">Transak/DefiLlama, 2026</Cite>).</p>
          <TrajectoryChart />
          <ChartInterpretation chartId="trajectory" interp={interpFor("trajectory")} onSubmit={onSubmitInterp} />
          {renderQuestion(bySection("background")[0])}
          <p>That growth is not spread evenly. Tether's USD₮ alone holds about $187 billion, or roughly 59% of the market; Circle's USDC holds about $75 billion, or 24%. Together the top two control about 83% of all stablecoin supply, and no other issuer holds even a 3% share (<Cite id="transakdefillama">Transak/DefiLlama, 2026</Cite>). The structural reason this matters is not just size. It is what backs that $262 billion combined float: under both companies' own disclosures, the overwhelming majority sits in short-dated U.S. Treasury bills, Treasury-backed repurchase agreements, and bank cash deposits — the exact asset menu a conservative money-market fund holds, managed by a company that, unlike a money-market fund manager, was until mid-2025 not required by any federal law to hold any particular reserve mix, or any reserves at all.</p>
          <IssuerChart />
          <ChartInterpretation chartId="issuers" interp={interpFor("issuers")} onSubmit={onSubmitInterp} />
          {renderQuestion(bySection("background")[1])}
          <p>The regulatory vacuum did not last. On July 18, 2025, the GENIUS Act became the first U.S. federal law to set licensing and reserve rules for payment stablecoins, requiring 100% backing in cash, insured bank deposits, short-dated Treasury bills, and similarly liquid government-approved assets, with monthly public reserve certifications (<Cite id="geniuscov">Covington & Burling, 2025</Cite>). Stablecoin supply grew 50% in the same calendar year the law passed — a timing too clean to call proof of causation on its own, but a structural shift worth tracking through the rest of this note (<Cite id="transakdefillama">Transak/DefiLlama, 2026</Cite>).</p>
          <GlossaryPanel items={GLOSSARY.background} />
        </section>

        {/* ============ RQ1 ============ */}
        <section id="sec-rq1" ref={registerRef("rq1")} className="section">
          <h2>RQ1 — How Large Is the Reserve-Interest Engine, and What Is It Made Of?</h2>
          <p>Tether's own Q4 2024 attestation, prepared by the accounting firm BDO, states the mechanics plainly. The Group's consolidated reserves for outstanding tokens totaled $143.7 billion against $136.6 billion in token liabilities, an excess buffer of about $7.1 billion, up 36% from a year earlier. Direct and indirect exposure to U.S. Treasuries reached $113 billion by year-end, an all-time high, and the company issued $45 billion in new USD₮ during 2024 alone — almost the entire market capitalization of the second-largest stablecoin (<Cite id="tetherq42024">Tether, 2025</Cite>).</p>
          <p>The $13 billion in 2024 net profit breaks into three pieces: about $7 billion from Treasury and repurchase-agreement interest, about $5 billion from unrealized appreciation in Tether's gold and bitcoin holdings, and about $1 billion from other investments (<Cite id="tetherq42024">Tether, 2025</Cite>). That composition matters for judging how repeatable the number is: the interest-income slice depends on interest rates staying elevated, and the crypto-appreciation slice is a paper gain that can reverse. By the second quarter of 2026, with USD₮ circulation near $184.6 billion and rates having moved, Tether's own reported quarterly net operating profit had settled to about $1.5 billion, a run-rate closer to $6 billion a year (<Cite id="tetherq22026">Tether, 2026</Cite>) — still enormous, but a reminder that the 2024 figure combined an interest windfall with a market rally that will not repeat every year.</p>
          <BridgeChart />
          <ChartInterpretation chartId="bridge" interp={interpFor("bridge")} onSubmit={onSubmitInterp} />
          {renderQuestion(bySection("rq1").find((q) => q.id === "rq1c"))}
          <p>Scale alone does not explain Tether's profitability; the company's own public statements about scale illustrate a subtler trap. Tether's CEO said the firm's $33.1 billion in net Treasury purchases during 2024 made it the seventh-largest national buyer that year, ahead of Canada, Taiwan, Norway, and Germany (<Cite id="cryptoslatetreasuries">CryptoSlate, 2025</Cite>). That is a flow — how much the position grew in one year. Tether's total Treasury exposure, a stock measured at one point in time, was $113 billion at the same year-end. Confusing the two invites an inflated sense of Tether's relative footprint in either direction, depending on which number gets quoted.</p>
          {renderQuestion(bySection("rq1")[0])}
          <p>Set against Goldman Sachs, the comparison sharpens into something closer to a puzzle than a compliment. Goldman Sachs reported $14.28 billion in 2024 net earnings on $53.51 billion in net revenue, spread across 46,500 employees worldwide (<Cite id="goldman2024">Goldman Sachs, 2025</Cite>; <Cite id="gsheadcount">StockAnalysis.com, 2026</Cite>). Tether's headcount hovered near 100 for most of 2024, with a stated plan to roughly double toward 200 by mid-2025 (<Cite id="tetherheadcount">Cryptopolitan, 2024</Cite>). A back-of-envelope profit-per-employee comparison — Tether's roughly $13 billion spread across a low-hundreds headcount against Goldman's $14.28 billion spread across 46,500 people — produces a gap measured in the hundreds of multiples, not the single digits a normal efficiency comparison would show.</p>
          <PerHeadChart />
          <ChartInterpretation chartId="perhead" interp={interpFor("perhead")} onSubmit={onSubmitInterp} />
          {renderQuestion(bySection("rq1")[1])}
          <p>The honest reading of that gap is not that Tether runs a better business than Goldman Sachs. It is that the two companies are legally required to carry very different amounts of overhead for very different reasons. Goldman's headcount and cost base exist partly because federal and state regulators require the bank to hold specific capital ratios, fund deposit-insurance premiums, underwrite credit risk on loans, and staff a large compliance and risk-management apparatus. Tether, operating for most of its history outside any binding federal reserve-requirement statute, faced none of those obligations. Some of the profit gap is genuine operating leverage in a simple, software-driven business; a large, unquantified share of it is the price of carrying risk without the guardrails, and the overhead that comes with them, that bank regulation imposes on Goldman.</p>
          <GlossaryPanel items={GLOSSARY.rq1} />
        </section>

        {/* ============ RQ2 ============ */}
        <section id="sec-rq2" ref={registerRef("rq2")} className="section">
          <h2>RQ2 — How Much Bank-Like Safety Does a Stablecoin Actually Have?</h2>
          <p>The clearest way to see the safety gap is to watch what happened the one time it was tested. On March 10, 2023, regulators shut down Silicon Valley Bank, a $209 billion-asset lender, in the second-largest U.S. bank failure on record (<Cite id="cnbcsvbfailure">CNBC, 2023</Cite>). That evening, Circle disclosed that $3.3 billion of USDC's cash reserves — about 8% of the roughly $40 billion then backing the coin — sat at SVB and was, for the moment, unreachable (<Cite id="cnbcsvbusdc">CNBC, 2023</Cite>). USDC's price broke its $1.00 peg within hours and fell to about $0.87 by 2 a.m. on March 11 (<Cite id="cnbcsvbusdc">CNBC, 2023</Cite>).</p>
          <p>Notice the mismatch in that move: an 8% reserve shortfall produced a roughly 13-cent price drop, not an 8-cent one. Markets were not simply pricing the known gap; they were pricing the risk that the gap could be larger, or permanent, or that other reserve custodians might face the same fate as regional-bank stress spread. That is the signature of a run, the same dynamic that makes bank failures contagious, playing out in a token that had no deposit insurance and no lender of last resort to calm it.</p>
          <DepegChart />
          <ChartInterpretation chartId="depeg" interp={interpFor("depeg")} onSubmit={onSubmitInterp} />
          {renderQuestion(bySection("rq2")[0])}
          <p>The episode also ended quickly, which is its own lesson. On Sunday, March 12, the FDIC invoked a systemic-risk exception and announced that all SVB depositors, not just those under the normal insurance limit, would be made whole. USDC's price began recovering that weekend and reached about $0.9918 by March 13 (<Cite id="coindeskrecover">CoinDesk, 2023</Cite>). Before crediting that announcement alone, it is worth asking how much of the recovery came from arbitrage traders who profit by buying a discounted stablecoin and redeeming it at $1 once reserves look intact — a mechanical, self-correcting force that requires no regulatory action to operate, and one this note cannot fully separate from the FDIC's role using public data alone.</p>
          <p>Scale offers a useful, if imperfect, comparison. SVB's $209 billion in total assets made it roughly 75% the size of Tether's $157.6 billion group balance sheet at the end of 2024 (<Cite id="tetherq42024">Tether, 2025</Cite>; <Cite id="cnbcsvbfailure">CNBC, 2023</Cite>). Two institutions of broadly comparable scale, one a chartered bank and one an offshore stablecoin issuer, sit under completely different safety nets. SVB's story ended with insured and, eventually via the exception, uninsured depositors alike made whole by the federal government within days. A stablecoin issuer facing an equivalent shock has no equivalent guarantee written into law — its holders' outcome depends entirely on whether that issuer's own reserves turn out to be sufficient and accessible in time.</p>
          {renderQuestion(bySection("rq2")[1])}
          <p>The section's honest conclusion: a stablecoin that is genuinely, fully reserved can still lose its peg from an ordinary operational failure — a bank holding cash reserves failing — because full backing on paper is not the same protection as deposit insurance in practice. The 2023 episode resolved in days only because a specific, discretionary emergency action protected the bank where the reserves sat; nothing in that resolution was automatic, and nothing guaranteed it would repeat for a different custodian or a different issuer.</p>
          <GlossaryPanel items={GLOSSARY.rq2} />
        </section>

        {/* ============ RQ3 ============ */}
        <section id="sec-rq3" ref={registerRef("rq3")} className="section">
          <h2>RQ3 — Does the GENIUS Act Close the Gap, or Formalize the Arbitrage?</h2>
          <p>The GENIUS Act, signed into law on July 18, 2025, is the first serious federal attempt to regulate payment stablecoins as something more than an unsupervised money-transmission product. It requires issuers to back every stablecoin one-to-one with cash, insured bank deposits, short-dated Treasury bills, Treasury-backed repurchase agreements, or similarly liquid government-approved assets; bans commingling those reserves with operating funds; bars reusing reserve assets for other purposes (a practice called rehypothecation); and requires monthly, publicly certified reserve reports signed by the issuer's CEO and CFO (<Cite id="geniuscov">Covington & Burling, 2025</Cite>). Only subsidiaries of insured banks, nonbanks supervised by the Office of the Comptroller of the Currency, or qualifying state-chartered entities may issue a payment stablecoin at all (<Cite id="geniuscov">Covington & Burling, 2025</Cite>).</p>
          <p>Those provisions target exactly the vulnerability RQ2 exposed. A GENIUS Act issuer cannot legally hold the kind of concentrated, uninsured commercial-bank cash position that triggered USDC's 2023 depeg without at least meeting new liquidity and diversification standards regulators are still finalizing. On reserve QUALITY, the law is a genuine tightening.</p>
          <p>On reserve OWNERSHIP of the profit, the law does something different: it locks in place the exact business model this note has been describing. The GENIUS Act explicitly bars issuers from paying any interest or yield to stablecoin holders based on holding the token, whether in cash, additional tokens, or any other form (<Cite id="geniusinterest">CLS Blue Sky Blog, 2025</Cite>). Issuers keep every dollar of reserve interest for themselves; regulators wanted payment stablecoins to function purely as payment instruments, not as products that compete with bank deposits or money-market funds for savers' interest income (<Cite id="geniusinterest">CLS Blue Sky Blog, 2025</Cite>). The law is silent on whether an issuer's affiliates or partners can offer separate reward or yield programs tied to stablecoin use, and the Office of the Comptroller of the Currency has proposed extending the prohibition to affiliates and third parties as well (<Cite id="geniusinterest">CLS Blue Sky Blog, 2025</Cite>).</p>
          <QuadrantChart />
          <ChartInterpretation chartId="quadrant" interp={interpFor("quadrant")} onSubmit={onSubmitInterp} />
          {renderQuestion(bySection("rq3")[0])}
          <p>What the law does not do is extend anything resembling deposit insurance to stablecoin holders, or grant issuers routine access to the Federal Reserve as a lender of last resort. Those remain the two structural features that separate a GENIUS Act-licensed issuer from an insured bank, even after full compliance. The Act also explicitly bars regulators from forcing banks and credit unions to record custodied stablecoins as balance-sheet liabilities, a provision aimed at making it easier for traditional financial institutions to offer stablecoin custody (<Cite id="geniuscov">Covington & Burling, 2025</Cite>) — a sign the law's authors expect stablecoins to sit increasingly close to, but formally outside, the insured banking system, not to be absorbed into it.</p>
          {renderQuestion(bySection("rq3")[1])}
          <p>Circle's own 2025 results illustrate how central the interest-capture model remains even for the most compliance-forward issuer. USDC circulation grew 72% year over year to $75.3 billion by the end of 2025, and reserve income made up 95% of Circle's fourth-quarter revenue — $733 million of $770 million, off a reserve return rate of 3.8% (<Cite id="circleq4fy25">Circle, 2026</Cite>). Circle is actively trying to diversify into payment-network and subscription fees, but as of the most recent reported quarter, the reserve-interest engine this note describes was still doing almost all of the work. That single-issuer rate offers a way to size the whole industry's stake in this engine, not just one company's.</p>
          {renderQuestion(FERMI_QUESTION)}
          <p>The section's honest conclusion: the GENIUS Act closes the reserve-QUALITY gap that caused the one real stress event this note can point to, but it leaves the deposit-insurance and lender-of-last-resort gap fully open, and it converts what was previously an unregulated, legally ambiguous profit-capture arrangement into an explicitly lawful one. "Safer reserves, same business model" is the most defensible summary of what changed.</p>
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
          <p>Stablecoin issuers will most likely keep growing into a larger, better-capitalized, and better-regulated version of the same reserve-interest business, because the GENIUS Act fixed the specific reserve-quality failure that caused the one visible crisis while leaving the underlying profit-capture mechanism, and the deposit-insurance gap beneath it, untouched.</p>
          <p>For corporate treasurers and payment companies, that means stablecoins are becoming a more reliable payment rail without becoming a insured cash equivalent — concentration risk across issuers and custodians, not issuer insolvency alone, is the risk actually worth managing, since the 2023 episode showed even full, genuine backing can fail operationally for days at a time. For bank regulators, the durable question is not whether stablecoin reserves are safe today, but whether a business explicitly barred from sharing its interest income with holders will face growing pressure — from competitors, from Congress, or from holders themselves — to close that gap, changing the economics this note describes.</p>
          <p>Institutionally, the GENIUS Act's decision to legalize and formalize the interest-capture model, rather than require issuers to share it or extend deposit-style insurance to holders, reflects a specific policy choice: treat stablecoins as a payment instrument competing on convenience, not as a savings instrument competing on yield. That framing keeps money-market funds and banks, both of which do share yield with customers, structurally advantaged for anyone actually seeking a return, while stablecoins compete purely on speed and reach.</p>
          <p>The single most important open question: the GENIUS Act was written and passed without a full-scale stress test under the NEW rules — the one crisis this note can point to happened under the old, unregulated regime. Whether the law's reserve-quality fixes are sufficient will not be known until a comparably sized shock hits a fully compliant issuer, and the market — and regulators — see whether the peg holds.</p>
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

  const ALL_SCORED = QUESTIONS.concat([FERMI_QUESTION]);

  const typeBuckets = {};
  ALL_SCORED.forEach((q) => {
    const key = q.section === "warmup" ? "Warm-Up (B/E)" : "Type " + q.type;
    if (!typeBuckets[key]) typeBuckets[key] = { correct: 0, total: 0 };
    const st = questionState[q.id];
    if (st && st.submitted) {
      typeBuckets[key].total += 1;
      if (st.isCorrect) typeBuckets[key].correct += 1;
    }
  });

  const numericQs = ALL_SCORED.filter((q) => q.kind === "numeric");
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

  const missed = ALL_SCORED.filter((q) => {
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
      <p>You've seen six data exhibits across this note. Before the article's own three insight cards appear, write in one sentence the single most non-obvious insight you'd defend to a skeptical bank regulator.</p>
      {!insightRevealed ? (
        <div className="interp-input-row">
          <textarea rows={2} value={insightDraft} onChange={(e) => setInsightDraft(e.target.value)} placeholder="Your governing insight..." />
          <button className="btn-secondary" disabled={insightDraft.trim().length < 15} onClick={() => setInsightRevealed(true)}>Reveal the article's three</button>
        </div>
      ) : (
        <div>
          <div className="reader-answer"><span className="micro-label">Your insight</span>{insightDraft}</div>
          <div className="insight-cards">
            <div className="insight-card">Tether's profit gap over Goldman Sachs is not mainly a story of efficiency — it is a story of which risks and overhead each firm is legally required to carry, and Tether was, until 2025, required to carry almost none.</div>
            <div className="insight-card">A stablecoin can be genuinely, fully reserved and still lose its peg, because a reserve requirement protects the issuer's solvency on paper while deposit insurance protects the holder against the specific operational failure that actually happens — the two are not substitutes.</div>
            <div className="insight-card">The GENIUS Act fixes reserve QUALITY (what backs the coin) but leaves reserve OWNERSHIP (who keeps the interest) and the deposit-insurance gap exactly where they were — it makes the existing profit-capture arbitrage lawful rather than closing it.</div>
          </div>
        </div>
      )}

      <h3>Apply It</h3>
      <p><strong>(a) Your context — transfer to a new domain.</strong> A corporate payroll-card program shows: cardholder float balances of $2.1 billion, invested by the issuing bank in short-term Treasuries yielding 4.9%, with $0 of that yield passed to cardholders, and the issuing bank's own marketing describing the balances as "fully backed, zero-risk digital wallets." Write four labeled parts:</p>
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
      <textarea rows={2} value={applyIt.crosslink} onChange={(e) => setApplyIt({ ...applyIt, crosslink: e.target.value })} placeholder="e.g., ER-16's point about controlling both the supply and exchange rate of a token connects to today's note because..." />

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
