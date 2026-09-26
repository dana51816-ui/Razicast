"use client";

import { useMemo } from "react";
import { navigate, splitUrl, useUrl } from "./router";

export function usePathname() {
  return splitUrl(useUrl()).pathname;
}

export function useSearchParams() {
  const { search } = splitUrl(useUrl());
  return useMemo(() => new URLSearchParams(search), [search]);
}

export function useRouter() {
  return {
    push: (url: string, opts?: { scroll?: boolean }) => navigate(url, opts),
    replace: (url: string, opts?: { scroll?: boolean }) => navigate(url, { ...opts, replace: true }),
    back: () => navigate("/"),
    refresh: () => {},
    prefetch: () => {},
  };
}
