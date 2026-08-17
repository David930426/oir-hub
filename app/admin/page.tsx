import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CircleHelp,
  FileStack,
  Inbox,
  Quote,
  ShieldQuestion,
} from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { DeadlineBadge } from "@/components/shared/enum-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { REVIEW_INTERVAL_DAYS } from "@/constant";
import { listOpenBulletins } from "@/lib/repositories/bulletin.repository";
import { listContactMessages } from "@/lib/repositories/contact.repository";
import { listFaqs } from "@/lib/repositories/faq.repository";
import { listPosts } from "@/lib/repositories/post.repository";
import { listTestimonials } from "@/lib/repositories/testimonial.repository";
import { formatTerm } from "@/lib/mock/labels";
import { formatDay, isOlderThan, pluralize } from "@/lib/utils";

/**
 * The console's landing screen: what is live, and what is waiting on a person.
 *
 * Everything here is a count the office can act on — a deadline about to pass,
 * a message nobody has answered, an answer nobody has re-read this year. There
 * is deliberately no vanity metric.
 */
export default async function AdminDashboardPage() {
  const [bulletins, messages, faqs, testimonials, posts] = await Promise.all([
    listOpenBulletins(),
    listContactMessages(),
    listFaqs(),
    listTestimonials(),
    listPosts(),
  ]);

  const unresolved = messages.filter((message) => !message.resolved);

  // Work queues — the rows that need a human before the site is correct.
  const awaitingConsent = testimonials.filter(
    (testimonial) => !testimonial.consentGiven && testimonial.status !== "archived",
  );
  const staleFaqs = faqs.filter((faq) =>
    isOlderThan(faq.lastReviewedAt, REVIEW_INTERVAL_DAYS),
  );
  const drafts = posts.filter((post) => post.status === "draft");

  const stats = [
    {
      label: "Open bulletins",
      value: String(bulletins.length),
      sub: bulletins.length
        ? `next closes ${bulletins[0].deadlineAt}`
        : "nothing accepting applications",
      icon: FileStack,
      href: "/admin/bulletins" as const,
    },
    {
      label: "Unresolved contacts",
      value: String(unresolved.length),
      sub: unresolved.length
        ? `oldest from ${formatDay(unresolved[unresolved.length - 1].createdAt)}`
        : "inbox is clear",
      icon: Inbox,
      href: "/admin/contact" as const,
    },
    {
      label: "Published FAQs",
      value: String(faqs.filter((faq) => faq.published).length),
      sub: staleFaqs.length
        ? `${staleFaqs.length} overdue for review`
        : "all reviewed recently",
      icon: CircleHelp,
      href: "/admin/faqs" as const,
    },
    {
      label: "Draft posts",
      value: String(drafts.length),
      sub: drafts.length ? "not visible on the site" : "nothing waiting",
      icon: CalendarClock,
      href: "/admin/posts" as const,
    },
  ];

  const queues = [
    {
      count: awaitingConsent.length,
      label: `${pluralize(awaitingConsent.length, "testimonial")} waiting on consent`,
      href: "/admin/testimonials" as const,
      icon: ShieldQuestion,
    },
    {
      count: staleFaqs.length,
      label: `${pluralize(staleFaqs.length, "answer")} not reviewed in ${REVIEW_INTERVAL_DAYS} days`,
      href: "/admin/faqs" as const,
      icon: CircleHelp,
    },
    {
      count: unresolved.length,
      label: `${pluralize(unresolved.length, "message")} waiting for a reply`,
      href: "/admin/contact" as const,
      icon: Inbox,
    },
  ].filter((queue) => queue.count > 0);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title="Dashboard"
        description="What is live on the site, and everything waiting on a person."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group">
            <Card className="h-full transition-all group-hover:border-primary/40 group-hover:shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardDescription>{stat.label}</CardDescription>
                  <stat.icon className="size-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-3xl tabular-nums">{stat.value}</CardTitle>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {queues.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="size-4 text-amber-700" />
              Waiting on a person
            </CardTitle>
            <CardDescription>
              None of these fix themselves — each one needs a staff member to
              look at it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {queues.map((queue) => (
              <Link
                key={queue.label}
                href={queue.href}
                className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2 transition-colors hover:border-primary/40"
              >
                <span className="flex items-center gap-2 text-sm">
                  <queue.icon className="size-4 text-muted-foreground" />
                  {queue.label}
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Closing soonest</h2>
            <p className="text-sm text-muted-foreground">
              Open calls, by the date students have to submit by.
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/bulletins">
              All bulletins
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <Card className="py-0">
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Bulletin</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Term</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="pr-6">Time left</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bulletins.slice(0, 5).map((bulletin) => (
                  <TableRow key={bulletin.id}>
                    <TableCell className="pl-6">
                      <Link
                        href={`/admin/bulletins/${bulletin.id}/edit`}
                        className="font-medium hover:text-primary"
                      >
                        {bulletin.titleZh}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {bulletin.program?.nameZh ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span className="rounded bg-accent px-2 py-0.5 font-mono text-xs text-accent-foreground">
                        {formatTerm(bulletin.academicYear, bulletin.term)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums text-muted-foreground">
                      {bulletin.deadlineAt}
                    </TableCell>
                    <TableCell className="pr-6">
                      <DeadlineBadge date={bulletin.deadlineAt} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {bulletins.length === 0 && (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No call is open. Create one when the next round is announced.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Quote className="size-4 text-primary" />
              Latest testimonials
            </CardTitle>
            <CardDescription>
              Reports collected after each term, newest first.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {testimonials.slice(0, 4).map((testimonial) => (
              <Link
                key={testimonial.id}
                href={`/admin/testimonials/${testimonial.id}/edit`}
                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors hover:border-primary/40"
              >
                <span className="min-w-0 truncate">
                  {testimonial.displayName}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {testimonial.schoolName ?? testimonial.country}
                  </span>
                </span>
                {!testimonial.consentGiven && (
                  <Badge
                    variant="outline"
                    className="shrink-0 border-amber-200 bg-amber-100 text-[10px] font-medium text-amber-800"
                  >
                    No consent
                  </Badge>
                )}
              </Link>
            ))}
            {testimonials.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No testimonials collected yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Inbox className="size-4 text-primary" />
              Newest messages
            </CardTitle>
            <CardDescription>
              What students and parents have asked the office.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {messages.slice(0, 4).map((message) => (
              <Link
                key={message.id}
                href="/admin/contact"
                className="block rounded-lg border px-3 py-2 transition-colors hover:border-primary/40"
              >
                <p className="flex items-center justify-between gap-2 text-sm font-medium">
                  <span className="truncate">{message.name}</span>
                  <span className="shrink-0 text-xs font-normal text-muted-foreground">
                    {formatDay(message.createdAt)}
                  </span>
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {message.topic} · {message.body}
                </p>
              </Link>
            ))}
            {messages.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Nothing in the inbox.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
