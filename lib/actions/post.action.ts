"use server";

import { revalidatePath } from "next/cache";
import { requireWriter } from "@/dal";
import { GENERIC_ACTION_ERROR } from "@/constant";
import { logger } from "@/lib/logger";
import {
  createPost,
  deletePost,
  findPostById,
  setPostStatus,
  updatePost,
  type PostWrite,
} from "@/lib/repositories/post.repository";
import {
  describeError,
  emptyToNull,
  fail,
  isUniqueViolation,
  ok,
  parseInput,
  type ActionResult,
} from "@/lib/utils";
import {
  createPostSchema,
  setPostStatusSchema,
  updatePostSchema,
  type CreatePostInput,
  type PostStatusValue,
  type SetPostStatusInput,
  type UpdatePostInput,
} from "@/lib/validator/post.validator";

/**
 * Posts — news, notices, guides and static pages.
 *
 * Every action re-checks `requireWriter()`: the layout guards the screen, but
 * an action is its own entry point.
 */

const POSTS_PATH = "/admin/posts";
const SLUG_TAKEN = "That slug is already used by another post.";
const MISSING = "That post no longer exists.";

/** Every screen a post appears on, so an edit is visible where it is read. */
function revalidatePost(slug: string) {
  revalidatePath(POSTS_PATH);
  revalidatePath("/news");
  revalidatePath(`/news/${slug}`);
}

/**
 * When a post counts as published.
 *
 * Publishing stamps the moment it first went out and keeps that stamp through
 * later edits and archiving — the date readers saw should not move. Sending a
 * post back to draft clears it, because it has not been published after all.
 */
function publishedAtFor(
  status: PostStatusValue,
  current: Date | null,
): Date | null {
  if (status === "draft") return null;
  if (status === "published") return current ?? new Date();
  return current;
}

/** Turns a validated form into the row shape the repository writes. */
function toPostWrite(
  input: CreatePostInput | UpdatePostInput,
  publishedAt: Date | null,
): PostWrite {
  return {
    slug: input.slug,
    titleZh: input.titleZh,
    titleEn: emptyToNull(input.titleEn),
    bodyZh: input.bodyZh,
    bodyEn: emptyToNull(input.bodyEn),
    categoryId: input.categoryId,
    type: input.type,
    status: input.status,
    publishedAt,
    seoTitle: emptyToNull(input.seoTitle),
    seoDescription: emptyToNull(input.seoDescription),
    externalUrl: emptyToNull(input.externalUrl),
    tagIds: input.tagIds,
    attachmentIds: input.attachmentIds,
  };
}

// ---------- Create ----------

export async function createPostAction(
  input: CreatePostInput,
): Promise<ActionResult<string>> {
  const action = "createPostAction";
  const session = await requireWriter();

  const parsed = parseInput(createPostSchema, input);
  if (!parsed.success) return parsed;

  try {
    const id = await createPost({
      ...toPostWrite(parsed.data, publishedAtFor(parsed.data.status, null)),
      authorId: session.user.id,
    });

    revalidatePost(parsed.data.slug);
    return ok(`“${parsed.data.titleZh}” created.`, id);
  } catch (error) {
    if (isUniqueViolation(error)) return fail(SLUG_TAKEN);

    logger.error({ action, error }, "failed to create post");
    return fail(describeError(error));
  }
}

// ---------- Update ----------

export async function updatePostAction(
  input: UpdatePostInput,
): Promise<ActionResult> {
  const action = "updatePostAction";
  await requireWriter();

  const parsed = parseInput(updatePostSchema, input);
  if (!parsed.success) return parsed;

  try {
    const current = await findPostById(parsed.data.id);
    if (!current) return fail(MISSING);

    await updatePost({
      id: parsed.data.id,
      ...toPostWrite(
        parsed.data,
        publishedAtFor(parsed.data.status, current.publishedAt),
      ),
    });

    revalidatePost(parsed.data.slug);
    if (current.slug !== parsed.data.slug) revalidatePath(`/news/${current.slug}`);
    revalidatePath(`${POSTS_PATH}/${parsed.data.id}`);

    return ok(`“${parsed.data.titleZh}” updated.`);
  } catch (error) {
    if (isUniqueViolation(error)) return fail(SLUG_TAKEN);

    logger.error({ action, error, id: parsed.data.id }, "failed to update post");
    return fail(describeError(error));
  }
}

// ---------- Publish / archive ----------

export async function setPostStatusAction(
  input: SetPostStatusInput,
): Promise<ActionResult> {
  const action = "setPostStatusAction";
  await requireWriter();

  const parsed = parseInput(setPostStatusSchema, input);
  if (!parsed.success) return parsed;

  const { id, status } = parsed.data;

  try {
    const current = await findPostById(id);
    if (!current) return fail(MISSING);
    if (current.status === status) {
      return ok(`“${current.titleZh}” is already ${status}.`);
    }

    await setPostStatus(id, status, publishedAtFor(status, current.publishedAt));

    revalidatePost(current.slug);
    return ok(
      status === "published"
        ? `“${current.titleZh}” is now live.`
        : status === "draft"
          ? `“${current.titleZh}” is back in drafts and no longer public.`
          : `“${current.titleZh}” has been archived.`,
    );
  } catch (error) {
    logger.error({ action, error, id }, "failed to change post status");
    return fail(GENERIC_ACTION_ERROR);
  }
}

// ---------- Delete ----------

export async function deletePostAction(id: string): Promise<ActionResult> {
  const action = "deletePostAction";
  await requireWriter();

  try {
    const post = await findPostById(id);
    if (!post) return fail(MISSING);

    // Tags and attachments cascade; the media files themselves are untouched,
    // since they are their own library entries and may be used elsewhere.
    await deletePost(id);

    revalidatePost(post.slug);
    return ok(`“${post.titleZh}” deleted.`);
  } catch (error) {
    logger.error({ action, error, id }, "failed to delete post");
    return fail(GENERIC_ACTION_ERROR);
  }
}
