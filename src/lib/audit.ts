import {
  activitiesIn,
  frameworkOf,
  hasPaymentTerms,
  instructorOf,
  receiptRecordOf,
  teamMonth,
} from "./calc";
import { dayMonth, formatILS, monthName } from "./format";
import type { Activity, AppData, ID, MonthKey } from "./types";

/** What the user can do about an issue. The store knows how to run each one. */
export type IssueAction =
  | { type: "resolveActivity"; activityId: ID }
  | { type: "remind"; instructorId: ID; month: MonthKey }
  | { type: "markReceived"; instructorId: ID; month: MonthKey }
  | { type: "ackLoss"; instructorId: ID; month: MonthKey }
  | { type: "openInstructor"; instructorId: ID }
  | { type: "editTerms"; instructorId: ID }
  | { type: "goto"; href: string };

export type Severity = "blocker" | "attention" | "info";

export interface Issue {
  id: string;
  severity: Severity;
  /** loss = red, missing = amber dashed, receipt = amber dot */
  tone: "missing" | "loss" | "receipt" | "neutral";
  /** WHAT happened */
  title: string;
  /** WHY it matters */
  why: string;
  /** WHAT to do now */
  action: { label: string; run: IssueAction };
  secondary?: { label: string; run: IssueAction };
}

function activityContext(data: AppData, a: Activity) {
  const f = frameworkOf(data, a.frameworkId);
  return [a.label, f?.name, dayMonth(a.date)].filter(Boolean).join(" · ");
}

export interface MonthAudit {
  blockers: Issue[];
  attention: Issue[];
  info: Issue[];
  done: string[];
  canClose: boolean;
}

