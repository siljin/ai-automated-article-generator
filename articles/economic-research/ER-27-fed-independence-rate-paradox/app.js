const { useState, useEffect } = React;
const {
  LineChart, Line, BarChart, Bar, ComposedChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LabelList, Cell, ReferenceLine, ReferenceArea
} = Recharts;

/* ============================== DATA ==============================
   All chart-data field names are checked against the Recharts spread trap:
   no field is named `ref`, `key`, or `children` anywhere in this file.
   =================================================================== */

/* Chart 1 -- Slope chart (two-period, three series). The "textbook decoupling" episode:
   Fed funds rate (upper bound), 10-year Treasury yield, and 30-year fixed mortgage rate,
   Sept 19, 2024 (the day after the Fed's first 2024 cut) vs. mid-to-late Nov 2024.
   FACT, all three series: Fed funds upper bound moved 5.00% (post Sept 18, 2024 cut) to
   4.75% (post Nov 7, 2024 cut) per FOMC statements (CBS News, Dec 2024; Forbes Advisor,
   Federal Funds Rate History). 10-year yield: 3.62% 52-week low, Sept 16, 2024
   (TradingEconomics/market data via news search, Sept 2024) to 4.43%, Nov 15, 2024
   (Seeking Alpha, "Treasury Yields Snapshot: November 15, 2024"). 30-year fixed mortgage
   rate: 6.09%, week of Sept 19, 2024, to 6.84%, week of Nov 21, 2024 (Freddie Mac Primary
   Mortgage Market Survey; corroborated by Federal Reserve Bank of Atlanta, "Not Joined at
   the Hip: The Relationship between the Fed Funds Rate and Mortgage Rates," 10 Nov 2025).
   The three dates are close but not identical (Sept 16 vs. Sept 19; Nov 15 vs. Nov 21),
   disclosed here rather than presented as one simultaneous reading. */
const SLOPE_DATA = [
  { stage: "Sept 2024 (day after Fed's first cut)", fedFunds: 5.00, treasury10y: 3.62, mortgage30y: 6.09 },
  { stage: "Nov 2024 (after a second Fed cut)", fedFunds: 4.75, treasury10y: 4.43, mortgage30y: 6.84 }
];

/* Chart 2 -- Waterfall / bridge. Decomposes the 10-year Treasury yield's rise from Sept 16,
   2024 (3.62%) to Sept 2, 2026 (4.82%, rounded from 4.818%, CNBC, 2 Sept 2026) into a
   term-premium component and a residual. Starting and ending yields are FACT. The
   term-premium change (+0.61 percentage points) is FACT, drawn from the NY Fed's own ACM
   term-premium model as aggregated by CEIC/MacroMicro (2026): -0.10% at end-Sept 2024 to
   +0.51% ("0.513%") at end-June 2026 (the most recent reading available at the time of
   writing; a roughly two-month gap versus the Sept 2, 2026 yield reading, disclosed here).
   The residual ("expected rate path & other factors," +0.59 percentage points) is an
   ESTIMATE: this article's author computed it as the total yield change minus the FACT
   term-premium change; it is not a separately reported statistic. */
const YIELD_BRIDGE = [
  { name: "10-yr yield, Sept 16, 2024", base: 0, barHeight: 3.62, shown: 3.62, kind: "total" },
  { name: "+ Term premium (Sept '24-Jun '26)", base: 3.62, barHeight: 0.61, shown: 0.61, kind: "up" },
  { name: "+ Expected rate path & other (est.)", base: 4.23, barHeight: 0.59, shown: 0.59, kind: "up" },
  { name: "10-yr yield, Sept 2, 2026", base: 0, barHeight: 4.82, shown: 4.82, kind: "total" }
];

/* Chart 3 -- Line chart, two series, six dated anchor points. Fed funds rate (upper bound)
   vs. the 10-year Treasury yield, Sept 2024 - Sept 2026, with three independence-related news
   events annotated via ReferenceLine. All values FACT, each independently dated and sourced
   in-line above and in the Sources list: Sept 16, 2024 (10y 3.62%, pre-cut low) / Fed funds
   5.50% (pre-cut, held since Jul 2023); Jan 14, 2025 (10y peak 4.79%) / Fed funds 4.50%
   (after three 2024 cuts); Aug 26, 2025 (10y 4.31%, Cook-firing-attempt peak, CNBC) / Fed
   funds 4.50% (unchanged, pre-Sept-2025 cut); Jan 30, 2026 (10y 4.25%, Warsh nomination day,
   Fortune/AP) / Fed funds 3.75% (after three 2025 cuts); Jun 26, 2026 (10y 4.38%, Advisor
   Perspectives/dshort) / Fed funds 3.75% (unchanged); Sept 2, 2026 (10y 4.82%, CNBC) / Fed
   funds 3.75% (unchanged, current as of writing). */
const FUNDS_VS_YIELD = [
  { stage: "Sep 16 '24", fedFunds: 5.50, treasury10y: 3.62 },
  { stage: "Jan 14 '25", fedFunds: 4.50, treasury10y: 4.79 },
  { stage: "Aug 26 '25", fedFunds: 4.50, treasury10y: 4.31 },
  { stage: "Jan 30 '26", fedFunds: 3.75, treasury10y: 4.25 },
  { stage: "Jun 26 '26", fedFunds: 3.75, treasury10y: 4.38 },
  { stage: "Sep 2 '26", fedFunds: 3.75, treasury10y: 4.82 }
];

/* Chart 4 -- Bullet-style chart. Three long-term borrowing-cost metrics, each shown as its
   Sept 2024 baseline (target/reference marker) against its 2026 level (actual bar). FACT:
   10-year Treasury yield 3.62% (Sept 16, 2024) to 4.82% (Sept 2, 2026, CNBC). 30-year
   Treasury yield 3.94% (52-week low, Sept 16, 2024, market data) to 5.21% (Jul 30, 2026,
   highest since 2007, Axios). 30-year fixed mortgage rate 6.09% (week of Sept 19, 2024,
   Freddie Mac) to 6.71% (week of Sept 3, 2026, Freddie Mac PMMS). The 30-year Treasury peak
   (Jul 2026) and the mortgage/10-year current readings (Sept 2026) are not the identical
   date, disclosed here. */
const BULLET_DATA = [
  { metric: "10-yr Treasury yield", baseline: 3.62, current: 4.82, gapBp: 120 },
  { metric: "30-yr Treasury yield", baseline: 3.94, current: 5.21, gapBp: 127 },
  { metric: "30-yr fixed mortgage rate", baseline: 6.09, current: 6.71, gapBp: 62 }
];

/* Chart 5 -- Dumbbell chart. Peak/starting stress level vs. most recent level, one row per
   case, each in its own natural unit (percent), disclosed per row. Turkey: headline CPI
   inflation 85.5% (Oct 2022 peak, TUIK via multiple outlets) to 31.51% (Aug 2026,
   TradingEconomics/TUIK). Argentina: month-over-month inflation 25.5% (Dec 2023, Milei's
   first full month, compiled from INDEC data by Charlie Bilello) to 2.1% (Jul 2026, Rio
   Times Online, 2026). UK: 30-year gilt yield 5.1% (28 Sept 2022 peak) to 4.34% (17 Oct
   2022, after Chancellor Hunt reversed most of the mini-budget). US: 10-year Treasury yield
   3.62% (16 Sept 2024) to 4.82% (2 Sept 2026, still rising, no reversal). All FACT; sources
   listed in full in the Sources section. */
const CASE_DUMBBELL = [
  { place: "Turkey (headline inflation, %)", before: 85.5, after: 31.5, resolved: true },
  { place: "Argentina (monthly inflation, %)", before: 25.5, after: 2.1, resolved: true },
  { place: "UK (30-yr gilt yield, %)", before: 5.1, after: 4.34, resolved: true },
  { place: "US (10-yr Treasury yield, %)", before: 3.62, after: 4.82, resolved: false }
];

/* ============================== CHART PROMPTS ============================== */

const CHART_PROMPTS = {
  chart1: [
    { kind: "quant", label: "Quantitative reasoning",
      prompt: "The Fed funds rate fell 25 basis points between these two dates while the 10-year Treasury yield rose about 81 basis points and the 30-year mortgage rate rose about 75 basis points. Express the mortgage-rate move as a multiple of the Fed-funds move (ignoring direction), and say what that multiple implies for anyone timing a loan around a single Fed decision.",
      authored: "75 basis points divided by 25 basis points is 3: the mortgage rate moved three times as far as the Fed funds rate did, in the opposite direction. Treating a single Fed rate decision as a reliable signal for where a 30-year mortgage rate is headed gets the relationship backwards in both size and direction over this stretch; a borrower who waited for the Fed's cut before locking in a mortgage rate would have locked in a HIGHER rate two months later, not a lower one. This generalizes to any \"the central bank is cutting, so my long-term borrowing cost will fall too\" assumption: check the actual multiple, not just the direction, of the two moves before acting on it." },
    { kind: "mechanism", label: "Qualitative / mechanism",
      prompt: "Both the 10-year Treasury yield and the 30-year mortgage rate rose over these two months even though the Fed had just cut short-term rates. What is the most likely reason long-term rates are set this way, rather than simply tracking the Fed's own policy rate?",
      authored: "Long-term rates like the 10-year Treasury yield and the 30-year mortgage rate are priced mostly on what investors expect over the next ten to thirty years, growth, inflation, and how much extra compensation (the term premium) they need for the risk of holding a bond that long, not on where the Fed's overnight rate sits today. A single rate cut mostly moves expectations for the next year or two; if investors simultaneously grow more worried about longer-run inflation or federal borrowing, that longer-run worry can outweigh the near-term cut and push long rates up even as the policy rate falls. This generalizes to any policy lever that only directly controls a short-term price: its effect on a long-term price depends on what it does to expectations across the ENTIRE horizon, not just the next period." }
  ],
  chart2: [
    { kind: "quant", label: "Quantitative reasoning (predict the split first)",
      prompt: "Before checking the exact split: of the roughly 120-basis-point total rise in the 10-year yield from September 2024 to September 2026, do you expect MORE than half, or LESS than half, came from the rise in the term premium specifically, as opposed to a shift in the market's expected path of future short-term rates? Then check the bridge above and state the actual split.",
      authored: "The bridge shows the roughly 0.61-percentage-point term-premium increase is just over half of the roughly 1.20-percentage-point total move, with the remaining roughly 0.59 percentage points coming from a rise in the market's own expected future short-rate path (this note's own residual, not a directly reported figure). The close-to-even split matters: investors are not merely charging a bigger \"risk cushion\" for holding long bonds, they are also now expecting the FUTURE path of short-term rates to run higher than they expected in 2024, a comment on where they think policy is actually headed, not just on how much risk they perceive in holding it. This generalizes to any \"yields rose\" headline: a rise built mostly from a bigger risk premium tells a different story than one built mostly from a higher expected policy path, even when the total move looks identical." },
    { kind: "causal", label: "Causal / comparative",
      prompt: "The term premium specifically compensates investors for uncertainty about future inflation, fiscal policy, and central-bank behavior, not for where short-term rates sit today. Why would a rise in THIS specific component, rather than in the expected-rate-path component, be the more direct piece of evidence for the \"eroding independence raises long-term costs\" theory this note is testing?",
      authored: "A rise in the expected-rate-path component could simply mean investors expect a stronger economy or more persistent inflation for ordinary business-cycle reasons, unrelated to who runs the Fed. A rise in the term premium specifically is the part of the yield that directly compensates for uncertainty about HOW policy will be conducted and whether long-run inflation stays anchored, exactly the channel the central-bank-independence theory predicts should move first. Seeing the term-premium component rise by roughly six-tenths of a percentage point over a period packed with independence-related news is closer to a direct test of the theory's own mechanism, not just consistent with the theory in a could-be-anything-macro sense. This generalizes to any theory that names a specific channel: look for the component of the outcome that maps onto that exact channel, rather than treating any co-moving aggregate number as confirmation." }
  ],
  chart3: [
    { kind: "quant", label: "Quantitative reasoning",
      prompt: "Between September 2024 and September 2026, the Fed funds rate (upper bound) fell from 5.50% to 3.75%, a 175-basis-point cut, while the 10-year Treasury yield rose from 3.62% to 4.82%, a 120-basis-point increase. Combine these into a single number describing how far the usual relationship between the two broke down over this period.",
      authored: "Adding the size of the Fed's cut (175 basis points) to the size of the 10-year yield's rise (120 basis points) gives a combined break of about 295 basis points from the textbook relationship, in which a falling policy rate is associated with a falling, not rising, long-term yield. Based on the 100-for-100 historical record discussed in the Background section, a \"normal\" cutting cycle of this size would have predicted the 10-year yield falling by some amount, not rising by 120 basis points; the combined 295-basis-point gap is a rough way to size just how unusual this specific two-year stretch has been. This generalizes to any \"X moved this much while Y, which usually moves the other way, moved that much\" situation: adding the two magnitudes together gives a single number for the size of the anomaly, easier to compare across episodes than reporting the two moves separately." },
    { kind: "mechanism", label: "Qualitative / mechanism",
      prompt: "The 10-year yield did not rise in a straight line; it spiked after the September 2024 cut, eased somewhat through 2025, then rose again heading into 2026. What does this uneven, stop-and-go pattern suggest about how markets were actually processing the string of Fed-independence news over these two years?",
      authored: "A single, one-time jump would suggest investors reacted fully to one big piece of news and then stopped updating. The actual stop-and-go pattern, easing for a period in 2025 as the Fed kept cutting on schedule without further controversy, then rising again around the chair-succession news and the new chair's own ambiguous messaging in 2026, suggests markets were continuously reassessing Fed credibility as new evidence arrived: rewarding periods of unremarkable, rules-based policy with lower long-term yields, and penalizing periods of open political conflict or ambiguous communication with higher ones. This generalizes to any slow-moving credibility question: expect the market's price to move in steps tied to specific new information, not as one permanent repricing at the first sign of trouble." }
  ],
  chart4: [
    { kind: "quant", label: "Quantitative reasoning",
      prompt: "The 10-year Treasury yield's gap from its September 2024 baseline is about 120 basis points, the 30-year Treasury yield's gap is about 127 basis points, and the 30-year mortgage rate's gap is about 62 basis points. Express the mortgage rate's gap as a percentage of the average of the two Treasury gaps, and say what that share implies about how much of the Treasury market's stress has reached ordinary homebuyers so far.",
      authored: "The average of the two Treasury gaps is about 123.5 basis points; 62 divided by 123.5 is about 50%. Only about half of the Treasury market's move has shown up in what a typical homebuyer's mortgage quote reflects so far, because part of the Treasury yield's rise has been absorbed by a narrowing mortgage-Treasury spread rather than passed through in full. That is a real, partial cushion for borrowers today, but it is a cushion built from a spread that was unusually wide in 2024 and has room to keep narrowing, not a permanent shield against further Treasury-market moves. This generalizes to any \"the underlying market moved by X, but the consumer-facing price only moved by Y\" pattern: check whether Y-versus-X is a stable ratio or reflects a temporary, narrowing spread that could close further or snap back." },
    { kind: "sowhat", label: "So-what / decision implication",
      prompt: "If you advised a first-time homebuyer trying to decide whether to lock in a mortgage rate now or wait for rates to fall, what is the single most important thing this chart should make you tell them, beyond simply \"rates might change\"?",
      authored: "Tell them that the direction they are hoping for, mortgage rates falling because the Fed is cutting, has already failed to materialize for two straight years in this cycle, and that the mortgage-Treasury spread has partly cushioned them from an even larger increase, a cushion that is not guaranteed to persist or widen further. Waiting is a bet that both the long end of the Treasury market reverses AND the spread does not un-cushion them at the same time, a compound bet with a real, evidenced chance of going the wrong way twice, not once. This generalizes to any \"wait for the market to move my way\" decision: name every separate condition that has to hold for waiting to pay off, not just the headline one." }
  ],
  chart5: [
    { kind: "quant", label: "Quantitative reasoning (predict the ranking first)",
      prompt: "Turkey's headline inflation fell about 54 percentage points from its peak (85.5% to 31.5%), Argentina's monthly inflation fell about 23.4 percentage points from its starting point (25.5% to 2.1%), and the UK's 30-year gilt yield fell about 76 basis points from its peak within three weeks (5.1% to 4.34%). Rank these three cases by how COMPLETE their recovery looks, expressed as a percentage of the total move reversed, and say what that ranking implies about the trade-off between speed and completeness.",
      authored: "As a share of each case's own peak, the UK reversed about half of its spike (76 of roughly 150 basis points) fastest, within three weeks; Argentina reversed the largest relative share of all (23.4 of 25.5 percentage points, about 92%) but took roughly two and a half years and a severe recession; Turkey reversed about 63% of its peak (54 of 85.5 percentage points) over roughly four years and still sits far above a normal inflation target. The trade-off this ranking implies is that the fastest resolution (the UK) came from reversing a single, discrete decision, while the larger corrections (Turkey, Argentina) both required sustained institutional or policy change lasting years, suggesting the SIZE of the required correction, not just the willingness to correct, determines how long a resolution takes. This generalizes to any \"how fast will this crisis resolve\" question: check whether the fix is a single reversible decision or a sustained institutional change, since those two categories resolve on very different timescales." },
    { kind: "causal", label: "Causal / comparative",
      prompt: "The U.S. 10-year Treasury yield is the only one of these four series still moving in the \"wrong\" direction, with no reversal yet visible. Name one specific, concrete action that, if it happened, would most likely start to reverse it, based on what ended the other three cases.",
      authored: "Based on what ended the other three cases, the common ingredient was a costly, credible, and sustained policy action that visibly prioritized fighting inflation over short-term political convenience: Turkey's central bank raised its policy rate from 8.5% to 50% and held it there for over a year; Argentina froze money-printing for the Treasury and ran a severe fiscal squeeze for more than two years; the UK's government reversed its own budget within weeks. The U.S. equivalent would be the Federal Reserve under Chair Warsh delivering a clear, sustained tightening action, not just hawkish words at a press conference, and holding to it under continued political pressure, precisely the test the September 2026 meeting and the months following it will provide. This generalizes to any credibility-repair question: look for the specific, costly, and sustained action that would have to occur, not just a change in tone or a single statement." }
  ]
};

