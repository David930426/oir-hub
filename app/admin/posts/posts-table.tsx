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
import { POST_TYPES, PUBLISH_STATUS_TABS } from "@/constant";
import { postStatusMeta, postTypeMeta } from "@/lib/mock/labels";
import { postColumns, type PostRow } from "./post-columns";

export function PostsTable({
  posts,
  categories,
  canWrite,
}: {
  posts: PostRow[];
  categories: { id: string; name: string }[];
  canWrite: boolean;
}) {
  const columns = useMemo(() => postColumns(canWrite), [canWrite]);

  return (
    <DataTable
      columns={columns}
      data={posts}
      emptyMessage={
        posts.length === 0
          ? "No posts yet. Write the first one above."
          : "No posts match your filters."
      }
      toolbar={(table) => <PostsToolbar table={table} categories={categories} />}
    />
  );
}

function PostsToolbar({
  table,
  categories,
}: {
  table: TanstackTable<PostRow>;
  categories: { id: string; name: string }[];
}) {
  const statusColumn = table.getColumn("status");
  const typeColumn = table.getColumn("type");
  const categoryColumn = table.getColumn("categoryName");
  const status = (statusColumn?.getFilterValue() as string | undefined) ?? "all";
  const type = (typeColumn?.getFilterValue() as string | undefined) ?? "all";
  const category = (categoryColumn?.getFilterValue() as string | undefined) ?? "all";

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
              {tab === "all" ? "All" : postStatusMeta[tab].label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search title or slug…"
            value={table.getState().globalFilter ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="w-full pl-8 sm:w-52"
          />
        </div>
        <Select
          value={type}
          onValueChange={(next) =>
            typeColumn?.setFilterValue(next === "all" ? undefined : next)
          }
        >
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {POST_TYPES.map((value) => (
              <SelectItem key={value} value={value}>
                {postTypeMeta[value].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Filters on the category name, which is what the column holds — the
            page joins it in so the table never needs the id. */}
        <Select
          value={category}
          onValueChange={(next) =>
            categoryColumn?.setFilterValue(next === "all" ? undefined : next)
          }
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((entry) => (
              <SelectItem key={entry.id} value={entry.name}>
                {entry.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
