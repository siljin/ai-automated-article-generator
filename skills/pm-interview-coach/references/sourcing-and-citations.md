# Sourcing and Citations

## The Core Rule: Fetch Before You Write

Do not write a factual claim, an exhibit value, or a reference-answer number in the Observe module until you have opened the source and confirmed the number exists there. A citation that does not contain the cited number is a fabricated citation, even if the URL is real.

This matters because an LLM will generate plausible-sounding figures for well-known companies (user counts, revenue, segment sizes) that are wrong, outdated, or invented outright. A PM case study that teaches the wrong intuition about a real company's numbers is worse than no case study — the learner will carry that bad intuition into a real interview or a real job.

## Source Verification Gate

Before writing any quantitative claim in the Observe module:
1. Open the cited source (via WebSearch/WebFetch).
2. Confirm the page or search result contains the cited number for the stated unit and reporting period.
3. Note the exact figure and period in your working notes before drafting prose from memory.
4. If you cannot verify a figure, do not use it as fact — downgrade to ESTIMATE with shown arithmetic, or flag as ASSUMPTION for teaching, or cut the claim.
5. If a company doesn't disclose something the case needs (e.g. exact user-segment sizes — almost never publicly reported), do not guess silently. Say so explicitly and use ASSUMPTION.

## Preferred Sources

- **Tier 1 — primary company sources:** SEC filings (10-K/10-Q/8-K via EDGAR), investor-relations shareholder letters and earnings releases, official company blogs, product-team engineering/product blogs.
- **Tier 2 — reputable reporting:** established financial/tech press covering earnings or product launches (e.g. wire-service and major outlet earnings coverage).
- **Tier 3 — industry/strategy write-ups:** company-strategy analyses and market-research summaries that themselves cite primary sources — useful for framing and competitive context, cross-check any specific number they state against a primary source before treating it as FACT.
- **Tier 4 — third-party estimators (traffic tools, aggregator blogs):** useful for directional competitive context only (e.g. "roughly comparable site-traffic scale"). Never treat these as FACT-tier for anything the case scores the learner on; label the data point as an estimate from a named third-party tool.

## Data Provenance Tiers

Every specific number that appears in the Observe module is exactly one of three tiers, and the artifact must visibly tag which one:

**FACT** — a real measured/reported value from a citable source. Carries an inline citation (source name + link in the footer/source list) and the reporting period. Never round a precise reported figure without saying so.

**ESTIMATE** — a value derived by arithmetic from FACTs, with the derivation shown (e.g. "MAU × conversion × ARPU = MRR"). Round coarsely so it doesn't borrow the precision of a measurement.

**ASSUMPTION** — a hypothetical value created for teaching purposes because the real breakdown isn't publicly disclosed (this is the PM-coach equivalent of product-ai's ILLUSTRATION tier). Must be visibly labeled, e.g. "not disclosed by the company — assumption for teaching." **An ASSUMPTION must never be used as if it were a reported fact, and the artifact must never imply access to confidential company information.**

## The No-Invention Rule

Do not invent, for a real company: exact user-segment sizes or splits, internal conversion rates by segment, unpublished revenue breakdowns by product line, or internal strategic rationale not stated in a citable source. If the concept genuinely requires segment-level numbers a company doesn't disclose (true for almost every user-segmentation case), build the walkthrough on top of verified aggregate facts (total users, total revenue, disclosed strategic priorities) and clearly mark the segment-level breakdown as ASSUMPTION.

## Citation Standard

- Every FACT and ESTIMATE claim in the Observe module cites its source in the artifact's footer/source list: source name, URL, and the reporting period it covers.
- Cite at least two credible sources per Observe module.
- Prefer the most recent disclosed figures; state the reporting period explicitly (e.g. "Q1 FY2026, quarter ended March 31, 2026").
- Distinguish, in the artifact's own text, verified facts from reasonable inferences (a conclusion that follows from facts but isn't itself stated) from ASSUMPTIONs — three visibly different things, not one blended narrative.

## Research Readiness Gate

Do not draft the Observe module until every planned FACT has been verified per the gate above. If a chosen concept/company pairing can't be grounded in enough verifiable facts to teach the framework meaningfully, either find better sources or pick a different company before drafting.
