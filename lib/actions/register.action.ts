"use server";

import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import {
  findUserByEmail,
  findUserByStudentId,
} from "@/lib/repository/user.repository";
import {
  RegisterInput,
  registerSchema,
} from "@/lib/validator/register.validator";

export type RegisterResult =
  | { success: true }
  | { success: false; message: string };

export async function registerAction(
  input: RegisterInput
): Promise<RegisterResult> {
  const action = "registerAction"
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const { name, studentId, major, email, password } = parsed.data;

  try {
    if (await findUserByEmail(email)) {
      return {
        success: false,
        message: "An account with this email already exists.",
      };
    }

    if (await findUserByStudentId(studentId)) {
      return {
        success: false,
        message: "An account with this student ID already exists.",
      };
    }

    // Better Auth hashes the password, creates the user + credential account,
    // and starts a session (cookie is set via the nextCookies plugin).
    await auth.api.signUpEmail({
      body: { name, email, password, studentId, major },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof APIError) {
      return {
        success: false,
        message: error.body?.message ?? "Registration failed.",
      };
    }

    logger.error({ action, error }, "unexpected error during registration");
    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  }
}
