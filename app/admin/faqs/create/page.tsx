import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import { listReplaceableMediaFiles } from "@/lib/repositories/media.repository";
import { listCategories } from "@/lib/repositories/taxonomy.repository";
import { FaqForm } from "../faq-form";

export default async function AdminCreateFaqPage() {
  await requireWriter();

  const [categories, files] = await Promise.all([
    listCategories(),
    listReplaceableMediaFiles(),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin/faqs">
            <ArrowLeft className="size-4" />
            All FAQs
          </Link>
        </Button>
        <PageHeader
          title="New FAQ"
          description="The assistant answers from these, so write the source in as you go rather than afterwards."
        />
      </div>

      <FaqForm
        // FAQ categories only: a category's kind scopes it to one picker.
        categories={categories
          .filter((category) => category.kind === "faq")
          .map((category) => ({ value: category.id, label: category.nameZh }))}
        files={files.map((file) => ({ value: file.id, label: file.filename }))}
      />
    </div>
  );
}
