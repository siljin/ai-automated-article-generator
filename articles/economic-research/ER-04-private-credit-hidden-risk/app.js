/* Interactive Research Article — The Private Credit Paradox
 * Domain: Finance & markets
 * Self-contained React learning artifact. This file is the readable source copy;
 * the same code is inlined into index.html for direct-file-open compatibility.
 *
 * DATA PROVENANCE TIERS (see sourcing-and-citations.md):
 *   FACT        = measured value from a citeable source (carries Source, Year)
 *   ESTIMATE    = derived by arithmetic/assumption from FACTs, rounded coarsely
 *   ILLUSTRATION= disclosed synthetic teaching values, never a headline claim
 */

const { useState, useMemo } = React;
const {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, Cell, ReferenceLine
} = Recharts;

const ACCENT = "#1d4ed8";
const GOOD = "#15803d";
const BAD = "#b91c1c";
const AMBER = "#d97706";

/* ============================= DATA ============================= */

// Chart 1 — market growth. 2024 is FACT; earlier years and forecast labelled ESTIMATE.
const growthData = [
  { year: "2015", aum: 0.5, tier: "EST" },
  { year: "2020", aum: 1.0, tier: "EST" },
  { year: "2024", aum: 2.0, tier: "FACT" },
  { year: "2028f", aum: 3.0, tier: "EST" }
];

// Chart 2 — volatility comparison. ILLUSTRATION (disclosed teaching values).
const volData = [
  { name: "Private credit\n(reported)", vol: 3.5, kind: "reported" },
  { name: "Public leveraged\nloans", vol: 9.0, kind: "public" },
  { name: "Private credit\n(un-smoothed est.)", vol: 10.5, kind: "unsmoothed" }
];

// Chart 3 — default rate depends on how you count.
const defaultData = [
  { name: "Leveraged loans\n(public, headline)", rate: 1.28, tier: "FACT" },
  { name: "Direct lending\n(headline, KBRA)", rate: 1.5, tier: "FACT" },
  { name: "Private credit\n(broad, incl. LMEs)", rate: 5.0, tier: "EST" }
];

// Chart 4 — PIK indicators (different denominators on purpose).
const pikData = [
  { name: "Investments\nwith any PIK", val: 11, note: "of all investments, Q1'25" },
  { name: "PIK loans as\n% of BDC assets", val: 12.8, note: "share of loan assets" },
  { name: "PIK loans amended\nAFTER origination", val: 56, note: "of PIK-bearing loans" },
  { name: "PIK conversions in\nFitch 2025 defaults", val: 60, note: "of that year's defaults" }
];

// Chart 5 — bank exposure estimates (measurement spread).
const bankData = [
  { name: "Fed Y-14: committed\nlines (largest banks)", val: 95, tier: "FACT" },
  { name: "Fed Y-14: utilized\n(drawn)", val: 56, tier: "FACT" },
  { name: "FSB: drawn+undrawn\n(members)", val: 220, tier: "FACT" },
  { name: "Commercial est.\n(low)", val: 270, tier: "EST" },
  { name: "Commercial est.\n(high)", val: 500, tier: "EST" }
];

/* ===================== SMALL UI PRIMITIVES ===================== */

function Tier({ t }) {
  const map = {
    FACT: { bg: "#dcfce7", fg: "#166534", label: "FACT" },
    EST: { bg: "#fef9c3", fg: "#854d0e", label: "ESTIMATE" },
    ILL: { bg: "#e0e7ff", fg: "#3730a3", label: "ILLUSTRATION" }
  };
  const s = map[t] || map.FACT;
  return React.createElement("span", { className: "tier", style: { background: s.bg, color: s.fg } }, s.label);
}

function Confidence({ value, onChange, disabled }) {
  return React.createElement("div", { className: "conf" },
    React.createElement("span", { className: "conf-label" }, "Confidence:"),
    ["Low", "Medium", "High"].map(function (c) {
      return React.createElement("button", {
        key: c,
        disabled: disabled,
        className: "conf-btn" + (value === c ? " conf-on" : ""),
        onClick: function () { onChange(c); }
      }, c);
    })
  );
}

/* ===================== MULTIPLE CHOICE ===================== */

function MC(props) {
  const { id, qType, prompt, caseClient, options, correct, explain, state, setState } = props;
  const st = state[id] || { submitted: false, selected: null, confidence: null };
  const submitted = st.submitted;

  function pick(i) {
    if (submitted) return;
    setState(id, Object.assign({}, st, { selected: i }));
  }
  function submit() {
    if (st.selected == null || !st.confidence) return;
    setState(id, Object.assign({}, st, { submitted: true, correct: st.selected === correct }));
  }

  const isCase = qType === "Case";
  return React.createElement("div", { className: "q" + (isCase ? " q-case" : "") },
    React.createElement("div", { className: "q-type" }, isCase ? "Consulting case" : ("Question · " + qType)),
    caseClient && React.createElement("div", { className: "case-prompt" }, "Case Prompt — ", caseClient),
    React.createElement("div", { className: "q-prompt" }, prompt),
    React.createElement("div", { className: "opts" },
      options.map(function (opt, i) {
        var cls = "opt";
        if (submitted) {
          if (i === correct) cls += " opt-correct";
          else if (i === st.selected) cls += " opt-wrong";
        } else if (i === st.selected) cls += " opt-sel";
        return React.createElement("button", { key: i, className: cls, onClick: function () { pick(i); } },
          React.createElement("span", { className: "opt-letter" }, "ABCD"[i]),
          React.createElement("span", null, opt)
        );
      })
    ),
    !submitted && React.createElement(Confidence, {
      value: st.confidence,
      onChange: function (c) { setState(id, Object.assign({}, st, { confidence: c })); }
    }),
    !submitted && React.createElement("button", {
      className: "submit", disabled: st.selected == null || !st.confidence, onClick: submit
    }, "Submit"),
    submitted && React.createElement("div", { className: "explain" },
      React.createElement("div", { className: "verdict " + (st.correct ? "v-ok" : "v-no") },
        st.correct ? "Correct" : "Not quite — correct answer: " + "ABCD"[correct]),
      React.createElement(CalNote, { conf: st.confidence, correct: st.correct }),
      React.createElement("div", { className: "explain-body", dangerouslySetInnerHTML: { __html: explain } })
    )
  );
}

function CalNote({ conf, correct }) {
  var msg;
  if (conf === "High" && !correct) msg = "High confidence, incorrect — this is the gap most worth closing.";
  else if (conf === "Low" && correct) msg = "Low confidence, correct — trust this line of reasoning more.";
  else if (conf === "High" && correct) msg = "High confidence, correct — well calibrated.";
  else msg = "Low/medium confidence — note whether the reasoning, not luck, got you here.";
  return React.createElement("div", { className: "cal" }, msg);
}

/* ===================== NUMERIC ESTIMATION ===================== */

function Numeric(props) {
  const { id, prompt, unit, min, max, step, target, band, fermi, explain, scaffold, state, setState } = props;
  const st = state[id] || { submitted: false, value: (min + max) / 2, confidence: null };
  const submitted = st.submitted;

  function submit() {
    if (!st.confidence) return;
    var v = Number(st.value);
    var ok;
    if (fermi) {
      var ratio = v > 0 ? v / target : 0;
      ok = ratio >= 1 / fermi && ratio <= fermi;
    } else {
      ok = Math.abs(v - target) <= band;
    }
    setState(id, Object.assign({}, st, { submitted: true, correct: ok }));
  }

  var axisMin = min, axisMax = max;
  var userPct = ((Number(st.value) - axisMin) / (axisMax - axisMin)) * 100;
  var targetPct = ((target - axisMin) / (axisMax - axisMin)) * 100;

  return React.createElement("div", { className: "q" },
    React.createElement("div", { className: "q-type" }, "Question · Numeric estimation" + (fermi ? " (Fermi)" : "")),
    React.createElement("div", { className: "q-prompt" }, prompt),
    scaffold && React.createElement("div", { className: "scaffold", dangerouslySetInnerHTML: { __html: scaffold } }),
    React.createElement("div", { className: "num-row" },
      React.createElement("input", {
        type: "range", min: min, max: max, step: step, value: st.value, disabled: submitted,
        onChange: function (e) { setState(id, Object.assign({}, st, { value: e.target.value })); }
      }),
      React.createElement("input", {
        type: "number", className: "num-in", min: min, max: max, step: step, value: st.value, disabled: submitted,
        onChange: function (e) { setState(id, Object.assign({}, st, { value: e.target.value })); }
      }),
      React.createElement("span", { className: "unit" }, unit)
    ),
    !submitted && React.createElement(Confidence, {
      value: st.confidence,
      onChange: function (c) { setState(id, Object.assign({}, st, { confidence: c })); }
    }),
    !submitted && React.createElement("button", { className: "submit", disabled: !st.confidence, onClick: submit }, "Submit estimate"),
    submitted && React.createElement("div", { className: "explain" },
      React.createElement("div", { className: "dist" },
        React.createElement("div", { className: "dist-track" },
          React.createElement("div", { className: "dist-tick user", style: { left: Math.max(0, Math.min(100, userPct)) + "%" } }),
          React.createElement("div", { className: "dist-tick actual", style: { left: Math.max(0, Math.min(100, targetPct)) + "%" } })
        ),
        React.createElement("div", { className: "dist-legend" },
          React.createElement("span", null, "▲ your estimate: " + st.value + unit),
          React.createElement("span", null, "◆ actual: ~" + target + unit)
        )
      ),
      React.createElement("div", { className: "verdict " + (st.correct ? "v-ok" : "v-no") },
        st.correct ? "Within tolerance" : "Outside tolerance"),
      React.createElement(CalNote, { conf: st.confidence, correct: st.correct }),
      React.createElement("div", { className: "explain-body", dangerouslySetInnerHTML: { __html: explain } })
    )
  );
}

