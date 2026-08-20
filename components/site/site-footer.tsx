import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

/**
 * The top nav carries five links; everything else lives here. Keeping the two
 * lists in one file makes it obvious that nothing has been left unreachable.
 */
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
  { href: "/contact", label: "Contact us" },
];

export function SiteFooter({
  /** The signed-in staff member, resolved by the layout. Null for visitors. */
  staff,
}: {
  staff?: { name: string } | null;
}) {
  return (
    <footer className="bg-brand-dark text-white">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-[clamp(1.375rem,8vw,7.75rem)] py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Image
            src="/logoFull.png"
            alt="Tunghai University — Office of International Relations"
            width={430}
            height={71}
            className="h-9 w-auto brightness-0 invert"
          />
          <p className="on-brand-muted text-xs leading-relaxed">
            The Office of International Relations information hub — programs,
            bulletins, funding, and student reports, kept in one place so no
            deadline is missed.
          </p>
        </div>

        <div>
          <h3 className="eyebrow mb-4 text-brand-tint">Apply</h3>
          <ul className="space-y-2.5 text-sm text-white/70">
            {applyLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-brand-tint">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow mb-4 text-brand-tint">Resources</h3>
          <ul className="space-y-2.5 text-sm text-white/70">
            {resourceLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-brand-tint">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow mb-4 text-brand-tint">Find us</h3>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-white/35" />
              International Building 3F, No. 1727, Sec. 4, Taiwan Blvd.,
              Taichung
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-white/35" />
              (04) 2359-0121 ext. 22310
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="size-4 shrink-0 text-white/35" />
              oir@thu.edu.tw
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 px-[clamp(1.375rem,8vw,7.75rem)] text-[11px] text-white/40">
          <p>
            © 2026 OIR Hub — Office of International Relations, Tunghai
            University.
          </p>
          <Link
            href={staff ? "/admin" : "/login"}
            className="transition-colors hover:text-brand-tint"
          >
            {staff ? "Dashboard" : "Staff login"}
          </Link>
        </div>
      </div>
    </footer>
  );
}
