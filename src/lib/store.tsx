"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { monthOf } from "./calc";
import { localRepository, type Repository } from "./repository";
import { createSeed } from "./seed";
import type { Activity, AppData, Framework, ID, Instructor, MonthKey, ReceiptStatus, Settings } from "./types";

/** The demo runs "today" inside September 2026, the month the brief describes. */
export const TODAY = "2026-09-26";
export const CURRENT_MONTH = monthOf(TODAY);

const now = () => new Date().toISOString();
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/* ───────────────────────── reducer ───────────────────────── */

type Action =
  | { type: "hydrate"; data: AppData }
  | { type: "reset" }
  | { type: "addInstructor"; instructor: Instructor }
  | { type: "updateInstructor"; id: ID; patch: Partial<Instructor> }
  | { type: "addFramework"; framework: Framework }
  | { type: "updateFramework"; id: ID; patch: Partial<Framework> }
  | { type: "addActivity"; activity: Activity }
  | { type: "updateActivity"; id: ID; patch: Partial<Activity> }
  | { type: "setReceipt"; instructorId: ID; month: MonthKey; status: ReceiptStatus }
  | { type: "remind"; instructorId: ID; month: MonthKey }
  | { type: "ackLoss"; instructorId: ID; month: MonthKey; value: boolean }
  | { type: "closeMonth"; month: MonthKey; value: boolean }
  | { type: "settings"; patch: Partial<Settings> };

function withMonth(data: AppData, month: MonthKey) {
  return data.months.some((m) => m.key === month)
    ? data.months
    : [...data.months, { key: month, closedAt: null, reviewedLosses: [] }];
}

function upsertReceipt(data: AppData, instructorId: ID, month: MonthKey, patch: { status?: ReceiptStatus; remindedAt?: string }) {
  const existing = data.receipts.find((r) => r.instructorId === instructorId && r.month === month);
  if (existing) {
    return data.receipts.map((r) => (r === existing ? { ...r, ...patch, updatedAt: now() } : r));
  }
  return [
    ...data.receipts,
    { instructorId, month, status: patch.status ?? "missing", remindedAt: patch.remindedAt ?? null, updatedAt: now() },
  ];
}

function reducer(data: AppData, action: Action): AppData {
  switch (action.type) {
    case "hydrate":
      return action.data;
    case "reset":
      return createSeed();
    case "addInstructor":
      return { ...data, instructors: [...data.instructors, action.instructor] };
    case "updateInstructor":
      return { ...data, instructors: data.instructors.map((i) => (i.id === action.id ? { ...i, ...action.patch } : i)) };
    case "addFramework":
      return { ...data, frameworks: [...data.frameworks, action.framework] };
    case "updateFramework":
      return { ...data, frameworks: data.frameworks.map((f) => (f.id === action.id ? { ...f, ...action.patch } : f)) };
    case "addActivity":
      return {
        ...data,
        activities: [...data.activities, action.activity],
        months: withMonth(data, monthOf(action.activity.date)),
      };
    case "updateActivity":
      return { ...data, activities: data.activities.map((a) => (a.id === action.id ? { ...a, ...action.patch } : a)) };
    case "setReceipt":
      return { ...data, receipts: upsertReceipt(data, action.instructorId, action.month, { status: action.status }) };
    case "remind":
      return { ...data, receipts: upsertReceipt(data, action.instructorId, action.month, { remindedAt: now() }) };
    case "ackLoss": {
      const months = withMonth(data, action.month).map((m) => {
        if (m.key !== action.month) return m;
        const set = new Set(m.reviewedLosses);
        if (action.value) set.add(action.instructorId);
        else set.delete(action.instructorId);
        return { ...m, reviewedLosses: [...set] };
      });
      return { ...data, months };
    }
    case "closeMonth":
      return {
        ...data,
        months: withMonth(data, action.month).map((m) =>
          m.key === action.month ? { ...m, closedAt: action.value ? now() : null } : m,
        ),
      };
    case "settings":
      return { ...data, settings: { ...data.settings, ...action.patch } };
  }
}

/* ───────────────────────── UI state (not persisted) ───────────────────────── */

