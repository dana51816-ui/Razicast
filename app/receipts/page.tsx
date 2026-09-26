import { Suspense } from "react";
import { ReceiptsScreen } from "@/components/receipts/ReceiptsScreen";

export default function Page() {
  return (
    <Suspense>
      <ReceiptsScreen />
    </Suspense>
  );
}
