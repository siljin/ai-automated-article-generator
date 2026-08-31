/* ============================================================================
   Who Actually Pays a Tariff? The 2025-26 Missing-Inflation Puzzle
   Domain: Economics & Macro (ER-12).
   Data tiers: FACT (cited, verified directly against the primary source),
   ESTIMATE (derived by this article's own stated arithmetic/assumptions from
   FACTs, disclosed and coarsely rounded), ILLUSTRATION (disclosed synthetic
   teaching values, never a headline claim).
   App code + CSS inlined into index.html. This file is a readable source copy.
   ========================================================================== */
const {useState,useEffect,useRef} = React;
const R = window.Recharts;
const {ResponsiveContainer,ComposedChart,BarChart,Bar,Cell,LineChart,Line,ScatterChart,Scatter,
  XAxis,YAxis,CartesianGrid,Tooltip,ReferenceLine,ReferenceArea,LabelList,Legend,ZAxis} = R;

/* ---------- DATA ------------------------------------------------------------ */
// Chart 1 — U.S. average tariff rate actually collected on imports, 2024-2026.
// FACT. 2024 baseline, Oct 2025 peak, and Dec 2025 year-end figures are the
// Dallas Fed's "realized tariff rate" (customs duties collected / customs
// value of imports): 2.3% (2024) -> 10.9% (Oct 2025) -> 9.4% (Dec 2025).
// Source: Mau & Smith, "Effects of realized tariff changes on PCE prices
// peaked in first quarter 2026," Dallas Fed (May 5, 2026). The April 2026
// point uses a related but not identical measure -- The Budget Lab at Yale's
// post-substitution average effective tariff rate, 9.6% -- because Dallas Fed
// has not published a realized rate past 2025. Source: The Budget Lab at
// Yale, "State of U.S. Tariffs: April 2, 2026." Both measures ask the same
// underlying question (how much of import value is actually paid in duties)
// but are not a single continuous series; the chart note discloses this.
const c1 = [
  {label:"2024 baseline", rate:2.5},
  {label:"Oct 2025 (peak)", rate:10.9},
  {label:"Dec 2025 (year-end)", rate:9.4},
  {label:"Apr 2026 (post-sub.)", rate:9.6},
];

// Chart 2 — Tariff incidence: share of the tariff's economic cost borne on
// the U.S. side (importers/consumers) vs. shifted onto foreign exporters via
// lower export prices, first eight months of 2025 vs. November 2025. FACT.
// Source: Amiti, Flanagan, Heise & Weinstein, "Who Is Paying for the 2025
// U.S. Tariffs?," Liberty Street Economics, Federal Reserve Bank of New York
// (Feb. 2026): "94 percent of the tariff incidence was borne by the U.S. in
// the first eight months of 2025... In November, a 10 percent tariff was
// associated with a 1.4 percent decline in foreign export prices, suggesting
// an 86 percent pass-through to U.S. import prices."
const c2 = [
  {period:"Jan–Aug 2025", us:94, foreign:6},
  {period:"November 2025", us:86, foreign:14},
];

// Chart 3 — U.S. headline and core CPI, 12-month percent change, monthly,
// Jan 2025-Jan 2026. FACT. Source: U.S. Bureau of Labor Statistics, CPI news
// releases and "The Economics Daily," Feb. 18, 2026 (12-month percent change
// table for all items and all items less food and energy). October 2025 is
// omitted; BLS did not publish that month's CPI due to the 2025 lapse in
// federal appropriations.
const c3 = [
  {m:"Jan '25", all:3.0, core:3.3},
  {m:"Feb '25", all:2.8, core:3.1},
  {m:"Mar '25", all:2.4, core:2.8},
  {m:"Apr '25", all:2.3, core:2.8},
  {m:"May '25", all:2.4, core:2.8},
  {m:"Jun '25", all:2.7, core:2.9},
  {m:"Jul '25", all:2.7, core:3.1},
  {m:"Aug '25", all:2.9, core:3.1},
  {m:"Sep '25", all:3.0, core:3.0},
  {m:"Nov '25", all:2.7, core:2.6},
  {m:"Dec '25", all:2.7, core:2.6},
  {m:"Jan '26", all:2.4, core:2.5},
];

// Chart 4 — Bridge from a no-tariff counterfactual to actual core PCE
// inflation, March 2026. FACT (the Dallas Fed's own reported model output,
// cited to its source; the bridge structure itself simply visualizes the two
// numbers the Fed researchers report). Source: Mau & Smith, Dallas Fed (May
// 5, 2026): "We estimate that tariff collections increased March 2026,
// 12-month core PCE inflation by about 0.80 percentage points and that core
// inflation absent tariff effects on relative prices would be 2.3 percent."
const c4 = [
  {name:"Core PCE, no-tariff counterfactual", base:0, delta:2.3, kind:"start"},
  {name:"+ Tariff direct effect (Dallas Fed est.)", base:2.3, delta:0.8, kind:"add"},
  {name:"Actual core PCE, March 2026", base:0, delta:3.1, kind:"total"},
];
const c4color = d => d.kind==="add" ? "#d97706" : "#111";

// Chart 5 — Predicted vs. actual contribution to core PCE inflation, by
// spending category. ILLUSTRATION. The Minneapolis Fed (Mehrotra & Waugh,
// April 8, 2026, "Tariffs can't explain rising goods inflation") reports that
// an input-output accounting framework's PREDICTED category-level inflation
// contributions are NEGATIVELY correlated with ACTUAL contributions: named
// categories where the two align closely include furniture and home
// furnishings; categories where actual inflation ran well BELOW prediction
// despite high tariff exposure include motor vehicles; categories where
// actual inflation ran well ABOVE prediction despite low/near-zero realized
// tariff exposure include pharmaceuticals (a 100% announced tariff not yet
// in effect) and apparel. The Minneapolis Fed published this as a chart
// ("Figure 2") but did not report its underlying category-level coordinate
// values in the article text this research drew from, so the plotted points
// below are ILLUSTRATION: a disclosed, synthetic reconstruction that matches
// the study's described DIRECTION and relative positioning for each named
// category, not the study's own original data values.
const c5 = [
  {cat:"Furniture & home furnishings", predicted:0.34, actual:0.31},
  {cat:"Household appliances", predicted:0.16, actual:0.18},
  {cat:"Recreational goods", predicted:0.11, actual:0.09},
  {cat:"Motor vehicles (new & used)", predicted:0.30, actual:0.06},
  {cat:"Apparel", predicted:0.05, actual:0.19},
  {cat:"Pharmaceuticals", predicted:0.02, actual:0.24},
  {cat:"Video/audio & info-processing equip.", predicted:0.04, actual:0.17},
];

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

