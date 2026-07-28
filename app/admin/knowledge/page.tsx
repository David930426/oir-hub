"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Eye,
  MoreHorizontal,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
import { PageHeader } from "@/components/admin/page-header";
import { EnumBadge, ToneDot } from "@/components/shared/enum-badge";
import {
  chunkCountForDocument,
  kbDocuments,
  kbSourceLabel,
  kbSourceTableMeta,
  kbStatusMeta,
} from "@/lib/mock";
import type { KbStatus } from "@/lib/mock";

const statusTabs = ["all", "indexed", "pending", "stale", "failed"] as const;

export default function AdminKnowledgePage() {
  const [status, setStatus] = useState<string>("all");
  const [sourceTable, setSourceTable] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      kbDocuments.filter((d) => {
        if (status !== "all" && d.status !== status) return false;
        if (sourceTable !== "all" && d.sourceTable !== sourceTable) return false;
        if (query && !d.title.toLowerCase().includes(query.toLowerCase()))
          return false;
        return true;
      }),
    [status, sourceTable, query]
  );

  const counts = useMemo(() => {
    const base: Record<KbStatus, number> = {
      indexed: 0,
      pending: 0,
      stale: 0,
      failed: 0,
    };
    for (const doc of kbDocuments) base[doc.status] += 1;
    return base;
  }, []);

  const totalChunks = kbDocuments.reduce(
    (sum, d) => sum + chunkCountForDocument(d.id),
    0
  );
  const failed = kbDocuments.filter((d) => d.status === "failed");

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Knowledge index"
        description="Documents derived from FAQs, posts, bulletins, testimonials, and files, then split into chunks the assistant retrieves. Nothing here is authored directly — fix the source row instead."
      >
        <Button variant="outline">
          <RefreshCcw className="size-4" />
          Re-index everything
        </Button>
      </PageHeader>

      {failed.length > 0 && (
        <Alert className="border-red-200 bg-red-50 text-red-900">
          <AlertTriangle className="size-4" />
          <AlertDescription className="text-red-900/80">
            {failed.length} document{failed.length === 1 ? "" : "s"} failed to
            index and {failed.length === 1 ? "is" : "are"} invisible to the
            assistant — {failed[0].title}
            {failed.length > 1 && ` and ${failed.length - 1} more`}.
          </AlertDescription>
        </Alert>
      )}

      {/* Pipeline health */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Documents</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {kbDocuments.length}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {counts.indexed} live in the index
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Chunks</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{totalChunks}</CardTitle>
            <p className="text-xs text-muted-foreground">
              multilingual-e5-base embeddings
            </p>
          </CardHeader>
        </Card>
        <Card className="sm:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Index status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(Object.keys(kbStatusMeta) as KbStatus[]).map((s) => (
              <div key={s} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <ToneDot tone={kbStatusMeta[s].tone} label={kbStatusMeta[s].label} />
                  <span className="tabular-nums text-muted-foreground">
                    {counts[s]}
                  </span>
                </div>
                <Progress value={(counts[s] / kbDocuments.length) * 100} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={status} onValueChange={setStatus}>
          <TabsList>
            {statusTabs.map((s) => (
              <TabsTrigger key={s} value={s}>
                {s === "all" ? "All" : kbStatusMeta[s].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 sm:w-56"
            />
          </div>
          <Select value={sourceTable} onValueChange={setSourceTable}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {(
                Object.keys(kbSourceTableMeta) as (keyof typeof kbSourceTableMeta)[]
              ).map((s) => (
                <SelectItem key={s} value={s}>
                  {kbSourceTableMeta[s].label}
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
                <TableHead className="pl-6">Document</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Lang</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="text-right">Chunks</TableHead>
                <TableHead className="text-right">Ver</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Indexed</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((doc) => {
                const chunks = chunkCountForDocument(doc.id);
                return (
                  <TableRow key={doc.id}>
                    <TableCell className="max-w-72 pl-6">
                      <Link
                        href={`/admin/knowledge/${doc.id}`}
                        className="block truncate font-medium hover:text-primary"
                      >
                        {doc.title}
                      </Link>
                      <span className="block truncate text-xs text-muted-foreground">
                        from {kbSourceLabel(doc.id)}
                      </span>
                      {doc.errorMessage && (
                        <span className="mt-0.5 block truncate text-xs text-red-700">
                          {doc.errorMessage}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <EnumBadge
                        value={doc.sourceTable}
                        meta={kbSourceTableMeta}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {doc.language}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {doc.academicYear ?? "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {chunks || "—"}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      v{doc.version}
                    </TableCell>
                    <TableCell>
                      <EnumBadge value={doc.status} meta={kbStatusMeta} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {doc.indexedAt ?? "—"}
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
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/knowledge/${doc.id}`}>
                              <Eye className="size-4" />
                              Inspect chunks
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCcw className="size-4" />
                            {doc.status === "failed" ? "Retry" : "Re-index"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive">
                            <Trash2 className="size-4" />
                            Remove from index
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
              No documents match your filters.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
