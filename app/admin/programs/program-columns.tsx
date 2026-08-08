"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Languages } from "lucide-react";
import { ActiveBadge, EnumBadge } from "@/components/shared/enum-badge";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { programTypeMeta } from "@/lib/mock/labels";
import type { ProgramTypeValue } from "@/lib/validator/program.validator";
import { ProgramRowActions } from "./program-row-actions";

/** One program as the table needs it. */
export type ProgramRow = {
  id: string;
  slug: string;
  type: ProgramTypeValue;
  nameZh: string;
  nameEn: string | null;
  active: boolean;
  sortOrder: number;
  /** Bulletins and partner schools pointing at this program. */
  usage: number;
};

export function programColumns(canWrite: boolean): ColumnDef<ProgramRow>[] {
  return [
    {
      id: "program",
      // Name and slug are one searchable value so the box matches either.
      accessorFn: (row) => `${row.nameZh} ${row.nameEn ?? ""} ${row.slug}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Program"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{row.original.nameZh}</p>
          <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate font-mono">/{row.original.slug}</span>
            {!row.original.nameEn && (
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
      accessorKey: "type",
      header: "Type",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <EnumBadge value={row.original.type} meta={programTypeMeta} />
      ),
    },
    {
      accessorKey: "usage",
      header: "In use by",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.usage === 0 ? "—" : `${row.original.usage} rows`}
        </span>
      ),
    },
    {
      accessorKey: "sortOrder",
      enableGlobalFilter: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Order"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums text-muted-foreground">
          {row.original.sortOrder}
        </span>
      ),
    },
    {
      accessorKey: "active",
      header: "Status",
      enableGlobalFilter: false,
      // The toolbar filters on "true" / "false", so the value is compared as a
      // string rather than through the default equality check.
      filterFn: (row, id, value) => String(row.getValue(id)) === value,
      cell: ({ row }) => <ActiveBadge active={row.original.active} />,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableGlobalFilter: false,
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) =>
        canWrite ? <ProgramRowActions program={row.original} /> : null,
    },
  ];
}
