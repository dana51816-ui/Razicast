import { Suspense } from "react";
import { InstructorScreen } from "@/components/instructor/InstructorScreen";

export default function Page() {
  return (
    <Suspense>
      <InstructorScreen />
    </Suspense>
  );
}
