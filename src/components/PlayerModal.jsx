"use client";
import { useState, useEffect } from "react";
import { Star, TrendingUp, ShieldAlert, Loader, User, ChevronDown, ChevronRight } from "lucide-react";
import { pc, ti } from "@/constants/theme";
import { calcIdpPoints, IDP_POSITIONS, capSalaryValue, capSalaryValueDynasty } from "@/utils/players";

const CURRENT_YEAR = new Date().getFullYear();

// Module-level caches: persist across modal opens for the whole browser session
const yearDataCache    = {}; // year -> { players, schedule } from static JSON
const weeklyStatsCache = {}; // fallback: "playerId_year" -> week array (live Sleeper API)
const STATS_YEARS = [
  CURRENT_YEAR - 1,
  CURRENT_YEAR - 2,
  CURRENT_YEAR - 3,
  CURRENT_YEAR - 4,
  CURRENT_YEAR - 5,
];

const INJURY_COLORS = {
  "Out":         { bg:"rgba(239,68,68,0.15)",  border:"rgba(239,68,68,0.4)",  text:"#ef4444", label:"OUT" },
  "IR":          { bg:"rgba(239,68,68,0.15)",  border:"rgba(239,68,68,0.4)",  text:"#ef4444", label:"IR" },
  "Doubtful":    { bg:"rgba(249,115,22,0.15)", border:"rgba(249,115,22,0.4)", text:"#f97316", label:"DOUBTFUL" },
  "Questionable":{ bg:"rgba(245,158,11,0.15)", border:"rgba(245,158,11,0.4)", text:"#fbbf24", label:"QUESTIONABLE" },
  "Probable":    { bg:"rgba(16,185,129,0.15)", border:"rgba(16,185,129,0.4)", text:"#34d399", label:"PROBABLE" },
};

const SCORING_OPTIONS = [
  { key:"pts_half_ppr", label:"Half PPR" },
  { key:"pts_ppr",      label:"PPR" },
  { key:"pts_std",      label:"Standard" },
];

