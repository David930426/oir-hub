"use client";

import Link from "next/link";
import { Download, Gauge, ThumbsDown, ThumbsUp, TrendingUp } from "lucide-react";
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
import { EnumBadge } from "@/components/shared/enum-badge";
import {
  chatFeedback,
  chatMessages,
  feedbackReasonMeta,
  goodRatingTrend,
  modelComparison,
  susItems,
  surveyResponses,
} from "@/lib/mock";
import { toneClasses } from "@/lib/mock/labels";
import { cn } from "@/lib/utils";

export default function AdminFeedbackPage() {
  const good = chatFeedback.filter((f) => f.rating === 1).length;
  const bad = chatFeedback.filter((f) => f.rating === -1).length;
  const goodRatio = chatFeedback.length
    ? Math.round((good / chatFeedback.length) * 100)
    : 0;

  const avgSus = surveyResponses.length
    ? surveyResponses.reduce((sum, s) => sum + s.susScore, 0) /
      surveyResponses.length
    : 0;
  const avgLift = surveyResponses.length
    ? surveyResponses.reduce(
        (sum, s) => sum + (s.confidenceAfter - s.confidenceBefore),
        0
      ) / surveyResponses.length
    : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Feedback & evaluation"
        description="Thumbs ratings per answer, per-model comparison, and System Usability Scale results — the numbers that go into the evaluation chapter."
      >
        <Button variant="outline">
          <Download className="size-4" />
          Export CSV
        </Button>
      </PageHeader>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <ThumbsUp className="size-4 text-emerald-600" />
              Good ratings
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums">{good}</CardTitle>
            <p className="text-xs text-muted-foreground">
              {goodRatio}% of {chatFeedback.length} rated answers
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <ThumbsDown className="size-4 text-red-600" />
              Bad ratings
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums">{bad}</CardTitle>
            <p className="text-xs text-muted-foreground">
              Most common reason: incomplete
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Average SUS score</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {avgSus.toFixed(1)}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {surveyResponses.length} responses · 68 is the industry average
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <TrendingUp className="size-4" />
              Confidence lift
            </CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              +{avgLift.toFixed(1)}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              mean before → after, on a 1–5 scale
            </p>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Good-rating trend</CardTitle>
            <CardDescription>Weekly good ratio, last 5 weeks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {goodRatingTrend.map((week) => (
              <div key={week.week} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Week of {week.week}
                  </span>
                  <span className="font-medium tabular-nums">{week.good}%</span>
                </div>
                <Progress value={week.good} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Model comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Gauge className="size-4 text-primary" />
              Per-model comparison
            </CardTitle>
            <CardDescription>
              A/B over the last 30 days. Latency splits retrieval from generation.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Model</TableHead>
                  <TableHead className="text-right">Answers</TableHead>
                  <TableHead className="text-right">Good %</TableHead>
                  <TableHead className="pr-6 text-right">Latency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modelComparison.map((model) => (
                  <TableRow key={model.model}>
                    <TableCell className="pl-6 font-mono text-xs">
                      {model.model}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {model.answers}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-medium tabular-nums",
                          model.good >= 88 ? toneClasses.success : toneClasses.warning
                        )}
                      >
                        {model.good}%
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right text-xs tabular-nums text-muted-foreground">
                      {model.avgRetrievalMs}ms + {model.avgGenerationMs}ms
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* SUS items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">SUS survey results</CardTitle>
          <CardDescription>
            System Usability Scale, 1 (strongly disagree) – 5 (strongly agree).
            Items marked ↓ are negative statements where a lower score is better;
            bars are normalised so longer always means better.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {susItems.map((item) => (
            <div key={item.item} className="space-y-1.5">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">
                  <span className="mr-1.5 font-mono text-xs">{item.item}</span>
                  {item.statement}{" "}
                  {item.inverted && <span title="Lower is better">↓</span>}
                </span>
                <span className="shrink-0 font-medium tabular-nums">
                  {item.score.toFixed(1)}
                </span>
              </div>
              <Progress
                value={
                  item.inverted
                    ? ((5 - item.score) / 4) * 100
                    : ((item.score - 1) / 4) * 100
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Raw negative feedback — the actionable part */}
      <Card className="py-0">
        <CardHeader className="pt-6">
          <CardTitle className="text-base">Recent comments</CardTitle>
          <CardDescription>
            Every rating that came with a written comment, newest first.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Rating</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Answer</TableHead>
                <TableHead className="pr-6 text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chatFeedback
                .filter((f) => f.comment)
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .map((feedback) => {
                  const message = chatMessages.find(
                    (m) => m.id === feedback.messageId
                  );
                  return (
                    <TableRow key={feedback.id}>
                      <TableCell className="pl-6">
                        {feedback.rating === 1 ? (
                          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                            <ThumbsUp className="size-3.5" />
                            Good
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-sm font-medium text-red-700">
                            <ThumbsDown className="size-3.5" />
                            Bad
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {feedback.reason ? (
                          <EnumBadge
                            value={feedback.reason}
                            meta={feedbackReasonMeta}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-80 text-sm italic text-muted-foreground">
                        “{feedback.comment}”
                      </TableCell>
                      <TableCell className="max-w-56">
                        {message ? (
                          <Link
                            href={`/admin/conversations/${message.sessionId}`}
                            className="block truncate text-sm hover:text-primary"
                          >
                            {message.content.slice(0, 60)}…
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="pr-6 text-right text-sm text-muted-foreground">
                        {feedback.createdAt}
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
