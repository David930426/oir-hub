import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import * as schema from "@/db/schema/auth.schema";
import { db } from "@/db";
import { logger } from "@/lib/logger";

const authLogger = logger.child({ module: "auth" });

/**
 * Better Auth configuration for the ERD's USERS entity.
 *
 * Accounts belong to OIR staff only — the public site and the assistant are
 * anonymous (CHAT_SESSIONS carries a browser `anonId`, not a user id), so there
 * is no self-service sign-up. Staff accounts are created by an administrator,
 * or by `pnpm seed` for the first one.
 *
 * Access control lives in dal.ts rather than here.
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  logger: {
    disableColors: true,
    log: (level, message, ...args) => {
      authLogger[level](args.length > 0 ? { args } : {}, message);
    },
  },

  emailAndPassword: {
    enabled: true,
    // Closes the public sign-up endpoint. Without this, anyone could POST to
    // /api/auth/sign-up/email and create themselves an account.
    disableSignUp: true,
  },

  user: {
    additionalFields: {
      // `input: false` keeps these out of any client-supplied payload, so a
      // caller cannot hand themselves a role or reactivate a disabled account.
      role: {
        type: "string",
        required: true,
        defaultValue: "viewer",
        input: false,
      },
      active: {
        type: "boolean",
        required: true,
        defaultValue: true,
        input: false,
      },
      // Console language: "zh-TW" or "en". Staff may change their own.
      locale: {
        type: "string",
        required: false,
        defaultValue: "zh-TW",
      },
    },
  },

  plugins: [
    // Must be the last plugin — applies Set-Cookie headers from server actions.
    nextCookies(),
  ],
});
