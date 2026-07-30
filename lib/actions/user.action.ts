"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/dal";
import { logger } from "@/lib/logger";
import { GENERIC_ACTION_ERROR, PG_UNIQUE_VIOLATION } from "@/constant";
import {
  countActiveAdmins,
  createStaffUser,
  findUserByEmail,
  findUserById,
  setUserActive,
  setUserPassword,
  updateStaffUser,
} from "@/lib/repositories/user.repository";
import {
  createStaffUserSchema,
  resetPasswordSchema,
  updateStaffUserSchema,
  type CreateStaffUserInput,
  type ResetPasswordInput,
  type UpdateStaffUserInput,
} from "@/lib/validator/user.validator";

/**
 * Staff account management. Every action re-checks `requireAdmin()` — the page
 * layout guards the screen, but an action is its own entry point and a hidden
 * button is not access control.
 */

export type ActionResult =
  | { success: true; message: string }
  | { success: false; message: string };

/** Postgres unique-violation, surfaced through Drizzle's wrapped driver error. */
function isUniqueViolation(error: unknown): boolean {
  const code =
    (error as { code?: string })?.code ??
    (error as { cause?: { code?: string } })?.cause?.code;
  return code === PG_UNIQUE_VIOLATION;
}

// ---------- Create ----------

export async function createStaffUserAction(
  input: CreateStaffUserInput,
): Promise<ActionResult> {
  const action = "createStaffUserAction";
  await requireAdmin();

  const parsed = createStaffUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const name = parsed.data.name.trim();

  try {
    if (await findUserByEmail(email)) {
      return { success: false, message: "An account with that email already exists." };
    }

    await createStaffUser({ ...parsed.data, email, name });
  } catch (error) {
    // Two admins creating the same address at once lose the race here rather
    // than at the check above.
    if (isUniqueViolation(error)) {
      return { success: false, message: "An account with that email already exists." };
    }

    logger.error({ action, error }, "failed to create staff account");
    return { success: false, message: GENERIC_ACTION_ERROR };
  }

  revalidatePath("/admin/users");
  return { success: true, message: `${name} can now sign in with ${email}.` };
}

// ---------- Update ----------

export async function updateStaffUserAction(
  input: UpdateStaffUserInput,
): Promise<ActionResult> {
  const action = "updateStaffUserAction";
  const session = await requireAdmin();

  const parsed = updateStaffUserSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const { id, role, active } = parsed.data;
  const name = parsed.data.name.trim();
  const isSelf = id === session.user.id;

  // Neither of these is recoverable from inside the console.
  if (isSelf && role !== "admin") {
    return { success: false, message: "You cannot change your own role." };
  }
  if (isSelf && !active) {
    return { success: false, message: "You cannot deactivate your own account." };
  }

  try {
    const target = await findUserById(id);
    if (!target) return { success: false, message: "That account no longer exists." };

    // The console must keep at least one admin who can actually sign in.
    const losesAdmin =
      target.role === "admin" && target.active && (role !== "admin" || !active);
    if (losesAdmin && (await countActiveAdmins()) <= 1) {
      return {
        success: false,
        message: "This is the last active administrator — promote someone else first.",
      };
    }

    await updateStaffUser({ ...parsed.data, name });
  } catch (error) {
    logger.error({ action, error, userId: id }, "failed to update staff account");
    return { success: false, message: GENERIC_ACTION_ERROR };
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${id}/edit`);
  return { success: true, message: `${name}'s account has been updated.` };
}

// ---------- Activate / deactivate ----------

export async function setUserActiveAction(
  userId: string,
  active: boolean,
): Promise<ActionResult> {
  const action = "setUserActiveAction";
  const session = await requireAdmin();

  // Locking yourself out of the console is not a recoverable mistake from
  // inside the console.
  if (!active && userId === session.user.id) {
    return { success: false, message: "You cannot deactivate your own account." };
  }

  try {
    const target = await findUserById(userId);
    if (!target) return { success: false, message: "That account no longer exists." };
    if (target.active === active) {
      return {
        success: true,
        message: `${target.name} is already ${active ? "active" : "inactive"}.`,
      };
    }

    // The console must keep at least one admin who can actually sign in.
    if (!active && target.role === "admin" && (await countActiveAdmins()) <= 1) {
      return {
        success: false,
        message: "This is the last active administrator — promote someone else first.",
      };
    }

    await setUserActive(userId, active);

    revalidatePath("/admin/users");
    return {
      success: true,
      message: active
        ? `${target.name} can sign in again.`
        : `${target.name} has been signed out and can no longer sign in.`,
    };
  } catch (error) {
    logger.error({ action, error, userId }, "failed to change account status");
    return { success: false, message: GENERIC_ACTION_ERROR };
  }
}

// ---------- Reset password ----------

export async function resetUserPasswordAction(
  input: ResetPasswordInput,
): Promise<ActionResult> {
  const action = "resetUserPasswordAction";
  await requireAdmin();

  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    const target = await findUserById(parsed.data.userId);
    if (!target) return { success: false, message: "That account no longer exists." };

    await setUserPassword(target.id, parsed.data.password);

    revalidatePath("/admin/users");
    return {
      success: true,
      message: `${target.name} has been signed out and must use the new password.`,
    };
  } catch (error) {
    logger.error({ action, error }, "failed to reset password");
    return { success: false, message: GENERIC_ACTION_ERROR };
  }
}
