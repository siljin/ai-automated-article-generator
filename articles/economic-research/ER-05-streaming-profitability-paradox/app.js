/* Interactive Research Article — The Streaming Profitability Paradox
 * Domain: Business & strategy
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
  ResponsiveContainer, BarChart, Bar, LineChart, Line, ComposedChart, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, Cell, ReferenceLine
} = Recharts;

const ACCENT = "#1d4ed8";
const GOOD = "#15803d";
const BAD = "#b91c1c";
const AMBER = "#d97706";
const GRAY = "#64748b";

/* ============================= DATA ============================= */

// Chart 1 — US TV viewing mix (Nielsen The Gauge). 100% stacked, two snapshots. FACT.
// June 2024: streaming 40.3, broadcast+cable 47.7, other ~12.0 (residual to 100).
// May 2025: streaming 44.8, broadcast+cable 44.2, other ~11.0 (residual to 100).
const viewMix = [
  { period: "Jun 2024", Streaming: 40.3, "Broadcast + cable": 47.7, Other: 12.0 },
  { period: "May 2025", Streaming: 44.8, "Broadcast + cable": 44.2, Other: 11.0 }
];

// Chart 2 — Netflix revenue vs operating income, 2021–2024 (US$ billion). FACT (Netflix letters).
const nflxPnl = [
  { year: "2021", revenue: 29.7, opincome: 6.2, margin: 20.9 },
  { year: "2022", revenue: 31.6, opincome: 5.6, margin: 17.8 },
  { year: "2023", revenue: 33.7, opincome: 7.0, margin: 20.6 },
  { year: "2024", revenue: 39.0, opincome: 10.4, margin: 26.7 }
];

// Chart 3 — Netflix 2024 P&L bridge (US$ billion). FACT (Netflix Q4'24 letter). Waterfall.
// Revenue 39.0 -> cost of revenue 21.0 -> marketing 2.9 -> tech&dev 2.9 -> G&A 1.8 -> op income 10.4
const bridge = [
  { name: "Revenue", base: 0, delta: 39.0, kind: "start" },
  { name: "Content &\ncost of rev.", base: 18.0, delta: 21.0, kind: "dec" },
  { name: "Marketing", base: 15.1, delta: 2.9, kind: "dec" },
  { name: "Tech &\ndev.", base: 12.2, delta: 2.9, kind: "dec" },
  { name: "G&A", base: 10.4, delta: 1.8, kind: "dec" },
  { name: "Operating\nincome", base: 0, delta: 10.4, kind: "end" }
];

// Chart 4 — Netflix ARPU (ARM) by region, Q4 2024 (US$ / member / month). FACT (Netflix letter). Dot plot.
const arpu = [
  { region: "APAC", value: 7.34 },
  { region: "LATAM", value: 8.00 },
  { region: "EMEA", value: 11.11 },
  { region: "US & Canada", value: 17.26 }
];