/* ===================== CHART BLOCK ===================== */
/* Renders a chart (all values visible) + two independent interpretation prompts.
 * Each authored answer is conditionally rendered only after the reader submits. */

function ChartBlock(props) {
  const { chart, interp, setInterp } = props;
  const state = interp[chart.id] || { texts: ["", ""], self: "", submitted: [false, false] };

  function change(i, v) {
    var texts = state.texts.slice(); texts[i] = v;
    setInterp(chart.id, Object.assign({}, state, { texts: texts }));
  }
  function submitOne(i) {
    if ((state.texts[i] || "").trim().length < 15) return;
    var sub = state.submitted.slice(); sub[i] = true;
    setInterp(chart.id, Object.assign({}, state, { submitted: sub }));
  }

  return React.createElement("div", { className: "chartblock" },
    React.createElement("div", { className: "chart-title" }, chart.title),
    chart.render(),
    React.createElement("div", { className: "chart-note" }, chart.note),
    chart.prompts.map(function (p, i) {
      return React.createElement("div", { key: i, className: "interp" },
        React.createElement("div", { className: "interp-kind" }, p.kind),
        React.createElement("div", { className: "interp-q" }, p.q),
        React.createElement("textarea", {
          className: "interp-ta", rows: 2, placeholder: "Write at least 15 characters…",
          value: state.texts[i], disabled: state.submitted[i],
          onChange: function (e) { change(i, e.target.value); }
        }),
        !state.submitted[i] && React.createElement("button", {
          className: "submit sm", disabled: (state.texts[i] || "").trim().length < 15,
          onClick: function () { submitOne(i); }
        }, "Reveal authored answer"),
        state.submitted[i] && React.createElement("div", { className: "authored-interpretation" },
          React.createElement("div", { className: "auth-label" }, "Compare your answer to the authored one"),
          React.createElement("div", { dangerouslySetInnerHTML: { __html: p.answer } })
        )
      );
    })
  );
}

/* ===================== CHART RENDERERS ===================== */

function labelData(entry) { return entry.aum + "T"; }

