import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import { listReplaceableMediaFiles } from "@/lib/repositories/media.repository";
import { listCategories, listTags } from "@/lib/repositories/taxonomy.repository";
import { PostForm } from "../post-form";

export default async function AdminCreatePostPage() {
  await requireWriter();

  const [categories, tags, files] = await Promise.all([
    listCategories(),
    listTags(),
    listReplaceableMediaFiles(),
  ]);

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
          title="New post"
          description="Saved as a draft by default — nothing is public until the status says published."
        />
      </div>

      <PostForm
        // Only post categories: a category's kind scopes it, so the FAQ ones
        // must not appear here.
        categories={categories
          .filter((category) => category.kind === "post")
          .map((category) => ({ value: category.id, label: category.nameZh }))}
        tags={tags.map((tag) => ({ value: tag.id, label: `#${tag.slug}` }))}
        files={files.map((file) => ({ value: file.id, label: file.filename }))}
      />
    </div>
  );
}
