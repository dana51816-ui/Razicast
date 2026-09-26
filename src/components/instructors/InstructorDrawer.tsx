"use client";

import { AlertTriangle, BellRing, CircleHelp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { instructorById, monthName } from "@/lib/data";
import { formatDayMonth, formatPct } from "@/lib/format";
import { activityProfit, instructorSummaries, instructorTrend } from "@/lib/selectors";
import { useStore } from "@/lib/store";
import type { InstructorId } from "@/lib/types";
import { cn } from "../ui/cn";
import { InstructorAvatar } from "../ui/InstructorAvatar";
import { Money } from "../ui/Money";
import { Sheet } from "../ui/Sheet";
import { ProfitValue } from "../ui/ProfitValue";
import { MissingBadge, ReceiptPill, Tag } from "../ui/StatusPill";
import { TrendChart } from "./TrendChart";

export function InstructorDrawer({ id, onClose }: { id: InstructorId | null; onClose: () => void }) {
  const { activities, receipts, month } = useStore();
  const data = useMemo(() => {
    if (!id) return null;
    const summary = instructorSummaries(activities, receipts, month).find((s) => s.instructor.id === id);
    const recent = activities
      .filter((a) => a.instructorId === id)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6);
    return { summary, recent, trend: instructorTrend(activities, id) };
  }, [id, activities, receipts, month]);

  const inst = id ? instructorById(id) : null;
  const s = data?.summary;
  const negative = s?.state === "loss";
  const missing = s?.state === "missing";

  return (
    <Sheet
      open={!!id}
      onClose={onClose}
      variant="drawer"
      title={
        inst && (
          <span className="flex items-center gap-3">
            <InstructorAvatar id={inst.id} size="lg" />
            <span>
              <span className="block">{inst.name}</span>
              <span className="block text-[13px] font-normal text-fg-3 mt-0.5">
                {inst.specialty} · {monthName(month)}
              </span>
            </span>
          </span>
        )
      }
    >
      {inst && data && (
        <div className="flex flex-col gap-6">
          {negative && (
            <div className="flex gap-3 rounded-2xl p-3.5 bg-neg/[0.07] ring-1 ring-inset ring-neg/20">
              <TrendingDown className="size-5 text-neg shrink-0 mt-0.5" />
              <div className="text-[13px] leading-relaxed">
                <div className="font-semibold text-fg">הפסד בפועל החודש</div>
                <div className="text-fg-2">
                  לפי הנתונים שהוזנו, התשלום גבוה מההכנסה ב־<Money value={Math.abs(s?.profit ?? 0)} />.
                </div>
              </div>
            </div>
          )}
          {s && s.pendingCount > 0 && (
            <div className="flex gap-3 rounded-2xl p-3.5 bg-warn/[0.05] border border-dashed border-warn/35">
              <CircleHelp className="size-5 text-warn shrink-0 mt-0.5" />
              <div className="text-[13px] leading-relaxed">
                <div className="font-semibold text-fg">מידע חסר</div>
                <div className="text-fg-2">
                  {s.pendingCount === 1 ? "בפעילות אחת" : `ב־${s.pendingCount} פעילויות`} לא הוזנה הכנסה (תשלום{" "}
                  <Money value={s.pendingPayout} />
                  ).{" "}
                  {missing
                    ? "אי אפשר לחשב רווח או רווחיות עד שההכנסה תוזן."
                    : "הן לא נכללות ברווח וברווחיות שמוצגים כאן."}
                </div>
              </div>
            </div>
          )}

          {s ? (
            <div className="grid grid-cols-2 gap-2">
              <Stat label="הכנסות החודש">
                {missing ? <span className="text-warn text-[15px]">לא הוזנה</span> : <Money value={s.revenue} />}
              </Stat>
              <Stat label="תשלום"><Money value={s.payout} /></Stat>
              <Stat label="רווח" accent={s.state === "profit"} danger={negative}>
                <ProfitValue value={s.profit} badgeClassName="mt-1" />
              </Stat>
              <Stat label="רווחיות" danger={negative}>
                {s.margin === null ? (
                  <MissingBadge className="mt-1" />
                ) : (
                  <span className="num">{formatPct(s.margin)}</span>
                )}
              </Stat>
              <Stat label="מספר פעילויות"><span className="num">{s.activities}</span></Stat>
              <Stat label="סטטוס קבלה">
                <ReceiptPill status={s.receipt} className="mt-1" />
              </Stat>
            </div>
          ) : (
            <p className="text-[13px] text-fg-3">אין פעילות החודש.</p>
          )}

          {s?.receipt === "missing" && (
            <Link
              href={`/receipts?remind=${inst.id}`}
              className="flex items-center justify-center gap-2 h-11 rounded-xl bg-white/[0.05] ring-1 ring-inset ring-white/[0.08] text-[14px] font-medium hover:bg-white/[0.08] transition-colors"
            >
              <BellRing className="size-4 text-warn" />
              יצירת תזכורת לקבלה
            </Link>
          )}

          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="text-[14px] font-semibold">מגמת 3 חודשים</h3>
              <span className="flex items-center gap-3 text-[11.5px] text-fg-3">
                <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-[3px] bg-series-revenue" />הכנסה</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-[3px] bg-series-payout" />תשלום</span>
              </span>
            </div>
            <div className="surface rounded-2xl p-3">
              <TrendChart data={data.trend} />
            </div>
          </section>

          <section>
            <h3 className="text-[14px] font-semibold mb-2">פעילויות אחרונות</h3>
            <ul className="flex flex-col">
              {data.recent.map((a) => {
                const d = formatDayMonth(a.date);
                const p = activityProfit(a);
                return (
                  <li key={a.id} className="flex items-center gap-3 py-3 border-b hairline last:border-b-0">
                    <div className="w-10 text-center shrink-0">
                      <div className="num text-[16px] font-semibold leading-none">{d.day}</div>
                      <div className="text-[10.5px] text-fg-3 mt-1">{d.monthShort}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={cn("text-[14px] font-medium truncate", !a.client && "text-fg-4 italic")}>
                        {a.client ?? "לקוח לא הוזן"}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Tag className="h-5 text-[11px]">{a.type}</Tag>
                        {a.missing && (
                          <span className="inline-flex items-center gap-1 text-[11.5px] text-warn">
                            <AlertTriangle className="size-3" /> {a.missing}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-end">
                      <ProfitValue value={p} className="text-[14px] font-semibold" badgeClassName="h-5 px-1.5 text-[11px]" />
                      <div className="text-[11px] text-fg-3 mt-0.5">
                        תשלום <Money value={a.payout} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      )}
    </Sheet>
  );
}

function Stat({
  label,
  children,
  accent,
  danger,
}: {
  label: string;
  children: React.ReactNode;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-3.5 ring-1 ring-inset",
        danger ? "bg-neg/[0.05] ring-neg/15" : accent ? "bg-signal/[0.06] ring-signal/15" : "bg-white/[0.03] ring-white/[0.06]",
      )}
    >
      <div className="text-[12px] text-fg-3">{label}</div>
      <div className="text-[19px] font-semibold mt-1 tracking-tight">{children}</div>
    </div>
  );
}
