const {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ScatterChart,
  Scatter,
  ZAxis,
  Cell,
} = Recharts;

const sections = [
  { id: "intro", title: "Demo-to-ROI Gap", questionIds: ["intro-roi", "intro-case"] },
  { id: "background", title: "B2B Workflow AI", questionIds: ["background-adoption", "background-economics"] },
  { id: "rq1", title: "Where Economics Change", questionIds: ["rq1-workflow", "rq1-estimate"] },
  { id: "rq2", title: "What AI PMs Decide", questionIds: ["rq2-threshold", "rq2-case"] },
  { id: "rq3", title: "Why Value Fails", questionIds: ["rq3-failure", "rq3-metrics"] },
  { id: "summary", title: "Learning Summary", questionIds: [] },
  { id: "conclusion", title: "Workflow Economist", questionIds: ["conclusion-bridge"] },
];

const sourceLinks = [
  { label: "Generative AI at Work, Brynjolfsson, Li, and Raymond", url: "https://arxiv.org/abs/2304.11771" },
  { label: "Early Impacts of M365 Copilot", url: "https://arxiv.org/abs/2504.11443" },
  { label: "McKinsey State of AI 2025", url: "https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai" },
  { label: "Microsoft Work Trend Index 2024", url: "https://www.microsoft.com/en-us/worklab/work-trend-index/ai-at-work-is-here-now-comes-the-hard-part" },
  { label: "Snowflake FY2026 Form 10-K", url: "https://www.sec.gov/Archives/edgar/data/1640147/000164014726000008/snow-20260131.htm" },
  { label: "SaaS Metrics 2.0", url: "https://www.forentrepreneurs.com/saas-metrics-2-definitions-2/" },
  { label: "OpenAI API pricing", url: "https://openai.com/api/pricing/" },
  { label: "OpenAI production best practices", url: "https://platform.openai.com/docs/guides/production-best-practices" },
  { label: "OpenAI evaluation guidance", url: "https://platform.openai.com/docs/guides/evals" },
  { label: "NIST AI Risk Management Framework", url: "https://www.nist.gov/itl/ai-risk-management-framework" },
  { label: "NIST Generative AI Profile", url: "https://doi.org/10.6028/NIST.AI.600-1" },
  { label: "BLS national occupational employment and wage estimates", url: "https://www.bls.gov/oes/current/oes_nat.htm" },
  { label: "Anthropic Economic Index enterprise adoption report", url: "https://arxiv.org/abs/2511.15080" },
  { label: "Klarna AI assistant case study", url: "https://openai.com/customer-stories/klarna" },
  { label: "Nielsen Norman Group AI productivity analysis", url: "https://www.nngroup.com/articles/ai-tools-productivity-gains/" },
];

const chartNotes = {
  workflowValue: "Synthesized teaching scores based on the article evidence; not reported survey statistics.",
  decisionSurface: "Synthesized teaching scores based on reliability, automation, and workflow-risk reasoning; not reported survey statistics.",
  roiBridge: "Modeled scenario using explicit assumptions for tickets, time saved, adoption, quality review, and inference cost.",
  failureMode: "Synthesized failure-mode mix based on the article evidence; not reported survey statistics.",
  metricStack: "Synthesized metric-stack scores for teaching; not reported survey statistics.",
};

const workflowValueData = [
  { workflow: "Support replies", frequency: 88, cost: 58, fit: 84, label: "High volume, reviewable language work", sourceType: "synthesized" },
  { workflow: "Sales research", frequency: 72, cost: 64, fit: 76, label: "Information synthesis with human judgment", sourceType: "synthesized" },
  { workflow: "Invoice exceptions", frequency: 52, cost: 82, fit: 68, label: "Structured workflow with costly review", sourceType: "synthesized" },
  { workflow: "Legal redlines", frequency: 38, cost: 90, fit: 54, label: "High expertise, high reliability demand", sourceType: "synthesized" },
  { workflow: "Roadmap synthesis", frequency: 44, cost: 70, fit: 62, label: "Useful assistant, weak automation boundary", sourceType: "synthesized" },
  { workflow: "Executive decisions", frequency: 18, cost: 96, fit: 28, label: "High stakes, low automation fit", sourceType: "synthesized" },
];

const decisionSurfaceData = [
  { workflow: "FAQ deflection", reliability: 58, automation: 82, risk: 120, sourceType: "synthesized" },
  { workflow: "Support draft", reliability: 72, automation: 64, risk: 160, sourceType: "synthesized" },
  { workflow: "Invoice coding", reliability: 84, automation: 58, risk: 190, sourceType: "synthesized" },
  { workflow: "Contract clause review", reliability: 92, automation: 36, risk: 220, sourceType: "synthesized" },
  { workflow: "Incident response", reliability: 96, automation: 22, risk: 240, sourceType: "synthesized" },
];

const roiBridgeData = [
  { lever: "Gross time value", kind: "delta", value: 180000, delta: 180000, cumulative: 180000, sourceType: "modeled" },
  { lever: "Adoption haircut", kind: "delta", value: -54000, delta: -54000, cumulative: 126000, sourceType: "modeled" },
  { lever: "Quality review cost", kind: "delta", value: -22000, delta: -22000, cumulative: 104000, sourceType: "modeled" },
  { lever: "Inference cost", kind: "delta", value: -14000, delta: -14000, cumulative: 90000, sourceType: "modeled" },
  { lever: "Net annual value", kind: "total", value: 90000, delta: 0, cumulative: 90000, sourceType: "modeled" },
];

