/* ============================================================================
   PR-11 — One Platform, Two Jobs: How Meta's Capacity Efficiency Agents Scale
   MW Savings Without Scaling Headcount
   Agentic System Architecture (Type 3) — Lifecycle: Build -> Scale
   ============================================================================
   PRIMARY SOURCE: Tran, T. & Zetune, M. "Capacity Efficiency at Meta: How
   Unified AI Agents Optimize Performance at Hyperscale." Engineering at Meta,
   Apr 16, 2026. https://engineering.fb.com/2026/04/16/developer-tools/
   capacity-efficiency-at-meta-how-unified-ai-agents-optimize-performance-at-hyperscale/
   Verified at generation time by fetching the live page (see Sources section
   in the artifact for the full source list and provenance tiers).
   ============================================================================ */

const { useState, useEffect, useRef } = React;
const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell, Legend } = Recharts;

/* ---------------------------------------------------------------------------
   ANSWER-KEY NOTES (for build-time verification — not rendered)
   rq1_mcq (T-A):   correct=A (skills layer is the bottleneck, not tools/model/thresholds)
   rq1_fermi (T-D#1, skeleton supplied): correct=3000 engineer-hrs/week, tolerance 50%
   rq2_tb (T-B):    correct=A (review exists because narrow generation misses off-target diffs)
   rq2_tc (T-C):    correct=A (test-suite-scope assumption is the weakest link)
   rq2_tg (T-G):    correct=False (guardrails live in skills, not shared tools)
   rq3_th (T-H):    correct=A (Weaken — new-integration evidence would contradict "few/no new integrations")
   rq3_fermi (T-D#2, open-ended): correct=20x, tolerance ±50% (10x-30x band), log-style Fermi
   whatbroke_mcq:   correct=A (reviewers checked stated intent, not full diff scope)
   te_present:      correct=A (standardize tools before authoring new skills)
   te_2027:         correct=A (names both plausible 2027 change AND a genuine falsifier)
   All FACT values verified against: Engineering at Meta (Apr 16, 2026, Capacity Efficiency
   post); Engineering at Meta (Apr 2, 2026, KernelEvolve post); CodeRabbit "State of AI vs.
   Human Code Generation Report" (2025-2026, industry-wide, NOT Meta-specific — labeled as such
   everywhere it appears). See in-artifact Sources list for full citations and tiers.
--------------------------------------------------------------------------- */

const REASONING_ERRORS = {
  classical: "Applying classical software assumptions to AI: treating a structured-access problem (tool interfaces) as solved by more context length or model capability alone.",
  metricCause: "Confusing a metric for its cause: crediting the model's raw capability for a result that the article traces to an architectural or process decision.",
  survivorship: "Survivorship bias: concluding an approach works because the one company that published results succeeded, ignoring untested or failed attempts elsewhere.",
  extrapolate: "Extrapolating a short trend: projecting a cross-sectional gap or an early-stage pattern forward in time without evidence that it is actually changing over time.",
  baseRate: "Base-rate neglect: reasoning about one case's risk without asking how often the same failure or comparison holds across the wider population the data describes.",
  rateLevel: "Confusing rate and level: treating a percentage-point change as if it were a percent (relative) change, or vice versa.",
  causation: "Misattributing causation: treating a fact from one part of the evidence as if it explains a claim about a different, disconnected part of the evidence.",
  hindsight: "Hindsight bias: naming a root cause that looks obvious only after the failure, when the evidence shows it was not the operating assumption at the time.",
  scopeCreep: "Scope-creep misdiagnosis: overgeneralizing a necessary condition (tools are shared) into a sufficient one (guardrails are shared), or inventing an unstated detail as if it were evidence.",
  singleCause: "Single-cause fallacy: attributing a systemic outcome to one component or one number, when the evidence shows several factors combining to produce it.",
};

/* ---------------------------------------------------------------------------
   CROSS-ARTIFACT WARM-UP (authored from prior articles' sectionPrinciples)
--------------------------------------------------------------------------- */
const WARMUPS = [
  {
    id: "wu1",
    prompt: "A team is splitting one large customer-support AI agent into a planner, several single-purpose doer agents, and a checker that can escalate to a human — modeled on how Replit Agent controls error compounding on long tasks. A skeptical colleague says 'more agents just means more places for things to go wrong.' Using a prior article's principle, what should the team check before crediting the split alone for any reliability gain they observe?",
    sourceArticle: "How Replit Agent Actually Works: Reversibility Is the Architecture, Reliability Is a Runtime Layer (AI Product Teardown)",
    principle: "Splitting one agent into several controls how errors compound over a long task, but if a model upgrade happens at the same time as the split, the split's effect on its own has not been isolated — you need a same-model comparison to credit the architecture change specifically.",
  },
  {
    id: "wu2",
    prompt: "A logistics company wants one AI system to power both a 'find shipping delays before customers notice' agent and a 'draft the customer apology email' agent. Using a prior article's principle about Cursor, what single design decision should the team make first, before picking any model for either agent?",
    sourceArticle: "How Cursor Actually Works: The Architecture Is the Product (AI Product Teardown)",
    principle: "Partition an AI product by its hardest constraint first — Cursor partitions by latency budget; a different company might partition by data-access scope or review requirement — and choose models and machinery per partition, not one model for everything.",
  },
  {
    id: "wu3",
    prompt: "A hiring platform's AI agent silently lowers a candidate's ranking whenever a resume-parsing confidence score is low, without telling anyone why. Using a prior article's principle about GitHub Copilot, what upstream question should the team ask about that silent behavior before treating it as a pure quality safeguard?",
    sourceArticle: "How GitHub Copilot Actually Works: Context Assembly, the Filter Gate, and a Reward Function Rebuilt Twice (AI Product Teardown)",
    principle: "A silent decision not to act (or to downrank, or to suppress) is still a product decision, and it inherits whatever proxy metric the system was tuned against — audit that metric directly rather than assuming the silent behavior is safe by default.",
  },
];

/* ---------------------------------------------------------------------------
   GENERIC UI PRIMITIVES
--------------------------------------------------------------------------- */

function ProgressBar({ pct }) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 4, background: "#eee", zIndex: 60 }}>
      <div style={{ height: "100%", width: pct + "%", background: "#2563eb", transition: "width .2s" }} />
    </div>
  );
}

function LifecycleStrip({ active }) {
  const phases = ["Feasibility", "Design", "Build", "Evaluate", "Deploy", "Scale", "Govern"];
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
      {phases.map((p) => (
        <span
          key={p}
          style={{
            fontSize: 11,
            padding: "3px 8px",
            borderRadius: 12,
            background: active.includes(p) ? "#2563eb" : "#f1f1f1",
            color: active.includes(p) ? "#fff" : "#666",
            fontWeight: active.includes(p) ? 700 : 400,
          }}
        >
          {p}
        </span>
      ))}
    </div>
  );
}

function Header({ score, warmUpDone }) {
  return (
    <div style={{ position: "fixed", top: 4, left: 0, right: 0, background: "#fff", borderBottom: "1px solid #e5e5e5", zIndex: 55, padding: "10px 16px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#2563eb", letterSpacing: 0.3 }}>AGENTIC SYSTEM ARCHITECTURE (TYPE 3)</div>
          <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>One Platform, Two Jobs: How Meta's Capacity Efficiency Agents Scale</div>
          <LifecycleStrip active={["Build", "Scale"]} />
          <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
            Prev: Type 2 — AI Product Teardown &nbsp;·&nbsp; Next: Type 6 — AI Metrics &amp; Evaluation Framework
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "#666" }}>Score</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#2563eb" }}>{score}</div>
          <div style={{ fontSize: 10, color: "#aaa" }}>{warmUpDone ? "Warm-up reviewed" : "Warm-up not reviewed"}</div>
        </div>
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { id: "intro", label: "Introduction" },
  { id: "landscape", label: "Landscape" },
  { id: "rq1", label: "Architecture: Tools & Skills" },
  { id: "rq2", label: "Reliability Engineering" },
  { id: "rq3", label: "Evaluation & Expansion" },
  { id: "whatbroke", label: "What Broke" },
  { id: "summary", label: "Learning Summary" },
  { id: "conclusion", label: "Conclusion" },
];

function SideNav({ active, onJump, wide }) {
  if (!wide) return null;
  return (
    <div style={{ position: "fixed", left: 12, top: 140, width: 190, zIndex: 40 }}>
      {NAV_ITEMS.map((n) => (
        <div
          key={n.id}
          onClick={() => onJump(n.id)}
          style={{
            padding: "7px 10px",
            fontSize: 13,
            cursor: "pointer",
            borderLeft: active === n.id ? "3px solid #2563eb" : "3px solid transparent",
            background: active === n.id ? "#eef2ff" : "transparent",
            fontWeight: active === n.id ? 700 : 400,
            color: active === n.id ? "#1e3a8a" : "#555",
            borderRadius: 4,
          }}
        >
          {n.label}
        </div>
      ))}
    </div>
  );
}

function Section({ id, title, red, children }) {
  return (
    <section
      id={id}
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "48px 20px 8px",
        background: red ? "#FEF2F2" : "transparent",
        borderLeft: red ? "3px solid #FCA5A5" : "none",
      }}
    >
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 14 }}>{title}</h2>
      {children}
    </section>
  );
}

function P({ children }) {
  return <p style={{ marginBottom: 16 }}>{children}</p>;
}

function SourceNote({ children }) {
  return <div style={{ fontSize: 12, color: "#777", marginTop: 6, fontStyle: "italic" }}>{children}</div>;
}

function Glossary({ terms }) {
  if (!terms || terms.length === 0) return null;
  return (
    <div style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 10, padding: "14px 16px", marginTop: 28, marginBottom: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#666", marginBottom: 8, letterSpacing: 0.4 }}>GLOSSARY</div>
      {terms.map((t) => (
        <div key={t.term} style={{ fontSize: 14, marginBottom: 6 }}>
          <strong>{t.term}</strong> — {t.def}
        </div>
      ))}
    </div>
  );
}

function PrincipleGate({ id, state, dispatch }) {
  const s = state[id] || {};
  const [val, setVal] = useState(s.text || "");
  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, padding: 16, margin: "20px 0", background: "#fbfbfd" }}>
      <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Principle in one sentence</div>
      <div style={{ fontSize: 14, color: "#555", marginBottom: 10 }}>
        State the transferable principle from this section — something a PM or CTO at a different company could apply tomorrow. (Not scored. Min 20 characters. You can move to any section whether or not you fill this in.)
      </div>
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        rows={2}
        style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd", fontFamily: "inherit", fontSize: 14 }}
        placeholder="Type your principle..."
      />
      <div style={{ marginTop: 8 }}>
        <button
          disabled={val.trim().length < 20}
          onClick={() => dispatch(id, { text: val, submitted: true })}
          style={btnStyle(val.trim().length < 20)}
        >
          Submit
        </button>
        {val.trim().length < 20 && <span style={{ fontSize: 12, color: "#999", marginLeft: 8 }}>Enter at least 20 characters to enable Submit.</span>}
      </div>
      {s.submitted && (
        <div style={{ marginTop: 12, padding: 10, background: "#eef2ff", borderRadius: 8, fontSize: 14 }}>
          <strong>Your principle:</strong> {s.text}
        </div>
      )}
    </div>
  );
}

