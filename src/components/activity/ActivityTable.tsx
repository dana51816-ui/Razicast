"use client";

import { AlertTriangle } from "lucide-react";
import { instructorById } from "@/lib/data";
import { formatShortDate } from "@/lib/format";
import { activityProfit } from "@/lib/selectors";
import type { Activity } from "@/lib/types";
import { cn } from "../ui/cn";
import { InstructorAvatar } from "../ui/InstructorAvatar";
import { Money } from "../ui/Money";
import { Tag } from "../ui/StatusPill";

export function ActivityTable({ activities }: { activities: Activity[] }) {
  return (
    <div className="surface rounded-[var(--radius-card)] overflow-hidden">
      <table className="w-full text-[13.5px]">
        <thead>
          <tr className="text-[12px] text-fg-3 border-b hairline">
            <Th>תאריך</Th>
            <Th>מדריך</Th>
            <Th>לקוח / מסגרת</Th>
            <Th>סוג פעילות</Th>
            <Th className="text-center">כמות</Th>
            <Th className="text-left">הכנסה לחברה</Th>
            <Th className="text-left">תשלום למדריך</Th>
            <Th className="text-left">רווח</Th>
          </tr>
        </thead>
        <tbody>
          {activities.map((a) => {
            const profit = activityProfit(a);
            return (
              <tr
                key={a.id}
                className={cn(
                  "border-b hairline last:border-b-0 transition-colors hover:bg-white/[0.025]",
                  a.missing && "bg-warn/[0.03]",
                )}
              >
                <Td>
                  <span className="num text-fg-2">{formatShortDate(a.date)}</span>
                </Td>
                <Td>
                  <span className="flex items-center gap-2">
                    <InstructorAvatar id={a.instructorId} size="sm" />
                    {instructorById(a.instructorId).name}
                  </span>
                </Td>
                <Td>
                  <span className="flex items-center gap-2">
                    {a.client ? (
                      <span className="font-medium text-fg">{a.client}</span>
                    ) : (
                      <span className="text-fg-4 italic">לקוח לא הוזן</span>
                    )}
                    {a.missing && (
                      <span title={a.missing} className="inline-flex items-center gap-1 text-warn text-[12px]">
                        <AlertTriangle className="size-3.5" />
                        {a.missing}
                      </span>
                    )}
                  </span>
                </Td>
                <Td>
                  <Tag>{a.type}</Tag>
                </Td>
                <Td className="text-center">
                  <span className="num text-fg-2">{a.quantity}</span>
                </Td>
                <Td className="text-left">
                  {a.revenue === null ? <span className="text-warn">חסר</span> : <Money value={a.revenue} />}
                </Td>
                <Td className="text-left">
                  <Money value={a.payout} className="text-fg-2" />
                </Td>
                <Td className="text-left">
                  <Money value={profit} tone="auto" className="font-semibold" />
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const Th = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <th className={cn("px-4 h-11 font-medium", align(className))}>{children}</th>
);
const Td = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <td className={cn("px-4 h-[52px]", align(className))}>{children}</td>
);

const align = (className?: string) =>
  className?.includes("text-") ? className : cn("text-start", className);
