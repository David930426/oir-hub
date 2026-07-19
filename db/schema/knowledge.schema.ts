import { relations } from "drizzle-orm";
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth.schema";

/**
 * Knowledge base domain — categories, source documents, and the text chunks
 * that get embedded into Qdrant for RAG retrieval.
 */

export const documentStatus = pgEnum("document_status", [
  "pending",
  "processing",
  "indexed",
  "failed",
]);

export const documentSourceType = pgEnum("document_source_type", [
  "pdf",
  "docx",
  "url",
  "manual",
]);

export const categories = pgTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(), // "arc", "dormitory", ...
  nameEn: text("name_en").notNull(),
  nameZh: text("name_zh").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const documents = pgTable(
  "documents",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    sourceType: documentSourceType("source_type").notNull(),
    sourceUrl: text("source_url"), // when scraped from the web
    filePath: text("file_path"), // upload location on disk / object storage
    language: text("language").notNull().default("en"),
    status: documentStatus("status").notNull().default("pending"),
    errorMessage: text("error_message"), // set when status = FAILED
    chunkCount: integer("chunk_count").notNull().default(0),
    version: integer("version").notNull().default(1), // bumped on re-upload
    uploadedById: text("uploaded_by_id")
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
  (table) => [
    index("documents_category_id_idx").on(table.categoryId),
    index("documents_status_idx").on(table.status),
  ]
);

export const documentChunks = pgTable(
  "document_chunks",
  {
    // Doubles as the Qdrant point ID.
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    documentId: text("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    chunkIndex: integer("index").notNull(), // order within the document
    content: text("content").notNull(),
    tokenCount: integer("token_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("document_chunks_document_id_index_idx").on(
      table.documentId,
      table.chunkIndex
    ),
  ]
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  category: one(categories, {
    fields: [documents.categoryId],
    references: [categories.id],
  }),
  uploadedBy: one(user, {
    fields: [documents.uploadedById],
    references: [user.id],
  }),
  chunks: many(documentChunks),
}));

export const documentChunksRelations = relations(documentChunks, ({ one }) => ({
  document: one(documents, {
    fields: [documentChunks.documentId],
    references: [documents.id],
  }),
}));
