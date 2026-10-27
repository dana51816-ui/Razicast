"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/lib/store";

export function Toaster() {
  const { toasts, dismissToast } = useStore();
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
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
            className="pointer-events-auto max-w-[440px] rounded-2xl bg-ink text-white ps-4 pe-2 py-2 min-h-12 text-[14px] font-semibold shadow-xl flex items-center gap-3"
          >
            <span className="py-1.5 flex-1 text-center">{t.message}</span>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action!.run();
                  dismissToast(t.id);
                }}
                className="h-9 px-3.5 rounded-xl bg-white text-ink text-[14px] font-bold"
              >
                {t.action.label}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
