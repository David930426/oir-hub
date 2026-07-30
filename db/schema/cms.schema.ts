import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { CATEGORY_KINDS } from "@/constant";
import { user } from "./auth.schema";

/**
 * CMS core — the ERD's CATEGORIES, TAGS, POSTS, POST_TAGS, POST_ATTACHMENTS
 * and MEDIA_FILES.
 *
 * Every reader-facing string is a `*Zh` / `*En` pair: Chinese is required,
 * English is optional and falls back to Chinese on the site (see lib/i18n.ts).
 */

export const categoryKind = pgEnum("category_kind", CATEGORY_KINDS);

export const postType = pgEnum("post_type", ["news", "guide", "page", "notice"]);

export const postStatus = pgEnum("post_status", [
  "draft",
  "published",
  "archived",
]);

/**
 * Shared taxonomy for posts and FAQs. `kind` scopes a category to one or the
 * other, so a post category never appears in the FAQ picker.
 */
export const categories = pgTable(
  "categories",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(), // "exchange", "funding", ...
    kind: categoryKind("kind").notNull(),
    nameZh: text("name_zh").notNull(),
    nameEn: text("name_en"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [index("categories_kind_idx").on(table.kind)]
);

export const tags = pgTable("tags", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  nameZh: text("name_zh").notNull(),
  nameEn: text("name_en"),
});

/**
 * Uploaded files. Re-uploading bumps `version` and points `replacesId` at the
 * previous row, which is flagged `archived` — so an outdated bulletin PDF can
 * never be served by mistake.
 */
export const mediaFiles = pgTable(
  "media_files",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    filename: text("filename").notNull(), // "115-2_guidelines.pdf"
    storagePath: text("storage_path").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    academicYear: text("academic_year"), // "115-2"; null when not year-bound
    version: integer("version").notNull().default(1),
    archived: boolean("archived").notNull().default(false),
    // Self-reference to the version this file supersedes.
    replacesId: text("replaces_id").references((): AnyPgColumn => mediaFiles.id, {
      onDelete: "set null",
    }),
    uploadedById: text("uploaded_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("media_files_uploaded_by_id_idx").on(table.uploadedById),
    index("media_files_academic_year_idx").on(table.academicYear),
    index("media_files_archived_idx").on(table.archived),
  ]
);

/** News, notices, guides, and static pages published by the office. */
export const posts = pgTable(
  "posts",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    slug: text("slug").notNull().unique(),
    titleZh: text("title_zh").notNull(),
    titleEn: text("title_en"),
    bodyZh: text("body_zh").notNull(), // markdown
    bodyEn: text("body_en"),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    type: postType("type").notNull(),
    status: postStatus("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    // Set when the authoritative source lives on another site.
    externalUrl: text("external_url"),
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
  (table) => [
    index("posts_category_id_idx").on(table.categoryId),
    index("posts_author_id_idx").on(table.authorId),
    index("posts_status_idx").on(table.status),
    index("posts_type_idx").on(table.type),
    index("posts_published_at_idx").on(table.publishedAt),
  ]
);

/** Join table: a post carries many tags, a tag is applied to many posts. */
export const postTags = pgTable(
  "post_tags",
  {
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.tagId] }),
    index("post_tags_tag_id_idx").on(table.tagId),
  ]
);

/** Files attached to a post, in display order. */
export const postAttachments = pgTable(
  "post_attachments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    postId: text("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    mediaFileId: text("media_file_id")
      .notNull()
      .references(() => mediaFiles.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    // The same file may not be attached to one post twice.
    uniqueIndex("post_attachments_post_id_media_file_id_idx").on(
      table.postId,
      table.mediaFileId
    ),
    index("post_attachments_media_file_id_idx").on(table.mediaFileId),
  ]
);

// ---------- Relations ----------

export const categoriesRelations = relations(categories, ({ many }) => ({
  posts: many(posts),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

export const mediaFilesRelations = relations(mediaFiles, ({ one, many }) => ({
  uploadedBy: one(user, {
    fields: [mediaFiles.uploadedById],
    references: [user.id],
  }),
  replaces: one(mediaFiles, {
    fields: [mediaFiles.replacesId],
    references: [mediaFiles.id],
    relationName: "mediaFileVersions",
  }),
  replacedBy: many(mediaFiles, { relationName: "mediaFileVersions" }),
  postAttachments: many(postAttachments),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  category: one(categories, {
    fields: [posts.categoryId],
    references: [categories.id],
  }),
  author: one(user, {
    fields: [posts.authorId],
    references: [user.id],
  }),
  postTags: many(postTags),
  attachments: many(postAttachments),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

export const postAttachmentsRelations = relations(postAttachments, ({ one }) => ({
  post: one(posts, {
    fields: [postAttachments.postId],
    references: [posts.id],
  }),
  mediaFile: one(mediaFiles, {
    fields: [postAttachments.mediaFileId],
    references: [mediaFiles.id],
  }),
}));
