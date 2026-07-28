"use client";

import { useMemo, useState } from "react";
import {
  KeyRound,
  MoreHorizontal,
  Search,
  ShieldAlert,
  UserPlus,
  UserX,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/page-header";
import { ActiveBadge, EnumBadge } from "@/components/shared/enum-badge";
import { userRoleMeta, users } from "@/lib/mock";

/** What each role may do — shown so admins pick deliberately. */
const rolePermissions: Record<string, string> = {
  admin: "Full access, including user management and deletion.",
  editor: "Create and publish content; cannot manage users.",
  viewer: "Read-only access to the console and its reports.",
};

const roleTabs = ["all", "admin", "editor", "viewer"] as const;

export default function AdminUsersPage() {
  const [role, setRole] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      users.filter((u) => {
        if (role !== "all" && u.role !== role) return false;
        if (
          query &&
          !`${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase())
        )
          return false;
        return true;
      }),
    [role, query]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Users"
        description="Accounts exist for OIR staff only. Students use the site and the assistant anonymously — there is no public sign-up."
      >
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="size-4" />
              Create staff account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create staff account</DialogTitle>
              <DialogDescription>
                An invitation email is sent to the address below. The account
                stays inactive until the invite is accepted.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff-name">Full name</Label>
                <Input id="staff-name" placeholder="e.g. Wang Chih-Hao 王志豪" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staff-email">School email</Label>
                <Input
                  id="staff-email"
                  type="email"
                  placeholder="name@thu.edu.tw"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select defaultValue="editor">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(userRoleMeta) as (keyof typeof userRoleMeta)[]).map(
                        (r) => (
                          <SelectItem key={r} value={r}>
                            {userRoleMeta[r].label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Console language</Label>
                  <Select defaultValue="zh-TW">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh-TW">繁體中文</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  What each role can do
                </p>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {(Object.keys(userRoleMeta) as (keyof typeof userRoleMeta)[]).map(
                    (r) => (
                      <li key={r}>
                        <span className="font-medium text-foreground">
                          {userRoleMeta[r].label}
                        </span>{" "}
                        — {rolePermissions[r]}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline">Cancel</Button>
              <Button>Create &amp; send invite</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Alert>
        <ShieldAlert className="size-4" />
        <AlertDescription>
          This page is visible to the admin role only. Editors and viewers cannot
          manage accounts.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={role} onValueChange={setRole}>
          <TabsList>
            {roleTabs.map((r) => (
              <TabsTrigger key={r} value={r}>
                {r === "all" ? "All" : userRoleMeta[r].label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 sm:w-64"
          />
        </div>
      </div>

      <Card className="py-0">
        <CardContent className="px-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Locale</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <EnumBadge value={user.role} meta={userRoleMeta} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {user.locale}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ActiveBadge active={user.active} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.createdAt}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.lastLoginAt}
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
                          <KeyRound className="size-4" />
                          Reset password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                          <UserX className="size-4" />
                          {user.active ? "Deactivate" : "Reactivate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No users match your search.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
