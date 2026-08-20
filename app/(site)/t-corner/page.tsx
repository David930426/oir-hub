import { PageBanner } from "@/components/site/page-banner";
import Link from "next/link";
import {
  CalendarCheck,
  Clock,
  ExternalLink,
  Info,
  MapPin,
  UserRound,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { weekdayMeta, weekdayOrder } from "@/lib/mock/labels";
import { listActiveTcornerSlots } from "@/lib/repositories/tcorner.repository";

export default async function TCornerPage() {
  // Only slots the office has left visible; hidden ones are for weeks it is away.
  const slots = await listActiveTcornerSlots();

  return (
    <>
      <PageBanner eyebrow="Walk-in advising" title="T-Corner">
        Walk-in advising with the OIR staff who actually run each program. Bring
        your transcript and a shortlist of schools — most questions are settled
        in fifteen minutes.
      </PageBanner>

      <div className="mx-auto max-w-5xl px-4 py-10">
        <Alert className="mb-8">
          <Info className="size-4" />
          <AlertDescription>
            Sessions marked <strong>booking required</strong> need a slot reserved
            in advance. The rest are drop-in: just turn up during the listed hours.
          </AlertDescription>
        </Alert>

        {/* Weekly schedule, laid out Monday to Friday */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {weekdayOrder.map((day) => {
            const daySlots = slots.filter((s) => s.weekday === day);
            return (
              <div key={day} className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {weekdayMeta[day].label}
                </h2>

                {daySlots.length === 0 ? (
                  <div className="rounded-lg border border-dashed py-8 text-center text-xs text-muted-foreground">
                    No session
                  </div>
                ) : (
                  daySlots.map((slot) => (
                    <Card key={slot.id} className="h-fit">
                      <CardHeader>
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <CardTitle className="flex items-center gap-1.5 text-base tabular-nums">
                            <Clock className="size-4 text-primary" />
                            {slot.startTime}–{slot.endTime}
                          </CardTitle>
                          {slot.bookingRequired && (
                            <Badge
                              variant="outline"
                              className="border-amber-200 bg-amber-100 text-[10px] font-medium text-amber-800"
                            >
                              Booking
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="space-y-1">
                          <span className="flex items-center gap-1.5">
                            <UserRound className="size-3.5" />
                            {slot.advisorName}
                          </span>
                          <span className="flex items-start gap-1.5">
                            <MapPin className="mt-0.5 size-3.5 shrink-0" />
                            {slot.location}
                          </span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            What you can ask
                          </p>
                          <ul className="space-y-1">
                            {slot.topics.map((topic) => (
                              <li
                                key={topic}
                                className="border-l-2 border-primary/25 pl-2.5 text-sm leading-snug"
                              >
                                {topic}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {slot.bookingRequired && slot.bookingUrl && (
                          <Button asChild size="sm" variant="outline" className="w-full">
                            <a
                              href={slot.bookingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <CalendarCheck className="size-4" />
                              Book a slot
                              <ExternalLink className="size-3.5" />
                            </a>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            );
          })}
        </div>

        <Card className="mt-10 border-primary/20 bg-primary/[0.03]">
          <CardHeader>
            <CardTitle className="text-base">Can&apos;t make any of these?</CardTitle>
            <CardDescription>
              The contact form reaches the same staff by email, and the FAQ covers
              most of what these sessions are asked.
            </CardDescription>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href="/contact">Send a message</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/faqs">Read the FAQ</Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    </>
  );
}
