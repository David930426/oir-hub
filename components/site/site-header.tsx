"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { useLocale } from "@/components/site/locale-provider";
import { locales } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Public navigation, following the OIR reference build: five plain links, no
 * dropdowns. The pages that are not here — FAQ, testimonials, news, T-Corner,
 * contact — are reachable from the footer.
 *
 * The reference hides the nav below 760px and toggles a full-width panel from a
 * single icon button; that is what the `open` state below does.
 */
const navLinks = [
  { href: "/schools", label: "Partner schools" },
  { href: "/funding", label: "Funding" },
  { href: "/programs", label: "Programs" },
  { href: "/bulletins", label: "Bulletins" },
  { href: "/news", label: "News" },
];

export function SiteHeader({
  /** The signed-in staff member, resolved by the layout. Null for visitors. */
  staff,
}: {
  staff: { name: string } | null;
}) {
  const pathname = usePathname();
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-white/15 text-white",
        // Navy over navy on the homepage hero, solid everywhere else.
        pathname === "/" ? "bg-brand/85 backdrop-blur" : "bg-brand"
      )}
    >
      <div className="mx-auto flex h-[78px] max-w-[1400px] items-center gap-4 px-[clamp(1.375rem,5vw,4.75rem)]">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src="/logo.png"
            alt="Tunghai University seal"
            width={71}
            height={74}
            priority
            className="h-[42px] w-auto brightness-0 invert"
          />
          <span className="leading-tight">
            <span className="block text-sm font-bold tracking-tight">
              OIR Hub
            </span>
            <span className="mt-0.5 hidden text-[11px] text-white/60 sm:block">
              Study Abroad Information Center
            </span>
          </span>
        </Link>

        {/* Desktop nav — centred, the way the reference sets it. */}
        <nav className="m-auto hidden items-center gap-[clamp(1.25rem,2.8vw,2.8rem)] lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "whitespace-nowrap text-sm transition-colors hover:text-brand-tint",
                isActive(link.href) ? "text-brand-tint" : "text-white/80"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          {/* Both languages sit on the pill at once, so switching is one tap
              rather than open-menu-then-choose. */}
          <div className="flex items-center gap-[7px] rounded-full border border-white/30 bg-white/10 px-2.5 py-[7px] text-[11px]">
            {locales.map((l, i) => (
              <span key={l.value} className="flex items-center gap-[7px]">
                {i > 0 && <i className="h-3 w-px bg-white/30" />}
                <button
                  type="button"
                  onClick={() => setLocale(l.value)}
                  className={cn(
                    "cursor-pointer transition-opacity",
                    l.value === locale
                      ? "font-semibold opacity-100"
                      : "opacity-45 hover:opacity-80"
                  )}
                >
                  {l.short}
                </button>
              </span>
            ))}
          </div>

          {/* There is no public sign-up: accounts exist only for OIR staff, so
              this is either a way in or a shortcut back to the console. */}
          {staff ? (
            <Link
              href="/admin"
              title={`Signed in as ${staff.name}`}
              className="hidden items-center gap-2 rounded-md bg-white px-4 py-2.5 text-xs font-semibold text-brand transition-colors hover:bg-white/90 lg:inline-flex"
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-md border border-white/30 px-4 py-2.5 text-xs font-semibold transition-colors hover:border-brand-tint hover:text-brand-tint lg:inline-block"
            >
              Staff login
            </Link>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-mobile-nav"
            className="-mr-2 p-2 lg:hidden"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      {/* Mobile panel — full width, stacked, dropping straight out of the bar. */}
      {open && (
        <nav
          id="site-mobile-nav"
          className="flex flex-col items-center gap-1 border-t border-white/10 bg-brand-dark px-6 py-6 lg:hidden"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              // Navigating does not unmount the header, so the panel has to be
              // dismissed here or it stays over the page we just moved to.
              onClick={() => setOpen(false)}
              className={cn(
                "w-full rounded-md px-3 py-3 text-center text-sm transition-colors",
                isActive(link.href)
                  ? "text-brand-tint"
                  : "text-white/80 hover:text-brand-tint"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={staff ? "/admin" : "/login"}
            onClick={() => setOpen(false)}
            className="mt-3 w-full rounded-md bg-white px-4 py-3 text-center text-xs font-semibold text-brand"
          >
            {staff ? "Dashboard" : "Staff login"}
          </Link>
        </nav>
      )}
    </header>
  );
}
