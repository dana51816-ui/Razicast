import { formatILS } from "./format";
import type {
  Activity,
  Amount,
  AppData,
  Framework,
  ID,
  Instructor,
  MonthKey,
  RateModel,
  ReceiptStatus,
} from "./types";

/* ───────────────────────── rate models ───────────────────────── */

export const RATE_MODELS: Record<RateModel, { label: string; per: string; plural: string; one: string; hint?: string }> = {
  perGroup: { label: "לפי קבוצה", per: "לקבוצה", plural: "קבוצות", one: "קבוצה" },
  perHour: { label: "לפי שעה", per: "לשעה", plural: "שעות", one: "שעה" },
  perDay: { label: "לפי יום", per: "ליום", plural: "ימים", one: "יום" },
  fixed: { label: "סכום קבוע", per: "לפעילות", plural: "יחידות", one: "פעילות", hint: "בלי קשר לכמות" },
  custom: { label: "אחר", per: "לפי הסכם", plural: "יחידות", one: "פעילות", hint: "מזינים סכום בכל פעילות" },
};

export const RATE_MODEL_ORDER: RateModel[] = ["perGroup", "perHour", "perDay", "fixed", "custom"];

export const FRAMEWORK_TYPES = {
  wonderKids: "ילדי הפלא",
  gefen: "גפן",
  school: "בית ספר",
  workshop: "סדנה",
  private: "פרטי",
  other: "אחר",
} as const;

export function rateLine(model: RateModel | null, rate: number | null): string | null {
  if (!model || rate === null) return model === "custom" ? RATE_MODELS.custom.per : null;
  return `${formatILS(rate)} ${RATE_MODELS[model].per}`;
}

/** An instructor has usable terms when a model is set and (unless custom) a rate. */
export function hasPaymentTerms(i: Instructor) {
  return i.paymentModel !== null && (i.paymentModel === "custom" || i.baseRate !== null);
}

/* ───────────────────────── the quote: how an activity is priced ───────────────────────── */

export interface QuoteInput {
  instructor: Instructor;
  framework: Framework | null;
  quantity: number;
  travelUnits: number;
}

export interface Quote {
  revenue: Amount;
  payment: Amount;
  /** Why a missing value is missing — shown next to the manual entry field */
  revenueGap: string | null;
  paymentGap: string | null;
  /** The unit the quantity is counted in */
  unitModel: RateModel | null;
  unitPlural: string;
}

const missing = (): Amount => ({ value: null, mode: "missing", source: null });

export function activityUnit(instructor: Instructor | null, framework: Framework | null): RateModel | null {
  const fromFramework = framework?.clientBillingModel;
  if (fromFramework && fromFramework !== "custom" && fromFramework !== "fixed") return fromFramework;
  const fromInstructor = instructor?.paymentModel;
  if (fromInstructor && fromInstructor !== "custom" && fromInstructor !== "fixed") return fromInstructor;
  return null;
}

export function unitPlural(model: RateModel | null) {
  return model ? RATE_MODELS[model].plural : "יחידות";
}

/**
 * Prices an activity from stored terms only. Anything that cannot be derived from
 * stored terms comes back as missing, with the reason — never as a guess.
 */
