"use client";

import Link from "next/link";
import {
  Bot,
  FileText,
  MessageSquarePlus,
  Send,
  ThumbsDown,
  ThumbsUp,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { suggestedQuestions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const history = [
  { id: "1", title: "Spring 2027 exchange deadline", active: true },
  { id: "2", title: "JASSO scholarship eligibility", active: false },
  { id: "3", title: "US visa interview documents", active: false },
];

const messages = [
  {
    id: "m1",
    role: "assistant" as const,
    text: "Hi! I'm the OIR assistant. I answer from the official OIR knowledge base — ask me about visas, scholarships, housing, or exchange programs, in English or 中文.",
  },
  {
    id: "m2",
    role: "user" as const,
    text: "When does the Spring 2027 exchange application close?",
  },
  {
    id: "m3",
    role: "assistant" as const,
    text: "The Spring 2027 semester exchange application closes on August 15, 2026 at 17:00. Late submissions are not accepted under any circumstances.\n\nIf you'd like to learn more before applying, two info sessions will be held in the International Building Room 302 on July 22 and July 29 (Wednesdays, 12:10–13:00) — both cover the same content.",
    sources: [
      "2027 Spring Exchange Program Application Now Open",
      "TUM Exchange Nomination & Learning Agreement",
    ],
  },
];

export default function ChatPage() {
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
          Recent
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
        <div className="p-4 text-xs leading-relaxed text-muted-foreground">
          Anonymous chats are kept for 30 days.{" "}
          <Link href="/login" className="text-primary underline-offset-2 hover:underline">
            Log in
          </Link>{" "}
          to keep your history.
        </div>
      </aside>

      {/* Conversation */}
      <div className="flex min-w-0 flex-1 flex-col">
        <MessageScrollerProvider autoScroll defaultScrollPosition="end">
          <MessageScroller className="min-h-0 flex-1">
            <MessageScrollerViewport>
              <MessageScrollerContent className="mx-auto max-w-3xl px-4 py-8">
                {messages.map((m) => (
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
                            {m.text}
                          </BubbleContent>
                        </Bubble>

                        {"sources" in m && m.sources && (
                          <div className="flex flex-wrap items-center gap-2 px-3">
                            <span className="text-xs text-muted-foreground">
                              Sources:
                            </span>
                            {m.sources.map((s) => (
                              <Badge
                                key={s}
                                variant="secondary"
                                className="gap-1 font-normal"
                              >
                                <FileText className="size-3" />
                                <span className="max-w-56 truncate">{s}</span>
                              </Badge>
                            ))}
                          </div>
                        )}

                        {m.role === "assistant" && m.id !== "m1" && (
                          <MessageFooter className="gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground"
                            >
                              <ThumbsUp className="size-3.5" />
                              <span className="sr-only">Good answer</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground"
                            >
                              <ThumbsDown className="size-3.5" />
                              <span className="sr-only">Bad answer</span>
                            </Button>
                          </MessageFooter>
                        )}
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                ))}
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
                placeholder="Ask about visas, scholarships, exchange programs…"
                className="h-11"
              />
              <Button type="submit" size="icon" className="size-11 shrink-0">
                <Send className="size-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              AI answers may contain mistakes — always verify important dates and
              requirements with the OIR.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
