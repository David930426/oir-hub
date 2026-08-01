"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type RowData,
  type SortingState,
  type Table as TanstackTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEFAULT_PAGE_SIZE } from "@/constant";
import { cn } from "@/lib/utils";

/**
 * The shadcn/ui data table: TanStack Table for state (sorting, filtering,
 * pagination) rendered through the table primitives in table.tsx.
 *
 * The table owns its own state and hands the instance to `toolbar`, so filter
 * controls set `table.getColumn(id).setFilterValue(…)` rather than each screen
 * re-implementing filtering over its rows.
 */

/** Per-column padding/alignment, since the cells are rendered generically. */
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    headerClassName?: string;
    cellClassName?: string;
  }
}

/** Sorts `null` — "never logged in" — after every real value, in both directions. */
export function nullsLastSortingFn<TData>(
  rowA: Row<TData>,
  rowB: Row<TData>,
  columnId: string
): number {
  const a = rowA.getValue(columnId);
  const b = rowB.getValue(columnId);
  if (a === b) return 0;
  if (a === null || a === undefined) return 1;
  if (b === null || b === undefined) return -1;
  return String(a) < String(b) ? -1 : 1;
}

export type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Filters and search, rendered above the card with the table instance. */
  toolbar?: (table: TanstackTable<TData>) => React.ReactNode;
  /** Shown in place of rows when nothing matches. */
  emptyMessage?: string;
  pageSize?: number;
  /**
   * Columns to define but not render — a column the toolbar filters on without
   * the reader needing a column for it, such as an archived flag behind a
   * switch. Hidden columns still take part in filtering.
   */
  hiddenColumnIds?: string[];
  className?: string;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  toolbar,
  emptyMessage = "No results.",
  pageSize = DEFAULT_PAGE_SIZE,
  hiddenColumnIds,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize },
      columnVisibility: Object.fromEntries(
        (hiddenColumnIds ?? []).map((id) => [id, false])
      ),
    },
  });

  const rows = table.getRowModel().rows;
  const pageCount = table.getPageCount();
  const visibleColumnCount = table.getVisibleFlatColumns().length;

  return (
    <div className={cn("space-y-6", className)}>
      {toolbar?.(table)}

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "first:pl-6 last:pr-6",
                        header.column.columnDef.meta?.headerClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={visibleColumnCount}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          "first:pl-6 last:pr-6",
                          cell.column.columnDef.meta?.cellClassName
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pageCount > 1 && <DataTablePagination table={table} />}
    </div>
  );
}

/** Row count on the left, page controls on the right. */
export function DataTablePagination<TData>({
  table,
}: {
  table: TanstackTable<TData>;
}) {
  const { pageIndex } = table.getState().pagination;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        {table.getFilteredRowModel().rows.length} row
        {table.getFilteredRowModel().rows.length === 1 ? "" : "s"} · page{" "}
        {pageIndex + 1} of {table.getPageCount()}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

/**
 * Sortable column heading. Columns that are not sortable should just use a
 * plain string header.
 */
export function DataTableColumnHeader({
  title,
  sorted,
  onToggle,
  className,
}: {
  title: string;
  sorted: false | "asc" | "desc";
  onToggle: () => void;
  className?: string;
}) {
  const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      className={cn("-ml-2 h-8 gap-1.5 px-2 font-medium", className)}
    >
      {title}
      <Icon
        className={cn("size-3.5", sorted ? "text-foreground" : "text-muted-foreground")}
      />
    </Button>
  );
}
