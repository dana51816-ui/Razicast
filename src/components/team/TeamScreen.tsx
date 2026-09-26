"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { activitiesIn, FINANCIAL_LABEL, teamMonth, totalsOf, type InstructorMonth } from "@/lib/calc";
import { formatILS, monthLabel, signedILS } from "@/lib/format";
import { useStore } from "@/lib/store";
import { MonthPicker } from "../shell/MonthPicker";
import { cn } from "../ui/cn";
import { Dot } from "../ui/Tags";

export function TeamScreen() {
  const { data, month, openFlow } = useStore();
  const team = teamMonth(data, month);
  const total = totalsOf(activitiesIn(data, month));
  const maxRev = Math.max(1, ...team.map((s) => s.totals.revenue));

  const zones = {
    profit: team.filter((s) => s.financial === "profit"),
    loss: team.filter((s) => s.financial === "loss"),
    missing: team.filter((s) => s.financial === "missing"),
    idle: team.filter((s) => s.financial === "idle"),
  };

  return (
    <>
      <header className="flex items-end justify-between gap-3">
        <div>
          <div className="text-[13px] font-semibold text-ink-2">
            {monthLabel(month)} · <span className="num">{team.length}</span> מדריכים
          </div>
          <h1 className="display text-[64px] leading-[0.85] mt-1">צוות</h1>
        </div>
        <MonthPicker />
      </header>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12 lg:items-start">
        {/* ── The map: where each person stands; size = revenue ── */}
        <section aria-label="מפת רווחיות" className="mt-6">
          <Zone title="רווחי" why="ההכנסה גבוהה מהתשלום">
            {zones.profit.length ? (
              <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
                {zones.profit.map((s, i) => (
                  <Disc key={s.instructor.id} s={s} maxRev={maxRev} i={i} />
                ))}
              </div>
            ) : (
              <Empty />
            )}
          </Zone>
          <div className="grid grid-cols-2 border-t border-dashed border-stone-3">
            <Zone title="הפסדי" why="שולם יותר ממה שנכנס" side>
              {zones.loss.length ? (
                <div className="flex flex-wrap gap-3">
                  {zones.loss.map((s, i) => (
                    <Disc key={s.instructor.id} s={s} maxRev={maxRev} i={i + 4} />
                  ))}
                </div>
              ) : (
                <Empty />
              )}
            </Zone>
            <Zone title="מידע חסר" why="אי אפשר לחשב רווח">
              {zones.missing.length ? (
                <div className="flex flex-wrap gap-3">
                  {zones.missing.map((s, i) => (
                    <Disc key={s.instructor.id} s={s} maxRev={maxRev} i={i + 6} />
                  ))}
                </div>
              ) : (
                <Empty />
              )}
            </Zone>
          </div>
          {zones.idle.length > 0 && (
            <div className="border-t border-dashed border-stone-3 px-2 py-3 flex flex-wrap items-center gap-2 text-[13px] text-ink-2">
              <span className="font-semibold">בלי פעילות החודש:</span>
              {zones.idle.map((s) => (
                <Link key={s.instructor.id} href={`/instructor?id=${s.instructor.id}`} className="h-8 px-3 rounded-full bg-stone-2 grid place-items-center font-semibold text-ink">
                  {s.instructor.name}
                </Link>
              ))}
            </div>
          )}
          <div className="mt-2 px-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-2">
            <span>גודל העיגול = הכנסה</span>
            <span className="inline-flex items-center gap-1.5">
              <Dot tone="receipt" /> קבלה חסרה
            </span>
          </div>
        </section>

        {/* ── The roster: control ── */}
        <section aria-label="כל הצוות" className="mt-8 lg:mt-6">
          <div className="grid grid-cols-3 gap-2 px-1 pb-2 text-[12px] font-semibold text-ink-2 border-b-[1.5px] border-ink">
            <span>הכנסה</span>
            <span>תשלום</span>
            <span className="text-left">רווח</span>
          </div>
          {team.map((s) => (
            <RosterRow key={s.instructor.id} s={s} />
          ))}
          <div className="pt-3 px-1 text-[13px] font-bold">סה״כ {monthLabel(month)}</div>
          <div className="grid grid-cols-3 gap-2 items-center min-h-[36px] px-1 text-[15px] font-bold">
            <span className="num">{formatILS(total.revenue)}</span>
            <span className="num">{formatILS(total.payment)}</span>
            <span className={cn("num text-left", (total.profit ?? 0) < 0 ? "text-loss-ink" : "text-cobalt")}>
              {total.profit === null ? "—" : signedILS(total.profit)}
            </span>
          </div>
          {total.incomplete.count > 0 && (
            <p className="px-1 text-[12.5px] text-ink-2 leading-snug">
              הרווח לא כולל {total.incomplete.count === 1 ? "פעילות אחת" : `${total.incomplete.count} פעילויות`} עם מידע חסר.
            </p>
          )}
          <button
            type="button"
            onClick={() => openFlow({ kind: "instructor" })}
            className="mt-5 w-full h-14 rounded-[18px] border-[1.5px] border-dashed border-ink text-[16px] font-bold"
          >
            + מדריך חדש
          </button>
        </section>
      </div>
    </>
  );
}

