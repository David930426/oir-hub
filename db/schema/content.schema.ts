import { relations } from "drizzle-orm";
import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

/**
 * Content & contact domain — OIR announcements and contact-form messages.
 */

export const announcements = pgTable(
  "announcements",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    content: text("content").notNull(),
    language: text("language").notNull().default("en"),
    published: boolean("published").notNull().default(false), // false = draft
    publishedAt: timestamp("published_at", { withTimezone: true }),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("announcements_published_idx").on(table.published)]
);

export const contactMessages = pgTable("contact_messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  topic: text("topic").notNull(),
  body: text("body").notNull(),
  resolved: boolean("resolved").notNull().default(false), // staff marks done
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const announcementsRelations = relations(announcements, ({ one }) => ({
  author: one(user, {
    fields: [announcements.authorId],
    references: [user.id],
  }),
}));
