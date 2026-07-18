# Sourcing and Citations

## The Core Rule: Fetch Before You Write

Do not write a factual claim, a chart data point, or a question answer key value until you have opened the source and confirmed the number exists there. A citation that does not contain the cited number is a fabricated citation, even if the URL is real.

This rule exists because LLMs generate plausible-sounding figures for well-known companies (latency numbers, team sizes, QPS values, cost estimates) that are often wrong, outdated, or entirely invented. An artifact that teaches incorrect intuitions about real AI systems is worse than no artifact — the reader will carry those intuitions into real product decisions.

## Source Verification Gate

Before writing any quantitative claim:
1. Open the cited source.
2. Confirm the page contains the cited number for the stated unit, period, and population.
3. Note the exact quote or data point in your working notes.
4. If you cannot open the source, do not use the figure — downgrade it to ESTIMATE with stated assumptions, find a verifiable source, or cut the claim.
5. If the source is paywalled, use the publicly available abstract or summary, and note this limitation with `(Source, Year — summary only)`.

## Preferred Sources for Technical Product Topics

### Tier 1: Company Engineering Blogs and Post-Mortems (primary source for technical facts)

These are the highest-quality sources for this skill because they contain first-person accounts of real architectural decisions, production incidents, and engineering tradeoffs.

- Meta Engineering Blog: https://engineering.fb.com
- Anthropic Engineering: https://www.anthropic.com/engineering
- AWS Machine Learning Blog: https://aws.amazon.com/blogs/machine-learning
- OpenAI Index / Research: https://openai.com/index and https://openai.com/research
- LangChain Blog: https://www.langchain.com/blog
- Google Cloud AI Blog: https://cloud.google.com/blog/products/ai-machine-learning
- Microsoft Azure AI Blog: https://azure.microsoft.com/en-us/blog
- Netflix Tech Blog: https://netflixtechblog.com
- Airbnb Engineering: https://medium.com/airbnb-engineering
- Shopify Engineering: https://shopify.engineering
- Stripe Engineering: https://stripe.com/blog/engineering
- Uber Engineering: https://www.uber.com/en-US/blog/engineering
- LinkedIn Engineering: https://engineering.linkedin.com
- Duolingo Engineering: https://blog.duolingo.com/tag/engineering
- Replit Blog: https://blog.replit.com

### Tier 2: LLMOps and ML Case Study Databases (curated collections, use for discovery and cross-referencing)

- Evidently AI ML/LLM System Design Cases: https://www.evidentlyai.com/ml-system-design
- ZenML LLMOps Database: https://www.zenml.io/llmops-database
- ZenML LLMOps in Production: https://www.zenml.io/blog/llmops-in-production-457-case-studies-of-what-actually-works
- GenAI/LLM ML Case Studies (GitHub): https://github.com/themanojdesai/genai-llm-ml-case-studies
- Awesome ML/LLM Case Studies (GitHub): https://github.com/hackThacker/awesome-ml-llm-case-studies
- Curated ML System Design Cases (GitHub): https://github.com/Engineer1999/A-Curated-List-of-ML-System-Design-Case-Studies
- ML Practical Use Cases (GitHub): https://github.com/mallahyari/ml-practical-usecases
- Awesome RAG Production (GitHub): https://github.com/Yigtwxx/Awesome-RAG-Production

### Tier 3: Agent-Specific Resources

- ZenML LLM Agents in Production: https://www.zenml.io/blog/llm-agents-in-production-architectures-challenges-and-best-practices
- Anthropic Building Effective AI Agents: https://www.anthropic.com/engineering/building-effective-agents
- Anthropic Multi-Agent Research System: https://www.anthropic.com/engineering/multi-agent-research-system
- LangChain Top 5 LangGraph Agents in Production: https://www.langchain.com/blog/top-5-langgraph-agents-in-production-2024
- LangChain State of Agent Engineering: https://www.langchain.com/state-of-agent-engineering
- Microsoft Azure Agent Factory: https://azure.microsoft.com/en-us/blog/agent-factory-the-new-era-of-agentic-ai-common-use-cases-and-design-patterns
- AWS Evaluating AI Agents (Amazon): https://aws.amazon.com/blogs/machine-learning/evaluating-ai-agents-real-world-lessons-from-building-agentic-systems-at-amazon
- AWS Cox Automotive Case Study: https://aws.amazon.com/solutions/case-studies/cox-auto-case-study
- Meta Engineering — Unified AI Agents: https://engineering.fb.com/2026/04/16/developer-tools/capacity-efficiency-at-meta-how-unified-ai-agents-optimize-performance-at-hyperscale
- OpenAI Harness Engineering: https://openai.com/index/harness-engineering

