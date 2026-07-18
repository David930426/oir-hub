import z from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Please enter your full name."),
    studentId: z
      .string()
      .regex(/^[a-zA-Z]?\d{7,9}$/, "Please enter a valid student ID (e.g. s10712345)."),
    major: z.string().min(2, "Please enter your major or department."),
    email: z.email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
