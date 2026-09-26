"use client";

import { useEffect, useMemo, useState } from "react";
import { ACTIVITY_TYPES, CLIENTS, INSTRUCTORS, monthName } from "@/lib/data";
import { formatILS } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { ActivityType, InstructorId } from "@/lib/types";
import { Button } from "../ui/Button";
import { cn } from "../ui/cn";
import { InstructorAvatar } from "../ui/InstructorAvatar";
import { Sheet } from "../ui/Sheet";

const DEFAULT_DAY: Record<string, string> = {
  "2026-09": "2026-09-26",
  "2026-08": "2026-08-31",
  "2026-07": "2026-07-31",
};

export function NewActivitySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { month, addActivity, notify, closedMonths } = useStore();
  const [instructorId, setInstructor] = useState<InstructorId | null>(null);
  const [client, setClient] = useState("");
  const [type, setType] = useState<ActivityType>("חוג");
  const [date, setDate] = useState(DEFAULT_DAY[month]);
  const [quantity, setQuantity] = useState("1");
  const [revenue, setRevenue] = useState("");
  const [payout, setPayout] = useState("");

  useEffect(() => {
    if (open) setDate(DEFAULT_DAY[month]);
  }, [open, month]);

  const rev = Number(revenue) || 0;
  const pay = Number(payout) || 0;
  const profit = rev - pay;
  const margin = rev ? (profit / rev) * 100 : 0;
  const valid = instructorId && client.trim() && pay > 0 && rev >= 0 && revenue !== "";
  const locked = closedMonths.includes(month);

  const reset = () => {
    setInstructor(null);
    setClient("");
    setType("חוג");
    setQuantity("1");
    setRevenue("");
    setPayout("");
  };

  const save = () => {
    if (!valid || !instructorId) return;
    const m = date.slice(0, 7) as typeof month;
    addActivity({
      month: m,
      date,
      instructorId,
      client: client.trim(),
      type,
      quantity: Number(quantity) || 1,
      unit: type === "חוג" ? "מפגשים" : type === "יום פעילות" ? "כיתות" : "יחידות",
      revenue: rev,
      payout: pay,
    });
    notify("הפעילות נשמרה");
    reset();
    onClose();
  };

  const clientSuggestions = useMemo(() => CLIENTS, []);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      variant="drawer"
      title="פעילות חדשה"
      subtitle={locked ? `${monthName(month)} נסגר — הפעילות תתווסף כתיקון` : `תתווסף לחודש ${monthName(month)}`}
      footer={
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[11.5px] text-fg-3">רווח משוער</div>
            <div className="flex items-baseline gap-2">
              <span className={cn("num text-[20px] font-semibold", profit < 0 ? "text-neg" : "text-fg")}>
                {formatILS(profit)}
              </span>
              {rev > 0 && (
                <span className={cn("num text-[12px]", profit < 0 ? "text-neg" : "text-fg-3")}>
                  {margin.toFixed(1)}%
                </span>
              )}
            </div>
          </div>
          <Button variant="primary" size="lg" disabled={!valid} onClick={save} className="min-w-[132px]">
            שמירת פעילות
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <Field label="מדריך">
          <div className="grid grid-cols-3 gap-2">
            {INSTRUCTORS.map((i) => {
              const sel = instructorId === i.id;
              return (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => setInstructor(i.id)}
                  aria-pressed={sel}
                  className={cn(
                    "h-11 rounded-xl flex items-center gap-2 px-2.5 text-[13.5px] transition-all",
                    sel
                      ? "bg-signal/10 ring-1 ring-inset ring-signal/40 text-fg"
                      : "bg-white/[0.035] ring-1 ring-inset ring-white/[0.06] text-fg-2 hover:bg-white/[0.06]",
                  )}
                >
                  <InstructorAvatar id={i.id} size="sm" />
                  <span className="truncate">{i.name}</span>
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="לקוח / מסגרת">
          <input
            list="clients"
            aria-label="לקוח / מסגרת"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="לדוגמה: ילדי הפלא"
            className={inputCls}
          />
          <datalist id="clients">
            {clientSuggestions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            {clientSuggestions.slice(0, 5).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setClient(c)}
                className="shrink-0 h-7 px-2.5 rounded-full text-[12px] text-fg-3 bg-white/[0.035] hover:text-fg hover:bg-white/[0.07] transition-colors"
              >
                {c}
              </button>
            ))}
          </div>
        </Field>

        <Field label="סוג פעילות">
          <div className="flex flex-wrap gap-1.5">
            {ACTIVITY_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                aria-pressed={type === t}
                className={cn(
                  "h-9 px-3.5 rounded-full text-[13px] transition-colors",
                  type === t
                    ? "bg-fg text-ink-900 font-semibold"
                    : "bg-white/[0.04] text-fg-2 ring-1 ring-inset ring-white/[0.06] hover:bg-white/[0.07]",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="תאריך">
            <input type="date" aria-label="תאריך" value={date} onChange={(e) => setDate(e.target.value)} className={cn(inputCls, "num w-full text-right")} />
          </Field>
          <Field label="כמות">
            <input
              inputMode="numeric"
              aria-label="כמות"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ""))}
              className={cn(inputCls, "num w-full")}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="הכנסה לחברה">
            <MoneyInput label="הכנסה לחברה" value={revenue} onChange={setRevenue} />
          </Field>
          <Field label="תשלום למדריך">
            <MoneyInput label="תשלום למדריך" value={payout} onChange={setPayout} />
          </Field>
        </div>
      </div>
    </Sheet>
  );
}

const inputCls =
  "h-12 w-full rounded-xl bg-white/[0.04] ring-1 ring-inset ring-white/[0.08] px-3.5 text-[16px] text-fg placeholder:text-fg-4 outline-none focus:ring-signal/50 focus:bg-white/[0.06] transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label}>
      <span className="block text-[12.5px] text-fg-3 mb-2">{label}</span>
      {children}
    </div>
  );
}

function MoneyInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative" dir="ltr">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-3 num">₪</span>
      <input
        inputMode="numeric"
        aria-label={label}
        value={value}
        placeholder="0"
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        className={cn(inputCls, "num w-full pl-8 text-left")}
      />
    </div>
  );
}
