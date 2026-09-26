"use client";

import { animate, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "./cn";

/** Counts from the previous value to the new one — so a change in profit is seen, not just shown. */
export function AnimatedNumber({
  value,
  format,
  className,
  duration = 1,
  from,
}: {
  value: number;
  /** Start the first animation here (e.g. the value before a save) */
  from?: number;
  format: (n: number) => string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef<number | null>(from ?? null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = prev.current ?? 0;
    prev.current = value;
    if (reduce || from === value) {
      el.textContent = format(value);
      return;
    }
    const c = animate(from, value, {
      duration,
      ease: [0.2, 0.8, 0.2, 1],
      onUpdate: (v) => (el.textContent = format(v)),
    });
    return () => c.stop();
  }, [value, format, duration, reduce]);

  return (
    <span ref={ref} className={cn("num", className)}>
      {format(prev.current ?? value)}
    </span>
  );
}
