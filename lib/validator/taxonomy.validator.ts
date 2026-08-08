import z from "zod";
import { CATEGORY_KINDS } from "@/constant";
import {
  idSchema,
  optionalText,
  requiredZh,
  slugSchema,
  sortOrderSchema,
} from "./common.validator";

/**
 * Categories and tags — the ERD's CATEGORIES and TAGS.
 *
 * Both carry a `*Zh` / `*En` name pair: Chinese is required, English optional.
 * The forms submit an empty string for a missing translation; the actions turn
 * that into NULL so `isUntranslated()` keeps working on the site.
 */

export const categoryKindSchema = z.enum(CATEGORY_KINDS);

const nameZhSchema = requiredZh("name");
const nameEnSchema = optionalText("Name");

export const createCategorySchema = z.object({
  slug: slugSchema,
  kind: categoryKindSchema,
  nameZh: nameZhSchema,
  nameEn: nameEnSchema,
  sortOrder: sortOrderSchema,
});

export const updateCategorySchema = createCategorySchema.extend({
  id: idSchema,
});

export const createTagSchema = z.object({
  slug: slugSchema,
  nameZh: nameZhSchema,
  nameEn: nameEnSchema,
});

export const updateTagSchema = createTagSchema.extend({ id: idSchema });

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type CategoryKindValue = z.infer<typeof categoryKindSchema>;
