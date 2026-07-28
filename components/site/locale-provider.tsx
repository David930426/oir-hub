"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";
import type { Locale, Localized } from "@/lib/i18n";
import { pick, pickParagraphs } from "@/lib/i18n";

/**
 * Holds the locale the visitor picked in the header. The ERD keeps a `*Zh` /
 * `*En` pair on every content row, so components read the active locale from
 * here rather than each choosing a column for themselves.
 *
 * The preference lives in localStorage and is read through
 * `useSyncExternalStore`, which keeps the server render ("en") and the
 * hydrated render consistent and syncs other tabs for free.
 */

const STORAGE_KEY = "oir-hub.locale";

/** Subscribers within this tab; the `storage` event covers the others. */
const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot(): Locale {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "zh-TW" || stored === "en" ? stored : "en";
}

/** The server has no preference to read, so it always renders English. */
function getServerSnapshot(): Locale {
  return "en";
}

function writeLocale(next: Locale) {
  window.localStorage.setItem(STORAGE_KEY, next);
  document.documentElement.lang = next;
  for (const notify of listeners) notify();
}

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /** Resolves a column pair for the active locale. */
  t: (value: Localized) => string;
  /** Resolves a body field into paragraphs for the active locale. */
  tp: (value: Localized) => string[];
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLocale = useCallback((next: Locale) => writeLocale(next), []);
  const t = useCallback((value: Localized) => pick(value, locale), [locale]);
  const tp = useCallback((value: Localized) => pickParagraphs(value, locale), [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, tp }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside a LocaleProvider");
  return ctx;
}
