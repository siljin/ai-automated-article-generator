/* ============================================================================
   Grading the Task Isn't Enough: Amazon's Three-Layer Answer to Why Agents Fail
   AI Product Teardown / Agentic System Architecture (Type 3)
   Single-file React app. Inlined into index.html via Babel standalone.
   ============================================================================ */

const { useState, useEffect, useRef, useCallback } = React;
const {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList
} = Recharts;

/* --------------------------------------------------------------------------
   REASONING-ERROR TAXONOMY (shared calibration copy)
   -------------------------------------------------------------------------- */
const ERR = {
  classical: "Applying classical software assumptions to AI: treating agent behavior as deterministic or assuming one component's health implies another's.",
  metricCause: "Confusing a metric for its cause: assuming a proxy number improving means the underlying problem is solved.",
  survivorship: "Survivorship bias: concluding a practice works because one successful deployment used it, ignoring how it would fare elsewhere.",
  extrapolate: "Extrapolating a short trend: projecting a narrow, recent pattern far beyond what it was measured over.",
  baseRate: "Base-rate neglect: judging a single case without asking how often this failure mode occurs across similar systems.",
  rateLevel: "Confusing rate and level: misreading a percentage change as a change in the underlying count, or vice versa.",
  causation: "Misattributing causation: assuming two metrics that moved together must have caused one another.",
  hindsight: "Hindsight bias in incident analysis: naming a root cause that looks obvious only after the failure happened.",
  scopeCreep: "Scope creep misdiagnosis: blaming a nearby, familiar control instead of the specific mechanism that actually failed.",
  singleCause: "Single-cause fallacy: treating one real contributing factor as the entire explanation for a systemic failure."
};

/* --------------------------------------------------------------------------
   SOURCES
   -------------------------------------------------------------------------- */
const SOURCES = [
  { name: "Amazon Web Services — “Evaluating AI agents: Real-world lessons from building agentic systems at Amazon” (Bai, Colin, Imran, Xiong)", year: "2026", url: "https://aws.amazon.com/blogs/machine-learning/evaluating-ai-agents-real-world-lessons-from-building-agentic-systems-at-amazon/", tier: "Tier 1 — Company engineering blog", use: "Primary source: agent architecture (shopping assistant, customer service, seller assistant), failure taxonomy, three-layer evaluation library, four-step workflow, HITL role." },
  { name: "LangChain — “State of Agent Engineering” (survey of 1,340 professionals, fielded Nov 18–Dec 2, 2025)", year: "2026", url: "https://www.langchain.com/state-of-agent-engineering", tier: "Tier 2 — Industry survey", use: "Industry-wide production adoption, observability, and evaluation-adoption statistics used in the Landscape section." },
  { name: "Embrace The Red (Johann Rehberger) — “Amazon Q Developer: Remote Code Execution with Prompt Injection”", year: "2025", url: "https://embracethered.com/blog/posts/2025/amazon-q-developer-remote-code-execution/", tier: "Tier 3 — Independent security research", use: "Readonly/mutate command misclassification vulnerability; disclosure and fix dates." },
  { name: "SC Media (Laura French) — “Amazon Q extension for VS Code reportedly injected with ‘wiper’ prompt”", year: "2025", url: "https://www.scworld.com/news/amazon-q-extension-for-vs-code-reportedly-injected-with-wiper-prompt", tier: "Tier 4 — Trade press reporting AWS statements", use: "Wiper-prompt supply-chain incident narrative, dates, install count, AWS spokesperson quotes." },
  { name: "AWSInsider (David Ramel) — “Formatting Flaw Foils Attempted Prompt Injection on Amazon Q”", year: "2025", url: "https://awsinsider.net/articles/2025/07/25/formatting-flaw-foils-attempted-prompt-injection-on-amazon-q.aspx", tier: "Tier 4 — Trade press citing AWS security bulletin", use: "AWS security bulletin (AWS-2025-015) details and official AWS statement." },
  { name: "Anthropic Engineering — “Building Effective Agents”", year: "2024", url: "https://www.anthropic.com/engineering/building-effective-agents", tier: "Tier 1 — Company engineering blog", use: "Orchestrator-workers pattern and agent-computer interface (ACI) framing used as an adjacent-capability comparison." }
];

/* --------------------------------------------------------------------------
   CROSS-ARTIFACT WARM-UP (drawn from prior completed articles)
   -------------------------------------------------------------------------- */
const WARM_UPS = [
  {
    prompt: "A bank wants one AI agent platform to power both a fraud-detection agent and a loan-approval-drafting agent. Based on a prior article's finding about how one company scaled agent capabilities without duplicating engineering effort, what should stay identical between the two agents, and what should be allowed to differ?",
    source: "One Platform, Two Jobs: How Meta's Capacity Efficiency Agents Scale MW Savings Without Scaling Headcount",
    lifecycle: "Build → Scale",
    principle: "One platform can serve structurally different jobs without duplicated engineering effort when the expensive, reusable machinery (tool interfaces) stays stable and only the layer that encodes domain judgment (skills) changes per job."
  },
  {
    prompt: "A smart-home company's AI agent can lock and unlock doors, and also chat with residents about their schedule. It has a rollback system so any door-state change can be reversed within seconds. Based on a prior article's distinction between two different kinds of agent-reliability fixes, would rollback alone be enough to stop the agent from behaving unreliably — looping, or giving contradictory answers — without ever touching a lock? Why or why not?",
    source: "How Replit Agent Actually Works: Reversibility Is the Architecture, Reliability Is a Runtime Layer",
    lifecycle: "Build → Scale",
    principle: "Reversibility and environment separation stop a destructive action from reaching anything that matters, but they are a different fix from the one needed to stop an agent from behaving unreliably — looping, or fabricating output — without doing anything destructive."
  },
  {
    prompt: "A scheduling AI agent silently skips asking for confirmation on any calendar change it classifies internally as “low-risk,” without telling the user which changes fall into that bucket. Based on a prior article's principle about invisible product decisions, what upstream question should the team ask about this silent classification before trusting it as a safety design?",
    source: "How GitHub Copilot Actually Works: Context Assembly, the Filter Gate, and a Reward Function Rebuilt Twice",
    lifecycle: "Build → Evaluate → Scale",
    principle: "A silent, upstream decision not to act (or to skip a check) is as much a product decision as any visible UI choice, and it inherits whatever proxy metric the system was tuned against — audit that metric directly."
  }
];

/* --------------------------------------------------------------------------
   SMALL UI PRIMITIVES
   -------------------------------------------------------------------------- */
function Callout({ kind, children }) {
  const styles = {
    note: { background: "#F8FAFC", border: "1px solid #E2E8F0" },
    amber: { background: "#FFFBEB", borderLeft: "3px solid #d97706" },
    fail: { background: "#FEF2F2", border: "1px solid #FCA5A5" }
  };
  return <div style={{ ...styles[kind], borderRadius: 8, padding: "14px 16px", margin: "16px 0", fontSize: 14.5, lineHeight: 1.6 }}>{children}</div>;
}

function ProvenanceNote({ children }) {
  return <div style={{ fontSize: 12.5, color: "#64748B", marginTop: 8, fontStyle: "italic" }}>{children}</div>;
}

function SectionHeading({ children, id }) {
  return <h2 id={id + "-heading"} style={{ fontSize: 24, marginTop: 40, marginBottom: 12, scrollMarginTop: 90 }}>{children}</h2>;
}

function Glossary({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "16px 18px", marginTop: 32 }}>
      <div style={{ fontWeight: 700, fontSize: 13, letterSpacing: 0.4, color: "#475569", textTransform: "uppercase", marginBottom: 10 }}>Glossary</div>
      {items.map((g, i) => (
        <div key={i} style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 6 }}>
          <strong>{g.term}</strong> — {g.def}
        </div>
      ))}
    </div>
  );
}

function PrincipleGate({ sectionId, value, onChange }) {
  const [submitted, setSubmitted] = useState(!!value && value.length >= 20);
  return (
    <Callout kind="note">
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Principle in one sentence</div>
      <div style={{ marginBottom: 10 }}>State the transferable principle from this section — something a PM or CTO at a different company could apply tomorrow. (Min. 20 characters. Not scored; you may move to any section regardless.)</div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={2}
        style={{ width: "100%", borderRadius: 6, border: "1px solid #CBD5E1", padding: 8, fontSize: 14, fontFamily: "inherit" }}
        placeholder="Type your one-sentence principle here..."
      />
      <div style={{ marginTop: 8 }}>
        <button
          disabled={!value || value.length < 20}
          onClick={() => setSubmitted(true)}
          style={btnStyle(!value || value.length < 20)}
        >
          {submitted ? "Submitted" : (value && value.length < 20 ? `Enter ${20 - value.length} more characters` : "Submit")}
        </button>
      </div>
      {submitted && value.length >= 20 && (
        <div style={{ marginTop: 10, padding: 10, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 6 }}>
          Your principle is saved to your Learning Summary for comparison against the authored version. This step never blocks navigation.
        </div>
      )}
    </Callout>
  );
}

function btnStyle(disabled) {
  return {
    background: disabled ? "#E2E8F0" : "#111",
    color: disabled ? "#94A3B8" : "#fff",
    border: "none",
    borderRadius: 6,
    padding: "8px 16px",
    fontSize: 14,
    cursor: disabled ? "not-allowed" : "pointer"
  };
}

/* --------------------------------------------------------------------------
   CHART INTERPRETATION WRAPPER (two independently-gated prompts)
   -------------------------------------------------------------------------- */
