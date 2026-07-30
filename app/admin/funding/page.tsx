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
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { BilingualField } from "@/components/admin/bilingual-field";
import { PageHeader } from "@/components/admin/page-header";
import { EnumBadge } from "@/components/shared/enum-badge";
import {
  formatApplyMonths,
  formatTwd,
  fundingSourceMeta,
  fundingStatusMeta,
  fundings,
  getMediaFile,
  getProgram,
  programs,
} from "@/lib/mock";
import { OPEN_STATUS_TABS } from "@/constant";

export default function AdminFundingPage() {
  const [status, setStatus] = useState<string>("all");
  const [source, setSource] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      fundings.filter((f) => {
        if (status !== "all" && f.status !== status) return false;
        if (source !== "all" && f.source !== source) return false;
        if (
          query &&
          !`${f.name.zh} ${f.name.en ?? ""} ${f.contactName}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
          return false;
        return true;
      }),
    [status, source, query]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Funding"
        description="Grants and scholarships. A funding row without a program applies to any student — use that for external awards like Fulbright."
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              New funding
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>New funding</DialogTitle>
              <DialogDescription>
                Eligibility and notes are shown verbatim on the public page, so
                write them the way you would answer at the counter.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <BilingualField
                id="funding-name"
                label="Name"
                value={{ zh: "", en: "" }}
                placeholderZh="例如：學海飛颺"
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select defaultValue="moe">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        Object.keys(
                          fundingSourceMeta
                        ) as (keyof typeof fundingSourceMeta)[]
                      ).map((s) => (
                        <SelectItem key={s} value={s}>
                          {fundingSourceMeta[s].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Program</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Any program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name.en ?? p.name.zh}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="funding-amount">Max amount (TWD)</Label>
                  <Input id="funding-amount" type="number" placeholder="120000" />
                </div>
              </div>
              <BilingualField
                id="funding-eligibility"
                label="Eligibility"
                value={{ zh: "", en: "" }}
                multiline
                rows={3}
              />
              <div className="space-y-2">
                <Label htmlFor="funding-docs">
                  Required documents (one per line)
                </Label>
                <Textarea
                  id="funding-docs"
                  rows={4}
                  placeholder={"Application form\nTranscript\nStudy plan"}
                />
              </div>
              <BilingualField
                id="funding-notes"
                label="Notes"
                value={{ zh: "", en: "" }}
                multiline
                rows={3}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="funding-months">Apply months</Label>
                  <Input id="funding-months" placeholder="3, 9" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="funding-contact">Contact name</Label>
                  <Input id="funding-contact" placeholder="Chen Yi-Ling" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="funding-email">Contact email</Label>
                  <Input
                    id="funding-email"
                    type="email"
                    placeholder="ylchen@thu.edu.tw"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={status} onValueChange={setStatus}>
          <TabsList>
            {OPEN_STATUS_TABS.map((s) => (
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
              className="w-full pl-8 sm:w-52"
            />
          </div>
          <Select value={source} onValueChange={setSource}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {(
                Object.keys(fundingSourceMeta) as (keyof typeof fundingSourceMeta)[]
              ).map((s) => (
                <SelectItem key={s} value={s}>
                  {fundingSourceMeta[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Funding</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Program</TableHead>
                <TableHead className="text-right">Max</TableHead>
                <TableHead>Apply in</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((funding) => {
                const program = funding.programId
                  ? getProgram(funding.programId)
                  : null;
                const form = getMediaFile(funding.formFileId);

                return (
                  <TableRow key={funding.id}>
                    <TableCell className="max-w-64 pl-6">
                      <p className="truncate font-medium">{funding.name.zh}</p>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="truncate">
                          {funding.name.en ?? "— no English name —"}
                        </span>
                        {form && <Paperclip className="size-3 shrink-0" />}
                      </span>
                    </TableCell>
                    <TableCell>
                      <EnumBadge value={funding.source} meta={fundingSourceMeta} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {program ? program.name.en ?? program.name.zh : "Any"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatTwd(funding.amountMax)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatApplyMonths(funding.applyMonths)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {funding.contactName}
                    </TableCell>
                    <TableCell>
                      <EnumBadge value={funding.status} meta={fundingStatusMeta} />
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
                          <DropdownMenuItem asChild>
                            <Link href={`/funding/${funding.id}`}>
                              <ExternalLink className="size-4" />
                              View on site
                            </Link>
                          </DropdownMenuItem>
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
              No funding matches your filters.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
