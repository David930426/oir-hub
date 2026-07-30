import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import { CategoryForm } from "../../category-form";

export default async function AdminCreateCategoryPage() {
  // /admin is gated for staff; changing the taxonomy is a writer's job.
  await requireWriter();

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
          title="New category"
          description="Pick the kind carefully — it can only be changed while nothing uses the category."
        />
      </div>

      <CategoryForm />
    </div>
  );
}
