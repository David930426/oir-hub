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
  deleteFundingAction,
  setFundingStatusAction,
} from "@/lib/actions/funding.action";
import type { FundingStatusValue } from "@/lib/validator/funding.validator";
import type { FundingRow } from "./funding-columns";

export function FundingRowActions({ funding }: { funding: FundingRow }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function setStatus(status: FundingStatusValue) {
    startTransition(async () => {
      const result = await setFundingStatusAction({ id: funding.id, status });

      if (!result.success) {
        toast.error("Could not change the funding call", {
          description: result.message,
        });
        return;
      }

      toast.success("Funding updated", { description: result.message });
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteFundingAction(funding.id);

      if (!result.success) {
        toast.error("Could not delete the funding call", {
          description: result.message,
        });
        return;
      }

      toast.success("Funding deleted", { description: result.message });
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
            <span className="sr-only">Actions for {funding.nameZh}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/funding/${funding.id}/edit`}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          {funding.status !== "open" && (
            <DropdownMenuItem onSelect={() => setStatus("open")} disabled={pending}>
              <CheckCircle2 className="size-4" />
              Mark open
            </DropdownMenuItem>
          )}
          {funding.status === "open" && (
            <DropdownMenuItem onSelect={() => setStatus("closed")} disabled={pending}>
              <Lock className="size-4" />
              Mark closed
            </DropdownMenuItem>
          )}
          {funding.status !== "archived" && (
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
            <DialogTitle>Delete funding call</DialogTitle>
            <DialogDescription>
              “{funding.nameZh}” will be removed from the site. A scheme that
              returns every year is better archived than deleted.
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
