"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
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
import {
  deleteTestimonialAction,
  setTestimonialStatusAction,
} from "@/lib/actions/testimonial.action";
import type { TestimonialStatusValue } from "@/lib/validator/testimonial.validator";
import type { TestimonialRow } from "./testimonial-columns";

/**
 * Per-row testimonial actions.
 *
 * Publishing is disabled until consent is recorded. The action refuses it
 * anyway — this is someone's account of their year abroad — but greying the
 * item out explains why before anyone tries.
 */
export function TestimonialRowActions({
  testimonial,
}: {
  testimonial: TestimonialRow;
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function setStatus(status: TestimonialStatusValue) {
    startTransition(async () => {
      const result = await setTestimonialStatusAction({
        id: testimonial.id,
        status,
      });

      if (!result.success) {
        toast.error("Could not change the report", { description: result.message });
        return;
      }

      toast.success("Report updated", { description: result.message });
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteTestimonialAction(testimonial.id);

      if (!result.success) {
        toast.error("Could not delete the report", { description: result.message });
        return;
      }

      toast.success("Report deleted", { description: result.message });
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
            <span className="sr-only">Actions for {testimonial.displayName}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/testimonials/${testimonial.id}/edit`}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          {testimonial.status !== "published" && (
            <DropdownMenuItem
              onSelect={() => setStatus("published")}
              disabled={pending || !testimonial.consentGiven}
            >
              <Send className="size-4" />
              {testimonial.consentGiven ? "Publish" : "Needs consent to publish"}
            </DropdownMenuItem>
          )}
          {testimonial.status === "published" && (
            <DropdownMenuItem onSelect={() => setStatus("draft")} disabled={pending}>
              <Undo2 className="size-4" />
              Return to draft
            </DropdownMenuItem>
          )}
          {testimonial.status !== "archived" && (
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
            <DialogTitle>Delete report</DialogTitle>
            <DialogDescription>
              {testimonial.displayName}&apos;s report will be removed for good.
              If the student asked for it to come down, archiving keeps the record
              without showing it.
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
