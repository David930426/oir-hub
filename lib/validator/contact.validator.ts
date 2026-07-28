import z from "zod";

/** Mirrors the CONTACT_MESSAGES columns: name, email, topic, body. */
export const contactSchema = z.object({
  name: z.string().min(2, "Please enter your full name."),
  email: z.email("Please enter a valid email address."),
  topic: z.string().min(1, "Please choose a topic."),
  body: z
    .string()
    .min(20, "Please describe your question in at least 20 characters."),
});

export type ContactInput = z.infer<typeof contactSchema>;
