"use server";

import { revalidatePath } from "next/cache";
import { requireWriter } from "@/dal";
import { GENERIC_ACTION_ERROR } from "@/constant";
import { logger } from "@/lib/logger";
import {
  countMediaUsage,
  createMediaFile,
  deleteMediaFile,
  findMediaFileById,
  replaceMediaFile,
  setMediaArchived,
  type NewMediaFile,
} from "@/lib/repositories/media.repository";
import {
  assertBucketReady,
  objectNameFor,
  putObject,
  removeObject,
} from "@/lib/storage";
import { type ActionResult } from "@/lib/utils";
import {
  mediaFileSchema,
  uploadMediaSchema,
} from "@/lib/validator/media.validator";

/**
 * The media library.
 *
 * Uploads are `requireWriter()`: editors publish content and attachments are
 * part of that. The bytes go to MinIO first and the row second, so a failed
 * insert cleans up after itself rather than leaving the library pointing at
 * nothing.
 */

const MEDIA_PATH = "/admin/media";

export async function uploadMediaAction(formData: FormData): Promise<ActionResult> {
  const action = "uploadMediaAction";
  const session = await requireWriter();

  const file = mediaFileSchema.safeParse(formData.get("file"));
  if (!file.success) {
    return {
      success: false,
      message: file.error.issues[0]?.message ?? "That file cannot be uploaded.",
    };
  }

  const fields = uploadMediaSchema.safeParse({
    academicYear: String(formData.get("academicYear") ?? ""),
    replacesId: String(formData.get("replacesId") ?? ""),
  });
  if (!fields.success) {
    return {
      success: false,
      message: fields.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const { academicYear, replacesId } = fields.data;
  const upload = file.data;
  let objectName: string | null = null;

  try {
    const previous = replacesId ? await findMediaFileById(replacesId) : null;
    if (replacesId && !previous) {
      return { success: false, message: "The file you are replacing no longer exists." };
    }

    await assertBucketReady();

    objectName = objectNameFor(upload.name);
    const body = Buffer.from(await upload.arrayBuffer());
    await putObject(objectName, body, upload.type);

    const row: NewMediaFile = {
      filename: upload.name,
      storagePath: objectName,
      mimeType: upload.type,
      sizeBytes: body.byteLength,
      academicYear: academicYear || null,
      uploadedById: session.user.id,
    };

    if (previous) {
      await replaceMediaFile({
        previousId: previous.id,
        previousVersion: previous.version,
        file: row,
      });
    } else {
      await createMediaFile(row);
    }

    revalidatePath(MEDIA_PATH);
    return {
      success: true,
      message: previous
        ? `${upload.name} uploaded as v${previous.version + 1}; the previous version was archived.`
        : `${upload.name} uploaded.`,
    };
  } catch (error) {
    // The object is written before the row, so a failure past that point would
    // otherwise leave bytes nothing refers to.
    if (objectName) {
      await removeObject(objectName).catch((cleanupError) =>
        logger.error({ action, cleanupError, objectName }, "failed to clean up object"),
      );
    }

    logger.error({ action, error }, "failed to upload media file");
    return {
      success: false,
      message: error instanceof Error && error.message.includes("bucket")
        ? error.message
        : GENERIC_ACTION_ERROR,
    };
  }
}

export async function setMediaArchivedAction(
  id: string,
  archived: boolean,
): Promise<ActionResult> {
  const action = "setMediaArchivedAction";
  await requireWriter();

  try {
    const file = await findMediaFileById(id);
    if (!file) return { success: false, message: "That file no longer exists." };

    await setMediaArchived(id, archived);
  } catch (error) {
    logger.error({ action, error, id }, "failed to change archive state");
    return { success: false, message: GENERIC_ACTION_ERROR };
  }

  revalidatePath(MEDIA_PATH);
  return {
    success: true,
    message: archived
      ? "Archived — it stays available to anything already linking to it, but is hidden from pickers."
      : "Restored to the live library.",
  };
}

export async function deleteMediaAction(id: string): Promise<ActionResult> {
  const action = "deleteMediaAction";
  await requireWriter();

  try {
    const file = await findMediaFileById(id);
    if (!file) return { success: false, message: "That file no longer exists." };

    const usage = await countMediaUsage(id);
    if (usage > 0) {
      return {
        success: false,
        message: `Still used by ${usage} post${usage === 1 ? "" : "s"} or bulletin${
          usage === 1 ? "" : "s"
        }. Detach it there first, or archive it instead.`,
      };
    }

    // Row first: an orphaned object is recoverable, a row pointing at bytes
    // that no longer exist is a broken download for everyone.
    await deleteMediaFile(id);
    await removeObject(file.storagePath).catch((cleanupError) =>
      logger.error(
        { action, cleanupError, storagePath: file.storagePath },
        "row deleted but object removal failed",
      ),
    );
  } catch (error) {
    logger.error({ action, error, id }, "failed to delete media file");
    return { success: false, message: GENERIC_ACTION_ERROR };
  }

  revalidatePath(MEDIA_PATH);
  return { success: true, message: "File deleted." };
}
