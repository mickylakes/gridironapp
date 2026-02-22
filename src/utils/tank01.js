// ─────────────────────────────────────────────────────────────────────────────
// Tank01 NFL API — SERVER-SIDE ONLY
// Never import this file from client components.
// All client code must go through /api/tank01 route instead.
// ─────────────────────────────────────────────────────────────────────────────
import { createClient } from "@supabase/supabase-js";

const TANK01_HOST = "tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com";
const BASE_URL    = `https://${TANK01_HOST}`;

const ADP_TTL_MS  = 24 * 60 * 60 * 1000; // refresh once per day
const NEWS_TTL_MS =  2 * 60 * 60 * 1000; // refresh every 2 hours

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
