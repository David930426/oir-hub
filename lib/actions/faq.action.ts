"use server";

import { revalidatePath } from "next/cache";
import { requireWriter } from "@/dal";
import { GENERIC_ACTION_ERROR } from "@/constant";
import { logger } from "@/lib/logger";
import {
  createFaq,
  deleteFaq,
  findFaqById,
  markFaqReviewed,
  setFaqPublished,
  updateFaq,
  type FaqWrite,
} from "@/lib/repositories/faq.repository";
import {
  describeError,
  emptyToNull,
  fail,
  ok,
  parseInput,
  pluralize,
  type ActionResult,
} from "@/lib/utils";
import {
  createFaqSchema,
  setFaqPublishedSchema,
  updateFaqSchema,
  type CreateFaqInput,
  type SetFaqPublishedInput,
  type UpdateFaqInput,
} from "@/lib/validator/faq.validator";

/**
 * FAQs — the answers the site publishes.
 *
 * These rows carry more weight than a news post: a wrong FAQ is the one a
 * student quotes back at the office. So every write records who stood behind
 * it, and an answer cannot be published without a source to check it against.
 */

const FAQ_PATH = "/admin/faqs";
const MISSING = "That FAQ no longer exists.";

function revalidateFaq(id?: string) {
  revalidatePath(FAQ_PATH);
  revalidatePath("/faqs");
  if (id) revalidatePath(`${FAQ_PATH}/${id}`);
}

/** Turns a validated form into the row shape the repository writes. */
function toFaqWrite(input: CreateFaqInput | UpdateFaqInput): FaqWrite {
  return {
    categoryId: input.categoryId,
    questionZh: input.questionZh,
    questionEn: emptyToNull(input.questionEn),
    shortAnswerZh: input.shortAnswerZh,
    shortAnswerEn: emptyToNull(input.shortAnswerEn),
    longAnswerZh: input.longAnswerZh,
    longAnswerEn: emptyToNull(input.longAnswerEn),
    audience: input.audience,
    needsHumanConfirm: input.needsHumanConfirm,
    published: input.published,
    sources: input.sources.map((source) => ({
      mediaFileId: emptyToNull(source.mediaFileId),
      sourceUrl: emptyToNull(source.sourceUrl),
      label: source.label,
    })),
  };
}

// ---------- Create ----------

export async function createFaqAction(
  input: CreateFaqInput,
): Promise<ActionResult<string>> {
  const action = "createFaqAction";
  const session = await requireWriter();

  const parsed = parseInput(createFaqSchema, input);
  if (!parsed.success) return parsed;

  // A published answer with nothing behind it is exactly what this project set
  // out to replace: staff and students should be able to check the original.
  if (parsed.data.published && parsed.data.sources.length === 0) {
    return fail("Add at least one source before publishing this answer.");
  }

  try {
    const id = await createFaq({
      ...toFaqWrite(parsed.data),
      reviewedById: session.user.id,
    });

    revalidateFaq();
    return ok(
      parsed.data.published
        ? "FAQ created and published."
        : "FAQ created as a draft.",
      id,
    );
  } catch (error) {
    logger.error({ action, error }, "failed to create FAQ");
    return fail(describeError(error));
  }
}

// ---------- Update ----------

export async function updateFaqAction(input: UpdateFaqInput): Promise<ActionResult> {
  const action = "updateFaqAction";
  const session = await requireWriter();

  const parsed = parseInput(updateFaqSchema, input);
  if (!parsed.success) return parsed;

  if (parsed.data.published && parsed.data.sources.length === 0) {
    return fail("Add at least one source before publishing this answer.");
  }

  try {
    if (!(await findFaqById(parsed.data.id))) return fail(MISSING);

    await updateFaq({
      id: parsed.data.id,
      ...toFaqWrite(parsed.data),
      reviewedById: session.user.id,
    });

    revalidateFaq(parsed.data.id);
    return ok(
      `FAQ updated, with ${pluralize(parsed.data.sources.length, "source")}.`,
    );
  } catch (error) {
    logger.error({ action, error, id: parsed.data.id }, "failed to update FAQ");
    return fail(describeError(error));
  }
}

// ---------- Publish ----------

export async function setFaqPublishedAction(
  input: SetFaqPublishedInput,
): Promise<ActionResult> {
  const action = "setFaqPublishedAction";
  await requireWriter();

  const parsed = parseInput(setFaqPublishedSchema, input);
  if (!parsed.success) return parsed;

  const { id, published } = parsed.data;

  try {
    const faq = await findFaqById(id);
    if (!faq) return fail(MISSING);
    if (faq.published === published) {
      return ok(`That FAQ is already ${published ? "published" : "unpublished"}.`);
    }
    if (published && faq.sources.length === 0) {
      return fail("Add at least one source before publishing this answer.");
    }

    await setFaqPublished(id, published);

    revalidateFaq(id);
    return ok(
      published
        ? "Published — it is live on the site."
        : "Unpublished — it is hidden from the site.",
    );
  } catch (error) {
    logger.error({ action, error, id }, "failed to change FAQ publication");
    return fail(GENERIC_ACTION_ERROR);
  }
}

// ---------- Review ----------

/**
 * Records that the answer was checked and is still correct.
 *
 * The office reviews FAQs on a cycle (REVIEW_INTERVAL_DAYS), and the console
 * flags anything older. This is the button for "I read it, nothing changed" —
 * it moves the date without touching a word.
 */
export async function markFaqReviewedAction(id: string): Promise<ActionResult> {
  const action = "markFaqReviewedAction";
  const session = await requireWriter();

  try {
    const faq = await findFaqById(id);
    if (!faq) return fail(MISSING);

    await markFaqReviewed(id, session.user.id);

    revalidateFaq(id);
    return ok("Marked as reviewed today.");
  } catch (error) {
    logger.error({ action, error, id }, "failed to mark FAQ reviewed");
    return fail(GENERIC_ACTION_ERROR);
  }
}

// ---------- Delete ----------

export async function deleteFaqAction(id: string): Promise<ActionResult> {
  const action = "deleteFaqAction";
  await requireWriter();

  try {
    const faq = await findFaqById(id);
    if (!faq) return fail(MISSING);

    // FAQ_SOURCES cascades.
    await deleteFaq(id);

    revalidateFaq();
    return ok("FAQ deleted.");
  } catch (error) {
    logger.error({ action, error, id }, "failed to delete FAQ");
    return fail(GENERIC_ACTION_ERROR);
  }
}
