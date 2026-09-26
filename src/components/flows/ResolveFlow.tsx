"use client";

import { useMemo, useState } from "react";
import { activitiesIn, frameworkOf, monthOf, quoteActivity, totalsOf } from "@/lib/calc";
import { dayMonth, formatILS, monthName } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Amount } from "@/lib/types";
import { IconCheck } from "../shell/icons";
import { cn } from "../ui/cn";
import { PrimaryButton, SmallAmount } from "./parts";

/**
 * Completes the missing parts of one activity — framework, revenue, payment —
 * and nothing else. Where a stored rate exists it is offered (with its source);
 * where none exists the user types the amount. Nothing is guessed.
 */
export function ResolveFlow({ activityId, onClose }: { activityId: string; onClose: () => void }) {
  const { data, updateActivity, notify } = useStore();
  const a = data.activities.find((x) => x.id === activityId);
  const instructor = a ? data.instructors.find((i) => i.id === a.instructorId) ?? null : null;

  const [frameworkId, setFrameworkId] = useState<string | null>(a?.frameworkId ?? null);
  const framework = frameworkOf(data, frameworkId);
  const quote = useMemo(
    () => (a && instructor ? quoteActivity({ instructor, framework, quantity: a.quantity, travelUnits: a.travelUnits }) : null),
    [a, instructor, framework],
  );

  const needRev = a?.revenue.value === null;
  const needPay = a?.instructorPayment.value === null;
  const needFw = a?.frameworkId === null;

  const [rev, setRev] = useState(quote?.revenue.value != null ? String(quote.revenue.value) : "");
  const [pay, setPay] = useState(quote?.payment.value != null ? String(quote.payment.value) : "");

  if (!a || !instructor) {
    return (
      <div className="p-6">
        <p className="text-[15px]">הפעילות לא נמצאה.</p>
        <PrimaryButton className="mt-4" onClick={onClose}>
          סגירה
        </PrimaryButton>
      </div>
    );
  }

  const amountFrom = (typed: string, auto: Amount | undefined): Amount => {
    if (typed === "") return { value: null, mode: "missing", source: null };
    const n = Number(typed);
    if (auto && auto.value === n) return auto;
    return { value: n, mode: "manual", source: "הוזן ידנית" };
  };
  const newRev = needRev ? amountFrom(rev, quote?.revenue) : a.revenue;
  const newPay = needPay ? amountFrom(pay, quote?.payment) : a.instructorPayment;

  const month = monthOf(a.date);
  const others = activitiesIn(data, month).filter((x) => x.id !== a.id);
  const preview = totalsOf([...others, { ...a, revenue: newRev, instructorPayment: newPay }]).profit;
  const current = totalsOf(activitiesIn(data, month)).profit;

  const canSave = (!needFw || frameworkId !== null) && (!needRev || rev !== "") && (!needPay || pay !== "");

  const save = () => {
    updateActivity(a.id, { frameworkId, revenue: newRev, instructorPayment: newPay });
    notify(needRev || needPay ? `המידע הושלם. הרווח של ${monthName(month)} עודכן` : "המסגרת נשמרה");
    onClose();
  };

  return (
    <div className="flex flex-col min-h-0 overflow-y-auto px-6 pt-3 pb-4 md:pt-7">
      <h2 className="text-[22px] font-bold leading-tight">
        {needRev ? `כמה נכנס מהפעילות של ${instructor.name}?` : needPay ? `כמה משלמים ל${instructor.name}?` : `איפה הייתה הפעילות של ${instructor.name}?`}
      </h2>
      <div className="mt-1 text-[14px] text-ink-2">
        {[framework?.name, a.unitLabel === a.label ? `${a.quantity} ${a.unitLabel}` : [a.label, `${a.quantity} ${a.unitLabel}`].filter(Boolean).join(" · "), dayMonth(a.date)].filter(Boolean).join(" · ")}
      </div>

      {needFw && (
        <div className="mt-5">
          <div className="text-[13px] font-semibold text-ink-2 mb-2">מסגרת</div>
          <div className="flex flex-wrap gap-2">
            {data.frameworks.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFrameworkId(f.id);
                  // Offer the newly chosen framework's stored rate, if it has one
                  const q = quoteActivity({ instructor, framework: f, quantity: a.quantity, travelUnits: a.travelUnits });
                  if (needRev && rev === "" && q.revenue.value !== null) setRev(String(q.revenue.value));
                  if (needPay && pay === "" && q.payment.value !== null) setPay(String(q.payment.value));
                }}
                aria-pressed={frameworkId === f.id}
                className={cn("h-12 px-4 rounded-full text-[15px] font-bold transition-colors", frameworkId === f.id ? "bg-cobalt text-white" : "bg-well")}
              >
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {needRev && (
        <Field
          label="הכנסה מהלקוח"
          value={rev}
          onChange={setRev}
          found={quote?.revenue.value != null ? quote.revenue.source : null}
          gap={quote?.revenueGap ?? null}
        />
      )}
      {needPay && (
        <Field
          label={`תשלום ל${instructor.name}`}
          value={pay}
          onChange={setPay}
          found={quote?.payment.value != null ? quote.payment.source : null}
          gap={quote?.paymentGap ?? null}
        />
      )}

      {(needRev || needPay) && (
        <div className="mt-4 text-[13.5px] text-ink-2 leading-relaxed">
          {canSave && preview !== null ? (
            <>
              רווח {monthName(month)} יעודכן מ־<span className="num">{current === null ? "—" : formatILS(current)}</span> ל־
              <b className="num text-ink">{formatILS(preview)}</b>
            </>
          ) : (
            "הזינו סכום כדי לראות את ההשפעה על הרווח"
          )}
        </div>
      )}

      <PrimaryButton tone="cobalt" className="mt-5" disabled={!canSave} onClick={save}>
        אישור ועדכון
      </PrimaryButton>
      <button type="button" onClick={onClose} className="mt-1 h-11 text-[15px] font-semibold text-ink-2">
        לא עכשיו
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  found,
  gap,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  found: string | null;
  gap: string | null;
}) {
  return (
    <div className="mt-5">
      {found ? (
        <div className="inline-flex items-center gap-2 min-h-8 py-1 ps-2.5 pe-3 rounded-2xl bg-ink text-white text-[13px] font-bold leading-snug">
          <IconCheck strokeWidth={3} className="size-4 shrink-0" />
          נמצא תעריף שמור: {found}
        </div>
      ) : (
        <div className="text-[13px] text-amber-ink leading-snug">{gap ?? "אין תעריף שמור"}. מזינים את הסכום:</div>
      )}
      <div className="mt-2 text-[13px] font-semibold text-ink-2">{label}{found ? " · אפשר לשנות" : ""}</div>
      <div className="mt-1.5">
        <SmallAmount label={label} value={value} onChange={onChange} missing={value === ""} />
      </div>
    </div>
  );
}
