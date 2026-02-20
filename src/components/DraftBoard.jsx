"use client";
import { useState } from "react";
import { Search, ClipboardList, Trash2, RotateCcw } from "lucide-react";
import { pc } from "@/constants/theme";
import { btn, smallBtn, slotBtn, posBtn } from "@/utils/styleHelpers";
import useWindowSize from "@/hooks/useWindowSize";

export default function DraftBoard({
  C, players, rankType,
  draftStarted, setDraftStarted,
  draftType, setDraftType,
  draftTeams, setDraftTeams,
  draftRounds, setDraftRounds,
  yourSlot, setYourSlot,
  picks, pickIndex, totalPicks,
  draftSearch, setDraftSearch,
  draftPos, setDraftPos,
  idpOn, setIdpOn,
  teamNames, setTeamNames,
  auctBudget, setAuctBudget,
  auctBids, nomPlayer, setNomPlayer,
  curBid, setCurBid,
  bidTeam, setBidTeam,
  auctNom,
  draftPlayer, undoPick, resetDraft,
  confirmBid,
  pickInfo,
}) {
  const [boardTab, setBoardTab] = useState("draft");
  const { isMobile } = useWindowSize();
  const isAuction = draftType === "auction";
  const IDP_POS = ["DL","LB","DB"];
  const draftPositions = idpOn
    ? ["ALL","QB","RB","WR","TE","K","DL","LB","DB"]
    : ["ALL","QB","RB","WR","TE","K"];

  const draftedIds = new Set(Object.values(picks).map(p => p && p.id).filter(Boolean));
  const auctDraftedIds = new Set(Object.keys(auctBids));

  const availPlayers = players
    .filter(p => !draftedIds.has(p.id))
    .filter(p => idpOn ? p.position !== "DEF" : !IDP_POS.includes(p.position))
    .filter(p => draftPos === "ALL" || p.position === draftPos)
    .filter(p => !draftSearch || p.name.toLowerCase().includes(draftSearch.toLowerCase()))
    .sort((a,b) => rankType === "dynasty" ? b.dynastyPoints - a.dynastyPoints : b.redraftPoints - a.redraftPoints)
    .slice(0, 100);

  const auctAvail = players
    .filter(p => !auctDraftedIds.has(p.id))
    .filter(p => idpOn ? p.position !== "DEF" : !IDP_POS.includes(p.position))
    .filter(p => draftPos === "ALL" || p.position === draftPos)
    .filter(p => !draftSearch || p.name.toLowerCase().includes(draftSearch.toLowerCase()))
    .sort((a,b) => rankType === "dynasty" ? b.dynastyPoints - a.dynastyPoints : b.redraftPoints - a.redraftPoints)
    .slice(0, 100);

  const currentPickInfo = pickInfo(pickIndex);
  function getTeamName(t) { return teamNames[t-1] || ("Team "+t); }

  // ── Setup screen ──
  if (!draftStarted) {
    return (
      <div style={{background:C.cardBg,border:"1px solid "+C.border,borderRadius:20,padding:40,textAlign:"center"}}>
        <ClipboardList size={56} color="#34d399" style={{marginBottom:16}}/>
        <h2 style={{fontSize:32,fontWeight:900,margin:"0 0 8px"}}>Mock Draft Board</h2>
        <p style={{color:C.textSec,marginBottom:32}}>Configure your draft settings and start picking.</p>
        <div style={{maxWidth:520,margin:"0 auto",textAlign:"left",display:"flex",flexDirection:"column",gap:20}}>

          <div>
            <label style={{display:"block",fontWeight:700,fontSize:13,marginBottom:8,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.05em"}}>Draft Type</label>
            <div style={{display:"flex",gap:8}}>
              {["snake","linear","auction"].map(t => (
                <button key={t} onClick={() => setDraftType(t)}
                  style={smallBtn(draftType===t, t==="auction"?"#f59e0b":"#10b981", t==="auction"?"#000":"#fff", C)}>
                  {t==="auction" ? "💰 Auction" : t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{display:"block",fontWeight:700,fontSize:13,marginBottom:8,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.05em"}}>Teams</label>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {[8,10,12,14,16].map(n => (
                <button key={n} onClick={() => { setDraftTeams(n); if(yourSlot>n) setYourSlot(1); }} style={btn(draftTeams===n,C)}>{n}</button>
              ))}
            </div>
          </div>

          {!isAuction && (
            <div>
              <label style={{display:"block",fontWeight:700,fontSize:13,marginBottom:8,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.05em"}}>Rounds</label>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[10,12,15,17].map(n => (
                  <button key={n} onClick={() => setDraftRounds(n)} style={btn(draftRounds===n,C)}>{n}</button>
                ))}
              </div>
            </div>
          )}

          {!isAuction && (
            <div>
              <label style={{display:"block",fontWeight:700,fontSize:13,marginBottom:8,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.05em"}}>Your Pick Slot</label>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {Array.from({length:draftTeams},(_,i)=>i+1).map(n => (
                  <button key={n} onClick={() => setYourSlot(n)} style={slotBtn(yourSlot===n,C)}>{n}</button>
                ))}
              </div>
            </div>
          )}

          {isAuction && (
            <div>
              <label style={{display:"block",fontWeight:700,fontSize:13,marginBottom:8,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.05em"}}>Budget Per Team</label>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[100,150,200,250,300].map(n => (
                  <button key={n} onClick={() => setAuctBudget(n)}
                    style={{padding:"8px 18px",borderRadius:10,border:"none",cursor:"pointer",fontWeight:700,background:auctBudget===n?"#f59e0b":C.btnBgAlt,color:auctBudget===n?"#000":C.textSec}}>
                    ${n}
                  </button>
                ))}
              </div>
              <div style={{marginTop:10,padding:"10px 14px",borderRadius:10,background:C.auctionHintBg,border:"1px solid rgba(245,158,11,0.3)",fontSize:12,color:C.textSec}}>
                Each team gets <strong style={{color:"#fbbf24"}}>${auctBudget}</strong> to spend. Total pool: <strong style={{color:"#fbbf24"}}>${auctBudget*draftTeams}</strong>.
              </div>
            </div>
          )}

          <div>
            <label style={{display:"block",fontWeight:700,fontSize:13,marginBottom:8,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.05em"}}>Team Names (optional)</label>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:6}}>
              {Array.from({length:draftTeams},(_,i)=>i+1).map(t => (
                <div key={t} style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:11,fontFamily:"monospace",fontWeight:700,color:t===yourSlot?"#818cf8":C.textSec,minWidth:20,textAlign:"right"}}>{t}</span>
                  <input
                    value={teamNames[t-1]||""}
                    onChange={e => setTeamNames(prev => { const n=[...prev]; n[t-1]=e.target.value; return n; })}
                    placeholder={"Team "+t}
                    style={{flex:1,padding:"6px 10px",borderRadius:8,border:t===yourSlot?"1px solid rgba(99,102,241,0.5)":"1px solid "+C.border,background:t===yourSlot?C.yourInputBg:C.inputBg,color:C.textPri,fontSize:12,outline:"none"}}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label style={{display:"block",fontWeight:700,fontSize:13,marginBottom:8,color:C.textSec,textTransform:"uppercase",letterSpacing:"0.05em"}}>IDP</label>
            <div style={{display:"flex",gap:8}}>
              <button onClick={() => setIdpOn(false)} style={smallBtn(!idpOn,"#6366f1","#fff",C)}>Off</button>
              <button onClick={() => setIdpOn(true)}  style={smallBtn(idpOn,"#06b6d4","#fff",C)}>On</button>
            </div>
          </div>

          <button
            onClick={() => setDraftStarted(true)}
            style={{padding:"16px",borderRadius:14,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#10b981,#0d9488)",color:"#fff",fontWeight:900,fontSize:16,marginTop:8}}
          >
            {isAuction ? "💰 Start Auction" : "🏈 Start Draft"}
          </button>
        </div>
      </div>
    );
  }

  // ── Active draft UI ──
  return (
    <div>
      {/* Tab switcher — shown for both snake/linear and auction */}
      <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
        <div style={{display:"inline-flex",background:C.cardBg,border:"1px solid "+C.border,borderRadius:12,padding:4,gap:4}}>
          <button
            onClick={() => setBoardTab("draft")}
            style={{padding:"8px 24px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,background:boardTab==="draft"?"linear-gradient(135deg,#10b981,#0d9488)":"transparent",color:boardTab==="draft"?"#fff":C.textSec}}
          >
            {isAuction ? "💰 Auction" : "🏈 Draft"}
          </button>
          <button
            onClick={() => setBoardTab("board")}
            style={{padding:"8px 24px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,background:boardTab==="board"?"linear-gradient(135deg,#6366f1,#8b5cf6)":"transparent",color:boardTab==="board"?"#fff":C.textSec}}
          >
            📋 Board
          </button>
        </div>
      </div>

      {/* ── DRAFT TAB ── */}
      {boardTab === "draft" && (
        <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 340px",gap:20}}>

          {/* Left — available players */}
          <div style={{background:C.cardBg,border:"1px solid "+C.border,borderRadius:16,overflow:"hidden"}}>
            <div style={{padding:"16px 20px",borderBottom:"1px solid "+C.border,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
              <div style={{position:"relative",flex:1,minWidth:160}}>
                <Search size={14} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:C.textSec}}/>
                <input
                  value={draftSearch} onChange={e => setDraftSearch(e.target.value)}
                  placeholder="Search players..."
                  style={{width:"100%",paddingLeft:32,paddingRight:10,paddingTop:8,paddingBottom:8,borderRadius:10,border:"1px solid "+C.border,background:C.inputBg,color:C.textPri,outline:"none",fontSize:13,boxSizing:"border-box"}}
                />
              </div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                {draftPositions.map(pos => (
                  <button key={pos} onClick={() => setDraftPos(pos)} style={posBtn(draftPos===pos,pos,C)}>{pos}</button>
                ))}
              </div>
            </div>

            <div style={{maxHeight:isMobile?300:500,overflowY:"auto"}}>
              {(isAuction ? auctAvail : availPlayers).map(player => {
                const pts = rankType === "dynasty" ? player.dynastyPoints : player.redraftPoints;
                return (
                  <div
                    key={player.id}
                    onClick={() => isAuction ? setNomPlayer(player) : draftPlayer(player)}
                    style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderBottom:"1px solid "+C.border,cursor:"pointer"}}
                    onMouseEnter={e => e.currentTarget.style.background=C.rowHover}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  >
                    <div style={{width:3,height:36,borderRadius:2,background:pc(player.position),flexShrink:0}}/>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:13}}>{player.name}</div>
                      <div style={{fontSize:11,color:C.textSec,fontFamily:"monospace"}}>{player.team}</div>
                    </div>
                    <span style={{padding:"2px 8px",borderRadius:6,background:pc(player.position),color:"#fff",fontWeight:800,fontSize:11}}>{player.position}</span>
                    <span style={{fontWeight:700,fontSize:13,minWidth:40,textAlign:"right"}}>{pts.toFixed(0)}</span>
                    {isAuction && (
                      <button
                        onClick={e => { e.stopPropagation(); setNomPlayer(player); }}
                        style={{padding:"4px 10px",borderRadius:8,border:"none",cursor:"pointer",background:"#f59e0b",color:"#000",fontWeight:700,fontSize:11}}>
                        NOM
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right panel */}
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {!isAuction && (
              <div style={{background:C.curPickBg,border:"1px solid rgba(16,185,129,0.3)",borderRadius:14,padding:16}}>
                <div style={{fontSize:11,fontFamily:"monospace",color:"#34d399",marginBottom:4}}>CURRENT PICK</div>
                <div style={{fontSize:22,fontWeight:900}}>Round {currentPickInfo.round}, Pick {(pickIndex%draftTeams)+1}</div>
                <div style={{fontSize:13,color:C.textSec}}>{getTeamName(currentPickInfo.team)} is on the clock</div>
                <div style={{fontSize:11,fontFamily:"monospace",color:C.textSec,marginTop:4}}>{pickIndex}/{totalPicks} picks made</div>
              </div>
            )}

            {isAuction && nomPlayer && (
              <div style={{background:C.nomBg,border:"1px solid rgba(245,158,11,0.3)",borderRadius:14,padding:16}}>
                <div style={{fontSize:11,fontFamily:"monospace",color:"#fbbf24",marginBottom:8}}>NOMINATION</div>
                <div style={{fontWeight:800,fontSize:16,marginBottom:12}}>{nomPlayer.name}</div>
                <div style={{display:"flex",gap:8,marginBottom:8}}>
                  <input
                    type="number" min={1} value={curBid}
                    onChange={e => setCurBid(Number(e.target.value))}
                    style={{flex:1,padding:"8px 10px",borderRadius:8,border:"1px solid "+C.border,background:C.inputBg,color:C.textPri,fontSize:14,outline:"none"}}
                  />
                  <select
                    value={bidTeam}
                    onChange={e => setBidTeam(Number(e.target.value))}
                    style={{flex:1,padding:"8px 10px",borderRadius:8,border:"1px solid "+C.border,background:C.inputBg,color:C.textPri,fontSize:13,outline:"none"}}
                  >
                    {Array.from({length:draftTeams},(_,i)=>i+1).map(t => (
                      <option key={t} value={t}>{getTeamName(t)}</option>
                    ))}
                  </select>
                </div>
                <button onClick={confirmBid} style={{width:"100%",padding:"10px",borderRadius:10,border:"none",cursor:"pointer",background:"#f59e0b",color:"#000",fontWeight:700}}>
                  ✓ Confirm Winning Bid
                </button>
              </div>
            )}

            <div style={{background:C.cardBg,border:"1px solid "+C.border,borderRadius:14,padding:16,flex:1}}>
              <div style={{fontSize:11,fontFamily:"monospace",color:C.textSec,marginBottom:10}}>YOUR ROSTER — {getTeamName(yourSlot)}</div>
              {(isAuction
                ? Object.entries(auctBids).filter(([,b])=>b.team===yourSlot).map(([pid,b])=>({...players.find(p=>p.id===pid),paidAmount:b.amount})).filter(Boolean)
                : (() => { const r=[]; for(let i=0;i<totalPicks;i++){if(pickInfo(i).team===yourSlot&&picks[i])r.push({...picks[i],round:pickInfo(i).round});} return r; })()
              ).map((p,i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid "+C.border}}>
                  <span style={{padding:"2px 6px",borderRadius:4,background:pc(p.position),color:"#fff",fontWeight:800,fontSize:10}}>{p.position}</span>
                  <span style={{flex:1,fontSize:12,fontWeight:600}}>{p.name}</span>
                  {isAuction
                    ? <span style={{fontSize:11,color:"#fbbf24",fontFamily:"monospace"}}>${p.paidAmount}</span>
                    : <span style={{fontSize:11,color:C.textSec,fontFamily:"monospace"}}>R{p.round}</span>
                  }
                </div>
              ))}
            </div>

            <div style={{display:"flex",gap:8}}>
              {!isAuction && (
                <button onClick={undoPick} style={{flex:1,padding:"10px",borderRadius:10,border:"none",cursor:"pointer",background:C.btnBgAlt,color:C.textSec,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  <RotateCcw size={14}/> Undo
                </button>
              )}
              <button onClick={resetDraft} style={{flex:1,padding:"10px",borderRadius:10,border:"none",cursor:"pointer",background:"rgba(239,68,68,0.15)",color:"#ef4444",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                <Trash2 size={14}/> Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SNAKE/LINEAR BOARD TAB ── */}
      {boardTab === "board" && !isAuction && (
        <div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginBottom:12}}>
            <button onClick={undoPick} style={{padding:"8px 16px",borderRadius:10,border:"none",cursor:"pointer",background:C.btnBgAlt,color:C.textSec,fontWeight:700,display:"flex",alignItems:"center",gap:6,fontSize:13}}>
              <RotateCcw size={13}/> Undo
            </button>
            <button onClick={resetDraft} style={{padding:"8px 16px",borderRadius:10,border:"none",cursor:"pointer",background:"rgba(239,68,68,0.15)",color:"#ef4444",fontWeight:700,display:"flex",alignItems:"center",gap:6,fontSize:13}}>
              <Trash2 size={13}/> Reset
            </button>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{borderCollapse:"collapse",minWidth:"100%",fontSize:12}}>
              <thead>
                <tr>
                  <th style={{padding:"10px 12px",background:C.headerBg,border:"1px solid "+C.border,fontSize:11,fontFamily:"monospace",color:C.textSec,whiteSpace:"nowrap",minWidth:60}}>RND</th>
                  {Array.from({length:draftTeams},(_,i)=>i+1).map(t => (
                    <th key={t} style={{padding:"10px 12px",background:t===yourSlot?C.yourCellBg:C.headerBg,border:"1px solid "+C.border,fontSize:11,fontFamily:"monospace",color:t===yourSlot?"#818cf8":C.textSec,whiteSpace:"nowrap",minWidth:120,textAlign:"center"}}>
                      {getTeamName(t)}{t===yourSlot && <span style={{marginLeft:4,fontSize:10,color:"#818cf8"}}>(YOU)</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({length:draftRounds},(_,r)=>r+1).map(round => (
                  <tr key={round}>
                    <td style={{padding:"8px 12px",background:C.stickyBg,border:"1px solid "+C.border,fontFamily:"monospace",fontWeight:700,fontSize:12,color:C.textSec,textAlign:"center"}}>R{round}</td>
                    {Array.from({length:draftTeams},(_,t)=>t+1).map(team => {
                      const idx = Array.from({length:totalPicks},(_,i)=>i).find(i => {
                        const info = pickInfo(i);
                        return info.round === round && info.team === team;
                      });
                      const player = idx !== undefined ? picks[idx] : null;
                      const isCurrent = idx === pickIndex;
                      const isPast = idx < pickIndex;
                      const isYourTeam = team === yourSlot;
                      return (
                        <td key={team} style={{padding:"6px 8px",border:"1px solid "+C.border,background:isCurrent?C.curPickBg:isYourTeam?C.yourColBg:"transparent",textAlign:"center",verticalAlign:"middle",minWidth:120}}>
                          {player ? (
                            <div style={{padding:"6px 8px",borderRadius:8,background:isYourTeam?C.yourCellBg:C.otherCellBg,border:"1px solid "+(isYourTeam?"rgba(99,102,241,0.3)":C.border)}}>
                              <div style={{fontWeight:700,fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:100}}>{player.name}</div>
                              <div style={{fontSize:10,fontFamily:"monospace",color:pc(player.position),marginTop:2}}>{player.position} · {player.team}</div>
                            </div>
                          ) : isCurrent ? (
                            <div style={{padding:"6px 8px",borderRadius:8,border:"2px dashed #10b981",color:"#10b981",fontSize:11,fontWeight:700,animation:"pulse 1s ease-in-out infinite"}}>ON CLOCK</div>
                          ) : isPast ? (
                            <span style={{color:C.dashCol,fontSize:13}}>—</span>
                          ) : (
                            <span style={{color:C.dotCol,fontSize:16}}>·</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── AUCTION BOARD TAB ── */}
      {boardTab === "board" && isAuction && (
        <div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginBottom:12}}>
            <button onClick={resetDraft} style={{padding:"8px 16px",borderRadius:10,border:"none",cursor:"pointer",background:"rgba(239,68,68,0.15)",color:"#ef4444",fontWeight:700,display:"flex",alignItems:"center",gap:6,fontSize:13}}>
              <Trash2 size={13}/> Reset
            </button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
            {Array.from({length:draftTeams},(_,i)=>i+1).map(team => {
              const roster = Object.entries(auctBids)
                .filter(([,b]) => b.team === team)
                .map(([pid,b]) => ({...players.find(p=>p.id===pid), paidAmount:b.amount}))
                .filter(Boolean);
              const spent = roster.reduce((s,p) => s+p.paidAmount, 0);
              const remaining = auctBudget - spent;
              const isYourTeam = team === yourSlot;
              return (
                <div key={team} style={{background:isYourTeam?C.yourCellBg:C.cardBg,border:"1px solid "+(isYourTeam?"rgba(99,102,241,0.4)":C.border),borderRadius:14,overflow:"hidden"}}>
                  <div style={{padding:"12px 16px",borderBottom:"1px solid "+C.border,display:"flex",justifyContent:"space-between",alignItems:"center",background:isYourTeam?"rgba(99,102,241,0.1)":C.headerBg}}>
                    <div>
                      <div style={{fontWeight:800,fontSize:14,color:isYourTeam?"#818cf8":C.textPri}}>
                        {getTeamName(team)}
                        {isYourTeam && <span style={{marginLeft:6,fontSize:11,color:"#818cf8"}}>(YOU)</span>}
                      </div>
                      <div style={{fontSize:11,fontFamily:"monospace",color:C.textSec,marginTop:2}}>{roster.length} players</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontWeight:900,fontSize:16,color:remaining<20?"#ef4444":remaining<50?"#fbbf24":"#34d399"}}>${remaining}</div>
                      <div style={{fontSize:10,fontFamily:"monospace",color:C.textSec}}>remaining</div>
                    </div>
                  </div>
                  <div style={{height:4,background:C.trackBg}}>
                    <div style={{height:"100%",borderRadius:2,background:remaining<20?"#ef4444":remaining<50?"#fbbf24":"#34d399",width:((spent/auctBudget)*100)+"%",transition:"width 0.3s"}}/>
                  </div>
                  <div style={{padding:"8px 0",maxHeight:280,overflowY:"auto"}}>
                    {roster.length === 0 ? (
                      <div style={{padding:"16px",textAlign:"center",color:C.textSec,fontSize:12}}>No players yet</div>
                    ) : roster.map((p,i) => (
                      <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 16px",borderBottom:"1px solid "+C.border}}>
                        <span style={{padding:"2px 6px",borderRadius:4,background:pc(p.position),color:"#fff",fontWeight:800,fontSize:10,flexShrink:0}}>{p.position}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:700,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                          <div style={{fontSize:10,color:C.textSec,fontFamily:"monospace"}}>{p.team}</div>
                        </div>
                        <span style={{fontWeight:900,fontSize:13,color:"#fbbf24",flexShrink:0}}>${p.paidAmount}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{padding:"8px 16px",borderTop:"1px solid "+C.border,display:"flex",justifyContent:"space-between",fontSize:11,fontFamily:"monospace",color:C.textSec}}>
                    <span>Spent: <strong style={{color:C.textPri}}>${spent}</strong></span>
                    <span>Budget: <strong style={{color:C.textPri}}>${auctBudget}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}