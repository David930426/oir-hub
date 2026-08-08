"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Languages, Paperclip } from "lucide-react";
import { EnumBadge } from "@/components/shared/enum-badge";
import { DataTableColumnHeader } from "@/components/ui/data-table";
import { postStatusMeta, postTypeMeta } from "@/lib/mock/labels";
import type {
  PostStatusValue,
  PostTypeValue,
} from "@/lib/validator/post.validator";
import { PostRowActions } from "./post-row-actions";

/** One post as the table needs it, with dates already formatted. */
export type PostRow = {
  id: string;
  slug: string;
  titleZh: string;
  titleEn: string | null;
  type: PostTypeValue;
  status: PostStatusValue;
  categoryName: string | null;
  authorName: string | null;
  publishedAt: string | null;
  tagCount: number;
  attachmentCount: number;
};

export function postColumns(canWrite: boolean): ColumnDef<PostRow>[] {
  return [
    {
      id: "title",
      accessorFn: (row) => `${row.titleZh} ${row.titleEn ?? ""} ${row.slug}`,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Title"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <div className="min-w-0 max-w-80">
          <p className="truncate text-sm font-medium">{row.original.titleZh}</p>
          <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate font-mono">/{row.original.slug}</span>
            {!row.original.titleEn && (
              <span className="flex items-center gap-1 text-amber-700">
                <Languages className="size-3" />
                EN missing
              </span>
            )}
            {row.original.attachmentCount > 0 && (
              <span className="flex items-center gap-1">
                <Paperclip className="size-3" />
                {row.original.attachmentCount}
              </span>
            )}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      enableGlobalFilter: false,
      cell: ({ row }) => <EnumBadge value={row.original.type} meta={postTypeMeta} />,
    },
    {
      accessorKey: "categoryName",
      header: "Category",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.categoryName ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <EnumBadge value={row.original.status} meta={postStatusMeta} />
      ),
    },
    {
      accessorKey: "authorName",
      header: "Author",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.authorName ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "publishedAt",
      enableGlobalFilter: false,
      header: ({ column }) => (
        <DataTableColumnHeader
          title="Published"
          sorted={column.getIsSorted()}
          onToggle={() => column.toggleSorting(column.getIsSorted() === "asc")}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.publishedAt ?? "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableGlobalFilter: false,
      meta: { headerClassName: "text-right", cellClassName: "text-right" },
      cell: ({ row }) => (canWrite ? <PostRowActions post={row.original} /> : null),
    },
  ];
}
