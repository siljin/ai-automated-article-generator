const { useState, useEffect } = React;
const {
  LineChart, Line, BarChart, Bar, ComposedChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LabelList, Cell, ReferenceLine
} = Recharts;

/* ============================== DATA ==============================
   All chart-data field names are checked against the Recharts spread trap:
   no field is named `ref`, `key`, or `children` anywhere in this file.
   =================================================================== */

/* Chart 1 -- Indexed line chart. North American top-100-tour average ticket price vs. the
   CPI-U, both rebased to 100 at 2018.
   Ticket price is FACT: 2018 and 2023 values from Apollo Academy (Torsten Slok), "Sharp
   Increase in the Costs of Going to Music Concerts After the Pandemic," 11 Nov 2023, citing
   Pollstar (North America, top 100 touring artists): $90 (2018), $120 (2023). 2024 and 2025
   values from Pollstar News (Bob Allen), "Pollstar 2025 Year End Business Analysis," 23 Dec
   2025 (North America): $136.45 (2024), $134.23 (2025).
   CPI-U index is an ESTIMATE: compounded by this article's author from the U.S. Bureau of
   Labor Statistics' own annual-average percent-change series (not seasonally adjusted),
   as tabulated by US Inflation Calculator, "Current U.S. Inflation Rates: 2000-2026,"
   updated 12 Aug 2026 (annual averages 2019-2025: 1.8, 1.2, 4.7, 8.0, 4.1, 2.9, 2.6 percent).
   Both series are rebased to 100 at 2018 by this article's author; the rebasing arithmetic
   does not change the underlying FACT values, so this chart is tagged FACT with the index
   method disclosed. */
const TICKET_VS_CPI = [
  { year: "2018", ticketIndex: 100, cpiIndex: 100 },
  { year: "2023", ticketIndex: 133.3, cpiIndex: 121.3 },
  { year: "2024", ticketIndex: 151.6, cpiIndex: 124.8 },
  { year: "2025", ticketIndex: 149.1, cpiIndex: 128.0 }
];

/* Chart 2 -- 100% stacked bar. Live Nation's 2025 revenue mix vs. segment-profit (Adjusted
   Operating Income, AOI) mix across its three reporting segments. Raw dollar figures are
   FACT (Live Nation Entertainment, "Full Year and Fourth Quarter 2025 Results," Feb 2026,
   as reported by Music Business Worldwide, 2026): Concerts revenue $20.9bn / AOI $687mn;
   Ticketing revenue $3.1bn / AOI $1.13bn; Sponsorship & Advertising revenue $1.3bn / AOI
   $845mn. Recharts computes each row's percentages from these raw values via
   stackOffset="expand". Segment AOI figures sum to about $2.66bn, above the $2.37bn
   consolidated AOI Live Nation reported (rounded to $2.4bn in the press headline), because
   unallocated corporate costs and
   eliminations are subtracted only at the consolidated level, not the segment level --
   a standard feature of segment reporting, disclosed in the chart note below. */
const REVENUE_VS_PROFIT_MIX = [
  { mix: "Share of 2025 revenue", concerts: 20900, ticketing: 3100, sponsorship: 1300 },
  { mix: "Share of 2025 segment profit (AOI)", concerts: 687, ticketing: 1130, sponsorship: 845 }
];

/* Chart 3 -- Waterfall. Bridge from an average top-tour face-value ticket to the all-in
   price fans pay, with the jury's proven per-ticket overcharge sized against the fee layer.
   Face value ($134, rounded from Pollstar's North America 2025 average of $134.23) and the
   $1.72 overcharge (Manatt, 17 Apr 2026) are FACT. The 27% fee rate is FACT (GAO-18-347,
   2018, a nongeneralizable sample, not a 2025 measurement). The dollar fee amount (about $36)
   and the all-in total (about $170) are ESTIMATE: this article's author applied the 2018
   GAO fee rate to the 2025 Pollstar face value, a modeled combination of two FACTs from
   different years and samples, not a single reported statistic. */
const PRICE_BRIDGE = [
  { name: "Average face-value ticket (2025)", base: 0, barHeight: 134, shown: 134, kind: "total" },
  { name: "+ Fees at 2018 GAO average rate (27%)", base: 134, barHeight: 36, shown: 36, kind: "up" },
  { name: "All-in price fans pay", base: 0, barHeight: 170, shown: 170, kind: "total" }
];

/* Chart 4 -- Dot plot / lollipop. Live Nation's share of three markets a federal jury found
   it illegally monopolized. Primary ticketing (~80%) and concert promotion (~70%) are FACT,
   from the actual jury verdict form as reported by Manatt, Phelps & Phillips LLP, 17 Apr
   2026. Large-amphitheater operation (64%) is FACT from an earlier measurement: American
   Economic Liberties Project (Krista Brown), "The Depth of Live Nation's Dominance," 15 Jun
   2023, analyzing Pollstar's 2022 venue data (Live Nation operates 56 of the 88 U.S.-based
   top-100 amphitheaters). The three figures come from different years (2022 and 2026) and
   are disclosed as such in the chart note; the jury verdict's own amphitheater finding was
   about market leverage, not a single re-measured percentage. */
const MARKET_SHARE_DOTS = [
  { market: "Concert promotion (national)", share: 70 },
  { market: "Large amphitheater operation (top 100 U.S., 2022 data)", share: 64 },
  { market: "Primary ticketing (major venues)", share: 80 }
];

/* Chart 5 -- Slope chart (two-period). Live Nation (LYV) share price vs. the S&P 500, both
   indexed to 100 at the start of 2026. FACT: Live Nation closed at $179.46 on 26 Jun 2026,
   up about 18% year-to-date and just below its 52-week high of $180.92 (TIKR.com, 29 Jun
   2026). The S&P 500 was up about 9% year-to-date as of similar dates in late June 2026, at
   a level of 7,473 (The Motley Fool / Yahoo Finance, 24 Jun 2026). Separately, on verdict
   day itself (15 Apr 2026) LYV fell 6.3% (TipRanks, 16 Apr 2026), a single-day move not
   part of this indexed series. Both index values below (118 for LYV, 109 for the S&P 500)
   are ESTIMATE: this article's author rounded and rebased the two reported year-to-date
   percentages onto a shared 100-start index; the underlying YTD percentages are FACT, but
   the indexing itself is an authored construction, disclosed in the chart note. */
const STOCK_VS_MARKET = [
  { stage: "Start of 2026 (Jan 1)", lyvIndex: 100, sp500Index: 100 },
  { stage: "Late June 2026 (~18% YTD for LYV)", lyvIndex: 118, sp500Index: 109 }
];

/* ============================== CHART PROMPTS ============================== */

