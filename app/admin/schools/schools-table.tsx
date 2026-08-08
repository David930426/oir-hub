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
import { schoolColumns, type PartnerSchoolRow } from "./school-columns";

/**
 * Partner schools as a DataTable. Regions come from the rows rather than a
 * constant: they are free text the office maintains, so the filter should list
 * exactly what is on file.
 */
export function SchoolsTable({
  schools,
  canWrite,
}: {
  schools: PartnerSchoolRow[];
  canWrite: boolean;
}) {
  const columns = useMemo(() => schoolColumns(canWrite), [canWrite]);
  const regions = useMemo(
    () => [...new Set(schools.map((school) => school.region))].sort(),
    [schools],
  );

  return (
    <DataTable
      columns={columns}
      data={schools}
      emptyMessage={
        schools.length === 0
          ? "No partner schools yet. Add the first agreement above."
          : "No schools match your filters."
      }
      toolbar={(table) => <SchoolsToolbar table={table} regions={regions} />}
    />
  );
}

function SchoolsToolbar({
  table,
  regions,
}: {
  table: TanstackTable<PartnerSchoolRow>;
  regions: string[];
}) {
  const activeColumn = table.getColumn("active");
  const regionColumn = table.getColumn("region");
  const active = (activeColumn?.getFilterValue() as string | undefined) ?? "all";
  const region = (regionColumn?.getFilterValue() as string | undefined) ?? "all";

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
            placeholder="Search school or country…"
            value={table.getState().globalFilter ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="w-full pl-8 sm:w-60"
          />
        </div>
        <Select
          value={region}
          onValueChange={(next) =>
            regionColumn?.setFilterValue(next === "all" ? undefined : next)
          }
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All regions</SelectItem>
            {regions.map((value) => (
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
