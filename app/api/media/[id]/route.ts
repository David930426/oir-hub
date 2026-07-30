import { NextResponse } from "next/server";
import { isStaff } from "@/dal";
import { logger } from "@/lib/logger";
import { findMediaFileById } from "@/lib/repositories/media.repository";
import { presignedDownloadUrl } from "@/lib/storage";

/**
 * Download link for a media file.
 *
 * The bucket is private, so this hands out a short-lived presigned URL and
 * redirects to it: the browser pulls the bytes straight from MinIO instead of
 * streaming them through the app. Staff only — the console's Download button
 * is the one caller, and files are not public until a page links to them.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isStaff())) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }

  const { id } = await params;
  const file = await findMediaFileById(id);

  if (!file) {
    return NextResponse.json({ error: "No such file." }, { status: 404 });
  }

  try {
    const url = await presignedDownloadUrl(file.storagePath, file.filename);
    return NextResponse.redirect(url);
  } catch (error) {
    logger.error({ action: "GET /api/media/[id]", error, id }, "failed to sign download");
    return NextResponse.json(
      { error: "The file store is unavailable." },
      { status: 502 },
    );
  }
}
