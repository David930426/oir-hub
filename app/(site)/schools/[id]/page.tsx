import { notFound } from "next/navigation";
import { listBulletinsForProgram } from "@/lib/repositories/bulletin.repository";
import { findPartnerSchoolById } from "@/lib/repositories/school.repository";
import { listPublishedTestimonials } from "@/lib/repositories/testimonial.repository";
import { formatDay } from "@/lib/utils";
import {
  SchoolDetailView,
  type SiteSchoolCall,
  type SiteSchoolStory,
} from "./school-detail-view";

export default async function PartnerSchoolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const school = await findPartnerSchoolById(id);
  if (!school) notFound();

  const [calls, testimonials] = await Promise.all([
    listBulletinsForProgram(school.programId),
    listPublishedTestimonials(),
  ]);

  const openCalls: SiteSchoolCall[] = calls
    .filter((bulletin) => bulletin.status === "open")
    .map((bulletin) => ({
      id: bulletin.id,
      title: { zh: bulletin.titleZh, en: bulletin.titleEn },
      academicYear: bulletin.academicYear,
      term: bulletin.term,
      deadlineAt: bulletin.deadlineAt,
    }));

  const stories: SiteSchoolStory[] = testimonials
    .filter((entry) => entry.partnerSchoolId === school.id)
    .map((entry) => ({
      id: entry.id,
      displayName: entry.displayName,
      deptYear: entry.deptYear,
      termLabel: entry.termLabel,
      highlights: entry.highlights,
    }));

  return (
    <SchoolDetailView
      school={{
        id: school.id,
        name: { zh: school.nameZh, en: school.nameEn },
        country: school.country,
        region: school.region,
        quota: school.quota,
        gpaMin: school.gpaMin,
        languageReq: school.languageReq,
        eligibleColleges: school.eligibleColleges,
        englishTaught: school.englishTaught,
        housingProvided: school.housingProvided,
        websiteUrl: school.websiteUrl,
        active: school.active,
      }}
      program={school.program ? { type: school.program.type } : null}
      brief={
        school.briefFile
          ? { ...school.briefFile, createdAt: formatDay(school.briefFile.createdAt) }
          : null
      }
      stories={stories}
      openCalls={openCalls}
    />
  );
}
