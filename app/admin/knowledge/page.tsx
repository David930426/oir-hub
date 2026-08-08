import { PageHeader } from "@/components/admin/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { hasRole, writerRoles } from "@/dal";
import { listKbDocuments } from "@/lib/repositories/knowledge.repository";
import { formatMinute } from "@/lib/utils";
import { IndexControls } from "./index-controls";
import type { KbDocumentRow } from "./kb-columns";
import { KbTable } from "./kb-table";

export default async function AdminKnowledgePage() {
  const [canWrite, records] = await Promise.all([
    hasRole(writerRoles),
    listKbDocuments(),
  ]);

  const documents: KbDocumentRow[] = records.map((record) => ({
    id: record.id,
    sourceTable: record.sourceTable,
    sourceId: record.sourceId,
    title: record.title,
    academicYear: record.academicYear,
    version: record.version,
    status: record.status,
    errorMessage: record.errorMessage,
    chunkCount: record.chunkCount,
    indexedAt: record.indexedAt ? formatMinute(record.indexedAt) : null,
  }));

  // What the "Re-index" button will actually work through.
  const pendingCount = documents.filter(
    (document) => document.status !== "indexed",
  ).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Knowledge index"
        description="Documents derived from FAQs, posts, bulletins, testimonials, and files, then split into chunks the assistant retrieves. Nothing here is authored directly — fix the source row instead."
      >
        {canWrite && <IndexControls pendingCount={pendingCount} />}
      </PageHeader>

      <Alert>
        <Info className="size-4" />
        <AlertDescription>
          Sync rebuilds the document list from published content and costs
          nothing. Re-indexing embeds those documents through Ollama and writes
          them to Qdrant, so it needs both services running.
        </AlertDescription>
      </Alert>

      <KbTable documents={documents} canWrite={canWrite} />
    </div>
  );
}
