"use client";

import { useMemo } from "react";
import { inMonth, instructorSummaries, isIncomplete } from "@/lib/selectors";
import { useStore } from "@/lib/store";

/**
 * Counts that power badges, the "דורש טיפול" feed and month close.
 * Real losses and missing data are kept strictly apart.
 */
export function useAttention() {
  const { activities, receipts, month } = useStore();
  return useMemo(() => {
    const missingReceipts = receipts.filter((r) => r.month === month && r.status === "missing");
    const losses = instructorSummaries(activities, receipts, month).filter((s) => s.state === "loss");
    const monthActs = inMonth(activities, month);
    const incomplete = monthActs.filter(isIncomplete);
    const missingRevenue = monthActs.filter((a) => a.revenue === null);
    const missingDetails = incomplete.filter((a) => a.revenue !== null);
    return { missingReceipts, losses, incomplete, missingRevenue, missingDetails };
  }, [activities, receipts, month]);
}
