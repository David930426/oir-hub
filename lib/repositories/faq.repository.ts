import { asc, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth.schema";
import { categories } from "@/db/schema/cms.schema";
import { faqSources, faqs } from "@/db/schema/knowledge.schema";
import type { FaqAudienceValue } from "@/lib/validator/faq.validator";

/**
 * FAQs — the ERD's FAQS and FAQ_SOURCES.
 *
 * `lastReviewedAt` and `reviewedById` are not form fields: they record who last
 * stood behind the answer, so every write here sets them from the session.
 */

export type FaqRecord = {
  id: string;
  questionZh: string;
  questionEn: string | null;
  shortAnswerZh: string;
  categoryName: string | null;
  audience: FaqAudienceValue;
  needsHumanConfirm: boolean;
  published: boolean;
  lastReviewedAt: Date;
  reviewedBy: string | null;
  sourceCount: number;
};

export async function listFaqs(): Promise<FaqRecord[]> {
  const sourceUsage = db
    .select({ faqId: faqSources.faqId, total: count().as("source_total") })
    .from(faqSources)
    .groupBy(faqSources.faqId)
    .as("source_usage");

  return db
    .select({
      id: faqs.id,
      questionZh: faqs.questionZh,
      questionEn: faqs.questionEn,
      shortAnswerZh: faqs.shortAnswerZh,
      categoryName: categories.nameZh,
      audience: faqs.audience,
      needsHumanConfirm: faqs.needsHumanConfirm,
      published: faqs.published,
      lastReviewedAt: faqs.lastReviewedAt,
      reviewedBy: user.name,
      sourceCount: sql<number>`coalesce(${sourceUsage.total}, 0)`.mapWith(Number),
    })
    .from(faqs)
    .leftJoin(categories, eq(categories.id, faqs.categoryId))
    .leftJoin(user, eq(user.id, faqs.reviewedById))
    .leftJoin(sourceUsage, eq(sourceUsage.faqId, faqs.id))
    .orderBy(desc(faqs.lastReviewedAt));
}

/** Published FAQs for the public site and for indexing. */
export async function listPublishedFaqs() {
  return db.query.faqs.findMany({
    where: eq(faqs.published, true),
    with: { category: true, sources: true },
    orderBy: [asc(faqs.categoryId)],
  });
}

export async function findFaqById(id: string) {
  return db.query.faqs.findFirst({
    where: eq(faqs.id, id),
    with: { sources: true },
  });
}

/** One citation, as the form submits it. */
export type FaqSourceWrite = {
  mediaFileId: string | null;
  sourceUrl: string | null;
  label: string;
};

export type FaqWrite = {
  categoryId: string;
  questionZh: string;
  questionEn: string | null;
  shortAnswerZh: string;
  shortAnswerEn: string | null;
  longAnswerZh: string;
  longAnswerEn: string | null;
  audience: FaqAudienceValue;
  needsHumanConfirm: boolean;
  published: boolean;
  sources: FaqSourceWrite[];
};

export async function createFaq(
  input: FaqWrite & { reviewedById: string },
): Promise<string> {
  const { sources, ...row } = input;

  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(faqs)
      .values({ ...row, lastReviewedAt: new Date() })
      .returning({ id: faqs.id });

    if (sources.length > 0) {
      await tx
        .insert(faqSources)
        .values(sources.map((source) => ({ ...source, faqId: created.id })));
    }

    return created.id;
  });
}

/**
 * Applies the edit form and records the review.
 *
 * Sources are replaced wholesale for the same reason a post's tags are: the
 * rows carry nothing but the citation itself, and a partial update would be
 * more code for a worse guarantee.
 */
export async function updateFaq(input: FaqWrite & { id: string; reviewedById: string }) {
  const { id, sources, ...row } = input;

  await db.transaction(async (tx) => {
    await tx
      .update(faqs)
      .set({ ...row, lastReviewedAt: new Date() })
      .where(eq(faqs.id, id));

    await tx.delete(faqSources).where(eq(faqSources.faqId, id));
    if (sources.length > 0) {
      await tx
        .insert(faqSources)
        .values(sources.map((source) => ({ ...source, faqId: id })));
    }
  });
}

export async function setFaqPublished(id: string, published: boolean) {
  await db.update(faqs).set({ published }).where(eq(faqs.id, id));
}

/**
 * Records that someone checked the answer is still correct, without touching a
 * word of it — the office reviews FAQs on a cycle (see REVIEW_INTERVAL_DAYS).
 */
export async function markFaqReviewed(id: string, reviewedById: string) {
  await db
    .update(faqs)
    .set({ lastReviewedAt: new Date(), reviewedById })
    .where(eq(faqs.id, id));
}

export async function deleteFaq(id: string) {
  // FAQ_SOURCES cascades.
  await db.delete(faqs).where(eq(faqs.id, id));
}
