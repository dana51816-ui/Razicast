"use client";

import { useRef, useState } from "react";
import { backupSummary, parseBackup, shareBackup, toBackup } from "@/lib/backup";
import { monthLabel } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { AppData } from "@/lib/types";
import { copyText } from "@/lib/useRunAction";
import { IconCheck } from "../shell/icons";
import { backupAge } from "../home/StorageLine";
import { cn } from "../ui/cn";
import { PrimaryButton } from "./parts";

/**
 * Where the data lives, how to keep it safe, and how to bring it back.
 * Backup = one JSON file the user keeps in Files / iCloud / WhatsApp.
 */
export function BackupFlow({ onClose }: { onClose: () => void }) {
  const store = useStore();
  const { data } = store;
  const [mode, setMode] = useState<"home" | "paste" | "confirm">("home");
  const [pasted, setPasted] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<{ data: AppData; exportedAt: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const sum = backupSummary(data);
  const standalone =
    typeof window !== "undefined" &&
    (window.matchMedia?.("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);

  const markBackedUp = () => store.setSettings({ lastBackupAt: new Date().toISOString() });

  const save = async () => {
    const how = await shareBackup(data);
    if (how === "failed") {
      const ok = await copyText(toBackup(data));
      if (ok) {
        markBackedUp();
        store.notify("אי אפשר לשמור קובץ כאן, אז הגיבוי הועתק כטקסט. הדביקו אותו בפתקים או שלחו לעצמכם");
      } else store.notify("לא הצלחנו לגבות. נסו מהדפדפן הרגיל");
      return;
    }
    markBackedUp();
    store.notify(how === "shared" ? "קובץ הגיבוי מוכן" : "קובץ הגיבוי ירד למכשיר");
  };

  const copy = async () => {
    const ok = await copyText(toBackup(data));
    if (ok) {
      markBackedUp();
      store.notify("הגיבוי הועתק. הדביקו אותו בפתקים או שלחו לעצמכם בוואטסאפ");
    }
  };

  const check = (text: string) => {
    const r = parseBackup(text);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setError(null);
    setPending({ data: r.data, exportedAt: r.exportedAt });
    setMode("confirm");
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    check(await f.text());
  };

  const restore = () => {
    if (!pending) return;
    store.importData(pending.data);
    store.notify("הנתונים שוחזרו מהגיבוי");
    onClose();
  };

  return (
    <div className="flex flex-col min-h-0 overflow-y-auto px-6 pt-3 pb-4 md:pt-7">
      {mode === "home" && (
        <>
          <h2 className="text-[24px] font-bold">הנתונים שלך</h2>
          <p className="mt-1 text-[14px] text-ink-2 leading-relaxed">
            כל מה שמוזן נשמר אוטומטית בדפדפן של המכשיר הזה, בלי שרת ובלי חשבון. כדי לא לאבד אותו, שומרים מדי פעם קובץ גיבוי.
          </p>

          <dl className="mt-4 grid grid-cols-3 gap-2 rounded-[20px] bg-well px-4 py-3 text-center">
            <Stat n={sum.instructors} label="מדריכים" />
            <Stat n={sum.frameworks} label="מסגרות" />
            <Stat n={sum.activities} label="פעילויות" />
          </dl>
          <div className="mt-3 flex items-center gap-2 text-[13px] font-semibold">
            <span className={cn("size-2 rounded-full", data.settings.lastBackupAt ? "bg-cobalt" : "bg-amber-dot")} />
            {backupAge(data.settings.lastBackupAt)}
          </div>

          <PrimaryButton tone="cobalt" className="mt-5" onClick={save}>
            שמירת קובץ גיבוי
          </PrimaryButton>
          <button type="button" onClick={copy} className="mt-2 h-12 rounded-2xl border-[1.5px] border-ink text-[15px] font-bold">
            העתקת הגיבוי כטקסט
          </button>

          <div className="mt-7 text-[15px] font-bold">שחזור</div>
          <p className="mt-1 text-[13px] text-ink-2 leading-relaxed">השחזור מחליף את כל מה שיש כרגע במכשיר בתוכן הגיבוי.</p>
          <input ref={fileRef} type="file" accept="application/json,.json,text/plain" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} className="flex-1 h-12 rounded-2xl bg-stone-2 text-[15px] font-bold">
              מקובץ
            </button>
            <button type="button" onClick={() => setMode("paste")} className="flex-1 h-12 rounded-2xl bg-stone-2 text-[15px] font-bold">
              מטקסט שהועתק
            </button>
          </div>
          {error && <p className="mt-2 text-[13px] font-semibold text-loss-ink">{error}</p>}

          {!standalone && (
            <div className="mt-6 rounded-[20px] missing-line bg-amber-wash px-4 py-3 text-[13px] leading-relaxed">
              <b>טיפ לאייפון:</b> Safari עלול למחוק נתונים של אתר שלא נפתח שבוע. כדי למנוע את זה פותחים ב-Safari, נוגעים ב&nbsp;
              <b>שיתוף</b> ובוחרים <b>הוספה למסך הבית</b>. מעכשיו פותחים את האפליקציה רק מהאייקון.
            </div>
          )}
          <button type="button" onClick={onClose} className="mt-3 h-11 text-[15px] font-semibold text-ink-2">
            סגירה
          </button>
        </>
      )}

      {mode === "paste" && (
        <>
          <h2 className="text-[22px] font-bold">הדבקת גיבוי</h2>
          <p className="mt-1 text-[13px] text-ink-2">מדביקים כאן את כל הטקסט ששמרתם.</p>
          <textarea
            aria-label="טקסט הגיבוי"
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            dir="ltr"
            className="mt-3 h-40 w-full rounded-2xl bg-well p-3 text-[12px] font-mono"
          />
          {error && <p className="mt-2 text-[13px] font-semibold text-loss-ink">{error}</p>}
          <PrimaryButton className="mt-4" disabled={!pasted.trim()} onClick={() => check(pasted)}>
            בדיקת הגיבוי
          </PrimaryButton>
          <button type="button" onClick={() => setMode("home")} className="mt-1 h-11 text-[15px] font-semibold text-ink-2">
            חזרה
          </button>
        </>
      )}

      {mode === "confirm" && pending && (
        <>
          <span className="size-12 rounded-full bg-ink text-white grid place-items-center">
            <IconCheck strokeWidth={3} className="size-5" />
          </span>
          <h2 className="mt-4 text-[22px] font-bold">הגיבוי תקין</h2>
          <p className="mt-1 text-[14px] text-ink-2">
            {pending.exportedAt ? `נשמר ב־${new Date(pending.exportedAt).toLocaleDateString("he-IL")}. ` : ""}
            יש בו {backupSummary(pending.data).instructors} מדריכים, {backupSummary(pending.data).frameworks} מסגרות ו־
            {backupSummary(pending.data).activities} פעילויות
            {pending.data.months.length ? `, עד ${monthLabel([...pending.data.months].sort((a, b) => b.key.localeCompare(a.key))[0].key)}` : ""}.
          </p>
          <p className="mt-3 text-[14px] font-semibold text-loss-ink">השחזור יחליף את כל מה שיש כרגע במכשיר.</p>
          <PrimaryButton tone="cobalt" className="mt-5" onClick={restore}>
            שחזור הנתונים
          </PrimaryButton>
          <button type="button" onClick={() => setMode("home")} className="mt-1 h-11 text-[15px] font-semibold text-ink-2">
            ביטול
          </button>
        </>
      )}
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <dd className="num display text-[34px] leading-none">{n}</dd>
      <dt className="text-[12px] text-ink-2 mt-1">{label}</dt>
    </div>
  );
}