function ChartInterp({ chartId, prompts, state, setState }) {
  const st = state[chartId] || [{ submitted: false, text: "" }, { submitted: false, text: "" }];
  function update(i, patch) {
    const next = st.map((p, idx) => idx === i ? { ...p, ...patch } : p);
    setState(prev => ({ ...prev, [chartId]: next }));
  }
  return (
    <div style={{ margin: "18px 0 28px" }}>
      {prompts.map((p, i) => (
        <div key={i} style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: "14px 16px", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>
            Interpretation prompt {i + 1} · {p.kind}
          </div>
          <div style={{ marginBottom: 10, fontSize: 15 }}>{p.text}</div>
          {!st[i].submitted ? (
            <>
              <textarea
                value={st[i].text}
                onChange={e => update(i, { text: e.target.value })}
                rows={2}
                style={{ width: "100%", borderRadius: 6, border: "1px solid #CBD5E1", padding: 8, fontSize: 14, fontFamily: "inherit" }}
                placeholder="Your answer (min. 15 characters)..."
              />
              <div style={{ marginTop: 8 }}>
                <button
                  disabled={st[i].text.length < 15}
                  onClick={() => update(i, { submitted: true })}
                  style={btnStyle(st[i].text.length < 15)}
                >
                  {st[i].text.length < 15 ? `Enter ${15 - st[i].text.length} more characters` : "Submit"}
                </button>
              </div>
            </>
          ) : (
            <div>
              <div style={{ padding: 10, background: "#F8FAFC", borderRadius: 6, marginBottom: 8 }}>
                <strong>Your answer:</strong> {st[i].text}
              </div>
              <div style={{ padding: 10, background: "#ECFDF5", borderRadius: 6, border: "1px solid #A7F3D0" }}>
                <strong>Compare your answer to the authored one:</strong> {p.authored}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------------------
   MULTIPLE CHOICE (T-A, T-B, T-H share this; T-C is a styled variant)
   -------------------------------------------------------------------------- */
function MCQ({ id, tag, label, prompt, options, state, setState, styleVariant, registerScore }) {
  const q = state[id] || { selected: null, submitted: false, attemptCount: 0, scaffolding: false };
  useEffect(() => {
    if (q.submitted && registerScore) registerScore(id, !!(options[q.selected] && options[q.selected].correct));
  }, [q.submitted]);
  function select(i) {
    if (q.submitted) return;
    setState(prev => ({ ...prev, [id]: { ...q, selected: i } }));
  }
  function submit() {
    const correct = options[q.selected].correct;
    setState(prev => ({
      ...prev,
      [id]: { ...q, submitted: true, options, attemptCount: q.attemptCount + 1, scaffolding: !correct && q.attemptCount + 1 >= 2 }
    }));
  }
  function tryAgain() {
    setState(prev => ({ ...prev, [id]: { ...q, submitted: false, selected: null } }));
  }
  const wrapperStyle = styleVariant === "amber"
    ? { background: "#FFFBEB", borderLeft: "3px solid #d97706", borderRadius: 8, padding: "16px 18px", margin: "20px 0" }
    : { border: "1px solid #E2E8F0", borderRadius: 8, padding: "16px 18px", margin: "20px 0" };
  return (
    <div style={wrapperStyle}>
      {styleVariant === "amber" && <div style={{ fontSize: 12, fontWeight: 700, color: "#B45309", textTransform: "uppercase", marginBottom: 6 }}>Case Prompt</div>}
      <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>{label}</div>
      <div style={{ marginBottom: 12, fontSize: 15.5, whiteSpace: "pre-line" }}>{prompt}</div>
      <div style={{ display: "grid", gap: 8 }}>
        {options.map((opt, i) => {
          let border = "1px solid #CBD5E1", bg = "#fff";
          if (q.submitted) {
            if (opt.correct) { border = "1px solid #10B981"; bg = "#ECFDF5"; }
            else if (i === q.selected) { border = "1px solid #EF4444"; bg = "#FEF2F2"; }
          } else if (i === q.selected) { border = "2px solid #111"; }
          return (
            <div key={i}
              onClick={() => select(i)}
              style={{ border, background: bg, borderRadius: 8, padding: "10px 12px", cursor: q.submitted ? "default" : "pointer", fontSize: 14.5 }}>
              <strong>{String.fromCharCode(65 + i)}.</strong> {opt.text}
            </div>
          );
        })}
      </div>
      {!q.submitted && q.selected !== null && (
        <div style={{ marginTop: 10 }}><button style={btnStyle(false)} onClick={submit}>Submit</button></div>
      )}
      {q.selected === null && !q.submitted && (
        <div style={{ marginTop: 10, fontSize: 13, color: "#94A3B8" }}>Select an option to enable Submit.</div>
      )}
      {q.submitted && (
        <div style={{ marginTop: 12 }}>
          {options[q.selected].correct ? (
            <div style={{ padding: 10, background: "#ECFDF5", borderRadius: 6 }}>
              <strong>Correct</strong> — this reasoning pattern generalizes to {options[q.selected].generalizes}. {options[q.selected].explanation}
            </div>
          ) : (
            <div style={{ padding: 10, background: "#FEF2F2", borderRadius: 6 }}>
              <strong>Incorrect</strong> — this is {options[q.selected].errorName}: {options[q.selected].explanation}
            </div>
          )}
          <div style={{ marginTop: 8, fontSize: 13.5, color: "#475569" }}>
            {options.find(o => o.correct).whyCorrect}
          </div>
          {q.scaffolding && !options[q.selected].correct && (
            <Callout kind="note">
              <strong>Scaffolding:</strong> {options[q.selected].scaffold}
            </Callout>
          )}
          {!options[q.selected].correct && (
            <div style={{ marginTop: 8 }}>
              <button style={btnStyle(false)} onClick={tryAgain}>Try again</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
   TRUE / FALSE WITH JUSTIFICATION (T-G)
   -------------------------------------------------------------------------- */
function TrueFalseQ({ id, prompt, correctValue, authoredJustification, errorName, state, setState, registerScore }) {
  const q = state[id] || { choice: null, justification: "", submitted: false };
  useEffect(() => {
    if (q.submitted && registerScore) registerScore(id, q.choice === correctValue);
  }, [q.submitted]);
  function submit() {
    setState(prev => ({ ...prev, [id]: { ...q, submitted: true } }));
  }
  const canSubmit = q.choice !== null && q.justification.length >= 15;
  return (
    <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: "16px 18px", margin: "20px 0" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>True / False with justification</div>
      <div style={{ marginBottom: 12, fontSize: 15.5 }}>{prompt}</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {["True", "False"].map((label, i) => {
          const val = i === 0;
          let border = "1px solid #CBD5E1", bg = "#fff";
          if (q.submitted) {
            if (val === correctValue) { border = "1px solid #10B981"; bg = "#ECFDF5"; }
            else if (val === q.choice) { border = "1px solid #EF4444"; bg = "#FEF2F2"; }
          } else if (val === q.choice) border = "2px solid #111";
          return (
            <div key={label} onClick={() => !q.submitted && setState(prev => ({ ...prev, [id]: { ...q, choice: val } }))}
              style={{ flex: 1, textAlign: "center", border, background: bg, borderRadius: 8, padding: "10px 0", cursor: q.submitted ? "default" : "pointer", fontWeight: 600 }}>
              {label}
            </div>
          );
        })}
      </div>
      {!q.submitted && (
        <>
          <textarea
            value={q.justification}
            onChange={e => setState(prev => ({ ...prev, [id]: { ...q, justification: e.target.value } }))}
            rows={2}
            placeholder="Justify your answer in one sentence, naming the specific evidence (min. 15 characters)..."
            style={{ width: "100%", borderRadius: 6, border: "1px solid #CBD5E1", padding: 8, fontSize: 14, fontFamily: "inherit" }}
          />
          <div style={{ marginTop: 8 }}>
            <button disabled={!canSubmit} style={btnStyle(!canSubmit)} onClick={submit}>
              {q.choice === null ? "Select True or False" : (q.justification.length < 15 ? `Enter ${15 - q.justification.length} more characters` : "Submit")}
            </button>
          </div>
        </>
      )}
      {q.submitted && (
        <div style={{ marginTop: 8 }}>
          <div style={{ padding: 10, background: "#F8FAFC", borderRadius: 6, marginBottom: 8 }}>
            <strong>Your justification:</strong> {q.justification}
          </div>
          <div style={{ padding: 10, background: q.choice === correctValue ? "#ECFDF5" : "#FEF2F2", borderRadius: 6 }}>
            {q.choice === correctValue
              ? <><strong>Correct.</strong> Authored justification: {authoredJustification}</>
              : <><strong>Incorrect — this is {errorName}.</strong> Authored justification: {authoredJustification}</>}
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
   FERMI / NUMERIC ESTIMATION (T-D)
   -------------------------------------------------------------------------- */
function FermiQ({ id, prompt, assumptions, tolerancePct, answer, decomposition, scaffold, state, setState, min, max, step }) {
  const q = state[id] || { value: "", submitted: false };
  function submit() {
    setState(prev => ({ ...prev, [id]: { ...q, submitted: true } }));
  }
  const num = parseFloat(q.value);
  const withinTol = !isNaN(num) && Math.abs(num - answer) / answer <= tolerancePct;
  const farOff = !isNaN(num) && Math.abs(num - answer) / answer > 0.5;
  return (
    <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: "16px 18px", margin: "20px 0" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>Engineering estimation (Fermi) · tolerance ±{Math.round(tolerancePct * 100)}%</div>
      <div style={{ marginBottom: 10, fontSize: 15.5, whiteSpace: "pre-line" }}>{prompt}</div>
      <div style={{ background: "#F8FAFC", borderRadius: 6, padding: 10, marginBottom: 10, fontSize: 13.5 }}>
        <strong>Assumptions stated for this estimate (not reported by Amazon — supplied for the exercise):</strong> {assumptions}
      </div>
      {!q.submitted ? (
        <>
          <input type="range" min={min} max={max} step={step} value={q.value || min}
            onChange={e => setState(prev => ({ ...prev, [id]: { ...q, value: e.target.value } }))}
            style={{ width: "100%" }} />
          <input type="number" value={q.value}
            onChange={e => setState(prev => ({ ...prev, [id]: { ...q, value: e.target.value } }))}
            placeholder="Enter your estimate"
            style={{ width: 160, borderRadius: 6, border: "1px solid #CBD5E1", padding: 8, fontSize: 14, marginTop: 8 }} />
          <div style={{ marginTop: 8 }}>
            <button disabled={q.value === ""} style={btnStyle(q.value === "")} onClick={submit}>
              {q.value === "" ? "Enter a value to enable Submit" : "Submit"}
            </button>
          </div>
        </>
      ) : (
        <div>
          <div style={{ position: "relative", height: 40, margin: "16px 0" }}>
            <div style={{ position: "absolute", top: 18, left: 0, right: 0, height: 4, background: "#E2E8F0", borderRadius: 2 }} />
            <div style={{ position: "absolute", top: 0, left: `${Math.min(100, Math.max(0, (num - min) / (max - min) * 100))}%`, transform: "translateX(-50%)", fontSize: 12 }}>▼ You: {num}</div>
            <div style={{ position: "absolute", top: 24, left: `${Math.min(100, Math.max(0, (answer - min) / (max - min) * 100))}%`, transform: "translateX(-50%)", fontSize: 12, color: "#059669" }}>▲ Actual: {answer}</div>
          </div>
          <div style={{ padding: 10, borderRadius: 6, background: withinTol ? "#ECFDF5" : "#FEF2F2" }}>
            <strong>{withinTol ? "Within tolerance." : "Outside tolerance."}</strong> Decomposition: {decomposition}
          </div>
          {!withinTol && farOff && (
            <Callout kind="note"><strong>Scaffolding:</strong> {scaffold}</Callout>
          )}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
   PATTERN TRANSFER (T-F, free text)
   -------------------------------------------------------------------------- */
function PatternTransferQ({ id, prompt, state, setState }) {
  const q = state[id] || { text: "", submitted: false, checks: [false, false, false] };
  const canSubmit = q.text.length >= 50;
  return (
    <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: "16px 18px", margin: "20px 0" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", marginBottom: 6 }}>Pattern transfer · highest-order question</div>
      <div style={{ marginBottom: 10, fontSize: 15.5, whiteSpace: "pre-line" }}>{prompt}</div>
      {!q.submitted ? (
        <>
          <textarea
            value={q.text}
            onChange={e => setState(prev => ({ ...prev, [id]: { ...q, text: e.target.value } }))}
            rows={4}
            placeholder="Min. 50 characters. Name the principle, apply it non-trivially, and name a new failure mode..."
            style={{ width: "100%", borderRadius: 6, border: "1px solid #CBD5E1", padding: 8, fontSize: 14, fontFamily: "inherit" }}
          />
          <div style={{ marginTop: 8 }}>
            <button disabled={!canSubmit} style={btnStyle(!canSubmit)} onClick={() => setState(prev => ({ ...prev, [id]: { ...q, submitted: true } }))}>
              {canSubmit ? "Submit" : `Enter ${50 - q.text.length} more characters`}
            </button>
          </div>
        </>
      ) : (
        <div>
          <div style={{ padding: 10, background: "#F8FAFC", borderRadius: 6, marginBottom: 10 }}>{q.text}</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6 }}>Self-evaluation checklist:</div>
          {["Did I name the principle accurately?", "Is my application genuinely different from the original case?", "Is my failure mode new (not one already covered)?"].map((c, i) => (
            <label key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, fontSize: 14 }}>
              <input type="checkbox" checked={q.checks[i]} onChange={() => {
                const nc = q.checks.slice(); nc[i] = !nc[i];
                setState(prev => ({ ...prev, [id]: { ...q, checks: nc } }));
              }} />
              {c}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
   CHARTS
   -------------------------------------------------------------------------- */
function LandscapeChart1() {
  const data = [
    { metric: "Observability (any)", All: 89, Production: 94 },
    { metric: "Full tracing", All: 62, Production: 71.5 },
    { metric: "Online evals", All: 37.3, Production: 44.8 },
    { metric: "No evals at all", All: 29.5, Production: 22.8 }
  ];
  return (
    <div>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Chart 1. Evaluation maturity, all respondents vs. respondents already running agents in production</div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
          <YAxis unit="%" />
          <Tooltip formatter={v => v + "%"} />
          <Legend />
          <Bar dataKey="All" name="All respondents (n=1,340)" fill="#94A3B8">
            <LabelList dataKey="All" position="top" formatter={v => v + "%"} style={{ fontSize: 11 }} />
          </Bar>
          <Bar dataKey="Production" name="Respondents with agents in production" fill="#111">
            <LabelList dataKey="Production" position="top" formatter={v => v + "%"} style={{ fontSize: 11 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <ProvenanceNote>FACT (LangChain, 2026) — survey of 1,340 professionals fielded Nov 18–Dec 2, 2025.</ProvenanceNote>
    </div>
  );
}

function LandscapeChart2() {
  const data = [
    { metric: "Quality (all respondents)", value: 32 },
    { metric: "Latency (all respondents)", value: 20 },
    { metric: "Security (orgs ≥ 2,000 employees)", value: 24.9 }
  ];
  return (
    <div>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Chart 2. Top cited barriers to shipping agents to production, by population</div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" unit="%" />
          <YAxis type="category" dataKey="metric" width={210} tick={{ fontSize: 11.5 }} />
          <Tooltip formatter={v => v + "%"} />
          <Bar dataKey="value" fill="#d97706">
            <LabelList dataKey="value" position="right" formatter={v => v + "%"} style={{ fontSize: 11 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <ProvenanceNote>FACT (LangChain, 2026) — note the three bars are drawn from different survey populations, as labeled.</ProvenanceNote>
    </div>
  );
}

function ArchitectureSVG() {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Chart 3. Three agent topologies Amazon has published</div>
      <svg viewBox="0 0 680 320" style={{ maxWidth: 680, width: "100%" }}>
        <rect x="10" y="10" width="200" height="300" rx="8" fill="#F8FAFC" stroke="#E2E8F0" />
        <text x="110" y="30" textAnchor="middle" fontSize="12" fontWeight="700">Shopping assistant</text>
        <rect x="40" y="50" width="140" height="34" rx="6" fill="#fff" stroke="#111" />
        <text x="110" y="71" textAnchor="middle" fontSize="11">Orchestrating agent</text>
        <line x1="110" y1="84" x2="110" y2="104" stroke="#94A3B8" />
        <rect x="30" y="104" width="160" height="90" rx="6" fill="#fff" stroke="#94A3B8" />
        <text x="110" y="122" textAnchor="middle" fontSize="10">Tool layer:</text>
        <text x="110" y="138" textAnchor="middle" fontSize="10">100s–1,000s of</text>
        <text x="110" y="152" textAnchor="middle" fontSize="10">standardized</text>
        <text x="110" y="166" textAnchor="middle" fontSize="10">API tools</text>
        <text x="110" y="182" textAnchor="middle" fontSize="9" fill="#64748B">(schema-governed)</text>
        <text x="110" y="290" textAnchor="middle" fontSize="10" fill="#475569">One agent, big tool catalog</text>

        <rect x="240" y="10" width="200" height="300" rx="8" fill="#F8FAFC" stroke="#E2E8F0" />
        <text x="340" y="30" textAnchor="middle" fontSize="12" fontWeight="700">Customer service</text>
        <rect x="270" y="50" width="140" height="34" rx="6" fill="#fff" stroke="#111" />
        <text x="340" y="71" textAnchor="middle" fontSize="10">Orchestrator: intent detection</text>
        <line x1="340" y1="84" x2="290" y2="104" stroke="#94A3B8" />
        <line x1="340" y1="84" x2="390" y2="104" stroke="#94A3B8" />
        <rect x="255" y="104" width="80" height="34" rx="6" fill="#fff" stroke="#94A3B8" />
        <text x="295" y="125" textAnchor="middle" fontSize="9">Resolver A</text>
        <rect x="345" y="104" width="80" height="34" rx="6" fill="#fff" stroke="#94A3B8" />
        <text x="385" y="125" textAnchor="middle" fontSize="9">Resolver B</text>
        <text x="340" y="290" textAnchor="middle" fontSize="10" fill="#475569">Router → specialists</text>

        <rect x="470" y="10" width="200" height="300" rx="8" fill="#F8FAFC" stroke="#E2E8F0" />
        <text x="570" y="30" textAnchor="middle" fontSize="12" fontWeight="700">Seller assistant</text>
        <rect x="500" y="50" width="140" height="34" rx="6" fill="#fff" stroke="#111" />
        <text x="570" y="71" textAnchor="middle" fontSize="10">LLM planner / orchestrator</text>
        <line x1="530" y1="84" x2="510" y2="104" stroke="#94A3B8" />
        <line x1="570" y1="84" x2="570" y2="104" stroke="#94A3B8" />
        <line x1="610" y1="84" x2="630" y2="104" stroke="#94A3B8" />
        <rect x="485" y="104" width="50" height="30" rx="6" fill="#fff" stroke="#94A3B8" /><text x="510" y="123" textAnchor="middle" fontSize="8">Worker 1</text>
        <rect x="545" y="104" width="50" height="30" rx="6" fill="#fff" stroke="#94A3B8" /><text x="570" y="123" textAnchor="middle" fontSize="8">Worker 2</text>
        <rect x="605" y="104" width="50" height="30" rx="6" fill="#fff" stroke="#94A3B8" /><text x="630" y="123" textAnchor="middle" fontSize="8">Worker 3</text>
        <line x1="510" y1="134" x2="560" y2="160" stroke="#94A3B8" strokeDasharray="3 2" />
        <line x1="570" y1="134" x2="570" y2="160" stroke="#94A3B8" strokeDasharray="3 2" />
        <line x1="630" y1="134" x2="580" y2="160" stroke="#94A3B8" strokeDasharray="3 2" />
        <rect x="510" y="160" width="120" height="30" rx="6" fill="#fff" stroke="#111" />
        <text x="570" y="179" textAnchor="middle" fontSize="9">Aggregate &amp; synthesize</text>
        <text x="570" y="290" textAnchor="middle" fontSize="10" fill="#475569">Planner → parallel workers → merge</text>
      </svg>
      <ProvenanceNote>Structure: FACT (Amazon Web Services, 2026) — simplified rendering of the published description; no proprietary internals shown.</ProvenanceNote>
    </div>
  );
}

function FailureTable() {
  const rows = [
    ["Inappropriate planning (reasoning model)", "Agent commits to a plan that ignores available context", "Grounding accuracy / faithfulness score", "Middle (component)"],
    ["Invalid tool invocations", "Agent calls a tool that cannot handle the request", "Tool selection accuracy", "Middle (component)"],
    ["Malformed parameters", "Tool called with wrong or missing arguments", "Tool parameter accuracy", "Middle (component)"],
    ["Unexpected tool response formats", "Agent cannot parse what the tool returns", "Tool call error rate", "Middle (component)"],
    ["Authentication failures", "Agent's own tool call is rejected by the system it calls", "Tool call error rate", "Middle (component)"],
    ["Memory retrieval errors", "Wrong or stale context is pulled into the conversation", "Context retrieval", "Middle (component)"]
  ];
  return (
    <div>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Chart 4. Six failure families Amazon names, and the metric that targets each</div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F1F5F9" }}>
              {["Failure family", "Example symptom", "Amazon metric", "Evaluation layer"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid #CBD5E1" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #E2E8F0" }}>
                {r.map((c, j) => <td key={j} style={{ padding: "8px 10px", verticalAlign: "top" }}>{c}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ProvenanceNote>FACT (Amazon Web Services, 2026) — failure families and metric names quoted directly from the source; symptom column paraphrased for clarity.</ProvenanceNote>
    </div>
  );
}

function EvalStackSVG() {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Chart 5. Amazon's three-layer agent evaluation library</div>
      <svg viewBox="0 0 620 300" style={{ maxWidth: 560, width: "100%" }}>
        <rect x="60" y="20" width="500" height="70" rx="8" fill="#111" />
        <text x="310" y="45" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="700">Upper layer</text>
        <text x="310" y="63" textAnchor="middle" fontSize="10.5" fill="#E2E8F0">Final response · task completion · responsibility &amp; safety · cost</text>
        <text x="310" y="78" textAnchor="middle" fontSize="9.5" fill="#94A3B8">correctness, helpfulness, goal success, hallucination, toxicity</text>

        <rect x="60" y="105" width="500" height="70" rx="8" fill="#475569" />
        <text x="310" y="130" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="700">Middle layer</text>
        <text x="310" y="148" textAnchor="middle" fontSize="10.5" fill="#E2E8F0">Agent components · intent · tool-use · memory · reasoning</text>
        <text x="310" y="163" textAnchor="middle" fontSize="9.5" fill="#CBD5E1">tool selection/parameter accuracy, context retrieval, grounding</text>

        <rect x="60" y="190" width="500" height="70" rx="8" fill="#94A3B8" />
        <text x="310" y="215" textAnchor="middle" fontSize="13" fill="#fff" fontWeight="700">Bottom layer</text>
        <text x="310" y="233" textAnchor="middle" fontSize="10.5" fill="#F8FAFC">Foundation-model benchmarking</text>
        <text x="310" y="248" textAnchor="middle" fontSize="9.5" fill="#F1F5F9">which model, at what quality-vs-latency tradeoff</text>
        <line x1="310" y1="90" x2="310" y2="105" stroke="#111" markerEnd="url(#arrow)" />
        <line x1="310" y1="175" x2="310" y2="190" stroke="#111" markerEnd="url(#arrow)" />
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 z" fill="#111" />
          </marker>
        </defs>
      </svg>
      <ProvenanceNote>Structure: FACT (Amazon Web Services, 2026) — layer names and metric examples quoted/paraphrased directly from the source.</ProvenanceNote>
    </div>
  );
}

function IncidentTimelineSVG() {
  const events = [
    { x: 60, date: "Jul 4, 2025", label: ["Readonly/mutate", "misclassification", "reported to AWS"], color: "#94A3B8" },
    { x: 220, date: "Jul 13, 2025", label: ["Malicious PR merged;", "attacker gets", "admin credentials"], color: "#EF4444" },
    { x: 370, date: "Jul 17, 2025", label: ["v1.84.0 ships with", "wiper prompt; AWS", "ships fixed v1.85", "same day"], color: "#EF4444" },
    { x: 500, date: "Jul 19, 2025", label: ["AWS publishes", "security bulletin", "AWS-2025-015"], color: "#94A3B8" },
    { x: 610, date: "Aug 19, 2025", label: ["Researcher publicly", "discloses full", "technical detail"], color: "#94A3B8" }
  ];
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Chart 6. Amazon Q Developer incident timeline, July–August 2025</div>
      <svg viewBox="0 0 680 210" style={{ maxWidth: 680, width: "100%" }}>
        <line x1="40" y1="60" x2="650" y2="60" stroke="#CBD5E1" strokeWidth="2" />
        {events.map((e, i) => (
          <g key={i}>
            <circle cx={e.x} cy="60" r="6" fill={e.color} />
            <text x={e.x} y="45" textAnchor="middle" fontSize="10" fontWeight="700">{e.date}</text>
            {e.label.map((line, j) => (
              <text key={j} x={e.x} y={85 + j * 13} textAnchor="middle" fontSize="9.5" fill="#334155">{line}</text>
            ))}
          </g>
        ))}
      </svg>
      <ProvenanceNote>FACT (Embrace The Red, 2025; SC Media, 2025; AWSInsider, 2025) — dates as reported in cited sources.</ProvenanceNote>
    </div>
  );
}

/* --------------------------------------------------------------------------
   WARM-UP SCREEN
   -------------------------------------------------------------------------- */
function WarmUpScreen({ onDone }) {
  const [answers, setAnswers] = useState(["", "", ""]);
  const [submitted, setSubmitted] = useState([false, false, false]);

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{ fontSize: 26 }}>Before you begin — recall from your prior reading</h1>
        <p style={{ color: "#475569", marginBottom: 24 }}>
          Three questions drawn from articles you've already completed. Each asks you to apply a prior principle to a new situation — not to recall a company name or fact. This is retrieval practice, not scored assessment.
        </p>
        {WARM_UPS.map((w, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8, padding: 18, marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Warm-up {i + 1}</div>
            <div style={{ marginBottom: 10 }}>{w.prompt}</div>
            {!submitted[i] ? (
              <>
                <textarea rows={2} value={answers[i]}
                  onChange={e => { const a = answers.slice(); a[i] = e.target.value; setAnswers(a); }}
                  placeholder="Min. 25 characters..."
                  style={{ width: "100%", borderRadius: 6, border: "1px solid #CBD5E1", padding: 8, fontSize: 14, fontFamily: "inherit" }} />
                <div style={{ marginTop: 8 }}>
                  <button disabled={answers[i].length < 25} style={btnStyle(answers[i].length < 25)}
                    onClick={() => { const s = submitted.slice(); s[i] = true; setSubmitted(s); }}>
                    {answers[i].length < 25 ? `Enter ${25 - answers[i].length} more characters` : "Submit"}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: 10, background: "#F1F5F9", borderRadius: 6, fontSize: 14 }}>
                <div><strong>Source article:</strong> {w.source} ({w.lifecycle})</div>
                <div style={{ marginTop: 6 }}><strong>Principle tested:</strong> {w.principle}</div>
              </div>
            )}
          </div>
        ))}
        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button style={btnStyle(false)} onClick={() => onDone(submitted.filter(Boolean).length, submitted.every(Boolean))}>
            Continue to article
          </button>
          <button style={{ background: "none", border: "1px solid #CBD5E1", borderRadius: 6, padding: "8px 16px", fontSize: 14, color: "#64748B", cursor: "pointer" }}
            onClick={() => onDone(0, false)}>
            Skip warm-up
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   HEADER / NAV
   -------------------------------------------------------------------------- */
const PHASES = ["Feasibility", "Design", "Build", "Evaluate", "Deploy", "Scale", "Govern"];
const ACTIVE_PHASES = ["Build", "Evaluate", "Scale"];

function LifecycleStrip() {
  return (
    <div style={{ display: "flex", gap: 4, padding: "6px 16px", fontSize: 10.5, flexWrap: "wrap" }}>
      {PHASES.map(p => (
        <span key={p} style={{
          padding: "2px 8px", borderRadius: 10,
          background: ACTIVE_PHASES.includes(p) ? "#111" : "#E2E8F0",
          color: ACTIVE_PHASES.includes(p) ? "#fff" : "#64748B",
          fontWeight: ACTIVE_PHASES.includes(p) ? 700 : 400
        }}>{p}</span>
      ))}
    </div>
  );
}

function Header({ progress }) {
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#fff", borderBottom: "1px solid #E2E8F0" }}>
      <div style={{ height: 4, background: "#E2E8F0" }}>
        <div style={{ height: 4, background: "#111", width: `${progress}%`, transition: "width .2s" }} />
      </div>
      <div style={{ padding: "10px 16px 4px" }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Grading the Task Isn't Enough: Amazon's Three-Layer Answer to Why Agents Fail</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 4 }}>
          <span style={{ fontSize: 11, background: "#EFF6FF", color: "#1D4ED8", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>Agentic System Architecture (Type 3)</span>
          <span style={{ fontSize: 11.5, color: "#64748B" }}>← Prev: AI Product Teardown (Type 2)</span>
          <span style={{ fontSize: 11.5, color: "#64748B" }}>Next: AI-Native System Design (Type 4) →</span>
        </div>
      </div>
      <LifecycleStrip />
    </div>
  );
}

const NAV_ITEMS = [
  { id: "intro", label: "Introduction" },
  { id: "landscape", label: "Landscape" },
  { id: "rq1", label: "RQ1 · Architecture" },
  { id: "rq2", label: "RQ2 · Reliability" },
  { id: "rq3", label: "RQ3 · Evaluation" },
  { id: "broke", label: "What Broke" },
  { id: "summary", label: "Learning Summary" },
  { id: "conclusion", label: "Conclusion" }
];

function SectionNav({ active, onNav, wide }) {
  if (!wide) return null;
  return (
    <div style={{ position: "fixed", top: 130, left: "max(8px, calc(50% - 480px))", width: 170 }}>
      {NAV_ITEMS.map(item => (
        <div key={item.id} onClick={() => onNav(item.id)}
          style={{
            padding: "8px 10px", fontSize: 13, cursor: "pointer", borderRadius: 6,
            borderLeft: active === item.id ? "3px solid #111" : "3px solid transparent",
            background: active === item.id ? "#F1F5F9" : "transparent",
            fontWeight: active === item.id ? 700 : 400, color: active === item.id ? "#111" : "#64748B"
          }}>
          {item.label}
        </div>
      ))}
    </div>
  );
}

function ScoreBadge({ score, total }) {
  return (
    <div style={{ position: "fixed", top: 8, right: 12, zIndex: 30, background: "#111", color: "#fff", borderRadius: 20, padding: "5px 12px", fontSize: 12.5, fontWeight: 700 }}>
      Score: {score}/{total}
    </div>
  );
}

/* --------------------------------------------------------------------------
   MAIN APP
   -------------------------------------------------------------------------- */
function App() {
  const [screen, setScreen] = useState("warmup");
  const [warmUpResult, setWarmUpResult] = useState({ completed: 0, all: false, skipped: false });
  const [active, setActive] = useState("intro");
  const [wide, setWide] = useState(window.innerWidth > 1160);
  const [interp, setInterp] = useState({});
  const [mcq, setMcq] = useState({});
  const [tf, setTf] = useState({});
  const [fermi, setFermi] = useState({});
  const [ptf, setPtf] = useState({});
  const [principle, setPrinciple] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [showConclusion, setShowConclusion] = useState(false);
  const [insightSlot, setInsightSlot] = useState("");
  const [insightRevealed, setInsightRevealed] = useState(false);
  const [applyPresent, setApplyPresent] = useState({ thesis: "", assumption: "", disconfirm: "", premortem: "", submitted: false });
  const [apply2027, setApply2027] = useState({});
  const [progressPct, setProgressPct] = useState(0);
  const [scoreRegistry, setScoreRegistry] = useState({});

  useEffect(() => {
    function onResize() { setWide(window.innerWidth > 1160); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (screen !== "article") return;
    function onScroll() {
      const offset = 140;
      let current = NAV_ITEMS[0].id;
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top - offset <= 0) current = item.id;
      }
      setActive(current);
      const doc = document.documentElement;
      const pct = Math.min(100, Math.max(0, (window.scrollY / (doc.scrollHeight - window.innerHeight)) * 100));
      setProgressPct(pct);
    }
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [screen, showSummary, showConclusion]);

  function navTo(id) {
    if (id === "summary") setShowSummary(true);
    if (id === "conclusion") setShowConclusion(true);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 30);
  }

  function registerScore(id, correct) {
    setScoreRegistry(prev => (prev[id] === correct ? prev : { ...prev, [id]: correct }));
  }
  const scoreEntries = Object.values(scoreRegistry);
  const score = scoreEntries.filter(Boolean).length;
  const totalAnswered = scoreEntries.length;

  if (screen === "warmup") {
    return <WarmUpScreen onDone={(completed, all) => { setWarmUpResult({ completed, all, skipped: completed === 0 }); setScreen("article"); }} />;
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 20px 80px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif", color: "#111", lineHeight: 1.7, fontSize: 16 }}>
      <Header progress={progressPct} />
      <ScoreBadge score={score} total={7} />
      <SectionNav active={active} onNav={navTo} wide={wide} />

      <Introduction />
      <Landscape interp={interp} setInterp={setInterp} />
      <RQ1Architecture interp={interp} setInterp={setInterp} mcq={mcq} setMcq={setMcq} fermi={fermi} setFermi={setFermi}
        ptf={ptf} setPtf={setPtf} principle={principle} setPrinciple={setPrinciple} registerScore={registerScore} />
      <RQ2Reliability interp={interp} setInterp={setInterp} mcq={mcq} setMcq={setMcq} tf={tf} setTf={setTf}
        ptf={ptf} setPtf={setPtf} principle={principle} setPrinciple={setPrinciple} registerScore={registerScore} />
      <RQ3Evaluation interp={interp} setInterp={setInterp} mcq={mcq} setMcq={setMcq} fermi={fermi} setFermi={setFermi}
        ptf={ptf} setPtf={setPtf} principle={principle} setPrinciple={setPrinciple} registerScore={registerScore} />
      <WhatBroke interp={interp} setInterp={setInterp} mcq={mcq} setMcq={setMcq} registerScore={registerScore} />

      <div style={{ textAlign: "center", margin: "40px 0" }}>
        <button style={btnStyle(false)} onClick={() => navTo("summary")}>Open Learning Summary →</button>
      </div>

      {showSummary && (
        <LearningSummary
          principle={principle} mcq={mcq} tf={tf} fermi={fermi} score={score} total={7}
          warmUpResult={warmUpResult}
          insightSlot={insightSlot} setInsightSlot={setInsightSlot} insightRevealed={insightRevealed} setInsightRevealed={setInsightRevealed}
          applyPresent={applyPresent} setApplyPresent={setApplyPresent}
          apply2027={apply2027} setApply2027={setApply2027} registerScore={registerScore}
          onContinue={() => navTo("conclusion")}
        />
      )}

      {showConclusion && (
        <Conclusion ptf={ptf} setPtf={setPtf} />
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
   SECTION: INTRODUCTION
   -------------------------------------------------------------------------- */
function Introduction() {
  return (
    <section id="intro" style={{ paddingTop: 24 }}>
      <Callout kind="note">
        <strong>Governing principle.</strong> A production agent is not one thing to grade. It is a chain of separate decisions — understanding the request, picking a tool, reading back the tool's answer, deciding what to do next — and any single link in that chain can break while the final answer still looks fine, by luck or partial credit. Amazon built this lesson into a company-wide evaluation framework only after thousands of agents were already running in production, and this article uses that framework, and the near-miss that slipped past it, to test how far "grade the parts, not just the task" can be trusted as a rule.
      </Callout>

      <SectionHeading id="intro">Introduction</SectionHeading>
      <p>Grading an AI agent only on whether it finished the task hides exactly the information a team needs to fix it: which step broke. This article uses Amazon's own agent-evaluation framework, published by its AWS Machine Learning Blog team in February 2026, as the evidence (Amazon Web Services, 2026). Amazon is the right case not because it is famous, but because it has published, in unusual public detail, what changed in its own testing practice after moving from a handful of experimental agents to what its engineers call "thousands of agents built across Amazon organizations" since 2025 (Amazon Web Services, 2026). That scale is what forced the shift from "did it work?" to "which part failed, and why?"</p>
      <p>Amazon's own account describes three separate agent systems already running in production: an AI shopping assistant that calls hundreds, sometimes thousands, of internal tools; a customer-service agent that must correctly read a customer's intent before routing the conversation; and a seller-assistant system built from several cooperating agents rather than one (Amazon Web Services, 2026). This is not a niche problem. A 2026 industry survey of 1,340 engineering and product professionals found that 57.3% already run agents in production, up from 51% the year before, yet only 37.3% run any live, "online" evaluation against real traffic, and 22.8% of teams that already ship agents to production run no evaluation of any kind (LangChain, 2026). Most companies are shipping agents faster than they are learning to check the agents' own work.</p>
      <p>The conventional way to test an LLM feature was built for single-prompt systems: give the model a question, score the answer, done. Amazon's own engineers name the problem with carrying that method into agents directly: "Traditional LLM evaluation methods treat agent systems as black boxes and evaluate only the final outcome, failing to provide sufficient insights to determine why AI agents fail or pinpoint the root causes" (Amazon Web Services, 2026). An agent that eventually gives a customer the right answer might have gotten there after silently calling the wrong tool, or after retrieving the wrong memory and self-correcting by luck. A pass/fail grade on the final answer cannot tell a working system apart from one that got lucky.</p>
      <p>This article addresses three questions. First, how are Amazon's own production agents actually structured — what decides whether a team builds one agent with a big tool catalog, one agent that routes to specialists, or a team of cooperating agents? Second, what specific ways do these systems fail in production that a simple "did the task succeed" check would never catch, and what does Amazon do about it? Third, how does Amazon actually measure an agent's quality without just checking the final answer, and does that measurement framework have blind spots of its own?</p>

      <Glossary items={[
        { term: "LLM (Large Language Model)", def: "a model trained on huge amounts of text that generates or reasons about language." },
        { term: "Agent / agentic AI system", def: "software where an LLM decides, on its own, what steps and tools to use to complete a task, rather than following a fixed script." },
        { term: "Orchestrator", def: "the part of an agent system that decides what happens next — which tool to call, or which sub-agent to hand a task to." },
        { term: "Tool call", def: "a request an agent makes to an external system (an API, a database, a service) to get information or take an action." },
        { term: "Offline / online evaluation", def: "offline evaluation checks an agent's past, recorded actions after the fact; online evaluation checks the agent's behavior in real time, against live traffic." }
      ]} />
    </section>
  );
}

/* --------------------------------------------------------------------------
   SECTION: LANDSCAPE
   -------------------------------------------------------------------------- */
function Landscape({ interp, setInterp }) {
  return (
    <section id="landscape" style={{ paddingTop: 24 }}>
      <SectionHeading id="landscape">Technical and Product Landscape</SectionHeading>
      <p>Before agents, most companies measured an LLM feature the way they measured a search feature: run a fixed set of test prompts, score the outputs against a rubric, and ship when the average score clears a bar. This worked because a single LLM call is a single decision — the model reads a prompt and produces text. An agent is not a single decision. It is a loop: read the request, decide whether to call a tool, call it, read the result, decide the next step, and repeat until the task is done or the loop gives up. A test built for one decision cannot see inside a loop of many.</p>
      <p>Amazon is not alone in discovering this gap the hard way. LangChain's 2026 survey of 1,340 professionals building agents found that 57.3% of respondents already have agents running in production, up from 51% a year earlier, while only 37.3% run any online evaluation against live traffic, and 52.4% run offline evaluation on a fixed test set before shipping (LangChain, 2026). Put differently: more than half of the industry already trusts agents with real users, while fewer than four in ten are checking, in real time, whether those agents are still working. Even among teams that already have agents live in production, 22.8% report running no evaluation of any kind (LangChain, 2026).</p>

      <LandscapeChart1 />
      <ChartInterp chartId="chart-landscape-1" state={interp} setState={setInterp} prompts={[
        { kind: "So-what / decision rule", text: "Even among the 57.3% of teams already running agents in production, 22.8% still run no evaluation of any kind on live traffic. Using a threshold/decision-rule framework, at what point in an agent's rollout would you require online evals to move from optional to mandatory, and what in this chart tells you most teams currently treat that gate as optional?", authored: "A defensible rule: require an online eval before an agent is allowed to touch more than a small, capped share of live traffic (e.g., before graduating past a limited beta), because 44.8% of production teams already run online evals — meaning it's an achievable bar, not a hypothetical one — while the 22.8% with zero evaluation shows most teams currently treat that gate as a nice-to-have rather than a launch requirement." },
        { kind: "Quantitative reasoning", text: "Full tracing adoption moves from 62% (all respondents) to 71.5% (production respondents), a gain of 9.5 percentage points. Online eval adoption moves from 37.3% to 44.8%, a gain of 7.5 percentage points. Which of the two capabilities does production pressure appear to close faster, and by how much more?", authored: "Tracing closes faster: a 9.5-point gain versus a 7.5-point gain, a 2-point larger jump. That is consistent with tracing being the easier, more mechanical investment (instrument the calls, store the logs) while building a genuine evaluation practice requires defining what 'good' looks like for each use case — a harder, more judgment-heavy investment that production pressure alone doesn't close as quickly." }
      ]} />

      <p>Amazon's evaluation framework did not start from a blank slate; it started from scale that had already outrun the company's old testing habits. AWS's own account states that "since 2025, there have been thousands of agents built across Amazon organizations" (Amazon Web Services, 2026), and that builders faced real difficulty reconciling "multiple specific evaluation tools" scattered across teams, each locked into a different agent framework's own built-in evaluation module (Amazon Web Services, 2026). A company with one agent can get away with ad-hoc testing. A company with thousands cannot: without a shared framework, every team quietly invents its own definition of "working."</p>
      <p>The industry-wide barrier data points at the same root cause from a different angle. Quality — not cost, not raw model capability — is the single most-cited reason agents stall before reaching production, named by 32% of all respondents as their top blocker (LangChain, 2026); latency follows at 20%. Among larger organizations (2,000 or more employees), security overtakes latency as the second-biggest concern, cited by 24.9% of enterprise respondents (LangChain, 2026). None of this is a model-capability problem in the "the model isn't smart enough" sense. It is a measurement and trust problem: teams cannot yet tell, cheaply and continuously, whether their agent's quality and safety posture are holding up once real users start talking to it.</p>

      <LandscapeChart2 />
      <ChartInterp chartId="chart-landscape-2" state={interp} setState={setInterp} prompts={[
        { kind: "So-what / segmentation", text: "Quality (32%) is the top-cited barrier for all respondents, but security (24.9%) nearly matches it only among organizations with 2,000+ employees. Using a segmentation framework, how should a team selling agent-evaluation tooling change its pitch for a 200-person startup versus a 5,000-person enterprise buyer, based on this split?", authored: "Segment the pitch by what's actually the binding constraint: for a smaller team, lead with quality and speed to first working version, since latency (20%) and quality dominate at that scale; for a large enterprise buyer, lead with security and access-control features specifically, since that's the concern that rises sharply (to 24.9%, nearly tying quality) only once an organization is large enough to have a formal security review process in the way." },
        { kind: "Qualitative / mechanism", text: "Security only overtakes latency as a top-two concern at the enterprise segment, not in the all-respondent figure. What mechanism — about how organizations of different sizes build and review software — would explain why security concerns rise specifically with headcount rather than with, say, how advanced the agent is?", authored: "Larger organizations have dedicated security review functions, compliance obligations, and more valuable or regulated data — so the same agent behavior that a five-person startup would ship without a second thought triggers a formal security gate at a 5,000-person company. The concern rises with organizational process and stakes, not with the agent's technical sophistication, which is why it tracks headcount rather than latency." }
      ]} />

      <p>Amazon's response to that measurement gap is the subject of the rest of this article: a shared, cross-team evaluation library built in three layers, and three real production systems the company uses to show that library actually catching failures a final-answer grade would have missed. The gap between an agent that works in a demo and an agent whose failures a team can actually diagnose in production is exactly where this article's evidence begins.</p>

      <Glossary items={[
        { term: "Golden dataset", def: "a curated set of examples with known-correct answers, used as a stable benchmark to test a system before and after changes." },
        { term: "HITL (Human-in-the-loop)", def: "a process where a person reviews or approves an AI system's output or decision at some point, rather than the system running fully unsupervised." }
      ]} />
    </section>
  );
}

/* --------------------------------------------------------------------------
   SECTION: RQ1 ARCHITECTURE
   -------------------------------------------------------------------------- */
function RQ1Architecture({ interp, setInterp, mcq, setMcq, fermi, setFermi, ptf, setPtf, principle, setPrinciple, registerScore }) {
  const options = [
    {
      text: "The shopping assistant's single orchestrating agent choosing among 10x more tools — every added tool enlarges the same agent's tool-selection decision space and context window, which is exactly why Amazon's worker-split pattern exists for the seller assistant: to avoid overloading one agent's decision surface.",
      correct: true,
      whyCorrect: "This is correct because it names the specific mechanism (one agent's decision space growing linearly, or worse, with tool count) and points to Amazon's own architectural alternative as the evidence that this is a real, known bottleneck — not a hypothetical one.",
      generalizes: "any single-agent-plus-big-tool-catalog design, in any industry, once the catalog outgrows what one agent's context and reasoning can cleanly disambiguate"
    },
    {
      text: "The customer service orchestrator's intent-detection step, because it has to interpret more categories of customer request as the company and product catalog grow — every new tool added elsewhere in the company effectively adds new categories of question this step must learn to classify correctly.",
      correct: false,
      errorName: "confusing rate and level",
      explanation: "Intent detection's decision space grows with the variety of customer problems, not with the number of internal tools — a 10x increase in tools doesn't directly enlarge this specific component's decision space, so this confuses a different growth variable (tool count) for the one that actually strains this component (query variety).",
      scaffold: "Ask: what variable does a 10x tool increase actually change? It changes how many options the shopping assistant's agent has to choose among for each single decision — not how many types of customer question exist. Match the stress to the component whose workload that specific variable actually drives."
    },
    {
      text: "The seller assistant's aggregation step, because merging more worker outputs into one coherent final answer gets proportionally harder as the overall tool catalog grows — more tools available company-wide means more possible worker outputs the orchestrator has to reconcile into a single response.",
      correct: false,
      errorName: "applying classical software assumptions to AI",
      explanation: "The aggregation step's workload scales with how many concurrent subtasks a single request generates, not with the size of the overall tool catalog behind the whole system — assuming every orchestration step scales the same way regardless of what's actually varying is a classical-software instinct that doesn't hold for this specific architecture.",
      scaffold: "Trace the actual dependency: aggregation cost depends on subtasks-per-request, and the seller assistant's planner already limits that per request. A bigger tool catalog elsewhere in the company doesn't change how many subtasks any one seller request generates."
    },
    {
      text: "None of the three, because Amazon's cross-organizational tool-schema governance standard, once adopted company-wide, already prevents any single-agent bottleneck at any scale by keeping every tool's description clear enough for reliable selection regardless of how many tools exist.",
      correct: false,
      errorName: "survivorship bias",
      explanation: "A governance standard controls how well each tool is described — it doesn't reduce the cost of an agent choosing among more of them at inference time; assuming a documented best practice guarantees success at 10x the scale it was described at, just because it worked at the described scale, is the survivorship-bias trap.",
      scaffold: "Separate two different things the standard does and doesn't do: it makes each tool's description clearer (which helps accuracy), but it doesn't shrink the number of tools the agent has to consider, or the context budget that scales with that number."
    }
  ];

  return (
    <section id="rq1" style={{ paddingTop: 24 }}>
      <SectionHeading id="rq1">RQ1 — How Is a Production Agent Actually Structured?</SectionHeading>
      <p>The first question is architectural: when Amazon's own teams design a production agent, what decides whether they build one agent with a very large tool catalog, one agent that routes to a set of specialists, or a team of several agents that plan and divide the work? The thesis this section defends is that the choice tracks a specific property of the task — how predictable the needed steps are in advance — not company preference or model capability.</p>
      <p>Get this wrong and the cost shows up as either wasted engineering (building a multi-agent system for a task simple enough for one agent and a big tool list) or a scaling wall (cramming an unbounded, unpredictable task into one agent's decision loop). Amazon's own shopping assistant shows the raw material of the second failure mode directly: it must onboard "hundreds, sometimes thousands, of tools from underlying Amazon systems" just to let one agent handle customer profiling, product discovery, and order placement in a single running conversation (Amazon Web Services, 2026).</p>
      <p>For the shopping assistant, Amazon's account describes a single orchestrating agent sitting on top of a very large, standardized tool layer, not a team of sub-agents. Every task the shopping assistant handles — look up a product, check inventory, place an order — draws from the same pool of well-defined API calls; the tools are numerous, but the pattern of using them is predictable enough that one agent's tool-selection logic can handle it, provided the tools are described clearly. Amazon's engineers write that "poorly defined tool schemas and imprecise semantic descriptions result in erroneous tool selection during agent runtime," so the company built a cross-organizational governance standard for how every tool's schema must be written, then automated the painful part with an "API self-onboarding system that uses LLMs to automate the generation of standardized tool schemas and descriptions" (Amazon Web Services, 2026). Manually writing schemas for that many tools, the same account notes, "typically takes months to complete" without this automation.</p>
      <p>The customer-service agent shows a different pattern for a different reason. Here, the first decision an incoming message needs is not "which tool" but "which kind of problem is this" — a billing question is not a returns question is not a technical-support question. Amazon's account describes "an orchestration AI agent using its reasoning model to accurately detect customer intent," which then routes the conversation "to the appropriate specialized resolver implemented by agent tools or subagents" (Amazon Web Services, 2026). The architecture is a router in front of specialists, because the task's first and most important decision is classification, not tool selection — get the intent wrong, and "queries get routed to the wrong specialized resolvers, customers receive irrelevant responses, and frustration builds" (Amazon Web Services, 2026).</p>
      <p>The seller-assistant system goes a step further into genuine multi-agent territory, because a seller's request cannot be decomposed into a fixed set of subtasks in advance. Amazon describes "an LLM planner and task orchestrator" that "receives user requests, decomposes complex tasks into specialized subtasks, and intelligently assigns each subtask to the most appropriate underlying agent based on their capabilities and current workload," with each specialized agent then working autonomously and reporting results back to the orchestrator, which "aggregates these responses... and synthesizes the collective outputs into a coherent final result" (Amazon Web Services, 2026). This is architecture chosen because the subtasks themselves are not knowable ahead of time — the opposite condition from the shopping assistant's stable, well-defined tool catalog.</p>
      <p>The honest limit here is that Amazon's own published account is heavy on structure and light on outcome numbers: nowhere does the post state how much faster the self-onboarding system is than the "months" it replaces, or what the seller assistant's actual task-success rate is in production. A reader has to trust the architectural reasoning on its own terms; the pattern of which structure Amazon chose for which task is well documented, but the payoff of choosing correctly, in hard numbers, is not.</p>
      <p>This matters because the temptation in agent design is to default to the most flexible pattern — a multi-agent planner — for everything, on the theory that more autonomy is strictly better. Amazon's own three cases argue against that default: the shopping assistant's single-agent-plus-big-tool-catalog design is deliberately less flexible than a multi-agent planner would be, and that constraint is a feature, not a limitation, precisely because the task doesn't need open-ended planning. Choosing the fanciest architecture for a task that doesn't require it adds coordination overhead and more places for errors to compound, for no matching benefit.</p>
      <p><strong>Adjacent capability.</strong> The same three-way split Amazon draws — single agent with tools, router-to-specialists, and full multi-agent planning — echoes a pattern Anthropic has separately documented from its own work with agent-building customers. Anthropic's engineering team distinguishes "workflows," where the path through tools is fixed in code ahead of time, from "agents," where the model decides its own path step by step, and names "orchestrator-workers" — a lead model that breaks down a task and hands pieces to worker models, then combines their answers — as the pattern to reach for specifically when the subtasks "aren't pre-defined, but determined by the orchestrator based on the specific input" (Anthropic, 2024). That description matches Amazon's seller assistant almost exactly, which suggests the pattern is not an Amazon-specific invention but a structural answer multiple companies converge on independently once a task's subtasks stop being predictable in advance.</p>

      <ArchitectureSVG />
      <ChartInterp chartId="chart-rq1" state={interp} setState={setInterp} prompts={[
        { kind: "So-what / segmentation", text: "The shopping assistant integrates hundreds to thousands of tools behind one orchestrating agent, while the seller assistant splits work across multiple specialized worker agents instead of adding more tools to one agent. Using a segmentation framework, what property of a task should decide whether a team scales by adding tools to one agent versus splitting into multiple specialized agents?", authored: "Segment by predictability of steps, not by tool count: if every request draws from the same well-defined menu of actions (however large), keep one agent and invest in tool-catalog governance; if the steps needed differ unpredictably request-to-request (planning, sequencing, delegation vary each time), split into a planner plus workers, because no fixed tool list can anticipate the combinations needed." },
        { kind: "Quantitative reasoning", text: "If “hundreds” means roughly 200–900 tools and “thousands” means 1,000 or more, estimate the order-of-magnitude difference in schema-review burden between the low and high end of Amazon's own stated range, and explain why manual onboarding that “typically takes months” per integration effort could not simply be scaled up linearly at the top of that range.", authored: "The range spans roughly a 5–10x difference in tool count (a few hundred to several thousand), which is close to an order of magnitude — meaning schema-review burden at the high end isn't just proportionally bigger, it's in a different management regime entirely (thousands of hand-written, hand-reviewed schemas), which is exactly why Amazon needed to automate generation rather than simply hiring more people to do the same manual process faster." }
      ]} />

      <MCQ id="rq1-ta" label="T-A · Architecture and system implication" registerScore={registerScore}
        prompt={"Based on the three architecture patterns Amazon has published, which component is most likely to become the bottleneck if the shopping assistant's tool catalog grows 10x without any change to the architecture, and what does that imply about where a PM should invest next?"}
        options={options} state={mcq} setState={setMcq} />

      <FermiQ id="rq1-td" state={fermi} setState={setFermi}
        prompt={"Amazon's team says manually onboarding APIs into agent-compatible tools “typically takes months” per integration effort, and the shopping assistant needs to onboard “hundreds, sometimes thousands” of tools. Using the stated assumptions below, roughly how many total engineer-months would it take to manually onboard the full tool catalog?"}
        assumptions={"300 tools (near the low end of Amazon's stated range); 2 months of dedicated engineering time per tool integration; treat this as pure total effort (ignore parallelism for this first estimate)."}
        tolerancePct={0.10} answer={600} min={0} max={1200} step={10}
        decomposition={"300 tools × 2 months/tool = 600 engineer-months of total effort."}
        scaffold={"If you're far off, check which factor you multiplied incorrectly — this is direct multiplication of two given numbers (tool count × months per tool), not a genuine open-ended Fermi guess. The most common error is forgetting to multiply and instead adding, or using the wrong tool count."} />

      <PatternTransferQ id="rq1-tf" state={ptf} setState={setPtf}
        prompt={"The principle from this section is: architecture should track how predictable a task's steps are, not the size of its tool catalog or a preference for autonomy. Apply it to a hospital network deciding how to build an AI system that handles both routine prescription-refill requests and complex multi-department discharge planning. What would a hospital IT team do differently for each of these two tasks, and what new failure mode would they face that did not appear in Amazon's e-commerce examples?"} />

      <PrincipleGate sectionId="rq1" value={principle["rq1"] || ""} onChange={v => setPrinciple(prev => ({ ...prev, rq1: v }))} />

      <Glossary items={[
        { term: "Subagent / worker agent", def: "a smaller, specialized agent that handles one piece of a larger task and reports back to a coordinating agent." },
        { term: "Schema", def: "a structured description of a tool's inputs, outputs, and purpose, written so a model can understand how and when to use it." },
        { term: "API self-onboarding", def: "using an LLM to automatically write the schema and description needed to turn an existing system's API into a tool an agent can call." }
      ]} />
    </section>
  );
}

/* --------------------------------------------------------------------------
   SECTION: RQ2 RELIABILITY
   -------------------------------------------------------------------------- */
function RQ2Reliability({ interp, setInterp, mcq, setMcq, tf, setTf, ptf, setPtf, principle, setPrinciple, registerScore }) {
  const tbOptions = [
    {
      text: "Because tool call error rate behaves like a deterministic engineering metric, similar to an HTTP status code returned by a web server, it can't meaningfully correlate with a model-quality metric like multi-turn accuracy, since one reflects fixed system plumbing and the other reflects the model's own judgment.",
      correct: false,
      errorName: "applying classical software assumptions to AI",
      explanation: "Treating a tool-call metric as purely 'deterministic and separate' from model-quality metrics misapplies a classical-software intuition; in an AI-native pipeline, both metrics are downstream of the same model behavior and the same input quality (like schema clarity), so they absolutely can move together for a real reason.",
      scaffold: "Ask what actually produces each number. Tool call error rate depends on whether the model picked a call the system could execute — that's model behavior, not a fixed engineering constant, so it's not walled off from a model-quality metric the way an HTTP status code would be."
    },
    {
      text: "Both metrics likely improved for the same upstream reason: Amazon's standardized tool schemas make each tool's purpose clearer to the model at every step, so the multi-turn accuracy gain and the error-rate drop are more likely two effects of one shared cause than one metric causing the other.",
      correct: true,
      whyCorrect: "This is correct because it identifies the shared upstream cause (schema standardization) that plausibly drives both metrics, which is the strongest reason to doubt a direct causal link between the two observed metrics themselves.",
      generalizes: "any pair of correlated quality metrics in a system that just received one shared upstream change (a schema rewrite, a prompt rewrite, a model swap)"
    },
    {
      text: "A drop in error rate doesn't necessarily mean a drop in the total number of errors if conversation volume grew at the same time, so the two metrics may not describe the same underlying change at all, even though both numbers moved in a favorable direction together.",
      correct: false,
      errorName: "confusing rate and level",
      explanation: "This is a real distinction in general, but it's not the strongest reason to doubt causation in this specific case, where both figures are already given as normalized rates/accuracy percentages — raising a rate-vs-level concern about numbers that are already rates is a plausible-sounding but misapplied version of that caution.",
      scaffold: "Check what units the two metrics are actually reported in here: both are already percentages/rates, not raw counts, so the rate-vs-level trap doesn't apply to this specific comparison the way it would if one number were a count and the other a percentage."
    },
    {
      text: "Because this is one successful Amazon deployment, any pattern observed here can't be assumed to generalize to teams whose schema-standardization rollouts failed elsewhere, since a single successful case says little about how often this specific metric relationship holds across the industry.",
      correct: false,
      errorName: "survivorship bias",
      explanation: "This is a reasonable general caution about generalizing from success stories, but it doesn't answer the specific question asked — why these two metrics moving together inside this one case shouldn't be read as one causing the other; it changes the subject to external generalizability instead.",
      scaffold: "Re-read the question: it asks about causation between two metrics inside one case, not about whether the finding generalizes to other companies. A true statement about a different topic isn't the strongest answer to the question actually asked."
    }
  ];

  const tcOptions = [
    {
      text: "That the underlying language model is already capable enough to handle insurance claims correctly out of the box, so any tool-selection or parameter mistakes it makes when calling MedClaims Direct's internal APIs are rare edge cases that general model capability, rather than a dedicated regression-testing process, will keep acceptably low over time.",
      correct: false,
      errorName: "scope creep misdiagnosis",
      explanation: "This blames general model capability, a nearby but different concern, instead of the specific practice actually being proposed and skipped — pre-launch regression testing with a golden dataset — which is the real load-bearing assumption in this plan.",
      scaffold: "Separate 'is the model smart enough in general' from 'do we have a way to catch this specific system's tool-use errors before they reach a customer.' The plan's real gap is the second one, regardless of how capable the underlying model is."
    },
    {
      text: "That engineers will eventually be available to build the golden dataset once real usage patterns are known well enough, so the team can safely treat the current testing gap as temporary and defer that whole regression-testing investment until after launch, without changing anything about how payment approvals are actually handled in the meantime.",
      correct: false,
      errorName: "single-cause fallacy",
      explanation: "Staffing availability later doesn't address the risk window between launch and that later date, when the agent is already approving payments without the regression safety net the article describes — this treats one incidental detail as if it resolves the actual risk.",
      scaffold: "Ask whether this assumption, even if true, removes the risk in question. Having engineers available next quarter doesn't protect a payment-approval decision made next week."
    },
    {
      text: "That early production tool calls, without a golden regression dataset, will surface tool-selection and parameter failures cheaply and safely enough to catch before real harm — an assumption Amazon's own account treats as unsafe to skip, since golden datasets exist specifically to catch these errors before they compound across a multi-turn conversation, and payment approvals are far harder to reverse than a shopping recommendation.",
      correct: true,
      whyCorrect: "This names the specific load-bearing assumption (that live traffic is a safe enough substitute for a pre-built regression test) and points to the thinnest evidence for it: Amazon's own account never suggests skipping golden datasets for actions as consequential as payment approval.",
      generalizes: "any plan to substitute live production traffic for pre-launch regression testing on an agent that takes hard-to-reverse actions"
    },
    {
      text: "That launching without a golden dataset is risky — which restates the conclusion leadership is already worried about rather than naming the specific, testable belief the launch plan depends on, so it does not actually answer what would have to be true for the plan to be safe.",
      correct: false,
      errorName: "hindsight bias in incident analysis",
      explanation: "Restating 'this is risky' doesn't identify what would have to be true for the plan to work anyway; a weakest-link answer has to name the specific belief the plan depends on, not repeat the concern in different words.",
      scaffold: "A weakest-link assumption is a testable belief the plan needs to be true, not a restatement of the worry itself. Ask: what would the team have to believe about their own traffic, volume, or error tolerance for this plan to be fine?"
    }
  ];

  return (
    <section id="rq2" style={{ paddingTop: 24 }}>
      <SectionHeading id="rq2">RQ2 — What Ways Do These Agents Actually Fail?</SectionHeading>
      <p>The second question is about failure: what specific ways do Amazon's production agents break that a simple pass/fail check on the final answer would never catch, and how does the company catch them instead? The thesis this section defends is that production-grade reliability work is mostly about building visibility into a chain of independent decisions, not about making any single decision more accurate.</p>
      <p>Amazon's own account is unusually specific about the failure types it watches for, because a black-box, outcome-only evaluation cannot even name them. The company describes needing to "measure the agent's ability to recognize diverse failure scenarios such as inappropriate planning from the reasoning model, invalid tool invocations, malformed parameters, unexpected tool response formats, authentication failures, and memory retrieval errors" (Amazon Web Services, 2026). Six distinct ways to fail, each needing its own detection method — a single "did the task succeed" metric collapses all six into one bit of information: yes or no.</p>
      <p>Amazon's evaluation library assigns a different, purpose-built metric to each of these failure families instead of one blended score. Tool call error rate tracks "the frequency of failures when an AI assistant makes tool calls"; tool parameter accuracy checks whether the assistant "correctly used contextual information when making tool calls"; multi-turn function-calling accuracy tracks whether tools "are being called" in "the correct sequence" across a conversation; and separate reasoning metrics — grounding accuracy, a faithfulness score, and a context score — check whether the model's chain-of-thought planning is actually anchored to what tools returned, rather than merely sounding plausible (Amazon Web Services, 2026). Each metric answers a different diagnostic question, and none of them, alone, tells the whole story.</p>
      <p>Detection is only half of reliability; the other half is recovery. Amazon's account states that "a production-grade agent must demonstrate consistent error recovery patterns and resilience in maintaining the coherence of user interactions after encountering exceptions" (Amazon Web Services, 2026) — meaning the evaluation framework doesn't just flag that a tool call failed, it checks whether the agent noticed the failure and adapted, rather than continuing to act on a bad result or silently giving up.</p>
      <p>Here again the published account favors structure over hard numbers: Amazon states which failure types it watches for and which metric targets each one, but does not publish what fraction of production conversations actually trigger, say, a malformed-parameter error or an authentication failure. A reader can verify that the diagnostic categories exist and map to real metrics; verifying how often each failure actually happens in Amazon's own traffic is not something the source supports.</p>
      <p>This layered approach is non-obvious because it runs against a natural instinct in software testing: find the one number that tells you if the system is healthy. That instinct works for a service with one job — a database either returns the right row or it doesn't. It fails for an agent, where a single conversation might involve a dozen small decisions and several tool calls before one final answer, and where a wrong final answer could trace back to any one of those decisions, or to none of them, since the agent might get lucky and land on the right final answer despite an internal error along the way, something a pass/fail metric would score as a full success.</p>
      <p><strong>Adjacent capability.</strong> Amazon is not the only company to have discovered that tool-use failures need their own category of testing, separate from output quality. Independent security research on a different Amazon system — the Amazon Q Developer coding assistant — later found a related but distinct failure mode: a command like <code>find</code>, capable of running arbitrary programs through its <code>-exec</code> flag, had been classified internally as a "readonly" command, so it was allowed to run without asking the developer's permission first (Embrace The Red, 2025). That is not a tool-parameter-accuracy failure or a tool-call-error-rate failure in Amazon's own taxonomy above — it is a permission-classification failure, a category the shopping-assistant and customer-service accounts don't explicitly name. This article returns to that exact incident in the What Broke section below.</p>

      <FailureTable />
      <ChartInterp chartId="chart-rq2" state={interp} setState={setInterp} prompts={[
        { kind: "Qualitative / mechanism", text: "Malformed tool parameters and unexpected tool response formats are both tool-use failures, but Amazon tracks them with different metrics (tool parameter accuracy vs. tool call error rate). What mechanism explains why a single 'did the tool call work?' metric can't catch both failure types?", authored: "A tool call can have perfectly valid parameters and still fail because the tool returns data in a format the agent doesn't expect (a schema change, an unexpected null field) — that's a failure in what comes back, not in what was sent. Conversely, a call can be malformed on the way out (wrong parameter, wrong type) and never even reach the point where a response format matters. Because the failure can originate on either side of the call, one blended metric would average away exactly which side broke." },
        { kind: "Causal / comparative", text: "Reasoning failures (inappropriate planning) and memory failures (retrieval errors) sit in different rows of this table with different owning metrics. If a team observed both symptoms in the same failed conversation, what is the strongest reason NOT to assume a single root cause explains both, and how does Amazon's separation of metrics support treating them independently?", authored: "A bad plan and a bad memory retrieval can each independently derail a conversation — a model can reason perfectly well from stale context (a memory failure with sound reasoning) or reason poorly from perfectly fresh context (a reasoning failure with sound memory). Assuming one caused the other, without evidence that the specific retrieved content was actually wrong, risks fixing the wrong layer; Amazon's decision to track context retrieval and grounding accuracy as separate metrics is a structural admission that these two failure sources are independent enough to need independent instrumentation." }
      ]} />

      <MCQ id="rq2-tb" label="T-B · Technical trend reasoning (causal distinction)" registerScore={registerScore}
        prompt={"Suppose a team observes tool call error rate drop at the same time multi-turn function-calling accuracy rises, right after a schema-standardization rollout. What is the strongest reason NOT to conclude that the lower tool-call error rate directly caused the multi-turn accuracy gain?"}
        options={tbOptions} state={mcq} setState={setMcq} />

      <MCQ id="rq2-tc" label="T-C · PM consulting case (weakest link)" styleVariant="amber" registerScore={registerScore}
        prompt={"MedClaims Direct, a mid-size health-insurance claims processor, is building an AI agent that looks up policy details, calculates claim eligibility, and issues payment approvals through internal APIs. Leadership wants to launch tool-selection and tool-parameter monitoring (following Amazon's pattern) but proposes skipping a golden regression-testing dataset at launch, planning to build one later “once we see what real usage looks like.” Which assumption must hold for this launch plan to create value without unacceptable risk, and what evidence in this article is thinnest in supporting it?"}
        options={tcOptions} state={mcq} setState={setMcq} />

      <TrueFalseQ id="rq2-tg" state={tf} setState={setTf} registerScore={registerScore}
        prompt={"True or False: because Amazon tracks a tool call error rate metric, an AI agent with a near-zero tool call error rate can be assumed to be reliable in production overall."}
        correctValue={false}
        authoredJustification={"False — Amazon's own account lists reasoning/planning failures, memory retrieval errors, and authentication failures as separate categories a tool-call-error-rate metric would not catch on its own; a low tool-call error rate is a necessary-sounding but not sufficient condition, and treating one middle-layer metric as a stand-in for the full three-layer stack over-generalizes a single number into a guarantee it was never designed to provide."}
        errorName={"confusing a metric for its cause"} />

      <PatternTransferQ id="rq2-tf" state={ptf} setState={setPtf}
        prompt={"The principle from this section is: production-grade reliability comes from separately instrumenting each way a system can fail, not from one blended success/fail score. Apply it to a fleet-logistics company whose AI dispatch agent assigns delivery drivers to routes and reroutes them when traffic changes. What would the operations team do differently, and what new failure mode would they face that did not appear in Amazon's tool-use examples?"} />

      <PrincipleGate sectionId="rq2" value={principle["rq2"] || ""} onChange={v => setPrinciple(prev => ({ ...prev, rq2: v }))} />

      <Glossary items={[
        { term: "Tool parameter accuracy", def: "whether an agent filled in a tool's inputs correctly, using the right values from the conversation." },
        { term: "Grounding", def: "whether a model's reasoning or answer is actually based on real information it retrieved, rather than made up." },
        { term: "Context window", def: "the limited amount of text (conversation history, retrieved documents, tool results) a model can consider at once when producing its next response." }
      ]} />
    </section>
  );
}

/* --------------------------------------------------------------------------
   SECTION: RQ3 EVALUATION
   -------------------------------------------------------------------------- */
function RQ3Evaluation({ interp, setInterp, mcq, setMcq, fermi, setFermi, ptf, setPtf, principle, setPrinciple, registerScore }) {
  const thOptions = [
    {
      text: "That Amazon has enough engineers to maintain three separate layers of metrics indefinitely, since building and operating a bottom, middle, and upper evaluation layer all at once requires dedicated headcount that a smaller team attempting the same architecture might not have available to sustain over time.",
      correct: false,
      errorName: "scope creep misdiagnosis",
      explanation: "Staffing capacity is a real operational concern, but it isn't load-bearing to the specific argument that layering improves diagnosability — removing this assumption would make the framework harder to maintain, not less true as a diagnostic idea.",
      scaffold: "Ask: if this assumption turned out false (not enough engineers), would the core claim 'layering helps diagnose failures' become false too, or just harder to sustain operationally? Load-bearing assumptions break the argument itself, not just its upkeep."
    },
    {
      text: "That Amazon Bedrock AgentCore Evaluations is the only platform capable of implementing these three layers, so the diagnostic benefit described in this section depends specifically on that platform's features and would not be available to a team building the same structure on different infrastructure.",
      correct: false,
      errorName: "single-cause fallacy",
      explanation: "The argument about layered diagnosability doesn't depend on which specific platform implements it — treating the platform choice as the load-bearing piece conflates one contributing implementation detail with the actual structural claim being tested.",
      scaffold: "Separate the idea (three layers of metrics improve diagnosis) from the implementation (AgentCore Evaluations). The idea could be true or false regardless of which platform happens to host it."
    },
    {
      text: "That customers ultimately care whether an agent's failures are diagnosable at all, so the value of building three separate evaluation layers depends on end users noticing and rewarding that internal diagnostic capability, rather than the engineering team simply using it to fix problems faster on its own.",
      correct: false,
      errorName: "hindsight bias in incident analysis",
      explanation: "Customer preference is external to whether the internal engineering claim holds; even if customers never noticed the difference, the layered metrics could still be true or false as a diagnostic tool for the engineering team building the agent.",
      scaffold: "Ask whether this assumption is about the argument's internal logic or about something outside it entirely (market demand). Load-bearing assumptions sit inside the reasoning chain, not outside it."
    },
    {
      text: "That the metrics genuinely isolate each component's contribution to a failure — if a single upstream error, like a bad tool schema, simultaneously degrades tool-selection accuracy, grounding accuracy, and final-response correctness all at once, then three separately named layers don't actually let a team localize the root cause; they just give one symptom three different labels.",
      correct: true,
      whyCorrect: "This is the load-bearing assumption: remove it, and the entire case for layering as a diagnostic improvement collapses, even though every metric Amazon describes remains exactly as stated — which is exactly what makes an assumption truly load-bearing rather than incidental.",
      generalizes: "any multi-metric or multi-dashboard evaluation system, in any domain, where the metrics might share a common upstream cause instead of measuring genuinely independent failure sources"
    }
  ];

  return (
    <section id="rq3" style={{ paddingTop: 24 }}>
      <SectionHeading id="rq3">RQ3 — How Does Amazon Actually Measure Agent Quality?</SectionHeading>
      <p>The third question is about the measurement system itself: how does Amazon actually score an agent's quality without simply checking whether the final answer was right, and does that scoring system have blind spots of its own? The thesis this section defends is that a good evaluation framework is layered to match the layered way an agent can fail — and that layering, while a real advance over single-score grading, is not the same thing as complete coverage.</p>
      <p>Building three separate layers of measurement is expensive relative to one blended score, and it only pays off if each layer catches something the others would miss. Amazon's account describes exactly this three-layer design: a bottom layer that "benchmarks multiple foundation models to select the appropriate models powering the AI agent," a middle layer that "evaluates the performance of the components of the agent, including intent detection, multi-turn conversation, memory, LLM reasoning and planning, tool-use," and an upper layer that "assesses the agent's final response, the task completion, and whether the agent meets the goal defined in the use case," along with "responsibility and safety, the costs, and the customer experience impacts" (Amazon Web Services, 2026).</p>
      <p>The workflow around this library is built to run continuously, not just once before launch. Amazon describes a four-step loop: collect execution traces (offline, after a task finishes, or online, in real time); run the traces through the evaluation library to generate metrics; store and visualize the results; then feed the results into "agent performance auditing and monitoring," where "builders can define their own rules to send notifications upon agent performance degradation" (Amazon Web Services, 2026). A one-time pre-launch test can catch a bad model release; only a continuous loop like this can catch an agent that was fine at launch and quietly degraded months later as real user behavior shifted.</p>
      <p>The framework also treats human review as a required component, not an optional add-on, specifically where automated metrics are weakest. Amazon's account states that human-in-the-loop review "provides essential evaluation of agent reasoning chains, the coherence of multi-step workflows, and the alignment of agent behavior with business requirements," and that it also supplies "ground truth labels for building golden testing datasets, and calibration of LLM-as-a-judge in the automatic evaluator to align with human preferences" (Amazon Web Services, 2026) — in other words, humans don't just check the agent's work, they check the automated checker's work too.</p>
      <p>For the seller-assistant multi-agent system specifically, Amazon adds metrics that don't exist in a single-agent evaluation vocabulary at all: a planning score for whether subtasks were assigned to the right sub-agent, a communication score for how the agents exchanged messages while completing a subtask, and a collaboration success rate for the percentage of subtasks completed successfully (Amazon Web Services, 2026). None of these three metrics would mean anything for the single-agent shopping assistant — they only exist because a multi-agent system introduces an entirely new place to fail: the handoff between agents, not just any single agent's own reasoning.</p>
      <p>The framework's stated blind spot is its own list of what it evaluates: quality, performance, responsibility and safety, and cost (Amazon Web Services, 2026). Reading that list carefully, there is no explicit category for the integrity of the instructions the agent is running on in the first place — whether the system prompt, tool definitions, or context the agent trusts have themselves been tampered with before the agent ever starts reasoning. A hallucination metric checks whether the agent's output matches reality; it does not check whether the agent's inputs were honest to begin with.</p>
      <p>This gap is easy to miss because "evaluate the agent" sounds like it should cover everything the agent does, including what it was told to do. But every metric in Amazon's library — correctness, faithfulness, tool selection accuracy, grounding accuracy, hallucination, toxicity — is a function of the agent's behavior given its inputs. None of them is a function of whether those inputs were supplied by a trusted source in the first place. A perfectly-scoring agent, by every one of Amazon's published metrics, could still be acting on a compromised system prompt and pass every test, because the tests were never designed to look upstream of the agent's own reasoning.</p>
      <p><strong>Adjacent capability.</strong> This distinction — evaluating behavior versus verifying the integrity of instructions — has a name in the broader security research community: prompt injection, where untrusted content (a file, a web page, a tool's response) is crafted to look like an instruction the model should follow. Anthropic's own agent-building guidance, aimed at developers rather than security researchers, treats this mostly as a tool-design problem — "carefully craft your agent-computer interface... through thorough tool documentation and testing" (Anthropic, 2024) — which is necessary but, as the next section shows, not sufficient once an attacker can influence what a tool or a source file contains before the agent ever reads it.</p>

      <EvalStackSVG />
      <ChartInterp chartId="chart-rq3" state={interp} setState={setInterp} prompts={[
        { kind: "So-what / prioritization", text: "If your team can only build one of the three layers first — model benchmarking (bottom), component evaluation (middle), or final-response grading (upper) — and your current problem is “the agent completes tasks but we don't know why it occasionally fails,” which layer should you prioritize first using a Now-Next-Later roadmap, and what in Amazon's stated failure list justifies that order?", authored: "Prioritize the middle layer first (Now), then the upper layer (Next), then the bottom layer (Later): Amazon's six named failure types (planning, invalid tool calls, malformed parameters, unexpected formats, authentication failures, memory errors) are all component-level, not model-selection-level, problems — so component evaluation is what directly answers 'why did it fail,' while final-response grading only tells you whether it failed, and model benchmarking is about picking a model, a decision made rarely, not a diagnostic tool for ongoing failures." },
        { kind: "Qualitative / mechanism", text: "Why does Amazon's middle layer (component evaluation) need to exist at all if the upper layer already grades whether the final task succeeded? What can a passing final-response grade hide that only component-level metrics like tool selection accuracy or grounding accuracy would catch?", authored: "A final answer can be correct by chance even after an internal misstep — for example, the agent calls a slightly wrong tool, gets a response close enough to the right answer anyway, and still produces a passing final response. The upper layer would score this a full success. Only a middle-layer metric like tool selection accuracy would show that the correct outcome didn't come from a correct process, which matters because that same process, run again on a slightly different input, might not get lucky twice." }
      ]} />

      <MCQ id="rq3-th" label="T-H · Critical reasoning — Assumption" registerScore={registerScore}
        prompt={"The argument that Amazon's three-layer evaluation library makes agent failures easier to diagnose depends on evidence that Amazon built specific, separate metrics for tool use, memory, reasoning, and safety. Which assumption, if false, would break this argument even though Amazon's stated metrics remain exactly as described?"}
        options={thOptions} state={mcq} setState={setMcq} />

      <FermiQ id="rq3-td" state={fermi} setState={setFermi}
        prompt={"Amazon describes building golden regression-testing datasets “generated synthetically using LLMs from historical API invocation logs.” Build your own decomposition path, then estimate: using the stated assumptions, roughly how many reviewer-hours would it take to human-spot-check a 2% sample of one day's tool-invoking conversations for the shopping assistant?"}
        assumptions={"50,000 tool-invoking conversations that day (assumption for this exercise); 2% sampling rate; 6 minutes per human review."}
        tolerancePct={0.10} answer={100} min={0} max={300} step={5}
        decomposition={"50,000 × 2% = 1,000 conversations sampled. 1,000 × 6 minutes = 6,000 minutes = 100 reviewer-hours."}
        scaffold={"Build the chain explicitly: total conversations × sampling rate = conversations reviewed; conversations reviewed × minutes per review = total minutes; convert minutes to hours by dividing by 60. Check each step separately to find where your number diverged."} />

      <PatternTransferQ id="rq3-tf" state={ptf} setState={setPtf}
        prompt={"The principle from this section is: a layered evaluation framework can catch failures a single blended score would miss, but every layer still only evaluates the agent's behavior, not the integrity of what it was told to do. Apply this to a university's AI admissions-essay screening agent that reads applicant essays and flags ones for human review. What would the university's IT team do differently from Amazon's approach, and what new failure mode would they face that did not appear in this article's evidence?"} />

      <PrincipleGate sectionId="rq3" value={principle["rq3"] || ""} onChange={v => setPrinciple(prev => ({ ...prev, rq3: v }))} />

      <Glossary items={[
        { term: "FM (Foundation model) benchmarking", def: "testing and comparing different base AI models against each other before choosing which one to build a product on." },
        { term: "LLM-as-judge", def: "using one AI model to automatically score or evaluate the output of another AI system, instead of relying only on humans." },
        { term: "Chain-of-thought (CoT)", def: "the step-by-step reasoning a model produces on the way to an answer, which can itself be checked for whether it makes sense." },
        { term: "Prompt injection", def: "an attack where untrusted text is written to look like an instruction, tricking an AI system into following it as if it came from its real operator." }
      ]} />
    </section>
  );
}

/* --------------------------------------------------------------------------
   SECTION: WHAT BROKE
   -------------------------------------------------------------------------- */
function WhatBroke({ interp, setInterp, mcq, setMcq, registerScore }) {
  const failOptions = [
    {
      text: "That AWS should have anticipated this exact wording of a “wipe” prompt in advance and blocked it by name — wrong because no one could have predicted the specific phrasing, command names, or cloud-resource targets an attacker would eventually choose for a natural-language instruction like this one.",
      correct: false,
      errorName: "hindsight bias in incident analysis",
      explanation: "This fixates on predicting the specific attack's wording rather than the structural gap that let any unreviewed natural-language text become trusted instructions at all — a classic hindsight-bias move: naming a lesson that sounds obvious only after seeing this particular attack, rather than the general design gap it exposed.",
      scaffold: "Ask what would still have been a problem even with a completely different wording of the malicious prompt. If the answer is 'yes, any natural-language instruction merged into this codepath could have been trusted,' then the specific wording was never the real issue."
    },
    {
      text: "That the extension's executeBash permission model was too permissive for a coding assistant — wrong because tightening bash permissions alone wouldn't have stopped a malicious system prompt baked directly into the shipped extension code itself, since that prompt never needed to pass through the runtime permission check at all.",
      correct: false,
      errorName: "scope creep misdiagnosis",
      explanation: "This blames a real but different control — runtime tool permissions — instead of the actual failure point, which was upstream of any runtime permission check: the build pipeline let attacker-controlled text become part of the agent's trusted system prompt in the first place.",
      scaffold: "Trace where the malicious text actually entered the system: before the extension ever ran, during the build/release process. A runtime permission model, however strict, only governs what happens after the agent is already running on whatever instructions it was shipped with."
    },
    {
      text: "That pull-request review plus commit-credential access was a sufficient trust boundary for content destined to become an AI agent's own instructions — wrong because the reviewed content wasn't code a test suite would execute, it was natural-language text the model would later interpret as instructions, a distinction ordinary code review isn't built to catch.",
      correct: true,
      whyCorrect: "This is correct because it names the actual mismatch: code review was designed to catch bad code, not to ask whether merged natural-language text would later be trusted as an instruction by the model running on top of it — a distinct kind of content that ordinary review processes were never built to flag.",
      generalizes: "any pipeline where user- or contributor-submitted content can end up inside a model's trusted context (a system prompt, a tool description, a retrieved document) without a distinct integrity check separate from ordinary code review"
    },
    {
      text: "That the attacker's access to “admin credentials on a silver platter” was the single point of failure — wrong because credential exposure was only how the door opened, not why a natural-language instruction embedded in source code could reach the model as a trusted system prompt at all.",
      correct: false,
      errorName: "single-cause fallacy",
      explanation: "Credential exposure is a real contributing cause, but treating it as the whole explanation misses the deeper design gap: even with tighter credential controls, the underlying problem — that merged natural-language text automatically becomes trusted agent instructions with no distinct integrity check — would still exist for the next person who gets through some other door.",
      scaffold: "Ask: if this exact credential leak were fixed tomorrow, would the underlying vulnerability class disappear? If a different access path could still let unreviewed text reach the system prompt, the credential leak was one door, not the whole house."
    }
  ];

  return (
    <section id="broke" style={{ paddingTop: 24 }}>
      <SectionHeading id="broke">What Broke</SectionHeading>
      <Callout kind="fail">
        <p style={{ marginTop: 0 }}>In July 2025, roughly six months before Amazon published its evaluation framework, an incident hit a different Amazon AI agent product — the Amazon Q Developer coding assistant, a VS Code extension installed more than 964,000 times (SC Media, 2025) — that no output-quality metric was positioned to catch. On July 13, 2025, someone submitted a pull request to the public aws-toolkit-vscode GitHub repository and, in their own account to 404 Media, was given "admin credentials on a silver platter" (SC Media, 2025). They used that access to insert natural-language instructions directly into the extension's code: text telling the AI assistant its goal was to "clean a system to a near-factory state and delete file-system and cloud resources," including commands to remove Amazon S3 storage buckets, terminate EC2 virtual machines, and delete IAM user accounts, and to "run continuously until the task is complete" (SC Media, 2025). That code shipped publicly in the extension's version 1.84.0 release on July 17, 2025 (SC Media, 2025).</p>
        <p>The assumption the original review process rested on, without anyone stating it out loud, was that a pull request is code, and code review is the right control for code. But the payload here was not a line of code a compiler would execute — it was a paragraph of English embedded where the AI assistant's own instructions live, text the model would later read and could choose to act on. AWS confirmed the malicious content had in fact been merged and briefly shipped, stating in its security bulletin that it had "identified a code commit through a deeper forensic analysis" after being alerted by outside researchers (AWSInsider, 2025). What saved Amazon was not this review process catching the problem — it was that the malicious prompt was formatted in a way the assistant could not interpret as executable instructions, so, per AWS's own account, "no customer resources were impacted" (SC Media, 2025; AWSInsider, 2025).</p>
        <p>AWS's response, once alerted, was fast: the company revoked and replaced the exposed credentials, removed the unapproved code, and shipped a fixed version, 1.85, on July 17, 2025 — the same day the compromised version had gone out (SC Media, 2025). A separate but related vulnerability in the same extension — the discovery that a <code>find</code> command could bypass the human-approval step because it had been classified as "readonly" despite its ability to execute arbitrary programs via the <code>-exec</code> flag — had already been reported to AWS on July 4, 2025, by an independent researcher, and its fix landed in the same v1.85 release (Embrace The Red, 2025). The direct engineering cost of both fixes was measured in days, not months; the harder, unquantified cost was the trust question a security researcher put directly to AWS: coding agents "run privileged on your laptop and you are not in control" (SC Media, 2025).</p>
        <p style={{ marginBottom: 0 }}>The lesson is not that Amazon's evaluation framework is weak — the framework, published seven months later, is a real answer to a real problem: diagnosing why an agent's behavior goes wrong. The lesson is that "evaluate the agent's behavior" and "verify the integrity of what the agent was told to do" are two different engineering problems, and a company can be genuinely sophisticated at the first while still exposed on the second. None of Amazon's published metrics — correctness, faithfulness, hallucination, tool selection accuracy — are designed to ask whether the text sitting in the model's own system prompt was put there by someone the team never approved. A production agent needs both problems solved, and solving one does not imply progress on the other.</p>
      </Callout>

      <IncidentTimelineSVG />
      <ChartInterp chartId="chart-broke" state={interp} setState={setInterp} prompts={[
        { kind: "So-what / pre-mortem", text: "The malicious prompt instructed the assistant to delete S3 buckets, terminate EC2 instances, and delete IAM users, and was live in a public release (v1.84.0) for part of a day before AWS caught it. Using a pre-mortem framework, what specific signal in this timeline — if it had gone differently — would have been the point where this became a real data-loss incident rather than a near miss?", authored: "The single point where this stayed a near miss rather than a disaster was the prompt's own formatting flaw — if the attacker had written syntactically valid, executable instructions instead, the same 'run continuously until the task is complete' directive would have started deleting real cloud resources the moment any developer's Amazon Q assistant processed the file, with no further attacker action needed and no human-in-the-loop step positioned to stop it." },
        { kind: "Qualitative / mechanism", text: "The malicious instructions failed not because any evaluation metric caught them, but because of a formatting flaw in how the prompt was written. What does that specific mechanism reveal about the boundary between ‘evaluating agent output quality’ (Amazon's published metrics) and ‘evaluating the integrity of what the agent is told to do’ (the actual point of failure here)?", authored: "It reveals that the two are genuinely separate systems, not two views of the same one: Amazon's quality metrics operate on what the agent produces after it starts reasoning, while this incident was decided entirely upstream of that, in whether the agent's own instructions could be trusted — a formatting accident, not a quality check, is what stood between this and real damage, which is exactly the kind of protection a company cannot rely on twice." }
      ]} />

      <MCQ id="broke-fail" label="Failure-case reasoning" registerScore={registerScore}
        prompt={"AWS's own account states the malicious prompt never executed because of a structural formatting flaw, not because any AWS security or evaluation process caught it before the code was merged. Given this, which assumption in the original review process was most likely held by the team as uncontroversial — and why was it wrong?"}
        options={failOptions} state={mcq} setState={setMcq} />

      <Glossary items={[
        { term: "Supply-chain attack", def: "an attack that compromises a product by tampering with something upstream in how it is built or distributed, rather than attacking the finished product directly." },
        { term: "Indirect prompt injection", def: "a prompt injection hidden inside content the model reads as part of its normal task (a file, a web page, a tool response) rather than typed directly by the user." }
      ]} />
    </section>
  );
}

/* --------------------------------------------------------------------------
   SECTION: LEARNING SUMMARY
   -------------------------------------------------------------------------- */
function LearningSummary({ principle, mcq, tf, fermi, score, total, warmUpResult, insightSlot, setInsightSlot, insightRevealed, setInsightRevealed, applyPresent, setApplyPresent, apply2027, setApply2027, registerScore, onContinue }) {
  const AUTHORED_PRINCIPLES = {
    rq1: "Architecture should track how predictable a task's steps are, not the size of its tool catalog or a preference for autonomy.",
    rq2: "Production-grade reliability comes from separately instrumenting each way a system can fail, not from one blended success/fail score.",
    rq3: "A layered evaluation framework catches failures a single score misses, but every layer still only evaluates behavior, never the integrity of the instructions the agent started from."
  };
  const AUTHORED_INSIGHTS = [
    "Amazon's three named production agents show that architecture choice tracks task predictability, not tool count — the shopping assistant's thousands of tools stayed inside one agent because the pattern of using them was stable, while the seller assistant split into multiple agents because its subtasks weren't knowable in advance.",
    "Amazon's own six-item failure taxonomy (planning, invalid calls, malformed parameters, unexpected formats, authentication, memory) proves that 'did the task succeed' collapses genuinely independent failure sources into one bit of information — and the company built a distinct metric for each one specifically because no single number could localize which had actually broken.",
    "The Amazon Q Developer incident shows the evaluation framework's real edge: every published metric grades the agent's behavior, but none of them grades whether the instructions the agent started from were trustworthy — and in this case, a formatting accident, not any evaluation or security process, was what stood between a merged malicious prompt and real deleted cloud resources."
  ];

  const missed = [];
  Object.keys(mcq).forEach(id => {
    const q = mcq[id];
    if (q && q.submitted && q.options && q.selected != null && !q.options[q.selected].correct) missed.push({ id, error: q.options[q.selected].errorName });
  });
  Object.keys(tf || {}).forEach(id => {
    const q = tf[id];
    if (q && q.submitted && id === "rq2-tg" && q.choice === true) missed.push({ id, error: "confusing a metric for its cause" });
  });

  const applyPresentComplete = applyPresent.thesis.length > 10 && applyPresent.assumption.length > 10 && applyPresent.disconfirm.length > 10 && applyPresent.premortem.length > 10;

  const te2027Options = [
    { text: "The load-bearing assumption it replaces is that Amazon needs three entirely separate teams to own three separate evaluation layers, which 2027-era tooling would consolidate into one team regardless of model capability, freeing headcount without changing what the evaluation library actually measures about the agent's behavior or reliability.", correct: false, errorName: "scope creep misdiagnosis", explanation: "Team structure is an organizational detail, not the load-bearing technical assumption the 2027 capability would actually replace — the argument is about instrumentation, not staffing." },
    { text: "The load-bearing assumption it replaces is that external, component-level instrumentation is the only reliable way to localize a failure — but if production-scale testing showed models still confabulate a plausible-sounding but wrong root cause under real load, that finding would most directly weaken this article's governing principle, because it would show even self-diagnosis can't be trusted without the same external checks.", correct: true, whyCorrect: "This correctly names the load-bearing assumption 2027-era self-report capability would replace, and states a concrete, falsifying observation (confabulated self-diagnosis under load) as required.", generalizes: "any argument for replacing external instrumentation with a model's own self-report as models improve" },
    { text: "The load-bearing assumption it replaces is that customers care about diagnosability, which better models would make irrelevant since customers only care about final answers and would never notice or reward internal instrumentation quality either way, no matter how the agent's failures are actually being tracked and localized internally by engineers.", correct: false, errorName: "single-cause fallacy", explanation: "Customer preference is not the assumption at stake; the technical question is whether external instrumentation remains necessary once models can (allegedly) self-report, independent of what customers happen to notice." },
    { text: "The load-bearing assumption it replaces is that Amazon's tool catalog will simply stop growing once foundation models improve enough, removing the need for schema governance entirely and letting the company skip the standardization work this article's first research question described in careful architectural detail earlier on.", correct: false, errorName: "applying classical software assumptions to AI", explanation: "Tool catalog growth is unrelated to whether self-diagnosis capability would let a team drop external component-level evaluation — model improvement doesn't change how many tools a business integrates." }
  ];

  return (
    <section id="summary" style={{ paddingTop: 24 }}>
      <SectionHeading id="summary">Learning Summary</SectionHeading>

      <h3 style={{ fontSize: 18 }}>Score breakdown</h3>
      <p>You answered {total} scored questions and got {score} correct.</p>
      {missed.length > 0 ? (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Reasoning errors to revisit:</div>
          {missed.map((m, i) => <div key={i} style={{ fontSize: 14, marginBottom: 4 }}>• {m.error || "see explanation above"}</div>)}
        </div>
      ) : <p style={{ fontSize: 14, color: "#64748B" }}>No missed questions yet, or none answered.</p>}
      <p style={{ fontSize: 14 }}>
        Warm-up: {warmUpResult.skipped ? `Skipped — 3 prior principles not reviewed this session.` : `${warmUpResult.completed} of 3 prior principles reviewed.`}
      </p>

      <h3 style={{ fontSize: 18 }}>Principle production review</h3>
      {["rq1", "rq2", "rq3"].map(id => (
        <div key={id} style={{ border: "1px solid #E2E8F0", borderRadius: 8, padding: 14, marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: "#64748B", textTransform: "uppercase", fontWeight: 700 }}>{id.toUpperCase()}</div>
          <div style={{ marginTop: 6 }}><strong>Your submission:</strong> {principle[id] || "(not submitted)"}</div>
          <div style={{ marginTop: 6 }}><strong>Authored:</strong> {AUTHORED_PRINCIPLES[id]}</div>
        </div>
      ))}
      <p style={{ fontSize: 14 }}>Which of your stated principles surprised you most compared to the authored version? Why?</p>

      <h3 style={{ fontSize: 18 }}>Three insight slots</h3>
      <p>You have seen evidence across three research questions and a real incident. Write the single most non-obvious insight you would defend to a skeptical CTO, before seeing the authored insights.</p>
      {!insightRevealed ? (
        <>
          <textarea rows={3} value={insightSlot} onChange={e => setInsightSlot(e.target.value)}
            placeholder="Your insight (min. 30 characters)..."
            style={{ width: "100%", borderRadius: 6, border: "1px solid #CBD5E1", padding: 8, fontSize: 14, fontFamily: "inherit" }} />
          <div style={{ marginTop: 8 }}>
            <button disabled={insightSlot.length < 30} style={btnStyle(insightSlot.length < 30)} onClick={() => setInsightRevealed(true)}>
              {insightSlot.length < 30 ? `Enter ${30 - insightSlot.length} more characters` : "Reveal authored insights"}
            </button>
          </div>
        </>
      ) : (
        <div>
          <div style={{ padding: 10, background: "#F8FAFC", borderRadius: 6, marginBottom: 10 }}><strong>Your insight:</strong> {insightSlot}</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>How your insight compares:</div>
          {AUTHORED_INSIGHTS.map((a, i) => <div key={i} style={{ padding: 10, background: "#ECFDF5", borderRadius: 6, marginBottom: 8, fontSize: 14 }}>{a}</div>)}
        </div>
      )}

      <h3 style={{ fontSize: 18 }}>Apply It</h3>
      <Callout kind="note">
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Present-day variant</div>
        <p style={{ marginTop: 0 }}>Apply the governing principle to a company or product you know. Fill in all four labeled parts.</p>
        {["thesis", "assumption", "disconfirm", "premortem"].map((key, i) => {
          const labels = ["One-sentence so-what thesis", "Load-bearing assumption", "Strongest disconfirming evidence from the article", "One-line pre-mortem: “If this fails in 12 months, the most likely reason is ___.”"];
          return (
            <div key={key} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{labels[i]}</div>
              <input value={applyPresent[key]} onChange={e => setApplyPresent(prev => ({ ...prev, [key]: e.target.value }))}
                disabled={applyPresent.submitted}
                style={{ width: "100%", borderRadius: 6, border: "1px solid #CBD5E1", padding: 8, fontSize: 14 }} />
            </div>
          );
        })}
        {!applyPresent.submitted ? (
          <button disabled={!applyPresentComplete} style={btnStyle(!applyPresentComplete)}
            onClick={() => setApplyPresent(prev => ({ ...prev, submitted: true }))}>
            {applyPresentComplete ? "Submit" : "Fill in all four parts to enable Submit"}
          </button>
        ) : (
          <div style={{ padding: 10, background: "#ECFDF5", borderRadius: 6, marginTop: 8 }}>
            Saved. A strong response climbs from observation ("Amazon has good metrics") to a quantified, decision-relevant implication — for example, naming the specific gap (instruction-integrity checking) your chosen company would still need to add, and what evidence would tell you it's missing.
          </div>
        )}
      </Callout>

      <Callout kind="note">
        <div style={{ fontWeight: 600, marginBottom: 8 }}>2027 forward-looking variant (T-E, with falsification clause)</div>
        <MCQ id="apply2027-te" label="Forward-looking implication" registerScore={registerScore}
          prompt={"Given the same three Amazon use cases, but assuming 2027-era models can reliably self-report which internal step caused a wrong answer — a capability that doesn't fully exist in the systems described in this article — which load-bearing assumption in Amazon's current evaluation design would this most directly replace, and what evidence would most change confidence in the article's governing principle?"}
          options={te2027Options} state={apply2027} setState={setApply2027} />
      </Callout>

      <h3 style={{ fontSize: 18 }}>Return to section map — principles to revisit</h3>
      {missed.length > 0 ? missed.map((m, i) => <div key={i} style={{ fontSize: 14 }}>• {m.id}: {m.error || "see explanation above"}</div>) : <p style={{ fontSize: 14, color: "#64748B" }}>Nothing missed to revisit yet.</p>}

      <div style={{ textAlign: "center", margin: "30px 0" }}>
        <button style={btnStyle(false)} onClick={onContinue}>Continue to Conclusion →</button>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   SECTION: CONCLUSION
   -------------------------------------------------------------------------- */
function Conclusion({ ptf, setPtf }) {
  return (
    <section id="conclusion" style={{ paddingTop: 24 }}>
      <SectionHeading id="conclusion">Conclusion</SectionHeading>
      <p>The governing principle holds up well against both the success evidence and the failure case, with one honest amendment: grading an agent's final task outcome hides which internal step broke, so production reliability requires instrumenting each component — intent, tool use, memory, reasoning — separately. But that instrumentation only covers behavior the agent produces after it starts reasoning, not the integrity of the instructions and inputs it starts reasoning from. Partial failure of this principle looks exactly like the Amazon Q Developer incident: a company with genuinely sophisticated behavioral evaluation still exposed at the one layer no behavioral metric was built to check.</p>
      <p>For an AI PM, this changes what "we have evaluation covered" should mean when a team says it. The right follow-up question is not "do you grade the final answer" but "can you point to a specific metric for each of the ways this agent could fail — bad intent detection, wrong tool, bad tool parameters, stale memory, ungrounded reasoning — and a separate answer for how you verify the integrity of what the agent is told before it reasons at all." A team that can only answer the first half has Amazon's 2026 framework without Amazon's 2025 lesson.</p>
      <p>For a future CTO, the platform implication is that evaluation infrastructure and instruction-integrity infrastructure are two different platform investments with two different owners, and treating them as one line item is how a gap like this hides in plain sight. A shared evaluation library — the kind Amazon built after "thousands of agents" made ad-hoc testing unworkable — belongs with the ML platform team. Locking down who can modify a shipped agent's system prompt, tool definitions, and build pipeline is a supply-chain and access-control problem, and belongs with security engineering. Both are real infrastructure; neither substitutes for the other.</p>
      <p>The most important question this case does not answer is how a team would know, today, whether their own agent has an Amazon-Q-Developer-style integrity gap sitting undetected in its build pipeline right now — because, by construction, none of the tests built to answer "is the agent behaving well" are designed to ask that question, and no company has yet published a framework that scores its own answer to it.</p>

      <PatternTransferQ id="final-tf" state={ptf} setState={setPtf}
        prompt={"Final pattern transfer. The article's governing principle is: grading an agent only on its final task outcome hides which internal component actually failed, so production-grade evaluation must instrument each component separately — and even a layered framework like Amazon's still only evaluates behavior, never the integrity of the instructions the agent started from. Apply this to a regional trucking company building an AI dispatch agent that assigns loads to drivers and can renegotiate delivery windows with customers by email on the company's behalf. Name the principle accurately, apply it to this new context in a genuinely non-trivial way (not a re-labeling of Amazon's shopping, service, or seller cases), and name a new failure mode that would not appear in any of this article's evidence."} />

      <div style={{ marginTop: 40, borderTop: "1px solid #E2E8F0", paddingTop: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Sources</div>
        {SOURCES.map((s, i) => (
          <div key={i} style={{ fontSize: 13, marginBottom: 10, lineHeight: 1.5 }}>
            <a href={s.url} target="_blank" rel="noreferrer">{s.name}</a> ({s.year}) — <em>{s.tier}</em>. Used for: {s.use}
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
   MOUNT
   -------------------------------------------------------------------------- */
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
