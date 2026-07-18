# AI Automated Article Generator

Automation for two recurring content habits: daily research articles and daily case-interview practice. Each module pairs a Claude skill with the content it produces.

## Structure

```
articles/                  Generated interactive research articles
  economic-research/       ER-## series — economics & markets deep dives
  product-ai/              PR-## series — AI product strategy deep dives

daily-case-practice/       MBB-style case interview practice content
  CLAUDE.md                Context and workflow for this module
  case_tracker.md          Log of every case generated (source of truth for rotation)
  casebook.pdf             Reference casebook for variety/structure
  cases/                   Generated case HTML files

skills/                    Every skill definition lives here, one folder per skill
  economic-research/
    SKILL.md               Skill definition for the ER-## series
    progress-ledger.md     Cumulative memory of past ER articles
    references/            Supporting guides (structure, sourcing, charts, QA)
  product-ai/
    SKILL.md               Skill definition for the PR-## series
    progress-ledger.md     Cumulative memory of past PR articles
    topic-queue.md         Queue of upcoming PR topics
    cross-artifact-state.json
    references/            Supporting guides (structure, sourcing, charts, QA)
  daily-case-practice/
    SKILL.md               Skill definition for daily case generation
    references/            case_template.html, case_tracker_template.md
```

## How it fits together

- `skills/economic-research` drives everything under `articles/economic-research/`.
- `skills/product-ai` drives everything under `articles/product-ai/`.
- `skills/daily-case-practice` drives everything under `daily-case-practice/cases/` (this skill is also installed separately via Settings > Capabilities — this folder is the versioned source of truth; if they drift, treat this folder as authoritative and repackage/reinstall).
- Each skill reads its own tracker/ledger before generating new content and appends to it afterward — that state lives next to the skill that owns it, never shared or loose at `skills/` root.
