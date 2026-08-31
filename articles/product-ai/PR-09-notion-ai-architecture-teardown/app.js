/* ==========================================================================
   How Notion AI Actually Works: Why the Retrieval Bill Set the Price
   Type 2 -- AI Product Teardown
   Lifecycle position: Build -> Scale
   ========================================================================== */

const { useState, useEffect, useRef, useCallback } = React;
const {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LabelList
} = Recharts;

/* --------------------------------------------------------------------------
   CROSS-ARTIFACT STATE (prior articles, for warm-up)
   -------------------------------------------------------------------------- */
const PRIOR_ARTICLES = [
  {
    title: "When Not to Use AI: Google's Feasibility Gates, and the Failure That Skipped Them",
    type: "AI Feasibility & Technical Scoping (Type 1)",
    lifecycle: "Feasibility",
    principle: "Feasibility is not ‘can AI do this?’ but ‘does AI beat a transparent heuristic once the cost of a wrong answer is priced in?’",
    warmUpPrompt: "A workspace productivity tool wants to add an AI feature that flags which of a user's draft documents is “most likely to need review this week.” Before choosing a model, what audit should the team run first, and why does skipping it risk a Google-Flu-Trends-style failure?"
  },
  {
    title: "How Cursor Actually Works: The Architecture Is the Product",
    type: "AI Product Teardown (Type 2)",
    lifecycle: "Build → Scale",
    principle: "Partition an AI product by latency budget first, then choose models and retrieval per lane.",
    warmUpPrompt: "A workspace app wants both an instant inline-autocomplete-while-typing feature and a slower “summarize this whole workspace” feature. How should the team decide the architecture split between the two, and what single factor should decide that split?"
  },
  {
    title: "How GitHub Copilot Actually Works: Context Assembly, the Filter Gate, and a Reward Function Rebuilt Twice",
    type: "AI Product Teardown (Type 2)",
    lifecycle: "Build → Evaluate → Scale",
    principle: "A silent, upstream decision not to call the model at all is as much a product decision as any visible UI choice, and it inherits whatever proxy metric it was tuned against.",
    warmUpPrompt: "A workspace AI feature quietly declines to answer certain questions when its retrieved context is too thin. The team is proud of this restraint. What upstream question should they be asking about that silent decision, before celebrating it?"
  }
];

const CROSS_ARTIFACT_WARMUP = PRIOR_ARTICLES.map((a, i) => ({
  id: "warmup-" + i,
  prompt: a.warmUpPrompt,
  sourceArticle: a.title,
  sourceType: a.type,
  lifecycle: a.lifecycle,
  principle: a.principle
}));

/* --------------------------------------------------------------------------
   SMALL UTILITIES
   -------------------------------------------------------------------------- */
