// import { relations } from "drizzle-orm";
import {
  boolean,
  // doublePrecision,
  index,
  // integer,
  // jsonb,
  // pgEnum,
  pgTable,
  // smallint,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
// import { CHAT_ROLES, FEEDBACK_REASONS } from "@/constant";
// import { kbChunks } from "./knowledge.schema";

/**
 * Chat & evaluation — CHAT_SESSIONS, CHAT_MESSAGES, CHAT_CITATIONS,
 * CHAT_FEEDBACK, SURVEY_RESPONSES and CONTACT_MESSAGES.
 *
 * The assistant is anonymous by design: a session is keyed by a browser-
 * generated `anonId` and carries no user id, so a transcript cannot be traced
 * back to a named student.
 *
 * ---------------------------------------------------------------------------
 * COMMENTED OUT — nothing in the app reads or writes these tables.
 *
 *   chat_sessions, chat_messages, chat_citations, chat_feedback
 *     The RAG assistant is not part of the product (see CLAUDE.md). There is no
 *     chat UI, no Ollama/Qdrant client, and no repository touching them.
 *   survey_responses
 *     The SUS questionnaire that scored the assistant. It hangs off
 *     chat_sessions, so it goes quiet with the rest of the feature.
 *
 * They stay here, commented, so the ERD still reads whole and so turning the
 * assistant back on is uncommenting rather than rewriting. `pnpm migrate` will
 * not create them while they are commented.
 *
 * STILL LIVE in this file: contact_messages — written by the public contact
 * form and read by /admin/contact.
 * ---------------------------------------------------------------------------
 */

// export const chatRole = pgEnum("chat_role", CHAT_ROLES);
//
// export const feedbackReason = pgEnum("feedback_reason", FEEDBACK_REASONS);

// export const chatSessions = pgTable(
  // "chat_sessions",
  // {
    // id: text("id")
      // .primaryKey()
      // .$defaultFn(() => crypto.randomUUID()),
    // anonId: text("anon_id").notNull(), // browser UUID — there is no login
    // locale: text("locale").notNull().default("zh-TW"),
    // userAgent: text("user_agent"),
    // createdAt: timestamp("created_at", { withTimezone: true })
      // .notNull()
      // .defaultNow(),
  // },
  // (table) => [
    // index("chat_sessions_anon_id_idx").on(table.anonId),
    // index("chat_sessions_created_at_idx").on(table.createdAt),
  // ]
// );
//
// export const chatMessages = pgTable(
  // "chat_messages",
  // {
    // id: text("id")
      // .primaryKey()
      // .$defaultFn(() => crypto.randomUUID()),
    // sessionId: text("session_id")
      // .notNull()
      // .references(() => chatSessions.id, { onDelete: "cascade" }),
    // role: chatRole("role").notNull(),
    // content: text("content").notNull(),
    // // True when the answer was handed to a human instead of generated.
    // escalated: boolean("escalated").notNull().default(false),
    // model: text("model"), // "qwen2.5:7b"; null on user turns
    // // Split latencies, so retrieval and generation can be reported separately.
    // retrievalMs: integer("retrieval_ms"),
    // generationMs: integer("generation_ms"),
    // createdAt: timestamp("created_at", { withTimezone: true })
      // .notNull()
      // .defaultNow(),
  // },
  // (table) => [
    // index("chat_messages_session_id_idx").on(table.sessionId),
    // index("chat_messages_escalated_idx").on(table.escalated),
  // ]
// );
//
// /**
 // * Which chunk supported an answer, and how strongly.
 // *
 // * `kbChunkId` is nullable with ON DELETE SET NULL on purpose: re-indexing a
 // * document deletes and recreates its chunks, and cascading here would erase the
 // * retrieval scores this project is measured on. The row survives the re-index
 // * with its score and rank intact, just no longer pointing at live text.
 // */
// export const chatCitations = pgTable(
  // "chat_citations",
  // {
    // id: text("id")
      // .primaryKey()
      // .$defaultFn(() => crypto.randomUUID()),
    // messageId: text("message_id")
      // .notNull()
      // .references(() => chatMessages.id, { onDelete: "cascade" }),
    // kbChunkId: text("kb_chunk_id").references(() => kbChunks.id, {
      // onDelete: "set null",
    // }),
    // score: doublePrecision("score").notNull(),
    // rank: integer("rank").notNull(),
  // },
  // (table) => [
    // index("chat_citations_message_id_idx").on(table.messageId),
    // index("chat_citations_kb_chunk_id_idx").on(table.kbChunkId),
  // ]
// );
//
// export const chatFeedback = pgTable("chat_feedback", {
  // id: text("id")
    // .primaryKey()
    // .$defaultFn(() => crypto.randomUUID()),
  // messageId: text("message_id")
    // .notNull()
    // .unique() // one rating per message
    // .references(() => chatMessages.id, { onDelete: "cascade" }),
  // rating: smallint("rating").notNull(), // 1 = thumbs up, -1 = thumbs down
  // reason: feedbackReason("reason"),
  // comment: text("comment"),
  // createdAt: timestamp("created_at", { withTimezone: true })
    // .notNull()
    // .defaultNow(),
// });
//
// /** System Usability Scale response, plus a self-reported confidence shift. */
// export const surveyResponses = pgTable(
  // "survey_responses",
  // {
    // id: text("id")
      // .primaryKey()
      // .$defaultFn(() => crypto.randomUUID()),
    // sessionId: text("session_id")
      // .notNull()
      // .references(() => chatSessions.id, { onDelete: "cascade" }),
    // // SUS items q1–q10, each scored 1–5.
    // susAnswers: jsonb("sus_answers").notNull().$type<number[]>(),
    // susScore: doublePrecision("sus_score").notNull(), // 0–100
    // confidenceBefore: smallint("confidence_before"), // 1–5
    // confidenceAfter: smallint("confidence_after"), // 1–5
    // comment: text("comment"),
    // createdAt: timestamp("created_at", { withTimezone: true })
      // .notNull()
      // .defaultNow(),
  // },
  // (table) => [index("survey_responses_session_id_idx").on(table.sessionId)]
// );

/**
 * The contact inbox — the one table in this file that is still live.
 *
 * `fromSessionId` was set when the assistant escalated a question, which is how
 * staff could read the transcript that led to it. With CHAT_SESSIONS commented
 * out the column keeps its shape but loses its foreign key, so the repository,
 * the validator and /admin/contact all go on compiling unchanged. Restore the
 * `.references()` call below when the assistant comes back.
 */
export const contactMessages = pgTable(
  "contact_messages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    email: text("email").notNull(),
    topic: text("topic").notNull(),
    body: text("body").notNull(),
    // fromSessionId: text("from_session_id").references(() => chatSessions.id, {
    //   onDelete: "set null",
    // }),
    fromSessionId: text("from_session_id"), // always null while chat is off
    resolved: boolean("resolved").notNull().default(false), // staff marks done
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("contact_messages_resolved_idx").on(table.resolved),
    index("contact_messages_from_session_id_idx").on(table.fromSessionId),
  ]
);

