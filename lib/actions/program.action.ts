"use server";

import { revalidatePath } from "next/cache";
import { requireWriter } from "@/dal";
import { GENERIC_ACTION_ERROR } from "@/constant";
import { logger } from "@/lib/logger";
import {
  countProgramUsage,
  createProgram,
  deleteProgram,
  findProgramById,
  setProgramActive,
  updateProgram,
  type ProgramWrite,
} from "@/lib/repositories/program.repository";
import {
  describeError,
  emptyToNull,
  fail,
  isUniqueViolation,
  ok,
  parseInput,
  pluralize,
  type ActionResult,
} from "@/lib/utils";
import {
  createProgramSchema,
  updateProgramSchema,
  type CreateProgramInput,
  type UpdateProgramInput,
} from "@/lib/validator/program.validator";

/**
 * Programs — the offerings everything else in the mobility domain hangs off.
 *
 * Bulletins, partner schools and funding calls reference a program ON DELETE
 * RESTRICT, so a program in use is deactivated rather than deleted: hiding it
 * from the site keeps the rows that point at it readable.
 */

const PROGRAMS_PATH = "/admin/programs";
const SLUG_TAKEN = "That slug is already used by another program.";
const MISSING = "That program no longer exists.";

function revalidateProgram(slug: string) {
  revalidatePath(PROGRAMS_PATH);
  revalidatePath("/programs");
  revalidatePath(`/programs/${slug}`);
}

function toProgramWrite(
  input: CreateProgramInput | UpdateProgramInput,
): ProgramWrite {
  return {
    slug: input.slug,
    type: input.type,
    nameZh: input.nameZh,
    nameEn: emptyToNull(input.nameEn),
    overviewZh: input.overviewZh,
    overviewEn: emptyToNull(input.overviewEn),
    active: input.active,
    sortOrder: input.sortOrder,
  };
}

export async function createProgramAction(
  input: CreateProgramInput,
): Promise<ActionResult<string>> {
  const action = "createProgramAction";
  await requireWriter();

  const parsed = parseInput(createProgramSchema, input);
  if (!parsed.success) return parsed;

  try {
    const id = await createProgram(toProgramWrite(parsed.data));

    revalidateProgram(parsed.data.slug);
    return ok(`Program “${parsed.data.nameZh}” created.`, id);
  } catch (error) {
    if (isUniqueViolation(error)) return fail(SLUG_TAKEN);

    logger.error({ action, error }, "failed to create program");
    return fail(describeError(error));
  }
}

export async function updateProgramAction(
  input: UpdateProgramInput,
): Promise<ActionResult> {
  const action = "updateProgramAction";
  await requireWriter();

  const parsed = parseInput(updateProgramSchema, input);
  if (!parsed.success) return parsed;

  try {
    const current = await findProgramById(parsed.data.id);
    if (!current) return fail(MISSING);

    await updateProgram({ id: parsed.data.id, ...toProgramWrite(parsed.data) });

    revalidateProgram(parsed.data.slug);
    if (current.slug !== parsed.data.slug) revalidatePath(`/programs/${current.slug}`);
    revalidatePath(`${PROGRAMS_PATH}/${parsed.data.id}/edit`);

    return ok(`Program “${parsed.data.nameZh}” updated.`);
  } catch (error) {
    if (isUniqueViolation(error)) return fail(SLUG_TAKEN);

    logger.error({ action, error, id: parsed.data.id }, "failed to update program");
    return fail(describeError(error));
  }
}

export async function setProgramActiveAction(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const action = "setProgramActiveAction";
  await requireWriter();

  try {
    const program = await findProgramById(id);
    if (!program) return fail(MISSING);
    if (program.active === active) {
      return ok(`“${program.nameZh}” is already ${active ? "active" : "inactive"}.`);
    }

    await setProgramActive(id, active);

    revalidateProgram(program.slug);
    return ok(
      active
        ? `“${program.nameZh}” is visible on the site again.`
        : `“${program.nameZh}” is hidden from the site; its bulletins and schools are untouched.`,
    );
  } catch (error) {
    logger.error({ action, error, id }, "failed to change program status");
    return fail(GENERIC_ACTION_ERROR);
  }
}

export async function deleteProgramAction(id: string): Promise<ActionResult> {
  const action = "deleteProgramAction";
  await requireWriter();

  try {
    const program = await findProgramById(id);
    if (!program) return fail(MISSING);

    // The foreign keys would refuse this anyway — checking first turns a
    // constraint violation into a sentence that says what to do about it.
    const usage = await countProgramUsage(id);
    if (usage > 0) {
      return fail(
        `Still referenced by ${pluralize(usage, "bulletin, school or funding call", "bulletins, schools or funding calls")}. Deactivate it instead.`,
      );
    }

    await deleteProgram(id);

    revalidateProgram(program.slug);
    return ok(`Program “${program.nameZh}” deleted.`);
  } catch (error) {
    logger.error({ action, error, id }, "failed to delete program");
    return fail(GENERIC_ACTION_ERROR);
  }
}
