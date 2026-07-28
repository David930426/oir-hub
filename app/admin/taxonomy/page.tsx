"use client";

import { useState } from "react";
import { GripVertical, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { BilingualField } from "@/components/admin/bilingual-field";
import { PageHeader } from "@/components/admin/page-header";
import { EnumBadge } from "@/components/shared/enum-badge";
import {
  categories,
  categoryKindMeta,
  faqs,
  postCountForCategory,
  postTags,
  tags,
} from "@/lib/mock";

export default function AdminTaxonomyPage() {
  const [kind, setKind] = useState<string>("all");

  const visibleCategories = categories
    .filter((c) => kind === "all" || c.kind === kind)
    .sort((a, b) =>
      a.kind === b.kind ? a.sortOrder - b.sortOrder : a.kind.localeCompare(b.kind)
    );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Categories & tags"
        description="Categories group content and are scoped by kind — a post category never appears in the FAQ picker. Tags are free-form and shared across posts."
      />

      {/* Categories */}
      <Card className="py-0">
        <CardHeader className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Categories</CardTitle>
              <CardDescription>
                Sort order controls how they appear in the site filters.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={kind} onValueChange={setKind}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="post">Post</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
                </TabsList>
              </Tabs>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="size-4" />
                    New category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>New category</DialogTitle>
                    <DialogDescription>
                      Pick the kind carefully — it cannot be changed once content
                      is assigned.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <BilingualField
                      id="new-category-name"
                      label="Name"
                      value={{ zh: "", en: "" }}
                      placeholderZh="例如：交換計畫"
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="category-slug">Slug</Label>
                        <Input
                          id="category-slug"
                          placeholder="exchange"
                          className="font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Kind</Label>
                        <Select defaultValue="post">
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="post">Post</SelectItem>
                            <SelectItem value="faq">FAQ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 pl-6" />
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead className="text-right">In use</TableHead>
                <TableHead className="text-right">Order</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleCategories.map((category) => {
                const usage =
                  category.kind === "post"
                    ? postCountForCategory(category.id)
                    : faqs.filter((f) => f.categoryId === category.id).length;

                return (
                  <TableRow key={category.id}>
                    <TableCell className="pl-6">
                      <GripVertical className="size-4 cursor-grab text-muted-foreground" />
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{category.name.zh}</p>
                      <p className="text-xs text-muted-foreground">
                        {category.name.en ?? "— no English name —"}
                      </p>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {category.slug}
                    </TableCell>
                    <TableCell>
                      <EnumBadge value={category.kind} meta={categoryKindMeta} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {usage}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {category.sortOrder}
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
                          <DropdownMenuItem>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={usage > 0}
                          >
                            <Trash2 className="size-4" />
                            {usage > 0 ? "In use — cannot delete" : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tags */}
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
            <Button size="sm" variant="outline">
              <Plus className="size-4" />
              New tag
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const usage = postTags.filter((pt) => pt.tagId === tag.id).length;
              return (
                <div
                  key={tag.id}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2"
                >
                  <div className="leading-tight">
                    <p className="text-sm font-medium">
                      #{tag.slug}
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground tabular-nums">
                        {usage}
                      </span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {tag.name.zh}
                      {tag.name.en && ` · ${tag.name.en}`}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7">
                        <MoreHorizontal className="size-3.5" />
                        <span className="sr-only">Actions for {tag.slug}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Pencil className="size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" disabled={usage > 0}>
                        <Trash2 className="size-4" />
                        {usage > 0 ? `Used by ${usage}` : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
