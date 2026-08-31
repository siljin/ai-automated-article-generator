const { useState, useEffect, useRef } = React;
const {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, Cell
} = Recharts;

/* ============================== DATA ============================== */

const SECTIONS = [
  { id: "intro", label: "Introduction" },
  { id: "landscape", label: "Landscape" },
  { id: "evidence1", label: "RQ1 — Architecture" },
  { id: "evidence2", label: "RQ2 — Reliability" },
  { id: "evidence3", label: "RQ3 — Evaluation" },
  { id: "whatbroke", label: "What Broke" },
  { id: "summary", label: "Learning Summary" },
  { id: "conclusion", label: "Conclusion" },
];

const WARMUP_QUESTIONS = [
  {
    prompt: "A media company wants to launch a customer-facing agent that can automatically approve refund requests up to $50, with no human review step at all, reasoning that refunds are low-value enough that mistakes will be cheap to absorb. Using a prior article's principle about reliability engineering for autonomous, customer-facing agents, what should this company build first, before removing any human gate, and why might \"the dollar amount is small\" not be the right way to judge whether the risk is actually low?",
    sourceArticle: "Shared Foundation, Not a Smarter Model: How Cox Automotive Took 17 AI Agents to Production in a Year (Agentic System Architecture)",
    principle: "Reliability for an autonomous, customer-facing agent is a five-layer engineering discipline — hard guardrails, soft guardrails, scheduled red-teaming, automated evaluation, and hard circuit breakers — built before scale, not added right before launch. Dollar amount measures one dimension of risk (financial loss per incident); it says nothing about frequency, fraud incentive, or reputational cost, which is why Cox built the full five-layer stack rather than gating only on transaction size.",
  },
  {
    prompt: "A logistics company's dispatch agent has a 98% task-completion rate on its dashboard. Using a prior article's principle about grading agents on more than the final outcome, what should the company check before treating that 98% figure as evidence the agent is working well, and what kind of failure could a high completion rate be hiding?",
    sourceArticle: "Grading the Task Isn't Enough: Amazon's Three-Layer Answer to Why Agents Fail (Agentic System Architecture)",
    principle: "Production-grade reliability comes from separately instrumenting each way a system can fail — intent detection, tool selection, tool parameters, response format — not from one blended success/fail score. A 98% completion rate can hide agents that got the right final answer by luck, after a wrong tool call or a misread parameter that happened not to matter this time.",
  },
  {
    prompt: "A design agency's AI agent has started producing work that copies whatever pattern already exists in its shared template library, good or bad, faster than any human reviewer can check it. Using a prior article's principle, is this the kind of problem solved by giving the agent a new tool or capability, or is it a different kind of problem — and what approach would actually address it?",
    sourceArticle: "Harness Engineering: How OpenAI's Codex Team Shipped a Product With Zero Manually-Written Code (Agentic System Architecture)",
    principle: "Two different reliability failure modes need two different fixes: an under-specified environment (a missing tool or capability) is solved by building that capability once, while entropy — an agent faithfully replicating whatever patterns, good or bad, already exist — is a compounding failure that manual review cannot keep pace with, and instead needs mechanically encoded \"golden principles\" plus a recurring, automated cleanup process.",
  },
];

const GOVERNING_PRINCIPLE = "Production agents that lasted through 2024 fenced off only a narrow, genuinely novel-judgment slice of a workflow for a language model, kept everything else deterministic, checked against outside ground truth, or gated by evaluation, and treated that boundary as something that needs active maintenance rather than a one-time decision made during scoping.";

/* Per-page glossary content */
const GLOSSARY = {
  intro: [
    ["LangGraph", "an open-source framework from LangChain for building AI agents as an explicit, developer-defined graph of steps, instead of one open-ended loop."],
    ["Cognitive architecture", "the flow of code, prompts, and model calls that decides what a system does next, given a user's input."],
    ["AutoGPT", "an early, largely unconstrained autonomous-agent project from 2023 that let a language model set and pursue its own goals with few guardrails."],
  ],
  landscape: [
    ["State machine", "a system that moves between a fixed set of named steps, where a model can pick the next step but cannot invent a step outside that fixed set."],
    ["LangSmith", "LangChain's companion tool for recording and inspecting every model call and tool call an agent makes, so a human can debug it after the fact."],
    ["Chain", "a fixed, pre-written sequence of prompts and tool calls with no branching decided by the model at run time."],
  ],
  evidence1: [
    ["AST (Abstract Syntax Tree)", "a structured, tree-shaped representation of source code that a program can safely analyze or rewrite without a language model touching the code directly."],
    ["EBR (Embedding-Based Retrieval)", "finding relevant items by comparing numeric representations of meaning, rather than matching exact keywords."],
  ],
  evidence2: [
    ["Self-correction agent", "a step that takes a system's own error message and automatically tries to fix the mistake before showing anything to a user."],
    ["Hallucination", "when a model produces a confident-sounding answer that is factually wrong or refers to something that does not exist."],
    ["Human-in-the-loop", "a design where a person can step in mid-task and correct or redirect an agent's action."],
  ],
  evidence3: [
    ["LLM-as-judge", "using one language model to grade the output of another system, instead of, or alongside, a human reviewer."],
    ["Recall", "the share of correct or relevant items a system actually finds, out of every one that truly exists."],
    ["CI (Continuous Integration)", "an automated pipeline that runs tests, and here evaluations, every time code changes, before the change is allowed to merge."],
  ],
  whatbroke: [
    ["MVP (Minimum Viable Product)", "the smallest working version of a product built to prove an idea, not yet ready for full production use."],
    ["PR velocity", "how quickly a pull request, a proposed code change, moves from submission to being merged."],
  ],
};

/* ============================== GENERIC UI ============================== */

function Glossary({ pageId }) {
  const terms = GLOSSARY[pageId];
  if (!terms || terms.length === 0) return null;
  return (
    <div className="glossary">
      <div className="glossary-label">Glossary</div>
      {terms.map(([term, def], i) => (
        <div className="glossary-entry" key={i}><strong>{term}</strong> — {def}</div>
      ))}
    </div>
  );
}

function PrincipleGate({ id, sectionName, authored, state, setState }) {
  const s = state[id] || { text: "", submitted: false };
  const update = (text) => setState((p) => ({ ...p, [id]: { ...(p[id] || s), text } }));
  const submit = () => setState((p) => ({ ...p, [id]: { ...(p[id] || s), submitted: true } }));
  return (
    <div className="principle-gate">
      <div className="pg-label">Principle in one sentence — {sectionName}</div>
      <p className="pg-prompt">In one sentence, state the transferable principle from this section — something a PM or CTO at a different company could apply tomorrow. (Minimum 20 characters. Not scored — you can move to any section whether or not you complete this.)</p>
      <textarea
        rows={2}
        value={s.text}
        onChange={(e) => update(e.target.value)}
        placeholder="Type your one-sentence principle here..."
      />
      <div className="row">
        <button className="btn-secondary" disabled={s.text.trim().length < 20} onClick={submit}>
          Submit principle
        </button>
        <span className="hint">{s.text.trim().length < 20 ? `Enter at least 20 characters (${s.text.trim().length}/20)` : "Ready to submit"}</span>
      </div>
      {s.submitted && (
        <div className="authored-box">
          <div className="authored-label">Compare your answer to the authored one</div>
          <p>{authored}</p>
        </div>
      )}
    </div>
  );
}

