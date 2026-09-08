const {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} = Recharts;

// ---- CASE:meta (fill per session) ----
const CASE = {
  title: "CASE_TITLE_PLACEHOLDER",
  phase: "PHASE_PLACEHOLDER",
  caseTopic: "CASE_TOPIC_PLACEHOLDER",
  situation: "SITUATION_TEXT_PLACEHOLDER",
  givens: [
    "GIVEN_1_PLACEHOLDER",
    "GIVEN_2_PLACEHOLDER"
  ]
};

// ---- CASE:stages (fill: use the 10-entry Capstone variant when applicable) ----
const STAGES = [
  "Situation", "Clarify", "Diagnose", "Decision", "Curveball", "Recommendation", "Debrief"
];

// Edited via targeted string-replace at each stage transition during the live session.
const CURRENT_STAGE_INDEX = 0;

// ---- CASE:exhibits (fill per session; omit chartKind for table-only exhibits) ----
const EXHIBITS = [];

// ---- CASE:scorecard (null until Debrief; populated when the case ends) ----
const SCORECARD = null;

function StageTracker() {
  return (
    <div className="stage-tracker">
      {STAGES.map((name, i) => {
        const state = i < CURRENT_STAGE_INDEX ? "done" : i === CURRENT_STAGE_INDEX ? "active" : "pending";
        return (
          <div key={name + i} className={"stage-pill stage-" + state}>
            <span className="stage-index">{i + 1}</span>
            <span className="stage-name">{name}</span>
          </div>
        );
      })}
    </div>
  );
}

function CaseBrief() {
  return (
    <section className="card">
      <h2>Situation</h2>
      <p>{CASE.situation}</p>
      {CASE.givens.length > 0 && (
        <div>
          <h3>Case Givens</h3>
          <ul>
            {CASE.givens.map((g, i) => <li key={i}>{g}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
}

function ExhibitTable({ exhibit }) {
  return (
    <table className="exhibit-table">
      <thead>
        <tr>{exhibit.columns.map(c => <th key={c}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {exhibit.data.map((row, i) => (
          <tr key={i}>
            {exhibit.columns.map(c => <td key={c}>{String(row[c])}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ExhibitChart({ exhibit }) {
  const xKey = exhibit.columns[0];
  const yKeys = exhibit.columns.slice(1);
  const ChartComp = exhibit.chartKind === "line" ? LineChart : BarChart;
  const SeriesComp = exhibit.chartKind === "line" ? Line : Bar;
  return (
    <div style={{ height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ChartComp data={exhibit.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {yKeys.map(k => <SeriesComp key={k} dataKey={k} />)}
        </ChartComp>
      </ResponsiveContainer>
    </div>
  );
}

function Exhibits() {
  if (EXHIBITS.length === 0) return null;
  return (
    <section className="card">
      <h2>Exhibits</h2>
      {EXHIBITS.map(ex => (
        <div key={ex.id} className="exhibit">
          <h3>{ex.title}</h3>
          {ex.type === "chart" && <ExhibitChart exhibit={ex} />}
          <ExhibitTable exhibit={ex} />
        </div>
      ))}
    </section>
  );
}

function Scorecard() {
  if (!SCORECARD) return null;
  const dims = Object.entries(SCORECARD.dimensions);
  return (
    <section className="card scorecard">
      <h2>Debrief — Scorecard</h2>
      <table className="exhibit-table">
        <thead><tr><th>Dimension</th><th>Score (1-4)</th><th>Note</th></tr></thead>
        <tbody>
          {dims.map(([name, d]) => (
            <tr key={name}><td>{name}</td><td>{d.score}</td><td>{d.note}</td></tr>
          ))}
        </tbody>
      </table>
      <p><strong>Average:</strong> {SCORECARD.avg.toFixed(2)}</p>
      <p><strong>Graduation status:</strong> {SCORECARD.graduationStatus}</p>
      <p><strong>Weakest dimension:</strong> {SCORECARD.weakestDimension}</p>
      <p><strong>Next recommended focus:</strong> {SCORECARD.nextRecommendedFocus}</p>
    </section>
  );
}

function App() {
  return (
    <div className="app">
      <header>
        <h1>{CASE.title}</h1>
        <p className="meta">{CASE.phase} &middot; {CASE.caseTopic}</p>
        <StageTracker />
      </header>
      <CaseBrief />
      <Exhibits />
      <Scorecard />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
