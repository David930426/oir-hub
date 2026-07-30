import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import {
  countCategoryUsage,
  findCategoryById,
} from "@/lib/repositories/taxonomy.repository";
import { CategoryForm } from "../../../category-form";

export default async function AdminEditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireWriter();

  const category = await findCategoryById(id);
  if (!category) notFound();

  // Usage decides whether `kind` may still be changed.
  const usage = await countCategoryUsage(category.id, category.kind);

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
          title="Edit category"
          description={`${category.slug} · ${usage} item${usage === 1 ? "" : "s"} use this category`}
        />
      </div>

      <CategoryForm
        category={{
          id: category.id,
          slug: category.slug,
          kind: category.kind,
          nameZh: category.nameZh,
          nameEn: category.nameEn ?? "",
          sortOrder: category.sortOrder,
        }}
        usage={usage}
      />
    </div>
  );
}
