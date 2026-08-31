/* ============================================================================
   Retail Media's Margin Paradox — the ad business inside the store
   Domain: Business & Strategy (ER-11).
   Data tiers: FACT (cited, verified against primary/secondary source that
   reports the company's own disclosed or analyst-modeled figure), ESTIMATE
   (derived by this article's own stated arithmetic/assumptions from FACTs,
   disclosed and coarsely rounded), ILLUSTRATION (none used in this article).
   App code + CSS inlined into index.html. This file is a readable source copy.
   ========================================================================== */
const {useState,useEffect,useRef} = React;
const R = window.Recharts;
const {ResponsiveContainer,ComposedChart,BarChart,Bar,Cell,LineChart,Line,ScatterChart,Scatter,
  XAxis,YAxis,CartesianGrid,Tooltip,ReferenceLine,ReferenceArea,LabelList,Legend} = R;

/* ---------- DATA ------------------------------------------------------------ */
// Chart 1 — Amazon: advertising revenue vs. total company net sales, indexed to
// 100 at 2021 (the first full year Amazon separately disclosed advertising as
// its own revenue line). FACT: Amazon.com, Inc. Q4 2025 earnings release and
// prior-year 10-Ks (net sales by year); advertising revenue by year as
// disclosed by Amazon and reported consistently across AdExchanger, Adweek,
// and Marketing Dive coverage of each quarterly/annual earnings release.
// Underlying dollars ($B): ad revenue 31.2 / 37.7 / 46.9 / 56.2 / 68.6;
// net sales 469.8 / 514.0 / 574.8 / 638.0 / 716.9.
const c1 = [
  {yr:"2021", ad:100.0, sales:100.0},
  {yr:"2022", ad:121.0, sales:109.4},
  {yr:"2023", ad:150.3, sales:122.3},
  {yr:"2024", ad:180.1, sales:135.8},
  {yr:"2025", ad:219.9, sales:152.6},
];

// Chart 2 — most recently reported year-over-year ad-revenue growth rate,
// four retail media networks. FACT, but reference periods differ slightly:
// Amazon and Walmart figures are FY2024→FY2025 (calendar-year-equivalent);
// Target and Kroger figures are FY2023→FY2024 (their most recent disclosed
// annual comparison at time of writing). Sources: Amazon.com Q4 2025 earnings
// release / AdExchanger (2026), $56.2B→$68.6B, +22%; AdExchanger (2026),
// Walmart $4.4B→$6.4B, +37% (global); Digiday/Marketing Brew (2025), Target
// Roundel $522M→$649M, +25%; Kroger Co. Q4/FY2024 earnings release (2025),
// Media +17% (ex. 53rd week).
const c2 = [
  {co:"Kroger Media", g:17},
  {co:"Amazon Ads", g:22},
  {co:"Target Roundel", g:25},
  {co:"Walmart Connect", g:37},
];

// Chart 3 — single stacked bar: US retail media ad revenue by company, 2024
// ($B). FACT (Amazon $41.95B, Walmart $3.72B, Target $1.76B): eMarketer,
// "Amazon's retail media ad revenues will pass $60 billion in 2025..." (2025)
// and related eMarketer company-level estimates, as reported. "All others" is
// an ESTIMATE plug: it reconciles the three named FACT figures to eMarketer's
// separately reported ~75%-77% Amazon share of the total US market (implying
// a total of roughly $55B), and is not itself a directly reported figure for
// any specific set of companies.
const c3 = [
  {name:"Amazon", value:41.95, tier:"FACT"},
  {name:"Walmart", value:3.72, tier:"FACT"},
  {name:"Target", value:1.76, tier:"FACT"},
  {name:"All others (~196 networks, plug)", value:7.80, tier:"ESTIMATE"},
];
const c3total = c3.reduce((s,d)=>s+d.value,0);
const c3colors = {"Amazon":"#1f6feb","Walmart":"#0b8457","Target":"#d97706","All others (~196 networks, plug)":"#999"};
// Recharts stacking reads named fields off a single shared data row rather than a
// function-based dataKey, so build one row object keyed by each segment's name.
const c3row = [Object.assign({period:"2024"}, ...c3.map(seg=>({[seg.name]:seg.value})))];

// Chart 4 — waterfall: modeled bridge from Amazon's estimated US ad-driven
// profit to its reported North America segment operating income, FY2024
// ($B). FACT inputs: eMarketer's $41.95B 2024 US ad-revenue estimate for
// Amazon; Amazon's reported FY2024 North America segment operating income of
// $25.0B (Amazon.com 10-K / Q4 2024 earnings release). ESTIMATE (the bridge
// itself): applies a 45% ad-segment operating-margin assumption — the
// midpoint of the ~40%-50% range analysts cite (Forbes, citing digital
// commerce analyst Russ Dieringer, Jan. 2025; some insider estimates run as
// high as 80%) — to the $41.95B FACT to get "estimated ad-driven profit"
// (≈$18.9B); "implied core-retail & other profit" is the residual/plug
// needed to reconcile that estimate to the $25.0B reported total. This
// bridge is a modeled illustration of one plausible margin assumption, not a
// figure Amazon has confirmed.
const c4 = [
  {name:"Est. ad-driven profit (45% margin × $41.95B)", base:0, delta:18.9, kind:"ad"},
  {name:"Implied core-retail & other profit (residual)", base:18.9, delta:6.1, kind:"core"},
  {name:"Reported NA segment operating income (2024)", base:0, delta:25.0, kind:"total"},
];
const waterfallColor = d => d.kind==="total" ? "#111" : d.kind==="ad" ? "#1f6feb" : "#999";

/* ---------- small helpers -------------------------------------------------- */
function Tier({t}){const m={FACT:"fact",ESTIMATE:"est",ILLUSTRATION:"ill"};return <span className={"tier "+m[t]}>{t}</span>;}

/* ---------- Interpretation prompt (gated reveal) --------------------------- */
function Interp({id,label,question,authored,onSubmit}){
  const [txt,setTxt]=useState(""); const [done,setDone]=useState(false);
  return (
    <div className="prompt">
      <div className="lbl">{label}</div>
      <div className="q">{question}</div>
      {!done && <>
        <textarea value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Write at least one sentence (15+ characters) before the authored answer appears."/>
        <button className="btn sm" disabled={txt.trim().length<15} onClick={()=>{setDone(true);onSubmit&&onSubmit(id,txt);}}>Reveal authored answer</button>
      </>}
      {done && <>
        <div className="yours"><b>Your answer:</b> {txt}</div>
        <div className="authored"><div className="h">Compare to the authored answer</div>{authored}</div>
      </>}
    </div>
  );
}

/* ---------- Multiple choice (no confidence capture) ------------------------ */
function MC({q,onScore}){
  const [sel,setSel]=useState(null);
  const [sub,setSub]=useState(false);
  const submit=()=>{ if(sel==null) return; setSub(true); onScore(q.id, sel===q.correct, "mc", {correct:sel===q.correct}); };
  return (
    <div className={"q-card"+(q.kind==="case"?" case":"")}>
      <div className="q-type">{q.typeLabel}{q.kind==="case"?" · Case Prompt":""}</div>
      <div className="q-stem">{q.stem}</div>
      {q.client && <p style={{marginTop:0,fontSize:14,color:"#555"}}><b>Client:</b> {q.client}</p>}
      {q.options.map((o,i)=>{
        let cls="opt"; if(sub){ if(i===q.correct) cls+=" correct"; else if(i===sel) cls+=" wrong"; }
        else if(i===sel) cls+=" sel";
        return <div key={i} className={cls} onClick={()=>!sub&&setSel(i)}>
          <span className="k">{"ABCD"[i]}</span><span>{o}</span></div>;
      })}
      {!sub && <button className="btn" disabled={sel==null} onClick={submit}>Submit</button>}
      {sub && <div className="expl">
        <span className={"cal "+(sel===q.correct?"ok":"no")}>{sel===q.correct?"Correct — ":"Incorrect — "}</span>
        {sel===q.correct? q.why : q.wrongWhy[sel]}
        <div className="gen">Where this generalizes: {q.generalizes}</div>
      </div>}
    </div>
  );
}

/* ---------- Numeric estimation (fading scaffold: skeleton first, then require
   the reader to name the decomposition path before the number entry unlocks) - */
function Numeric({q,onScore}){
  const [val,setVal]=useState(q.min);
  const [sub,setSub]=useState(false);
  const [decomp,setDecomp]=useState("");
  const decompOk = !q.requireDecomp || decomp.trim().length>=15;
  const within = ()=>{ if(q.log){ const r=val/q.actual; return r>=0.5 && r<=2; }
    return Math.abs(val-q.actual) <= q.tol; };
  const submit=()=>{ setSub(true); onScore(q.id, within(), "num", {val, actual:q.actual}); };
  const span=q.max-q.min;
  const pos=x=>Math.max(0,Math.min(100,((x-q.min)/span)*100));
  return (
    <div className="q-card">
      <div className="q-type">{q.typeLabel} · Numeric estimate</div>
      <div className="q-stem">{q.stem}</div>
      {q.tolNote && <div className="warmnote"><b>Tolerance:</b> {q.tolNote}</div>}
      {q.skeleton && !sub && !q.requireDecomp && <div className="warmnote">{q.skeleton}</div>}
      {q.requireDecomp && !sub && <>
        <div className="warmnote">Before entering a number: name your own decomposition path — what would you multiply, add, or look up first?</div>
        <textarea value={decomp} onChange={e=>setDecomp(e.target.value)} placeholder="Your decomposition path (15+ characters)…"/>
      </>}
      {!sub && <>
        <div className="num-row">
          <input type="number" value={val} onChange={e=>setVal(parseFloat(e.target.value)||0)} disabled={!decompOk}/>
          <input type="range" min={q.min} max={q.max} step={q.step} value={val} onChange={e=>setVal(parseFloat(e.target.value))} disabled={!decompOk}/>
          <span style={{fontSize:13,color:"#666"}}>{q.unit}</span>
        </div>
        <button className="btn" disabled={!decompOk} onClick={submit}>Submit estimate</button>
      </>}
      {sub && <>
        {q.requireDecomp && <div className="yours"><b>Your decomposition path:</b> {decomp}</div>}
        <div className="distax">
          <div className="tick" style={{left:pos(q.min)+"%"}}></div><div className="lab" style={{left:pos(q.min)+"%"}}>{q.min}</div>
          <div className="tick" style={{left:pos(q.max)+"%"}}></div><div className="lab" style={{left:pos(q.max)+"%"}}>{q.max}</div>
          <div className="you" style={{left:pos(val)+"%"}}>you {val}</div>
          <div className="act" style={{left:pos(q.actual)+"%"}}>actual {q.actual}</div>
          <div className="tick" style={{left:pos(q.actual)+"%",background:"var(--good)"}}></div>
          <div className="tick" style={{left:pos(val)+"%",background:"var(--accent)"}}></div>
        </div>
        <div className="expl">
          <span className={"cal "+(within()?"ok":"no")}>{within()?"Within tolerance — ":"Outside tolerance — "}</span>
          {q.how}
          <div className="gen">Where this generalizes: {q.generalizes}</div>
        </div>
      </>}
    </div>
  );
}

/* ---------- Glossary -------------------------------------------------------- */
function Glossary({items}){ if(!items||!items.length) return null;
  return <div className="glossary"><div className="h">Glossary</div>
    {items.map((g,i)=><p key={i}><b>{g.t}</b> — {g.d}</p>)}</div>;
}

