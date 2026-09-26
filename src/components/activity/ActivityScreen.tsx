"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, SearchX } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ACTIVITY_TYPES, INSTRUCTORS, monthLabel } from "@/lib/data";
import { inMonth, totalsFor } from "@/lib/selectors";
import { useStore } from "@/lib/store";
import type { ActivityStatus, ActivityType, InstructorId } from "@/lib/types";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { FilterChip } from "../ui/FilterChip";
import { Money } from "../ui/Money";
import { MonthSelector } from "../ui/MonthSelector";
import { PageHeader } from "../ui/PageHeader";
import { Skeleton } from "../ui/Skeleton";
import { ActivityCard } from "./ActivityCard";
import { ActivityTable } from "./ActivityTable";
import { NewActivitySheet } from "./NewActivitySheet";

type Status = "all" | ActivityStatus;

export function ActivityScreen() {
  const params = useSearchParams();
  const { activities, month, loading } = useStore();
  const [instructor, setInstructor] = useState<"all" | InstructorId>("all");
  const [type, setType] = useState<"all" | ActivityType>("all");
  const [status, setStatus] = useState<Status>(
    params.get("status") === "missing-info" ? "missing-info" : "all",
  );
  const [adding, setAdding] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const filtered = useMemo(
    () =>
      inMonth(activities, month)
        .filter((a) => instructor === "all" || a.instructorId === instructor)
        .filter((a) => type === "all" || a.type === type)
        .filter((a) => status === "all" || (status === "missing-info" ? !!a.missing : !a.missing))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [activities, month, instructor, type, status],
  );
  const totals = totalsFor(filtered);
  const anyFilter = instructor !== "all" || type !== "all" || status !== "all";
  const clear = () => {
    setInstructor("all");
    setType("all");
    setStatus("all");
  };

  return (
    <>
      <PageHeader
        title="פעילות"
        subtitle={`יומן הפעילות של ${monthLabel(month)}`}
        actions={
          <>
            <MonthSelector />
            <div className="hidden lg:block">
              <Button variant="primary" onClick={() => setAdding(true)}>
                <Plus className="size-4" strokeWidth={2.5} />
                פעילות חדשה
              </Button>
            </div>
          </>
        }
      />

      <div className="sticky top-[env(safe-area-inset-top)] z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 py-2.5 mb-3 bg-ink-900/80 backdrop-blur-xl lg:bg-transparent lg:backdrop-blur-none lg:static">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <FilterChip
            label="מדריך"
            value={instructor}
            onChange={setInstructor}
            options={[{ value: "all", label: "כל המדריכים" }, ...INSTRUCTORS.map((i) => ({ value: i.id, label: i.name }))]}
          />
          <FilterChip
            label="סוג פעילות"
            value={type}
            onChange={setType}
            options={[{ value: "all", label: "כל הסוגים" }, ...ACTIVITY_TYPES.map((t) => ({ value: t, label: t }))]}
          />
          <FilterChip<Status>
            label="סטטוס"
            value={status}
            onChange={setStatus}
            options={[
              { value: "all", label: "הכול" },
              { value: "complete", label: "מלא" },
              { value: "missing-info", label: "חסר מידע" },
            ]}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mb-3 text-[12.5px] text-fg-3">
        <span>
          <span className="num text-fg font-medium">{filtered.length}</span> פעילויות
          {anyFilter && (
            <button onClick={clear} className="ms-2 text-signal hover:underline">
              ניקוי סינון
            </button>
          )}
        </span>
        <span className="flex items-center gap-3">
          <span>
            הכנסה <Money value={totals.revenue} className="text-fg-2" />
          </span>
          <span>
            רווח <Money value={totals.profit} tone="auto" className="text-fg font-medium" />
          </span>
        </span>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[150px] lg:h-[52px] w-full rounded-[var(--radius-card)]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={anyFilter ? "אין פעילויות שתואמות לסינון" : "עדיין אין פעילויות החודש"}
          body={anyFilter ? "נסו להסיר חלק מהמסננים כדי לראות יותר תוצאות." : "הוסיפו את הפעילות הראשונה כדי להתחיל לעקוב אחרי הרווחיות."}
          action={
            anyFilter ? (
              <Button onClick={clear}>ניקוי סינון</Button>
            ) : (
              <Button variant="primary" onClick={() => setAdding(true)}>
                <Plus className="size-4" /> פעילות חדשה
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="flex flex-col gap-2.5 lg:hidden">
            <AnimatePresence mode="popLayout">
              {filtered.map((a, i) => (
                <ActivityCard key={a.id} activity={a} index={i} />
              ))}
            </AnimatePresence>
          </div>
          <div className="hidden lg:block">
            <ActivityTable activities={filtered} />
          </div>
        </>
      )}

      {mounted &&
        createPortal(
          <motion.button
            onClick={() => setAdding(true)}
            aria-label="פעילות חדשה"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 500, damping: 28, delay: 0.15 }}
            className="lg:hidden fixed z-[60] left-4 bottom-[calc(max(env(safe-area-inset-bottom),8px)+80px)] h-14 ps-4 pe-5 rounded-full bg-signal text-signal-ink font-semibold text-[15px] flex items-center gap-2 shadow-[0_12px_32px_-6px_rgba(200,242,74,.55),0_0_0_1px_rgba(200,242,74,.5)]"
          >
            <Plus className="size-5" strokeWidth={2.6} />
            פעילות חדשה
          </motion.button>,
          document.body,
        )}

      {/* keeps the last card clear of the floating add button */}
      <div className="h-16 lg:hidden" aria-hidden />

      <NewActivitySheet open={adding} onClose={() => setAdding(false)} />
    </>
  );
}