/* ============================== QUESTIONS ============================== */

const WARMUP_QUESTIONS = [
  { id: "wu1", type: "B", principle: "A single stock's move is only informative once it is netted against a broad benchmark over the same window; co-movement with the market is not, by itself, evidence about what investors believe regarding one specific piece of news.",
    transfer: "Where this generalizes: before crediting or blaming any single piece of news for a stock's move, isolate the company-specific residual by netting against a relevant benchmark over the same window.",
    prompt: "A mid-cap biotech's shares fell 4% on the day the FDA rejected its lead drug application. That same day, the Nasdaq Biotech Index, a broad basket of similar companies, fell 6%. A junior analyst writes that \"investors clearly shrugged off the rejection, since the stock only fell 4%.\" Using the principle that a single stock's move must be netted against a broad benchmark before crediting or blaming one event, is the analyst's conclusion sound?",
    options: [
      { text: "No, but only because single-day stock moves are always too noisy to interpret, so no conclusion of any kind can be drawn from one day's price action regardless of any benchmark.", correct: false, misconception: "overcorrecting into dismissing all single-day price signals, when netting against a sector benchmark is precisely the technique that makes a single day's move interpretable" },
      { text: "Yes, since both the stock and the index fell together, they were both responding to the same underlying cause, so the comparison confirms the rejection had a company-wide, not stock-specific, effect.", correct: false, misconception: "treating co-movement as proof of a single shared cause and then drawing the opposite conclusion the netting exercise is designed to prevent, rather than isolating the company-specific residual" },
      { text: "No, netted against the benchmark, the stock actually rose about 2 percentage points relative to its peers that day (a 4% fall against a 6% peer-group fall), the opposite of \"shrugging off\" in absolute terms; it suggests investors saw the rejection as somewhat less damaging than what was hitting biotech stocks generally, not that the rejection itself was minor.", correct: true },
      { text: "Yes, a 4% decline is a mild reaction to a drug rejection, so the analyst is right that investors shrugged it off.", correct: false, misconception: "reading the raw, un-netted stock move in isolation and ignoring the broad-market move that happened the same day, the exact substitution the netting principle warns against" }
    ] },
  { id: "wu2", type: "B", principle: "A mechanism that creates a genuine benefit and the matching risk can be one and the same underlying position, not two separate things; a reform that only improves how visible a risk is does not, by itself, reduce the quantity of that risk.",
    transfer: "Where this generalizes: any \"we improved disclosure/transparency\" reform should be checked against whether it changed the underlying quantity of risk, or only how easily that risk can now be seen.",
    prompt: "Mid-State Community Bank (fictional) uses interest-rate swaps to offer local businesses long-term fixed-rate loans while funding itself with short-term deposits; the swaps are also the source of the bank's biggest single risk exposure if rates move sharply. A regulator proposes requiring banks to publish clearer quarterly disclosure of their swap positions. Which statement best applies the principle that a benefit-creating mechanism and a risk-creating mechanism can be the same underlying cause?",
    options: [
      { text: "The disclosure rule will eliminate the risk, because once regulators and the public can see the swap positions clearly, the bank will be forced to unwind them.", correct: false, misconception: "conflating a visibility/disclosure reform with a reform that actually reduces the quantity of the underlying risk, when disclosure only makes an existing risk easier to see, not smaller" },
      { text: "The swaps are not two separate things, a \"good\" fixed-rate-lending mechanism and a \"bad\" risk mechanism; they are one and the same position, so a disclosure rule that only improves how visible that position is does not shrink it, and the bank's underlying rate exposure remains exactly as large as before the rule.", correct: true },
      { text: "Since the bank's fixed-rate lending helps local businesses, the swap-driven risk must be smaller than it appears, because a mechanism that produces a clear public benefit cannot simultaneously be a source of serious risk.", correct: false, misconception: "assuming a benefit and a risk cannot share the same underlying cause, when the same position routinely produces both at once" },
      { text: "The proposed disclosure rule is pointless and should be scrapped entirely, since it does nothing to reduce the bank's swap-driven risk exposure.", correct: false, misconception: "overcorrecting into dismissing a visibility reform's real, separate value (letting regulators and counterparties price and monitor the risk) just because it does not by itself shrink the risk's quantity" }
    ] },
  { id: "wu3", type: "B", principle: "Before assuming that removing a \"competing\" input will free up capacity for the remaining users, check whether the two inputs actually behave as substitutes or as complements; if they are complements, removing one can shift new, uncompensated work onto the other rather than freeing it up.",
    transfer: "Where this generalizes: any \"cutting X should help Y, since they were competing for the same resource\" plan should first verify that X and Y are actually substitutes, not complements performing different, connected tasks.",
    prompt: "Northfield Manufacturing (fictional) re-shores a component it had outsourced overseas, assuming this will free up capacity and raise pay for its remaining domestic assembly-line workers, since the overseas supplier was \"competing\" for the same production budget. Eighteen months later, domestic assembly-line hours have fallen, not risen, because the re-shored component now requires domestic workers to spend time on manual quality-inspection steps the overseas supplier used to handle internally, pulling time away from assembly. What does this outcome most likely indicate?",
    options: [
      { text: "The overseas supplier and the domestic assembly workers were behaving as complements, not substitutes: the supplier's quality-inspection work supported domestic assembly rather than competing with it for the same budget, so removing that \"competing\" input actually shifted new, uncompensated work onto the domestic workers, cutting the assembly hours the plan assumed would grow.", correct: true },
      { text: "The overseas supplier and the domestic assembly workers were substitutes competing for the same budget, so re-shoring should have helped as predicted, and the fall in hours must be an unrelated, temporary blip.", correct: false, misconception: "clinging to the original substitutes assumption despite the described outcome, treating clear disconfirming evidence as noise rather than revising the model" },
      { text: "Re-shoring never helps domestic workers under any circumstances, so the company should reverse course and outsource the component again.", correct: false, misconception: "overgeneralizing one case's outcome into a universal rule about re-shoring, rather than diagnosing the specific mechanism described in this scenario" },
      { text: "The fall in hours proves the company's domestic workforce is simply less productive than the overseas supplier was, unrelated to how the two inputs were connected.", correct: false, misconception: "substituting a general productivity judgment for the specific complements-versus-substitutes mechanism the scenario actually describes" }
    ] }
];

const INTRO_QUESTIONS = [
  { id: "intro-c", type: "C", cardClass: "case-card",
    principle: "Long-term borrowing rates are priced off expectations over the entire horizon of the loan, not off today's short-term policy rate, so a falling policy rate does not guarantee a falling long-term rate within any particular window.",
    transfer: "Where this generalizes: any \"the central bank is cutting, so my long-term financing cost will fall soon\" plan should be checked against the documented cases where the two moved in opposite directions.",
    prompt: "Meridian Community Bank (fictional) is deciding whether to lock in a fixed 15-year interest rate today for a large municipal infrastructure loan, betting that the Federal Reserve's continued short-term rate cuts will soon pull long-term borrowing costs down too, or whether to wait for a lower long-term rate before locking in. Given what this introduction has established about the 2024-2026 period, what should Meridian's rate desk weigh most heavily before waiting?",
    options: [
      { text: "Waiting is free, since long-term rates and short-term rates always move together within a few months of each other, so any near-term Fed cut will soon show up in the 15-year rate.", correct: false, misconception: "assuming short and long rates are mechanically linked on a short lag, ignoring the very decoupling this introduction just described" },
      { text: "The Fed's rate decisions are irrelevant to long-term municipal borrowing costs, so Meridian should ignore Fed policy entirely when timing this loan.", correct: false, misconception: "overcorrecting into treating short-term policy as wholly irrelevant to the long end, when the Fed's credibility and expected future path still matter, just not mechanically or immediately" },
      { text: "Since the 10-year Treasury yield is a government rate, it has no bearing on what a community bank pays to fund a municipal loan, so Meridian's rate desk should look only at the current fed funds rate.", correct: false, misconception: "ignoring that long-term bank and municipal lending rates are priced off Treasury yields plus a spread, not off the short-term policy rate directly" },
      { text: "Waiting carries a real risk that is easy to underweight: over 2024-2026, long-term Treasury yields and mortgage rates have at times risen even as the Fed cut its short-term rate, so \"the Fed is cutting\" is not, by itself, a reliable signal that the specific 15-year rate Meridian would lock in later will be lower than today's; the rate desk should weigh the current rate against this documented decoupling risk, not against an assumed mechanical pass-through.", correct: true }
    ] }
];