export function quoteActivity({ instructor, framework, quantity, travelUnits }: QuoteInput): Quote {
  const unitModel = activityUnit(instructor, framework);
  const q = quantity;

  /* revenue: framework billing × quantity */
  let revenue: Amount = missing();
  let revenueGap: string | null = null;
  if (!framework) {
    revenueGap = "לא נבחרה מסגרת";
  } else if (framework.clientBillingModel === null || (framework.clientBillingModel !== "custom" && framework.clientRate === null)) {
    revenueGap = `ל${framework.name} עדיין אין תעריף לקוח`;
  } else if (framework.clientBillingModel === "custom") {
    revenueGap = `התשלום של ${framework.name} לפי הסכם`;
  } else if (framework.clientBillingModel === "fixed") {
    revenue = {
      value: framework.clientRate!,
      mode: "calculated",
      source: `${formatILS(framework.clientRate!)} סכום קבוע · תעריף ${framework.name}`,
    };
  } else {
    revenue = {
      value: framework.clientRate! * q,
      mode: "calculated",
      source: `${formatILS(framework.clientRate!)} × ${q} · תעריף ${framework.name}`,
    };
  }

  /* payment: instructor terms × quantity (+ travel); else framework default; else missing */
  const travel = instructor.travelRate !== null && travelUnits > 0 ? instructor.travelRate * travelUnits : 0;
  const travelText =
    travel > 0
      ? ` + ${travelUnits > 1 ? `${formatILS(instructor.travelRate!)} × ${travelUnits}` : formatILS(instructor.travelRate!)} נסיעה`
      : "";

  let payment: Amount = missing();
  let paymentGap: string | null = null;
  const im = instructor.paymentModel;

  if (im && im !== "custom" && instructor.baseRate !== null) {
    if (im === "fixed") {
      payment = {
        value: instructor.baseRate + travel,
        mode: "calculated",
        source: `${formatILS(instructor.baseRate)} סכום קבוע${travelText} · תעריף ${instructor.name}`,
      };
    } else if (unitModel && unitModel !== im) {
      paymentGap = `התעריף של ${instructor.name} הוא ${RATE_MODELS[im].per}, והמסגרת מחויבת ${RATE_MODELS[unitModel].per}`;
    } else {
      payment = {
        value: instructor.baseRate * q + travel,
        mode: "calculated",
        source: `${formatILS(instructor.baseRate)} × ${q}${travelText} · תעריף ${instructor.name}`,
      };
    }
  } else if (im === "custom") {
    paymentGap = `התשלום ל${instructor.name} לפי הסכם`;
  } else if (framework && framework.defaultInstructorRate !== null && framework.clientBillingModel && framework.clientBillingModel !== "custom") {
    const base = framework.clientBillingModel === "fixed" ? framework.defaultInstructorRate : framework.defaultInstructorRate * q;
    payment = {
      value: base + travel,
      mode: "calculated",
      source: `${formatILS(framework.defaultInstructorRate)}${framework.clientBillingModel === "fixed" ? "" : ` × ${q}`}${travelText} · תעריף מדריך קבוע של ${framework.name}`,
    };
  } else {
    paymentGap = framework
      ? `ל${instructor.name} אין תעריף שמור, וגם ל${framework.name} אין תעריף מדריך קבוע`
      : `ל${instructor.name} אין תעריף שמור`;
  }

  return { revenue, payment, revenueGap, paymentGap, unitModel, unitPlural: unitPlural(unitModel) };
}

/* ───────────────────────── derived money ───────────────────────── */

export const monthOf = (isoDate: string) => isoDate.slice(0, 7) as MonthKey;

/** null when either side is unknown — an unknown profit, never zero and never a loss. */
export function activityProfit(a: Activity): number | null {
  const r = a.revenue.value;
  const p = a.instructorPayment.value;
  return r === null || p === null ? null : r - p;
}

export const isFinanciallyComplete = (a: Activity) =>
  a.revenue.value !== null && a.instructorPayment.value !== null;

export interface Totals {
  /** Sum of every known revenue value */
  revenue: number;
  /** Sum of every known payment value */
  payment: number;
  /** Profit from activities where both sides are known; null if there are none */
  profit: number | null;
  /** profit / confirmed revenue */
  margin: number | null;
  confirmedRevenue: number;
  confirmedPayment: number;
  count: number;
  confirmedCount: number;
  /** Activities with revenue or payment missing — kept out of profit */
  incomplete: { count: number; revenue: number; payment: number };
}

export function totalsOf(activities: Activity[]): Totals {
  let revenue = 0, payment = 0, cRev = 0, cPay = 0, cCount = 0;
  const inc = { count: 0, revenue: 0, payment: 0 };
  for (const a of activities) {
    const r = a.revenue.value;
    const p = a.instructorPayment.value;
    if (r !== null) revenue += r;
    if (p !== null) payment += p;
    if (r !== null && p !== null) {
      cRev += r;
      cPay += p;
      cCount += 1;
    } else {
      inc.count += 1;
      if (r !== null) inc.revenue += r;
      if (p !== null) inc.payment += p;
    }
  }
  const profit = cCount > 0 ? cRev - cPay : null;
  return {
    revenue,
    payment,
    profit,
    margin: profit !== null && cRev > 0 ? (profit / cRev) * 100 : null,
    confirmedRevenue: cRev,
    confirmedPayment: cPay,
    count: activities.length,
    confirmedCount: cCount,
    incomplete: inc,
  };
}

