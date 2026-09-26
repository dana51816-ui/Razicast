import { createRoot } from "react-dom/client";
import { HomeScreen } from "@/components/home/HomeScreen";
import { InstructorScreen } from "@/components/instructor/InstructorScreen";
import { MonthScreen } from "@/components/month/MonthScreen";
import { AppShell } from "@/components/shell/AppShell";
import { TeamScreen } from "@/components/team/TeamScreen";
import { StoreProvider } from "@/lib/store";
import { splitUrl, useUrl } from "./shims/router";

const ROUTES: Record<string, () => React.ReactElement> = {
  "/": () => <HomeScreen />,
  "/team": () => <TeamScreen />,
  "/instructor": () => <InstructorScreen />,
  "/month": () => <MonthScreen />,
};

function Screen() {
  const { pathname } = splitUrl(useUrl());
  const Page = ROUTES[pathname] ?? ROUTES["/"];
  return <Page />;
}

createRoot(document.getElementById("root")!).render(
  <StoreProvider>
    <AppShell>
      <Screen />
    </AppShell>
  </StoreProvider>,
);
