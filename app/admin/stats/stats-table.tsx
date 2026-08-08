"use client";

import { useMemo } from "react";
import type { Table as TanstackTable } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statColumns, type StatRow } from "./stat-columns";

/**
 * Homepage figures as a DataTable. The year filter is built from the rows: the
 * office adds a year at a time, so a fixed list would go stale.
 */
export function StatsTable({
  stats,
  canWrite,
}: {
  stats: StatRow[];
  canWrite: boolean;
}) {
  const columns = useMemo(() => statColumns(canWrite), [canWrite]);
  const years = useMemo(
    () => [...new Set(stats.map((stat) => stat.academicYear))].sort().reverse(),
    [stats],
  );

  return (
    <DataTable
      columns={columns}
      data={stats}
      emptyMessage={
        stats.length === 0
          ? "No figures recorded yet."
          : "No figures match your filters."
      }
      toolbar={(table) => <StatsToolbar table={table} years={years} />}
    />
  );
}

function StatsToolbar({
  table,
  years,
}: {
  table: TanstackTable<StatRow>;
  years: string[];
}) {
  const yearColumn = table.getColumn("academicYear");
  const year = (yearColumn?.getFilterValue() as string | undefined) ?? "all";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Select
        value={year}
        onValueChange={(next) =>
          yearColumn?.setFilterValue(next === "all" ? undefined : next)
        }
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All years</SelectItem>
          {years.map((value) => (
            <SelectItem key={value} value={value}>
              {value} 學年度
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search label or key…"
          value={table.getState().globalFilter ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="w-full pl-8 sm:w-56"
        />
      </div>
    </div>
  );
}
