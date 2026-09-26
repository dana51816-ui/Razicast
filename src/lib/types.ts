export type MonthKey = "2026-07" | "2026-08" | "2026-09";

export type InstructorId =
  | "okampo"
  | "victoria"
  | "regina"
  | "tzah"
  | "razi"
  | "tair";

export interface Instructor {
  id: InstructorId;
  name: string;
  specialty: string;
  phone: string;
}

export type ActivityType =
  | "חוג"
  | "סדנה"
  | "יום פעילות"
  | "פעילות פרטית"
  | "השתלמות";

export type ActivityStatus = "complete" | "missing-info";

export interface Activity {
  id: string;
  month: MonthKey;
  /** ISO date, yyyy-mm-dd */
  date: string;
  instructorId: InstructorId;
  client: string | null;
  type: ActivityType;
  quantity: number;
  unit: string;
  /** null = revenue not entered yet. Never treated as 0. */
  revenue: number | null;
  payout: number;
  /** Human readable reason when status is missing-info */
  missing?: string;
}

export type ReceiptStatus = "received" | "missing" | "review";

export interface Receipt {
  id: string;
  month: MonthKey;
  instructorId: InstructorId;
  status: ReceiptStatus;
  receivedAt?: string;
}

/**
 * profit  — confirmed data shows a profit (or break-even)
 * loss    — confirmed data shows a real loss
 * missing — no activity has revenue entered, so no conclusion is possible
 */
export type ProfitState = "profit" | "loss" | "missing";

/**
 * Money totals for a set of activities.
 * revenue/payout are plain sums of what is known.
 * profit/margin are computed ONLY from activities whose revenue is entered;
 * activities with missing revenue are counted in pending* instead.
 */
export interface MonthTotals {
  revenue: number;
  payout: number;
  /** payout of activities that have revenue — the basis for profit */
  confirmedPayout: number;
  profit: number | null;
  margin: number | null;
  pendingCount: number;
  pendingPayout: number;
  state: ProfitState;
}

export interface InstructorSummary extends MonthTotals {
  instructor: Instructor;
  activities: number;
  receipt: ReceiptStatus;
}
