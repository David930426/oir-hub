"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, Copy, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { EnumBadge } from "@/components/shared/enum-badge";
import {
  chunksForDocument,
  getKbDocument,
  kbSourceLabel,
  kbSourceTableMeta,
  kbStatusMeta,
} from "@/lib/mock";

export default function AdminKbDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const doc = getKbDocument(id);
  if (!doc) notFound();

  const chunks = chunksForDocument(doc.id);
  const totalTokens = chunks.reduce((sum, c) => sum + c.tokenCount, 0);

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
          title={doc.title}
          description={`Built from the ${kbSourceTableMeta[doc.sourceTable].label.toLowerCase()} row “${kbSourceLabel(doc.id)}”. Edit that row to change this document.`}
        >
          <Button variant="outline">
            <RefreshCcw className="size-4" />
            {doc.status === "failed" ? "Retry indexing" : "Re-index"}
          </Button>
        </PageHeader>
      </div>

      {doc.errorMessage && (
        <Alert className="border-red-200 bg-red-50 text-red-900">
          <AlertTriangle className="size-4" />
          <AlertTitle>Indexing failed</AlertTitle>
          <AlertDescription className="font-mono text-xs text-red-900/80">
            {doc.errorMessage}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-6">
            <div>
              <dt className="text-muted-foreground">Source</dt>
              <dd className="mt-1">
                <EnumBadge value={doc.sourceTable} meta={kbSourceTableMeta} />
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="mt-1">
                <EnumBadge value={doc.status} meta={kbStatusMeta} />
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Language</dt>
              <dd className="mt-1 font-medium">{doc.language}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Academic year</dt>
              <dd className="mt-1 font-medium">{doc.academicYear ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Version</dt>
              <dd className="mt-1 font-medium tabular-nums">v{doc.version}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Indexed at</dt>
              <dd className="mt-1 font-medium">{doc.indexedAt ?? "never"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Flattened content</CardTitle>
          <CardDescription>
            Plain text extracted from the source row, before chunking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {doc.content ? (
            <p className="rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">
              {doc.content}
            </p>
          ) : (
            <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
              Extraction produced no text — nothing was passed to the chunker.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Chunks</CardTitle>
              <CardDescription>
                {chunks.length} chunks · {totalTokens.toLocaleString("en-US")}{" "}
                tokens total. Each chunk ID doubles as its Qdrant point ID.
              </CardDescription>
            </div>
            {chunks[0] && (
              <Badge variant="outline" className="font-mono text-[10px]">
                {chunks[0].embeddingModel}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {chunks.length === 0 ? (
            <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
              This document has not been chunked yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {chunks.map((chunk) => (
                <li key={chunk.id} className="rounded-lg border p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded bg-muted text-xs font-medium tabular-nums">
                        {chunk.index}
                      </span>
                      <code className="text-xs text-muted-foreground">
                        {chunk.id}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {chunk.tokenCount} tokens
                      </span>
                      <Button variant="ghost" size="icon" className="size-7">
                        <Copy className="size-3.5" />
                        <span className="sr-only">Copy chunk {chunk.index}</span>
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{chunk.content}</p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
