import "server-only";

import { randomUUID } from "node:crypto";
import { Client, S3Error } from "minio";
import { MEDIA_DOWNLOAD_TTL_SECONDS } from "@/constant";

/**
 * Object storage for the media library — MinIO, which speaks S3, so the same
 * code works against a real S3 bucket by changing MINIO_* in .env.
 *
 * Only lib/actions/media.action.ts and the download route talk to this file:
 * everything else deals in `storagePath`, the object name stored on the row.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set — copy .env.example to .env and fill it in.`);
  }
  return value;
}

const endpoint = new URL(process.env.MINIO_ENDPOINT ?? "http://localhost:9000");

export const bucket = process.env.MINIO_BUCKET ?? "oir";

export const storage = new Client({
  endPoint: endpoint.hostname,
  port: Number(endpoint.port) || (endpoint.protocol === "https:" ? 443 : 80),
  useSSL: endpoint.protocol === "https:",
  accessKey: required("MINIO_ACCESS_KEY"),
  secretKey: required("MINIO_SECRET_KEY"),
});

/**
 * Object name for a new upload: dated folders keep the bucket browsable, and
 * the uuid means two people uploading `guidelines.pdf` never collide.
 *
 * The original filename is kept on the row, not in the key, so it survives
 * characters that object stores dislike.
 */
export function objectNameFor(filename: string): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const safe = filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-80);

  return `${yyyy}/${mm}/${randomUUID()}-${safe || "file"}`;
}

/** Fails with a sentence an admin can act on when the bucket is missing. */
export async function assertBucketReady(): Promise<void> {
  if (!(await storage.bucketExists(bucket))) {
    throw new Error(
      `The "${bucket}" bucket does not exist. Create it in the MinIO console, or change MINIO_BUCKET.`,
    );
  }
}

export async function putObject(
  objectName: string,
  body: Buffer,
  mimeType: string,
): Promise<void> {
  await storage.putObject(bucket, objectName, body, body.byteLength, {
    "Content-Type": mimeType,
  });
}

/**
 * Removes an object, treating "already gone" as success — a row whose file has
 * been deleted by hand should still be deletable from the console.
 */
export async function removeObject(objectName: string): Promise<void> {
  try {
    await storage.removeObject(bucket, objectName);
  } catch (error) {
    if (error instanceof S3Error && error.code === "NoSuchKey") return;
    throw error;
  }
}

/**
 * Short-lived download link. The browser fetches the bytes from MinIO directly
 * rather than through the app, and `attachment` makes it save under the name
 * the uploader used instead of the object key.
 */
export async function presignedDownloadUrl(
  objectName: string,
  filename: string,
): Promise<string> {
  // Two forms on purpose: a plain quoted name every browser understands, and
  // the RFC 5987 form that survives spaces and 中文. Percent-encoding the quoted
  // one instead would save the file as "115-2%20Guidelines.pdf".
  const ascii = filename.replace(/["\\]/g, "").replace(/[^\x20-\x7e]/g, "_");
  const disposition = `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;

  return storage.presignedGetObject(bucket, objectName, MEDIA_DOWNLOAD_TTL_SECONDS, {
    "response-content-disposition": disposition,
  });
}