// Chart 5 — Annual streaming/DTC operating income, 2023 vs 2024 (US$ billion). FACT. Slope.
// Netflix = total-company op income (~all streaming). Others = DTC segment op income.
const slope = [
  { period: "2023", Netflix: 7.0, "Disney DTC": -2.6, "Warner (Max)": 0.1, "Paramount DTC": -1.7 },
  { period: "2024", Netflix: 10.4, "Disney DTC": 0.1, "Warner (Max)": 0.7, "Paramount DTC": -0.5 }
];
const slopeSeries = [
  { key: "Netflix", color: ACCENT },
  { key: "Disney DTC", color: "#9333ea" },
  { key: "Warner (Max)", color: GOOD },
  { key: "Paramount DTC", color: BAD }
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
  const state = interp[chart.id] || { texts: ["", ""], submitted: [false, false] };

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

const CHART1 = {
  id: "c1",
  title: "Chart 1 — Share of US TV time: streaming overtakes broadcast + cable (% of total TV usage)",
  note: "FACT — Nielsen 'The Gauge' (June 2024 and May 2025). 'Other' is the residual (gaming, set-top usage, unmeasured) to sum to 100%. May 2025 is the first month streaming's share passed broadcast and cable combined.",
  render: function () {
    return React.createElement(ResponsiveContainer, { width: "100%", height: 280 },
      React.createElement(BarChart, { data: viewMix, stackOffset: "expand", margin: { top: 16, right: 16, left: 0, bottom: 4 } },
        React.createElement(CartesianGrid, { strokeDasharray: "3 3", horizontal: true, vertical: false }),
        React.createElement(XAxis, { dataKey: "period" }),
        React.createElement(YAxis, { tickFormatter: function (v) { return Math.round(v * 100) + "%"; } }),
        React.createElement(Tooltip, { formatter: function (v) { return v + "%"; } }),
        React.createElement(Legend, null),
        React.createElement(Bar, { dataKey: "Streaming", stackId: "a", fill: ACCENT },
          React.createElement(LabelList, { dataKey: "Streaming", position: "center", fill: "#fff", formatter: function (v) { return v + "%"; } })),
        React.createElement(Bar, { dataKey: "Broadcast + cable", stackId: "a", fill: GRAY },
          React.createElement(LabelList, { dataKey: "Broadcast + cable", position: "center", fill: "#fff", formatter: function (v) { return v + "%"; } })),
        React.createElement(Bar, { dataKey: "Other", stackId: "a", fill: "#cbd5e1" },
          React.createElement(LabelList, { dataKey: "Other", position: "center", fill: "#334155", formatter: function (v) { return v + "%"; } }))
      )
    );
  },
  prompts: [
    {
      kind: "So-what / decision implication",
      q: "In one sentence: if you ran a legacy cable-TV network, what does this mix shift force you to do differently — and why is 'launch our own streaming app' not automatically the answer?",
      answer: "The audience is leaving cable for streaming, so a cable-first business is managing a shrinking pool no matter how good its shows are. But 'launch a streaming app' only helps if you can make money at streaming's economics, which most legacy players could not — you would be trading high-margin cable dollars for low-margin (often loss-making) streaming dimes. <i>Chasing the audience is necessary but not sufficient; you also have to chase a business model that pays.</i>"
    },
    {
      kind: "Quantitative reasoning (predict first)",
      q: "Before revealing: predict how many percentage points streaming's share rose from Jun 2024 to May 2025, and turn that into a relative growth rate. State both numbers.",
      answer: "Streaming rose from 40.3% to 44.8% — about <b>+4.5 percentage points</b>, which is a relative rise of roughly <b>11%</b> (4.5 ÷ 40.3). Broadcast+cable fell ~3.5 points over the same window. <i>Two ways to size the same move: absolute (points) and relative (percent). Confusing them is the classic percent-vs-percentage-point trap — a 4.5-point gain is not a '4.5% gain.'</i>"
    }
  ]
};

const CHART2 = {
  id: "c2",
  title: "Chart 2 — Netflix revenue vs operating income, 2021–2024 (US$ billion)",
  note: "FACT — Netflix shareholder letters / 10-K (revenue and operating income as reported). Operating margin (labeled on the income line) rose from 20.9% (2021) to 26.7% (2024).",
  render: function () {
    return React.createElement(ResponsiveContainer, { width: "100%", height: 280 },
      React.createElement(LineChart, { data: nflxPnl, margin: { top: 20, right: 20, left: 0, bottom: 4 } },
        React.createElement(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
        React.createElement(XAxis, { dataKey: "year" }),
        React.createElement(YAxis, { domain: [0, 42], tickFormatter: function (v) { return "$" + v + "B"; } }),
        React.createElement(Tooltip, { formatter: function (v) { return "$" + v + "B"; } }),
        React.createElement(Legend, null),
        React.createElement(Line, { type: "monotone", dataKey: "revenue", name: "Revenue", stroke: GRAY, strokeWidth: 2, dot: { r: 3 } },
          React.createElement(LabelList, { dataKey: "revenue", position: "top", formatter: function (v) { return "$" + v + "B"; } })),
        React.createElement(Line, { type: "monotone", dataKey: "opincome", name: "Operating income", stroke: ACCENT, strokeWidth: 2, dot: { r: 3 } },
          React.createElement(LabelList, { dataKey: "opincome", position: "bottom", formatter: function (v) { return "$" + v + "B"; } }))
      )
    );
  },
  prompts: [
    {
      kind: "Qualitative / mechanism",
      q: "Revenue climbed every year, but operating income dipped in 2022 before jumping in 2024. What mechanism best explains why profit did not simply track revenue upward?",
      answer: "Content is a large cost paid up front, mostly before the subscribers who will watch it arrive. In 2022 Netflix was still spending heavily to grow and briefly lost subscribers, so costs outran revenue and margin fell. By 2024 the subscriber base was big enough that the same kind of content budget was spread over far more paying members, so revenue growth finally dropped through to profit. <i>In a fixed-cost content business, profit lags scale — it appears only once the base is large enough to absorb the up-front spend.</i>"
    },
    {
      kind: "Quantitative reasoning",
      q: "From 2023 to 2024, revenue grew about 16% but operating income grew far faster. Estimate the operating-income growth rate and explain what a gap that size reveals about the business at this stage.",
      answer: "Operating income went from $7.0B to $10.4B, a rise of about <b>49%</b> — roughly <b>3x</b> the ~16% revenue growth. When profit grows several times faster than revenue, the business has crossed into <b>operating leverage</b>: new revenue lands on a cost base that barely grows, so most of it becomes profit. <i>The gap between revenue growth and profit growth is the tell that fixed costs are now being spread, not added.</i>"
    }
  ]
};

const CHART3 = {
  id: "c3",
  title: "Chart 3 — Where each revenue dollar goes: Netflix 2024 profit bridge (US$ billion)",
  note: "FACT — Netflix Q4'24 shareholder letter (full-year income statement). Values rounded to one decimal, so the cost blocks sum to the $10.4B operating income. Content sits inside 'cost of revenue,' the largest block.",
  render: function () {
    return React.createElement(ResponsiveContainer, { width: "100%", height: 300 },
      React.createElement(BarChart, { data: bridge, margin: { top: 20, right: 16, left: 0, bottom: 24 } },
        React.createElement(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
        React.createElement(XAxis, { dataKey: "name", interval: 0, tick: { fontSize: 10 } }),
        React.createElement(YAxis, { domain: [0, 42], tickFormatter: function (v) { return "$" + v + "B"; } }),
        React.createElement(Tooltip, { formatter: function (v, n) { return n === "delta" ? "$" + v + "B" : null; } }),
        React.createElement(Bar, { dataKey: "base", stackId: "s", fill: "transparent" }),
        React.createElement(Bar, { dataKey: "delta", stackId: "s" },
          React.createElement(LabelList, { dataKey: "delta", position: "top", formatter: function (v) { return "$" + v + "B"; } }),
          bridge.map(function (d, i) {
            var f = d.kind === "start" ? GRAY : d.kind === "end" ? ACCENT : "#ef9a9a";
            return React.createElement(Cell, { key: i, fill: f });
          })
        )
      )
    );
  },
  prompts: [
    {
      kind: "Quantitative reasoning (predict the magnitude first)",
      q: "Predict, then check: content and other 'cost of revenue' is the tallest cost block. Estimate it as a share of revenue, and say what that share implies about how a smaller rival would fare with the same content budget.",
      answer: "Cost of revenue is about $21B of $39B, roughly <b>54%</b> of revenue. Because most of that is content — a cost that barely changes with subscriber count — a rival spending a similar amount but earning, say, half the revenue would see cost of revenue swallow ~100%+ of its sales, leaving nothing for marketing, tech, and profit. <i>The same content bill is a moderate cost at large scale and a fatal one at small scale; the denominator (revenue base) decides the outcome.</i>"
    },
    {
      kind: "So-what / decision implication",
      q: "In one sentence: given how the dollar splits, where should a challenger with a fixed budget focus to reach profit — spend more on content, or something else?",
      answer: "Because content already eats the majority of every dollar, a challenger cannot out-spend Netflix into profit; it has to raise the revenue each subscriber generates (price, ads, bundling) or shrink the content bill to fit its smaller base. <i>When the biggest cost is fixed and shared, the lever is revenue-per-user and scale, not more spending — outspending a bigger rival on a shared fixed cost is a losing race.</i>"
    }
  ]
};

const CHART4 = {
  id: "c4",
  title: "Chart 4 — Netflix average revenue per membership by region, Q4 2024 (US$ / month)",
  note: "FACT — Netflix Q4'24 shareholder letter, ARM (average revenue per membership) by region. Dots show each region; the spread is the point.",
  render: function () {
    return React.createElement(ResponsiveContainer, { width: "100%", height: 260 },
      React.createElement(ScatterChart, { margin: { top: 16, right: 40, left: 30, bottom: 16 } },
        React.createElement(CartesianGrid, { strokeDasharray: "3 3" }),
        React.createElement(XAxis, { type: "number", dataKey: "value", domain: [0, 20], tickFormatter: function (v) { return "$" + v; } }),
        React.createElement(YAxis, { type: "category", dataKey: "region", width: 90 }),
        React.createElement(Tooltip, { formatter: function (v) { return "$" + v + "/mo"; } }),
        React.createElement(Scatter, { data: arpu, fill: ACCENT },
          React.createElement(LabelList, { dataKey: "value", position: "right", formatter: function (v) { return "$" + v; } }),
          arpu.map(function (d, i) {
            return React.createElement(Cell, { key: i, fill: d.region === "US & Canada" ? ACCENT : GRAY });
          })
        )
      )
    );
  },
  prompts: [
    {
      kind: "Quantitative reasoning",
      q: "Estimate the ratio of US & Canada ARPU to Asia-Pacific ARPU. Given that Netflix adds most new members in cheaper regions, what does that ratio imply about future revenue per subscriber?",
      answer: "About <b>2.4x</b> ($17.26 ÷ $7.34). Because the fastest membership growth is in APAC and LATAM, where each member pays roughly a third to a half of a US member, average revenue per member is pulled <b>down</b> by the mix even as total members rise. <i>A blended average moves with the mix, not just the price — growth in low-ARPU regions can lower the average while raising the total (Simpson's-paradox-style mix effect).</i>"
    },
    {
      kind: "So-what / decision implication",
      q: "In one sentence: what does the region spread tell a challenger about where the profit engine actually is — and where a global subscriber headline can mislead?",
      answer: "The profit engine is the high-ARPU regions (US & Canada, then EMEA); a big global subscriber count built mostly in low-ARPU regions can look impressive while contributing little margin. <i>Not all subscribers are equal — a headline count without a revenue-weighting hides where the money is really made.</i>"
    }
  ]
};

const CHART5 = {
  id: "c5",
  title: "Chart 5 — The swing toward profit: annual streaming operating income, 2023 vs 2024 (US$ billion)",
  note: "FACT — company reports/earnings (Netflix, Disney, Warner Bros. Discovery, Paramount). Scope note: Netflix is total-company operating income (≈ all streaming); the others are direct-to-consumer (DTC) segment operating income, and Disney's fiscal year ends in September — so these are comparable in direction, not in exact scope.",
  render: function () {
    return React.createElement(ResponsiveContainer, { width: "100%", height: 300 },
      React.createElement(LineChart, { data: slope, margin: { top: 20, right: 80, left: 0, bottom: 4 } },
        React.createElement(CartesianGrid, { strokeDasharray: "3 3", vertical: false }),
        React.createElement(XAxis, { dataKey: "period" }),
        React.createElement(YAxis, { domain: [-4, 12], tickFormatter: function (v) { return "$" + v + "B"; } }),
        React.createElement(Tooltip, { formatter: function (v) { return "$" + v + "B"; } }),
        React.createElement(ReferenceLine, { y: 0, stroke: "#111", strokeDasharray: "2 2" }),
        React.createElement(Legend, null),
        slopeSeries.map(function (s) {
          return React.createElement(Line, {
            key: s.key, type: "linear", dataKey: s.key, stroke: s.color, strokeWidth: 2, dot: { r: 4 }
          },
            React.createElement(LabelList, { dataKey: s.key, position: "right", formatter: function (v) { return "$" + v + "B"; } })
          );
        })
      )
    );
  },
  prompts: [
    {
      kind: "Causal / comparative",
      q: "Every rival's line moved up toward or past zero from 2023 to 2024. Name the most likely common cause — and why 'the market simply matured' is too vague to be the answer.",
      answer: "The common cause was a deliberate strategy switch from growth-at-all-costs to profit: price increases, cheaper ad-supported tiers, password-sharing crackdowns, less (but bigger) content, and cost cuts. 'The market matured' describes the result, not the mechanism — it names no lever anyone pulled. <i>A satisfying causal story points to specific decisions and actors, not to a passive drift; 'it matured' is a label, not an explanation.</i>"
    },
    {
      kind: "Quantitative reasoning (predict first)",
      q: "Predict, then estimate: how large was Disney DTC's swing in operating income from 2023 to 2024 in dollars, and what does a swing that size suggest about how far it had over-spent before?",
      answer: "Disney DTC went from about -$2.6B to about +$0.1B, a swing of roughly <b>$2.7B</b> in one year. A turnaround that large without a collapse in subscribers shows the prior losses were driven mainly by controllable over-spending (content and marketing to buy growth), not by a business that could never work. <i>A fast swing to breakeven usually means the red ink was a choice about spend, not a verdict on the model.</i>"
    }
  ]
};

/* ===================== SECTIONS CONTENT ===================== */

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
    { q: ["w1", "w2", "w3"], i: [] },                     // 0 Warm-up
    { q: [], i: [] },                                     // 1 Introduction
    { q: ["s2q1", "s2q2"], i: ["c1", "c2"] },             // 2 Background (2 charts)
    { q: ["s3q1", "s3q2"], i: ["c3"] },                   // 3 Q1 why scale didn't pay
    { q: ["s4q1", "s4q2"], i: ["c4"] },                   // 4 Q2 Netflix's edge
    { q: ["s5q1", "s5q2"], i: ["c5"] },                   // 5 Q3 the pivots
    { q: [], i: [] },                                     // 6 Summary
    { q: ["ce"], i: [] }                                  // 7 Conclusion
  ];

  function sectionComplete(idx) {
    var r = sectionReqs[idx];
    if (!r) return true;
    var qok = r.q.every(function (id) { return qstate[id] && qstate[id].submitted; });
    var iok = r.i.every(function (id) { return interp[id] && interp[id].submitted && interp[id].submitted[0] && interp[id].submitted[1]; });
    return qok && iok;
  }

  const scored = useMemo(function () {
    var mc = 0, total = 0;
    Object.keys(qstate).forEach(function (k) {
      var v = qstate[k];
      if (v && v.submitted) { total++; if (v.correct) { mc++; } }
    });
    return { correct: mc, answered: total };
  }, [qstate]);

  const totalScored = 12;

  const SECTIONS = buildSections({ qstate, setQ, interp, setInterp });

  function goNext() {
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
      prompt: "The private-credit piece argued that a reported risk metric is a definition, not a fact of nature — change what counts and you change the number. A software firm advertises '3% monthly churn.' A rival has the same real losses but reports '6%.' Applying that principle, what should you check first?",
      options: [
        "Which firm has the better product, since lower churn means happier customers",
        "How each firm defines churn — whether downgrades, pauses, and non-payers are counted — because the gap may be definitional, not real",
        "Which firm is larger, since bigger firms always churn less",
        "Whether churn matters at all for a subscription business"
      ],
      correct: 1,
      explain: "<b>Principle:</b> a rate is only as meaningful as the event definition behind it; a lower number can come from a narrower definition, not a better business. <b>Why the others miss:</b> (A) assumes the number reflects reality before checking how it's built; (C) invents a size rule; (D) discards a valid metric. <b>Where this generalizes:</b> churn, default rate, unemployment, readmission — always ask what counts as the event before comparing levels."
    }),
    mc({
      id: "w2", qType: "B",
      prompt: "The GLP-1 drugs article separated per-unit value (a ratio) from aggregate budget impact (a total), where total cost = volume × net price × duration. A city says a new benefit 'costs only $2 a day per family.' Which reaction best matches that article's reasoning?",
      options: [
        "$2 a day is trivial, so the program is clearly affordable",
        "The per-family figure settles it; no need to look further",
        "Multiply it out: $2/day × 365 × the number of eligible families — a small per-unit cost can be a huge aggregate bill",
        "Per-family cost and total cost always give the same verdict"
      ],
      correct: 2,
      explain: "<b>Principle:</b> per-unit value and aggregate budget are different verdicts; a cheap-per-unit item can be unaffordable in total once you multiply by the eligible pool and duration. <b>Why the others miss:</b> (A) and (B) stop at the ratio; (D) is simply false — they routinely diverge. <b>Where this generalizes:</b> subsidies, free trials, per-seat software — always multiply the per-unit figure by volume and duration before calling it small."
    }),
    mc({
      id: "w3", qType: "B",
      prompt: "The FIFA economics article argued that whoever owns the scarce, portable asset (the rights/IP) captures the durable surplus, while whoever supplies the fixed, place-specific assets bears the risk. A food-delivery app owns the customer relationship and the orders; restaurants own kitchens and staff. By that logic, who captures the durable surplus?",
      options: [
        "The delivery app, because it owns the portable, scarce asset (demand and data) and can redirect it, while restaurants carry the fixed costs and risk",
        "The restaurants, because they make the actual food",
        "Neither — surplus is always split evenly in a marketplace",
        "The delivery drivers, because they do the physical work"
      ],
      correct: 0,
      explain: "<b>Principle:</b> the owner of the scarce, portable asset (here, aggregated demand and data) captures the durable surplus; the supplier of fixed, place-specific assets (kitchens) bears the risk. <b>Why the others miss:</b> (B) confuses doing the work with owning the leverage; (C) ignores bargaining power; (D) mistakes labor for the scarce asset. <b>Where this generalizes:</b> platforms vs suppliers — app stores vs developers, marketplaces vs sellers, studios vs distributors — follow the portable asset to find the surplus."
    }),
    React.createElement(Glossary, { items: [
      { t: "Churn", d: "The share of customers who leave over a period; its size depends on what counts as leaving." },
      { t: "Per-unit vs aggregate", d: "Per-unit is a cost or value for one buyer; aggregate is the total across all buyers over time." },
      { t: "Durable surplus", d: "The lasting profit left over after costs, which tends to flow to whoever holds the scarce, hard-to-replace asset." }
    ] })
  );

  // ---------- 1. INTRODUCTION ----------
  const intro = React.createElement("div", null,
    React.createElement("div", { className: "domain-tag" }, "Business & strategy"),
    React.createElement("h1", null, "The Streaming Profitability Paradox: Winning the Audience, Losing the Business"),
    P([
      "By May 2025, Americans spent more time streaming than watching broadcast and cable television combined — a first in the history of Nielsen's viewing tracker (Nielsen, 2025). ",
      "The four largest US services alone now count more than 600 million paid subscriptions between them. ",
      "Yet for most of the last decade, only one company — Netflix — reliably made money from streaming."
    ]),
    P([
      "The losses were not small. Disney's streaming arm alone ran up about ",
      React.createElement("b", null, "$11.4 billion"), " in cumulative operating losses from the launch of Disney+ in late 2019 to early 2024 before it scraped to breakeven (Forbes, 2024; company filings). ",
      "Warner Bros. Discovery and Paramount lost billions more. Meanwhile Netflix earned a 27% operating margin and over $10 billion in operating income in 2024 (Netflix, 2025)."
    ]),
    P([
      "This runs against a comforting story about platforms: that scale wins, and whoever signs up the most users ends up the most profitable. ",
      "In streaming, everyone got scale — hundreds of millions of subscribers — and almost no one got profit. ",
      "The audience shifted wholesale, but for years the economics did not follow. ",
      "So the puzzle is not whether streaming won; it clearly did. It is why winning the audience did not, for most players, mean winning a business."
    ]),
    P([
      "This note asks three questions. First, why did adding hundreds of millions of subscribers produce losses rather than profits for most streamers? ",
      "Second, what structural advantage let Netflix earn money while its rivals bled? ",
      "Third, what do the recent pivots — price hikes, cheaper ad-supported tiers, password-sharing crackdowns, and consolidation — imply for whether streaming becomes a genuinely good business or merely a less-bad one?"
    ]),
    React.createElement(Glossary, { items: [
      { t: "Streaming (SVOD)", d: "Subscription video on demand: watching TV and film over the internet for a monthly fee, on demand." },
      { t: "Operating margin", d: "Operating income as a share of revenue; how many cents of each sales dollar are left after running costs." },
      { t: "Direct-to-consumer (DTC)", d: "Selling a service straight to viewers via an app, instead of through cable or satellite middlemen." },
      { t: "Cumulative operating loss", d: "The running total of a business unit's yearly operating losses added up over several years." }
    ] })
  );

  // ---------- 2. BACKGROUND ----------
  const background = React.createElement("div", null,
    React.createElement("h1", null, "Background — How the Audience Moved but the Money Didn't"),
    P([
      "For most of television's history, the money came from two fat pipes: cable subscriptions and advertising, both tied to a bundle that households paid for whether or not they watched. ",
      "Streaming broke that bundle apart. Viewers could pick one service, pay only for it, and cancel anytime. ",
      "The audience loved it — and moved fast."
    ]),
    P([
      "Nielsen's monthly tracker, 'The Gauge,' shows how far the shift has gone. ",
      "In June 2024 streaming was 40% of US TV time; by May 2025 it passed broadcast and cable combined for the first time (Nielsen, 2025). ",
      "The chart shows the crossover."
    ]),
    chart(CHART1),
    P([
      "Netflix pioneered the model and, unusually, made it pay. ",
      "Its revenue rose every year from about $30 billion in 2021 to $39 billion in 2024, but its profit did not move in a straight line: operating income actually fell in 2022 before jumping in 2024 (Netflix, 2025). ",
      "That zig-zag is the first clue to the paradox — in this business, profit does not simply follow revenue."
    ]),
    chart(CHART2),
    num({
      id: "s2q1", unit: "$", min: 0, max: 150, step: 1, target: 53, band: 8,
      prompt: "Netflix spent about $16 billion adding content in 2024 and ended the year with about 302 million paid memberships. Estimate its content spend per member for the year (in dollars).",
      scaffold: "Decomposition skeleton: content spend ÷ members = $16,000 million ÷ 302 million members.",
      explain: "<b>How to estimate this:</b> 16,000 ÷ 302 ≈ <b>$53 per member per year</b>, or about $4.40 a month. Bounds: if you used 300M you'd get ~$53; using 250M gives ~$64, using 350M gives ~$46 — so the answer sits in the $45–$65 band. Tolerance ±$8 (tight, because this is a straight division, not a Fermi guess). <b>Why it matters:</b> the same $16B spread over a 120M-subscriber rival is ~$133 per member — 2.5x more — which is the heart of the scale story. <b>Where this generalizes:</b> any shared fixed cost (R&D, a factory, a content library) has a per-unit cost that falls as the base grows; divide the fixed cost by the base to see who can afford it."
    }),
    mc({
      id: "s2q2", qType: "B",
      prompt: "Streaming let households drop the cable bundle and pay only for what they watch. For a legacy media company, which consequence of 'unbundling' is most damaging — and most easily missed?",
      options: [
        "Viewers watch more total hours, which raises production costs",
        "Advertising disappears entirely from all television",
        "Content becomes cheaper to make because it is delivered online",
        "Revenue that used to arrive from every household in a bundle now must be won subscriber-by-subscriber, and the lost bundle dollars were far higher-margin than the new streaming dollars"
      ],
      correct: 3,
      explain: "<b>Principle:</b> unbundling doesn't just change how you sell — it destroys the cross-subsidy where non-watchers helped pay for the channel. Each dollar must now be earned directly, and at thinner margins. <b>Why the others miss:</b> (A) more hours isn't the core harm; (B) ads persist and are growing in streaming; (C) online delivery doesn't make premium content cheap to produce. <b>Where this generalizes:</b> newspapers, cable, telecom packages — whenever a bundle unbundles, the incumbent loses its highest-margin, least-engaged payers first."
    }),
    React.createElement(Glossary, { items: [
      { t: "The bundle", d: "A package (like cable) sold as one price for many channels, so light viewers subsidize heavy ones." },
      { t: "Unbundling", d: "Breaking a package into separate products people can buy one at a time." },
      { t: "Operating leverage", d: "When revenue grows faster than costs, so extra sales turn mostly into profit — common once fixed costs are covered." },
      { t: "Content spend", d: "The money a streamer puts into making and licensing the shows and films in its library." }
    ] })
  );

  // ---------- 3. Q1 WHY SCALE DIDN'T PAY ----------
  const q1 = React.createElement("div", null,
    React.createElement("h1", null, "Question One — Why Didn't Subscriber Scale Pay?"),
    P([
      "The thesis to test: streaming's core cost is content, and content is a large fixed cost paid up front, mostly before the subscribers who watch it arrive. ",
      "Signing up a new subscriber adds revenue but barely changes the content bill. ",
      "So in the early land-grab years, when everyone spent heavily on content to buy subscribers, more subscribers often meant more spending, not more profit."
    ]),
    P([
      "Netflix's own numbers show the shape. In 2024 it added about $16 billion of content and reported $39 billion of revenue (Netflix, 2025). ",
      "The profit bridge below shows where each revenue dollar went — and why the size of the content block matters so much."
    ]),
    chart(CHART3),
    mc({
      id: "s3q1", qType: "B",
      prompt: "Netflix's operating margin rose from 20.6% in 2023 to 26.7% in 2024. A commentator writes, 'margins jumped 6%.' Which statement is correct — and names the trap?",
      options: [
        "The commentator is right: 6% is the correct way to describe the move",
        "Margin rose about 30%, so '6%' understates it — the level and the change are the same thing",
        "Margin rose about 6 percentage points, which is roughly a 30% relative increase — calling it '6%' confuses percentage points with percent",
        "The move cannot be described numerically without the dollar figures"
      ],
      correct: 2,
      explain: "<b>Principle (percent vs percentage points):</b> a move from 20.6% to 26.7% is +6.1 <i>percentage points</i>, which is a ~30% <i>relative</i> rise (6.1 ÷ 20.6). Saying 'margins jumped 6%' blurs the two and understates the change. <b>Why the others miss:</b> (A) repeats the error; (B) confuses level and change; (D) the move is perfectly describable — in points or percent, just say which. <b>Where this generalizes:</b> interest rates, tax rates, vote shares — always state whether a move is in points or in percent, because they can differ several-fold."
    }),
    num({
      id: "s3q2", unit: "$B", min: 5, max: 80, step: 1, target: 30, fermi: 2,
      prompt: "Open-ended estimate: across all the major US streaming challengers (Disney, Warner, Paramount, Peacock, and others — everyone except profitable Netflix), roughly what were TOTAL cumulative operating losses during the 2019–2024 land grab? Name your decomposition path in your head, then enter a number in $ billions.",
      scaffold: "Scaffold faded — build your own path. Anchor you have: Disney's streaming arm alone lost about $11.4B cumulatively. Ask: how many other loss-making challengers were there, and were their losses similar, smaller, or larger?",
      explain: "<b>How to estimate this:</b> anchor on Disney (~$11.4B). Add Warner's Max, Paramount+, Peacock, Apple TV+, and others; several lost multiple billions each across the period. A reasonable chain: Disney ~$11B + Paramount ~$5–6B + Peacock ~$8–10B + Warner/others ~$5–8B → roughly <b>$25–$40B</b>, so ~$30B as a central estimate. Factor-of-2 tolerance because this is a genuine Fermi sum of noisy figures, scored on log-distance so $15B and $60B are treated as equally far off. Lower bound ~$20B (if you count only the biggest three), upper ~$50B+ (if you include every service and marketing). <b>Where this generalizes:</b> to size an industry-wide total, anchor on one well-measured member and scale by the count and rough size of the rest — an order-of-magnitude answer beats no answer."
    }),
    React.createElement(Glossary, { items: [
      { t: "Fixed cost", d: "A cost that does not change much when you serve one more customer — here, the content library." },
      { t: "Profit bridge (waterfall)", d: "A chart that starts at revenue and subtracts each cost block to show what is left as profit." },
      { t: "Land grab", d: "A phase where rivals spend heavily to capture users fast, accepting losses to win market share." },
      { t: "Percentage point", d: "The plain difference between two percentages (20% to 26% is 6 points), distinct from a percent change." }
    ] })
  );

  // ---------- 4. Q2 NETFLIX'S EDGE ----------
  const q2 = React.createElement("div", null,
    React.createElement("h1", null, "Question Two — What Let Netflix Earn While Rivals Bled?"),
    P([
      "The thesis to test: Netflix's edge is structural, not just better taste in shows. ",
      "It got global scale first, so it spreads a similar-sized content budget over far more paying members. ",
      "And it has no shrinking cable business to protect, so every streaming dollar is a gain, not a dollar cannibalized from a richer legacy product."
    ]),
    P([
      "Scale only helps if those members actually pay. Here the picture is uneven. ",
      "Netflix earns about $17 a month per member in the US and Canada but only about $7 in Asia-Pacific (Netflix, 2025), and most new members now come from those cheaper regions. ",
      "The chart shows the spread."
    ]),
    chart(CHART4),
    mc({
      id: "s4q1", qType: "B",
      prompt: "YouTube has a larger share of US TV time than Netflix, yet Netflix earns far more subscription profit. A strategist concludes: 'viewing share causes profit, so whoever is watched most will earn most.' Which is the strongest reason that reasoning is wrong?",
      options: [
        "Viewing share and profit can diverge because they run on different business models — YouTube monetizes free viewers with ads, Netflix charges subscriptions — so attention does not mechanically convert to subscription profit",
        "YouTube's viewing share must be measured incorrectly",
        "Netflix is simply a older company, which is why it earns more",
        "Viewing share always causes profit, so the strategist is right"
      ],
      correct: 0,
      explain: "<b>Principle (correlation ≠ causation):</b> attention and profit correlate loosely, but the link runs through a business model. YouTube converts attention to ad dollars at low rates per hour; Netflix converts far fewer hours to high-value subscriptions. Same 'attention,' different money. <b>Why the others miss:</b> (B) dodges by attacking the data; (C) offers an irrelevant cause (age); (D) simply asserts the confusion. <b>Where this generalizes:</b> pageviews, downloads, engagement — a big top-of-funnel number only becomes profit through a specific conversion mechanism; name it before assuming it."
    }),
    mc({
      id: "s4q2", qType: "Case", caseClient: "Northstar Media (fictional), a legacy studio deciding whether to keep pouring money into its own streaming app",
      prompt: "Northstar's app has 40 million subscribers, mostly domestic, and loses money. A director argues 'Netflix proves scale wins — so we should spend to reach 150 million subscribers.' You must name the load-bearing assumption behind copying Netflix. Which must hold — and is thinnest in this article?",
      options: [
        "That domestic subscribers watch more hours than international ones",
        "That Northstar can reach global scale AND high revenue-per-member without a legacy business it must protect — the very conditions the article shows are specific to Netflix, not general",
        "That streaming will keep taking share from cable",
        "That the app's technology is as reliable as Netflix's"
      ],
      correct: 1,
      explain: "<b>Principle (weakest link):</b> 'scale wins' quietly assumes you can get Netflix's kind of scale — global reach, high paying ARPU, and no cannibalized cable profits. The article shows those conditions are Netflix-specific; a mostly-domestic studio protecting a cable business may spend to 150M and still lose. <b>Why the others miss:</b> (A) hours don't equal revenue; (C) rising streaming share doesn't guarantee profit (that's the paradox); (D) reliability is table stakes, not the binding constraint. <b>Failure mode:</b> Northstar burns billions chasing a scale that doesn't carry Netflix's economics. <b>Where this generalizes:</b> before copying a winner, ask which of its conditions you can actually reproduce — imitating the strategy without the structure repeats the loss."
    }),
    React.createElement(Glossary, { items: [
      { t: "ARPU / ARM", d: "Average revenue per user (Netflix calls it average revenue per membership): monthly revenue divided by members." },
      { t: "Cannibalization", d: "When a new product steals sales from your own existing, often higher-margin, product." },
      { t: "Blended average", d: "An average across a mix; it shifts when the mix shifts, even if no single price changes." },
      { t: "Structural advantage", d: "An edge built into a company's position (scale, cost base) rather than a temporary edge like one hit show." }
    ] })
  );

  // ---------- 5. Q3 THE PIVOTS ----------
  const q3 = React.createElement("div", null,
    React.createElement("h1", null, "Question Three — Good Business, or Just Less Bad?"),
    P([
      "The thesis to test: the recent turn to profit came from a strategy switch, not from the model magically working. ",
      "From 2023 to 2024 the loss-making challengers narrowed or erased their streaming losses — Disney's streaming arm swung from about a $2.6 billion loss to a small profit, Warner's streaming earned $677 million, and Paramount cut its loss by about $1.2 billion (company reports, 2024–25). ",
      "The chart shows the swing."
    ]),
    chart(CHART5),
    mc({
      id: "s5q1", qType: "B",
      prompt: "The challengers reached profit partly by raising prices, adding ads, and cracking down on password sharing. Which risk does this 'squeeze more from existing users' strategy most directly create if pushed too far?",
      options: [
        "Content costs will automatically rise to match higher prices",
        "Regulators will force all streamers to merge",
        "Advertising revenue is impossible to grow in streaming",
        "Higher prices and stricter access can lift revenue per user in the short run but raise churn, so the profit gain may reverse as annoyed subscribers cancel"
      ],
      correct: 3,
      explain: "<b>Principle:</b> squeezing more revenue per existing user (price hikes, ad loads, ending sharing) works until it lifts churn; the durable question is whether the higher revenue survives the cancellations it can trigger. <b>Why the others miss:</b> (A) content cost isn't mechanically tied to price; (B) invents a regulatory outcome; (C) is false — ad tiers are among the fastest-growing revenue lines. <b>Where this generalizes:</b> any monetization push on a fixed user base — fees, ads, seat limits — trades short-term revenue against retention; watch the churn line, not just the revenue line."
    }),
    mc({
      id: "s5q2", qType: "Case", caseClient: "The board of a mid-sized streamer, deciding its 2027 strategy after finally reaching breakeven",
      prompt: "The board wants to know whether breakeven is a foundation or a ceiling. Using the article, which combination of facts should most shape the decision — including the main risk?",
      options: [
        "Breakeven came from price hikes, ad tiers, and cost cuts on a mostly-domestic base with lower ARPU than Netflix — so the model may be structurally thinner, and the main risk is that further squeezing users lifts churn faster than revenue",
        "Breakeven proves the business is now as strong as Netflix's, so the board should stop worrying",
        "The board should cut all content spending to maximize profit immediately",
        "The board should assume viewing share alone will guarantee future profit"
      ],
      correct: 0,
      explain: "<b>Principle:</b> how you reached breakeven determines whether it lasts. Profit built on squeezing a smaller, lower-ARPU base is more fragile than Netflix's scale-driven margin, and the binding risk is churn from over-squeezing. <b>Why the others miss:</b> (B) ignores the structural ARPU and scale gap; (C) gutting content collapses the product that retains subscribers; (D) repeats the attention-equals-profit error from Question Two. <b>Failure mode:</b> mistaking a strategy-driven breakeven for a durable moat, then over-pricing into a churn spiral. <b>Where this generalizes:</b> when a turnaround works, separate the one-time levers (cost cuts, price resets) from repeatable engines (scale, network effects) before betting the future on it."
    }),
    React.createElement(Glossary, { items: [
      { t: "Ad-supported tier", d: "A cheaper subscription that shows ads; it lowers the price for viewers while adding ad revenue for the service." },
      { t: "Password-sharing crackdown", d: "Charging extra for, or blocking, viewers outside the paying household to convert freeloaders into subscribers." },
      { t: "Breakeven", d: "The point where a business's revenue just covers its costs — no profit, no loss." },
      { t: "Moat", d: "A durable advantage that protects profits from competitors, like scale or a network effect." }
    ] })
  );

  // ---------- 7. CONCLUSION ----------
  const conclusion = React.createElement("div", null,
    React.createElement("h1", null, "Conclusion — Attention Is Not a Business Model"),
    P([
      "Streaming's central challenge was never winning the audience; it was turning that audience into a business. ",
      "The most likely path from here is a two-tier industry: Netflix, with the scale and revenue-per-member to hold a real margin, and a pack of rivals that have reached breakeven by pricing up, adding ads, and cutting costs — profitable, but thinly, and vulnerable to the churn their own squeeze creates."
    ]),
    P([
      "For anyone building or investing in subscription media, the implication is to treat scale as necessary but not sufficient. ",
      "The question is not 'how many subscribers,' but 'how much revenue per subscriber, spread over how large a base, against how big a fixed content bill, and cannibalizing what.' ",
      "A headline subscriber count without those four is a vanity metric."
    ]),
    P([
      "For the wider media economy, the implication is that owning distribution is not the same as owning the surplus. ",
      "The scarce, portable asset is the content and the global subscriber relationship; whoever spreads a fixed content bill over the largest paying base captures the durable profit, and everyone else supplies the fixed costs and bears the risk. ",
      "The unresolved question is whether the rivals' breakeven is the first step toward a real business — or the best they will ever do before consolidation forces the weakest to sell or fold."
    ]),
    mc({
      id: "ce", qType: "E",
      prompt: "Given everything above, which decision is most directly supported by the evidence — and which observation would most threaten (falsify) the article's thesis that Netflix's profit edge is structural, not just a head start?",
      options: [
        "Decision: assume any streamer that reaches Netflix's subscriber count will match its margin. Falsifier: none — scale guarantees profit.",
        "Decision: judge a streamer on revenue-per-member × base size versus its fixed content bill and legacy cannibalization, not on subscriber count alone; treat rivals' breakeven as fragile. Falsifier: a mostly-domestic rival reaching Netflix-level operating margin WITHOUT global scale or high ARPU — which would show the edge was a head start, not structure.",
        "Decision: exit streaming entirely because no one can make money. Falsifier: Netflix's next hit show.",
        "Decision: assume viewing share will convert to profit for whoever leads it. Falsifier: a rise in cable subscriptions."
      ],
      correct: 1,
      explain: "<b>Principle:</b> the strongest recommendation states what to do AND what would prove it wrong. Option B pairs a structural scorecard (ARPU × base vs fixed cost and cannibalization) with a genuine falsification test: if a small, domestic, low-ARPU rival matched Netflix's margin, the edge would be a head start, not structure. <b>Why the others miss:</b> (A) denies any falsifier, which is unscientific and contradicts the whole article; (C) overreacts — Netflix clearly earns — and its falsifier is irrelevant; (D) repeats the attention-equals-profit error and its falsifier doesn't test the thesis. <b>Failure mode to watch:</b> the biggest threat to Option B's action is assuming today's breakeven rivals are safe when a churn spiral could reverse it. <b>Where this generalizes:</b> a thesis you can't state a falsifier for isn't an analysis — it's a belief."
    }),
    React.createElement(Glossary, { items: [
      { t: "Two-tier industry", d: "A market split into a dominant, high-margin leader and a group of thinner, weaker competitors." },
      { t: "Vanity metric", d: "A number that looks impressive but doesn't map to profit or the decision at hand — like raw subscriber count." },
      { t: "Falsifier", d: "A specific observation that, if seen, would prove a thesis wrong." },
      { t: "Consolidation", d: "Weaker firms merging or being bought so the industry ends up with fewer, larger players." }
    ] }),
    React.createElement(Sources)
  );

  return [
    { title: "Warm-Up", node: warmup },
    { title: "Introduction", node: intro },
    { title: "Background", node: background },
    { title: "Q1: Why scale didn't pay", node: q1 },
    { title: "Q2: Netflix's edge", node: q2 },
    { title: "Q3: The pivots", node: q3 },
    { title: "Learning Summary", node: null },
    { title: "Conclusion", node: conclusion }
  ];
}

