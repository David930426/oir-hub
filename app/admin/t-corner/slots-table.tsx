"use client";

import { useMemo } from "react";
import type { Table as TanstackTable } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { slotColumns, type SlotRow } from "./slot-columns";

export function SlotsTable({
  slots,
  canWrite,
}: {
  slots: SlotRow[];
  canWrite: boolean;
}) {
  const columns = useMemo(() => slotColumns(canWrite), [canWrite]);

  return (
    <DataTable
      columns={columns}
      data={slots}
      emptyMessage={
        slots.length === 0
          ? "No slots yet. Add the first advising hour above."
          : "No slots match your filters."
      }
      toolbar={(table) => <SlotsToolbar table={table} />}
    />
  );
}

function SlotsToolbar({ table }: { table: TanstackTable<SlotRow> }) {
  const activeColumn = table.getColumn("active");
  const active = (activeColumn?.getFilterValue() as string | undefined) ?? "all";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Tabs
        value={active}
        onValueChange={(next) =>
          activeColumn?.setFilterValue(next === "all" ? undefined : next)
        }
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="true">On the schedule</TabsTrigger>
          <TabsTrigger value="false">Hidden</TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search advisor or location…"
          value={table.getState().globalFilter ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="w-full pl-8 sm:w-60"
        />
      </div>
    </div>
  );
}
