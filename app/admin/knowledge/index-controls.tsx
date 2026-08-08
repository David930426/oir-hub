"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  reindexPendingAction,
  syncKnowledgeBaseAction,
} from "@/lib/actions/knowledge.action";

/**
 * The two buttons that drive the index.
 *
 * Sync only reads published content and writes documents, so it always works.
 * Re-indexing calls Ollama and Qdrant and can take a while — the button stays
 * disabled for the whole run rather than letting someone queue three of them.
 */
export function IndexControls({ pendingCount }: { pendingCount: number }) {
  const router = useRouter();
  const [syncing, startSync] = useTransition();
  const [indexing, startIndex] = useTransition();

  function sync() {
    startSync(async () => {
      const result = await syncKnowledgeBaseAction();

      if (!result.success) {
        toast.error("Could not sync", { description: result.message });
        return;
      }

      toast.success("Knowledge base synced", { description: result.message });
      router.refresh();
    });
  }

  function reindex() {
    startIndex(async () => {
      const result = await reindexPendingAction();

      if (!result.success) {
        toast.error("Could not re-index", { description: result.message });
        return;
      }

      toast.success("Re-index finished", { description: result.message });
      router.refresh();
    });
  }

  return (
    <>
      <Button variant="outline" onClick={sync} disabled={syncing || indexing}>
        {syncing ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <RefreshCw className="size-4" />
        )}
        Sync from content
      </Button>
      <Button onClick={reindex} disabled={indexing || syncing || pendingCount === 0}>
        {indexing ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Sparkles className="size-4" />
        )}
        {pendingCount === 0
          ? "Everything indexed"
          : `Re-index ${pendingCount} document${pendingCount === 1 ? "" : "s"}`}
      </Button>
    </>
  );
}