const CHART_PROMPTS = {
  chart1: [
    { kind: "quant", label: "Quantitative reasoning",
      prompt: "By 2025 the ticket-price index reached about 149 and the CPI index reached about 128 (both rebased to 100 at 2018). Express the gap between them as a ratio (ticket index divided by CPI index), and say in plain terms what that ratio means for a concertgoer's budget.",
      authored: "149 divided by 128 is about 1.16. That means the price of a ticket to one of the year's biggest tours grew, relative to its own 2018 level, about 16% more than the price of the average consumer good or service grew relative to its 2018 level. It is a real, above-inflation squeeze on concertgoers, but a smaller one than headlines that measure all the way back to the 1990s tend to imply, and the gap has been narrowing, not widening, in the most recent year shown. This generalizes to any \"X outpaced inflation\" claim: rebase both series to the same starting point and read the ratio of the two index levels, not just the raw percentage change of either one alone." },
    { kind: "mechanism", label: "Qualitative / mechanism",
      prompt: "Both lines climb fairly steadily except for one clear kink: the ticket-price line dips slightly in 2025 while the CPI line keeps climbing. What is the most likely structural reason a live-event price index would ever fall in a single year, when a broad consumer price index almost never falls in a given year?",
      authored: "A price index built from thousands of goods and services (rent, insurance, groceries, medical care) is dominated by sticky prices that rarely all fall together in the same year, so the CPI-U tends to keep climbing even in a soft year. A touring-industry price index is built from a small, fast-changing set of decisions, how many superstar stadium tours happen this year, whether a Beyonce- or Oasis-scale act is on the road, that can shift the average from one year to the next without any broad economic slowdown at all. Pollstar's own 2025 write-up attributes the dip partly to demand normalizing after the post-pandemic \"revenge touring\" surge, not to fans suddenly paying less for the same seats. This generalizes to any narrow, event-driven index compared against a broad, sticky-price index: expect the narrow one to be more volatile, not less, even when its long-run trend is steeper." }
  ],
  chart2: [
    { kind: "quant", label: "Quantitative reasoning (percentage points vs. ratio)",
      prompt: "Ticketing is about 12% of Live Nation's 2025 revenue but about 42% of its segment profit, a 30-percentage-point gap. Now express that same relationship as a ratio (profit share divided by revenue share) for both Ticketing and Concerts. Which framing, the percentage-point gap or the ratio, makes Concerts' relative profitability look worse, and why might a decision-maker prefer one framing over the other?",
      authored: "Ticketing's ratio is about 42 divided by 12, roughly 3.5 times its revenue share. Concerts' ratio is about 26 divided by 83, roughly 0.3 times its revenue share, meaning Concerts earns barely a third of the profit share its revenue share alone would predict. The ratio framing makes Concerts look worse (a fraction below 1 reads as \"underperforming its size\"), while the percentage-point framing makes Ticketing's punch look more dramatic (30 points is a big, round number). Neither framing is the honest one on its own; a corporate-development team should check both before deciding which business line actually creates the most value per dollar of revenue. This generalizes to any \"segment X is small but mighty\" claim: recompute it as both a point gap and a ratio before repeating either headline." },
    { kind: "sowhat", label: "So-what / decision implication",
      prompt: "If you ran corporate development at a company shaped like this and had to recommend where next year's growth capital goes, based on this chart alone, which of the three segments would you fund first, and what risk would you flag before doing so?",
      authored: "Sponsorship & Advertising is the strongest case on this chart alone: it already earns the highest margin (64% of its own revenue) while being only 5% of total revenue, so it has the most room to scale before running into the physical limits that cap a touring business (a fixed number of nights, a fixed number of seats). The risk to flag is that Ticketing shows the same asset-light, high-margin shape, and it is precisely the business line a federal jury just linked to illegal monopolization; funding further growth in the highest-margin, least-touring-dependent lines raises regulatory exposure alongside operating leverage, not just the ordinary execution risk a corporate-development memo would normally flag. This generalizes to any \"which segment gets the capital\" decision: the segment with the best chart is not automatically the segment with the least real-world risk." }
  ],
  chart3: [
    { kind: "sowhat", label: "So-what / decision implication",
      prompt: "A concert promoter is explaining Ticketmaster's fee structure to a skeptical state legislator. Given how small the jury's proven overcharge is inside the total fee stack shown here, what is the single most persuasive, and still honest, argument the promoter could make, and what would undercut it?",
      authored: "The promoter can honestly say that the $1.72 overcharge the jury actually priced is a small slice of the roughly $36 fee layer on an average ticket, so a claim that \"the fees themselves ARE the proven monopoly tax\" overstates what this one damages finding established. What undercuts that argument is that the jury did not stop at pricing one damages number; it separately found the underlying market structure illegally monopolized across three linked markets (primary ticketing, amphitheater access, and concert promotion) through exclusionary conduct and tying. A small proven overcharge on one damages theory does not shrink the size of the broader structural finding the same jury also reached. This generalizes to any \"the fine was small, so the underlying violation must have been small\" argument: a damages number and a liability finding answer different questions." },
    { kind: "quant", label: "Quantitative reasoning",
      prompt: "Compute the jury's $1.72 overcharge as a share of the roughly $36 fee layer, and separately as a share of the roughly $170 all-in ticket price. Which of those two shares should a decision-maker actually care about more, and why?",
      authored: "$1.72 divided by $36 is about 4.8% of the fee layer; $1.72 divided by $170 is about 1.0% of the all-in price. The fee-layer share is the more useful number because it isolates the part of the price the ticketing and venue system actually controls, the part the lawsuit targeted, rather than diluting the overcharge against the much larger face-value component that the artist and promoter set and that the lawsuit did not target. Reporting only the all-in-price share (about 1%) makes the proven harm look smaller than it is relative to the part of the transaction Ticketmaster actually influences. This generalizes to any \"here's the overcharge as a share of the total bill\" claim: check what the denominator actually includes before judging the number's size." }
  ],
  chart4: [
    { kind: "quant", label: "Quantitative reasoning (percentage points vs. percent)",
      prompt: "Live Nation's share is about 80% in primary ticketing and about 70% in concert promotion. State the size of that gap two ways: as a percentage-point difference, and as a percent (relative) difference. Which framing would a Live Nation defense lawyer likely prefer in court, and which would a plaintiff's state attorney general likely prefer?",
      authored: "The gap is 10 percentage points (80 minus 70). Expressed relatively, 80 is about 14% higher than 70 (10 divided by 70). A defense lawyer would likely prefer emphasizing the smaller individual number, 70%, and the modest-sounding 10-point gap, rather than compounding the three markets into one alarming \"up to 80%\" headline; a state attorney general would likely prefer stacking all three shares together to show a pattern of dominance repeating across markets. This generalizes to any dispute over a company's market power: the same two numbers can be framed to sound routine or sound alarming depending on whether percentage points or a compounded narrative is chosen." },
    { kind: "causal", label: "Causal / comparative",
      prompt: "All three shares sit in a similar 64%-to-80% band across three different markets. Does that similarity make it MORE or LESS likely that the three high shares share one common cause, rather than being three separate coincidences? Explain your reasoning.",
      authored: "More likely. Three independently arrived-at monopolies in three unrelated markets would itself be a remarkable coincidence, and the jury did not have to rely on coincidence: it separately found that Live Nation tied its control of amphitheater access to its concert-promotion and ticketing businesses, meaning dominance in one market was used as leverage to extract dominance in the other two. That tying finding supplies the actual causal mechanism connecting the three numbers, so the correlation across markets is explained by specific, evidenced conduct, not treated as an unexplained pattern that happens to look suspicious. This generalizes to any case where several related metrics move together: look for the specific mechanism connecting them before either dismissing the pattern as coincidence or assuming it proves a single unstated cause." }
  ],
  chart5: [
    { kind: "quant", label: "Quantitative reasoning (predict the gap first)",
      prompt: "Before reading further, estimate how much Live Nation's stock moved relative to the S&P 500 (not in absolute terms) over 2026 so far, a year that included a federal jury's guilty antitrust verdict in mid-April. Then check: by late June 2026, LYV reached about 118 and the S&P 500 reached about 109 (both indexed to 100 at the start of the year). What is the gap in percentage points, and what does a positive gap this size, in a year that included a guilty verdict, imply about how investors are weighing the risk?",
      authored: "The gap is about 9 percentage points (118 minus 109) -- Live Nation's year-to-date gain is roughly double the S&P 500's. A positive gap this size means Live Nation's stock did not merely recover alongside a rising market; it outpaced the broader market over a year that included the exact verdict many expected to hurt it (the stock did fall 6.3% on the day of the ruling itself, but that single-day move is a small fraction of the full-year gap). That implies most investors are assigning a low probability to a financially severe remedy, not simply tolerating unresolved uncertainty while the stock drifts sideways with everything else. This generalizes to any \"the stock recovered\" claim after bad news: always net the stock's move against a broad-market benchmark over the same window before concluding the news stopped mattering." },
    { kind: "causal", label: "Causal / comparative",
      prompt: "Both lines rose together for months. Name one plausible force, other than \"investors decided the antitrust risk is fully resolved,\" that could push both Live Nation's stock and the broad market up together over the same months.",
      authored: "Broad macro tailwinds unrelated to Live Nation's specific legal exposure, falling interest rates, strong overall corporate earnings, or a sector-wide rally in travel and live-entertainment demand, would lift most large-cap stocks together, Live Nation included, regardless of what investors believe about its antitrust risk specifically. That is exactly why the chart compares LYV against the S&P 500 rather than looking at LYV's price alone: netting out the shared macro force is what makes the remaining 9-point gap meaningful. This generalizes to any single stock's post-crisis \"recovery\" story: a rising tide lifts most boats, so isolate the company-specific move before crediting or blaming the specific news event." }
  ]
};

/* ============================== QUESTIONS ============================== */

const WARMUP_QUESTIONS = [
  { id: "wu1", type: "B", principle: "A percentage change and an aggregate average are answering different questions: a large effect concentrated in a small slice of a population can leave the population-wide average almost unchanged, and neither number alone tells you whether an intervention worked or would scale.",
    transfer: "Where this generalizes: any pilot program, from a retail loss-prevention rollout to a public-health trial, needs its subgroup result and its population-level result read together, not treated as competing verdicts.",
    prompt: "A national gym chain reports that member cancellations fell 3% company-wide last year after it introduced a \"pause my membership\" feature. An analyst notes the feature was only switched on at 50 of the chain's 1,200 locations, a regional pilot, where cancellations fell 40%. What does this combination most likely imply?",
    options: [
      { text: "Because the 40-store pilot is a small share of the 1,200-location chain, a large effect there can coexist with almost no visible movement in the national number; the 3% company-wide figure says little on its own about whether the feature works, and nothing here shows the pilot locations were representative or that the result would hold chain-wide.", correct: true },
      { text: "The two figures cannot be compared at all, because one is a percentage and the other is a percentage-point change, so no conclusion can be drawn from placing them side by side.", correct: false, misconception: "misapplying the percentage-point-versus-percent distinction to a case where both figures are legitimate percent changes, a rule pattern-matched from a different context" },
      { text: "Since the pilot fell 40% while the company-wide number fell only 3%, the feature is actually failing everywhere outside the pilot, and something unrelated must explain the pilot's result.", correct: false, misconception: "treating the small aggregate move as the only trustworthy signal and dismissing a real, measured subgroup effect outright" },
      { text: "The 40% pilot improvement will likely repeat chain-wide once the feature rolls out everywhere, so leadership should expect the national cancellation rate to eventually fall by a similar amount.", correct: false, misconception: "extrapolating a small subgroup's effect onto the full population without checking whether the pilot locations were representative or whether the mechanism scales" }
    ] },
  { id: "wu2", type: "B", principle: "A reform that removes one actor's incentive to behave a certain way does not automatically fix a different actor's separate mechanism that produces the same outcome; a single-cause model of a behavior is often wrong when more than one incentive points the same direction.",
    transfer: "Where this generalizes: any \"we fixed the incentive, so the behavior should stop\" claim needs to check whether a second, untouched mechanism can produce the same behavior on its own.",
    prompt: "A city bans landlords from charging tenants a separate \"convenience fee\" for paying rent online. A year later, tenants' total monthly housing cost has not fallen: landlords still pay a per-transaction fee to their property-management software vendor, and most have simply folded that cost into the base rent instead. Which explanation is most consistent with the principle that a reform addressing one actor's incentive can leave a different actor's mechanism untouched?",
    options: [
      { text: "Rent control laws in most cities already cap how much landlords can raise base rent, so this outcome must mean the city's ban was not actually enforced.", correct: false, misconception: "assuming a single-mechanism model with no alternative causal pathway, so any failure to observe the predicted drop must be an enforcement problem rather than a wrong model" },
      { text: "The vendor's per-transaction fee is a separate cost landlords still face and still pass through, a mechanism the ban on tenant-facing convenience fees never touched, so removing the visible fee left the underlying cost, and the incentive to recover it, fully intact.", correct: true },
      { text: "Rent is fungible with any other landlord expense, so redirecting where a fee is labeled can never change what a tenant actually pays in total.", correct: false, misconception: "overgeneralizing a fiscal point about fungibility into a sweeping claim that no fee relabeling could ever matter, ignoring that the ban did remove a visible line item even if the total cost persisted" },
      { text: "Landlords are acting in bad faith by raising base rent specifically to punish tenants for the new law, rather than responding to a real underlying cost.", correct: false, misconception: "substituting a motive-based explanation for the actual cost mechanism described in the scenario" }
    ] },
  { id: "wu3", type: "E", principle: "A person's belief about how much a new tool helped them is not a measurement of how much it actually helped; self-report and an independently measured outcome can point in different directions for the same people doing the same work, so a decision built only on self-report is building on the belief, not the measurement.",
    transfer: "Where this generalizes: any \"users say this tool saves them time\" claim, in any industry, should be checked against an independent, measured comparison before it drives a budget or staffing decision.",
    prompt: "A hospital system rolls out an AI-based nurse-scheduling tool. Six months later, 85% of head nurses report the tool \"saves them significant time\" building weekly schedules. A separate time-motion study, timing the actual scheduling process before and after rollout across the same units, finds no measurable change in hours spent. Given this gap, which decision is most directly supported for the hospital's operations team, and what evidence would most threaten it?",
    options: [
      { text: "Expand the tool to every remaining unit immediately, since 85% self-reported satisfaction is strong evidence of a real time savings that the time-motion study simply failed to detect.", correct: false, misconception: "treating a high self-report rate as proof of a measured effect, the exact substitution this principle warns against" },
      { text: "Withdraw the tool everywhere immediately, since the time-motion study is the only trustworthy data point and self-reported satisfaction should be disregarded entirely.", correct: false, misconception: "overcorrecting into dismissing self-report entirely, when satisfaction itself may still matter for retention or morale even if it is not evidence of a time savings" },
      { text: "Commission a second, independent measured comparison, ideally on a task the current study may have missed (such as reduced schedule errors or fewer last-minute changes) before making any budget or staffing decision based on the current mixed signal, and treat the decision as unsupported until that comparison exists; this would be falsified if a well-designed follow-up measurement found a real, reproducible time or error reduction that the first study's design had missed.", correct: true },
      { text: "Average the two findings together, splitting the difference between \"saves significant time\" and \"no measurable change,\" and report that the tool saves a moderate amount of time.", correct: false, misconception: "averaging a belief-based measure and an outcome-based measure as if they were two estimates of the same underlying quantity, when they measure fundamentally different things" }
    ] }
];

