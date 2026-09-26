"use client";

import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { Sheet } from "../ui/Sheet";
import { IconNext, IconPlus } from "./icons";

/** The one place to add anything. Every option is one tap. */
export function AddMenu() {
  const { addMenuOpen, setAddMenuOpen, openFlow } = useStore();
  const close = () => setAddMenuOpen(false);
  const item = (i: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.12 + i * 0.06, duration: 0.35, ease: [0.2, 0.8, 0.2, 1] as const },
  });

  return (
    <Sheet open={addMenuOpen} onClose={close} label="הוספה">
      <div className="px-5 pt-3 pb-2 md:pt-6">
        <h2 className="text-[24px] font-bold px-1">מה מוסיפים?</h2>
        <motion.button
          {...item(0)}
          type="button"
          onClick={() => openFlow({ kind: "activity" })}
          className="mt-4 w-full text-start rounded-[24px] bg-cobalt text-white px-5 pt-5 pb-4 active:scale-[0.99] transition-transform"
        >
          <span className="flex items-center justify-between gap-3">
            <span>
              <span className="block text-[21px] font-bold">פעילות</span>
              <span className="block text-[14px] text-cobalt-soft mt-0.5">מי, איפה וכמה. הרווח מחושב מהתעריפים</span>
            </span>
            <span className="size-11 shrink-0 rounded-full bg-white text-cobalt grid place-items-center">
              <IconPlus strokeWidth={2.8} className="size-5" />
            </span>
          </span>
          <span aria-hidden className="mt-4 flex gap-[3px] h-2">
            <span className="w-[55%] rounded-e-full bg-white/35" />
            <span className="w-[45%] rounded-s-full bg-white" />
          </span>
        </motion.button>
        <motion.button
          {...item(1)}
          type="button"
          onClick={() => openFlow({ kind: "instructor" })}
          className="mt-2.5 w-full min-h-[82px] rounded-[22px] bg-well px-4 flex items-center gap-4 text-start active:scale-[0.99] transition-transform"
        >
          <span aria-hidden className="flex items-end w-14 shrink-0">
            <span className="size-8 rounded-full bg-ink" />
            <span className="size-[22px] -ms-1.5 rounded-full border-[1.5px] border-dashed border-ink bg-well" />
          </span>
          <span className="flex-1">
            <span className="block text-[18px] font-bold">מדריך</span>
            <span className="block text-[13px] text-ink-2">שם, טלפון ואיך משלמים</span>
          </span>
          <IconNext strokeWidth={2.2} className="size-[18px]" />
        </motion.button>
        <motion.button
          {...item(2)}
          type="button"
          onClick={() => openFlow({ kind: "framework" })}
          className="mt-2 w-full min-h-[82px] rounded-[22px] bg-well px-4 flex items-center gap-4 text-start active:scale-[0.99] transition-transform"
        >
          <span aria-hidden className="relative w-14 h-8 shrink-0">
            <span className="absolute inset-x-0 top-0 h-[18px] rounded-[5px] border-[1.5px] border-ink" />
            <span className="absolute inset-x-0 bottom-0 h-[1.5px] bg-ink" />
            <span className="absolute left-0 -bottom-1 w-[1.5px] h-[9px] bg-ink" />
            <span className="absolute right-0 -bottom-1 w-[1.5px] h-[9px] bg-ink" />
          </span>
          <span className="flex-1">
            <span className="block text-[18px] font-bold">מסגרת</span>
            <span className="block text-[13px] text-ink-2">בית ספר, גן, אירוע פרטי ומה הלקוח משלם</span>
          </span>
          <IconNext strokeWidth={2.2} className="size-[18px]" />
        </motion.button>
        <button type="button" onClick={close} className="mt-2 w-full h-12 text-[16px] font-semibold text-ink-2">
          ביטול
        </button>
      </div>
    </Sheet>
  );
}
