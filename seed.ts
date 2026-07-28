import "dotenv/config";

import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { db } from "@/db";
import { account, user } from "@/db/schema/auth.schema";

/**
 * Seeds the first administrator so someone can actually get into the console.
 *
 * Run it with:
 *   pnpm seed
 *   pnpm seed --email=ylchen@thu.edu.tw --name="Chen Yi-Ling" --password=secret
 *   pnpm seed --force            # also reset the password of an existing user
 *
 * It writes the `user` and `account` rows directly rather than going through
 * `auth.api.signUpEmail`, for two reasons: the `nextCookies` plugin expects a
 * request context that does not exist in a CLI script, and `role` is declared
 * `input: false` in lib/auth.ts, so it cannot be set at sign-up anyway.
 *
 * The password is hashed with better-auth's own `hashPassword`, which is the
 * default hasher configured in lib/auth.ts — so the credential this creates is
 * exactly what the login form verifies against.
 */

const DEFAULTS = {
  email: "admin@thu.edu.tw",
  name: "admin",
  password: "admin123"
};

// ---------- Arguments ----------

type Args = {
  email: string;
  name: string;
  password: string;
  /** True when the password came from a flag or env, not from DEFAULTS. */
  passwordExplicit: boolean;
  force: boolean;
};

function parseArgs(): Args {
  const flags = new Map<string, string>();
  let force = false;

  for (const arg of process.argv.slice(2)) {
    if (arg === "--force") {
      force = true;
      continue;
    }
    const match = /^--([^=]+)=(.*)$/.exec(arg);
    if (match) flags.set(match[1], match[2]);
  }

  const password = flags.get("password") ?? process.env.SEED_ADMIN_PASSWORD;

  return {
    email: flags.get("email") ?? process.env.SEED_ADMIN_EMAIL ?? DEFAULTS.email,
    name: flags.get("name") ?? process.env.SEED_ADMIN_NAME ?? DEFAULTS.name,
    password: password ?? DEFAULTS.password,
    passwordExplicit: password !== undefined,
    force,
  };
}

// ---------- Seed ----------

async function seedAdmin() {
  const args = parseArgs();

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set — copy .env.example to .env first.");
  }

  const email = args.email.trim().toLowerCase();
  const existing = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  // ----- Existing account: promote, and optionally reset the password -----
  if (existing) {
    const changes: string[] = [];

    if (existing.role !== "admin") {
      await db.update(user).set({ role: "admin" }).where(eq(user.id, existing.id));
      changes.push(`role ${existing.role} → admin`);
    }

    if (!existing.active) {
      await db.update(user).set({ active: true }).where(eq(user.id, existing.id));
      changes.push("reactivated");
    }

    // Only touch the password when explicitly asked. Re-running `pnpm seed` to
    // promote a colleague must not silently reset their password to the default.
    let issuedPassword: string | null = null;
    if (args.force || args.passwordExplicit) {
      const password = args.password;
      const hash = await hashPassword(password);

      const credential = await db.query.account.findFirst({
        where: eq(account.userId, existing.id),
      });

      if (credential && credential.providerId === "credential") {
        await db
          .update(account)
          .set({ password: hash })
          .where(eq(account.id, credential.id));
      } else {
        await db.insert(account).values({
          id: randomUUID(),
          userId: existing.id,
          accountId: existing.id,
          providerId: "credential",
          password: hash,
        });
      }

      issuedPassword = password;
      changes.push("password reset");
    }

    if (changes.length === 0) {
      console.log(`\n✓ ${email} is already an active admin — nothing to do.`);
      console.log(
        `  Its password was left alone. Pass --force to reset it to "${args.password}".\n`
      );
      return;
    }

    console.log(`\n✓ Updated existing account: ${changes.join(", ")}`);
    report(email, issuedPassword, args.passwordExplicit);
    return;
  }

  // ----- New account -----
  const password = args.password;
  const userId = randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(user).values({
      id: userId,
      name: args.name,
      email,
      // No verification email is wired up yet, so trust the seeded address.
      emailVerified: true,
      role: "admin",
      locale: "zh-TW",
      active: true,
    });

    await tx.insert(account).values({
      id: randomUUID(),
      userId,
      accountId: userId,
      providerId: "credential",
      password: await hashPassword(password),
    });
  });

  console.log("\n✓ Created administrator account.");
  report(email, password, args.passwordExplicit);
}

/**
 * Prints the credentials to sign in with. `password` is null when the account
 * already existed and its password was deliberately left untouched.
 */
function report(email: string, password: string | null, wasSupplied: boolean) {
  console.log(`  Email:    ${email}`);

  if (!password) {
    console.log("  Password: unchanged");
  } else if (wasSupplied) {
    console.log("  Password: (the one you supplied)");
  } else {
    console.log(`  Password: ${password}`);
    console.log(
      `\n  ⚠ This is the built-in default from DEFAULTS in seed.ts.`
    );
    console.log("    Change it before this ever runs against a real database.");
  }

  console.log("\n  Sign in at /login, then open /admin.\n");
}

/** A `docker run` line whose credentials match whatever DATABASE_URL says. */
function dockerHint(): string {
  try {
    const url = new URL(process.env.DATABASE_URL ?? "");
    const dbName = url.pathname.replace(/^\//, "") || "postgres";
    return [
      "docker run --name oir-db -d",
      `-e POSTGRES_USER=${decodeURIComponent(url.username) || "postgres"}`,
      `-e POSTGRES_PASSWORD=${decodeURIComponent(url.password) || "postgres"}`,
      `-e POSTGRES_DB=${dbName}`,
      `-p ${url.port || "5432"}:5432 postgres:17`,
    ].join(" ");
  } catch {
    return "docker run --name oir-db -d -p 5432:5432 postgres:17";
  }
}

/**
 * Drizzle wraps driver errors, so the useful part — "connection refused",
 * "relation does not exist" — sits on `cause`. Unwrap it and turn the two
 * failures people actually hit into instructions.
 */
function explain(error: unknown): string {
  const cause = (error as { cause?: { code?: string; message?: string } })?.cause;
  const code = cause?.code ?? (error as { code?: string })?.code;
  const message =
    cause?.message ?? (error instanceof Error ? error.message : String(error));

  if (code === "ECONNREFUSED" || code === "ENOTFOUND") {
    return [
      `Cannot reach the database at ${process.env.DATABASE_URL ?? "(unset)"}.`,
      "",
      "  Start PostgreSQL, then try again. With Docker, matching your .env:",
      `    ${dockerHint()}`,
    ].join("\n");
  }

  if (code === "42P01") {
    return [
      "The auth tables do not exist yet.",
      "",
      "  Create them first:  pnpm migrate",
    ].join("\n");
  }

  if (code === "42703" || code === "42804") {
    return [
      `The database is behind the schema in db/schema: ${message}`,
      "",
      "  Push the current schema, then seed again:  pnpm migrate",
    ].join("\n");
  }

  if (code === "28P01" || code === "3D000") {
    return `The database rejected the credentials in DATABASE_URL: ${message}`;
  }

  return message;
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n✗ Seeding failed.\n");
    console.error(`  ${explain(error).replace(/\n/g, "\n  ")}\n`);
    process.exit(1);
  });
