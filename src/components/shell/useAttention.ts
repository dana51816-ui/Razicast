"use client";

import { useMemo } from "react";
import { inMonth, instructorSummaries } from "@/lib/selectors";
import { useStore } from "@/lib/store";

/** Counts that power badges and the "דורש טיפול" list. */
export function useAttention() {
  const { activities, receipts, month } = useStore();
  return useMemo(() => {
    const missingReceipts = receipts.filter((r) => r.month === month && r.status === "missing");
    const negative = instructorSummaries(activities, receipts, month).filter(
      (s) => s.margin !== null && s.profit < 0,
    );
    const incomplete = inMonth(activities, month).filter((a) => a.missing);
    return { missingReceipts, negative, incomplete };
  }, [activities, receipts, month]);
}
