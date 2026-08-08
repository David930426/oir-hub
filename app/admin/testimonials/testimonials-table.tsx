"use client";

import { useMemo } from "react";
import type { Table as TanstackTable } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PUBLISH_STATUS_TABS } from "@/constant";
import { testimonialStatusMeta } from "@/lib/mock/labels";
import { testimonialColumns, type TestimonialRow } from "./testimonial-columns";

export function TestimonialsTable({
  testimonials,
  canWrite,
}: {
  testimonials: TestimonialRow[];
  canWrite: boolean;
}) {
  const columns = useMemo(() => testimonialColumns(canWrite), [canWrite]);

  return (
    <DataTable
      columns={columns}
      data={testimonials}
      emptyMessage={
        testimonials.length === 0
          ? "No testimonials collected yet."
          : "No reports match your filters."
      }
      toolbar={(table) => <TestimonialsToolbar table={table} />}
    />
  );
}

function TestimonialsToolbar({ table }: { table: TanstackTable<TestimonialRow> }) {
  const statusColumn = table.getColumn("status");
  const consentColumn = table.getColumn("consentGiven");
  const status = (statusColumn?.getFilterValue() as string | undefined) ?? "all";
  const awaitingConsent = consentColumn?.getFilterValue() === "false";

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <Tabs
        value={status}
        onValueChange={(next) =>
          statusColumn?.setFilterValue(next === "all" ? undefined : next)
        }
      >
        <TabsList>
          {PUBLISH_STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab === "all" ? "All" : testimonialStatusMeta[tab].label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* The office's working queue: reports it cannot publish yet. */}
        <Tabs
          value={awaitingConsent ? "waiting" : "any"}
          onValueChange={(next) =>
            consentColumn?.setFilterValue(next === "waiting" ? "false" : undefined)
          }
        >
          <TabsList>
            <TabsTrigger value="any">Any consent</TabsTrigger>
            <TabsTrigger value="waiting">Awaiting consent</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search student or school…"
            value={table.getState().globalFilter ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="w-full pl-8 sm:w-60"
          />
        </div>
      </div>
    </div>
  );
}
