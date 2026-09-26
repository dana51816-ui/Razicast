"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { auditMonth } from "@/lib/audit";
import { activitiesIn, isClosed, teamMonth, totalsOf } from "@/lib/calc";
import { formatILS, monthName } from "@/lib/format";
import { useStore } from "@/lib/store";
import { IconCheck, IconLock } from "../shell/icons";
import { MonthPicker } from "../shell/MonthPicker";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { cn } from "../ui/cn";
import { IssueRow } from "../ui/IssueRow";

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

export function MonthScreen() {
  const store = useStore();
  const { data, month } = store;
  const acts = activitiesIn(data, month).sort((a, b) => a.date.localeCompare(b.date));
  const t = totalsOf(acts);
  const audit = auditMonth(data, month);
  const team = teamMonth(data, month).filter((s) => s.activities.length > 0);
  const receiptsRequired = team.filter((s) => s.receipt !== null).length;
  const closed = isClosed(data, month);
  const closedAt = data.months.find((m) => m.key === month)?.closedAt;
  const mName = monthName(month);
  const [openDone, setOpenDone] = useState(false);

  // Marks: which activities the audit flagged
  const blockerIds = new Set(audit.blockers.map((i) => i.id.replace(/^(rev|pay|fw)-/, "")));
  const lossInstructors = new Set(audit.attention.filter((i) => i.tone === "loss").map((i) => i.id.replace("loss-", "")));

  return (
    <>
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[13px] font-semibold text-ink-2">{closed ? "סגירת חודש · הושלמה" : "בדיקת סוף חודש"}</div>
          <h1 className="display mt-1.5 text-[46px] min-[400px]:text-[58px] leading-[0.86]">
            {closed ? (
              <>
                {mName}
                <br />
                נסגר
              </>
            ) : (
              <>
                המערכת בדקה
                <br />
                את {mName}
              </>
            )}
          </h1>
          <p className="mt-3 text-[15px] text-ink-2">
            <span className="num">{acts.length}</span> פעילויות, <span className="num">{team.length}</span> מדריכים
            {receiptsRequired > 0 && (
              <>
                {" "}ו־<span className="num">{receiptsRequired}</span> קבלות
              </>
            )}
          </p>
        </div>
        <MonthPicker />
      </header>

      <Scan
        key={month}
        marks={acts.map((a) => ({
          id: a.id,
          state: blockerIds.has(a.id) ? "block" : lossInstructors.has(a.instructorId) && a.revenue.value !== null && a.instructorPayment.value !== null && a.revenue.value < a.instructorPayment.value ? "warn" : "ok",
        }))}
      />

      <div className="lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12 lg:items-start">
        <div>
          {/* Blocks closing */}
          {audit.blockers.length > 0 && (
            <section aria-label="חוסם סגירה" className="mt-7 rounded-[26px] border-2 border-dashed border-loss px-4 pt-3 pb-1">
              <div className="text-[13px] font-bold text-loss-ink">
                חוסם סגירה · <span className="num">{audit.blockers.length}</span>
              </div>
              {audit.blockers.map((i) => (
                <IssueRow key={i.id} issue={i} />
              ))}
            </section>
          )}
          {audit.blockers.length === 0 && acts.length > 0 && !closed && (
            <section className="mt-7 flex items-center gap-3 rounded-[22px] bg-paper px-4 py-3.5">
              <span className="size-9 rounded-full bg-ink text-white grid place-items-center shrink-0">
                <IconCheck strokeWidth={3} className="size-4" />
              </span>
              <span className="text-[15px] font-bold">אין חסימות. אפשר לסגור את {mName}</span>
            </section>
          )}

          {/* Needs attention */}
          {audit.attention.length > 0 && (
            <section id="receipts" aria-label="דורש טיפול" className="mt-7 scroll-mt-6">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] font-bold text-amber-ink">
                  דורש טיפול · <span className="num">{audit.attention.length}</span>
                </span>
                <span className="text-[12px] text-ink-2">לא חוסם סגירה</span>
              </div>
              {audit.attention.map((i) => (
                <IssueRow key={i.id} issue={i} />
              ))}
            </section>
          )}

          {audit.info.length > 0 && (
            <section aria-label="לשיפור" className="mt-5">
              {audit.info.map((i) => (
                <IssueRow key={i.id} issue={i} />
              ))}
            </section>
          )}

          {/* Done */}
          <section aria-label="הושלם" className="mt-4">
            <button type="button" onClick={() => setOpenDone((o) => !o)} aria-expanded={openDone} className="w-full h-[52px] flex items-center gap-3 text-start">
              <span className="size-[26px] rounded-full bg-ink text-white grid place-items-center shrink-0">
                <IconCheck strokeWidth={3} className="size-3.5" />
              </span>
              <span className="flex-1 text-[16px] font-bold">
                הושלם · <span className="num">{audit.done.length}</span>
              </span>
              <span className="text-[13px] font-semibold text-ink-2">{openDone ? "הסתרה" : "פירוט"}</span>
            </button>
            {openDone && (
              <ul className="ps-[38px] flex flex-col gap-2.5 pb-2 text-[14px] text-ink-2">
                {audit.done.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            )}
          </section>

          {/* Business rule */}
          <label className="mt-3 flex items-center justify-between gap-4 min-h-14 border-t border-rule pt-2 cursor-pointer">
            <span>
              <span className="block text-[14px] font-semibold">קבלות חסרות חוסמות סגירה</span>
              <span className="block text-[12.5px] text-ink-2">כלל עסקי. כרגע {data.settings.receiptsBlockClosing ? "חוסמות" : "לא חוסמות"}</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={data.settings.receiptsBlockClosing}
              onClick={() => store.setSettings({ receiptsBlockClosing: !data.settings.receiptsBlockClosing })}
              className={cn("relative h-8 w-[52px] shrink-0 rounded-full transition-colors", data.settings.receiptsBlockClosing ? "bg-cobalt" : "bg-stone-3")}
            >
              <span
                className={cn(
                  "absolute top-1 size-6 rounded-full bg-white shadow transition-all",
                  data.settings.receiptsBlockClosing ? "left-1" : "left-[24px]",
                )}
              />
            </button>
          </label>
        </div>

        {/* Reconciliation + close */}
        <section aria-label="סיכום וסגירה" className="mt-7 lg:sticky lg:top-8 rounded-[26px] bg-ink text-white p-5">
          <div className="text-[13px] text-ink-3 font-semibold">סיכום {mName}</div>
          <dl className="mt-3 text-[14px]">
            <Line label="הכנסות" value={formatILS(t.revenue)} />
            <Line label="תשלומים למדריכים" value={`-${formatILS(t.payment)}`} />
            {t.incomplete.count > 0 && (
              <>
                <Line label="הפרש" value={`${t.revenue - t.payment < 0 ? "-" : ""}${formatILS(Math.abs(t.revenue - t.payment))}`} />
                <Line
                  label={`מוחרג: ${t.incomplete.count === 1 ? "פעילות אחת" : `${t.incomplete.count} פעילויות`} עם מידע חסר`}
                  value={`${t.incomplete.payment - t.incomplete.revenue >= 0 ? "+" : "-"}${formatILS(Math.abs(t.incomplete.payment - t.incomplete.revenue))}`}
                  muted
                />
              </>
            )}
          </dl>
          <div className="mt-3 pt-3 border-t border-ink-soft flex items-end justify-between gap-3">
            <span className="text-[14px] font-semibold">{closed ? "רווח סופי" : t.incomplete.count ? "רווח מאומת · לא סופי" : "רווח"}</span>
            {t.profit === null ? (
              <span className="text-[15px] font-bold text-amber-dot">מידע חסר</span>
            ) : (
              <span dir="ltr" className="flex items-start gap-0.5">
                <span className="display text-[26px] leading-none mt-1">{t.profit < 0 ? "-₪" : "₪"}</span>
                <AnimatedNumber value={Math.abs(t.profit)} format={fmt} className="display text-[56px] leading-[0.85]" />
              </span>
            )}
          </div>
          {t.margin !== null && (
            <div className="mt-1 text-[13px] text-ink-3 text-end">
              רווחיות <span className="num text-white font-bold">{t.margin.toFixed(1)}%</span>
            </div>
          )}

          {closed ? (
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-ink-soft px-4 py-3">
              <IconLock className="size-5 shrink-0" />
              <span className="flex-1 text-[14px]">
                <b className="block">{mName} נסגר</b>
                <span className="text-ink-3">{closedAt ? new Date(closedAt).toLocaleDateString("he-IL") : ""}</span>
              </span>
              <button type="button" onClick={() => store.closeMonth(month, false)} className="h-10 px-3 rounded-xl text-[13px] font-semibold text-ink-3 hover:text-white">
                פתיחה מחדש
              </button>
            </div>
          ) : audit.canClose ? (
            <button
              type="button"
              onClick={() => {
                store.closeMonth(month, true);
                store.notify(`${mName} נסגר`);
              }}
              className="mt-4 w-full h-[58px] rounded-2xl bg-cobalt text-white text-[17px] font-bold"
            >
              סגירת {mName}
            </button>
          ) : (
            <div className="mt-4">
              <div className="w-full h-[58px] rounded-2xl border-[1.5px] border-ink-soft text-ink-3 text-[15px] font-bold flex items-center justify-center gap-2">
                <IconLock className="size-[18px]" />
                {acts.length === 0 ? "אין פעילויות לסגירה" : `קודם ${audit.blockers.length === 1 ? "חוסם אחד" : `${audit.blockers.length} חוסמים`}, ואז סגירה`}
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function Line({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt className={cn("leading-snug", muted ? "text-amber-dot" : "text-ink-3")}>{label}</dt>
      <dd className={cn("num font-bold whitespace-nowrap", muted && "text-amber-dot")}>{value}</dd>
    </div>
  );
}

/** One mark per activity in date order; they light up as the audit "reads" the month. */
function Scan({ marks }: { marks: { id: string; state: "ok" | "warn" | "block" }[] }) {
  const reduce = useReducedMotion();
  const [seen, setSeen] = useState(reduce ? marks.length : 0);
  useEffect(() => {
    if (reduce) return;
    const iv = setInterval(() => setSeen((n) => (n >= marks.length ? n : n + 1)), 45);
    return () => clearInterval(iv);
  }, [marks.length, reduce]);
  if (marks.length === 0) return null;
  return (
    <section aria-label="סריקת הפעילויות" className="mt-6">
      <div className="flex gap-[3px] h-12 items-stretch">
        {marks.map((m, i) => (
          <motion.span
            key={m.id}
            animate={{ opacity: i < seen ? 1 : 0.12, scaleY: i < seen ? 1 : 0.4 }}
            transition={{ duration: 0.25 }}
            style={{ transformOrigin: "bottom" }}
            className={cn(
              "flex-1 min-w-[4px] rounded-[4px]",
              m.state === "ok" && "bg-ink",
              m.state === "warn" && "bg-amber-dot",
              m.state === "block" && "border-2 border-dashed border-loss",
            )}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-end gap-3 text-[12px] text-ink-2">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-[2px] bg-ink" />
          תקין
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-[2px] bg-amber-dot" />
          הפסד לבדיקה
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-[2px] border-[1.5px] border-dashed border-loss" />
          חוסם
        </span>
      </div>
    </section>
  );
}
