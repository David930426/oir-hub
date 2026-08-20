"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BedDouble,
  Building2,
  ExternalLink,
  GraduationCap,
  Languages,
  MapPin,
  Quote,
  Users,
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
import { EnumBadge } from "@/components/shared/enum-badge";
import { AttachmentList } from "@/components/site/attachment-list";
import { useLocale } from "@/components/site/locale-provider";
import type { LanguageRequirement } from "@/db/schema/mobility.schema";
import type { Localized } from "@/lib/i18n";
import { formatTerm, programTypeMeta } from "@/lib/mock/labels";
import type { MediaFile } from "@/lib/mock/types";
import type { ProgramTypeValue } from "@/lib/validator/program.validator";

/** One agreement, with everything the page links to already resolved. */
export type SiteSchoolDetail = {
  id: string;
  name: Localized;
  country: string;
  region: string;
  quota: number;
  gpaMin: number;
  languageReq: LanguageRequirement[];
  eligibleColleges: string[];
  englishTaught: boolean;
  housingProvided: boolean;
  websiteUrl: string | null;
  active: boolean;
};

export type SiteSchoolCall = {
  id: string;
  title: Localized;
  academicYear: string;
  term: string;
  deadlineAt: string;
};

export type SiteSchoolStory = {
  id: string;
  displayName: string;
  deptYear: string;
  termLabel: string;
  highlights: string[];
};

export function SchoolDetailView({
  school,
  program,
  brief,
  stories,
  openCalls,
}: {
  school: SiteSchoolDetail;
  program: { type: ProgramTypeValue } | null;
  brief: MediaFile | null;
  stories: SiteSchoolStory[];
  openCalls: SiteSchoolCall[];
}) {
  const { t } = useLocale();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/schools">
          <ArrowLeft className="size-4" />
          All partner schools
        </Link>
      </Button>

      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {program && <EnumBadge value={program.type} meta={programTypeMeta} />}
          <Badge variant="outline" className="font-normal">
            {school.region}
          </Badge>
          {!school.active && (
            <Badge
              variant="outline"
              className="border-slate-200 bg-slate-100 font-medium text-slate-700"
            >
              Not accepting applications
            </Badge>
          )}
        </div>
        <h1 className="text-3xl tracking-tight">{t(school.name)}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="size-4" />
            {school.country}
          </span>
          {/* Not every agreement records a site — the office adds them as it
              finds them, and a dead link is worse than none. */}
          {school.websiteUrl && (
            <a
              href={school.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary underline-offset-2 hover:underline"
            >
              Official site
              <ExternalLink className="size-3.5" />
            </a>
          )}
        </p>
      </div>

      {/* Requirements at a glance */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <Users className="size-4" />
              Quota per term
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums">{school.quota}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <GraduationCap className="size-4" />
              Minimum GPA
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {school.gpaMin.toFixed(1)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <BedDouble className="size-4" />
              Housing
            </CardDescription>
            <CardTitle className="text-xl">
              {school.housingProvided ? "Provided" : "Find your own"}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {school.housingProvided
                ? "A dorm place is reserved for exchange students."
                : "Start looking as soon as you are nominated."}
            </p>
          </CardHeader>
        </Card>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Languages className="size-4 text-primary" />
              Language requirement
            </CardTitle>
            <CardDescription>
              Meet any one of these unless the bulletin says otherwise.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {school.languageReq.map((r) => (
                <li
                  key={r.test}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span className="font-medium">{r.test}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {r.score}
                  </span>
                </li>
              ))}
            </ul>
            {school.englishTaught && (
              <p className="mt-3 text-xs text-muted-foreground">
                Courses are available in English, so you do not need the local
                language to study here.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="size-4 text-primary" />
              Eligible colleges
            </CardTitle>
            <CardDescription>
              Students outside these colleges cannot be nominated.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {school.eligibleColleges.map((c) => (
                <Badge key={c} variant="secondary" className="font-normal">
                  {c}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {brief && (
        <div className="mb-10">
          <AttachmentList files={[brief]} title="School brief" />
        </div>
      )}

      {/* Open calls covering this school */}
      {openCalls.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl tracking-tight">
            Apply through
          </h2>
          <div className="space-y-3">
            {openCalls.map((b) => (
              <Link key={b.id} href={`/bulletins/${b.id}`} className="group block">
                <Card className="py-4 transition-all group-hover:border-primary/40 group-hover:shadow-sm">
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 px-4">
                    <div className="min-w-0">
                      <p className="font-semibold leading-snug group-hover:text-primary">
                        {t(b.title)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatTerm(b.academicYear, b.term)} · closes{" "}
                        {b.deadlineAt}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0">
                      Open bulletin
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials from students who went here */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-xl tracking-tight">
          <Quote className="size-5 text-primary" />
          What students said
        </h2>
        {stories.length === 0 ? (
          <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
            No testimonial has been published for this school yet.
          </p>
        ) : (
          <div className="space-y-4">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/testimonials/${story.id}`}
                className="group block"
              >
                <Card className="transition-all group-hover:border-primary/40 group-hover:shadow-sm">
                  <CardHeader>
                    <CardDescription className="text-xs">
                      {story.displayName} · {story.deptYear} · {story.termLabel}
                    </CardDescription>
                    <ul className="mt-2 space-y-1.5">
                      {story.highlights.map((h) => (
                        <li
                          key={h}
                          className="border-l-2 border-primary/30 pl-3 text-sm leading-relaxed"
                        >
                          {h}
                        </li>
                      ))}
                    </ul>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
