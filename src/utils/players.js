export const SAMPLES = [
  {player_id:"4866",first_name:"Patrick",last_name:"Mahomes",position:"QB",team:"KC",age:29,number:"15",years_exp:7,active:true},
  {player_id:"4881",first_name:"Josh",last_name:"Allen",position:"QB",team:"BUF",age:28,number:"17",years_exp:6,active:true},
  {player_id:"6797",first_name:"Lamar",last_name:"Jackson",position:"QB",team:"BAL",age:27,number:"8",years_exp:6,active:true},
  {player_id:"5850",first_name:"Jalen",last_name:"Hurts",position:"QB",team:"PHI",age:26,number:"1",years_exp:4,active:true},
  {player_id:"7553",first_name:"Joe",last_name:"Burrow",position:"QB",team:"CIN",age:27,number:"9",years_exp:4,active:true},
  {player_id:"6770",first_name:"Dak",last_name:"Prescott",position:"QB",team:"DAL",age:31,number:"4",years_exp:8,active:true},
  {player_id:"4984",first_name:"Christian",last_name:"McCaffrey",position:"RB",team:"SF",age:28,number:"23",years_exp:7,active:true},
  {player_id:"7562",first_name:"Breece",last_name:"Hall",position:"RB",team:"NYJ",age:23,number:"20",years_exp:2,active:true},
  {player_id:"8137",first_name:"Bijan",last_name:"Robinson",position:"RB",team:"ATL",age:22,number:"7",years_exp:1,active:true},
  {player_id:"6945",first_name:"Tony",last_name:"Pollard",position:"RB",team:"TEN",age:27,number:"20",years_exp:5,active:true},
  {player_id:"7601",first_name:"Jahmyr",last_name:"Gibbs",position:"RB",team:"DET",age:22,number:"26",years_exp:1,active:true},
  {player_id:"7610",first_name:"De'Von",last_name:"Achane",position:"RB",team:"MIA",age:23,number:"28",years_exp:1,active:true},
  {player_id:"7547",first_name:"Ja'Marr",last_name:"Chase",position:"WR",team:"CIN",age:24,number:"1",years_exp:3,active:true},
  {player_id:"7565",first_name:"Justin",last_name:"Jefferson",position:"WR",team:"MIN",age:25,number:"18",years_exp:4,active:true},
  {player_id:"6794",first_name:"Tyreek",last_name:"Hill",position:"WR",team:"MIA",age:30,number:"10",years_exp:8,active:true},
  {player_id:"5012",first_name:"Davante",last_name:"Adams",position:"WR",team:"LV",age:31,number:"17",years_exp:10,active:true},
  {player_id:"7578",first_name:"Amon-Ra",last_name:"St. Brown",position:"WR",team:"DET",age:24,number:"14",years_exp:3,active:true},
  {player_id:"7596",first_name:"Puka",last_name:"Nacua",position:"WR",team:"LAR",age:23,number:"17",years_exp:1,active:true},
  {player_id:"6787",first_name:"Travis",last_name:"Kelce",position:"TE",team:"KC",age:35,number:"87",years_exp:11,active:true},
  {player_id:"7568",first_name:"Sam",last_name:"LaPorta",position:"TE",team:"DET",age:23,number:"80",years_exp:1,active:true},
  {player_id:"6804",first_name:"Mark",last_name:"Andrews",position:"TE",team:"BAL",age:29,number:"89",years_exp:6,active:true},
  {player_id:"7602",first_name:"Trey",last_name:"McBride",position:"TE",team:"ARI",age:24,number:"85",years_exp:2,active:true},
  {player_id:"8200",first_name:"Jake",last_name:"Moody",position:"K",team:"SF",age:24,number:"4",years_exp:1,active:true},
  {player_id:"4046",first_name:"Justin",last_name:"Tucker",position:"K",team:"BAL",age:34,number:"9",years_exp:11,active:true},
  {player_id:"7603",first_name:"Evan",last_name:"McPherson",position:"K",team:"CIN",age:24,number:"2",years_exp:3,active:true},
  {player_id:"9001",first_name:"SF",last_name:"Defense",position:"DEF",team:"SF",age:28,number:"0",years_exp:5,active:true},
  {player_id:"9002",first_name:"DAL",last_name:"Defense",position:"DEF",team:"DAL",age:28,number:"0",years_exp:5,active:true},
  {player_id:"9003",first_name:"BAL",last_name:"Defense",position:"DEF",team:"BAL",age:28,number:"0",years_exp:5,active:true},
  {player_id:"9004",first_name:"BUF",last_name:"Defense",position:"DEF",team:"BUF",age:28,number:"0",years_exp:5,active:true},
];

