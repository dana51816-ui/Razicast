"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useIsDesktop } from "@/lib/useMediaQuery";
import { cn } from "./cn";

/**
 * One overlay, two sizes.
 *  - "sheet":  a bottom sheet on the phone (drag down to close), a centered panel on desktop
 *  - "screen": a full-height flow on the phone, a tall centered panel on desktop
 */
export function Sheet({
  open,
  onClose,
  label,
  size = "sheet",
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  /** Accessible name */
  label: string;
  size?: "sheet" | "screen";
  children: React.ReactNode;
  className?: string;
}) {
  const desktop = useIsDesktop();
  const [mounted, setMounted] = useState(false);
  const id = useId();
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    // Lock both <html> and <body>: locking only body still lets the page scroll behind the sheet on iOS
    const root = document.documentElement;
    const prev = [root.style.overflow, document.body.style.overflow];
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      root.style.overflow = prev[0];
      document.body.style.overflow = prev[1];
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 700) onClose();
  };
  const mobileSheet = !desktop && size === "sheet";
  const mobileScreen = !desktop && size === "screen";

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]" role="presentation" key={id}>
          <motion.button
            type="button"
            aria-label="סגירה"
            tabIndex={-1}
            className="absolute inset-0 bg-ink/50 cursor-default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <div
            className={cn(
              "absolute pointer-events-none flex",
              desktop ? "inset-0 items-center justify-center p-6" : "inset-x-0 bottom-0 top-0 items-end",
            )}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={label}
              initial={desktop ? { opacity: 0, y: 16, scale: 0.98 } : { y: "100%" }}
              animate={desktop ? { opacity: 1, y: 0, scale: 1 } : { y: 0 }}
              exit={desktop ? { opacity: 0, y: 10, scale: 0.98 } : { y: "100%" }}
              transition={desktop ? { duration: 0.22, ease: [0.2, 0.8, 0.2, 1] } : { type: "spring", stiffness: 420, damping: 42 }}
              drag={mobileSheet ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={onDragEnd}
              className={cn(
                "pointer-events-auto flex flex-col text-ink shadow-[0_-20px_60px_-20px_rgba(13,14,16,.35)]",
                mobileSheet && "w-full max-h-[92dvh] bg-paper rounded-t-[32px] pb-[max(env(safe-area-inset-bottom),16px)]",
                mobileScreen && "w-full h-[100dvh] bg-stone pt-[env(safe-area-inset-top)] pb-[max(env(safe-area-inset-bottom),12px)]",
                desktop && size === "sheet" && "w-full max-w-[480px] max-h-[86vh] bg-paper rounded-[28px]",
                desktop && size === "screen" && "w-full max-w-[460px] h-[min(860px,92vh)] bg-stone rounded-[28px]",
                className,
              )}
            >
              {mobileSheet && (
                <div className="pt-3 pb-1 grid place-items-center cursor-grab" aria-hidden>
                  <div className="h-[5px] w-10 rounded-full bg-stone-3" />
                </div>
              )}
              <div className="flex-1 min-h-0 flex flex-col" onPointerDownCapture={(e) => mobileSheet && e.stopPropagation()}>
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
