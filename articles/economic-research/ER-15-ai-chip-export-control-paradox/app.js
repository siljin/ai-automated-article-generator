/* ============================================================================
   The Chip Embargo Paradox — an interactive research article
   Domain: Technology & AI
   ============================================================================ */

const { useState, useEffect, useRef, useMemo } = React;
const {
  LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine, Cell, LabelList,
} = Recharts;

/* ----------------------------------------------------------------------------
   SOURCES
---------------------------------------------------------------------------- */
const SOURCES = [
  { id: "brookings2026", label: "Mark MacCarthy, “Ball game’s over—the US is out of the AI chip market in China,” Brookings, Jun. 17, 2026", url: "https://www.brookings.edu/articles/ball-games-over-the-us-is-out-of-the-ai-chip-market-in-china/" },
  { id: "dsv3", label: "DeepSeek-AI, “DeepSeek-V3 Technical Report,” arXiv:2412.19437, Dec. 2024", url: "https://arxiv.org/abs/2412.19437" },
  { id: "dsr1", label: "DeepSeek-AI, “DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning,” arXiv:2501.12948, Jan. 2025", url: "https://arxiv.org/abs/2501.12948" },
  { id: "epoch2025", label: "Ege Erdil, “What went into training DeepSeek-R1?” Epoch AI Gradient Updates, Jan. 31, 2025", url: "https://epoch.ai/gradient-updates/what-went-into-training-deepseek-r1" },
  { id: "cnbcsemi2025", label: "CNBC, “DeepSeek’s hardware spend could be as high as $500 million,” Jan. 31, 2025 (citing SemiAnalysis)", url: "https://www.cnbc.com/2025/01/31/deepseeks-hardware-spend-could-be-as-high-as-500-million-report.html" },
  { id: "forbes2025", label: "Forbes, “Biggest Market Loss In History: Nvidia Stock Sheds Nearly $600 Billion As DeepSeek Shakes AI Darling,” Jan. 27, 2025", url: "https://www.forbes.com/sites/dereksaul/2025/01/27/biggest-market-loss-in-history-nvidia-stock-sheds-nearly-600-billion-as-deepseek-shakes-ai-darling/" },
  { id: "nvdaq1fy26", label: "NVIDIA Corporation, “Financial Results for First Quarter Fiscal 2026” (SEC 8-K Ex-99.1), May 28, 2025", url: "https://www.sec.gov/Archives/edgar/data/1045810/000104581025000115/q1fy26pr.htm" },
  { id: "nvdaq1fy27", label: "NVIDIA Newsroom, “Financial Results for First Quarter Fiscal 2027,” May 20, 2026", url: "https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-first-quarter-fiscal-2027" },
  { id: "fortune2024", label: "Fortune, “Nvidia earnings: China drops to mid-single-digit share of data center revenue,” Feb. 22, 2024", url: "https://fortune.com/asia/2024/02/22/nvidia-earnings-shares-china-drops-mid-single-digit-data-center-revenue-biden-chip-controls/" },
  { id: "nvda10k", label: "NVIDIA Corporation, Form 10-K filings FY2023–FY2026 (China/Hong Kong revenue disclosure), SEC EDGAR", url: "https://bullfincher.io/companies/nvidia-corporation/revenue-by-geography" },
  { id: "cnbc2026chinese", label: "CNBC, “Chinese AI models are gaining ground with U.S. companies as OpenAI, Anthropic costs surge,” Jul. 7, 2026", url: "https://www.cnbc.com/2026/07/07/chinese-ai-models-costs-us-openai-anthropic.html" },
  { id: "scmp2026", label: "Eunice Xu, “The great chip leap: China’s semiconductor equipment self-reliance surges past targets,” South China Morning Post, Jan. 9, 2026", url: "https://www.scmp.com/tech/big-tech/article/3339366/great-chip-leap-chinas-semiconductor-equipment-self-reliance-surges-past-targets" },
  { id: "bloomberghuawei", label: "Bloomberg (widely reported), Huawei Ascend 910C production plans, Sep.–Oct. 2025", url: "https://www.webpronews.com/huawei-to-double-ascend-910c-ai-chip-output-to-600000-in-2026-rivaling-nvidia/" },
  { id: "altman2023", label: "Sam Altman remarks on GPT-4 training cost (“more than $100 million”), reported 2023", url: "https://news.ycombinator.com/item?id=35971363" },
  { id: "aiindex", label: "Stanford HAI, AI Index Report — GPT-4 compute-cost estimate (~$78 million)", url: "https://aiindex.stanford.edu/report/" },
  { id: "apipricing", label: "OpenAI and DeepSeek official API pricing pages (o1; R1), accessed 2026", url: "https://openrouter.ai/deepseek/deepseek-r1" },
];

const src = (id) => {
  const s = SOURCES.find((x) => x.id === id);
  return s ? s.label.split(",")[0].replace(/“.*/, "").trim() : id;
};

/* ----------------------------------------------------------------------------
   GLOSSARY (per page)
---------------------------------------------------------------------------- */
const GLOSSARY = {
  warmup: [
    { term: "Rebound effect", def: "When cutting the cost of something leads people to use more of it, offsetting some or all of the expected savings." },
    { term: "Economic incidence", def: "Who actually ends up bearing a cost in practice — different from who formally pays it (legal incidence)." },
    { term: "Self-reported metric", def: "A performance number supplied by the same party being measured, without independent, outside verification." },
  ],
  intro: [
    { term: "Export controls", def: "Government rules that block or restrict selling certain products — here, advanced computer chips — to certain countries or buyers." },
    { term: "Frontier model", def: "One of the most capable AI systems available at a given time, at or near the industry's cutting edge." },
    { term: "Compute", def: "Computing power — usually measured here in GPU-hours, the number of specialized chips multiplied by how long they ran." },
  ],
  background: [
    { term: "H20 / H200", def: "Nvidia chip models: the H20 was designed to comply with 2023-era export rules; the H200 is more powerful and was restricted, then partly allowed, later." },
    { term: "Data Center revenue", def: "The part of Nvidia's sales that comes from chips and systems bought by cloud companies and enterprises to run AI, as opposed to gaming or car chips." },
    { term: "Fiscal year (FY)", def: "A company's own 12-month accounting year; Nvidia's fiscal year ends in late January, so “FY2026” mostly covers calendar 2025." },
  ],
  rq1: [
    { term: "Benchmark", def: "A standard test used to score an AI model's ability on a specific task, like math problems or coding contests." },
    { term: "Pass@1", def: "The percentage of test questions a model gets right on its very first try, with no retries." },
    { term: "Token", def: "A small chunk of text (often a word piece) that an AI model reads or writes; API prices are usually quoted per million tokens." },
    { term: "Open-weight model", def: "An AI model whose underlying numerical parameters are published, so anyone can download and run it themselves." },
  ],
  rq2: [
    { term: "Year-over-year (YoY)", def: "A comparison between a period (like a quarter) and the same period one year earlier." },
    { term: "Charge / write-off", def: "A one-time reduction a company books to its profits to reflect inventory or commitments that turned out to be worth less than expected." },
    { term: "Guidance", def: "A company's own forecast of its financial results for an upcoming quarter, given to investors." },
  ],
  rq3: [
    { term: "Enterprise adoption", def: "The rate at which businesses (as opposed to individual consumers) start using a product or technology." },
    { term: "Semiconductor equipment self-sufficiency", def: "The share of the machines used to make chips that a country's own companies supply, instead of importing them." },
    { term: "Foundry", def: "A factory that manufactures chips designed by other companies." },
  ],
};

/* ----------------------------------------------------------------------------
   SMALL SHARED UI PIECES
---------------------------------------------------------------------------- */
function FactTag({ tier }) {
  const cls = tier === "FACT" ? "tag tag-fact" : tier === "ESTIMATE" ? "tag tag-estimate" : "tag tag-illustration";
  return <span className={cls}>{tier}</span>;
}

function ChartNote({ children }) {
  return <p className="chart-note">{children}</p>;
}

function GlossaryPanel({ pageKey }) {
  const items = GLOSSARY[pageKey];
  if (!items || items.length === 0) return null;
  return (
    <div className="glossary-panel">
      <div className="glossary-label">Glossary</div>
      {items.map((g, i) => (
        <p key={i} className="glossary-item"><strong>{g.term}</strong> — {g.def}</p>
      ))}
    </div>
  );
}

