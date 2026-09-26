"use client";

import { useRef, useState } from "react";
import { FRAMEWORK_TYPES, RATE_MODEL_ORDER, RATE_MODELS, rateLine } from "@/lib/calc";
import { formatILS } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Framework, FrameworkType, RateModel } from "@/lib/types";
import { IconNext } from "../shell/icons";
import { Split } from "../ui/Split";
import { cn } from "../ui/cn";
import { AmountInput, ChoiceList, DoneMark, FlowFrame, PrimaryButton, ReviewRow, StepTitle, TextField } from "./parts";

type Step = "name" | "type" | "billing" | "rate" | "default" | "review" | "done";
const ORDER: Step[] = ["name", "type", "billing", "rate", "default", "review"];

export function FrameworkFlow({
  editId,
  onClose,
  onSaved,
}: {
  editId?: string;
  onClose: () => void;
  /** When embedded in the activity flow: hand back the new framework */
  onSaved?: (f: Framework) => void;
}) {
  const { data, addFramework, updateFramework, openFlow, notify } = useStore();
  const existing = editId ? data.frameworks.find((f) => f.id === editId) ?? null : null;

  const [step, setStep] = useState<Step>(existing ? "review" : "name");
  const [name, setName] = useState(existing?.name ?? "");
  const [type, setType] = useState<FrameworkType | null>(existing?.type ?? null);
  const [billing, setBilling] = useState<RateModel | null>(existing?.clientBillingModel ?? null);
  const [rate, setRate] = useState(existing?.clientRate != null ? String(existing.clientRate) : "");
  const [defOn, setDefOn] = useState(existing?.defaultInstructorRate != null);
  const [defRate, setDefRate] = useState(existing?.defaultInstructorRate != null ? String(existing.defaultInstructorRate) : "");
  const [saved, setSaved] = useState<Framework | null>(null);

  const reachedReview = useRef(!!existing);
  if (step === "review") reachedReview.current = true;

  const custom = billing === "custom";
  const steps = ORDER.filter((s) => !(custom && (s === "rate" || s === "default")));
  const idx = steps.indexOf(step === "done" ? "review" : step);
  const go = (s: Step) => setStep(s);
  const advanceFrom = (s: Step) => {
    if (reachedReview.current) return go("review");
    const order = ORDER.filter((x) => !(billing === "custom" && (x === "rate" || x === "default")));
    go(order[order.indexOf(s) + 1] ?? "review");
  };
  const back = existing
    ? step !== "review" && step !== "done"
      ? () => go("review")
      : undefined
    : idx > 0 && step !== "done"
      ? () => go(steps[idx - 1])
      : undefined;

  const per = billing ? RATE_MODELS[billing].per : "";
  const crate = Number(rate) || 0;
  const drate = Number(defRate) || 0;
  const withDefault = defOn && defRate !== "" && !custom;

  const values = (): Omit<Framework, "id" | "createdAt" | "origin"> => ({
    name: name.trim(),
    type: type ?? "other",
    clientBillingModel: billing,
    clientRate: !custom && rate !== "" ? Number(rate) : null,
    defaultInstructorRate: withDefault ? Number(defRate) : null,
  });

  const save = () => {
    if (existing) {
      updateFramework(existing.id, values());
      notify(`${name.trim()} עודכנה`);
      onClose();
      return;
    }
    const created = addFramework(values());
    if (onSaved) onSaved(created);
    else {
      setSaved(created);
      go("done");
    }
  };

  return (
    <FlowFrame step={step === "done" ? steps.length : idx} steps={steps.length} onBack={back} onClose={onClose} stepKey={step}>
      {step === "name" && (
        <>
          <StepTitle eyebrow="מסגרת חדשה" title="איך קוראים למסגרת?" />
          <TextField label="שם המסגרת או הלקוח" value={name} onChange={setName} autoFocus />
          <PrimaryButton className="mt-8" disabled={!name.trim()} onClick={() => advanceFrom("name")}>
            המשך
          </PrimaryButton>
        </>
      )}

      {step === "type" && (
        <>
          <StepTitle eyebrow="מסגרת חדשה" title="איזה סוג?" />
          <div className="grid grid-cols-2 gap-2" role="radiogroup">
            {(Object.keys(FRAMEWORK_TYPES) as FrameworkType[]).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={type === t}
                onClick={() => {
                  setType(t);
                  setTimeout(() => advanceFrom("type"), 200);
                }}
                className={cn(
                  "h-[72px] rounded-[18px] text-[18px] font-bold transition-colors",
                  type === t ? "bg-cobalt text-white" : "bg-paper",
                )}
              >
                {FRAMEWORK_TYPES[t]}
              </button>
            ))}
          </div>
        </>
      )}

      {step === "billing" && (
        <>
          <StepTitle eyebrow="מסגרת חדשה" title="איך הלקוח משלם?" />
          <ChoiceList
            value={billing}
            onPick={(v) => {
              setBilling(v);
              setTimeout(() => go(reachedReview.current ? "review" : v === "custom" ? "review" : "rate"), 200);
            }}
            options={RATE_MODEL_ORDER.map((m) => ({ value: m, label: RATE_MODELS[m].label, hint: RATE_MODELS[m].hint }))}
          />
        </>
      )}

      {step === "rate" && (
        <>
          <StepTitle eyebrow="מסגרת חדשה" title="כמה הלקוח משלם?" />
          <AmountInput label={`תעריף לקוח ${per}`} value={rate} onChange={setRate} suffix={per} tone="cobalt" autoFocus />
          <p className="mt-3 text-[13px] text-ink-2">זה הסכום שייכנס לחברה על כל פעילות כאן, ויופיע אוטומטית בפעילויות.</p>
          <PrimaryButton className="mt-6" disabled={rate === ""} onClick={() => advanceFrom("rate")}>
            המשך
          </PrimaryButton>
        </>
      )}

      {step === "default" && (
        <>
          <StepTitle
            eyebrow="מסגרת חדשה · לא חובה"
            title="תעריף מדריך קבוע למסגרת?"
            hint="בשימוש רק כשלמדריך אין תעריף משלו. בלי זה, כל מדריך מקבל את התעריף האישי שלו."
          />
          {defOn ? (
            <>
              <AmountInput label={`תשלום למדריך ${per}`} value={defRate} onChange={setDefRate} suffix={per} autoFocus />
              <PrimaryButton className="mt-6" disabled={defRate === ""} onClick={() => go("review")}>
                המשך
              </PrimaryButton>
              <button type="button" onClick={() => setDefOn(false)} className="mt-2 w-full h-11 text-[15px] font-semibold text-ink-2">
                בלי תעריף קבוע
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setDefRate("");
                  go("review");
                }}
                className="h-16 rounded-[18px] bg-ink text-white text-[17px] font-bold"
              >
                בלי. לפי התעריף של כל מדריך
              </button>
              <button type="button" onClick={() => setDefOn(true)} className="h-16 rounded-[18px] border-[1.5px] border-dashed border-ink text-[17px] font-bold">
                + להגדיר תעריף קבוע
              </button>
            </div>
          )}
        </>
      )}

      {step === "review" && (
        <>
          <div className="text-[13px] font-semibold text-ink-2">{existing ? "פרטי מסגרת" : "בדיקה אחרונה"}</div>
          <button type="button" onClick={() => go("name")} className="block mt-1.5 text-start">
            <span className="display block text-[50px] leading-[0.9]">{name.trim() || "ללא שם"}</span>
            <span className="block text-[15px] text-ink-2">{type ? FRAMEWORK_TYPES[type] : "סוג לא נבחר"}</span>
          </button>

          {!custom && crate > 0 && (
            <div className="mt-6">
              <div className="text-[14px] font-semibold">על כל {billing ? RATE_MODELS[billing].one : "פעילות"}</div>
              {withDefault ? (
                <>
                  <Split revenue={crate} payment={drate} height={40} className="mt-2" />
                  <div className="mt-1.5 flex justify-between text-[13px]">
                    <span className="text-sand-ink">
                      למדריך <b className="num">{formatILS(drate)}</b>
                    </span>
                    <span className={drate > crate ? "text-loss-ink" : "text-cobalt"}>
                      {drate > crate ? "הפסד" : "לחברה"} <b className="num">{formatILS(Math.abs(crate - drate))}</b>
                    </span>
                  </div>
                </>
              ) : (
                <div className="mt-2 h-10 rounded-[10px] border-[1.5px] border-dashed border-ink grid place-items-center text-[13px] font-semibold">
                  <span>
                    <span className="num">{formatILS(crate)}</span> מהלקוח · החלוקה לפי המדריך
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="mt-5 rounded-[22px] bg-paper px-5 py-1">
            <ReviewRow label="הלקוח משלם" onEdit={() => go("billing")} missing={!billing || (!custom && !rate)}>
              {billing ? (custom ? RATE_MODELS.custom.per : rate ? rateLine(billing, Number(rate)) : "חסר תעריף") : "לא הוגדר"}
            </ReviewRow>
            {!custom && (
              <ReviewRow label="תשלום למדריך" onEdit={() => go("default")}>
                {withDefault ? rateLine(billing, drate) : "לפי תעריף המדריך"}
              </ReviewRow>
            )}
            <ReviewRow label="סוג" onEdit={() => go("type")} missing={!type}>
              {type ? FRAMEWORK_TYPES[type] : "לא נבחר"}
            </ReviewRow>
          </div>
          <PrimaryButton tone="cobalt" className="mt-6" disabled={!name.trim()} onClick={save}>
            {existing ? "שמירה" : "הוסף מסגרת"}
          </PrimaryButton>
        </>
      )}

      {step === "done" && saved && (
        <>
          <DoneMark>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 20V9l8-5 8 5v11" />
              <path d="M9 20v-6h6v6" />
            </svg>
          </DoneMark>
          <h2 className="mt-5 text-[28px] font-bold leading-tight">המסגרת נשמרה</h2>
          <p className="mt-1.5 text-[15px] text-ink-2">
            {saved.name}
            {saved.clientRate !== null && saved.clientBillingModel ? ` · ${rateLine(saved.clientBillingModel, saved.clientRate)}` : ""}. מעכשיו התעריף יופיע אוטומטית בפעילויות כאן.
          </p>
          <div className="mt-9 text-[13px] font-bold text-ink-2">מה עכשיו?</div>
          <button
            type="button"
            onClick={() => openFlow({ kind: "activity", frameworkId: saved.id })}
            className="mt-2.5 w-full h-16 rounded-[20px] bg-cobalt text-white px-5 flex items-center justify-between text-[17px] font-bold"
          >
            פעילות במסגרת הזו
            <IconNext strokeWidth={2.4} className="size-[18px]" />
          </button>
          <button type="button" onClick={onClose} className="mt-2 w-full h-12 text-[16px] font-semibold text-ink-2">
            סיום
          </button>
        </>
      )}
    </FlowFrame>
  );
}
