import { Download, ThumbsDown, ThumbsUp } from "lucide-react";
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

const weeklyTrend = [
  { week: "Jun 15", good: 78 },
  { week: "Jun 22", good: 81 },
  { week: "Jun 29", good: 79 },
  { week: "Jul 6", good: 85 },
  { week: "Jul 13", good: 87 },
];

const modelComparison = [
  { model: "claude-sonnet-5", answers: 412, good: 91, avgLatency: "2.1s" },
  { model: "gpt-4o-mini", answers: 388, good: 82, avgLatency: "1.6s" },
];

const susResults = [
  { statement: "I think I would like to use this chatbot frequently.", score: 4.2 },
  { statement: "I found the chatbot unnecessarily complex.", score: 1.8, inverted: true },
  { statement: "I thought the chatbot was easy to use.", score: 4.5 },
  { statement: "I would need support to be able to use this chatbot.", score: 1.5, inverted: true },
  { statement: "I found the answers well integrated with the sources.", score: 4.1 },
  { statement: "I thought there was too much inconsistency.", score: 2.0, inverted: true },
];

export default function AdminFeedbackPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Feedback &amp; Evaluation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Rating trends, per-model comparison, and SUS survey results.
          </p>
        </div>
        <Button variant="outline">
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <ThumbsUp className="size-4 text-emerald-600" />
              Good ratings (30 days)
            </CardDescription>
            <CardTitle className="text-3xl">684</CardTitle>
            <p className="text-xs text-muted-foreground">87% of all rated answers</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <ThumbsDown className="size-4 text-red-600" />
              Bad ratings (30 days)
            </CardDescription>
            <CardTitle className="text-3xl">102</CardTitle>
            <p className="text-xs text-muted-foreground">Most common topic: scholarships</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>SUS score</CardDescription>
            <CardTitle className="text-3xl">78.5</CardTitle>
            <p className="text-xs text-muted-foreground">
              41 responses · above the 68 industry average
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
            {weeklyTrend.map((w) => (
              <div key={w.week} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Week of {w.week}</span>
                  <span className="font-medium tabular-nums">{w.good}%</span>
                </div>
                <Progress value={w.good} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Model comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Per-model comparison</CardTitle>
            <CardDescription>A/B comparison over the last 30 days</CardDescription>
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
                {modelComparison.map((m) => (
                  <TableRow key={m.model}>
                    <TableCell className="pl-6 font-mono text-xs">{m.model}</TableCell>
                    <TableCell className="text-right tabular-nums">{m.answers}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={
                          m.good >= 88
                            ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                            : "bg-amber-100 text-amber-800 border-amber-200"
                        }
                      >
                        {m.good}%
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right tabular-nums text-muted-foreground">
                      {m.avgLatency}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* SUS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">SUS survey results</CardTitle>
          <CardDescription>
            System Usability Scale, 1 (strongly disagree) – 5 (strongly agree).
            Items marked ↓ are negative statements where lower is better.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {susResults.map((s) => (
            <div key={s.statement} className="space-y-1.5">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">
                  {s.statement} {s.inverted && <span title="Lower is better">↓</span>}
                </span>
                <span className="shrink-0 font-medium tabular-nums">{s.score.toFixed(1)}</span>
              </div>
              <Progress
                value={
                  s.inverted ? ((5 - s.score) / 4) * 100 : ((s.score - 1) / 4) * 100
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
