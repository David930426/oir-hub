import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/admin/badges";
import { adminDocuments, documentChunks } from "@/lib/mock-data";

export default async function AdminDocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = adminDocuments.find((d) => d.id === id) ?? adminDocuments[0];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin/documents">
            <ArrowLeft className="size-4" />
            Back to documents
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{doc.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {doc.filename} · {doc.size} · uploaded by {doc.uploadedBy} on {doc.uploadedAt}
            </p>
          </div>
          <Button asChild>
            <Link href={`/admin/documents/${doc.id}/edit`}>
              <Pencil className="size-4" />
              Edit chunks
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Processing summary</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="mt-1"><StatusBadge status={doc.status} /></dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Chunks</dt>
              <dd className="mt-1 font-medium">{documentChunks.length}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Category</dt>
              <dd className="mt-1 font-medium">{doc.category}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">School</dt>
              <dd className="mt-1 font-medium">{doc.school}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Chunks</h2>
          <p className="text-xs text-muted-foreground">
            Inspect how the document was split — bad splits cause bad answers.
          </p>
        </div>
        <div className="space-y-3">
          {documentChunks.map((chunk) => (
            <Card key={chunk.index} className="py-4">
              <CardContent className="px-4">
                <div className="mb-2 flex items-center gap-2">
                  <Badge variant="secondary" className="tabular-nums">
                    #{chunk.index}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {chunk.tokens} tokens
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">
                  {chunk.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
