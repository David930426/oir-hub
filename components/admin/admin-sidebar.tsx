"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  FileStack,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  Star,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/documents", label: "Documents", icon: FileStack },
  { href: "/admin/conversations", label: "Conversations", icon: MessagesSquare },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/feedback", label: "Feedback", icon: Star },
  { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b px-4">
        <Image
          src="/logo.png"
          alt="Tunghai University seal"
          width={71}
          height={74}
          className="h-9 w-auto"
        />
        <div className="leading-tight">
          <p className="text-sm font-bold text-primary">OIR Hub</p>
          <p className="text-[11px] text-muted-foreground">Admin Console</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
              {item.adminOnly && (
                <Badge
                  variant="outline"
                  className={cn(
                    "ml-auto px-1.5 text-[10px]",
                    active && "border-sidebar-primary-foreground/40 text-sidebar-primary-foreground"
                  )}
                >
                  ADMIN
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <Separator className="mb-3" />
        <Link
          href="/"
          className="mb-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to site
        </Link>
        <div className="flex items-center gap-2.5 rounded-md border bg-background px-3 py-2.5">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              CY
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium">Chen Yi-Ling</p>
            <p className="truncate text-[11px] text-muted-foreground">ADMIN</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
