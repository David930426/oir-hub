"use client";

import { useMemo } from "react";
import type { Table as TanstackTable } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { USER_ROLE_TABS } from "@/constant";
import { userRoleMeta } from "@/lib/mock/labels";
import { userColumns, type StaffUserRow } from "./columns";

/**
 * Staff accounts as a shadcn DataTable: the role tabs drive the `role` column
 * filter and the search box drives the global filter, so sorting, filtering and
 * pagination all come from the one table instance.
 */
export function UsersTable({
  users,
  currentUserId,
}: {
  users: StaffUserRow[];
  currentUserId: string;
}) {
  const columns = useMemo(() => userColumns(currentUserId), [currentUserId]);

  return (
    <DataTable
      columns={columns}
      data={users}
      emptyMessage={
        users.length === 0
          ? "No staff accounts yet. Create the first one above."
          : "No users match your search."
      }
      toolbar={(table) => <UsersToolbar table={table} />}
    />
  );
}

function UsersToolbar({ table }: { table: TanstackTable<StaffUserRow> }) {
  const roleColumn = table.getColumn("role");
  const role = (roleColumn?.getFilterValue() as string | undefined) ?? "all";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Tabs
        value={role}
        onValueChange={(next) =>
          // "all" clears the filter rather than filtering on a role named "all".
          roleColumn?.setFilterValue(next === "all" ? undefined : next)
        }
      >
        <TabsList>
          {USER_ROLE_TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab === "all" ? "All" : userRoleMeta[tab].label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email…"
          value={table.getState().globalFilter ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="w-full pl-8 sm:w-64"
        />
      </div>
    </div>
  );
}
