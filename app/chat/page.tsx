"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot,
  FileText,
  MessageSquarePlus,
  Send,
  ShieldAlert,
  Star,
  ThumbsDown,
  ThumbsUp,
  UserRound,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  citationsForMessage,
  getKbChunk,
  getKbDocument,
  messagesForSession,
  suggestedQuestions,
} from "@/lib/mock";
import { cn } from "@/lib/utils";

/** Anonymous session history lives in the browser, keyed by CHAT_SESSIONS.anonId. */
const history = [
  { id: "cse-02", title: "115-2 exchange deadline", active: true },
  { id: "cse-03", title: "Xuehai Feiyang with GPA 2.9", active: false },
  { id: "cse-06", title: "海外健康保險理賠期限", active: false },
];

const susStatements = [
  "I would like to use this assistant frequently.",
  "I found the assistant unnecessarily complex.",
  "I thought the assistant was easy to use.",
  "The answers were well integrated with their sources.",
  "I felt confident using the assistant.",
];

export default function ChatPage() {
  const messages = messagesForSession("cse-02");
  const [rated, setRated] = useState<Record<string, 1 | -1 | undefined>>({});

  return (
    <div className="mx-auto flex h-full max-w-6xl">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-muted/30 lg:flex">
        <div className="p-4">
          <Button className="w-full justify-start gap-2" variant="outline">
            <MessageSquarePlus className="size-4" />
            New chat
          </Button>
        </div>
        <div className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          This browser
        </div>
        <ScrollArea className="min-h-0 flex-1 px-2">
          <div className="space-y-1 px-2 pb-4">
            {history.map((h) => (
              <button
                key={h.id}
                className={cn(
                  "w-full truncate rounded-md px-3 py-2 text-left text-sm transition-colors",
                  h.active
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60"
                )}
              >
                {h.title}
              </button>
            ))}
          </div>
        </ScrollArea>
        <Separator />
        <div className="space-y-3 p-4">
          {/* SUS survey — feeds SURVEY_RESPONSES for the evaluation chapter. */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Star className="size-4" />
                Rate this assistant
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>How was the assistant?</DialogTitle>
                <DialogDescription>
                  Five quick statements plus two confidence questions. Answers
                  are anonymous and used to measure whether the assistant helps.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                {susStatements.map((statement, i) => (
                  <div key={statement} className="space-y-2">
                    <Label className="text-sm font-normal leading-snug">
                      {statement}
                    </Label>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] text-muted-foreground">
                        Disagree
                      </span>
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          className="size-9 rounded-md border text-sm tabular-nums transition-colors hover:border-primary hover:bg-accent"
                          aria-label={`Question ${i + 1}, score ${score}`}
                        >
                          {score}
                        </button>
                      ))}
                      <span className="text-[11px] text-muted-foreground">
                        Agree
                      </span>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-sm font-normal">
                      Confidence before (1–5)
                    </Label>
                    <Input type="number" min={1} max={5} placeholder="3" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-normal">
                      Confidence after (1–5)
                    </Label>
                    <Input type="number" min={1} max={5} placeholder="4" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="survey-comment" className="text-sm font-normal">
                    Anything else? (optional)
                  </Label>
                  <Textarea
                    id="survey-comment"
                    rows={3}
                    placeholder="What worked, what didn't…"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline">Not now</Button>
                <Button>Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Chats are anonymous — no login, no student ID. History is kept in
            this browser for 30 days.
          </p>
        </div>
      </aside>

      {/* Conversation */}
      <div className="flex min-w-0 flex-1 flex-col">
        <MessageScrollerProvider autoScroll defaultScrollPosition="end">
          <MessageScroller className="min-h-0 flex-1">
            <MessageScrollerViewport>
              <MessageScrollerContent className="mx-auto max-w-3xl px-4 py-8">
                {/* Opening message is not a stored row — it is the greeting. */}
                <MessageScrollerItem messageId="greeting">
                  <Message align="start">
                    <MessageAvatar className="size-8 bg-primary text-primary-foreground">
                      <Bot className="size-4" />
                    </MessageAvatar>
                    <MessageContent>
                      <MessageHeader>OIR Assistant</MessageHeader>
                      <Bubble variant="muted" align="start">
                        <BubbleContent className="text-[15px] leading-relaxed">
                          Hi! I answer from the official OIR sources — bulletins,
                          FAQs, funding rules, and student reports. Ask me in
                          English or 中文.
                        </BubbleContent>
                      </Bubble>
                    </MessageContent>
                  </Message>
                </MessageScrollerItem>

                {messages.map((m) => {
                  const citations = citationsForMessage(m.id);
                  const rating = rated[m.id];

                  return (
                    <MessageScrollerItem
                      key={m.id}
                      messageId={m.id}
                      scrollAnchor={m.role === "user"}
                    >
                      <Message align={m.role === "user" ? "end" : "start"}>
                        <MessageAvatar
                          className={cn(
                            "size-8",
                            m.role === "assistant"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {m.role === "assistant" ? (
                            <Bot className="size-4" />
                          ) : (
                            <UserRound className="size-4" />
                          )}
                        </MessageAvatar>
                        <MessageContent>
                          <MessageHeader>
                            {m.role === "assistant" ? "OIR Assistant" : "You"}
                          </MessageHeader>
                          <Bubble
                            variant={m.role === "assistant" ? "muted" : "default"}
                            align={m.role === "user" ? "end" : "start"}
                          >
                            <BubbleContent className="whitespace-pre-line text-[15px] leading-relaxed">
                              {m.content}
                            </BubbleContent>
                          </Bubble>

                          {m.escalated && (
                            <Alert className="border-amber-200 bg-amber-50 text-amber-900">
                              <ShieldAlert className="size-4" />
                              <AlertDescription className="text-amber-900/80">
                                Passed to an OIR advisor — they&apos;ll reply by
                                email.{" "}
                                <Link
                                  href="/contact"
                                  className="font-medium underline underline-offset-2"
                                >
                                  Add your details
                                </Link>
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* CHAT_CITATIONS — which chunk each claim came from */}
                          {citations.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 px-3">
                              <span className="text-xs text-muted-foreground">
                                Sources:
                              </span>
                              {citations.map((c) => {
                                const chunk = getKbChunk(c.kbChunkId);
                                const doc = chunk
                                  ? getKbDocument(chunk.kbDocumentId)
                                  : undefined;
                                if (!doc) return null;
                                return (
                                  <Badge
                                    key={c.id}
                                    variant="secondary"
                                    className="gap-1 font-normal"
                                  >
                                    <FileText className="size-3" />
                                    <span className="max-w-56 truncate">
                                      {doc.title}
                                    </span>
                                    <span className="text-muted-foreground/70">
                                      #{chunk?.index}
                                    </span>
                                  </Badge>
                                );
                              })}
                            </div>
                          )}

                          {m.role === "assistant" && (
                            <MessageFooter className="gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "size-7 text-muted-foreground",
                                  rating === 1 && "text-emerald-600"
                                )}
                                onClick={() =>
                                  setRated((r) => ({ ...r, [m.id]: 1 }))
                                }
                              >
                                <ThumbsUp className="size-3.5" />
                                <span className="sr-only">Good answer</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "size-7 text-muted-foreground",
                                  rating === -1 && "text-red-600"
                                )}
                                onClick={() =>
                                  setRated((r) => ({ ...r, [m.id]: -1 }))
                                }
                              >
                                <ThumbsDown className="size-3.5" />
                                <span className="sr-only">Bad answer</span>
                              </Button>
                              {rating === -1 && (
                                <span className="ml-1 flex flex-wrap gap-1">
                                  {(["wrong", "outdated", "unclear", "incomplete"] as const).map(
                                    (reason) => (
                                      <button
                                        key={reason}
                                        className="rounded-full border px-2 py-0.5 text-[11px] capitalize text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                                      >
                                        {reason}
                                      </button>
                                    )
                                  )}
                                </span>
                              )}
                            </MessageFooter>
                          )}
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  );
                })}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>

        {/* Composer */}
        <div className="border-t bg-background">
          <div className="mx-auto max-w-3xl px-4 py-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  className="rounded-full border bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                placeholder="Ask about bulletins, partner schools, funding…"
                className="h-11"
              />
              <Button type="submit" size="icon" className="size-11 shrink-0">
                <Send className="size-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Answers are generated from OIR documents and may contain mistakes —
              where a bulletin disagrees, the{" "}
              <Link href="/bulletins" className="underline underline-offset-2">
                bulletin
              </Link>{" "}
              is what counts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
