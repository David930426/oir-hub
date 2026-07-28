"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Coins, Search } from "lucide-react";
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
import {
  formatApplyMonths,
  formatTwd,
  fundingSourceMeta,
  fundingStatusMeta,
  fundings,
  getProgram,
  programs,
} from "@/lib/mock";

const statusTabs = ["all", "open", "closed", "archived"] as const;

export default function FundingPage() {
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
    [status, source, programId, query]
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Funding</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Grants and scholarships you can apply for alongside a program. Ministry
          and university awards can usually be held together — check the notes on
          each one.
        </p>
      </div>

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
          const program = f.programId ? getProgram(f.programId) : null;
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
                      {t(program.name)}
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
    </div>
  );
}