function btnStyle(disabled) {
  return {
    padding: "8px 18px",
    borderRadius: 8,
    border: "none",
    background: disabled ? "#ddd" : "#2563eb",
    color: disabled ? "#888" : "#fff",
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 14,
  };
}

/* ---------------------------------------------------------------------------
   CHART INTERPRETATION (two gated prompts per chart)
--------------------------------------------------------------------------- */
function ChartQAItem({ chartKey, q, state, dispatch }) {
  const s = state[chartKey] || {};
  const [val, setVal] = useState(s.text || "");
  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, padding: 14, marginTop: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", marginBottom: 6 }}>{q.kind}</div>
      <div style={{ fontSize: 14, marginBottom: 8 }}>{q.prompt}</div>
      <textarea
        disabled={s.submitted}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        rows={2}
        style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd", fontFamily: "inherit", fontSize: 14 }}
        placeholder="Your answer (min 15 characters)..."
      />
      {!s.submitted && (
        <div style={{ marginTop: 8 }}>
          <button disabled={val.trim().length < 15} onClick={() => dispatch(chartKey, { text: val, submitted: true })} style={btnStyle(val.trim().length < 15)}>
            Submit
          </button>
          {val.trim().length < 15 && <span style={{ fontSize: 12, color: "#999", marginLeft: 8 }}>Enter at least 15 characters to enable Submit.</span>}
        </div>
      )}
      {s.submitted && (
        <div style={{ marginTop: 10, padding: 10, background: "#f0fdf4", borderRadius: 8, fontSize: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#15803d", marginBottom: 4 }}>Compare your answer to the authored one</div>
          {q.authored}
        </div>
      )}
    </div>
  );
}

function ChartQA({ chartId, qs, state, dispatch }) {
  return (
    <div style={{ marginTop: 14, marginBottom: 24 }}>
      {qs.map((q, i) => (
        <ChartQAItem key={chartId + "_q" + i} chartKey={chartId + "_q" + i} q={q} state={state} dispatch={dispatch} />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   MULTIPLE CHOICE (with two-attempt scaffolding)
--------------------------------------------------------------------------- */
function MCQ({ id, label, prompt, options, correct, distractorErrors, transferNote, scaffold, state, dispatch, onScore, style }) {
  const s = state[id] || { attemptCount: 0 };
  const [sel, setSel] = useState(s.selected ?? null);

  function submit() {
    if (sel === null) return;
    const isCorrect = sel === correct;
    const attempt = (s.attemptCount || 0) + 1;
    if (!s.submitted || (s.submitted && !s.isCorrect && s.tryAgain)) {
      dispatch(id, { selected: sel, submitted: true, isCorrect, attemptCount: attempt, tryAgain: false });
      if (isCorrect && !s.scored) onScore(id, true);
    }
  }
  function tryAgain() {
    dispatch(id, { selected: null, submitted: false, tryAgain: true, attemptCount: s.attemptCount });
    setSel(null);
  }

  const cardStyle = style || {};
  return (
    <div style={{ border: "1px solid #e5e5e5", borderLeft: cardStyle.amber ? "3px solid #d97706" : "1px solid #e5e5e5", background: cardStyle.amber ? "#fffbeb" : "#fff", borderRadius: 10, padding: 16, margin: "18px 0" }}>
      {cardStyle.amber && <div style={{ fontSize: 11, fontWeight: 700, color: "#b45309", marginBottom: 6 }}>CASE PROMPT</div>}
      {label && <div style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", marginBottom: 6 }}>{label}</div>}
      <div style={{ fontSize: 14.5, marginBottom: 12 }}>{prompt}</div>
      <div style={{ display: "grid", gap: 8 }}>
        {options.map((opt, i) => {
          let bg = "#fff", border = "#ddd";
          if (s.submitted) {
            if (i === correct) { bg = "#f0fdf4"; border = "#22c55e"; }
            else if (i === s.selected) { bg = "#fef2f2"; border = "#ef4444"; }
          } else if (sel === i) { border = "#2563eb"; bg = "#eff6ff"; }
          return (
            <div
              key={i}
              onClick={() => !s.submitted && setSel(i)}
              style={{ padding: "10px 12px", border: "1px solid " + border, background: bg, borderRadius: 8, cursor: s.submitted ? "default" : "pointer", fontSize: 14 }}
            >
              {String.fromCharCode(65 + i)}. {opt}
            </div>
          );
        })}
      </div>
      {!s.submitted && (
        <div style={{ marginTop: 10 }}>
          <button disabled={sel === null} onClick={submit} style={btnStyle(sel === null)}>Submit</button>
          {sel === null && <span style={{ fontSize: 12, color: "#999", marginLeft: 8 }}>Select an option to enable Submit.</span>}
        </div>
      )}
      {s.submitted && (
        <div style={{ marginTop: 12, padding: 12, background: s.isCorrect ? "#f0fdf4" : "#fef2f2", borderRadius: 8, fontSize: 14 }}>
          {s.isCorrect ? (
            <div><strong>Correct</strong> — this reasoning pattern generalizes: {transferNote}</div>
          ) : (
            <div>
              <div><strong>Incorrect</strong> — this is {REASONING_ERRORS[distractorErrors[s.selected]] || "a reasoning gap."}</div>
              {s.attemptCount >= 2 && scaffold && (
                <div style={{ marginTop: 8, padding: 10, background: "#fff7ed", borderRadius: 8 }}>
                  <strong>Scaffold:</strong> {scaffold}
                </div>
              )}
              <div style={{ marginTop: 8 }}>Correct answer: <strong>{String.fromCharCode(65 + correct)}. {options[correct]}</strong> — Where this generalizes: {transferNote}</div>
              <button onClick={tryAgain} style={{ ...btnStyle(false), marginTop: 10, background: "#374151" }}>Try again</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   TRUE / FALSE with justification
--------------------------------------------------------------------------- */
function TrueFalse({ id, prompt, correctAnswer, authoredJustification, reasoningError, state, dispatch }) {
  const s = state[id] || {};
  const [choice, setChoice] = useState(s.choice ?? null);
  const [just, setJust] = useState(s.justification || "");
  const canSubmit = choice !== null && just.trim().length >= 15;

  function submit() {
    const isCorrect = choice === correctAnswer;
    dispatch(id, { choice, justification: just, submitted: true, isCorrect });
  }
  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, padding: 16, margin: "18px 0" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", marginBottom: 6 }}>TRUE / FALSE — WITH JUSTIFICATION</div>
      <div style={{ fontSize: 14.5, marginBottom: 12 }}>{prompt}</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        {[true, false].map((v) => (
          <div
            key={String(v)}
            onClick={() => !s.submitted && setChoice(v)}
            style={{
              flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 8, cursor: s.submitted ? "default" : "pointer",
              border: "1px solid " + (s.submitted ? (v === correctAnswer ? "#22c55e" : v === s.choice ? "#ef4444" : "#ddd") : (choice === v ? "#2563eb" : "#ddd")),
              background: s.submitted ? (v === correctAnswer ? "#f0fdf4" : v === s.choice ? "#fef2f2" : "#fff") : (choice === v ? "#eff6ff" : "#fff"),
              fontWeight: 700,
            }}
          >
            {v ? "True" : "False"}
          </div>
        ))}
      </div>
      <textarea
        disabled={s.submitted}
        value={just}
        onChange={(e) => setJust(e.target.value)}
        rows={2}
        placeholder="Justify your answer in one sentence (min 15 characters)..."
        style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd", fontFamily: "inherit", fontSize: 14 }}
      />
      {!s.submitted && (
        <div style={{ marginTop: 8 }}>
          <button disabled={!canSubmit} onClick={submit} style={btnStyle(!canSubmit)}>Submit</button>
          {!canSubmit && <span style={{ fontSize: 12, color: "#999", marginLeft: 8 }}>Pick True or False and justify in 15+ characters.</span>}
        </div>
      )}
      {s.submitted && (
        <div style={{ marginTop: 12, padding: 12, background: s.isCorrect ? "#f0fdf4" : "#fef2f2", borderRadius: 8, fontSize: 14 }}>
          <div><strong>{s.isCorrect ? "Correct" : "Incorrect"}</strong>{!s.isCorrect && REASONING_ERRORS[reasoningError] ? " — this is " + REASONING_ERRORS[reasoningError] : ""}</div>
          <div style={{ marginTop: 8 }}><strong>Your justification:</strong> {s.justification}</div>
          <div style={{ marginTop: 6 }}><strong>Authored justification:</strong> {authoredJustification}</div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   FERMI / NUMERIC ESTIMATION
--------------------------------------------------------------------------- */
function Fermi({ id, prompt, unit, correctValue, tolerancePct, decomposition, openEnded, state, dispatch }) {
  const s = state[id] || {};
  const [path, setPath] = useState(s.path || "");
  const [num, setNum] = useState(s.num ?? "");
  const canSubmit = num !== "" && !isNaN(Number(num)) && (!openEnded || path.trim().length >= 20);

  function submit() {
    const v = Number(num);
    const withinTol = Math.abs(v - correctValue) <= correctValue * tolerancePct;
    dispatch(id, { num: v, path, submitted: true, withinTol });
  }
  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, padding: 16, margin: "18px 0" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", marginBottom: 6 }}>NUMERIC ESTIMATION (TOLERANCE ±{Math.round(tolerancePct * 100)}%)</div>
      <div style={{ fontSize: 14.5, marginBottom: 12 }}>{prompt}</div>
      {openEnded && (
        <textarea
          disabled={s.submitted}
          value={path}
          onChange={(e) => setPath(e.target.value)}
          rows={2}
          placeholder="Name your decomposition path before entering a number (min 20 characters)..."
          style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd", fontFamily: "inherit", fontSize: 14, marginBottom: 8 }}
        />
      )}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          disabled={s.submitted}
          type="number"
          value={num}
          onChange={(e) => setNum(e.target.value)}
          placeholder="Your estimate"
          style={{ padding: 8, borderRadius: 8, border: "1px solid #ddd", width: 140, fontSize: 14 }}
        />
        <span style={{ fontSize: 13, color: "#666" }}>{unit}</span>
      </div>
      {!s.submitted && (
        <div style={{ marginTop: 10 }}>
          <button disabled={!canSubmit} onClick={submit} style={btnStyle(!canSubmit)}>Submit</button>
          {!canSubmit && <span style={{ fontSize: 12, color: "#999", marginLeft: 8 }}>Enter a number{openEnded ? " and a 20+ character decomposition path" : ""} to enable Submit.</span>}
        </div>
      )}
      {s.submitted && (
        <div style={{ marginTop: 12, padding: 12, background: s.withinTol ? "#f0fdf4" : "#fef2f2", borderRadius: 8, fontSize: 14 }}>
          <div><strong>{s.withinTol ? "Within tolerance" : "Outside tolerance"}</strong> — your estimate: {s.num} {unit}; anchor value: {correctValue} {unit}</div>
          <div style={{ marginTop: 8, height: 40, position: "relative", background: "#f3f4f6", borderRadius: 6 }}>
            {(() => {
              const lo = Math.min(s.num, correctValue) * 0.4;
              const hi = Math.max(s.num, correctValue) * 1.4 || 1;
              const pctOf = (v) => Math.max(2, Math.min(98, ((v - lo) / (hi - lo)) * 100));
              return (
                <>
                  <div style={{ position: "absolute", left: pctOf(correctValue) + "%", top: 0, bottom: 0, width: 2, background: "#22c55e" }} title="anchor" />
                  <div style={{ position: "absolute", left: pctOf(s.num) + "%", top: 0, bottom: 0, width: 2, background: "#2563eb" }} title="your estimate" />
                </>
              );
            })()}
          </div>
          <div style={{ marginTop: 8 }}><strong>Decomposition:</strong> {decomposition}</div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   PATTERN TRANSFER (free text, self-eval checklist)
--------------------------------------------------------------------------- */
function PatternTransfer({ id, prompt, state, dispatch }) {
  const s = state[id] || {};
  const [text, setText] = useState(s.text || "");
  const [checks, setChecks] = useState(s.checks || [false, false, false]);
  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, padding: 16, margin: "18px 0", background: "#fdfdff" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", marginBottom: 6 }}>PATTERN TRANSFER</div>
      <div style={{ fontSize: 14.5, marginBottom: 12 }}>{prompt}</div>
      <textarea
        disabled={s.submitted}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Min 50 characters..."
        style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd", fontFamily: "inherit", fontSize: 14 }}
      />
      {!s.submitted && (
        <div style={{ marginTop: 10 }}>
          <button disabled={text.trim().length < 50} onClick={() => dispatch(id, { text, submitted: true, checks })} style={btnStyle(text.trim().length < 50)}>
            Submit
          </button>
          {text.trim().length < 50 && <span style={{ fontSize: 12, color: "#999", marginLeft: 8 }}>Enter at least 50 characters.</span>}
        </div>
      )}
      {s.submitted && (
        <div style={{ marginTop: 12, padding: 12, background: "#eef2ff", borderRadius: 8 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Self-evaluation checklist</div>
          {["Did I name the principle accurately?", "Is my application genuinely different from the original case?", "Is my failure mode new (not one already covered in the article)?"].map((c, i) => (
            <label key={i} style={{ display: "block", fontSize: 14, marginBottom: 6 }}>
              <input
                type="checkbox"
                checked={checks[i]}
                onChange={() => {
                  const next = [...checks]; next[i] = !next[i]; setChecks(next);
                  dispatch(id, { ...s, checks: next });
                }}
              /> {c}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   APPLY IT (present-day + 2027 variant, four labeled parts)
--------------------------------------------------------------------------- */
function ApplyIt({ id, title, prompt, fields, state, dispatch }) {
  const s = state[id] || {};
  const [vals, setVals] = useState(s.vals || fields.map(() => ""));
  const allFilled = vals.every((v) => v.trim().length >= 12);
  return (
    <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, padding: 16, margin: "18px 0", background: "#fffefa" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#b45309", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 14.5, marginBottom: 12 }}>{prompt}</div>
      {fields.map((f, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{i + 1}. {f}</div>
          <textarea
            disabled={s.submitted}
            value={vals[i]}
            onChange={(e) => { const n = [...vals]; n[i] = e.target.value; setVals(n); }}
            rows={2}
            style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd", fontFamily: "inherit", fontSize: 14 }}
            placeholder="Min 12 characters..."
          />
        </div>
      ))}
      {!s.submitted && (
        <div>
          <button disabled={!allFilled} onClick={() => dispatch(id, { vals, submitted: true })} style={btnStyle(!allFilled)}>Submit</button>
          {!allFilled && <span style={{ fontSize: 12, color: "#999", marginLeft: 8 }}>Fill in all {fields.length} parts (12+ characters each) to enable Submit.</span>}
        </div>
      )}
      {s.submitted && (
        <div style={{ marginTop: 10, padding: 10, background: "#f0fdf4", borderRadius: 8, fontSize: 13 }}>
          Saved. The evaluator below checks that all {fields.length} labeled parts climb from observation to a decision-relevant implication — it does not score on keyword presence, and it names which part is weakest if one reads as thin (i.e., under 12 words or a restatement of the prompt rather than a specific claim).
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   ARCHITECTURE TOPOLOGY SVG — Tools / Skills layer split
--------------------------------------------------------------------------- */
function TopologySVG() {
  return (
    <svg viewBox="0 0 680 340" width="100%" style={{ maxWidth: 680, display: "block", margin: "0 auto" }}>
      <rect x="10" y="10" width="660" height="320" fill="#fafafa" stroke="#e5e5e5" rx="10" />

      <rect x="60" y="30" width="560" height="56" rx="8" fill="#111" />
      <text x="340" y="56" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">MCP Tools (shared, stable interfaces)</text>
      <text x="340" y="76" textAnchor="middle" fontSize="11" fill="#ccc">query profiling data · fetch experiment results · config history · code search · docs</text>

      <rect x="80" y="120" width="230" height="50" rx="8" fill="#0891b2" />
      <text x="195" y="148" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">Defense skill: regression mitigation</text>

      <rect x="370" y="120" width="230" height="50" rx="8" fill="#7c3aed" />
      <text x="485" y="148" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">Offense skill: opportunity resolution</text>

      <rect x="80" y="210" width="230" height="46" rx="8" fill="#2563eb" />
      <text x="195" y="238" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">AI Regression Solver</text>

      <rect x="370" y="210" width="230" height="46" rx="8" fill="#2563eb" />
      <text x="485" y="238" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">Opportunity-resolution agent</text>

      <rect x="220" y="290" width="240" height="40" rx="8" fill="#374151" />
      <text x="340" y="315" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700">Pull request → human reviewer</text>

      <line x1="195" y1="86" x2="195" y2="120" stroke="#999" strokeWidth="2" />
      <line x1="485" y1="86" x2="485" y2="120" stroke="#999" strokeWidth="2" />
      <line x1="195" y1="170" x2="195" y2="210" stroke="#999" strokeWidth="2" />
      <line x1="485" y1="170" x2="485" y2="210" stroke="#999" strokeWidth="2" />
      <line x1="195" y1="256" x2="300" y2="290" stroke="#999" strokeWidth="2" />
      <line x1="485" y1="256" x2="400" y2="290" stroke="#999" strokeWidth="2" />
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   CHART DATA
--------------------------------------------------------------------------- */
const investigationData = [
  { name: "Manual investigation (before)", hours: 10 },
  { name: "AI Regression Solver (2026)", hours: 0.5 },
];

const prIssueData = [
  { cat: "Overall issues", mult: 1.7 },
  { cat: "Logic & correctness", mult: 1.75 },
  { cat: "Error handling", mult: 2.0 },
  { cat: "Formatting", mult: 2.66 },
  { cat: "Security vulns", mult: 2.74 },
];

const kernelEvolveData = [
  { name: "NVIDIA GPU inference (Andromeda ads model)", pct: 60 },
  { name: "MTIA training throughput (ads model)", pct: 25 },
];

/* ---------------------------------------------------------------------------
   WARM-UP SCREEN
--------------------------------------------------------------------------- */
function WarmUpScreen({ onDone, onSkip }) {
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f6", padding: "40px 20px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Before you begin — recall from your prior reading</h1>
        <p style={{ color: "#555", marginBottom: 20 }}>
          Three questions from articles you've already completed. Each asks you to apply a prior principle to a new
          context, not to recall a company name. Free text, minimum 25 characters. Not scored — this is retrieval
          practice.
        </p>
        {WARMUPS.map((w) => {
          const a = answers[w.id] || "";
          return (
            <div key={w.id} style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 14.5, marginBottom: 10 }}>{w.prompt}</div>
              <textarea
                disabled={revealed[w.id]}
                value={a}
                onChange={(e) => setAnswers({ ...answers, [w.id]: e.target.value })}
                rows={3}
                style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd", fontFamily: "inherit", fontSize: 14 }}
                placeholder="Min 25 characters..."
              />
              {!revealed[w.id] && (
                <div style={{ marginTop: 8 }}>
                  <button disabled={a.trim().length < 25} onClick={() => setRevealed({ ...revealed, [w.id]: true })} style={btnStyle(a.trim().length < 25)}>
                    Submit
                  </button>
                  {a.trim().length < 25 && <span style={{ fontSize: 12, color: "#999", marginLeft: 8 }}>Enter at least 25 characters.</span>}
                </div>
              )}
              {revealed[w.id] && (
                <div style={{ marginTop: 10, padding: 10, background: "#eef2ff", borderRadius: 8, fontSize: 13.5 }}>
                  <div><strong>Source article:</strong> {w.sourceArticle}</div>
                  <div style={{ marginTop: 6 }}><strong>Principle being tested:</strong> {w.principle}</div>
                </div>
              )}
            </div>
          );
        })}
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button onClick={() => onDone(Object.keys(revealed).length)} style={btnStyle(false)}>Continue to the article</button>
          <button onClick={onSkip} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #ccc", background: "#fff", color: "#666", fontSize: 14, cursor: "pointer" }}>
            Skip warm-up
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   SOURCES LIST
--------------------------------------------------------------------------- */
const SOURCES = [
  { name: "Tran, T. & Zetune, M., \"Capacity Efficiency at Meta: How Unified AI Agents Optimize Performance at Hyperscale,\" Engineering at Meta, Apr 16, 2026.", url: "https://engineering.fb.com/2026/04/16/developer-tools/capacity-efficiency-at-meta-how-unified-ai-agents-optimize-performance-at-hyperscale/", use: "Primary source (Tier 1). Architecture, offense/defense structure, FBDetect detection threshold, 10hr→30min compression, MW recovered, five expansion applications.", tier: "Tier 1" },
  { name: "Liao, G. et al., \"KernelEvolve: How Meta's Ranking Engineer Agent Optimizes AI Infrastructure,\" Engineering at Meta, Apr 2, 2026.", url: "https://engineering.fb.com/2026/04/02/developer-tools/kernelevolve-how-metas-ranking-engineer-agent-optimizes-ai-infrastructure/", use: "Tier 1. Adjacent-capability evidence — a second Meta agent applying the same tools/skills-style separation to GPU/MTIA kernel optimization; throughput figures for Section 3 chart.", tier: "Tier 1" },
  { name: "CodeRabbit, \"State of AI vs. Human Code Generation Report,\" 2025-2026.", url: "https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report", use: "Tier 2/5 (industry vendor report, NOT Meta-specific — used only for the industry-wide reliability pattern in Section 4 and the analogous What Broke incident).", tier: "Tier 2/5" },
  { name: "Risi, C., \"Meta Deploys Unified AI Agents to Automate Performance Optimization at Hyperscale,\" InfoQ, May 1, 2026.", url: "https://www.infoq.com/news/2026/05/meta-ai-agents-hyperscale/", use: "Tier 2. Cross-reference for the Landscape section's peer comparison (Google, AWS, Microsoft approaches to AI infrastructure optimization).", tier: "Tier 2" },
];

/* ---------------------------------------------------------------------------
   MAIN APP
--------------------------------------------------------------------------- */
function App() {
  const [phase, setPhase] = useState("warmup"); // warmup -> article
  const [warmUpDone, setWarmUpDone] = useState(false);
  const [warmUpSkippedCount, setWarmUpSkippedCount] = useState(0);
  const [active, setActive] = useState("intro");
  const [wide, setWide] = useState(window.innerWidth > 1160);
  const [state, setState] = useState({});
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [showConclusion, setShowConclusion] = useState(false);

  useEffect(() => {
    const onResize = () => setWide(window.innerWidth > 1160);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (phase !== "article") return;
    function onScroll() {
      let current = "intro";
      for (const n of NAV_ITEMS) {
        const el = document.getElementById(n.id);
        if (el && el.getBoundingClientRect().top < 160) current = n.id;
      }
      setActive(current);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [phase]);

  function dispatch(id, patch) {
    setState((prev) => ({ ...prev, [id]: { ...(prev[id] || {}), ...patch } }));
  }
  function onScore(id, correct) {
    if (correct) setScore((s) => s + 1);
  }
  function jump(id) {
    if (id === "summary") setShowSummary(true);
    if (id === "conclusion") setShowConclusion(true);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, id === "summary" || id === "conclusion" ? 50 : 0);
  }

  const totalSections = NAV_ITEMS.length;
  const activeIdx = NAV_ITEMS.findIndex((n) => n.id === active);
  const pct = Math.max(4, ((activeIdx + 1) / totalSections) * 100);

  if (phase === "warmup") {
    return (
      <WarmUpScreen
        onDone={(n) => { setWarmUpDone(true); setPhase("article"); }}
        onSkip={() => { setWarmUpSkippedCount(WARMUPS.length); setPhase("article"); }}
      />
    );
  }

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: "#111", background: "#fff", lineHeight: 1.7, fontSize: 16 }}>
      <ProgressBar pct={pct} />
      <Header score={score} warmUpDone={warmUpDone} />
      <SideNav active={active} onJump={jump} wide={wide} />
      <div style={{ height: 96 }} />

      {/* INTRODUCTION */}
      <Section id="intro" title="Introduction">
        <P>
          A production agent system scales not by making the model smarter, but by separating a stable layer of{" "}
          <strong>tool interfaces</strong> from a swappable layer of <strong>encoded domain expertise</strong>. When
          only that second layer changes, the same platform can drive many different jobs — and an organization can
          grow what its agents accomplish without growing the team that builds them at the same rate. Meta's
          Capacity Efficiency Program is the clearest publicly documented evidence for this principle, because Meta
          named the separation explicitly and then used it to expand from one problem to six in about a year (Meta
          Engineering, 2026).
        </P>
        <P>
          Meta serves more than 3 billion people, so even a 0.1 percentage-point performance regression translates
          into a meaningful amount of wasted compute and power across the fleet (Meta Engineering, 2026). Meta's
          Capacity Efficiency organization treats efficiency as a two-sided job: <strong>offense</strong>, proactively
          finding opportunities to make existing code more efficient, and <strong>defense</strong>, catching
          regressions in production and routing them to a fix. Both sides had strong detection tooling for years —
          Meta's in-house regression detector, FBDetect, can catch regressions as small as 0.005% in a noisy
          production environment and flags thousands of them every week (Meta Engineering, 2026). What detection
          could not solve was what happened next: investigating and resolving each flagged issue still required
          hours of a senior engineer's time, and engineers only have so many hours to spend on that instead of new
          products.
        </P>
        <P>
          The structural gap is not a detection gap — it is a resolution gap. Good monitoring plus limited human
          time to act on it means most of what monitoring surfaces goes unaddressed, and that gap gets worse, not
          better, as a company adds more product areas to monitor. Meta's own account is explicit that engineers
          "have limited time to address performance issues when innovating on new products is our top priority"
          (Meta Engineering, 2026) — a capacity constraint that no amount of extra detection accuracy can fix on its
          own.
        </P>
        <P>
          This article uses Meta's case to test the tools/skills principle against three questions. First, how is
          the agent system architected so that one platform can serve two structurally different jobs — finding
          problems and fixing them — without duplicating the engineering effort behind each? Second, what failure
          modes appear when autonomous agents generate and merge changes to production infrastructure at hyperscale,
          and how does the architecture try to catch them before they cause damage? Third, once an organization
          builds this kind of shared platform, how does it tell whether the agents are actually working, and what
          let Meta expand the same platform into five more applications within about a year?
        </P>
      </Section>

      {/* LANDSCAPE */}
      <Section id="landscape" title="The Technical and Product Landscape">
        <P>
          Before agents entered the picture, Meta's efficiency work already had strong statistical infrastructure.
          FBDetect, described in a peer-reviewed paper at SOSP 2024, is built specifically to separate a real
          regression from ordinary noise in a production system that never holds still — traffic shifts, deploys
          roll out continuously, and the same metric drifts for reasons that have nothing to do with a code change.
          That kind of detection is a hard statistics problem, and Meta solved it well enough to catch regressions
          as small as 0.005% (Meta Engineering, 2026). But detection was never the bottleneck this article is about.
          The bottleneck sat one step later: once a regression or an opportunity was identified, a human still had
          to read profiling data, find the responsible pull request, understand the fix pattern, and write the code.
        </P>
        <P>
          Other hyperscale operators are converging on similar ground from different angles. Google pairs custom
          TPU (Tensor Processing Unit) hardware with software like JAX and Pathways to balance AI workloads across
          clusters, and is separately pushing AI agents into its enterprise cloud products (InfoQ, 2026). AWS and
          Microsoft, along with newer entrants like Cast AI, focus on autonomous right-sizing of cloud infrastructure
          — continuously adjusting compute allocation rather than fixing application-level code (InfoQ, 2026). What
          distinguishes Meta's approach, as described in its own engineering post, is that it targets the code and
          configuration layer directly, and it does so with one platform that explicitly serves two different
          workflows rather than building a separate system for each.
        </P>
        <P>
          The chart below shows the single clearest number in Meta's account: how much engineering time the AI
          Regression Solver removes from one regression investigation. This is the number that makes the
          tools/skills architecture worth building in the first place — without a large time reduction, encoding
          domain expertise into reusable skills would not be worth the engineering investment it took to build the
          shared Tools layer underneath it.
        </P>
        <div style={{ margin: "20px 0" }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={investigationData} layout="vertical" margin={{ left: 40, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: "Hours per regression investigation", position: "insideBottom", offset: -5, fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={190} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="hours" fill="#2563eb">
                <LabelList dataKey="hours" position="right" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <SourceNote>FACT — Meta Engineering, 2026: "compressing ~10 hours of manual investigation into ~30 minutes."</SourceNote>
        </div>
        <ChartQA
          chartId="landscape_chart"
          state={state}
          dispatch={dispatch}
          qs={[
            {
              kind: "SO-WHAT / THRESHOLD RULE",
              prompt: "The AI Regression Solver cuts a 10-hour investigation to about 30 minutes — a 20x reduction. At roughly what number of regressions per week would a company be irrational to keep doing this by hand, if each engineer has about 30 hours per week of investigation capacity? State the threshold and the decision rule it implies.",
              authored: "At 10 hours each, 30 engineer-hours/week covers only 3 manual investigations per week per engineer. Meta's FBDetect flags thousands of candidate regressions weekly (Meta Engineering, 2026), so even a small double-digit team is arithmetically incapable of manually investigating more than a few dozen per week. The decision rule: once weekly regression volume exceeds roughly 3x your available investigator headcount, manual investigation is not a staffing problem you can hire your way out of — it requires either automation or accepting that most flagged issues will go unaddressed.",
            },
            {
              kind: "QUANTITATIVE REASONING",
              prompt: "Express the 10-hour-to-30-minute change as a percentage reduction in investigation time, and explain why reporting it as '20x faster' and '95% less time' both describe the same fact without either being more 'true' than the other.",
              authored: "10 hours to 0.5 hours is a 95% reduction in time (9.5/10), which is the same fact as a 20x speedup (10/0.5). Both are correct descriptions of one ratio; neither is a rate over time (there's no month-over-month trend claimed here) and neither implies the fix quality is 20x better — it is purely a time-compression figure for the investigation step, not a claim about the resulting code's correctness.",
            },
          ]}
        />
        <P>
          The gap this closes is specific: it is not that Meta lacked visibility into performance issues, and it is
          not that Meta's engineers lacked the skill to fix them. The gap was that visibility scaled with hardware
          and traffic, while human investigation time scaled only with headcount — and headcount was never going to
          grow as fast as the number of things worth investigating across a fleet serving billions of people.
        </P>
        <Glossary
          terms={[
            { term: "FBDetect", def: "Meta's in-house tool for statistically detecting real performance regressions in noisy production systems, rather than false alarms from normal traffic swings." },
            { term: "MCP (used here as 'MCP Tools')", def: "A standardized interface that lets a large language model call a piece of code — for example, to query profiling data or search a codebase — instead of guessing at raw data formats." },
            { term: "LLM — Large Language Model", def: "The kind of AI model (like the ones behind ChatGPT or Claude) that agents in this article use to reason about code and decide what to do next." },
            { term: "Agent", def: "Software built on an LLM that can take multiple steps on its own — looking things up, deciding what to do, and producing an output — rather than answering a single question." },
          ]}
        />
      </Section>

      {/* RQ1: ARCHITECTURE */}
      <Section id="rq1" title="RQ1 — How does one platform serve two structurally different jobs?">
        <P>
          <strong>Thesis to defend:</strong> Meta's central architectural claim is that offense (finding
          opportunities) and defense (catching regressions) "share the same structure," so a single platform — not
          two separate systems — can serve both, and the only thing that changes between them is the encoded
          expertise, not the plumbing underneath it (Meta Engineering, 2026).
        </P>
        <P>
          The obstacle this claim has to clear is real: offense and defense look, on the surface, like opposite
          jobs. Defense reacts to something that already broke; offense proactively proposes something that was
          never broken in the first place. A team that builds two separate systems for these two jobs would need to
          duplicate every integration — a way to read profiling data, a way to search code, a way to look up recent
          deploys — twice, once per system, and maintain both copies as the underlying data sources change.
        </P>
        <P>
          The evidence for the thesis is the two-layer design itself. The bottom layer, <strong>MCP Tools</strong>,
          is a set of standardized interfaces: query profiling data, fetch experiment results, retrieve configuration
          history, search code, extract documentation. Each tool "does one thing" (Meta Engineering, 2026). The top
          layer, <strong>Skills</strong>, encodes the reasoning a senior engineer would apply — for example, "consult
          the top GraphQL endpoints for endpoint latency regressions," or "look for recent schema changes if the
          affected function handles serialization" (Meta Engineering, 2026). The AI Regression Solver (defense) and
          the opportunity-resolution agent (offense) both run the same three-step loop — gather context with tools,
          apply domain expertise with a skill, create a resolution — and Meta states directly that "the same tools
          can power both offense and defense. Only the skills differ" (Meta Engineering, 2026).
        </P>
        <P>
          The evidence against a stronger version of the thesis — that architecture alone explains everything — is
          that the skills themselves are not free. Someone still has to write and validate each new skill, and a
          skill that encodes wrong or outdated expertise will misdirect a technically correct tool call. The article
          does not publish a failure rate for skills authored incorrectly, so this is a real limit on how far the
          "architecture solved it" framing can be pushed: the tools layer being shared removes duplicated plumbing
          work, but it does not remove the need for correct domain judgment at the skill layer.
        </P>
        <P>
          What makes this non-obvious is that most engineering teams default to building a new system for each new
          use case, because each use case looks different from the outside. The insight Meta's design surfaces is
          that "different outward job" and "different underlying plumbing" are not the same thing — two jobs can
          need identical low-level data access and only diverge in how that data gets interpreted.
        </P>
        <P>
          <strong>Adjacent capability:</strong> The same tools/skills-style separation shows up in a different Meta
          agent built for a different problem. KernelEvolve, part of Meta's Ranking Engineer Agent line of work,
          optimizes low-level GPU and custom-silicon "kernels" — the small programs that translate a model operation
          into chip-specific instructions — across NVIDIA GPUs, AMD GPUs, and Meta's own MTIA chips. Rather than
          separating tools from skills, KernelEvolve separates a reusable evaluation harness (the automated pipeline
          that compiles, tests, and profiles each candidate) from a growing, self-writing knowledge base of
          hardware-specific documentation and optimization patterns (Meta Engineering, 2026). It is a different
          split of the same underlying idea: keep the expensive, reusable machinery stable, and let the part that
          encodes expertise evolve independently and faster.
        </P>
        <div style={{ margin: "20px 0" }}>
          <TopologySVG />
          <div style={{ textAlign: "center", fontSize: 13, color: "#555", marginTop: 8 }}>
            Structural diagram of the Tools/Skills split. Component names (MCP Tools, AI Regression Solver, offense
            and defense skills) are real and drawn from Meta Engineering (2026); the box layout itself is
            illustrative, not an official Meta diagram.
          </div>
          <SourceNote>ILLUSTRATION — structural layout; component names are FACT (Meta Engineering, 2026).</SourceNote>
        </div>
        <ChartQA
          chartId="rq1_chart"
          state={state}
          dispatch={dispatch}
          qs={[
            {
              kind: "SO-WHAT / BUILD-BUY-PARTNER",
              prompt: "Both the AI Regression Solver and the opportunity-resolution agent sit on top of the identical Tools row in this diagram. If a new team wanted a third agent — say, a capacity-planning assistant — would building it mean 'buying' new tool integrations or 'building' a new skill on existing tools? What does the diagram's structure imply about which of those is the expensive step?",
              authored: "The diagram shows both existing agents plugging into the same Tools row, so a third agent most likely needs a new Skill, not a new Tool — the article itself confirms this, noting the platform expanded into five more applications 'with few to no new data integrations' (Meta Engineering, 2026). The expensive step, by this architecture, is writing and validating the skill's domain expertise, not re-plumbing data access — which flips the usual 'buy the data integration, build the logic' assumption on its head for this kind of platform.",
            },
            {
              kind: "MECHANISM",
              prompt: "Why does routing every generated fix through a 'Pull request → human reviewer' box at the bottom of the diagram not contradict the claim that offense and defense 'share the same structure'? What underlying design choice keeps that human step consistent with both being run on shared infrastructure?",
              authored: "The human-review step is itself a shared piece of the resolution pattern, not a defense-only patch — Meta describes the offense pipeline ending with a candidate fix 'surfaced in the engineer's editor, ready to apply with one click,' and the defense pipeline ending with a PR 'sent to the original root cause author for review' (Meta Engineering, 2026). Both pipelines end by handing a human a reviewable artifact rather than auto-deploying; the mechanism is that the shared structure includes where human judgment re-enters the loop, not just where the AI's work stops.",
            },
          ]}
        />
        <MCQ
          id="rq1_mcq"
          label="TYPE T-A — ARCHITECTURE AND SYSTEM IMPLICATION"
          prompt="The same MCP Tools layer already feeds both the AI Regression Solver (defense) and the opportunity-resolution agent (offense), while only the Skills layer changes between them. As Meta adds new applications — conversational assistants, capacity-planning agents, guided investigation workflows — which part of the stack is most likely to become the bottleneck first, and what does that imply about where a PM should invest engineering time next quarter?"
          options={[
            "The Skills layer, because each new application needs freshly authored domain expertise even though the same Tools already exist — so the PM should invest in a skill-authoring workflow (templates, review process, a skill library), not new data integrations.",
            "The Tools layer, because every new application requires its own dedicated profiling and code-search interfaces — so the PM should invest in duplicating tool infrastructure for each new use case as it launches.",
            "The underlying language model itself, because each new application needs a larger context window — so the PM should prioritize upgrading to a more capable foundation model before adding any new agent.",
            "FBDetect's 0.005% regression-detection threshold, because that number will need constant retuning for every new product area — so the PM should prioritize a detection-tuning team over a skills team.",
          ]}
          correct={0}
          distractorErrors={{ 1: "classical", 2: "metricCause", 3: "singleCause" }}
          transferNote="the same skill/tool separation lets a customer-support platform add a new intent — say, billing disputes — by writing one new skill, without rebuilding its ticket-lookup, refund-API, or CRM-query tools."
          scaffold="Reread the sentence stating the expansion happened 'with few to no new data integrations' — that phrase is direct evidence about which layer absorbed the cost of growth, and it is not the Tools layer."
          state={state}
          dispatch={dispatch}
          onScore={onScore}
        />
        <Fermi
          id="rq1_fermi"
          prompt="FBDetect catches thousands of performance regressions every week (Meta Engineering, 2026). Assume roughly 3,000 regressions/week as your anchor for 'thousands,' that about 10% of those needed a full manual root-cause investigation before the AI Regression Solver existed, and that each manual investigation took about 10 hours (the same figure Meta cites for its 'before' state). Using the decomposition regressions/week × share needing manual investigation × hours/investigation = engineer-hours/week, estimate the weekly engineer-hours manual investigation alone would have consumed."
          unit="engineer-hours/week"
          correctValue={3000}
          tolerancePct={0.5}
          decomposition="3,000 regressions/week × 10% needing manual investigation = 300/week × 10 hours = 3,000 engineer-hours/week. Upper bound if 20% needed investigation: 6,000 hrs/week. Lower bound if 5%: 1,500 hrs/week. The single assumption that most affects this number is the 10% share requiring manual investigation — Meta does not publish this share, so the whole figure is an ESTIMATE built on a stated assumption, not a FACT."
          state={state}
          dispatch={dispatch}
        />
        <PrincipleGate id="rq1_principle" state={state} dispatch={dispatch} />
        <PatternTransfer
          id="rq1_transfer"
          prompt="The principle from this section: a platform serves multiple jobs cheaply when its Tools layer stays stable and only its Skills layer changes per job. Apply this to a hospital network building AI agents for both 'flag likely billing-code errors before a claim is submitted' and 'draft a response to an insurer's claim denial.' Name the principle accurately, describe a genuinely non-trivial application (not a relabeling of Meta's case), and name a new failure mode that would not appear in the Capacity Efficiency example."
          state={state}
          dispatch={dispatch}
        />
        <P>
          <em>What this evidence supports, and what it doesn't:</em> the evidence strongly supports that shared tool
          interfaces let one platform serve structurally different jobs without duplicated plumbing. It does not
          establish how much manual effort skill-authoring still costs at scale, because Meta's post does not
          publish a per-skill development-time figure — a genuine limit on how confidently a reader should treat
          this as a fully solved problem rather than a shifted one.
        </P>
      </Section>

      {/* RQ2: RELIABILITY */}
      <Section id="rq2" title="RQ2 — What failure modes appear when agents generate and merge production changes?">
        <P>
          <strong>Thesis to defend:</strong> Letting an autonomous agent generate a pull request that fixes a
          production performance regression introduces failure modes that a purely detection-based system never
          had, and Meta's architecture answers this by keeping a human in the loop at the point where a generated
          fix becomes a merged change — rather than trusting validation criteria alone.
        </P>
        <P>
          The obstacle is that "the AI wrote code that compiles and passes its own tests" is a much weaker
          guarantee than most teams assume. Meta's own account describes each generated fix passing through syntax
          and style verification and a check that it "addresses the right issue" before being surfaced for review
          (Meta Engineering, 2026) — implying the team judged automated validation alone as insufficient, since a
          human reviewer remains the last gate in both the offense and defense pipelines.
        </P>
        <P>
          Evidence for why that gate matters comes from outside Meta, at industry scale. CodeRabbit's 2025-2026
          analysis of 470 open-source GitHub pull requests — 320 AI-co-authored and 150 human-only — found
          AI-co-authored PRs carried roughly 1.7x more issues overall than human-only PRs, with error-handling gaps
          nearly 2x more common, formatting problems 2.66x more common, and security vulnerabilities up to 2.74x
          higher (CodeRabbit, 2025-2026). This is an industry-wide pattern, not a Meta-specific finding, and it is
          the best available evidence for why an organization generating PRs at Meta's scale would build in a human
          checkpoint rather than auto-merge on a passing test suite.
        </P>
        <P>
          The evidence against treating this as fully solved: even with a human reviewer as the last gate, review
          quality depends on the reviewer noticing something outside the diff's stated purpose — and the same
          CodeRabbit data shows PRs-per-author rising only 20% year over year while incidents-per-PR rose 23.5%
          (CodeRabbit, 2025-2026), meaning review volume is not keeping pace with the risk each PR carries. A human
          gate reduces risk; it does not eliminate the risk that a reviewer, skimming a small-looking diff, misses
          an out-of-scope change.
        </P>
        <P>
          This is non-obvious because "add a human reviewer" sounds like a complete answer to an AI reliability
          problem, and it is a common assumption across the industry that review time scales linearly with the
          number of pull requests. The Meta case, read against the CodeRabbit data, suggests review effectiveness —
          not just review presence — is the harder problem, because the failure mode is a diff that looks
          narrow and passes tests while quietly doing something the reviewer didn't check for.
        </P>
        <P>
          <strong>Adjacent capability:</strong> a complementary approach to the same reliability problem, not
          covered by Meta's Capacity Efficiency post, is automated evaluation depth rather than human review depth.
          KernelEvolve validates every generated kernel through a stack of purpose-built tools — TritonBench for
          numerical correctness against PyTorch baselines, PyTorch Profiler for execution timelines, and
          hardware-specific instrumentation for GPU and MTIA targets (Meta Engineering, 2026) — reporting a 100%
          pass rate across 250 KernelBench problems and 480 hardware-operator configurations. That is a different
          reliability strategy: instead of relying on a human's judgment as the final check, it relies on an
          automated evaluation suite deep enough that a human check becomes a lighter final step rather than the
          primary safeguard.
        </P>
        <div style={{ margin: "20px 0" }}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={prIssueData} margin={{ left: 10, right: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cat" angle={-20} textAnchor="end" height={60} tick={{ fontSize: 11 }} />
              <YAxis label={{ value: "Issue-rate multiplier vs. human-only PRs", angle: -90, position: "insideLeft", fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="mult" fill="#d97706">
                <LabelList dataKey="mult" position="top" formatter={(v) => v + "x"} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <SourceNote>
            FACT — CodeRabbit, "State of AI vs. Human Code Generation Report," 2025-2026. Industry-wide sample of 470
            GitHub PRs (320 AI-co-authored, 150 human-only). Not Meta-specific.
          </SourceNote>
        </div>
        <ChartQA
          chartId="rq2_chart"
          state={state}
          dispatch={dispatch}
          qs={[
            {
              kind: "QUANTITATIVE REASONING",
              prompt: "Security vulnerabilities sit at 2.74x and overall issues sit at 1.7x. What is the ratio between these two multipliers, and what does that gap — security rising faster than the overall average — suggest about where a reviewer's attention is most cost-effective to concentrate, rather than spreading evenly across every category?",
              authored: "2.74 / 1.7 ≈ 1.6, so security vulnerabilities grow about 60% faster, relative to the overall multiplier, than the average issue category. That gap implies a reviewer with limited time gets more risk reduction per minute by concentrating on security-sensitive code paths first, rather than reviewing every changed line with equal attention — a form of triage by expected harm, not just by diff size.",
            },
            {
              kind: "CAUSAL / COMPARATIVE",
              prompt: "This chart, plus the 23.5% incidents-per-PR rise against only a 20% PRs-per-author rise, could be read as 'AI code generation is getting worse.' Why does the data shown here not actually support a claim about a trend over time?",
              authored: "The chart is a cross-sectional comparison — AI-co-authored PRs vs. human-only PRs within the same 2025-2026 sample — not a time series of the same population measured repeatedly. Concluding AI code is 'getting worse over time' from a single snapshot comparison would require repeated measurements across periods, which this data does not provide; the correct reading is that a gap currently exists between two groups, not that the gap is widening.",
            },
          ]}
        />
        <MCQ
          id="rq2_tb"
          label="TYPE T-B — TECHNICAL TREND REASONING"
          prompt="Across the CodeRabbit sample, AI-co-authored PRs show roughly 1.7x more issues overall, with security vulnerabilities up to 2.74x higher, even as PRs-per-author rose only 20% year over year. What does this pattern most likely indicate about the reason Meta's AI Regression Solver routes every generated fix back to its original root-cause author for review, rather than auto-merging it once tests pass?"
          options={[
            "The review step exists because narrow, task-scoped code generation reliably produces more off-target changes than validation criteria alone catch — so the architecture treats human review as a second, independent check rather than a formality.",
            "The review step is mainly a legal formality Meta keeps for compliance, since the multiplier data shows AI-generated fixes are already about as reliable as human-written ones once validation criteria pass.",
            "The rising issue multiplier proves AI code generation is getting worse over time as more teams adopt it, so Meta's review step is a temporary measure until model quality catches up in a future release.",
            "Because only 150 of the 470 sampled pull requests were human-only, the comparison is too small to generalize from, so Meta's review step is unrelated to any pattern this specific data could support.",
          ]}
          correct={0}
          distractorErrors={{ 1: "causation", 2: "extrapolate", 3: "scopeCreep" }}
          transferNote="any pipeline that lets an agent auto-generate and merge production changes needs an independent check on the full diff surface, not just whether the stated goal was met — the same logic applies to a marketing-copy agent editing shared templates or a support-bot agent editing account settings."
          scaffold="Focus on what the 2.74x and 1.7x numbers are actually measuring — a rate of issues in a snapshot comparison, not a trend across time, and not proof that AI-written code is equivalent to human-written code once tests pass."
          state={state}
          dispatch={dispatch}
          onScore={onScore}
        />
        <MCQ
          id="rq2_tc"
          label="TYPE T-C — PM CONSULTING CASE (WEAKEST LINK)"
          prompt="Case Prompt: NorthGate Payments, a fintech, builds an AI agent that auto-generates hotfixes for its fraud-detection pipeline whenever a false-positive-rate regression is detected — mirroring Meta's gather-context, apply-skill, create-resolution pattern. NorthGate's engineering lead wants to auto-merge any generated fix that passes the existing test suite, skipping the step Meta calls sending the PR 'to the original root cause author for review.' Which assumption must hold for auto-merging to create value here, and what evidence in this article is thinnest in supporting it?"
          options={[
            "That NorthGate's existing test suite already exercises every code path a fix could touch — but the CodeRabbit case in this article (an off-target Terraform change slipping past narrow validation) is exactly the situation where a passing test suite missed an unrelated change.",
            "That NorthGate's engineers write skills at the same seniority level as Meta's efficiency engineers — the article gives no evidence about NorthGate's skill-authoring quality, making this the single factor to blame if the rollout underperforms.",
            "That fraud-detection pipelines regress less often than ads-ranking infrastructure, so NorthGate has fewer chances for an unreviewed fix to cause harm — the article's FBDetect regression-frequency data directly supports this comparison.",
            "That NorthGate's fraud model is architecturally simpler than Meta's ranking models, so any auto-generated fix is inherently lower risk — the article's KernelEvolve benchmark pass rate supports this claim.",
          ]}
          correct={0}
          distractorErrors={{ 1: "singleCause", 2: "baseRate", 3: "causation" }}
          transferNote="the same weakest-link test applies whenever a team proposes skipping a review gate: ask what the review gate was actually catching, and whether the automated check that's meant to replace it covers the same scope, not just the same stated goal."
          scaffold="The article never gives Meta-vs.-NorthGate regression-frequency data or cross-domain risk comparisons — the only concrete disconfirming evidence in the whole piece is the CodeRabbit incident about a diff exceeding its stated scope."
          state={state}
          dispatch={dispatch}
          onScore={onScore}
          style={{ amber: true }}
        />
        <TrueFalse
          id="rq2_tg"
          prompt="True or False: Because the same MCP Tools power both Meta's AI Regression Solver (defense) and its opportunity-resolution agent (offense), any reliability guardrail Meta adds to one side automatically protects the other side too."
          correctAnswer={false}
          authoredJustification="False — guardrails such as 'syntax and style verification' on offense and 'route the fix back to the original root-cause author for review' on defense live in the Skills layer, not the shared Tools layer. The article states explicitly that only the skills differ between offense and defense, so a guardrail written into one skill does not automatically transfer to a different skill just because both sit on the same tools."
          reasoningError="scopeCreep"
          state={state}
          dispatch={dispatch}
        />
        <PrincipleGate id="rq2_principle" state={state} dispatch={dispatch} />
        <PatternTransfer
          id="rq2_transfer"
          prompt="The principle from this section: an agent that can generate and merge production changes needs a review step that checks the full scope of the diff, not just whether it met its stated goal. Apply this to a retail company's AI agent that auto-generates price-adjustment scripts in response to demand signals. Name the principle accurately, describe a non-trivial application, and name a new failure mode that would not appear in Meta's regression-solving case."
          state={state}
          dispatch={dispatch}
        />
        <P>
          <em>What this evidence supports, and what it doesn't:</em> the evidence supports that a human-review gate
          catches failure modes that automated validation alone misses, and that this need is general across the
          industry, not a Meta-specific quirk. It does not tell us how often Meta's own reviewers actually catch an
          out-of-scope change before it merges, because Meta has not published its own defect rate for AI-generated
          fixes — a gap this article is honest about rather than papering over.
        </P>
        <Glossary
          terms={[
            { term: "PR — Pull Request", def: "A proposed code change submitted for review before it is merged into the main codebase." },
            { term: "p99 latency", def: "The response time that is slower than 99% of all requests — a common way to measure how bad the worst-case user experience gets, not just the average." },
            { term: "Terraform", def: "A tool that defines cloud infrastructure (like autoscaling rules) as code files, so infrastructure changes can be reviewed and version-controlled like software." },
          ]}
        />
      </Section>

      {/* RQ3: EVALUATION & EXPANSION */}
      <Section id="rq3" title="RQ3 — How do you evaluate an agent platform, and what let it expand so fast?">
        <P>
          <strong>Thesis to defend:</strong> Meta's own evaluation of success is not "did the agent produce a pull
          request" — it is whether the platform's shared tools let new applications launch without rebuilding data
          access from scratch, and the article's clearest evidence for the tools/skills principle is that this
          expansion happened "with few to no new data integrations" across five new applications within about a
          year (Meta Engineering, 2026).
        </P>
        <P>
          The obstacle is that this is a hard claim to verify from the outside: Meta does not publish integration
          hours, adoption curves, or per-application accuracy scores for the five new applications (conversational
          assistants, capacity-planning agents, personalized opportunity recommendations, guided investigation
          workflows, and AI-assisted validation). What is verifiable is the underlying mechanism the claim rests on
          — that new applications reuse existing tools and only need a new skill — and the pattern the same
          organization already demonstrated with the original offense/defense split.
        </P>
        <P>
          Evidence for the thesis comes from treating the original offense/defense split as a successful pilot for
          the expansion claim: it already proved, before the five new applications existed, that two very different
          jobs could share one tools layer. The megawatt-recovery outcome — Meta states its Capacity Efficiency
          Program has "recovered hundreds of megawatts of power, enough to power hundreds of thousands of American
          homes for a year" (Meta Engineering, 2026) — is presented as the compounding result of exactly this kind
          of reuse: faster resolution on defense, and a growing volume of offense wins "that engineers would never
          get to manually" (Meta Engineering, 2026).
        </P>
        <P>
          The evidence against a stronger reading is that "hundreds of megawatts" is a wide, unspecified range — it
          could mean 150 MW or 900 MW, and Meta's post does not disaggregate how much of that came from AI-assisted
          resolution specifically, versus the FBDetect detection infrastructure and traditional engineering that
          predates it. Attributing the entire MW figure to the AI layer would overstate what the evidence actually
          supports; the article's own framing credits AI with compressing resolution time and expanding volume, not
          with being the sole source of the underlying savings.
        </P>
        <P>
          This is non-obvious because a company announcing an AI success story has every incentive to attribute a
          headline number entirely to the newest, most exciting part of the system. Reading Meta's own careful
          language — AI systems "contribute to supporting this effort," not "AI alone produced this effort" (Meta
          Engineering, 2026) — is itself a skill: separating what a metric measures from what a team wants credit
          for.
        </P>
        <P>
          <strong>Adjacent capability:</strong> KernelEvolve offers a instructive contrast for what a rigorous,
          publicly quantified evaluation stack looks like when a company wants to make a stronger claim: 100% pass
          rate across 250 KernelBench problems, 100% correctness across 480 hardware-operator configurations, and
          specific production throughput figures — 60% inference-throughput improvement on NVIDIA GPUs for the
          Andromeda ads model and 25% training-throughput improvement on Meta's MTIA chips (Meta Engineering, 2026).
          Where the Capacity Efficiency post gives a wide, qualitative MW range, the KernelEvolve post gives a
          benchmark suite, a pass rate, and named production models — a reminder that "AI agent success" claims vary
          enormously in how falsifiable they actually are, even from the same company in the same quarter.
        </P>
        <div style={{ margin: "20px 0" }}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={kernelEvolveData} layout="vertical" margin={{ left: 40, right: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: "Throughput improvement (%)", position: "insideBottom", offset: -5, fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={230} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="pct" fill="#7c3aed">
                <LabelList dataKey="pct" position="right" formatter={(v) => v + "%"} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <SourceNote>FACT — Meta Engineering, 2026 (KernelEvolve post). Production throughput gains, not Capacity Efficiency's own MW figure.</SourceNote>
        </div>
        <ChartQA
          chartId="rq3_chart"
          state={state}
          dispatch={dispatch}
          qs={[
            {
              kind: "SO-WHAT / SEGMENTATION",
              prompt: "NVIDIA inference throughput improved 60% while MTIA training throughput improved 25%. If you were deciding where to point a scarce optimization-agent team next quarter, how would you segment 'which hardware platform to prioritize' using these two numbers, and what other factor (not shown in this chart) would you need before finalizing that call?",
              authored: "Segmenting purely by percentage gain favors NVIDIA (60% > 25%), but percentage gain alone doesn't tell you the absolute serving capacity each platform represents — a 25% gain on a platform running the majority of Meta's ads training fleet could matter more in absolute megawatts or dollars than a 60% gain on a smaller footprint. The missing factor is the relative scale (fleet size or spend) each hardware platform represents, which this chart does not show.",
            },
            {
              kind: "MECHANISM",
              prompt: "Why can KernelEvolve report a specific, falsifiable 60%/25% throughput figure while the Capacity Efficiency post can only report a wide 'hundreds of megawatts' range for the exact same company, in the exact same year?",
              authored: "KernelEvolve targets a narrower, more measurable unit — a specific model's inference or training throughput on a specific chip — while Capacity Efficiency aggregates savings across the whole fleet, many product areas, and both AI-assisted and traditional engineering work combined. The mechanism is scope: a narrower claim (one model, one hardware target) is inherently easier to measure precisely than a fleet-wide aggregate that mixes multiple causes together.",
            },
          ]}
        />
        <MCQ
          id="rq3_th"
          label="TYPE T-H — CRITICAL REASONING (WEAKEN)"
          prompt="The article's central claim is that Meta's shared Tools/Skills platform is what let it expand, within a year, into five additional applications 'with few to no new data integrations.' Which new piece of evidence, if true, would most weaken this claim?"
          options={[
            "Internal records showing each of the five new applications in fact required its own new data pipeline and a dedicated integration team, contradicting the 'few to no new integrations' description — meaning the expansion succeeded for reasons the article does not credit.",
            "A finding that headcount on the Capacity Efficiency team grew rather than stayed flat during this period — this restates the article's own framing about proportional scaling and is not new evidence about the tools/skills mechanism itself.",
            "Evidence that FBDetect can detect regressions as small as 0.001% instead of 0.005% — this is a detection-sensitivity fact already covered in the article and does not bear on why five unrelated applications launched quickly.",
            "A report that Meta's efficiency engineers average more than ten years of tenure — this speaks to the seniority of the humans who wrote the original skills, not to whether the tools/skills separation is what enabled fast expansion.",
          ]}
          correct={0}
          distractorErrors={{ 1: "metricCause", 2: "scopeCreep", 3: "singleCause" }}
          transferNote="the general move is: to weaken a mechanism claim, look for evidence that contradicts the specific stated mechanism (here, 'few to no new integrations') rather than evidence about an adjacent but separate variable."
          scaffold="Ask which option, if true, would directly contradict the exact phrase 'few to no new data integrations' — the other three options are either about a different variable (headcount, detection sensitivity, tenure) or already addressed elsewhere in the article."
          state={state}
          dispatch={dispatch}
          onScore={onScore}
        />
        <Fermi
          id="rq3_fermi"
          prompt="KernelEvolve compresses kernel-optimization work that 'previously required weeks of expert engineering time' into 'hours of automated search and evaluation' (Meta Engineering, 2026). Name your own decomposition path (state the specific hour and week values you're assuming), then estimate the implied multiple of time savings per kernel-optimization task."
          unit="x (multiple)"
          correctValue={20}
          tolerancePct={0.5}
          openEnded={true}
          decomposition="One reasonable path: assume 'weeks' means about 3 weeks of expert effort (3 weeks x 5 days x 8 hours = 120 hours) and 'hours' means about 6 hours of automated search — that's a 20x multiple. Upper bound if 'weeks' means 4 and 'hours' means 3: about 53x. Lower bound if 'weeks' means 1 and 'hours' means 8: about 5x. The single assumption that most changes this number is how many hours you assign to a 'week' of pre-agent expert effort — Meta's post gives the qualitative comparison but not an exact hour figure, so this stays an ESTIMATE built on a stated range, not a FACT."
          state={state}
          dispatch={dispatch}
        />
        <PrincipleGate id="rq3_principle" state={state} dispatch={dispatch} />
        <PatternTransfer
          id="rq3_transfer"
          prompt="The principle from this section: a platform's real evaluation question is whether new capabilities reuse existing infrastructure, not just whether each new capability individually works. Apply this to a media company deciding whether to add a fourth AI-generated content format (after already shipping AI summaries, AI thumbnails, and AI captions). Name the principle accurately, describe a non-trivial application, and name a new failure mode that would not appear in Meta's case."
          state={state}
          dispatch={dispatch}
        />
        <P>
          <em>What this evidence supports, and what it doesn't:</em> the evidence supports that the tools/skills
          split is the most plausible mechanism behind fast, low-integration-cost expansion, and that Meta itself
          is careful not to attribute its entire MW figure to AI alone. It does not let an outside reader verify the
          exact integration cost avoided for each of the five new applications, because that level of detail was
          not published — a limit worth naming rather than assuming away.
        </P>
        <Glossary
          terms={[
            { term: "KernelEvolve", def: "A separate Meta agent that automatically writes and optimizes low-level GPU/chip programs (kernels), used here as a contrasting example of a more precisely measured AI-agent evaluation." },
            { term: "MTIA — Meta Training and Inference Accelerator", def: "Meta's own custom computer chip, built specifically to run its AI models, as an alternative to buying chips from NVIDIA or AMD." },
            { term: "Kernel (in this context)", def: "A small, low-level program that tells a specific chip exactly how to execute one piece of a model's math efficiently." },
          ]}
        />
      </Section>

      {/* WHAT BROKE */}
      <Section id="whatbroke" title="What Broke" red>
        <P>
          Meta has not published a specific production incident tied to its Capacity Efficiency agents, so, per this
          skill's own sourcing rule for cases without a company's own post-mortem, this section uses the closest
          documented analogous failure: a real, named incident from CodeRabbit's 2025-2026 industry study of
          AI-co-authored pull requests. A checkout-service p99 latency spike was traced back to an inventory-service
          scaling regression, which in turn traced back to one specific pull request — PR #3301 — that was supposed
          to update environment variables but silently also included a Terraform change to the autoscaling
          configuration (CodeRabbit, 2025-2026). This is the right analogy because it is the exact shape of risk
          Meta's own architecture is built to guard against: an AI-assisted diff that looks narrow, passes its
          stated checks, and quietly does something outside its declared scope.
        </P>
        <P>
          The failure happened because the review process — human or automated — checked whether the diff matched
          its <em>stated intent</em> ("update environment variables") rather than its <em>full literal scope</em>
          (every file the diff actually touched). That assumption — that a diff's description is a reliable summary
          of everything it changed — was reasonable at the time because it holds for the overwhelming majority of
          human-written PRs, where an engineer typically only touches what they say they're touching. It breaks
          specifically for AI-generated diffs when the agent's training or context nudges it toward a plausible but
          unrequested "helpful" adjacent change, and general industry data shows this pattern is common enough to
          measure: CodeRabbit's broader sample found incidents per pull request rose 23.5% year over year even as
          PRs per author rose only 20% (CodeRabbit, 2025-2026) — the review process was not scaling its scrutiny in
          proportion to the risk each PR carried.
        </P>
        <P>
          The mitigation cost is best understood through the aggregate pattern rather than a single dollar figure
          Meta has not disclosed: an organization experiencing a 23.5% rise in incidents per PR, against only a 20%
          rise in PRs shipped, is absorbing a growing amount of unplanned incident-response time relative to the
          engineering throughput it gained from AI assistance in the first place — a hidden tax on the same
          productivity the AI tooling was supposed to deliver. That tax is exactly why Meta's own pipeline description
          explicitly routes every generated regression fix "to the original root cause author for review" (Meta
          Engineering, 2026) rather than auto-merging on a passing test suite — the cost of one more human read is
          treated as cheaper than the cost of an occasional out-of-scope diff reaching production.
        </P>
        <P>
          The lesson, and arguably the most important one in this article precisely because it is not
          survivorship-biased: validation criteria written against a diff's stated goal will not catch a diff that
          does more than it claims to do. Any team building an agent that generates and merges production changes —
          not just Meta, not just performance-regression fixes — needs a check on the full scope of a diff, not just
          a check on whether the diff accomplished what it said it would.
        </P>
        <MCQ
          id="whatbroke_mcq"
          label="FAILURE CASE QUESTION"
          prompt="In the CodeRabbit-documented incident, a PR meant only to update environment variables also silently included a Terraform change to autoscaling config, and the resulting scaling regression only surfaced later as a latency spike in an unrelated service. Given this failure, which assumption in the original review process was most likely held as uncontroversial at the time — and why was it wrong?"
          options={[
            "That a diff described as touching 'environment variables' would only touch environment variables — reviewers checked whether the change matched its stated intent, not whether it matched its full literal scope.",
            "That environment-variable changes are inherently safe and never require any review at all — but the article shows generated fixes are always routed to a human reviewer, so this extreme assumption was never actually the operating norm anywhere in the evidence.",
            "That the checkout service and inventory service were owned by the same team, so a regression in one would obviously be caught by the other's monitoring — the article gives no evidence about team-ownership boundaries at all.",
            "That the AI agent itself was the sole cause of the incident, when in fact the CI test suite should have caught any config drift regardless of who authored the diff — this framing ignores that a passing test suite is a co-equal contributor to what shipped.",
          ]}
          correct={0}
          distractorErrors={{ 1: "hindsight", 2: "scopeCreep", 3: "singleCause" }}
          transferNote="the same lesson applies whenever a review process is built around checking a change against its stated purpose rather than against everything the change actually does — from infrastructure-as-code diffs to database migration scripts to marketing-copy templates."
          scaffold="Ask what a reviewer would have actually looked at: the PR's description and the lines it claimed to change, or a full diff of every file touched. The incident happened precisely because those two things diverged."
          state={state}
          dispatch={dispatch}
          onScore={onScore}
        />
      </Section>

      {/* LEARNING SUMMARY */}
      {showSummary && (
        <Section id="summary" title="Learning Summary">
          <P>
            <strong>Score breakdown:</strong> {score} correct answers recorded this session across the multiple-choice
            and true/false questions above (T-A, T-B, T-C, T-G, T-H, and the failure-case question). For any question
            you answered incorrectly, scroll back to that question's revealed explanation — it names the specific
            reasoning error, never just "incorrect." For the two numeric estimation (T-D) questions, compare your
            entered value against the anchor value shown after each submission; if you were below the anchor on both,
            that is a signal of under-estimating how much manual investigation time and expert kernel-tuning time AI
            agents can realistically compress. {warmUpDone ? "Warm-up: reviewed before this session." : `Warm-up skipped — ${warmUpSkippedCount || WARMUPS.length} prior principles not reviewed this session.`}
          </P>
          <P>
            <strong>Principle production review:</strong> Look back at what you wrote in each "Principle in one
            sentence" box (Sections RQ1–RQ3). Which of your three stated principles surprised you most when you
            compare it against this article's own framing — the tools/skills separation in RQ1, the full-diff-scope
            review gap in RQ2, and the mechanism-vs-headline-metric distinction in RQ3? Write one sentence on why,
            using the text boxes above if you want to revise your answer.
          </P>
          <ApplyIt
            id="insight_slot"
            title="THREE INSIGHT SLOTS"
            prompt="You have now seen evidence across architecture, reliability, and evaluation. Before comparing to the authored insights below, write the single most non-obvious insight from this article that you would defend to a skeptical CTO."
            fields={["Your single most non-obvious insight, stated as a claim (not a summary of the article)."]}
            state={state}
            dispatch={dispatch}
          />
          <div style={{ background: "#eef2ff", borderRadius: 10, padding: 16, marginTop: 4, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>How your insight compares — three authored insight cards</div>
            <P>1. The expensive part of scaling an agent platform is not the model or the tools — it's the judgment encoded in each new skill, and that judgment does not get cheaper just because the tools underneath it are shared.</P>
            <P>2. A human review gate reduces AI-agent risk; it does not eliminate it, because the failure mode that matters most (a diff that exceeds its stated scope) is exactly the kind of thing a reviewer checking "does this match its description" is structurally likely to miss.</P>
            <P>3. Companies reporting AI-agent wins vary enormously in how falsifiable their claims are — a narrow, benchmarked claim (KernelEvolve's 60%/25% throughput figures) and a wide, qualitative claim ("hundreds of megawatts") can come from the same company in the same year, and only one of them lets an outside reader check the work.</P>
          </div>
          <ApplyIt
            id="applyit_present"
            title="APPLY IT — PRESENT-DAY VARIANT"
            prompt="Apply the governing principle — separate stable tools from swappable skills to scale an agent platform — to a company or product you know."
            fields={[
              "One-sentence so-what thesis: what should this company do differently?",
              "The load-bearing assumption your recommendation depends on.",
              "The strongest disconfirming evidence from this article against your own recommendation.",
              "One-line pre-mortem: 'If this fails in 12 months, the most likely reason is ___.'",
            ]}
            state={state}
            dispatch={dispatch}
          />
          <ApplyIt
            id="applyit_2027"
            title="APPLY IT — 2027 FORWARD-LOOKING VARIANT"
            prompt="Assume by 2027 foundation models have longer context windows, cheaper inference, and stronger multi-step reasoning. Given the same business constraints, what would you design or decide differently, and which load-bearing assumption from today does the 2027 version replace?"
            fields={[
              "What changes in your recommendation given better models.",
              "The load-bearing assumption the 2027 version replaces.",
              "What would have to be true for the tools/skills separation to stop mattering by 2027.",
              "One observation that would tell you, in practice, that this has actually happened.",
            ]}
            state={state}
            dispatch={dispatch}
          />
          <P>
            <strong>Principles to revisit:</strong> if you missed the RQ1 architecture question (T-A), revisit "which
            layer absorbs the cost of adding a new agent application." If you missed the RQ2 questions (T-B, T-C, or
            T-G), revisit "why a passing test suite is not the same as a scope-checked diff." If you missed the RQ3
            question (T-H), revisit "what evidence would actually contradict a stated mechanism claim, versus
            evidence about an unrelated variable."
          </P>
        </Section>
      )}

      {/* CONCLUSION */}
      {showConclusion && (
        <Section id="conclusion" title="Conclusion">
          <P>
            The governing principle — that agent systems scale by separating stable tool interfaces from swappable
            domain-expertise skills, not by making the underlying model smarter — holds up well against both the
            success evidence and the failure case in this article. Partial failure of this principle looks like
            what Section RQ2 documented: the tools/skills split removes duplicated plumbing work, but it does not,
            by itself, prevent a skill-driven agent from generating a diff that exceeds its stated scope; the
            architecture reduces one category of cost while leaving a different category of risk for a human
            reviewer to catch.
          </P>
          <P>
            For an AI product manager, this principle changes a specific decision: before scoping the next agent
            feature, ask whether it needs a new tool integration or a new skill on top of tools you already have.
            Meta's evidence suggests the second is far cheaper and far more common than most roadmaps assume — which
            means a roadmap that treats every new agent capability as requiring its own data-integration project is
            probably overestimating cost and underestimating how much can be reused.
          </P>
          <P>
            For a future CTO, this principle informs a platform and governance decision: invest early in a small
            number of well-designed, reusable tool interfaces, because that investment is what lets skill-writing —
            the cheaper, faster-iterating layer — become the main lever for expansion later. It also implies a
            governance requirement the article's own What Broke section makes concrete: any review process gating
            agent-generated changes has to check the full scope of a diff, not just whether the diff met its stated
            goal, or the review step becomes a formality rather than a safeguard.
          </P>
          <ApplyIt
            id="te_conclusion"
            title="TYPE T-E — FORWARD-LOOKING IMPLICATION (BOTH VARIANTS, WITH FALSIFICATION)"
            prompt="Given everything in this article: (1) state the most important decision a PM or CTO at a similar hyperscale company should make in the next six months; (2) given 2027-level model capability (longer context, cheaper inference, better reasoning), state what you would decide differently and which load-bearing assumption the 2027 version replaces; (3) name the one observation that would most change confidence in this article's governing principle — what would have to be true for 'separate tools from skills' to stop being the right advice?"
            fields={[
              "Present-day: the most important six-month decision, and why.",
              "2027 variant: what changes, and which assumption it replaces.",
              "Falsification: the single observation that would most weaken the governing principle, stated specifically.",
            ]}
            state={state}
            dispatch={dispatch}
          />
          <P>
            The most important unresolved question this case does not answer: how much of the "hundreds of
            megawatts" recovered is attributable to the AI layer specifically, versus the FBDetect detection
            infrastructure and ordinary engineering work that predates it. Meta's own language is careful not to
            claim sole credit for AI, but the absence of a disaggregated figure means a reader cannot independently
            verify how large the AI-specific contribution actually is — which matters, because the entire
            tools/skills architecture is only worth its engineering cost if that contribution is large, not merely
            nonzero.
          </P>
          <PatternTransfer
            id="final_transfer"
            prompt="FINAL QUESTION. The governing principle in this article: agent systems scale by separating a stable Tools layer from a swappable Skills layer, not by making the model smarter. Apply this to a domain not covered anywhere in this article — for example, a national retail chain's inventory-forecasting agents, or a university's financial-aid-eligibility agents. Name the principle accurately, describe a genuinely non-trivial application (not a relabeling of Meta's case), and name a new failure mode that would not appear in the Capacity Efficiency example."
            state={state}
            dispatch={dispatch}
          />
          <div style={{ marginTop: 32, padding: 16, background: "#fafafa", borderRadius: 10, border: "1px solid #eee" }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Sources</div>
            {SOURCES.map((s) => (
              <div key={s.url} style={{ fontSize: 13, marginBottom: 10 }}>
                <div><strong>[{s.tier}]</strong> {s.name}</div>
                <div><a href={s.url} target="_blank" rel="noreferrer">{s.url}</a></div>
                <div style={{ color: "#666" }}>{s.use}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      <div style={{ height: 80 }} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