function Zone({ title, why, children, side }: { title: string; why: string; children: React.ReactNode; side?: boolean }) {
  return (
    <div className={cn("px-2 pt-4 pb-5", side && "border-l border-dashed border-stone-3")}>
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-[15px] font-bold">{title}</span>
        <span className="text-[12px] text-ink-2">{why}</span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

const Empty = () => <div className="h-12 grid place-items-start content-center text-[13px] text-ink-3">אין</div>;

function Disc({ s, maxRev, i }: { s: InstructorMonth; maxRev: number; i: number }) {
  const size = s.financial === "missing" ? 56 : Math.round(46 + 42 * Math.sqrt(s.totals.revenue / maxRev));
  return (
    <motion.div initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 * i, type: "spring", stiffness: 380, damping: 20 }}>
      <Link href={`/instructor?id=${s.instructor.id}`} className="flex flex-col items-center gap-1.5" aria-label={`${s.instructor.name}, ${FINANCIAL_LABEL[s.financial]}`}>
        <span
          className={cn(
            "relative rounded-full grid place-items-center text-[14px] font-bold px-1 text-center leading-tight",
            s.financial === "profit" && "bg-cobalt text-white",
            s.financial === "loss" && "bg-loss text-white",
            s.financial === "missing" && "border-2 border-dashed border-amber",
          )}
          style={{ width: size, height: size }}
        >
          {s.instructor.name}
          {s.receipt === "missing" && (
            <span title="קבלה חסרה" className="absolute -top-0.5 -left-0.5 size-4 rounded-full bg-amber-dot border-[3px] border-stone" />
          )}
        </span>
        <span className={cn("num text-[13px] font-bold", s.financial === "loss" && "text-loss-ink", s.financial === "missing" && "text-amber-ink")}>
          {s.totals.profit === null ? "רווח לא ידוע" : signedILS(s.totals.profit)}
        </span>
      </Link>
    </motion.div>
  );
}

function RosterRow({ s }: { s: InstructorMonth }) {
  const revMissing = s.activities.some((a) => a.revenue.value === null);
  const payMissing = s.activities.some((a) => a.instructorPayment.value === null);
  const tone = s.financial === "profit" ? "profit" : s.financial === "loss" ? "loss" : s.financial === "missing" ? "missing" : "idle";
  const idle = s.activities.length === 0;
  return (
    <Link href={`/instructor?id=${s.instructor.id}`} className="block py-3 px-1 border-b border-rule hover:bg-stone-2/50 transition-colors">
      <span className="block text-[17px] font-bold">{s.instructor.name}</span>
      <span className="mt-1 grid grid-cols-3 gap-2 items-baseline">
        <span className={cn("num text-[15px]", revMissing && "text-amber-ink")}>
          {idle ? "—" : revMissing && s.totals.revenue === 0 ? "₪?" : formatILS(s.totals.revenue)}
          {revMissing && s.totals.revenue > 0 ? "+?" : ""}
        </span>
        <span className={cn("num text-[15px]", payMissing && "text-amber-ink")}>
          {idle ? "—" : payMissing && s.totals.payment === 0 ? "₪?" : formatILS(s.totals.payment)}
        </span>
        <span
          className={cn(
            "num text-left text-[16px] font-bold",
            s.financial === "loss" && "text-loss-ink",
            s.financial === "missing" && "text-amber-ink",
          )}
        >
          {s.totals.profit === null ? "—" : signedILS(s.totals.profit)}
        </span>
      </span>
      <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] font-semibold">
        <span
          className={cn(
            "inline-flex items-center gap-1.5",
            s.financial === "profit" && "text-cobalt",
            s.financial === "loss" && "text-loss-ink",
            s.financial === "missing" && "text-amber-ink",
            s.financial === "idle" && "text-ink-2",
          )}
        >
          <Dot tone={tone} className="size-[7px]" />
          {FINANCIAL_LABEL[s.financial]}
        </span>
        {s.flags.map((f) => (
          <span key={f.kind} className={cn("inline-flex items-center gap-1.5", f.kind === "receiptMissing" ? "text-amber-ink" : "text-ink-2")}>
            {f.kind === "receiptMissing" && <Dot tone="receipt" className="size-[7px]" />}
            {f.label}
          </span>
        ))}
      </span>
    </Link>
  );
}
