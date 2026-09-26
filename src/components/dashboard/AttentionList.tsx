"use client";

import { motion } from "framer-motion";
import { ChevronLeft, FileWarning, ReceiptText, TrendingDown, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { instructorById } from "@/lib/data";
import { formatILS } from "@/lib/format";
import { useStore } from "@/lib/store";
import { inMonth } from "@/lib/selectors";
import { Card, SectionTitle } from "../ui/Card";
import { cn } from "../ui/cn";
import { Skeleton } from "../ui/Skeleton";
import { useAttention } from "../shell/useAttention";
import { CheckCircle2 } from "lucide-react";

interface Item {
  key: string;
  href: string;
  icon: LucideIcon;
  tone: "warn" | "neg";
  title: string;
  detail: string;
}

const tones = {
  warn: "text-warn bg-warn/10 ring-warn/20",
  neg: "text-neg bg-neg/10 ring-neg/20",
};

export function AttentionList({ loading }: { loading?: boolean }) {
  const { missingReceipts, negative, incomplete } = useAttention();
  const { activities, month } = useStore();
  const monthActs = inMonth(activities, month);

  const payoutOf = (id: string) =>
    monthActs.filter((a) => a.instructorId === id).reduce((s, a) => s + a.payout, 0);

  const items: Item[] = [];
  if (missingReceipts.length)
    items.push({
      key: "receipts",
      href: "/receipts",
      icon: ReceiptText,
      tone: "warn",
      title: `${missingReceipts.length} קבלות חסרות`,
      detail: `${missingReceipts.map((r) => instructorById(r.instructorId).name).join(", ")} · ${formatILS(
        missingReceipts.reduce((s, r) => s + payoutOf(r.instructorId), 0),
      )}`,
    });
  if (negative.length)
    items.push({
      key: "negative",
      href: negative.length === 1 ? `/instructors?i=${negative[0].instructor.id}` : "/instructors",
      icon: TrendingDown,
      tone: "neg",
      title: negative.length === 1 ? "מדריך אחד ברווחיות שלילית" : `${negative.length} מדריכים ברווחיות שלילית`,
      detail: negative.map((n) => `${n.instructor.name} ${formatILS(n.profit)}`).join(", "),
    });
  if (incomplete.length)
    items.push({
      key: "incomplete",
      href: "/activity?status=missing-info",
      icon: FileWarning,
      tone: "warn",
      title: `${incomplete.length} פעילויות שחסר בהן מידע`,
      detail: incomplete.map((a) => a.missing).join(" · "),
    });

  return (
    <Card className="p-4 md:p-5 h-full">
      <SectionTitle
        title="דורש טיפול"
        hint={items.length ? `${items.length} נושאים פתוחים החודש` : undefined}
        action={
          items.length > 0 && (
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warn opacity-50" />
              <span className="relative inline-flex size-2 rounded-full bg-warn" />
            </span>
          )
        }
      />
      {loading ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[62px] w-full rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center gap-3 rounded-2xl bg-pos/[0.06] ring-1 ring-inset ring-pos/15 p-4">
          <CheckCircle2 className="size-5 text-pos" />
          <div>
            <p className="text-[14px] font-medium">הכול מסודר</p>
            <p className="text-[12.5px] text-fg-3">אין פריטים פתוחים בחודש הזה</p>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item, i) => (
            <motion.li
              key={item.key}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.06 * i, duration: 0.3 }}
            >
              <Link
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl p-3 bg-white/[0.025] ring-1 ring-inset ring-white/[0.05] hover:bg-white/[0.05] hover:ring-white/[0.09] active:scale-[0.99] transition-all"
              >
                <span className={cn("size-10 shrink-0 rounded-xl grid place-items-center ring-1 ring-inset", tones[item.tone])}>
                  <item.icon className="size-[18px]" strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-semibold text-fg">{item.title}</span>
                  <span className="block text-[12.5px] text-fg-3 truncate mt-0.5">{item.detail}</span>
                </span>
                <ChevronLeft className="size-4 text-fg-4 group-hover:text-fg-2 group-hover:-translate-x-0.5 transition-all" />
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </Card>
  );
}
