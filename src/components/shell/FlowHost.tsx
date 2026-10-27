"use client";

import { useStore, type Flow } from "@/lib/store";
import { ActivityDetail } from "../flows/ActivityDetail";
import { ActivityFlow } from "../flows/ActivityFlow";
import { BackupFlow } from "../flows/BackupFlow";
import { FrameworkFlow } from "../flows/FrameworkFlow";
import { InstructorFlow } from "../flows/InstructorFlow";
import { ResolveFlow } from "../flows/ResolveFlow";
import { Sheet } from "../ui/Sheet";

const LABEL: Record<Flow["kind"], string> = {
  activity: "פעילות",
  instructor: "מדריך",
  framework: "מסגרת",
  resolve: "השלמת מידע",
  activityDetail: "פרטי פעילות",
  backup: "גיבוי ושחזור",
};

const SHEETS: Flow["kind"][] = ["resolve", "activityDetail", "backup"];

/** Every guided flow opens here, over whatever screen is showing. */
export function FlowHost() {
  const { flow, closeFlow } = useStore();
  const key = flow ? JSON.stringify(flow) : "none";
  return (
    <Sheet open={!!flow} onClose={closeFlow} label={flow ? LABEL[flow.kind] : ""} size={flow && SHEETS.includes(flow.kind) ? "sheet" : "screen"}>
      {flow?.kind === "activity" && <ActivityFlow key={key} preset={flow} onClose={closeFlow} />}
      {flow?.kind === "instructor" && <InstructorFlow key={key} editId={flow.editId} onClose={closeFlow} />}
      {flow?.kind === "framework" && <FrameworkFlow key={key} editId={flow.editId} onClose={closeFlow} />}
      {flow?.kind === "resolve" && <ResolveFlow key={key} activityId={flow.activityId} onClose={closeFlow} />}
      {flow?.kind === "activityDetail" && <ActivityDetail key={key} activityId={flow.activityId} onClose={closeFlow} />}
      {flow?.kind === "backup" && <BackupFlow key={key} onClose={closeFlow} />}
    </Sheet>
  );
}
