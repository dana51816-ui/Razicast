"use client";

import { motion } from "framer-motion";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { cn } from "../ui/cn";
import { Skeleton } from "../ui/Skeleton";
import { MissingBadge } from "../ui/StatusPill";

export function KpiCard({
  label,
  value,
  format,
  footer,
  emphasis = false,
  index = 0,
  loading,
}: {
  label: string;
  /** null = cannot be computed from the data we have */
  value: number | null;
  format: (n: number) => string;
  footer?: React.ReactNode;
  emphasis?: boolean;
  index?: number;
  loading?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-card)] p-4 md:p-5 min-h-[118px] md:min-h-[136px] flex flex-col",
        emphasis
          ? "bg-[linear-gradient(160deg,rgba(200,242,74,.13),rgba(200,242,74,.03)_45%,rgba(255,255,255,.015))] border border-signal/20 shadow-[inset_0_1px_0_rgba(200,242,74,.15)]"
          : "surface",
      )}
    >
      {emphasis && (
        <div className="pointer-events-none absolute -top-16 -start-10 size-40 rounded-full bg-signal/10 blur-3xl" />
      )}
      <div className="relative flex items-center gap-2">
        <span className={cn("text-[13px] font-medium", emphasis ? "text-signal" : "text-fg-3")}>
          {label}
        </span>
      </div>
      <div className="relative mt-auto pt-3">
        {loading ? (
          <>
            <Skeleton className="h-8 w-28 md:h-9 md:w-36" />
            <Skeleton className="h-3.5 w-24 mt-3" />
          </>
        ) : (
          <>
            {value === null ? (
              <MissingBadge className="h-8 text-[14px]" />
            ) : (
              <AnimatedNumber
                value={value}
                format={format}
                className="text-[25px] md:text-[32px] font-semibold leading-none tracking-[-0.03em] text-fg"
              />
            )}
            {footer && <div className="mt-2.5 min-h-4 flex flex-col gap-1">{footer}</div>}
          </>
        )}
      </div>
    </motion.div>
  );
}
