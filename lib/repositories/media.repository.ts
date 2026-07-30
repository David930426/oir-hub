import { asc, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema/auth.schema";
import { mediaFiles, postAttachments } from "@/db/schema/cms.schema";
import { bulletins } from "@/db/schema/mobility.schema";

/**
 * The media library — the ERD's MEDIA_FILES.
 *
 * A row carries the object name in `storagePath`; the bytes live in MinIO (see
 * lib/storage.ts). "In use" counts what points at a file, because that decides
 * whether it may be deleted.
 */

export type MediaFileRecord = {
  id: string;
  filename: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  academicYear: string | null;
  version: number;
  archived: boolean;
  replacesId: string | null;
  uploadedBy: string | null;
  createdAt: Date;
  /** Post attachments plus bulletins pointing at this file. */
  usage: number;
};

/**
 * Every file, newest first.
 *
 * The two usage counts need distinct aliases: Drizzle renders a subquery column
 * inside a `sql` template by its alias alone, so reusing "total" would produce
 * an ambiguous reference.
 */
export async function listMediaFiles(): Promise<MediaFileRecord[]> {
  const attachmentUsage = db
    .select({
      mediaFileId: postAttachments.mediaFileId,
      total: count().as("attachment_total"),
    })
    .from(postAttachments)
    .groupBy(postAttachments.mediaFileId)
    .as("attachment_usage");

  const bulletinUsage = db
    .select({ pdfFileId: bulletins.pdfFileId, total: count().as("bulletin_total") })
    .from(bulletins)
    .groupBy(bulletins.pdfFileId)
    .as("bulletin_usage");

  return db
    .select({
      id: mediaFiles.id,
      filename: mediaFiles.filename,
      storagePath: mediaFiles.storagePath,
      mimeType: mediaFiles.mimeType,
      sizeBytes: mediaFiles.sizeBytes,
      academicYear: mediaFiles.academicYear,
      version: mediaFiles.version,
      archived: mediaFiles.archived,
      replacesId: mediaFiles.replacesId,
      uploadedBy: user.name,
      createdAt: mediaFiles.createdAt,
      usage:
        sql<number>`coalesce(${attachmentUsage.total}, 0) + coalesce(${bulletinUsage.total}, 0)`
          .mapWith(Number)
          .as("usage"),
    })
    .from(mediaFiles)
    .leftJoin(user, eq(user.id, mediaFiles.uploadedById))
    .leftJoin(attachmentUsage, eq(attachmentUsage.mediaFileId, mediaFiles.id))
    .leftJoin(bulletinUsage, eq(bulletinUsage.pdfFileId, mediaFiles.id))
    .orderBy(desc(mediaFiles.createdAt));
}

/** Live files, for the "replaces" picker on the upload form. */
export async function listReplaceableMediaFiles() {
  return db
    .select({
      id: mediaFiles.id,
      filename: mediaFiles.filename,
      version: mediaFiles.version,
    })
    .from(mediaFiles)
    .where(eq(mediaFiles.archived, false))
    .orderBy(asc(mediaFiles.filename));
}

export async function findMediaFileById(id: string) {
  return db.query.mediaFiles.findFirst({ where: eq(mediaFiles.id, id) });
}

/** Post attachments plus bulletins pointing at this file. */
export async function countMediaUsage(id: string): Promise<number> {
  const [attachments] = await db
    .select({ total: count() })
    .from(postAttachments)
    .where(eq(postAttachments.mediaFileId, id));

  const [bulletinRefs] = await db
    .select({ total: count() })
    .from(bulletins)
    .where(eq(bulletins.pdfFileId, id));

  return (attachments?.total ?? 0) + (bulletinRefs?.total ?? 0);
}

export type NewMediaFile = {
  filename: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  academicYear: string | null;
  uploadedById: string;
};

export async function createMediaFile(input: NewMediaFile): Promise<string> {
  const [row] = await db
    .insert(mediaFiles)
    .values(input)
    .returning({ id: mediaFiles.id });

  return row.id;
}

/**
 * Files a new version in place of an existing one: the new row carries
 * `version + 1` and points back through `replacesId`, and the old row is
 * archived — in one transaction, so the library can never show two live
 * versions of the same document.
 */
export async function replaceMediaFile(input: {
  previousId: string;
  previousVersion: number;
  file: NewMediaFile;
}): Promise<string> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(mediaFiles)
      .values({
        ...input.file,
        version: input.previousVersion + 1,
        replacesId: input.previousId,
      })
      .returning({ id: mediaFiles.id });

    await tx
      .update(mediaFiles)
      .set({ archived: true })
      .where(eq(mediaFiles.id, input.previousId));

    return row.id;
  });
}

export async function setMediaArchived(id: string, archived: boolean) {
  await db.update(mediaFiles).set({ archived }).where(eq(mediaFiles.id, id));
}

export async function deleteMediaFile(id: string) {
  await db.delete(mediaFiles).where(eq(mediaFiles.id, id));
}
