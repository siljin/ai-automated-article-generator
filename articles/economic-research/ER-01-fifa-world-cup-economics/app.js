const {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  Cell
} = Recharts;

const sources = [
  {
    label: "FIFA Annual Report 2022: 2022 financial highlights",
    url: "https://publications.fifa.com/en/annual-report-2022/finances/2019-2022-cycle-in-review/2022-financial-highlights/"
  },
  {
    label: "FIFA Annual Report 2022: 2019-2022 revenue",
    url: "https://publications.fifa.com/en/annual-report-2022/finances/2019-2022-cycle-in-review/2019-2022-revenue/"
  },
  {
    label: "FIFA Annual Report 2022: 2019-2022 investments and expenses",
    url: "https://publications.fifa.com/en/annual-report-2022/finances/2019-2022-cycle-in-review/2019-2022-investments-expenses/"
  },
  {
    label: "FIFA Annual Report 2022: 2023-2026 cycle budget",
    url: "https://publications.fifa.com/en/annual-report-2022/finances/2023-2026-cycle-budget-and-2024-detailed-budget/"
  },
  {
    label: "Qatar Tourism Annual Tourism Performance Report 2022",
    url: "https://www.qatartourism.com/content/dam/qatar-tourism/qatar-tourism-reports/qatar-tourism-annual-report-2022.pdf"
  },
  {
    label: "Qatar Tourism FY 2023 Tourism Performance Report",
    url: "https://www.qatartourism.com/content/dam/qatar-tourism/qatar-tourism-reports/Qatar-Tourism-FY-2023-tourism-performance-report.pptx.pdf"
  },
  {
    label: "The Guardian: FIFA 2026 balance-sheet debate",
    url: "https://www.theguardian.com/football/ng-interactive/2026/apr/30/the-13bn-world-cup-how-the-numbers-stack-up-on-fifas-2026-balance-sheet"
  },
  {
    label: "FIFA: World Cup 2026 tournament hub",
    url: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026"
  }
];

const cycleRevenueData = [
  { cycle: "2015-18", revenue: 6.421, type: "Actual" },
  { cycle: "2019-22", revenue: 7.568, type: "Actual" },
  { cycle: "2023-26", revenue: 11.0, type: "Budget" }
];

const fifaRevenueMixData = [
  { stream: "TV rights", value: 3.426 },
  { stream: "Marketing", value: 1.795 },
  { stream: "Tickets + hospitality", value: 0.949 },
  { stream: "Licensing", value: 0.769 },
  { stream: "Other", value: 0.629 }
];

const fifaCashFlowData = [
  { item: "Qatar WC rights", value: 6.314 },
  { item: "FIFA WC investment", value: 1.708 },
  { item: "Prize money", value: 0.44 },
  { item: "Club benefits", value: 0.209 },
  { item: "Host contribution", value: 0.2 }
];

const qatarVisitorData = [
  { year: "2015", visitors: 2.941 },
  { year: "2016", visitors: 2.938 },
  { year: "2017", visitors: 2.256 },
  { year: "2018", visitors: 1.819 },
  { year: "2019", visitors: 2.137 },
  { year: "2020", visitors: 0.582 },
  { year: "2021", visitors: 0.611 },
  { year: "2022", visitors: 2.54 },
  { year: "2023", visitors: 4.054 }
];

const qatarHotelIndexData = [
  { year: "2019", roomKeys: 100, roomNights: 100, adr: 100, occupancy: 100 },
  { year: "2022", roomKeys: 137, roomNights: 102, adr: 199, occupancy: 86 },
  { year: "2023", roomKeys: 143, roomNights: 126, adr: 109, occupancy: 88 }
];

const budgetShiftData = [
  { stream: "TV rights", actual: 3.426, budget: 4.264 },
  { stream: "Marketing", actual: 1.795, budget: 2.693 },
  { stream: "Tickets + hospitality", actual: 0.949, budget: 3.097 },
  { stream: "Licensing", actual: 0.769, budget: 0.669 },
  { stream: "Other", actual: 0.629, budget: 0.277 }
];

const sectionList = [
  {
    id: "intro",
    eyebrow: "Opening frame",
    title: "The Split Economics of the World Cup",
    shortTitle: "Intro",
    questionIds: ["intro-asymmetry", "intro-case"]
  },
  {
    id: "background",
    eyebrow: "Structural context",
    title: "A Tournament Business Built on Rights",
    shortTitle: "Context",
    questionIds: ["background-cycle", "background-estimate"]
  },
  {
    id: "fifa-lens",
    eyebrow: "Research question 1",
    title: "Why FIFA Likes the World Cup Model",
    shortTitle: "FIFA Lens",
    questionIds: ["rq1-mix", "rq1-case"]
  },
  {
    id: "host-lens",
    eyebrow: "Research question 2",
    title: "Why Hosts Still Bid for It",
    shortTitle: "Host Lens",
    questionIds: ["rq2-visitors", "rq2-estimate"]
  },
  {
    id: "future-lens",
    eyebrow: "Research question 3",
    title: "What Changes in 2026",
    shortTitle: "2026 Lens",
    questionIds: ["rq3-expansion", "rq3-case"]
  },
  {
    id: "summary",
    eyebrow: "Learning summary",
    title: "What You Should Now Be Able to Explain",
    shortTitle: "Summary",
    questionIds: []
  },
  {
    id: "conclusion",
    eyebrow: "Conclusion",
    title: "A Better Bargain Needs Shared Upside",
    shortTitle: "Conclusion",
    questionIds: ["conclusion-bridge"]
  }
];

