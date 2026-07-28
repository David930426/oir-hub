"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Coins,
  ExternalLink,
  FileStack,
  Languages,
  School,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DeadlineBadge,
  EnumBadge,
} from "@/components/shared/enum-badge";
import { useLocale } from "@/components/site/locale-provider";
import {
  bulletinStatusMeta,
  bulletinsForProgram,
  formatTerm,
  formatTwd,
  fundingSourceMeta,
  fundingsForProgram,
  getProgramBySlug,
  programTypeMeta,
  schoolsForProgram,
} from "@/lib/mock";

export default function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { t } = useLocale();

  const program = getProgramBySlug(slug);
  if (!program) notFound();

  const schools = schoolsForProgram(program.id).filter((s) => s.active);
  const calls = bulletinsForProgram(program.id);
  const funding = fundingsForProgram(program.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/programs">
          <ArrowLeft className="size-4" />
          All programs
        </Link>
      </Button>

      <div className="mb-8">
        <div className="mb-3">
          <EnumBadge value={program.type} meta={programTypeMeta} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{t(program.name)}</h1>
        <div className="mt-4 max-w-3xl space-y-3 leading-relaxed text-muted-foreground">
          {t(program.overview)
            .split(/\n{2,}/)
            .map((para, i) => (
              <p key={i}>{para}</p>
            ))}
        </div>
      </div>

      {/* Bulletins for this program */}
      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold tracking-tight">
          <FileStack className="size-5 text-primary" />
          Selection bulletins
        </h2>
        {calls.length === 0 ? (
          <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
            No bulletin has been issued for this program yet.
          </p>
        ) : (
          <div className="space-y-3">
            {calls.map((b) => (
              <Link key={b.id} href={`/bulletins/${b.id}`} className="group block">
                <Card className="py-4 transition-all group-hover:border-primary/40 group-hover:shadow-sm">
                  <CardContent className="px-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-accent px-2 py-0.5 font-mono text-xs text-accent-foreground">
                        {formatTerm(b.academicYear, b.term)}
                      </span>
                      <EnumBadge value={b.status} meta={bulletinStatusMeta} />
                      <Badge variant="outline" className="font-normal">
                        {b.region}
                      </Badge>
                      {b.status === "open" && (
                        <span className="ml-auto">
                          <DeadlineBadge date={b.deadlineAt} />
                        </span>
                      )}
                    </div>
                    <p className="mt-2 font-semibold leading-snug group-hover:text-primary">
                      {t(b.title)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Announced {b.announcedAt} · Deadline {b.deadlineAt}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Partner schools open to this program */}
      <section className="mb-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <School className="size-5 text-primary" />
            Partner schools
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/schools">
              Compare all schools
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        {schools.length === 0 ? (
          <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
            No partner school is currently open to this program.
          </p>
        ) : (
          <Card className="py-0">
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">School</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead className="text-right">Quota</TableHead>
                    <TableHead className="text-right">Min GPA</TableHead>
                    <TableHead className="pr-6">Requirements</TableHead>
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
                        <span className="mt-0.5 flex flex-wrap gap-1.5">
                          {s.englishTaught && (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Languages className="size-3" />
                              English-taught
                            </span>
                          )}
                          {s.housingProvided && (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <BedDouble className="size-3" />
                              Housing
                            </span>
                          )}
                        </span>
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
                      <TableCell className="pr-6 text-xs text-muted-foreground">
                        {s.languageReq
                          .map((r) => `${r.test} ${r.score}`)
                          .join(" / ")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Funding linked to this program */}
      {funding.length > 0 && (
        <>
          <Separator className="mb-10" />
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold tracking-tight">
              <Coins className="size-5 text-primary" />
              Funding for this program
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {funding.map((f) => (
                <Link key={f.id} href={`/funding/${f.id}`} className="group">
                  <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-sm">
                    <CardHeader>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <EnumBadge value={f.source} meta={fundingSourceMeta} />
                        <span className="text-xs font-medium tabular-nums text-muted-foreground">
                          up to {formatTwd(f.amountMax)}
                        </span>
                      </div>
                      <CardTitle className="text-base group-hover:text-primary">
                        {t(f.name)}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {t(f.eligibility)}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </>
      )}

      <Card className="mt-10 border-primary/20 bg-primary/[0.03]">
        <CardHeader>
          <CardTitle className="text-base">Not sure this is the right fit?</CardTitle>
          <CardDescription>
            Ask the assistant, or bring your transcript to a T-Corner session and
            talk it through with the staff member who runs this program.
          </CardDescription>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/chat">Ask the AI Assistant</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/t-corner">
                T-Corner hours
                <ExternalLink className="size-3.5" />
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
