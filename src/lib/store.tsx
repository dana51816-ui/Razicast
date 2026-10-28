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
import { requestPersistentStorage } from "./backup";
import { monthOf } from "./calc";
import { localRepository, type Repository } from "./repository";
import { applyClientRates } from "./clientRates";
import { removeDemo } from "./cleanup";
import { createEmpty, createSeed } from "./seed";
import type { Activity, AppData, Framework, ID, Instructor, InvoiceStatus, MonthKey, ReceiptStatus, Settings } from "./types";

/** The demo runs "today" inside September 2026, the month the brief describes. */
/** The demo data's "today". Used for the server render only; the device's real date replaces it on load. */
export const SEED_TODAY = "2026-09-26";

/** `?demo=1` starts from the demo data (tests, the guide's screenshots). Kept for the session. */
function demoPinned(): boolean {
  try {
    if (new URLSearchParams(window.location.search).get("demo") === "1") sessionStorage.setItem("razicast-demo", "1");
    return sessionStorage.getItem("razicast-demo") === "1";
  } catch {
    return false;
  }
}
/** Where an empty device starts: clean, or the demo when pinned. */
function startData(): AppData {
  return demoPinned() ? { ...createSeed(), settings: { ...createSeed().settings, demoRemoved: true } } : createEmpty();
}

