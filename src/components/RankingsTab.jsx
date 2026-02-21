"use client";
import { Search, Star, Zap, Clock, Download, Users } from "lucide-react";
import { pc, ti } from "@/constants/theme";
import { tabBtn, posBtn } from "@/utils/styleHelpers";
import useWindowSize from "@/hooks/useWindowSize";
import { capSalaryValue, capSalaryValueDynasty } from "@/utils/players";

const POSITIONS = ["ALL","QB","RB","WR","TE","K","DEF","DL","LB","DB"];

// Format a cap salary value into a readable string e.g. $14.5M, $750K
function fmtCap(n) {
  if (!n && n !== 0) return "$0";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return "$" + Math.round(n / 1_000) + "K";
  return "$" + n;
}

export default function RankingsTab({
  C, players, rankType, setRankType,
  selPos, setSelPos, search, setSearch,
  showFavs, setShowFavs, favorites, toggleFav,
  setSelPlayer, budget, capCeiling = 50_000_000, numTeams = 12,
}) {
  const { isMobile } = useWindowSize();

  const filtered = players
    .filter(p => selPos === "ALL" || p.position === selPos)
    .filter(p => !showFavs || favorites.has(p.id))
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.team.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => rankType === "dynasty" ? b.dynastyPoints - a.dynastyPoints : b.redraftPoints - a.redraftPoints)
    .slice(0, 150);

  function exportCSV() {
    const rows = [["Rank","Player","Pos","Team","Age","Exp","Points","Tier","Cap Value","Cap %"]];
    filtered.forEach((p,i) => {
      const pts = rankType === "dynasty" ? p.dynastyPoints : p.redraftPoints;
      const capVal = rankType === "dynasty"
        ? capSalaryValueDynasty(pts, p.position, capCeiling)
        : capSalaryValue(pts, p.position, capCeiling, numTeams);
      const capPct = ((capVal / capCeiling) * 100).toFixed(1);
      rows.push([i+1, p.name, p.position, p.team, p.age, p.yearsExp, pts.toFixed(1), ti(p.tier).label, fmtCap(capVal), capPct + "%"]);
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.map(r => r.join(",")).join("\n")], {type:"text/csv"}));
    a.download = "rankings.csv";
    a.click();
  }

  // Desktop: show cap value column after Pts, before old $ Value
  // Mobile: hidden (too cramped)
  const cols = isMobile ? "40px 1fr 70px 80px" : "40px 1fr 70px 60px 80px 100px 110px 70px";

  return (
    <div>
      {/* Redraft / Dynasty toggle */}
      <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
        <div style={{display:"inline-flex",background:C.cardBg,border:"1px solid "+C.border,borderRadius:14,padding:4}}>
          <button onClick={() => setRankType("redraft")} style={tabBtn(rankType==="redraft","linear-gradient(135deg,#6366f1,#8b5cf6)",C)}>
            <Zap size={14}/> REDRAFT
          </button>
          <button onClick={() => setRankType("dynasty")} style={tabBtn(rankType==="dynasty","linear-gradient(135deg,#6366f1,#8b5cf6)",C)}>
            <Clock size={14}/> DYNASTY
          </button>
        </div>
      </div>

      {/* Search + favorites */}
      <div style={{display:"flex",gap:8,maxWidth:600,margin:"0 auto 16px",width:"100%"}}>
        <div style={{position:"relative",flex:1}}>
          <Search size={16} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.textSec}}/>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search players or teams..."
            style={{width:"100%",paddingLeft:40,paddingRight:12,paddingTop:10,paddingBottom:10,borderRadius:12,border:"1px solid "+C.border,background:C.inputBg,color:C.textPri,outline:"none",fontSize:14,boxSizing:"border-box"}}
          />
        </div>
        <button
          onClick={() => setShowFavs(!showFavs)}
          style={{padding:"10px 18px",borderRadius:12,border:showFavs?"none":"1px solid "+C.border,cursor:"pointer",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:6,background:showFavs?"linear-gradient(135deg,#f59e0b,#d97706)":C.btnBg,color:showFavs?"#fff":C.textSec}}
        >
          <Star size={14} fill={showFavs?"#fff":"none"}/> {showFavs?"ALL":"FAVS"}
        </button>
      </div>

      {/* Position filters */}
      <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginBottom:20}}>
        {POSITIONS.map(pos => (
          <button key={pos} onClick={() => setSelPos(pos)} style={posBtn(selPos===pos, pos, C)}>{pos}</button>
        ))}
      </div>

      {/* Cap ceiling context hint — desktop only */}
      {!isMobile && (
        <div style={{maxWidth:"100%",margin:"0 0 12px",padding:"8px 16px",borderRadius:10,background:C.auctionHintBg,border:"1px solid rgba(245,158,11,0.2)",fontSize:12,color:C.textSec,display:"flex",alignItems:"center",gap:6}}>
          💰 Cap salary recommendations based on your <strong style={{color:"#fbbf24"}}>{fmtCap(capCeiling)}</strong> cap ceiling.
          <span style={{marginLeft:4,opacity:0.7}}>Adjust in League Settings on the Cap Sheet tab.</span>
        </div>
      )}

      {/* Player table */}
      <div style={{background:C.cardBg,border:"1px solid "+C.border,borderRadius:16,overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,0.2)"}}>

        {/* Header */}
        <div style={{display:"grid",gridTemplateColumns:cols,gap:8,padding:isMobile?"10px 12px":"12px 20px",background:C.headerBg,borderBottom:"1px solid "+C.border,fontSize:11,fontFamily:"monospace",letterSpacing:"0.08em",color:C.textSec,textTransform:"uppercase"}}>
          <div>★</div>
          <div>Player</div>
          <div style={{textAlign:"center"}}>Pos</div>
          {!isMobile && <div style={{textAlign:"center"}}>Team</div>}
          {!isMobile && <div style={{textAlign:"center"}}>Age/Exp</div>}
          <div style={{textAlign:"center"}}>Pts</div>
          {!isMobile && <div style={{textAlign:"center"}}>Cap Value</div>}
          {!isMobile && <div style={{textAlign:"center"}}>Tier</div>}
        </div>

        {/* Rows */}
        {filtered.map(player => {
          const pts  = rankType === "dynasty" ? player.dynastyPoints : player.redraftPoints;
          const tier = ti(player.tier);
          const isFav = favorites.has(player.id);

          // Cap salary recommendation
          const capVal = rankType === "dynasty"
            ? capSalaryValueDynasty(pts, player.position, capCeiling)
            : capSalaryValue(pts, player.position, capCeiling, numTeams);
          const capPct = Math.min(100, (capVal / capCeiling) * 100);

          return (
            <div
              key={player.id}
              onClick={() => setSelPlayer(player)}
              style={{display:"grid",gridTemplateColumns:cols,gap:8,padding:isMobile?"10px 12px":"14px 20px",borderBottom:"1px solid "+C.border,cursor:"pointer"}}
              onMouseEnter={e => e.currentTarget.style.background=C.rowHover}
              onMouseLeave={e => e.currentTarget.style.background="transparent"}
            >
              <div style={{display:"flex",alignItems:"center"}}>
                <button onClick={e => { e.stopPropagation(); toggleFav(player.id); }} style={{background:"none",border:"none",cursor:"pointer",padding:0}}>
                  <Star size={18} color={isFav?"#fbbf24":C.dashCol} fill={isFav?"#fbbf24":"none"}/>
                </button>
              </div>

              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:3,height:40,borderRadius:2,background:pc(player.position),flexShrink:0}}/>
                <div>
                  <div style={{fontWeight:700,fontSize:isMobile?12:14}}>{player.name}</div>
                  {isMobile
                    ? <div style={{fontSize:10,fontFamily:"monospace",color:C.textSec}}>{player.team}</div>
                    : (!!player.number && String(player.number) !== "0" && <div style={{fontSize:11,fontFamily:"monospace",color:C.textSec}}>#{player.number}</div>)
                  }
                </div>
              </div>

              <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{padding:"3px 8px",borderRadius:6,background:pc(player.position),color:"#fff",fontWeight:800,fontSize:11}}>{player.position}</span>
              </div>

              {!isMobile && <div style={{display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:13,color:C.textSec}}>{player.team}</div>}

              {!isMobile && (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontWeight:700,fontSize:13}}>{player.age}y</span>
                  <span style={{fontFamily:"monospace",fontSize:11,color:C.textSec}}>{player.yearsExp} YOE</span>
                </div>
              )}

              <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontWeight:900,fontSize:isMobile?16:22,background:"linear-gradient(90deg,#34d399,#2dd4bf)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{pts.toFixed(0)}</span>
                <span style={{fontSize:10,fontFamily:"monospace",color:C.textSec}}>{rankType==="dynasty"?"DYN":"PPR"}</span>
              </div>

              {/* Cap Value column — desktop only */}
              {!isMobile && (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4}}>
                  <span style={{fontWeight:900,fontSize:16,background:"linear-gradient(90deg,#f59e0b,#fbbf24)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                    {fmtCap(capVal)}
                  </span>
                  <div style={{width:64,height:4,borderRadius:2,background:C.trackBg,overflow:"hidden"}}>
                    <div style={{
                      height:"100%",
                      width: capPct + "%",
                      borderRadius:2,
                      background: capPct > 25 ? "#ef4444" : capPct > 15 ? "#f59e0b" : "#10b981"
                    }}/>
                  </div>
                  <span style={{fontSize:10,fontFamily:"monospace",color:C.textSec}}>{capPct.toFixed(1)}% of cap</span>
                </div>
              )}

              {!isMobile && (
                <div style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{padding:"3px 10px",borderRadius:20,background:tier.bg,color:tier.col,fontWeight:700,fontSize:11}}>{tier.label}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{marginTop:24,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <span style={{fontSize:13,fontFamily:"monospace",color:C.textSec}}>
          <Users size={13} style={{display:"inline",marginRight:4}}/>
          Showing {filtered.length} of {players.length} players
        </span>
        <button onClick={exportCSV} style={{padding:"10px 20px",borderRadius:12,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#10b981,#0d9488)",color:"#fff",fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
          <Download size={15}/> Export CSV
        </button>
      </div>
    </div>
  );
}
