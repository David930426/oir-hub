import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, School, UserRound } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AttachmentList } from "@/components/site/attachment-list";
import { knowledgeDocs } from "@/lib/mock-data";

export default async function KnowledgeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = knowledgeDocs.find((d) => d.id === id) ?? knowledgeDocs[0];
  if (!doc) notFound();

  const related = knowledgeDocs
    .filter((d) => d.id !== doc.id && d.category === doc.category)
    .slice(0, 2);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/knowledge">Knowledge Base</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-52 truncate">{doc.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{doc.category}</Badge>
        {doc.school !== "All Schools" && (
          <Badge variant="outline" className="gap-1">
            <School className="size-3" />
            {doc.school}
          </Badge>
        )}
      </div>

      <h1 className="text-3xl font-bold leading-tight tracking-tight">{doc.title}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <UserRound className="size-4" />
          {doc.author}
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-4" />
          Published {doc.publishedAt}
        </span>
        {doc.updatedAt !== doc.publishedAt && (
          <span className="text-xs">Last updated {doc.updatedAt}</span>
        )}
      </div>

      <Separator className="my-6" />

      <article className="space-y-4 text-[15px] leading-relaxed text-foreground/90">
        {doc.content.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>

      {doc.attachments.length > 0 && (
        <>
          <Separator className="my-8" />
          <AttachmentList attachments={doc.attachments} />
        </>
      )}

      {related.length > 0 && (
        <>
          <Separator className="my-8" />
          <h3 className="mb-3 text-sm font-semibold">Related in {doc.category}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {related.map((r) => (
              <Link key={r.id} href={`/knowledge/${r.id}`} className="group">
                <Card className="h-full py-4 transition-colors group-hover:border-primary/40">
                  <CardContent className="px-4">
                    <p className="text-sm font-medium leading-snug group-hover:text-primary">
                      {r.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {r.summary}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
