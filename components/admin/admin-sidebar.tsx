"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  BookOpenCheck,
  CalendarClock,
  CircleHelp,
  Coins,
  FileStack,
  Images,
  Inbox,
  LayoutDashboard,
  MessagesSquare,
  Newspaper,
  Quote,
  School,
  Star,
  Tags,
  Users,
  Waypoints,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { userRoleMeta } from "@/lib/mock";
import { cn } from "@/lib/utils";

/** Sidebar sections mirror the ERD domains so staff learn the model as they work. */
const navSections: {
  label: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    exact?: boolean;
    adminOnly?: boolean;
  }[];
}[] = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/posts", label: "Posts", icon: Newspaper },
      { href: "/admin/taxonomy", label: "Categories & tags", icon: Tags },
      { href: "/admin/media", label: "Media library", icon: Images },
    ],
  },
  {
    label: "Mobility",
    items: [
      { href: "/admin/programs", label: "Programs", icon: Waypoints },
      { href: "/admin/bulletins", label: "Bulletins", icon: FileStack },
      { href: "/admin/schools", label: "Partner schools", icon: School },
      { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
      { href: "/admin/funding", label: "Funding", icon: Coins },
      { href: "/admin/t-corner", label: "T-Corner slots", icon: CalendarClock },
      { href: "/admin/stats", label: "Site stats", icon: BarChart3 },
    ],
  },
  {
    label: "Knowledge base",
    items: [
      { href: "/admin/faqs", label: "FAQs", icon: CircleHelp },
      { href: "/admin/knowledge", label: "Knowledge index", icon: BookOpenCheck },
    ],
  },
  {
    label: "Chat & evaluation",
    items: [
      { href: "/admin/conversations", label: "Conversations", icon: MessagesSquare },
      { href: "/admin/feedback", label: "Feedback & survey", icon: Star },
      { href: "/admin/contact", label: "Contact inbox", icon: Inbox },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
    ],
  },
];

export function AdminSidebar({
  user,
}: {
  /** The signed-in staff member, resolved by the layout through the DAL. */
  user: { name: string; role: string };
}) {
  const pathname = usePathname();

  const roleLabel =
    userRoleMeta[user.role as keyof typeof userRoleMeta]?.label ?? user.role;
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b px-4">
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

      <ScrollArea className="min-h-0 flex-1">
        <nav className="space-y-5 p-3">
          {navSections.map((section) => {
            // Admin-only destinations are hidden from editors and viewers; the
            // DAL blocks the route itself regardless of what the nav shows.
            const items = section.items.filter(
              (item) => !item.adminOnly || user.role === "admin"
            );
            if (items.length === 0) return null;

            return (
            <div key={section.label} className="space-y-1">
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {section.label}
              </p>
              {items.map((item) => {
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
                    <item.icon className="size-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.adminOnly && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "ml-auto px-1.5 text-[10px]",
                          active &&
                            "border-sidebar-primary-foreground/40 text-sidebar-primary-foreground"
                        )}
                      >
                        ADMIN
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="shrink-0 p-3">
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
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {roleLabel}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
