"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ShieldAlert, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/page-header";
import { RatingBadge } from "@/components/shared/enum-badge";
import {
  chatSessions,
  messagesForSession,
  sessionEscalated,
  sessionRating,
  surveyForSession,
} from "@/lib/mock";

export default function AdminConversationsPage() {
  const [tab, setTab] = useState<string>("all");
  const [query, setQuery] = useState("");

  const rows = useMemo(
    () =>
      chatSessions
        .map((session) => {
          const messages = messagesForSession(session.id);
          const lastUserMessage = [...messages]
            .reverse()
            .find((m) => m.role === "user");
          return {
            session,
            messageCount: messages.length,
            lastMessage: lastUserMessage?.content ?? "—",
            model: messages.find((m) => m.model)?.model ?? "—",
            rating: sessionRating(session.id),
            escalated: sessionEscalated(session.id),
            survey: surveyForSession(session.id),
          };
        })
        .sort((a, b) => b.session.createdAt.localeCompare(a.session.createdAt)),
    []
  );

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        if (tab === "rated-down" && row.rating !== "down") return false;
        if (tab === "escalated" && !row.escalated) return false;
        if (tab === "surveyed" && !row.survey) return false;
        if (
          query &&
          !`${row.lastMessage} ${row.session.anonId}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
          return false;
        return true;
      }),
    [rows, tab, query]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Conversations"
        description="Anonymous chat sessions. No student identity is attached — only a browser-generated anon ID, so a transcript cannot be traced back to an individual."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="rated-down">Rated bad</TabsTrigger>
            <TabsTrigger value="escalated">Escalated</TabsTrigger>
            <TabsTrigger value="surveyed">With survey</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search message or anon ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 sm:w-64"
          />
        </div>
      </div>

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Last question</TableHead>
                <TableHead>Anon ID</TableHead>
                <TableHead>Locale</TableHead>
                <TableHead className="text-right">Turns</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead className="pr-6 text-right">Started</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={row.session.id}>
                  <TableCell className="max-w-72 pl-6">
                    <Link
                      href={`/admin/conversations/${row.session.id}`}
                      className="block truncate font-medium hover:text-primary"
                    >
                      {row.lastMessage}
                    </Link>
                    <span className="block text-xs text-muted-foreground">
                      {row.session.userAgent}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {row.session.anonId.slice(0, 8)}…
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {row.session.locale}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {row.messageCount}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {row.model}
                  </TableCell>
                  <TableCell>
                    <RatingBadge rating={row.rating} />
                  </TableCell>
                  <TableCell>
                    <span className="flex gap-1.5">
                      {row.escalated && (
                        <Badge
                          variant="outline"
                          className="gap-1 border-amber-200 bg-amber-100 px-1.5 text-[10px] font-medium text-amber-800"
                        >
                          <ShieldAlert className="size-3" />
                          Escalated
                        </Badge>
                      )}
                      {row.survey && (
                        <Badge
                          variant="outline"
                          className="gap-1 px-1.5 text-[10px] font-medium"
                        >
                          <Star className="size-3" />
                          SUS {row.survey.susScore}
                        </Badge>
                      )}
                      {!row.escalated && !row.survey && (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="pr-6 text-right text-sm text-muted-foreground">
                    {row.session.createdAt}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No conversations match your filters.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
