"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { BedDouble, GraduationCap } from "lucide-react";
import { ActiveBadge } from "@/components/shared/enum-badge";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { SchoolRowActions } from "./school-row-actions";

/** One partner school as the table needs it. */
export type PartnerSchoolRow = {
  id: string;
  nameZh: string;
  nameEn: string | null;
  country: string;
  region: string;
  programName: string | null;
  quota: number;
  gpaMin: number;
  englishTaught: boolean;
  housingProvided: boolean;
  active: boolean;
  /** Testimonials pointing at this school — they block a delete. */
  usage: number;
};

export function schoolColumns(canWrite: boolean): ColumnDef<PartnerSchoolRow>[] {
  return [
    {
      id: "school",
      accessorFn: (row) =>
        `${row.nameZh} ${row.nameEn ?? ""} ${row.country} ${row.region}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="School"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <div className="min-w-0 max-w-80">
          <p className="truncate text-sm font-medium">{row.original.nameZh}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.country} · {row.original.programName ?? "—"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "region",
      header: "Region",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.region}</span>
      ),
    },
    {
      accessorKey: "quota",
      enableGlobalFilter: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Quota"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">{row.original.quota}</span>
      ),
    },
    {
      accessorKey: "gpaMin",
      enableGlobalFilter: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Min GPA"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {row.original.gpaMin > 0 ? row.original.gpaMin.toFixed(1) : "—"}
        </span>
      ),
    },
    {
      id: "offers",
      header: "Offers",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.englishTaught && (
            <Badge variant="outline" className="gap-1 font-normal">
              <GraduationCap className="size-3" />
              EN taught
            </Badge>
          )}
          {row.original.housingProvided && (
            <Badge variant="outline" className="gap-1 font-normal">
              <BedDouble className="size-3" />
              Housing
            </Badge>
          )}
          {!row.original.englishTaught && !row.original.housingProvided && (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "active",
      header: "Status",
      enableGlobalFilter: false,
      filterFn: (row, id, value) => String(row.getValue(id)) === value,
      cell: ({ row }) => <ActiveBadge active={row.original.active} />,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableGlobalFilter: false,
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) =>
        canWrite ? <SchoolRowActions school={row.original} /> : null,
    },
  ];
}
