import z from "zod";
import { OPEN_STATUSES, TERM_VALUES } from "@/constant";
import {
  academicYearOnlySchema,
  dateStringSchema,
  idSchema,
  optionalIdSchema,
  requiredZh,
  titleEnSchema,
  titleZhSchema,
} from "./common.validator";

/**
 * Bulletins — the ERD's BULLETINS, a selection call (簡章) for one program,
 * term and region.
 *
 * The deadline is the single most consequential field on the site, so it is
 * checked against the announcement date here rather than trusted from the form.
 */

export const bulletinStatusSchema = z.enum(OPEN_STATUSES);
export const termSchema = z.enum(TERM_VALUES);

export const createBulletinSchema = z
  .object({
    programId: idSchema.describe("Choose a program."),
    academicYear: academicYearOnlySchema,
    term: termSchema,
    titleZh: titleZhSchema,
    titleEn: titleEnSchema,
    region: requiredZh("region"),
    /** The binding PDF; empty until the document has been uploaded. */
    pdfFileId: optionalIdSchema,
    announcedAt: dateStringSchema,
    deadlineAt: dateStringSchema,
    status: bulletinStatusSchema,
  })
  .refine((input) => input.deadlineAt >= input.announcedAt, {
    message: "The deadline cannot fall before the announcement date.",
    path: ["deadlineAt"],
  });

/**
 * `.refine()` returns a schema that can no longer be extended, so the update
 * shape re-states the object and re-applies the same rule.
 */
export const updateBulletinSchema = z
  .object({
    id: idSchema,
    programId: idSchema.describe("Choose a program."),
    academicYear: academicYearOnlySchema,
    term: termSchema,
    titleZh: titleZhSchema,
    titleEn: titleEnSchema,
    region: requiredZh("region"),
    pdfFileId: optionalIdSchema,
    announcedAt: dateStringSchema,
    deadlineAt: dateStringSchema,
    status: bulletinStatusSchema,
  })
  .refine((input) => input.deadlineAt >= input.announcedAt, {
    message: "The deadline cannot fall before the announcement date.",
    path: ["deadlineAt"],
  });

export const setBulletinStatusSchema = z.object({
  id: idSchema,
  status: bulletinStatusSchema,
});

export type CreateBulletinInput = z.infer<typeof createBulletinSchema>;
export type UpdateBulletinInput = z.infer<typeof updateBulletinSchema>;
export type SetBulletinStatusInput = z.infer<typeof setBulletinStatusSchema>;
export type BulletinStatusValue = z.infer<typeof bulletinStatusSchema>;
export type TermValue = z.infer<typeof termSchema>;
