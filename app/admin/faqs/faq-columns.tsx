"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle, BookOpen, Clock } from "lucide-react";
import { EnumBadge } from "@/components/shared/enum-badge";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { faqAudienceMeta } from "@/lib/mock/labels";
import type { FaqAudienceValue } from "@/lib/validator/faq.validator";
import { FaqRowActions } from "./faq-row-actions";

/** One FAQ as the table needs it, with the review date already formatted. */
export type FaqRow = {
  id: string;
  questionZh: string;
  questionEn: string | null;
  shortAnswerZh: string;
  categoryName: string | null;
  audience: FaqAudienceValue;
  needsHumanConfirm: boolean;
  published: boolean;
  sourceCount: number;
  lastReviewedAt: string;
  /** True when the answer is past the office's review interval. */
  stale: boolean;
  reviewedBy: string | null;
};

export function faqColumns(canWrite: boolean): ColumnDef<FaqRow>[] {
  return [
    {
      id: "question",
      accessorFn: (row) =>
        `${row.questionZh} ${row.questionEn ?? ""} ${row.shortAnswerZh}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Question"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <div className="min-w-0 max-w-96">
          <p className="truncate text-sm font-medium">{row.original.questionZh}</p>
          <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{row.original.categoryName ?? "—"}</span>
            <span className="flex items-center gap-1">
              <BookOpen className="size-3" />
              {row.original.sourceCount}
            </span>
            {row.original.needsHumanConfirm && (
              // Flagged as too consequential to answer from the page alone —
              // worth seeing at a glance.
              <span className="flex items-center gap-1 text-amber-700">
                <AlertTriangle className="size-3" />
                Escalates
              </span>
            )}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "audience",
      header: "Audience",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <EnumBadge value={row.original.audience} meta={faqAudienceMeta} />
      ),
    },
    {
      accessorKey: "published",
      header: "Status",
      enableGlobalFilter: false,
      filterFn: (row, id, value) => String(row.getValue(id)) === value,
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={
            row.original.published
              ? "border-emerald-200 bg-emerald-100 font-medium text-emerald-800"
              : "border-slate-200 bg-slate-100 font-medium text-slate-700"
          }
        >
          {row.original.published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      accessorKey: "lastReviewedAt",
      enableGlobalFilter: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Last reviewed"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          <p className="flex items-center gap-1">
            {row.original.stale && <Clock className="size-3 text-amber-700" />}
            <span className={row.original.stale ? "text-amber-700" : undefined}>
              {row.original.lastReviewedAt}
            </span>
          </p>
          <p className="text-xs">{row.original.reviewedBy ?? "—"}</p>
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableGlobalFilter: false,
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) => (canWrite ? <FaqRowActions faq={row.original} /> : null),
    },
  ];
}
