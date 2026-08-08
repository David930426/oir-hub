"use server";

import { revalidatePath } from "next/cache";
import { requireWriter } from "@/dal";
import { GENERIC_ACTION_ERROR } from "@/constant";
import { logger } from "@/lib/logger";
import { findUserById } from "@/lib/repositories/user.repository";
import {
  createTcornerSlot,
  deleteTcornerSlot,
  findTcornerSlotById,
  setTcornerSlotActive,
  updateTcornerSlot,
  type TcornerSlotWrite,
} from "@/lib/repositories/tcorner.repository";
import {
  describeError,
  emptyToNull,
  fail,
  ok,
  parseInput,
  type ActionResult,
} from "@/lib/utils";
import {
  createTcornerSlotSchema,
  updateTcornerSlotSchema,
  type CreateTcornerSlotInput,
  type UpdateTcornerSlotInput,
} from "@/lib/validator/tcorner.validator";

/**
 * T-Corner — the weekly walk-in advising hours.
 *
 * A slot names a host account as well as an advisor, because the host is who
 * the console notifies; the advisor name is what the site prints, and the two
 * are not always the same person.
 */

const TCORNER_PATH = "/admin/t-corner";
const MISSING = "That slot no longer exists.";

function revalidateTcorner() {
  revalidatePath(TCORNER_PATH);
  revalidatePath("/t-corner");
}

function toSlotWrite(
  input: CreateTcornerSlotInput | UpdateTcornerSlotInput,
): TcornerSlotWrite {
  return {
    weekday: input.weekday,
    startTime: input.startTime,
    endTime: input.endTime,
    location: input.location,
    advisorName: input.advisorName,
    hostUserId: input.hostUserId,
    topics: input.topics,
    bookingRequired: input.bookingRequired,
    bookingUrl: emptyToNull(input.bookingUrl),
    active: input.active,
  };
}

/** The host must be a real, still-active staff account. */
async function checkHost(hostUserId: string): Promise<string | null> {
  const host = await findUserById(hostUserId);
  if (!host) return "That host account no longer exists — choose another.";
  if (!host.active) return `${host.name}'s account is deactivated — choose another host.`;
  return null;
}

export async function createTcornerSlotAction(
  input: CreateTcornerSlotInput,
): Promise<ActionResult<string>> {
  const action = "createTcornerSlotAction";
  await requireWriter();

  const parsed = parseInput(createTcornerSlotSchema, input);
  if (!parsed.success) return parsed;

  const row = toSlotWrite(parsed.data);

  try {
    const problem = await checkHost(row.hostUserId);
    if (problem) return fail(problem);

    const id = await createTcornerSlot(row);

    revalidateTcorner();
    return ok(`${row.weekday} ${row.startTime}–${row.endTime} added.`, id);
  } catch (error) {
    logger.error({ action, error }, "failed to create T-Corner slot");
    return fail(describeError(error));
  }
}

export async function updateTcornerSlotAction(
  input: UpdateTcornerSlotInput,
): Promise<ActionResult> {
  const action = "updateTcornerSlotAction";
  await requireWriter();

  const parsed = parseInput(updateTcornerSlotSchema, input);
  if (!parsed.success) return parsed;

  const row = toSlotWrite(parsed.data);

  try {
    if (!(await findTcornerSlotById(parsed.data.id))) return fail(MISSING);

    const problem = await checkHost(row.hostUserId);
    if (problem) return fail(problem);

    await updateTcornerSlot({ id: parsed.data.id, ...row });

    revalidateTcorner();
    revalidatePath(`${TCORNER_PATH}/${parsed.data.id}/edit`);
    return ok(`${row.weekday} ${row.startTime}–${row.endTime} updated.`);
  } catch (error) {
    logger.error(
      { action, error, id: parsed.data.id },
      "failed to update T-Corner slot",
    );
    return fail(describeError(error));
  }
}

export async function setTcornerSlotActiveAction(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const action = "setTcornerSlotActiveAction";
  await requireWriter();

  try {
    const slot = await findTcornerSlotById(id);
    if (!slot) return fail(MISSING);
    if (slot.active === active) {
      return ok(`That slot is already ${active ? "on" : "off"} the schedule.`);
    }

    await setTcornerSlotActive(id, active);

    revalidateTcorner();
    return ok(
      active
        ? "The slot is back on the public schedule."
        : "The slot is off the public schedule — use this for a week the office is away.",
    );
  } catch (error) {
    logger.error({ action, error, id }, "failed to change T-Corner slot status");
    return fail(GENERIC_ACTION_ERROR);
  }
}

export async function deleteTcornerSlotAction(id: string): Promise<ActionResult> {
  const action = "deleteTcornerSlotAction";
  await requireWriter();

  try {
    const slot = await findTcornerSlotById(id);
    if (!slot) return fail(MISSING);

    await deleteTcornerSlot(id);

    revalidateTcorner();
    return ok("Slot deleted.");
  } catch (error) {
    logger.error({ action, error, id }, "failed to delete T-Corner slot");
    return fail(GENERIC_ACTION_ERROR);
  }
}
