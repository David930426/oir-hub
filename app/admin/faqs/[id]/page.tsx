"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Link2,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Switch } from "@/components/ui/switch";
import { BilingualField } from "@/components/admin/bilingual-field";
import { PageHeader } from "@/components/admin/page-header";
import {
  categoriesOfKind,
  faqAudienceMeta,
  faqs,
  getMediaFile,
  getUser,
  sourcesForFaq,
  users,
} from "@/lib/mock";
import type { Faq } from "@/lib/mock";

/** Blank row used when the editor is opened at /admin/faqs/new. */
const emptyFaq: Faq = {
  id: "new",
  categoryId: "cat-12",
  question: { zh: "", en: "" },
  shortAnswer: { zh: "", en: "" },
  longAnswer: { zh: "", en: "" },
  audience: "student",
  needsHumanConfirm: false,
  published: false,
  lastReviewedAt: "",
  reviewedById: "usr-01",
};

export default function AdminFaqEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const isNew = id === "new";

  const faq = isNew ? emptyFaq : faqs.find((f) => f.id === id);
  if (!faq) notFound();

  const faqCategories = categoriesOfKind("faq");
  const sources = isNew ? [] : sourcesForFaq(faq.id);
  const reviewer = getUser(faq.reviewedById);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin/faqs">
            <ArrowLeft className="size-4" />
            All FAQs
          </Link>
        </Button>
        <PageHeader
          title={isNew ? "New FAQ" : "Edit FAQ"}
          description={
            isNew
              ? "The short answer is what the site and the assistant quote first — keep it to one or two sentences."
              : `Last reviewed ${faq.lastReviewedAt} by ${reviewer?.name ?? "—"}`
          }
        >
          <Button variant="outline">
            <ShieldCheck className="size-4" />
            Mark reviewed
          </Button>
          <Button>
            <Save className="size-4" />
            Save
          </Button>
        </PageHeader>
      </div>

      {faq.needsHumanConfirm && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <ShieldCheck className="size-4" />
          <AlertDescription className="text-amber-900/80">
            Flagged as high-risk. The assistant will hand this question to a
            human instead of answering from the text below.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Question &amp; answers</CardTitle>
              <CardDescription>
                The long answer is shown when a reader expands the question and is
                what gets chunked for retrieval.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <BilingualField
                id="faq-question"
                label="Question"
                value={faq.question}
                multiline
                rows={2}
                placeholderZh="例如：交換學生的申請流程是什麼？"
              />
              <BilingualField
                id="faq-short"
                label="Short answer (1–2 sentences)"
                value={faq.shortAnswer}
                multiline
                rows={3}
              />
              <BilingualField
                id="faq-long"
                label="Long answer"
                value={faq.longAnswer}
                multiline
                rows={12}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Link2 className="size-4 text-primary" />
                    Sources
                  </CardTitle>
                  <CardDescription>
                    Where this answer comes from. Shown publicly so students can
                    verify it themselves.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="size-4" />
                  Add source
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sources.length === 0 ? (
                <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                  No source cited yet. Answers without a source are hard to keep
                  current.
                </p>
              ) : (
                <ul className="space-y-2">
                  {sources.map((source) => {
                    const file = getMediaFile(source.mediaFileId);
                    return (
                      <li
                        key={source.id}
                        className="flex items-center justify-between gap-3 rounded-lg border p-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                            {source.sourceUrl ? (
                              <ExternalLink className="size-4 text-muted-foreground" />
                            ) : (
                              <FileText className="size-4 text-muted-foreground" />
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {source.label}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {file
                                ? `${file.filename} · v${file.version}`
                                : source.sourceUrl}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="shrink-0">
                          <Trash2 className="size-4" />
                          <span className="sr-only">Remove {source.label}</span>
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select defaultValue={faq.categoryId}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {faqCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name.en ?? c.name.zh}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select defaultValue={faq.audience}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      Object.keys(faqAudienceMeta) as (keyof typeof faqAudienceMeta)[]
                    ).map((a) => (
                      <SelectItem key={a} value={a}>
                        {faqAudienceMeta[a].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Review &amp; safety</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Label htmlFor="faq-published" className="text-sm">
                    Published
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Visible on the public FAQ page.
                  </p>
                </div>
                <Switch id="faq-published" defaultChecked={faq.published} />
              </div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <Label htmlFor="faq-risk" className="text-sm">
                    Needs human confirm
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    The assistant escalates instead of answering.
                  </p>
                </div>
                <Switch id="faq-risk" defaultChecked={faq.needsHumanConfirm} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="faq-reviewed">Last reviewed</Label>
                <Input
                  id="faq-reviewed"
                  type="date"
                  defaultValue={faq.lastReviewedAt}
                />
              </div>

              <div className="space-y-2">
                <Label>Reviewed by</Label>
                <Select defaultValue={faq.reviewedById}>
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
        </aside>
      </div>
    </div>
  );
}
