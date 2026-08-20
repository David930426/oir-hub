"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Coins,
  GraduationCap,
  Info,
  Landmark,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import type { Localized } from "@/lib/i18n";
import {
  formatApplyMonths,
  formatTwd,
  fundingSourceMeta,
  fundingStatusMeta,
} from "@/lib/mock/labels";
import type {
  FundingSourceValue,
  FundingStatusValue,
} from "@/lib/validator/funding.validator";

/** One funding call as the public list shows it. */
export type SiteFunding = {
  id: string;
  programId: string | null;
  programName: Localized | null;
  name: Localized;
  source: FundingSourceValue;
  status: FundingStatusValue;
  eligibility: Localized;
  amountMax: number;
  applyMonths: number[];
};

const statusTabs = ["all", "open", "closed", "archived"] as const;

const scholarshipsHeading: Localized = {
  zh: "東海獎學金",
  en: "Tunghai Scholarships",
};

const scholarshipsIntro: Localized = {
  zh: "依學年度發放之國際學生獎學金,審核依據包含學業表現、系所評量及語言能力。",
  en: "International Student Scholarships awarded per academic year, based on academic performance, departmental evaluation, and language proficiency.",
};

const scholarshipNotes: Localized[] = [
  {
    zh: "本獎學金用於抵免學費,並分兩學期發放,不含實習費、住宿費、網路使用費、學生保險費等雜費。",
    en: "This scholarship offsets tuition and is split across two semesters — it does not cover fees such as labs, dorms, internet, or insurance.",
  },
  {
    zh: "本獎學金須依在校學業表現逐年重新申請;如本清單與招生簡章內容不符,以招生簡章為準。",
    en: "Renewal is required every year based on academic performance. The official Admission Notice takes precedence over this list.",
  },
  {
    zh: "獲獎學生如申請保留入學資格(延後入學),將喪失獎學金資格。",
    en: "Recipients who defer enrollment to a later semester or academic year will not retain scholarship eligibility.",
  },
  {
    zh: "由國內其他大學轉學至東海大學之學生,於轉學入學階段不得申請本獎學金,惟可於入學後第二年依第一年學業表現申請。",
    en: "Students transferring from other Taiwan universities are not eligible during the transfer admission process, but may apply in their second year based on first-year academic performance.",
  },
];

const scholarshipTiers: {
  id: string;
  name: Localized;
  amountLabel: string;
  description: Localized;
}[] = [
  {
    id: "type-1",
    name: { zh: "第一類", en: "Type I" },
    amountLabel: "NTD 100,000",
    description: {
      zh: "授予學業成績優異、排名頂尖之申請者。",
      en: "Awarded to top-ranked applicants with strong academic records.",
    },
  },
  {
    id: "type-2",
    name: { zh: "第二類", en: "Type II" },
    amountLabel: "NTD 60,000",
    description: {
      zh: "授予表現優異之申請者。",
      en: "Awarded to high-performing applicants.",
    },
  },
  {
    id: "type-3",
    name: { zh: "第三類", en: "Type III" },
    amountLabel: "NTD 20,000",
    description: {
      zh: "授予符合基本資格之申請者。",
      en: "Awarded to qualifying applicants who meet baseline criteria.",
    },
  },
];

const qualificationsHeading: Localized = {
  zh: "新生申請資格",
  en: "New Student Application Qualifications",
};

const qualifications: Localized[] = [
  { zh: "最高學歷成績單", en: "Transcript of the highest academic degree obtained" },
  { zh: "系所評量", en: "Evaluation by the department or program" },
  {
    zh: "語言能力排名(以中文及英文為主)",
    en: "Language proficiency ranking (primarily in Chinese and English)",
  },
];

const overseasChineseHeading: Localized = {
  zh: "僑生獎學金",
  en: "Scholarships for Overseas Chinese Students",
};

const overseasChineseThuHeading: Localized = {
  zh: "東海大學提供",
  en: "Provided by Tunghai University",
};

const overseasChineseThu: { name: Localized; detail: Localized }[] = [
  {
    name: {
      zh: "僑生助學金",
      en: "Financial Aid Scholarship for Overseas Chinese Students",
    },
    detail: {
      zh: "新生可於入學第一學期申請;第二學期起依前一學期學業表現核發。每學期新台幣5,000元。",
      en: "New students may apply in their first semester; from the second semester onward the award is based on the previous semester's performance. NTD 5,000 per semester.",
    },
  },
  {
    name: {
      zh: "僑生優秀研究生獎學金",
      en: "Outstanding Overseas Chinese Graduate Scholarship",
    },
    detail: {
      zh: "新入學研究生依大學學業表現核發;續發則依前一學期學業表現。每月新台幣10,000元。",
      en: "For new graduate students, awarded based on undergraduate academic performance; renewal is based on the previous semester's performance. NTD 10,000 per month.",
    },
  },
];

