"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { reminderMessage } from "@/lib/audit";
import {
  activitiesIn,
  frameworkOf,
  FINANCIAL_LABEL,
  hasPaymentTerms,
  instructorMonth,
  lastMonths,
  RATE_MODELS,
  rateLine,
  receiptRecordOf,
  totalsOf,
} from "@/lib/calc";
import { dayMonth, formatILS, monthName, monthShort, signedILS } from "@/lib/format";
import { useStore } from "@/lib/store";
import { copyText } from "@/lib/useRunAction";
import { IconBack, IconCheck } from "../shell/icons";
import { MonthPicker } from "../shell/MonthPicker";
import { cn } from "../ui/cn";
import { Dimension, Split } from "../ui/Split";
import { MissingTag } from "../ui/Tags";

export function InstructorScreen() {
  const params = useSearchParams();
  const id = params.get("id");
  const store = useStore();
  const { data, month, openFlow } = store;
  const instructor = data.instructors.find((i) => i.id === id);

  if (!instructor) {
    return (
      <div className="pt-10">
        <h1 className="text-[24px] font-bold">המדריך לא נמצא</h1>
        <p className="mt-2 text-ink-2">ייתכן שהקישור ישן או שהנתונים אופסו.</p>
        <Link href="/team" className="mt-6 inline-flex h-12 px-5 rounded-2xl bg-ink text-white items-center font-bold">
          לצוות
        </Link>
      </div>
    );
  }

  const s = instructorMonth(data, instructor, month);
  const t = s.totals;
  const mName = monthName(month);
  const reviewed = data.months.find((m) => m.key === month)?.reviewedLosses.includes(instructor.id) ?? false;
  const terms = hasPaymentTerms(instructor);

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <Link href="/team" className="h-11 ps-2.5 pe-4 rounded-full bg-stone-2 inline-flex items-center gap-1 text-[15px] font-semibold">
          <IconBack strokeWidth={2.4} className="size-[18px]" />
          צוות
        </Link>
        <MonthPicker />
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
        <div>
          {/* Identity */}
          <section className="mt-6 flex items-center gap-4">
            <span
              className={cn(
                "size-[72px] shrink-0 rounded-full grid place-items-center text-[28px] font-bold",
                s.financial === "profit" && "bg-cobalt text-white",
                s.financial === "loss" && "bg-loss text-white",
                s.financial === "missing" && "border-2 border-dashed border-amber",
                s.financial === "idle" && "bg-stone-2",
              )}
            >
              {instructor.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <h1 className="display text-[60px] leading-[0.85] truncate">{instructor.name}</h1>
              <div className="mt-1 text-[14px] text-ink-2">
                {FINANCIAL_LABEL[s.financial]} · <span className="num">{s.activities.length}</span> פעילויות
                {instructor.phone && (
                  <>
                    {" "}· <span className="num">{instructor.phone}</span>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Verdict: what, why, what now */}
          <section className="mt-5">
            {s.financial === "profit" && (
              <p className="text-[19px] leading-snug font-semibold">
                ב{mName} נשאר לחברה <span className="num text-cobalt font-bold">{formatILS(t.profit!)}</span> מתוך{" "}
                <span className="num">{formatILS(t.confirmedRevenue)}</span>.
              </p>
            )}
            {s.financial === "loss" && (
              <>
                <p className="text-[19px] leading-snug font-semibold">
                  ב{mName} שולם ל{instructor.name} יותר ממה שנכנס. הפסד בפועל:{" "}
                  <span className="num text-loss-ink font-bold">{formatILS(Math.abs(t.profit!))}</span>.
                </p>
                <p className="mt-1 text-[14px] text-ink-2">הנתונים מלאים, אז זה לא חוסר מידע.{!terms && " אין תעריף שמור, ולכן כל תשלום הוזן ידנית."}</p>
                <div className="mt-3">
                  {reviewed ? (
                    <div className="flex items-center justify-between h-12 px-4 rounded-2xl bg-paper text-[14px] font-semibold">
                      סומן כנבדק
                      <button type="button" onClick={() => store.ackLoss(instructor.id, month, false)} className="h-10 text-ink-2">
                        ביטול
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        store.ackLoss(instructor.id, month, true);
                        store.notify("ההפסד סומן כנבדק");
                      }}
                      className="h-12 px-5 rounded-2xl bg-ink text-white text-[15px] font-bold"
                    >
                      ההפסד נכון, לסמן כנבדק
                    </button>
                  )}
                </div>
              </>
            )}
            {s.financial === "missing" && (
              <p className="text-[19px] leading-snug font-semibold">
                אי אפשר לחשב רווח ל{instructor.name} ב{mName}: חסר מידע כספי ב
                {t.incomplete.count === 1 ? "פעילות אחת" : `־${t.incomplete.count} פעילויות`}. משלימים למטה.
              </p>
            )}
            {s.financial === "idle" && <p className="text-[19px] leading-snug font-semibold">אין פעילויות ל{instructor.name} ב{mName}.</p>}
            {s.financial !== "missing" && t.incomplete.count > 0 && (
              <p className="mt-2 text-[14px] text-amber-ink">
                {t.incomplete.count === 1 ? "פעילות אחת" : `${t.incomplete.count} פעילויות`} עם מידע חסר לא נכללו ברווח.
              </p>
            )}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => openFlow({ kind: "activity", instructorId: instructor.id })}
                className="flex-1 h-[52px] rounded-2xl bg-cobalt text-white text-[16px] font-bold"
              >
                + הוסף פעילות
              </button>
              <button
                type="button"
                onClick={() => openFlow({ kind: "instructor", editId: instructor.id })}
                className="flex-1 h-[52px] rounded-2xl border-[1.5px] border-ink text-[16px] font-bold"
              >
                עריכת תנאי תשלום
              </button>
            </div>
          </section>

          {/* The split for this person */}
          {t.confirmedCount > 0 && (
            <section aria-label="הכנסה מול תשלום" className="mt-7">
              <Dimension>
                הכנסה <b className="num">{formatILS(t.confirmedRevenue)}</b>
              </Dimension>
              <Split revenue={t.confirmedRevenue} payment={t.confirmedPayment} height={52} className="mt-2" labels />
              <dl className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3">
                <Stat label="הכנסות" value={formatILS(t.revenue)} />
                <Stat label="תשלום" value={formatILS(t.payment)} />
                <Stat label="רווח" value={t.profit === null ? "—" : signedILS(t.profit)} tone={(t.profit ?? 0) < 0 ? "loss" : "cobalt"} />
                <Stat label="רווחיות" value={t.margin === null ? "—" : `${t.margin.toFixed(1)}%`} />
              </dl>
            </section>
          )}

          <ReceiptBlock instructorId={instructor.id} />
        </div>

        <div>
          {/* Activities */}
          <section aria-label="פעילויות" className="mt-8">
            <h2 className="text-[16px] font-bold">פעילויות {mName}</h2>
            {s.activities.length === 0 ? (
              <p className="mt-2 text-[14px] text-ink-2">עדיין אין.</p>
            ) : (
              <ul className="mt-1">
                {s.activities.map((a) => {
                  const f = frameworkOf(data, a.frameworkId);
                  const p = a.revenue.value !== null && a.instructorPayment.value !== null ? a.revenue.value - a.instructorPayment.value : null;
                  return (
                    <li key={a.id} className="flex items-center gap-3.5 py-3 border-b border-rule last:border-b-0">
                      <span className="w-10 shrink-0 text-center">
                        <b className="num block text-[20px] leading-none">{Number(a.date.slice(8))}</b>
                        <span className="block text-[11px] text-ink-2 mt-1">{monthShort(a.date.slice(0, 7))}</span>
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className={cn("block text-[15px] font-bold truncate", !f && "text-amber-ink")}>
                          {[f?.name ?? "חסרה מסגרת", a.label].filter(Boolean).join(" · ")}
                        </span>
                        <span className="block text-[12.5px] text-ink-2">
                          <span className="num">{a.quantity}</span> {a.unitLabel} · הכנסה{" "}
                          {a.revenue.value === null ? <span className="text-amber-ink">חסרה</span> : <span className="num">{formatILS(a.revenue.value)}</span>} · תשלום{" "}
                          {a.instructorPayment.value === null ? <span className="text-amber-ink">חסר</span> : <span className="num">{formatILS(a.instructorPayment.value)}</span>}
                        </span>
                        {(a.revenue.mode === "calculated" || a.instructorPayment.mode === "calculated") && (
                          <span className="block text-[11.5px] text-ink-3 mt-0.5">חושב מהתעריפים</span>
                        )}
                      </span>
                      {p !== null && a.frameworkId ? (
                        <b className={cn("num text-[15px]", p < 0 ? "text-loss-ink" : "text-cobalt")}>{signedILS(p)}</b>
                      ) : (
                        <button type="button" onClick={() => openFlow({ kind: "resolve", activityId: a.id })} aria-label="השלמת מידע">
                          <MissingTag className="h-9 px-3 text-[13px]">השלמה</MissingTag>
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Payment rules */}
          <section aria-label="תנאי תשלום" className="mt-8">
            <h2 className="text-[16px] font-bold">תנאי תשלום</h2>
            <dl className="mt-1">
              <Rule label="איך משלמים" value={instructor.paymentModel ? RATE_MODELS[instructor.paymentModel].label : null} />
              {instructor.paymentModel !== "custom" && <Rule label="תעריף" value={rateLine(instructor.paymentModel, instructor.baseRate)} />}
              <Rule label="נסיעה" value={instructor.travelRate !== null ? `+ ${formatILS(instructor.travelRate)} לנסיעה` : "בלי"} />
              <Rule label="קבלה" value={instructor.requiresReceipt === null ? null : instructor.requiresReceipt ? "נדרשת" : "לא נדרשת"} />
            </dl>
            {!terms && (
              <p className="mt-2 text-[13px] text-amber-ink leading-snug">בלי תעריף שמור, כל פעילות חדשה של {instructor.name} תצטרך הזנת תשלום ידנית.</p>
            )}
            <button
              type="button"
              onClick={() => openFlow({ kind: "instructor", editId: instructor.id })}
              className={cn("mt-3 h-12 px-5 rounded-2xl text-[15px] font-bold", terms ? "border-[1.5px] border-ink" : "bg-ink text-white")}
            >
              {terms ? "עריכת תנאי תשלום" : "הגדרת תעריף"}
            </button>
          </section>

          <Trend instructorId={instructor.id} />
        </div>
      </div>
    </>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "cobalt" | "loss" }) {
  return (
    <div>
      <dt className="text-[12px] text-ink-2">{label}</dt>
      <dd className={cn("num text-[16px] font-bold", tone === "cobalt" && "text-cobalt", tone === "loss" && "text-loss-ink")}>{value}</dd>
    </div>
  );
}

function Rule({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between min-h-12 border-b border-rule last:border-b-0 text-[15px]">
      <dt className="text-ink-2">{label}</dt>
      <dd className={cn("font-bold", value === null && "text-amber-ink")}>{value ?? "לא הוגדר"}</dd>
    </div>
  );
}

/** Receipt for the selected month: what, why, what now. */
function ReceiptBlock({ instructorId }: { instructorId: string }) {
  const store = useStore();
  const { data, month } = store;
  const [showMsg, setShowMsg] = useState(false);
  const instructor = data.instructors.find((i) => i.id === instructorId)!;
  const s = instructorMonth(data, instructor, month);
  const rec = receiptRecordOf(data, instructorId, month);
  const msg = reminderMessage(instructor.name, month, s.totals.payment);

  if (s.activities.length === 0) return null;
  if (instructor.requiresReceipt === false) {
    return <p className="mt-7 text-[14px] text-ink-2">לא נדרשת קבלה מ{instructor.name}.</p>;
  }
  if (instructor.requiresReceipt === null) {
    return (
      <section className="mt-7 rounded-[22px] missing-line p-4">
        <div className="text-[15px] font-bold">לא הוגדר אם נדרשת קבלה</div>
        <div className="text-[13px] text-ink-2 mt-0.5">בלי הגדרה, המערכת לא יכולה לעקוב אחרי הקבלה.</div>
        <button type="button" onClick={() => store.openFlow({ kind: "instructor", editId: instructorId })} className="mt-3 h-11 px-4 rounded-xl bg-ink text-white text-[14px] font-bold">
          להגדרה
        </button>
      </section>
    );
  }

  if (s.receipt === "received") {
    return (
      <section aria-label="קבלה" className="mt-7 flex items-center gap-3 rounded-[22px] bg-paper px-4 py-3.5">
        <span className="size-9 rounded-full bg-ink text-white grid place-items-center shrink-0">
          <IconCheck strokeWidth={3} className="size-4" />
        </span>
        <span className="flex-1">
          <span className="block text-[15px] font-bold">הקבלה ל{monthName(month)} התקבלה</span>
          <span className="block text-[13px] text-ink-2">
            על <span className="num">{formatILS(s.totals.payment)}</span>
          </span>
        </span>
        <button type="button" onClick={() => store.setReceipt(instructorId, month, "missing")} className="h-10 px-2 text-[14px] font-semibold text-ink-2">
          ביטול
        </button>
      </section>
    );
  }

  return (
    <section aria-label="קבלה" className="mt-7 rounded-[22px] bg-amber-wash missing-line p-4">
      <div className="flex items-center gap-2 text-[13px] font-bold text-amber-ink">
        <span className="size-2 rounded-full bg-amber-dot" />
        קבלה ל{monthName(month)} · עדיין לא התקבלה
      </div>
      <div className="mt-1.5 text-[17px] font-bold">
        נדרשת קבלה על <span className="num">{formatILS(s.totals.payment)}</span>
      </div>
      <div className="text-[13.5px] text-ink-2 mt-0.5">
        בלי קבלה התשלום לא מתועד בספרים.{rec?.remindedAt ? " תזכורת כבר הוכנה." : ""}
      </div>
      {showMsg && <div className="mt-3 rounded-2xl bg-paper px-4 py-3 text-[14px] leading-relaxed">{msg}</div>}
      <div className="mt-3.5 flex gap-2">
        <button
          type="button"
          onClick={async () => {
            if (!showMsg) {
              setShowMsg(true);
              return;
            }
            const ok = await copyText(msg);
            store.markReminded(instructorId, month);
            store.notify(ok ? "ההודעה הועתקה, אפשר להדביק בוואטסאפ" : "לא הצלחנו להעתיק. אפשר לסמן ולהעתיק ידנית");
          }}
          className="flex-1 h-[50px] rounded-2xl bg-ink text-white text-[15px] font-bold"
        >
          {showMsg ? "העתקת ההודעה" : "צור תזכורת"}
        </button>
        <button
          type="button"
          onClick={() => {
            store.setReceipt(instructorId, month, "received");
            store.notify("הקבלה סומנה כהתקבלה");
          }}
          className="flex-1 h-[50px] rounded-2xl border-[1.5px] border-ink text-[15px] font-bold"
        >
          התקבלה
        </button>
      </div>
    </section>
  );
}

/** Three months on the same scale — only drawn when there is history to compare. */
function Trend({ instructorId }: { instructorId: string }) {
  const { data, month } = useStore();
  const rows = lastMonths(month, 3).map((m) => ({
    m,
    t: totalsOf(activitiesIn(data, m).filter((a) => a.instructorId === instructorId)),
  }));
  if (rows.filter((r) => r.t.count > 0).length < 2) return null;
  const scale = Math.max(1, ...rows.map((r) => Math.max(r.t.confirmedRevenue, r.t.confirmedPayment)));

  return (
    <section aria-label="מגמת 3 חודשים" className="mt-8">
      <h2 className="text-[16px] font-bold mb-3">מגמת 3 חודשים</h2>
      <div className="flex flex-col gap-3.5">
        {rows.map(({ m, t }) => (
          <div key={m} className="grid grid-cols-[44px_minmax(0,1fr)_84px] items-center gap-2.5">
            <span className={cn("text-[13px]", m === month ? "font-bold" : "text-ink-2")}>{monthShort(m)}</span>
            {t.confirmedCount > 0 ? (
              <div style={{ width: `${(Math.max(t.confirmedRevenue, t.confirmedPayment) / scale) * 100}%` }}>
                <Split revenue={t.confirmedRevenue} payment={t.confirmedPayment} height={12} />
              </div>
            ) : (
              <span className="h-3 rounded missing-line" />
            )}
            <b className={cn("num text-[14px] text-left", (t.profit ?? 0) < 0 && "text-loss-ink", t.profit === null && "text-ink-3")}>
              {t.count === 0 ? "—" : t.profit === null ? "חסר" : signedILS(t.profit)}
            </b>
          </div>
        ))}
      </div>
    </section>
  );
}
