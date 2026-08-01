import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import { countTagUsage, findTagById } from "@/lib/repositories/taxonomy.repository";
import { TagForm } from "../../../tag-form";

export default async function AdminEditTagPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireWriter();

  const tag = await findTagById(id);
  if (!tag) notFound();

  const usage = await countTagUsage(tag.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin/taxonomy">
            <ArrowLeft className="size-4" />
            Categories &amp; tags
          </Link>
        </Button>
        <PageHeader
          title="Edit tag"
          description={`#${tag.slug} · applied to ${usage} post${usage === 1 ? "" : "s"}`}
        />
      </div>

      <TagForm
        tag={{
          id: tag.id,
          slug: tag.slug,
          nameZh: tag.nameZh,
          nameEn: tag.nameEn ?? "",
        }}
      />
    </div>
  );
}
