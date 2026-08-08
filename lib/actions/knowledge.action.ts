"use server";

import { revalidatePath } from "next/cache";
import { requireWriter } from "@/dal";
import { GENERIC_ACTION_ERROR } from "@/constant";
import { embeddingModel, embedTexts } from "@/lib/external/ollama";
import {
  deleteChunksByDocument,
  ensureCollection,
  upsertChunks,
} from "@/lib/external/qdrant";
import { logger } from "@/lib/logger";
import {
  deleteKbDocument,
  findKbDocumentById,
  listIndexableSources,
  listKbDocumentRefs,
  listKbDocumentsByStatus,
  replaceKbChunks,
  setKbDocumentStatus,
  upsertKbDocument,
} from "@/lib/repositories/knowledge.repository";
import {
  chunkText,
  describeError,
  fail,
  ok,
  parseInput,
  pluralize,
  type ActionResult,
} from "@/lib/utils";
import {
  reindexDocumentSchema,
  type ReindexDocumentInput,
} from "@/lib/validator/knowledge.validator";

/**
 * The knowledge base — what the assistant is allowed to know.
 *
 * Two steps, deliberately separate. **Sync** reads the published content and
 * writes flattened documents; it touches no outside service and is cheap.
 * **Re-index** embeds a document and mirrors its chunks into Qdrant; it costs
 * model time and can fail because something outside the app is down. Splitting
 * them means a staff member can always see what *would* be indexed, even with
 * Ollama switched off.
 */

const KNOWLEDGE_PATH = "/admin/knowledge";
const MISSING = "That document no longer exists.";

// ---------- Sync ----------

/**
 * Rebuilds the document layer from published content.
 *
 * Documents whose text is unchanged are left alone, so re-running this is
 * cheap and does not queue pointless embedding work. Documents whose source row
 * has been deleted are removed here, along with their vectors: the polymorphic
 * pointer carries no foreign key, so nothing else would ever clean them up.
 */
export async function syncKnowledgeBaseAction(): Promise<ActionResult> {
  const action = "syncKnowledgeBaseAction";
  await requireWriter();

  try {
    const sources = await listIndexableSources();

    let changed = 0;
    for (const source of sources) {
      const result = await upsertKbDocument(source);
      if (result.changed) changed++;
    }

    // Anything left pointing at a row that no longer exists, or at content that
    // has since been unpublished.
    const live = new Set(sources.map((s) => `${s.sourceTable}:${s.sourceId}`));
    const refs = await listKbDocumentRefs();
    const orphans = refs.filter(
      (ref) => !live.has(`${ref.sourceTable}:${ref.sourceId}`),
    );

    for (const orphan of orphans) {
      // Vectors first: a failure here is logged rather than thrown, because a
      // stranded point is a smaller problem than a document that cannot be
      // removed from the console at all.
      await deleteChunksByDocument(orphan.id).catch((error) =>
        logger.error({ action, error, id: orphan.id }, "failed to remove vectors"),
      );
      await deleteKbDocument(orphan.id);
    }

    revalidatePath(KNOWLEDGE_PATH);
    return ok(
      `Synced ${pluralize(sources.length, "document")}: ${changed} new or changed, ${orphans.length} removed. Re-index to make the changes searchable.`,
    );
  } catch (error) {
    logger.error({ action, error }, "failed to sync knowledge base");
    return fail(describeError(error));
  }
}

// ---------- Re-index ----------

/**
 * Embeds one document and mirrors its chunks into Qdrant.
 *
 * The order matters. Vectors are written last, after the chunk rows exist and
 * their ids are known, because a Qdrant point is keyed by its chunk id — and
 * the old points are dropped first, since re-chunking produces new ids and the
 * previous ones would otherwise linger and be retrieved. If anything fails the
 * document is marked `failed` with the reason, so the console can show what
 * went wrong instead of leaving a row that silently never indexed.
 */
