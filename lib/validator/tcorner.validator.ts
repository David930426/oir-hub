import z from "zod";
import { NAME_MAX_LENGTH, TIME_PATTERN, WEEKDAYS } from "@/constant";
import {
  idSchema,
  optionalUrlSchema,
  stringListSchema,
} from "./common.validator";

/**
 * T-Corner — the ERD's TCORNER_SLOTS, the office's weekly walk-in advising
 * hours.
 *
 * Times are wall-clock strings (`12:10`) rather than timestamps: a slot recurs
 * every week and belongs to no particular date.
 */

export const weekdaySchema = z.enum(WEEKDAYS);

const timeSchema = z
  .string()
  .regex(TIME_PATTERN, "Write the time as 12:10, on a 24-hour clock.");

export const createTcornerSlotSchema = z
  .object({
    weekday: weekdaySchema,
    startTime: timeSchema,
    endTime: timeSchema,
    location: z
      .string()
      .trim()
      .min(1, "Where does the session take place?")
      .max(NAME_MAX_LENGTH, "Location is too long."),
    advisorName: z
      .string()
      .trim()
      .min(1, "Who is advising?")
      .max(NAME_MAX_LENGTH, "Name is too long."),
    /** The staff account responsible for the slot. */
    hostUserId: idSchema.describe("Choose the host."),
    /** What a student may ask about in this session. */
    topics: stringListSchema({ max: 12, itemMax: 100, label: "topics" }),
    bookingRequired: z.boolean(),
    bookingUrl: optionalUrlSchema,
    active: z.boolean(),
  })
  // Compared as strings on purpose: zero-padded 24-hour times sort the same way
  // they run.
  .refine((input) => input.endTime > input.startTime, {
    message: "The session has to end after it starts.",
    path: ["endTime"],
  })
  .refine((input) => !input.bookingRequired || Boolean(input.bookingUrl), {
    message: "Add the booking link, or turn booking off.",
    path: ["bookingUrl"],
  });

export const updateTcornerSlotSchema = z
  .object({
    id: idSchema,
    weekday: weekdaySchema,
    startTime: timeSchema,
    endTime: timeSchema,
    location: z
      .string()
      .trim()
      .min(1, "Where does the session take place?")
      .max(NAME_MAX_LENGTH, "Location is too long."),
    advisorName: z
      .string()
      .trim()
      .min(1, "Who is advising?")
      .max(NAME_MAX_LENGTH, "Name is too long."),
    hostUserId: idSchema.describe("Choose the host."),
    topics: stringListSchema({ max: 12, itemMax: 100, label: "topics" }),
    bookingRequired: z.boolean(),
    bookingUrl: optionalUrlSchema,
    active: z.boolean(),
  })
  .refine((input) => input.endTime > input.startTime, {
    message: "The session has to end after it starts.",
    path: ["endTime"],
  })
  .refine((input) => !input.bookingRequired || Boolean(input.bookingUrl), {
    message: "Add the booking link, or turn booking off.",
    path: ["bookingUrl"],
  });

export type CreateTcornerSlotInput = z.infer<typeof createTcornerSlotSchema>;
export type UpdateTcornerSlotInput = z.infer<typeof updateTcornerSlotSchema>;
export type WeekdayValue = z.infer<typeof weekdaySchema>;
