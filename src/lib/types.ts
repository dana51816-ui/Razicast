export type MonthKey = "2026-07" | "2026-08" | "2026-09";

export type InstructorId =
  | "okampo"
  | "victoria"
  | "regina"
  | "tzah"
  | "razi"
  | "tair";

export type InstructorRole = "lead" | "support";

export interface Instructor {
  id: InstructorId;
  name: string;
  role: InstructorRole;
  specialty: string;
  phone: string;
}

export type ActivityType =
  | "חוג"
  | "סדנה"
  | "יום פעילות"
  | "פעילות פרטית"
  | "השתלמות"
  | "ליווי";

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

export interface InstructorSummary {
  instructor: Instructor;
  revenue: number;
  payout: number;
  profit: number;
  /** null for support instructors without direct revenue */
  margin: number | null;
  activities: number;
  receipt: ReceiptStatus;
}

export interface MonthTotals {
  revenue: number;
  payout: number;
  profit: number;
  margin: number;
}