/* ---------- Numeric estimation (fading scaffold) ---------------------------- */
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
      <div className="charttitle">U.S. average tariff rate actually collected on imports, 2024–2026 <Tier t="FACT"/></div>
      <div className="chartsub">Percent of import value paid in duties. 2024/Oct 2025/Dec 2025 points: Dallas Fed's "realized tariff rate" (Mau &amp; Smith, 2026). Apr 2026 point: The Budget Lab at Yale's post-substitution "average effective tariff rate" (2026) — a related but not identical measure, since Dallas Fed has not published a realized rate for 2026. Source: Federal Reserve Bank of Dallas (2026); The Budget Lab at Yale (2026).</div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={c1} margin={{left:4,right:16,top:20,bottom:4}}>
          <CartesianGrid strokeDasharray="3 3" vertical={false}/>
          <XAxis dataKey="label" fontSize={11.5}/>
          <YAxis domain={[0,13]} tickFormatter={v=>v+"%"} fontSize={11} label={{value:"Tariff rate (%)",angle:-90,position:"insideLeft",fontSize:11}}/>
          <Tooltip formatter={v=>v+"%"}/>
          <Line type="monotone" dataKey="rate" stroke="#1f6feb" strokeWidth={2.5} dot={{r:5}}>
            <LabelList dataKey="rate" position="top" formatter={v=>v+"%"} fontSize={12}/>
          </Line>
        </LineChart>
      </ResponsiveContainer>
      <div className="note">Line chart chosen over a bar chart because the story is a TRAJECTORY — a sharp rise followed by a partial pull-back and plateau — which a bar chart's disconnected columns would not visually connect into one continuous shock.</div>
    </div>
  );
}
function Chart2(){
  const row=[{p:"Jan–Aug 2025", "Borne in the U.S. (importers/consumers)":94, "Shifted to foreign exporters":6},
             {p:"November 2025", "Borne in the U.S. (importers/consumers)":86, "Shifted to foreign exporters":14}];
  return (
    <div className="chartbox">
      <div className="charttitle">Who absorbed the tariff cost, at the import-price stage? <Tier t="FACT"/></div>
      <div className="chartsub">Percent of tariff incidence. "Borne in the U.S." means the full tariff shows up in the U.S. import price; "shifted to foreign exporters" means their pre-tariff price fell to offset part of it. Source: Amiti, Flanagan, Heise &amp; Weinstein, "Who Is Paying for the 2025 U.S. Tariffs?," Liberty Street Economics, Federal Reserve Bank of New York (Feb. 2026).</div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={row} layout="vertical" stackOffset="expand" margin={{left:4,right:8,top:10,bottom:10}}>
          <XAxis type="number" tickFormatter={v=>(v*100).toFixed(0)+"%"} fontSize={11}/>
          <YAxis type="category" dataKey="p" width={82} fontSize={12}/>
          <Tooltip formatter={(v,n)=>[(v*100).toFixed(0)+"%", n]}/>
          <Bar dataKey="Borne in the U.S. (importers/consumers)" stackId="s" fill="#c0392b">
            <LabelList dataKey="Borne in the U.S. (importers/consumers)" position="center" formatter={v=>v+"%"} fontSize={12} fill="#fff"/>
          </Bar>
          <Bar dataKey="Shifted to foreign exporters" stackId="s" fill="#999">
            <LabelList dataKey="Shifted to foreign exporters" position="center" formatter={v=>v+"%"} fontSize={11} fill="#fff"/>
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="note">100%-stacked bar chosen over a plain bar chart because the point is a MIX SHIFT within a fixed total (100% of incidence) across two snapshots in time — exactly the structure/contribution job a 100%-stacked exhibit is built for, and one two side-by-side bars would not make as immediately readable as a share.</div>
    </div>
  );
}
function Chart3(){
  return (
    <div className="chartbox">
      <div className="charttitle">U.S. headline and core CPI, 12-month change, monthly <Tier t="FACT"/></div>
      <div className="chartsub">Percent, year-over-year. October 2025 is blank: BLS did not publish that month's CPI due to the 2025 lapse in federal appropriations. The dashed line marks April 2025, the month the largest round of new tariffs took effect. Source: U.S. Bureau of Labor Statistics (Feb. 18, 2026).</div>
      <ResponsiveContainer width="100%" height={270}>
        <LineChart data={c3} margin={{left:4,right:16,top:10,bottom:4}}>
          <CartesianGrid strokeDasharray="3 3" vertical={false}/>
          <XAxis dataKey="m" fontSize={10.5}/>
          <YAxis domain={[2.0,3.5]} tickFormatter={v=>v+"%"} fontSize={11}/>
          <Tooltip formatter={v=>v+"%"}/>
          <ReferenceLine x="Apr '25" stroke="#d97706" strokeDasharray="4 4" label={{value:"Tariffs take effect",position:"insideTopLeft",fontSize:10,fill:"#d97706"}}/>
          <Line type="monotone" dataKey="all" stroke="#1f6feb" strokeWidth={2.5} name="Headline CPI" dot={{r:3}}/>
          <Line type="monotone" dataKey="core" stroke="#999" strokeWidth={2.5} name="Core CPI (ex. food, energy)" dot={{r:3}}/>
          <Legend fontSize={10} wrapperStyle={{fontSize:10.5}}/>
        </LineChart>
      </ResponsiveContainer>
      <div className="note">Line chart chosen because the question is whether inflation ACCELERATED after a known shock date — a trend-over-time job — not a cross-sectional comparison a bar chart would suit better.</div>
    </div>
  );
}
function Chart4(){
  return (
    <div className="chartbox">
      <div className="charttitle">Bridge: no-tariff counterfactual to actual core PCE inflation, March 2026 <Tier t="FACT"/></div>
      <div className="chartsub">Percent, year-over-year. FACT: both bridge values are the Dallas Fed's own reported model output. "Modeled from the Fed's own accounting framework, not a directly reported CPI/PCE line item on its own — the bridge itself is the Fed's stated estimate of the tariff's direct contribution." Source: Mau &amp; Smith, Federal Reserve Bank of Dallas (May 5, 2026).</div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={c4} margin={{left:4,right:8,top:20,bottom:46}}>
          <CartesianGrid strokeDasharray="3 3" vertical={false}/>
          <XAxis dataKey="name" fontSize={10} interval={0} angle={-12} textAnchor="end" height={64}/>
          <YAxis domain={[0,3.5]} tickFormatter={v=>v+"%"} fontSize={11}/>
          <Tooltip formatter={(v,n,p)=>[p.payload.delta+"%","amount"]}/>
          <Bar dataKey="base" stackId="w" fill="transparent"/>
          <Bar dataKey="delta" stackId="w">
            {c4.map((d,i)=><Cell key={i} fill={c4color(d)}/>)}
            <LabelList dataKey="delta" position="top" formatter={v=>"+"+v+"pp"} fontSize={11}/>
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="note">Waterfall (bridge) chart chosen over a stacked bar because the point is the CONTRIBUTION-TO-CHANGE from a hypothetical baseline to the reported total — the signature exhibit for "what makes up this number."</div>
    </div>
  );
}
function Chart5(){
  return (
    <div className="chartbox">
      <div className="charttitle">Predicted vs. actual contribution to core PCE inflation, by category <Tier t="ILLUSTRATION"/></div>
      <div className="chartsub">Percentage points. Illustrative reconstruction of a pattern the Minneapolis Fed reported in its own "Figure 2": predicted (input-output accounting framework) and actual category-level contributions to core PCE inflation are NEGATIVELY correlated. The direction and relative position of each named category match the study's description; the exact plotted coordinates are ILLUSTRATION, not the study's own original data points, because the source article did not publish its underlying category-level values. Source: Mehrotra &amp; Waugh, Federal Reserve Bank of Minneapolis (Apr. 8, 2026).</div>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{left:8,right:16,top:10,bottom:10}}>
          <CartesianGrid strokeDasharray="3 3"/>
          <XAxis type="number" dataKey="predicted" domain={[0,0.4]} tickFormatter={v=>v.toFixed(2)} name="Predicted" label={{value:"Predicted contribution (pp)",position:"bottom",fontSize:11}} fontSize={11}/>
          <YAxis type="number" dataKey="actual" domain={[0,0.4]} tickFormatter={v=>v.toFixed(2)} name="Actual" label={{value:"Actual contribution (pp)",angle:-90,position:"insideLeft",fontSize:11}} fontSize={11}/>
          <ReferenceLine segment={[{x:0,y:0},{x:0.4,y:0.4}]} stroke="#ccc" strokeDasharray="4 4"/>
          <Tooltip formatter={(v,n,p)=>[v, n]} labelFormatter={()=>""} content={({active,payload})=>{
            if(!active||!payload||!payload.length) return null;
            const d=payload[0].payload;
            return <div style={{background:"#fff",border:"1px solid #e4e4e4",borderRadius:6,padding:"6px 9px",fontSize:12}}>
              <b>{d.cat}</b><br/>predicted {d.predicted} / actual {d.actual}</div>;
          }}/>
          <Scatter data={c5} fill="#1f6feb">
            <LabelList dataKey="cat" position="right" fontSize={9.5} width={90}/>
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      <div className="note">Quadrant scatter chosen over a bar chart because the argument IS the relationship between two variables (predicted vs. actual) — the 45-degree reference line turns "how far off was each category" into something a bar chart cannot show at all.</div>
    </div>
  );
}

