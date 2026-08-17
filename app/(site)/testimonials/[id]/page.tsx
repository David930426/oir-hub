import { notFound } from "next/navigation";
import {
  findTestimonialById,
  listPublishedTestimonials,
} from "@/lib/repositories/testimonial.repository";
import { formatDay } from "@/lib/utils";
import {
  TestimonialDetailView,
  type SiteRelatedTestimonial,
} from "./testimonial-detail-view";

export default async function TestimonialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = await findTestimonialById(id);

  // Unpublished reports, and reports the student has not consented to, are
  // never served publicly — the guard belongs here as much as in the action.
  if (!story || story.status !== "published" || !story.consentGiven) notFound();

  const related: SiteRelatedTestimonial[] = (await listPublishedTestimonials())
    .filter(
      (entry) =>
        entry.partnerSchoolId === story.partnerSchoolId && entry.id !== story.id,
    )
    .map((entry) => ({
      id: entry.id,
      displayName: entry.displayName,
      termLabel: entry.termLabel,
      highlights: entry.highlights,
    }));

  return (
    <TestimonialDetailView
      story={{
        id: story.id,
        displayName: story.displayName,
        deptYear: story.deptYear,
        country: story.country,
        termLabel: story.termLabel,
        highlights: story.highlights,
        body: { zh: story.bodyZh, en: story.bodyEn },
        createdAt: formatDay(story.createdAt),
      }}
      school={
        story.partnerSchool
          ? {
              id: story.partnerSchool.id,
              name: {
                zh: story.partnerSchool.nameZh,
                en: story.partnerSchool.nameEn,
              },
            }
          : null
      }
      fullText={
        story.fullTextFile
          ? {
              ...story.fullTextFile,
              createdAt: formatDay(story.fullTextFile.createdAt),
            }
          : null
      }
      related={related}
    />
  );
}
