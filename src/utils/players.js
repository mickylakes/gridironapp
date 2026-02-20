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
  {player_id:"9101",first_name:"Myles",last_name:"Garrett",position:"DE",team:"CLE",age:29,number:"95",years_exp:7,active:true},
  {player_id:"9102",first_name:"Micah",last_name:"Parsons",position:"LB",team:"DAL",age:25,number:"11",years_exp:3,active:true},
  {player_id:"9103",first_name:"Roquan",last_name:"Smith",position:"LB",team:"BAL",age:27,number:"0",years_exp:6,active:true},
  {player_id:"9104",first_name:"Jalen",last_name:"Ramsey",position:"CB",team:"LAR",age:30,number:"5",years_exp:8,active:true},
];

// Consensus projected points (PPR baseline, 2024-25)
const PROJ = {
  // QBs
  "4866": { ppr:380, half:375, std:370, dyn:410 },
  "4881": { ppr:372, half:367, std:362, dyn:400 },
  "6797": { ppr:365, half:358, std:350, dyn:395 },
  "5850": { ppr:348, half:340, std:332, dyn:370 },
  "7553": { ppr:340, half:333, std:326, dyn:355 },
  "6770": { ppr:330, half:324, std:318, dyn:320 },
  // RBs
  "4984": { ppr:320, half:298, std:276, dyn:310 },
  "7562": { ppr:295, half:275, std:255, dyn:330 },
  "8137": { ppr:290, half:270, std:250, dyn:340 },
  "6945": { ppr:265, half:248, std:231, dyn:255 },
  "7601": { ppr:285, half:265, std:245, dyn:335 },
  "7610": { ppr:280, half:260, std:240, dyn:325 },
  // WRs
  "7547": { ppr:310, half:285, std:260, dyn:330 },
  "7565": { ppr:305, half:280, std:255, dyn:325 },
  "6794": { ppr:295, half:270, std:245, dyn:270 },
  "5012": { ppr:260, half:238, std:216, dyn:235 },
  "7578": { ppr:285, half:262, std:239, dyn:305 },
  "7596": { ppr:270, half:248, std:226, dyn:300 },
  // TEs
  "6787": { ppr:245, half:232, std:219, dyn:215 },
  "7568": { ppr:210, half:198, std:186, dyn:255 },
  "6804": { ppr:205, half:193, std:181, dyn:215 },
  "7602": { ppr:215, half:203, std:191, dyn:260 },
  // Ks
  "8200": { ppr:145, half:145, std:145, dyn:130 },
  "4046": { ppr:150, half:150, std:150, dyn:125 },
  "7603": { ppr:143, half:143, std:143, dyn:128 },
  // DEFs
  "9001": { ppr:155, half:155, std:155, dyn:140 },
  "9002": { ppr:148, half:148, std:148, dyn:133 },
  "9003": { ppr:152, half:152, std:152, dyn:137 },
  "9004": { ppr:150, half:150, std:150, dyn:135 },
  // IDP
  "9101": { ppr:165, half:165, std:165, dyn:170 },
  "9102": { ppr:170, half:170, std:170, dyn:180 },
  "9103": { ppr:155, half:155, std:155, dyn:160 },
  "9104": { ppr:145, half:145, std:145, dyn:148 },
};

export function fantasyPos(p) {
  if (["QB","RB","WR","TE","K"].includes(p.position)) return p.position;
  if (p.position === "DEF") return "DEF";
  if (["DE","DT","NT"].includes(p.position)) return "DL";
  if (["LB","ILB","OLB","MLB"].includes(p.position)) return "LB";
  if (["CB","S","DB","SS","FS"].includes(p.position)) return "DB";
  return null;
}

// Fallback projected points for players not in PROJ table (Sleeper API players)
export function estimatePoints(pos, scoring, age, exp) {
  const base = {
    QB:  { ppr:260, half:255, std:250, dyn:270 },
    RB:  { ppr:200, half:185, std:170, dyn:210 },
    WR:  { ppr:185, half:170, std:155, dyn:195 },
    TE:  { ppr:140, half:130, std:120, dyn:145 },
    K:   { ppr:120, half:120, std:120, dyn:100 },
    DEF: { ppr:125, half:125, std:125, dyn:110 },
    DL:  { ppr:130, half:130, std:130, dyn:135 },
    LB:  { ppr:140, half:140, std:140, dyn:145 },
    DB:  { ppr:120, half:120, std:120, dyn:125 },
  }[pos] || { ppr:100, half:100, std:100, dyn:100 };

  let pts = base[scoring] || base.ppr;

  // Age/experience modifier
  const ageMod = age < 24 ? 1.05 : age < 27 ? 1.0 : age < 30 ? 0.95 : 0.85;
  const expMod = exp < 2 ? 0.92 : exp < 5 ? 1.0 : exp < 9 ? 0.97 : 0.90;

  // Dynasty modifier
  if (scoring === "dyn") {
    const dynAge = age < 24 ? 1.2 : age < 27 ? 1.0 : age < 30 ? 0.82 : 0.65;
    return Math.max(50, Math.round(pts * dynAge * expMod));
  }

  return Math.max(50, Math.round(pts * ageMod * expMod));
}

export function getTier(pos, pts, scoring) {
  const thresholds = {
    QB:  [360, 330, 300, 270],
    RB:  [280, 240, 200, 160],
    WR:  [270, 230, 190, 150],
    TE:  [200, 170, 140, 110],
    K:   [145, 135, 125, 115],
    DEF: [150, 140, 130, 120],
    DL:  [160, 145, 130, 115],
    LB:  [165, 150, 135, 120],
    DB:  [145, 132, 119, 106],
  }[pos] || [200, 160, 130, 100];

  if (pts >= thresholds[0]) return 1;
  if (pts >= thresholds[1]) return 2;
  if (pts >= thresholds[2]) return 3;
  if (pts >= thresholds[3]) return 4;
  return 5;
}

export function auctionVal(pts, pos, budget) {
  const sc = {QB:0.9,RB:1.4,WR:1.0,TE:1.2,K:0.2,DEF:0.3,DL:0.4,LB:0.5,DB:0.4}[pos] || 1.0;
  return Math.max(1, Math.round(Math.min((pts/10)*sc*(budget/200), budget*0.35)));
}

export function dynastyAuctionVal(pts, pos, age, budget) {
  const base = auctionVal(pts, pos, budget);
  const am = age < 24 ? 1.5 : age < 27 ? 1.2 : age < 29 ? 1.0 : age < 31 ? 0.7 : 0.4;
  const pm = {QB:1.1,RB:0.8,WR:1.0,TE:1.0,K:0.3,DEF:0.4}[pos] || 1.0;
  return Math.max(1, Math.round(base*am*pm));
}

export function buildPlayers(raw, budget, scoring = "ppr") {
  return raw.map(p => {
    const pos = fantasyPos(p);
    if (!pos) return null;

    const proj = PROJ[p.player_id];
    const rpts = proj
      ? proj[scoring]
      : estimatePoints(pos, scoring, p.age||25, p.years_exp||0);
    const dpts = proj
      ? proj.dyn
      : estimatePoints(pos, "dyn", p.age||25, p.years_exp||0);

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
      tier: getTier(pos, rpts, scoring),
      auctionValue: auctionVal(rpts, pos, budget),
      dynastyAuctionValue: dynastyAuctionVal(dpts, pos, p.age||25, budget),
      scoring,
    };
  }).filter(Boolean).filter(p => p.team && p.team !== "FA" && p.team !== "");
}