const overseasChineseExternalHeading: Localized = {
  zh: "政府及校外機構提供",
  en: "Provided by Government and External Organizations",
};

const overseasChineseExternal: Localized[] = [
  {
    zh: "世界華人社團聯合總會僑生獎學金",
    en: "Scholarship for Overseas Chinese Students by the World Federation of Chinese Associations",
  },
  {
    zh: "僑務委員會僑生助學金",
    en: "Overseas Community Affairs Council (OCAC) Financial Assistance for Overseas Chinese Students",
  },
  {
    zh: "全球華僑校友總會僑生獎學金",
    en: "United Chinese Alumni Association Scholarship for Overseas Chinese Students",
  },
];

export function FundingView({
  fundings,
  programs,
}: {
  fundings: SiteFunding[];
  programs: { id: string; name: Localized }[];
}) {
  const { t } = useLocale();
  const [status, setStatus] = useState<string>("open");
  const [source, setSource] = useState("all");
  const [programId, setProgramId] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      fundings.filter((f) => {
        if (status !== "all" && f.status !== status) return false;
        if (source !== "all" && f.source !== source) return false;
        if (programId !== "all" && f.programId !== programId) return false;
        if (
          query &&
          !`${f.name.zh} ${f.name.en ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
          return false;
        return true;
      }),
    [fundings, status, source, programId, query]
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={status} onValueChange={setStatus}>
          <TabsList>
            {statusTabs.map((s) => (
              <TabsTrigger key={s} value={s}>
                {s === "all" ? "All" : fundingStatusMeta[s].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search funding…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 sm:w-48"
            />
          </div>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {(Object.keys(fundingSourceMeta) as (keyof typeof fundingSourceMeta)[]).map(
                (s) => (
                  <SelectItem key={s} value={s}>
                    {fundingSourceMeta[s].label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          <Select value={programId} onValueChange={setProgramId}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All programs</SelectItem>
              {programs.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {t(p.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {filtered.length} funding option{filtered.length === 1 ? "" : "s"}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((f) => {
          const program = f.programName;
          return (
            <Link key={f.id} href={`/funding/${f.id}`} className="group">
              <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
                <CardHeader>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <EnumBadge value={f.source} meta={fundingSourceMeta} />
                    <EnumBadge value={f.status} meta={fundingStatusMeta} />
                  </div>
                  <CardTitle className="text-base leading-snug group-hover:text-primary">
                    {t(f.name)}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {t(f.eligibility)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Coins className="size-3" />
                        Up to
                      </dt>
                      <dd className="font-semibold tabular-nums">
                        {formatTwd(f.amountMax)}
                      </dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays className="size-3" />
                        Apply in
                      </dt>
                      <dd className="font-semibold">
                        {formatApplyMonths(f.applyMonths)}
                      </dd>
                    </div>
                  </dl>
                  {program && (
                    <Badge variant="secondary" className="font-normal">
                      {t(program)}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          <p className="font-medium">No funding matches your filters.</p>
          <p className="mt-1 text-sm">Try another status or source.</p>
        </div>
      )}

      {/* --- Scholarships (separate section, same page) --------------------- */}
      <div className="my-16 border-t" />

      <section id="scholarships">
        <div className="mb-8">
          <h2 className="text-3xl tracking-tight">
            {t(scholarshipsHeading)}
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t(scholarshipsIntro)}
          </p>
        </div>

        <Card className="mb-10 bg-muted/30">
          <CardContent className="pt-6">
            <ul className="space-y-3">
              {scholarshipNotes.map((note) => (
                <li key={note.en} className="flex items-start gap-2 text-sm">
                  <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">{t(note)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="mb-10 grid gap-4 md:grid-cols-3">
          {scholarshipTiers.map((tier) => (
            <Card key={tier.id} className="h-full">
              <CardHeader>
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant="secondary" className="font-normal">
                    {t(tier.name)}
                  </Badge>
                </div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Coins className="size-5 text-primary" />
                  {tier.amountLabel}
                </CardTitle>
                <CardDescription>{t(tier.description)}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="mb-10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="size-5 text-primary" />
              {t(qualificationsHeading)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {qualifications.map((q) => (
                <li key={q.en} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{t(q)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="mb-4">
          <h3 className="text-xl font-semibold tracking-tight">
            {t(overseasChineseHeading)}
          </h3>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Landmark className="size-5 text-primary" />
                {t(overseasChineseThuHeading)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {overseasChineseThu.map((s) => (
                  <li key={s.name.en}>
                    <p className="text-sm font-medium">{t(s.name)}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t(s.detail)}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Landmark className="size-5 text-primary" />
                {t(overseasChineseExternalHeading)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {overseasChineseExternal.map((s) => (
                  <li key={s.en} className="text-sm text-muted-foreground">
                    {t(s)}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
