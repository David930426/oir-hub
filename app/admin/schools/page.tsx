"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BedDouble,
  ExternalLink,
  Languages,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import { BilingualField } from "@/components/admin/bilingual-field";
import { PageHeader } from "@/components/admin/page-header";
import { ActiveBadge } from "@/components/shared/enum-badge";
import {
  partnerSchools,
  programs,
  schoolRegions,
  testimonialsForSchool,
} from "@/lib/mock";

export default function AdminSchoolsPage() {
  const [query, setQuery] = useState("");
  const [programId, setProgramId] = useState("all");
  const [region, setRegion] = useState("all");

  const regions = useMemo(() => schoolRegions(), []);

  const filtered = useMemo(
    () =>
      partnerSchools.filter((s) => {
        if (programId !== "all" && s.programId !== programId) return false;
        if (region !== "all" && s.region !== region) return false;
        if (
          query &&
          !`${s.name.zh} ${s.name.en ?? ""} ${s.country}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
          return false;
        return true;
      }),
    [query, programId, region]
  );

  const totalQuota = filtered
    .filter((s) => s.active)
    .reduce((sum, s) => sum + s.quota, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Partner schools"
        description={`${partnerSchools.length} agreements on file · ${totalQuota} places per term in the current filter. Quota, GPA, and language thresholds are what students filter by on the site.`}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              New partner school
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>New partner school</DialogTitle>
              <DialogDescription>
                Add the agreement after the MOU is signed. Requirements come
                straight from the partner&apos;s own factsheet.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <BilingualField
                id="school-name"
                label="School name"
                value={{ zh: "", en: "" }}
                placeholderZh="例如：京都大學"
                placeholderEn="Kyoto University"
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Program</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name.en ?? p.name.zh}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-country">Country</Label>
                  <Input id="school-country" placeholder="Japan" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-region">Region</Label>
                  <Input id="school-region" placeholder="asia" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="school-quota">Quota per term</Label>
                  <Input id="school-quota" type="number" placeholder="2" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-gpa">Minimum GPA</Label>
                  <Input
                    id="school-gpa"
                    type="number"
                    step="0.1"
                    placeholder="3.3"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="school-language">
                  Language requirements (one per line)
                </Label>
                <Textarea
                  id="school-language"
                  rows={3}
                  placeholder={"JLPT N2\nTOEFL iBT 80"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school-colleges">
                  Eligible colleges (one per line)
                </Label>
                <Textarea
                  id="school-colleges"
                  rows={3}
                  placeholder={"Engineering\nScience\nLetters"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="school-url">Website</Label>
                <Input id="school-url" placeholder="https://…" />
              </div>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <Switch id="school-english" />
                  <Label htmlFor="school-english" className="text-sm font-normal">
                    English-taught courses available
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="school-housing" />
                  <Label htmlFor="school-housing" className="text-sm font-normal">
                    Housing provided
                  </Label>
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search school or country…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 sm:w-56"
          />
        </div>
        <Select value={programId} onValueChange={setProgramId}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Program" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All programs</SelectItem>
            {programs.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name.en ?? p.name.zh}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All regions</SelectItem>
            {regions.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
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
                <TableHead className="pl-6">School</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Quota</TableHead>
                <TableHead className="text-right">Min GPA</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Perks</TableHead>
                <TableHead className="text-right">Reports</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((school) => {
                const stories = testimonialsForSchool(school.id);
                return (
                  <TableRow key={school.id}>
                    <TableCell className="max-w-64 pl-6">
                      <p className="truncate font-medium">{school.name.zh}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {school.name.en ?? "— no English name —"}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {school.country}
                      <span className="block text-xs">{school.region}</span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {school.quota}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {school.gpaMin.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {school.languageReq
                        .map((r) => `${r.test} ${r.score}`)
                        .join(" / ")}
                    </TableCell>
                    <TableCell>
                      <span className="flex gap-1.5">
                        {school.englishTaught && (
                          <Badge
                            variant="secondary"
                            className="gap-1 px-1.5 text-[10px] font-normal"
                          >
                            <Languages className="size-3" />
                            EN
                          </Badge>
                        )}
                        {school.housingProvided && (
                          <Badge
                            variant="secondary"
                            className="gap-1 px-1.5 text-[10px] font-normal"
                          >
                            <BedDouble className="size-3" />
                            Dorm
                          </Badge>
                        )}
                        {!school.englishTaught && !school.housingProvided && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {stories.length || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch defaultChecked={school.active} />
                        <ActiveBadge active={school.active} />
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
                            <Link href={`/schools/${school.id}`}>
                              <ExternalLink className="size-4" />
                              View on site
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={stories.length > 0}
                          >
                            <Trash2 className="size-4" />
                            {stories.length > 0 ? "Has testimonials" : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No schools match your filters.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
