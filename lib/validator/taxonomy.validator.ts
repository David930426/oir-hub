import z from "zod";
import {
  CATEGORY_KINDS,
  MAX_SORT_ORDER,
  NAME_MAX_LENGTH,
  SLUG_MAX_LENGTH,
  SLUG_PATTERN,
} from "@/constant";

/**
 * Categories and tags — the ERD's CATEGORIES and TAGS.
 *
 * Both carry a `*Zh` / `*En` name pair: Chinese is required, English optional.
 * The forms submit an empty string for a missing translation; the actions turn
 * that into NULL so `isUntranslated()` keeps working on the site.
 */

export const categoryKindSchema = z.enum(CATEGORY_KINDS);

const slugSchema = z
  .string()
  .min(2, "A slug needs at least two characters.")
  .max(SLUG_MAX_LENGTH, "Slug is too long.")
  .regex(SLUG_PATTERN, "Use lowercase letters, numbers and single hyphens.");

const nameZhSchema = z
  .string()
  .min(1, "中文 name is required.")
  .max(NAME_MAX_LENGTH, "Name is too long.");

const nameEnSchema = z.string().max(NAME_MAX_LENGTH, "Name is too long.");

export const createCategorySchema = z.object({
  slug: slugSchema,
  kind: categoryKindSchema,
  nameZh: nameZhSchema,
  nameEn: nameEnSchema,
  sortOrder: z
    .number("Sort order must be a number.")
    .int("Sort order must be a whole number.")
    .min(0, "Sort order cannot be negative.")
    .max(MAX_SORT_ORDER, `Sort order must be ${MAX_SORT_ORDER} or less.`),
});

export const updateCategorySchema = createCategorySchema.extend({
  id: z.string().min(1),
});

export const createTagSchema = z.object({
  slug: slugSchema,
  nameZh: nameZhSchema,
  nameEn: nameEnSchema,
});

export const updateTagSchema = createTagSchema.extend({
  id: z.string().min(1),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type CategoryKindValue = z.infer<typeof categoryKindSchema>;
