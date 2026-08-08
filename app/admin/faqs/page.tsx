import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { REVIEW_INTERVAL_DAYS } from "@/constant";
import { hasRole, writerRoles } from "@/dal";
import { listFaqs } from "@/lib/repositories/faq.repository";
import { formatDay, isOlderThan, pluralize } from "@/lib/utils";
import type { FaqRow } from "./faq-columns";
import { FaqsTable } from "./faqs-table";

export default async function AdminFaqsPage() {
  const [canWrite, records] = await Promise.all([hasRole(writerRoles), listFaqs()]);

  const faqs: FaqRow[] = records.map((record) => ({
    id: record.id,
    questionZh: record.questionZh,
    questionEn: record.questionEn,
    shortAnswerZh: record.shortAnswerZh,
    categoryName: record.categoryName,
    audience: record.audience,
    needsHumanConfirm: record.needsHumanConfirm,
    published: record.published,
    sourceCount: record.sourceCount,
    lastReviewedAt: formatDay(record.lastReviewedAt),
    // Decided on the server so the badge does not depend on the reader's clock.
    stale: isOlderThan(record.lastReviewedAt, REVIEW_INTERVAL_DAYS),
    reviewedBy: record.reviewedBy,
  }));

  const stale = faqs.filter((faq) => faq.stale).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="FAQs"
        description={`Staff-written answers, shown on the site and indexed for the assistant.${
          stale > 0
            ? ` ${pluralize(stale, "answer")} not reviewed in the last ${REVIEW_INTERVAL_DAYS} days.`
            : ""
        }`}
      >
        {canWrite && (
          <Button asChild>
            <Link href="/admin/faqs/create">
              <Plus className="size-4" />
              New FAQ
            </Link>
          </Button>
        )}
      </PageHeader>

      <FaqsTable faqs={faqs} canWrite={canWrite} />
    </div>
  );
}
