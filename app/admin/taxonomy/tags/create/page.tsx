import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import { TagForm } from "../../tag-form";

export default async function AdminCreateTagPage() {
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
          title="New tag"
          description="Tags are free-form and shared across posts. They are applied from the post editor."
        />
      </div>

      <TagForm />
    </div>
  );
}
