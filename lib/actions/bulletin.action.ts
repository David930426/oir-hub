"use server";

import { revalidatePath } from "next/cache";
import { requireWriter } from "@/dal";
import { GENERIC_ACTION_ERROR } from "@/constant";
import { logger } from "@/lib/logger";
import {
  createBulletin,
  deleteBulletin,
  findBulletinById,
  findDuplicateBulletin,
  setBulletinStatus,
  updateBulletin,
  type BulletinWrite,
} from "@/lib/repositories/bulletin.repository";
import { findMediaFileById } from "@/lib/repositories/media.repository";
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
  createBulletinSchema,
  setBulletinStatusSchema,
  updateBulletinSchema,
  type CreateBulletinInput,
  type SetBulletinStatusInput,
  type UpdateBulletinInput,
} from "@/lib/validator/bulletin.validator";

/**
 * Bulletins — the selection calls students apply through.
 *
 * The deadline on one of these is the single most consequential date on the
 * site, so the PDF and the program are both checked to exist before the row is
 * written.
 */

const BULLETINS_PATH = "/admin/bulletins";
const MISSING = "That bulletin no longer exists.";

function revalidateBulletin(id?: string) {
  revalidatePath(BULLETINS_PATH);
  revalidatePath("/bulletins");
  if (id) revalidatePath(`/bulletins/${id}`);
}

function toBulletinWrite(
  input: CreateBulletinInput | UpdateBulletinInput,
): BulletinWrite {
  return {
    programId: input.programId,
    academicYear: input.academicYear,
    term: input.term,
    titleZh: input.titleZh,
    titleEn: emptyToNull(input.titleEn),
    region: input.region,
    pdfFileId: emptyToNull(input.pdfFileId),
    announcedAt: input.announcedAt,
    deadlineAt: input.deadlineAt,
    status: input.status,
  };
}

/**
 * Checks the two rows a bulletin points at.
 *
 * Both are chosen from pickers, so a missing one means the row was deleted
 * between the page loading and the form being submitted — worth a clear
 * sentence rather than a foreign-key error.
 */
async function checkReferences(
  input: BulletinWrite,
): Promise<string | null> {
  if (!(await findProgramById(input.programId))) {
    return "That program no longer exists — choose another.";
  }
  if (input.pdfFileId && !(await findMediaFileById(input.pdfFileId))) {
    return "The PDF you attached is no longer in the media library.";
  }
  return null;
}

export async function createBulletinAction(
  input: CreateBulletinInput,
): Promise<ActionResult<string>> {
  const action = "createBulletinAction";
  await requireWriter();

  const parsed = parseInput(createBulletinSchema, input);
  if (!parsed.success) return parsed;

  const row = toBulletinWrite(parsed.data);

  try {
    const problem = await checkReferences(row);
    if (problem) return fail(problem);

    // Not a database constraint, but two calls for the same program, term and
    // region is always a mistake — usually a double submit.
    const duplicate = await findDuplicateBulletin({
      programId: row.programId,
      academicYear: row.academicYear,
      term: row.term,
      region: row.region,
    });
    if (duplicate) {
      return fail(
        `A ${row.academicYear}-${row.term} call already exists for this program and region.`,
      );
    }

    const id = await createBulletin(row);

    revalidateBulletin();
    return ok(`“${row.titleZh}” created, closing ${row.deadlineAt}.`, id);
  } catch (error) {
    logger.error({ action, error }, "failed to create bulletin");
    return fail(describeError(error));
  }
}

export async function updateBulletinAction(
  input: UpdateBulletinInput,
): Promise<ActionResult> {
  const action = "updateBulletinAction";
  await requireWriter();

  const parsed = parseInput(updateBulletinSchema, input);
  if (!parsed.success) return parsed;

  const row = toBulletinWrite(parsed.data);

  try {
    if (!(await findBulletinById(parsed.data.id))) return fail(MISSING);

    const problem = await checkReferences(row);
    if (problem) return fail(problem);

    await updateBulletin({ id: parsed.data.id, ...row });

    revalidateBulletin(parsed.data.id);
    revalidatePath(`${BULLETINS_PATH}/${parsed.data.id}/edit`);
    return ok(`“${row.titleZh}” updated.`);
  } catch (error) {
    logger.error({ action, error, id: parsed.data.id }, "failed to update bulletin");
    return fail(describeError(error));
  }
}

export async function setBulletinStatusAction(
  input: SetBulletinStatusInput,
): Promise<ActionResult> {
  const action = "setBulletinStatusAction";
  await requireWriter();

  const parsed = parseInput(setBulletinStatusSchema, input);
  if (!parsed.success) return parsed;

  const { id, status } = parsed.data;

  try {
    const bulletin = await findBulletinById(id);
    if (!bulletin) return fail(MISSING);
    if (bulletin.status === status) {
      return ok(`“${bulletin.titleZh}” is already ${status}.`);
    }

    await setBulletinStatus(id, status);

    revalidateBulletin(id);
    return ok(
      status === "open"
        ? `“${bulletin.titleZh}” is open for applications.`
        : status === "closed"
          ? `“${bulletin.titleZh}” is closed; it stays readable on the site.`
          : `“${bulletin.titleZh}” has been archived.`,
    );
  } catch (error) {
    logger.error({ action, error, id }, "failed to change bulletin status");
    return fail(GENERIC_ACTION_ERROR);
  }
}

export async function deleteBulletinAction(id: string): Promise<ActionResult> {
  const action = "deleteBulletinAction";
  await requireWriter();

  try {
    const bulletin = await findBulletinById(id);
    if (!bulletin) return fail(MISSING);

    // The PDF stays in the media library: it is a document in its own right,
    // and students may still hold a link to it.
    await deleteBulletin(id);

    revalidateBulletin();
    return ok(`“${bulletin.titleZh}” deleted.`);
  } catch (error) {
    logger.error({ action, error, id }, "failed to delete bulletin");
    return fail(GENERIC_ACTION_ERROR);
  }
}
