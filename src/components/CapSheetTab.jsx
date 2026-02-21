"use client";
import { useState, useEffect, useMemo } from "react";
import {
  DollarSign, Plus, X, Search, ChevronDown, ChevronUp,
  AlertTriangle, CheckCircle, Users, TrendingDown, Edit3, Trash2, Save
} from "lucide-react";
import { pc } from "@/constants/theme";
import useWindowSize from "@/hooks/useWindowSize";
import { createClient } from "@/lib/supabase";

// ─── Salary formatting helpers ────────────────────────────────────────────────
function fmt(n) {
  if (!n && n !== 0) return "$0";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2).replace(/\.?0+$/, "") + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(0) + "K";
  return "$" + n;
}

function fmtInput(val) {
  // Parse user input like "14.5", "14500000", "14.5M", "500K"
  if (!val) return 0;
  const s = String(val).trim().toUpperCase();
  if (s.endsWith("M")) return Math.round(parseFloat(s) * 1_000_000);
  if (s.endsWith("K")) return Math.round(parseFloat(s) * 1_000);
  const n = parseFloat(s.replace(/[^0-9.]/g, ""));
  if (isNaN(n)) return 0;
  // If they typed a small number like 14.5, assume millions
  if (n < 1000) return Math.round(n * 1_000_000);
  return Math.round(n);
}

const POS_COLORS = {
  QB: "#ef4444", RB: "#10b981", WR: "#3b82f6", TE: "#a855f7",
  K: "#f59e0b", DEF: "#6b7280", DL: "#f43f5e", LB: "#f97316", DB: "#06b6d4"
};

const CAP_PRESETS = [25_000_000, 50_000_000, 75_000_000, 100_000_000, 150_000_000, 200_000_000];

