"use server";

import { APIError } from "better-auth/api";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { LoginInput, loginSchema } from "@/lib/validator/login.validator";

export type LoginResult =
  | { success: true }
  | { success: false; message: string };

export async function loginAction(
  input: LoginInput,
  rememberMe = false,
): Promise<LoginResult> {
  const action = "loginAction";
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const { email, password } = parsed.data;

  try {
    // Better Auth verifies the credentials and starts a session
    // (cookie is set via the nextCookies plugin).
    await auth.api.signInEmail({
      body: { email, password, rememberMe },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof APIError) {
      return {
        success: false,
        message: error.body?.message ?? "Invalid email or password.",
      };
    }

    logger.error({ action, error }, "unexpected error during login");
    return {
      success: false,
      message: "Something went wrong. Please try again later.",
    };
  }
}
