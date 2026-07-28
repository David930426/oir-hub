"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Coins,
  Mail,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EnumBadge } from "@/components/shared/enum-badge";
import { AttachmentList } from "@/components/site/attachment-list";
import { useLocale } from "@/components/site/locale-provider";
import {
  formatApplyMonths,
  formatTwd,
  fundingSourceMeta,
  fundingStatusMeta,
  getFunding,
  getMediaFile,
  getProgram,
} from "@/lib/mock";

export default function FundingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t, tp } = useLocale();

  const funding = getFunding(id);
  if (!funding) notFound();

  const program = funding.programId ? getProgram(funding.programId) : null;
  const form = getMediaFile(funding.formFileId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/funding">
          <ArrowLeft className="size-4" />
          All funding
        </Link>
      </Button>

      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <EnumBadge value={funding.source} meta={fundingSourceMeta} />
          <EnumBadge value={funding.status} meta={fundingStatusMeta} />
        </div>
        <h1 className="text-3xl font-bold leading-tight tracking-tight">
          {t(funding.name)}
        </h1>
        {program && (
          <p className="mt-2 text-muted-foreground">
            Applies to{" "}
            <Link
              href={`/programs/${program.slug}`}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {t(program.name)}
            </Link>
          </p>
        )}
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <Coins className="size-4" />
              Maximum award
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {formatTwd(funding.amountMax)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              Application months
            </CardDescription>
            <CardTitle className="text-2xl">
              {formatApplyMonths(funding.applyMonths)}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Exact dates are announced in the corresponding bulletin.
            </p>
          </CardHeader>
        </Card>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold tracking-tight">Who can apply</h2>
        <div className="space-y-3 leading-relaxed text-muted-foreground">
          {tp(funding.eligibility).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold tracking-tight">
          Documents you need
        </h2>
        <ul className="space-y-2">
          {funding.requiredDocs.map((doc) => (
            <li key={doc} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              {doc}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-xl font-bold tracking-tight">Notes</h2>
        <div className="space-y-3 leading-relaxed text-muted-foreground">
          {tp(funding.notes).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      {form && (
        <div className="mb-8">
          <AttachmentList files={[form]} title="Application form" />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Who to ask</CardTitle>
          <CardDescription>
            Contact the staff member handling this award directly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="flex items-center gap-2">
            <UserRound className="size-4 text-muted-foreground" />
            {funding.contactName}
          </p>
          <p className="flex items-center gap-2">
            <Mail className="size-4 text-muted-foreground" />
            <a
              href={`mailto:${funding.contactEmail}`}
              className="text-primary underline-offset-2 hover:underline"
            >
              {funding.contactEmail}
            </a>
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild size="sm" variant="outline">
              <Link href="/t-corner">Book a T-Corner slot</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/contact">Send a message</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
