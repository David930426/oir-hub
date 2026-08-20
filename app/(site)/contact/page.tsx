import { PageBanner } from "@/components/site/page-banner";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone, UserRound } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ContactForm } from "./contact-form";

const officeContacts = [
  {
    name: "Chen Yi-Ling 陳怡玲",
    duty: "Exchange & dual degree · Americas and Europe partners",
    email: "ylchen@thu.edu.tw",
    ext: "ext. 22311",
  },
  {
    name: "Huang Wei-Ting 黃偉庭",
    duty: "Funding & internships · Japan and Korea partners",
    email: "wthuang@thu.edu.tw",
    ext: "ext. 22312",
  },
  {
    name: "Lin Hsiao-Mei 林曉玫",
    duty: "Credit transfer, housing, insurance & pre-departure",
    email: "hmlin@thu.edu.tw",
    ext: "ext. 22313",
  },
];

export default function ContactPage() {
  return (
    <>
      <PageBanner eyebrow="Ask the office" title="Contact the OIR">
        Not covered by the{" "}
        <Link href="/faqs" className="text-brand-tint underline-offset-2 hover:underline">
          FAQ
        </Link>
        ? Send your question here and the staff member in charge of that topic
        will reply within 3 working days.
      </PageBanner>

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-5">
          <ContactForm />

          {/* Office info */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Visit or call us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="flex items-start gap-2.5 text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  International Building 3F, No. 1727, Sec. 4, Taiwan Blvd.,
                  Xitun District, Taichung 407224
                </p>
                <p className="flex items-center gap-2.5 text-muted-foreground">
                  <Phone className="size-4 shrink-0 text-primary" />
                  (04) 2359-0121 ext. 22310
                </p>
                <p className="flex items-center gap-2.5 text-muted-foreground">
                  <Mail className="size-4 shrink-0 text-primary" />
                  oir@thu.edu.tw
                </p>
                <Separator />
                <div className="flex items-start gap-2.5 text-muted-foreground">
                  <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Office hours</p>
                    <p>Mon–Fri 09:00–16:00</p>
                    <p>Closed 12:00–13:00 (lunch)</p>
                    <p className="mt-1 text-xs">
                      Summer schedule applies July–August.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Who to contact</CardTitle>
                <CardDescription>
                  Staff in charge by topic — email them directly for urgent matters.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {officeContacts.map((c) => (
                  <div key={c.name} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <UserRound className="size-4" />
                    </span>
                    <div className="text-sm">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-muted-foreground">{c.duty}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.email} · {c.ext}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
