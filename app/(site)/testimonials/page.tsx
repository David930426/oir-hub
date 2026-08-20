import { PageBanner } from "@/components/site/page-banner";
import { listPublishedTestimonials } from "@/lib/repositories/testimonial.repository";
import { TestimonialsView, type SiteTestimonial } from "./testimonials-view";

export default async function TestimonialsPage() {
  const records = await listPublishedTestimonials();

  const all: SiteTestimonial[] = records.map((record) => ({
    id: record.id,
    displayName: record.displayName,
    deptYear: record.deptYear,
    country: record.country,
    termLabel: record.termLabel,
    highlights: record.highlights,
    schoolName: record.partnerSchool
      ? { zh: record.partnerSchool.nameZh, en: record.partnerSchool.nameEn }
      : null,
  }));

  return (
    <>
      <PageBanner eyebrow="From students who went" title="Student testimonials">
        Reports written by students after they returned, published only with
        their consent. Names may be shortened at the author&apos;s request.
      </PageBanner>
      <TestimonialsView all={all} />
    </>
  );
}
