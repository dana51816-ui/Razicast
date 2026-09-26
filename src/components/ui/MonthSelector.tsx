"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { MONTHS, monthLabel } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "./cn";

export function MonthSelector({ className }: { className?: string }) {
  const { month, setMonth, closedMonths } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const closed = closedMonths.includes(month);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="group h-9 ps-3 pe-2.5 inline-flex items-center gap-2 rounded-full bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] transition-colors"
      >
        <span
          className={cn(
            "size-1.5 rounded-full",
            closed ? "bg-fg-4" : "bg-signal shadow-[0_0_8px_rgba(200,242,74,.8)]",
          )}
        />
        <span className="text-[13.5px] font-medium text-fg">
          <span className="sm:hidden">{monthLabel(month).split(" ")[0]}</span>
          <span className="hidden sm:inline">{monthLabel(month)}</span>
        </span>
        <ChevronDown
          className={cn("size-4 text-fg-3 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute z-50 mt-2 start-0 sm:start-auto sm:end-0 w-56 p-1.5 rounded-2xl surface-raised origin-top-right sm:origin-top-left"
          >
            {MONTHS.map((m) => {
              const isClosed = closedMonths.includes(m.key);
              const selected = m.key === month;
              return (
                <li key={m.key}>
                  <button
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      setMonth(m.key);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full h-10 px-3 rounded-xl flex items-center justify-between text-[14px] transition-colors",
                      selected ? "bg-white/[0.07] text-fg" : "text-fg-2 hover:bg-white/[0.04]",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {m.label}
                      {isClosed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-fg-4">
                          <Lock className="size-3" /> נסגר
                        </span>
                      ) : (
                        <span className="text-[11px] text-signal">פתוח</span>
                      )}
                    </span>
                    {selected && <Check className="size-4 text-signal" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
