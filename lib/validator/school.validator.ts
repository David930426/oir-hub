import z from "zod";
import { MAX_GPA, MAX_QUOTA, NAME_MAX_LENGTH } from "@/constant";
import {
  idSchema,
  optionalIdSchema,
  optionalText,
  optionalUrlSchema,
  requiredZh,
  stringListSchema,
} from "./common.validator";

/**
 * Partner schools — the ERD's PARTNER_SCHOOLS: a signed agreement and the
 * thresholds a student must clear to be nominated to it.
 *
 * `languageReq` and `eligibleColleges` are JSONB columns, so their shape is
 * only ever checked here — the database will take any JSON at all.
 */

/** One threshold a school accepts, e.g. JLPT N2 or TOEFL iBT 79. */
export const languageRequirementSchema = z.object({
  test: z.string().trim().min(1, "Name the test, such as TOEFL or JLPT."),
  score: z.string().trim().min(1, "Give the score or level required."),
});

export const createPartnerSchoolSchema = z.object({
  programId: idSchema.describe("Choose a program."),
  nameZh: requiredZh("name"),
  nameEn: optionalText("Name"),
  country: z.string().trim().min(1, "Country is required.").max(NAME_MAX_LENGTH),
  region: z.string().trim().min(1, "Region is required.").max(NAME_MAX_LENGTH),
  quota: z
    .number("Quota must be a number.")
    .int("Quota must be a whole number.")
    .min(0, "Quota cannot be negative.")
    .max(MAX_QUOTA, `Quota must be ${MAX_QUOTA} or less.`),
  gpaMin: z
    .number("Minimum GPA must be a number.")
    .min(0, "GPA cannot be negative.")
    .max(MAX_GPA, `GPA must be ${MAX_GPA} or less.`),
  languageReq: z.array(languageRequirementSchema),
  /** Department or college codes allowed to apply; empty means no restriction. */
  eligibleColleges: stringListSchema({ max: 40, label: "colleges" }),
  englishTaught: z.boolean(),
  housingProvided: z.boolean(),
  websiteUrl: optionalUrlSchema,
  briefFileId: optionalIdSchema,
  active: z.boolean(),
});

export const updatePartnerSchoolSchema = createPartnerSchoolSchema.extend({
  id: idSchema,
});

export type CreatePartnerSchoolInput = z.infer<typeof createPartnerSchoolSchema>;
export type UpdatePartnerSchoolInput = z.infer<typeof updatePartnerSchoolSchema>;
export type LanguageRequirementInput = z.infer<typeof languageRequirementSchema>;
