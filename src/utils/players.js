import { pc, ti } from "@/constants/theme";

export const SAMPLES = [
  {player_id:"4866",first_name:"Patrick",last_name:"Mahomes",position:"QB",team:"KC",age:29,number:"15",years_exp:7,active:true},
  {player_id:"4881",first_name:"Josh",last_name:"Allen",position:"QB",team:"BUF",age:28,number:"17",years_exp:6,active:true},
  {player_id:"6797",first_name:"Lamar",last_name:"Jackson",position:"QB",team:"BAL",age:27,number:"8",years_exp:6,active:true},
  {player_id:"5850",first_name:"Jalen",last_name:"Hurts",position:"PHI",team:"PHI",age:26,number:"1",years_exp:4,active:true},
  {player_id:"4984",first_name:"Christian",last_name:"McCaffrey",position:"RB",team:"SF",age:28,number:"23",years_exp:7,active:true},
  {player_id:"7562",first_name:"Breece",last_name:"Hall",position:"RB",team:"NYJ",age:23,number:"20",years_exp:2,active:true},
  {player_id:"8137",first_name:"Bijan",last_name:"Robinson",position:"RB",team:"ATL",age:22,number:"7",years_exp:1,active:true},
  {player_id:"6945",first_name:"Tony",last_name:"Pollard",position:"RB",team:"TEN",age:27,number:"20",years_exp:5,active:true},
  {player_id:"7547",first_name:"Ja'Marr",last_name:"Chase",position:"WR",team:"CIN",age:24,number:"1",years_exp:3,active:true},
  {player_id:"7565",first_name:"Justin",last_name:"Jefferson",position:"WR",team:"MIN",age:25,number:"18",years_exp:4,active:true},
  {player_id:"6794",first_name:"Tyreek",last_name:"Hill",position:"WR",team:"MIA",age:30,number:"10",years_exp:8,active:true},
  {player_id:"5012",first_name:"Davante",last_name:"Adams",position:"WR",team:"LV",age:31,number:"17",years_exp:10,active:true},
  {player_id:"6787",first_name:"Travis",last_name:"Kelce",position:"TE",team:"KC",age:35,number:"87",years_exp:11,active:true},
  {player_id:"7568",first_name:"Sam",last_name:"LaPorta",position:"TE",team:"DET",age:23,number:"80",years_exp:1,active:true},
  {player_id:"6804",first_name:"Mark",last_name:"Andrews",position:"TE",team:"BAL",age:29,number:"89",years_exp:6,active:true},
  {player_id:"8200",first_name:"Jake",last_name:"Moody",position:"K",team:"SF",age:24,number:"4",years_exp:1,active:true},
  {player_id:"4046",first_name:"Justin",last_name:"Tucker",position:"K",team:"BAL",age:34,number:"9",years_exp:11,active:true},
  {player_id:"9001",first_name:"SF",last_name:"Defense",position:"DEF",team:"SF",age:28,number:"0",years_exp:5,active:true},
  {player_id:"9002",first_name:"DAL",last_name:"Defense",position:"DEF",team:"DAL",age:28,number:"0",years_exp:5,active:true},
  {player_id:"9101",first_name:"Myles",last_name:"Garrett",position:"DE",team:"CLE",age:29,number:"95",years_exp:7,active:true},
  {player_id:"9102",first_name:"Micah",last_name:"Parsons",position:"LB",team:"DAL",age:25,number:"11",years_exp:3,active:true},
  {player_id:"9103",first_name:"Roquan",last_name:"Smith",position:"LB",team:"BAL",age:27,number:"0",years_exp:6,active:true},
  {player_id:"9104",first_name:"Jalen",last_name:"Ramsey",position:"CB",team:"LAR",age:30,number:"5",years_exp:8,active:true},
];

export function fantasyPos(p) {
  if (["QB","RB","WR","TE","K"].includes(p.position)) return p.position;
  if (p.position === "DEF") return "DEF";
  if (["DE","DT","NT"].includes(p.position)) return "DL";
  if (["LB","ILB","OLB","MLB"].includes(p.position)) return "LB";
  if (["CB","S","DB","SS","FS"].includes(p.position)) return "DB";
  return null;
}

export function genScore(pos, type, age, exp) {
  const base = {QB:280,RB:240,WR:220,TE:180,K:120,DEF:140,DL:160,LB:180,DB:150}[pos] || 100;
  let s = Math.max(50, base + (Math.random()*100-50));
  if (type === "dynasty") {
    s *= (age < 24 ? 1.2 : age < 27 ? 1.0 : age < 30 ? 0.85 : 0.7);
    s *= (exp < 2 ? 1.15 : exp < 5 ? 1.0 : 0.9);
  }
  return Math.max(50, s);
}

export function genTier(age, exp) {
  if (age < 25 && exp < 3) return Math.ceil(Math.random()*2)+1;
  if (age < 28 && exp >= 3) return Math.ceil(Math.random()*2)+1;
  if (age >= 30) return Math.ceil(Math.random()*2)+3;
  return Math.ceil(Math.random()*5);
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

export function buildPlayers(raw, budget) {
  return raw.map(p => {
    const pos = fantasyPos(p);
    if (!pos) return null;
    const rpts = genScore(pos, "redraft", p.age||25, p.years_exp||0);
    const dpts = genScore(pos, "dynasty", p.age||25, p.years_exp||0);
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
      tier: genTier(p.age||25, p.years_exp||0),
      auctionValue: auctionVal(rpts, pos, budget),
      dynastyAuctionValue: dynastyAuctionVal(dpts, pos, p.age||25, budget),
    };
  }).filter(Boolean);
}