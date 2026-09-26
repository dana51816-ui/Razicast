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

export const hasRevenue = (a: Activity) => a.revenue !== null;
export const isIncomplete = (a: Activity) => !!a.missing || a.revenue === null || a.client === null;

/** null when revenue is missing — an unknown profit, never a loss. */
export const activityProfit = (a: Activity): number | null =>
  a.revenue === null ? null : a.revenue - a.payout;

export function totalsFor(activities: Activity[]): MonthTotals {
  const confirmed = activities.filter(hasRevenue);
  const pending = activities.filter((a) => !hasRevenue(a));
  const revenue = confirmed.reduce((s, a) => s + (a.revenue as number), 0);
  const payout = activities.reduce((s, a) => s + a.payout, 0);
  const confirmedPayout = confirmed.reduce((s, a) => s + a.payout, 0);
  const pendingPayout = pending.reduce((s, a) => s + a.payout, 0);

  const hasBasis = confirmed.length > 0;
  const profit = hasBasis ? revenue - confirmedPayout : null;
  const margin = hasBasis && revenue > 0 ? ((profit as number) / revenue) * 100 : null;

  return {
    revenue,
    payout,
    confirmedPayout,
    profit,
    margin,
    pendingCount: pending.length,
    pendingPayout,
    state: profit === null ? "missing" : profit < 0 ? "loss" : "profit",
  };
}

export const inMonth = (activities: Activity[], month: MonthKey) =>
  activities.filter((a) => a.month === month);

export function previousMonth(month: MonthKey): MonthKey | null {
  const idx = MONTHS.findIndex((m) => m.key === month);
  return MONTHS[idx + 1]?.key ?? null;
}

export function pctChange(current: number | null, prev: number | null | undefined): number | null {
  if (current === null || prev === undefined || prev === null || prev === 0) return null;
  return ((current - prev) / Math.abs(prev)) * 100;
}

export function receiptStatus(
  receipts: Receipt[],
  month: MonthKey,
  id: InstructorId,
): ReceiptStatus | null {
  return receipts.find((r) => r.month === month && r.instructorId === id)?.status ?? null;
}

const STATE_ORDER = { profit: 0, loss: 1, missing: 2 } as const;

/** Profit first (desc), then real losses, then instructors with no conclusion possible. */
export function byProfit(a: InstructorSummary, b: InstructorSummary) {
  return STATE_ORDER[a.state] - STATE_ORDER[b.state] || (b.profit ?? 0) - (a.profit ?? 0);
}

export function instructorSummaries(
  activities: Activity[],
  receipts: Receipt[],
  month: MonthKey,
): InstructorSummary[] {
  const monthActs = inMonth(activities, month);
  return INSTRUCTORS.map((instructor) => {
    const acts = monthActs.filter((a) => a.instructorId === instructor.id);
    return {
      ...totalsFor(acts),
      instructor,
      activities: acts.length,
      receipt: receiptStatus(receipts, month, instructor.id) ?? "received",
    };
  }).filter((s) => s.activities > 0);
}

/** Per-month revenue/payout series for the trend chart (history + logged months). */
export function monthlySeries(activities: Activity[]) {
  const logged = [...MONTHS].reverse().map((m) => {
    const t = totalsFor(inMonth(activities, m.key));
    return {
      month: m.key as string,
      label: m.short,
      revenue: t.revenue,
      payout: t.payout,
      profit: t.profit,
      margin: t.margin,
      pendingCount: t.pendingCount,
      pendingPayout: t.pendingPayout,
    };
  });
  const history = HISTORY.map((h) => {
    const profit: number | null = h.revenue - h.payout;
    const margin: number | null = (profit / h.revenue) * 100;
    return { ...h, profit, margin, pendingCount: 0, pendingPayout: 0 };
  });
  return [...history, ...logged];
}

export function instructorTrend(activities: Activity[], id: InstructorId) {
  return [...MONTHS].reverse().map((m) => {
    const t = totalsFor(inMonth(activities, m.key).filter((a) => a.instructorId === id));
    return { month: m.key, label: m.short, ...t };
  });
}
