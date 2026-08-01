"use server";

import { revalidatePath } from "next/cache";
import { requireWriter } from "@/dal";
import { GENERIC_ACTION_ERROR } from "@/constant";
import { logger } from "@/lib/logger";
import {
  countCategoryUsage,
  countTagUsage,
  createCategory,
  createTag,
  deleteCategory,
  deleteTag,
  findCategoryById,
  findTagById,
  updateCategory,
  updateTag,
} from "@/lib/repositories/taxonomy.repository";
import { isUniqueViolation, type ActionResult } from "@/lib/utils";
import {
  createCategorySchema,
  createTagSchema,
  updateCategorySchema,
  updateTagSchema,
  type CreateCategoryInput,
  type CreateTagInput,
  type UpdateCategoryInput,
  type UpdateTagInput,
} from "@/lib/validator/taxonomy.validator";

/**
 * Categories and tags.
 *
 * Every action starts with `requireWriter()`: viewers may read the console but
 * not reshape the taxonomy the whole site filters by. Slugs are unique in the
 * database, so a collision is reported rather than thrown.
 */

const TAXONOMY_PATH = "/admin/taxonomy";
const SLUG_TAKEN = "That slug is already used by another entry.";

// ---------- Categories ----------

export async function createCategoryAction(
  input: CreateCategoryInput,
): Promise<ActionResult> {
  const action = "createCategoryAction";
  await requireWriter();

  const parsed = createCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    await createCategory(parsed.data);
  } catch (error) {
    if (isUniqueViolation(error)) return { success: false, message: SLUG_TAKEN };

    logger.error({ action, error }, "failed to create category");
    return { success: false, message: GENERIC_ACTION_ERROR };
  }

  revalidatePath(TAXONOMY_PATH);
  return { success: true, message: `Category “${parsed.data.nameZh}” created.` };
}

export async function updateCategoryAction(
  input: UpdateCategoryInput,
): Promise<ActionResult> {
  const action = "updateCategoryAction";
  await requireWriter();

  const parsed = updateCategorySchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    const current = await findCategoryById(parsed.data.id);
    if (!current) {
      return { success: false, message: "That category no longer exists." };
    }

    // Kind decides which picker a category shows up in, so moving it while
    // posts or FAQs point at it would orphan them from their own filter.
    if (parsed.data.kind !== current.kind) {
      const usage = await countCategoryUsage(current.id, current.kind);
      if (usage > 0) {
        return {
          success: false,
          message: `In use by ${usage} ${current.kind === "post" ? "post" : "FAQ"}${
            usage === 1 ? "" : "s"
          } — its kind can no longer be changed.`,
        };
      }
    }

    await updateCategory(parsed.data);
  } catch (error) {
    if (isUniqueViolation(error)) return { success: false, message: SLUG_TAKEN };

    logger.error({ action, error, id: parsed.data.id }, "failed to update category");
    return { success: false, message: GENERIC_ACTION_ERROR };
  }

  revalidatePath(TAXONOMY_PATH);
  revalidatePath(`${TAXONOMY_PATH}/categories/${parsed.data.id}/edit`);
  return { success: true, message: `Category “${parsed.data.nameZh}” updated.` };
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const action = "deleteCategoryAction";
  await requireWriter();

  try {
    const category = await findCategoryById(id);
    if (!category) return { success: false, message: "That category no longer exists." };

    // The foreign keys are ON DELETE RESTRICT, so this would fail in the
    // database anyway — checking first turns it into a sentence.
    const usage = await countCategoryUsage(id, category.kind);
    if (usage > 0) {
      return {
        success: false,
        message: `Still used by ${usage} ${category.kind === "post" ? "post" : "FAQ"}${
          usage === 1 ? "" : "s"
        }. Move them first.`,
      };
    }

    await deleteCategory(id);
  } catch (error) {
    logger.error({ action, error, id }, "failed to delete category");
    return { success: false, message: GENERIC_ACTION_ERROR };
  }

  revalidatePath(TAXONOMY_PATH);
  return { success: true, message: "Category deleted." };
}

// ---------- Tags ----------

export async function createTagAction(input: CreateTagInput): Promise<ActionResult> {
  const action = "createTagAction";
  await requireWriter();

  const parsed = createTagSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    await createTag(parsed.data);
  } catch (error) {
    if (isUniqueViolation(error)) return { success: false, message: SLUG_TAKEN };

    logger.error({ action, error }, "failed to create tag");
    return { success: false, message: GENERIC_ACTION_ERROR };
  }

  revalidatePath(TAXONOMY_PATH);
  return { success: true, message: `Tag #${parsed.data.slug} created.` };
}

export async function updateTagAction(input: UpdateTagInput): Promise<ActionResult> {
  const action = "updateTagAction";
  await requireWriter();

  const parsed = updateTagSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    if (!(await findTagById(parsed.data.id))) {
      return { success: false, message: "That tag no longer exists." };
    }

    await updateTag(parsed.data);
  } catch (error) {
    if (isUniqueViolation(error)) return { success: false, message: SLUG_TAKEN };

    logger.error({ action, error, id: parsed.data.id }, "failed to update tag");
    return { success: false, message: GENERIC_ACTION_ERROR };
  }

  revalidatePath(TAXONOMY_PATH);
  revalidatePath(`${TAXONOMY_PATH}/tags/${parsed.data.id}/edit`);
  return { success: true, message: `Tag #${parsed.data.slug} updated.` };
}

export async function deleteTagAction(id: string): Promise<ActionResult> {
  const action = "deleteTagAction";
  await requireWriter();

  try {
    const tag = await findTagById(id);
    if (!tag) return { success: false, message: "That tag no longer exists." };

    // POST_TAGS cascades, so deleting a tag in use would silently strip it from
    // published posts. Only unused tags may go.
    const usage = await countTagUsage(id);
    if (usage > 0) {
      return {
        success: false,
        message: `Still applied to ${usage} post${usage === 1 ? "" : "s"}. Remove it there first.`,
      };
    }

    await deleteTag(id);
  } catch (error) {
    logger.error({ action, error, id }, "failed to delete tag");
    return { success: false, message: GENERIC_ACTION_ERROR };
  }

  revalidatePath(TAXONOMY_PATH);
  return { success: true, message: "Tag deleted." };
}
