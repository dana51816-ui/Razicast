import { Money } from "./Money";
import { MissingBadge } from "./StatusPill";

/** Renders a profit, or "מידע חסר" when it cannot be known. Never renders missing as a loss. */
export function ProfitValue({
  value,
  className,
  badgeClassName,
}: {
  value: number | null;
  className?: string;
  badgeClassName?: string;
}) {
  if (value === null) return <MissingBadge className={badgeClassName} />;
  return <Money value={value} tone="auto" className={className} />;
}
