"use client";

import { useMemo } from "react";
import type { Table as TanstackTable } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CONTACT_STATE_TABS } from "@/constant";
import { contactColumns, type ContactRow } from "./contact-columns";

/**
 * The inbox. It opens on the unresolved messages, because that is the working
 * queue rather than the archive.
 */
export function ContactTable({
  messages,
  canWrite,
  canDelete,
}: {
  messages: ContactRow[];
  canWrite: boolean;
  canDelete: boolean;
}) {
  const columns = useMemo(
    () => contactColumns(canWrite, canDelete),
    [canWrite, canDelete],
  );

  return (
    <DataTable
      columns={columns}
      data={messages}
      emptyMessage={
        messages.length === 0
          ? "No messages yet."
          : "No messages match your filters."
      }
      toolbar={(table) => <ContactToolbar table={table} />}
    />
  );
}

function ContactToolbar({ table }: { table: TanstackTable<ContactRow> }) {
  const resolvedColumn = table.getColumn("resolved");
  const resolved = resolvedColumn?.getFilterValue() as string | undefined;
  const tab =
    resolved === undefined ? "all" : resolved === "true" ? "resolved" : "unresolved";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Tabs
        value={tab}
        onValueChange={(next) =>
          resolvedColumn?.setFilterValue(
            next === "all" ? undefined : next === "resolved" ? "true" : "false",
          )
        }
      >
        <TabsList>
          {CONTACT_STATE_TABS.map((state) => (
            <TabsTrigger key={state} value={state}>
              {state === "unresolved"
                ? "Waiting"
                : state === "resolved"
                  ? "Resolved"
                  : "All"}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search sender or message…"
          value={table.getState().globalFilter ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="w-full pl-8 sm:w-64"
        />
      </div>
    </div>
  );
}
