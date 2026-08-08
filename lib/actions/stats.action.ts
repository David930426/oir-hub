"use server";

import { revalidatePath } from "next/cache";
import { requireWriter } from "@/dal";
import { GENERIC_ACTION_ERROR } from "@/constant";
import { logger } from "@/lib/logger";
import {
  createSiteStat,
  deleteSiteStat,
  findSiteStatById,
  findSiteStatByKey,
  updateSiteStat,
  type SiteStatWrite,
} from "@/lib/repositories/stats.repository";
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
  createSiteStatSchema,
  updateSiteStatSchema,
  type CreateSiteStatInput,
  type UpdateSiteStatInput,
} from "@/lib/validator/stats.validator";

/**
 * Site stats — the hand-entered figures on the public homepage.
 *
 * `(academicYear, metricKey)` is unique in the database, so the same metric
 * cannot be entered twice for one year; both the pre-check and the constraint
 * report it with the same sentence.
 */

const STATS_PATH = "/admin/stats";
const MISSING = "That figure no longer exists.";
const DUPLICATE = "That metric already has a value for this academic year.";

function revalidateStats() {
  revalidatePath(STATS_PATH);
  revalidatePath("/");
}

function toStatWrite(
  input: CreateSiteStatInput | UpdateSiteStatInput,
): SiteStatWrite {
  return {
    academicYear: input.academicYear,
    metricKey: input.metricKey,
    labelZh: input.labelZh,
    labelEn: emptyToNull(input.labelEn),
    value: input.value,
    unitZh: emptyToNull(input.unitZh),
    unitEn: emptyToNull(input.unitEn),
  };
}

export async function createSiteStatAction(
  input: CreateSiteStatInput,
): Promise<ActionResult<string>> {
  const action = "createSiteStatAction";
  const session = await requireWriter();

  const parsed = parseInput(createSiteStatSchema, input);
  if (!parsed.success) return parsed;

  const row = toStatWrite(parsed.data);

  try {
    if (await findSiteStatByKey(row.academicYear, row.metricKey)) {
      return fail(DUPLICATE);
    }

    const id = await createSiteStat({ ...row, updatedById: session.user.id });

    revalidateStats();
    return ok(`${row.labelZh} recorded for ${row.academicYear}.`, id);
  } catch (error) {
    if (isUniqueViolation(error)) return fail(DUPLICATE);

    logger.error({ action, error }, "failed to create site stat");
    return fail(describeError(error));
  }
}

export async function updateSiteStatAction(
  input: UpdateSiteStatInput,
): Promise<ActionResult> {
  const action = "updateSiteStatAction";
  const session = await requireWriter();

  const parsed = parseInput(updateSiteStatSchema, input);
  if (!parsed.success) return parsed;

  const row = toStatWrite(parsed.data);

  try {
    if (!(await findSiteStatById(parsed.data.id))) return fail(MISSING);

    const clash = await findSiteStatByKey(row.academicYear, row.metricKey);
    if (clash && clash.id !== parsed.data.id) return fail(DUPLICATE);

    await updateSiteStat({
      id: parsed.data.id,
      ...row,
      updatedById: session.user.id,
    });

    revalidateStats();
    revalidatePath(`${STATS_PATH}/${parsed.data.id}/edit`);
    return ok(`${row.labelZh} updated.`);
  } catch (error) {
    if (isUniqueViolation(error)) return fail(DUPLICATE);

    logger.error({ action, error, id: parsed.data.id }, "failed to update site stat");
    return fail(describeError(error));
  }
}

export async function deleteSiteStatAction(id: string): Promise<ActionResult> {
  const action = "deleteSiteStatAction";
  await requireWriter();

  try {
    const stat = await findSiteStatById(id);
    if (!stat) return fail(MISSING);

    await deleteSiteStat(id);

    revalidateStats();
    return ok(`${stat.labelZh} removed from ${stat.academicYear}.`);
  } catch (error) {
    logger.error({ action, error, id }, "failed to delete site stat");
    return fail(GENERIC_ACTION_ERROR);
  }
}
