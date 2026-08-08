import { asc, count, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema/chat.schema";

/**
 * The contact inbox — the ERD's CONTACT_MESSAGES.
 *
 * `fromSessionId` is set when the assistant escalated the question, which is
 * how staff reach the transcript that led to it.
 */

export type ContactMessageRecord = {
  id: string;
  name: string;
  email: string;
  topic: string;
  body: string;
  fromSessionId: string | null;
  resolved: boolean;
  createdAt: Date;
};

/** Unresolved first — the inbox is a working queue, not an archive. */
export async function listContactMessages(): Promise<ContactMessageRecord[]> {
  return db
    .select()
    .from(contactMessages)
    .orderBy(asc(contactMessages.resolved), desc(contactMessages.createdAt));
}

export async function findContactMessageById(id: string) {
  return db.query.contactMessages.findFirst({
    where: eq(contactMessages.id, id),
  });
}

export async function countUnresolvedContactMessages(): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(contactMessages)
    .where(eq(contactMessages.resolved, false));

  return row?.total ?? 0;
}

export async function createContactMessage(input: {
  name: string;
  email: string;
  topic: string;
  body: string;
  fromSessionId: string | null;
}): Promise<string> {
  const [row] = await db
    .insert(contactMessages)
    .values(input)
    .returning({ id: contactMessages.id });
  return row.id;
}

export async function setContactResolved(id: string, resolved: boolean) {
  await db.update(contactMessages).set({ resolved }).where(eq(contactMessages.id, id));
}

export async function deleteContactMessage(id: string) {
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
}
