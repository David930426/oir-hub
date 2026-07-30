"use client";

import { useMemo } from "react";
import type { Table as TanstackTable } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORY_KIND_TABS } from "@/constant";
import { categoryKindMeta } from "@/lib/mock/labels";
import { categoryColumns, type CategoryRow } from "./category-columns";

/**
 * Categories as a DataTable. The kind tabs drive the `kind` column filter, so
 * the table instance owns filtering, sorting and pagination.
 */
export function CategoriesTable({
  categories,
  canWrite,
}: {
  categories: CategoryRow[];
  canWrite: boolean;
}) {
  const columns = useMemo(() => categoryColumns(canWrite), [canWrite]);

  return (
    <DataTable
      columns={columns}
      data={categories}
      emptyMessage={
        categories.length === 0
          ? "No categories yet."
          : "No categories of this kind."
      }
      toolbar={(table) => <KindTabs table={table} />}
    />
  );
}

function KindTabs({ table }: { table: TanstackTable<CategoryRow> }) {
  const kindColumn = table.getColumn("kind");
  const kind = (kindColumn?.getFilterValue() as string | undefined) ?? "all";

  return (
    <Tabs
      value={kind}
      onValueChange={(next) =>
        // "all" clears the filter rather than filtering on a kind named "all".
        kindColumn?.setFilterValue(next === "all" ? undefined : next)
      }
    >
      <TabsList>
        {CATEGORY_KIND_TABS.map((tab) => (
          <TabsTrigger key={tab} value={tab}>
            {tab === "all" ? "All" : categoryKindMeta[tab].label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
