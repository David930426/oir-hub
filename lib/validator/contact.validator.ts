import z from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Please enter your full name."),
  studentId: z
    .string()
    .regex(/^[a-zA-Z]?\d{7,9}$/, "Please enter a valid student ID (e.g. s10712345)."),
  major: z.string().min(2, "Please enter your major or department."),
  email: z.email("Please enter a valid email address."),
  question: z
    .string()
    .min(20, "Please describe your question in at least 20 characters."),
});

export type ContactInput = z.infer<typeof contactSchema>;