const BACKGROUND_QUESTIONS = [
  { id: "bg-b", type: "B", tiedChart: "the slope chart above",
    principle: "A historical base rate, however strong, describes what happened under the conditions that produced it; when a new factor becomes large enough to dominate pricing, the historical relationship can break, and the break itself is evidence the new factor is now doing real work.",
    transfer: "Where this generalizes: any \"this pattern has held 100% of the time before\" claim should be checked for whether the conditions that produced the pattern still hold, before assuming the pattern must reassert itself.",
    prompt: "In the seven Fed rate-cutting cycles before this one, going back to the 1980s, the 10-year Treasury yield was lower, not higher, 100 out of 100 times measured 100 days after the first cut (J.P. Morgan Private Bank, 2025). In the cycle the slope chart above covers, the 10-year yield rose about 81 basis points in just two months after the Fed's first cut. What does this break from a 100-for-100 historical base rate most likely indicate?",
    options: [
      { text: "The 10-year yield's rise must be a temporary data error, since a pattern that held in 100 out of 100 prior instances is certain to reassert itself within the next few months.", correct: false, misconception: "treating a strong historical base rate as a law that must mechanically reassert itself, rather than as a description of a mechanism that can be overridden by a new dominant factor" },
      { text: "A 100-for-100 historical pattern describes what happened under the conditions of the past seven cycles, not a law that always holds; when a new factor, such as concern about future deficits, inflation, or Fed credibility, becomes large enough to dominate investors' pricing of long-term bonds, the historical relationship can break, and the break itself is evidence that this new factor is now doing more work than it used to.", correct: true },
      { text: "Since financial markets are inherently unpredictable, no historical base rate for bond yields is ever meaningful, so the 100-for-100 record cited here should be disregarded entirely.", correct: false, misconception: "overcorrecting into dismissing a well-documented historical regularity as meaningless, when the interesting question is specifically why THIS cycle broke from it, not whether history ever applies" },
      { text: "This shows the Federal Reserve's interest-rate decisions have no real effect on long-term borrowing costs, so the FOMC's cuts were pointless.", correct: false, misconception: "overgeneralizing one broken historical pattern into a claim that the Fed's actions never affect long-term rates, when the more precise claim is that the relationship is not fixed and depends on what else is happening at the same time" }
    ] }
];

const RQ1_QUESTIONS = [
  { id: "rq1-b", type: "B", tiedChart: "the line chart above",
    principle: "A specific, sequential mechanism linking cause to effect is closer to causal evidence than a cross-country correlation, which can partly reflect a shared confounder producing both variables at once without either one causing the other.",
    transfer: "Where this generalizes: before treating any cross-country or cross-firm correlation as proof of a specific causal channel, check for a shared background factor that could independently produce both sides of the correlation.",
    prompt: "A classic 1993 study found a near-perfect negative correlation between how independent a country's central bank was, by law, and how much inflation that country experienced, but only among advanced economies from 1955 to 1988; the relationship was much weaker and less consistent once developing countries were included (Alesina & Summers, 1993, discussed in St. Louis Fed and SUERF summaries). Turkey's 2021 episode, where the president fired the central bank governor and inflation eventually peaked at 85.5% (TUIK/TradingEconomics), shows a specific, traceable mechanism: governor fired, then rates cut, then the currency fell, then imported goods got more expensive. Why does the cross-country correlation need a different kind of scrutiny than the Turkey case does, before either is used to argue that eroding Fed independence will raise U.S. inflation or borrowing costs?",
    options: [
      { text: "Turkey's sequence names a specific, step-by-step mechanism, closer to a traceable causal chain; the cross-country correlation, by contrast, could partly reflect a confounder, such as a country's overall institutional quality or rule of law, that independently produces both a more independent central bank and lower inflation, consistent with the relationship weakening once developing countries, where that confounder varies more, are included.", correct: true },
      { text: "Both the Turkey case and the cross-country correlation are equally strong evidence of causation, since a correlation this close to perfect for advanced economies already rules out confounding by definition.", correct: false, misconception: "assuming a strong correlation coefficient, however close to perfect, can rule out confounding on its own, without independently identifying and ruling out the specific confounding variable" },
      { text: "The Turkey case is weaker evidence than the cross-country correlation, since a single country's experience can never be generalized, while a correlation across many countries automatically accounts for confounding factors by averaging over them.", correct: false, misconception: "assuming that averaging across many countries in a cross-sectional correlation automatically removes confounding, when a shared confounder can move together with the variable of interest across the whole sample, not just within one country" },
      { text: "Neither piece of evidence is usable, since Turkey is not the United States and the 1955-1988 period is too old to say anything about 2026.", correct: false, misconception: "dismissing both a mechanism case and a historical correlation as categorically inapplicable, rather than weighing what each actually supports and does not support, given their genuinely different structures as evidence" }
    ] },
  { id: "rq1-c", type: "C", cardClass: "case-card",
    principle: "The direction of a leadership-change effect on long-term yields depends on whether markets read the specific appointment as reinforcing or undermining inflation-fighting credibility, not on leadership change as a generic event.",
    transfer: "Where this generalizes: any \"X always causes Y\" rule built from a small set of dramatic cases should be checked against cases where the same category of event produced the opposite outcome.",
    prompt: "Silverleaf Advisors (fictional, an institutional bond desk) wants to bet that any country's central-bank leadership change will raise that country's long-term bond yields, using the Turkey case and the U.S. 2025-2026 pattern as its playbook. What is the strongest reason Silverleaf's blanket rule is likely to fail in some cases?",
    options: [
      { text: "Central bank leadership changes are always fully priced in by markets before they happen, so no leadership change can ever move long-term yields.", correct: false, misconception: "asserting an absolute, universal efficiency claim not supported by the article's own evidence of real yield moves around leadership news" },
      { text: "Long-term bond yields are set entirely by a country's growth rate, so central bank leadership is irrelevant to yields in any country.", correct: false, misconception: "replacing the article's actual multi-factor account of long-term yields with a single-factor claim the article does not support" },
      { text: "A leadership change only raises long-term yields when investors specifically doubt the new leadership's commitment to controlling inflation; a leadership change perceived as reinforcing that commitment, an orthodox, credible appointment, the kind Turkey eventually made in 2023, can just as easily calm long-term yields instead, so the direction depends on the market's read of the specific appointment, not on leadership change as a generic event.", correct: true },
      { text: "Every emerging-market central bank behaves identically to Turkey's, so Silverleaf's rule will work in any developing country but not in any advanced economy.", correct: false, misconception: "substituting a crude developed-versus-developing-market generalization for the article's actual mechanism, which turns on perceived commitment to fighting inflation, not on a country's development status alone" }
    ] }
];

const RQ2_QUESTIONS = [
  { id: "rq2-b", type: "B", tiedChart: "the bullet chart above",
    principle: "The spread between two related rates is not fixed; it can widen or narrow over time for its own reasons, so two series priced off the same underlying benchmark can still move by different amounts over the same window.",
    transfer: "Where this generalizes: any \"rate A moved by X, so rate B, which is based on A, should have moved by the same amount\" assumption should be checked against the spread between them, which can itself change.",
    prompt: "The bullet chart above shows the 10-year Treasury yield rose about 120 basis points, the 30-year Treasury yield rose about 127 basis points, and the 30-year fixed mortgage rate rose about 62 basis points, all measured from roughly the same September 2024 baseline. Why would the mortgage rate's rise plausibly land at roughly half the size of the two Treasury yields' rise, rather than matching them closely?",
    options: [
      { text: "Mortgage rates are set entirely independently of Treasury yields, so there is no reason to expect their moves to be related in size at all.", correct: false, misconception: "ignoring that 30-year mortgage rates are conventionally priced as a spread over Treasury yields, so some co-movement is expected by construction" },
      { text: "The mortgage-rate figure must be a reporting error, since a rate this important should move by the same amount as the Treasury yields it is based on.", correct: false, misconception: "assuming a fixed, mechanical one-to-one relationship between Treasury yields and mortgage rates, when the spread between them can itself widen or narrow over time" },
      { text: "Homebuyers are less sensitive to interest rates than bond investors, so lenders deliberately hold mortgage rates down regardless of their own funding costs.", correct: false, misconception: "substituting a demand-side story about borrower sensitivity for the supply-side, spread-based pricing mechanism that actually connects mortgage rates to Treasury yields" },
      { text: "The mortgage-Treasury spread, the extra amount lenders charge over the 10-year Treasury yield to cover prepayment risk and their own funding costs, was unusually wide in September 2024 and has partly normalized since, so part of the Treasury yield's rise was absorbed by a narrowing spread rather than passed through in full to the mortgage rate.", correct: true }
    ] },
  { id: "rq2-c", type: "C", cardClass: "case-card",
    principle: "The size and timing of a market reaction, not just whether an event is a personnel change or a communication event, reveals what markets are actually pricing; the sharpest reaction points to the true channel worth watching next.",
    transfer: "Where this generalizes: when deciding what to monitor ahead of an uncertain outcome, weight the channel that produced the sharpest historical reaction, not the channel that seems most dramatic on its face.",
    prompt: "Fictional pension-fund CIO Delacroix Capital Partners is deciding whether to extend the average maturity of its Treasury bond holdings, betting that today's elevated long-term yields are close to a peak. Given everything this section has shown about the 2025-2026 event sequence, mild reactions to Governor Cook's firing attempt and the Warsh nomination, but a sharp reaction to Warsh's own vague press conference, what is the single most important factor Delacroix should weigh before making that bet?",
    options: [
      { text: "The sharpest market reaction in this whole sequence came not from a personnel event itself, but from the new chair's own words about how he would act; this suggests long-term yields are responding less to who holds the job and more to whether that person visibly commits to fighting inflation, so Delacroix's bet depends on reading the Fed's forward communication and its September 2026 decision, not simply on how much time has passed since the personnel news.", correct: true },
      { text: "Since the Cook firing attempt and the Warsh nomination both produced only modest yield moves, the credibility story this section describes must not be real, and yields are probably close to a random peak regardless of what the Fed says next.", correct: false, misconception: "averaging away the one sharp reaction (the press conference) by focusing only on the two milder events, rather than weighing all three data points together" },
      { text: "Long-term yields always mean-revert within about a year of any local peak, so Delacroix can safely extend duration now regardless of what the Fed does next.", correct: false, misconception: "asserting an unsupported, mechanical mean-reversion rule not established anywhere in this section's evidence" },
      { text: "Because the Fed does not control the 10-year yield directly, nothing the new chair says at a press conference can meaningfully move it, so Delacroix should ignore the Fed's communication entirely and focus only on GDP growth data.", correct: false, misconception: "ignoring the specific, sourced evidence in this section that the chair's own words produced the sharpest single-day yield move of the entire period" }
    ] }
];

const RQ3_QUESTIONS = [
  { id: "rq3-b", type: "B", tiedChart: "the dumbbell chart above",
    principle: "In each resolved case, a specific, costly, and sustained policy correction preceded the improvement; resolution followed action, not the passage of time or a change in tone alone.",
    transfer: "Where this generalizes: before assuming any strained situation will resolve itself, or resolve merely because leadership talks about fixing it, check whether a comparably costly and sustained corrective action has actually occurred.",
    prompt: "The dumbbell chart above shows Turkey's headline inflation falling from an 85.5% peak to about 31.5%, Argentina's monthly inflation falling from 25.5% to about 2.1%, the UK's 30-year gilt yield falling from a 5.1% peak back to 4.34% within three weeks, while the U.S. 10-year Treasury yield has only risen further, from 3.62% to 4.82%, with no reversal yet. What does this pattern across four cases most likely indicate about what actually ends this kind of credibility spiral?",
    options: [
      { text: "Every country eventually returns to its starting point automatically, so the U.S. yield will fall back to 3.62% on its own within a similar few years, regardless of what policymakers do.", correct: false, misconception: "assuming automatic mean reversion across all four cases, when Turkey and Argentina's declines followed specific, costly policy reversals, not the mere passage of time" },
      { text: "Since three of the four cases show improvement, credibility spirals are rare and typically resolve themselves without any policy change.", correct: false, misconception: "treating the three resolved cases as evidence that resolution is passive or automatic, when each involved an active, costly, and specific policy correction" },
      { text: "In each of the three cases that improved, a specific, costly, and credible policy correction came first, a sharp and sustained rate hike in Turkey, a fiscal and money-supply freeze in Argentina, a reversed and abandoned budget in the UK, and the decline followed that correction, often quickly, as in the UK, within three weeks; the U.S. case has not yet featured an equivalently clear, costly correction, consistent with why it remains the one case still trending the wrong way.", correct: true },
      { text: "The U.S. situation is fundamentally different from the other three because the U.S. dollar is the world's reserve currency, so none of the other three cases has any relevance to what might resolve the U.S. pattern.", correct: false, misconception: "using a real structural difference to dismiss the comparison entirely, rather than asking what general mechanism, a costly and credible correction preceding resolution, might still transfer even if the specific policy tool differs" }
    ] },
  { id: "rq3-c", type: "C", cardClass: "case-card",
    principle: "A recovery thesis that rests on a single announcement, rather than on the kind of sustained, costly action every comparison case actually required, is resting on its weakest, least-supported assumption.",
    transfer: "Where this generalizes: before accepting that a single decision or statement will resolve a credibility problem, check whether every comparable historical resolution actually required sustained action instead.",
    prompt: "Fictional advisory client Northgate Treasury Solutions is preparing a memo arguing that \"the Federal Reserve's September 2026 meeting will resolve the U.S. credibility problem the same way Turkey's and the UK's corrections did, once the Fed makes its intentions clear.\" Which assumption must hold for that specific claim to be true, and what evidence in this note is thinnest in supporting it?",
    options: [
      { text: "The assumption that must hold is that the Fed's chair will resign, mirroring the removal of Turkey's central bank governor; the evidence for this is thinnest because no note in this article suggests Chair Warsh is expected to resign.", correct: false, misconception: "substituting an unrelated personnel-change assumption for the actual mechanism, a costly, credible policy correction, the comparison depends on" },
      { text: "The assumption that must hold is that a single meeting's communication can substitute for the kind of costly, sustained action that resolved the other three cases, a rate hike sustained for over a year in Turkey, a multi-year fiscal freeze in Argentina, a reversed budget in the UK; the evidence for this is thinnest, because nothing in this note shows a single press conference or meeting decision, on its own, has ever been sufficient to reverse a credibility spiral in the comparison cases, each of which required sustained action lasting months to years, not a single announcement.", correct: true },
      { text: "The assumption that must hold is that the U.S. dollar will be replaced as the world's reserve currency, and the evidence for this is thinnest because no note in this article discusses reserve-currency status.", correct: false, misconception: "introducing an assumption the claim itself does not actually depend on" },
      { text: "The assumption that must hold is that inflation will fall to exactly 2% by the September meeting, and the evidence for this is thinnest because the most recent core PCE reading was 3.3%.", correct: false, misconception: "setting an arbitrarily precise and unnecessary numeric bar that the claim about \"resolving the credibility problem\" does not actually require" }
    ] }
];

