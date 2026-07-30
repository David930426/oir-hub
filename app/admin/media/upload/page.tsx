import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import {
  findMediaFileById,
  listReplaceableMediaFiles,
} from "@/lib/repositories/media.repository";
import { UploadForm } from "./upload-form";

/**
 * Uploading is a page rather than a dialog, and the same page files a new
 * version: the row menu links here with `?replaces=<id>` pre-selected.
 */
export default async function AdminUploadMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ replaces?: string }>;
}) {
  await requireWriter();

  const { replaces } = await searchParams;
  const [candidates, replacing] = await Promise.all([
    listReplaceableMediaFiles(),
    replaces ? findMediaFileById(replaces) : null,
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin/media">
            <ArrowLeft className="size-4" />
            Media library
          </Link>
        </Button>
        <PageHeader
          title={replacing ? "Upload new version" : "Upload a file"}
          description={
            replacing
              ? `The new file becomes v${replacing.version + 1} of ${replacing.filename}, and the current version is archived.`
              : "PDF, Word or Excel. Tag it with the academic year so the assistant can filter by freshness."
          }
        />
      </div>

      <UploadForm
        candidates={candidates}
        replacesId={replacing?.id ?? ""}
        academicYear={replacing?.academicYear ?? ""}
      />
    </div>
  );
}
