"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, MapPin, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AttachmentList } from "@/components/site/attachment-list";
import { useLocale } from "@/components/site/locale-provider";
import type { Localized } from "@/lib/i18n";
import type { MediaFile } from "@/lib/mock/types";

/** One published report, with everything it links to already resolved. */
export type SiteTestimonialDetail = {
  id: string;
  displayName: string;
  deptYear: string;
  country: string;
  termLabel: string;
  highlights: string[];
  body: Localized;
  createdAt: string;
};

export type SiteRelatedTestimonial = {
  id: string;
  displayName: string;
  termLabel: string;
  highlights: string[];
};

export function TestimonialDetailView({
  story,
  school,
  fullText,
  related,
}: {
  story: SiteTestimonialDetail;
  school: { id: string; name: Localized } | null;
  fullText: MediaFile | null;
  related: SiteRelatedTestimonial[];
}) {
  const { t, tp } = useLocale();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/testimonials">
          <ArrowLeft className="size-4" />
          All testimonials
        </Link>
      </Button>

      <article>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-normal">
            {story.country}
          </Badge>
          <Badge variant="outline" className="font-mono text-xs">
            {story.termLabel}
          </Badge>
        </div>

        <h1 className="text-3xl leading-tight tracking-tight">
          {school ? t(school.name) : "Exchange report"}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>{story.displayName}</span>
          <span>{story.deptYear}</span>
          {school && (
            <Link
              href={`/schools/${school.id}`}
              className="flex items-center gap-1 text-primary underline-offset-2 hover:underline"
            >
              <MapPin className="size-3.5" />
              School details
            </Link>
          )}
        </div>

        {/* Highlights — the three lines the student wanted read first */}
        <Card className="mt-6 border-primary/20 bg-primary/[0.03]">
          <CardContent className="space-y-2 py-1">
            {story.highlights.map((h) => (
              <p key={h} className="flex gap-2 text-sm leading-relaxed">
                <Quote className="mt-0.5 size-4 shrink-0 text-primary" />
                {h}
              </p>
            ))}
          </CardContent>
        </Card>

        <div className="mt-8 space-y-5 leading-relaxed">
          {tp(story.body).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        {fullText && (
          <div className="mt-8">
            <AttachmentList files={[fullText]} title="Full report" />
          </div>
        )}

        <p className="mt-8 text-xs text-muted-foreground">
          Published {story.createdAt} with the author&apos;s consent. Costs and
          requirements described here were accurate for {story.termLabel} and may
          have changed — always check the current bulletin.
        </p>
      </article>

      {related.length > 0 && (
        <>
          <Separator className="my-10" />
          <section>
            <h2 className="mb-4 text-lg tracking-tight">
              More from this school
            </h2>
            <div className="space-y-3">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/testimonials/${r.id}`}
                  className="group block"
                >
                  <Card className="py-4 transition-all group-hover:border-primary/40 group-hover:shadow-sm">
                    <CardContent className="flex items-center justify-between gap-3 px-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium group-hover:text-primary">
                          {r.displayName} · {r.termLabel}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {r.highlights[0]}
                        </p>
                      </div>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
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
