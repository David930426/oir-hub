import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { STAFF_ROLES, WRITER_ROLES } from "@/constant";

/**
 * Data Access Layer.
 *
 * Every server component, server action, and route handler that needs to know
 * who the caller is must go through this file — never call `auth.api` directly
 * from a page. Centralising the check here means a route can only be reached
 * without a session if someone deliberately skips the DAL, rather than by
 * forgetting a guard.
 *
 * The public site (programs, bulletins, FAQs, the assistant) is deliberately
 * open to anonymous visitors. These guards exist for the staff console.
 */

// ---------- Roles ----------

/**
 * Roles that may enter the admin console — the ERD's USERS.role enum, and the
 * only roles that exist: there are no student accounts. The lists live in
 * constant.ts; these aliases keep the guards below readable.
 */
export const staffRoles = STAFF_ROLES;
export type StaffRole = (typeof staffRoles)[number];

/** Roles allowed to create or change content. Viewers are read-only. */
export const writerRoles = WRITER_ROLES satisfies readonly StaffRole[];

export function isStaffRole(role: string | null | undefined): role is StaffRole {
  return typeof role === "string" && (staffRoles as readonly string[]).includes(role);
}

// ---------- Session ----------

export type Session = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;
export type SessionUser = Session["user"];

/**
 * Reads the current session, or null when the caller is anonymous.
 *
 * Wrapped in `cache()` so several components in one render share a single
 * lookup instead of each hitting the session store.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  // Deactivating a user does not invalidate cookies they already hold, so a
  // session is only honoured while USERS.active is still true.
  if ((session.user as { active?: boolean }).active === false) return null;

  return session;
});

/** The signed-in user, or null when the caller is anonymous. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await getSession();
  return session?.user ?? null;
});

/** True when someone is signed in. Never throws — safe for optional UI. */
export async function isAuthenticated(): Promise<boolean> {
  return (await getSession()) !== null;
}

// ---------- Guards ----------

/**
 * Requires a signed-in caller. Anonymous visitors are sent to the staff login
 * instead of seeing the page.
 *
 * Because `redirect()` throws, everything after this call can assume a session
 * exists — that is the point of returning it rather than a boolean.
 */
export async function verifySession(redirectTo = "/login"): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(redirectTo);
  return session;
}

/**
 * Requires a signed-in caller holding one of `allowed`. Signed-in users with
 * the wrong role are sent back to the public site rather than the login page —
 * logging in again would not help them.
 */
export async function requireRole(
  allowed: readonly StaffRole[]
): Promise<Session> {
  const session = await verifySession();
  const role = (session.user as { role?: string }).role;

  if (!isStaffRole(role) || !allowed.includes(role)) redirect("/");

  return session;
}

/** Any staff member: admin, editor, or viewer. Gates the whole admin console. */
export async function requireStaff(): Promise<Session> {
  return requireRole(staffRoles);
}

/** Staff who may create or change content. Blocks viewers. */
export async function requireWriter(): Promise<Session> {
  return requireRole(writerRoles);
}

/** Administrators only — user management and deletion. */
export async function requireAdmin(): Promise<Session> {
  return requireRole(["admin"]);
}

// ---------- Non-redirecting checks ----------

/**
 * Role check that returns a boolean instead of redirecting, for hiding UI the
 * caller may not use. Always pair it with a `require*` guard on the action
 * itself — a hidden button is not access control.
 */
export async function hasRole(allowed: readonly StaffRole[]): Promise<boolean> {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  return isStaffRole(role) && allowed.includes(role);
}

export async function isStaff(): Promise<boolean> {
  return hasRole(staffRoles);
}

export async function isAdmin(): Promise<boolean> {
  return hasRole(["admin"]);
}
