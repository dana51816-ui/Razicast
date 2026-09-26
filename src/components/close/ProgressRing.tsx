"use client";

import { motion } from "framer-motion";

export function ProgressRing({ value, size = 88, done }: { value: number; size?: number; done?: boolean }) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={done ? "var(--color-pos)" : "var(--color-signal)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - value / 100) }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: done ? undefined : "drop-shadow(0 0 6px rgba(200,242,74,.35))" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="num text-[20px] font-semibold">{Math.round(value)}%</span>
      </div>
    </div>
  );
}
