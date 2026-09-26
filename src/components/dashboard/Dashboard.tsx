"use client";

import { useMemo } from "react";
import { monthLabel } from "@/lib/data";
import { formatILS, formatPct } from "@/lib/format";
import {
  inMonth,
  instructorSummaries,
  monthlySeries,
  pctChange,
  previousMonth,
  totalsFor,
} from "@/lib/selectors";
import { useStore } from "@/lib/store";
import { BrandMark } from "../shell/Brand";
import { DemoBadge } from "../ui/DemoBadge";
import { Delta } from "../ui/Delta";
import { MonthSelector } from "../ui/MonthSelector";
import { PageHeader } from "../ui/PageHeader";
import { AttentionList } from "./AttentionList";
import { FlowBar } from "./FlowBar";
import { InstructorRanking } from "./InstructorRanking";
import { KpiCard } from "./KpiCard";
import { RevenueChart } from "./RevenueChart";

const fmtPct = (n: number) => formatPct(n);

export function Dashboard() {
  const { activities, receipts, month, loading } = useStore();

  const { totals, prev, summaries, series } = useMemo(() => {
    const p = previousMonth(month);
    return {
      totals: totalsFor(inMonth(activities, month)),
      prev: p ? totalsFor(inMonth(activities, p)) : undefined,
      summaries: instructorSummaries(activities, receipts, month),
      series: monthlySeries(activities),
    };
  }, [activities, receipts, month]);

  const marginDiff =
    totals.margin !== null && prev?.margin != null ? totals.margin - prev.margin : null;
  const pendingNote =
    totals.pendingCount > 0 ? (
      <span className="text-[11.5px] text-warn leading-snug">
        לא כולל <span className="num">{formatILS(totals.pendingPayout)}</span> ללא הכנסה
      </span>
    ) : null;

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-2.5">
            <BrandMark className="size-8 lg:hidden" />
            <span className="latin-caps inline-block text-[15px] sm:text-[19px] md:text-[24px] tracking-[0.14em] font-semibold">
              Razicast <span className="text-fg-3">Control</span>
            </span>
          </span>
        }
        subtitle={
          <span className="inline-flex items-center gap-2">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 rounded-full bg-signal animate-ping opacity-60" />
              <span className="relative size-1.5 rounded-full bg-signal" />
            </span>
            תמונת מצב עסקית בזמן אמת
            <span className="text-fg-4">·</span>
            <span className="text-fg-2">{monthLabel(month)}</span>
            <DemoBadge />
          </span>
        }
        actions={<MonthSelector />}
      />

      <section aria-label="מדדים עיקריים" className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3">
        <KpiCard
          index={0}
          label="הכנסות"
          value={totals.revenue}
          format={formatILS}
          loading={loading}
          footer={<Delta value={pctChange(totals.revenue, prev?.revenue)} />}
        />
        <KpiCard
          index={1}
          label="תשלומים למדריכים"
          value={totals.payout}
          format={formatILS}
          loading={loading}
          footer={<Delta value={pctChange(totals.payout, prev?.payout)} invert />}
        />
        <KpiCard
          index={2}
          label="רווח לחברה"
          value={totals.profit}
          format={formatILS}
          loading={loading}
          emphasis
          footer={
            <>
              <Delta value={pctChange(totals.profit, prev?.profit)} />
              {pendingNote}
            </>
          }
        />
        <KpiCard
          index={3}
          label="רווחיות"
          value={totals.margin}
          format={fmtPct}
          loading={loading}
          footer={
            <>
              <Delta
                value={marginDiff}
                unit={marginDiff !== null ? `${marginDiff >= 0 ? "+" : "-"}${Math.abs(marginDiff).toFixed(1)}` : undefined}
                suffix="נק׳ אחוז"
              />
              {pendingNote}
            </>
          }
        />
      </section>

      <div className="mt-2.5 md:mt-3">
        <FlowBar totals={totals} loading={loading} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-12 lg:gap-5">
        <div className="min-w-0 lg:col-span-5 lg:order-2">
          <AttentionList loading={loading} />
        </div>
        <div className="min-w-0 lg:col-span-7 lg:order-1">
          <InstructorRanking summaries={summaries} loading={loading} />
        </div>
      </div>

      <div className="mt-4 lg:mt-5">
        <RevenueChart data={series} selected={month} loading={loading} />
      </div>
    </>
  );
}