const INTRO_QUESTIONS = [
  { id: "intro-c", type: "C", cardClass: "case-card",
    principle: "A company's willingness to sign away future flexibility for an upfront payment should be evaluated against the specific legal and competitive conduct regulators have already flagged as illegal, not just against the size of the check.",
    transfer: "Where this generalizes: any exclusivity contract offered by a dominant supplier, in any industry, should be checked against known antitrust findings about that supplier's conduct before being judged on price alone.",
    prompt: "Harborlight Amphitheater Group (a fictional independent venue operator) is deciding whether to sign a new 10-year exclusive ticketing and promotion agreement with Ticketmaster in exchange for a large upfront payment. Given what this note has established so far about how the jury found Live Nation's monopoly power was built and maintained, across three linked markets tied together, what is the single most important factor Harborlight's board should weigh before signing, beyond the payment amount itself?",
    options: [
      { text: "Whether Ticketmaster's checkout app is more familiar to Harborlight's typical concertgoers than a competing ticketing platform would be.", correct: false, misconception: "substituting a real but secondary customer-experience concern for the load-bearing competitive-structure question the case actually turns on" },
      { text: "Whether other independent venues in the region have already signed similar deals, since matching a competitor's contract terms is the safest strategic choice.", correct: false, misconception: "appeal to conformity as a stand-in for evaluating the deal's own terms and risks" },
      { text: "Whether the size of the upfront payment is large enough to offset ten years of foregone flexibility, treating the payment as the primary variable to negotiate harder on.", correct: false, misconception: "short-termism: treating the upfront payment as the main variable while ignoring the foreclosure risk the case has already flagged as illegal" },
      { text: "Whether the exclusivity clause would foreclose competing ticketers and promoters from ever bidding for Harborlight's business in a way that resembles the exact tying conduct a federal jury just found illegal, which raises real regulatory and reputational exposure for Harborlight itself, not just for Ticketmaster.", correct: true }
    ] }
];

const BACKGROUND_QUESTIONS = [
  { id: "bg-b", type: "B", tiedChart: "the revenue-versus-profit mix chart above",
    principle: "A business segment's share of total revenue and its share of total profit are answering different questions; a capital-light, high-margin segment can generate a profit share far above its revenue share, while a capital-heavy, low-margin segment does the reverse, and neither pattern by itself proves the smaller segment is more valuable to protect than the larger one.",
    transfer: "Where this generalizes: any \"our smallest segment drives most of our profit\" claim, in any conglomerate, should be checked against the segment's underlying cost structure, not treated as evidence that segment is simply run better.",
    prompt: "Live Nation's Concerts segment generates about 83% of 2025 revenue but only about 26% of segment profit, while Ticketing generates about 12% of revenue but about 42% of segment profit. What is the most likely structural reason for this gap, rather than assuming one segment is simply managed better than the other?",
    options: [
      { text: "Concerts carries the large fixed costs of touring itself, artist fees, venue rental, staging, and production, paid out before a single ticket is sold, while Ticketing and Sponsorship are comparatively asset-light businesses layered on top of an event that Concerts already paid to create; the profit-revenue gap reflects fundamentally different cost structures across the three segments, not simply better or worse management.", correct: true },
      { text: "Every business segment's share of profit should always equal its share of revenue in a well-run company, so this gap is itself evidence Live Nation's Concerts segment is being mismanaged relative to its ticketing and sponsorship arms.", correct: false, misconception: "assuming revenue share and profit share must be equal in any well-run company, ignoring that different business models carry structurally different margins" },
      { text: "The Concerts segment must be unprofitable overall, since its profit share is so far below its revenue share.", correct: false, misconception: "confusing a segment's SHARE of a company's total profit pool with that segment's own margin; a 26% profit share on 83% of revenue is a real but thin 3.3% margin, not a loss" },
      { text: "Ticketing's higher profit share proves Ticketmaster has more market power than the Concerts touring business, since profit share is a direct measure of market power.", correct: false, misconception: "conflating profit share, a function of cost structure and margin, with market power, a separate concept that requires its own evidence (such as the market-share findings discussed later in this note)" }
    ] }
];

const RQ1_QUESTIONS = [
  { id: "rq1-b", type: "B", tiedChart: "the market-share dot plot above",
    principle: "When the same actor holds a similarly dominant share across several separate but linked markets, the pattern itself is evidence to explain, not a coincidence to average away; a specific, evidenced mechanism connecting the markets (such as a proven tying arrangement) turns three suspicious numbers into one coherent causal story.",
    transfer: "Where this generalizes: any company that shows unusually high market share across several adjacent markets at once should prompt a search for the specific mechanism connecting those markets, rather than either dismissing the pattern or assuming a single \"true\" share by averaging the numbers.",
    prompt: "The jury found Live Nation dominant in three separate but linked markets: about 80% of primary ticketing, about 64% to 78% of large-amphitheater access (depending on the measurement and year), and about 70% of national concert promotion. Why does the fact that this dominance spans three linked markets, rather than showing up as one very high number in a single market, matter more than any single share figure on its own?",
    options: [
      { text: "The three numbers should be averaged into one \"true\" market-share figure, since reporting three separate percentages for one company is redundant and only the average matters for antitrust purposes.", correct: false, misconception: "assuming multiple related metrics should collapse into a single average rather than each measuring a distinct, legally separate market" },
      { text: "Dominance across three linked markets that reinforce each other is harder for a single new competitor to challenge than dominance in any one market alone, because a rival ticketing platform, a rival promoter, and a rival venue operator would each need to break in at the same time to seriously compete, which is exactly the kind of interlocking structure the jury's tying finding described.", correct: true },
      { text: "Only the single highest number, 80% in primary ticketing, is legally relevant, since the other two markets have lower shares and therefore do not matter to the monopoly finding.", correct: false, misconception: "anchoring on the largest number and discarding the others, when the jury's own liability findings covered all three markets plus the tying arrangement connecting them" },
      { text: "Three separate figures all landing in a similar high range across unrelated markets is most likely a measurement or reporting error, since true independent probabilities that high in three different markets would be extremely unlikely.", correct: false, misconception: "assuming the three markets are statistically independent draws, when the tying finding shows they are causally connected rather than independent" }
    ] },
  { id: "rq1-c", type: "C", cardClass: "case-card",
    principle: "A conclusion that a company's total price to consumers is mostly illegal monopoly rent requires the load-bearing assumption that the adjudicated overcharge represents the bulk of the price gap; when that overcharge is a small fraction of the total fee stack, the rest of the gap needs a separate explanation, and the thinnest evidence in the case is usually exactly that unexplained remainder.",
    transfer: "Where this generalizes: any claim that \"a proven violation explains most of what customers pay\" should be checked against how large the adjudicated harm actually is relative to the full price stack, not just against whether a violation was found at all.",
    prompt: "Northgate Live (a fictional independent concert promoter) is preparing testimony arguing that \"the jury's verdict proves most of what fans pay in ticket fees is illegal monopoly overcharge.\" Which assumption must hold for that specific claim to be true, and what evidence in this section is thinnest in supporting it?",
    options: [
      { text: "The assumption that must hold is that Ticketmaster's checkout software is more expensive to operate than a typical e-commerce platform, and the evidence for this is thinnest because no cost data on Ticketmaster's software was presented in this note.", correct: false, misconception: "substituting an unrelated technical cost question for the actual load-bearing assumption the claim depends on" },
      { text: "The assumption that must hold is that all 34 states that won at trial will ultimately receive the same remedy, and the evidence for this is thinnest because remedies have not yet been decided.", correct: false, misconception: "conflating the pending remedies question with the separate empirical claim about what share of the fee stack the overcharge represents" },
      { text: "The assumption that must hold is that the $1.72 per-ticket overcharge the jury actually priced represents most of the roughly $36 fee layer on an average ticket; the evidence for this is thinnest, since $1.72 is only about 5% of that fee layer, meaning roughly 95% of the fee stack was not itself the subject of the jury's damages finding and would need a separate explanation, real service costs, venue and promoter take, or other conduct not captured in this one damages number, before Northgate's broader claim could be supported.", correct: true },
      { text: "The assumption that must hold is that concert ticket demand is perfectly inelastic, and the evidence for this is thinnest because no demand elasticity study was cited in this note.", correct: false, misconception: "introducing an economic concept (elasticity) that is not the assumption the specific claim about fee-stack composition actually depends on" }
    ] }
];

const RQ2_QUESTIONS = [
  { id: "rq2-b", type: "B", tiedChart: "the revenue-versus-profit mix chart shown earlier",
    principle: "A negotiated settlement's specific terms often reveal which assets a company values most, and a company will rationally trade away a lower-margin, more replaceable asset to protect a higher-margin, harder-to-replace one, even while still facing a separate, undecided verdict over the same underlying conduct.",
    transfer: "Where this generalizes: before reading a settlement's scope as a measure of contrition or of how serious the underlying violation was, check which assets were actually given up and which were protected, and ask why.",
    prompt: "Ticketing, the segment at the center of the monopoly finding, generates a disproportionate 42% of Live Nation's segment profit from only 12% of its revenue. Given that concentration, what does it suggest about why Live Nation was willing to settle with the U.S. Department of Justice by divesting 13 amphitheaters and capping fees only at those venues, rather than agreeing to divest Ticketmaster itself, while 34 state attorneys general went on to win a full jury verdict on the same underlying facts?",
    options: [
      { text: "The size of a settlement is always proportional to the severity of the underlying legal violation, so a settlement this narrow in scope implies the DOJ's version of the case must have been substantially weaker than the states' version that went to trial.", correct: false, misconception: "assuming settlement scope is a direct, reliable proxy for how strong or weak the underlying legal case was, rather than a negotiated outcome shaped by each side's incentives and risk tolerance" },
      { text: "Divesting any physical amphitheater is inherently more costly to a company than divesting a digital ticketing platform, regardless of each asset's actual profit contribution, so the settlement necessarily represents the more painful concession for Live Nation.", correct: false, misconception: "assuming physical assets are automatically more valuable or costly to lose than digital ones, without checking the actual profit data, which shows the opposite ordering here" },
      { text: "Because the DOJ settled first, its settlement terms will automatically become the ceiling for whatever remedy the judge orders for the states that won at trial, making the states' verdict largely symbolic.", correct: false, misconception: "assuming a settlement automatically caps or overrides a separate jury verdict's remedies, when this note describes that relationship as a genuinely unresolved legal question, not a settled fact" },
      { text: "The settlement's shape is a rational, asymmetric concession: giving up a relatively small, lower-margin set of amphitheaters protects the far more profitable, structurally central Ticketing business, so the settlement's scope reflects a negotiated trade-off of which assets to protect, not a neutral measure of how serious the underlying conduct was found to be.", correct: true }
    ] },
  { id: "rq2-c", type: "C", cardClass: "case-card",
    principle: "A remedy that changes an incentive or a price only at a small, specifically targeted subset of a market carries a load-bearing assumption that the change will spread to the rest of the market through competitive pressure; when the same dominant firm still controls nearly all of the untouched remainder, that spillover assumption is usually the weakest link in the remedy's design.",
    transfer: "Where this generalizes: any narrowly scoped settlement or regulation, a price cap at a few locations, a disclosure rule for a subset of products, should be checked for whether it assumes competitive spillover to the untouched majority of the market, and whether that assumption has any supporting evidence.",
    prompt: "The DOJ settlement caps Ticketmaster's service fees at 15% only at the 13 amphitheaters Live Nation agreed to sell, down from the historical 27%-to-31% average fee range. Which assumption must hold for this fee cap to meaningfully lower what fans pay across the broader ticketing market, not just at those 13 venues, and what evidence in this section is thinnest in supporting it?",
    options: [
      { text: "The assumption that must hold is that a fee cap at a small number of divested venues will pressure Ticketmaster and its rivals to lower fees at the roughly 250-plus other top U.S. amphitheaters and arenas it still tickets, through ordinary competitive spillover; the evidence for this is thinnest, because nothing in the settlement or in this note shows that a price change at a handful of venues affects pricing anywhere Ticketmaster still holds a dominant share.", correct: true },
      { text: "The assumption that must hold is that the 13 divested amphitheaters are the highest-grossing venues in the country, and the evidence for this is thinnest because attendance figures for those specific 13 venues were not provided in this note.", correct: false, misconception: "substituting a question about venue size for the actual spillover assumption the remedy's broader effectiveness depends on" },
      { text: "The assumption that must hold is that concertgoers will notice the lower fee and shift their attendance toward the 13 divested venues, and the evidence for this is thinnest because no consumer survey was cited.", correct: false, misconception: "focusing on a secondary behavioral response (venue-shopping by fans) rather than the pricing-spillover mechanism the settlement's market-wide impact actually depends on" },
      { text: "The assumption that must hold is that Live Nation will comply with the settlement in good faith, and the evidence for this is thinnest because Live Nation previously violated its 2010 merger consent decree.", correct: false, misconception: "raising a real but different concern (compliance risk) rather than the specific market-structure assumption (competitive spillover to untouched venues) the question asks about" }
    ] }
];

