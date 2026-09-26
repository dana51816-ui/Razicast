import type { AppData } from "./types";

/**
 * Where the app's data lives. Today: this browser's localStorage.
 * Later: a Supabase implementation of the same interface — the store and all
 * business logic stay unchanged.
 */
export interface Repository {
  load(): AppData | null;
  save(data: AppData): void;
  clear(): void;
}

const KEY = "razicast-control:v3";

export const localRepository: Repository = {
  load() {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AppData;
      return parsed?.version === 3 ? parsed : null;
    } catch {
      return null;
    }
  },
  save(data) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      // Storage full or blocked (private mode, sandboxed preview): keep working in memory.
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
};