export default function PlayerModal({ C, player, favorites, toggleFav, onClose, capCeiling = 50_000_000 }) {
  // Store full raw stats object per year so we can re-score on toggle without re-fetching
  const [rawHistory, setRawHistory]         = useState({});
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab]           = useState("overview");
  const [historyScoring, setHistoryScoring] = useState("pts_half_ppr");
  const [expandedYear, setExpandedYear]     = useState(null);
  const [weeklyData, setWeeklyData]         = useState({});
  const [scheduleData, setScheduleData]     = useState({});
  const [loadingWeekly, setLoadingWeekly]   = useState(null);

  // All hooks first — early return after
  useEffect(() => {
    if (!player) return;
    setRawHistory({});
    setActiveTab("overview");
    setHistoryScoring("pts_half_ppr");
    setExpandedYear(null);
    setWeeklyData({});
    setScheduleData({});
    setLoadingWeekly(null);
    fetchHistory();
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
          const s = data[player.id];
          // Store the full raw stats object — IDP and offense both need it
          if (s) results[year] = s;
        } catch { /* year unavailable */ }
      })
    );
    setRawHistory(results);
    setLoadingHistory(false);
  }

  async function fetchWeeklyStats(year) {
    if (expandedYear === year) { setExpandedYear(null); return; }
    setExpandedYear(year);
    if (weeklyData[year]) return;
    setLoadingWeekly(year);

    // ── Primary: load from pre-built static JSON (zero Sleeper API calls) ──
    if (!yearDataCache[year]) {
      try {
        const res = await fetch(`/data/weeklyStats_${year}.json`);
        if (res.ok) yearDataCache[year] = await res.json();
      } catch { /* file not generated yet, fall through to live API */ }
    }
    if (yearDataCache[year]) {
      const yearData    = yearDataCache[year];
      const playerWeeks = yearData.players?.[player.id] || [];
      setWeeklyData(prev  => ({ ...prev, [year]: playerWeeks }));
      setScheduleData(prev => ({ ...prev, [year]: yearData.schedule || {} }));
      setLoadingWeekly(null);
      return;
    }

    // ── Fallback: fetch live from Sleeper (used if JSON not generated yet) ──
    const cacheKey = `${player.id}_${year}`;
    if (weeklyStatsCache[cacheKey]) {
      setWeeklyData(prev => ({ ...prev, [year]: weeklyStatsCache[cacheKey] }));
      setLoadingWeekly(null);
      return;
    }
    const results = [];
    await Promise.all(
      Array.from({ length: 18 }, (_, i) => i + 1).map(async (week) => {
        try {
          const res = await fetch(`https://api.sleeper.app/v1/stats/nfl/regular/${year}/${week}`);
          if (!res.ok) return;
          const data = await res.json();
          const s = data[player.id];
          if (s && Object.keys(s).length > 0) results.push({ week, stats: s });
        } catch { /* unavailable */ }
      })
    );
    results.sort((a, b) => a.week - b.week);
    weeklyStatsCache[cacheKey] = results;
    setWeeklyData(prev => ({ ...prev, [year]: results }));
    setLoadingWeekly(null);
  }

  // Early return AFTER all hooks
  if (!player || !C) return null;

  const isIdp    = IDP_POSITIONS.includes(player.position);
  const posColor = pc(player.position);
  const tier     = ti(player.tier);
  const injStyle = player.injuryStatus
    ? (INJURY_COLORS[player.injuryStatus] || INJURY_COLORS["Questionable"])
    : null;

  /**
   * Get display points for a year's raw stats.
   * IDP: always calcIdpPoints() — pts_ppr/etc are always 0 for defensive players.
   * Offense: use the selected scoring key with fallback chain.
   */
  function getDisplayPts(rawStats, scoringKey) {
    if (!rawStats) return 0;
    if (isIdp) return calcIdpPoints(rawStats);
    const pts = rawStats[scoringKey]
      || rawStats["pts_half_ppr"]
      || rawStats["pts_ppr"]
      || rawStats["pts_std"]
      || 0;
    return Math.round(pts * 10) / 10;
  }

  const historyEntries = STATS_YEARS.map(y => ({
    year: y,
    pts: getDisplayPts(rawHistory[y], historyScoring),
  })).reverse();

  // Sparkline always shows half PPR (or IDP)
  const sparkEntries = STATS_YEARS.map(y => ({
    year: y,
    pts: getDisplayPts(rawHistory[y], "pts_half_ppr"),
  })).reverse();

  const maxPts   = Math.max(...historyEntries.map(e => e.pts), 1);
  const sparkMax = Math.max(...sparkEntries.map(e => e.pts), 1);

  const scoringLabel = isIdp
    ? "IDP Pts"
    : (SCORING_OPTIONS.find(s => s.key === historyScoring)?.label || "Half PPR");

  const GAME_COLS = {
    QB: [{ key:"pass_yd",label:"Pass Yds"},{key:"pass_td",label:"Pass TD"},{key:"pass_int",label:"INT"},{key:"rush_yd",label:"Rush Yds"},{key:"rush_td",label:"Rush TD"}],
    RB: [{ key:"rush_yd",label:"Rush Yds"},{key:"rush_td",label:"Rush TD"},{key:"rec",label:"Rec"},{key:"rec_yd",label:"Rec Yds"},{key:"rec_td",label:"Rec TD"}],
    WR: [{ key:"rec_tgt",label:"Tgts"},{key:"rec",label:"Rec"},{key:"rec_yd",label:"Rec Yds"},{key:"rec_td",label:"Rec TD"},{key:"rush_yd",label:"Rush Yds"}],
    TE: [{ key:"rec_tgt",label:"Tgts"},{key:"rec",label:"Rec"},{key:"rec_yd",label:"Rec Yds"},{key:"rec_td",label:"Rec TD"}],
    K:  [{ key:"fgm",label:"FGM"},{key:"fga",label:"FGA"},{key:"xpm",label:"XPM"}],
    DL: [{ key:"idp_tkl",label:"Tkl"},{key:"idp_sack",label:"Sack"},{key:"idp_qb_hit",label:"QB Hit"},{key:"idp_int",label:"INT"},{key:"idp_pd",label:"PD"}],
    LB: [{ key:"idp_tkl",label:"Tkl"},{key:"idp_tkl_ast",label:"Ast"},{key:"idp_sack",label:"Sack"},{key:"idp_int",label:"INT"},{key:"idp_pd",label:"PD"},{key:"idp_ff",label:"FF"}],
    DB: [{ key:"idp_tkl",label:"Tkl"},{key:"idp_tkl_ast",label:"Ast"},{key:"idp_int",label:"INT"},{key:"idp_pd",label:"PD"},{key:"idp_ff",label:"FF"}],
  };
  const gameCols = GAME_COLS[player.position] || GAME_COLS.WR;

  // IDP breakdown for overview — use most recent year with data
  const latestIdpYear = STATS_YEARS.find(y => rawHistory[y] && calcIdpPoints(rawHistory[y]) > 0);
  const latestRaw     = latestIdpYear ? rawHistory[latestIdpYear] : null;
  const idpBreakdown  = isIdp && latestRaw ? [
    { label:"Tackles",  value: ((latestRaw.idp_tkl || 0) + (latestRaw.idp_tkl_ast || 0)).toFixed(0) },
    { label:"Sacks",    value: (latestRaw.idp_sack    || 0).toFixed(1) },
    { label:"INT",      value: (latestRaw.idp_int     || 0).toFixed(0) },
    { label:"PD",       value: (latestRaw.idp_pd      || 0).toFixed(0) },
    { label:"FF",       value: (latestRaw.idp_ff      || 0).toFixed(0) },
    { label:"FR",       value: (latestRaw.idp_fum_rec || 0).toFixed(0) },
  ] : [];

  function TabBtn({ id, label, icon: Icon }) {
    const active = activeTab === id;
    return (
      <button onClick={() => setActiveTab(id)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,background:active?posColor:"transparent",color:active?"#fff":C.textSec,transition:"all 0.15s"}}>
        <Icon size={13}/>{label}
      </button>
    );
  }

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(6px)",zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div onClick={e => e.stopPropagation()} style={{width:"100%",maxWidth:620,maxHeight:"88vh",overflowY:"auto",borderRadius:20,background:C.modalBg,border:"1px solid "+C.border,boxShadow:"0 24px 64px rgba(0,0,0,0.6)",display:"flex",flexDirection:"column"}}>

        {/* Header */}
        <div style={{padding:"20px 24px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexShrink:0}}>
          <div style={{display:"flex",gap:16,alignItems:"center"}}>
            <div style={{width:4,height:56,borderRadius:2,background:posColor,flexShrink:0}}/>
            <div>
              <h2 style={{margin:"0 0 6px",fontSize:26,fontWeight:900,color:C.textPri}}>{player.name}</h2>
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                <span style={{padding:"3px 10px",borderRadius:6,background:posColor,color:"#fff",fontWeight:800,fontSize:12}}>{player.position}</span>
                <span style={{fontSize:13,fontFamily:"monospace",color:C.textSec}}>
                  {player.team}{player.number && player.number !== "0" && player.number !== 0 ? " #"+player.number : ""}
                </span>
                <span style={{fontSize:13,color:C.textSec}}>Age {player.age} · {player.yearsExp} YOE</span>
                <span style={{padding:"2px 8px",borderRadius:20,background:tier.bg,color:tier.col,fontWeight:700,fontSize:11}}>{tier.label}</span>
                {isIdp && (
                  <span style={{padding:"2px 8px",borderRadius:20,background:"rgba(6,182,212,0.15)",border:"1px solid rgba(6,182,212,0.3)",color:"#06b6d4",fontWeight:700,fontSize:11}}>IDP</span>
                )}
                {injStyle && (
                  <span style={{padding:"2px 10px",borderRadius:20,background:injStyle.bg,border:"1px solid "+injStyle.border,color:injStyle.text,fontWeight:800,fontSize:11}}>⚠️ {injStyle.label}</span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,padding:4,color:C.textSec}}>×</button>
        </div>

        {/* Tabs */}
        <div style={{padding:"12px 20px",borderBottom:"1px solid "+C.border,display:"flex",gap:4,background:C.headerBg,flexShrink:0}}>
          <TabBtn id="overview" label="Overview" icon={TrendingUp}/>
          <TabBtn id="history"  label="History"  icon={TrendingUp}/>
          <TabBtn id="status"   label="Status"   icon={ShieldAlert}/>
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div style={{padding:24,display:"flex",flexDirection:"column",gap:16}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {[
                { label: isIdp ? "IDP Pts"     : "Redraft Pts", value: player.redraftPoints.toFixed(1), color:"#34d399", sub: isIdp ? "Std IDP" : "Half PPR" },
                { label: isIdp ? "Dyn IDP Pts" : "Dynasty Pts", value: player.dynastyPoints.toFixed(1), color:"#818cf8", sub: isIdp ? "Age adj." : "Half PPR" },
                { label:"Auction $",  value:"$"+player.auctionValue,        color:"#fbbf24", sub:"Redraft" },
                { label:"Dynasty $",  value:"$"+player.dynastyAuctionValue, color:"#f472b6", sub:"Dynasty" },
                { label:"Tier",       value:tier.label,                      color:tier.bg,   sub:player.position+" rank" },
                { label:"Data",       value:player.hasRealStats?"Real":"Est.", color:player.hasRealStats?"#34d399":"#94a3b8", sub:"source" },
              ].map(item => (
                <div key={item.label} style={{borderRadius:12,padding:"12px 14px",border:"1px solid "+C.border,background:C.statBg}}>
                  <div style={{fontSize:10,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.06em",color:C.textSec,marginBottom:4}}>{item.label}</div>
                  <div style={{fontSize:20,fontWeight:900,color:item.color}}>{item.value}</div>
                  <div style={{fontSize:10,color:C.textSec,marginTop:2}}>{item.sub}</div>
                </div>
              ))}
            </div>

            {/* Cap Salary Recommendation */}
            {(() => {
              const redraftCap = capSalaryValue(player.redraftPoints, player.position, capCeiling);
              const dynastyCap = capSalaryValueDynasty(player.dynastyPoints, player.position, capCeiling);
              const redraftPct = Math.min(100, (redraftCap / capCeiling) * 100);
              const dynastyPct = Math.min(100, (dynastyCap / capCeiling) * 100);
              const fmt = n => n >= 1_000_000 ? "$" + (n/1_000_000).toFixed(1).replace(/\.0$/,"") + "M" : "$" + Math.round(n/1000) + "K";
              const barColor = pct => pct > 25 ? "#ef4444" : pct > 15 ? "#f59e0b" : "#10b981";
              return (
                <div style={{borderRadius:12,padding:16,border:"1px solid rgba(245,158,11,0.25)",background:"rgba(245,158,11,0.05)"}}>
                  <div style={{fontSize:11,fontFamily:"monospace",color:"#fbbf24",marginBottom:14,textTransform:"uppercase",letterSpacing:"0.05em"}}>
                    💰 Cap Salary Recommendation · {fmt(capCeiling)} cap
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    {[
                      { label:"Redraft Value", val:redraftCap, pct:redraftPct, color:"#34d399" },
                      { label:"Dynasty Value", val:dynastyCap, pct:dynastyPct, color:"#818cf8" },
                    ].map(({label, val, pct, color}) => (
                      <div key={label}>
                        <div style={{fontSize:10,fontFamily:"monospace",color:C.textSec,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.05em"}}>{label}</div>
                        <div style={{fontWeight:900,fontSize:22,color}}>{fmt(val)}</div>
                        <div style={{margin:"8px 0 4px",height:5,borderRadius:3,background:C.trackBg,overflow:"hidden"}}>
                          <div style={{height:"100%",width:pct+"%",borderRadius:3,background:barColor(pct),transition:"width 0.4s ease"}}/>
                        </div>
                        <div style={{fontSize:10,fontFamily:"monospace",color:C.textSec}}>{pct.toFixed(1)}% of cap</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* IDP defensive stat breakdown */}
            {isIdp && idpBreakdown.length > 0 && (
              <div style={{borderRadius:12,padding:16,border:"1px solid "+C.border,background:C.statBg}}>
                <div style={{fontSize:11,fontFamily:"monospace",color:C.textSec,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>
                  {latestIdpYear} Defensive Stats
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8}}>
                  {idpBreakdown.map(({label, value}) => (
                    <div key={label} style={{textAlign:"center"}}>
                      <div style={{fontSize:20,fontWeight:900,color:posColor}}>{value}</div>
                      <div style={{fontSize:10,fontFamily:"monospace",color:C.textSec,marginTop:2}}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sparkline */}
            {!loadingHistory && sparkEntries.some(e => e.pts > 0) && (
              <div style={{borderRadius:12,padding:16,border:"1px solid "+C.border,background:C.statBg}}>
                <div style={{fontSize:11,fontFamily:"monospace",color:C.textSec,marginBottom:12,textTransform:"uppercase",letterSpacing:"0.05em"}}>
                  Recent Points ({isIdp ? "IDP Scoring" : "Half PPR"})
                </div>
                <div style={{display:"flex",alignItems:"flex-end",gap:6,height:60}}>
                  {sparkEntries.map(({year,pts}) => (
                    <div key={year} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                      <div style={{fontSize:10,fontWeight:700,color:pts>0?posColor:C.dashCol}}>{pts>0?pts:"-"}</div>
                      <div style={{width:"100%",borderRadius:"4px 4px 0 0",background:pts>0?posColor:C.border,height:Math.max(4,(pts/sparkMax)*44)+"px",opacity:pts>0?1:0.3}}/>
                      <div style={{fontSize:10,fontFamily:"monospace",color:C.textSec}}>{String(year).slice(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY ── */}
        {activeTab === "history" && (
          <div style={{padding:24}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:13,color:C.textSec}}>
                Season-by-season {isIdp ? "IDP" : "fantasy"} points
              </div>
              {/* Scoring toggle — hidden for IDP since pts don't vary by PPR/std */}
              {!isIdp ? (
                <div style={{display:"inline-flex",background:C.inputBg,border:"1px solid "+C.border,borderRadius:10,padding:3,gap:2}}>
                  {SCORING_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setHistoryScoring(opt.key)}
                      style={{padding:"5px 10px",borderRadius:7,border:"none",cursor:"pointer",fontWeight:700,fontSize:11,background:historyScoring===opt.key?posColor:"transparent",color:historyScoring===opt.key?"#fff":C.textSec,transition:"all 0.15s"}}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <span style={{padding:"5px 12px",borderRadius:8,background:"rgba(6,182,212,0.1)",border:"1px solid rgba(6,182,212,0.2)",fontSize:11,fontWeight:700,color:"#06b6d4"}}>
                  IDP Scoring
                </span>
              )}
            </div>

            {loadingHistory ? (
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:40,color:C.textSec}}>
                <Loader size={18} style={{animation:"spin 1s linear infinite"}}/> Loading history...
              </div>
            ) : (
              <>
                {/* Bar chart */}
                <div style={{display:"flex",alignItems:"flex-end",gap:8,height:160,marginBottom:16}}>
                  {historyEntries.map(({year,pts}) => {
                    const isSelected = expandedYear === year;
                    return (
                      <div key={year} onClick={() => pts > 0 && fetchWeeklyStats(year)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:pts>0?"pointer":"default"}}>
                        <div style={{fontSize:12,fontWeight:800,color:pts>0?posColor:C.dashCol}}>{pts>0?pts:"-"}</div>
                        <div style={{width:"100%",borderRadius:"6px 6px 0 0",background:pts>0?`linear-gradient(180deg,${posColor},${posColor}88)`:C.border,height:Math.max(4,(pts/maxPts)*130)+"px",opacity:pts>0?(isSelected?1:0.65):0.3,outline:isSelected?`2px solid ${posColor}`:"none",transition:"height 0.3s ease, opacity 0.15s ease"}}/>
                        <div style={{fontSize:11,fontFamily:"monospace",color:isSelected?posColor:C.textSec,fontWeight:700}}>{year}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Points table */}
                <div style={{borderRadius:12,border:"1px solid "+C.border,overflow:"hidden"}}>
                  <div style={{display:"grid",gridTemplateColumns:"1.2fr 1fr 1fr 28px",padding:"10px 16px",background:C.headerBg,fontSize:11,fontFamily:"monospace",color:C.textSec,textTransform:"uppercase",letterSpacing:"0.05em"}}>
                    <span>Season</span>
                    <span style={{textAlign:"center"}}>{scoringLabel}</span>
                    <span style={{textAlign:"right"}}>vs Avg</span>
                    <span/>
                  </div>
                  {historyEntries.map(({year, pts}) => {
                    const valid = historyEntries.filter(e => e.pts > 0);
                    const avg   = valid.reduce((s,e) => s+e.pts, 0) / Math.max(1, valid.length);
                    const diff  = pts > 0 ? pts - avg : null;
                    const isOpen = expandedYear === year;
                    const weeks  = weeklyData[year] || [];
                    return (
                      <div key={year}>
                        {/* Season row */}
                        <div
                          onClick={() => pts > 0 && fetchWeeklyStats(year)}
                          style={{display:"grid",gridTemplateColumns:"1.2fr 1fr 1fr 28px",padding:"12px 16px",borderTop:"1px solid "+C.border,fontSize:13,cursor:pts>0?"pointer":"default",background:isOpen?"rgba(255,255,255,0.03)":"transparent",transition:"background 0.15s"}}
                        >
                          <span style={{fontWeight:700,color:isOpen?posColor:C.textPri,display:"flex",alignItems:"center",gap:6}}>
                            {year}
                          </span>
                          <span style={{textAlign:"center",fontWeight:900,color:pts>0?posColor:C.textSec}}>{pts>0?pts:"—"}</span>
                          <span style={{textAlign:"right",fontSize:12,fontWeight:700,color:diff===null?"transparent":diff>=0?"#34d399":"#ef4444"}}>
                            {diff!==null?(diff>=0?"+":"")+diff.toFixed(1):"—"}
                          </span>
                          <span style={{display:"flex",alignItems:"center",justifyContent:"center",color:C.textSec}}>
                            {pts > 0 && (isOpen ? <ChevronDown size={14}/> : <ChevronRight size={14}/>)}
                          </span>
                        </div>

                        {/* Game log */}
                        {isOpen && (
                          <div style={{borderTop:"1px solid "+C.border,background:C.statBg,padding:"12px 16px"}}>
                            {loadingWeekly === year ? (
                              <div style={{display:"flex",alignItems:"center",gap:8,color:C.textSec,fontSize:12,padding:"8px 0"}}>
                                <Loader size={14} style={{animation:"spin 1s linear infinite"}}/> Loading game log...
                              </div>
                            ) : weeks.length === 0 ? (
                              <div style={{fontSize:12,color:C.textSec,padding:"4px 0"}}>No weekly data available.</div>
                            ) : (
                              <div style={{overflowX:"auto"}}>
                                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                                  <thead>
                                    <tr style={{color:C.textSec,fontFamily:"monospace",fontSize:10,textTransform:"uppercase",letterSpacing:"0.05em"}}>
                                      <td style={{paddingBottom:8,paddingRight:12,whiteSpace:"nowrap"}}>Wk</td>
                                      <td style={{paddingBottom:8,paddingRight:12,whiteSpace:"nowrap"}}>Opp</td>
                                      <td style={{paddingBottom:8,paddingRight:12,textAlign:"right",whiteSpace:"nowrap",color:posColor}}>Pts</td>
                                      {gameCols.map(c => (
                                        <td key={c.key} style={{paddingBottom:8,paddingRight:12,textAlign:"right",whiteSpace:"nowrap"}}>{c.label}</td>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {weeks.map(({week, stats}) => {
                                      const wpts = getDisplayPts(stats, historyScoring);
                                      const opp  = scheduleData[expandedYear]?.[String(week)]?.[player.team] || null;
                                      return (
                                        <tr key={week} style={{borderTop:"1px solid "+C.border}}>
                                          <td style={{padding:"7px 12px 7px 0",fontWeight:700,color:C.textSec,fontFamily:"monospace"}}>{week}</td>
                                          <td style={{padding:"7px 12px 7px 0"}}>
                                            {opp ? (
                                              <img
                                                src={`https://sleepercdn.com/images/team_logos/nfl/${opp}.jpg`}
                                                alt={opp}
                                                title={opp}
                                                width={22}
                                                height={22}
                                                style={{display:"block",objectFit:"contain",borderRadius:3}}
                                                onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="inline"; }}
                                              />
                                            ) : null}
                                            <span style={{display:"none",fontSize:10,fontFamily:"monospace",color:C.textSec}}>{opp || "—"}</span>
                                          </td>
                                          <td style={{padding:"7px 12px 7px 0",textAlign:"right",fontWeight:900,color:posColor}}>{wpts > 0 ? wpts : "—"}</td>
                                          {gameCols.map(c => {
                                            const val = stats[c.key];
                                            return (
                                              <td key={c.key} style={{padding:"7px 12px 7px 0",textAlign:"right",color:val>0?C.textPri:C.textSec}}>
                                                {val != null && val > 0 ? (Number.isInteger(val) ? val : val.toFixed(1)) : "—"}
                                              </td>
                                            );
                                          })}
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* IDP raw stat breakdown for most recent year with data */}
                {isIdp && latestRaw && (
                  <div style={{marginTop:16,borderRadius:12,border:"1px solid "+C.border,overflow:"hidden"}}>
                    <div style={{padding:"10px 16px",background:C.headerBg,fontSize:11,fontFamily:"monospace",color:C.textSec,textTransform:"uppercase",letterSpacing:"0.05em"}}>
                      {latestIdpYear} Raw Defensive Stats
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr"}}>
                      {[
                        { label:"Solo Tackles", value: latestRaw.idp_tkl || 0 },
                        { label:"Ast Tackles",  value: latestRaw.idp_tkl_ast || 0 },
                        { label:"TFL",          value: latestRaw.idp_tkl_loss || 0 },
                        { label:"Sacks",        value: (latestRaw.idp_sack || 0).toFixed(1) },
                        { label:"QB Hits",      value: latestRaw.idp_qb_hit || 0 },
                        { label:"INT",          value: latestRaw.idp_int || 0 },
                        { label:"Pass Def",     value: latestRaw.idp_pd || 0 },
                        { label:"Forced Fum",   value: latestRaw.idp_ff || 0 },
                        { label:"Fum Rec",      value: latestRaw.idp_fum_rec || 0 },
                      ].map(({label, value}) => (
                        <div key={label} style={{padding:"12px 16px",borderTop:"1px solid "+C.border,borderRight:"1px solid "+C.border}}>
                          <div style={{fontSize:10,fontFamily:"monospace",color:C.textSec,marginBottom:4}}>{label}</div>
                          <div style={{fontSize:18,fontWeight:900,color:posColor}}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!historyEntries.some(e => e.pts > 0) && (
                  <div style={{textAlign:"center",padding:40,color:C.textSec,fontSize:13}}>No historical stats available.</div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── STATUS ── */}
        {activeTab === "status" && (
          <div style={{padding:24,display:"flex",flexDirection:"column",gap:12}}>
            {injStyle ? (
              <div style={{padding:16,borderRadius:12,background:injStyle.bg,border:"1px solid "+injStyle.border}}>
                <div style={{fontSize:11,fontFamily:"monospace",color:injStyle.text,marginBottom:6,letterSpacing:"0.05em"}}>INJURY STATUS</div>
                <div style={{fontSize:22,fontWeight:900,color:injStyle.text,marginBottom:4}}>⚠️ {player.injuryStatus}</div>
                {player.injuryBodyPart && <div style={{fontSize:13,color:injStyle.text,opacity:0.85}}>Body part: {player.injuryBodyPart}</div>}
                {player.injuryNotes    && <div style={{fontSize:13,color:injStyle.text,opacity:0.85,marginTop:4}}>{player.injuryNotes}</div>}
              </div>
            ) : (
              <div style={{padding:16,borderRadius:12,background:"rgba(16,185,129,0.1)",border:"1px solid rgba(16,185,129,0.3)"}}>
                <div style={{fontSize:11,fontFamily:"monospace",color:"#34d399",marginBottom:4,letterSpacing:"0.05em"}}>INJURY STATUS</div>
                <div style={{fontSize:18,fontWeight:900,color:"#34d399"}}>✓ Healthy</div>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              <div style={{padding:14,borderRadius:12,border:"1px solid "+C.border,background:C.statBg}}>
                <div style={{fontSize:10,fontFamily:"monospace",color:C.textSec,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Roster Status</div>
                <div style={{fontSize:16,fontWeight:800,color:C.textPri}}>{player.status || "Active"}</div>
              </div>
              <div style={{padding:14,borderRadius:12,border:"1px solid "+C.border,background:C.statBg}}>
                <div style={{fontSize:10,fontFamily:"monospace",color:C.textSec,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Depth Chart</div>
                <div style={{fontSize:16,fontWeight:800,color:C.textPri}}>
                  {player.depthChartOrder ? `#${player.depthChartOrder} ${player.depthChartPosition||player.position}` : "—"}
                </div>
              </div>
              <div style={{padding:14,borderRadius:12,border:"1px solid "+C.border,background:C.statBg}}>
                <div style={{fontSize:10,fontFamily:"monospace",color:C.textSec,textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Bye Week</div>
                <div style={{fontSize:16,fontWeight:800,color:C.textPri}}>
                  {player.byeWeek != null ? `Week ${player.byeWeek}` : "—"}
                </div>
              </div>
            </div>
            <div style={{borderRadius:12,border:"1px solid "+C.border,background:C.statBg,overflow:"hidden"}}>
              <div style={{padding:"10px 16px",background:C.headerBg,fontSize:11,fontFamily:"monospace",color:C.textSec,textTransform:"uppercase",letterSpacing:"0.05em",display:"flex",alignItems:"center",gap:6}}>
                <User size={12}/> Player Info
              </div>
              {[
                { label:"College",    value: player.college || "—" },
                { label:"Height",     value: player.height ? `${Math.floor(player.height/12)}'${player.height%12}"` : "—" },
                { label:"Weight",     value: player.weight ? `${player.weight} lbs` : "—" },
                { label:"Age",        value: player.age ? `${player.age} yrs` : "—" },
                { label:"Experience", value: `${player.yearsExp} year${player.yearsExp!==1?"s":""}` },
                ...(player.projectedPts != null ? [{ label:"Projected Pts", value: `${player.projectedPts.toFixed(0)} pts (halfPPR)` }] : []),
              ].map(({label, value}) => (
                <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 16px",borderTop:"1px solid "+C.border}}>
                  <span style={{fontSize:12,color:C.textSec,fontFamily:"monospace"}}>{label}</span>
                  <span style={{fontSize:13,fontWeight:700,color:C.textPri}}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
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