const RQ3_QUESTIONS = [
  { id: "rq3-b", type: "B", tiedChart: "the LYV-versus-S&P 500 slope chart above",
    principle: "Two series that rise together over the same months are not automatically evidence that the same specific cause drove both of them; before crediting or blaming one specific piece of news for a stock's rise, net its move against a broad-market benchmark over the same window to see what, if anything, is left to explain.",
    transfer: "Where this generalizes: any \"the stock recovered, so the bad news must not have mattered\" claim, for any company after any negative event, should be checked against how the broader market moved over the same period before drawing a conclusion about what investors specifically believe.",
    prompt: "Live Nation's stock rose alongside a broadly rallying S&P 500 in the months after the verdict. Which is the strongest reason NOT to conclude that this joint rise shows investors decided the monopoly verdict was economically inconsequential?",
    options: [
      { text: "Because both the stock and the index rose together, they must be responding to the exact same single underlying cause, most likely renewed investor confidence in Live Nation's specific legal position.", correct: false, misconception: "treating simple co-movement as proof of a single shared cause, and then assuming that cause must be the specific event under discussion" },
      { text: "Live Nation's stock actually rose MORE than the S&P 500 over the same window (about 18% versus about 9%), so simple co-movement with a rising market cannot fully explain the gain on its own; isolating what investors believe specifically about the antitrust risk requires comparing Live Nation's move net of the broad market, not the raw co-movement, since shared macro forces, falling rates, strong earnings, a travel and entertainment sector rally, could lift both series together for reasons that have nothing to do with the verdict.", correct: true },
      { text: "The S&P 500's rise proves nothing whatsoever about Live Nation specifically, so comparing the two is not a meaningful exercise and should be abandoned.", correct: false, misconception: "overcorrecting into dismissing the value of a benchmark comparison entirely, when netting a stock's move against a broad index is precisely how an analyst isolates a company-specific signal" },
      { text: "Because Live Nation's stock is quoted in dollars and the S&P 500 is quoted in index points, the two cannot be meaningfully compared under any circumstances.", correct: false, misconception: "a unit-confusion objection that does not hold up, since both series were rebased to a common indexed starting value of 100 specifically to make them comparable" }
    ] },
  { id: "rq3-c", type: "C", cardClass: "case-card",
    principle: "When two enforcement paths reach different outcomes on the same underlying facts, a legally unprecedented conflict between them, not simply the passage of time, is usually the actual reason a remedy remains genuinely undecided; assuming courts default to either the harsher or the more lenient outcome skips over the real procedural question.",
    transfer: "Where this generalizes: any situation where a regulator settles a case while a separate party litigates the identical underlying facts to a different result should be evaluated on the specific legal mechanism reconciling the two outcomes, not on a general assumption about how such conflicts \"usually\" resolve.",
    prompt: "Whitcombe Capital, a fictional pension-fund equity analyst, is deciding how much weight to place on the antitrust verdict when modeling Live Nation's forward earnings. Based on what this note has established, which is the single biggest reason the remedies-phase outcome remains a genuinely open question rather than a foregone conclusion?",
    options: [
      { text: "Courts in antitrust cases historically side with the defendant whenever a settlement already exists, so the states' jury verdict is unlikely to result in any additional remedy beyond what the DOJ already negotiated.", correct: false, misconception: "asserting a general rule about how courts \"usually\" rule without evidence, when this note explicitly describes the situation as legally unprecedented" },
      { text: "Public anger over ticket fees, well documented since the 2022 Ticketmaster-Taylor Swift incident, guarantees that the judge will order the maximum possible remedy, including a full corporate breakup.", correct: false, misconception: "treating public sentiment as a reliable predictor of a specific legal remedy, rather than one input among many the court will weigh" },
      { text: "Judge Subramanian must reconcile an outcome with no direct precedent: a settlement the DOJ negotiated (still awaiting its own Tunney Act fairness review) sitting alongside a full jury verdict won by 34 states that specifically declined that settlement on the identical underlying conduct, and no prior case has required a court to weigh a live jury verdict against a pending settlement in the same matter.", correct: true },
      { text: "A settlement always legally overrides a jury verdict reached afterward in the same case, so the DOJ's March 2026 settlement terms will simply become the final outcome regardless of what the trial produced.", correct: false, misconception: "asserting an incorrect and oversimplified legal rule about how settlements and jury verdicts interact, when this note describes the actual relationship between the two as unresolved" }
    ] }
];

const CONCLUSION_QUESTION = { id: "concl-e", type: "E", tiedChart: null,
  principle: "A recommendation made under genuine, unresolved uncertainty should size its position to the uncertainty itself, rather than betting as if the most likely outcome were already certain, and it should name in advance the specific observation that would prove the position wrong.",
  transfer: "Where this generalizes: any investment, policy, or operating decision made while a major, binary-ish legal or regulatory outcome is still pending benefits from a position sized to the range of outcomes, with an explicit, falsifiable trigger for revising it, rather than a single confident bet on the most likely case.",
  prompt: "An institutional investor, having read this note, is deciding whether Live Nation's stock price already reflects the full economic risk of the April 2026 monopoly verdict. Given that remedies remain undecided, that the DOJ's settlement and the states' jury verdict may be legally incompatible, and that Live Nation's stock has outpaced the broader market since the verdict, which decision is most directly supported by this note, and what single observation would most threaten (falsify) that decision's underlying thesis?",
  options: [
    { text: "Sell the position immediately, since a jury finding a company liable on 13 antitrust counts always precedes a value-destroying breakup; this would be falsified only if the company were never broken up, an outcome this note's own reporting on the settlement's precedent already suggests is plausible, meaning the thesis ignores the settlement's own track record of avoiding a full breakup.", correct: false, misconception: "treating a guilty verdict as equivalent to \"the maximum possible penalty will follow,\" ignoring the settlement precedent already on the record" },
    { text: "Buy aggressively, since the stock's rise since the verdict proves institutional investors have already concluded there is zero real financial risk remaining; this would be falsified only if the stock ever fell again for any reason at all, an untestable bar since stock prices fluctuate for many unrelated reasons on any given day.", correct: false, misconception: "treating a stock's rise as proof of a specific belief (zero remaining risk) and then setting an unfalsifiable, overly broad test for that belief" },
    { text: "Take no position and wait until every pending motion and appeal is fully resolved before forming any view at all; this would be falsified only if every court ruled unanimously and simultaneously, an impossible bar given that appeals proceed sequentially over months or years, not all at once.", correct: false, misconception: "setting an impossible falsification bar as a way to avoid making a probabilistic decision under genuine, ordinary legal uncertainty" },
    { text: "Hold the position with a wider risk premium, treating the remedies phase as a genuinely undecided outcome, ranging from modest fee caps and damages to a full structural breakup, rather than a fully priced-in certainty, and set an explicit trigger: if Judge Subramanian's remedies order imposes a full structural breakup separating Ticketmaster from Live Nation, this note's implicit thesis that \"the market has this about right\" is falsified, because that outcome would be a far larger earnings hit than anything the post-verdict stock price currently implies.", correct: true }
  ] };

const NUMERIC_QUESTIONS = [
  { id: "bg-d", type: "D", toleranceType: "tight", tolerancePct: 15, target: 11.09, unit: "x (Ticketing's AOI margin as a multiple of Concerts' AOI margin)", requiresPath: false,
    prompt: "Live Nation's Concerts segment reported 2025 revenue of $20.9 billion and Adjusted Operating Income (AOI, a segment-profit measure) of $687 million. Its Ticketing segment reported 2025 revenue of $3.1 billion and AOI of $1.13 billion. First compute each segment's own AOI margin (AOI divided by that segment's own revenue). Then estimate Ticketing's margin as a multiple of Concerts' margin.",
    tolNote: "Tight tolerance (+/-15%): this is two-step arithmetic from four stated FACTs, with a slightly wider band than a single-step calculation because it compounds two rounding steps.",
    decomposition: "Concerts' own margin: 687 divided by 20,900 is about 3.29%. Ticketing's own margin: 1,130 divided by 3,100 is about 36.45%. Ticketing's margin as a multiple of Concerts' margin: 36.45 divided by 3.29 is about 11.1x. The lesson: a segment's AOI MARGIN (profit divided by that segment's OWN revenue) is a different, and usually more informative, number than its share of total company profit; Ticketing is roughly eleven times more profitable per dollar of its own revenue than Concerts is per dollar of its own revenue, even though Concerts is by far the larger business in absolute dollar terms." },
  { id: "rq1-d", type: "D", toleranceType: "tight", tolerancePct: 10, target: 2.064, unit: "$ billions (total damages implied by this decomposition, before any judicial adjustment)", requiresPath: false,
    prompt: "The jury found a $1.72 overcharge on each ticket sold at major concert venues. Attorneys for a certified class of consumers estimated, in court filings, that this overcharge applied across roughly 400 million tickets sold at inflated prices. Under the Clayton Act, a proven federal antitrust violation entitles plaintiffs to automatic treble damages, meaning the base amount a court calculates is multiplied by three before any further adjustment. Using only these figures, estimate the total damages figure this decomposition implies, in billions of dollars.",
    tolNote: "Tight tolerance (+/-10%): this is exact multiplication from three stated figures, not a judgment call.",
    decomposition: "$1.72 multiplied by 400,000,000 tickets is $688,000,000 in base damages. Automatically trebled under the Clayton Act, 3 times $688,000,000 is $2,064,000,000, or about $2.06 billion. This figure lines up closely with the states' own published litigation estimate that trebled damages \"would exceed $2 billion.\" It is also far larger than Live Nation's own competing estimate, reported at roughly $450 million trebled, a gap that is not a rounding error: it reflects a genuine, unresolved dispute over how many tickets and how much overcharge the final damages calculation should actually cover, which is exactly what the pending remedies-phase proceeding exists to settle." }
];

