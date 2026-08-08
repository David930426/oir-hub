import z from "zod";
import {
  BODY_MAX_LENGTH,
  FUNDING_SOURCES,
  MAX_FUNDING_AMOUNT,
  OPEN_STATUSES,
} from "@/constant";
import {
  idSchema,
  optionalEmailSchema,
  optionalIdSchema,
  optionalText,
  requiredZh,
  stringListSchema,
} from "./common.validator";

/**
 * Funding — the ERD's FUNDINGS: grants and scholarships.
 *
 * `programId` is optional, and an empty one means the grant is not tied to a
 * single program rather than that the field was forgotten.
 */

export const fundingSourceSchema = z.enum(FUNDING_SOURCES);
export const fundingStatusSchema = z.enum(OPEN_STATUSES);

export const createFundingSchema = z.object({
  programId: optionalIdSchema,
  nameZh: requiredZh("name"),
  nameEn: optionalText("Name"),
  source: fundingSourceSchema,
  eligibilityZh: requiredZh("eligibility", BODY_MAX_LENGTH),
  eligibilityEn: optionalText("Eligibility", BODY_MAX_LENGTH),
  /** Ceiling in TWD. */
  amountMax: z
    .number("Amount must be a number.")
    .int("Amount must be a whole number of TWD.")
    .min(0, "Amount cannot be negative.")
    .max(MAX_FUNDING_AMOUNT, "That amount looks too large — check the figure."),
  /** Months the call opens, as month numbers. */
  applyMonths: z
    .array(
      z
        .number()
        .int()
        .min(1, "Months run from 1 to 12.")
        .max(12, "Months run from 1 to 12."),
    ),
  requiredDocs: stringListSchema({ max: 20, itemMax: 200, label: "documents" }),
  notesZh: optionalText("Notes", BODY_MAX_LENGTH),
  notesEn: optionalText("Notes", BODY_MAX_LENGTH),
  contactName: optionalText("Contact name"),
  contactEmail: optionalEmailSchema,
  formFileId: optionalIdSchema,
  status: fundingStatusSchema,
});

export const updateFundingSchema = createFundingSchema.extend({ id: idSchema });

export const setFundingStatusSchema = z.object({
  id: idSchema,
  status: fundingStatusSchema,
});

export type CreateFundingInput = z.infer<typeof createFundingSchema>;
export type UpdateFundingInput = z.infer<typeof updateFundingSchema>;
export type SetFundingStatusInput = z.infer<typeof setFundingStatusSchema>;
export type FundingSourceValue = z.infer<typeof fundingSourceSchema>;
export type FundingStatusValue = z.infer<typeof fundingStatusSchema>;
