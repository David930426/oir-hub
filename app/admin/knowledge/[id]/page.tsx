import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { EnumBadge } from "@/components/shared/enum-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireStaff } from "@/dal";
import { kbSourceTableMeta, kbStatusMeta } from "@/lib/mock/labels";
import {
  findKbDocumentById,
  listChunksForDocument,
} from "@/lib/repositories/knowledge.repository";
import { formatMinute, pluralize } from "@/lib/utils";

/**
 * One indexed document and the chunks the assistant actually retrieves.
 *
 * Read-only on purpose: the text here is derived from a content row, so the way
 * to change it is to edit that row and re-index. Seeing the chunks is what makes
 * a bad answer diagnosable — usually the split, not the model, is at fault.
 */
export default async function AdminKnowledgeDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();

  const { id } = await params;
  const [document, chunks] = await Promise.all([
    findKbDocumentById(id),
    listChunksForDocument(id),
  ]);

  if (!document) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin/knowledge">
            <ArrowLeft className="size-4" />
            Knowledge index
          </Link>
        </Button>
        <PageHeader
          title={document.title}
          description={`${pluralize(chunks.length, "chunk")} · version ${document.version} · ${
            document.indexedAt
              ? `indexed ${formatMinute(document.indexedAt)}`
              : "never indexed"
          }`}
        >
          <EnumBadge value={document.sourceTable} meta={kbSourceTableMeta} />
          <EnumBadge value={document.status} meta={kbStatusMeta} />
        </PageHeader>
      </div>

      {document.errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{document.errorMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Flattened text</CardTitle>
          <CardDescription>
            What the chunker was given. Edit the source row to change it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
            {document.content}
          </pre>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Chunks</h2>
        {chunks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Not chunked yet — re-index this document to build them.
          </p>
        ) : (
          chunks.map((chunk) => (
            <Card key={chunk.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-sm">Chunk {chunk.index + 1}</CardTitle>
                  <Badge variant="outline" className="font-normal tabular-nums">
                    ~{chunk.tokenCount} tokens
                  </Badge>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {chunk.embeddingModel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {chunk.content}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
