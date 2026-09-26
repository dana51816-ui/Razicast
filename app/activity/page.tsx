import { Suspense } from "react";
import { ActivityScreen } from "@/components/activity/ActivityScreen";

export default function Page() {
  return (
    <Suspense>
      <ActivityScreen />
    </Suspense>
  );
}
