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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROGRAM_TYPES } from "@/constant";
import { programTypeMeta } from "@/lib/mock/labels";
import { programColumns, type ProgramRow } from "./program-columns";

/**
 * Programs as a DataTable. The tabs filter the `active` column and the select
 * filters `type`, so both go through the one table instance rather than each
 * filtering the rows itself.
 */
export function ProgramsTable({
  programs,
  canWrite,
}: {
  programs: ProgramRow[];
  canWrite: boolean;
}) {
  const columns = useMemo(() => programColumns(canWrite), [canWrite]);

  return (
    <DataTable
      columns={columns}
      data={programs}
      emptyMessage={
        programs.length === 0
          ? "No programs yet. Create the first one above."
          : "No programs match your filters."
      }
      toolbar={(table) => <ProgramsToolbar table={table} />}
    />
  );
}

function ProgramsToolbar({ table }: { table: TanstackTable<ProgramRow> }) {
  const activeColumn = table.getColumn("active");
  const typeColumn = table.getColumn("type");
  const active = (activeColumn?.getFilterValue() as string | undefined) ?? "all";
  const type = (typeColumn?.getFilterValue() as string | undefined) ?? "all";

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <Tabs
        value={active}
        onValueChange={(next) =>
          activeColumn?.setFilterValue(next === "all" ? undefined : next)
        }
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="true">Active</TabsTrigger>
          <TabsTrigger value="false">Inactive</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name or slug…"
            value={table.getState().globalFilter ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="w-full pl-8 sm:w-56"
          />
        </div>
        <Select
          value={type}
          onValueChange={(next) =>
            typeColumn?.setFilterValue(next === "all" ? undefined : next)
          }
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {PROGRAM_TYPES.map((value) => (
              <SelectItem key={value} value={value}>
                {programTypeMeta[value].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