const questionBank = {
  "intro-asymmetry": {
    kind: "choice",
    sectionId: "intro",
    typeLabel: "Type A chart reading",
    prompt:
      "Which statement best explains the core asymmetry between FIFA and the host country?",
    options: [
      "FIFA usually pays the largest infrastructure bill while the host keeps most media revenue.",
      "FIFA monetizes global rights with limited local capital exposure, while the host absorbs place-specific cost and legacy risk.",
      "The host country captures most ticket revenue, so FIFA mainly benefits from tourism spillovers.",
      "The host and FIFA face identical risks because the tournament budget is jointly financed."
    ],
    correctIndex: 1,
    explanation:
      "FIFA's model is built around global media, marketing, licensing, ticketing, and hospitality rights. Hosts pursue tourism, branding, infrastructure, and political returns, but those returns are less automatic."
  },
  "intro-case": {
    kind: "choice",
    sectionId: "intro",
    typeLabel: "Type C interpretation",
    prompt:
      "A finance ministry says the World Cup should be judged only by visitor spending during the tournament month. What is the best response?",
    options: [
      "That is too narrow because the host case also depends on post-event tourism, asset use, opportunity cost, and public finance exposure.",
      "That is correct because visitor spending is the only measurable return from the event.",
      "That is too broad because the only relevant return is FIFA's net result.",
      "That is correct only when every stadium is privately financed."
    ],
    correctIndex: 0,
    explanation:
      "The host-country ledger is a multi-year public-investment problem. Tournament-month spending matters, but it is not the full economic test."
  },
  "background-cycle": {
    kind: "choice",
    sectionId: "background",
    typeLabel: "Type A chart reading",
    prompt:
      "The revenue-cycle chart suggests which broad trend in FIFA's business model?",
    options: [
      "World Cup revenue collapsed after 2018 and has not recovered.",
      "FIFA's budget depends mainly on annual membership fees.",
      "FIFA expected a materially larger 2023-2026 cycle than the 2019-2022 cycle.",
      "Licensing replaced television as FIFA's largest revenue stream."
    ],
    correctIndex: 2,
    explanation:
      "FIFA reported USD 7.568 billion of revenue in 2019-2022 and budgeted USD 11.0 billion for 2023-2026."
  },
  "background-estimate": {
    kind: "estimate",
    sectionId: "background",
    typeLabel: "Type B numerical estimation",
    prompt:
      "Estimate the multiple: FIFA budgeted USD 3.097 billion of hospitality and ticket sales for 2023-2026 versus USD 0.949 billion in 2019-2022. Roughly how many times larger is the budgeted amount?",
    suffix: "x",
    target: 3.26,
    tolerance: 0.35,
    placeholder: "Example: 3.2",
    method:
      "Divide 3.097 by 0.949. The answer is about 3.26, or roughly 3.3 times.",
    explanation:
      "The 2026 tournament has more matches, larger North American venues, and a much bigger ticketing and hospitality ambition than the Qatar cycle."
  },
  "rq1-mix": {
    kind: "choice",
    sectionId: "fifa-lens",
    typeLabel: "Type A chart reading",
    prompt:
      "In FIFA's 2019-2022 revenue mix, which stream was the largest?",
    options: [
      "Television broadcasting rights",
      "Licensing rights",
      "Other income",
      "Ticketing and hospitality"
    ],
    correctIndex: 0,
    explanation:
      "Television rights generated USD 3.426 billion, or about 45% of FIFA's 2019-2022 revenue."
  },
  "rq1-case": {
    kind: "choice",
    sectionId: "fifa-lens",
    typeLabel: "Type D scenario",
    prompt:
      "A member association asks why FIFA can raise development grants after a World Cup without owning host-city hotels, airports, or roads. Which mechanism explains it best?",
    options: [
      "FIFA receives a fixed tax transfer from every host city after the event.",
      "Host governments are required to transfer all tourism taxes to FIFA.",
      "FIFA turns stadium operating profits into grants after local costs are paid.",
      "FIFA sells global rights, centralizes tournament cash flow, and redistributes part of the cycle surplus through programs such as FIFA Forward."
    ],
    correctIndex: 3,
    explanation:
      "FIFA Forward entitlements rose from USD 1.161 billion in 2015-2018 to USD 1.746 billion in 2019-2022, funded by the federation's centralized cycle model."
  },
  "rq2-visitors": {
    kind: "choice",
    sectionId: "host-lens",
    typeLabel: "Type A chart reading",
    prompt:
      "What happened to Qatar's international visitor count after the tournament year?",
    options: [
      "It fell below the pandemic trough.",
      "It returned exactly to the 2019 level.",
      "It rose to about 4.1 million in 2023, above the 2022 and 2019 totals.",
      "It stayed flat because all 2023 visitors were same-day cruise passengers."
    ],
    correctIndex: 2,
    explanation:
      "Qatar Tourism reported 4.054 million international visitors in 2023, compared with 2.540 million in 2022 and 2.137 million in 2019."
  },
  "rq2-estimate": {
    kind: "estimate",
    sectionId: "host-lens",
    typeLabel: "Type B numerical estimation",
    prompt:
      "Qatar's hotel average daily rate was QAR 742 in 2022 and QAR 408 in 2023. Estimate the percentage decline from 2022 to 2023.",
    suffix: "%",
    target: 45,
    tolerance: 5,
    placeholder: "Example: 45",
    method:
      "Compute (742 - 408) / 742. That equals 334 / 742, or about 45%.",
    explanation:
      "The host can keep a tourism legacy while tournament-year pricing normalizes. Visitor numbers rose in 2023, but hotel pricing fell sharply."
  },
  "rq3-expansion": {
    kind: "choice",
    sectionId: "future-lens",
    typeLabel: "Type A chart reading",
    prompt:
      "Which revenue category shows the biggest absolute increase from FIFA's 2019-2022 actuals to the 2023-2026 budget?",
    options: [
      "Licensing",
      "Other income",
      "Television rights",
      "Ticketing and hospitality"
    ],
    correctIndex: 3,
    explanation:
      "Hospitality and ticket sales rise from USD 0.949 billion to a budgeted USD 3.097 billion, the largest absolute increase among the listed streams."
  },
  "rq3-case": {
    kind: "choice",
    sectionId: "future-lens",
    typeLabel: "Type D scenario",
    prompt:
      "A 2026 host city already has large stadiums, airports, and hotel capacity. Which economic implication follows most directly?",
    options: [
      "FIFA loses the ability to sell global television rights.",
      "The host's marginal infrastructure burden may be lower than a greenfield host, but security, transport, public services, and crowd-management costs remain real.",
      "The city has no public finance exposure because all matches are privately insured.",
      "Local businesses automatically capture the same surplus that FIFA records."
    ],
    correctIndex: 1,
    explanation:
      "North America's existing venue base can reduce some capital risk, but host-city operating obligations and public-service costs still shape the bargain."
  },
  "conclusion-bridge": {
    kind: "choice",
    sectionId: "conclusion",
    typeLabel: "Type E recommendation",
    prompt:
      "Which policy design best improves the World Cup bargain while acknowledging tradeoffs?",
    options: [
      "Tie host guarantees to transparent public cost caps, post-event venue-use plans, and a negotiated local upside share, while accepting that tighter rules may reduce bidder flexibility.",
      "Ban all public reporting until after the final match so negotiations stay simple.",
      "Maximize stadium construction because new capacity always creates permanent demand.",
      "Let FIFA keep all incremental ticketing upside because the host gains enough from publicity alone."
    ],
    correctIndex: 0,
    explanation:
      "A better bargain does not pretend the event is costless. It shifts from headline impact claims toward clear risk-sharing, asset discipline, and measurable legacy outcomes."
  }
};

