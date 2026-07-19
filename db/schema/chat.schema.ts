import { relations } from "drizzle-orm";
import {
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

/**
 * Chat activity domain — conversations, messages, per-message feedback,
 * and SUS survey responses.
 */

export const messageRole = pgEnum("message_role", ["user", "assitant"]);

/** One retrieved source attached to an assistant message. */
export type MessageSource = {
  chunkId: string;
  docId: string;
  score: number;
};

export const conversations = pgTable(
  "conversations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    // Null when the chat is anonymous — tracked by sessionId only.
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    sessionId: text("session_id").notNull(), // browser-generated UUID
    title: text("title"), // derived from the first message
    language: text("language").notNull().default("en"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("conversations_session_id_idx").on(table.sessionId),
    index("conversations_user_id_idx").on(table.userId),
  ]
);

export const messages = pgTable(
  "messages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: messageRole("role").notNull(),
    content: text("content").notNull(),
    sources: jsonb("sources").$type<MessageSource[]>(),
    model: text("model"), // e.g. "qwen2.5:7b"
    latencyMs: integer("latency_ms"), // for paper metrics
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("messages_conversation_id_idx").on(table.conversationId)]
);

export const feedback = pgTable("feedback", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  messageId: text("message_id")
    .notNull()
    .unique() // one rating per message
    .references(() => messages.id, { onDelete: "cascade" }),
  rating: smallint("rating").notNull(), // 1 = thumbs up, -1 = thumbs down
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const surveyResponses = pgTable("survey_responses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id").notNull(), // links to the chat session
  answers: jsonb("answers").notNull().$type<Record<string, number>>(), // q1–q10 SUS items
  susScore: doublePrecision("sus_score").notNull(), // 0–100
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const conversationsRelations = relations(
  conversations,
  ({ one, many }) => ({
    user: one(user, {
      fields: [conversations.userId],
      references: [user.id],
    }),
    messages: many(messages),
  })
);

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  feedback: one(feedback, {
    fields: [messages.id],
    references: [feedback.messageId],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  message: one(messages, {
    fields: [feedback.messageId],
    references: [messages.id],
  }),
}));