// // ---------- Relations ----------
//
// export const chatSessionsRelations = relations(chatSessions, ({ many }) => ({
  // messages: many(chatMessages),
  // surveyResponses: many(surveyResponses),
  // contactMessages: many(contactMessages),
// }));
//
// export const chatMessagesRelations = relations(
  // chatMessages,
  // ({ one, many }) => ({
    // session: one(chatSessions, {
      // fields: [chatMessages.sessionId],
      // references: [chatSessions.id],
    // }),
    // citations: many(chatCitations),
    // feedback: one(chatFeedback, {
      // fields: [chatMessages.id],
      // references: [chatFeedback.messageId],
    // }),
  // })
// );
//
// export const chatCitationsRelations = relations(chatCitations, ({ one }) => ({
  // message: one(chatMessages, {
    // fields: [chatCitations.messageId],
    // references: [chatMessages.id],
  // }),
  // chunk: one(kbChunks, {
    // fields: [chatCitations.kbChunkId],
    // references: [kbChunks.id],
  // }),
// }));
//
// export const chatFeedbackRelations = relations(chatFeedback, ({ one }) => ({
  // message: one(chatMessages, {
    // fields: [chatFeedback.messageId],
    // references: [chatMessages.id],
  // }),
// }));
//
// export const surveyResponsesRelations = relations(
  // surveyResponses,
  // ({ one }) => ({
    // session: one(chatSessions, {
      // fields: [surveyResponses.sessionId],
      // references: [chatSessions.id],
    // }),
  // })
// );
//
// export const contactMessagesRelations = relations(
  // contactMessages,
  // ({ one }) => ({
    // fromSession: one(chatSessions, {
      // fields: [contactMessages.fromSessionId],
      // references: [chatSessions.id],
    // }),
  // })
// );
