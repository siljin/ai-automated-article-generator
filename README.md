# AI Automated Article Generator

Automation for two recurring content habits: daily research articles and daily case-interview practice. Each module pairs a Claude skill with the content it produces.

## Structure

```
articles/                  Generated interactive research articles
  economic-research/       ER-## series — economics & markets deep dives
  product-ai/              PR-## series — AI product strategy deep dives

daily-case-practice/       MBB-style case interview practice
  CLAUDE.md                Context and workflow for this module
  case_tracker.md           Log of every case generated (source of truth for rotation)
  casebook.pdf              Reference casebook for variety/structure
  cases/                   Generated case HTML files
  skill/                   Versioned source of the daily-case-practice skill

skills/
  technical-product-intelligence/
    SKILL.md               Skill definition for generating research articles
    topic-queue.md          Queue of upcoming article topics
    progress-ledger.md      Cumulative memory of past articles (one line per article)
    cross-artifact-state.json
    references/             Supporting guides (structure, sourcing, charts, QA)
```

## How it fits together

- `skills/technical-product-intelligence` drives everything under `articles/`.
- `daily-case-practice/skill` drives everything under `daily-case-practice/cases/`.
- Each skill reads its own tracker/ledger before generating new content and appends to it afterward — that state lives next to the skill that owns it.
