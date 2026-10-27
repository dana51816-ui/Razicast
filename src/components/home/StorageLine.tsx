"use client";

import { useStore } from "@/lib/store";

export function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export function backupAge(iso: string | null | undefined) {
  const d = daysSince(iso);
  if (d === null) return "עוד לא נעשה גיבוי";
  if (d === 0) return "גיבוי אחרון: היום";
  if (d === 1) return "גיבוי אחרון: אתמול";
  return `גיבוי אחרון: לפני ${d} ימים`;
}

/** Quiet reminder of where the data lives, one tap from backup. */
export function StorageLine() {
  const { data, openFlow } = useStore();
  const age = daysSince(data.settings.lastBackupAt);
  const stale = age === null || age > 7;
  return (
    <button
      type="button"
      onClick={() => openFlow({ kind: "backup" })}
      className="mt-8 w-full min-h-12 flex items-center gap-3 border-t border-rule pt-3 text-start"
    >
      <span aria-hidden className={`size-2 rounded-full ${stale ? "bg-amber-dot" : "bg-cobalt"}`} />
      <span className="flex-1 text-[13px] text-ink-2 leading-snug">
        הנתונים נשמרים במכשיר הזה · {backupAge(data.settings.lastBackupAt)}
      </span>
      <span className="text-[13px] font-bold underline underline-offset-4">גיבוי</span>
    </button>
  );
}
