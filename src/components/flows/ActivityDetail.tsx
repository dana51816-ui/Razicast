"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { activityProfit, frameworkOf, instructorOf, monthOf } from "@/lib/calc";
import { formatDayMonth, formatILS, monthName } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Amount } from "@/lib/types";
import { cn } from "../ui/cn";
import { Split } from "../ui/Split";
import { MissingTag } from "../ui/Tags";

/** One activity, fully explained, with everything you can do to it. */
export function ActivityDetail({ activityId, onClose }: { activityId: string; onClose: () => void }) {
  const store = useStore();
  const { data, openFlow } = store;
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const a = data.activities.find((x) => x.id === activityId);

  if (!a) {
    return (
      <div className="p-6">
        <p className="text-[15px]">הפעילות לא קיימת יותר.</p>
        <button type="button" onClick={onClose} className="mt-4 h-12 px-5 rounded-2xl bg-ink text-white font-bold">
          סגירה
        </button>
      </div>
    );
  }

  const i = instructorOf(data, a.instructorId);
  const f = frameworkOf(data, a.frameworkId);
  const p = activityProfit(a);
  const d = formatDayMonth(a.date);
  const incomplete = p === null || !a.frameworkId;

  return (
    <div className="flex flex-col min-h-0 overflow-y-auto px-6 pt-3 pb-4 md:pt-7">
      <div className="flex items-start gap-4">
        <span className="w-14 shrink-0 text-center">
          <b className="num display block text-[52px] leading-[0.85]">{d.day}</b>
          <span className="block text-[12px] text-ink-2 mt-1">
            {d.monthShort} · {d.weekday}
          </span>
        </span>
        <div className="min-w-0 flex-1 pt-1">
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push(`/instructor?id=${a.instructorId}`);
            }}
            className="text-[22px] font-bold leading-tight underline-offset-4 hover:underline"
          >
            {i?.name ?? "מדריך"}
          </button>
          <div className={cn("text-[15px] mt-0.5", f ? "text-ink-2" : "text-amber-ink font-semibold")}>
            {[f?.name ?? "חסרה מסגרת", a.label].filter(Boolean).join(" · ")}
          </div>
          <div className="text-[13px] text-ink-2 mt-0.5">
            <span className="num">{a.quantity}</span> {a.unitLabel}
            {a.travelUnits > 0 && (
              <>
                {" "}· <span className="num">{a.travelUnits}</span> נסיעות
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <Line label="הכנסה מהלקוח" amount={a.revenue} />
        <Line label={`תשלום ל${i?.name ?? "מדריך"}`} amount={a.instructorPayment} />
        <div className="flex items-end justify-between gap-3 pt-3">
          <span className="text-[15px] font-bold">רווח לחברה</span>
          {p === null ? (
            <MissingTag>לא ידוע עד להשלמה</MissingTag>
          ) : (
            <span className={cn("num display text-[52px] leading-[0.85]", p < 0 ? "text-loss-ink" : "text-cobalt")}>
              {p < 0 ? "-" : ""}₪{Math.abs(p).toLocaleString("en-US")}
            </span>
          )}
        </div>
        {p !== null && a.revenue.value !== null && a.instructorPayment.value !== null && (
          <Split revenue={a.revenue.value} payment={a.instructorPayment.value} height={14} className="mt-3" />
        )}
      </div>

      {incomplete && (
        <button
          type="button"
          onClick={() => openFlow({ kind: "resolve", activityId: a.id })}
          className="mt-5 h-[54px] rounded-2xl bg-ink text-white text-[16px] font-bold"
        >
          השלמת המידע החסר
        </button>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => openFlow({ kind: "activity", repeatOf: a.id })}
          className="h-[54px] rounded-2xl bg-cobalt text-white text-[16px] font-bold"
        >
          שוב, היום
        </button>
        <button
          type="button"
          onClick={() => openFlow({ kind: "activity", editId: a.id })}
          className="h-[54px] rounded-2xl border-[1.5px] border-ink text-[16px] font-bold"
        >
          עריכה
        </button>
      </div>

      {confirmDelete ? (
        <div className="mt-3 rounded-2xl bg-loss-wash p-3">
          <p className="text-[14px] font-semibold">
            למחוק את הפעילות? הרווח של {monthName(monthOf(a.date))} יחושב מחדש. אפשר לבטל מיד אחרי.
          </p>
          <div className="mt-2.5 flex gap-2">
            <button
              type="button"
              onClick={() => {
                store.deleteActivity(a.id);
                onClose();
              }}
              className="flex-1 h-11 rounded-xl bg-loss text-white text-[15px] font-bold"
            >
              מחיקה
            </button>
            <button type="button" onClick={() => setConfirmDelete(false)} className="flex-1 h-11 rounded-xl bg-paper text-[15px] font-bold">
              ביטול
            </button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setConfirmDelete(true)} className="mt-2 h-11 text-[14px] font-semibold text-loss-ink">
          מחיקת הפעילות
        </button>
      )}
      {a.origin !== "user" && <p className="mt-1 text-center text-[11.5px] text-ink-3">נתון דמו</p>}
    </div>
  );
}

function Line({ label, amount }: { label: string; amount: Amount }) {
  return (
    <div className="py-3 border-b border-rule">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[15px] font-semibold">{label}</span>
        {amount.value === null ? (
          <span className="text-[15px] font-bold text-amber-ink">חסר</span>
        ) : (
          <span className="num text-[19px] font-bold">{formatILS(amount.value)}</span>
        )}
      </div>
      <div className="text-[12.5px] text-ink-2 mt-0.5">
        {amount.mode === "calculated" ? amount.source : amount.mode === "manual" ? (amount.source === "נתון דמו" ? "נתון דמו" : "הוזן ידנית") : "לא הוזן"}
      </div>
    </div>
  );
}

