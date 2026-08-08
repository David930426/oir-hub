import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import { findFaqById } from "@/lib/repositories/faq.repository";
import { listReplaceableMediaFiles } from "@/lib/repositories/media.repository";
import { listCategories } from "@/lib/repositories/taxonomy.repository";
import { formatDay } from "@/lib/utils";
import { FaqForm } from "../../faq-form";

export default async function AdminEditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireWriter();

  const { id } = await params;
  const [faq, categories, files] = await Promise.all([
    findFaqById(id),
    listCategories(),
    listReplaceableMediaFiles(),
  ]);

  if (!faq) notFound();

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
          title={faq.questionZh}
          description={`Last reviewed ${formatDay(faq.lastReviewedAt)}. Saving records you as the reviewer and flags the assistant's copy stale.`}
        />
      </div>

      <FaqForm
        faq={{
          id: faq.id,
          categoryId: faq.categoryId,
          questionZh: faq.questionZh,
          questionEn: faq.questionEn ?? "",
          shortAnswerZh: faq.shortAnswerZh,
          shortAnswerEn: faq.shortAnswerEn ?? "",
          longAnswerZh: faq.longAnswerZh,
          longAnswerEn: faq.longAnswerEn ?? "",
          audience: faq.audience,
          needsHumanConfirm: faq.needsHumanConfirm,
          published: faq.published,
          sources: faq.sources.map((source) => ({
            label: source.label,
            mediaFileId: source.mediaFileId ?? "",
            sourceUrl: source.sourceUrl ?? "",
          })),
        }}
        categories={categories
          .filter((category) => category.kind === "faq")
          .map((category) => ({ value: category.id, label: category.nameZh }))}
        files={files.map((file) => ({ value: file.id, label: file.filename }))}
      />
    </div>
  );
}
