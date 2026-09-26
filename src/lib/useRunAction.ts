"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { reminderMessage, type IssueAction } from "./audit";
import { instructorMonth } from "./calc";
import { useStore } from "./store";

/** Copies text inside a user gesture; falls back to a hidden textarea where the Clipboard API is refused. */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** Runs any issue action — the single place where "what can I do now" becomes a change. */
export function useRunAction() {
  const store = useStore();
  const router = useRouter();
  const { data } = store;

  return useCallback(
    async (action: IssueAction) => {
      switch (action.type) {
        case "resolveActivity":
          store.openFlow({ kind: "resolve", activityId: action.activityId });
          return;
        case "editTerms":
          store.openFlow({ kind: "instructor", editId: action.instructorId });
          return;
        case "openInstructor":
          router.push(`/instructor?id=${action.instructorId}`);
          return;
        case "goto":
          router.push(action.href);
          return;
        case "remind": {
          const i = data.instructors.find((x) => x.id === action.instructorId);
          if (!i) return;
          const amount = instructorMonth(data, i, action.month).totals.payment;
          const ok = await copyText(reminderMessage(i.name, action.month, amount));
          store.markReminded(i.id, action.month);
          store.notify(ok ? `התזכורת ל${i.name} הועתקה, אפשר להדביק בוואטסאפ` : "לא הצלחנו להעתיק. ההודעה מופיעה בכרטיס המדריך");
          return;
        }
        case "markReceived": {
          const i = data.instructors.find((x) => x.id === action.instructorId);
          store.setReceipt(action.instructorId, action.month, "received");
          store.notify(`הקבלה של ${i?.name ?? "המדריך"} סומנה כהתקבלה`);
          return;
        }
        case "ackLoss": {
          const i = data.instructors.find((x) => x.id === action.instructorId);
          store.ackLoss(action.instructorId, action.month, true);
          store.notify(`ההפסד של ${i?.name ?? "המדריך"} סומן כנבדק`);
          return;
        }
      }
    },
    [store, router, data],
  );
}
