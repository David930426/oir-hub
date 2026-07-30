import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  FileStack,
  Inbox,
  MessagesSquare,
  ShieldCheck,
  ThumbsUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import {
  DeadlineBadge,
  RatingBadge,
  ToneDot,
} from "@/components/shared/enum-badge";
import {
  chatFeedback,
  chatSessions,
  chatsPerDay,
  contactMessages,
  formatTerm,
  getProgram,
  kbDocuments,
  kbStatusMeta,
  messagesForSession,
  openBulletins,
  sessionEscalated,
  sessionRating,
  testimonials,
  faqs,
  daysUntil,
} from "@/lib/mock";
import type { KbStatus } from "@/lib/mock";
import { REVIEW_INTERVAL_DAYS } from "@/constant";

export default function AdminDashboardPage() {
  const maxChats = Math.max(...chatsPerDay.map((d) => d.count));
  const todayChats = chatsPerDay[chatsPerDay.length - 1];
  const previousChats = chatsPerDay[chatsPerDay.length - 2];
  const chatDelta = Math.round(
    ((todayChats.count - previousChats.count) / previousChats.count) * 100
  );

  const good = chatFeedback.filter((f) => f.rating === 1).length;
  const goodRatio = chatFeedback.length
    ? Math.round((good / chatFeedback.length) * 100)
    : 0;

  const kbCounts = kbDocuments.reduce(
    (acc, doc) => {
      acc[doc.status] += 1;
      return acc;
    },
    { indexed: 0, pending: 0, stale: 0, failed: 0 } as Record<KbStatus, number>
  );

  const unresolved = contactMessages.filter((m) => !m.resolved);
  const calls = openBulletins();

  // Work queues — the rows that need a human before the site is correct.
  const awaitingConsent = testimonials.filter(
    (t) => !t.consentGiven && t.status !== "archived"
  );
  const staleFaqs = faqs.filter(
    (f) => -daysUntil(f.lastReviewedAt) > REVIEW_INTERVAL_DAYS
  );
  const failedDocs = kbDocuments.filter((d) => d.status === "failed");

  const recentSessions = [...chatSessions]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const stats = [
    {
      label: "Chats today",
      value: String(todayChats.count),
      sub: `${chatDelta >= 0 ? "+" : ""}${chatDelta}% vs yesterday`,
      icon: MessagesSquare,
      href: "/admin/conversations",
    },
    {
      label: "Good rating ratio",
      value: `${goodRatio}%`,
      sub: `${chatFeedback.length} rated answers`,
      icon: ThumbsUp,
      href: "/admin/feedback",
    },
    {
      label: "Documents indexed",
      value: `${kbCounts.indexed} / ${kbDocuments.length}`,
      sub: `${kbCounts.pending} pending · ${kbCounts.stale} stale · ${kbCounts.failed} failed`,
      icon: BookOpenCheck,
      href: "/admin/knowledge",
    },
    {
      label: "Unresolved contacts",
      value: String(unresolved.length),
      sub: unresolved.length
        ? `oldest from ${unresolved[unresolved.length - 1].createdAt.slice(0, 10)}`
        : "inbox is clear",
      icon: Inbox,
      href: "/admin/contact",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title="Dashboard"
        description="Assistant activity, knowledge base health, and everything waiting on a person."
      />

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group">
            <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardDescription>{stat.label}</CardDescription>
                  <stat.icon className="size-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-3xl tabular-nums">
                  {stat.value}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Needs attention */}
      {(failedDocs.length > 0 ||
        awaitingConsent.length > 0 ||
        staleFaqs.length > 0) && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-amber-600" />
              Needs attention
            </CardTitle>
            <CardDescription>
              Content that is wrong, invisible, or unpublishable until someone
              acts.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {failedDocs.length > 0 && (
              <Link href="/admin/knowledge" className="group">
                <div className="rounded-lg border bg-background p-3 transition-colors group-hover:border-primary/40">
                  <p className="text-2xl font-bold tabular-nums text-red-700">
                    {failedDocs.length}
                  </p>
                  <p className="text-sm font-medium">Documents failed to index</p>
                  <p className="text-xs text-muted-foreground">
                    Invisible to the assistant until retried.
                  </p>
                </div>
              </Link>
            )}
            {awaitingConsent.length > 0 && (
              <Link href="/admin/testimonials" className="group">
                <div className="rounded-lg border bg-background p-3 transition-colors group-hover:border-primary/40">
                  <p className="text-2xl font-bold tabular-nums text-amber-700">
                    {awaitingConsent.length}
                  </p>
                  <p className="text-sm font-medium">Testimonials need consent</p>
                  <p className="text-xs text-muted-foreground">
                    Cannot be published until the student agrees.
                  </p>
                </div>
              </Link>
            )}
            {staleFaqs.length > 0 && (
              <Link href="/admin/faqs" className="group">
                <div className="rounded-lg border bg-background p-3 transition-colors group-hover:border-primary/40">
                  <p className="text-2xl font-bold tabular-nums text-amber-700">
                    {staleFaqs.length}
                  </p>
                  <p className="text-sm font-medium">FAQs due for review</p>
                  <p className="text-xs text-muted-foreground">
                    Not checked in the last 6 months.
                  </p>
                </div>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Chats per day */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Chats per day</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-44 items-end gap-3">
              {chatsPerDay.map((day) => (
                <div
                  key={day.day}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <span className="text-xs font-medium tabular-nums">
                    {day.count}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-primary/85 transition-colors hover:bg-primary"
                    style={{ height: `${(day.count / maxChats) * 100}%` }}
                  />
                  <span className="text-[11px] text-muted-foreground">
                    {day.day}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Knowledge index status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Knowledge index</CardTitle>
            <CardDescription>
              {kbDocuments.length} documents derived from your content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(Object.keys(kbStatusMeta) as KbStatus[]).map((status) => (
              <div key={status} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <ToneDot
                    tone={kbStatusMeta[status].tone}
                    label={kbStatusMeta[status].label}
                  />
                  <span className="tabular-nums text-muted-foreground">
                    {kbCounts[status]}
                  </span>
                </div>
                <Progress
                  value={(kbCounts[status] / kbDocuments.length) * 100}
                />
              </div>
            ))}
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/admin/knowledge">
                Open the index
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Open bulletins */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileStack className="size-4 text-primary" />
                Open calls
              </CardTitle>
              <CardDescription>
                Bulletins accepting applications, nearest deadline first
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/bulletins">
                Manage
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bulletin</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-right">Time left</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.map((bulletin) => {
                const program = getProgram(bulletin.programId);
                return (
                  <TableRow key={bulletin.id}>
                    <TableCell className="max-w-72">
                      <Link
                        href={`/bulletins/${bulletin.id}`}
                        className="block truncate font-medium hover:text-primary"
                      >
                        {bulletin.title.zh}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {program ? program.name.en ?? program.name.zh : "—"}
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-accent px-2 py-0.5 font-mono text-xs text-accent-foreground">
                        {formatTerm(bulletin.academicYear, bulletin.term)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {bulletin.deadlineAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <DeadlineBadge date={bulletin.deadlineAt} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent conversations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">Recent conversations</CardTitle>
              <CardDescription>Latest anonymous chat sessions</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/conversations">
                View all
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Last question</TableHead>
                <TableHead>Locale</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Flags</TableHead>
                <TableHead className="text-right">Started</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSessions.map((session) => {
                const messages = messagesForSession(session.id);
                const lastUserMessage = [...messages]
                  .reverse()
                  .find((m) => m.role === "user");
                return (
                  <TableRow key={session.id}>
                    <TableCell className="max-w-72">
                      <Link
                        href={`/admin/conversations/${session.id}`}
                        className="block truncate font-medium hover:text-primary"
                      >
                        {lastUserMessage?.content ?? "—"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {session.locale}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <RatingBadge rating={sessionRating(session.id)} />
                    </TableCell>
                    <TableCell>
                      {sessionEscalated(session.id) ? (
                        <Badge
                          variant="outline"
                          className="gap-1 border-amber-200 bg-amber-100 px-1.5 text-[10px] font-medium text-amber-800"
                        >
                          <ShieldCheck className="size-3" />
                          Escalated
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {session.createdAt}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
