"use client";

import { motion } from "framer-motion";
import { BellRing, Check, FileCheck2, ReceiptText } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { instructorById, monthLabel, monthName } from "@/lib/data";
import { formatDayMonth } from "@/lib/format";
import { inMonth } from "@/lib/selectors";
import { useStore } from "@/lib/store";
import type { Receipt, ReceiptStatus } from "@/lib/types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { cn } from "../ui/cn";
import { EmptyState } from "../ui/EmptyState";
import { InstructorAvatar } from "../ui/InstructorAvatar";
import { Money } from "../ui/Money";
import { MonthSelector } from "../ui/MonthSelector";
import { PageHeader } from "../ui/PageHeader";
import { Skeleton } from "../ui/Skeleton";
import { ReceiptPill } from "../ui/StatusPill";
import { ReminderModal, type ReminderTarget } from "./ReminderModal";

type Filter = "all" | ReceiptStatus;

export function ReceiptsScreen() {
  const { receipts, activities, month, loading, setReceiptStatus, notify } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [target, setTarget] = useState<ReminderTarget | null>(null);
  const params = useSearchParams();
  const router = useRouter();

  const amountFor = useMemo(() => {
    return (r: Receipt) =>
      inMonth(activities, r.month)
        .filter((a) => a.instructorId === r.instructorId)
        .reduce((s, a) => s + a.payout, 0);
  }, [activities]);

  const monthReceipts = receipts.filter((r) => r.month === month);
  const counts = {
    all: monthReceipts.length,
    received: monthReceipts.filter((r) => r.status === "received").length,
    missing: monthReceipts.filter((r) => r.status === "missing").length,
    review: monthReceipts.filter((r) => r.status === "review").length,
  };
  const missingAmount = monthReceipts
    .filter((r) => r.status === "missing")
    .reduce((s, r) => s + amountFor(r), 0);
  const order: Record<ReceiptStatus, number> = { missing: 0, review: 1, received: 2 };
  const list = monthReceipts
    .filter((r) => filter === "all" || r.status === filter)
    .sort((a, b) => order[a.status] - order[b.status] || amountFor(b) - amountFor(a));
  const olderOpen = receipts.filter((r) => r.month !== month && r.status !== "received");

  // Deep link from instructor drawer: /receipts?remind=tzah
  useEffect(() => {
    const id = params.get("remind");
    if (!id) return;
    const r = receipts.find((x) => x.month === month && x.instructorId === id && x.status === "missing");
    if (r) setTarget({ instructorId: r.instructorId, month: r.month, amount: amountFor(r) });
    router.replace("/receipts", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const markReceived = (r: Receipt) => {
    setReceiptStatus(r.id, "received");
    notify(`הקבלה של ${instructorById(r.instructorId).name} סומנה כהתקבלה`);
  };

  const pctReceived = counts.all ? (counts.received / counts.all) * 100 : 0;

  return (
    <>
      <PageHeader title="קבלות" subtitle={`מעקב קבלות מהמדריכים · ${monthLabel(month)}`} actions={<MonthSelector />} />

      <Card className="p-4 md:p-5">
        <div className="grid grid-cols-3 [&>*+*]:border-s [&>*+*]:border-white/[0.06]">
          <SummaryStat label="מדריכים" value={counts.all} />
          <SummaryStat label="קבלות התקבלו" value={counts.received} tone="pos" />
          <SummaryStat label="קבלות חסרות" value={counts.missing} tone={counts.missing ? "warn" : undefined} />
        </div>
        <div className="mt-4 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-pos"
            initial={{ width: 0 }}
            animate={{ width: `${pctReceived}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[12px] text-fg-3">
          <span>
            <span className="num text-fg-2">{Math.round(pctReceived)}%</span> מהקבלות התקבלו
          </span>
          {missingAmount > 0 && (
            <span>
              ממתין לקבלות: <Money value={missingAmount} className="text-warn font-medium" />
            </span>
          )}
        </div>
      </Card>

      <div role="tablist" aria-label="סינון לפי סטטוס" className="mt-5 mb-3 flex gap-1 p-1 rounded-2xl bg-white/[0.03] ring-1 ring-inset ring-white/[0.05] w-full sm:w-fit">
        {(
          [
            ["all", "הכול"],
            ["missing", "חסרה"],
            ["review", "בבדיקה"],
            ["received", "התקבלה"],
          ] as [Filter, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={filter === key}
            onClick={() => setFilter(key)}
            className={cn(
              "relative flex-1 sm:flex-none h-9 px-3.5 rounded-xl text-[13px] font-medium transition-colors",
              filter === key ? "text-fg" : "text-fg-3 hover:text-fg-2",
            )}
          >
            {filter === key && (
              <motion.span
                layoutId="receipt-filter"
                className="absolute inset-0 rounded-xl bg-white/[0.08] ring-1 ring-inset ring-white/[0.08]"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative">
              {label} <span className="num text-fg-3 text-[12px]">{counts[key]}</span>
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[76px] rounded-[var(--radius-card)]" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={filter === "missing" ? FileCheck2 : ReceiptText}
          title={filter === "missing" ? "אין קבלות חסרות" : "אין קבלות בסטטוס הזה"}
          body={filter === "missing" ? `כל הקבלות של ${monthName(month)} התקבלו. עבודה טובה.` : undefined}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((r, i) => (
            <ReceiptRow
              key={r.id}
              receipt={r}
              amount={amountFor(r)}
              index={i}
              onRemind={() => setTarget({ instructorId: r.instructorId, month: r.month, amount: amountFor(r) })}
              onReceived={() => markReceived(r)}
            />
          ))}
        </ul>
      )}

      {!loading && olderOpen.length > 0 && (
        <section className="mt-8">
          <h2 className="text-[13px] font-medium text-fg-3 mb-2.5">פתוחות מחודשים אחרים</h2>
          <ul className="flex flex-col gap-2">
            {olderOpen.map((r, i) => (
              <ReceiptRow
                key={r.id}
                receipt={r}
                amount={amountFor(r)}
                index={i}
                showMonth
                onRemind={() => setTarget({ instructorId: r.instructorId, month: r.month, amount: amountFor(r) })}
                onReceived={() => markReceived(r)}
              />
            ))}
          </ul>
        </section>
      )}

      <ReminderModal target={target} onClose={() => setTarget(null)} />
    </>
  );
}

function SummaryStat({ label, value, tone }: { label: string; value: number; tone?: "pos" | "warn" }) {
  return (
    <div className="px-2 text-center sm:text-start sm:px-5 sm:first:ps-0">
      <div
        className={cn(
          "num text-[30px] md:text-[34px] font-semibold leading-none tracking-tight",
          tone === "pos" && "text-pos",
          tone === "warn" && "text-warn",
        )}
      >
        {value}
      </div>
      <div className="text-[12.5px] text-fg-3 mt-2">{label}</div>
    </div>
  );
}

function ReceiptRow({
  receipt: r,
  amount,
  index,
  showMonth,
  onRemind,
  onReceived,
}: {
  receipt: Receipt;
  amount: number;
  index: number;
  showMonth?: boolean;
  onRemind: () => void;
  onReceived: () => void;
}) {
  const inst = instructorById(r.instructorId);
  const received = r.receivedAt ? formatDayMonth(r.receivedAt) : null;
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.035, duration: 0.3 }}
      className={cn(
        "rounded-[var(--radius-card)] p-3.5 md:p-4 flex flex-col sm:flex-row sm:items-center gap-3",
        r.status === "missing" ? "bg-warn/[0.04] ring-1 ring-inset ring-warn/15" : "surface",
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <InstructorAvatar id={r.instructorId} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-semibold">{inst.name}</span>
            <ReceiptPill status={r.status} />
          </div>
          <div className="text-[12.5px] text-fg-3 mt-1">
            {showMonth ? monthLabel(r.month) : monthName(r.month)}
            {received && r.status !== "missing" && (
              <>
                {" "}· {r.status === "review" ? "הועלתה" : "התקבלה"} ב־<span className="num">{received.day}</span> ב{received.monthShort}
              </>
            )}
          </div>
        </div>
        <Money value={amount} className="text-[17px] font-semibold tracking-tight" />
      </div>

      {r.status !== "received" && (
        <div className="flex gap-2 sm:ms-2 ps-12 sm:ps-0">
          {r.status === "missing" ? (
            <>
              <Button variant="primary" size="sm" onClick={onRemind} className="flex-1 sm:flex-none h-9">
                <BellRing className="size-4" />
                יצירת תזכורת
              </Button>
              <Button variant="secondary" size="sm" onClick={onReceived} className="flex-1 sm:flex-none h-9">
                <Check className="size-4" />
                התקבלה
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={onReceived} className="flex-1 sm:flex-none h-9">
              <Check className="size-4" />
              אישור קבלה
            </Button>
          )}
        </div>
      )}
    </motion.li>
  );
}
