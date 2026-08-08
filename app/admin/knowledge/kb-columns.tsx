"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { EnumBadge } from "@/components/shared/enum-badge";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { kbSourceTableMeta, kbStatusMeta } from "@/lib/mock/labels";
import type {
  KbSourceTableValue,
} from "@/lib/validator/knowledge.validator";
import type { KbStatusValue } from "@/lib/repositories/knowledge.repository";
import { KbRowActions } from "./kb-row-actions";

/** One indexed document as the table needs it. */
export type KbDocumentRow = {
  id: string;
  sourceTable: KbSourceTableValue;
  sourceId: string;
  title: string;
  academicYear: string | null;
  version: number;
  status: KbStatusValue;
  errorMessage: string | null;
  chunkCount: number;
  indexedAt: string | null;
};

export function kbColumns(canWrite: boolean): ColumnDef<KbDocumentRow>[] {
  return [
    {
      id: "document",
      accessorFn: (row) => `${row.title} ${row.sourceTable}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Document"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <div className="min-w-0 max-w-96">
          <p className="truncate text-sm font-medium">{row.original.title}</p>
          <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>v{row.original.version}</span>
            {row.original.academicYear && <span>{row.original.academicYear}</span>}
            {/* The reason a failed document failed is the only thing that makes
                the row actionable, so it is shown rather than hidden in a log. */}
            {row.original.errorMessage && (
              <span className="truncate text-red-700">
                {row.original.errorMessage}
              </span>
            )}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "sourceTable",
      header: "Source",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <EnumBadge value={row.original.sourceTable} meta={kbSourceTableMeta} />
      ),
    },
    {
      accessorKey: "chunkCount",
      enableGlobalFilter: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Chunks"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-muted-foreground">
          {row.original.chunkCount}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <EnumBadge value={row.original.status} meta={kbStatusMeta} />
      ),
    },
    {
      accessorKey: "indexedAt",
      enableGlobalFilter: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Indexed"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) =>
        row.original.indexedAt ? (
          <span className="text-sm text-muted-foreground">
            {row.original.indexedAt}
          </span>
        ) : (
          <Badge variant="outline" className="font-normal">
            Never
          </Badge>
        ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableGlobalFilter: false,
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) =>
        canWrite ? <KbRowActions document={row.original} /> : null,
    },
  ];
}
