import { monthOf } from "./calc";
import { CLIENT_RATES, sameClient } from "./clientRates";
import type { AppData } from "./types";

/** True while any demo record is still in the data. */
export const hasDemo = (data: AppData) =>
  data.instructors.some((x) => x.origin !== "user") ||
  data.frameworks.some((x) => x.origin !== "user") ||
  data.activities.some((x) => x.origin !== "user");

/**
 * Removes the demo data once per data set. Keeps everything the user entered, the
 * clients from Razi's sheet, and any demo instructor or framework that a real activity
 * uses (it becomes the user's own). Months and receipts with nothing left go too.
 */
export function removeDemo(data: AppData): AppData {
  if (data.settings.demoRemoved) return data;
  const activities = data.activities.filter((a) => a.origin === "user");
  const usedInstructors = new Set(activities.map((a) => a.instructorId));
  const usedFrameworks = new Set(activities.map((a) => a.frameworkId));
  const fromSheet = (name: string) => CLIENT_RATES.some((c) => sameClient(c.name, name));

  const instructors = data.instructors
    .filter((i) => i.origin === "user" || usedInstructors.has(i.id))
    .map((i) => ({ ...i, origin: "user" as const }));
  const frameworks = data.frameworks
    .filter((f) => f.origin === "user" || usedFrameworks.has(f.id) || fromSheet(f.name))
    .map((f) => ({ ...f, origin: "user" as const }));

  const months = new Set(activities.map((a) => monthOf(a.date)));
  const keptInstructors = new Set(instructors.map((i) => i.id));
  const keptFrameworks = new Set(frameworks.map((f) => f.id));

  return {
    ...data,
    instructors,
    frameworks,
    activities,
    receipts: data.receipts.filter((r) => keptInstructors.has(r.instructorId) && months.has(r.month)),
    invoices: data.invoices?.filter((r) => keptFrameworks.has(r.frameworkId)),
    months: data.months.filter((m) => months.has(m.key)),
    settings: { ...data.settings, demoRemoved: true },
  };
}
