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
import { FUNDING_SOURCES, OPEN_STATUS_TABS } from "@/constant";
import { fundingSourceMeta, fundingStatusMeta } from "@/lib/mock/labels";
import { fundingColumns, type FundingRow } from "./funding-columns";

export function FundingTable({
  fundings,
  canWrite,
}: {
  fundings: FundingRow[];
  canWrite: boolean;
}) {
  const columns = useMemo(() => fundingColumns(canWrite), [canWrite]);

  return (
    <DataTable
      columns={columns}
      data={fundings}
      emptyMessage={
        fundings.length === 0
          ? "No funding calls yet. Add the first one above."
          : "No funding matches your filters."
      }
      toolbar={(table) => <FundingToolbar table={table} />}
    />
  );
}

function FundingToolbar({ table }: { table: TanstackTable<FundingRow> }) {
  const statusColumn = table.getColumn("status");
  const sourceColumn = table.getColumn("source");
  const status = (statusColumn?.getFilterValue() as string | undefined) ?? "all";
  const source = (sourceColumn?.getFilterValue() as string | undefined) ?? "all";

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <Tabs
        value={status}
        onValueChange={(next) =>
          statusColumn?.setFilterValue(next === "all" ? undefined : next)
        }
      >
        <TabsList>
          {OPEN_STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab === "all" ? "All" : fundingStatusMeta[tab].label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name or program…"
            value={table.getState().globalFilter ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="w-full pl-8 sm:w-56"
          />
        </div>
        <Select
          value={source}
          onValueChange={(next) =>
            sourceColumn?.setFilterValue(next === "all" ? undefined : next)
          }
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            {FUNDING_SOURCES.map((value) => (
              <SelectItem key={value} value={value}>
                {fundingSourceMeta[value].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
