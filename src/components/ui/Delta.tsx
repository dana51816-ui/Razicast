import { ArrowDown, ArrowUp } from "lucide-react";
import { formatSignedPct } from "@/lib/format";
import { cn } from "./cn";

/** Month-over-month delta chip. `invert` for metrics where up is bad (costs). */
export function Delta({
  value,
  invert = false,
  suffix = "מהחודש הקודם",
  digits = 0,
  unit,
  className,
}: {
  value: number | null;
  invert?: boolean;
  suffix?: string;
  digits?: number;
  /** override the display string (e.g. for percentage points) */
  unit?: string;
  className?: string;
}) {
  if (value === null) return <span className={cn("text-[12px] text-fg-4", className)}>אין נתוני השוואה</span>;
  const up = value >= 0;
  const good = invert ? !up : up;
  const Icon = up ? ArrowUp : ArrowDown;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] text-fg-3", className)}>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 font-medium",
          good ? "text-pos" : "text-warn",
        )}
      >
        <Icon className="size-3.5" strokeWidth={2.25} />
        <span className="num">{unit ?? formatSignedPct(value, digits)}</span>
      </span>
      <span className="whitespace-nowrap max-[400px]:hidden">{suffix}</span>
    </span>
  );
}
