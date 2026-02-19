export function sel(active, on, off) {
  return active ? on : off;
}

export function btn(active, C) {
  return {
    padding: "8px 18px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    background: sel(active, "#10b981", C.btnBgAlt),
    color: sel(active, "#fff", C.textSec),
  };
}

export function tabBtn(active, activeGrad, C) {
  return {
    padding: "10px 28px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: "0.05em",
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: sel(active, activeGrad, "transparent"),
    color: sel(active, "#fff", C.textSec),
    boxShadow: sel(active, "0 4px 12px rgba(99,102,241,0.4)", "none"),
  };
}

export function posBtn(active, pos, C) {
  const pc = (p) => ({QB:"#ef4444",RB:"#10b981",WR:"#3b82f6",TE:"#a855f7",K:"#f59e0b",DEF:"#6b7280",DL:"#f43f5e",LB:"#f97316",DB:"#06b6d4"}[p] || "#6b7280");
  return {
    padding: "6px 16px",
    borderRadius: 8,
    border: sel(active, "none", "1px solid " + C.border),
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 12,
    background: sel(active, pos === "ALL" ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : pc(pos), C.btnBg),
    color: sel(active, "#fff", C.textSec),
  };
}

export function smallBtn(active, activeBg, activeCol, C) {
  return {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
    background: sel(active, activeBg, C.btnBgAlt),
    color: sel(active, activeCol, C.textSec),
  };
}

export function slotBtn(active, C) {
  return {
    width: 40,
    height: 40,
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
    background: sel(active, "#6366f1", C.btnBgAlt),
    color: sel(active, "#fff", C.textSec),
  };
}