"use client";

import { useStore, type Flow } from "@/lib/store";
import { ActivityFlow } from "../flows/ActivityFlow";
import { FrameworkFlow } from "../flows/FrameworkFlow";
import { InstructorFlow } from "../flows/InstructorFlow";
import { ResolveFlow } from "../flows/ResolveFlow";
import { Sheet } from "../ui/Sheet";

const LABEL: Record<Flow["kind"], string> = {
  activity: "פעילות חדשה",
  instructor: "מדריך",
  framework: "מסגרת",
  resolve: "השלמת מידע",
};

/** Every guided flow opens here, over whatever screen is showing. */
export function FlowHost() {
  const { flow, closeFlow } = useStore();
  const key = flow ? JSON.stringify(flow) : "none";
  return (
    <Sheet open={!!flow} onClose={closeFlow} label={flow ? LABEL[flow.kind] : ""} size={flow?.kind === "resolve" ? "sheet" : "screen"}>
      {flow?.kind === "activity" && <ActivityFlow key={key} preset={flow} onClose={closeFlow} />}
      {flow?.kind === "instructor" && <InstructorFlow key={key} editId={flow.editId} onClose={closeFlow} />}
      {flow?.kind === "framework" && <FrameworkFlow key={key} editId={flow.editId} onClose={closeFlow} />}
      {flow?.kind === "resolve" && <ResolveFlow key={key} activityId={flow.activityId} onClose={closeFlow} />}
    </Sheet>
  );
}
