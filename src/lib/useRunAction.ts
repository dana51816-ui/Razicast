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

/** wa.me link with the message ready, or null when there is no usable phone number. */
export function whatsappLink(phone: string | null, text: string): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `972${digits.slice(1)}`; // Israeli local → international
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/** Opens a link in a new tab from a real anchor, which phones allow inside a tap. */
export function openExternal(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
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
          const msg = reminderMessage(i.name, action.month, amount);
          const wa = whatsappLink(i.phone, msg);
          // Open WhatsApp first, inside the tap (later calls can be blocked as pop-ups)
          if (wa) openExternal(wa);
          const ok = await copyText(msg);
          store.markReminded(i.id, action.month);
          store.notify(
            wa
              ? `נפתח וואטסאפ עם הודעה ל${i.name}. ההודעה גם הועתקה`
              : ok
                ? `אין טלפון ל${i.name}, ההודעה הועתקה להדבקה`
                : "לא הצלחנו להעתיק. ההודעה מופיעה בכרטיס המדריך",
          );
          return;
        }
        case "openBackup":
          store.openFlow({ kind: "backup" });
          return;
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
