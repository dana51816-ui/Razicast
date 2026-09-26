"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { instructorById, monthName } from "@/lib/data";
import { formatILS } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { InstructorId, MonthKey } from "@/lib/types";
import { Button } from "../ui/Button";
import { InstructorAvatar } from "../ui/InstructorAvatar";
import { Sheet } from "../ui/Sheet";

export interface ReminderTarget {
  instructorId: InstructorId;
  month: MonthKey;
  amount: number;
}

export function buildReminder(t: ReminderTarget) {
  const name = instructorById(t.instructorId).name;
  return `היי ${name}, חסרה לנו הקבלה עבור פעילות חודש ${monthName(t.month)} בסך ${formatILS(
    t.amount,
  )}. אשמח לקבל אותה כשמתאפשר 🙏`;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for non-secure contexts (e.g. LAN preview on a phone)
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function ReminderModal({ target, onClose }: { target: ReminderTarget | null; onClose: () => void }) {
  const { notify } = useStore();
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (target) {
      setText(buildReminder(target));
      setCopied(false);
    }
  }, [target]);

  const copy = async () => {
    if (await copyText(text)) {
      setCopied(true);
      notify("ההודעה הועתקה");
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const inst = target ? instructorById(target.instructorId) : null;

  return (
    <Sheet
      open={!!target}
      onClose={onClose}
      title="יצירת תזכורת"
      subtitle="ההודעה מוכנה — אפשר לערוך לפני ההעתקה"
      footer={
        <div className="flex gap-2">
          <Button variant="primary" size="lg" className="flex-1" onClick={copy}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={copied ? "done" : "copy"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-2"
              >
                {copied ? <Check className="size-[18px]" strokeWidth={2.6} /> : <Copy className="size-[18px]" />}
                {copied ? "הועתק" : "העתקת ההודעה"}
              </motion.span>
            </AnimatePresence>
          </Button>
          <Button variant="secondary" size="lg" onClick={onClose}>
            סגירה
          </Button>
        </div>
      }
    >
      {inst && target && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] ring-1 ring-inset ring-white/[0.06] p-3">
            <InstructorAvatar id={inst.id} />
            <div className="flex-1 min-w-0">
              <div className="text-[14.5px] font-semibold">{inst.name}</div>
              <div className="text-[12.5px] text-fg-3">
                קבלה עבור {monthName(target.month)} · <span className="num">{inst.phone}</span>
              </div>
            </div>
            <span className="num text-[16px] font-semibold">{formatILS(target.amount)}</span>
          </div>

          <div className="relative">
            <div className="absolute -top-2 start-4 px-1.5 text-[11px] text-fg-3 bg-ink-800 rounded">תוכן ההודעה</div>
            <textarea
              aria-label="תוכן ההודעה"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-2xl bg-[#0f1a12] ring-1 ring-inset ring-pos/15 p-4 pt-5 text-[15px] leading-relaxed text-fg outline-none focus:ring-signal/40"
            />
          </div>
          <p className="text-[12px] text-fg-4">שליחה אוטומטית בוואטסאפ תתווסף בהמשך.</p>
        </div>
      )}
    </Sheet>
  );
}