export async function reindexDocumentAction(
  input: ReindexDocumentInput,
): Promise<ActionResult> {
  const action = "reindexDocumentAction";
  await requireWriter();

  const parsed = parseInput(reindexDocumentSchema, input);
  if (!parsed.success) return parsed;

  const { id, force } = parsed.data;

  const document = await findKbDocumentById(id);
  if (!document) return fail(MISSING);
  if (document.status === "indexed" && !force) {
    return ok("Already indexed — nothing to do.");
  }

  try {
    const chunks = chunkText(document.content);
    if (chunks.length === 0) {
      await setKbDocumentStatus(id, "failed", "The source has no text to index.");
      revalidatePath(KNOWLEDGE_PATH);
      return fail("That document has no text to index — check the content behind it.");
    }

    await ensureCollection();

    const model = embeddingModel();
    const vectors = await embedTexts(chunks);

    const written = await replaceKbChunks(
      id,
      chunks.map((content, index) => ({
        index,
        content,
        // Characters stand in for tokens: the text is mostly Chinese, where the
        // two are close, and it saves shipping a tokenizer to record a figure
        // that is only ever read as a rough size.
        tokenCount: content.length,
        embeddingModel: model,
      })),
    );

    await deleteChunksByDocument(id);
    await upsertChunks(
      written.map((chunk) => ({
        id: chunk.id,
        vector: vectors[chunk.index],
        payload: {
          kbDocumentId: id,
          sourceTable: document.sourceTable,
          sourceId: document.sourceId,
          title: document.title,
          academicYear: document.academicYear,
          language: document.language,
          index: chunk.index,
        },
      })),
    );

    revalidatePath(KNOWLEDGE_PATH);
    return ok(`“${document.title}” indexed as ${pluralize(chunks.length, "chunk")}.`);
  } catch (error) {
    logger.error({ action, error, id }, "failed to re-index document");

    await setKbDocumentStatus(
      id,
      "failed",
      error instanceof Error ? error.message.slice(0, 500) : "Unknown error",
    ).catch((statusError) =>
      logger.error({ action, statusError, id }, "failed to record index failure"),
    );

    revalidatePath(KNOWLEDGE_PATH);
    return fail(describeError(error));
  }
}

/**
 * Works through everything not currently indexed.
 *
 * Sequential on purpose: this runs against one local Ollama, and firing every
 * document at it in parallel would queue them anyway — slower, and with a
 * useless error if the model runs out of memory halfway.
 */
export async function reindexPendingAction(): Promise<ActionResult> {
  const action = "reindexPendingAction";
  await requireWriter();

  try {
    const documents = await listKbDocumentsByStatus(["pending", "stale", "failed"]);
    if (documents.length === 0) {
      return ok("Everything is already indexed.");
    }

    let indexed = 0;
    let failed = 0;

    for (const document of documents) {
      const result = await reindexDocumentAction({ id: document.id, force: true });
      if (result.success) indexed++;
      else failed++;
    }

    revalidatePath(KNOWLEDGE_PATH);
    return failed === 0
      ? ok(`Indexed ${pluralize(indexed, "document")}.`)
      : ok(
          `Indexed ${pluralize(indexed, "document")}; ${failed} failed — open them to see why.`,
        );
  } catch (error) {
    logger.error({ action, error }, "failed to re-index pending documents");
    return fail(describeError(error));
  }
}

// ---------- Delete ----------

/**
 * Removes a document and its vectors.
 *
 * Only useful for a document whose source is gone; anything still published
 * comes back on the next sync, which is the intended behaviour rather than a
 * bug — the index is derived, not authored.
 */
export async function deleteKbDocumentAction(id: string): Promise<ActionResult> {
  const action = "deleteKbDocumentAction";
  await requireWriter();

  try {
    const document = await findKbDocumentById(id);
    if (!document) return fail(MISSING);

    await deleteChunksByDocument(id).catch((error) =>
      logger.error({ action, error, id }, "failed to remove vectors"),
    );
    await deleteKbDocument(id);

    revalidatePath(KNOWLEDGE_PATH);
    return ok(`“${document.title}” removed from the knowledge base.`);
  } catch (error) {
    logger.error({ action, error, id }, "failed to delete document");
    return fail(GENERIC_ACTION_ERROR);
  }
}
