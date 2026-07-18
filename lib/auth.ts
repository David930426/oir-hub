import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import * as schema from "@/db/schema/auth.schema";
import { db } from "@/db";
import { logger } from "@/lib/logger";

const authLogger = logger.child({ module: "auth" });

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
  },

  user: {
    additionalFields: {
      role: { type: "string", required: true, defaultValue: "student", input: false },
      language: { type: "string", required: false, defaultValue: "en" },
      nationality: { type: "string", required: false },
      studentId: { type: "string", required: false },
      major: { type: "string", required: false },
    },
  },

  plugins: [
    admin({ defaultRole: "student" }),
    // Must be the last plugin — applies Set-Cookie headers from server actions.
    nextCookies(),
  ],
});