import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { mediaFiles } from "@/db/schema/cms.schema";
import { bulletins, programs } from "@/db/schema/mobility.schema";
import type {
  BulletinStatusValue,
  TermValue,
} from "@/lib/validator/bulletin.validator";

/**
 * Bulletins — the ERD's BULLETINS, the selection calls students apply through.
 *
 * Ordered by deadline rather than by creation: what matters about a bulletin is
 * how long is left on it.
 */

export type BulletinRecord = {
  id: string;
  academicYear: string;
  term: string;
  titleZh: string;
  titleEn: string | null;
  region: string;
  programName: string | null;
  pdfFileId: string | null;
  pdfFilename: string | null;
  announcedAt: string;
  deadlineAt: string;
  status: BulletinStatusValue;
  createdAt: Date;
};

export async function listBulletins(): Promise<BulletinRecord[]> {
  return db
    .select({
      id: bulletins.id,
      academicYear: bulletins.academicYear,
      term: bulletins.term,
      titleZh: bulletins.titleZh,
      titleEn: bulletins.titleEn,
      region: bulletins.region,
      programName: programs.nameZh,
      pdfFileId: bulletins.pdfFileId,
      pdfFilename: mediaFiles.filename,
      announcedAt: bulletins.announcedAt,
      deadlineAt: bulletins.deadlineAt,
      status: bulletins.status,
      createdAt: bulletins.createdAt,
    })
    .from(bulletins)
    .leftJoin(programs, eq(programs.id, bulletins.programId))
    .leftJoin(mediaFiles, eq(mediaFiles.id, bulletins.pdfFileId))
    .orderBy(desc(bulletins.deadlineAt));
}

/** Open calls for the public site, soonest deadline first. */
export async function listOpenBulletins() {
  return db.query.bulletins.findMany({
    where: eq(bulletins.status, "open"),
    with: { program: true, pdfFile: true },
    orderBy: [asc(bulletins.deadlineAt)],
  });
}

export async function findBulletinById(id: string) {
  return db.query.bulletins.findFirst({
    where: eq(bulletins.id, id),
    with: { program: true, pdfFile: true },
  });
}

/**
 * True when another bulletin already covers this program, year, term and
 * region — the combination staff think of as "the call", even though the
 * database does not constrain it.
 */
export async function findDuplicateBulletin(input: {
  programId: string;
  academicYear: string;
  term: TermValue;
  region: string;
}) {
  return db.query.bulletins.findFirst({
    where: and(
      eq(bulletins.programId, input.programId),
      eq(bulletins.academicYear, input.academicYear),
      eq(bulletins.term, input.term),
      eq(bulletins.region, input.region),
    ),
  });
}

export type BulletinWrite = {
  programId: string;
  academicYear: string;
  term: TermValue;
  titleZh: string;
  titleEn: string | null;
  region: string;
  pdfFileId: string | null;
  announcedAt: string;
  deadlineAt: string;
  status: BulletinStatusValue;
};

export async function createBulletin(input: BulletinWrite): Promise<string> {
  const [row] = await db
    .insert(bulletins)
    .values(input)
    .returning({ id: bulletins.id });
  return row.id;
}

export async function updateBulletin(input: BulletinWrite & { id: string }) {
  const { id, ...row } = input;
  await db.update(bulletins).set(row).where(eq(bulletins.id, id));
}

export async function setBulletinStatus(id: string, status: BulletinStatusValue) {
  await db.update(bulletins).set({ status }).where(eq(bulletins.id, id));
}

export async function deleteBulletin(id: string) {
  await db.delete(bulletins).where(eq(bulletins.id, id));
}
