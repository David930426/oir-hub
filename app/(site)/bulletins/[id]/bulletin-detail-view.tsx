"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BedDouble,
  CalendarDays,
  Globe2,
  Languages,
  School,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeadlineBadge, EnumBadge } from "@/components/shared/enum-badge";
import { AttachmentList } from "@/components/site/attachment-list";
import { useLocale } from "@/components/site/locale-provider";
import type { Localized } from "@/lib/i18n";
import { bulletinStatusMeta, formatTerm, programTypeMeta } from "@/lib/mock/labels";
import type { MediaFile, ProgramType } from "@/lib/mock/types";
import type { BulletinStatusValue } from "@/lib/validator/bulletin.validator";

export type SiteBulletinDetail = {
  id: string;
  academicYear: string;
  term: string;
  title: Localized;
  region: string;
  announcedAt: string;
  deadlineAt: string;
  status: BulletinStatusValue;
  program: { slug: string; name: Localized; type: ProgramType } | null;
  pdf: MediaFile | null;
};

export type SiteBulletinSchool = {
  id: string;
  name: Localized;
  country: string;
  quota: number;
  gpaMin: number;
  englishTaught: boolean;
  housingProvided: boolean;
};

export function BulletinDetailView({
  bulletin,
  schools,
  daysLeft,
}: {
  bulletin: SiteBulletinDetail;
  schools: SiteBulletinSchool[];
  /** Days until the deadline, worked out on the server against TIME_ZONE. */
  daysLeft: number;
}) {
  const { t } = useLocale();
  const { program, pdf } = bulletin;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/bulletins">
          <ArrowLeft className="size-4" />
          All bulletins
        </Link>
      </Button>

      <div className="mb-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded bg-accent px-2 py-0.5 font-mono text-xs text-accent-foreground">
            {formatTerm(bulletin.academicYear, bulletin.term)}
          </span>
          <EnumBadge value={bulletin.status} meta={bulletinStatusMeta} />
          <Badge variant="outline" className="gap-1 font-normal">
            <Globe2 className="size-3" />
            {bulletin.region}
          </Badge>
          {program && <EnumBadge value={program.type} meta={programTypeMeta} />}
        </div>
        <h1 className="text-3xl font-bold leading-tight tracking-tight">
          {t(bulletin.title)}
        </h1>
        {program && (
          <p className="mt-2 text-muted-foreground">
            Part of{" "}
            <Link
              href={`/programs/${program.slug}`}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              {t(program.name)}
            </Link>
          </p>
        )}
      </div>

      {bulletin.status === "open" && daysLeft >= 0 && daysLeft <= 14 && (
        <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-900">
          <AlertTriangle className="size-4" />
          <AlertTitle>Closing soon</AlertTitle>
          <AlertDescription className="text-amber-900/80">
            Applications close on {bulletin.deadlineAt}. Late submissions are not
            accepted.
          </AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Academic year</dt>
              <dd className="mt-1 font-medium">
                {formatTerm(bulletin.academicYear, bulletin.term)}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarDays className="size-3.5" />
                Announced
              </dt>
              <dd className="mt-1 font-medium">{bulletin.announcedAt}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Deadline</dt>
              <dd className="mt-1 font-medium">{bulletin.deadlineAt}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Time left</dt>
              <dd className="mt-1">
                <DeadlineBadge date={bulletin.deadlineAt} />
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {pdf ? (
        <div className="mb-10">
          <AttachmentList files={[pdf]} title="Official bulletin (簡章)" />
          <p className="mt-2 text-xs text-muted-foreground">
            Version {pdf.version} · uploaded {pdf.createdAt}. Earlier versions are
            archived and no longer valid.
          </p>
        </div>
      ) : (
        <div className="mb-10 rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
          The PDF for this call has not been uploaded yet. Details below are from
          the office announcement.
        </div>
      )}

      {schools.length > 0 && (
        <section className="mb-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <School className="size-5 text-primary" />
              Schools in this call
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/schools">
                Compare all
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <Card className="py-0">
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">School</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead className="text-right">Quota</TableHead>
                    <TableHead className="text-right">Min GPA</TableHead>
                    <TableHead className="pr-6">Perks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="pl-6">
                        <Link
                          href={`/schools/${s.id}`}
                          className="font-medium hover:text-primary"
                        >
                          {t(s.name)}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {s.country}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {s.quota}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {s.gpaMin.toFixed(1)}
                      </TableCell>
                      <TableCell className="pr-6">
                        <span className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                          {s.englishTaught && (
                            <span className="flex items-center gap-1">
                              <Languages className="size-3" />
                              English
                            </span>
                          )}
                          {s.housingProvided && (
                            <span className="flex items-center gap-1">
                              <BedDouble className="size-3" />
                              Housing
                            </span>
                          )}
                          {!s.englishTaught && !s.housingProvided && "—"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      )}

      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-2">
          <p className="text-sm text-muted-foreground">
            Questions about eligibility or documents for this call?
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/faqs">Read the FAQ</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/contact">Ask the office</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
