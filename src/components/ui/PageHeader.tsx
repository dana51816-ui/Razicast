import { cn } from "./cn";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("pt-1 pb-5 md:pb-7", className)}>
      {eyebrow && <div className="mb-2">{eyebrow}</div>}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <h1 className="min-w-0 text-[24px] md:text-[30px] leading-[1.15] font-semibold tracking-tight text-fg">
          {title}
        </h1>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
      {subtitle && <p className="text-[13.5px] md:text-[14px] text-fg-3 mt-1.5">{subtitle}</p>}
    </header>
  );
}
