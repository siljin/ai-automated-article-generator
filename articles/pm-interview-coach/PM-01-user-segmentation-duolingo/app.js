const { useState, useMemo } = React;
const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } = Recharts;

/* ---------------------------------------------------------------------- */
/* Shared helpers                                                          */
/* ---------------------------------------------------------------------- */

function fmtUSD(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

/* ---- Cowork bridge: semantic grading with graceful fallback ---- */

async function askJudge(instructions, contextParts) {
  if (!(window.cowork && typeof window.cowork.askClaude === 'function')) return null;
  try {
    const res = await window.cowork.askClaude(instructions, contextParts);
    if (typeof res === 'string') return res;
    if (res && typeof res.text === 'string') return res.text;
    return null;
  } catch (e) {
    return null;
  }
}

/* ---- Clarifying-question hybrid matcher (semantic first, keyword fallback) ---- */

const STOPWORDS = new Set(['a','an','the','is','are','was','were','do','does','did','how','what',
  'why','who','which','can','could','would','will','of','to','for','in','on','at','and','or',
  'this','that','it','its','we','you','your','im','i','me','my','have','has','had','be','been',
  'being','with','about','so','if','as','doesnt','right','now']);

function stem(w) {
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith('es')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}

function normalize(s) { return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim(); }

function tokenize(s) {
  return normalize(s).split(' ').filter(w => w && !STOPWORDS.has(w)).map(stem);
}

function scoreMatch(input, tags) {
  const inputWords = new Set(tokenize(input));
  let best = 0;
  tags.forEach(tag => {
    const tagWords = tokenize(tag);
    if (tagWords.length === 0) return;
    const hits = tagWords.filter(w => inputWords.has(w)).length;
    const ratio = hits / tagWords.length;
    best = Math.max(best, ratio);
  });
  return best;
}

function keywordMatch(text, questions) {
  let bestIdx = -1, bestScore = 0;
  questions.forEach((item, idx) => {
    const s = scoreMatch(text, item.tags);
    if (s > bestScore) { bestScore = s; bestIdx = idx; }
  });
  return bestScore >= 0.4 ? bestIdx : -1;
}

async function semanticMatchClarify(text, questions) {
  const list = questions.map((item, idx) => (idx + 1) + '. ' + item.q).join('\n');
  const prompt = 'You are grading a PM-interview candidate\'s clarifying question against a fixed list of ' +
    'canonical questions the interviewer is prepared to answer. Reply with ONLY the number of the canonical ' +
    'question that asks for essentially the same underlying information as the candidate\'s question, even if ' +
    'worded very differently. If none of them ask for the same thing, reply with exactly 0. No other text.';
  const raw = await askJudge(prompt, ['Candidate question: ' + text, 'Canonical questions:\n' + list]);
  if (raw === null) return null;
  const match = raw.match(/-?\d+/);
  if (!match) return null;
  const n = parseInt(match[0], 10);
  if (n >= 1 && n <= questions.length) return n - 1;
  return -1;
}

/* ---------------------------------------------------------------------- */
/* Data: Practice case (PulseTrail — fictional, original)                  */
/* ---------------------------------------------------------------------- */

const CLARIFYING_QUESTIONS = [
  {
    tags: ["what's the objective", "what are we optimizing for", "primary goal", "which matters more wau or revenue",
      "what should we prioritize growth or revenue", "business objective"],
    q: "What's the business objective here, and if we have to trade off WAU growth against Premium revenue growth, which one wins?",
    a: "Both matter, but if forced to choose: WAU growth is the board's headline KPI this cycle. Premium revenue growth is a guardrail — it isn't allowed to shrink — but it is not the north star for this decision."
  },
  {
    tags: ["how is current user base split", "current segment distribution", "how many users in each segment",
      "user mix today", "breakdown of users by segment", "segment sizes today"],
    q: "How is the current 8M WAU distributed across the habit-streak, event-goal, and family segments today?",
    a: "Roughly 60% habit-streak, 25% event-goal, 15% family. You'll see the exact split — and the rest of the segment numbers — in the data exhibit."
  },
  {
    tags: ["free to premium conversion by segment", "conversion rate per segment", "how does conversion differ across segments",
      "paid conversion rate", "does conversion vary by segment"],
    q: "What's the free-to-Premium conversion rate for each segment, and how does it differ?",
    a: "It differs a lot — event-goal converts more than double the blended average. Exact numbers are in the data exhibit."
  },
  {
    tags: ["why now", "why is board pushing this now", "competitive threat", "is there a new competitor",
      "why the urgency", "is something forcing this decision", "market trigger"],
    q: "Why is the board pushing to 2x WAU right now — is there a competitive or market trigger?",
    a: "Yes. A newly-funded competitor, MoveStreak, just launched a free family-mode clone and is spending heavily on performance marketing aimed at parents. The board wants us to defend or double down before the family-fitness-app category gets crowded."
  },
  {
    tags: ["what resources do we have", "eng capacity", "budget constraints", "how many teams",
      "timeline constraints", "how much can we build", "team size"],
    q: "What eng/product resources and timeline do we have to work with?",
    a: "One major initiative this half — roughly two quarters of a ~12-person product/eng team — plus a small always-on maintenance stream for the other two segments."
  },
  {
    tags: ["how do we define success", "what does winning look like", "definition of success",
      "how will we know if this worked", "success criteria"],
    q: "How do we define success in 18 months?",
    a: "16M WAU and Premium revenue growing at least 25%/year sustained, without Premium churn rising."
  },
];

const SEGMENT_ROWS = [
  { segment: 'Habit-streak casual', share: '60%', wau: 4.80, conv: '6%', arpu: '$12.99', retention: '71%', pressure: 'Generalist fitness apps (low)' },
  { segment: 'Event-goal (race/wedding prep)', share: '25%', wau: 2.00, conv: '14%', arpu: '$12.99', retention: '58%', pressure: 'Dedicated training apps (medium)' },
  { segment: 'Family / parents + kids', share: '15%', wau: 1.20, conv: '4%', arpu: '$12.99', retention: '82%', pressure: 'MoveStreak — new, well-funded (high)' },
];

const QUANT_CHIPS = [
  { id: 'q1', label: 'Premium ARPU', body: 'Premium ARPU is $12.99/mo across all three segments today — there is no segment-specific pricing.' },
  { id: 'q2', label: 'Segment WAU + conversion', body: 'Habit: 4.80M WAU, 6% conversion. Event-goal: 2.00M WAU, 14% conversion. Family: 1.20M WAU, 4% conversion. (Same as the data exhibit above.)' },
  { id: 'q3', label: '"Win family" scenario', body: 'If PulseTrail wins the family segment: family WAU could plausibly grow from 1.2M to 3.5M over 18 months via dedicated family-mode marketing — but conversion may compress to 3% initially, since new users are colder than the existing base.' },
  { id: 'q4', label: '"Double down on event-goal" scenario', body: "If PulseTrail doubles down on event-goal: no major new-user unlock is expected (it's a smaller, more saturated niche), but a dedicated 'goal programs' feature could lift conversion from 14% to 19%, on a WAU base growing modestly with overall app growth to about 2.3M." },
];

const FRAMEWORK_REFERENCE = [
  { title: 'Segment definition & sizing', body: "Name each behavioral segment and size it as a share of today's WAU — habit-streak, event-goal, family. This is the foundation everything else compares against." },
  { title: 'Need & urgency per segment', body: 'Why does each group actually open the app, and how time-pressured is that need? A deadline (a race date, a test date) behaves very differently from an open-ended habit.' },
  { title: 'Monetization potential per segment', body: "Conversion rate, ARPU, and today's revenue contribution per segment, plus headroom — is this segment already close to its ceiling or barely tapped?" },
  { title: 'Strategic fit & competitive dynamics', body: "Right-to-win and brand fit per segment, and how exposed each segment is to a competitive threat right now — the segment with the most urgent external pressure isn't always the biggest one." },
  { title: 'Recommended segment + guardrails', body: "The pick, the reason it beats the alternatives against the stated objective, and what NOT to break in the other two segments while pursuing it." },
];

/* ---------------------------------------------------------------------- */
/* Reusable UI atoms                                                       */
/* ---------------------------------------------------------------------- */

function Badge({ kind, children }) {
  return <span className={'tag tag-' + kind}>{children}</span>;
}

function DataTable({ columns, rows }) {
  return (
    <table className="data-table">
      <thead>
        <tr>{columns.map((c, i) => <th key={i}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>{r.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}

function BarChartCard({ data, dataKey, xKey, color, yLabel, note }) {
  return (
    <div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2ddd2" />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} label={{ value: yLabel, angle: -90, position: 'insideLeft', fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
              {data.map((entry, idx) => <Cell key={idx} fill={color[idx % color.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {note && <p className="chart-note">{note}</p>}
    </div>
  );
}

/* Generic gated freeform stage: reveal-after-input, optional Cowork grading with static fallback */
function GatedStage({ minLength = 20, placeholder, referenceNode, rubric, judgeInstructions, followUp, children }) {
  const [value, setValue] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [warn, setWarn] = useState('');
  const [judging, setJudging] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function handleReveal() {
    if (value.trim().length < minLength) {
      setWarn(`Write at least ${minLength} characters first — that's the whole point of the drill.`);
      return;
    }
    setWarn('');
    setRevealed(true);
    if (judgeInstructions) {
      setJudging(true);
      const result = await askJudge(judgeInstructions, [value]);
      setJudging(false);
      if (result) setFeedback({ mode: 'ai', text: result });
      else setFeedback({ mode: 'checklist' });
    }
  }

  return (
    <div>
      {children}
      <textarea
        className="stage-input"
        placeholder={placeholder}
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      <div className="stage-controls">
        <button className="btn" disabled={revealed} onClick={handleReveal}>
          {revealed ? 'Revealed' : 'Reveal reference answer'}
        </button>
        {!revealed && <span className="hint-text">Min {minLength} characters to unlock the reveal.</span>}
      </div>
      {warn && <p className="warn-text">{warn}</p>}
      {revealed && (
        <div className="reveal-block">
          {judgeInstructions && (
            <div className="feedback-box">
              {judging && <p className="muted">Checking your answer…</p>}
              {!judging && feedback && feedback.mode === 'ai' && (
                <>
                  <p className="feedback-label">AI feedback</p>
                  <p>{feedback.text}</p>
                </>
              )}
              {!judging && feedback && feedback.mode === 'checklist' && rubric && (
                <>
                  <p className="feedback-label">Self-check — semantic grading unavailable outside Cowork, use this checklist</p>
                  <ul>{rubric.map((r, i) => <li key={i}>{r}</li>)}</ul>
                </>
              )}
            </div>
          )}
          <div className="reference-box">
            <p className="reference-label">Reference answer</p>
            {referenceNode}
          </div>
          {followUp && <p className="followup"><strong>Interviewer follow-up:</strong> {followUp}</p>}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Learn module                                                            */
/* ---------------------------------------------------------------------- */

function LearnModule() {
  const taskflowData = [
    { name: 'Freelancers', mrr: 1.08 },
    { name: 'Team leads', mrr: 3.78 },
    { name: 'Enterprise', mrr: 8.25 },
  ];

  return (
    <div className="module-content">
      <section className="card">
        <h2>1. Simple explanation</h2>
        <p>A hospital ER doesn't treat every patient in the waiting room the same way. Triage sorts patients by what's actually wrong and how urgent it is, then routes each group to the right kind of care. A PM does the same thing with users: lump them together and you build a generic treatment that half-helps everyone and fully helps no one.</p>
        <p><strong>User segmentation</strong> is grouping users into buckets that share a meaningfully different need, behavior, or value to the business — so a PM can decide who gets the next unit of product investment, and what "good" looks like for that group specifically.</p>
        <p><strong>Why it matters:</strong> engineering and design time is scarce. Building for "the average user" often means building for nobody, because the average masks divergent needs. Segmentation forces an explicit choice about who you're optimizing for, which sharpens every downstream decision — features, messaging, pricing, metrics.</p>
        <p><strong>Problem it solves:</strong> which of many different kinds of users deserves the next unit of investment, and what does success look like for them specifically.</p>
        <p><strong>When to use it:</strong> the user base is heterogeneous enough that a single average obscures real differences — new-market entry, feature prioritization amid diverse usage, diagnosing a metric change ("whose behavior actually moved?"), monetization strategy, GTM.</p>
        <p><strong>When NOT to use it:</strong> pre-product-market-fit with too few users (segmenting on N=50 is guessing, not analysis); a genuinely homogeneous niche product where everyone shares the same job-to-be-done; or as a reflex on every small decision — recutting your users every sprint fragments the roadmap when the differences don't actually matter to the immediate objective.</p>
      </section>

      <section className="card">
        <h2>2. Interview relevance</h2>
        <p>Interviewers use this concept to see whether you avoid the "build for everyone" trap, bring structure to an ambiguous population, and show user empathy and business judgment at the same time — the combination that separates real product sense from generic empathy.</p>
        <p><strong>Strong candidates</strong> name a behavioral or need-based axis (not just demographics), tie that axis explicitly to the stated objective, size segments even roughly, evaluate on more than size, and explicitly reject alternatives with a stated reason.</p>
        <p><strong>Average candidates</strong> jump straight to "power users vs. casual users" or age/gender demographics without justifying why that split matters here, pick the biggest segment automatically, never quantify anything, and conflate "who has the loudest need" with "who we should build for."</p>
        <p><strong>What interviewers listen for:</strong> a roughly MECE structure, explicit selection criteria stated before the pick (not reverse-engineered to justify a gut call), a sharp one-sentence unmet-need statement for the chosen segment, and honest trade-offs — what you're giving up by not choosing the others.</p>
        <p><strong>Example prompts:</strong></p>
        <ul>
          <li>"How would you segment [Product]'s users, and which segment would you build for next quarter?"</li>
          <li>"[Product]'s growth has stalled in a new international market — how would you think about which user segment to prioritize there?"</li>
          <li>"Revenue per user is falling even as total users grow — walk me through the segments that could explain that."</li>
        </ul>
      </section>

      <section className="card">
        <h2>3. Mental model / framework</h2>
        <ol className="framework-list">
          <li>
            <h3>Clarify the objective</h3>
            <p><strong>Ask:</strong> "What outcome are we segmenting to serve — growth, monetization, retention, a new market?" <strong>Info needed:</strong> the business objective, timeframe, constraints. <strong>Decision:</strong> this becomes the anchor every later step is judged against — segments that look right for retention can look wrong for monetization. <strong>Common mistake:</strong> naming a segment before knowing the goal. <strong>Strong answer:</strong> states the objective out loud before naming a single segment.</p>
          </li>
          <li>
            <h3>Choose the segmentation dimension</h3>
            <p><strong>Ask:</strong> "What's the axis that actually predicts different needs or behavior here?" <strong>Info needed:</strong> available behavioral data, usage patterns, jobs-to-be-done. <strong>Decision:</strong> pick one or two behavioral/motivational dimensions, not generic demographics, unless the demographic is a genuine proxy for behavior. <strong>Common mistake:</strong> segmenting by age or gender with no behavioral rationale. <strong>Strong answer:</strong> explains why this specific axis matters to the stated objective.</p>
          </li>
          <li>
            <h3>Construct the segments</h3>
            <p><strong>Ask:</strong> "What are the resulting groups, and can I state each one's need in a single sentence?" <strong>Info needed:</strong> rough size estimates and the defining behavior of each bucket. <strong>Decision:</strong> 3-5 roughly mutually-exclusive segments. <strong>Common mistake:</strong> too many overlapping micro-segments, or buckets that aren't actually distinct. <strong>Strong answer:</strong> crisp, named segments each with a one-line need statement.</p>
          </li>
          <li>
            <h3>Evaluate segment attractiveness</h3>
            <p><strong>Ask:</strong> "Which segment is most valuable AND most winnable for us specifically?" <strong>Info needed:</strong> segment size/growth, willingness to pay, competitive intensity, our unique advantage. <strong>Decision:</strong> score segments on size × need intensity × monetizability × strategic fit × competitive gap — not size alone. <strong>Common mistake:</strong> auto-picking the biggest segment, or the one with the loudest anecdote. <strong>Strong answer:</strong> an explicit trade-off table with a stated reason each runner-up was rejected.</p>
          </li>
          <li>
            <h3>Define the target segment's unmet need</h3>
            <p><strong>Ask:</strong> "What specific job is this segment hiring us for today, and where does the current experience fail them?" <strong>Info needed:</strong> qualitative research/quotes, funnel drop-off specific to that segment. <strong>Decision:</strong> a precise need statement — context, desired outcome, obstacle. <strong>Common mistake:</strong> a vague need ("they want a better experience"). <strong>Strong answer:</strong> a sharp need statement that directly implies a solution direction.</p>
          </li>
          <li>
            <h3>Recommend a direction + success metric</h3>
            <p><strong>Ask:</strong> "What will we build or change, and how will we know it worked for this segment specifically?" <strong>Info needed:</strong> feasibility constraints. <strong>Decision:</strong> a concrete recommendation plus a segment-specific success metric. <strong>Common mistake:</strong> recommending "improve onboarding" with nothing segment-specific. <strong>Strong answer:</strong> names the actual change and a metric that's specific to that segment, not a company-wide vanity number.</p>
          </li>
        </ol>
      </section>

      <section className="card">
        <h2>4. Visual explanation</h2>
        <p className="muted">Hierarchy: how one population becomes three segments.</p>
        <div className="hierarchy">
          <div className="hier-box hier-root">All users</div>
          <div className="hier-arrow">↓ segmented by behavioral/motivational axis</div>
          <div className="hier-row">
            <div className="hier-box">Segment A</div>
            <div className="hier-box">Segment B</div>
            <div className="hier-box">Segment C</div>
          </div>
        </div>
        <p className="muted" style={{ marginTop: '1.2rem' }}>2×2: segment value vs. strategic fit — where to actually invest.</p>
        <div className="matrix-2x2">
          <div className="matrix-cell matrix-q2"><strong>Selective bets</strong><br />High value, low fit — worth a smaller, explicit second bet</div>
          <div className="matrix-cell matrix-q1"><strong>Prioritize now</strong><br />High value, high fit — the strongest default pick</div>
          <div className="matrix-cell matrix-q4"><strong>Ignore for now</strong><br />Low value, low fit</div>
          <div className="matrix-cell matrix-q3"><strong>Table stakes</strong><br />Low value, high fit — maintain, don't lead with it</div>
        </div>
        <div className="matrix-axis-x">Strategic fit / right-to-win →</div>
        <div className="matrix-axis-y">↑ Segment value (size × WTP × need intensity)</div>
      </section>

      <section className="card">
        <h2>5. Numerical example</h2>
        <p>TaskFlow, a generic productivity app, has 10M MAU split into three segments:</p>
        <DataTable
          columns={['Segment', 'MAU', 'Share', 'Free→paid conversion', 'ARPU/mo']}
          rows={[
            ['Solo freelancers', '4.5M', '45%', '3%', '$8'],
            ['Small-team leads', '3.0M', '30%', '9%', '$14'],
            ['Enterprise power users', '2.5M', '25%', '15%', '$22'],
          ]}
        />
        <p style={{ marginTop: '0.8rem' }}><strong>Monthly recurring revenue per segment</strong> = MAU × conversion × ARPU:</p>
        <ul>
          <li>Freelancers: 4.5M × 3% = 135,000 payers × $8 = $1,080,000/mo</li>
          <li>Team leads: 3.0M × 9% = 270,000 payers × $14 = $3,780,000/mo</li>
          <li>Enterprise: 2.5M × 15% = 375,000 payers × $22 = $8,250,000/mo</li>
        </ul>
        <p>Total MRR ≈ <strong>$13.11M/mo</strong>. Enterprise is the <em>smallest</em> segment by MAU (25%) but contributes <strong>63%</strong> of MRR ($8.25M of $13.11M) — because conversion and ARPU compound. This is the numerical proof behind the framework's warning: biggest segment by user count ≠ most valuable segment.</p>
        <BarChartCard
          data={taskflowData}
          dataKey="mrr"
          xKey="name"
          color={['#378add', '#5dcaa5', '#f0997b']}
          yLabel="MRR ($M/mo)"
          note="Illustrative values for teaching — not a real company's reported figures."
        />
        <p style={{ marginTop: '0.8rem' }}>If Team-Lead conversion improved from 9% → 12% by closing a specific unmet need: incremental payers = 3.0M × 3% = 90,000; incremental MRR = 90,000 × $14 = <strong>$1,260,000/mo</strong> (~$15.1M/yr) — the same math the Practice module's quant stage will ask you to run.</p>
      </section>

      <section className="card">
        <h2>6. Common failure modes</h2>
        <ul className="failure-list">
          <li><strong>Segmenting by demographics, not behavior.</strong> Fix: pick a behavioral/motivational axis that actually predicts different needs.</li>
          <li><strong>Picking the biggest segment automatically.</strong> Fix: weigh value and winnability, not size alone — see the TaskFlow example above.</li>
          <li><strong>Segments that overlap or aren't actually distinct.</strong> Fix: MECE check — does each segment genuinely need a different solution?</li>
          <li><strong>No quantification, just vibes.</strong> Fix: use even rough size/WTP estimates rather than an unquantified gut call.</li>
          <li><strong>Ignoring strategic fit.</strong> An attractive segment isn't automatically the right one if you have no right to win it. Fix: score right-to-win explicitly, not just segment attractiveness in the abstract.</li>
          <li><strong>Vague need statements leading to generic recommendations.</strong> Fix: sharpen the need to context + desired outcome + obstacle.</li>
          <li><strong>Failing to state assumptions where data is missing.</strong> Fix: say explicitly what you're assuming and how you'd validate it.</li>
          <li><strong>Optimizing the chosen segment while damaging another.</strong> Fix: define an explicit guardrail metric for the segments you're not prioritizing.</li>
        </ul>
      </section>

      <section className="card">
        <h2>7. Cheat sheet</h2>
        <p><strong>Definition:</strong> group users by a behavioral/need difference that changes what you'd build or how you'd price, then pick who gets the next investment.</p>
        <p><strong>Framework:</strong> objective → dimension → segments → attractiveness → unmet need → direction + metric.</p>
        <p><strong>Three questions to remember:</strong> What's the objective? What's the real need difference (not just a demographic label)? Which segment is valuable AND winnable?</p>
        <p><strong>Three traps:</strong> biggest-segment bias, demographic-only slicing, vague need statements.</p>
        <p><strong>Example sentence:</strong> "I'd segment by [behavioral dimension] because it predicts different needs, then prioritize [segment] because it's large enough to matter, has an unmet need only we can solve, and is willing to pay — while explicitly deprioritizing [segment] because [reason]."</p>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Observe module — Duolingo (real company, cited)                         */
/* ---------------------------------------------------------------------- */

function ObserveModule() {
  const duoData = [
    { name: 'DAU', value: 56.5 },
    { name: 'MAU', value: 137.8 },
    { name: 'Paid subs', value: 12.5 },
  ];

  return (
    <div className="module-content">
      <div className="tag-legend">
        <Badge kind="fact">FACT</Badge> a cited, verified number &nbsp;·&nbsp;
        <Badge kind="estimate">ESTIMATE</Badge> arithmetic derived from FACTs &nbsp;·&nbsp;
        <Badge kind="assumption">ASSUMPTION</Badge> hypothetical, for teaching only — not disclosed by the company
      </div>

      <section className="card">
        <h2>1. Company and product context</h2>
        <p>Duolingo is a freemium language-learning app expanding into adjacent skill categories. Primary users range from casual hobbyists to serious learners; business model is free-to-play with a <em>Super Duolingo</em> subscription (removes ads, unlimited hearts) and <em>Duolingo Max</em> (adds GPT-powered features: Video Call, Explain My Answer, Roleplay), plus <em>Duolingo English Test</em> (DET) as a separate per-test credentialing product.</p>
        <p><Badge kind="fact">FACT</Badge> Q1 FY2026 (quarter ended March 31, 2026, reported May 4, 2026): DAU 56.5M (+21% YoY), MAU 137.8M, paid subscribers 12.5M (+21% YoY), revenue $292.0M (+27% YoY), bookings $308.5M (+14% YoY), net income $43.5M. <em>(Source: Duolingo Q1 FY2026 shareholder letter / Form 8-K, SEC EDGAR; corroborated by StockTitan earnings coverage.)</em></p>
        <BarChartCard
          data={duoData}
          dataKey="value"
          xKey="name"
          color={['#378add', '#5dcaa5', '#f0997b']}
          yLabel="Millions"
          note="FACT — Duolingo Q1 FY2026 shareholder letter / SEC Form 8-K (quarter ended Mar 31, 2026)."
        />
        <p><Badge kind="fact">FACT</Badge> Duolingo's stated medium-term goal is 100 million DAU by 2028 — roughly 2.5x today's 56.5M. <em>(Source: Class Central, "Duolingo's 2026 Strategy: The Road to 100 Million DAUs," citing the shareholder letter.)</em></p>
        <p><Badge kind="fact">FACT</Badge> 2026 strategy prioritizes: (a) core language teaching and the free-user experience — including moving GPT-based conversational features from the Max-only tier down into Super, since API costs fell; (b) new adjacent growth engines — Math, Music, Chess — with Math explicitly positioned to compete with Kumon and target <em>parents</em> rather than schools; (c) Duolingo English Test as a smaller but strategically important credentialing revenue line; (d) Duolingo ABC (early literacy) as a strategic adjacency, not a primary revenue driver today. <em>(Source: Class Central 2026 strategy report; Umbrex "Duolingo Strategy and Business Model.")</em> <Badge kind="fact">FACT</Badge> Super Duolingo's subscriber base is reported to be roughly 10x the size of the Duolingo Max subscriber base. <em>(Source: Class Central.)</em></p>
        <p><Badge kind="fact">FACT</Badge> Competitive landscape: Babbel and Busuu are the closest mainstream alternatives (Feb 2026 site-traffic estimates: Babbel ~3.17M monthly visits, Busuu ~3.16M, Rosetta Stone ~1.42M, Pimsleur ~0.62M — a third-party traffic estimator, directional only). Babbel differentiates on structured, course-like learning; Busuu on CEFR-based structure plus native-speaker community feedback. In the math-tutoring category Duolingo Math is entering, Kumon's most-cited direct competitor is Mathnasium. <em>(Source: PolyChat blog; Latterly.org Kumon-competitor roundup.)</em></p>
        <p><Badge kind="assumption">ASSUMPTION</Badge> Exactly how many of the 137.8M MAU are casual habit learners vs. goal-driven test-takers vs. parents is <strong>not disclosed</strong> by Duolingo. The segment breakdown used in the walkthrough below is a hypothetical built on top of the verified facts above, for teaching purposes only.</p>
      </section>

      <section className="card">
        <h2>2. The product problem</h2>
        <p><strong>PM role:</strong> Growth/Product Strategy PM at Duolingo, H2 2026.</p>
        <p><strong>Business objective (FACT):</strong> reach 100M DAU by 2028 while continuing to grow subscription revenue.</p>
        <p><strong>User problem:</strong> three different groups use "Duolingo" for different jobs — (1) casual habit learners doing a language for fun with no deadline, (2) outcome-driven learners with an external deadline (DET for university/immigration, or a work requirement), (3) parents of young children wanting foundational skills for their kids — a use case Duolingo is newly entering via Math/ABC.</p>
        <p><strong>Business problem:</strong> leadership can meaningfully fund one more big bet in H2 2026 — which of these three groups gets the next major product investment?</p>
        <p><strong>Why now:</strong> the 100M-by-2028 goal needs ~2.5x growth from 56.5M today in under 2.5 years. Three different levers exist (deepen the core, harden the credential business, or open a new demographic), and picking wrong burns a year of runway against an aggressive public target.</p>
        <p><strong>Constraints:</strong> engineering capacity for one major initiative this half; the brand is built on the free, gamified core experience — any move must not cannibalize it; Max's GPT-feature costs need to prove ROI before broad expansion.</p>
        <p><Badge kind="assumption">ASSUMPTION</Badge> Important unknowns flagged for teaching: exact user counts per segment, exact WTP/conversion by segment, how much of DAU growth to date came from casual vs. goal-driven users, and how price-sensitive the "parents" segment is relative to Kumon's in-person price point.</p>
      </section>

      <section className="card">
        <h2>3. PM application walkthrough</h2>
        <p><strong>Step 1 — Clarify objective:</strong> Dual objective — hit 100M DAU by 2028 (reach) while sustaining revenue growth (monetization) — so the segmentation must be judged on both, not just one.</p>
        <p><strong>Step 2 — Choose dimension:</strong> Behavioral/motivational axis — "why does this person open Duolingo" (habit/identity vs. external deadline vs. on-behalf-of-a-child) — predicts wildly different needs, and it's the axis Duolingo's own 2026 roadmap is already implicitly organized around (Math targeting parents, DET as credential, AI features for free users).</p>
        <p><strong>Step 3 — Construct segments</strong> <Badge kind="assumption">ASSUMPTION</Badge> sizes labeled since Duolingo doesn't disclose the split:</p>
        <ul>
          <li><strong>Habit-driven core learners</strong> — majority of the 137.8M MAU; motivation is self-improvement/fun/streaks; price-sensitive.</li>
          <li><strong>Outcome-driven credential seekers</strong> — smaller population served by DET; motivation is passing a specific test by a deadline; higher WTP (a test fee is already a signal).</li>
          <li><strong>Parents of young learners</strong> — new-to-Duolingo population addressed via Math/ABC; WTP benchmark set by incumbents like Kumon; largely untapped historically.</li>
        </ul>
        <p><strong>Step 4 — Evaluate attractiveness:</strong> Size: habit-core &gt; parents (potential) &gt; credential (today) — but parents has the highest growth-rate potential since it's net-new to Duolingo. Need intensity: credential (deadline) &gt; parents (measurable outcomes for a child) &gt; habit-core (optional, lower urgency). WTP: credential ≈ parents (Kumon-anchored) &gt; habit-core (mostly free). Strategic fit: habit-core is Duolingo's historical strength (gamification, content velocity, brand); parents leverages the same playbook but in an unproven vertical against an entrenched incumbent; credential is smaller-scale but Duolingo already has data/credibility there.</p>
        <p><strong>Step 5 — Define the unmet need:</strong> For habit-core learners, the shareholder letter itself names "speaking practice... now a core part of the product" as a 2026 priority — implying the prior gap was that casual learners could grind vocabulary and grammar but had no low-stakes way to practice actually speaking, a capability previously locked behind the smaller, pricier Max tier.</p>
        <p><strong>Step 6 — Recommend direction + metric:</strong> Deepen habit-core's loop by extending AI-powered speaking practice (previously Max-exclusive) into the free/Super tier — which, per the verified facts, is the real move Duolingo made in 2026 as GPT API costs fell — rather than leading with the new parents segment as the primary H2 bet. Success metric: DAU and D30 retention lift among free/Super users who engage with the speaking feature. Guardrail: Max-tier retention/conversion, so giving speaking practice to Super doesn't gut the reason to pay for Max.</p>
        <p><strong>Trade-offs/risks:</strong> betting on habit-core risks diminishing returns (most engaged users already extracted); betting on parents too early risks burning credibility in a new vertical before nailing distribution; betting on credential alone caps the DAU story since it's inherently a smaller population.</p>
      </section>

      <section className="card">
        <h2>4. Decision and recommendation</h2>
        <p><strong>Recommended action:</strong> prioritize habit-driven core learners for the H2 2026 flagship investment — extend AI speaking practice from Max-only into free/Super — while continuing a smaller, second-priority bet on parents (Math) as the multi-year DAU-expansion play, and holding the credential (DET) line at current investment.</p>
        <p><strong>Target user:</strong> free and Super-tier learners who've plateaued past beginner content. <strong>Product change:</strong> broaden access to AI-powered conversational speaking practice. <strong>Expected user impact:</strong> closes the "I can read/write but can't speak" gap. <strong>Expected business impact:</strong> higher DAU/retention on the largest segment, progress toward the 100M-by-2028 goal, plus a stronger Free→Super upgrade funnel.</p>
        <p><strong>Success metrics:</strong> DAU, D30/D90 retention among users who try the speaking feature, Free→Super conversion. <strong>Guardrail metrics:</strong> Super→Max conversion/retention, gross margin per session (inference cost per active user). <strong>Main risks:</strong> cannibalizing Max's differentiator; inference cost scaling faster than monetization. <strong>Test before scaling:</strong> an A/B rollout to a slice of Super users, watching D30 retention and Max-downgrade rate before a full launch.</p>
      </section>

      <section className="card">
        <h2>5. Transferable lesson</h2>
        <p><strong>Do not copy "Duolingo's answer."</strong> The reusable move is the general pattern: when a company has a fixed pool of investment and multiple real segments compete for it, don't rank by size alone — score each on size/growth potential <em>and</em> need intensity/WTP <em>and</em> your actual right-to-win, and be willing to make the "boring," already-strong segment the top bet if it has the best odds of hitting the stated goal, while still funding the higher-risk/higher-TAM segment as an explicit, smaller second bet rather than an all-or-nothing choice.</p>
      </section>

      <section className="card">
        <h2>Sources</h2>
        <ul className="source-list">
          <li><a href="https://www.sec.gov/Archives/edgar/data/1562088/000162828026029790/q1fy26duolingo3-31x26share.htm" target="_blank" rel="noreferrer">Duolingo Q1 FY2026 Shareholder Letter / Form 8-K — SEC EDGAR</a></li>
          <li><a href="https://www.stocktitan.net/news/DUOL/duolingo-reports-first-quarter-2026-35zvphh83o6n.html" target="_blank" rel="noreferrer">StockTitan — Duolingo Reports First Quarter 2026 Results</a></li>
          <li><a href="https://www.classcentral.com/report/duolingo-2026-strategy/" target="_blank" rel="noreferrer">Class Central — Duolingo's 2026 Strategy: The Road to 100 Million DAUs</a></li>
          <li><a href="https://umbrex.com/resources/company-profiles/duolingo/" target="_blank" rel="noreferrer">Umbrex — Duolingo Strategy and Business Model</a></li>
          <li><a href="https://www.polychatapp.com/blog/duolingo-competitors-for-adults" target="_blank" rel="noreferrer">PolyChat — Duolingo Competitors for Adults</a></li>
          <li><a href="https://www.latterly.org/kumon-competitors/" target="_blank" rel="noreferrer">Latterly.org — Top Kumon Competitors & Alternatives</a></li>
        </ul>
      </section>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Practice module — PulseTrail (fictional, original)                      */
/* ---------------------------------------------------------------------- */

function ClarifyStage() {
  const [input, setInput] = useState('');
  const [log, setLog] = useState([]);
  const [asked, setAsked] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [gapsShown, setGapsShown] = useState(false);

  async function handleAsk() {
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    setInput('');
    let idx = await semanticMatchClarify(text, CLARIFYING_QUESTIONS);
    if (idx === null) idx = keywordMatch(text, CLARIFYING_QUESTIONS);
    const hit = idx >= 0;
    if (hit) setAsked(prev => new Set(prev).add(idx));
    setLog(prev => [{ text, hit, answer: hit ? CLARIFYING_QUESTIONS[idx].a : 'No information available for that — let\'s keep it focused on the business problem.' }, ...prev]);
    setBusy(false);
  }

  const missed = CLARIFYING_QUESTIONS.filter((_, i) => !asked.has(i));

  return (
    <section className="card">
      <h2>Stage 1 — Clarifying questions</h2>
      <p className="muted">Type a question you'd ask the interviewer before solving this. If it lines up with something a strong candidate would ask, the answer reveals. Off-target questions get "no information available," same as a real interview.</p>
      <div className="clarify-input-row">
        <input
          type="text"
          className="text-input"
          placeholder="e.g. How is the current user base split across segments?"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAsk(); }}
        />
        <button className="btn" onClick={handleAsk} disabled={busy}>Ask</button>
      </div>
      <p className="qcount">{log.length} question{log.length === 1 ? '' : 's'} asked{log.length >= 4 ? ' — most real interviews expect only 2-3; consider moving to structuring' : ''}</p>
      <div className="qa-transcript">
        {log.map((row, i) => (
          <div key={i} className={'qa-row ' + (row.hit ? 'qa-hit' : 'qa-miss')}>
            <strong>You asked:</strong> {row.text}<br />
            <strong>Interviewer:</strong> {row.answer}
          </div>
        ))}
      </div>
      <button className="btn secondary" onClick={() => setGapsShown(true)}>I'm done asking — show what I might have missed</button>
      {gapsShown && (
        <div className="reveal-block">
          {missed.length === 0
            ? <p><strong>Nice — you covered every question a strong candidate would typically ask here.</strong></p>
            : (
              <>
                <p><strong>Questions you didn't ask that would have been worth it:</strong></p>
                <ul>{missed.map((m, i) => <li key={i}>{m.q}<br /><span className="muted">{m.a}</span></li>)}</ul>
              </>
            )}
        </div>
      )}
    </section>
  );
}

function ExhibitStage() {
  const chartData = SEGMENT_ROWS.map(r => ({ name: r.segment.split(' ')[0], wau: r.wau }));
  return (
    <section className="card">
      <h2>Stage 3 — Data exhibit</h2>
      <p className="muted">Every value below is exact — nothing here needs to be read off a bar height.</p>
      <DataTable
        columns={['Segment', 'Share of WAU', 'WAU (M)', 'Free→Premium conv.', 'Premium ARPU/mo', '90-day Premium retention', 'Competitive pressure']}
        rows={SEGMENT_ROWS.map(r => [r.segment, r.share, r.wau.toFixed(2), r.conv, r.arpu, r.retention, r.pressure])}
      />
      <BarChartCard
        data={chartData}
        dataKey="wau"
        xKey="name"
        color={['#378add', '#5dcaa5', '#f0997b']}
        yLabel="WAU (M)"
      />
      <GatedStage
        minLength={30}
        placeholder="What are the 2-3 most important insights here, and what would change your decision?"
        judgeInstructions="You are a PM interview coach grading a candidate's read of a segment data exhibit for a user-segmentation case. Give a short (3-4 sentence) verdict: what insight did they correctly pull from the data, what did they miss, and is their read observation-level or does it reach a real implication? Be direct and specific."
        rubric={[
          'Did I name at least one non-obvious insight (not just restating a row of the table)?',
          'Did I notice that event-goal converts far above the blended average despite being a mid-size segment?',
          'Did I notice family has the best retention once converted but the lowest conversion and the sharpest competitive threat?',
          'Did I say what additional data I would want (e.g. CAC by segment, growth ceiling per segment) before deciding?',
        ]}
        followUp="If you could add one more column to this table, what would it be and why?"
        referenceNode={(
          <>
            <p>Event-goal converts more than 2x the blended average (14% vs. ~7.7% blended) despite being a mid-size segment — the clearest signal of high intent. Family has the best 90-day retention (82%) once converted, but the lowest conversion (4%) and faces the sharpest new competitive pressure (MoveStreak). Habit-streak is the largest population but the weakest monetizer, so growing its WAU doesn't proportionally grow revenue.</p>
            <p>Additional data worth requesting before deciding: customer acquisition cost (CAC) by segment, marketing-channel efficiency, and — critically — the realistic <em>growth ceiling</em> per segment over 18 months, not just today's share, since the board's KPI is WAU growth, not today's mix.</p>
          </>
        )}
      >
        <p><strong>Q:</strong> What are the 2-3 most important insights in this table, why do they matter, and what more would you want to know?</p>
      </GatedStage>
    </section>
  );
}

function QuantStage() {
  const [openChips, setOpenChips] = useState(new Set());
  function toggle(id) { setOpenChips(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; }); }

  return (
    <section className="card">
      <h2>Stage 4 — Quantitative exercise</h2>
      <p><strong>Q:</strong> Calculate current total Premium MRR, then compare the projected incremental MRR at 18 months under a "win family" plan vs. a "double down on event-goal" plan. Show your work.</p>
      <div className="chip-row">
        {QUANT_CHIPS.map(c => <span key={c.id} className="data-chip" onClick={() => toggle(c.id)}>{c.label} {openChips.has(c.id) ? '▲' : '▼'}</span>)}
      </div>
      {QUANT_CHIPS.map(c => openChips.has(c.id) && (
        <div key={c.id} className="chip-reveal">{c.body}</div>
      ))}
      <GatedStage
        minLength={25}
        placeholder="Show your formula, substitution, and calculation..."
        followUp="Which of the two plans would you actually recommend, and why isn't it just the one with the bigger MRR number?"
        referenceNode={(
          <>
            <p><strong>Formula:</strong> MRR = WAU × conversion × ARPU, summed across segments.</p>
            <p><strong>Current MRR:</strong> Habit 4.80M × 6% × $12.99 = $3,741,120/mo. Event 2.00M × 14% × $12.99 = $3,637,200/mo. Family 1.20M × 4% × $12.99 = $623,520/mo. <strong>Total ≈ $8,001,840/mo</strong> (~$96M/yr run-rate).</p>
            <p><strong>"Win family" plan:</strong> Family 3.5M × 3% × $12.99 = $1,363,950/mo → incremental vs. today's $623,520 = <strong>+$740,430/mo</strong> (~+$8.9M/yr). New total WAU: 4.80 + 2.00 + 3.50 = <strong>10.30M</strong> (short of the 16M goal alone).</p>
            <p><strong>"Double down on event-goal" plan:</strong> Event 2.3M × 19% × $12.99 = $5,676,630/mo → incremental vs. today's $3,637,200 = <strong>+$2,039,430/mo</strong> (~+$24.5M/yr). New total WAU: 4.80 + 2.30 + 1.20 = <strong>8.30M</strong> — barely moves WAU.</p>
            <p><strong>Sanity check:</strong> current blended conversion = (288,000+280,000+48,000)/8.0M ≈ 7.7%, and 8.0M × 7.7% × $12.99 ≈ $8.0M/mo — consistent with the segment sum above.</p>
            <p><strong>Interpretation:</strong> event-goal produces roughly 3x more incremental MRR, but almost no WAU growth — the board's headline KPI. Family produces a smaller revenue gain but adds 2.3M WAU (~29% of the 8M→16M gap) and is the only plan that answers the named competitive threat.</p>
            <p><strong>Limitation:</strong> this assumes conversion/retention rates hold steady as segments scale, and ignores the CAC/marketing spend actually required to acquire the 2.3M net-new family WAU — a real recommendation needs that cost data before committing.</p>
          </>
        )}
      />
    </section>
  );
}

function DecisionStage() {
  const [choice, setChoice] = useState('');
  const [reason, setReason] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [warn, setWarn] = useState('');

  function handleReveal() {
    if (!choice) { setWarn('Pick a segment first.'); return; }
    if (reason.trim().length < 30) { setWarn('Write at least a few sentences of justification first.'); return; }
    setWarn('');
    setRevealed(true);
  }

  const options = ['Habit-streak casual', 'Event-goal', 'Family / parents + kids'];

  return (
    <section className="card">
      <h2>Stage 5 — Decision</h2>
      <p><strong>Q:</strong> Which ONE segment would you prioritize for PulseTrail's one major H2 bet?</p>
      <div className="radio-row">
        {options.map(opt => (
          <label key={opt} className={'radio-pill' + (choice === opt ? ' radio-pill-selected' : '')}>
            <input type="radio" name="decision" value={opt} checked={choice === opt} onChange={() => setChoice(opt)} />
            {opt}
          </label>
        ))}
      </div>
      <textarea
        className="stage-input"
        placeholder="Justify your decision: supporting evidence, rejected alternatives, assumptions, risks, and what would flip your call..."
        value={reason}
        onChange={e => setReason(e.target.value)}
      />
      <div className="stage-controls">
        <button className="btn" disabled={revealed} onClick={handleReveal}>{revealed ? 'Revealed' : 'Reveal reference decision'}</button>
      </div>
      {warn && <p className="warn-text">{warn}</p>}
      {revealed && (
        <div className="reveal-block">
          <div className="reference-box">
            <p className="reference-label">Reference decision</p>
            <p><strong>Prioritize Family.</strong> It's the only lever that plausibly moves WAU enough to matter against the 16M goal, and it directly addresses the named competitive threat (MoveStreak) — even though Event-goal is the better near-term revenue play. This explicitly accepts a smaller revenue bump now for a larger strategic and WAU payoff, conditional on family-mode CAC being viable.</p>
            <p><strong>Rejected:</strong> Event-goal — best ROI per user, but a shrinking/saturated niche that can't deliver 2x WAU. Habit-streak — biggest today, but there's no evidence a new feature changes its trajectory; it's already the default experience, not a distinct new bet.</p>
            <p><strong>Risks:</strong> family-mode CAC could be much higher than assumed; MoveStreak may already have a head start; the 3% conversion compression could persist rather than recover.</p>
            <p><strong>What would flip this call:</strong> if a CAC test showed family acquisition cost &gt;3x event-goal's, or 90-day retention for new family cohorts fell well below the historical 82%, the recommendation would flip toward defending event-goal/habit-streak instead.</p>
            <p className="muted">This is the strongest answer given the board's stated priority (WAU is the north star). A candidate who explicitly prioritized revenue over WAU and picked Event-goal, while stating that trade-off out loud, would also be defensible — the case is designed so more than one answer can be argued well.</p>
          </div>
          <p className="followup"><strong>Interviewer follow-up:</strong> What's the cheapest experiment you'd run in the next 4 weeks to de-risk this before committing the full 2 quarters?</p>
        </div>
      )}
    </section>
  );
}

function ScoringStage() {
  const dims = [
    { key: 'clarify', label: 'Problem clarification', lo: 'Asked 0-1 generic questions', hi: 'Asked sharp, case-specific questions covering objective, segments, and constraints' },
    { key: 'structure', label: 'Structured thinking', lo: 'Jumped straight to an answer', hi: 'Built concept-specific buckets before touching data' },
    { key: 'concept', label: 'Application of user segmentation', lo: 'Segmented by demographics or vibes', hi: 'Segmented by behavior/need and scored attractiveness explicitly' },
    { key: 'user', label: 'User-centric reasoning', lo: 'Never named a specific unmet need', hi: 'Named a precise need (context + outcome + obstacle) per segment' },
    { key: 'business', label: 'Business judgment', lo: 'Picked the biggest segment by default', hi: 'Weighed value, fit, and competitive dynamics together' },
    { key: 'analytical', label: 'Analytical reasoning', lo: 'Skipped or fumbled the MRR math', hi: 'Showed full working, sanity-checked the total, stated a limitation' },
    { key: 'tradeoff', label: 'Prioritization & trade-offs', lo: 'No rejected alternatives named', hi: 'Named rejected alternatives and what would flip the decision' },
    { key: 'metrics', label: 'Metrics & validation', lo: 'One vague metric, no guardrails', hi: 'Primary + supporting + guardrail metrics, a real rollout design' },
    { key: 'comms', label: 'Communication', lo: 'Rambling, no clear structure', hi: 'Recommendation → reasons → impact → risk → mitigation → next step, in ~60-90 seconds' },
  ];
  const [scores, setScores] = useState({});
  const [computed, setComputed] = useState(false);

  const avg = useMemo(() => {
    const vals = Object.values(scores).filter(v => v);
    if (vals.length === 0) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [scores]);

  function readiness(a) {
    if (a === 0) return '—';
    if (a < 2.5) return 'Needs foundational practice';
    if (a < 3.5) return 'Developing — practice more full cases';
    if (a < 4.3) return 'Interview-ready with polish needed';
    return 'Strong — ready for a live onsite loop at this difficulty';
  }

  const strongest = useMemo(() => {
    const entries = Object.entries(scores).filter(([, v]) => v);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => (b[1] > a[1] ? b : a));
  }, [scores]);
  const weakest = useMemo(() => {
    const entries = Object.entries(scores).filter(([, v]) => v);
    if (entries.length === 0) return null;
    return entries.reduce((a, b) => (b[1] < a[1] ? b : a));
  }, [scores]);

  return (
    <section className="card">
      <h2>Stage 8 — Self-scoring rubric</h2>
      <p className="muted">Compare your written answers above against each anchor, then self-score 1-5. This is a self-check, not an automated grade.</p>
      {dims.map(d => (
        <div key={d.key} className="rubric-row">
          <div className="rubric-label">{d.label}</div>
          <div className="rubric-anchors"><span className="muted">1-2: {d.lo}</span> · <span className="muted">4-5: {d.hi}</span></div>
          <input
            type="number" min="1" max="5" className="rubric-input"
            value={scores[d.key] || ''}
            onChange={e => setScores(prev => ({ ...prev, [d.key]: Number(e.target.value) }))}
          />
        </div>
      ))}
      <button className="btn" onClick={() => setComputed(true)}>Compute my score</button>
      {computed && (
        <div className="reveal-block">
          <p><strong>Overall average:</strong> {avg.toFixed(2)} / 5 — <strong>{readiness(avg)}</strong></p>
          {strongest && <p><strong>Strongest muscle:</strong> {dims.find(d => d.key === strongest[0]).label} ({strongest[1]}/5)</p>}
          {weakest && <p><strong>Weakest muscle:</strong> {dims.find(d => d.key === weakest[0]).label} ({weakest[1]}/5)</p>}
          <p><strong>Targeted follow-up drill:</strong> redo the Decision and Quant stages out loud, in under 90 seconds each, without re-reading your notes.</p>
          <p><strong>Recommended next concept:</strong> RICE prioritization (Prioritization category) or North Star metric selection (Product Execution category) — rotate away from Product Sense next.</p>
        </div>
      )}
    </section>
  );
}

function FrameworkStage() {
  return (
    <section className="card">
      <h2>Stage 2 — Build your framework</h2>
      <GatedStage
        minLength={20}
        placeholder="What buckets would you use to structure this segmentation decision, before seeing any data?"
        judgeInstructions="You are a PM interview coach grading a candidate's framework for a user-segmentation decision (PulseTrail fitness app case). Give a short (3-4 sentence) verdict: is the structure concept-specific (segment definition, need/urgency, monetization, strategic fit) rather than a generic 'users/business/competitors' template? Is anything important missing?"
        rubric={[
          'Did I define segments and roughly size them before analyzing anything else?',
          'Did I ask about need/urgency per segment, not just size?',
          'Did I include monetization potential (conversion, ARPU) as its own bucket?',
          'Did I include strategic fit / competitive dynamics as its own bucket?',
          'Did my buckets avoid overlapping with each other?',
        ]}
        followUp="Which of your buckets would you cut first if you only had 10 minutes instead of 30?"
        referenceNode={(
          <ol>
            {FRAMEWORK_REFERENCE.map((f, i) => <li key={i}><strong>{f.title}</strong> — {f.body}</li>)}
          </ol>
        )}
      >
        <p><strong>Q:</strong> Before you see any data, write the buckets you'd use to structure this segmentation decision.</p>
      </GatedStage>
    </section>
  );
}

function MetricsStage() {
  return (
    <section className="card">
      <h2>Stage 6 — Metrics and validation</h2>
      <GatedStage
        minLength={30}
        placeholder="Primary metric, supporting metrics, guardrails, measurement window, experiment design, decision threshold, gaming risk..."
        judgeInstructions="You are a PM interview coach grading a candidate's metrics/validation plan for a product decision (PulseTrail, prioritizing the family fitness segment). Give a short (3-4 sentence) verdict on completeness: primary metric, supporting metrics, guardrails, measurement window/experiment design, decision threshold, and gaming risk. Name what's missing, don't just praise."
        rubric={[
          'Did I name ONE primary metric tied to the actual objective (family WAU), not a vague composite?',
          'Did I include supporting metrics (conversion, retention) as well as the primary?',
          'Did I include guardrail metrics for the segments NOT being prioritized?',
          'Did I propose a measurement window and a way to compare against a baseline (e.g. a test-market holdout)?',
          'Did I name a decision threshold — a number that would make me pause or reverse course?',
          'Did I flag a way the metric could be gamed or produce an unintended consequence?',
        ]}
        followUp="If month-6 numbers come in exactly at your decision threshold — not clearly above or below — what do you do?"
        referenceNode={(
          <>
            <p><strong>Primary:</strong> Family-segment WAU (path to 3.5M by month 18). <strong>Supporting:</strong> family free→Premium conversion, family 90-day retention, blended company-wide Premium MRR.</p>
            <p><strong>Guardrails:</strong> habit-streak and event-goal WAU/retention must not decline (no cannibalization), overall Premium churn rate, CAC payback period for family-mode marketing spend.</p>
            <p><strong>Measurement window:</strong> quarterly checkpoints over 18 months, with a hard go/no-go gate at month 6 on early CAC + activation signal before scaling spend further. <strong>Baseline:</strong> pre-launch family-segment trend vs. a holdout region/channel not exposed to the new marketing push.</p>
            <p><strong>Decision threshold:</strong> if month-6 CAC payback exceeds 12 months, or 90-day retention falls below ~65%, pause scaling and reassess.</p>
            <p><strong>Gaming risk:</strong> teams could inflate "family WAU" by counting a parent's own habit-streak sessions as family sessions — define family WAU strictly as sessions using family-mode with a linked child profile.</p>
          </>
        )}
      >
        <p><strong>Q:</strong> How would you measure whether prioritizing the family segment actually worked?</p>
      </GatedStage>
    </section>
  );
}

function RecommendationStage() {
  return (
    <section className="card">
      <h2>Stage 7 — Final recommendation</h2>
      <GatedStage
        minLength={40}
        placeholder="Give a 60-90 second executive recommendation: recommendation, 2-3 reasons, expected impact, main risk, mitigation, immediate next step."
        followUp="If the board pushes back and says revenue matters more than WAU this year, does your recommendation change?"
        referenceNode={(
          <p>"Recommendation: prioritize the Family segment for our one major H2 bet. Two reasons: first, it's the only segment with a plausible path to meaningfully closing the 8M-to-16M WAU gap — event-goal is a near-term revenue win but a shrinking niche, and habit-streak is already maxed out as our default experience. Second, MoveStreak's free family-mode launch is a live competitive threat to a category we can still win if we move now. Expected impact: family WAU growing from 1.2M to roughly 3.5M over 18 months, contributing about $740K/month in incremental Premium revenue, alongside a stronger competitive position. Main risk is customer acquisition cost — new family users may be more expensive to acquire and convert than our historical base suggests. Mitigation: launch in 2-3 test markets first with a hard month-6 CAC and retention gate before committing further marketing spend. Immediate next step: scope the family-mode product improvements and a 2-market test-marketing plan for board sign-off this month."</p>
        )}
      >
        <p><strong>Q:</strong> Deliver your recommendation as if speaking to PulseTrail's board.</p>
      </GatedStage>
    </section>
  );
}

function PracticeModule() {
  return (
    <div className="module-content">
      <section className="card case-prompt">
        <h2>Case prompt</h2>
        <p><strong>Company:</strong> PulseTrail (fictional) — a mobile fitness app combining short daily "streak" workout challenges, a free workout-video library, and a Premium subscription ($12.99/mo) unlocking AI-adaptive coaching plans.</p>
        <p><strong>Your role:</strong> Growth PM for PulseTrail.</p>
        <p><strong>Business objective:</strong> the board wants to double Weekly Active Users (WAU) from 8M to 16M within 18 months, while growing Premium subscription revenue at least 25%/year.</p>
        <p><strong>User context:</strong> users fall into a mix of casual daily-streak exercisers, people training for a specific goal event (a 10K race, a wedding), and parents who use the app's "family workout" mode with their kids.</p>
        <p><strong>Time horizon:</strong> 18 months. <strong>Constraints:</strong> product/eng can fund only one major new initiative this half; the brand is built on being "the fun, low-pressure fitness habit app," not an intense bootcamp app; Premium's AI-coaching cost per active user rises with personalization depth.</p>
        <p><strong>Case givens:</strong></p>
        <ul>
          <li>Current WAU: 8.0M; current Premium subscribers: 640,000 (8% of WAU); Premium ARPU: $12.99/mo.</li>
          <li>Free tier: streak tracking, workout video library, basic progress stats.</li>
          <li>Premium tier: AI-adaptive coaching plans, advanced analytics, offline downloads.</li>
        </ul>
      </section>

      <ClarifyStage />
      <FrameworkStage />
      <ExhibitStage />
      <QuantStage />
      <DecisionStage />
      <MetricsStage />
      <RecommendationStage />
      <ScoringStage />
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* App shell                                                                */
/* ---------------------------------------------------------------------- */

function App() {
  const [module, setModule] = useState('learn');

  return (
    <div className="app-shell">
      <header className="top-header">
        <h1>PM Interview Coach</h1>
        <div className="meta-badges">
          <span className="badge">User Segmentation</span>
          <span className="badge">Product Sense</span>
          <span className="badge">Intermediate</span>
        </div>
      </header>
      <nav className="module-nav">
        <button className={module === 'learn' ? 'nav-btn nav-btn-active' : 'nav-btn'} onClick={() => setModule('learn')}>1 · Learn</button>
        <button className={module === 'observe' ? 'nav-btn nav-btn-active' : 'nav-btn'} onClick={() => setModule('observe')}>2 · Observe (Duolingo)</button>
        <button className={module === 'practice' ? 'nav-btn nav-btn-active' : 'nav-btn'} onClick={() => setModule('practice')}>3 · Practice (PulseTrail)</button>
      </nav>
      {module === 'learn' && <LearnModule />}
      {module === 'observe' && <ObserveModule />}
      {module === 'practice' && <PracticeModule />}
      <footer className="footer">
        Generated by the pm-interview-coach skill. Observe module sources cited above; Practice module (PulseTrail) is an original, fictional case.
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
