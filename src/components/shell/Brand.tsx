import { cn } from "../ui/cn";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span dir="ltr" className={cn("text-[12px] font-bold tracking-[0.22em] whitespace-nowrap", className)}>
      RAZICAST <span className="text-ink-2 font-medium">CONTROL</span>
    </span>
  );
}
