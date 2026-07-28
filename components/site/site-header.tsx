"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronDown, Globe, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useLocale } from "@/components/site/locale-provider";
import { locales } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Public navigation. Grouped to follow the ERD domains: everything a student
 * applies to sits under "Apply", everything they read sits under "Resources".
 */
const navGroups: {
  label: string;
  href?: string;
  items?: { href: string; label: string; hint: string }[];
}[] = [
  { label: "Home", href: "/" },
  {
    label: "Apply",
    items: [
      {
        href: "/programs",
        label: "Programs",
        hint: "Exchange, dual degree, internships",
      },
      {
        href: "/bulletins",
        label: "Bulletins",
        hint: "Open calls and their deadlines",
      },
      {
        href: "/schools",
        label: "Partner schools",
        hint: "Quotas, GPA and language thresholds",
      },
      {
        href: "/funding",
        label: "Funding",
        hint: "Grants and scholarships",
      },
    ],
  },
  {
    label: "Resources",
    items: [
      { href: "/faqs", label: "FAQ", hint: "Answers with cited sources" },
      {
        href: "/testimonials",
        label: "Testimonials",
        hint: "Reports from students who went",
      },
      { href: "/news", label: "News & notices", hint: "Published by the OIR" },
      { href: "/t-corner", label: "T-Corner", hint: "Walk-in advising hours" },
    ],
  },
  { label: "AI Assistant", href: "/chat" },
  { label: "Contact", href: "/contact" },
];

/** Flat list of every destination, used by the mobile sheet. */
const flatLinks = navGroups.flatMap((g) =>
  g.href ? [{ href: g.href, label: g.label }] : (g.items ?? [])
);

export function SiteHeader() {
  const pathname = usePathname();
  const { locale, setLocale } = useLocale();
  const activeLocale = locales.find((l) => l.value === locale) ?? locales[0];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          {/* Full OIR Tunghai logo on larger screens, seal + name on small ones */}
          <Image
            src="/logoFull.png"
            alt="Tunghai University — Office of International Relations"
            width={430}
            height={71}
            priority
            className="hidden h-9 w-auto xl:block"
          />
          <span className="flex items-center gap-2.5 xl:hidden">
            <Image
              src="/logo.png"
              alt="Tunghai University seal"
              width={71}
              height={74}
              priority
              className="h-9 w-auto"
            />
            <span className="leading-tight">
              <span className="block text-sm font-bold tracking-tight text-primary">
                OIR Hub
              </span>
              <span className="block text-[11px] text-muted-foreground">
                Study Abroad Information Center
              </span>
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navGroups.map((group) =>
            group.href ? (
              <Link
                key={group.label}
                href={group.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive(group.href)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                {group.label}
              </Link>
            ) : (
              <DropdownMenu key={group.label}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      group.items?.some((i) => isActive(i.href))
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    )}
                  >
                    {group.label}
                    <ChevronDown className="size-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  {group.items?.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href} className="flex flex-col items-start gap-0.5">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.hint}
                        </span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Globe className="size-4" />
                <span className="hidden sm:inline">{activeLocale.short}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {locales.map((l) => (
                <DropdownMenuItem key={l.value} onSelect={() => setLocale(l.value)}>
                  <Check
                    className={cn(
                      "size-4",
                      l.value === locale ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {l.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* There is no public sign-up: accounts exist only for OIR staff. */}
          <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
            <Link href="/login">Staff login</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>OIR Hub</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {flatLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-md px-3 py-2 text-sm font-medium",
                      isActive(link.href)
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/login">Staff login</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
