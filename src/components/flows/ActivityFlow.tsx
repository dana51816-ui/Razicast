"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  activitiesIn,
  activityUnit,
  hasPaymentTerms,
  monthOf,
  quoteActivity,
  RATE_MODELS,
  rateLine,
  totalsOf,
  unitPlural,
} from "@/lib/calc";
import { dayMonth, formatILS, monthName } from "@/lib/format";
import { TODAY, useStore, type Flow } from "@/lib/store";
import type { Amount } from "@/lib/types";
import { IconCheck, IconNext } from "../shell/icons";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { cn } from "../ui/cn";
import { Split } from "../ui/Split";
import { MissingTag } from "../ui/Tags";
import { FrameworkFlow } from "./FrameworkFlow";
import { InstructorFlow } from "./InstructorFlow";
import { DoneMark, FlowFrame, PrimaryButton, SmallAmount, StepTitle, Stepper } from "./parts";

type Step = "who" | "where" | "qty" | "review" | "done" | "newInstructor" | "newFramework";
const ORDER: Step[] = ["who", "where", "qty", "review"];

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

export function ActivityFlow({ preset, onClose }: { preset: Extract<Flow, { kind: "activity" }>; onClose: () => void }) {
  const { data, addActivity } = useStore();
  const router = useRouter();

  const [instructorId, setInstructorId] = useState<string | null>(preset.instructorId ?? null);
  const [frameworkId, setFrameworkId] = useState<string | null>(preset.frameworkId ?? null);
  const [step, setStep] = useState<Step>(instructorId ? (frameworkId ? "qty" : "where") : "who");
  const [quantity, setQuantity] = useState(1);
  const [travelUnits, setTravelUnits] = useState<number | null>(null);
  const [date, setDate] = useState(TODAY);
  const [revManual, setRevManual] = useState("");
  const [payManual, setPayManual] = useState("");
  const [revOverride, setRevOverride] = useState(false);
  const [payOverride, setPayOverride] = useState(false);
  const [result, setResult] = useState<{ before: number | null; delta: number | null; complete: boolean } | null>(null);

  const instructor = data.instructors.find((i) => i.id === instructorId) ?? null;
  const framework = data.frameworks.find((f) => f.id === frameworkId) ?? null;
  const travel = travelUnits ?? (instructor?.travelRate ? 1 : 0);

  const quote = useMemo(
    () => (instructor ? quoteActivity({ instructor, framework, quantity, travelUnits: travel }) : null),
    [instructor, framework, quantity, travel],
  );

  const final = (auto: Amount | undefined, override: boolean, manual: string): Amount => {
    if (auto && auto.value !== null && !override) return auto;
    if (manual !== "") return { value: Number(manual), mode: "manual", source: "הוזן ידנית" };
    return { value: null, mode: "missing", source: null };
  };
  const revenue = final(quote?.revenue, revOverride, revManual);
  const payment = final(quote?.payment, payOverride, payManual);
  const profit = revenue.value !== null && payment.value !== null ? revenue.value - payment.value : null;
  const allAuto = revenue.mode === "calculated" && payment.mode === "calculated";

  const month = monthOf(date);
  const liveMonthProfit = totalsOf(activitiesIn(data, month)).profit;

  const idx = ORDER.indexOf(step);
  const back =
    step === "where" ? () => setStep("who") : step === "qty" ? () => setStep(preset.frameworkId && frameworkId === preset.frameworkId ? "who" : "where") : step === "review" ? () => setStep("qty") : undefined;

  const pickInstructor = (id: string) => {
    setInstructorId(id);
    setTravelUnits(null);
    setPayManual("");
    setPayOverride(false);
    setTimeout(() => setStep(frameworkId ? "qty" : "where"), 180);
  };
  const pickFramework = (id: string) => {
    setFrameworkId(id);
    setRevManual("");
    setRevOverride(false);
    setTimeout(() => setStep("qty"), 180);
  };

  const save = () => {
    if (!instructor) return;
    const before = liveMonthProfit;
    addActivity({
      date,
      instructorId: instructor.id,
      frameworkId,
      quantity,
      unitLabel: quote?.unitPlural ?? "יחידות",
      travelUnits: instructor.travelRate ? travel : 0,
      revenue,
      instructorPayment: payment,
    });
    setResult({ before, delta: profit, complete: profit !== null });
    setStep("done");
  };

  const reset = () => {
    setInstructorId(null);
    setFrameworkId(null);
    setQuantity(1);
    setTravelUnits(null);
    setRevManual("");
    setPayManual("");
    setRevOverride(false);
    setPayOverride(false);
    setResult(null);
    setStep("who");
  };

  /* Inline creation keeps the user inside this flow */
  if (step === "newInstructor")
    return <InstructorFlow onClose={() => setStep("who")} onSaved={(i) => pickInstructor(i.id)} />;
  if (step === "newFramework")
    return <FrameworkFlow onClose={() => setStep("where")} onSaved={(f) => pickFramework(f.id)} />;

  const instructors = [...data.instructors].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const frameworks = [...data.frameworks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const unitModel = activityUnit(instructor, framework);

  return (
    <FlowFrame
      step={step === "done" ? ORDER.length : idx}
      steps={ORDER.length}
      onBack={back}
      onClose={onClose}
      stepKey={step}
    >
      {step === "who" && (
        <>
          <StepTitle eyebrow="פעילות חדשה" title="מי המדריך?" />
          <div className="grid grid-cols-3 gap-x-2 gap-y-5">
            {instructors.map((i) => {
              const on = i.id === instructorId;
              const terms = hasPaymentTerms(i);
              return (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => pickInstructor(i.id)}
                  className="flex flex-col items-center gap-1.5 text-center"
                  aria-pressed={on}
                >
                  <span
                    className={cn(
                      "size-[72px] rounded-full grid place-items-center text-[24px] font-bold transition-colors",
                      on ? "bg-cobalt text-white" : terms ? "bg-ink text-white" : "border-2 border-dashed border-ink",
                    )}
                  >
                    {i.name.charAt(0)}
                  </span>
                  <span className="text-[15px] font-bold leading-tight">{i.name}</span>
                  <span className={cn("text-[12px] leading-tight", terms ? "text-ink-2" : "text-amber-ink")}>
                    {terms ? rateLine(i.paymentModel, i.baseRate) ?? RATE_MODELS.custom.per : "חסר תעריף"}
                  </span>
                </button>
              );
            })}
            <button type="button" onClick={() => setStep("newInstructor")} className="flex flex-col items-center gap-1.5">
              <span className="size-[72px] rounded-full border-2 border-dashed border-ink-2 grid place-items-center text-[30px] text-ink-2">+</span>
              <span className="text-[15px] font-bold text-ink-2">מדריך חדש</span>
            </button>
          </div>
        </>
      )}

      {step === "where" && (
        <>
          <StepTitle eyebrow={`פעילות חדשה · ${instructor?.name ?? ""}`} title="באיזו מסגרת?" />
          <div className="flex flex-col gap-1.5">
            {frameworks.map((f) => {
              const on = f.id === frameworkId;
              const line = f.clientBillingModel ? rateLine(f.clientBillingModel, f.clientRate) : null;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => pickFramework(f.id)}
                  aria-pressed={on}
                  className={cn(
                    "min-h-[56px] rounded-[16px] px-4 flex items-center justify-between gap-3 text-start transition-colors",
                    on ? "bg-cobalt text-white" : "bg-paper",
                  )}
                >
                  <span className="text-[16px] font-bold">{f.name}</span>
                  <span className={cn("text-[13px] font-semibold whitespace-nowrap", on ? "text-cobalt-soft" : line ? "text-ink-2" : "text-amber-ink")}>
                    {line ?? "אין תעריף"}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setStep("newFramework")}
              className="min-h-[52px] rounded-[16px] border-[1.5px] border-dashed border-ink text-[15px] font-bold"
            >
              + מסגרת חדשה
            </button>
          </div>
        </>
      )}

      {step === "qty" && instructor && (
        <>
          <StepTitle
            eyebrow={[instructor.name, framework?.name].filter(Boolean).join(" · ")}
            title={`כמה ${unitPlural(unitModel)}?`}
            hint={
              unitModel
                ? `לפי ${framework?.clientBillingModel === unitModel ? `התעריף של ${framework?.name}` : `התעריף של ${instructor.name}`}, ${RATE_MODELS[unitModel].label}`
                : "אין יחידת חיוב מוגדרת, סופרים יחידות"
            }
          />
          <Stepper big label={unitPlural(unitModel)} value={quantity} onChange={setQuantity} min={1} />
          {instructor.travelRate !== null && (
            <div className="mt-8 rounded-[22px] bg-paper px-5 py-4">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[16px] font-bold">נסיעות</span>
                <span className="text-[13px] text-ink-2">
                  <span className="num">{formatILS(instructor.travelRate)}</span> לנסיעה
                </span>
              </div>
              <Stepper label="נסיעות" value={travel} onChange={setTravelUnits} min={0} />
            </div>
          )}
          <PrimaryButton tone="cobalt" className="mt-8" onClick={() => setStep("review")}>
            לחישוב
          </PrimaryButton>
        </>
      )}

      {step === "review" && instructor && quote && (
        <>
          <div className="text-[14px] text-ink-2 leading-snug">
            {[instructor.name, framework?.name ?? "בלי מסגרת", `${quantity} ${quote.unitPlural}`, travel ? `${travel} נסיעות` : null]
              .filter(Boolean)
              .join(" · ")}
          </div>
          <label className="mt-2 inline-flex items-center gap-2 h-9 px-3 rounded-full bg-stone-2 text-[13px] font-semibold">
            תאריך
            <input
              type="date"
              value={date}
              onChange={(e) => e.target.value && setDate(e.target.value)}
              className="bg-transparent text-[13px] font-semibold num"
              aria-label="תאריך הפעילות"
            />
          </label>

          <div className="mt-4">
            {allAuto ? (
              <span className="inline-flex items-center gap-2 h-9 ps-3 pe-3.5 rounded-full bg-ink text-white text-[14px] font-bold">
                <IconCheck strokeWidth={3} className="size-4" />
                התעריף נמצא אוטומטית
              </span>
            ) : quote.revenueGap || quote.paymentGap ? (
              <MissingTag className="h-9 px-3.5 text-[14px]">חסר תעריף · מזינים רק את מה שחסר</MissingTag>
            ) : null}
          </div>

          <MoneyLine
            label="הכנסה מהלקוח"
            amount={revenue}
            auto={quote.revenue}
            gap={quote.revenueGap}
            override={revOverride}
            manual={revManual}
            onManual={setRevManual}
            onOverride={() => {
              setRevOverride(true);
              setRevManual(String(quote.revenue.value ?? ""));
            }}
          />
          <MoneyLine
            label={`תשלום ל${instructor.name}`}
            amount={payment}
            auto={quote.payment}
            gap={quote.paymentGap}
            override={payOverride}
            manual={payManual}
            onManual={setPayManual}
            onOverride={() => {
              setPayOverride(true);
              setPayManual(String(quote.payment.value ?? ""));
            }}
          />

          <div className="pt-4">
            <div className="flex items-end justify-between gap-3">
              <span className="text-[16px] font-bold">רווח לחברה</span>
              {profit !== null ? (
                <span className={cn("num display text-[68px] leading-[0.8]", profit < 0 ? "text-loss-ink" : "text-cobalt")}>
                  {profit < 0 ? "-" : ""}₪{fmt(Math.abs(profit))}
                </span>
              ) : (
                <span className="text-[14px] font-bold text-amber-ink">יחושב אחרי הזנת הסכום</span>
              )}
            </div>
            {profit !== null && revenue.value !== null && payment.value !== null && (
              <Split revenue={revenue.value} payment={payment.value} height={16} className="mt-3" />
            )}
          </div>

          <PrimaryButton className="mt-7" disabled={profit === null} onClick={save}>
            שמור פעילות
          </PrimaryButton>
          {profit === null && (
            <button type="button" onClick={save} className="mt-1 w-full min-h-11 text-[14px] font-semibold text-ink-2">
              לשמור בכל זאת (יסומן כמידע חסר)
            </button>
          )}
        </>
      )}

      {step === "done" && instructor && result && (
        <>
          <DoneMark tone={result.complete ? "cobalt" : "amber"}>
            <IconCheck strokeWidth={2.8} className="size-8" />
          </DoneMark>
          <h2 className="mt-5 text-[28px] font-bold leading-tight">הפעילות נשמרה</h2>
          <p className="mt-1 text-[14px] text-ink-2">
            {[instructor.name, framework?.name, `${quantity} ${quote?.unitPlural ?? ""}`, dayMonth(date)].filter(Boolean).join(" · ")}
          </p>

          <div className="mt-9 text-[15px] font-semibold">רווח {monthName(month)} עכשיו</div>
          {liveMonthProfit !== null ? (
            <div dir="ltr" className="flex items-start justify-end gap-1">
              <span className="display text-[46px] leading-none mt-3">₪</span>
              <AnimatedNumber value={liveMonthProfit} from={result.before ?? 0} format={fmt} className="display text-[min(116px,28vw)] leading-[0.82]" />
            </div>
          ) : (
            <MissingTag className="mt-2">עדיין אין פעילויות שלמות החודש</MissingTag>
          )}
          <div className={cn("mt-2 text-[15px] font-bold", !result.complete ? "text-amber-ink" : (result.delta ?? 0) < 0 ? "text-loss-ink" : "text-cobalt")}>
            {result.complete
              ? `${(result.delta ?? 0) >= 0 ? "+" : "-"}${formatILS(Math.abs(result.delta ?? 0))} מהפעילות הזו`
              : "הרווח לא השתנה: הפעילות נשמרה עם מידע חסר ותופיע בבדיקת סוף החודש"}
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              router.push(`/instructor?id=${instructor.id}`);
            }}
            className="mt-9 w-full h-16 rounded-[20px] bg-cobalt text-white px-5 flex items-center justify-between text-[17px] font-bold"
          >
            לכרטיס של {instructor.name}
            <IconNext strokeWidth={2.4} className="size-[18px]" />
          </button>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={reset} className="flex-1 h-14 rounded-[18px] border-2 border-ink text-[16px] font-bold">
              פעילות נוספת
            </button>
            <button type="button" onClick={onClose} className="flex-1 h-14 rounded-[18px] bg-stone-2 text-[16px] font-bold">
              סיום
            </button>
          </div>
        </>
      )}
    </FlowFrame>
  );
}

