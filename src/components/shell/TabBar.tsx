"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { cn } from "../ui/cn";
import { IconHome, IconMonth, IconPlus, IconTeam } from "./icons";
import { activeHref, NAV } from "./nav";

const ICONS = { "/": IconHome, "/team": IconTeam, "/month": IconMonth } as const;

/** Phone navigation: three places and one big way to add anything. */
export function TabBar() {
  const pathname = usePathname();
  const { setAddMenuOpen } = useStore();
  const active = activeHref(pathname);

  return (
    <nav
      aria-label="ניווט ראשי"
      className="lg:hidden fixed inset-x-0 bottom-0 z-50 px-3.5 pb-[max(env(safe-area-inset-bottom),14px)] pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-[520px] h-[70px] rounded-[24px] bg-ink flex items-center gap-0.5 ps-1.5 pe-[9px] shadow-[0_16px_40px_-14px_rgba(13,14,16,.6)]">
        {NAV.map((item) => {
          const Icon = ICONS[item.href];
          const on = active === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={on ? "page" : undefined}
              className={cn(
                "flex-1 h-full flex flex-col items-center justify-center gap-1 text-[11px]",
                on ? "text-white font-bold" : "text-ink-3 font-semibold",
              )}
            >
              <Icon strokeWidth={on ? 2.3 : 2} />
              {item.label}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setAddMenuOpen(true)}
          aria-label="הוספה: פעילות, מדריך או מסגרת"
          className="h-[54px] ps-2.5 pe-5 rounded-[18px] bg-cobalt text-white flex items-center gap-2 text-[17px] font-bold active:scale-[0.97] transition-transform"
        >
          <span className="size-[28px] rounded-full bg-white text-cobalt grid place-items-center">
            <IconPlus strokeWidth={3.2} className="size-4" />
          </span>
          הוספה
        </button>
      </div>
    </nav>
  );
}
