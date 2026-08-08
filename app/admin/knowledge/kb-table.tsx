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
import { KB_SOURCE_TABLES, KB_STATUS_TABS } from "@/constant";
import { kbSourceTableMeta, kbStatusMeta } from "@/lib/mock/labels";
import { kbColumns, type KbDocumentRow } from "./kb-columns";

export function KbTable({
  documents,
  canWrite,
}: {
  documents: KbDocumentRow[];
  canWrite: boolean;
}) {
  const columns = useMemo(() => kbColumns(canWrite), [canWrite]);

  return (
    <DataTable
      columns={columns}
      data={documents}
      emptyMessage={
        documents.length === 0
          ? "Nothing indexed yet. Run “Sync from content” to build the document list."
          : "No documents match your filters."
      }
      toolbar={(table) => <KbToolbar table={table} />}
    />
  );
}

function KbToolbar({ table }: { table: TanstackTable<KbDocumentRow> }) {
  const statusColumn = table.getColumn("status");
  const sourceColumn = table.getColumn("sourceTable");
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
          {KB_STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab === "all" ? "All" : kbStatusMeta[tab].label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search document title…"
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
            {KB_SOURCE_TABLES.map((value) => (
              <SelectItem key={value} value={value}>
                {kbSourceTableMeta[value].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
