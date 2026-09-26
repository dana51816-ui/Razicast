"use client";

import { ChevronDown, X } from "lucide-react";
import { cn } from "./cn";

/**
 * Chip that wraps a native <select> — on iPhone this opens the system wheel picker,
 * which is faster and more familiar than any custom dropdown.
 */
export function FilterChip<T extends string>({
  label,
  value,
  options,
  onChange,
  allValue = "all" as T,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  allValue?: T;
}) {
  const active = value !== allValue;
  const current = options.find((o) => o.value === value)?.label;
  return (
    <div
      className={cn(
        "relative shrink-0 h-9 rounded-full inline-flex items-center gap-1.5 ps-3.5 pe-2.5 text-[13px] transition-colors",
        active
          ? "bg-signal/10 text-fg ring-1 ring-inset ring-signal/30"
          : "bg-white/[0.04] text-fg-2 ring-1 ring-inset ring-white/[0.07] hover:bg-white/[0.07]",
      )}
    >
      <span className={cn(active ? "text-signal" : "text-fg-3")}>{label}</span>
      {active && <span className="font-medium">{current}</span>}
      {active ? (
        <button
          aria-label={`ניקוי ${label}`}
          onClick={() => onChange(allValue)}
          className="relative z-10 size-5 -me-1 rounded-full grid place-items-center hover:bg-white/10"
        >
          <X className="size-3.5" />
        </button>
      ) : (
        <ChevronDown className="size-3.5 text-fg-3" />
      )}
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn("absolute inset-0 opacity-0 cursor-pointer", active && "end-7")}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
