"use client";

import Link from "next/link";
import { ExternalLink, GripVertical, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Switch } from "@/components/ui/switch";
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
import { ActiveBadge, EnumBadge } from "@/components/shared/enum-badge";
import {
  bulletinsForProgram,
  fundingsForProgram,
  programTypeMeta,
  programs,
  schoolsForProgram,
} from "@/lib/mock";

export default function AdminProgramsPage() {
  const sorted = [...programs].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Programs"
        description="The top-level offering every bulletin, partner school, and funding row hangs off. Deactivating a program hides it from the site without deleting its history."
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              New program
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>New program</DialogTitle>
              <DialogDescription>
                The overview is what students read first on the program page —
                say what it is and who it suits.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <BilingualField
                id="program-name"
                label="Name"
                value={{ zh: "", en: "" }}
                placeholderZh="例如：交換學生"
              />
              <BilingualField
                id="program-overview"
                label="Overview"
                value={{ zh: "", en: "" }}
                multiline
                rows={5}
                placeholderZh="這是什麼、適合誰申請…"
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="program-slug">Slug</Label>
                  <Input
                    id="program-slug"
                    placeholder="exchange"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select defaultValue="exchange">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        Object.keys(programTypeMeta) as (keyof typeof programTypeMeta)[]
                      ).map((t) => (
                        <SelectItem key={t} value={t}>
                          {programTypeMeta[t].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program-order">Sort order</Label>
                  <Input id="program-order" type="number" defaultValue={6} />
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

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 pl-6" />
                <TableHead>Program</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Schools</TableHead>
                <TableHead className="text-right">Bulletins</TableHead>
                <TableHead className="text-right">Funding</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((program) => {
                const schools = schoolsForProgram(program.id);
                const calls = bulletinsForProgram(program.id);
                const open = calls.filter((c) => c.status === "open").length;
                const funding = fundingsForProgram(program.id);

                return (
                  <TableRow key={program.id}>
                    <TableCell className="pl-6">
                      <GripVertical className="size-4 cursor-grab text-muted-foreground" />
                    </TableCell>
                    <TableCell className="max-w-80">
                      <p className="font-medium">{program.name.zh}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {program.name.en ?? "— no English name —"} · /
                        {program.slug}
                      </p>
                    </TableCell>
                    <TableCell>
                      <EnumBadge value={program.type} meta={programTypeMeta} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {schools.length}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {calls.length}
                      {open > 0 && (
                        <span className="ml-1 text-xs text-emerald-700">
                          ({open} open)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {funding.length}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch defaultChecked={program.active} />
                        <ActiveBadge active={program.active} />
                      </div>
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
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/programs/${program.slug}`}>
                              <ExternalLink className="size-4" />
                              View on site
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={schools.length > 0 || calls.length > 0}
                          >
                            <Trash2 className="size-4" />
                            {schools.length > 0 || calls.length > 0
                              ? "Has linked rows"
                              : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
