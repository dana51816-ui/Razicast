"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactILS, formatILS } from "@/lib/format";
import type { MonthKey } from "@/lib/types";
import { Card, SectionTitle } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";

const REV = "#7aa326";
const PAY = "#6384da";

interface Row {
  month: string;
  label: string;
  revenue: number;
  payout: number;
  profit: number | null;
  margin: number | null;
  pendingCount: number;
  pendingPayout: number;
}

export function RevenueChart({
  data,
  selected,
  loading,
}: {
  data: Row[];
  selected: MonthKey;
  loading?: boolean;
}) {
  const current = data.find((d) => d.month === selected);

  return (
    <Card className="p-4 md:p-5">
      <SectionTitle
        title="הכנסות מול תשלומים למדריכים"
        hint="6 חודשים אחרונים"
        action={
          <div className="flex items-center gap-4 text-[12px] text-fg-3">
            <LegendItem color={REV} label="הכנסות" value={current?.revenue} />
            <LegendItem color={PAY} label="תשלומים" value={current?.payout} />
          </div>
        }
      />
      <div className="h-[220px] md:h-[260px] -mx-1" dir="ltr">
        {loading ? (
          <Skeleton className="h-full w-full rounded-xl" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={2} barCategoryGap="28%" margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="label"
                reversed
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#7d838e", fontSize: 12, fontFamily: "var(--font-heebo)" }}
                dy={6}
              />
              <YAxis
                orientation="right"
                tickLine={false}
                axisLine={false}
                width={44}
                tickCount={4}
                tick={{ fill: "#555b66", fontSize: 11 }}
                tickFormatter={(v: number) => formatCompactILS(v)}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.035)", radius: 8 }}
                content={<ChartTooltip />}
                animationDuration={120}
              />
              <Bar dataKey="revenue" name="הכנסות" radius={[4, 4, 0, 0]} maxBarSize={26} animationDuration={900}>
                {data.map((d) => (
                  <Cell key={d.month} fill={REV} fillOpacity={d.month === selected ? 1 : 0.42} />
                ))}
              </Bar>
              <Bar dataKey="payout" name="תשלומים" radius={[4, 4, 0, 0]} maxBarSize={26} animationDuration={900}>
                {data.map((d) => (
                  <Cell key={d.month} fill={PAY} fillOpacity={d.month === selected ? 1 : 0.42} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

function LegendItem({ color, label, value }: { color: string; label: string; value?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="size-2 rounded-[3px]" style={{ background: color }} />
      <span>{label}</span>
      {value !== undefined && <span className="num text-fg-2 hidden sm:inline">{formatILS(value)}</span>}
    </span>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: { payload: Row }[];
}

function ChartTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div dir="rtl" className="surface-raised rounded-xl px-3.5 py-3 min-w-[170px] text-[12.5px]">
      <div className="text-fg font-semibold mb-2">{row.label}</div>
      <Line color={REV} label="הכנסות" value={row.revenue} />
      <Line color={PAY} label="תשלומים" value={row.payout} />
      <div className="mt-2 pt-2 border-t hairline flex justify-between gap-4">
        <span className="text-fg-3">רווח</span>
        {row.profit === null ? (
          <span className="text-warn">מידע חסר</span>
        ) : (
          <span className="num text-fg font-medium">
            {formatILS(row.profit)}
            {row.margin !== null && <span className="text-fg-3"> · {row.margin.toFixed(1)}%</span>}
          </span>
        )}
      </div>
      {row.pendingCount > 0 && (
        <div className="mt-1.5 text-[11.5px] text-warn max-w-[190px] leading-snug">
          לא כולל תשלום <span className="num">{formatILS(row.pendingPayout)}</span> בפעילות ללא הכנסה
        </div>
      )}
    </div>
  );
}

function Line({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex justify-between gap-4 py-0.5">
      <span className="inline-flex items-center gap-1.5 text-fg-3">
        <span className="size-2 rounded-[3px]" style={{ background: color }} />
        {label}
      </span>
      <span className="num text-fg">{formatILS(value)}</span>
    </div>
  );
}
