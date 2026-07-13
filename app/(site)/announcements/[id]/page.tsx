import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AttachmentList } from "@/components/site/attachment-list";
import { CategoryBadge } from "@/components/site/category-badge";
import { announcements } from "@/lib/mock-data";

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = announcements.find((a) => a.id === id) ?? announcements[0];
  if (!item) notFound();

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
              <Link href="/announcements">Announcements</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="max-w-52 truncate">{item.title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <CategoryBadge category={item.category} />

      <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight">
        {item.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <UserRound className="size-4" />
          {item.author}
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarDays className="size-4" />
          Published {item.publishedAt}
        </span>
      </div>

      <Separator className="my-6" />

      <article className="space-y-4 text-[15px] leading-relaxed text-foreground/90">
        {item.content.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>

      {item.attachments.length > 0 && (
        <>
          <Separator className="my-8" />
          <AttachmentList attachments={item.attachments} />
        </>
      )}

      <Separator className="my-8" />

      <Button asChild variant="ghost">
        <Link href="/announcements">
          <ArrowLeft className="size-4" />
          Back to announcements
        </Link>
      </Button>
    </div>
  );
}
