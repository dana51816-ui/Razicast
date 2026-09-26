"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-signal text-signal-ink font-semibold shadow-[0_0_0_1px_rgba(200,242,74,.4),0_8px_24px_-8px_rgba(200,242,74,.45)] hover:bg-signal-strong",
  secondary:
    "bg-white/[0.06] text-fg border border-white/[0.08] hover:bg-white/[0.09] font-medium",
  ghost: "text-fg-2 hover:text-fg hover:bg-white/[0.05] font-medium",
  danger: "bg-neg/15 text-neg border border-neg/25 hover:bg-neg/20 font-medium",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] rounded-lg gap-1.5",
  md: "h-10 px-4 text-[14px] rounded-xl gap-2",
  lg: "h-13 px-6 text-[15px] rounded-2xl gap-2",
};

export function Button({
  variant = "secondary",
  size = "md",
  className,
  children,
  ...props
}: HTMLMotionProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 600, damping: 30 }}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap transition-colors duration-150 disabled:opacity-40 disabled:pointer-events-none select-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
