import z from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "Please enter your full name."),
  studentId: z.string(),
  major: z.string().min(2, "Please enter your major or department."),
  email: z.email("Please enter a valid email address."),
});

export type ProfileInput = z.infer<typeof profileSchema>;
