"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, Paperclip, Plus, Save, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { BilingualField } from "@/components/admin/bilingual-field";
import { PageHeader } from "@/components/admin/page-header";
import { EnumBadge } from "@/components/shared/enum-badge";
import {
  attachmentsForPost,
  categoriesOfKind,
  formatBytes,
  postStatusMeta,
  postTypeMeta,
  posts,
  tags,
  tagsForPost,
  users,
} from "@/lib/mock";
import type { Post } from "@/lib/mock";

/** Blank row used when the editor is opened at /admin/posts/new. */
const emptyPost: Post = {
  id: "new",
  slug: "",
  title: { zh: "", en: "" },
  body: { zh: "", en: "" },
  categoryId: "cat-01",
  type: "news",
  status: "draft",
  publishedAt: null,
  seoTitle: "",
  seoDescription: "",
  externalUrl: null,
  authorId: "usr-01",
  createdAt: "",
  updatedAt: "",
};

export default function AdminPostEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const isNew = id === "new";

  const post = isNew ? emptyPost : posts.find((p) => p.id === id);
  if (!post) notFound();

  const postCategories = categoriesOfKind("post");
  const files = isNew ? [] : attachmentsForPost(post.id);
  const selectedTags = isNew ? [] : tagsForPost(post.id);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin/posts">
            <ArrowLeft className="size-4" />
            All posts
          </Link>
        </Button>
        <PageHeader
          title={isNew ? "New post" : "Edit post"}
          description={
            isNew
              ? "Chinese content is required. English is optional and falls back to Chinese on the site."
              : `Last updated ${post.updatedAt} · created ${post.createdAt}`
          }
        >
          {!isNew && post.status === "published" && (
            <Button asChild variant="outline">
              <Link href={`/news/${post.slug}`}>
                <Eye className="size-4" />
                View on site
              </Link>
            </Button>
          )}
          <Button variant="outline">Save draft</Button>
          <Button>
            <Save className="size-4" />
            {post.status === "published" ? "Update" : "Publish"}
          </Button>
        </PageHeader>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        {/* Content */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content</CardTitle>
              <CardDescription>
                The body accepts Markdown. Separate paragraphs with a blank line.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <BilingualField
                id="title"
                label="Title"
                value={post.title}
                placeholderZh="例如：115學年度第2學期交換學生甄選開始受理"
              />

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-sm text-muted-foreground">
                    /news/
                  </span>
                  <Input
                    id="slug"
                    defaultValue={post.slug}
                    placeholder="115-2-exchange-application-open"
                    className="font-mono"
                  />
                </div>
              </div>

              <BilingualField
                id="body"
                label="Body"
                value={post.body}
                multiline
                rows={14}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Search engine listing</CardTitle>
              <CardDescription>
                Leave empty to fall back to the title and the first paragraph.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo-title">SEO title</Label>
                <Input id="seo-title" defaultValue={post.seoTitle} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo-description">SEO description</Label>
                <Textarea
                  id="seo-description"
                  rows={3}
                  defaultValue={post.seoDescription}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="external-url">External URL</Label>
                <Input
                  id="external-url"
                  defaultValue={post.externalUrl ?? ""}
                  placeholder="https://… (only when the source lives elsewhere)"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base">Attachments</CardTitle>
                  <CardDescription>
                    Files from the media library, in display order.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Paperclip className="size-4" />
                  Attach file
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {files.length === 0 ? (
                <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                  No files attached yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {files.map((file, i) => (
                    <li
                      key={file.id}
                      className="flex items-center justify-between gap-3 rounded-lg border p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium tabular-nums">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {file.filename}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(file.sizeBytes)}
                            {file.academicYear && ` · ${file.academicYear}`} · v
                            {file.version}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <Trash2 className="size-4" />
                        <span className="sr-only">Remove {file.filename}</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: classification & publishing */}
        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue={post.status}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.keys(postStatusMeta) as (keyof typeof postStatusMeta)[]
                    ).map((s) => (
                      <SelectItem key={s} value={s}>
                        {postStatusMeta[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="pt-1">
                  <EnumBadge value={post.status} meta={postStatusMeta} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="published-at">Publish date</Label>
                <Input
                  id="published-at"
                  type="date"
                  defaultValue={post.publishedAt ?? ""}
                />
              </div>

              <div className="space-y-2">
                <Label>Author</Label>
                <Select defaultValue={post.authorId}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter((u) => u.active && u.role !== "viewer")
                      .map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select defaultValue={post.type}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(postTypeMeta) as (keyof typeof postTypeMeta)[]).map(
                      (t) => (
                        <SelectItem key={t} value={t}>
                          {postTypeMeta[t].label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select defaultValue={post.categoryId}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {postCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name.en ?? c.name.zh}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTags.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="gap-1 pr-1">
                      #{tag.slug}
                      <button className="rounded-sm hover:bg-background/60">
                        <X className="size-3" />
                        <span className="sr-only">Remove {tag.slug}</span>
                      </button>
                    </Badge>
                  ))}
                </div>
                <Select>
                  <SelectTrigger className="w-full">
                    <Plus className="size-4 text-muted-foreground" />
                    <SelectValue placeholder="Add a tag" />
                  </SelectTrigger>
                  <SelectContent>
                    {tags
                      .filter((t) => !selectedTags.some((s) => s.id === t.id))
                      .map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name.en ?? t.name.zh}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
