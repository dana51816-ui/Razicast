import { cn } from "./cn";

/** "We don't know yet" — amber, dashed, never red. */
export function MissingTag({ children = "מידע חסר", className }: { children?: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center h-6 px-2.5 rounded-full text-[12px] font-semibold text-amber-ink missing-line whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Status dot used across the product: profit, loss, missing, receipt. */
export function Dot({ tone, className }: { tone: "profit" | "loss" | "missing" | "receipt" | "idle"; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        tone === "profit" && "bg-cobalt",
        tone === "loss" && "bg-loss",
        tone === "receipt" && "bg-amber-dot",
        tone === "missing" && "border-[1.5px] border-dashed border-amber",
        tone === "idle" && "bg-stone-3",
        className,
      )}
    />
  );
}

export function DemoTag({ className }: { className?: string }) {
  return (
    <span
      title="כל הנתונים באפליקציה הם נתוני דמו"
      className={cn("inline-flex items-center h-5 px-1.5 rounded-md text-[11px] font-semibold text-ink-2 bg-stone-2", className)}
    >
      נתוני דמו
    </span>
  );
}
