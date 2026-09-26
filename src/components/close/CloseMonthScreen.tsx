"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, ChevronLeft, Lock, PartyPopper } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { monthLabel, monthName } from "@/lib/data";
import { formatILS, formatPct } from "@/lib/format";
import { inMonth, totalsFor } from "@/lib/selectors";
import { useStore } from "@/lib/store";
import { useAttention } from "../shell/useAttention";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { cn } from "../ui/cn";
import { MonthSelector } from "../ui/MonthSelector";
import { PageHeader } from "../ui/PageHeader";
import { Sheet } from "../ui/Sheet";
import { Skeleton } from "../ui/Skeleton";
import { ProgressRing } from "./ProgressRing";

interface Step {
  key: string;
  ok: boolean;
  label: string;
  hint?: string;
  href?: string;
}

const fmtPct = (n: number) => formatPct(n);

export function CloseMonthScreen() {
  const { activities, month, closedMonths, closeMonth, loading, notify } = useStore();
  const { missingReceipts, negative } = useAttention();
  const [confirming, setConfirming] = useState(false);
  const closed = closedMonths.includes(month);
  const totals = useMemo(() => totalsFor(inMonth(activities, month)), [activities, month]);

  const steps: Step[] = [
    { key: "entered", ok: true, label: "כל הפעילויות הוזנו", hint: `${inMonth(activities, month).length} פעילויות ביומן` },
    { key: "revenue", ok: true, label: "סכומי ההכנסות נבדקו" },
    {
      key: "receipts",
      ok: missingReceipts.length === 0,
      label: missingReceipts.length === 0 ? "כל הקבלות התקבלו" : `${missingReceipts.length} קבלות עדיין חסרות`,
      hint: missingReceipts.length ? "אפשר לסגור ולהשלים בהמשך" : undefined,
      href: "/receipts",
    },
    { key: "payouts", ok: true, label: "תשלומי המדריכים חושבו" },
    {
      key: "margin",
      ok: negative.length === 0,
      label:
        negative.length === 0
          ? "אין חריגות רווחיות"
          : negative.length === 1
            ? "קיימת חריגת רווחיות אצל מדריך אחד"
            : `קיימות חריגות רווחיות אצל ${negative.length} מדריכים`,
      hint: negative.length ? negative.map((n) => `${n.instructor.name} ${formatILS(n.profit)}`).join(", ") : undefined,
      href: negative.length === 1 ? `/instructors?i=${negative[0].instructor.id}` : "/instructors",
    },
  ];
  const doneCount = steps.filter((s) => s.ok).length;
  const openCount = steps.length - doneCount;
  const progress = closed ? 100 : (doneCount / steps.length) * 100;

  const doClose = () => {
    closeMonth(month);
    setConfirming(false);
    notify(`${monthName(month)} נסגר בהצלחה`);
  };

  return (
    <>
      <PageHeader
        eyebrow={<span className="text-[12px] font-medium text-fg-3">סגירת חודש</span>}
        title={closed ? `${monthName(month)} סגור` : `סוגרים את ${monthName(month)}`}
        subtitle={closed ? "החודש נסגר. הנתונים נשמרו לתמונת המצב ההיסטורית." : "תהליך מודרך לסגירה הפיננסית של החודש"}
        actions={<MonthSelector />}
      />

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Card className="p-4 md:p-5">
            <div className="flex items-center gap-4">
              <ProgressRing value={progress} done={closed} />
              <div>
                <div className="text-[16px] font-semibold">
                  {closed ? "הסגירה הושלמה" : openCount === 0 ? "מוכנים לסגירה" : `${doneCount} מתוך ${steps.length} שלבים הושלמו`}
                </div>
                <div className="text-[13px] text-fg-3 mt-1 leading-relaxed">
                  {closed
                    ? `${monthLabel(month)} נסגר ונשמר.`
                    : openCount === 0
                      ? "כל הבדיקות עברו בהצלחה."
                      : `${openCount} נושאים דורשים תשומת לב לפני הסגירה`}
                </div>
              </div>
            </div>

            <ol className="mt-5 flex flex-col">
              {steps.map((s, i) => {
                const ok = closed || s.ok;
                const Row = (
                  <div className="flex items-center gap-3 py-3">
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.08 * i, type: "spring", stiffness: 500, damping: 25 }}
                      className={cn(
                        "size-8 shrink-0 rounded-full grid place-items-center ring-1 ring-inset",
                        ok ? "bg-pos/10 ring-pos/25 text-pos" : "bg-warn/10 ring-warn/30 text-warn",
                      )}
                    >
                      {ok ? <Check className="size-4" strokeWidth={2.6} /> : <AlertTriangle className="size-4" strokeWidth={2.2} />}
                    </motion.span>
                    <div className="flex-1 min-w-0">
                      <div className={cn("text-[14.5px]", ok ? "text-fg-2" : "text-fg font-semibold")}>{s.label}</div>
                      {s.hint && !ok && <div className="text-[12.5px] text-fg-3 mt-0.5 truncate">{s.hint}</div>}
                    </div>
                    {!ok && s.href && (
                      <span className="text-[12.5px] text-fg-3 group-hover:text-fg inline-flex items-center gap-0.5 transition-colors">
                        לטיפול <ChevronLeft className="size-4" />
                      </span>
                    )}
                  </div>
                );
                return (
                  <li key={s.key} className="relative border-t hairline first:border-t-0">
                    {!ok && s.href ? (
                      <Link href={s.href} className="group block -mx-2 px-2 rounded-xl hover:bg-white/[0.03] transition-colors">
                        {Row}
                      </Link>
                    ) : (
                      Row
                    )}
                  </li>
                );
              })}
            </ol>
          </Card>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4">
          <Card className="p-4 md:p-5">
            <h2 className="text-[15px] font-semibold mb-4">סיכום פיננסי</h2>
            {loading ? (
              <div className="flex flex-col gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
            ) : (
              <dl className="flex flex-col gap-3.5 text-[14px]">
                <SummaryLine label="הכנסות" value={totals.revenue} format={formatILS} />
                <SummaryLine label="תשלומי מדריכים" value={-totals.payout} format={formatILS} muted />
                <div className="h-px bg-white/[0.08]" />
                <SummaryLine label="רווח" value={totals.profit} format={formatILS} strong />
                <SummaryLine label="רווחיות" value={totals.margin} format={fmtPct} />
              </dl>
            )}
          </Card>

          <div>
            <AnimatePresence mode="wait">
              {closed ? (
                <motion.div
                  key="closed"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl p-4 flex items-center gap-3 bg-pos/[0.08] ring-1 ring-inset ring-pos/20 glass"
                >
                  <span className="size-10 rounded-xl bg-pos/15 grid place-items-center text-pos">
                    <Lock className="size-[18px]" />
                  </span>
                  <div>
                    <div className="text-[14.5px] font-semibold">{monthName(month)} נסגר</div>
                    <div className="text-[12.5px] text-fg-3">הדוח הסופי זמין בתמונת המצב</div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Button variant="primary" size="lg" className="w-full h-14 text-[16px]" onClick={() => setConfirming(true)}>
                    <Lock className="size-[18px]" />
                    סגירת חודש
                  </Button>
                  {openCount > 0 && (
                    <p className="text-center text-[12px] text-fg-3 mt-2">
                      אפשר לסגור עם {openCount} נושאים פתוחים — הם יועברו למעקב
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Sheet
        open={confirming}
        onClose={() => setConfirming(false)}
        title={`לסגור את ${monthLabel(month)}?`}
        subtitle="הסגירה תקבע את הנתונים של החודש לתמונת המצב"
        footer={
          <div className="flex gap-2">
            <Button variant="primary" size="lg" className="flex-1" onClick={doClose}>
              <PartyPopper className="size-[18px]" />
              כן, לסגור את החודש
            </Button>
            <Button size="lg" onClick={() => setConfirming(false)}>
              ביטול
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <MiniStat label="רווח" value={formatILS(totals.profit)} />
            <MiniStat label="רווחיות" value={formatPct(totals.margin)} />
          </div>
          {openCount > 0 && (
            <div className="rounded-2xl p-3.5 bg-warn/[0.07] ring-1 ring-inset ring-warn/20 text-[13px]">
              <div className="font-semibold text-warn mb-1.5">נושאים פתוחים</div>
              <ul className="flex flex-col gap-1 text-fg-2">
                {steps
                  .filter((s) => !s.ok)
                  .map((s) => (
                    <li key={s.key}>· {s.label}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </Sheet>
    </>
  );
}

function SummaryLine({
  label,
  value,
  format,
  strong,
  muted,
}: {
  label: string;
  value: number;
  format: (n: number) => string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={cn(strong ? "text-fg font-semibold" : "text-fg-3")}>{label}</dt>
      <dd>
        <AnimatedNumber
          value={value}
          format={format}
          className={cn(
            strong ? "text-[24px] font-semibold text-signal tracking-tight" : "text-[16px]",
            muted ? "text-fg-2" : !strong && "text-fg",
          )}
        />
      </dd>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl p-3.5 bg-white/[0.03] ring-1 ring-inset ring-white/[0.06]">
      <div className="text-[12px] text-fg-3">{label}</div>
      <div className="num text-[19px] font-semibold mt-1">{value}</div>
    </div>
  );
}
