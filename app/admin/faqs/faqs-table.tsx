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
import { FAQ_AUDIENCES, FAQ_PUBLISH_TABS } from "@/constant";
import { faqAudienceMeta } from "@/lib/mock/labels";
import { faqColumns, type FaqRow } from "./faq-columns";

export function FaqsTable({
  faqs,
  canWrite,
}: {
  faqs: FaqRow[];
  canWrite: boolean;
}) {
  const columns = useMemo(() => faqColumns(canWrite), [canWrite]);

  return (
    <DataTable
      columns={columns}
      data={faqs}
      emptyMessage={
        faqs.length === 0
          ? "No FAQs yet. Write the first answer above."
          : "No answers match your filters."
      }
      toolbar={(table) => <FaqsToolbar table={table} />}
    />
  );
}

function FaqsToolbar({ table }: { table: TanstackTable<FaqRow> }) {
  const publishedColumn = table.getColumn("published");
  const audienceColumn = table.getColumn("audience");
  const published = publishedColumn?.getFilterValue() as string | undefined;
  const audience = (audienceColumn?.getFilterValue() as string | undefined) ?? "all";

  // The tabs are "published" / "unpublished"; the column holds a boolean, so
  // the two are mapped rather than compared directly.
  const publishTab =
    published === undefined ? "all" : published === "true" ? "published" : "unpublished";

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <Tabs
        value={publishTab}
        onValueChange={(next) =>
          publishedColumn?.setFilterValue(
            next === "all" ? undefined : next === "published" ? "true" : "false",
          )
        }
      >
        <TabsList>
          {FAQ_PUBLISH_TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab === "all"
                ? "All"
                : tab === "published"
                  ? "Published"
                  : "Unpublished"}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search question or answer…"
            value={table.getState().globalFilter ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="w-full pl-8 sm:w-64"
          />
        </div>
        <Select
          value={audience}
          onValueChange={(next) =>
            audienceColumn?.setFilterValue(next === "all" ? undefined : next)
          }
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All audiences</SelectItem>
            {FAQ_AUDIENCES.map((value) => (
              <SelectItem key={value} value={value}>
                {faqAudienceMeta[value].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
