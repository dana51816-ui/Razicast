"use client";

import { Users } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { INSTRUCTORS, monthLabel } from "@/lib/data";
import { formatPct } from "@/lib/format";
import { instructorSummaries } from "@/lib/selectors";
import { useStore } from "@/lib/store";
import type { InstructorId } from "@/lib/types";
import { EmptyState } from "../ui/EmptyState";
import { MonthSelector } from "../ui/MonthSelector";
import { PageHeader } from "../ui/PageHeader";
import { Skeleton } from "../ui/Skeleton";
import { InstructorCard } from "./InstructorCard";
import { InstructorDrawer } from "./InstructorDrawer";

export function InstructorsScreen() {
  const { activities, receipts, month, loading } = useStore();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const raw = params.get("i");
  const openId = INSTRUCTORS.some((i) => i.id === raw) ? (raw as InstructorId) : null;

  const summaries = useMemo(
    () => instructorSummaries(activities, receipts, month).sort((a, b) => {
      // support staff last, otherwise by profit
      if ((a.margin === null) !== (b.margin === null)) return a.margin === null ? 1 : -1;
      return b.profit - a.profit;
    }),
    [activities, receipts, month],
  );

  const leads = summaries.filter((s) => s.margin !== null);
  const avgMargin = leads.length
    ? (leads.reduce((s, x) => s + x.profit, 0) / leads.reduce((s, x) => s + x.revenue, 0)) * 100
    : 0;
  const negatives = leads.filter((s) => s.profit < 0).length;

  const open = (id: InstructorId | null) =>
    router.replace(id ? `${pathname}?i=${id}` : pathname, { scroll: false });

  return (
    <>
      <PageHeader
        title="מדריכים"
        subtitle={
          <>
            <span className="num">{summaries.length}</span> מדריכים פעילים ב{monthLabel(month)} · רווחיות ממוצעת{" "}
            <span className="num text-fg-2">{formatPct(avgMargin)}</span>
            {negatives > 0 && (
              <>
                {" "}· <span className="text-neg">{negatives} ברווחיות שלילית</span>
              </>
            )}
          </>
        }
        actions={<MonthSelector />}
      />

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[232px] rounded-[var(--radius-card)]" />
          ))}
        </div>
      ) : summaries.length === 0 ? (
        <EmptyState icon={Users} title="אין פעילות מדריכים בחודש הזה" body="ברגע שתוזן פעילות, המדריכים יופיעו כאן." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {summaries.map((s, i) => (
            <InstructorCard key={s.instructor.id} summary={s} index={i} onOpen={() => open(s.instructor.id)} />
          ))}
        </div>
      )}

      <InstructorDrawer id={openId} onClose={() => open(null)} />
    </>
  );
}