### Tier 4: Industry Reports (use for macro context and adoption data, not for company-specific technical claims)

- McKinsey State of AI 2025: https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai
- Deloitte State of AI in the Enterprise 2026: https://www.deloitte.com/us/en/what-we-do/capabilities/applied-artificial-intelligence/content/state-of-ai-in-the-enterprise.html
- Menlo Ventures State of Generative AI 2025: https://menlovc.com/perspective/2025-the-state-of-generative-ai-in-the-enterprise
- Anthropic How Enterprises Are Building AI Agents 2026: https://claude.com/blog/how-enterprises-are-building-ai-agents-in-2026

### Tier 5: Cloud Vendor Case Studies (use with scepticism — treat all performance claims as ESTIMATE until cross-referenced)

Vendor case studies are often more polished than technical. Apply additional scrutiny: vendor-reported metrics (cost savings, productivity improvements, accuracy gains) are frequently self-reported by the customer and not independently verified. Use these sources to identify that a deployment exists and to find the company name, use case, and rough scope — then verify technical details against the company's own engineering blog if available.

- OpenAI Customer Stories: https://openai.com/business/customer-stories
- Anthropic / Claude Customer Stories: https://claude.com/customers
- Google Cloud Real-World GenAI Use Cases: https://cloud.google.com/transform/101-real-world-generative-ai-use-cases-from-industry-leaders
- AWS Generative AI Customer Stories: https://aws.amazon.com/ai/generative-ai/customers
- Salesforce Agentforce Customer Stories: https://www.salesforce.com/agentforce/customer-stories

## Data Provenance Tiers

Every numeric value in prose, a chart, or a question answer key is exactly one of three tiers and must be labeled as such in the artifact:

**FACT:** A real measured value from a citable source. Carries an inline `(Source, Year)` and appears in the source list. Never alter a sourced figure to make a chart cleaner. Report at the source's stated precision — do not round a figure reported as 47ms to "about 50ms" without labeling it ESTIMATE.

**ESTIMATE:** A value derived by arithmetic or stated assumption from FACTs. The inputs must themselves be FACTs or clearly stated assumptions. The derivation must be shown in the article's working notes and in any chart note. Label: "Modeled from: [inputs]. Not a reported statistic." Round ESTIMATE values coarsely (e.g., "~$90K/month," not "$91,240/month") so they do not borrow the precision of a measurement.

**ILLUSTRATION:** Synthetic teaching values that resemble realistic patterns but are not measured. Permitted only for structural diagrams and conceptual teaching charts (e.g., a generic agent topology diagram, a hypothetical latency curve showing the shape of a tradeoff). Label: "Illustrative values — not reported statistics." **ILLUSTRATION is never permitted in scored question answer keys.** Every answer key value must be FACT or ESTIMATE.

## The No-Invention Rule

Do not invent or hallucinate:
- QPS, TPS, or throughput figures for real companies
- Team sizes or headcounts
- Cost-per-query or infrastructure costs
- Model accuracy or benchmark scores not reported by the company
- Latency figures not reported by the company
- Specific architectural details not documented in a citable source

If a figure is needed for a chart or a question but cannot be verified, either:
(a) Build the chart with ESTIMATE values derived from industry benchmarks with stated assumptions, labeled clearly, or
(b) Use ILLUSTRATION values and design the question around the structural pattern rather than the specific magnitude.

For Fermi estimation questions, the answer key must be derivable by arithmetic from stated FACT anchors. If the anchors cannot be verified, redesign the question to use verifiable anchors.

## Citation Standard

- Inline citation format in prose: `(Source, Year)`.
- Every source in the article must appear in the artifact's source list with the source name, URL, and a one-line description of what it was used for.
- Prefer the most recent available data for any metric that changes over time (adoption rates, market sizes, model performance). State the data's reference period. Flag in prose when the most recent available figure is more than 24 months old.
- Do not use a secondary article's paraphrase of a statistic when the primary source is accessible. Example: do not cite "according to a McKinsey summary, X% of companies have deployed AI" when the McKinsey original report is available and cites the figure directly.

## Research Readiness Gate

Do not write the article until every planned section has named evidence. For each planned FACT, confirm: (1) the source URL resolves, (2) the page contains the cited number for the stated unit, period, and population, and (3) there is no conflicting figure from a more authoritative source. If a section cannot be grounded in verifiable facts, revise the research question or the case selection before drafting.
