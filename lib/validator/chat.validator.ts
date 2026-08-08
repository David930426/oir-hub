import z from "zod";
import {
  CHAT_MESSAGE_MAX_LENGTH,
  COMMENT_MAX_LENGTH,
  CONFIDENCE_SCALE_MAX,
  CONFIDENCE_SCALE_MIN,
  FEEDBACK_REASONS,
  LOCALE_VALUES,
  SUS_ITEM_COUNT,
  SUS_SCALE_MAX,
  SUS_SCALE_MIN,
} from "@/constant";
import { idSchema } from "./common.validator";

/**
 * The public assistant — the ERD's CHAT_SESSIONS, CHAT_MESSAGES,
 * CHAT_FEEDBACK and SURVEY_RESPONSES.
 *
 * Everything here is submitted by anonymous visitors, so the limits are the
 * only thing standing between the endpoint and a pasted novel: there is no
 * account to rate-limit against.
 */

export const feedbackReasonSchema = z.enum(FEEDBACK_REASONS);

export const startChatSessionSchema = z.object({
  /** A UUID the browser generates and keeps; there is no login. */
  anonId: z.uuid("Missing session identifier."),
  locale: z.enum(LOCALE_VALUES).default("zh-TW"),
});

export const sendChatMessageSchema = z.object({
  sessionId: idSchema,
  content: z
    .string()
    .trim()
    .min(2, "Please type a question.")
    .max(CHAT_MESSAGE_MAX_LENGTH, "That question is too long — please shorten it."),
});

export const rateMessageSchema = z
  .object({
    messageId: idSchema,
    /** 1 = thumbs up, -1 = thumbs down. */
    rating: z.union([z.literal(1), z.literal(-1)]),
    reason: feedbackReasonSchema.optional(),
    comment: z
      .string()
      .trim()
      .max(COMMENT_MAX_LENGTH, "Please keep the comment shorter."),
  })
  .refine((input) => input.rating === -1 || !input.reason, {
    message: "A reason only applies to a thumbs-down.",
    path: ["reason"],
  });

const susScore = z
  .number()
  .int()
  .min(SUS_SCALE_MIN, `Answers run from ${SUS_SCALE_MIN} to ${SUS_SCALE_MAX}.`)
  .max(SUS_SCALE_MAX, `Answers run from ${SUS_SCALE_MIN} to ${SUS_SCALE_MAX}.`);

const confidenceScore = z
  .number()
  .int()
  .min(CONFIDENCE_SCALE_MIN)
  .max(CONFIDENCE_SCALE_MAX)
  .optional();

export const submitSurveySchema = z.object({
  sessionId: idSchema,
  /** The ten System Usability Scale statements, in order. */
  susAnswers: z
    .array(susScore)
    .length(SUS_ITEM_COUNT, `Please answer all ${SUS_ITEM_COUNT} statements.`),
  confidenceBefore: confidenceScore,
  confidenceAfter: confidenceScore,
  comment: z
    .string()
    .trim()
    .max(COMMENT_MAX_LENGTH, "Please keep the comment shorter."),
});

export type StartChatSessionInput = z.infer<typeof startChatSessionSchema>;
export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;
export type RateMessageInput = z.infer<typeof rateMessageSchema>;
export type SubmitSurveyInput = z.infer<typeof submitSurveySchema>;
export type FeedbackReasonValue = z.infer<typeof feedbackReasonSchema>;
