# Daily Case Practice — context for Claude

This folder holds everything for Siljin's daily consulting-case-interview practice habit: building muscle memory for solving MBB-style business cases, with real-world business insight along the way.

## What's here

- `case_tracker.md` — log of every case generated (date, industry, case type, **topic**, difficulty, title). This is the source of truth for rotation — always read it before generating a new case, and always append to it after. The topic column tracks the specific real-world dynamic a case was grounded in (e.g. "ambient AI clinical scribes"); a topic is on a 14-day cooldown before it can be reused, but repeating it after the cooldown is encouraged since repetition on a topic builds muscle memory.
- `casebook.pdf` — a real 24-case MBB-style casebook (McKinsey/Bain/BCG-inspired). Use it as a reference for **variety and structure**, not as source content to copy:
  - Its table of contents (page 2-4) lists 24 cases with industry, difficulty, and page number — skim this to see the spread of industries and case types (profitability, market entry, pricing, M&A, market sizing, operations) a real prep program uses, and to spot case types the tracker hasn't touched recently.
  - Individual cases in the PDF show how a case's flow is structured (prompt → clarifying questions → framework → interviewer-driven questions → brainstorm → math → recommendation) — useful to sanity-check that a generated case's framework and question flow feel authentic for its case type.
  - Never lift a company name, scenario, or numbers directly from the casebook — always invent an original fictional company, grounded instead in a real, current business dynamic found via web search.
- `cases/` — one HTML file per generated case, kept as a local record alongside the corresponding Cowork artifact.
- `skill/` — local copy of the `daily-case-practice` skill source (`SKILL.md` + `references/`). The actual skill that triggers in conversation is installed separately via Settings > Capabilities (Claude cannot install or activate a skill directly from a session) — this folder is the versioned source so it can be edited and re-packaged when the workflow needs to change. If the installed skill and this folder ever drift, treat this folder as the intended version and offer to repackage and reinstall.

## How to work in this folder

When asked for a new case, follow the `daily-case-practice` skill's workflow (installed skill, or `skill/SKILL.md` here if the skill isn't triggering for some reason): check the tracker, pick industry/case-type/difficulty for variety (cross-referencing the casebook's spread), ground the scenario in something real via web search, build the interactive HTML from `skill/references/case_template.html`, save it to `cases/`, publish it as a Cowork artifact, and log it in the tracker.

Goal, for context: ~55-60% of cases should be AI or healthcare, with the rest rotating through consumer, manufacturing, banking, retail, energy, TMT, etc. Difficulty and case type should vary day to day rather than settle into a pattern. Every case's "answer" sections should stay gated behind the user's own attempt — the point is active practice, not passive reading.
