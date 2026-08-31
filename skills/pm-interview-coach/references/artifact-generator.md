# Artifact Generator

## Output Rule

Build one single self-contained HTML file. Never output the lesson or case as markdown prose in chat — the HTML file is the deliverable, exactly as in `skills/product-ai/references/artifact-generator.md`.

"Self-contained" means the artifact runs by opening the HTML file in any browser — no server, no build step, no local file dependencies, no internet required after the initial CDN scripts load. All CSS, JavaScript, React, and Recharts are inlined in one file.

## File Structure

```text
articles/pm-interview-coach/
  PM-##-<concept-slug>-<company-slug>/
    index.html       ← the deliverable: everything inlined
    app.js            ← readable source copy of the React app
```

See SKILL.md for the numbering rule. Never overwrite an existing `PM-##-*` directory unless the user explicitly asked to revise that specific session.

## Direct-File-Open Script Rule

Use this exact dependency pattern in `index.html` (identical to product-ai's, proven to work under `file://`):

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

- Do not use `<script type="text/babel" src="app.js">` — Babel fetches external scripts through browser APIs blocked by local-file origin rules, so it fails under `file://`.
- Do not use `.../recharts@2.12.7/umd/Recharts.min.js` — that URL 404s. Use `Recharts.js`.
- Load `prop-types@15.8.1` before Recharts — Recharts' UMD build calls its factory with `window.PropTypes` and fails without it.
- After inlining, verify the inline Babel script matches `app.js` byte-for-byte in logic, and that no `__APP_CODE__` placeholder or external `text/babel` app script remains.

## Cowork Bridge for Semantic Grading

`window.cowork && typeof window.cowork.askClaude === 'function'` indicates the artifact is running inside Cowork, which can grade freeform text against intent rather than shared keywords. Use this pattern (adapted from `skills/daily-case-practice/references/case_template.html`'s proven `semanticMatch`/`keywordMatch` hybrid) everywhere the practice-case-design.md spec calls for grading:

```js
async function askJudge(instructions, contextParts) {
  if (!(window.cowork && typeof window.cowork.askClaude === 'function')) return null; // bridge unavailable
  try {
    const res = await window.cowork.askClaude(instructions, contextParts);
    return (typeof res === 'string') ? res : (res && res.text) ? res.text : null;
  } catch (e) {
    return null; // treat as unavailable, fall back
  }
}
```

- For the clarifying-question stage: ask the judge to return the number of the matching canonical question (or 0), exactly as case_template.html does; fall back to the stopword/stem keyword matcher at a ~0.4 overlap threshold if `askJudge` returns null.
- For framework/decision/metrics/recommendation stages: ask the judge for a short structured verdict (what's present, what's thin or missing, one follow-up question) against that stage's rubric; fall back to revealing the static self-check checklist if `askJudge` returns null or the response can't be parsed. Always label in the UI which path produced the feedback ("AI feedback" vs "Self-check — semantic grading unavailable here").
- Never let a bridge error surface to the learner as a broken UI — catch it, fall back silently to the static path, and keep the reveal working either way.

## Automation-Trigger Handling

When this skill is invoked by a Cowork automation (a schedule) or with just a bare concept name and no further context, there is no one to ask — do not build any clarifying-question UI into the generation *process* itself (the in-artifact clarifying-question *stage* for the learner is unrelated and always present). Apply concept-rotation.md's rotation rules with no exceptions and proceed straight through research → build → deliver, the same way product-ai's "topic-only prompts are automation triggers" rule works.

## State Model

Implement (plain React state, no external state library needed):

- `module`: `'learn' | 'observe' | 'practice'` — top-level tab/section the learner is viewing. All three are always freely selectable; nothing unlocks progressively.
- Per Practice-stage state, one entry per stage (`clarify`, `framework`, `exhibit`, `quant`, `decision`, `metrics`, `recommendation`): `{ inputValue, submitted, revealed }`. `revealed` flips true only after `submitted` and the min-length check passes.
- `clarifyLog`: array of `{ text, matchedIdx, hit }` for every clarifying question the learner has asked, plus a `Set` of matched canonical-question indices (for the "what you missed" summary).
- `rubricScores`: object keyed by the 9 scoring dimensions, each a 1-5 number the learner enters themselves at the end.
- Any chart data passed to Recharts components as a plain array of `{ }` objects, with the exact same numbers also rendered in an HTML `<table>` directly beneath the chart (never chart-only data).

## Layout

- A persistent top-level module switcher (Learn / Observe / Practice) — always enabled, not gated by completing a previous module, though presenting them in that reading order by default.
- Within Practice, stages render top-to-bottom on one scrollable page (matching the proven case_template.html pattern) rather than a multi-page wizard — simpler to build correctly and to verify interactively, and consistent with "gate the reveal, not the navigation."
- Recharts chart wrapped in a fixed-height container (e.g. `height: 260`) with `ResponsiveContainer`.
- Keep the visual design plain and readable: light background, a card per stage/section, clear "Reveal" buttons that are disabled (with a visible reason, e.g. "Write at least a few sentences first") until the input passes its minimum-length check.

## Verify Before Delivery

After inlining, do a final pass: no leftover `<!-- placeholder -->` comments, no TODO markers, every canonical clarifying question has an answer, every stage's reveal actually renders content (not an empty div), and the file opens and mounts with an empty `#root` becoming populated — see quality-checklist.md → Functional Validation, which is a hard gate, not optional.
