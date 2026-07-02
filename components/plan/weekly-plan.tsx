"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { brandOverlayTheme } from "@/lib/brand-theme";
import { loadState, saveState } from "@/lib/storage";
import { usingSupabase } from "@/lib/supabase";
import { seedData, uid } from "@/lib/seed";
import type { Member, PlanState } from "@/lib/types";
import { PlanSkeleton } from "./plan-skeleton";
import { PulseChart } from "./pulse-chart";
import { ReportTable } from "./report-table";
import { MemberCard } from "./member-card";

type PendingDelete =
  | { kind: "member"; memberId: string; name: string }
  | { kind: "week"; weekId: string; label: string }
  | null;

function todayParts() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return { label: `${dd}.${mm}.${yyyy}`, iso: `${yyyy}-${mm}-${dd}` };
}

export default function WeeklyPlan() {
  const [state, setState] = useState<PlanState | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let s = await loadState();
        if (!s) {
          s = seedData();
          await saveState(s);
        }
        if (!cancelled) {
          setState(s);
          if (!usingSupabase) {
            toast.warning(
              "Ma'lumotlar faqat shu brauzerda saqlanmoqda. Jamoa bilan ulashish uchun Supabase ni sozlang (README ga qarang).",
              { duration: 6000 }
            );
          }
        }
      } catch (e) {
        console.error("Storage error", e);
        if (!cancelled) {
          toast.error("Ma'lumotni yuklab bo'lmadi — Supabase sozlamalarini tekshiring");
          setState(seedData());
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const scheduleSave = useCallback((next: PlanState) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveState(next);
        toast("Saqlandi", { duration: 1400 });
      } catch (e) {
        console.error("Storage error", e);
        toast.error("Saqlashda xatolik");
      }
    }, 600);
  }, []);

  const mutate = useCallback(
    (recipe: (draft: PlanState) => void) => {
      setState((prev) => {
        if (!prev) return prev;
        const next = structuredClone(prev);
        recipe(next);
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  if (!state) {
    return <PlanSkeleton />;
  }

  const week = state.weeks.find((w) => w.id === state.activeWeekId) ?? state.weeks[0];

  const updateMember = (memberId: string) => (recipe: (m: Member) => void) =>
    mutate((s) => {
      const wk = s.weeks.find((w) => w.id === week.id);
      const m = wk?.members.find((x) => x.id === memberId);
      if (m) recipe(m);
    });

  const addMember = () =>
    mutate((s) => {
      const wk = s.weeks.find((w) => w.id === week.id);
      if (!wk) return;
      wk.members.push({
        id: uid(),
        name: "Yangi a'zo",
        count: 0,
        date: wk.members[0]?.date || "",
        tasks: [],
      });
    });

  const addWeek = () =>
    mutate((s) => {
      const { label, iso } = todayParts();
      const prev = s.weeks.find((w) => w.id === s.activeWeekId) ?? s.weeks[0];
      const newWeek = {
        id: uid(),
        startLabel: label,
        members: prev.members.map((m) => ({
          id: uid(),
          name: m.name,
          count: 0,
          date: iso,
          tasks: [],
        })),
      };
      s.weeks.unshift(newWeek);
      s.activeWeekId = newWeek.id;
    });

  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.kind === "member") {
      const { memberId } = pendingDelete;
      mutate((s) => {
        const wk = s.weeks.find((w) => w.id === week.id);
        if (wk) wk.members = wk.members.filter((m) => m.id !== memberId);
      });
    } else {
      const { weekId } = pendingDelete;
      mutate((s) => {
        s.weeks = s.weeks.filter((w) => w.id !== weekId);
        s.activeWeekId = s.weeks[0].id;
      });
    }
    setPendingDelete(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-7 sm:pb-20 sm:pt-9">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-line pb-7">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold-400">
            Registon LC · Rekruting jamoasi
          </div>
          <h1 className="font-display text-4xl font-semibold leading-none sm:text-5xl">
            Haftalik <em className="italic text-gold-400">reja</em>
          </h1>
          <div className="mt-1 text-xs text-ink-400 sm:text-sm">
            {week.startLabel} kunidan boshlangan haftalik reja
          </div>
          <div
            className={`mt-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
              usingSupabase ? "bg-teal-500/15 text-teal-400" : "bg-gold-400/15 text-gold-400"
            }`}
            title={
              usingSupabase
                ? "Ma'lumotlar Supabase serverida saqlanadi va jamoa bilan ulashiladi"
                : "Supabase sozlanmagan — ma'lumotlar faqat shu brauzerning xotirasida turadi"
            }
          >
            <span className="size-1.5 rounded-full bg-current" />
            {usingSupabase
              ? "Serverda saqlanmoqda (Supabase)"
              : "Faqat shu brauzerda saqlanmoqda"}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-line bg-navy-800 px-2 py-1.5">
            <Select
              value={week.id}
              onValueChange={(v) => mutate((s) => void (s.activeWeekId = v))}
            >
              <SelectTrigger className="max-w-55 border-none bg-transparent text-sm font-medium text-ink-050 shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-line bg-navy-800 text-ink-050">
                {state.weeks.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.startLabel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon-sm"
              className="border-line bg-navy-700 text-ink-200 hover:bg-coral-400/20 hover:text-coral-400"
              title="Bu haftani o'chirish"
              onClick={() => {
                if (state.weeks.length <= 1) {
                  toast.error("Kamida bitta hafta qolishi kerak.");
                  return;
                }
                setPendingDelete({ kind: "week", weekId: week.id, label: week.startLabel });
              }}
            >
              <X />
            </Button>
          </div>
          <Button
            className="rounded-lg bg-gradient-to-br from-gold-400 to-gold-500 px-4 font-bold text-navy-950 hover:from-gold-300 hover:to-gold-400"
            onClick={addWeek}
          >
            + Yangi hafta
          </Button>
        </div>
      </header>

      <PulseChart week={week} />

      <div className="mb-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {week.members.map((m) => (
          <MemberCard
            key={m.id}
            member={m}
            onUpdate={updateMember(m.id)}
            onDeleteRequest={() =>
              setPendingDelete({ kind: "member", memberId: m.id, name: m.name })
            }
          />
        ))}
        <button
          className="flex min-h-30 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-navy-600 text-sm font-semibold text-ink-400 transition-colors hover:border-gold-400 hover:bg-gold-400/5 hover:text-gold-400"
          onClick={addMember}
        >
          <span>＋</span>
          <span>A&apos;zo qo&apos;shish</span>
        </button>
      </div>

      <ReportTable week={week} />

      <div className="mt-8 text-center text-xs tracking-wide text-ink-600">
        {usingSupabase
          ? "Barcha o'zgarishlar avtomatik serverga saqlanadi va havolaga ega jamoa a'zolariga ko'rinadi."
          : "Barcha o'zgarishlar avtomatik saqlanadi — hozircha faqat shu brauzerda. Jamoa bilan ulashish uchun Supabase ni sozlang."}
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent style={brandOverlayTheme} className="ring-line">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDelete?.kind === "week"
                ? `"${pendingDelete.label}" haftasini o'chirmoqchimisiz?`
                : `${pendingDelete?.name ?? ""} ni jamoadan o'chirmoqchimisiz?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bu amalni ortga qaytarib bo&apos;lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              className="bg-coral-400 text-navy-950 hover:bg-coral-400/80"
              onClick={confirmDelete}
            >
              O&apos;chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
