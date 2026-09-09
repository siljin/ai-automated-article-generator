# Artifact Generator

## Reuse vs. Rewrite vs. `pm-interview-coach`

Resolving the spec's open item on artifact-generator reuse: the CDN/script-
loading section (Direct-File-Open Script Rule below) is reused verbatim from
`pm-interview-coach`'s `artifact-generator.md` — same package versions, same
`file://`-safe inlining rules, same gotchas (Recharts URL, prop-types load
order). Everything else — the state model and component tree — is a full
rewrite, not an adaptation, because this artifact has no client-side grading:
there is no `module` tab switcher, no per-stage `{ inputValue, submitted,
revealed }` state, no `clarifyLog`, no learner-entered `rubricScores`, and no
Cowork semantic-grading bridge. Progression here is driven entirely by chat
editing plain constants (`CURRENT_STAGE_INDEX`, `EXHIBITS`, `SCORECARD`)
between turns, not by the candidate clicking reveal buttons.

## Output Rule

Build one single self-contained HTML file per session. Never output the
case as markdown prose in chat — the HTML file is the case-file deliverable,
and chat is the live interviewer running on top of it (spec §3).

Unlike `pm-interview-coach`'s Practice module, this artifact has **no
client-side gating or grading JavaScript**. It is a passive rendered
document: case brief, exhibits, a stage tracker, and (once the case ends) a
scorecard. All dynamism — the actual case-playing — happens in chat, not in
the artifact. Do not build reveal buttons, input boxes, or scoring logic
into the HTML; there is nothing for the candidate to click.

## File Structure

```text
articles/ai-tpm-bootcamp/
  BC-##-<phase-slug>-<case-slug>/
    index.html       ← the deliverable: everything inlined
    app.js            ← readable source copy of the React app
```

`##` is sequential and chronological: scan `articles/ai-tpm-bootcamp/` for
the highest existing `BC-##-*` folder and increment by one. Never reuse or
renumber. See `curriculum.md` for how `<phase-slug>` and `<case-slug>` are
derived.

## Direct-File-Open Script Rule

Identical dependency pattern to `pm-interview-coach` and `product-ai`,
proven to work under `file://`:

```html
<script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
<script crossorigin src="https://unpkg.com/prop-types@15.8.1/prop-types.min.js"></script>
<script crossorigin src="https://unpkg.com/recharts@2.12.7/umd/Recharts.js"></script>
<script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"></script>
<script type="text/babel" data-presets="env,react">
  /* inline the app.js contents here */
</script>
```

- Do not use `<script type="text/babel" src="app.js">` — Babel fetches external scripts through browser APIs blocked under local-file origin rules.
- Do not use `.../recharts@2.12.7/umd/Recharts.min.js` — 404s. Use `Recharts.js`.
- Load `prop-types@15.8.1` before Recharts.
- After inlining, verify the inline Babel script matches `app.js` byte-for-byte in logic.

## State Model — Plain Constants, Not Interactive State

Because progression is driven by chat editing the file between turns, not by
the candidate clicking things, the "state" is a set of plain module-level
constants at the top of `app.js` that the components render from directly
(no `useState`/`useEffect` needed for progression):

