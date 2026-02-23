#!/usr/bin/env node
/**
 * Pre-fetches historical NFL weekly stats + schedule data and writes static JSON files.
 * Run once after each season ends:  npm run fetch-stats
 *
 * Output: public/data/weeklyStats_{year}.json  (one file per year)
 * Structure:
 *   {
 *     "players":  { "playerId": [{ "week": 1, "stats": {...} }, ...] },
 *     "schedule": { "1": { "BUF": "MIA", "MIA": "BUF", ... }, ... }
 *   }
 */

const fs   = require("fs");
const path = require("path");

// Covers the 5 years shown in the PlayerModal history tab
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 1 - i);
const WEEKS = Array.from({ length: 18 }, (_, i) => i + 1);

// ESPN team slugs (lowercase) for all 32 NFL teams
const NFL_TEAMS = [
  "buf", "mia", "ne",  "nyj",  // AFC East
  "bal", "cle", "pit", "cin",  // AFC North
  "hou", "ind", "jax", "ten",  // AFC South
  "kc",  "lv",  "lac", "den",  // AFC West
  "dal", "phi", "nyg", "wsh",  // NFC East
  "chi", "det", "gb",  "min",  // NFC North
  "atl", "car", "no",  "tb",   // NFC South
  "ari", "lar", "sf",  "sea",  // NFC West
];

// ESPN abbreviations that differ from Sleeper's — store both so lookup works either way
const TEAM_ALIASES = {
  LAR: ["LA"],   // Rams: ESPN uses LAR, Sleeper uses LA
  WSH: ["WAS"],  // Washington: ESPN uses WSH, Sleeper may use WAS
  JAC: ["JAX"],  // Jacksonville: ESPN sometimes uses JAC
};

// Only keep fields we actually render — keeps file size small
const KEEP_FIELDS = new Set([
  "pts_half_ppr", "pts_ppr", "pts_std",
  "pass_yd", "pass_td", "pass_int", "pass_cmp", "pass_att",
  "rush_yd", "rush_att", "rush_td",
  "rec", "rec_yd", "rec_td", "rec_tgt",
  "fgm", "fga", "xpm",
  "idp_tkl", "idp_tkl_ast", "idp_sack", "idp_qb_hit",
  "idp_int", "idp_pd", "idp_ff", "idp_fum_rec",
  "gp",
]);

function filterStats(stats) {
  const out = {};
  for (const key of KEEP_FIELDS) {
    if (stats[key] != null && stats[key] !== 0) out[key] = stats[key];
  }
  return out;
}

// Fetch all 32 team schedules in parallel, build week→team→opponent map
async function fetchESPNYearSchedule(year) {
  const teamEvents = await Promise.all(
    NFL_TEAMS.map(async (slug) => {
      try {
        const res = await fetch(
          `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${slug}/schedule?season=${year}&seasontype=2`
        );
        if (!res.ok) return [];
        const data = await res.json();
        return data.events || [];
      } catch {
        return [];
      }
    })
  );

  const schedule = {}; // { weekStr: { teamAbv: opponentAbv, ... } }
  for (const events of teamEvents) {
    for (const event of events) {
      const weekNum = event.week?.number;
      if (!weekNum) continue;
      const weekStr     = String(weekNum);
      const competitors = event.competitions?.[0]?.competitors || [];
      if (competitors.length !== 2) continue;

      const [a, b] = competitors
        .map(c => c.team?.abbreviation?.toUpperCase())
        .filter(Boolean);
      if (!a || !b) continue;

      if (!schedule[weekStr]) schedule[weekStr] = {};

      // Store primary abbreviation
      schedule[weekStr][a] = b;
      schedule[weekStr][b] = a;

      // Store any Sleeper-format aliases so player.team lookup always works
      for (const [espn, aliases] of Object.entries(TEAM_ALIASES)) {
        if (a === espn) aliases.forEach(alias => { schedule[weekStr][alias] = b; });
        if (b === espn) aliases.forEach(alias => { schedule[weekStr][alias] = a; });
      }
    }
  }

  return schedule;
}

async function fetchSleeperWeek(year, week) {
  try {
    const res = await fetch(`https://api.sleeper.app/v1/stats/nfl/regular/${year}/${week}`);
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

async function processYear(year) {
  console.log(`\nProcessing ${year}...`);

  // Fetch full-season schedule from ESPN (32 parallel requests)
  process.stdout.write("  Fetching ESPN schedule... ");
  const schedule  = await fetchESPNYearSchedule(year);
  const weekCount = Object.keys(schedule).length;
  const gameCount = Object.values(schedule).reduce(
    (sum, w) => sum + Object.keys(w).length / 2, 0
  );
  console.log(`${Math.round(gameCount)} games across ${weekCount} weeks`);

  // Fetch Sleeper stats week by week
  const players = {};
  for (const week of WEEKS) {
    process.stdout.write(`  Week ${week}... `);
    const sleeperData = await fetchSleeperWeek(year, week);

    let playerCount = 0;
    for (const [playerId, stats] of Object.entries(sleeperData)) {
      const filtered = filterStats(stats);
      // Skip if no meaningful stats (only gp, or truly empty)
      if (Object.keys(filtered).filter(k => k !== "gp").length === 0) continue;
      if (!players[playerId]) players[playerId] = [];
      players[playerId].push({ week, stats: filtered });
      playerCount++;
    }
    console.log(`${playerCount} players`);

    // Small delay to be polite to Sleeper's servers
    await new Promise(r => setTimeout(r, 200));
  }

  return { players, schedule };
}

async function main() {
  const outDir = path.join(process.cwd(), "public", "data");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const year of YEARS) {
    const data    = await processYear(year);
    const outPath = path.join(outDir, `weeklyStats_${year}.json`);
    const json    = JSON.stringify(data);
    fs.writeFileSync(outPath, json);
    const sizeKB  = (Buffer.byteLength(json) / 1024).toFixed(1);
    console.log(`  → Wrote ${outPath} (${sizeKB} KB, ${Object.keys(data.players).length} players)`);
  }

  console.log("\nAll done! Commit the files in public/data/ to the repo.");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
