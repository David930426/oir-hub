"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, Maximize2, MessageCircle, Send, X } from "lucide-react";
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
} from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const sampleMessages = [
  {
    role: "assistant" as const,
    text: "Hi! I answer from the official OIR sources — bulletins, FAQs, funding rules, and student reports. Ask in English or 中文.",
  },
  {
    role: "user" as const,
    text: "When does the 115-2 exchange application close?",
  },
  {
    role: "assistant" as const,
    text: "It closes on 15 August 2026 at 17:00. The Japan & Korea round closes a week earlier, on 8 August.",
  },
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // The dedicated chat page and admin area have their own chat surfaces.
  if (pathname.startsWith("/chat") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-112 w-80 flex-col overflow-hidden rounded-xl border bg-background shadow-xl sm:w-96">
          <div className="flex items-center justify-between gap-2 border-b bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="size-5" />
              <div className="leading-tight">
                <p className="text-sm font-semibold">OIR Assistant</p>
                <p className="text-[11px] opacity-80">Usually replies instantly</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="size-7 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
              >
                <Link href="/chat" title="Open full page">
                  <Maximize2 className="size-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <BubbleGroup className="gap-3">
              {sampleMessages.map((m, i) => (
                <Bubble
                  key={i}
                  variant={m.role === "assistant" ? "muted" : "default"}
                  align={m.role === "assistant" ? "start" : "end"}
                  className="max-w-[85%]"
                >
                  <BubbleContent>{m.text}</BubbleContent>
                </Bubble>
              ))}
            </BubbleGroup>
          </div>

          <div className="border-t p-3">
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input placeholder="Type your question…" className="h-9" />
              <Button type="submit" size="icon" className="size-9 shrink-0">
                <Send className="size-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              AI answers may contain mistakes — verify important dates with the OIR.
            </p>
          </div>
        </div>
      )}

      <Button
        size="icon"
        className="size-13 rounded-full shadow-lg"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
        <span className="sr-only">Toggle chat</span>
      </Button>
    </div>
  );
}
