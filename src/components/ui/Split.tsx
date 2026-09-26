"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "./cn";

/**
 * THE SPLIT — revenue divided into instructor payment (sand) and company profit (cobalt).
 * When payment exceeds revenue the bar is measured against payment instead:
 * sand = the part revenue covered, red stripes = the real loss.
 */
export function Split({
  revenue,
  payment,
  height = 64,
  labels = false,
  className,
  delay = 0,
}: {
  revenue: number;
  payment: number;
  height?: number;
  /** Print "למדריכים / לחברה" inside the bar */
  labels?: boolean;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const loss = payment > revenue;
  const whole = Math.max(revenue, payment, 1);
  const first = ((loss ? revenue : payment) / whole) * 100;
  const second = 100 - first;
  const radius = Math.min(10, height / 3);
  const t = { duration: reduce ? 0 : 1, ease: [0.2, 0.8, 0.2, 1] as const };

  return (
    <div className={cn("flex w-full gap-[3px]", className)} style={{ height }} aria-hidden>
      {first > 0 && (
        <motion.div
          className="bg-sand flex items-end overflow-hidden"
          style={{ borderRadius: second > 0 ? `0 ${radius}px ${radius}px 0` : radius }}
          initial={{ width: 0 }}
          animate={{ width: `${first}%` }}
          transition={{ ...t, delay }}
        >
          {labels && height >= 44 && (
            <span className="px-3 pb-2.5 text-[13px] font-semibold text-sand-ink whitespace-nowrap">
              {loss ? "כוסה מהכנסה" : "למדריכים"}
            </span>
          )}
        </motion.div>
      )}
      {second > 0 && (
        <motion.div
          className={cn("flex items-end overflow-hidden", loss ? "loss-stripes" : "bg-cobalt")}
          style={{ borderRadius: first > 0 ? `${radius}px 0 0 ${radius}px` : radius }}
          initial={{ width: 0 }}
          animate={{ width: `${second}%` }}
          transition={{ ...t, delay: delay + 0.12 }}
        >
          {labels && height >= 44 && !loss && (
            <span className="px-3 pb-2.5 text-[13px] font-semibold text-white whitespace-nowrap">לחברה</span>
          )}
        </motion.div>
      )}
    </div>
  );
}

/** Engineering-style measurement line with end ticks and a label on it. */
export function Dimension({
  children,
  tone = "ink",
  className,
}: {
  children: React.ReactNode;
  tone?: "ink" | "sand" | "cobalt";
  className?: string;
}) {
  const color = tone === "ink" ? "bg-ink" : tone === "sand" ? "bg-sand-rule" : "bg-cobalt";
  return (
    <div className={cn("relative h-6", className)}>
      <div className={cn("absolute inset-x-0 top-[11px] h-[1.5px]", color)} />
      <div className={cn("absolute right-0 top-[5px] h-[13px] w-[1.5px]", color)} />
      <div className={cn("absolute left-0 top-[5px] h-[13px] w-[1.5px]", color)} />
      <div className="absolute inset-0 flex justify-center">
        <span className="bg-stone px-2.5 text-[14px] leading-6 whitespace-nowrap">{children}</span>
      </div>
    </div>
  );
}
