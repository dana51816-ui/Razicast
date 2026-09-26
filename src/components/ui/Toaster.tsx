"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";

export function Toaster() {
  const { toasts } = useStore();
  return (
    <div
      aria-live="polite"
      className="fixed z-[95] inset-x-0 top-[max(env(safe-area-inset-top),12px)] flex flex-col items-center gap-2 px-4 pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ type: "spring", stiffness: 500, damping: 36 }}
            className="max-w-[420px] rounded-2xl bg-ink text-white px-4 py-3 text-[14px] font-semibold shadow-xl text-center"
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
