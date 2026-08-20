import { PageBanner } from "@/components/site/page-banner";
import { listPublishedPostsForSite } from "@/lib/repositories/post.repository";
import { listCategories, listTags } from "@/lib/repositories/taxonomy.repository";
import { formatDay } from "@/lib/utils";
import { NewsView, type SitePost } from "./news-view";

export default async function NewsPage() {
  const [records, categories, tags] = await Promise.all([
    listPublishedPostsForSite(),
    listCategories(),
    listTags(),
  ]);

  const all: SitePost[] = records.map((record) => ({
    id: record.id,
    slug: record.slug,
    type: record.type,
    categoryId: record.categoryId,
    categoryName: record.category
      ? { zh: record.category.nameZh, en: record.category.nameEn }
      : null,
    title: { zh: record.titleZh, en: record.titleEn },
    body: { zh: record.bodyZh, en: record.bodyEn },
    seoDescription: record.seoDescription,
    externalUrl: record.externalUrl,
    authorName: record.author?.name ?? null,
    publishedAt: record.publishedAt ? formatDay(record.publishedAt) : null,
    attachmentCount: record.attachments.length,
    tags: record.postTags.map((link) => ({
      id: link.tag.id,
      name: { zh: link.tag.nameZh, en: link.tag.nameEn },
    })),
  }));

  return (
    <>
      <PageBanner eyebrow="From the office" title="News & notices">
        Everything the office publishes — deadline notices, scholarship results,
        partnership news, and how-to guides.
      </PageBanner>
      <NewsView
        all={all}
        postCategories={categories
          .filter((category) => category.kind === "post")
          .map((category) => ({
            id: category.id,
            name: { zh: category.nameZh, en: category.nameEn },
          }))}
        tags={tags.map((tag) => ({
          id: tag.id,
          name: { zh: tag.nameZh, en: tag.nameEn },
        }))}
      />
    </>
  );
}
