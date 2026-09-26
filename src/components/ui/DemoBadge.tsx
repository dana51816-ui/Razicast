import { cn } from "./cn";

/** Marks every figure on screen as mock data until a real data source is connected. */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      title="כל הנתונים באפליקציה הם נתוני דמו"
      className={cn(
        "inline-flex items-center h-5 px-1.5 rounded-md text-[11px] font-medium text-fg-3 bg-white/[0.05] ring-1 ring-inset ring-white/[0.08] whitespace-nowrap",
        className,
      )}
    >
      נתוני דמו
    </span>
  );
}
