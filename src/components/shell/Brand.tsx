"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../ui/cn";

const EASE = [0.2, 0.7, 0.2, 1] as const;

/**
 * The RaziCast logo: graphite Poppins letters, the i's dot in red.
 * `animate` makes the letters rise and the dot drop onto the i (opening sequence).
 */
export function Logo({ className, animate = false, delay = 0 }: { className?: string; animate?: boolean; delay?: number }) {
  const reduce = useReducedMotion();
  const play = animate && !reduce;
  const letter = (ch: string, i: number) =>
    play ? (
      <motion.span
        key={i}
        className="inline-block"
        initial={{ y: "0.6em", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: delay + i * 0.045, duration: 0.6, ease: EASE }}
      >
        {ch}
      </motion.span>
    ) : (
      ch
    );
  const dot = "absolute left-1/2 top-[0.035em] size-[0.235em] -translate-x-1/2 rounded-full bg-brand-red";

  return (
    <span
      dir="ltr"
      role="img"
      aria-label="RaziCast"
      className={cn("inline-flex items-baseline whitespace-nowrap font-logo font-semibold text-brand-ink leading-none tracking-[-0.01em]", className)}
    >
      {["R", "a", "z"].map(letter)}
      {/* dotless i + the red dot */}
      <span className="relative inline-block">
        {letter("ı", 3)}
        {play ? (
          <motion.span
            aria-hidden
            className={dot}
            initial={{ y: "-6em", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: delay + 0.75, type: "spring", stiffness: 520, damping: 14, mass: 0.7 }}
          />
        ) : (
          <span aria-hidden className={dot} />
        )}
      </span>
      {["C", "a", "s", "t"].map((ch, i) => letter(ch, i + 4))}
    </span>
  );
}

/** Logo + the product name, for the header and the rail. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span dir="ltr" className={cn("inline-flex items-baseline gap-2 whitespace-nowrap", className)}>
      <Logo className="text-[21px]" />
      <span className="text-[10.5px] font-bold tracking-[0.28em] text-ink-2">CONTROL</span>
    </span>
  );
}
