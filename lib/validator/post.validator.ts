import z from "zod";
import {
  BODY_MAX_LENGTH,
  POST_TYPES,
  PUBLISH_STATUSES,
  SEO_DESCRIPTION_MAX_LENGTH,
  SEO_TITLE_MAX_LENGTH,
} from "@/constant";
import {
  idSchema,
  optionalText,
  optionalUrlSchema,
  requiredZh,
  slugSchema,
  titleEnSchema,
  titleZhSchema,
} from "./common.validator";

/**
 * Posts — the ERD's POSTS, plus the two lists that hang off it: POST_TAGS and
 * POST_ATTACHMENTS.
 *
 * Tags and attachments are submitted with the post rather than through their
 * own endpoints, because a post with half its tags applied is not a state the
 * console should be able to produce.
 */

export const postTypeSchema = z.enum(POST_TYPES);
export const postStatusSchema = z.enum(PUBLISH_STATUSES);

export const createPostSchema = z.object({
  slug: slugSchema,
  titleZh: titleZhSchema,
  titleEn: titleEnSchema,
  bodyZh: requiredZh("body", BODY_MAX_LENGTH),
  bodyEn: optionalText("Body", BODY_MAX_LENGTH),
  categoryId: idSchema.describe("Choose a category."),
  type: postTypeSchema,
  status: postStatusSchema,
  seoTitle: optionalText("SEO title", SEO_TITLE_MAX_LENGTH),
  seoDescription: optionalText("SEO description", SEO_DESCRIPTION_MAX_LENGTH),
  /** Set when the authoritative version lives on another office's site. */
  externalUrl: optionalUrlSchema,
  tagIds: z.array(idSchema),
  /** Media file ids, in the order they should be listed under the post. */
  attachmentIds: z.array(idSchema),
});

export const updatePostSchema = createPostSchema.extend({ id: idSchema });

/** The row action behind "Publish", "Unpublish" and "Archive". */
export const setPostStatusSchema = z.object({
  id: idSchema,
  status: postStatusSchema,
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type SetPostStatusInput = z.infer<typeof setPostStatusSchema>;
export type PostTypeValue = z.infer<typeof postTypeSchema>;
export type PostStatusValue = z.infer<typeof postStatusSchema>;
