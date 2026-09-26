import type { Activity, AppData, Framework, FrameworkType, ID, Instructor, Origin, ReceiptRecord } from "./types";

/**
 * DEMO DATA
 *
 * origin "brief"  — taken from the product brief: the six instructor names, the
 *                   September per-instructor revenue/payment totals, and 3 of 6
 *                   receipts missing.
 * origin "sample" — invented only so the app has something to show: how September's
 *                   totals break into individual activities (dates, clients,
 *                   quantities), the frameworks' names, and all of July/August.
 *
 * Deliberately NOT invented: any payment rate or client rate. The brief gives none,
 * so every demo instructor and framework starts with rates = null ("חסר תעריף").
 * The brief's September payments (₪12,888) exceed the five instructors it lists
 * by ₪380; that amount is תאיר's, with revenue not stated → stored as missing.
 */

const T0 = "2026-09-01T08:00:00.000Z";

function instructor(id: ID, name: string, phone: string): Instructor {
  return {
    id,
    name,
    phone,
    paymentModel: null,
    baseRate: null,
    travelRate: null,
    requiresReceipt: true,
    origin: "brief",
    createdAt: T0,
  };
}

function framework(id: ID, name: string, type: FrameworkType, origin: Origin = "sample"): Framework {
  return {
    id,
    name,
    type,
    clientBillingModel: null,
    clientRate: null,
    defaultInstructorRate: null,
    origin,
    createdAt: T0,
  };
}

let seq = 0;
function act(
  date: string,
  instructorId: ID,
  frameworkId: ID | null,
  label: string,
  quantity: number,
  unitLabel: string,
  revenue: number | null,
  payment: number,
  origin: Origin,
): Activity {
  seq += 1;
  return {
    id: `seed-${seq}`,
    date,
    instructorId,
    frameworkId,
    quantity,
    unitLabel,
    travelUnits: 0,
    label,
    revenue:
      revenue === null
        ? { value: null, mode: "missing", source: null }
        : { value: revenue, mode: "manual", source: "נתון דמו" },
    instructorPayment: { value: payment, mode: "manual", source: "נתון דמו" },
    origin,
    createdAt: T0,
  };
}

const B: Origin = "brief";
const S: Origin = "sample";

