import { notFound } from "next/navigation";
import { findBulletinById } from "@/lib/repositories/bulletin.repository";
import { listActivePartnerSchools } from "@/lib/repositories/school.repository";
import { daysUntil, formatDay } from "@/lib/utils";
import {
  BulletinDetailView,
  type SiteBulletinDetail,
  type SiteBulletinSchool,
} from "./bulletin-detail-view";

export default async function BulletinDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bulletin = await findBulletinById(id);
  if (!bulletin) notFound();

  // The schools a student could actually be nominated to under this call.
  const schools = (await listActivePartnerSchools()).filter(
    (school) => school.programId === bulletin.programId,
  );

  const detail: SiteBulletinDetail = {
    id: bulletin.id,
    academicYear: bulletin.academicYear,
    term: bulletin.term,
    title: { zh: bulletin.titleZh, en: bulletin.titleEn },
    region: bulletin.region,
    announcedAt: bulletin.announcedAt,
    deadlineAt: bulletin.deadlineAt,
    status: bulletin.status,
    program: bulletin.program
      ? {
          slug: bulletin.program.slug,
          name: { zh: bulletin.program.nameZh, en: bulletin.program.nameEn },
          type: bulletin.program.type,
        }
      : null,
    pdf: bulletin.pdfFile
      ? {
          ...bulletin.pdfFile,
          // The download list works in strings; the column is a timestamp.
          createdAt: formatDay(bulletin.pdfFile.createdAt),
        }
      : null,
  };

  const siteSchools: SiteBulletinSchool[] = schools.map((school) => ({
    id: school.id,
    name: { zh: school.nameZh, en: school.nameEn },
    country: school.country,
    quota: school.quota,
    gpaMin: school.gpaMin,
    englishTaught: school.englishTaught,
    housingProvided: school.housingProvided,
  }));

  return (
    <BulletinDetailView
      bulletin={detail}
      schools={siteSchools}
      // Worked out here so the "closing soon" banner is decided in the office's
      // timezone rather than the reader's.
      daysLeft={daysUntil(bulletin.deadlineAt)}
    />
  );
}
