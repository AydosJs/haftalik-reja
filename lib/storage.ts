import { supabase } from "./supabase";
import type { PlanState } from "./types";

// The single shared row every team member reads from and writes to.
export const PLAN_ID = "registon-weekly-plan";
const STORAGE_KEY = PLAN_ID;

// The plan lives only on the server (Supabase). There is no localStorage
// fallback: if the server is unreachable we fail loudly rather than silently
// writing to a per-browser copy that other team members never see.
function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase sozlanmagan: NEXT_PUBLIC_SUPABASE_URL va NEXT_PUBLIC_SUPABASE_ANON_KEY muhit o'zgaruvchilari o'rnatilishi kerak."
    );
  }
  return supabase;
}

export async function loadState(): Promise<PlanState | null> {
  const db = requireSupabase();
  const { data, error } = await db
    .from("plans")
    .select("state")
    .eq("id", STORAGE_KEY)
    .maybeSingle();
  if (error) throw error;
  return (data?.state as PlanState) ?? null;
}

export async function saveState(state: PlanState): Promise<void> {
  const db = requireSupabase();
  const { error } = await db
    .from("plans")
    .upsert({ id: STORAGE_KEY, state, updated_at: new Date().toISOString() });
  if (error) throw error;
}
