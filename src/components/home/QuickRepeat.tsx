"use client";

import { motion } from "framer-motion";
import { frameworkOf, instructorOf } from "@/lib/calc";
import { useStore } from "@/lib/store";
import type { Activity } from "@/lib/types";

/**
 * "Again, today": the latest distinct instructor + framework + quantity combinations.
 * One tap opens the calculation with today's date and current rates.
 */
export function QuickRepeat({ start = true }: { start?: boolean }) {
  const { data, openFlow } = useStore();

  const seen = new Set<string>();
  const recent: Activity[] = [];
  for (const a of [...data.activities].sort((x, y) => y.date.localeCompare(x.date) || y.createdAt.localeCompare(x.createdAt))) {
    if (!a.frameworkId) continue;
    const key = `${a.instructorId}|${a.frameworkId}|${a.quantity}`;
    if (seen.has(key)) continue;
    seen.add(key);
    recent.push(a);
    if (recent.length === 6) break;
  }
  if (recent.length === 0) return null;

  return (
    <section aria-label="חזרה מהירה" className="mt-4">
      <div className="text-[13px] font-semibold text-ink-2 mb-2">שוב, היום</div>
      <div className="-mx-5 px-5 flex gap-2 overflow-x-auto no-scrollbar snap-x">
        {recent.map((a, i) => {
          const name = instructorOf(data, a.instructorId)?.name ?? "";
          const place = frameworkOf(data, a.frameworkId)?.name ?? "";
          return (
            <motion.button
              key={a.id}
              type="button"
              onClick={() => openFlow({ kind: "activity", repeatOf: a.id })}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: start ? 1 : 0, x: start ? 0 : -12 }}
              transition={{ delay: 0.35 + i * 0.05, duration: 0.35 }}
              className="snap-start shrink-0 min-h-[58px] max-w-[220px] rounded-[18px] bg-paper ps-3 pe-4 py-2 flex items-center gap-2.5 text-start active:scale-[0.97] transition-transform"
            >
              <span className="size-9 shrink-0 rounded-full bg-ink text-white grid place-items-center text-[15px] font-bold">{name.charAt(0)}</span>
              <span className="min-w-0">
                <span className="block text-[14px] font-bold truncate">{name}</span>
                <span className="block text-[12px] text-ink-2 truncate">
                  {place} · <span className="num">{a.quantity}</span>
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