const failureModeData = [
  { cause: "Workflow mismatch", product: 34, model: 0, workflow: 0, gtm: 0, sourceType: "synthesized" },
  { cause: "Low adoption", product: 28, model: 0, workflow: 0, gtm: 0, sourceType: "synthesized" },
  { cause: "Reliability gaps", product: 0, model: 31, workflow: 0, gtm: 0, sourceType: "synthesized" },
  { cause: "No process change", product: 0, model: 0, workflow: 29, gtm: 0, sourceType: "synthesized" },
  { cause: "Weak pricing story", product: 0, model: 0, workflow: 0, gtm: 22, sourceType: "synthesized" },
];

const metricStackData = [
  { layer: "Model", evals: 92, product: 34, business: 12, customer: 18, sourceType: "synthesized" },
  { layer: "Product", evals: 66, product: 84, business: 46, customer: 52, sourceType: "synthesized" },
  { layer: "Business", evals: 38, product: 70, business: 88, customer: 74, sourceType: "synthesized" },
  { layer: "Customer value", evals: 28, product: 62, business: 82, customer: 92, sourceType: "synthesized" },
];

const questions = {
  "intro-roi": {
    id: "intro-roi",
    type: "A",
    mode: "numeric",
    prompt: "A support team handles 60,000 tickets per year. If AI saves 4 minutes per ticket for adopted workflows and fully loaded labor cost is $45 per hour, estimate the gross annual time value before adoption and review haircuts.",
    actual: 180000,
    min: 0,
    max: 300000,
    step: 5000,
    prefix: "$",
    suffix: "",
    explanation: "The estimate is 60,000 tickets x 4 minutes / 60 x $45 = $180,000. AI PMs create value by turning workflow time into a measurable economic claim before adjusting for adoption, quality, and compute costs.",
  },
  "intro-case": {
    id: "intro-case",
    type: "C",
    mode: "choice",
    case: true,
    prompt: "Case Prompt: A founder wants to add a chat assistant to a workflow product because competitors have one. Which AI PM response best creates value?",
    options: [
      "Start with the highest-cost workflow bottleneck and estimate whether AI changes time, quality, throughput, or revenue capture.",
      "Ship a general assistant quickly because visible AI increases perceived innovation.",
      "Pick the newest model and make the product roadmap follow its capabilities.",
      "Avoid AI until the model can complete every workflow without human review.",
    ],
    answer: 0,
    explanation: "The AI PM anchors on workflow economics. A visible AI surface creates value only if it changes a business or customer outcome that buyers care about.",
  },
  "background-adoption": {
    id: "background-adoption",
    type: "B",
    mode: "choice",
    prompt: "What does high employee AI usage but weaker enterprise workflow integration imply for B2B AI PMs?",
    options: [
      "Any AI feature will produce enterprise ROI if employees already use AI tools.",
      "Consumer-style chat UX is enough for most B2B workflow products.",
      "Adoption demand exists, but product value depends on governance, workflow fit, and measurable outcomes.",
      "Enterprise buyers mostly evaluate AI products by model size.",
    ],
    answer: 2,
    explanation: "Broad usage is a demand signal, not an ROI proof. The AI PM has to convert individual productivity into governed workflow value.",
  },
  "background-economics": {
    id: "background-economics",
    type: "D",
    mode: "numeric",
    prompt: "Customer-support AI productivity estimates often land in the teens rather than 40-50 percent. Estimate the productivity lift reported in the field study by Brynjolfsson, Li, and Raymond.",
    actual: 15,
    min: 0,
    max: 50,
    step: 1,
    prefix: "",
    suffix: "%",
    explanation: "The study found roughly a 15 percent average increase in issues resolved per hour. The AI PM lesson is that value was measured in task throughput, not demo quality.",
  },
  "rq1-workflow": {
    id: "rq1-workflow",
    type: "B",
    mode: "choice",
    prompt: "Based on the workflow value map, which workflow is the strongest near-term AI PM value candidate?",
    options: [
      "Executive decisions, because the cost of each decision is highest.",
      "Support replies, because volume, cost surface area, and reviewability line up.",
      "Legal redlines, because all expensive expertise should be fully automated first.",
      "Roadmap synthesis, because PMs are the target reader.",
    ],
    answer: 1,
    explanation: "The best first wedge is usually high-volume, expensive enough, and reviewable. High stakes alone do not make a good automation target.",
  },
  "rq1-estimate": {
    id: "rq1-estimate",
    type: "A",
    mode: "numeric",
    prompt: "If 50 percent of users adopt the workflow and 20 percent of the gross value is lost to review, quality, and inference costs, estimate net annual value from the $180,000 gross case.",
    actual: 72000,
    min: 0,
    max: 180000,
    step: 5000,
    prefix: "$",
    suffix: "",
    explanation: "$180,000 x 50 percent adoption x 80 percent retained value = $72,000. The adoption haircut is often the difference between a demo and a business case.",
  },
  "rq2-threshold": {
    id: "rq2-threshold",
    type: "D",
    mode: "choice",
    prompt: "A model is strong on routine support replies but weak on billing disputes. What should the AI PM most likely design?",
    options: [
      "Full automation for all tickets because average model performance is high.",
      "A hidden model response with no user-facing indication or audit trail.",
      "A launch gate based only on offline accuracy, with no adoption or escalation metrics.",
      "A confidence-aware assistant that drafts routine replies and routes risky billing disputes to human review.",
    ],
    answer: 3,
    explanation: "AI PM decisions live in thresholds, fallbacks, and user trust. Average performance is not enough when error cost varies by workflow segment.",
  },
  "rq2-case": {
    id: "rq2-case",
    type: "C",
    mode: "choice",
    case: true,
    prompt: "Case Prompt: Sales users like an AI account-research feature, but usage drops after week two. Which PM move is most value-oriented?",
    options: [
      "Increase the model context window before studying behavior.",
      "Add more generated text so the feature feels more capable.",
      "Instrument task completion, compare against the existing workflow, interview drop-off users, and redesign around the sales motion.",
      "Count initial activation as proof that the feature created value.",
    ],
    answer: 2,
    explanation: "The value problem is adoption inside a workflow. The PM needs product instrumentation and qualitative diagnosis before spending model budget.",
  },
  "rq3-failure": {
    id: "rq3-failure",
    type: "B",
    mode: "choice",
    prompt: "What is the common pattern behind most AI features that fail to create value?",
    options: [
      "They use human review too often.",
      "They optimize visible model behavior without changing the workflow, metric, or incentive that creates economic value.",
      "They start with a narrow workflow instead of a broad assistant.",
      "They measure customer outcomes instead of model benchmarks.",
    ],
    answer: 1,
    explanation: "The repeated failure is mistaking capability for value. AI PMs have to connect model behavior to workflow change and buyer economics.",
  },
  "rq3-metrics": {
    id: "rq3-metrics",
    type: "E",
    mode: "choice",
    prompt: "Which metric stack best connects evals to business value?",
    options: [
      "Token volume, model size, launch date, and number of AI-branded screens.",
      "Prompt length, number of generated words, and executive demo reactions.",
      "Offline benchmark score only, because product metrics can be noisy.",
      "Task success and escalation quality, then adoption, time saved, retained revenue, and customer outcome.",
    ],
    answer: 3,
    explanation: "Useful AI PM metrics form a chain from model quality to product behavior to business and customer outcomes.",
  },
  "conclusion-bridge": {
    id: "conclusion-bridge",
    type: "E",
    mode: "choice",
    prompt: "Given the article's evidence, where is the AI PM's most durable value created?",
    options: [
      "In choosing workflows where AI can change unit economics, then managing reliability, UX, adoption, and measurement.",
      "In knowing enough ML theory to replace the model team.",
      "In shipping AI surfaces before competitors do.",
      "In writing prompts that make demos feel polished.",
    ],
    answer: 0,
    explanation: "The AI PM is valuable because they connect capability to economics. The role is part product strategist, part workflow analyst, and part measurement designer.",
  },
};

