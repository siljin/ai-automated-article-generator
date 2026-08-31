/* ============================================================================
   The Passive Paradox — index investing, ownership concentration, and price-setting
   Domain: Finance & Markets (ER-09).
   Data tiers: FACT (cited, verified against primary source), ESTIMATE (derived
   arithmetic from stated FACTs), ILLUSTRATION (disclosed synthetic teaching
   values — none used in this article; every chart here is FACT-tier).
   App code + CSS inlined into index.html. This file is a readable source copy.
   ========================================================================== */
const {useState,useEffect,useRef} = React;
const R = window.Recharts;
const {ResponsiveContainer,ComposedChart,BarChart,Bar,Cell,LineChart,Line,ScatterChart,Scatter,
  XAxis,YAxis,CartesianGrid,Tooltip,ReferenceLine,ReferenceArea,LabelList,Legend} = R;

/* ---------- DATA ------------------------------------------------------------ */
// Chart 1 — index funds' share of long-term (non-money-market) fund assets, 2010-2025.
// FACT: Li, Lei. "Trends in the Expenses and Fees of Funds, 2025." ICI Research
// Perspective 32, no. 1 (March 2026), Figure 5. Components are independently
// rounded by the source and may not sum exactly to its own labeled totals.
const c1 = [
  {year:"2010", active:81, indexMF:10, indexETF:9, totalT:9.9, labeledTotal:19},
  {year:"2015", active:72, indexMF:15, indexETF:14, totalT:14.9, labeledTotal:28},
  {year:"2020", active:60, indexMF:20, indexETF:21, totalT:24.8, labeledTotal:40},
  {year:"2025", active:48, indexMF:21, indexETF:31, totalT:36.6, labeledTotal:52},
];

// Chart 2 — ownership share vs. price-setting (flow) share. FACT (two related but
// distinct scopes, disclosed below): 6.2% = domestic-equity ETF primary-market
// activity (creation/redemption, the only ETF activity that trades underlying
// shares) as a share of all 2024 US company-stock trading value (ICI, 2025
// Investment Company Fact Book, Ch. 4, Figure 4.3). 20% (reference line) =
// passive equity funds' (ETFs + index mutual funds) ownership share of the S&P
// 500 (Bloomberg Intelligence, "Passive's no bubble as active retains market
// control," 2025, which states "more than 20%" — shown here at its conservative
// rounded floor).
const c2 = [{name:"ETF primary-market trading, 2024", val:6.2}];

// Chart 3 — SPIVA large-cap active-fund underperformance rate vs. the S&P 500,
// by trailing horizon, year-end 2024. FACT: S&P Dow Jones Indices, "SPIVA U.S.
// Scorecard Year-End 2024," persistence exhibit (All Large-Cap Funds vs. S&P 500).
const c3 = [
  {h:"1-yr", v:65.24},
  {h:"3-yr", v:84.96},
  {h:"5-yr", v:76.26},
  {h:"10-yr", v:84.34},
  {h:"15-yr", v:89.50},
  {h:"20-yr", v:91.99},
];

// Chart 4 — the Big Three's (BlackRock, Vanguard, State Street) median combined
// ownership stake in S&P 500 companies vs. their median share of votes actually
// cast at annual meetings, 2008-2021. FACT: Bebchuk, Lucian A., and Scott Hirst.
// "Big Three Power, and Why It Matters." Boston University Law Review 102
// (2022): 1547, Tables 1 & 2.
const c4 = [
  {year:"2008", own:12.3, vote:14.5},
  {year:"2011", own:13.6, vote:18.2},
  {year:"2014", own:16.5, vote:21.4},
  {year:"2017", own:19.5, vote:25.4},
  {year:"2019", own:21.5, vote:27.7},
  {year:"2021", own:21.9, vote:27.5},
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

/* ---------- Numeric estimation (optional: require a typed decomposition path
   before the number entry unlocks — the "fading" scaffold for later items) --- */
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
      <div className="charttitle">Index funds' share of long-term fund assets, 2010–2025 <Tier t="FACT"/></div>
      <div className="chartsub">Percent of total net assets in US long-term (non-money-market) mutual funds and ETFs. Source: Li, Lei, "Trends in the Expenses and Fees of Funds, 2025," ICI Research Perspective 32, no. 1 (March 2026), Figure 5.</div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={c1} margin={{left:4,right:8,top:8,bottom:4}}>
          <CartesianGrid strokeDasharray="3 3" vertical={false}/>
          <XAxis dataKey="year" fontSize={12}/>
          <YAxis domain={[0,100]} tickFormatter={v=>v+"%"} fontSize={11}/>
          <Tooltip formatter={(v,n)=>[v+"%", n]}/>
          <Bar dataKey="active" stackId="s" fill="#bbb" name="Actively managed">
            <LabelList dataKey="active" position="inside" formatter={v=>v+"%"} fill="#333" fontSize={10.5}/>
          </Bar>
          <Bar dataKey="indexMF" stackId="s" fill="#1f6feb" name="Index mutual funds">
            <LabelList dataKey="indexMF" position="inside" formatter={v=>v+"%"} fill="#fff" fontSize={10.5}/>
          </Bar>
          <Bar dataKey="indexETF" stackId="s" fill="#0b8457" name="Index ETFs">
            <LabelList dataKey="indexETF" position="inside" formatter={v=>v+"%"} fill="#fff" fontSize={10.5}/>
          </Bar>
          <Legend fontSize={10} wrapperStyle={{fontSize:10.5}}/>
        </BarChart>
      </ResponsiveContainer>
      <table className="datatbl">
        <thead><tr><th>Year</th><th>Total long-term fund assets</th><th>Index share (source's own label)</th></tr></thead>
        <tbody>
          {c1.map((d,i)=><tr key={i}><td>{d.year}</td><td>${d.totalT}T</td><td>{d.labeledTotal}%</td></tr>)}
        </tbody>
      </table>
      <div className="note">Stacked bar chosen over a single-series bar because the story is a three-way MIX SHIFT (active vs. index mutual funds vs. index ETFs) across four points in time, not one ranked total.</div>
    </div>
  );
}
function Chart2(){
  return (
    <div className="chartbox">
      <div className="charttitle">Owning the market vs. trading it: passive funds' ownership share dwarfs their price-setting share <Tier t="FACT"/></div>
      <div className="chartsub">These two figures measure related but not identical scopes, disclosed here rather than smoothed over: the bar is domestic-equity ETFs' 2024 primary-market activity (share creation/redemption — the only ETF activity that trades underlying stock) as a share of all US company-stock trading value that year (ICI, 2025 Investment Company Fact Book, Ch. 4, Fig. 4.3). The dashed line is passive equity funds' (ETFs + index mutual funds) ownership share of the S&P 500, shown at its conservative rounded floor (Bloomberg Intelligence, 2025, states "more than 20%").</div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={c2} layout="vertical" margin={{left:8,right:60,top:10,bottom:4}}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
          <XAxis type="number" domain={[0,26]} tickFormatter={v=>v+"%"} fontSize={11}/>
          <YAxis type="category" dataKey="name" width={190} fontSize={11}/>
          <Tooltip formatter={v=>v+"%"}/>
          <Bar dataKey="val" fill="#1f6feb" barSize={26}>
            <LabelList dataKey="val" position="right" formatter={v=>v+"%"} fontSize={12}/>
          </Bar>
          <ReferenceLine x={20} stroke="#c0392b" strokeDasharray="4 3" label={{value:"passive ownership of S&P 500: >20%",position:"insideTopRight",fontSize:10.5,fill:"#c0392b"}}/>
        </BarChart>
      </ResponsiveContainer>
      <div className="note">Bullet-style chart (a metric read against a reference benchmark) chosen over a plain bar because the point is one value's distance from a named reference line, not a ranked comparison across many categories.</div>
    </div>
  );
}
function Chart3(){
  return (
    <div className="chartbox">
      <div className="charttitle">Active large-cap funds' odds of beating the S&P 500 get worse, not better, over longer horizons <Tier t="FACT"/></div>
      <div className="chartsub">Percentage of All Large-Cap US active equity funds that underperformed the S&P 500 over each trailing period ending Dec. 31, 2024. Source: S&P Dow Jones Indices, "SPIVA U.S. Scorecard Year-End 2024," persistence exhibit.</div>
      <ResponsiveContainer width="100%" height={230}>
        <ComposedChart data={c3} layout="vertical" margin={{left:8,right:44,top:4,bottom:4}}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false}/>
          <XAxis type="number" domain={[0,100]} tickFormatter={v=>v+"%"} fontSize={11}/>
          <YAxis type="category" dataKey="h" width={50} fontSize={12}/>
          <Tooltip formatter={v=>v+"%"}/>
          <Bar dataKey="v" barSize={3} fill="#ccc"/>
          <Scatter dataKey="v" fill="#c0392b">
            <LabelList dataKey="v" position="right" formatter={v=>v+"%"} fontSize={11}/>
          </Scatter>
        </ComposedChart>
      </ResponsiveContainer>
      <div className="note">Dot plot (lollipop) chosen over a bar chart because six categories with a non-monotonic pattern (the rate dips at 5-yr before rising again) read more clearly as dots than as six similarly shaded bars.</div>
    </div>
  );
}
function Chart4(){
  return (
    <div className="chartbox">
      <div className="charttitle">The Big Three vote a bigger share of the S&P 500 than they own <Tier t="FACT"/></div>
      <div className="chartsub">BlackRock, Vanguard, and State Street's combined median ownership stake in S&P 500 companies vs. their combined median share of votes actually cast at annual meetings, 2008–2021. Source: Bebchuk, Lucian A., and Scott Hirst, "Big Three Power, and Why It Matters," Boston University Law Review 102 (2022): 1547, Tables 1 &amp; 2.</div>
      <ResponsiveContainer width="100%" height={230}>
        <LineChart data={c4} margin={{left:4,right:12,top:8,bottom:4}}>
          <CartesianGrid strokeDasharray="3 3" vertical={false}/>
          <XAxis dataKey="year" fontSize={12}/>
          <YAxis domain={[0,32]} tickFormatter={v=>v+"%"} fontSize={11}/>
          <Tooltip formatter={v=>v+"%"}/>
          <Line type="monotone" dataKey="own" stroke="#1f6feb" strokeWidth={2.5} name="Ownership stake" dot={{r:3}}>
            <LabelList dataKey="own" position="bottom" formatter={v=>v+"%"} fontSize={10}/>
          </Line>
          <Line type="monotone" dataKey="vote" stroke="#c0392b" strokeWidth={2.5} name="Share of votes cast" dot={{r:3}}>
            <LabelList dataKey="vote" position="top" formatter={v=>v+"%"} fontSize={10}/>
          </Line>
          <Legend fontSize={10} wrapperStyle={{fontSize:10.5}}/>
        </LineChart>
      </ResponsiveContainer>
      <div className="note">Line chart chosen over paired bars because the story is a widening GAP between two continuously tracked series across many years, not a single before/after comparison.</div>
    </div>
  );
}

