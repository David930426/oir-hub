"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
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
  deleteProgramAction,
  setProgramActiveAction,
} from "@/lib/actions/program.action";
import type { ProgramRow } from "./program-columns";

/**
 * Per-row program actions.
 *
 * Deleting is only offered while nothing points at the program — bulletins and
 * schools reference it ON DELETE RESTRICT, so the alternative for a retired
 * program is to deactivate it.
 */
export function ProgramRowActions({ program }: { program: ProgramRow }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const inUse = program.usage > 0;

  function toggleActive() {
    startTransition(async () => {
      const result = await setProgramActiveAction(program.id, !program.active);

      if (!result.success) {
        toast.error("Could not change the program", { description: result.message });
        return;
      }

      toast.success(program.active ? "Program deactivated" : "Program activated", {
        description: result.message,
      });
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteProgramAction(program.id);

      if (!result.success) {
        toast.error("Could not delete the program", { description: result.message });
        return;
      }

      toast.success("Program deleted", { description: result.message });
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
            <span className="sr-only">Actions for {program.nameZh}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/programs/${program.id}/edit`}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={toggleActive} disabled={pending}>
            {program.active ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
            {program.active ? "Hide from site" : "Show on site"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={inUse}
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
            {inUse ? "In use — cannot delete" : "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete program</DialogTitle>
            <DialogDescription>
              “{program.nameZh}” will be removed from the site. Nothing points at
              it, so no bulletins or schools are affected.
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
