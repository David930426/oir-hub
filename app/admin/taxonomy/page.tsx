import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hasRole, writerRoles } from "@/dal";
import { listCategories, listTags } from "@/lib/repositories/taxonomy.repository";
import { CategoriesTable } from "./categories-table";
import { TagsPanel } from "./tags-panel";

/**
 * Categories and tags, both read from the database.
 *
 * Viewers may open this screen but not change it, so the create buttons and row
 * menus are hidden for them — `requireWriter()` in the actions is what actually
 * enforces that.
 */
export default async function AdminTaxonomyPage() {
  const [canWrite, categories, tags] = await Promise.all([
    hasRole(writerRoles),
    listCategories(),
    listTags(),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Categories & tags"
        description="Categories group content and are scoped by kind — a post category never appears in the FAQ picker. Tags are free-form and shared across posts."
      />

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Categories</h2>
            <p className="text-sm text-muted-foreground">
              Sort order controls how they appear in the site filters.
            </p>
          </div>
          {canWrite && (
            <Button asChild size="sm">
              <Link href="/admin/taxonomy/categories/create">
                <Plus className="size-4" />
                New category
              </Link>
            </Button>
          )}
        </div>

        <CategoriesTable categories={categories} canWrite={canWrite} />
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Tags</CardTitle>
              <CardDescription>
                Applied to posts through the post editor. Unused tags are safe to
                delete.
              </CardDescription>
            </div>
            {canWrite && (
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/taxonomy/tags/create">
                  <Plus className="size-4" />
                  New tag
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <TagsPanel tags={tags} canWrite={canWrite} />
        </CardContent>
      </Card>
    </div>
  );
}
