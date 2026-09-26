"use client";

import { motion } from "framer-motion";
import { CircleHelp } from "lucide-react";
import Link from "next/link";
import { formatILS, formatPct } from "@/lib/format";
import type { MonthTotals } from "@/lib/types";
import { Money } from "../ui/Money";
import { Skeleton } from "../ui/Skeleton";

/**
 * "Where every shekel goes" — confirmed revenue split into instructor payouts vs company profit.
 * Activities without revenue are shown beside the bar, never folded into it.
 */
export function FlowBar({ totals, loading }: { totals: MonthTotals; loading?: boolean }) {
  const hasBasis = totals.profit !== null && totals.revenue > 0;
  const payoutPct = hasBasis ? Math.min(100, (totals.confirmedPayout / totals.revenue) * 100) : 0;
  const profitPct = hasBasis ? Math.max(0, 100 - payoutPct) : 0;
  const agorot = Math.round(profitPct);

  return (
    <div className="surface rounded-[var(--radius-card)] px-4 py-4 md:px-5">
      <div className="flex items-baseline justify-between gap-3">
        {hasBasis ? (
          <p className="text-[13.5px] text-fg-2">
            מכל <span className="num text-fg font-medium">₪1</span> שנכנס,{" "}
            <span className="num text-fg font-semibold">{agorot}</span>{" "}
            <span className="text-fg font-semibold">אג׳</span> נשארות בחברה
          </p>
        ) : (
          <p className="text-[13.5px] text-fg-2">אין עדיין הכנסות מאומתות החודש</p>
        )}
        <span className="hidden sm:inline text-[12px] text-fg-3">
          סה״כ הכנסות <Money value={totals.revenue} className="text-fg-2" />
        </span>
      </div>
      {loading ? (
        <Skeleton className="h-2.5 w-full mt-3.5 rounded-full" />
      ) : (
        <div
          className="mt-3.5 flex h-2.5 w-full gap-[2px] overflow-hidden rounded-full bg-white/[0.05]"
          role="img"
          aria-label={`תשלומים ${formatPct(payoutPct)}, רווח ${formatPct(profitPct)}`}
        >
          <motion.div
            className="h-full rounded-s-full bg-series-payout"
            initial={{ width: 0 }}
            animate={{ width: `${payoutPct}%` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="h-full rounded-e-full bg-signal"
            initial={{ width: 0 }}
            animate={{ width: `${profitPct}%` }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      )}
      <div className="mt-2.5 flex items-center justify-between text-[12px] text-fg-3">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-[3px] bg-series-payout" />
          תשלומים<span className="hidden sm:inline"> למדריכים</span>{" "}
          <span className="num text-fg-2">{formatPct(payoutPct)}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-[3px] bg-signal" />
          רווח<span className="hidden sm:inline"> לחברה</span>{" "}
          <span className="num text-fg-2">{formatPct(profitPct)}</span>
        </span>
      </div>

      {totals.pendingCount > 0 && (
        <Link
          href="/activity?status=missing-info"
          className="mt-3.5 flex items-start gap-2 rounded-xl px-3 py-2.5 border border-dashed border-warn/35 bg-warn/[0.05] text-[12.5px] leading-relaxed text-fg-2 hover:bg-warn/[0.08] transition-colors"
        >
          <CircleHelp className="size-4 text-warn shrink-0 mt-0.5" />
          <span>
            <span className="text-warn font-medium">
              {totals.pendingCount === 1 ? "פעילות אחת" : `${totals.pendingCount} פעילויות`} ללא הכנסה
            </span>{" "}
            (תשלום <span className="num">{formatILS(totals.pendingPayout)}</span>) — לא נכללות ברווח וברווחיות עד
            שתוזן ההכנסה.
          </span>
        </Link>
      )}
    </div>
  );
}