- `CASE`: `{ title, phase, caseTopic, situation, givens: string[] }`
- `STAGES`: ordered array of stage-name strings. Standard case: the 7 names from `case-engine.md`. Capstone case: the 10-name variant (`Diagnose 1`, `Decision 1`, `Curveball 1`, `Diagnose 2`, `Decision 2`, `Curveball 2` in place of the single `Diagnose`/`Decision`/`Curveball`).
- `CURRENT_STAGE_INDEX`: integer, 0-based index into `STAGES`. This is the one value edited most often — once per stage transition.
- `EXHIBITS`: array of `{ id, title, type: 'table' | 'chart' | 'text', chartKind?: 'bar' | 'line', columns: string[], data: object[] }` for `'table'`/`'chart'` exhibits, or `{ id, title, type: 'text', content: string }` for a `'text'` exhibit — a multi-line preformatted block (e.g. an ASCII architecture diagram or a log excerpt) rendered as a `<pre>` block instead of `columns`/`data`. `columns[0]` is the category/x-axis key for charts; every `'table'`/`'chart'` exhibit renders its table regardless of `type` — a chart is a supplement to the table, never a replacement (every value must be readable as text, per spec §3's "every value printed exactly, never read off a chart alone"). This "renders its table" rule doesn't apply to `'text'` exhibits — there's no tabular data to hide behind anything, so a log/diagram exhibit has nothing else to reconcile against. For `type: 'chart'` exhibits, every column after the first (the category/x-axis column) must be numeric — a non-numeric column selected as a series renders blank/NaN with no error, so don't mark an exhibit as `type: 'chart'` if any of its later columns are non-numeric.
- `SCORECARD`: `null` until the Debrief stage is reached, then `{ dimensions: { [dimensionName]: { score: 1|2|3|4, note: string } }, avg: number, graduationStatus: string, weakestDimension: string, nextRecommendedFocus: string }`. Dimension keys are exactly the four names from `rubric-and-scoring.md`.

## Component Tree

- `App` — renders a header block (title, phase/topic line, `StageTracker`) inline, then `CaseBrief`, then `Exhibits`, then `Scorecard`.
- `StageTracker` — one pill per `STAGES` entry; class `stage-done` (index < `CURRENT_STAGE_INDEX`), `stage-active` (index === `CURRENT_STAGE_INDEX`), or `stage-pending` (index > `CURRENT_STAGE_INDEX`).
- `CaseBrief` — renders `CASE.situation` and `CASE.givens`.
- `Exhibits` — maps `EXHIBITS`; renders `ExhibitChart` before `ExhibitTable` when `type === 'chart'`, a `<pre>` block instead of `ExhibitTable` when `type === 'text'`, otherwise just `ExhibitTable`. Renders nothing (returns `null`) if `EXHIBITS` is empty.
- `ExhibitTable` — plain HTML `<table>` from `columns`/`data`.
- `ExhibitChart` — Recharts `BarChart` or `LineChart` (per `chartKind`) wrapped in a fixed-height (`260px`) `ResponsiveContainer`. Only used when an exhibit is naturally a trend/comparison — do not force a chart onto a purely categorical or log-style exhibit; a table-only exhibit is correct and sufficient.
- `Scorecard` — returns `null` while `SCORECARD` is `null`; otherwise renders the dimension table, average, graduation status, weakest dimension, and next-recommended focus.

## Building the Initial Artifact (Situation Stage)

1. Copy `references/case-template.html` and the paired `app-template.js` into the new `BC-##-.../` folder as `index.html` and `app.js`.
2. Fill `CASE`, `STAGES` (standard or Capstone variant), and any exhibits known at Situation time. Leave `CURRENT_STAGE_INDEX = 0` and `SCORECARD = null`.
3. Inline the filled `app.js` into `index.html`'s `<script type="text/babel">` block, keeping both files byte-identical in logic.

## Updating the Artifact Between Stage Transitions

The file already contains all CDN script tags, CSS, and component code —
never regenerate the whole file on a stage transition. Each transition only
needs two small, targeted edits (one in `app.js`, the identical one in
`index.html`'s inlined copy):

1. Change `CURRENT_STAGE_INDEX` to the new stage's index.
2. If the stage introduced a new exhibit (e.g. a data table revealed mid-case), append one object to the `EXHIBITS` array.

After each pair of matching edits, do a quick check that the inlined script
body in `index.html` still matches `app.js` (e.g. extract the inlined
script's text and diff it against `app.js`) — cheap insurance against the
two copies silently drifting apart mid-session.

Use a targeted string-replace edit for both, not a full-file rewrite —
`index.html` is large enough that a heredoc-based full rewrite risks
blowing the shell parser limit. If a large chunk of new content does need to
be spliced in (e.g. writing the final `SCORECARD` object at Debrief), stage
the new content in the scratchpad directory first and splice it in with a
small, targeted edit rather than passing it inline through a shell heredoc.

At Debrief, the same targeted-edit approach populates `SCORECARD` with the
rubric result from `rubric-and-scoring.md`.

## Verify Before Delivery

No leftover placeholder comments or TODO markers, `STAGES.length` matches
the case type (7 standard / 10 capstone), `CURRENT_STAGE_INDEX` is the last
index (Debrief) and `SCORECARD` is non-null by the time the session ends,
every `table`/`chart` exhibit's table renders the same values as its chart (a `text` exhibit renders its preformatted block instead, with no table to check), and the file
opens with an empty `#root` becoming populated with no console errors — see
`quality-checklist.md` → Functional Validation, a hard gate, not optional.
