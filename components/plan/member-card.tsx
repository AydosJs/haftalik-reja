"use client";

import { useEffect, useRef, useState } from "react";
import { X, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { uid } from "@/lib/seed";
import { memberPct } from "@/lib/stats";
import type { Member } from "@/lib/types";
import { DatePicker } from "./date-picker";

interface MemberCardProps {
  member: Member;
  onUpdate: (recipe: (m: Member) => void) => void;
  onDeleteRequest: () => void;
}

export function MemberCard({ member, onUpdate, onDeleteRequest }: MemberCardProps) {
  const [focusTaskId, setFocusTaskId] = useState<string | null>(null);
  const pct = memberPct(member);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-navy-800 p-5">
      <div className="flex items-start justify-between gap-2.5">
        <input
          className="w-full border-b border-transparent bg-transparent font-display text-2xl font-bold text-ink-050 outline-none transition-colors hover:border-gold-400 focus:border-gold-400"
          value={member.name}
          onChange={(e) => onUpdate((m) => void (m.name = e.target.value))}
        />
        <Button
          variant="outline"
          size="icon-sm"
          className="shrink-0 border-line bg-navy-700 text-ink-200 hover:bg-coral-400/20 hover:text-coral-400"
          title="A'zoni o'chirish"
          onClick={onDeleteRequest}
        >
          <X />
        </Button>
      </div>

      <div className="rounded-xl border border-line bg-navy-900 p-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <div className="text-xs font-semibold uppercase tracking-widest text-ink-600">
              Zayavka
            </div>
            <input
              type="number"
              min={0}
              className="w-full bg-transparent font-display text-3xl font-bold text-gold-400 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              value={member.count}
              onChange={(e) => onUpdate((m) => void (m.count = e.target.value))}
            />
          </div>
          <div className="flex flex-col items-start gap-1">
            <div className="text-xs font-semibold uppercase tracking-widest text-ink-600">
              Sana
            </div>
            <div className="flex min-h-9 items-center">
              <DatePicker
                value={member.date || ""}
                onChange={(iso) => onUpdate((m) => void (m.date = iso))}
              />
            </div>
          </div>
        </div>

        <div className="mt-3 border-t border-line pt-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-widest text-ink-600">
              Bajarilish
            </span>
            <span className="font-bold tabular-nums text-ink-200">{pct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-navy-700">
            <div
              className="h-full rounded-full bg-teal-500 transition-[width] duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-ink-600">
          Haftalik reja
        </div>
        <div className="flex flex-col gap-2">
          {member.tasks.map((t) => (
            <div
              key={t.id}
              className="flex items-start gap-2.5 rounded-lg border border-transparent bg-navy-900 px-2.5 py-2 transition-colors hover:border-line"
            >
              <Checkbox
                checked={t.done}
                onCheckedChange={(v) =>
                  onUpdate((m) => {
                    const task = m.tasks.find((x) => x.id === t.id);
                    if (task) task.done = v === true;
                  })
                }
                className="mt-0.5 size-4.5 rounded-sm border-ink-600 data-[state=checked]:border-teal-500 data-[state=checked]:bg-teal-500 data-[state=checked]:text-navy-950"
              />
              <AutoGrowTextarea
                value={t.text}
                autoFocus={t.id === focusTaskId}
                done={t.done}
                onChange={(text) =>
                  onUpdate((m) => {
                    const task = m.tasks.find((x) => x.id === t.id);
                    if (task) task.text = text;
                  })
                }
              />
              <button
                className="shrink-0 rounded-sm p-0.5 text-ink-600 transition-colors hover:text-coral-400"
                title="Vazifani o'chirish"
                onClick={() =>
                  onUpdate((m) => void (m.tasks = m.tasks.filter((x) => x.id !== t.id)))
                }
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-ink-600 px-2.5 py-2 text-xs font-semibold text-ink-400 transition-colors hover:border-gold-400 hover:text-gold-400"
        onClick={() => {
          const id = uid();
          setFocusTaskId(id);
          onUpdate((m) => void m.tasks.push({ id, text: "", done: false }));
        }}
      >
        <Plus className="size-3.5" /> Vazifa qo&apos;shish
      </button>
    </div>
  );
}

function AutoGrowTextarea({
  value,
  done,
  autoFocus,
  onChange,
}: {
  value: string;
  done: boolean;
  autoFocus?: boolean;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      autoFocus={autoFocus}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`flex-1 resize-none bg-transparent pt-px text-sm leading-snug outline-none ${
        done ? "text-ink-600 line-through" : "text-ink-050"
      }`}
    />
  );
}
