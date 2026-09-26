"use client";

import Link from "next/link";
import { homeIssues } from "@/lib/audit";
import { activitiesIn, isClosed, previousMonthKey, totalsOf } from "@/lib/calc";
import { formatILS, monthLabel, monthName } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Wordmark } from "../shell/Brand";
import { IconCheck, IconFramework, IconNext, IconPersonAdd, IconPlus } from "../shell/icons";
import { MonthPicker } from "../shell/MonthPicker";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { IssueRow } from "../ui/IssueRow";
import { Dimension, Split } from "../ui/Split";
import { DemoTag } from "../ui/Tags";

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

export function HomeScreen() {
  const { data, month } = useStore();
  const t = totalsOf(activitiesIn(data, month));
  const prevKey = previousMonthKey(month);
  const prev = totalsOf(activitiesIn(data, prevKey));
  const closed = isClosed(data, month);
  const issues = homeIssues(data, month);
  const incomplete = t.incomplete.count > 0;
  const change = t.profit !== null && prev.profit !== null && prev.profit !== 0 ? ((t.profit - prev.profit) / Math.abs(prev.profit)) * 100 : null;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
      <div>
        <header className="flex items-center justify-between gap-3">
          <Wordmark className="lg:invisible" />
          <MonthPicker />
        </header>

        {/* ── Hero: one financial story ── */}
        <section aria-label={`תמונת ${monthName(month)}`} className="mt-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[16px] font-semibold">רווח {monthName(month)}</span>
            {closed ? (
              <span className="text-[12px] font-semibold rounded-full bg-ink text-white px-2.5 py-0.5">נסגר</span>
            ) : incomplete ? (
              <span className="text-[12px] font-semibold text-amber-ink rounded-full px-2.5 py-0.5 missing-line">רווח לא סופי</span>
            ) : null}
            <DemoTag className="lg:hidden" />
          </div>

          {t.count === 0 ? (
            <p className="mt-4 display text-[64px] leading-[0.9] text-ink-2">אין פעילויות</p>
          ) : t.profit === null ? (
            <p className="mt-4 display text-[64px] leading-[0.9] text-amber-ink">מידע חסר</p>
          ) : (
            <div dir="ltr" className="mt-1.5 flex items-start justify-end gap-1">
              <span className="display text-[min(54px,13vw)] leading-none mt-4">{t.profit < 0 ? "-₪" : "₪"}</span>
              <AnimatedNumber
                value={Math.abs(t.profit)}
                format={fmt}
                className={`display text-[min(128px,31vw)] sm:text-[150px] leading-[0.8] tracking-[-1px] ${t.profit < 0 ? "text-loss-ink" : ""}`}
              />
            </div>
          )}

          {t.margin !== null && (
            <div className="mt-3 flex items-baseline gap-2">
              <span className="num text-[26px] font-bold text-cobalt">{t.margin.toFixed(1)}%</span>
              <span className="text-[15px] font-semibold">רווחיות</span>
              {change !== null && (
                <span className="ms-auto text-[13px] text-ink-2">
                  <span className="num">{`${change >= 0 ? "+" : "-"}${Math.abs(change).toFixed(0)}%`}</span> מ{monthName(prevKey)}
                </span>
              )}
            </div>
          )}

          {t.confirmedCount > 0 && (
            <div className="mt-6">
              <Dimension>
                הכנסות <b className="num">{formatILS(t.confirmedRevenue)}</b>
              </Dimension>
              <Split revenue={t.confirmedRevenue} payment={t.confirmedPayment} height={64} labels className="mt-2" />
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
            </div>
          )}
        </section>
      </div>

      <div>
        {/* ── Quick add: the easiest thing to find ── */}
        <QuickAdd />

        {/* ── Needs attention ── */}
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
