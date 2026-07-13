"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  RefreshCcw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import { StatusBadge } from "@/components/admin/badges";
import {
  adminDocuments,
  knowledgeCategories,
  partnerSchools,
} from "@/lib/mock-data";

const statusFilters = ["All", "READY", "PROCESSING", "PENDING", "FAILED"] as const;

export default function AdminDocumentsPage() {
  const [status, setStatus] = useState<string>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      adminDocuments.filter((d) => {
        if (status !== "All" && d.status !== status) return false;
        if (
          query &&
          !`${d.title} ${d.filename}`.toLowerCase().includes(query.toLowerCase())
        )
          return false;
        return true;
      }),
    [status, query]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Knowledge base sources used by the RAG chatbot.
          </p>
        </div>

        {/* Upload dialog (static) */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Upload className="size-4" />
              Upload document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload a new document</DialogTitle>
              <DialogDescription>
                PDF, DOCX, or XLSX up to 20 MB. The document is chunked and
                embedded automatically after upload.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
                Drag a file here or click to browse
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {knowledgeCategories.map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>School</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select school" />
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
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={status} onValueChange={setStatus}>
          <TabsList>
            {statusFilters.map((s) => (
              <TabsTrigger key={s} value={s}>
                {s === "All" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents…"
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
                <TableHead className="pl-6">Document</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Chunks</TableHead>
                <TableHead>Uploaded by</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="max-w-72 pl-6">
                    <Link
                      href={`/admin/documents/${d.id}`}
                      className="block truncate font-medium hover:text-primary"
                    >
                      {d.title}
                    </Link>
                    <span className="block truncate text-xs text-muted-foreground">
                      {d.filename} · {d.size}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{d.category}</TableCell>
                  <TableCell>
                    <StatusBadge status={d.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {d.chunks || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{d.uploadedBy}</TableCell>
                  <TableCell className="text-muted-foreground">{d.uploadedAt}</TableCell>
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
                          <Link href={`/admin/documents/${d.id}`}>
                            <Eye className="size-4" />
                            Inspect chunks
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/documents/${d.id}/edit`}>
                            <Pencil className="size-4" />
                            Edit chunks
                          </Link>
                        </DropdownMenuItem>
                        {d.status === "FAILED" && (
                          <DropdownMenuItem>
                            <RefreshCcw className="size-4" />
                            Retry processing
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
              ))}
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