const NUMERIC_QUESTIONS_OPEN = [
  { id: "rq2-d", type: "D", toleranceType: "fermi", acceptLow: 1.55, acceptHigh: 6.2, target: 3.1, unit: "$ billions (Ticketmaster's approximate 2025 revenue from ticketing fees and services)", requiresPath: true,
    prompt: "Ticketmaster processed about 346 million tickets in 2025 across every event type it services: concerts, sports, theater, comedy, and family shows. Pollstar's data on the very biggest touring acts in the world puts the average concert ticket price at roughly $134 in 2025. Using only these two figures as your anchors, and naming your decomposition path before entering a number, estimate Ticketmaster's approximate total 2025 revenue from ticketing fees and services, in billions of dollars.",
    tolNote: "Wide tolerance, scored within a factor of 2 either way: this is a genuine order-of-magnitude Fermi estimate, not a precise reported number, because the two anchors describe different populations.",
    decomposition: "A naive calculation multiplies 346 million tickets by a typical GAO-style fee (about 27% of $134, or roughly $36 per ticket) to get nearly $12.5 billion, about four times Ticketmaster's actual reported 2025 revenue of $3.1 billion. The error is a population mismatch: the $134 average price describes only the very top 100 touring acts in the world, the most expensive tickets in the entire live-events business. Ticketmaster's other 340-plus million tickets include minor-league sports, comedy clubs, community theater, and local family shows, most priced far below $134, so the blended average fee per ticket across ALL of Ticketmaster's business works out closer to about $9 ($3.1 billion divided by 346 million). This generalizes to any \"headline average\" statistic: a rate measured on a prominent, expensive subsample should never be applied to a much larger, cheaper full population without adjusting for the mismatch." }
];

const GLOSSARIES = {
  warmup: [
    { term: "Percentage point", def: "The plain arithmetic difference between two percentages (10% to 12% is a 2-percentage-point rise), as opposed to a percent (relative) change, which divides that difference by the starting value (a 20% rise)." }
  ],
  intro: [
    { term: "Monopolization (Sherman Act Section 2)", def: "The U.S. federal law violation of willfully holding and maintaining monopoly power in a market through conduct that excludes competitors, rather than through simply building a better product." },
    { term: "Tying (Sherman Act Section 1)", def: "An illegal arrangement in which a company uses its power in one market to force customers to also buy a separate, tied product or service from it in a second market." }
  ],
  background: [
    { term: "Vertical integration", def: "When one company owns multiple stages of the same supply chain, here concert promotion, venue operation, and ticketing, rather than each stage being run by a separate, independent business." },
    { term: "Adjusted Operating Income (AOI)", def: "A company-defined measure of segment-level profit, calculated before certain corporate costs and accounting items are subtracted at the whole-company level." },
    { term: "Consent decree", def: "A court-approved agreement, short of an admission of guilt, in which a company agrees to specific rules or restrictions to resolve a government's legal case against it." }
  ],
  rq1: [
    { term: "Treble damages", def: "A remedy, automatic under U.S. antitrust law once a violation is proven, that multiplies the calculated base damages amount by three." },
    { term: "Clayton Act", def: "A U.S. federal antitrust law that, among other things, allows private parties and states harmed by anticompetitive conduct to sue for treble damages." }
  ],
  rq2: [
    { term: "Tunney Act", def: "A U.S. federal law requiring a court to review a Department of Justice antitrust settlement for fairness to the public before finally approving it." },
    { term: "State attorney general (AG)", def: "A state's top law-enforcement official, who can independently sue companies under that state's own antitrust and consumer-protection laws, separately from federal enforcement." }
  ],
  learning: [
    { term: "Pre-mortem", def: "Imagining in advance that a plan has already failed, and naming the most likely reason, to surface risks before they occur." },
    { term: "Disconfirming evidence", def: "The observation that would count against your own conclusion, as opposed to evidence that supports it." },
    { term: "Falsification", def: "Stating in advance what would have to be observed for your claim to be judged wrong." }
  ]
};

const SOURCES = [
  { name: "U.S. Government Accountability Office, \"Event Ticket Sales: Market Characteristics and Consumer Protection Issues,\" GAO-18-347, published 12 Apr 2018", url: "https://www.gao.gov/products/gao-18-347", supports: "In a nongeneralizable sample of events, primary-market ticketing companies charged total fees averaging 27% of the ticket price and secondary-market companies averaged 31%; fees for the 31 primary-market events reviewed ranged from 13% to 58% of the base ticket price, and some white-label resale sites charged in excess of 40%." },
  { name: "Bernard A. Mantel et al., \"Federal Jury Finds Live Nation and Ticketmaster Act as Monopoly in Antitrust Trial,\" Manatt, Phelps & Phillips LLP client alert, 17 Apr 2026", url: "https://www.manatt.com/insights/newsletters/client-alert/federal-jury-finds-live-nation-and-ticketmaster-act-as-monopoly-in-antitrust-trial", supports: "On 15 Apr 2026 a federal jury in the Southern District of New York found Live Nation and Ticketmaster liable on 13 antitrust issues and made 34 harm-to-competition findings, one per state plaintiff; the jury found a $1.72 overcharge per ticket sold at major concert venues; Ticketmaster controls approximately 80% of primary ticketing services to major concert venues; Live Nation's promotion arm handles approximately 70% of major concert promotion nationally; the jury found unlawful monopolization of primary ticketing, large-amphitheater use, and concert promotion, plus unlawful tying; the case was originally filed in May 2024 by the DOJ and nearly 40 states, and 34 state attorneys general did not join the DOJ's settlement and instead took the case to verdict." },
  { name: "Isabella Gomez Sarmiento, \"Jury finds that Live Nation and Ticketmaster acted as a monopoly,\" NPR, 15 Apr 2026 (updated)", url: "https://www.npr.org/2026/04/15/nx-s1-5786715/live-nation-ticketmaster-antitrust-verdict-monopoly", supports: "33 states and the District of Columbia pursued the case to trial after the DOJ settled; one week into the March 2026 trial, the DOJ and several states reached a $280 million settlement fund and agreed Live Nation would cap fees and give venues more flexibility at certain amphitheaters; National Independent Venue Association head Stephen Parker called the settlement \"not significant enough to call a slap on the wrist\"; Live Nation CEO Michael Rapino testified denying the company engages in anticompetitive practices; Live Nation merged with Ticketmaster in 2010." },
  { name: "Live Nation Entertainment, \"Full Year and Fourth Quarter 2025 Results,\" investor press release, Feb 2026, as reported by Music Business Worldwide, \"Live Nation annual revenues top $25B in 2025, up $2B YoY, with adjusted operating profit of $2.4B\"", url: "https://www.musicbusinessworldwide.com/live-nation-annual-revenues-top-25b-in-2025-up-2b-yoy-with-adjusted-operating-profit-of-2-4b/", supports: "Live Nation's total 2025 revenue was $25.2 billion, up 9% year over year; consolidated Adjusted Operating Income (AOI) was $2.37 billion, up 10% (rounded to $2.4 billion in the press headline); Ticketing segment revenue was $3.1 billion (up 3%) with AOI of $1.13 billion (up 1%, about a 37% margin) on roughly 346 million tickets sold; Concerts segment revenue was $20.9 billion (up 10%) with AOI of $687 million (up 30%, a 3.3% margin); Sponsorship & Advertising revenue was $1.3 billion (up 11%) with AOI of $845 million (up 11%, a 64% margin)." },
  { name: "Krista Brown, \"The Depth of Live Nation's Dominance,\" American Economic Liberties Project, 15 Jun 2023, analyzing Pollstar's 2022 venue data", url: "https://www.economicliberties.us/our-work/the-depth-of-live-nations-dominance/", supports: "Of the top 100 grossing amphitheaters worldwide in 2022, 88 were U.S.-based, and Live Nation operated 56 of them, 64% of the top U.S. amphitheaters; Ticketmaster was the sole ticketing provider for 82% of those 88 domestic amphitheaters and for 78% of the top 68 U.S.-based arenas; touring rose from 82% of artists' income in 2010 to roughly 95% by 2022." },
  { name: "Bob Allen, \"Pollstar 2025 Year End Business Analysis,\" Pollstar News, 23 Dec 2025", url: "https://news.pollstar.com/2025/12/23/year-end-business-analysis-a-return-to-earth-2025-grosses-ticket-sales-drop-averages-increase-beyonce-oasis-coldplay-have-top-tours-venues-stadiums-rock/", supports: "The worldwide average ticket price for the Top 100 Touring Artists rose from $96.17 (2019) to $106.07 (2022) to $135.92 (2024), then eased to $132.62 (2025), down 2.4%; the North America average ticket price for the same artists was $136.45 in 2024 and $134.23 in 2025, down 1.6%." },
  { name: "Torsten Slok, \"Sharp Increase in the Costs of Going to Music Concerts After the Pandemic,\" Apollo Academy (Apollo Global Management), 11 Nov 2023, citing Pollstar", url: "https://www.apolloacademy.com/sharp-increase-in-the-costs-of-going-to-music-concerts-after-the-pandemic/", supports: "The average North American concert ticket price (Top 100 touring artists) rose from about $90 in 2018 to about $120 in 2023, an increase Apollo's chief economist described as sharp relative to prior years." },
  { name: "US Inflation Calculator (CoinNews Media Group), \"Current U.S. Inflation Rates: 2000-2026,\" updated 12 Aug 2026, tabulating U.S. Bureau of Labor Statistics CPI-U data", url: "https://www.usinflationcalculator.com/inflation/current-inflation-rates/", supports: "Annual average inflation rates (CPI-U, not seasonally adjusted) used in this article to compound cumulative price growth: 2019, 1.8%; 2020, 1.2%; 2021, 4.7%; 2022, 8.0%; 2023, 4.1%; 2024, 2.9%; 2025, 2.6%." },
  { name: "Ran Melamed, \"Live Nation (LYV) Stock Drops After Jury Finds Ticketmaster Monopoly, Breakup Risk Looms,\" TipRanks, 16 Apr 2026", url: "https://www.tipranks.com/news/live-nation-lyv-stock-drops-after-jury-finds-ticketmaster-monopoly-breakup-risk-looms", supports: "LYV shares fell 6.3% on 15 Apr 2026 after the jury verdict; Live Nation said it expects total damages to stay below $350 million and had already set aside a $280 million settlement fund; Live Nation carried a Strong Buy consensus from 17 analysts, with an average price target of $189.38 implying about 21.5% upside from the post-verdict price." },
  { name: "Wiltone Asuncion, \"Live Nation Just Climbed to 52-Week Highs With Antitrust Risk Fading. Here's Where LYV Could Go,\" TIKR.com, 29 Jun 2026", url: "https://www.tikr.com/blog/live-nation-just-climbed-to-52-week-highs-with-antitrust-risk-fading-heres-where-lyv-could-go", supports: "Live Nation (LYV) closed at $179.46 on 26 Jun 2026, just below its 52-week high of $180.92, up roughly 18% year-to-date after the company raised its 2026 outlook on strong demand across concerts, ticketing, and sponsorship; the antitrust remedies phase remained unresolved at the time of writing." },
  { name: "Trevor Jennewine, \"The S&P 500 Is Up 9% in 2026. Wall Street Says the Stock Market Will Do This Next.\" The Motley Fool, republished on Yahoo Finance, 24 Jun 2026", url: "https://finance.yahoo.com/markets/stocks/articles/p-500-9-2026-wall-093200956.html", supports: "The S&P 500 was up 9% year-to-date as of 24 Jun 2026, at a level of 7,473, driven by strong corporate earnings growth concentrated in AI-infrastructure-linked technology and communication-services companies." },
  { name: "Joe Berchtold (Live Nation President and Chief Financial Officer), testimony before the U.S. Senate Judiciary Committee, 24 Jan 2023, as reported by CNBC, \"Senators slam Live Nation over Ticketmaster's dominance, botched Taylor Swift on-sale\"", url: "https://www.cnbc.com/2023/01/24/senate-committee-live-nation-ticketmaster-hearing.html", supports: "Berchtold testified that in most cases venues, not Ticketmaster, set service and ticketing fees, that the majority of those fees go to the venue, and that the portion Ticketmaster itself retains has fallen over time even as venues' share has grown." },
  { name: "Thompson Coburn LLP, \"Live Nation and Ticketmaster Found Liable for Antitrust Violations by Federal Jury,\" client alert, 2026", url: "https://www.thompsoncoburn.com/insights/live-nation-and-ticketmaster-found-liable-for-antitrust-violations-by-federal-jury/", supports: "Attorneys for a certified consumer class estimated that the jury's $1.72 per-ticket overcharge applied across roughly 400 million tickets sold at inflated prices, implying about $688 million in base class damages and more than $2 billion after automatic trebling under the Clayton Act; Live Nation's own competing estimate put the trebled figure closer to $450 million; the states' remedy proposal sought divestiture of Ticketmaster, amphitheater sell-offs, limits on exclusive contracts, damages, civil penalties, disgorgement, and restitution." }
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
      <ul>{items.map((g, i) => <li key={"gl-" + i}><strong>{g.term}</strong> &mdash; {g.def}</li>)}</ul>
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
            ? "Correct -- and this reasoning generalizes beyond this article."
            : "Incorrect -- this answer reflects " + (q.options[state.selectedOption].misconception || "a reasoning gap") + "."}</div>
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
              ? "Within tolerance -- the decomposition below confirms the path."
              : "Outside tolerance -- the specific reasoning error is usually skipping one factor in the chain, most often a population mismatch or a scaling step applied to the wrong base."} Signed error: {state.signedErrorPct.toFixed(1)}%.</div>
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

