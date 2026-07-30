"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { EnumBadge } from "@/components/shared/enum-badge";
import { categoryKindMeta } from "@/lib/mock/labels";
import type { CategoryKindValue } from "@/lib/validator/taxonomy.validator";
import { CategoryRowActions } from "./category-row-actions";

/** A category row as the table needs it — usage already counted server-side. */
export type CategoryRow = {
  id: string;
  slug: string;
  kind: CategoryKindValue;
  nameZh: string;
  nameEn: string | null;
  sortOrder: number;
  usage: number;
};

export function categoryColumns(canWrite: boolean): ColumnDef<CategoryRow>[] {
  return [
    {
      id: "name",
      accessorFn: (row) => `${row.nameZh} ${row.nameEn ?? ""}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Name"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="font-medium">{row.original.nameZh}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.nameEn ?? "— no English name —"}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.slug}
        </span>
      ),
    },
    {
      accessorKey: "kind",
      header: "Kind",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <EnumBadge value={row.original.kind} meta={categoryKindMeta} />
      ),
    },
    {
      accessorKey: "usage",
      enableGlobalFilter: false,
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      header: ({ column }) => (
        <DataTableColumnHeader
          title="In use"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="ml-auto -mr-2"
        />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original.usage}
        </span>
      ),
    },
    {
      accessorKey: "sortOrder",
      enableGlobalFilter: false,
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Order"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="ml-auto -mr-2"
        />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums text-muted-foreground">
          {row.original.sortOrder}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableGlobalFilter: false,
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) =>
        canWrite ? <CategoryRowActions category={row.original} /> : null,
    },
  ];
}
