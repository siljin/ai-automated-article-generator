/* ============================================================================
   The Cost Disease — interactive research article
   Domain: Economics & macro.  All app code inlined per single-file rule.
   Data tiers: FACT (cited, verified), ESTIMATE (derived arithmetic),
   ILLUSTRATION (disclosed synthetic teaching values).
   ========================================================================== */
const {useState,useEffect,useRef} = React;
const R = window.Recharts;
const {ResponsiveContainer,ComposedChart,BarChart,Bar,Cell,LineChart,Line,ScatterChart,Scatter,
  XAxis,YAxis,CartesianGrid,Tooltip,ReferenceLine,LabelList,Legend} = R;

/* ---------- DATA ------------------------------------------------------------ */
// Chart 1 — nominal % price change since 2000 (FACT: AEI/Perry from BLS CPI, Jan 2000–Jun 2022)
const c1 = [
  {name:"Hospital services",v:220},
  {name:"College tuition",v:178},
  {name:"College textbooks",v:162},
  {name:"Medical care services",v:130},
  {name:"Childcare & nursery",v:115},
  {name:"Avg hourly wages",v:100},
  {name:"Food & beverages",v:82},
  {name:"Housing",v:80},
  {name:"All items (CPI)",v:74},
  {name:"Cell phone service",v:-41},
  {name:"Software",v:-71},
  {name:"Toys",v:-72},
  {name:"TVs",v:-97},
].map(d=>({...d, fill: d.v>=0? "var(--up)":"var(--down)"}));

// Chart 2 — nominal vs real (CPI-deflated) % change 2000–2022 (ESTIMATE: nominal FACT deflated by all-items CPI +74.4%)
const defl = 1.744;
function realPct(nom){return Math.round(((1+nom/100)/defl - 1)*100);}
const c2rows = ["Hospital services","College tuition","Childcare & nursery","Housing","All items (CPI)","Cell phone service","TVs"];
const c2nom = {"Hospital services":220,"College tuition":178,"Childcare & nursery":115,"Housing":80,"All items (CPI)":74,"Cell phone service":-41,"TVs":-97};
const c2 = [
  {period:"Nominal", ...Object.fromEntries(c2rows.map(k=>[k,c2nom[k]]))},
  {period:"Real (CPI-adjusted)", ...Object.fromEntries(c2rows.map(k=>[k,realPct(c2nom[k])]))},
];
const c2colors={"Hospital services":"#c0392b","College tuition":"#d97706","Childcare & nursery":"#b8860b","Housing":"#8a8a8a","All items (CPI)":"#111","Cell phone service":"#2b8cbe","TVs":"#1f6feb"};

// Chart 3 — Baumol mechanism waterfall for a stagnant service (ILLUSTRATION, teaching values)
const c3 = [
  {name:"Base price 2000", base:0, delta:100, kind:"total"},
  {name:"+ Wage growth", base:100, delta:70, kind:"up"},
  {name:"− Productivity", base:170, delta:0, kind:"down"},
  {name:"+ Input inflation", base:170, delta:22, kind:"up"},
  {name:"End price", base:0, delta:192, kind:"total"},
];

// Chart 4 — health-services PPI growth by payer since June 2014 (FACT: Peterson-KFF/BLS PPI)
const c4 = [
  {payer:"Private insurance", val:29.4},
  {payer:"Medicaid", val:25.0},
  {payer:"Overall (all payers)", val:25.3},
  {payer:"Medicare", val:15.7},
];

// Chart 5 — medical sub-components, YoY price growth June 2024 (FACT: Peterson-KFF/BLS CPI)
const c5 = [
  {name:"Hospital services", val:6.9},
  {name:"Nursing homes", val:6.0},
  {name:"Prescription drugs", val:2.4},
  {name:"Physicians' services", val:0.8},
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

/* ---------- Multiple choice (optional confidence capture) ------------------ */
function MC({q,onScore}){
  const [sel,setSel]=useState(null);
  const [sub,setSub]=useState(false);
  const [conf,setConf]=useState(null);
  const submit=()=>{ if(sel==null) return; if(q.confidence && conf==null) return;
    setSub(true); onScore(q.id, sel===q.correct, "mc", {conf, correct:sel===q.correct}); };
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
      {q.confidence && !sub && <div className="conf"><b>Before you submit — how confident are you?</b><br/>
        {["Low","Medium","High"].map(c=>(
          <label key={c}><input type="radio" name={q.id+"c"} checked={conf===c} onChange={()=>setConf(c)}/> {c}</label>
        ))}</div>}
      {!sub && <button className="btn" disabled={sel==null||(q.confidence&&conf==null)} onClick={submit}>Submit</button>}
      {sub && <div className="expl">
        <span className={"cal "+(sel===q.correct?"ok":"no")}>{sel===q.correct?"Correct — ":"Incorrect — "}</span>
        {sel===q.correct? q.why : q.wrongWhy[sel]}
        <div className="gen">Where this generalizes: {q.generalizes}</div>
        {q.confidence && <div style={{marginTop:6,fontSize:12.5,color:"#666"}}>You marked confidence: <b>{conf}</b>. Calibration is reported in the Learning Summary.</div>}
      </div>}
    </div>
  );
}

