import { formatILS } from "@/lib/format";
import { cn } from "./cn";

type Tone = "default" | "auto" | "muted";

export function Money({
  value,
  tone = "default",
  className,
}: {
  value: number;
  /** auto: red for negative values */
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "num",
        tone === "auto" && value < 0 && "text-neg",
        tone === "muted" && "text-fg-2",
        className,
      )}
    >
      {formatILS(value)}
    </span>
  );
}
