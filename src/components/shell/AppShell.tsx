"use client";

import { useStore } from "@/lib/store";
import { Toaster } from "../ui/Toaster";
import { AddMenu } from "./AddMenu";
import { FlowHost } from "./FlowHost";
import { Rail } from "./Rail";
import { TabBar } from "./TabBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { hydrated } = useStore();
  return (
    <>
      <Rail />
      <div className="lg:ps-[232px] min-h-dvh overflow-x-clip">
        <main className="mx-auto w-full max-w-[1080px] px-5 sm:px-8 pt-[calc(env(safe-area-inset-top)+20px)] lg:pt-10 pb-nav">
          {/* Render once saved data is loaded, so numbers never jump from demo to saved */}
          {hydrated ? children : <div className="h-[60vh]" aria-busy="true" />}
        </main>
      </div>
      <TabBar />
      <AddMenu />
      <FlowHost />
      <Toaster />
    </>
  );
}
