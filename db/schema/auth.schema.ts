import { relations } from "drizzle-orm";
import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { mediaFiles, posts } from "./cms.schema";
import { faqs } from "./knowledge.schema";
import { siteStats, tcornerSlots } from "./mobility.schema";

/**
 * Auth domain — the ERD's USERS entity, expressed through the Better Auth core
 * schema (user, session, account, verification).
 *
 * Mapping notes:
 *  - USERS.passwordHash lives in account.password (providerId = "credential"),
 *    which is where Better Auth expects credentials.
 *  - USERS.active is a plain boolean, as drawn. The admin plugin's
 *    banned/banReason/banExpires and session.impersonatedBy are deliberately
 *    absent: the plugin is not installed, and dal.ts does the role gating.
 *  - user.image and *.updatedAt are required by Better Auth's core model even
 *    though the ERD omits them.
 *
 * TS property names match Better Auth's expected field names exactly;
 * database column names use snake_case.
 */

export const userRole = pgEnum("user_role", ["admin", "editor", "viewer"]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  // Staff-only roles. There is no student account: the public site and the
  // assistant are anonymous, so nothing outside this office needs a login.
  role: userRole("role").notNull().default("viewer"),
  // Console language — "zh-TW" or "en", matching Locale in lib/i18n.ts.
  locale: text("locale").notNull().default("zh-TW"),
  // Deactivated accounts keep their history but cannot sign in (see dal.ts).
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    withTimezone: true,
  }),
  scope: text("scope"),
  idToken: text("id_token"),
  // The ERD's USERS.passwordHash.
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  // Content this staff member owns. Chat sessions are deliberately absent:
  // the assistant is anonymous and its rows carry no user id.
  posts: many(posts),
  uploadedFiles: many(mediaFiles),
  reviewedFaqs: many(faqs),
  tcornerSlots: many(tcornerSlots),
  siteStats: many(siteStats),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));