/* ===================== SOURCES ===================== */

function Sources() {
  const src = [
    ["Netflix Q4 2024 Shareholder Letter (Jan 21, 2025) — revenue, operating margin, memberships, regional ARM", "https://s22.q4cdn.com/959853165/files/doc_financials/2024/q4/FINAL-Q4-24-Shareholder-Letter.pdf"],
    ["Nielsen — 'Streaming Reaches Historic TV Milestone, Eclipses Combined Broadcast and Cable Viewing' (2025)", "https://www.nielsen.com/news-center/2025/streaming-reaches-historic-tv-milestone-eclipses-combined-broadcast-and-cable-viewing-for-first-time/"],
    ["Nielsen — 'Time Spent Streaming Surges to Over 40% in June' (2024, The Gauge)", "https://www.nielsen.com/news-center/2024/time-spent-streaming-surges-to-over-40-percent-in-june-2024/"],
    ["Forbes — 'The Real Reason For Disney's $11 Billion Streaming Losses' (Apr 2024)", "https://www.forbes.com/sites/carolinereid/2024/04/07/the-real-reason-for-disneys-11-billion-streaming-losses/"],
    ["The Walt Disney Company — Q4 & Full Year Fiscal 2024 Earnings (DTC results)", "https://thewaltdisneycompany.com/the-walt-disney-company-reports-fourth-quarter-and-full-year-earnings-for-fiscal-2024/"],
    ["The Hollywood Reporter — 'Warner Bros. Discovery Turns $677M DTC Profit for 2024' (Feb 2025)", "https://www.hollywoodreporter.com/business/business-news/warner-bros-discovery-q4-2024-earnings-streaming-profit-subscribers-advertising-1236148203/"],
    ["The Wrap — 'Paramount Narrows Streaming Losses 42% to $286 Million' (Q4/FY2024)", "https://www.thewrap.com/paramount-earnings-q4-2024/"],
    ["CNBC — 'Netflix ad-supported tier has 70 million monthly users' (Nov 2024)", "https://www.cnbc.com/2024/11/12/netflix-ad-supported-tier-70-million-monthly-users.html"]
  ];
  return React.createElement("div", { className: "sources" },
    React.createElement("div", { className: "gloss-label" }, "Sources"),
    src.map(function (s, i) {
      return React.createElement("div", { key: i, className: "src-item" },
        React.createElement("a", { href: s[1], target: "_blank", rel: "noopener" }, s[0]));
    }),
    React.createElement("div", { className: "src-note" },
      "Provenance: Netflix figures (revenue $39.0B, operating income $10.4B, 26.7% margin, 301.6M memberships, regional ARM, $16.2B content additions) are FACTs from Netflix's Q4'24 letter and 10-K. Viewing shares are FACTs from Nielsen's The Gauge. Disney's ~$11.4B cumulative loss is a FACT from company filings reported by Forbes; the 2023 vs 2024 operating-income figures for Disney DTC, Warner (Max), and Paramount DTC are FACTs from company earnings (different segment definitions and fiscal years, noted in-chart). The ~$30B industry-wide cumulative-loss figure in Question One is an ESTIMATE for a Fermi exercise, labeled as such.")
  );
}

