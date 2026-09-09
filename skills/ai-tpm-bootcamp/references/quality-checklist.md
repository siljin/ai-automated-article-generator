# Quality Checklist

Run this checklist before delivering any session's artifact.

## Case Engine

- [ ] The stage sequence matches `case-engine.md` exactly for the case type (7 stages standard, 10 for Capstone).
- [ ] Every stage that closed did so via either a valid advance condition or a forcing device — never left ambiguously open.
- [ ] No closed stage was reopened; state only moved forward.
- [ ] The Recommendation stage ended the case (for Capstone, this comes after both Diagnose/Decision/Curveball loops — Capstone has a single Recommendation stage, not two).
- [ ] Turn caps used match the case's phase (see `case-engine.md` → Phase-Specific Tuning), not a different phase's caps.
- [ ] If a forcing device fired, the in-fiction line matches the stage's cataloged device (or a clear variant of it), not a generic "time's up."

## Curriculum and Rotation

- [ ] The case topic was not repeated within the current phase unless the phase's pool was already exhausted (check `progress-ledger.md`'s derivation rules).
- [ ] The phase-slug and case-slug used in the artifact directory name match `curriculum.md`'s slug convention.

## Rubric and Scoring

- [ ] All four dimensions were scored 1-4, each with a justification tied to specifics from this case (not a generic restatement of the rubric anchor text).
- [ ] The average was computed correctly from the four scores.
- [ ] Graduation status was computed correctly per `progress-ledger.md`'s derivation rules (3 consecutive in-phase rows ≥3.00 average).
- [ ] If a manual override was used, it is noted in the ledger row.
- [ ] The next-recommended focus names a specific dimension (if not graduating) or the next phase (if graduating).

## Artifact Structure (Case File, Not a Graded App)

- [ ] No client-side gating/grading JavaScript was added — the artifact only renders `CASE`, `STAGES`, `CURRENT_STAGE_INDEX`, `EXHIBITS`, and `SCORECARD`.
- [ ] Every exhibit's exact values are printed in a table — never chart-only.
- [ ] Charts (where used) are wrapped in a fixed-height `ResponsiveContainer` and only used for naturally trend/comparison exhibits.
- [ ] `index.html`'s inlined script matches `app.js` byte-for-byte in logic.
- [ ] No `<script type="text/babel" src="app.js">` and no leftover `CASE:` placeholder comments or `_PLACEHOLDER` strings remain.
- [ ] `prop-types@15.8.1` loaded before Recharts; Recharts URL is `Recharts.js`, not `Recharts.min.js`.

## Functional Validation (interactive — mandatory before delivery)

This section is a hard gate. An artifact that has not actually been opened
and exercised is not done. Do not claim it is verified if you could not run
these checks — say so instead.

- [ ] The app code transpiles with no syntax errors (esbuild/Babel check on the filled JSX).
- [ ] The built `index.html` opens in a real browser and mounts — `#root` is populated, not blank, and the console shows no errors on load.
- [ ] The stage tracker renders all stages; the pill at `CURRENT_STAGE_INDEX` shows the active style, earlier pills show the done style, later pills show the pending style.
- [ ] Every exhibit renders its table; any chart exhibit renders visible data and the table beneath it shows the same values.
- [ ] Once `SCORECARD` is populated, the Debrief section renders the dimension table, average, graduation status, weakest dimension, and next-recommended focus with no missing/undefined values.
- [ ] No console errors are produced while the page is open.
- [ ] If a live browser was not available, this is stated explicitly in the delivery note, and the artifact is NOT reported as verified.

## Ledger

- [ ] `progress-ledger.md` has one new row for this session in the documented column order, with Avg computed correctly.
