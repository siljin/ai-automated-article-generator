# Topic Queue

Each day's article is drawn from the next unchecked entry. When an article is generated, mark it `[x]` and record the output slug.

Format per entry:
```
- [ ] Type N | Company | Topic description | Primary source URL
```

Status: `[ ]` pending · `[x]` done

---

## Phase 0 — Generate First (prerequisite for all others)

- [x] Phase 0 | Shopify | AI Product Lifecycle Spine — how Sidekick moved from rule-based assistant to foundation-model-native product across all seven lifecycle phases | https://shopify.engineering → ai-product-lifecycle-spine/index.html

---

## Type 1 — AI Feasibility & Technical Scoping

- [x] Type 1 | Google | When not to use AI — Google's internal ML readiness framework and the feasibility criteria that gate production ML features | https://cloud.google.com/blog/products/ai-machine-learning → when-not-to-use-ai/index.html
- [x] Type 1 | Stripe | How Stripe scopes v1 AI features under probabilistic uncertainty — data readiness audits before model selection | https://stripe.com/blog/engineering → stripe-data-readiness-before-model-selection/index.html
- [x] Type 1 | Airbnb | Airbnb's ML feasibility process — how the team decides when a problem warrants a model vs a heuristic | https://medium.com/airbnb-engineering → PR-05-airbnb-model-vs-heuristic/index.html

---

## Type 2 — AI Product Teardown

- [x] Type 2 | Cursor | How Cursor actually works — multi-model routing, codebase indexing, context management, and the PM tradeoffs behind the editor | https://www.evidentlyai.com/ml-system-design → PR-06-cursor-architecture-teardown/index.html
- [ ] Type 2 | GitHub | GitHub Copilot's architecture — prompt construction, telemetry-driven iteration, and the product decisions that shaped the suggestion UX | https://github.blog/engineering
- [ ] Type 2 | Perplexity AI | Perplexity's answer engine — real-time retrieval pipeline, citation grounding, and the latency vs quality tradeoff at query time | https://www.evidentlyai.com/ml-system-design
- [ ] Type 2 | Notion | Notion AI — how Notion integrated generative features into a structured document product without breaking the core editing mental model | https://www.notion.so/blog/notion-ai
- [ ] Type 2 | Replit | Replit Agent — agentic code execution, sandboxing, error recovery, and the product surface for non-developers running AI-generated code | https://blog.replit.com

---

## Type 3 — Agentic System Architecture

- [ ] Type 3 | Meta | Meta's unified AI agents for infrastructure optimization — reusable agent skills, automated PR generation, and performance regression detection at hyperscale | https://engineering.fb.com/2026/04/16/developer-tools/capacity-efficiency-at-meta-how-unified-ai-agents-optimize-performance-at-hyperscale
- [ ] Type 3 | Cox Automotive | Cox Automotive's 17 enterprise AI agent solutions in under a year using Amazon Bedrock AgentCore — architecture, rollout, and reliability | https://aws.amazon.com/solutions/case-studies/cox-auto-case-study
- [ ] Type 3 | Amazon | How Amazon builds and evaluates agentic systems — intent detection, tool selection accuracy, multi-turn function calling, and production reliability lessons | https://aws.amazon.com/blogs/machine-learning/evaluating-ai-agents-real-world-lessons-from-building-agentic-systems-at-amazon
- [ ] Type 3 | OpenAI | OpenAI Harness Engineering — agent-first software development with Codex, CI integration, test generation, observability, and feedback loops | https://openai.com/index/harness-engineering
- [ ] Type 3 | LangChain | Top 5 LangGraph agents in production — Replit, LinkedIn, Uber, Elastic, AppFolio: how controllable vertical agents are architected differently from general-purpose agents | https://www.langchain.com/blog/top-5-langgraph-agents-in-production-2024
- [ ] Type 3 | Anthropic | Anthropic's multi-agent research system — agent coordination, tool design, prompt engineering, evaluation, and the path from prototype to production | https://www.anthropic.com/engineering/multi-agent-research-system

---

## Type 4 — AI-Native System Design

- [ ] Type 4 | Multiple | RAG pipeline design at production scale — chunking strategies, embedding model selection, re-ranking, and the retrieval precision vs recall tradeoff as corpus grows | https://github.com/Yigtwxx/Awesome-RAG-Production
- [ ] Type 4 | Multiple | Vector database selection and design — how the choice of indexing strategy (HNSW vs IVF) affects latency, recall, and cost at different scales | https://www.evidentlyai.com/ml-system-design
- [ ] Type 4 | Together AI | LLM serving infrastructure — batching strategies, KV cache management, speculative decoding, and the cost-per-token optimization curve | https://www.zenml.io/llmops-database
- [ ] Type 4 | Multiple | Streaming AI responses — how token-by-token streaming changes frontend architecture, perceived latency, and the UX design space | https://www.evidentlyai.com/ml-system-design
- [ ] Type 4 | Multiple | Multimodal AI pipeline design — how adding vision or audio to an LLM pipeline changes retrieval, latency budgets, and cost structure | https://github.com/themanojdesai/genai-llm-ml-case-studies

---

## Type 5 — AI Product Sense

