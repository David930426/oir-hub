import z from "zod";
import { LOCALE_VALUES, PASSWORD_MIN_LENGTH, STAFF_ROLES } from "@/constant";

/**
 * Staff account input shapes.
 *
 * The enums come from constant.ts rather than from db/schema or dal.ts: those
 * are server-only, and these schemas are shared with the client forms that
 * submit them.
 */

export const staffRoleSchema = z.enum(STAFF_ROLES);
export const localeSchema = z.enum(LOCALE_VALUES);

const passwordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
  );

export const createStaffUserSchema = z.object({
  name: z
    .string()
    .min(2, "Please enter the staff member's full name.")
    .max(120, "Name is too long."),
  email: z.email("Please enter a valid email address."),
  role: staffRoleSchema,
  locale: localeSchema,
  // No mail is wired up yet, so the administrator sets the first password and
  // passes it on out of band instead of an invitation being sent.
  password: passwordSchema,
});

/**
 * Editing an existing account. The email is deliberately absent: it is the
 * login identity, so changing it is a separate, deliberate operation rather
 * than a field someone can overwrite while fixing a typo in a name.
 */
export const updateStaffUserSchema = z.object({
  id: z.string().min(1),
  name: z
    .string()
    .min(2, "Please enter the staff member's full name.")
    .max(120, "Name is too long."),
  role: staffRoleSchema,
  locale: localeSchema,
  active: z.boolean(),
});

export const resetPasswordSchema = z.object({
  userId: z.string().min(1),
  password: passwordSchema,
});

export type CreateStaffUserInput = z.infer<typeof createStaffUserSchema>;
export type UpdateStaffUserInput = z.infer<typeof updateStaffUserSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type StaffRoleValue = z.infer<typeof staffRoleSchema>;
export type LocaleValue = z.infer<typeof localeSchema>;