/* ===================== LEARNING SUMMARY ===================== */

function Summary(props) {
  const { qstate, interp, scored, governing, setGoverning, applyA, setApplyA, applyB, setApplyB, applyResult, setApplyResult, onContinue } = props;
  const [insightsShown, setInsightsShown] = useState(false);

  const typeMap = {
    w1: "B", w2: "B", w3: "B", s2q1: "D", s2q2: "B",
    s3q1: "B", s3q2: "D", s4q1: "B", s4q2: "Case",
    s5q1: "B", s5q2: "Case", ce: "E"
  };
  const byType = {};
  Object.keys(typeMap).forEach(function (id) {
    var t = typeMap[id]; if (!byType[t]) byType[t] = { c: 0, n: 0 };
    byType[t].n++; if (qstate[id] && qstate[id].submitted && qstate[id].correct) byType[t].c++;
  });

  var highWrong = [], lowRight = [];
  Object.keys(qstate).forEach(function (id) {
    var v = qstate[id];
    if (v && v.submitted) {
      if (v.confidence === "High" && !v.correct) highWrong.push(id);
      if (v.confidence === "Low" && v.correct) lowRight.push(id);
    }
  });

  var numIds = ["s2q1", "s3q2"], targets = { s2q1: 53, s3q2: 30 };
  var signed = [];
  numIds.forEach(function (id) {
    var v = qstate[id];
    if (v && v.submitted) { signed.push((Number(v.value) - targets[id]) / targets[id]); }
  });
  var avgBias = signed.length ? (signed.reduce(function (a, b) { return a + b; }, 0) / signed.length) : null;

  const principles = {
    w1: "A reported rate is a definition, not a fact of nature — check what counts",
    w2: "Per-unit value and aggregate budget are different verdicts",
    w3: "The owner of the scarce, portable asset captures the durable surplus",
    s2q1: "A shared fixed cost per unit falls as the base grows",
    s2q2: "Unbundling destroys the high-margin cross-subsidy first",
    s3q1: "Percent vs percentage points — state which you mean",
    s3q2: "Size an industry total by anchoring on one measured member",
    s4q1: "Attention converts to profit only through a business model (correlation ≠ causation)",
    s4q2: "Copy a winner's structure, not just its strategy",
    s5q1: "Squeezing revenue per user trades against churn",
    s5q2: "Separate one-time turnaround levers from repeatable engines",
    ce: "A thesis with no falsifier is a belief, not an analysis"
  };
  var missed = Object.keys(principles).filter(function (id) { return qstate[id] && qstate[id].submitted && !qstate[id].correct; });

  const authoredInsights = [
    "Streaming won the audience but not the economics for most players because content is a large fixed cost paid up front; adding subscribers below acquisition cost multiplied losses rather than profit — operating leverage appears only once the base is big enough to spread that cost, which Netflix reached first.",
    "Netflix's edge is structural, not just better shows: a ~300M global base spreads ~$16B of content across far more paying members (about $53 per member vs ~$133 for a 120M-member rival), and it has no shrinking cable business to protect — so the same library that loses money at small scale earns a 27% margin at large scale.",
    "The 2023–2024 swing to profit came from a strategy switch (price hikes, ad tiers, password crackdowns, cost cuts), not from the model suddenly working — so the open question is whether rivals built a durable business or merely bought a less-bad version of the old TV one, at risk of the churn their own squeeze creates."
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
            React.createElement("td", null, scored.correct + " / 12"))
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
      React.createElement("p", { className: "sum-hint" }, "New dataset, different domain (fitness, not media): A national gym chain grew membership 60% in three years, but its operating margin is still negative. Each new location has a high fixed cost, and new-market gyms average far fewer members per location than mature ones. Give four labeled parts."),
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
