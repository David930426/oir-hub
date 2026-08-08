import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { hasRole, writerRoles } from "@/dal";
import { listTestimonials } from "@/lib/repositories/testimonial.repository";
import { formatDay } from "@/lib/utils";
import type { TestimonialRow } from "./testimonial-columns";
import { TestimonialsTable } from "./testimonials-table";

export default async function AdminTestimonialsPage() {
  const [canWrite, records] = await Promise.all([
    hasRole(writerRoles),
    listTestimonials(),
  ]);

  const testimonials: TestimonialRow[] = records.map((record) => ({
    id: record.id,
    displayName: record.displayName,
    deptYear: record.deptYear,
    country: record.country,
    termLabel: record.termLabel,
    schoolName: record.schoolName,
    consentGiven: record.consentGiven,
    status: record.status,
    createdAt: formatDay(record.createdAt),
  }));

  const awaitingConsent = testimonials.filter(
    (testimonial) => !testimonial.consentGiven,
  ).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Testimonials"
        description={`Student reports collected after each term. A report cannot be published until the student has given consent${
          awaitingConsent > 0 ? ` — ${awaitingConsent} still waiting` : ""
        }.`}
      >
        {canWrite && (
          <Button asChild>
            <Link href="/admin/testimonials/create">
              <Plus className="size-4" />
              New report
            </Link>
          </Button>
        )}
      </PageHeader>

      <TestimonialsTable testimonials={testimonials} canWrite={canWrite} />
    </div>
  );
}
