"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Zap, Clock, Users, Star, Shield, ChevronRight } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const features = [
    { icon: <TrendingUp size={28} color="#818cf8"/>, title: "Live Rankings", desc: "PPR, Half PPR, and Standard rankings updated in real time. Filter by position, search players, and export to CSV." },
    { icon: <Zap size={28} color="#34d399"/>, title: "Mock Draft Simulator", desc: "Snake, linear, and auction drafts with customizable teams, rounds, and pick slots. Practice before your real draft." },
    { icon: <Clock size={28} color="#f472b6"/>, title: "Dynasty Rankings", desc: "Age and experience-adjusted dynasty rankings to help you build a championship roster for years to come." },
    { icon: <Users size={28} color="#fbbf24"/>, title: "Auction Tools", desc: "Auction draft simulator with budget tracking, nomination flow, and per-team spending breakdowns." },
    { icon: <Star size={28} color="#f59e0b"/>, title: "Favorites & Tiers", desc: "Star your favorite players, view tier breakdowns, and get projected auction values for every player." },
    { icon: <Shield size={28} color="#06b6d4"/>, title: "IDP Support", desc: "Full individual defensive player support including DL, LB, and DB rankings and draft tools." },
  ];

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)",color:"#f1f5f9",fontFamily:"system-ui,sans-serif"}}>

      {/* Nav */}
      <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 40px",borderBottom:"1px solid #1e293b"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <TrendingUp size={24} color="#818cf8"/>
          <span style={{fontSize:22,fontWeight:900,background:"linear-gradient(90deg,#818cf8,#c084fc,#f472b6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>GRID IRON</span>
        </div>
        <button
          onClick={() => router.push("/app")}
          style={{padding:"10px 24px",borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:6}}
        >
          Launch App <ChevronRight size={16}/>
        </button>
      </nav>

      {/* Hero */}
      <div style={{textAlign:"center",padding:"80px 20px 60px"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 16px",borderRadius:20,background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.3)",marginBottom:24}}>
          <Zap size={14} color="#818cf8"/>
          <span style={{fontSize:13,color:"#818cf8",fontFamily:"monospace"}}>2025 Fantasy Football Season</span>
        </div>
        <h1 style={{fontSize:"clamp(36px,7vw,80px)",fontWeight:900,margin:"0 0 20px",background:"linear-gradient(90deg,#818cf8,#c084fc,#f472b6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"-0.03em",lineHeight:1.1}}>
          Win Your Fantasy<br/>Football League
        </h1>
        <p style={{fontSize:"clamp(16px,2.5vw,20px)",color:"#94a3b8",maxWidth:600,margin:"0 auto 40px",lineHeight:1.6}}>
          Professional rankings, mock draft simulator, auction tools, and dynasty analysis — everything you need to dominate your league.
        </p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <button
            onClick={() => router.push("/app")}
            style={{padding:"16px 36px",borderRadius:14,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",fontWeight:800,fontSize:16,display:"flex",alignItems:"center",gap:8,boxShadow:"0 8px 32px rgba(99,102,241,0.4)"}}
          >
            Start For Free <ChevronRight size={18}/>
          </button>
          <button
            onClick={() => router.push("/app")}
            style={{padding:"16px 36px",borderRadius:14,border:"1px solid #1e293b",cursor:"pointer",background:"transparent",color:"#94a3b8",fontWeight:700,fontSize:16}}
          >
            View Rankings
          </button>
        </div>
        <p style={{marginTop:16,fontSize:13,color:"#475569"}}>Free to use · No account required</p>
      </div>

      {/* Stats bar */}
      <div style={{display:"flex",justifyContent:"center",gap:0,flexWrap:"wrap",borderTop:"1px solid #1e293b",borderBottom:"1px solid #1e293b",margin:"0 0 80px"}}>
        {[
          {value:"1,000+", label:"Players Ranked"},
          {value:"3", label:"Scoring Formats"},
          {value:"Snake & Auction", label:"Draft Types"},
          {value:"Free", label:"Always"},
        ].map((stat, i) => (
          <div key={i} style={{padding:"28px 40px",textAlign:"center",borderRight:"1px solid #1e293b"}}>
            <div style={{fontSize:28,fontWeight:900,background:"linear-gradient(90deg,#818cf8,#c084fc)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{stat.value}</div>
            <div style={{fontSize:13,color:"#64748b",marginTop:4}}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{maxWidth:1100,margin:"0 auto",padding:"0 20px 80px"}}>
        <h2 style={{textAlign:"center",fontSize:"clamp(24px,4vw,40px)",fontWeight:900,marginBottom:48}}>Everything You Need to Win</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:20}}>
          {features.map((f, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
              style={{padding:28,borderRadius:16,border:"1px solid",borderColor:hoveredFeature===i?"rgba(99,102,241,0.4)":"#1e293b",background:hoveredFeature===i?"rgba(99,102,241,0.05)":"rgba(15,23,42,0.4)",transition:"all 0.2s",cursor:"default"}}
            >
              <div style={{marginBottom:14}}>{f.icon}</div>
              <h3 style={{margin:"0 0 8px",fontSize:18,fontWeight:800}}>{f.title}</h3>
              <p style={{margin:0,color:"#64748b",fontSize:14,lineHeight:1.6}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{textAlign:"center",padding:"60px 20px 80px",borderTop:"1px solid #1e293b"}}>
        <h2 style={{fontSize:"clamp(24px,4vw,40px)",fontWeight:900,margin:"0 0 16px"}}>Ready to Dominate Your League?</h2>
        <p style={{color:"#64748b",marginBottom:32,fontSize:16}}>No signup required. Jump straight into the rankings.</p>
        <button
          onClick={() => router.push("/app")}
          style={{padding:"16px 48px",borderRadius:14,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",fontWeight:800,fontSize:18,boxShadow:"0 8px 32px rgba(99,102,241,0.4)"}}
        >
          Launch Grid Iron Free
        </button>
      </div>

      {/* Footer */}
      <div style={{textAlign:"center",padding:"20px",borderTop:"1px solid #1e293b",color:"#334155",fontSize:13}}>
        © {new Date().getFullYear()} Grid Iron · Fantasy Football Rankings & Draft Tools
      </div>
    </div>
  );
}