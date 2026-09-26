"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ACTIVITIES, CLOSED_MONTHS, CURRENT_MONTH, RECEIPTS } from "./data";
import type { Activity, MonthKey, Receipt, ReceiptStatus } from "./types";

interface Toast {
  id: number;
  message: string;
}

interface StoreValue {
  month: MonthKey;
  setMonth: (m: MonthKey) => void;
  /** True briefly on first paint and when switching months — drives skeletons. */
  loading: boolean;
  activities: Activity[];
  addActivity: (a: Omit<Activity, "id">) => void;
  receipts: Receipt[];
  setReceiptStatus: (id: string, status: ReceiptStatus) => void;
  closedMonths: MonthKey[];
  closeMonth: (m: MonthKey) => void;
  toasts: Toast[];
  notify: (message: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

const LOAD_MS = 420;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [month, setMonthState] = useState<MonthKey>(CURRENT_MONTH);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>(ACTIVITIES);
  const [receipts, setReceipts] = useState<Receipt[]>(RECEIPTS);
  const [closedMonths, setClosedMonths] = useState<MonthKey[]>(CLOSED_MONTHS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pulseLoading = useCallback(() => {
    setLoading(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setLoading(false), LOAD_MS);
  }, []);

  useEffect(() => {
    pulseLoading();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [pulseLoading]);

  const setMonth = useCallback(
    (m: MonthKey) => {
      setMonthState((prev) => {
        if (prev !== m) pulseLoading();
        return m;
      });
    },
    [pulseLoading],
  );

  const notify = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const addActivity = useCallback((a: Omit<Activity, "id">) => {
    setActivities((list) => [{ ...a, id: `new-${Date.now()}` }, ...list]);
  }, []);

  const setReceiptStatus = useCallback((id: string, status: ReceiptStatus) => {
    setReceipts((list) =>
      list.map((r) =>
        r.id === id
          ? { ...r, status, receivedAt: status === "missing" ? undefined : "2026-09-26" }
          : r,
      ),
    );
  }, []);

  const closeMonth = useCallback((m: MonthKey) => {
    setClosedMonths((list) => (list.includes(m) ? list : [...list, m]));
  }, []);

  const value = useMemo(
    () => ({
      month,
      setMonth,
      loading,
      activities,
      addActivity,
      receipts,
      setReceiptStatus,
      closedMonths,
      closeMonth,
      toasts,
      notify,
    }),
    [month, setMonth, loading, activities, addActivity, receipts, setReceiptStatus, closedMonths, closeMonth, toasts, notify],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
