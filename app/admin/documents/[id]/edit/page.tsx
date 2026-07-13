import Link from "next/link";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { adminDocuments, documentChunks } from "@/lib/mock-data";

export default async function AdminDocumentEditPage({
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
          <Link href={`/admin/documents/${doc.id}`}>
            <ArrowLeft className="size-4" />
            Back to inspection
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit chunks</h1>
            <p className="mt-1 text-sm text-muted-foreground">{doc.title}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Discard</Button>
            <Button>
              <Save className="size-4" />
              Save &amp; re-embed
            </Button>
          </div>
        </div>
      </div>

      <Alert>
        <AlertTitle>Editing chunks re-generates embeddings</AlertTitle>
        <AlertDescription>
          Saved changes trigger re-embedding for the modified chunks only. The
          chatbot uses the updated content within about a minute.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {documentChunks.map((chunk) => (
          <Card key={chunk.index} className="py-4">
            <CardContent className="space-y-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="tabular-nums">
                    #{chunk.index}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {chunk.tokens} tokens
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Delete chunk</span>
                </Button>
              </div>
              <Textarea
                defaultValue={chunk.text}
                rows={4}
                className="text-sm leading-relaxed"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" className="w-full border-dashed">
        <Plus className="size-4" />
        Add chunk
      </Button>
    </div>
  );
}
