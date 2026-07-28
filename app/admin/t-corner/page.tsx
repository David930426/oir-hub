"use client";

import {
  CalendarCheck,
  Clock,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  UserRound,
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
import { PageHeader } from "@/components/admin/page-header";
import { ActiveBadge } from "@/components/shared/enum-badge";
import { getUser, tcornerSlots, users, weekdayMeta, weekdayOrder } from "@/lib/mock";

export default function AdminTCornerPage() {
  const sorted = [...tcornerSlots].sort((a, b) => {
    const dayDiff =
      weekdayOrder.indexOf(a.weekday) - weekdayOrder.indexOf(b.weekday);
    return dayDiff !== 0 ? dayDiff : a.startTime.localeCompare(b.startTime);
  });

  const activeCount = tcornerSlots.filter((s) => s.active).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="T-Corner slots"
        description={`Weekly walk-in advising hours shown on the public schedule. ${activeCount} of ${tcornerSlots.length} slots are currently visible.`}
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4" />
              New slot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New T-Corner slot</DialogTitle>
              <DialogDescription>
                Topics tell students what this session covers, so they don&apos;t
                turn up on the wrong day.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Weekday</Label>
                  <Select defaultValue="mon">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {weekdayOrder.map((d) => (
                        <SelectItem key={d} value={d}>
                          {weekdayMeta[d].label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slot-start">Start</Label>
                  <Input id="slot-start" type="time" defaultValue="12:10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slot-end">End</Label>
                  <Input id="slot-end" type="time" defaultValue="13:30" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slot-location">Location</Label>
                <Input
                  id="slot-location"
                  placeholder="International Building 3F, T-Corner"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="slot-advisor">Advisor name</Label>
                  <Input id="slot-advisor" placeholder="Chen Yi-Ling" />
                </div>
                <div className="space-y-2">
                  <Label>Host account</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select staff" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter((u) => u.active)
                        .map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slot-topics">Topics (one per line)</Label>
                <Textarea
                  id="slot-topics"
                  rows={4}
                  placeholder={
                    "Exchange application strategy\nWhich partner school fits my GPA"
                  }
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch id="slot-booking" />
                  <Label htmlFor="slot-booking" className="text-sm font-normal">
                    Booking required
                  </Label>
                </div>
                <Input placeholder="https://calendar.thu.edu.tw/oir/t-corner" />
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
                <TableHead className="pl-6">Day</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Advisor</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Topics</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Visible</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((slot) => {
                const host = getUser(slot.hostUserId);
                return (
                  <TableRow key={slot.id}>
                    <TableCell className="pl-6 font-medium">
                      {weekdayMeta[slot.weekday].label}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-sm tabular-nums">
                        <Clock className="size-3.5 text-muted-foreground" />
                        {slot.startTime}–{slot.endTime}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="flex items-center gap-1.5">
                        <UserRound className="size-3.5 text-muted-foreground" />
                        {slot.advisorName}
                      </span>
                      {host && !host.active && (
                        <span className="text-xs text-amber-700">
                          host account inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-48 text-sm text-muted-foreground">
                      <span className="flex items-start gap-1.5">
                        <MapPin className="mt-0.5 size-3.5 shrink-0" />
                        <span className="truncate">{slot.location}</span>
                      </span>
                    </TableCell>
                    <TableCell className="max-w-56">
                      <span className="block truncate text-xs text-muted-foreground">
                        {slot.topics.join(" · ")}
                      </span>
                    </TableCell>
                    <TableCell>
                      {slot.bookingRequired ? (
                        <Badge
                          variant="outline"
                          className="gap-1 border-amber-200 bg-amber-100 font-medium text-amber-800"
                        >
                          <CalendarCheck className="size-3" />
                          Required
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Drop-in
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch defaultChecked={slot.active} />
                        <ActiveBadge active={slot.active} />
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
        </CardContent>
      </Card>
    </div>
  );
}
