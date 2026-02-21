"use client";
import { useState, useEffect } from "react";
import { Star, TrendingUp, ShieldAlert, Loader, User } from "lucide-react";
import { pc, ti } from "@/constants/theme";
import { calcIdpPoints, IDP_POSITIONS } from "@/utils/players";

const CURRENT_YEAR = new Date().getFullYear();
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

export default function PlayerModal({ C, player, favorites, toggleFav, onClose }) {
  // Store full raw stats object per year so we can re-score on toggle without re-fetching
  const [rawHistory, setRawHistory]         = useState({});
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab]           = useState("overview");
  const [historyScoring, setHistoryScoring] = useState("pts_half_ppr");

  // All hooks first — early return after
  useEffect(() => {
    if (!player) return;
    setRawHistory({});
    setActiveTab("overview");
    setHistoryScoring("pts_half_ppr");
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
                  {historyEntries.map(({year,pts}) => (
                    <div key={year} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                      <div style={{fontSize:12,fontWeight:800,color:pts>0?posColor:C.dashCol}}>{pts>0?pts:"-"}</div>
                      <div style={{width:"100%",borderRadius:"6px 6px 0 0",background:pts>0?`linear-gradient(180deg,${posColor},${posColor}88)`:C.border,height:Math.max(4,(pts/maxPts)*130)+"px",opacity:pts>0?1:0.3,transition:"height 0.3s ease"}}/>
                      <div style={{fontSize:11,fontFamily:"monospace",color:C.textSec,fontWeight:700}}>{year}</div>
                    </div>
                  ))}
                </div>

                {/* Points table */}
                <div style={{borderRadius:12,border:"1px solid "+C.border,overflow:"hidden"}}>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"10px 16px",background:C.headerBg,fontSize:11,fontFamily:"monospace",color:C.textSec,textTransform:"uppercase",letterSpacing:"0.05em"}}>
                    <span>Season</span>
                    <span style={{textAlign:"center"}}>{scoringLabel}</span>
                    <span style={{textAlign:"right"}}>vs Avg</span>
                  </div>
                  {historyEntries.map(({year, pts}) => {
                    const valid = historyEntries.filter(e => e.pts > 0);
                    const avg   = valid.reduce((s,e) => s+e.pts, 0) / Math.max(1, valid.length);
                    const diff  = pts > 0 ? pts - avg : null;
                    return (
                      <div key={year} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",padding:"12px 16px",borderTop:"1px solid "+C.border,fontSize:13}}>
                        <span style={{fontWeight:700,color:C.textPri}}>{year}</span>
                        <span style={{textAlign:"center",fontWeight:900,color:pts>0?posColor:C.textSec}}>{pts>0?pts:"—"}</span>
                        <span style={{textAlign:"right",fontSize:12,fontWeight:700,color:diff===null?"transparent":diff>=0?"#34d399":"#ef4444"}}>
                          {diff!==null?(diff>=0?"+":"")+diff.toFixed(1):"—"}
                        </span>
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
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
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
