import Link from "next/link";
import { ArrowLeft, Bot, FileText, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RatingBadge } from "@/components/admin/badges";
import { conversations, transcript } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default async function AdminConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conv = conversations.find((c) => c.id === id) ?? conversations[1];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin/conversations">
            <ArrowLeft className="size-4" />
            Back to conversations
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Conversation transcript</h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">{conv.sessionId}</p>
      </div>

      <Card>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-5">
            <div>
              <dt className="text-muted-foreground">User</dt>
              <dd className="mt-1 font-medium">{conv.user}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Language</dt>
              <dd className="mt-1"><Badge variant="outline">{conv.language}</Badge></dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Model</dt>
              <dd className="mt-1 font-medium">{conv.model}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Rating</dt>
              <dd className="mt-1"><RatingBadge rating={conv.rating} /></dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Started</dt>
              <dd className="mt-1 font-medium">{conv.startedAt}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="space-y-5">
        {transcript.map((turn, i) => (
          <div key={i} className="flex gap-3">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                turn.role === "assistant"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {turn.role === "assistant" ? (
                <Bot className="size-4" />
              ) : (
                <UserRound className="size-4" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <Card className={cn("py-4", turn.role === "user" && "bg-muted/40")}>
                <CardContent className="space-y-3 px-4">
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {turn.text}
                  </p>

                  {turn.retrievedChunks && (
                    <div className="rounded-lg border bg-muted/30 p-3">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Retrieved chunks
                      </p>
                      <ul className="space-y-1.5">
                        {turn.retrievedChunks.map((rc, j) => (
                          <li
                            key={j}
                            className="flex items-center justify-between gap-3 text-xs"
                          >
                            <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                              <FileText className="size-3.5 shrink-0" />
                              <span className="truncate">
                                {rc.docTitle} · chunk #{rc.chunkIndex}
                              </span>
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "shrink-0 font-mono tabular-nums",
                                rc.score >= 0.8
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                  : rc.score >= 0.7
                                    ? "bg-amber-100 text-amber-800 border-amber-200"
                                    : "bg-red-100 text-red-800 border-red-200"
                              )}
                            >
                              {rc.score.toFixed(2)}
                            </Badge>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
