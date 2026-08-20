"use client";

import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  CalendarDays,
  Coins,
  FileStack,
  GraduationCap,
  Landmark,
  Languages,
  Quote,
  School,
  Users,
  Waypoints,
} from "lucide-react";
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

/** One hand-entered homepage figure, from SITE_STATS. */
export type SiteStat = {
  id: string;
  metricKey: string;
  label: Localized;
  value: number;
};

/**
 * Figures counted off the records, worked out by the server component.
 *
 * These are what the office can prove: how many agreements are signed, how many
 * places exist, what closes next. Anything the database cannot know — students
 * who actually went, money actually awarded — comes from SITE_STATS instead.
 */
export type SiteFigures = {
  programs: number;
  partnerSchools: number;
  countries: number;
  quotaPerTerm: number;
  openCalls: number;
  openFunding: number;
  testimonials: number;
  topFundingAmount: number;
  nextDeadline: {
    id: string;
    title: Localized;
    deadlineAt: string;
    daysLeft: number;
  } | null;
};

/** The horizontal padding every full-bleed section uses. */
const GUTTER = "px-[clamp(1.375rem,8vw,7.75rem)]";

/**
 * One icon per program type, so a card is recognisable before it is read. The
 * console does the same in its sidebar, which is why Programs gets `Waypoints`.
 */
const programIcons: Record<string, typeof School> = {
  exchange: School,
  dualDegree: GraduationCap,
  shortTerm: CalendarDays,
  internship: Briefcase,
  language: Languages,
};

/**
 * The four steps between "I am curious" and "I am on the plane". The reference
 * runs these as a numbered list against the navy; the copy is ours.
 */
const steps = [
  {
    title: "Pick a program",
    body: "Exchange, dual degree, internship or language study — each asks for different grades, language scores and paperwork.",
  },
  {
    title: "Check you qualify",
    body: "Every partner school lists its GPA floor, language threshold and how many places it takes per term.",
  },
  {
    title: "Apply before the deadline",
    body: "The bulletin is the binding document. Read it, gather what it lists, and submit through the office.",
  },
  {
    title: "Line up the money",
    body: "Ministry, university and external awards stack. Most open months before departure, so apply early.",
  },
];

