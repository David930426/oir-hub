import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema/cms.schema";
import { faqs, kbChunks, kbDocuments } from "@/db/schema/knowledge.schema";
import { testimonials } from "@/db/schema/mobility.schema";
import type { KbSourceTableValue } from "@/lib/validator/knowledge.validator";

/**
 * The knowledge base — the ERD's KB_DOCUMENTS and KB_CHUNKS.
 *
 * Nothing here is authored: a document is a content row flattened into plain
 * text, and a chunk is a slice of one, embedded and mirrored in Qdrant under
 * the same id. To correct an answer the assistant gives, edit the FAQ or post
 * behind it and re-index — never the document.
 */

export type KbStatusValue = "pending" | "indexed" | "stale" | "failed";

export type KbDocumentRecord = {
  id: string;
  sourceTable: KbSourceTableValue;
  sourceId: string;
  title: string;
  language: string;
  academicYear: string | null;
  version: number;
  status: KbStatusValue;
  errorMessage: string | null;
  indexedAt: Date | null;
  chunkCount: number;
};

export async function listKbDocuments(): Promise<KbDocumentRecord[]> {
  const chunkUsage = db
    .select({
      kbDocumentId: kbChunks.kbDocumentId,
      total: count().as("chunk_total"),
    })
    .from(kbChunks)
    .groupBy(kbChunks.kbDocumentId)
    .as("chunk_usage");

  return db
    .select({
      id: kbDocuments.id,
      sourceTable: kbDocuments.sourceTable,
      sourceId: kbDocuments.sourceId,
      title: kbDocuments.title,
      language: kbDocuments.language,
      academicYear: kbDocuments.academicYear,
      version: kbDocuments.version,
      status: kbDocuments.status,
      errorMessage: kbDocuments.errorMessage,
      indexedAt: kbDocuments.indexedAt,
      chunkCount: sql<number>`coalesce(${chunkUsage.total}, 0)`.mapWith(Number),
    })
    .from(kbDocuments)
    .leftJoin(chunkUsage, eq(chunkUsage.kbDocumentId, kbDocuments.id))
    .orderBy(desc(kbDocuments.indexedAt), asc(kbDocuments.title));
}

export async function findKbDocumentById(id: string) {
  return db.query.kbDocuments.findFirst({ where: eq(kbDocuments.id, id) });
}

/** Documents waiting to be embedded — what "Re-index everything" works through. */
export async function listKbDocumentsByStatus(statuses: KbStatusValue[]) {
  if (statuses.length === 0) return [];
  return db.query.kbDocuments.findMany({
    where: inArray(kbDocuments.status, statuses),
    orderBy: [asc(kbDocuments.title)],
  });
}

/** Every document's polymorphic pointer, for pruning ones whose source is gone. */
export async function listKbDocumentRefs() {
  return db
    .select({
      id: kbDocuments.id,
      sourceTable: kbDocuments.sourceTable,
      sourceId: kbDocuments.sourceId,
    })
    .from(kbDocuments);
}

export type KbDocumentWrite = {
  sourceTable: KbSourceTableValue;
  sourceId: string;
  title: string;
  content: string;
  language: string;
  academicYear: string | null;
};

/**
 * Files the flattened text for one source row.
 *
 * Returns whether anything actually changed, so the sync job only queues an
 * embedding run for documents whose text moved — re-embedding an unchanged FAQ
 * costs a model call and buys nothing.
 */
export async function upsertKbDocument(
  input: KbDocumentWrite,
): Promise<{ id: string; changed: boolean }> {
  const existing = await db.query.kbDocuments.findFirst({
    where: and(
      eq(kbDocuments.sourceTable, input.sourceTable),
      eq(kbDocuments.sourceId, input.sourceId),
    ),
  });

  if (!existing) {
    const [row] = await db
      .insert(kbDocuments)
      .values({ ...input, status: "pending" })
      .returning({ id: kbDocuments.id });

    return { id: row.id, changed: true };
  }

  const changed =
    existing.content !== input.content ||
    existing.title !== input.title ||
    existing.academicYear !== input.academicYear;

  if (changed) {
    await db
      .update(kbDocuments)
      .set({
        title: input.title,
        content: input.content,
        language: input.language,
        academicYear: input.academicYear,
        version: existing.version + 1,
        status: "stale",
        errorMessage: null,
      })
      .where(eq(kbDocuments.id, existing.id));
  }

  return { id: existing.id, changed };
}

/**
 * Flags the document behind a content row as out of date.
 *
 * Called from the content actions after an edit: the chunks in Qdrant still
 * hold yesterday's wording, and the console needs to show that before someone
 * trusts an answer built from it.
 */
export async function markKbDocumentStale(
  sourceTable: KbSourceTableValue,
  sourceId: string,
) {
  await db
    .update(kbDocuments)
    .set({ status: "stale" })
    .where(
      and(
        eq(kbDocuments.sourceTable, sourceTable),
        eq(kbDocuments.sourceId, sourceId),
      ),
    );
}

export async function setKbDocumentStatus(
  id: string,
  status: KbStatusValue,
  errorMessage: string | null = null,
) {
  await db
    .update(kbDocuments)
    .set({ status, errorMessage })
    .where(eq(kbDocuments.id, id));
}

export type KbChunkWrite = {
  index: number;
  content: string;
  tokenCount: number;
  embeddingModel: string;
};

