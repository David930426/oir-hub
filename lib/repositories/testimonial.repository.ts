import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { partnerSchools, testimonials } from "@/db/schema/mobility.schema";
import type { TestimonialStatusValue } from "@/lib/validator/testimonial.validator";

/**
 * Testimonials — the ERD's TESTIMONIALS.
 *
 * `consentGiven` is the one column that gates publication; the action refuses
 * to publish without it, and this layer just stores what it is told.
 */

export type TestimonialRecord = {
  id: string;
  displayName: string;
  deptYear: string;
  country: string;
  termLabel: string;
  schoolName: string | null;
  consentGiven: boolean;
  status: TestimonialStatusValue;
  createdAt: Date;
};

export async function listTestimonials(): Promise<TestimonialRecord[]> {
  return db
    .select({
      id: testimonials.id,
      displayName: testimonials.displayName,
      deptYear: testimonials.deptYear,
      country: testimonials.country,
      termLabel: testimonials.termLabel,
      schoolName: partnerSchools.nameZh,
      consentGiven: testimonials.consentGiven,
      status: testimonials.status,
      createdAt: testimonials.createdAt,
    })
    .from(testimonials)
    .leftJoin(partnerSchools, eq(partnerSchools.id, testimonials.partnerSchoolId))
    .orderBy(desc(testimonials.createdAt));
}

/** Published reports for the public site. */
export async function listPublishedTestimonials() {
  return db.query.testimonials.findMany({
    where: eq(testimonials.status, "published"),
    with: { partnerSchool: true },
    orderBy: [desc(testimonials.createdAt), asc(testimonials.displayName)],
  });
}

export async function findTestimonialById(id: string) {
  return db.query.testimonials.findFirst({
    where: eq(testimonials.id, id),
    with: { partnerSchool: true, fullTextFile: true },
  });
}

export type TestimonialWrite = {
  partnerSchoolId: string;
  displayName: string;
  deptYear: string;
  country: string;
  termLabel: string;
  highlights: string[];
  bodyZh: string;
  bodyEn: string | null;
  fullTextFileId: string | null;
  consentGiven: boolean;
  status: TestimonialStatusValue;
};

export async function createTestimonial(input: TestimonialWrite): Promise<string> {
  const [row] = await db
    .insert(testimonials)
    .values(input)
    .returning({ id: testimonials.id });
  return row.id;
}

export async function updateTestimonial(input: TestimonialWrite & { id: string }) {
  const { id, ...row } = input;
  await db.update(testimonials).set(row).where(eq(testimonials.id, id));
}

export async function setTestimonialStatus(
  id: string,
  status: TestimonialStatusValue,
) {
  await db.update(testimonials).set({ status }).where(eq(testimonials.id, id));
}

export async function deleteTestimonial(id: string) {
  await db.delete(testimonials).where(eq(testimonials.id, id));
}
