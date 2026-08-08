import z from "zod";
import { KB_SOURCE_TABLES } from "@/constant";
import { idSchema } from "./common.validator";

/**
 * Knowledge base — the ERD's KB_DOCUMENTS and KB_CHUNKS.
 *
 * Nothing here describes a form: no one writes a KB document by hand. These
 * shapes are what the console's re-index buttons send, and what the sync job
 * uses to name a source row.
 */

export const kbSourceTableSchema = z.enum(KB_SOURCE_TABLES);

/** Points at the content row a document was flattened from. */
export const kbSourceRefSchema = z.object({
  sourceTable: kbSourceTableSchema,
  sourceId: idSchema,
});

export const reindexDocumentSchema = z.object({
  id: idSchema,
  /** Re-embeds a document that is already indexed, rather than skipping it. */
  force: z.boolean().default(false),
});

export type KbSourceRef = z.infer<typeof kbSourceRefSchema>;
export type ReindexDocumentInput = z.infer<typeof reindexDocumentSchema>;
export type KbSourceTableValue = z.infer<typeof kbSourceTableSchema>;
