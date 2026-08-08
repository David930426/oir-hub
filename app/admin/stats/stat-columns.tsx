"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { StatRowActions } from "./stat-row-actions";

/** One homepage figure as the table needs it, with the date already formatted. */
export type StatRow = {
  id: string;
  academicYear: string;
  metricKey: string;
  labelZh: string;
  labelEn: string | null;
  value: number;
  unitZh: string | null;
  updatedBy: string | null;
  updatedAt: string;
};

export function statColumns(canWrite: boolean): ColumnDef<StatRow>[] {
  return [
    {
      id: "metric",
      accessorFn: (row) => `${row.labelZh} ${row.labelEn ?? ""} ${row.metricKey}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Metric"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{row.original.labelZh}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">
            {row.original.metricKey}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "academicYear",
      enableGlobalFilter: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Year"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="tabular-nums">
          {row.original.academicYear}
        </Badge>
      ),
    },
    {
      accessorKey: "value",
      enableGlobalFilter: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Value"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium tabular-nums">
          {row.original.value.toLocaleString("en")}
          {row.original.unitZh && (
            <span className="ml-1 font-normal text-muted-foreground">
              {row.original.unitZh}
            </span>
          )}
        </span>
      ),
    },
    {
      accessorKey: "updatedAt",
      enableGlobalFilter: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Last updated"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          <p>{row.original.updatedAt}</p>
          <p className="text-xs">{row.original.updatedBy ?? "—"}</p>
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableGlobalFilter: false,
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) => (canWrite ? <StatRowActions stat={row.original} /> : null),
    },
  ];
}
