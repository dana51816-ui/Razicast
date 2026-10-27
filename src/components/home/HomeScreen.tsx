"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { homeIssues } from "@/lib/audit";
import { activitiesIn, isClosed, previousMonthKey, totalsOf } from "@/lib/calc";
import { formatILS, monthLabel, monthName, monthShort } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Wordmark } from "../shell/Brand";
import { IconCheck, IconFramework, IconNext, IconPersonAdd, IconPlus } from "../shell/icons";
import { MonthPicker } from "../shell/MonthPicker";
import { IssueRow } from "../ui/IssueRow";
import { RollingNumber } from "../ui/RollingNumber";
import { Dimension, Split } from "../ui/Split";
import { DemoTag } from "../ui/Tags";
import { MonthPulse } from "./MonthPulse";
import { QuickRepeat } from "./QuickRepeat";
import { StorageLine } from "./StorageLine";

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

/** Section entrance, held until the opening sequence is over. */
function Reveal({ i, children, className }: { i: number; children: React.ReactNode; className?: string }) {
  const { introDone } = useStore();
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{ delay: 0.08 + i * 0.09, duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function HomeScreen() {
  const { data, month, introDone } = useStore();
  const t = totalsOf(activitiesIn(data, month));
  const prevKey = previousMonthKey(month);
  const prev = totalsOf(activitiesIn(data, prevKey));
  const closed = isClosed(data, month);
  const issues = homeIssues(data, month);
  const incomplete = t.incomplete.count > 0;
  const change = t.profit !== null && prev.profit !== null && prev.profit !== 0 ? ((t.profit - prev.profit) / Math.abs(prev.profit)) * 100 : null;
  const ghost =
    prev.confirmedRevenue > 0 && prev.confirmedPayment <= prev.confirmedRevenue
      ? { share: prev.confirmedPayment / prev.confirmedRevenue, label: monthShort(prevKey) }
      : null;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
      <div>
        <Reveal i={0}>
          <header className="flex items-center justify-between gap-3">
            <Wordmark className="lg:invisible" />
            <MonthPicker />
          </header>
        </Reveal>

        {/* ── Hero: one financial story ── */}
        <section aria-label={`תמונת ${monthName(month)}`} className="mt-8">
          <Reveal i={1}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[16px] font-semibold">רווח {monthName(month)}</span>
              {closed ? (
                <span className="text-[12px] font-semibold rounded-full bg-ink text-white px-2.5 py-0.5">נסגר</span>
              ) : incomplete ? (
                <span className="text-[12px] font-semibold text-amber-ink rounded-full px-2.5 py-0.5 missing-line">רווח לא סופי</span>
              ) : null}
              <DemoTag className="lg:hidden" />
            </div>
          </Reveal>

          {t.count === 0 ? (
            <p className="mt-4 display text-[64px] leading-[0.9] text-ink-2">אין פעילויות</p>
          ) : t.profit === null ? (
            <p className="mt-4 display text-[64px] leading-[0.9] text-amber-ink">מידע חסר</p>
          ) : (
            <div dir="ltr" className="mt-2 flex items-start justify-end gap-1.5">
              <motion.span
                className="display text-[min(54px,13vw)] leading-none mt-[0.35em]"
                initial={{ opacity: 0 }}
                animate={{ opacity: introDone ? 1 : 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                {t.profit < 0 ? "-₪" : "₪"}
              </motion.span>
              <RollingNumber
                key={month}
                value={fmt(Math.abs(t.profit))}
                start={introDone}
                delay={0.15}
                className={`display text-[min(128px,31vw)] sm:text-[150px] tracking-[-1px] ${t.profit < 0 ? "text-loss-ink" : ""}`}
              />
            </div>
          )}

          {t.margin !== null && (
            <Reveal i={3}>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="num text-[26px] font-bold text-cobalt">{t.margin.toFixed(1)}%</span>
                <span className="text-[15px] font-semibold">רווחיות</span>
                {change !== null && (
                  <span className="ms-auto text-[13px] text-ink-2">
                    <span className="num">{`${change >= 0 ? "+" : "-"}${Math.abs(change).toFixed(0)}%`}</span> מ{monthName(prevKey)}
                  </span>
                )}
              </div>
            </Reveal>
          )}

          {t.confirmedCount > 0 && (
            <Reveal i={4} className="mt-6">
              <Dimension>
                הכנסות <b className="num">{formatILS(t.confirmedRevenue)}</b>
              </Dimension>
              <Split
                key={month}
                revenue={t.confirmedRevenue}
                payment={t.confirmedPayment}
                height={64}
                labels
                className="mt-2"
                start={introDone}
                delay={0.35}
                ghost={ghost}
              />
              <div className="mt-2 flex gap-[3px] text-[13px]">
                {(() => {
                  const loss = t.confirmedPayment > t.confirmedRevenue;
                  const whole = Math.max(t.confirmedRevenue, t.confirmedPayment, 1);
                  const w1 = ((loss ? t.confirmedRevenue : t.confirmedPayment) / whole) * 100;
                  return (
                    <>
                      <b className="num text-center text-sand-ink" style={{ width: `${w1}%` }}>
                        {formatILS(t.confirmedPayment)}
                      </b>
                      <b className={`num text-center ${loss ? "text-loss-ink" : "text-cobalt"}`} style={{ width: `${100 - w1}%` }}>
                        {formatILS(t.profit ?? 0)}
                      </b>
                    </>
                  );
                })()}
              </div>
              {ghost && (
                <p className="mt-1.5 text-[12px] text-ink-2">
                  הקו המקווקו: איפה עמדה החלוקה ב{monthName(prevKey)}
                </p>
              )}
              {incomplete && (
                <Link href="/month" className="mt-4 flex items-center gap-2.5 text-[13px] text-ink-2 leading-snug">
                  <span aria-hidden className="w-[22px] h-[14px] shrink-0 rounded-[4px] missing-line" />
                  <span className="flex-1">
                    תשלומים <b className="num text-ink">{formatILS(t.payment)}</b>.{" "}
                    {t.incomplete.count === 1 ? "פעילות אחת" : `${t.incomplete.count} פעילויות`} עם מידע חסר
                    {t.incomplete.payment > 0 && (
                      <>
                        : תשלום <span className="num">{formatILS(t.incomplete.payment)}</span>
                      </>
                    )}
                    {t.incomplete.revenue > 0 && (
                      <>
                        {t.incomplete.payment > 0 ? " והכנסה " : ": הכנסה "}
                        <span className="num">{formatILS(t.incomplete.revenue)}</span>
                      </>
                    )}{" "}
                    מחוץ לרווח עד להשלמה
                  </span>
                  <IconNext className="size-4 shrink-0" />
                </Link>
              )}
            </Reveal>
          )}

          <Reveal i={6} className="hidden lg:block">
            <MonthPulse start={introDone} />
          </Reveal>
        </section>
      </div>

      <div>
        {/* ── Quick add: the easiest thing to find ── */}
        <Reveal i={5}>
          <QuickAdd />
          <QuickRepeat start={introDone} />
        </Reveal>

        <Reveal i={6} className="lg:hidden">
          <MonthPulse start={introDone} />
        </Reveal>

        {/* ── Needs attention ── */}
        <Reveal i={7}>
          <section aria-label="דורש טיפול" className="mt-9">
            <div className="flex items-baseline gap-2">
              <h2 className="text-[20px] font-bold">דורש טיפול</h2>
              {issues.total > 0 && <span className="num text-[14px] font-bold text-ink-2">{issues.total}</span>}
            </div>
            {issues.total === 0 ? (
              <div className="mt-3 flex items-center gap-3 py-4">
                <span className="size-9 rounded-full bg-ink text-white grid place-items-center">
                  <IconCheck strokeWidth={3} className="size-4" />
                </span>
                <span className="text-[15px] font-semibold">אין פריטים פתוחים ב{monthLabel(month)}</span>
              </div>
            ) : (
              <div className="mt-1">
                {issues.shown.map((i) => (
                  <IssueRow key={i.id} issue={i} />
                ))}
                {issues.more > 0 && (
                  <Link href="/month" className="mt-2 flex items-center justify-between h-12 text-[15px] font-bold">
                    עוד {issues.more} בבדיקת החודש
                    <IconNext strokeWidth={2.2} className="size-4" />
                  </Link>
                )}
              </div>
            )}
          </section>
        </Reveal>

        <Reveal i={8}>
          <StorageLine />
        </Reveal>
      </div>
    </div>
  );
}

function QuickAdd() {
  const { openFlow } = useStore();
  return (
    <section aria-label="הוספה מהירה" className="mt-8 lg:mt-[76px]">
      <div className="flex h-[88px] gap-1 rounded-[26px] bg-ink p-1.5">
        <button
          type="button"
          onClick={() => openFlow({ kind: "activity" })}
          className="flex-[1.3] rounded-[20px] bg-cobalt text-white px-3.5 py-3 flex flex-col justify-between items-start active:scale-[0.98] transition-transform"
        >
          <IconPlus strokeWidth={2.4} />
          <span className="text-[16px] font-bold">פעילות</span>
        </button>
        <button
          type="button"
          onClick={() => openFlow({ kind: "instructor" })}
          className="flex-1 rounded-[20px] text-white px-3.5 py-3 flex flex-col justify-between items-start hover:bg-ink-soft active:scale-[0.98] transition"
        >
          <IconPersonAdd />
          <span className="text-[16px] font-bold">מדריך</span>
        </button>
        <button
          type="button"
          onClick={() => openFlow({ kind: "framework" })}
          className="flex-1 rounded-[20px] text-white px-3.5 py-3 flex flex-col justify-between items-start hover:bg-ink-soft active:scale-[0.98] transition"
        >
          <IconFramework />
          <span className="text-[16px] font-bold">מסגרת</span>
        </button>
      </div>
    </section>
  );
}