const CONCLUSION_QUESTION = { id: "concl-e", type: "E", tiedChart: null,
  principle: "A recommendation made under genuine, unresolved uncertainty should size its position to the uncertainty itself and name in advance the specific, observable action, not just any future data point, that would prove it wrong.",
  transfer: "Where this generalizes: any investment or policy position taken while a credibility question is still open should be sized to the range of outcomes, with a falsification trigger defined by a concrete action, not by an arbitrary or unfalsifiable future event.",
  prompt: "An institutional bond investor, having read this note, is deciding how to position for the Federal Reserve's September 16, 2026 meeting, its first major test of whether Chair Warsh's Fed will defend its inflation-fighting credibility with action rather than words. Given that a single press conference already produced the sharpest yield move in this entire two-year period, that the historical relationship between Fed cuts and long-term yields has already broken once in this cycle, and that no U.S. policy correction of the scale seen in Turkey, Argentina, or the UK has yet occurred, which decision is most directly supported by this note, and what single observation would most threaten (falsify) that decision's underlying thesis?",
  options: [
    { text: "Bet heavily that the Fed will cut rates at the September meeting to please the administration, since Chair Warsh was nominated specifically for his openness to lower rates; this would be falsified only if the Fed ever raised rates at any future meeting, an overly broad bar since a single future hike years from now would not necessarily undo a September cut.", correct: false, misconception: "treating the chair's political origin as certain to determine the immediate policy decision, while setting an unfalsifiable, overly distant test for the thesis" },
    { text: "Assume long-term yields have now permanently decoupled from Fed policy and will keep rising indefinitely regardless of what the Fed does, since the historical relationship already broke once; this would be falsified only if long-term yields ever fell even slightly, an overly sensitive bar that normal day-to-day market noise would trigger constantly.", correct: false, misconception: "extrapolating one broken historical pattern into a permanent, irreversible trend, then setting a falsification bar so sensitive that ordinary noise would trigger it, making the thesis untestable in practice" },
    { text: "Take no position at all until the credibility question is fully and permanently resolved, since genuine uncertainty makes any position irresponsible; this would be falsified only if every future Fed communication proved perfectly consistent for the next decade, an impossible bar given that FOMC communication routinely varies meeting to meeting.", correct: false, misconception: "setting an impossible falsification bar as a way to avoid a probabilistic decision under real, ordinary uncertainty, rather than sizing a position to the uncertainty itself" },
    { text: "Size the position to the genuine uncertainty: hold a modest bet that long-term yields stay elevated or rise further, reflecting that no U.S. correction of the scale seen in the three comparison cases has yet occurred, while explicitly flagging the risk case; this thesis would be falsified if the Fed delivers a clear, sustained, credible tightening action, not just words, at or soon after the September 2026 meeting, and long-term yields fall meaningfully and durably in response, showing that decisive action, not personnel or press-conference messaging alone, can still repair the credibility this note has documented eroding.", correct: true }
  ] };

const NUMERIC_QUESTIONS = [
  { id: "rq1-d", type: "D", toleranceType: "tight", tolerancePct: 10, target: 4.21, unit: "% (10-yr Treasury yield if the term premium had stayed flat)", requiresPath: false,
    prompt: "Using the yield-decomposition logic from the bridge chart in the Background section: the 10-year Treasury yield rose from about 3.62% (September 2024) to about 4.82% (September 2026), a rise this note attributes partly to a roughly 0.61-percentage-point increase in the term premium (the NY Fed's ACM model, September 2024 to June 2026) and partly to other factors. If the term premium had instead stayed exactly flat at its September 2024 level over this whole period, holding every other factor in the bridge exactly as this note describes, what would the 10-year yield be today, in percent?",
    tolNote: "Tight tolerance (+/-10%): this is single-step subtraction from two stated FACTs.",
    decomposition: "4.82% minus the 0.61-percentage-point term-premium increase leaves 4.21%. This isolates exactly one component of the bridge, the risk-premium piece tied to investors' compensation for holding long-duration bonds amid perceived credibility risk, while leaving the other, larger driver (the market's expected future path of short-term rates) untouched. The lesson: a bridge or waterfall decomposition lets you ask \"what if just ONE component had been different,\" a more precise question than \"what if the total had been different.\"" },
  { id: "rq2-d", type: "D", toleranceType: "tight", tolerancePct: 15, target: 2.05, unit: "x (ratio of the 30-yr Treasury yield's gap to the 30-yr mortgage rate's gap)", requiresPath: true,
    prompt: "Using the same three figures as the bullet chart (a September 2024 baseline compared with each series' 2026 high): the 30-year Treasury yield rose from about 3.94% to about 5.21%, and the 30-year mortgage rate rose from about 6.09% to about 6.71%. Name your decomposition path, state which two gaps, in basis points, you will compute and then divide, before entering a number, then estimate the ratio of the 30-year Treasury yield's gap to the 30-year mortgage rate's gap.",
    tolNote: "Tight tolerance (+/-15%): two-step arithmetic (two subtractions, then a division), a slightly wider band than a single-step calculation.",
    decomposition: "The 30-year Treasury yield's gap is 5.21% minus 3.94%, or 127 basis points. The 30-year mortgage rate's gap is 6.71% minus 6.09%, or 62 basis points. 127 divided by 62 is about 2.05, meaning the long Treasury yield's rise was a little more than double the mortgage rate's rise over the same stretch. This reinforces the spread-narrowing lesson from the chart above: part of the Treasury market's stress was absorbed by a shrinking mortgage-Treasury spread rather than passed one-for-one into what homebuyers actually pay." }
];

const NUMERIC_QUESTIONS_OPEN = [
  { id: "bg-d", type: "D", toleranceType: "fermi", acceptLow: 96.15, acceptHigh: 384.6, target: 192.3, unit: "$ billions per year (extra federal interest cost, fully phased in)", requiresPath: false, confidenceEnabled: true,
    prompt: "The U.S. had about $32.05 trillion of total public debt outstanding as of July 2026 (Joint Economic Committee, U.S. Senate, 2026). Separately, the NY Fed's own term-premium model shows the 10-year term premium, the extra yield investors demand to hold a long-term bond instead of rolling over short-term ones, rose by about 0.6 percentage points (60 basis points) between September 2024 and June 2026 (NY Fed ACM model, via CEIC/MacroMicro, 2026). As a first pass, multiply the total debt stock by that 0.6-percentage-point shift to estimate roughly how many extra dollars, per year, the federal government would eventually pay in interest once this higher premium has fully worked its way through the entire stock of debt as it refinances. Answer in $ billions per year.",
    tolNote: "Wide tolerance, scored within a factor of 2 either way (order-of-magnitude Fermi): this simple multiplication ignores how fast the higher premium phases in as debt refinances, a real simplification, not a precise reported number.",
    decomposition: "$32.05 trillion multiplied by 0.006 (0.6 percentage points) is about $192 billion in extra annual interest, once fully phased in. For scale, that is roughly a fifth on top of the $881 billion the government paid in total net interest in FY2024 alone, a year that already exceeded that year's entire defense budget (PGPF/CBO). The important caveat this simple multiplication skips is timing: the average marketable Treasury security matures in about 71 months, just under six years (Joint Economic Committee, 2026), so only a slice of the debt refinances at the new, higher premium each year; $192 billion is the eventual, steady-state annual cost once the entire stock has rolled over, not next year's number. This generalizes to any \"a small percentage-point shift, multiplied across a huge base, is a big number\" estimate: always check whether the base fully reprices immediately or only gradually." }
];

const GLOSSARIES = {
  intro: [
    { term: "Federal Reserve (the Fed)", def: "The United States' central bank, which sets short-term interest rates and is designed to operate independently of day-to-day political control." },
    { term: "Central bank independence", def: "The idea that a country's central bank should set interest rates based on its own read of the economy, free from short-term political pressure, so it can make unpopular but necessary decisions." },
    { term: "Term premium", def: "The extra yield investors demand to hold a long-term bond instead of repeatedly rolling over a series of short-term ones, mainly as compensation for uncertainty about future inflation and policy." }
  ],
  background: [
    { term: "Basis point (bp)", def: "One-hundredth of one percentage point; a move from 5.00% to 4.75% is a 25-basis-point move." },
    { term: "Federal funds rate", def: "The short-term interest rate the Federal Reserve directly targets, which influences, but does not mechanically set, longer-term rates like the 10-year Treasury yield or a 30-year mortgage rate." },
    { term: "10-year Treasury yield", def: "The interest rate the U.S. government pays to borrow money for ten years, widely used as the benchmark for other long-term borrowing costs, including mortgages." }
  ],
  rq1: [
    { term: "Central Bank Independence (CBI) index", def: "An academic scoring system, based on a central bank's legal charter, that rates how free it is, on paper, from political control over its objectives, leadership, and lending to the government." },
    { term: "Confounder", def: "A separate, often-unmeasured factor that independently influences two variables at once, making them appear related even if neither one directly causes the other." }
  ],
  rq2: [
    { term: "FOMC (Federal Open Market Committee)", def: "The Federal Reserve's policy-setting group, which meets roughly eight times a year to decide the federal funds rate target." },
    { term: "Core PCE inflation", def: "A measure of price changes for consumer goods and services, excluding volatile food and energy prices, that the Federal Reserve treats as its preferred inflation gauge." },
    { term: "Mortgage-Treasury spread", def: "The gap between the 30-year mortgage rate and the 10-year Treasury yield, reflecting lenders' own funding costs, prepayment risk, and profit margin." }
  ],
  rq3: [
    { term: "Orthodox monetary policy", def: "A conventional approach in which a central bank raises interest rates to fight inflation, the opposite of using low rates to boost growth regardless of inflation." },
    { term: "Gilt", def: "A bond issued by the United Kingdom's government, the UK's equivalent of a U.S. Treasury bond." },
    { term: "Liability-driven investment (LDI)", def: "A strategy pension funds use, often involving borrowed money, to match their long-term bond holdings to their long-term payment obligations, which can force rapid selling if bond yields rise sharply." }
  ],
  learning: [
    { term: "Pre-mortem", def: "Imagining in advance that a plan has already failed, and naming the most likely reason, to surface risks before they occur." },
    { term: "Disconfirming evidence", def: "The observation that would count against your own conclusion, as opposed to evidence that supports it." },
    { term: "Falsification", def: "Stating in advance what would have to be observed for your claim to be judged wrong." }
  ]
};

