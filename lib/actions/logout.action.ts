"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";

/**
 * Ends the current staff session and returns to the login page.
 *
 * Better Auth clears the session cookie through the nextCookies plugin. A
 * failure here is logged but not surfaced: whatever the server thinks, the
 * person pressing "Log out" should end up signed out rather than stuck on a
 * page with an error, and the DAL re-checks the session on the next request.
 */
export async function logoutAction() {
  const action = "logoutAction";

  try {
    await auth.api.signOut({ headers: await headers() });
  } catch (error) {
    logger.error({ action, error }, "failed to revoke session on sign out");
  }

  // Outside the try — redirect() signals by throwing, so catching it here
  // would swallow the navigation.
  redirect("/login");
}
