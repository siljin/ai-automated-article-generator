# Sourcing and Citations

## Goal

Ground the artifact in the real-world debate before writing. Use recent, semantically matched articles to understand framing, then verify factual claims with citeable primary or high-quality secondary sources.

## Source Discovery

Before choosing the final thesis, search the user's topic plus outlet names and domain terms. Prioritize:

- Popular and business sources: The Economist, New York Times, Washington Post, Wall Street Journal, Financial Times, Bloomberg, Business Insider, STAT, Axios, and similar reputable outlets.
- Consulting and market sources: McKinsey, BCG, Bain, Deloitte, PwC, CB Insights, PitchBook, Rock Health, Gartner, IDC, and industry reports when relevant.
- Academic and science sources: JAMA, NEJM, Health Affairs, Nature, Science, The Lancet, BMJ, NBER, Brookings, IMF, World Bank, OECD, Federal Reserve, and government agencies.
- Healthcare AI–focused sources: npj Digital Medicine (Nature's peer-reviewed journal dedicated to digital health and clinical AI), plus outlets like Fierce Healthcare, MedCity News, and Healthcare IT News for industry/deployment coverage.

Use these sources to identify:

- The live debate and current framing.
- Named actors, institutions, companies, policies, and examples.
- Recent developments within the past 12 months.
- Risks, challenges, and forward-looking opportunities.

## Data Requirements

Gather enough evidence before writing:

- Current quantitative data for the central paradox: GDP, spending, market shares, regulatory counts, adoption rates, population, productivity, prices, or relevant equivalents.
- Historical trend data for at least one decade when available, or the longest credible period if the market is new.
- Comparable benchmark data for 3 to 5 peer units: countries, firms, sectors, products, specialties, regions, or institutions.
- At least one structural, institutional, or policy factor that explains the paradox.
- At least one forward-looking risk, challenge, or opportunity.

## Citation Standard

- Every factual statistic, institutional example, market claim, and policy claim must be traceable to a citeable source.
- Prefer primary sources for statistics when available: government datasets, regulator lists, company filings, peer-reviewed papers, official releases, and recognized data portals.
- Use secondary articles for framing, narrative context, and examples. Do not rely on a secondary article for a number when the primary source is available.
- Inline citation format in prose: `(Source, Year)`.
- Include a source list in the artifact with source names and links.
- Do not invent data, article claims, adoption rates, institutional examples, or citations.
- Confirm every source URL resolves to the cited content at build time (no 404, login-wall stub, or unrelated redirect), and prefer the most recent release. For any time-sensitive figure (adoption rate, market size, price, headcount), state the data's reference period and flag in prose when the latest available figure is more than 24 months old.

## Data Provenance Tiers

Every numeric value in prose, a chart, or a question answer key is exactly one of three tiers, and must be labeled as such in the artifact:

- FACT: a real measured value from a citeable source. Carries an inline `(Source, Year)` and appears in the source list. Never alter a sourced figure to make a chart cleaner.
- ESTIMATE: a value the author derives by arithmetic or stated assumption from FACTs, such as a modeled ROI bridge. The inputs must themselves be FACTs or clearly stated assumptions, and the chart note must say it is modeled, not a reported statistic.
- ILLUSTRATION: synthetic teaching values that resemble realistic patterns but are not measured, such as a workflow-fit scoring map. Permitted only to teach a pattern or structure, never for a headline claim, and the chart note must say the values are illustrative, not reported statistics.

"Do not invent data" means never present an ESTIMATE or ILLUSTRATION as if it were a FACT. Disclosed illustration is allowed; undisclosed invention is forbidden. Match precision to tier: report a FACT at its source's precision, and round ESTIMATE and ILLUSTRATION values coarsely (for example "about $90,000," not "$90,000") so derived or synthetic numbers never borrow the authority of a measurement.

## Research Readiness Gate

Do not write the article until every planned section has named evidence. For every FACT, open the cited source and confirm the page actually states that number for the stated unit, period, and population before using it. If you cannot open the source or cannot find the number, do not use the figure: downgrade it to an ESTIMATE with stated assumptions, find a verifiable source, or cut the claim. A citation that does not contain the cited number is a fabricated citation even if the URL is real.