function scoreNumeric(value, actual) {
  const estimate = Number(value);
  if (!Number.isFinite(estimate)) return 0;
  const pct = Math.abs(estimate - actual) / Math.max(Math.abs(actual), 1);
  if (pct <= 0.05) return 2;
  if (pct <= 0.15) return 1;
  return 0;
}

function maxPoints() {
  return Object.values(questions).reduce((sum, q) => sum + (q.mode === "numeric" ? 2 : 1), 0);
}

function questionMaxPoints(question) {
  return question.mode === "numeric" ? 2 : 1;
}

function totalPoints(questionState = {}) {
  return Object.values(questionState).reduce((sum, item) => sum + (item.points || 0), 0);
}

function answeredCount(questionState = {}) {
  return Object.values(questions).filter((question) => questionState[question.id]?.submitted).length;
}

function evaluateApplyIt(text) {
  const normalized = text.toLowerCase();
  const checks = [
    { keys: ["workflow", "process", "task"], message: "You anchored the recommendation in a workflow rather than a generic AI surface." },
    { keys: ["adoption", "usage", "rollout"], message: "You included adoption, which is necessary for ROI." },
    { keys: ["reliability", "accuracy", "fallback", "review"], message: "You identified reliability as a product requirement, not only a model property." },
    { keys: ["metric", "measure", "kpi", "outcome"], message: "You connected the idea to measurable outcomes." },
    { keys: ["cost", "roi", "revenue", "pricing", "economics"], message: "You considered cost or economics." },
    { keys: ["risk", "failure", "edge", "trust"], message: "You named a risk or failure mode." },
  ];
  const hits = checks.filter((item) => item.keys.some((key) => normalized.includes(key)));
  const strengths = hits.length
    ? hits.slice(0, 3).map((item) => item.message).join(" ")
    : "Your answer names a direction, but it needs a clearer workflow and value mechanism.";
  const strong = hits.length >= 4;
  const gap = strong
    ? "Strong answer. To make it sharper, quantify the before-and-after workflow baseline."
    : "Strengthen the answer by naming the user segment, workflow baseline, adoption path, and business metric.";
  return { text: `${strengths} ${gap}`, strong };
}

function pointsLabel(q, points) {
  if (q.mode === "numeric") {
    if (points === 2) return "Exact";
    if (points === 1) return "Close";
    return "Off";
  }
  return points === 1 ? "Correct" : "Incorrect";
}

function currentSectionComplete(section, questionState = {}, summarySubmitted = false) {
  if (section.id === "summary") return summarySubmitted;
  return section.questionIds.every((id) => questionState[id]?.submitted);
}

