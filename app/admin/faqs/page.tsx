"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Languages,
  Link2,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { PageHeader } from "@/components/admin/page-header";
import { EnumBadge } from "@/components/shared/enum-badge";
import {
  categoriesOfKind,
  daysUntil,
  faqAudienceMeta,
  faqs,
  getCategory,
  getUser,
  sourcesForFaq,
} from "@/lib/mock";
import { isUntranslated } from "@/lib/i18n";
import { FAQ_PUBLISH_TABS, REVIEW_INTERVAL_DAYS } from "@/constant";

export default function AdminFaqsPage() {
  const [publishState, setPublishState] = useState<string>("all");
  const [categoryId, setCategoryId] = useState("all");
  const [audience, setAudience] = useState("all");
  const [query, setQuery] = useState("");

  const faqCategories = useMemo(() => categoriesOfKind("faq"), []);

  const filtered = useMemo(
    () =>
      faqs.filter((f) => {
        if (publishState === "published" && !f.published) return false;
        if (publishState === "unpublished" && f.published) return false;
        if (categoryId !== "all" && f.categoryId !== categoryId) return false;
        if (audience !== "all" && f.audience !== audience) return false;
        if (
          query &&
          !`${f.question.zh} ${f.question.en ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
          return false;
        return true;
      }),
    [publishState, categoryId, audience, query]
  );

  const stale = faqs.filter(
    (f) => -daysUntil(f.lastReviewedAt) > REVIEW_INTERVAL_DAYS
  ).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="FAQs"
        description={`Staff-written answers, shown on the site and indexed for the assistant. ${
          stale > 0
            ? `${stale} answer${stale === 1 ? "" : "s"} not reviewed in the last 6 months.`
            : "All answers reviewed within the last 6 months."
        }`}
      >
        <Button asChild>
          <Link href="/admin/faqs/new">
            <Plus className="size-4" />
            New FAQ
          </Link>
        </Button>
      </PageHeader>

      <div className="space-y-3">
        <Tabs value={publishState} onValueChange={setPublishState}>
          <TabsList>
            {FAQ_PUBLISH_TABS.map((p) => (
              <TabsTrigger key={p} value={p} className="capitalize">
                {p}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search questions…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 sm:w-52"
            />
          </div>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {faqCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name.en ?? c.name.zh}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Audience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All audiences</SelectItem>
              {(Object.keys(faqAudienceMeta) as (keyof typeof faqAudienceMeta)[]).map(
                (a) => (
                  <SelectItem key={a} value={a}>
                    {faqAudienceMeta[a].label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Question</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead className="text-right">Sources</TableHead>
                <TableHead>Risk</TableHead>
                <TableHead>Reviewed</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((faq) => {
                const category = getCategory(faq.categoryId);
                const reviewer = getUser(faq.reviewedById);
                const sources = sourcesForFaq(faq.id);
                const ageDays = -daysUntil(faq.lastReviewedAt);
                const isStale = ageDays > REVIEW_INTERVAL_DAYS;

                return (
                  <TableRow key={faq.id}>
                    <TableCell className="max-w-80 pl-6">
                      <Link
                        href={`/admin/faqs/${faq.id}`}
                        className="block truncate font-medium hover:text-primary"
                      >
                        {faq.question.zh}
                      </Link>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate">{faq.shortAnswer.zh}</span>
                        {isUntranslated(faq.question) && (
                          <span className="flex shrink-0 items-center gap-1 text-amber-700">
                            <Languages className="size-3" />
                            EN
                          </span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {category ? category.name.en ?? category.name.zh : "—"}
                    </TableCell>
                    <TableCell>
                      <EnumBadge value={faq.audience} meta={faqAudienceMeta} />
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="flex items-center justify-end gap-1 tabular-nums text-muted-foreground">
                        <Link2 className="size-3.5" />
                        {sources.length}
                      </span>
                    </TableCell>
                    <TableCell>
                      {faq.needsHumanConfirm ? (
                        <Badge
                          variant="outline"
                          className="gap-1 border-amber-200 bg-amber-100 font-medium text-amber-800"
                        >
                          <ShieldCheck className="size-3" />
                          Confirm
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span
                        className={
                          isStale ? "text-amber-700" : "text-muted-foreground"
                        }
                      >
                        {faq.lastReviewedAt}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {reviewer?.name.split(" ")[0] ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          faq.published
                            ? "border-emerald-200 bg-emerald-100 font-medium text-emerald-800"
                            : "border-slate-200 bg-slate-100 font-medium text-slate-700"
                        }
                      >
                        {faq.published ? "Live" : "Hidden"}
                      </Badge>
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
                            <Link href={`/admin/faqs/${faq.id}`}>
                              <Pencil className="size-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          {faq.published && (
                            <DropdownMenuItem asChild>
                              <Link href="/faqs">
                                <ExternalLink className="size-4" />
                                View on site
                              </Link>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <ShieldCheck className="size-4" />
                            Mark reviewed today
                          </DropdownMenuItem>
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
              No FAQs match your filters.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
