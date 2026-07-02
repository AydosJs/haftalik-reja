import { countOf } from "@/lib/stats";
import type { Week } from "@/lib/types";

export function PulseChart({ week }: { week: Week }) {
  const maxCount = Math.max(1, ...week.members.map(countOf));
  const total = week.members.reduce((s, m) => s + countOf(m), 0);

  return (
    <section className="mb-7 rounded-2xl border border-line bg-navy-800 p-6">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl font-semibold">
          Jamoa bo&apos;yicha zayavkalar
        </h2>
        <div className="text-sm text-ink-400">
          Jami: <b className="text-base font-bold text-gold-400">{total}</b> ta zayavka
        </div>
      </div>
      <div className="flex flex-col gap-3.5">
        {week.members.map((m) => {
          const pct = Math.round((countOf(m) / maxCount) * 100);
          return (
            <div key={m.id} className="flex items-center gap-3.5">
              <div className="w-20 truncate text-sm font-semibold text-ink-200 sm:w-28">
                {m.name || "—"}
              </div>
              <div className="h-2.5 flex-1 overflow-hidden rounded-md bg-navy-700">
                <div
                  className="h-full rounded-md bg-gradient-to-r from-gold-500 to-gold-300 transition-[width] duration-500 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="w-9 text-right text-sm font-bold tabular-nums">
                {countOf(m)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
