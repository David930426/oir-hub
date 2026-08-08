import { asc, count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  partnerSchools,
  programs,
  testimonials,
  type LanguageRequirement,
} from "@/db/schema/mobility.schema";

/**
 * Partner schools — the ERD's PARTNER_SCHOOLS.
 *
 * Testimonials reference a school ON DELETE RESTRICT, so the count of them is
 * what decides whether a school may be removed or only deactivated.
 */

export type PartnerSchoolRecord = {
  id: string;
  nameZh: string;
  nameEn: string | null;
  country: string;
  region: string;
  programName: string | null;
  quota: number;
  gpaMin: number;
  englishTaught: boolean;
  housingProvided: boolean;
  active: boolean;
  testimonialCount: number;
};

export async function listPartnerSchools(): Promise<PartnerSchoolRecord[]> {
  const testimonialUsage = db
    .select({
      partnerSchoolId: testimonials.partnerSchoolId,
      total: count().as("testimonial_total"),
    })
    .from(testimonials)
    .groupBy(testimonials.partnerSchoolId)
    .as("testimonial_usage");

  return db
    .select({
      id: partnerSchools.id,
      nameZh: partnerSchools.nameZh,
      nameEn: partnerSchools.nameEn,
      country: partnerSchools.country,
      region: partnerSchools.region,
      programName: programs.nameZh,
      quota: partnerSchools.quota,
      gpaMin: partnerSchools.gpaMin,
      englishTaught: partnerSchools.englishTaught,
      housingProvided: partnerSchools.housingProvided,
      active: partnerSchools.active,
      testimonialCount: sql<number>`coalesce(${testimonialUsage.total}, 0)`.mapWith(
        Number,
      ),
    })
    .from(partnerSchools)
    .leftJoin(programs, eq(programs.id, partnerSchools.programId))
    .leftJoin(testimonialUsage, eq(testimonialUsage.partnerSchoolId, partnerSchools.id))
    .orderBy(asc(partnerSchools.country), asc(partnerSchools.nameZh));
}

/** Active schools, for the public directory and the testimonial form's picker. */
export async function listActivePartnerSchools() {
  return db.query.partnerSchools.findMany({
    where: eq(partnerSchools.active, true),
    with: { program: true },
    orderBy: [asc(partnerSchools.country), asc(partnerSchools.nameZh)],
  });
}

export async function findPartnerSchoolById(id: string) {
  return db.query.partnerSchools.findFirst({
    where: eq(partnerSchools.id, id),
    with: { program: true, briefFile: true },
  });
}

export async function countPartnerSchoolUsage(id: string): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(testimonials)
    .where(eq(testimonials.partnerSchoolId, id));

  return row?.total ?? 0;
}

export type PartnerSchoolWrite = {
  programId: string;
  nameZh: string;
  nameEn: string | null;
  country: string;
  region: string;
  quota: number;
  gpaMin: number;
  languageReq: LanguageRequirement[];
  eligibleColleges: string[];
  englishTaught: boolean;
  housingProvided: boolean;
  websiteUrl: string | null;
  briefFileId: string | null;
  active: boolean;
};

export async function createPartnerSchool(
  input: PartnerSchoolWrite,
): Promise<string> {
  const [row] = await db
    .insert(partnerSchools)
    .values(input)
    .returning({ id: partnerSchools.id });
  return row.id;
}

export async function updatePartnerSchool(
  input: PartnerSchoolWrite & { id: string },
) {
  const { id, ...row } = input;
  await db.update(partnerSchools).set(row).where(eq(partnerSchools.id, id));
}

export async function setPartnerSchoolActive(id: string, active: boolean) {
  await db.update(partnerSchools).set({ active }).where(eq(partnerSchools.id, id));
}

export async function deletePartnerSchool(id: string) {
  await db.delete(partnerSchools).where(eq(partnerSchools.id, id));
}
