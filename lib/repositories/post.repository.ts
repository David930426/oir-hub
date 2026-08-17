import { and, asc, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth.schema";
import {
  categories,
  postAttachments,
  postTags,
  posts,
} from "@/db/schema/cms.schema";
import type {
  PostStatusValue,
  PostTypeValue,
} from "@/lib/validator/post.validator";

/**
 * Posts — the ERD's POSTS, with POST_TAGS and POST_ATTACHMENTS.
 *
 * A post is never written without its tags and attachments: both are replaced
 * inside the same transaction as the row, so the console cannot leave a post
 * carrying half an edit.
 */

export type PostRecord = {
  id: string;
  slug: string;
  titleZh: string;
  titleEn: string | null;
  type: PostTypeValue;
  status: PostStatusValue;
  categoryName: string | null;
  authorName: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
  tagCount: number;
  attachmentCount: number;
};

/** Every post, newest change first — the order the console's table wants. */
export async function listPosts(): Promise<PostRecord[]> {
  // Distinct aliases: Drizzle renders a subquery column inside a `sql` template
  // by its alias alone, so two subqueries both calling theirs "total" would
  // produce an ambiguous reference.
  const tagUsage = db
    .select({ postId: postTags.postId, total: count().as("tag_total") })
    .from(postTags)
    .groupBy(postTags.postId)
    .as("tag_usage");

  const attachmentUsage = db
    .select({
      postId: postAttachments.postId,
      total: count().as("attachment_total"),
    })
    .from(postAttachments)
    .groupBy(postAttachments.postId)
    .as("attachment_usage");

  return db
    .select({
      id: posts.id,
      slug: posts.slug,
      titleZh: posts.titleZh,
      titleEn: posts.titleEn,
      type: posts.type,
      status: posts.status,
      categoryName: categories.nameZh,
      authorName: user.name,
      publishedAt: posts.publishedAt,
      updatedAt: posts.updatedAt,
      tagCount: sql<number>`coalesce(${tagUsage.total}, 0)`.mapWith(Number),
      attachmentCount: sql<number>`coalesce(${attachmentUsage.total}, 0)`.mapWith(
        Number,
      ),
    })
    .from(posts)
    .leftJoin(categories, eq(categories.id, posts.categoryId))
    .leftJoin(user, eq(user.id, posts.authorId))
    .leftJoin(tagUsage, eq(tagUsage.postId, posts.id))
    .leftJoin(attachmentUsage, eq(attachmentUsage.postId, posts.id))
    .orderBy(desc(posts.updatedAt));
}

/** Published posts for the public site, newest first. */
export async function listPublishedPosts(type?: PostTypeValue) {
  return db.query.posts.findMany({
    where: type
      ? and(eq(posts.status, "published"), eq(posts.type, type))
      : eq(posts.status, "published"),
    orderBy: [desc(posts.publishedAt)],
    with: { category: true },
  });
}

/**
 * Published posts with everything the news list prints on a card: who wrote it,
 * which category and tags it carries, and how many files hang off it.
 *
 * One query with its relations rather than a lookup per card — the list renders
 * on the server, so a per-row round trip would show up directly in the page's
 * response time.
 */
export async function listPublishedPostsForSite() {
  return db.query.posts.findMany({
    where: eq(posts.status, "published"),
    orderBy: [desc(posts.publishedAt)],
    with: {
      category: true,
      author: { columns: { name: true } },
      postTags: { with: { tag: true } },
      attachments: { columns: { id: true } },
    },
  });
}

export async function findPostById(id: string) {
  return db.query.posts.findFirst({
    where: eq(posts.id, id),
    with: {
      postTags: true,
      attachments: { orderBy: [asc(postAttachments.sortOrder)] },
    },
  });
}

export async function findPostBySlug(slug: string) {
  return db.query.posts.findFirst({
    where: eq(posts.slug, slug),
    with: {
      category: true,
      author: { columns: { name: true } },
      postTags: { with: { tag: true } },
      attachments: {
        orderBy: [asc(postAttachments.sortOrder)],
        with: { mediaFile: true },
      },
    },
  });
}

/** The columns a create or edit form writes, already normalised by the action. */
export type PostWrite = {
  slug: string;
  titleZh: string;
  titleEn: string | null;
  bodyZh: string;
  bodyEn: string | null;
  categoryId: string;
  type: PostTypeValue;
  status: PostStatusValue;
  publishedAt: Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
  externalUrl: string | null;
  tagIds: string[];
  /** Media file ids, in the order they should be listed. */
  attachmentIds: string[];
};

export async function createPost(
  input: PostWrite & { authorId: string },
): Promise<string> {
  const { tagIds, attachmentIds, ...row } = input;

  return db.transaction(async (tx) => {
    const [created] = await tx.insert(posts).values(row).returning({ id: posts.id });

    if (tagIds.length > 0) {
      await tx
        .insert(postTags)
        .values(tagIds.map((tagId) => ({ postId: created.id, tagId })));
    }

    if (attachmentIds.length > 0) {
      await tx.insert(postAttachments).values(
        attachmentIds.map((mediaFileId, index) => ({
          postId: created.id,
          mediaFileId,
          sortOrder: index,
        })),
      );
    }

    return created.id;
  });
}

/**
 * Applies the edit form.
 *
 * Tags and attachments are deleted and re-inserted rather than diffed: both
 * lists are short, the join rows carry nothing worth preserving, and the order
 * attachments are listed in is exactly the order the form submitted.
 */
export async function updatePost(input: PostWrite & { id: string }) {
  const { id, tagIds, attachmentIds, ...row } = input;

  await db.transaction(async (tx) => {
    await tx.update(posts).set(row).where(eq(posts.id, id));

    await tx.delete(postTags).where(eq(postTags.postId, id));
    if (tagIds.length > 0) {
      await tx.insert(postTags).values(tagIds.map((tagId) => ({ postId: id, tagId })));
    }

    await tx.delete(postAttachments).where(eq(postAttachments.postId, id));
    if (attachmentIds.length > 0) {
      await tx.insert(postAttachments).values(
        attachmentIds.map((mediaFileId, index) => ({
          postId: id,
          mediaFileId,
          sortOrder: index,
        })),
      );
    }
  });
}

export async function setPostStatus(
  id: string,
  status: PostStatusValue,
  publishedAt: Date | null,
) {
  await db.update(posts).set({ status, publishedAt }).where(eq(posts.id, id));
}

export async function deletePost(id: string) {
  // POST_TAGS and POST_ATTACHMENTS cascade, so the row is enough.
  await db.delete(posts).where(eq(posts.id, id));
}
