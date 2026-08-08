"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
  Undo2,
} from "lucide-react";
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
import { deletePostAction, setPostStatusAction } from "@/lib/actions/post.action";
import type { PostStatusValue } from "@/lib/validator/post.validator";
import type { PostRow } from "./post-columns";

export function PostRowActions({ post }: { post: PostRow }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function setStatus(status: PostStatusValue) {
    startTransition(async () => {
      const result = await setPostStatusAction({ id: post.id, status });

      if (!result.success) {
        toast.error("Could not change the post", { description: result.message });
        return;
      }

      toast.success("Post updated", { description: result.message });
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deletePostAction(post.id);

      if (!result.success) {
        toast.error("Could not delete the post", { description: result.message });
        return;
      }

      toast.success("Post deleted", { description: result.message });
      setDeleteOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Actions for {post.titleZh}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/posts/${post.id}/edit`}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          {post.status === "published" && (
            <DropdownMenuItem asChild>
              <Link href={`/news/${post.slug}`}>
                <Eye className="size-4" />
                View on site
              </Link>
            </DropdownMenuItem>
          )}
          {post.status !== "published" && (
            <DropdownMenuItem
              onSelect={() => setStatus("published")}
              disabled={pending}
            >
              <Send className="size-4" />
              Publish
            </DropdownMenuItem>
          )}
          {post.status === "published" && (
            <DropdownMenuItem onSelect={() => setStatus("draft")} disabled={pending}>
              <Undo2 className="size-4" />
              Return to draft
            </DropdownMenuItem>
          )}
          {post.status !== "archived" && (
            <DropdownMenuItem
              onSelect={() => setStatus("archived")}
              disabled={pending}
            >
              <Archive className="size-4" />
              Archive
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete post</DialogTitle>
            <DialogDescription>
              “{post.titleZh}” and its tags will be removed. Attached files stay in
              the media library. Archiving keeps the URL working for anyone who
              bookmarked it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
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