export function auditMonth(data: AppData, month: MonthKey): MonthAudit {
  const acts = activitiesIn(data, month).sort((a, b) => a.date.localeCompare(b.date));
  const blockers: Issue[] = [];
  const attention: Issue[] = [];
  const info: Issue[] = [];
  const name = (id: ID) => instructorOf(data, id)?.name ?? "מדריך";
  const mName = monthName(month);

  /* Money that is missing blocks closing: without it the month's profit is not final. */
  for (const a of acts) {
    if (a.revenue.value === null) {
      blockers.push({
        id: `rev-${a.id}`,
        severity: "blocker",
        tone: "missing",
        title: `חסרה הכנסה ל${name(a.instructorId)}`,
        why: `${activityContext(data, a)}. בלי הסכום הזה הרווח של ${mName} לא סופי.`,
        action: { label: "השלם עכשיו", run: { type: "resolveActivity", activityId: a.id } },
      });
    }
    if (a.instructorPayment.value === null) {
      blockers.push({
        id: `pay-${a.id}`,
        severity: "blocker",
        tone: "missing",
        title: `חסר תשלום ל${name(a.instructorId)}`,
        why: `${activityContext(data, a)}. בלי הסכום הזה לא ידוע כמה לשלם, והרווח לא סופי.`,
        action: { label: "השלם עכשיו", run: { type: "resolveActivity", activityId: a.id } },
      });
    }
    if (a.frameworkId === null) {
      blockers.push({
        id: `fw-${a.id}`,
        severity: "blocker",
        tone: "missing",
        title: `לפעילות של ${name(a.instructorId)} חסרה מסגרת`,
        why: `${[a.label, dayMonth(a.date)].filter(Boolean).join(" · ")}. לא ידוע למי הפעילות שייכת ולמי לחייב.`,
        action: { label: "השלמה", run: { type: "resolveActivity", activityId: a.id } },
      });
    }
  }

  const team = teamMonth(data, month);
  const reviewed = new Set(data.months.find((m) => m.key === month)?.reviewedLosses ?? []);

  /* Receipts: blocking only if the business rule says so. */
  for (const s of team) {
    if (s.receipt !== "missing") continue;
    const rec = receiptRecordOf(data, s.instructor.id, month);
    const issue: Issue = {
      id: `rc-${s.instructor.id}`,
      severity: data.settings.receiptsBlockClosing ? "blocker" : "attention",
      tone: "receipt",
      title: `חסרה קבלה ל${s.instructor.name}`,
      why: `${formatILS(s.totals.payment)} שולמו בלי קבלה${rec?.remindedAt ? " · תזכורת כבר הוכנה" : ""}. בלי קבלה התשלום לא מתועד.`,
      action: { label: rec?.remindedAt ? "תזכורת שוב" : "צור תזכורת", run: { type: "remind", instructorId: s.instructor.id, month } },
      secondary: { label: "התקבלה", run: { type: "markReceived", instructorId: s.instructor.id, month } },
    };
    (issue.severity === "blocker" ? blockers : attention).push(issue);
  }

  /* Real losses: data is complete, the money just doesn't add up. */
  for (const s of team) {
    if (s.financial !== "loss" || reviewed.has(s.instructor.id)) continue;
    attention.push({
      id: `loss-${s.instructor.id}`,
      severity: "attention",
      tone: "loss",
      title: `${s.instructor.name} בהפסד של ${formatILS(Math.abs(s.totals.profit ?? 0))}`,
      why: `הנתונים מלאים: שולם ${formatILS(s.totals.confirmedPayment)} על הכנסה של ${formatILS(s.totals.confirmedRevenue)}.`,
      action: { label: "בדיקה", run: { type: "openInstructor", instructorId: s.instructor.id } },
      secondary: { label: "ההפסד נכון", run: { type: "ackLoss", instructorId: s.instructor.id, month } },
    });
  }

  /* Missing terms: not wrong this month, but the next activity will need manual amounts. */
  const noTerms = team.filter((s) => s.activities.length > 0 && !hasPaymentTerms(s.instructor));
  if (noTerms.length === 1) {
    const i = noTerms[0].instructor;
    info.push({
      id: `terms-${i.id}`,
      severity: "info",
      tone: "neutral",
      title: `חסר תעריף ל${i.name}`,
      why: "בלי תעריף שמור, כל פעילות חדשה תצטרך הזנת תשלום ידנית.",
      action: { label: "הגדרת תעריף", run: { type: "editTerms", instructorId: i.id } },
    });
  } else if (noTerms.length > 1) {
    info.push({
      id: "terms-many",
      severity: "info",
      tone: "neutral",
      title: `ל־${noTerms.length} מדריכים אין תעריף שמור`,
      why: "בלי תעריף, כל פעילות חדשה שלהם תצטרך הזנת תשלום ידנית.",
      action: { label: "לצוות", run: { type: "goto", href: "/team" } },
    });
  }

  /* What passed */
  const done: string[] = [];
  const withRevenue = acts.filter((a) => a.revenue.value !== null).length;
  const withPayment = acts.filter((a) => a.instructorPayment.value !== null).length;
  const withFramework = acts.filter((a) => a.frameworkId !== null).length;
  if (acts.length > 0) {
    if (withRevenue === acts.length) done.push(`לכל ${acts.length} הפעילויות יש הכנסה`);
    else done.push(`הכנסה רשומה ב־${withRevenue} מתוך ${acts.length} פעילויות`);
    if (withPayment === acts.length) done.push(`תשלום למדריך חושב בכל ${acts.length} הפעילויות`);
    if (withFramework === acts.length) done.push("לכל הפעילויות יש מסגרת");
  }
  const required = team.filter((s) => s.receipt !== null);
  const received = required.filter((s) => s.receipt === "received").length;
  if (required.length > 0) done.push(`${received} מתוך ${required.length} קבלות התקבלו`);
  const acked = team.filter((s) => s.financial === "loss" && reviewed.has(s.instructor.id));
  for (const s of acked) done.push(`ההפסד של ${s.instructor.name} נבדק ואושר`);
  if (team.every((s) => s.financial !== "loss")) done.push("אין מדריכים בהפסד");

  return { blockers, attention, info, done, canClose: blockers.length === 0 && acts.length > 0 };
}

/** Home shows the few things that matter most, in order. */
export function homeIssues(data: AppData, month: MonthKey, limit = 4) {
  const a = auditMonth(data, month);
  const all = [...a.blockers, ...a.attention.filter((i) => i.tone === "loss"), ...a.attention.filter((i) => i.tone !== "loss")];

  // Receipts collapse into one line on home
  const receipts = all.filter((i) => i.tone === "receipt");
  const rest = all.filter((i) => i.tone !== "receipt");
  const list: Issue[] = [...rest];
  if (receipts.length === 1) list.push(receipts[0]);
  else if (receipts.length > 1) {
    const names = receipts.map((r) => r.title.replace("חסרה קבלה ל", ""));
    list.push({
      id: "receipts",
      severity: receipts[0].severity,
      tone: "receipt",
      title: `${receipts.length} קבלות חסרות`,
      why: `${names.join(", ")}. בלי קבלה התשלום לא מתועד.`,
      action: { label: "תזכורות", run: { type: "goto", href: "/month#receipts" } },
    });
  }
  list.push(...a.info);
  return { shown: list.slice(0, limit), more: Math.max(0, list.length - limit), total: list.length };
}

export function reminderMessage(name: string, month: MonthKey, amount: number) {
  return `היי ${name}, חסרה לנו הקבלה עבור פעילות חודש ${monthName(month)} בסך ${formatILS(amount)}. אשמח לקבל אותה כשמתאפשר 🙏`;
}
