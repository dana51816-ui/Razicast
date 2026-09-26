import { formatILS, signedILS } from "@/lib/format";
import { cn } from "./cn";

/** A shekel amount. `signed` adds +/−; `loss` colors negatives red. */
export function Money({
  value,
  signed = false,
  className,
}: {
  value: number;
  signed?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("num", signed && value < 0 && "text-loss-ink", className)}>
      {signed ? signedILS(value) : formatILS(value)}
    </span>
  );
}