/** The device's local date (yyyy-mm-dd). `?today=yyyy-mm-dd` pins it for demos and tests. */
function deviceToday(): string {
  const valid = (v: string | null) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
  try {
    const pinned = valid(new URLSearchParams(window.location.search).get("today")) ?? valid(sessionStorage.getItem("razicast-today"));
    if (pinned) {
      sessionStorage.setItem("razicast-today", pinned);
      return pinned;
    }
  } catch {
    /* storage blocked: fall through to the clock */
  }
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const now = () => new Date().toISOString();
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/* ───────────────────────── reducer ───────────────────────── */

type Action =
  | { type: "hydrate"; data: AppData }
  | { type: "addInstructor"; instructor: Instructor }
  | { type: "updateInstructor"; id: ID; patch: Partial<Instructor> }
  | { type: "addFramework"; framework: Framework }
  | { type: "updateFramework"; id: ID; patch: Partial<Framework> }
  | { type: "addActivity"; activity: Activity }
  | { type: "updateActivity"; id: ID; patch: Partial<Activity> }
  | { type: "deleteActivity"; id: ID }
  | { type: "setReceipt"; instructorId: ID; month: MonthKey; status: ReceiptStatus }
  | { type: "setInvoice"; frameworkId: ID; month: MonthKey; status: InvoiceStatus }
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
      return applyClientRates(removeDemo(action.data));
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
    case "deleteActivity":
      return { ...data, activities: data.activities.filter((a) => a.id !== action.id) };
    case "setReceipt":
      return { ...data, receipts: upsertReceipt(data, action.instructorId, action.month, { status: action.status }) };
    case "setInvoice": {
      const rest = (data.invoices ?? []).filter((r) => !(r.frameworkId === action.frameworkId && r.month === action.month));
      return { ...data, invoices: [...rest, { frameworkId: action.frameworkId, month: action.month, status: action.status, updatedAt: now() }] };
    }
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
  | {
      kind: "activity";
      instructorId?: ID;
      frameworkId?: ID;
      /** Start from an earlier activity: same people and place, today's date, current rates */
      repeatOf?: ID;
      /** Edit an existing activity in place */
      editId?: ID;
      /** Pre-set date (yyyy-mm-dd), e.g. from a day in the month pulse */
      date?: string;
    }
  | { kind: "activityDetail"; activityId: ID }
  | { kind: "backup" }
  | { kind: "instructor"; editId?: ID }
  | { kind: "framework"; editId?: ID }
  | { kind: "resolve"; activityId: ID };

interface Toast {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
}

export type NewInstructor = Omit<Instructor, "id" | "createdAt" | "origin">;
export type NewFramework = Omit<Framework, "id" | "createdAt" | "origin">;
export type NewActivity = Omit<Activity, "id" | "createdAt" | "origin">;

interface StoreValue {
  data: AppData;
  hydrated: boolean;
  /** The device's date, yyyy-mm-dd */
  today: string;
  currentMonth: MonthKey;
  month: MonthKey;
  setMonth: (m: MonthKey) => void;

  addInstructor: (i: NewInstructor) => Instructor;
  updateInstructor: (id: ID, patch: Partial<Instructor>) => void;
  addFramework: (f: NewFramework) => Framework;
  updateFramework: (id: ID, patch: Partial<Framework>) => void;
  addActivity: (a: NewActivity) => Activity;
  updateActivity: (id: ID, patch: Partial<Activity>) => void;
  /** Deletes and offers an undo toast */
  deleteActivity: (id: ID) => void;
  /** Replaces all data (restore from backup) */
  importData: (d: AppData) => void;
  setReceipt: (instructorId: ID, month: MonthKey, status: ReceiptStatus) => void;
  setInvoice: (frameworkId: ID, month: MonthKey, status: InvoiceStatus) => void;
  markReminded: (instructorId: ID, month: MonthKey) => void;
  ackLoss: (instructorId: ID, month: MonthKey, value?: boolean) => void;
  closeMonth: (month: MonthKey, value?: boolean) => void;
  setSettings: (patch: Partial<Settings>) => void;
  /** Erase this device's data and start clean (or from the demo when pinned) */
  resetData: () => void;

  flow: Flow | null;
  openFlow: (f: Flow) => void;
  closeFlow: () => void;
  addMenuOpen: boolean;
  setAddMenuOpen: (v: boolean) => void;

  toasts: Toast[];
  notify: (message: string, action?: Toast["action"]) => void;
  dismissToast: (id: number) => void;

  /** The opening sequence has finished — hero animations wait for it */
  introDone: boolean;
  setIntroDone: (v: boolean) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({
  children,
  repository = localRepository,
}: {
  children: ReactNode;
  repository?: Repository;
}) {
  const [data, dispatch] = useReducer(reducer, undefined, () => applyClientRates(createEmpty()));
  const [hydrated, setHydrated] = useState(false);
  const [today, setToday] = useState(SEED_TODAY);
  const currentMonth = monthOf(today);
  const [month, setMonth] = useState<MonthKey>(monthOf(SEED_TODAY));
  const [flow, setFlow] = useState<Flow | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [introDone, setIntroDone] = useState(false);
  const repo = useRef(repository);

  // Load once on the client, then save every change.
  useEffect(() => {
    const saved = repo.current.load();
    dispatch({ type: "hydrate", data: saved ?? startData() });
    const t = deviceToday();
    setToday(t);
    setMonth(monthOf(t));
    setHydrated(true);
    // Ask the browser to keep our data (helps against storage eviction)
    void requestPersistentStorage();
  }, []);
  useEffect(() => {
    if (hydrated) repo.current.save(data);
  }, [data, hydrated]);

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const notify = useCallback((message: string, action?: Toast["action"]) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, action }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), action ? 5200 : 2600);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      data,
      hydrated,
      today,
      currentMonth,
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
      deleteActivity: (id) => {
        const removed = data.activities.find((a) => a.id === id);
        if (!removed) return;
        dispatch({ type: "deleteActivity", id });
        notify("הפעילות נמחקה", { label: "ביטול", run: () => dispatch({ type: "addActivity", activity: removed }) });
      },
      importData: (d) => dispatch({ type: "hydrate", data: d }),
      setReceipt: (instructorId, m, status) => dispatch({ type: "setReceipt", instructorId, month: m, status }),
      setInvoice: (frameworkId, m, status) => dispatch({ type: "setInvoice", frameworkId, month: m, status }),
      markReminded: (instructorId, m) => dispatch({ type: "remind", instructorId, month: m }),
      ackLoss: (instructorId, m, v = true) => dispatch({ type: "ackLoss", instructorId, month: m, value: v }),
      closeMonth: (m, v = true) => dispatch({ type: "closeMonth", month: m, value: v }),
      setSettings: (patch) => dispatch({ type: "settings", patch }),
      resetData: () => {
        repo.current.clear();
        dispatch({ type: "hydrate", data: startData() });
        setMonth(currentMonth);
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
      dismissToast,
      introDone,
      setIntroDone,
    }),
    [data, hydrated, today, currentMonth, month, flow, addMenuOpen, toasts, notify, dismissToast, introDone],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
