import z from "zod";
import { BODY_MAX_LENGTH, FAQ_AUDIENCES, LABEL_MAX_LENGTH, TITLE_MAX_LENGTH } from "@/constant";
import {
  idSchema,
  optionalIdSchema,
  optionalText,
  optionalUrlSchema,
  requiredZh,
} from "./common.validator";

/**
 * FAQs — the ERD's FAQS and FAQ_SOURCES.
 *
 * Both answers are required in Chinese: the short one is what the site and the
 * assistant quote first, the long one is what a student reads when the short
 * one was not enough. Sources are edited with the answer, since an answer whose
 * citation was saved separately could go out uncited.
 */

export const faqAudienceSchema = z.enum(FAQ_AUDIENCES);

/**
 * One citation. A source points at an uploaded file, an external page, or both
 * — but a label alone would tell a student nothing they could check.
 */
export const faqSourceSchema = z
  .object({
    mediaFileId: optionalIdSchema,
    sourceUrl: optionalUrlSchema,
    label: z
      .string()
      .trim()
      .min(1, "Give the source a label, such as “115-2 簡章 p.3”.")
      .max(LABEL_MAX_LENGTH, "Label is too long."),
  })
  .refine(
    (source) => Boolean(source.mediaFileId || source.sourceUrl),
    "A source needs either a file or a link.",
  );

export const createFaqSchema = z.object({
  categoryId: idSchema.describe("Choose a category."),
  questionZh: requiredZh("question", TITLE_MAX_LENGTH),
  questionEn: optionalText("Question", TITLE_MAX_LENGTH),
  shortAnswerZh: requiredZh("short answer", 500),
  shortAnswerEn: optionalText("Short answer", 500),
  longAnswerZh: requiredZh("long answer", BODY_MAX_LENGTH),
  longAnswerEn: optionalText("Long answer", BODY_MAX_LENGTH),
  audience: faqAudienceSchema,
  /** High-risk answers the assistant must escalate rather than answer. */
  needsHumanConfirm: z.boolean(),
  published: z.boolean(),
  sources: z.array(faqSourceSchema),
});

export const updateFaqSchema = createFaqSchema.extend({ id: idSchema });

export const setFaqPublishedSchema = z.object({
  id: idSchema,
  published: z.boolean(),
});

export type CreateFaqInput = z.infer<typeof createFaqSchema>;
export type UpdateFaqInput = z.infer<typeof updateFaqSchema>;
export type FaqSourceInput = z.infer<typeof faqSourceSchema>;
export type SetFaqPublishedInput = z.infer<typeof setFaqPublishedSchema>;
export type FaqAudienceValue = z.infer<typeof faqAudienceSchema>;
