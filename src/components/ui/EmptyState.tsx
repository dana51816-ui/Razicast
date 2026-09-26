import type { LucideIcon } from "lucide-react";
import { cn } from "./cn";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center px-6 py-12 rounded-[var(--radius-card)] border border-dashed border-white/[0.08]",
        className,
      )}
    >
      <div className="relative mb-4">
        <div className="absolute inset-0 blur-xl bg-signal/10 rounded-full" />
        <div className="relative size-12 rounded-2xl surface grid place-items-center">
          <Icon className="size-5 text-fg-2" strokeWidth={1.75} />
        </div>
      </div>
      <p className="text-[15px] font-semibold text-fg">{title}</p>
      {body && <p className="text-[13px] text-fg-3 mt-1 max-w-[280px] leading-relaxed">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
