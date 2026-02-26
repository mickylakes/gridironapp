import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

const DEFAULTS = {
  theme:       "dark",
  scoring:     "ppr",
  budget:      200,
  num_teams:   12,
  cap_ceiling: 50_000_000,
};

export default function useUserSettings(user) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);

  async function reload() {
    if (!user) return; // do not reset settings when logged out
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (err && err.code !== "PGRST116") {
        console.error("useUserSettings load error:", err);
        setError(err);
      }
      if (data) {
        // DB wins on overlap; DEFAULTS fill any missing keys; unknown DB keys preserved
        setSettings({ ...DEFAULTS, ...data });
      }
    } catch (err) {
      console.error("useUserSettings load exception:", err);
      setError(err);
    }
    setLoading(false);
  }

  async function save(patch) {
    if (!user) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { error: err } = await supabase
        .from("user_settings")
        .upsert(
          { user_id: user.id, ...patch, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
      if (err) console.error("useUserSettings save error:", err);
    } catch (err) {
      console.error("useUserSettings save exception:", err);
    }
    setSaving(false);
  }

  useEffect(() => {
    if (user) reload();
    // When user becomes null, return early — settings are not reset
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return { settings, setSettings, loading, saving, error, reload, save };
}