export function fantasyPos(p) {
  if (["QB","RB","WR","TE","K"].includes(p.position)) return p.position;
  if (p.position === "DEF") return "DEF";
  if (["DE","DT","NT"].includes(p.position)) return "DL";
  if (["LB","ILB","OLB","MLB"].includes(p.position)) return "LB";
  if (["CB","S","DB","SS","FS"].includes(p.position)) return "DB";
  return null;
}

// Recalibrated to 2024 scoring reality (Lamar led QBs ~430, CMC led RBs ~380, Chase led WRs ~350)
export function getTier(pos, pts) {
  const thresholds = {
    QB:  [400, 340, 280, 220],
    RB:  [300, 230, 160, 100],
    WR:  [300, 230, 160, 100],
    TE:  [180, 140, 100,  65],
    K:   [145, 130, 115, 100],
    DEF: [150, 135, 120, 105],
    DL:  [160, 140, 120, 100],
    LB:  [165, 145, 125, 105],
    DB:  [145, 125, 105,  85],
  }[pos] || [200, 160, 120, 80];
  if (pts >= thresholds[0]) return 1;
  if (pts >= thresholds[1]) return 2;
  if (pts >= thresholds[2]) return 3;
  if (pts >= thresholds[3]) return 4;
  return 5;
}

export function auctionVal(pts, pos, budget, totalTeams) {
  const sc = {
    QB: 0.85, RB: 1.4, WR: 1.1, TE: 1.15,
    K: 0.2, DEF: 0.3, DL: 0.4, LB: 0.5, DB: 0.4,
  }[pos] || 1.0;
  const leagueMod = totalTeams ? totalTeams / 12 : 1;
  return Math.max(1, Math.round(
    Math.min((pts / 10) * sc * (budget / 200) * leagueMod, budget * 0.4)
  ));
}

export function dynastyAuctionVal(pts, pos, age, budget) {
  const base = auctionVal(pts, pos, budget, 12);
  const am = age < 23 ? 1.6 : age < 25 ? 1.35 : age < 27 ? 1.1 : age < 29 ? 0.9 : age < 31 ? 0.6 : 0.35;
  const pm = { QB:1.15, RB:0.75, WR:1.05, TE:1.05, K:0.3, DEF:0.4 }[pos] || 1.0;
  return Math.max(1, Math.round(base * am * pm));
}

/**
 * Estimate points for players with no real stats.
 * Uses depth chart order to differentiate starters from backups.
 *   depthOrder 1 = starter (full estimate)
 *   depthOrder 2 = clear backup (~45%)
 *   depthOrder 3+ = depth (~20%)
 *   null = unknown (65% — assume some role)
 */
export function estimatePoints(pos, scoring, age, exp, depthOrder = null) {
  // Full-season baseline for a healthy starter — calibrated to 2023/2024 averages
  const base = {
    QB:  { ppr: 310, half: 305, std: 298 },
    RB:  { ppr: 185, half: 168, std: 152 },
    WR:  { ppr: 175, half: 158, std: 140 },
    TE:  { ppr: 125, half: 113, std: 100 },
    K:   { ppr: 115, half: 115, std: 115 },
    DEF: { ppr: 120, half: 120, std: 120 },
    DL:  { ppr: 125, half: 125, std: 125 },
    LB:  { ppr: 135, half: 135, std: 135 },
    DB:  { ppr: 115, half: 115, std: 115 },
  }[pos] || { ppr: 80, half: 80, std: 80 };

  let pts = base[scoring] || base.ppr;

  // Age curve — peak varies by position
  const ageMod = age < 23 ? 0.88
    : age < 25 ? 0.96
    : age < 28 ? 1.0
    : age < 31 ? 0.91
    : 0.78;

  // Experience curve — rookies and veterans both decline slightly
  const expMod = exp === 0 ? 0.82
    : exp === 1 ? 0.92
    : exp < 5  ? 1.0
    : exp < 9  ? 0.96
    : 0.88;

  // Depth chart scaling — biggest improvement in accuracy
  const depthMod = depthOrder === 1 ? 1.0
    : depthOrder === 2 ? 0.45
    : depthOrder === 3 ? 0.20
    : depthOrder >= 4  ? 0.10
    : 0.65; // unknown role

  return Math.max(15, Math.round(pts * ageMod * expMod * depthMod));
}

/**
 * Blend two seasons of stats weighted by games played.
 * More recent season gets 65% weight, prior season gets 35%.
 * Games-played scaling brings partial seasons to full-season equivalent.
 */
function blendStats(curr, prev, scoreKey) {
  const NFL_GAMES = 17;

  const currPts = curr?.[scoreKey] || 0;
  const currGp  = curr?.gp || curr?.gms_active || 0;
  const prevPts = prev?.[scoreKey] || 0;
  const prevGp  = prev?.gp || prev?.gms_active || 0;

  // Scale each season to full 17 games to avoid penalising injury absences
  const currScaled = currGp > 4  ? (currPts / currGp) * NFL_GAMES : 0;
  const prevScaled = prevGp > 4  ? (prevPts / prevGp) * NFL_GAMES : 0;

  if (currScaled > 0 && prevScaled > 0) {
    // Both seasons available — weight recent more heavily
    return Math.round(currScaled * 0.65 + prevScaled * 0.35);
  }
  if (currScaled > 0) return Math.round(currScaled);
  if (prevScaled > 0) return Math.round(prevScaled * 0.85); // older data, slight discount
  return 0;
}

