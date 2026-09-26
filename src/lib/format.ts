const nf = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** ₪24,135 / -₪1,340 — prefix shekel, Latin digits, always LTR-safe via <Money>. */
export function formatILS(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}₪${nf.format(Math.abs(Math.round(value)))}`;
}

export function formatCompactILS(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1000) return `${sign}₪${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}K`;
  return formatILS(value);
}

export function formatPct(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatSignedPct(value: number, digits = 0): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${Math.abs(value).toFixed(digits)}%`;
}

const HE_MONTHS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];
const HE_MONTHS_SHORT = [
  "ינו׳", "פבר׳", "מרץ", "אפר׳", "מאי", "יוני",
  "יולי", "אוג׳", "ספט׳", "אוק׳", "נוב׳", "דצמ׳",
];
const HE_DAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

export function parseISODate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** "13 בספט׳" style short date */
export function formatDayMonth(iso: string): { day: string; month: string; monthShort: string; weekday: string } {
  const d = parseISODate(iso);
  return {
    day: String(d.getDate()),
    month: HE_MONTHS[d.getMonth()],
    monthShort: HE_MONTHS_SHORT[d.getMonth()],
    weekday: HE_DAYS[d.getDay()],
  };
}

export function formatShortDate(iso: string): string {
  const d = parseISODate(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** +₪3,403 / -₪1,340 */
export function signedILS(value: number): string {
  return `${value < 0 ? "-" : "+"}₪${nf.format(Math.abs(Math.round(value)))}`;
}

/** "2026-09" → "ספטמבר 2026" */
export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${HE_MONTHS[m - 1]} ${y}`;
}

/** "2026-09" → "ספטמבר" */
export function monthName(key: string): string {
  return HE_MONTHS[Number(key.split("-")[1]) - 1];
}

/** "2026-09" → "ספט׳" */
export function monthShort(key: string): string {
  return HE_MONTHS_SHORT[Number(key.split("-")[1]) - 1];
}

/** "2026-09-13" → "13.09" */
export function dayMonth(iso: string): string {
  const [, m, d] = iso.split("-");
  return `${Number(d)}.${m}`;
}
