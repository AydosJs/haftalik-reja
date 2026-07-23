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
import { loadState, saveState, PLAN_ID } from "@/lib/storage";
import { supabase, usingSupabase } from "@/lib/supabase";
import { seedData, uid } from "@/lib/seed";
import type { Member, PlanState } from "@/lib/types";
import { PlanSkeleton } from "./plan-skeleton";
import { PulseChart } from "./pulse-chart";
import { ReportTable } from "./report-table";
import { MemberCard } from "./member-card";

type PendingDelete =
  | { kind: "member"; memberId: string; name: string }
  | { kind: "week"; weekId: string; label: string }
  | { kind: "task"; memberId: string; taskId: string; text: string }
  | null;

function todayParts() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return { label: `${dd}.${mm}.${yyyy}`, iso: `${yyyy}-${mm}-${dd}` };
}

type LoadError = "config" | "load";

export default function WeeklyPlan() {
  const [state, setState] = useState<PlanState | null>(null);
  const [loadError, setLoadError] = useState<LoadError | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [confirmAddWeek, setConfirmAddWeek] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // JSON of the last state we know the server holds — either what we loaded,
  // what we just saved, or what arrived over Realtime. Used to (a) ignore the
  // echo of our own writes and (b) decide when a remote change is genuinely new.
  const serverStateRef = useRef<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Without a configured server there is nowhere safe to save. Show an
      // error instead of silently falling back to a per-browser copy.
      if (!usingSupabase) {
        if (!cancelled) setLoadError("config");
        return;
      }
      try {
        let s = await loadState();
        // Only seed when the server genuinely has no plan yet (first run).
        // On a load *error* we never show seed data, because editing it would
        // overwrite the real plan on the server.
        if (!s) {
          s = seedData();
          await saveState(s);
        }
        if (!cancelled) {
          serverStateRef.current = JSON.stringify(s);
          setState(s);
        }
      } catch (e) {
        console.error("Storage error", e);
        if (!cancelled) setLoadError("load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Live sync: subscribe to changes on the shared row so every open tab stays
  // current. Without this, a tab left open for hours holds a stale copy and its
  // next save silently overwrites everyone else's edits.
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const channel = client
      .channel("plan-sync")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "plans",
          filter: `id=eq.${PLAN_ID}`,
        },
        (payload) => {
          const incoming = (payload.new as { state?: PlanState }).state;
          if (!incoming) return;
          const incomingStr = JSON.stringify(incoming);
          // Ignore the echo of our own save, or an identical no-op update.
          if (incomingStr === serverStateRef.current) return;
          // Don't clobber an edit the user is in the middle of making; our own
          // pending save will land in a moment. Only adopt remote state when we
          // have nothing unsaved.
          if (saveTimer.current) return;
          serverStateRef.current = incomingStr;
          setState(incoming);
          toast("Reja boshqa a'zo tomonidan yangilandi", { duration: 2200 });
        }
      )
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }, []);

  const scheduleSave = useCallback((next: PlanState) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      saveTimer.current = null;
      try {
        await saveState(next);
        // Record what the server now holds so the Realtime echo is ignored.
        serverStateRef.current = JSON.stringify(next);
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

  if (loadError) {
    const message =
      loadError === "config"
        ? "Server (Supabase) sozlanmagan. NEXT_PUBLIC_SUPABASE_URL va NEXT_PUBLIC_SUPABASE_ANON_KEY o'rnatilishi kerak."
        : "Ma'lumotni serverdan yuklab bo'lmadi. Internet aloqasini yoki Supabase loyihasini (to'xtatilgan bo'lishi mumkin) tekshiring va qayta urinib ko'ring.";
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="text-xs font-semibold uppercase tracking-widest text-gold-400">
          Registon LC · Rekruting jamoasi
        </div>
        <h1 className="font-display text-3xl font-semibold">
          Ma&apos;lumotni yuklab bo&apos;lmadi
        </h1>
        <p className="text-sm text-ink-400">{message}</p>
        <Button
          className="rounded-lg bg-gradient-to-br from-gold-400 to-gold-500 px-4 font-bold text-navy-950 hover:from-gold-300 hover:to-gold-400"
          onClick={() => window.location.reload()}
        >
          Qayta urinish
        </Button>
      </div>
    );
  }

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
    } else if (pendingDelete.kind === "task") {
      const { memberId, taskId } = pendingDelete;
      mutate((s) => {
        const wk = s.weeks.find((w) => w.id === week.id);
        const m = wk?.members.find((x) => x.id === memberId);
        if (m) m.tasks = m.tasks.filter((t) => t.id !== taskId);
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
            onClick={() => setConfirmAddWeek(true)}
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
            onTaskDeleteRequest={(taskId, text) =>
              setPendingDelete({ kind: "task", memberId: m.id, taskId, text })
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

      <AlertDialog
        open={confirmAddWeek}
        onOpenChange={setConfirmAddWeek}
      >
        <AlertDialogContent style={brandOverlayTheme} className="ring-line">
          <AlertDialogHeader>
            <AlertDialogTitle>Yangi hafta ochilsinmi?</AlertDialogTitle>
            <AlertDialogDescription>
              Yangi bo&apos;sh hafta ochiladi va u barcha jamoa a&apos;zolariga
              ko&apos;rsatiladi. Oldingi haftalar va ulardagi vazifalar
              o&apos;chirilmaydi — ular yuqoridagi ro&apos;yxatdan tanlab
              ko&apos;riladi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Bekor qilish</AlertDialogCancel>
            <AlertDialogAction
              className="bg-gradient-to-br from-gold-400 to-gold-500 text-navy-950 hover:from-gold-300 hover:to-gold-400"
              onClick={addWeek}
            >
              Ha, yangi hafta ochish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent style={brandOverlayTheme} className="ring-line">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingDelete?.kind === "week"
                ? `"${pendingDelete.label}" haftasini o'chirmoqchimisiz?`
                : pendingDelete?.kind === "task"
                  ? `Bu vazifani o'chirmoqchimisiz?`
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
