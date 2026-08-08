import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth.schema";
import { tcornerSlots } from "@/db/schema/mobility.schema";
import type { WeekdayValue } from "@/lib/validator/tcorner.validator";

/**
 * T-Corner — the ERD's TCORNER_SLOTS, the weekly walk-in advising hours.
 *
 * Ordering is by weekday then start time, which the pgEnum gives for free:
 * Postgres sorts an enum by declaration order, so `mon` comes before `tue`
 * without a CASE expression.
 */

export type TcornerSlotRecord = {
  id: string;
  weekday: WeekdayValue;
  startTime: string;
  endTime: string;
  location: string;
  advisorName: string;
  hostName: string | null;
  topics: string[];
  bookingRequired: boolean;
  bookingUrl: string | null;
  active: boolean;
};

export async function listTcornerSlots(): Promise<TcornerSlotRecord[]> {
  return db
    .select({
      id: tcornerSlots.id,
      weekday: tcornerSlots.weekday,
      startTime: tcornerSlots.startTime,
      endTime: tcornerSlots.endTime,
      location: tcornerSlots.location,
      advisorName: tcornerSlots.advisorName,
      hostName: user.name,
      topics: tcornerSlots.topics,
      bookingRequired: tcornerSlots.bookingRequired,
      bookingUrl: tcornerSlots.bookingUrl,
      active: tcornerSlots.active,
    })
    .from(tcornerSlots)
    .leftJoin(user, eq(user.id, tcornerSlots.hostUserId))
    .orderBy(asc(tcornerSlots.weekday), asc(tcornerSlots.startTime));
}

/** Live slots for the public schedule. */
export async function listActiveTcornerSlots() {
  return db.query.tcornerSlots.findMany({
    where: eq(tcornerSlots.active, true),
    orderBy: [asc(tcornerSlots.weekday), asc(tcornerSlots.startTime)],
  });
}

export async function findTcornerSlotById(id: string) {
  return db.query.tcornerSlots.findFirst({ where: eq(tcornerSlots.id, id) });
}

export type TcornerSlotWrite = {
  weekday: WeekdayValue;
  startTime: string;
  endTime: string;
  location: string;
  advisorName: string;
  hostUserId: string;
  topics: string[];
  bookingRequired: boolean;
  bookingUrl: string | null;
  active: boolean;
};

export async function createTcornerSlot(input: TcornerSlotWrite): Promise<string> {
  const [row] = await db
    .insert(tcornerSlots)
    .values(input)
    .returning({ id: tcornerSlots.id });
  return row.id;
}

export async function updateTcornerSlot(input: TcornerSlotWrite & { id: string }) {
  const { id, ...row } = input;
  await db.update(tcornerSlots).set(row).where(eq(tcornerSlots.id, id));
}

export async function setTcornerSlotActive(id: string, active: boolean) {
  await db.update(tcornerSlots).set({ active }).where(eq(tcornerSlots.id, id));
}

export async function deleteTcornerSlot(id: string) {
  await db.delete(tcornerSlots).where(eq(tcornerSlots.id, id));
}