function isSectionUnlocked(index, questionState = {}, summarySubmitted = false) {
  if (index === 0) return true;
  for (let i = 0; i < index; i += 1) {
    if (!currentSectionComplete(sections[i], questionState, summarySubmitted)) return false;
  }
  return true;
}

function formatValue(value, prefix = "", suffix = "") {
  if (value === undefined || value === null || value === "") return "";
  const numeric = Number(value);
  const formatted = Number.isFinite(numeric) ? numeric.toLocaleString() : value;
  return `${prefix}${formatted}${suffix}`;
}

function chartTick(revealed) {
  return revealed ? undefined : () => "";
}

function HiddenTooltip({ active, payload, label, revealed, formatter }) {
  if (!active || !payload?.length) return null;
  if (!revealed) {
    return <div className="chart-tooltip">Answer the paired question to reveal exact values.</div>;
  }

  return (
    <div className="chart-tooltip">
      {label && <strong>{label}</strong>}
      {formatter ? formatter(payload) : payload.map((entry) => (
        <p key={entry.dataKey || entry.name}>
          {entry.name || entry.dataKey}: {entry.value}
        </p>
      ))}
    </div>
  );
}

function ChartFrame({ title, masked, note, previewLabels = false, children }) {
  return (
    <div className={`chart-block ${masked ? "chart-mask" : ""} ${previewLabels ? "chart-preview-labels" : ""}`}>
      <div className="chart-title">
        <h3>{title}</h3>
        <span className="masked-label">{masked ? "Exact values masked until you answer" : "Exact values revealed"}</span>
      </div>
      {children}
      {note && <p className="source-note">{note}</p>}
    </div>
  );
}

function Sources() {
  return (
    <div className="source-list">
      <h3>Sources</h3>
      {sourceLinks.map((source) => (
        <p key={source.url}>
          <a href={source.url} target="_blank" rel="noreferrer">
            {source.label}
          </a>
        </p>
      ))}
    </div>
  );
}

function LearningSummary({
  questionState = {},
  applyText,
  setApplyText,
  evaluation,
  setEvaluation,
  evaluatedApplyText,
  setEvaluatedApplyText,
  setSummarySubmitted,
  setCurrentSection,
}) {
  const summaryIndex = sections.findIndex((section) => section.id === "summary");
  const questionSectionIndex = (questionId) => sections.findIndex((section) => section.questionIds.includes(questionId));
  const preSummaryQuestions = Object.values(questions).filter((question) => questionSectionIndex(question.id) < summaryIndex);
  const typeRows = ["A", "B", "C", "D", "E"].map((type) => {
    const typedQuestions = preSummaryQuestions.filter((question) => question.type === type);
    const earned = typedQuestions.reduce((sum, question) => sum + (questionState[question.id]?.points || 0), 0);
    const possible = typedQuestions.reduce((sum, question) => sum + questionMaxPoints(question), 0);
    return { type, earned, possible };
  }).filter((row) => row.possible > 0);

  const missedQuestions = preSummaryQuestions.filter((question) => {
    const saved = questionState[question.id];
    return !saved?.submitted || (saved.points || 0) < questionMaxPoints(question);
  });

  const applyReady = applyText.trim().length >= 40;
  const hasCurrentEvaluation = evaluation && evaluatedApplyText === applyText;

  const submitApplyIt = () => {
    if (!applyReady) return;
    setEvaluation(evaluateApplyIt(applyText));
    setEvaluatedApplyText(applyText);
    setSummarySubmitted(true);
  };

  const updateApplyText = (value) => {
    setApplyText(value);
    if (evaluation || evaluatedApplyText) {
      setEvaluation("");
      setEvaluatedApplyText("");
      setSummarySubmitted(false);
    }
  };

  const findSectionIndex = (questionId) => {
    const index = questionSectionIndex(questionId);
    return index >= 0 ? index : 0;
  };

  return (
    <section className="article-section summary-panel">
      <div className="kicker">Learning summary</div>
      <h2>Turn the article into product judgment</h2>
      <p>
        Your score is less important than the chain of reasoning it tests: workflow baseline, adoption path, reliability threshold, measurable outcome, cost, and risk.
      </p>

      <div className="metric-grid" aria-label="Score by question type">
        {typeRows.map((row) => (
          <div className="metric-card" key={row.type}>
            <span>Type {row.type}</span>
            <strong>{row.earned} / {row.possible}</strong>
          </div>
        ))}
      </div>

      <div className="insight-grid">
        <div className="insight-card">
          <h3>Workflow first</h3>
          <p>AI PM value starts with a repeated workflow where time, quality, throughput, or revenue can change.</p>
        </div>
        <div className="insight-card">
          <h3>Reliability is product design</h3>
          <p>Thresholds, fallbacks, review paths, and trust cues determine whether model behavior becomes usable product behavior.</p>
        </div>
        <div className="insight-card">
          <h3>ROI needs adoption</h3>
          <p>A demo becomes a business case only when the team measures usage, retained value, cost, and customer outcomes.</p>
        </div>
      </div>

      <div className="apply-panel">
        <h3>Apply it</h3>
        <p>
          Recommend one AI feature for a B2B workflow product. Name the workflow, adoption path, reliability requirement, metric, cost or economic logic, and one risk.
        </p>
        <textarea
          className="text-area"
          aria-label="AI feature recommendation"
          value={applyText}
          rows={6}
          minLength={40}
          placeholder="Write at least 40 characters before requesting feedback."
          onChange={(event) => updateApplyText(event.target.value)}
        />
        <div className="submit-row">
          <span className="source-note">{Math.min(applyText.trim().length, 40)} / 40 characters</span>
          <button className="primary-btn" type="button" disabled={!applyReady} onClick={submitApplyIt}>
            Evaluate
          </button>
        </div>
        {hasCurrentEvaluation && (
          <div className={`feedback ${evaluation.strong ? "good" : "neutral"}`}>
            {evaluation.text}
          </div>
        )}
      </div>

      <div className="return-map">
        <h3>Return map</h3>
        {missedQuestions.length ? (
          <div className="missed-list">
            {missedQuestions.map((question) => (
              <button
                type="button"
                className="secondary-btn missed-link"
                key={question.id}
                onClick={() => setCurrentSection(findSectionIndex(question.id))}
              >
                {question.id}
              </button>
            ))}
          </div>
        ) : (
          <p className="source-note">No missed question IDs. Every submitted answer earned full credit.</p>
        )}
      </div>
    </section>
  );
}

