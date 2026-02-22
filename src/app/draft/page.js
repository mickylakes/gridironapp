"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, Star, Sun, Moon, Settings, ClipboardList, Database, DollarSign, Bug } from "lucide-react";
import { DARK, LIGHT } from "@/constants/theme";
import { buildPlayers, SAMPLES } from "@/utils/players";
import { tabBtn } from "@/utils/styleHelpers";
import RankingsTab from "@/components/RankingsTab";
import DraftBoard from "@/components/DraftBoard";
import PlayerModal from "@/components/PlayerModal";
import SettingsModal from "@/components/SettingsModal";
import useWindowSize from "@/hooks/useWindowSize";
import { createClient } from "@/lib/supabase";
import AuthModal from "@/components/AuthModal";
import { LogIn, LogOut } from "lucide-react";
import CapSheetTab from "@/components/CapSheetTab";
import BugReportModal from "@/components/BugReportModal";

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
  const [prevStatsData, setPrevStatsData] = useState({});
  const [projData, setProjData] = useState({});
  const [rawPlayers, setRawPlayers] = useState([]);
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showBugReport, setShowBugReport] = useState(false);

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

  // Salary cap state
  const [capCeiling, setCapCeiling] = useState(50_000_000);

  // Tank01: ADP + news + bye weeks + player info + projections
  const [adpData,        setAdpData]        = useState([]);
  const [newsItems,      setNewsItems]      = useState([]);
  const [byeData,        setByeData]        = useState({});
  const [playerInfoData, setPlayerInfoData] = useState([]);
  const [tank01Proj,     setTank01Proj]     = useState([]);

  // FIX 1: Removed duplicate auth useEffect — single subscription only
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadSettings();
      loadFavorites();
      loadDraft();
    }
  }, [user]);

  // Fetch Tank01 data on mount (non-blocking, all parallel)
  useEffect(() => {
    fetch("/api/tank01?type=adp")
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data) && data.length > 0) setAdpData(data); })
      .catch(err => console.error("Tank01 ADP fetch error:", err));

    fetch("/api/tank01?type=news")
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data) && data.length > 0) setNewsItems(data); })
      .catch(err => console.error("Tank01 news fetch error:", err));

    fetch("/api/tank01?type=bye")
      .then(r => r.ok ? r.json() : {})
      .then(data => { if (data && typeof data === "object" && !Array.isArray(data) && Object.keys(data).length > 0) setByeData(data); })
      .catch(err => console.error("Tank01 bye fetch error:", err));

    fetch("/api/tank01?type=playerinfo")
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data) && data.length > 0) setPlayerInfoData(data); })
      .catch(err => console.error("Tank01 playerinfo fetch error:", err));

    fetch("/api/tank01?type=projections")
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (Array.isArray(data) && data.length > 0) setTank01Proj(data); })
      .catch(err => console.error("Tank01 projections fetch error:", err));
  }, []);

  // Rebuild players when ADP data arrives
  useEffect(() => {
    if (adpData.length > 0 && rawPlayers.length > 0) {
      setPlayers(buildPlayers(rawPlayers, budget, scoring, statsData, numTeams, prevStatsData, projData, adpData, byeData, playerInfoData, tank01Proj));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adpData]);

  // Rebuild players when bye/playerInfo/projections arrive
  useEffect(() => {
    if (rawPlayers.length > 0) {
      setPlayers(buildPlayers(rawPlayers, budget, scoring, statsData, numTeams, prevStatsData, projData, adpData, byeData, playerInfoData, tank01Proj));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byeData, playerInfoData, tank01Proj]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }

  async function saveSettings(newSettings) {
    if (!user) return;
    const supabase = createClient();
    try {
      const { error } = await supabase.from("user_settings").upsert({
        user_id: user.id,
        ...newSettings,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (error) console.error("saveSettings error:", error);
    } catch (err) {
      console.error("saveSettings exception:", err);
    }
  }

  async function loadSettings() {
    if (!user) return;
    const supabase = createClient();
    try {
      const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single();
      if (error && error.code !== "PGRST116") console.error("loadSettings error:", error);
      if (data) {
        if (data.theme) setTheme(data.theme);
        if (data.scoring) setScoring(data.scoring);
        if (data.budget) setBudget(data.budget);
        if (data.num_teams) setNumTeams(data.num_teams);
        if (data.cap_ceiling) setCapCeiling(data.cap_ceiling);
      }
    } catch (err) {
      console.error("loadSettings exception:", err);
    }
  }

  async function loadFavorites() {
    if (!user) return;
    const supabase = createClient();
    try {
      const { data, error } = await supabase.from("favorites").select("player_id").eq("user_id", user.id);
      if (error) console.error("loadFavorites error:", error);
      if (data) setFavorites(new Set(data.map(f => f.player_id)));
    } catch (err) {
      console.error("loadFavorites exception:", err);
    }
  }

  // FIX 2: saveDraft now uses user_id as the upsert conflict target.
  // Requires: ALTER TABLE drafts ADD CONSTRAINT drafts_user_id_key UNIQUE (user_id);
  async function saveDraft(currentPicks, currentBids) {
    if (!user) return;
    const supabase = createClient();
    try {
      const { error } = await supabase.from("drafts").upsert({
        user_id: user.id,
        name: `Draft ${new Date().toLocaleDateString()}`,
        draft_type: draftType,
        teams: draftTeams,
        rounds: draftRounds,
        your_slot: yourSlot,
        picks: currentPicks || {},
        auction_bids: currentBids || {},
        settings: { teamNames, idpOn, auctBudget },
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (error) console.error("saveDraft error:", error);
    } catch (err) {
      console.error("saveDraft exception:", err);
    }
  }

  async function loadDraft() {
    if (!user) return;
    const supabase = createClient();
    try {
      const { data, error } = await supabase.from("drafts").select("*").eq("user_id", user.id).single();
      if (error && error.code !== "PGRST116") console.error("loadDraft error:", error);
      if (!data) return;

      const hasPicks = data.picks && Object.keys(data.picks).length > 0;
      const hasAuctBids = data.auction_bids && Object.keys(data.auction_bids).length > 0;

      if (hasPicks || hasAuctBids) {
        setDraftType(data.draft_type);
        setDraftTeams(data.teams);
        setDraftRounds(data.rounds);
        setYourSlot(data.your_slot);
        setPicks(data.picks || {});
        setPickIndex(Object.keys(data.picks || {}).length);
        setAuctBids(data.auction_bids || {});
        if (data.settings) {
          setTeamNames(data.settings.teamNames || teamNames);
          setIdpOn(data.settings.idpOn || false);
          setAuctBudget(data.settings.auctBudget || 200);
        }
        setDraftStarted(true);
      }
    } catch (err) {
      console.error("loadDraft exception:", err);
    }
  }

  function pickInfo(idx) {
    const round = Math.floor(idx/draftTeams)+1;
    const pos   = idx % draftTeams;
    const team  = (draftType === "snake" && round%2===0) ? (draftTeams-pos) : (pos+1);
    return {round, team};
  }

  // FIX 3: toggleFav now captures isFav before the optimistic state update
  // so the Supabase delete/insert direction is always correct.
  async function toggleFav(id) {
    const isFav = favorites.has(id);
    setFavorites(prev => { const n=new Set(prev); isFav ? n.delete(id) : n.add(id); return n; });
    if (!user) return;
    const supabase = createClient();
    try {
      if (isFav) {
        const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("player_id", id);
        if (error) console.error("toggleFav delete error:", error);
      } else {
        const { error } = await supabase.from("favorites").insert({ user_id: user.id, player_id: id });
        if (error) console.error("toggleFav insert error:", error);
      }
    } catch (err) {
      console.error("toggleFav exception:", err);
    }
  }

  // FIX 4: Removed the broken setTimeout(saveDraft, auctBids) call.
  function draftPlayer(player) {
    if (pickIndex >= totalPicks) return;
    const newPicks = {...picks, [pickIndex]: player};
    setPicks(newPicks);
    setPickIndex(prev => prev+1);
    saveDraft(newPicks, auctBids);
  }

  // FIX 5: undoPick now persists the undo to Supabase.
  function undoPick() {
    if (pickIndex === 0) return;
    const newPicks = {...picks};
    delete newPicks[pickIndex-1];
    setPicks(newPicks);
    setPickIndex(prev => prev-1);
    saveDraft(newPicks, auctBids);
  }

  function resetDraft() {
    setPicks({}); setPickIndex(0); setDraftStarted(false);
    setAuctBids({}); setNomPlayer(null); setAuctNom(1); setCurBid(1); setBidTeam(1);
    saveDraft({}, {});
  }

  function confirmBid() {
    if (!nomPlayer || curBid < 1) return;
    const newBids = {...auctBids, [nomPlayer.id]: {team:bidTeam, amount:curBid}};
    setAuctBids(newBids);
    setNomPlayer(null); setCurBid(1);
    setAuctNom(prev => (prev % draftTeams) + 1);
    setDraftStarted(true);
    saveDraft(picks, newBids);
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

      // Determine stat years — NFL season starts in August
      const currentYear = new Date().getFullYear();
      const currYear = new Date().getMonth() >= 7 ? currentYear : currentYear - 1;
      const prevYear = currYear - 1;
      const projYear = currYear + 1; // projections are for the upcoming season

      // Fetch current stats, previous year stats, and projections all in parallel
      let prevStatsData = {};
      let projData = {};

      await Promise.all([
        // Current season stats
        fetch(`https://api.sleeper.app/v1/stats/nfl/regular/${currYear}`)
          .then(r => r.ok ? r.json() : {})
          .then(d => {
            statsData = d;
            status.stats = { success: true, count: Object.keys(d).length, year: currYear };
          })
          .catch(() => { status.stats = { success: false, error: "Stats unavailable" }; }),

        // Previous season stats (for blending)
        fetch(`https://api.sleeper.app/v1/stats/nfl/regular/${prevYear}`)
          .then(r => r.ok ? r.json() : {})
          .then(d => { prevStatsData = d; })
          .catch(() => {}),

        // Upcoming season projections
        fetch(`https://api.sleeper.app/v1/projections/nfl/regular/${projYear}`)
          .then(r => r.ok ? r.json() : {})
          .then(d => {
            projData = d;
            if (Object.keys(d).length > 0) {
              status.projections = { success: true, count: Object.keys(d).length, year: projYear };
            }
          })
          .catch(() => {}),
      ]);

      setApiStatus(status);
      setRawPlayers(raw);
      setPlayers(buildPlayers(raw, budget, scoring, statsData, numTeams, prevStatsData, projData, adpData, byeData, playerInfoData, tank01Proj));
      setStatsData(statsData);
      setPrevStatsData(prevStatsData);
      setProjData(projData);
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
      <button onClick={() => {
        const newTheme = dk ? "light" : "dark";
        setTheme(newTheme);
        saveSettings({ theme: newTheme, scoring, budget, num_teams: numTeams });
      }}
        style={{position:"fixed",top:12,right:12,zIndex:50,padding:isMobile?"8px":"10px",borderRadius:12,border:"none",cursor:"pointer",background:C.themeBtnBg,color:C.themeBtnCol,boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
        {dk ? <Sun size={18}/> : <Moon size={18}/>}
      </button>

      <button onClick={() => setShowSettings(true)}
        style={{position:"fixed",top:12,right:isMobile?52:64,zIndex:50,padding:isMobile?"8px":"10px",borderRadius:12,border:"none",cursor:"pointer",background:C.themeBtnBg,color:C.settBtnCol,boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
        <Settings size={18}/>
      </button>

      {/* Auth button */}
      {user ? (
        <button onClick={handleSignOut}
          style={{position:"fixed",top:12,right:isMobile?92:112,zIndex:50,padding:isMobile?"8px":"10px",borderRadius:12,border:"none",cursor:"pointer",background:C.themeBtnBg,color:C.textSec,boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
          <LogOut size={18}/>
        </button>
      ) : (
        <button onClick={() => setShowAuth(true)}
          style={{position:"fixed",top:12,right:isMobile?92:112,zIndex:50,padding:isMobile?"8px":"10px",borderRadius:12,border:"none",cursor:"pointer",background:C.themeBtnBg,color:C.textSec,boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
          <LogIn size={18}/>
        </button>
      )}

      {/* Floating bug report button — bottom right, always visible */}
      <button
        onClick={() => setShowBugReport(true)}
        title="Report a bug"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: isMobile ? "12px" : "10px 16px",
          borderRadius: isMobile ? "50%" : 12,
          border: "1px solid rgba(239,68,68,0.3)",
          cursor: "pointer",
          background: "rgba(239,68,68,0.1)",
          color: "#f87171",
          boxShadow: "0 4px 16px rgba(239,68,68,0.2)",
          fontSize: 13,
          fontWeight: 700,
          backdropFilter: "blur(8px)",
          transition: "background 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "rgba(239,68,68,0.2)";
          e.currentTarget.style.boxShadow  = "0 4px 24px rgba(239,68,68,0.35)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "rgba(239,68,68,0.1)";
          e.currentTarget.style.boxShadow  = "0 4px 16px rgba(239,68,68,0.2)";
        }}
      >
        <Bug size={isMobile ? 20 : 16} />
        {!isMobile && "Report Bug"}
      </button>

      <div style={{maxWidth:1280,margin:"0 auto",padding:isMobile?"72px 16px 32px":"32px 16px"}}>

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
                setPlayers(buildPlayers(rawPlayers, budget, s.key, statsData, numTeams, prevStatsData, projData, adpData, byeData, playerInfoData, tank01Proj));
                saveSettings({ theme, scoring: s.key, budget, num_teams: numTeams });
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
            <button onClick={() => setActiveTab("capsheet")} style={tabBtn(activeTab==="capsheet","linear-gradient(135deg,#10b981,#0d9488)",C)}>
              <DollarSign size={15}/> CAP SHEET
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
            capCeiling={capCeiling}
            numTeams={numTeams}
            newsItems={newsItems}
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
        {activeTab === "capsheet" && (
          <CapSheetTab
            C={C}
            players={players}
            user={user}
            capCeiling={capCeiling}
            setCapCeiling={setCapCeiling}
          />
        )}
      </div>

      {/* Modals */}
      <PlayerModal C={C} player={selPlayer} favorites={favorites} toggleFav={toggleFav} onClose={() => setSelPlayer(null)} capCeiling={capCeiling}/>
      <SettingsModal
        C={C} budget={budget} setBudget={setBudget}
        numTeams={numTeams} setNumTeams={setNumTeams}
        onClose={() => setShowSettings(false)}
        showSettings={showSettings}
        onSave={(newBudget, newNumTeams) => {
          setPlayers(buildPlayers(rawPlayers, newBudget, scoring, statsData, newNumTeams, prevStatsData, projData, adpData, byeData, playerInfoData, tank01Proj));
          saveSettings({ theme, scoring, budget: newBudget, num_teams: newNumTeams });
        }}
      />
      {showAuth && <AuthModal C={C} onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)}/>}
      {showBugReport && <BugReportModal C={C} user={user} onClose={() => setShowBugReport(false)} />}

      <style>{"@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.5} } @keyframes spin { to { transform: rotate(360deg); } } *{box-sizing:border-box} body{margin:0}"}</style>
    </div>
  );
}