/* Chart interpretation: two gated free-text prompts beneath a chart */
function ChartInterpretation({ chartId, prompts, state, onSubmit }) {
  return (
    <div className="interp-block">
      {prompts.map((p, idx) => {
        const key = `${chartId}-ip${idx}`;
        const st = state[key] || { submitted: false, text: "" };
        return (
          <div className="interp-row" key={key}>
            <div className="interp-kind">{p.kind}</div>
            <p className="interp-prompt">{p.prompt}</p>
            {!st.submitted && (
              <InterpForm
                onSubmit={(text) => onSubmit(key, text)}
              />
            )}
            {st.submitted && (
              <div className="interp-answer-box">
                <p className="interp-yours"><strong>Your answer:</strong> {st.text}</p>
                <div className="authored-answer">
                  <div className="authored-label">Compare your answer to the authored one</div>
                  <p>{p.authored}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function InterpForm({ onSubmit }) {
  const [text, setText] = useState("");
  const tooShort = text.trim().length < 15;
  return (
    <div className="interp-form">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write at least 15 characters before the authored answer unlocks…"
        rows={2}
      />
      <button className="btn-secondary" disabled={tooShort} onClick={() => onSubmit(text)}>
        Submit answer
      </button>
    </div>
  );
}

/* Multiple choice question (Types A/B/C/E and warm-up) */
function MCQuestion({ q, state, onAnswer, consulting }) {
  const st = state[q.id] || { selected: null, submitted: false };
  const letters = ["A", "B", "C", "D"];
  return (
    <div className={consulting ? "question-card consulting-case" : "question-card"}>
      {consulting && <div className="case-label">Case Prompt</div>}
      <div className="q-type-tag">{q.typeLabel}</div>
      <p className="q-prompt">{q.prompt}</p>
      <div className="options">
        {q.options.map((opt, i) => {
          let cls = "option";
          if (st.submitted) {
            if (i === q.correct) cls += " option-correct";
            else if (i === st.selected) cls += " option-wrong";
          } else if (st.selected === i) {
            cls += " option-selected";
          }
          return (
            <div
              key={i}
              className={cls}
              onClick={() => !st.submitted && onAnswer(q.id, "select", i)}
            >
              <span className="option-letter">{letters[i]}</span>
              <span>{opt}</span>
            </div>
          );
        })}
      </div>
      {!st.submitted && (
        <button
          className="btn-primary"
          disabled={st.selected === null || st.selected === undefined}
          onClick={() => onAnswer(q.id, "submit")}
        >
          Submit
        </button>
      )}
      {st.submitted && (
        <div className="explanation">
          <p className={st.selected === q.correct ? "calib-correct" : "calib-wrong"}>
            {st.selected === q.correct
              ? "Correct — this confirms the transferable pattern below."
              : `Incorrect — ${q.misconceptions[st.selected]}`}
          </p>
          <p className="explanation-body">{q.explanation}</p>
          <p className="principle-tag">Principle: {q.principle}</p>
          <p className="generalizes-tag">Where this generalizes: {q.generalizes}</p>
        </div>
      )}
    </div>
  );
}

/* Numeric (Type D) estimation question */
function NumericQuestion({ q, state, onAnswer }) {
  const st = state[q.id] || { value: "", submitted: false };
  const [val, setVal] = useState(st.value || "");
  const isCorrect = (v) => {
    const n = parseFloat(v);
    if (isNaN(n)) return false;
    if (q.toleranceType === "band") return n >= q.low && n <= q.high;
    return false;
  };
  return (
    <div className="question-card numeric-card">
      <div className="q-type-tag">Type D — Quantitative Estimation {q.openEnded ? "(open-ended)" : ""}</div>
      <p className="q-prompt">{q.prompt}</p>
      <p className="tolerance-note">{q.toleranceNote}</p>
      {!st.submitted && (
        <div className="numeric-input-row">
          <input
            type="number"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder={q.placeholder}
          />
          <span className="numeric-unit">{q.unit}</span>
          <button
            className="btn-primary"
            disabled={val === ""}
            onClick={() => onAnswer(q.id, parseFloat(val), isCorrect(val))}
          >
            Submit
          </button>
        </div>
      )}
      {st.submitted && (
        <div className="explanation">
          <p className={st.correct ? "calib-correct" : "calib-wrong"}>
            Your estimate: {st.value} {q.unit}. Actual: {q.actualLabel}.{" "}
            {st.correct ? "Within tolerance — correct." : "Outside tolerance — see the decomposition below."}
          </p>
          <div className="how-to-estimate">
            <div className="hte-label">How to estimate this</div>
            <p>{q.howTo}</p>
          </div>
          {q.principle && <p className="principle-tag">Principle: {q.principle}</p>}
          {q.generalizes && <p className="generalizes-tag">Where this generalizes: {q.generalizes}</p>}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   CHARTS
---------------------------------------------------------------------------- */

function Chart1_RevenueShare() {
  const data = [
    { fy: "FY2023", dollars: 5.785, share: 21.4 },
    { fy: "FY2024", dollars: 10.31, share: 16.92 },
    { fy: "FY2025", dollars: 17.11, share: 13.11 },
    { fy: "FY2026", dollars: 19.68, share: 9.11 },
  ];
  return (
    <div className="chart-wrap">
      <div className="chart-title">Nvidia's China revenue: dollars keep rising, share keeps falling <FactTag tier="FACT" /></div>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 10, right: 40, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="fy" />
          <YAxis yAxisId="left" label={{ value: "China revenue ($B)", angle: -90, position: "insideLeft" }} />
          <YAxis yAxisId="right" orientation="right" label={{ value: "Share of total revenue (%)", angle: 90, position: "insideRight" }} domain={[0, 25]} />
          <Tooltip formatter={(v, n) => (String(n).indexOf("Share") === 0 ? `${v}%` : `$${v}B`)} />
          <Legend />
          <Bar yAxisId="left" dataKey="dollars" name="China revenue ($B)" fill="#93c5fd">
            <LabelList dataKey="dollars" position="top" formatter={(v) => `$${v}B`} />
          </Bar>
          <Line yAxisId="right" type="monotone" dataKey="share" name="Share of total revenue (%)" stroke="#1d4ed8" strokeWidth={3} dot={{ r: 5 }}>
            <LabelList dataKey="share" position="top" formatter={(v) => `${v}%`} />
          </Line>
        </ComposedChart>
      </ResponsiveContainer>
      <ChartNote>Source: Nvidia Form 10-K filings, fiscal years 2023–2026 ({src("nvda10k")}, {src("fortune2024")}). China figures include Hong Kong. FY2026 ended Jan. 25, 2026.</ChartNote>
    </div>
  );
}

function Chart2_DCBridge() {
  const rows = [
    { name: "Q1 FY26\nData Center total", base: 0, value: 39.1, kind: "total" },
    { name: "China's contribution\nexits", base: 34.5, value: 4.6, kind: "down" },
    { name: "Rest-of-world DC\ngrowth (est.)", base: 34.5, value: 40.7, kind: "up" },
    { name: "Q1 FY27\nData Center total", base: 0, value: 75.2, kind: "total" },
  ];
  const colors = { total: "#1d4ed8", down: "#f87171", up: "#86efac" };
  return (
    <div className="chart-wrap">
      <div className="chart-title">How Nvidia's Data Center revenue grew to $75.2B even as China's slice went to zero <FactTag tier="FACT" /><FactTag tier="ESTIMATE" /></div>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={rows} margin={{ top: 20, right: 30, left: 10, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="name" interval={0} tick={{ fontSize: 11 }} height={60} />
          <YAxis label={{ value: "$ billions", angle: -90, position: "insideLeft" }} />
          <Tooltip formatter={(v) => `$${v}B`} />
          <Bar dataKey="base" stackId="a" fill="transparent" />
          <Bar dataKey="value" stackId="a">
            {rows.map((r, i) => (
              <Cell key={i} fill={colors[r.kind]} />
            ))}
            <LabelList dataKey="value" position="top" formatter={(v) => `$${v}B`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <ChartNote>
        FACT: Q1 FY26 and Q1 FY27 Data Center totals ($39.1B, $75.2B) and China's Q1 FY26 contribution ($4.6B, pre-restriction) are reported figures ({src("nvdaq1fy26")}, {src("nvdaq1fy27")}).
        ESTIMATE: “Rest-of-world DC growth” ($40.7B) is derived by subtraction ($75.2B − [$39.1B − $4.6B]) and is not itself a reported line item.
      </ChartNote>
    </div>
  );
}

function Chart3_CostGap() {
  const rows = [
    { metric: "Training cost ($M, log scale)", low: 5.6, high: 100, lowLabel: "DeepSeek-V3: $5.6M", highLabel: "GPT-4 class: >$100M" },
    { metric: "Output token price ($/M tokens)", low: 2.19, high: 60, lowLabel: "DeepSeek R1: $2.19", highLabel: "OpenAI o1: $60" },
  ];
  return (
    <div className="chart-wrap">
      <div className="chart-title">The cost gap: DeepSeek vs. a frontier US model <FactTag tier="FACT" /></div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart layout="vertical" data={rows} margin={{ top: 10, right: 60, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis type="number" scale="log" domain={[1, 150]} allowDataOverflow ticks={[1, 5, 10, 50, 100]} />
          <YAxis type="category" dataKey="metric" width={190} tick={{ fontSize: 12 }} />
          <Tooltip />
          {rows.map((r, i) => (
            <ReferenceLine key={i} segment={[{ x: r.low, y: r.metric }, { x: r.high, y: r.metric }]} stroke="#999" />
          ))}
          <Scatter dataKey="low" fill="#1d4ed8" name="DeepSeek" />
          <Scatter dataKey="high" fill="#f97316" name="OpenAI-equivalent" />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="dumbbell-legend">
        <span><span className="dot dot-blue" /> DeepSeek (V3 training cost; R1 token price)</span>
        <span><span className="dot dot-orange" /> OpenAI-equivalent (GPT-4-class training cost; o1 token price)</span>
      </div>
      <ChartNote>
        Training cost: DeepSeek-V3 $5.576M using 2.788M H800 GPU-hours ({src("dsv3")}); GPT-4 “more than $100 million” per OpenAI's CEO ({src("altman2023")}; independent Stanford estimate ~$78M, {src("aiindex")}).
        Token price: DeepSeek R1 $2.19 / OpenAI o1 $60 per million output tokens ({src("epoch2025")}, {src("apipricing")}). Log scale used because the two ends differ by more than an order of magnitude.
      </ChartNote>
    </div>
  );
}

function Chart4_BenchmarkDots() {
  const rows = [
    { bench: "AIME 2024 (Pass@1)", r1: 79.8, o1: 79.2 },
    { bench: "MATH-500 (Pass@1)", r1: 97.3, o1: 96.4 },
    { bench: "Codeforces (percentile)", r1: 96.3, o1: 96.6 },
    { bench: "MMLU (Pass@1)", r1: 90.8, o1: 91.8 },
    { bench: "GPQA Diamond (Pass@1)", r1: 71.5, o1: 75.7 },
  ];
  return (
    <div className="chart-wrap">
      <div className="chart-title">Benchmark parity: DeepSeek-R1 vs. OpenAI o1 <FactTag tier="FACT" /></div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart layout="vertical" data={rows} margin={{ top: 10, right: 40, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis type="number" domain={[60, 100]} unit="%" />
          <YAxis type="category" dataKey="bench" width={170} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Scatter dataKey="r1" fill="#1d4ed8" name="DeepSeek-R1" />
          <Scatter dataKey="o1" fill="#f97316" name="OpenAI o1-1217" />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="dumbbell-legend">
        <span><span className="dot dot-blue" /> DeepSeek-R1</span>
        <span><span className="dot dot-orange" /> OpenAI o1-1217</span>
      </div>
      <ChartNote>Source: DeepSeek-R1 technical report, Table 4 ({src("dsr1")}). Codeforces shown as percentile (not Elo rating) so all five rows share a comparable 0–100 scale.</ChartNote>
    </div>
  );
}

function Chart5_Slope() {
  const rows = [
    { metric: "Total revenue", before: 44.1, after: 81.6 },
    { metric: "Data Center revenue", before: 39.1, after: 75.2 },
    { metric: "China Data Center revenue", before: 4.6, after: 0 },
  ];
  const data = [
    { period: "Q1 FY2026", "Total revenue": 44.1, "Data Center revenue": 39.1, "China Data Center revenue": 4.6 },
    { period: "Q1 FY2027", "Total revenue": 81.6, "Data Center revenue": 75.2, "China Data Center revenue": 0 },
  ];
  return (
    <div className="chart-wrap">
      <div className="chart-title">One year, three trajectories: Q1 FY2026 → Q1 FY2027 <FactTag tier="FACT" /></div>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 20, right: 60, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="period" />
          <YAxis label={{ value: "$ billions", angle: -90, position: "insideLeft" }} />
          <Tooltip formatter={(v) => `$${v}B`} />
          <Legend />
          <Line type="linear" dataKey="Total revenue" stroke="#1d4ed8" strokeWidth={3} dot={{ r: 5 }}>
            <LabelList dataKey="Total revenue" position="top" formatter={(v) => `$${v}B`} />
          </Line>
          <Line type="linear" dataKey="Data Center revenue" stroke="#16a34a" strokeWidth={3} dot={{ r: 5 }}>
            <LabelList dataKey="Data Center revenue" position="top" formatter={(v) => `$${v}B`} />
          </Line>
          <Line type="linear" dataKey="China Data Center revenue" stroke="#f87171" strokeWidth={3} dot={{ r: 5 }}>
            <LabelList dataKey="China Data Center revenue" position="bottom" formatter={(v) => `$${v}B`} />
          </Line>
        </LineChart>
      </ResponsiveContainer>
      <ChartNote>Source: Nvidia quarterly financial results, Q1 FY2026 and Q1 FY2027 ({src("nvdaq1fy26")}, {src("nvdaq1fy27")}).</ChartNote>
    </div>
  );
}

function Chart6_ChineseShare() {
  const data = [
    { period: "H1 2025\n(average)", share: 4.5 },
    { period: "Trailing 12-mo.\navg. (to mid-2026)", share: 11 },
    { period: "Weekly floor\nsince Feb. 8, 2026", share: 30 },
    { period: "2026\npeak week", share: 46 },
  ];
  return (
    <div className="chart-wrap">
      <div className="chart-title">Chinese AI models' share of US enterprise token usage (via OpenRouter) <FactTag tier="FACT" /></div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="period" tick={{ fontSize: 11 }} height={50} />
          <YAxis unit="%" domain={[0, 50]} />
          <Tooltip formatter={(v) => `${v}%`} />
          <Area type="monotone" dataKey="share" stroke="#1d4ed8" fill="#bfdbfe">
            <LabelList dataKey="share" position="top" formatter={(v) => `${v}%`} />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
      <ChartNote>Source: CNBC, citing OpenRouter data ({src("cnbc2026chinese")}). These four points are the specific figures reported; no continuous weekly series was published, so the line between them is illustrative of direction, not interpolated data.</ChartNote>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   QUESTION DATA
---------------------------------------------------------------------------- */

const WARMUP_QUESTIONS = [
  {
    id: "w1",
    typeLabel: "Warm-Up — Type B (transfer)",
    principle: "A rebound effect doesn't require a 1:1 match between the price cut and the usage increase — it only requires usage to rise measurably above what it otherwise would have been.",
    prompt: "A recent article found that a big drop in the energy cost of AI chips did not shrink total electricity use — it grew total use faster, because cheaper compute invited far more of it (a “rebound effect”). Now apply that lesson elsewhere: a city cuts the average cost of downtown parking by 80% with a new smart-meter system. One year later, total vehicle-miles driven downtown are up 35%. A council member says: “Since driving only grew 35% while parking got 80% cheaper, this proves cheaper parking mostly failed to cause extra driving.” What is the strongest critique of this reasoning?",
    options: [
      "The critique wrongly assumes a rebound effect must match the price cut's percentage one-for-one to count as real; a 35% jump in driving after an 80% price cut is still a large, genuine rebound — the right test is whether usage grew measurably faster than it otherwise would have, not whether the two percentages line up.",
      "The council member is right, because a 45-percentage-point gap between the price cut and the traffic increase proves driving is fairly insensitive to price.",
      "The council member is right, because the 35% rise in driving could just as easily reflect a separate cause, like new offices opening downtown, so no rebound effect can be claimed at all.",
      "The council member is right, because unless total driving grew by 80% or more — matching the full size of the price cut — there is no meaningful rebound effect happening.",
    ],
    correct: 0,
    misconceptions: [
      null,
      "this treats a percentage-point gap (45 points) as if it were a directly comparable, subtractable measure of price sensitivity — percentage-point differences between two different quantities (a price cut and a usage change) aren't a valid basis for that comparison.",
      "this jumps to dismissing the mechanism entirely instead of asking whether a partial rebound could still be a real contributor alongside other causes — ruling out a single-cause story is not the same as ruling out the mechanism's contribution.",
      "this is an all-or-nothing fallacy: a rebound effect is real whenever a price cut measurably raises usage above the counterfactual, whether that's a 10% rise or a 200% rise, not only when it matches the price cut's magnitude.",
    ],
    explanation: "Named principle: efficiency or price gains predictably induce more total use, and the size of that rebound need not match the size of the efficiency gain to be real or meaningful — the question is always whether usage moved more than it would have absent the change. Where this generalizes: any 'this large a price/cost cut only produced a modest usage increase, so the effect must be weak' claim should be checked against a counterfactual, not against the size of the original cut.",
    generalizes: "any efficiency-price-usage relationship, from parking meters to cloud computing to grocery discounts.",
  },
  {
    id: "w2",
    typeLabel: "Warm-Up — Type B (transfer)",
    principle: "A wide margin gap between a low-margin core business and a high-margin bolt-on doesn't prove the bolt-on creates real value — check whether its headline metric is independently auditable or just self-reported.",
    prompt: "A recent article found that a retailer's advertising arm ran at roughly 40–50% margins versus a 1.7% margin on its core grocery business, and much of that gap rested on an ad-performance metric that advertisers themselves admitted they could not verify was truly incremental. Apply the same scrutiny here: a hospital network's software arm sells a “patient engagement analytics” add-on with a reported 85% margin, far above the hospital's own 3% margin on patient care. The product's key selling point is a “care improvement score” that participating hospitals self-report each quarter. A board member, impressed by the margin gap, wants to expand the contract system-wide. What should give the board the most pause?",
    options: [
      "The 85% margin is convincing on its own — no business could sustain that margin without delivering real value, so the board should expand the contract.",
      "The margin gap says nothing about whether the analytics product creates real clinical value on its own; because the “care improvement score” is self-reported by the same hospitals paying for the product, the board cannot yet tell whether it reflects genuine improvement or an unaudited, optimistic proxy — only an independent, outcomes-based audit would tell the two apart.",
      "Because the core hospital margin is only 3%, any add-on with a much higher margin must be exploiting the hospital, so the board should cancel the contract outright.",
      "Since the analytics arm is a separate legal entity from patient care, its margin is not comparable to the hospital's margin and the gap is not meaningful.",
    ],
    correct: 1,
    misconceptions: [
      "this treats the margin itself as the proof of value — exactly the fallacy the original retail case warned against, where margin was mistaken for evidence rather than an outcome that still needs an audited explanation.",
      null,
      "this over-corrects into blanket distrust: any margin gap is assumed automatically extractive without evidence, the mirror-image error of trusting the margin outright.",
      "this dodges the actual question — legal separateness doesn't determine whether the underlying metric is auditable, which is the real issue.",
    ],
    explanation: "Named principle: a margin gap is a fact about pricing and cost structure, not a fact about whether the product's claimed benefit is real — check what stands behind the number, especially when the party being measured supplies the measurement. Where this generalizes: any 'our add-on protects/improves X and also has amazing margins' pitch, from retail media to healthcare IT to SaaS analytics, deserves the same question: who verifies the benefit claim, and could they be wrong?",
    generalizes: "any high-margin analytics or measurement product bundled with a low-margin core business, across industries.",
  },
  {
    id: "w3",
    typeLabel: "Warm-Up — Type B (transfer)",
    principle: "A falling aggregate doesn't disprove a rising problem inside one of its components — legal/economic incidence and aggregate/component distinctions both hinge on looking inside the total, not just at it.",
    prompt: "A recent article found that US inflation was lower in early 2026 than a year earlier even though tariffs were adding a real, rising cost — because the tariffs' contribution was only about a quarter of the year's inflation reading, offset by other, larger forces pulling the aggregate the other way. Apply that “aggregate vs. component” lesson here: a company's total customer complaints fell 10% company-wide this year. Buried inside that total, complaints specifically about billing errors rose 40% over the same period. A regional manager argues: “Since total complaints fell, billing must not be a real problem — the 40% figure is a distraction.” What is the strongest response?",
    options: [
      "The manager is right; if the total is improving, every category feeds into that total, so billing complaints can't really be getting worse in any way that matters.",
      "The manager is wrong, so the total-complaints figure is essentially useless and the company should stop tracking it altogether and only track billing complaints.",
      "A falling company-wide total does not disprove a rising problem inside one component; billing complaints can be genuinely worsening even while a bigger decline elsewhere (shipping, product quality) pulls the aggregate down — the manager needs billing's share of the total and its trend, not just the aggregate, before concluding anything.",
      "The manager is wrong because a 40% rise is a bigger number than a 10% fall, so billing complaints are now the company's single largest problem.",
    ],
    correct: 2,
    misconceptions: [
      "this assumes every component must share the aggregate's direction — exactly the reasoning error the original tariff case exposed, where a falling aggregate rate coexisted with a rising contribution from one factor inside it.",
      "this over-corrects by discarding the aggregate, which is still informative about overall customer experience; the fix is to track both levels, not abandon one.",
      null,
      "this compares percentage changes without knowing the underlying base volumes — a 40% rise off a small base can still be a small absolute problem, and a 10% fall off a large base can be a big absolute improvement.",
    ],
    explanation: "Named principle: an aggregate and a component inside it can move in opposite directions at once without contradiction, because other components can move enough to dominate the total — always ask what's inside the average before drawing conclusions from it. Where this generalizes: any 'the total is fine, so don't worry about this one rising sub-metric' argument, whether in inflation data, customer complaints, or error rates, needs the sub-metric's share and trend, not just the total's direction.",
    generalizes: "any situation where a company-wide or economy-wide average could be masking a worsening sub-component.",
  },
];

const BG_QUESTIONS = {
  mc: {
    id: "bg-b1",
    typeLabel: "Type B — Trend Reasoning (statistical trap: normalization)",
    principle: "A share (a ratio to a fast-changing whole) and a level (the raw dollar amount) can move in opposite directions at once — always check which one a headline describes, and whether the denominator moved.",
    prompt: "China's share of Nvidia's total revenue fell every year from FY2023 (21.4%) to FY2026 (9.11%) even though China's dollar revenue rose every year over the same span (from $5.785B to $19.68B). A headline reads: “Nvidia's China business shrank by more than half between FY2023 and FY2026.” What is the most accurate assessment of that headline?",
    options: [
      "The headline is correct: a fall from 21.4% to 9.11% is roughly a 12-percentage-point drop, and 12 points is ‘more than half’ of 21.4%, so the headline's math checks out and the business genuinely shrank.",
      "The headline is directionally fine to use as shorthand, because when a company's total revenue grows this fast, whatever happens to any one region's dollar figure is basically irrelevant to strategy.",
      "The headline is correct, because China's shrinking share means China matters less to Nvidia's valuation and stock price than it used to.",
      "The headline is misleading: it describes a falling SHARE of total revenue, not a falling LEVEL of China revenue — China's dollar revenue rose every year, reaching its highest level yet in FY2026. The share fell only because Nvidia's overall revenue grew even faster, elsewhere.",
    ],
    correct: 3,
    misconceptions: [
      "this treats a percentage-point difference (21.4 minus 9.11 = about 12.3 points) as if it were a percent change in the underlying dollar figure — the two are measured in different units and cannot be substituted for each other.",
      "this overcorrects into dismissing the dollar figure entirely, when in fact that figure is exactly what later collapsed to zero and mattered enormously.",
      "this jumps from a revenue-share statistic to an unsupported claim about strategic importance or valuation, which the chart's data cannot support on its own.",
      null,
    ],
    explanation: "Distractor diagnosis: (A) treats a percentage-point gap as a percent change; (B) overcorrects into dismissing a dollar figure that later proved decisive; (C) jumps from a share statistic to an unsupported valuation claim. A reader should distinguish ‘China's revenue is shrinking’ (false, per the dollar figures) from ‘China is becoming a smaller share of a bigger Nvidia’ (true) — the second claim doesn't imply the first.",
    generalizes: "any 'X's share of Y is falling' headline, in any industry — always check whether the denominator (Y) is what actually moved.",
  },
  numeric: {
    id: "bg-d1",
    prompt: "Using the chart's two dollar figures — China revenue of $5.785 billion in FY2023 and $19.68 billion in FY2026 — estimate the compound annual growth rate (CAGR) of Nvidia's China-region dollar revenue over those three years. (CAGR = (ending ÷ beginning)^(1/years) − 1; the number of years from FY2023 to FY2026 is 3.)",
    toleranceNote: "Tolerance: ±10 percentage points around the actual value — this is a one-shot arithmetic calculation, so a tight band is appropriate.",
    unit: "% per year",
    placeholder: "e.g., 40",
    low: 40.4,
    high: 60.4,
    toleranceType: "band",
    actual: 50.4,
    actualLabel: "about 50% per year",
    howTo: "CAGR = (19.68 ÷ 5.785)^(1/3) − 1 = (3.402)^(0.333) − 1 ≈ 1.504 − 1 = 0.504, or about 50% per year. Anchor facts: both dollar figures come directly from Nvidia's 10-K filings. Bounds: this is a nominal (not inflation-adjusted) rate over an unusually short, unusually AI-boom-driven three years, so treat it as a description of this specific window, not a forecast — indeed, the growth rate went to roughly −100% (China Data Center revenue fell to zero) in the very next reported quarter, which is why extrapolating a CAGR forward without checking what's driving it is risky.",
    principle: "A compound growth rate compresses a multi-year story into one number; always check the window it's computed over and what's driving it before extrapolating.",
    generalizes: "any CAGR or growth-rate headline, from revenue to population to inflation — a rate computed over one window says nothing about the next window unless the underlying driver is checked.",
  },
};

const RQ1_QUESTIONS = {
  mc: {
    id: "rq1-a1",
    typeLabel: "Type A — Chart Reading and Implication",
    principle: "Multiplying a per-unit price gap by actual volume turns an abstract ratio into a real, decision-relevant dollar figure — decisions should be made on the derived total, not the ratio alone.",
    prompt: "A startup CTO is choosing between OpenAI's o1 ($60 per million output tokens) and DeepSeek's R1 ($2.19 per million output tokens) for a workload generating roughly 500 million output tokens per month. Assuming the two models are close enough in quality for this task (per the benchmark parity above), what is the most defensible one-year cost implication of choosing o1 over R1, and what should the CTO weigh against it?",
    options: [
      "Choosing o1 costs roughly $30,000/month in token spend versus about $1,095/month for R1 — a gap of about $28,900/month, or roughly $347,000 over a year — which the CTO should weigh against non-price factors such as data governance, uptime guarantees, or integration cost, not against the raw benchmark scores alone, since the benchmark gap between the two models is small.",
      "Since o1 costs about 27 times more per token, the CTO should expect the total one-year bill to be 27 times higher no matter what, so the actual dollar amounts don't need to be calculated separately.",
      "The price difference is real, but at 500 million tokens per month the absolute dollar gap between the two models rounds to a level too small to matter for any real company's budget.",
      "Since the two models perform similarly on most benchmarks, the CTO should simply pick whichever one has the higher score on MATH-500, since that is the more demanding benchmark.",
    ],
    correct: 0,
    misconceptions: [
      null,
      "this treats the 27x per-token ratio as if it applies directly to the total bill without doing the arithmetic — the ratio describes the per-token gap; the actual dollar total (which happens to still be large here) is what should drive a budget decision.",
      "this is a plausible-sounding claim that turns out to be wrong once computed: $28,900/month is a meaningful sum for most startups, illustrating why 'it probably doesn't matter' claims need arithmetic, not intuition.",
      "this answers a narrower question (which model scores higher on one benchmark) instead of the cost-tradeoff question actually asked, and ignores that the benchmark gap is close enough that price should dominate the decision.",
    ],
    explanation: "How to estimate this: o1 cost = $60 × (500M ÷ 1M) = $30,000/month; R1 cost = $2.19 × (500M ÷ 1M) ≈ $1,095/month; gap ≈ $28,905/month × 12 ≈ $346,860/year. Named principle confirmed: turn ratios into actual dollar totals at your own volume before deciding whether a gap is meaningful — a large ratio can describe a trivial total, and a modest-looking ratio can describe an enormous one.",
    generalizes: "any 'X times cheaper/more expensive' claim, from cloud compute to insurance premiums to shipping rates.",
  },
  numeric: {
    id: "rq1-d2",
    prompt: "OpenAI's Sam Altman has said training GPT-4 cost “more than $100 million.” DeepSeek reports it trained DeepSeek-V3 for about $5.6 million. Order-of-magnitude estimate: roughly how many separate DeepSeek-V3-style training runs could a lab fund for the same money as one GPT-4-class training run? Give your best single-number estimate.",
    toleranceNote: "Tolerance: within a factor of 2 of the actual value (a genuine Fermi estimate, scored on log-distance, not exact arithmetic) — open-ended, since neither cost figure is precisely known.",
    unit: "training runs",
    placeholder: "e.g., 18",
    low: 9,
    high: 36,
    toleranceType: "band",
    actual: 18,
    actualLabel: "about 18 (roughly $100M ÷ $5.6M)",
    openEnded: true,
    howTo: "Decomposition: (frontier training cost) ÷ (DeepSeek training cost) = $100M+ ÷ $5.6M ≈ 18x, using Altman's stated floor. Anchor facts: DeepSeek-V3's $5.576M figure is from its own technical paper; GPT-4's cost is Altman's own “more than $100 million” statement, with a lower independent Stanford estimate of ~$78M. Bounds: the low end (~15x) reflects the possibility that DeepSeek's true all-in cost is somewhat higher than its stated marginal training run (SemiAnalysis estimates DeepSeek's cumulative hardware spend at over $500M across the company's whole history — a different, much larger number measuring infrastructure capex rather than one model's training run). The high end (~30–40x) reflects that GPT-4-class costs may be understated or that newer frontier runs cost more. Why the real number lands in this band: a large, real efficiency gap exists, but it does not mean 18x more research output — training-run cost is only one input among many (talent, data, iteration count, infrastructure) that determine what a lab can actually build.",
    principle: "A Fermi estimate is a ratio of two anchor facts bounded by named uncertainty on each side — the goal is the right order of magnitude, not false precision.",
    generalizes: "any 'how many X could you buy for the cost of one Y' question, from R&D budgets to infrastructure spending to military procurement.",
  },
};

const RQ2_QUESTIONS = {
  mc1: {
    id: "rq2-b1",
    typeLabel: "Type B — Trend Reasoning",
    principle: "'The cost was small relative to an unrelated tailwind' and 'there was no cost' are different claims — only the company's own disclosed figures can tell you which one is true.",
    prompt: "Nvidia's total revenue grew 85% year-over-year in Q1 FY2027 while its China Data Center revenue fell from $4.6 billion to zero over the same period. A commentator argues: “This proves US export controls on AI chips have no real economic cost — Nvidia's results show the policy is free.” What is the strongest problem with this argument?",
    options: [
      "The argument can't be evaluated at all, because we can never know what Nvidia's revenue would have been without the export controls.",
      "The argument mistakes ‘the cost was affordable’ for ‘there was no cost.’ Nvidia's own filings show a real, dollar-denominated loss directly caused by the policy — a $4.5 billion inventory charge, roughly $2.5 billion of unshippable Q1 FY26 revenue, and an entire $4.6-billion-a-quarter revenue stream reaching zero — that was simply small relative to how fast the rest of the business grew.",
      "The argument actually understates the case — the export restriction likely helped cause the 85% growth, by forcing Nvidia to focus its Blackwell supply on higher-margin non-China customers.",
      "The argument is correct, because an 85% growth rate is a much bigger number than the roughly 10% share China represented, so mathematically the growth rate 'outweighs' the loss and cancels it out entirely.",
    ],
    correct: 1,
    misconceptions: [
      "this overcorrects into total agnosticism, when Nvidia's own reported charges ($4.5B, $2.5B, an $8B guided loss) are direct, dollar-denominated evidence of cost, no counterfactual required.",
      null,
      "this invents an unsupported causal claim in the opposite direction — that the restriction caused the growth — which nothing in the article's evidence supports.",
      "this treats a growth rate (a relative measure over time) and a revenue share (a snapshot ratio) as commensurable quantities that can be netted against each other, which they are not.",
    ],
    explanation: "A cost that is dwarfed by unrelated growth is still a cost. Where this generalizes: whenever a large unrelated tailwind masks a real, specific loss in a company's results, look for the loss in the company's own disclosed line items rather than inferring 'no cost' from a healthy topline.",
    generalizes: "any 'the overall numbers look fine, so this specific policy/event must have been costless' argument, in any industry.",
  },
  case: {
    id: "rq2-c1",
    typeLabel: "Type C — Consulting Case",
    principle: "The assumption that most needs to hold for a recommendation to work is not always the most obvious one — trace the causal chain from the action to the intended benefit and find the weakest link.",
    prompt: "Meridian Compute, a fictional mid-size cloud GPU reseller, buys chips from Nvidia and leases compute time to enterprise customers, some in Asia. Meridian's board is debating whether to lobby Washington for a stable, long-term chip export policy (instead of the reversals seen with H20 and H200), arguing that “policy stability would let us plan capacity investment with confidence.” Which assumption is most load-bearing for this recommendation to actually create value for Meridian, and what evidence in this section is thinnest in supporting it?",
    options: [
      "The load-bearing assumption is that export controls always reduce total global chip demand; the article's benchmark data suggests otherwise, so the lobbying case is weak.",
      "The load-bearing assumption is that Nvidia can still design competitive chips under any export regime; the article's revenue data supports this strongly, so the lobbying case is solid.",
      "The load-bearing assumption is that a MORE STABLE policy, regardless of its restrictiveness, would actually change Meridian's customers' buying decisions enough to matter — but the section's strongest evidence points the other way: China's authorities rejected H200 chips even after Washington explicitly approved their sale, because Beijing no longer trusts that any given policy will hold. That is the thinnest-supported part of Meridian's case.",
      "The load-bearing assumption is that Meridian's own balance sheet can absorb short-term revenue volatility; the article doesn't discuss Meridian's finances at all, so this can't be evaluated.",
    ],
    correct: 2,
    misconceptions: [
      "this picks a real but secondary point that is not central to Meridian's specific ask about policy stability.",
      "this picks an assumption the article's own data actually supports well, failing the 'thinnest evidence' test the question asks for.",
      null,
      "this raises a genuine business risk (balance sheet resilience) that is outside what this section's evidence can speak to, rather than engaging with what the section's evidence actually shows.",
    ],
    explanation: "Implementation risk: even if Washington delivers perfect policy stability, Meridian's underlying bet only pays off if China-side customers respond — and the article's own H200 example (approved for sale, still not purchased) shows a policy change that produced zero behavior change. Where this generalizes: any 'if only policy were more X, our business would benefit' argument has a hidden assumption about how a third party will respond — test that assumption before endorsing the ask.",
    generalizes: "any strategy that depends on a regulator's stability actually changing a third party's (customer, competitor) behavior.",
  },
};

const RQ3_QUESTIONS = {
  mc1: {
    id: "rq3-b1",
    typeLabel: "Type B — Causal / Comparative (correlation vs. causation)",
    principle: "When two trends share a timeline, check whether a more immediate, better-evidenced cause already explains the outcome before crediting a more distant one — and note that a real causal chain can run through several indirect steps.",
    prompt: "Chinese AI models' share of US enterprise token usage rose from a 4.5% average in H1 2025 to a peak of 46% by mid-2026, roughly the same period China's chip export restrictions were tightened, reversed, and tightened again. Which of the following is the strongest reason NOT to conclude that chip export policy directly caused this US adoption shift?",
    options: [
      "There is no plausible link whatsoever between chip policy and US company adoption decisions, since chip policy only affects hardware sold in China, not software used in the US.",
      "Because both trends happened over the same roughly 12-month window, the timing alone is strong enough evidence that one caused the other.",
      "US enterprises adopting Chinese models is what actually forced Washington to loosen chip export policy, not the other way around.",
      "The reporting attributes the adoption shift primarily to a different, more immediate cause — rising US model prices and a 'tokenmaxxing' cost shock at US labs — that operated independently of chip policy; chip policy's effect, if any, was indirect (constraining Chinese labs toward cost-efficient training, which fed into low prices), and a shared timeline cannot distinguish a direct cause from this kind of indirect chain or from coincidence.",
    ],
    correct: 3,
    misconceptions: [
      "this over-corrects into denying any possible connection, when an indirect chain (chip scarcity → training efficiency → low prices → adoption) is plausible even if a direct one isn't established.",
      "this is the classic correlation-implies-causation error — shared timing alone never rules out a third factor or reverse causation.",
      "this proposes a specific reverse-causal claim with no supporting evidence in the article, illustrating how easy it is to swap the arrow's direction without justification.",
      null,
    ],
    explanation: "Where this generalizes: any time a policy and an unrelated-seeming market outcome move together, look for the more immediate, directly-evidenced cause first, and map out whether a causal chain could run indirectly through several steps rather than assuming either a direct link or no link at all.",
    generalizes: "any policy-and-market-outcome pair that shares a timeline, from trade policy to interest rates to regulation.",
  },
  case: {
    id: "rq3-c1",
    typeLabel: "Type C — Consulting Case",
    principle: "A cost-and-capability case for switching vendors does not automatically resolve a separate governance-and-control question — evaluate whether the company can independently audit and control the hosting environment before treating price/benchmark parity as sufficient.",
    prompt: "A mid-size US insurance company's CIO is deciding whether to route a large share of internal document-processing AI work to a Chinese open-weight model (of the kind now capturing up to 46% of enterprise token share) to cut costs, versus staying with its current US frontier-model vendor. The CIO's main worry is data governance and vendor risk, not raw model quality. What is the most defensible recommendation, and what is its central risk?",
    options: [
      "Adopt the cheaper Chinese open-weight model for workloads where the company can self-host or use a vetted third-party host under its own data-governance controls, since benchmark parity is close and the price gap is large — but the central risk is that an open-weight model's update path, support, and any embedded biases or vulnerabilities are harder to audit and less contractually backed than a paid frontier vendor's, so this only holds where the company controls the hosting and has independently verified outputs, not for workloads handed to an unvetted third-party API.",
      "Since the Chinese model is dramatically cheaper and performs close to parity on benchmarks, the CIO should move the entire workload immediately to capture the savings.",
      "The CIO should avoid the Chinese model entirely, because benchmark scores from the model's own developer cannot be trusted at all.",
      "Since Chinese models already have up to 46% share of US enterprise usage, the decision is effectively already made for the CIO by the market.",
    ],
    correct: 0,
    misconceptions: [
      null,
      "this answers only the cost question, ignoring the CIO's explicitly stated priority of governance, not raw savings.",
      "this swings to blanket distrust of self-reported benchmarks without engaging the CIO's actual concern, and ignores that independent third-party checks (Epoch AI, the paper's cross-lab comparisons) partly address this.",
      "this treats a market-wide adoption statistic as if it settles an individual company's risk-specific decision — a bandwagon, observation-level non sequitur.",
    ],
    explanation: "Failure mode: adopting the cheaper model for a workload the company cannot host or audit itself would recreate exactly the governance risk the CIO is trying to avoid. Where this generalizes: split any 'switch vendors to save money' case into two separate questions — does the cost/capability case hold up, and does the company's own governance environment support the switch — because a strong answer to one does not answer the other.",
    generalizes: "any vendor-switching decision involving both a cost/capability case and a separate governance or control question.",
  },
};

const CONCLUSION_QUESTION = {
  id: "concl-e1",
  typeLabel: "Type E — Implication Bridge (with falsification)",
  principle: "An intervention aimed at one goal (restricting a rival's access to inputs) can succeed completely on its own terms while a related but distinct goal (staying ahead in the capability and commercial race those inputs were meant to protect) moves independently, or even the opposite direction.",
  prompt: "Given everything in this article — Nvidia's China chip revenue collapsing to zero, DeepSeek matching a frontier US model at a small fraction of the training cost, and Chinese open models capturing up to 46% of US enterprise AI usage — which real-world decision is most directly supported by this evidence, and what single observation over the next 12–18 months would most undermine it?",
  options: [
    "Decision: US chipmakers should exit the China market entirely and abandon any hope of re-entry, since the embargo has permanently and irreversibly failed. This would be undermined only if China fully lifted all restrictions on Nvidia chips tomorrow, which is not going to happen.",
    "Decision: A policymaker or executive should treat 'keeping the most advanced chips out of a rival's hands' and 'staying ahead in AI model capability and market adoption' as two different goals that can move in opposite directions — the embargo succeeded at the first (zero China chip revenue) while apparently not preventing, and arguably accelerating, competitive pressure on the second. This would be most undermined by clear evidence that Chinese frontier AI capability meaningfully stalls or falls further behind — for example, if the 'six to nine months' capability gap widens substantially instead of holding steady or narrowing.",
    "Decision: US AI labs should immediately match Chinese labs' pricing dollar-for-dollar, since price is now the only factor that matters in AI adoption. This would be undermined if a new US model became the most popular model in the world.",
    "Decision: The AI industry should keep monitoring both chip exports and model adoption metrics, since both are changing quickly. This would be undermined if the situation changed unexpectedly.",
  ],
  correct: 1,
  misconceptions: [
    "this draws an unsupported all-or-nothing conclusion the evidence doesn't require, and pairs it with a strawman falsification condition that could never realistically occur.",
    null,
    "this recommends an action (dollar-for-dollar price matching) not well grounded in the article's nuanced evidence about governance, quality, and vendor-risk trade-offs, and its falsification condition doesn't actually test the recommendation.",
    "this never reaches an implication — 'keep monitoring' is an observation-level non-answer — and its falsification clause is too vague ('if things change') to ever be checked against evidence.",
  ],
  explanation: "Where this generalizes: whenever you evaluate a policy, technology bet, or business strategy, separate the specific goal it targeted from adjacent goals people assume it also serves, and require a specific, checkable falsification condition rather than a vague hedge.",
  generalizes: "evaluating any policy or strategy that pursues one goal but gets judged against several.",
};

/* ----------------------------------------------------------------------------
   SECTION METADATA
---------------------------------------------------------------------------- */
const NAV_SECTIONS = [
  { id: "sec-warmup", label: "Warm-Up" },
  { id: "sec-intro", label: "Introduction" },
  { id: "sec-background", label: "Background" },
  { id: "sec-rq1", label: "RQ1: Slowed or Sharpened?" },
  { id: "sec-rq2", label: "RQ2: What It Cost" },
  { id: "sec-rq3", label: "RQ3: Who's Winning" },
  { id: "sec-summary", label: "Learning Summary" },
  { id: "sec-conclusion", label: "Conclusion" },
];

/* ----------------------------------------------------------------------------
   MAIN APP
---------------------------------------------------------------------------- */
function App() {
  const [activeSection, setActiveSection] = useState("sec-warmup");
  const [questionState, setQuestionState] = useState({});
  const [interpState, setInterpState] = useState({});
  const [navVisible, setNavVisible] = useState(window.innerWidth >= 1160);
  const [governingInsight, setGoverningInsight] = useState("");
  const [governingRevealed, setGoverningRevealed] = useState(false);
  const [applyA, setApplyA] = useState("");
  const [applyB, setApplyB] = useState("");
  const [applyEvaluated, setApplyEvaluated] = useState(false);

  useEffect(() => {
    const onResize = () => setNavVisible(window.innerWidth >= 1160);
    window.addEventListener("resize", onResize);
    const onScroll = () => {
      let current = NAV_SECTIONS[0].id;
      for (const s of NAV_SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top - 120 <= 0) current = s.id;
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAnswer = (id, action, value) => {
    setQuestionState((prev) => {
      const cur = prev[id] || { selected: null, submitted: false };
      if (action === "select") return { ...prev, [id]: { ...cur, selected: value } };
      if (action === "submit") return { ...prev, [id]: { ...cur, submitted: true } };
      return prev;
    });
  };

  const handleNumeric = (id, value, correct) => {
    setQuestionState((prev) => ({ ...prev, [id]: { value, correct, submitted: true } }));
  };

  const handleInterp = (key, text) => {
    setInterpState((prev) => ({ ...prev, [key]: { submitted: true, text } }));
  };

  const allMC = [
    ...WARMUP_QUESTIONS,
    BG_QUESTIONS.mc,
    RQ1_QUESTIONS.mc,
    RQ2_QUESTIONS.mc1,
    RQ2_QUESTIONS.case,
    RQ3_QUESTIONS.mc1,
    RQ3_QUESTIONS.case,
    CONCLUSION_QUESTION,
  ];
  const allNumeric = [BG_QUESTIONS.numeric, RQ1_QUESTIONS.numeric];

  const mcAnswered = allMC.filter((q) => questionState[q.id]?.submitted);
  const mcCorrect = mcAnswered.filter((q) => questionState[q.id].selected === q.correct);
  const numAnswered = allNumeric.filter((q) => questionState[q.id]?.submitted);
  const numCorrect = numAnswered.filter((q) => questionState[q.id].correct);
  const totalScore = mcCorrect.length + numCorrect.length;
  const totalAnswered = mcAnswered.length + numAnswered.length;

  const scoreByType = useMemo(() => {
    const groups = {};
    allMC.forEach((q) => {
      const t = q.typeLabel.split(" — ")[0];
      if (!groups[t]) groups[t] = { correct: 0, total: 0 };
      if (questionState[q.id]?.submitted) {
        groups[t].total += 1;
        if (questionState[q.id].selected === q.correct) groups[t].correct += 1;
      }
    });
    return groups;
  }, [questionState]);

  const missedPrinciples = allMC
    .filter((q) => questionState[q.id]?.submitted && questionState[q.id].selected !== q.correct)
    .map((q) => q.principle);

  const numericBias = useMemo(() => {
    const done = allNumeric.filter((q) => questionState[q.id]?.submitted && typeof q.actual === "number");
    if (done.length === 0) return null;
    const pctErrors = done.map((q) => {
      const yourVal = questionState[q.id].value;
      const signedPct = ((yourVal - q.actual) / q.actual) * 100;
      return signedPct;
    });
    const avg = pctErrors.reduce((a, b) => a + b, 0) / pctErrors.length;
    return { avg, n: pctErrors.length };
  }, [questionState]);

  const evaluateApplyIt = () => {
    // Local fallback evaluator (no secure server-side API path wired for this static artifact).
    // Checks structural completeness of the four required parts, not keyword presence.
    const text = applyA;
    const parts = ["thesis", "assumption", "disconfirm", "pre-mortem"];
    const lower = text.toLowerCase();
    const gaps = [];
    if (text.trim().length < 40) gaps.push("The response overall is too short to contain four substantive parts.");
    if (!/1[\).:]|thesis|so-what/i.test(text)) gaps.push("No clearly labeled so-what thesis found (part 1).");
    if (!/2[\).:]|assum/i.test(text)) gaps.push("No clearly labeled load-bearing assumption found (part 2).");
    if (!/3[\).:]|disconfirm|undermine|against/i.test(text)) gaps.push("No clearly labeled disconfirming evidence found (part 3).");
    if (!/4[\).:]|pre-mortem|fails|fail in/i.test(text)) gaps.push("No clearly labeled pre-mortem found (part 4).");
    if (gaps.length === 0) gaps.push("All four parts appear present — check that each climbs from observation to a quantified, decision-relevant implication, not just a labeled restatement.");
    setApplyEvaluated(true);
    return gaps;
  };
  const [applyGaps, setApplyGaps] = useState([]);

  return (
    <div className="app-root">
      <div className="progress-bar" style={{ width: `${Math.min(100, (NAV_SECTIONS.findIndex(s=>s.id===activeSection)+1) / NAV_SECTIONS.length * 100)}%` }} />
      <div className="score-badge">Score: {totalScore} / {totalAnswered || "–"} answered</div>

      {navVisible && (
        <nav className="left-nav">
          {NAV_SECTIONS.map((s) => (
            <div
              key={s.id}
              className={"nav-item" + (activeSection === s.id ? " nav-active" : "")}
              onClick={() => scrollTo(s.id)}
            >
              {s.label}
            </div>
          ))}
        </nav>
      )}

      <main className="prose-column">
        {/* ============================= WARM-UP ============================= */}
        <section id="sec-warmup" className="page-section">
          <h1>Warm-Up: What Stuck?</h1>
          <p className="lede">Before today's topic, three quick checks on principles from recent articles — applied to brand-new situations, not the topics they came from. These are scored, but the point isn't recall; it's whether the underlying reasoning transfers.</p>
          {WARMUP_QUESTIONS.map((q) => (
            <MCQuestion key={q.id} q={q} state={questionState} onAnswer={handleAnswer} />
          ))}
          <GlossaryPanel pageKey="warmup" />
        </section>

        {/* ============================= INTRODUCTION ============================= */}
        <section id="sec-intro" className="page-section">
          <h1>The Chip Embargo Paradox</h1>
          <p>Washington spent three years and cost its own chipmaker tens of billions of dollars trying to keep the most advanced AI chips out of China's hands. By 2026 the policy had worked almost too well: Nvidia's China data-center chip revenue fell to zero. Yet Chinese-built AI models, trained under that same embargo, were busy winning a fast-growing share of American companies' own AI spending — on price.</p>
          <p>The scale involved is large on every side. Nvidia's data-center business alone brought in $75.2 billion in a single quarter by early 2026, up 92% from a year earlier (<FactTag tier="FACT" /> {src("nvdaq1fy27")}). China had been worth $12–$15 billion a year to Nvidia as recently as 2024, mostly through a chip called the H20 that was custom-designed to comply with export rules (<FactTag tier="FACT" /> {src("brookings2026")}). By the first quarter of fiscal 2027, that number was exactly zero (<FactTag tier="FACT" /> {src("nvdaq1fy27")}).</p>
          <p>The usual story about export controls is simple: cut off a rival's access to a critical input, and the rival falls behind. What actually happened diverges from that story in an uncomfortable way. Chinese lab DeepSeek trained a model, R1, that lands within a percentage point or two of OpenAI's o1 on most published benchmarks (<FactTag tier="FACT" /> {src("dsr1")}) — while reporting a training cost of about $5.6 million against OpenAI's acknowledged “more than $100 million” for GPT-4 (<FactTag tier="FACT" /> {src("dsv3")}, {src("altman2023")}). And by mid-2026, Chinese open models were capturing up to 46% of the AI tokens American companies use through one major developer platform, up from a 4.5% average just a year earlier (<FactTag tier="FACT" /> {src("cnbc2026chinese")}).</p>
          <p>This note addresses three questions. First, did the export-control regime slow China's frontier AI capability, or did the resulting compute scarcity force cost efficiencies — like DeepSeek's — that are now winning market share back inside the United States itself? Second, what did reaching zero China chip revenue actually cost US chipmakers, and was that cost large or small next to the industry's overall growth? Third, now that Chinese open models are winning share of American firms' own AI usage and China's chip supply chain is scaling up fast, who has actually won this contest so far — and what would change that verdict?</p>
          <GlossaryPanel pageKey="intro" />
        </section>

        {/* ============================= BACKGROUND ============================= */}
        <section id="sec-background" className="page-section">
          <h1>Background: A Three-Year Whiplash</h1>
          <h2>Trajectory and baseline conditions</h2>
          <p>The chip-control era began in October 2022, when the US Commerce Department's Bureau of Industry and Security (BIS) cut off Chinese buyers from top-end AI chips like Nvidia's A100 (<FactTag tier="FACT" /> {src("brookings2026")}). China's government and companies did not sit still: by September 2023, Huawei had launched a smartphone, the Mate 60 Pro, built around a domestically produced 7-nanometer chip — proof that China's chip industry could claw back some ground even under sanction (<FactTag tier="FACT" /> {src("brookings2026")}). The US answered in October 2023 with an expanded rule, and Nvidia immediately stopped selling the affected data-center products into China (<FactTag tier="FACT" /> {src("fortune2024")}).</p>
          <p>Before that October 2023 tightening, China had historically represented somewhere around a fifth to a quarter of Nvidia's data-center revenue (<FactTag tier="FACT" /> {src("fortune2024")}). The chart below tracks what happened next using Nvidia's own annual filings: China's dollar revenue kept climbing every year through fiscal 2026, even as its share of Nvidia's fast-growing total revenue kept falling.</p>
          <Chart1_RevenueShare />
          <ChartInterpretation
            chartId="chart1"
            state={interpState}
            onSubmit={handleInterp}
            prompts={[
              { kind: "Quantitative reasoning", prompt: "China's dollar revenue rose every year shown. Roughly how many percentage points did China's share of Nvidia's total revenue fall from FY2023 to FY2026, and why can a rising dollar figure and a falling share both be true at once?", authored: "China's share fell from 21.4% to 9.11%, a drop of about 12.3 percentage points (not a ‘12.3%’ change — points, not percent). Both facts are true together because Nvidia's total revenue grew even faster than its China revenue: total company revenue roughly quadrupled over this span while China revenue 'only' more than tripled, so China's slice of a much bigger pie shrank even as the slice itself grew in dollars. Someone who tracked only the percentage would wrongly conclude China 'shrank' for Nvidia; someone who tracked only the dollar figure would wrongly conclude China kept growing without qualification — you need both the level and the share to see the real story." },
              { kind: "So-what / decision implication", prompt: "What should an investor tracking 'Nvidia's exposure to China policy risk' actually watch, given this chart — the percentage share, the dollar figure, or something else?", authored: "Neither number alone was the right thing to watch going forward, because both describe the past baseline, not the forward-looking risk. The percentage share was already falling for policy-independent reasons (explosive AI demand elsewhere), so its continued decline didn't mean China revenue was about to disappear — and it hadn't: FY2026 dollar revenue was still $19.68 billion, the highest yet. What actually mattered for predicting the cliff was the composition of that revenue (mostly one soon-to-be-restricted chip, the H20) and the regulatory calendar — exactly the kind of forward-looking, product-specific detail a trailing percentage or dollar total cannot show." },
            ]}
          />
          <MCQuestion q={BG_QUESTIONS.mc} state={questionState} onAnswer={handleAnswer} />
          <NumericQuestion q={BG_QUESTIONS.numeric} state={questionState} onAnswer={handleNumeric} />

          <h2>Structural transformation</h2>
          <p>The headline 2025–2026 story is not really about a slow percentage decline; it is about a sudden, policy-driven collapse layered on top of it. On April 9, 2025, the US government told Nvidia that its H20 chip — the product custom-built to comply with the 2023 rules — now needed an individual export license to reach China (<FactTag tier="FACT" /> {src("nvdaq1fy26")}). Nvidia had already booked $4.6 billion of H20 sales that quarter before the rule hit, took a $4.5 billion charge for suddenly worthless inventory and commitments, and said it could not ship a further $2.5 billion of orders (<FactTag tier="FACT" /> {src("nvdaq1fy26")}). Nvidia's own guidance said the following quarter would lose about $8.0 billion of H20 revenue to the restriction (<FactTag tier="FACT" /> {src("nvdaq1fy26")}).</p>
          <p>What followed reads like a policy soap opera. In July and August 2025, Commerce reversed itself and granted H20 export licenses — but China's government told domestic AI firms not to buy them, and Nvidia never sold a single one before halting H20 production altogether (<FactTag tier="FACT" /> {src("brookings2026")}). In December 2025, the administration cleared the more powerful H200 chip for export; in January 2026 it added a 25% tariff on those same chips; and in May 2026 it cleared sales to ten named Chinese companies (<FactTag tier="FACT" /> {src("brookings2026")}). As of that same month, not one H200 chip had actually been sold to a Chinese buyer (<FactTag tier="FACT" /> {src("brookings2026")}). Despite four distinct policy reversals in about eighteen months, the destination stayed the same: zero.</p>
          <p>The chart below reframes the same period around Nvidia's overall Data Center segment, showing where its growth actually came from once China's contribution left the picture entirely.</p>
          <Chart2_DCBridge />
          <ChartInterpretation
            chartId="chart2"
            state={interpState}
            onSubmit={handleInterp}
            prompts={[
              { kind: "So-what / decision implication", prompt: "A Nvidia board member sees this bridge before an earnings call. What should they emphasize, and what should they be careful not to claim?", authored: "They can accurately emphasize that non-China data-center demand grew by roughly $40.7 billion in a single year — more than eight times the size of the entire China contribution that disappeared — showing the business easily absorbed the loss. They should be careful not to claim the China exit was 'good for business' or somehow caused the growth; the two are almost certainly independent, driven by separate non-China AI infrastructure demand, and claiming a causal link where there's only a shared timeline would be a real reasoning error, not just an awkward talking point." },
              { kind: "Quantitative reasoning", prompt: "What is the ratio of the estimated rest-of-world Data Center growth (+$40.7B) to the lost China contribution (−$4.6B), and what does that ratio suggest about how replaceable this piece of Nvidia's business turned out to be, at least in this one year?", authored: "Roughly 8.8x ($40.7B ÷ $4.6B). That ratio suggests that, at least in this single extraordinary year of AI infrastructure demand, the China Data Center business was highly 'replaceable' in a purely arithmetic sense — non-China demand growth alone was nearly nine times the size of what was lost. This is a fragile conclusion, though: it depends entirely on how long non-China demand keeps growing at this rate, which is a separate, forward-looking question this one year of data cannot answer." },
            ]}
          />
          <GlossaryPanel pageKey="background" />
        </section>

        {/* ============================= RQ1 ============================= */}
        <section id="sec-rq1" className="page-section">
          <h1>RQ1: Did the Embargo Slow China, or Sharpen It?</h1>
          <p>The chip embargo's entire theory of the case is that limiting compute limits capability. DeepSeek's release of R1 in January 2025 became the single most-cited stress test of that theory, because the model appeared to close most of the capability gap with OpenAI's o1 while reportedly spending a small fraction of the money.</p>
          <p>DeepSeek's own technical paper for the underlying V3 model states a training cost of $5.576 million, using 2.788 million hours of Nvidia H800 GPU time at an assumed rental price of $2 per hour — and it explicitly says this covers only the “official training” run, not prior research or ablation experiments (<FactTag tier="FACT" /> {src("dsv3")}). That narrow framing fueled real skepticism: semiconductor analyst Dylan Patel of SemiAnalysis estimated DeepSeek's cumulative hardware spending, across its whole history, at over $500 million (<FactTag tier="FACT" /> {src("cnbcsemi2025")}) — a different number measuring total infrastructure investment, not one model's marginal training cost. Independent analysis from Epoch AI, however, found DeepSeek's reported numbers consistent with the model's architecture and found no evidence of underreporting; Epoch's own estimate for the additional reinforcement-learning work that turned V3 into the reasoning model R1 added about $1 million on top of V3's cost (<FactTag tier="FACT" /> {src("epoch2025")}).</p>
          <p>The benchmark comparison and the cost comparison, viewed side by side, tell two different stories about the same event.</p>
          <Chart3_CostGap />
          <ChartInterpretation
            chartId="chart3"
            state={interpState}
            onSubmit={handleInterp}
            prompts={[
              { kind: "Quantitative reasoning", prompt: "Compute the ratio between OpenAI's and DeepSeek's output-token price (o1 ÷ R1). Is this ratio bigger or smaller than the ratio between the two training costs, and what does the difference between the two ratios suggest about where the two companies' costs actually diverge?", authored: "$60 ÷ $2.19 ≈ 27x on token price. $100M ÷ $5.6M ≈ 18x on training cost (about 14x using the more conservative $78M Stanford estimate). The token-price ratio (27x) is bigger than the training-cost ratio (about 18x) — the opposite of what you'd expect if OpenAI's higher API price only reflected its higher training cost passed through to customers. That gap is the clue: part of OpenAI's price premium is training cost, but part of it is margin. Epoch AI's own analysis concludes DeepSeek is serving its model close to cost while OpenAI is charging a substantially larger markup — a buyer comparing sticker prices is comparing markups almost as much as costs." },
              { kind: "Qualitative / mechanism", prompt: "Why might a company deliberately price a model close to its own marginal cost, the way DeepSeek appears to, rather than charging what the market would bear the way an established frontier lab can?", authored: "A new entrant without an established customer base, brand premium, or proprietary lock-in has to compete on some dimension other than 'we are the default choice,' and price is the fastest lever available when the product is open-weight and can be run by anyone, including self-hosting or a third-party reseller. Pricing near marginal cost also accelerates adoption, generating the usage data and developer mindshare an incumbent's existing relationships already provide for free. This is a classic new-entrant playbook — sacrifice near-term margin to win share — and it is one reason a comparison between an incumbent's list price and a challenger's list price is not a clean read on the challenger's actual production-cost advantage." },
            ]}
          />
          <p>On the capability side, DeepSeek-R1's own technical report puts its scores against OpenAI's o1-1217 across five widely used benchmarks. The picture is close to a coin flip.</p>
          <Chart4_BenchmarkDots />
          <ChartInterpretation
            chartId="chart4"
            state={interpState}
            onSubmit={handleInterp}
            prompts={[
              { kind: "So-what / decision implication", prompt: "Given how close these five benchmark scores are, what should a buyer choosing between the two models actually base their decision on?", authored: "Not the benchmark scores — the gaps here (a point or two either way on each metric) are within the kind of noise that shifts with prompt design, evaluation setup, or the specific task mix a buyer cares about. A buyer should base the decision on factors the benchmarks don't capture: price (a roughly 27x gap, per the previous chart), data governance and hosting control, update reliability, and support terms. Treating a 1-point benchmark edge as decisive would be over-reading noise as signal." },
              { kind: "Qualitative / mechanism", prompt: "Why might Epoch AI's independent analysis (which found no evidence DeepSeek underreported its costs) still estimate that DeepSeek trails frontier US labs by about six months in software efficiency, even though the benchmark scores above are almost tied?", authored: "Being close on today's benchmarks and trailing in efficiency are compatible, not contradictory: a lab can catch up to a rival's current output level while still needing more resources, more iteration, or more time to get there, which is exactly what 'six months behind in efficiency' describes — DeepSeek reached a comparable result via a path that Epoch estimates a leading lab would have reached somewhat faster or cheaper. Benchmarks measure where a model ends up; efficiency measures how expensively it got there. A near-tie on the first doesn't rule out a real gap on the second, and the gap can close over time even while remaining real at any single moment." },
            ]}
          />
          <MCQuestion q={RQ1_QUESTIONS.mc} state={questionState} onAnswer={handleAnswer} />
          <NumericQuestion q={RQ1_QUESTIONS.numeric} state={questionState} onAnswer={handleNumeric} />
          <p>Put together, the evidence favors a specific, narrower version of the "sharpened, not stopped" thesis: the embargo did not stop China from reaching near-frontier capability, and it may have helped force the specific cost-efficiency innovations that let DeepSeek get there on a fraction of the compute — but "near-frontier" is not the same as "at the frontier," and Epoch AI's own six-month efficiency-gap estimate is a real, if narrowing, cost of the constraint.</p>
          <GlossaryPanel pageKey="rq1" />
        </section>

        {/* ============================= RQ2 ============================= */}
        <section id="sec-rq2" className="page-section">
          <h1>RQ2: What Zero China Revenue Actually Cost</h1>
          <p>Reaching zero was not free. Nvidia's own numbers put a real price tag on getting there: the $4.5 billion inventory charge, the roughly $2.5 billion of unshippable Q1 FY2026 revenue, and the roughly $8.0 billion of guided Q2 FY2026 H20 revenue loss are all real, disclosed, dollar-denominated costs directly attributable to the export-control regime (<FactTag tier="FACT" /> {src("nvdaq1fy26")}).</p>
          <p>The question this section asks is not whether the cost was real — it clearly was — but whether it was large or small next to everything else happening to Nvidia's business at the same time. The chart below places the China collapse next to the company's overall growth over the same twelve months.</p>
          <Chart5_Slope />
          <ChartInterpretation
            chartId="chart5"
            state={interpState}
            onSubmit={handleInterp}
            prompts={[
              { kind: "So-what / decision implication", prompt: "A Nvidia investor-relations team is drafting talking points for the Q1 FY2027 earnings call. Given this chart, what is the one thing they should feel comfortable saying about the China collapse?", authored: "They can accurately say something like: 'China data-center compute revenue reached zero this quarter, and total company revenue still grew 85% year-over-year' — because the chart shows total and Data Center revenue both accelerating even as the China line falls to zero, meaning the loss, while real and directly policy-caused, was fully absorbed by growth elsewhere. What they should NOT say is that the restriction was costless: $4.6 billion of quarterly revenue and untold future upside genuinely disappeared. It was affordable at the company level, not costless." },
              { kind: "Quantitative reasoning", prompt: "China data-center revenue was about what percentage of TOTAL Nvidia revenue in Q1 FY2026, and how does that percentage compare to the year-over-year growth rate of total revenue shown on the chart?", authored: "$4.6B ÷ $44.1B ≈ 10.4% of total Q1 FY2026 revenue. Total revenue then grew 85% year-over-year by Q1 FY2027 — a growth rate more than eight times larger than the entire share China represented a year earlier. In other words, one year's organic growth in the rest of the business was large enough to replace the entire lost China segment roughly eight times over. This is why the restriction, though a genuine and policy-caused loss, never showed up as a dent in Nvidia's overall growth trajectory — it was a real cost paid out of an extraordinarily large surplus, not a cost that threatened the business." },
            ]}
          />
          <MCQuestion q={RQ2_QUESTIONS.mc1} state={questionState} onAnswer={handleAnswer} />
          <MCQuestion q={RQ2_QUESTIONS.case} state={questionState} onAnswer={handleAnswer} consulting />
          <p>The honest section-level conclusion is a split verdict: the export-control regime imposed a real, measurable cost on Nvidia — billions of dollars in charges, unshipped orders, and foregone guidance — and that cost was, in the same year, dwarfed roughly eight-to-one by unrelated growth elsewhere. Both facts are true, and neither cancels the other.</p>
          <GlossaryPanel pageKey="rq2" />
        </section>

        {/* ============================= RQ3 ============================= */}
        <section id="sec-rq3" className="page-section">
          <h1>RQ3: Who's Winning, and What Would Change That?</h1>
          <p>By mid-2026, the clearest sign of where things stood was not in chip export data at all — it was in what American companies themselves were choosing to run their AI workloads on. Reporting based on OpenRouter, a platform developers use to access a range of AI models, found that Chinese-built models' share of US enterprise token usage averaged just 4.5% in the first half of 2025, rose to an 11% trailing-twelve-month average, then sat above 30% every week starting February 8, 2026, and peaked as high as 46% (<FactTag tier="FACT" /> {src("cnbc2026chinese")}).</p>
          <Chart6_ChineseShare />
          <ChartInterpretation
            chartId="chart6"
            state={interpState}
            onSubmit={handleInterp}
            prompts={[
              { kind: "Quantitative reasoning (predict first)", prompt: "Before checking the exact numbers: do you expect Chinese models' share of US enterprise token usage to have roughly doubled, roughly quadrupled, or grown by an order of magnitude (10x or more) between the H1 2025 average and the 2026 peak week? Write your guess, then compare it to the actual jump.", authored: "The actual jump is from a 4.5% average in H1 2025 to a peak of 46% in 2026 — roughly a 10x increase, at the high end of what most people guess. This matters because a 'gradual share gain' story (doubling or so) would suggest a slow-moving preference shift, while a roughly 10x jump concentrated mostly after February 2026 instead suggests something closer to a phase change in buyer behavior — consistent with the evidence below that rising US frontier-model prices, not just steady improvement in Chinese models, triggered a sudden reallocation of usage rather than a slow drift." },
              { kind: "Causal / comparative", prompt: "Chinese models' US enterprise usage share rose sharply at roughly the same time chip export controls were being tightened, reversed, and tightened again. Does this timing prove chip export policy caused American companies to adopt more Chinese AI models?", authored: "No — the timing is suggestive but the reporting points to a more direct, better-evidenced cause: US enterprises describe switching because of rising prices and closer-to-parity capability at competing labs (a 'tokenmaxxing' cost shock), not because of anything about chip export policy specifically. Chip policy's actual causal contribution, if any, looks indirect: it may have pushed Chinese labs toward extreme training-cost efficiency, which fed into low API prices, which then drove US enterprise adoption for reasons that have little to do with the chips themselves. Treating chip policy as the direct cause would skip over this indirect chain and the more immediate, better-evidenced cause: price." },
            ]}
          />
          <MCQuestion q={RQ3_QUESTIONS.mc1} state={questionState} onAnswer={handleAnswer} />
          <p>China's own supply chain gives the "who's winning" question a second dimension. Domestic semiconductor-equipment self-sufficiency rose from 25% in 2024 to 35% by the end of 2025, beating Beijing's own 30% target that had only been set in early 2025 (<FactTag tier="FACT" /> {src("scmp2026")}). Huawei has said it plans to roughly double output of its Ascend 910C AI chip to about 600,000 units in 2026, with total Ascend die output reaching as high as 1.6 million (<FactTag tier="FACT" /> {src("bloomberghuawei")}). DeepSeek's newest model, V4, is optimized to run on Huawei's chips rather than Nvidia's at all (<FactTag tier="FACT" /> {src("brookings2026")}).</p>
          <p>Perhaps the strangest evidence of all: by mid-2026, Chinese regulators were refusing to let domestic AI firms buy the very Nvidia H200 chips the Trump administration had explicitly cleared for export. One plausible reading, laid out in detail by Brookings analyst Mark MacCarthy, is that Beijing is playing a longer game — prioritizing durable domestic chip capability over near-term model quality, distrustful after watching Washington move the goalposts on the H20, and increasingly confident it can route around the embargo entirely through cheap energy, open-source models, and its own chips (<FactTag tier="FACT" /> {src("brookings2026")}). MacCarthy draws an explicit parallel to Visa and Mastercard, which China kept out of its domestic payments market for roughly two decades while UnionPay matured into a fully competitive rival (<FactTag tier="FACT" /> {src("brookings2026")}).</p>
          <MCQuestion q={RQ3_QUESTIONS.case} state={questionState} onAnswer={handleAnswer} consulting />
          <p>The section-level conclusion here resists a single scoreboard. On chip access, the US achieved something close to total exclusion. On model adoption inside the US itself and on the trajectory of China's domestic chip supply chain, the trend lines run the other way. Whether that adds up to a net US win, a net loss, or simply two different races being run at once is the unresolved question this article's evidence cannot fully settle — which is exactly why it belongs in the conclusion.</p>
          <GlossaryPanel pageKey="rq3" />
        </section>

        {/* ============================= LEARNING SUMMARY ============================= */}
        <section id="sec-summary" className="page-section">
          <h1>Learning Summary</h1>
          <h2>Score breakdown</h2>
          <div className="score-table">
            {Object.entries(scoreByType).map(([type, v]) => (
              <div key={type} className="score-row">
                <span>{type}</span>
                <span>{v.correct} / {v.total}</span>
              </div>
            ))}
          </div>
          <p className="numeric-bias-note">
            Numeric (Type D) questions: {numAnswered.length} of 2 answered, {numCorrect.length} within declared tolerance.
            {numericBias && (
              <> On average, your estimates were {numericBias.avg >= 0 ? "above" : "below"} the actual value by about {Math.abs(numericBias.avg).toFixed(0)}%
              {numericBias.avg >= 0 ? " (an over-estimation bias)" : " (an under-estimation bias)"} across {numericBias.n} numeric question{numericBias.n === 1 ? "" : "s"}.</>
            )}
            {numAnswered.length > 0 && " Review each question's “How to estimate this” box above if your estimate landed outside the band — it names the decomposition and bounds for a typical miss."}
          </p>

          <h2>Your governing insight</h2>
          <p>You saw six charts today. Before reading the article's own takeaways, write the single most non-obvious insight you would defend to a skeptical executive.</p>
          <textarea
            className="governing-input"
            rows={3}
            value={governingInsight}
            onChange={(e) => setGoverningInsight(e.target.value)}
            placeholder="Your one-sentence governing insight…"
          />
          {!governingRevealed && (
            <button className="btn-primary" disabled={governingInsight.trim().length < 15} onClick={() => setGoverningRevealed(true)}>
              Reveal the article's three insights
            </button>
          )}
          {governingRevealed && (
            <div className="insight-cards">
              <div className="insight-yours"><strong>Yours:</strong> {governingInsight}</div>
              <div className="how-your-insight-label">How your insight compares to the article's three:</div>
              <div className="insight-card">1. Success and failure are not opposites here — they're two different scorecards. The embargo achieved a nearly absolute win on its own narrow terms (zero China chip revenue) while the broader technology contest it was meant to help win looks, on the adoption-share evidence, closer to a wash or even a loss.</div>
              <div className="insight-card">2. Constraints can manufacture the very efficiency that erodes the constraint's strategic value — DeepSeek's forced frugality under a chip ceiling produced a cost structure that is now winning share inside the country that imposed the ceiling.</div>
              <div className="insight-card">3. A policy reversal is not the same as a policy result — Washington relaxed and re-tightened export rules four times in about eighteen months, and none of the relaxations moved actual Chinese purchasing behavior, because trust, once broken, doesn't reset just because a rule does.</div>
            </div>
          )}

          <h2>Apply It</h2>
          <div className="apply-it-block">
            <p><strong>(a) Transfer to a new context.</strong> A mid-size US health system spent $40 million over three years building an in-house AI documentation tool instead of licensing a vendor's tool for $2 million/year. Staff report the in-house tool is "about as good" as the vendor's on a small internal test set the health system itself designed and scored. Meanwhile, three competing hospital systems adopted the vendor's tool and report 15% faster clinician documentation time on an independently published benchmark. Write four labeled parts: (1) a one-sentence so-what thesis about what the health system should do, (2) the single load-bearing assumption that must hold, (3) the evidence that would most undermine it, (4) a one-line pre-mortem ("If this fails in 12 months, the most likely reason is ___").</p>
            <textarea className="apply-input" rows={6} value={applyA} onChange={(e) => setApplyA(e.target.value)} placeholder={"1) Thesis: …\n2) Load-bearing assumption: …\n3) Disconfirming evidence: …\n4) Pre-mortem: …"} />
            <p><strong>(b) Cross-link.</strong> Name one principle from a prior article (not today's) that reinforces or conflicts with today's thesis, and explain the connection in 2–3 sentences.</p>
            <textarea className="apply-input" rows={3} value={applyB} onChange={(e) => setApplyB(e.target.value)} placeholder="Your cross-link…" />
            <button className="btn-primary" onClick={() => setApplyGaps(evaluateApplyIt())}>Check my response</button>
            {applyEvaluated && (
              <div className="apply-feedback">
                <div className="apply-feedback-label">Structural check (not a keyword match — confirms all four labeled parts are present and substantive, then flags what's missing or weak):</div>
                <ul>{applyGaps.map((g, i) => <li key={i}>{g}</li>)}</ul>
                <p className="apply-note">Note: this is a local, evidence-based fallback check (no secure server-side model evaluation is wired into this static artifact). It verifies structure and length, not the quality of your reasoning — re-read your four parts against the article's evidence yourself: does each climb from observation to a quantified, decision-relevant implication?</p>
              </div>
            )}
          </div>

          <h2>Return to Section: Principles to Revisit</h2>
          {missedPrinciples.length === 0 ? (
            <p>No missed questions yet — or none answered. Answer questions throughout the article to populate this list.</p>
          ) : (
            <ul className="principles-list">
              {missedPrinciples.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          )}
        </section>

        {/* ============================= CONCLUSION ============================= */}
        <section id="sec-conclusion" className="page-section">
          <h1>Conclusion</h1>
          <p>The central challenge this article traced is not whether the chip embargo "worked" — by its own narrowest measure, cutting Nvidia's China chip revenue to zero, it plainly did — but whether that measure was ever the right scoreboard for the broader contest it was meant to serve. Under partial success, the most likely trajectory is a widening split: continued US dominance of the physical chip supply chain outside China, alongside continued Chinese gains in model efficiency, open-source distribution, and price-driven adoption inside markets the chips were never meant to protect.</p>
          <p>For external actors, the economic implication is that "the policy succeeded" and "the country is ahead" are separate claims requiring separate evidence — a US chipmaker's investors, a foreign government's trade negotiators, and a US enterprise CIO choosing a model vendor are all, in effect, reading different scoreboards from the same set of facts, and conflating them risks both overconfidence and overcorrection.</p>
          <p>The geopolitical and structural implication is that Beijing's choice to reject even chips Washington explicitly approved suggests trust, once spent through repeated policy reversal, does not automatically return when a rule is loosened — a pattern with obvious relevance well beyond semiconductors, anywhere a government asks a foreign counterparty to make long-term bets on regulatory stability it has not consistently provided.</p>
          <MCQuestion q={CONCLUSION_QUESTION} state={questionState} onAnswer={handleAnswer} />
          <p className="final-question">The most important unresolved question this article leaves open: if Chinese frontier AI capability keeps closing its remaining six-to-nine-month gap while chip self-sufficiency keeps climbing, at what point, if any, does "we kept the most advanced chips out of their hands" stop being a meaningful measure of who is ahead at all?</p>

          <h2>Sources</h2>
          <ul className="sources-list">
            {SOURCES.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