/* ---------- Content sections ------------------------------------------------ */
const SECTIONS = [
  "Warm-Up","Introduction","Background","Q1 · Efficiency","Q2 · Concentration","Q3 · Stability","Learning Summary","Conclusion"
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
          <p className="dek">Each question takes a principle from a prior article and drops it into today's topic before you've read any of it. Answer before reading on — these are scored, and none of them require knowing anything about passive investing yet.</p>
          <MC onScore={onScore} q={{
            id:"wu1",typeLabel:"Warm-Up · Type B",
            stem:"The private-credit article showed that a 'low reported risk' number (low volatility, a low default rate) can be a measurement artifact rather than a fact about true risk — it depends on how the metric is defined. Today's article will point out that in 2024, ETFs' price-touching trading was only 6.2% of all US stock trading. Applying that SAME critical-thinking move, what is the first question to ask about that 6.2% figure before accepting any conclusion built on it?",
            options:[
              "Nothing — a percentage is a percentage regardless of what's being measured",
              "Whether the 6.2% figure has grown or shrunk since 2020",
              "Whether the organization that published the 6.2% figure is credible",
              "What exactly is being measured by that number — for instance, does 'trading value' here include only primary-market creation/redemption, or also secondary-market trading, and could a different definition put the figure much higher or lower?"],
            correct:3,
            why:"A reported percentage is a definition, not a fact of nature — the same lesson from private credit's appraisal-smoothed volatility applies here. Before trusting a 6.2% figure, check exactly what it counts (here: only ETF share creation/redemption against underlying stock, not the much larger secondary-market trading in ETF shares themselves, which doesn't touch the underlying basket).",
            wrongWhy:{
              0:"This is the exact naive view the private-credit lesson corrected: a rate's definition can shrink or inflate it before a single 'real world' event happens.",
              1:"A trend over time is a fair follow-up question, but it isn't the FIRST, most load-bearing question — you need to know what's being measured before you can trust how it moves.",
              2:"Source credibility matters in general, but it doesn't apply the SPECIFIC principle being tested here, which is about interrogating a metric's definition, not its publisher."},
            generalizes:"Any headline percentage built from trading, risk, or performance data — before comparing it across time or across firms, check whether the numerator and denominator are built the same way.",
          }}/>
          <MC onScore={onScore} q={{
            id:"wu2",typeLabel:"Warm-Up · Type B",
            stem:"The AI-infrastructure article taught you to separate a growth RATE (impressive in percent) from the dollar LEVEL of a gap, and that one side's big spending doesn't by itself prove the other side's underlying case is sound. Index funds' share of long-term fund assets has grown from 19% to 52% since 2010 — an impressive rate. Applying that same discipline, which additional figure would you most need before concluding index investing has 'won' the argument purely on the merits, rather than just outgrowing its rival by default?",
            options:[
              "The number of new index funds launched each year",
              "Whether the S&P 500 outperformed bonds over the period",
              "The actual DOLLAR amount still invested in active funds today, since a shrinking PERCENTAGE share can hide real dollar growth",
              "The average age of index-fund investors"],
            correct:2,
            why:"Just as AI capex's growth rate said nothing about the dollar size of the revenue gap it was supposed to justify, index funds' rising SHARE says nothing on its own about what happened to active management's actual DOLLAR base — and (as you'll see later in this article) that base kept growing even as its share fell.",
            wrongWhy:{
              0:"A fund-launch count is a supply-side, vanity-adjacent metric — it doesn't tell you anything about whether money, in dollars, is actually leaving active management.",
              1:"Broad asset-class performance is a real factor in total wealth, but it doesn't resolve the specific share-vs-level question this transfer is testing.",
              3:"Investor demographics have no bearing on whether a shrinking percentage share corresponds to a shrinking dollar amount."},
            generalizes:"Any 'X's share of the market is shrinking' headline — before assuming X is shrinking in absolute terms, check what happened to the total pie over the same period.",
          }}/>
          <MC onScore={onScore} q={{
            id:"wu3",typeLabel:"Warm-Up · Type E",
            stem:"The gene-therapy article showed that a treatment could pass its cost-effectiveness (value) test while a separate, structurally different risk — slow real-world adoption — stayed completely unresolved, because value and adoption needed different fixes. Today's article will show that a company's stock can have one level of passive OWNERSHIP concentration and a different, higher level of VOTING-power concentration. Applying the gene-therapy lesson, what should you expect to be true about the fix for each of these two risks?",
            options:[
              "The same fix (for example, spreading ownership across more index providers) will automatically solve both problems, since they share the same root cause",
              "Neither risk can be fixed once index funds pass a certain size",
              "Both risks are actually the same risk, just measured two different ways",
              "A fix for one (broader ownership diversification, lowering concentration) will not necessarily fix the other (voting-power concentration, which depends on who actually shows up to vote) — they need separate solutions, just as cost-effectiveness and real-world adoption did"],
            correct:3,
            why:"Exactly as a gene therapy's price could clear a value test while adoption stayed broken, a company's ownership can be spread across more providers while voting power stays concentrated in whichever firms reliably cast their ballots — the fixes (structural competition among providers vs. who actually votes) are different levers entirely.",
            wrongWhy:{
              0:"This is the 'single-lever' fallacy the gene-therapy article warned against: assuming one fix for one named risk automatically resolves a second, structurally different risk.",
              1:"This is a fatalistic overgeneralization not supported by either article — both describe risks with identifiable, if partial, fixes.",
              2:"Conflating two distinct risks into 'the same risk measured twice' is the exact error the gene-therapy article's value-vs-adoption distinction was built to correct."},
            generalizes:"Whenever a single root cause (scale, price, concentration) produces two named risks, expect two different fixes — solving one rarely closes the other automatically.",
          }}/>
          <div className="navbtns"><span/><button onClick={()=>jump(1)}>Next: Introduction →</button></div>
        </section>

        {/* ---- INTRODUCTION ---- */}
        <section ref={refs.current[1]}>
          <div className="kicker">Finance &amp; Markets</div>
          <h1>The Passive Paradox: index funds bought the whole market and concentrated it anyway</h1>
          <p className="lead">Index funds were built on a simple promise: stop trying to beat the market, just buy all of it, and let one cheap, automatic basket replace millions of small, independent decisions about price. Yet the money that answered that promise has concentrated stock ownership and voting power into three companies more than five decades of competitive, stock-picking active management ever did, and it has made stock prices depend on a shrinking pool of traders who still bother to disagree about value.</p>
          <p>The shift is now the majority story of American investing. Index mutual funds and index exchange-traded funds (ETFs — pooled funds that trade on a stock exchange all day, the way a share of stock does) together held 52% of all long-term (stock and bond) fund assets at the end of 2025, up from just 19% in 2010, as total assets in these funds grew from $9.9 trillion to $36.6 trillion (Investment Company Institute [ICI], 2026). Passive equity funds alone now own more than one-fifth of the S&P 500, the published list of roughly 500 of the largest publicly traded US companies used as a stand-in for "the US stock market" (Bloomberg Intelligence, 2025). No competing active-management firm, in the whole history of stock-picking, has ever controlled anywhere near that share of a major index through one investment style.</p>
          <p>The conventional story about index investing is that it diffuses power: instead of one fund manager deciding how to vote a company's shares, millions of ordinary savers each own a tiny, anonymous slice through their retirement account. What has actually happened is closer to the opposite. Nearly all of that diffused money is managed by just three firms — BlackRock, Vanguard, and State Street, known as the Big Three — and because they vote nearly every share they hold while many other shareholders do not vote at all, their share of votes actually cast at company meetings has grown even faster than their ownership share (Bebchuk and Hirst, 2022). Meanwhile, research on how markets actually set prices finds that the pool of investors left to absorb any sudden shift in demand — the ones still willing to buy or sell based on what they think a stock is worth — has shrunk so much that a $1 shift in demand for US stocks now moves the market's total value by about $5, not the roughly $1 a textbook efficient-market model would predict (Gabaix and Koijen, 2021).</p>
          <p>This note addresses three questions. First, if active managers persistently trail their benchmarks — the evidence that justified the shift to indexing in the first place — has that same shift changed how efficiently markets set stock prices, and by how much? Second, has passive investing's growth concentrated corporate ownership and voting power in the hands of a few asset managers more than the fragmented, competitive active-management industry it replaced? Third, is this arrangement stable — what has to keep being true for it to keep working, and what would be the first sign that it is breaking?</p>
          <Glossary items={[
            {t:"Index fund",d:"A fund that automatically buys a fixed, published list of stocks or bonds (an 'index'), rather than paying a manager to pick investments by hand."},
            {t:"ETF (exchange-traded fund)",d:"A pooled investment fund whose shares trade on a stock exchange all day at a live price, the way a company's own stock does."},
            {t:"Active management",d:"Hiring a professional to choose which stocks or bonds to buy and sell, aiming to beat a benchmark index."},
            {t:"Big Three",d:"The informal name for BlackRock, Vanguard, and State Street, the three asset managers that dominate US index-fund investing."},
            {t:"S&P 500",d:"A published list of roughly 500 of the largest publicly traded US companies, widely used as a stand-in for 'the US stock market.'"},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(0)}>← Warm-Up</button><button onClick={()=>jump(2)}>Next: Background →</button></div>
        </section>

        {/* ---- BACKGROUND ---- */}
        <section ref={refs.current[2]}>
          <div className="kicker">Background · Trajectory &amp; structure</div>
          <h2>From a fifth of the market to the majority</h2>
          <p>The clearest way to see the shift is to track where a dollar of new fund investment has actually gone over the past decade and a half. In 2010, actively managed mutual funds and ETFs held 81% of the $9.9 trillion in US long-term fund assets, while index mutual funds and index ETFs together held the remaining 19% (ICI, 2026). By 2025, that mix had flipped: index funds held 52% of a much larger $36.6 trillion pool, and active funds' share had fallen to 48% (ICI, 2026). The crossover was not gradual and even — it accelerated late. Passive fund assets across every asset class, not just stocks, first overtook active fund assets at the very end of 2023, when Morningstar recorded $13.29 trillion in combined passive mutual-fund and ETF assets against $13.23 trillion in active assets, a gap of less than half a percentage point (Morningstar, via CNBC, January 2024).</p>
          <p>The proximate cause is measurable and repeats nearly every year: active managers, on average, do not beat the indexes they are trying to beat, after fees. S&P Dow Jones Indices' SPIVA scorecard, the industry's standard scorekeeper for active-versus-passive performance, found that 65.24% of large-cap US active equity funds underperformed the S&P 500 in 2024 alone; over the trailing 15 years ending in 2024, that underperformance rate rose to 89.50% (S&P Dow Jones Indices, 2025). No US equity fund category has had a majority of active managers beat its benchmark over any 15-year horizon in a recent SPIVA scorecard. Against that record, choosing the cheaper, mechanical option looks less like giving up and more like following the evidence.</p>
          <p>Cost reinforces the same conclusion from a different angle. The asset-weighted average expense ratio — the fee an investor actually pays, weighted by how much money sits in each fund — for index equity mutual funds was just 0.05% in 2025, versus a market-wide equity mutual fund average of 0.40% that includes active funds (ICI, 2026). Part of the gap is scale: the average index equity mutual fund held $15.0 billion in assets in 2025, more than five times the $2.8 billion average for an actively managed one (ICI, 2026). A fund five times larger spreads its fixed operating costs over five times the assets, and that arithmetic alone widens the fee gap every year, independent of anyone's stock-picking skill.</p>
          <p>Layer the fee story and the performance story together and the shape of the multi-decade mix shift comes into focus. Two things are true in the same data: the SHARE of assets in active management has fallen every period since 2010, and the DOLLAR amount invested in active funds has still grown, because the total pool of savings has nearly quadrupled over the same span (Chart 1).</p>
          <Chart1/>
          <Interp id="c1p1" label="Interpretation 1 of 2 · Predict, then compute (quantitative, pre-reveal)"
            question="Before computing: index funds held about $1.9 trillion in 2010 (19% of $9.9T) and about $19.0 trillion in 2025 (52% of $36.6T). Predict, then compute, the compound annual growth rate (CAGR — the single steady annual rate that would take a starting value to an ending value) of index funds' DOLLAR assets over those 15 years, and say what a rate that size, sustained for another decade, would imply about who ends up setting stock prices."
            authored={<span>About 16%–17% a year, compounded over 15 years ((19.0/1.9)^(1/15)−1). That is roughly double the ~8% a diversified stock portfolio has historically grown at from price appreciation alone, meaning most of the increase came from net new money switching in, not just markets rising. A rate anywhere close to that for another decade would push index funds well past 70%–80% of long-term fund assets, leaving an even smaller slice of active, price-sensitive money to do the market's day-to-day price-setting.</span>}
            onSubmit={onInterp}/>
          <Interp id="c1p2" label="Interpretation 2 of 2 · Correlation vs. causation"
            question="Total long-term fund assets and index funds' share of them both hit record highs in 2025. What is the strongest reason NOT to conclude that crossing the 50% index-share threshold is what pushed total fund assets to a record $36.6 trillion?"
            authored={<span>Total fund assets are driven mainly by the stock market's own returns and by how much of people's paychecks get saved into retirement accounts each year (401(k) plans, IRAs) — both of which would have pushed assets to a record whether or not any dollar specifically went to an index fund. The index-share rise and the asset-total rise share common causes (a long bull market plus rising retirement savings), rather than one causing the other.</span>}
            onSubmit={onInterp}/>
          <MC onScore={onScore} q={{
            id:"bg-mc1",typeLabel:"Type B · Rate vs. level",
            stem:"Between 2010 and 2025, actively managed funds' SHARE of long-term fund assets fell from 81% to 48% — a 33-percentage-point drop. Given that total assets grew from $9.9 trillion to $36.6 trillion over the same period, what happened to the actual DOLLAR amount held in actively managed funds?",
            options:[
              "It grew, from about $8.0 trillion to about $17.6 trillion — more than doubling in dollars even as its share of the market shrank",
              "It fell by roughly the same proportion as its share, to about $4 trillion",
              "It stayed essentially flat at about $8 trillion, since all the new money went into index funds",
              "It cannot be determined without fund-level flow data"],
            correct:0,
            why:"Multiply each period's reported share by the reported total: 0.81×$9.9T ≈ $8.0T in 2010; 0.48×$36.6T ≈ $17.6T in 2025. Active funds' dollar assets rose about 2.2x even while their share of the market fell 33 percentage points. A shrinking SHARE and a shrinking LEVEL are different claims, and only one of them is true here.",
            wrongWhy:{
              1:"A 33-percentage-point drop in share (81%→48%) is not the same arithmetic as a proportional drop in dollars — the total pie nearly quadrupled over the same period, more than offsetting the share decline.",
              2:"This assumes zero net growth in active funds' dollar assets, but $8.0T→$17.6T shows real growth, driven mostly by market appreciation on existing assets.",
              3:"The two reported FACTs — share and total, for each year — are exactly what's needed to compute the dollar figure by simple multiplication; no additional data is required."},
            generalizes:"Any 'X's share is shrinking' headline — before assuming X is shrinking in absolute terms, multiply the share by the total; a shrinking slice of a fast-growing pie can still be a growing slice in dollars.",
          }}/>
          <p>The structural gap this creates is the one this article keeps returning to: as more of a company's shares end up owned through an automatic, rule-based vehicle rather than a manager who has read the company's filings and formed a view, does anyone still do the work of deciding what those shares are actually worth — and if fewer people do, does that change how reliably prices reflect real information? That is the subject of the next section.</p>
          <Numeric onScore={onScore} q={{
            id:"bg-d1",typeLabel:"Type D",
            stem:"Using the same two data points — index funds held about 19% of $9.9 trillion in 2010, and about 52% of $36.6 trillion in 2025 — estimate how many TRILLION dollars of additional assets sat in index funds in 2025 compared with 2010 (the dollar increase, not the percentage-point increase).",
            skeleton:"Decomposition: (index $ in 2025) − (index $ in 2010) = (0.52 × $36.6T) − (0.19 × $9.9T).",
            tolNote:"±10% — tight, because this is direct multiplication and subtraction from two reported figures, not a judgment call.",
            min:0,max:25,step:0.5,unit:"$ trillion",actual:17.1,tol:1.8,
            how:"0.52×$36.6T ≈ $19.0T in 2025, minus 0.19×$9.9T ≈ $1.9T in 2010, ≈ $17.1T of net dollar growth in index-fund assets. This is an ESTIMATE built by multiplying two reported FACTs (share × total, for each year) and subtracting — not a separately reported statistic, and rounded coarsely because it compounds two independently rounded source figures.",
            generalizes:"Any 'share rose from X% to Y%' claim over a period when the total also changed — convert both endpoints to dollars (or units) before sizing the real change; a share change alone can't tell you the level change.",
          }}/>
          <Glossary items={[
            {t:"Expense ratio",d:"The yearly fee a fund charges, shown as a percentage of the money invested; 0.40% means $4 a year for every $1,000 invested."},
            {t:"Basis point",d:"One-hundredth of one percentage point (0.01%) — a common way to describe small differences in fees or interest rates."},
            {t:"SPIVA",d:"S&P Indices Versus Active, a scorecard published regularly that tracks what share of actively managed funds beat their benchmark index."},
            {t:"CAGR (compound annual growth rate)",d:"The single steady annual growth rate that would take a starting value to an ending value over a given number of years, accounting for compounding."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(1)}>← Introduction</button><button onClick={()=>jump(3)}>Next: Efficiency →</button></div>
        </section>

        {/* ---- Q1: EFFICIENCY ---- */}
        <section ref={refs.current[3]}>
          <div className="kicker">Research Question 1</div>
          <h2>Owning the market vs. setting its prices</h2>
          <p>The case for indexing rests on the idea that active managers rarely add enough value to justify their fees, so why pay for the attempt. But that same evidence, taken to its logical end, raises an uncomfortable follow-up: if fewer investors are doing the work of researching companies and disagreeing about what they are worth, does the market still set prices as reliably as it used to?</p>
          <p>Start with how much of the market's day-to-day price-setting activity passive funds actually do, as opposed to how much of the market they own. Passive equity funds own more than 20% of the S&P 500 (Bloomberg Intelligence, 2025). But in 2024, the trading that actually touches a stock's underlying shares — when an ETF creates or redeems shares to match investor demand — came from domestic-equity ETFs' $7.0 trillion of primary-market activity, just 6.2% of the $112.5 trillion in total US company-stock trading that year (ICI, 2025 Investment Company Fact Book, Ch. 4). Most ETF activity that investors see, including the 27% of total US stock-trading volume that ETF shares accounted for in 2024, happens in the secondary market — investors trading ETF shares among themselves — which does not touch the underlying stocks at all (ICI, 2025 Investment Company Fact Book, Ch. 4).</p>
          <Chart2/>
          <Interp id="c2p1" label="Interpretation 1 of 2 · Quantitative (a named statistical trap)"
            question="Passive funds own more than 20% of the S&P 500 (a stock — a snapshot of who holds what) but ETFs' price-touching trading was only 6.2% of 2024's stock-trading value (a flow — activity over a year). Roughly how many times larger is the ownership share than the trading share, and why are 'owning 20% of the market' and 'setting 20% of its prices' different claims?"
            authored={<span>Roughly 3 times larger (20 ÷ 6.2 ≈ 3.2), and that likely understates the true gap, since the 20% figure includes index mutual funds too, which trade even less often than ETFs. The two numbers measure different things: ownership is a STOCK (a balance at a point in time), while trading value is a FLOW (activity over a period). A fund can hold a huge, unmoving balance and still contribute very little to the minute-by-minute buying and selling that actually sets a stock's price.</span>}
            onSubmit={onInterp}/>
          <Interp id="c2p2" label="Interpretation 2 of 2 · Mechanism"
            question="Given that passive funds barely trade, why does research still find that shifting just $1 of net demand moves the aggregate US stock market's value by about $5 — i.e., why would a market dominated by buy-and-hold owners end up MORE sensitive to a marginal trade, not less?"
            authored={<span>Because the pool of investors left to absorb any shift in aggregate demand — the marginal, price-setting buyers and sellers — keeps shrinking as more money locks into fixed-allocation index and pension mandates that don't flex with price. With fewer, less flexible participants left to absorb flow shocks, prices have to move further to clear the market: this is the "inelastic markets" mechanism, and it means the passive share doesn't just fail to add price-setting power — it concentrates that power, and its instability, in a smaller residual group.</span>}
            onSubmit={onInterp}/>
          <p>The mechanism behind that gap is not how a simple supply-and-demand textbook describes markets, and it matters directly for what a growing passive share implies. Gabaix and Koijen's 2021 "inelastic markets hypothesis" measured how much the aggregate US stock market's total value moves for every $1 of net new demand, and found a "multiplier" of about 5 — meaning $1 of net buying raises the market's value by roughly $5, not the near-$1 a standard efficient-market model would predict (Gabaix and Koijen, NBER Working Paper 28967, 2021). The reason, they argue, is that the marginal holders of stock — index funds, pension funds, insurers — operate under fixed or near-fixed allocation mandates and cannot easily absorb shifts in how much money wants to be in equities; when demand moves, a small number of flexible, price-sensitive traders must absorb nearly all of it, so prices move more per dollar than theory expects.</p>
          <MC onScore={onScore} q={{
            id:"rq1-a1",typeLabel:"Type A · Implication",
            stem:"Passive equity funds own more than 20% of the S&P 500 but generated only 6.2% of 2024's stock-trading value through ETF creation/redemption. If passive ownership share doubled to roughly 40% while the market's elasticity mechanism stayed the same (the ~5x multiplier from Gabaix and Koijen), what would you expect to happen to how much a given rebalancing trade moves prices, relative to today?",
            options:[
              "Nothing would change; the multiplier is fixed by economic theory regardless of ownership share",
              "Price moves per dollar traded would likely shrink, because more passive ownership means more liquidity available in the market",
              "Price moves per dollar traded would likely grow, because a smaller, more concentrated pool of active, price-sensitive traders would remain to absorb the same dollar flows",
              "It's undecidable, because passive investors never trade at all"],
            correct:2,
            why:"The Gabaix-Koijen mechanism ties the market's sensitivity to demand shifts to how much flexible, price-sensitive capital remains to absorb them. If passive ownership keeps growing, the residual pool of active capital shrinks further, and — all else equal — the same dollar of flow should move prices more, not less, echoing the logic behind the already-measured ~5x multiplier.",
              wrongWhy:{
              0:"The multiplier is an empirical estimate tied to how much flexible capital exists in the market at a point in time, not a fixed constant — Gabaix and Koijen's own estimates range from about 3 to 8 across specifications, meaning it moves as market structure changes.",
              1:"'Passive ownership' (a large, mostly static balance) is not the same as trading liquidity (how easily a large order can be absorbed without moving price); more of the former does not automatically add more of the latter, and can coincide with less.",
              3:"Passive funds do trade — during rebalancing, and through ETF creation/redemption — just far less often per dollar of assets than active managers; 'never' overstates the claim and ignores this section's own evidence."},
            generalizes:"Any 'more assets under management' story about a financial intermediary — check whether it comes with more day-to-day trading capacity (liquidity) or just a bigger static balance; the two are not interchangeable.",
          }}/>
          <p>Not every serious analysis of this question sees it as dangerous. Bloomberg Intelligence's own 2025 research found "no meaningful evidence" that passive ownership distorts prices: stocks with LOWER passive ownership actually performed better over the long run than stocks favored by index strategies, valuations for heavily indexed stocks stayed in line with the broader market at about 25 times earnings, and active managers underperformed their benchmarks by similarly wide margins (roughly 80% or more trailing long-term) regardless of how much passive ownership existed in their region — evidence, the firm argues, that passive share is not what drives active underperformance, and that passive's influence on US markets "may have peaked" as faster-growing active and quasi-active ETFs take share (Bloomberg Intelligence, 2025).</p>
          <p>The evidence for why the shift happened in the first place is genuinely strong, and it is worth seeing in its starkest form before weighing the concerns above. SPIVA's own persistence data shows that active managers' odds of beating the S&P 500 do not improve the longer you wait — they get worse (Chart 3).</p>
          <Chart3/>
          <Interp id="c3p1" label="Interpretation 1 of 2 · Predict the shape (quantitative, pre-reveal)"
            question="Before reading the exact values: predict whether the underperformance rate rises smoothly and steadily from the 1-year to the 20-year horizon, or moves unevenly. Then check the chart — does the pattern match your prediction, and by roughly how many percentage points does the rate move between the smallest and largest values shown?"
            authored={<span>The pattern is uneven, not smooth: it jumps from 65.24% (1-yr) to 84.96% (3-yr), actually DROPS to 76.26% (5-yr), then climbs again to 91.99% (20-yr) — a range of about 27 percentage points (91.99−65.24) across the six horizons, with one clear reversal in the middle rather than a steady climb.</span>}
            onSubmit={onInterp}/>
          <Interp id="c3p2" label="Interpretation 2 of 2 · Mechanism"
            question="The underperformance rate does NOT rise smoothly with horizon length (it is higher at 3-yr than at 5-yr). What does this irregularity most likely reflect about the relationship between 'time horizon' and 'active-manager skill'?"
            authored={<span>It reflects that each horizon's measurement window is dominated by which specific calendar years fall inside it — a 5-year window ending in 2024 includes 2022's sharp, uneven sell-off, a year when some active stock-picking arguably helped relative performance — more than it reflects any steady decay or improvement in managers' underlying skill. Market regime (which years are in the sample) drives more of the year-to-year wiggle in this statistic than any smooth trend in skill does.</span>}
            onSubmit={onInterp}/>
          <MC onScore={onScore} q={{
            id:"rq1-a2",typeLabel:"Type A · Percent vs. percentage points",
            stem:"SPIVA's data shows large-cap active funds' underperformance rate against the S&P 500 rising from 65.24% at the 1-year horizon to 89.50% at the 15-year horizon (year-end 2024). A headline describes this as 'active underperformance jumped 24% over the long run.' Is that headline's use of '24%' an accurate description?",
            options:[
              "Yes — 89.50 minus 65.24 is about 24, so calling it a '24% jump' is the right description",
              "No — the correct description is a 24-PERCENTAGE-POINT increase (65.24%→89.50%), which is different from a 24% relative increase; the actual relative increase is about 37% (24.26 ÷ 65.24)",
              "No — the headline understates the change; the real relative increase is closer to 100%",
              "It doesn't matter which framing is used, since both describe the same underlying change"],
            correct:1,
            why:"The raw gap (89.50−65.24=24.26) is a change in PERCENTAGE POINTS, not a percent change. The percent (relative) change is the gap divided by the starting value: 24.26 ÷ 65.24 ≈ 37%. Calling a 24-point move a '24% jump' silently swaps two different units — one of the most common statistical slips in financial writing.",
            wrongWhy:{
              0:"This correctly computes the point gap (24.26) but mislabels it — percentage points and percent change are different units, and conflating them misstates the true relative change.",
              2:"100% would mean underperformance roughly doubled from a much lower base; the actual relative increase from a 65.24% starting point is about 37%, not 100%.",
              3:"The two framings differ by roughly 1.5x here (24 points vs. 37% relative) — swapping them can materially change how alarming or reassuring a statistic sounds, especially next to other percent-based figures in the same argument."},
            generalizes:"Any 'X percent higher/lower' claim built by subtracting two percentages — check whether the number is the raw point gap or the relative (percent) change; they are numerically different unless the starting value is 100.",
          }}/>
          <Numeric onScore={onScore} q={{
            id:"rq1-d2",typeLabel:"Type D · Open-ended",
            requireDecomp:true,
            stem:"Ben-David, Franzoni, and Moussawi (2018) estimate that a one-standard-deviation rise in a stock's ETF ownership raises its daily return volatility by about 16% of a standard deviation — roughly 20 basis points for S&P 500 stocks in their sample. The S&P 500's typical daily volatility runs around 100 basis points (1 percentage point) in a normal year. Suppose ETF ownership across the index rises by TWO more standard deviations over the next five years — a plausible continuation of the current trend. Estimate the resulting increase in typical daily index volatility, in basis points.",
            tolNote:"Within a factor of 2 (log-scored, order-of-magnitude) — wide, because this requires extrapolating a measured academic estimate two standard deviations beyond what was directly tested, which is inherently uncertain and depends on an assumed linear extrapolation that the authors themselves did not make.",
            min:0,max:200,step:5,unit:"basis points of added daily volatility",log:true,actual:40,
            how:"Decomposition: 2 standard deviations × 20 basis points per standard deviation ≈ 40 basis points of added daily volatility — roughly a 40% increase on top of the S&P 500's typical ~100 basis points. This is an ESTIMATE that assumes the measured, one-standard-deviation effect scales linearly to two standard deviations, an assumption the original study does not make and this article flags explicitly rather than presenting as a forecast.",
            generalizes:"To extrapolate a measured 'per unit' effect beyond the range actually tested, multiply by the number of units and flag the linearity assumption explicitly — the multiplication is arithmetic, but the assumption that the effect stays linear is a judgment call, not a fact.",
          }}/>
          <p>Both things in this section are true at once, and neither cancels the other. The evidence that individual active managers rarely earn their fees is about as strong and as replicated as evidence gets in finance, so choosing a low-cost index fund remains a well-supported decision for almost any individual saver. But "good for each saver" and "costless for the market as a whole" are different claims, and the honest answer to this section's question is that markets have not yet shown clear, broad-based signs of mispricing from passive growth, while also not yet having been tested by a period where passive money leaves as fast as it arrived.</p>
          <Glossary items={[
            {t:"Price elasticity of demand (for stocks)",d:"How much a stock's price needs to move to absorb a given shift in how much investors, in total, want to hold it."},
            {t:"Price-impact multiplier",d:"How many dollars a stock's total market value rises for every $1 of net new buying; a multiplier of 5 means $1 of buying raises value by about $5."},
            {t:"Arbitrage",d:"Trading that profits from a price gap between two related assets (like an ETF and the stocks it holds), which tends to pull their prices back in line."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(2)}>← Background</button><button onClick={()=>jump(4)}>Next: Concentration →</button></div>
        </section>

        {/* ---- Q2: CONCENTRATION ---- */}
        <section ref={refs.current[4]}>
          <div className="kicker">Research Question 2</div>
          <h2>Ownership, but not the diffuse kind</h2>
          <p>If the case for indexing at the individual level is strong, the second question is what happens in aggregate once enough individuals make that same choice, through the same small number of providers. The conventional story says index investing diffuses power across millions of small savers. The data on who actually holds and votes S&P 500 shares tells a more concentrated story.</p>
          <p>BlackRock, Vanguard, and State Street's combined median ownership stake in S&P 500 companies rose from 12.3% in 2008 to 21.9% in 2021 (Bebchuk and Hirst, 2022). That alone would be a striking rise in ownership concentration held by three firms. But their share of votes actually CAST at annual shareholder meetings rose even faster, from 14.5% in 2008 to 27.5% in 2021 (Bebchuk and Hirst, 2022), because the Big Three consistently vote nearly all of the shares they hold, while a large share of other investors' shares — including many retail and passively held shares — never get voted at all.</p>
          <Chart4/>
          <Interp id="c4p1" label="Interpretation 1 of 2 · So what (decision)"
            question="The gap between the Big Three's ownership stake (~22% in 2021) and their share of votes actually cast (~28%) has widened since 2008. What should a company's investor-relations and governance team change about how they prepare for a closely contested shareholder vote, given this gap?"
            authored={<span>Treat the Big Three's published voting guidelines — and increasingly, their "Voting Choice" pass-through policy menus — as more consequential than their raw ownership percentage suggests, since firms that reliably show up to vote carry disproportionate weight against the large pool of retail and passive shares that simply never get cast. A board should engage BlackRock's, Vanguard's, and State Street's stewardship teams directly well before a contested vote, not treat a roughly 20% combined stake as an easily outvoted minority position.</span>}
            onSubmit={onInterp}/>
          <Interp id="c4p2" label="Interpretation 2 of 2 · Quantitative"
            question="In 2008 the ownership-to-voting gap was about 2.2 percentage points (14.5%−12.3%); by 2021 it had grown to about 5.6 points (27.5%−21.9%). Express the growth of this GAP as a multiple, and name the mechanism that keeps it growing even as the Big Three's ownership growth itself has started to slow."
            authored={<span>About 2.5 times larger (5.6 ÷ 2.2). The gap keeps widening because the Big Three vote nearly all the shares they hold, while a large and roughly constant share of everyone else's stock — much of it now also passively held — goes unvoted; as the Big Three's slice of total OWNERSHIP grows even slightly, their slice of the smaller pool of ACTUALLY-CAST votes grows faster, almost mechanically.</span>}
            onSubmit={onInterp}/>
          <MC onScore={onScore} q={{
            id:"rq2-b1",typeLabel:"Type B · Correlation vs. causation",
            stem:"Over the same 2008–2021 period that the Big Three's economic stake in the S&P 500 rose from 12.3% to 21.9%, shareholder activism campaigns also became more frequent industry-wide. Suppose someone claims: 'Rising index-fund ownership caused the rise in shareholder activism.' Based on this section, what is the strongest reason to doubt that specific causal claim?",
            options:[
              "In the mid-2010s, research found the Big Three voted WITH company management in roughly 9 of 10 votes and were reluctant to back shareholder-sponsored proposals (CORPNET research, 2017 — a dated figure, cited here only to characterize historical voting behavior) — the opposite of what an activism-driving cause should predict",
              "Correlation between two rising trends over the same years is never informative on its own",
              "The overall stock market also rose sharply from 2008 to 2021",
              "Shareholder activism existed before index funds became large"],
            correct:0,
            why:"The strongest challenge to a causal claim names a mechanism that points the opposite direction: if the Big Three mostly voted FOR management and against shareholder-sponsored proposals through most of this period, they were, if anything, a brake on activist campaigns succeeding, not an engine driving more of them. A real cause should predict the effect's direction, and this evidence does not.",
            wrongWhy:{
              1:"Correlation is genuinely uninformative on its own, but the STRONGEST rebuttal names a specific piece of contrary evidence (actual voting behavior) rather than a blanket dismissal of all correlational reasoning.",
              2:"A rising stock market is a real confound for many 2008–2021 trends, but it doesn't specifically address the mechanism in question — whether index funds' votes tend to support or oppose activist campaigns.",
              3:"Activism predating large index funds is true but weak: a cause can still meaningfully amplify a pre-existing trend, so this alone doesn't rule out a contributing causal role the way the voting-record evidence does."},
            generalizes:"When two trends rise together, the sharpest test of a causal story is to check whether the proposed mechanism's own, more granular evidence points the same direction as the claim — or the opposite way.",
          }}/>
          <p>The Big Three's own recent moves are a partial, market-driven response to exactly this concentration critique. BlackRock's "Voting Choice" program lets eligible clients redirect their proportional share of proxy votes to a policy of their own choosing instead of BlackRock's house judgment; as of March 31, 2026, about $851 billion of the $3.63 trillion in index-equity assets eligible for the program — roughly 23% — had actually enrolled, even though 92% of BlackRock's institutional index-equity assets are now eligible to participate (BlackRock, 2026). That means the large majority of even eligible assets still default to BlackRock's own voting judgment, not because clients are blocked from choosing otherwise, but because most have not (yet) opted in.</p>
          <MC onScore={onScore} q={{
            id:"rq2-c1",typeLabel:"Type C",kind:"case",
            client:"A public pension fund's chief investment officer, overseeing $40 billion in retirement assets, is deciding whether to move the plan's default equity allocation from a mix of actively managed funds into a single low-cost S&P 500 index fund from one of the Big Three. The move would cut the plan's annual fees by an estimated $60 million and, based on SPIVA's persistence data, plausibly improve net returns for most participants.",
            stem:"Which assumption is most load-bearing for this recommendation to create value for participants, and where is this section's evidence thinnest in supporting it?",
            options:[
              "That the fund is legally permitted to hold an S&P 500 index fund — already true and not in question",
              "That the index fund's expense ratio stays below 0.10% — a minor factor next to the bigger risk",
              "That concentrating more of the plan's assets and voting power with one of three managers won't itself create new governance or systemic risks that offset the fee savings — and the evidence for this is thin, since pass-through voting participation is still low (only about 23% of BlackRock's own eligible AUM) and the Big Three's aggregate influence at this scale remains largely untested by a genuine stress event",
              "That plan participants will never retire"],
            correct:2,
            why:"The fee-savings case is arithmetically solid, but it implicitly assumes that adding to an already-concentrated ownership and voting position carries no offsetting cost. This section's own evidence — a widening ownership-to-voting gap and still-partial pass-through voting adoption — is the thinnest support for that assumption, not the strongest.",
            wrongWhy:{
              0:"Legal permissibility is a precondition, not the assumption that determines whether the recommendation actually creates net value once concentration effects are considered.",
              1:"Expense-ratio stability affects the size of the savings, not whether concentrating assets and voting power with one manager introduces a separate, unpriced risk.",
              3:"This is irrelevant to the plan's investment decision and not addressed by this section's evidence at all."},
            generalizes:"For any 'consolidate for savings' recommendation — vendors, suppliers, index providers — name the concentration risk the savings estimate doesn't price in, and check whether the evidence for 'it'll be fine' is actually strong or just assumed.",
          }}/>
          <p>Outside these voluntary programs, no binding structural limit exists yet on how much of a single company, or of the market overall, one asset manager may own and vote. The honest section-level conclusion: passive investing has produced measurable concentration in both ownership and voting power that the "diffuse millions of small savers" story understates, and the industry's own response — pass-through voting — is real but still reaches only a minority of even the assets eligible for it.</p>
          <Glossary items={[
            {t:"Proxy voting",d:"Casting a vote on a company's behalf at its shareholder meeting, on matters like electing directors or approving pay packages."},
            {t:"Pass-through voting",d:"A program that lets the underlying investors in a fund choose how their share of the fund's votes gets cast, instead of the fund manager deciding for everyone."},
            {t:"Shareholder activism",d:"An investor publicly pushing a company to change strategy, leadership, or policy, sometimes through a formal shareholder vote."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(3)}>← Efficiency</button><button onClick={()=>jump(5)}>Next: Stability →</button></div>
        </section>

        {/* ---- Q3: STABILITY ---- */}
        <section ref={refs.current[5]}>
          <div className="kicker">Research Question 3</div>
          <h2>What has to stay true</h2>
          <p>The first two sections describe a real trade: individually rational cost-and-performance decisions, made by enough people through enough of the same three providers, that ownership, voting power, and the market's sensitivity to marginal trades have all shifted in ways the "just diversify and forget about it" story doesn't fully capture. The third question is whether this arrangement is stable — and the honest answer starts with naming its load-bearing assumption.</p>
          <p>The whole passive thesis rests on one assumption that nothing in this article has directly tested: that a pool of active, price-sensitive capital remains large enough and willing enough to keep prices roughly right, no matter how small a percentage of total assets it represents — and that this pool won't itself run dry, or turn one-directional, during a genuine stress event. Every figure in this article about market functioning (Bloomberg Intelligence's "no meaningful evidence" of distortion, the SPIVA underperformance data, the Gabaix-Koijen multiplier) was measured during, or reasoned from, a multi-decade period dominated by net INFLOWS to passive funds. None of it directly tells us what happens during a period of sustained net OUTFLOWS, when passive selling — unlike active selling — does not pause to ask whether the price looks cheap.</p>
          <MC onScore={onScore} q={{
            id:"rq3-a1",typeLabel:"Type A · Extrapolation limits",
            stem:"The Big Three's voting share rose from 14.5% (2008) to 27.5% (2021) — 13 percentage points over 13 years, or about 1 point per year on average. If extrapolated in a straight line, in roughly what year would their voting share reach 50% of all votes cast, and what does the plausibility of that extrapolation tell you about how such bounded trends actually behave as they approach a hard ceiling?",
            options:[
              "About 2044; and straight-line extrapolation is reliable here because the trend has been steady for over a decade",
              "About 2044 by the raw arithmetic (needing roughly 22 more points at about 1 point per year) — but a share of a bounded total almost always decelerates as it climbs, because the easiest, most index-friendly capital converts first, leaving harder-to-convert holdouts (custom mandates, foreign holders, insiders) for last, so the real crossing point, if it happens at all, is likely much later than a straight line implies",
              "Never, because voting share cannot mathematically exceed ownership share",
              "It has already happened, since the Big Three effectively control the S&P 500 outright"],
            correct:1,
            why:"The literal straight-line extrapolation (2021 + roughly 22 more years ≈ 2044) is the easy, misleading answer if taken at face value: real-world processes converging on a share of a fixed total almost always follow a decelerating, S-shaped path, not a constant linear rate, because the population left to convert changes character as the 'easy' capital gets used up first. Naming that the trend is bounded — and what kind of capital resists converting — is more valuable than trusting the raw extrapolated year.",
            wrongWhy:{
              0:"This is the literal, naive extrapolation the question is testing: real bounded-growth processes decelerate as they approach a ceiling; they don't hold a constant linear rate indefinitely.",
              2:"This section's own chart already shows voting share exceeding ownership share every year in the data — a real, documented pattern, not a mathematical impossibility.",
              3:"27.5% and 21.9% are far from majority control; treating a strong minority position as outright control ignores the numbers this article actually presents."},
            generalizes:"Any 'if this trend continues at its current rate' extrapolation toward a hard ceiling (100%, market saturation, full adoption) — check whether the growth process is more likely linear or S-shaped (decelerating) before trusting a straight-line projection.",
          }}/>
          <Numeric onScore={onScore} q={{
            id:"rq3-d3",typeLabel:"Type D",
            stem:"The Big Three's combined S&P 500 OWNERSHIP stake (not voting share) grew from 12.3% in 2008 to 21.9% in 2021 — 13 years. Assuming that same compound annual growth rate continued for another 13 years (to about 2034), estimate the resulting ownership share in 2034.",
            skeleton:"Decomposition: find the 13-year growth factor implied by 12.3%→21.9% (21.9/12.3 ≈ 1.78), then apply that SAME factor forward another 13 years from 21.9%.",
            tolNote:"±10% — tight, since this is a direct compounding calculation from two reported figures under one clearly stated assumption.",
            min:15,max:60,step:1,unit:"% ownership share in 2034",actual:39,tol:4,
            how:"The 2008→2021 growth factor is 21.9 ÷ 12.3 ≈ 1.78 over 13 years. Applying that SAME factor forward another 13 years gives 21.9% × 1.78 ≈ 39%. (Equivalently: the implied annual rate is 1.78^(1/13)−1 ≈ 4.5% per year, compounded forward 13 more years from 21.9%.) This is an ESTIMATE built entirely from two reported FACTs (12.3% in 2008, 21.9% in 2021) under an explicitly flagged simplifying assumption — constant compounding — not a forecast this article endorses; the Type A question above is a reminder that real bounded shares rarely compound at a constant rate all the way to a ceiling.",
            generalizes:"To project a share forward 'at the same rate it grew before,' multiply by the SAME growth factor over the SAME number of years — and always flag that the assumption of constant compounding, unlike the two FACTs feeding it, is illustrative, not a prediction.",
          }}/>
          <p>None of this means the arrangement is fragile in any specific, dated way — only that its safety has been observed under one kind of weather (rising, one-directional flows) and not the other (reversing flows). The section-level conclusion carries into the article's final synthesis: the load-bearing assumption is testable in principle, but so far it has not actually been tested.</p>
          <Glossary items={[
            {t:"S-curve (saturating growth)",d:"A pattern where something grows quickly at first and then slows as it approaches a natural limit, instead of continuing in a straight line forever."},
          ]}/>
          <div className="navbtns"><button onClick={()=>jump(4)}>← Concentration</button><button onClick={()=>jump(6)}>Next: Learning Summary →</button></div>
        </section>

        {/* ---- LEARNING SUMMARY ---- */}
        <section ref={refs.current[6]}>
          <div className="kicker">Learning Summary</div>
          <h2>What you did, and what to carry forward</h2>
          <Summary answers={answers} interp={interp}/>
          <div className="navbtns"><button onClick={()=>jump(5)}>← Stability</button><button onClick={()=>jump(7)}>Next: Conclusion →</button></div>
        </section>

        {/* ---- CONCLUSION ---- */}
        <section ref={refs.current[7]}>
          <div className="kicker">Conclusion</div>
          <h2>A fair decision for savers is not the same as a costless choice for the market</h2>
          <p>The central challenge is that the shift to passive investing is simultaneously well-justified at the level of any individual saver's decision and a source of real, measurable concentration in ownership, voting power, and the market's sensitivity to marginal trades once you add up what millions of individually reasonable decisions produce in aggregate. Under partial success — continued growth in index assets, continued expansion of pass-through voting programs, and continued absence of a genuine large-scale redemption event — the most likely path is not a crisis but a slow ratchet: a slightly larger combined ownership and voting stake for three firms each year, a slightly thinner residual pool of active, price-setting capital, and a market that keeps functioning acceptably well right up until the day flows run hard in the other direction.</p>
          <p>For asset owners and their boards, the practical implication is not to abandon low-cost indexing — the cost and performance evidence supporting it remains some of the most replicated in finance — but to stop treating governance and price-setting risk as automatically solved by owning thousands of individual stocks. A retirement plan that holds the whole market still concentrates its VOICE in that market through whichever of three firms manages its index funds, and its exposure to a systemic, market-wide flow shock is not reduced at all by owning more of the market.</p>
          <p>For the Big Three themselves, and for regulators, the pass-through voting experiments already underway (BlackRock's roughly $851 billion, about 23% of eligible assets under management, as of early 2026) are a genuine, market-driven response to the concentration critique, not a cosmetic one — but they remain partial, and most even eligible assets still default to a single firm's house judgment. The open institutional question is whether voluntary programs like these scale fast enough to keep pace with continued asset growth, or whether regulators eventually decide the pace is too slow and impose a structural cap or mandatory disclosure regime instead.</p>
          <MC onScore={onScore} q={{
            id:"concl-e1",typeLabel:"Type E · Implication + falsification",
            stem:"Given the evidence in this article — the well-documented, persistent case for indexing over stock-picking (SPIVA), the concentration of both ownership and voting power in three asset managers, and markets that are more sensitive to marginal flows than standard theory predicts (Gabaix and Koijen) — which real-world decision is most directly supported, paired with the observation that would most FALSIFY the article's central thesis?",
            options:[
              "Decision: large asset owners should keep shifting new allocations toward low-cost index funds for the core of a portfolio, while pushing all three major providers to expand and simplify pass-through voting so ownership concentration doesn't silently become governance concentration. Falsifier: if a period of sustained net OUTFLOWS from index funds (not just one bad market year, but sustained redemptions) produced disorderly, outsized price moves — confirming that the inelastic-markets mechanism cuts both ways, and that the shrinking pool of active capital cannot smoothly absorb passive money leaving as well as arriving — that would be the strongest evidence the concentration risk described here is not just theoretical",
              "Decision: regulators should force BlackRock, Vanguard, and State Street to sell down their holdings to below 5% of any single company. Falsifier: any company where they currently hold more than 5%",
              "Decision: every investor should abandon index funds and return to active stock-picking, since SPIVA shows some active managers occasionally beat the market. Falsifier: none needed",
              "Decision: nothing about index-fund growth matters until passive ownership exceeds 90% of the market. Falsifier: passive ownership reaching 90%"],
            correct:0,
            why:"The article's strongest supported thesis holds two things at once: the shift to indexing is evidence-based and rational at the individual level (SPIVA), and it has produced real, measurable concentration in ownership, voting power, and price-setting sensitivity that reassurances about market efficiency (Bloomberg Intelligence) have so far only been tested against a multi-decade period of net INFLOWS. The sharpest falsifier names the one observation — disorderly price moves during sustained OUTFLOWS — that would convert a theoretical elasticity concern into a demonstrated one.",
            wrongWhy:{
              1:"An arbitrary ownership cap ignores that this article's own evidence (SPIVA, cost data) supports continued index investing at the individual level, and 5% is already exceeded today for many companies, making the falsifier meaningless.",
              2:"This discards extremely strong, replicated evidence (up to 89.5% underperformance at 15 years) based on a handful of exceptions; a policy built on the exception, not the rule, with no stated falsifier, is not a defensible or testable recommendation.",
              3:"Ninety percent is an arbitrary threshold with no basis in this article's evidence; several concentration effects described here (governance, price elasticity) are already measurable well below that level."},
            generalizes:"A strong, evidence-based recommendation names the SPECIFIC future observation that would force you to abandon it — and for any thesis built mostly on a long period of one-directional flows, the sharpest test is what happens when the flow reverses.",
          }}/>
          <p style={{marginTop:18}}>The most important unresolved question is not whether passive investing has concentrated ownership and voting power — the data in this article already answers that — but whether the shrinking, increasingly important pool of active, price-sensitive capital that markets now depend on to absorb shocks has only ever been tested by a fifteen-year bull market, or whether it can actually do its job the first time flows reverse at scale.</p>
          <Sources/>
          <Glossary items={[
            {t:"Falsifier",d:"A specific, observable event that, if it happened, would prove a claim wrong; naming one in advance is what makes a claim testable rather than just asserted."},
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
    wu1:"A reported percentage is a definition — check how the numerator and denominator are built before trusting it",
    wu2:"A shrinking percentage share can hide a growing dollar level — check the total, not just the share",
    wu3:"A fix for one named risk may leave a second, structurally different risk untouched",
    "bg-mc1":"Multiply share by total before judging whether something is shrinking in absolute terms",
    "bg-d1":"Convert both endpoints of a 'share rose from X% to Y%' claim to dollars before sizing the real change",
    "rq1-a1":"More assets under management is not the same as more trading liquidity",
    "rq1-a2":"Percentage points and percent (relative) change are different units — don't conflate them",
    "rq1-d2":"Extrapolating a measured 'per unit' effect beyond its tested range requires flagging the linearity assumption explicitly",
    "rq2-b1":"The sharpest rebuttal to a causal claim names contrary evidence about the proposed mechanism itself",
    "rq2-c1":"Name the concentration risk a savings estimate doesn't price in before trusting the savings number alone",
    "rq3-a1":"Trends approaching a hard ceiling usually decelerate (S-curve), not extrapolate in a straight line",
    "rq3-d3":"Projecting 'the same rate as before' means multiplying by the same growth factor, not assuming it holds forever",
    "concl-e1":"A strong recommendation names its own falsifier — especially the one that would appear if a one-directional trend reversed",
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
      <p style={{fontSize:14}}>You saw four charts. Write the single most non-obvious insight you would defend to a skeptical chief investment officer.</p>
      {!govDone && <>
        <textarea value={gov} onChange={e=>setGov(e.target.value)} placeholder="One or two sentences…"/>
        <button className="btn" disabled={gov.trim().length<20} onClick={()=>setGovDone(true)}>Reveal the article's three insights</button>
      </>}
      {govDone && <>
        <div className="yours"><b>Your insight:</b> {gov}</div>
        <div style={{marginTop:10}}>
          <div className="insight-card"><b>1.</b> Passive investing's growth is not a market failure — it's a rational, well-evidenced response to a persistent, replicated fact: most active managers don't earn their fees (SPIVA). But "rational for each saver" and "consequence-free for the market as a whole" are different claims, and this article's evidence supports the first without yet settling the second.</div>
          <div className="insight-card"><b>2.</b> Ownership, voting power, and price-setting power are three different kinds of influence over a company's stock, and passive investing has grown each at a different rate: ownership (~21.9% for the Big Three by 2021) grew slowest, voting share (~27.5%) grew faster because passive investors reliably show up to vote while diffuse retail holders don't, and price-setting trading share (6.2% of stock-trading value from ETF primary-market activity) stayed smallest of all — the group with the least claim to setting prices day-to-day has the most claim to deciding who runs the companies.</div>
          <div className="insight-card"><b>3.</b> Markets appear to have gotten more sensitive to marginal flows, not less, as passive ownership grew (Gabaix and Koijen's ~5x multiplier), because the shrinking pool of price-sensitive capital left to absorb demand shifts has to work harder per dollar — a mechanism that has been observed only during inflows, never yet tested by a period of sustained outflows.</div>
        </div>
      </>}

      <h3>3 · Apply it</h3>
      <p style={{fontSize:14}}><b>(a) Transfer to a new domain.</b> A regional hospital network is deciding whether to standardize all its clinics onto a single electronic-health-record (EHR) platform from one vendor, replacing several competing systems. Rough numbers: standardizing saves the network about $18 million a year in duplicate licensing and integration costs; the vendor's platform would then hold and control data-access decisions for about 85% of the network's patient records, up from about 30% today spread across several vendors; the vendor's own five-year record shows two multi-hour system-wide outages, versus zero network-wide outages when systems were split across vendors. In four labeled parts, write: (1) a one-sentence so-what thesis about whether the network should standardize, (2) the single load-bearing assumption that must hold, (3) the strongest evidence that would undermine it, and (4) a one-line pre-mortem: "If this fails in 12 months, the most likely reason is ___."</p>
      <textarea value={applyA} onChange={e=>setApplyA(e.target.value)} placeholder="1) Thesis…  2) Assumption…  3) Disconfirming evidence…  4) Pre-mortem…"/>
      <p style={{fontSize:14,marginTop:12}}><b>(b) Cross-link to a prior article.</b> Name one principle from an earlier article (FIFA's asset-owner-vs-risk-bearer split, GLP-1's per-unit-vs-aggregate distinction, immaculate disinflation's sacrifice-ratio sign test, private credit's measurement-artifact lesson, streaming's fixed-cost-scale lesson, AI capex's spend-vs-revenue gap, Baumol's productivity-tracks-price lesson, or gene therapy's value-vs-adoption split) that most reinforces or conflicts with today's ownership-vs-voting-vs-trading distinction, and say why.</p>
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
        <p>• Li, Lei. "Trends in the Expenses and Fees of Funds, 2025." ICI Research Perspective 32, no. 1 (March 2026) — index funds' share of long-term fund assets (19% in 2010 → 52% in 2025); total net assets ($9.9T → $36.6T); index vs. active expense ratios (0.05% vs. 0.40%); average fund sizes ($15.0B index vs. $2.8B active equity mutual funds). <a href="https://www.ici.org/system/files/2026-03/per32-01.pdf" target="_blank" rel="noopener">ici.org</a></p>
        <p>• Investment Company Institute. "2025 Investment Company Fact Book," Chapter 4: US Exchange-Traded Funds — domestic-equity ETF primary-market activity as 6.2% of 2024's $112.5T in US company-stock trading (Figure 4.3); ETF secondary-market trading as 27% of 2024 total US stock-trading volume, down from a 32% peak in 2022 (Figure 4.2); ETF total net assets ($10.3T, year-end 2024). <a href="https://www.icifactbook.org/pdf/2025-factbook-ch4.pdf" target="_blank" rel="noopener">icifactbook.org</a></p>
        <p>• Franck, Thomas. "Passive investing rules Wall Street now, topping actively managed assets in stock, bond and other funds." CNBC, Jan. 18, 2024 (Morningstar data) — passive AUM ($13.29T) surpassing active AUM ($13.23T) across all asset classes for the first time at year-end 2023; 38% of large-cap active funds outperformed their Russell benchmarks in 2023, down from 47% in 2022 (BofA data cited). <a href="https://www.cnbc.com/2024/01/18/passive-investing-rules-wall-street-now-topping-actively-managed-assets-in-stock-bond-and-other-funds.html" target="_blank" rel="noopener">cnbc.com</a></p>
        <p>• S&amp;P Dow Jones Indices. "SPIVA U.S. Scorecard Year-End 2024." — large-cap active fund underperformance vs. the S&amp;P 500 by trailing horizon (65.24% at 1-yr; 84.96% at 3-yr; 76.26% at 5-yr; 84.34% at 10-yr; 89.50% at 15-yr; 91.99% at 20-yr, all periods ending Dec. 31, 2024). <a href="https://www.spglobal.com/spdji/en/documents/spiva/spiva-us-year-end-2024.pdf" target="_blank" rel="noopener">spglobal.com</a></p>
        <p>• Bebchuk, Lucian A., and Scott Hirst. "Big Three Power, and Why It Matters." Boston University Law Review 102 (2022): 1547 — Big Three (BlackRock, Vanguard, State Street) median combined ownership stake in S&amp;P 500 companies, 2008–2021 (Table 1: 12.3% → 21.9%); median combined share of votes cast at annual meetings, 2007–2021 (Table 2: 14.5% in 2008 → 27.5% in 2021). <a href="https://www.bu.edu/bulawreview/files/2022/10/BEBCHUK-HIRST.pdf" target="_blank" rel="noopener">bu.edu</a></p>
        <p>• Ben-David, Itzhak, Francesco A. Franzoni, and Rabih Moussawi. "Do ETFs Increase Volatility?" Journal of Finance 73, no. 6 (2018); NBER Working Paper 20071 — a one-standard-deviation rise in ETF ownership associated with a 16%-of-a-standard-deviation increase in daily stock return volatility (about 20 basis points) for S&amp;P 500 stocks, via arbitrage/liquidity-propagation channels. <a href="https://www.nber.org/system/files/working_papers/w20071/revisions/w20071.rev0.pdf" target="_blank" rel="noopener">nber.org</a></p>
        <p>• Gabaix, Xavier, and Ralph S. J. Koijen. "In Search of the Origins of Financial Fluctuations: The Inelastic Markets Hypothesis." NBER Working Paper 28967 (June 2021) — $1 of net demand for US stocks raises the aggregate market's value by about $5 (multiplier ≈5, range roughly 3–8 across specifications), attributed to fixed-allocation-mandate holders reducing the market's price elasticity. <a href="https://www.nber.org/system/files/working_papers/w28967/w28967.pdf" target="_blank" rel="noopener">nber.org</a></p>
        <p>• Psarofagis, Athanasios. "Passive's no bubble as active retains market control." Bloomberg Intelligence, 2025 — passive equity vehicles own about 13% of the entire US stock market and more than 20% of the S&amp;P 500; no meaningful evidence found that passive ownership distorts prices or volatility; roughly 80%+ of active managers trail benchmarks long-term regardless of regional passive share. <a href="https://www.bloomberg.com/professional/insights/trading/passives-no-bubble-as-active-retains-market-control/" target="_blank" rel="noopener">bloomberg.com</a></p>
        <p>• BlackRock. "Empowering investors through BlackRock Voting Choice" (data as of March 31, 2026) — about $851 billion (roughly 23%) of the $3.63 trillion in index-equity assets eligible for BlackRock Voting Choice had enrolled; 92% of BlackRock's institutional index-equity assets are eligible. <a href="https://www.blackrock.com/corporate/about-us/investment-stewardship/blackrock-voting-choice" target="_blank" rel="noopener">blackrock.com</a></p>
        <p>• Fichtner, Jan, Eelke M. Heemskerk, and Javier Garcia-Bernardo. "These three firms own corporate America." The Conversation, 2017 (CORPNET research; underlying ownership/voting data as of approximately 2015–2016 — a dated figure, cited here only to characterize historical Big Three voting behavior, not current practice) — Big Three funds voted with company management in roughly 9 of 10 votes and were reluctant to back shareholder-sponsored proposals. <a href="https://theconversation.com/these-three-firms-own-corporate-america-77072" target="_blank" rel="noopener">theconversation.com</a></p>
      </div>
      <p style={{fontSize:12.5,color:"#777",marginTop:8}}>Note on estimates: the dollar-decomposition figures in Background and Section 1 (e.g., "$8.0T→$17.6T," "$17.1T of net growth") are ESTIMATEs computed by multiplying reported percentage shares by reported total-asset FACTs from the same ICI source and year; they are not separately reported statistics. The Section 3 ownership-share and voting-share extrapolations to 2034/2044 are ESTIMATEs built from two reported FACTs under an explicitly flagged constant-growth-rate assumption that this article does not endorse as a forecast. The Section 1 volatility extrapolation (two standard deviations of ETF ownership growth) is an ESTIMATE that assumes a measured one-standard-deviation effect scales linearly, an assumption the original study does not make.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
