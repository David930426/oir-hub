import { notFound } from "next/navigation";
import {
  findPostBySlug,
  listPublishedPosts,
} from "@/lib/repositories/post.repository";
import { formatDay } from "@/lib/utils";
import { PostView, type SiteRelatedPost } from "./post-view";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await findPostBySlug(slug);

  // Drafts and archived posts are never served on the public site.
  if (!post || post.status !== "published") notFound();

  const related: SiteRelatedPost[] = (await listPublishedPosts())
    .filter((entry) => entry.id !== post.id && entry.categoryId === post.categoryId)
    .slice(0, 3)
    .map((entry) => ({
      id: entry.id,
      slug: entry.slug,
      title: { zh: entry.titleZh, en: entry.titleEn },
      publishedAt: entry.publishedAt ? formatDay(entry.publishedAt) : null,
    }));

  return (
    <PostView
      post={{
        id: post.id,
        slug: post.slug,
        type: post.type,
        title: { zh: post.titleZh, en: post.titleEn },
        body: { zh: post.bodyZh, en: post.bodyEn },
        externalUrl: post.externalUrl,
        publishedAt: post.publishedAt ? formatDay(post.publishedAt) : null,
        updatedAt: formatDay(post.updatedAt),
        authorName: post.author?.name ?? null,
      }}
      category={
        post.category
          ? { zh: post.category.nameZh, en: post.category.nameEn }
          : null
      }
      // Same byline the news list shows, so the two screens agree.
      author={post.author ? { name: post.author.name } : null}
      files={post.attachments.map((attachment) => ({
        ...attachment.mediaFile,
        createdAt: formatDay(attachment.mediaFile.createdAt),
      }))}
      postTagList={post.postTags.map((link) => ({
        id: link.tag.id,
        name: { zh: link.tag.nameZh, en: link.tag.nameEn },
      }))}
      related={related}
    />
  );
}
