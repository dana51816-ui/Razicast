"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { monthLabel } from "@/lib/data";
import { useStore } from "@/lib/store";
import { cn } from "../ui/cn";
import { DemoBadge } from "../ui/DemoBadge";
import { BrandMark, Wordmark } from "./Brand";
import { isActive, NAV } from "./nav";
import { useAttention } from "./useAttention";

export function Sidebar() {
  const pathname = usePathname();
  const { month, closedMonths } = useStore();
  const { missingReceipts } = useAttention();
  const closed = closedMonths.includes(month);

  return (
    <aside className="hidden lg:flex fixed inset-y-0 start-0 z-40 w-[244px] flex-col border-e hairline bg-ink-950/60 backdrop-blur-xl">
      <div className="h-[72px] px-5 flex items-center gap-3">
        <BrandMark />
        <Wordmark />
      </div>

      <nav className="px-3 pt-2 flex flex-col gap-0.5" aria-label="ניווט ראשי">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          const badge = item.href === "/receipts" ? missingReceipts.length : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative h-10 px-3 rounded-xl flex items-center gap-3 text-[14px] transition-colors",
                active ? "text-fg" : "text-fg-3 hover:text-fg-2 hover:bg-white/[0.03]",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-white/[0.06] ring-1 ring-inset ring-white/[0.06]"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              {active && (
                <motion.span
                  layoutId="sidebar-active-bar"
                  className="absolute start-0 top-2.5 bottom-2.5 w-[3px] rounded-full bg-signal -ms-3"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <Icon
                className={cn("relative size-[18px]", active && "text-signal")}
                strokeWidth={active ? 2.1 : 1.75}
              />
              <span className="relative font-medium">{item.label}</span>
              {badge > 0 && (
                <span className="relative ms-auto min-w-5 h-5 px-1.5 rounded-full bg-warn/15 text-warn text-[11px] font-semibold grid place-items-center num">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-3">
        <div className="rounded-2xl surface p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-fg-3">חודש פעיל</span>
            <span
              className={cn(
                "text-[11px] font-medium px-1.5 h-5 rounded-md grid place-items-center",
                closed ? "bg-white/[0.06] text-fg-3" : "bg-signal/10 text-signal",
              )}
            >
              {closed ? "נסגר" : "פתוח"}
            </span>
          </div>
          <div className="text-[14px] font-semibold mt-1">{monthLabel(month)}</div>
          <DemoBadge className="mt-2" />
        </div>
        <div className="flex items-center gap-3 px-2 pt-4 pb-1">
          <div className="size-8 rounded-full bg-gradient-to-br from-ink-500 to-ink-700 ring-1 ring-white/10 grid place-items-center text-[13px] font-semibold">
            ר
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-medium">רזי</div>
            <div className="text-[11.5px] text-fg-3">בעלים</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