const SOURCES = [
  { name: "CNBC, \"U.S. Treasury yields: Trump says he's firing Fed Governor Lisa Cook,\" 26 Aug 2025", url: "https://www.cnbc.com/2025/08/26/us-treasury-yields-trump-says-hes-firing-fed-governor-lisa-cook-.html", supports: "The 10-year Treasury yield rose to a peak of 4.31% on 26 Aug 2025 (from 4.22% the prior close) after President Trump announced he was firing Fed Governor Lisa Cook over mortgage-fraud allegations." },
  { name: "CNBC, \"Dollar drops after Trump fires Fed's Cook,\" 26 Aug 2025", url: "https://www.cnbc.com/2025/08/26/dollar-drops-after-trump-fires-feds-cook.html", supports: "The U.S. dollar index fell 0.28% to 98.19 on 26 Aug 2025 as investors weighed renewed concerns over Fed independence." },
  { name: "Axios (Courtenay Brown), \"Why the bond market is so calm amid Trump's war with Lisa Cook, the Fed,\" 28 Aug 2025", url: "https://www.axios.com/2025/08/28/lisa-cook-fed-trump-bond-market", supports: "Context on the muted initial bond-market reaction to the Cook firing attempt relative to later 2026 episodes." },
  { name: "CNBC, \"Supreme Court rules Trump cannot fire Fed Governor Lisa Cook for now,\" 29 Jun 2026", url: "https://www.cnbc.com/2026/06/29/supreme-court-lisa-cook-trump-federal-reserve.html", supports: "The Supreme Court rejected Trump's bid to stay a lower-court ruling blocking Cook's removal while her suit proceeds; the court did not rule on whether Trump can ultimately fire her." },
  { name: "SCOTUSblog, \"Trump informs Lisa Cook that he is 'considering' her removal,\" Aug 2026", url: "https://www.scotusblog.com/2026/08/trump-informs-lisa-cook-that-he-is-considering-her-removal/", supports: "In August 2026 the White House notified Cook it was again 'considering' removing her, giving her three weeks to respond." },
  { name: "CNN Politics, \"A key decision of Trump 2.0 approaches, picking a Fed chair,\" 13 Dec 2025", url: "https://edition.cnn.com/2025/12/13/politics/federal-reserve-chairman-kevin-hassett-kevin-warsh", supports: "Kevin Hassett and Kevin Warsh emerged as the two leading contenders to succeed Jerome Powell as Fed chair by December 2025." },
  { name: "CNBC, \"Hassett's Fed chair candidacy received pushback from high-level people close to Trump, sources say,\" 15 Dec 2025", url: "https://www.cnbc.com/2025/12/15/hassetts-fed-chair-candidacy-received-pushback-from-high-level-people-close-to-trump-sources-say.html", supports: "Kevin Hassett's odds of becoming Fed chair rose from about 30% in late November 2025 to about 80% by mid-December 2025 on Polymarket, alongside a rise in Treasury yields tied to his candidacy; some bond-market participants worried he would cut rates aggressively without containing inflation." },
  { name: "PBS NewsHour, \"White House formally nominates Kevin Warsh to be next Federal Reserve chair,\" 30 Jan 2026", url: "https://www.pbs.org/newshour/politics/white-house-formally-nominates-kevin-warsh-to-be-next-federal-reserve-chair", supports: "President Trump formally nominated Kevin Warsh, not Kevin Hassett, as the next Federal Reserve chair on 30 Jan 2026." },
  { name: "Fortune / Associated Press (Stan Choe), \"Kevin Warsh's Fed nod sends gold plunging and chops 31.4% off silver as dollar strengthens in Friday trading,\" 31 Jan 2026", url: "https://fortune.com/2026/01/31/what-happened-gold-silver-dollar-markets-kevin-warsh-fed-reaction/", supports: "On 30-31 Jan 2026, the 10-year Treasury yield rose to 4.25% from 4.24% (intraday near 4.28%); the 30-year yield rose to 4.87%; the dollar index rose 0.3% to above 96; gold fell 11.4% to $4,745.10/oz; the S&P 500 fell 0.4%." },
  { name: "CNBC / NPR, \"Kevin Warsh wins Senate confirmation as the next Federal Reserve chair,\" 13 May 2026", url: "https://www.cnbc.com/2026/05/13/kevin-warsh-wins-senate-confirmation-as-the-next-federal-reserve-chair.html", supports: "The Senate confirmed Kevin Warsh as Fed chair by a 54-45 vote, the closest confirmation vote for a Fed chair in the modern era; Jerome Powell's term as chair expired 17 May 2026; Warsh took office as the 17th Fed chair on 22 May 2026." },
  { name: "Axios (Neil Irwin), \"Why the bond market is doubting Fed chairman Warsh,\" 30 Jul 2026", url: "https://www.axios.com/2026/07/30/warsh-fed-inflation-bonds", supports: "At his 29 Jul 2026 press conference, Chair Warsh repeatedly declined to commit to raising rates if inflation stayed elevated and cast doubt on whether PCE would remain the Fed's target measure; longer-term Treasury yields sold off sharply, with the 30-year reaching 5.21% on 30 Jul 2026, the highest since 2007, even as traders cut bets on a September rate hike to a coin flip." },
  { name: "CNBC, \"10-year U.S. Treasury yield hits highest level since November 2023,\" 2 Sept 2026", url: "https://www.cnbc.com/2026/09/02/bond-yields-treasurys-inflation.html", supports: "The 10-year Treasury yield reached 4.818% on 2 Sept 2026, its highest level since November 2023." },
  { name: "CNBC, \"Treasury yields fall after Fed's Waller signals support for no rate hike,\" 3 Sept 2026", url: "https://www.cnbc.com/2026/09/03/us-treasury-yields-bonds.html", supports: "The 10-year Treasury yield eased to 4.79% by 3-4 Sept 2026 after Fed Governor Christopher Waller signaled he was leaning toward keeping rates unchanged at the September meeting." },
  { name: "Freddie Mac, Primary Mortgage Market Survey, \"Mortgage Rates Average 6.71%,\" 3 Sept 2026", url: "https://www.freddiemac.com/pmms", supports: "The 30-year fixed mortgage rate averaged 6.71% for the week of 3 Sept 2026, up from 6.66% the prior week; separately, the 30-year fixed rate rose from about 6.09% (week of 19 Sept 2024) to 6.84% (week of 21 Nov 2024) following the Fed's September 2024 rate cut." },
  { name: "Federal Reserve Bank of Atlanta, \"Not Joined at the Hip: The Relationship between the Fed Funds Rate and Mortgage Rates,\" 10 Nov 2025", url: "https://www.atlantafed.org/research-and-data/2025/11/10/not-joined-at-the-hip-relationship-between-the-fed-funds-rate-and-mortgage-rates", supports: "Fixed mortgage rates track the 10-year Treasury yield, not the federal funds rate directly, and can move in the opposite direction from a Fed rate cut, as occurred after September 2024." },
  { name: "J.P. Morgan Private Bank, \"Why have 10-year U.S. Treasury yields increased since the Fed started cutting rates?\" Jan 2025", url: "https://privatebank.jpmorgan.com/nam/en/insights/markets-and-investing/tmt/why-have-10-year-us-treasury-yields-increased-since-the-fed-started-cutting-rates", supports: "In the seven Fed rate-cutting cycles since the 1980s prior to 2024, the 10-year Treasury yield was lower 100% of the time, 100 days after the first cut; in the 2024-25 cycle it was instead more than 100 basis points higher, which J.P. Morgan attributes to resilient growth expectations and heightened macro uncertainty." },
  { name: "Seeking Alpha, \"Treasury Yields Snapshot: November 15, 2024\"", url: "https://seekingalpha.com/article/4738519-treasury-yields-snapshot-november-15-2024", supports: "The 10-year Treasury yield ended 15 Nov 2024 at 4.43%." },
  { name: "Market data via news search (TradingEconomics/Reuters coverage), 10-year and 30-year Treasury yield 52-week lows, 16 Sept 2024", url: "https://tradingeconomics.com/united-states/government-bond-yield", supports: "The 10-year Treasury yield hit a 52-week low of 3.622% and the 30-year Treasury yield hit a 52-week low of 3.936% on 16 Sept 2024, just before the Fed's first 2024 rate cut." },
  { name: "Advisor Perspectives / dshort, \"Treasury Yields Snapshot: June 26, 2026\"", url: "https://www.advisorperspectives.com/dshort/updates/2026/06/26/treasury-yields-snapshot-june-26-2026", supports: "The 10-year Treasury yield closed at 4.38% on 26 Jun 2026." },
  { name: "CEIC / MacroMicro, \"US 10-Year Treasury Term Premium (ACM),\" data through June 2026", url: "https://en.macromicro.me/series/20480/us-10-treasury-term-premium", supports: "The NY Fed's ACM 10-year term premium model shows a reading of about -0.10% at end-September 2024, +0.49% at end-January 2025 (briefly above 0.8%, the highest since 2011, on 13 Jan 2025), and about +0.51% (0.513%) at end-June 2026." },
  { name: "Congress.gov, Congressional Research Service, \"Federal Reserve Cuts Interest Rates in Late 2025,\" IN12635", url: "https://www.congress.gov/crs-product/IN12635", supports: "The FOMC cut its target range by 25 basis points at each of its September, October, and December 2025 meetings, bringing the federal funds target range to 3.50%-3.75%." },
  { name: "CBS News, \"Federal Reserve cuts interest rates by 0.25 percentage points, but projects fewer reductions in 2025,\" Dec 2024", url: "https://www.cbsnews.com/news/federal-reserve-fed-meeting-interest-rate-cut-decision-december-2024/", supports: "The Fed cut rates by 0.50 points in September 2024, 0.25 in November 2024, and 0.25 in December 2024, bringing the target range to 4.25%-4.50%." },
  { name: "CNBC, \"Fed's preferred inflation gauge shows core prices rose 3.3% annually in July,\" 26 Aug 2026", url: "https://www.cnbc.com/2026/08/26/feds-preferred-inflation-gauge-shows-core-prices-rose-3point3percent-annually-in-july.html", supports: "Core PCE inflation, the Fed's preferred gauge, rose 3.3% year over year in July 2026." },
  { name: "U.S. Bureau of Labor Statistics, Consumer Price Index Summary, July 2026", url: "https://www.bls.gov/news.release/cpi.nr0.htm", supports: "Headline CPI rose 3.4% year over year (not seasonally adjusted) and core CPI rose 2.5% year over year in July 2026." },
  { name: "Peter G. Peterson Foundation, \"Any Way You Look at It, Interest Costs on the National Debt Will Soon Be at an All-Time High,\" citing CBO", url: "https://www.pgpf.org/article/any-way-you-look-at-it-interest-costs-on-the-national-debt-will-soon-be-at-an-all-time-high/", supports: "Net interest on the federal debt totaled $881 billion in fiscal year 2024, exceeding that year's defense spending." },
  { name: "Joint Economic Committee, U.S. Congress (Republicans), Monthly Debt Update", url: "https://www.jec.senate.gov/public/vendor/_accounts/JEC-R/debt/Monthly%20Debt%20Update.html", supports: "Total public debt outstanding reached about $32.05 trillion as of July 2026; the average maturity of marketable Treasury debt was about 71 months (just under six years) as of June 2026. This page updates monthly, so figures reflect the most recent release at the time of writing." },
  { name: "St. Louis Fed, \"Central Bank Independence and Inflation\" (summarizing Alesina & Summers, 1993, Journal of Money, Credit and Banking)", url: "https://www.stlouisfed.org/about-us/resources/why-fed-is-well-designed-central-bank/central-bank-independence-inflation", supports: "Alesina and Summers (1993) found a near-perfect negative correlation between central bank independence and average inflation among advanced economies, 1955-1988; the relationship is weaker and less consistent once developing economies are included." },
  { name: "Ana Carolina Garriga, \"Revisiting Central Bank Independence in the World: An Extended Dataset,\" International Studies Quarterly, Oxford Academic, 2025", url: "https://academic.oup.com/isq/article/69/2/sqaf024/8108275", supports: "The most comprehensive dataset on statutory (de jure) central bank independence covers 192 countries from 1970 to 2023, scoring independence from 0 to 1 across four dimensions: personnel independence, objectives, policy formulation, and limits on lending to government." },
  { name: "Carnegie Endowment for International Peace, \"Why Is Turkey's President Cutting Interest Rates, Spurring Inflation and Lowering the Value of the Lira?\" Dec 2021", url: "https://carnegieendowment.org/middle-east/diwan/2021/12/why-is-turkeys-president-cutting-interest-rates-spurring-inflation-and-lowering-the-value-of-the-lira", supports: "President Erdogan fired central bank governor Naci Agbal in March 2021 after Agbal raised rates; subsequent forced rate cuts sent the lira into free fall. Kavcioglu became the fourth central bank governor since 2019." },
  { name: "TradingEconomics, Turkey Inflation Rate (TUIK data)", url: "https://tradingeconomics.com/turkey/inflation-cpi", supports: "Turkey's headline annual inflation peaked at 85.51% in October 2022; it eased to 30.65% in January 2026 (the lowest since November 2021) and to 31.51% in August 2026 from 31.75% in July 2026, three consecutive months of slowdown." },
  { name: "Euronews, \"Turkey cuts interest rate to 42.5% after inflation hits two-year low,\" 6 Mar 2025", url: "https://www.euronews.com/business/2025/03/06/turkey-cuts-interest-rate-to-425-after-inflation-hits-two-year-low", supports: "Turkey's central bank cut its policy rate to 42.5% in March 2025 as inflation eased to a two-year low, after raising the rate from 8.5% (early 2023) to 50% (March 2024) under a new, orthodox policy team." },
  { name: "Charlie Bilello (compiling INDEC data), monthly inflation figures, Dec 2023-Nov 2024", url: "https://x.com/charliebilello/status/1867026942282830285", supports: "Argentina's month-over-month inflation fell from 25.5% in December 2023 (Milei's first full month in office) to 2.4% by November 2024." },
  { name: "Buenos Aires Herald, \"Win for Milei as inflation for 2024 plummets to 117.8%\"", url: "https://buenosairesherald.com/economics/win-for-milei-as-inflation-for-2024-drops-to-117-8", supports: "Argentina's annual inflation for 2024 was 117.8%, down from 211.4% in 2023, a 32-year high." },
  { name: "Rio Times Online, \"Argentina Inflation 2026: Milei's Victory and Its Price\"", url: "https://www.riotimesonline.com/argentina-inflation-milei-economy-2026/", supports: "By July 2026, Argentina's monthly inflation was 2.1%, with annual inflation of 33.8%; by July 2025 monthly inflation had fallen to 1.6%, among the lowest since April 2020." },
  { name: "EFG International, \"UK mini-budget sparks gilt market mayhem,\" 2022", url: "https://www.efginternational.com/insights/2022/uk-mini-budget-sparks-gilt-market-mayhem.html", supports: "The UK's 23 Sept 2022 mini-budget, announcing 45 billion pounds of unfunded tax cuts, sent the 30-year gilt yield from about 3.6% on 22 Sept to a peak of about 5.1% on 28 Sept, prompting emergency Bank of England gilt purchases." },
  { name: "Yahoo Finance UK, \"Gilt rally signals investor relief after UK budget\"", url: "https://uk.finance.yahoo.com/news/uk-government-bonds-budget-gilts-130158581.html", supports: "After Chancellor Jeremy Hunt reversed most of the mini-budget's tax cuts on 17 Oct 2022, the 30-year gilt yield fell as much as 44 basis points to 4.34% that day." },
  { name: "Federal Reserve History, \"The Treasury-Fed Accord\"", url: "https://www.federalreservehistory.org/essays/treasury-fed-accord", supports: "The March 1951 Treasury-Federal Reserve Accord ended the Fed's wartime commitment to pegging Treasury bill rates and separated debt management from monetary policy, laying the institutional foundation for the modern, independent Federal Reserve." },
  { name: "Federal Reserve History, \"Recession of 1981-82\"", url: "https://www.federalreservehistory.org/essays/recession-of-1981-82", supports: "Under Chair Paul Volcker, the federal funds rate rose above 19% in 1981 to break double-digit inflation, contributing to unemployment reaching 10.8% by late 1982, the post-war era's high point until 2020." }
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

const CONFIDENCE_LEVELS = ["Low", "Medium", "High"];

function NumericQuestion({ q, state, onSubmit }) {
  const [val, setVal] = useState("");
  const [path, setPath] = useState("");
  const [confidence, setConfidence] = useState("");
  const submitted = state && state.submitted;
  const needsConfidence = !!q.confidenceEnabled;
  const canSubmit = val !== "" && !isNaN(parseFloat(val)) && (!q.requiresPath || path.trim().length >= 10) && (!needsConfidence || confidence !== "");

  function handleSubmit() {
    const guess = parseFloat(val);
    const isCorrect = q.toleranceType === "tight"
      ? tightScore(guess, q.target, q.tolerancePct)
      : fermiScore(guess, q.acceptLow, q.acceptHigh);
    const signedErrorPct = (guess - q.target) / q.target * 100;
    onSubmit(q.id, guess, isCorrect, signedErrorPct, path, needsConfidence ? confidence : null);
  }

  const lo = q.toleranceType === "tight" ? q.target * 0.4 : q.acceptLow * 0.4;
  const hi = q.toleranceType === "tight" ? q.target * 1.8 : q.acceptHigh * 1.6;

  return (
    <div className="question-card">
      <div className="q-prompt">{q.prompt}</div>
      {!submitted && (
        <div>
          {q.requiresPath && (
            <textarea className="path-textarea" placeholder="Name your decomposition path (which values you will compute and combine)..."
              value={path} onChange={(e) => setPath(e.target.value)} />
          )}
          <div className="numeric-input-row">
            <input type="number" step="any" value={val} onChange={(e) => setVal(e.target.value)} placeholder="your estimate" />
            <span>{q.unit}</span>
          </div>
          <input className="numeric-slider" type="range" min={lo} max={hi} step={(hi - lo) / 200}
            value={val === "" ? (lo + hi) / 2 : val} onChange={(e) => setVal(e.target.value)} />
          <div className="chart-meta"><span>{q.tolNote}</span></div>
          {needsConfidence && (
            <div className="confidence-row">
              <span className="confidence-label">Before you see the answer: how confident are you this estimate is within the stated tolerance?</span>
              <div className="confidence-options">
                {CONFIDENCE_LEVELS.map((lvl) => (
                  <button type="button" key={lvl}
                    className={"confidence-pill " + (confidence === lvl ? "confidence-pill-selected" : "")}
                    onClick={() => setConfidence(lvl)}>{lvl}</button>
                ))}
              </div>
            </div>
          )}
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
              : "Outside tolerance -- the specific reasoning error is usually skipping one factor in the chain, most often a timing assumption or a spread/component that should have been isolated first."} Signed error: {state.signedErrorPct.toFixed(1)}%.</div>
            {state.path && state.path.length > 0 && (
              <div className="transfer-line">Your stated path: {state.path}</div>
            )}
            {state.confidence && (
              <div className="transfer-line">You marked your pre-reveal confidence as: {state.confidence}. {state.isCorrect
                ? (state.confidence === "High" ? "High confidence and within tolerance -- well calibrated on this one." : "Within tolerance despite lower stated confidence -- you may be underrating your own reasoning on Fermi-style estimates.")
                : (state.confidence === "High" ? "High confidence but outside tolerance -- a classic overconfidence pattern on order-of-magnitude estimates, where a wider stated range is usually the safer bet." : "Lower confidence and outside tolerance -- your uncertainty was well placed here, even though the specific number missed.")}</div>
            )}
            <div className="principle-line">How to estimate this: {q.decomposition}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== CHARTS ============================== */

function SlopeChart() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={SLOPE_DATA} margin={{ top: 24, right: 30, left: 4, bottom: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis dataKey="stage" tick={{ fontSize: 11 }} interval={0} />
        <YAxis domain={[0, 8]} tick={{ fontSize: 11 }} label={{ value: "Percent", angle: -90, position: "insideLeft", fontSize: 10 }} />
        <Tooltip formatter={(v) => v + "%"} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line type="linear" dataKey="fedFunds" name="Fed funds rate (upper bound)" stroke="#16a34a" strokeWidth={3} dot={{ r: 7 }}>
          <LabelList dataKey="fedFunds" position="top" fontSize={11} formatter={(v) => v.toFixed(2) + "%"} />
        </Line>
        <Line type="linear" dataKey="treasury10y" name="10-yr Treasury yield" stroke="#2563eb" strokeWidth={3} dot={{ r: 7 }}>
          <LabelList dataKey="treasury10y" position="bottom" fontSize={11} formatter={(v) => v.toFixed(2) + "%"} />
        </Line>
        <Line type="linear" dataKey="mortgage30y" name="30-yr fixed mortgage rate" stroke="#dc2626" strokeWidth={3} dot={{ r: 7 }}>
          <LabelList dataKey="mortgage30y" position="top" fontSize={11} formatter={(v) => v.toFixed(2) + "%"} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}

function YieldBridgeChart() {
  return (
    <ResponsiveContainer width="100%" height={360}>
      <BarChart data={YIELD_BRIDGE} margin={{ top: 28, right: 16, left: 4, bottom: 84 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-24} textAnchor="end" height={100} />
        <YAxis domain={[0, 5.5]} tick={{ fontSize: 11 }} label={{ value: "10-yr Treasury yield (%)", angle: -90, position: "insideLeft", fontSize: 10 }} />
        <Tooltip formatter={(v, n) => (n === "barHeight" ? [v + " pts", "magnitude"] : v)} />
        <ReferenceLine y={3.62} stroke="#9ca3af" strokeDasharray="4 4" />
        <Bar dataKey="base" stackId="wf" fill="transparent" isAnimationActive={false} />
        <Bar dataKey="barHeight" stackId="wf" isAnimationActive={false}>
          {YIELD_BRIDGE.map((entry, i) => (
            <Cell key={"wf-cell-" + i} fill={entry.kind === "total" ? "#111" : "#dc2626"} />
          ))}
          <LabelList dataKey="shown" position="top" fontSize={11} formatter={(v) => v + (v > 3 ? "%" : " pts")} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function FundsVsYieldChart() {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <LineChart data={FUNDS_VS_YIELD} margin={{ top: 24, right: 30, left: 4, bottom: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
        <XAxis dataKey="stage" tick={{ fontSize: 11 }} interval={0} />
        <YAxis domain={[3, 6]} tick={{ fontSize: 11 }} label={{ value: "Percent", angle: -90, position: "insideLeft", fontSize: 10 }} />
        <Tooltip formatter={(v) => v + "%"} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <ReferenceLine x="Aug 26 '25" stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Cook firing attempt", fontSize: 9, position: "top", fill: "#b45309" }} />
        <ReferenceLine x="Jan 30 '26" stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Warsh nominated", fontSize: 9, position: "top", fill: "#b45309" }} />
        <ReferenceLine x="Jun 26 '26" stroke="#f59e0b" strokeDasharray="3 3" label={{ value: "Warsh presser (Jul 29)", fontSize: 9, position: "top", fill: "#b45309" }} />
        <Line type="linear" dataKey="fedFunds" name="Fed funds rate (upper bound)" stroke="#16a34a" strokeWidth={3} dot={{ r: 6 }}>
          <LabelList dataKey="fedFunds" position="bottom" fontSize={10} formatter={(v) => v.toFixed(2) + "%"} />
        </Line>
        <Line type="linear" dataKey="treasury10y" name="10-yr Treasury yield" stroke="#2563eb" strokeWidth={3} dot={{ r: 6 }}>
          <LabelList dataKey="treasury10y" position="top" fontSize={10} formatter={(v) => v.toFixed(2) + "%"} />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}

function BulletChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={BULLET_DATA} layout="vertical" margin={{ top: 20, right: 50, left: 10, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
        <XAxis type="number" domain={[0, 7.5]} tick={{ fontSize: 11 }}
          label={{ value: "Percent", position: "insideBottom", offset: -14, fontSize: 10 }} />
        <YAxis type="category" dataKey="metric" width={170} tick={{ fontSize: 10.5 }} />
        <Tooltip formatter={(v) => v + "%"} />
        <Bar dataKey="current" fill="#fecaca" barSize={16} isAnimationActive={false}>
          <LabelList dataKey="current" position="right" fontSize={11} formatter={(v) => v + "% now"} />
        </Bar>
        <Scatter dataKey="baseline" name="Sept 2024 baseline" fill="#111" shape="diamond" isAnimationActive={false}>
          <LabelList dataKey="baseline" position="left" fontSize={11} formatter={(v) => v + "%"} />
        </Scatter>
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function CaseDumbbellChart() {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={CASE_DUMBBELL} layout="vertical" margin={{ top: 20, right: 50, left: 10, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
        <XAxis type="number" domain={[0, 95]} tick={{ fontSize: 11 }}
          label={{ value: "Value in each case's own unit (percent -- see row label)", position: "insideBottom", offset: -14, fontSize: 9.5 }} />
        <YAxis type="category" dataKey="place" width={210} tick={{ fontSize: 10 }} />
        <Tooltip formatter={(v) => v} />
        <Bar dataKey="before" fill="#e5e7eb" barSize={6} isAnimationActive={false} />
        <Scatter dataKey="before" name="Peak / starting level" fill="#dc2626" isAnimationActive={false}>
          <LabelList dataKey="before" position="top" fontSize={10} formatter={(v) => v} />
        </Scatter>
        <Scatter dataKey="after" name="Most recent level" fill="#16a34a" isAnimationActive={false}>
          <LabelList dataKey="after" position="bottom" fontSize={10} formatter={(v) => v} />
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
      <p>Before turning to the Federal Reserve, put three principles from recent installments of this series to work on unfamiliar problems. None of the three questions below is about central banks, interest rates, or bond markets. They test whether the reasoning transfers, not whether you remember the earlier articles.</p>
      {WARMUP_QUESTIONS.map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
    </SectionWrapper>
  );
}

function IntroSection({ mcState, onMcSubmit }) {
  return (
    <SectionWrapper id="sec-intro" title="Introduction">
      <p>In August 2025, President Trump tried to fire a sitting Federal Reserve governor, and by mid-2026 he had helped install a new Fed chair many bond investors see as sympathetic to his demand for lower interest rates. Yet the long-term borrowing costs that set mortgages and government financing, not the short-term rate the Fed directly controls, have done the opposite: they climbed to some of their highest levels in years.</p>
      <p>The scale of the mismatch is large. Between September 2024 and September 2026, the Federal Reserve cut its short-term policy rate by a cumulative 175 basis points (1.75 percentage points), from 5.50% to 3.75% (Congress.gov CRS, 2025; CBS News, 2024). Over that same stretch, the 10-year Treasury yield, the benchmark for most long-term borrowing, rose by about 120 basis points, from 3.62% to 4.82% (market data; CNBC, 2026), and the 30-year Treasury yield touched 5.21% in July 2026, its highest level since 2007 (Axios, 2026). The 30-year fixed mortgage rate, which most homebuyers actually pay, rose to 6.71% by early September 2026 (Freddie Mac, 2026).</p>
      <p>This runs against the textbook expectation that a falling policy rate pulls long-term borrowing costs down with it. In the seven Fed rate-cutting cycles before this one, dating back to the 1980s, the 10-year Treasury yield was lower, not higher, 100 times out of 100, measured 100 days after the Fed's first cut (J.P. Morgan Private Bank, 2025). This cycle broke that streak within months. The proposed explanation this note tests is that long-term yields price in a risk premium for future policy credibility, not just today's policy rate, and that a string of events widely read as threatening the Fed's independence, an attempted governor firing, a contested succession, and an ambiguous first press conference from the new chair, has pushed that premium up even as the policy rate itself came down.</p>
      <p>This note addresses three questions. First, does the economic and historical record actually support the idea that eroding a central bank's independence raises, rather than lowers, long-term borrowing costs, and through what mechanism? Second, what does the specific 2025-2026 sequence of events in the United States show when checked against real market data, event by event? Third, what has separated countries that quickly escaped this kind of credibility spiral from those that fell into a much longer one, and what would it take for the United States to end up on one path rather than the other?</p>
      {INTRO_QUESTIONS.map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <Glossary items={GLOSSARIES.intro} />
    </SectionWrapper>
  );
}

function BackgroundSection({ chartInterp, onInterpSubmit, mcState, numState, onMcSubmit, onNumSubmit }) {
  const numQ = NUMERIC_QUESTIONS_OPEN.find((q) => q.id === "bg-d");
  return (
    <SectionWrapper id="sec-background" title="Background">
      <h3>2A. Trajectory: A Textbook Relationship, Tested Since 2024</h3>
      <p>Central bank independence in the United States is not an old idea, but it is also not automatic. Until 1951, the Federal Reserve was committed to keeping Treasury bill rates pinned low to help the government finance World War Two and Korean War debt cheaply. The Treasury-Fed Accord of March 1951 ended that arrangement, separating debt management from monetary policy and laying the institutional foundation for the independent Fed most people assume has always existed (Federal Reserve History). Three decades later, that independence was tested by Chair Paul Volcker, who pushed the federal funds rate above 19% in 1981 to break double-digit inflation, a policy that helped push unemployment to 10.8% by late 1982 before inflation finally came down for good (Federal Reserve History). The Volcker episode is the reference case for why independence is supposed to matter: an unpopular, politically costly decision that a Fed answering directly to elected officials might never have made.</p>
      <p>The relationship this note investigates, between short-term policy moves and long-term borrowing costs, already cracked once before the 2025-2026 independence fight even began. When the Fed cut its policy rate by half a percentage point on 18 September 2024, both the 10-year Treasury yield and the 30-year fixed mortgage rate rose over the following two months, instead of falling. The chart below places all three series, the Fed funds rate, the 10-year yield, and the mortgage rate, at two points two months apart.</p>
      <ChartCard chartKey="chart1" title="Chart 1. The Textbook Relationship Breaks: Fed Funds Rate vs. 10-yr Treasury Yield vs. 30-yr Mortgage Rate, Sept-Nov 2024"
        tier="FACT" note="Fed funds upper bound: FOMC actions (CBS News, 2024). 10-yr Treasury yield: 3.62% (16 Sept 2024, market data) and 4.43% (15 Nov 2024, Seeking Alpha). 30-yr mortgage rate: 6.09% (week of 19 Sept 2024) and 6.84% (week of 21 Nov 2024, Freddie Mac PMMS). Dates are close but not identical across series, disclosed here."
        interpState={chartInterp.chart1} onInterpSubmit={onInterpSubmit}>
        <SlopeChart />
      </ChartCard>
      {BACKGROUND_QUESTIONS.map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <h3>2B. Structural Transformation: Pricing a Risk Premium, Not Just a Policy Rate</h3>
      <p>To understand why a rate cut can coincide with a yield increase, it helps to split the 10-year Treasury yield into two conceptual pieces: the average path of short-term rates markets expect over the next decade, and a term premium, the extra compensation investors demand for the risk of holding a bond that long instead of continually rolling over short-term ones. A policy rate cut mostly shifts the first piece, and only for the near term. The term premium moves for entirely different reasons: expectations about long-run inflation, federal borrowing, and confidence that the Fed will keep inflation under control for the next ten years, not just the next meeting.</p>
      <p>The NY Fed's own term-premium model (built by economists Tobias Adrian, Richard Crump, and Emanuel Moench, known as the ACM model) shows this second piece moving sharply higher over exactly the window this note covers: from about -0.10% at the end of September 2024 to about +0.49% by the end of January 2025, briefly exceeding 0.8% on 13 January 2025, the highest level since 2011, before settling around +0.51% by the end of June 2026 (CEIC/MacroMicro, aggregating NY Fed ACM data, 2026). The bridge below uses that data to size how much of the 10-year yield's total rise, from 3.62% in September 2024 to 4.82% in September 2026, is attributable to this specific, credibility-sensitive component, versus everything else.</p>
      <ChartCard chartKey="chart2" title="Chart 2. Bridging the 10-yr Treasury Yield's Rise: Term Premium vs. Everything Else, Sept 2024-Sept 2026"
        tier="ESTIMATE" note="Starting and ending yields, and the +0.61-percentage-point term-premium change, are FACT (market data; CEIC/MacroMicro NY Fed ACM data, with the term-premium reading as of June 2026, about two months before the September 2026 yield reading). The +0.59-percentage-point 'expected rate path & other' bar is an ESTIMATE: this note's own residual (total change minus the FACT term-premium change), not a separately reported figure."
        interpState={chartInterp.chart2} onInterpSubmit={onInterpSubmit}>
        <YieldBridgeChart />
      </ChartCard>
      <p>This is the structural gap the rest of this note investigates. A little over half of the 10-year yield's rise traces to the specific component that compensates investors for long-run policy uncertainty, not to an ordinary shift in the expected path of short-term rates. That split is consistent with, though it does not by itself prove, the idea that concerns about the Fed's independence and future inflation-fighting credibility are doing real, measurable work inside the bond market, not just generating headlines.</p>
      <NumericQuestion q={numQ} state={numState[numQ.id]} onSubmit={onNumSubmit} />
      <Glossary items={GLOSSARIES.background} />
    </SectionWrapper>
  );
}

function RQ1Section({ chartInterp, onInterpSubmit, mcState, numState, onMcSubmit, onNumSubmit }) {
  const numQ = NUMERIC_QUESTIONS.find((q) => q.id === "rq1-d");
  return (
    <SectionWrapper id="sec-rq1" title="Section 3. Does Losing Independence Really Raise Long-Term Rates?">
      <p>The first research question asks whether the theory this note is testing has real support, beyond a single, dramatic U.S. episode. The strongest and oldest piece of evidence is academic: a landmark 1993 study by Alberto Alesina and Lawrence Summers found a near-perfect negative correlation between how independent a country's central bank was, by law, and how much inflation that country experienced, among advanced economies from 1955 to 1988 (Alesina & Summers, 1993, discussed in St. Louis Fed and SUERF summaries). The more independent the central bank, the lower the inflation, with almost no exceptions in that sample.</p>
      <p>That correlation, however, is not the same kind of evidence as a specific case where the mechanism can actually be traced step by step. Turkey supplies that second kind of evidence. In March 2021, President Erdogan fired central bank governor Naci Agbal after Agbal raised interest rates to fight inflation; Agbal was the first of what became four governors in five years (Carnegie Endowment, 2021). The rate cuts that followed sent the Turkish lira falling and inflation rising, eventually peaking at 85.5% in October 2022 (TradingEconomics/TUIK). The chart below places the U.S. federal funds rate against the 10-year Treasury yield across six dated points spanning the full independence episode this note investigates, annotated with three of its key events.</p>
      <ChartCard chartKey="chart3" title="Chart 3. Fed Funds Rate vs. 10-yr Treasury Yield, Sept 2024-Sept 2026, with Key Independence Events"
        tier="FACT" note="Fed funds upper bound: FOMC actions. 10-yr Treasury yield at each date: 3.62% (16 Sept 2024, market data); 4.79% (14 Jan 2025, multiple news sources); 4.31% (26 Aug 2025, CNBC); 4.25% (30 Jan 2026, Fortune/AP); 4.38% (26 Jun 2026, Advisor Perspectives/dshort); 4.82% (2 Sept 2026, CNBC)."
        interpState={chartInterp.chart3} onInterpSubmit={onInterpSubmit}>
        <FundsVsYieldChart />
      </ChartCard>
      {RQ1_QUESTIONS.filter((q) => q.id === "rq1-b").map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <p>The evidence for taking the theory seriously, beyond Turkey and the academic correlation, is that the mechanism has a specific, named channel: the term premium, sized in the Background section, is exactly the component economic theory predicts should move first and most when investors doubt a central bank's long-run commitment to controlling inflation. It is not a vague, catch-all "markets got nervous" story; it points to a specific price investors are willing to name a number for.</p>
      <NumericQuestion q={numQ} state={numState[numQ.id]} onSubmit={onNumSubmit} />
      <p>The evidence against treating the theory as settled is exactly the limit the academic literature itself reports: the near-perfect correlation Alesina and Summers found weakens substantially once developing economies are included, and a country's central bank independence, on paper, tends to travel together with its broader institutional quality, its rule of law, its property-rights protections, and its overall investor confidence. It is possible that some of what looks like "independence causes low inflation" is really "countries with strong institutions tend to have both independent central banks and low inflation," without central bank independence itself doing all of the causal work. Turkey's case is more convincing precisely because it names the mechanism step by step, but Turkey is also an emerging-market economy with a history of currency crises, a genuinely different starting point from the United States.</p>
      {RQ1_QUESTIONS.filter((q) => q.id === "rq1-c").map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <p>The honest section-level conclusion is that the theory has real support, a strong historical correlation among advanced economies and a traceable mechanism in Turkey's case, but that support falls short of proof for any one country, including the United States, because a shared confounder (institutional quality) can plausibly explain part of the correlation, and no two countries' starting conditions are identical enough to treat one as a clean preview of the other.</p>
      <Glossary items={GLOSSARIES.rq1} />
    </SectionWrapper>
  );
}

function RQ2Section({ chartInterp, onInterpSubmit, mcState, numState, onMcSubmit, onNumSubmit }) {
  const numQ = NUMERIC_QUESTIONS.find((q) => q.id === "rq2-d");
  return (
    <SectionWrapper id="sec-rq2" title="Section 4. What Does the 2025-2026 U.S. Sequence Actually Show?">
      <p>The second research question sets theory aside and checks the market's real reaction, event by event. The sequence began on 25 August 2025, when President Trump announced he was firing Fed Governor Lisa Cook over mortgage-fraud allegations she denies; the 10-year Treasury yield rose to a peak of 4.31% the next day (from 4.22%) and the dollar index fell 0.28% (CNBC, 2025). A federal judge blocked the firing on 9 September 2025, and the case has moved slowly through the courts since: the Supreme Court ruled on 29 June 2026 that Trump could not remove Cook while her suit proceeds, without ruling on whether he ultimately can, and by August 2026 the White House was again "considering" her removal (SCOTUSblog, 2026).</p>
      <p>Meanwhile, the contest to replace Chair Jerome Powell, whose term expired 17 May 2026, played out in parallel. By December 2025, Kevin Hassett, an outspoken advocate of aggressive rate cuts, was the reported front-runner, and his odds on prediction markets rose from about 30% to about 80% in two weeks; Treasury yields rose alongside that news, and some bond investors reportedly warned the administration that a Hassett appointment risked a market backlash (CNBC, 2025). On 30 January 2026, Trump instead nominated Kevin Warsh, a former Fed governor seen by many investors as a more credible, if still Trump-aligned, choice; markets absorbed the news calmly at first, with the 10-year yield rising only marginally to 4.25% and the dollar strengthening, while gold, which had rallied for a year partly on independence fears, fell 11.4% in a single session (Fortune/AP, 2026). The Senate confirmed Warsh by a 54-45 vote, the closest confirmation margin for a Fed chair in the modern era, and he took office on 22 May 2026 (CNBC/NPR, 2026).</p>
      <p>The chart below places these same events against three separate borrowing-cost benchmarks, each measured from its own September 2024 baseline.</p>
      <ChartCard chartKey="chart4" title="Chart 4. How Far Have Long-Term Borrowing Costs Drifted From Their Sept 2024 Baseline?"
        tier="FACT" note="10-yr Treasury yield: 3.62% (16 Sept 2024) to 4.82% (2 Sept 2026, CNBC). 30-yr Treasury yield: 3.94% (16 Sept 2024) to 5.21% (30 Jul 2026, highest since 2007, Axios). 30-yr fixed mortgage rate: 6.09% (week of 19 Sept 2024) to 6.71% (week of 3 Sept 2026, Freddie Mac). The 30-yr Treasury peak (Jul 2026) and the other two current readings (Sept 2026) are not the identical date, disclosed here."
        interpState={chartInterp.chart4} onInterpSubmit={onInterpSubmit}>
        <BulletChart />
      </ChartCard>
      {RQ2_QUESTIONS.filter((q) => q.id === "rq2-b").map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <p>The single sharpest reaction in the entire sequence did not come from either personnel fight. It came from Chair Warsh's own words. At his 29 July 2026 press conference, Warsh repeatedly declined to commit to raising rates if inflation stayed elevated and cast doubt on whether the Fed's preferred inflation gauge would even remain its target measure going forward. Longer-term Treasury yields sold off sharply the next morning: the 30-year yield reached 5.21%, its highest level since 2007, even as traders simultaneously cut their odds of a September rate hike to a coin flip, because Warsh's ambiguity read as dovish on near-term policy but alarming on long-run commitment (Axios, 2026). July 2026's core PCE inflation, the Fed's preferred gauge, was running at 3.3% year over year, well above the Fed's 2% target (CNBC, 2026), which is precisely the backdrop against which vague commitment language carries the most cost.</p>
      <NumericQuestion q={numQ} state={numState[numQ.id]} onSubmit={onNumSubmit} />
      <p>By early September 2026, the 10-year yield reached 4.818%, its highest level since November 2023, before easing slightly to 4.79% after Fed Governor Christopher Waller signaled he leaned toward holding rates steady rather than hiking (CNBC, 2026). Markets had, by then, moved from pricing further cuts to debating whether the Fed's next move might be a hike, a striking reversal for a Fed whose chair was appointed, in large part, on an expectation of lower rates.</p>
      {RQ2_QUESTIONS.filter((q) => q.id === "rq2-c").map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <p>The section's honest conclusion is that the U.S. data supports a more precise version of the theory than "any independence-related news raises long-term rates": the sharpest, most persistent reaction came specifically from ambiguity about future action, not from the personnel events themselves, which is consistent with the term-premium mechanism identified in the Background section and inconsistent with a simpler story in which markets react mechanically to any headline about Fed politics.</p>
      <Glossary items={GLOSSARIES.rq2} />
    </SectionWrapper>
  );
}

function RQ3Section({ chartInterp, onInterpSubmit, mcState, onMcSubmit }) {
  return (
    <SectionWrapper id="sec-rq3" title="Section 5. What Actually Ends a Credibility Spiral?">
      <p>The third research question turns to comparison: which countries have escaped this kind of spiral quickly, which took years, and what does either path require? Turkey's resolution began in June 2023, when President Erdogan, facing a currency in free fall, made an unusual concession and appointed an orthodox economic team; the new central bank leadership raised the policy rate from 8.5% to 50% by March 2024 and held it there (Euronews, 2025). Argentina's Javier Milei took a different route after taking office in December 2023: rather than raising interest rates aggressively, he froze the central bank's ability to print money for the Treasury and imposed a severe fiscal squeeze, driving monthly inflation from 25.5% in his first full month down to 2.1% by July 2026 (Bilello/INDEC data; Rio Times, 2026). The United Kingdom's 2022 gilt crisis is a case study in speed rather than scale: a single unfunded "mini-budget" sent the 30-year gilt yield spiking about 150 basis points in days, but a new chancellor reversed most of the package within three weeks, and yields fell sharply in response (EFG International, 2022; Yahoo Finance UK, 2022).</p>
      <p>The chart below places all three resolved cases alongside the still-unresolved U.S. pattern, each in its own natural unit.</p>
      <ChartCard chartKey="chart5" title="Chart 5. Peak Stress vs. Most Recent Level, Four Cases (Each in Its Own Unit)"
        tier="FACT" note="Turkey: headline inflation, 85.5% (Oct 2022 peak) to 31.51% (Aug 2026, TradingEconomics/TUIK). Argentina: monthly inflation, 25.5% (Dec 2023) to 2.1% (Jul 2026, Rio Times). UK: 30-yr gilt yield, 5.1% (28 Sept 2022 peak) to 4.34% (17 Oct 2022, after the budget reversal). US: 10-yr Treasury yield, 3.62% (16 Sept 2024) to 4.82% (2 Sept 2026, still rising)."
        interpState={chartInterp.chart5} onInterpSubmit={onInterpSubmit}>
        <CaseDumbbellChart />
      </ChartCard>
      {RQ3_QUESTIONS.filter((q) => q.id === "rq3-b").map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <p>The evidence that a similar resolution is possible for the United States is that every one of the other three cases eventually did resolve, at least partially, and none required abandoning the underlying currency or defaulting on debt; Turkey and Argentina both remain difficult economies, but both moved decisively off their respective peaks. The mechanism, a costly, visible, sustained action that prioritizes inflation control over short-term political comfort, is not unique to any one country's institutions; it is a general pattern this note has now found in three separate cases across two continents and two very different policy toolkits.</p>
      {RQ3_QUESTIONS.filter((q) => q.id === "rq3-c").map((q) => (
        <MultipleChoice key={q.id} q={q} state={mcState[q.id]} onSubmit={onMcSubmit} />
      ))}
      <p>The evidence against expecting a quick U.S. resolution is exactly what the comparison makes visible: nothing resembling Turkey's sustained 41.5-percentage-point rate hike, Argentina's multi-year fiscal freeze, or even the UK's single reversed budget has yet occurred in the United States. Chair Warsh's own July 2026 press conference did the opposite of what ended the UK's crisis: rather than delivering a clear, costly, specific commitment, it delivered ambiguity, which is consistent with why the U.S. pattern, alone among these four cases, is still trending the wrong way.</p>
      <p>The honest section-level conclusion is that every resolved case required a specific, costly, and sustained corrective action, not simply the passage of time or a change in personnel, and that the September 2026 FOMC meeting, days away as of this note's writing, is the first plausible moment for the Warsh Fed to supply exactly that kind of action, or to confirm, by declining to, that the U.S. pattern will keep running the wrong way for longer.</p>
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
            ? "You tend to over-estimate magnitudes; the usual cause is skipping a timing or phase-in factor and treating a steady-state figure as if it applied immediately."
            : "You tend to under-estimate magnitudes; the usual cause is dropping a factor from the chain, most often forgetting to isolate one component of a bridge or spread before comparing it."} This reports directional bias, not confidence, for every numeric question except the one below.</p>
        )}
        {numState["bg-d"] && numState["bg-d"].submitted && numState["bg-d"].confidence && (
          <p><strong>Calibration check</strong> (the only question in this article that captures pre-reveal confidence): on the federal-interest Fermi estimate, you marked your confidence as <strong>{numState["bg-d"].confidence}</strong> and landed {numState["bg-d"].isCorrect ? "within" : "outside"} the stated tolerance band. {numState["bg-d"].confidence === "High" && !numState["bg-d"].isCorrect
            ? "High stated confidence paired with a miss is the classic overconfidence pattern on order-of-magnitude Fermi estimates, where the honest move is usually a wider range, not a more precise-sounding number."
            : numState["bg-d"].confidence !== "High" && numState["bg-d"].isCorrect
              ? "Lower stated confidence paired with a correct estimate suggests you may be underrating your own decomposition reasoning on Fermi-style questions."
              : "Your stated confidence and your result point the same direction here, a reasonably well-calibrated pairing for one data point."}</p>
        )}
      </div>

      <div className="ls-block">
        <h3>Your governing insight</h3>
        <p>You have now seen five charts covering a slope of three rates, a yield bridge, a two-year trajectory with annotated events, a bullet chart of borrowing costs, and a four-country comparison. Before this note reveals its own three takeaways, write the single most non-obvious insight you would defend to a skeptical bond-desk head who has only read the headline that "Trump tried to fire a Fed governor and got a friendlier chair."</p>
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
        <p>Leave central banks and bond yields behind. Meridian HomeGoods (a fictional retailer) announces that its long-tenured Chief Customer Officer, known for prioritizing service quality, will be replaced by an external hire publicly known for aggressive cost-cutting at his last two companies. The company's own weekly-tracked metrics look like this (illustrative dataset built for this exercise, not a reported statistic):</p>
        <table className="snippet-table">
          <thead><tr><th>Period</th><th>Customer trust score (0-100)</th><th>Avg. call-center wait (min)</th><th>90-day churn rate</th></tr></thead>
          <tbody>
            <tr><td>Before announcement</td><td>78</td><td>4.2</td><td>5.1%</td></tr>
            <tr><td>Week of announcement</td><td>71</td><td>4.3</td><td>5.0%</td></tr>
            <tr><td>8 weeks after</td><td>69</td><td>6.8</td><td>6.4%</td></tr>
            <tr><td>20 weeks after (new CCO's first town hall reaffirming service investment)</td><td>74</td><td>5.1</td><td>5.6%</td></tr>
          </tbody>
        </table>
        <p>Write a response with four explicitly labeled parts: (1) a one-sentence so-what thesis about what this pattern means for the company's board deciding whether the leadership transition needs a course correction; (2) the single load-bearing assumption your thesis depends on; (3) the strongest disconfirming evidence in this exact table that would undermine it; (4) a one-line pre-mortem completing "If this fails within 12 months, the most likely reason is ___."</p>
        <textarea className="apply-textarea" value={applyA} onChange={(e) => setApplyA(e.target.value)} placeholder="Label each of the four parts explicitly..." />
        <h3>Apply It (b): Cross-Link a Prior Principle</h3>
        <p>Name one principle from an earlier article in this series, including the three revisited in the Warm-Up, and explain whether it reinforces or conflicts with today's thesis that markets respond more to a leader's demonstrated actions and communication than to a personnel change by itself.</p>
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
  "Political pressure aimed at lowering interest rates can raise the long-term rates that matter most for growth, because long rates price in a risk premium for future policy credibility, not just today's policy rate; a president who wants cheaper 30-year mortgages and cheaper government financing over the next decade needs the market to trust the NEXT decade of policy, not just today's short-term cut.",
  "The sharpest market reaction in the entire 2025-2026 sequence came from words, not from a personnel action: firing or threatening to fire a governor produced a milder, more contained reaction than the new chair's own vague answers at a single press conference, showing that markets are pricing perceived future commitment to fighting inflation, not simply reacting to who currently holds the job.",
  "Every case that fully or partly resolved, Turkey, Argentina, the UK, required a costly, sustained, and credible policy correction, not a change in personnel or tone alone; the U.S. case remains the one still trending the wrong way specifically because it has not yet featured an equivalently costly and sustained correction, which makes the Fed's September 2026 meeting a real, falsifiable test rather than a symbolic one."
];

function ConclusionSection({ mcState, onMcSubmit }) {
  return (
    <SectionWrapper id="sec-conclusion" title="Conclusion">
      <p>The central challenge this note has walked through is that firing or replacing a central-bank official is not, by itself, the mechanism that moves long-term borrowing costs; the mechanism is whether markets believe the resulting leadership will still fight inflation when it becomes politically costly to do so, and the most likely trajectory under partial success, some further political pressure on the Fed, without a clean resolution either way, is that long-term yields stay elevated and volatile around each new data point and each new statement, rather than settling into either a clear improvement or a clear crisis, because no single U.S. action so far has matched the scale of what resolved the three comparison cases.</p>
      <p>For borrowers, the practical implication is immediate and specific: mortgage rates and municipal and corporate borrowing costs are not likely to fall simply because the Fed's short-term rate falls, and anyone timing a major borrowing decision around an assumption of mechanical pass-through is making a bet this note's own evidence argues against. For savers and bond investors, the implication is that the term premium itself, not just the level of yields, is now a signal worth tracking, since its size is a rough, live measure of how much credibility risk the market is currently pricing.</p>
      <p>Institutionally, the deeper implication concerns how much of a central bank's value comes from its decisions versus its perceived commitment to a rule. The Warsh Fed's early conduct suggests that even a chair with real monetary-policy credentials can unsettle markets through ambiguity alone, without taking any concrete action; that is a separate and arguably more dangerous channel than an overtly political appointee taking overtly political actions, because it is harder to litigate, harder to reverse with a single court ruling, and harder for outside observers to even name as the proximate cause. Geopolitically, a durable rise in U.S. term premiums raises the cost of financing a debt load already generating record net interest payments, a self-reinforcing risk in which credibility concerns and fiscal strain can feed each other.</p>
      <p>The most important unresolved question is this: when the Federal Reserve meets on 16 September 2026, will Chair Warsh deliver the kind of clear, costly, sustained action that ended Turkey's, Argentina's, and the UK's versions of this problem, or will another round of ambiguity confirm that the U.S. pattern, alone among the four cases this note has examined, requires a different and perhaps much longer path to resolution?</p>
      <MultipleChoice q={CONCLUSION_QUESTION} state={mcState[CONCLUSION_QUESTION.id]} onSubmit={onMcSubmit} />
    </SectionWrapper>
  );
}

function SourcesSection() {
  return (
    <SectionWrapper id="sec-sources" title="Sources">
      <p>Every figure in this article is tagged FACT (a measured value from the source named), ESTIMATE (derived by stated arithmetic from FACTs), or ILLUSTRATION (disclosed synthetic teaching data). The Apply It exercise's Meridian HomeGoods table is this article's only ILLUSTRATION data, and it is labeled as such where it appears.</p>
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
  { id: "sec-rq1", label: "Q1: Does It Raise Rates?" },
  { id: "sec-rq2", label: "Q2: What Does 2025-26 Show?" },
  { id: "sec-rq3", label: "Q3: What Resolves It?" },
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
  function handleNumSubmit(id, numericValue, isCorrect, signedErrorPct, path, confidence) {
    setNumState((prev) => ({ ...prev, [id]: { submitted: true, numericValue, isCorrect, signedErrorPct, path, confidence } }));
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
      gaps.push("Weakest part -- thesis: no substantive one-sentence so-what about what the trust-score, wait-time, and churn shifts mean for the board's decision. State the consequence, not the observation.");
    }
    if (!assumptionSeg || assumptionSeg.length < 25) {
      gaps.push("Weakest part -- load-bearing assumption: name the single claim that, if false, breaks your thesis. A thesis with no stated assumption cannot be tested.");
    }
    if (!disconfirmSeg || disconfirmSeg.length < 25) {
      gaps.push("Weakest part -- disconfirming evidence: name the observation in the table that would count against your own conclusion, not further support for it (for example, the partial recovery in trust and wait time by week 20, after the new CCO's town hall).");
    }
    if (!premortemSeg || premortemSeg.length < 20) {
      gaps.push("Weakest part -- pre-mortem: complete the sentence 'If this fails within 12 months, the most likely reason is ___' with a specific mechanism, not a general risk.");
    }
    const hasNumber = /\d/.test(raw);
    const hasImplicationVerb = /(should|must|need|require|recommend|investigate|open|expand|pull back|audit|monitor|communicate|reassure)/.test(lower);
    if (raw.length >= 120 && !hasNumber) {
      gaps.push("Climb from observation to implication: your response contains no quantity. A decision-relevant thesis normally carries a magnitude, for example churn rising from 5.1% to 6.4% before partly recovering to 5.6%.");
    }
    if (raw.length >= 120 && !hasImplicationVerb) {
      gaps.push("Climb from observation to implication: your response describes the pattern but does not say what the board should do differently as a result.");
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
          <div className="kicker">Economic Research &middot; No. 27 &middot; Economics &amp; Macro</div>
          <h1>The Independence Paradox: Why Pressuring the Fed Is Raising the Rates It Was Meant to Lower</h1>
          <p className="standfirst">A president tried to remove a Federal Reserve governor and helped pick a successor chair many bond investors see as sympathetic to his demands. The long-term rates that set mortgages and government borrowing costs rose to multi-year highs instead of falling.</p>
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
