"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Quote, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
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
import { useLocale } from "@/components/site/locale-provider";
import type { Localized } from "@/lib/i18n";

/**
 * One published report as the list shows it.
 *
 * The school name is resolved by the server component rather than looked up
 * here: the page already joins it, and carrying the name means the search box
 * can match on it without a second table travelling to the browser.
 */
export type SiteTestimonial = {
  id: string;
  displayName: string;
  deptYear: string;
  country: string;
  termLabel: string;
  highlights: string[];
  schoolName: Localized | null;
};

export function TestimonialsView({ all }: { all: SiteTestimonial[] }) {
  const { t } = useLocale();

  const [country, setCountry] = useState("all");
  const [term, setTerm] = useState("all");
  const [query, setQuery] = useState("");

  const countries = useMemo(
    () => Array.from(new Set(all.map((s) => s.country))).sort(),
    [all]
  );
  const terms = useMemo(
    () => Array.from(new Set(all.map((s) => s.termLabel))).sort().reverse(),
    [all]
  );

  const filtered = useMemo(
    () =>
      all.filter((s) => {
        if (country !== "all" && s.country !== country) return false;
        if (term !== "all" && s.termLabel !== term) return false;
        if (query) {
          const haystack = `${s.displayName} ${s.deptYear} ${s.highlights.join(" ")} ${
            s.schoolName ? `${s.schoolName.zh} ${s.schoolName.en ?? ""}` : ""
          }`.toLowerCase();
          if (!haystack.includes(query.toLowerCase())) return false;
        }
        return true;
      }),
    [all, country, term, query]
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Student testimonials</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Reports written by students after they returned, published only with
          their consent. Names may be shortened at the author&apos;s request.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by school or topic…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 sm:w-64"
          />
        </div>
        <div className="flex gap-3">
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger className="w-full sm:w-44">
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
          <Select value={term} onValueChange={setTerm}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All terms</SelectItem>
              {terms.map((tm) => (
                <SelectItem key={tm} value={tm}>
                  {tm}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {filtered.length} report{filtered.length === 1 ? "" : "s"}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((story) => {
          const school = story.schoolName;
          return (
            <Link
              key={story.id}
              href={`/testimonials/${story.id}`}
              className="group"
            >
              <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
                <CardHeader>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="font-normal">
                      {story.country}
                    </Badge>
                    <Badge variant="outline" className="font-mono text-xs">
                      {story.termLabel}
                    </Badge>
                  </div>
                  <CardTitle className="flex items-start gap-2 text-base leading-snug group-hover:text-primary">
                    <Quote className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    {school ? t(school) : "—"}
                  </CardTitle>
                  <CardDescription>
                    {story.displayName} · {story.deptYear}
                  </CardDescription>
                  <ul className="mt-3 space-y-1.5">
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
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          <p className="font-medium">No testimonial matches your filters.</p>
          <p className="mt-1 text-sm">Try another country or term.</p>
        </div>
      )}
    </div>
  );
}
