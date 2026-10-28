import type { AppData, Instructor } from "./types";

/**
 * Razi's team as sent on 28.10.2026: names only. No phone and no rates, so each one
 * starts as "חסר תעריף" until their terms are set.
 */
export const TEAM_IMPORT_ID = "team-2026-10";

export const TEAM = ["עידן אוקמפו", "ויקטוריה אבזוב", "צח שמעון", "טל אוזן", "מגלי", "רג׳ינה", "שירז"];

const norm = (s: string) => s.replace(/[׳'"״]/g, "").replace(/\s+/g, " ").trim();

/** Same person: same full name, or an existing one-word record that is part of it ("צח", "אוקמפו"). */
const samePerson = (existing: string, full: string) => {
  const e = norm(existing);
  const f = norm(full);
  return e === f || (!e.includes(" ") && f.split(" ").includes(e));
};

/** Adds the team once per data set; an existing match gets the full name instead of a duplicate. */
export function applyTeam(data: AppData): AppData {
  if (data.settings.teamImported === TEAM_IMPORT_ID) return data;
  const instructors = [...data.instructors];
  const now = new Date().toISOString();
  TEAM.forEach((name, i) => {
    const at = instructors.findIndex((x) => samePerson(x.name, name));
    if (at >= 0) {
      instructors[at] = { ...instructors[at], name };
      return;
    }
    const added: Instructor = {
      id: `team-${i + 1}`,
      name,
      phone: null,
      paymentModel: null,
      baseRate: null,
      travelRate: null,
      requiresReceipt: null,
      origin: "user",
      createdAt: now,
    };
    instructors.push(added);
  });
  return { ...data, instructors, settings: { ...data.settings, teamImported: TEAM_IMPORT_ID } };
}
