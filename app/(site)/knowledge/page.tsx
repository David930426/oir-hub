"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, FileText, Paperclip, School, Search } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  knowledgeCategories,
  knowledgeDocs,
  partnerSchools,
} from "@/lib/mock-data";

export default function KnowledgePage() {
  const [category, setCategory] = useState("all");
  const [school, setSchool] = useState("All Schools");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return knowledgeDocs.filter((doc) => {
      if (category !== "all" && doc.category !== category) return false;
      if (school !== "All Schools" && doc.school !== school && doc.school !== "All Schools")
        return false;
      if (
        query &&
        !`${doc.title} ${doc.summary}`.toLowerCase().includes(query.toLowerCase())
      )
        return false;
      return true;
    });
  }, [category, school, query]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Official guides for studying abroad, reviewed by OIR staff. Filter by
          the school you are applying to — you&apos;ll only see the documents and
          requirements relevant to that school.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={category} onValueChange={setCategory} className="overflow-x-auto">
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="all">All</TabsTrigger>
            {knowledgeCategories.map((c) => (
              <TabsTrigger key={c.slug} value={c.name}>
                {c.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search articles…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 sm:w-56"
            />
          </div>
          <Select value={school} onValueChange={setSchool}>
            <SelectTrigger className="w-full sm:w-64">
              <School className="size-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by school" />
            </SelectTrigger>
            <SelectContent>
              {partnerSchools.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {filtered.length} article{filtered.length === 1 ? "" : "s"} found
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((doc) => (
          <Link key={doc.id} href={`/knowledge/${doc.id}`} className="group">
            <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
              <CardHeader>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{doc.category}</Badge>
                  {doc.school !== "All Schools" && (
                    <Badge variant="outline" className="max-w-56 truncate">
                      {doc.school}
                    </Badge>
                  )}
                </div>
                <CardTitle className="flex items-start gap-2 text-base leading-snug group-hover:text-primary">
                  <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  {doc.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">{doc.summary}</CardDescription>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="size-3.5" />
                    Updated {doc.updatedAt}
                  </span>
                  {doc.attachments.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Paperclip className="size-3.5" />
                      {doc.attachments.length} attachment
                      {doc.attachments.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          <p className="font-medium">No articles match your filters.</p>
          <p className="mt-1 text-sm">Try a different category or school.</p>
        </div>
      )}
    </div>
  );
}
