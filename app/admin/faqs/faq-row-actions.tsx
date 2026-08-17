"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCheck,
  EyeOff,
  Loader2,
  MoreHorizontal,
  Pencil,
  Send,
  Trash2,
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
import {
  deleteFaqAction,
  markFaqReviewedAction,
  setFaqPublishedAction,
} from "@/lib/actions/faq.action";
import type { FaqRow } from "./faq-columns";

/**
 * Per-row FAQ actions.
 *
 * "Mark reviewed" is the one staff use most: the office re-reads answers on a
 * cycle, and most of the time nothing needs changing — the date does.
 */
export function FaqRowActions({ faq }: { faq: FaqRow }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function togglePublished() {
    startTransition(async () => {
      const result = await setFaqPublishedAction({
        id: faq.id,
        published: !faq.published,
      });

      if (!result.success) {
        toast.error("Could not change the answer", { description: result.message });
        return;
      }

      toast.success(faq.published ? "Unpublished" : "Published", {
        description: result.message,
      });
      router.refresh();
    });
  }

  function markReviewed() {
    startTransition(async () => {
      const result = await markFaqReviewedAction(faq.id);

      if (!result.success) {
        toast.error("Could not record the review", { description: result.message });
        return;
      }

      toast.success("Marked as reviewed", { description: result.message });
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteFaqAction(faq.id);

      if (!result.success) {
        toast.error("Could not delete the answer", { description: result.message });
        return;
      }

      toast.success("FAQ deleted", { description: result.message });
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
            <span className="sr-only">Actions for this FAQ</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/faqs/${faq.id}/edit`}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={markReviewed} disabled={pending}>
            <CheckCheck className="size-4" />
            Mark as reviewed
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={togglePublished}
            disabled={pending || (!faq.published && faq.sourceCount === 0)}
          >
            {faq.published ? <EyeOff className="size-4" /> : <Send className="size-4" />}
            {faq.published
              ? "Unpublish"
              : faq.sourceCount === 0
                ? "Needs a source to publish"
                : "Publish"}
          </DropdownMenuItem>
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
            <DialogTitle>Delete FAQ</DialogTitle>
            <DialogDescription>
              “{faq.questionZh}” and its sources will be removed from the site.
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
