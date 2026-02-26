import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function useFavorites(user) {
  const [favorites, setFavorites] = useState(new Set());
  const [loading,   setLoading]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState(null);

  async function loadFavorites() {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("favorites")
        .select("player_id")
        .eq("user_id", user.id);
      if (err) {
        console.error("loadFavorites error:", err);
        setError(err);
      }
      if (data) setFavorites(new Set(data.map(f => f.player_id)));
    } catch (err) {
      console.error("loadFavorites exception:", err);
      setError(err);
    }
    setLoading(false);
  }

  // Captures isFav before optimistic update so the DB direction is always correct.
  // Optimistic update fires first (even when logged out); DB write is gated on user.
  async function toggleFavorite(id) {
    const isFav = favorites.has(id);
    setFavorites(prev => { const n = new Set(prev); isFav ? n.delete(id) : n.add(id); return n; });
    if (!user?.id) return;
    setSaving(true);
    try {
      const supabase = createClient();
      if (isFav) {
        const { error: err } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("player_id", id);
        if (err) console.error("toggleFav delete error:", err);
      } else {
        const { error: err } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, player_id: id });
        if (err) console.error("toggleFav insert error:", err);
      }
    } catch (err) {
      console.error("toggleFav exception:", err);
    }
    setSaving(false);
  }

  return { favorites, setFavorites, loadFavorites, toggleFavorite, loading, saving, error };
}
