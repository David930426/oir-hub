import z from "zod";
import {
  ACADEMIC_YEAR_ONLY_PATTERN,
  ACADEMIC_YEAR_PATTERN,
  MAX_SORT_ORDER,
  NAME_MAX_LENGTH,
  SLUG_MAX_LENGTH,
  SLUG_PATTERN,
  TITLE_MAX_LENGTH,
} from "@/constant";

/**
 * Field shapes every domain validator reuses.
 *
 * The ERD repeats itself by design — a slug, a `*Zh` / `*En` name pair, an
 * academic year, a sort order — so the rules and, more importantly, the
 * sentences shown when they are broken live here once. A domain validator
 * composes these and only spells out what is actually its own.
 *
 * Nothing here may import from `db/` or `dal.ts`: the client forms resolve
 * against these same schemas.
 */

/** A row id as it arrives from a form or a row action. */
export const idSchema = z.string().min(1, "Missing id.");

/** Optional reference to another row; the forms submit "" for "none". */
export const optionalIdSchema = z.string().or(z.literal(""));

export const slugSchema = z
  .string()
  .min(2, "A slug needs at least two characters.")
  .max(SLUG_MAX_LENGTH, "Slug is too long.")
  .regex(SLUG_PATTERN, "Use lowercase letters, numbers and single hyphens.");

/**
 * A required Chinese field. `label` names it, so the form shows "中文 question
 * is required." rather than a generic complaint.
 */
export function requiredZh(label: string, max = NAME_MAX_LENGTH) {
  return z
    .string()
    .trim()
    .min(1, `中文 ${label} is required.`)
    .max(max, `${label[0].toUpperCase()}${label.slice(1)} is too long.`);
}

/**
 * An optional field — an English translation, a note. Empty is allowed and the
 * action turns it into NULL with `emptyToNull()`.
 */
export function optionalText(label: string, max = NAME_MAX_LENGTH) {
  return z.string().trim().max(max, `${label} is too long.`);
}

export const titleZhSchema = requiredZh("title", TITLE_MAX_LENGTH);
export const titleEnSchema = optionalText("Title", TITLE_MAX_LENGTH);

/** An external link. Optional everywhere it appears. */
export const optionalUrlSchema = z
  .url("Enter a full URL, starting with http:// or https://.")
  .or(z.literal(""));

export const optionalEmailSchema = z
  .email("Enter a valid email address.")
  .or(z.literal(""));

/** `115-2` — year, then term 1 or 2. */
export const academicYearSchema = z
  .string()
  .regex(ACADEMIC_YEAR_PATTERN, "Write the year as 115-2 — year, then term 1 or 2.");

/** `115` — the year on its own, for rows that carry the term separately. */
export const academicYearOnlySchema = z
  .string()
  .regex(ACADEMIC_YEAR_ONLY_PATTERN, "Write the academic year as three digits: 115.");

/** Optional academic year, as the media and stats forms submit it. */
export const optionalAcademicYearSchema = academicYearSchema.or(z.literal(""));

/**
 * A calendar date as `<input type="date">` submits it. Postgres `date` columns
 * are read and written as strings by Drizzle, so it stays one all the way down.
 */
export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date.");

export const sortOrderSchema = z
  .number("Sort order must be a number.")
  .int("Sort order must be a whole number.")
  .min(0, "Sort order cannot be negative.")
  .max(MAX_SORT_ORDER, `Sort order must be ${MAX_SORT_ORDER} or less.`);

/**
 * A list of short strings the forms edit as chips — highlights, required
 * documents, topics. Blank entries are dropped rather than rejected: they are
 * an artefact of an empty row in the editor, not something to complain about.
 */
export function stringListSchema(options: {
  max: number;
  itemMax?: number;
  label: string;
}) {
  return z
    .array(z.string().trim().max(options.itemMax ?? NAME_MAX_LENGTH))
    .transform((values) => values.filter(Boolean))
    .refine(
      (values) => values.length <= options.max,
      `At most ${options.max} ${options.label}.`,
    );
}