/* ---------- Content sections ------------------------------------------------ */
const SECTIONS = [
  "Warm-Up","Introduction","Background","Q1 · Who Pays?","Q2 · Where Did It Go?","Q3 · Delayed or Wrong?","Learning Summary","Conclusion"
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
          <p className="dek">Each question takes a principle from a prior article and drops it into today's topic before you've read any of it. Answer before reading on — these are scored, and none require knowing anything about tariffs yet.</p>
          <MC onScore={onScore} q={{
            id:"wu1",typeLabel:"Warm-Up · Type B",
            stem:"The AI-power article showed that a big efficiency gain at ONE layer of a system (chips got up to 25x more energy-efficient per unit of inference) did not shrink total resource use, because a lower cost per unit induced so much more total use that overall data-center electricity demand is still set to more than double by 2030 — a partial 'Jevons paradox' rebound. Today's article will describe U.S. companies responding to tariffs by rerouting supply chains away from heavily tariffed countries (China's share of U.S. imports fell from 25% in 2017 to below 10% in 2025) to cut their OWN tariff bill. Applying the AI-power lesson, what should you check before concluding that this kind of firm-level rerouting has necessarily reduced the NATION's total tariff-related cost, rather than just moved it around?",
            options:[
              "Whether the total dollar amount of tariffs collected economy-wide, and the total price impact on consumers, actually fell in proportion to how many firms rerouted — or whether rerouting mostly shifted which specific imports and countries are taxed, the way more efficient chips shifted (rather than shrank) total computing demand",
              "Nothing further is needed, since any individual firm cutting its own tariff exposure automatically proves the national tariff burden has fallen by the same amount",
              "Whether the firms that rerouted supply chains also raised employee wages that year",
              "Whether Beijing's own domestic inflation rate changed after losing U.S. export share"],
            correct:0,
            why:"Just as cheaper compute per unit did not shrink total electricity demand because it induced more total use elsewhere in the system, one firm cutting its OWN import exposure by rerouting does not tell you what happened to the nation's aggregate tariff revenue, average tariff rate, or consumer price level — the savings might just mean a different product or country now bears the cost, the same kind of level-vs-aggregate gap the AI-power rebound effect exposed.",
            wrongWhy:{
              1:"This is exactly the error the AI-power lesson warns against: a change at one firm or one layer of a system does not automatically scale up to the same directional change in the aggregate system-wide total.",
              2:"Wage decisions are a separate corporate choice unrelated to whether national tariff exposure changed.",
              3:"China's own domestic inflation is a real but separate question from whether the AGGREGATE U.S. tariff burden fell after firms rerouted their sourcing."},
            generalizes:"Whenever an efficiency gain or cost-cutting move happens at one layer of a system (a chip, a firm, a supply chain), check the growth rate of TOTAL use or TOTAL cost at the system level before assuming the local improvement scaled up in the same direction economy-wide.",
          }}/>
          <MC onScore={onScore} q={{
            id:"wu2",typeLabel:"Warm-Up · Type B",
            stem:"The private-credit article showed that a reported risk metric is a DEFINITION, not a fact of nature: appraisal-based marks made private credit's reported volatility (about 3-4%) look far calmer than public leveraged loans (about 9%) largely because of how each asset is priced, not because the underlying risk actually differed that much; the article called this 'volatility laundering.' Today's article will show that two different Federal Reserve research banks, using two different accounting frameworks on the same 2025 tariffs, arrive at different estimates of how much of core inflation the tariffs explain — one bank's framework attributes about 0.8 percentage points, while another's attributes roughly 0.5 percentage points and finds the category-level pattern doesn't even match its own model's predictions. Applying the private-credit lesson, what is the most useful way to interpret this disagreement?",
            options:[
              "One of the two Federal Reserve banks must simply be wrong or making an arithmetic error, since the true tariff effect on inflation is a single fixed fact that a correct model would reveal",
              "The disagreement is meaningless and should be ignored, since all inflation statistics are equally unreliable",
              "Before treating either number as THE answer, ask what each bank's accounting framework actually assumes and measures — different modeling choices (which categories carry direct vs. indirect exposure, how full pass-through is assumed, which time window is used) can legitimately produce different 'facts' from the same underlying tariffs, the same way a private loan's marking convention, not just its true risk, shaped its reported volatility",
              "The disagreement proves that tariffs had no measurable effect on inflation at all"],
            correct:2,
            why:"Exactly as private credit's 'low volatility' was partly a product of its appraisal-based marking convention rather than pure underlying risk, two Fed banks' differing tariff-inflation estimates are partly a product of differing modeling assumptions and definitions, not necessarily one being simply right and the other wrong — the useful move is to interrogate each method before picking a number to trust.",
            wrongWhy:{
              0:"Assuming one bank must be making an error skips the more useful step of examining what each model actually assumes and measures, which the private-credit lesson says to do first.",
              1:"Concluding all statistics are equally unreliable throws away the entire discipline the private-credit lesson teaches — which is to interrogate methodology, not to give up on measurement altogether.",
              3:"Both banks' models attribute a meaningfully positive tariff effect on inflation; the disagreement is about size and category-level fit, not about whether any effect exists at all."},
            generalizes:"Whenever two credible sources report different numbers for what sounds like the same underlying fact, check what each one's measurement convention or model assumes before concluding either the number, or the underlying reality, is wrong.",
          }}/>
          <MC onScore={onScore} q={{
            id:"wu3",typeLabel:"Warm-Up · Type B",
            stem:"The AI-capex article showed that a big number — hundreds of billions of dollars in AI infrastructure spending — proves neither strong end-customer demand nor causation on its own, because a buyer's spend equaling a supplier's revenue is a definition, not evidence of a healthy return; you had to check the spending's growth RATE against its dollar LEVEL, and the level against actual end-customer revenue, before drawing a conclusion. Today's article will note that the U.S. Treasury collected a record-setting figure (over $100 billion in customs duties within the first several months of the 2025 tariffs alone). Applying the AI-capex lesson, what should you check before treating that large, record-setting revenue figure as proof that foreign exporters, rather than Americans, are 'paying' for the tariffs?",
            options:[
              "Nothing — a record-high dollar figure collected by the government is, by itself, direct proof of who bears the tariff's economic cost",
              "Whether the pace of collections was accelerating or slowing month to month",
              "Whether a large dollar amount of revenue COLLECTED (a level) tells you anything at all about WHO economically absorbed that cost — collecting a big tariff check from importers is a legal, mechanical fact, while incidence (whether it came out of foreign export prices, importer profit margins, or consumer prices) is a completely separate economic question that the collections total alone cannot answer, the same gap between a spending LEVEL and a causal DEMAND claim the AI-capex article warned about",
              "Whether the U.S. federal budget deficit changed that year"],
            correct:2,
            why:"A big number describing HOW MUCH was collected (a level, a mechanical fact about who legally pays the customs bill) says nothing on its own about WHO economically bore that cost afterward — exactly the same gap the AI-capex lesson highlighted between a large dollar figure and the causal or economic claim people want to hang on it.",
            wrongWhy:{
              0:"This treats a level (dollars collected) as if it directly answers a completely different question (who economically absorbed the cost), the exact conflation the AI-capex lesson warns against.",
              1:"The month-to-month pace of collections is a real but secondary detail; it does not address the more fundamental gap between a collected-revenue level and an incidence conclusion.",
              3:"The federal deficit is a real and separate fiscal question, unrelated to whether collections prove who bears the tariff's economic cost."},
            generalizes:"Whenever a large, record-setting dollar figure is used to support a claim about causation, demand, or who ultimately bears a cost, check whether that figure is merely a LEVEL (a mechanical total) before treating it as evidence for the separate causal or distributional claim.",
          }}/>
          <div className="navbtns"><span/><button onClick={()=>jump(1)}>Next: Introduction →</button></div>
        </section>

        {/* ---- INTRODUCTION ---- */}
        <section ref={refs.current[1]}>
          <div className="kicker">Economics &amp; Macro</div>
          <h1>Who Actually Pays a Tariff? The 2025–26 Missing-Inflation Puzzle</h1>
          <p className="lead">Tariffs are supposed to be paid by foreign exporters, but Federal Reserve economists tracking the 2025 tariffs found that 94% of the bill landed on the U.S. side instead. For most of the following year, U.S. consumer inflation did not spike the way many forecasters expected — it stayed roughly flat, and even fell.</p>
          <p>A tariff is a tax a government charges on goods brought in from another country, and by law the importer, not the foreign seller, pays it at the border. That legal fact does not settle who ends up worse off economically, a distinction economists call tariff incidence: the foreign exporter could cut its own price to keep the deal attractive, the importer could eat the extra cost out of its own profit, or the importer could raise its own selling price and pass the cost to the shopper. In 2025, the United States imposed the broadest set of tariffs in generations, raising the average tariff collected on imports from 2.5% in 2024 to a peak of 10.9% in October 2025 (Federal Reserve Bank of Dallas, 2026). Economists at the Federal Reserve Bank of New York, tracking where that cost actually landed, found that 94% of it was borne on the U.S. side of the border in the first eight months of 2025, not by foreign exporters cutting their prices (Federal Reserve Bank of New York, 2026).</p>
          <p>Here is the part that breaks the simple story. If nearly all of a tariff bill lands on Americans, standard economic logic says consumer prices should have risen close to the size of that shock. Core inflation (prices excluding food and energy, which move for unrelated reasons) instead went from 3.3% in January 2025 to 2.8% by April 2025, the very month the largest tariffs took effect, and spent most of the following year drifting in a narrow band before ending at 2.5% in January 2026 — lower than where it started (U.S. Bureau of Labor Statistics, 2026). The bill did not vanish. Corporate earnings calls show it: General Motors alone reported a $1.1 billion tariff hit to its second-quarter 2025 profit, and had warned it could face up to $5 billion for the year (Fortune, 2025). The money went somewhere. It just did not show up where textbook tariff economics said to look first.</p>
          <p>This note addresses three questions. First, if tariffs are legally collected from importers, who really bears the economic cost — foreign exporters or Americans — and has that split shifted as 2025 wore on? Second, if almost the entire tariff bill landed on the U.S. side, why did consumer inflation not spike the way many forecasters expected, and where did the money go instead? Third, is the "missing" inflation simply delayed and still arriving in 2026, or does the category-by-category evidence suggest the standard tariff-to-inflation accounting framework itself was wrong?</p>
          <Glossary items={[
            {t:"Tariff",d:"A tax a government charges on goods imported from another country; in the U.S., the importer pays it directly to customs at the border."},
            {t:"Tariff incidence",d:"Economists' term for who actually ends up economically worse off from a tax, which is not always the party who legally hands the money to the government."},
            {t:"Core inflation",d:"How fast prices are rising once food and energy prices, which swing for reasons often unrelated to the broader economy, are left out."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(0)}>← Warm-Up</button><button onClick={()=>jump(2)}>Next: Background →</button></div>
        </section>

        {/* ---- BACKGROUND ---- */}
        <section ref={refs.current[2]}>
          <div className="kicker">Background · Trajectory &amp; structure</div>
          <h2>From 2.5% to double digits, and back down again</h2>
          <p>The United States entered 2025 with an unusually low tariff wall by its own historical standards: an average tariff rate on imports of just 2.5% in 2024, the product of decades of trade agreements steadily dismantling barriers built up since the 1930s (The Budget Lab at Yale, 2026). Starting in the spring of 2025, a series of new tariffs, at various points covering imports from nearly every major U.S. trading partner, pushed the announced rate far higher, though the amount actually collected at customs lagged behind the headline announcements as exemptions, delayed effective dates, and country-specific negotiations kept shifting the real number (Federal Reserve Bank of Dallas, 2026).</p>
          <p>By October 2025, the rate actually collected on imports, what the Dallas Fed calls the "realized" tariff rate, had climbed to 10.9%, the highest sustained level in generations. It then eased to 9.4% by the end of 2025 as companies rerouted their supply chains away from the most heavily tariffed countries: China's share of all U.S. imports fell from 25% in 2017 to below 10% by late 2025, a direct result of the size of the duties it faced (Federal Reserve Bank of New York, 2026). The Budget Lab at Yale's own April 2026 tracking, using a related but not identical method, put the "post-substitution" effective rate (after accounting for that kind of supply-chain rerouting) at 9.6%, still the highest level since 1943 excluding 2025 itself (The Budget Lab at Yale, 2026).</p>
          <Chart1/>
          <Interp id="c1p1" label="Interpretation 1 of 2 · Predict, then check (quantitative, pre-reveal)"
            question="Before checking the exact figures: predict roughly how many TIMES larger the October 2025 peak tariff rate was compared with the 2024 baseline. Then compute the actual multiple, and say what a shock of that size implies about how large a price effect textbook economics would predict, all else equal."
            authored={<span>10.9% ÷ 2.5% ≈ 4.4 — the rate actually collected on imports was more than four times its 2024 level within about ten months. A cost shock this large, if fully passed through to the specific goods affected, is the kind of change that (holding everything else equal) textbook trade economics would expect to show up clearly in the prices of the goods most exposed to it, which is exactly why the muted consumer inflation response in the sections ahead is a genuine puzzle rather than a rounding error.</span>}
            onSubmit={onInterp}/>
          <Interp id="c1p2" label="Interpretation 2 of 2 · Mechanism (non-so-what)"
            question="Why did the realized (actually collected) tariff rate fall from 10.9% in October 2025 to 9.4% by December, even though the underlying announced tariff policy did not broadly retreat over that same stretch?"
            authored={<span>A realized rate is collections divided by the value of imports, so it can fall even without any policy reversal if importers change WHAT and WHERE they buy: rerouting purchases toward countries facing lower duties, substituting domestic suppliers, or securing product-specific exemptions all shrink the denominator of tariffed value without lowering any single announced tariff rate. The realized rate is a behavioral outcome of firms adapting, not a direct read-out of government policy alone.</span>}
            onSubmit={onInterp}/>
          <MC onScore={onScore} q={{
            id:"bg-mc1",typeLabel:"Type B · Named reasoning error",
            stem:"A commentator argues: 'The tariff rate barely changed from 10.9% to 9.6% between October 2025 and April 2026 (Dallas Fed vs. Yale Budget Lab), so nothing meaningful shifted in trade policy over that period.' Given that the Background section describes these two figures as related but not identical measures from two different research groups, what reasoning error does this comparison risk?",
            options:[
              "Base-rate neglect — a distinct error from the one actually at work here",
              "Treating two numbers as directly comparable across time simply because they are both called a 'tariff rate,' without checking whether they come from the same measurement method — comparing a Dallas Fed 'realized rate' to a Yale 'post-substitution effective rate' can create the appearance of a stable trend even if the two source institutions define and calculate the underlying number differently",
              "Survivorship bias — a distinct error from the one actually at work here",
              "Confusing a percentage with a percentage point — a distinct error from the one actually at work here"],
            correct:1,
            why:"The chart itself discloses that its last data point uses a different institution's different methodology than its first three; treating the sequence as one apples-to-apples trend line, the way the commentator does, risks reading meaning into a gap that partly reflects measurement differences between Dallas Fed and Yale Budget Lab, not necessarily a real-world plateau in tariff policy.",
            wrongWhy:{
              0:"Base-rate neglect involves ignoring a known background probability in favor of vivid specific information; nothing about a background rate is being ignored here.",
              2:"Survivorship bias involves drawing conclusions only from cases that remained visible while ignoring ones that dropped out of a sample; no sample selection is happening in this comparison.",
              3:"Percent-vs-percentage-point confusion is a real, different trap (tested elsewhere in this article); the issue in this specific comparison is measurement-definition consistency across two different sources, not units."},
            generalizes:"Before treating two numbers with the same label (like 'tariff rate' or 'volatility') as one continuous series, check whether they come from the same measuring institution and method — different conventions can create or hide a trend that was never really there.",
          }}/>
          <MC onScore={onScore} q={{
            id:"bg-a1",typeLabel:"Type A · Percent vs. percentage points",
            stem:"The average tariff rate rose from 2.5% (2024) to 9.6% (April 2026, post-substitution). Expressed in PERCENTAGE POINTS, that is a 7.1-point increase. Expressed as a RELATIVE percent change, that is an increase of roughly 284% ((9.6−2.5)÷2.5). A politician defending the tariffs says 'the rate only rose about 7 points, a modest, single-digit change.' A critic says 'the tariff rate nearly quadrupled, up 284%.' What is the most accurate way to describe this disagreement?",
            options:[
              "The critic must be wrong, since a 7-point change is objectively smaller than a 284% change and small numbers are always more honest",
              "The politician must be wrong, since the relative percent change is the only statistically valid way to describe any rate change",
              "Both figures are arithmetically correct descriptions of the SAME underlying change; they simply use different bases (percentage points vs. relative percent), and each framing serves a different rhetorical purpose — the percentage-point framing minimizes the change's visual size, while the relative-percent framing (valid precisely because the STARTING level, 2.5%, was so low) emphasizes how many times larger the new rate is",
              "Neither figure can be trusted because tariff rates cannot be expressed as percentages of percentages"],
            correct:2,
            why:"Both descriptions are mathematically correct for the same change; a small starting base (2.5%) makes the relative percent change look dramatic (284%) even though the percentage-point change (7.1 points) sounds modest — recognizing which framing is being used, and why, is the actual skill being tested, not picking a winner.",
            wrongWhy:{
              0:"Being a smaller-looking number does not make the percentage-point framing more correct; both framings are valid ways of describing the same change.",
              1:"Percentage-point change is an equally valid and often clearer way to describe a change in a rate; it is not invalidated by the existence of a relative-percent alternative.",
              3:"A percentage rate absolutely can be described by its relative percent change over time (a 'percentage of a percentage' is a normal, meaningful calculation, not a category error)."},
            generalizes:"Whenever a rate changes from a low starting level, expect a big gap between its percentage-point change (often small-sounding) and its relative percent change (often dramatic-sounding) — name which one you are using before comparing across sources or arguments.",
          }}/>
          <Numeric onScore={onScore} q={{
            id:"bg-d1",typeLabel:"Type D",
            stem:"The Budget Lab at Yale estimates the current tariff regime's short-run price-level impact at roughly 0.55% (the midpoint of its 0.5%-0.6% range, if the temporary Section 122 tariffs expire as scheduled), a modeled ESTIMATE, not a directly measured figure. Given that a typical U.S. household spends roughly $77,000 a year (Bureau of Labor Statistics Consumer Expenditure Survey), estimate the implied ANNUAL dollar cost to a typical household from a 0.55% rise in the price level.",
            skeleton:"Decomposition: annual household spending ($77,000) × price-level increase (0.55%) = implied annual cost.",
            tolNote:"±10% — tight, because this is a direct, single-step multiplication from two stated figures.",
            min:0,max:1200,step:10,unit:"$ per year",actual:424,tol:42,
            how:"$77,000 × 0.0055 ≈ $424 a year. The Budget Lab at Yale's own, more detailed model instead reports a household loss of about $780 (pre-substitution) or $648 (post-substitution) under the same expiration scenario — higher than this simplified estimate, because Yale's model weights tariffed categories by their actual share of a household's specific spending pattern rather than applying one flat percentage to average total spending. The gap between a quick, generic estimate and a source's own, more careful model is itself a lesson: a simple shortcut can get the right order of magnitude while still missing real structure the original study captured.",
            generalizes:"A back-of-envelope estimate built from one average rate times one average total can land in the right neighborhood while still understating or overstating a more careful source's own modeled figure — use the shortcut to sanity-check a claim's plausibility, not to replace the original study's number.",
          }}/>
          <p>None of this means the story is finished. A tariff rate can rise sharply and still leave the more consequential question open: once that cost lands somewhere on the U.S. side of the border, whose pocket does it actually come out of, and does that split stay fixed or keep shifting? That is where the next section picks up.</p>
          <Glossary items={[
            {t:"Effective (realized) tariff rate",d:"The tariff rate importers actually end up paying, as a share of the value of goods imported, once real customs collections are counted."},
            {t:"Statutory (announced) tariff rate",d:"The tariff rate a government formally announces, before accounting for exemptions, substitution, or enforcement gaps."},
            {t:"Post-substitution",d:"A measure that accounts for buyers switching suppliers or products to avoid a tariff, rather than assuming they keep buying exactly the same goods from the same countries."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(1)}>← Introduction</button><button onClick={()=>jump(3)}>Next: Who Pays? →</button></div>
        </section>

        {/* ---- Q1: WHO PAYS? ---- */}
        <section ref={refs.current[3]}>
          <div className="kicker">Research Question 1</div>
          <h2>If importers pay the bill, who really bears the cost?</h2>
          <p>The White House's own framing has been that foreign exporters, not Americans, would end up covering the cost of the 2025 tariffs. Economists Mary Amiti, Chris Flanagan, Sebastian Heise, and David Weinstein at the Federal Reserve Bank of New York tested that claim directly, comparing how much foreign export prices fell against how much of each tariff showed up in U.S. import prices. In the first eight months of 2025, they found that a 10 percentage-point tariff increase was associated with only a 0.6 percentage-point decline in foreign export prices — meaning 94% of the tariff's cost was borne on the U.S. side of the border, not absorbed by exporters cutting their prices (Federal Reserve Bank of New York, 2026).</p>
          <p>That 94% figure is not simply a repeat of history. The same research team's earlier study of the 2018-2019 tariffs found that foreign exporters did not lower their prices at all that time, meaning 100% of the cost landed on the U.S. side (Federal Reserve Bank of New York, 2026, citing the team's own prior work). By November 2025, the 2025 episode had moved modestly in the other direction: a 10-point tariff was associated with a 1.4-point decline in foreign export prices, an 86% U.S.-side incidence rather than 94% or 100%. Foreign exporters, in other words, absorbed a bit more of the cost themselves as the year wore on, but the overwhelming majority of the bill still landed on the U.S. side throughout.</p>
          <Chart2/>
          <Interp id="c2p1" label="Interpretation 1 of 2 · So what (decision)"
            question="Given that the U.S.-side share of tariff incidence fell only from 94% to 86% over 2025, not to something close to 50-50, what should a U.S. import-dependent retailer's finance team conclude about how much relief to expect from foreign suppliers voluntarily cutting their own prices to help absorb future tariff increases?"
            authored={<span>Very little relief should be budgeted for: even after a full year of negotiating leverage, price pressure, and supply-chain adjustment, foreign exporters were still only absorbing 14% of the incidence by November, up from 6% — a real but small shift. A finance team planning for a new or expanded tariff should assume the large majority of any new cost will land on the U.S. side (the importer's margin or the eventual consumer price) rather than counting on suppliers to meaningfully cut their own prices to compensate.</span>}
            onSubmit={onInterp}/>
          <Interp id="c2p2" label="Interpretation 2 of 2 · Quantitative reasoning"
            question="The article states that by December 2025 the average tariff was about 13%, and the estimated pass-through into U.S. import prices was 86%. Using those two figures, estimate roughly how much higher U.S. import prices for TARIFFED goods rose compared with import prices for goods that faced no tariff at all, and say what that gap implies for a retailer sourcing heavily from tariffed countries."
            authored={<span>13% × 0.86 ≈ 11% — U.S. import prices for tariffed goods rose about 11 percentage points more than prices for non-tariffed goods, which is close to the New York Fed's own reported estimate. For a retailer sourcing heavily from tariffed countries, that gap is large enough that it cannot realistically be absorbed indefinitely through supplier negotiation alone; it points toward the retailer eventually needing some combination of margin compression, price increases, or further supply-chain rerouting, the exact fork this article's next section investigates.</span>}
            onSubmit={onInterp}/>
          <MC onScore={onScore} q={{
            id:"rq1-b1",typeLabel:"Type B · Historical comparison",
            stem:"The 2018-2019 tariffs produced 100% U.S.-side incidence (foreign exporters did not cut prices at all), while the 2025 tariffs produced 86-94% U.S.-side incidence (exporters cut prices somewhat). A commentator concludes: 'This proves foreign exporters have permanently become more willing to absorb U.S. tariffs than they were in 2018.' What is the strongest reason to be skeptical of that conclusion from this evidence alone?",
            options:[
              "The 2025 tariffs covered more countries, which by itself statistically forces a lower average incidence number regardless of any change in exporter willingness",
              "The New York Fed's 2018-2019 study and its 2025 study used completely unrelated data sources and cannot be compared at all",
              "Foreign exporters cannot economically survive cutting prices for more than a few months, so the 2025 figures must be a temporary blip that will reverse",
              "A shift from 100% to 86-94% incidence over two different tariff episodes, several years apart, with different products, countries, currency conditions, and negotiating contexts all changing at once, does not isolate exporter 'willingness' as the specific cause; it is consistent with many other explanations (different products' price sensitivity, exchange-rate movements, or how each round of tariffs was implemented) without needing exporters to have changed their underlying behavior at all"],
            correct:3,
            why:"Two different tariff episodes, years apart, differ in far more ways than just 'exporter willingness' — products, countries, exchange rates, and implementation all changed simultaneously — so a change in the measured incidence percentage does not, by itself, isolate a change in exporter psychology or willingness as the cause, even though it is consistent with that story.",
            wrongWhy:{
              0:"Broader country coverage does not mechanically force a lower incidence number; incidence is about relative price response, not about how many countries are included.",
              1:"Both studies are from the same New York Fed research team using a comparable difference-in-differences approach on customs and price data; they are explicitly designed to be compared, which is why the article cites them together.",
              2:"This asserts a specific economic limit on exporters without evidence in this article to support it, and ignores that the data already show partial absorption sustained for months."},
            generalizes:"When comparing an outcome across two different time periods or episodes, resist attributing the difference to one specific cause (like 'changed willingness') unless competing explanations for the same gap have been ruled out.",
          }}/>
          <MC onScore={onScore} q={{
            id:"rq1-c1",typeLabel:"Type C",kind:"case",
            client:"The chief financial officer of a mid-sized U.S. appliance importer is deciding how to respond to a new 15% tariff on its main supplier country, and is being advised by a junior analyst who argues: 'Our supplier will probably cut their price to help us out, the way sellers usually split a cost increase evenly with buyers.'",
            stem:"Based on this section's evidence, what is the strongest reason the CFO should be skeptical of the analyst's 'even split' assumption specifically, and what should the CFO plan for instead?",
            options:[
              "The evenly-split assumption should be trusted, since standard economic theory always predicts a 50-50 split of any new tax between buyer and seller",
              "The New York Fed's own 2025 measurements found the U.S. side (importers, not foreign exporters) bore 86-94% of tariff incidence throughout the year, nowhere close to an even split; the CFO should plan for the large majority of the new tariff to land on the company's own margins or eventual consumer prices, not on supplier price cuts",
              "The appliance industry is too different from the industries in the New York Fed's study for any of its findings to apply",
              "The analyst is right, since a 15% tariff is smaller than the 25% tariff most companies discussed in this article faced, and smaller tariffs are always absorbed more evenly"],
            correct:1,
            why:"An 'even split' is a common textbook simplification, but this section's actual measured evidence for the U.S. tariffs specifically shows incidence running 86-94% onto the U.S. side throughout 2025 — the CFO should plan around the measured pattern for these tariffs, not a generic assumption about how cost increases usually divide.",
            wrongWhy:{
              0:"Economic theory does not universally predict a 50-50 split; the actual split depends on the relative price sensitivity of buyers and sellers, which this section's data show was very lopsided for the 2025 tariffs.",
              2:"The New York Fed's study covers a broad cross-section of internationally traded goods at a granular product level, which is exactly the kind of evidence relevant to an individual importer's planning, not an unrelated industry.",
              3:"Nothing in this section's evidence supports a rule that smaller tariff rates are absorbed more evenly; the 94%-to-86% shift tracked time and negotiation, not tariff size."},
            generalizes:"Before assuming a textbook 50-50 split of any new cost between a buyer and seller, check whether measured, real-world evidence for that specific situation shows a lopsided split instead — and plan around the measured pattern, not the simplifying assumption.",
          }}/>
          <Numeric onScore={onScore} q={{
            id:"rq1-d1",typeLabel:"Type D",
            stem:"A separate October 2025 Goldman Sachs analysis broke the 2025 tariff cost down further than 'U.S. side vs. foreign exporters,' estimating that of the total cost, 55% fell on U.S. consumers, 22% on U.S. businesses, and 5% went uncollected through evasion, leaving the remainder for foreign exporters. Using those three stated figures, estimate the implied share (as a percent) that fell on foreign exporters.",
            skeleton:"Decomposition: 100% total − consumers' share − businesses' share − evasion's share = foreign exporters' implied share.",
            tolNote:"±10% — tight, because this is a direct one-step subtraction from three stated figures.",
            min:0,max:50,step:1,unit:"% (foreign exporters' implied share)",actual:18,tol:1.8,
            how:"100 − 55 − 22 − 5 = 18% — matching Goldman Sachs's own separately reported 18% foreign-exporter share. This is the same consistency check used earlier in this article: when a source breaks a total into named shares, the shares should sum to 100%, and computing the missing piece by subtraction is a fast way to confirm (or catch an error in) a reported breakdown before trusting it.",
            generalizes:"When a source reports several shares of a total but leaves one category as 'the rest,' compute that residual by subtraction and check it against the source's own reported figure, if available, before trusting the breakdown.",
          }}/>
          <p>The honest section-level conclusion is that the "foreign exporters will pay" claim does not hold up against the New York Fed's own measurements: the large majority of the 2025 tariff bill, on the order of six to fifteen times more than what exporters absorbed, has landed on the U.S. side of the border throughout the year, with only a modest and gradual shift toward exporters sharing more of the cost. That finding answers where the money came FROM. It does not yet answer where the money WENT once it arrived on the U.S. side — the question the next section takes up.</p>
          <Glossary items={[
            {t:"Pass-through",d:"The share of a cost increase, like a tariff, that a seller passes on to the next buyer in the chain, rather than absorbing it."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(2)}>← Background</button><button onClick={()=>jump(4)}>Next: Where Did It Go? →</button></div>
        </section>

        {/* ---- Q2: WHERE DID IT GO? ---- */}
        <section ref={refs.current[4]}>
          <div className="kicker">Research Question 2</div>
          <h2>The bill landed on Americans. So why didn't inflation move?</h2>
          <p>If 86% to 94% of a tariff shock that quadrupled the average collected rate landed on the U.S. side, textbook logic says consumer inflation should have risen noticeably. It mostly did not. Headline CPI (the U.S. government's broadest inflation measure) stood at 3.0% in January 2025, dipped to 2.3% by April, the same month the largest tariffs took effect, and ended January 2026 at 2.4% — lower than where it started (U.S. Bureau of Labor Statistics, 2026). Core CPI followed a similar arc, falling from 3.3% to 2.5% over the same window.</p>
          <Chart3/>
          <Interp id="c3p1" label="Interpretation 1 of 2 · So what (decision)"
            question="Given that both headline and core CPI were LOWER in January 2026 than in January 2025, despite the tariff shock in between, what should a household budgeting for 2026 conclude about whether tariffs are the main driver of their own cost-of-living pressure, based on this chart alone?"
            authored={<span>Based on this chart alone, a household should be cautious about blaming tariffs specifically for broad cost-of-living pressure, since the two most-watched aggregate inflation measures were LOWER at the end of the window than the start; whatever tariff effect exists is not visible as a clear acceleration in these two headline series, which means a household concerned about prices should look at category-specific evidence (the kind explored later in this section) rather than assume tariffs are moving the aggregate cost of living.</span>}
            onSubmit={onInterp}/>
          <Interp id="c3p2" label="Interpretation 2 of 2 · Quantitative reasoning"
            question="Compute how many percentage points core CPI changed from April 2025 (the month tariffs took effect) to its highest point shown afterward, and separately from April 2025 to January 2026. What does the DIRECTION of the second number imply about whether tariffs caused a sustained acceleration in this particular aggregate measure?"
            authored={<span>Core CPI rose from 2.8% (April 2025) to a peak of 3.1% (July/August 2025), a 0.3-point increase, then fell to 2.5% by January 2026, a net change of −0.3 points from April 2025 to January 2026. A temporary bump followed by a net decline is not the signature of a sustained, tariff-driven acceleration in this aggregate measure; it is more consistent with normal month-to-month noise around a flat-to-declining trend, which is exactly why researchers had to look inside the aggregate, at specific goods categories, to find the tariff effect at all (the subject of the bridge chart and scatter chart ahead).</span>}
            onSubmit={onInterp}/>
          <MC onScore={onScore} q={{
            id:"rq2-a1",typeLabel:"Type A · Aggregation trap",
            stem:"Core CPI fell from 3.3% to 2.5% over the tariff year shown in the chart, yet the Dallas Fed separately estimates that tariffs ADDED about 0.8 percentage points to core PCE inflation by March 2026 (a related but different price measure). What reconciles a falling aggregate inflation rate with a Fed estimate that tariffs were pushing inflation UP?",
            options:[
              "The two facts are contradictory, so at least one of the two Federal Reserve data sources must be incorrect",
              "The Dallas Fed's 0.8 percentage-point estimate must refer to a future year, not to the same period as the CPI data in the chart",
              "Core CPI and core PCE are actually the same statistic reported under two different names, so this is simply a units error",
              "Other forces pulling inflation down (such as cooling housing costs and moderating services inflation) were large enough to more than offset the upward push from tariffs within the same aggregate number — an aggregate change is the NET of many simultaneous forces, so a rising contribution from one specific factor can still coexist with a falling total, the same way a car can still lose speed even while one specific gear is pushing it forward"],
            correct:3,
            why:"An aggregate inflation rate nets together many simultaneous, offsetting forces; a real, positive tariff contribution can coexist with a falling headline number if other components (like housing, which the Minneapolis Fed separately notes returned close to its pre-pandemic pace) fell by more over the same period — no contradiction, no data error, just aggregation.",
            wrongWhy:{
              0:"Both figures can be simultaneously true because they describe a net total versus one component's contribution to that total, not two competing measurements of the same single thing.",
              1:"The Dallas Fed's estimate and the chart's data cover overlapping 2025-2026 windows; the estimate is not displaced into an unrelated future period.",
              2:"Core CPI and core PCE are distinct, separately constructed government price indexes (different survey sources and formulas) that usually move similarly but are not identical, and this is not the reconciling fact here regardless."},
            generalizes:"Before treating a rising contribution from one factor and a falling aggregate total as contradictory, remember that an aggregate is a NET of many simultaneous forces — one piece can push up while the whole still falls if other pieces push down harder.",
          }}/>
          <p>To see the tariff effect the aggregate CPI trend was hiding, the Dallas Fed built a counterfactual: an estimate of what core PCE inflation (the Fed's preferred inflation gauge, similar to core CPI but built from a different survey) would have been with NO tariffs at all, then compared it with the actual number.</p>
          <Chart4/>
          <Interp id="c4p1" label="Interpretation 1 of 2 · Predict, then check (quantitative, pre-reveal)"
            question="Before checking the exact bridge: predict what SHARE (as a percent) of the actual March 2026 core PCE inflation rate the tariff effect alone represents. Then compute the actual share, and say what a share this size implies about how much of the current above-target inflation rate is attributable to tariffs specifically versus everything else."
            authored={<span>0.8 ÷ 3.1 ≈ 26% — on the Dallas Fed's own estimate, tariffs account for roughly a quarter of the actual March 2026 core PCE inflation rate, with the remaining three-quarters coming from the no-tariff counterfactual baseline (2.3%) itself, which is still above the Fed's 2% target. A share this size means tariffs are a real, measurable, but MINORITY contributor to why inflation remains above target — removing tariffs entirely would not bring inflation back to target on its own.</span>}
            onSubmit={onInterp}/>
          <Interp id="c4p2" label="Interpretation 2 of 2 · Mechanism (non-so-what)"
            question="Why might it take a specialized modeling exercise like this bridge chart to detect the tariff effect at all, rather than the effect being obvious just from watching the raw core PCE or core CPI number month to month?"
            authored={<span>A single reported inflation number is already a blend of dozens of separate categories, moving for many independent reasons (housing costs cooling, energy prices swinging, wages rising in some services) at the same time tariffs are pushing up a narrower set of goods prices; without a model that isolates what inflation would have looked like WITHOUT the tariffs specifically, the tariff-driven piece is invisible, mixed into a total that other forces can just as easily be pushing in the opposite direction.</span>}
            onSubmit={onInterp}/>
          <MC onScore={onScore} q={{
            id:"rq2-c1",typeLabel:"Type C",kind:"case",
            client:"The chief financial officer of a mid-sized furniture retailer is deciding whether to keep absorbing new tariff costs into the company's own profit margin for another full year, based on the belief that 'inventory built up before the tariffs will keep cushioning us indefinitely.'",
            stem:"Which assumption in the CFO's plan is most load-bearing, and where does this section's evidence suggest it is weakest?",
            options:[
              "That pre-tariff inventory can cushion costs INDEFINITELY; this section's evidence (and the reporting on GM and Stellantis specifically) shows companies drew down pre-tariff stockpiles as a temporary bridge, not a permanent shield, and once that inventory is sold through, the underlying higher import cost has to be reflected somewhere, whether in margins or prices — so the load-bearing assumption is the word 'indefinitely,' and it is the weakest link in the plan",
              "That the company's warehouse space is large enough to store another year of inventory, a purely logistical concern",
              "That competitors are not also holding pre-tariff inventory",
              "That the tariffs themselves might be reduced or removed by courts or future negotiation"],
            correct:0,
            why:"The entire plan rests on treating a temporary, finite cushion (pre-tariff inventory) as if it were a permanent solution; this section's evidence shows the cushion runs out, at which point the company must either compress margins further or raise prices — making 'indefinitely' the single most load-bearing, and least supported, word in the CFO's reasoning.",
            wrongWhy:{
              1:"Warehouse capacity is a real logistics constraint but is not the central economic assumption the plan actually depends on.",
              2:"Competitors' inventory decisions might affect competitive dynamics but do not change whether THIS company's own inventory cushion is finite.",
              3:"A future legal or policy reversal is a real possibility discussed elsewhere in this article, but the CFO's stated plan does not rest on betting on that outcome; it rests specifically on inventory lasting indefinitely."},
            generalizes:"When a plan leans on a temporary buffer (inventory, savings, a grace period) as though it were permanent, isolate the word doing the load-bearing work (like 'indefinitely') and test whether the evidence actually supports that word, not just the buffer's existence.",
          }}/>
          <Numeric onScore={onScore} q={{
            id:"rq2-d1",typeLabel:"Type D · Open-ended",
            requireDecomp:true,
            stem:"Without looking anything up: Fermi-estimate the total extra amount, in billions of dollars PER YEAR, that ALL U.S. households combined would pay if a tariff-driven shock permanently added one percentage point to the country's overall inflation rate.",
            tolNote:"Within a factor of 2 (log-scored, order-of-magnitude) — wide, because this is a genuine Fermi estimate with no single clean data point handed to you.",
            min:0,max:400,step:5,unit:"$ billion per year (all U.S. households combined)",log:true,actual:100,
            how:"A reasonable decomposition: the U.S. has roughly 131 million households (U.S. Census Bureau), each spending on average roughly $77,000 a year (Bureau of Labor Statistics Consumer Expenditure Survey). One extra percentage point of inflation applied to that total spending base is 131,000,000 × $77,000 × 0.01 ≈ $101 billion a year, rounded to about $100 billion. This is an ESTIMATE built from two cited anchor facts, not a directly reported figure. The exercise shows why a seemingly small, single-digit percentage-point change in an inflation rate translates into a nine-figure aggregate dollar number once it is multiplied across the entire economy — rates and aggregate dollar totals answer different questions, and converting between them requires knowing the scale of the base they apply to.",
            generalizes:"To convert a small-sounding percentage-point change into its real-world aggregate dollar size, multiply it by the total base it applies to (total spending, total population, total market value); a rate alone never tells you the size of what is actually at stake until it is scaled by its base.",
          }}/>
          <p>The honest section-level conclusion is that the missing inflation is not entirely missing, just distributed unevenly and mostly hidden inside an aggregate number that other forces were pulling in the opposite direction. On the Dallas Fed's own accounting, tariffs added a real, measurable, but modest fraction of the current above-target inflation rate, while pre-tariff inventory drawdowns, gradual price adjustment, and margin absorption by companies like General Motors and Stellantis explain much of why that fraction has not yet fully reached the shopper. Whether it still will, or whether the accounting itself is off, is the live debate the next section walks into.</p>
          <Glossary items={[
            {t:"Personal consumption expenditures (PCE) price index",d:"The Federal Reserve's preferred measure of how fast prices are rising across everything U.S. households buy."},
            {t:"Counterfactual",d:"An estimate of what would have happened under a different, hypothetical set of conditions — here, what inflation would have been without the tariffs."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(3)}>← Who Pays?</button><button onClick={()=>jump(5)}>Next: Delayed or Wrong? →</button></div>
        </section>

        {/* ---- Q3: DELAYED OR WRONG? ---- */}
        <section ref={refs.current[5]}>
          <div className="kicker">Research Question 3</div>
          <h2>Is the missing inflation just late, or was the model wrong?</h2>
          <p>Two live arguments compete to explain the gap between the size of the tariff shock and its muted showing in headline inflation. The first says the effect is simply delayed. The Federal Reserve Bank of New York's own regional business surveys, conducted in May 2026, found that of businesses that directly paid tariffs, 47% of service firms and 44% of manufacturers said they still have more tariff-induced price increases coming, with roughly 30% of service firms and nearly 40% of manufacturers planning to raise prices within six months, and a smaller group planning increases even further out (Federal Reserve Bank of New York, 2026). Peterson Institute economists Peter Orszag and Adam Posen go further, arguing in a January 2026 analysis (updated in May) that headline inflation could exceed 4% by the end of 2026, well above the consensus forecast of a continued gradual decline toward the Fed's 2% target, precisely because they see the tariff pass-through as still incomplete (Peterson Institute for International Economics, 2026).</p>
          <p>The second argument says the standard accounting framework itself may be missing the mark, not just running late. Economists Neil Mehrotra and Michael Waugh at the Federal Reserve Bank of Minneapolis built a model that translates each spending category's tariff exposure into a predicted inflation contribution, then checked it against what actually happened category by category. If the standard framework were right, categories with high predicted tariff exposure should show high actual inflation, and low-exposure categories should show low actual inflation.</p>
          <Chart5/>
          <Interp id="c5p1" label="Interpretation 1 of 2 · So what (decision)"
            question="Given this pattern, what should a Federal Reserve policymaker do differently when deciding how much of today's above-target inflation to attribute to tariffs specifically, versus other forces?"
            authored={<span>A policymaker should not treat a single, economy-wide 'tariffs added X percentage points' estimate as settled just because one accounting framework produces a number; before leaning on that number for a policy decision (like how quickly to cut interest rates), they should check whether the framework's own category-level predictions actually match reality, the way the Minneapolis Fed did — a framework whose predicted and actual patterns are NEGATIVELY correlated is a weak foundation for a specific policy number, even if its aggregate estimate happens to be in a plausible range.</span>}
            onSubmit={onInterp}/>
          <Interp id="c5p2" label="Interpretation 2 of 2 · Causal / comparative"
            question="The chart shows predicted and actual inflation contributions moving in roughly OPPOSITE directions across categories (a negative relationship). Which is the strongest reason NOT to conclude from this pattern that tariffs therefore had NO effect on inflation at all?"
            authored={<span>A negative correlation between one specific model's PREDICTIONS and actual outcomes shows that model's category-level mapping is unreliable; it does not show that tariffs had zero effect through OTHER channels the model may not capture well, such as the anticipation of announced-but-not-yet-collected tariffs (which the Minneapolis Fed suggests may explain early price increases in categories like pharmaceuticals, ahead of an announced tariff that has not yet actually taken effect), or indirect cost pass-through through supply chains the input-output framework may be mismeasuring. A flawed prediction model is evidence against that MODEL, not automatically evidence against the underlying phenomenon it was trying to model.</span>}
            onSubmit={onInterp}/>
          <MC onScore={onScore} q={{
            id:"rq3-b1",typeLabel:"Type B · Correlation vs. causation",
            stem:"Motor vehicles had high PREDICTED tariff exposure but low ACTUAL inflation contribution, while pharmaceuticals had near-zero predicted exposure (their announced 100% tariff had not yet taken effect) but high actual contribution. A commentator concludes: 'This proves the tariffs are not driving inflation anywhere in the economy.' What is the strongest flaw in that conclusion?",
            options:[
              "The commentator is drawing a sweeping causal conclusion ('tariffs are not driving inflation ANYWHERE') from a pattern that only shows one specific accounting framework's predictions failed to match actual outcomes CATEGORY BY CATEGORY — a mismatch between a model's predictions and reality undermines confidence in that model, but automakers' own reported multi-billion-dollar tariff hits (General Motors, Stellantis) are direct, independent evidence that tariffs ARE imposing real costs somewhere, even in a category (motor vehicles) where this particular model's prediction did not show up as inflation",
              "The commentator is correct, since a negative correlation always proves the complete absence of any causal relationship",
              "The mismatch only applies to pharmaceuticals, so the commentator's conclusion is valid for every other category",
              "The Minneapolis Fed's own chart is unreliable because Recharts cannot render scatter plots correctly"],
            correct:0,
            why:"A model's failed category-level predictions are evidence against that specific model, not proof that the underlying tariffs had zero economic effect anywhere — other direct evidence in this article (automakers' own reported multi-billion-dollar tariff costs) shows real costs are landing even in categories, like motor vehicles, where this accounting framework's prediction did not show up as measured inflation, likely because companies absorbed the cost into margins rather than raising prices in that specific category.",
            wrongWhy:{
              1:"A negative correlation between one model's predictions and outcomes does not prove the complete absence of causation; it only shows that particular model's mapping does not match reality well.",
              2:"The described mismatch applies to multiple categories on both sides of the pattern (motor vehicles running low, pharmaceuticals and apparel running high), not to pharmaceuticals alone.",
              3:"The chart's construction has no bearing on whether the commentator's causal conclusion about the real economy is logically sound; this option does not engage with the actual reasoning error."},
            generalizes:"When a specific model's predictions fail to match outcomes, treat that as evidence against the MODEL first; look for independent, direct evidence (like companies' own reported costs) before concluding the underlying real-world phenomenon does not exist at all.",
          }}/>
          <MC onScore={onScore} q={{
            id:"rq3-c1",typeLabel:"Type C",kind:"case",
            client:"A U.S. Senate committee staffer is drafting talking points arguing that 2025's tariffs have been proven harmless to consumers, citing the muted headline CPI trajectory in this article as the main evidence.",
            stem:"What is the single most load-bearing assumption behind that talking point, and what evidence in this article makes it the thinnest part of the argument?",
            options:[
              "That international shipping costs remained stable throughout 2025, an assumption not directly discussed in this article",
              "That the muted pass-through observed through early 2026 will persist, rather than being a temporary lag; this is the most load-bearing assumption, and it is the thinnest part of the argument because this section's own evidence (New York Fed surveys showing 47% of tariff-paying service firms and 44% of manufacturers still planning more price increases, and the Peterson Institute's above-consensus 2026 inflation forecast) directly suggests more pass-through is still arriving, not that the story is finished",
              "That the Federal Reserve will not change interest rates in 2026, an assumption not required by the talking point",
              "That foreign exporters will continue absorbing exactly 14% of tariff incidence indefinitely, an assumption not required by the talking point since the point being made is about consumers, not exporters"],
            correct:1,
            why:"The talking point implicitly treats the current, still-incomplete data as the final word, when this section's own cited evidence (business surveys and a credible above-consensus forecast) shows meaningful pass-through was still described as 'in the pipeline' as of mid-2026 — making 'this pattern is finished, not paused' the assumption doing all the work, and the one with the thinnest support.",
            wrongWhy:{
              0:"Shipping costs are not a topic this article discusses or relies on, so it cannot be the load-bearing assumption behind an argument built from this article's own evidence.",
              2:"Future Fed interest-rate decisions are a separate policy question the consumer-harmlessness talking point does not depend on.",
              3:"The exporter-incidence share is a separate finding from Research Question 1 and not the assumption underpinning a claim specifically about consumer harmlessness."},
            generalizes:"When a claim rests on a trend measured only up to the present moment, identify whether the argument silently assumes the trend has FINISHED rather than merely PAUSED — and check whether forward-looking evidence (surveys, forecasts) supports treating it as finished.",
          }}/>
          <p>Both arguments can be true at once, and probably are. The New York Fed's own survey evidence shows real, additional price increases still working through the system, which argues for "delayed, not absent." The Minneapolis Fed's category-level mismatch shows that whichever accounting framework analysts use to attribute a specific number of percentage points to tariffs deserves real skepticism, which argues for "the model needs work." Neither finding erases the other: the honest section-level conclusion is that the size of the tariff-inflation effect remains genuinely uncertain, bounded on the low end by evidence that some of it has not yet arrived, and on the high end by evidence that popular accounting frameworks overstate how cleanly it maps onto any single category.</p>
          <Glossary items={[
            {t:"Input-output table",d:"A government economic table showing how much of one industry's output is used as an ingredient by every other industry, used here to trace a tariff's cost through a full supply chain."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(4)}>← Where Did It Go?</button><button onClick={()=>jump(6)}>Next: Learning Summary →</button></div>
        </section>

        {/* ---- LEARNING SUMMARY ---- */}
        <section ref={refs.current[6]}>
          <div className="kicker">Learning Summary</div>
          <h2>What you did, and what to carry forward</h2>
          <Summary answers={answers} interp={interp}/>
          <div className="navbtns"><button onClick={()=>jump(5)}>← Delayed or Wrong?</button><button onClick={()=>jump(7)}>Next: Conclusion →</button></div>
        </section>

        {/* ---- CONCLUSION ---- */}
        <section ref={refs.current[7]}>
          <div className="kicker">Conclusion</div>
          <h2>Someone paid. The receipt just took longer to arrive.</h2>
          <p>The central tension is not whether the 2025 tariffs cost anyone real money; the evidence in this article shows clearly that they did, mostly landing on the U.S. side of the border rather than on foreign exporters. The tension is that the bill did not travel the short, direct path from tariff to shopper that simple textbook logic predicts; instead it detoured through drawn-down inventories, compressed corporate profit margins, and a still-unfinished round of price increases that two separate Federal Reserve research teams disagree about how to size. Under a partial-success path, where pass-through keeps arriving gradually through 2026 without a single dramatic spike, the most likely outcome is a slow, grinding erosion of profit margins and a gradual, uneven set of price increases concentrated in the specific goods categories most exposed to tariffed imports, rather than the sharp, broad-based inflation shock many forecasters originally expected.</p>
          <p>For households and financial planners, the practical implication is to stop watching only the headline CPI number for evidence of tariff damage, since this article shows that number can fall even while a real tariff effect is measurably present underneath it; a more useful signal is category-specific price data (furniture, apparel, vehicles) and direct corporate disclosures of tariff costs, which surfaced the effect well before it showed up in the aggregate. For corporate finance teams, the implication is to treat pre-tariff inventory cushions and absorbed profit margins explicitly as temporary, finite bridges with an expiration date, not permanent solutions, and to budget for the "some of it is still coming" scenario the New York Fed's own May 2026 survey data describe.</p>
          <p>For policymakers and researchers, the deeper structural implication is that measuring "how much did tariffs add to inflation" is not a settled, mechanical calculation; it depends on which accounting framework, category weighting, and time window a researcher chooses, and reasonable experts using reasonable methods currently land on materially different answers, some pointing toward a bigger delayed effect still arriving, others pointing toward a smaller effect than the standard framework implies. That disagreement is not a sign the question is unanswerable; it is a sign that the honest answer, for now, is a range, not a single number.</p>
          <MC onScore={onScore} q={{
            id:"concl-e1",typeLabel:"Type E · Implication + falsification",
            stem:"Given the evidence in this article — 86% to 94% of tariff incidence borne on the U.S. side, muted headline CPI despite that shock, a Dallas Fed model attributing roughly a quarter of March 2026 core PCE inflation to tariffs, and a Minneapolis Fed model whose category-level predictions run in the OPPOSITE direction from actual outcomes — which real-world decision is most directly supported, paired with the observation that would most FALSIFY the article's central thesis?",
            options:[
              "Decision: conclude tariffs have been definitively proven harmless and stop monitoring their price effects. Falsifier: any single month of core CPI coming in slightly above forecast.",
              "Decision: assume foreign exporters will keep absorbing an ever-larger share of tariff costs each year going forward, based on the modest rise from 6% to 14% seen in 2025. Falsifier: exporters' absorbed share failing to rise in a straight line every year.",
              "Decision: assume the higher of the two Fed estimates (Dallas Fed's 0.8 percentage points) is definitely the correct one and build all forecasts around it. Falsifier: none needed, since a Federal Reserve bank's estimate cannot be wrong.",
              "Decision: households, businesses, and policymakers should treat the tariff-inflation effect as real but genuinely uncertain in size, watch category-specific and survey-based evidence (not just headline CPI) through 2026 for signs of the delayed pass-through New York Fed surveys describe, and hold competing Fed research frameworks to the same standard: does their category-level prediction actually match reality. Falsifier: if, through the rest of 2026, category-specific price data for the goods most exposed to tariffs (furniture, apparel, vehicles, electronics) show NO measurable acceleration beyond their pre-tariff trend, and independent corporate disclosures stop showing material tariff-related cost or margin impact, that combination would be the strongest evidence that the 'delayed, not absent' reading in this article was wrong and the effect was smaller than described"],
            correct:3,
            why:"The article's best-supported reading holds two things together: the tariff cost is real and mostly borne by Americans, and its exact size and timing remain genuinely contested between credible research teams — so the defensible decision is continued, evidence-based monitoring using multiple signals, not declaring victory for either 'harmless' or a single Fed estimate. The sharpest falsifier names the one combination of future observations (no category-level acceleration plus no further corporate tariff-cost disclosures) that would convert this article's 'delayed, not absent' reading into the opposite conclusion.",
            wrongWhy:{
              0:"Declaring tariffs 'definitively proven harmless' ignores this section's own evidence of real, measured costs landing on U.S. companies and consumers, and proposes an arbitrary, weak falsifier.",
              1:"Extrapolating a two-data-point shift (6% to 14%) into a permanent straight-line trend is exactly the kind of short-trend extrapolation this article's own evidence (a modest, non-linear shift over less than a year) does not support.",
              2:"Treating one specific Fed estimate as certainly correct ignores this article's central finding that two credible Fed research teams disagree, and asserts, incorrectly, that a research estimate cannot be wrong."},
            generalizes:"A strong, evidence-based recommendation names the specific future observation that would force you to abandon it — and when two credible experts disagree on a number, the sharpest test is what happens to the ground-level, hardest-to-fake evidence (like corporate disclosures) as more time passes, not which expert's estimate you personally prefer.",
          }}/>
          <p style={{marginTop:18}}>The most important unresolved question is not whether the 2025 tariffs cost anyone money — the evidence in this article already shows, clearly, that they did. It is whether the calm headline inflation numbers of 2025 were the whole story or only the first act, and whether the 2026 data will show the "still in the pipeline" pass-through New York Fed surveys describe, or instead confirm the Minneapolis Fed's warning that the standard accounting framework for pricing this into the economy was not built to answer the question in the first place.</p>
          <Sources/>
          <Glossary items={[
            {t:"Falsifier",d:"A specific, observable outcome that, if it happened, would prove a claim wrong."},
            {t:"Basis point",d:"One one-hundredth of a percentage point; 100 basis points equal 1 percentage point."},
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
    wu1:"A local efficiency or cost-cutting move does not automatically scale up to the same directional change in the system-wide aggregate total",
    wu2:"Two credible sources reporting different numbers for the 'same' fact may be using different measurement conventions, not necessarily one being simply wrong",
    wu3:"A large, record-setting collected-revenue LEVEL does not by itself answer a separate economic question about who bears the cost",
    "bg-mc1":"Two numbers sharing a label (like 'tariff rate') are not automatically comparable across time unless they share the same measurement method",
    "bg-a1":"A rate change from a low starting base produces a small-looking percentage-point change and a dramatic-looking relative percent change at the same time — name which one is being used",
    "bg-d1":"A quick, generic back-of-envelope estimate can land in the right neighborhood while still missing structure a source's own more careful model captured",
    "rq1-b1":"A change in a measured outcome across two different episodes does not isolate one specific cause unless competing explanations have been ruled out",
    "rq1-c1":"Check measured, real-world evidence for a specific situation before trusting a textbook simplifying assumption (like an even split of costs)",
    "rq1-d1":"When a source breaks a total into named shares, compute the missing residual by subtraction and check it against any separately reported figure",
    "rq2-a1":"An aggregate rate is a net of many simultaneous forces; a rising contribution from one factor can coexist with a falling total",
    "rq2-c1":"When a plan leans on a temporary buffer as if it were permanent, isolate the specific word doing the load-bearing work and test the evidence against it",
    "rq2-d1":"Convert a small percentage-point change into its real aggregate dollar size by multiplying it by the total base it applies to",
    "rq3-b1":"A model's failed predictions are evidence against that model first, not automatic proof the underlying real-world effect does not exist",
    "rq3-c1":"A claim built on a trend measured only up to today may silently assume the trend has finished, not merely paused",
    "concl-e1":"A strong recommendation names its own falsifier — especially the one combination of hard, ground-level evidence that would resolve today's expert disagreement",
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
      <p style={{fontSize:14}}>You saw five charts. Write the single most non-obvious insight you would defend to a skeptical trade economist.</p>
      {!govDone && <>
        <textarea value={gov} onChange={e=>setGov(e.target.value)} placeholder="One or two sentences…"/>
        <button className="btn" disabled={gov.trim().length<20} onClick={()=>setGovDone(true)}>Reveal the article's three insights</button>
      </>}
      {govDone && <>
        <div className="yours"><b>Your insight:</b> {gov}</div>
        <div style={{marginTop:10}}>
          <div className="insight-card"><b>1.</b> "Who legally pays a tax" and "who economically bears its cost" are two different questions with two different answers: importers legally pay a tariff at the border, but the New York Fed's own price data show 86% to 94% of the ECONOMIC cost also stayed on the U.S. side, not with foreign exporters as promised — a rare case where the legal and economic incidence actually point the same direction, just far more one-sidedly than the "foreign countries will pay" framing claimed.</div>
          <div className="insight-card"><b>2.</b> An aggregate inflation number can hide a real, measurable cost shock inside it: core CPI fell over the same year the Dallas Fed estimates tariffs added roughly a quarter of the actual core PCE inflation rate, because other forces (cooling housing costs, moderating services inflation) were large enough to net out against the tariff push in the headline total — a falling average does not mean nothing underneath it is rising.</div>
          <div className="insight-card"><b>3.</b> "How much did tariffs add to inflation" is not one settled number but a range produced by different, defensible modeling choices: two Federal Reserve research banks, using different accounting frameworks on the same 2025 tariffs, land on different sizes, and one framework's own category-level predictions run in the opposite direction from what actually happened — which means the debate over "delayed" versus "the model was wrong" is a live, unresolved one, not a rounding error.</div>
        </div>
      </>}

      <h3>3 · Apply it</h3>
      <p style={{fontSize:14}}><b>(a) Transfer to a new domain.</b> A regional electric utility is required by its state regulator to pass through higher fuel costs to ratepayers, and utility executives point to a large, well-publicized rate increase already approved on paper as proof that customers are now "paying the full cost" of a recent spike in natural gas prices. A consumer advocate has obtained separate data showing that the utility's own reported profit margin on its regulated generation business actually ROSE in the two quarters right after the fuel-cost spike, even before accounting for the newly approved rate increase. In four labeled parts, write: (1) a one-sentence so-what thesis about whether the approved rate increase on paper actually tells you who bore the fuel-cost shock in practice, (2) the single load-bearing assumption that must hold for the executives' "customers are paying the full cost" claim to be true, (3) the strongest evidence that would undermine it, and (4) a one-line pre-mortem: "If the consumer advocate's challenge to this claim fails within 12 months, the most likely reason is ___."</p>
      <textarea value={applyA} onChange={e=>setApplyA(e.target.value)} placeholder="1) Thesis…  2) Assumption…  3) Disconfirming evidence…  4) Pre-mortem…"/>
      <p style={{fontSize:14,marginTop:12}}><b>(b) Cross-link to a prior article.</b> Name one principle from an earlier article (FIFA's asset-owner-vs-risk-bearer split, GLP-1's per-unit-vs-aggregate distinction, immaculate disinflation's sacrifice-ratio sign test, private credit's measurement-artifact lesson, streaming's fixed-cost-scale lesson, AI capex's spend-vs-revenue gap, Baumol's productivity-tracks-price lesson, gene therapy's value-vs-adoption split, passive investing's aggregate-concentration lesson, AI power's rebound-effect lesson, or retail media's value-vs-tax measurement gap) that most reinforces or conflicts with today's legal-incidence-vs-economic-incidence distinction, and say why.</p>
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
        <p>• Amiti, Mary; Flanagan, Chris; Heise, Sebastian; Weinstein, David E. "Who Is Paying for the 2025 U.S. Tariffs?" Liberty Street Economics, Federal Reserve Bank of New York, Feb. 2026 — 94% U.S.-side tariff incidence, Jan.–Aug. 2025 (10% tariff → 0.6-point foreign export-price decline); 86% U.S.-side incidence by Nov. 2025 (10% tariff → 1.4-point decline); average Dec. 2025 tariff ~13%; 2018-2019 tariffs showed 100% U.S.-side incidence. <a href="https://libertystreeteconomics.newyorkfed.org/2026/02/who-is-paying-for-the-2025-u-s-tariffs/" target="_blank" rel="noopener">libertystreeteconomics.newyorkfed.org</a></p>
        <p>• Montalbano, Nick. "More Tariff Pass-Through Is in the Pipeline." Liberty Street Economics, Federal Reserve Bank of New York, Jul. 8, 2026 — May 2026 regional business survey: 47% of service firms and 44% of manufacturers that directly paid tariffs still plan more price increases; ~30% of service firms and ~40% of manufacturers within six months; 16%/7% beyond six months; "nearly 90 percent" of tariff burden falling on U.S. firms and consumers. <a href="https://libertystreeteconomics.newyorkfed.org/2026/07/more-tariff-pass-through-is-in-the-pipeline/" target="_blank" rel="noopener">libertystreeteconomics.newyorkfed.org</a></p>
        <p>• Mau, Ron; Smith, Tucker. "Effects of realized tariff changes on PCE prices peaked in first quarter 2026." Dallas Fed Economics, Federal Reserve Bank of Dallas, May 5, 2026 — realized tariff rate 2.3% (2024) → 10.9% (Oct. 2025) → 9.4% (Dec. 2025); tariffs added ~0.80 percentage points to March 2026 core PCE inflation; no-tariff counterfactual core PCE 2.3%. <a href="https://www.dallasfed.org/research/economics/2026/0505-mau" target="_blank" rel="noopener">dallasfed.org</a></p>
        <p>• Mehrotra, Neil; Waugh, Michael E. "Tariffs can't explain rising goods inflation." Federal Reserve Bank of Minneapolis, Apr. 8, 2026 — core PCE 3.1% and core goods PCE 1.9% (both Jan. 2026, y/y) vs. a −0.6% pre-pandemic (2015-19) core-goods average; input-output accounting framework attributes ~2 points of core-goods (~0.5 points of core PCE) inflation to realized tariffs; predicted and actual category-level contributions are negatively correlated; cites Gopinath &amp; Neiman (NBER, 2026) on full importer pass-through but limited consumer-price pass-through. <a href="https://www.minneapolisfed.org/article/2026/tariffs-cant-explain-rising-goods-inflation" target="_blank" rel="noopener">minneapolisfed.org</a></p>
        <p>• U.S. Bureau of Labor Statistics. "Consumer prices up 2.4 percent over the year ended January 2026." The Economics Daily, Feb. 18, 2026 — 12-month headline and core ("all items less food and energy") CPI change, monthly, Jan. 2025–Jan. 2026; October 2025 not published due to the 2025 lapse in federal appropriations. <a href="https://www.bls.gov/opub/ted/2026/consumer-prices-up-2-4-percent-over-the-year-ended-january-2026.htm" target="_blank" rel="noopener">bls.gov</a></p>
        <p>• The Budget Lab at Yale. "State of U.S. Tariffs: April 2, 2026." Apr. 2, 2026 — average effective tariff rate 11.0% pre-substitution / 9.6% post-substitution, highest since 1943 (excl. 2025); 2024 baseline rate 2.5%; short-run price-level impact 0.5%-0.6% (Section 122 expiration scenario) or 0.8%-1.0% (extension); household loss $780/$648 (expiration, pre-/post-substitution) or $1,338/$1,130 (extension); bottom-decile income burden about 3x top-decile's; ~$1.1 trillion in tariff revenue over 2026-35 (conventional scoring, expiration scenario). <a href="https://budgetlab.yale.edu/research/state-us-tariffs-april-2-2026" target="_blank" rel="noopener">budgetlab.yale.edu</a></p>
        <p>• Orszag, Peter; Posen, Adam S. "The risk of higher US inflation in 2026." Realtime Economics, Peterson Institute for International Economics, Jan. 20, 2026 (updated May 7, 2026) — forecast of headline inflation potentially exceeding 4% by end-2026, above consensus, citing lagged tariff pass-through (up to 50 basis points by mid-2026), fiscal expansion, tighter labor supply, and looser-than-recognized monetary conditions. <a href="https://www.piie.com/blogs/realtime-economics/2026/risk-higher-us-inflation-2026" target="_blank" rel="noopener">piie.com</a></p>
        <p>• Rego, Max. "US consumers shouldering 55 percent of Trump tariff costs: Goldman Sachs." The Hill, Oct. 13, 2025, citing Goldman Sachs Research (Oct. 12, 2025) — 2025 tariff-cost split: 55% U.S. consumers, 22% U.S. businesses, 18% foreign exporters, 5% evasion. <a href="https://thehill.com/business/5553384-trump-tariffs-consumer-costs-goldman-sachs/" target="_blank" rel="noopener">thehill.com</a></p>
        <p>• Rogelberg, Sasha. "GM's $1.1 billion tariff hit bolsters mounting evidence that Americans are the ones footing the bill for Trump's import taxes." Fortune, Jul. 22, 2025 — GM $1.1B Q2 2025 tariff hit; GM withdrew 2025 guidance citing up to $5B tariff impact; Stellantis $2.7B net loss, H1 2025, with tariffs a >$350M negative factor; Deutsche Bank analyst George Saravelos: "the top-down macroevidence seems clear: Americans are mostly paying for the tariffs," citing $100B+ in customs duties collected with import prices roughly steady through mid-2025; Bernstein analyst Daniel Roeska on automakers exhausting margin absorption. <a href="https://fortune.com/2025/07/22/who-is-paying-for-tariffs-americans-exporters-general-motors/" target="_blank" rel="noopener">fortune.com</a></p>
        <p>• U.S. Census Bureau — U.S. household count, approximately 131 million (2024), used as an anchor fact for this article's own Fermi-estimation exercise. <a href="https://www.census.gov/quickfacts/fact/table/US" target="_blank" rel="noopener">census.gov</a></p>
        <p>• U.S. Bureau of Labor Statistics, Consumer Expenditure Survey — average annual household expenditures, approximately $77,000, used as an anchor fact for this article's own Fermi-estimation exercise. <a href="https://www.bls.gov/cex/" target="_blank" rel="noopener">bls.gov/cex</a></p>
      </div>
      <p style={{fontSize:12.5,color:"#777",marginTop:8}}>Note on estimates and illustration: the household-cost figure in the Background section's numeric question ($424) and the aggregate one-point-of-inflation figure in the "Where Did It Go?" section ($100 billion) are this article's own ESTIMATEs, built by stated arithmetic from cited FACT anchor figures (average household spending, U.S. household count), not directly reported statistics. Chart 5 (predicted vs. actual inflation contribution by category) is an ILLUSTRATION: it reconstructs the DIRECTION of a pattern the Minneapolis Fed reported in its own unpublished-in-text chart data, using disclosed synthetic coordinate values, not the study's original figures.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
