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

// ─────────────────────────────────────────────────────────────────────────────
// IDP SCORING
// IDP players don't have pts_ppr/pts_std keys in Sleeper stats — those fields
// are blank/0 for defensive players. Points must be computed from raw idp_* keys.
// These weights match Sleeper's most common standard IDP scoring preset.
// ─────────────────────────────────────────────────────────────────────────────
export const IDP_POSITIONS = ["DL", "LB", "DB"];

const IDP_SCORING = {
  idp_tkl:      1.0,   // solo tackle
  idp_tkl_ast:  0.5,   // assisted tackle
  idp_tkl_loss: 1.0,   // tackle for loss (stacks with tackle)
  idp_qb_hit:   1.0,   // QB hit (stacks with sack)
  idp_sack:     4.0,   // sack (also counts as tackle + qb_hit + tkl_loss in Sleeper)
  idp_int:      6.0,   // interception
  idp_pd:       1.0,   // pass deflection
  idp_ff:       3.0,   // forced fumble
  idp_fum_rec:  3.0,   // fumble recovery
  idp_def_td:   6.0,   // defensive touchdown
  idp_safe:     2.0,   // safety
};

/**
 * Compute IDP fantasy points from a raw Sleeper stats object.
 * Export this so PlayerModal can use it for history tab display.
 */
export function calcIdpPoints(stats) {
  if (!stats) return 0;
  let pts = 0;
  for (const [key, val] of Object.entries(IDP_SCORING)) {
    pts += (stats[key] || 0) * val;
  }
  return Math.round(pts * 10) / 10;
}

// ─────────────────────────────────────────────────────────────────────────────
// TIERS — calibrated to real 2024 scoring levels
// LBs score highest (volume tackles), DL next (sack bonus), DBs lowest
// ─────────────────────────────────────────────────────────────────────────────
export function getTier(pos, pts) {
  const thresholds = {
    QB:  [400, 340, 280, 220],
    RB:  [300, 230, 160, 100],
    WR:  [300, 230, 160, 100],
    TE:  [180, 140, 100,  65],
    K:   [145, 130, 115, 100],
    DEF: [150, 135, 120, 105],
    DL:  [180, 145, 110,  75],
    LB:  [220, 175, 130,  90],
    DB:  [160, 125,  90,  60],
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
    K: 0.2, DEF: 0.3,
    DL: 0.45, LB: 0.55, DB: 0.40,
  }[pos] || 1.0;
  const leagueMod = totalTeams ? totalTeams / 12 : 1;
  return Math.max(1, Math.round(
    Math.min((pts / 10) * sc * (budget / 200) * leagueMod, budget * 0.4)
  ));
}

export function dynastyAuctionVal(pts, pos, budget) {
  // pts is already dynasty-adjusted (age + positional longevity baked in via buildPlayers).
  // Just convert to $ using position scarcity — no second age multiplier needed.
  return Math.max(1, auctionVal(pts, pos, budget, 12));
}

// ─────────────────────────────────────────────────────────────────────────────
// ESTIMATION — fallback for players with no real stats
// IDP baselines: LB starter ~185 pts, DL starter ~150, DB starter ~120
// Depth chart order is critical for IDP — backups have nearly zero value
// ─────────────────────────────────────────────────────────────────────────────
export function estimatePoints(pos, scoring, age, exp, depthOrder = null) {
  const base = {
    QB:  { ppr: 310, half: 305, std: 298 },
    RB:  { ppr: 185, half: 168, std: 152 },
    WR:  { ppr: 175, half: 158, std: 140 },
    TE:  { ppr: 125, half: 113, std: 100 },
    K:   { ppr: 115, half: 115, std: 115 },
    DEF: { ppr: 120, half: 120, std: 120 },
    // IDP scoring doesn't vary by PPR/std — same defensive stat keys either way
    DL:  { ppr: 150, half: 150, std: 150 },
    LB:  { ppr: 185, half: 185, std: 185 },
    DB:  { ppr: 120, half: 120, std: 120 },
  }[pos] || { ppr: 80, half: 80, std: 80 };

  let pts = base[scoring] || base.ppr;

  const ageMod = age < 23 ? 0.88 : age < 25 ? 0.96 : age < 28 ? 1.0 : age < 31 ? 0.91 : 0.78;
  const expMod = exp === 0 ? 0.82 : exp === 1 ? 0.92 : exp < 5 ? 1.0 : exp < 9 ? 0.96 : 0.88;

  // Depth chart matters even more for IDP — a backup LB gets almost no snaps
  const depthMod = depthOrder === 1 ? 1.0
    : depthOrder === 2 ? 0.40
    : depthOrder === 3 ? 0.15
    : depthOrder >= 4  ? 0.08
    : 0.55; // unknown role — conservative default for IDP

  return Math.max(15, Math.round(pts * ageMod * expMod * depthMod));
}