export function HomeView({
  stats,
  figures,
  calls,
  latestPosts,
  openFunding,
  stories,
  programs,
  slotCount,
}: {
  stats: SiteStat[];
  figures: SiteFigures;
  calls: (SiteBulletin & { programName: Localized | null })[];
  latestPosts: SitePost[];
  openFunding: SiteFunding[];
  stories: SiteTestimonial[];
  programs: SiteProgram[];
  slotCount: number;
}) {
  const { t } = useLocale();

  /**
   * The figures band across the bottom of the hero.
   *
   * Counted values come first because they are always true; the hand-entered
   * SITE_STATS rows fill the remaining places, so a year the office has not
   * filled in yet simply shows fewer tiles rather than an empty strip. A tile
   * whose number is zero is dropped — "0 partner schools" is worse for trust
   * than saying nothing.
   */
  const tiles: {
    label: string;
    value: string;
    sub?: string;
    icon: typeof School;
  }[] = [
    {
      label: "Partner schools",
      value: String(figures.partnerSchools),
      sub:
        figures.countries > 0
          ? `across ${figures.countries} ${figures.countries === 1 ? "country" : "countries"}`
          : undefined,
      icon: School,
    },
    {
      label: "Places each term",
      value: String(figures.quotaPerTerm),
      sub: `over ${figures.programs} ${figures.programs === 1 ? "program" : "programs"}`,
      icon: Users,
    },
    {
      label: figures.openCalls === 1 ? "Call open now" : "Calls open now",
      value: String(figures.openCalls),
      sub: figures.nextDeadline
        ? `next closes ${figures.nextDeadline.deadlineAt}`
        : undefined,
      icon: FileStack,
    },
    {
      label: "Funding you can apply for",
      value: String(figures.openFunding),
      sub:
        figures.topFundingAmount > 0
          ? `up to ${formatTwd(figures.topFundingAmount)}`
          : undefined,
      icon: Coins,
    },
    {
      label: "Student reports",
      value: String(figures.testimonials),
      sub: "written after they came back",
      icon: Quote,
    },
  ]
    .filter((tile) => tile.value !== "0")
    .slice(0, 4);

  for (const stat of stats) {
    if (tiles.length >= 4) break;
    tiles.push({
      label: t(stat.label),
      value:
        stat.metricKey === "funding_total"
          ? formatTwd(stat.value)
          : stat.value.toLocaleString("en-US"),
      sub: "recorded by the office",
      icon: Landmark,
    });
  }

  return (
    <>
      {/* ================= Hero =================
          Same shape as the reference hero — a gradient band, a faint engineering
          grid, a blurred orb and a wireframe globe — painted in the console's
          brand blue. All CSS, so there is no image to ship or wait for. */}
      <section
        className={`relative isolate overflow-hidden bg-linear-to-br from-brand to-brand-dark pt-[clamp(5rem,12vw,9rem)] pb-[clamp(9rem,14vw,11rem)] text-white ${GUTTER}`}
      >
        {/* Grid, fading in from the left so the headline stays clean. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(to_right,transparent,black_40%,black)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-[170px] -right-[170px] size-[420px] rounded-full bg-brand-tint opacity-20 blur-[1px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[120px] -left-[110px] size-[260px] rounded-full border border-white/25"
        />

        {/* Wireframe globe. Decorative, so it drops out below lg. */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-[135px] right-[6vw] hidden aspect-square w-[min(520px,42vw)] rounded-full border border-white/20 bg-[radial-gradient(circle_at_42%_42%,rgba(255,255,255,.14),rgba(255,255,255,.05)_36%,rgba(255,255,255,.015)_67%)] shadow-[inset_0_0_80px_rgba(255,255,255,.07),0_0_100px_rgba(0,0,0,.15)] lg:block"
        >
          <div className="absolute inset-[12%] rounded-full border border-white/20 [transform:rotate(28deg)_scaleX(.42)]" />
          <div className="absolute inset-[12%] rounded-full border border-white/20 [transform:rotate(-20deg)_scaleY(.43)]" />
          <div className="absolute inset-[38%] flex flex-col items-center justify-center rounded-full border border-white/25 bg-black/25 backdrop-blur-[8px]">
            <span className="figure text-[34px] text-white">
              {figures.countries || "—"}
            </span>
            <small className="on-brand-muted text-center text-[9px]">
              COUNTRIES
            </small>
          </div>
        </div>

        <div className="relative z-2 w-full lg:w-[56%]">
          <p className="eyebrow mb-4 text-brand-tint">
            Tunghai Go Global · Office of International Relations
          </p>
          <h1 className="display-xl max-w-[720px]">
            Turn the world into your next campus.
          </h1>
          <p className="on-brand-muted mt-6 mb-9 max-w-[610px] text-lg leading-relaxed">
            Exchange, dual degree, internships and language study — with the
            partner schools you qualify for, the funding you can stack on top,
            and reports from students who already went.
          </p>
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
            <Link
              href="/programs"
              className="flex items-center gap-3 rounded-md bg-white px-5 py-3 text-sm font-semibold text-brand shadow-sm transition-colors hover:bg-white/90"
            >
              Start exploring
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/bulletins"
              className="flex items-center gap-2 rounded-md border border-white/30 px-5 py-3 text-sm font-semibold transition-colors hover:bg-white/10"
            >
              See open calls
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Figures strip, pinned to the bottom edge of the hero. */}
        {tiles.length >= 2 && (
          <dl
            className={`absolute inset-x-0 bottom-0 grid grid-cols-2 border-t border-white/15 bg-black/15 backdrop-blur-[10px] lg:grid-cols-4 ${GUTTER}`}
          >
            {tiles.map((tile) => (
              <div
                key={tile.label}
                className="flex flex-col justify-center gap-1 border-l border-white/12 px-4 py-4 last:border-r sm:flex-row sm:items-center sm:gap-3.5 sm:px-7"
              >
                <dd className="figure text-[clamp(1.5rem,3vw,2rem)] leading-none text-white">
                  {tile.value}
                </dd>
                <div className="min-w-0">
                  <dt className="on-brand-muted text-xs font-medium">
                    {tile.label}
                  </dt>
                  {tile.sub && (
                    <p className="mt-0.5 hidden text-[11px] text-white/45 xl:block">
                      {tile.sub}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </dl>
        )}
      </section>

      {/* ================= Notice bar =================
          The one thing a student landing here has to act on. */}
      {figures.nextDeadline && figures.nextDeadline.daysLeft >= 0 && (
        <div
          className={`flex flex-wrap items-center gap-x-7 gap-y-3 border-b bg-accent py-5 ${GUTTER}`}
        >
          <span className="eyebrow rounded-md border border-primary/25 bg-primary/5 px-2.5 py-1.5 text-primary">
            Closing next
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold tracking-tight">
              {t(figures.nextDeadline.title)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Applications close {figures.nextDeadline.deadlineAt} ·{" "}
              {figures.nextDeadline.daysLeft === 0
                ? "closes today"
                : figures.nextDeadline.daysLeft === 1
                  ? "1 day left"
                  : `${figures.nextDeadline.daysLeft} days left`}
            </p>
          </div>
          <Link
            href={`/bulletins/${figures.nextDeadline.id}`}
            className="rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Read the bulletin
          </Link>
        </div>
      )}

      {/* ================= Opportunities =================
          Calls and notices as one dated list, the way the reference stacks its
          updates — date rail, copy, action, all on one row. */}
      <section
        className={`border-b bg-muted/40 py-[clamp(4rem,7vw,5.5rem)] ${GUTTER}`}
      >
        <div className="mb-11 grid items-end gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,.6fr)] lg:gap-[70px]">
          <div>
            <p className="eyebrow mb-4 text-primary">Latest opportunities</p>
            <h2 className="display-lg max-w-[760px]">
              What you can apply for, right now
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Selection calls and office notices in one place, so the deadline and
            the next step sit on the same line.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border bg-card">
          {calls.map((b) => (
            <Link
              key={b.id}
              href={`/bulletins/${b.id}`}
              className="grid grid-cols-[70px_1fr] items-center gap-5 border-b px-4 py-5 transition-colors last:border-b-0 hover:bg-accent/50 sm:grid-cols-[90px_1fr_150px] sm:gap-7 sm:px-6"
            >
              <div className="flex flex-col justify-center self-stretch border-r pr-4">
                <b className="figure text-xl">
                  {formatTerm(b.academicYear, b.term)}
                </b>
                <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Term
                </span>
              </div>
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2.5">
                  <span className="eyebrow text-[11px] text-primary">Bulletin</span>
                  <DeadlineBadge date={b.deadlineAt} />
                </div>
                <h3 className="mb-1 text-base leading-snug">
                  {t(b.title)}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {b.programName ? t(b.programName) : "—"} · closes{" "}
                  {b.deadlineAt}
                </p>
              </div>
              <span className="col-start-2 flex w-max items-center gap-2 text-xs font-semibold text-primary sm:col-start-3 sm:w-auto sm:justify-end">
                View
                <ArrowRight className="size-3.5" />
              </span>
            </Link>
          ))}

          {latestPosts.map((p) => (
            <Link
              key={p.id}
              href={`/news/${p.slug}`}
              className="grid grid-cols-[70px_1fr] items-center gap-5 border-b px-4 py-5 transition-colors last:border-b-0 hover:bg-accent/50 sm:grid-cols-[90px_1fr_150px] sm:gap-7 sm:px-6"
            >
              <div className="flex flex-col justify-center self-stretch border-r pr-4">
                <b className="figure text-sm">
                  {p.publishedAt}
                </b>
                <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Notice
                </span>
              </div>
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2.5">
                  <EnumBadge value={p.type} meta={postTypeMeta} />
                  {p.categoryName && (
                    <span className="text-xs text-muted-foreground">
                      {t(p.categoryName)}
                    </span>
                  )}
                </div>
                <h3 className="text-base leading-snug">{t(p.title)}</h3>
              </div>
              <span className="col-start-2 flex w-max items-center gap-2 text-xs font-semibold text-primary sm:col-start-3 sm:w-auto sm:justify-end">
                Read
                <ArrowRight className="size-3.5" />
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/bulletins"
          className="mt-6 ml-auto flex w-max items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          All bulletins and notices
          <ArrowRight className="size-3.5" />
        </Link>
      </section>

      {/* ================= Funding =================
          A brand band carrying three cards, the middle one inverted to white so
          the eye lands somewhere. */}
      <section
        className={`bg-brand py-[clamp(4rem,7vw,5.5rem)] text-white ${GUTTER}`}
      >
        <div className="mb-11 grid items-end gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(260px,.65fr)] lg:gap-[70px]">
          <div>
            <p className="eyebrow mb-4 text-brand-tint">Fund your journey</p>
            <h2 className="display-lg">
              Before you pick a school, check what you can claim
            </h2>
          </div>
          <p className="on-brand-muted text-sm leading-relaxed">
            Awards depend on eligibility, destination, study period, review and
            the year&apos;s budget. These are the doors in and their published
            ceilings — not a figure anyone is guaranteed.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {openFunding.slice(0, 3).map((f, i) => (
            <Link
              key={f.id}
              href={`/funding/${f.id}`}
              className={`flex min-h-[320px] flex-col rounded-lg border p-6 transition-colors ${
                // The middle card inverts, exactly as the reference does.
                i === 1
                  ? "border-transparent bg-card text-card-foreground hover:bg-card/90"
                  : "border-white/20 bg-white/5 hover:bg-white/10"
              }`}
            >
              <span
                className={`eyebrow ${i === 1 ? "text-primary" : "text-brand-tint"}`}
              >
                {fundingSourceMeta[f.source]?.label ?? f.source}
              </span>
              <h3 className="mt-4 mb-3 text-lg leading-snug">
                {t(f.name)}
              </h3>
              <strong
                className={`figure text-2xl ${i === 1 ? "text-primary" : "text-white"}`}
              >
                up to {formatTwd(f.amountMax)}
              </strong>
              <p
                className={`my-4 line-clamp-4 text-xs leading-relaxed ${i === 1 ? "text-muted-foreground" : "on-brand-muted"}`}
              >
                {t(f.eligibility)}
              </p>
              <span className="mt-auto flex w-max items-center gap-2 text-xs font-semibold">
                Eligibility and dates
                <ArrowRight className="size-3.5" />
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-5 text-xs leading-relaxed text-white/50">
          Figures are published ceilings. The bulletin for each round is the
          binding document.
        </p>
      </section>

      {/* ================= Programs =================
          Plain shadcn cards, the same ones the console builds its screens from:
          an icon tile, a badge, a title and a footer link. */}
      <section className={`bg-background py-[clamp(4rem,7vw,5.5rem)] ${GUTTER}`}>
        <div className="mb-14 grid items-end gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,.6fr)] lg:gap-[70px]">
          <div>
            <p className="eyebrow mb-4 text-primary">Ways to go abroad</p>
            <h2 className="display-lg">
              Four routes out, each with its own paperwork
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {programs.length === 1
              ? "One program, with its own bulletins, partner schools and funding."
              : `${programs.length} program types, each with its own bulletins, partner schools and funding.`}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {programs.map((program) => {
            const Icon = programIcons[program.type] ?? Waypoints;
            return (
              <Link
                key={program.id}
                href={`/programs/${program.slug}`}
                className="group flex flex-col rounded-lg border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="mb-4 flex items-center justify-between gap-2">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <EnumBadge value={program.type} meta={programTypeMeta} />
                </div>
                <h3 className="text-base leading-snug transition-colors group-hover:text-primary">
                  {t(program.name)}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {t(program.overview)}
                </p>
                <span className="mt-6 flex items-center justify-between border-t pt-4 text-xs font-semibold text-primary">
                  Requirements and schools
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>

        <Link
          href="/schools"
          className="mx-auto mt-10 flex w-max items-center gap-2 rounded-md border px-5 py-3 text-sm font-semibold transition-colors hover:bg-accent"
        >
          Browse all {figures.partnerSchools} partner schools
          <ArrowRight className="size-3.5" />
        </Link>
      </section>

      {/* ================= Guide =================
          Brand band, numbered steps. */}
      <section
        className={`grid gap-14 bg-brand py-[clamp(4rem,7vw,5.5rem)] text-white lg:grid-cols-[.72fr_1.28fr] lg:gap-[8vw] ${GUTTER}`}
      >
        <div>
          <p className="eyebrow mb-4 text-brand-tint">Preparation guide</p>
          <h2 className="display-lg">Four steps, in order</h2>
          <p className="on-brand-muted mt-5 max-w-[470px] text-sm leading-relaxed">
            Most applications come apart on timing, not on grades. This is the
            sequence the office walks every student through.
          </p>
        </div>

        <div className="border-t border-white/15">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="grid grid-cols-[50px_1fr] items-center gap-5 border-b border-white/15 py-5 sm:grid-cols-[70px_1fr]"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-sm font-bold text-brand-tint">
                {i + 1}
              </span>
              <div>
                <h3 className="mb-1 text-base">{step.title}</h3>
                <p className="on-brand-muted text-sm leading-relaxed">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= Two closing cards =================
          Student reports and T-Corner, sitting on the guide's band as cards
          rather than the reference's paired colour blocks. */}
      <section
        className={`grid gap-5 bg-brand pb-[clamp(4rem,7vw,5.5rem)] lg:grid-cols-2 ${GUTTER}`}
      >
        <div className="relative flex min-h-[280px] flex-col items-start overflow-hidden rounded-lg bg-card p-8 text-card-foreground shadow-sm sm:p-10">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -bottom-25 size-[290px] rounded-full border border-primary/10 after:absolute after:inset-[18%] after:rounded-full after:border after:border-primary/10 after:content-['']"
          />
          <p className="eyebrow relative z-2 mb-5 text-primary">
            From students who went
          </p>
          <h2 className="display-lg relative z-2 max-w-[480px] text-[clamp(1.5rem,2.6vw,2rem)]">
            {stories.length > 0
              ? `${figures.testimonials} reports, written after they came back`
              : "Reports from students who already went"}
          </h2>
          <p className="relative z-2 mt-3 max-w-[420px] text-sm leading-relaxed text-muted-foreground">
            {/* `highlights` can legitimately be empty, so fall back rather
                than pulling a quote out of an undefined slot. */}
            {stories[0]?.highlights[0]
              ? `“${stories[0].highlights[0]}” — ${stories[0].displayName}, ${stories[0].country}`
              : "Published with each student's consent, so you can read what the term was actually like."}
          </p>
          <Link
            href="/testimonials"
            className="relative z-2 mt-auto flex items-center gap-2 pt-6 text-sm font-semibold text-primary hover:underline"
          >
            Read the reports
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="relative flex min-h-[280px] flex-col items-start overflow-hidden rounded-lg bg-card p-8 text-card-foreground shadow-sm sm:p-10">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-20 -bottom-25 size-[290px] rounded-full border border-primary/10 after:absolute after:inset-[18%] after:rounded-full after:border after:border-primary/10 after:content-['']"
          />
          <p className="eyebrow relative z-2 mb-5 flex items-center gap-2 text-primary">
            <CalendarClock className="size-3.5" />
            T-Corner
          </p>
          <h2 className="display-lg relative z-2 max-w-[480px] text-[clamp(1.5rem,2.6vw,2rem)]">
            Still unsure? Come and ask in person
          </h2>
          <p className="relative z-2 mt-3 max-w-[420px] text-sm leading-relaxed text-muted-foreground">
            Walk-in advising with the staff who handle each program — bring your
            transcript and your shortlist. {slotCount} slots run every week.
          </p>
          <Link
            href="/t-corner"
            className="relative z-2 mt-auto flex items-center gap-2 pt-6 text-sm font-semibold text-primary hover:underline"
          >
            See the weekly schedule
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </section>

      {/* A last quiet row for the things that did not earn a band of their own. */}
      <section
        className={`flex flex-wrap items-center gap-x-8 gap-y-3 border-t bg-muted/40 py-6 text-sm font-medium ${GUTTER}`}
      >
        <span className="eyebrow mr-4 text-muted-foreground">Also here</span>
        <Link href="/faqs" className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary">
          <CalendarDays className="size-4" /> Frequently asked questions
        </Link>
        <Link
          href="/news"
          className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
        >
          <FileStack className="size-4" /> News &amp; notices
        </Link>
        <Link
          href="/contact"
          className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
        >
          <Landmark className="size-4" /> Contact the office
        </Link>
      </section>
    </>
  );
}
