"use server";

import { revalidatePath } from "next/cache";
import { requireWriter } from "@/dal";
import { GENERIC_ACTION_ERROR } from "@/constant";
import { logger } from "@/lib/logger";
import {
  createFunding,
  deleteFunding,
  findFundingById,
  setFundingStatus,
  updateFunding,
  type FundingWrite,
} from "@/lib/repositories/funding.repository";
import { findProgramById } from "@/lib/repositories/program.repository";
import {
  describeError,
  emptyToNull,
  fail,
  ok,
  parseInput,
  type ActionResult,
} from "@/lib/utils";
import {
  createFundingSchema,
  setFundingStatusSchema,
  updateFundingSchema,
  type CreateFundingInput,
  type SetFundingStatusInput,
  type UpdateFundingInput,
} from "@/lib/validator/funding.validator";

/**
 * Funding — grants and scholarships.
 *
 * An empty program means "any program", which is how most Ministry schemes
 * work, so the reference is only checked when one was actually chosen.
 */

const FUNDING_PATH = "/admin/funding";
const MISSING = "That funding call no longer exists.";

function revalidateFunding(id?: string) {
  revalidatePath(FUNDING_PATH);
  revalidatePath("/funding");
  if (id) revalidatePath(`/funding/${id}`);
}

function toFundingWrite(
  input: CreateFundingInput | UpdateFundingInput,
): FundingWrite {
  return {
    programId: emptyToNull(input.programId),
    nameZh: input.nameZh,
    nameEn: emptyToNull(input.nameEn),
    source: input.source,
    eligibilityZh: input.eligibilityZh,
    eligibilityEn: emptyToNull(input.eligibilityEn),
    amountMax: input.amountMax,
    // Sorted and de-duplicated: the form edits these as checkboxes, and the
    // site prints them as a list of months.
    applyMonths: [...new Set(input.applyMonths)].sort((a, b) => a - b),
    requiredDocs: input.requiredDocs,
    notesZh: emptyToNull(input.notesZh),
    notesEn: emptyToNull(input.notesEn),
    contactName: emptyToNull(input.contactName),
    contactEmail: emptyToNull(input.contactEmail),
    formFileId: emptyToNull(input.formFileId),
    status: input.status,
  };
}

export async function createFundingAction(
  input: CreateFundingInput,
): Promise<ActionResult<string>> {
  const action = "createFundingAction";
  await requireWriter();

  const parsed = parseInput(createFundingSchema, input);
  if (!parsed.success) return parsed;

  const row = toFundingWrite(parsed.data);

  try {
    if (row.programId && !(await findProgramById(row.programId))) {
      return fail("That program no longer exists — choose another, or leave it open to all.");
    }

    const id = await createFunding(row);

    revalidateFunding();
    return ok(`“${row.nameZh}” created.`, id);
  } catch (error) {
    logger.error({ action, error }, "failed to create funding call");
    return fail(describeError(error));
  }
}

export async function updateFundingAction(
  input: UpdateFundingInput,
): Promise<ActionResult> {
  const action = "updateFundingAction";
  await requireWriter();

  const parsed = parseInput(updateFundingSchema, input);
  if (!parsed.success) return parsed;

  const row = toFundingWrite(parsed.data);

  try {
    if (!(await findFundingById(parsed.data.id))) return fail(MISSING);
    if (row.programId && !(await findProgramById(row.programId))) {
      return fail("That program no longer exists — choose another, or leave it open to all.");
    }

    await updateFunding({ id: parsed.data.id, ...row });

    revalidateFunding(parsed.data.id);
    revalidatePath(`${FUNDING_PATH}/${parsed.data.id}/edit`);
    return ok(`“${row.nameZh}” updated.`);
  } catch (error) {
    logger.error({ action, error, id: parsed.data.id }, "failed to update funding call");
    return fail(describeError(error));
  }
}

export async function setFundingStatusAction(
  input: SetFundingStatusInput,
): Promise<ActionResult> {
  const action = "setFundingStatusAction";
  await requireWriter();

  const parsed = parseInput(setFundingStatusSchema, input);
  if (!parsed.success) return parsed;

  const { id, status } = parsed.data;

  try {
    const funding = await findFundingById(id);
    if (!funding) return fail(MISSING);
    if (funding.status === status) {
      return ok(`“${funding.nameZh}” is already ${status}.`);
    }

    await setFundingStatus(id, status);

    revalidateFunding(id);
    return ok(
      status === "open"
        ? `“${funding.nameZh}” is open for applications.`
        : status === "closed"
          ? `“${funding.nameZh}” is closed; it stays readable on the site.`
          : `“${funding.nameZh}” has been archived.`,
    );
  } catch (error) {
    logger.error({ action, error, id }, "failed to change funding status");
    return fail(GENERIC_ACTION_ERROR);
  }
}

export async function deleteFundingAction(id: string): Promise<ActionResult> {
  const action = "deleteFundingAction";
  await requireWriter();

  try {
    const funding = await findFundingById(id);
    if (!funding) return fail(MISSING);

    await deleteFunding(id);

    revalidateFunding();
    return ok(`“${funding.nameZh}” deleted.`);
  } catch (error) {
    logger.error({ action, error, id }, "failed to delete funding call");
    return fail(GENERIC_ACTION_ERROR);
  }
}
