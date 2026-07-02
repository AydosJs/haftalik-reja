import { badgeFor, memberPct } from "@/lib/stats";
import type { Week } from "@/lib/types";

const COLUMNS = "sm:grid-cols-[1.3fr_1fr_2fr_auto_auto]";

export function ReportTable({ week }: { week: Week }) {
  const rows = week.members
    .map((m) => ({
      m,
      total: m.tasks.length,
      done: m.tasks.filter((t) => t.done).length,
      pct: memberPct(m),
    }))
    .sort((a, b) => b.pct - a.pct);

  const avg = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.pct, 0) / rows.length)
    : 0;

  return (
    <section className="mt-1.5 rounded-2xl border border-line bg-navy-800 p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl font-semibold">Bajarilish hisoboti</h2>
        <div className="text-sm text-ink-400">
          Jamoa o&apos;rtachasi:{" "}
          <b className="text-base font-bold text-teal-400">{avg}%</b>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="px-3 py-2.5 text-xs text-ink-400">
          Hozircha jamoa a&apos;zolari yo&apos;q.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <div
            className={`hidden gap-3.5 border-b border-line px-3 pb-2 text-xs font-bold uppercase tracking-wider text-ink-600 sm:grid ${COLUMNS}`}
          >
            <div>A&apos;zo</div>
            <div>Vazifalar</div>
            <div>Bajarilish</div>
            <div className="w-12 text-right">Foiz</div>
            <div className="w-20 text-center">Holat</div>
          </div>

          {rows.map((r) => {
            const badge = badgeFor(r.pct);
            return (
              <div
                key={r.m.id}
                className={`grid grid-cols-[1fr_auto] items-center gap-x-3.5 gap-y-1.5 rounded-lg bg-navy-900 px-3 py-2.5 sm:gap-y-0 ${COLUMNS}`}
              >
                <div className="truncate text-sm font-bold max-sm:order-1">
                  {r.m.name || "—"}
                </div>
                <div className="text-xs tabular-nums text-ink-400 max-sm:order-3">
                  {r.done} / {r.total} vazifa
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-navy-700 max-sm:order-5 max-sm:col-span-2 max-sm:mt-1">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-600 to-teal-400 transition-[width] duration-500 ease-out"
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
                <div className="text-right text-sm font-bold tabular-nums max-sm:order-4 sm:w-12">
                  {r.pct}%
                </div>
                <div
                  className={`whitespace-nowrap rounded-full px-2 py-1 text-center text-xs font-bold max-sm:order-2 max-sm:justify-self-end sm:w-20 ${badge.cls}`}
                >
                  {badge.label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
