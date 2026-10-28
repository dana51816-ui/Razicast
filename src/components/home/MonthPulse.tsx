"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { activitiesIn, activityProfit, frameworkOf, instructorOf, totalsOf } from "@/lib/calc";
import { formatILS, monthName, signedILS } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "../ui/cn";

/**
 * The month's pulse: one column per day. Height = that day's revenue,
 * colour = what the money did (profit / loss / missing). Tap a day to see it.
 */
export function MonthPulse({ start = true }: { start?: boolean }) {
  const { data, month, openFlow, today: todayISO, currentMonth } = useStore();
  const reduce = useReducedMotion();
  const [picked, setPicked] = useState<number | null>(null);

  const [y, m] = month.split("-").map(Number);
  const days = new Date(y, m, 0).getDate();
  const acts = activitiesIn(data, month);
  const today = month === currentMonth ? Number(todayISO.slice(8)) : null;

  const byDay = Array.from({ length: days }, (_, i) => {
    const day = i + 1;
    const list = acts.filter((a) => Number(a.date.slice(8)) === day);
    const t = totalsOf(list);
    const state = list.length === 0 ? "none" : t.incomplete.count > 0 ? "missing" : (t.profit ?? 0) < 0 ? "loss" : "profit";
    return { day, list, t, state };
  });
  const max = Math.max(1, ...byDay.map((d) => d.t.revenue));
  const activeDays = byDay.filter((d) => d.list.length > 0).length;
  const sel = picked !== null ? byDay[picked - 1] : null;

  return (
    <section aria-label={`דופק ${monthName(month)}`} className="mt-9">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[16px] font-bold">דופק {monthName(month)}</h2>
        <span className="text-[12.5px] text-ink-2">
          <span className="num">{activeDays}</span> ימי פעילות · נגיעה ביום לפירוט
        </span>
      </div>

      <div className="mt-3 flex items-end gap-[2px] h-[64px]" role="list">
        {byDay.map((d, i) => {
          const h = d.list.length ? 10 + Math.sqrt(d.t.revenue / max) * 54 : 4;
          const future = today !== null && d.day > today;
          return (
            <button
              key={d.day}
              type="button"
              role="listitem"
              aria-label={`${d.day} ב${monthName(month)}: ${d.list.length} פעילויות`}
              onClick={() => setPicked((p) => (p === d.day ? null : d.day))}
              className="relative flex-1 h-full flex items-end justify-center"
            >
              <motion.span
                className={cn(
                  "block w-full rounded-[3px] origin-bottom",
                  d.state === "profit" && "bg-cobalt",
                  d.state === "loss" && "loss-stripes",
                  d.state === "missing" && "border-[1.5px] border-dashed border-amber bg-amber-wash",
                  d.state === "none" && (future ? "bg-stone-2" : "bg-stone-3"),
                  picked !== null && picked !== d.day && "opacity-35",
                )}
                style={{ height: h }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: start ? 1 : 0 }}
                transition={reduce ? { duration: 0 } : { delay: 0.25 + i * 0.018, type: "spring", stiffness: 260, damping: 22 }}
              />
              {today === d.day && <span className="absolute -bottom-2.5 size-1.5 rounded-full bg-ink" aria-hidden />}
            </button>
          );
        })}
      </div>
      <div className="mt-3.5 flex justify-between text-[11px] text-ink-3">
        <span className="num">1</span>
        {today !== null && <span className="text-ink-2 font-semibold">היום</span>}
        <span className="num">{days}</span>
      </div>

      <AnimatePresence initial={false}>
        {sel && (
          <motion.div
            key={sel.day}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-[20px] bg-paper px-4 py-3">
              <div className="flex items-baseline justify-between">
                <span className="text-[15px] font-bold">
                  <span className="num">{sel.day}</span> ב{monthName(month)}
                </span>
                <span className="text-[13px] text-ink-2">
                  {sel.list.length === 0 ? "בלי פעילות" : `הכנסה ${formatILS(sel.t.revenue)}`}
                </span>
              </div>
              {sel.list.map((a) => {
                const p = activityProfit(a);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => openFlow({ kind: "activityDetail", activityId: a.id })}
                    className="mt-2 w-full min-h-11 flex items-center justify-between gap-3 border-t border-rule pt-2 text-start"
                  >
                    <span className="text-[14px] font-semibold truncate">
                      {[instructorOf(data, a.instructorId)?.name, frameworkOf(data, a.frameworkId)?.name ?? "חסרה מסגרת"].join(" · ")}
                    </span>
                    <span className={cn("num text-[14px] font-bold", p === null ? "text-amber-ink" : p < 0 ? "text-loss-ink" : "text-cobalt")}>
                      {p === null ? "חסר" : signedILS(p)}
                    </span>
                  </button>
                );
              })}
              {sel.list.length === 0 && (
                <button
                  type="button"
                  onClick={() => openFlow({ kind: "activity", date: `${month}-${String(sel.day).padStart(2, "0")}` })}
                  className="mt-2 h-10 px-4 rounded-xl border-[1.5px] border-ink text-[14px] font-bold"
                >
                  + פעילות
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