export type Flow =
  | { kind: "activity"; instructorId?: ID; frameworkId?: ID }
  | { kind: "instructor"; editId?: ID }
  | { kind: "framework"; editId?: ID }
  | { kind: "resolve"; activityId: ID };

interface Toast {
  id: number;
  message: string;
}

export type NewInstructor = Omit<Instructor, "id" | "createdAt" | "origin">;
export type NewFramework = Omit<Framework, "id" | "createdAt" | "origin">;
export type NewActivity = Omit<Activity, "id" | "createdAt" | "origin">;

interface StoreValue {
  data: AppData;
  hydrated: boolean;
  month: MonthKey;
  setMonth: (m: MonthKey) => void;

  addInstructor: (i: NewInstructor) => Instructor;
  updateInstructor: (id: ID, patch: Partial<Instructor>) => void;
  addFramework: (f: NewFramework) => Framework;
  updateFramework: (id: ID, patch: Partial<Framework>) => void;
  addActivity: (a: NewActivity) => Activity;
  updateActivity: (id: ID, patch: Partial<Activity>) => void;
  setReceipt: (instructorId: ID, month: MonthKey, status: ReceiptStatus) => void;
  markReminded: (instructorId: ID, month: MonthKey) => void;
  ackLoss: (instructorId: ID, month: MonthKey, value?: boolean) => void;
  closeMonth: (month: MonthKey, value?: boolean) => void;
  setSettings: (patch: Partial<Settings>) => void;
  resetDemo: () => void;

  flow: Flow | null;
  openFlow: (f: Flow) => void;
  closeFlow: () => void;
  addMenuOpen: boolean;
  setAddMenuOpen: (v: boolean) => void;

  toasts: Toast[];
  notify: (message: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({
  children,
  repository = localRepository,
}: {
  children: ReactNode;
  repository?: Repository;
}) {
  const [data, dispatch] = useReducer(reducer, undefined, createSeed);
  const [hydrated, setHydrated] = useState(false);
  const [month, setMonth] = useState<MonthKey>(CURRENT_MONTH);
  const [flow, setFlow] = useState<Flow | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const repo = useRef(repository);

  // Load once on the client, then save every change.
  useEffect(() => {
    const saved = repo.current.load();
    if (saved) dispatch({ type: "hydrate", data: saved });
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) repo.current.save(data);
  }, [data, hydrated]);

  const notify = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      data,
      hydrated,
      month,
      setMonth,
      addInstructor: (input) => {
        const instructor: Instructor = { ...input, id: newId("i"), origin: "user", createdAt: now() };
        dispatch({ type: "addInstructor", instructor });
        return instructor;
      },
      updateInstructor: (id, patch) => dispatch({ type: "updateInstructor", id, patch }),
      addFramework: (input) => {
        const framework: Framework = { ...input, id: newId("f"), origin: "user", createdAt: now() };
        dispatch({ type: "addFramework", framework });
        return framework;
      },
      updateFramework: (id, patch) => dispatch({ type: "updateFramework", id, patch }),
      addActivity: (input) => {
        const activity: Activity = { ...input, id: newId("a"), origin: "user", createdAt: now() };
        dispatch({ type: "addActivity", activity });
        return activity;
      },
      updateActivity: (id, patch) => dispatch({ type: "updateActivity", id, patch }),
      setReceipt: (instructorId, m, status) => dispatch({ type: "setReceipt", instructorId, month: m, status }),
      markReminded: (instructorId, m) => dispatch({ type: "remind", instructorId, month: m }),
      ackLoss: (instructorId, m, v = true) => dispatch({ type: "ackLoss", instructorId, month: m, value: v }),
      closeMonth: (m, v = true) => dispatch({ type: "closeMonth", month: m, value: v }),
      setSettings: (patch) => dispatch({ type: "settings", patch }),
      resetDemo: () => {
        repo.current.clear();
        dispatch({ type: "reset" });
        setMonth(CURRENT_MONTH);
      },
      flow,
      openFlow: (f) => {
        setAddMenuOpen(false);
        setFlow(f);
      },
      closeFlow: () => setFlow(null),
      addMenuOpen,
      setAddMenuOpen,
      toasts,
      notify,
    }),
    [data, hydrated, month, flow, addMenuOpen, toasts, notify],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
