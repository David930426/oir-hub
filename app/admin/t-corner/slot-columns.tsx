"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CalendarCheck } from "lucide-react";
import { ActiveBadge, EnumBadge } from "@/components/shared/enum-badge";
import { Badge } from "@/components/ui/badge";
import { weekdayMeta } from "@/lib/mock/labels";
import type { WeekdayValue } from "@/lib/validator/tcorner.validator";
import { SlotRowActions } from "./slot-row-actions";

/** One walk-in slot as the table needs it. */
export type SlotRow = {
  id: string;
  weekday: WeekdayValue;
  startTime: string;
  endTime: string;
  location: string;
  advisorName: string;
  hostName: string | null;
  topics: string[];
  bookingRequired: boolean;
  active: boolean;
};

export function slotColumns(canWrite: boolean): ColumnDef<SlotRow>[] {
  return [
    {
      id: "when",
      accessorFn: (row) => `${row.weekday} ${row.startTime}`,
      header: "When",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <div>
          <EnumBadge value={row.original.weekday} meta={weekdayMeta} />
          <p className="mt-1 text-sm tabular-nums">
            {row.original.startTime}–{row.original.endTime}
          </p>
        </div>
      ),
    },
    {
      id: "advisor",
      accessorFn: (row) =>
        `${row.advisorName} ${row.hostName ?? ""} ${row.location}`,
      header: "Advisor",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{row.original.advisorName}</p>
          <p className="truncate text-xs text-muted-foreground">
            {row.original.location}
            {/* The host is the staff account responsible, which is not always
                the person named on the site. */}
            {row.original.hostName && row.original.hostName !== row.original.advisorName
              ? ` · hosted by ${row.original.hostName}`
              : ""}
          </p>
        </div>
      ),
    },
    {
      id: "topics",
      header: "Topics",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <div className="flex max-w-72 flex-wrap gap-1">
          {row.original.topics.length === 0 ? (
            <span className="text-xs text-muted-foreground">Anything</span>
          ) : (
            row.original.topics.map((topic) => (
              <Badge key={topic} variant="secondary" className="font-normal">
                {topic}
              </Badge>
            ))
          )}
        </div>
      ),
    },
    {
      accessorKey: "bookingRequired",
      header: "Booking",
      enableGlobalFilter: false,
      cell: ({ row }) =>
        row.original.bookingRequired ? (
          <Badge variant="outline" className="gap-1 font-normal">
            <CalendarCheck className="size-3" />
            Required
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">Walk-in</span>
        ),
    },
    {
      accessorKey: "active",
      header: "Status",
      enableGlobalFilter: false,
      filterFn: (row, id, value) => String(row.getValue(id)) === value,
      cell: ({ row }) => <ActiveBadge active={row.original.active} />,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableGlobalFilter: false,
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) => (canWrite ? <SlotRowActions slot={row.original} /> : null),
    },
  ];
}
