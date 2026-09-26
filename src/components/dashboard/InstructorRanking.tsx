"use client";

import { motion } from "framer-motion";
import { TrendingDown } from "lucide-react";
import Link from "next/link";
import { formatPct } from "@/lib/format";
import type { InstructorSummary } from "@/lib/types";
import { Card, SectionTitle } from "../ui/Card";
import { cn } from "../ui/cn";
import { Money } from "../ui/Money";
import { Skeleton } from "../ui/Skeleton";

export function InstructorRanking({
  summaries,
  loading,
}: {
  summaries: InstructorSummary[];
  loading?: boolean;
}) {
  const ranked = summaries.filter((s) => s.margin !== null).sort((a, b) => b.profit - a.profit);
  const support = summaries.filter((s) => s.margin === null);
  const scale = Math.max(1, ...ranked.map((s) => Math.max(s.revenue, s.payout)));

  return (
    <Card className="p-4 md:p-5">
      <SectionTitle
        title="רווחיות לפי מדריך"
        hint="ממוין לפי רווח לחברה"
        action={
          <div className="hidden sm:flex items-center gap-3 text-[11.5px] text-fg-3">
            <Legend className="bg-series-payout" label="תשלום" />
            <Legend className="bg-signal" label="רווח" />
            <Legend className="loss-hatch" label="הפסד" />
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
          : ranked.map((s, i) => {
              const covered = Math.min(s.revenue, s.payout);
              const extra = Math.abs(s.revenue - s.payout);
              const negative = s.profit < 0;
              return (
                <motion.li
                  key={s.instructor.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.35 }}
                  className="border-t hairline first:border-t-0"
                >
                  <Link
                    href={`/instructors?i=${s.instructor.id}`}
                    className={cn(
                      "group block py-3.5 -mx-2 px-2 rounded-xl transition-colors hover:bg-white/[0.025]",
                      negative && "bg-neg/[0.04] hover:bg-neg/[0.07]",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex items-center gap-2.5">
                        <span className="num w-4 text-[12px] text-fg-4 text-center">{i + 1}</span>
                        <span className="text-[15px] font-semibold text-fg">{s.instructor.name}</span>
                        <span
                          className={cn(
                            "num text-[12px] px-1.5 h-5 leading-5 rounded-md",
                            negative ? "text-neg bg-neg/10" : "text-fg-3 bg-white/[0.04]",
                          )}
                        >
                          {formatPct(s.margin ?? 0)}
                        </span>
                        {negative && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[12px] text-neg">
                            <TrendingDown className="size-3.5" /> רווחיות שלילית
                          </span>
                        )}
                      </div>
                      <Money
                        value={s.profit}
                        tone="auto"
                        className="text-[16px] font-semibold tracking-tight"
                      />
                    </div>

                    <div className="mt-2.5 ps-6.5 flex h-2 w-full gap-[2px]" aria-hidden>
                      <motion.div
                        className="h-full rounded-s-full bg-series-payout/90"
                        initial={{ width: 0 }}
                        animate={{ width: `${(covered / scale) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                      />
                      <motion.div
                        className={cn("h-full rounded-e-full", negative ? "loss-hatch" : "bg-signal")}
                        initial={{ width: 0 }}
                        animate={{ width: `${(extra / scale) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.1 + 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>

                    <div className="mt-2 ps-6.5 flex items-center gap-3 text-[12px] text-fg-3">
                      <span>
                        הכנסה <Money value={s.revenue} className="text-fg-2" />
                      </span>
                      <span className="text-fg-4">·</span>
                      <span>
                        תשלום <Money value={s.payout} className="text-fg-2" />
                      </span>
                    </div>
                  </Link>
                </motion.li>
              );
            })}
      </ul>

      {!loading && support.length > 0 && (
        <p className="mt-2 pt-3 border-t hairline text-[12px] text-fg-3">
          {support.map((s) => (
            <span key={s.instructor.id}>
              {s.instructor.name} ({s.instructor.specialty}) · עלות ליווי{" "}
              <Money value={s.payout} className="text-fg-2" /> — ללא הכנסה ישירה
            </span>
          ))}
        </p>
      )}
    </Card>
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
