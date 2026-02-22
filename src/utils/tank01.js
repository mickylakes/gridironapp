// ─────────────────────────────────────────────────────────────────────────────
// Tank01 NFL API — SERVER-SIDE ONLY
// Never import this file from client components.
// All client code must go through /api/tank01 route instead.
// ─────────────────────────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

const TANK01_HOST = "tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com";
const BASE_URL    = `https://${TANK01_HOST}`;

const ADP_TTL_MS        = 24 * 60 * 60 * 1000; // refresh once per day
const NEWS_TTL_MS       =  2 * 60 * 60 * 1000; // refresh every 2 hours
const BYE_TTL_MS        = 24 * 60 * 60 * 1000; // bye weeks stable day-to-day
const PLAYERINFO_TTL_MS =  6 * 60 * 60 * 1000; // injury status can change day-to-day
const PROJ_TTL_MS       = 24 * 60 * 60 * 1000; // season projections stable day-to-day

// ── Supabase (server-side, anon key is fine since api_cache has RLS disabled) ─
function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function getCached(key) {
  try {
    const { data } = await db()
      .from("api_cache")
      .select("data, updated_at")
      .eq("key", key)
      .single();
    return data ?? null;
  } catch {
    return null;
  }
}

async function setCache(key, data) {
  try {
    await db()
      .from("api_cache")
      .upsert({ key, data, updated_at: new Date().toISOString() }, { onConflict: "key" });
  } catch (err) {
    console.error("[tank01] api_cache write error:", err);
  }
}

async function tank01Fetch(path, params = {}) {
  const key = process.env.TANK01_API_KEY;
  if (!key) throw new Error("TANK01_API_KEY env var is not set");

  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      "x-rapidapi-key":  key,
      "x-rapidapi-host": TANK01_HOST,
    },
    cache: "no-store", // bypass Next.js fetch cache — we handle caching ourselves
  });

  if (!res.ok) throw new Error(`Tank01 ${path} returned ${res.status}`);
  return res.json();
}

// ── ADP ──────────────────────────────────────────────────────────────────────
// Returns a normalized flat array: [{ playerID, longName, team, pos, adp }, ...]
export async function getAdp() {
  const cached = await getCached("adp");
  if (cached && Date.now() - new Date(cached.updated_at).getTime() < ADP_TTL_MS) {
    return cached.data;
  }

  try {
    const json = await tank01Fetch("/getNFLADP", { adpType: "halfPPR" });
    const raw  = json?.body?.adpList ?? json?.body ?? json?.adpList ?? json ?? [];
    const list = Array.isArray(raw) ? raw : Object.values(raw);

    const normalized = list.map(p => ({
      playerID: p.playerID || "",
      longName: p.longName || p.playerName || p.name || "",
      team:     p.team     || p.nflTeam    || "",
      pos:      p.pos      || p.position   || "",
      adp:      parseFloat(p.overallADP || p.adp || p.averageDraftPosition || 0) || null,
    })).filter(p => p.adp);

    await setCache("adp", normalized);
    return normalized;
  } catch (err) {
    console.error("[tank01] getAdp error:", err);
    // Return stale cache on error rather than crashing
    return cached?.data ?? [];
  }
}

// ── Bye Weeks ────────────────────────────────────────────────────────────────
// Returns a map: { [teamAbv]: byeWeek } e.g. { ARI: 11, ATL: 7, ... }
// Only available in-season (weeks 1-18). Returns {} in offseason.
export async function getByeWeeks() {
  const cached = await getCached("bye");
  if (cached && Date.now() - new Date(cached.updated_at).getTime() < BYE_TTL_MS) {
    return cached.data;
  }

  try {
    const json = await tank01Fetch("/getNFLByeWeeks", { season: String(new Date().getFullYear()) });
    // Response shape: { body: { ARI: 11, ATL: 7, ... } } or similar
    const body   = json?.body ?? json ?? {};
    const result = {};

    if (typeof body === "object" && !Array.isArray(body)) {
      Object.entries(body).forEach(([key, val]) => {
        const bye = parseInt(val?.byeWeek ?? val?.bye ?? val ?? 0, 10) || null;
        if (key && bye) result[key] = bye;
      });
    }

    await setCache("bye", result);
    return result;
  } catch (err) {
    console.error("[tank01] getByeWeeks error:", err);
    return cached?.data ?? {};
  }
}

