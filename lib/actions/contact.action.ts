"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireWriter } from "@/dal";
import { GENERIC_ACTION_ERROR } from "@/constant";
import { logger } from "@/lib/logger";
import {
  createContactMessage,
  deleteContactMessage,
  findContactMessageById,
  setContactResolved,
} from "@/lib/repositories/contact.repository";
import {
  describeError,
  fail,
  ok,
  parseInput,
  type ActionResult,
} from "@/lib/utils";
import {
  contactSchema,
  setContactResolvedSchema,
  type ContactInput,
  type SetContactResolvedInput,
} from "@/lib/validator/contact.validator";

/**
 * The contact inbox.
 *
 * Submitting is open to anonymous visitors — that is the whole point of a
 * contact form. Reading and clearing the queue is staff-only, so those actions
 * carry the usual guards.
 */

const CONTACT_PATH = "/admin/contact";
const MISSING = "That message no longer exists.";

// ---------- Public ----------

/**
 * Files a message from the contact page.
 *
 * `fromSessionId` exists in the schema for questions escalated from the
 * assistant. Nothing sets it while the assistant is out of the product, so it
 * is always written as null rather than trusted from the browser.
 */
export async function submitContactMessageAction(
  input: ContactInput,
): Promise<ActionResult> {
  const action = "submitContactMessageAction";

  const parsed = parseInput(contactSchema, input);
  if (!parsed.success) return parsed;

  const { name, email, topic, body } = parsed.data;

  try {
    await createContactMessage({ name, email, topic, body, fromSessionId: null });

    revalidatePath(CONTACT_PATH);
    return ok(`Message sent. The office will reply to ${email} within three working days.`);
  } catch (error) {
    logger.error({ action, error }, "failed to file contact message");
    return fail(describeError(error));
  }
}

// ---------- Staff ----------

export async function setContactResolvedAction(
  input: SetContactResolvedInput,
): Promise<ActionResult> {
  const action = "setContactResolvedAction";
  await requireWriter();

  const parsed = parseInput(setContactResolvedSchema, input);
  if (!parsed.success) return parsed;

  const { id, resolved } = parsed.data;

  try {
    const message = await findContactMessageById(id);
    if (!message) return fail(MISSING);
    if (message.resolved === resolved) {
      return ok(`That message is already marked ${resolved ? "resolved" : "open"}.`);
    }

    await setContactResolved(id, resolved);

    revalidatePath(CONTACT_PATH);
    return ok(
      resolved
        ? `${message.name}'s message marked resolved.`
        : `${message.name}'s message reopened.`,
    );
  } catch (error) {
    logger.error({ action, error, id }, "failed to change message state");
    return fail(GENERIC_ACTION_ERROR);
  }
}

/**
 * Deletes a message outright — spam, or something filed by mistake.
 *
 * Admin-only: this is the one screen holding an enquiry someone wrote by hand,
 * and there is nowhere to recover it from.
 */
export async function deleteContactMessageAction(id: string): Promise<ActionResult> {
  const action = "deleteContactMessageAction";
  await requireAdmin();

  try {
    const message = await findContactMessageById(id);
    if (!message) return fail(MISSING);

    await deleteContactMessage(id);

    revalidatePath(CONTACT_PATH);
    return ok(`${message.name}'s message deleted.`);
  } catch (error) {
    logger.error({ action, error, id }, "failed to delete contact message");
    return fail(GENERIC_ACTION_ERROR);
  }
}
