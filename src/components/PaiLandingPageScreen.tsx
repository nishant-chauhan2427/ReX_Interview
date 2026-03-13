import { useEffect, useRef, useState } from "react";

interface PAILandingPageProps {
  onBeginInterview?: () => void;
}

export function PAILandingPage({ onBeginInterview }: PAILandingPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState({ s1: 0, s2: 0 });
  const [counted, setCounted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let animId: number;
    let W = 0, H = 0;
    type Pt = { x: number; y: number; vx: number; vy: number; r: number; pulse: number; speed: number };
    let pts: Pt[] = [];
    const mouse = { x: -999, y: -999 };
    const CONN_DIST = 120, MOUSE_DIST = 170, MOUSE_REPEL = 60;

    function resize() { W = canvas!.width = window.innerWidth; H = canvas!.height = window.innerHeight; }
    function init() {
      pts = [];
      const n = Math.floor((W * H) / 20000);
      for (let i = 0; i < n; i++)
        pts.push({ x: Math.random()*W, y: Math.random()*H, vx:(Math.random()-.5)*.16, vy:(Math.random()-.5)*.16, r:Math.random()*.8+.3, pulse:Math.random()*Math.PI*2, speed:.018+Math.random()*.018 });
    }
    function draw() {
      ctx.clearRect(0,0,W,H);
      for (let i=0;i<pts.length;i++) {
        const p=pts[i]; p.pulse+=p.speed;
        const mdx=p.x-mouse.x,mdy=p.y-mouse.y,md=Math.sqrt(mdx*mdx+mdy*mdy);
        if(md<MOUSE_REPEL&&md>0){const f=(MOUSE_REPEL-md)/MOUSE_REPEL;p.vx+=(mdx/md)*f*.5;p.vy+=(mdy/md)*f*.5;}
        p.vx*=.96;p.vy*=.96;p.x+=p.vx;p.y+=p.vy;
        if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
        ctx.beginPath();ctx.arc(p.x,p.y,Math.max(0.1,p.r+Math.sin(p.pulse)*.35),0,Math.PI*2);
        ctx.fillStyle=`rgba(0,200,255,${.14+Math.sin(p.pulse)*.08})`;ctx.fill();
      }
      for (let i=0;i<pts.length;i++) {
        const p=pts[i];
        for(let j=i+1;j<pts.length;j++){
          const q=pts[j],dx=p.x-q.x,dy=p.y-q.y,d=Math.sqrt(dx*dx+dy*dy);
          if(d<CONN_DIST){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle=`rgba(0,150,190,${(1-d/CONN_DIST)*.09})`;ctx.lineWidth=.4;ctx.stroke();}
        }
        if(mouse.x>0){
          const cdx=p.x-mouse.x,cdy=p.y-mouse.y,cd=Math.sqrt(cdx*cdx+cdy*cdy);
          if(cd<MOUSE_DIST){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(mouse.x,mouse.y);ctx.strokeStyle=`hsla(${185+cd/MOUSE_DIST*25},100%,58%,${(1-cd/MOUSE_DIST)*.5})`;ctx.lineWidth=.5+(1-cd/MOUSE_DIST)*1.1;ctx.stroke();}
        }
      }
      if(mouse.x>0){ctx.beginPath();ctx.arc(mouse.x,mouse.y,3,0,Math.PI*2);ctx.fillStyle="rgba(0,229,255,0.8)";ctx.fill();}
      animId=requestAnimationFrame(draw);
    }
    resize();init();draw();
    const onMove=(e:MouseEvent)=>{mouse.x=e.clientX;mouse.y=e.clientY;};
    const onLeave=()=>{mouse.x=-999;mouse.y=-999;};
    window.addEventListener("mousemove",onMove);window.addEventListener("mouseleave",onLeave);window.addEventListener("resize",()=>{resize();init();});
    return()=>{cancelAnimationFrame(animId);window.removeEventListener("mousemove",onMove);window.removeEventListener("mouseleave",onLeave);};
  },[]);

  useEffect(()=>{
    const el=statsRef.current;if(!el)return;
    const obs=new IntersectionObserver((entries)=>{
      if(entries[0].isIntersecting&&!counted){
        setCounted(true);const dur=1400,start=performance.now();
        function step(now:number){const p=Math.min((now-start)/dur,1),e=1-Math.pow(1-p,3);setCounts({s1:Math.round(e*98),s2:Math.round(e*3)});if(p<1)requestAnimationFrame(step);}
        requestAnimationFrame(step);
      }
    },{threshold:0.3});
    obs.observe(el);return()=>obs.disconnect();
  },[counted]);

  return (
    <div style={{background:"#010812",minHeight:"100vh",fontFamily:"'Syne','Space Grotesk',sans-serif",color:"#c8dff5",overflowX:"hidden",overflowY:"auto",position:"relative"}}>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Space+Grotesk:wght@300;400;500;600&display=swap"/>
      <canvas ref={canvasRef} style={{position:"fixed",inset:0,zIndex:0,pointerEvents:"none"}}/>

      <style>{`
        @keyframes orbpulse{0%,100%{filter:drop-shadow(0 0 18px rgba(0,229,255,.5))}50%{filter:drop-shadow(0 0 32px rgba(0,229,255,.8))}}
        @keyframes ringspin{to{transform:rotate(360deg)}}
        @keyframes ringspinrev{to{transform:rotate(-360deg)}}
        @keyframes ripple{0%{transform:scale(.5);opacity:.6}100%{transform:scale(2);opacity:0}}
        @keyframes barwave{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}
        @keyframes floatin{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes scanx{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes hexrot{to{transform:rotate(360deg)}}
        @keyframes fadein{from{opacity:0}to{opacity:1}}
        @keyframes stepglow{0%,100%{box-shadow:0 0 0 0 rgba(0,229,255,0)}50%{box-shadow:0 0 20px 4px rgba(0,229,255,.22)}}
        @keyframes borderflow{0%{background-position:0% 50%}100%{background-position:200% 50%}}

        .btn-primary{padding:14px 34px;border-radius:12px;border:none;background:linear-gradient(135deg,#00d4ff,#0088cc);color:#010812;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;letter-spacing:.05em;transition:transform .15s,box-shadow .2s}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 0 30px rgba(0,212,255,.45)}
        .btn-ghost{padding:14px 34px;border-radius:12px;border:1px solid rgba(0,229,255,.2);background:transparent;color:rgba(0,229,255,.65);font-size:13px;font-family:inherit;cursor:pointer;transition:all .2s}
        .btn-ghost:hover{border-color:rgba(0,229,255,.45);color:rgba(0,229,255,.9);background:rgba(0,229,255,.06)}

        .feat-card{background:rgba(4,14,30,.85);border:1px solid rgba(0,229,255,.1);border-radius:18px;padding:24px 22px;transition:all .25s;position:relative;overflow:hidden;backdrop-filter:blur(4px)}
        .feat-card::before{content:'';position:absolute;top:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(0,229,255,.3),transparent);opacity:0;transition:opacity .3s}
        .feat-card:hover{border-color:rgba(0,229,255,.28);transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,229,255,.08)}
        .feat-card:hover::before{opacity:1}

        .stat-item{flex:1;min-width:130px;padding:20px 16px;text-align:center;transition:background .3s;border-radius:12px}
        .stat-item:hover{background:rgba(0,229,255,.04)}

        .step-circle{width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:800;margin-bottom:14px;position:relative;z-index:1;transition:all .2s}
        .step-circle.active{background:linear-gradient(135deg,#001e2c,#002e40);border:1.5px solid rgba(0,229,255,.55);color:#00e5ff;animation:stepglow 2.5s ease-in-out infinite}
        .step-circle.inactive{background:#030b18;border:1px solid rgba(0,229,255,.22);color:rgba(0,229,255,.5)}

        .nav-link{font-size:12px;color:#3a7080;letter-spacing:.06em;cursor:pointer;transition:color .2s;font-weight:500}
        .nav-link:hover{color:rgba(0,229,255,.75)}

        .section-label{font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:rgba(0,229,255,.5);margin-bottom:20px;text-align:center;font-weight:600;display:flex;align-items:center;justify-content:center;gap:12px}
        .section-label::before,.section-label::after{content:'';flex:1;max-width:80px;height:1px;background:linear-gradient(90deg,transparent,rgba(0,229,255,.2))}
        .section-label::after{background:linear-gradient(90deg,rgba(0,229,255,.2),transparent)}
      `}</style>

      <div style={{position:"relative",zIndex:1,maxWidth:1000,margin:"0 auto",padding:"0 28px"}}>

        {/* NAV */}
        <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"22px 0 0"}}>
          <div style={{fontSize:26,fontWeight:800,letterSpacing:".1em",color:"#fff"}}>
            P<span style={{color:"#00e5ff"}}>AI</span>
          </div>
          <div style={{display:"flex",gap:32}}>
            {["Features","How it works","Security"].map(l=>(
              <span key={l} className="nav-link">{l}</span>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7,padding:"8px 18px",borderRadius:999,border:"1px solid rgba(0,229,255,.18)",background:"rgba(0,229,255,.06)",fontSize:10,letterSpacing:".1em",color:"rgba(0,229,255,.8)",fontWeight:600}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#00e5ff",animation:"orbpulse 2s ease-in-out infinite"}}/>
            LIVE · SECURE
          </div>
        </nav>

        {/* HERO */}
        <section style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",padding:"32px 0 24px",position:"relative"}}>
          <div style={{position:"absolute",top:0,left:-28,right:-28,height:1,background:"linear-gradient(90deg,transparent,#00e5ff,transparent)",animation:"scanx 6s linear infinite",opacity:.3}}/>

          {/* BADGE */}
          <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 18px",borderRadius:999,border:"1px solid rgba(0,229,255,.22)",background:"rgba(0,229,255,.07)",marginBottom:28,animation:"floatin .5s ease both 0s",opacity:0}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:"#00e5ff",animation:"orbpulse 1.5s ease-in-out infinite"}}/>
            <span style={{fontSize:10,letterSpacing:".15em",color:"rgba(0,229,255,.85)",fontWeight:600}}>AI-POWERED INTERVIEW PLATFORM</span>
          </div>

          {/* ORB */}
          <div style={{position:"relative",width:190,height:190,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:28}}>
            {[0,.9,1.8].map((d,i)=>(
              <div key={i} style={{position:"absolute",width:190,height:190,borderRadius:"50%",border:"1px solid rgba(0,229,255,.1)",animation:`ripple 3.2s ease-out ${d}s infinite`}}/>
            ))}
            <svg style={{position:"absolute",width:152,height:152,animation:"hexrot 24s linear infinite"}} viewBox="0 0 152 152" fill="none">
              <polygon points="76,4 144,40 144,112 76,148 8,112 8,40" stroke="#00e5ff" strokeWidth=".5" strokeOpacity=".12" strokeDasharray="3 7"/>
              {([[76,4],[144,40],[144,112],[76,148],[8,112],[8,40]] as [number,number][]).map(([cx,cy],i)=>(
                <circle key={i} cx={cx} cy={cy} r={1.8} fill="#00e5ff" fillOpacity=".18"/>
              ))}
            </svg>
            <svg style={{position:"absolute",width:126,height:126,animation:"hexrot 16s linear infinite reverse"}} viewBox="0 0 126 126" fill="none">
              <polygon points="63,3 118,33 118,93 63,123 8,93 8,33" stroke="#0891b2" strokeWidth=".4" strokeOpacity=".08" strokeDasharray="2 8"/>
            </svg>
            <div style={{position:"absolute",width:116,height:116,borderRadius:"50%",background:"conic-gradient(from 0deg,transparent 58%,#00e5ff 78%,#0891b2 100%)",animation:"ringspin 1.9s linear infinite"}}/>
            <div style={{position:"absolute",width:98,height:98,borderRadius:"50%",background:"conic-gradient(from 180deg,transparent 62%,rgba(8,145,178,.2) 100%)",animation:"ringspinrev 3s linear infinite"}}/>
            <div style={{position:"relative",zIndex:10,width:74,height:74,borderRadius:"50%",background:"radial-gradient(circle at 30% 26%,#67e8f9,#06b6d4,#0e7490)",border:"2px solid rgba(0,229,255,.45)",animation:"orbpulse 2.2s ease-in-out infinite",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:3}}>
                {([6,12,18,12,6] as number[]).map((h,i)=>(
                  <div key={i} style={{width:3,borderRadius:3,background:"#fff",height:h,transformOrigin:"bottom",animation:`barwave .5s ease-in-out ${[0,.08,.04,.1,.02][i]}s infinite`}}/>
                ))}
              </div>
            </div>
          </div>

          <h1 style={{fontSize:"clamp(38px,5.8vw,68px)",fontWeight:800,lineHeight:1.04,letterSpacing:"-.03em",marginBottom:16,animation:"floatin .6s ease both .1s",opacity:0,color:"#ffffff"}}>
            Interview Intelligence<br/>
            <span style={{display:"block",background:"linear-gradient(90deg,#00e5ff,#38bdf8,#818cf8,#00e5ff)",backgroundSize:"200%",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"shimmer 4s linear infinite 1s"}}>
              Redefined by AI
            </span>
          </h1>

          <p style={{fontSize:15,color:"#6aacbf",lineHeight:1.8,maxWidth:460,margin:"0 auto 28px",fontWeight:400,animation:"floatin .6s ease both .25s",opacity:0}}>
            PAI conducts precise, adaptive interviews — evaluating every response with zero bias, in real time.
          </p>

          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",animation:"floatin .6s ease both .35s",opacity:0}}>
            <button className="btn-primary" onClick={onBeginInterview}>Begin Interview →</button>
            <button className="btn-ghost">How it works</button>
          </div>

          {/* TRUST ROW */}
          <div style={{display:"flex",gap:24,marginTop:32,animation:"floatin .6s ease both .5s",opacity:0,flexWrap:"wrap",justifyContent:"center"}}>
            {[
              {icon:"🔒",text:"End-to-end encrypted"},
              {icon:"⚡",text:"Real-time AI analysis"},
              {icon:"🎯",text:"Zero human bias"},
            ].map(t=>(
              <div key={t.text} style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"rgba(0,229,255,.45)",fontWeight:500,letterSpacing:".04em"}}>
                <span style={{fontSize:12}}>{t.icon}</span>{t.text}
              </div>
            ))}
          </div>
        </section>

        {/* DIVIDER */}
        <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(0,229,255,.15),transparent)",margin:"8px 0 28px"}}/>

        {/* STATS */}
        <div ref={statsRef}>
          <div className="section-label">Performance metrics</div>
          <div style={{display:"flex",justifyContent:"center",flexWrap:"wrap" as const,gap:4,background:"rgba(0,229,255,.03)",borderRadius:16,border:"1px solid rgba(0,229,255,.07)",padding:"8px 0"}}>
            {[
              {num:`${counts.s1}%`,label:"Accuracy",desc:"Across all evaluations"},
              {num:`${counts.s2}x`,label:"Faster hiring",desc:"vs traditional process"},
              {num:"Zero",label:"Human bias",desc:"Fully objective scoring"},
              {num:"24/7",label:"Always on",desc:"No scheduling needed"},
            ].map((s,i)=>(
              <div key={i} className="stat-item" style={{borderLeft:i===0?"none":"1px solid rgba(0,229,255,.07)"}}>
                <div style={{fontSize:42,fontWeight:800,letterSpacing:"-.04em",lineHeight:1,marginBottom:8,color:"#ffffff"}}>{s.num}</div>
                <div style={{fontSize:10,letterSpacing:".14em",textTransform:"uppercase" as const,color:"#00e5ff",fontWeight:600,marginBottom:4,opacity:.7}}>{s.label}</div>
                <div style={{fontSize:11,color:"#3a6878",fontWeight:400}}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(0,229,255,.15),transparent)",margin:"28px 0"}}/>

        {/* FEATURES */}
        <div className="section-label">Core capabilities</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,paddingBottom:8}}>
          {[
            {num:"01",title:"Live neural analysis",desc:"Tone, clarity and relevance evaluated in real time with deep semantic scoring models.",icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>},
            {num:"02",title:"Zero-trust security",desc:"Encrypted sessions with anti-cheat detection, head tracking, and proctoring.",icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>},
            {num:"03",title:"Adaptive questions",desc:"Questions evolve intelligently based on your role, level, and each answer given.",icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>},
          ].map(f=>(
            <div key={f.num} className="feat-card">
              <div style={{fontSize:10,letterSpacing:".18em",color:"rgba(0,229,255,.25)",marginBottom:14,fontWeight:600}}>{f.num}</div>
              <div style={{width:44,height:44,borderRadius:12,background:"rgba(0,229,255,.07)",border:"1px solid rgba(0,229,255,.16)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16}}>{f.icon}</div>
              <div style={{fontSize:15,fontWeight:700,color:"#e2f0fa",marginBottom:10,letterSpacing:"-.01em"}}>{f.title}</div>
              <div style={{fontSize:12,color:"#3e7888",lineHeight:1.75,fontWeight:400}}>{f.desc}</div>
            </div>
          ))}
        </div>

        <div style={{height:1,background:"linear-gradient(90deg,transparent,rgba(0,229,255,.15),transparent)",margin:"28px 0"}}/>

        {/* HOW IT WORKS */}
        <div className="section-label">How PAI works</div>
        <div style={{display:"flex",position:"relative",padding:"8px 0 20px"}}>
          <div style={{position:"absolute",top:36,left:"12%",right:"12%",height:1,background:"linear-gradient(90deg,rgba(0,229,255,.22),rgba(0,229,255,.06))"}}/>
          {[
            {n:"1",name:"Verify",info:"Identity & camera check",active:true},
            {n:"2",name:"Listen",info:"PAI speaks the question",active:false},
            {n:"3",name:"Respond",info:"Record your answer",active:false},
            {n:"4",name:"Score",info:"AI evaluates live",active:false},
          ].map(s=>(
            <div key={s.n} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"0 4px"}}>
              <div className={`step-circle ${s.active?"active":"inactive"}`}>{s.n}</div>
              <div style={{fontSize:12,fontWeight:700,color:s.active?"#9ed4e8":"#5a9aaa",marginBottom:5,letterSpacing:".02em"}}>{s.name}</div>
              <div style={{fontSize:11,color:"#5a9aaa",lineHeight:1.6,fontWeight:400,textAlign:"center" as const}}>{s.info}</div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div style={{padding:"18px 0 26px",textAlign:"center" as const,borderTop:"1px solid rgba(0,229,255,.06)",marginTop:4,display:"flex",justifyContent:"center",alignItems:"center",gap:8,flexWrap:"wrap" as const}}>
          <span style={{fontSize:10,color:"#5a9aaa",letterSpacing:".06em"}}>© 2026 PAI INTERVIEWER</span>
          <span style={{color:"rgba(0,229,255,.5)",fontSize:14}}>·</span>
          <span style={{fontSize:10,color:"#5a9aaa",letterSpacing:".06em"}}>INTELLIGENT HIRING BY REX</span>
          <span style={{color:"rgba(0,229,255,.5)",fontSize:14}}>·</span>
          <span style={{fontSize:10,color:"#5a9aaa",letterSpacing:".06em"}}>VAYUZ TECHNOLOGIES</span>
        </div>

      </div>
    </div>
  );
}