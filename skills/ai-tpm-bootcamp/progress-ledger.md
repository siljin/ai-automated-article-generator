# Progress Ledger

Cohort log for the ai-tpm-bootcamp skill. Read the last 4-6 rows before
picking a phase/topic for a new session, and before computing graduation
status. One session (one completed case) per row. No separate state file —
current phase, topics already used, and graduation status are all derived
from this table, the same way `pm-interview-coach`'s rotation is derived
from its own ledger (see that skill's `concept-rotation.md`).

Resolving the spec's open item on ledger-schema consistency: this format
deliberately mirrors `pm-interview-coach`'s `progress-ledger.md` pattern —
append-only, one row per session, no separate state file, all rotation/phase
state derived by reading the table rather than tracked out-of-band. The
columns differ because the domains differ: `pm-interview-coach` tracks
concept rotation (Concept | Category | Company | Industry | Difficulty), this
skill tracks the 4-dimension rubric plus phase gating instead (Structuring |
Technical Judgment | Reasoning Under Pressure | Communication | Avg |
Graduated?). Same append-only, derived-state pattern; different columns for a
different rubric and a phase-gated (not purely rotating) curriculum.

Format: `Date | Phase | Case Topic | Structuring | Technical Judgment | Reasoning Under Pressure | Communication | Avg | Graduated? | Notes`

- **Avg** = average of the four score columns for that row, to 2 decimals.
- **Graduated?** = `Yes` only on the row that completes 3 consecutive in-phase rows each with Avg ≥ 3.00; otherwise blank. A row with `Yes` means the *next* row should be the first case of the next phase (Foundations → Tradeoffs → Ambiguity → Executive-pressure → Capstone; Capstone has no next phase — further Capstone graduations are just logged, no phase change).
- **Notes** — free text: reshuffle markers (e.g. "reshuffled — pool exhausted"), manual overrides (e.g. "override — advanced manually, avg was 2.50"), or anything else future sessions should know.

## Derivation Rules

- **Current phase** = the Phase value of the most recent row, unless that row's Graduated? = `Yes`, in which case current phase = the next phase in the Section 4 order. If the ledger is empty, current phase = Foundations.
- **Topics already used this phase** = the distinct Case Topic values among the most recent consecutive rows that share the current phase, read backward until either the table start or a graduation/reshuffle boundary is hit. Once every topic in that phase's `curriculum.md` pool appears in that span, the pool is exhausted — the next pick reshuffles (see curriculum.md's rotation rules) and the chosen row's Notes should say so.
- **Weakest dimension** (for gating's "target the weakest dimension" rule) = the lowest-scoring column on the most recent row, ties broken left-to-right in the column order above (Structuring first).
- **Graduation check** = look at the most recent row and the two immediately before it (if all three share the current phase): if all three have Avg ≥ 3.00, this session's row gets `Graduated? = Yes`.

## Session Log

| Date | Phase | Case Topic | Structuring | Technical Judgment | Reasoning Under Pressure | Communication | Avg | Graduated? | Notes |
|---|---|---|---|---|---|---|---|---|---|
