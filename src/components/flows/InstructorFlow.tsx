"use client";

import { useRef, useState } from "react";
import { RATE_MODEL_ORDER, RATE_MODELS, rateLine } from "@/lib/calc";
import { formatILS } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Instructor, RateModel } from "@/lib/types";
import { IconNext } from "../shell/icons";
import { cn } from "../ui/cn";
import {
  AmountInput,
  ChoiceList,
  DoneMark,
  FlowFrame,
  PrimaryButton,
  ReviewRow,
  SmallAmount,
  StepTitle,
  TextField,
} from "./parts";

type Step = "who" | "model" | "rate" | "receipt" | "review" | "done";
const ORDER: Step[] = ["who", "model", "rate", "receipt", "review"];

/**
 * Add an instructor in four short questions, or edit an existing one's terms
 * (edit opens on the review, where every line is tappable).
 */
export function InstructorFlow({
  editId,
  onClose,
  onSaved,
}: {
  editId?: string;
  onClose: () => void;
  /** When embedded in another flow: hand back the new instructor instead of showing "done" */
  onSaved?: (i: Instructor) => void;
}) {
  const { data, addInstructor, updateInstructor, openFlow, notify } = useStore();
  const existing = editId ? data.instructors.find((i) => i.id === editId) ?? null : null;

  const [step, setStep] = useState<Step>(existing ? "review" : "who");
  const [name, setName] = useState(existing?.name ?? "");
  const [phone, setPhone] = useState(existing?.phone ?? "");
  const [model, setModel] = useState<RateModel | null>(existing?.paymentModel ?? null);
  const [rate, setRate] = useState(existing?.baseRate != null ? String(existing.baseRate) : "");
  const [travelOn, setTravelOn] = useState(existing?.travelRate != null);
  const [travel, setTravel] = useState(existing?.travelRate != null ? String(existing.travelRate) : "");
  const [receipt, setReceipt] = useState<boolean | null>(existing?.requiresReceipt ?? null);
  const [saved, setSaved] = useState<Instructor | null>(null);

  const needsRate = model !== null && model !== "custom";
  const flowSteps = ORDER.filter((s) => s !== "rate" || needsRate || model === null);
  const idx = flowSteps.indexOf(step === "done" ? "review" : step);
  const go = (s: Step) => setStep(s);
  const next = () => go(flowSteps[Math.min(flowSteps.length - 1, idx + 1)]);
  const back = existing
    ? step !== "review" && step !== "done"
      ? () => go("review")
      : undefined
    : idx > 0 && step !== "done"
      ? () => go(flowSteps[idx - 1])
      : undefined;
  // Once the review has been seen, an edit returns to it instead of walking forward.
  const reachedReview = useRef(!!existing);
  if (step === "review") reachedReview.current = true;
  const advance = () => (reachedReview.current ? go("review") : next());

  const pickThen = (fn: () => void) => {
    fn();
    setTimeout(advance, 200);
  };

  const unit = model ? RATE_MODELS[model].per : "";
  const values = (): Omit<Instructor, "id" | "createdAt" | "origin"> => ({
    name: name.trim(),
    phone: phone.trim() || null,
    paymentModel: model,
    baseRate: needsRate && rate !== "" ? Number(rate) : null,
    travelRate: travelOn && travel !== "" ? Number(travel) : null,
    requiresReceipt: receipt,
  });

  const save = () => {
    if (existing) {
      updateInstructor(existing.id, values());
      notify(`התנאים של ${name.trim()} עודכנו`);
      onClose();
      return;
    }
    const created = addInstructor(values());
    if (onSaved) onSaved(created);
    else {
      setSaved(created);
      go("done");
    }
  };

  const termsText = model === null ? null : model === "custom" ? RATE_MODELS.custom.per : rate ? rateLine(model, Number(rate)) : null;

  return (
    <FlowFrame
      step={step === "done" ? flowSteps.length : idx}
      steps={flowSteps.length}
      onBack={back}
      onClose={onClose}
      stepKey={step}
    >
      {step === "who" && (
        <>
          <StepTitle eyebrow="מדריך חדש" title="מי מצטרף לצוות?" />
          <div className="flex flex-col gap-4">
            <TextField label="שם" value={name} onChange={setName} autoComplete="name" autoFocus />
            <TextField label="טלפון" value={phone} onChange={setPhone} type="tel" inputMode="tel" autoComplete="tel" dir="ltr" />
          </div>
          <p className="mt-3 text-[13px] text-ink-2">הטלפון משמש לתזכורות על קבלות. אפשר להשאיר ריק.</p>
          <PrimaryButton className="mt-8" disabled={!name.trim()} onClick={advance}>
            המשך
          </PrimaryButton>
        </>
      )}

      {step === "model" && (
        <>
          <StepTitle eyebrow={existing ? "תנאי תשלום" : "מדריך חדש"} title={`איך משלמים ל${name.trim() || "מדריך"}?`} />
          <ChoiceList
            value={model}
            onPick={(v) => {
              setModel(v);
              setTimeout(() => go(reachedReview.current ? "review" : v === "custom" ? "receipt" : "rate"), 200);
            }}
            options={RATE_MODEL_ORDER.map((m) => ({ value: m, label: RATE_MODELS[m].label, hint: RATE_MODELS[m].hint }))}
          />
        </>
      )}

      {step === "rate" && (
        <>
          <StepTitle eyebrow={existing ? "תנאי תשלום" : "מדריך חדש"} title="מה התעריף הבסיסי?" />
          <AmountInput label={`סכום ${unit}`} value={rate} onChange={setRate} suffix={unit} autoFocus />
          {travelOn ? (
            <div className="mt-4 flex items-center gap-3">
              <span className="flex-1 text-[15px] font-semibold">תוספת נסיעה, לכל נסיעה</span>
              <div className="w-32">
                <SmallAmount label="תוספת נסיעה" value={travel} onChange={setTravel} />
              </div>
              <button
                type="button"
                onClick={() => {
                  setTravelOn(false);
                  setTravel("");
                }}
                aria-label="הסרת תוספת נסיעה"
                className="size-11 rounded-full bg-stone-2 grid place-items-center text-[18px]"
              >
                ×
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setTravelOn(true)}
              className="mt-4 h-12 px-4 rounded-[14px] border-[1.5px] border-dashed border-ink text-[15px] font-semibold"
            >
              + תוספת נסיעה (לא חובה)
            </button>
          )}
          <p className="mt-4 text-[13px] text-ink-2">בונוסים ותעריפים מיוחדים אפשר להוסיף אחר כך.</p>
          <PrimaryButton className="mt-6" disabled={rate === "" || (travelOn && travel === "")} onClick={advance}>
            המשך
          </PrimaryButton>
        </>
      )}

      {step === "receipt" && (
        <>
          <StepTitle
            eyebrow={existing ? "תנאי תשלום" : "מדריך חדש"}
            title={`צריך לקבל מ${name.trim() || "המדריך"} חשבונית או קבלה?`}
            hint="אם כן, המערכת תעקוב אחרי הקבלה בכל חודש ותזכיר בבדיקת סוף החודש."
          />
          <div className="flex gap-2.5" role="radiogroup">
            {[
              { v: true, label: "כן" },
              { v: false, label: "לא" },
            ].map((o) => (
              <button
                key={o.label}
                type="button"
                role="radio"
                aria-checked={receipt === o.v}
                onClick={() => pickThen(() => setReceipt(o.v))}
                className={cn(
                  "flex-1 h-[120px] rounded-[22px] text-[22px] font-bold transition-colors",
                  receipt === o.v ? (o.v ? "bg-cobalt text-white" : "bg-ink text-white") : "bg-paper",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}

      {step === "review" && (
        <>
          <div className="text-[13px] font-semibold text-ink-2">{existing ? "תנאי תשלום" : "בדיקה אחרונה"}</div>
          <button type="button" onClick={() => go("who")} className="mt-3 mb-5 flex items-center gap-4 text-start">
            <span className="size-16 rounded-full border-2 border-dashed border-ink grid place-items-center text-[24px] font-bold">
              {name.trim().charAt(0) || "?"}
            </span>
            <span>
              <span className="block display text-[50px] leading-[0.85]">{name.trim() || "ללא שם"}</span>
              <span className="num text-[14px] text-ink-2 mt-1">{phone || "בלי טלפון"}</span>
            </span>
          </button>
          <div className="rounded-[22px] bg-paper px-5 py-1">
            <ReviewRow label="איך משלמים" onEdit={() => go("model")} missing={!model}>
              {model ? RATE_MODELS[model].label : "לא הוגדר"}
            </ReviewRow>
            {needsRate && (
              <ReviewRow label="תעריף" onEdit={() => go("rate")} missing={!rate}>
                {termsText ?? "חסר תעריף"}
              </ReviewRow>
            )}
            {needsRate && (
              <ReviewRow label="נסיעה" onEdit={() => go("rate")}>
                {travelOn && travel ? `+ ${formatILS(Number(travel))} לנסיעה` : "בלי"}
              </ReviewRow>
            )}
            <ReviewRow label="קבלה" onEdit={() => go("receipt")} missing={receipt === null}>
              {receipt === null ? "לא הוגדר" : receipt ? "נדרשת קבלה" : "לא נדרשת"}
            </ReviewRow>
          </div>
          <p className="mt-2.5 px-1 text-[13px] text-ink-2">נוגעים בשורה כדי לשנות</p>
          <PrimaryButton
            tone="cobalt"
            className="mt-6"
            disabled={!name.trim()}
            onClick={save}
          >
            {existing ? "שמירת תנאים" : "הוסף מדריך"}
          </PrimaryButton>
        </>
      )}

      {step === "done" && saved && (
        <>
          <DoneMark>{saved.name.charAt(0)}</DoneMark>
          <h2 className="mt-5 text-[28px] font-bold leading-tight">הוספנו את {saved.name} לצוות</h2>
          <p className="mt-1.5 text-[15px] text-ink-2">
            {[termsText, travelOn && travel ? `+ ${formatILS(Number(travel))} נסיעה` : null, receipt ? "נדרשת קבלה" : receipt === false ? "בלי קבלה" : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="mt-9 text-[13px] font-bold text-ink-2">מה עכשיו?</div>
          <button
            type="button"
            onClick={() => openFlow({ kind: "activity", instructorId: saved.id })}
            className="mt-2.5 w-full h-16 rounded-[20px] bg-cobalt text-white px-5 flex items-center justify-between text-[17px] font-bold"
          >
            פעילות ל{saved.name}
            <IconNext strokeWidth={2.4} className="size-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => openFlow({ kind: "framework" })}
            className="mt-2 w-full h-16 rounded-[20px] bg-paper px-5 flex items-center justify-between text-[17px] font-bold"
          >
            מסגרת חדשה
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