- [ ] Type 5 | Spotify | Spotify AI DJ — how the product went from playlist algorithm to personality-driven DJ, and the model + product decisions that drove adoption | https://engineering.atspotify.com
- [ ] Type 5 | Duolingo | Duolingo's AI tutor — v1 failures, iteration driven by learning outcome data, and how the product team constrained model freedom to improve pedagogical outcomes | https://blog.duolingo.com/tag/engineering
- [ ] Type 5 | Airbnb | Airbnb smart pricing — how the pricing recommendation feature evolved, what the v1 PM got wrong, and the metric redesign that followed | https://medium.com/airbnb-engineering
- [ ] Type 5 | LinkedIn | LinkedIn AI features — how the team introduced generative features into a professional context where trust and tone errors have career consequences | https://engineering.linkedin.com
- [ ] Type 5 | Shopify | Shopify Sidekick — the product sense decisions behind an AI assistant for merchants: scope constraints, v1 limitations, and what "good enough" looks like for a non-developer user | https://shopify.engineering

---

## Type 6 — AI Metrics & Evaluation Framework

- [ ] Type 6 | Amazon | Amazon's agent evaluation system — intent detection accuracy, tool selection accuracy, tool parameter accuracy, multi-turn coherence, and how metrics were tied to production reliability | https://aws.amazon.com/blogs/machine-learning/evaluating-ai-agents-real-world-lessons-from-building-agentic-systems-at-amazon
- [ ] Type 6 | Anthropic | How Anthropic evaluates Claude — the eval stack from automated benchmarks to human preference rating to red-teaming, and how the PM and safety teams intersect | https://www.anthropic.com/engineering
- [ ] Type 6 | Multiple | RAGAS and the RAG evaluation problem — why retrieval-augmented generation needs its own eval framework, what the metrics are, and how companies use them in CI | https://github.com/Yigtwxx/Awesome-RAG-Production
- [ ] Type 6 | Google | Google AI search quality — how Google measures AI Overviews quality and the challenge of evaluating generative search against traditional precision/recall | https://cloud.google.com/blog/products/ai-machine-learning
- [ ] Type 6 | Multiple | LLM evaluation in production — how teams at multiple companies run evals as part of their CI/CD pipeline, what they catch, and what they miss | https://www.zenml.io/blog/llmops-in-production-457-case-studies-of-what-actually-works

---

## Type 7 — Product Psychology × AI

- [ ] Type 7 | Multiple | Automation bias in AI copilots — evidence from real deployments of code assistants and writing tools where users accepted AI output without review, and the design interventions that reduced it | https://www.evidentlyai.com/ml-system-design
- [ ] Type 7 | Multiple | Trust calibration in AI recommendations — how users learn to trust AI suggestions and what product design does to accelerate or break that process | https://www.zenml.io/llmops-database
- [ ] Type 7 | Multiple | LLM hallucination disclosure UX — how different transparency designs (confidence indicators, source citations, disclaimers) affect user behavior and trust | https://www.evidentlyai.com/ml-system-design
- [ ] Type 7 | Multiple | Notification design in AI assistants — how proactive AI actions (unprompted suggestions, automated completions) are received differently depending on timing, framing, and reversibility | https://www.evidentlyai.com/ml-system-design

---

## Type 8 — AI Incident & Recovery

- [ ] Type 8 | Multiple | RAG retrieval collapse — documented cases where a vector similarity threshold tuned for one query distribution caused retrieval to fail silently on a new distribution | https://github.com/Yigtwxx/Awesome-RAG-Production
- [ ] Type 8 | Multiple | Agent loop failures in production — real incidents where an AI agent entered a tool-call loop, and what the monitoring blind spots were that allowed it | https://www.zenml.io/blog/llm-agents-in-production-architectures-challenges-and-best-practices
- [ ] Type 8 | Multiple | Model regression without detection — cases where a model update degraded quality on a specific user segment that wasn't covered in the offline eval set | https://www.zenml.io/blog/llmops-in-production-457-case-studies-of-what-actually-works
- [ ] Type 8 | Multiple | Context window failures at scale — incidents where systems hit context length limits unexpectedly in multi-turn or long-document workflows, and the architectural changes that followed | https://www.evidentlyai.com/ml-system-design
- [ ] Type 8 | Multiple | Eval blind spots that reached production — real post-mortems on AI quality failures that passed automated evals but failed for real users | https://github.com/themanojdesai/genai-llm-ml-case-studies

---

## Type 9 — CTO Scaling Playbook

- [ ] Type 9 | OpenAI | OpenAI infrastructure scaling — how the engineering org scaled compute, model serving, and team structure from GPT-3 to GPT-4 deployment | https://openai.com/research
- [ ] Type 9 | Anthropic | Anthropic's engineering leadership model — how the team structures AI safety review into the shipping cadence without halting velocity | https://www.anthropic.com/engineering
- [ ] Type 9 | Shopify | Shopify's AI tooling strategy — the build vs buy decisions, platform abstraction choices, and the org design behind scaling AI across product teams | https://shopify.engineering
- [ ] Type 9 | Microsoft | Microsoft's 1,000+ AI customer transformations — the engineering leadership patterns behind enterprise AI scaling at Microsoft's velocity | https://azure.microsoft.com/en-us/blog/agent-factory-the-new-era-of-agentic-ai-common-use-cases-and-design-patterns
- [ ] Type 9 | Multiple | Centralize vs embed: how engineering leaders decide whether to build a central ML platform team or embed ML engineers in product teams — and what signals should trigger a reorganization | https://www.zenml.io/blog/llmops-in-production-457-case-studies-of-what-actually-works
