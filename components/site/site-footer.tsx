import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
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
            The Office of International Relations information hub — helping
            Taiwan students study abroad with accurate information and timely
            announcements.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Explore</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/knowledge" className="hover:text-foreground">Knowledge Base</Link></li>
            <li><Link href="/announcements" className="hover:text-foreground">Announcements</Link></li>
            <li><Link href="/chat" className="hover:text-foreground">AI Assistant</Link></li>
            <li><Link href="/contact" className="hover:text-foreground">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold">Popular Topics</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/knowledge" className="hover:text-foreground">Visa &amp; Immigration</Link></li>
            <li><Link href="/knowledge" className="hover:text-foreground">Scholarships</Link></li>
            <li><Link href="/knowledge" className="hover:text-foreground">Exchange Programs</Link></li>
            <li><Link href="/knowledge" className="hover:text-foreground">Housing &amp; Dormitory</Link></li>
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
        <p className="mx-auto max-w-6xl px-4 text-xs text-muted-foreground">
          © 2026 OIR Hub — Office of International Relations. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
