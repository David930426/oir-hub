/**
 * Bilingual content helpers.
 *
 * The ERD stores every user-facing string as a `*Zh` / `*En` column pair where
 * Chinese is required and English is optional. The mock layer mirrors that with
 * a single `Localized` object so pages never have to branch on column names.
 */

export type Locale = "zh-TW" | "en";

export const locales: { value: Locale; label: string; short: string }[] = [
  { value: "en", label: "English", short: "EN" },
  { value: "zh-TW", label: "繁體中文", short: "中文" },
];

/** A `*Zh` / `*En` column pair. `en` is optional, exactly as in the ERD. */
export type Localized = { zh: string; en?: string | null };

/**
 * Resolves a column pair for the active locale, falling back to Chinese when
 * the English translation has not been written yet.
 */
export function pick(value: Localized, locale: Locale): string {
  if (locale === "en" && value.en && value.en.trim()) return value.en;
  return value.zh;
}

/** Same as {@link pick}, but splits a body field into renderable paragraphs. */
export function pickParagraphs(value: Localized, locale: Locale): string[] {
  return pick(value, locale)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** True when the English translation for a field is still missing. */
export function isUntranslated(value: Localized): boolean {
  return !value.en || !value.en.trim();
}
