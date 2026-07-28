"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  ShieldX,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/page-header";
import { EnumBadge } from "@/components/shared/enum-badge";
import {
  getMediaFile,
  getPartnerSchool,
  testimonialStatusMeta,
  testimonials,
} from "@/lib/mock";

const statusTabs = ["all", "published", "draft", "archived"] as const;

export default function AdminTestimonialsPage() {
  const [status, setStatus] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      testimonials
        .filter((t) => {
          if (status !== "all" && t.status !== status) return false;
          if (
            query &&
            !`${t.displayName} ${t.deptYear} ${t.country} ${t.termLabel}`
              .toLowerCase()
              .includes(query.toLowerCase())
          )
            return false;
          return true;
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [status, query]
  );

  const awaitingConsent = testimonials.filter((t) => !t.consentGiven).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Testimonials"
        description={`Student reports collected after each term. A report cannot be published until the student has given consent${
          awaitingConsent > 0 ? ` — ${awaitingConsent} still waiting` : ""
        }.`}
      >
        <Button>
          <Plus className="size-4" />
          Add testimonial
        </Button>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={status} onValueChange={setStatus}>
          <TabsList>
            {statusTabs.map((s) => (
              <TabsTrigger key={s} value={s}>
                {s === "all" ? "All" : testimonialStatusMeta[s].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search author, school, term…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 sm:w-64"
          />
        </div>
      </div>

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Author</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Highlights</TableHead>
                <TableHead>Consent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((story) => {
                const school = getPartnerSchool(story.partnerSchoolId);
                const fullText = getMediaFile(story.fullTextFileId);
                const publishable = story.consentGiven;

                return (
                  <TableRow key={story.id}>
                    <TableCell className="pl-6">
                      <p className="font-medium">{story.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {story.deptYear}
                      </p>
                    </TableCell>
                    <TableCell className="max-w-48 text-sm text-muted-foreground">
                      <span className="block truncate">
                        {school ? school.name.zh : "—"}
                      </span>
                      <span className="block text-xs">{story.country}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {story.termLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-64">
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate">
                          {story.highlights.length} lines · {story.highlights[0]}
                        </span>
                        {fullText && (
                          <Paperclip className="size-3 shrink-0" />
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      {story.consentGiven ? (
                        <Badge
                          variant="outline"
                          className="gap-1 border-emerald-200 bg-emerald-100 font-medium text-emerald-800"
                        >
                          <ShieldCheck className="size-3" />
                          Given
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="gap-1 border-amber-200 bg-amber-100 font-medium text-amber-800"
                        >
                          <ShieldX className="size-3" />
                          Waiting
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <EnumBadge
                        value={story.status}
                        meta={testimonialStatusMeta}
                      />
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Pencil className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          {story.status === "published" ? (
                            <DropdownMenuItem asChild>
                              <Link href={`/testimonials/${story.id}`}>
                                <ExternalLink className="size-4" />
                                View on site
                              </Link>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem disabled={!publishable}>
                              <ShieldCheck className="size-4" />
                              {publishable
                                ? "Publish"
                                : "Consent required to publish"}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive">
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No testimonials match your filters.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
