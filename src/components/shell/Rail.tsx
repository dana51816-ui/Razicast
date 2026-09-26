"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { cn } from "../ui/cn";
import { DemoTag } from "../ui/Tags";
import { Wordmark } from "./Brand";
import { IconHome, IconMonth, IconPlus, IconTeam } from "./icons";
import { activeHref, NAV } from "./nav";

const ICONS = { "/": IconHome, "/team": IconTeam, "/month": IconMonth } as const;

/** Desktop navigation: the same three places and the same add, as a side rail. */
export function Rail() {
  const pathname = usePathname();
  const { setAddMenuOpen } = useStore();
  const active = activeHref(pathname);
  return (
    <aside className="hidden lg:flex fixed inset-y-0 start-0 z-40 w-[232px] flex-col px-4 py-8 border-e border-rule">
      <div className="px-2">
        <Wordmark />
      </div>
      <button
        type="button"
        onClick={() => setAddMenuOpen(true)}
        className="mt-8 h-[54px] rounded-[18px] bg-cobalt text-white flex items-center gap-2.5 ps-2.5 pe-4 text-[17px] font-bold hover:brightness-110 transition"
      >
        <span className="size-[30px] rounded-full bg-white text-cobalt grid place-items-center">
          <IconPlus strokeWidth={3.2} className="size-4" />
        </span>
        הוספה
      </button>
      <nav aria-label="ניווט ראשי" className="mt-6 flex flex-col gap-1">
        {NAV.map((item) => {
          const Icon = ICONS[item.href];
          const on = active === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={on ? "page" : undefined}
              className={cn(
                "h-11 px-3 rounded-xl flex items-center gap-3 text-[15px] transition-colors",
                on ? "bg-ink text-white font-bold" : "text-ink-2 font-semibold hover:bg-stone-2",
              )}
            >
              <Icon strokeWidth={on ? 2.3 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto px-2">
        <DemoTag />
      </div>
    </aside>
  );
}
