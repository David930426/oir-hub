"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Building2,
  CalendarClock,
  ClipboardList,
  Coins,
  ExternalLink,
  FileStack,
  GraduationCap,
  Landmark,
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

const APPLICATION_STEPS = [
  {
    stepNumber: 1,
    title: { en: "Initial Review", zh: "校內初審" },
    description: {
      en: "The university checks your eligibility and application completeness.",
      zh: "審查申請資格與繳交文件之完整性。",
    },
    icon: ClipboardList,
  },
  {
    stepNumber: 2,
    title: { en: "Departmental Confirmation", zh: "系所審核" },
    description: {
      en: "Your department confirms the track fits your major and approves your quota seat.",
      zh: "由所屬系所確認課程銜接性並核可推薦名額。",
    },
    icon: Building2,
  },
  {
    stepNumber: 3,
    title: { en: "International Office Assistance", zh: "國際處提名" },
    description: {
      en: "OIR prepares nomination documents and coordinates with the partner school.",
      zh: "國際處協助準備提名文件並與姐妹校進行對接。",
    },
    icon: FileStack,
  },
  {
    stepNumber: 4,
    title: { en: "Partner University Review", zh: "姐妹校終審" },
    description: {
      en: "The partner school makes the final admission decision.",
      zh: "由姐妹校進行最終入學資格審查與錄取確認。",
    },
    icon: School,
    isFinal: true,
  },
];

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

  // Dynamic range computation derived from school requirements
  const gpaValues = schools.map((s) => s.gpaMin).filter((v) => v != null);
  const gpaRange = gpaValues.length
    ? Math.min(...gpaValues) === Math.max(...gpaValues)
      ? `${Math.min(...gpaValues).toFixed(1)} ${t({ en: "minimum", zh: "最低門檻" })}`
      : `${Math.min(...gpaValues).toFixed(1)}–${Math.max(...gpaValues).toFixed(1)} ${t({ en: "minimum", zh: "最低門檻" })}`
    : t({ en: "Set by partner school", zh: "依姐妹校規定" });

  const languageReqs = Array.from(
    new Set(
      schools.flatMap((s) => s.languageReq.map((r) => `${r.test} ${r.score}`))
    )
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* Back Button */}
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/programs">
          <ArrowLeft className="size-4" />
          {t({ en: "All programs", zh: "返回所有計畫" })}
        </Link>
      </Button>

      {/* Hero Header Section */}
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

      {/* 1. Selection Bulletins */}
      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold tracking-tight">
          📑 {t({ en: "Selection bulletins", zh: "簡章與公告" })}
        </h2>
        {calls.length === 0 ? (
          <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
            {t({
              en: "No bulletin has been issued for this program yet.",
              zh: "此計畫目前尚未發布遴選簡章。",
            })}
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
                      {t({ en: "Announced", zh: "公告日期" })} {b.announcedAt} · {t({ en: "Deadline", zh: "截止日期" })} {b.deadlineAt}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 2. Partner Schools Table */}
      <section className="mb-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-xl font-bold tracking-tight">
            🏫 {t({ en: "Partner schools", zh: "合作姊妹校" })}
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/schools">
              {t({ en: "Compare all schools", zh: "比較所有姊妹校" })}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        {schools.length === 0 ? (
          <p className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
            {t({
              en: "No partner school is currently open to this program.",
              zh: "此計畫目前無開放申請之姐妹校。",
            })}
          </p>
        ) : (
          <Card className="py-0 overflow-hidden">
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">{t({ en: "School", zh: "學校名稱" })}</TableHead>
                    <TableHead>{t({ en: "Country", zh: "國家" })}</TableHead>
                    <TableHead className="text-right">{t({ en: "Quota", zh: "名額" })}</TableHead>
                    <TableHead className="text-right">{t({ en: "Min GPA", zh: "最低 GPA" })}</TableHead>
                    <TableHead className="pr-6">{t({ en: "Requirements", zh: "語言要求" })}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="pl-6">
                        <Link
                          href={`/schools/${s.id}`}
                          className="font-semibold hover:text-primary"
                        >
                          {t(s.name)}
                        </Link>
                        <span className="mt-0.5 flex flex-wrap gap-1.5">
                          {s.englishTaught && (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Languages className="size-3" />
                              {t({ en: "English-taught", zh: "英語授課" })}
                            </span>
                          )}
                          {s.housingProvided && (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <BedDouble className="size-3" />
                              {t({ en: "Housing", zh: "提供宿舍" })}
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
                      <TableCell className="text-right tabular-nums font-mono">
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

      {/* Dynamic Content for Dual Degree Program */}
      {program.type === "dualDegree" && (
        <>
          {/* 3. Application Requirements */}
          <section className="mb-10">
            <h2 className="mb-2 text-xl font-bold tracking-tight">
              📋 {t({ en: "Application requirements", zh: "申請資格與要求" })}
            </h2>
            <p className="mb-4 text-xs text-muted-foreground max-w-3xl leading-relaxed">
              {t({
                en: "General minimums across all tracks. Departmental restrictions apply on top of these — confirm with your department before applying.",
                zh: "各計畫之基本門檻。各系所可能另有額外限制，申請前請務必向所屬系所確認。",
              })}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="p-5">
                  <GraduationCap className="mb-2 size-5 text-primary" />
                  <CardTitle className="text-base">
                    {t({ en: "GPA", zh: "學業成績 (GPA)" })}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {gpaRange}. {t({ en: "Cumulative as of the term before you apply.", zh: "計算至申請前一學期之累計成績。" })}
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="p-5">
                  <Languages className="mb-2 size-5 text-primary" />
                  <CardTitle className="text-base">
                    {t({ en: "Language proficiency", zh: "外語能力" })}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {languageReqs.length
                      ? languageReqs.join(" / ")
                      : t({
                          en: "TOEFL iBT 85–90 or JLPT N1 required depending on track.",
                          zh: "視授課語言需檢附 TOEFL iBT 85–90 或 JLPT N1。",
                        })}
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="p-5">
                  <CalendarClock className="mb-2 size-5 text-primary" />
                  <CardTitle className="text-base">
                    {t({ en: "Year of study", zh: "申請年級" })}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {program.eligibleYears
                      ? t(program.eligibleYears)
                      : t({
                          en: "Open to 2nd and 3rd year students only, applying one year ahead of departure.",
                          zh: "限大二及大三學生申請，需於出國前一年提出申請。",
                        })}
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="p-5">
                  <Landmark className="mb-2 size-5 text-amber-600" />
                  <CardTitle className="text-base">
                    {t({ en: "Departmental restrictions", zh: "系所限制" })}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed">
                    {program.departmentNote
                      ? t(program.departmentNote)
                      : t({
                          en: "Some majors are excluded or capped by quota.",
                          zh: "部分姐妹校僅開放特定系所申請或有名額限制。",
                        })}
                  </CardDescription>
                  <div className="mt-3">
                    <Badge variant="outline" className="text-[11px] font-semibold text-amber-800 border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300">
                      {t({ en: "Confirm with dept.", zh: "須向系所確認" })}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </section>

          {/* 4. Application Process */}
          <section className="mb-10">
            <h2 className="mb-2 text-xl font-bold tracking-tight">
              🧭 {t({ en: "Application process", zh: "申請流程" })}
            </h2>
            <p className="mb-4 text-xs text-muted-foreground">
              {t({
                en: "Four stages, in order — each has to clear before the next one starts.",
                zh: "共分四個階段，需按順序依次完成審查。",
              })}
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {APPLICATION_STEPS.map((step) => (
                <Card key={step.stepNumber} className="relative">
                  <CardHeader className="p-5">
                    <div className="mb-3 flex size-8 items-center justify-center rounded-full font-bold text-xs shadow-sm bg-primary text-primary-foreground">
                      {step.stepNumber}
                    </div>
                    <CardTitle className="text-sm font-bold">
                      {t(step.title)}
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed mt-1">
                      {t(step.description)}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          {/* 5. Tuition and Subsidy Information */}
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-bold tracking-tight">
              💰 {t({ en: "Tuition and subsidy information", zh: "學費與補助資訊" })}
            </h2>
  
            <Card className="py-0 overflow-hidden mb-3 border shadow-none">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-6 font-bold text-foreground">{t({ en: "Program", zh: "計畫名稱" })}</TableHead>
                      <TableHead className="font-bold text-foreground">{t({ en: "Home tuition", zh: "母校學費" })}</TableHead>
                      <TableHead className="font-bold text-foreground">{t({ en: "Partner tuition", zh: "姐妹校學費" })}</TableHead>
                      <TableHead className="pr-6 font-bold text-foreground">{t({ en: "Subsidy / scholarship", zh: "獎補助金" })}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schools.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="pl-6 font-bold align-top py-4">
                          {t(s.name)}
                        </TableCell>
                        <TableCell className="align-top py-4 whitespace-pre-line">
                          {s.tuitionHome ?? t({ en: "Standard rate,\nYrs 1–3", zh: "本校標準學費\n1–3年級" })}
                        </TableCell>
                        <TableCell className="align-top py-4 whitespace-pre-line">
                          {s.tuitionPartner ?? t({ en: "Contact OIR", zh: "請洽國際處" })}
                        </TableCell>
                        <TableCell className="pr-6 align-top py-4 whitespace-pre-line">
                          {s.subsidyNote ? t(s.subsidyNote) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="rounded-lg border border-amber-200/60 bg-amber-50/50 p-3.5 text-xs text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300 leading-relaxed">
              ⚠️ {t({
                en: "Partner-school tuition is billed separately by the partner university and is not covered by home-school financial aid unless stated otherwise. Confirm current rates with the International Office before budgeting.",
                zh: "姐妹校學費由該校自行收取，除另有規定外，不包含於本校學雜費減免範圍內。編列預算前請向國際處確認最新收費標準。",
            })}
            </div>
          </section>
        </>
      )}

      {/* Linked Funding Section */}
      {funding.length > 0 && (
        <>
          <Separator className="mb-10" />
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-bold tracking-tight">
              🪙 {t({ en: "Funding for this program", zh: "相關獎補助金" })}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {funding.map((f) => (
                <Link key={f.id} href={`/funding/${f.id}`} className="group">
                  <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-sm">
                    <CardHeader>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <EnumBadge value={f.source} meta={fundingSourceMeta} />
                        <span className="text-xs font-medium tabular-nums text-muted-foreground">
                          {t({ en: "up to", zh: "最高補助" })} {formatTwd(f.amountMax)}
                        </span>
                      </div>
                      <CardTitle className="text-base group-hover:text-primary">
                        {t(f.name)}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">
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

      {/* Consultation Banner / CTA */}
      <Card className="mt-10 border-primary/20 bg-primary/[0.03]">
        <CardHeader>
          <CardTitle className="text-base">
            💡 {t({ en: "Not sure this is the right fit?", zh: "不確定這是否適合你？" })}
          </CardTitle>
          <CardDescription className="text-xs leading-relaxed">
            {t({
              en: "Ask the assistant, or bring your transcript to a T-Corner session and talk it through with the staff member who runs this program.",
              zh: "詢問 AI 助理，或攜帶歷年成績單至 T-Corner 諮詢時間與計畫負責老師諮詢。",
            })}
          </CardDescription>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/chat">
                {t({ en: "Ask the AI Assistant", zh: "諮詢 AI 助理" })}
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/t-corner">
                {t({ en: "T-Corner hours", zh: "T-Corner 諮詢時間" })}
                <ExternalLink className="size-3.5" />
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}