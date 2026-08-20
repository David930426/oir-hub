"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ExternalLink, Paperclip, Tag, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnumBadge } from "@/components/shared/enum-badge";
import { useLocale } from "@/components/site/locale-provider";
import type { Localized } from "@/lib/i18n";
import { postTypeMeta } from "@/lib/mock/labels";
import type { PostTypeValue } from "@/lib/validator/post.validator";

/** One published post as the news list shows it. */
export type SitePost = {
  id: string;
  slug: string;
  type: PostTypeValue;
  categoryId: string;
  categoryName: Localized | null;
  title: Localized;
  body: Localized;
  seoDescription: string | null;
  externalUrl: string | null;
  authorName: string | null;
  publishedAt: string | null;
  attachmentCount: number;
  tags: { id: string; name: Localized }[];
};

const typeTabs: (PostTypeValue | "all")[] = [
  "all",
  "notice",
  "news",
  "guide",
  "page",
];

export function NewsView({
  all,
  postCategories,
  tags,
}: {
  all: SitePost[];
  postCategories: { id: string; name: Localized }[];
  tags: { id: string; name: Localized }[];
}) {
  const { t } = useLocale();

  const [type, setType] = useState<string>("all");
  const [categoryId, setCategoryId] = useState("all");
  const [tagId, setTagId] = useState("all");

  const filtered = useMemo(
    () =>
      all.filter((p) => {
        if (type !== "all" && p.type !== type) return false;
        if (categoryId !== "all" && p.categoryId !== categoryId) return false;
        if (tagId !== "all" && !p.tags.some((tg) => tg.id === tagId)) return false;
        return true;
      }),
    [all, type, categoryId, tagId]
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={type} onValueChange={setType}>
          <TabsList>
            {typeTabs.map((tt) => (
              <TabsTrigger key={tt} value={tt}>
                {tt === "all" ? "All" : postTypeMeta[tt].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex gap-3">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {postCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {t(c.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={tagId} onValueChange={setTagId}>
            <SelectTrigger className="w-full sm:w-40">
              <Tag className="size-4 text-muted-foreground" />
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tags</SelectItem>
              {tags.map((tg) => (
                <SelectItem key={tg.id} value={tg.id}>
                  {t(tg.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((post) => {
          const category = post.categoryName;
          const attachmentCount = post.attachmentCount;
          const postTagList = post.tags;

          return (
            <Link key={post.id} href={`/news/${post.slug}`} className="group block">
              <Card className="py-5 transition-all group-hover:border-primary/40 group-hover:shadow-sm">
                <CardContent className="px-5">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <EnumBadge value={post.type} meta={postTypeMeta} />
                    {category && (
                      <Badge variant="secondary" className="font-normal">
                        {t(category)}
                      </Badge>
                    )}
                    {post.externalUrl && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ExternalLink className="size-3.5" />
                        External link
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-semibold leading-snug group-hover:text-primary">
                    {t(post.title)}
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {post.seoDescription || t(post.body).split("\n")[0]}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <UserRound className="size-3.5" />
                      {post.authorName ?? "OIR"}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3.5" />
                      {post.publishedAt}
                    </span>
                    {attachmentCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Paperclip className="size-3.5" />
                        {attachmentCount} attachment
                        {attachmentCount > 1 ? "s" : ""}
                      </span>
                    )}
                    {postTagList.length > 0 && (
                      <span className="flex flex-wrap items-center gap-1.5">
                        {postTagList.map((tg) => (
                          <span key={tg.id} className="text-primary">
                            #{t(tg.name)}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          <p className="font-medium">Nothing published under these filters.</p>
        </div>
      )}

      <Pagination className="mt-10">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
