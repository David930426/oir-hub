"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Pencil, Plus, Trash2, TrendingUp } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { BilingualField } from "@/components/admin/bilingual-field";
import { PageHeader } from "@/components/admin/page-header";
import { formatTwd, getUser, siteStats } from "@/lib/mock";

export default function AdminStatsPage() {
  const years = useMemo(
    () => Array.from(new Set(siteStats.map((s) => s.academicYear))).sort().reverse(),
    []
  );
  const [year, setYear] = useState(years[0]);

  const rows = siteStats.filter((s) => s.academicYear === year);
  const currentYearStats = siteStats.filter((s) => s.academicYear === years[0]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Site stats"
        description="The numbers shown on the public homepage. They are entered by hand each year rather than computed, so update them when the annual report is finalised."
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              New metric
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New metric</DialogTitle>
              <DialogDescription>
                The metric key is used in code; the label is what visitors read.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <BilingualField
                id="stat-label"
                label="Label"
                value={{ zh: "", en: "" }}
                placeholderZh="例如：本學年出國交換人數"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stat-key">Metric key</Label>
                  <Input
                    id="stat-key"
                    placeholder="outbound_count"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stat-year">Academic year</Label>
                  <Input id="stat-year" placeholder="115" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stat-value">Value</Label>
                  <Input id="stat-value" type="number" placeholder="148" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stat-unit">Unit</Label>
                  <Input id="stat-unit" placeholder="人 / students" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Preview of what the homepage strip will render */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="size-4 text-primary" />
            Homepage preview
          </CardTitle>
          <CardDescription>
            How academic year {years[0]} appears above the fold.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 rounded-lg border bg-muted/40 p-6 sm:grid-cols-2 lg:grid-cols-4">
            {currentYearStats.map((stat) => (
              <div key={stat.id}>
                <p className="text-3xl font-bold tracking-tight tabular-nums text-primary">
                  {stat.metricKey === "funding_total"
                    ? formatTwd(stat.value)
                    : stat.value.toLocaleString("en-US")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label.en ?? stat.label.zh}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end">
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                Academic year {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Label</TableHead>
                <TableHead>Metric key</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Updated by</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((stat) => {
                const editor = getUser(stat.updatedById);
                return (
                  <TableRow key={stat.id}>
                    <TableCell className="pl-6">
                      <p className="font-medium">{stat.label.zh}</p>
                      <p className="text-xs text-muted-foreground">
                        {stat.label.en ?? "— no English label —"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {stat.metricKey}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {stat.value.toLocaleString("en-US")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {stat.unit.zh}
                      {stat.unit.en && ` / ${stat.unit.en}`}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {editor?.name.split(" ")[0] ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {stat.updatedAt}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Pencil className="size-4" />
                            Edit value
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive">
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {rows.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No metrics recorded for this year.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
