"use client";
import { useState, useEffect } from "react";
import { Star, TrendingUp, Newspaper, AlertCircle, Loader } from "lucide-react";
import { pc, ti } from "@/constants/theme";

const CURRENT_YEAR = new Date().getFullYear();
const STATS_YEARS = [
  CURRENT_YEAR - 1,
  CURRENT_YEAR - 2,
  CURRENT_YEAR - 3,
  CURRENT_YEAR - 4,
  CURRENT_YEAR - 5,
];

export default function PlayerModal({ C, player, favorites, toggleFav, onClose }) {
  const [history, setHistory]   = useState({});  // { year: pts }
  const [news, setNews]         = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingNews, setLoadingNews]       = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch stats history and news whenever player changes
  useEffect(() => {
    if (!player) return;
    setHistory({});
    setNews([]);
    setActiveTab("overview");
    fetchHistory();
    fetchNews();
  }, [player?.id]);

  async function fetchHistory() {
    setLoadingHistory(true);
    const results = {};
    await Promise.all(
      STATS_YEARS.map(async (year) => {
        try {
          const res = await fetch(`https://api.sleeper.app/v1/stats/nfl/regular/${year}`);
          if (!res.ok) return;
          const data = await res.json();
          const playerStats = data[player.id];
          if (playerStats) {
            // Use half PPR as the standard history metric
            const pts = playerStats.pts_half_ppr || playerStats.pts_ppr || playerStats.pts_std || 0;
            if (pts > 0) results[year] = Math.round(pts * 10) / 10;
          }
        } catch {
          // Year unavailable, skip
        }
      })
    );
    setHistory(results);
    setLoadingHistory(false);
  }

  async function fetchNews() {
    setLoadingNews(true);
    try {
      const res = await fetch(`https://api.sleeper.app/v1/players/nfl/${player.id}/news`);
      if (res.ok) {
        const data = await res.json();
        setNews(Array.isArray(data) ? data.slice(0, 5) : []);
      }
    } catch {
      setNews([]);
    }
    setLoadingNews(false);
  }

  // Early return AFTER all hooks (Rules of Hooks requires this)
  if (!player || !C) return null;

  // Bar chart helpers
  const historyEntries = STATS_YEARS.map(y => ({ year: y, pts: history[y] || 0 })).reverse();
  const maxPts = Math.max(...historyEntries.map(e => e.pts), 1);
  const posColor = pc(player.position);
  const tier = ti(player.tier);

  function TabBtn({ id, label, icon: Icon }) {
    const active = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
          fontWeight: 700, fontSize: 12,
          background: active ? posColor : "transparent",
          color: active ? "#fff" : C.textSec,
          transition: "all 0.15s",
        }}
      >
        <Icon size={13}/> {label}
      </button>
    );
  }

  return (
    <div
      onClick={onClose}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(6px)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{width:"100%",maxWidth:620,maxHeight:"88vh",overflowY:"auto",borderRadius:20,background:C.modalBg,border:"1px solid "+C.border,boxShadow:"0 24px 64px rgba(0,0,0,0.6)",display:"flex",flexDirection:"column"}}
      >

        {/* ── Header ── */}
        <div style={{padding:"20px 24px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexShrink:0}}>
          <div style={{display:"flex",gap:16,alignItems:"center"}}>
            <div style={{width:4,height:56,borderRadius:2,background:posColor,flexShrink:0}}/>
            <div>
              <h2 style={{margin:"0 0 6px",fontSize:26,fontWeight:900,color:C.textPri}}>{player.name}</h2>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{padding:"3px 10px",borderRadius:6,background:posColor,color:"#fff",fontWeight:800,fontSize:12}}>{player.position}</span>
                <span style={{fontSize:13,fontFamily:"monospace",color:C.textSec}}>{player.team}{player.number && player.number !== "0" && player.number !== 0 ? " #"+player.number : ""}</span>
                <span style={{fontSize:13,color:C.textSec}}>Age {player.age} · {player.yearsExp} YOE</span>
                <span style={{padding:"2px 8px",borderRadius:20,background:tier.bg,color:tier.col,fontWeight:700,fontSize:11}}>{tier.label}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,padding:4,color:C.textSec}}>×</button>
        </div>

        {/* ── Tab Bar ── */}
        <div style={{padding:"12px 20px",borderBottom:"1px solid "+C.border,display:"flex",gap:4,background:C.headerBg,flexShrink:0}}>
          <TabBtn id="overview" label="Overview"  icon={TrendingUp}/>
          <TabBtn id="history"  label="History"   icon={TrendingUp}/>
          <TabBtn id="news"     label="News"      icon={Newspaper}/>
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div style={{padding:24,display:"flex",flexDirection:"column",gap:16}}>

            {/* Stats grid */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {[
                {label:"Redraft Pts", value:player.redraftPoints.toFixed(1), color:"#34d399", sub:"Half PPR"},
                {label:"Dynasty Pts", value:player.dynastyPoints.toFixed(1),  color:"#818cf8", sub:"Half PPR"},
                {label:"Auction $",   value:"$"+player.auctionValue,          color:"#fbbf24", sub:"Redraft"},
                {label:"Dynasty $",   value:"$"+player.dynastyAuctionValue,   color:"#f472b6", sub:"Dynasty"},
                {label:"Tier",        value:tier.label,                        color:tier.bg,   sub:player.position+" rank"},
                {label:"Has Stats",   value:player.hasRealStats ? "Real" : "Est.", color:player.hasRealStats?"#34d399":"#94a3b8", sub:"data source"},
              ].map(item => (
                <div key={item.label} style={{borderRadius:12,padding:"12px 14px",border:"1px solid "+C.border,background:C.statBg}}>
                  <div style={{fontSize:10,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.06em",color:C.textSec,marginBottom:4}}>{item.label}</div>
                  <div style={{fontSize:20,fontWeight:900,color:item.color}}>{item.value}</div>
                  <div style={{fontSize:10,color:C.textSec,marginTop:2}}>{item.sub}</div>
                </div>
              ))}
            </div>

            {/* Quick history sparkline on overview */}
            {!loadingHistory && historyEntries.some(e => e.pts > 0) && (
              <div style={{borderRadius:12,padding:16,border:"1px solid "+C.border,background:C.statBg}}>
                <div style={{fontSize:11,fontFamily:"monospace",color:C.textSec,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>Recent Fantasy Points (Half PPR)</div>
                <div style={{display:"flex",alignItems:"flex-end",gap:6,height:60}}>
                  {historyEntries.map(({year, pts}) => (
                    <div key={year} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                      <div style={{fontSize:10,fontWeight:700,color:pts>0?posColor:C.dashCol}}>{pts>0?pts:"-"}</div>
                      <div style={{width:"100%",borderRadius:"4px 4px 0 0",background:pts>0?posColor:C.border,height:Math.max(4,(pts/maxPts)*44)+"px",transition:"height 0.3s",opacity:pts>0?1:0.3}}/>
                      <div style={{fontSize:10,fontFamily:"monospace",color:C.textSec}}>{String(year).slice(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {activeTab === "history" && (
          <div style={{padding:24}}>
            <div style={{fontSize:13,color:C.textSec,marginBottom:20}}>Season-by-season fantasy points (Half PPR scoring)</div>

            {loadingHistory ? (
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:40,color:C.textSec}}>
                <Loader size={18} style={{animation:"spin 1s linear infinite"}}/> Loading history...
              </div>
            ) : (
              <>
                {/* Tall bar chart */}
                <div style={{display:"flex",alignItems:"flex-end",gap:8,height:160,marginBottom:16}}>
                  {historyEntries.map(({year, pts}) => (
                    <div key={year} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                      <div style={{fontSize:12,fontWeight:800,color:pts>0?posColor:C.dashCol}}>{pts>0?pts:"-"}</div>
                      <div
                        style={{
                          width:"100%", borderRadius:"6px 6px 0 0",
                          background: pts > 0 ? `linear-gradient(180deg,${posColor},${posColor}88)` : C.border,
                          height: Math.max(4, (pts/maxPts)*130)+"px",
                          transition:"height 0.4s ease",
                          opacity: pts > 0 ? 1 : 0.3,
                          position:"relative",
                        }}
                      />
                      <div style={{fontSize:11,fontFamily:"monospace",color:C.textSec,fontWeight:700}}>{year}</div>
                    </div>
                  ))}
                </div>

                {/* Year-by-year table */}
                <div style={{borderRadius:12,border:"1px solid "+C.border,overflow:"hidden"}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"10px 16px",background:C.headerBg,fontSize:11,fontFamily:"monospace",color:C.textSec,textTransform:"uppercase",letterSpacing:"0.05em"}}>
                    <span>Season</span><span style={{textAlign:"center"}}>Half PPR</span><span style={{textAlign:"right"}}>vs Career</span>
                  </div>
                  {historyEntries.map(({year, pts}) => {
                    const careerAvg = historyEntries.filter(e=>e.pts>0).reduce((s,e)=>s+e.pts,0) / Math.max(1,historyEntries.filter(e=>e.pts>0).length);
                    const diff = pts > 0 ? pts - careerAvg : null;
                    return (
                      <div key={year} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"12px 16px",borderTop:"1px solid "+C.border,fontSize:13}}>
                        <span style={{fontWeight:700,color:C.textPri}}>{year}</span>
                        <span style={{textAlign:"center",fontWeight:900,color:pts>0?posColor:C.textSec}}>{pts>0?pts:"—"}</span>
                        <span style={{textAlign:"right",fontSize:12,fontWeight:700,color:diff===null?"transparent":diff>=0?"#34d399":"#ef4444"}}>
                          {diff !== null ? (diff>=0?"+":"")+diff.toFixed(1) : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {!historyEntries.some(e=>e.pts>0) && (
                  <div style={{textAlign:"center",padding:40,color:C.textSec,fontSize:13}}>No historical stats available for this player.</div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── NEWS TAB ── */}
        {activeTab === "news" && (
          <div style={{padding:24}}>
            {loadingNews ? (
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:40,color:C.textSec}}>
                <Loader size={18} style={{animation:"spin 1s linear infinite"}}/> Loading news...
              </div>
            ) : news.length === 0 ? (
              <div style={{textAlign:"center",padding:40}}>
                <AlertCircle size={32} color={C.textSec} style={{marginBottom:12}}/>
                <div style={{color:C.textSec,fontSize:13}}>No recent news found for {player.name}.</div>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {news.map((item, i) => {
                  const date = item.published ? new Date(item.published * 1000).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : null;
                  return (
                    <div key={i} style={{borderRadius:12,padding:16,border:"1px solid "+C.border,background:C.statBg}}>
                      {item.metadata?.injury_status && (
                        <span style={{display:"inline-block",marginBottom:8,padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,background:"rgba(239,68,68,0.15)",color:"#ef4444",border:"1px solid rgba(239,68,68,0.3)"}}>
                          ⚠️ {item.metadata.injury_status}
                        </span>
                      )}
                      {item.title && <div style={{fontWeight:700,fontSize:14,color:C.textPri,marginBottom:6}}>{item.title}</div>}
                      {item.analysis && <div style={{fontSize:13,color:C.textSec,lineHeight:1.6,marginBottom:8}}>{item.analysis}</div>}
                      {!item.analysis && item.body && <div style={{fontSize:13,color:C.textSec,lineHeight:1.6,marginBottom:8}}>{item.body}</div>}
                      {date && <div style={{fontSize:11,fontFamily:"monospace",color:C.dashCol}}>{date}</div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Actions ── */}
        <div style={{padding:"16px 24px",borderTop:"1px solid "+C.border,display:"flex",gap:10,flexShrink:0,background:C.headerBg}}>
          <button
            onClick={() => toggleFav(player.id)}
            style={{flex:1,padding:"12px",borderRadius:12,border:"none",cursor:"pointer",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:6,background:favorites.has(player.id)?"linear-gradient(135deg,#f59e0b,#d97706)":C.btnBgAlt,color:favorites.has(player.id)?"#fff":C.textSec}}
          >
            <Star size={16} fill={favorites.has(player.id)?"#fff":"none"}/>
            {favorites.has(player.id) ? "Remove Favorite" : "Add to Favorites"}
          </button>
          <button onClick={onClose} style={{padding:"12px 20px",borderRadius:12,border:"none",cursor:"pointer",fontWeight:700,background:C.btnBgAlt,color:C.textSec}}>Close</button>
        </div>
      </div>

      <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
    </div>
  );
}
