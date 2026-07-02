"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { uz } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { brandOverlayTheme } from "@/lib/brand-theme";

function parseIso(value: string): Date | undefined {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatLabel(value: string): string {
  const [y, m, d] = value.split("-");
  return y && m && d ? `${d}.${m}.${y}` : "";
}

export function DatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (iso: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-md text-sm font-semibold text-ink-200 outline-none transition-colors hover:text-ink-050 focus-visible:ring-2 focus-visible:ring-gold-400/50">
          <CalendarIcon className="size-3.5 text-ink-400" />
          {value ? formatLabel(value) : "Sana tanlash"}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0" style={brandOverlayTheme}>
        <Calendar
          mode="single"
          locale={uz}
          selected={parseIso(value)}
          defaultMonth={parseIso(value)}
          onSelect={(d) => {
            if (d) onChange(toIso(d));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
