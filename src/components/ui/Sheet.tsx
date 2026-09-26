"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useIsDesktop } from "@/lib/useMediaQuery";
import { cn } from "./cn";

/**
 * One overlay primitive, three presentations:
 *  - phone: bottom sheet with drag-to-dismiss (feels native on iPhone)
 *  - desktop "drawer": panel sliding in from the inline-end edge (left in RTL)
 *  - desktop "dialog": centered modal
 */
export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  variant = "dialog",
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "dialog" | "drawer";
  className?: string;
}) {
  const desktop = useIsDesktop();
  const [mounted, setMounted] = useState(false);
  const titleId = useId();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const mode = !desktop ? "sheet" : variant;

  const panelMotion = {
    sheet: {
      initial: { y: "100%" },
      animate: { y: 0 },
      exit: { y: "100%" },
      transition: { type: "spring" as const, stiffness: 420, damping: 42 },
    },
    drawer: {
      initial: { x: "-100%" },
      animate: { x: 0 },
      exit: { x: "-100%" },
      transition: { type: "spring" as const, stiffness: 380, damping: 40 },
    },
    dialog: {
      initial: { opacity: 0, scale: 0.97, y: 8 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.98, y: 4 },
      transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
    },
  }[mode];

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onClose();
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]" role="presentation">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <div
            className={cn(
              "absolute pointer-events-none flex",
              mode === "sheet" && "inset-x-0 bottom-0 items-end",
              mode === "drawer" && "inset-y-0 left-0 items-stretch",
              mode === "dialog" && "inset-0 items-center justify-center p-6",
            )}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              {...panelMotion}
              drag={mode === "sheet" ? "y" : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={onDragEnd}
              className={cn(
                "pointer-events-auto surface-raised flex flex-col text-fg",
                mode === "sheet" &&
                  "w-full max-h-[92dvh] rounded-t-[26px] pb-[max(env(safe-area-inset-bottom),12px)]",
                mode === "drawer" && "w-[480px] max-w-[92vw] h-full rounded-e-[22px] border-s-0",
                mode === "dialog" && "w-full max-w-[480px] max-h-[86vh] rounded-[22px]",
                className,
              )}
            >
              {mode === "sheet" && (
                <div className="pt-2.5 pb-1 grid place-items-center cursor-grab active:cursor-grabbing">
                  <div className="h-1 w-10 rounded-full bg-white/15" />
                </div>
              )}
              <div className="flex items-start justify-between gap-4 px-5 pt-3 pb-4 md:px-6 md:pt-6">
                <div className="min-w-0">
                  <h2 id={titleId} className="text-[18px] font-semibold tracking-tight">
                    {title}
                  </h2>
                  {subtitle && <div className="text-[13px] text-fg-3 mt-1">{subtitle}</div>}
                </div>
                <button
                  onClick={onClose}
                  aria-label="סגירה"
                  className="shrink-0 size-9 -me-1.5 -mt-1 rounded-full grid place-items-center text-fg-3 hover:text-fg hover:bg-white/[0.06] transition-colors"
                >
                  <X className="size-[18px]" />
                </button>
              </div>
              <div
                className="flex-1 overflow-y-auto overscroll-contain px-5 md:px-6 pb-5"
                onPointerDownCapture={(e) => e.stopPropagation()}
              >
                {children}
              </div>
              {footer && (
                <div className="px-5 md:px-6 pt-3 pb-3 md:pb-6 border-t hairline">{footer}</div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
