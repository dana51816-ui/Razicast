import type {
  Activity,
  ActivityType,
  Instructor,
  InstructorId,
  MonthKey,
  Receipt,
} from "./types";

export const CURRENT_MONTH: MonthKey = "2026-09";

export const MONTHS: { key: MonthKey; label: string; short: string }[] = [
  { key: "2026-09", label: "ספטמבר 2026", short: "ספט׳" },
  { key: "2026-08", label: "אוגוסט 2026", short: "אוג׳" },
  { key: "2026-07", label: "יולי 2026", short: "יולי" },
];

export const monthLabel = (m: MonthKey) =>
  MONTHS.find((x) => x.key === m)?.label ?? m;
export const monthName = (m: MonthKey) => monthLabel(m).split(" ")[0];

export const INSTRUCTORS: Instructor[] = [
  { id: "okampo", name: "אוקמפו", role: "lead", specialty: "חוגים וסדנאות", phone: "050-712-3304" },
  { id: "victoria", name: "ויקטוריה", role: "lead", specialty: "מסגרות חינוך", phone: "052-448-9120" },
  { id: "regina", name: "רג׳ינה", role: "lead", specialty: "צהרונים", phone: "054-301-7765" },
  { id: "tzah", name: "צח", role: "lead", specialty: "בתי ספר", phone: "050-993-1142" },
  { id: "razi", name: "רזי", role: "lead", specialty: "השתלמויות ואירועים", phone: "052-600-0019" },
  { id: "tair", name: "תאיר", role: "support", specialty: "מדריכה מלווה", phone: "053-270-4481" },
];

export const instructorById = (id: InstructorId) =>
  INSTRUCTORS.find((i) => i.id === id)!;

export const ACTIVITY_TYPES: ActivityType[] = [
  "חוג",
  "סדנה",
  "יום פעילות",
  "פעילות פרטית",
  "השתלמות",
  "ליווי",
];

export const CLIENTS = [
  "ילדי הפלא",
  "גפן",
  "בית ספר הדר",
  "בית ספר אלון",
  "מתנ״ס נווה עוז",
  "צהרון ניצנים",
  "פעילות פרטית",
];

let seq = 0;
function act(
  month: MonthKey,
  day: number,
  instructorId: InstructorId,
  client: string | null,
  type: ActivityType,
  quantity: number,
  unit: string,
  revenue: number | null,
  payout: number,
  missing?: string,
): Activity {
  seq += 1;
  return {
    id: `a-${seq}`,
    month,
    date: `${month}-${String(day).padStart(2, "0")}`,
    instructorId,
    client,
    type,
    quantity,
    unit,
    revenue,
    payout,
    missing,
  };
}