/* ---------- Chart wrappers -------------------------------------------------- */
function Chart1(){
  return (
    <div className="chartbox">
      <div className="charttitle">Amazon: ad revenue vs. total company sales, indexed to 100 at 2021 <Tier t="FACT"/></div>
      <div className="chartsub">Index (2021 = 100). Underlying dollars: advertising revenue $31.2B (2021) → $68.6B (2025); total net sales $469.8B (2021) → $716.9B (2025). 2021 is the first full year Amazon separately disclosed advertising as its own revenue line. Source: Amazon.com, Inc. Q4 2025 earnings release and prior 10-Ks; AdExchanger (2026).</div>
      <ResponsiveContainer width="100%" height={270}>
        <LineChart data={c1} margin={{left:4,right:16,top:10,bottom:4}}>
          <CartesianGrid strokeDasharray="3 3" vertical={false}/>
          <XAxis dataKey="yr" fontSize={12}/>
          <YAxis domain={[90,230]} tickFormatter={v=>v} fontSize={11} label={{value:"Index (2021=100)",angle:-90,position:"insideLeft",fontSize:11}}/>
          <Tooltip formatter={(v,n)=>[v.toFixed?v.toFixed(1):v, n]}/>
          <ReferenceLine y={100} stroke="#ccc" strokeDasharray="4 4"/>
          <Line type="monotone" dataKey="ad" stroke="#1f6feb" strokeWidth={2.5} name="Advertising revenue" dot={{r:4}}>
            <LabelList dataKey="ad" position="top" formatter={v=>v.toFixed(0)} fontSize={11}/>
          </Line>
          <Line type="monotone" dataKey="sales" stroke="#999" strokeWidth={2.5} name="Total net sales" dot={{r:4}}>
            <LabelList dataKey="sales" position="bottom" formatter={v=>v.toFixed(0)} fontSize={11}/>
          </Line>
          <Legend fontSize={10} wrapperStyle={{fontSize:10.5}}/>
        </LineChart>
      </ResponsiveContainer>
      <div className="note">Indexed line chart chosen over raw dollar bars because the story is DIVERGENCE — which series is pulling away from the other — not which one is bigger in absolute dollars; rebasing both to 100 makes two series that start at very different dollar levels directly comparable on one scale.</div>
    </div>
  );
}
function Chart2(){
  const sorted=[...c2].sort((a,b)=>a.g-b.g);
  return (
    <div className="chartbox">
      <div className="charttitle">Most recent year-over-year ad-revenue growth rate, four retail media networks <Tier t="FACT"/></div>
      <div className="chartsub">Percent. Reference periods differ: Amazon and Walmart are FY2024→FY2025; Target and Kroger are FY2023→FY2024 (their most recent disclosed annual comparison). Sources: Amazon.com/AdExchanger (2026); AdExchanger (2026); Digiday/Marketing Brew (2025); Kroger Co. (2025).</div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={sorted} layout="vertical" margin={{left:8,right:40,top:4,bottom:4}}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
          <XAxis type="number" domain={[0,42]} tickFormatter={v=>v+"%"} fontSize={11}/>
          <YAxis type="category" dataKey="co" width={110} fontSize={12}/>
          <Tooltip formatter={v=>v+"%"}/>
          <Bar dataKey="g" barSize={3} fill="#ccc"/>
          <Scatter dataKey="g" fill="#1f6feb">
            <LabelList dataKey="g" position="right" formatter={v=>"+"+v+"%"} fontSize={11}/>
          </Scatter>
        </ComposedChart>
      </ResponsiveContainer>
      <div className="note">Dot plot (lollipop) chosen over a bar chart because this is a CROSS-SECTIONAL comparison across a small number of named companies; a labeled dot reads faster than four competing bars, and does not visually imply the four figures share one time axis when their reference periods actually differ.</div>
    </div>
  );
}
function Chart3(){
  return (
    <div className="chartbox">
      <div className="charttitle">US retail media ad revenue, by company, 2024 <Tier t="FACT"/> <Tier t="ESTIMATE"/></div>
      <div className="chartsub">$ billions, and share of an approximately $55B total. Amazon, Walmart, and Target figures are eMarketer's company-level estimates; "All others" is an ESTIMATE plug reconciling those three figures to eMarketer's separately reported ~75%-77% Amazon share of the total US market. Source: eMarketer (2025).</div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={c3row} layout="vertical" margin={{left:4,right:8,top:10,bottom:10}}>
          <XAxis type="number" domain={[0,c3total]} tickFormatter={v=>"$"+v+"B"} fontSize={11}/>
          <YAxis type="category" dataKey="period" width={0} tick={false}/>
          <Tooltip formatter={(v,n)=>["$"+v+"B ("+((v/c3total)*100).toFixed(1)+"%)", n]}/>
          {c3.map((seg,i)=>(
            <Bar key={seg.name} dataKey={seg.name} name={seg.name} stackId="s" fill={c3colors[seg.name]}>
              <LabelList dataKey={seg.name} position="center" formatter={v=>seg.name+" $"+v+"B ("+((v/c3total)*100).toFixed(0)+"%)"} fontSize={10.5} fill="#fff"/>
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div className="note">Single stacked bar (donut alternative) chosen over four separate bars because the point is how a TOTAL divides into shares — a parts-of-a-whole question this shows directly, where side-by-side bars would force the reader to compute each share's percentage themselves.</div>
    </div>
  );
}
function Chart4(){
  return (
    <div className="chartbox">
      <div className="charttitle">Where does Amazon North America's profit actually come from? (modeled, FY2024) <Tier t="ESTIMATE"/></div>
      <div className="chartsub">$ billions. FACT inputs: $41.95B eMarketer-estimated 2024 US ad revenue for Amazon; $25.0B Amazon-reported FY2024 North America segment operating income. The bridge itself is an ESTIMATE: it applies a 45% ad-segment margin assumption (midpoint of the ~40%-50% analyst-cited range; some insider estimates run to 80%) to the ad-revenue FACT, then treats the gap to the reported total as an "implied core-retail & other" residual — a modeled illustration, not a figure Amazon has confirmed. Sources: eMarketer (2025); Amazon.com 10-K/Q4 2024 earnings release; Forbes (2025), citing analyst Russ Dieringer.</div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={c4} margin={{left:4,right:8,top:20,bottom:46}}>
          <CartesianGrid strokeDasharray="3 3" vertical={false}/>
          <XAxis dataKey="name" fontSize={10} interval={0} angle={-14} textAnchor="end" height={70}/>
          <YAxis domain={[0,28]} tickFormatter={v=>"$"+v+"B"} fontSize={11}/>
          <Tooltip formatter={(v,n,p)=>["$"+p.payload.delta+"B", "amount"]}/>
          <Bar dataKey="base" stackId="w" fill="transparent"/>
          <Bar dataKey="delta" stackId="w">
            {c4.map((d,i)=><Cell key={i} fill={waterfallColor(d)}/>)}
            <LabelList dataKey="delta" position="top" formatter={v=>"$"+v+"B"} fontSize={11}/>
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="note">Waterfall (bridge) chart chosen over a stacked bar because the point is the CONTRIBUTION-TO-CHANGE from zero to the reported total — the signature exhibit for "what makes up this number," which a plain stacked or grouped bar would present with less clarity about how each piece bridges to the final reported figure.</div>
    </div>
  );
}

/* ---------- Content sections ------------------------------------------------ */
const SECTIONS = [
  "Warm-Up","Introduction","Background","Q1 · Scale & Concentration","Q2 · Value or Tax?","Q3 · Can It Last?","Learning Summary","Conclusion"
];

/* ---------- App --------------------------------------------------------------*/
function App(){
  const [active,setActive]=useState(0);
  const [answers,setAnswers]=useState({});
  const [interp,setInterp]=useState({});
  const refs=useRef(SECTIONS.map(()=>React.createRef()));

  const score = Object.values(answers).filter(a=>a.ok).length;
  const total = Object.keys(answers).length;

  const onScore=(id,ok,type,meta)=> setAnswers(p=> p[id]?p:{...p,[id]:{ok,type,meta}});
  const onInterp=(id,txt)=> setInterp(p=>({...p,[id]:txt}));

  useEffect(()=>{
    const badge=document.getElementById("scorebadge");
    if(badge) badge.textContent="Score "+score+" / "+total;
  },[score,total]);

  useEffect(()=>{
    const onScroll=()=>{
      const y=window.scrollY+120; let idx=0;
      refs.current.forEach((r,i)=>{ if(r.current && r.current.offsetTop<=y) idx=i; });
      setActive(idx);
      const h=document.documentElement;
      const pct=(window.scrollY)/(h.scrollHeight-h.clientHeight)*100;
      const pt=document.getElementById("progterm"); if(pt) pt.style.width=pct+"%";
    };
    window.addEventListener("scroll",onScroll); onScroll();
    return ()=>window.removeEventListener("scroll",onScroll);
  },[]);

  const jump=i=>refs.current[i].current.scrollIntoView({behavior:"smooth"});

  return (
    <div className="wrap">
      <nav className="navcol">
        {SECTIONS.map((s,i)=>(
          <a key={i} className={active===i?"active":""} onClick={()=>jump(i)}>{s}</a>
        ))}
      </nav>
      <main className="col">

        {/* ---- WARM-UP ---- */}
        <section ref={refs.current[0]}>
          <div className="kicker">Warm-Up · What stuck?</div>
          <h1>Before today's topic: three ideas from recent articles</h1>
          <p className="dek">Each question takes a principle from a prior article and drops it into today's topic before you've read any of it. Answer before reading on — these are scored, and none of them require knowing anything about retail or advertising yet.</p>
          <MC onScore={onScore} q={{
            id:"wu1",typeLabel:"Warm-Up · Type B",
            stem:"The Baumol cost-disease article taught you that when a national AVERAGE looks calm, you should split it into its fastest-rising and slowest-rising parts before judging its true size — a clean mechanism rarely explains the whole picture. Today's article will report that eMarketer projects US retail media ad spending will grow a calm-sounding 17.9% in 2026, and separately that one company alone (Amazon) captures roughly three-quarters of the entire US retail media market. Applying the Baumol-article lesson, what should you check before treating '17.9% aggregate growth' as evidence of a broad, evenly distributed boom across many retailers?",
            options:[
              "Whether that aggregate growth rate is actually driven almost entirely by the concentration leader's own growth, while the smaller retail media networks that make up the rest of the market grow at a very different rate — the same way a calm national inflation average hid hospital prices rising far faster than toys in the Baumol article",
              "Nothing further is needed — an aggregate industry growth rate is the most reliable number precisely because it already smooths out any one company's noise",
              "Whether the 17.9% figure is measured in nominal or inflation-adjusted dollars",
              "Whether the total addressable market for advertising is shrinking elsewhere, which would explain the growth rate on its own"],
            correct:0,
            why:"Just as the Baumol article showed a calm national inflation average hid hospital prices rising over 100 percentage points faster than toys, a calm aggregate 'retail media grew 17.9%' figure can hide the fact that one company's growth is doing most of the work, while the other ~199 named and unnamed networks in the market may be growing far slower (or faster) than that headline number suggests.",
            wrongWhy:{
              1:"This is the opposite of the Baumol lesson: an average's calm appearance is exactly what should trigger a closer look at its fastest-moving components, not a reason to stop looking.",
              2:"A real-vs-nominal check is a legitimate general question, but it is not the specific discipline (splitting an aggregate into its parts before trusting its size) this question is testing.",
              3:"A shrinking market elsewhere might be a true fact about advertising overall, but it does not address the specific mechanism the Baumol lesson points to here — decomposing THIS aggregate into its own components."},
            generalizes:"Any calm-looking aggregate — an industry growth rate, an inflation average, an approval rating — before trusting its size, split it by the biggest single contributor or component to check whether it is hiding a concentrated spike underneath.",
          }}/>
          <MC onScore={onScore} q={{
            id:"wu2",typeLabel:"Warm-Up · Type B",
            stem:"The passive-investing article showed that many individually rational choices (each saver picking a low-cost index fund) can add up to an aggregate outcome — concentrated ownership and voting power — that no single saver intended, and that this mechanism had only been tested during one kind of period (steady inflows), never during a sustained reversal. Today's article will describe each individual retailer's decision to build a retail-media network as independently rational: it turns existing shopper traffic into high-margin ad revenue. Applying the passive-investing lesson, what UNINTENDED aggregate effect should you watch for as many retailers adopt this same rational strategy at once, and what does the lesson say about how well that aggregate effect has been tested?",
            options:[
              "No aggregate effect exists, since each retailer's choice to monetize its own traffic is fully independent of what other retailers do",
              "The aggregate outcome could be an unintended squeeze on brands — a fragmented, hard-to-verify advertising tax spread across hundreds of separate walled gardens simultaneously — and, like the passive-investing mechanism, this has mostly been observed during a period of rising retail-media investment (inflows), not yet tested by a period of broad, sustained advertiser pullback",
              "The aggregate effect will definitely be that total advertiser spending falls, since no brand can afford to fund every retailer's network at once",
              "This exact mechanism has already been thoroughly tested across both a boom and a multi-year bust in retail media spending"],
            correct:1,
            why:"This is the same shape of surprise as the passive-investing article: many individually sound, revenue-maximizing decisions can add up to an aggregate burden (a fragmented advertising 'tax' across dozens of walled gardens) that no single retailer's decision was optimizing for — and, just as passive investing's price-elasticity mechanism has only been observed during inflows, this pattern has mostly been observed during a multi-year retail-media boom, not during a sustained pullback.",
            wrongWhy:{
              0:"This assumes independence prevents any aggregate effect, ignoring that many independent, rational choices can still sum to a shared burden on the parties (brands) facing all of them at once — the exact aggregation logic the passive-investing article demonstrated.",
              2:"Asserting total spending will definitely fall states one possible outcome as certain, without the reasoning; it also ignores that brands have kept increasing retail-media budgets for years despite the burden.",
              3:"Claiming the mechanism is already 'thoroughly tested' by a bust contradicts the very evidence in this article, which describes an ongoing multi-year growth boom, not a tested reversal."},
            generalizes:"Whenever many individually rational, self-interested decisions accumulate across an industry, check whether the aggregate outcome could burden a third party (like brands funding many networks) that no single decision-maker intended — and whether the mechanism linking them has been tested by more than one direction of change.",
          }}/>
          <MC onScore={onScore} q={{
            id:"wu3",typeLabel:"Warm-Up · Type E",
            stem:"The gene-therapy pricing article showed that passing a per-unit VALUE test (a favorable cost-effectiveness ratio) does not guarantee a working ADOPTION funnel, and that fixing one named risk (performance-based payment) can leave a second, structurally different risk (who actually captures the long-run savings) completely untouched. Today's article will show that retail media ad campaigns often pass a brand's short-run ROI (return on investment) math, as reported inside the retailer's own dashboard. Applying the gene-therapy lesson, what SEPARATE, structurally different risk should a brand's marketing chief worry has NOT been addressed just because a campaign 'passed its ROI test'?",
            options:[
              "No separate risk exists, since a positive reported ROI already accounts for everything relevant to whether the spend created real value",
              "The separate risk is that the advertised product itself might be defective or low quality, unrelated to how the ad campaign was measured",
              "Whether the sales credited to the campaign are truly INCREMENTAL — caused by the ad — rather than sales that would have happened anyway, a distinction that is hard to verify independently inside a retailer's own dashboard and is structurally different from whether the campaign 'looked' profitable on paper",
              "The separate risk is that retail media ad prices will simply keep rising every year, regardless of measurement"],
            correct:2,
            why:"Exactly as the gene-therapy article separated 'does this pass a value test' from 'does the adoption and payoff mechanism actually work as assumed,' a retail-media campaign's reported ROI can look positive while leaving completely open whether those sales were truly incremental — a distinct, harder question about measurement and attribution that a single ROI number does not answer on its own.",
            wrongWhy:{
              0:"This assumes a reported ROI figure automatically settles the incrementality question, exactly the conflation the gene-therapy lesson warns against — passing one test does not mean every other risk is resolved.",
              1:"Product quality is a real business risk in general, but it is not the specific, measurement-related risk this question — modeled on the gene-therapy lesson's structurally different second risk — is testing.",
              3:"Future price increases are a real budgeting risk, but they are a cost question, not the specific 'is this credited sale actually incremental' measurement risk this question targets."},
            generalizes:"Whenever a decision 'passes' one specific test (a value ratio, a reported ROI), ask whether a second, structurally different risk — often about measurement, attribution, or who captures the payoff — has actually been addressed, or just left unexamined because the first test looked good.",
          }}/>
          <div className="navbtns"><span/><button onClick={()=>jump(1)}>Next: Introduction →</button></div>
        </section>

        {/* ---- INTRODUCTION ---- */}
        <section ref={refs.current[1]}>
          <div className="kicker">Business &amp; Strategy</div>
          <h1>The Ad Business Inside the Store: Retail Media's Margin Paradox</h1>
          <p className="lead">Grocery stores keep, on average, less than two cents of profit for every dollar of food they sell. Yet by 2025, the fastest-growing, highest-margin part of America's largest retailers was not food, clothing, or electronics at all. It was an in-house advertising business, selling ad space on the retailer's own website and app, running at a profit margin analysts estimate is ten to twenty-five times higher than the store it sits inside of.</p>
          <p>This business has a name: a retail media network (RMN), a system where a retailer sells ad space on its own site or app to the same brands that stock its shelves, using the retailer's own shopper data to target the ads. Amazon's version of this business brought in $68.6 billion in 2025, up 22% from $56.2 billion the year before (Amazon.com, 2026 earnings release; AdExchanger, 2026). Zoomed out to the whole industry, retail media advertising reached an estimated $176 billion to $177 billion worldwide in 2025 — enough, for the first time, to overtake total spending on television advertising across the entire globe (WARC Media; GroupM, 2025).</p>
          <p>Conventional retail theory says a store's profit comes from selling products for more than they cost to buy, ship, and stock, and that margin has been shrinking for decades under price competition. Retail media flips that logic. It treats the retailer's own website traffic, built up over years of low-margin selling, as a media property in its own right, one that can be rented out to brands at margins that rival a software company's, not a supermarket's. The store's shelf, in other words, has become less valuable than the store's screen.</p>
          <p>This note addresses three questions. First, how large has retail media actually become, and how concentrated is it among just a handful of companies? Second, why is the margin gap between selling ads and selling products so wide, and is that gap genuine new value for the brands who pay for it, or mostly a transfer — in effect, a tax — from the suppliers who used to just pay for shelf space? Third, can this growth keep compounding, or is retail media approaching real limits, from advertiser distrust of how it is measured to supplier backlash over how it is sold?</p>
          <Glossary items={[
            {t:"Retail media network (RMN)",d:"A system a retailer builds to sell ad space on its own website and app to brands, using the retailer's own shopper data to target the ads."},
            {t:"Gross merchandise value (GMV)",d:"The total dollar value of everything sold through a marketplace, including sales by outside (third-party) sellers the marketplace owner does not book as its own revenue."},
            {t:"Walled garden",d:"An advertising platform whose performance data (clicks, sales, reach) stays inside that one company's own systems, which outside advertisers and researchers cannot independently verify."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(0)}>← Warm-Up</button><button onClick={()=>jump(2)}>Next: Background →</button></div>
        </section>

        {/* ---- BACKGROUND ---- */}
        <section ref={refs.current[2]}>
          <div className="kicker">Background · Trajectory &amp; structure</div>
          <h2>From a footnote to the growth engine</h2>
          <p>Amazon began separately disclosing advertising as its own line in its financial filings in 2021 — the first year the business was large and distinct enough from the rest of its retail operation to break out on its own. In that first disclosed year, Amazon's advertising revenue was $31.2 billion. By 2025, four years later, it had reached $68.6 billion, more than double, and equal to roughly 9.6% of Amazon's entire $716.9 billion in net sales that year (Amazon.com, 2026 earnings release; AdExchanger, 2026).</p>
          <p>Amazon is not the only retailer running this playbook, just the largest. Walmart's advertising business, built around a unit called Walmart Connect, grew from $4.4 billion in 2024 to $6.4 billion in 2025, a 37% increase globally and 41% domestically (AdExchanger, 2026). Target's smaller advertising unit, Roundel, grew from $522 million in 2023 to $649 million in 2024, up 25% (Digiday; Marketing Brew, 2025). Kroger, the country's largest traditional grocery chain, does not break out its media revenue on its own, but the wider group of businesses it calls "alternative profit businesses" — mostly advertising and data services, plus a smaller health business — earned $1.35 billion in operating profit in 2024, with the media portion growing 17% (Kroger Co., 2025).</p>
          <Chart1/>
          <Interp id="c1p1" label="Interpretation 1 of 2 · Predict, then check (quantitative, pre-reveal)"
            question="Before checking the exact index values: predict roughly how much FASTER Amazon's ad revenue grew than its total company sales from 2021 to 2025, expressed as how many times larger ad revenue's own growth multiple is compared with total sales' own growth multiple. Then compute the actual ratio from the chart, and say what a gap this size implies about which part of Amazon's business is doing the heavy lifting for growth."
            authored={<span>Total sales grew 1.53× over the period (index 100→152.6) while ad revenue grew 2.20× (100→219.9) — ad revenue's own growth multiple is about 1.44 times larger than total sales' own growth multiple (2.20÷1.53≈1.44). A gap this size means an increasing share of Amazon's incremental revenue growth, and a disproportionately larger share of its incremental profit given ads' much higher margin, is coming from the ad business rather than from selling more products — the store's growth engine and its profit engine are quietly diverging.</span>}
            onSubmit={onInterp}/>
          <Interp id="c1p2" label="Interpretation 2 of 2 · Mechanism (non-so-what)"
            question="Why would a retailer's advertising revenue plausibly grow faster than its underlying product sales, rather than growing in strict proportion to them?"
            authored={<span>Ad revenue is not capped by how many products Amazon itself sells — it also captures ad budgets from the millions of third-party sellers competing for visibility on Amazon's marketplace, plus, increasingly, brand budgets that used to go to television or search ads elsewhere. Each new advertiser added to an already-large audience is close to pure margin, since the underlying website traffic and shopper data already exist regardless of how many ads run against it, while product-sales growth requires more inventory, warehouses, and delivery capacity for every incremental dollar.</span>}
            onSubmit={onInterp}/>
          <MC onScore={onScore} q={{
            id:"bg-mc1",typeLabel:"Type B · Correlation vs. causation",
            stem:"Amazon's advertising revenue and its total company operating income have both risen sharply since 2021, and ads carry a far higher margin than retail. Which is the strongest reason NOT to conclude that rising ad revenue alone is mechanically CAUSING Amazon's rising total operating income?",
            options:[
              "The two figures use incompatible units, so no comparison is meaningful at all",
              "The broader stock market also rose sharply over the same years, which explains both trends",
              "Ad revenue was still small in Amazon's earliest years, so it cannot be responsible for any of the company's income growth",
              "Both trends are plausibly joint outputs of the same underlying driver — a larger, more engaged base of shoppers and third-party sellers — which simultaneously creates more ad inventory to sell and more product and cloud-service sales, so a shared upstream cause could produce the correlation without ads doing all the causal work"],
            correct:3,
            why:"The strongest challenge to a causal story is naming the common upstream driver that would produce both trends even if neither directly caused the other: a larger, more engaged shopper and seller base simultaneously creates more ad inventory AND more product and AWS cloud-service sales, for the same underlying reason.",
            wrongWhy:{
              0:"Both are legitimate, comparable dollar figures tracked over the same years by the same company; incomparability is not the strongest available objection here.",
              1:"A rising stock market is a real confound for many corporate metrics over this period, but it does not speak to the specific mechanism linking Amazon's own ad revenue and its own operating income.",
              2:"A cause does not need to be large in its earliest years to still be a meaningful contributor once it scales; pointing to an early, smaller base is a weaker objection than naming the actual shared upstream driver."},
            generalizes:"When two of a company's own metrics rise together, look for the shared upstream driver (like a larger overall customer base) that could produce both as joint effects before assuming either one causes the other.",
          }}/>
          <MC onScore={onScore} q={{
            id:"bg-a1",typeLabel:"Type A · Normalization / denominator trap",
            stem:"Amazon's $68 billion of 2025 ad revenue is often measured against its $830 billion of gross merchandise value (GMV — the total value of everything sold through its marketplace, including third-party sellers' sales Amazon does not book as its own revenue) to get 'ads are about 8% of GMV.' Walmart's $6.4 billion of ad revenue is instead measured against its $713 billion of net sales (revenue it actually recognizes) to get 'ads are only about 1% of sales' (AdExchanger, 2026). What is the problem with comparing these two percentages directly to conclude Amazon monetizes its business through ads roughly eight times more intensely than Walmart?",
            options:[
              "The two percentages use different DENOMINATORS — GMV versus net sales, which measure different things — so an apples-to-apples comparison requires converting both figures to the same base before trusting the 8%-vs-1% gap as a real difference in ad-monetization intensity, rather than partly an artifact of which denominator each figure happens to use",
              "There is no problem, since both figures are already expressed as percentages and are therefore directly comparable",
              "The problem is that Amazon's $68 billion ad-revenue figure is inflated and should not be trusted",
              "The problem is that Walmart does not actually operate a real advertising business, so no percentage should be calculated for it at all"],
            correct:0,
            why:"GMV and net sales measure different things — GMV includes third-party marketplace sales a company never books as its own revenue, while net sales is only revenue the company itself recognizes — so dividing ad revenue by whichever base happens to be reported can make two companies look far more different in 'ad intensity' than a same-denominator comparison would show.",
            wrongWhy:{
              1:"Both being percentages does not make them comparable if each was built on a different kind of denominator; the units being percentages is exactly what can disguise the mismatch.",
              2:"Amazon's ad-revenue figure is Amazon's own reported figure, consistently cited across multiple outlets; the issue here is the choice of denominator, not the numerator's reliability.",
              3:"Walmart's advertising business is real and independently disclosed (Walmart Connect); the issue is which base its ad revenue was divided by, not whether the business itself exists."},
            generalizes:"Whenever two ratios are compared across companies or entities, check whether both used the SAME denominator (GMV vs. net sales, per-capita vs. total, and similar mismatches) before treating a gap between them as a real difference rather than a reporting-convention artifact.",
          }}/>
          <Numeric onScore={onScore} q={{
            id:"bg-d1",typeLabel:"Type D",
            stem:"eMarketer estimates the total 2024 US retail media ad market at roughly $55 billion, of which Amazon captured about 76% (both cited later in this article). Using these two figures, estimate AMAZON'S implied 2024 US retail media ad revenue, in billions of dollars.",
            skeleton:"Decomposition: total market ($55B) × Amazon's share (76%) = Amazon's implied revenue.",
            tolNote:"±10% — tight, because this is a direct, single-step multiplication from two stated figures, not a multi-step Fermi estimate.",
            min:0,max:60,step:1,unit:"$ billion",actual:41.95,tol:4.2,
            how:"55 × 0.76 ≈ 41.8, very close to the actual eMarketer-reported figure of $41.95B for Amazon specifically — the small gap exists because the $55B total and the 76% share are themselves independently rounded figures from the same source, not because the underlying arithmetic is wrong. Multiplying a reported total by a reported leader's share to reproduce the leader's absolute figure is a fast way to sanity-check whether two headline statistics from the same source are mutually consistent before building further analysis on top of them.",
            generalizes:"Whenever a source reports both a market total and a leading player's share of that total, multiply them to reproduce the leader's absolute figure as a consistency check before trusting either number in isolation.",
          }}/>
          <Chart2/>
          <Interp id="c2p1" label="Interpretation 1 of 2 · So what (decision)"
            question="Given that all four retailers' ad businesses are growing faster than most companies' total sales growth, what should a Chief Marketing Officer at a consumer packaged-goods brand do differently about next year's marketing budget, even though the four growth rates shown here range from 17% to 37%?"
            authored={<span>Budget for retail media as a structurally growing, not optional or one-off, line item — even the SLOWEST grower here (Kroger, +17%) is compounding faster than most CPG brands' total sales growth, so a marketing budget that keeps retail-media spend flat year over year is, in relative terms, actually shrinking that channel's share of the marketing mix; the CMO should build in an automatic annual increase rather than re-litigating the channel's existence every budget cycle.</span>}
            onSubmit={onInterp}/>
          <Interp id="c2p2" label="Interpretation 2 of 2 · Predict, then check (quantitative, pre-reveal)"
            question="Before computing: predict roughly how many times faster the fastest grower (Walmart, +37%) is compounding than the slowest (Kroger, +17%). Then compute the actual ratio, and say what it implies about how differently 'retail media' scales depending on which retailer runs it, even though all four are nominally in the same business."
            authored={<span>37÷17≈2.2 — Walmart's ad business is growing at roughly 2.2 times the rate of Kroger's, despite both being described with the same "retail media" label. That gap is a reminder that retail media is not one uniform product with one uniform growth rate; it depends heavily on each retailer's own traffic scale, ad-tech maturity, and how recently the network launched, so a single industry-wide growth figure can badly mislead about any one specific retailer's trajectory.</span>}
            onSubmit={onInterp}/>
          <p>Sorting the four companies' most recent year-over-year ad-growth rates side by side shows that Amazon's 22% is actually the SLOWER end of the pack, not the leader — Walmart's 37% and Target's 25% both outpace it, even though Amazon's ad business remains many times larger in absolute dollars than either. That pattern, growth rates converging even as absolute dollar gaps stay enormous, is exactly the tension the next section works through.</p>
          <Glossary items={[
            {t:"Operating margin",d:"A company's operating profit divided by its revenue, showing how many cents of profit it keeps from each dollar of sales before interest and taxes."},
            {t:"Net margin",d:"A company's profit after ALL expenses (including interest and taxes), divided by its revenue."},
            {t:"Indexed (rebased) chart",d:"A chart where every series is rescaled so its starting value equals 100, making it easy to compare how fast different series grew from the same starting point, regardless of how big they were in dollars."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(1)}>← Introduction</button><button onClick={()=>jump(3)}>Next: Scale &amp; Concentration →</button></div>
        </section>

        {/* ---- Q1: SCALE & CONCENTRATION ---- */}
        <section ref={refs.current[3]}>
          <div className="kicker">Research Question 1</div>
          <h2>How big, and how concentrated?</h2>
          <p>By any reasonable measure, retail media is no longer a side project. eMarketer estimates the total US retail media market at roughly $55 billion in 2024, rising to $58.79 billion in 2025 and a forecast $69.33 billion in 2026, a 17.9% year-over-year increase (eMarketer, 2025-2026). Globally, WARC Media and GroupM both estimate 2025 retail media ad spending at $176 billion to $177 billion, about 15% to 16% of every advertising dollar spent worldwide — a bigger pool of money than the entire worldwide television advertising market, for the first time (WARC Media; GroupM, 2025).</p>
          <p>Amazon has grown large enough on the back of this business to become the world's third-biggest digital advertising platform, trailing only Google and Meta, with a projected 9% share of global digital ad revenue in 2026. Together, the three companies are projected to capture over three-fifths — about 62% — of all digital advertising spending worldwide (eMarketer, 2025-2026). An advertising category that barely existed as a distinct line item five years ago now sits inside the same league table as the two companies that have defined digital advertising for two decades.</p>
          <p>That total, though, is far from evenly shared. eMarketer estimates that Amazon alone captured about $41.95 billion of US retail media ad revenue in 2024, next to Walmart's $3.72 billion and Target's $1.76 billion (eMarketer, 2025). Put together, Amazon's own share works out to roughly three-quarters of the entire US market, a concentration level eMarketer puts at 75% to 77% (eMarketer, 2025).</p>
          <Chart3/>
          <Interp id="c3p1" label="Interpretation 1 of 2 · So what (decision)"
            question="Given that one company holds roughly three-quarters of the entire US retail media market, what should a mid-sized retailer (say, a regional grocery chain) planning to launch its own retail media network conclude about its likely ceiling for ad revenue, regardless of how well it executes?"
            authored={<span>Its ceiling is set less by its own execution than by how much of advertisers' remaining budget is left over after funding the dominant player's network; brands rarely walk away from Amazon's reach to fund a smaller network instead, so a new entrant is mostly competing for a shrinking residual slice of budget, not for a fair share of the whole pie — which argues for a narrower, higher-relevance pitch (a specific shopper base Amazon cannot match) rather than trying to out-scale the leader.</span>}
            onSubmit={onInterp}/>
          <Interp id="c3p2" label="Interpretation 2 of 2 · Mechanism (non-so-what)"
            question="Why would a first mover's share of a fast-growing ad market tend to stay this concentrated over time, rather than eroding naturally as more competitors enter, the way market share often does in other industries?"
            authored={<span>Retail media is not a product being resold in a shared marketplace — each retailer's ad inventory is tied to ITS OWN captive shopper traffic and first-party purchase data, which a rival retailer cannot replicate simply by competing harder. Amazon's share is protected by the sheer scale of its own audience and third-party seller base, a moat that does not erode the way market share in a commodity product would, because a new entrant is not fighting for the same shelf; it is building an entirely separate shelf that advertisers must decide is worth an additional budget line.</span>}
            onSubmit={onInterp}/>
          <MC onScore={onScore} q={{
            id:"rq1-a1",typeLabel:"Type A · Quantitative comparison",
            stem:"Chart 3 shows Amazon at an estimated $41.95 billion and Walmart at an estimated $3.72 billion of 2024 US retail media ad revenue. Express Amazon's ad revenue as a MULTIPLE of Walmart's, and say what a gap this size implies about whether Walmart's ad business, despite its own faster 2025 growth rate, poses a near-term competitive threat to Amazon's position.",
            options:[
              "About 2 times larger, consistent with a modest, closable gap",
              "About 11.3 times larger (41.95÷3.72≈11.3) — a gap this wide means Walmart would need several more years of growth meaningfully faster than Amazon's own (which is also still growing, at 22% a year) just to close half the absolute gap, so a fast PERCENTAGE growth rate and a small ABSOLUTE distance closed are two different facts, and the near-term competitive threat to Amazon's position is limited despite Walmart's impressive growth rate",
              "About 25 times larger, consistent with Walmart barely having a retail media business at all",
              "This cannot be computed without also knowing each company's advertising-technology budget"],
            correct:1,
            why:"41.95÷3.72≈11.3 — a gap of this size, combined with the fact that Amazon's own ad business is also still growing at a healthy clip, means Walmart's faster percentage growth rate closes very little of the absolute dollar distance each year, making a near-term competitive threat to Amazon's overall position unlikely despite the impressive headline growth rate.",
            wrongWhy:{
              0:"2× dramatically understates the actual ratio and would describe a far more competitive market than the data shows.",
              2:"25× overstates the actual ratio computed from the two cited FACT values.",
              3:"The two reported dollar figures are sufficient on their own; computing their ratio requires no additional data about advertising-technology spending."},
            generalizes:"When one entity's percentage growth rate is faster than a much larger rival's, compute the absolute gap being closed each year, not just the percentage rates themselves, before concluding the smaller entity is closing in.",
          }}/>
          <MC onScore={onScore} q={{
            id:"rq1-b1",typeLabel:"Type B · Named reasoning error",
            stem:"Trade press frequently profiles Walmart Connect and Target's Roundel as 'the networks to watch' in retail media, based on their fast percentage growth rates (37% and 25%). Yet Amazon added more absolute ad revenue in a single year (+$12.4 billion, 2024 to 2025) than Target's entire Roundel business generated in all of 2024 ($649 million). What reasoning error would lead someone to conclude, from headlines about 'fast growers,' that the retail media race is closer than it actually is?",
            options:[
              "Survivorship bias — a distinct error from the one actually at work here",
              "Confusing correlation with causation — a distinct error from the one actually at work here",
              "Conflating a fast RATE (percentage growth) with a large LEVEL (absolute dollar significance) — a percentage growth rate says nothing about the size of the base it is compounding on, so a smaller network's fast rate can look competitively dramatic in headlines while remaining a rounding error next to the leader's absolute dollar gains",
              "Base-rate neglect — a distinct error from the one actually at work here"],
            correct:2,
            why:"This is a rate-versus-level confusion: a percentage growth rate describes how fast something is compounding, not how large it is, so a smaller company's fast percentage growth can generate attention-grabbing headlines while its absolute dollar contribution to the market stays tiny next to the leader's.",
            wrongWhy:{
              0:"Survivorship bias involves drawing conclusions only from surviving or visible cases while ignoring ones that disappeared; nothing in this scenario involves cases dropping out of a sample.",
              1:"Correlation-vs-causation describes mistaking two co-moving trends for a causal link; the error here is about a rate diverging from a level, a different mechanism.",
              3:"Base-rate neglect involves ignoring a known background probability in favor of vivid specific information; the more precise, directly named mechanism here is confusing a rate with a level."},
            generalizes:"Whenever a percentage growth rate is used to argue that a smaller player is 'catching up' to a larger one, convert both to the same absolute unit (dollars, units, or share points) before judging how close the race actually is.",
          }}/>
          <Numeric onScore={onScore} q={{
            id:"rq1-d1",typeLabel:"Type D · Open-ended",
            requireDecomp:true,
            stem:"Roughly 200 or so retailers now operate some form of retail media network in the US (Forbes, 2025), but only four (Amazon, Walmart, Target, Kroger) are named with specific revenue figures in this article. Without looking anything up, estimate the TOTAL COMBINED 2024 ad revenue, in billions of dollars, generated by all the remaining smaller and mid-sized US retail media networks combined — that is, everyone besides Amazon, Walmart, and Target.",
            tolNote:"Within a factor of 2 (log-scored, order-of-magnitude) — wide, because this is a genuine Fermi estimate over roughly 200 heterogeneous retailers with no single clean decomposition path.",
            min:0,max:40,step:0.5,unit:"$ billion (combined, all other US retail media networks besides Amazon/Walmart/Target)",log:true,actual:7.8,
            how:"Total US retail media market (≈$55B, eMarketer 2024) minus Amazon ($41.95B) minus Walmart ($3.72B) minus Target ($1.76B) leaves about $7.8B for the roughly 196 remaining networks, including Kroger's own media business (part of its $1.35B 'alternative profit businesses' profit figure, which blends media with a smaller health business). A residual this small, spread across roughly 200 companies, means the 'long tail' of retail media is mostly symbolic revenue for most participants, not yet a meaningful profit center outside the top handful.",
            generalizes:"When a market has both a few named, dominant players and a long tail of 'everyone else,' estimate the tail by subtracting the named leaders' shares from the reported total, then sanity-check whether the residual, spread across the reported count of remaining participants, implies a plausible figure per participant.",
          }}/>
          <p>None of this means Amazon's lead is permanent, but Walmart's and Target's faster percentage growth rates are compounding on a base one to two orders of magnitude smaller than Amazon's own. The honest read of this section is that retail media is simultaneously a fast-growing market for many retailers and a heavily concentrated one for the single retailer whose audience and seller base dwarfs everyone else's — a pattern closer to a near-monopoly wearing an industry's clothes than to a broad, competitive new category.</p>
          <Glossary items={[
            {t:"First-party data",d:"Information a company collects directly from its own customers (what they searched for, clicked, or bought), as opposed to data bought from an outside broker."},
            {t:"Market concentration",d:"How much of a market's total activity or revenue is held by just one or a few companies, rather than spread evenly across many."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(2)}>← Background</button><button onClick={()=>jump(4)}>Next: Value or Tax? →</button></div>
        </section>

        {/* ---- Q2: VALUE OR TAX? ---- */}
        <section ref={refs.current[4]}>
          <div className="kicker">Research Question 2</div>
          <h2>New value, or an old tax with a new name?</h2>
          <p>The obstacle to a simple "this is just smart business" story is the sheer size of the margin gap. Grocery retailers reported an average net profit margin of just 1.7% in 2024 (Food Industry Association, 2025). Walmart's entire company operated at a 4.4% operating margin in fiscal 2025, and Target's at roughly 5.2% in fiscal 2024 (Walmart Inc., 2025; Target Corp., 2025). Amazon's North America segment, which blends its retail and advertising businesses together, reported a blended operating margin of 6.44% in 2024 (Amazon.com, 10-K). Retail media itself, by contrast, is estimated by industry analysts to run at an operating margin of roughly 40% to 50%, with some insider estimates running as high as 80% (Forbes, citing digital commerce analyst Russ Dieringer, 2025).</p>
          <p>Some of that gap is defensible as genuine new value. Retail media offers brands a kind of targeting no other ad channel can match: an ad shown to a shopper who has already searched for a related product, on the exact page where they are about to buy, backed by the retailer's own purchase history rather than a third party's guess. Target has said its Roundel business, along with membership and marketplace revenue, helped lift its overall gross margin by 80 basis points (hundredths of a percentage point) in the first quarter of fiscal 2026 (Zacks Equity Research, 2026). Kroger has said its e-commerce business, which includes its media unit, reached profitability for the first time that same quarter (Zacks Equity Research, 2026). These are not accounting illusions; they are real profit dollars showing up on real income statements.</p>
          <p>To see how much of that profit plausibly traces back to advertising specifically, this section builds a modeled bridge for Amazon's North America segment, the one geography where both an ad-revenue estimate and a reported segment profit figure exist.</p>
          <Chart4/>
          <Interp id="c4p1" label="Interpretation 1 of 2 · Predict, then check (quantitative, pre-reveal)"
            question="Before checking the exact bridge: predict what SHARE (as a percent) of Amazon's entire North America segment operating profit might plausibly trace back to the estimated ad-driven profit alone. Then check the modeled bridge, compute the actual share, and say what a share this large implies about how dependent the reported segment profit is on the ad business specifically."
            authored={<span>Using the midpoint 45% margin assumption, estimated ad-driven profit ($18.9B) is about 76% of the entire reported NA segment operating income ($25.0B) — even at the low end of the analyst-estimated margin range (40%), it would still be about 67%. A share this large means most of the PROFIT (not revenue — ads are still a minority of NA segment revenue) that Amazon reports from its entire North American operation is, on this modeling, attributable to the ad business layered on top of it, not to selling and shipping products.</span>}
            onSubmit={onInterp}/>
          <Interp id="c4p2" label="Interpretation 2 of 2 · Mechanism (non-so-what)"
            question="Why might Amazon's core product-selling operation in North America run at a profit margin close to zero once the ad-driven profit is set aside, rather than earning a normal retail profit margin on its own?"
            authored={<span>Amazon has historically priced products aggressively and invested heavily in fast, often money-losing delivery infrastructure (one-day and same-day shipping, warehousing, returns handling) specifically to build the large, loyal shopper traffic that makes its ad inventory valuable in the first place. In that light, the core retail operation may function less like a stand-alone profit center and more like an expensive audience-acquisition engine that the advertising business monetizes — similar to how a free app subsidizes its engineering costs with in-app ads.</span>}
            onSubmit={onInterp}/>
          <MC onScore={onScore} q={{
            id:"rq2-a1",typeLabel:"Type A · Percentage points",
            stem:"Using the modeled bridge in Chart 4, by how many PERCENTAGE POINTS would the estimated ad-driven share of Amazon's North America segment profit change if the margin assumption shifted from the low end (40%) to the high end (50%) of the analyst-cited range, and what does the SIZE of that swing imply about how much this bridge depends on an assumption nobody outside Amazon can verify?",
            options:[
              "About 2 percentage points, so the estimate is highly precise regardless of which margin assumption is used",
              "The swing is undefined, because percentages above 50% are not meaningful",
              "About 45 percentage points",
              "About 17 percentage points (84% at the high end minus 67% at the low end) — a swing this large from a single, unverifiable margin assumption means the conclusion that ads generate MOST of Amazon's North America segment profit is directionally solid (even the low end implies a majority), but its exact size is soft, resting on an analyst estimate Amazon itself has never confirmed"],
            correct:3,
            why:"At 40% margin, ad-driven profit is about 67% of the $25.0B total; at 50% margin, about 84% — a swing of roughly 17 percentage points. A range that wide, generated by a single assumption nobody outside the company can verify, means the DIRECTION of the finding (ads drive most of the segment's profit) is robust, but the EXACT size is not something to state with false precision.",
            wrongWhy:{
              0:"2 percentage points badly understates how sensitive this bridge is to the underlying margin assumption.",
              1:"Percentages above 50% are entirely meaningful here — the share simply means ad-driven profit alone could exceed half of the segment's total, which is exactly what an 84% result at the high end implies.",
              2:"45 percentage points overstates the actual computed swing between the 40% and 50% assumption cases."},
            generalizes:"Before treating a modeled estimate's headline number as precise, recompute it at the edges of its stated assumption range and report the resulting swing — a wide swing means the direction of the finding is trustworthy even if the exact figure is not.",
          }}/>
          <p>The evidence against treating the whole margin gap as earned value comes from how brands describe paying for it. Many describe retail media budgets as a "retail media tax" — a forced allocation of marketing dollars disconnected from actual performance, paid to keep "preferred vendor" shelf placement rather than because the ads themselves tested well. Retailers have used Joint Business Plans, agreements that once focused mainly on merchandising and promotional support, to tie minimum advertising-spend commitments to that same shelf placement, so that declining to buy ads can mean losing physical shelf space, not just losing an ad slot (Forbes, citing Kiri Masters, 2025).</p>
          <MC onScore={onScore} q={{
            id:"rq2-c1",typeLabel:"Type C",kind:"case",
            client:"The Chief Marketing Officer of a mid-sized packaged-food brand is deciding whether to approve a 30% increase in next year's retail-media budget, based on her merchandising team's argument that 'every dollar we spent on retail media this year showed positive ROAS (return on ad spend) in the retailer's own dashboard.'",
            stem:"Which assumption is most load-bearing for this budget increase to actually create new profit for the brand, and where is the evidence in this section thinnest in supporting it?",
            options:[
              "That the sales credited to retail media in the retailer's own dashboard are actually INCREMENTAL — sales that would not have happened anyway through organic search or repeat purchase — rather than sales the brand would have captured for free; and this is exactly where the evidence is thinnest, since industry surveys show most advertisers cite measuring true incrementality as their single biggest challenge and few feel effective at it, meaning a 'positive ROAS' reported inside a walled garden the brand cannot independently audit is one of the least-verified claims in the whole relationship",
              "That the retailer's ad-serving platform is technically reliable and rarely suffers outages",
              "That competing brands will not also increase their own retail media budgets next year",
              "That retail media ad prices will not rise further next year"],
            correct:0,
            why:"A reported ROAS figure only proves the campaign created NEW value if the credited sales were truly incremental; this section's own evidence (widespread advertiser difficulty measuring incrementality inside walled gardens) shows that exact assumption is the least verified part of the whole claim, making it the most load-bearing and thinnest-supported piece of the CMO's decision.",
            wrongWhy:{
              1:"Platform reliability affects whether ads run as scheduled, not whether the sales credited to them were genuinely caused by the ad.",
              2:"Competitor behavior might affect the overall market for ad inventory and pricing, but it does not determine whether THIS brand's own spend is creating incremental value.",
              3:"Future price increases are a real cost-planning risk, but they do not bear on whether the CURRENT year's reported ROAS reflects genuinely incremental sales."},
            generalizes:"Whenever a decision rests on a platform-reported performance metric the decision-maker cannot independently verify, isolate whether that metric actually measures the thing that matters (incremental causation) or only a correlated, self-reported proxy for it.",
          }}/>
          <p>The clearest evidence that this measurement gap is not a minor footnote comes from a late-2025 industry survey: 48% of retail media professionals named measurement and attribution their single biggest challenge, and 59% called improving measurement their top strategic priority for the year ahead; separately, 44% cited "walled garden" environments — platforms whose performance data cannot be checked from outside — as their second-biggest challenge, and 57% cited a lack of standardization across the roughly 200 different networks brands now have to navigate (Bain & Company/eMarketer survey, 2025). Most tellingly, 75% of advertisers named measuring TRUE incrementality, whether an ad caused a sale rather than simply getting credit for one that would have happened anyway, as their biggest measurement problem, while only 15% said they felt very or extremely effective at actually measuring it (Bain & Company/eMarketer survey, 2025).</p>
          <p>The honest section-level conclusion is that both stories are true at once. Retail media clearly creates some real, defensible value through superior targeting and measurable margin contribution at the company level. But the industry's own practitioners admit, by a roughly three-to-one margin, that they cannot yet reliably tell how much of any single campaign's reported return is genuinely new demand versus demand the brand would have captured anyway — which means the "is this value or a tax" question cannot be fully answered with the tools the industry currently has, only bounded.</p>
          <Glossary items={[
            {t:"Incrementality",d:"Whether a sale was actually caused by an ad, rather than a sale that would have happened even without it — the key, hardest-to-prove question in advertising measurement."},
            {t:"Return on ad spend (ROAS)",d:"The revenue a campaign generated divided by what was spent on it; a useful but incomplete metric, because it does not by itself prove the revenue was incremental."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(3)}>← Scale &amp; Concentration</button><button onClick={()=>jump(5)}>Next: Can It Last? →</button></div>
        </section>

        {/* ---- Q3: CAN IT LAST? ---- */}
        <section ref={refs.current[5]}>
          <div className="kicker">Research Question 3</div>
          <h2>Can this keep compounding?</h2>
          <p>The clearest sign that retail media's early hyper-growth phase is ending is the trajectory of its own aggregate growth rate. US retail media ad spending grew 53.4% in 2021, when the category was still small and easy to double; eMarketer now forecasts growth of 17.9% for 2026, a much slower rate even as the dollar totals involved keep climbing into the tens of billions (eMarketer, 2021; 2025-2026). A market does not need to keep growing at its earliest, small-base rate to remain a large and important one, but it is a different business at a $69 billion scale than it was at a $31 billion one.</p>
          <p>Several structural tailwinds still argue for continued growth. Even Amazon's own ad business, already the third-largest digital ad platform globally, is still growing at 22% a year, and Walmart's ad revenue remains a small fraction of its total sales (about 1%, versus Amazon's roughly 9%), leaving room to expand before it approaches Amazon's own level of monetization (AdExchanger, 2026). Retailers are also extending the model beyond their websites: Walmart, for instance, acquired the smart-TV maker Vizio in 2024 and has continued building out connected-TV and in-store advertising, extending "retail media" well past the search-ad format where it started (AdExchanger, 2026).</p>
          <p>The clearest structural risk to continued growth is not weakening demand but weakening trust in how the channel is sold. Retailers have increasingly used Joint Business Plans to tie minimum advertising-spend commitments to shelf placement and merchandising support, turning what is labeled as an optional ad budget into something closer to a mandatory listing fee for maintaining "preferred vendor" status (Forbes, citing Kiri Masters, 2025).</p>
          <MC onScore={onScore} q={{
            id:"rq3-c1",typeLabel:"Type C",kind:"case",
            client:"A national restaurant-supply brand's chief financial officer is evaluating whether to keep funding a Joint Business Plan commitment that requires the brand to spend a minimum $2 million a year on a grocery retailer's retail media network to keep its 'preferred vendor' shelf placement, even in a year when the brand's own campaign-level dashboards look mediocre.",
            stem:"Which assumption is most load-bearing for continuing to treat this spend as a normal marketing investment rather than, in substance, a shelf-placement fee dressed up as an ad budget, and where is the evidence in this section thinnest in supporting it?",
            options:[
              "That the retailer's ad-serving platform correctly counts impressions and clicks",
              "That competing brands do not have similar Joint Business Plan commitments of their own",
              "That declining to spend the required minimum would not itself cause the retailer to deprioritize the brand's physical shelf placement — and this is exactly where the evidence is thinnest, since this section describes retailers explicitly tying minimum ad-spend commitments to shelf and merchandising support through Joint Business Plans, meaning the 'ad' and the 'shelf fee' may not be separable in practice, whatever the invoice calls it",
              "That the brand's overall company sales will keep growing regardless of this decision"],
            correct:2,
            why:"The whole question of whether this is a real marketing investment or a disguised shelf fee turns on whether the shelf placement is genuinely contingent on the ad spend; this section's own evidence (Joint Business Plans explicitly linking the two) shows that assumption is both the most consequential and the least independently verified part of the CFO's decision.",
            wrongWhy:{
              0:"Ad-serving accuracy affects whether the CAMPAIGN performed as reported, not whether the underlying commercial relationship (spend tied to shelf placement) is really advertising or a fee.",
              1:"Other brands' arrangements do not determine whether THIS brand's own shelf placement is contingent on its own spend.",
              3:"Overall company sales growth is a separate, broader question from whether this specific spend decision is being made under a disguised-fee structure."},
            generalizes:"When a payment is labeled as one kind of expense (advertising) but appears contractually linked to a different kind of benefit (shelf access), test whether the two are actually separable before treating the payment as a normal, discretionary investment.",
          }}/>
          <MC onScore={onScore} q={{
            id:"rq3-b1",typeLabel:"Type B · Named reasoning error",
            stem:"US retail media ad spending grew 53.4% in 2021 and is forecast to grow 17.9% in 2026 (eMarketer) — a clear deceleration in growth RATE even as the dollar totals keep climbing. An investor who values an ad-technology vendor serving these networks by projecting the 2021-era 50%-plus growth rate five more years into the future is making which error?",
            options:[
              "Confusing correlation with causation — a distinct error from the one actually at work here",
              "Extrapolating a short, early-stage trend as if its growth rate were a permanent feature of the market, rather than recognizing that percentage growth rates mechanically slow as a market's base gets larger, even while the market keeps growing in absolute dollars",
              "Survivorship bias — a distinct error from the one actually at work here",
              "Base-rate neglect — a distinct error from the one actually at work here"],
            correct:1,
            why:"A market's percentage growth rate almost always slows as its base gets larger, simply because the same absolute dollar increase is a smaller percentage of a bigger number; projecting an early, small-base growth rate five years forward ignores this near-universal mechanical pattern.",
            wrongWhy:{
              0:"Correlation-vs-causation describes mistaking two co-moving trends for a causal link; the error here is projecting a rate forward without adjusting for a growing base, a different mechanism.",
              2:"Survivorship bias involves drawing conclusions only from surviving or visible cases; nothing in this scenario involves cases dropping out of a sample.",
              3:"Base-rate neglect involves ignoring a known background probability in favor of vivid specific information; the more precise, directly named error here is extrapolating an early-stage growth rate as if it were permanent."},
            generalizes:"Whenever a fast early-stage growth rate is projected forward unchanged, check whether the market's base has grown large enough that the same percentage rate would now imply an implausible absolute dollar figure.",
          }}/>
          <p>Whether these two forces, continued structural tailwinds and rising measurement or supplier-trust risk, net out to more growth or a slower correction is the most consequential open question in this section. The honest conclusion is that demand for retail media is very unlikely to collapse outright; too many retailers have built real profit streams on it, and too many brands still lack a workable alternative for reaching shoppers at the moment of purchase. But growth is very likely to keep decelerating in percentage terms, and the channel's biggest vulnerability is not running out of ad inventory to sell, but running out of goodwill from the brands whose spend it depends on, if the measurement and mandatory-spend concerns raised in this section are not addressed.</p>
          <Glossary items={[
            {t:"Joint Business Plan (JBP)",d:"A formal agreement between a retailer and a supplier covering merchandising, promotional, and (increasingly) advertising commitments, historically used mainly to plan shelf space and promotions."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(4)}>← Value or Tax?</button><button onClick={()=>jump(6)}>Next: Learning Summary →</button></div>
        </section>

        {/* ---- LEARNING SUMMARY ---- */}
        <section ref={refs.current[6]}>
          <div className="kicker">Learning Summary</div>
          <h2>What you did, and what to carry forward</h2>
          <Summary answers={answers} interp={interp}/>
          <div className="navbtns"><button onClick={()=>jump(5)}>← Can It Last?</button><button onClick={()=>jump(7)}>Next: Conclusion →</button></div>
        </section>

        {/* ---- CONCLUSION ---- */}
        <section ref={refs.current[7]}>
          <div className="kicker">Conclusion</div>
          <h2>Profitable, concentrated, and only partly measured</h2>
          <p>The central tension is not whether retail media is profitable — the evidence in this article shows clearly that it is, for the handful of retailers with enough traffic to run one well. The tension is whether that profit is being newly created or merely relocated from suppliers who have little practical choice but to pay it. Under partial success, the most likely path is continued, if decelerating, growth concentrated in the same few leaders, alongside a slow-building reckoning over measurement that neither retailers nor brands have fully resolved.</p>
          <p>For brand marketers and their finance partners, the practical implication is to stop treating a platform-reported ROAS figure as proof of incremental value, and to start budgeting for independent, cross-platform incrementality testing (holdout groups or geographic experiments that withhold ads from part of the audience to see what would have happened anyway) as a real, necessary cost of using the channel, not an optional nicety. For smaller and mid-sized retailers weighing whether to launch their own network, the implication is to size expectations against the residual slice of budget left over after the dominant leader, not against the category's headline growth rate.</p>
          <p>For retailers themselves, and for the regulators and supplier associations watching Joint Business Plan practices, the structural implication is that a mandatory or quasi-mandatory ad-spend commitment tied to shelf placement is a business-relationship risk, not just a revenue opportunity; the same concentration that gives the largest retail media networks their pricing power over brands is also what would make a coordinated supplier backlash, or regulatory interest in tying arrangements, unusually consequential if it ever materialized.</p>
          <MC onScore={onScore} q={{
            id:"concl-e1",typeLabel:"Type E · Implication + falsification",
            stem:"Given the evidence in this article — a margin gap of roughly 40 to 50 percentage points between core retail and retail media, one company holding roughly three-quarters of the US market, and an industry where 75% of advertisers say they cannot reliably measure whether credited sales are truly incremental — which real-world decision is most directly supported, paired with the observation that would most FALSIFY the article's central thesis?",
            options:[
              "Decision: every retailer should immediately shut down its retail media network until independent, cross-platform measurement exists. Falsifier: any measurement improvement at all, however small.",
              "Decision: nothing needs to change until retail media exceeds 50% of all US digital ad spending. Falsifier: retail media reaching 50% of digital ad spend.",
              "Decision: brands should treat every dollar of retail media spend as pure incremental profit and expand budgets without limit, since per-campaign ROAS dashboards already prove causal value. Falsifier: none needed, since dashboard-reported ROAS is assumed to already prove incrementality.",
              "Decision: brand marketers and retailers alike should treat retail media as a maturing, structurally important channel that still requires independent verification before scaling further, pushing for standardized, cross-platform measurement and genuine incrementality testing (holdout or geographic experiments) rather than trusting walled-garden dashboards at face value, while retailers should recognize supplier backlash over tax-like mandatory spend as a real business risk. Falsifier: if independent, holdout-based incrementality studies conducted across multiple retail media networks consistently showed that credited sales would have happened anyway without the ad — that the 'incremental value' retail media claims to create is mostly a reallocation of existing demand rather than new demand — that would be the strongest evidence against this article's 'this is a real, still-maturing value channel, not just a tax' reading"],
            correct:3,
            why:"The article's best-supported thesis holds two things at once: retail media generates real, measurable profit at the company level, and the industry's own practitioners admit they cannot yet reliably separate that profit from a mere transfer of existing demand — so the defensible decision is to keep scaling cautiously while pushing hard for independent measurement, not to halt the channel or to trust it blindly. The sharpest falsifier names the one concrete finding — rigorous, holdout-based studies showing the credited sales were not truly incremental — that would convert this article's 'real, still-maturing value' reading into the opposite conclusion.",
            wrongWhy:{
              0:"Shutting the channel down ignores this section's own evidence that retail media generates real, company-level profit contribution today, and treats any measurement improvement, however small, as a sufficient and arbitrary trigger.",
              1:"A 50%-of-digital-ad-spend threshold is arbitrary and not derived from any mechanism in this article; the measurement and concentration risks described here are already material well below that level.",
              2:"This discards the article's strongest evidence (widespread practitioner admission that incrementality is unmeasured) and offers no meaningful falsifier at all, which is itself a sign the claim is not testable."},
            generalizes:"A strong, evidence-based recommendation names the specific future observation that would force you to abandon it — and for any thesis resting on an unresolved measurement gap, the sharpest test is what happens once someone finally builds the tool to close that gap.",
          }}/>
          <p style={{marginTop:18}}>The most important unresolved question is not whether retail media can keep growing — the evidence in this article already suggests it can, for now, even as its growth rate decelerates. It is whether an advertising channel that most of its own buyers admit they cannot independently measure can keep commanding premium, tax-like budget commitments once brands finally get the tools to check.</p>
          <Sources/>
          <Glossary items={[
            {t:"Falsifier",d:"A specific, observable event that, if it happened, would prove a claim wrong; naming one in advance is what makes a claim testable rather than just asserted."},
            {t:"Holdout / geo experiment",d:"A test that withholds ads from part of an audience (or a specific geographic region) to measure what sales would have happened anyway, isolating the ad's true incremental effect."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(6)}>← Learning Summary</button><span/></div>
        </section>

      </main>
    </div>
  );
}

/* ---------- Learning Summary component -------------------------------------- */
function Summary({answers,interp}){
  const [gov,setGov]=useState(""); const [govDone,setGovDone]=useState(false);
  const [applyA,setApplyA]=useState(""); const [applyB,setApplyB]=useState("");
  const [evalOut,setEvalOut]=useState(null);

  const entries=Object.entries(answers);
  const byType={}; entries.forEach(([id,a])=>{const t=a.type;byType[t]=byType[t]||{ok:0,n:0};byType[t].n++;if(a.ok)byType[t].ok++;});
  const nCorrect=entries.filter(([,a])=>a.ok).length;

  const nums=entries.filter(([,a])=>a.type==="num"&&a.meta);
  let bias=null;
  if(nums.length){ const s=nums.map(([,a])=>(a.meta.val-a.meta.actual)/Math.abs(a.meta.actual));
    const avg=s.reduce((x,y)=>x+y,0)/s.length; bias=Math.round(avg*100); }

  const principleMap={
    wu1:"A calm aggregate growth rate can hide one dominant contributor doing most of the work — split it before trusting its size",
    wu2:"Many individually rational choices (each retailer monetizing its own traffic) can add up to an aggregate burden on a third party (brands) that no single choice intended",
    wu3:"Passing one test (a reported ROI or value ratio) does not resolve a second, structurally different risk (whether the underlying mechanism — incrementality, adoption — actually holds)",
    "bg-mc1":"When two of a company's own metrics rise together, look for the shared upstream driver before assuming one causes the other",
    "bg-a1":"Two percentages built on different denominators (GMV vs. net sales) are not directly comparable without converting to the same base first",
    "bg-d1":"Multiply a reported total by a reported leader's share to reproduce the leader's absolute figure as a consistency check",
    "rq1-a1":"Compute the absolute gap being closed each year, not just the percentage growth rates, before judging how close a race actually is",
    "rq1-b1":"A fast percentage growth rate is not the same as a large absolute level — convert both to the same unit before judging competitive significance",
    "rq1-d1":"Estimate a market's long tail by subtracting the named leaders' shares from the reported total, then sanity-check the residual per remaining participant",
    "rq2-a1":"Recompute a modeled estimate at the edges of its assumption range and report the swing — trust the direction more than the exact figure",
    "rq2-c1":"Isolate whether a reported performance metric actually measures incremental causation, or only a correlated, self-reported proxy for it",
    "rq3-c1":"When a payment is labeled one way (advertising) but contractually linked to a different benefit (shelf access), test whether the two are truly separable",
    "rq3-b1":"A fast early-stage growth rate almost always decelerates as the base grows — check whether a projected rate still implies a plausible absolute figure",
    "concl-e1":"A strong recommendation names its own falsifier — especially the one finding that would resolve today's central unmeasured gap",
  };
  const missed=entries.filter(([,a])=>!a.ok).map(([id])=>principleMap[id]).filter(Boolean);

  // Apply-It evaluator — LOCAL FALLBACK ONLY. This static, single-file artifact has no
  // secure server-side API path, so per artifact-generator.md this function is isolated
  // behind one call site (the button below) and implements an evidence-based, non-keyword
  // fallback: it checks for the PRESENCE of all four required reasoning moves (thesis,
  // load-bearing assumption, disconfirming evidence, pre-mortem) and reports which are
  // weakest or missing as an explicit gap list, rather than pattern-matching specific words
  // as "correct." If a secure API path is added later, swap this function's body for one
  // server-side call that sends the full article text plus the reader's response and asks
  // a model to judge the same four parts in 3-5 sentences — the call site below does not
  // need to change.
  function evaluateApply(a,b){
    const txt=a.toLowerCase();
    const gaps=[];
    const hasThesis=a.trim().length>25;
    const hasAssume=/assum|depend|requir|must hold|relies|hinge/.test(txt);
    const hasDis=/disconfirm|undermin|falsif|against|counter|contradic|weakest|thin/.test(txt);
    const hasPre=/pre-?mortem|if this fails|fail|12 month|most likely reason|because/.test(txt);
    if(!hasThesis) gaps.push("a clear one-sentence so-what thesis");
    if(!hasAssume) gaps.push("the single load-bearing assumption that must hold");
    if(!hasDis) gaps.push("the evidence that would most undermine your thesis");
    if(!hasPre) gaps.push("a one-line pre-mortem (if it fails in 12 months, the likely reason)");
    const climbs=/so |therefore|which means|implies|should|because/.test(txt) && /\d/.test(a);
    let verdict;
    if(gaps.length===0) verdict = climbs
      ? "All four parts are present and your reasoning climbs from observation to a quantified, decision-relevant implication. Strongest next step: pressure-test the assumption you named against the disconfirming evidence you cited."
      : "All four parts are present, but the response stays descriptive. Push it to an implication: name what a decision-maker should DO and attach a number.";
    else verdict = "Weakest or missing: "+gaps.join("; ")+". A transfer thesis needs all four — recommendation, load-bearing assumption, disconfirming evidence, and pre-mortem — before it's decision-ready.";
    const bCheck = b.trim().length<20 ? " (Also add prompt (b): name one prior article's principle that reinforces or conflicts with today's.)" : "";
    return verdict+bCheck;
  }

  return (
    <div>
      <h3>1 · Your score</h3>
      <div className="scoregrid">
        <div>Total correct</div><div className="v">{nCorrect} / {entries.length||0}</div>
        {Object.entries(byType).map(([t,o])=>(
          <React.Fragment key={t}>
            <div>{t==="mc"?"Multiple choice":"Numeric estimates"}</div><div className="v">{o.ok} / {o.n}</div>
          </React.Fragment>
        ))}
      </div>
      {bias!==null && <p style={{fontSize:14}}>Numeric bias: on average your estimates were {bias>0?"about "+bias+"% high":bias<0?"about "+Math.abs(bias)+"% low":"right on"} versus the actual values{bias<0?" — you tend to under-estimate magnitudes.":bias>0?" — you tend to over-estimate magnitudes.":"."}</p>}

      <h3>2 · Your governing insight (write before revealing ours)</h3>
      <p style={{fontSize:14}}>You saw four charts. Write the single most non-obvious insight you would defend to a skeptical retail-industry executive.</p>
      {!govDone && <>
        <textarea value={gov} onChange={e=>setGov(e.target.value)} placeholder="One or two sentences…"/>
        <button className="btn" disabled={gov.trim().length<20} onClick={()=>setGovDone(true)}>Reveal the article's three insights</button>
      </>}
      {govDone && <>
        <div className="yours"><b>Your insight:</b> {gov}</div>
        <div style={{marginTop:10}}>
          <div className="insight-card"><b>1.</b> The margin gap itself is close to the whole business model: because ad inventory is bolted onto traffic the retailer already paid to build (through years of thin-margin selling and expensive delivery logistics), each incremental ad dollar carries almost no incremental cost — so retail media is less a "new" high-margin business than a way of finally billing for shopper attention the retailer was previously giving away for free alongside every low-margin sale.</div>
          <div className="insight-card"><b>2.</b> "Retail media" sounds like a broad new industry with roughly 200 participants, but eMarketer's own numbers show it is closer to a near-monopoly in an industry's clothing: about three-quarters of all US retail media dollars flow to one company, and the next two largest by revenue (Walmart, Target) combined do not add up to an eighth of Amazon's share — most other participants are optionality bets, not real profit centers yet.</div>
          <div className="insight-card"><b>3.</b> The unresolved measurement gap is the whole ballgame: because retailers effectively grade their own ad campaigns' homework on incrementality inside walled gardens brands cannot audit, the entire "value or tax" debate hinges on a question that the industry's own practitioners admit, at roughly a three-to-one margin, they cannot yet reliably answer.</div>
        </div>
      </>}

      <h3>3 · Apply it</h3>
      <p style={{fontSize:14}}><b>(a) Transfer to a new domain.</b> A regional hospital system's core clinical business (emergency-department visits and inpatient stays) runs at a thin, sometimes negative margin once accounting for insurance reimbursement rates. The same hospital also owns a specialty pharmacy that fills prescriptions for its own patients, particularly through a federal discount drug program, and that pharmacy business runs at a far higher margin than the clinical side. Hospital leadership is deciding whether to aggressively expand the specialty pharmacy, funded largely by referrals and prescriptions generated by the low-margin clinical side, and is citing the pharmacy's strong reported margin as justification for expecting a large lift to total system profit. In four labeled parts, write: (1) a one-sentence so-what thesis about whether the projected profit lift should be expected to materialize as forecast, (2) the single load-bearing assumption that must hold for that forecast to be right, (3) the strongest evidence that would undermine it, and (4) a one-line pre-mortem: "If this program's projected profit lift fails within 12 months, the most likely reason is ___."</p>
      <textarea value={applyA} onChange={e=>setApplyA(e.target.value)} placeholder="1) Thesis…  2) Assumption…  3) Disconfirming evidence…  4) Pre-mortem…"/>
      <p style={{fontSize:14,marginTop:12}}><b>(b) Cross-link to a prior article.</b> Name one principle from an earlier article (FIFA's asset-owner-vs-risk-bearer split, GLP-1's per-unit-vs-aggregate distinction, immaculate disinflation's sacrifice-ratio sign test, private credit's measurement-artifact lesson, streaming's fixed-cost-scale lesson, AI capex's spend-vs-revenue gap, Baumol's productivity-tracks-price lesson, gene therapy's value-vs-adoption split, passive investing's aggregate-concentration-from-individually-rational-choices lesson, or AI power's rebound-effect lesson) that most reinforces or conflicts with today's value-or-tax distinction, and say why.</p>
      <textarea value={applyB} onChange={e=>setApplyB(e.target.value)} placeholder="Prior principle + how it connects…"/>
      <button className="btn" disabled={applyA.trim().length<30} onClick={()=>setEvalOut(evaluateApply(applyA,applyB))}>Evaluate my reasoning</button>
      {evalOut && <div className="authored"><div className="h">Reasoning check (local evaluator)</div>{evalOut}</div>}

      <h3>4 · Principles to revisit</h3>
      {missed.length===0
        ? <p style={{fontSize:14}}>Nothing missed so far — as you answer more questions, any you miss will appear here by the principle they test.</p>
        : <div>{missed.map((m,i)=><div key={i} className="miss"><span className="tag">revisit</span>{m}</div>)}</div>}
    </div>
  );
}

/* ---------- Sources ----------------------------------------------------------*/
function Sources(){
  return (
    <div style={{marginTop:24}}>
      <h3>Sources</h3>
      <div className="src">
        <p>• Amazon.com, Inc. Fourth Quarter 2025 earnings release (Feb. 2026) and prior-year 10-Ks/annual reports — full-year net sales by year (2021 $469.8B; 2022 $514.0B; 2023 $574.8B; 2024 $638.0B; 2025 $716.9B); advertising services revenue by year (2021 $31.2B; 2022 $37.7B; 2023 $46.9B; 2024 $56.2B; 2025 $68.6B, +22%); North America segment operating income (2024: $25.0B). <a href="https://ir.aboutamazon.com/news-release/news-release-details/2026/Amazon-com-Announces-Fourth-Quarter-Results/" target="_blank" rel="noopener">ir.aboutamazon.com</a></p>
        <p>• AdExchanger (James Hercher). "Amazon Advertising Raked In $17 Billion During Q4, And It's Still Speeding Up," Feb. 6, 2025 — 2024 full-year ad revenue ~$56B, Q4 2024 $17.3B (+18%). <a href="https://www.adexchanger.com/commerce/amazon-advertising-raked-in-17-billion-during-q4-and-its-still-speeding-up/" target="_blank" rel="noopener">adexchanger.com</a></p>
        <p>• AdExchanger (James Hercher). "Walmart's Ad Revenue Totaled $6.4 Billion In 2025 As The Ecommerce Flywheel Started To Spin," Feb. 19, 2026 — Walmart 2025 ad revenue $6.4B (+37% global, +41% domestic); Amazon 2025 GMV ~$830B (8% ad share); Walmart 2025 total sales ~$713B (~1% ad share); one-third of Walmart's Q4 profit tied to advertising and membership income. <a href="https://www.adexchanger.com/commerce/walmarts-ad-revenue-totaled-6-4-billion-in-2025-as-the-ecom-flywheel-started-to-spin/" target="_blank" rel="noopener">adexchanger.com</a></p>
        <p>• AdExchanger / Marketing Brew / Digiday coverage of Walmart's FY2024 results (Feb. 2025) — Walmart 2024 global ad revenue $4.4B, +27% year-over-year. <a href="https://www.marketingbrew.com/stories/2025/02/20/walmart-s-ad-business-grows-to-usd4-4-billion" target="_blank" rel="noopener">marketingbrew.com</a></p>
        <p>• Zacks Equity Research via Yahoo Finance. "Target's Roundel Business Is Quietly Powering Profit Growth," July 8, 2026 — Target Q1 FY2026 Roundel ad revenue $246M vs. $163M prior-year quarter; Q1 FY2026 gross margin +80 basis points to 29%; Kroger Precision Marketing profit +20%+ in Q1 FY2026; Kroger e-commerce (including media) reached profitability for the first time. <a href="https://finance.yahoo.com/markets/stocks/articles/targets-roundel-business-quietly-powering-135700207.html" target="_blank" rel="noopener">finance.yahoo.com</a></p>
        <p>• Digiday / Marketing Brew coverage of Target's FY2024 results (early 2025) — Target Roundel full-year revenue $649M (2024) vs. $522M (2023), +25%. <a href="https://digiday.com/marketing/ad-revenue-grows-at-target-as-roundel-stays-insulated-from-broader-retailer-struggles/" target="_blank" rel="noopener">digiday.com</a></p>
        <p>• The Kroger Co. "Kroger Reports Fourth Quarter and Full-Year 2024 Results, Announces Guidance for 2025," press release, March 2025 — "alternative profit businesses" (media, data services, and health) operating profit $1.35B; Media revenue +17% year-over-year, excluding the 53rd week in fiscal 2023. <a href="https://ir.kroger.com/news/news-details/2025/Kroger-Reports-Fourth-Quarter-and-Full-Year-2024-Results-Announces-Guidance-for-2025/default.aspx" target="_blank" rel="noopener">ir.kroger.com</a></p>
        <p>• Forbes (Greg Petro). "Big Retailers Find Big Profits Imitating Amazon's Ad Business," Jan. 30, 2025 — Amazon retail-media operating margin estimated at ~40% (digital commerce analyst Russ Dieringer), with some insider estimates as high as 80%, versus a 5%-6% margin in traditional retail; roughly 200 retailers now building their own retail media networks. <a href="https://www.forbes.com/sites/gregpetro/2025/01/30/big-retailers-find-big-profits-imitating-amazons-ad-business/" target="_blank" rel="noopener">forbes.com</a></p>
        <p>• Forbes (Kiri Masters). "Walmart's Push For 25% Ad Spending Highlights Retail Media's Trust Problem," Apr. 11, 2025 — "retail media tax" framing; Joint Business Plans tying minimum ad-spend commitments to shelf and merchandising support. <a href="https://www.forbes.com/sites/kirimasters/2025/04/11/walmarts-25-ad-spend-mandate-highlights-retail-medias-trust-problem/" target="_blank" rel="noopener">forbes.com</a></p>
        <p>• Food Industry Association (FMI). "FMI Report: Amid Uncertainty, Food Industry Succeeds in Offering Shoppers Value," July 15, 2025 — average net profit margin for food retailers 1.7% in 2024. <a href="https://www.fmi.org/newsroom/latest-news/view/2025/07/15/fmi-report--amid-uncertainty--food-industry-succeeds-in-offering-shoppers-value" target="_blank" rel="noopener">fmi.org</a></p>
        <p>• Walmart Inc. Form 10-K / Annual Report, fiscal year 2025 — total company operating income as a percentage of net sales: 4.4% (FY2025), up from 4.2% (FY2024). <a href="https://www.sec.gov/Archives/edgar/data/104169/000010416925000021/wmt-20250131.htm" target="_blank" rel="noopener">sec.gov</a></p>
        <p>• Target Corporation. "Target Corporation Reports Fourth Quarter and Full-Year 2024 Earnings," press release, March 4, 2025 — full-year fiscal 2024 operating income $5.6B on net sales of $106.6B (~5.2% operating margin); full-year gross margin rate 28.2% (2024) vs. 27.5% (2023). <a href="https://corporate.target.com/press/release/2025/03/target-corporation-reports-fourth-quarter-and-full-year-2024-earnings" target="_blank" rel="noopener">corporate.target.com</a></p>
        <p>• eMarketer. "Amazon's retail media ad revenues will pass $60 billion in 2025, highlighting its continued dominance," and related eMarketer company-level and market-level estimates (2025-2026) — US retail media ad revenue by company, 2024 (Amazon ~$41.95B; Walmart ~$3.72B; Target ~$1.76B); Amazon's ~75%-77% share of the total US retail media market; total US retail media ad spend ($31.49B in 2021; ~$55B in 2024; $58.79B in 2025; $69.33B forecast for 2026, +17.9%); Amazon's projected ~9% share of global digital ad revenue in 2026, third behind Google and Meta, with the three together capturing ~62% of the global total. <a href="https://www.emarketer.com/content/amazon-retail-media-ad-revenues-will-pass-60-billion-2025" target="_blank" rel="noopener">emarketer.com</a></p>
        <p>• WARC Media; GroupM (via Mediabrief and Marketing Dive coverage), 2025 — global retail media ad spend estimated at $176B-$177B in 2025 (roughly 15%-16% of total global ad spend), overtaking global television ad revenue for the first time. <a href="https://mediabrief.com/warc-global-retail-media-ad-market-2025/" target="_blank" rel="noopener">mediabrief.com</a></p>
        <p>• Bain & Company / eMarketer survey of retail media professionals and commerce-media decision-makers, October 2025 (via industry coverage) — 48% cite measurement/attribution as the top challenge; 59% call improving measurement their top strategic priority; 44% cite walled-garden environments as the second-biggest challenge; 57% cite lack of cross-platform standardization; 75% of advertisers cite measuring incrementality as their biggest measurement challenge, while only 15% feel very or extremely effective at it. <a href="https://www.retailmediabreakfastclub.com/p/retail-medias-measurement-problem-its-not-just-the-retailers" target="_blank" rel="noopener">retailmediabreakfastclub.com</a></p>
      </div>
      <p style={{fontSize:12.5,color:"#777",marginTop:8}}>Note on estimates: Chart 3's "All others" segment and Chart 4's entire bridge are this article's own ESTIMATEs, built by stated arithmetic from cited FACTs (eMarketer's company-level and share figures; Amazon's reported North America segment operating income; the analyst-cited 40%-50% retail-media margin range) — not figures directly reported by Amazon, Walmart, Target, or eMarketer themselves. The 9.6% and similar inline ratios computed in the prose (for example, ad revenue as a share of total net sales) are likewise this article's own arithmetic from two cited FACTs, not separately reported statistics.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
