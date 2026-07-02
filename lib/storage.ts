import { supabase } from "./supabase";
import type { PlanState } from "./types";

const STORAGE_KEY = "registon-weekly-plan";

export async function loadState(): Promise<PlanState | null> {
  if (supabase) {
    const { data, error } = await supabase
      .from("plans")
      .select("state")
      .eq("id", STORAGE_KEY)
      .maybeSingle();
    if (error) throw error;
    if (data?.state) return data.state as PlanState;
    // One-time migration: if this browser has data from before Supabase
    // was configured, seed the server with it instead of starting fresh.
    const local = window.localStorage.getItem(STORAGE_KEY);
    if (local) {
      const state = JSON.parse(local) as PlanState;
      await saveState(state);
      return state;
    }
    return null;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as PlanState) : null;
}

export async function saveState(state: PlanState): Promise<void> {
  if (supabase) {
    const { error } = await supabase
      .from("plans")
      .upsert({ id: STORAGE_KEY, state, updated_at: new Date().toISOString() });
    if (error) throw error;
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
