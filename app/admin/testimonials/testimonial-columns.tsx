"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ShieldCheck, ShieldQuestion } from "lucide-react";
import { EnumBadge } from "@/components/shared/enum-badge";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { testimonialStatusMeta } from "@/lib/mock/labels";
import type { TestimonialStatusValue } from "@/lib/validator/testimonial.validator";
import { TestimonialRowActions } from "./testimonial-row-actions";

/** One testimonial as the table needs it, with the date already formatted. */
export type TestimonialRow = {
  id: string;
  displayName: string;
  deptYear: string;
  country: string;
  termLabel: string;
  schoolName: string | null;
  consentGiven: boolean;
  status: TestimonialStatusValue;
  createdAt: string;
};

export function testimonialColumns(
  canWrite: boolean,
): ColumnDef<TestimonialRow>[] {
  return [
    {
      id: "student",
      accessorFn: (row) =>
        `${row.displayName} ${row.deptYear} ${row.schoolName ?? ""} ${row.country}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Student"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <div className="min-w-0 max-w-80">
          <p className="truncate text-sm font-medium">{row.original.displayName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.deptYear} · {row.original.schoolName ?? row.original.country}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "termLabel",
      header: "Term",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">{row.original.termLabel}</span>
      ),
    },
    {
      accessorKey: "consentGiven",
      header: "Consent",
      enableGlobalFilter: false,
      filterFn: (row, id, value) => String(row.getValue(id)) === value,
      cell: ({ row }) =>
        row.original.consentGiven ? (
          <Badge variant="outline" className="gap-1 border-emerald-200 bg-emerald-100 font-normal text-emerald-800">
            <ShieldCheck className="size-3" />
            Given
          </Badge>
        ) : (
          // Publication is blocked without this, so it reads as a warning
          // rather than a neutral flag.
          <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-100 font-normal text-amber-800">
            <ShieldQuestion className="size-3" />
            Waiting
          </Badge>
        ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <EnumBadge value={row.original.status} meta={testimonialStatusMeta} />
      ),
    },
    {
      accessorKey: "createdAt",
      enableGlobalFilter: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Collected"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.createdAt}</span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableGlobalFilter: false,
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) =>
        canWrite ? <TestimonialRowActions testimonial={row.original} /> : null,
    },
  ];
}
