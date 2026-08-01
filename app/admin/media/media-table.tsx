"use client";

import { useMemo } from "react";
import type { Table as TanstackTable } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { mediaColumns, type MediaRow } from "./media-columns";

/**
 * The library as a DataTable. All three controls drive the one table instance:
 * search is the global filter, the year picker and the archived switch are
 * column filters — the archived column itself stays hidden.
 */
export function MediaTable({
  files,
  canWrite,
}: {
  files: MediaRow[];
  canWrite: boolean;
}) {
  const columns = useMemo(() => mediaColumns(canWrite), [canWrite]);

  const years = useMemo(
    () =>
      Array.from(
        new Set(files.map((file) => file.academicYear).filter(Boolean) as string[]),
      ).sort(),
    [files],
  );

  const archivedCount = useMemo(
    () => files.filter((file) => file.archived).length,
    [files],
  );

  return (
    <DataTable
      columns={columns}
      data={files}
      hiddenColumnIds={["archived"]}
      emptyMessage={
        files.length === 0
          ? "Nothing uploaded yet."
          : "No files match your filters."
      }
      toolbar={(table) => (
        <MediaToolbar table={table} years={years} archivedCount={archivedCount} />
      )}
    />
  );
}

function MediaToolbar({
  table,
  years,
  archivedCount,
}: {
  table: TanstackTable<MediaRow>;
  years: string[];
  archivedCount: number;
}) {
  const yearColumn = table.getColumn("academicYear");
  const year = (yearColumn?.getFilterValue() as string | undefined) ?? "all";

  const archivedColumn = table.getColumn("archived");
  // No filter at all means archived rows are included.
  const showArchived = archivedColumn?.getFilterValue() === undefined;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
        <Label htmlFor="show-archived" className="text-sm font-normal">
          Show archived
          <span className="ml-1 text-xs text-muted-foreground tabular-nums">
            ({archivedCount})
          </span>
        </Label>
        <Switch
          id="show-archived"
          checked={showArchived}
          onCheckedChange={(checked) =>
            archivedColumn?.setFilterValue(checked ? undefined : false)
          }
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search filename…"
            value={table.getState().globalFilter ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="w-full pl-8 sm:w-56"
          />
        </div>
        <Select
          value={year}
          onValueChange={(next) =>
            yearColumn?.setFilterValue(next === "all" ? undefined : next)
          }
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Academic year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All years</SelectItem>
            {years.map((value) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
