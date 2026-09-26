import { createRoot } from "react-dom/client";
import { ActivityScreen } from "@/components/activity/ActivityScreen";
import { CloseMonthScreen } from "@/components/close/CloseMonthScreen";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { InstructorsScreen } from "@/components/instructors/InstructorsScreen";
import { ReceiptsScreen } from "@/components/receipts/ReceiptsScreen";
import { AppShell } from "@/components/shell/AppShell";
import { StoreProvider } from "@/lib/store";
import { splitUrl, useUrl } from "./shims/router";

const ROUTES: Record<string, () => React.ReactElement> = {
  "/": () => <Dashboard />,
  "/activity": () => <ActivityScreen />,
  "/instructors": () => <InstructorsScreen />,
  "/receipts": () => <ReceiptsScreen />,
  "/close": () => <CloseMonthScreen />,
};

function Preview() {
  const { pathname } = splitUrl(useUrl());
  const Screen = ROUTES[pathname] ?? ROUTES["/"];
  return (
    <StoreProvider>
      <AppShell>
        <Screen />
      </AppShell>
    </StoreProvider>
  );
}

createRoot(document.getElementById("root")!).render(<Preview />);
