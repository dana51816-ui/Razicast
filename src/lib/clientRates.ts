import type { AppData, Framework, FrameworkType, RateModel } from "./types";

/**
 * Client rates from Razi's sheet ("הכנסות": שם הלקוח + סכום), October 2026.
 *
 * Every amount in the app is before VAT. Rates the sheet gives "כולל מע״מ" are
 * converted at 18%; the sheet's own wording is kept in `notes`. Clients the sheet
 * gives no amount for ("אפילייט", "לפי טבלא", empty) get no number.
 */
export const RATES_IMPORT_ID = "client-rates-2026-10";

const VAT = 1.18;
const exVat = (incl: number) => Math.round((incl / VAT) * 100) / 100;

interface ClientRate {
  name: string;
  type: FrameworkType;
  model: RateModel | null;
  rate: number | null;
  /** The sheet's wording */
  sheet: string;
}

export const CLIENT_RATES: ClientRate[] = [
  { name: "דויד בן דוד · עסקי הכושר", type: "other", model: "fixed", rate: 3000, sheet: "3000+ מע״מ · פודקאסט" },
  { name: "חיים ודניאל · לבנות חיים", type: "other", model: "fixed", rate: 4000, sheet: "4000+ מע״מ · פודקאסט" },
  { name: "שרה גוטליב", type: "other", model: "fixed", rate: 3200, sheet: "3200+ מע״מ · פודקאסט" },
  { name: "מאיה · ללא פילטרים", type: "other", model: "fixed", rate: 2400, sheet: "2400+ מע״מ · פודקאסט (רק צילום)" },
  { name: "רופאה", type: "other", model: "fixed", rate: 700, sheet: "700+ מע״מ · פודקאסט אודיו" },
  { name: "פודקאסט ב־200", type: "other", model: "perPerson", rate: 200, sheet: "200 לאדם (מינימום 3)" },
  { name: "הבית להורות", type: "other", model: "fixed", rate: 5000, sheet: "5000+ מע״מ · דיגיטל" },
  { name: "אדרת · דולה", type: "other", model: "fixed", rate: 2800, sheet: "2800+ מע״מ · דיגיטל" },
  { name: "עפולה", type: "school", model: "perGroup", rate: 200, sheet: "200+ מע״מ לשיעור (6 ביום)" },
  { name: "אוסישקין", type: "school", model: "perGroup", rate: 200, sheet: "200+ מע״מ לשיעור (5 ביום)" },
  { name: "רונן · פתח תקווה", type: "school", model: "perGroup", rate: 250, sheet: "250+ מע״מ לשיעור (4 ביום)" },
  { name: "שירלי · ראשון לציון", type: "school", model: "perGroup", rate: 250, sheet: "250+ מע״מ לשיעור (4 ביום)" },
  { name: "ילדי הפלא", type: "wonderKids", model: "custom", rate: null, sheet: "תשלום לכלל המדריכים לפי טבלא" },
  { name: "אילאיל · משמר השבעה", type: "school", model: "perGroup", rate: exVat(200), sheet: "200 כולל מע״מ לשיעור (2 ביום)" },
  { name: "בית עמית", type: "school", model: "fixed", rate: exVat(3200), sheet: "3200 כולל מע״מ" },
  { name: "טל סונדק", type: "school", model: "perGroup", rate: exVat(150), sheet: "150 כולל מע״מ לשיעור" },
  { name: "יוסי · תיכון לאומנויות", type: "school", model: "perGroup", rate: 200, sheet: "200+ מע״מ לשיעור (4 ביום)" },
  { name: "קק״ל", type: "other", model: "fixed", rate: 900, sheet: "900+ מע״מ למפגש (מפגש ביום)" },
  { name: "חינוך ביתי", type: "school", model: null, rate: null, sheet: "לא צוין סכום" },
  { name: "גט קומפי", type: "other", model: "custom", rate: null, sheet: "אפילייט" },
  { name: "אלעד ויובל", type: "other", model: "custom", rate: null, sheet: "אפילייט" },
  { name: "PRINTIX", type: "other", model: "custom", rate: null, sheet: "אפילייט" },
  { name: "סנפיי בוקס", type: "other", model: "custom", rate: null, sheet: "אפילייט" },
];

/** Comparable form of a client name: no punctuation, quotes or extra spaces. */
const norm = (s: string) =>
  s
    .replace(/[״"׳'\-–·־.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

/** "אוסישקין" matches "בית ספר אוסישקין"; short names must match exactly. */
function sameClient(a: string, b: string) {
  const x = norm(a);
  const y = norm(b);
  if (x === y) return true;
  const [short, long] = x.length <= y.length ? [x, y] : [y, x];
  return short.length >= 4 && ` ${long} `.includes(` ${short} `);
}

/**
 * Applies the sheet's rates once per data set: updates the client if it exists
 * (by name), otherwise adds it. Never touches activities already saved.
 */
export function applyClientRates(data: AppData): AppData {
  if (data.settings.ratesImported === RATES_IMPORT_ID) return data;
  const frameworks = [...data.frameworks];
  const now = new Date().toISOString();
  CLIENT_RATES.forEach((c, i) => {
    const at = frameworks.findIndex((f) => sameClient(f.name, c.name));
    const terms = {
      clientBillingModel: c.model,
      clientRate: c.rate,
      notes: `מהגיליון: ${c.sheet}`,
    };
    if (at >= 0) {
      frameworks[at] = { ...frameworks[at], ...terms };
    } else {
      const f: Framework = {
        id: `client-${i + 1}`,
        name: c.name,
        type: c.type,
        defaultInstructorRate: null,
        origin: "user",
        createdAt: now,
        ...terms,
      };
      frameworks.push(f);
    }
  });
  return { ...data, frameworks, settings: { ...data.settings, ratesImported: RATES_IMPORT_ID } };
}
