"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RatingBadge } from "@/components/admin/badges";
import { conversations } from "@/lib/mock-data";

export default function AdminConversationsPage() {
  const [rating, setRating] = useState("all");
  const [language, setLanguage] = useState("all");
  const [period, setPeriod] = useState("7d");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      conversations.filter((c) => {
        if (rating !== "all" && c.rating !== rating) return false;
        if (language !== "all" && c.language !== language) return false;
        if (
          query &&
          !`${c.lastMessage} ${c.user} ${c.sessionId}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
          return false;
        return true;
      }),
    [rating, language, query]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conversations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All chatbot sessions — review transcripts and retrieved chunks to
          debug answer quality.
        </p>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <Tabs value={rating} onValueChange={setRating}>
          <TabsList>
            <TabsTrigger value="all">All ratings</TabsTrigger>
            <TabsTrigger value="good">Good</TabsTrigger>
            <TabsTrigger value="bad">Bad</TabsTrigger>
            <TabsTrigger value="none">Unrated</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All languages</SelectItem>
              <SelectItem value="EN">English</SelectItem>
              <SelectItem value="中文">中文</SelectItem>
            </SelectContent>
          </Select>

          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full sm:w-40">
              <CalendarDays className="size-4 text-muted-foreground" />
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search messages…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-8 sm:w-56"
            />
          </div>
        </div>
      </div>

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Last message</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Lang</TableHead>
                <TableHead className="text-right">Msgs</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="pr-6 text-right">Started</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="max-w-64 pl-6">
                    <Link
                      href={`/admin/conversations/${c.id}`}
                      className="block truncate font-medium hover:text-primary"
                    >
                      {c.lastMessage}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.user}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {c.sessionId}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.language}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{c.messages}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.model}</TableCell>
                  <TableCell>
                    <RatingBadge rating={c.rating} />
                  </TableCell>
                  <TableCell className="pr-6 text-right text-muted-foreground">
                    {c.startedAt}
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