const chartUnlocks = {
  cycle: "background-cycle",
  mix: "rq1-mix",
  cashflow: "rq1-case",
  visitors: "rq2-visitors",
  hotel: "rq2-estimate",
  budget: "rq3-expansion"
};

const totalQuestionIds = Object.keys(questionBank);
const COLORS = ["#1864ab", "#2f9e44", "#f08c00", "#7048e8", "#c92a2a", "#0b7285"];

function formatBillions(value) {
  return "$" + value.toFixed(value >= 10 ? 1 : 3).replace(/\.?0+$/, "") + "bn";
}

function formatPercent(value) {
  return value.toFixed(0) + "%";
}

function getQuestionScore(question, answer) {
  if (!answer || !answer.submitted) return 0;
  if (question.kind === "choice") {
    return answer.selectedIndex === question.correctIndex ? 1 : 0;
  }
  const numericValue = Number(answer.value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.abs(numericValue - question.target) <= question.tolerance ? 1 : 0;
}

function SectionProse({ children }) {
  return <div className="section-prose">{children}</div>;
}

function SourceLink({ index }) {
  const source = sources[index];
  return (
    <a href={source.url} target="_blank" rel="noreferrer">
      {source.label}
    </a>
  );
}

function MetricStrip() {
  const metrics = [
    { label: "FIFA 2019-2022 revenue", value: "$7.568bn" },
    { label: "Qatar WC rights revenue", value: "$6.314bn" },
    { label: "2023 Qatar visitors", value: "4.054m" },
    { label: "FIFA 2023-2026 budget", value: "$11.0bn" }
  ];

  return (
    <div className="metric-strip">
      {metrics.map((metric) => (
        <div className="metric" key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
        </div>
      ))}
    </div>
  );
}

function ProgressPanel({ answers }) {
  const answered = totalQuestionIds.filter((id) => answers[id]?.submitted).length;
  const score = totalQuestionIds.reduce((sum, id) => {
    return sum + getQuestionScore(questionBank[id], answers[id]);
  }, 0);
  const pct = Math.round((answered / totalQuestionIds.length) * 100);

  return (
    <aside className="progress-panel" aria-label="Learning progress">
      <div>
        <span className="panel-label">Progress</span>
        <strong>{answered}/{totalQuestionIds.length}</strong>
      </div>
      <div className="progress-track">
        <span style={{ width: pct + "%" }} />
      </div>
      <div className="score-line">
        <span>Score</span>
        <strong>{score}/{totalQuestionIds.length}</strong>
      </div>
    </aside>
  );
}

function NavRail({ currentId, unlockedIds, onSelect }) {
  return (
    <nav className="nav-rail" aria-label="Article sections">
      {sectionList.map((section, index) => {
        const unlocked = unlockedIds.includes(section.id);
        const active = section.id === currentId;
        return (
          <button
            type="button"
            key={section.id}
            className={active ? "active" : ""}
            disabled={!unlocked}
            onClick={() => onSelect(section.id)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {section.shortTitle}
          </button>
        );
      })}
    </nav>
  );
}

function CustomTooltip({ active, payload, label, revealed, formatter }) {
  if (!active || !payload || !payload.length) return null;
  if (!revealed) {
    return (
      <div className="tooltip">
        <strong>{label}</strong>
        <p>Checkpoint values are masked.</p>
      </div>
    );
  }

  return (
    <div className="tooltip">
      <strong>{label}</strong>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name || entry.dataKey}: {formatter ? formatter(entry.value, entry.dataKey) : entry.value}
        </p>
      ))}
    </div>
  );
}

