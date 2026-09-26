import { Suspense } from "react";
import { InstructorsScreen } from "@/components/instructors/InstructorsScreen";

export default function Page() {
  return (
    <Suspense>
      <InstructorsScreen />
    </Suspense>
  );
}
