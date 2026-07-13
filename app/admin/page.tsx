import Link from "next/link";
import {
  ArrowRight,
  FileStack,
  Inbox,
  MessagesSquare,
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
import { adminDocuments, chatsPerDay, conversations } from "@/lib/mock-data";
import { RatingBadge } from "@/components/admin/badges";

const stats = [
  {
    label: "Chats today",
    value: "44",
    sub: "+16% vs last Monday",
    icon: MessagesSquare,
  },
  {
    label: "Good rating ratio",
    value: "87%",
    sub: "last 7 days · 203 rated answers",
    icon: ThumbsUp,
  },
  {
    label: "KB documents ready",
    value: "5 / 8",
    sub: "1 processing · 1 failed · 1 pending",
    icon: FileStack,
  },
  {
    label: "Unresolved contacts",
    value: "6",
    sub: "oldest waiting 2 days",
    icon: Inbox,
  },
];

export default function AdminDashboardPage() {
  const maxChats = Math.max(...chatsPerDay.map((d) => d.count));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of chatbot activity, knowledge base health, and pending work.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardDescription>{s.label}</CardDescription>
                <s.icon className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-3xl">{s.value}</CardTitle>
              <p className="text-xs text-muted-foreground">{s.sub}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Chats per day */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Chats per day</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-44 items-end gap-3">
              {chatsPerDay.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-medium">{d.count}</span>
                  <div
                    className="w-full rounded-t-md bg-primary/85 transition-colors hover:bg-primary"
                    style={{ height: `${(d.count / maxChats) * 100}%` }}
                  />
                  <span className="text-[11px] text-muted-foreground">{d.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Document status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Document status</CardTitle>
            <CardDescription>{adminDocuments.length} documents in the knowledge base</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(
              [
                ["READY", 5, "bg-emerald-500"],
                ["PROCESSING", 1, "bg-blue-500"],
                ["PENDING", 1, "bg-amber-500"],
                ["FAILED", 1, "bg-red-500"],
              ] as const
            ).map(([status, count, color]) => (
              <div key={status} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className={`size-2 rounded-full ${color}`} />
                    {status}
                  </span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
                <Progress value={(count / adminDocuments.length) * 100} />
              </div>
            ))}
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/admin/documents">
                Manage documents
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent conversations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">Recent conversations</CardTitle>
              <CardDescription>Latest chatbot sessions</CardDescription>
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
                <TableHead>Last message</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Lang</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Started</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversations.slice(0, 5).map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="max-w-72">
                    <Link
                      href={`/admin/conversations/${c.id}`}
                      className="block truncate font-medium hover:text-primary"
                    >
                      {c.lastMessage}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{c.language}</Badge>
                  </TableCell>
                  <TableCell>
                    <RatingBadge rating={c.rating} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {c.startedAt}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
