"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatILS } from "@/lib/format";

const REV = "#7aa326";
const PAY = "#6384da";

interface Row {
  label: string;
  revenue: number;
  payout: number;
  profit: number;
}

export function TrendChart({ data }: { data: Row[] }) {
  return (
    <div>
      <div className="h-[132px]" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2} barCategoryGap="30%" margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="label"
              reversed
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,.08)" }}
              tick={{ fill: "#7d838e", fontSize: 12 }}
              dy={4}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.035)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const r = payload[0].payload as Row;
                return (
                  <div dir="rtl" className="surface-raised rounded-lg px-3 py-2 text-[12px]">
                    <div className="font-semibold mb-1">{r.label}</div>
                    <div className="text-fg-3">הכנסה <span className="num text-fg">{formatILS(r.revenue)}</span></div>
                    <div className="text-fg-3">תשלום <span className="num text-fg">{formatILS(r.payout)}</span></div>
                  </div>
                );
              }}
            />
            <Bar dataKey="revenue" fill={REV} radius={[4, 4, 0, 0]} maxBarSize={22} animationDuration={800} />
            <Bar dataKey="payout" fill={PAY} radius={[4, 4, 0, 0]} maxBarSize={22} animationDuration={800} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 mt-2 text-center">
        {[...data].map((r) => (
          <div key={r.label}>
            <div className="text-[11px] text-fg-3">רווח</div>
            <div className={`num text-[13px] font-medium ${r.profit < 0 ? "text-neg" : "text-fg"}`}>
              {formatILS(r.profit)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
