"use client";

import { useMemo } from "react";
import type { Table as TanstackTable } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OPEN_STATUS_TABS } from "@/constant";
import { bulletinStatusMeta } from "@/lib/mock/labels";
import { bulletinColumns, type BulletinRow } from "./bulletin-columns";

export function BulletinsTable({
  bulletins,
  canWrite,
}: {
  bulletins: BulletinRow[];
  canWrite: boolean;
}) {
  const columns = useMemo(() => bulletinColumns(canWrite), [canWrite]);

  return (
    <DataTable
      columns={columns}
      data={bulletins}
      emptyMessage={
        bulletins.length === 0
          ? "No bulletins yet. Create the first call above."
          : "No bulletins match your filters."
      }
      toolbar={(table) => <BulletinsToolbar table={table} />}
    />
  );
}

function BulletinsToolbar({ table }: { table: TanstackTable<BulletinRow> }) {
  const statusColumn = table.getColumn("status");
  const status = (statusColumn?.getFilterValue() as string | undefined) ?? "all";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Tabs
        value={status}
        onValueChange={(next) =>
          statusColumn?.setFilterValue(next === "all" ? undefined : next)
        }
      >
        <TabsList>
          {OPEN_STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab === "all" ? "All" : bulletinStatusMeta[tab].label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search title, program or region…"
          value={table.getState().globalFilter ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="w-full pl-8 sm:w-72"
        />
      </div>
    </div>
  );
}
