"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BedDouble,
  Globe2,
  GraduationCap,
  Languages,
  MapPin,
  Search,
  Users,
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { EnumBadge } from "@/components/shared/enum-badge";
import { useLocale } from "@/components/site/locale-provider";
import {
  getProgram,
  partnerSchools,
  programTypeMeta,
  programs,
  schoolCountries,
  schoolRegions,
} from "@/lib/mock";

/** GPA steps students can filter by — the thresholds the bulletins actually use. */
const gpaSteps = ["any", "2.5", "3.0", "3.2", "3.3", "3.5"];

export default function PartnerSchoolsPage() {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [programId, setProgramId] = useState("all");
  const [region, setRegion] = useState("all");
  const [country, setCountry] = useState("all");
  const [myGpa, setMyGpa] = useState("any");
  const [englishOnly, setEnglishOnly] = useState(false);
  const [housingOnly, setHousingOnly] = useState(false);

  const regions = useMemo(() => schoolRegions(), []);
  const countries = useMemo(() => schoolCountries(), []);

  const filtered = useMemo(
    () =>
      partnerSchools.filter((s) => {
        if (!s.active) return false;
        if (programId !== "all" && s.programId !== programId) return false;
        if (region !== "all" && s.region !== region) return false;
        if (country !== "all" && s.country !== country) return false;
        if (myGpa !== "any" && s.gpaMin > Number(myGpa)) return false;
        if (englishOnly && !s.englishTaught) return false;
        if (housingOnly && !s.housingProvided) return false;
        if (
          query &&
          !`${s.name.zh} ${s.name.en ?? ""} ${s.country}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
          return false;
        return true;
      }),
    [programId, region, country, myGpa, englishOnly, housingOnly, query]
  );

  const totalQuota = filtered.reduce((sum, s) => sum + s.quota, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Partner schools</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Filter by the GPA you actually have and see only the schools you can
          realistically be nominated to. Quotas are per term and reset with each
          bulletin.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        {/* Filters */}
        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <div className="space-y-2">
            <Label htmlFor="school-search">Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="school-search"
                placeholder="School or country…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Program</Label>
            <Select value={programId} onValueChange={setProgramId}>
              <SelectTrigger className="w-full">
                <SelectValue />
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

          <div className="space-y-2">
            <Label>Region</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-full">
                <Globe2 className="size-4 text-muted-foreground" />
                <SelectValue />
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

          <div className="space-y-2">
            <Label>Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger className="w-full">
                <MapPin className="size-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All countries</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>My GPA is at least</Label>
            <Select value={myGpa} onValueChange={setMyGpa}>
              <SelectTrigger className="w-full">
                <GraduationCap className="size-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {gpaSteps.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g === "any" ? "Show all schools" : g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 rounded-lg border p-3">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="english-only" className="text-sm font-normal">
                English-taught only
              </Label>
              <Switch
                id="english-only"
                checked={englishOnly}
                onCheckedChange={setEnglishOnly}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="housing-only" className="text-sm font-normal">
                Housing provided
              </Label>
              <Switch
                id="housing-only"
                checked={housingOnly}
                onCheckedChange={setHousingOnly}
              />
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            {filtered.length} school{filtered.length === 1 ? "" : "s"} ·{" "}
            {totalQuota} places per term
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((s) => {
              const program = getProgram(s.programId);
              return (
                <Link key={s.id} href={`/schools/${s.id}`} className="group">
                  <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
                    <CardHeader>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        {program && (
                          <EnumBadge value={program.type} meta={programTypeMeta} />
                        )}
                        <Badge variant="outline" className="font-normal">
                          {s.region}
                        </Badge>
                      </div>
                      <CardTitle className="text-base leading-snug group-hover:text-primary">
                        {t(s.name)}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {s.country}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <dl className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="size-3" />
                            Quota / term
                          </dt>
                          <dd className="font-semibold tabular-nums">{s.quota}</dd>
                        </div>
                        <div>
                          <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                            <GraduationCap className="size-3" />
                            Min GPA
                          </dt>
                          <dd className="font-semibold tabular-nums">
                            {s.gpaMin.toFixed(1)}
                          </dd>
                        </div>
                      </dl>
                      <div className="flex flex-wrap gap-1.5">
                        {s.languageReq.map((r) => (
                          <Badge
                            key={r.test}
                            variant="secondary"
                            className="gap-1 font-normal"
                          >
                            <Languages className="size-3" />
                            {r.test} {r.score}
                          </Badge>
                        ))}
                        {s.housingProvided && (
                          <Badge variant="secondary" className="gap-1 font-normal">
                            <BedDouble className="size-3" />
                            Housing
                          </Badge>
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
              <p className="font-medium">No school matches these filters.</p>
              <p className="mt-1 text-sm">
                Try widening the GPA threshold or clearing the region filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
