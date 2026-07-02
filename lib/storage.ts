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
    return (data?.state as PlanState) ?? null;
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
