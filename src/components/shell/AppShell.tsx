"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { Toaster } from "../ui/Toaster";
import { AddMenu } from "./AddMenu";
import { FlowHost } from "./FlowHost";
import { Intro } from "./Intro";
import { Rail } from "./Rail";
import { TabBar } from "./TabBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { hydrated } = useStore();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  return (
    <>
      <Rail />
      <div className="lg:ps-[232px] min-h-dvh overflow-x-clip">
        <main className="mx-auto w-full max-w-[1080px] px-5 sm:px-8 pt-[calc(env(safe-area-inset-top)+20px)] lg:pt-10 pb-nav">
          {/* Render once saved data is loaded, so numbers never jump from demo to saved */}
          {hydrated ? (
            <motion.div
              key={pathname}
              initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none", transform: "none" } }}
              transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {children}
            </motion.div>
          ) : (
            <div className="h-[60vh]" aria-busy="true" />
          )}
        </main>
      </div>
      <TabBar />
      <AddMenu />
      <FlowHost />
      <Toaster />
      <Intro />
    </>
  );
}
