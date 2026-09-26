import { cn } from "../ui/cn";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-8", className)} aria-hidden>
      <rect width="64" height="64" rx="16" fill="#101215" />
      <rect x="0.5" y="0.5" width="63" height="63" rx="15.5" fill="none" stroke="#fff" strokeOpacity=".1" />
      <path
        d="M21 45V19h13a8.5 8.5 0 0 1 0 17h-6l11 9"
        fill="none"
        stroke="#c8f24a"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("latin-caps text-[11.5px] tracking-[0.14em] whitespace-nowrap font-semibold text-fg leading-none", className)}>
      Razicast <span className="text-fg-3 font-medium">Control</span>
    </span>
  );
}
