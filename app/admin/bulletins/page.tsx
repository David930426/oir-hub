"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { BilingualField } from "@/components/admin/bilingual-field";
import { PageHeader } from "@/components/admin/page-header";
import { DeadlineBadge, EnumBadge } from "@/components/shared/enum-badge";
import {
  bulletinStatusMeta,
  bulletins,
  formatTerm,
  getMediaFile,
  getProgram,
  mediaFiles,
  programs,
} from "@/lib/mock";

const statusTabs = ["all", "open", "closed", "archived"] as const;

export default function AdminBulletinsPage() {
  const [status, setStatus] = useState<string>("all");
  const [programId, setProgramId] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      bulletins
        .filter((b) => {
          if (status !== "all" && b.status !== status) return false;
          if (programId !== "all" && b.programId !== programId) return false;
          if (
            query &&
            !`${b.title.zh} ${b.title.en ?? ""} ${b.academicYear} ${b.region}`
              .toLowerCase()
              .includes(query.toLowerCase())
          )
            return false;
          return true;
        })
        .sort((a, b) => b.announcedAt.localeCompare(a.announcedAt)),
    [status, programId, query]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Bulletins"
        description="Selection calls (簡章). Each one belongs to a program and a term, and carries the PDF that is legally binding for that round."
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              New bulletin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>New bulletin</DialogTitle>
              <DialogDescription>
                Publishing an open bulletin queues it for the knowledge index, so
                the assistant can answer questions about it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <BilingualField
                id="bulletin-title"
                label="Title"
                value={{ zh: "", en: "" }}
                placeholderZh="例如：115學年度第2學期交換學生甄選簡章（全球）"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Program</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select program" />
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
                  <Label htmlFor="bulletin-region">Region</Label>
                  <Input id="bulletin-region" placeholder="global / japan-korea" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="bulletin-year">Academic year</Label>
                  <Input id="bulletin-year" placeholder="115" />
                </div>
                <div className="space-y-2">
                  <Label>Term</Label>
                  <Select defaultValue="1">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bulletin-announced">Announced</Label>
                  <Input id="bulletin-announced" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bulletin-deadline">Deadline</Label>
                  <Input id="bulletin-deadline" type="date" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select defaultValue="open">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        Object.keys(
                          bulletinStatusMeta
                        ) as (keyof typeof bulletinStatusMeta)[]
                      ).map((s) => (
                        <SelectItem key={s} value={s}>
                          {bulletinStatusMeta[s].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>PDF from media library</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Attach later" />
                    </SelectTrigger>
                    <SelectContent>
                      {mediaFiles
                        .filter((m) => !m.archived && m.mimeType.includes("pdf"))
                        .map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.filename} (v{m.version})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
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
              className="w-full pl-8 sm:w-52"
            />
          </div>
          <Select value={programId} onValueChange={setProgramId}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All programs</SelectItem>
              {programs.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name.en ?? p.name.zh}
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
                <TableHead className="pl-6">Bulletin</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((bulletin) => {
                const program = getProgram(bulletin.programId);
                const pdf = getMediaFile(bulletin.pdfFileId);

                return (
                  <TableRow key={bulletin.id}>
                    <TableCell className="max-w-72 pl-6">
                      <p className="truncate font-medium">{bulletin.title.zh}</p>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        {pdf ? (
                          <span className="flex items-center gap-1">
                            <Paperclip className="size-3" />
                            {pdf.filename} v{pdf.version}
                          </span>
                        ) : (
                          <span className="text-amber-700">No PDF attached</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {program ? program.name.en ?? program.name.zh : "—"}
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-accent px-2 py-0.5 font-mono text-xs text-accent-foreground">
                        {formatTerm(bulletin.academicYear, bulletin.term)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {bulletin.region}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <EnumBadge
                        value={bulletin.status}
                        meta={bulletinStatusMeta}
                      />
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{bulletin.deadlineAt}</p>
                      {bulletin.status === "open" && (
                        <DeadlineBadge date={bulletin.deadlineAt} />
                      )}
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
                            <Link href={`/bulletins/${bulletin.id}`}>
                              <ExternalLink className="size-4" />
                              View on site
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCcw className="size-4" />
                            Re-index for the assistant
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
              No bulletins match your filters.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
