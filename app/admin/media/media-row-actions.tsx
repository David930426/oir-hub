"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  Download,
  Loader2,
  MoreHorizontal,
  Trash2,
  Upload,
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
  deleteMediaAction,
  setMediaArchivedAction,
} from "@/lib/actions/media.action";
import type { MediaRow } from "./media-columns";

/**
 * Download is a plain link to the API route, which signs a short-lived MinIO
 * URL. Archiving is reversible so it happens straight from the menu; deleting
 * is not, so it asks first.
 */
export function MediaRowActions({
  file,
  canWrite,
}: {
  file: MediaRow;
  canWrite: boolean;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const inUse = file.usage > 0;

  function toggleArchived() {
    startTransition(async () => {
      const result = await setMediaArchivedAction(file.id, !file.archived);

      if (!result.success) {
        toast.error("Could not change the file", { description: result.message });
        return;
      }

      toast.success(file.archived ? "File restored" : "File archived", {
        description: result.message,
      });
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteMediaAction(file.id);

      if (!result.success) {
        toast.error("Could not delete the file", { description: result.message });
        return;
      }

      toast.success("File deleted", { description: result.message });
      setConfirmOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Actions for {file.filename}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <a href={`/api/media/${file.id}`} download>
              <Download className="size-4" />
              Download
            </a>
          </DropdownMenuItem>

          {canWrite && (
            <>
              <DropdownMenuItem asChild>
                <Link href={`/admin/media/upload?replaces=${file.id}`}>
                  <Upload className="size-4" />
                  Upload new version
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={pending} onSelect={toggleArchived}>
                {file.archived ? (
                  <ArchiveRestore className="size-4" />
                ) : (
                  <Archive className="size-4" />
                )}
                {file.archived ? "Restore" : "Archive"}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                disabled={inUse}
                onSelect={() => setConfirmOpen(true)}
              >
                <Trash2 className="size-4" />
                {inUse ? `In use by ${file.usage}` : "Delete"}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete file</DialogTitle>
            <DialogDescription>
              {file.filename} will be removed from the library and from storage.
              Nothing links to it, but this cannot be undone — archive it instead
              if you only want it out of the pickers.
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
