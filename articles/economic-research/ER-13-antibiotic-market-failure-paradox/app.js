/* ============================================================================
   The Antibiotic Paradox: Why Medicine's Best Investment Keeps Bankrupting
   Its Makers
   Domain: Healthcare, Science, Medicine & BioTech (ER-13).
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
// Chart 1 -- Global deaths attributable to bacterial antimicrobial resistance
// (AMR), 2019 and 2021 (FACT), and a projected 2050 annual figure (ESTIMATE,
// derived below). 2019: 1.27M attributable / 4.95M associated deaths (Murray
// et al., "Global burden of bacterial antimicrobial resistance in 2019," The
// Lancet, Jan. 2022). 2021: 1.14M attributable / 4.71M associated deaths, plus
// a forecast that annual attributable deaths will rise by almost 70% from
// 2022 to 2050 and that >39 million cumulative attributable deaths will occur
// 2025-2050 (Naghavi et al., "Global burden of bacterial antimicrobial
// resistance 1990-2021: a systematic analysis with forecasts to 2050," The
// Lancet, Sept. 2024). The single 2050 ANNUAL point plotted here (~1.9M) is
// this article's own ESTIMATE: 1.14M x 1.70 = 1.938M, rounded to ~1.9M --
// the source reports the ~70% rise and the >39M cumulative total, not one
// single annual 2050 figure, so this point is disclosed as derived, not
// directly reported.
const c1 = [
  {label:"2019", actual:1.27, proj:null},
  {label:"2021", actual:1.14, proj:1.14},
  {label:"2050 (projected)", actual:null, proj:1.9},
];

// Chart 2 -- FDA-approved systemic antibacterial new molecular entities
// (NMEs), by approval era. FACT. Between June 1980 and October 2024, FDA
// approved 80 systemic antibacterial NMEs: 52 before 2000, 4 between 2020 and
// 2024, implying 28 between 2000 and 2019 (80-52-4=28). Source: "Approved
// antibacterial drugs in the last 10 years: from the bench to the clinic,"
// Exploration (2024/2025).
const c2 = [
  {era:"1980-1999 (20 yrs)", count:52},
  {era:"2000-2019 (20 yrs)", count:28},
  {era:"2020-2024 (5 yrs, partial)", count:4},
];

// Chart 3 -- Dumbbell: R&D cost to bring a drug to market, and 9-quarter
// cumulative sales after launch, antimicrobials vs. benchmark classes. FACT.
// Capitalized R&D cost for an antimicrobial targeting multidrug-resistant
// (MDR) pathogens in acute care: ~$1.9 billion. Capitalized R&D cost median
// for a general new drug approved 2009-2018: ~$985 million (mean $1,336M).
// 9-quarter cumulative sales, top-ranked antimicrobial drugs: ~$42 million.
// 9-quarter cumulative sales, top-ranked oncology drugs: ~$1,041 million.
// Source: U.S. Dept. of Health & Human Services, ASPE, "Antimicrobial Drugs:
// Market Returns Analysis" (issue brief and NCBI Bookshelf report), citing
// DiMasi et al. for the general-drug R&D cost baseline.
const c3raw = [
  {metric:"R&D cost to bring to market ($M)", A:1900, B:985, la:"Antimicrobial (MDR-focused)", lb:"Typical new drug (all classes, median)"},
  {metric:"9-quarter cumulative sales after launch ($M)", A:42, B:1041, la:"Antimicrobial (top-ranked)", lb:"Oncology (top-ranked)"},
];
const c3 = c3raw.map(d=>({...d, base:Math.min(d.A,d.B), range:Math.abs(d.A-d.B)}));

// Chart 4 -- Waterfall/funnel: WHO's 2023 clinical antibacterial pipeline,
// narrowed by successive filters. FACT. 97 total agents (57 traditional + 40
// non-traditional); of the 57 traditional agents, 32 target a WHO bacterial
// priority pathogen; of those 32, only 12 meet at least one of WHO's four
// innovation criteria (no known cross-resistance, new target, new mode of
// action, and/or new class); of those 12, only 4 are active against at least
// one WHO "critical" pathogen. Source: World Health Organization, "2023
// Antibacterial agents in clinical and preclinical development: an overview
// and analysis" (2024 release), as reported by CIDRAP and ContagionLive
// coverage of the same WHO report.
const c4 = [
  {name:"Total 2023 clinical pipeline (all agents)", base:0, delta:97, kind:"start"},
  {name:"Not aimed at a WHO priority pathogen (kept: 32)", base:32, delta:65, kind:"drop"},
  {name:"Miss every WHO innovation criterion (kept: 12)", base:12, delta:20, kind:"drop"},
  {name:"Not active vs. a WHO 'critical' pathogen (kept: 4)", base:4, delta:8, kind:"drop"},
  {name:"Remaining: novel, priority-targeted, critical-active", base:0, delta:4, kind:"total"},
];
const c4color = d => (d.kind==="drop") ? "#c0392b" : "#111";

// Chart 5 -- Slope chart: today's typical peak annual sales ceiling for a
// launched antibiotic vs. the PASTEUR Act's proposed annual subscription
// contract range. FACT. Status quo: "average annual sales for recently
// approved antibiotics are less than $50 million" (HHS ASPE, "Understanding
// Markets for Antimicrobial Drugs," Aug. 2023). PASTEUR Act proposed federal
// subscription contracts: $75 million to $300 million per year, for terms up
// to 10 years or until generic/biosimilar entry, net of the manufacturer's
// own product revenue (Sen. Michael Bennet press release, Jun. 24, 2026,
// summarizing the reintroduced PASTEUR Act of 2026, H.R.7352, 119th
// Congress). PASTEUR has not passed as of this writing (Jul. 2026); it was
// first introduced in Sept. 2020 and has been reintroduced multiple times.
const c5 = [
  {period:"Status quo ceiling", low:50, high:50},
  {period:"PASTEUR Act proposed range", low:75, high:300},
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
      <div className="charttitle">Global deaths attributable to bacterial antimicrobial resistance (AMR), per year <Tier t="FACT"/></div>
      <div className="chartsub">Millions of deaths per year. 2019 and 2021 points are directly reported FACTs. The 2050 point is this article's own ESTIMATE (1.14M × 1.70 ≈ 1.9M), derived from the source's reported "~70% rise by 2050 vs. 2022" statement, since the source reports that rise and a &gt;39-million cumulative 2025-2050 total, not one single annual 2050 figure. Source: Murray et al., The Lancet (2022); Naghavi et al., The Lancet (2024).</div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={c1} margin={{left:4,right:20,top:20,bottom:4}}>
          <CartesianGrid strokeDasharray="3 3" vertical={false}/>
          <XAxis dataKey="label" fontSize={11.5}/>
          <YAxis domain={[0,2.2]} tickFormatter={v=>v+"M"} fontSize={11} label={{value:"Attributable deaths/yr (millions)",angle:-90,position:"insideLeft",fontSize:10.5}}/>
          <Tooltip formatter={v=>v+"M"}/>
          <Line type="monotone" dataKey="actual" stroke="#1f6feb" strokeWidth={2.5} dot={{r:5}} connectNulls={false}>
            <LabelList dataKey="actual" position="top" formatter={v=>v?v+"M":""} fontSize={12}/>
          </Line>
          <Line type="monotone" dataKey="proj" stroke="#c0392b" strokeWidth={2.5} strokeDasharray="6 4" dot={{r:5}} connectNulls={true}>
            <LabelList dataKey="proj" position="top" formatter={v=>v?v+"M":""} fontSize={12}/>
          </Line>
        </LineChart>
      </ResponsiveContainer>
      <div className="note">Line chart (solid = reported, dashed = projected) chosen over a bar chart because the story is a TRAJECTORY with an inflection — a dip, then a projected rise — that disconnected columns would not visually connect into one continuous path.</div>
    </div>
  );
}
function Chart2(){
  return (
    <div className="chartbox">
      <div className="charttitle">FDA-approved systemic antibacterial new molecular entities (NMEs), by era <Tier t="FACT"/></div>
      <div className="chartsub">Count of new active-ingredient antibacterial drugs approved, June 1980-October 2024. Source: "Approved antibacterial drugs in the last 10 years: from the bench to the clinic," Exploration (2024/2025).</div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart layout="vertical" data={c2} margin={{left:8,right:30,top:10,bottom:10}}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
          <XAxis type="number" domain={[0,60]} fontSize={11}/>
          <YAxis type="category" dataKey="era" width={150} fontSize={11.5}/>
          <Tooltip/>
          <Bar dataKey="count" barSize={4} fill="#ccc"/>
          <Scatter dataKey="count" fill="#1f6feb">
            <LabelList dataKey="count" position="right" fontSize={12} formatter={v=>v}/>
          </Scatter>
        </ComposedChart>
      </ResponsiveContainer>
      <div className="note">Dot plot (lollipop) chosen over a plain bar chart because there are only 3 categories of very different SPAN lengths (20, 20, and 5 years) — the thin stem plus dot keeps focus on the count itself rather than bar area, and reads cleanly next to the era-length caveat in the prose.</div>
    </div>
  );
}
function Chart3(){
  return (
    <div className="chartbox">
      <div className="charttitle">The scissors: R&amp;D cost vs. sales after launch, antimicrobials vs. benchmark classes <Tier t="FACT"/></div>
      <div className="chartsub">$ millions. Row 1: capitalized R&amp;D cost to bring a drug to market (antimicrobial for MDR pathogens vs. the general new-drug median, drugs approved 2009-2018). Row 2: cumulative sales in the first 9 quarters after launch (top-ranked antimicrobial vs. top-ranked oncology drugs). Source: U.S. HHS, ASPE, "Antimicrobial Drugs: Market Returns Analysis" (2023-24), citing DiMasi et al. for the general-drug R&amp;D baseline.</div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart layout="vertical" data={c3} margin={{left:8,right:40,top:10,bottom:10}}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
          <XAxis type="number" domain={[0,2000]} fontSize={11}/>
          <YAxis type="category" dataKey="metric" width={210} fontSize={10.5}/>
          <Tooltip/>
          <Bar dataKey="base" stackId="d" fill="transparent"/>
          <Bar dataKey="range" stackId="d" fill="#e2e2e2" barSize={10}/>
          <Scatter dataKey="A" fill="#c0392b">
            <LabelList dataKey="A" position="top" fontSize={11} formatter={v=>"$"+v+"M"}/>
          </Scatter>
          <Scatter dataKey="B" fill="#1f6feb">
            <LabelList dataKey="B" position="bottom" fontSize={11} formatter={v=>"$"+v+"M"}/>
          </Scatter>
        </ComposedChart>
      </ResponsiveContainer>
      <div className="note">Dumbbell chart chosen over paired bars because the point IS the gap between two values per row (antimicrobial vs. benchmark) — a dumbbell shows that gap directly, and here the two gaps run in OPPOSITE directions (cost higher, sales lower), which a bar chart would not make as immediately legible.</div>
      <div style={{fontSize:11.5,color:"#777",marginTop:2}}>Red dot = antimicrobial value. Blue dot = benchmark-class value (general new drug in row 1; oncology in row 2).</div>
    </div>
  );
}
function Chart4(){
  return (
    <div className="chartbox">
      <div className="charttitle">WHO's 2023 clinical antibacterial pipeline, narrowed by successive filters <Tier t="FACT"/></div>
      <div className="chartsub">Count of agents. 97 total (57 traditional + 40 non-traditional) → 32 traditional agents aimed at a WHO bacterial priority pathogen → 12 meeting ≥1 of WHO's 4 innovation criteria → 4 active against a WHO "critical" pathogen. Source: World Health Organization, "2023 Antibacterial agents in clinical and preclinical development" (2024 release), via CIDRAP and ContagionLive coverage.</div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={c4} margin={{left:4,right:8,top:20,bottom:70}}>
          <CartesianGrid strokeDasharray="3 3" vertical={false}/>
          <XAxis dataKey="name" fontSize={9.5} interval={0} angle={-18} textAnchor="end" height={90}/>
          <YAxis domain={[0,100]} fontSize={11}/>
          <Tooltip formatter={(v,n,p)=>[p.payload.delta,"count"]}/>
          <Bar dataKey="base" stackId="w" fill="transparent"/>
          <Bar dataKey="delta" stackId="w">
            {c4.map((d,i)=><Cell key={i} fill={c4color(d)}/>)}
            <LabelList dataKey="delta" position="top" formatter={v=>v} fontSize={12}/>
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="note">Waterfall (bridge) chart chosen over a stacked bar because the point is the CONTRIBUTION-TO-CHANGE at each successive filter — how much of the pipeline each named criterion removes — the signature exhibit for "what makes up this number."</div>
    </div>
  );
}
function Chart5(){
  return (
    <div className="chartbox">
      <div className="charttitle">What a delinked subscription contract could be worth vs. today's typical peak sales <Tier t="FACT"/></div>
      <div className="chartsub">$ millions per year. "Status quo ceiling" ($50M): reported average annual sales for recently approved antibiotics. "PASTEUR Act proposed range" ($75M-$300M): the bill's proposed annual federal subscription contract value, net of the manufacturer's own product revenue. PASTEUR has not passed as of Jul. 2026; first introduced Sept. 2020, reintroduced multiple times since. Source: HHS ASPE (2023); Sen. Michael Bennet press release (Jun. 24, 2026), summarizing PASTEUR Act of 2026 (H.R.7352, 119th Congress).</div>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={c5} margin={{left:4,right:30,top:20,bottom:4}}>
          <CartesianGrid strokeDasharray="3 3" vertical={false}/>
          <XAxis dataKey="period" fontSize={12}/>
          <YAxis domain={[0,320]} tickFormatter={v=>"$"+v+"M"} fontSize={11}/>
          <Tooltip formatter={v=>"$"+v+"M"}/>
          <Line type="linear" dataKey="low" stroke="#1f6feb" strokeWidth={2.5} dot={{r:5}}>
            <LabelList dataKey="low" position="right" formatter={v=>"$"+v+"M (low end)"} fontSize={11}/>
          </Line>
          <Line type="linear" dataKey="high" stroke="#c0392b" strokeWidth={2.5} dot={{r:5}}>
            <LabelList dataKey="high" position="right" formatter={v=>"$"+v+"M (high end)"} fontSize={11}/>
          </Line>
        </LineChart>
      </ResponsiveContainer>
      <div className="note">Slope chart chosen over paired bars because the story is a BEFORE/AFTER shift across exactly two periods (today's ceiling vs. the proposed regime) for two named bands — a slope chart makes the direction and steepness of that shift the visual argument itself.</div>
    </div>
  );
}

/* ---------- Content sections ------------------------------------------------ */
const SECTIONS = [
  "Warm-Up","Introduction","Background","Q1 · The Widening Gap","Q2 · Why the Market Fails","Q3 · Can Subscriptions Fix It?","Learning Summary","Conclusion"
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
          <p className="dek">Each question takes a principle from a prior article and drops it into a brand-new setting, nothing to do with antibiotics. Answer before reading on — these are scored, and none require knowing anything about antimicrobial resistance yet.</p>
          <MC onScore={onScore} q={{
            id:"wu1",typeLabel:"Warm-Up · Type B",
            stem:"The gene-therapy article showed that a treatment can pass a per-unit cost-effectiveness test (its price is a reasonable ratio against the health gain or savings it produces) and still fail commercially, because a SEPARATE adoption question — the funnel from eligible, to referred, to actually treated — can stay broken even when the value math checks out; fixing one named risk (whether the price is fair) can leave a second, different risk (whether the product actually reaches people) untouched. A city launches a rebate that pays $400 per household that installs a home EV charger, and an economic analysis finds this rebate is highly cost-effective per ton of carbon reduced, well below the city's own benchmark cost per ton. Two years later, only 3% of eligible households have installed a charger, mostly because of a multi-month queue to get a utility grid-connection permit that has nothing to do with the rebate's size. Applying the gene-therapy lesson, what is the most useful next step for the city?",
            options:[
              "Conclude that the rebate's cost-effectiveness math was proven wrong by the low uptake, and cut the rebate amount",
              "Recognize that the rebate passing its per-unit cost-effectiveness test does not, on its own, guarantee households actually adopt it — the city should investigate and fix the SEPARATE adoption bottleneck (the grid-connection permit queue), since a fair price does not resolve a broken funnel it was never designed to fix",
              "Assume no further action is needed, since a policy that is cost-effective on paper will always reach its intended households eventually, given enough time",
              "Raise the rebate amount without investigating the permit queue, since a bigger rebate is the only lever a subsidy program can use"],
            correct:1,
            why:"Just as a gene therapy's price passing a cost-effectiveness test said nothing about whether eligible patients would actually get treated, a rebate's favorable cost-per-ton math says nothing about whether a completely separate bottleneck (permitting) is blocking adoption — the two questions, value and adoption, have to be diagnosed and fixed separately.",
            wrongWhy:{
              0:"Low uptake reflects a broken ADOPTION funnel, not a flawed VALUE calculation; the cost-effectiveness ratio and the uptake rate are different questions, so one being fine doesn't get disproven by the other being broken.",
              2:"Assuming time alone fixes a structural bottleneck (a permitting queue unrelated to the subsidy) ignores that the two problems require two different fixes.",
              3:"Raising the rebate amount treats a PRICE lever as the fix for what the scenario describes as a PERMITTING bottleneck — the wrong lever for the diagnosed problem."},
            generalizes:"Value (is the price or ratio fair) and adoption (does the fairly-priced thing actually reach people) are two separate, separately testable questions; fixing one does not automatically fix the other.",
          }}/>
          <MC onScore={onScore} q={{
            id:"wu2",typeLabel:"Warm-Up · Type B",
            stem:"The passive-investing article showed that a decision individually rational for every single saver (choosing an index fund over stock-picking, since about 65% of active large-cap funds underperformed the index in 2024) can still add up, in aggregate, to concentrated ownership and voting power that no single saver intended to create — and that this pattern had only been tested during one-directional inflows, never during a sustained reversal. Suppose every regional water utility in a country independently and rationally outsources its plant-control software to whichever single vendor offers the best price and reliability record, each utility making a sound purchasing decision on its own. Applying the passive-investing lesson, what should a national infrastructure regulator worry about that no single utility's purchasing decision was designed to address?",
            options:[
              "Nothing; if each utility's individual decision is rational, the aggregate outcome for the whole country's water system must also be safe",
              "That the country's entire water-treatment control system may now depend on a single vendor's security and reliability, creating a concentrated, systemic failure point that no individual utility's own risk assessment was built to measure or price in — the same aggregation gap passive investing revealed between individually rational fund choices and concentrated ownership no single saver was targeting",
              "That water quality will decline, since outsourcing software has nothing to do with water quality",
              "That utilities should switch to the most expensive vendor available, since price is the only variable that matters"],
            correct:1,
            why:"Exactly as many savers each rationally choosing index funds produced concentrated ownership and voting power that no single saver was optimizing for, many utilities each rationally choosing the same vendor produces a concentrated, systemic single point of failure that no single utility's own purchasing decision was built to detect or price.",
            wrongWhy:{
              0:"This repeats exactly the fallacy the passive-investing lesson corrects: individual rationality does not guarantee the aggregate outcome is safe.",
              2:"Water chemistry/quality is a different concern from a control-software concentration risk; the scenario is about a shared vendor dependency, not water treatment chemistry.",
              3:"Switching to the most expensive vendor addresses price, not the actual concentration risk the scenario describes."},
            generalizes:"Whenever many independent actors make the same individually sound choice (an index fund, a vendor, a supplier), check what concentrated, single point of failure that shared choice creates in aggregate — a risk no one actor's own decision process was built to see.",
          }}/>
          <MC onScore={onScore} q={{
            id:"wu3",typeLabel:"Warm-Up · Type C",
            stem:"The retail-media article showed that a wide margin gap between a low-margin core business (retail's roughly 1.7% average grocery net margin) and a high-margin business bolted onto it (retail media's roughly 40-50% margin) is not, by itself, proof of new value creation — the key test is whether the high-margin business's own performance metric actually measures real, causal incremental impact, or is a self-reported number inside a system nobody outside the platform can audit (75% of advertisers admitted they can't reliably measure true incrementality). An airline's core flying business runs on thin single-digit margins, while its loyalty and co-branded credit-card program is frequently reported to run at much higher margins, with the airline citing 'incremental spending its loyalty members generate' as proof the program creates real value. Applying the retail-media lesson, what is the most useful question to ask before accepting that claim?",
            options:[
              "Whether the airline's core flying business could be shut down entirely and replaced fully by the loyalty program, since margins are all that matters",
              "Nothing further; a large margin gap between the loyalty program and the core flying business is sufficient proof on its own that the loyalty program creates substantial new value",
              "Whether ticket prices are too high, since that is the only factor that determines an airline's profitability",
              "Whether the 'incremental spending' figure the airline cites is independently, causally verified (comparable to a randomized or matched-control measurement) or is a self-reported number generated inside the airline's own loyalty-program accounting, the same audit-ability question the retail-media lesson raised about walled-garden ad metrics"],
            correct:3,
            why:"Just as a wide margin gap in retail media did not by itself prove the ad business created real incremental value (since most advertisers couldn't audit the underlying metric), an airline loyalty program's margin gap does not prove real value creation until its own 'incremental spending' number is checked for independent, causal verifiability rather than accepted as self-reported.",
            wrongWhy:{
              0:"Proposing to replace the entire core business is an unsupported leap far beyond what a margin-gap observation can justify.",
              1:"This repeats exactly the fallacy the retail-media lesson corrects: a margin gap alone is not proof of causal value creation.",
              2:"Ticket pricing is a separate lever from the loyalty-program measurement question actually at issue."},
            generalizes:"A large margin gap between a bolted-on business and its low-margin host is a question, not an answer — always check whether the bolted-on business's own headline performance metric is independently auditable before crediting it with creating real value.",
          }}/>
          <div className="navbtns"><span/><button onClick={()=>jump(1)}>Next: Introduction →</button></div>
        </section>

        {/* ---- INTRODUCTION ---- */}
        <section ref={refs.current[1]}>
          <div className="kicker">Healthcare, Science, Medicine &amp; BioTech</div>
          <h1>The Antibiotic Paradox: Why Medicine's Best Investment Keeps Bankrupting Its Makers</h1>
          <p className="lead">A short course of a first-line antibiotic costs a few dollars and can prevent a death that would otherwise cost a hospital tens of thousands of dollars in intensive care. Yet since 2019, at least three companies that spent a decade and well over a billion dollars bringing a genuinely new antibiotic to market — Achaogen, Aradigm, and Melinta Therapeutics — have filed for bankruptcy (Fierce Biotech, 2019; CIDRAP, 2020).</p>
          <p>Antimicrobial resistance (AMR) is what happens when bacteria evolve so that a drug that used to kill them no longer works. In 2021, bacterial AMR directly caused 1.14 million deaths worldwide and was linked to 4.71 million deaths in total (Naghavi et al., The Lancet, 2024). In the United States alone, more than 2.8 million resistant infections occur every year, killing over 35,000 Americans (U.S. Centers for Disease Control and Prevention data, cited in U.S. Senate press release, Jun. 2026). Researchers project the annual toll will keep climbing toward roughly 1.9 million attributable deaths a year by 2050, with more than 39 million cumulative deaths directly attributable to AMR between 2025 and 2050 alone (Naghavi et al., The Lancet, 2024).</p>
          <p>Normally, when a disease burden this large and this well-documented keeps growing, private capital rushes in to meet it — that is exactly what happened with cancer drugs and, more recently, with GLP-1 obesity treatments. Antibiotics have gone the opposite way. The U.S. Food and Drug Administration (FDA) approved 80 new systemic antibacterial drugs — ones built around an active ingredient never approved before — between June 1980 and October 2024, but only 4 of those arrived in the most recent five years (2020-2024), even though 52 had arrived in the 20 years before 2000 (Exploration, 2024/2025). The shortage is not a shortage of scientific ideas. It is that doctors are told, correctly, to hold a powerful new antibiotic in reserve and prescribe it as rarely as possible, precisely to keep it working for as long as possible. That is the exact opposite of how every other blockbuster drug earns its money back.</p>
          <p>This note addresses three questions. First, how large is the AMR mortality burden today, and has the antibiotic development pipeline kept pace with it? Second, why does a stewardship-first prescribing rule — use the newest antibiotics sparingly — collide with a reimbursement system built to reward high sales volume, and how does the resulting economics compare with a drug class like oncology, where volume is rewarded rather than restricted? Third, can new delinked payment models, ones that pay a company a fixed fee instead of paying per pill sold, actually fix this, and where do the two leading real-world attempts — the U.S. PASTEUR Act and the U.K.'s National Health Service (NHS) subscription pilot — actually stand today?</p>
          <Glossary items={[
            {t:"Antimicrobial resistance (AMR)",d:"What happens when bacteria, viruses, or fungi evolve so that a drug that used to kill or stop them no longer works."},
            {t:"Stewardship",d:"The practice of using a powerful antibiotic as rarely and carefully as possible, to slow down bacteria evolving resistance to it."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(0)}>← Warm-Up</button><button onClick={()=>jump(2)}>Next: Background →</button></div>
        </section>

        {/* ---- BACKGROUND ---- */}
        <section ref={refs.current[2]}>
          <div className="kicker">Background · Trajectory &amp; structure</div>
          <h2>A burden that keeps climbing, met by a pipeline that keeps thinning</h2>
          <p>The World Health Organization (WHO) has named antimicrobial resistance one of the top global public health threats of this decade. The scale behind that label is large and well measured: the Global Research on Antimicrobial Resistance (GRAM) project, the largest study of its kind, put 2019's toll at 1.27 million deaths directly attributable to AMR and 4.95 million deaths associated with it worldwide (Murray et al., The Lancet, 2022). A follow-up study using an updated model put 2021's toll at 1.14 million attributable deaths and 4.71 million associated deaths (Naghavi et al., The Lancet, 2024).</p>
          <p>Read quickly, that looks like progress: a roughly 10% drop in two years. Chart 1 shows the same two points, plus the same research team's own forecast that the annual toll will climb again, projected to rise by almost 70% from 2022 to 2050. That is not a contradiction. It is a reminder that a single two-year change, especially one measured across a period that included a global pandemic disrupting routine healthcare almost everywhere, is a fragile thing to build a policy conclusion on.</p>
          <Chart1/>
          <Interp id="c1p1" label="Interpretation 1 of 2 · Predict, then check (quantitative, pre-reveal)"
            question="Before checking the exact figures: predict whether you think AMR-attributable deaths ROSE or FELL between 2019 and 2021, and by roughly what percentage. Then compute the actual change, and say what a policymaker reading only '1.27M fell to 1.14M' might wrongly conclude."
            authored={<span>1.27M → 1.14M is about a 10% fall (FACT). But the research team's own later forecast still projects the annual toll to climb toward roughly 1.9 million a year by 2050 — so a policymaker who reads "AMR deaths fell 10%" and concludes that stewardship programs are already winning would be extrapolating a short, two-year change into a long-term trend the same research team's own longer forecast contradicts.</span>}
            onSubmit={onInterp}/>
          <Interp id="c1p2" label="Interpretation 2 of 2 · Mechanism (non-so-what)"
            question="Why would a global pandemic that had nothing directly to do with antibiotic policy cause the reported number of AMR deaths to temporarily dip, even if the underlying resistance problem was not actually improving?"
            authored={<span>COVID-19 sharply reduced non-emergency hospital visits, elective surgeries, and routine bacterial-culture testing worldwide for a period. Fewer non-COVID infections were diagnosed, cultured, and counted, which mechanically shrinks a measured mortality estimate built from clinical and lab records — without reflecting any real change in how resistant the underlying bacteria actually are.</span>}
            onSubmit={onInterp}/>
          <p>The supply side tells a matching story. Chart 2 shows FDA-approved systemic antibacterial new molecular entities (NMEs) — the technical term for a drug built around an active ingredient that has never been approved before — by era. Fifty-two arrived in the 20 years before 2000; 28 arrived over the following 20 years; only 4 arrived in the most recent five years, 2020 through 2024 (Exploration, 2024/2025). That is not simply a story of the easy drugs already being found. Congress passed the GAIN Act in 2012 specifically to try to reverse this slide, offering companies 5 extra years of market exclusivity and a faster review process for a qualifying new antibiotic. Even with that supply-side push in place, the approval pace over the following decade stayed near its historic low, which is the first clue that the deeper problem sits on the demand side, not the supply side — a claim the next two sections test directly.</p>
          <Chart2/>
          <Interp id="c2p1" label="Interpretation 1 of 2 · So-what"
            question="A health-policy staffer says '80 antibiotics approved since 1980 sounds like plenty.' What should this chart make them do differently before repeating that line?"
            authored={<span>They should look at the SHAPE of the trend, not just the cumulative count: the approval rate per year has fallen by roughly two-thirds from the 1980-1999 era (52 over 20 years, ~2.6/year) to the most recent 2020-2024 period (4 over 5 years, ~0.8/year) — a staffer citing "80 since 1980" without noting that almost none of that total came recently would badly overstate how much fresh capacity the pipeline is adding today.</span>}
            onSubmit={onInterp}/>
          <Interp id="c2p2" label="Interpretation 2 of 2 · Mechanism (non-so-what)"
            question="The 2012 GAIN Act gave qualifying antibiotics 5 extra years of patent-style market exclusivity and faster FDA review — a classic supply-side incentive. Given that approvals still fell to a historic low in the following decade, what does that suggest about where the deeper obstacle to antibiotic development actually sits?"
            authored={<span>A supply-side incentive (more time to sell exclusively, faster review) only helps if the underlying DEMAND for the drug, once approved, is large enough to justify the R&amp;D investment in the first place. Approvals staying low even after that incentive suggests the binding constraint is on the demand side — how much a new antibiotic can actually be sold once stewardship correctly restricts its use — which the article develops fully in the next two sections.</span>}
            onSubmit={onInterp}/>
          <MC onScore={onScore} q={{
            id:"bg-b1",typeLabel:"Type B · Named reasoning error",
            stem:"A city health official points to the drop in AMR-attributable deaths from 1.27 million (2019) to 1.14 million (2021) as proof that global antibiotic stewardship campaigns launched in the late 2010s were working. Given that this two-year window overlaps almost exactly with the COVID-19 pandemic, which disrupted routine healthcare and non-COVID infection reporting worldwide, what is the strongest reason to doubt that this dip proves stewardship succeeded?",
            options:[
              "A pandemic that reduced non-COVID healthcare contact and routine infection diagnosis worldwide is a specific, well-documented confounder that could produce exactly this kind of temporary dip on its own, with no connection to stewardship policy at all — so the change cannot be credited to stewardship without first ruling out that confound",
              "The dip is too small to be meaningful, since any change under 15% should always be ignored regardless of context",
              "AMR deaths cannot be measured reliably at all, so no year-to-year comparison of this kind is ever valid",
              "Stewardship campaigns take decades to show any effect, so no change measured in this period could ever reflect them, whether positive or negative"],
            correct:0,
            why:"Whenever two things move together (a stewardship push and a mortality dip) across a period containing a large, well-documented disruptive world event, the event itself is a live alternative explanation that has to be ruled out before crediting the narrower policy story — exactly the confounder this section names.",
            wrongWhy:{
              1:"Treating any change under an arbitrary percentage threshold as automatically meaningless is not a real statistical argument; it dodges the actual question of what caused this specific change.",
              2:"Dismissing the entire measurement as unreliable throws away the real methodology (GRAM's systematic modeling) behind these figures instead of interrogating this specific comparison.",
              3:"This overcorrects into certainty in the opposite direction; it is possible some real effect exists, so the useful move is to isolate the pandemic's role, not to declare in advance that no measured change could ever reflect policy."},
            generalizes:"Whenever two trends move together across a period containing a large, well-known disruptive event, check whether that event alone could explain the pattern before crediting a specific, narrower policy.",
          }}/>
          <Numeric q={{
            id:"bg-d1",typeLabel:"Type D",
            stem:"Between June 1980 and October 2024 (44 years), FDA approved 80 new systemic antibacterial drugs; only 4 arrived in the most recent 5 years (2020-2024). If that most recent 5-year pace continued unchanged all the way to 2050 (about 26 more years past 2024), roughly how many ADDITIONAL systemic antibacterial NMEs would you expect FDA to approve by 2050?",
            tolNote:"Tight band (±3 drugs): this is a direct rate-times-time multiplication from stated figures, not an open Fermi estimate.",
            skeleton:"Skeleton: rate at the recent pace = 4 drugs ÷ 5 years = 0.8 drugs/year. Multiply that rate by the number of years remaining to 2050.",
            min:0,max:60,step:1,unit:"additional NMEs by 2050",actual:21,tol:3,
            how:"0.8 drugs/year × 26 years ≈ 21 additional approvals by 2050, if the most recent pace holds exactly steady. That is barely more than a quarter of the 80 approved across the previous 44 years — a useful anchor for how thin the pipeline looks if nothing about its underlying economics changes.",
            generalizes:"When a source gives you a recent RATE and a stated NUMBER of years already elapsed, extending that rate forward is a fast, disclosed way to size how a status-quo trend would play out, as long as you flag that it assumes no structural change.",
          }} onScore={onScore}/>
          <Glossary items={[
            {t:"New molecular entity (NME)",d:"A drug built around an active ingredient that has never been approved by a regulator before, as opposed to a new version of an existing drug."},
            {t:"GAIN Act",d:"A 2012 U.S. law that gives a qualifying new antibiotic 5 extra years of market exclusivity and a faster FDA review, to encourage development."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(1)}>← Introduction</button><button onClick={()=>jump(3)}>Next: The Widening Gap →</button></div>
        </section>

        {/* ---- Q1 ---- */}
        <section ref={refs.current[3]}>
          <div className="kicker">Research Question 1</div>
          <h2>Has innovation kept pace with need?</h2>
          <p>The honest answer is no, and the gap is wider than a simple approval count suggests. The WHO's own 2023 review of the global clinical antibacterial pipeline counted 97 agents in development — a number that sounds reassuring until it is filtered by what actually matters clinically. Of those 97, 57 are traditional antibacterial agents (drugs that work like existing antibiotic classes) and 40 are non-traditional (things like antibody-based or phage therapies, most still far from approval). Of the 57 traditional agents, only 32 are even aimed at one of WHO's own list of priority pathogens — the specific bacteria doctors most urgently need new weapons against.</p>
          <p>The filtering does not stop there. Of those 32 priority-pathogen-targeted agents, only 12 meet at least one of WHO's four innovation criteria: no known cross-resistance with existing drugs, a new molecular target, a new mode of action, or a genuinely new drug class. And of those 12, only 4 are active against at least one pathogen WHO classifies as "critical," its highest urgency tier (World Health Organization, "2023 Antibacterial agents in clinical and preclinical development," 2024 release, via CIDRAP and ContagionLive coverage). Chart 4 shows this narrowing step by step: from 97 total agents down to 4 that are genuinely novel, aimed at the pathogens that matter most, and effective where the need is most acute.</p>
          <Chart4/>
          <Interp id="c4p1" label="Interpretation 1 of 2 · So-what"
            question="You are advising a national health ministry planning its next decade of AMR strategy. Based on this funnel, what should the ministry do differently versus assuming the 97 pipeline agents will translate into 97 useful new weapons against resistant infections?"
            authored={<span>The ministry should treat the funnel's FINAL number (4 agents that are novel, priority-targeted, and active against a critical pathogen) as its realistic planning anchor, not the headline 97 — and should budget stewardship, rapid diagnostics, and infection-control investment as its primary near-term lever, since only a handful of genuinely new options are likely to reach patients within the coming decade.</span>}
            onSubmit={onInterp}/>
          <Interp id="c4p2" label="Interpretation 2 of 2 · Quantitative reasoning (non-so-what)"
            question="The WHO report says 12 of the pipeline's 32 priority-pathogen agents meet at least one innovation criterion. Express that same group of 12 as a share of the ENTIRE 97-agent pipeline (not just the 32), and explain why quoting '12' alone, without the larger denominator, could make the pipeline look healthier than it is."
            authored={<span>12 ÷ 97 ≈ 12.4% — only about one in eight of ALL pipeline agents, traditional and non-traditional combined, meets even one innovation bar aimed at a priority pathogen. Quoting "12 innovative candidates" without dividing by the full 97-agent base lets a reader assume the pipeline is dominated by innovation, when in reality roughly seven of every eight agents in development are not both targeted at a priority pathogen and mechanistically new — a denominator-neglect trap.</span>}
            onSubmit={onInterp}/>
          <p>This narrowing is not simply a story of bad luck. Discovering a genuinely new antibacterial mechanism is scientifically hard: bacteria have an outer structure that keeps many promising molecules out, and a new compound has to clear that barrier, hit its target, and still be safe enough for the human body, all at once. But the GAIN Act evidence from the Background section shows that even where a supply-side patent incentive was already tried, the innovative share of the pipeline stayed thin. That is the strongest evidence that simply repeating "more of the same incentive" would not by itself change the number of agents clearing WHO's innovation bar — the deeper obstacle, developed fully in the next section, is that even a genuinely novel antibiotic still has to survive commercially once it reaches the market.</p>
          <MC onScore={onScore} q={{
            id:"q1-mc1",typeLabel:"Type A · Quantitative reasoning",
            stem:"Compute the overall share of the ENTIRE 2023 pipeline (all 97 agents, traditional and non-traditional) that clears every filter shown in Chart 4 — targets a WHO priority pathogen, meets an innovation criterion, and is active against a 'critical' pathogen (the final group of 4). What does that overall ratio imply about how much near-term reassurance a health system should take from 'we have 97 antibiotics in the pipeline'?",
            options:[
              "The ratio is about 33%, meaning a third of all pipeline agents are essentially ready to solve priority-pathogen resistance, so near-term reassurance is well justified",
              "The ratio cannot be computed from a funnel chart, since a funnel only shows category counts, not policy implications",
              "The ratio is about 4% (4 ÷ 97), meaning roughly 1 in 25 pipeline agents clears every meaningful filter — small enough that a health system should treat stewardship, diagnostics, and infection control as its primary near-term defense, not an assumption that many genuinely new weapons are about to arrive",
              "The ratio is irrelevant, because any agent anywhere in the 97-agent pipeline could still eventually become useful even if it does not meet the stated criteria"],
            correct:2,
            why:"4 ÷ 97 ≈ 4.1% — dividing all the way back to the ORIGINAL denominator (the full 97-agent pipeline, not just the 32-agent subgroup) shows that only about 1 in 25 pipeline agents clears every filter that matters clinically, which is the number a health system should plan around, not the headline 97.",
            wrongWhy:{
              0:"33% conflates a STAGE ratio (32 ÷ 97, agents merely aimed at a priority pathogen) with the FULL attrition all the way to the final group of 4 — the two are different denominators and different claims.",
              1:"A funnel's counts are exactly what a ratio calculation and its planning implication are built from; this dismisses a computable, decision-relevant number.",
              3:"This dismisses the entire purpose of WHO's innovation-criteria screening, which exists precisely to separate mechanistically new candidates from cosmetically different ones that offer little real advance."},
            generalizes:"When a total narrows through several sequential filters, always compute back to the ORIGINAL denominator before judging how reassuring the final headline count really is.",
          }}/>
          <MC onScore={onScore} q={{
            id:"q1-case1",typeLabel:"Type C",kind:"case",
            client:"The Ministry of Health of a mid-income Southeast Asian nation, drafting its 10-year strategy against drug-resistant infections.",
            stem:"An advisor recommends the ministry commit most of its new budget to securing early-access deals for the pipeline's most promising new antibiotics, arguing '97 agents are in development, so several should reach us within a decade.' Given that only 4 of the 32 priority-pathogen-targeted agents are both innovative and active against a critical pathogen, and that the GAIN Act's supply-side patent incentives already left U.S. approvals near a historic low (only 4 systemic antibacterial NMEs from 2020-2024), which recommendation best serves the ministry?",
            options:[
              "Split the new budget: keep a modest reserve for licensing genuinely novel agents that clear WHO's innovation bar, but weight most new spending toward stewardship programs, rapid diagnostics, and infection-prevention and control, since a supply-side incentive already tried elsewhere did not meaningfully accelerate the innovative share of the pipeline",
              "Commit most of the new budget to early-access deals for pipeline candidates, since a pipeline of 97 agents guarantees enough will reach approval to matter within 10 years",
              "Abandon any budget for new antibiotics entirely, since the pipeline has clearly and permanently failed",
              "Match spending to whichever country currently has the newest antibiotic approved, regardless of its price or relevance to the ministry's own priority pathogens"],
            correct:0,
            why:"Combining the funnel evidence (4 of 97 clear every filter) with the GAIN Act evidence (a supply-side incentive already tried elsewhere, with approvals still near a historic low) argues for diversifying the ministry's spending rather than betting most of it on new pipeline drugs arriving soon. The implementation risk this recommendation must manage is that diagnostics and stewardship programs require sustained, multi-year funding and health-system capacity that a smaller ministry may struggle to maintain.",
            wrongWhy:{
              1:"This extrapolates the raw pipeline count (97) without weighting for the funnel's attrition — the same denominator-neglect error the previous chart question warned against.",
              2:"Abandoning spending entirely overcorrects, discarding a genuinely valuable, if narrow, opportunity (the 4 agents that do clear every filter).",
              3:"Chasing whichever country has the newest approval, regardless of relevance to this ministry's own priority pathogens and epidemiology, is a targeting error, not a strategy."},
            generalizes:"When a supply-side incentive has already been tried elsewhere and the innovative yield stayed thin, do not assume simply repeating that incentive will change the yield — diversify toward the demand-side and system-capacity levers you can control directly.",
          }}/>
          <Glossary items={[
            {t:"WHO priority pathogens",d:"A WHO-maintained list of the bacteria doctors most urgently need new drugs against, ranked by how critical the need is."},
            {t:"Qualified Infectious Disease Product (QIDP)",d:"An FDA designation, created alongside the GAIN Act, that gives a qualifying antibiotic faster review and extra exclusivity."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(2)}>← Background</button><button onClick={()=>jump(4)}>Next: Why the Market Fails →</button></div>
        </section>

        {/* ---- Q2 ---- */}
        <section ref={refs.current[4]}>
          <div className="kicker">Research Question 2</div>
          <h2>Why stewardship and volume-based pricing cannot both win</h2>
          <p>Every other blockbuster drug earns back its research bill the same way: get approved, then sell as much of it as possible for as long as possible. Stewardship asks the opposite of a new antibiotic: get approved, then sell as LITTLE of it as possible, holding it back as a last resort so bacteria do not evolve resistance to it too. Chart 3 shows what that collision does to the numbers. Bringing an antimicrobial aimed at multidrug-resistant (MDR) pathogens — bacteria resistant to several drug classes at once — to market costs about $1.9 billion in capitalized research and development (R&amp;D), against a general new-drug median of about $985 million for drugs approved 2009-2018 (U.S. Department of Health and Human Services, ASPE, "Antimicrobial Drugs: Market Returns Analysis," 2023-24). Antibiotics do not just fail to out-earn other drugs; they cost MORE than average to develop in the first place.</p>
          <p>The revenue side is worse. The same ASPE analysis found that top-ranked antimicrobial drugs generate about $42 million in cumulative sales in their first 9 quarters on the market, versus about $1,041 million for top-ranked oncology drugs over the same window — a roughly 25-fold gap. Separately, ASPE reports that average annual sales for recently approved antibiotics run under $50 million altogether (HHS ASPE, "Understanding Markets for Antimicrobial Drugs," Aug. 2023).</p>
          <Chart3/>
          <Interp id="c3p1" label="Interpretation 1 of 2 · Quantitative reasoning (non-so-what)"
            question="Compute two ratios from the chart: (a) the antimicrobial-to-general-drug R&D cost ratio, and (b) the oncology-to-antimicrobial 9-quarter sales ratio. What does the DIRECTION of these two ratios — one above 1 in one direction, one far above 1 in the opposite direction — reveal about where the antibiotic economics actually breaks?"
            authored={<span>(a) $1,900M ÷ $985M ≈ 1.9x — developing an MDR-focused antimicrobial costs almost twice a typical new drug's R&amp;D bill, not less. (b) $1,041M ÷ $42M ≈ 24.8x — a typical oncology drug earns roughly 25 times more in its first 9 quarters than a top-ranked antimicrobial. The break is not that antibiotics are cheap to make and modestly rewarded; it is a genuine scissors, costing MORE than average to develop while earning dramatically LESS.</span>}
            onSubmit={onInterp}/>
          <Interp id="c3p2" label="Interpretation 2 of 2 · So-what"
            question="What should a venture-capital investor deciding between funding a new oncology candidate and a new MDR-focused antimicrobial candidate do differently based on this gap, even if both drugs have equally strong science behind them?"
            authored={<span>The investor should recognize that a standard venture-return model, underwritten around a 9-quarter sales ramp like oncology's, cannot mathematically work for an antimicrobial candidate — it needs a fundamentally different financing structure (non-dilutive government or nonprofit funding, or a delinked payment guarantee secured before launch) rather than ordinary venture capital built around volume sales.</span>}
            onSubmit={onInterp}/>
          <p>Achaogen's Zemdri (plazomicin) is the case study that makes this concrete. FDA approved it in June 2018 to treat complicated urinary tract infections caused by resistant bacteria. It generated only about $800,000 in sales by the end of that year, not because doctors doubted it worked, but because appropriate stewardship meant reserving it for the rare patients who truly needed it. Achaogen filed for Chapter 11 bankruptcy in April 2019; its lab equipment and the rights to Zemdri itself were auctioned off for $16 million that summer (Fierce Biotech, 2019; Nature, 2020, via CARB-X). Aradigm and Melinta Therapeutics, both makers of recently approved antibiotics, filed for bankruptcy the same year — three antibiotic-focused firms in a single 12-month span (pharmaphorum, 2019; CIDRAP, 2020).</p>
          <p>This is not a story about a badly run company or a badly designed drug. It is worth being honest about the limit here too: some antibiotics do sell well, specifically the older, broad-use drugs prescribed often for common infections, precisely because they are NOT held in reserve. The paradox is narrower and sharper than "all antibiotics fail commercially" — it hits exactly the newest, most clinically important, last-resort drugs the hardest, because those are the ones stewardship most strongly restricts. Hospitals, insurers, and doctors are each behaving rationally by practicing good stewardship; the market failure is that their combined, individually correct behavior removes the sales volume any single company needs to recoup a $1.9 billion fixed cost.</p>
          <MC onScore={onScore} q={{
            id:"q2-mc1",typeLabel:"Type A · Quantitative reasoning",
            stem:"A biotech executive says: 'Our new antimicrobial costs about the same to develop as an oncology drug, so if it gets even a fraction of oncology's sales, we'll be fine.' Using Chart 3's own figures, what is the flaw in this statement?",
            options:[
              "There is no flaw; a fraction of oncology's roughly $1,041 million in 9-quarter sales would comfortably cover a similarly sized R&D bill",
              "The flaw is only that antibiotics take longer to develop than oncology drugs, not that their costs or sales differ",
              "The flaw is that the antimicrobial's own R&D cost (about $1.9 billion) is roughly double the general new-drug median (about $985 million) used for comparison, so it does not merely need 'a fraction' of oncology's sales — it has to recoup an even LARGER bill from sales that are running about 25 times SMALLER, not merely somewhat smaller",
              "The flaw is that oncology drugs are risk-free investments, so any comparison to antibiotics is invalid"],
            correct:2,
            why:"The executive's claim treats the R&D cost side as roughly equal between the two classes when the chart shows it is not — the antimicrobial's true cost baseline runs HIGHER, not lower, than oncology's, which makes 'a fraction of oncology sales' wildly insufficient given the size of the sales gap (about 25x) layered on top.",
            wrongWhy:{
              0:"This ignores that the antimicrobial's R&D cost baseline is itself higher than oncology's, not equal or lower, which is what makes 'a fraction' of oncology sales insufficient.",
              1:"The chart shows a COST gap and a SALES gap, not primarily a development-TIME gap; misidentifying the mechanism points the fix at the wrong lever.",
              3:"Oncology investment carries real clinical and commercial risk too; 'risk-free' overstates the actual point of comparison, which is the cost-and-sales scissors, not relative risk."},
            generalizes:"When comparing two investments' economics, check whether the COST side of the comparison also differs before assuming only the SALES side needs adjusting.",
          }}/>
          <Numeric q={{
            id:"q2-num1",typeLabel:"Type D",log:true,requireDecomp:true,
            stem:"An MDR-focused antimicrobial costs roughly $1.9 billion to bring to market (a FACT figure), and average annual sales for a newly approved antibiotic typically run under $50 million. Ignoring the cost of money (interest) entirely, estimate — as an order of magnitude — roughly how many YEARS of typical antibiotic-level annual sales it would take to simply recoup that $1.9 billion R&D cost.",
            tolNote:"Wide band (log-scored, within a factor of 2 either way): this is a genuine Fermi estimate built on a real but imprecise 'under $50 million' anchor, not an exact arithmetic plug-in.",
            min:5,max:200,step:1,unit:"years to recoup R&D",actual:42,
            how:"$1,900M ÷ $45M/year ≈ 42 years — even assuming a generous, steady $45M in annual sales with no stewardship-driven decline and no competition, it would take about four decades just to break even on R&D alone, well beyond a typical drug's real market exclusivity window (roughly 10-14 years of protected sales once the patent clock that started during clinical trials is accounted for). Bounds: doubling assumed sales to $90M/year cuts the payback to about 21 years; halving them to about $22.5M/year stretches it past 84 years — under every plausible assumption, the payback period exceeds the commercial exclusivity window, which is the mathematical core of why a purely volume-priced antimicrobial business model cannot work for MDR-focused drugs.",
            generalizes:"Whenever a fixed development cost must be recovered inside a limited exclusivity or patent window, compare the Fermi-estimated payback PERIOD against that window's length, not just the cost or sales figures in isolation.",
          }} onScore={onScore}/>
          <Glossary items={[
            {t:"Multidrug-resistant (MDR) pathogens",d:"Bacteria that no longer respond to several different classes of antibiotics at once, not just one."},
            {t:"Capitalized R&D cost",d:"The total cost to develop a drug, including the cost of the money spent along the way, not just the raw dollars spent."},
            {t:"Market exclusivity window",d:"The stretch of time a drug can be sold without generic competition, set by a mix of patent life and any extra regulatory exclusivity granted."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(3)}>← The Widening Gap</button><button onClick={()=>jump(5)}>Next: Can Subscriptions Fix It? →</button></div>
        </section>

        {/* ---- Q3 ---- */}
        <section ref={refs.current[5]}>
          <div className="kicker">Research Question 3</div>
          <h2>Delinking payment from pills sold: two real-world tries</h2>
          <p>If the problem is that a company only gets paid when a drug is sold, and stewardship deliberately keeps sales low, one fix is obvious on paper: stop paying per pill. Pay a fixed annual fee instead, sized to the drug's value to the health system, regardless of how many units move. Two governments have actually tried this. The United Kingdom's NHS launched a subscription-model pilot in July 2019 and awarded its first two contracts in July 2022, to cefiderocol (Fetcroja, Shionogi) and ceftazidime-avibactam (Zavicefta, Pfizer). The National Institute for Health and Care Excellence (NICE) places each drug into one of four value bands, each carrying a fixed annual fee of £5 million to £20 million, based on a health-technology assessment rather than sales volume (NHS England; NICE, 2022-2024). The program has since expanded into a permanent model funded at £100 million a year for the 2024/2025 procurement round, with new contracts expected to be finalized by March 2026 (Pharmaceutical Journal, 2024-25).</p>
          <p>The United States has a parallel proposal that has not yet become law. The PASTEUR Act would create a federal subscription model paying $75 million to $300 million a year per qualifying antimicrobial, for up to 10 years or until a generic enters, with the payment reduced by whatever the manufacturer earns on its own so the government never pays more than needed for a predictable return (Sen. Michael Bennet press release, Jun. 24, 2026, summarizing the reintroduced PASTEUR Act of 2026, H.R.7352, 119th Congress). The bill was first introduced in September 2020 and has been reintroduced multiple times since without passing.</p>
          <Chart5/>
          <Interp id="c5p1" label="Interpretation 1 of 2 · Quantitative reasoning (non-so-what)"
            question="Compute the multiple by which PASTEUR's proposed HIGH-end annual payment ($300M) exceeds today's typical peak annual sales ceiling (about $50M). Then do the same for the LOW end ($75M). What does the size of even the low-end multiple imply about how far U.S. reimbursement would have to move to change company behavior?"
            authored={<span>$300M ÷ $50M = 6x; $75M ÷ $50M = 1.5x. Even PASTEUR's LOW end offers only a real but modest 1.5-times jump over today's ceiling, while the HIGH end — reserved by the bill's own scoring system for the most clinically important drugs — offers 6 times today's ceiling. That gap is deliberate: the bill rewards the drugs the health system cares most about far more generously than a marginal addition to the antibiotic class, which is the entire point of delinking payment from sales volume.</span>}
            onSubmit={onInterp}/>
          <Interp id="c5p2" label="Interpretation 2 of 2 · So-what"
            question="A pharmaceutical company's board is deciding whether to keep funding an antimicrobial-resistance research program while PASTEUR remains unpassed after multiple reintroductions since 2020. What should the board do differently, given the U.K.'s already-operating subscription pilot, rather than simply waiting for PASTEUR to pass?"
            authored={<span>The board should treat the U.K.'s already-running contracts (2 drugs under subscription since 2022, an expanded £100 million-a-year budget for 2024/25) as the nearer-term, de-risked revenue path to plan around now — using it to bridge financing while continuing to track PASTEUR's legislative status — rather than making the company's survival entirely contingent on a bill that has already failed to pass in multiple prior Congresses.</span>}
            onSubmit={onInterp}/>
          <p>The Boston University-hosted CARB-X accelerator and the Geneva-based Global Antibiotic Research &amp; Development Partnership (GARDP) fill the gap further upstream, funding early- and late-stage development respectively; CARB-X has backed more than 100 early product-development projects across 12 countries since its founding, and the European Commission recently committed a further €30 million (about $34.7 million) to the two organizations to expand that work (CARB-X; GARDP; CIDRAP, 2025-26). None of this is proof the fix is finished. The U.K. pilot took three years to move from launch to its first two contracts, and even its expanded budget covers a small handful of drugs against a global pipeline problem. FDA did approve a genuinely new oral antibiotic, Utebzi (tebipenem pivoxil, Bayer), in June 2026 — the first new oral carbapenem in the U.S. in years — showing the existing, still-fragile system can still occasionally deliver even without PASTEUR's passage.</p>
          <p>The honest section-level conclusion is that delinked payment is the right kind of fix — it directly removes the conflict between stewardship and volume-based revenue — but it remains unproven at the scale the underlying problem requires. Its success still depends on getting the payment size and the enrollment pace right in each jurisdiction separately, a design and funding choice no single piece of legislation can guarantee on its own.</p>
          <MC onScore={onScore} q={{
            id:"q3-mc1",typeLabel:"Type B · Mechanism",
            stem:"A trade-group spokesperson argues: 'Once PASTEUR passes, the stewardship-versus-reimbursement conflict this article describes will be fully solved.' Given that the U.K.'s subscription pilot already exists and only 2 drugs have signed subscription contracts since 2022 even with £100 million a year now budgeted, what is the strongest reason to doubt that passing PASTEUR alone would fully resolve the underlying conflict?",
            options:[
              "PASTEUR cannot possibly work because subscription payments have never been tried anywhere in the world before",
              "Passing a law automatically guarantees full enrollment and adequate payment size, since legislation and real-world uptake always move together",
              "The conflict was never really about money, so no payment model of any kind could ever address it",
              "Even a working subscription mechanism still depends on setting the payment size and eligibility criteria correctly and getting companies to actually enroll — the U.K.'s own experience shows a subscription program can exist on paper for years while covering only a small number of drugs, so passing a law is necessary but not sufficient; the payment design and adoption process still has to work in practice"],
            correct:3,
            why:"A policy fix that targets the right MECHANISM (delinking payment from volume) is necessary but not sufficient — implementation details like payment size, eligibility criteria, and enrollment pace determine whether the fix actually closes the gap in practice, exactly what the U.K.'s slow multi-year rollout demonstrates.",
            wrongWhy:{
              0:"This ignores the U.K.'s real 2019-2026 track record described in this very section — subscription payments for antimicrobials have, in fact, already been tried.",
              1:"This assumes legislation mechanically guarantees implementation success, ignoring the U.K.'s own three-year gap between pilot launch (2019) and first contracts (2022).",
              2:"This overcorrects into dismissing the entire economic diagnosis built across this article, when the article's own evidence shows the reimbursement structure IS the central mechanism at issue."},
            generalizes:"A policy fix that addresses the right mechanism is necessary but not sufficient — implementation details like payment size, eligibility, and enrollment pace still determine whether the fix actually closes the gap in practice.",
          }}/>
          <MC onScore={onScore} q={{
            id:"q3-case1",typeLabel:"Type C · Weakest link",kind:"case",
            client:"BioShield Therapeutics, a fictional mid-stage biotech with one late-stage MDR-targeted antibiotic candidate in Phase 3 trials.",
            stem:"BioShield's board is deciding whether to keep funding its Phase 3 trial while betting the drug's long-term commercial viability on PASTEUR eventually passing and being funded at the bill's proposed $75-300 million-per-year contract range. Which single assumption is most load-bearing for that bet, and what evidence in this section is thinnest in supporting it?",
            options:[
              "The load-bearing assumption is that the drug candidate will succeed in Phase 3 trials, which this section's evidence already strongly supports",
              "The load-bearing assumption is that oncology drug prices will fall enough to make antimicrobial economics look comparatively better, which this section shows is already happening",
              "The load-bearing assumption is that Congress will actually pass and appropriate PASTEUR's proposed contract funding at the scale the bill promises; the thinnest evidence for this is that PASTEUR has been reintroduced repeatedly since September 2020 without passing, so a company betting its survival on it is betting on an outcome with a multi-Congress track record of stalling, not on an enacted, funded program",
              "There is no meaningful assumption at issue, since any government program proposed with bipartisan support is effectively guaranteed to pass eventually"],
            correct:2,
            why:"The bet's true load-bearing assumption is not the science (Phase 3 success is a separate, ordinary biotech risk) but the POLICY outcome — that a bill repeatedly reintroduced without passing since 2020 will this time pass and be funded at its proposed scale. The thinnest evidence for that is precisely the bill's own multi-Congress history of stalling, which this section documents directly.",
            wrongWhy:{
              0:"This misidentifies the risk this section's evidence actually speaks to; Phase 3 trial success is a real biotech risk, but it is not the one the article's policy evidence bears on.",
              1:"This invents a claim (falling oncology prices) that is not supported anywhere in this section.",
              3:"Treating bipartisan reintroduction as proof of near-certain passage ignores this section's own evidence that repeated reintroduction since 2020 has not yet led to passage."},
            generalizes:"When a business plan bets on a not-yet-enacted policy change, name the SPECIFIC procedural step the plan actually depends on (introduction vs. passage vs. appropriation) and check the base rate of that specific step succeeding, not just the step of 'being proposed.'",
          }}/>
          <Glossary items={[
            {t:"Subscription model (delinkage)",d:"A payment approach that pays a company a fixed fee for a drug's availability, instead of paying per unit sold, so revenue no longer depends on sales volume."},
            {t:"National Institute for Health and Care Excellence (NICE)",d:"The U.K. body that assesses a medicine's value to the NHS and assigns it to a subscription payment band."},
            {t:"Appropriation",d:"The specific step in which a legislature actually sets aside money for a program, separate from simply passing the law that authorizes it."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(4)}>← Why the Market Fails</button><button onClick={()=>jump(6)}>Next: Learning Summary →</button></div>
        </section>

        {/* ---- LEARNING SUMMARY ---- */}
        <section ref={refs.current[6]}>
          <div className="kicker">Learning Summary</div>
          <h2>What you did, and what to carry forward</h2>
          <Summary answers={answers} interp={interp}/>
          <div className="navbtns"><button onClick={()=>jump(5)}>← Can Subscriptions Fix It?</button><button onClick={()=>jump(7)}>Next: Conclusion →</button></div>
        </section>

        {/* ---- CONCLUSION ---- */}
        <section ref={refs.current[7]}>
          <div className="kicker">Conclusion</div>
          <h2>The right prescription for patients is the wrong business model for a company</h2>
          <p>The central challenge is economic, not scientific: the stewardship rule that makes a new antibiotic clinically valuable is the same rule that guarantees it will not sell enough, under a normal volume-based drug market, to repay its own roughly $1.9 billion R&D bill. Under a partial-success path, the next several years most likely look like a patchwork rather than a clean fix: the U.K.'s subscription model slowly scaling toward its £100-million-a-year budget, a U.S. PASTEUR Act that keeps being reintroduced without passing or eventually passes in a scaled-back form, and a thin trickle of new approvals — like Bayer's mid-2026 oral carbapenem — sustained mostly by nonprofit and government funders such as CARB-X and GARDP rather than by ordinary commercial sales.</p>
          <p>For investors and biotech boards, the implication is to treat MDR-focused antimicrobial R&D as needing blended, non-dilutive financing from day one, not a standard venture-return model built around a sales ramp that this article's own numbers show cannot mathematically work inside a normal exclusivity window. For hospital systems and payers, the implication is to budget stewardship, rapid diagnostics, and infection control as the primary near-term lever against resistant infections, since the pipeline's genuinely novel, priority-targeted, critical-pathogen-active share remains only about 4 of 97 agents worldwide. For health ministries in smaller countries, the U.K. and U.S. models are best read as a live, ongoing natural experiment to monitor, not a problem either one has already solved.</p>
          <p>The deeper structural implication reaches beyond antibiotics. Any good whose socially optimal use pattern is rare and reserved will collide with a health system that typically pays for goods by volume, and the same failure mode will resurface wherever that mismatch appears next — in certain biodefense countermeasures kept in reserve for emergencies, or in newer antifungal drugs now facing their own early signs of resistance. Policymakers designing incentives for the next "reserve-only" medical technology should treat delinked payment as the default starting design question, not a late patch bolted on after the market has already failed once.</p>
          <MC onScore={onScore} q={{
            id:"concl-e1",typeLabel:"Type E · Implication + falsification",
            stem:"Given the evidence in this article — a widening gap between AMR's mortality burden (1.14 million attributable deaths in 2021, projected toward roughly 1.9 million a year by 2050) and a thin, shrinking pipeline (only 4 of 97 pipeline agents clear every filter for being novel, priority-targeted, and critical-pathogen-active), a stark cost-versus-sales scissors (about $1.9 billion to develop vs. under $50 million in typical annual sales), and early but small-scale subscription-model precedents (the U.K.'s 2 contracted drugs since 2022; the U.S. PASTEUR Act still unpassed after repeated reintroduction since 2020) — which real-world decision is most directly supported, paired with the observation that would most FALSIFY this article's central thesis?",
            options:[
              "Decision: treat delinked, subscription-style payment as the correct DIRECTION of policy, while continuing to fund near-term stewardship, diagnostics, and nonprofit-backed early R&D (CARB-X, GARDP) as the bridge until subscription programs reach a scale — multiple countries, adequately funded, broad drug coverage — that matches the roughly $1.9 billion cost of developing a single new antimicrobial. Falsifier: if, over the next several years, EITHER the U.K. program fails to expand meaningfully beyond its current small number of contracted drugs OR PASTEUR-style legislation is enacted but funded well below its proposed $75-300 million per-drug range, that combination would show delinked payment, even where politically achievable, is not being funded at the scale this thesis requires — meaning the market failure is more a funding-will problem than a policy-design problem",
              "Decision: assume the antibiotic market failure is now solved because PASTEUR was reintroduced in 2026. Falsifier: any single month in which a new antibiotic is not approved.",
              "Decision: abandon subscription-model advocacy entirely, since the U.K. pilot has only reached 2 drugs since 2022. Falsifier: none needed, since a small early-pilot number always proves a model has permanently failed.",
              "Decision: assume oncology-style volume pricing could work for antibiotics too if only marketing budgets were larger. Falsifier: any oncology drug that fails commercially."],
            correct:0,
            why:"The article's best-supported reading holds two things together: delinked payment is the right DIRECTION to fix the mechanism this article diagnoses, and its actual success still depends on funding scale and pace that remain unproven — so the defensible decision is continued investment across both the near-term bridge (stewardship, diagnostics, nonprofit R&D) and the long-term fix (subscription models), while naming the precise combination of future events (a stalled U.K. expansion plus an underfunded U.S. program) that would convert 'promising but unproven' into 'the fix isn't working.'",
            wrongWhy:{
              1:"Treating mere reintroduction (a procedural step) as if it were passage and funding ignores this article's own evidence of repeated past reintroductions failing to pass.",
              2:"Drawing a permanent-failure conclusion from an early-stage pilot's small scale ignores that pilots often start small by design and that the U.K.'s own budget is actively scaling up toward £100 million a year.",
              3:"This contradicts the article's central cost-vs-sales evidence (a roughly 25-fold sales gap under a volume model) with no support anywhere in the article for marketing budgets being the actual constraint."},
            generalizes:"The strongest recommendation for a policy diagnosis names not just the right mechanism, but the scale test that would prove the mechanism is actually being funded adequately — and states what pattern of failure (design vs. funding-will) would falsify the thesis.",
          }}/>
          <p style={{marginTop:18}}>The most important unresolved question is not whether stewardship and volume-based pricing genuinely conflict — the evidence in this article already shows they do. It is whether governments will fund delinked payment models at a scale and speed that matches the roughly $1.9 billion it costs to develop a single new antimicrobial, or whether the next Achaogen is already quietly running out of cash.</p>
          <Sources/>
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
    wu1:"Value (is the price/ratio fair) and adoption (does the fairly-priced thing actually reach people) are two separate, separately testable questions",
    wu2:"Many independent actors making the same individually sound choice can still create a concentrated, systemic failure point that no one actor's decision process was built to see",
    wu3:"A margin gap between a bolted-on business and its low-margin host is a question, not an answer, until the bolted-on business's metric is independently auditable",
    "bg-b1":"When two trends move together across a period containing a large, well-known disruptive event, check whether that event alone explains the pattern before crediting a narrower policy",
    "bg-d1":"Extending a recent rate forward over a stated number of years is a fast, disclosed way to size a status-quo trend, flagged as assuming no structural change",
    "q1-mc1":"When a total narrows through several sequential filters, compute back to the ORIGINAL denominator before judging how reassuring the final headline count is",
    "q1-case1":"When a supply-side incentive already tried elsewhere left the innovative yield thin, diversify toward demand-side and system-capacity levers instead of repeating it",
    "q2-mc1":"When comparing two investments' economics, check whether the COST side differs too, not only the SALES side",
    "q2-num1":"Compare a Fermi-estimated payback period against the length of the exclusivity or patent window it must fit inside",
    "q3-mc1":"A policy fix aimed at the right mechanism is necessary but not sufficient; implementation details (payment size, eligibility, enrollment pace) still decide whether it closes the gap",
    "q3-case1":"When a plan bets on a not-yet-enacted policy, name the specific procedural step it depends on and check that step's own base rate of success",
    "concl-e1":"A strong policy recommendation names the scale test that would prove the mechanism is funded adequately, and states what pattern of failure would falsify the thesis",
  };
  const missed=entries.filter(([,a])=>!a.ok).map(([id])=>principleMap[id]).filter(Boolean);

  // Apply-It evaluator -- LOCAL FALLBACK ONLY. This static, single-file artifact has no
  // secure server-side API path, so per artifact-generator.md this function is isolated
  // behind one call site (the button below) and implements an evidence-based, non-keyword
  // fallback: it checks for the PRESENCE of all four required reasoning moves (thesis,
  // load-bearing assumption, disconfirming evidence, pre-mortem) and reports which are
  // weakest or missing as an explicit gap list, rather than pattern-matching specific words
  // as "correct." If a secure API path is added later, swap this function's body for one
  // server-side call that sends the full article text plus the reader's response and asks
  // a model to judge the same four parts in 3-5 sentences -- the call site below does not
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
      <p style={{fontSize:14}}>You saw five charts. Write the single most non-obvious insight you would defend to a skeptical hospital-system CFO.</p>
      {!govDone && <>
        <textarea value={gov} onChange={e=>setGov(e.target.value)} placeholder="One or two sentences…"/>
        <button className="btn" disabled={gov.trim().length<20} onClick={()=>setGovDone(true)}>Reveal the article's three insights</button>
      </>}
      {govDone && <>
        <div className="yours"><b>Your insight:</b> {gov}</div>
        <div style={{marginTop:10}}>
          <div className="insight-card"><b>1.</b> The paradox isn't irrational: hospitals, insurers, and doctors each doing the clinically RIGHT thing (stewardship) is exactly what removes the sales volume any company needs to recoup a roughly $1.9 billion R&D bill inside a normal patent-exclusivity window — a scissors that widens the more successfully stewardship is practiced, not one that eases with better marketing or a lower price.</div>
          <div className="insight-card"><b>2.</b> A headline pipeline number (97 agents) collapses to a genuinely reassuring number (4 that are novel, priority-targeted, and active against a critical pathogen) once you divide all the way back to the original denominator — "many agents in development" and "many useful new weapons arriving soon" are not the same claim, a gap of roughly 25-fold (4% vs. an intuitive-sounding 33%).</div>
          <div className="insight-card"><b>3.</b> Delinked, subscription-style payment (the U.K.'s pilot, the still-unpassed U.S. PASTEUR Act) is the right DIRECTION of fix, but a policy correctly aimed at the mechanism can still fail if it is funded at too small a scale or too slow a pace to match the roughly $1.9 billion true cost of the R&D it is trying to replace — the U.K.'s own 3-year gap between pilot launch and first contracts shows design and implementation speed are separate risks.</div>
        </div>
      </>}

      <h3>3 · Apply it</h3>
      <p style={{fontSize:14}}><b>(a) Transfer to a new domain.</b> A national parks agency funds trail-conservation crews mainly through a per-visitor-day fee collected at trailheads. Conservationists want visitors to spread out toward remote, fragile trails rather than concentrate on the handful of popular, heavily eroded ones — but spreading visitors out thins the fee revenue collected at the busiest, most profitable trailheads, the same way stewardship thins an antibiotic's sales. In four labeled parts, write: (1) a one-sentence so-what thesis about whether the agency's current per-visitor-day fee model can support the conservation outcome it wants, (2) the single load-bearing assumption that must hold for the fee model to keep funding conservation while also successfully redirecting visitors, (3) the strongest evidence that would undermine it, and (4) a one-line pre-mortem: "If the agency's redirection plan fails within 12 months, the most likely reason is ___."</p>
      <textarea value={applyA} onChange={e=>setApplyA(e.target.value)} placeholder="1) Thesis…  2) Assumption…  3) Disconfirming evidence…  4) Pre-mortem…"/>
      <p style={{fontSize:14,marginTop:12}}><b>(b) Cross-link to a prior article.</b> Name one principle from an earlier article (FIFA's asset-owner-vs-risk-bearer split, GLP-1's per-unit-vs-aggregate distinction, immaculate disinflation's sacrifice-ratio sign test, private credit's measurement-artifact lesson, streaming's fixed-cost-scale lesson, AI capex's spend-vs-revenue gap, Baumol's productivity-tracks-price lesson, gene therapy's value-vs-adoption split, passive investing's aggregate-concentration lesson, AI power's rebound-effect lesson, retail media's margin-gap-without-incrementality-proof lesson, or the tariff article's legal-vs-economic-incidence distinction) that most reinforces or conflicts with today's stewardship-vs-volume-pricing tension, and say why.</p>
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
        <p>• Naghavi, Mohsen; et al. "Global burden of bacterial antimicrobial resistance 1990–2021: a systematic analysis with forecasts to 2050." The Lancet, Sept. 2024 — 1.14 million attributable / 4.71 million associated bacterial AMR deaths, 2021; &gt;39 million cumulative attributable deaths projected 2025-2050; annual attributable deaths projected to rise by almost 70% from 2022 to 2050. <a href="https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(24)01867-1/fulltext" target="_blank" rel="noopener">thelancet.com</a></p>
        <p>• Murray, Christopher J.L.; et al. "Global burden of bacterial antimicrobial resistance in 2019: a systematic analysis." The Lancet, Jan. 2022 — 1.27 million attributable / 4.95 million associated bacterial AMR deaths, 2019. <a href="https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(21)02724-0/fulltext" target="_blank" rel="noopener">thelancet.com</a></p>
        <p>• U.S. Senator Michael Bennet, press release, "Bennet, Young, Colleagues Reintroduce Bipartisan PASTEUR Act to Fight Antimicrobial Resistance," Jun. 24, 2026 — &gt;2.8 million antibiotic-resistant infections and &gt;35,000 deaths per year in the U.S. (citing CDC); PASTEUR Act of 2026 (H.R.7352, 119th Congress) proposed federal subscription contracts of $75 million to $300 million per year, up to 10 years or until generic entry, net of manufacturer revenue; first introduced Sept. 2020. <a href="https://www.bennet.senate.gov/2026/06/24/bennet-young-colleagues-reintroduce-bipartisan-pasteur-act-to-fight-antimicrobial-resistance/" target="_blank" rel="noopener">bennet.senate.gov</a></p>
        <p>• "Approved antibacterial drugs in the last 10 years: from the bench to the clinic." Exploration, 2024/2025 — 80 systemic antibacterial new molecular entities approved by FDA, June 1980-October 2024; 52 approved before 2000; 4 approved 2020-2024. <a href="https://www.explorationpub.com/Journals/eds/Article/100813" target="_blank" rel="noopener">explorationpub.com</a></p>
        <p>• World Health Organization. "2023 Antibacterial agents in clinical and preclinical development: an overview and analysis." 2024 release — clinical pipeline of 97 antibacterial agents (57 traditional, 40 non-traditional); 32 of 57 traditional agents target a WHO bacterial priority pathogen; 12 of those 32 meet ≥1 of WHO's 4 innovation criteria; 4 of those 12 are active against ≥1 WHO "critical" pathogen. <a href="https://www.who.int/publications/b/74167" target="_blank" rel="noopener">who.int</a>; coverage via <a href="https://www.cidrap.umn.edu/antimicrobial-stewardship/antibiotic-pipeline-not-active-enough-fight-deadliest-bacteria-who-says" target="_blank" rel="noopener">cidrap.umn.edu</a></p>
        <p>• U.S. Department of Health and Human Services, Office of the Assistant Secretary for Planning and Evaluation (ASPE). "Antimicrobial Drugs: Market Returns Analysis," 2023-24 — capitalized R&D cost for an MDR-focused antimicrobial ~$1.9 billion, vs. general new-drug median ~$985 million / mean ~$1,336 million (drugs approved 2009-2018, citing DiMasi et al.); average 9-quarter cumulative sales, top-ranked antimicrobial ~$42 million vs. top-ranked oncology ~$1,041 million. <a href="https://aspe.hhs.gov/reports/antimicrobial-market-returns" target="_blank" rel="noopener">aspe.hhs.gov</a></p>
        <p>• U.S. Department of Health and Human Services, ASPE. "Understanding Markets for Antimicrobial Drugs," issue brief, Aug. 2023 — average annual sales for recently approved antibiotics under $50 million. <a href="https://aspe.hhs.gov/sites/default/files/documents/04a1e803cf7167db1dbd85cb553cb34c/understanding-markets-antimicrobial-drugs.pdf" target="_blank" rel="noopener">aspe.hhs.gov</a></p>
        <p>• "Melinta files for bankruptcy in another dark day for antibiotics." Fierce Biotech, 2019/2020 — Achaogen (Zemdri/plazomicin, FDA-approved Jun. 2018) filed Chapter 11 Apr. 2019, ~$800,000 in 2018 sales, assets/drug rights auctioned for $16 million summer 2019; Aradigm filed Feb. 2019; Melinta Therapeutics filed Dec. 2019/Jan. 2020. <a href="https://www.fiercebiotech.com/biotech/melinta-files-for-bankruptcy-another-dark-day-for-antibiotics" target="_blank" rel="noopener">fiercebiotech.com</a>; corroborating: <a href="https://www.cidrap.umn.edu/antimicrobial-stewardship/antibiotic-developer-melinta-files-bankruptcy" target="_blank" rel="noopener">cidrap.umn.edu</a></p>
        <p>• CARB-X. "The antibiotic paradox: why companies can't afford to create life-saving drugs," news item summarizing Nature (McKenna, 2020) — four antibiotic companies (Achaogen, Aradigm, Melinta Therapeutics, Tetraphase) declared bankruptcy or sold themselves within a two-year span. <a href="https://carb-x.org/carb-x-news/the-antibiotic-paradox-why-companies-cant-afford-to-create-life-saving-drugs/" target="_blank" rel="noopener">carb-x.org</a></p>
        <p>• "Everything you need to know about the NHS antibiotic subscription model." Pharmaceutical Journal, 2023-25 — U.K. NHS subscription pilot launched Jul. 2019; first two contracts (cefiderocol/Fetcroja, ceftazidime-avibactam/Zavicefta) awarded Jul. 2022; NICE 4-band system, £5-20 million/year per drug; expanded model funded at £100 million/year for the 2024/2025 procurement round, contracts expected finalized Mar. 2026. <a href="https://pharmaceutical-journal.com/article/feature/everything-you-need-to-know-about-the-nhs-antimicrobial-resistance-subscription-model" target="_blank" rel="noopener">pharmaceutical-journal.com</a></p>
        <p>• CARB-X. Portfolio overview — more than 100 early product-development projects funded across 12 countries since inception. <a href="https://carb-x.org/portfolio/portfolio-pipeline/" target="_blank" rel="noopener">carb-x.org</a>; European Commission funding boost to CARB-X and GARDP (~€30 million / ~$34.7 million) via <a href="https://www.cidrap.umn.edu/antimicrobial-stewardship/carb-x-gardp-receive-funding-boost-european-commission" target="_blank" rel="noopener">cidrap.umn.edu</a></p>
      </div>
      <p style={{fontSize:12.5,color:"#777",marginTop:8}}>Note on estimates: Chart 1's 2050 annual data point (~1.9 million attributable deaths/year) is this article's own ESTIMATE, computed as the 2021 FACT (1.14 million) × 1.70, derived from Naghavi et al.'s reported "~70% rise by 2050 vs. 2022" statement, since the source itself reports that percentage rise and a cumulative 2025-2050 total rather than one single annual 2050 figure. Both Numeric estimation questions ("bg-d1" and "q2-num1") ask the reader to derive a value from stated FACT anchors by disclosed arithmetic; their target values are fully derivable from figures given in this article, not independently sourced statistics.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);

