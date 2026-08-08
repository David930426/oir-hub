"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Loader2,
  Mail,
  MessageSquare,
  MoreHorizontal,
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
  deleteContactMessageAction,
  setContactResolvedAction,
} from "@/lib/actions/contact.action";
import type { ContactRow } from "./contact-columns";

/**
 * Per-row inbox actions.
 *
 * Replying happens in the staff member's own mail client — the app sends no
 * mail — so "Reply" is a mailto link rather than a form.
 */
export function ContactRowActions({
  message,
  canDelete,
}: {
  message: ContactRow;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggleResolved() {
    startTransition(async () => {
      const result = await setContactResolvedAction({
        id: message.id,
        resolved: !message.resolved,
      });

      if (!result.success) {
        toast.error("Could not update the message", { description: result.message });
        return;
      }

      toast.success(message.resolved ? "Reopened" : "Marked resolved", {
        description: result.message,
      });
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteContactMessageAction(message.id);

      if (!result.success) {
        toast.error("Could not delete the message", { description: result.message });
        return;
      }

      toast.success("Message deleted", { description: result.message });
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
            <span className="sr-only">Actions for {message.name}&apos;s message</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <a
              href={`mailto:${message.email}?subject=${encodeURIComponent(
                `Re: ${message.topic}`,
              )}`}
            >
              <Mail className="size-4" />
              Reply by email
            </a>
          </DropdownMenuItem>
          {message.fromSessionId && (
            <DropdownMenuItem asChild>
              <Link href={`/admin/conversations/${message.fromSessionId}`}>
                <MessageSquare className="size-4" />
                Read the transcript
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={toggleResolved} disabled={pending}>
            {message.resolved ? (
              <Undo2 className="size-4" />
            ) : (
              <Check className="size-4" />
            )}
            {message.resolved ? "Reopen" : "Mark resolved"}
          </DropdownMenuItem>
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete message</DialogTitle>
            <DialogDescription>
              {message.name} wrote this by hand and there is nowhere to recover it
              from. Use this for spam; otherwise mark it resolved.
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
