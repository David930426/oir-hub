import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

const applyLinks = [
  { href: "/programs", label: "Programs" },
  { href: "/bulletins", label: "Bulletins" },
  { href: "/schools", label: "Partner schools" },
  { href: "/funding", label: "Funding" },
];

const resourceLinks = [
  { href: "/faqs", label: "FAQ" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/news", label: "News & notices" },
  { href: "/t-corner", label: "T-Corner" },
];

export function SiteFooter({
  /** The signed-in staff member, resolved by the layout. Null for visitors. */
  staff,
}: {
  staff?: { name: string } | null;
}) {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Image
            src="/logoFull.png"
            alt="Tunghai University — Office of International Relations"
            width={430}
            height={71}
            className="h-9 w-auto"
          />
          <p className="text-sm leading-relaxed text-muted-foreground">
            The Office of International Relations information hub — programs,
            bulletins, funding, and student reports, kept in one place so no
            deadline is missed.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Apply</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {applyLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Resources</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {resourceLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Office of International Relations</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              International Building 3F, No. 1727, Sec. 4, Taiwan Blvd., Taichung
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" />
              (04) 2359-0121 ext. 22310
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" />
              oir@thu.edu.tw
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 text-xs text-muted-foreground">
          <p>© 2026 OIR Hub — Office of International Relations. All rights reserved.</p>
          <Link
            href={staff ? "/admin" : "/login"}
            className="hover:text-foreground"
          >
            {staff ? "Dashboard" : "Staff login"}
          </Link>
        </div>
      </div>
    </footer>
  );
}
