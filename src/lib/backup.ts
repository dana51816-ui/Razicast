import type { AppData } from "./types";

/**
 * Backup = the whole data set as one JSON file. It is what makes local data safe:
 * save it to Files / iCloud / WhatsApp, and restore it on any device.
 */

const MARK = "razicast-control-backup";

export interface BackupFile {
  kind: typeof MARK;
  exportedAt: string;
  data: AppData;
}

export function toBackup(data: AppData): string {
  const file: BackupFile = { kind: MARK, exportedAt: new Date().toISOString(), data };
  return JSON.stringify(file);
}

export function backupFileName(date = new Date()) {
  const d = date.toISOString().slice(0, 10);
  return `razicast-backup-${d}.json`;
}

/** Parses and checks a backup. Returns a message instead of throwing so the UI can explain what's wrong. */
export function parseBackup(text: string): { ok: true; data: AppData; exportedAt: string } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.trim());
  } catch {
    return { ok: false, error: "זה לא קובץ גיבוי של RAZICAST. ודאו שהעתקתם את כל הטקסט." };
  }
  const f = parsed as Partial<BackupFile>;
  const data = (f && f.kind === MARK ? f.data : (parsed as AppData)) as AppData | undefined;
  if (!data || data.version !== 3) return { ok: false, error: "הקובץ לא מזוהה כגיבוי של הגרסה הזו של האפליקציה." };
  const lists = [data.instructors, data.frameworks, data.activities, data.receipts, data.months];
  if (!lists.every(Array.isArray) || !data.settings) return { ok: false, error: "הקובץ חסר או פגום, ולכן לא שוחזר דבר." };
  return { ok: true, data, exportedAt: (f && f.exportedAt) || "" };
}

export function backupSummary(data: AppData) {
  return {
    instructors: data.instructors.length,
    frameworks: data.frameworks.length,
    activities: data.activities.length,
  };
}

/**
 * Hands the backup file to the phone: the iOS share sheet when available
 * (Save to Files, WhatsApp, Mail), otherwise a normal download.
 * Returns how it was handed over, or "failed" (e.g. inside a sandboxed preview).
 */
export async function shareBackup(data: AppData): Promise<"shared" | "downloaded" | "failed"> {
  const json = toBackup(data);
  const name = backupFileName();
  try {
    const file = new File([json], name, { type: "application/json" });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.canShare?.({ files: [file] })) {
      await nav.share({ files: [file], title: "גיבוי RAZICAST CONTROL" });
      return "shared";
    }
  } catch (e) {
    if ((e as Error)?.name === "AbortError") return "shared"; // user closed the sheet
  }
  try {
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return "downloaded";
  } catch {
    return "failed";
  }
}

/** Ask the browser not to evict our storage (honoured by home-screen apps and most desktop browsers). */
export async function requestPersistentStorage(): Promise<boolean | null> {
  try {
    if (!navigator.storage?.persist) return null;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return null;
  }
}
