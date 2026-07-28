"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  Download,
  History,
  MoreHorizontal,
  Search,
  Trash2,
  Upload,
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { formatBytes, getUser, mediaFiles } from "@/lib/mock";

/** Short kind label derived from `mimeType`. */
function kindOf(mimeType: string) {
  if (mimeType.includes("pdf")) return "PDF";
  if (mimeType.includes("wordprocessingml")) return "DOCX";
  if (mimeType.includes("spreadsheetml")) return "XLSX";
  return "FILE";
}

export default function AdminMediaPage() {
  const [query, setQuery] = useState("");
  const [academicYear, setAcademicYear] = useState("all");
  const [showArchived, setShowArchived] = useState(false);

  const years = useMemo(
    () =>
      Array.from(
        new Set(mediaFiles.map((m) => m.academicYear).filter(Boolean))
      ).sort() as string[],
    []
  );

  const filtered = useMemo(
    () =>
      mediaFiles
        .filter((m) => {
          if (!showArchived && m.archived) return false;
          if (academicYear !== "all" && m.academicYear !== academicYear)
            return false;
          if (query && !m.filename.toLowerCase().includes(query.toLowerCase()))
            return false;
          return true;
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [query, academicYear, showArchived]
  );

  const archivedCount = mediaFiles.filter((m) => m.archived).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Media library"
        description="Every uploaded file. Re-uploading a file bumps its version and archives the previous one, so an old bulletin PDF can never be served by mistake."
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Upload className="size-4" />
              Upload file
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload a file</DialogTitle>
              <DialogDescription>
                PDF, DOCX, or XLSX up to 20 MB. Tag it with the academic year so
                the assistant can filter by freshness.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
                Drag a file here or click to browse
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="upload-year">Academic year</Label>
                  <Input id="upload-year" placeholder="115-2" />
                </div>
                <div className="space-y-2">
                  <Label>Replaces</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Nothing — new file" />
                    </SelectTrigger>
                    <SelectContent>
                      {mediaFiles
                        .filter((m) => !m.archived)
                        .map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.filename} (v{m.version})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Choosing a file to replace archives that version and bumps the
                version number by one.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Upload</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
          <Label htmlFor="show-archived" className="text-sm font-normal">
            Show archived
            <span className="ml-1 text-xs text-muted-foreground tabular-nums">
              ({archivedCount})
            </span>
          </Label>
          <Switch
            id="show-archived"
            checked={showArchived}
            onCheckedChange={setShowArchived}
          />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search filename…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 sm:w-56"
            />
          </div>
          <Select value={academicYear} onValueChange={setAcademicYear}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Academic year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
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
                <TableHead className="pl-6">File</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="text-right">Version</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead>Uploaded by</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((file) => {
                const uploader = getUser(file.uploadedById);
                return (
                  <TableRow key={file.id} className={file.archived ? "opacity-60" : ""}>
                    <TableCell className="max-w-80 pl-6">
                      <p className="truncate font-medium">{file.filename}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {file.storagePath}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {kindOf(file.mimeType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {file.academicYear ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="flex items-center justify-end gap-1.5">
                        <span className="tabular-nums">v{file.version}</span>
                        {file.archived && (
                          <Badge
                            variant="outline"
                            className="border-slate-200 bg-slate-100 px-1.5 text-[10px] text-slate-700"
                          >
                            Archived
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatBytes(file.sizeBytes)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {uploader?.name.split(" ")[0] ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {file.createdAt}
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
                            <Download className="size-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Upload className="size-4" />
                            Upload new version
                          </DropdownMenuItem>
                          {file.replacesId && (
                            <DropdownMenuItem>
                              <History className="size-4" />
                              View previous version
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {!file.archived && (
                            <DropdownMenuItem>
                              <Archive className="size-4" />
                              Archive
                            </DropdownMenuItem>
                          )}
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
              No files match your filters.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
