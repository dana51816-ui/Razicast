"use client";

import { motion } from "framer-motion";
import { ChevronLeft, TrendingDown } from "lucide-react";
import { formatPct } from "@/lib/format";
import type { InstructorSummary } from "@/lib/types";
import { cn } from "../ui/cn";
import { InstructorAvatar } from "../ui/InstructorAvatar";
import { Money } from "../ui/Money";
import { ReceiptPill } from "../ui/StatusPill";

export function InstructorCard({
  summary: s,
  onOpen,
  index = 0,
}: {
  summary: InstructorSummary;
  onOpen: () => void;
  index?: number;
}) {
  const negative = s.margin !== null && s.profit < 0;
  const support = s.margin === null;
  const marginWidth = s.margin === null ? 0 : Math.max(0, Math.min(100, s.margin));

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "group text-start w-full rounded-[var(--radius-card)] p-4 md:p-5 transition-colors",
        negative
          ? "bg-[linear-gradient(180deg,rgba(255,93,108,.07),rgba(255,93,108,.015))] border border-neg/20 hover:border-neg/35"
          : "surface hover:border-white/[0.12]",
      )}
    >
      <div className="flex items-center gap-3">
        <InstructorAvatar id={s.instructor.id} />
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-semibold text-fg leading-tight">{s.instructor.name}</div>
          <div className="text-[12.5px] text-fg-3 mt-0.5">
            {s.instructor.specialty} · <span className="num">{s.activities}</span> פעילויות
          </div>
        </div>
        <ReceiptPill status={s.receipt} />
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <div className="text-[12px] text-fg-3">{support ? "עלות ליווי" : "רווח לחברה"}</div>
          <Money
            value={support ? -s.payout : s.profit}
            tone={support ? "muted" : "auto"}
            className="text-[26px] font-semibold tracking-[-0.02em] leading-tight mt-0.5"
          />
        </div>
        <div className="text-end">
          <div className="text-[12px] text-fg-3">רווחיות</div>
          {support ? (
            <div className="text-[15px] text-fg-3 mt-0.5">מלווה</div>
          ) : (
            <div className={cn("num text-[17px] font-semibold mt-0.5", negative ? "text-neg" : "text-fg")}>
              {formatPct(s.margin ?? 0)}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden" aria-hidden>
        {negative ? (
          <div className="h-full w-full loss-hatch opacity-80" />
        ) : (
          <motion.div
            className="h-full rounded-full bg-signal"
            initial={{ width: 0 }}
            animate={{ width: `${marginWidth}%` }}
            transition={{ duration: 0.9, delay: 0.1 + index * 0.04, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
      </div>

      <div className="mt-4 pt-3.5 border-t hairline grid grid-cols-2 gap-3 text-[12.5px]">
        <div>
          <div className="text-fg-3">הכנסה החודש</div>
          <Money value={s.revenue} className="text-[14.5px] text-fg mt-0.5" />
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-fg-3">תשלום החודש</div>
            <Money value={s.payout} className="text-[14.5px] text-fg mt-0.5" />
          </div>
          <ChevronLeft className="size-4 text-fg-4 group-hover:text-fg-2 transition-colors" />
        </div>
      </div>

      {negative && (
        <div className="mt-3 flex items-center gap-1.5 text-[12px] text-neg">
          <TrendingDown className="size-3.5" />
          התשלום גבוה מההכנסה — כדאי לבדוק
        </div>
      )}
    </motion.button>
  );
}
