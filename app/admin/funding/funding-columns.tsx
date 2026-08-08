"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { EnumBadge } from "@/components/shared/enum-badge";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { formatApplyMonths, fundingSourceMeta, fundingStatusMeta, formatTwd } from "@/lib/mock/labels";
import type {
  FundingSourceValue,
  FundingStatusValue,
} from "@/lib/validator/funding.validator";
import { FundingRowActions } from "./funding-row-actions";

/** One funding call as the table needs it. */
export type FundingRow = {
  id: string;
  nameZh: string;
  nameEn: string | null;
  source: FundingSourceValue;
  programName: string | null;
  amountMax: number;
  applyMonths: number[];
  status: FundingStatusValue;
};

export function fundingColumns(canWrite: boolean): ColumnDef<FundingRow>[] {
  return [
    {
      id: "funding",
      accessorFn: (row) =>
        `${row.nameZh} ${row.nameEn ?? ""} ${row.programName ?? ""}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Funding"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <div className="min-w-0 max-w-80">
          <p className="truncate text-sm font-medium">{row.original.nameZh}</p>
          <p className="truncate text-xs text-muted-foreground">
            {/* A grant with no program is open to any student — worth saying
                rather than showing an em dash. */}
            {row.original.programName ?? "Any program"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "source",
      header: "Source",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <EnumBadge value={row.original.source} meta={fundingSourceMeta} />
      ),
    },
    {
      accessorKey: "amountMax",
      enableGlobalFilter: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Up to"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {row.original.amountMax > 0 ? formatTwd(row.original.amountMax) : "—"}
        </span>
      ),
    },
    {
      id: "applyMonths",
      header: "Applications open",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.applyMonths.length > 0
            ? formatApplyMonths(row.original.applyMonths)
            : "—"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <EnumBadge value={row.original.status} meta={fundingStatusMeta} />
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableGlobalFilter: false,
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) =>
        canWrite ? <FundingRowActions funding={row.original} /> : null,
    },
  ];
}