/**
 * Replaces a document's chunks and marks it indexed, returning the new ids.
 *
 * The ids are what the caller writes to Qdrant as point ids, which is why they
 * come back in `index` order: the vectors were produced in that order and
 * pairing them up wrongly would make every citation point at the wrong text.
 *
 * CHAT_CITATIONS references chunks ON DELETE SET NULL, so re-indexing costs the
 * old citations their text but keeps their scores — the numbers this project is
 * measured on survive.
 */
export async function replaceKbChunks(
  kbDocumentId: string,
  chunks: KbChunkWrite[],
): Promise<{ id: string; index: number }[]> {
  return db.transaction(async (tx) => {
    await tx.delete(kbChunks).where(eq(kbChunks.kbDocumentId, kbDocumentId));

    const inserted =
      chunks.length === 0
        ? []
        : await tx
            .insert(kbChunks)
            .values(chunks.map((chunk) => ({ ...chunk, kbDocumentId })))
            .returning({ id: kbChunks.id, index: kbChunks.index });

    await tx
      .update(kbDocuments)
      .set({ status: "indexed", errorMessage: null, indexedAt: new Date() })
      .where(eq(kbDocuments.id, kbDocumentId));

    return inserted.sort((a, b) => a.index - b.index);
  });
}

export async function deleteKbDocument(id: string) {
  // KB_CHUNKS cascades; the Qdrant points are removed by the caller.
  await db.delete(kbDocuments).where(eq(kbDocuments.id, id));
}

/**
 * Resolves search hits back to their text and the document they came from, so
 * an answer can quote a passage and name its source.
 */
export async function findChunksByIds(ids: string[]) {
  if (ids.length === 0) return [];

  return db
    .select({
      id: kbChunks.id,
      content: kbChunks.content,
      index: kbChunks.index,
      kbDocumentId: kbChunks.kbDocumentId,
      title: kbDocuments.title,
      sourceTable: kbDocuments.sourceTable,
      sourceId: kbDocuments.sourceId,
      academicYear: kbDocuments.academicYear,
    })
    .from(kbChunks)
    .innerJoin(kbDocuments, eq(kbDocuments.id, kbChunks.kbDocumentId))
    .where(inArray(kbChunks.id, ids));
}

/**
 * Every content row that belongs in the index, flattened to plain text.
 *
 * Only published material is included: a draft post is not something the
 * assistant may quote at a student. The text is deliberately verbose — the
 * question "when is the deadline" has to match a chunk that says which call and
 * which term the date belongs to, so labels are written into the content rather
 * than left in columns the embedding never sees.
 */
export type KbSourceDocument = KbDocumentWrite;

export async function listIndexableSources(): Promise<KbSourceDocument[]> {
  const [faqRows, postRows, bulletinRows, testimonialRows] = await Promise.all([
    db.query.faqs.findMany({ where: eq(faqs.published, true) }),
    db.query.posts.findMany({ where: eq(posts.status, "published") }),
    db.query.bulletins.findMany({ with: { program: true } }),
    db.query.testimonials.findMany({
      where: eq(testimonials.status, "published"),
      with: { partnerSchool: true },
    }),
  ]);

  const documents: KbSourceDocument[] = [];

  for (const faq of faqRows) {
    documents.push({
      sourceTable: "faq",
      sourceId: faq.id,
      title: faq.questionZh,
      content: [
        faq.questionZh,
        faq.questionEn,
        faq.shortAnswerZh,
        faq.shortAnswerEn,
        faq.longAnswerZh,
        faq.longAnswerEn,
      ]
        .filter(Boolean)
        .join("\n\n"),
      language: "zh-TW",
      academicYear: null,
    });
  }

  for (const post of postRows) {
    documents.push({
      sourceTable: "post",
      sourceId: post.id,
      title: post.titleZh,
      content: [post.titleZh, post.titleEn, post.bodyZh, post.bodyEn]
        .filter(Boolean)
        .join("\n\n"),
      language: "zh-TW",
      academicYear: null,
    });
  }

  for (const bulletin of bulletinRows) {
    const program = bulletin.program?.nameZh ?? "";
    documents.push({
      sourceTable: "bulletin",
      sourceId: bulletin.id,
      title: bulletin.titleZh,
      content: [
        bulletin.titleZh,
        bulletin.titleEn,
        program,
        `學年度：${bulletin.academicYear}-${bulletin.term}`,
        `地區：${bulletin.region}`,
        `公告日期：${bulletin.announcedAt}`,
        `申請截止日期：${bulletin.deadlineAt}`,
        `狀態：${bulletin.status}`,
      ]
        .filter(Boolean)
        .join("\n"),
      language: "zh-TW",
      academicYear: `${bulletin.academicYear}-${bulletin.term}`,
    });
  }

  for (const testimonial of testimonialRows) {
    const school = testimonial.partnerSchool?.nameZh ?? testimonial.country;
    documents.push({
      sourceTable: "testimonial",
      sourceId: testimonial.id,
      title: `${testimonial.displayName} — ${school}`,
      content: [
        `${testimonial.displayName}（${testimonial.deptYear}）${school}，${testimonial.termLabel}`,
        ...testimonial.highlights,
        testimonial.bodyZh,
        testimonial.bodyEn,
      ]
        .filter(Boolean)
        .join("\n\n"),
      language: "zh-TW",
      academicYear: null,
    });
  }

  return documents;
}
