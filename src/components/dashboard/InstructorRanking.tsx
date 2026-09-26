"use client";

import { motion } from "framer-motion";
import { TrendingDown } from "lucide-react";
import Link from "next/link";
import { formatPct } from "@/lib/format";
import { byProfit } from "@/lib/selectors";
import type { InstructorSummary } from "@/lib/types";
import { Card, SectionTitle } from "../ui/Card";
import { cn } from "../ui/cn";
import { Money } from "../ui/Money";
import { Skeleton } from "../ui/Skeleton";
import { MissingBadge } from "../ui/StatusPill";

export function InstructorRanking({
  summaries,
  loading,
}: {
  summaries: InstructorSummary[];
  loading?: boolean;
}) {
  const ranked = [...summaries].sort(byProfit);
  // Bars are drawn on the confirmed basis only: confirmed revenue vs confirmed payout.
  const scale = Math.max(1, ...ranked.map((s) => Math.max(s.revenue, s.confirmedPayout)));

  return (
    <Card className="p-4 md:p-5">
      <SectionTitle
        title="רווחיות לפי מדריך"
        hint="ממוין לפי רווח לחברה"
        action={
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-fg-3">
            <Legend className="bg-series-payout" label="תשלום" />
            <Legend className="bg-signal" label="רווח" />
            <Legend className="loss-hatch" label="הפסד" />
            <Legend className="border border-dashed border-warn/60" label="מידע חסר" />
          </div>
        }
      />

      <ul className="flex flex-col">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="py-3.5 border-t hairline first:border-t-0">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full mt-3 rounded-full" />
              </li>
            ))
          : ranked.map((s, i) => <Row key={s.instructor.id} s={s} i={i} scale={scale} />)}
      </ul>
    </Card>
  );
}

function Row({ s, i, scale }: { s: InstructorSummary; i: number; scale: number }) {
  const loss = s.state === "loss";
  const missing = s.state === "missing";
  const covered = Math.min(s.revenue, s.confirmedPayout);
  const extra = Math.abs(s.revenue - s.confirmedPayout);

  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * i, duration: 0.35 }}
      className="border-t hairline first:border-t-0"
    >
      <Link
        href={`/instructors?i=${s.instructor.id}`}
        className={cn(
          "group block py-3.5 -mx-2 px-2 rounded-xl transition-colors hover:bg-white/[0.025]",
          loss && "bg-neg/[0.04] hover:bg-neg/[0.07]",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex items-center gap-2.5">
            <span className="num w-4 text-[12px] text-fg-4 text-center">{missing ? "–" : i + 1}</span>
            <span className="text-[15px] font-semibold text-fg">{s.instructor.name}</span>
            {s.margin !== null && (
              <span
                className={cn(
                  "num text-[12px] px-1.5 h-5 leading-5 rounded-md",
                  loss ? "text-neg bg-neg/10" : "text-fg-3 bg-white/[0.04]",
                )}
              >
                {formatPct(s.margin)}
              </span>
            )}
            {loss && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[12px] text-neg">
                <TrendingDown className="size-3.5" /> הפסד בפועל
              </span>
            )}
          </div>
          {missing ? (
            <MissingBadge />
          ) : (
            <Money value={s.profit ?? 0} tone="auto" className="text-[16px] font-semibold tracking-tight" />
          )}
        </div>

        <div className="mt-2.5 ps-6.5 flex h-2 w-full gap-[2px]" aria-hidden>
          {missing ? (
            <div className="h-full w-full rounded-full border border-dashed border-warn/40" />
          ) : (
            <>
              <motion.div
                className="h-full rounded-s-full bg-series-payout/90"
                initial={{ width: 0 }}
                animate={{ width: `${(covered / scale) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.div
                className={cn("h-full rounded-e-full", loss ? "loss-hatch" : "bg-signal")}
                initial={{ width: 0 }}
                animate={{ width: `${(extra / scale) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.1 + 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
              />
            </>
          )}
        </div>

        <div className="mt-2 ps-6.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-fg-3">
          <span>
            הכנסה{" "}
            {missing ? <span className="text-warn">לא הוזנה</span> : <Money value={s.revenue} className="text-fg-2" />}
          </span>
          <span className="text-fg-4">·</span>
          <span>
            תשלום <Money value={s.payout} className="text-fg-2" />
          </span>
          {s.pendingCount > 0 && !missing && (
            <span className="text-warn">
              · {s.pendingCount === 1 ? "פעילות אחת" : `${s.pendingCount} פעילויות`} ללא הכנסה לא נכללו
            </span>
          )}
        </div>
      </Link>
    </motion.li>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2 rounded-[3px]", className)} />
      {label}
    </span>
  );
}
