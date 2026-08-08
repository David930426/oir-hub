"use server";

import { revalidatePath } from "next/cache";
import { requireWriter } from "@/dal";
import { GENERIC_ACTION_ERROR } from "@/constant";
import { logger } from "@/lib/logger";
import { findProgramById } from "@/lib/repositories/program.repository";
import {
  countPartnerSchoolUsage,
  createPartnerSchool,
  deletePartnerSchool,
  findPartnerSchoolById,
  setPartnerSchoolActive,
  updatePartnerSchool,
  type PartnerSchoolWrite,
} from "@/lib/repositories/school.repository";
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
  createPartnerSchoolSchema,
  updatePartnerSchoolSchema,
  type CreatePartnerSchoolInput,
  type UpdatePartnerSchoolInput,
} from "@/lib/validator/school.validator";

/**
 * Partner schools — the agreements a student can be nominated to.
 *
 * A school with testimonials cannot be deleted (the reports reference it ON
 * DELETE RESTRICT), so an expired agreement is deactivated: it drops off the
 * directory while the reports written about it stay readable.
 */

const SCHOOLS_PATH = "/admin/schools";
const MISSING = "That partner school no longer exists.";

function revalidateSchool(id?: string) {
  revalidatePath(SCHOOLS_PATH);
  revalidatePath("/schools");
  if (id) revalidatePath(`/schools/${id}`);
}

function toSchoolWrite(
  input: CreatePartnerSchoolInput | UpdatePartnerSchoolInput,
): PartnerSchoolWrite {
  return {
    programId: input.programId,
    nameZh: input.nameZh,
    nameEn: emptyToNull(input.nameEn),
    country: input.country,
    region: input.region,
    quota: input.quota,
    gpaMin: input.gpaMin,
    languageReq: input.languageReq,
    eligibleColleges: input.eligibleColleges,
    englishTaught: input.englishTaught,
    housingProvided: input.housingProvided,
    websiteUrl: emptyToNull(input.websiteUrl),
    briefFileId: emptyToNull(input.briefFileId),
    active: input.active,
  };
}

export async function createPartnerSchoolAction(
  input: CreatePartnerSchoolInput,
): Promise<ActionResult<string>> {
  const action = "createPartnerSchoolAction";
  await requireWriter();

  const parsed = parseInput(createPartnerSchoolSchema, input);
  if (!parsed.success) return parsed;

  const row = toSchoolWrite(parsed.data);

  try {
    if (!(await findProgramById(row.programId))) {
      return fail("That program no longer exists — choose another.");
    }

    const id = await createPartnerSchool(row);

    revalidateSchool();
    return ok(`${row.nameZh} added, with ${pluralize(row.quota, "slot")} per term.`, id);
  } catch (error) {
    logger.error({ action, error }, "failed to create partner school");
    return fail(describeError(error));
  }
}

export async function updatePartnerSchoolAction(
  input: UpdatePartnerSchoolInput,
): Promise<ActionResult> {
  const action = "updatePartnerSchoolAction";
  await requireWriter();

  const parsed = parseInput(updatePartnerSchoolSchema, input);
  if (!parsed.success) return parsed;

  const row = toSchoolWrite(parsed.data);

  try {
    if (!(await findPartnerSchoolById(parsed.data.id))) return fail(MISSING);
    if (!(await findProgramById(row.programId))) {
      return fail("That program no longer exists — choose another.");
    }

    await updatePartnerSchool({ id: parsed.data.id, ...row });

    revalidateSchool(parsed.data.id);
    revalidatePath(`${SCHOOLS_PATH}/${parsed.data.id}/edit`);
    return ok(`${row.nameZh} updated.`);
  } catch (error) {
    logger.error(
      { action, error, id: parsed.data.id },
      "failed to update partner school",
    );
    return fail(describeError(error));
  }
}

export async function setPartnerSchoolActiveAction(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const action = "setPartnerSchoolActiveAction";
  await requireWriter();

  try {
    const school = await findPartnerSchoolById(id);
    if (!school) return fail(MISSING);
    if (school.active === active) {
      return ok(`${school.nameZh} is already ${active ? "active" : "inactive"}.`);
    }

    await setPartnerSchoolActive(id, active);

    revalidateSchool(id);
    return ok(
      active
        ? `${school.nameZh} is back in the directory.`
        : `${school.nameZh} is hidden from the directory; its testimonials stay published.`,
    );
  } catch (error) {
    logger.error({ action, error, id }, "failed to change partner school status");
    return fail(GENERIC_ACTION_ERROR);
  }
}

export async function deletePartnerSchoolAction(id: string): Promise<ActionResult> {
  const action = "deletePartnerSchoolAction";
  await requireWriter();

  try {
    const school = await findPartnerSchoolById(id);
    if (!school) return fail(MISSING);

    const usage = await countPartnerSchoolUsage(id);
    if (usage > 0) {
      return fail(
        `${pluralize(usage, "testimonial")} still reference this school. Deactivate it instead.`,
      );
    }

    await deletePartnerSchool(id);

    revalidateSchool();
    return ok(`${school.nameZh} deleted.`);
  } catch (error) {
    logger.error({ action, error, id }, "failed to delete partner school");
    return fail(GENERIC_ACTION_ERROR);
  }
}
