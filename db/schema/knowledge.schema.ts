import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { FAQ_AUDIENCES, KB_SOURCE_TABLES, KB_STATUSES } from "@/constant";
import { user } from "./auth.schema";
import { categories, mediaFiles } from "./cms.schema";

/**
 * Knowledge base — FAQS and FAQ_SOURCES are authored by staff and shown on the
 * site; KB_DOCUMENTS and KB_CHUNKS are the derived index the RAG assistant
 * retrieves from.
 *
 * Nothing in kb_documents is written by hand: each row is flattened from a FAQ,
 * post, bulletin, testimonial, or file, then split into chunks and embedded
 * into Qdrant. To correct an answer, edit the source row and re-index.
 */

export const faqAudience = pgEnum("faq_audience", FAQ_AUDIENCES);

export const kbSourceTable = pgEnum("kb_source_table", KB_SOURCE_TABLES);

export const kbStatus = pgEnum("kb_status", KB_STATUSES);

/** A staff-written question and answer. */
export const faqs = pgTable(
  "faqs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    questionZh: text("question_zh").notNull(),
    questionEn: text("question_en"),
    // One or two sentences — what the site and the assistant quote first.
    shortAnswerZh: text("short_answer_zh").notNull(),
    shortAnswerEn: text("short_answer_en"),
    longAnswerZh: text("long_answer_zh").notNull(),
    longAnswerEn: text("long_answer_en"),
    audience: faqAudience("audience").notNull().default("student"),
    // High-risk answers the assistant must escalate instead of answering.
    needsHumanConfirm: boolean("needs_human_confirm").notNull().default(false),
    published: boolean("published").notNull().default(false),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    reviewedById: text("reviewed_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
  },
  (table) => [
    index("faqs_category_id_idx").on(table.categoryId),
    index("faqs_published_idx").on(table.published),
    index("faqs_audience_idx").on(table.audience),
    index("faqs_last_reviewed_at_idx").on(table.lastReviewedAt),
  ]
);

/**
 * Where an answer came from — an uploaded file, an external URL, or both.
 * Shown publicly so a student can check the original.
 */
export const faqSources = pgTable(
  "faq_sources",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    faqId: text("faq_id")
      .notNull()
      .references(() => faqs.id, { onDelete: "cascade" }),
    mediaFileId: text("media_file_id").references(() => mediaFiles.id, {
      onDelete: "set null",
    }),
    sourceUrl: text("source_url"),
    label: text("label").notNull(), // "115-2 簡章 p.3"
  },
  (table) => [
    index("faq_sources_faq_id_idx").on(table.faqId),
    index("faq_sources_media_file_id_idx").on(table.mediaFileId),
  ]
);

/**
 * One indexable document, flattened from a content row.
 *
 * `sourceTable` + `sourceId` is a polymorphic pointer, so it carries no foreign
 * key — the target lives in a different table depending on `sourceTable`.
 * Deleting a source row therefore leaves its document behind; the re-index job
 * is what prunes it.
 */
export const kbDocuments = pgTable(
  "kb_documents",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    sourceTable: kbSourceTable("source_table").notNull(),
    sourceId: text("source_id").notNull(), // row id in that table
    title: text("title").notNull(),
    content: text("content").notNull(), // flattened plain text
    language: text("language").notNull().default("zh-TW"),
    academicYear: text("academic_year"), // freshness filter at retrieval time
    version: integer("version").notNull().default(1),
    status: kbStatus("status").notNull().default("pending"),
    errorMessage: text("error_message"), // set when status = "failed"
    indexedAt: timestamp("indexed_at", { withTimezone: true }),
  },
  (table) => [
    // One document per source row.
    uniqueIndex("kb_documents_source_table_source_id_idx").on(
      table.sourceTable,
      table.sourceId
    ),
    index("kb_documents_status_idx").on(table.status),
    index("kb_documents_academic_year_idx").on(table.academicYear),
  ]
);

/** An embedded slice of a document. The id doubles as the Qdrant point ID. */
export const kbChunks = pgTable(
  "kb_chunks",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    kbDocumentId: text("kb_document_id")
      .notNull()
      .references(() => kbDocuments.id, { onDelete: "cascade" }),
    index: integer("index").notNull(), // order within the document
    content: text("content").notNull(),
    tokenCount: integer("token_count").notNull().default(0),
    embeddingModel: text("embedding_model").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("kb_chunks_kb_document_id_index_idx").on(
      table.kbDocumentId,
      table.index
    ),
  ]
);

// ---------- Relations ----------

export const faqsRelations = relations(faqs, ({ one, many }) => ({
  category: one(categories, {
    fields: [faqs.categoryId],
    references: [categories.id],
  }),
  reviewedBy: one(user, {
    fields: [faqs.reviewedById],
    references: [user.id],
  }),
  sources: many(faqSources),
}));

export const faqSourcesRelations = relations(faqSources, ({ one }) => ({
  faq: one(faqs, {
    fields: [faqSources.faqId],
    references: [faqs.id],
  }),
  mediaFile: one(mediaFiles, {
    fields: [faqSources.mediaFileId],
    references: [mediaFiles.id],
  }),
}));

export const kbDocumentsRelations = relations(kbDocuments, ({ many }) => ({
  chunks: many(kbChunks),
}));

export const kbChunksRelations = relations(kbChunks, ({ one }) => ({
  document: one(kbDocuments, {
    fields: [kbChunks.kbDocumentId],
    references: [kbDocuments.id],
  }),
}));
