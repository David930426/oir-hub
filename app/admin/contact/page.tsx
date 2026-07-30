"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Mail,
  MessagesSquare,
  MoreHorizontal,
  Reply,
  Search,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/page-header";
import { contactMessages } from "@/lib/mock";
import { CONTACT_STATE_TABS } from "@/constant";

export default function AdminContactPage() {
  const [state, setState] = useState<string>("unresolved");
  const [topic, setTopic] = useState("all");
  const [query, setQuery] = useState("");

  const topics = useMemo(
    () => Array.from(new Set(contactMessages.map((m) => m.topic))).sort(),
    []
  );

  const filtered = useMemo(
    () =>
      contactMessages
        .filter((m) => {
          if (state === "unresolved" && m.resolved) return false;
          if (state === "resolved" && !m.resolved) return false;
          if (topic !== "all" && m.topic !== topic) return false;
          if (
            query &&
            !`${m.name} ${m.email} ${m.body}`
              .toLowerCase()
              .includes(query.toLowerCase())
          )
            return false;
          return true;
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state, topic, query]
  );

  const unresolved = contactMessages.filter((m) => !m.resolved).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Contact inbox"
        description={`Messages from the contact form, plus questions the assistant escalated. ${unresolved} still waiting for a reply.`}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={state} onValueChange={setState}>
          <TabsList>
            {CONTACT_STATE_TABS.map((s) => (
              <TabsTrigger key={s} value={s} className="capitalize">
                {s}
                {s === "unresolved" && unresolved > 0 && (
                  <span className="ml-1.5 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground tabular-nums">
                    {unresolved}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search sender or text…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 sm:w-56"
            />
          </div>
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All topics</SelectItem>
              {topics.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((message) => (
          <Card key={message.id} className={message.resolved ? "opacity-70" : ""}>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="font-normal">
                      {message.topic}
                    </Badge>
                    {message.fromSessionId && (
                      <Link href={`/admin/conversations/${message.fromSessionId}`}>
                        <Badge
                          variant="outline"
                          className="gap-1 border-amber-200 bg-amber-100 font-medium text-amber-800 hover:bg-amber-200"
                        >
                          <MessagesSquare className="size-3" />
                          Escalated from chat
                        </Badge>
                      </Link>
                    )}
                    {message.resolved && (
                      <Badge
                        variant="outline"
                        className="gap-1 border-emerald-200 bg-emerald-100 font-medium text-emerald-800"
                      >
                        <Check className="size-3" />
                        Resolved
                      </Badge>
                    )}
                  </div>
                  <p className="font-semibold">{message.name}</p>
                  <a
                    href={`mailto:${message.email}`}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
                  >
                    <Mail className="size-3.5" />
                    {message.email}
                  </a>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {message.createdAt}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <a href={`mailto:${message.email}`}>
                          <Reply className="size-4" />
                          Reply by email
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Check className="size-4" />
                        {message.resolved
                          ? "Mark unresolved"
                          : "Mark resolved"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive">
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <p className="rounded-lg border bg-muted/30 p-3 text-sm leading-relaxed">
                {message.body}
              </p>

              {!message.resolved && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" asChild>
                    <a href={`mailto:${message.email}`}>
                      <Reply className="size-4" />
                      Reply
                    </a>
                  </Button>
                  <Button size="sm" variant="outline">
                    <Check className="size-4" />
                    Mark resolved
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-dashed py-16 text-center text-muted-foreground">
          <p className="font-medium">Nothing in this view.</p>
          <p className="mt-1 text-sm">
            {state === "unresolved"
              ? "The inbox is clear."
              : "Try another topic or search term."}
          </p>
        </div>
      )}
    </div>
  );
}
