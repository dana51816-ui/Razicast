"use client";

import type { Issue } from "@/lib/audit";
import { useRunAction } from "@/lib/useRunAction";
import { cn } from "./cn";
import { Dot } from "./Tags";

/** WHAT happened · WHY it matters · WHAT to do now — in one row. */
export function IssueRow({ issue, className }: { issue: Issue; className?: string }) {
  const run = useRunAction();
  const tone = issue.tone === "loss" ? "loss" : issue.tone === "missing" ? "missing" : issue.tone === "receipt" ? "receipt" : "idle";
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2.5 min-h-[76px] py-3 border-b border-rule last:border-b-0", className)}>
      <Dot tone={tone} className="size-2.5" />
      <div className="flex-1 min-w-[60%]">
        <div className="text-[16px] font-bold leading-snug">{issue.title}</div>
        <div className="text-[13px] text-ink-2 leading-snug mt-0.5">{issue.why}</div>
      </div>
      <div className="flex shrink-0 gap-1.5 items-stretch flex-col max-[399px]:flex-row max-[399px]:w-full max-[399px]:ps-[22px]">
        <button
          type="button"
          onClick={() => run(issue.action.run)}
          className={cn(
            "h-10 px-3.5 rounded-xl text-[14px] font-bold whitespace-nowrap transition-transform active:scale-[0.97]",
            issue.severity === "blocker" || issue.tone === "loss" ? "bg-ink text-white" : "border-[1.5px] border-ink",
          )}
        >
          {issue.action.label}
        </button>
        {issue.secondary && (
          <button
            type="button"
            onClick={() => run(issue.secondary!.run)}
            className="h-9 px-3 rounded-xl text-[13px] font-semibold text-ink-2 whitespace-nowrap hover:text-ink"
          >
            {issue.secondary.label}
          </button>
        )}
      </div>
    </div>
  );
}