export const ACTIVITIES: Activity[] = [
  // ספטמבר 2026
  act("2026-09", 2, "okampo", "ילדי הפלא", "חוג", 4, "מפגשים", 1840, 960),
  act("2026-09", 7, "okampo", "גפן", "סדנה", 1, "סדנה", 1450, 700),
  act("2026-09", 13, "okampo", "בית ספר הדר", "יום פעילות", 2, "כיתות", 1600, 850),
  act("2026-09", 20, "okampo", "פעילות פרטית · יום הולדת", "פעילות פרטית", 1, "אירוע", 1200, 560),
  act("2026-09", 23, "okampo", "ילדי הפלא", "חוג", 2, "מפגשים", 863, 480),
  act("2026-09", 1, "victoria", "גפן", "חוג", 4, "מפגשים", 1720, 1120),
  act("2026-09", 8, "victoria", "מתנ״ס נווה עוז", "סדנה", 1, "סדנה", 1380, 900),
  act("2026-09", 15, "victoria", "בית ספר אלון", "יום פעילות", 3, "כיתות", 1967, 1254),
  act("2026-09", 22, "victoria", "גפן", "חוג", 2, "מפגשים", 1000, 700),
  act("2026-09", 4, "regina", "צהרון ניצנים", "חוג", 3, "מפגשים", 1203, 806),
  act("2026-09", 18, "regina", null, "סדנה", 1, "סדנה", 800, 540, "חסר שם לקוח"),
  act("2026-09", 10, "tzah", "בית ספר הדר", "סדנה", 2, "סדנאות", 900, 1120),
  act("2026-09", 17, "tzah", "ילדי הפלא", "חוג", 4, "מפגשים", null, 1120, "חסר סכום הכנסה"),
  act("2026-09", 3, "razi", "גפן", "השתלמות", 1, "השתלמות צוות", 3200, 400),
  act("2026-09", 11, "razi", "בית ספר אלון", "יום פעילות", 4, "כיתות", 2612, 498),
  act("2026-09", 21, "razi", "פעילות פרטית · אירוע חברה", "פעילות פרטית", 1, "אירוע", 2400, 500),
  act("2026-09", 13, "tair", "בית ספר הדר", "ליווי", 2, "כיתות", 0, 380),

  // אוגוסט 2026
  act("2026-08", 5, "okampo", "ילדי הפלא", "חוג", 6, "מפגשים", 3400, 1760),
  act("2026-08", 19, "okampo", "גפן", "סדנה", 2, "סדנאות", 2720, 1420),
  act("2026-08", 6, "victoria", "גפן", "חוג", 5, "מפגשים", 2980, 1960),
  act("2026-08", 21, "victoria", "מתנ״ס נווה עוז", "יום פעילות", 2, "קבוצות", 2500, 1640),
  act("2026-08", 12, "regina", "צהרון ניצנים", "חוג", 4, "מפגשים", 1450, 780),
  act("2026-08", 26, "regina", "פעילות פרטית · בר מצווה", "פעילות פרטית", 1, "אירוע", 1200, 640),
  act("2026-08", 14, "tzah", "בית ספר הדר", "סדנה", 3, "סדנאות", 1900, 1650),
  act("2026-08", 4, "razi", "גפן", "השתלמות", 1, "השתלמות צוות", 3000, 550),
  act("2026-08", 27, "razi", "פעילות פרטית · אירוע חברה", "פעילות פרטית", 1, "אירוע", 2400, 500),
  act("2026-08", 19, "tair", "גפן", "ליווי", 2, "סדנאות", 0, 300),

  // יולי 2026
  act("2026-07", 3, "okampo", "ילדי הפלא", "חוג", 5, "מפגשים", 2800, 1500),
  act("2026-07", 17, "okampo", "קייטנת גלים", "יום פעילות", 2, "קבוצות", 2500, 1400),
  act("2026-07", 8, "victoria", "גפן", "חוג", 4, "מפגשים", 2700, 1800),
  act("2026-07", 22, "victoria", "קייטנת גלים", "יום פעילות", 2, "קבוצות", 2400, 1550),
  act("2026-07", 15, "regina", "צהרון ניצנים", "חוג", 4, "מפגשים", 2400, 1300),
  act("2026-07", 9, "tzah", "בית ספר הדר", "סדנה", 2, "סדנאות", 1300, 800),
  act("2026-07", 24, "tzah", "קייטנת גלים", "יום פעילות", 1, "קבוצה", 1000, 700),
  act("2026-07", 11, "razi", "גפן", "השתלמות", 2, "השתלמויות", 4700, 900),
];

export const RECEIPTS: Receipt[] = [
  { id: "r-9-okampo", month: "2026-09", instructorId: "okampo", status: "received", receivedAt: "2026-09-24" },
  { id: "r-9-victoria", month: "2026-09", instructorId: "victoria", status: "received", receivedAt: "2026-09-23" },
  { id: "r-9-regina", month: "2026-09", instructorId: "regina", status: "missing" },
  { id: "r-9-tzah", month: "2026-09", instructorId: "tzah", status: "missing" },
  { id: "r-9-razi", month: "2026-09", instructorId: "razi", status: "received", receivedAt: "2026-09-22" },
  { id: "r-9-tair", month: "2026-09", instructorId: "tair", status: "missing" },

  { id: "r-8-okampo", month: "2026-08", instructorId: "okampo", status: "received", receivedAt: "2026-08-30" },
  { id: "r-8-victoria", month: "2026-08", instructorId: "victoria", status: "received", receivedAt: "2026-08-31" },
  { id: "r-8-regina", month: "2026-08", instructorId: "regina", status: "review", receivedAt: "2026-09-02" },
  { id: "r-8-tzah", month: "2026-08", instructorId: "tzah", status: "received", receivedAt: "2026-08-29" },
  { id: "r-8-razi", month: "2026-08", instructorId: "razi", status: "received", receivedAt: "2026-08-28" },
  { id: "r-8-tair", month: "2026-08", instructorId: "tair", status: "received", receivedAt: "2026-08-31" },

  { id: "r-7-okampo", month: "2026-07", instructorId: "okampo", status: "received", receivedAt: "2026-07-30" },
  { id: "r-7-victoria", month: "2026-07", instructorId: "victoria", status: "received", receivedAt: "2026-07-31" },
  { id: "r-7-regina", month: "2026-07", instructorId: "regina", status: "received", receivedAt: "2026-07-29" },
  { id: "r-7-tzah", month: "2026-07", instructorId: "tzah", status: "received", receivedAt: "2026-07-31" },
  { id: "r-7-razi", month: "2026-07", instructorId: "razi", status: "received", receivedAt: "2026-07-28" },
];

/** Aggregates for months before the activity log starts — used by trend chart only. */
export const HISTORY: { month: string; label: string; revenue: number; payout: number }[] = [
  { month: "2026-04", label: "אפר׳", revenue: 17200, payout: 9100 },
  { month: "2026-05", label: "מאי", revenue: 18650, payout: 9700 },
  { month: "2026-06", label: "יוני", revenue: 20400, payout: 10600 },
];

export const CLOSED_MONTHS: MonthKey[] = ["2026-07", "2026-08"];
