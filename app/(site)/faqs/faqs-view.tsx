"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bot,
  ExternalLink,
  FileText,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { FAQ_AUDIENCES } from "@/constant";
import type { Localized } from "@/lib/i18n";
import { faqAudienceMeta } from "@/lib/mock/labels";
import type { FaqAudienceValue } from "@/lib/validator/faq.validator";

/** One published answer, with everything the page shows already resolved. */
export type SiteFaq = {
  id: string;
  categoryId: string;
  categoryName: Localized | null;
  question: Localized;
  shortAnswer: Localized;
  longAnswer: Localized;
  audience: FaqAudienceValue;
  needsHumanConfirm: boolean;
  lastReviewedAt: string;
  sources: {
    id: string;
    label: string;
    sourceUrl: string | null;
    filename: string | null;
  }[];
};

export function FaqsView({
  faqs,
  categories,
}: {
  faqs: SiteFaq[];
  categories: { id: string; name: Localized }[];
}) {
  const { t, tp } = useLocale();
  const [categoryId, setCategoryId] = useState("all");
  const [audience, setAudience] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      faqs.filter((f) => {
        if (categoryId !== "all" && f.categoryId !== categoryId) return false;
        if (audience !== "all" && f.audience !== audience) return false;
        if (
          query &&
          !`${f.question.zh} ${f.question.en ?? ""} ${f.shortAnswer.zh} ${
            f.shortAnswer.en ?? ""
          }`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
          return false;
        return true;
      }),
    [faqs, categoryId, audience, query],
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Frequently asked questions
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Written and reviewed by OIR staff. Every answer lists the document it
          came from, so you can check the original yourself.
        </p>
      </div>

      <div className="mb-6 space-y-3">
        <Tabs value={categoryId} onValueChange={setCategoryId}>
          <TabsList className="h-auto! flex-wrap gap-1">
            <TabsTrigger value="all" className="flex-none py-1">
              All
            </TabsTrigger>
            {categories.map((c) => (
              <TabsTrigger key={c.id} value={c.id} className="flex-none py-1">
                {t(c.name)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative sm:flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search questions…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8"
            />
          </div>
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger className="w-full sm:w-44 sm:shrink-0">
              <Users className="size-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Everyone</SelectItem>
              {FAQ_AUDIENCES.map((a) => (
                <SelectItem key={a} value={a}>
                  {faqAudienceMeta[a].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {filtered.length} question{filtered.length === 1 ? "" : "s"}
      </p>

      <Card className="py-0">
        <CardContent className="px-6">
          <Accordion type="multiple">
            {filtered.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger>
                  <span className="min-w-0 space-y-1.5">
                    <span className="block text-base font-semibold leading-snug">
                      {t(faq.question)}
                    </span>
                    <span className="block text-sm font-normal text-muted-foreground">
                      {t(faq.shortAnswer)}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {faq.categoryName && (
                      <Badge variant="secondary" className="font-normal">
                        {t(faq.categoryName)}
                      </Badge>
                    )}
                    <EnumBadge value={faq.audience} meta={faqAudienceMeta} />
                    {faq.needsHumanConfirm && (
                      <Badge
                        variant="outline"
                        className="gap-1 border-amber-200 bg-amber-100 font-medium text-amber-800"
                      >
                        <ShieldCheck className="size-3" />
                        Confirm with staff
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-3 leading-relaxed">
                    {tp(faq.longAnswer).map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  {faq.sources.length > 0 && (
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Sources
                      </p>
                      <ul className="space-y-1.5">
                        {faq.sources.map((src) => (
                          <li key={src.id} className="flex items-center gap-2 text-xs">
                            {src.sourceUrl ? (
                              <a
                                href={src.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-primary underline-offset-2 hover:underline"
                              >
                                <ExternalLink className="size-3.5 shrink-0" />
                                {src.label}
                              </a>
                            ) : (
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <FileText className="size-3.5 shrink-0" />
                                {src.label}
                                {src.filename && (
                                  <span className="text-muted-foreground/70">
                                    ({src.filename})
                                  </span>
                                )}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Last reviewed {faq.lastReviewedAt}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {filtered.length === 0 && (
            <p className="py-16 text-center text-sm text-muted-foreground">
              No question matches your filters.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6 border-primary/20 bg-primary/3">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-2">
          <p className="text-sm text-muted-foreground">
            Not answered here? The assistant searches the same sources, plus
            every bulletin and testimonial.
          </p>
          <Button asChild size="sm">
            <Link href="/chat">
              <Bot className="size-4" />
              Ask the assistant
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
