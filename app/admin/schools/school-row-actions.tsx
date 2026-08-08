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
  deletePartnerSchoolAction,
  setPartnerSchoolActiveAction,
} from "@/lib/actions/school.action";
import type { PartnerSchoolRow } from "./school-columns";

/**
 * Per-row school actions. An expired agreement is deactivated rather than
 * deleted once students have written about it — the testimonials reference the
 * school ON DELETE RESTRICT.
 */
export function SchoolRowActions({ school }: { school: PartnerSchoolRow }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const inUse = school.usage > 0;

  function toggleActive() {
    startTransition(async () => {
      const result = await setPartnerSchoolActiveAction(school.id, !school.active);

      if (!result.success) {
        toast.error("Could not change the school", { description: result.message });
        return;
      }

      toast.success(school.active ? "School deactivated" : "School activated", {
        description: result.message,
      });
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deletePartnerSchoolAction(school.id);

      if (!result.success) {
        toast.error("Could not delete the school", { description: result.message });
        return;
      }

      toast.success("School deleted", { description: result.message });
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
            <span className="sr-only">Actions for {school.nameZh}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/schools/${school.id}/edit`}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={toggleActive} disabled={pending}>
            {school.active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            {school.active ? "Hide from directory" : "Show in directory"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={inUse}
            onSelect={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
            {inUse ? "Has testimonials — cannot delete" : "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete partner school</DialogTitle>
            <DialogDescription>
              {school.nameZh} will be removed from the directory. No testimonials
              reference it, so nothing else is affected.
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
