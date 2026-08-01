"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteTagAction } from "@/lib/actions/taxonomy.action";

/** A tag as the panel needs it, with its post count already counted. */
export type TagRow = {
  id: string;
  slug: string;
  nameZh: string;
  nameEn: string | null;
  usage: number;
};

/**
 * Tags are a chip grid rather than a table: there are many of them, each is two
 * short strings, and they are applied from the post editor rather than sorted
 * or paged through here.
 */
export function TagsPanel({
  tags,
  canWrite,
}: {
  tags: TagRow[];
  canWrite: boolean;
}) {
  if (tags.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No tags yet.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <div
          key={tag.id}
          className="flex items-center gap-2 rounded-lg border px-3 py-2"
        >
          <div className="leading-tight">
            <p className="text-sm font-medium">
              #{tag.slug}
              <span className="ml-1.5 text-xs font-normal text-muted-foreground tabular-nums">
                {tag.usage}
              </span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              {tag.nameZh}
              {tag.nameEn && ` · ${tag.nameEn}`}
            </p>
          </div>
          {canWrite && <TagRowActions tag={tag} />}
        </div>
      ))}
    </div>
  );
}

function TagRowActions({ tag }: { tag: TagRow }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const inUse = tag.usage > 0;

  function remove() {
    startTransition(async () => {
      const result = await deleteTagAction(tag.id);

      if (!result.success) {
        toast.error("Could not delete the tag", { description: result.message });
        return;
      }

      toast.success("Tag deleted", { description: result.message });
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-7">
            <MoreHorizontal className="size-3.5" />
            <span className="sr-only">Actions for {tag.slug}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/taxonomy/tags/${tag.id}/edit`}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={inUse}
            onSelect={() => setConfirmOpen(true)}
          >
            <Trash2 className="size-4" />
            {inUse ? `Used by ${tag.usage}` : "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete tag</DialogTitle>
            <DialogDescription>
              #{tag.slug} is not applied to any post, so deleting it changes
              nothing that is published.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={remove} disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
