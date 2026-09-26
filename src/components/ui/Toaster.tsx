"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useStore } from "@/lib/store";

export function Toaster() {
  const { toasts } = useStore();
  return (
    <div
      aria-live="polite"
      className="fixed z-[90] inset-x-0 top-[max(env(safe-area-inset-top),12px)] flex flex-col items-center gap-2 pointer-events-none px-4"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 500, damping: 36 }}
            className="surface-raised glass rounded-full h-11 ps-3 pe-4 flex items-center gap-2 text-[14px] text-fg shadow-2xl"
          >
            <CheckCircle2 className="size-[18px] text-signal" />
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
