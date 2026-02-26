import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function useDraftPersistence(user) {
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);

  /**
   * Fetches the user's draft row from Supabase.
   * Returns the raw DB row, or null if none exists / user not logged in.
   */
  async function loadDraft() {
    if (!user?.id) return null;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("drafts")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (err && err.code !== "PGRST116") {
        console.error("loadDraft error:", err);
        setError(err);
      }
      return data ?? null;
    } catch (err) {
      console.error("loadDraft exception:", err);
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Upserts the current draft state to Supabase.
   * @param {Object} currentPicks  - picks map { pickIndex: player }
   * @param {Object} currentBids   - auction bids map { playerId: { team, amount } }
   * @param {Object} snapshot      - current draft config from the component:
   *   { draftType, draftTeams, draftRounds, yourSlot, teamNames, idpOn, auctBudget }
   */
  async function saveDraft(currentPicks, currentBids, snapshot) {
    if (!user?.id) return;
    const { draftType, draftTeams, draftRounds, yourSlot, teamNames, idpOn, auctBudget } = snapshot;
    setSaving(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase.from("drafts").upsert({
        user_id: user.id,
        name: `Draft ${new Date().toLocaleDateString()}`,
        draft_type: draftType,
        teams: draftTeams,
        rounds: draftRounds,
        your_slot: yourSlot,
        picks: currentPicks || {},
        auction_bids: currentBids || {},
        settings: { teamNames, idpOn, auctBudget },
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (err) console.error("saveDraft error:", err);
    } catch (err) {
      console.error("saveDraft exception:", err);
    }
    setSaving(false);
  }

  return { loadDraft, saveDraft, loading, saving, error };
}
