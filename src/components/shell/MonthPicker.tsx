"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { isClosed, knownMonths } from "@/lib/calc";
import { monthLabel, monthName } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "../ui/cn";
import { IconCheck, IconChevronDown } from "./icons";

export function MonthPicker({ className }: { className?: string }) {
  const { data, month, setMonth, resetDemo, notify } = useStore();
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setConfirmReset(false);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="h-10 ps-4 pe-3 rounded-full border-[1.5px] border-ink flex items-center gap-1.5 text-[14px] font-semibold whitespace-nowrap"
      >
        <span className="min-[400px]:hidden">{monthName(month)}</span>
        <span className="max-[399px]:hidden">{monthLabel(month)}</span>
        <IconChevronDown strokeWidth={2.4} className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 end-0 w-64 rounded-2xl bg-paper p-1.5 shadow-[0_20px_50px_-15px_rgba(13,14,16,.35)]"
          >
            <ul role="listbox" aria-label="חודש">
              {knownMonths(data).map((m) => {
                const closed = isClosed(data, m);
                return (
                  <li key={m}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={m === month}
                      onClick={() => {
                        setMonth(m);
                        setOpen(false);
                      }}
                      className={cn(
                        "w-full h-11 px-3 rounded-xl flex items-center justify-between text-[15px]",
                        m === month ? "bg-stone font-bold" : "hover:bg-stone",
                      )}
                    >
                      <span>
                        {monthLabel(m)} <span className="text-[12px] font-medium text-ink-2">{closed ? "· נסגר" : "· פתוח"}</span>
                      </span>
                      {m === month && <IconCheck strokeWidth={2.6} className="size-4 text-cobalt" />}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-1 pt-1 border-t border-rule">
              {confirmReset ? (
                <div className="p-2">
                  <p className="text-[13px] text-ink-2 leading-snug">כל מה שהוזן במכשיר הזה יימחק ונתוני הדמו יחזרו. להמשיך?</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetDemo();
                        setOpen(false);
                        notify("נתוני הדמו שוחזרו");
                      }}
                      className="flex-1 h-10 rounded-xl bg-ink text-white text-[14px] font-bold"
                    >
                      איפוס
                    </button>
                    <button type="button" onClick={() => setConfirmReset(false)} className="flex-1 h-10 rounded-xl bg-stone text-[14px] font-semibold">
                      ביטול
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="w-full h-10 px-3 rounded-xl text-start text-[13px] font-semibold text-ink-2 hover:bg-stone"
                >
                  איפוס לנתוני הדמו
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
