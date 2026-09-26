import { HISTORY, INSTRUCTORS, MONTHS } from "./data";
import type {
  Activity,
  InstructorId,
  InstructorSummary,
  MonthKey,
  MonthTotals,
  Receipt,
  ReceiptStatus,
} from "./types";

export const activityProfit = (a: Activity) => (a.revenue ?? 0) - a.payout;

export function totalsFor(activities: Activity[]): MonthTotals {
  const revenue = activities.reduce((s, a) => s + (a.revenue ?? 0), 0);
  const payout = activities.reduce((s, a) => s + a.payout, 0);
  const profit = revenue - payout;
  return { revenue, payout, profit, margin: revenue ? (profit / revenue) * 100 : 0 };
}

export const inMonth = (activities: Activity[], month: MonthKey) =>
  activities.filter((a) => a.month === month);

export function previousMonth(month: MonthKey): MonthKey | null {
  const idx = MONTHS.findIndex((m) => m.key === month);
  return MONTHS[idx + 1]?.key ?? null;
}

export function pctChange(current: number, prev: number | undefined): number | null {
  if (prev === undefined || prev === 0) return null;
  return ((current - prev) / Math.abs(prev)) * 100;
}

export function receiptStatus(
  receipts: Receipt[],
  month: MonthKey,
  id: InstructorId,
): ReceiptStatus | null {
  return receipts.find((r) => r.month === month && r.instructorId === id)?.status ?? null;
}

export function instructorSummaries(
  activities: Activity[],
  receipts: Receipt[],
  month: MonthKey,
): InstructorSummary[] {
  const monthActs = inMonth(activities, month);
  return INSTRUCTORS.map((instructor) => {
    const acts = monthActs.filter((a) => a.instructorId === instructor.id);
    const t = totalsFor(acts);
    return {
      instructor,
      revenue: t.revenue,
      payout: t.payout,
      profit: t.profit,
      margin: instructor.role === "support" || !t.revenue ? null : t.margin,
      activities: acts.length,
      receipt: receiptStatus(receipts, month, instructor.id) ?? "received",
    };
  }).filter((s) => s.activities > 0);
}

/** Per-month revenue/payout series for the trend chart (history + logged months). */
export function monthlySeries(activities: Activity[]) {
  const logged = [...MONTHS]
    .reverse()
    .map((m) => {
      const t = totalsFor(inMonth(activities, m.key));
      return { month: m.key as string, label: m.short, revenue: t.revenue, payout: t.payout };
    });
  return [...HISTORY, ...logged].map((row) => ({
    ...row,
    profit: row.revenue - row.payout,
  }));
}

export function instructorTrend(activities: Activity[], id: InstructorId) {
  return [...MONTHS].reverse().map((m) => {
    const t = totalsFor(inMonth(activities, m.key).filter((a) => a.instructorId === id));
    return { month: m.key, label: m.short, ...t };
  });
}
