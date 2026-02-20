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

export function getTier(pos, pts) {
  const thresholds = {
    QB:  [360, 320, 280, 240],
    RB:  [280, 220, 160, 110],
    WR:  [270, 210, 150, 100],
    TE:  [180, 140, 100, 70],
    K:   [145, 130, 115, 100],
    DEF: [150, 135, 120, 105],
    DL:  [160, 140, 120, 100],
    LB:  [165, 145, 125, 105],
    DB:  [145, 125, 105, 85],
  }[pos] || [200, 160, 120, 80];
  if (pts >= thresholds[0]) return 1;
  if (pts >= thresholds[1]) return 2;
  if (pts >= thresholds[2]) return 3;
  if (pts >= thresholds[3]) return 4;
  return 5;
}

export function auctionVal(pts, pos, budget, totalTeams) {
  // Position scarcity multipliers
  const sc = {
    QB:  0.85, RB: 1.4, WR: 1.1, TE: 1.15,
    K:   0.2,  DEF: 0.3, DL: 0.4, LB: 0.5, DB: 0.4
  }[pos] || 1.0;

  // Scale by league size — more teams = more value for depth
  const leagueMod = totalTeams ? totalTeams / 12 : 1;

  return Math.max(1, Math.round(
    Math.min((pts / 10) * sc * (budget / 200) * leagueMod, budget * 0.4)
  ));
}

export function dynastyAuctionVal(pts, pos, age, budget) {
  const base = auctionVal(pts, pos, budget, 12);
  const am = age < 24 ? 1.5 : age < 27 ? 1.2 : age < 29 ? 1.0 : age < 31 ? 0.7 : 0.4;
  const pm = {QB:1.1, RB:0.8, WR:1.0, TE:1.0, K:0.3, DEF:0.4}[pos] || 1.0;
  return Math.max(1, Math.round(base * am * pm));
}

// Fallback estimator for players with no stats data
export function estimatePoints(pos, scoring, age, exp) {
  const base = {
    QB:  { ppr:240, half:235, std:230 },
    RB:  { ppr:150, half:138, std:126 },
    WR:  { ppr:140, half:128, std:116 },
    TE:  { ppr:100, half:92,  std:84  },
    K:   { ppr:110, half:110, std:110 },
    DEF: { ppr:115, half:115, std:115 },
    DL:  { ppr:120, half:120, std:120 },
    LB:  { ppr:130, half:130, std:130 },
    DB:  { ppr:110, half:110, std:110 },
  }[pos] || { ppr:80, half:80, std:80 };

  let pts = base[scoring] || base.ppr;
  const ageMod = age < 24 ? 1.05 : age < 27 ? 1.0 : age < 30 ? 0.92 : 0.82;
  const expMod = exp < 2 ? 0.88 : exp < 5 ? 1.0 : exp < 9 ? 0.95 : 0.88;
  return Math.max(30, Math.round(pts * ageMod * expMod));
}

export function buildPlayers(raw, budget, scoring = "ppr", statsData = {}, totalTeams = 12) {
  const scoreKey = scoring === "std" ? "pts_std" : scoring === "half" ? "pts_half_ppr" : "pts_ppr";
  const dynastyKey = "pts_half_ppr"; // dynasty uses half ppr as base

  return raw.map(p => {
    const pos = fantasyPos(p);
    if (!pos) return null;

    const stats = statsData[p.player_id];

    // Use real stats if available, otherwise estimate
    const rpts = stats && stats[scoreKey] && stats[scoreKey] > 20
      ? Math.round(stats[scoreKey])
      : estimatePoints(pos, scoring, p.age||25, p.years_exp||0);

    const dpts = stats && stats[dynastyKey] && stats[dynastyKey] > 20
      ? Math.round(stats[dynastyKey] * (p.age < 24 ? 1.2 : p.age < 27 ? 1.0 : p.age < 30 ? 0.85 : 0.65))
      : estimatePoints(pos, "half", p.age||25, p.years_exp||0);

    return {
      id: p.player_id,
      name: (p.first_name||"") + " " + (p.last_name||""),
      team: p.team || "FA",
      position: pos,
      age: p.age||25,
      number: p.number,
      yearsExp: p.years_exp||0,
      redraftPoints: rpts,
      dynastyPoints: dpts,
      tier: getTier(pos, rpts),
      auctionValue: auctionVal(rpts, pos, budget, totalTeams),
      dynastyAuctionValue: dynastyAuctionVal(dpts, pos, p.age||25, budget),
      hasRealStats: !!(stats && stats[scoreKey] && stats[scoreKey] > 20),
      scoring,
    };
  }).filter(Boolean)
   .filter(p => p.team && p.team !== "FA" && p.team !== "")
.filter(p => {
  if (!p.hasRealStats) return true;
  const minPts = {
    QB: 150, RB: 50, WR: 50, TE: 40, K: 60, DEF: 60, DL: 25, LB: 25, DB: 25
  }[p.position] || 30;
  return p.redraftPoints >= minPts;
});
}