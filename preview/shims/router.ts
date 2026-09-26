"use client";

/**
 * Tiny in-memory router used only by the preview build.
 * Stands in for next/navigation so the real screens run unchanged in a single-page Artifact.
 */
import { useSyncExternalStore } from "react";

type Listener = () => void;

let current = "/";
const listeners = new Set<Listener>();

function set(url: string) {
  current = url || "/";
  listeners.forEach((l) => l());
}

export function navigate(url: string, opts: { replace?: boolean; scroll?: boolean } = {}) {
  set(url);
  if (opts.scroll !== false) window.scrollTo({ top: 0 });
}

function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useUrl() {
  return useSyncExternalStore(subscribe, () => current, () => current);
}

export function splitUrl(url: string) {
  const i = url.indexOf("?");
  return { pathname: i === -1 ? url : url.slice(0, i), search: i === -1 ? "" : url.slice(i + 1) };
}
