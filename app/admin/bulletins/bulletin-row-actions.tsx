"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  CheckCircle2,
  Loader2,
  Lock,
  MoreHorizontal,
  Pencil,
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
  deleteBulletinAction,
  setBulletinStatusAction,
} from "@/lib/actions/bulletin.action";
import type { BulletinStatusValue } from "@/lib/validator/bulletin.validator";
import type { BulletinRow } from "./bulletin-columns";

/**
 * Per-row bulletin actions. Closing a call is the common one and takes effect
 * on the public site immediately, so it is offered directly; deleting asks
 * first, because a bulletin students have already read should normally be
 * closed rather than removed.
 */
export function BulletinRowActions({ bulletin }: { bulletin: BulletinRow }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function setStatus(status: BulletinStatusValue) {
    startTransition(async () => {
      const result = await setBulletinStatusAction({ id: bulletin.id, status });

      if (!result.success) {
        toast.error("Could not change the bulletin", { description: result.message });
        return;
      }

      toast.success("Bulletin updated", { description: result.message });
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteBulletinAction(bulletin.id);

      if (!result.success) {
        toast.error("Could not delete the bulletin", { description: result.message });
        return;
      }

      toast.success("Bulletin deleted", { description: result.message });
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
            <span className="sr-only">Actions for {bulletin.titleZh}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/bulletins/${bulletin.id}/edit`}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          {bulletin.status !== "open" && (
            <DropdownMenuItem onSelect={() => setStatus("open")} disabled={pending}>
              <CheckCircle2 className="size-4" />
              Reopen applications
            </DropdownMenuItem>
          )}
          {bulletin.status === "open" && (
            <DropdownMenuItem onSelect={() => setStatus("closed")} disabled={pending}>
              <Lock className="size-4" />
              Close applications
            </DropdownMenuItem>
          )}
          {bulletin.status !== "archived" && (
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
            <DialogTitle>Delete bulletin</DialogTitle>
            <DialogDescription>
              “{bulletin.titleZh}” will be removed from the site. Its PDF stays in
              the media library. Consider archiving instead if students may still
              have the link.
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
