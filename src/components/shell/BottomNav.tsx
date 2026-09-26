"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../ui/cn";
import { isActive, NAV } from "./nav";
import { useAttention } from "./useAttention";

export function BottomNav() {
  const pathname = usePathname();
  const { missingReceipts } = useAttention();

  return (
    <nav
      aria-label="ניווט ראשי"
      className="lg:hidden fixed inset-x-0 bottom-0 z-50 pb-[max(env(safe-area-inset-bottom),8px)] px-3 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-[520px] glass rounded-[22px] border border-white/[0.08] shadow-[0_18px_40px_-12px_rgba(0,0,0,.8),inset_0_1px_0_rgba(255,255,255,.05)]">
        <ul className="grid grid-cols-5 h-[64px] px-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            const badge = item.href === "/receipts" ? missingReceipts.length : 0;
            return (
              <li key={item.href} className="relative">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="relative h-full flex flex-col items-center justify-center gap-1 select-none"
                >
                  {active && (
                    <motion.span
                      layoutId="bottomnav-active"
                      className="absolute inset-x-1.5 inset-y-1.5 rounded-2xl bg-white/[0.07] ring-1 ring-inset ring-white/[0.06]"
                      transition={{ type: "spring", stiffness: 520, damping: 38 }}
                    />
                  )}
                  <motion.span
                    className="relative"
                    animate={{ y: active ? -1 : 0, scale: active ? 1.06 : 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Icon
                      className={cn("size-[21px]", active ? "text-signal" : "text-fg-3")}
                      strokeWidth={active ? 2.1 : 1.75}
                    />
                    {badge > 0 && (
                      <span className="absolute -top-1.5 -end-2 min-w-4 h-4 px-1 rounded-full bg-warn text-ink-950 text-[10px] font-bold grid place-items-center num ring-2 ring-ink-850">
                        {badge}
                      </span>
                    )}
                  </motion.span>
                  <span
                    className={cn(
                      "relative text-[10.5px] leading-none whitespace-nowrap",
                      active ? "text-fg font-semibold" : "text-fg-3 font-medium",
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
