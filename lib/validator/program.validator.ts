import z from "zod";
import { BODY_MAX_LENGTH, PROGRAM_TYPES } from "@/constant";
import {
  idSchema,
  optionalText,
  requiredZh,
  slugSchema,
  sortOrderSchema,
} from "./common.validator";

/**
 * Programs — the ERD's PROGRAMS, the offering every bulletin, partner school
 * and funding call hangs off.
 */

export const programTypeSchema = z.enum(PROGRAM_TYPES);

export const createProgramSchema = z.object({
  slug: slugSchema,
  type: programTypeSchema,
  nameZh: requiredZh("name"),
  nameEn: optionalText("Name"),
  /** What the program is and who it suits — the first thing a student reads. */
  overviewZh: requiredZh("overview", BODY_MAX_LENGTH),
  overviewEn: optionalText("Overview", BODY_MAX_LENGTH),
  active: z.boolean(),
  sortOrder: sortOrderSchema,
});

export const updateProgramSchema = createProgramSchema.extend({ id: idSchema });

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
export type ProgramTypeValue = z.infer<typeof programTypeSchema>;
