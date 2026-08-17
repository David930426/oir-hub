import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth.schema";
import { siteStats } from "@/db/schema/mobility.schema";

/**
 * Site stats — the ERD's SITE_STATS, the figures on the public homepage.
 *
 * `(academicYear, metricKey)` is unique, so the same metric cannot be entered
 * twice for one year; the action turns that collision into a sentence.
 */

export type SiteStatRecord = {
  id: string;
  academicYear: string;
  metricKey: string;
  labelZh: string;
  labelEn: string | null;
  value: number;
  unitZh: string | null;
  unitEn: string | null;
  updatedBy: string | null;
  updatedAt: Date;
};

export async function listSiteStats(): Promise<SiteStatRecord[]> {
  return db
    .select({
      id: siteStats.id,
      academicYear: siteStats.academicYear,
      metricKey: siteStats.metricKey,
      labelZh: siteStats.labelZh,
      labelEn: siteStats.labelEn,
      value: siteStats.value,
      unitZh: siteStats.unitZh,
      unitEn: siteStats.unitEn,
      updatedBy: user.name,
      updatedAt: siteStats.updatedAt,
    })
    .from(siteStats)
    .leftJoin(user, eq(user.id, siteStats.updatedById))
    .orderBy(desc(siteStats.academicYear), asc(siteStats.metricKey));
}

/** The figures for one year, as the homepage shows them. */
export async function listSiteStatsForYear(academicYear: string) {
  return db.query.siteStats.findMany({
    where: eq(siteStats.academicYear, academicYear),
    orderBy: [asc(siteStats.metricKey)],
  });
}

/**
 * The most recent year the office has recorded figures for.
 *
 * The homepage asks for "this year's numbers" without knowing which year that
 * is — it moves on its own each time the annual report is filed, and hard-coding
 * it is how a site ends up quoting figures from three years ago.
 */
export async function listLatestSiteStats() {
  const [newest] = await db
    .select({ academicYear: siteStats.academicYear })
    .from(siteStats)
    .orderBy(desc(siteStats.academicYear))
    .limit(1);

  if (!newest) return [];
  return listSiteStatsForYear(newest.academicYear);
}

export async function findSiteStatById(id: string) {
  return db.query.siteStats.findFirst({ where: eq(siteStats.id, id) });
}

export async function findSiteStatByKey(academicYear: string, metricKey: string) {
  return db.query.siteStats.findFirst({
    where: and(
      eq(siteStats.academicYear, academicYear),
      eq(siteStats.metricKey, metricKey),
    ),
  });
}

export type SiteStatWrite = {
  academicYear: string;
  metricKey: string;
  labelZh: string;
  labelEn: string | null;
  value: number;
  unitZh: string | null;
  unitEn: string | null;
};

export async function createSiteStat(
  input: SiteStatWrite & { updatedById: string },
): Promise<string> {
  const [row] = await db
    .insert(siteStats)
    .values(input)
    .returning({ id: siteStats.id });
  return row.id;
}

export async function updateSiteStat(
  input: SiteStatWrite & { id: string; updatedById: string },
) {
  const { id, ...row } = input;
  await db.update(siteStats).set(row).where(eq(siteStats.id, id));
}

export async function deleteSiteStat(id: string) {
  await db.delete(siteStats).where(eq(siteStats.id, id));
}