// Positional average baselines for confidence regression (full-season PPR starters)
const POS_BASELINE = {
  QB:295, RB:175, WR:165, TE:118, K:115, DEF:130, DL:150, LB:185, DB:120,
};

// ─────────────────────────────────────────────────────────────────────────────
// STAT BLENDING — 2-year weighted average with confidence-based regression
//
// Problem with raw per-game scaling: a player who goes 8 games / 180pts gets
// extrapolated to 383pts for a full 17-game season. That's elite WR1 territory
// based on a small, noisy sample. We fix this by regressing toward the positional
// average based on how many games were played — fewer games = more regression.
//
// Confidence scale:  5 games = 8% confidence, 11 games = 54%, 17 games = 100%
// ─────────────────────────────────────────────────────────────────────────────
function blendStats(curr, prev, scoreKey, pos) {
  const NFL_GAMES = 17;
  const isIdp = IDP_POSITIONS.includes(pos);

  function getPts(stats) {
    if (!stats) return 0;
    if (isIdp) return calcIdpPoints(stats); // compute from raw defensive keys
    return stats[scoreKey] || 0;
  }

  function getGp(stats) {
    return stats ? (stats.gp || stats.gms_active || 0) : 0;
  }

  function scaledWithConfidence(pts, gp) {
    if (gp <= 4) return 0;
    const rawScaled = (pts / gp) * NFL_GAMES;
    // Confidence: 0 at 4 games, 1.0 at 17 games. Below ~11 games we regress
    // meaningfully toward the positional average to dampen hot/cold streaks.
    const confidence = Math.min(1, (gp - 4) / (NFL_GAMES - 4));
    const baseline = POS_BASELINE[pos] || 150;
    return Math.round(rawScaled * confidence + baseline * (1 - confidence));
  }

  const currScaled = scaledWithConfidence(getPts(curr), getGp(curr));
  const prevScaled = scaledWithConfidence(getPts(prev), getGp(prev));

  if (currScaled > 0 && prevScaled > 0) return Math.round(currScaled * 0.65 + prevScaled * 0.35);
  if (currScaled > 0) return Math.round(currScaled);
  if (prevScaled > 0) return Math.round(prevScaled * 0.85);
  return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD PLAYERS
// ─────────────────────────────────────────────────────────────────────────────
export function buildPlayers(raw, budget, scoring = "ppr", statsData = {}, totalTeams = 12, prevStatsData = {}, projData = {}) {
  const scoreKey   = scoring === "std" ? "pts_std" : scoring === "half" ? "pts_half_ppr" : "pts_ppr";
  const dynastyKey = "pts_half_ppr";

  return raw.map(p => {
    const pos = fantasyPos(p);
    if (!pos) return null;

    const curr = statsData[p.player_id]     || null;
    const prev = prevStatsData[p.player_id] || null;
    const proj = projData[p.player_id]      || null;

    const depthOrder = p.depth_chart_order ? Number(p.depth_chart_order) : null;
    const isIdp = IDP_POSITIONS.includes(pos);

    // ── Redraft points ────────────────────────────────────────────────────
    let rpts = 0;
    let hasRealStats = false;

    const blended = blendStats(curr, prev, scoreKey, pos);

    if (isIdp) {
      // Projections don't carry idp_* keys reliably — use blended actuals only
      if (blended > 10) {
        rpts = blended;
        hasRealStats = true;
      } else {
        rpts = estimatePoints(pos, scoring, p.age || 25, p.years_exp || 0, depthOrder);
        hasRealStats = false;
      }
    } else {
      const projPts = proj?.[scoreKey] || 0;
      if (projPts > 20) {
        rpts = blended > 20
          ? Math.round(projPts * 0.6 + blended * 0.4)
          : Math.round(projPts);
        hasRealStats = true;
      } else if (blended > 20) {
        rpts = blended;
        hasRealStats = true;
      } else {
        rpts = estimatePoints(pos, scoring, p.age || 25, p.years_exp || 0, depthOrder);
        hasRealStats = false;
      }
    }

    // ── Dynasty points ────────────────────────────────────────────────────
    const dynBlended = blendStats(curr, prev, dynastyKey, pos);
    let dynBase = 0;

    if (isIdp) {
      dynBase = dynBlended > 10
        ? dynBlended
        : estimatePoints(pos, "half", p.age || 25, p.years_exp || 0, depthOrder);
    } else {
      const dynProj = proj?.[dynastyKey] || 0;
      if (dynProj > 20) {
        dynBase = dynBlended > 20
          ? Math.round(dynProj * 0.6 + dynBlended * 0.4)
          : Math.round(dynProj);
      } else if (dynBlended > 20) {
        dynBase = dynBlended;
      } else {
        dynBase = estimatePoints(pos, "half", p.age || 25, p.years_exp || 0, depthOrder);
      }
    }

    const age = p.age || 25;

    // Position-specific dynasty age curves. Each position has a different
    // peak age, decline rate, and longevity ceiling.
    const dynastyMult = (() => {
      switch (pos) {
        case 'QB':
          // QBs peak late (~27-32) and age gracefully — still productive at 35+
          return age < 23 ? 1.30 : age < 26 ? 1.15 : age < 31 ? 1.0
            : age < 34 ? 0.78 : age < 37 ? 0.52 : 0.28;
        case 'RB':
          // Hardest cliff of any position — value drops fast after 27
          return age < 22 ? 1.35 : age < 24 ? 1.15 : age < 27 ? 1.0
            : age < 29 ? 0.68 : age < 31 ? 0.42 : 0.20;
        case 'WR':
          // WRs peak 25-30, gradual decline into early 30s
          return age < 22 ? 1.30 : age < 24 ? 1.15 : age < 27 ? 1.05
            : age < 30 ? 1.0 : age < 32 ? 0.82 : age < 34 ? 0.60 : 0.38;
        case 'TE':
          // TEs develop slowly, peak 26-30, longer tail than RB
          return age < 23 ? 1.10 : age < 26 ? 1.20 : age < 30 ? 1.05
            : age < 32 ? 0.85 : age < 34 ? 0.62 : 0.38;
        default:
          // K, DEF, IDP — generic curve
          return age < 22 ? 1.25 : age < 25 ? 1.10 : age < 29 ? 1.0
            : age < 32 ? 0.80 : 0.55;
      }
    })();

    const dpts = Math.max(15, Math.round(dynBase * dynastyMult));

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
      dynastyAuctionValue: dynastyAuctionVal(dpts, pos, budget),
      hasRealStats,
      hasProjection: !isIdp && (proj?.[scoreKey] || 0) > 20,
      isIdp,
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
      const minPts = {
        QB: 100, RB: 30, WR: 30, TE: 25, K: 60, DEF: 60,
        DL: 40, LB: 50, DB: 35,
      }[p.position] || 20;
      return p.redraftPoints >= minPts;
    });
}

    export function capSalaryValue(pts, pos, capCeiling = 50_000_000, totalTeams = 12) {
      const auctVal = auctionVal(pts, pos, 200, totalTeams); // $ out of $200 budget
      const pct = auctVal / 200;                             // fraction of budget
      const raw = Math.round(pct * capCeiling);
      const floor = 750_000;
      const ceiling = Math.round(capCeiling * 0.35);
    return Math.max(floor, Math.min(raw, ceiling));
    }

    export function capSalaryValueDynasty(pts, pos, capCeiling = 50_000_000) {
      const auctVal = dynastyAuctionVal(pts, pos, capCeiling);
      const pct = auctVal / capCeiling;
      const raw = Math.round(pct * capCeiling);
      const floor = 750_000;
      const ceiling = Math.round(capCeiling * 0.35);
    return Math.max(floor, Math.min(raw, ceiling));
}  