"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, Star, Sun, Moon, Settings, ClipboardList, Database } from "lucide-react";
import { DARK, LIGHT } from "@/constants/theme";
import { buildPlayers, SAMPLES } from "@/utils/players";
import { tabBtn } from "@/utils/styleHelpers";
import RankingsTab from "@/components/RankingsTab";
import DraftBoard from "@/components/DraftBoard";
import PlayerModal from "@/components/PlayerModal";
import SettingsModal from "@/components/SettingsModal";
import useWindowSize from "@/hooks/useWindowSize";

export default function Home() {
  const [players, setPlayers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selPos, setSelPos]       = useState("ALL");
  const [search, setSearch]       = useState("");
  const [rankType, setRankType]   = useState("redraft");
  const [apiStatus, setApiStatus] = useState({});
  const [favorites, setFavorites] = useState(new Set());
  const [theme, setTheme]         = useState("dark");
  const [showFavs, setShowFavs]   = useState(false);
  const [selPlayer, setSelPlayer] = useState(null);
  const [budget, setBudget]       = useState(200);
  const [numTeams, setNumTeams]   = useState(12);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab]       = useState("rankings");
  const [scoring, setScoring]     = useState("ppr");
  const [statsData, setStatsData] = useState({});
  const [rawPlayers, setRawPlayers] = useState([]);

  // Draft state
  const [draftStarted, setDraftStarted] = useState(false);
  const [draftType, setDraftType]       = useState("snake");
  const [draftTeams, setDraftTeams]     = useState(12);
  const [draftRounds, setDraftRounds]   = useState(15);
  const [yourSlot, setYourSlot]         = useState(1);
  const [picks, setPicks]               = useState({});
  const [pickIndex, setPickIndex]       = useState(0);
  const [draftSearch, setDraftSearch]   = useState("");
  const [draftPos, setDraftPos]         = useState("ALL");
  const [idpOn, setIdpOn]               = useState(false);
  const [teamNames, setTeamNames]       = useState(() => Array.from({length:16},(_,i) => "Team "+(i+1)));

  // Auction state
  const [auctBudget, setAuctBudget] = useState(200);
  const [auctNom, setAuctNom]       = useState(1);
  const [auctBids, setAuctBids]     = useState({});
  const [nomPlayer, setNomPlayer]   = useState(null);
  const [curBid, setCurBid]         = useState(1);
  const [bidTeam, setBidTeam]       = useState(1);

  const { isMobile } = useWindowSize();
  const C = theme === "dark" ? DARK : LIGHT;
  const dk = theme === "dark";
  const totalPicks = draftTeams * draftRounds;

  function pickInfo(idx) {
    const round = Math.floor(idx/draftTeams)+1;
    const pos   = idx % draftTeams;
    const team  = (draftType === "snake" && round%2===0) ? (draftTeams-pos) : (pos+1);
    return {round, team};
  }

  function toggleFav(id) {
    setFavorites(prev => { const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  }

  function draftPlayer(player) {
    if (pickIndex >= totalPicks) return;
    setPicks(prev => ({...prev, [pickIndex]: player}));
    setPickIndex(prev => prev+1);
  }

  function undoPick() {
    if (pickIndex === 0) return;
    setPicks(prev => { const n={...prev}; delete n[pickIndex-1]; return n; });
    setPickIndex(prev => prev-1);
  }

  function resetDraft() {
    setPicks({}); setPickIndex(0); setDraftStarted(false);
    setAuctBids({}); setNomPlayer(null); setAuctNom(1); setCurBid(1); setBidTeam(1);
  }

  function confirmBid() {
    if (!nomPlayer || curBid < 1) return;
    setAuctBids(prev => ({...prev, [nomPlayer.id]: {team:bidTeam, amount:curBid}}));
    setNomPlayer(null); setCurBid(1);
    setAuctNom(prev => (prev % draftTeams) + 1);
  }

  useEffect(() => {
  async function load() {
    setLoading(true);
    let raw = [];
    let statsData = {};
    const status = {};

    // Fetch players
    try {
      const res = await fetch("https://api.sleeper.app/v1/players/nfl");
      if (res.ok) {
        const data = await res.json();
        raw = Object.values(data).filter(p => p.active && p.position);
        status.sleeper = {success:true, count:raw.length};
      } else throw new Error();
    } catch {
      raw = SAMPLES;
      status.sample = {success:true, count:raw.length};
    }

    // Fetch 2024 season stats
    try {
      const res = await fetch("https://api.sleeper.app/v1/stats/nfl/regular/2024");
      if (res.ok) {
        statsData = await res.json();
        status.stats = {success:true, count:Object.keys(statsData).length};
      }
    } catch {
      status.stats = {success:false, error:"Stats unavailable"};
    }

    setApiStatus(status);
    setRawPlayers(raw);
    setPlayers(buildPlayers(raw, budget, scoring, statsData, numTeams));
    setStatsData(statsData);
    setLoading(false);
  }
  load();
}, []);

  if (loading) {
    return (
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.loadBg}}>
        <div style={{textAlign:"center"}}>
          <div style={{width:64,height:64,border:"4px solid #6366f1",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto"}}/>
          <p style={{marginTop:16,color:"#818cf8",fontFamily:"monospace",letterSpacing:"0.1em"}}>LOADING RANKINGS...</p>
        </div>
        <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",background:C.pageBg,color:C.textPri,fontFamily:"system-ui,sans-serif"}}>

      {/* Fixed buttons */}
      <button onClick={() => setTheme(dk?"light":"dark")}
        style={{position:"fixed",top:16,right:16,zIndex:50,padding:"10px",borderRadius:12,border:"none",cursor:"pointer",background:C.themeBtnBg,color:C.themeBtnCol,boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
        {dk ? <Sun size={18}/> : <Moon size={18}/>}
      </button>
      <button onClick={() => setShowSettings(true)}
        style={{position:"fixed",top:16,right:64,zIndex:50,padding:"10px",borderRadius:12,border:"none",cursor:"pointer",background:C.themeBtnBg,color:C.settBtnCol,boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
        <Settings size={18}/>
      </button>

      <div style={{maxWidth:1280,margin:"0 auto",padding:"32px 16px"}}>

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:12,marginBottom:8}}>
            <TrendingUp size={isMobile?24:40} color="#818cf8"/>
            <h1 style={{fontSize:isMobile?32:52,fontWeight:900,margin:0,background:"linear-gradient(90deg,#818cf8,#c084fc,#f472b6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"-0.05em"}}>GRID IRON</h1>
          </div>
          <p style={{color:C.textSec,fontFamily:"monospace",fontSize:isMobile?11:14,letterSpacing:"0.05em"}}>{new Date().getFullYear()} Fantasy Football Rankings</p>
          <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:8,flexWrap:"wrap"}}>
            <span style={{display:"flex",alignItems:"center",gap:4,color:C.textSec,fontSize:13}}><Users size={14}/> {players.length} Players</span>
            {favorites.size > 0 && <span style={{display:"flex",alignItems:"center",gap:4,color:"#fbbf24",fontSize:13}}><Star size={14} fill="#fbbf24"/> {favorites.size} Favorites</span>}
          </div>
          <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:8,flexWrap:"wrap"}}>
            {Object.entries(apiStatus).map(([src,st]) => (
              <span key={src} style={{padding:"2px 10px",borderRadius:20,fontSize:12,fontFamily:"monospace",background:st.success?"rgba(16,185,129,0.15)":"rgba(239,68,68,0.15)",color:st.success?"#34d399":"#f87171",border:"1px solid "+(st.success?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.3)")}}>
                <Database size={10} style={{display:"inline",marginRight:4}}/>
                {src.toUpperCase()}: {st.success ? st.count+" players" : st.error}
              </span>
            ))}
          </div>
        </div>

        {/* Scoring selector */}
        <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
          <div style={{display:"inline-flex",background:C.cardBg,border:"1px solid "+C.border,borderRadius:14,padding:4,gap:4}}>
            {[
              {key:"ppr",  label:"PPR"},
              {key:"half", label:"Half PPR"},
              {key:"std",  label:"Standard"},
            ].map(s => (
              <button key={s.key} onClick={() => {
  setScoring(s.key);
  setPlayers(buildPlayers(rawPlayers, budget, s.key, statsData, numTeams));
}}
                style={{...tabBtn(scoring===s.key,"linear-gradient(135deg,#6366f1,#8b5cf6)",C), padding:isMobile?"8px 12px":"10px 28px", fontSize:isMobile?11:13}}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{display:"flex",justifyContent:"center",marginBottom:32}}>
          <div style={{display:"inline-flex",background:C.cardBg,border:"1px solid "+C.border,borderRadius:14,padding:4}}>
            <button onClick={() => setActiveTab("rankings")} style={tabBtn(activeTab==="rankings","linear-gradient(135deg,#6366f1,#8b5cf6)",C)}>
              <TrendingUp size={15}/> RANKINGS
            </button>
            <button onClick={() => setActiveTab("draftboard")} style={tabBtn(activeTab==="draftboard","linear-gradient(135deg,#10b981,#0d9488)",C)}>
              <ClipboardList size={15}/> DRAFT BOARD
              {draftStarted && draftType !== "auction" && (
                <span style={{padding:"1px 7px",borderRadius:20,fontSize:11,background:"rgba(16,185,129,0.2)",color:"#34d399",border:"1px solid rgba(16,185,129,0.3)"}}>{pickIndex}/{totalPicks}</span>
              )}
            </button>
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "rankings" && (
          <RankingsTab
            C={C} players={players} rankType={rankType} setRankType={setRankType}
            selPos={selPos} setSelPos={setSelPos} search={search} setSearch={setSearch}
            showFavs={showFavs} setShowFavs={setShowFavs} favorites={favorites}
            toggleFav={toggleFav} setSelPlayer={setSelPlayer} budget={budget}
          />
        )}

        {activeTab === "draftboard" && (
          <DraftBoard
            C={C} players={players} rankType={rankType}
            draftStarted={draftStarted} setDraftStarted={setDraftStarted}
            draftType={draftType} setDraftType={setDraftType}
            draftTeams={draftTeams} setDraftTeams={setDraftTeams}
            draftRounds={draftRounds} setDraftRounds={setDraftRounds}
            yourSlot={yourSlot} setYourSlot={setYourSlot}
            picks={picks} pickIndex={pickIndex} totalPicks={totalPicks}
            draftSearch={draftSearch} setDraftSearch={setDraftSearch}
            draftPos={draftPos} setDraftPos={setDraftPos}
            idpOn={idpOn} setIdpOn={setIdpOn}
            teamNames={teamNames} setTeamNames={setTeamNames}
            auctBudget={auctBudget} setAuctBudget={setAuctBudget}
            auctBids={auctBids} nomPlayer={nomPlayer} setNomPlayer={setNomPlayer}
            curBid={curBid} setCurBid={setCurBid}
            bidTeam={bidTeam} setBidTeam={setBidTeam}
            auctNom={auctNom}
            draftPlayer={draftPlayer} undoPick={undoPick} resetDraft={resetDraft}
            confirmBid={confirmBid} pickInfo={pickInfo}
          />
        )}
      </div>

      {/* Modals */}
      <PlayerModal player={selPlayer} favorites={favorites} toggleFav={toggleFav} onClose={() => setSelPlayer(null)}/>
      <SettingsModal C={C} budget={budget} setBudget={setBudget} numTeams={numTeams} setNumTeams={setNumTeams} onClose={() => setShowSettings(false)} showSettings={showSettings}/>

      <style>{"@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.5} } *{box-sizing:border-box} body{margin:0}"}</style>
    </div>
  );
}