// ── Player Info ───────────────────────────────────────────────────────────────
// Fetches per-team rosters (32 calls, cached 6h) to get injury status + bye week
// for all rostered players. Falls back to Sleeper data if unavailable.
export async function getPlayerInfo() {
  const cached = await getCached("playerinfo");
  if (cached && Date.now() - new Date(cached.updated_at).getTime() < PLAYERINFO_TTL_MS) {
    return cached.data;
  }

  try {
    // Get all team abbreviations first
    const teamsJson = await tank01Fetch("/getNFLTeams");
    const teamsList = teamsJson?.body ?? teamsJson ?? {};
    const teams     = Array.isArray(teamsList) ? teamsList : Object.values(teamsList);
    const teamAbvs  = teams.map(t => t.teamAbv || t.abbr).filter(Boolean);

    // Fetch each team's roster in parallel (32 calls)
    const rosters = await Promise.all(
      teamAbvs.map(abv =>
        tank01Fetch("/getNFLTeamRoster", { teamAbv: abv })
          .then(r => r?.body?.roster ?? r?.body ?? [])
          .catch(() => [])
      )
    );

    const normalized = rosters.flat().map(p => ({
      playerID:       p.playerID      || p.id              || "",
      longName:       p.longName      || p.playerName      || p.name || "",
      team:           p.team          || p.nflTeam          || "",
      pos:            p.pos           || p.position         || "",
      injuryStatus:   p.injury        || p.injuryStatus     || p.injuryDesignation || null,
      injuryBodyPart: p.injuryBodyPart|| p.injury_body_part || null,
      injuryNotes:    p.injuryNotes   || p.injury_notes     || p.injuryDescription || null,
      byeWeek:        parseInt(p.byeWeek || p.bye || p.byeWeekNumber || 0, 10) || null,
    })).filter(p => p.playerID || p.longName);

    await setCache("playerinfo", normalized);
    return normalized;
  } catch (err) {
    console.error("[tank01] getPlayerInfo error:", err);
    return cached?.data ?? [];
  }
}

// ── Projections ───────────────────────────────────────────────────────────────
// Returns normalized array: [{ playerID, longName, fantasyPoints }, ...]
export async function getProjections() {
  const cached = await getCached("projections");
  if (cached && Date.now() - new Date(cached.updated_at).getTime() < PROJ_TTL_MS) {
    return cached.data;
  }

  try {
    const json = await tank01Fetch("/getNFLProjections", {
      week:    "1",       // Week 1 preseason projection — will be empty in offseason
      season:  String(new Date().getFullYear()),
      scoring: "halfPPR",
    });
    const raw  = json?.body?.projections ?? json?.body ?? json?.projections ?? json ?? [];
    const list = Array.isArray(raw) ? raw : Object.values(raw);

    const normalized = list.map(p => ({
      playerID:     p.playerID     || p.id          || "",
      longName:     p.longName     || p.playerName  || p.name || "",
      fantasyPoints: parseFloat(
        p.fantasyPoints || p.fantasyPts || p.projectedPoints || p.pts || 0
      ) || null,
    })).filter(p => p.fantasyPoints);

    await setCache("projections", normalized);
    return normalized;
  } catch (err) {
    console.error("[tank01] getProjections error:", err);
    return cached?.data ?? [];
  }
}

// ── News ─────────────────────────────────────────────────────────────────────
// Returns a normalized flat array: [{ title, description, link, date, playerName }, ...]
export async function getNews() {
  const cached = await getCached("news");
  if (cached && Date.now() - new Date(cached.updated_at).getTime() < NEWS_TTL_MS) {
    return cached.data;
  }

  try {
    const json = await tank01Fetch("/getNFLNews");
    const raw  = json?.body?.news ?? json?.body ?? json?.news ?? json ?? [];
    const list = Array.isArray(raw) ? raw : Object.values(raw);

    const normalized = list.slice(0, 50).map(n => ({
      title:       n.title       || n.headline    || "",
      description: n.description || n.content     || "",
      link:        n.link        || n.url          || "",
      date:        n.date        || n.published    || n.time || "",
      playerName:  n.playerName  || n.player       || "",
    })).filter(n => n.title);

    await setCache("news", normalized);
    return normalized;
  } catch (err) {
    console.error("[tank01] getNews error:", err);
    return cached?.data ?? [];
  }
}
