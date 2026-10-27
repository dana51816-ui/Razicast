"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "./cn";

/** Shows `from`, then rolls the digits to `to` — a change you can watch happen. */
export function RollTo({ from, to, className, wait = 450 }: { from: string; to: string; className?: string; wait?: number }) {
  const [v, setV] = useState(from);
  useEffect(() => {
    const t = setTimeout(() => setV(to), wait);
    return () => clearTimeout(t);
  }, [to, wait]);
  return <RollingNumber value={v} className={className} />;
}

/**
 * Odometer: every digit is a vertical strip 0–9 that rolls to its value.
 * Digits are keyed from the right, so 11,627 → 12,417 rolls only what changed.
 */
export function RollingNumber({
  value,
  className,
  start = true,
  delay = 0,
}: {
  /** Already-formatted text, e.g. "12,417" */
  value: string;
  className?: string;
  /** Hold at zero until true (e.g. until the opening sequence ends) */
  start?: boolean;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const chars = [...value];
  const n = chars.length;

  return (
    <span dir="ltr" className={cn("num inline-flex items-start leading-none", className)} aria-label={value} role="img">
      {chars.map((ch, i) => {
        const fromRight = n - 1 - i;
        if (!/\d/.test(ch)) {
          return (
            <span key={`s${fromRight}`} aria-hidden className="inline-block" style={{ height: "1em", lineHeight: "1em" }}>
              {ch}
            </span>
          );
        }
        const d = start ? Number(ch) : 0;
        return (
          <span key={`d${fromRight}`} aria-hidden className="relative inline-block overflow-hidden" style={{ height: "1em", lineHeight: "1em" }}>
            {/* The final digit, invisible, sets this column's width so narrow digits sit tight */}
            <span className="invisible">{start ? ch : "0"}</span>
            <motion.span
              className="absolute inset-x-0 top-0 flex flex-col items-center"
              initial={false}
              animate={{ y: `${-d}em` }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 70, damping: 16, mass: 0.9, delay: delay + fromRight * 0.06 }
              }
            >
              {"0123456789".split("").map((x) => (
                <span key={x} style={{ height: "1em", lineHeight: "1em" }}>
                  {x}
                </span>
              ))}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}