/** One side of the calculation: found automatically (with its source), or asked for. */
function MoneyLine({
  label,
  amount,
  auto,
  gap,
  override,
  manual,
  onManual,
  onOverride,
}: {
  label: string;
  amount: Amount;
  auto: Amount;
  gap: string | null;
  override: boolean;
  manual: string;
  onManual: (v: string) => void;
  onOverride: () => void;
}) {
  const found = auto.value !== null && !override;
  return (
    <div className="py-3.5 border-b border-rule">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[15px] font-semibold">{label}</span>
        {found && <span className="num text-[21px] font-bold">{formatILS(auto.value!)}</span>}
      </div>
      {found ? (
        <div className="mt-0.5 flex items-center justify-between gap-3">
          <span className="text-[12.5px] text-ink-2 leading-snug">{auto.source}</span>
          <button type="button" onClick={onOverride} className="shrink-0 h-8 text-[12.5px] font-semibold text-ink-2 underline underline-offset-4">
            שינוי ידני
          </button>
        </div>
      ) : (
        <>
          <div className="mt-0.5 text-[12.5px] leading-snug text-amber-ink">
            {override ? "סכום ידני לפעילות הזו" : gap}
          </div>
          <div className="mt-2">
            <SmallAmount label={label} value={manual} onChange={onManual} missing={amount.value === null} />
          </div>
        </>
      )}
    </div>
  );
}
