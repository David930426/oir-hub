"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { MEDIA_MIME_LABELS } from "@/constant";
import { formatBytes } from "@/lib/utils";
import { MediaRowActions } from "./media-row-actions";

/** A media file as the table needs it, with dates already formatted. */
export type MediaRow = {
  id: string;
  filename: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  academicYear: string | null;
  version: number;
  archived: boolean;
  replacesId: string | null;
  uploadedBy: string | null;
  createdAt: string;
  usage: number;
};

/** Short kind label from the MIME type — "PDF", "DOCX", … */
function kindOf(mimeType: string): string {
  return MEDIA_MIME_LABELS[mimeType] ?? "FILE";
}

export function mediaColumns(canWrite: boolean): ColumnDef<MediaRow>[] {
  return [
    {
      id: "file",
      accessorFn: (row) => `${row.filename} ${row.storagePath}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="File"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <div className="max-w-80">
          <p className="truncate font-medium">{row.original.filename}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {row.original.storagePath}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "mimeType",
      header: "Type",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-[10px]">
          {kindOf(row.original.mimeType)}
        </Badge>
      ),
    },
    {
      accessorKey: "academicYear",
      header: "Year",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.academicYear ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "version",
      enableGlobalFilter: false,
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Version"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="ml-auto -mr-2"
        />
      ),
      cell: ({ row }) => (
        <span className="flex items-center justify-end gap-1.5">
          <span className="tabular-nums">v{row.original.version}</span>
          {row.original.archived && (
            <Badge
              variant="outline"
              className="border-slate-200 bg-slate-100 px-1.5 text-[10px] text-slate-700"
            >
              Archived
            </Badge>
          )}
        </span>
      ),
    },
    {
      accessorKey: "sizeBytes",
      enableGlobalFilter: false,
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Size"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="ml-auto -mr-2"
        />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {formatBytes(row.original.sizeBytes)}
        </span>
      ),
    },
    {
      accessorKey: "uploadedBy",
      header: "Uploaded by",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.uploadedBy?.split(" ")[0] ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      enableGlobalFilter: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Date"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.createdAt}</span>
      ),
    },
    // Hidden: the "Show archived" switch filters on it, and the version cell
    // already carries the badge, so it needs no column of its own.
    {
      accessorKey: "archived",
      header: "Archived",
      enableGlobalFilter: false,
      filterFn: "equals",
      cell: ({ row }) => (row.original.archived ? "Yes" : "No"),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableGlobalFilter: false,
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) => <MediaRowActions file={row.original} canWrite={canWrite} />,
    },
  ];
}