export function buildPlayers(raw, budget, scoring = "ppr", statsData = {}, totalTeams = 12, prevStatsData = {}, projData = {}) {
  const scoreKey    = scoring === "std" ? "pts_std" : scoring === "half" ? "pts_half_ppr" : "pts_ppr";
  const dynastyKey  = "pts_half_ppr";
  const projKey     = scoreKey; // projections use the same keys

  return raw.map(p => {
    const pos = fantasyPos(p);
    if (!pos) return null;

    const curr = statsData[p.player_id]    || null;
    const prev = prevStatsData[p.player_id] || null;
    const proj = projData[p.player_id]     || null;

    const depthOrder = p.depth_chart_order ? Number(p.depth_chart_order) : null;

    // ── Redraft points ──────────────────────────────────────────────
    // Priority: 1) Sleeper projection  2) blended 2-yr stats  3) estimate
    let rpts = 0;
    let hasRealStats = false;

    const projPts = proj?.[projKey] || 0;
    const blended = blendStats(curr, prev, scoreKey);

    if (projPts > 20) {
      // Projections are the most forward-looking — use as primary
      // Blend slightly with historical to smooth outliers: 60% proj / 40% history
      rpts = blended > 20
        ? Math.round(projPts * 0.6 + blended * 0.4)
        : Math.round(projPts);
      hasRealStats = true;
    } else if (blended > 20) {
      rpts = blended;
      hasRealStats = true;
    } else {
      // No usable data — fall back to depth-chart-aware estimate
      rpts = estimatePoints(pos, scoring, p.age || 25, p.years_exp || 0, depthOrder);
      hasRealStats = false;
    }

    // ── Dynasty points ──────────────────────────────────────────────
    // Dynasty uses half-PPR blended over 2 years, then applies age+position curve
    // separately from redraft so age matters more than raw output
    let dpts = 0;
    const dynBlended = blendStats(curr, prev, dynastyKey);
    const dynProj    = proj?.[dynastyKey] || 0;

    let dynBase = 0;
    if (dynProj > 20) {
      dynBase = dynBlended > 20
        ? Math.round(dynProj * 0.6 + dynBlended * 0.4)
        : Math.round(dynProj);
    } else if (dynBlended > 20) {
      dynBase = dynBlended;
    } else {
      dynBase = estimatePoints(pos, "half", p.age || 25, p.years_exp || 0, depthOrder);
    }

    // Age multiplier applied independently — young players get a dynasty premium
    // even if their current output is low (rookie RB with starter role, etc.)
    const age = p.age || 25;
    const ageMulti = age < 22 ? 1.35
      : age < 24 ? 1.2
      : age < 26 ? 1.05
      : age < 28 ? 1.0
      : age < 30 ? 0.88
      : age < 32 ? 0.72
      : 0.50;

    // Position longevity multiplier (RBs age out faster)
    const posMulti = { QB:1.1, RB:0.82, WR:1.0, TE:1.05, K:0.5, DEF:0.5 }[pos] || 1.0;

    dpts = Math.max(15, Math.round(dynBase * ageMulti * posMulti));

    return {
      id: p.player_id,
      name: (p.first_name || "") + " " + (p.last_name || ""),
      team: p.team || "FA",
      position: pos,
      age,
      number: p.number,
      yearsExp: p.years_exp || 0,
      redraftPoints: rpts,
      dynastyPoints: dpts,
      tier: getTier(pos, rpts),
      auctionValue: auctionVal(rpts, pos, budget, totalTeams),
      dynastyAuctionValue: dynastyAuctionVal(dpts, pos, age, budget),
      hasRealStats,
      hasProjection: projPts > 20,
      scoring,
      status: p.status || null,
      injuryStatus: p.injury_status || null,
      injuryBodyPart: p.injury_body_part || null,
      injuryNotes: p.injury_notes || null,
      depthChartOrder: depthOrder,
      depthChartPosition: p.depth_chart_position || null,
      college: p.college || null,
      height: p.height || null,
      weight: p.weight || null,
    };
  }).filter(Boolean)
    .filter(p => p.team && p.team !== "FA" && p.team !== "")
    .filter(p => {
      // Filter out very low-scoring players who clearly have no fantasy role
      const minPts = {
        QB: 100, RB: 30, WR: 30, TE: 25, K: 60, DEF: 60, DL: 20, LB: 20, DB: 20,
      }[p.position] || 20;
      return p.redraftPoints >= minPts;
    });
}
