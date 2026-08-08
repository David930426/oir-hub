import z from "zod";
import { CONTACT_BODY_MAX_LENGTH, NAME_MAX_LENGTH } from "@/constant";
import { idSchema } from "./common.validator";

/** Mirrors the CONTACT_MESSAGES columns: name, email, topic, body. */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(NAME_MAX_LENGTH, "Name is too long."),
  email: z.email("Please enter a valid email address."),
  topic: z.string().trim().min(1, "Please choose a topic."),
  body: z
    .string()
    .trim()
    .min(20, "Please describe your question in at least 20 characters.")
    .max(CONTACT_BODY_MAX_LENGTH, "Please shorten your message."),
  /**
   * Set when the assistant escalated the question, so staff can read the
   * transcript that led to it. Empty for a message sent from the contact page.
   */
  fromSessionId: z.string().optional(),
});

/** The row action behind "Mark resolved" in the console's inbox. */
export const setContactResolvedSchema = z.object({
  id: idSchema,
  resolved: z.boolean(),
});

export type ContactInput = z.infer<typeof contactSchema>;
export type SetContactResolvedInput = z.infer<typeof setContactResolvedSchema>;