function ChartInterp({ id, prompts, state, setState, requirePrediction }) {
  const s = state[id] || { a1: "", a2: "", sub1: false, sub2: false, pred: "" };
  const setVal = (k, v) => setState((p) => ({ ...p, [id]: { ...(p[id] || s), [k]: v } }));
  const submit1 = () => setState((p) => ({ ...p, [id]: { ...(p[id] || s), sub1: true } }));
  const submit2 = () => setState((p) => ({ ...p, [id]: { ...(p[id] || s), sub2: true } }));
  return (
    <div className="chart-questions">
      {requirePrediction && (
        <div className="prediction-box">
          <label>Before you check the derivation, write your predicted number or range:</label>
          <input type="text" value={s.pred} onChange={(e) => setVal("pred", e.target.value)} placeholder="Your prediction..." />
        </div>
      )}
      {[0, 1].map((i) => {
        const p = prompts[i];
        const answered = i === 0 ? s.sub1 : s.sub2;
        const val = i === 0 ? s.a1 : s.a2;
        return (
          <div className="interp-prompt" key={i}>
            <div className="interp-kind">{p.kind}</div>
            <p className="interp-text">{p.prompt}</p>
            <textarea
              rows={2}
              value={val}
              onChange={(e) => setVal(i === 0 ? "a1" : "a2", e.target.value)}
              placeholder="Type your answer (minimum 15 characters)..."
              disabled={answered}
            />
            <div className="row">
              <button
                className="btn-secondary"
                disabled={answered || val.trim().length < 15}
                onClick={i === 0 ? submit1 : submit2}
              >
                Submit answer
              </button>
              <span className="hint">
                {answered ? "Submitted" : val.trim().length < 15 ? `Enter at least 15 characters (${val.trim().length}/15)` : "Ready to submit"}
              </span>
            </div>
            {answered && (
              <div className="authored-box">
                <div className="authored-label">Compare your answer to the authored one</div>
                <p>{p.authored}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function wordCount(str) {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

function MCQ({ id, kind, subform, prompt, options, correctIndex, explanationCorrect, explanationsWrong, scaffold, transferCue, state, setState, onScore }) {
  const s = state[id] || { selected: null, submitted: false, attempts: 0, correct: false, scored: false };
  const select = (idx) => {
    if (s.submitted && s.correct) return;
    setState((p) => ({ ...p, [id]: { ...(p[id] || s), selected: idx } }));
  };
  const submit = () => {
    if (s.selected === null) return;
    const isCorrect = s.selected === correctIndex;
    const attempts = s.attempts + 1;
    if (attempts === 1) onScore(id, isCorrect ? 1 : 0);
    setState((p) => ({ ...p, [id]: { ...(p[id] || s), submitted: true, attempts, correct: isCorrect, scored: true } }));
  };
  const tryAgain = () => setState((p) => ({ ...p, [id]: { ...(p[id] || s), submitted: false, selected: null } }));

  return (
    <div className="mcq-block">
      {kind === "TC" && <div className="case-label">Case Prompt</div>}
      {kind === "TH" && <div className="th-label">Critical Reasoning — {subform}</div>}
      {kind === "TA" && <div className="q-kind-label">Architecture &amp; System Implication</div>}
      {kind === "TB" && <div className="q-kind-label">Technical Trend Reasoning</div>}
      <p className="q-prompt">{prompt}</p>
      <div className={"options " + (kind === "TC" ? "options-case" : "")}>
        {options.map((opt, idx) => {
          let cls = "option";
          if (s.submitted) {
            if (idx === correctIndex) cls += " correct";
            else if (idx === s.selected) cls += " wrong";
          } else if (s.selected === idx) {
            cls += " selected";
          }
          return (
            <div key={idx} className={cls} onClick={() => !s.submitted && select(idx)}>
              <span className="opt-letter">{"ABCD"[idx]}</span> {opt}
            </div>
          );
        })}
      </div>
      {!s.submitted && (
        <div className="row">
          <button className="btn-primary" disabled={s.selected === null} onClick={submit}>Submit</button>
          <span className="hint">{s.selected === null ? "Select an option to enable Submit" : "Ready to submit"}</span>
        </div>
      )}
      {s.submitted && (
        <div className="explanation">
          {s.correct ? (
            <p className="calib correct">Correct — this reasoning pattern generalizes: {explanationCorrect}</p>
          ) : (
            <p className="calib incorrect">Incorrect — this is {explanationsWrong[s.selected].error}: {explanationsWrong[s.selected].note}</p>
          )}
          {!s.correct && s.attempts === 1 && (
            <button className="btn-secondary" onClick={tryAgain}>Try again</button>
          )}
          {!s.correct && s.attempts >= 2 && (
            <div className="scaffold-box">
              <div className="scaffold-label">Scaffolding — before you try again</div>
              <p>{scaffold}</p>
              <button className="btn-secondary" onClick={tryAgain}>Try again</button>
            </div>
          )}
          {s.correct && <p className="transfer-cue">Where this generalizes: {transferCue}</p>}
          {!s.correct && s.attempts >= 2 && (
            <p className="transfer-cue">Where this generalizes: {transferCue}</p>
          )}
        </div>
      )}
    </div>
  );
}

function TFJustify({ id, claim, correctAnswer, authoredJustification, reasoningErrorIfWrong, state, setState, onScore }) {
  const s = state[id] || { choice: null, justification: "", submitted: false, scored: false };
  const setChoice = (v) => setState((p) => ({ ...p, [id]: { ...(p[id] || s), choice: v } }));
  const setJust = (v) => setState((p) => ({ ...p, [id]: { ...(p[id] || s), justification: v } }));
  const submit = () => {
    const isCorrect = s.choice === correctAnswer;
    if (!s.scored) onScore(id, isCorrect ? 1 : 0);
    setState((p) => ({ ...p, [id]: { ...(p[id] || s), submitted: true, scored: true, correct: isCorrect } }));
  };
  const canSubmit = s.choice !== null && s.justification.trim().length >= 15;
  return (
    <div className="tg-block">
      <div className="q-kind-label">True / False, with justification</div>
      <p className="q-prompt">{claim}</p>
      <div className="tf-options">
        {["True", "False"].map((label) => {
          const val = label === "True";
          let cls = "option tf-option";
          if (s.submitted) {
            if (val === correctAnswer) cls += " correct";
            else if (val === s.choice) cls += " wrong";
          } else if (s.choice === val) cls += " selected";
          return (
            <div key={label} className={cls} onClick={() => !s.submitted && setChoice(val)}>
              {label}
            </div>
          );
        })}
      </div>
      <textarea
        rows={2}
        placeholder="Justify your answer in one sentence, naming the specific evidence (minimum 15 characters)..."
        value={s.justification}
        onChange={(e) => setJust(e.target.value)}
        disabled={s.submitted}
      />
      {!s.submitted && (
        <div className="row">
          <button className="btn-primary" disabled={!canSubmit} onClick={submit}>Submit</button>
          <span className="hint">{!canSubmit ? "Select True or False and enter a justification of at least 15 characters" : "Ready to submit"}</span>
        </div>
      )}
      {s.submitted && (
        <div className="explanation">
          <p className={"calib " + (s.correct ? "correct" : "incorrect")}>
            {s.correct ? "Correct — " : `Incorrect — this is ${reasoningErrorIfWrong}: `}
            {s.correct ? "your True/False choice matches the evidence." : "the claim oversteps what the evidence supports."}
          </p>
          <div className="authored-box">
            <div className="authored-label">Your justification vs. the authored one</div>
            <p><em>Yours:</em> {s.justification}</p>
            <p><em>Authored:</em> {authoredJustification}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function FermiInput({ id, prompt, tolerance, decomposition, bounds, keyAssumption, actualValue, actualLabel, openEnded, state, setState, onScore }) {
  const s = state[id] || { value: "", decompositionText: "", submitted: false, scored: false };
  const setVal = (v) => setState((p) => ({ ...p, [id]: { ...(p[id] || s), value: v } }));
  const setDecomp = (v) => setState((p) => ({ ...p, [id]: { ...(p[id] || s), decompositionText: v } }));
  const submit = () => {
    const num = parseFloat(s.value);
    const within = !isNaN(num) && Math.abs(num - actualValue) / actualValue <= 0.10;
    if (!s.scored) onScore(id, within ? 1 : 0);
    setState((p) => ({ ...p, [id]: { ...(p[id] || s), submitted: true, scored: true, correct: within, signedError: isNaN(num) ? null : num - actualValue } }));
  };
  const canSubmit = s.value.trim() !== "" && (!openEnded || s.decompositionText.trim().length >= 15);
  return (
    <div className="fermi-block">
      <div className="q-kind-label">Engineering Estimation (Fermi) — tolerance ±10%: {tolerance}</div>
      <p className="q-prompt">{prompt}</p>
      {openEnded && (
        <div className="decomp-input">
          <label>Before entering a number, write your decomposition path in one line:</label>
          <input type="text" value={s.decompositionText} onChange={(e) => setDecomp(e.target.value)} placeholder="e.g., rate = quantity ÷ time; compute for each case; compare" disabled={s.submitted} />
        </div>
      )}
      <div className="row">
        <input type="number" className="fermi-num" value={s.value} onChange={(e) => setVal(e.target.value)} disabled={s.submitted} placeholder="Your estimate" />
        {!s.submitted && (
          <button className="btn-primary" disabled={!canSubmit} onClick={submit}>Submit</button>
        )}
        {!s.submitted && <span className="hint">{!canSubmit ? (openEnded ? "Enter your decomposition path and a number" : "Enter a number") : "Ready to submit"}</span>}
      </div>
      {s.submitted && (
        <div className="explanation">
          <p className={"calib " + (s.correct ? "correct" : "incorrect")}>
            {s.correct ? "Correct — within tolerance." : "Incorrect — outside the declared ±10% tolerance: base-rate neglect or a misjudged factor in the decomposition."}
          </p>
          <div className="fermi-axis">
            <div className="fermi-axis-track">
              <div className="fermi-mark actual" style={{ left: "70%" }}>▲<span>Actual: {actualLabel}</span></div>
              <div className="fermi-mark user" style={{ left: `${Math.max(2, Math.min(98, 70 * (parseFloat(s.value) / actualValue || 1)))}%` }}>▼<span>You: {s.value}</span></div>
            </div>
          </div>
          <div className="authored-box">
            <div className="authored-label">Decomposition path</div>
            <p>{decomposition}</p>
            <p><strong>Bounds and assumptions:</strong> {bounds}</p>
            <p><strong>Key assumption that most affects the estimate:</strong> {keyAssumption}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function PatternTransfer({ id, sectionLabel, prompt, state, setState, isFinal }) {
  const s = state[id] || { text: "", submitted: false, c1: false, c2: false, c3: false };
  const setText = (v) => setState((p) => ({ ...p, [id]: { ...(p[id] || s), text: v } }));
  const submit = () => setState((p) => ({ ...p, [id]: { ...(p[id] || s), submitted: true } }));
  const toggle = (k) => setState((p) => { const cur = p[id] || s; return { ...p, [id]: { ...cur, [k]: !cur[k] } }; });
  return (
    <div className={"pattern-transfer " + (isFinal ? "final-transfer" : "")}>
      <div className="pt-label">{isFinal ? "Final Question — Pattern Transfer" : `Pattern Transfer — ${sectionLabel}`}</div>
      <p className="q-prompt">{prompt}</p>
      <textarea
        rows={4}
        placeholder="Write at least 50 characters: name the principle, apply it non-trivially, and name a new failure mode..."
        value={s.text}
        onChange={(e) => setText(e.target.value)}
        disabled={s.submitted}
      />
      <div className="row">
        {!s.submitted && (
          <button className="btn-primary" disabled={s.text.trim().length < 50} onClick={submit}>Submit</button>
        )}
        <span className="hint">{s.text.trim().length < 50 ? `Enter at least 50 characters (${s.text.trim().length}/50)` : s.submitted ? "Submitted" : "Ready to submit"}</span>
      </div>
      {s.submitted && (
        <div className="self-eval">
          <div className="authored-label">Self-evaluation checklist</div>
          <label><input type="checkbox" checked={s.c1} onChange={() => toggle("c1")} /> Did I name the principle accurately?</label>
          <label><input type="checkbox" checked={s.c2} onChange={() => toggle("c2")} /> Is my application genuinely different from the original case (not just relabeling)?</label>
          <label><input type="checkbox" checked={s.c3} onChange={() => toggle("c3")} /> Is my failure mode genuinely new, not one already covered in this article?</label>
        </div>
      )}
    </div>
  );
}

/* ============================== SVG CHARTS ============================== */

function LadderSVG() {
  const rungs = [
    "Code (hard-coded, no model)",
    "Single LLM call",
    "Chain of LLM calls (fixed sequence)",
    "Router (model picks a branch, once)",
    "State machine (model loops through branches)",
    "Autonomous agent (no fixed guardrails)",
  ];
  return (
    <svg viewBox="0 0 680 340" className="svg-diagram" role="img" aria-label="Cognitive architecture ladder">
      {rungs.map((r, i) => {
        const y = 300 - i * 50;
        const highlighted = i === 4;
        return (
          <g key={i}>
            <rect x="40" y={y - 20} width="600" height="34" rx="6"
              fill={highlighted ? "#eef6ff" : "#fafafa"}
              stroke={highlighted ? "#2563eb" : "#ccc"} strokeWidth={highlighted ? 2 : 1} />
            <text x="60" y={y - 3} fontSize="13" fill="#111">{r}</text>
          </g>
        );
      })}
      <text x="40" y="330" fontSize="11" fill="#666">Bottom = least autonomy, most predictable. Top = most autonomy, least predictable.</text>
      <text x="360" y="30" fontSize="11" fill="#2563eb">Highlighted rung = where all five 2024 production cases in this article sit</text>
    </svg>
  );
}

function AutoCoverSVG() {
  return (
    <svg viewBox="0 0 700 300" className="svg-diagram" role="img" aria-label="AutoCover before and after architecture">
      <text x="10" y="20" fontSize="13" fontWeight="bold" fill="#111">Before: ~29 manual steps</text>
      <rect x="10" y="35" width="220" height="220" rx="8" fill="#fafafa" stroke="#ccc" />
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x="25" y={45 + i * 25} width="190" height="18" rx="3" fill="#f0f0f0" stroke="#ddd" />
      ))}
      <text x="30" y="240" fontSize="11" fill="#666">(mocks, drafts, runs, edits, reruns…)</text>

      <text x="380" y="20" fontSize="13" fontWeight="bold" fill="#111">After: 5-phase agentic loop</text>
      <g fontSize="12">
        <rect x="380" y="35" width="150" height="34" rx="6" fill="#fafafa" stroke="#999" />
        <text x="392" y="56" fill="#111">Prepare (code)</text>
        <line x1="455" y1="69" x2="455" y2="90" stroke="#999" />

        <rect x="380" y="90" width="150" height="34" rx="6" fill="#eef6ff" stroke="#2563eb" />
        <text x="392" y="111" fill="#111">Generate (LLM)</text>
        <line x1="455" y1="124" x2="455" y2="145" stroke="#999" />

        <rect x="380" y="145" width="150" height="34" rx="6" fill="#fafafa" stroke="#999" />
        <text x="392" y="166" fill="#111">Build / Run (code)</text>
        <line x1="455" y1="179" x2="455" y2="200" stroke="#999" />

        <rect x="380" y="200" width="150" height="34" rx="6" fill="#eef6ff" stroke="#2563eb" />
        <text x="405" y="221" fill="#111">Fix (LLM)</text>

        <path d="M 530 217 C 600 217, 600 162, 530 162" fill="none" stroke="#2563eb" strokeDasharray="4 3" />
        <text x="545" y="195" fontSize="10" fill="#2563eb">loop until coverage target (e.g. 80%)</text>
      </g>
      <rect x="380" y="255" width="16" height="12" fill="#eef6ff" stroke="#2563eb" />
      <text x="402" y="265" fontSize="10" fill="#666">LLM-decided step</text>
      <rect x="380" y="272" width="16" height="12" fill="#fafafa" stroke="#999" />
      <text x="402" y="282" fontSize="10" fill="#666">deterministic code</text>
    </svg>
  );
}

function UberTimelineSVG() {
  const events = [
    { x: 40, label: "Oct 2022", sub: "0 AI hackathon projects" },
    { x: 220, label: "~Early 2023", sub: "Start building in-house assistant" },
    { x: 400, label: "~6 months later", sub: "Project paused" },
    { x: 580, label: "After pivot", sub: "60% 30-day Copilot actives, ~10% PR-velocity lift" },
  ];
  return (
    <svg viewBox="0 0 660 200" className="svg-diagram" role="img" aria-label="Uber coding assistant timeline">
      <line x1="30" y1="100" x2="630" y2="100" stroke="#999" strokeWidth="2" />
      {events.map((e, i) => (
        <g key={i}>
          <circle cx={e.x} cy="100" r="6" fill={i === 2 ? "#dc2626" : "#2563eb"} />
          <text x={e.x} y="85" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#111">{e.label}</text>
          <text x={e.x} y="125" fontSize="10" textAnchor="middle" fill="#444">
            {e.sub.length > 22 ? e.sub.slice(0, 22) : e.sub}
          </text>
          {e.sub.length > 22 && <text x={e.x} y="138" fontSize="10" textAnchor="middle" fill="#444">{e.sub.slice(22)}</text>}
        </g>
      ))}
      <text x="330" y="165" fontSize="10" fill="#dc2626" textAnchor="middle">Red marker = the paused failure point (What Broke)</text>
    </svg>
  );
}

function AppFolioChart() {
  const data = [
    { name: "Before dynamic\nfew-shot prompting", value: 40 },
    { name: "After dynamic\nfew-shot prompting", value: 80 },
  ];
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => v + "%"} />
          <Tooltip formatter={(v) => v + "%"} />
          <Bar dataKey="value" fill="#2563eb">
            <LabelList dataKey="value" position="top" formatter={(v) => v + "%"} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="chart-caption">AppFolio Realm-X: text-to-data accuracy before/after dynamic few-shot prompting. FACT (LangChain, 2024 — AppFolio case study).</p>
    </div>
  );
}

function LinkedInQualityChart() {
  const data = [
    { name: "Below Passing", value: 5, tier: "ESTIMATE" },
    { name: "Passing to Good", value: 55, tier: "ESTIMATE" },
    { name: "Very Good / Excellent", value: 40, tier: "FACT" },
  ];
  const colors = ["#f87171", "#93c5fd", "#2563eb"];
  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tickFormatter={(v) => v + "%"} />
          <Tooltip formatter={(v) => v + "%"} />
          <Bar dataKey="value">
            <LabelList dataKey="value" position="top" formatter={(v) => v + "%"} />
            {data.map((d, i) => <Cell key={i} fill={colors[i]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="chart-caption">
        LinkedIn SQL Bot user quality ratings. "Very Good/Excellent" (40%) and "Passes or above" (95%, i.e. 100% − 5%) are FACT (LinkedIn Engineering, 2024, via ZenML LLMOps Database).
        "Below Passing" (~5%) and "Passing to Good" (~55%) are ESTIMATE — derived by simple subtraction (100−95 and 95−40), not independently reported bands.
      </p>
    </div>
  );
}

function ComparisonTable() {
  const rows = [
    ["LangChain \"chains\" (original)", "Fixed in advance by the developer", "No", "Elastic AI Assistant, before its mid-2024 migration"],
    ["CrewAI (multi-agent)", "Agents negotiate among themselves", "Partially, but hard to control", "Rexera, before its LangGraph rebuild (honorable mention)"],
    ["LangGraph", "Developer-defined graph; model reasons only inside named nodes", "Yes, explicitly", "AppFolio, Elastic (post-migration), LinkedIn, Replit, Uber's AutoCover"],
  ];
  return (
    <div className="chart-wrap">
      <table className="compare-table">
        <thead>
          <tr><th>Framework</th><th>Who decides the next step</th><th>Parallel branch execution</th><th>Example in this article</th></tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
      <p className="chart-caption">FACT — derived directly from the five sourced case descriptions plus the Rexera honorable mention (LangChain, 2024). No invented figures.</p>
    </div>
  );
}

/* ============================== HEADER / NAV ============================== */

function Header({ score, total }) {
  return (
    <div className="header-bar">
      <div className="header-top">
        <div>
          <div className="title">LangGraph in Production: Controllable Agents, Not Autonomous Ones</div>
          <div className="badges">
            <span className="badge type-badge">Agentic System Architecture (Type 3)</span>
            <span className="badge score-badge">Score: {score}/{total}</span>
          </div>
        </div>
      </div>
      <div className="lifecycle-strip">
        {["Feasibility", "Design", "Build", "Evaluate", "Deploy", "Scale", "Govern"].map((p) => (
          <span key={p} className={"phase " + (p === "Build" || p === "Evaluate" ? "active" : "")}>{p}</span>
        ))}
      </div>
      <div className="prevnext">
        <span>Prev: Harness Engineering — OpenAI Codex (Agentic System Architecture)</span>
        <span>Next: AI-Native System Design — RAG Pipelines at Scale (Type 4)</span>
      </div>
    </div>
  );
}

function LeftNav({ active, onNav }) {
  return (
    <div className="left-nav">
      {SECTIONS.map((s) => (
        <div key={s.id} className={"nav-item " + (active === s.id ? "active" : "")} onClick={() => onNav(s.id)}>
          {s.label}
        </div>
      ))}
    </div>
  );
}

/* ============================== WARM UP ============================== */

function WarmUp({ onDone }) {
  const [answers, setAnswers] = useState(["", "", ""]);
  const [submitted, setSubmitted] = useState([false, false, false]);
  const [skipped, setSkipped] = useState(false);

  const submit = (i) => {
    setSubmitted((prev) => {
      const next = [...prev];
      next[i] = true;
      return next;
    });
  };

  const allDone = submitted.every(Boolean);

  return (
    <div className="warmup-screen">
      <h2>Before you begin — recall from your prior reading</h2>
      <p>Two to three quick questions testing principles from articles you have already read, applied to brand-new situations. This is retrieval practice, not a test — nothing here is scored.</p>
      {WARMUP_QUESTIONS.map((w, i) => (
        <div className="warmup-q" key={i}>
          <p className="q-prompt">{w.prompt}</p>
          <textarea
            rows={3}
            value={answers[i]}
            onChange={(e) => { const val = e.target.value; setAnswers((prev) => { const n = [...prev]; n[i] = val; return n; }); }}
            placeholder="Minimum 25 characters..."
            disabled={submitted[i]}
          />
          {!submitted[i] && (
            <div className="row">
              <button className="btn-secondary" disabled={answers[i].trim().length < 25} onClick={() => submit(i)}>Submit</button>
              <span className="hint">{answers[i].trim().length < 25 ? `Enter at least 25 characters (${answers[i].trim().length}/25)` : "Ready to submit"}</span>
            </div>
          )}
          {submitted[i] && (
            <div className="authored-box">
              <div className="authored-label">This question tested a principle from: {w.sourceArticle}</div>
              <p>{w.principle}</p>
            </div>
          )}
        </div>
      ))}
      <div className="warmup-actions">
        <button className="btn-primary" disabled={!allDone} onClick={() => onDone(false)}>Continue to the article</button>
        <button className="btn-skip" onClick={() => onDone(true)}>Skip warm-up</button>
      </div>
    </div>
  );
}

/* ============================== SECTION CONTENT ============================== */

function SectionWrapper({ id, title, children, refCb }) {
  return (
    <section id={id} className="section" ref={refCb}>
      <h2>{title}</h2>
      {children}
      <Glossary pageId={id} />
    </section>
  );
}

function IntroSection({ refCb }) {
  return (
    <SectionWrapper id="intro" title="Introduction" refCb={refCb}>
      <p>The agent systems that survived contact with production in 2024 were not smarter autonomous agents. They were controllable, narrowly scoped agents built on an explicit state machine, where only a small, fenced-off part of the workflow is left to a language model's judgment and everything else stays deterministic and inspectable. LangChain, the company behind the open-source agent framework LangGraph, said this directly in its own year-end review: the agents that actually shipped in 2024 were "vertical, narrowly scoped, highly controllable agents," not the wide-open, fully autonomous agents that projects like AutoGPT had promised a year earlier (LangChain, 2024). This article uses LangChain's own countdown of five companies — Replit, Elastic, LinkedIn, AppFolio, and Uber — as its evidence, because it is a rare thing: a framework vendor naming, in public, the specific production deployments it considers its best proof that its approach works, with each company's own account attached.</p>
      <p>By the end of 2024, all five companies had moved a LangGraph-based agent into real production use, serving real users, not a demo. LinkedIn's SQL Bot served hundreds of employees inside LinkedIn's internal DARWIN data platform. Elastic's AI Assistant for security had reached over 350 users (Elastic, 2024). AppFolio's Realm-X assistant was saving property managers more than 10 hours of work a week (LangChain, 2024). Replit's coding agent went viral on a platform that already served more than 30 million developers (LangChain, 2024). Uber had stood up an entire internal team, AI Developer Experience, to embed agents into its software delivery pipeline across a codebase of more than 100 million lines of code (ZenML LLMOps Database, 2023). Compare this to the loudest agent story of the year before: AutoGPT, a project that let a model set its own goals and act with almost no constraints, generated enormous hype in early 2023 but produced no comparable list of paying enterprise deployments a year later.</p>
      <p>The conventional path — give the model more autonomy and let it figure out the steps itself — kept failing in a specific way once real users and real data showed up: an agent with no state machine has no fixed point where a human, a test suite, or a monitor can check its work before the next step runs. Uber discovered this gap first-hand. It spent about six months building its own fine-tuned, GitHub-Copilot-style coding assistant, only to shut the project down once it realized that an unconstrained race to be the smartest autocomplete was a race it could not win against Microsoft and Google's headcount (ZenML LLMOps Database, 2023). The five companies LangChain highlighted took the opposite path: they wrote code that fixes most of the workflow in advance, and let the model reason only inside the gaps a state machine cannot resolve on its own.</p>
      <p>This article addresses three questions. First, how do controllable agent architectures decide which steps stay deterministic and which get handed to a language model, and does that split look the same from one company to the next? Second, what specific engineering techniques — validators, self-correcting agents, human-in-the-loop checkpoints, or a hybrid of deterministic code and LLM-written rules — actually caught failures in these production systems, and what kept failing anyway? Third, how did these teams measure whether their agents were actually working, beyond a single pass or fail on the final task, and where did that measurement fall short?</p>
    </SectionWrapper>
  );
}

function LandscapeSection({ refCb, state, setState }) {
  return (
    <SectionWrapper id="landscape" title="Technical and Product Landscape" refCb={refCb}>
      <p>Agent frameworks in 2023 mostly took one of two shapes. The first was LangChain's own original design: pre-built, off-the-shelf "chains" — fixed sequences of prompts and tool calls — easy to start with but hard to customize once a real use case grew past the template (LangChain, 2024). The second was the fully autonomous agent, epitomized by AutoGPT: give a model a goal, a set of tools, and a loop, and let it decide everything else. LangChain co-founder Harrison Chase later described this as a "ladder" of cognitive architectures — the part of a system that decides what happens next — running from hard-coded logic at the bottom, through a single LLM call, a chain of calls, a router that lets the model pick a branch, a state machine that lets the model loop through a fixed set of branches, and only at the very top, a fully autonomous agent with no guardrails on which steps are even possible (LangChain, 2024).</p>
      <LadderSVG />
      <p className="chart-caption">Structural diagram reproducing a documented framework (LangChain, 2024 — "What is a 'cognitive architecture'?"). The six rungs and their order are FACT; the diagram carries no measured statistic and is otherwise ILLUSTRATION — a structural depiction, not reported data.</p>
      <ChartInterp
        id="chart-ladder"
        state={state} setState={setState}
        prompts={[
          {
            kind: "Qualitative / mechanism",
            prompt: "Between the \"router\" rung and the \"state machine\" rung, the described difference is that a router lets the model pick a branch once, while a state machine lets the model loop through branches repeatedly. Why would looping, on its own, make a system's behavior far less predictable than a single one-time branch choice, even using the exact same underlying model call?",
            authored: "A one-time router branch has a bounded number of possible paths through the system — one branch choice, one path. A loop multiplies that: each pass through the loop can pick a different branch than the last one, so the number of possible decision sequences grows with every additional loop iteration instead of staying fixed. That is also why AutoCover needed a hard stop condition (a coverage target) — without one, a state machine's loop has no built-in reason to ever terminate.",
          },
          {
            kind: "So-what (threshold / decision rule)",
            prompt: "Every production case in this article sits at the state-machine rung, not the autonomous-agent rung above it. At what point on this ladder would you, as a PM scoping a new agent feature, draw the line and say \"we go no higher than this rung without a specific, named justification,\" and what would that justification need to include?",
            authored: "The evidence in this article points to the state-machine rung as the practical ceiling for anything customer-facing or safety-relevant in 2024. Going higher would need a justification that at least one of these five teams did not have: either an error cost low enough that an uncontrolled mistake is genuinely cheap (not just assumed to be cheap), or a validation step powerful enough to catch a mistake before a user sees it, independent of the model that made it.",
          },
        ]}
      />
      <p>LangChain's answer, launched in early 2024, was LangGraph: a framework that makes a team choose an explicit point on that ladder and write it down as a graph, rather than leaving the choice implicit inside a prompt (LangChain, 2024). LangChain's own honorable-mentions list from the same year-end review names a company, Rexera, that went through a lifecycle other teams also reported: one simple agent, then a multi-agent system built on a different framework, CrewAI, that gave the model too much uncontrolled freedom over how its agents talked to each other, and finally a rebuild on LangGraph specifically to get that control back (LangChain, 2024). That progression — simple agent, then uncontrolled multi-agent, then controlled multi-agent — is the same shape as Uber's story, just compressed into one company's design history instead of two.</p>
      <p>The starting conditions across the five case companies varied enormously in scale but not in structure. AppFolio began with a LangChain-based assistant good enough for basic tool calls, then hit a wall once Realm-X needed to combine several branches of reasoning — action lookup, message drafting, help-page search — into one coherent reply, which pushed the team to LangGraph specifically for its ability to run independent branches in parallel and merge their outputs (LangChain, 2024). Elastic's AI Assistant began on plain LangChain in January 2024, then migrated to LangGraph mid-year as the security team added Attack Discovery and Automatic Import, two more agent-shaped features layered onto the same orchestration (LangChain, 2024). Both migrations happened for the same underlying reason: a workflow had grown too many branches, error-recovery paths, or parallel sub-tasks for an implicit chain of prompts to express clearly in code.</p>
      <ComparisonTable />
      <ChartInterp
        id="chart-table"
        state={state} setState={setState}
        prompts={[
          {
            kind: "Qualitative / mechanism",
            prompt: "Both the CrewAI row and the LangGraph row allow more than one agent or branch to act at the same time, but only the CrewAI row is described as hard to control. What structural difference between \"agents negotiate among themselves\" and \"a developer-defined graph\" explains why parallelism is controllable in one and not the other, even though both involve more than one thing happening at once?",
            authored: "The difference is not parallelism itself, it is who decides how the parallel pieces combine. In CrewAI's negotiation model, the agents work out the division of labor and how to reconcile conflicting outputs themselves, so reconciliation logic is something a model has to get right, unsupervised, every time. In LangGraph, the developer writes the reconciliation step as ordinary code, so parallel execution never requires a model to also decide how to combine its own parallel work.",
          },
          {
            kind: "Causal / comparative",
            prompt: "Elastic moved away from plain LangChain chains; Rexera moved away from CrewAI. Would you expect the reason for these two moves to be the same underlying problem, or two different problems that happen to end at the same destination framework? Defend your answer using what each earlier framework was missing.",
            authored: "Two different problems, same destination. Elastic's plain chains were not unpredictable — they were too rigid to express the branches and error-recovery paths that Attack Discovery and Automatic Import needed once those features launched. Rexera's CrewAI setup had the opposite problem: flexible enough to run multiple agents, but too uncontrolled, letting agents negotiate in ways the team could not fully specify. LangGraph solves both because it separates \"can this system express complex branching\" from \"is this branching fully specified by the developer\" — the first was Elastic's gap, the second was Rexera's.",
          },
        ]}
      />
      <p>The clearest illustration of what breaks without an explicit graph is Replit's own debugging problem. Replit Agent's workflow spans planning, environment setup, dependency installation, code generation, and deployment, and a single user session could produce a trace — the full record of every model call and tool call in one run — spanning hundreds of steps (LangChain, 2024). LangSmith, LangChain's companion observability tool, had to be rebuilt in three specific ways to keep up: faster ingestion and rendering for traces that long, a way to search for a specific event inside one giant trace instead of only across many traces, and a "thread view" that stitches together every trace from one multi-turn conversation so a human reviewer can see the whole arc of what the agent did (LangChain, 2024). None of those three fixes would have been necessary if the underlying agent had been a single unstructured loop instead of a graph with named, inspectable steps.</p>
    </SectionWrapper>
  );
}

function Evidence1Section({ refCb, state, setState, onScore, pgState, setPgState }) {
  return (
    <SectionWrapper id="evidence1" title="RQ1 — Where the State Machine Ends and the Model Begins" refCb={refCb}>
      <p>The claim to test in this section is specific: production agents in 2024 succeeded by writing down, in code, exactly which steps a language model is allowed to decide, and leaving every other step as ordinary deterministic software. If that claim is right, the more a company automated with agents, the more of its "agent" should actually be plain code wrapped around a small number of model calls, not model calls wrapped around a small amount of code.</p>
      <p>Uber's AutoCover, a system built to write unit tests automatically, is a clean test case because the team started by writing down exactly what a human already does. A developer adding test coverage to Uber's codebase — more than 100 million lines across six monorepos — normally works through about 29 distinct manual steps: setting up mocks, writing a first draft of a test, running it, reading the failure, editing, rerunning, and so on (ZenML LLMOps Database, 2023). Twenty-nine steps is also 29 places a mistake, a bad assumption, or a wasted hour can occur if a single unconstrained agent is asked to "just write good tests."</p>
      <p>AutoCover's actual design collapses those 29 steps into a five-phase loop, and only two of the five phases call a language model at all: Prepare (deterministic — set up mocks, create test files), Generate (LLM — write the test code), Build/Run (deterministic — execute the tests, capture failures), Fix (LLM — given a failure, propose a correction), then loop back to Build/Run until the tests reach a target coverage level, such as 80 percent (ZenML LLMOps Database, 2023). Three of five phases are code a compiler would recognize as ordinary; the model is only asked to do two things it is actually good at — write plausible test code, and propose a fix given a concrete error message — never asked to decide on its own whether a test is "good enough" to stop iterating.</p>
      <p>AppFolio's Realm-X shows the same principle from a different angle: parallel branches, not sequential phases. While one branch of the graph determines which action a user's request maps to, other branches run at the same time — calculating fallback options and searching help-page content — and only the deterministic step that merges the three branches' outputs decides what the user actually sees (LangChain, 2024). No single model call is responsible for the whole reply; each branch's model call is scoped to one narrow decision, and the aggregation logic that stitches them together is ordinary code, not a fourth model call asked to reconcile everything at the end.</p>
      <p>This division of labor is not free of judgment calls, though. When senior developers pushed back on AutoCover's early output, questioning whether passing tests were actually testing anything meaningful, the team had to add a whole new deterministic validation stage — checking that a test's assertions matched its own comments, and collapsing near-duplicate tests into Uber's own "table test pattern" — sitting between Generate and Build/Run (ZenML LLMOps Database, 2023). The boundary between "code decides" and "model decides" was not fixed correctly on the first attempt; it had to move after real users found a hole in it, and the team's own account treats this as unfinished, ongoing research rather than a solved problem.</p>
      <p>What makes this non-obvious is that adding more deterministic steps did not slow the pipeline down the way engineers might expect from a review process, because the new validation stage checks a machine-checkable property (does the assertion match the comment; is this a near-duplicate) rather than asking a human or a second model call to grade quality holistically. The lesson generalizes past testing: the fastest way to add a guardrail to an agent pipeline is not always "ask the model to double-check itself" — it is often "find the part of the judgment that can be reduced to a rule a compiler can run in milliseconds," and only fall back to another model call for the part that genuinely cannot be reduced that way.</p>
      <p>AutoCover's state-machine design is not the only architectural pattern here, and a reader should not conclude every controllable agent looks like a prepare-generate-run-fix loop. LinkedIn's SQL Bot uses a structurally different architecture for a structurally different problem: instead of looping a fixed sequence of phases, it runs a retrieval-and-ranking pipeline first — narrowing millions of tables in LinkedIn's data warehouse down to a working set using access-popularity signals, then to the seven most relevant tables using a dedicated LLM re-ranking step, before a separate agent ever writes a line of SQL (LinkedIn Engineering, 2024, via ZenML LLMOps Database). Where AutoCover's state machine is organized around a loop that repeats until a numeric target is hit, SQL Bot's architecture is organized around progressively narrowing a search space before generation even starts — the same "decide what the model is allowed to touch" principle, applied to data access instead of code execution.</p>

      <AutoCoverSVG />
      <p className="chart-caption">Uber AutoCover architecture, before (~29 manual steps) and after (5-phase loop). FACT — step count, phase names, and the deterministic/LLM split are as reported (ZenML LLMOps Database, 2023, summarizing an Uber Developer Platform team talk).</p>
      <ChartInterp
        id="chart-autocover"
        state={state} setState={setState}
        prompts={[
          {
            kind: "Quantitative reasoning",
            prompt: "Only 2 of the 5 phases in AutoCover's loop call a language model. If a single unconstrained agent asked to \"write good tests\" had, in Uber's words, roughly 29 opportunities for a mistake, and AutoCover's redesign narrows that to effectively 2 model-decision points per loop iteration, estimate roughly what fraction of the original decision points got removed from being a place an unconstrained model could make an unsupervised choice — and explain why the true safety gain is likely larger than that fraction alone suggests.",
            authored: "As a first pass, roughly 27 of 29 decision points — about 93 percent — moved from being an open, un-checked model decision to being deterministic code, a validator, or a fixed loop condition. The true gain is probably larger than that fraction implies, because the two remaining model steps (Generate and Fix) are now bounded by a hard, machine-checked exit condition (the coverage target) and a deterministic Build/Run step that catches failures before the loop can silently claim success — so even the 2 remaining decision points are no longer making unsupervised judgment calls about when to stop.",
          },
          {
            kind: "So-what (prioritization)",
            prompt: "AutoCover's five phases are Prepare, Generate, Build/Run, Fix, and a loop back to Build/Run. If you had to prioritize next quarter's engineering investment across three levers — making Generate produce better first-draft tests, making Fix converge faster, or making Prepare/Build-Run run faster as pure infrastructure — using a simple now-next-later ranking, how would you order these three, and what in this diagram's structure supports ranking Fix ahead of the other two, or not?",
            authored: "A defensible now-next-later ranking puts Fix first (now), Generate second (next), and Prepare/Build-Run infrastructure last (later): the diagram shows Fix is the only phase inside the retry loop that runs an unknown, potentially large number of times per session, so a small per-iteration improvement there compounds across every retry, while Generate only runs once per session and Prepare/Build-Run are already fully deterministic, meaning their speed is a pure infrastructure problem with no reasoning-quality upside attached. This is not the only defensible ranking — a team confident that Generate's first-draft quality is currently low could reasonably swap Fix and Generate — but the diagram's loop structure is what makes Fix the default first candidate.",
          },
        ]}
      />

      <MCQ
        id="mcq-e1-ta"
        kind="TA"
        state={state} setState={setState} onScore={onScore}
        prompt={`AutoCover's Generate and Fix phases both call a language model, while Prepare and Build/Run stay fully deterministic. If Uber scaled AutoCover from its current repositories to ten times as many repositories overnight, which part of the pipeline is most likely to become the bottleneck first, and what does that imply about where the team should invest engineering effort next quarter?`}
        options={[
          "The Fix phase's loop, because a tenfold increase in repositories means a tenfold increase in the raw number of distinct build and test failures needing diagnosis; each additional loop iteration adds latency and model cost per repository, so investment should target faster convergence or a fail-fast escalation to a human, not the model's raw writing ability.",
          "The Generate phase, because writing test code for ten times as many files requires proportionally more raw model intelligence to keep quality high across every codebase; the team should immediately upgrade Generate to the largest available frontier model rather than investing in the deterministic phases around it.",
          "The Prepare phase, because setting up mocks and test files is deterministic code that has never been load-tested at this scale, so by default it must become the slowest link once repository count grows tenfold, well before either language-model phase shows any strain at all.",
          "There is no likely bottleneck anywhere, because LangGraph's support for parallel branch execution — the same feature AppFolio uses to run several reasoning paths simultaneously — means all five of AutoCover's phases can simply run at the same time regardless of repository count.",
        ]}
        correctIndex={0}
        explanationCorrect={`when volume scales, the step that scales with the NUMBER of failure cases (not the number of files) becomes the bottleneck, because failure correction is the only step whose workload compounds with error rate rather than staying proportional to a fixed per-item cost.`}
        explanationsWrong={{
          1: { error: "applying a classical software assumption to AI", note: "assuming a bigger model is the default fix for a throughput problem, when the actual bottleneck is the number of failure cases needing correction, not the model's raw capability." },
          2: { error: "base-rate neglect", note: "assuming a step is the bottleneck without evidence, when the article's own account names the Fix loop, not Prepare, as the phase whose cost scales with the number of failures." },
          3: { error: "misattributing an architecture detail from a different case", note: "AppFolio's parallel branches are independent by design; AutoCover's five phases are a sequential loop with hard dependencies (Generate needs Prepare's output; Fix needs Build/Run's result), so they cannot simply run at the same time." },
        }}
        scaffold={`Re-read AutoCover's phase list: which single step's workload depends on how many things went wrong across all the repositories, rather than on how many things exist in total or how smart the model is?`}
        transferCue={`any agent design with a fix-and-retry loop, from AutoCover's tests to Uber's own AST rule generation pipeline for the Java-to-Kotlin migration.`}
      />

      <FermiInput
        id="fermi-e1"
        state={state} setState={setState} onScore={onScore}
        tolerance={`direct arithmetic chain from three stated counts, so ±10% counts as correct`}
        prompt={`LinkedIn's retrieval funnel for SQL Bot narrows the search space in three stages: deterministic popularity filtering brings the candidate pool down to roughly a few thousand tables (use 3,000 as a stated stand-in for \"a few thousand\"), embedding-based retrieval narrows that to the top 20, and a dedicated LLM re-ranking step narrows the 20 down to the final 7 used for query writing. Using only these three numbers, estimate the overall multiple of reduction from the popularity-filtered pool (3,000) to the final table set (7).`}
        decomposition={`Overall ratio = 3,000 ÷ 7 ≈ 429×. Stage 1 (popularity filter + embedding retrieval, 3,000 → 20) = 150×. Stage 2 (LLM re-ranking, 20 → 7) ≈ 2.9×.`}
        bounds={`Upper bound if \"a few thousand\" means 5,000: ratio ≈ 714×. Lower bound if it means 2,000: ratio ≈ 286×. The stage split (deterministic/EBR does ~150× of the work, the LLM re-ranker does under 3×) holds across this whole range.`}
        keyAssumption={`the exact size of \"a few thousand\" — the qualitative conclusion (most of the narrowing happens before the LLM re-ranker) is robust to that uncertainty, but the precise overall multiple is not.`}
        actualValue={429}
        actualLabel="≈429×"
        openEnded={false}
      />

      <PrincipleGate
        id="pg-e1" sectionName="RQ1 — Architecture"
        state={pgState} setState={setPgState}
        authored="Split any AI-native workflow into named steps ahead of time, and only let a language model occupy the steps that need genuinely novel judgment per input — a mock setup or a database check will always be cheaper and more reliable as compiled code than as a model's promise."
      />

      <PatternTransfer
        id="pt-e1" sectionLabel="RQ1 — Architecture"
        state={state} setState={setState}
        prompt={`The principle from this section is: give a model only the phases of a workflow that need genuinely novel, per-input judgment, and keep everything else — setup, execution, checking — as ordinary deterministic code. Apply this to a domain not covered in this article: an HR team building an agent to screen incoming job applications against a role's requirements. What would a PM or CTO do differently using this principle, and what new failure mode would they face that did not appear in AutoCover's, SQL Bot's, or Realm-X's examples?`}
      />

      <p>The evidence supports a narrow but real claim: in both of these production systems, the team's real engineering work was deciding where a state machine's deterministic edges should sit, not making the underlying model smarter. It does not support a stronger claim that this division is obvious or stable — Uber's own validation-stage addition shows the boundary moved after launch, and nothing in either company's public account guarantees the current boundary is the last one they will need.</p>
    </SectionWrapper>
  );
}

function Evidence2Section({ refCb, state, setState, onScore, pgState, setPgState }) {
  return (
    <SectionWrapper id="evidence2" title="RQ2 — Catching Failures Before a User Does" refCb={refCb}>
      <p>This section tests a second, related claim: that the reliability of a production agent comes from a specific set of engineering techniques — validators, self-correction loops, human-in-the-loop checkpoints, and, in the most safety-critical case, refusing to let the model touch the risky step at all — and that these techniques are not interchangeable; each catches a different class of failure.</p>
      <p>LinkedIn's SQL Bot faces a failure mode with an unusually clean, checkable signature: a generated SQL query can be syntactically valid and still reference a table or field that does not exist, or that was deprecated after the model's training or retrieval data went stale. Left unchecked, that failure would not just be wrong — it would be wrong in a way that looks confident, formatted, and correct to a non-technical employee who cannot tell a hallucinated column name from a real one.</p>
      <p>SQL Bot's fix is a validator-and-self-correction pipeline positioned after query generation but before the answer reaches the user: the system checks that every referenced table and field actually exists, runs the database's own EXPLAIN statement to catch syntax errors before execution, and feeds any error directly into a dedicated self-correction agent equipped with tools to fetch additional tables or fields and rewrite the query (LinkedIn Engineering, 2024, via ZenML LLMOps Database). The team's own framing of why this works is specific: validators are most useful when they can see information the original query-writing step could not — the EXPLAIN statement is ground truth from the database engine itself, not another guess from the same model that wrote the query.</p>
      <p>Uber's Java-to-Kotlin migration shows the limit of this validate-and-correct pattern: sometimes the safest reliability decision is refusing to let the model generate the risky artifact at all. The team explicitly considered asking a language model to rewrite migration code directly and rejected it, citing hallucination risk in a mobile app where a bad line of code is expensive to catch and slow to unwind once shipped, and citing a further problem underneath that: even a skilled human reviewer will miss some of a model's mistakes during code review, so review alone is not a reliable enough backstop (ZenML LLMOps Database, 2023). Their design instead uses a language model only to draft deterministic AST rewrite rules — a structured, machine-checkable transformation, not free-form code — and each drafted rule still has to pass the existing build, test, and lint pipeline before a human engineer approves it as a permanent, reusable transformation (ZenML LLMOps Database, 2023).</p>
      <p>The non-obvious part is that Uber's decision looks, on the surface, less ambitious with AI than LinkedIn's — using a model only to help write a rule, not to write the final code — but both choices reflect the same underlying test applied to two different error costs. LinkedIn can afford a self-correcting agent that occasionally needs two or three attempts, because a wrong internal analytics query mostly costs an analyst a few minutes. Uber cannot afford the same tolerance for production mobile code, because a wrong line that slips through is far more expensive to catch and reverse. The engineering pattern is the same — bound what the model is allowed to touch directly, and check its work against something outside itself — but where that boundary gets drawn moves with the cost of being wrong.</p>
      <p>A different, complementary reliability lever shows up at Replit: instead of validators that check content, LangSmith's tracing gives Replit's team the observability to catch failures a validator would never be written to check for in advance — the unknown-unknowns. Because Replit Agent's traces are long and multi-turn, the team specifically needed a "thread view" that stitches together every trace belonging to one user conversation, which let them find the exact point in a long-running session where a human needed to step in and correct the agent's trajectory (LangChain, 2024). Where LinkedIn and Uber build reliability into the pipeline before a mistake reaches a user, Replit's observability investment is aimed at reliability after the fact — making it fast to find and understand a failure nobody predicted well enough to write a validator for.</p>

      <AppFolioChart />
      <ChartInterp
        id="chart-appfolio"
        state={state} setState={setState}
        prompts={[
          {
            kind: "Quantitative reasoning",
            prompt: "Text-to-data accuracy roughly doubled, from about 40% to about 80%, after AppFolio added dynamic few-shot prompting. Express this change as a reduction in the error rate (the share of queries answered wrong), not just a rise in the accuracy percentage, and explain why the error-rate framing tells a more useful story for a PM deciding whether the investment was worth it.",
            authored: "Accuracy rising from 40% to 80% means the error rate fell from 60% to 20% — a 40-point drop, but as a share of the original error rate, that is a 67% reduction (40 of the original 60 points of error were eliminated). The error-rate framing matters more for a PM because it answers \"how much of the previous failure did we remove,\" rather than the accuracy framing, which can make identical point-gains look different depending on where they sit on the scale.",
          },
          {
            kind: "So-what (segmentation)",
            prompt: "AppFolio's accuracy jump from about 40% to about 80% is an average across all of Realm-X's text-to-data queries. If you were AppFolio's PM and could only see this aggregate number, how would you segment the query population so that a segment near the low end of that range gets a different fix than a segment already near the high end?",
            authored: "A useful segmentation splits queries by how well-represented they are in the examples AppFolio can pull from dynamically — common query types already have many good examples to draw on and likely sit near the high end, while rare or newly added action types have few or no good examples yet and likely sit near the low end. Dynamic few-shot prompting already does a lightweight, automatic version of this segmentation; the PM's job is to notice which segments still have thin examples and prioritize filling that gap, rather than treating the 80% average as evenly distributed across every query type.",
          },
        ]}
      />

      <MCQ
        id="mcq-e2-tb"
        kind="TB"
        state={state} setState={setState} onScore={onScore}
        prompt={`AppFolio's text-to-data accuracy rose from about 40% to about 80% in the same period the team adopted dynamic few-shot prompting. What is the strongest reason to be cautious about crediting dynamic few-shot prompting alone for the entire jump, based only on what this article's evidence shows?`}
        options={[
          "The 40% starting figure is unreliable, because early accuracy numbers for any new AI feature are always underreported due to limited usage data, meaning the true improvement documented here is probably even larger than the stated 40 points.",
          "The article describes the change as happening \"in the same period\" as the prompting update — correlation in time, not a controlled comparison. Nothing in the account rules out other changes, like more usage generating better examples to draw from, contributing to the same jump.",
          "Dynamic few-shot prompting cannot be the real cause here, because changing which examples appear in a prompt only affects response formatting, not the underlying accuracy of a model's reasoning about a user's actual question.",
          "Because AppFolio is a real company that succeeded using this exact technique, dynamic few-shot prompting should produce a similar accuracy gain for any other company's text-to-data feature that adopts the same approach.",
        ]}
        correctIndex={1}
        explanationCorrect={`an improvement documented across one time window, with no controlled A/B comparison, is evidence of correlation, not proof of a single cause — the same caution applies any time a case study reports \"we changed X and Y went up\" without a holdout group.`}
        explanationsWrong={{
          0: { error: "base-rate neglect", note: "asserting that early figures are \"always underreported\" with no evidence for that claim in this specific case." },
          2: { error: "applying a classical, and simply incorrect, assumption about how prompting works", note: "the examples included in a prompt demonstrably affect an LLM's reasoning about a query, not merely its formatting." },
          3: { error: "survivorship bias", note: "generalizing from one company's success story to a universal claim, ignoring that a peer company attempting the same technique might not see the same gain." },
        }}
        scaffold={`Ask what a controlled experiment would need to rule out other explanations here: what else changed for AppFolio in the same window besides the prompting technique?`}
        transferCue={`any before/after case-study metric reported without a control group, including several other companies in this article.`}
      />

      <MCQ
        id="mcq-e2-tc"
        kind="TC"
        state={state} setState={setState} onScore={onScore}
        prompt={`Meridian Health Claims, a mid-size insurance administrator, wants an agent that reads incoming claims and drafts the approval or denial letter, including the specific policy clause cited as justification. A product manager proposes: let the agent draft the letter directly, then have a second LLM call \"review\" the draft for accuracy before it is sent, modeled loosely on SQL Bot's self-correction step. Which assumption must hold for this recommendation to create value, and where in this article's evidence is that assumption thinnest?`}
        options={[
          "That claims letters are similar enough to SQL queries for the same self-correction architecture to transfer directly, which the article treats as well-supported, since both are structured outputs generated by comparing a request against a fixed source of facts.",
          "That the second LLM call will run slower than the first, which matters most here because Elastic's case in this article establishes that any added review step pushes latency past what production users will tolerate.",
          "That a second LLM call can reliably catch a hallucinated clause — and this is thinnest exactly where SQL Bot's design avoids relying on it: SQL Bot's validators check ground truth from the database engine itself, not another model's opinion of the first model's own output.",
          "That insurance regulators require a human to review every claim decision, which is the most important constraint here because it is a binding legal requirement that exists independently of whatever AI architecture the company chooses to build.",
        ]}
        correctIndex={2}
        explanationCorrect={`the load-bearing assumption in any 'add a review step' proposal is whether the reviewer has access to ground truth the first step lacked — a second guess from the same kind of model is a much weaker form of checking than an external, independent fact source.`}
        explanationsWrong={{
          0: { error: "false-analogy reasoning", note: "surface similarity (both are structured, fact-based outputs) is treated as evidence the same self-correction mechanism transfers, when what actually matters is whether a ground-truth check external to the generating model exists — SQL Bot has one (the database engine), this proposal does not." },
          1: { error: "scope creep misdiagnosis", note: "latency was never established as the binding constraint in this scenario, and Elastic's case does not establish a universal latency ceiling for every added review step." },
          3: { error: "single-cause fallacy applied to evidence the article never addresses", note: "this may be true in the real world, but the article's own evidence never discusses insurance regulation, so it cannot be the assumption \"thinnest in this article's evidence\" — nothing here speaks to it at all." },
        }}
        scaffold={`Compare what SQL Bot's validator actually checks against (an external database engine) with what this proposal's second LLM call would be checking against (another guess from a similar model). Is that the same kind of check?`}
        transferCue={`any 'have the model check itself' proposal, in any domain, where the real question is always whether an external, independent source of truth exists to check against.`}
      />

      <TFJustify
        id="tg-e2"
        state={state} setState={setState} onScore={onScore}
        claim={`True or False: Because SQL Bot's self-correction agent can retrieve additional tables and rewrite a failing query, LinkedIn's validators guarantee that any query reaching a user is factually correct.`}
        correctAnswer={false}
        authoredJustification={`False. The validators check that tables and fields exist and that the query is syntactically valid — necessary conditions for a usable query, but not sufficient for factual correctness, since a syntactically valid query can still join the wrong tables and still run without error. LinkedIn's own human-plus-LLM-judge accuracy review exists precisely because syntax validity does not guarantee correctness, and even that combined review only matches human judgment 75% of the time, not 100%.`}
        reasoningErrorIfWrong={`treating a necessary condition as a sufficient one`}
      />

      <PrincipleGate
        id="pg-e2" sectionName="RQ2 — Reliability"
        state={pgState} setState={setPgState}
        authored="Match your reliability technique to your error cost and to what kind of ground truth actually exists outside the model: use an external, checkable fact when one exists, refuse to let the model touch the risky artifact directly when the cost of a mistake is high and no such check exists, and invest in long-trace observability for the failures nobody thought to write a validator for."
      />

      <PatternTransfer
        id="pt-e2" sectionLabel="RQ2 — Reliability"
        state={state} setState={setState}
        prompt={`The principle from this section is: match the reliability technique to the error cost and to whatever external ground truth actually exists, rather than defaulting to \"add a review step.\" Apply this to a domain not covered in this article: a university's AI agent that drafts personalized financial-aid award letters for incoming students. What would a PM or CTO do differently using this principle, and what new failure mode would they face that did not appear in SQL Bot's, Uber's, or Replit's examples?`}
      />

      <p>The evidence across these three companies supports treating reliability engineering as a menu of distinct tools matched to distinct failure types and error costs — ground-truth validators for checkable facts, refusal plus human-gated rule generation for high-cost creative output, and long-trace observability for the failures nobody anticipated — rather than a single "add a review step" checkbox. It does not establish that this menu is complete: none of the five companies published an account of a validator that itself failed, which is a gap worth remembering as this section moves toward what actually broke.</p>
    </SectionWrapper>
  );
}

function Evidence3Section({ refCb, state, setState, onScore, pgState, setPgState }) {
  return (
    <SectionWrapper id="evidence3" title="RQ3 — Grading an Agent on More Than Whether It Finished" refCb={refCb}>
      <p>The third claim this article tests: teams that got controllable agents into production also had to build evaluation systems that measure more than "did the final answer look right," because a single pass/fail signal cannot tell a team which of several possible causes made an answer wrong, or right by luck.</p>
      <p>LinkedIn's evaluation problem starts with a basic measurement puzzle: for a natural-language question with a real business answer, there is often more than one SQL query that correctly answers it — different joins, different aggregation orders, the same result. LinkedIn's engineering team found that roughly 60 percent of their more than 130 benchmark questions, collected across 10 product areas with domain experts, actually have multiple acceptable answers; grading against only one "ground truth" query systematically underreported the system's true recall by 10 to 15 percentage points (LinkedIn Engineering, 2024, via ZenML LLMOps Database).</p>
      <p>LinkedIn's fix combines two measurement approaches instead of one: automated metrics for objective properties (recall of the right tables and fields against ground truth, hallucination rate, syntax correctness, response latency) and a human-plus-LLM-judge rubric for query accuracy that scores correctness across joins, filters, and aggregations plus quality dimensions like efficiency — comparing query text directly, rather than running every query against real data, let reviewers judge how close a wrong answer came to being right without needing live database access for every evaluation run (LinkedIn Engineering, 2024, via ZenML LLMOps Database). Their own audit of that LLM judge found it landed within one point of a human grader's score 75 percent of the time — good enough to lean on for routine grading, not good enough to remove human review from the loop entirely.</p>
      <p>Uber's measurement story is the strongest evidence against relying on any single quantitative proxy, including a good one. The team found that some of their most intuitive productivity metrics actively rewarded the wrong behavior once an agent could generate content at scale: a lines-of-code metric rewards verbose, padded code, and a test-coverage metric rewards tests that are numerous but flaky rather than tests that actually catch bugs (ZenML LLMOps Database, 2023). Uber's response was to downgrade quantitative metrics from the primary signal to a supporting one, leading with developer surveys and a single normalized measure, "developer time saved," defined consistently enough to compare across unrelated projects — unit test generation, code migration, incident response — even though the number itself is closer to a rough gauge than an audited outcome.</p>
      <p>The non-obvious point connecting LinkedIn and Uber is that both teams arrived at a hybrid measurement design specifically because a purely automated metric and a purely human judgment each fail in opposite, complementary ways: automated metrics scale but can be gamed or blind to what actually matters to a user, and human judgment captures what matters but does not scale to grading every production interaction. Neither company treats this as solved; LinkedIn schedules expert review every three months specifically to catch cases where its benchmark's own "ground truth" turns out to be wrong or incomplete, which is itself an admission that a fixed benchmark decays over time as usage patterns shift.</p>
      <p>AppFolio's evaluation setup adds a different, complementary layer that neither LinkedIn's benchmark design nor Uber's qualitative-plus-time-saved approach covers directly: gating deployment itself on evaluation results, inside the same continuous-integration pipeline that already runs unit tests. AppFolio maintains a central repository of sample cases — message history, metadata, and an ideal output — that double as evaluations, unit tests, and worked examples, and a code change only merges once all unit tests pass and its evaluation thresholds are met (LangChain, 2024). Where LinkedIn and Uber are mainly answering "is our agent good," AppFolio's CI gate is answering a narrower, operational question — "did this specific change make the agent worse" — automatically, on every pull request, rather than through a periodic survey or quarterly review.</p>

      <LinkedInQualityChart />
      <ChartInterp
        id="chart-linkedin"
        state={state} setState={setState}
        requirePrediction={true}
        prompts={[
          {
            kind: "Quantitative reasoning",
            prompt: "Given that 95% of users rate SQL Bot \"Passing or above\" and 40% rate it \"Very Good or Excellent,\" what percentage of users fall into the middle band — \"Passing to Good\" but not \"Very Good or Excellent\"? You predicted a number above; now show the subtraction that gets you the actual derived value and say what it implies about the typical user's experience.",
            authored: "The middle band is 95% − 40% = 55%, derived by subtracting the two reported figures rather than being separately reported by LinkedIn. It is the largest single band of the three — more users land in the broad \"acceptable but not excellent\" middle than in either the top or bottom band — which is a more cautious read of \"95% passing\" than the headline number alone suggests: the typical user experience is closer to \"good enough\" than to \"excellent.\"",
          },
          {
            kind: "Qualitative / mechanism",
            prompt: "SQL Bot's \"Fix with AI\" feature, which lets a user retry a failed query, is used in 80% of sessions — separate from the base quality ratings in this chart. Why might a tool with a sizable 55%-wide \"Passing to Good\" middle band, rather than a tool with near-uniform excellent ratings, be exactly the kind of tool where a retry-and-fix feature becomes especially valuable?",
            authored: "A retry-and-fix feature adds the most value precisely where a first attempt is decent but imperfect — the 55%-wide middle band — because those cases are close enough to correct that a second, corrected pass is likely to succeed, unlike the small \"below passing\" band where the first attempt may be so far off that fixing it would need several iterations. The heavy use of \"Fix with AI\" is therefore not just a convenience feature; it is doing real work compensating for exactly the middle-band imperfection this chart shows, which is also why the team describes it as unexpectedly high-leverage for a feature that was \"easy to develop.\"",
          },
        ]}
      />

      <MCQ
        id="mcq-e3-tb"
        kind="TB"
        state={state} setState={setState} onScore={onScore}
        prompt={`SQL Bot's quality ratings (95% \"Passes\" or above) were measured after the tool had already been live, and its adoption jumped 5 to 10 times once it was integrated directly into DARWIN instead of running as a separate standalone chatbot. Which is the strongest reason NOT to conclude that a rise in output quality caused the 5-to-10x adoption jump?`}
        options={[
          "Adoption numbers for any internal company tool always rise over time regardless of what specific changes are made to it, so this particular jump would very likely have happened on its own regardless.",
          "Quality ratings and adoption multipliers are measured on completely different scales — a percentage versus a multiplier — which means the two numbers cannot be meaningfully compared to each other in any way at all.",
          "The 95% quality figure came from a user survey, and survey-based results are inherently less reliable than adoption numbers, which come directly and objectively from measured usage logs rather than subjective self-report.",
          "The adoption jump is tied by the article's own evidence to a specific interface change — moving SQL Bot into DARWIN instead of running it as a standalone chatbot — not to any stated change in output quality at that same moment.",
        ]}
        correctIndex={3}
        explanationCorrect={`this generalizes to any case where two metrics move together after a single named event: check whether the article's evidence ties the change to a specific, different cause before crediting the metric you would like to take credit. The same caution applies to AppFolio's accuracy jump and its prompting-change timing.`}
        explanationsWrong={{
          0: { error: "survivorship bias / an unsupported base-rate claim", note: "asserting a universal pattern (\"adoption always rises\") with no evidence, when the article specifically ties this jump to one dated interface change." },
          1: { error: "scope creep misdiagnosis", note: "raising a genuine measurement caution about scales that does not actually address the causal question being asked." },
          2: { error: "misattributing causation via an irrelevant methodological tangent", note: "survey reliability doesn't bear on whether quality caused the adoption jump; it is a different question about measurement method, not about cause." },
        }}
        scaffold={`Look for the specific event the article ties the adoption jump to. Is it described as happening at the same time as a quality change, or at the same time as something else entirely?`}
        transferCue={`any case where two metrics move together after a single named event, including AppFolio's accuracy jump discussed earlier in this article.`}
      />

      <FermiInput
        id="fermi-e3"
        state={state} setState={setState} onScore={onScore}
        openEnded={true}
        tolerance={`direct arithmetic from the two cited timelines and the cited file count, so ±10% counts as correct`}
        prompt={`Uber's fully organic, developer-driven migration pace was projected at about 8 years to reach zero Java across its Android monorepo; the hybrid, LLM-assisted rule-generation approach is projected at about 4 years. The monorepo has roughly 100,000 files. Before entering a number, write out your decomposition path in one line, then estimate how many additional files per year, on average, the hybrid approach needs to convert compared to the organic pace, to hit its shorter timeline.`}
        decomposition={`Organic rate = 100,000 files ÷ 8 years = 12,500 files/year. Hybrid rate = 100,000 files ÷ 4 years = 25,000 files/year. Difference = 25,000 − 12,500 = 12,500 additional files/year.`}
        bounds={`If the true file count is closer to 90,000–110,000 (a ±10% range around the stated \"roughly 100,000\"), the required delta ranges from about 11,250 to 13,750 files/year — the conclusion that the hybrid approach needs to roughly double its annual conversion rate holds across that whole range.`}
        keyAssumption={`a constant, linear conversion rate under each approach — real migrations typically front-load easy files and back-load hard edge cases, so the true required rate in later years is likely higher than this simple average suggests.`}
        actualValue={12500}
        actualLabel="≈12,500 files/year"
      />

      <MCQ
        id="th-e3"
        kind="TH" subform="Weaken"
        state={state} setState={setState} onScore={onScore}
        prompt={`LinkedIn's account credits its hybrid evaluation design — automated metrics plus a human-and-LLM-judge accuracy rubric — with catching problems a single metric would miss, citing the LLM judge landing within one point of a human score 75% of the time as evidence the hybrid design works. Which new piece of evidence, if true, would most weaken the claim that this specific hybrid design is what produces SQL Bot's high user-satisfaction numbers (95% rating accuracy as \"Passes\" or above)?`}
        options={[
          "A report confirming that LinkedIn's benchmark questions were written by domain experts across 10 different product areas, a detail the article already states directly as part of its own evidence.",
          "A finding that the LLM judge disagreed with human graders by more than one point on 25 percent of graded queries — which is simply the numeric complement of the already-stated 75 percent agreement figure.",
          "An internal analysis showing satisfaction ratings were already just as high before the LLM-judge process existed, suggesting some other factor — the DARWIN integration itself, or retrieval quality — better explains the high satisfaction number.",
          "A survey showing that most SQL Bot users already have a technical background and could write the SQL themselves without the tool's help if they absolutely needed to for some reason.",
        ]}
        correctIndex={2}
        explanationCorrect={`a genuine weakening fact has to be information outside what the article already states, and has to bear directly on the specific causal claim; showing the outcome pre-dated the proposed cause is exactly this kind of evidence.`}
        explanationsWrong={{
          0: { error: "already addressed by evidence in the article", note: "this fact is already stated directly in the article and adds nothing new to weigh against the causal claim." },
          1: { error: "restating the conclusion's own evidence rather than adding new information", note: "a 25% disagreement rate is just the numeric complement of the stated 75% agreement figure — it says nothing new." },
          3: { error: "irrelevant to the specific causal claim being tested", note: "user technical background does not bear on whether the hybrid evaluation design is what produced the satisfaction number." },
        }}
        scaffold={`A weakening fact must be genuinely new information, not already stated in the article, and it must speak directly to whether the hybrid eval design — as opposed to something else — caused the satisfaction number.`}
        transferCue={`any claim that credits a specific intervention for an outcome; the strongest weakening evidence always shows the outcome existed before, or independent of, the proposed cause.`}
      />

      <PrincipleGate
        id="pg-e3" sectionName="RQ3 — Evaluation"
        state={pgState} setState={setPgState}
        authored="Build your evaluation system as a portfolio, not a dashboard number: automated metrics that scale but can be gamed, human or LLM-judge review for the nuance automation misses, and CI-style gating that catches regressions on every change — and re-audit the portfolio itself on a schedule, because a fixed benchmark decays as real usage drifts away from what it was built to test."
      />

      <PatternTransfer
        id="pt-e3" sectionLabel="RQ3 — Evaluation"
        state={state} setState={setState}
        prompt={`The principle from this section is: build evaluation as a portfolio of automated metrics, human-or-judge review, and regression gating, and re-audit that portfolio itself over time. Apply this to a domain not covered in this article: a city government's AI agent that triages incoming resident service requests (potholes, noise complaints, missed trash pickup) by urgency. What would a PM or CTO do differently using this principle, and what new failure mode would they face that did not appear in LinkedIn's, Uber's, or AppFolio's examples?`}
      />

      <p>The evidence supports treating an agent's evaluation system as a designed portfolio — automated checks for scale, human or LLM-judge review for nuance, and CI-style gating for regression safety — rather than a single dashboard number. It does not resolve how often that portfolio itself needs re-auditing, since none of the three companies published a case where their evaluation system was later shown to have been wrong for an extended period without anyone noticing, which is precisely the kind of failure the next section turns to.</p>
    </SectionWrapper>
  );
}

function WhatBrokeSection({ refCb, state, setState, onScore }) {
  return (
    <section id="whatbroke" className="section whatbroke" ref={refCb}>
      <h2>What Broke — Uber's Paused In-House Coding Assistant</h2>
      <p>In late 2022 and through much of 2023, Uber's Developer Platform team built an in-house, fine-tuned coding assistant meant to compete directly with GitHub Copilot — trained on Uber's own catalog of more than 100 million lines of proprietary code, with a hard latency target of under one second for a 100-token suggestion, deep integration across every IDE Uber's engineers used (Xcode, JetBrains, VS Code), and per-user analytics to measure productivity impact (ZenML LLMOps Database, 2023). After about six months of engineering work to reach a first version, the team made the decision to pause the project rather than keep investing in it.</p>
      <p>The assumption the project quietly rested on was that Uber's proprietary codebase gave it an advantage a general-purpose coding assistant could not match — that fine-tuning on Uber's own code would beat Copilot's acceptance rate by a meaningful margin, roughly 10 percentage points was the internal target (ZenML LLMOps Database, 2023). What the team had not priced in was resource asymmetry at a completely different order of magnitude: Microsoft and Google were treating this exact capability as a core, company-wide business investment, with engineering headcount Uber's smaller developer-tools team could not realistically match, and those vendor products kept improving every few months regardless of what Uber built. An internal team chasing a moving target set by two of the best-resourced AI labs in the world was never a fair race, and that was invisible at the point the project was scoped, when a working demo made the goal look close.</p>
      <p>The direct cost was about six months of a specialized engineering team's time — split across IDE integrations for three separate platforms, model hosting infrastructure, fine-tuning pipelines, and the service layer needed to gather code context — plus the harder-to-price cost of the alternative not pursued during that window. Uber's own account notes that even a well-executed internal assistant risked cannibalizing and confusing users who already had Copilot installed, meaning the project carried real user-experience risk on top of its direct engineering cost, right up until it was paused (ZenML LLMOps Database, 2023).</p>
      <p>The lesson Uber drew from this, and the one most worth keeping, is that a working demo and a production-ready system are separated by a gap that has almost nothing to do with whether the underlying model is good — "MVPs are deceptively easy," in the team's own words, but productionizing an AI tool competing with a vendor's core product is "incredibly difficult and expensive" (ZenML LLMOps Database, 2023). Uber's actual recovery was not to try harder at the same strategy, but to change strategy entirely: adopt what they called an "ecosystem principle" — build on top of GitHub Copilot rather than replace it, and repurpose the abandoned project's reusable pieces (code-context tooling, a telemetry proxy, the fine-tuned models themselves) into new tools, like a code-review bot, that did not require competing head-on with a vendor's core product. Within that new strategy, roughly 60 percent of Uber's developers became active 30-day Copilot users, and the team measured about a 10 percent lift in pull-request velocity among them (ZenML LLMOps Database, 2023) — a result the original from-scratch project never got the chance to produce.</p>

      <UberTimelineSVG />
      <p className="chart-caption">Uber's paused in-house coding assistant. FACT — the October 2022 starting point, the roughly six-month build-to-pause window, and the post-pivot 60%/10% figures are as reported (ZenML LLMOps Database, 2023, summarizing an Uber Developer Platform team talk). Month-by-month spacing between markers is illustrative layout, not a precise measured timescale.</p>
      <ChartInterp
        id="chart-uber-timeline"
        state={state} setState={setState}
        prompts={[
          {
            kind: "Qualitative / mechanism",
            prompt: "The timeline shows Uber going from zero AI hackathon projects in October 2022 to pausing a fully-built internal coding assistant about six months after starting to build it, then pivoting to a strategy built on top of a vendor's product. What does the six-month gap between \"start building\" and \"pause the project\" suggest about when the resource-asymmetry problem actually became visible to the team, relative to when it was actually true?",
            authored: "The resource asymmetry was almost certainly true from the moment the project was scoped — Microsoft and Google's headcount advantage did not appear partway through the six months, it existed from day one. What changed over those six months was the team's evidence for it: only after building a working V1 and comparing it against a vendor product that kept improving in the same window did the gap between \"what we can sustain\" and \"what the market requires\" become visible enough to act on. This kind of asymmetry is usually invisible at the scoping stage precisely because a demo, not a sustained comparison, is the only evidence available that early.",
          },
          {
            kind: "So-what (kill-criteria / pre-mortem)",
            prompt: "Given this timeline, what specific, checkable signal — available before the six-month mark, not only after — could Uber's team have used as a kill criterion to end the project earlier, and roughly how much of the eventual cost might it have saved?",
            authored: "A checkable early kill criterion would have been tracking Copilot's own suggestion-acceptance-rate improvements release over release during the first two months, rather than only comparing the two products once Uber's V1 was finished; if a vendor's product is closing the targeted 10-point acceptance-rate gap on its own within a couple of release cycles, that is a signal the target is moving faster than the internal team can move, available well before a full V1 exists. Acting on that signal at month two instead of month six could plausibly have saved roughly two-thirds of the direct engineering cost — three to four months of a specialized team's time — though this specific counterfactual is not something Uber's own account measures, so treat it as a reasoned estimate, not a reported figure.",
          },
        ]}
      />

      <MCQ
        id="mcq-wb"
        kind="TA"
        state={state} setState={setState} onScore={onScore}
        prompt={`Uber paused its in-house coding assistant after about six months, once it recognized a resource asymmetry against Microsoft and Google it had not priced in at the start. Given this account, which assumption was most likely held by the team at the time they scoped the project, considered uncontroversial, but turned out to be wrong?`}
        options={[
          "That the team should have known from day one, before building anything, that GitHub Copilot's improvement pace would eventually make the internal fine-tuned assistant unnecessary, since Copilot's rapid year-over-year gains were, in retrospect, obvious well in advance.",
          "That Uber's own proprietary code gave its fine-tuned model enough of a durable quality edge over a vendor's general-purpose assistant to be worth the ongoing cost of racing two much larger, better-resourced AI labs on the same underlying capability.",
          "That the project mainly failed because it tried to support too many IDEs at the same time — Xcode, JetBrains, and VS Code together — and would have succeeded if it had shipped with just one integration first.",
          "That the project failed solely because the fine-tuned model's suggestion accuracy never reached an acceptable bar for developers, a purely technical shortfall entirely independent of team size, headcount, or any organizational resourcing consideration at all.",
        ]}
        correctIndex={1}
        explanationCorrect={`the load-bearing, reasonable-at-the-time assumption in any internal-AI-versus-vendor decision is almost always about durable advantage — does our unique asset outlast a well-resourced competitor's iteration speed — not about the model's raw capability at launch.`}
        explanationsWrong={{
          0: { error: "hindsight bias", note: "treating a fact only clear after the outcome (Copilot's pace would win) as something that was obvious in advance, when the team's own account describes it as invisible at the time of scoping." },
          2: { error: "scope creep misdiagnosis", note: "blaming a surface complexity symptom (supporting three IDEs) rather than the resource-asymmetry root cause the team itself named." },
          3: { error: "single-cause fallacy", note: "attributing a multi-factor organizational failure (headcount, vendor pace, cannibalization risk) to a single technical shortfall." },
        }}
        scaffold={`Ask which belief the team would have needed to hold, uncontroversially, on day one of scoping — before any evidence about Copilot's pace or the model's accuracy existed yet — for them to start the project at all.`}
        transferCue={`any internal-build-versus-vendor-adopt decision, where the load-bearing assumption is always about durable advantage, not about launch-day capability.`}
      />

      <div className="glossary">
        <div className="glossary-label">Glossary</div>
        {GLOSSARY.whatbroke.map(([term, def], i) => (
          <div className="glossary-entry" key={i}><strong>{term}</strong> — {def}</div>
        ))}
      </div>
    </section>
  );
}

/* ============================== LEARNING SUMMARY ============================== */

function ApplyIt({ state, setState }) {
  const s = state["applyit"] || { thesis: "", assumption: "", disconfirm: "", premortem: "", variant2027: "", submitted: false };
  const upd = (k, v) => setState((p) => ({ ...p, applyit: { ...s, [k]: v } }));
  const submit = () => setState((p) => ({ ...p, applyit: { ...s, submitted: true } }));
  const filled = [s.thesis, s.assumption, s.disconfirm, s.premortem, s.variant2027].every((x) => x.trim().length >= 15);
  return (
    <div className="applyit">
      <h3>Apply It</h3>
      <p className="pg-prompt">Present-day variant: apply the governing principle to a company or product you know personally. Four labeled parts, each at least 15 characters.</p>
      <label>1. One-sentence so-what thesis</label>
      <textarea rows={2} value={s.thesis} onChange={(e) => upd("thesis", e.target.value)} disabled={s.submitted} />
      <label>2. Load-bearing assumption</label>
      <textarea rows={2} value={s.assumption} onChange={(e) => upd("assumption", e.target.value)} disabled={s.submitted} />
      <label>3. Strongest disconfirming evidence from this article</label>
      <textarea rows={2} value={s.disconfirm} onChange={(e) => upd("disconfirm", e.target.value)} disabled={s.submitted} />
      <label>4. One-line pre-mortem: "If this fails in 12 months, the most likely reason is ___"</label>
      <textarea rows={2} value={s.premortem} onChange={(e) => upd("premortem", e.target.value)} disabled={s.submitted} />
      <p className="pg-prompt">2027 forward-looking variant: given the same business constraints, but assuming foundation models in 2027 have longer context, cheaper inference, and better reasoning by default — what would you design or decide differently, and what load-bearing assumption from this article would that 2027 version replace?</p>
      <textarea rows={3} value={s.variant2027} onChange={(e) => upd("variant2027", e.target.value)} disabled={s.submitted} />
      {!s.submitted && (
        <div className="row">
          <button className="btn-primary" disabled={!filled} onClick={submit}>Submit Apply It</button>
          <span className="hint">{!filled ? "Fill in all five fields (at least 15 characters each)" : "Ready to submit"}</span>
        </div>
      )}
      {s.submitted && (
        <div className="authored-box">
          <div className="authored-label">Evaluator notes (checks for presence and non-triviality, not keyword scoring)</div>
          <p>All four present-day parts and the 2027 variant were submitted. Re-read part 3 (disconfirming evidence) in particular — the strongest answers name a specific limit this article's own evidence admits (for example, that no company here has published what happens to a validator or benchmark at 10x today's volume), not a generic risk that could apply to any AI project.</p>
        </div>
      )}
    </div>
  );
}

function InsightSlots({ state, setState }) {
  const s = state["insightslots"] || { text: "", submitted: false };
  const upd = (v) => setState((p) => ({ ...p, insightslots: { ...s, text: v } }));
  const submit = () => setState((p) => ({ ...p, insightslots: { ...s, submitted: true } }));
  const authored = [
    "Most of a controllable agent's real engineering effort goes into deterministic code around the model, not into the model call itself — AutoCover's 5-phase loop calls a model in only 2 phases, and LinkedIn's retrieval funnel does over 150x of its narrowing before a model ever ranks anything.",
    "The same technique (bound what the model touches; check against outside ground truth) gets applied differently depending on error cost, not company sophistication — LinkedIn tolerates a self-correcting agent that needs retries; Uber does not, and refuses to let a model touch production code directly for exactly that reason.",
    "Every evaluation system in this article is explicitly unfinished — LinkedIn re-audits its own benchmark every three months, Uber demoted its own metrics after they were gamed, and none of the five companies has published what happens to any of this at ten times today's volume.",
  ];
  return (
    <div className="insight-slots">
      <h3>Three Insight Slots</h3>
      <p className="pg-prompt">You have seen evidence from five production case studies and one failure. Before the authored insight cards reveal, write the single most non-obvious insight you would defend to a skeptical CTO.</p>
      <textarea rows={3} value={s.text} onChange={(e) => upd(e.target.value)} disabled={s.submitted} placeholder="Minimum 30 characters..." />
      {!s.submitted && (
        <div className="row">
          <button className="btn-primary" disabled={s.text.trim().length < 30} onClick={submit}>Reveal authored insights</button>
          <span className="hint">{s.text.trim().length < 30 ? `Enter at least 30 characters (${s.text.trim().length}/30)` : "Ready"}</span>
        </div>
      )}
      {s.submitted && (
        <div className="insight-cards">
          <div className="authored-label">How your insight compares — three authored insight cards</div>
          {authored.map((a, i) => <div className="insight-card" key={i}>{a}</div>)}
        </div>
      )}
    </div>
  );
}

function LearningSummary({ refCb, questionState, pgState, score, total, warmUpSkipped }) {
  const principleSections = [
    { id: "pg-e1", label: "RQ1 — Architecture" },
    { id: "pg-e2", label: "RQ2 — Reliability" },
    { id: "pg-e3", label: "RQ3 — Evaluation" },
  ];
  const [ls, setLs] = useState({});
  const missed = [];
  Object.keys(questionState).forEach((k) => {
    const q = questionState[k];
    if (q && q.submitted && q.correct === false) missed.push(k);
  });
  const principleLabel = {
    "mcq-e1-ta": "RQ1 — bottleneck reasoning in a loop-based agent pipeline",
    "mcq-e2-tb": "RQ2 — correlation vs. causation in a before/after metric",
    "mcq-e2-tc": "RQ2 — the load-bearing assumption in 'have the model check itself'",
    "tg-e2": "RQ2 — necessary vs. sufficient conditions in validator design",
    "mcq-e3-tb": "RQ3 — correlation vs. causation in an adoption jump",
    "th-e3": "RQ3 — what counts as genuinely new, weakening evidence",
    "mcq-wb": "What Broke — naming the load-bearing assumption behind a failed project",
    "fermi-e1": "RQ1 — sizing the retrieval funnel's reduction ratio",
    "fermi-e3": "RQ3 — sizing the required migration-rate increase",
  };
  return (
    <section id="summary" className="section" ref={refCb}>
      <h2>Learning Summary</h2>
      <div className="summary-block">
        <h3>Score Breakdown</h3>
        <p>Total score: {score} / {total} scored questions correct on first attempt or after scaffolding.</p>
        <p>Warm-up: {warmUpSkipped ? "Skipped — 3 prior principles not reviewed this session." : "Completed."}</p>
        {missed.length === 0 ? (
          <p>No missed questions recorded yet, or all attempted questions were answered correctly.</p>
        ) : (
          <div>
            <p>Missed questions, by the transferable principle each tested (not by question ID):</p>
            <ul className="missed-list">
              {missed.map((k) => <li key={k}>{principleLabel[k] || k}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div className="summary-block">
        <h3>Principle Production Review</h3>
        {principleSections.map((s) => {
          const v = pgState[s.id];
          return (
            <div key={s.id} className="principle-review-item">
              <strong>{s.label}:</strong> {v && v.submitted ? <em>"{v.text}"</em> : <span className="hint">Not yet submitted — visit that section to complete it.</span>}
            </div>
          );
        })}
        <p className="pg-prompt">Which of your stated principles surprised you most when compared to the authored version? Why? (Reflect in the section itself — this review is a mirror, not a new prompt.)</p>
      </div>

      <div className="summary-block">
        <InsightSlots state={ls} setState={setLs} />
      </div>

      <div className="summary-block">
        <ApplyIt state={ls} setState={setLs} />
      </div>
    </section>
  );
}

/* ============================== CONCLUSION ============================== */

function ConclusionTE({ state, setState, onScore }) {
  const s = state["te-conclusion"] || { selected: null, submitted: false, variant2027: "" };
  const select = (i) => !s.submitted && setState((p) => ({ ...p, "te-conclusion": { ...(p["te-conclusion"] || s), selected: i } }));
  const submit = () => {
    const correct = s.selected === 3;
    setState((p) => ({ ...p, "te-conclusion": { ...(p["te-conclusion"] || s), submitted: true, correct } }));
    onScore("te-conclusion", correct ? 1 : 0);
  };
  const upd2027 = (v) => setState((p) => ({ ...p, "te-conclusion": { ...(p["te-conclusion"] || s), variant2027: v } }));
  const options = [
    "Commit to the current architecture for at least two years regardless of new evidence, since AutoCover's team needing to add a validation stage after launch shows that changing course mid-stream signals a flawed initial plan.",
    "Choose the most capable available foundation model first, since every company in this article eventually benefited from stronger underlying models regardless of their architecture.",
    "Avoid building anything in-house and always use a vendor's product, since Uber's failed coding assistant proves internal AI investment does not work.",
    "Write down, before any model is chosen, which specific steps of the target workflow will be deterministic code, which will be model calls, and what external ground truth (if any) will validate each model call's output — and revisit that boundary on a fixed schedule rather than treating it as a one-time scoping decision.",
  ];
  return (
    <div className="te-block">
      <div className="q-kind-label">Forward-Looking Implication — Present-day variant</div>
      <p className="q-prompt">Given the evidence in this article, including Uber's paused in-house coding assistant, what is the single most important decision a PM or CTO at a similar company should make in the next six months before adopting a controllable-agent architecture for a new internal tool?</p>
      <div className="options">
        {options.map((opt, idx) => {
          let cls = "option";
          if (s.submitted) { if (idx === 3) cls += " correct"; else if (idx === s.selected) cls += " wrong"; }
          else if (s.selected === idx) cls += " selected";
          return <div key={idx} className={cls} onClick={() => select(idx)}><span className="opt-letter">{"ABCD"[idx]}</span> {opt}</div>;
        })}
      </div>
      {!s.submitted && (
        <div className="row">
          <button className="btn-primary" disabled={s.selected === null} onClick={submit}>Submit</button>
          <span className="hint">{s.selected === null ? "Select an option to enable Submit" : "Ready to submit"}</span>
        </div>
      )}
      {s.submitted && (
        <div className="explanation">
          <p className={"calib " + (s.correct ? "correct" : "incorrect")}>
            {s.correct ? "Correct — " : "Incorrect — "}
            {s.correct
              ? "drawing the deterministic/model boundary explicitly, before model selection, is the decision every one of the five production companies made, in different words."
              : "re-read which option treats the boundary as fixed forever versus something to name and revisit."}
          </p>
          <p className="falsification-note"><strong>Falsification clause (option A):</strong> Option A inverts the article's own evidence — AutoCover needing a new validation stage after launch is not proof the architecture was flawed from the start, it is exactly the kind of boundary adjustment this article's principle predicts will be necessary. What WOULD falsify this article's central claim is a case where a team drew the boundary once, never revisited it, and the system stayed reliable and cost-effective at 10x scale with no added guardrails — that observation appears nowhere in this article's evidence, which is itself a gap worth naming, not a confirmation.</p>
          <div className="pg-prompt-block">
            <p className="pg-prompt">2027 variant: given the same business constraints and user problem in any one of these five companies' cases, but assuming foundation models in 2027 have meaningfully longer context, cheaper inference, and better reasoning by default, what would you design or decide differently — and what load-bearing assumption from this article's evidence would that 2027 version replace?</p>
            <textarea rows={3} value={s.variant2027} onChange={(e) => upd2027(e.target.value)} placeholder="Minimum 50 characters..." />
            <span className="hint">{s.variant2027.trim().length < 50 ? `Enter at least 50 characters (${s.variant2027.trim().length}/50)` : "Recorded"}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ConclusionSection({ refCb, state, setState, onScore }) {
  return (
    <SectionWrapper id="conclusion" title="Conclusion" refCb={refCb}>
      <p>The governing principle survives the evidence, including the failure case, but only in a narrow form: production agents that lasted through 2024 fenced off a small, well-defined slice of judgment for a language model and kept everything else — sequencing, validation, deployment gating — as ordinary, inspectable software. Where a team instead let a model, or in Uber's case an entire product decision, operate with less structure than its actual reliability needs required, the project either needed retrofitted guardrails after launch, as AutoCover did, or was paused outright, as Uber's in-house coding assistant was. Partial failure of this principle looks like AppFolio's or LinkedIn's still-evolving validation and benchmark maintenance, not a clean binary of "controlled agents always work" — the boundary between deterministic and model-decided steps keeps needing to move even inside a company that got the initial split right.</p>
      <p>For an AI product manager, this changes where scoping conversations should start: not "which foundation model should we use," but "draw the state machine first, and name out loud which nodes are allowed to call a model." It also means a PM should expect the boundary drawn at launch to be wrong in some specific way within months, the way AutoCover's was, and should budget review capacity for that renegotiation rather than treating architecture as a one-time decision made during scoping.</p>
      <p>For a future CTO, the clearest platform-level lesson is Uber's, and it cuts against the instinct to build proprietary AI tooling wherever a vendor's product touches a differentiator: internal AI investment is worth making only where a company's own data-generating process, workflow context, or governance need creates an advantage a vendor cannot fine-tune its way into matching, and "we have unique code" was not, on its own, a strong enough version of that advantage against two companies for whom the underlying capability was a core product.</p>
      <p>The most important thing this evidence does not answer is how these five architectures perform as failure rates compound at ten times today's usage: every quantitative claim in this article, from LinkedIn's benchmark to Uber's migration timeline, is a snapshot from a single window in 2024, and no company here has yet published what happens to a validator, a benchmark, or a state-machine boundary once the volume of edge cases grows by an order of magnitude.</p>
      <ConclusionTE state={state} setState={setState} onScore={onScore} />
      <PatternTransfer
        id="pt-final" sectionLabel="Final"
        isFinal={true}
        state={state} setState={setState}
        prompt={`The governing principle of this article is that production agents in 2024 succeeded by fencing off only a narrow, genuinely novel-judgment slice of a workflow for a language model, keeping everything else deterministic, validated against external ground truth, or gated by evaluation — and that this boundary needs active maintenance, not a one-time decision. Apply this to a regional airline's AI agent that rebooks passengers onto new flights after a cancellation. Name the principle accurately, describe a non-trivial application (not just relabeling AutoCover's phases with airline names), and name a new failure mode this specific domain would face that did not appear anywhere in this article's five companies.`}
      />
    </SectionWrapper>
  );
}

/* ============================== APP ROOT ============================== */

function App() {
  const [warmUpDone, setWarmUpDone] = useState(false);
  const [warmUpSkipped, setWarmUpSkipped] = useState(false);
  const [active, setActive] = useState("intro");
  const [questionState, setQuestionState] = useState({});
  const [pgState, setPgState] = useState({});
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const scoredIds = useRef(new Set());
  const refs = useRef({});
  const [navVisible, setNavVisible] = useState(window.innerWidth > 1160);

  useEffect(() => {
    const onResize = () => setNavVisible(window.innerWidth > 1160);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!warmUpDone) return;
    const onScroll = () => {
      let currentId = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = refs.current[s.id];
        if (el && el.getBoundingClientRect().top - 140 <= 0) currentId = s.id;
      }
      setActive(currentId);
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [warmUpDone]);

  const scoreQuestion = (id, val) => {
    if (scoredIds.current.has(id)) return;
    scoredIds.current.add(id);
    setTotal((t) => t + 1);
    setScore((sc) => sc + (val > 0 ? 1 : 0));
  };

  const setRef = (id) => (el) => { if (el) refs.current[id] = el; };

  const scrollTo = (id) => {
    const el = refs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  if (!warmUpDone) {
    return (
      <div className="app-warmup-shell">
        <div className="progress-bar" style={{ width: "0%" }} />
        <WarmUp onDone={(skipped) => { setWarmUpSkipped(skipped); setWarmUpDone(true); }} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="progress-bar" style={{ width: `${(SECTIONS.findIndex((s) => s.id === active) + 1) / SECTIONS.length * 100}%` }} />
      <Header score={score} total={total} />
      <div className="body-layout">
        {navVisible && <LeftNav active={active} onNav={scrollTo} />}
        <div className="content-column">
          <IntroSection refCb={setRef("intro")} />
          <LandscapeSection refCb={setRef("landscape")} state={questionState} setState={setQuestionState} />
          <Evidence1Section
            refCb={setRef("evidence1")} state={questionState} setState={setQuestionState}
            onScore={scoreQuestion}
            pgState={pgState} setPgState={setPgState}
          />
          <Evidence2Section
            refCb={setRef("evidence2")} state={questionState} setState={setQuestionState}
            onScore={scoreQuestion}
            pgState={pgState} setPgState={setPgState}
          />
          <Evidence3Section
            refCb={setRef("evidence3")} state={questionState} setState={setQuestionState}
            onScore={scoreQuestion}
            pgState={pgState} setPgState={setPgState}
          />
          <WhatBrokeSection refCb={setRef("whatbroke")} state={questionState} setState={setQuestionState} onScore={scoreQuestion} />
          <LearningSummary refCb={setRef("summary")} questionState={questionState} pgState={pgState} score={score} total={total} warmUpSkipped={warmUpSkipped} />
          <ConclusionSection refCb={setRef("conclusion")} state={questionState} setState={setQuestionState} onScore={scoreQuestion} />
          <footer className="footer">
            <h3>Sources</h3>
            <ul className="source-list">
              <li><strong>[Tier 1]</strong> LangChain, "Top 5 LangGraph Agents in Production 2024" (Dec 31, 2024) — <a href="https://www.langchain.com/blog/top-5-langgraph-agents-in-production-2024" target="_blank">langchain.com/blog</a> — primary source; countdown, quotes, and honorable mentions (Rexera/CrewAI).</li>
              <li><strong>[Tier 1]</strong> LangChain, "How AppFolio transformed property management workflows with Realm-X" (Dec 16, 2024) — <a href="https://www.langchain.com/blog/customers-appfolio" target="_blank">langchain.com/blog/customers-appfolio</a> — architecture, accuracy figures, CI eval gating.</li>
              <li><strong>[Tier 1]</strong> LangChain, "Pushing LangSmith to new limits with Replit Agent's complex workflows" (Sep 26, 2024) — <a href="https://www.langchain.com/blog/customers-replit" target="_blank">langchain.com/blog/customers-replit</a> — trace scale, thread view, human-in-the-loop.</li>
              <li><strong>[Tier 1]</strong> Elastic, "How we built Automatic Import, Attack Discovery, and Elastic AI Assistant using LangChain" (Aug 8, 2024) — <a href="https://www.elastic.co/blog/building-automatic-import-attack-discovery-langchain" target="_blank">elastic.co/blog</a> — 350+ users, LangChain-to-LangGraph migration.</li>
              <li><strong>[Tier 1]</strong> LangChain, "What is a 'cognitive architecture'?" (Jul 5, 2024) — <a href="https://www.langchain.com/blog/what-is-a-cognitive-architecture" target="_blank">langchain.com/blog</a> — the autonomy ladder used in the Landscape section.</li>
              <li><strong>[Tier 2]</strong> LinkedIn Engineering, "Practical Text-to-SQL for Data Analytics," via ZenML LLMOps Database summary (Dec 2024) — <a href="https://www.zenml.io/llmops-database/building-a-production-text-to-sql-assistant-with-multi-agent-architecture" target="_blank">zenml.io/llmops-database</a> — SQL Bot architecture, benchmark, and evaluation figures.</li>
              <li><strong>[Tier 2]</strong> ZenML LLMOps Database, "Uber: LLM-Driven Developer Experience and Code Migrations at Scale" (2023, summarizing an Uber Developer Platform team talk) — <a href="https://www.zenml.io/llmops-database/llm-driven-developer-experience-and-code-migrations-at-scale" target="_blank">zenml.io/llmops-database</a> — AutoCover, Java-to-Kotlin migration, and the paused coding-assistant failure case.</li>
              <li><strong>[Tier 1]</strong> DPE Summit 2024, "This Year in Uber's AI-Driven Developer Productivity Revolution" — <a href="https://dpe.org/sessions/ty-smith-adam-huda/this-year-in-ubers-ai-driven-developer-productivity-revolution/" target="_blank">dpe.org/sessions</a> — corroborating session naming Uber's Developer Platform AI team and LangGraph adoption.</li>
            </ul>
            <p className="note">All FACT values above were opened and confirmed at their cited source. ESTIMATE values (LinkedIn quality-band subtraction; Uber migration-rate delta) are arithmetic derivations from cited FACTs, shown in place. No figure in this article was invented.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
