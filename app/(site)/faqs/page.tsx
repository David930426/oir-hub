import { listPublishedFaqs } from "@/lib/repositories/faq.repository";
import { listCategories } from "@/lib/repositories/taxonomy.repository";
import { formatDay } from "@/lib/utils";
import { FaqsView, type SiteFaq } from "./faqs-view";

export default async function FaqsPage() {
  const [records, categories] = await Promise.all([
    listPublishedFaqs(),
    listCategories(),
  ]);

  const faqs: SiteFaq[] = records.map((record) => ({
    id: record.id,
    categoryId: record.categoryId,
    categoryName: record.category
      ? { zh: record.category.nameZh, en: record.category.nameEn }
      : null,
    question: { zh: record.questionZh, en: record.questionEn },
    shortAnswer: { zh: record.shortAnswerZh, en: record.shortAnswerEn },
    longAnswer: { zh: record.longAnswerZh, en: record.longAnswerEn },
    audience: record.audience,
    needsHumanConfirm: record.needsHumanConfirm,
    // Formatted here, pinned to the office's timezone, so the date the browser
    // paints matches the markup it was sent.
    lastReviewedAt: formatDay(record.lastReviewedAt),
    sources: record.sources.map((source) => ({
      id: source.id,
      label: source.label,
      sourceUrl: source.sourceUrl,
      filename: source.mediaFile?.filename ?? null,
    })),
  }));

  return (
    <FaqsView
      faqs={faqs}
      // Only categories that actually carry a published answer, so the tab bar
      // does not offer a filter that returns nothing.
      categories={categories
        .filter(
          (category) =>
            category.kind === "faq" &&
            faqs.some((faq) => faq.categoryId === category.id),
        )
        .map((category) => ({
          id: category.id,
          name: { zh: category.nameZh, en: category.nameEn },
        }))}
    />
  );
}