/* ---------- Numeric estimation --------------------------------------------- */
function Numeric({q,onScore}){
  const [val,setVal]=useState(q.min);
  const [sub,setSub]=useState(false);
  const within = ()=>{ if(q.log){ const r=val/q.actual; return r>=0.5 && r<=2; }
    return Math.abs(val-q.actual) <= q.tol; };
  const submit=()=>{ setSub(true); onScore(q.id, within(), "num", {val, actual:q.actual}); };
  const span=q.max-q.min;
  const pos=x=>Math.max(0,Math.min(100,((x-q.min)/span)*100));
  return (
    <div className="q-card">
      <div className="q-type">{q.typeLabel} · Numeric estimate</div>
      <div className="q-stem">{q.stem}</div>
      {q.skeleton && !sub && <div className="warmnote">{q.skeleton}</div>}
      {!sub && <>
        <div className="num-row">
          <input type="number" value={val} onChange={e=>setVal(parseFloat(e.target.value)||0)} />
          <input type="range" min={q.min} max={q.max} step={q.step} value={val} onChange={e=>setVal(parseFloat(e.target.value))}/>
          <span style={{fontSize:13,color:"#666"}}>{q.unit}</span>
        </div>
        <button className="btn" onClick={submit}>Submit estimate</button>
      </>}
      {sub && <>
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
      <div className="charttitle">Price change of selected goods and services since 2000 <Tier t="FACT"/></div>
      <div className="chartsub">% change, January 2000 to mid-2022. Red = rose faster than the average basket; blue = fell. Source: AEI (M. Perry) from BLS CPI, 2022.</div>
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={c1} layout="vertical" margin={{left:8,right:36,top:4,bottom:4}}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
          <XAxis type="number" domain={[-110,240]} tickFormatter={v=>v+"%"} fontSize={11}/>
          <YAxis type="category" dataKey="name" width={132} fontSize={11}/>
          <Tooltip formatter={v=>v+"%"}/>
          <ReferenceLine x={0} stroke="#111"/>
          <Bar dataKey="v" radius={2}>
            {c1.map((d,i)=><Cell key={i} fill={d.fill}/>)}
            <LabelList dataKey="v" position="right" formatter={v=>(v>0?"+":"")+v+"%"} fontSize={10.5}/>
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="note">Diverging dot/bar view chosen over a plain bar chart because the story is the split direction (who rose vs fell around the 0% and CPI lines), not one ranked total.</div>
    </div>
  );
}
function Chart2(){
  return (
    <div className="chartbox">
      <div className="charttitle">Nominal vs real price change, 2000–2022 <Tier t="ESTIMATE"/></div>
      <div className="chartsub">Each line links a category's nominal change (left) to its real change after deflating by the all-items CPI (right).</div>
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={c2} margin={{left:6,right:70,top:12,bottom:4}}>
          <CartesianGrid strokeDasharray="3 3" vertical={false}/>
          <XAxis dataKey="period" fontSize={12}/>
          <YAxis tickFormatter={v=>v+"%"} fontSize={11} domain={[-110,240]}/>
          <Tooltip formatter={v=>v+"%"}/>
          <ReferenceLine y={0} stroke="#111"/>
          {c2rows.map(k=>(
            <Line key={k} dataKey={k} stroke={c2colors[k]} strokeWidth={2} dot={{r:3}}>
              <LabelList dataKey={k} position="right" formatter={(v)=>k.length>12?k.slice(0,11)+"…":k} content={()=>null}/>
            </Line>
          ))}
          <Legend fontSize={10} wrapperStyle={{fontSize:10.5}}/>
        </LineChart>
      </ResponsiveContainer>
      <div className="note">ESTIMATE: real values derived by deflating each nominal BLS figure by the all-items CPI (+74.4%); not separately reported statistics. Slope chart chosen over paired bars because the point is the before→after movement per category.</div>
    </div>
  );
}
function Chart3(){
  return (
    <div className="chartbox">
      <div className="charttitle">Why a stagnant service gets more expensive — the Baumol bridge <Tier t="ILLUSTRATION"/></div>
      <div className="chartsub">How the price of a labor-heavy service moves when economy-wide wages rise but its own productivity does not.</div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={c3} margin={{left:6,right:12,top:16,bottom:28}}>
          <CartesianGrid strokeDasharray="3 3" vertical={false}/>
          <XAxis dataKey="name" fontSize={10} interval={0} tickLine={false} height={54}/>
          <YAxis domain={[0,220]} fontSize={11}/>
          <Tooltip formatter={(v,n)=> n==="delta"? v : null}/>
          <Bar dataKey="base" stackId="a" fill="transparent"/>
          <Bar dataKey="delta" stackId="a" radius={2}>
            {c3.map((d,i)=><Cell key={i} fill={d.kind==="total"?"#111":d.kind==="up"?"#c0392b":"#1f6feb"}/>)}
            <LabelList dataKey="delta" position="top" formatter={v=>v===0?"~0":("+"+v)} fontSize={10.5}/>
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="note">ILLUSTRATION: teaching values, not reported statistics. Assumes labor ≈ 70% of the service's cost, economy-wide wages up ~70%, near-zero productivity offset, and general input inflation on the rest. A waterfall is used because the point is contribution-to-change: which force drives the delta.</div>
    </div>
  );
}
function Chart4(){
  return (
    <div className="chartbox">
      <div className="charttitle">Same care, different price path: health-services prices by payer since 2014 <Tier t="FACT"/></div>
      <div className="chartsub">Producer Price Index for health-care services, cumulative % change, June 2014 to 2024. Source: Peterson-KFF / BLS PPI, 2024.</div>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={c4} layout="vertical" margin={{left:8,right:44,top:4,bottom:4}}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
          <XAxis type="number" domain={[0,34]} tickFormatter={v=>v+"%"} fontSize={11}/>
          <YAxis type="category" dataKey="payer" width={130} fontSize={11}/>
          <Tooltip formatter={v=>v+"%"}/>
          <Bar dataKey="val" radius={2}>
            {c4.map((d,i)=><Cell key={i} fill={d.payer.indexOf("Private")===0?"#c0392b":d.payer.indexOf("Medicare")===0?"#1f6feb":"#8a8a8a"}/>)}
            <LabelList dataKey="val" position="right" formatter={v=>"+"+v+"%"} fontSize={10.5}/>
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="note">The gap between Medicare (+15.7%) and private insurers (+29.4%) for broadly the same services is the "mind-the-gap" exhibit: a single service does not have one cost-disease price.</div>
    </div>
  );
}
function Chart5(){
  return (
    <div className="chartbox">
      <div className="charttitle">Not all "medical" prices move together: sub-component inflation, June 2024 <Tier t="FACT"/></div>
      <div className="chartsub">Year-over-year % price change, June 2024. Source: Peterson-KFF / BLS CPI, 2024.</div>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={c5} layout="vertical" margin={{left:8,right:44,top:4,bottom:4}}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
          <XAxis type="number" domain={[0,8]} tickFormatter={v=>v+"%"} fontSize={11}/>
          <YAxis type="category" dataKey="name" width={140} fontSize={11}/>
          <Tooltip formatter={v=>v+"%"}/>
          <Bar dataKey="val" barSize={3} fill="#bbb"/>
          <Scatter dataKey="val" fill="#1f6feb"/>
          <ReferenceLine x={3.0} stroke="#c0392b" strokeDasharray="4 3" label={{value:"overall 3.0%",position:"top",fontSize:10,fill:"#c0392b"}}/>
        </ComposedChart>
      </ResponsiveContainer>
      <div className="note">Lollipop (dot + stem) chosen over bars so the spread against the overall-inflation reference line is the visual point. Dashed line = overall CPI inflation (3.0%).</div>
    </div>
  );
}

/* ---------- Content sections ----------------------------------------------- */
const SECTIONS = [
  "Warm-Up","Introduction","Background","Q1 · What drives it","Q2 · Real terms","Q3 · The future","Learning Summary","Conclusion"
];

/* ---------- App ------------------------------------------------------------ */
function App(){
  const [active,setActive]=useState(0);
  const [answers,setAnswers]=useState({}); // id -> {ok,type,meta}
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
          <p className="dek">Each question takes a principle from a prior article and drops it into a new setting. Answer before reading on — these are scored.</p>
          <MC onScore={onScore} q={{
            id:"wu1",typeLabel:"Warm-Up · Type B",
            stem:"A food-delivery startup brags that it doubled orders this year. Which single extra fact best decides whether that growth is actually profitable?",
            options:[
              "Revenue per order minus the cost to fulfill it, set against the platform's fixed costs",
              "Total app downloads to date",
              "The number of new cities it launched in",
              "The year-over-year growth rate in orders"],
            correct:0,
            why:"Profit in a shared-fixed-cost business turns on contribution per unit (price minus variable cost) times the base, weighed against fixed cost. A raw order count is a vanity metric until you know the unit economics (the streaming-profitability lesson).",
            wrongWhy:{
              1:"Downloads are another vanity count — they say nothing about whether each order pays for itself.",
              2:"City count is scale, not economics; scale multiplies losses if each order loses money.",
              3:"A growth rate describes speed, not profitability — fast growth of an unprofitable order is worse, not better."},
            generalizes:"Any subscription, marketplace, or content business — always pair a headline count with revenue-per-unit and the fixed-cost denominator.",
          }}/>
          <MC onScore={onScore} q={{
            id:"wu2",typeLabel:"Warm-Up · Type B",
            stem:"Two funds hold near-identical assets. Fund A reports 3% volatility, Fund B reports 9%. What is the strongest reason NOT to conclude Fund A is safer?",
            options:[
              "Fund B is newer, so it has less track record",
              "Fund A charges higher fees",
              "Fund A marks its holdings by appraisal less often, which smooths the reported volatility",
              "Fund A simply holds more assets"],
            correct:2,
            why:"A reported risk number is a definition, not a fact of nature. Infrequent appraisal-based marks mechanically shrink measured volatility, so the 3% may reflect how it is measured, not lower true risk (the private-credit lesson).",
            wrongWhy:{
              0:"Track-record length doesn't explain a 3x volatility gap on the same assets.",
              1:"Fees reduce returns; they don't lower the measured bounce of asset values.",
              3:"Holding more assets doesn't lower per-dollar volatility."},
            generalizes:"Any 'low-risk' claim — interrogate how the risk metric is computed before trusting the level.",
          }}/>
          <MC onScore={onScore} q={{
            id:"wu3",typeLabel:"Warm-Up · Type E",
            stem:"A country's inflation falls sharply while unemployment also falls and output keeps rising. Which inference is best supported?",
            options:[
              "The central bank must have engineered it with aggressive rate hikes",
              "The disinflation is likely supply-driven rather than caused by demand tightening",
              "The inflation data must be mismeasured",
              "Inflation and unemployment always move in opposite directions"],
            correct:1,
            why:"A demand-driven disinflation normally costs jobs and output. When the 'cost' shows the wrong sign — unemployment falling — the mechanism points to supply healing, not a demand squeeze. Separate the number (falling inflation) from the mechanism (the immaculate-disinflation lesson).",
            wrongWhy:{
              0:"Rate hikes would tend to raise unemployment, which is the opposite of what's observed.",
              2:"Dismissing inconvenient data is a reflex, not an inference; the pattern has a coherent supply-side reading.",
              3:"The stable inverse relation (a Phillips curve) is exactly what a supply shock breaks."},
            generalizes:"Any headline rate — read the accompanying costs to infer the mechanism, and name the assumption that would falsify your read.",
          }}/>
          <Glossary items={[
            {t:"Vanity metric",d:"A number that looks impressive but does not, on its own, tell you whether something is working or profitable."},
            {t:"Volatility",d:"How much a value bounces around over time; often used as a proxy for risk."},
            {t:"Disinflation",d:"A slowdown in the rate of price increases (inflation still positive, just smaller)."},
          ]}/>
          <div className="navbtns"><span/><button onClick={()=>jump(1)}>Next: Introduction →</button></div>
        </section>

        {/* ---- INTRODUCTION ---- */}
        <section ref={refs.current[1]}>
          <div className="kicker">Economics &amp; Macro</div>
          <h1>The Cost Disease: why the work machines can't do keeps getting pricier</h1>
          <p className="lead">Since 2000, US consumer prices roughly doubled — but that average hides a strange split. The things made by machines and shipped across borders, like TVs, toys, and software, collapsed in price by 70–98%. The things delivered by people face-to-face, like hospital care, college, and childcare, more than doubled or tripled (AEI/BLS, 2022).</p>
          <p>The puzzle is not that some prices rose and others fell. It is <i>which</i> ones did. The sectors that got dramatically more expensive are not the ones that got worse. They are the ones that could not get much more productive. A hospital nurse, a professor, and a daycare worker do roughly what they did a generation ago; a TV factory does not. Over the same period, average hourly wages rose about 100%, a touch faster than the 74% rise in the overall price basket, so the typical worker's pay stretched a little further on average even as service prices soared (AEI/BLS, 2022).</p>
          <p>This runs against the intuition that competition and technology make everything cheaper over time. They do — but only where output per worker can climb. Where a service is the human hour itself, faster machines elsewhere in the economy pull its wages up without pulling its productivity up, and the price has to give. Economists call this Baumol's cost disease, after the economist who first named it in the 1960s.</p>
          <p>This note addresses three questions. First, what actually drives the divergence — is it mainly the cost disease (unequal productivity growth), or is it regulation, subsidy, and market power? Second, is the gap as large in real, inflation-adjusted terms as the nominal numbers suggest, and does it leave households better or worse off? Third, what does the cost disease imply for the future — will services keep eating a larger share of spending, and can technology such as artificial intelligence (AI, software that performs tasks that once needed people) finally cure it?</p>
          <Glossary items={[
            {t:"Baumol's cost disease",d:"The tendency for prices of labor-heavy services (care, teaching, live performance) to rise because their wages track the wider economy while their output per worker barely grows."},
            {t:"Productivity",d:"How much output a worker produces per hour; when it rises, the same pay buys more output, so unit costs can fall."},
            {t:"Nominal vs real",d:"A nominal figure is the raw dollar amount; a real figure strips out general inflation to show change relative to everything else."},
            {t:"Consumer Price Index (CPI)",d:"The government's measure of the average price of a typical basket of goods and services bought by households."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(0)}>← Warm-Up</button><button onClick={()=>jump(2)}>Next: Background →</button></div>
        </section>

        {/* ---- BACKGROUND ---- */}
        <section ref={refs.current[2]}>
          <div className="kicker">Background · Trajectory &amp; structure</div>
          <h2>Two decades of prices pulling apart</h2>
          <p>The clearest picture of the split is a single chart that has circulated among economists and even Federal Reserve staff, first assembled by economist Mark Perry from Bureau of Labor Statistics (BLS) data. It plots the price change of about a dozen categories since 2000 against the overall basket. From January 2000 to mid-2022, the all-items CPI rose 74.4%. Hospital services rose 220%, college tuition 178%, college textbooks 162%, medical care services 130%, and childcare 115%. Over the same years TVs fell 97%, toys 72%, software about 71%, and cell-phone service 41% (AEI/BLS, 2022).</p>
          <Chart1/>
          <Interp id="c1p1" label="Interpretation 1 of 2 · Predict a ratio (quantitative)"
            question="Before reading on: the hospital index rose to about 320 (2000=100) and the TV index fell to about 3. Predict — how many times more expensive did hospital care get relative to TVs? Give a number."
            authored={<span>About 100x. The hospital index (~320) divided by the TV index (~3) is roughly 107x. Two goods that started at the same price now sit two orders of magnitude apart — a reminder that a shared 'average inflation' number can hide gaps of 100-fold underneath it.</span>}
            onSubmit={onInterp}/>
          <Interp id="c1p2" label="Interpretation 2 of 2 · So what (decision)"
            question="In one sentence: if you led a city's affordability policy, what does this pattern tell you to focus on that a single inflation number would hide?"
            authored={<span>Target the labor-heavy, non-tradable services — health, education, childcare, housing — because that is where household budgets actually get squeezed; chasing the average inflation rate misses that goods have been quietly subsidizing the basket while services drive the real cost-of-living pain.</span>}
            onSubmit={onInterp}/>
          <p>A second fact matters as much as the direction: the divergence lines up with how tradable and automatable each category is. Goods can be made abroad, shipped, and improved with machines; a chest X-ray reading or a lecture cannot easily be imported or sped up without changing what it is. The corroborating primary-based figure from the Peterson-KFF Health System Tracker, drawn from BLS, is that medical-care prices rose 121.3% from 2000 through mid-2024 while all consumer prices rose 86.1% over the same window — the same story, a different endpoint (Peterson-KFF/BLS, 2024).</p>
          <p>The scale of the stakes is easiest to see in health care, the largest cost-disease sector. US health spending reached $5.3 trillion in 2024, about 18.0% of the whole economy, up from 17.6% two years earlier (CMS/Health Affairs, 2025). A sector whose prices structurally outrun the basket, and which already takes nearly one dollar in five, is not a rounding error; it is a growing claim on everything else.</p>
          <MC onScore={onScore} q={{
            id:"bg1",typeLabel:"Type B · Trend reasoning",
            stem:"The sectors that rose most are also the ones with the most government funding and regulation. Which is the strongest reason NOT to conclude that regulation caused the price increases?",
            options:[
              "Regulation always lowers prices, so any positive correlation must be a data error",
              "Those same sectors are the most labor-intensive and least automatable, so the cost disease predicts the same pattern even with no regulation at all",
              "The chart only starts in 2000, so earlier data might differ",
              "Government-funded sectors are too small a share of GDP to move prices"],
            correct:1,
            why:"This is a classic confounder. Government involvement and low automatability travel together — health, education, and childcare are both heavily regulated AND intrinsically labor-heavy. Because the cost disease alone predicts the same ranking, the regulation-price correlation cannot be read as causation without separating the two.",
            wrongWhy:{
              0:"That over-claims: regulation can raise or lower prices, and asserting it 'always' does one thing is itself a reasoning error.",
              2:"The start date doesn't address why the correlation might be spurious.",
              3:"False — these sectors are large (health alone is ~18% of GDP), and size isn't the issue; confounding is."},
            generalizes:"Any 'X is correlated with bad outcome Y, so X causes Y' claim — look for a third variable that drives both before assigning blame.",
          }}/>
          <Numeric onScore={onScore} q={{
            id:"bgD",typeLabel:"Type D",
            stem:"Using the indices in the chart (hospital ≈ 320, TVs ≈ 3, with 2000 = 100), estimate how many times more expensive hospital care became relative to TVs.",
            skeleton:"Decomposition skeleton: ratio = hospital index ÷ TV index = 320 ÷ 3.",
            min:0,max:200,step:1,actual:107,tol:20,unit:"× (times)",log:false,
            how:"320 ÷ 3 ≈ 107x. Because this is arithmetic from two given values, the tolerance is tight (±20). The point is not the exact figure but the order of magnitude: an 'average' basket that doubled contains components that diverged ~100-fold.",
            generalizes:"Whenever an aggregate looks calm, divide its fastest-rising component by its fastest-falling one to see the spread the average conceals.",
          }}/>
          <Glossary items={[
            {t:"Tradable vs non-tradable",d:"A tradable good or service can be produced elsewhere and imported (a TV); a non-tradable one must be delivered on the spot (a hospital stay)."},
            {t:"Bureau of Labor Statistics (BLS)",d:"The US government agency that measures prices, employment, and productivity."},
            {t:"Producer Price Index (PPI)",d:"A measure of the prices producers receive, as opposed to the prices consumers pay (the CPI)."},
            {t:"Confounder",d:"A hidden third factor that influences both things in a correlation, making it look like one causes the other."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(1)}>← Introduction</button><button onClick={()=>jump(3)}>Next: What drives it →</button></div>
        </section>

        {/* ---- Q1 ---- */}
        <section ref={refs.current[3]}>
          <div className="kicker">Research Question 1</div>
          <h2>What actually drives the divergence?</h2>
          <p>The cost disease offers a precise mechanism, not just a label. Start with a labor-heavy service where wages are most of the cost. Each year, wages across the whole economy rise because manufacturing and technology keep getting more productive and can afford to pay more. To keep its staff, the service has to match those raises. But if the service cannot produce more per worker — the nurse still nurses one patient, the professor still teaches one class — then higher pay lands directly on price. There is no productivity gain to absorb it.</p>
          <Chart3/>
          <Interp id="c3p1" label="Interpretation 1 of 2 · Mechanism"
            question="Which single bar is doing the load-bearing work in this bridge, and why? Answer in one sentence."
            authored={<span>The near-zero productivity offset. In a manufactured good, a large negative productivity bar would cancel the wage-growth bar, holding price flat or pushing it down; the whole disease is that this offsetting bar is missing in labor-bound services, so the wage increase passes straight through to price.</span>}
            onSubmit={onInterp}/>
          <Interp id="c3p2" label="Interpretation 2 of 2 · So what (decision)"
            question="In one sentence: for a service leader who cannot automate the core task, what does this bridge say is the only durable lever on price?"
            authored={<span>Either raise measured output per worker without degrading the service (reorganize who does what, shift routine tasks to lower-cost roles or tools) or accept that price will track economy-wide wages — because you cannot hold price down while paying market wages for flat productivity.</span>}
            onSubmit={onInterp}/>
          <p>But the cost disease is not the whole story, and honest analysis has to test its limits. If prices were set purely by wages and productivity, the same service would cost roughly the same everywhere. It does not. The producer-price data show that for broadly the same health services, prices paid by private insurers rose 29.4% since 2014, versus 15.7% for Medicare and 25.0% for Medicaid — with the all-payer average at 25.3% (Peterson-KFF/BLS, 2024). Medicare sets its prices administratively; private prices come from negotiation. A single service does not have one cost-disease price.</p>
          <Chart4/>
          <Interp id="c4p1" label="Interpretation 1 of 2 · Causal"
            question="Roughly the same services, yet private prices rose almost twice as fast as Medicare's. Why? Name the most likely cause in one sentence."
            authored={<span>Negotiating leverage, not productivity: Medicare fixes prices by rule while private insurers must bargain with consolidated hospital systems, so bargaining power and market structure — not the cost of delivering care — explain much of the gap and its faster growth.</span>}
            onSubmit={onInterp}/>
          <Interp id="c4p2" label="Interpretation 2 of 2 · So what (decision)"
            question="In one sentence: what does the payer gap tell a policymaker about how much of health-price growth the cost disease can actually explain?"
            authored={<span>Not all of it — since the same care rises at very different rates by payer, a chunk of health inflation is institutional pricing power layered on top of the cost disease, so productivity policy alone will not fix prices without also addressing market structure.</span>}
            onSubmit={onInterp}/>
          <MC onScore={onScore} q={{
            id:"q1a",typeLabel:"Type B · Causal",
            stem:"Given the payer gap, which claim is best supported?",
            options:[
              "Health-price growth is entirely explained by Baumol's cost disease",
              "Medicare underpays only because its patients are healthier",
              "Private insurers are simply more efficient buyers than the government",
              "Part of the level and growth of health prices reflects bargaining power, so no single 'cost-disease price' exists for a given service"],
            correct:3,
            why:"If pure productivity-and-wages set prices, the same service would not rise at 29.4% for one payer and 15.7% for another. The spread is evidence that market structure and negotiation sit on top of the cost disease. The disease is real but partial.",
            wrongWhy:{
              0:"'Entirely' is falsified by the payer gap itself — one mechanism can't yield two prices for one service.",
              1:"Patient health doesn't explain administered-vs-negotiated price differences for the same services.",
              2:"Private prices rose faster and higher — the opposite of what 'more efficient' would predict; they reflect weaker leverage against consolidated providers."},
            generalizes:"Whenever one clean mechanism 'explains everything,' look for variation it cannot explain (here, price by payer) to size how much is really left for other forces.",
          }}/>
          <MC onScore={onScore} q={{
            id:"q1c",typeLabel:"Type C",kind:"case",
            client:"A state budget office proposing to cut college costs by deregulating public-university tuition.",
            stem:"Which assumption must hold for deregulation to lower the real cost of college, and where is the evidence in this article thinnest?",
            options:[
              "That teaching productivity can rise fast enough to offset wage growth — and the article's thinnest evidence is exactly that services productivity barely moves",
              "That students prefer cheaper colleges to more expensive ones",
              "That tuition figures are nominal rather than real",
              "That faculty wages will fall in absolute terms after deregulation"],
            correct:0,
            why:"Deregulation can only cut real cost if the underlying driver — flat productivity meeting rising wages — is loosened. Nothing here shows teaching output per worker can climb quickly, so that is the load-bearing and least-supported assumption. Naming the weakest link is the point.",
            wrongWhy:{
              1:"Student preferences aren't the binding constraint; the cost structure is.",
              2:"Whether the figure is nominal or real doesn't determine whether deregulation changes the productivity mechanism.",
              3:"Expecting wages to fall contradicts the whole cost-disease setup, in which service wages are pulled up by the wider economy."},
            generalizes:"For any 'change the rules and costs fall' proposal, ask which assumption about the underlying cost driver must hold — and rate the evidence for that specific link, not the proposal's popularity.",
          }}/>
          <p>The honest section-level conclusion: the cost disease is the primary structural driver of the divergence, but it is not sufficient on its own. Regulation, subsidy that lets demand outrun supply, and the market power of consolidated providers all amplify it. The disease sets the direction; institutions set how far.</p>
          <Glossary items={[
            {t:"Administered price",d:"A price set by a rule or authority (as Medicare does) rather than by negotiation between buyer and seller."},
            {t:"Market power",d:"The ability of a seller (or buyer) to move prices in its favor because rivals or alternatives are limited."},
            {t:"Load-bearing assumption",d:"The one belief a conclusion depends on most; if it fails, the conclusion collapses."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(2)}>← Background</button><button onClick={()=>jump(4)}>Next: Real terms →</button></div>
        </section>

        {/* ---- Q2 ---- */}
        <section ref={refs.current[4]}>
          <div className="kicker">Research Question 2</div>
          <h2>Is it as big in real terms — and are households worse off?</h2>
          <p>Big nominal numbers can mislead. A price that rose 178% during an era when everything rose 74% did not really triple in burden; it rose relative to the average basket by much less. To see the true squeeze, deflate each nominal change by the all-items CPI. When you do, the down-movers barely change — a good that fell 97% was already near zero — but the up-movers shrink a lot, because much of their rise was just general inflation shared by everything.</p>
          <Chart2/>
          <Interp id="c2p1" label="Interpretation 1 of 2 · Mechanism"
            question="Why do the falling categories (TVs, cell service) barely move between the nominal and real columns, while the rising ones shrink sharply? One sentence."
            authored={<span>Deflating divides everything by the same basket, so a category that already fell has little left to remove, whereas a category that rose fast was partly carried by general inflation — stripping that out reveals how much of the 'increase' was simply the whole economy getting more expensive.</span>}
            onSubmit={onInterp}/>
          <Interp id="c2p2" label="Interpretation 2 of 2 · So what (decision)"
            question="In one sentence: for a household budgeting for the next decade, what is the real-terms takeaway?"
            authored={<span>Plan for care, tuition, and childcare to keep outrunning your paycheck's purchasing power even after inflation, while electronics and many goods quietly get cheaper — so the squeeze is concentrated in a few unavoidable services, not spread evenly across the budget.</span>}
            onSubmit={onInterp}/>
          <p>Even in real terms the gap is large. Hospital services rose roughly 80% faster than the basket, college tuition roughly 60% (ESTIMATE, deflating the nominal BLS figures by the all-items CPI). But the household story has a second half: pay. Average hourly wages rose about 100% over 2000–2022, a bit more than the 74% basket, so real wages rose on the order of 14% (ESTIMATE). The average worker's hour buys more goods than before — dramatically more electronics — but fewer hours of a nurse, a professor, or a daycare teacher. The cost disease redistributes purchasing power away from human services and toward things.</p>
          <Numeric onScore={onScore} q={{
            id:"q2D",typeLabel:"Type D",
            stem:"College tuition rose 178% (nominal); the all-items CPI rose 74.4% over the same period. Estimate the real, inflation-adjusted percentage increase in tuition.",
            skeleton:"Decomposition skeleton: real change = (1 + nominal) ÷ (1 + CPI) − 1 = (2.78 ÷ 1.744) − 1.",
            min:0,max:120,step:1,actual:59,tol:8,unit:"% (real)",log:false,
            how:"(1+1.78)/(1+0.744) − 1 = 2.78/1.744 − 1 ≈ 0.59, i.e. about +59% in real terms. Tolerance is tight (±8) because this is definitional arithmetic, not a Fermi guess. The lesson: a 178% nominal rise is a ~59% real rise — big, but not the tripling the raw number suggests.",
            generalizes:"Any multi-year money figure — deflate before comparing, or you will mistake shared inflation for real, category-specific increase.",
          }}/>
          <MC onScore={onScore} q={{
            id:"q2trap",typeLabel:"Type A · Statistical trap",confidence:true,
            stem:"In June 2024, medical inflation was 3.3% and overall inflation 3.0%. Which statement is exactly right?",
            options:[
              "Medical inflation was 0.3% higher than overall inflation",
              "Medical prices were 10 percentage points above overall prices",
              "Medical inflation exceeded overall by 0.3 percentage points — about 10% faster in relative terms",
              "Medical and overall inflation were effectively identical"],
            correct:2,
            why:"3.3% vs 3.0% is a gap of 0.3 percentage points (the difference between two rates), which is about a 10% relative difference (0.3/3.0). Saying '0.3% higher' confuses percentage points with percent; saying '10 percentage points' inflates the gap 33-fold.",
            wrongWhy:{
              0:"That mislabels 0.3 percentage points as '0.3%', the exact percent-vs-percentage-points confusion.",
              1:"10 percentage points would mean 13% medical inflation — a wild overstatement.",
              3:"A 10% relative difference in the rate is not negligible when compounded over years."},
            generalizes:"Any comparison of two rates (interest, unemployment, growth) — state whether the gap is in percentage points or in relative percent; they are different numbers.",
          }}/>
          <p>The honest section-level conclusion: the divergence is smaller in real terms than the nominal chart shouts, but it is still large and it is concentrated. Rising wages cushion the average household, yet the cushion is thin for anyone whose life leans heavily on care, education, or childcare in a given year.</p>
          <Glossary items={[
            {t:"Deflate",d:"To divide a dollar figure by a price index so what remains is change relative to general inflation."},
            {t:"Percentage point",d:"The plain difference between two percentages (3.3% minus 3.0% is 0.3 percentage points), distinct from a relative percent change."},
            {t:"Real wage",d:"Take-home pay adjusted for inflation — what your pay can actually buy."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(3)}>← What drives it</button><button onClick={()=>jump(5)}>Next: The future →</button></div>
        </section>

        {/* ---- Q3 ---- */}
        <section ref={refs.current[5]}>
          <div className="kicker">Research Question 3</div>
          <h2>Where does this go — and can technology cure it?</h2>
          <p>If services keep outrunning goods, they take an ever-larger share of spending. That is already visible: health care alone climbed to 18.0% of the economy in 2024 (CMS/Health Affairs, 2025), and education and care add more. Baumol's own uncomfortable point was that this can happen even as the country grows richer — indeed <i>because</i> it does, since it is rising wealth elsewhere that pulls service wages up.</p>
          <p>The natural hope is that technology, and now AI, will finally raise output per worker in these sectors and break the pattern. The evidence says be careful. Prices within "medical care" already move at very different speeds, which shows productivity and pricing power vary even inside one labor-heavy sector.</p>
          <Chart5/>
          <Interp id="c5p1" label="Interpretation 1 of 2 · Quantitative"
            question="Hospital services rose 6.9% and physicians' services 0.8% in the same year. Roughly how many times faster did hospital prices grow, and what might explain the spread? One sentence."
            authored={<span>About 9x faster (6.9 ÷ 0.8). The spread suggests the 'cost disease' is not uniform — hospital pricing reflects heavy fixed costs and consolidated market power, while physician fees are more constrained by administered rates, so a single sector hides very different price engines.</span>}
            onSubmit={onInterp}/>
          <Interp id="c5p2" label="Interpretation 2 of 2 · Causal / mechanism"
            question="If AI genuinely raised productivity in one of these sub-components, which line would you expect to bend down first, and why? One sentence."
            authored={<span>The most routine, data-heavy tasks (parts of diagnostics or drug handling) should ease before hands-on hospital care, because AI substitutes most easily for standardizable cognitive work and least easily for the physical, relational labor that defines the cost disease.</span>}
            onSubmit={onInterp}/>
          <Numeric onScore={onScore} q={{
            id:"q3D",typeLabel:"Type D · Open-ended",
            stem:"Estimate US health-care spending as a share of the whole economy (GDP) in 2024. Before entering a number, name your decomposition path in your head (what you'd divide by what).",
            skeleton:"No skeleton this time — you name the path. Hint: think total health spending in dollars ÷ total GDP in dollars.",
            min:0,max:40,step:0.5,actual:18,tol:5,unit:"% of GDP",log:false,
            how:"Path: total health spending ÷ GDP = about $5.3 trillion ÷ about $29 trillion ≈ 18%. Tolerance is wider (±5 points) because this is an order-of-magnitude estimate, not arithmetic from given numbers. Bounds: it cannot be below ~10% (health is famously large) or above ~25% (that would exceed every peer country). The actual is 18.0% (CMS/Health Affairs, 2025).",
            generalizes:"For any 'how big is X in the economy' question, build the ratio from a numerator you can anchor (spending) and a denominator you know roughly (~$29T US GDP) rather than guessing the percentage directly.",
          }}/>
          <MC onScore={onScore} q={{
            id:"q3c",typeLabel:"Type C",kind:"case",
            client:"A hospital-system CEO betting a major AI investment will reverse the cost disease within five years.",
            stem:"Which is the strongest caveat to that bet?",
            options:[
              "AI cannot legally operate in hospitals, so the plan is impossible",
              "The cost disease is only about manufacturing, so it doesn't apply to hospitals",
              "Cost disease eases only if AI lifts measured output per worker in the care itself and those gains aren't eaten by rising wages, added quality, or new regulation — so adoption and measurement, not model capability, are the binding constraints",
              "AI will certainly eliminate most clinical labor, so costs will fall automatically"],
            correct:2,
            why:"A demo or a capable model is not a productivity gain. Prices fall only if output per worker in the delivered service rises and stays ahead of wage growth and quality/regulatory additions. That depends on workflow adoption and on measuring service output — the same lesson as prior AI-value articles.",
            wrongWhy:{
              0:"AI is already used in hospitals; legality is not the binding constraint.",
              1:"The cost disease is defined precisely for labor-heavy services like hospitals.",
              3:"'Certainly eliminate most clinical labor' is exactly the over-optimistic demo-to-ROI leap the evidence warns against."},
            generalizes:"Any 'new tech will fix costs' thesis — value shows up only when measured output per worker rises in the actual workflow, not when the technology merely exists.",
          }}/>
          <p>The honest section-level conclusion: technology can dent the cost disease at the edges, in the most standardizable tasks, but the core — the human hour of care, teaching, and attention — resists automation by definition. The likeliest path is partial relief, not a cure, with services continuing to claim a rising share of spending.</p>
          <Glossary items={[
            {t:"Artificial intelligence (AI)",d:"Software that performs tasks — reading images, drafting text, answering questions — that used to require human judgment."},
            {t:"Gross Domestic Product (GDP)",d:"The total value of everything an economy produces in a year; the usual denominator for 'share of the economy.'"},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(4)}>← Real terms</button><button onClick={()=>jump(6)}>Next: Learning Summary →</button></div>
        </section>

        {/* ---- LEARNING SUMMARY ---- */}
        <section ref={refs.current[6]}>
          <div className="kicker">Learning Summary</div>
          <h2>What you did, and what to carry forward</h2>
          <Summary answers={answers} interp={interp}/>
          <div className="navbtns"><button onClick={()=>jump(5)}>← The future</button><button onClick={()=>jump(7)}>Next: Conclusion →</button></div>
        </section>

        {/* ---- CONCLUSION ---- */}
        <section ref={refs.current[7]}>
          <div className="kicker">Conclusion</div>
          <h2>The price of things we can't speed up</h2>
          <p>The central challenge is simple to state and hard to escape: in an economy where machines keep making workers more productive, the services that are the human hour itself must get relatively more expensive, and under partial success — some automation, some reform — they will keep claiming a larger share of what households and governments spend.</p>
          <p>For households, that means the cost of a good life is increasingly the cost of care, teaching, and attention, even as gadgets get cheaper; budgeting and policy should target those few unavoidable services, not the average inflation rate. For firms and investors, the cost disease marks the labor-heavy services as the sectors where prices are structurally supported but where any genuine productivity breakthrough would be enormously valuable — and rare.</p>
          <p>For policymakers, the deeper implication is that fighting service inflation with demand tools alone misreads the mechanism, much as fighting a supply-driven disinflation with rate cuts would. The disease is structural; the cures are structural too — productivity in delivery, competition against consolidated providers, and honest measurement of what these services actually produce.</p>
          <MC onScore={onScore} q={{
            id:"concl",typeLabel:"Type E · Implication + falsification",
            stem:"Which decision is best supported by this article, paired with the observation that would most FALSIFY the cost-disease thesis?",
            options:[
              "Decision: assume all service inflation is pure market power. Falsifier: finding any regulated market anywhere",
              "Decision: expect electronics to keep falling forever with no limit. Falsifier: a single quarter of rising TV prices",
              "Decision: treat health and manufacturing inflation as interchangeable. Falsifier: any difference in their prices",
              "Decision: index public service budgets to expected wage growth, not headline CPI. Falsifier: a labor-intensive service that automated heavily yet still saw prices track wages, showing productivity wasn't the driver"],
            correct:3,
            why:"The strongest decision follows the mechanism: service costs track economy-wide wages, so budgets tied to CPI will chronically underfund them. The right falsifier is the sharpest one — a labor-heavy service that DID raise productivity but whose prices still rose with wages would show the disease's core link (flat productivity → rising price) is not what's operating.",
            wrongWhy:{
              0:"'All market power' overshoots the evidence, and its falsifier is trivial and unrelated.",
              1:"An unbounded forecast is not a supported decision, and one quarter's noise is a weak falsifier.",
              2:"Treating the two as interchangeable ignores the article's central distinction; the 'falsifier' would be met constantly and proves nothing."},
            generalizes:"A strong thesis names, in advance, the single observation that would overturn it — here, productivity rising without prices falling. If you can't state your falsifier, you don't yet have a testable claim.",
          }}/>
          <p style={{marginTop:18}}>The most important unresolved question is measurement: we assume service productivity is flat, but much of what a better hospital or school produces — fewer errors, better outcomes, more learning — is barely counted. If the cost disease is partly a mismeasurement of quality, then some of the "disease" is actually progress we have failed to price. That is the load-bearing assumption behind everything above, and the one most worth attacking.</p>
          <Sources/>
          <Glossary items={[
            {t:"Falsifier",d:"A specific observation that, if seen, would prove a claim wrong; naming one is what makes a claim testable."},
            {t:"Mismeasurement of quality",d:"When better outcomes (fewer errors, more learning) aren't counted as extra output, so real productivity gains look like pure price increases."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(6)}>← Learning Summary</button><span/></div>
        </section>

      </main>
    </div>
  );
}

/* ---------- Learning Summary component ------------------------------------- */
function Summary({answers,interp}){
  const [gov,setGov]=useState(""); const [govDone,setGovDone]=useState(false);
  const [applyA,setApplyA]=useState(""); const [applyB,setApplyB]=useState("");
  const [evalOut,setEvalOut]=useState(null);

  const entries=Object.entries(answers);
  const byType={}; entries.forEach(([id,a])=>{const t=a.type;byType[t]=byType[t]||{ok:0,n:0};byType[t].n++;if(a.ok)byType[t].ok++;});
  const nCorrect=entries.filter(([,a])=>a.ok).length;

  // numeric bias
  const nums=entries.filter(([,a])=>a.type==="num"&&a.meta);
  let bias=null;
  if(nums.length){ const s=nums.map(([,a])=>(a.meta.val-a.meta.actual)/Math.abs(a.meta.actual));
    const avg=s.reduce((x,y)=>x+y,0)/s.length; bias=Math.round(avg*100); }

  // confidence calibration (single flagged question q2trap)
  const conf=answers["q2trap"];
  let calLine="No confidence question answered yet.";
  if(conf&&conf.meta){ const c=conf.meta.conf, ok=conf.meta.correct;
    calLine="On the flagged real-vs-nominal question you were "+(c||"—")+" confidence and "+(ok?"correct":"incorrect")+
      (c==="High"&&!ok?" — a mild over-confidence signal; slow down on percent-vs-percentage-point wording.":
       c==="Low"&&ok?" — you knew more than you trusted; that trap is worth more confidence next time.":". Well calibrated on this item."); }

  // missed questions by principle
  const principleMap={
    wu1:"Vanity metrics: pair any headline count with unit economics",
    wu2:"A risk metric is a definition, not a fact — check how it's measured",
    wu3:"Separate a rate from its mechanism; read the accompanying costs",
    bg1:"Correlation vs causation: look for a confounder before assigning blame",
    bgD:"An average hides the spread of its components",
    q1a:"A clean mechanism rarely explains 100% — size what it can't",
    q1c:"Name the load-bearing assumption and rate its evidence",
    q2D:"Deflate before comparing multi-year money figures",
    q2trap:"Percentage points vs relative percent are different numbers",
    q3D:"Build a ratio from an anchored numerator and a known denominator",
    q3c:"New tech cuts cost only via measured output per worker in the workflow",
    concl:"A testable thesis names its own falsifier",
  };
  const missed=entries.filter(([,a])=>!a.ok).map(([id])=>principleMap[id]).filter(Boolean);

  // local Apply-It evaluator (isolated; secure API could replace this fn later)
  function evaluateApply(a,b){
    const parts=[
      {k:"thesis",label:"a one-sentence so-what thesis"},
      {k:"assumption",label:"the load-bearing assumption"},
      {k:"disconfirm",label:"the strongest disconfirming evidence"},
      {k:"premortem",label:"a one-line pre-mortem"},
    ];
    const txt=a.toLowerCase();
    const gaps=[];
    // structural checks, not keyword scoring: require four labeled, non-trivial parts
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

  const S=window.Recharts?null:null;
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
      <p style={{fontSize:14}}><b>Confidence calibration:</b> {calLine}</p>

      <h3>2 · Your governing insight (write before revealing ours)</h3>
      <p style={{fontSize:14}}>You saw five charts. Write the single most non-obvious insight you would defend to a skeptical executive.</p>
      {!govDone && <>
        <textarea value={gov} onChange={e=>setGov(e.target.value)} placeholder="One or two sentences…"/>
        <button className="btn" disabled={gov.trim().length<20} onClick={()=>setGovDone(true)}>Reveal the article's three insights</button>
      </>}
      {govDone && <>
        <div className="yours"><b>Your insight:</b> {gov}</div>
        <div style={{marginTop:10}}>
          <div className="insight-card"><b>1.</b> The sectors that got more expensive are the ones that <i>couldn't</i> get more productive — price divergence tracks automatability and tradability, not quality decline.</div>
          <div className="insight-card"><b>2.</b> A single average (CPI up ~74%) can hide 100-fold gaps beneath it; always split an aggregate into its fastest-rising and fastest-falling parts, and deflate before you judge the size.</div>
          <div className="insight-card"><b>3.</b> The cost disease sets the direction, but institutions (regulation, subsidy, provider market power) set the magnitude — shown by the same care rising almost twice as fast for private payers as for Medicare.</div>
        </div>
      </>}

      <h3>3 · Apply it</h3>
      <p style={{fontSize:14}}><b>(a) Transfer to a new domain.</b> Consider a dataset far from prices — say, per-student cost of a school district over 20 years, or the cost per line of code shipped by a software team. In four labeled parts, write: (1) a one-sentence so-what thesis, (2) the single load-bearing assumption that must hold, (3) the evidence that would most undermine it, and (4) a one-line pre-mortem: "If this fails in 12 months, the most likely reason is ___."</p>
      <textarea value={applyA} onChange={e=>setApplyA(e.target.value)} placeholder="1) Thesis…  2) Assumption…  3) Disconfirming evidence…  4) Pre-mortem…"/>
      <p style={{fontSize:14,marginTop:12}}><b>(b) Cross-link to a prior article.</b> Name one principle from an earlier article (streaming economics, private credit, immaculate disinflation, GLP-1, or the AI capex gap) that reinforces or conflicts with today's cost-disease lesson.</p>
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

/* ---------- Sources -------------------------------------------------------- */
function Sources(){
  return (
    <div style={{marginTop:24}}>
      <h3>Sources</h3>
      <div className="src">
        <p>• Mark J. Perry, "Chart of the Day… or Century?" American Enterprise Institute (AEI), 2022 — price changes Jan 2000 to mid-2022, from BLS CPI. <a href="https://www.aei.org/carpe-diem/chart-of-the-day-or-century-8/" target="_blank" rel="noopener">aei.org</a></p>
        <p>• Peterson-KFF Health System Tracker, "How does medical inflation compare to inflation in the rest of the economy?" 2024 — medical +121.3% vs all items +86.1% since 2000; payer PPI; sub-component YoY (BLS data). <a href="https://www.healthsystemtracker.org/brief/how-does-medical-inflation-compare-to-inflation-in-the-rest-of-the-economy/" target="_blank" rel="noopener">healthsystemtracker.org</a></p>
        <p>• CMS National Health Expenditures / Health Affairs, 2025 — US health spending $5.3T = 18.0% of GDP in 2024. <a href="https://www.cms.gov/data-research/statistics-trends-and-reports/national-health-expenditure-data/nhe-fact-sheet" target="_blank" rel="noopener">cms.gov</a></p>
        <p>• W. Baumol &amp; W. Bowen, <i>Performing Arts: The Economic Dilemma</i> (1966) — origin of the cost-disease idea. Overview: <a href="https://en.wikipedia.org/wiki/Baumol_effect" target="_blank" rel="noopener">Baumol effect (Wikipedia)</a></p>
      </div>
      <p style={{fontSize:12.5,color:"#777",marginTop:8}}>Note on periods: the "chart of the century" is refreshed roughly twice a year, so exact endpoints vary by version; figures here use the verified Jan 2000–mid-2022 release, with Peterson-KFF/BLS (through mid-2024) as the corroborating primary-based series. Real-terms figures are ESTIMATEs derived by deflating nominal BLS values by the all-items CPI; the Baumol bridge is a disclosed ILLUSTRATION.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