function TicketVsCpiChart() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={TICKET_VS_CPI} margin={{ top: 24, right: 30, left: 4, bottom: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis dataKey="year" tick={{ fontSize: 12 }} interval={0} />
        <YAxis domain={[90, 160]} tick={{ fontSize: 11 }}
          label={{ value: "Index (2018 = 100)", angle: -90, position: "insideLeft", fontSize: 10 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="linear" dataKey="ticketIndex" name="Avg. top-tour ticket price (North America)"
          stroke="#dc2626" strokeWidth={3} dot={{ r: 6 }}>
          <LabelList dataKey="ticketIndex" position="top" fontSize={11} formatter={(v) => v.toFixed(1)} />
        </Line>
        <Line type="linear" dataKey="cpiIndex" name="CPI-U (general inflation)"
          stroke="#2563eb" strokeWidth={3} dot={{ r: 6 }}>
          <LabelList dataKey="cpiIndex" position="bottom" fontSize={11} formatter={(v) => v.toFixed(1)} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}

function RevenueVsProfitMixChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={REVENUE_VS_PROFIT_MIX} layout="vertical" stackOffset="expand"
        margin={{ top: 20, right: 30, left: 10, bottom: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
        <XAxis type="number" tickFormatter={(v) => Math.round(v * 100) + "%"} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="mix" width={190} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v, n) => [Math.round(v * 100) / 100, n]} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="concerts" stackId="mix" name="Concerts" fill="#d1d5db">
          <LabelList dataKey="concerts" position="inside" formatter={() => "Concerts"} fontSize={11} />
        </Bar>
        <Bar dataKey="ticketing" stackId="mix" name="Ticketing" fill="#dc2626">
          <LabelList dataKey="ticketing" position="inside" formatter={() => "Ticketing"} fontSize={11} fill="#fff" />
        </Bar>
        <Bar dataKey="sponsorship" stackId="mix" name="Sponsorship & Advertising" fill="#2563eb">
          <LabelList dataKey="sponsorship" position="inside" formatter={() => "Sponsorship"} fontSize={10} fill="#fff" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function PriceBridgeChart() {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <BarChart data={PRICE_BRIDGE} margin={{ top: 28, right: 16, left: 4, bottom: 70 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-22} textAnchor="end" height={90} />
        <YAxis domain={[0, 190]} tick={{ fontSize: 11 }}
          label={{ value: "$ per ticket", angle: -90, position: "insideLeft", fontSize: 10 }} />
        <Tooltip formatter={(v, n) => (n === "barHeight" ? ["$" + v, "magnitude"] : v)} />
        <ReferenceLine y={134} stroke="#9ca3af" strokeDasharray="4 4" />
        <Bar dataKey="base" stackId="wf" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="barHeight" stackId="wf" isAnimationActive={false}>
          {PRICE_BRIDGE.map((entry, i) => (
            <Cell key={"wf-cell-" + i} fill={entry.kind === "total" ? "#111" : "#dc2626"} />
          ))}
          <LabelList dataKey="shown" position="top" fontSize={11} formatter={(v) => "$" + v} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function MarketShareDotChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={MARKET_SHARE_DOTS} layout="vertical" margin={{ top: 20, right: 40, left: 10, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }}
          label={{ value: "Live Nation's share of the market (%)", position: "insideBottom", offset: -14, fontSize: 10 }} />
        <YAxis type="category" dataKey="market" width={230} tick={{ fontSize: 10.5 }} />
        <Tooltip formatter={(v) => v + "%"} />
        <ReferenceLine x={50} stroke="#9ca3af" strokeDasharray="4 4" />
        <Bar dataKey="share" fill="#e5e7eb" barSize={6} isAnimationActive={false} />
        <Scatter dataKey="share" name="Market share" fill="#dc2626" isAnimationActive={false}>
          <LabelList dataKey="share" position="right" fontSize={11} formatter={(v) => v + "%"} />
        </Scatter>
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function StockVsMarketChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={STOCK_VS_MARKET} margin={{ top: 24, right: 30, left: 4, bottom: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis dataKey="stage" tick={{ fontSize: 11 }} interval={0} />
        <YAxis domain={[95, 118]} tick={{ fontSize: 11 }}
          label={{ value: "Index (Jan 1, 2026 = 100)", angle: -90, position: "insideLeft", fontSize: 10 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="linear" dataKey="lyvIndex" name="Live Nation (LYV)" stroke="#dc2626" strokeWidth={3} dot={{ r: 7 }}>
          <LabelList dataKey="lyvIndex" position="top" fontSize={12} formatter={(v) => v.toFixed(1)} />
        </Line>
        <Line type="linear" dataKey="sp500Index" name="S&P 500" stroke="#2563eb" strokeWidth={3} dot={{ r: 7 }}>
          <LabelList dataKey="sp500Index" position="bottom" fontSize={12} formatter={(v) => v.toFixed(1)} />
        </Line>
      </LineChart>
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
      <p>Before turning to Live Nation and Ticketmaster, put three principles from recent installments of this series to work on unfamiliar problems. None of the three questions below is about concerts, ticketing, or antitrust law. They test whether the reasoning transfers, not whether you remember the earlier articles.</p>
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
      <p>In April 2026, a federal jury found that Live Nation Entertainment and its ticketing arm, Ticketmaster, ran an illegal monopoly over concert ticketing, amphitheater access, and concert promotion in the United States (Manatt, 2026). By late June 2026, just two and a half months later, Live Nation's stock had not just recovered from the verdict; it had climbed further than the broader stock market over the same stretch (TIKR.com, 2026; The Motley Fool/Yahoo Finance, 2026).</p>
      <p>The scale of what the jury found is large by any measure. Ticketmaster controls about 80% of primary ticketing services to major concert venues, Live Nation's promotion arm handles about 70% of major concert promotion nationally, and the company operates or controls the majority of the country's top-grossing amphitheaters (Manatt, 2026; American Economic Liberties Project, 2023). The jury found this dominance was not an accident of being the best available option: it found Live Nation willfully maintained the monopoly through exclusionary conduct and illegally tied its control of amphitheater access to its promotion and ticketing businesses. This was not the government's first attempt to rein the company in. Live Nation and Ticketmaster merged in 2010 under a court-supervised consent decree, a set of court-approved rules meant to prevent exactly this kind of conduct, and in 2020 the U.S. Department of Justice found the company had violated that decree repeatedly for years (NPR, 2026).</p>
      <p>What actually happened after the 2026 verdict diverges sharply from what a simple story, "a jury found an illegal monopoly, so the company will be punished and prices will fall," would predict. The jury's own damages finding priced the proven overcharge at $1.72 per ticket, a figure this note will size against the much larger fee stack fans actually pay. The federal government itself had already settled its version of the same case for a $280 million damages fund, the sale of 13 amphitheaters, and fee caps only at those venues, while 34 state attorneys general refused that deal and pushed the identical underlying facts to the full jury verdict instead (NPR, 2026; Manatt, 2026). And financial markets, the group of people with the most money riding on getting this right, priced Live Nation's stock as though the verdict barely mattered at all.</p>
      <p>This note addresses three questions. First, how large is the fee burden fans actually pay on top of a ticket's face value, and how much of it did the jury's own damages finding attribute to illegal conduct? Second, why did the federal government settle its case for behavioral fixes and a damages fund while 34 state attorneys general pushed the same underlying facts to a full jury verdict, and what does that split strategy reveal about the limits of antitrust enforcement against a vertically integrated platform? Third, if financial markets are betting that no severe structural remedy is coming, what would have to be true for that bet to be wrong, and is the market's shrug actually informed, or just complacent?</p>
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
      <h3>2A. Trajectory: From a Regulated Merger to an Unregulated Habit</h3>
      <p>Live Nation and Ticketmaster merged in 2010 specifically because regulators worried about the combination's market power; the Department of Justice approved the deal only under a consent decree meant to stop the combined company from using its venue and promotion relationships to punish anyone who used a rival ticketing service. That worry proved justified faster than the decree could contain it. By 2019, the DOJ found Live Nation had violated the decree's terms repeatedly for years, and in December 2019 the two sides agreed to an amended, tougher version of the decree, extended through 2025, with an automatic $1 million penalty attached to each future violation (NPR, 2026).</p>
      <p>Fan-facing friction kept surfacing anyway. In November 2022, Ticketmaster's own systems buckled under demand for Taylor Swift's Eras Tour, and by January 2023 the U.S. Senate Judiciary Committee was questioning Live Nation's president under oath about the company's dominance (American Economic Liberties Project, 2023). That hearing produced a data point worth holding onto for later: Live Nation's own president testified that venues, not Ticketmaster, typically set service and ticketing fees, and that Ticketmaster's own retained share of those fees had fallen over time even as fees themselves kept rising (CNBC, 2023). Meanwhile, the price fans actually paid to see a top touring act kept climbing. The chart below tracks the average North American ticket price for the biggest touring artists in the world against the broader Consumer Price Index (CPI-U) over the same years, both rebased to a common starting point.</p>
      <ChartCard chartKey="chart1" title="Chart 1. Average Top-Tour Ticket Price vs. General Inflation, North America, 2018-2025 (Indexed to 100 at 2018)"
        tier="FACT" note="Ticket price: Apollo Academy citing Pollstar (2018, 2023); Pollstar News, 2025 Year End Business Analysis (2024, 2025). CPI-U index is this article's own rebasing of official BLS annual-average rates, tabulated by US Inflation Calculator, 2026; the underlying rate figures are FACT, and the rebasing method is disclosed here."
        interpState={chartInterp.chart1} onInterpSubmit={onInterpSubmit}>
        <TicketVsCpiChart />
      </ChartCard>
      <p>Fourteen months after that Senate hearing, in May 2024, the DOJ and nearly 40 states sued Live Nation, alleging the company unlawfully monopolized concert promotion, ticketing, and venue access to shut out competitors (Manatt, 2026). The suit followed the same broad theory the 2010 consent decree was meant to prevent, only now backed by more than a decade of the exact conduct the decree had tried and largely failed to stop.</p>
      <h3>2B. Structural Transformation: Where the Profit Actually Sits</h3>
      <p>To understand why this fight is worth having for either side, it helps to see how Live Nation's own businesses actually make money. In 2025, the company's Concerts segment, the touring shows themselves, generated $20.9 billion in revenue but only $687 million in segment profit (Adjusted Operating Income, or AOI), a 3.3% margin. Its Ticketing segment, built almost entirely around Ticketmaster, generated $3.1 billion in revenue and $1.13 billion in AOI, a 36% margin. Its Sponsorship & Advertising segment generated $1.3 billion in revenue and $845 million in AOI, a 64% margin, the highest of the three (Music Business Worldwide, 2026). The chart below places each segment's share of total revenue next to its share of total segment profit.</p>
      <ChartCard chartKey="chart2" title="Chart 2. Live Nation's 2025 Revenue Mix vs. Segment-Profit Mix, by Business Line"
        tier="ESTIMATE" note="Underlying dollar figures are FACT (Live Nation Entertainment FY2025 results, as reported by Music Business Worldwide, 2026). Segment AOI figures sum to about $2.66 billion, above the $2.37 billion consolidated AOI Live Nation reported (rounded to $2.4 billion in the press headline), because unallocated corporate costs and eliminations are subtracted only at the consolidated level; shares shown here are computed against the segment-level sum, a modeled comparison, not a single reported statistic."
        interpState={chartInterp.chart2} onInterpSubmit={onInterpSubmit}>
        <RevenueVsProfitMixChart />
      </ChartCard>
      <p>This is the structural gap that makes the rest of this note make sense. Concerts is the business Live Nation is best known for, and it is also the business with the thinnest margin, because the money goes out the door as artist fees, venue costs, staging, and production long before a single ticket sells. Ticketing and Sponsorship are comparatively asset-light layers built on top of an event Concerts already paid to create, and they capture a share of profit far out of proportion to their share of revenue. A jury finding a company's ticketing and promotion arms anticompetitive is, in financial terms, a jury putting the company's most profitable, least capital-intensive lines of business at legal risk, not its biggest or most visible one.</p>
      {BACKGROUND_QUESTIONS.map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <NumericQuestion q={numQ} state={numState[numQ.id]} onSubmit={onNumSubmit} />
      <Glossary items={GLOSSARIES.background} />
    </SectionWrapper>
  );
}

function RQ1Section({ chartInterp, onInterpSubmit, mcState, numState, onMcSubmit, onNumSubmit }) {
  const numQ = NUMERIC_QUESTIONS.find((q) => q.id === "rq1-d");
  return (
    <SectionWrapper id="sec-rq1" title="Section 3. How Big Is the Monopoly the Jury Actually Found?">
      <p>The first research question asks a deceptively simple thing: once a jury calls a company's conduct an illegal monopoly, how large is the harm it actually priced, and how does that compare to the total fees fans pay? The honest answer requires separating two different findings the same jury reached, a structural finding about market dominance across three markets, and a specific dollar figure for one damages theory, because conflating them produces a badly wrong picture in either direction.</p>
      <p>Start with the structural finding. The jury found Live Nation held monopoly power in three separate but linked markets: primary ticketing to major venues, the use of large amphitheaters, and national concert promotion, and that it unlawfully tied its control of amphitheater access to the other two (Manatt, 2026). The chart below places Live Nation's share in each of these three markets side by side.</p>
      <ChartCard chartKey="chart4" title="Chart 3. Live Nation's Share of Three Markets a Federal Jury Found It Illegally Monopolized"
        tier="FACT" note="Primary ticketing (80%) and concert promotion (70%) are FACT from the actual 2026 jury verdict (Manatt, 2026). Large-amphitheater operation (64%) is FACT from an earlier measurement (American Economic Liberties Project, analyzing Pollstar's 2022 venue data, 2023); the three figures span different years, disclosed here rather than presented as one simultaneous measurement."
        interpState={chartInterp.chart4} onInterpSubmit={onInterpSubmit}>
        <MarketShareDotChart />
      </ChartCard>
      {RQ1_QUESTIONS.filter((q) => q.id === "rq1-b").map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <p>Now turn to the specific dollar figure. Separately from its structural findings, the jury calculated that Ticketmaster overcharged customers by $1.72 on each ticket sold at major concert venues over a period of several years (Manatt, 2026). To see how large that figure actually is, it helps to place it inside the full price a fan pays: an average face-value ticket to a top tour, plus the fees layered on top at checkout, plus whatever the venue and promoter add. The bridge below builds that full price step by step.</p>
      <ChartCard chartKey="chart3" title="Chart 4. From Face Value to All-In Price: Where the Jury's Proven Overcharge Sits"
        tier="ESTIMATE" note="Face value ($134, rounded from Pollstar's 2025 North America average) and the $1.72 overcharge (Manatt, 2026) are FACT. The 27% fee rate is FACT from a 2018 GAO study, not a 2025 measurement. The dollar fee amount and the all-in total are ESTIMATE, this article's author applying the 2018 fee rate to the 2025 ticket price, a modeled combination of two FACTs from different years, disclosed here rather than presented as a single reported figure."
        interpState={chartInterp.chart3} onInterpSubmit={onInterpSubmit}>
        <PriceBridgeChart />
      </ChartCard>
      <p>The evidence for taking the $1.72 figure seriously as real, proven harm is that it survived a full jury trial against a well-resourced defendant, on facts the jury had four days to deliberate before returning 13 separate liability findings (Manatt, 2026). This is not a settlement number a company simply agreed to; it is a number a jury calculated from evidence.</p>
      {RQ1_QUESTIONS.filter((q) => q.id === "rq1-c").map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <NumericQuestion q={numQ} state={numState[numQ.id]} onSubmit={onNumSubmit} />
      <p>The evidence against reading the $1.72 figure as the whole story is exactly the smallness this section has just walked through: it is roughly 5% of the estimated fee layer and roughly 1% of the all-in ticket price. A jury can find a market structure illegally monopolized, and can separately calculate one specific, provable damages theory, without that damages theory capturing every dollar of harm the structural finding implies; unproven conduct, harder-to-quantify harms, and simple negotiating leverage the company holds because of its market position are real but do not show up in a per-ticket overcharge figure a jury felt confident enough to put a number on.</p>
      <p>The honest section-level conclusion is that the monopoly the jury found is structurally large, spanning three linked markets with shares between 64% and 80%, while the one damages figure it was willing to price is small relative to the total fee stack. Both things are true at once, and neither cancels the other out.</p>
      <Glossary items={GLOSSARIES.rq1} />
    </SectionWrapper>
  );
}

function RQ2Section({ chartInterp, onInterpSubmit, mcState, numState, onMcSubmit, onNumSubmit }) {
  const numQ = NUMERIC_QUESTIONS_OPEN.find((q) => q.id === "rq2-d");
  return (
    <SectionWrapper id="sec-rq2" title="Section 4. Why Did the Federal Government Settle While 34 States Won at Trial?">
      <p>The second research question challenges an assumption most people bring to antitrust cases: that the government's enforcers, federal and state, are pursuing the same theory of the case and would naturally reach the same conclusion about it. They did not. One week after the March 2026 trial began, the DOJ and some states reached a settlement: Live Nation agreed to sell up to 13 amphitheaters, cap service fees at 15% at those specific venues (down from the historical 27%-to-31% range), open its ticketing platform to rivals there, and contribute to a $280 million damages fund, all without admitting wrongdoing (Spokesman-Review, 2026; NPR, 2026). But 34 state attorneys general declined that deal and, with outside trial counsel, took the identical underlying facts to a jury instead, and won a full monopolization verdict across three markets plus an unlawful-tying finding (Manatt, 2026).</p>
      <p>Revisit the profit-mix chart from the Background section with this settlement's shape in mind.</p>
      {RQ2_QUESTIONS.filter((q) => q.id === "rq2-b").map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <p>The evidence that this settlement was a meaningful concession, not a token gesture, is real: a 15% fee cap is a large cut from the historical 27%-to-31% range, and opening a platform to rival ticketers at even a handful of major amphitheaters is more than Live Nation had ever previously agreed to. The National Independent Venue Association's own head, Stephen Parker, still called it "not significant enough to call a slap on the wrist" (NPR, 2026), and the states that kept fighting clearly agreed the settlement did not go far enough on its own.</p>
      {RQ2_QUESTIONS.filter((q) => q.id === "rq2-c").map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <p>What the settlement's narrow scope leaves unresolved is now a genuinely novel legal problem. The DOJ's settlement still requires its own Tunney Act fairness review by the same judge, Arun Subramanian, who must also decide the remedies flowing from the 34 states' jury verdict on the identical underlying conduct (Manatt, 2026). No prior antitrust case has required a court to reconcile a negotiated federal settlement sitting alongside a jury verdict won by states that specifically rejected that settlement. Consumer-side estimates of what the states' verdict should be worth in damages give a sense of just how far apart the two paths already sit.</p>
      <NumericQuestion q={numQ} state={numState[numQ.id]} onSubmit={onNumSubmit} />
      <p>The section's honest conclusion is that "the government" was never one actor with one strategy here. Federal enforcers and state enforcers, facing the same evidence, made different bets about litigation risk, remedy design, and how much a settlement now is worth relative to a bigger, less certain win later, and by the time the jury returned its verdict, those two bets had produced two different legal outcomes sitting in obvious tension with each other, with no established procedure for reconciling them.</p>
      <Glossary items={GLOSSARIES.rq2} />
    </SectionWrapper>
  );
}

function RQ3Section({ chartInterp, onInterpSubmit, mcState, onMcSubmit }) {
  return (
    <SectionWrapper id="sec-rq3" title="Section 5. Is the Market Right to Shrug?">
      <p>The third research question turns from what regulators and juries decided to what the people with money on the line actually did in response. Live Nation's stock fell 6.3% on the day the verdict came down, 15 Apr 2026 (TipRanks, 2026), a normal, immediate reaction to genuinely bad legal news. What happened next is the more interesting fact: by late June 2026, the stock had climbed to $179.46, just below a 52-week high of $180.92, up about 18% for the year (TIKR.com, 2026), even though that same year included the guilty verdict.</p>
      <p>A rising stock price after bad news is not, by itself, informative; the whole market can rise for reasons that have nothing to do with any one company's legal troubles. The chart below indexes Live Nation's stock against the S&amp;P 500 over the same year, both rebased to 100 at the start of 2026, to isolate whatever is specific to Live Nation from whatever is just the broad market rising.</p>
      <ChartCard chartKey="chart5" title="Chart 5. Live Nation (LYV) vs. the S&P 500, Indexed to 100 at the Start of 2026"
        tier="ESTIMATE" note="Underlying year-to-date percentages are FACT (TIKR.com, 29 Jun 2026, for LYV; The Motley Fool/Yahoo Finance, 24 Jun 2026, for the S&P 500). Both series are rebased to a shared 100-start index by this article's author, a modeled construction from two reported percentages, not a single reported statistic."
        interpState={chartInterp.chart5} onInterpSubmit={onInterpSubmit}>
        <StockVsMarketChart />
      </ChartCard>
      {RQ3_QUESTIONS.filter((q) => q.id === "rq3-b").map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <p>The evidence that the market's shrug is at least somewhat informed, not merely complacent, is that Live Nation kept a Strong Buy consensus from 17 covering analysts in the days immediately after the verdict, with an average price target implying more than 20% upside from the post-verdict price (TipRanks, 2026). By the time the stock reached its late-June high, markets had also absorbed a full quarter of settlement news, trial testimony, and verdict coverage, plus management's own raised 2026 outlook; this was not an under-informed market reacting to a surprise.</p>
      {RQ3_QUESTIONS.filter((q) => q.id === "rq3-c").map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <p>The evidence against fully trusting the market's read is that the remedies phase is, by the law firms tracking the case in real time, an unprecedented situation with no direct precedent to anchor expectations on. A market pricing in the median expected outcome can still be badly wrong if the actual distribution of outcomes is unusually wide, and a case this legally novel, a live jury verdict sitting alongside an unapproved federal settlement on the same facts, is exactly the kind of situation where the range of plausible remedies is wider than normal, not narrower.</p>
      <p>The honest section-level conclusion is that the market is not obviously wrong to treat a full corporate breakup as unlikely, given the settlement precedent and analyst commentary this section has cited, but "unlikely" and "already fully priced in with confidence" are different claims, and the second one is harder to defend given how much of the actual remedy remains undecided.</p>
      <Glossary items={GLOSSARIES.rq3} />
    </SectionWrapper>
  );
}

function LearningSummarySection({ mcState, numState, applyA, setApplyA, applyB, setApplyB, applyEval, onEvaluate, govInsight, setGovInsight, insightRevealed, onRevealInsight }) {
  const allMc = [...WARMUP_QUESTIONS, ...INTRO_QUESTIONS, ...BACKGROUND_QUESTIONS, ...RQ1_QUESTIONS, ...RQ2_QUESTIONS, ...RQ3_QUESTIONS, CONCLUSION_QUESTION];
  const allNumeric = [...NUMERIC_QUESTIONS, ...NUMERIC_QUESTIONS_OPEN];
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
  allNumeric.forEach((q) => {
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
    + allNumeric.filter((q) => numState[q.id] && numState[q.id].submitted && numState[q.id].isCorrect).length;
  const totalScorable = allMc.length + allNumeric.length;

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
            ? "You tend to over-estimate magnitudes; the usual cause is anchoring on a headline number, such as a top-tour ticket price, and applying it to a much larger and cheaper full population."
            : "You tend to under-estimate magnitudes; the usual cause is dropping a factor from the chain, most often a scaling or population-size step."} This reports directional bias only; no pre-reveal certainty rating is captured anywhere in this article.</p>
        )}
      </div>

      <div className="ls-block">
        <h3>Your governing insight</h3>
        <p>You have now seen five charts covering price growth, profit concentration, the fee bridge, market share across three markets, and the stock's reaction. Before this note reveals its own three takeaways, write the single most non-obvious insight you would defend to a skeptical state attorney general who has read only the headline that Live Nation was "found guilty of running an illegal monopoly."</p>
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
        <p>Leave concerts and ticketing behind. GreenCart Grocery Delivery (a fictional regional platform) acquires its only serious local competitor in a mid-size metro area. The company's own measured data before and after the deal looks like this (illustrative dataset built for this exercise, not a reported statistic):</p>
        <table className="snippet-table">
          <thead><tr><th>Period</th><th>GreenCart's share of local delivery orders</th><th>Average delivery fee</th><th>One-star complaint rate</th></tr></thead>
          <tbody>
            <tr><td>Before acquisition</td><td>46%</td><td>$5.20</td><td>3.1%</td></tr>
            <tr><td>12 months after</td><td>81%</td><td>$7.90</td><td>3.4%</td></tr>
            <tr><td>36 months after</td><td>81%</td><td>$6.10</td><td>2.6%</td></tr>
          </tbody>
        </table>
        <p>Write a response with four explicitly labeled parts: (1) a one-sentence so-what thesis about what this pattern means for a local regulator deciding whether to investigate GreenCart; (2) the single load-bearing assumption your thesis depends on; (3) the strongest disconfirming evidence in this exact table that would undermine it; (4) a one-line pre-mortem completing "If this fails within 12 months, the most likely reason is ___."</p>
        <textarea className="apply-textarea" value={applyA} onChange={(e) => setApplyA(e.target.value)} placeholder="Label each of the four parts explicitly..." />
        <h3>Apply It (b): Cross-Link a Prior Principle</h3>
        <p>Name one principle from an earlier article in this series, including the three revisited in the Warm-Up, and explain whether it reinforces or conflicts with today's thesis that a proven monopoly finding and a small proven damages figure can both be true of the same case at once.</p>
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
  "A jury's structural finding (illegal monopoly across three linked markets) and its own damages finding ($1.72 per ticket, about 5% of the estimated fee layer) are two different claims, not one number restated two ways; the small figure does not shrink the structural finding, and the structural finding does not make every dollar of the fee stack illegal by association. Any \"guilty verdict, therefore X% of the price is a monopoly tax\" argument needs to name which of the two claims it is actually resting on.",
  "The federal government and the 34 states suing over the identical underlying conduct made different bets, and reached different outcomes, because settling and litigating are genuinely different strategies with different risk profiles, not two paths to the same predetermined answer; the resulting collision between a pending settlement and a jury verdict is now a real, unprecedented legal problem, not a technicality that resolves itself.",
  "A stock's rise after bad news is only informative once it is measured against a broad-market benchmark over the same window; Live Nation's stock did not merely recover with the market, it outpaced the S&P 500 by about 9 percentage points, which is a real, specific signal about how little probability investors assign to a severe structural remedy, not proof by itself that investors are right."
];

function ConclusionSection({ mcState, onMcSubmit }) {
  return (
    <SectionWrapper id="sec-conclusion" title="Conclusion">
      <p>The central challenge this note has walked through is that "found guilty of an illegal monopoly" and "priced by markets as though little has changed" are not in contradiction; they describe two different, both-true facts about the same case, and the most likely trajectory under partial success, a settlement covering some states and venues while a jury verdict covering others awaits a remedy, is that this specific tension, a live jury verdict sitting alongside an unapproved federal settlement on the same facts, persists for years rather than resolving cleanly, because no prior case has forced a court to reconcile exactly this combination.</p>
      <p>For fans, artists, and independent venues, the practical implication is that the verdict alone changes very little in the near term; the 15% fee cap the DOJ's settlement negotiated applies only at 13 amphitheaters, and the states' broader remedy, which could include a full breakup, will not be decided for months at the earliest. Anyone budgeting around lower fees or easier access to alternative ticketing platforms should watch the remedies-phase filings, not the verdict headline, for the number that will actually matter.</p>
      <p>Institutionally, the deeper implication concerns how antitrust enforcement works when a dominant company sits at the center of a vertically integrated structure spanning several markets at once. A single settlement, even a real one, can address one slice of a company's footprint (13 amphitheaters) while leaving the company's most profitable lines of business (Ticketing, at a 36% margin, and Sponsorship, at 64%) largely untouched; a full jury verdict can establish sweeping structural liability without automatically translating into an equally sweeping remedy, because remedy design is a separate legal question decided later, by a different process, under different standards. Financial markets, watching both tracks in real time, are effectively betting that the remedy will land closer to the settlement's scope than to the states' broader ask, and Live Nation's stock outpacing the S&amp;P 500 since the verdict is the clearest evidence that bet is currently the market's consensus.</p>
      <p>The most important unresolved question is this: when Judge Subramanian finally rules on remedies, will the court treat the states' jury verdict as entitled to a remedy at least as sweeping as what a full trial victory would normally imply, or will the DOJ's earlier settlement effectively set a ceiling on what any court is willing to order, even for the states that specifically rejected that settlement and won a bigger verdict on their own?</p>
      <MultipleChoice q={CONCLUSION_QUESTION} state={mcState[CONCLUSION_QUESTION.id]} onSubmit={onMcSubmit} />
    </SectionWrapper>
  );
}

function SourcesSection() {
  return (
    <SectionWrapper id="sec-sources" title="Sources">
      <p>Every figure in this article is tagged FACT (a measured value from the source named), ESTIMATE (derived by stated arithmetic from FACTs) or ILLUSTRATION (disclosed synthetic teaching data). The Apply It exercise's GreenCart Grocery Delivery table is this article's only ILLUSTRATION data, and it is labeled as such where it appears.</p>
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
  { id: "sec-rq1", label: "Q1: Size of the Monopoly" },
  { id: "sec-rq2", label: "Q2: DOJ vs. the States" },
  { id: "sec-rq3", label: "Q3: Is the Market Right?" },
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
      gaps.push("Weakest part -- thesis: no substantive one-sentence so-what about what the market-share, fee, and complaint-rate shifts mean for a regulator's decision. State the consequence, not the observation.");
    }
    if (!assumptionSeg || assumptionSeg.length < 25) {
      gaps.push("Weakest part -- load-bearing assumption: name the single claim that, if false, breaks your thesis. A thesis with no stated assumption cannot be tested.");
    }
    if (!disconfirmSeg || disconfirmSeg.length < 25) {
      gaps.push("Weakest part -- disconfirming evidence: name the observation in the table that would count against your own conclusion, not further support for it (for example, the complaint rate falling back below its pre-acquisition level by month 36).");
    }
    if (!premortemSeg || premortemSeg.length < 20) {
      gaps.push("Weakest part -- pre-mortem: complete the sentence 'If this fails within 12 months, the most likely reason is ___' with a specific mechanism, not a general risk.");
    }
    const hasNumber = /\d/.test(raw);
    const hasImplicationVerb = /(should|must|need|require|recommend|investigate|open|expand|pull back|audit|monitor)/.test(lower);
    if (raw.length >= 120 && !hasNumber) {
      gaps.push("Climb from observation to implication: your response contains no quantity. A decision-relevant thesis normally carries a magnitude, for example the fee rising 52% while share rose 35 percentage points.");
    }
    if (raw.length >= 120 && !hasImplicationVerb) {
      gaps.push("Climb from observation to implication: your response describes the pattern but does not say what the regulator should do differently as a result.");
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
  const allNumeric = [...NUMERIC_QUESTIONS, ...NUMERIC_QUESTIONS_OPEN];
  const totalScorable = allMc.length + allNumeric.length;
  const answeredCount = allMc.filter((q) => mcState[q.id] && mcState[q.id].submitted).length
    + allNumeric.filter((q) => numState[q.id] && numState[q.id].submitted).length;
  const progress = Math.min(100, Math.round((answeredCount / totalScorable) * 100));
  const score = allMc.filter((q) => mcState[q.id] && mcState[q.id].submitted && mcState[q.id].isCorrect).length
    + allNumeric.filter((q) => numState[q.id] && numState[q.id].submitted && numState[q.id].isCorrect).length;

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
          <div className="kicker">Economic Research &middot; No. 26 &middot; Business &amp; Strategy</div>
          <h1>Found Guilty, Priced Like It Never Happened: The Live Nation Monopoly Verdict</h1>
          <p className="standfirst">A federal jury found Live Nation and Ticketmaster ran an illegal monopoly over concert ticketing, venues, and promotion. Within months, Live Nation's stock had outpaced the broader market.</p>
        </div>
        <WarmUpSection mcState={mcState} onMcSubmit={handleMcSubmit} />
        <IntroSection mcState={mcState} onMcSubmit={handleMcSubmit} />
        <BackgroundSection chartInterp={chartInterp} onInterpSubmit={handleInterpSubmit}
          mcState={mcState} numState={numState} onMcSubmit={handleMcSubmit} onNumSubmit={handleNumSubmit} />
        <RQ1Section chartInterp={chartInterp} onInterpSubmit={handleInterpSubmit}
          mcState={mcState} numState={numState} onMcSubmit={handleMcSubmit} onNumSubmit={handleNumSubmit} />
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