const CHART1 = {
  id: "c1",
  title: "Chart 1 — Private credit assets under management, 2015 to 2028 (US$ trillion)",
  note: "2024 value is a FACT (FSB 2026; IMF GFSR April 2024, ~$2.1tn incl. committed capital). 2015 and 2020 are widely-cited ESTIMATE order-of-magnitude figures; 2028f is an industry ESTIMATE/forecast — not a measured value.",
  render: function () {
    return React.createElement(ResponsiveContainer, { width: "100%", height: 260 },
      React.createElement(BarChart, { data: growthData, margin: { top: 24, right: 16, left: 0, bottom: 4 } },
        React.createElement(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
        React.createElement(XAxis, { dataKey: "year" }),
        React.createElement(YAxis, { domain: [0, 3.5], tickFormatter: function (v) { return "$" + v + "T"; } }),
        React.createElement(Tooltip, { formatter: function (v) { return "$" + v + "T"; } }),
        React.createElement(Bar, { dataKey: "aum", fill: ACCENT, radius: [4, 4, 0, 0] },
          React.createElement(LabelList, { dataKey: "aum", position: "top", formatter: function (v) { return "$" + v + "T"; } }),
          growthData.map(function (d, i) {
            return React.createElement(Cell, { key: i, fill: d.tier === "FACT" ? ACCENT : "#93b4f5" });
          })
        )
      )
    );
  },
  prompts: [
    {
      kind: "So-what / decision implication",
      q: "In one sentence: what should a pension fund's investment committee do differently on hearing that this asset class quadrupled in a decade?",
      answer: "Fast growth is a reason for <b>more</b> scrutiny, not comfort. A committee should treat rapid inflows as a signal that pricing discipline may be loosening (too much money chasing deals), and demand that any allocation be sized to what they could stomach if the exit door narrows — because the market has grown mostly during an era of easy fundraising and has not yet been marked through a full default cycle. <i>Growth is a flow into an untested stock.</i>"
    },
    {
      kind: "Quantitative reasoning (predict the magnitude first)",
      q: "Before reading on, predict: roughly what compound annual growth rate (CAGR) turned ~$1.0T in 2020 into ~$2.0T in 2024? State a number, then say why that pace is hard to sustain.",
      answer: "A double over four years is a CAGR of about <b>19%</b> (2^(1/4) − 1 ≈ 0.189). That pace is hard to sustain because it compounds off a much larger base: holding 19% growth from a $2T base means adding ~$0.4T of new loans every year, which requires both willing borrowers and lenders' ability to keep underwriting well as deal quality thins. <i>A high growth rate off a small base is ordinary; the same rate off a large base is a warning.</i>"
    }
  ]
};

const CHART2 = {
  id: "c2",
  title: "Chart 2 — Reported vs. un-smoothed annual volatility (illustrative teaching values, % per year)",
  note: "ILLUSTRATION — synthetic teaching values, not reported statistics. They show the shape of the 'volatility laundering' argument (Asness/AQR): appraisal-based marks lag market prices by roughly six months, so measured swings look small. The un-smoothed bar is what volatility tends to look like once you correct for stale marks; the exact height is illustrative.",
  render: function () {
    return React.createElement(ResponsiveContainer, { width: "100%", height: 280 },
      React.createElement(BarChart, { data: volData, margin: { top: 24, right: 16, left: 0, bottom: 24 } },
        React.createElement(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
        React.createElement(XAxis, { dataKey: "name", interval: 0, tick: { fontSize: 11 } }),
        React.createElement(YAxis, { domain: [0, 12], tickFormatter: function (v) { return v + "%"; } }),
        React.createElement(Tooltip, { formatter: function (v) { return v + "%"; } }),
        React.createElement(Bar, { dataKey: "vol", radius: [4, 4, 0, 0] },
          React.createElement(LabelList, { dataKey: "vol", position: "top", formatter: function (v) { return v + "%"; } }),
          volData.map(function (d, i) {
            return React.createElement(Cell, { key: i, fill: d.kind === "reported" ? "#93b4f5" : d.kind === "public" ? "#64748b" : BAD });
          })
        )
      )
    );
  },
  prompts: [
    {
      kind: "Quantitative reasoning",
      q: "Estimate the ratio of the un-smoothed volatility to the reported volatility. What does a ratio that size imply about a Sharpe ratio (return per unit of risk) built on the reported number?",
      answer: "About <b>3×</b> (≈10.5% ÷ 3.5%). Since a Sharpe ratio divides return by volatility, using a volatility that is one-third of the true figure roughly <b>triples</b> the apparent Sharpe. The headline 'great risk-adjusted returns' is largely an artifact of the denominator, not the numerator. <i>When risk is mismeasured, every risk-adjusted metric built on it inherits the error.</i>"
    },
    {
      kind: "Causal / mechanism",
      q: "Why does valuing a loan book by occasional appraisal, rather than daily market prices, make volatility look low — even if the underlying credit risk is unchanged?",
      answer: "Daily market prices react to every piece of bad news; appraisals happen quarterly and lean on the last mark, so they move in small, lagged steps. That serial smoothing mechanically shrinks measured standard deviation and cuts the measured correlation with public markets — the risk is still there, it is just not being <i>recorded</i>. This is why smoothed private assets can look like diversifiers: the diversification is partly a reporting lag, not a real difference in exposure."
    }
  ]
};

const CHART3 = {
  id: "c3",
  title: "Chart 3 — Private credit default rate depends on how you count (% of loans)",
  note: "Headline rates are FACTs: KBRA Direct Lending Index trailing-12-month par-weighted default 1.5% and leveraged-loan default 1.28% (J.P. Morgan Default Monitor, June 2026). The ~5% 'broad' figure is an ESTIMATE from analysts that adds selective defaults and liability-management exercises (LMEs) — distressed debt restructurings that avoid a formal default label.",
  render: function () {
    return React.createElement(ResponsiveContainer, { width: "100%", height: 260 },
      React.createElement(BarChart, { data: defaultData, margin: { top: 24, right: 16, left: 0, bottom: 24 } },
        React.createElement(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
        React.createElement(XAxis, { dataKey: "name", interval: 0, tick: { fontSize: 11 } }),
        React.createElement(YAxis, { domain: [0, 6], tickFormatter: function (v) { return v + "%"; } }),
        React.createElement(Tooltip, { formatter: function (v) { return v + "%"; } }),
        React.createElement(Bar, { dataKey: "rate", radius: [4, 4, 0, 0] },
          React.createElement(LabelList, { dataKey: "rate", position: "top", formatter: function (v) { return v + "%"; } }),
          defaultData.map(function (d, i) {
            return React.createElement(Cell, { key: i, fill: d.tier === "FACT" ? "#64748b" : BAD });
          })
        )
      )
    );
  },
  prompts: [
    {
      kind: "So-what / decision implication",
      q: "If you were setting loss reserves for an insurer that holds private credit, which number would you plan around, and what would you demand from the manager to defend that choice?",
      answer: "Plan around the broad ~5% figure (or higher for weaker vintages), not the 1.5% headline. Demand a loan-by-loan list of every amendment, PIK conversion, and covenant waiver, because those are where distress hides before it is labelled a default. <i>Reserve against the definition that captures economic loss, not the one that flatters the report.</i>"
    },
    {
      kind: "Causal / comparative",
      q: "The headline default rate and the broad rate describe the same portfolio. Why can they differ by roughly 3× without either being 'wrong'?",
      answer: "They use different definitions of the event. The headline counts only formal payment defaults; the broad figure also counts distressed restructurings (LMEs) and selective defaults that keep a loan technically 'current.' In private credit, a lender and borrower can quietly amend terms rather than trigger a default, so the softer the definition, the lower the count. <i>A rate is only as meaningful as the event definition behind it — always ask what counts as the numerator.</i>"
    }
  ]
};

const CHART4 = {
  id: "c4",
  title: "Chart 4 — Four ways to measure payment-in-kind (PIK) stress (%, different denominators)",
  note: "FACTs from 2025–2026 disclosures and Fitch/Bloomberg reporting. WARNING: each bar uses a different denominator — do not read them as one scale. 'Investments with any PIK' and 'PIK as % of BDC assets' are shares of the whole book; '56% amended after origination' is a share of only the PIK-bearing loans; '60% of Fitch 2025 defaults' is a share of that year's defaults.",
  render: function () {
    return React.createElement(ResponsiveContainer, { width: "100%", height: 280 },
      React.createElement(BarChart, { data: pikData, margin: { top: 24, right: 16, left: 0, bottom: 28 } },
        React.createElement(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
        React.createElement(XAxis, { dataKey: "name", interval: 0, tick: { fontSize: 10 } }),
        React.createElement(YAxis, { domain: [0, 70], tickFormatter: function (v) { return v + "%"; } }),
        React.createElement(Tooltip, { formatter: function (v, n, p) { return v + "% (" + p.payload.note + ")"; } }),
        React.createElement(Bar, { dataKey: "val", fill: AMBER, radius: [4, 4, 0, 0] },
          React.createElement(LabelList, { dataKey: "val", position: "top", formatter: function (v) { return v + "%"; } })
        )
      )
    );
  },
  prompts: [
    {
      kind: "Causal / mechanism",
      q: "Only 11% of investments carry any PIK, yet 56% of PIK loans were switched to PIK after the deal closed. Explain why the 56% figure is the more worrying one.",
      answer: "PIK written at origination can be a deliberate structure for a growing company. PIK <b>added later</b> usually means the borrower could no longer pay cash interest and the lender amended the loan to avoid a default — distress, not design. So the scary signal is not how much PIK exists, but how much of it was <b>created under stress</b>: 56% of it. <i>The composition of a number often matters more than its level.</i>"
    },
    {
      kind: "So-what / decision implication",
      q: "PIK interest still counts as income on a fund's books even though no cash arrives. What should that tell an investor comparing two BDCs' reported yields?",
      answer: "A high reported yield can be partly non-cash 'accrued' income that may never be collected, so two BDCs with the same headline yield can be very different in cash quality. The investor should compare <b>cash</b> net investment income to distributions, not book yield — a fund paying dividends while booking rising PIK is potentially distributing capital, not earnings. <i>Accrual income is a promise; cash is the fact — reconcile them before trusting a yield.</i>"
    }
  ]
};

const CHART5 = {
  id: "c5",
  title: "Chart 5 — How large is banks' exposure to private credit? Estimates disagree (US$ billion)",
  note: "The two Fed bars are FACTs from supervisory Y-14 data (Federal Reserve FEDS Note, May 2025): ~$95bn committed and ~$56bn drawn by the largest US banks as of 2024-Q4. The FSB member-wide figure (~$220bn drawn+undrawn) is a FACT (FSB, May 2026). The $270–500bn commercial range is an ESTIMATE cited by the FSB. Different scopes and definitions, not one clean measurement.",
  render: function () {
    return React.createElement(ResponsiveContainer, { width: "100%", height: 280 },
      React.createElement(BarChart, { data: bankData, margin: { top: 24, right: 16, left: 8, bottom: 28 } },
        React.createElement(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
        React.createElement(XAxis, { dataKey: "name", interval: 0, tick: { fontSize: 10 } }),
        React.createElement(YAxis, { domain: [0, 550], tickFormatter: function (v) { return "$" + v + "B"; } }),
        React.createElement(Tooltip, { formatter: function (v) { return "$" + v + "B"; } }),
        React.createElement(Bar, { dataKey: "val", radius: [4, 4, 0, 0] },
          React.createElement(LabelList, { dataKey: "val", position: "top", formatter: function (v) { return "$" + v + "B"; } }),
          bankData.map(function (d, i) {
            return React.createElement(Cell, { key: i, fill: d.tier === "FACT" ? ACCENT : "#93b4f5" });
          })
        )
      )
    );
  },
  prompts: [
    {
      kind: "Quantitative reasoning",
      q: "From the two Fed bars, compute the utilization rate (drawn ÷ committed). Why does an undrawn commitment still matter for a bank in a downturn?",
      answer: "Utilization is about <b>59%</b> ($56B ÷ $95B). The undrawn ~41% matters because borrowers tend to draw credit lines exactly when conditions worsen — so a bank's true exposure can jump toward the committed figure in a stress event, precisely when the bank least wants it. <i>Committed-but-undrawn is contingent leverage: it shows up when correlation across the system is highest.</i>"
    },
    {
      kind: "Causal / comparative",
      q: "The Fed sees ~$95bn while commercial estimates reach $500bn. What is the most likely reason for a 5× spread, and what does it imply for anyone claiming the risk is 'contained'?",
      answer: "The spread reflects <b>different scopes and definitions</b>, not disagreement about one measured number: the Fed's Y-14 captures only the largest US banks' direct lines, while broader estimates add other lenders, indirect links, insurers, and undrawn facilities. A 5× measurement gap means no one can yet size the true interconnection, so 'the risk is contained' is an assertion the data cannot support. <i>When the error bars are wider than the headline, uncertainty is the finding.</i>"
    }
  ]
};

/* ===================== SECTIONS CONTENT ===================== */
/* Each section: prose paragraphs (plain language), charts, scored questions, glossary. */

// helper to render prose paragraphs
function P(children) { return React.createElement("p", { className: "prose" }, children); }

/* ===================== APP ===================== */

function App() {
  const [current, setCurrent] = useState(0);
  const [qstate, setQstate] = useState({});
  const [interp, setInterpState] = useState({});
  const [governing, setGoverning] = useState("");
  const [applyA, setApplyA] = useState({ thesis: "", assumption: "", disconfirm: "", premortem: "" });
  const [applyB, setApplyB] = useState("");
  const [applyResult, setApplyResult] = useState(null);
  const [summaryShown, setSummaryShown] = useState(false);

  function setQ(id, v) { setQstate(function (s) { var n = Object.assign({}, s); n[id] = v; return n; }); }
  function setInterp(id, v) { setInterpState(function (s) { var n = Object.assign({}, s); n[id] = v; return n; }); }

  // ---- required keys per section for gating ----
  const sectionReqs = [
    { q: ["w1", "w2", "w3"], i: [] },                                  // 0 Warm-up
    { q: [], i: [] },                                                  // 1 Introduction (no gate questions)
    { q: ["s2q1", "s2q2"], i: ["c1"] },                               // 2 Background
    { q: ["s3q1", "s3q2"], i: ["c2"] },                               // 3 Q1 volatility
    { q: ["s4q1", "s4q2", "s4q3"], i: ["c3", "c4"] },                 // 4 Q2 defaults
    { q: ["s5q1", "s5q2"], i: ["c5"] },                               // 5 Q3 stability
    { q: [], i: [] },                                                  // 6 Summary (handled separately)
    { q: ["ce"], i: [] }                                              // 7 Conclusion
  ];

  function sectionComplete(idx) {
    var r = sectionReqs[idx];
    if (!r) return true;
    var qok = r.q.every(function (id) { return qstate[id] && qstate[id].submitted; });
    var iok = r.i.every(function (id) { return interp[id] && interp[id].submitted && interp[id].submitted[0] && interp[id].submitted[1]; });
    return qok && iok;
  }

  // score
  const scored = useMemo(function () {
    var mc = 0, num = 0, total = 0;
    Object.keys(qstate).forEach(function (k) {
      var v = qstate[k];
      if (v && v.submitted) { total++; if (v.correct) { mc++; } }
    });
    return { correct: mc, answered: total };
  }, [qstate]);

  const totalScored = 13;

  const SECTIONS = buildSections({ qstate, setQ, interp, setInterp });

  function goNext() {
    // Summary gate: before unlocking conclusion (index 7), summary (index 6) must be completed
    if (current === 5) { setCurrent(6); window.scrollTo(0, 0); return; }
    if (current < SECTIONS.length - 1) { setCurrent(current + 1); window.scrollTo(0, 0); }
  }
  function goPrev() { if (current > 0) { setCurrent(current - 1); window.scrollTo(0, 0); } }

  var progress = ((current) / (SECTIONS.length - 1)) * 100;

  return React.createElement("div", null,
    React.createElement("div", { className: "topbar" },
      React.createElement("div", { className: "topfill", style: { width: progress + "%" } })
    ),
    React.createElement("div", { className: "scorebadge" },
      "Score " + scored.correct + " / " + totalScored + " · Section " + (current + 1) + " of " + SECTIONS.length),
    React.createElement("div", { className: "wrap" },
      current === 6
        ? React.createElement(Summary, {
            qstate: qstate, interp: interp, scored: scored,
            governing: governing, setGoverning: setGoverning,
            applyA: applyA, setApplyA: setApplyA, applyB: applyB, setApplyB: setApplyB,
            applyResult: applyResult, setApplyResult: setApplyResult,
            onContinue: function () { setSummaryShown(true); setCurrent(7); window.scrollTo(0, 0); }
          })
        : SECTIONS[current].node,
      current !== 6 && React.createElement("div", { className: "nav" },
        React.createElement("button", { className: "navbtn", onClick: goPrev, disabled: current === 0 }, "◀ Previous"),
        current < SECTIONS.length - 1 && React.createElement("button", {
          className: "navbtn primary", onClick: goNext, disabled: !sectionComplete(current)
        }, sectionComplete(current) ? (current === 5 ? "Go to Learning Summary ▶" : "Next section ▶") : "🔒 Answer required items to continue")
      )
    )
  );
}

/* ===================== SECTION BUILDER ===================== */

function Glossary({ items }) {
  if (!items || !items.length) return null;
  return React.createElement("div", { className: "glossary" },
    React.createElement("div", { className: "gloss-label" }, "Glossary"),
    items.map(function (it, i) {
      return React.createElement("div", { key: i, className: "gloss-item" },
        React.createElement("b", null, it.t), " — ", it.d);
    })
  );
}

function buildSections(ctx) {
  const { qstate, setQ, interp, setInterp } = ctx;
  const mc = function (p) { return React.createElement(MC, Object.assign({ state: qstate, setState: setQ }, p)); };
  const num = function (p) { return React.createElement(Numeric, Object.assign({ state: qstate, setState: setQ }, p)); };
  const chart = function (c) { return React.createElement(ChartBlock, { chart: c, interp: interp, setInterp: setInterp }); };

  // ---------- 0. WARM-UP ----------
  const warmup = React.createElement("div", null,
    React.createElement("h1", null, "Warm-Up: What stuck?"),
    React.createElement("p", { className: "lede" }, "Three quick questions from earlier articles. They are not about today's topic — the point is to pull a principle out of memory and apply it to a new situation. Answer all three to unlock the article."),
    mc({
      id: "w1", qType: "B",
      prompt: "In the Stripe piece, the lesson was that an AI feature's feasibility is gated by your position in the data-generating process — whether the product itself throws off fresh, representative, ground-truth labels. A logistics startup wants to predict which shipments will be late, but it only learns the true delivery time for ~15% of shipments, months later. Applying the Stripe principle, what is the single biggest problem?",
      options: [
        "The model architecture is probably too simple for the task",
        "Labels are sparse and badly delayed, so the product cannot yet feed the model fresh ground truth — fix the label pipeline before picking a model",
        "They should collect more input features about each shipment",
        "They should benchmark three vendors' models before deciding"
      ],
      correct: 1,
      explain: "<b>Principle:</b> feasibility follows the data-generating process, not the model. A 15%, months-late label stream cannot support a model that needs to learn from outcomes quickly. <b>Why the others miss:</b> (A) blames architecture — the same misstep of choosing the model first; (C) more inputs don't help if you rarely learn the answer; (D) vendor bake-offs are premature when the label supply is the binding constraint. <b>Where this generalizes:</b> any forecasting product — fraud, churn, demand — is capped by how fast and how completely it observes the truth it is trying to predict."
    }),
    mc({
      id: "w2", qType: "E",
      prompt: "The disinflation article argued that when inflation falls without the usual rise in unemployment, the fall was probably supply-driven, and named 'expectations stay anchored' as the load-bearing assumption. A country's inflation just dropped from 8% to 4% with almost no rise in joblessness. Which move best matches that article's reasoning?",
      options: [
        "Conclude the central bank's rate hikes clearly caused the drop",
        "Assume the disinflation will reverse within a year regardless of conditions",
        "Separate the number from the mechanism: check whether supply healed and whether expectations are still anchored before crediting policy",
        "Ignore expectations because they cannot be measured"
      ],
      correct: 2,
      explain: "<b>Principle:</b> a falling rate (the number) and the reason it fell (the mechanism) are different claims; a painless disinflation points to supply, and the whole story rests on anchored expectations. <b>Why the others miss:</b> (A) assumes causation from correlation; (B) extrapolates a reversal with no trigger; (D) discards the exact variable that would falsify the thesis. <b>Where this generalizes:</b> any time an outcome improves 'for free,' ask which mechanism did the work and which assumption would flip the verdict."
    }),
    mc({
      id: "w3", qType: "B",
      prompt: "The Airbnb model-vs-heuristic article concluded that a model earns its keep only when it can use context a simple rule structurally cannot — otherwise the transparent heuristic wins net of cost. A team's fraud rule flags any transaction over $500. They want to replace it with a model. When is the model most clearly justified?",
      options: [
        "When the model can weigh combinations of signals a fixed threshold cannot — device, history, timing, location together — and that context changes who is risky",
        "When the model achieves higher accuracy on the training data",
        "Whenever a model is available, since models are more modern than rules",
        "When leadership wants to say the company uses machine learning"
      ],
      correct: 0,
      explain: "<b>Principle:</b> models beat rules only where context the rule can't encode changes the answer. <b>Why the others miss:</b> (B) training accuracy invites overfitting and ignores cost and maintenance; (C) and (D) are cargo-cult reasons, not value reasons. <b>Where this generalizes:</b> before replacing any heuristic — pricing, routing, ranking — ask what context the model would exploit that the rule cannot, and whether that context actually moves the decision."
    }),
    React.createElement(Glossary, { items: [
      { t: "Data-generating process", d: "How and how often a product observes the real outcomes it is trying to predict." },
      { t: "Load-bearing assumption", d: "The one belief a thesis depends on; if it fails, the conclusion collapses." },
      { t: "Heuristic", d: "A simple, transparent rule of thumb used instead of a statistical model." }
    ] })
  );

  // ---------- 1. INTRODUCTION ----------
  const intro = React.createElement("div", null,
    React.createElement("div", { className: "domain-tag" }, "Finance & markets"),
    React.createElement("h1", null, "The Private Credit Paradox: When Low Risk Is a Measurement Choice"),
    P([
      "Private credit — loans made directly by investment funds instead of banks or bond markets — has grown from a niche of a few hundred billion dollars to roughly ",
      React.createElement("b", null, "$2 trillion"), " in about a decade, and it reports steadier returns and lower losses than the public high-yield and leveraged-loan markets it competes with (FSB, 2026; IMF, 2024). ",
      "Yet it is less liquid, less transparent, and has never been marked through a full default cycle."
    ]),
    P([
      "To see the scale: about three-quarters of the market is in the United States, where it now rivals the size of the broadly syndicated loan market and the high-yield bond market (IMF, 2024). ",
      "Business development companies (BDCs) — listed or private funds that hold these loans — alone grew from just over $100 billion in assets in 2020 to about $475 billion in early 2025 (Apollo, 2025). ",
      "The pitch to investors is simple: higher yield, lower volatility, smoother ride."
    ]),
    P([
      "That pitch runs against a basic rule of finance: you are not usually paid more for taking less risk. ",
      "If private credit truly offered public-market returns with a fraction of the swings, capital would flood in until the extra reward disappeared. ",
      "So either the market has found a durable free lunch, or the ",
      React.createElement("i", null, "low risk is partly a product of how the assets are measured"), " — and the bill has not yet arrived."
    ]),
    P([
      "This note asks three questions. First, is private credit's low reported volatility real, or an artifact of how the loans are valued? ",
      "Second, does the headline default rate reflect true credit performance, or do accounting choices mask distress? ",
      "Third, what does the market's fast growth and its tightening links to banks and insurers imply for financial stability — and for the people now exposed to it?"
    ]),
    React.createElement(Glossary, { items: [
      { t: "Private credit", d: "Loans made directly by investment funds to companies, outside banks and public bond markets." },
      { t: "Volatility", d: "How much an investment's value swings up and down; used as a common measure of risk." },
      { t: "Liquidity", d: "How easily an asset can be sold for cash at a fair price without moving the price." },
      { t: "Leveraged loan", d: "A loan to an already-indebted company, usually traded among many investors in a public-ish market." },
      { t: "High-yield bond", d: "A bond from a riskier borrower that pays more interest to compensate; also called a 'junk' bond." },
      { t: "Business development company (BDC)", d: "A fund, sometimes listed on an exchange, that pools money to make private loans to mid-sized firms." }
    ] })
  );

  // ---------- 2. BACKGROUND ----------
  const background = React.createElement("div", null,
    React.createElement("h1", null, "Background — How a Niche Became a $2 Trillion Market"),
    P([
      "After the 2008 crisis, new rules made it costlier for banks to hold risky corporate loans. ",
      "Lending to mid-sized companies did not stop — it moved. ",
      "Investment funds stepped in, raised long-term money from pensions and insurers, and lent it directly. ",
      "Because that money is locked up for years, the funds can hold loans that do not trade, and charge borrowers extra for speed, certainty, and privacy."
    ]),
    P([
      "Direct lending — one lender or a small club making a loan and holding it to maturity — is now about two-thirds of the private credit market (Mordor, 2025). ",
      "The rest spans distressed debt, mezzanine, and asset-based lending. ",
      "The chart below shows the climb."
    ]),
    chart(CHART1),
    num({
      id: "s2q1", unit: "%", min: 0, max: 40, step: 0.5, target: 18.9, band: 2.5,
      prompt: "Estimate the compound annual growth rate (CAGR) that turns ~$1.0T (2020) into ~$2.0T (2024). Enter a percentage.",
      scaffold: "Decomposition skeleton: CAGR = (end ÷ start)^(1 ÷ years) − 1. Here end÷start = 2.0÷1.0 = 2, over 4 years, so CAGR = 2^(1/4) − 1.",
      explain: "<b>How to estimate this:</b> 2^(1/4) − 1 = 1.189 − 1 ≈ <b>18.9%</b>. Bounds: a double in 3 years is ~26%; in 5 years ~15% — so any answer far outside 15–26% ignores the arithmetic. Tolerance ±2.5 points (tight, because this is a definitional calculation, not a Fermi guess). <b>Where this generalizes:</b> the 'rule of 72' shortcut — 72 ÷ years-to-double ≈ growth rate — gives 72÷4 = 18%, a fast sanity check."
    }),
    P([
      "Growth alone is not the worry; ",
      React.createElement("i", null, "how"), " the newest money is packaged is. ",
      "A rising share of inflows comes through 'semi-liquid' or 'evergreen' funds that let everyday wealthy investors put money in and ask for some of it back each quarter. ",
      "These vehicles are now almost a third of the roughly $1 trillion US direct lending market (McKinsey, 2025). ",
      "The loans inside them, though, can take years to repay."
    ]),
    mc({
      id: "s2q2", qType: "B",
      prompt: "Semi-liquid funds promise quarterly redemptions but hold loans that take years to repay. In a stress episode, which failure mode does this structure most directly create?",
      options: [
        "Borrowers suddenly repay their loans early, flooding the fund with cash",
        "The fund's management fee rises automatically with volatility",
        "Interest rates on the underlying loans reset upward, boosting returns",
        "A liquidity mismatch: many investors ask for cash at once while the assets can't be sold quickly, forcing fire-sales or gates"
      ],
      correct: 3,
      explain: "<b>Principle:</b> promising short-term liquidity against long-term illiquid assets is a maturity/liquidity mismatch — the same structure behind bank runs. <b>Why the others miss:</b> (A) reverses the stress (repayments slow in downturns); (B) invents a fee mechanic; (C) higher rates in a downturn hurt borrowers, they don't rescue the fund. <b>Where this generalizes:</b> any product offering daily/quarterly access to slow assets — open-ended property funds, some ETFs of illiquid bonds — carries run risk, and 'gates' that block withdrawals are the tell.",
    }),
    React.createElement(Glossary, { items: [
      { t: "Direct lending", d: "One lender, or a small club, makes a loan and holds it to maturity instead of selling it on." },
      { t: "Compound annual growth rate (CAGR)", d: "The steady yearly rate that would grow a starting value to an ending value over a set number of years." },
      { t: "Semi-liquid / evergreen fund", d: "A fund that keeps raising money and lets investors withdraw a limited amount periodically, e.g. each quarter." },
      { t: "Redemption", d: "An investor asking for their money back out of a fund." },
      { t: "Liquidity mismatch", d: "Promising quick withdrawals while owning assets that can only be sold slowly." }
    ] })
  );

  // ---------- 3. Q1 VOLATILITY ----------
  const q1 = React.createElement("div", null,
    React.createElement("h1", null, "Question One — Is the Low Volatility Real?"),
    P([
      "The thesis to test: private credit's calm is partly manufactured by measurement. ",
      "Public loans are priced every day, so their reported value jumps with every scare. ",
      "Private loans are valued by occasional appraisal — often quarterly, leaning on the last mark. ",
      "Those appraisals move in small, lagging steps, which mechanically makes the recorded volatility look small."
    ]),
    P([
      "The investor Cliff Asness calls this 'volatility laundering': stale, infrequent marks wash out the swings, so an asset looks less risky and less connected to public markets than it is (AQR, 2023). ",
      "The risk has not gone anywhere — it is simply not being recorded. ",
      "When researchers 'un-smooth' these returns to undo the lag, the estimated volatility rises sharply. ",
      "The chart shows the shape of the argument."
    ]),
    chart(CHART2),
    mc({
      id: "s3q1", qType: "B",
      prompt: "Private credit reports ~3–4% volatility versus ~9% for public leveraged loans. Which is the strongest reason NOT to conclude that private credit is genuinely about three times safer?",
      options: [
        "Appraisal-based marks lag and smooth prices, so the low measured volatility is largely a reporting artifact, not lower true risk",
        "Private credit borrowers are larger and safer than leveraged-loan borrowers",
        "Volatility is irrelevant to risk in any asset class",
        "Public leveraged loans are known to overstate their own volatility"
      ],
      correct: 0,
      explain: "<b>Principle (correlation ≠ causation / measurement trap):</b> a lower measured number can come from how you measure, not from the underlying thing. Smoothed appraisals shrink recorded standard deviation while the credit risk is unchanged. <b>Why the others miss:</b> (B) is false — direct-lending borrowers are typically smaller, more leveraged, and more opaque; (C) throws out a valid risk proxy entirely; (D) invents a fault in the comparison to dodge the real issue. <b>Where this generalizes:</b> any illiquid, appraised asset — private equity, real estate funds — can look like a diversifier mostly because its price is updated slowly.",
    }),
    P([
      "Skeptics of the laundering story have a fair point: private credit is floating-rate and senior in the capital structure, so some of its steadiness is real, not just optics. ",
      "Since late 2022 the base rate (three-month SOFR) has stayed above 3.5%, which has lifted the income these loans throw off (Bloomberg, 2026). ",
      "The honest read is that the low reported volatility is ",
      React.createElement("i", null, "part real, part recording lag"), " — and you cannot tell the mix from the headline number."
    ]),
    num({
      id: "s3q2", unit: "%", min: 2, max: 20, step: 0.5, target: 10.5, fermi: 1.5,
      prompt: "Open-ended estimate: if private credit returns were marked to market like public loans, roughly what annual volatility would you expect? Name your decomposition path in the self-check below, then enter a number.",
      scaffold: "You must build your own path this time (scaffold faded). Anchors you have: public leveraged loans ~9%; direct-lending borrowers are smaller, more leveraged, and more concentrated than that public set; more leverage and concentration push volatility up, not down.",
      explain: "<b>How to estimate this:</b> start from the public comparator (~9%), then adjust up for worse credit quality, higher leverage, and industry concentration → landing around <b>10–11%</b>, i.e. clearly above the ~3–4% reported, roughly on par with or above public loans. Factor-of-1.5 tolerance because this is a genuine Fermi estimate, scored on log-distance so 7% and 16% are treated as equally far off. Lower bound ~7% (if you think seniority truly cushions losses); upper bound ~15% (if concentration bites in a downturn). <b>Where this generalizes:</b> to un-smooth any appraised series, anchor on the nearest daily-priced comparator and adjust for known differences in credit quality and leverage."
    }),
    React.createElement(Glossary, { items: [
      { t: "Volatility laundering", d: "Making an asset look less risky by valuing it with infrequent, lagging appraisals instead of daily market prices." },
      { t: "Mark (to market / appraisal)", d: "The recorded value of an asset; 'to market' uses live prices, 'appraisal' uses a periodic estimate." },
      { t: "Un-smoothing", d: "A statistical correction that undoes the lag in appraised returns to reveal their true swing." },
      { t: "Sharpe ratio", d: "Return earned per unit of risk (volatility); it rises automatically if volatility is understated." },
      { t: "Floating-rate", d: "A loan whose interest resets with a benchmark rate, so income rises when rates rise." },
      { t: "SOFR", d: "Secured Overnight Financing Rate — a common US benchmark interest rate that many private loans price off." },
      { t: "Senior (in the capital structure)", d: "First in line to be repaid if the borrower fails, so it usually loses less than junior debt." }
    ] })
  );

  // ---------- 4. Q2 DEFAULTS ----------
  const q2 = React.createElement("div", null,
    React.createElement("h1", null, "Question Two — Does the Default Rate Tell the Truth?"),
    P([
      "The thesis to test: the reassuring default rate is a definition, not a fact of nature. ",
      "Headline numbers look benign. The KBRA Direct Lending Index reported a trailing-12-month default rate of about 1.5% in mid-2026, close to the 1.28% on public leveraged loans (J.P. Morgan, 2026). ",
      "By that measure, private credit is holding up fine."
    ]),
    P([
      "But private lenders and borrowers can rework a troubled loan quietly, without ever tripping the 'default' label. ",
      "These liability-management exercises (LMEs) and selective defaults keep a loan technically current while the lender takes an economic hit. ",
      "Count those, and analysts estimate the 'true' distress rate approaches 5% (ESTIMATE, 2025–26). ",
      "Same portfolio, very different verdict."
    ]),
    chart(CHART3),
    mc({
      id: "s4q1", qType: "B",
      prompt: "An investor points to the 1.5% headline default rate as proof private credit is low-risk. Which reasoning error is this most likely to be?",
      options: [
        "Survivorship bias — only successful funds report data",
        "Extrapolating a short-term trend into the far future",
        "Definition/base-rate neglect — the headline excludes restructurings and selective defaults, so it understates true distress",
        "Confusing a nominal figure with a real (inflation-adjusted) one"
      ],
      correct: 2,
      explain: "<b>Principle:</b> a rate is only as meaningful as the event definition behind it; excluding LMEs and selective defaults shrinks the numerator and understates loss. <b>Why the others miss:</b> (A) survivorship is a real problem elsewhere but isn't what's happening in this specific count; (B) this is about scope, not extrapolation; (D) there's no nominal/real issue in a default-rate percentage. <b>Where this generalizes:</b> any 'success rate' or 'failure rate' — hospital readmissions, startup survival — demands you ask exactly what counts as the event before trusting the level.",
    }),
    mc({
      id: "s4q2", qType: "Case", caseClient: "Meridian State Pension (fictional), evaluating a $2B private credit allocation",
      prompt: "Meridian's board is told the strategy has 'never lost money in a calendar year.' You must name the load-bearing assumption behind that claim. Which must hold for it to be a valid safety signal — and is the article's weakest support?",
      options: [
        "That interest rates will keep rising, lifting loan income",
        "That the reported values are honest marks of what the loans would fetch today — the very assumption appraisal smoothing calls into question",
        "That the fund manager has a large marketing budget",
        "That other pensions are also invested, spreading the risk"
      ],
      correct: 1,
      explain: "<b>Principle (weakest link):</b> 'never lost money in a year' is only meaningful if the yearly values are honest market marks. If marks are smoothed appraisals, the clean record is an artifact — this is exactly the assumption the article shows is thinnest. <b>Why the others miss:</b> (A) rising rates can hurt over-levered borrowers, not just help; (C) marketing is irrelevant to risk; (D) more co-investors add correlation, not safety. <b>Implementation risk:</b> a pension that funds pension payments against smoothed marks may discover the true value only when it needs to sell. <b>Where this generalizes:</b> whenever a track record looks too smooth, test whether the measurement, not the manager, produced the calm.",
    }),
    P([
      "One quiet signal is worth watching: payment-in-kind, or PIK, interest. ",
      "A PIK loan lets the borrower pay interest by adding to the loan balance instead of sending cash. ",
      "Sometimes that is a deliberate structure for a fast-growing firm. ",
      "Often it is a lifeline: the lender amends a struggling loan to PIK so the borrower can survive — and so the fund can keep booking 'income' that no cash backs. ",
      "The chart shows why PIK is easy to misread."
    ]),
    chart(CHART4),
    num({
      id: "s4q3", unit: "%", min: 0, max: 20, step: 0.5, target: 6.2, band: 1.5,
      prompt: "About 11% of investments carry some PIK, and 56% of those PIK loans were amended into PIK after origination (a distress signal). Estimate what share of ALL investments are these 'converted-under-stress' PIK loans.",
      scaffold: "Decomposition: (share of investments with PIK) × (share of PIK loans that were converted after origination) = 0.11 × 0.56.",
      explain: "<b>How to estimate this:</b> 0.11 × 0.56 ≈ 0.062, or about <b>6%</b> of all investments. Bounds: it must be below 11% (converted PIK is a subset of all PIK) and above 0; 6% sits right in between. Tolerance ±1.5 points because it's a two-factor product with rounded inputs. <b>Statistical trap tested — denominators:</b> the scary-sounding 56% is a share of PIK loans only; applied to the whole book it becomes a smaller 6%. Always track which denominator a percentage sits on. <b>Where this generalizes:</b> conditional shares (X% of the Y% that…) must be multiplied down to a common base before they can be compared or added."
    }),
    React.createElement(Glossary, { items: [
      { t: "Default rate", d: "The share of loans that failed to pay as promised over a period; its size depends on what counts as 'failed.'" },
      { t: "Liability-management exercise (LME)", d: "A restructuring that reworks a troubled borrower's debt while avoiding a formal default label." },
      { t: "Selective default", d: "A situation where a borrower misses some obligations but the loan is not classed as fully in default." },
      { t: "Payment-in-kind (PIK) interest", d: "Interest paid by adding to the loan balance instead of paying cash now." },
      { t: "Non-accrual", d: "A loan the fund has stopped counting interest on because repayment is in doubt." }
    ] })
  );

  // ---------- 5. Q3 STABILITY ----------
  const q3 = React.createElement("div", null,
    React.createElement("h1", null, "Question Three — What Does the Growth Mean for Stability?"),
    P([
      "The thesis to test: private credit was sold as safer partly because it sits 'outside' the banking system, yet it is wiring itself back in. ",
      "Banks that stepped back from direct lending now lend to the funds that do it. ",
      "The largest US banks had committed about $95 billion of credit lines to private credit vehicles by the end of 2024, with about $56 billion drawn — up roughly 145% in five years (Federal Reserve, 2025)."
    ]),
    P([
      "Those loans equal about 7% of the big banks' regulatory capital on average, and about 60% of the commitments sit among just five globally systemic banks (Federal Reserve, 2025). ",
      "The global regulator's tally is larger still — around $220 billion of drawn and undrawn bank lines across member countries — while commercial estimates run from $270 billion to $500 billion (FSB, 2026). ",
      "Nobody agrees on the number, which is itself the problem."
    ]),
    chart(CHART5),
    mc({
      id: "s5q1", qType: "B",
      prompt: "Estimates of bank exposure to private credit range from ~$95bn (Fed, largest banks) to ~$500bn (commercial). What is the right conclusion to draw from that spread?",
      options: [
        "The risk is clearly small, since the lowest credible estimate is only $95bn",
        "The risk is clearly a crisis, since the highest estimate is $500bn",
        "The estimates are all wrong and should be ignored",
        "The scope and definitions differ so much that the true interconnection is unmeasured — uncertainty itself is the finding, and 'contained' is unsupported"
      ],
      correct: 3,
      explain: "<b>Principle (measurement/normalization):</b> when figures differ 5× because of scope and definition, you cannot pick the convenient end — the honest reading is that the exposure is not yet measurable. <b>Why the others miss:</b> (A) and (B) cherry-pick a bound to fit a prior; (C) discards useful partial information. <b>Where this generalizes:</b> whenever credible estimates span a wide range, report the range and the reason for it, rather than collapsing to a single reassuring or alarming point.",
    }),
    mc({
      id: "s5q2", qType: "Case", caseClient: "A bank supervisor sizing systemic risk from private credit",
      prompt: "Using the section's facts, which combination makes bank exposure most dangerous in a downturn?",
      options: [
        "Undrawn lines get drawn exactly when conditions worsen, exposure is concentrated in five systemic banks, and true size is unmeasured — so a shock could hit critical nodes by a channel regulators can't yet see clearly",
        "Loans to the funds are investment-grade and short-term, so there is nothing to watch",
        "The funds charge high fees, which is the main systemic concern",
        "Banks earn interest on the lines, which reduces systemic risk to zero"
      ],
      correct: 0,
      explain: "<b>Principle:</b> systemic risk concentrates where contingent exposure, concentration, and opacity overlap. Undrawn commitments are contingent leverage that spikes in stress; concentration in five GSIBs means a shock hits critical nodes; unmeasured size means supervisors are partly blind. <b>Why the others miss:</b> (B) investment-grade and short-term still runs if everyone draws at once; (C) fees are a governance issue, not systemic; (D) earning interest does not remove default or contagion risk. <b>Implementation risk / failure mode:</b> the transmission channel (bank → fund → borrower) is exactly the kind regulators mapped too late in 2008. <b>Where this generalizes:</b> look for risk at the seams between regulated and lightly-regulated systems, not only inside either one.",
    }),
    React.createElement(Glossary, { items: [
      { t: "Regulatory capital", d: "The cushion of shareholder money a bank must hold against losses; exposures are often sized relative to it." },
      { t: "Committed vs. drawn (undrawn) credit line", d: "'Committed' is the promised maximum a borrower can take; 'drawn' is what they've actually borrowed; the gap can be tapped later." },
      { t: "Globally systemic bank (GSIB)", d: "A bank so large and connected that its failure could threaten the whole financial system." },
      { t: "Contingent leverage", d: "Borrowing capacity that only turns into actual debt under certain conditions — often in a downturn." },
      { t: "Financial Stability Board (FSB)", d: "An international body that monitors the global financial system and flags emerging risks." }
    ] })
  );

  // ---------- 7. CONCLUSION ----------
  const conclusion = React.createElement("div", null,
    React.createElement("h1", null, "Conclusion — Reading the Market Through the Measurement"),
    P([
      "Private credit's central challenge is not that it is obviously bad credit; it is that its reported safety is entangled with how it is measured, and that measurement has not been tested by a deep downturn. ",
      "Under partial stress — a slow grind of higher-for-longer rates rather than a crash — the most likely path is not a sudden blow-up but a gradual reveal: rising PIK, more amendments, and marks that catch down to reality more slowly than public prices."
    ]),
    P([
      "For investors, the implication is to treat volatility and default statistics as ",
      React.createElement("i", null, "definitions to interrogate"), ", not facts to accept: reconcile cash income to distributions, ask what counts as a default, and size positions to the liquidity you would actually have in a panic. ",
      "The 20%-plus fall in the listed BDC index since June 2025 (Bloomberg, 2026) is a hint that public markets re-price this risk faster than private marks do."
    ]),
    P([
      "For the system, the implication is that the line between banks and 'non-banks' is thinner than the labels suggest. ",
      "Banks fund the funds; insurers hold the paper; wealthy households now hold semi-liquid slices. ",
      "The regulators' own 5× disagreement over exposure means the plumbing is not yet mapped. ",
      "The unresolved question is whether the first real default cycle produces an orderly re-pricing — or a run on redemptions that turns a measurement problem into a liquidity one."
    ]),
    mc({
      id: "ce", qType: "E",
      prompt: "Given everything above, which decision is most directly supported by the evidence — and which observation would most threaten (falsify) the article's thesis that the calm is partly a measurement artifact?",
      options: [
        "Decision: pile into semi-liquid private credit for the smooth returns. Falsifier: none — the smoothness is proven real.",
        "Decision: treat reported volatility and default rates as definitions to stress-test, size for illiquidity, and reconcile cash to accruals. Falsifier: a deep default cycle in which un-smoothed private credit losses come in no worse than comparable public loans would show the calm was real, not laundered.",
        "Decision: avoid all credit investing entirely. Falsifier: rising interest rates.",
        "Decision: assume regulators have the exposure fully measured. Falsifier: a fall in fees."
      ],
      correct: 1,
      explain: "<b>Principle:</b> the strongest recommendation states what to do AND what evidence would prove it wrong. Option B pairs a risk-aware action with a genuine falsification test: if a real downturn produces private-credit losses no worse than public comparables once returns are un-smoothed, the 'measurement artifact' thesis fails. <b>Why the others miss:</b> (A) denies any falsifier, which is unscientific; (C) overreacts and its falsifier is irrelevant; (D) assumes away the article's central data gap. <b>Failure mode to watch:</b> the biggest threat to Option B's action is a redemption run that forces sales before marks adjust. <b>Where this generalizes:</b> a thesis you can't state a falsifier for isn't an analysis — it's a belief.",
    }),
    React.createElement(Glossary, { items: [
      { t: "Higher-for-longer", d: "A scenario where central banks keep interest rates elevated for an extended period." },
      { t: "Falsifier", d: "A specific observation that, if seen, would prove a thesis wrong." },
      { t: "Re-pricing", d: "Markets adjusting an asset's value to reflect new information about its risk." }
    ] }),
    React.createElement(Sources)
  );

  return [
    { title: "Warm-Up", node: warmup },
    { title: "Introduction", node: intro },
    { title: "Background", node: background },
    { title: "Q1: Volatility", node: q1 },
    { title: "Q2: Defaults", node: q2 },
    { title: "Q3: Stability", node: q3 },
    { title: "Learning Summary", node: null },
    { title: "Conclusion", node: conclusion }
  ];
}

/* ===================== SOURCES ===================== */

function Sources() {
  const src = [
    ["IMF Global Financial Stability Report, Ch.2 'The Rise and Risks of Private Credit' (April 2024)", "https://www.imf.org/en/publications/gfsr/issues/2024/04/16/global-financial-stability-report-april-2024"],
    ["IMF Blog — 'Fast-Growing $2 Trillion Private Credit Market Warrants Closer Watch' (2024)", "https://www.imf.org/en/blogs/articles/2024/04/08/fast-growing-usd2-trillion-private-credit-market-warrants-closer-watch"],
    ["Financial Stability Board — 'Report on Vulnerabilities in Private Credit' (6 May 2026)", "https://www.fsb.org/uploads/P060526.pdf"],
    ["Federal Reserve FEDS Note — 'Bank Lending to Private Credit' (23 May 2025)", "https://www.federalreserve.gov/econres/notes/feds-notes/bank-lending-to-private-credit-size-characteristics-and-financial-stability-implications-20250523.html"],
    ["Penn Mutual Asset Management — 'The PIK Picture' (18 June 2026)", "https://www.pennmutualam.com/market-insights-news/blogs/chart-of-the-week/2026-06-18-the-pik-picture-tracking-non-cash-income-in-bdc-portfolios"],
    ["AQR / Cliff Asness — 'Volatility Laundering'", "https://www.aqr.com/Insights/Perspectives/Volatility-Laundering"],
    ["McKinsey — 'Private credit in 2025' (Global Private Markets Report)", "https://www.mckinsey.com/industries/private-capital/our-insights/global-private-markets-report/private-credit"],
    ["Bloomberg — 'Private Credit's Rising Pile of Bad PIK Points to Default Woes' (Oct 2025)", "https://www.bloomberg.com/news/articles/2025-10-31/private-credit-s-rising-pile-of-bad-pik-points-to-default-woes"]
  ];
  return React.createElement("div", { className: "sources" },
    React.createElement("div", { className: "gloss-label" }, "Sources"),
    src.map(function (s, i) {
      return React.createElement("div", { key: i, className: "src-item" },
        React.createElement("a", { href: s[1], target: "_blank", rel: "noopener" }, s[0]));
    }),
    React.createElement("div", { className: "src-note" },
      "Provenance: market size (~$2T, 2024) and bank-exposure figures are FACTs from the IMF, FSB, and Federal Reserve. PIK and default figures are FACTs from 2025–26 disclosures and Fitch/JPM/KBRA data. The ~5% 'broad' default rate and the un-smoothed volatility bar are ESTIMATE/ILLUSTRATION and are labelled as such in-chart; they are not reported statistics.")
  );
}

/* ===================== LEARNING SUMMARY ===================== */

function Summary(props) {
  const { qstate, interp, scored, governing, setGoverning, applyA, setApplyA, applyB, setApplyB, applyResult, setApplyResult, onContinue } = props;
  const [insightsShown, setInsightsShown] = useState(false);

  // score by type
  const typeMap = {
    w1: "B", w2: "E", w3: "B", s2q1: "D", s2q2: "B",
    s3q1: "B", s3q2: "D", s4q1: "B", s4q2: "Case", s4q3: "D",
    s5q1: "B", s5q2: "Case", ce: "E"
  };
  const byType = {};
  Object.keys(typeMap).forEach(function (id) {
    var t = typeMap[id]; if (!byType[t]) byType[t] = { c: 0, n: 0 };
    byType[t].n++; if (qstate[id] && qstate[id].submitted && qstate[id].correct) byType[t].c++;
  });

  // calibration
  var highWrong = [], lowRight = [];
  Object.keys(qstate).forEach(function (id) {
    var v = qstate[id];
    if (v && v.submitted) {
      if (v.confidence === "High" && !v.correct) highWrong.push(id);
      if (v.confidence === "Low" && v.correct) lowRight.push(id);
    }
  });

  // numeric bias
  var numIds = ["s2q1", "s3q2", "s4q3"], targets = { s2q1: 18.9, s3q2: 10.5, s4q3: 6.2 };
  var signed = [], cnt = 0;
  numIds.forEach(function (id) {
    var v = qstate[id];
    if (v && v.submitted) { signed.push((Number(v.value) - targets[id]) / targets[id]); cnt++; }
  });
  var avgBias = signed.length ? (signed.reduce(function (a, b) { return a + b; }, 0) / signed.length) : null;

  // principles to revisit (missed questions)
  const principles = {
    w1: "Feasibility follows the data-generating process, not the model",
    w2: "Separate the number from the mechanism; name the load-bearing assumption",
    w3: "A model beats a rule only when it uses context the rule can't",
    s2q1: "CAGR arithmetic and the rule of 72",
    s2q2: "Liquidity mismatch = run risk",
    s3q1: "Smoothed marks understate volatility (correlation ≠ causation)",
    s3q2: "Un-smooth by anchoring to a daily-priced comparator",
    s4q1: "A rate is only as good as its event definition (base-rate/definition)",
    s4q2: "Test whether measurement, not the manager, produced the calm",
    s4q3: "Track which denominator a percentage sits on",
    s5q1: "Wide estimate ranges mean uncertainty is the finding",
    s5q2: "Risk lives at the seams between regulated and shadow systems",
    ce: "A thesis with no falsifier is a belief, not an analysis"
  };
  var missed = Object.keys(principles).filter(function (id) { return qstate[id] && qstate[id].submitted && !qstate[id].correct; });

  const authoredInsights = [
    "Low reported volatility and low default rates in private credit are partly measurement choices — appraisal smoothing shrinks recorded volatility, and soft default definitions exclude PIK conversions and restructurings — so the yield premium compensates for illiquidity and model risk that has not yet been marked.",
    "The composition of a number often matters more than its level: 6% of loans converted to PIK under stress, or 56% of PIK created after origination, tells you more than the calm 11% headline — always ask what denominator a percentage sits on.",
    "Private credit is re-wiring itself into the banking system (bank lines, insurer holdings, retail semi-liquid funds) while regulators disagree on exposure by 5×, so the biggest systemic risk is the one that is not yet measured."
  ];

  function evalApply() {
    // Local, evidence-based fallback evaluator (no external API from a static artifact).
    // Checks the four required parts are present and non-trivial, then names the weakest.
    var parts = [
      { k: "thesis", label: "so-what thesis", v: applyA.thesis },
      { k: "assumption", label: "load-bearing assumption", v: applyA.assumption },
      { k: "disconfirm", label: "disconfirming evidence", v: applyA.disconfirm },
      { k: "premortem", label: "pre-mortem", v: applyA.premortem }
    ];
    var gaps = parts.filter(function (p) { return (p.v || "").trim().length < 15; }).map(function (p) { return p.label; });
    var quantified = /\d/.test(applyA.thesis + " " + applyA.disconfirm);
    var linkOk = (applyB || "").trim().length >= 15;
    var weakest = null, shortest = 1e9;
    parts.forEach(function (p) { var L = (p.v || "").trim().length; if (L < shortest) { shortest = L; weakest = p.label; } });

    var lines = [];
    if (gaps.length) lines.push("Missing or too thin: " + gaps.join(", ") + ". Each part needs a real sentence.");
    else lines.push("All four parts are present.");
    lines.push(quantified ? "Good — your thesis or disconfirming evidence carries a number, which climbs from observation to a decision-relevant claim." : "Add a magnitude (a %, a ratio, a size) — a so-what without a number usually stops at observation.");
    lines.push(linkOk ? "Cross-link to a prior article is present." : "Add the cross-link to a prior article's principle (part b).");
    if (!gaps.length) lines.push("Weakest part to strengthen next: " + weakest + ".");
    setApplyResult(lines);
  }

  const complete = (governing || "").trim().length >= 15 &&
    applyA.thesis.trim().length >= 15 && applyA.assumption.trim().length >= 15 &&
    applyA.disconfirm.trim().length >= 15 && applyA.premortem.trim().length >= 15 &&
    (applyB || "").trim().length >= 15 && applyResult;

  return React.createElement("div", null,
    React.createElement("h1", null, "Learning Summary"),

    React.createElement("div", { className: "sum-card" },
      React.createElement("h3", null, "Score by question type"),
      React.createElement("table", { className: "sum-table" },
        React.createElement("tbody", null,
          Object.keys(byType).map(function (t) {
            var names = { B: "Trend reasoning (B)", D: "Numeric estimation (D)", Case: "Consulting case (C)", E: "Implication bridge (E)" };
            return React.createElement("tr", { key: t },
              React.createElement("td", null, names[t] || t),
              React.createElement("td", null, byType[t].c + " / " + byType[t].n));
          }),
          React.createElement("tr", { className: "sum-total" },
            React.createElement("td", null, "Total"),
            React.createElement("td", null, scored.correct + " / 13"))
        )
      ),
      React.createElement("div", { className: "cal-line" },
        "Calibration: ",
        highWrong.length ? (highWrong.length + " answered with HIGH confidence but wrong — the gaps most worth closing. ") : "No high-confidence misses. ",
        lowRight.length ? (lowRight.length + " answered LOW confidence but right — trust that reasoning more.") : "",
        avgBias != null ? React.createElement("div", { className: "cal-line" },
          "Numeric bias: on average you were " + (avgBias >= 0 ? "over" : "under") + "-estimating by ~" + Math.abs(Math.round(avgBias * 100)) + "%.") : null
      )
    ),

    React.createElement("div", { className: "sum-card" },
      React.createElement("h3", null, "Your governing insight (write before revealing the article's)"),
      React.createElement("p", { className: "sum-hint" }, "You saw five charts. Write the single most non-obvious insight you would defend to a skeptical executive."),
      React.createElement("textarea", {
        className: "interp-ta", rows: 3, value: governing, disabled: insightsShown,
        placeholder: "One sentence you'd stake your credibility on…",
        onChange: function (e) { setGoverning(e.target.value); }
      }),
      !insightsShown && React.createElement("button", {
        className: "submit", disabled: (governing || "").trim().length < 15,
        onClick: function () { setInsightsShown(true); }
      }, "Reveal the article's three insights"),
      insightsShown && React.createElement("div", { className: "insights" },
        React.createElement("div", { className: "auth-label" }, "How your insight compares to the article's three"),
        authoredInsights.map(function (t, i) {
          return React.createElement("div", { key: i, className: "insight-card" },
            React.createElement("span", { className: "insight-num" }, i + 1), t);
        })
      )
    ),

    React.createElement("div", { className: "sum-card" },
      React.createElement("h3", null, "Apply It (a) — transfer to a new domain"),
      React.createElement("p", { className: "sum-hint" }, "New dataset, different domain: A city reports that its public hospitals' 30-day readmission rate fell from 14% to 9% after a new discharge program, while total admissions rose 20% and the share of patients sent to (unmeasured) outside clinics doubled. Give four labeled parts."),
      React.createElement(Field, { label: "(1) So-what thesis (one sentence, ideally with a number)", v: applyA.thesis, on: function (x) { setApplyA(Object.assign({}, applyA, { thesis: x })); } }),
      React.createElement(Field, { label: "(2) The single load-bearing assumption that must hold", v: applyA.assumption, on: function (x) { setApplyA(Object.assign({}, applyA, { assumption: x })); } }),
      React.createElement(Field, { label: "(3) Evidence that would most undermine your thesis (disconfirming)", v: applyA.disconfirm, on: function (x) { setApplyA(Object.assign({}, applyA, { disconfirm: x })); } }),
      React.createElement(Field, { label: "(4) Pre-mortem: 'If this reading is wrong in 12 months, the most likely reason is ___'", v: applyA.premortem, on: function (x) { setApplyA(Object.assign({}, applyA, { premortem: x })); } }),
      React.createElement("h3", { style: { marginTop: "18px" } }, "Apply It (b) — cross-link to a prior article"),
      React.createElement(Field, { label: "Name one prior article's principle that reinforces or conflicts with today's, and how.", v: applyB, on: setApplyB }),
      React.createElement("button", { className: "submit", onClick: evalApply }, "Evaluate my reasoning"),
      applyResult && React.createElement("div", { className: "explain-body eval" },
        React.createElement("div", { className: "auth-label" }, "Evaluation (checks all four parts, not keywords)"),
        applyResult.map(function (l, i) { return React.createElement("div", { key: i, className: "eval-line" }, "• " + l); })
      )
    ),

    React.createElement("div", { className: "sum-card" },
      React.createElement("h3", null, "Principles to revisit"),
      missed.length === 0
        ? React.createElement("p", { className: "sum-hint" }, "No missed questions — every principle held. Nice.")
        : React.createElement("ul", { className: "revisit" }, missed.map(function (id) {
            return React.createElement("li", { key: id }, principles[id]);
          }))
    ),

    React.createElement("button", {
      className: "submit big", disabled: !complete, onClick: onContinue
    }, complete ? "Unlock the Conclusion ▶" : "Complete your governing insight and Apply It to unlock the Conclusion")
  );
}

function Field(props) {
  return React.createElement("div", { className: "field" },
    React.createElement("label", null, props.label),
    React.createElement("textarea", {
      className: "interp-ta", rows: 2, value: props.v,
      placeholder: "At least 15 characters…",
      onChange: function (e) { props.on(e.target.value); }
    })
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