function ChartFrame({ id, title, subtitle, soWhat, source, answers, children }) {
  const unlockQuestion = chartUnlocks[id];
  const revealed = !unlockQuestion || answers[unlockQuestion]?.submitted;

  return (
    <section className="chart-frame" aria-label={title}>
      <div className="chart-heading">
        <div>
          <span className="chart-kicker">{revealed ? "Revealed" : "Checkpoint"}</span>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <span className={revealed ? "status-pill revealed" : "status-pill"}>
          {revealed ? "Values visible" : "Values masked"}
        </span>
      </div>
      <div className={revealed ? "chart-shell" : "chart-shell masked"}>
        {children(revealed)}
      </div>
      <div className="chart-note">
        <p>
          <strong>So what:</strong> {soWhat}
        </p>
        <small>{source}</small>
      </div>
    </section>
  );
}

function CycleChart({ answers }) {
  return (
    <ChartFrame
      id="cycle"
      answers={answers}
      title="FIFA revenue cycles"
      subtitle="Actual cycle revenue versus the 2023-2026 budget, USD billions."
      soWhat="The World Cup is not a one-month business for FIFA. It is the anchor of a four-year commercial cycle."
      source="Sources: FIFA 2022 annual report and 2023-2026 budget."
    >
      {(revealed) => (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cycleRevenueData} margin={{ top: 24, right: 12, bottom: 10, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="cycle" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={formatBillions} />
            <Tooltip content={<CustomTooltip revealed={revealed} formatter={(value) => formatBillions(value)} />} />
            <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]}>
              {cycleRevenueData.map((entry, index) => (
                <Cell key={entry.cycle} fill={index === 2 ? "#f08c00" : "#1864ab"} />
              ))}
              <LabelList dataKey="revenue" position="top" formatter={formatBillions} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

function RevenueMixChart({ answers }) {
  return (
    <ChartFrame
      id="mix"
      answers={answers}
      title="Where FIFA's 2019-2022 revenue came from"
      subtitle="Revenue stream totals, USD billions."
      soWhat="Broadcasting remains the strategic base, but tickets and hospitality become much more important in the 2026 budget."
      source="Source: FIFA 2022 annual report, 2019-2022 revenue section."
    >
      {(revealed) => (
        <ResponsiveContainer width="100%" height={330}>
          <BarChart data={fifaRevenueMixData} layout="vertical" margin={{ top: 12, right: 34, bottom: 6, left: 110 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={formatBillions} />
            <YAxis type="category" dataKey="stream" tickLine={false} axisLine={false} width={108} />
            <Tooltip content={<CustomTooltip revealed={revealed} formatter={(value) => formatBillions(value)} />} />
            <Bar dataKey="value" name="Revenue" radius={[0, 6, 6, 0]}>
              {fifaRevenueMixData.map((entry, index) => (
                <Cell key={entry.stream} fill={COLORS[index % COLORS.length]} />
              ))}
              <LabelList dataKey="value" position="right" formatter={formatBillions} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

function CashFlowChart({ answers }) {
  return (
    <ChartFrame
      id="cashflow"
      answers={answers}
      title="The Qatar 2022 cash-flow scale"
      subtitle="Selected FIFA-related amounts from the Qatar cycle, USD billions."
      soWhat="The rights bundle attached to one tournament was much larger than FIFA's direct tournament investment, prize pool, club benefits, or host contribution."
      source="Source: FIFA 2022 annual report, revenue and investment sections."
    >
      {(revealed) => (
        <ResponsiveContainer width="100%" height={310}>
          <BarChart data={fifaCashFlowData} margin={{ top: 20, right: 18, bottom: 40, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="item" tickLine={false} axisLine={false} interval={0} angle={-16} textAnchor="end" height={64} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={formatBillions} />
            <Tooltip content={<CustomTooltip revealed={revealed} formatter={(value) => formatBillions(value)} />} />
            <Bar dataKey="value" name="Amount" radius={[6, 6, 0, 0]} fill="#2f9e44">
              <LabelList dataKey="value" position="top" formatter={formatBillions} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

function VisitorsChart({ answers }) {
  return (
    <ChartFrame
      id="visitors"
      answers={answers}
      title="Qatar visitor arrivals"
      subtitle="International visitors, millions."
      soWhat="The host-country payoff is not limited to the event window. Qatar's 2023 visitor total became the stronger legacy signal."
      source="Sources: Qatar Tourism 2022 and 2023 tourism performance reports."
    >
      {(revealed) => (
        <ResponsiveContainer width="100%" height={330}>
          <LineChart data={qatarVisitorData} margin={{ top: 22, right: 18, bottom: 10, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => value.toFixed(1) + "m"} />
            <Tooltip content={<CustomTooltip revealed={revealed} formatter={(value) => value.toFixed(3) + "m"} />} />
            <Line type="monotone" dataKey="visitors" name="Visitors" stroke="#1864ab" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <LabelList dataKey="visitors" position="top" formatter={(value) => value.toFixed(1) + "m"} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

function HotelIndexChart({ answers }) {
  return (
    <ChartFrame
      id="hotel"
      answers={answers}
      title="Qatar hotel legacy indicators"
      subtitle="Indexes, 2019 = 100."
      soWhat="More supply and higher demand can coexist with price normalization. That is why legacy claims need several indicators, not one tournament-year number."
      source="Sources: Qatar Tourism 2022 and 2023 tourism performance reports."
    >
      {(revealed) => (
        <ResponsiveContainer width="100%" height={330}>
          <LineChart data={qatarHotelIndexData} margin={{ top: 22, right: 18, bottom: 10, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => value.toFixed(0)} />
            <Tooltip content={<CustomTooltip revealed={revealed} formatter={(value) => value.toFixed(0)} />} />
            <Legend verticalAlign="top" height={32} />
            <Line type="monotone" dataKey="roomKeys" name="Room keys" stroke="#1864ab" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="roomNights" name="Room nights" stroke="#2f9e44" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="adr" name="ADR" stroke="#f08c00" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="occupancy" name="Occupancy" stroke="#7048e8" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

function BudgetShiftChart({ answers }) {
  return (
    <ChartFrame
      id="budget"
      answers={answers}
      title="2019-2022 actuals versus 2023-2026 budget"
      subtitle="Revenue by stream, USD billions."
      soWhat="The 2026 model adds scale through a larger tournament and larger commercial platform, especially in ticketing and hospitality."
      source="Sources: FIFA 2022 annual report and 2023-2026 cycle budget."
    >
      {(revealed) => (
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={budgetShiftData} margin={{ top: 18, right: 18, bottom: 46, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="stream" tickLine={false} axisLine={false} interval={0} angle={-18} textAnchor="end" height={74} />
            <YAxis tickLine={false} axisLine={false} tickFormatter={formatBillions} />
            <Tooltip content={<CustomTooltip revealed={revealed} formatter={(value) => formatBillions(value)} />} />
            <Legend verticalAlign="top" height={32} />
            <Bar dataKey="actual" name="2019-2022 actual" fill="#1864ab" radius={[6, 6, 0, 0]} />
            <Bar dataKey="budget" name="2023-2026 budget" fill="#f08c00" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartFrame>
  );
}

function QuestionCard({ questionId, answer, onSubmit }) {
  const question = questionBank[questionId];
  const [selectedIndex, setSelectedIndex] = React.useState(answer?.selectedIndex ?? null);
  const [value, setValue] = React.useState(answer?.value ?? "");
  const submitted = answer?.submitted;
  const earned = getQuestionScore(question, answer);

  React.useEffect(() => {
    setSelectedIndex(answer?.selectedIndex ?? null);
    setValue(answer?.value ?? "");
  }, [questionId, answer?.selectedIndex, answer?.value]);

  function handleSubmit(event) {
    event.preventDefault();
    if (question.kind === "choice" && selectedIndex === null) return;
    if (question.kind === "estimate" && value === "") return;
    onSubmit(questionId, {
      submitted: true,
      selectedIndex,
      value
    });
  }

  return (
    <form className={submitted ? "question-card answered" : "question-card"} onSubmit={handleSubmit}>
      <div className="question-topline">
        <span>{question.typeLabel}</span>
        {submitted && <strong>{earned ? "Correct" : "Review"}</strong>}
      </div>
      <h4>{question.prompt}</h4>

      {question.kind === "choice" ? (
        <div className="options-grid">
          {question.options.map((option, index) => {
            const selected = selectedIndex === index;
            const correct = submitted && question.correctIndex === index;
            const wrong = submitted && selected && question.correctIndex !== index;
            return (
              <button
                type="button"
                key={option}
                className={[
                  selected ? "selected" : "",
                  correct ? "correct" : "",
                  wrong ? "wrong" : ""
                ].join(" ").trim()}
                onClick={() => !submitted && setSelectedIndex(index)}
                disabled={submitted}
              >
                <span>{String.fromCharCode(65 + index)}</span>
                {option}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="estimate-row">
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            disabled={submitted}
            inputMode="decimal"
            placeholder={question.placeholder}
            aria-label={question.prompt}
          />
          <span>{question.suffix}</span>
        </div>
      )}

      {!submitted && (
        <button className="submit-button" type="submit">
          Submit checkpoint
        </button>
      )}

      {submitted && (
        <div className="answer-explanation">
          {question.kind === "estimate" && (
            <p>
              <strong>Method:</strong> {question.method}
            </p>
          )}
          <p>{question.explanation}</p>
        </div>
      )}
    </form>
  );
}

function QuestionGroup({ ids, answers, onSubmit }) {
  return (
    <div className="question-group">
      {ids.map((id) => (
        <QuestionCard key={id} questionId={id} answer={answers[id]} onSubmit={onSubmit} />
      ))}
    </div>
  );
}

function IntroSection({ answers, onSubmit }) {
  return (
    <>
      <SectionProse>
        <p>
          The FIFA World Cup is a rare mega-event where the rights owner can record a highly scalable commercial surplus while the host country accepts a messy local balance sheet. The paradox is that the same tournament can be financially excellent for FIFA and still economically ambiguous for the host.
        </p>
        <p>
          This note addresses three questions: how does FIFA convert the World Cup into a four-year revenue cycle, what does the host country actually receive in tourism and legacy terms, and how does the 2026 expansion change the bargain between federation and host? The lens is deliberately two-sided because FIFA, as the global body of member associations, sells a portable media product, while a host government buys a place-specific development and reputation project.
        </p>
      </SectionProse>
      <MetricStrip />
      <QuestionGroup ids={sectionList[0].questionIds} answers={answers} onSubmit={onSubmit} />
    </>
  );
}

function BackgroundSection({ answers, onSubmit }) {
  return (
    <>
      <SectionProse>
        <p>
          FIFA's economics are cyclical. Most of the federation's money is earned across the four years surrounding a men's World Cup, not inside a single matchday accounting window. In the 2019-2022 cycle, FIFA reported USD 7.568 billion of revenue, USD 6.302 billion of investments and expenses, and a cycle net result of USD 1.187 billion. At the end of 2022, reserves stood at USD 3.971 billion, giving the federation a large buffer before the next cycle began (<SourceLink index={0} />).
        </p>
        <p>
          The host-country side is structurally different. The local case usually rests on public-service delivery, airport and transport capacity, hotel supply, urban improvements, international branding, and tourism conversion after the final whistle. Those benefits can be real, but they are not the same kind of contracted cash flow as a broadcasting agreement.
        </p>
      </SectionProse>
      <CycleChart answers={answers} />
      <QuestionGroup ids={sectionList[1].questionIds} answers={answers} onSubmit={onSubmit} />
    </>
  );
}

function FifaLensSection({ answers, onSubmit }) {
  return (
    <>
      <SectionProse>
        <p>
          From FIFA's lens, the World Cup is a global rights platform with limited need to own local infrastructure. Television broadcasting rights produced USD 3.426 billion in 2019-2022, marketing rights USD 1.795 billion, licensing rights USD 769 million, and hospitality plus ticket sales USD 949 million. FIFA also reported that rights related to the Qatar World Cup generated USD 6.314 billion, or 83% of cycle revenue (<SourceLink index={1} />).
        </p>
        <p>
          FIFA is not just extracting revenue; it also uses the cycle to fund competitions, prize money, member association grants, administration, and development programs. The strategic point is that FIFA's cash receipts are more globally diversified and contractable than the host's promised local spillovers. That makes FIFA's risk profile unusually favorable compared with the public balance sheet behind the event.
        </p>
      </SectionProse>
      <RevenueMixChart answers={answers} />
      <CashFlowChart answers={answers} />
      <QuestionGroup ids={sectionList[2].questionIds} answers={answers} onSubmit={onSubmit} />
    </>
  );
}

function HostLensSection({ answers, onSubmit }) {
  return (
    <>
      <SectionProse>
        <p>
          From the host-country lens, the central question is whether temporary global attention converts into durable demand, useful assets, and a manageable public cost. Qatar's tourism data show why the answer is nuanced. International visitors rose from 2.137 million in 2019 to 2.540 million in 2022 and then to 4.054 million in 2023, an all-time high in the tourism authority's report (<SourceLink index={4} />; <SourceLink index={5} />).
        </p>
        <p>
          The hotel ledger tells a second story. Qatar expanded room supply from 27,432 keys in 2019 to 37,539 in 2022 and 39,100 in 2023. Demand also rose, with room nights about 23% higher in 2023 than 2022, but average daily rate fell from QAR 742 in 2022 to QAR 408 in 2023. The host gained a larger tourism platform, yet the tournament-year price premium did not persist.
        </p>
      </SectionProse>
      <VisitorsChart answers={answers} />
      <HotelIndexChart answers={answers} />
      <QuestionGroup ids={sectionList[3].questionIds} answers={answers} onSubmit={onSubmit} />
    </>
  );
}

function FutureLensSection({ answers, onSubmit }) {
  return (
    <>
      <SectionProse>
        <p>
          The 2026 tournament changes the arithmetic. FIFA's 2023-2026 budget planned USD 11.0 billion of revenue, including USD 4.264 billion from television rights, USD 2.693 billion from marketing rights, and USD 3.097 billion from hospitality and ticket sales (<SourceLink index={3} />). The tournament expands to 48 teams and 104 matches across Canada, Mexico, and the United States, raising the ceiling for attendance and hospitality revenue.
        </p>
        <p>
          For hosts, the 2026 setup is not Qatar in reverse. Existing North American stadiums and visitor infrastructure can reduce the need for new permanent assets, but public costs around security, transport, fan zones, traffic management, and city services remain. Current reporting has therefore focused less on whether FIFA can monetize the event and more on whether host cities receive a transparent enough share of the upside to justify local obligations (<SourceLink index={6} />; <SourceLink index={7} />).
        </p>
      </SectionProse>
      <BudgetShiftChart answers={answers} />
      <QuestionGroup ids={sectionList[4].questionIds} answers={answers} onSubmit={onSubmit} />
    </>
  );
}

function evaluateApplyIt(text) {
  const normalized = text.toLowerCase();
  const checks = [
    { label: "FIFA revenue logic", passed: /fifa|rights|broadcast|ticket|hospitality|marketing/.test(normalized) },
    { label: "Host-country costs", passed: /host|city|government|public|infrastructure|security|transport|cost/.test(normalized) },
    { label: "Legacy or opportunity cost", passed: /legacy|tourism|hotel|opportunity|post|after|future|asset/.test(normalized) },
    { label: "Risk-sharing recommendation", passed: /share|cap|risk|guarantee|transparent|contract|deal|bargain/.test(normalized) }
  ];
  const passed = checks.filter((item) => item.passed);
  if (text.trim().length < 80) {
    return {
      level: "Needs more substance",
      message: "Add a fuller policy memo with both the FIFA and host-country sides before moving to the conclusion.",
      checks
    };
  }
  if (passed.length >= 3) {
    return {
      level: "Ready for the conclusion",
      message: "Your memo connects the commercial engine to the local public-economics question. The strongest versions also name one measurable legacy metric.",
      checks
    };
  }
  return {
    level: "Partly there",
    message: "The memo has a useful start. Strengthen it by naming the missing side of the bargain and one concrete risk-control mechanism.",
    checks
  };
}

function SummarySection({ answers, currentSectionId, setCurrentSectionId, applyText, setApplyText, applyFeedback, onApplySubmit }) {
  const scoreBySection = sectionList
    .filter((section) => section.questionIds.length)
    .map((section) => {
      const earned = section.questionIds.reduce((sum, id) => sum + getQuestionScore(questionBank[id], answers[id]), 0);
      return {
        ...section,
        earned,
        possible: section.questionIds.length,
        missed: section.questionIds.filter((id) => getQuestionScore(questionBank[id], answers[id]) === 0)
      };
    });
  const totalEarned = totalQuestionIds.reduce((sum, id) => sum + getQuestionScore(questionBank[id], answers[id]), 0);

  return (
    <>
      <div className="summary-grid">
        <article className="insight-card">
          <span>Insight 1</span>
          <h3>FIFA sells a global option on attention.</h3>
          <p>Broadcasting, marketing, licensing, and hospitality scale across markets, while the federation does not need to own the host country's permanent assets.</p>
        </article>
        <article className="insight-card">
          <span>Insight 2</span>
          <h3>The host buys a legacy thesis.</h3>
          <p>Visitor demand, hotel capacity, city branding, and infrastructure reuse determine whether the public investment is more than a short event expense.</p>
        </article>
        <article className="insight-card">
          <span>Insight 3</span>
          <h3>2026 increases the upside and the bargaining stakes.</h3>
          <p>More teams, more matches, and larger venues lift FIFA's ticketing ambition, which makes host-city risk-sharing more visible.</p>
        </article>
      </div>

      <section className="score-card">
        <div>
          <span className="panel-label">Checkpoint score</span>
          <strong>{totalEarned}/{totalQuestionIds.length}</strong>
        </div>
        <div className="score-breakdown">
          {scoreBySection.map((section) => (
            <button type="button" key={section.id} onClick={() => setCurrentSectionId(section.id)}>
              <span>{section.shortTitle}</span>
              <strong>{section.earned}/{section.possible}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="return-map">
        <h3>Return to Section map</h3>
        {scoreBySection.every((section) => section.missed.length === 0) ? (
          <p>Every checkpoint so far is correct. Use the conclusion to test whether you can turn the evidence into a policy recommendation.</p>
        ) : (
          <div className="return-buttons">
            {scoreBySection
              .filter((section) => section.missed.length > 0)
              .map((section) => (
                <button type="button" key={section.id} onClick={() => setCurrentSectionId(section.id)}>
                  Review {section.shortTitle}: {section.missed.length} checkpoint{section.missed.length > 1 ? "s" : ""}
                </button>
              ))}
          </div>
        )}
      </section>

      <section className="apply-card">
        <div>
          <span className="panel-label">Apply It</span>
          <h3>Write a four-sentence memo to a host-city mayor.</h3>
          <p>Use both ledgers: FIFA's commercial upside and the host country's public-cost, tourism, and legacy risks.</p>
        </div>
        <textarea
          value={applyText}
          onChange={(event) => setApplyText(event.target.value)}
          placeholder="Draft the memo here..."
        />
        <button type="button" className="submit-button" onClick={onApplySubmit}>
          Evaluate memo
        </button>
        {applyFeedback && (
          <div className="apply-feedback">
            <strong>{applyFeedback.level}</strong>
            <p>{applyFeedback.message}</p>
            <div>
              {applyFeedback.checks.map((check) => (
                <span key={check.label} className={check.passed ? "passed" : ""}>
                  {check.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}

function ConclusionSection({ answers, onSubmit }) {
  return (
    <>
      <SectionProse>
        <p>
          The most important economic lesson is that the World Cup has two ledgers, not one. FIFA's ledger is a centralized four-year rights business that can fund tournaments, reserves, and member-association programs. The host ledger is a public-economics bargain whose value depends on durable tourism conversion, usable assets, fiscal discipline, and the credibility of legacy claims.
        </p>
        <p>
          That does not mean hosts should never bid. It means bids should be judged less by gross impact headlines and more by the allocation of downside risk and incremental upside. A stronger model would publish local service obligations, cap avoidable public exposure, reuse existing venues where possible, and negotiate clearer sharing of incremental ticketing, hospitality, and sponsorship value when host cities take on material costs.
        </p>
      </SectionProse>
      <QuestionGroup ids={sectionList[6].questionIds} answers={answers} onSubmit={onSubmit} />
      <section className="sources-card">
        <h3>Sources</h3>
        <ol>
          {sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noreferrer">{source.label}</a>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

function allQuestionsSubmitted(section, answers) {
  return section.questionIds.every((id) => answers[id]?.submitted);
}

function App() {
  const [currentSectionId, setCurrentSectionId] = React.useState("intro");
  const [unlockedIds, setUnlockedIds] = React.useState(["intro"]);
  const [answers, setAnswers] = React.useState({});
  const [applyText, setApplyText] = React.useState("");
  const [applyFeedback, setApplyFeedback] = React.useState(null);

  const currentIndex = sectionList.findIndex((section) => section.id === currentSectionId);
  const currentSection = sectionList[currentIndex];
  const nextSection = sectionList[currentIndex + 1];
  const isLast = currentIndex === sectionList.length - 1;
  const sectionDone =
    currentSection.id === "summary"
      ? Boolean(applyFeedback)
      : allQuestionsSubmitted(currentSection, answers);

  function submitAnswer(questionId, answer) {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: answer
    }));
  }

  function unlockAndGo(sectionId) {
    if (!sectionId) return;
    setUnlockedIds((previous) => previous.includes(sectionId) ? previous : [...previous, sectionId]);
    setCurrentSectionId(sectionId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleNext() {
    if (!nextSection) return;
    unlockAndGo(nextSection.id);
  }

  function handleApplySubmit() {
    // Static file fallback; replace with a secure server-side evaluator if API access is wired later.
    const feedback = evaluateApplyIt(applyText);
    setApplyFeedback(feedback);
  }

  const renderSection = () => {
    const props = { answers, onSubmit: submitAnswer };
    if (currentSectionId === "intro") return <IntroSection {...props} />;
    if (currentSectionId === "background") return <BackgroundSection {...props} />;
    if (currentSectionId === "fifa-lens") return <FifaLensSection {...props} />;
    if (currentSectionId === "host-lens") return <HostLensSection {...props} />;
    if (currentSectionId === "future-lens") return <FutureLensSection {...props} />;
    if (currentSectionId === "summary") {
      return (
        <SummarySection
          answers={answers}
          currentSectionId={currentSectionId}
          setCurrentSectionId={setCurrentSectionId}
          applyText={applyText}
          setApplyText={setApplyText}
          applyFeedback={applyFeedback}
          onApplySubmit={handleApplySubmit}
        />
      );
    }
    return <ConclusionSection {...props} />;
  };

  return (
    <main>
      <header className="hero">
        <div className="hero-content">
          <span className="eyebrow">Interactive research article</span>
          <h1>The Economics of the FIFA World Cup</h1>
          <p>
            A two-ledger analysis from the lens of FIFA's federation model and the host country.
          </p>
        </div>
      </header>

      <div className="app-shell">
        <div className="left-column">
          <NavRail currentId={currentSectionId} unlockedIds={unlockedIds} onSelect={setCurrentSectionId} />
          <ProgressPanel answers={answers} />
        </div>

        <article className="article-panel">
          <div className="section-heading">
            <span>{currentSection.eyebrow}</span>
            <h2>{currentSection.title}</h2>
          </div>
          {renderSection()}

          {!isLast && (
            <div className="section-controls">
              <button
                type="button"
                className="next-button"
                disabled={!sectionDone}
                onClick={handleNext}
              >
                Continue to {nextSection.shortTitle}
              </button>
              {!sectionDone && (
                <p>
                  Complete this section's checkpoint{currentSection.questionIds.length === 1 ? "" : "s"} to continue.
                </p>
              )}
            </div>
          )}
        </article>
      </div>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