// ─── Add Contract Modal ───────────────────────────────────────────────────────
function AddContractModal({ C, players, teamSlot, teamName, onSave, onClose }) {
  const [search, setSearch] = useState("");
  const [selPlayer, setSelPlayer] = useState(null);
  const [salary, setSalary] = useState("");
  const [years, setYears] = useState(3);
  const [saving, setSaving] = useState(false);

  const filtered = players
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.team.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 40);

  async function handleSave() {
    if (!selPlayer || !salary) return;
    setSaving(true);
    await onSave({
      player_id: selPlayer.id,
      player_name: selPlayer.name,
      player_position: selPlayer.position,
      player_team: selPlayer.team,
      team_slot: teamSlot,
      team_name: teamName,
      salary: fmtInput(salary),
      years,
      years_remaining: years,
    });
    setSaving(false);
    onClose();
  }

  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 500, borderRadius: 20, background: C.modalBg, border: "1px solid " + C.border, boxShadow: "0 32px 80px rgba(0,0,0,0.6)", padding: 28, maxHeight: "90vh", overflowY: "auto" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
            <DollarSign size={18} color="#10b981" /> Add Contract — {teamName}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSec, fontSize: 22 }}>×</button>
        </div>

        {/* Player search */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontWeight: 700, fontSize: 11, color: C.textSec, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Player</label>
          {selPlayer ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: C.curPickBg, border: "1px solid rgba(16,185,129,0.3)" }}>
              <span style={{ padding: "2px 8px", borderRadius: 6, background: pc(selPlayer.position), color: "#fff", fontWeight: 800, fontSize: 11 }}>{selPlayer.position}</span>
              <span style={{ flex: 1, fontWeight: 700 }}>{selPlayer.name}</span>
              <span style={{ fontSize: 12, color: C.textSec, fontFamily: "monospace" }}>{selPlayer.team}</span>
              <button onClick={() => setSelPlayer(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSec }}>
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <div style={{ position: "relative", marginBottom: 8 }}>
                <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.textSec }} />
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search players..."
                  style={{ width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 9, paddingBottom: 9, borderRadius: 10, border: "1px solid " + C.border, background: C.inputBg, color: C.textPri, outline: "none", fontSize: 13, boxSizing: "border-box" }}
                />
              </div>
              {search.length > 0 && (
                <div style={{ maxHeight: 200, overflowY: "auto", borderRadius: 10, border: "1px solid " + C.border, background: C.modalBg }}>
                  {filtered.map(p => (
                    <div
                      key={p.id}
                      onClick={() => { setSelPlayer(p); setSearch(""); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid " + C.border }}
                      onMouseEnter={e => e.currentTarget.style.background = C.rowHover}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <span style={{ padding: "2px 6px", borderRadius: 4, background: pc(p.position), color: "#fff", fontWeight: 800, fontSize: 10 }}>{p.position}</span>
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                      <span style={{ fontSize: 11, color: C.textSec, fontFamily: "monospace" }}>{p.team}</span>
                    </div>
                  ))}
                  {filtered.length === 0 && <div style={{ padding: 12, color: C.textSec, fontSize: 13, textAlign: "center" }}>No players found</div>}
                </div>
              )}
            </>
          )}
        </div>

        {/* Salary */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontWeight: 700, fontSize: 11, color: C.textSec, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Annual Salary</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textSec, fontWeight: 700 }}>$</span>
            <input
              type="text"
              value={salary}
              onChange={e => setSalary(e.target.value)}
              placeholder="e.g. 14.5 or 14500000"
              style={{ width: "100%", paddingLeft: 24, paddingRight: 12, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: "1px solid " + C.border, background: C.inputBg, color: C.textPri, outline: "none", fontSize: 14, fontWeight: 700, boxSizing: "border-box" }}
            />
          </div>
          {salary && (
            <div style={{ marginTop: 6, fontSize: 12, color: "#34d399", fontFamily: "monospace" }}>
              = {fmt(fmtInput(salary))} / year
            </div>
          )}
          <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[1, 3, 5, 8, 12, 20, 35].map(m => (
              <button key={m} onClick={() => setSalary(String(m))}
                style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid " + C.border, cursor: "pointer", background: C.btnBgAlt, color: C.textSec, fontSize: 11, fontWeight: 700 }}>
                ${m}M
              </button>
            ))}
          </div>
        </div>

        {/* Years */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontWeight: 700, fontSize: 11, color: C.textSec, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Contract Length</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3, 4, 5].map(y => (
              <button key={y} onClick={() => setYears(y)}
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: years === y ? "linear-gradient(135deg,#10b981,#0d9488)" : C.btnBgAlt, color: years === y ? "#fff" : C.textSec }}>
                {y}yr
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        {selPlayer && salary && (
          <div style={{ marginBottom: 20, padding: "12px 16px", borderRadius: 12, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: "#34d399", marginBottom: 4 }}>CONTRACT SUMMARY</div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{selPlayer.name}</div>
            <div style={{ fontSize: 13, color: C.textSec, marginTop: 2 }}>
              {fmt(fmtInput(salary))}/yr · {years} year{years !== 1 ? "s" : ""} · Total: {fmt(fmtInput(salary) * years)}
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={!selPlayer || !salary || saving}
          style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", cursor: selPlayer && salary ? "pointer" : "not-allowed", background: selPlayer && salary ? "linear-gradient(135deg,#10b981,#0d9488)" : C.btnBgAlt, color: selPlayer && salary ? "#fff" : C.textSec, fontWeight: 800, fontSize: 14, opacity: saving ? 0.7 : 1 }}
        >
          {saving ? "Saving..." : "✓ Sign Player"}
        </button>
      </div>
    </div>
  );
}

// ─── Edit Contract Modal ──────────────────────────────────────────────────────
function EditContractModal({ C, contract, onSave, onDelete, onClose }) {
  const [salary, setSalary] = useState(String(contract.salary / 1_000_000));
  const [yearsRemaining, setYearsRemaining] = useState(contract.years_remaining);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave(contract.id, { salary: fmtInput(salary), years_remaining: yearsRemaining, updated_at: new Date().toISOString() });
    setSaving(false);
    onClose();
  }

  async function handleDelete() {
    if (!confirm(`Release ${contract.player_name}?`)) return;
    await onDelete(contract.id);
    onClose();
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, borderRadius: 20, background: C.modalBg, border: "1px solid " + C.border, boxShadow: "0 32px 80px rgba(0,0,0,0.6)", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, display: "flex", alignItems: "center", gap: 8 }}>
            <Edit3 size={16} color="#818cf8" /> Edit Contract
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSec, fontSize: 22 }}>×</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "10px 14px", borderRadius: 12, background: C.statBg }}>
          <span style={{ padding: "2px 8px", borderRadius: 6, background: pc(contract.player_position), color: "#fff", fontWeight: 800, fontSize: 11 }}>{contract.player_position}</span>
          <div>
            <div style={{ fontWeight: 700 }}>{contract.player_name}</div>
            <div style={{ fontSize: 11, color: C.textSec, fontFamily: "monospace" }}>{contract.player_team}</div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontWeight: 700, fontSize: 11, color: C.textSec, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Annual Salary</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textSec, fontWeight: 700 }}>$</span>
            <input
              type="text"
              value={salary}
              onChange={e => setSalary(e.target.value)}
              style={{ width: "100%", paddingLeft: 24, paddingRight: 12, paddingTop: 10, paddingBottom: 10, borderRadius: 10, border: "1px solid " + C.border, background: C.inputBg, color: C.textPri, outline: "none", fontSize: 14, fontWeight: 700, boxSizing: "border-box" }}
            />
          </div>
          {salary && <div style={{ marginTop: 6, fontSize: 12, color: "#34d399", fontFamily: "monospace" }}>= {fmt(fmtInput(salary))} / year</div>}
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontWeight: 700, fontSize: 11, color: C.textSec, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Years Remaining</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3, 4, 5].map(y => (
              <button key={y} onClick={() => setYearsRemaining(y)}
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: yearsRemaining === y ? "linear-gradient(135deg,#818cf8,#6366f1)" : C.btnBgAlt, color: yearsRemaining === y ? "#fff" : C.textSec }}>
                {y}yr
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleDelete} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", cursor: "pointer", background: "rgba(239,68,68,0.15)", color: "#ef4444", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Trash2 size={14} /> Release
          </button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: 12, borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#818cf8,#6366f1)", color: "#fff", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, opacity: saving ? 0.7 : 1 }}>
            <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Team Cap Card ────────────────────────────────────────────────────────────
