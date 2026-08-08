"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
  deleteTcornerSlotAction,
  setTcornerSlotActiveAction,
} from "@/lib/actions/tcorner.action";
import { weekdayMeta } from "@/lib/mock/labels";
import type { SlotRow } from "./slot-columns";

/**
 * Per-row slot actions. Hiding is the one staff reach for most — a week the
 * office is away is a visibility change, not a deletion.
 */
export function SlotRowActions({ slot }: { slot: SlotRow }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const label = `${weekdayMeta[slot.weekday].label} ${slot.startTime}`;

  function toggleActive() {
    startTransition(async () => {
      const result = await setTcornerSlotActiveAction(slot.id, !slot.active);

      if (!result.success) {
        toast.error("Could not change the slot", { description: result.message });
        return;
      }

      toast.success(slot.active ? "Slot hidden" : "Slot shown", {
        description: result.message,
      });
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteTcornerSlotAction(slot.id);

      if (!result.success) {
        toast.error("Could not delete the slot", { description: result.message });
        return;
      }

      toast.success("Slot deleted", { description: result.message });
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
            <span className="sr-only">Actions for {label}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/t-corner/${slot.id}/edit`}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={toggleActive} disabled={pending}>
            {slot.active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            {slot.active ? "Hide from schedule" : "Show on schedule"}
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
            <DialogTitle>Delete slot</DialogTitle>
            <DialogDescription>
              The {label} session with {slot.advisorName} will be removed. To pause
              it for a term, hide it instead.
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
