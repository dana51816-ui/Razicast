import { AlertCircle, Check, CircleHelp, Clock3 } from "lucide-react";
import type { ReceiptStatus } from "@/lib/types";
import { cn } from "./cn";

export const RECEIPT_LABEL: Record<ReceiptStatus, string> = {
  received: "התקבלה",
  missing: "חסרה",
  review: "בבדיקה",
};

const styles: Record<ReceiptStatus, string> = {
  received: "text-pos bg-pos/10 ring-pos/20",
  missing: "text-warn bg-warn/10 ring-warn/25",
  review: "text-series-payout bg-series-payout/10 ring-series-payout/25",
};

const icons = { received: Check, missing: AlertCircle, review: Clock3 };

export function ReceiptPill({ status, className }: { status: ReceiptStatus; className?: string }) {
  const Icon = icons[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 h-6 ps-1.5 pe-2 rounded-full text-[12px] font-medium ring-1 ring-inset whitespace-nowrap",
        styles[status],
        className,
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.25} />
      {RECEIPT_LABEL[status]}
    </span>
  );
}

export function Tag({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "warn" | "neg" | "pos" | "signal";
  className?: string;
}) {
  const t = {
    neutral: "text-fg-2 bg-white/[0.05] ring-white/[0.07]",
    warn: "text-warn bg-warn/10 ring-warn/25",
    neg: "text-neg bg-neg/10 ring-neg/25",
    pos: "text-pos bg-pos/10 ring-pos/20",
    signal: "text-signal bg-signal/10 ring-signal/25",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 h-6 px-2 rounded-md text-[12px] font-medium ring-1 ring-inset whitespace-nowrap",
        t,
        className,
      )}
    >
      {children}
    </span>
  );
}

/** The one visual for "we don't know yet" — amber, dashed, never red. */
export function MissingBadge({
  label = "מידע חסר",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 h-6 px-2 rounded-md text-[12px] font-medium whitespace-nowrap text-warn bg-warn/[0.07] border border-dashed border-warn/40",
        className,
      )}
    >
      <CircleHelp className="size-3.5" strokeWidth={2.25} />
      {label}
    </span>
  );
}
