"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useId } from "react";
import { IconBack, IconClose, IconMinus, IconPlus } from "../shell/icons";
import { cn } from "../ui/cn";

/** Top bar (back · progress · close), a scrolling body, and an optional pinned footer. */
export function FlowFrame({
  step,
  steps,
  onBack,
  onClose,
  children,
  footer,
  stepKey,
}: {
  step: number;
  steps: number;
  onBack?: () => void;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Changes when the visible step changes — drives the slide transition */
  stepKey: string | number;
}) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-3 px-5 pt-4 md:pt-6">
        <button
          type="button"
          onClick={onBack}
          aria-label="חזרה"
          disabled={!onBack}
          className={cn("size-11 shrink-0 rounded-full bg-stone-2 grid place-items-center transition-opacity", !onBack && "opacity-0 pointer-events-none")}
        >
          <IconBack strokeWidth={2.4} className="size-5" />
        </button>
        <div aria-hidden className="flex-1 flex gap-1">
          {Array.from({ length: steps }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-[5px] flex-1 rounded-full transition-colors duration-300",
                i < step ? "bg-ink" : i === step ? "bg-cobalt" : "bg-stone-3",
              )}
            />
          ))}
        </div>
        <button type="button" onClick={onClose} aria-label="סגירה" className="size-11 shrink-0 rounded-full bg-stone-2 grid place-items-center">
          <IconClose strokeWidth={2.4} className="size-[18px]" />
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pt-6 pb-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stepKey}
            initial={{ opacity: 0, x: -22 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 22 }}
            transition={{ duration: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
      {footer && <div className="px-5 pt-2 pb-2">{footer}</div>}
    </div>
  );
}

export function StepTitle({ eyebrow, title, hint }: { eyebrow?: string; title: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="mb-6">
      {eyebrow && <div className="text-[13px] font-semibold text-ink-2">{eyebrow}</div>}
      <h2 className="mt-1.5 text-[28px] leading-[1.2] font-bold text-balance">{title}</h2>
      {hint && <p className="mt-2 text-[14px] text-ink-2 leading-relaxed">{hint}</p>}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  tone = "ink",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone?: "ink" | "cobalt";
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full h-[60px] rounded-[20px] text-[18px] font-bold text-white transition active:scale-[0.99] disabled:opacity-35",
        tone === "cobalt" ? "bg-cobalt" : "bg-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** A tall list of one-tap choices. */
export function ChoiceList<T extends string>({
  options,
  value,
  onPick,
}: {
  options: { value: T; label: string; hint?: string }[];
  value: T | null;
  onPick: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2" role="radiogroup">
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onPick(o.value)}
            className={cn(
              "min-h-[62px] rounded-[18px] px-5 flex items-center justify-between gap-3 text-start transition-colors active:scale-[0.99]",
              on ? "bg-cobalt text-white" : "bg-paper text-ink",
            )}
          >
            <span className="text-[18px] font-bold">{o.label}</span>
            {o.hint && <span className={cn("text-[13px] font-medium", on ? "text-cobalt-soft" : "text-ink-2")}>{o.hint}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Big shekel input for a rate — the one numeric moment in a step. */
export function AmountInput({
  label,
  value,
  onChange,
  suffix,
  tone = "ink",
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  tone?: "ink" | "cobalt";
  autoFocus?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-semibold text-ink-2 mb-1.5">
        {label}
      </label>
      <div dir="ltr" className="flex items-center gap-1.5 h-[104px] rounded-[20px] bg-paper px-5 focus-within:outline focus-within:outline-2 focus-within:outline-cobalt">
        <span className="display text-[44px] text-ink-2">₪</span>
        <input
          id={id}
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
          inputMode="numeric"
          enterKeyHint="done"
          placeholder="0"
          className={cn(
            "display flex-1 min-w-0 bg-transparent text-[84px] leading-none outline-none placeholder:text-stone-3 focus:outline-none",
            tone === "cobalt" ? "text-cobalt" : "text-ink",
          )}
        />
        {suffix && (
          <span dir="rtl" className="text-[15px] font-semibold text-ink-2 whitespace-nowrap">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

/** Small amount field used for travel or for a single missing value. */
export function SmallAmount({
  label,
  value,
  onChange,
  missing,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  missing?: boolean;
}) {
  return (
    <div
      dir="ltr"
      className={cn(
        "flex items-center h-[54px] rounded-[16px] bg-paper px-4 focus-within:outline focus-within:outline-2 focus-within:outline-cobalt",
        missing && "missing-line",
      )}
    >
      <span className="font-bold text-ink-2">₪</span>
      <input
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ""))}
        inputMode="numeric"
        enterKeyHint="done"
        placeholder="סכום"
        className="flex-1 min-w-0 bg-transparent px-1.5 text-[20px] font-bold outline-none focus:outline-none placeholder:text-stone-3 placeholder:font-medium placeholder:text-[16px]"
      />
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  inputMode,
  dir,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "tel" | "numeric";
  dir?: "ltr" | "rtl";
  autoFocus?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-semibold text-ink-2 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        dir={dir}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        inputMode={inputMode}
        enterKeyHint="next"
        onChange={(e) => onChange(e.target.value)}
        className={cn("w-full h-[60px] rounded-[16px] bg-paper px-4 text-[19px] font-semibold", dir === "ltr" && "text-right")}
      />
    </div>
  );
}

/** −  N  + with 64px targets. */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  label,
  big = false,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label: string;
  big?: boolean;
}) {
  return (
    <div className="flex items-center justify-between" role="group" aria-label={label}>
      <button
        type="button"
        aria-label={`הוספה ל${label}`}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={cn("rounded-full bg-ink text-white grid place-items-center active:scale-95 transition-transform", big ? "size-[76px]" : "size-14")}
      >
        <IconPlus strokeWidth={2.6} className={big ? "size-7" : "size-6"} />
      </button>
      <output aria-live="polite" className={cn("num display leading-[0.8]", big ? "text-[150px]" : "text-[72px]")}>
        {value}
      </output>
      <button
        type="button"
        aria-label={`הפחתה מ${label}`}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={cn("rounded-full border-2 border-ink grid place-items-center active:scale-95 transition-transform", big ? "size-[76px]" : "size-14")}
      >
        <IconMinus strokeWidth={2.6} className={big ? "size-7" : "size-6"} />
      </button>
    </div>
  );
}

/** A tappable line in a review: label on one side, value on the other. */
export function ReviewRow({
  label,
  children,
  onEdit,
  missing,
}: {
  label: string;
  children: React.ReactNode;
  onEdit?: () => void;
  missing?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="w-full min-h-[62px] flex items-center justify-between gap-3 border-b border-rule last:border-b-0 text-start"
    >
      <span className="text-[14px] text-ink-2">{label}</span>
      <span className={cn("text-[17px] font-bold text-end", missing && "text-amber-ink")}>{children}</span>
    </button>
  );
}

export function DoneMark({ tone = "ink", children }: { tone?: "ink" | "cobalt" | "amber"; children?: React.ReactNode }) {
  return (
    <motion.span
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 18 }}
      className={cn(
        "size-[72px] rounded-full grid place-items-center text-white text-[28px] font-bold",
        tone === "ink" && "bg-ink",
        tone === "cobalt" && "bg-cobalt",
        tone === "amber" && "bg-amber",
      )}
    >
      {children}
    </motion.span>
  );
}
