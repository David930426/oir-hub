"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Languages } from "lucide-react";
import { DeadlineBadge, EnumBadge } from "@/components/shared/enum-badge";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { bulletinStatusMeta } from "@/lib/mock/labels";
import type { BulletinStatusValue } from "@/lib/validator/bulletin.validator";
import { BulletinRowActions } from "./bulletin-row-actions";

/** One bulletin as the table needs it, with dates already formatted. */
export type BulletinRow = {
  id: string;
  titleZh: string;
  titleEn: string | null;
  programName: string | null;
  academicYear: string;
  term: string;
  region: string;
  hasPdf: boolean;
  pdfFilename: string | null;
  announcedAt: string;
  deadlineAt: string;
  status: BulletinStatusValue;
};

export function bulletinColumns(canWrite: boolean): ColumnDef<BulletinRow>[] {
  return [
    {
      id: "bulletin",
      accessorFn: (row) =>
        `${row.titleZh} ${row.titleEn ?? ""} ${row.programName ?? ""} ${row.region}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Bulletin"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <div className="min-w-0 max-w-96">
          <p className="truncate text-sm font-medium">{row.original.titleZh}</p>
          <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{row.original.programName ?? "—"}</span>
            <span>·</span>
            <span>{row.original.region}</span>
            {row.original.hasPdf ? (
              <span className="flex items-center gap-1">
                <FileText className="size-3" />
                PDF
              </span>
            ) : (
              // The PDF is what students actually apply from, so a call without
              // one is worth flagging rather than leaving blank.
              <span className="text-amber-700">No PDF yet</span>
            )}
            {!row.original.titleEn && (
              <span className="flex items-center gap-1 text-amber-700">
                <Languages className="size-3" />
                EN missing
              </span>
            )}
          </span>
        </div>
      ),
    },
    {
      id: "term",
      accessorFn: (row) => `${row.academicYear}-${row.term}`,
      header: "Term",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {row.original.academicYear}-{row.original.term}
        </span>
      ),
    },
    {
      accessorKey: "announcedAt",
      enableGlobalFilter: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Announced"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.announcedAt}
        </span>
      ),
    },
    {
      accessorKey: "deadlineAt",
      enableGlobalFilter: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Deadline"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="text-sm tabular-nums">{row.original.deadlineAt}</p>
          {row.original.status === "open" && (
            <DeadlineBadge date={row.original.deadlineAt} />
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <EnumBadge value={row.original.status} meta={bulletinStatusMeta} />
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableGlobalFilter: false,
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) =>
        canWrite ? <BulletinRowActions bulletin={row.original} /> : null,
    },
  ];
}
