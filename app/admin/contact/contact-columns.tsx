"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { ContactRowActions } from "./contact-row-actions";

/** One inbox message as the table needs it, with the date already formatted. */
export type ContactRow = {
  id: string;
  name: string;
  email: string;
  topic: string;
  body: string;
  fromSessionId: string | null;
  resolved: boolean;
  createdAt: string;
};

export function contactColumns(
  canWrite: boolean,
  canDelete: boolean,
): ColumnDef<ContactRow>[] {
  return [
    {
      id: "message",
      accessorFn: (row) => `${row.name} ${row.email} ${row.topic} ${row.body}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Message"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <div className="min-w-0 max-w-md space-y-1">
          <p className="text-sm font-medium">
            {row.original.name}
            <span className="ml-2 font-normal text-muted-foreground">
              {row.original.email}
            </span>
          </p>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {row.original.body}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "topic",
      header: "Topic",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <Badge variant="outline" className="font-normal">
          {row.original.topic}
        </Badge>
      ),
    },
    {
      id: "origin",
      header: "From",
      enableGlobalFilter: false,
      cell: ({ row }) =>
        row.original.fromSessionId ? (
          // Escalated questions carry the transcript that led to them, which is
          // usually the fastest way to understand what is being asked.
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="size-3" />
            Assistant
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Contact form</span>
        ),
    },
    {
      accessorKey: "resolved",
      header: "State",
      enableGlobalFilter: false,
      filterFn: (row, id, value) => String(row.getValue(id)) === value,
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={
            row.original.resolved
              ? "border-slate-200 bg-slate-100 font-medium text-slate-700"
              : "border-amber-200 bg-amber-100 font-medium text-amber-800"
          }
        >
          {row.original.resolved ? "Resolved" : "Waiting"}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      enableGlobalFilter: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Received"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.createdAt}</span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableGlobalFilter: false,
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) =>
        canWrite ? (
          <ContactRowActions message={row.original} canDelete={canDelete} />
        ) : null,
    },
  ];
}
