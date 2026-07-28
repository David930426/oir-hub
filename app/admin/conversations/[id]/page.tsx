"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  FileText,
  Gauge,
  ShieldAlert,
  ThumbsDown,
  ThumbsUp,
  UserRound,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@/components/ui/message";
import { EnumBadge, RatingBadge } from "@/components/shared/enum-badge";
import {
  citationsForMessage,
  feedbackForMessage,
  feedbackReasonMeta,
  getChatSession,
  getKbChunk,
  getKbDocument,
  messagesForSession,
  sessionEscalated,
  sessionRating,
  surveyForSession,
} from "@/lib/mock";
import { cn } from "@/lib/utils";
import { toneClasses } from "@/lib/mock/labels";

export default function AdminConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const session = getChatSession(id);
  if (!session) notFound();

  const messages = messagesForSession(session.id);
  const survey = surveyForSession(session.id);
  const model = messages.find((m) => m.model)?.model ?? "—";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin/conversations">
            <ArrowLeft className="size-4" />
            All conversations
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          Conversation transcript
        </h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">
          {session.anonId}
        </p>
      </div>

      {sessionEscalated(session.id) && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <ShieldAlert className="size-4" />
          <AlertDescription className="text-amber-900/80">
            This session was escalated to a human. Check the{" "}
            <Link
              href="/admin/contact"
              className="font-medium underline underline-offset-2"
            >
              contact inbox
            </Link>{" "}
            for the follow-up message.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent>
          <dl className="grid gap-4 text-sm sm:grid-cols-5">
            <div>
              <dt className="text-muted-foreground">Locale</dt>
              <dd className="mt-1">
                <Badge variant="outline" className="font-mono text-[10px]">
                  {session.locale}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Model</dt>
              <dd className="mt-1 font-mono text-xs">{model}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Rating</dt>
              <dd className="mt-1">
                <RatingBadge rating={sessionRating(session.id)} />
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Client</dt>
              <dd className="mt-1 font-medium">{session.userAgent}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Started</dt>
              <dd className="mt-1 font-medium">{session.createdAt}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Transcript with retrieval evidence per assistant turn */}
      <div className="space-y-5">
        {messages.map((message) => {
          const citations = citationsForMessage(message.id);
          const feedback = feedbackForMessage(message.id);

          return (
            <Message
              key={message.id}
              align={message.role === "user" ? "end" : "start"}
            >
              <MessageAvatar
                className={cn(
                  "size-8",
                  message.role === "assistant"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {message.role === "assistant" ? (
                  <Bot className="size-4" />
                ) : (
                  <UserRound className="size-4" />
                )}
              </MessageAvatar>
              <MessageContent>
                <MessageHeader>
                  {message.role === "assistant" ? "Assistant" : "User"}
                  <span className="ml-2 font-normal text-muted-foreground">
                    {message.createdAt}
                  </span>
                </MessageHeader>
                <Bubble
                  variant={message.role === "assistant" ? "outline" : "muted"}
                  align={message.role === "user" ? "end" : "start"}
                >
                  <BubbleContent className="whitespace-pre-line">
                    {message.content}
                  </BubbleContent>
                </Bubble>

                {message.role === "assistant" && (
                  <div className="flex flex-wrap items-center gap-3 px-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Gauge className="size-3.5" />
                      retrieval {message.retrievalMs}ms · generation{" "}
                      {message.generationMs}ms
                    </span>
                    {message.escalated && (
                      <Badge
                        variant="outline"
                        className="gap-1 border-amber-200 bg-amber-100 px-1.5 text-[10px] font-medium text-amber-800"
                      >
                        <ShieldAlert className="size-3" />
                        Escalated
                      </Badge>
                    )}
                  </div>
                )}

                {/* CHAT_CITATIONS with retrieval score per chunk */}
                {citations.length > 0 && (
                  <div className="max-w-[85%] rounded-lg border bg-muted/30 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Retrieved chunks
                    </p>
                    <ul className="space-y-1.5">
                      {citations.map((citation) => {
                        const chunk = getKbChunk(citation.kbChunkId);
                        const doc = chunk
                          ? getKbDocument(chunk.kbDocumentId)
                          : undefined;
                        return (
                          <li
                            key={citation.id}
                            className="flex items-center justify-between gap-3 text-xs"
                          >
                            <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                              <span className="shrink-0 tabular-nums">
                                #{citation.rank}
                              </span>
                              <FileText className="size-3.5 shrink-0" />
                              <Link
                                href={
                                  doc ? `/admin/knowledge/${doc.id}` : "/admin/knowledge"
                                }
                                className="truncate hover:text-primary"
                              >
                                {doc?.title ?? citation.kbChunkId} · chunk{" "}
                                {chunk?.index}
                              </Link>
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "shrink-0 font-mono tabular-nums",
                                citation.score >= 0.8
                                  ? toneClasses.success
                                  : citation.score >= 0.7
                                    ? toneClasses.warning
                                    : toneClasses.danger
                              )}
                            >
                              {citation.score.toFixed(2)}
                            </Badge>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* CHAT_FEEDBACK for this message */}
                {feedback && (
                  <div className="max-w-[85%] rounded-lg border bg-background p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {feedback.rating === 1 ? (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                          <ThumbsUp className="size-3.5" />
                          Rated good
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-red-700">
                          <ThumbsDown className="size-3.5" />
                          Rated bad
                        </span>
                      )}
                      {feedback.reason && (
                        <EnumBadge
                          value={feedback.reason}
                          meta={feedbackReasonMeta}
                        />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {feedback.createdAt}
                      </span>
                    </div>
                    {feedback.comment && (
                      <p className="mt-2 text-sm italic text-muted-foreground">
                        “{feedback.comment}”
                      </p>
                    )}
                  </div>
                )}
              </MessageContent>
            </Message>
          );
        })}
      </div>

      {/* SURVEY_RESPONSES for this session */}
      {survey && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Survey response</CardTitle>
            <CardDescription>
              Submitted {survey.createdAt} · SUS items q1–q10 scored 1–5.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">SUS score</p>
                <p className="text-2xl font-bold tabular-nums">
                  {survey.susScore}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Confidence before
                </p>
                <p className="text-2xl font-bold tabular-nums">
                  {survey.confidenceBefore}
                  <span className="text-sm font-normal text-muted-foreground">
                    /5
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Confidence after</p>
                <p className="text-2xl font-bold tabular-nums">
                  {survey.confidenceAfter}
                  <span className="text-sm font-normal text-muted-foreground">
                    /5
                  </span>
                </p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Item scores
              </p>
              <div className="flex flex-wrap gap-1.5">
                {survey.susAnswers.map((score, i) => (
                  <span
                    key={i}
                    className="flex size-9 flex-col items-center justify-center rounded-md border text-xs tabular-nums"
                  >
                    <span className="text-[9px] text-muted-foreground">
                      q{i + 1}
                    </span>
                    <span className="font-medium">{score}</span>
                  </span>
                ))}
              </div>
            </div>

            {survey.comment && (
              <p className="rounded-lg border bg-muted/30 p-3 text-sm italic text-muted-foreground">
                “{survey.comment}”
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
