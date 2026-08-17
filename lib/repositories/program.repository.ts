import { asc, count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  bulletins,
  fundings,
  partnerSchools,
  programs,
} from "@/db/schema/mobility.schema";
import type { ProgramTypeValue } from "@/lib/validator/program.validator";

/**
 * Programs — the ERD's PROGRAMS.
 *
 * Bulletins and partner schools reference a program ON DELETE RESTRICT, so
 * "in use" is counted here: it decides whether a program can be removed or only
 * deactivated.
 */

export type ProgramRecord = {
  id: string;
  slug: string;
  type: ProgramTypeValue;
  nameZh: string;
  nameEn: string | null;
  active: boolean;
  sortOrder: number;
  bulletinCount: number;
  schoolCount: number;
};

export async function listPrograms(): Promise<ProgramRecord[]> {
  const bulletinUsage = db
    .select({ programId: bulletins.programId, total: count().as("bulletin_total") })
    .from(bulletins)
    .groupBy(bulletins.programId)
    .as("bulletin_usage");

  const schoolUsage = db
    .select({
      programId: partnerSchools.programId,
      total: count().as("school_total"),
    })
    .from(partnerSchools)
    .groupBy(partnerSchools.programId)
    .as("school_usage");

  const rows = await db
    .select({
      id: programs.id,
      slug: programs.slug,
      type: programs.type,
      nameZh: programs.nameZh,
      nameEn: programs.nameEn,
      active: programs.active,
      sortOrder: programs.sortOrder,
      bulletinCount: bulletinUsage.total,
      schoolCount: schoolUsage.total,
    })
    .from(programs)
    .leftJoin(bulletinUsage, eq(bulletinUsage.programId, programs.id))
    .leftJoin(schoolUsage, eq(schoolUsage.programId, programs.id))
    .orderBy(asc(programs.sortOrder), asc(programs.nameZh));

  return rows.map((row) => ({
    ...row,
    bulletinCount: row.bulletinCount ?? 0,
    schoolCount: row.schoolCount ?? 0,
  }));
}

/** Active programs, for the pickers on bulletin, school and funding forms. */
export async function listActivePrograms() {
  return db
    .select({
      id: programs.id,
      nameZh: programs.nameZh,
      nameEn: programs.nameEn,
      type: programs.type,
    })
    .from(programs)
    .where(eq(programs.active, true))
    .orderBy(asc(programs.sortOrder), asc(programs.nameZh));
}

/** An active program with the figures the public list prints beside it. */
export type SiteProgramRecord = {
  id: string;
  slug: string;
  type: ProgramTypeValue;
  nameZh: string;
  nameEn: string | null;
  overviewZh: string;
  overviewEn: string | null;
  schoolCount: number;
  totalQuota: number;
  openBulletins: number;
  totalBulletins: number;
  fundingCount: number;
};

/**
 * Active programs, each with what a student wants to compare them by.
 *
 * The counts are aggregated in the database and merged here rather than joined
 * in one query: four independent one-to-many counts against the same table
 * would multiply each other out, and a program with three schools would report
 * nine of everything else.
 */
export async function listProgramsForSite(): Promise<SiteProgramRecord[]> {
  const [rows, schoolCounts, bulletinCounts, fundingCounts] = await Promise.all([
    db.query.programs.findMany({
      where: eq(programs.active, true),
      orderBy: [asc(programs.sortOrder), asc(programs.nameZh)],
    }),
    db
      .select({
        programId: partnerSchools.programId,
        total: count(),
        quota: sql<number>`coalesce(sum(${partnerSchools.quota}), 0)`.mapWith(Number),
      })
      .from(partnerSchools)
      .where(eq(partnerSchools.active, true))
      .groupBy(partnerSchools.programId),
    db
      .select({
        programId: bulletins.programId,
        total: count(),
        open: sql<number>`count(*) filter (where ${bulletins.status} = 'open')`.mapWith(
          Number,
        ),
      })
      .from(bulletins)
      .groupBy(bulletins.programId),
    db
      .select({ programId: fundings.programId, total: count() })
      .from(fundings)
      .where(eq(fundings.status, "open"))
      .groupBy(fundings.programId),
  ]);

  const schoolsBy = new Map(schoolCounts.map((row) => [row.programId, row]));
  const bulletinsBy = new Map(bulletinCounts.map((row) => [row.programId, row]));
  const fundingBy = new Map(fundingCounts.map((row) => [row.programId, row]));

  return rows.map((program) => ({
    id: program.id,
    slug: program.slug,
    type: program.type,
    nameZh: program.nameZh,
    nameEn: program.nameEn,
    overviewZh: program.overviewZh,
    overviewEn: program.overviewEn,
    schoolCount: schoolsBy.get(program.id)?.total ?? 0,
    totalQuota: schoolsBy.get(program.id)?.quota ?? 0,
    openBulletins: bulletinsBy.get(program.id)?.open ?? 0,
    totalBulletins: bulletinsBy.get(program.id)?.total ?? 0,
    fundingCount: fundingBy.get(program.id)?.total ?? 0,
  }));
}

export async function findProgramById(id: string) {
  return db.query.programs.findFirst({ where: eq(programs.id, id) });
}

export async function findProgramBySlug(slug: string) {
  return db.query.programs.findFirst({ where: eq(programs.slug, slug) });
}

/** Rows that would block a delete: bulletins, partner schools, funding calls. */
export async function countProgramUsage(id: string): Promise<number> {
  const [bulletinRefs] = await db
    .select({ total: count() })
    .from(bulletins)
    .where(eq(bulletins.programId, id));

  const [schoolRefs] = await db
    .select({ total: count() })
    .from(partnerSchools)
    .where(eq(partnerSchools.programId, id));

  const [fundingRefs] = await db
    .select({ total: count() })
    .from(fundings)
    .where(eq(fundings.programId, id));

  return (
    (bulletinRefs?.total ?? 0) + (schoolRefs?.total ?? 0) + (fundingRefs?.total ?? 0)
  );
}

export type ProgramWrite = {
  slug: string;
  type: ProgramTypeValue;
  nameZh: string;
  nameEn: string | null;
  overviewZh: string;
  overviewEn: string | null;
  active: boolean;
  sortOrder: number;
};

export async function createProgram(input: ProgramWrite): Promise<string> {
  const [row] = await db.insert(programs).values(input).returning({ id: programs.id });
  return row.id;
}

export async function updateProgram(input: ProgramWrite & { id: string }) {
  const { id, ...row } = input;
  await db.update(programs).set(row).where(eq(programs.id, id));
}

export async function setProgramActive(id: string, active: boolean) {
  await db.update(programs).set({ active }).where(eq(programs.id, id));
}

export async function deleteProgram(id: string) {
  await db.delete(programs).where(eq(programs.id, id));
}
