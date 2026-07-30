import { randomUUID } from "node:crypto";
import { and, count, desc, eq, max } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { db } from "@/db";
import { account, session, user } from "@/db/schema/auth.schema";
import { CREDENTIAL_PROVIDER_ID } from "@/constant";
import type {
  LocaleValue,
  StaffRoleValue,
} from "@/lib/validator/user.validator";

export async function findUserByEmail(email: string) {
  return db.query.user.findFirst({
    where: eq(user.email, email),
  });
}

export async function findUserById(id: string) {
  return db.query.user.findFirst({
    where: eq(user.id, id),
  });
}

/** A row of the admin users table, straight out of the database. */
export type StaffUserRecord = {
  id: string;
  name: string;
  email: string;
  role: StaffRoleValue;
  locale: string;
  active: boolean;
  createdAt: Date;
  /** Newest session start for this account, or null if they never signed in. */
  lastLoginAt: Date | null;
};

/**
 * Every staff account, newest first.
 *
 * There is no USERS.lastLoginAt column in the ERD, so "last login" is derived
 * from the most recent SESSIONS row — which is what actually records a sign-in.
 * Expired sessions are pruned by Better Auth, so this reads "recently seen"
 * rather than "ever": accounts whose sessions have all aged out show as never.
 */
export async function listStaffUsers(): Promise<StaffUserRecord[]> {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      locale: user.locale,
      active: user.active,
      createdAt: user.createdAt,
      lastLoginAt: max(session.createdAt),
    })
    .from(user)
    .leftJoin(session, eq(session.userId, user.id))
    .groupBy(user.id)
    .orderBy(desc(user.createdAt));
}

/** How many accounts still hold the admin role and can sign in. */
export async function countActiveAdmins(): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(user)
    .where(and(eq(user.role, "admin"), eq(user.active, true)));

  return row?.total ?? 0;
}

/**
 * Creates a staff account with a credential the login form can verify.
 *
 * Written directly rather than through `auth.api.signUpEmail` for the same
 * reasons as seed.ts: sign-up is disabled in lib/auth.ts, and `role` is
 * declared `input: false` there so it cannot be supplied at sign-up anyway.
 * The hash comes from better-auth's own `hashPassword`, the hasher configured
 * for this app, so the stored credential matches what login checks against.
 */
export async function createStaffUser(input: {
  name: string;
  email: string;
  role: StaffRoleValue;
  locale: LocaleValue;
  password: string;
}): Promise<string> {
  const id = randomUUID();
  const hash = await hashPassword(input.password);

  await db.transaction(async (tx) => {
    await tx.insert(user).values({
      id,
      name: input.name,
      email: input.email,
      // No verification mail is wired up, so an address an admin typed in is
      // treated as trusted — same assumption seed.ts makes.
      emailVerified: true,
      role: input.role,
      locale: input.locale,
      active: true,
    });

    await tx.insert(account).values({
      id: randomUUID(),
      userId: id,
      accountId: id,
      providerId: CREDENTIAL_PROVIDER_ID,
      password: hash,
    });
  });

  return id;
}

/**
 * Applies the edit form's fields.
 *
 * Deactivating here drops the account's sessions for the same reason
 * {@link setUserActive} does — the change should take effect now, not on the
 * colleague's next request.
 */
export async function updateStaffUser(input: {
  id: string;
  name: string;
  role: StaffRoleValue;
  locale: LocaleValue;
  active: boolean;
}) {
  await db.transaction(async (tx) => {
    await tx
      .update(user)
      .set({
        name: input.name,
        role: input.role,
        locale: input.locale,
        active: input.active,
      })
      .where(eq(user.id, input.id));

    if (!input.active) {
      await tx.delete(session).where(eq(session.userId, input.id));
    }
  });
}

/**
 * Flips USERS.active.
 *
 * Deactivating also drops the account's sessions. dal.ts already refuses to
 * honour a session whose user is inactive, but deleting them means a
 * deactivated colleague is signed out now rather than on their next request.
 */
export async function setUserActive(id: string, active: boolean) {
  await db.transaction(async (tx) => {
    await tx.update(user).set({ active }).where(eq(user.id, id));
    if (!active) {
      await tx.delete(session).where(eq(session.userId, id));
    }
  });
}

/**
 * Replaces the account's password, creating the credential row if the user
 * somehow has none, and signs them out of existing sessions.
 */
export async function setUserPassword(id: string, password: string) {
  const hash = await hashPassword(password);

  const credential = await db.query.account.findFirst({
    where: eq(account.userId, id),
  });

  await db.transaction(async (tx) => {
    if (credential && credential.providerId === CREDENTIAL_PROVIDER_ID) {
      await tx
        .update(account)
        .set({ password: hash })
        .where(eq(account.id, credential.id));
    } else {
      await tx.insert(account).values({
        id: randomUUID(),
        userId: id,
        accountId: id,
        providerId: CREDENTIAL_PROVIDER_ID,
        password: hash,
      });
    }

    // A password change should invalidate whatever was issued under the old one.
    await tx.delete(session).where(eq(session.userId, id));
  });
}