function wordCount(s) { return s.trim().split(/\s+/).filter(Boolean).length; }

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1400);
  useEffect(() => {
    function onResize() { setW(window.innerWidth); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return w;
}

/* --------------------------------------------------------------------------
   GENERIC UI PRIMITIVES
   -------------------------------------------------------------------------- */

function SectionHeading({ children, id }) {
  return <h2 className="section-heading" id={id + "-heading"}>{children}</h2>;
}

function Prose({ children }) {
  return <p className="prose">{children}</p>;
}

function ChartFrame({ title, sourceNote, children, provenance }) {
  return (
    <div className="chart-frame">
      <div className="chart-title">{title}</div>
      <div className="chart-body">{children}</div>
      {provenance && <div className="provenance-note">{provenance}</div>}
      {sourceNote && <div className="chart-source">{sourceNote}</div>}
    </div>
  );
}

/* Chart interpretation pair -- two independently-gated free text prompts */
function ChartInterpretation({ chartId, items, state, setState }) {
  function submit(idx, text) {
    if (text.trim().length < 15) return;
    setState(prev => {
      const cur = prev[chartId] || [{}, {}];
      const next = cur.slice();
      next[idx] = { submitted: true, text };
      return { ...prev, [chartId]: next };
    });
  }
  const cur = state[chartId] || [{}, {}];
  return (
    <div className="interp-wrap">
      {items.map((item, idx) => (
        <InterpPrompt
          key={idx}
          kind={item.kind}
          prompt={item.prompt}
          authored={item.authored}
          submittedState={cur[idx]}
          onSubmit={(text) => submit(idx, text)}
        />
      ))}
    </div>
  );
}

function InterpPrompt({ kind, prompt, authored, submittedState, onSubmit }) {
  const [text, setText] = useState("");
  const submitted = submittedState && submittedState.submitted;
  return (
    <div className="interp-prompt">
      <div className="interp-kind-badge">{kind}</div>
      <div className="interp-question">{prompt}</div>
      {!submitted && (
        <div className="interp-input-row">
          <textarea
            className="text-input"
            rows={2}
            minLength={15}
            placeholder="Your answer (min. 15 characters)..."
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <button
            className="btn btn-small"
            disabled={text.trim().length < 15}
            onClick={() => onSubmit(text)}
          >
            {text.trim().length < 15 ? `Enter ${15 - text.trim().length} more characters` : "Submit"}
          </button>
        </div>
      )}
      {submitted && (
        <div className="interp-revealed">
          <div className="reader-answer"><strong>Your answer:</strong> {submittedState.text}</div>
          <div className="authored-interpretation">
            <strong>Compare your answer to the authored one:</strong> {authored}
          </div>
        </div>
      )}
    </div>
  );
}

/* Multiple choice family: used for T-A, T-B, T-H, and Failure-case questions */
function MCQCard({ id, kindLabel, subForm, prompt, options, state, setState, onScore }) {
  const q = state[id] || { selected: null, submitted: false, attempt: 0, scaffoldUnlocked: false, lastWrong: null };

  function select(i) {
    if (q.submitted) return;
    setState(prev => ({ ...prev, [id]: { ...q, selected: i } }));
  }

  function submit() {
    if (q.selected === null || q.selected === undefined) return;
    const correct = options[q.selected].correct;
    setState(prev => ({
      ...prev,
      [id]: { ...q, submitted: true, correct, attempt: q.attempt + 1, lastWrong: correct ? q.lastWrong : q.selected }
    }));
    onScore(id, correct);
  }

  function tryAgain() {
    setState(prev => ({ ...prev, [id]: { selected: null, submitted: false, attempt: q.attempt, scaffoldUnlocked: true, lastWrong: q.lastWrong } }));
  }

  const correctIdx = options.findIndex(o => o.correct);

  return (
    <div className="question-card mcq-card">
      <div className="q-label">{kindLabel}{subForm ? ` — ${subForm}` : ""}</div>
      <div className="q-prompt">{prompt}</div>
      {q.scaffoldUnlocked && !q.submitted && q.lastWrong !== null && q.lastWrong !== undefined && (
        <div className="scaffold-box">
          <strong>Before you try again:</strong> {options[q.lastWrong].scaffold}
        </div>
      )}
      <div className="option-grid">
        {options.map((opt, i) => {
          let cls = "option-card";
          if (q.submitted) {
            if (i === correctIdx) cls += " correct";
            else if (i === q.selected) cls += " incorrect";
          } else if (q.selected === i) {
            cls += " selected";
          }
          return (
            <div key={i} className={cls} onClick={() => select(i)}>
              <span className="option-letter">{String.fromCharCode(65 + i)}</span>
              <span className="option-text">{opt.text}</span>
            </div>
          );
        })}
      </div>
      {!q.submitted && (
        <button className="btn" disabled={q.selected === null || q.selected === undefined} onClick={submit}>
          Submit
        </button>
      )}
      {q.submitted && (
        <div className="explanation-box">
          {q.correct ? (
            <div className="calibration correct">
              Correct — {options[q.selected].transferNote}
            </div>
          ) : (
            <div className="calibration incorrect">
              Incorrect — this is {options[q.selected].errorTag}. {options[q.selected].errorDetail}
            </div>
          )}
          <div className="full-explanation">{options[correctIdx].fullExplain}</div>
          {!q.correct && (
            <button className="btn btn-outline btn-small" onClick={tryAgain}>Try again</button>
          )}
        </div>
      )}
    </div>
  );
}

/* Numeric estimation (T-D) */
function NumericQuestion({ id, prompt, skeleton, unit, tolerance, correctValue, lowerBound, upperBound,
  sensitiveAssumption, decomposition, isFermi, state, setState, onScore }) {
  const q = state[id] || { value: "", submitted: false };
  const [val, setVal] = useState(q.value || "");

  function submit() {
    const num = parseFloat(val);
    if (isNaN(num)) return;
    let correct;
    if (isFermi) {
      correct = num >= correctValue / 3 && num <= correctValue * 3;
    } else {
      correct = Math.abs(num - correctValue) / correctValue <= tolerance;
    }
    setState(prev => ({ ...prev, [id]: { value: num, submitted: true, correct } }));
    onScore(id, correct);
  }

  return (
    <div className="question-card td-card">
      <div className="q-label">Engineering Estimation {isFermi ? "— Open Fermi" : ""}</div>
      <div className="q-prompt">{prompt}</div>
      {skeleton && <div className="skeleton-box"><strong>Decomposition skeleton:</strong> {skeleton}</div>}
      {!q.submitted && (
        <div className="numeric-input-row">
          <input
            type="number"
            className="text-input numeric-input"
            value={val}
            onChange={e => setVal(e.target.value)}
            placeholder={`Your estimate (${unit})`}
          />
          <button className="btn btn-small" disabled={val === ""} onClick={submit}>Submit</button>
        </div>
      )}
      {q.submitted && (
        <div className="explanation-box">
          <div className={"calibration " + (q.correct ? "correct" : "incorrect")}>
            {q.correct
              ? `Within tolerance — your estimate of ${q.value} ${unit} is close enough to be useful.`
              : `Incorrect — this is extrapolating a short trend / base-rate neglect: your estimate of ${q.value} ${unit} is far from the anchored range, which usually means one of the anchor facts below was skipped.`}
          </div>
          <div className="distribution-axis">
            <div className="dist-track">
              <div className="dist-marker actual" style={{ left: "70%" }}>Actual/derived: {correctValue.toLocaleString()} {unit}</div>
              <div className="dist-marker user" style={{ left: "30%" }}>Your guess: {q.value.toLocaleString()} {unit}</div>
            </div>
          </div>
          <div className="decomposition-list">
            <strong>Decomposition path:</strong>
            <ul>{decomposition.map((d, i) => <li key={i}>{d}</li>)}</ul>
          </div>
          <div className="bounds-row">
            <span>Lower bound: {lowerBound}</span>
            <span>Upper bound: {upperBound}</span>
          </div>
          <div className="sensitive-assumption"><strong>Most sensitive assumption:</strong> {sensitiveAssumption}</div>
        </div>
      )}
    </div>
  );
}

/* True/False with justification (T-G) */
function TrueFalseQuestion({ id, prompt, correctAnswer, authoredJustification, errorTag, state, setState, onScore }) {
  const q = state[id] || { choice: null, justification: "", submitted: false };
  const [choice, setChoice] = useState(q.choice);
  const [just, setJust] = useState(q.justification || "");

  function submit() {
    if (choice === null || just.trim().length < 15) return;
    const correct = choice === correctAnswer;
    setState(prev => ({ ...prev, [id]: { choice, justification: just, submitted: true, correct } }));
    onScore(id, correct);
  }

  const submitted = q.submitted;
  return (
    <div className="question-card tg-card">
      <div className="q-label">True / False with Justification</div>
      <div className="q-prompt">{prompt}</div>
      <div className="tf-option-row">
        {[true, false].map(v => (
          <div
            key={String(v)}
            className={"option-card tf-option" + (submitted ? (v === correctAnswer ? " correct" : (v === q.choice ? " incorrect" : "")) : (choice === v ? " selected" : ""))}
            onClick={() => !submitted && setChoice(v)}
          >
            {v ? "True" : "False"}
          </div>
        ))}
      </div>
      {!submitted && (
        <div className="interp-input-row">
          <textarea
            className="text-input"
            rows={2}
            placeholder="Justify your answer in one sentence, naming the specific evidence (min. 15 characters)..."
            value={just}
            onChange={e => setJust(e.target.value)}
          />
          <button className="btn btn-small" disabled={choice === null || just.trim().length < 15} onClick={submit}>Submit</button>
        </div>
      )}
      {submitted && (
        <div className="explanation-box">
          <div className={"calibration " + (q.correct ? "correct" : "incorrect")}>
            {q.correct ? "Correct — this reasoning generalizes: check whether a qualifier (‘by default’, ‘for this plan tier’) has been quietly dropped before treating a claim as absolute." : `Incorrect — this is ${errorTag}.`}
          </div>
          <div className="reader-answer"><strong>Your justification:</strong> {q.justification}</div>
          <div className="full-explanation"><strong>Authored justification:</strong> {authoredJustification}</div>
        </div>
      )}
    </div>
  );
}

/* Pattern transfer / free text (T-F) */
function PatternTransferQuestion({ id, principle, context, state, setState }) {
  const q = state[id] || { text: "", submitted: false, checks: { a: false, b: false, c: false } };
  const [text, setText] = useState(q.text || "");
  const [checks, setChecks] = useState(q.checks);

  function submit() {
    if (text.trim().length < 50) return;
    setState(prev => ({ ...prev, [id]: { text, submitted: true, checks } }));
  }

  function toggleCheck(k) {
    const next = { ...checks, [k]: !checks[k] };
    setChecks(next);
    setState(prev => ({ ...prev, [id]: { ...(prev[id] || {}), checks: next } }));
  }

  const submitted = q.submitted;
  return (
    <div className="question-card tf-pattern-card">
      <div className="q-label">Pattern Transfer (T-F)</div>
      <div className="q-prompt">
        The principle from this section is: <em>{principle}</em> Apply it to {context} What would a PM or CTO do
        differently there, and what new failure mode would they face that did not appear in the Notion case? Your
        answer should: (1) name the principle accurately, (2) apply it in a genuinely non-trivial way (not a
        relabeling of Notion's case), and (3) name a failure mode that is new, not one already covered in this
        article.
      </div>
      {!submitted && (
        <div className="interp-input-row">
          <textarea
            className="text-input"
            rows={4}
            placeholder="Your transfer answer (min. 50 characters)..."
            value={text}
            onChange={e => setText(e.target.value)}
          />
          <button className="btn btn-small" disabled={text.trim().length < 50} onClick={submit}>Submit</button>
        </div>
      )}
      {submitted && (
        <div className="explanation-box">
          <div className="reader-answer">{q.text}</div>
          <div className="self-check">
            <div className="self-check-title">Self-evaluation checklist:</div>
            {[
              ["a", "Did I name the principle accurately?"],
              ["b", "Is my application genuinely different from the original Notion case?"],
              ["c", "Is my failure mode new — not one already covered in this article?"]
            ].map(([k, label]) => (
              <label key={k} className="check-row">
                <input type="checkbox" checked={checks[k]} onChange={() => toggleCheck(k)} />
                {label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* Principle-in-one-sentence prompt (non-gating, non-scored) */
function PrincipleGate({ sectionId, state, setState }) {
  const q = state[sectionId] || { text: "", submitted: false };
  const [text, setText] = useState(q.text || "");
  function submit() {
    if (text.trim().length < 20) return;
    setState(prev => ({ ...prev, [sectionId]: { text, submitted: true } }));
  }
  return (
    <div className="principle-gate">
      <div className="q-label">Principle in one sentence</div>
      <div className="q-prompt">
        In one sentence, state the transferable principle from this section — something a PM or CTO at a
        different company could apply tomorrow.
      </div>
      {!q.submitted && (
        <div className="interp-input-row">
          <textarea className="text-input" rows={2} placeholder="Min. 20 characters..." value={text} onChange={e => setText(e.target.value)} />
          <button className="btn btn-small" disabled={text.trim().length < 20} onClick={submit}>Submit</button>
        </div>
      )}
      {q.submitted && (
        <div className="explanation-box">
          <div className="reader-answer"><strong>You wrote:</strong> {q.text}</div>
        </div>
      )}
      <div className="not-scored-note">Not scored — an encouraged step. You can move to any section regardless.</div>
    </div>
  );
}

function Glossary({ terms }) {
  if (!terms || terms.length === 0) return null;
  return (
    <div className="glossary-panel">
      <div className="glossary-title">Glossary</div>
      {terms.map((t, i) => (
        <div key={i} className="glossary-entry"><strong>{t.term}</strong> — {t.def}</div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------------------
   CHART: MILESTONE TIMELINE (SVG)
   -------------------------------------------------------------------------- */
const TIMELINE_EVENTS = [
  { date: "Nov 2022", label: "Notion AI private alpha (writing assistant only)", tag: "product" },
  { date: "Nov 2023", label: "Q&A beta launches: RAG across workspace, $8–$10/seat add-on", tag: "product" },
  { date: "Dec 2023", label: "Vector indexes near capacity, 1 month after launch", tag: "incident" },
  { date: "Apr 2024", label: "Waitlist cleared: 600x onboarding, 15x workspaces", tag: "scale" },
  { date: "May 2024", label: "Serverless migration: −50% cost from peak", tag: "infra" },
  { date: "Aug 2024", label: "Notion passes 100 million users", tag: "product" },
  { date: "Jan 2025", label: "turbopuffer migration complete: −60% search cost, faster p50", tag: "infra" },
  { date: "May 2025", label: "“Notion AI for Work”: model picker + all-in-one $20/seat pricing", tag: "product" },
  { date: "Jul 2025", label: "Page State Project: −70% data volume reprocessed", tag: "infra" },
  { date: "2025–2026", label: "Ray/Anyscale migration: −90%+ embeddings infra cost (ongoing)", tag: "infra" }
];

function TimelineChart() {
  const w = 680, rowH = 46, pad = 16;
  const h = pad * 2 + TIMELINE_EVENTS.length * rowH;
  const colorFor = (tag) => tag === "incident" ? "#dc2626" : tag === "infra" ? "#2563eb" : "#059669";
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: 680 }}>
      <line x1="130" y1={pad} x2="130" y2={h - pad} stroke="#d1d5db" strokeWidth="2" />
      {TIMELINE_EVENTS.map((e, i) => {
        const y = pad + i * rowH + rowH / 2;
        return (
          <g key={i}>
            <circle cx="130" cy={y} r="5" fill={colorFor(e.tag)} />
            <text x="115" y={y + 4} fontSize="11" textAnchor="end" fill="#374151" fontFamily="inherit">{e.date}</text>
            <foreignObject x="145" y={y - 16} width={w - 155} height="34">
              <div style={{ fontSize: 12, lineHeight: 1.3, color: "#111" }}>{e.label}</div>
            </foreignObject>
          </g>
        );
      })}
      <text x="130" y={h - 2} fontSize="10" fill="#6b7280">green = product milestone · blue = infrastructure milestone · red = incident</text>
    </svg>
  );
}

/* --------------------------------------------------------------------------
   CHART: ONBOARDING GROWTH MULTIPLES (bar)
   -------------------------------------------------------------------------- */
const ONBOARDING_DATA = [
  { name: "Daily onboarding capacity", multiple: 600 },
  { name: "Active workspaces", multiple: 15 },
  { name: "Vector DB capacity", multiple: 8 }
];

function OnboardingChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={ONBOARDING_DATA} layout="vertical" margin={{ left: 40, right: 40, top: 10, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" scale="log" domain={[1, 1000]} ticks={[1, 10, 100, 600]} label={{ value: "Growth multiple, Nov 2023 → Apr 2024 (log scale)", position: "insideBottom", offset: -5, fontSize: 11 }} />
        <YAxis type="category" dataKey="name" width={150} fontSize={12} />
        <Tooltip />
        <Bar dataKey="multiple" fill="#2563eb">
          <LabelList dataKey="multiple" position="right" formatter={(v) => v + "x"} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* --------------------------------------------------------------------------
   CHART: COST INDEX OVER TIME (line)
   -------------------------------------------------------------------------- */
const COST_INDEX_DATA = [
  { date: "Nov 2023\n(launch)", index: 100 },
  { date: "May 2024\n(serverless)", index: 50 },
  { date: "Jan 2025\n(turbopuffer)", index: 20 },
  { date: "Notion's own\n2-yr headline", index: 10 }
];

function CostIndexChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={COST_INDEX_DATA} margin={{ left: 10, right: 20, top: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" fontSize={11} />
        <YAxis label={{ value: "Relative infra cost index (Nov 2023 = 100)", angle: -90, position: "insideLeft", fontSize: 10 }} />
        <Tooltip />
        <Line type="monotone" dataKey="index" stroke="#dc2626" strokeWidth={2} dot={{ r: 5 }}>
          <LabelList dataKey="index" position="top" />
        </Line>
      </LineChart>
    </ResponsiveContainer>
  );
}

/* --------------------------------------------------------------------------
   CHART: p50 LATENCY BEFORE/AFTER (bar)
   -------------------------------------------------------------------------- */
const LATENCY_DATA = [
  { name: "Before turbopuffer\n(pod architecture)", low: 70, high: 100 },
  { name: "After turbopuffer\nmigration (Jan 2025)", low: 50, high: 70 }
];

function LatencyChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={LATENCY_DATA} margin={{ left: 10, right: 20, top: 10, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" fontSize={11} />
        <YAxis label={{ value: "p50 query latency (ms)", angle: -90, position: "insideLeft", fontSize: 10 }} />
        <Tooltip />
        <Bar dataKey="low" stackId="a" fill="#93c5fd" name="low end (ms)">
          <LabelList dataKey="low" position="center" />
        </Bar>
        <Bar dataKey="high" stackId="a" fill="#2563eb" name="additional to high end (ms)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* --------------------------------------------------------------------------
   CHART: RAG PIPELINE DIAGRAM (SVG)
   -------------------------------------------------------------------------- */
function RagPipelineDiagram() {
  const boxStyle = { fontSize: 11 };
  return (
    <svg viewBox="0 0 680 400" width="100%" style={{ maxWidth: 680 }}>
      <text x="10" y="20" fontSize="12" fontWeight="bold" fill="#374151">Offline: keeping the index fresh</text>
      {["Page edited", "Chunk into spans", "Embed via OpenAI\nzero-retention API", "Store in vector DB\n(e.g. turbopuffer)"].map((t, i) => (
        <g key={i}>
          <rect x={10 + i * 168} y={30} width={150} height={50} rx={8} fill="#eff6ff" stroke="#93c5fd" />
          <foreignObject x={10 + i * 168} y={30} width={150} height={50}>
            <div style={{ ...boxStyle, padding: 6, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", height: "100%", whiteSpace: "pre-line" }}>{t}</div>
          </foreignObject>
          {i < 3 && <text x={10 + i * 168 + 155} y={60} fontSize="14" fill="#6b7280">→</text>}
        </g>
      ))}

      <text x="10" y="115" fontSize="12" fontWeight="bold" fill="#374151">Online: answering a question (permission filter applies throughout)</text>
      {[
        "User asks\na question",
        "Does this need\nworkspace search?",
        "Generate a\nsearch query",
        "Query the\nvector DB",
        "LLM ranks &\nrefines candidates",
        "LLM generates\nanswer from ranked pages",
        "Format &\ndisplay to user"
      ].map((t, i) => {
        const perRow = 4;
        const row = Math.floor(i / perRow);
        const col = i % perRow;
        const x = 10 + col * 168;
        const y = 125 + row * 90;
        return (
          <g key={i}>
            <rect x={x} y={y} width={150} height={60} rx={8} fill="#f0fdf4" stroke="#86efac" />
            <foreignObject x={x} y={y} width={150} height={60}>
              <div style={{ ...boxStyle, padding: 6, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", height: "100%", whiteSpace: "pre-line" }}>{t}</div>
            </foreignObject>
            {col < perRow - 1 && i < 6 && <text x={x + 155} y={y + 34} fontSize="14" fill="#6b7280">→</text>}
          </g>
        );
      })}
      <text x="10" y="330" fontSize="10" fill="#6b7280" width="660">
        Structure drawn directly from Notion's documented architecture (Notion AI security &amp; privacy practices, current). No
      </text>
      <text x="10" y="345" fontSize="10" fill="#6b7280">
        company-specific throughput, hardware, or team-size figures are shown or implied.
      </text>
    </svg>
  );
}

/* --------------------------------------------------------------------------
   CHART: INCIDENT TIMELINE (What Broke)
   -------------------------------------------------------------------------- */
function IncidentTimeline() {
  const events = [
    { t: "Nov 14, 2023", label: "Q&A launches publicly. Millions of workspaces join the waitlist immediately.", tag: "product" },
    { t: "~Dec 2023", label: "Original vector indexes near capacity, just 1 month after launch. Onboarding at risk of pausing.", tag: "incident" },
    { t: "Late 2023–early 2024", label: "Stopgap fix: new index “generations” provisioned as old ones fill; new workspaces routed to newest generation.", tag: "mitigation" },
    { t: "Apr 2024", label: "Waitlist fully cleared after 600x onboarding-capacity increase.", tag: "product" },
    { t: "May 2024", label: "Serverless migration removes the storage-capacity ceiling that forced the generation hack in the first place.", tag: "resolution" }
  ];
  const colorFor = (tag) => tag === "incident" ? "#dc2626" : tag === "mitigation" ? "#d97706" : tag === "resolution" ? "#059669" : "#2563eb";
  const rowH = 56;
  return (
    <svg viewBox={`0 0 680 ${events.length * rowH + 30}`} width="100%" style={{ maxWidth: 680 }}>
      <line x1="140" y1="15" x2="140" y2={events.length * rowH + 5} stroke="#d1d5db" strokeWidth="2" />
      {events.map((e, i) => {
        const y = 15 + i * rowH + rowH / 2;
        return (
          <g key={i}>
            <circle cx="140" cy={y} r="6" fill={colorFor(e.tag)} />
            <text x="125" y={y + 4} fontSize="11" textAnchor="end" fill="#374151">{e.t}</text>
            <foreignObject x="155" y={y - 20} width="510" height="44">
              <div style={{ fontSize: 12, lineHeight: 1.35, color: "#111" }}>{e.label}</div>
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
}

/* --------------------------------------------------------------------------
   DECISION-MATRIX TABLE (chart form)
   -------------------------------------------------------------------------- */
const AI_SURFACE_ROWS = [
  { surface: "AI Writer", shipped: "Nov 2022", scope: "Generation only, inside the block editor (no workspace search)", pricing: "Private alpha → paid add-on", latency: "Fast (single block)" },
  { surface: "Q&A / Chat", shipped: "Nov 2023", scope: "RAG across the user's own workspace pages", pricing: "$8–$10/seat add-on → unlimited in $20/seat Business plan (May 2025)", latency: "Seconds (retrieval + generation)" },
  { surface: "Enterprise Search", shipped: "May 2025", scope: "RAG across workspace + connected apps (Slack, Drive, GitHub, Teams, SharePoint, OneDrive...)", pricing: "Bundled in Business plan", latency: "Seconds (federated retrieval)" },
  { surface: "Research Mode", shipped: "May 2025", scope: "Deep multi-source synthesis: workspace + connectors + web", pricing: "Bundled in Business plan", latency: "Longer (multi-step)" },
  { surface: "Custom Agents", shipped: "2025–2026 rollout", scope: "Autonomous, multi-step tasks using the same retrieval stack", pricing: "Metered: $10 per 1,000 Notion credits", latency: "Variable (multi-step, tool calls)" }
];

function DecisionMatrixTable() {
  return (
    <div className="decision-matrix-wrap">
      <table className="decision-matrix">
        <thead>
          <tr><th>AI surface</th><th>Shipped</th><th>What it searches</th><th>Pricing model</th><th>Latency tolerance</th></tr>
        </thead>
        <tbody>
          {AI_SURFACE_ROWS.map((r, i) => (
            <tr key={i}>
              <td>{r.surface}</td><td>{r.shipped}</td><td>{r.scope}</td><td>{r.pricing}</td><td>{r.latency}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* --------------------------------------------------------------------------
   ARTICLE HEADER / NAV / PROGRESS
   -------------------------------------------------------------------------- */
const SECTIONS = [
  { id: "intro", label: "Introduction" },
  { id: "landscape", label: "Landscape" },
  { id: "rq1", label: "RQ1: Architecture" },
  { id: "rq2", label: "RQ2: Product Decisions" },
  { id: "rq3", label: "RQ3: Cost & Latency" },
  { id: "whatbroke", label: "What Broke" },
  { id: "learningsummary", label: "Learning Summary" },
  { id: "conclusion", label: "Conclusion" }
];

const LIFECYCLE_PHASES = ["Feasibility", "Design", "Build", "Evaluate", "Deploy", "Scale", "Govern"];
const ACTIVE_PHASES = ["Build", "Scale"];

function LifecycleStrip() {
  return (
    <div className="lifecycle-strip">
      {LIFECYCLE_PHASES.map((p, i) => (
        <div key={i} className={"lifecycle-phase" + (ACTIVE_PHASES.includes(p) ? " active" : "")}>{p}</div>
      ))}
    </div>
  );
}

function Header({ progress }) {
  return (
    <div className="header-wrap">
      <div className="progress-bar-outer"><div className="progress-bar-inner" style={{ width: progress + "%" }} /></div>
      <div className="header-bar">
        <div className="header-top-row">
          <div>
            <div className="header-title">How Notion AI Actually Works: Why the Retrieval Bill Set the Price</div>
            <div className="header-badge-row">
              <span className="type-badge">AI Product Teardown (Type 2)</span>
              <span className="lifecycle-badge">This case study lives at the <strong>Build → Scale</strong> transition.</span>
            </div>
          </div>
        </div>
        <LifecycleStrip />
        <div className="prev-next-row">
          <span>← Prev: Type 1 — AI Feasibility &amp; Technical Scoping</span>
          <span>Next: Type 3 — Agentic System Architecture →</span>
        </div>
      </div>
    </div>
  );
}

function SideNav({ active, onNavigate, visible }) {
  if (!visible) return null;
  return (
    <div className="side-nav">
      {SECTIONS.map(s => (
        <div key={s.id} className={"nav-item" + (active === s.id ? " active" : "")} onClick={() => onNavigate(s.id)}>
          {s.label}
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------------------
   WARM-UP SCREEN
   -------------------------------------------------------------------------- */
function WarmUpScreen({ onDone }) {
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});

  function submit(id, text) {
    if (text.trim().length < 25) return;
    setAnswers(prev => ({ ...prev, [id]: text }));
    setRevealed(prev => ({ ...prev, [id]: true }));
  }

  const allDone = CROSS_ARTIFACT_WARMUP.every(w => revealed[w.id]);

  return (
    <div className="warmup-screen">
      <div className="warmup-title">Before you begin — recall from your prior reading</div>
      <p className="prose">
        These three questions test principles from articles you have already completed. They are retrieval practice,
        not scored assessment — answer in your own words and apply the principle to a new situation.
      </p>
      {CROSS_ARTIFACT_WARMUP.map(w => (
        <div key={w.id} className="warmup-question">
          <div className="q-prompt">{w.prompt}</div>
          {!revealed[w.id] && <WarmUpInput onSubmit={(t) => submit(w.id, t)} />}
          {revealed[w.id] && (
            <div className="explanation-box">
              <div className="reader-answer"><strong>Your answer:</strong> {answers[w.id]}</div>
              <div className="full-explanation">
                <strong>This tested:</strong> {w.principle}<br />
                <strong>Source:</strong> {w.sourceArticle} ({w.sourceType}, lifecycle position: {w.lifecycle})
              </div>
            </div>
          )}
        </div>
      ))}
      <div className="warmup-actions">
        <button className="btn" disabled={!allDone} onClick={() => onDone(false)}>
          {allDone ? "Continue to today's article" : "Answer all three to continue, or skip below"}
        </button>
        <button className="btn btn-outline btn-skip" onClick={() => onDone(true)}>Skip warm-up</button>
      </div>
    </div>
  );
}

function WarmUpInput({ onSubmit }) {
  const [text, setText] = useState("");
  return (
    <div className="interp-input-row">
      <textarea className="text-input" rows={2} placeholder="Min. 25 characters..." value={text} onChange={e => setText(e.target.value)} />
      <button className="btn btn-small" disabled={text.trim().length < 25} onClick={() => onSubmit(text)}>Submit</button>
    </div>
  );
}

/* --------------------------------------------------------------------------
   MAIN APP
   -------------------------------------------------------------------------- */
function App() {
  const width = useWindowWidth();
  const navVisible = width >= 1160;

  const [warmUpDone, setWarmUpDone] = useState(false);
  const [warmUpSkipped, setWarmUpSkipped] = useState(false);
  const [activeSection, setActiveSection] = useState("intro");

  const [chartInterp, setChartInterp] = useState({});
  const [mcqState, setMcqState] = useState({});
  const [numericState, setNumericState] = useState({});
  const [tgState, setTgState] = useState({});
  const [tfState, setTfState] = useState({});
  const [principleState, setPrincipleState] = useState({});
  const [applyItPresent, setApplyItPresent] = useState({ thesis: "", assumption: "", disconfirm: "", premortem: "", submitted: false });
  const [applyIt2027, setApplyIt2027] = useState({ text: "", submitted: false });
  const [insightSlotText, setInsightSlotText] = useState("");
  const [insightRevealed, setInsightRevealed] = useState(false);
  const [teState, setTeState] = useState({ present: "", future: "", submitted: false });

  const [score, setScore] = useState(0);
  const [scoredIds, setScoredIds] = useState({});
  const [missedPrinciples, setMissedPrinciples] = useState([]);

  const sectionRefs = useRef({});

  const handleScore = useCallback((id, correct, principleLabel) => {
    setScoredIds(prev => {
      if (prev[id] !== undefined) return prev;
      const next = { ...prev, [id]: correct };
      setScore(s => s + (correct ? 1 : 0));
      if (!correct && principleLabel) setMissedPrinciples(mp => [...mp, principleLabel]);
      return next;
    });
  }, []);

  useEffect(() => {
    function onScroll() {
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = sectionRefs.current[s.id];
        if (el && el.getBoundingClientRect().top - 120 <= 0) current = s.id;
      }
      setActiveSection(current);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function navigate(id) {
    const el = sectionRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setActiveSection(id);
  }

  function registerRef(id) {
    return (el) => { sectionRefs.current[id] = el; };
  }

  const progress = ((SECTIONS.findIndex(s => s.id === activeSection) + 1) / SECTIONS.length) * 100;

  if (!warmUpDone) {
    return (
      <div className="app-root">
        <WarmUpScreen onDone={(skipped) => { setWarmUpSkipped(skipped); setWarmUpDone(true); }} />
      </div>
    );
  }

  return (
    <div className="app-root">
      <Header progress={progress} />
      <div className="score-badge">Score: {score} / {Object.keys(scoredIds).length || 0}</div>
      <div className="body-wrap">
        <SideNav active={activeSection} onNavigate={navigate} visible={navVisible} />
        <div className="content-col">

          {/* ================= INTRODUCTION ================= */}
          <section id="intro" ref={registerRef("intro")}>
            <SectionHeading id="intro">Introduction</SectionHeading>
            <Prose>
              An AI feature that looks like one simple box — type a question, get an answer — is usually three
              separate systems wearing a trenchcoat: a way to turn documents into searchable meaning, a way to rank
              and retrieve the right pieces of those documents, and a language model that turns the retrieved pieces
              into a sentence. The cost of building and running the first two systems, not the third, decides what
              the feature can promise and what it can charge for. Notion is the sharpest public case of this because
              its own engineering team published, in detail, the multi-year cost curve behind its AI feature: three
              separate infrastructure rebuilds in two years, each one tied to a moment when Notion could change what
              it charged.
            </Prose>
            <Prose>
              Notion is a block-based workspace and document tool that reached 100 million users by August 2024
              (Notion Blog, 2024). It introduced Notion AI in three stages: a writing-assistant-only private alpha in
              November 2022 (Notion Blog, 2022), a Retrieval-Augmented-Generation-based "Q&A" feature in beta in
              November 2023 built in partnership with both OpenAI and Anthropic (Notion Blog, 2023), and a bundled
              "Notion AI for Work" relaunch in May 2025 that folded unlimited AI into a flat per-seat price
              (Notion Blog, 2025). By 2025, Notion had crossed $500 million in annual revenue, with growth
              "accelerating every month" after that May 2025 AI relaunch (CNBC, 2025). Before any of this, the
              baseline was the same one every wiki-style document tool shared: literal keyword search, which finds a
              page titled "group standup summary" only if you search those exact words — not if you search "team
              meeting notes," even though the two mean the same thing (Notion Engineering Blog, 2026).
            </Prose>
            <Prose>
              Keyword search's blind spot is paraphrase. A workspace holds years of pages written by many different
              people in many different words, and a rule that only matches exact text cannot bridge that gap. The
              other obvious fix — just hand a language model the user's whole workspace and let it answer — breaks
              on cost and scale: workspaces the size Notion serves cannot fit inside any model's context window, and
              re-sending a large slice of a workspace on every single question would be slow and expensive to run at
              Notion's scale. Retrieval-Augmented Generation, first searching for a small set of relevant pages, then
              only handing that shortlist to the model, is the design that survives both constraints — but retrieval
              is its own system, with its own cost curve, and that cost curve is what this article traces.
            </Prose>
            <Prose>
              This article addresses three questions. First, what actually runs, step by step, when someone asks
              Notion AI a question inside a workspace they have spent years filling with unstructured pages? Second,
              what product decisions did Notion's block-based, permission-heavy document model force onto the AI
              feature — what got left out, delayed, or deliberately kept separate to keep AI feeling like part of the
              same document rather than a bolted-on chatbot? Third, how did the dollar cost of Notion's own retrieval
              infrastructure — not the falling price of frontier language models — set the pace at which Notion could
              change what it charges for AI?
            </Prose>
          </section>

          {/* ================= LANDSCAPE ================= */}
          <section id="landscape" ref={registerRef("landscape")}>
            <SectionHeading id="landscape">Technical and Product Landscape</SectionHeading>
            <Prose>
              Before Notion AI, "search" inside a document workspace meant matching words, not meaning. Notion's own
              engineering team later used this exact example to justify the switch: a query for "team meeting notes"
              would miss a page titled "group standup summary," even though a person would recognize instantly that
              the two are the same thing (Notion Engineering Blog, "Two years of vector search at Notion," 2026).
              That literal-match baseline was good at finding a page whose exact title you already remembered, and
              bad at almost everything else — which is precisely the gap a workspace with years of accumulated,
              inconsistently-titled pages runs into hardest.
            </Prose>
            <Prose>
              Two conventional paths existed before Notion's design, and both had real costs. Classic keyword or
              full-text search is cheap and fast but blind to paraphrase, as above. The other obvious alternative —
              simply pasting a user's relevant documents into a language model's prompt on every question — runs
              into a harder wall as a workspace grows: language models have a fixed context window, workspaces can
              vastly exceed it, and even where content fits, re-processing a large slice of it on every single
              question is exactly the kind of repeated, per-query cost that a flat-priced product cannot sustain
              indefinitely. Retrieval-Augmented Generation exists to avoid both failure modes: pre-compute a
              searchable representation of every page once, then at question time retrieve only the small number of
              pages actually relevant, and send only those to the model.
            </Prose>
            <Prose>
              The baseline condition when Notion shipped this design was not a small, careful rollout — it was
              overwhelming, immediate demand. Notion's own account of the Q&A launch says plainly that the team
              "quickly accumulated a waitlist of millions of workspaces eager to access Q&A" within days of the
              November 2023 launch (Notion Engineering Blog, 2026). The infrastructure that existed at that moment
              was a dual-path pipeline — offline Apache Spark batch jobs to embed and bulk-load existing pages, and
              online Kafka consumers to keep active workspaces fresh within roughly a minute of an edit — running on
              a vector database with storage and compute coupled together on dedicated "pod" clusters, sharded by
              workspace ID the same way Notion had long sharded its Postgres databases (Notion Engineering Blog,
              2026).
            </Prose>
            <Prose>
              The gap between "looks like a simple search box" and "is a fixed-capacity, uptime-billed system" showed
              up almost immediately: by Notion's own account, "just one month after launch, our original indexes were
              close to capacity" — close enough that, without a fix, Notion would have had to pause onboarding new
              workspaces off that same waitlist it had just built (Notion Engineering Blog, 2026). The chart below
              lays out the milestones that followed, and the one after it shows just how large a scaling gap the team
              had to close in the five months after that near-miss.
            </Prose>

            <ChartFrame title="Notion AI feature and infrastructure milestones, Nov 2022 – 2026" sourceNote="Source: Notion Blog and Notion Engineering Blog, 2022–2026 (see article sources).">
              <TimelineChart />
            </ChartFrame>
            <ChartInterpretation
              chartId="chart-timeline"
              state={chartInterp}
              setState={setChartInterp}
              items={[
                {
                  kind: "Qualitative / mechanism",
                  prompt: "Every infrastructure milestone on this timeline (serverless migration, turbopuffer, Page State Project, Ray) sits between two product milestones (Q&A's 2023 add-on launch and the 2025 all-in-one bundle). What does that pattern suggest about the order in which a cost-sensitive AI feature has to prove itself before its pricing model can change?",
                  authored: "It suggests pricing follows infrastructure, not the other way around: Notion didn't announce cheaper AI and then go build the cost reduction — it built the reduction first (serverless, then turbopuffer, then Page State), and only then, in May 2025, changed what it charged. A team that wants to promise unlimited usage before doing this work is making a bet the infrastructure hasn't earned yet."
                },
                {
                  kind: "Causal / comparative",
                  prompt: "Notion crossed 100 million users in August 2024 — after the Q&A capacity crisis and the serverless migration, but before the turbopuffer migration finished and before the 2025 pricing bundle. What does the timing of that milestone (relative to the infrastructure work) tell you about whether user growth or infrastructure readiness was the harder constraint on scaling Q&A?",
                  authored: "User growth (crossing 100M total users) kept climbing right through the middle of the infrastructure rebuild, which tells you the demand side was never the bottleneck — people were already there and asking. The bottleneck was entirely on the supply side: whether Notion's own retrieval stack could serve that demand affordably. That is a useful diagnostic for any AI PM: if your adoption curve keeps climbing while your infrastructure is mid-rebuild, the constraint you are managing is capacity and cost, not demand."
                }
              ]}
            />

            <ChartFrame title="Growth in onboarding capacity and workspace scale, Nov 2023 → Apr 2024" sourceNote="Source: Notion Engineering Blog, “Two years of vector search at Notion,” 2026.">
              <OnboardingChart />
            </ChartFrame>
            <ChartInterpretation
              chartId="chart-onboarding"
              state={chartInterp}
              setState={setChartInterp}
              items={[
                {
                  kind: "Qualitative / mechanism",
                  prompt: "Daily onboarding capacity grew 600x while active workspaces grew only 15x in the same window. Is a 600x capacity increase against only a 15x usage increase a sign of comfortable over-provisioning, or a sign that the original launch was far more under-built than a 15x growth number alone would suggest?",
                  authored: "It is the second one. The 600x figure describes how far behind the onboarding pipeline started, not how much slack Notion chose to build in — Notion's own account says the launch-day rate of “a few hundred workspaces per day” would have taken decades to clear a multi-million-workspace waitlist. The 600x number is a measure of how badly under-provisioned day one was, not a comfortable safety margin the team planned for."
                },
                {
                  kind: "So-what / decision implication (threshold rule)",
                  prompt: "Using the anchors here — a few hundred workspaces onboarded per day at launch, against a waitlist in the millions — at roughly what ratio of waitlist size to daily onboarding rate would you, as a PM, escalate from “let engineering tune the pipeline” to “we may need a different vector database entirely,” and was Notion past that line on day one?",
                  authored: "A useful working rule: if clearing the current waitlist at the current rate would take longer than roughly a business-planning horizon (a few quarters), that is the signal to escalate beyond pipeline tuning. At a few hundred per day against millions of workspaces, Notion's own math implied a multi-decade clearance time — many orders of magnitude past that threshold — which is why the eventual fix was structural (new index generations, then a full database migration a few months later), not just faster batch jobs."
                }
              ]}
            />

            <NumericQuestion
              id="td-onboarding-fermi"
              isFermi={true}
              prompt="Notion says it onboarded “a few hundred workspaces per day” at launch (November 2023), that this rate rose 600x by April 2024, and that the entire multi-million-workspace waitlist was cleared by then. Using 300/day as your launch-rate anchor (implying a peak rate of 300 × 600 = 180,000/day) and treating the roughly 150-day window as a roughly linear ramp from the launch rate to the peak rate, estimate the total number of workspaces onboarded across that window."
              skeleton="Total onboarded ≈ average daily rate × number of days. For a roughly linear ramp from a low rate to a high rate, the average rate is close to half the peak rate: average ≈ (300 + 180,000) / 2 ≈ 90,000/day."
              unit="workspaces"
              correctValue={13500000}
              lowerBound="45,000 (naive: launch rate × 150 days — ignores that the rate grew at all)"
              upperBound="27,000,000 (naive: peak rate × 150 days — ignores that the rate started far lower and ramped up)"
              sensitiveAssumption="The shape of the ramp curve matters more than the peak multiple itself: if most of the growth happened late in the window (a slower early ramp, a late sprint), the true total lands much closer to the lower bound than a linear-ramp assumption suggests."
              decomposition={[
                "Anchor 1 (FACT): launch rate ≈ a few hundred workspaces/day (Notion Engineering Blog, 2026).",
                "Anchor 2 (FACT): 600x daily onboarding capacity increase by April 2024 (same source) → peak rate ≈ 180,000/day.",
                "Anchor 3 (FACT): the window is Nov 2023 → Apr 2024, roughly 150 days.",
                "Average rate under a linear-ramp assumption ≈ (300 + 180,000)/2 ≈ 90,000/day.",
                "Total ≈ 90,000 × 150 ≈ 13.5 million — the same order of magnitude as Notion's own “millions of workspaces” waitlist description, which is a useful sanity check on the ramp assumption."
              ]}
              state={numericState}
              setState={setNumericState}
              onScore={(id, c) => handleScore(id, c, "Rate vs. level: a peak multiple describes how far behind the starting point was, not the total volume processed — that requires the whole ramp curve, not just the endpoints.")}
            />

            <Glossary terms={[
              { term: "RAG (Retrieval-Augmented Generation)", def: "Searching your own documents first, then having a model write an answer using only what was found — instead of asking the model to answer from memory alone." },
              { term: "Embedding", def: "A list of numbers that represents the meaning of a piece of text, so a computer can compare meanings instead of matching exact words." },
              { term: "Vector database", def: "A data store built to quickly find the embeddings whose meaning is closest to a new question." },
              { term: "Index generation", def: "A fresh, separate copy of the search index that a team starts routing new data to once the old one is full, instead of resizing the old one." }
            ]} />
          </section>

          {/* ================= RQ1: ARCHITECTURE ================= */}
          <section id="rq1" ref={registerRef("rq1")}>
            <SectionHeading id="rq1">RQ1: What Actually Runs When You Ask a Question</SectionHeading>
            <Prose>
              The claim to test in this section is specific: when someone types a question into Notion AI, the system
              that answers is not one model — it is a small pipeline of separate steps, and the step that decides
              whether the answer is any good is the search step in the middle, not the language model at the end.
            </Prose>
            <Prose>
              The obstacle this pipeline has to solve is concrete. A workspace can hold years of pages across many
              teams, each page visible to a different, specific subset of people. Sending "everything the user might
              mean" straight into a language model on every question would blow past any realistic context window,
              and would need to be paid for, in tokens, on every single question — an approach that gets more
              expensive, not cheaper, as a workspace grows. So a retrieval step — deciding which small handful of
              pages are even worth looking at — has to run before generation, not instead of it.
            </Prose>
            <Prose>
              Notion's own security-and-privacy documentation describes exactly this two-phase design. Offline, for
              every page in a workspace, Notion generates an embedding "by using an OpenAI zero-retention embeddings
              API," then stores that embedding in a vector database such as turbopuffer (Notion Help Center, "Notion
              AI security & privacy practices," current). Online, at question time, the documented flow runs in six
              steps: a request comes in; the system decides whether it needs to search the workspace at all; if so,
              it generates a search query; that query is sent to the vector database, which returns a list of
              candidate pages; a language model then re-ranks and refines that candidate list; and only then does a
              model generate the actual answer from the refined, ranked pages before Notion formats the output for
              display (same source). The language model at the very end is doing far less work than it looks like —
              most of the "intelligence" a user experiences already happened in the ranking step just before it.
            </Prose>
            <Prose>
              Even this documented pipeline has stated blind spots. Notion's own help documentation for Q&A says the
              feature "doesn't search through databases (yet)" because a database, under the hood, is just a
              collection of individual pages, and Q&A's page-level retrieval does not necessarily recognize that many
              of those pages belong to one structured table (Notion Help Center, "Understanding how Q&A finds
              answers," 2024). The same documentation says Q&A "doesn't have access to wider knowledge" outside the
              workspace. Both are retrieval-step limits, not model limits: the language model at the end of the
              pipeline is never even shown the database rows or the outside knowledge, because the search step never
              retrieved them in the first place.
            </Prose>
            <Prose>
              The non-obvious part of this design is where permission-checking actually lives. Notion's documentation
              states that the models used to generate a response "cannot see or use any information to which that
              user does not already have access" (Notion Help Center, security & privacy practices, current) — and
              given the pipeline above, that check has to happen at the vector-database and ranking steps, before
              generation, not as a filter on the model's output afterward. That ordering matters because a language
              model has no reliable way to "un-know" a page it has already read and summarized into an answer — so
              if a restricted page were retrieved by mistake, checking permissions only after the model wrote its
              answer would already be too late. Getting the retrieval step's permission filter wrong is a security
              bug, not a wording bug in the final sentence.
            </Prose>
            <Prose>
              The same retrieval pattern also extends outward, not just inward. Notion's May 2025 Enterprise Search
              launch applies the same "search first, then generate" pipeline to content outside Notion entirely —
              connected apps including Slack, Google Drive, GitHub, Jira, Microsoft Teams, SharePoint, and OneDrive,
              with more connectors rolling out afterward (Notion Blog, "Introducing Notion AI for Work," 2025). That
              is a materially harder version of the same ranking problem: the refinement step now has to merge and
              sort results coming from several different systems, each with its own metadata, freshness signal, and
              permission model, not just from Notion's own internally consistent page graph.
            </Prose>

            <ChartFrame title="Notion AI's retrieval-augmented pipeline (offline indexing + online response)" sourceNote="Structure documented in Notion AI security & privacy practices (Notion Help Center, current).">
              <RagPipelineDiagram />
            </ChartFrame>
            <ChartInterpretation
              chartId="chart-rag-pipeline"
              state={chartInterp}
              setState={setChartInterp}
              items={[
                {
                  kind: "Qualitative / mechanism",
                  prompt: "The diagram places the permission check inside the vector-database lookup and the ranking step, not as a filter on the finished answer. Why does building the permission check into retrieval — rather than checking the output afterward — matter specifically for a system where the 'output' is written by a language model?",
                  authored: "A language model cannot reliably discard knowledge it has already incorporated into a written answer — there is no clean way to make it 'forget' a restricted page it already read and summarized. So the only point where access can be reliably enforced is before that page ever reaches the model: at the retrieval and ranking steps. Checking permissions after generation would mean the restricted content has already shaped the wording of the answer, even if you tried to redact it afterward."
                },
                {
                  kind: "So-what / decision implication (segmentation)",
                  prompt: "The pipeline decides, per question, whether it even needs to search the workspace at all (the second online step). How would you segment the questions Notion AI receives so that this 'does this need search' decision is tuned differently for a solo personal workspace versus a 500-person company workspace?",
                  authored: "A solo workspace has a small, low-risk corpus, so it's cheap to default toward 'search when in doubt' — false positives just mean a fast, low-cost retrieval that returns little. A 500-person company workspace has a much larger, permission-sensitive corpus, so the same default is riskier and more expensive at scale; there, the 'does this need search' classifier should be tuned more conservatively, and its false negatives (skipping search when it was needed) should be monitored separately from a personal workspace's, because the cost of getting it wrong is different in each segment."
                }
              ]}
            />

            <MCQCard
              id="mcq-rq1-bottleneck"
              kindLabel="Architecture and System Implication (T-A)"
              prompt="As Notion adds more connected data sources to search per question — Slack, Google Drive, GitHub, Microsoft Teams, SharePoint, OneDrive, and more — which stage of the pipeline shown above is most likely to become the bottleneck first, and what should a PM prioritize next?"
              options={[
                {
                  text: "The embedding-generation step, since turning every newly connected document into an embedding ahead of time will eventually exceed what any embeddings API can process in a day.",
                  correct: false,
                  errorTag: "misreading a background cost as a live-request bottleneck",
                  errorDetail: "Offline embedding generation is a batch process that runs ahead of any user question and can be scaled with more offline compute over time; it does not sit on the critical path a user is waiting on.",
                  scaffold: "Ask which step happens while the user is actively waiting for an answer, versus which step happens quietly, in the background, before any question is ever asked."
                },
                {
                  text: "The ranking and refinement step, because merging and sorting results from several different sources within a tight response-time budget gets harder with every new connector, while storage mostly scales with more offline compute.",
                  correct: true,
                  transferNote: "this generalizes to any system that federates multiple data sources — expect query-time fusion and ranking to become the bottleneck before storage or ingestion do.",
                  fullExplain: "Storage and offline embedding scale by adding more background compute over time, which is a solved, well-understood problem. But ranking and refining results across sources with different metadata, freshness signals, and permission models happens live, on every single question, inside a tight latency budget — and that live-request cost grows with every new connector added, which is exactly the pattern that makes it the first bottleneck to watch."
                },
                {
                  text: "The permission-check step, since verifying access across a growing number of connected apps will eventually require checking so many separate permission systems that the check itself becomes the slowest part of the request.",
                  correct: false,
                  errorTag: "single-cause fallacy",
                  errorDetail: "Permission-checking does add real cost as connectors multiply, but it runs alongside the ranking problem, not instead of it — the cross-source ranking and fusion work is the larger, harder-to-parallelize cost as sources diversify.",
                  scaffold: "Consider whether permission-checking and cross-source ranking are competing for the same scarce resource, or whether one of them can be parallelized more easily than the other."
                },
                {
                  text: "The language model itself, because a model that has mostly seen one company's own documents during training will become measurably less accurate once more outside connectors start feeding it unfamiliar formats.",
                  correct: false,
                  errorTag: "applying classical software assumptions to AI",
                  errorDetail: "Adding a connector does not retrain or fine-tune the underlying language model; the model simply reads whatever context the retrieval step hands it, so connector growth is a retrieval-scaling problem, not a model-accuracy problem.",
                  scaffold: "Check whether adding a new connector changes the model's own trained parameters, or only changes what gets handed to that same, unchanged model at question time."
                }
              ]}
              state={mcqState}
              setState={setMcqState}
              onScore={(id, c) => handleScore(id, c, "Federated retrieval's bottleneck is query-time ranking and fusion, not storage or ingestion.")}
            />

            <div className="consulting-case">
              <div className="case-label">Case Prompt</div>
              <MCQCard
                id="mcq-rq1-consulting"
                kindLabel="PM Consulting Case (T-C) — weakest link"
                prompt="Statuto, a legal-research startup, lets small law firms search their own case notes, client memos, and filed briefs in plain English. Statuto's engineers propose shipping instant, firm-wide 'ask anything' search before finishing firm-level permission scoping — today, any associate's question can retrieve any partner's confidential client memo. Using the retrieval-then-generate pattern from this section, which assumption must hold for shipping the feature early to create value rather than legal and reputational risk, and what evidence in this section is thinnest in supporting that assumption at Statuto specifically?"
                options={[
                  {
                    text: "That the language model's own judgment will decline to repeat confidential material even if a restricted memo is retrieved and handed to it as context.",
                    correct: false,
                    errorTag: "applying classical software assumptions to AI",
                    errorDetail: "This section showed that permission-checking has to happen at retrieval, before a page reaches the model, precisely because a model cannot reliably ‘un-know’ material it has already read — trusting the model's judgment after the fact is the exact failure mode the Notion architecture is built to avoid.",
                    scaffold: "Reread the paragraph on why permission-checking sits inside retrieval rather than as an output filter, and ask whether Statuto's plan puts the check in the same place."
                  },
                  {
                    text: "That permission-aware retrieval can be bolted onto the search layer after launch, without redesigning how pages are indexed and ranked, while Notion's own filter was built into retrieval from day one.",
                    correct: true,
                    transferNote: "this generalizes to any AI feature over sensitive, permissioned content: the filter has to be a retrieval-time design decision, not a fast-follow.",
                    fullExplain: "The section's evidence shows Notion's models 'cannot see or use any information to which that user does not already have access,' enforced at the vector-database and ranking steps — a structural property of the indexing scheme, not a bolt-on setting. Statuto's plan bets it can retrofit that same structural guarantee onto an index that was never scoped that way, which is a materially weaker starting position than Notion's own case, and the article gives no evidence that this kind of retrofit is straightforward."
                  },
                  {
                    text: "That because Notion successfully shipped Q&A before finishing every connector integration, Statuto can safely follow the same 'ship first, refine later' sequence for its own permission model.",
                    correct: false,
                    errorTag: "survivorship bias",
                    errorDetail: "Notion's staged rollout applied to which data sources were searched, not to whether permission checks existed at all — generalizing from Notion's sequencing to Statuto's much higher-stakes permission gap ignores that difference.",
                    scaffold: "Separate what Notion delayed (adding more connectors) from what Notion never delayed (checking permissions at all) before assuming the same sequencing applies."
                  },
                  {
                    text: "That Statuto's client memos are similar enough in structure to Notion's pages that the same embedding model will retrieve them with equal accuracy.",
                    correct: false,
                    errorTag: "confusing a metric for its cause",
                    errorDetail: "Retrieval accuracy is a real concern, but it is not the load-bearing assumption in this scenario — the scenario's stated risk is a permission leak, not a relevance miss, so this option answers a different question than the one posed.",
                    scaffold: "Reread the case prompt: the stated risk is that a restricted memo could be retrieved at all, not that retrieval might return the wrong memo."
                  }
                ]}
                state={mcqState}
                setState={setMcqState}
                onScore={(id, c) => handleScore(id, c, "Permission-aware retrieval must be a retrieval-time design decision from the start, not a fast-follow.")}
              />
            </div>

            <PrincipleGate sectionId="principle-rq1" state={principleState} setState={setPrincipleState} />
            <PatternTransferQuestion
              id="tf-rq1"
              principle="permission-checking and access control must be built into the retrieval step itself, before generation, because a language model cannot reliably un-know material it has already incorporated into an answer"
              context="a hospital network building an internal tool that lets clinicians ask natural-language questions across patient charts, lab results, and internal care-team notes."
              state={tfState}
              setState={setTfState}
            />
            <Prose>
              What the evidence in this section supports is narrow but solid: Notion's own documentation describes a
              genuine two-phase retrieval-augmented pipeline, with permission enforcement built into the retrieval and
              ranking steps rather than bolted onto the output, and that design directly explains why Q&A can answer
              instantly from a huge private corpus without shipping workspace content off to train outside models.
              What it does not support is any claim about how well that ranking step actually performs — Notion's
              documentation describes the steps in the pipeline, not the precision or recall of the ranking algorithm,
              and it does not say how gracefully that ranking holds up as the number of connected sources keeps
              growing.
            </Prose>
            <Glossary terms={[
              { term: "Zero-retention API", def: "A way of calling an outside AI service that guarantees the service deletes your data immediately after answering, instead of keeping a copy." },
              { term: "Re-ranking", def: "Taking a rough list of possibly-relevant pages and sorting it again, more carefully, before showing the best few to the model." },
              { term: "Span", def: "A small chunk of a page — a few sentences to a paragraph — that gets its own embedding, so long pages can be searched piece by piece." }
            ]} />
          </section>

          {/* ================= RQ2: PRODUCT DECISIONS ================= */}
          <section id="rq2" ref={registerRef("rq2")}>
            <SectionHeading id="rq2">RQ2: What the Block Editor Forced Onto the AI Feature</SectionHeading>
            <Prose>
              This section's claim: the AI features Notion actually shipped were chosen not because they were the
              most impressive demo, but because they fit the shape of a block-based, permission-gated document
              product without turning Notion into a different kind of app.
            </Prose>
            <Prose>
              The obstacle is that users already carried a specific mental model of what Notion is: pages made of
              small, editable blocks, sharing that defaults to private, and no central chat window as the main way
              you interact with your own content. Any AI feature that ignored that model risked feeling like a
              separate tool bolted onto the side of Notion, something you'd have to context-switch into rather than
              something that was simply part of editing a page.
            </Prose>
            <Prose>
              The evidence for the thesis is concrete at every stage. The original 2022 private-alpha assistant
              worked as generation inside the block editor itself — draft, brainstorm, edit, summarize — described
              in Notion's own launch post as a tool that helps "before, during, and after the writing process,"
              not a separate destination (Notion Blog, "Introducing Notion AI," 2022). When Q&A launched in
              November 2023, Notion deliberately gave it three different entry points inside the existing product —
              the sidebar Search bar, a sparkle icon on the bottom right of any page, and a global keyboard shortcut
              reachable from outside Notion entirely — rather than requiring a single dedicated chat destination
              (Notion Blog, "Introducing Q&A," 2023). And Autofill lets AI populate database properties row by row,
              inside the existing table/database mental model, rather than requiring a user to leave the table and
              ask a chatbot (Notion Help Center, security & privacy practices, current, listing "Autofill summaries
              and insights across entire databases" as a core capability).
            </Prose>
            <Prose>
              The evidence against, or the limit, is just as deliberate. Q&A's own help documentation states plainly
              that it "doesn't search through databases (yet)," because a database is just a collection of individual
              pages under the hood, and treating a whole database as one queryable object would have required a
              different retrieval design than the page-level indexing Notion had already built (Notion Help Center,
              "Understanding how Q&A finds answers," 2024). That reads less like an oversight and more like a scoping
              trade-off: shipping page-level retrieval first, and leaving structured, row-level retrieval for later.
            </Prose>
            <Prose>
              The non-obvious part is that Notion made the multiplicity of these AI surfaces an explicit, named part
              of the product rather than hiding it behind one ambiguous "AI" button. Its own help documentation states
              directly: "Notion AI gives you three distinct AI tools in your workspace" (Notion Help Center, 2024).
              Telling users up front that the writer, Q&A, and autofill are different tools with different scopes
              manages expectations about what each one can and cannot do, instead of presenting one button that might
              or might not search your content depending on the question.
            </Prose>
            <Prose>
              Custom Agents, rolling out through 2025 and 2026, extend this same pattern into a new shape. They use
              the same underlying retrieval stack as Q&A and Enterprise Search, but they are priced and scoped
              completely differently: metered at $10 per 1,000 Notion credits, rather than bundled into the flat
              per-seat price the way Q&A and chat now are (Notion pricing page, current). That split makes sense once
              you separate the two kinds of AI work: a single Q&A question is a bounded, predictable retrieval-plus-
              generation call, while an autonomous, multi-step agent can call tools and retrieve repeatedly in ways
              that are far less predictable to price flatly — so the newest, least-predictable surface got the
              metered model, while the now well-understood surface got folded into the flat price.
            </Prose>

            <ChartFrame title="Notion's AI product surfaces: scope, launch date, and pricing model" sourceNote="Source: Notion Blog, Notion Help Center, and Notion pricing page (current).">
              <DecisionMatrixTable />
            </ChartFrame>
            <ChartInterpretation
              chartId="chart-decision-matrix"
              state={chartInterp}
              setState={setChartInterp}
              items={[
                {
                  kind: "Causal / comparative",
                  prompt: "Q&A/Chat moved from a $8–$10/seat add-on to unlimited use inside a flat $20/seat plan, while Custom Agents — the newest surface — launched with metered, per-credit pricing instead of a flat rate. What does that divergence in pricing model imply about how confident Notion is in the cost predictability of each surface?",
                  authored: "Flat, unlimited pricing is a bet that the average cost per use is now low and predictable enough that heavy users won't make the plan unprofitable — a bet Notion could only make for Q&A/Chat after multiple documented infrastructure cost cuts. Custom Agents, being new and much less predictable in how many retrieval and tool calls a single task might trigger, got metered pricing instead, which suggests Notion does not yet have the same confidence in its cost curve for agentic work that it has built up for single-question retrieval."
                },
                {
                  kind: "So-what / decision implication (build/buy/partner or sacrifice ratio)",
                  prompt: "Enterprise Search and Research Mode both launched bundled into the same flat Business plan as Q&A/Chat, even though Research Mode's multi-step synthesis is described as slower and more resource-intensive than a single Q&A question. What sacrifice ratio is Notion accepting by bundling a heavier-weight feature into the same flat price as a lighter one, and why might that be an acceptable trade for now?",
                  authored: "Notion is accepting the risk that heavy Research Mode users cost more, on average, than the flat per-seat price fully covers — subsidized by lighter Q&A/Chat users on the same plan. That is an acceptable near-term trade if it drives adoption of the whole Business plan bundle (the same logic behind the “buying separate tools costs $150–300+ per user” pitch), but it is the kind of bundling decision that usually gets revisited, and metered, once a company can measure the actual cost gap between light and heavy users at scale — exactly the pattern Custom Agents already show for an even newer, heavier surface."
                }
              ]}
            />

            <MCQCard
              id="mcq-rq2-divergence"
              kindLabel="Technical Trend Reasoning (T-B)"
              prompt="Q&A/Chat moved from metered add-on pricing to unlimited use in a flat-rate plan, while Custom Agents — the newest surface, launched around the same time, on the same underlying retrieval stack — shipped with metered, per-credit pricing instead of joining that same flat rate. What does this pricing divergence between two AI surfaces most likely indicate?"
              options={[
                {
                  text: "Custom Agents must run on a fundamentally more expensive underlying model than Q&A/Chat uses, which is why it requires metered pricing.",
                  correct: false,
                  errorTag: "applying classical software assumptions to AI",
                  errorDetail: "The article does not establish that Custom Agents runs a different, pricier model — the documented reason for metered pricing is usage unpredictability (variable, multi-step tool calls), not a stated difference in model cost.",
                  scaffold: "Check whether the article ever claims Custom Agents uses a different model, or whether it only describes a difference in how unpredictable a task's usage is."
                },
                {
                  text: "Notion is deliberately making Custom Agents unappealing right now so that marketing and sales attention stays focused on Q&A/Chat instead of the newer surface.",
                  correct: false,
                  errorTag: "single-cause fallacy",
                  errorDetail: "This invents an unstated strategic motive that the article's evidence does not support — the simpler, evidenced explanation is a genuine difference in cost predictability between a single question and a multi-step autonomous task.",
                  scaffold: "Ask whether the article gives any evidence of an intentional demand-suppression motive, or whether a simpler, already-stated explanation (cost unpredictability) accounts for the same fact."
                },
                {
                  text: "Notion has enough usage history on Q&A/Chat to price it flatly, but not yet on Custom Agents, whose multi-step, autonomous tool calls make per-use cost far less predictable.",
                  correct: true,
                  transferNote: "this generalizes to any company rolling out a new, harder-to-predict AI capability alongside an older, well-understood one — expect the newer surface to carry usage-based pricing until its cost curve is proven.",
                  fullExplain: "Flat pricing is a bet that average cost per use is low and predictable; Notion could only make that bet for Q&A/Chat after multiple documented infrastructure cost cuts gave it a stable cost curve. Custom Agents are new, and an autonomous multi-step task can call tools and retrieve repeatedly in ways nobody has a multi-year cost history for yet — so it gets metered instead."
                },
                {
                  text: "Flat pricing for Q&A/Chat proves Notion's retrieval cost is now effectively zero, while metered pricing for Custom Agents proves agent costs remain extremely high.",
                  correct: false,
                  errorTag: "confusing rate and level",
                  errorDetail: "Flat pricing being viable only shows average cost is low and predictable enough not to lose money at $20/seat — it does not mean cost is zero, and metered pricing does not by itself prove agent costs are extremely high, only that they are not yet predictable.",
                  scaffold: "Separate 'cost is low and predictable enough to bundle' from the stronger claim 'cost is zero' before choosing this option."
                }
              ]}
              state={mcqState}
              setState={setMcqState}
              onScore={(id, c) => handleScore(id, c, "A pricing-model divergence between two AI surfaces usually tracks a difference in cost predictability, not necessarily a difference in the underlying model or an unstated strategic motive.")}
            />

            <div className="consulting-case">
              <div className="case-label">Case Prompt</div>
              <MCQCard
                id="mcq-rq2-consulting"
                kindLabel="PM Consulting Case (T-C)"
                prompt="Ledger, a spreadsheet-first accounting tool for small businesses, wants an AI feature that answers questions like 'which clients haven't paid in 60 days?' across many linked workbooks. The team is debating whether to launch it as a standalone 'Ledger Copilot' chat app, separate from the spreadsheet grid, to move faster. Using the product-design pattern from this section, what is the strongest reason to instead build the feature as AI-powered actions inside the existing spreadsheet grid rather than as a separate chat app?"
                options={[
                  {
                    text: "Users know rows, columns, and formulas; adding AI inside that grid keeps the feature predictable, matching how Notion built Q&A into its existing editor, not a separate app.",
                    correct: true,
                    transferNote: "this generalizes to any AI feature added to a product with an existing, well-learned mental model — fit the feature into that model's existing surface before building it a separate destination.",
                    fullExplain: "This section's strongest evidence is that Notion repeatedly chose to extend existing surfaces (the block editor, the search bar, the database row) rather than build one central AI destination, precisely so the feature's scope stayed predictable to users already familiar with the product. A standalone chat app forces users to learn a new mental model on top of the one they already trust."
                  },
                  {
                    text: "A standalone chat app would require a meaningfully more powerful, more expensive underlying language model than a simpler in-grid feature would ever realistically need.",
                    correct: false,
                    errorTag: "applying classical software assumptions to AI",
                    errorDetail: "Model choice is a separate decision from where a feature lives in the product's surface; nothing in this section ties chat-app placement to needing a more powerful model.",
                    scaffold: "Separate the question of which surface a feature lives on from the separate question of which model answers it."
                  },
                  {
                    text: "Building any standalone app is always slower to engineer, test, and ship than adding one more feature to an already-existing surface.",
                    correct: false,
                    errorTag: "base-rate neglect",
                    errorDetail: "This treats a general, unverified engineering-speed claim as if it were evidence specific to this section, which is about fitting a feature to a user's existing mental model, not about relative engineering effort.",
                    scaffold: "Check whether this section's evidence is actually about engineering speed, or about something else entirely."
                  },
                  {
                    text: "Small businesses generally trust standalone apps much less than embedded features, based on broad, well-established, frequently-cited patterns in modern software adoption research.",
                    correct: false,
                    errorTag: "extrapolating a short trend",
                    errorDetail: "This section's evidence is about how Notion scoped its own AI surfaces, not about a general trend in small-business software trust — the option imports an unrelated, unverified claim.",
                    scaffold: "Ask whether the article provides any evidence about small-business trust in standalone apps generally, or only about Notion's own specific design choices."
                  }
                ]}
                state={mcqState}
                setState={setMcqState}
                onScore={(id, c) => handleScore(id, c, "Fit a new AI feature into the product's existing, already-learned mental model before giving it a separate destination.")}
              />
            </div>

            <TrueFalseQuestion
              id="tg-rq2-training"
              prompt="True or False: Because Notion states that, by default, neither Notion nor its AI subprocessors use customer data to train any models, workspace content sent to OpenAI or Anthropic during a Q&A request is therefore never retained or stored by those providers."
              correctAnswer={false}
              authoredJustification="Notion's own documentation separates two different guarantees: not training on customer data by default, and data retention. Zero data retention with LLM providers is the default only for Enterprise-plan workspaces; for all non-Enterprise plans, LLM providers retain customer data for up to 30 days before deletion by default (Notion Help Center, security & privacy practices, current). 'Not used to train models' and 'not retained at all' are two separate commitments, and the claim quietly upgrades the first into the second."
              errorTag="scope creep misdiagnosis — treating a narrower guarantee (no training) as if it were a broader one (no retention at all)"
              state={tgState}
              setState={setTgState}
              onScore={(id, c) => handleScore(id, c, "A guarantee that is necessary (not used for training) is not automatically sufficient to support a broader claim (never retained).")}
            />

            <PrincipleGate sectionId="principle-rq2" state={principleState} setState={setPrincipleState} />
            <PatternTransferQuestion
              id="tf-rq2"
              principle="ship each AI surface inside the existing mental model of the product (the same editing surface, the same access points), and name the surfaces explicitly so users know what each one can and cannot reach, rather than hiding everything behind one ambiguous AI button"
              context="a spreadsheet-first accounting tool that wants to add an AI feature letting users ask questions about their own financial data across many linked workbooks."
              state={tfState}
              setState={setTfState}
            />
            <Prose>
              What this section's evidence supports: Notion's AI surfaces were fit deliberately into the existing
              editing, search, and database mental models rather than shipped as one separate chat app, and the
              pricing split between flat-rate Q&A/Chat and metered Custom Agents tracks a real difference in cost
              predictability. What it does not support: independent measurement of whether users actually experience
              "three distinct AI tools" as clearly separated in practice — that framing is Notion's own stated
              intention, documented in its help center, not a result from published user research.
            </Prose>
            <Glossary terms={[
              { term: "Connector", def: "A link Notion sets up to another app, like Slack or Google Drive, so that app's content can also be searched by Notion AI." },
              { term: "Notion credit", def: "A unit of usage Notion charges for when an AI agent does autonomous, multi-step work, instead of charging one flat per-seat price." }
            ]} />
          </section>

          {/* ================= RQ3: COST & LATENCY ================= */}
          <section id="rq3" ref={registerRef("rq3")}>
            <SectionHeading id="rq3">RQ3: Why the Retrieval Bill Set the Pace</SectionHeading>
            <Prose>
              The claim to test here: it was the falling cost of Notion's own retrieval infrastructure, not the
              falling price of frontier language models, that set the pace at which Notion could change what it
              charged for AI.
            </Prose>
            <Prose>
              Unlimited-usage pricing — the original $8–$10-per-seat Q&A add-on — is a bet that the average
              cost per query, across millions of workspaces, stays low enough that flat pricing doesn't lose money on
              heavy users. That bet only gets safer as the true infrastructure cost per query actually falls, which
              makes the sequence of Notion's own infrastructure work the right place to look for what changed.
            </Prose>
            <Prose>
              The documented sequence is specific and dated. In May 2024, Notion migrated its embeddings workload from
              a dedicated, uptime-billed "pod" architecture to a serverless one that decoupled storage from compute
              and billed by usage, cutting cost by 50 percent from peak usage — "several millions of dollars saved
              annually," by Notion's own account (Notion Engineering Blog, 2026). Between May 2024 and January 2025,
              Notion migrated its entire multi-billion-object workload to turbopuffer, cutting search-engine spend a
              further 60 percent, cutting AWS EMR compute costs 35 percent, and improving p50 query latency from
              70–100ms to 50–70ms (same source). In July 2025, the "Page State Project" — hashing each page's
              text and metadata separately so that a small edit only re-embeds the spans that actually changed — cut
              the data volume processed by 70 percent (same source). And an ongoing migration of the embeddings
              pipeline to Ray, begun in July 2025, is showing early results of a 90-percent-plus reduction in
              embeddings infrastructure cost (same source). Four days after that first Page State milestone month,
              in May 2025, Notion announced that unlimited Q&A/Chat would move from a paid add-on into the flat
              $20-per-seat Business plan, explicitly contrasting that price against "$150–300+ per user" for
              buying the same capabilities as separate tools (Notion Blog, "Introducing Notion AI for Work," 2025).
            </Prose>
            <Prose>
              The evidence against a clean, provable causal story is just as real. Notion's own headline claims a 90
              percent total cost reduction over two years — but the individual reported percentages apply to
              different, overlapping cost lines: 60 percent off "search engine spend," 35 percent off "AWS EMR
              compute," 70 percent off "data volume processed," and 90-plus percent off "embeddings infrastructure"
              specifically. These are not four independent slices of one clean total; they overlap and interact in
              ways the public post does not fully reconcile, which means we can be confident that costs fell a great
              deal without being able to independently verify the exact final number from what has been published.
            </Prose>
            <Prose>
              A detail that complicates the simplest version of this story: the May 2025 pricing change did not
              simply pass 100 percent of the savings into a lower flat price. It also introduced Custom Agents on a
              brand-new, separately metered, per-credit pricing model at the same time. Notion did not just get
              cheaper and hand all of that saving back — it also moved its newest, least-predictable AI work onto
              usage-based pricing, a classic pattern of "unlimited for the now-cheap thing, metered for the
              still-expensive thing" running alongside each other in the same announcement.
            </Prose>
            <Prose>
              Everything above is about the offline, indexing side of cost — turning documents into searchable
              embeddings ahead of time. There is a second, separate problem on the online, serving side: every time a
              user actually asks a question, that question itself has to be turned into an embedding in real time,
              before the vector database can even be searched, and that step is on the critical path the user is
              waiting on. Notion's engineering blog describes handling this specifically with Ray Serve, which
              manages GPU allocation, request batching, replication, and autoscaling for that latency-sensitive query
              path (Notion Engineering Blog, 2026) — a genuinely different engineering problem from the batch,
              cost-cutting work described above, even though both run on the same underlying vector-search stack.
            </Prose>

            <ChartFrame title="Notion's vector-search infrastructure cost, indexed to Nov 2023 = 100" sourceNote="FACT points: Nov 2023 baseline, May 2024 (−50% from peak), and Notion's own stated 2-year headline (−90% total). Jan 2025 point is an ESTIMATE derived by applying the stated −60% search-engine-spend reduction to the post-serverless baseline (50 × 0.4 = 20); shown for comparison against the company's own headline figure, not as an independently reported number.">
              <CostIndexChart />
            </ChartFrame>
            <ChartInterpretation
              chartId="chart-cost-index"
              state={chartInterp}
              setState={setChartInterp}
              items={[
                {
                  kind: "Quantitative reasoning",
                  prompt: "Before checking the authored answer: applying a 50% reduction and then a 60% reduction sequentially to a starting index of 100 gives what resulting index value — and how far off is that from Notion's own stated 2-year headline value of 10?",
                  authored: "100 × (1 − 0.50) = 50, then 50 × (1 − 0.60) = 20. That sequential estimate (20) is roughly double Notion's own stated headline (10) — about a 2x gap. The gap does not mean either number is wrong; it means the two are measuring overlapping-but-different things (search-engine spend specifically, versus a broader, blended two-year total that also folds in the Page State and Ray reductions), so they should not be expected to reconcile by simple multiplication."
                },
                {
                  kind: "Causal / comparative",
                  prompt: "Notion attributes its cost curve to specific, dated infrastructure projects (serverless, turbopuffer, Page State, Ray) rather than to falling prices for the underlying model or embeddings APIs it buys from providers. What would have to be true about industry-wide model and embeddings API pricing over this same 2023–2026 window for that attribution to be wrong — that is, for the real driver to be external price deflation rather than Notion's own engineering?",
                  authored: "For the attribution to be wrong, embeddings and completion API prices from Notion's providers would have had to fall by a comparable or larger percentage over the same window, independent of anything Notion built — in which case Notion's infrastructure projects would be riding a cost curve that was going to fall anyway, not causing it. The article's evidence doesn't rule this out directly, which is exactly the gap the T-H question below is built around."
                }
              ]}
            />

            <NumericQuestion
              id="td-rq3-index"
              isFermi={false}
              prompt="Using only the two stated FACT percentages — a 50% cost reduction from the May 2024 serverless migration, applied to a starting index of 100, followed by a 60% reduction from the turbopuffer migration applied to the resulting value — calculate the index value after both reductions are applied in sequence."
              tolerance={0.10}
              unit="index points"
              correctValue={20}
              lowerBound="10 (Notion's own stated 2-year headline — not derivable from these two facts alone)"
              upperBound="50 (if you stop after only the first reduction)"
              sensitiveAssumption="Whether the two percentage reductions apply to the exact same cost base, in sequence — they are reported for related but not identical line items (peak usage vs. search-engine spend), so treating them as strictly sequential multipliers is itself a simplifying assumption."
              decomposition={[
                "Start: index = 100 (Nov 2023 baseline, by convention).",
                "May 2024 serverless migration: −50% → 100 × 0.50 = 50 (FACT: Notion Engineering Blog, 2026).",
                "Jan 2025 turbopuffer migration: −60% on search-engine spend → 50 × 0.40 = 20 (FACT: same source).",
                "Compare to Notion's own stated 2-year headline of a 90% total reduction (index ≈ 10) — the ~2x gap is explored in the chart's quantitative-reasoning prompt above."
              ]}
              state={numericState}
              setState={setNumericState}
              onScore={(id, c) => handleScore(id, c, "Sequential percentage reductions compound multiplicatively, not additively — and stacked reductions on overlapping-but-distinct cost bases should not be expected to reconcile exactly with a separately reported headline figure.")}
            />

            <ChartFrame title="p50 query latency, before and after the turbopuffer migration" sourceNote="Source: Notion Engineering Blog, “Two years of vector search at Notion,” 2026.">
              <LatencyChart />
            </ChartFrame>
            <ChartInterpretation
              chartId="chart-latency"
              state={chartInterp}
              setState={setChartInterp}
              items={[
                {
                  kind: "Quantitative reasoning",
                  prompt: "The midpoint of the 'before' range (70–100ms) is 85ms, and the midpoint of the 'after' range (50–70ms) is 60ms. What percentage improvement in typical (p50) query latency does that midpoint comparison represent?",
                  authored: "(85 − 60) / 85 ≈ 29%. A meaningful, but not dramatic, latency improvement — notably smaller than the 60% cost reduction reported for the same migration. That gap between a large cost improvement and a more modest latency improvement is itself informative: the turbopuffer migration was primarily a cost and architecture-simplification project, with latency as a welcome secondary benefit, not the primary target."
                },
                {
                  kind: "So-what / decision implication (prioritization)",
                  prompt: "Given that the same migration produced a large cost improvement (60%) but a comparatively modest latency improvement (about 29% at the midpoint), how would you, using a framework like RICE or Now-Next-Later, prioritize a follow-up project aimed specifically at cutting p50 latency further, relative to further cost-cutting work?",
                  authored: "Cost-cutting on this stack has already shown it can produce large (50–60%) gains from architecture changes, while latency gains from the same changes have been smaller (around 29%) — which suggests latency needs its own dedicated project (like the Ray Serve query-time embedding work described in this section) rather than being treated as a side effect of the next cost initiative. A RICE-style prioritization would likely rank a dedicated latency project as Next rather than Now if current latency (50–70ms) is already acceptable to users, and rank it as Now if user research shows latency, not cost, is the active complaint."
                }
              ]}
            />

            <MCQCard
              id="mcq-rq3-latency-trend"
              kindLabel="Technical Trend Reasoning (T-B)"
              prompt="The turbopuffer migration cut search-engine spend by 60% but improved typical (p50) query latency by only around 29% at the midpoint of the reported ranges. A teammate argues: 'since this migration cut costs so much, it must have made the system proportionally just as much faster.' What is the strongest reason not to draw that conclusion from this chart?"
              options={[
                {
                  text: "The latency figures here must simply be measured incorrectly, since a 60% cost cut of this size should always produce a similarly large, proportional latency improvement.",
                  correct: false,
                  errorTag: "confusing a metric for its cause",
                  errorDetail: "This assumes cost and latency must move together without evidence for that link, then blames the measurement rather than questioning the assumption.",
                  scaffold: "Ask whether the article gives any reason to expect cost and latency to move by the same percentage, or whether they are described as driven by different mechanisms."
                },
                {
                  text: "Latency didn't improve nearly as much because Notion likely prioritized migrating its largest, highest-paying customers' workspaces first, leaving smaller workspaces comparatively slower for longer.",
                  correct: false,
                  errorTag: "single-cause fallacy",
                  errorDetail: "This invents an unstated segmentation reason the article never mentions, rather than using the mechanism the article actually describes (different levers for cost versus latency).",
                  scaffold: "Check whether the article provides any evidence of a customer-size-based rollout order, or whether a simpler, already-stated mechanism explains the gap."
                },
                {
                  text: "The 29% latency improvement is actually the mathematically larger number once you properly account for the fact that latency here is measured in raw milliseconds rather than in percentages.",
                  correct: false,
                  errorTag: "confusing rate and level",
                  errorDetail: "This treats a unit conversion (milliseconds vs. percent) as if it changes which percentage is larger, which is not a meaningful comparison — 29% and 60% are already both percentages of their own baselines.",
                  scaffold: "Check whether converting units actually changes the size of a percentage figure, or whether the two percentages are already on comparable footing."
                },
                {
                  text: "Cost fell because storage and compute became decoupled and billed by usage; latency depends on separate factors like network hops and query-time computation that the same migration barely touched.",
                  correct: true,
                  transferNote: "this generalizes to any infrastructure migration — a cost improvement and a latency improvement from the same project are driven by different mechanisms and are not guaranteed to move by the same magnitude.",
                  fullExplain: "Serverless and object-storage-based migrations primarily change how you are billed and how storage is provisioned, which is why they can produce large cost swings; latency is governed by a different set of factors (network round-trips, ranking computation, query-time embedding), so the same migration touches it only partly. Expecting the two to move in lockstep assumes one underlying cause when there are really two separate ones."
                }
              ]}
              state={mcqState}
              setState={setMcqState}
              onScore={(id, c) => handleScore(id, c, "A large cost improvement and a smaller latency improvement from the same migration usually mean the two outcomes are governed by different mechanisms, not that one measurement is wrong.")}
            />

            <MCQCard
              id="mcq-rq3-weaken"
              kindLabel="Critical Reasoning (T-H)"
              subForm="Weaken"
              prompt="Notion argues, implicitly, that its own two years of vector-search infrastructure work — not model or embeddings API price deflation — is what let it move Q&A from a paid add-on to unlimited use inside a bundled plan. Which new piece of evidence, if true, would most weaken that claim?"
              options={[
                {
                  text: "Independent data showing that OpenAI's and Anthropic's own API prices fell by a comparable or larger percentage over this same window, for reasons unrelated to anything Notion itself built.",
                  correct: true,
                  transferNote: "this generalizes to any 'we made it cheaper' claim — always check whether an external, industry-wide cost curve could explain the same result without crediting the company's own engineering.",
                  fullExplain: "If the underlying API prices Notion pays fell by a similar magnitude independent of Notion's own projects, then Notion's infrastructure work would be riding a cost curve that was falling anyway — correlated with, but not necessarily the cause of, the pricing change. That is genuinely new information outside the article's stated evidence, and it directly targets the causal claim rather than a side detail."
                },
                {
                  text: "Notion also added several new connectors, including Slack, Google Drive, and GitHub, to Enterprise Search around the same time as the pricing change.",
                  correct: false,
                  errorTag: "irrelevant to the specific causal claim",
                  errorDetail: "Adding connectors is a feature-scope decision, not evidence about whether infrastructure cost or model-price deflation drove the pricing change — it doesn't move confidence in either direction on the cost-attribution question.",
                  scaffold: "Ask whether this new fact is actually about the cost driver in question, or about a different decision (feature scope) entirely."
                },
                {
                  text: "Notion's own engineering blog already states that costs fell roughly 90 percent over two years and names four specific internal projects that drove it.",
                  correct: false,
                  errorTag: "restating the conclusion rather than testing it",
                  errorDetail: "This is simply the article's existing evidence restated, not new information — a genuine weaken option has to introduce something outside what has already been presented.",
                  scaffold: "Check whether this option adds any information you did not already have from the article, or whether it just repeats what you already read."
                },
                {
                  text: "Notion's total user base also grew from roughly 30 million to over 100 million in this same period, spreading fixed infrastructure costs across many more users.",
                  correct: false,
                  errorTag: "confusing a metric for its cause",
                  errorDetail: "Amortizing fixed costs across more users could lower cost-per-user without any actual infrastructure engineering, which is a real alternative mechanism worth naming — but the article's cited cost reductions (50%, 60%, 90%+) are reported as line-item infrastructure cost reductions, not simply per-user cost dilution from growth, so this option does not by itself weaken the specific documented projects.",
                  scaffold: "Notice that this option is close to a real alternative explanation, but check exactly what kind of cost the article's cited percentages describe before assuming this fully accounts for them."
                }
              ]}
              state={mcqState}
              setState={setMcqState}
              onScore={(id, c) => handleScore(id, c, "A causal claim about a company's own engineering work should be checked against industry-wide price trends that could produce the same outcome independent of that work.")}
            />

            <PrincipleGate sectionId="principle-rq3" state={principleState} setState={setPrincipleState} />
            <PatternTransferQuestion
              id="tf-rq3"
              principle="unlimited-usage pricing is a bet on the infrastructure team's cost curve, not just on the current model's price sheet, and that bet only gets safer once the true cost per use has actually fallen, not merely once a competitor forces the pricing decision"
              context="a customer-support software company deciding whether to offer an AI ticket-summarization feature as unlimited-use or as a metered add-on."
              state={tfState}
              setState={setTfState}
            />
            <Prose>
              What the evidence in this section supports: Notion's documented infrastructure timeline lines up, in
              order, with the moments its AI pricing changed, and the underlying mechanisms (serverless compute,
              object-storage-based vector search, avoiding redundant re-embedding, self-hosted embedding models) are
              each independently plausible cost levers. What it does not support: an independently verified, precise
              total cost-per-query figure, or proof that industry-wide model-price deflation played no role at all
              alongside Notion's own engineering.
            </Prose>
            <Glossary terms={[
              { term: "p50 latency", def: "The ‘typical’ response time: half of all requests finish faster than this number, half finish slower." },
              { term: "Serverless (compute)", def: "A way of running software where you pay only for what you actually use, instead of paying to keep a fixed set of machines running all the time." },
              { term: "Object storage", def: "Cheap, virtually unlimited storage built for holding huge numbers of files, rather than for constant, very fast reads and writes." },
              { term: "xxHash", def: "A very fast method for turning a piece of text into a short fingerprint, used here to detect whether that exact text changed since it was last processed." }
            ]} />
          </section>

          {/* ================= WHAT BROKE ================= */}
          <section id="whatbroke" ref={registerRef("whatbroke")} className="what-broke-section">
            <SectionHeading id="whatbroke">What Broke</SectionHeading>
            <Prose>
              One month after Notion publicly launched Q&A in November 2023, the original vector-search indexes were
              already running low on room. If they had filled completely, Notion would have had to pause onboarding
              new workspaces off the waitlist it had just built — freezing the rollout of the exact feature Notion
              had just spent its launch announcement promoting. Notion's own engineering account of this period is
              unusually candid: "Just one month after launch, our original indexes were close to capacity. If we ran
              out of space, we'd be forced to pause onboarding — slowing the rollout of our AI features and delaying
              value for new users" (Notion Engineering Blog, 2026).
            </Prose>
            <Prose>
              Why it happened: the original sharding design mirrored Notion's existing Postgres approach — workspace
              ID as the partition key, range-based routing to a fixed set of shards — a pattern that had worked for
              Notion's core database for years (Notion Engineering Blog, 2026). But the vector-database provider
              Notion had chosen billed for uptime, not usage, which made the two standard fixes both bad options: (1)
              re-shard incrementally every couple of weeks, which meant constant, disruptive migrations, or (2)
              re-shard to the final expected volume up front, which the team's own account calls "prohibitively
              expensive" given uptime billing. The team's actual fix — provisioning a new index "generation" whenever
              a set neared capacity, and routing new workspaces to the newest generation — was a genuine
              improvisation, not part of the original plan.
            </Prose>
            <Prose>
              The mitigation cost real time and real complexity. The generation-based patch bought Notion roughly six
              months of runway, from the November 2023 launch until the May 2024 serverless migration. That
              migration alone was worth a 50 percent cost cut from peak usage — "several millions of dollars" a year,
              by Notion's own account — but it also functioned as a cleanup: the serverless move directly removed
              the storage-capacity ceiling that had forced the generation hack into existence in the first place
              (Notion Engineering Blog, 2026). Months later, when Notion migrated again to turbopuffer, part of the
              explicit motivation was to simplify a scheme that no longer needed sharding or generation routing at
              all, because turbopuffer treats each namespace as its own independent index (same source) — meaning the
              operational debt from the original capacity crisis was still being paid down more than a year after the
              initial fix.
            </Prose>
            <Prose>
              The lesson is not "don't build a vector-search system" or "choose a different database on day one." It
              is that the team's own sharding intuition, carried over from years of running Postgres at a certain cost
              model, quietly assumed a billing structure (pay for what's provisioned) that did not match the new
              database's actual cost model (pay for what's live). An architecture pattern that is "obviously correct"
              on one system does not automatically transfer to a new system with different economics — and the place
              that gap shows up first is capacity planning, not accuracy or latency.
            </Prose>

            <ChartFrame title="The one-month capacity near-miss, Nov 2023 – May 2024" sourceNote="Source: Notion Engineering Blog, “Two years of vector search at Notion,” 2026.">
              <IncidentTimeline />
            </ChartFrame>
            <ChartInterpretation
              chartId="chart-incident"
              state={chartInterp}
              setState={setChartInterp}
              items={[
                {
                  kind: "Qualitative / mechanism",
                  prompt: "The stopgap fix (new index generations) was adopted specifically because the vector database billed for uptime rather than usage. If the provider had instead billed purely by data volume stored, would the same 'over-provision now vs. re-shard repeatedly' dilemma have applied in the same way?",
                  authored: "No — the core problem was that uptime billing punished holding unused capacity in reserve, which is exactly what over-provisioning to final expected volume would have required. Under pure usage-based (by-volume) billing, over-provisioning ahead of need would cost little until that capacity was actually filled, removing most of the pressure that made incremental re-sharding or the generation hack necessary in the first place. This is exactly why the later serverless migration — which decoupled storage from compute and billed by usage — removed the bottleneck directly."
                },
                {
                  kind: "Causal / comparative",
                  prompt: "The generation-based fix and the later serverless migration both reduced operational risk, but only one of them was described as needing to be 'simplified away' during the subsequent turbopuffer migration. What does that tell you about the difference between a fix that resolves the underlying constraint versus one that only works around it?",
                  authored: "The generation-based fix worked around the uptime-billing constraint without removing it — it added a new dimension of complexity (which generation does this workspace belong to?) rather than changing the underlying cost structure, which is exactly why it later needed to be ‘simplified away.’ The serverless migration, by contrast, removed the constraint itself (decoupling storage from compute, billing by usage), which is why it did not need a later cleanup project in the same way. A workaround and a fix can look similar in the moment; only one of them stops generating debt."
                }
              ]}
            />

            <MCQCard
              id="mcq-whatbroke-failure"
              kindLabel="Failure Case Question"
              prompt="Given the near-miss described above, which assumption was most likely held by the original team as uncontroversial — and why was it wrong?"
              options={[
                {
                  text: "That the embeddings generated by the model chosen at launch would remain just as accurate as more data kept being added to the workspace.",
                  correct: false,
                  errorTag: "scope creep misdiagnosis",
                  errorDetail: "The documented incident was about running out of storage capacity, not about embedding accuracy degrading — this option addresses a plausible-sounding but different failure mode than the one that actually occurred.",
                  scaffold: "Re-read what specifically ran low: was it retrieval quality, or physical/billed capacity in the index?"
                },
                {
                  text: "That user demand for Q&A would stay modest enough that a slow, careful, fully-planned rollout would still be entirely possible.",
                  correct: false,
                  errorTag: "hindsight bias",
                  errorDetail: "This looks obvious only after seeing the millions-of-workspaces waitlist; at the time, a large launch response for a widely anticipated feature was a plausible outcome, not a hidden risk the team ignored — the actual failure was in the cost-model mismatch, not in failing to predict demand.",
                  scaffold: "Ask whether the team's actual documented response (building a stopgap fix quickly) suggests they were surprised by demand itself, or by how expensive it was to serve that demand under their chosen billing model."
                },
                {
                  text: "That the vector database's billing worked the same way Postgres billing did, so the same sharding pattern could be reused without re-checking cost assumptions.",
                  correct: true,
                  transferNote: "this generalizes to any migration between systems with different cost models: an architecture pattern proven on one system's economics needs to be re-validated against a new system's economics, not just its technical API.",
                  fullExplain: "The team explicitly designed sharding 'similar to our Postgres setup,' which was a reasonable, low-risk choice on the technical merits — but it silently carried over a cost assumption (that headroom is cheap to hold) that did not apply once the new database's uptime-based billing was factored in. That mismatch, not a technical flaw in the sharding logic itself, is what created the capacity crisis."
                },
                {
                  text: "That one single engineer's mistake in the sharding code, rather than any structural billing mismatch, actually caused this near-miss.",
                  correct: false,
                  errorTag: "single-cause fallacy",
                  errorDetail: "The account describes a structural mismatch between a sharding pattern and a new billing model, not an isolated coding error — attributing a systemic capacity-planning issue to one person's mistake misdiagnoses the root cause.",
                  scaffold: "Check whether the source describes an individual error, or a pattern-level assumption that the whole team reasonably held."
                }
              ]}
              state={mcqState}
              setState={setMcqState}
              onScore={(id, c) => handleScore(id, c, "An architecture pattern proven on one system's cost model must be re-validated against a new system's cost model, not just its API.")}
            />
            <Glossary terms={[]} />
          </section>

          {/* ================= LEARNING SUMMARY ================= */}
          <section id="learningsummary" ref={registerRef("learningsummary")}>
            <SectionHeading id="learningsummary">Learning Summary</SectionHeading>
            <LearningSummaryBody
              score={score}
              scoredIds={scoredIds}
              missedPrinciples={missedPrinciples}
              principleState={principleState}
              insightSlotText={insightSlotText}
              setInsightSlotText={setInsightSlotText}
              insightRevealed={insightRevealed}
              setInsightRevealed={setInsightRevealed}
              applyItPresent={applyItPresent}
              setApplyItPresent={setApplyItPresent}
              applyIt2027={applyIt2027}
              setApplyIt2027={setApplyIt2027}
              warmUpSkipped={warmUpSkipped}
              tfState={tfState}
              setTfState={setTfState}
            />
          </section>

          {/* ================= CONCLUSION ================= */}
          <section id="conclusion" ref={registerRef("conclusion")}>
            <SectionHeading id="conclusion">Conclusion</SectionHeading>
            <Prose>
              The governing principle mostly held up under its own evidence: Notion's numbers tie specific
              infrastructure milestones — the serverless migration, the turbopuffer migration, the Page State
              Project, the Ray migration — directly to the moments its AI pricing actually changed, and the
              near-miss one month after launch shows how real the underlying capacity constraint was. Partial failure
              of this principle looks like a company cutting infrastructure cost by 90 percent and changing nothing
              about its pricing anyway, because the real constraint on price was never cost at all — it was
              competitive pressure, a sales strategy, or a bundling decision made on its own timeline, independent of
              the engineering calendar. Notion's own case plausibly shows both forces at once: the May 2025 change is
              dated right after multiple documented cost cuts, but it also arrived alongside heavy competitive
              pressure from Microsoft and Google bundling AI into their own suites, and alongside a brand-new,
              separately metered surface (Custom Agents) launching in the same announcement — so falling cost is a
              necessary part of the explanation, but the evidence here does not prove it was sufficient on its own.
            </Prose>
            <Prose>
              For an AI product manager, the transferable habit is to ask, before promising any pricing model, what
              one query actually costs today on the current infrastructure — and what would have to change
              architecturally, not just which model gets called, to make that number fall by an order of magnitude.
              Unlimited-usage pricing is a bet on the infrastructure team's roadmap, not simply a reflection of the
              current model provider's price sheet.
            </Prose>
            <Prose>
              For a future CTO, the Notion case is a reminder that a sharding pattern proven on one kind of database,
              under one billing model, is not free intuition to carry over onto a new kind of database with a
              different billing model — the "obviously right" architecture choice needs to be re-checked against the
              new system's actual cost structure, not carried over from institutional habit. It is also a reminder
              that infrastructure migrations of this kind are rarely a single project: each one here (serverless,
              then turbopuffer, then Page State, then Ray) paid down debt that the previous one had created or
              exposed, in sequence, over roughly two years.
            </Prose>
            <Prose>
              What the public record does not answer is whether Notion's internal cost-per-query ever actually
              reached the precise level implied by its own "90 percent over two years" headline, or whether that
              figure blends several measures that do not strictly compound. That gap matters beyond curiosity:
              a PM copying this playbook at another company needs the real, reconciled number, not the headline one,
              before making the same promise to a CFO.
            </Prose>
            <TEQuestion state={teState} setState={setTeState} />
          </section>

          <SourcesList />

        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   SOURCES LIST
   -------------------------------------------------------------------------- */
const SOURCES = [
  { name: "Introducing Notion AI", url: "https://www.notion.com/blog/introducing-notion-ai", tier: "Tier 1 — company blog", used: "Nov 2022 private alpha launch, original writing-assistant scope." },
  { name: "Introducing Q&A: get instant answers to your questions from Notion AI", url: "https://www.notion.com/blog/introducing-q-and-a", tier: "Tier 1 — company blog", used: "Nov 2023 Q&A beta launch, access points, add-on pricing, model-provider partnership, permission scoping." },
  { name: "Understanding how Q&A finds answers can help you get better results", url: "https://www.notion.com/help/guides/understanding-how-q-and-a-finds-answers-can-help-you-get-better-results", tier: "Tier 1 — company help center", used: "Q&A retrieval-ranking steps and stated limitations (databases, outside knowledge)." },
  { name: "Notion AI security & privacy practices", url: "https://www.notion.com/help/notion-ai-security-practices", tier: "Tier 1 — company help center", used: "Two-phase RAG architecture, data retention and training-use policy, permission enforcement." },
  { name: "Two years of vector search at Notion: 10x scale, 1/10th cost", url: "https://www.notion.com/blog/two-years-of-vector-search-at-notion", tier: "Tier 1 — company engineering blog", used: "Launch architecture, capacity near-miss, onboarding scaling, serverless migration, turbopuffer migration, Page State Project, Ray/Anyscale migration, all cost and latency figures." },
  { name: "Introducing Notion AI for Work", url: "https://www.notion.com/blog/notion-ai-for-work", tier: "Tier 1 — company blog", used: "May 2025 relaunch: AI Meeting Notes, Enterprise Search, Research Mode, model picker, all-in-one $20/seat pricing." },
  { name: "Notion 2.51 release notes (May 13, 2025)", url: "https://www.notion.com/releases/2025-05-13", tier: "Tier 1 — company release notes", used: "Confirms May 13, 2025 date and scope of the AI-for-Work relaunch and pricing consolidation." },
  { name: "Notion Pricing Plans", url: "https://www.notion.com/pricing", tier: "Tier 1 — company pricing page (live)", used: "Current plan structure, Business-plan AI bundling, Custom Agents metered credit pricing." },
  { name: "100 Million of You", url: "https://www.notion.com/blog/100-million-of-you", tier: "Tier 1 — company blog", used: "100-million-user milestone, reached August 2024." },
  { name: "Notion rides AI boom to $500 million in annual revenue", url: "https://www.cnbc.com/2025/09/18/notion-launches-ai-agent-as-it-crosses-500-million-in-annual-revenue.html", tier: "Tier 4 — industry/business press", used: "2025 annual revenue figure and growth context." },
  { name: "Notion bets big on integrated LLMs, adds GPT-4.1 and Claude 3.7 to platform", url: "https://venturebeat.com/ai/notion-bets-big-on-integrated-llms-adds-gpt-4-1-and-claude-3-7-to-platform", tier: "Tier 2 — trade press", used: "Model-picker launch context and Notion AI Engineering Lead quote on latency and fine-tuning." }
];

function SourcesList() {
  return (
    <div className="ls-block" style={{ marginTop: 40 }}>
      <div className="ls-title">Sources &amp; Citations</div>
      {SOURCES.map((s, i) => (
        <div key={i} className="reader-answer">
          <strong>{s.name}</strong> — <a href={s.url} target="_blank" rel="noreferrer">{s.url}</a><br />
          <span style={{ color: "#6b7280" }}>{s.tier}. Used for: {s.used}</span>
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------------------
   T-E FORWARD-LOOKING QUESTION (Conclusion)
   -------------------------------------------------------------------------- */
function TEQuestion({ state, setState }) {
  const [present, setPresent] = useState(state.present || "");
  const [future, setFuture] = useState(state.future || "");

  function submit() {
    if (present.trim().length < 40 || future.trim().length < 40) return;
    setState({ present, future, submitted: true });
  }

  return (
    <div className="question-card te-card">
      <div className="q-label">Forward-Looking Implication (T-E)</div>
      <div className="q-prompt">
        <strong>Present-day:</strong> Given what this article's evidence shows, what is the single most important
        decision a PM or CTO at a similar AI-native document product should make in the next six months about how
        it prices AI usage?
      </div>
      {!state.submitted && (
        <textarea className="text-input" rows={2} placeholder="Present-day answer (min. 40 characters)..." value={present} onChange={e => setPresent(e.target.value)} />
      )}
      <div className="q-prompt" style={{ marginTop: 12 }}>
        <strong>2027 variant:</strong> Assuming foundation models keep getting longer context windows, cheaper
        inference, and better reasoning, what would you design or decide differently under the same business
        constraints — and which load-bearing assumption from this article's evidence would the 2027 version
        replace? What single observation would most falsify this article's governing principle?
      </div>
      {!state.submitted && (
        <>
          <textarea className="text-input" rows={3} placeholder="2027 variant + falsification (min. 40 characters)..." value={future} onChange={e => setFuture(e.target.value)} />
          <button className="btn btn-small" disabled={present.trim().length < 40 || future.trim().length < 40} onClick={submit}>Submit</button>
        </>
      )}
      {state.submitted && (
        <div className="explanation-box">
          <div className="reader-answer"><strong>Present-day:</strong> {state.present}</div>
          <div className="reader-answer"><strong>2027 + falsification:</strong> {state.future}</div>
          <div className="full-explanation">
            One authored view: as inference gets cheaper and context windows grow, the retrieval step this article
            treats as the hard constraint gets easier to brute-force (sending more raw context instead of ranking
            carefully) — which would replace the load-bearing assumption that retrieval quality, not model
            capability, is the binding constraint. The single observation that would most falsify this article's
            governing principle: a company matching Notion's pricing move (flat, unlimited AI) without any
            documented infrastructure cost reduction at all — that would show pricing can move on schedule for
            reasons entirely disconnected from the retrieval cost curve this article traces.
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
   LEARNING SUMMARY BODY
   -------------------------------------------------------------------------- */
function LearningSummaryBody({ score, scoredIds, missedPrinciples, principleState, insightSlotText,
  setInsightSlotText, insightRevealed, setInsightRevealed, applyItPresent, setApplyItPresent,
  applyIt2027, setApplyIt2027, warmUpSkipped, tfState, setTfState }) {

  const total = Object.keys(scoredIds).length;

  return (
    <div className="learning-summary">
      <div className="ls-block">
        <div className="ls-title">Score breakdown</div>
        <p className="prose">
          You answered {total} scored question{total === 1 ? "" : "s"} and got {score} correct.
          {warmUpSkipped && <span> Warm-up skipped — 3 prior principles not reviewed this session.</span>}
        </p>
        {missedPrinciples.length > 0 && (
          <div className="missed-list">
            <div className="ls-subtitle">Principles to revisit (from missed questions):</div>
            <ul>{missedPrinciples.map((m, i) => <li key={i}>{m}</li>)}</ul>
          </div>
        )}
      </div>

      <div className="ls-block">
        <div className="ls-title">Principle production review</div>
        <p className="prose">Your submissions from each section's "principle in one sentence" prompt:</p>
        {["principle-rq1", "principle-rq2", "principle-rq3"].map(id => (
          <div key={id} className="reader-answer">
            <strong>{id}:</strong> {principleState[id] && principleState[id].text ? principleState[id].text : "(not yet submitted — visit that section)"}
          </div>
        ))}
        <p className="prose">Which of your stated principles surprised you most when compared to the authored version, and why?</p>
      </div>

      <div className="ls-block">
        <div className="ls-title">Three insight slots</div>
        <p className="prose">You have seen several pieces of evidence in this article. Write the single most non-obvious insight you would defend to a skeptical CTO, before seeing the authored takeaways.</p>
        {!insightRevealed && (
          <div className="interp-input-row">
            <textarea className="text-input" rows={2} value={insightSlotText} onChange={e => setInsightSlotText(e.target.value)} placeholder="Min. 20 characters..." />
            <button className="btn btn-small" disabled={insightSlotText.trim().length < 20} onClick={() => setInsightRevealed(true)}>Reveal authored insights</button>
          </div>
        )}
        {insightRevealed && (
          <div className="explanation-box">
            <div className="reader-answer"><strong>Your insight:</strong> {insightSlotText}</div>
            <div className="ls-subtitle">How your insight compares — three authored takeaways:</div>
            <ul>
              <li>Permission-checking has to live in retrieval, before generation, because a language model cannot un-know what it has already read.</li>
              <li>Stacked percentage cost reductions on overlapping cost lines rarely compound to exactly the headline number a company reports — check the arithmetic before repeating the claim.</li>
              <li>An architecture pattern proven under one system's billing model (pay for what's provisioned) is not free intuition under a new system's billing model (pay for what's live).</li>
            </ul>
          </div>
        )}
      </div>

      <div className="ls-block">
        <div className="ls-title">Apply It — present-day variant</div>
        <ApplyItPresent state={applyItPresent} setState={setApplyItPresent} />
      </div>

      <div className="ls-block">
        <div className="ls-title">Apply It — 2027 forward-looking variant</div>
        <ApplyIt2027 state={applyIt2027} setState={setApplyIt2027} />
      </div>

      <div className="ls-block">
        <div className="ls-title">One last transfer</div>
        <PatternTransferQuestion
          id="tf-final-transfer"
          principle="the architecture and cost curve of retrieval infrastructure — not the language model on top — decide what an AI feature can promise and what it can charge, and that infrastructure cost curve has to be measured, not assumed, before a pricing commitment is made"
          context="a regional hospital network building an internal tool that lets clinicians and administrators ask natural-language questions across patient charts, internal care-team notes, and billing records."
          state={tfState}
          setState={setTfState}
        />
      </div>
    </div>
  );
}

function ApplyItPresent({ state, setState }) {
  const [thesis, setThesis] = useState(state.thesis || "");
  const [assumption, setAssumption] = useState(state.assumption || "");
  const [disconfirm, setDisconfirm] = useState(state.disconfirm || "");
  const [premortem, setPremortem] = useState(state.premortem || "");

  function submit() {
    if ([thesis, assumption, disconfirm, premortem].some(t => t.trim().length < 15)) return;
    setState({ thesis, assumption, disconfirm, premortem, submitted: true });
  }

  if (state.submitted) {
    return (
      <div className="explanation-box">
        <div className="reader-answer"><strong>So-what thesis:</strong> {state.thesis}</div>
        <div className="reader-answer"><strong>Load-bearing assumption:</strong> {state.assumption}</div>
        <div className="reader-answer"><strong>Strongest disconfirming evidence:</strong> {state.disconfirm}</div>
        <div className="reader-answer"><strong>Pre-mortem:</strong> {state.premortem}</div>
      </div>
    );
  }

  return (
    <div className="apply-it-form">
      <p className="prose">Apply the governing principle to a company or product you know. Fill in all four parts:</p>
      <label className="field-label">One-sentence so-what thesis</label>
      <textarea className="text-input" rows={2} value={thesis} onChange={e => setThesis(e.target.value)} />
      <label className="field-label">Load-bearing assumption</label>
      <textarea className="text-input" rows={2} value={assumption} onChange={e => setAssumption(e.target.value)} />
      <label className="field-label">Strongest disconfirming evidence from this article</label>
      <textarea className="text-input" rows={2} value={disconfirm} onChange={e => setDisconfirm(e.target.value)} />
      <label className="field-label">Pre-mortem: "If this fails in 12 months, the most likely reason is ___."</label>
      <textarea className="text-input" rows={2} value={premortem} onChange={e => setPremortem(e.target.value)} />
      <button className="btn btn-small" onClick={submit}>Submit</button>
    </div>
  );
}

function ApplyIt2027({ state, setState }) {
  const [text, setText] = useState(state.text || "");
  function submit() {
    if (text.trim().length < 40) return;
    setState({ text, submitted: true });
  }
  if (state.submitted) {
    return <div className="explanation-box"><div className="reader-answer">{state.text}</div></div>;
  }
  return (
    <div className="apply-it-form">
      <p className="prose">
        Given the same business constraints and user problem, but assuming foundation model capabilities have
        improved (longer context, cheaper inference, better reasoning), what would you design or decide differently?
        What load-bearing assumption does the 2027 version replace?
      </p>
      <textarea className="text-input" rows={3} value={text} onChange={e => setText(e.target.value)} />
      <button className="btn btn-small" disabled={text.trim().length < 40} onClick={submit}>Submit</button>
    </div>
  );
}

/* --------------------------------------------------------------------------
   RENDER
   -------------------------------------------------------------------------- */
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
