"use server";

import { revalidatePath } from "next/cache";
import { requireWriter } from "@/dal";
import { GENERIC_ACTION_ERROR } from "@/constant";
import { logger } from "@/lib/logger";
import { markKbDocumentStale } from "@/lib/repositories/knowledge.repository";
import { findPartnerSchoolById } from "@/lib/repositories/school.repository";
import {
  createTestimonial,
  deleteTestimonial,
  findTestimonialById,
  setTestimonialStatus,
  updateTestimonial,
  type TestimonialWrite,
} from "@/lib/repositories/testimonial.repository";
import {
  describeError,
  emptyToNull,
  fail,
  ok,
  parseInput,
  type ActionResult,
} from "@/lib/utils";
import {
  createTestimonialSchema,
  setTestimonialStatusSchema,
  updateTestimonialSchema,
  type CreateTestimonialInput,
  type SetTestimonialStatusInput,
  type UpdateTestimonialInput,
} from "@/lib/validator/testimonial.validator";

/**
 * Testimonials — reports written by students who have returned.
 *
 * Publication is gated on consent, and that gate lives here rather than in the
 * form: this is someone else's account of their year abroad, published under a
 * name they chose, and a disabled button is not a safeguard.
 */

const TESTIMONIALS_PATH = "/admin/testimonials";
const MISSING = "That testimonial no longer exists.";
const NEEDS_CONSENT =
  "The student has not consented to publication yet — record their consent first.";

function revalidateTestimonial(id?: string) {
  revalidatePath(TESTIMONIALS_PATH);
  revalidatePath("/testimonials");
  if (id) revalidatePath(`/testimonials/${id}`);
}

function toTestimonialWrite(
  input: CreateTestimonialInput | UpdateTestimonialInput,
): TestimonialWrite {
  return {
    partnerSchoolId: input.partnerSchoolId,
    displayName: input.displayName,
    deptYear: input.deptYear,
    country: input.country,
    termLabel: input.termLabel,
    highlights: input.highlights,
    bodyZh: input.bodyZh,
    bodyEn: emptyToNull(input.bodyEn),
    fullTextFileId: emptyToNull(input.fullTextFileId),
    consentGiven: input.consentGiven,
    status: input.status,
  };
}

export async function createTestimonialAction(
  input: CreateTestimonialInput,
): Promise<ActionResult<string>> {
  const action = "createTestimonialAction";
  await requireWriter();

  const parsed = parseInput(createTestimonialSchema, input);
  if (!parsed.success) return parsed;

  const row = toTestimonialWrite(parsed.data);
  if (row.status === "published" && !row.consentGiven) return fail(NEEDS_CONSENT);

  try {
    if (!(await findPartnerSchoolById(row.partnerSchoolId))) {
      return fail("That partner school no longer exists — choose another.");
    }

    const id = await createTestimonial(row);

    revalidateTestimonial();
    return ok(
      row.status === "published"
        ? `${row.displayName}'s report is live.`
        : `${row.displayName}'s report saved as a draft.`,
      id,
    );
  } catch (error) {
    logger.error({ action, error }, "failed to create testimonial");
    return fail(describeError(error));
  }
}

export async function updateTestimonialAction(
  input: UpdateTestimonialInput,
): Promise<ActionResult> {
  const action = "updateTestimonialAction";
  await requireWriter();

  const parsed = parseInput(updateTestimonialSchema, input);
  if (!parsed.success) return parsed;

  const row = toTestimonialWrite(parsed.data);
  if (row.status === "published" && !row.consentGiven) return fail(NEEDS_CONSENT);

  try {
    if (!(await findTestimonialById(parsed.data.id))) return fail(MISSING);
    if (!(await findPartnerSchoolById(row.partnerSchoolId))) {
      return fail("That partner school no longer exists — choose another.");
    }

    await updateTestimonial({ id: parsed.data.id, ...row });
    await markKbDocumentStale("testimonial", parsed.data.id);

    revalidateTestimonial(parsed.data.id);
    revalidatePath(`${TESTIMONIALS_PATH}/${parsed.data.id}/edit`);
    return ok(`${row.displayName}'s report updated.`);
  } catch (error) {
    logger.error(
      { action, error, id: parsed.data.id },
      "failed to update testimonial",
    );
    return fail(describeError(error));
  }
}

export async function setTestimonialStatusAction(
  input: SetTestimonialStatusInput,
): Promise<ActionResult> {
  const action = "setTestimonialStatusAction";
  await requireWriter();

  const parsed = parseInput(setTestimonialStatusSchema, input);
  if (!parsed.success) return parsed;

  const { id, status } = parsed.data;

  try {
    const testimonial = await findTestimonialById(id);
    if (!testimonial) return fail(MISSING);
    if (testimonial.status === status) {
      return ok(`That report is already ${status}.`);
    }
    if (status === "published" && !testimonial.consentGiven) return fail(NEEDS_CONSENT);

    await setTestimonialStatus(id, status);
    await markKbDocumentStale("testimonial", id);

    revalidateTestimonial(id);
    return ok(
      status === "published"
        ? `${testimonial.displayName}'s report is live.`
        : status === "draft"
          ? `${testimonial.displayName}'s report is back in drafts.`
          : `${testimonial.displayName}'s report has been archived.`,
    );
  } catch (error) {
    logger.error({ action, error, id }, "failed to change testimonial status");
    return fail(GENERIC_ACTION_ERROR);
  }
}

export async function deleteTestimonialAction(id: string): Promise<ActionResult> {
  const action = "deleteTestimonialAction";
  await requireWriter();

  try {
    const testimonial = await findTestimonialById(id);
    if (!testimonial) return fail(MISSING);

    await deleteTestimonial(id);
    await markKbDocumentStale("testimonial", id);

    revalidateTestimonial();
    return ok(`${testimonial.displayName}'s report deleted.`);
  } catch (error) {
    logger.error({ action, error, id }, "failed to delete testimonial");
    return fail(GENERIC_ACTION_ERROR);
  }
}
