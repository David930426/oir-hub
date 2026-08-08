import z from "zod";
import {
  BODY_MAX_LENGTH,
  MAX_HIGHLIGHTS,
  NAME_MAX_LENGTH,
  PUBLISH_STATUSES,
} from "@/constant";
import {
  idSchema,
  optionalIdSchema,
  optionalText,
  requiredZh,
  stringListSchema,
} from "./common.validator";

/**
 * Testimonials — the ERD's TESTIMONIALS, a report written by a student after
 * returning.
 *
 * `displayName` is whatever the student agreed to be called ("L 同學" is a
 * normal value), and publication is gated on `consentGiven` — enforced in the
 * action, since a form could always send both fields at once.
 */

export const testimonialStatusSchema = z.enum(PUBLISH_STATUSES);

export const createTestimonialSchema = z.object({
  partnerSchoolId: idSchema.describe("Choose the partner school."),
  displayName: z
    .string()
    .trim()
    .min(1, "Enter the name the student agreed to be shown as.")
    .max(NAME_MAX_LENGTH, "Name is too long."),
  deptYear: z
    .string()
    .trim()
    .min(1, "Enter the department and year, such as 資工系四年級.")
    .max(NAME_MAX_LENGTH, "Department and year is too long."),
  country: z.string().trim().min(1, "Country is required.").max(NAME_MAX_LENGTH),
  termLabel: z
    .string()
    .trim()
    .min(1, "Enter the term, such as 114-1.")
    .max(NAME_MAX_LENGTH, "Term is too long."),
  /** Short pull quotes shown above the body. */
  highlights: stringListSchema({
    max: MAX_HIGHLIGHTS,
    itemMax: 200,
    label: "highlights",
  }),
  bodyZh: requiredZh("report", BODY_MAX_LENGTH),
  bodyEn: optionalText("Report", BODY_MAX_LENGTH),
  fullTextFileId: optionalIdSchema,
  consentGiven: z.boolean(),
  status: testimonialStatusSchema,
});

export const updateTestimonialSchema = createTestimonialSchema.extend({
  id: idSchema,
});

export const setTestimonialStatusSchema = z.object({
  id: idSchema,
  status: testimonialStatusSchema,
});

export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>;
export type SetTestimonialStatusInput = z.infer<typeof setTestimonialStatusSchema>;
export type TestimonialStatusValue = z.infer<typeof testimonialStatusSchema>;