function TeamCapCard({ C, team, contracts, capCeiling, isYourTeam, onAddContract, onEditContract, players, isMobile }) {
  const [expanded, setExpanded] = useState(false);
  const active = contracts.filter(c => !c.is_cut);
  const totalSalary = active.reduce((sum, c) => sum + c.salary, 0);
  const capUsed = totalSalary;
  const capRemaining = capCeiling - capUsed;
  const pct = Math.min(100, (capUsed / capCeiling) * 100);
  const isOver = capRemaining < 0;
  const isWarning = !isOver && capRemaining < capCeiling * 0.15;
  const barColor = isOver ? "#ef4444" : isWarning ? "#fbbf24" : "#10b981";

  // Group by position
  const byPos = {};
  active.forEach(c => {
    if (!byPos[c.player_position]) byPos[c.player_position] = [];
    byPos[c.player_position].push(c);
  });
  const posOrder = ["QB", "RB", "WR", "TE", "K", "DEF", "DL", "LB", "DB"];

  return (
    <div style={{
      background: isYourTeam ? C.yourCellBg : C.cardBg,
      border: "1px solid " + (isYourTeam ? "rgba(99,102,241,0.4)" : isOver ? "rgba(239,68,68,0.4)" : C.border),
      borderRadius: 16,
      overflow: "hidden",
      transition: "border-color 0.2s"
    }}>
      {/* Team header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ padding: "14px 18px", cursor: "pointer", borderBottom: expanded ? "1px solid " + C.border : "none" }}
        onMouseEnter={e => e.currentTarget.style.background = C.rowHover}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: isYourTeam ? "#818cf8" : C.textPri, display: "flex", alignItems: "center", gap: 6 }}>
              {team.name}
              {isYourTeam && <span style={{ fontSize: 10, color: "#818cf8", fontFamily: "monospace", fontWeight: 700 }}>(YOU)</span>}
              {isOver && <AlertTriangle size={13} color="#ef4444" />}
            </div>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: C.textSec, marginTop: 2 }}>{active.length} players signed</div>
          </div>
          <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 10 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 18, color: isOver ? "#ef4444" : isWarning ? "#fbbf24" : "#34d399" }}>
                {isOver ? "-" : ""}{fmt(Math.abs(capRemaining))}
              </div>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: C.textSec }}>{isOver ? "OVER CAP" : "remaining"}</div>
            </div>
            {expanded ? <ChevronUp size={16} color={C.textSec} /> : <ChevronDown size={16} color={C.textSec} />}
          </div>
        </div>

        {/* Cap bar */}
        <div style={{ height: 6, borderRadius: 3, background: C.trackBg, overflow: "hidden" }}>
          <div style={{ height: "100%", width: pct + "%", background: barColor, borderRadius: 3, transition: "width 0.4s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 10, fontFamily: "monospace", color: C.textSec }}>
          <span>{fmt(capUsed)} used</span>
          <span>{fmt(capCeiling)} cap</span>
        </div>
      </div>

      {/* Expanded roster */}
      {expanded && (
        <div>
          {posOrder.map(pos => {
            const group = byPos[pos];
            if (!group || group.length === 0) return null;
            return (
              <div key={pos}>
                <div style={{ padding: "6px 18px", fontSize: 10, fontFamily: "monospace", fontWeight: 700, color: POS_COLORS[pos] || C.textSec, background: C.subBg, letterSpacing: "0.08em" }}>
                  {pos}
                </div>
                {group.map(c => (
                  <div
                    key={c.id}
                    onClick={() => onEditContract(c)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 18px", borderBottom: "1px solid " + C.border, cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.rowHover}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.player_name}</div>
                      <div style={{ fontSize: 10, color: C.textSec, fontFamily: "monospace" }}>{c.player_team}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 14, color: "#fbbf24" }}>{fmt(c.salary)}</div>
                      <div style={{ fontSize: 10, fontFamily: "monospace", color: C.textSec }}>{c.years_remaining}yr left</div>
                    </div>
                    <Edit3 size={12} color={C.textSec} style={{ flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            );
          })}

          {/* Add player button */}
          <div style={{ padding: 12 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onAddContract(team); }}
              style={{ width: "100%", padding: "9px", borderRadius: 10, border: "1px dashed " + C.border, cursor: "pointer", background: "transparent", color: C.textSec, fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.color = "#10b981"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSec; }}
            >
              <Plus size={13} /> Sign Player
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main CapSheetTab ─────────────────────────────────────────────────────────
export default function CapSheetTab({ C, players, user, capCeiling: initialCeiling, setCapCeiling: syncCeiling }) {
  const { isMobile } = useWindowSize();

  // Settings
  const [capCeiling, setCapCeiling] = useState(50_000_000);
  const [capTeams, setCapTeams] = useState(12);
  const [capTeamNames, setCapTeamNames] = useState(() => Array.from({ length: 16 }, (_, i) => "Team " + (i + 1)));
  const [yourCapSlot, setYourCapSlot] = useState(1);
  const [showSetup, setShowSetup] = useState(false);

  // Contracts
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [addModal, setAddModal] = useState(null); // { team }
  const [editModal, setEditModal] = useState(null); // contract

  // Sort
  const [sortBy, setSortBy] = useState("slot"); // slot | cap_remaining | players

  // ── Load from Supabase ──
  useEffect(() => {
    loadAll();
  }, [user]);

  async function loadAll() {
    setLoading(true);
    try {
      if (!user) { setLoading(false); return; }
      const supabase = createClient();

      // Load settings
      const { data: settings } = await supabase
        .from("user_settings")
        .select("cap_ceiling, cap_teams, cap_team_names")
        .eq("user_id", user.id)
        .single();

      if (settings) {
        if (settings.cap_ceiling) setCapCeiling(settings.cap_ceiling);
        if (settings.cap_teams) setCapTeams(settings.cap_teams);
        if (settings.cap_team_names && settings.cap_team_names.length > 0) setCapTeamNames(settings.cap_team_names);
      }

      // Load contracts
      const { data: contractData, error: contractError } = await supabase
        .from("contracts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_cut", false)
        .order("team_slot", { ascending: true });

      if (contractError) throw contractError;
      setContracts(contractData || []);
    } catch (err) {
      console.error("loadAll error:", err);
      setError("Failed to load cap data.");
    }
    setLoading(false);
  }

  async function saveSettings(newCeiling, newTeams, newNames) {
    if (!user) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from("user_settings").upsert({
        user_id: user.id,
        cap_ceiling: newCeiling,
        cap_teams: newTeams,
        cap_team_names: newNames,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (error) console.error("saveSettings error:", error);
      else if (syncCeiling) syncCeiling(newCeiling);
    } catch (err) {
      console.error("saveSettings exception:", err);
    }
  }

  async function addContract(contractData) {
  if (!user) return;
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("contracts")
      .insert({ ...contractData, user_id: user.id })
      .select()
      .single();
    if (error) {
      console.error("addContract error details:", JSON.stringify(error, null, 2));
      console.error("error message:", error.message);
      console.error("error code:", error.code);
      console.error("error hint:", error.hint);
      throw error;
    }
    setContracts(prev => [...prev, data]);
  } catch (err) {
    console.error("addContract exception:", JSON.stringify(err, null, 2));
  }
}

  async function updateContract(id, updates) {
    if (!user) return;
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("contracts")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();
      if (error) throw error;
      setContracts(prev => prev.map(c => c.id === id ? data : c));
    } catch (err) {
      console.error("updateContract error:", err);
    }
  }

  async function deleteContract(id) {
    if (!user) return;
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("contracts")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      setContracts(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error("deleteContract error:", err);
    }
  }

  // ── Build teams data ──
  const teams = useMemo(() => {
    return Array.from({ length: capTeams }, (_, i) => {
      const slot = i + 1;
      const name = capTeamNames[i] || "Team " + slot;
      const teamContracts = contracts.filter(c => c.team_slot === slot && !c.is_cut);
      const totalSalary = teamContracts.reduce((s, c) => s + c.salary, 0);
      return { slot, name, contracts: teamContracts, totalSalary, capRemaining: capCeiling - totalSalary };
    });
  }, [capTeams, capTeamNames, contracts, capCeiling]);

  const sortedTeams = useMemo(() => {
    const t = [...teams];
    if (sortBy === "cap_remaining") return t.sort((a, b) => b.capRemaining - a.capRemaining);
    if (sortBy === "players") return t.sort((a, b) => b.contracts.length - a.contracts.length);
    return t; // slot order
  }, [teams, sortBy]);

  // ── League-wide stats ──
  const leagueStats = useMemo(() => {
    const totalCommitted = contracts.filter(c => !c.is_cut).reduce((s, c) => s + c.salary, 0);
    const totalCap = capCeiling * capTeams;
    const teamsOver = teams.filter(t => t.capRemaining < 0).length;
    const avgCapUsed = totalCommitted / Math.max(capTeams, 1);
    return { totalCommitted, totalCap, teamsOver, avgCapUsed };
  }, [contracts, capCeiling, capTeams, teams]);

  // ── Unauthenticated state ──
  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", background: C.cardBg, borderRadius: 20, border: "1px solid " + C.border }}>
        <DollarSign size={48} color="#10b981" style={{ marginBottom: 16 }} />
        <h2 style={{ fontSize: 24, fontWeight: 900, margin: "0 0 8px" }}>Salary Cap Manager</h2>
        <p style={{ color: C.textSec }}>Sign in to manage contracts and track cap space.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 60 }}>
        <div style={{ width: 40, height: 40, border: "3px solid #10b981", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
        <div style={{ color: C.textSec, fontFamily: "monospace", fontSize: 13 }}>Loading cap data...</div>
      </div>
    );
  }

  return (
    <div>
      {/* ── League Summary Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "Total Cap Pool", val: fmt(leagueStats.totalCap), color: "#818cf8" },
          { label: "Total Committed", val: fmt(leagueStats.totalCommitted), color: "#fbbf24" },
          { label: "Avg Cap Used", val: fmt(leagueStats.avgCapUsed), color: "#34d399" },
          { label: "Teams Over Cap", val: leagueStats.teamsOver, color: leagueStats.teamsOver > 0 ? "#ef4444" : "#34d399" },
        ].map(stat => (
          <div key={stat.label} style={{ background: C.cardBg, border: "1px solid " + C.border, borderRadius: 14, padding: "16px 18px", textAlign: "center" }}>
            <div style={{ fontWeight: 900, fontSize: isMobile ? 20 : 26, background: `linear-gradient(90deg, ${stat.color}, ${stat.color}cc)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{stat.val}</div>
            <div style={{ fontSize: 10, fontFamily: "monospace", color: C.textSec, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Controls ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { key: "slot", label: "By Slot" },
            { key: "cap_remaining", label: "Cap Space" },
            { key: "players", label: "Roster Size" },
          ].map(s => (
            <button key={s.key} onClick={() => setSortBy(s.key)}
              style={{ padding: "7px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, background: sortBy === s.key ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : C.btnBgAlt, color: sortBy === s.key ? "#fff" : C.textSec }}>
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowSetup(true)}
          style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid " + C.border, cursor: "pointer", background: C.btnBg, color: C.textSec, fontWeight: 700, fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
          ⚙ League Settings
        </button>
      </div>

      {/* ── Team Cards Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
        {sortedTeams.map(team => (
          <TeamCapCard
            key={team.slot}
            C={C}
            team={team}
            contracts={team.contracts}
            capCeiling={capCeiling}
            isYourTeam={team.slot === yourCapSlot}
            onAddContract={(t) => setAddModal({ team: t })}
            onEditContract={(c) => setEditModal(c)}
            players={players}
            isMobile={isMobile}
          />
        ))}
      </div>

      {/* ── Setup Modal ── */}
      {showSetup && (
        <div onClick={() => setShowSetup(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 520, borderRadius: 20, background: C.modalBg, border: "1px solid " + C.border, boxShadow: "0 32px 80px rgba(0,0,0,0.6)", padding: 28, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>⚙ Cap League Settings</h3>
              <button onClick={() => setShowSetup(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSec, fontSize: 22 }}>×</button>
            </div>

            {/* Cap ceiling */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontWeight: 700, fontSize: 11, color: C.textSec, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Salary Cap Ceiling</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {CAP_PRESETS.map(n => (
                  <button key={n} onClick={() => setCapCeiling(n)}
                    style={{ padding: "8px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, background: capCeiling === n ? "linear-gradient(135deg,#10b981,#0d9488)" : C.btnBgAlt, color: capCeiling === n ? "#fff" : C.textSec }}>
                    {fmt(n)}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 10, background: C.auctionHintBg, border: "1px solid rgba(245,158,11,0.2)", fontSize: 12, color: C.textSec }}>
                Total league cap: <strong style={{ color: "#fbbf24" }}>{fmt(capCeiling * capTeams)}</strong> across {capTeams} teams
              </div>
            </div>

            {/* Teams */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontWeight: 700, fontSize: 11, color: C.textSec, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Number of Teams</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[8, 10, 12, 14, 16].map(n => (
                  <button key={n} onClick={() => setCapTeams(n)}
                    style={{ padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, background: capTeams === n ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : C.btnBgAlt, color: capTeams === n ? "#fff" : C.textSec }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Your slot */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontWeight: 700, fontSize: 11, color: C.textSec, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Your Team Slot</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {Array.from({ length: capTeams }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setYourCapSlot(n)}
                    style={{ padding: "7px 13px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 12, background: yourCapSlot === n ? "linear-gradient(135deg,#818cf8,#6366f1)" : C.btnBgAlt, color: yourCapSlot === n ? "#fff" : C.textSec }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Team names */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontWeight: 700, fontSize: 11, color: C.textSec, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Team Names</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {Array.from({ length: capTeams }, (_, i) => i + 1).map(t => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: t === yourCapSlot ? "#818cf8" : C.textSec, minWidth: 20, textAlign: "right" }}>{t}</span>
                    <input
                      value={capTeamNames[t - 1] || ""}
                      onChange={e => setCapTeamNames(prev => { const n = [...prev]; n[t - 1] = e.target.value; return n; })}
                      placeholder={"Team " + t}
                      style={{ flex: 1, padding: "6px 10px", borderRadius: 8, border: t === yourCapSlot ? "1px solid rgba(99,102,241,0.5)" : "1px solid " + C.border, background: t === yourCapSlot ? C.yourInputBg : C.inputBg, color: C.textPri, fontSize: 12, outline: "none" }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => { saveSettings(capCeiling, capTeams, capTeamNames); setShowSetup(false); }}
              style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", cursor: "pointer", background: "linear-gradient(135deg,#10b981,#0d9488)", color: "#fff", fontWeight: 800, fontSize: 14 }}>
              ✓ Save League Settings
            </button>
          </div>
        </div>
      )}

      {/* ── Add Contract Modal ── */}
      {addModal && (
        <AddContractModal
          C={C}
          players={players}
          teamSlot={addModal.team.slot}
          teamName={addModal.team.name}
          onSave={addContract}
          onClose={() => setAddModal(null)}
        />
      )}

      {/* ── Edit Contract Modal ── */}
      {editModal && (
        <EditContractModal
          C={C}
          contract={editModal}
          onSave={updateContract}
          onDelete={deleteContract}
          onClose={() => setEditModal(null)}
        />
      )}
    </div>
  );
}