function Question({ id, questionState = {}, setQuestionState, drafts = {}, setDrafts }) {
  const question = questions[id];
  if (!question) return null;

  const saved = questionState[id] || {};
  const submitted = Boolean(saved.submitted);
  const draftValue = drafts[id] ?? saved.answer ?? "";
  const isNumeric = question.mode === "numeric";
  const numericValue = Number(draftValue);
  const hasNumericDraft = draftValue !== "" && Number.isFinite(Number(draftValue));
  const canSubmit = isNumeric ? hasNumericDraft : draftValue !== "";
  const points = saved.points ?? 0;
  const actualPosition = isNumeric
    ? `${((question.actual - question.min) / (question.max - question.min)) * 100}%`
    : "50%";
  const estimatePosition = isNumeric && hasNumericDraft
    ? `${Math.min(100, Math.max(0, ((numericValue - question.min) / (question.max - question.min)) * 100))}%`
    : null;

  const updateDraft = (value) => {
    if (submitted) return;
    if (typeof setDrafts !== "function") return;
    setDrafts((current) => ({ ...current, [id]: value }));
  };

  const submit = () => {
    if (!canSubmit || submitted) return;
    if (typeof setQuestionState !== "function") return;
    const nextPoints = isNumeric
      ? scoreNumeric(draftValue, question.actual)
      : Number(draftValue) === question.answer ? 1 : 0;
    setQuestionState((current) => ({
      ...current,
      [id]: {
        answer: isNumeric ? Number(draftValue) : Number(draftValue),
        submitted: true,
        points: nextPoints,
      },
    }));
  };

  return (
    <div className={`question-card ${question.case ? "case" : ""}`}>
      <div className="question-meta">Question {question.type}</div>
      <p>{question.prompt}</p>

      {isNumeric ? (
        <>
          <div className="input-row">
            <span>{question.prefix}</span>
            <input
              className="number-input"
              aria-label={question.prompt}
              type="number"
              min={question.min}
              max={question.max}
              step={question.step}
              value={draftValue}
              disabled={submitted}
              onChange={(event) => updateDraft(event.target.value)}
            />
            <span>{question.suffix}</span>
            <button type="button" disabled={!canSubmit || submitted} onClick={submit}>
              Submit
            </button>
          </div>
          <div className="range-row">
            <input
              type="range"
              aria-label={`Estimate range: ${question.prompt}`}
              min={question.min}
              max={question.max}
              step={question.step}
              value={Number.isFinite(numericValue) ? numericValue : question.min}
              disabled={submitted}
              onChange={(event) => updateDraft(event.target.value)}
            />
          </div>
          <div className="estimate-axis">
            <span>{formatValue(question.min, question.prefix, question.suffix)}</span>
            {estimatePosition && <span className="pin estimate-pin" style={{ left: estimatePosition }}>You</span>}
            {submitted && <span className="pin actual-pin" style={{ left: actualPosition }}>Actual</span>}
            <span>{formatValue(question.max, question.prefix, question.suffix)}</span>
          </div>
        </>
      ) : (
        <>
          <div className="options">
            {question.options.map((option, index) => {
              const selected = Number(draftValue) === index;
              const correct = submitted && index === question.answer;
              const incorrect = submitted && selected && index !== question.answer;
              return (
                <button
                  className={`option ${selected ? "selected" : ""} ${correct ? "correct" : ""} ${incorrect ? "incorrect" : ""}`}
                  type="button"
                  key={option}
                  disabled={submitted}
                  onClick={() => updateDraft(String(index))}
                >
                  {option}
                </button>
              );
            })}
          </div>
          <button className="submit-button" type="button" disabled={!canSubmit || submitted} onClick={submit}>
            Submit
          </button>
        </>
      )}

      {submitted && (
        <div className={`feedback ${points > 0 ? "good" : "needs-work"}`}>
          <strong>{pointsLabel(question, points)}.</strong> {question.explanation}
        </div>
      )}
    </div>
  );
}

function WorkflowPoint({ cx, cy, fill = "#2563eb", size = 160, payload }) {
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) return null;
  const radius = Math.max(5, Math.min(14, Math.sqrt(size) / 2.8));

  return (
    <g className="workflow-point">
      <circle cx={cx} cy={cy} r={radius} fill={fill} opacity="0.84" />
      {payload?.workflow && (
        <text className="workflow-point-label" x={cx} y={cy - radius - 7} textAnchor="middle">
          {payload.workflow}
        </text>
      )}
    </g>
  );
}