/* ───────────────────────── selectors ───────────────────────── */

export const activitiesIn = (data: AppData, month: MonthKey) =>
  data.activities.filter((a) => monthOf(a.date) === month);

export const instructorOf = (data: AppData, id: ID) => data.instructors.find((i) => i.id === id) ?? null;
export const frameworkOf = (data: AppData, id: ID | null) =>
  id ? data.frameworks.find((f) => f.id === id) ?? null : null;

/** Receipt status only exists when a receipt is required and there was work that month. */
export function receiptStatusOf(data: AppData, instructor: Instructor, month: MonthKey, hasActivity: boolean): ReceiptStatus | null {
  if (!instructor.requiresReceipt || !hasActivity) return null;
  return data.receipts.find((r) => r.instructorId === instructor.id && r.month === month)?.status ?? "missing";
}

export function receiptRecordOf(data: AppData, instructorId: ID, month: MonthKey) {
  return data.receipts.find((r) => r.instructorId === instructorId && r.month === month) ?? null;
}

/** Financial status — money only. */
export type FinancialStatus = "profit" | "loss" | "missing" | "idle";

export const FINANCIAL_LABEL: Record<FinancialStatus, string> = {
  profit: "רווחי",
  loss: "הפסדי",
  missing: "מידע חסר",
  idle: "אין פעילות",
};

/** Operational flags — facts about the work, kept apart from profitability. */
export type FlagKind = "receiptMissing" | "noRate" | "missingMoney" | "missingFramework";
export interface Flag {
  kind: FlagKind;
  label: string;
}

export interface InstructorMonth {
  instructor: Instructor;
  activities: Activity[];
  totals: Totals;
  financial: FinancialStatus;
  receipt: ReceiptStatus | null;
  flags: Flag[];
}

export function instructorMonth(data: AppData, instructor: Instructor, month: MonthKey): InstructorMonth {
  const activities = activitiesIn(data, month)
    .filter((a) => a.instructorId === instructor.id)
    .sort((a, b) => b.date.localeCompare(a.date));
  const totals = totalsOf(activities);
  const financial: FinancialStatus =
    activities.length === 0 ? "idle" : totals.profit === null ? "missing" : totals.profit < 0 ? "loss" : "profit";
  const receipt = receiptStatusOf(data, instructor, month, activities.length > 0);

  const flags: Flag[] = [];
  if (receipt === "missing") flags.push({ kind: "receiptMissing", label: "קבלה חסרה" });
  if (!hasPaymentTerms(instructor)) flags.push({ kind: "noRate", label: "חסר תעריף" });
  if (totals.incomplete.count > 0 && financial !== "missing")
    flags.push({ kind: "missingMoney", label: `מידע כספי חסר ב־${totals.incomplete.count}` });
  if (activities.some((a) => a.frameworkId === null)) flags.push({ kind: "missingFramework", label: "חסרה מסגרת" });

  return { instructor, activities, totals, financial, receipt, flags };
}

const FIN_ORDER: Record<FinancialStatus, number> = { profit: 0, loss: 1, missing: 2, idle: 3 };

export function teamMonth(data: AppData, month: MonthKey): InstructorMonth[] {
  return data.instructors
    .map((i) => instructorMonth(data, i, month))
    .sort(
      (a, b) =>
        FIN_ORDER[a.financial] - FIN_ORDER[b.financial] ||
        (b.totals.profit ?? 0) - (a.totals.profit ?? 0) ||
        b.totals.revenue - a.totals.revenue,
    );
}

/** Months that exist in the data, newest first. */
export function knownMonths(data: AppData): MonthKey[] {
  const set = new Set<MonthKey>(data.months.map((m) => m.key));
  for (const a of data.activities) set.add(monthOf(a.date));
  return [...set].sort().reverse();
}

export function previousMonthKey(month: MonthKey): MonthKey {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` as MonthKey;
}

export function lastMonths(month: MonthKey, n: number): MonthKey[] {
  const out: MonthKey[] = [month];
  while (out.length < n) out.unshift(previousMonthKey(out[0]));
  return out;
}

export const isClosed = (data: AppData, month: MonthKey) =>
  !!data.months.find((m) => m.key === month)?.closedAt;
