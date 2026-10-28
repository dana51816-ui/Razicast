"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { activitiesIn, totalsOf } from "@/lib/calc";
import { formatILS, monthLabel } from "@/lib/format";
import { useStore } from "@/lib/store";

const SEEN_KEY = "razicast-intro-seen";
const EASE = [0.2, 0.8, 0.2, 1] as const;

/**
 * Opening sequence (≈2.4s, once per session, tap to skip):
 * a measuring line draws across, a bar fills under it and splits into
 * the instructors' share and the company's share — this month's real
 * split — then the whole thing lifts away to reveal the app.
 */
export function Intro() {
  const { data, hydrated, currentMonth, setIntroDone } = useStore();
  const reduce = useReducedMotion();
  const [show, setShow] = useState<boolean | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* private mode: just play it */
    }
    if (seen || reduce) {
      setShow(false);
      setIntroDone(true);
      return;
    }
    setShow(true);
    const t = setTimeout(() => finish(), 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  const finish = () => {
    setShow(false);
    setIntroDone(true);
  };

  const t = totalsOf(activitiesIn(data, currentMonth));
  const hasSplit = t.confirmedRevenue > 0;
  const payShare = hasSplit ? Math.min(1, t.confirmedPayment / t.confirmedRevenue) : 0.5;
  const word = "RAZICAST".split("");

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          role="presentation"
          onClick={finish}
          className="fixed inset-0 z-[120] bg-stone flex flex-col items-center justify-center px-8 cursor-pointer"
          exit={{ y: "-100%", transition: { duration: 0.75, ease: [0.7, 0, 0.2, 1] } }}
        >
          <div className="w-full max-w-[420px]" dir="rtl">
            {/* Wordmark rises letter by letter */}
            <div dir="ltr" className="flex items-baseline justify-center gap-2 mb-10 overflow-hidden">
              <span className="flex">
                {word.map((ch, i) => (
                  <motion.span
                    key={i}
                    className="display text-[64px] leading-[0.9] tracking-[0.02em]"
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.9 + i * 0.045, duration: 0.6, ease: EASE }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </span>
            </div>

            {/* The measuring line */}
            <div className="relative h-6">
              <motion.div
                className="absolute inset-x-0 top-[11px] h-[1.5px] bg-ink origin-center"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: EASE }}
              />
              {[0, 1].map((side) => (
                <motion.div
                  key={side}
                  className="absolute top-[5px] h-[13px] w-[1.5px] bg-ink"
                  style={side ? { left: 0 } : { right: 0 }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ delay: 0.5, duration: 0.25 }}
                />
              ))}
              <motion.div
                className="absolute inset-0 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                <span className="bg-stone px-3 text-[14px] leading-6 font-semibold">{monthLabel(currentMonth)}</span>
              </motion.div>
            </div>

            {/* The bar: fills, then splits */}
            <div className="relative mt-3 h-16 flex gap-[3px]">
              <motion.div
                className="h-full bg-sand"
                style={{ borderRadius: "0 12px 12px 0" }}
                initial={{ width: "0%" }}
                animate={{ width: ["0%", "100%", `${payShare * 100}%`] }}
                transition={{ duration: 1.5, times: [0, 0.45, 1], ease: EASE, delay: 0.35 }}
              />
              <motion.div
                className="h-full bg-cobalt"
                style={{ borderRadius: "12px 0 0 12px" }}
                initial={{ width: "0%" }}
                animate={{ width: ["0%", "0%", `${(1 - payShare) * 100}%`] }}
                transition={{ duration: 1.5, times: [0, 0.45, 1], ease: EASE, delay: 0.35 }}
              />
            </div>
            <motion.div
              className="mt-3 flex justify-between text-[13px] font-semibold"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.4 }}
            >
              <span className="text-sand-ink">למדריכים</span>
              <span className="text-cobalt">
                {t.profit !== null ? <>לחברה <span className="num">{formatILS(t.profit)}</span></> : "לחברה"}
              </span>
            </motion.div>

            <motion.div
              dir="ltr"
              className="mt-12 text-center text-[11px] font-bold tracking-[0.4em] text-ink-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.5 }}
            >
              CONTROL
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
