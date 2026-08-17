"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Bot,
  CalendarClock,
  CalendarDays,
  Coins,
  FileStack,
  Landmark,
  Quote,
  School,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeadlineBadge, EnumBadge } from "@/components/shared/enum-badge";
import { useLocale } from "@/components/site/locale-provider";
import type { Localized } from "@/lib/i18n";
import {
  formatTerm,
  formatTwd,
  fundingSourceMeta,
  postTypeMeta,
  programTypeMeta,
} from "@/lib/mock/labels";
import type { SiteFunding } from "./funding/funding-view";
import type { SiteProgram } from "./programs/programs-view";
import type { SiteBulletin } from "./bulletins/bulletins-view";
import type { SitePost } from "./news/news-view";
import type { SiteTestimonial } from "./testimonials/testimonials-view";

/** One hand-entered homepage figure. */
export type SiteStat = {
  id: string;
  metricKey: string;
  label: Localized;
  value: number;
};

const programIcons = [School, BookOpenCheck, CalendarDays, Landmark, Quote];

export function HomeView({
  stats,
  calls,
  latestPosts,
  openFunding,
  stories,
  programs,
  slotCount,
}: {
  stats: SiteStat[];
  calls: (SiteBulletin & { programName: Localized | null })[];
  latestPosts: SitePost[];
  openFunding: SiteFunding[];
  stories: SiteTestimonial[];
  programs: SiteProgram[];
  slotCount: number;
}) {
  const { t } = useLocale();

  return (
    <>
      {/* Hero — Luce Memorial Chapel photo with the OIR logo navy (#1E3A4C) overlay */}
      <section className="relative overflow-hidden bg-[#1E3A4C] text-white">
        <Image
          src="/tunghai.jpg"
          alt="Luce Memorial Chapel, Tunghai University"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#132836]/95 via-[#1E3A4C]/85 to-[#1E3A4C]/40" />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#132836]/60 to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="max-w-2xl space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
              <Landmark className="size-3.5" />
              Office of International Relations · 東海大學國際處
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Every program, bulletin, and deadline in one place
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
              Exchange, dual degree, internships and language study — with the
              partner schools you qualify for, the funding you can stack on top,
              and reports from students who already went.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="font-semibold"
              >
                <Link href="/programs">
                  <School className="size-4" />
                  Explore programs
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/chat">
                  <Bot className="size-4" />
                  Ask the AI Assistant
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Site stats — SITE_STATS rows for the current academic year */}
      <section className="border-b bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.id}>
              <p className="text-3xl font-bold tracking-tight tabular-nums text-primary">
                {s.metricKey === "funding_total"
                  ? formatTwd(s.value)
                  : s.value.toLocaleString("en-US")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{t(s.label)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Programs */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Ways to go abroad
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Five program types, each with its own bulletins, partner schools,
              and funding.
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/programs">
              View all
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program, i) => {
            const Icon = programIcons[i % programIcons.length];
            return (
              <Link
                key={program.id}
                href={`/programs/${program.slug}`}
                className="group"
              >
                <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                        <Icon className="size-5" />
                      </span>
                      <EnumBadge value={program.type} meta={programTypeMeta} />
                    </div>
                    <CardTitle className="text-base group-hover:text-primary">
                      {t(program.name)}
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {t(program.overview)}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Open bulletins — the deadline-driven part of the site */}
      <section className="border-t bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                <FileStack className="size-6 text-primary" />
                Open calls
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Bulletins accepting applications right now.
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/bulletins">
                View all
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {calls.map((b) => {
              const program = b.programName;
              return (
                <Link key={b.id} href={`/bulletins/${b.id}`} className="group">
                  <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
                    <CardHeader>
                      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                        <span className="rounded bg-accent px-2 py-0.5 font-mono text-xs text-accent-foreground">
                          {formatTerm(b.academicYear, b.term)}
                        </span>
                        <DeadlineBadge date={b.deadlineAt} />
                      </div>
                      <CardTitle className="text-base leading-snug group-hover:text-primary">
                        {t(b.title)}
                      </CardTitle>
                      <CardDescription>
                        {program ? t(program) : "—"} · closes{" "}
                        {b.deadlineAt}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="mt-6 sm:hidden">
            <Button asChild variant="outline" className="w-full">
              <Link href="/bulletins">View all bulletins</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Funding + news, side by side */}
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2">
        <div>
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <Coins className="size-5 text-primary" />
              Funding you can apply for
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/funding">
                All funding
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {openFunding.map((f) => (
              <Link
                key={f.id}
                href={`/funding/${f.id}`}
                className="group block"
              >
                <Card className="py-4 transition-all group-hover:border-primary/40 group-hover:shadow-sm">
                  <CardContent className="px-4">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <EnumBadge value={f.source} meta={fundingSourceMeta} />
                      <span className="text-xs font-medium tabular-nums text-muted-foreground">
                        up to {formatTwd(f.amountMax)}
                      </span>
                    </div>
                    <p className="font-semibold leading-snug group-hover:text-primary">
                      {t(f.name)}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {t(f.eligibility)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <CalendarDays className="size-5 text-primary" />
              Latest from the office
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/news">
                All news
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {latestPosts.map((p) => {
              const category = p.categoryName;
              return (
                <Link
                  key={p.id}
                  href={`/news/${p.slug}`}
                  className="group block"
                >
                  <Card className="py-4 transition-all group-hover:border-primary/40 group-hover:shadow-sm">
                    <CardContent className="px-4">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <EnumBadge value={p.type} meta={postTypeMeta} />
                        {category && (
                          <span className="text-xs text-muted-foreground">
                            {t(category)}
                          </span>
                        )}
                        <span className="ml-auto text-xs text-muted-foreground">
                          {p.publishedAt}
                        </span>
                      </div>
                      <p className="font-semibold leading-snug group-hover:text-primary">
                        {t(p.title)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                <Quote className="size-6 text-primary" />
                From students who went
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Published with each student&apos;s consent.
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/testimonials">
                Read more
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/testimonials/${story.id}`}
                className="group"
              >
                <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
                  <CardHeader>
                    <CardDescription className="text-xs">
                      {story.deptYear} · {story.country} · {story.termLabel}
                    </CardDescription>
                    <ul className="mt-2 space-y-1.5">
                      {story.highlights.slice(0, 3).map((h) => (
                        <li
                          key={h}
                          className="border-l-2 border-primary/30 pl-3 text-sm leading-relaxed"
                        >
                          {h}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs font-medium text-muted-foreground">
                      — {story.displayName}
                    </p>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* T-Corner */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <Card className="overflow-hidden border-primary/20 bg-primary/3">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CalendarClock className="size-5 text-primary" />
                  Still unsure? Come to T-Corner
                </CardTitle>
                <CardDescription className="mt-1 max-w-xl">
                  Walk-in advising with the OIR staff who handle each program —
                  bring your transcript and your shortlist. {slotCount} slots
                  run every week.
                </CardDescription>
              </div>
              <Button asChild>
                <Link href="/t-corner">
                  See the weekly schedule
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </section>
    </>
  );
}
