import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import { listReplaceableMediaFiles } from "@/lib/repositories/media.repository";
import { findPostById } from "@/lib/repositories/post.repository";
import { listCategories, listTags } from "@/lib/repositories/taxonomy.repository";
import { PostForm } from "../../post-form";

export default async function AdminEditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireWriter();

  const { id } = await params;
  const [post, categories, tags, files] = await Promise.all([
    findPostById(id),
    listCategories(),
    listTags(),
    listReplaceableMediaFiles(),
  ]);

  if (!post) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin/posts">
            <ArrowLeft className="size-4" />
            All posts
          </Link>
        </Button>
        <PageHeader
          title={post.titleZh}
          description="Saving flags the assistant's copy of this post stale, so re-index once the wording is final."
        />
      </div>

      <PostForm
        post={{
          id: post.id,
          slug: post.slug,
          titleZh: post.titleZh,
          titleEn: post.titleEn ?? "",
          bodyZh: post.bodyZh,
          bodyEn: post.bodyEn ?? "",
          categoryId: post.categoryId,
          type: post.type,
          status: post.status,
          seoTitle: post.seoTitle ?? "",
          seoDescription: post.seoDescription ?? "",
          externalUrl: post.externalUrl ?? "",
          tagIds: post.postTags.map((link) => link.tagId),
          // Attachments come back in `sortOrder`, which is the order the form
          // resubmits them in.
          attachmentIds: post.attachments.map((entry) => entry.mediaFileId),
        }}
        categories={categories
          .filter((category) => category.kind === "post")
          .map((category) => ({ value: category.id, label: category.nameZh }))}
        tags={tags.map((tag) => ({ value: tag.id, label: `#${tag.slug}` }))}
        files={files.map((file) => ({ value: file.id, label: file.filename }))}
      />
    </div>
  );
}
