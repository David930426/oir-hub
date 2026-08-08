"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Loader2, MoreHorizontal, RefreshCw, Trash2 } from "lucide-react";
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
  deleteKbDocumentAction,
  reindexDocumentAction,
} from "@/lib/actions/knowledge.action";
import type { KbDocumentRow } from "./kb-columns";

/** Where the row this document was flattened from is edited. */
const SOURCE_ROUTES: Record<string, (id: string) => string | null> = {
  faq: (id) => `/admin/faqs/${id}/edit`,
  post: (id) => `/admin/posts/${id}/edit`,
  bulletin: (id) => `/admin/bulletins/${id}/edit`,
  testimonial: (id) => `/admin/testimonials/${id}/edit`,
  file: () => null,
};

/**
 * Per-row knowledge base actions.
 *
 * "Edit the source" rather than "edit": nothing here is authored, so correcting
 * an answer means changing the FAQ or post behind it and re-indexing.
 */
export function KbRowActions({ document }: { document: KbDocumentRow }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const sourceHref = SOURCE_ROUTES[document.sourceTable]?.(document.sourceId);

  function reindex() {
    startTransition(async () => {
      const result = await reindexDocumentAction({ id: document.id, force: true });

      if (!result.success) {
        toast.error("Could not re-index", { description: result.message });
        return;
      }

      toast.success("Re-indexed", { description: result.message });
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      const result = await deleteKbDocumentAction(document.id);

      if (!result.success) {
        toast.error("Could not remove the document", { description: result.message });
        return;
      }

      toast.success("Document removed", { description: result.message });
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
            <span className="sr-only">Actions for {document.title}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={reindex} disabled={pending}>
            <RefreshCw className="size-4" />
            Re-index now
          </DropdownMenuItem>
          {sourceHref && (
            <DropdownMenuItem asChild>
              <Link href={sourceHref}>
                <ExternalLink className="size-4" />
                Edit the source
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" />
            Remove from index
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove from the index</DialogTitle>
            <DialogDescription>
              “{document.title}” and its {document.chunkCount} chunks will be
              deleted, and the assistant will stop retrieving them. If the source
              is still published, the next sync brings the document back.
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
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