export function createSeed(): AppData {
  seq = 0;
  const instructors = [
    instructor("okampo", "אוקמפו", "050-712-3304"),
    instructor("victoria", "ויקטוריה", "052-448-9120"),
    instructor("regina", "רג׳ינה", "054-301-7765"),
    instructor("tzah", "צח", "050-993-1142"),
    instructor("razi", "רזי", "052-600-0019"),
    instructor("tair", "תאיר", "053-270-4481"),
  ];

  const frameworks = [
    framework("wonder", "ילדי הפלא", "wonderKids", B),
    framework("gefen", "גפן", "gefen", B),
    framework("hadar", "בית ספר הדר", "school"),
    framework("alon", "בית ספר אלון", "school"),
    framework("neve", "מתנ״ס נווה עוז", "other"),
    framework("nitzanim", "צהרון ניצנים", "other"),
    framework("galim", "קייטנת גלים", "other"),
    framework("bday", "פעילות פרטית · יום הולדת", "private"),
    framework("corp", "פעילות פרטית · אירוע חברה", "private"),
    framework("barmitzva", "פעילות פרטית · בר מצווה", "private"),
  ];

  const activities = [
    // September — per-instructor totals from the brief; breakdown is sample
    act("2026-09-02", "okampo", "wonder", "חוג", 4, "מפגשים", 1840, 960, B),
    act("2026-09-07", "okampo", "gefen", "סדנה", 1, "סדנה", 1450, 700, B),
    act("2026-09-13", "okampo", "hadar", "יום פעילות", 2, "כיתות", 1600, 850, B),
    act("2026-09-20", "okampo", "bday", "פעילות פרטית", 1, "אירוע", 1200, 560, B),
    act("2026-09-23", "okampo", "wonder", "חוג", 2, "מפגשים", 863, 480, B),
    act("2026-09-01", "victoria", "gefen", "חוג", 4, "מפגשים", 1720, 1120, B),
    act("2026-09-08", "victoria", "neve", "סדנה", 1, "סדנה", 1380, 900, B),
    act("2026-09-15", "victoria", "alon", "יום פעילות", 3, "כיתות", 1967, 1254, B),
    act("2026-09-22", "victoria", "gefen", "חוג", 2, "מפגשים", 1000, 700, B),
    act("2026-09-04", "regina", "nitzanim", "חוג", 3, "מפגשים", 1203, 806, B),
    act("2026-09-18", "regina", null, "סדנה", 1, "סדנה", 800, 540, B),
    act("2026-09-10", "tzah", "hadar", "סדנה", 2, "סדנאות", 520, 1120, B),
    act("2026-09-17", "tzah", "wonder", "חוג", 4, "מפגשים", 380, 1120, B),
    act("2026-09-03", "razi", "gefen", "השתלמות", 1, "השתלמות", 3200, 400, B),
    act("2026-09-11", "razi", "alon", "יום פעילות", 4, "כיתות", 2612, 498, B),
    act("2026-09-21", "razi", "corp", "פעילות פרטית", 1, "אירוע", 2400, 500, B),
    act("2026-09-13", "tair", "hadar", "סדנה", 1, "סדנה", null, 380, B),

    // August — sample
    act("2026-08-05", "okampo", "wonder", "חוג", 6, "מפגשים", 2780, 1760, S),
    act("2026-08-19", "okampo", "gefen", "סדנה", 2, "סדנאות", 2720, 1420, S),
    act("2026-08-06", "victoria", "gefen", "חוג", 5, "מפגשים", 2980, 1960, S),
    act("2026-08-21", "victoria", "neve", "יום פעילות", 2, "קבוצות", 2500, 1640, S),
    act("2026-08-12", "regina", "nitzanim", "חוג", 4, "מפגשים", 1450, 780, S),
    act("2026-08-26", "regina", "barmitzva", "פעילות פרטית", 1, "אירוע", 1200, 640, S),
    act("2026-08-14", "tzah", "hadar", "סדנה", 3, "סדנאות", 1900, 1650, S),
    act("2026-08-04", "razi", "gefen", "השתלמות", 1, "השתלמות", 3000, 550, S),
    act("2026-08-27", "razi", "corp", "פעילות פרטית", 1, "אירוע", 2400, 500, S),
    act("2026-08-19", "tair", "gefen", "סדנה", 1, "סדנה", 620, 300, S),

    // July — sample
    act("2026-07-03", "okampo", "wonder", "חוג", 5, "מפגשים", 2800, 1500, S),
    act("2026-07-17", "okampo", "galim", "יום פעילות", 2, "קבוצות", 2500, 1400, S),
    act("2026-07-08", "victoria", "gefen", "חוג", 4, "מפגשים", 2700, 1800, S),
    act("2026-07-22", "victoria", "galim", "יום פעילות", 2, "קבוצות", 2400, 1550, S),
    act("2026-07-15", "regina", "nitzanim", "חוג", 4, "מפגשים", 2400, 1300, S),
    act("2026-07-09", "tzah", "hadar", "סדנה", 2, "סדנאות", 1300, 800, S),
    act("2026-07-24", "tzah", "galim", "יום פעילות", 1, "קבוצה", 1000, 700, S),
    act("2026-07-11", "razi", "gefen", "השתלמות", 2, "השתלמויות", 4700, 900, S),
  ];

  const receipt = (instructorId: ID, month: `${number}-${number}`, status: "missing" | "received"): ReceiptRecord => ({
    instructorId,
    month,
    status,
    remindedAt: null,
    updatedAt: T0,
  });

  const receipts: ReceiptRecord[] = [
    receipt("okampo", "2026-09", "received"),
    receipt("victoria", "2026-09", "received"),
    receipt("razi", "2026-09", "received"),
    receipt("regina", "2026-09", "missing"),
    receipt("tzah", "2026-09", "missing"),
    receipt("tair", "2026-09", "missing"),
    ...["okampo", "victoria", "regina", "tzah", "razi", "tair"].map((id) => receipt(id, "2026-08", "received")),
    ...["okampo", "victoria", "regina", "tzah", "razi"].map((id) => receipt(id, "2026-07", "received")),
  ];

  return {
    version: 3,
    instructors,
    frameworks,
    activities,
    receipts,
    months: [
      { key: "2026-07", closedAt: "2026-08-02T10:00:00.000Z", reviewedLosses: [] },
      { key: "2026-08", closedAt: "2026-09-03T10:00:00.000Z", reviewedLosses: [] },
      { key: "2026-09", closedAt: null, reviewedLosses: [] },
    ],
    settings: { receiptsBlockClosing: false },
  };
}
