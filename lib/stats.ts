import type { Member } from "./types";

export function countOf(m: Member): number {
  return Number(m.count) || 0;
}

export function memberPct(m: Member): number {
  if (m.tasks.length === 0) return 0;
  const done = m.tasks.filter((t) => t.done).length;
  return Math.round((done / m.tasks.length) * 100);
}

export function badgeFor(pct: number): { cls: string; label: string } {
  if (pct >= 80) return { cls: "bg-teal-500/15 text-teal-400", label: "A'lo" };
  if (pct >= 40) return { cls: "bg-gold-400/15 text-gold-400", label: "Jarayonda" };
  return { cls: "bg-coral-400/15 text-coral-400", label: "Sust" };
}
