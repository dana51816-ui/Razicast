"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { activitiesIn, activityProfit, frameworkOf } from "@/lib/calc";
import { formatDayMonth, monthName, signedILS } from "@/lib/format";
import { useStore } from "@/lib/store";
import { cn } from "../ui/cn";
import { MissingTag } from "../ui/Tags";

/** Every activity of the month, by day. Filter by instructor; tap to open. */
export function ActivityLog() {
  const { data, month, openFlow } = useStore();
  const [who, setWho] = useState<string | null>(null);
  const all = activitiesIn(data, month).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
  const people = data.instructors.filter((i) => all.some((a) => a.instructorId === i.id));
  const list = who ? all.filter((a) => a.instructorId === who) : all;

  const days: { date: string; items: typeof list }[] = [];
  for (const a of list) {
    const last = days[days.length - 1];
    if (last && last.date === a.date) last.items.push(a);
    else days.push({ date: a.date, items: [a] });
  }

  return (
    <section aria-label={`יומן ${monthName(month)}`} className="mt-10">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[20px] font-bold">יומן {monthName(month)}</h2>
        <span className="text-[13px] text-ink-2">
          <span className="num">{list.length}</span> פעילויות
        </span>
      </div>

      {people.length > 1 && (
        <div className="-mx-5 px-5 mt-3 flex gap-1.5 overflow-x-auto no-scrollbar" role="radiogroup" aria-label="סינון לפי מדריך">
          {[{ id: null as string | null, name: "כולם" }, ...people.map((p) => ({ id: p.id as string | null, name: p.name }))].map((p) => (
            <button
              key={p.id ?? "all"}
              type="button"
              role="radio"
              aria-checked={who === p.id}
              onClick={() => setWho(p.id)}
              className={cn(
                "shrink-0 h-10 px-4 rounded-full text-[14px] font-bold transition-colors",
                who === p.id ? "bg-ink text-white" : "bg-stone-2 text-ink",
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {list.length === 0 ? (
        <p className="mt-4 text-[14px] text-ink-2">אין פעילויות.</p>
      ) : (
        <div className="mt-3">
          {days.map((d, di) => {
            const f = formatDayMonth(d.date);
            return (
              <motion.div
                key={d.date}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(di, 10) * 0.03, duration: 0.3 }}
                className="flex gap-4 border-t border-rule py-2.5"
              >
                <div className="w-11 shrink-0 pt-1.5 text-center">
                  <b className="num display block text-[34px] leading-[0.85]">{f.day}</b>
                  <span className="block text-[11px] text-ink-2 mt-1">{f.weekday}</span>
                </div>
                <div className="flex-1 min-w-0">
                  {d.items.map((a) => {
                    const p = activityProfit(a);
                    const fw = frameworkOf(data, a.frameworkId);
                    const name = data.instructors.find((i) => i.id === a.instructorId)?.name ?? "";
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => openFlow({ kind: "activityDetail", activityId: a.id })}
                        className="w-full min-h-[52px] flex items-center justify-between gap-3 text-start"
                      >
                        <span className="min-w-0">
                          <span className="block text-[15px] font-bold truncate">{name}</span>
                          <span className={cn("block text-[12.5px] truncate", fw ? "text-ink-2" : "text-amber-ink")}>
                            {fw?.name ?? "חסרה מסגרת"} · <span className="num">{a.quantity}</span> {a.unitLabel}
                          </span>
                        </span>
                        {p === null || !a.frameworkId ? (
                          <MissingTag>השלמה</MissingTag>
                        ) : (
                          <b className={cn("num text-[15px] shrink-0", p < 0 ? "text-loss-ink" : "text-cobalt")}>{signedILS(p)}</b>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