function WorkflowValueChart({ revealed }) {
  return (
    <ChartFrame title="Workflow value map" masked={!revealed} note={chartNotes.workflowValue} previewLabels>
      <div className="chart-canvas">
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 12, right: 24, bottom: 24, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="frequency"
              name="Frequency"
              domain={[0, 100]}
              tickFormatter={chartTick(revealed)}
              label={revealed ? { value: "Workflow frequency", position: "insideBottom", offset: -12 } : undefined}
            />
            <YAxis
              type="number"
              dataKey="cost"
              name="Cost surface"
              domain={[0, 100]}
              tickFormatter={chartTick(revealed)}
              label={revealed ? { value: "Cost surface", angle: -90, position: "insideLeft" } : undefined}
            />
            <ZAxis type="number" dataKey="fit" range={[90, 420]} name="AI fit" />
            <Tooltip
              content={<HiddenTooltip revealed={revealed} formatter={(payload) => {
                const item = payload[0]?.payload;
                return (
                  <>
                    <strong>{item.workflow}</strong>
                    <p>Frequency: {item.frequency}</p>
                    <p>Cost surface: {item.cost}</p>
                    <p>AI fit: {item.fit}</p>
                  </>
                );
              }} />}
            />
            <Scatter data={workflowValueData} fill="#2563eb" shape={WorkflowPoint} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}

function DecisionSurfaceChart({ revealed }) {
  return (
    <ChartFrame title="Automation decision surface" masked={!revealed} note={chartNotes.decisionSurface}>
      <div className="chart-canvas">
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 12, right: 24, bottom: 24, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="reliability"
              name="Reliability need"
              domain={[40, 100]}
              tickFormatter={chartTick(revealed)}
              label={revealed ? { value: "Reliability need", position: "insideBottom", offset: -12 } : undefined}
            />
            <YAxis
              type="number"
              dataKey="automation"
              name="Automation fit"
              domain={[0, 100]}
              tickFormatter={chartTick(revealed)}
              label={revealed ? { value: "Automation fit", angle: -90, position: "insideLeft" } : undefined}
            />
            <ZAxis type="number" dataKey="risk" range={[110, 440]} name="Risk" />
            <Tooltip
              content={<HiddenTooltip revealed={revealed} formatter={(payload) => {
                const item = payload[0]?.payload;
                return (
                  <>
                    <strong>{item.workflow}</strong>
                    <p>Reliability need: {item.reliability}</p>
                    <p>Automation fit: {item.automation}</p>
                    <p>Workflow risk: {item.risk}</p>
                  </>
                );
              }} />}
            />
            <Scatter data={decisionSurfaceData} fill="#0891b2">
              {revealed && <LabelList dataKey="workflow" position="top" />}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}

function ROIBridgeChart({ revealed }) {
  const data = roiBridgeData.map((item, index) => {
    const previous = index === 0 ? 0 : roiBridgeData[index - 1].cumulative;
    if (item.kind === "total") {
      return { ...item, base: 0, amount: item.cumulative, displayValue: item.cumulative };
    }
    if (item.delta < 0) {
      return { ...item, base: item.cumulative, amount: Math.abs(item.delta), displayValue: item.delta };
    }
    return { ...item, base: previous, amount: item.delta, displayValue: item.delta };
  });

  return (
    <ChartFrame title="Modeled ROI bridge" masked={!revealed} note={chartNotes.roiBridge}>
      <div className="chart-canvas">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 18, right: 20, bottom: 56, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="lever" tickFormatter={revealed ? undefined : () => ""} angle={revealed ? -24 : 0} textAnchor={revealed ? "end" : "middle"} interval={0} />
            <YAxis tickFormatter={revealed ? (value) => `$${Number(value).toLocaleString()}` : () => ""} />
            <Tooltip
              content={<HiddenTooltip revealed={revealed} formatter={(payload) => {
                const item = payload[0]?.payload;
                const label = item.kind === "total" ? "Net annual value" : "Contribution";
                return (
                  <>
                    <strong>{item.lever}</strong>
                    <p>{label}: {formatValue(item.displayValue, "$")}</p>
                    <p>Cumulative: {formatValue(item.cumulative, "$")}</p>
                  </>
                );
              }} />}
            />
            <Bar dataKey="base" stackId="waterfall" fill="transparent" isAnimationActive={false} />
            <Bar dataKey="amount" stackId="waterfall" name="Contribution">
              {data.map((item) => (
                <Cell
                  key={item.lever}
                  fill={item.kind === "total" ? "#16a34a" : item.displayValue >= 0 ? "#2563eb" : "#dc2626"}
                />
              ))}
              {revealed && <LabelList dataKey="displayValue" formatter={(value) => value ? formatValue(value, "$") : ""} position="top" />}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}

function FailureModeChart({ revealed }) {
  return (
    <ChartFrame title="Why AI features miss value" masked={!revealed} note={chartNotes.failureMode}>
      <div className="chart-canvas">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={failureModeData} margin={{ top: 18, right: 20, bottom: 48, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="cause" tickFormatter={revealed ? undefined : () => ""} angle={revealed ? -18 : 0} textAnchor={revealed ? "end" : "middle"} interval={0} />
            <YAxis tickFormatter={chartTick(revealed)} />
            <Tooltip content={<HiddenTooltip revealed={revealed} />} />
            <Legend />
            <Bar dataKey="product" stackId="failure" name="Product" fill="#2563eb" />
            <Bar dataKey="model" stackId="failure" name="Model" fill="#0891b2" />
            <Bar dataKey="workflow" stackId="failure" name="Workflow" fill="#16a34a" />
            <Bar dataKey="gtm" stackId="failure" name="GTM" fill="#f59e0b">
              {revealed && <LabelList position="top" />}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}

function MetricStackChart({ revealed }) {
  return (
    <ChartFrame title="Metric stack from evals to customer value" masked={!revealed} note={chartNotes.metricStack}>
      <div className="chart-canvas">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={metricStackData} margin={{ top: 18, right: 20, bottom: 36, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="layer" tickFormatter={revealed ? undefined : () => ""} />
            <YAxis tickFormatter={chartTick(revealed)} />
            <Tooltip content={<HiddenTooltip revealed={revealed} />} />
            <Legend />
            <Bar dataKey="evals" name="Model evals" fill="#2563eb" />
            <Bar dataKey="product" name="Product behavior" fill="#0891b2" />
            <Bar dataKey="business" name="Business value" fill="#16a34a" />
            <Bar dataKey="customer" name="Customer outcome" fill="#f59e0b">
              {revealed && <LabelList position="top" />}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartFrame>
  );
}

function ArticleSection({ id, questionState = {}, setQuestionState, drafts = {}, setDrafts }) {
  const questionProps = { questionState, setQuestionState, drafts, setDrafts };
  const revealed = Object.fromEntries(
    Object.keys(questions).map((questionId) => [questionId, Boolean(questionState[questionId]?.submitted)])
  );

  if (id === "intro") {
    return (
      <section className="article-section">
        <div className="kicker">Interactive research note</div>
        <h1>Where Is Value Created by an AI Product Manager?</h1>
        <p>
          AI Product Managers create value when they find B2B workflows where AI changes the economics of work, then translate that opportunity into reliable product behavior, adoption, and measurable ROI.
        </p>
        <p>
          This article asks three research questions: where AI PMs find economic leverage, what decisions are uniquely AI-product decisions, and why AI features fail to create value.
        </p>
        <div className="kicker">Research question</div>
        <h2>From demo delight to measured ROI</h2>
        <p>
          The AI Product Manager creates value by choosing workflows where model capability changes the economics of work, then proving the change through adoption, quality, cost, and revenue metrics. The modeled bridge below uses OpenAI pricing only as a pricing anchor, with explicit assumptions for time saved, adoption, review cost, and inference cost; it is not a reported ROI statistic (OpenAI, 2026).
        </p>
        <p>
          This distinction matters because AI cost sits inside product economics. Snowflake's FY2026 10-K reported 72 percent product gross margin, 125 percent net revenue retention, and product revenue costs that include cloud infrastructure, GPUs, and AI inference; that is a benchmark example, not a universal SaaS norm (Snowflake, 2026). SaaS Metrics 2.0 likewise treats gross margin as part of LTV/CAC thinking and defines NRR as including expansion revenue (SaaS Metrics 2.0).
        </p>
        <ROIBridgeChart revealed={revealed["intro-roi"]} />
        <Question id="intro-roi" {...questionProps} />
        <Question id="intro-case" {...questionProps} />
      </section>
    );
  }

  if (id === "background") {
    return (
      <section className="article-section">
        <div className="kicker">Background</div>
        <h2>B2B AI is adopted faster than it is scaled</h2>
        <p>
          McKinsey's State of AI 2025 is the primary adoption and scaling source here: 88 percent of respondents reported regular AI use in at least one business function, while about one-third said their organizations had begun scaling AI; the survey was fielded June 25-July 29, 2025, with 1,993 respondents across 105 nations (McKinsey, 2025).
        </p>
        <p>
          Microsoft reported that 75 percent of knowledge workers used AI at work, 78 percent brought their own AI tools, and 59 percent of leaders worried about quantifying gains, based on 31,000 workers across 31 markets (Microsoft Work Trend Index, 2024). That gap between use and measured value is the AI PM's operating space.
        </p>
        <Question id="background-adoption" {...questionProps} />
        <Question id="background-economics" {...questionProps} />
      </section>
    );
  }

  if (id === "rq1") {
    return (
      <section className="article-section">
        <div className="kicker">Research question 1</div>
        <h2>Where do AI PMs find economic leverage?</h2>
        <p>
          The strongest empirical signal comes from workflow-level measurement. Brynjolfsson, Li, and Raymond found that an AI assistant increased customer-support productivity by about 15 percent on average, measured as issues resolved per hour, across 5,172 support agents; the paper was revised November 6, 2024 (Brynjolfsson et al., 2024).
        </p>
        <p>
          Microsoft-affiliated workflow evidence from Early Impacts of M365 Copilot is narrower than an independent market benchmark but stronger than a demo claim: across 6,000-plus workers at 56 firms, Copilot users spent 0.5 hour less reading email per week, completed documents 12 percent faster, and nearly 40 percent used Copilot regularly over six months (Microsoft, 2025).
        </p>
        <WorkflowValueChart revealed={revealed["rq1-workflow"]} />
        <Question id="rq1-workflow" {...questionProps} />
        <Question id="rq1-estimate" {...questionProps} />
      </section>
    );
  }

  if (id === "rq2") {
    return (
      <section className="article-section">
        <div className="kicker">Research question 2</div>
        <h2>What decisions are uniquely AI-product decisions?</h2>
        <p>
          AI PMs decide where the product should automate, assist, escalate, or refuse. OpenAI production and evaluation guidance broadly emphasizes evaluation, graders or test criteria, production checks, guardrails, observability, accuracy, cost, and safety; those practices turn model behavior into launchable product behavior (OpenAI, 2026).
        </p>
        <p>
          NIST's AI Risk Management Framework and Generative AI Profile are useful for risk, reliability, trustworthiness, and generative-AI risk categories. They should inform product judgment, but they are not product metrics by themselves (NIST, 2023; NIST, 2024).
        </p>
        <DecisionSurfaceChart revealed={revealed["rq2-threshold"]} />
        <Question id="rq2-threshold" {...questionProps} />
        <Question id="rq2-case" {...questionProps} />
      </section>
    );
  }

  if (id === "rq3") {
    return (
      <section className="article-section">
        <div className="kicker">Research question 3</div>
        <h2>Why do AI features fail to create value?</h2>
        <p>
          AI value can fail even when the model looks impressive: the workflow may be wrong, adoption may fade, reliability may require too much review, or the pricing story may not capture the value created. NIST frames this as a trustworthiness and risk-management problem, while product teams must translate those risks into workflow metrics and operating controls (NIST, 2023; NIST, 2024).
        </p>
        <p>
          Vendor case studies can illustrate possibilities without proving causality. The Klarna and OpenAI case is useful as an example of a customer and vendor describing an AI assistant deployment, but it should not be treated as causal proof for every workflow or buyer context (OpenAI/Klarna, 2024).
        </p>
        <FailureModeChart revealed={revealed["rq3-failure"]} />
        <Question id="rq3-failure" {...questionProps} />
        <MetricStackChart revealed={revealed["rq3-metrics"]} />
        <Question id="rq3-metrics" {...questionProps} />
      </section>
    );
  }

  if (id === "conclusion") {
    return (
      <section className="article-section">
        <div className="kicker">Conclusion</div>
        <h2>The AI PM is a workflow economist</h2>
        <p>
          The durable value is not a chat surface, a model upgrade, or a launch announcement. It is the discipline of finding a valuable workflow, setting reliability and escalation rules, measuring adoption and outcome change, and keeping cost inside the unit economics (Brynjolfsson et al., 2024; McKinsey, 2025; OpenAI, 2026).
        </p>
        <p>
          The role sits between product strategy, workflow analysis, risk management, and measurement design. That is why the AI PM's value is highest when they can connect model behavior to customer outcomes and business economics.
        </p>
        <Question id="conclusion-bridge" {...questionProps} />
        <Sources />
      </section>
    );
  }

  return null;
}

function App() {
  const [currentSection, setCurrentSection] = React.useState(0);
  const [questionState, setQuestionState] = React.useState({});
  const [drafts, setDrafts] = React.useState({});
  const [applyText, setApplyText] = React.useState("");
  const [evaluation, setEvaluation] = React.useState("");
  const [evaluatedApplyText, setEvaluatedApplyText] = React.useState("");
  const [summarySubmitted, setSummarySubmitted] = React.useState(false);

  const section = sections[currentSection];
  const score = totalPoints(questionState);
  const answered = answeredCount(questionState);
  const progress = ((currentSection + 1) / sections.length) * 100;
  const canGoBack = currentSection > 0;
  const canGoForward = currentSection < sections.length - 1
    && isSectionUnlocked(currentSection + 1, questionState, summarySubmitted);

  const goToSection = (index) => {
    if (!isSectionUnlocked(index, questionState, summarySubmitted)) return;
    setCurrentSection(index);
  };

  return (
    <>
      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <header className="topbar">
        <div>
          <strong>{section.title}</strong>
          <div className="source-note">Sources refreshed for 2024-2026 evidence where available.</div>
        </div>
        <div className="status">
          <span className="pill">{answered} / {Object.keys(questions).length} answered</span>
          <span className="pill">{score} / {maxPoints()} points</span>
        </div>
      </header>
      <main className="shell">
        <nav className="section-map" aria-label="Sections">
          {sections.map((item, index) => {
            const unlocked = isSectionUnlocked(index, questionState, summarySubmitted);
            return (
              <button
                type="button"
                key={item.id}
                className={`section-tab ${index === currentSection ? "active" : ""} ${unlocked ? "" : "locked"}`}
                disabled={!unlocked}
                onClick={() => goToSection(index)}
              >
                {index + 1}. {item.title}
              </button>
            );
          })}
        </nav>
        <article className="article-column">
          {section.id === "summary" ? (
            <LearningSummary
              questionState={questionState}
              applyText={applyText}
              setApplyText={setApplyText}
              evaluation={evaluation}
              setEvaluation={setEvaluation}
              evaluatedApplyText={evaluatedApplyText}
              setEvaluatedApplyText={setEvaluatedApplyText}
              setSummarySubmitted={setSummarySubmitted}
              setCurrentSection={setCurrentSection}
            />
          ) : (
            <ArticleSection
              id={section.id}
              questionState={questionState}
              setQuestionState={setQuestionState}
              drafts={drafts}
              setDrafts={setDrafts}
            />
          )}
          <div className="nav-row">
            <button className="secondary-btn" type="button" disabled={!canGoBack} onClick={() => setCurrentSection(currentSection - 1)}>
              Previous
            </button>
            <button className="primary-btn" type="button" disabled={!canGoForward} onClick={() => setCurrentSection(currentSection + 1)}>
              Next
            </button>
          </div>
        </article>
      </main>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
