import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { hasRole, writerRoles } from "@/dal";
import { listPosts } from "@/lib/repositories/post.repository";
import { listCategories } from "@/lib/repositories/taxonomy.repository";
import { formatDay } from "@/lib/utils";
import type { PostRow } from "./post-columns";
import { PostsTable } from "./posts-table";

export default async function AdminPostsPage() {
  const [canWrite, records, categories] = await Promise.all([
    hasRole(writerRoles),
    listPosts(),
    listCategories(),
  ]);

  const posts: PostRow[] = records.map((record) => ({
    id: record.id,
    slug: record.slug,
    titleZh: record.titleZh,
    titleEn: record.titleEn,
    type: record.type,
    status: record.status,
    categoryName: record.categoryName,
    authorName: record.authorName,
    publishedAt: record.publishedAt ? formatDay(record.publishedAt) : null,
    tagCount: record.tagCount,
    attachmentCount: record.attachmentCount,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Posts"
        description="News, notices, guides, and static pages. Chinese is required; English falls back to Chinese when left empty."
      >
        {canWrite && (
          <Button asChild>
            <Link href="/admin/posts/create">
              <Plus className="size-4" />
              New post
            </Link>
          </Button>
        )}
      </PageHeader>

      <PostsTable
        posts={posts}
        categories={categories
          .filter((category) => category.kind === "post")
          .map((category) => ({ id: category.id, name: category.nameZh }))}
        canWrite={canWrite}
      />
    </div>
  );
}
