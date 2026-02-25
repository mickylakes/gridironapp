export const DARK = {
  pageBg: "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)",
  loadBg: "linear-gradient(135deg,#0f172a,#1e1b4b)",
  textPri: "#f1f5f9", textSec: "#94a3b8",
  border: "#1e293b", cardBg: "rgba(15,23,42,0.4)",
  inputBg: "#1e293b", rowHover: "rgba(30,41,59,0.6)",
  headerBg: "rgba(15,23,42,0.8)", subBg: "rgba(15,23,42,0.6)",
  stickyBg: "#0f172a", rowBg: "rgba(30,41,59,0.6)",
  btnBg: "#1e293b", btnBgAlt: "#1e293b",
  themeBtnBg: "#1e293b", themeBtnCol: "#fbbf24", settBtnCol: "#818cf8",
  tabDraftBg: "rgba(99,102,241,0.1)",
  auctionHintBg: "rgba(245,158,11,0.1)", idpHintBg: "rgba(6,182,212,0.1)",
  modalBg: "#0f172a", statBg: "rgba(30,41,59,0.6)",
  curPickBg: "rgba(16,185,129,0.15)", yourColBg: "rgba(99,102,241,0.05)",
  yourCellBg: "rgba(99,102,241,0.2)", otherCellBg: "rgba(30,41,59,0.8)",
  dashCol: "#334155", dotCol: "#1e293b",
  yourInputBg: "rgba(99,102,241,0.1)", budgetCardBg: "rgba(99,102,241,0.1)",
  nomBg: "rgba(245,158,11,0.1)", clkBg: "#1e293b",
  trackBg: "#1e293b",
};

export const AMOLED = {
  pageBg: "#000000",
  loadBg: "#000000",
  textPri: "#ffffff", textSec: "#94a3b8",
  border: "#1a1a1a", cardBg: "rgba(10,10,10,0.9)",
  inputBg: "#0d0d0d", rowHover: "rgba(255,255,255,0.04)",
  headerBg: "rgba(0,0,0,0.95)", subBg: "rgba(0,0,0,0.85)",
  stickyBg: "#000000", rowBg: "rgba(10,10,10,0.9)",
  btnBg: "#0d0d0d", btnBgAlt: "#0d0d0d",
  themeBtnBg: "#0d0d0d", themeBtnCol: "#a78bfa", settBtnCol: "#818cf8",
  tabDraftBg: "rgba(99,102,241,0.08)",
  auctionHintBg: "rgba(245,158,11,0.08)", idpHintBg: "rgba(6,182,212,0.08)",
  modalBg: "#000000", statBg: "rgba(10,10,10,0.95)",
  curPickBg: "rgba(16,185,129,0.12)", yourColBg: "rgba(99,102,241,0.04)",
  yourCellBg: "rgba(99,102,241,0.15)", otherCellBg: "rgba(10,10,10,0.95)",
  dashCol: "#1a1a1a", dotCol: "#0d0d0d",
  yourInputBg: "rgba(99,102,241,0.08)", budgetCardBg: "rgba(99,102,241,0.08)",
  nomBg: "rgba(245,158,11,0.08)", clkBg: "#0d0d0d",
  trackBg: "#0d0d0d",
};

export const LIGHT = {
  pageBg: "linear-gradient(135deg,#f8fafc,#eef2ff)",
  loadBg: "#f8fafc",
  textPri: "#0f172a", textSec: "#64748b",
  border: "#e2e8f0", cardBg: "rgba(255,255,255,0.6)",
  inputBg: "#ffffff", rowHover: "rgba(241,245,249,0.8)",
  headerBg: "rgba(248,250,252,0.9)", subBg: "rgba(248,250,252,0.9)",
  stickyBg: "#f8fafc", rowBg: "#f8fafc",
  btnBg: "#ffffff", btnBgAlt: "#f1f5f9",
  themeBtnBg: "#ffffff", themeBtnCol: "#334155", settBtnCol: "#334155",
  tabDraftBg: "rgba(238,242,255,0.8)",
  auctionHintBg: "rgba(245,158,11,0.06)", idpHintBg: "rgba(6,182,212,0.06)",
  modalBg: "#ffffff", statBg: "rgba(248,250,252,0.9)",
  curPickBg: "rgba(16,185,129,0.08)", yourColBg: "rgba(238,242,255,0.5)",
  yourCellBg: "rgba(238,242,255,0.9)", otherCellBg: "rgba(241,245,249,0.9)",
  dashCol: "#cbd5e1", dotCol: "#e2e8f0",
  yourInputBg: "rgba(238,242,255,0.8)", budgetCardBg: "rgba(238,242,255,0.8)",
  nomBg: "rgba(254,243,199,0.6)", clkBg: "#f1f5f9",
  trackBg: "#e2e8f0",
};

export const PC = {
  QB:"#ef4444", RB:"#10b981", WR:"#3b82f6", TE:"#a855f7",
  K:"#f59e0b", DEF:"#6b7280", DL:"#f43f5e", LB:"#f97316", DB:"#06b6d4"
};

export const TIERS = {
  1:{label:"Elite", bg:"#f59e0b", col:"#000"},
  2:{label:"Great", bg:"#3b82f6", col:"#fff"},
  3:{label:"Solid", bg:"#10b981", col:"#fff"},
  4:{label:"Flex",  bg:"#6b7280", col:"#fff"},
  5:{label:"Deep",  bg:"#374151", col:"#fff"}
};

export const pc = (p) => PC[p] || "#6b7280";
export const ti = (t) => TIERS[t] || TIERS[5];