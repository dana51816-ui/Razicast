"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Toaster } from "../ui/Toaster";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <>
      <div className="app-backdrop" aria-hidden />
      <Sidebar />
      <div className="relative z-10 lg:ps-[244px] min-h-dvh">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-10 pt-[calc(env(safe-area-inset-top)+16px)] lg:pt-8 pb-nav"
        >
          {children}
        </motion.main>
      </div>
      <BottomNav />
      <Toaster />
    </>
  );
}
