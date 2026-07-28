"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Globe2, Paperclip, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeadlineBadge, EnumBadge } from "@/components/shared/enum-badge";
import { useLocale } from "@/components/site/locale-provider";
import {
  bulletinStatusMeta,
  bulletins,
  formatTerm,
  getMediaFile,
  getProgram,
  programs,
} from "@/lib/mock";

const statusTabs = ["all", "open", "closed", "archived"] as const;

export default function BulletinsPage() {
  const { t } = useLocale();
  const [status, setStatus] = useState<string>("open");
  const [programId, setProgramId] = useState("all");
  const [query, setQuery] = useState("");

  const regions = useMemo(
    () => Array.from(new Set(bulletins.map((b) => b.region))).sort(),
    []
  );
  const [region, setRegion] = useState("all");

  const filtered = useMemo(
    () =>
      bulletins
        .filter((b) => {
          if (status !== "all" && b.status !== status) return false;
          if (programId !== "all" && b.programId !== programId) return false;
          if (region !== "all" && b.region !== region) return false;
          if (
            query &&
            !`${b.title.zh} ${b.title.en ?? ""} ${b.academicYear}`
              .toLowerCase()
              .includes(query.toLowerCase())
          )
            return false;
          return true;
        })
        .sort((a, b) => a.deadlineAt.localeCompare(b.deadlineAt)),
    [status, programId, region, query]
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Bulletins 簡章</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every selection call the office has issued, newest deadline first. A
          bulletin is the binding document — where the two disagree, the PDF
          wins.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={status} onValueChange={setStatus}>
          <TabsList>
            {statusTabs.map((s) => (
              <TabsTrigger key={s} value={s}>
                {s === "all" ? "All" : bulletinStatusMeta[s].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search bulletins…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 sm:w-48"
            />
          </div>
          <Select value={programId} onValueChange={setProgramId}>
            <SelectTrigger className="w-full sm:w-48">
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
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-full sm:w-40">
              <Globe2 className="size-4 text-muted-foreground" />
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All regions</SelectItem>
              {regions.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {filtered.length} bulletin{filtered.length === 1 ? "" : "s"}
      </p>

      <div className="space-y-3">
        {filtered.map((b) => {
          const program = getProgram(b.programId);
          const pdf = getMediaFile(b.pdfFileId);
          return (
            <Link key={b.id} href={`/bulletins/${b.id}`} className="group block">
              <Card className="py-5 transition-all group-hover:border-primary/40 group-hover:shadow-sm">
                <CardContent className="px-5">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
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
                  <h2 className="text-lg font-semibold leading-snug group-hover:text-primary">
                    {t(b.title)}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{program ? t(program.name) : "—"}</span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3.5" />
                      Announced {b.announcedAt} · Deadline {b.deadlineAt}
                    </span>
                    {pdf && (
                      <span className="flex items-center gap-1">
                        <Paperclip className="size-3.5" />
                        PDF attached
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          <p className="font-medium">No bulletins match your filters.</p>
          <p className="mt-1 text-sm">
            Try another status, program, or region.
          </p>
        </div>
      )}
    </div>
  );
}
