"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EnumBadge } from "@/components/shared/enum-badge";
import { AttachmentList } from "@/components/site/attachment-list";
import { useLocale } from "@/components/site/locale-provider";
import {
  attachmentsForPost,
  getCategory,
  getPost,
  getUser,
  postTypeMeta,
  publishedPosts,
  tagsForPost,
} from "@/lib/mock";

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { t, tp } = useLocale();

  const post = getPost(slug);
  // Drafts and archived posts are never served on the public site.
  if (!post || post.status !== "published") notFound();

  const category = getCategory(post.categoryId);
  const author = getUser(post.authorId);
  const files = attachmentsForPost(post.id);
  const postTagList = tagsForPost(post.id);
  const related = publishedPosts()
    .filter((p) => p.id !== post.id && p.categoryId === post.categoryId)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/news">
          <ArrowLeft className="size-4" />
          All news
        </Link>
      </Button>

      <article>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <EnumBadge value={post.type} meta={postTypeMeta} />
          {category && (
            <Badge variant="secondary" className="font-normal">
              {t(category.name)}
            </Badge>
          )}
        </div>

        <h1 className="text-3xl font-bold leading-tight tracking-tight">
          {t(post.title)}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <UserRound className="size-4" />
            {author?.name ?? "Office of International Relations"}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="size-4" />
            Published {post.publishedAt}
          </span>
          {post.updatedAt !== post.publishedAt && (
            <span>Updated {post.updatedAt}</span>
          )}
        </div>

        {post.externalUrl && (
          <Card className="mt-6 border-primary/20 bg-primary/[0.03]">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-1">
              <p className="text-sm text-muted-foreground">
                This announcement links to an external organisation.
              </p>
              <Button asChild size="sm" variant="outline">
                <a
                  href={post.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open source page
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 space-y-5 leading-relaxed">
          {tp(post.body).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {files.length > 0 && (
          <div className="mt-8">
            <AttachmentList files={files} />
          </div>
        )}

        {postTagList.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Tags</span>
            {postTagList.map((tg) => (
              <Badge key={tg.id} variant="outline" className="font-normal">
                #{t(tg.name)}
              </Badge>
            ))}
          </div>
        )}
      </article>

      {related.length > 0 && (
        <>
          <Separator className="my-10" />
          <section>
            <h2 className="mb-4 text-lg font-bold tracking-tight">
              More in {category ? t(category.name) : "this category"}
            </h2>
            <div className="space-y-3">
              {related.map((r) => (
                <Link key={r.id} href={`/news/${r.slug}`} className="group block">
                  <Card className="py-4 transition-all group-hover:border-primary/40 group-hover:shadow-sm">
                    <CardContent className="px-4">
                      <p className="text-sm font-medium group-hover:text-primary">
                        {t(r.title)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {r.publishedAt}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
