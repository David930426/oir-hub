"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Languages,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnumBadge } from "@/components/shared/enum-badge";
import { PageHeader } from "@/components/admin/page-header";
import {
  attachmentsForPost,
  categoriesOfKind,
  getCategory,
  getUser,
  postStatusMeta,
  postTypeMeta,
  posts,
  tagsForPost,
} from "@/lib/mock";
import { isUntranslated } from "@/lib/i18n";

const statusTabs = ["all", "published", "draft", "archived"] as const;

export default function AdminPostsPage() {
  const [status, setStatus] = useState<string>("all");
  const [type, setType] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [query, setQuery] = useState("");

  const postCategories = useMemo(() => categoriesOfKind("post"), []);

  const filtered = useMemo(
    () =>
      posts.filter((p) => {
        if (status !== "all" && p.status !== status) return false;
        if (type !== "all" && p.type !== type) return false;
        if (categoryId !== "all" && p.categoryId !== categoryId) return false;
        if (
          query &&
          !`${p.title.zh} ${p.title.en ?? ""} ${p.slug}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
          return false;
        return true;
      }),
    [status, type, categoryId, query]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Posts"
        description="News, notices, guides, and static pages. Chinese is required; English falls back to Chinese when left empty."
      >
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus className="size-4" />
            New post
          </Link>
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={status} onValueChange={setStatus}>
          <TabsList>
            {statusTabs.map((s) => (
              <TabsTrigger key={s} value={s}>
                {s === "all" ? "All" : postStatusMeta[s].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search title or slug…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 sm:w-52"
            />
          </div>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {(Object.keys(postTypeMeta) as (keyof typeof postTypeMeta)[]).map(
                (t) => (
                  <SelectItem key={t} value={t}>
                    {postTypeMeta[t].label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {postCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name.en ?? c.name.zh}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((post) => {
                const category = getCategory(post.categoryId);
                const author = getUser(post.authorId);
                const files = attachmentsForPost(post.id);
                const postTagList = tagsForPost(post.id);

                return (
                  <TableRow key={post.id}>
                    <TableCell className="max-w-80 pl-6">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="block truncate font-medium hover:text-primary"
                      >
                        {post.title.zh}
                      </Link>
                      <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate font-mono">/{post.slug}</span>
                        {isUntranslated(post.title) && (
                          <span className="flex items-center gap-1 text-amber-700">
                            <Languages className="size-3" />
                            EN missing
                          </span>
                        )}
                        {files.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Paperclip className="size-3" />
                            {files.length}
                          </span>
                        )}
                        {postTagList.length > 0 && (
                          <span className="truncate">
                            {postTagList.map((t) => `#${t.slug}`).join(" ")}
                          </span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <EnumBadge value={post.type} meta={postTypeMeta} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {category ? category.name.en ?? category.name.zh : "—"}
                    </TableCell>
                    <TableCell>
                      <EnumBadge value={post.status} meta={postStatusMeta} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {author?.name.split(" ")[0] ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {post.publishedAt ?? "—"}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/posts/${post.id}`}>
                              <Pencil className="size-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          {post.status === "published" && (
                            <DropdownMenuItem asChild>
                              <Link href={`/news/${post.slug}`}>
                                <Eye className="size-4" />
                                View on site
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive">
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No posts match your filters.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
