"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Paperclip, Pin, UserRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryBadge } from "@/components/site/category-badge";
import { announcements } from "@/lib/mock-data";

const categories = ["All", "Announcement", "Scholarship", "News"] as const;

export default function AnnouncementsPage() {
  const [category, setCategory] = useState<string>("All");

  const filtered = useMemo(
    () =>
      category === "All"
        ? announcements
        : announcements.filter((a) => a.category === category),
    [category]
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        <p className="mt-2 text-muted-foreground">
          Official OIR news — scholarship calls, application deadlines, and
          program updates, published here first.
        </p>
      </div>

      <Tabs value={category} onValueChange={setCategory} className="mb-6">
        <TabsList>
          {categories.map((c) => (
            <TabsTrigger key={c} value={c}>
              {c === "All" ? "All" : `${c}s`}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {filtered.map((a) => (
          <Link key={a.id} href={`/announcements/${a.id}`} className="group block">
            <Card className="py-5 transition-all group-hover:border-primary/40 group-hover:shadow-sm">
              <CardContent className="px-5">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {a.pinned && (
                    <span className="flex items-center gap-1 text-xs font-medium text-primary">
                      <Pin className="size-3.5" />
                      Pinned
                    </span>
                  )}
                  <CategoryBadge category={a.category} />
                </div>
                <h2 className="text-lg font-semibold leading-snug group-hover:text-primary">
                  {a.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {a.summary}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <UserRound className="size-3.5" />
                    {a.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays className="size-3.5" />
                    {a.publishedAt}
                  </span>
                  {a.attachments.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Paperclip className="size-3.5" />
                      {a.attachments.length} attachment
                      {a.attachments.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Pagination className="mt-10">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
