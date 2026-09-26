/**
 * RAZICAST CONTROL — domain model.
 *
 * Rule that runs through everything: `null` means "not known". It is never
 * treated as 0, and nothing derived from it (profit, margin) is ever invented.
 */

export type MonthKey = `${number}-${number}`; // "2026-09"
export type ID = string;

/** Where a record came from — shown to the user so demo numbers are never mistaken for real ones. */
export type Origin = "brief" | "sample" | "user";

/** How money is counted, for both instructors and frameworks. */
export type RateModel = "perGroup" | "perHour" | "perDay" | "fixed" | "custom";

export interface Instructor {
  id: ID;
  name: string;
  phone: string | null;
  /** null = payment terms not set yet */
  paymentModel: RateModel | null;
  baseRate: number | null;
  /** Added once per travel unit on an activity */
  travelRate: number | null;
  /** null = not decided yet */
  requiresReceipt: boolean | null;
  notes?: string;
  origin: Origin;
  createdAt: string;
}

export type FrameworkType = "wonderKids" | "gefen" | "school" | "workshop" | "private" | "other";

export interface Framework {
  id: ID;
  name: string;
  type: FrameworkType;
  /** null = billing terms not set yet */
  clientBillingModel: RateModel | null;
  clientRate: number | null;
  /** Used only when the instructor has no rate of their own */
  defaultInstructorRate: number | null;
  notes?: string;
  origin: Origin;
  createdAt: string;
}

/** How a money value on an activity was obtained. */
export type AmountMode = "calculated" | "manual" | "missing";

export interface Amount {
  /** null = unknown */
  value: number | null;
  mode: AmountMode;
  /** Human-readable explanation, e.g. "₪250 × 6 · תעריף בית ספר אוסישקין" */
  source: string | null;
}

export interface Activity {
  id: ID;
  /** ISO date yyyy-mm-dd; the month is derived from it */
  date: string;
  instructorId: ID;
  /** null = framework / client not recorded */
  frameworkId: ID | null;
  quantity: number;
  /** Unit label as recorded (demo data keeps its original wording) */
  unitLabel: string;
  travelUnits: number;
  revenue: Amount;
  instructorPayment: Amount;
  /** Free-text label from the source data, e.g. "חוג" */
  label?: string;
  notes?: string;
  origin: Origin;
  createdAt: string;
}

export type ReceiptStatus = "missing" | "received";

/** Receipt tracking for one instructor in one month. */
export interface ReceiptRecord {
  instructorId: ID;
  month: MonthKey;
  status: ReceiptStatus;
  /** Last time a reminder message was prepared */
  remindedAt: string | null;
  updatedAt: string;
}

export interface MonthRecord {
  key: MonthKey;
  closedAt: string | null;
  /** Losses the owner reviewed and confirmed as correct: instructor ids */
  reviewedLosses: ID[];
}

export interface Settings {
  /** Business rule: do missing receipts block closing a month? */
  receiptsBlockClosing: boolean;
}

export interface AppData {
  version: 3;
  instructors: Instructor[];
  frameworks: Framework[];
  activities: Activity[];
  receipts: ReceiptRecord[];
  months: MonthRecord[];
  settings: Settings;
}
