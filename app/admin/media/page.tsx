import Link from "next/link";
import { Upload } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { hasRole, writerRoles } from "@/dal";
import { listMediaFiles } from "@/lib/repositories/media.repository";
import { formatMinute } from "@/lib/utils";
import type { MediaRow } from "./media-columns";
import { MediaTable } from "./media-table";

/**
 * The media library. Rows come from the database; the bytes live in MinIO and
 * are reached through /api/media/[id], which signs a short-lived URL.
 */
export default async function AdminMediaPage() {
  const [canWrite, records] = await Promise.all([
    hasRole(writerRoles),
    listMediaFiles(),
  ]);

  const files: MediaRow[] = records.map((record) => ({
    ...record,
    createdAt: formatMinute(record.createdAt),
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Media library"
        description="Every uploaded file. Re-uploading a file bumps its version and archives the previous one, so an old bulletin PDF can never be served by mistake."
      >
        {canWrite && (
          <Button asChild>
            <Link href="/admin/media/upload">
              <Upload className="size-4" />
              Upload file
            </Link>
          </Button>
        )}
      </PageHeader>

      <MediaTable files={files} canWrite={canWrite} />
    </div>
  );
}
