"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { instructorById } from "@/lib/data";
import { formatDayMonth } from "@/lib/format";
import { activityProfit } from "@/lib/selectors";
import type { Activity } from "@/lib/types";
import { cn } from "../ui/cn";
import { InstructorAvatar } from "../ui/InstructorAvatar";
import { Money } from "../ui/Money";
import { ProfitValue } from "../ui/ProfitValue";
import { Tag } from "../ui/StatusPill";

export function ActivityCard({ activity: a, index = 0 }: { activity: Activity; index?: number }) {
  const inst = instructorById(a.instructorId);
  const d = formatDayMonth(a.date);
  const profit = activityProfit(a);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: Math.min(index, 8) * 0.03, duration: 0.3 }}
      className={cn(
        "surface rounded-[var(--radius-card)] overflow-hidden",
        a.missing && "ring-1 ring-inset ring-warn/25",
      )}
    >
      {a.missing && (
        <div className="flex items-center gap-2 px-4 h-8 bg-warn/[0.08] text-warn text-[12px] font-medium">
          <AlertTriangle className="size-3.5" />
          {a.missing}
        </div>
      )}
      <div className="p-4 pb-3.5 flex gap-3.5">
        <div className="shrink-0 w-11 text-center pt-0.5">
          <div className="num text-[22px] font-semibold leading-none text-fg">{d.day}</div>
          <div className="text-[11px] text-fg-3 mt-1">{d.monthShort} · {d.weekday}</div>
        </div>
        <div className="min-w-0 flex-1 border-s hairline ps-3.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn("text-[15.5px] font-semibold leading-snug", a.client ? "text-fg" : "text-fg-4 italic")}>
              {a.client ?? "לקוח לא הוזן"}
            </h3>
            <Tag className="shrink-0">{a.type}</Tag>
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[12.5px] text-fg-3">
            <InstructorAvatar id={a.instructorId} size="sm" />
            <span className="text-fg-2">{inst.name}</span>
            <span className="text-fg-4">·</span>
            <span>
              <span className="num">{a.quantity}</span> {a.unit}
            </span>
          </div>
        </div>
      </div>
      <dl className="grid grid-cols-3 border-t hairline">
        <Metric label="הכנסה לחברה">
          {a.revenue === null ? <span className="text-warn text-[13px] font-medium">לא הוזנה</span> : <Money value={a.revenue} />}
        </Metric>
        <Metric label="תשלום למדריך" className="border-x hairline">
          <Money value={a.payout} className="text-fg-2" />
        </Metric>
        <Metric label="רווח">
          <ProfitValue
            value={profit}
            className={cn("font-semibold", profit !== null && profit > 0 && "text-fg")}
            badgeClassName="h-5 px-1.5 text-[11px]"
          />
        </Metric>
      </dl>
    </motion.article>
  );
}

function Metric({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-3 py-2.5 text-center", className)}>
      <dt className="text-[11px] text-fg-3">{label}</dt>
      <dd className="mt-0.5 text-[14.5px]">{children}</dd>
    </div>
  );
}
