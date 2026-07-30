"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DataTableColumnHeader,
  nullsLastSortingFn,
} from "@/components/ui/data-table";
import { ActiveBadge, EnumBadge } from "@/components/shared/enum-badge";
import { userRoleMeta } from "@/lib/mock/labels";
import { initials } from "@/lib/utils";
import type { StaffRoleValue } from "@/lib/validator/user.validator";
import { UserRowActions } from "./user-row-actions";

/** One staff account as the table needs it, with dates already formatted. */
export type StaffUserRow = {
  id: string;
  name: string;
  email: string;
  role: StaffRoleValue;
  locale: string;
  active: boolean;
  createdAt: string;
  /** Null when the account has never signed in (or its sessions have expired). */
  lastLoginAt: string | null;
};

/**
 * Column definitions for the users table.
 *
 * Only the first column takes part in the search box: matching on role, status
 * or a date would make "en" or "admin" behave surprisingly, so every other
 * column opts out of the global filter.
 */
export function userColumns(currentUserId: string): ColumnDef<StaffUserRow>[] {
  return [
    {
      id: "user",
      // Name and email are one searchable value so the box matches either.
      accessorFn: (row) => `${row.name} ${row.email}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="User"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {user.name}
                {user.id === currentUserId && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    (you)
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <EnumBadge value={row.original.role} meta={userRoleMeta} />
      ),
    },
    {
      accessorKey: "locale",
      header: "Locale",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-[10px]">
          {row.original.locale}
        </Badge>
      ),
    },
    {
      accessorKey: "active",
      header: "Status",
      enableGlobalFilter: false,
      cell: ({ row }) => <ActiveBadge active={row.original.active} />,
    },
    {
      accessorKey: "createdAt",
      enableGlobalFilter: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Created"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.createdAt}</span>
      ),
    },
    {
      accessorKey: "lastLoginAt",
      enableGlobalFilter: false,
      sortingFn: nullsLastSortingFn,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Last login"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.lastLoginAt ?? "Never"}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableGlobalFilter: false,
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) => (
        <UserRowActions
          user={row.original}
          isSelf={row.original.id === currentUserId}
        />
      ),
    },
  ];
}
