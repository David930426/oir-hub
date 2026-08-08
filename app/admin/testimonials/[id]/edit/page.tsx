import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { requireWriter } from "@/dal";
import { listReplaceableMediaFiles } from "@/lib/repositories/media.repository";
import { listActivePartnerSchools } from "@/lib/repositories/school.repository";
import { findTestimonialById } from "@/lib/repositories/testimonial.repository";
import { TestimonialForm } from "../../testimonial-form";

export default async function AdminEditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireWriter();

  const { id } = await params;
  const [testimonial, schools, files] = await Promise.all([
    findTestimonialById(id),
    listActivePartnerSchools(),
    listReplaceableMediaFiles(),
  ]);

  if (!testimonial) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
          <Link href="/admin/testimonials">
            <ArrowLeft className="size-4" />
            All testimonials
          </Link>
        </Button>
        <PageHeader
          title={testimonial.displayName}
          description="Edit the student's own words as little as possible — correct typos, not opinions."
        />
      </div>

      <TestimonialForm
        testimonial={{
          id: testimonial.id,
          partnerSchoolId: testimonial.partnerSchoolId,
          displayName: testimonial.displayName,
          deptYear: testimonial.deptYear,
          country: testimonial.country,
          termLabel: testimonial.termLabel,
          highlights: testimonial.highlights,
          bodyZh: testimonial.bodyZh,
          bodyEn: testimonial.bodyEn ?? "",
          fullTextFileId: testimonial.fullTextFileId ?? "",
          consentGiven: testimonial.consentGiven,
          status: testimonial.status,
        }}
        schools={schools.map((school) => ({
          value: school.id,
          label: `${school.nameZh} · ${school.country}`,
        }))}
        files={files.map((file) => ({
          value: file.id,
          label: `${file.filename} (v${file.version})`,
        }))}
      />
    </div>
  );
}
